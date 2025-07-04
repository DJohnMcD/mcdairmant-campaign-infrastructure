#!/usr/bin/env node

// Test NewsAPI Key Validity
const https = require('https');

async function testNewsAPIKey() {
  console.log('🔑 Testing NewsAPI Key Validity');
  console.log('================================\n');

  // Load environment
  require('dotenv').config();
  const apiKey = process.env.NEWS_API_KEY;

  console.log(`API Key Found: ${apiKey ? 'YES' : 'NO'}`);
  if (apiKey) {
    console.log(`API Key: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
  }
  console.log('');

  if (!apiKey || apiKey.includes('your-newsapi-key')) {
    console.log('❌ No valid API key found');
    console.log('🔧 Get one from: https://newsapi.org/register');
    return;
  }

  // Test API with simple query
  console.log('🧪 Testing API connectivity...');
  
  try {
    const result = await makeTestAPICall(apiKey);
    
    if (result.success) {
      console.log('✅ API Key is VALID');
      console.log(`📊 Total results available: ${result.totalResults}`);
      console.log(`📰 Sample article: "${result.sampleTitle}"`);
      console.log(`🌐 Source: ${result.sampleSource}`);
      console.log('');
      console.log('🎉 API is working correctly! System should use real data.');
    } else {
      console.log('❌ API Key FAILED');
      console.log(`💥 Error: ${result.error}`);
      console.log('');
      console.log('🔧 Check your API key or try a new one from https://newsapi.org');
    }
  } catch (error) {
    console.log('❌ Network error testing API');
    console.log(`💥 Error: ${error.message}`);
  }
}

function makeTestAPICall(apiKey) {
  return new Promise((resolve) => {
    const testUrl = `https://newsapi.org/v2/top-headlines?country=us&pageSize=1&apiKey=${apiKey}`;
    
    const options = {
      headers: {
        'User-Agent': 'NY-24-Campaign-Intelligence/1.0 (https://github.com/campaign/news-intel)'
      }
    };
    
    https.get(testUrl, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (response.status === 'ok') {
            const article = response.articles[0];
            resolve({
              success: true,
              totalResults: response.totalResults,
              sampleTitle: article ? article.title : 'No articles',
              sampleSource: article ? article.source.name : 'Unknown'
            });
          } else {
            resolve({
              success: false,
              error: response.message || response.code || 'Unknown API error'
            });
          }
        } catch (error) {
          resolve({
            success: false,
            error: 'Invalid JSON response from API'
          });
        }
      });
    }).on('error', (error) => {
      resolve({
        success: false,
        error: `Network error: ${error.message}`
      });
    });
  });
}

// Run the test
if (require.main === module) {
  testNewsAPIKey().catch(console.error);
}

module.exports = testNewsAPIKey;