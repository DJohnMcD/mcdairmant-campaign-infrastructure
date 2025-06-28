// MCP Server Configuration for Campaign Infrastructure
const MCP_CONFIG = {
  // Campaign-optimized structured thinking and data management
  // Note: Update these settings to match your actual MCP servers
  structuredThinking: {
    // Example configurations - uncomment and modify as needed:
    
    // For stdio transport with local server:
    // command: 'python',
    // args: ['-m', 'your_mcp_server'],
    
    // For filesystem-based MCP server:
    // command: 'npx',
    // args: ['-y', '@modelcontextprotocol/server-filesystem', '/path/to/allowed/directory'],
    
    // For SQLite MCP server:
    // command: 'npx',
    // args: ['-y', '@modelcontextprotocol/server-sqlite', '--db-path', './personal_ai.db'],
    
    // Sequential Thinking MCP server for structured problem solving
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-sequential-thinking'],
    env: {
      ...process.env,
    },
    // Connection timeout in milliseconds
    timeout: 5000,
    // Retry attempts for failed connections
    retryAttempts: 1,
    // Delay between retry attempts (ms)
    retryDelay: 1000
  },

  // Campaign MCP servers for specialized operations
  campaignServers: {
    // SQLite server for campaign database operations
    database: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-sqlite', '--db-path', './personal_ai.db'],
      enabled: false // Enable when ready to use
    },
    // Filesystem server for campaign documents
    filesystem: {
      command: 'npx', 
      args: ['-y', '@modelcontextprotocol/server-filesystem', './campaign-docs'],
      enabled: false // Enable when ready to use
    },
    // Web scraping for opposition research and news monitoring
    webScraping: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-web-scraper'],
      enabled: false // Enable when ready to use
    }
  },

  // Privacy settings for different campaign agents
  privacy: {
    // Terri's private strategy sessions should never be sent to MCP server
    terri: {
      allowMCPAccess: false,
      privateConversations: true,
      dataFiltering: 'strict'
    },
    // Martin (Campaign Director) can use MCP for electoral analysis
    martin: {
      allowMCPAccess: true,
      shareUserData: true,
      dataFiltering: 'moderate',
      campaignDataAccess: true
    },
    // Eggsy (Creative/Content Director) can use MCP for content strategy
    eggsy: {
      allowMCPAccess: true,
      shareUserData: true,
      dataFiltering: 'moderate',
      campaignDataAccess: true
    },
    // Ethel (Legal/Compliance Director) can use MCP for FEC compliance analysis
    ethel: {
      allowMCPAccess: true,
      shareUserData: true,
      dataFiltering: 'audit', // Special filtering for legal/compliance
      fecComplianceAccess: true
    }
  },

  // Data filtering rules
  dataFiltering: {
    // Always exclude these fields from MCP calls
    strictExclusions: [
      'password',
      'session_id',
      'private_notes',
      'terri_private'
    ],
    
    // PII fields that require careful handling (including campaign data)
    piiFields: [
      'username',
      'email',
      'phone',
      'address',
      'donor_info',
      'voter_data',
      'volunteer_contact_info'
    ],
    
    // Campaign-specific sensitive data
    campaignSensitive: [
      'donor_names',
      'contribution_amounts', 
      'voter_contact_history',
      'volunteer_personal_info',
      'private_strategy_notes'
    ],
    
    // Audit trail requirements
    auditRequirements: {
      logMCPCalls: true,
      retainLogs: true,
      logRetentionDays: 90
    }
  },

  // Tool mappings for different campaign agent types
  toolMappings: {
    martin: [
      'analyze_task',
      'decompose_task', 
      'generate_decision_tree',
      'strategic_analysis',
      'sequential_thinking',
      'voter_analysis',
      'campaign_database_query',
      'electoral_strategy_planning'
    ],
    terri: [
      // Limited MCP access for Terri due to privacy constraints
      'pattern_analysis'  // Only for patterns in non-private campaign data
    ],
    eggsy: [
      'structured_brainstorm',
      'creative_connections',
      'idea_synthesis',
      'sequential_thinking',
      'content_strategy_analysis',
      'social_media_optimization',
      'messaging_framework_development'
    ],
    ethel: [
      'compliance_check',
      'ethical_analysis',
      'audit_trail_analysis',
      'generate_decision_tree',
      'sequential_thinking',
      'fec_compliance_analysis',
      'campaign_finance_audit',
      'expenditure_review'
    ]
  },

  // Performance settings
  performance: {
    // Maximum time to wait for MCP response (ms)
    maxResponseTime: 10000,
    // Enable caching of MCP responses
    enableCaching: true,
    // Cache TTL in seconds
    cacheTTL: 300,
    // Maximum concurrent MCP calls
    maxConcurrentCalls: 5
  }
};

module.exports = MCP_CONFIG;