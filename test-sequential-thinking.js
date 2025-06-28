#!/usr/bin/env node

const MCPStructuredThinkingClient = require('./mcp-client');

async function testSequentialThinking() {
  console.log('🧠 Testing Sequential Thinking Capabilities...\n');
  
  const client = new MCPStructuredThinkingClient();
  
  try {
    // Connect to MCP server
    console.log('Connecting to sequential thinking server...');
    await client.connect();
    console.log('✅ Connected successfully\n');
    
    // Check available tools
    console.log('🔍 Available tools:');
    const tools = await client.getTools();
    console.log(tools);
    console.log('\n');
    
    // Test 1: Complex debugging scenario
    console.log('📋 Test 1: Database Connection Debugging');
    console.log('=' .repeat(50));
    
    const debuggingProblem = {
      problem: "Campaign infrastructure deployment shows ECONNREFUSED 127.0.0.1:5432 errors in logs, but PostgreSQL database was created in Render and DATABASE_URL should be set. The app shows invitation-only registration error (meaning it's running), but can't connect to database.",
      context: {
        environment: "Render cloud platform",
        database: "PostgreSQL 16",
        logs: "ECONNREFUSED 127.0.0.1:5432, missing debug logs from database.js",
        status: "App running, login screen visible, but database connection failing"
      }
    };
    
    const analysis = await client.callTool('sequentialthinking', {
      thought: `Let me debug this deployment issue systematically. The problem is: Campaign infrastructure shows ECONNREFUSED 127.0.0.1:5432 but PostgreSQL was created in Render. App shows invitation screen (so it's running) but database connection fails. I need to identify the root cause.`,
      nextThoughtNeeded: true,
      thoughtNumber: 1,
      totalThoughts: 5,
      isRevision: false
    });
    
    console.log('Sequential Thinking Analysis:');
    console.log(analysis);
    console.log('\n');
    
    // Test 2: Architecture decision
    console.log('📋 Test 2: Database Architecture Decision');
    console.log('=' .repeat(50));
    
    const architectureProblem = {
      problem: "Choose optimal database setup for campaign infrastructure that needs to handle local development, cloud deployment, FEC compliance, and campaign data security",
      constraints: [
        "Must work locally with SQLite for development",
        "Must scale to PostgreSQL for cloud deployment", 
        "Must support real-time FEC compliance monitoring",
        "Must maintain data privacy boundaries between AI agents",
        "Must be cost-effective for political campaign budget"
      ]
    };
    
    const architectureAnalysis = await client.callTool('sequentialthinking', {
      thought: `I need to analyze database architecture options for a campaign infrastructure. Requirements: SQLite for local dev, PostgreSQL for cloud, FEC compliance, agent privacy boundaries, cost-effective for political campaigns. Let me evaluate each option systematically.`,
      nextThoughtNeeded: true,
      thoughtNumber: 1,
      totalThoughts: 4,
      isRevision: false
    });
    
    console.log('Architecture Analysis:');
    console.log(architectureAnalysis);
    
    await client.disconnect();
    console.log('\n✅ Sequential thinking tests completed');
    
  } catch (error) {
    console.error('❌ Error during sequential thinking test:', error.message);
    if (client.isConnected) {
      await client.disconnect();
    }
  }
}

// Run if called directly
if (require.main === module) {
  testSequentialThinking().catch(console.error);
}

module.exports = testSequentialThinking;