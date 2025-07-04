/**
 * NY-24 Campaign Mobile Voter Lookup Database Schema
 * Optimized for offline-first rural field operations
 */

export const createTables = `
  -- NY-24 Voter Records (cached from NY State BOE format)
  CREATE TABLE IF NOT EXISTS voters (
    voter_id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    street_address TEXT,
    city TEXT,
    zip_code TEXT,
    county TEXT CHECK(county IN ('Oswego', 'Cayuga', 'Onondaga')),
    party_affiliation TEXT,
    voting_frequency INTEGER DEFAULT 0, -- 0-5 scale for targeting
    last_election_voted TEXT,
    demographic_score INTEGER DEFAULT 0, -- McDairmant supporter likelihood 0-100
    rural_address_flag BOOLEAN DEFAULT FALSE, -- RR boxes, farm addresses
    veteran_household BOOLEAN DEFAULT FALSE,
    senior_household BOOLEAN DEFAULT FALSE,
    agricultural_worker BOOLEAN DEFAULT FALSE,
    last_contact_date TEXT,
    contact_preference TEXT DEFAULT 'door', -- phone, door, mail
    latitude REAL,
    longitude REAL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- Campaign Canvass Interactions
  CREATE TABLE IF NOT EXISTS canvass_interactions (
    interaction_id TEXT PRIMARY KEY,
    voter_id TEXT NOT NULL,
    volunteer_id TEXT NOT NULL,
    contact_datetime TEXT NOT NULL,
    response_level INTEGER NOT NULL, -- 1=Strong Support, 2=Lean Support, 3=Undecided, 4=Lean Oppose, 5=Strong Oppose, 0=Not Home, -1=Refused
    issues_priority TEXT, -- JSON: {infrastructure: 5, taxes: 4, healthcare: 3, agriculture: 5}
    volunteer_notes TEXT,
    yard_sign_request BOOLEAN DEFAULT FALSE,
    follow_up_needed BOOLEAN DEFAULT FALSE,
    contact_method TEXT DEFAULT 'door', -- door, phone, event
    weather_conditions TEXT,
    interaction_duration INTEGER DEFAULT 0, -- minutes
    sync_status TEXT DEFAULT 'pending', -- pending, synced, error
    created_offline BOOLEAN DEFAULT TRUE,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (voter_id) REFERENCES voters (voter_id)
  );

  -- Volunteer Territory Assignments
  CREATE TABLE IF NOT EXISTS volunteer_territories (
    assignment_id TEXT PRIMARY KEY,
    volunteer_id TEXT NOT NULL,
    territory_name TEXT NOT NULL, -- "Oswego Rural East", "Cayuga Farms District"
    assigned_date TEXT NOT NULL,
    expected_completion TEXT,
    voter_count INTEGER DEFAULT 0,
    addresses_completed INTEGER DEFAULT 0,
    sync_status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- Offline Sync Queue
  CREATE TABLE IF NOT EXISTS sync_queue (
    queue_id TEXT PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    action TEXT NOT NULL CHECK(action IN ('insert', 'update', 'delete')),
    data TEXT NOT NULL, -- JSON serialized record
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    retry_count INTEGER DEFAULT 0,
    last_error TEXT,
    priority INTEGER DEFAULT 1 -- 1=high, 2=medium, 3=low
  );

  -- Campaign Volunteers
  CREATE TABLE IF NOT EXISTS volunteers (
    volunteer_id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    county_assignment TEXT,
    canvassing_experience TEXT, -- beginner, intermediate, advanced
    preferred_schedule TEXT, -- weekends, evenings, flexible
    languages_spoken TEXT, -- for diverse NY-24 communities
    transportation BOOLEAN DEFAULT FALSE, -- has reliable transport
    device_type TEXT, -- phone, tablet for interface optimization
    training_completed BOOLEAN DEFAULT FALSE,
    active_status BOOLEAN DEFAULT TRUE,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- NY-24 District Data
  CREATE TABLE IF NOT EXISTS district_areas (
    area_id TEXT PRIMARY KEY,
    county TEXT NOT NULL,
    area_name TEXT NOT NULL, -- "Oswego Lakefront", "Cayuga Agricultural Zone"
    area_type TEXT, -- rural, suburban, agricultural, lakefront
    voter_density INTEGER, -- voters per square mile
    average_income INTEGER,
    primary_issues TEXT, -- JSON array of top concerns
    canvassing_difficulty INTEGER, -- 1-5 scale based on geography
    best_contact_times TEXT, -- JSON schedule recommendations
    special_notes TEXT, -- agricultural schedules, seasonal workers, etc.
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- Sample NY-24 Voter Data Insert
  INSERT OR IGNORE INTO voters (voter_id, first_name, last_name, street_address, city, county, party_affiliation, demographic_score, rural_address_flag, veteran_household) VALUES
  ('NY24001', 'John', 'Smith', '123 Farm Road', 'Oswego', 'Oswego', 'Republican', 65, TRUE, TRUE),
  ('NY24002', 'Mary', 'Johnson', '456 Main Street', 'Auburn', 'Cayuga', 'Democrat', 25, FALSE, FALSE),
  ('NY24003', 'Robert', 'Williams', 'RR 2 Box 789', 'Fulton', 'Oswego', 'Independent', 75, TRUE, FALSE),
  ('NY24004', 'Sarah', 'Brown', '321 Elm Avenue', 'Syracuse', 'Onondaga', 'Democrat', 30, FALSE, FALSE),
  ('NY24005', 'Michael', 'Davis', '654 County Route 1', 'Weedsport', 'Cayuga', 'Republican', 80, TRUE, TRUE);

  -- Sample District Areas
  INSERT OR IGNORE INTO district_areas (area_id, county, area_name, area_type, voter_density, primary_issues, canvassing_difficulty) VALUES
  ('OSW001', 'Oswego', 'Oswego Lakefront', 'lakefront', 150, '["infrastructure", "tourism", "veterans"]', 2),
  ('OSW002', 'Oswego', 'Rural Oswego Farms', 'agricultural', 25, '["agriculture", "taxes", "infrastructure"]', 4),
  ('CAY001', 'Cayuga', 'Auburn Suburban', 'suburban', 300, '["healthcare", "education", "economy"]', 2),
  ('CAY002', 'Cayuga', 'Cayuga Agricultural Zone', 'agricultural', 20, '["agriculture", "water_rights", "property_taxes"]', 5),
  ('OND001', 'Onondaga', 'Syracuse Suburban', 'suburban', 500, '["economy", "healthcare", "transportation"]', 1);

  -- Create indexes for performance
  CREATE INDEX IF NOT EXISTS idx_voters_county ON voters(county);
  CREATE INDEX IF NOT EXISTS idx_voters_address ON voters(street_address);
  CREATE INDEX IF NOT EXISTS idx_canvass_voter ON canvass_interactions(voter_id);
  CREATE INDEX IF NOT EXISTS idx_canvass_date ON canvass_interactions(contact_datetime);
  CREATE INDEX IF NOT EXISTS idx_sync_status ON sync_queue(sync_status);
`;

