#!/usr/bin/env node

// Setup Real News API Integration
// This script helps you get started with real news data

const fs = require('fs');
const path = require('path');

async function setupNewsAPI() {
  console.log('🗞️  Setting up Real News Integration');
  console.log('=====================================\n');

  // Check for existing .env file
  const envPath = path.join(__dirname, '.env');
  const envExamplePath = path.join(__dirname, '.env.example');
  
  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
      console.log('📝 Creating .env file from template...');
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ .env file created');
    } else {
      console.log('⚠️  No .env.example found, creating basic .env file...');
      fs.writeFileSync(envPath, 'NEWS_API_KEY=your-newsapi-key-here\n');
    }
  }

  console.log('\n🔑 To get real news data, you need a NewsAPI key:');
  console.log('');
  console.log('1. Go to: https://newsapi.org/register');
  console.log('2. Register for free (1,000 requests/day)');
  console.log('3. Copy your API key');
  console.log('4. Add it to .env file: NEWS_API_KEY=your-actual-key');
  console.log('');
  console.log('📁 Your .env file location:', envPath);
  console.log('');
  
  // Test if API key is already configured
  require('dotenv').config();
  const apiKey = process.env.NEWS_API_KEY;
  
  if (apiKey && apiKey !== 'your-newsapi-key-here' && apiKey !== 'your-newsapi-key-from-newsapi.org') {
    console.log('✅ API key detected in environment');
    console.log('🧪 Testing API connection...');
    
    try {
      const testResult = await testNewsAPI(apiKey);
      if (testResult.success) {
        console.log('✅ NewsAPI connection successful!');
        console.log(`📊 ${testResult.totalResults} articles available`);
        console.log('🚀 Ready to generate real briefings!');
        console.log('');
        console.log('Run: node daily-briefing.js');
      } else {
        console.log('❌ API test failed:', testResult.error);
      }
    } catch (error) {
      console.log('❌ Error testing API:', error.message);
    }
  } else {
    console.log('⏳ Waiting for API key configuration...');
    console.log('');
    console.log('After adding your key, run: node setup-real-news.js');
  }
}

async function testNewsAPI(apiKey) {
  const https = require('https');
  
  return new Promise((resolve) => {
    const testUrl = `https://newsapi.org/v2/top-headlines?country=us&pageSize=1&apiKey=${apiKey}`;
    
    https.get(testUrl, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.status === 'ok') {
            resolve({ 
              success: true, 
              totalResults: response.totalResults 
            });
          } else {
            resolve({ 
              success: false, 
              error: response.message || 'Unknown error' 
            });
          }
        } catch (error) {
          resolve({ 
            success: false, 
            error: 'Invalid response format' 
          });
        }
      });
    }).on('error', (error) => {
      resolve({ 
        success: false, 
        error: error.message 
      });
    });
  });
}

// Run setup
if (require.main === module) {
  setupNewsAPI().catch(console.error);
}

module.exports = setupNewsAPI;