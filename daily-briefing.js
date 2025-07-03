#!/usr/bin/env node

// Simple Daily Briefing Generator
// Run: node daily-briefing.js
// Creates: DAILY-BRIEFING.md

const fs = require('fs');
const path = require('path');
const CampaignNewsIntelligence = require('./news-intelligence');
const EnhancedCampaignNewsIntelligence = require('./enhanced-news-intelligence');

async function generateDailyBriefing() {
  console.log('🗞️  Generating Daily Campaign Briefing...');
  
  try {
    // Check if we should use enhanced system (with real data) or basic system
    require('dotenv').config();
    const useEnhanced = process.env.NEWS_API_KEY && !process.env.NEWS_API_KEY.includes('your-newsapi-key');
    
    // Initialize appropriate news intelligence system
    const newsIntelligence = useEnhanced 
      ? new EnhancedCampaignNewsIntelligence()
      : new CampaignNewsIntelligence();
    
    if (useEnhanced) {
      console.log('🔴 Using ENHANCED system with real news data');
    } else {
      console.log('🟡 Using basic system with mock data (set NEWS_API_KEY for real data)');
    }
    
    // Generate briefing data
    console.log('📊 Gathering intelligence...');
    const briefing = await newsIntelligence.generateDailyBriefing();
    
    // Generate markdown content
    console.log('📝 Formatting briefing...');
    const markdown = generateMarkdown(briefing);
    
    // Write to file
    const filePath = path.join(__dirname, 'DAILY-BRIEFING.md');
    fs.writeFileSync(filePath, markdown, 'utf8');
    
    console.log(`✅ Daily briefing generated: ${filePath}`);
    console.log(`📖 Open DAILY-BRIEFING.md to read your briefing`);
    console.log(`\n📊 Summary:`);
    console.log(`   Date: ${briefing.date}`);
    console.log(`   Priority: ${briefing.summary.priorityLevel}`);
    console.log(`   Articles: ${briefing.summary.totalArticles}`);
    console.log(`   Action Items: ${briefing.actionItems?.length || 0}`);
    
    const internationalCount = briefing.sections.internationalNews?.articles?.length || 0;
    const africanCount = briefing.sections.africanNews?.articles?.length || 0;
    console.log(`   International: ${internationalCount} articles`);
    console.log(`   African: ${africanCount} articles (min 1 daily ✓)`);
    
    if (briefing.dailyApiCalls) {
      console.log(`   API Calls Used: ${briefing.dailyApiCalls}/900 daily limit`);
    }
    
  } catch (error) {
    console.error('❌ Error generating briefing:', error.message);
    process.exit(1);
  }
}

