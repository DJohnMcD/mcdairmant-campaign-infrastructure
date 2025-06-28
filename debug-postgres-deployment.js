#!/usr/bin/env node

const MCPStructuredThinkingClient = require('./mcp-client');

async function debugPostgreSQLDeployment() {
  console.log('🔍 Using MCP Sequential Thinking to Debug PostgreSQL Deployment Issue\n');
  
  const client = new MCPStructuredThinkingClient();
  
  try {
    // Connect to MCP server
    console.log('Connecting to MCP Sequential Thinking server...');
    const connected = await client.connect();
    
    if (!connected) {
      console.log('❌ MCP server not available - proceeding with baseline debugging\n');
      console.log('BASELINE DEBUGGING APPROACH:');
      console.log('1. Check if DATABASE_URL is set');
      console.log('2. Verify PostgreSQL connection string format');
      console.log('3. Test network connectivity');
      console.log('4. Check SSL configuration');
      console.log('5. Review Render deployment logs\n');
      return;
    }
    
    console.log('✅ Connected to MCP server\n');
    
    // Define the problem for sequential thinking analysis
    const problemDescription = `
Campaign infrastructure deployment shows ECONNREFUSED 127.0.0.1:5432 errors in logs, but PostgreSQL database was created in Render and DATABASE_URL should be set. The app shows invitation-only registration error (meaning it's running), but can't connect to database.

Key facts:
- App is running (login screen visible)
- Database connection fails with ECONNREFUSED 127.0.0.1:5432
- PostgreSQL was created in Render cloud platform
- DATABASE_URL environment variable should be set
- App should auto-detect PostgreSQL vs SQLite based on DATABASE_URL
- Missing debug logs from database.js initialization

Database detection logic:
const databaseUrl = process.env.DATABASE_URL || 'sqlite:./personal_ai.db';
if (databaseUrl && (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://'))) {
  this.initializePostgres(databaseUrl);
} else {
  this.initializeSQLite(databaseUrl);
}

Error indicates connection attempt to 127.0.0.1:5432 (localhost PostgreSQL), suggesting DATABASE_URL might not be properly set or the connection is falling back to default local settings.
`;

    // Use sequential thinking to analyze the problem
    console.log('🧠 Applying Sequential Thinking Analysis...\n');
    
    // Perform sequential thinking analysis step by step
    const thoughts = [
      "Analyze the ECONNREFUSED 127.0.0.1:5432 error - this indicates the app is trying to connect to localhost PostgreSQL instead of the Render cloud database",
      "Examine why DATABASE_URL environment variable detection might be failing - check if it's properly set in Render deployment environment",
      "Review the database initialization logic in database.js - verify the PostgreSQL vs SQLite detection is working correctly",
      "Consider SSL configuration issues - Render PostgreSQL requires SSL in production but the connection might be falling back to insecure local connection",
      "Investigate missing debug logs from database.js initialization - add more logging to trace the exact path taken during database setup",
      "Determine root cause and provide specific fix - likely DATABASE_URL not properly propagated to runtime environment or connection string format issue"
    ];
    
    console.log('STEP-BY-STEP SEQUENTIAL THINKING ANALYSIS:');
    console.log('=' .repeat(50));
    
    for (let i = 0; i < thoughts.length; i++) {
      try {
        const analysisResult = await client.callTool('sequentialthinking', {
          thought: thoughts[i],
          thoughtNumber: i + 1,
          totalThoughts: thoughts.length,
          nextThoughtNeeded: i < thoughts.length - 1
        });
        
        if (analysisResult && analysisResult.content) {
          const content = Array.isArray(analysisResult.content) 
            ? analysisResult.content.map(c => c.text || c).join('\n')
            : analysisResult.content.text || analysisResult.content;
          
          console.log(`\nStep ${i + 1}/${thoughts.length}: ${thoughts[i]}\n`);
          console.log('Sequential Analysis:', content);
          console.log('-'.repeat(50));
        }
      } catch (error) {
        console.log(`Step ${i + 1} failed:`, error.message);
      }
    }
    
    // Generate follow-up analysis for actionable steps
    console.log('\n🛠️ FOLLOW-UP ANALYSIS FOR ACTIONABLE STEPS:\n');
    
    const followUpThoughts = [
      "Immediate action: Add comprehensive logging to database.js to trace DATABASE_URL value and detection logic execution path",
      "Environment verification: Check Render dashboard to confirm DATABASE_URL environment variable is properly set and accessible to the application",
      "Connection string validation: Verify the PostgreSQL connection string format matches expected patterns (postgresql:// or postgres://)",
      "SSL troubleshooting: Ensure SSL configuration in PostgreSQL pool matches Render's requirements (rejectUnauthorized: false for production)",
      "Dependency check: Confirm 'pg' package is properly installed and available in the deployment environment",
      "Root cause resolution: Most likely DATABASE_URL is undefined/empty, causing fallback to SQLite path which then fails in production environment"
    ];
    
    for (let i = 0; i < followUpThoughts.length; i++) {
      try {
        const followUpAnalysis = await client.callTool('sequentialthinking', {
          thought: followUpThoughts[i],
          thoughtNumber: i + 1,
          totalThoughts: followUpThoughts.length,
          nextThoughtNeeded: i < followUpThoughts.length - 1
        });
        
        if (followUpAnalysis && followUpAnalysis.content) {
          const stepsContent = Array.isArray(followUpAnalysis.content) 
            ? followUpAnalysis.content.map(c => c.text || c).join('\n')
            : followUpAnalysis.content.text || followUpAnalysis.content;
          
          console.log(`\nAction ${i + 1}/${followUpThoughts.length}: ${followUpThoughts[i]}\n`);
          console.log('Strategic Recommendation:', stepsContent);
          console.log('-'.repeat(50));
        }
      } catch (error) {
        console.log(`Action ${i + 1} failed:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ MCP analysis failed:', error.message);
    console.log('\nFalling back to baseline debugging approach...\n');
    
    // Baseline debugging without MCP
    console.log('BASELINE DEBUGGING CHECKLIST:');
    console.log('1. ☐ Verify DATABASE_URL environment variable is set in Render');
    console.log('2. ☐ Check Render dashboard for PostgreSQL connection string');
    console.log('3. ☐ Verify connection string format (postgresql:// or postgres://)');
    console.log('4. ☐ Test SSL configuration (production vs development)');
    console.log('5. ☐ Check if pg npm package is installed');
    console.log('6. ☐ Review server startup logs for database initialization messages');
    console.log('7. ☐ Test database connection manually using psql or database client');
    console.log('8. ☐ Verify network access from Render to PostgreSQL instance');
  } finally {
    if (client.isConnected) {
      await client.disconnect();
    }
  }
}

// Additional debugging utilities
function generateDebugCommands() {
  console.log('\n🔧 DEBUGGING COMMANDS TO RUN:\n');
  console.log('# Check environment variables in deployment:');
  console.log('echo $DATABASE_URL');
  console.log('');
  console.log('# Test PostgreSQL connection manually:');
  console.log('psql $DATABASE_URL -c "SELECT version();"');
  console.log('');
  console.log('# Check Node.js dependencies:');
  console.log('npm list pg');
  console.log('');
  console.log('# Add debugging to database.js initialization:');
  console.log('console.log("DATABASE_URL:", process.env.DATABASE_URL);');
  console.log('console.log("Detection result:", databaseUrl.startsWith("postgresql://"));');
}

if (require.main === module) {
  debugPostgreSQLDeployment().then(() => {
    generateDebugCommands();
  });
}

module.exports = debugPostgreSQLDeployment;