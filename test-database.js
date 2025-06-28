// Test database connectivity for both SQLite and PostgreSQL
const CampaignDatabase = require('./database');

async function testDatabase() {
  console.log('🧪 Testing Campaign Database Abstraction...');
  
  try {
    const db = new CampaignDatabase();
    console.log('✅ Database initialized successfully');
    
    // Test basic query
    const result = await db.query('SELECT 1 as test');
    console.log('✅ Query test passed:', result);
    
    // Test user table
    const users = await db.query('SELECT COUNT(*) as count FROM users');
    console.log('✅ Users table accessible, count:', users[0]?.count || users.count);
    
    await db.close();
    console.log('✅ Database connection closed');
    console.log('🎉 All database tests passed!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  testDatabase();
}

module.exports = testDatabase;