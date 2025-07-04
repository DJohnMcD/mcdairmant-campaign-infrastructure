/**
 * NY-24 Mobile Voter Lookup Server
 * Campaign field operations backend with offline sync support
 */

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import database schema and functions
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8081;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000', 'http://localhost:8080'],
  credentials: true
}));

// Rate limiting for API protection
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased for field operations
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Database setup
const dbPath = path.join(__dirname, 'ny24_voters.db');
let db;

// Initialize SQLite database
const initializeDatabase = () => {
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('❌ Error opening database:', err);
      return;
    }
    console.log('📱 Connected to NY-24 voter lookup database');
  });

  // Create tables
  const createTablesSQL = `
    -- NY-24 Voter Records
    CREATE TABLE IF NOT EXISTS voters (
      voter_id TEXT PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      street_address TEXT,
      city TEXT,
      zip_code TEXT,
      county TEXT CHECK(county IN ('Oswego', 'Cayuga', 'Onondaga')),
      party_affiliation TEXT,
      voting_frequency INTEGER DEFAULT 0,
      last_election_voted TEXT,
      demographic_score INTEGER DEFAULT 0,
      rural_address_flag BOOLEAN DEFAULT FALSE,
      veteran_household BOOLEAN DEFAULT FALSE,
      senior_household BOOLEAN DEFAULT FALSE,
      agricultural_worker BOOLEAN DEFAULT FALSE,
      last_contact_date TEXT,
      contact_preference TEXT DEFAULT 'door',
      latitude REAL,
      longitude REAL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS canvass_interactions (
      interaction_id TEXT PRIMARY KEY,
      voter_id TEXT NOT NULL,
      volunteer_id TEXT NOT NULL,
      contact_datetime TEXT NOT NULL,
      response_level INTEGER NOT NULL,
      issues_priority TEXT,
      volunteer_notes TEXT,
      yard_sign_request BOOLEAN DEFAULT FALSE,
      follow_up_needed BOOLEAN DEFAULT FALSE,
      contact_method TEXT DEFAULT 'door',
      weather_conditions TEXT,
      interaction_duration INTEGER DEFAULT 0,
      sync_status TEXT DEFAULT 'pending',
      created_offline BOOLEAN DEFAULT TRUE,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (voter_id) REFERENCES voters (voter_id)
    );

    CREATE TABLE IF NOT EXISTS sync_queue (
      queue_id TEXT PRIMARY KEY,
      table_name TEXT NOT NULL,
      record_id TEXT NOT NULL,
      action TEXT NOT NULL CHECK(action IN ('insert', 'update', 'delete')),
      data TEXT NOT NULL,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
      retry_count INTEGER DEFAULT 0,
      last_error TEXT,
      priority INTEGER DEFAULT 1
    );

    CREATE INDEX IF NOT EXISTS idx_voters_county ON voters(county);
    CREATE INDEX IF NOT EXISTS idx_voters_address ON voters(street_address);
    CREATE INDEX IF NOT EXISTS idx_canvass_voter ON canvass_interactions(voter_id);
  `;

  db.exec(createTablesSQL, (err) => {
    if (err) {
      console.error('❌ Error creating tables:', err);
      return;
    }
    console.log('✅ NY-24 database tables created successfully');
    insertSampleData();
  });
};

