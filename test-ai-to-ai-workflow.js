#!/usr/bin/env node

/**
 * AI-to-AI Workflow Testing Suite
 * Tests the Claude → GitHub Copilot Agent Mode integration pipeline
 */

const fs = require('fs').promises;
const path = require('path');

class AIWorkflowTester {
  constructor() {
    this.testResults = [];
    this.startTime = Date.now();
  }

  async runAllTests() {
    console.log('🎯 AI-to-AI Workflow Testing Suite - NY-24 Campaign Infrastructure');
    console.log('================================================================\n');

    try {
      await this.testCopilotInstructionsSetup();
      await this.testMCPServerConfiguration();
      await this.testPromptTemplateStructure();
      await this.testClaudeToCopilotBridge();
      await this.testCampaignSpecificPrompts();
      await this.generateTestReport();
    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
      process.exit(1);
    }
  }

  async testCopilotInstructionsSetup() {
    console.log('1. Testing GitHub Copilot Instructions Setup...');
    
    try {
      // Check copilot-instructions.md exists and has campaign context
      const instructionsPath = '.github/copilot-instructions.md';
      const instructionsContent = await fs.readFile(instructionsPath, 'utf8');
      
      const requiredSections = [
        'NY-24 Campaign Infrastructure',
        'AI Agent System',
        'FEC COMPLIANCE STANDARDS',
        'MOBILE-FIRST DEVELOPMENT',
        'Agent Mode Instructions'
      ];
      
      let sectionsFound = 0;
      requiredSections.forEach(section => {
        if (instructionsContent.includes(section)) {
          sectionsFound++;
        } else {
          console.log(`   ⚠️  Missing section: ${section}`);
        }
      });
      
      if (sectionsFound === requiredSections.length) {
        console.log('   ✅ Copilot instructions properly configured');
        this.testResults.push({ test: 'Copilot Instructions', status: 'PASS', details: 'All required sections present' });
      } else {
        console.log(`   ❌ Only ${sectionsFound}/${requiredSections.length} required sections found`);
        this.testResults.push({ test: 'Copilot Instructions', status: 'FAIL', details: `Missing ${requiredSections.length - sectionsFound} sections` });
      }
      
      // Check VS Code settings configuration
      const settingsPath = '.vscode/settings.json';
      try {
        const settingsContent = await fs.readFile(settingsPath, 'utf8');
        const settings = JSON.parse(settingsContent);
        
        if (settings['github.copilot.chat.codeGeneration.useInstructionFiles'] === true &&
            settings['chat.agent.enabled'] === true) {
          console.log('   ✅ VS Code settings configured for agent mode');
        } else {
          console.log('   ⚠️  VS Code settings may need adjustment for optimal agent mode');
        }
      } catch (error) {
        console.log('   ⚠️  VS Code settings file not found or invalid');
      }
      
    } catch (error) {
      console.log('   ❌ Copilot instructions setup failed:', error.message);
      this.testResults.push({ test: 'Copilot Instructions', status: 'FAIL', details: error.message });
    }
  }

  async testMCPServerConfiguration() {
    console.log('\n2. Testing MCP Server Configuration...');
    
    try {
      // Check MCP server file exists and is executable
      const mcpServerPath = 'mcp-campaign-server.js';
      const stats = await fs.stat(mcpServerPath);
      
      if (stats.mode & parseInt('111', 8)) {
        console.log('   ✅ MCP server file is executable');
      } else {
        console.log('   ⚠️  MCP server file may not be executable');
      }
      
      // Check MCP server content structure
      const mcpContent = await fs.readFile(mcpServerPath, 'utf8');
      
      const requiredTools = [
        'analyze_voter_demographics',
        'check_fec_compliance', 
        'generate_rural_messaging',
        'query_campaign_database',
        'opposition_research_analysis',
        'mobile_optimization_check'
      ];
      
      let toolsFound = 0;
      requiredTools.forEach(tool => {
        if (mcpContent.includes(tool)) {
          toolsFound++;
        }
      });
      
      console.log(`   📊 Campaign tools implemented: ${toolsFound}/${requiredTools.length}`);
      
      if (toolsFound === requiredTools.length) {
        console.log('   ✅ All campaign intelligence tools configured');
        this.testResults.push({ test: 'MCP Server', status: 'PASS', details: 'All campaign tools present' });
      } else {
        console.log('   ⚠️  Some campaign tools missing');
        this.testResults.push({ test: 'MCP Server', status: 'PARTIAL', details: `${toolsFound}/${requiredTools.length} tools found` });
      }
      
    } catch (error) {
      console.log('   ❌ MCP server configuration failed:', error.message);
      this.testResults.push({ test: 'MCP Server', status: 'FAIL', details: error.message });
    }
  }