function generateMarkdown(briefing) {
  const date = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  let markdown = `# 🗞️ Daily Campaign Intelligence Briefing

**${date}**  
**Priority Level: ${briefing.summary.priorityLevel}**  
**Articles Analyzed: ${briefing.summary.totalArticles}**

---

## 📋 Executive Summary

`;

  // Add key highlights
  briefing.summary.keyHighlights.forEach(highlight => {
    markdown += `• ${highlight}\n`;
  });

  // Add action items if present
  if (briefing.actionItems && briefing.actionItems.length > 0) {
    markdown += `\n---\n\n## ⚡ Priority Action Items\n\n`;
    briefing.actionItems.forEach(action => {
      const priority = action.priority.toUpperCase();
      const emoji = priority === 'HIGH' ? '🔴' : priority === 'MEDIUM' ? '🟡' : '🟢';
      markdown += `${emoji} **[${priority}]** ${action.description}\n`;
      if (action.dueDate) {
        markdown += `   📅 Due: ${new Date(action.dueDate).toLocaleDateString()}\n`;
      }
      markdown += `\n`;
    });
  }

  // Add news sections
  markdown += `\n---\n\n## 📰 News Coverage\n\n`;

  // Define section order and emojis (new 5-category structure)
  const sections = [
    { key: 'ny24District', emoji: '🏛️', title: 'NY-24 District (25%)', weight: 25 },
    { key: 'nyStatePolitics', emoji: '🗽', title: 'New York State (20%)', weight: 20 },
    { key: 'nationalPolitics', emoji: '🇺🇸', title: 'National Politics (30%)', weight: 30 },
    { key: 'internationalNews', emoji: '🌍', title: 'International (15%)', weight: 15 },
    { key: 'africanNews', emoji: '🌍', title: 'Africa Focus (10%)', weight: 10 }
  ];

  // Add category insights if available
  if (briefing.categoryInsights) {
    markdown += `## 🧠 Strategic Insights\n\n`;
    sections.forEach(({ key, emoji, title }) => {
      const insight = briefing.categoryInsights[key];
      if (insight && briefing.sections[key]?.articles?.length > 0) {
        markdown += `**${emoji} ${title}**: ${insight}\n\n`;
      }
    });
    markdown += `---\n\n`;
  }

  sections.forEach(({ key, emoji, title, weight }) => {
    const section = briefing.sections[key];
    if (section && section.articles && section.articles.length > 0) {
      markdown += `### ${emoji} ${title}\n\n`;
      
      // Show strategic insight for this category
      if (briefing.categoryInsights && briefing.categoryInsights[key]) {
        markdown += `*Strategic Focus: ${briefing.categoryInsights[key]}*\n\n`;
      }
      
      // Show top 3 articles with enhanced formatting
      section.articles.slice(0, 3).forEach((article, index) => {
        markdown += `**${index + 1}. ${article.title}**\n`;
        
        // Enhanced source information
        const sourceInfo = article.source || 'Unknown Source';
        const publishDate = new Date(article.publishedAt).toLocaleDateString();
        markdown += `*${sourceInfo} • ${publishDate}*\n`;
        
        // Premium source indicator
        const premiumSources = ['nytimes.com', 'wsj.com', 'washingtonpost.com', 'theatlantic.com', 'ft.com'];
        if (article.url && premiumSources.some(domain => article.url.includes(domain))) {
          markdown += `*🏆 Premium Source*\n`;
        }
        
        // Add enhanced metadata if available
        if (article.relevanceScore && article.relevanceScore > 50) {
          markdown += `*Campaign Relevance: ${article.relevanceScore}/100*\n`;
        }
        if (article.campaignImpact && article.campaignImpact === 'high') {
          markdown += `*🔴 High Campaign Impact*\n`;
        }
        if (article.oppositionValue && article.oppositionValue === 'high') {
          markdown += `*📊 High Opposition Research Value*\n`;
        }
        
        if (article.description) {
          const desc = article.description.length > 150 
            ? article.description.substring(0, 150) + '...'
            : article.description;
          markdown += `${desc}\n`;
        }
        markdown += `[Read more](${article.url})\n\n`;
      });
      
      if (section.articles.length > 3) {
        markdown += `*... and ${section.articles.length - 3} more articles in this category*\n\n`;
      }
    }
  });

  // Add opportunity alerts if present
  if (briefing.opportunityAlerts && briefing.opportunityAlerts.length > 0) {
    markdown += `---\n\n## 🎯 Opportunity Alerts\n\n`;
    briefing.opportunityAlerts.forEach(opportunity => {
      markdown += `**${opportunity.type.toUpperCase()}**: ${opportunity.description}\n`;
      if (opportunity.source) {
        markdown += `*Source: ${opportunity.source}*\n`;
      }
      markdown += `\n`;
    });
  }

  // Add footer
  markdown += `---\n\n## 📱 Quick Actions\n\n`;
  markdown += `• **Regenerate**: \`node daily-briefing.js\`\n`;
  markdown += `• **View Dashboard**: Open browser to campaign dashboard\n`;
  markdown += `• **Agent Chat**: Use campaign AI agents for analysis\n`;
  markdown += `\n`;
  
  markdown += `---\n\n`;
  markdown += `*Generated on ${new Date(briefing.generatedAt).toLocaleString()}*  \n`;
  markdown += `*NY-24 Congressional Campaign 2026 Intelligence System*\n`;

  return markdown;
}

// Run if called directly
if (require.main === module) {
  generateDailyBriefing().catch(console.error);
}

module.exports = generateDailyBriefing;