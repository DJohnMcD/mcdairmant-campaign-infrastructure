#!/usr/bin/env node

const http = require('http');

// Test configuration
const SERVER_URL = 'http://localhost:8080';
const TEST_USERNAME = 'testuser';
const TEST_PASSWORD = 'testpass123';

class WebAppTester {
  constructor() {
    this.cookies = '';
  }

  async makeRequest(path, options = {}) {
    return new Promise((resolve, reject) => {
      const reqOptions = {
        hostname: 'localhost',
        port: 8080,
        path: path,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': this.cookies,
          ...options.headers
        }
      };

      const req = http.request(reqOptions, (res) => {
        let data = '';
        
        // Capture cookies from response
        if (res.headers['set-cookie']) {
          this.cookies = res.headers['set-cookie'].join('; ');
        }

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          });
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      if (options.body) {
        req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
      }

      req.end();
    });
  }

  async testRegistration() {
    console.log('1. Testing user registration...');
    
    const response = await this.makeRequest('/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `username=${TEST_USERNAME}&password=${TEST_PASSWORD}`
    });

    if (response.statusCode === 302) {
      console.log('   ✓ Registration successful (redirected to dashboard)');
      return true;
    } else if (response.body.includes('already exists')) {
      console.log('   ✓ User already exists, continuing with login test');
      return true;
    } else {
      console.log('   ✗ Registration failed:', response.statusCode, response.body);
      return false;
    }
  }

  async testLogin() {
    console.log('2. Testing login...');
    
    const response = await this.makeRequest('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `username=${TEST_USERNAME}&password=${TEST_PASSWORD}`
    });

    if (response.statusCode === 302) {
      console.log('   ✓ Login successful');
      return true;
    } else {
      console.log('   ✗ Login failed:', response.statusCode, response.body);
      return false;
    }
  }

  async testDashboardAccess() {
    console.log('3. Testing dashboard access...');
    
    const response = await this.makeRequest('/dashboard');
    
    if (response.statusCode === 200 && response.body.includes('Martin Manager')) {
      console.log('   ✓ Dashboard loaded successfully');
      return true;
    } else {
      console.log('   ✗ Dashboard access failed:', response.statusCode);
      return false;
    }
  }

  async testAgentResponse(agentName, message) {
    console.log(`4. Testing ${agentName} agent response...`);
    
    const response = await this.makeRequest(`/api/agent/${agentName}/respond`, {
      method: 'POST',
      body: { message: message }
    });

    if (response.statusCode === 200) {
      const data = JSON.parse(response.body);
      console.log(`   ✓ ${agentName} responded:`, data.response.substring(0, 100) + '...');
      
      // Check if MCP enhancement is present
      if (data.response.includes('analysis:') || data.response.includes('structured')) {
        console.log('   ✓ MCP enhancement detected in response');
      } else {
        console.log('   ℹ Basic response (MCP server not connected)');
      }
      
      return true;
    } else {
      console.log(`   ✗ ${agentName} response failed:`, response.statusCode, response.body);
      return false;
    }
  }

  async testTerriPrivateChat() {
    console.log('5. Testing Terri private chat...');
    
    const response = await this.makeRequest('/api/terri/chat', {
      method: 'POST',
      body: { message: 'I need help with relationship patterns' }
    });

    if (response.statusCode === 200) {
      const data = JSON.parse(response.body);
      console.log('   ✓ Terri private chat working:', data.response.substring(0, 100) + '...');
      return true;
    } else {
      console.log('   ✗ Terri private chat failed:', response.statusCode, response.body);
      return false;
    }
  }

  async testEntryCreation() {
    console.log('6. Testing entry creation with auto-categorization...');
    
    const testEntries = [
      { content: 'Need to finish the quarterly report by Friday', type: 'task' },
      { content: 'Feeling overwhelmed with campaign work and PhD applications', type: 'journal' },
      { content: 'Creative idea: use performance art methodology in campaign strategy', type: 'note' }
    ];

    for (const entry of testEntries) {
      const response = await this.makeRequest('/api/entry', {
        method: 'POST',
        body: entry
      });

      if (response.statusCode === 200) {
        const data = JSON.parse(response.body);
        console.log(`   ✓ ${entry.type} entry created, assigned to: ${data.agent}`);
      } else {
        console.log(`   ✗ Entry creation failed:`, response.statusCode, response.body);
        return false;
      }
    }
    
    return true;
  }

  async testEntriesRetrieval() {
    console.log('7. Testing entries retrieval...');
    
    const response = await this.makeRequest('/api/entries');
    
    if (response.statusCode === 200) {
      const data = JSON.parse(response.body);
      console.log(`   ✓ Retrieved ${data.length} entries`);
      
      // Show entry types and assigned agents
      const entrySummary = data.reduce((acc, entry) => {
        acc[entry.type] = acc[entry.type] || 0;
        acc[entry.type]++;
        return acc;
      }, {});
      
      console.log('   Entry breakdown:', entrySummary);
      return true;
    } else {
      console.log('   ✗ Entries retrieval failed:', response.statusCode, response.body);
      return false;
    }
  }

  async runAllTests() {
    console.log('🧪 Starting Personal AI Assistant Web App Tests\n');
    
    try {
      const results = [];
      
      results.push(await this.testRegistration());
      results.push(await this.testLogin());
      results.push(await this.testDashboardAccess());
      results.push(await this.testAgentResponse('martin', 'I have too many tasks and feeling overwhelmed'));
      results.push(await this.testAgentResponse('eggsy', 'I need creative ideas for my campaign'));
      results.push(await this.testAgentResponse('ethel', 'I need compliance guidance for my campaign finances'));
      results.push(await this.testTerriPrivateChat());
      results.push(await this.testEntryCreation());
      results.push(await this.testEntriesRetrieval());
      
      const passed = results.filter(r => r).length;
      const total = results.length;
      
      console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);
      
      if (passed === total) {
        console.log('🎉 All tests passed! Web app is functioning correctly.');
      } else {
        console.log('⚠️  Some tests failed. Check the output above for details.');
      }
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    }
  }
}

// Check if server is running
async function checkServer() {
  try {
    const tester = new WebAppTester();
    const response = await tester.makeRequest('/');
    return response.statusCode === 302; // Should redirect to login
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log('Checking if server is running...');
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Server is not running. Please start with: npm start');
    process.exit(1);
  }
  
  console.log('✓ Server is running at http://localhost:8080\n');
  
  const tester = new WebAppTester();
  await tester.runAllTests();
}

if (require.main === module) {
  main();
}

module.exports = WebAppTester;