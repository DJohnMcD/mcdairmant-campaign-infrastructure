#!/usr/bin/env node

// Test Real News Integration System
const EnhancedCampaignNewsIntelligence = require('./enhanced-news-intelligence');

async function testRealNewsSystem() {
  console.log('🧪 Testing Enhanced News Intelligence System');
  console.log('=============================================\n');

  try {
    // Initialize enhanced system
    const newsIntelligence = new EnhancedCampaignNewsIntelligence();
    
    // Check API configuration
    require('dotenv').config();
    const hasApiKey = process.env.NEWS_API_KEY && !process.env.NEWS_API_KEY.includes('your-newsapi-key');
    
    console.log('🔧 System Configuration:');
    console.log(`   API Key Configured: ${hasApiKey ? '✅ YES' : '❌ NO (using mock data)'}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('');

    // Test 1: Generate comprehensive briefing
    console.log('📊 Test 1: Comprehensive Briefing Generation');
    console.log('----------------------------------------------');
    
    const startTime = Date.now();
    const briefing = await newsIntelligence.generateDailyBriefing();
    const endTime = Date.now();
    
    console.log(`✅ Briefing generated in ${endTime - startTime}ms`);
    console.log(`📅 Date: ${briefing.date}`);
    console.log(`📊 Priority Level: ${briefing.summary.priorityLevel}`);
    console.log(`📰 Total Articles: ${briefing.summary.totalArticles}`);
    console.log(`⚡ Action Items: ${briefing.actionItems?.length || 0}`);
    console.log(`🎯 Opportunities: ${briefing.opportunityAlerts?.length || 0}`);
    
    if (briefing.dailyApiCalls !== undefined) {
      console.log(`🌐 API Calls Used: ${briefing.dailyApiCalls}/900`);
    }
    console.log('');

    // Test 2: Section Analysis
    console.log('📰 Test 2: News Section Analysis');
    console.log('----------------------------------');
    
    const sections = Object.entries(briefing.sections);
    let totalSectionArticles = 0;
    
    sections.forEach(([key, section]) => {
      if (section && section.articles && section.articles.length > 0) {
        console.log(`   ${section.title}: ${section.articles.length} articles`);
        totalSectionArticles += section.articles.length;
        
        // Show top article from each section
        const topArticle = section.articles[0];
        if (topArticle) {
          console.log(`      Top: "${topArticle.title.substring(0, 60)}..."`);
          if (topArticle.relevanceScore) {
            console.log(`      Relevance: ${topArticle.relevanceScore}/100`);
          }
        }
      }
    });
    
    console.log(`   Total Section Articles: ${totalSectionArticles}`);
    console.log('');

    // Test 3: International & African Coverage Validation
    console.log('🌍 Test 3: International Coverage Validation');
    console.log('---------------------------------------------');
    
    const internationalNews = briefing.sections.internationalNews?.articles || [];
    const africanNews = briefing.sections.africanNews?.articles || [];
    const usAfricaRelations = briefing.sections.usAfricaRelations?.articles || [];
    
    console.log(`   International News: ${internationalNews.length} articles`);
    console.log(`   African Continent: ${africanNews.length} articles`);
    console.log(`   US-Africa Relations: ${usAfricaRelations.length} articles`);
    console.log(`   ✅ African Minimum Met: ${africanNews.length >= 1 ? 'YES' : 'NO'}`);
    
    // Show African news details
    if (africanNews.length > 0) {
      console.log('   African Coverage Examples:');
      africanNews.slice(0, 2).forEach((article, i) => {
        console.log(`      ${i + 1}. ${article.title.substring(0, 50)}...`);
        if (article.africanRegion) {
          console.log(`         Region: ${article.africanRegion}`);
        }
      });
    }
    console.log('');

    // Test 4: Opposition Research Analysis
    console.log('👀 Test 4: Opposition Research Analysis');
    console.log('---------------------------------------');
    
    const claudiaTenneyNews = briefing.sections.claudiaTenney?.articles || [];
    console.log(`   Claudia Tenney Articles: ${claudiaTenneyNews.length}`);
    
    if (claudiaTenneyNews.length > 0) {
      const highValueArticles = claudiaTenneyNews.filter(a => a.oppositionValue === 'high');
      console.log(`   High Opposition Value: ${highValueArticles.length} articles`);
      
      // Show example
      if (claudiaTenneyNews[0]) {
        const example = claudiaTenneyNews[0];
        console.log(`   Example: "${example.title.substring(0, 60)}..."`);
        if (example.oppositionValue) {
          console.log(`   Research Value: ${example.oppositionValue}`);
        }
      }
    }
    console.log('');

    // Test 5: Local NY-24 Coverage
    console.log('🏛️ Test 5: Local NY-24 Coverage Analysis');
    console.log('------------------------------------------');
    
    const ny24District = briefing.sections.ny24District?.articles || [];
    const syracuseLocal = briefing.sections.syracuseLocal?.articles || [];
    
    console.log(`   NY-24 District News: ${ny24District.length} articles`);
    console.log(`   Syracuse Local News: ${syracuseLocal.length} articles`);
    
    const localTotal = ny24District.length + syracuseLocal.length;
    console.log(`   Total Local Coverage: ${localTotal} articles`);
    
    if (localTotal > 0) {
      const allLocal = [...ny24District, ...syracuseLocal];
      const highRelevance = allLocal.filter(a => a.localRelevance && a.localRelevance > 50);
      console.log(`   High Local Relevance: ${highRelevance.length} articles`);
    }
    console.log('');

    // Test 6: Action Items Quality
    console.log('⚡ Test 6: Action Items Analysis');
    console.log('--------------------------------');
    
    const actionItems = briefing.actionItems || [];
    console.log(`   Total Action Items: ${actionItems.length}`);
    
    if (actionItems.length > 0) {
      const priorities = {
        high: actionItems.filter(a => a.priority === 'high').length,
        medium: actionItems.filter(a => a.priority === 'medium').length,
        low: actionItems.filter(a => a.priority === 'low').length
      };
      
      console.log(`   High Priority: ${priorities.high}`);
      console.log(`   Medium Priority: ${priorities.medium}`);
      console.log(`   Low Priority: ${priorities.low}`);
      
      // Show examples
      console.log('   Examples:');
      actionItems.slice(0, 2).forEach((item, i) => {
        console.log(`      ${i + 1}. [${item.priority.toUpperCase()}] ${item.description.substring(0, 60)}...`);
      });
    }
    console.log('');

    // Test 7: System Performance & Optimization
    console.log('🚀 Test 7: System Performance Analysis');
    console.log('--------------------------------------');
    
    const performanceMetrics = {
      generationTime: endTime - startTime,
      sectionsGenerated: sections.length,
      articlesProcessed: briefing.summary.totalArticles,
      apiCallsUsed: briefing.dailyApiCalls || 0
    };
    
    console.log(`   Generation Time: ${performanceMetrics.generationTime}ms`);
    console.log(`   Sections Generated: ${performanceMetrics.sectionsGenerated}`);
    console.log(`   Articles Processed: ${performanceMetrics.articlesProcessed}`);
    console.log(`   API Efficiency: ${performanceMetrics.apiCallsUsed} calls used`);
    
    // Performance assessment
    const isEfficient = performanceMetrics.generationTime < 30000; // Under 30 seconds
    const isComprehensive = performanceMetrics.articlesProcessed > 20;
    const isApiEfficient = performanceMetrics.apiCallsUsed < 100;
    
    console.log(`   ✅ Speed Efficient: ${isEfficient ? 'YES' : 'NO'}`);
    console.log(`   ✅ Comprehensive: ${isComprehensive ? 'YES' : 'NO'}`);
    console.log(`   ✅ API Efficient: ${isApiEfficient ? 'YES' : 'NO'}`);
    console.log('');

    // Final Assessment
    console.log('🎯 FINAL ASSESSMENT');
    console.log('===================');
    
    const checks = [
      { name: 'Basic Generation', passed: briefing.date && briefing.summary },
      { name: 'African Coverage', passed: africanNews.length >= 1 },
      { name: 'Opposition Research', passed: claudiaTenneyNews.length > 0 },
      { name: 'Local Coverage', passed: localTotal > 0 },
      { name: 'Action Items', passed: actionItems.length > 0 },
      { name: 'Performance', passed: isEfficient },
      { name: 'API Efficiency', passed: isApiEfficient || !hasApiKey }
    ];
    
    const passedChecks = checks.filter(c => c.passed).length;
    const totalChecks = checks.length;
    
    checks.forEach(check => {
      console.log(`   ${check.passed ? '✅' : '❌'} ${check.name}`);
    });
    
    console.log('');
    console.log(`📊 Overall Score: ${passedChecks}/${totalChecks} (${Math.round(passedChecks/totalChecks*100)}%)`);
    
    if (passedChecks === totalChecks) {
      console.log('🎉 ALL TESTS PASSED! System ready for production use.');
    } else if (passedChecks >= totalChecks * 0.8) {
      console.log('✅ Most tests passed. System functional with minor issues.');
    } else {
      console.log('⚠️  Some tests failed. Review configuration and try again.');
    }
    
    console.log('');
    console.log('📝 Next Steps:');
    if (!hasApiKey) {
      console.log('   1. Get NewsAPI key from https://newsapi.org');
      console.log('   2. Add to .env file: NEWS_API_KEY=your-key');
      console.log('   3. Run test again for live data');
    } else {
      console.log('   1. Run: node daily-briefing.js');
      console.log('   2. Review generated DAILY-BRIEFING.md');
      console.log('   3. System ready for daily use!');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
if (require.main === module) {
  testRealNewsSystem().catch(console.error);
}

module.exports = testRealNewsSystem;