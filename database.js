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
      throw new Error('SQLite connection failed. Run: npm install better-sqlite3');
    }
  }

  async query(sql, params = []) {
    if (this.isPostgres) {
      const client = await this.db.connect();
      try {
        const result = await client.query(sql, params);
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
      const result = await this.query(sql, params);
      return result[0] || null;
    } else {
      const stmt = this.db.prepare(sql);
      return stmt.get(params) || null;
    }
  }

  async run(sql, params = []) {
    return await this.query(sql, params);
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
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        employer TEXT,
        occupation TEXT,
        total_contributions DECIMAL(10,2) DEFAULT 0,
        last_contribution_date DATE,
        compliance_status TEXT DEFAULT 'compliant',
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
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        employer TEXT,
        occupation TEXT,
        total_contributions DECIMAL(10,2) DEFAULT 0,
        last_contribution_date DATE,
        compliance_status TEXT DEFAULT 'compliant',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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