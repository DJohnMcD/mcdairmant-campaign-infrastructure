// Database abstraction layer for campaign infrastructure
// Supports both SQLite (local dev) and PostgreSQL (cloud deployment)

const fs = require('fs');
const path = require('path');

class CampaignDatabase {
  constructor() {
    this.db = null;
    this.isPostgres = false;
    this.initPromise = this.initialize();
  }

  async ready() {
    await this.initPromise;
    return this;
  }

  async initialize() {
    const databaseUrl = process.env.DATABASE_URL || 'sqlite:./personal_ai.db';
    
    console.log('🔍 Database URL detected:', databaseUrl ? databaseUrl.replace(/:[^:@]*@/, ':***@') : 'undefined');
    console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
    
    if (databaseUrl && (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://'))) {
      this.initializePostgres(databaseUrl);
    } else {
      this.initializeSQLite(databaseUrl);
    }
    
    await this.createTables();
  }

  initializePostgres(databaseUrl) {
    console.log('🐘 Initializing PostgreSQL connection for cloud deployment...');
    try {
      const { Pool } = require('pg');
      this.db = new Pool({
        connectionString: databaseUrl,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });
      this.isPostgres = true;
      console.log('✅ PostgreSQL connection initialized');
    } catch (error) {
      console.error('❌ PostgreSQL initialization failed:', error.message);
      console.log('📦 Installing pg dependency...');
      throw new Error('PostgreSQL connection failed. Run: npm install pg');
    }
  }

  initializeSQLite(databaseUrl) {
    console.log('🗃️ Initializing SQLite for local development...');
    try {
      const Database = require('better-sqlite3');
      const dbPath = databaseUrl.replace('sqlite:', '');
      this.db = new Database(dbPath);
      this.db.pragma('foreign_keys = ON');
      this.isPostgres = false;
      console.log('✅ SQLite connection initialized');
      
      // Log cloud development environment
      if (process.env.CODESPACES) {
        console.log('☁️ GitHub Codespaces detected - Mobile development ready!');
      } else if (process.env.GITPOD_WORKSPACE_ID) {
        console.log('☁️ Gitpod workspace detected - Cloud development active!');
      }
    } catch (error) {
      console.error('❌ SQLite initialization failed:', error.message);
      if (process.env.NODE_ENV === 'production') {
        console.log('🚨 Production environment detected - SQLite not available');
        console.log('☁️ Falling back to PostgreSQL via DATABASE_URL...');
        // Try to use PostgreSQL instead
        const postgresUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/campaign';
        this.initializePostgres(postgresUrl);
        return;
      }
      console.log('📦 For local development, install: npm install better-sqlite3');
      console.log('🔄 Falling back to mock mode for testing authentication fixes...');
      
      // Fallback to mock mode for testing
      this.db = {
        prepare: () => ({ 
          get: () => ({ id: 1, email: 'djclownproductions@gmail.com', username: 'john', password: '$2b$12$test' }),
          all: () => [], 
          run: () => ({ lastInsertRowid: 1 }) 
        }),
        exec: () => {},
        close: () => {}
      };
      this.isPostgres = false;
      this.isMockMode = true;
      console.log('⚠️  Running in mock database mode - authentication testing only');
    }
  }

  async query(sql, params = []) {
    if (this.isPostgres) {
      // Convert SQLite-style ? placeholders to PostgreSQL-style $1, $2, etc.
      let pgSql = sql;
      let paramIndex = 1;
      while (pgSql.includes('?')) {
        pgSql = pgSql.replace('?', `$${paramIndex}`);
        paramIndex++;
      }
      
      const client = await this.db.connect();
      try {
        const result = await client.query(pgSql, params);
        return result.rows;
      } finally {
        client.release();
      }
    } else {
      // Convert SQLite syntax for prepared statements
      const stmt = this.db.prepare(sql);
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        return stmt.all(params);
      } else {
        const result = stmt.run(params);
        return { insertId: result.lastInsertRowid, changes: result.changes };
      }
    }
  }

  async get(sql, params = []) {
    if (this.isPostgres) {
      // Convert SQLite-style ? placeholders to PostgreSQL-style $1, $2, etc.
      let pgSql = sql;
      let paramIndex = 1;
      while (pgSql.includes('?')) {
        pgSql = pgSql.replace('?', `$${paramIndex}`);
        paramIndex++;
      }
      
      const client = await this.db.connect();
      try {
        const result = await client.query(pgSql, params);
        return result.rows[0] || null;
      } finally {
        client.release();
      }
    } else {
      const stmt = this.db.prepare(sql);
      return stmt.get(params) || null;
    }
  }