// Database initialization
export const initializeDatabase = (db) => {
  try {
    db.exec(createTables);
    console.log('✅ NY-24 Campaign database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
};

// Voter search functions optimized for mobile field use
export const searchVoters = (db, query, county = null) => {
  let sql = `
    SELECT * FROM voters 
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
  
  sql += ' ORDER BY demographic_score DESC, last_name ASC LIMIT 20';
  
  try {
    const stmt = db.prepare(sql);
    return stmt.all(params);
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
};

// Save canvass interaction with offline support
export const saveCanvassInteraction = (db, interaction) => {
  const sql = `
    INSERT INTO canvass_interactions (
      interaction_id, voter_id, volunteer_id, contact_datetime,
      response_level, issues_priority, volunteer_notes,
      yard_sign_request, follow_up_needed, contact_method,
      weather_conditions, interaction_duration
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const interactionId = `INT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    const stmt = db.prepare(sql);
    stmt.run([
      interactionId,
      interaction.voter_id,
      interaction.volunteer_id,
      interaction.contact_datetime,
      interaction.response_level,
      interaction.issues_priority,
      interaction.volunteer_notes,
      interaction.yard_sign_request ? 1 : 0,
      interaction.follow_up_needed ? 1 : 0,
      interaction.contact_method,
      interaction.weather_conditions,
      interaction.interaction_duration
    ]);
    
    // Add to sync queue for later upload
    addToSyncQueue(db, 'canvass_interactions', interactionId, 'insert', interaction);
    
    return { success: true, interaction_id: interactionId };
  } catch (error) {
    console.error('Save interaction error:', error);
    return { success: false, error: error.message };
  }
};

// Sync queue management
export const addToSyncQueue = (db, tableName, recordId, action, data) => {
  const sql = `
    INSERT INTO sync_queue (queue_id, table_name, record_id, action, data, priority)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  const queueId = `SYNC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const priority = tableName === 'canvass_interactions' ? 1 : 2; // High priority for voter interactions
  
  try {
    const stmt = db.prepare(sql);
    stmt.run([queueId, tableName, recordId, action, JSON.stringify(data), priority]);
    return true;
  } catch (error) {
    console.error('Sync queue error:', error);
    return false;
  }
};

export default {
  createTables,
  initializeDatabase,
  searchVoters,
  saveCanvassInteraction,
  addToSyncQueue
};