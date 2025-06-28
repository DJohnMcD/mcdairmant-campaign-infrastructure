# MCP (Model Context Protocol) Integration

## Overview

Your Personal AI Assistant now includes MCP (Model Context Protocol) client integration for structured thinking capabilities. The system is designed to enhance your four-agent system (Martin, Terri, Eggsy, Ethel) with external structured thinking tools while maintaining strict privacy boundaries.

## Current Status

✅ **MCP Client Integration Complete**
- MCP SDK installed and configured
- Privacy-aware filtering system implemented
- Agent response functions enhanced with MCP capabilities
- Graceful fallback when MCP server unavailable

## Architecture

### Components Added

1. **`mcp-client.js`** - MCP client wrapper with structured thinking methods
2. **`mcp-config.js`** - Configuration for MCP server connection and privacy settings
3. **`privacy-filter.js`** - Privacy-aware data filtering middleware
4. **`test-mcp.js`** - Integration testing suite

### Agent MCP Integration

#### Martin Manager
- **Tools**: `analyze_task`, `decompose_task`, `generate_decision_tree`, `strategic_analysis`
- **Filtering**: Moderate (pseudonymizes PII)
- **Use Cases**: Task breakdown, strategic planning, decision trees

#### Terri Therapist
- **Tools**: `pattern_analysis` (limited access)
- **Filtering**: Strict privacy protection
- **Restriction**: Private conversations never sent to MCP server

#### Eggsy Expert
- **Tools**: `structured_brainstorm`, `creative_connections`, `idea_synthesis`
- **Filtering**: Moderate (pseudonymizes PII)
- **Use Cases**: Creative brainstorming, pattern identification

#### Ethel Ethics
- **Tools**: `compliance_check`, `ethical_analysis`, `audit_trail_analysis`, `generate_decision_tree`
- **Filtering**: Audit level (preserves data for compliance, marks PII)
- **Use Cases**: Legal compliance, ethical analysis

## Privacy Protection

### Data Filtering Levels

1. **Strict** (Terri): Minimal data sharing, content sanitization
2. **Moderate** (Martin, Eggsy): PII pseudonymization, sensitive content removal
3. **Audit** (Ethel): PII marked but preserved for compliance needs

### Automatic PII Removal
- Email addresses → `[EMAIL_REDACTED]`
- Phone numbers → `[PHONE_REDACTED]`
- SSNs → `[SSN_REDACTED]`
- Credit cards → `[CARD_REDACTED]`
- Password references → `[PASSWORD_REDACTED]`

### Audit Logging
- All MCP calls logged with agent, tool, data size, success/failure
- Configurable log retention (default: 90 days)
- Privacy compliance tracking

## Configuration

### Connecting to Your MCP Server

Edit `mcp-config.js` to connect to your specific MCP server:

```javascript
structuredThinking: {
  // For stdio transport with local server:
  command: 'python',
  args: ['-m', 'your_mcp_server'],
  
  // For filesystem-based MCP server:
  command: 'npx',
  args: ['-y', '@modelcontextprotocol/server-filesystem', '/path/to/directory'],
  
  // For SQLite MCP server:
  command: 'npx',
  args: ['-y', '@modelcontextprotocol/server-sqlite', '--db-path', './personal_ai.db'],
}
```

## Testing

Run the test suite:
```bash
node test-mcp.js
```

Tests verify:
- MCP connection handling
- Privacy filtering for each agent
- Tool permission assignments
- Content sanitization
- Graceful fallback behavior

## Usage Examples

### Enhanced Agent Responses

When MCP server is available, agents automatically enhance their responses:

**Martin**: "Right, let's break this down systematically... *Structured analysis: [MCP analysis results]*"

**Eggsy**: "*eyes sparkling* What if you... *whispers excitedly* OH! And I just got this AMAZING structured idea: [MCP brainstorm results]*"

**Ethel**: "From a legal perspective... *Compliance analysis: [MCP compliance check results]*"

### Manual MCP Calls

The system also supports direct MCP tool calls through the client:

```javascript
// Task decomposition
const result = await mcpClient.decomposeTask("Complex project planning", "high");

// Creative brainstorming  
const ideas = await mcpClient.structuredBrainstorm("Campaign strategy", "creative");

// Pattern identification
const patterns = await mcpClient.identifyPatterns(userData, "behavioral");
```

## Benefits

1. **Enhanced Structured Thinking**: Agents can leverage external analysis tools
2. **Privacy-First Design**: Strict data filtering respects agent boundaries
3. **Graceful Degradation**: System works normally when MCP server unavailable
4. **Audit Compliance**: Full logging and tracking for Ethel's oversight
5. **Extensible Architecture**: Easy to add new MCP servers and tools

## Next Steps

1. **Connect to Actual MCP Server**: Update configuration with real server details
2. **Custom Tool Development**: Add domain-specific structured thinking tools
3. **Performance Optimization**: Implement response caching and async processing
4. **Advanced Privacy Controls**: Add user-configurable privacy settings

## Troubleshooting

### Common Issues

1. **"MCP server not available"**: Expected when no server configured - agents work normally
2. **Connection timeouts**: Check server configuration and network connectivity
3. **Tool not found**: Verify MCP server supports requested tools
4. **Privacy filter blocking**: Check agent permissions in `mcp-config.js`

The integration is complete and ready for connection to your structured thinking MCP server!