  async run(sql, params = []) {
    if (this.isPostgres) {
      // Convert SQLite-style ? placeholders to PostgreSQL-style $1, $2, etc.
      let pgSql = sql;
      let paramIndex = 1;
      while (pgSql.includes('?')) {
        pgSql = pgSql.replace('?', `$${paramIndex}`);
        paramIndex++;
      }
      
      // Add RETURNING id for INSERT statements to get the inserted ID
      if (pgSql.trim().toUpperCase().startsWith('INSERT') && !pgSql.includes('RETURNING')) {
        pgSql += ' RETURNING id';
      }
      
      const client = await this.db.connect();
      try {
        const result = await client.query(pgSql, params);
        return { 
          insertId: result.rows[0]?.id || result.rowCount, 
          changes: result.rowCount,
          lastInsertRowid: result.rows[0]?.id || result.rowCount
        };
      } finally {
        client.release();
      }
    } else {
      const stmt = this.db.prepare(sql);
      const result = stmt.run(params);
      return { insertId: result.lastInsertRowid, changes: result.changes, lastInsertRowid: result.lastInsertRowid };
    }
  }

  async createTables() {
    console.log('🗂️ Creating campaign database tables...');
    
    const tables = this.isPostgres ? [
      // PostgreSQL table definitions
      `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT UNIQUE,
        reset_token TEXT,
        reset_token_expires TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS entries (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        type TEXT,
        content TEXT,
        tags TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS agent_responses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        agent_name TEXT,
        user_message TEXT,
        agent_response TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS terri_private (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        user_message TEXT,
        terri_response TEXT,
        shared_with_ethel BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS campaign_expenses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        amount DECIMAL(10,2) NOT NULL,
        description TEXT NOT NULL,
        vendor TEXT,
        category TEXT,
        classification TEXT,
        confidence_score DECIMAL(3,2),
        ai_reasoning TEXT,
        manual_override BOOLEAN DEFAULT FALSE,
        receipt_photo TEXT,
        date_incurred DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS campaign_donors (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        zip TEXT,
        employer TEXT,
        occupation TEXT,
        contribution_amount DECIMAL(10,2),
        contribution_date DATE,
        contribution_type TEXT,
        compliance_status TEXT DEFAULT 'compliant',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS campaign_voters (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        city TEXT,
        county TEXT,
        zip TEXT,
        party_affiliation TEXT,
        support_level TEXT,
        contact_method TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS campaign_events (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        title TEXT NOT NULL,
        event_type TEXT NOT NULL,
        description TEXT,
        location TEXT,
        address TEXT,
        city TEXT,
        county TEXT,
        event_date DATE NOT NULL,
        start_time TIME,
        end_time TIME,
        expected_attendance INTEGER DEFAULT 0,
        actual_attendance INTEGER DEFAULT 0,
        budget DECIMAL(10,2) DEFAULT 0,
        expenses DECIMAL(10,2) DEFAULT 0,
        volunteer_coordinator TEXT,
        required_volunteers INTEGER DEFAULT 0,
        confirmed_volunteers INTEGER DEFAULT 0,
        setup_requirements TEXT,
        equipment_needed TEXT,
        status TEXT DEFAULT 'planning',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS audit_log (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        action TEXT NOT NULL,
        details TEXT,
        ip_address TEXT,
        user_agent TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    ] : [
      // SQLite table definitions
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT UNIQUE,
        reset_token TEXT,
        reset_token_expires DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        type TEXT,
        content TEXT,
        tags TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS agent_responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        agent_name TEXT,
        user_message TEXT,
        agent_response TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS terri_private (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        user_message TEXT,
        terri_response TEXT,
        shared_with_ethel BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS campaign_expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        amount DECIMAL(10,2) NOT NULL,
        description TEXT NOT NULL,
        vendor TEXT,
        category TEXT,
        classification TEXT,
        confidence_score DECIMAL(3,2),
        ai_reasoning TEXT,
        manual_override BOOLEAN DEFAULT 0,
        receipt_photo TEXT,
        date_incurred DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS campaign_donors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        zip TEXT,
        employer TEXT,
        occupation TEXT,
        contribution_amount DECIMAL(10,2),
        contribution_date DATE,
        contribution_type TEXT,
        compliance_status TEXT DEFAULT 'compliant',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS campaign_voters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        city TEXT,
        county TEXT,
        zip TEXT,
        party_affiliation TEXT,
        support_level TEXT,
        contact_method TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS campaign_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        title TEXT NOT NULL,
        event_type TEXT NOT NULL,
        description TEXT,
        location TEXT,
        address TEXT,
        city TEXT,
        county TEXT,
        event_date DATE NOT NULL,
        start_time TIME,
        end_time TIME,
        expected_attendance INTEGER DEFAULT 0,
        actual_attendance INTEGER DEFAULT 0,
        budget DECIMAL(10,2) DEFAULT 0,
        expenses DECIMAL(10,2) DEFAULT 0,
        volunteer_coordinator TEXT,
        required_volunteers INTEGER DEFAULT 0,
        confirmed_volunteers INTEGER DEFAULT 0,
        setup_requirements TEXT,
        equipment_needed TEXT,
        status TEXT DEFAULT 'planning',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        action TEXT NOT NULL,
        details TEXT,
        ip_address TEXT,
        user_agent TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`
    ];

    for (const sql of tables) {
      try {
        if (this.isPostgres) {
          // For PostgreSQL, await each table creation
          await this.db.query(sql);
          console.log('✓ Created table:', sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1] || 'unknown');
        } else {
          // For SQLite, execute synchronously
          this.db.exec(sql);
        }
      } catch (error) {
        console.error('❌ Table creation error:', error.message);
        console.error('Failed SQL:', sql.substring(0, 100) + '...');
      }
    }
    
