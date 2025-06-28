#!/usr/bin/env node

const WebAppTester = require('./test-webapp');

async function testMCPEnhancements() {
  console.log('🧪 Testing MCP Enhancements in Agent Responses\n');
  
  const tester = new WebAppTester();
  
  try {
    // Login first
    await tester.testLogin();
    
    console.log('Testing Martin with complex task for MCP enhancement...');
    const martinResponse = await tester.makeRequest('/api/agent/martin/respond', {
      method: 'POST',
      body: { message: 'I need to organize my complex PhD application process with multiple deadlines and requirements' }
    });
    
    if (martinResponse.statusCode === 200) {
      const data = JSON.parse(martinResponse.body);
      console.log('\n📋 Martin\'s Response:');
      console.log('─'.repeat(80));
      console.log(data.response);
      console.log('─'.repeat(80));
      
      if (data.response.includes('analysis:') || data.response.includes('structured') || data.response.includes('MCP')) {
        console.log('✅ MCP enhancement detected!');
      } else {
        console.log('ℹ️  Standard response (MCP tools may not have enhanced this particular response)');
      }
    }
    
    console.log('\nTesting Eggsy with creative challenge...');
    const eggsyResponse = await tester.makeRequest('/api/agent/eggsy/respond', {
      method: 'POST',
      body: { message: 'I need creative ideas for connecting my campaign with my dance background' }
    });
    
    if (eggsyResponse.statusCode === 200) {
      const data = JSON.parse(eggsyResponse.body);
      console.log('\n🎨 Eggsy\'s Response:');
      console.log('─'.repeat(80));
      console.log(data.response);
      console.log('─'.repeat(80));
      
      if (data.response.includes('structured idea') || data.response.includes('pattern') || data.response.includes('OH!')) {
        console.log('✅ Creative enhancement detected!');
      }
    }
    
    console.log('\nTesting Ethel with compliance question...');
    const ethelResponse = await tester.makeRequest('/api/agent/ethel/respond', {
      method: 'POST',
      body: { message: 'What legal considerations should I have for my campaign finance documentation?' }
    });
    
    if (ethelResponse.statusCode === 200) {
      const data = JSON.parse(ethelResponse.body);
      console.log('\n⚖️  Ethel\'s Response:');
      console.log('─'.repeat(80));
      console.log(data.response);
      console.log('─'.repeat(80));
      
      if (data.response.includes('analysis:') || data.response.includes('compliance')) {
        console.log('✅ Compliance analysis detected!');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testMCPEnhancements();