  async testPromptTemplateStructure() {
    console.log('\n3. Testing Prompt Template Structure...');
    
    try {
      const promptsDir = '.github/prompts';
      const promptFiles = await fs.readdir(promptsDir);
      
      const expectedPrompts = [
        'claude-to-copilot-bridge.prompt.md',
        'voter-management.prompt.md', 
        'fec-compliance.prompt.md',
        'agent-enhancement.prompt.md'
      ];
      
      let promptsFound = 0;
      for (const expectedPrompt of expectedPrompts) {
        if (promptFiles.includes(expectedPrompt)) {
          promptsFound++;
          
          // Validate prompt file structure
          const promptPath = path.join(promptsDir, expectedPrompt);
          const promptContent = await fs.readFile(promptPath, 'utf8');
          
          // Check for required YAML frontmatter
          if (promptContent.startsWith('---') && promptContent.includes('mode: agent')) {
            console.log(`   ✅ ${expectedPrompt} properly structured`);
          } else {
            console.log(`   ⚠️  ${expectedPrompt} missing agent mode configuration`);
          }
        } else {
          console.log(`   ❌ Missing: ${expectedPrompt}`);
        }
      }
      
      console.log(`   📊 Prompt templates: ${promptsFound}/${expectedPrompts.length} found`);
      
      if (promptsFound === expectedPrompts.length) {
        this.testResults.push({ test: 'Prompt Templates', status: 'PASS', details: 'All templates present and structured' });
      } else {
        this.testResults.push({ test: 'Prompt Templates', status: 'PARTIAL', details: `${promptsFound}/${expectedPrompts.length} templates found` });
      }
      
    } catch (error) {
      console.log('   ❌ Prompt template testing failed:', error.message);
      this.testResults.push({ test: 'Prompt Templates', status: 'FAIL', details: error.message });
    }
  }

  async testClaudeToCopilotBridge() {
    console.log('\n4. Testing Claude-to-Copilot Bridge Integration...');
    
    try {
      // Check Claude custom instructions
      const claudeInstructionsPath = '.claude/custom-instructions.md';
      const claudeContent = await fs.readFile(claudeInstructionsPath, 'utf8');
      
      if (claudeContent.includes('<campaign_development_request>') && 
          claudeContent.includes('NY-24 Campaign Infrastructure')) {
        console.log('   ✅ Claude instructions configured for Copilot integration');
      } else {
        console.log('   ⚠️  Claude instructions may need Copilot integration format');
      }
      
      // Check bridge prompt structure
      const bridgePath = '.github/prompts/claude-to-copilot-bridge.prompt.md';
      const bridgeContent = await fs.readFile(bridgePath, 'utf8');
      
      const bridgeFeatures = [
        'INPUT FORMAT FROM CLAUDE',
        'IMPLEMENTATION PROCESS', 
        'CAMPAIGN-SPECIFIC IMPLEMENTATION RULES',
        'QUALITY ASSURANCE CHECKLIST'
      ];
      
      let featuresFound = 0;
      bridgeFeatures.forEach(feature => {
        if (bridgeContent.includes(feature)) {
          featuresFound++;
        }
      });
      
      if (featuresFound === bridgeFeatures.length) {
        console.log('   ✅ Bridge integration fully configured');
        this.testResults.push({ test: 'Claude-Copilot Bridge', status: 'PASS', details: 'Bridge fully configured' });
      } else {
        console.log(`   ⚠️  Bridge partially configured: ${featuresFound}/${bridgeFeatures.length} features`);
        this.testResults.push({ test: 'Claude-Copilot Bridge', status: 'PARTIAL', details: `${featuresFound}/${bridgeFeatures.length} features` });
      }
      
    } catch (error) {
      console.log('   ❌ Bridge integration testing failed:', error.message);
      this.testResults.push({ test: 'Claude-Copilot Bridge', status: 'FAIL', details: error.message });
    }
  }

