const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');
const MCP_CONFIG = require('./mcp-config');

class MCPStructuredThinkingClient {
  constructor() {
    this.client = null;
    this.transport = null;
    this.isConnected = false;
  }

  async connect(serverConfig = {}) {
    try {
      // Use configuration from mcp-config.js
      const config = {
        command: MCP_CONFIG.structuredThinking.command,
        args: MCP_CONFIG.structuredThinking.args,
        env: MCP_CONFIG.structuredThinking.env,
        ...serverConfig
      };

      // Create transport
      this.transport = new StdioClientTransport({
        command: config.command,
        args: config.args,
        env: config.env
      });

      // Create client
      this.client = new Client(
        {
          name: 'personal-ai-assistant',
          version: '1.0.0'
        },
        {
          capabilities: {
            roots: {
              listChanged: true
            },
            sampling: {}
          }
        }
      );

      // Connect
      await this.client.connect(this.transport);
      this.isConnected = true;
      
      console.log('Connected to MCP structured thinking server');
      return true;

    } catch (error) {
      console.error('Failed to connect to MCP server:', error);
      this.isConnected = false;
      return false;
    }
  }

  async disconnect() {
    if (this.client && this.transport) {
      try {
        await this.client.close();
        await this.transport.close();
        this.isConnected = false;
        console.log('Disconnected from MCP server');
      } catch (error) {
        console.error('Error disconnecting from MCP server:', error);
      }
    }
  }

  async getTools() {
    if (!this.isConnected || !this.client) {
      throw new Error('MCP client not connected');
    }

    try {
      const response = await this.client.listTools();
      return response.tools || [];
    } catch (error) {
      console.error('Failed to get MCP tools:', error);
      return [];
    }
  }

  async callTool(toolName, args = {}) {
    if (!this.isConnected || !this.client) {
      throw new Error('MCP client not connected');
    }

    try {
      const response = await this.client.callTool({
        name: toolName,
        arguments: args
      });
      return response;
    } catch (error) {
      console.error(`Failed to call MCP tool ${toolName}:`, error);
      throw error;
    }
  }

  async getResources() {
    if (!this.isConnected || !this.client) {
      throw new Error('MCP client not connected');
    }

    try {
      const response = await this.client.listResources();
      return response.resources || [];
    } catch (error) {
      console.error('Failed to get MCP resources:', error);
      return [];
    }
  }

  async readResource(uri) {
    if (!this.isConnected || !this.client) {
      throw new Error('MCP client not connected');
    }

    try {
      const response = await this.client.readResource({ uri });
      return response;
    } catch (error) {
      console.error(`Failed to read MCP resource ${uri}:`, error);
      throw error;
    }
  }

  async getPrompts() {
    if (!this.isConnected || !this.client) {
      throw new Error('MCP client not connected');
    }

    try {
      const response = await this.client.listPrompts();
      return response.prompts || [];
    } catch (error) {
      console.error('Failed to get MCP prompts:', error);
      return [];
    }
  }

  async getPrompt(name, args = {}) {
    if (!this.isConnected || !this.client) {
      throw new Error('MCP client not connected');
    }

    try {
      const response = await this.client.getPrompt({
        name,
        arguments: args
      });
      return response;
    } catch (error) {
      console.error(`Failed to get MCP prompt ${name}:`, error);
      throw error;
    }
  }

  // Structured thinking specific methods
  async analyzeTask(taskData, agentContext = {}) {
    return await this.callTool('analyze_task', {
      task: taskData,
      context: agentContext
    });
  }

  async decomposeTask(taskDescription, complexity = 'medium') {
    return await this.callTool('decompose_task', {
      description: taskDescription,
      complexity
    });
  }

  async identifyPatterns(dataSet, analysisType = 'general') {
    return await this.callTool('identify_patterns', {
      data: dataSet,
      type: analysisType
    });
  }

  async generateDecisionTree(problem, constraints = []) {
    return await this.callTool('generate_decision_tree', {
      problem,
      constraints
    });
  }

  async structuredBrainstorm(topic, perspective = 'creative') {
    return await this.callTool('structured_brainstorm', {
      topic,
      perspective
    });
  }
}

module.exports = MCPStructuredThinkingClient;