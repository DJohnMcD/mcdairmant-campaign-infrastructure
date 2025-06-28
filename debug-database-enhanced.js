// Enhanced database debugging for PostgreSQL deployment issues
// Based on MCP Sequential Thinking analysis

const fs = require('fs');
const path = require('path');

class CampaignDatabaseDebug {
  constructor() {
    this.db = null;
    this.isPostgres = false;
    this.debugMode = true; // Enable comprehensive logging
    this.initialize();
  }

  initialize() {
    console.log('🔍 === ENHANCED DATABASE DEBUGGING INITIALIZATION ===');
    
    // Step 1: Environment variable analysis
    const databaseUrl = process.env.DATABASE_URL;
    const nodeEnv = process.env.NODE_ENV;
    
    console.log('🔍 Environment Analysis:');
    console.log('  - NODE_ENV:', nodeEnv || 'undefined');
    console.log('  - DATABASE_URL defined:', !!databaseUrl);
    console.log('  - DATABASE_URL type:', typeof databaseUrl);
    console.log('  - DATABASE_URL length:', databaseUrl ? databaseUrl.length : 0);
    
    if (databaseUrl) {
      // Safely log URL without exposing credentials
      const safeUrl = databaseUrl.replace(/:[^:@]*@/, ':***@');
      console.log('  - DATABASE_URL (safe):', safeUrl);
      console.log('  - Starts with postgresql://:', databaseUrl.startsWith('postgresql://'));
      console.log('  - Starts with postgres://:', databaseUrl.startsWith('postgres://'));
    } else {
      console.log('  - DATABASE_URL: undefined/null/empty');
      console.log('  - Default fallback: sqlite:./personal_ai.db');
    }
    
    // Step 2: Database type detection logic
    const finalUrl = databaseUrl || 'sqlite:./personal_ai.db';
    const isPostgreSQLUrl = finalUrl && (finalUrl.startsWith('postgresql://') || finalUrl.startsWith('postgres://'));
    
    console.log('🔍 Detection Logic:');
    console.log('  - Final URL for detection:', finalUrl.replace(/:[^:@]*@/, ':***@'));
    console.log('  - PostgreSQL detected:', isPostgreSQLUrl);
    console.log('  - Will initialize:', isPostgreSQLUrl ? 'PostgreSQL' : 'SQLite');
    
    // Step 3: Initialize appropriate database
    if (isPostgreSQLUrl) {
      this.initializePostgresWithDebug(finalUrl);
    } else {
      this.initializeSQLiteWithDebug(finalUrl);
    }
    
    this.createTables();
  }

  initializePostgresWithDebug(databaseUrl) {
    console.log('🐘 === POSTGRESQL INITIALIZATION WITH DEBUG ===');
    
    try {
      // Step 1: Check if pg module is available
      console.log('🔍 Checking pg module availability...');
      const pg = require('pg');
      console.log('✅ pg module loaded successfully');
      
      // Step 2: Parse connection string components
      console.log('🔍 Analyzing connection string...');
      const urlObj = new URL(databaseUrl);
      console.log('  - Protocol:', urlObj.protocol);
      console.log('  - Hostname:', urlObj.hostname);
      console.log('  - Port:', urlObj.port || 'default (5432)');
      console.log('  - Database:', urlObj.pathname.slice(1));
      console.log('  - Has auth:', !!urlObj.username);
      
      // Step 3: Configure SSL settings
      const isProduction = process.env.NODE_ENV === 'production';
      const sslConfig = isProduction ? { rejectUnauthorized: false } : false;
      
      console.log('🔍 SSL Configuration:');
      console.log('  - Production mode:', isProduction);
      console.log('  - SSL config:', JSON.stringify(sslConfig));
      
      // Step 4: Create connection pool
      console.log('🔍 Creating PostgreSQL connection pool...');
      const { Pool } = pg;
      
      this.db = new Pool({
        connectionString: databaseUrl,
        ssl: sslConfig,
        // Add connection debugging
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 30000,
        max: 20
      });
      
      this.isPostgres = true;
      
      // Step 5: Test connection
      console.log('🔍 Testing PostgreSQL connection...');
      this.testConnection()
        .then(() => console.log('✅ PostgreSQL connection test successful'))
        .catch(error => {
          console.error('❌ PostgreSQL connection test failed:', error.message);
          console.error('   Error details:', {
            code: error.code,
            errno: error.errno,
            syscall: error.syscall,
            address: error.address,
            port: error.port
          });
        });
      
      console.log('✅ PostgreSQL pool initialized');
      
    } catch (error) {
      console.error('❌ PostgreSQL initialization failed:', error.message);
      
      if (error.code === 'MODULE_NOT_FOUND') {
        console.log('📦 Missing pg dependency. Install with: npm install pg');
        console.log('🔧 Current package.json dependencies:');
        this.checkPackageJson();
      }
      
      throw new Error(`PostgreSQL initialization failed: ${error.message}`);
    }
  }

