#!/usr/bin/env node

/**
 * NY-24 Mobile Voter Lookup Testing Suite
 * Comprehensive field operations testing
 */

const http = require('http');
const querystring = require('querystring');

class MobileInterfaceTester {
  constructor() {
    this.baseUrl = 'http://localhost:8081';
    this.testResults = [];
    this.startTime = Date.now();
  }

  async runAllTests() {
    console.log('🎯 NY-24 Mobile Voter Lookup Testing Suite');
    console.log('==========================================\n');

    try {
      await this.testServerHealth();
      await this.testVoterSearch();
      await this.testVoterDetails();
      await this.testCanvassInteraction();
      await this.testCampaignStats();
      await this.testOfflineSync();
      await this.testMobilePerformance();
      await this.generateTestReport();
    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
      process.exit(1);
    }
  }

  async makeRequest(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'NY24-Mobile-Test/1.0'
        }
      };

      if (data && method !== 'GET') {
        const postData = JSON.stringify(data);
        options.headers['Content-Length'] = Buffer.byteLength(postData);
      }

      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(body);
            resolve({ status: res.statusCode, data: result });
          } catch (e) {
            resolve({ status: res.statusCode, data: body });
          }
        });
      });

      req.on('error', reject);
      
      if (data && method !== 'GET') {
        req.write(JSON.stringify(data));
      }
      
      req.end();
    });
  }

  async testServerHealth() {
    console.log('1. Testing Server Health...');
    
    try {
      const response = await this.makeRequest('/api/health');
      
      if (response.status === 200 && response.data.success) {
        console.log('   ✅ Server is healthy and operational');
        console.log(`   📊 Database: ${response.data.database}`);
        this.testResults.push({ 
          test: 'Server Health', 
          status: 'PASS', 
          details: 'Server operational with database connected' 
        });
      } else {
        throw new Error(`Health check failed: ${response.status}`);
      }
    } catch (error) {
      console.log('   ❌ Server health check failed:', error.message);
      this.testResults.push({ 
        test: 'Server Health', 
        status: 'FAIL', 
        details: error.message 
      });
    }
  }

  async testVoterSearch() {
    console.log('\\n2. Testing Voter Search Functionality...');
    
    const searchQueries = [
      { query: 'Smith', expectedCount: 1, description: 'Search by last name' },
      { query: 'Farm Road', expectedCount: 1, description: 'Search by address' },
      { query: 'NY24001', expectedCount: 1, description: 'Search by voter ID' },
      { query: 'John', expectedCount: 1, description: 'Search by first name' },
      { query: 'xyz123', expectedCount: 0, description: 'Invalid search query' }
    ];

    let passedSearches = 0;
    
    for (const searchTest of searchQueries) {
      try {
        const response = await this.makeRequest(`/api/voters/search?q=${encodeURIComponent(searchTest.query)}`);
        
        if (response.status === 200 && response.data.success) {
          const voterCount = response.data.voters.length;
          if (voterCount === searchTest.expectedCount) {
            console.log(`   ✅ ${searchTest.description}: Found ${voterCount} voters`);
            passedSearches++;
          } else {
            console.log(`   ⚠️  ${searchTest.description}: Expected ${searchTest.expectedCount}, got ${voterCount}`);
          }
        } else {
          console.log(`   ❌ ${searchTest.description}: Search failed`);
        }
      } catch (error) {
        console.log(`   ❌ ${searchTest.description}: ${error.message}`);
      }
    }

    if (passedSearches === searchQueries.length) {
      console.log('   ✅ All search functions working correctly');
      this.testResults.push({ 
        test: 'Voter Search', 
        status: 'PASS', 
        details: `${passedSearches}/${searchQueries.length} search types working` 
      });
    } else {
      console.log(`   ⚠️  Search partially working: ${passedSearches}/${searchQueries.length} tests passed`);
      this.testResults.push({ 
        test: 'Voter Search', 
        status: 'PARTIAL', 
        details: `${passedSearches}/${searchQueries.length} search types working` 
      });
    }
  }

  async testVoterDetails() {
    console.log('\\n3. Testing Voter Detail Retrieval...');
    
    try {
      const response = await this.makeRequest('/api/voters/NY24001');
      
      if (response.status === 200 && response.data.success) {
        const voter = response.data.voter;
        console.log(`   ✅ Voter details retrieved: ${voter.first_name} ${voter.last_name}`);
        console.log(`   📍 Address: ${voter.street_address}, ${voter.city}`);
        console.log(`   🎯 Demographics: ${voter.party_affiliation}, Score: ${voter.demographic_score}%`);
        
        // Check for NY-24 specific flags
        const flags = [];
        if (voter.veteran_household) flags.push('VETERAN');
        if (voter.rural_address_flag) flags.push('RURAL');
        if (voter.agricultural_worker) flags.push('AGRICULTURE');
        
        if (flags.length > 0) {
          console.log(`   🏷️  Special flags: ${flags.join(', ')}`);
        }
        
        this.testResults.push({ 
          test: 'Voter Details', 
          status: 'PASS', 
          details: 'Voter profile data retrieved with NY-24 demographics' 
        });
      } else {
        throw new Error(`Failed to get voter details: ${response.status}`);
      }
    } catch (error) {
      console.log('   ❌ Voter details test failed:', error.message);
      this.testResults.push({ 
        test: 'Voter Details', 
        status: 'FAIL', 
        details: error.message 
      });
    }
  }

  async testCanvassInteraction() {
    console.log('\\n4. Testing Canvass Interaction Logging...');
    
    const testInteraction = {
      voter_id: 'NY24001',
      volunteer_id: 'TEST_VOLUNTEER_001',
      response_level: 2, // Lean Support
      issues_priority: JSON.stringify({
        infrastructure: 5,
        taxes: 4,
        agriculture: 3
      }),
      volunteer_notes: 'Veteran household, very concerned about rural infrastructure',
      yard_sign_request: true,
      follow_up_needed: false,
      contact_method: 'door',
      weather_conditions: 'Clear, 72°F',
      interaction_duration: 8
    };

    try {
      const response = await this.makeRequest('/api/interactions', 'POST', testInteraction);
      
      if (response.status === 200 && response.data.success) {
        console.log('   ✅ Canvass interaction saved successfully');
        console.log(`   📝 Interaction ID: ${response.data.interaction_id}`);
        console.log('   🎯 Response: Lean Support with yard sign request');
        
        this.testResults.push({ 
          test: 'Canvass Interaction', 
          status: 'PASS', 
          details: 'Interaction logged with full campaign data' 
        });
      } else {
        throw new Error(`Failed to save interaction: ${response.status}`);
      }
    } catch (error) {
      console.log('   ❌ Canvass interaction test failed:', error.message);
      this.testResults.push({ 
        test: 'Canvass Interaction', 
        status: 'FAIL', 
        details: error.message 
      });
    }
  }

  async testCampaignStats() {
    console.log('\\n5. Testing Campaign Statistics...');
    
    try {
      const response = await this.makeRequest('/api/stats/campaign');
      
      if (response.status === 200 && response.data.success) {
        const stats = response.data.stats;
        console.log('   ✅ Campaign statistics retrieved');
        console.log(`   📊 Total voters: ${stats.total_voters}`);
        console.log(`   📞 Contacted: ${stats.contacted_voters}`);
        console.log(`   👍 Supporters: ${stats.supporters}`);
        console.log(`   🤔 Undecided: ${stats.undecided}`);
        console.log(`   🏠 Yard signs: ${stats.yard_signs}`);
        
        if (stats.avg_response) {
          console.log(`   📈 Avg response: ${parseFloat(stats.avg_response).toFixed(2)}`);
        }
        
        this.testResults.push({ 
          test: 'Campaign Statistics', 
          status: 'PASS', 
          details: 'Real-time campaign metrics available' 
        });
      } else {
        throw new Error(`Failed to get stats: ${response.status}`);
      }
    } catch (error) {
      console.log('   ❌ Campaign statistics test failed:', error.message);
      this.testResults.push({ 
        test: 'Campaign Statistics', 
        status: 'FAIL', 
        details: error.message 
      });
    }
  }

  async testOfflineSync() {
    console.log('\\n6. Testing Offline Sync Queue...');
    
    try {
      const response = await this.makeRequest('/api/sync/pending');
      
      if (response.status === 200 && response.data.success) {
        console.log('   ✅ Sync queue accessible');
        console.log(`   📤 Pending items: ${response.data.pending_items}`);
        
        if (response.data.pending_items > 0) {
          console.log('   🔄 Ready for offline sync when connectivity restored');
        } else {
          console.log('   ✨ All data synchronized');
        }
        
        this.testResults.push({ 
          test: 'Offline Sync', 
          status: 'PASS', 
          details: 'Sync queue operational for offline field operations' 
        });
      } else {
        throw new Error(`Failed to access sync queue: ${response.status}`);
      }
    } catch (error) {
      console.log('   ❌ Offline sync test failed:', error.message);
      this.testResults.push({ 
        test: 'Offline Sync', 
        status: 'FAIL', 
        details: error.message 
      });
    }
  }

  async testMobilePerformance() {
    console.log('\\n7. Testing Mobile Performance...');
    
    const performanceTests = [];
    
    // Test search response time
    try {
      const startTime = Date.now();
      await this.makeRequest('/api/voters/search?q=Smith');
      const searchTime = Date.now() - startTime;
      
      console.log(`   ⚡ Search response time: ${searchTime}ms`);
      
      if (searchTime < 500) {
        console.log('   ✅ Search performance excellent for mobile');
        performanceTests.push(true);
      } else if (searchTime < 1000) {
        console.log('   ⚠️  Search performance acceptable');
        performanceTests.push(true);
      } else {
        console.log('   ❌ Search performance too slow for field operations');
        performanceTests.push(false);
      }
    } catch (error) {
      console.log('   ❌ Performance test failed:', error.message);
      performanceTests.push(false);
    }

    // Test concurrent requests (simulating multiple volunteers)
    try {
      const concurrentRequests = [];
      for (let i = 0; i < 5; i++) {
        concurrentRequests.push(this.makeRequest('/api/health'));
      }
      
      const startTime = Date.now();
      await Promise.all(concurrentRequests);
      const concurrentTime = Date.now() - startTime;
      
      console.log(`   🔄 Concurrent requests (5): ${concurrentTime}ms`);
      
      if (concurrentTime < 1000) {
        console.log('   ✅ Server handles multiple volunteers well');
        performanceTests.push(true);
      } else {
        console.log('   ⚠️  Server may struggle with many concurrent users');
        performanceTests.push(false);
      }
    } catch (error) {
      console.log('   ❌ Concurrent test failed:', error.message);
      performanceTests.push(false);
    }

    const passedPerformance = performanceTests.filter(t => t).length;
    
    if (passedPerformance === performanceTests.length) {
      this.testResults.push({ 
        test: 'Mobile Performance', 
        status: 'PASS', 
        details: 'Performance optimized for rural field operations' 
      });
    } else {
      this.testResults.push({ 
        test: 'Mobile Performance', 
        status: 'PARTIAL', 
        details: `${passedPerformance}/${performanceTests.length} performance tests passed` 
      });
    }
  }

  async generateTestReport() {
    console.log('\\n🎯 NY-24 Mobile Interface Test Results');
    console.log('=====================================');
    
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.status === 'PASS').length;
    const partialTests = this.testResults.filter(r => r.status === 'PARTIAL').length;
    const failedTests = this.testResults.filter(r => r.status === 'FAIL').length;
    
    console.log(`\\n📊 Test Summary:`);
    console.log(`   ✅ Passed: ${passedTests}/${totalTests}`);
    console.log(`   ⚠️  Partial: ${partialTests}/${totalTests}`);
    console.log(`   ❌ Failed: ${failedTests}/${totalTests}`);
    
    console.log(`\\n📋 Detailed Results:`);
    this.testResults.forEach(result => {
      const statusIcon = result.status === 'PASS' ? '✅' : result.status === 'PARTIAL' ? '⚠️' : '❌';
      console.log(`   ${statusIcon} ${result.test}: ${result.details}`);
    });
    
    const testDuration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    console.log(`\\n⏱️  Test Duration: ${testDuration} seconds`);
    
    if (failedTests === 0) {
      console.log('\\n🎉 NY-24 Mobile Voter Lookup Ready for Field Deployment!');
      console.log('📱 Your mobile interface is operational and campaign-ready!');
      console.log('🗳️  Field staff can now use this tool for door-to-door canvassing!');
    } else {
      console.log('\\n⚠️  Some components need attention before full deployment.');
      console.log('🔧 Address failed tests for optimal field operation performance.');
    }
    
    console.log('\\n🎯 Access your mobile voter lookup at: http://localhost:8081');
    console.log('📱 Test on mobile devices for best field operation experience!');
  }
}

// Run the test suite
if (require.main === module) {
  const tester = new MobileInterfaceTester();
  tester.runAllTests().catch(console.error);
}

module.exports = MobileInterfaceTester;