const MCP_CONFIG = require('./mcp-config');

class PrivacyFilter {
  constructor() {
    this.config = MCP_CONFIG;
  }

  // Main filtering function - determines if agent can use MCP and filters data
  filterForMCP(agentName, userData, context = {}) {
    const agentConfig = this.config.privacy[agentName];
    
    if (!agentConfig || !agentConfig.allowMCPAccess) {
      return {
        allowed: false,
        reason: `Agent ${agentName} is not allowed to access MCP server`,
        filteredData: null
      };
    }

    // Special handling for Terri - no MCP access for private conversations
    if (agentName === 'terri' && this.isPrivateConversation(context)) {
      return {
        allowed: false,
        reason: 'Terri private conversations cannot be sent to MCP server',
        filteredData: null
      };
    }

    // Filter data based on agent's filtering level
    const filteredData = this.applyDataFiltering(userData, agentConfig.dataFiltering, agentName);
    
    return {
      allowed: true,
      filteredData: filteredData,
      agentConfig: agentConfig
    };
  }

  // Check if this is a private conversation (for Terri)
  isPrivateConversation(context) {
    return context.conversationType === 'private' || 
           context.tableName === 'terri_private' ||
           context.source === 'terri_chat';
  }

  // Apply data filtering based on agent's configuration
  applyDataFiltering(data, filteringLevel, agentName) {
    let filteredData = { ...data };

    // Always apply strict exclusions
    filteredData = this.removeStrictExclusions(filteredData);

    switch (filteringLevel) {
      case 'strict':
        filteredData = this.applyStrictFiltering(filteredData);
        break;
      case 'moderate':
        filteredData = this.applyModerateFiltering(filteredData);
        break;
      case 'audit':
        filteredData = this.applyAuditFiltering(filteredData, agentName);
        break;
      default:
        filteredData = this.applyModerateFiltering(filteredData);
    }

    return filteredData;
  }

  // Remove fields that should never be sent to MCP server
  removeStrictExclusions(data) {
    const filtered = { ...data };
    
    this.config.dataFiltering.strictExclusions.forEach(field => {
      if (filtered[field]) {
        delete filtered[field];
      }
    });

    return filtered;
  }

  // Strict filtering - minimal data sharing
  applyStrictFiltering(data) {
    const allowedFields = ['type', 'priority', 'status', 'tags', 'created_at'];
    const filtered = {};
    
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        filtered[field] = data[field];
      }
    });

    // Sanitize content to remove any potential PII
    if (data.content) {
      filtered.content = this.sanitizeContent(data.content);
    }

    return filtered;
  }

  // Moderate filtering - balanced privacy and functionality
  applyModerateFiltering(data) {
    const filtered = { ...data };
    
    // Hash or pseudonymize PII fields
    this.config.dataFiltering.piiFields.forEach(field => {
      if (filtered[field]) {
        filtered[field] = this.pseudonymize(filtered[field]);
      }
    });

    // Remove sensitive content patterns
    if (filtered.content) {
      filtered.content = this.sanitizeContent(filtered.content);
    }

    return filtered;
  }

  // Audit filtering - preserve data for compliance but mark sensitive areas
  applyAuditFiltering(data, agentName) {
    const filtered = { ...data };
    
    // Add audit metadata
    filtered._auditInfo = {
      filteredBy: 'privacy-filter',
      agent: agentName,
      timestamp: new Date().toISOString(),
      filteringLevel: 'audit'
    };

    // Mark but don't remove PII (Ethel needs to see it for compliance)
    this.config.dataFiltering.piiFields.forEach(field => {
      if (filtered[field]) {
        filtered[`${field}_isPII`] = true;
      }
    });

    return filtered;
  }

  // Sanitize content to remove or mask sensitive information
  sanitizeContent(content) {
    if (!content || typeof content !== 'string') {
      return content;
    }

    let sanitized = content;

    // Remove common PII patterns
    sanitized = sanitized.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN_REDACTED]'); // SSN
    sanitized = sanitized.replace(/\b\d{3}-\d{3}-\d{4}\b/g, '[PHONE_REDACTED]'); // Phone
    sanitized = sanitized.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL_REDACTED]'); // Email
    
    // Remove credit card patterns
    sanitized = sanitized.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD_REDACTED]');
    
    // Remove specific private keywords/phrases
    const privateKeywords = ['password', 'secret', 'private key', 'confidential'];
    privateKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b[^\\n]*`, 'gi');
      sanitized = sanitized.replace(regex, `[${keyword.toUpperCase()}_REDACTED]`);
    });

    return sanitized;
  }

  // Create pseudonym for PII data
  pseudonymize(value) {
    if (!value) return value;
    
    // Simple pseudonymization - in production, use proper crypto
    const hash = require('crypto').createHash('sha256').update(value.toString()).digest('hex');
    return `PSEUDO_${hash.substring(0, 8)}`;
  }

  // Log MCP access for audit trail
  logMCPAccess(agentName, toolName, dataSize, success = true, error = null) {
    if (!this.config.dataFiltering.auditRequirements.logMCPCalls) {
      return;
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      agent: agentName,
      tool: toolName,
      dataSize: dataSize,
      success: success,
      error: error ? error.message : null
    };

    // In production, this would go to a proper audit logging system
    console.log('MCP_AUDIT:', JSON.stringify(logEntry));
  }

  // Validate that filtered data meets privacy requirements
  validateFilteredData(filteredData, agentName) {
    const agentConfig = this.config.privacy[agentName];
    
    // Check for any remaining PII in strict mode
    if (agentConfig.dataFiltering === 'strict') {
      const piiFound = this.config.dataFiltering.piiFields.some(field => 
        filteredData[field] && !filteredData[field].startsWith('PSEUDO_')
      );
      
      if (piiFound) {
        throw new Error(`PII found in strictly filtered data for agent ${agentName}`);
      }
    }

    // Check for strict exclusions
    const excludedFound = this.config.dataFiltering.strictExclusions.some(field => 
      filteredData[field] !== undefined
    );
    
    if (excludedFound) {
      throw new Error(`Strictly excluded field found in filtered data for agent ${agentName}`);
    }

    return true;
  }

  // Get allowed tools for an agent
  getAllowedTools(agentName) {
    return this.config.toolMappings[agentName] || [];
  }

  // Check if agent can use specific tool
  canUseTools(agentName, toolName) {
    const allowedTools = this.getAllowedTools(agentName);
    return allowedTools.includes(toolName);
  }
}

module.exports = PrivacyFilter;