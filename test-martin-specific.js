#!/usr/bin/env node

const WebAppTester = require('./test-webapp');

async function testMartinMCP() {
  console.log('🧪 Testing Martin\'s MCP Enhancement\n');
  
  const tester = new WebAppTester();
  
  try {
    // Login first
    await tester.testLogin();
    
    console.log('Testing Martin with "overwhelm" keyword...');
    const response1 = await tester.makeRequest('/api/agent/martin/respond', {
      method: 'POST',
      body: { message: 'I have too much work and feeling overwhelmed with everything' }
    });
    
    if (response1.statusCode === 200) {
      const data = JSON.parse(response1.body);
      console.log('\n📋 Martin\'s "Overwhelm" Response:');
      console.log('─'.repeat(80));
      console.log(data.response);
      console.log('─'.repeat(80));
    }
    
    console.log('\nTesting Martin with "task" keyword...');
    const response2 = await tester.makeRequest('/api/agent/martin/respond', {
      method: 'POST',
      body: { message: 'I need help organizing this complex task with multiple deadlines' }
    });
    
    if (response2.statusCode === 200) {
      const data = JSON.parse(response2.body);
      console.log('\n📋 Martin\'s "Task" Response:');
      console.log('─'.repeat(80));
      console.log(data.response);
      console.log('─'.repeat(80));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testMartinMCP();