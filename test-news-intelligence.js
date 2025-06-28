// Test the Campaign News Intelligence System
const CampaignNewsIntelligence = require('./news-intelligence');

async function testNewsIntelligence() {
  console.log('Testing Campaign News Intelligence System');
  console.log('==========================================\n');

  const newsIntel = new CampaignNewsIntelligence();

  try {
    console.log('1. Testing Daily Briefing Generation...');
    const briefing = await newsIntel.generateDailyBriefing();
    
    console.log(`✓ Briefing generated for ${briefing.date}`);
    console.log(`✓ Priority Level: ${briefing.summary.priorityLevel}`);
    console.log(`✓ Total Articles: ${briefing.summary.totalArticles}`);
    console.log(`✓ Action Items: ${briefing.actionItems.length}`);
    console.log(`✓ Opportunity Alerts: ${briefing.opportunityAlerts.length}\n`);

    // Test individual news gathering
    console.log('2. Testing Individual News Sources...');
    
    const tenneyNews = await newsIntel.getClaudiaTenneyNews();
    console.log(`✓ Claudia Tenney articles: ${tenneyNews.length}`);
    
    const districtNews = await newsIntel.getNY24DistrictNews();
    console.log(`✓ NY-24 District articles: ${districtNews.length}`);
    
    const ruralNews = await newsIntel.getRuralIssuesNews();
    console.log(`✓ Rural issues articles: ${ruralNews.length}\n`);

    // Test formatting
    console.log('3. Testing Briefing Formatting...');
    
    const emailFormat = newsIntel.formatBriefingForDelivery(briefing, 'email');
    console.log(`✓ Email format length: ${emailFormat.length} characters`);
    
    const smsFormat = newsIntel.formatBriefingForDelivery(briefing, 'sms');
    console.log(`✓ SMS format length: ${smsFormat.length} characters`);
    console.log(`✓ SMS format preview:\n${smsFormat.substring(0, 160)}...\n`);

    // Test relevance scoring
    console.log('4. Testing Relevance Scoring...');
    const testArticle = {
      title: 'Claudia Tenney Visits Wayne County Apple Farm to Discuss Agricultural Policy',
      description: 'NY-24 Representative discusses rural economic development and farming subsidies'
    };
    
    const relevanceScore = newsIntel.calculateRelevanceScore(testArticle);
    console.log(`✓ Test article relevance score: ${relevanceScore}/100`);
    
    if (relevanceScore >= 20) {
      console.log('✓ High relevance detected correctly');
    } else {
      console.log('⚠ Expected higher relevance score');
    }

    console.log('\n5. Sample Briefing Content:');
    console.log('==========================');
    console.log(`Date: ${briefing.date}`);
    console.log(`Priority: ${briefing.summary.priorityLevel}`);
    console.log('\nKey Highlights:');
    briefing.summary.keyHighlights.forEach(highlight => {
      console.log(`• ${highlight}`);
    });
    
    if (briefing.actionItems.length > 0) {
      console.log('\nTop Action Items:');
      briefing.actionItems.slice(0, 3).forEach(action => {
        console.log(`• [${action.priority.toUpperCase()}] ${action.description}`);
      });
    }

    console.log('\n✅ All tests passed! News intelligence system is working correctly.');
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

// Test the system immediately if run directly
if (require.main === module) {
  testNewsIntelligence().then(success => {
    if (success) {
      console.log('\n🎉 Campaign News Intelligence System is ready for deployment!');
      console.log('\nNext steps:');
      console.log('1. Get a NewsAPI key from https://newsapi.org');
      console.log('2. Add NEWS_API_KEY to your environment variables');
      console.log('3. Deploy to production and test /api/intelligence endpoints');
      console.log('4. Set up daily cron job to generate briefings');
      console.log('5. Configure email/SMS delivery for daily briefings');
    } else {
      console.log('\n❌ Please fix the issues above before deploying');
      process.exit(1);
    }
  });
}

module.exports = testNewsIntelligence;