  async testCampaignSpecificPrompts() {
    console.log('\n5. Testing Campaign-Specific Prompt Integration...');
    
    try {
      // Test voter management prompt
      const voterPromptPath = '.github/prompts/voter-management.prompt.md';
      const voterContent = await fs.readFile(voterPromptPath, 'utf8');
      
      const campaignFeatures = [
        'NY-24',
        'FEC compliance',
        'Mobile-first',
        'Rural voter',
        'Field operations'
      ];
      
      let campaignFeaturesFound = 0;
      campaignFeatures.forEach(feature => {
        if (voterContent.toLowerCase().includes(feature.toLowerCase())) {
          campaignFeaturesFound++;
        }
      });
      
      console.log(`   📊 Campaign context integration: ${campaignFeaturesFound}/${campaignFeatures.length} features`);
      
      // Test MCP tool integration in prompts
      const mcpToolsInPrompts = [
        'mcp.campaign-intelligence.analyze_voter_demographics',
        'mcp.campaign-intelligence.check_fec_compliance',
        'mcp.campaign-intelligence.mobile_optimization_check'
      ];
      
      let mcpIntegrationFound = 0;
      for (const promptFile of ['voter-management.prompt.md', 'fec-compliance.prompt.md', 'agent-enhancement.prompt.md']) {
        try {
          const promptPath = `.github/prompts/${promptFile}`;
          const promptContent = await fs.readFile(promptPath, 'utf8');
          
          mcpToolsInPrompts.forEach(tool => {
            if (promptContent.includes(tool)) {
              mcpIntegrationFound++;
            }
          });
        } catch (error) {
          console.log(`   ⚠️  Could not test ${promptFile}: ${error.message}`);
        }
      }
      
      console.log(`   📊 MCP tool integration: ${mcpIntegrationFound} tool references found`);
      
      if (campaignFeaturesFound >= 4 && mcpIntegrationFound >= 2) {
        console.log('   ✅ Campaign-specific prompts well integrated');
        this.testResults.push({ test: 'Campaign Prompts', status: 'PASS', details: 'Good campaign and MCP integration' });
      } else {
        console.log('   ⚠️  Campaign prompts need more integration');
        this.testResults.push({ test: 'Campaign Prompts', status: 'PARTIAL', details: 'Needs more campaign/MCP integration' });
      }
      
    } catch (error) {
      console.log('   ❌ Campaign prompt testing failed:', error.message);
      this.testResults.push({ test: 'Campaign Prompts', status: 'FAIL', details: error.message });
    }
  }

  async generateTestReport() {
    console.log('\n🎯 AI-to-AI Workflow Test Results');
    console.log('================================');
    
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.status === 'PASS').length;
    const partialTests = this.testResults.filter(r => r.status === 'PARTIAL').length;
    const failedTests = this.testResults.filter(r => r.status === 'FAIL').length;
    
    console.log(`\n📊 Test Summary:`);
    console.log(`   ✅ Passed: ${passedTests}/${totalTests}`);
    console.log(`   ⚠️  Partial: ${partialTests}/${totalTests}`);
    console.log(`   ❌ Failed: ${failedTests}/${totalTests}`);
    
    console.log(`\n📋 Detailed Results:`);
    this.testResults.forEach(result => {
      const statusIcon = result.status === 'PASS' ? '✅' : result.status === 'PARTIAL' ? '⚠️' : '❌';
      console.log(`   ${statusIcon} ${result.test}: ${result.details}`);
    });
    
    const testDuration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    console.log(`\n⏱️  Test Duration: ${testDuration} seconds`);
    
    if (failedTests === 0) {
      console.log('\n🎉 AI-to-AI Workflow Ready for Revolutionary Campaign Development!');
      console.log('🚀 Your Claude → Copilot Agent Mode pipeline is operational!');
    } else {
      console.log('\n⚠️  Some components need attention before full deployment.');
      console.log('🔧 Address failed tests for optimal AI-to-AI workflow performance.');
    }
    
    // Save detailed report
    const reportPath = 'ai-workflow-test-report.json';
    const report = {
      timestamp: new Date().toISOString(),
      summary: { total: totalTests, passed: passedTests, partial: partialTests, failed: failedTests },
      results: this.testResults,
      duration: testDuration
    };
    
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved: ${reportPath}`);
  }
}

// Run the test suite
if (require.main === module) {
  const tester = new AIWorkflowTester();
  tester.runAllTests().catch(console.error);
}

module.exports = AIWorkflowTester;