// Insert sample NY-24 voter data
const insertSampleData = () => {
  const sampleVoters = [
    ['NY24001', 'John', 'Smith', '123 Farm Road', 'Oswego', '13126', 'Oswego', 'Republican', 3, '2022-11-08', 65, 1, 1, 0, 0],
    ['NY24002', 'Mary', 'Johnson', '456 Main Street', 'Auburn', '13021', 'Cayuga', 'Democrat', 4, '2022-11-08', 25, 0, 0, 0, 0],
    ['NY24003', 'Robert', 'Williams', 'RR 2 Box 789', 'Fulton', '13069', 'Oswego', 'Independent', 2, '2020-11-03', 75, 1, 0, 1, 0],
    ['NY24004', 'Sarah', 'Brown', '321 Elm Avenue', 'Syracuse', '13204', 'Onondaga', 'Democrat', 5, '2022-11-08', 30, 0, 0, 0, 1],
    ['NY24005', 'Michael', 'Davis', '654 County Route 1', 'Weedsport', '13166', 'Cayuga', 'Republican', 4, '2022-11-08', 80, 1, 1, 0, 1],
    ['NY24006', 'Linda', 'Miller', '789 Lake Road', 'Skaneateles', '13152', 'Onondaga', 'Independent', 3, '2022-11-08', 55, 0, 0, 1, 0],
    ['NY24007', 'James', 'Wilson', '147 Agricultural Lane', 'Moravia', '13118', 'Cayuga', 'Republican', 5, '2022-11-08', 85, 1, 0, 0, 1],
    ['NY24008', 'Patricia', 'Moore', '258 Village Street', 'Baldwinsville', '13027', 'Onondaga', 'Democrat', 2, '2020-11-03', 20, 0, 0, 0, 0]
  ];

  const insertSQL = `
    INSERT OR IGNORE INTO voters (
      voter_id, first_name, last_name, street_address, city, zip_code, county,
      party_affiliation, voting_frequency, last_election_voted, demographic_score,
      rural_address_flag, veteran_household, senior_household, agricultural_worker
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const stmt = db.prepare(insertSQL);
  sampleVoters.forEach(voter => {
    stmt.run(voter);
  });
  stmt.finalize();
  console.log('📊 Sample NY-24 voter data inserted');
};

// API Routes

// Voter search endpoint - optimized for mobile field use
app.get('/api/voters/search', (req, res) => {
  const { q: query, county, limit = 20, format } = req.query;
  
  if (!query || query.length < 2) {
    return res.status(400).json({ error: 'Search query must be at least 2 characters' });
  }

  let sql = `
    SELECT 
      voter_id, first_name, last_name, street_address, city, zip_code, county,
      party_affiliation, voting_frequency, last_election_voted, demographic_score,
      rural_address_flag, veteran_household, senior_household, agricultural_worker,
      last_contact_date, contact_preference
    FROM voters 
    WHERE (
      LOWER(first_name || ' ' || last_name) LIKE LOWER(?) OR
      LOWER(street_address) LIKE LOWER(?) OR
      voter_id = ?
    )
  `;
  
  const params = [`%${query}%`, `%${query}%`, query];
  
  if (county) {
    sql += ' AND county = ?';
    params.push(county);
  }
  
  sql += ' ORDER BY demographic_score DESC, last_name ASC LIMIT ?';
  params.push(parseInt(limit));

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('Search error:', err);
      return res.status(500).json({ error: 'Search failed' });
    }
    
    // Simple format for mobile browser fallback
    if (format === 'simple') {
      let html = `
        <!DOCTYPE html>
        <html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Search Results</title>
        <style>body{font-family:Arial;padding:20px;} .voter{border:1px solid #ccc;margin:10px 0;padding:15px;} .back{background:#2E8B57;color:white;padding:10px;text-decoration:none;border-radius:5px;}</style>
        </head><body>
        <h2>Found ${rows.length} voters for "${query}"</h2>
        <a href="/" class="back">← Back to Search</a>
      `;
      
      rows.forEach(voter => {
        html += `
          <div class="voter">
            <strong>${voter.first_name} ${voter.last_name}</strong><br>
            ${voter.street_address}, ${voter.city}<br>
            ${voter.party_affiliation} • ${voter.county} County<br>
            Score: ${voter.demographic_score}% McDairmant Support
          </div>
        `;
      });
      
      html += '</body></html>';
      return res.send(html);
    }
    
    res.json({
      success: true,
      voters: rows,
      count: rows.length,
      query: query,
      county: county || 'all'
    });
  });
});

// Get voter by ID
app.get('/api/voters/:id', (req, res) => {
  const { id } = req.params;
  
  const sql = `
    SELECT 
      v.*,
      (SELECT COUNT(*) FROM canvass_interactions WHERE voter_id = v.voter_id) as interaction_count,
      (SELECT contact_datetime FROM canvass_interactions WHERE voter_id = v.voter_id ORDER BY contact_datetime DESC LIMIT 1) as last_contact
    FROM voters v 
    WHERE voter_id = ?
  `;

  db.get(sql, [id], (err, row) => {
    if (err) {
      console.error('Get voter error:', err);
      return res.status(500).json({ error: 'Failed to get voter' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Voter not found' });
    }
    
    res.json({
      success: true,
      voter: row
    });
  });
});

// Save canvass interaction
app.post('/api/interactions', (req, res) => {
  const {
    voter_id, volunteer_id, response_level, issues_priority,
    volunteer_notes, yard_sign_request, follow_up_needed,
    contact_method, weather_conditions, interaction_duration
  } = req.body;

  if (!voter_id || !volunteer_id || response_level === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const interaction_id = `INT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const contact_datetime = new Date().toISOString();

  const sql = `
    INSERT INTO canvass_interactions (
      interaction_id, voter_id, volunteer_id, contact_datetime,
      response_level, issues_priority, volunteer_notes,
      yard_sign_request, follow_up_needed, contact_method,
      weather_conditions, interaction_duration
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [
    interaction_id, voter_id, volunteer_id, contact_datetime,
    response_level, issues_priority, volunteer_notes,
    yard_sign_request ? 1 : 0, follow_up_needed ? 1 : 0,
    contact_method || 'door', weather_conditions,
    interaction_duration || 0
  ], function(err) {
    if (err) {
      console.error('Save interaction error:', err);
      return res.status(500).json({ error: 'Failed to save interaction' });
    }

    // Update voter's last contact date
    db.run(
      'UPDATE voters SET last_contact_date = ? WHERE voter_id = ?',
      [contact_datetime, voter_id]
    );

    res.json({
      success: true,
      interaction_id: interaction_id,
      message: 'Canvass interaction saved successfully'
    });
  });
});

// Get voter interactions
app.get('/api/voters/:id/interactions', (req, res) => {
  const { id } = req.params;
  
  const sql = `
    SELECT * FROM canvass_interactions 
    WHERE voter_id = ? 
    ORDER BY contact_datetime DESC
  `;

  db.all(sql, [id], (err, rows) => {
    if (err) {
      console.error('Get interactions error:', err);
      return res.status(500).json({ error: 'Failed to get interactions' });
    }
    
    res.json({
      success: true,
      interactions: rows
    });
  });
});

// Campaign statistics for dashboard
app.get('/api/stats/campaign', (req, res) => {
  const { county } = req.query;
  
  let sql = `
    SELECT 
      COUNT(DISTINCT v.voter_id) as total_voters,
      COUNT(DISTINCT ci.voter_id) as contacted_voters,
      AVG(ci.response_level) as avg_response,
      COUNT(CASE WHEN ci.response_level IN (1,2) THEN 1 END) as supporters,
      COUNT(CASE WHEN ci.response_level = 3 THEN 1 END) as undecided,
      COUNT(CASE WHEN ci.yard_sign_request = 1 THEN 1 END) as yard_signs
    FROM voters v
    LEFT JOIN canvass_interactions ci ON v.voter_id = ci.voter_id
  `;
  
  const params = [];
  if (county) {
    sql += ' WHERE v.county = ?';
    params.push(county);
  }

  db.get(sql, params, (err, row) => {
    if (err) {
      console.error('Stats error:', err);
      return res.status(500).json({ error: 'Failed to get stats' });
    }
    
    res.json({
      success: true,
      stats: row,
      county: county || 'all_counties'
    });
  });
});

// Sync queue management
app.get('/api/sync/pending', (req, res) => {
  const sql = 'SELECT * FROM sync_queue WHERE retry_count < 3 ORDER BY priority ASC, timestamp ASC LIMIT 50';
  
  db.all(sql, (err, rows) => {
    if (err) {
      console.error('Sync queue error:', err);
      return res.status(500).json({ error: 'Failed to get sync queue' });
    }
    
    res.json({
      success: true,
      pending_items: rows.length,
      items: rows
    });
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    service: 'NY-24 Mobile Voter Lookup',
    status: 'operational',
    timestamp: new Date().toISOString(),
    database: db ? 'connected' : 'disconnected'
  });
});

// Serve mobile interface
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NY-24 Mobile Voter Lookup</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            min-height: 100vh;
            padding: 20px;
        }
        .container { max-width: 400px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .subtitle { font-size: 16px; opacity: 0.9; }
        .search-box { 
            background: white; 
            border-radius: 12px; 
            padding: 20px; 
            margin-bottom: 20px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .search-input {
            width: 100%;
            padding: 15px;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 16px;
            margin-bottom: 15px;
        }
        .search-btn {
            width: 100%;
            padding: 15px;
            background: #2E8B57;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            user-select: none;
            -webkit-user-select: none;
            -webkit-tap-highlight-color: transparent;
        }
        .search-btn:hover, .search-btn:active, .search-btn:focus {
            background: #236B47;
            outline: none;
        }
        .results { background: white; border-radius: 12px; padding: 20px; color: #333; }
        .voter-card {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
            background: #f9f9f9;
        }
        .voter-name { font-weight: bold; font-size: 18px; margin-bottom: 5px; }
        .voter-address { color: #666; margin-bottom: 10px; }
        .voter-details { font-size: 14px; }
        .tag { 
            display: inline-block; 
            background: #e1f5fe; 
            color: #0277bd; 
            padding: 2px 8px; 
            border-radius: 12px; 
            font-size: 12px; 
            margin-right: 5px;
        }
        .contact-btn {
            width: 100%;
            padding: 10px;
            background: #1976d2;
            color: white;
            border: none;
            border-radius: 6px;
            margin-top: 10px;
            cursor: pointer;
        }
        @media (max-width: 480px) {
            .container { padding: 10px; }
            body { padding: 10px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🗳️ NY-24 VOTER LOOKUP</div>
            <div class="subtitle">McDairmant for Congress 2026</div>
        </div>
        
        <div class="search-box">
            <input type="text" id="searchInput" class="search-input" placeholder="Enter name or address..." autocomplete="off">
            <button onclick="searchVoters()" class="search-btn">SEARCH VOTERS</button>
        </div>
        
        <div id="results" class="results" style="display: none;"></div>
    </div>

    <script>
        let searchTimeout;
        
        // Mobile-compatible event handlers
        function initializeApp() {
            const searchInput = document.getElementById('searchInput');
            const searchButton = document.querySelector('.search-btn');
            
            // Input event for auto-search
            if (searchInput) {
                searchInput.addEventListener('input', function(e) {
                    clearTimeout(searchTimeout);
                    if (e.target.value.length >= 2) {
                        searchTimeout = setTimeout(function() { 
                            searchVoters(); 
                        }, 800); // Longer delay for mobile
                    }
                });
                
                // Enter key support
                searchInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter' || e.keyCode === 13) {
                        e.preventDefault();
                        searchVoters();
                    }
                });
            }
            
            // Button click handler with mobile compatibility
            if (searchButton) {
                searchButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    searchVoters();
                });
                
                // Touch event for better mobile responsiveness
                searchButton.addEventListener('touchstart', function(e) {
                    e.preventDefault();
                    searchVoters();
                });
            }
        }
        
        // Enhanced search function with mobile error handling
        function searchVoters() {
            const searchInput = document.getElementById('searchInput');
            const resultsDiv = document.getElementById('results');
            
            if (!searchInput || !resultsDiv) {
                console.error('Required elements not found');
                return;
            }
            
            const query = searchInput.value.trim();
            
            if (query.length < 2) {
                resultsDiv.style.display = 'none';
                return;
            }
            
            // Show loading state
            resultsDiv.innerHTML = '<div style="text-align: center; padding: 20px; color: #666;">🔍 Searching NY-24 voters...</div>';
            resultsDiv.style.display = 'block';
            
            // Use XMLHttpRequest for better mobile compatibility
            const xhr = new XMLHttpRequest();
            xhr.open('GET', '/api/voters/search?q=' + encodeURIComponent(query), true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        try {
                            const data = JSON.parse(xhr.responseText);
                            if (data.success && data.voters && data.voters.length > 0) {
                                displayResults(data.voters);
                            } else {
                                displayNoResults(query);
                            }
                        } catch (error) {
                            console.error('Parse error:', error);
                            displayError();
                        }
                    } else {
                        console.error('Request failed:', xhr.status);
                        displayError();
                    }
                }
            };
            
            xhr.onerror = function() {
                console.error('Network error');
                displayError();
            };
            
            xhr.send();
        }
        
        function displayResults(voters) {
            const resultsDiv = document.getElementById('results');
            let html = \`<h3>Found \${voters.length} voters:</h3>\`;
            
            voters.forEach(voter => {
                const tags = [];
                if (voter.veteran_household) tags.push('<span class="tag">🇺🇸 VETERAN</span>');
                if (voter.senior_household) tags.push('<span class="tag">👴 SENIOR</span>');
                if (voter.agricultural_worker) tags.push('<span class="tag">🚜 AGRICULTURE</span>');
                if (voter.rural_address_flag) tags.push('<span class="tag">🏡 RURAL</span>');
                
                html += \`
                    <div class="voter-card">
                        <div class="voter-name">\${voter.first_name} \${voter.last_name}</div>
                        <div class="voter-address">\${voter.street_address}, \${voter.city}, \${voter.county} County</div>
                        <div class="voter-details">
                            \${voter.party_affiliation} • Score: \${voter.demographic_score}% • Last voted: \${voter.last_election_voted || 'Unknown'}
                            <br>\${tags.join(' ')}
                        </div>
                        <button class="contact-btn" onclick="startCanvass('\${voter.voter_id}')">
                            📋 START CANVASS
                        </button>
                    </div>
                \`;
            });
            
            resultsDiv.innerHTML = html;
            resultsDiv.style.display = 'block';
        }
        
        function displayNoResults(query) {
            const resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = \`
                <div style="text-align: center; padding: 20px;">
                    <h3>No voters found for "\${query}"</h3>
                    <p>Try searching by:</p>
                    <ul style="text-align: left; margin: 10px 0;">
                        <li>Full name or partial name</li>
                        <li>Street address</li>
                        <li>Voter ID</li>
                    </ul>
                </div>
            \`;
            resultsDiv.style.display = 'block';
        }
        
        function displayError() {
            const resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = \`
                <div style="text-align: center; padding: 20px; color: #d32f2f;">
                    <h3>⚠️ Search Error</h3>
                    <p>Please check your connection and try again.</p>
                </div>
            \`;
            resultsDiv.style.display = 'block';
        }
        
        function startCanvass(voterId) {
            // In a full implementation, this would open the canvassing form
            if (confirm('Start canvassing interaction for voter ' + voterId + '?')) {
                alert('Canvassing interface would open here. Full implementation includes response logging, issue tracking, and offline sync.');
            }
        }
        
        // Mobile debugging function
        function debugMobile() {
            const info = {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                cookieEnabled: navigator.cookieEnabled,
                onLine: navigator.onLine,
                language: navigator.language,
                screenWidth: screen.width,
                screenHeight: screen.height,
                windowWidth: window.innerWidth,
                windowHeight: window.innerHeight
            };
            console.log('Mobile Debug Info:', info);
            return info;
        }
        
        // Simple fallback search function for troubled mobile browsers
        function fallbackSearch() {
            const query = document.getElementById('searchInput').value.trim();
            if (query.length < 2) {
                alert('Please enter at least 2 characters to search');
                return;
            }
            
            // Simple redirect approach for very basic mobile browsers
            window.location.href = '/api/voters/search?q=' + encodeURIComponent(query) + '&format=simple';
        }
        
        // Initialize app when page loads
        document.addEventListener('DOMContentLoaded', function() {
            try {
                initializeApp();
                debugMobile();
                console.log('NY-24 Mobile Voter Lookup initialized');
            } catch (error) {
                console.error('Initialization error:', error);
                // Fallback for very old mobile browsers
                const searchBtn = document.querySelector('.search-btn');
                if (searchBtn) {
                    searchBtn.onclick = fallbackSearch;
                }
            }
        });
        
        // Also initialize on window load for mobile compatibility
        window.addEventListener('load', function() {
            try {
                initializeApp();
            } catch (error) {
                console.error('Window load error:', error);
            }
        });
    </script>
</body>
</html>
  `);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    available_endpoints: [
      'GET /api/voters/search',
      'GET /api/voters/:id',
      'POST /api/interactions',
      'GET /api/stats/campaign',
      'GET /api/health'
    ]
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down NY-24 voter lookup server...');
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('✅ Database connection closed');
      }
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 NY-24 Mobile Voter Lookup Server Started');
  console.log(`📱 Server running on port ${PORT}`);
  console.log(`🌐 Access at: http://localhost:${PORT}`);
  console.log('🎯 Ready for field operations!');
  
  initializeDatabase();
});

module.exports = app;