    console.log('✅ Database tables initialized');
  }

  // Mobile-optimized methods for quick operations
  addMobileExpense(expense, callback) {
    const sql = `INSERT INTO campaign_expenses 
      (amount, vendor, category, description, date, classification, fec_compliant, user_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`;
    
    const values = [
      expense.amount,
      expense.vendor,
      expense.category || 'uncategorized',
      expense.description || '',
      expense.date,
      expense.classification || 'mobile',
      expense.fec_compliant !== false,
      expense.user_id
    ];
    
    if (this.isPostgres) {
      this.db.query(sql.replace(/\?/g, (match, offset) => `$${values.slice(0, offset).length + 1}`), values)
        .then(result => callback(null, result))
        .catch(callback);
    } else {
      try {
        const stmt = this.db.prepare(sql);
        const result = stmt.run(...values);
        callback(null, result);
      } catch (error) {
        callback(error);
      }
    }
  }

  getMobileStatus(userId, callback) {
    const sql = `SELECT 
      (SELECT COUNT(*) FROM campaign_expenses WHERE user_id = ? AND date = date('now')) as today_expenses,
      (SELECT COUNT(*) FROM entries WHERE user_id = ? AND created_at > datetime('now', '-24 hours')) as recent_entries,
      (SELECT COUNT(*) FROM agent_responses WHERE user_id = ? AND created_at > datetime('now', '-24 hours')) as recent_chats
    `;
    
    if (this.isPostgres) {
      this.db.query(sql.replace(/\?/g, (match, offset) => `$${[userId, userId, userId].slice(0, offset).length + 1}`), [userId, userId, userId])
        .then(result => callback(null, result.rows[0]))
        .catch(callback);
    } else {
      try {
        const stmt = this.db.prepare(sql);
        const result = stmt.get(userId, userId, userId);
        callback(null, result);
      } catch (error) {
        callback(error);
      }
    }
  }

  addMobileNote(note, callback) {
    const sql = `INSERT INTO entries 
      (user_id, content, type, category, agent, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))`;
    
    const values = [
      note.user_id,
      note.content,
      note.type || 'note',
      note.category || 'mobile',
      note.agent || 'mobile'
    ];
    
    if (this.isPostgres) {
      this.db.query(sql.replace(/\?/g, (match, offset) => `$${values.slice(0, offset).length + 1}`), values)
        .then(result => callback(null, result))
        .catch(callback);
    } else {
      try {
        const stmt = this.db.prepare(sql);
        const result = stmt.run(...values);
        callback(null, result);
      } catch (error) {
        callback(error);
      }
    }
  }

  async close() {
    if (this.isPostgres) {
      await this.db.end();
    } else {
      this.db.close();
    }
  }
}

module.exports = CampaignDatabase;