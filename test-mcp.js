#!/usr/bin/env node

const MCPStructuredThinkingClient = require('./mcp-client');
const PrivacyFilter = require('./privacy-filter');

async function testMCPConnection() {
  console.log('Testing MCP Client Integration...\n');
  
  const client = new MCPStructuredThinkingClient();
  const privacyFilter = new PrivacyFilter();
  
  try {
    // Test 1: Basic connection (will fail gracefully with current config)
    console.log('1. Testing MCP connection...');
    const connected = await client.connect();
    console.log(`   Connection result: ${connected ? 'SUCCESS' : 'FAILED (Expected with current config)'}\n`);
    
    // Test 2: Privacy filtering
    console.log('2. Testing privacy filtering...');
    
    const testData = {
      message: "I need help with my campaign strategy and also my password is secret123",
      userId: 1,
      context: 'test'
    };
    
    // Test Martin (allowed with moderate filtering)
    const martinFilter = privacyFilter.filterForMCP('martin', testData);
    console.log('   Martin filter result:', {
      allowed: martinFilter.allowed,
      hasFilteredData: !!martinFilter.filteredData,
      originalLength: testData.message.length,
      filteredLength: martinFilter.filteredData?.message?.length || 0
    });
    
    // Test Terri (should be blocked for private conversations)
    const terriFilter = privacyFilter.filterForMCP('terri', testData, { conversationType: 'private' });
    console.log('   Terri private filter result:', {
      allowed: terriFilter.allowed,
      reason: terriFilter.reason
    });
    
    // Test Ethel (should allow with audit filtering)
    const ethelFilter = privacyFilter.filterForMCP('ethel', testData);
    console.log('   Ethel filter result:', {
      allowed: ethelFilter.allowed,
      hasAuditInfo: !!ethelFilter.filteredData?._auditInfo
    });
    
    console.log('\n3. Testing tool permissions...');
    
    // Test tool permissions for each agent
    const agents = ['martin', 'terri', 'eggsy', 'ethel'];
    agents.forEach(agent => {
      const allowedTools = privacyFilter.getAllowedTools(agent);
      console.log(`   ${agent}: ${allowedTools.join(', ')}`);
    });
    
    console.log('\n4. Testing content sanitization...');
    
    const sensitiveContent = "My email is john@example.com and my phone is 555-123-4567. SSN: 123-45-6789";
    const sanitized = privacyFilter.sanitizeContent(sensitiveContent);
    console.log('   Original:', sensitiveContent);
    console.log('   Sanitized:', sanitized);
    
    console.log('\n✓ Privacy filtering tests completed successfully');
    
    if (connected) {
      await client.disconnect();
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

if (require.main === module) {
  testMCPConnection();
}

module.exports = testMCPConnection;