  initializeSQLiteWithDebug(databaseUrl) {
    console.log('🗃️ === SQLITE INITIALIZATION WITH DEBUG ===');
    
    try {
      console.log('🔍 Checking better-sqlite3 module availability...');
      const Database = require('better-sqlite3');
      console.log('✅ better-sqlite3 module loaded successfully');
      
      const dbPath = databaseUrl.replace('sqlite:', '');
      console.log('🔍 Database path:', dbPath);
      console.log('🔍 Path exists:', fs.existsSync(dbPath));
      console.log('🔍 Directory writable:', this.checkDirectoryWritable(path.dirname(dbPath)));
      
      this.db = new Database(dbPath);
      this.db.pragma('foreign_keys = ON');
      this.isPostgres = false;
      
      console.log('✅ SQLite database initialized');
      
    } catch (error) {
      console.error('❌ SQLite initialization failed:', error.message);
      
      if (process.env.NODE_ENV === 'production') {
        console.log('🚨 Production environment detected - SQLite not suitable');
        console.log('☁️ This should be using PostgreSQL in production');
        console.log('🔧 Check DATABASE_URL environment variable');
      }
      
      if (error.code === 'MODULE_NOT_FOUND') {
        console.log('📦 Missing better-sqlite3 dependency. Install with: npm install better-sqlite3');
      }
      
      throw new Error(`SQLite initialization failed: ${error.message}`);
    }
  }

  async testConnection() {
    if (this.isPostgres) {
      const client = await this.db.connect();
      try {
        const result = await client.query('SELECT version()');
        console.log('🔍 PostgreSQL version:', result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1]);
        return true;
      } finally {
        client.release();
      }
    } else {
      const result = this.db.prepare('SELECT sqlite_version()').get();
      console.log('🔍 SQLite version:', result['sqlite_version()']);
      return true;
    }
  }

  checkPackageJson() {
    try {
      const packagePath = path.join(process.cwd(), 'package.json');
      if (fs.existsSync(packagePath)) {
        const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        const deps = { ...packageData.dependencies, ...packageData.devDependencies };
        console.log('📦 Database-related dependencies:', {
          'pg': deps.pg || 'not installed',
          'better-sqlite3': deps['better-sqlite3'] || 'not installed'
        });
      }
    } catch (error) {
      console.log('⚠️ Could not read package.json:', error.message);
    }
  }

  checkDirectoryWritable(dirPath) {
    try {
      fs.accessSync(dirPath, fs.constants.W_OK);
      return true;
    } catch {
      return false;
    }
  }

  async query(sql, params = []) {
    console.log('🔍 Query:', sql.substring(0, 100) + (sql.length > 100 ? '...' : ''));
    
    if (this.isPostgres) {
      const client = await this.db.connect();
      try {
        const result = await client.query(sql, params);
        console.log('✅ Query successful, rows:', result.rows?.length || 0);
        return result.rows;
      } catch (error) {
        console.error('❌ Query failed:', error.message);
        throw error;
      } finally {
        client.release();
      }
    } else {
      try {
        const stmt = this.db.prepare(sql);
        if (sql.trim().toUpperCase().startsWith('SELECT')) {
          const result = stmt.all(params);
          console.log('✅ Query successful, rows:', result.length);
          return result;
        } else {
          const result = stmt.run(params);
          console.log('✅ Query successful, changes:', result.changes);
          return { insertId: result.lastInsertRowid, changes: result.changes };
        }
      } catch (error) {
        console.error('❌ Query failed:', error.message);
        throw error;
      }
    }
  }

  createTables() {
    console.log('🗂️ Creating campaign database tables...');
    // Table creation logic would go here (simplified for debugging)
    console.log('✅ Database tables initialized');
  }

  async close() {
    console.log('🔍 Closing database connection...');
    if (this.isPostgres) {
      await this.db.end();
    } else {
      this.db.close();
    }
    console.log('✅ Database connection closed');
  }
}

// Create and test the enhanced database
if (require.main === module) {
  console.log('🚀 Running Enhanced Database Debug Test\n');
  
  const debugDb = new CampaignDatabaseDebug();
  
  // Add a small delay to see initialization logs
  setTimeout(async () => {
    try {
      await debugDb.close();
      console.log('\n✅ Enhanced database debugging completed');
    } catch (error) {
      console.error('\n❌ Database debug test failed:', error.message);
    }
  }, 2000);
}

module.exports = CampaignDatabaseDebug;