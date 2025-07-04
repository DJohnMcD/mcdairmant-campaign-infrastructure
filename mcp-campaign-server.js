#!/usr/bin/env node

/**
 * NY-24 Campaign Intelligence MCP Server
 * Provides campaign-specific tools and resources for GitHub Copilot Agent Mode
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const fs = require('fs').promises;
const path = require('path');

// Campaign-specific data and utilities
const CampaignDatabase = require('./database');
const { NY24_DISTRICT_DATA, NY24_HELPERS } = require('./ny24-district-data');

class CampaignMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'ny24-campaign-intelligence',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.db = new CampaignDatabase();
    this.setupHandlers();
  }

  setupHandlers() {
    // List available campaign tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'analyze_voter_demographics',
            description: 'Analyze voter demographics for NY-24 counties with strategic recommendations',
            inputSchema: {
              type: 'object',
              properties: {
                county: {
                  type: 'string',
                  enum: ['Oswego', 'Cayuga', 'Onondaga', 'all'],
                  description: 'Target county for analysis'
                },
                focus: {
                  type: 'string',
                  enum: ['turnout', 'messaging', 'demographics', 'strategy'],
                  description: 'Analysis focus area'
                }
              },
              required: ['county']
            }
          },
          {
            name: 'check_fec_compliance',
            description: 'Validate campaign finance data for FEC compliance',
            inputSchema: {
              type: 'object',
              properties: {
                transaction_type: {
                  type: 'string',
                  enum: ['donation', 'expense', 'contribution'],
                  description: 'Type of financial transaction'
                },
                amount: {
                  type: 'number',
                  description: 'Transaction amount in dollars'
                },
                donor_info: {
                  type: 'object',
                  description: 'Donor information for contribution limit checking'
                }
              },
              required: ['transaction_type', 'amount']
            }
          },
          {
            name: 'generate_rural_messaging',
            description: 'Generate district-appropriate messaging for rural NY-24 voters',
            inputSchema: {
              type: 'object',
              properties: {
                topic: {
                  type: 'string',
                  description: 'Policy topic or campaign issue'
                },
                county: {
                  type: 'string',
                  enum: ['Oswego', 'Cayuga', 'Onondaga'],
                  description: 'Target county for messaging'
                },
                format: {
                  type: 'string',
                  enum: ['social_media', 'flyer', 'speech', 'email'],
                  description: 'Message format and length'
                }
              },
              required: ['topic', 'format']
            }
          },
          {
            name: 'query_campaign_database',
            description: 'Query campaign database for voter, donor, or volunteer information',
            inputSchema: {
              type: 'object',
              properties: {
                table: {
                  type: 'string',
                  enum: ['campaign_voters', 'campaign_donors', 'campaign_volunteers', 'campaign_events'],
                  description: 'Database table to query'
                },
                filters: {
                  type: 'object',
                  description: 'Query filters and conditions'
                },
                limit: {
                  type: 'number',
                  default: 10,
                  description: 'Maximum number of results'
                }
              },
              required: ['table']
            }
          },
          {
            name: 'opposition_research_analysis',
            description: 'Analyze opposition research and suggest campaign responses',
            inputSchema: {
              type: 'object',
              properties: {
                topic: {
                  type: 'string',
                  description: 'Opposition research topic or Claudia Tenney position'
                },
                response_type: {
                  type: 'string',
                  enum: ['policy_contrast', 'voting_record', 'local_impact'],
                  description: 'Type of campaign response needed'
                }
              },
              required: ['topic']
            }
          },
          {
            name: 'mobile_optimization_check',
            description: 'Analyze code or interface for mobile field operation requirements',
            inputSchema: {
              type: 'object',
              properties: {
                component_type: {
                  type: 'string',
                  enum: ['form', 'dashboard', 'api_endpoint', 'agent_interface'],
                  description: 'Type of component to optimize'
                },
                use_case: {
                  type: 'string',
                  enum: ['canvassing', 'event_management', 'volunteer_coordination', 'donor_contact'],
                  description: 'Field operation use case'
                }
              },
              required: ['component_type', 'use_case']
            }
          }
        ]
      };
    });

    // Handle tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'analyze_voter_demographics':
            return await this.analyzeVoterDemographics(args);
          
          case 'check_fec_compliance':
            return await this.checkFECCompliance(args);
          
          case 'generate_rural_messaging':
            return await this.generateRuralMessaging(args);
          
          case 'query_campaign_database':
            return await this.queryCampaignDatabase(args);
          
          case 'opposition_research_analysis':
            return await this.oppositionResearchAnalysis(args);
          
          case 'mobile_optimization_check':
            return await this.mobileOptimizationCheck(args);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error executing ${name}: ${error.message}`
            }
          ],
          isError: true
        };
      }
    });
  }

  async analyzeVoterDemographics(args) {
    const { county = 'all', focus = 'demographics' } = args;
    
    const countyData = county === 'all' 
      ? NY24_DISTRICT_DATA.counties 
      : { [county]: NY24_DISTRICT_DATA.counties[county] };

    let analysis = `# NY-24 Voter Demographics Analysis\n\n`;
    
    for (const [countyName, data] of Object.entries(countyData)) {
      analysis += `## ${countyName} County\n`;
      analysis += `**Population**: ${data.demographics.total_population.toLocaleString()}\n`;
      analysis += `**Voter Registration**: ${data.demographics.registered_voters.toLocaleString()}\n`;
      analysis += `**Key Demographics**: ${data.demographics.key_groups.join(', ')}\n`;
      
      if (focus === 'strategy' || focus === 'messaging') {
        analysis += `**Strategic Priorities**: ${data.strategic_priorities.join(', ')}\n`;
        analysis += `**Messaging Focus**: ${data.messaging_themes.join(', ')}\n`;
      }
      
      analysis += `\n`;
    }

    return {
      content: [
        {
          type: 'text',
          text: analysis
        }
      ]
    };
  }

  async checkFECCompliance(args) {
    const { transaction_type, amount, donor_info } = args;
    
    let compliance = {
      compliant: true,
      warnings: [],
      requirements: []
    };

    // Individual contribution limits for 2026
    const INDIVIDUAL_LIMIT = 3300;
    
    if (transaction_type === 'donation' || transaction_type === 'contribution') {
      if (amount > INDIVIDUAL_LIMIT) {
        compliance.compliant = false;
        compliance.warnings.push(`Amount $${amount} exceeds individual contribution limit of $${INDIVIDUAL_LIMIT}`);
      }
      
      if (!donor_info?.employer || !donor_info?.occupation) {
        compliance.warnings.push('Missing required donor occupation and employer information');
        compliance.requirements.push('Collect donor occupation and employer for contributions over $200');
      }
    }

    if (transaction_type === 'expense') {
      compliance.requirements.push('Categorize expense as campaign-related, personal, or art project');
      compliance.requirements.push('Retain receipts and documentation for FEC reporting');
    }

    const result = `# FEC Compliance Check\n\n**Transaction**: ${transaction_type} - $${amount}\n**Status**: ${compliance.compliant ? '✅ Compliant' : '❌ Compliance Issues'}\n\n`;
    
    let details = '';
    if (compliance.warnings.length > 0) {
      details += `**Warnings**:\n${compliance.warnings.map(w => `- ${w}`).join('\n')}\n\n`;
    }
    
    if (compliance.requirements.length > 0) {
      details += `**Requirements**:\n${compliance.requirements.map(r => `- ${r}`).join('\n')}\n`;
    }

    return {
      content: [
        {
          type: 'text',
          text: result + details
        }
      ]
    };
  }

  async generateRuralMessaging(args) {
    const { topic, county, format } = args;
    
    const messaging = NY24_HELPERS.generateCountyMessage(topic, county);
    
    let formattedMessage = `# Rural Messaging - ${topic}\n\n`;
    
    if (county) {
      const countyInfo = NY24_DISTRICT_DATA.counties[county];
      formattedMessage += `**Target**: ${county} County (${countyInfo?.demographics.key_groups.join(', ')})\n`;
    }
    
    formattedMessage += `**Format**: ${format}\n\n`;
    formattedMessage += `**Message**:\n${messaging}\n\n`;
    
    // Add format-specific optimization
    switch (format) {
      case 'social_media':
        formattedMessage += `**Social Media Tips**:\n- Keep under 280 characters\n- Use local hashtags\n- Include agricultural imagery\n- Tag local organizations\n`;
        break;
      case 'flyer':
        formattedMessage += `**Flyer Design**:\n- Large, clear fonts for older voters\n- High contrast colors\n- Local landmark imagery\n- Clear call-to-action\n`;
        break;
      case 'speech':
        formattedMessage += `**Speech Notes**:\n- Reference local agricultural challenges\n- Mention specific county projects\n- Use conversational, friendly tone\n- Include personal anecdotes\n`;
        break;
    }

    return {
      content: [
        {
          type: 'text',
          text: formattedMessage
        }
      ]
    };
  }

  async queryCampaignDatabase(args) {
    const { table, filters = {}, limit = 10 } = args;
    
    try {
      await this.db.ready();
      
      // Build query based on table and filters
      let query = `SELECT * FROM ${table}`;
      let params = [];
      
      if (Object.keys(filters).length > 0) {
        const conditions = Object.keys(filters).map(key => `${key} = ?`);
        query += ` WHERE ${conditions.join(' AND ')}`;
        params = Object.values(filters);
      }
      
      query += ` LIMIT ${limit}`;
      
      const results = await this.db.all(query, params);
      
      return {
        content: [
          {
            type: 'text',
            text: `# Campaign Database Query Results\n\n**Table**: ${table}\n**Results**: ${results.length} records\n\n\`\`\`json\n${JSON.stringify(results, null, 2)}\n\`\`\``
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Database query failed: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }

  async oppositionResearchAnalysis(args) {
    const { topic, response_type = 'policy_contrast' } = args;
    
    let analysis = `# Opposition Research Analysis\n\n**Topic**: ${topic}\n**Response Type**: ${response_type}\n\n`;
    
    // Simulate opposition research analysis
    switch (response_type) {
      case 'policy_contrast':
        analysis += `**Policy Contrast Opportunities**:\n`;
        analysis += `- Highlight local impact differences\n`;
        analysis += `- Emphasize rural voter benefits\n`;
        analysis += `- Compare voting record on agricultural issues\n\n`;
        break;
      case 'voting_record':
        analysis += `**Voting Record Analysis**:\n`;
        analysis += `- Research Tenney's votes on rural infrastructure\n`;
        analysis += `- Identify missed opportunities for NY-24\n`;
        analysis += `- Document agricultural policy positions\n\n`;
        break;
      case 'local_impact':
        analysis += `**Local Impact Assessment**:\n`;
        analysis += `- County-specific project outcomes\n`;
        analysis += `- Economic development results\n`;
        analysis += `- Agricultural community feedback\n\n`;
        break;
    }
    
    analysis += `**Recommended Response Strategy**:\n`;
    analysis += `- Focus on positive vision for NY-24\n`;
    analysis += `- Use local examples and testimonials\n`;
    analysis += `- Emphasize bipartisan solutions\n`;
    analysis += `- Maintain respectful, issue-focused tone\n`;

    return {
      content: [
        {
          type: 'text',
          text: analysis
        }
      ]
    };
  }

  async mobileOptimizationCheck(args) {
    const { component_type, use_case } = args;
    
    let optimization = `# Mobile Optimization Analysis\n\n**Component**: ${component_type}\n**Use Case**: ${use_case}\n\n`;
    
    // Field operation requirements
    const fieldRequirements = {
      canvassing: ['Offline capability', 'Large touch targets', 'Quick data entry', 'GPS integration'],
      event_management: ['Real-time updates', 'Photo upload', 'Attendance tracking', 'Check-in interface'],
      volunteer_coordination: ['Schedule viewing', 'Task assignment', 'Communication tools', 'Availability tracking'],
      donor_contact: ['Contact forms', 'Donation tracking', 'Follow-up reminders', 'Compliance checking']
    };
    
    optimization += `**${use_case.replace('_', ' ').toUpperCase()} Requirements**:\n`;
    fieldRequirements[use_case]?.forEach(req => {
      optimization += `- ${req}\n`;
    });
    
    optimization += `\n**Mobile Optimization Checklist**:\n`;
    optimization += `- ✅ Touch targets minimum 44px\n`;
    optimization += `- ✅ Responsive design for all screen sizes\n`;
    optimization += `- ✅ Fast loading on 3G connections\n`;
    optimization += `- ✅ Offline functionality where possible\n`;
    optimization += `- ✅ Large, readable fonts (minimum 16px)\n`;
    optimization += `- ✅ Accessible color contrast\n`;
    optimization += `- ✅ Simplified navigation\n`;
    optimization += `- ✅ Error handling for poor connectivity\n`;
    
    optimization += `\n**Field Testing Recommendations**:\n`;
    optimization += `- Test in rural areas with poor cell coverage\n`;
    optimization += `- Validate with actual volunteers using various devices\n`;
    optimization += `- Check performance on older Android/iOS versions\n`;
    optimization += `- Verify usability with gloves in winter weather\n`;

    return {
      content: [
        {
          type: 'text',
          text: optimization
        }
      ]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('NY-24 Campaign Intelligence MCP Server running on stdio');
  }
}

// Start the server
if (require.main === module) {
  const server = new CampaignMCPServer();
  server.run().catch(console.error);
}

module.exports = CampaignMCPServer;