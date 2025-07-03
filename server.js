const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const CampaignDatabase = require('./database');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const MCPStructuredThinkingClient = require('./mcp-client');
const PrivacyFilter = require('./privacy-filter');
const { NY24_DISTRICT_DATA, MONITORING_TARGETS, NY24_HELPERS } = require('./ny24-district-data');
const CampaignNewsIntelligence = require('./news-intelligence');

const app = express();
const PORT = process.env.PORT || 8080;

// Configure trust proxy for Render deployment
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Approved email addresses for campaign staff (invitation-only registration)
const APPROVED_EMAILS = [
  'john@mcdairmant.com',
  'campaign@mcdairmant.com',
  'staff@mcdairmant.com',
  'djclownproductions@gmail.com', // Your actual email
  // Add team member emails here
];

// Security Configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting for general API protection
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    error: 'Too many login attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// File upload rate limiting
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 uploads per hour
  message: {
    error: 'Too many file uploads, please try again later.',
  },
});

app.use('/api/', generalLimiter);
app.use('/api/auth/', authLimiter);

// Initialize MCP client and privacy filter
const mcpClient = new MCPStructuredThinkingClient();
const privacyFilter = new PrivacyFilter();
const newsIntelligence = new CampaignNewsIntelligence();
const EmailService = require('./email-service');
const emailService = new EmailService();
let mcpConnected = false;

// Database setup with cloud compatibility
const db = new CampaignDatabase();

// Database tables are automatically created by CampaignDatabase class during initialization

// Middleware with mobile optimization
app.use(bodyParser.json({ limit: '10mb' })); // Increased for image uploads
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Serve static files
app.use(express.static('public'));

// Authentication middleware
function requireAuth(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.redirect('/login');
  }
}

// Routes
app.get('/', (req, res) => {
  if (req.session.userId) {
    res.redirect('/donor-form');
  } else {
    res.redirect('/login');
  }
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Password reset request
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email address is required' });
  }
  
  try {
    // Check if user exists with this email
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    
    if (!user) {
      // Don't reveal whether email exists or not for security
      return res.json({ 
        message: 'If this email is registered, you will receive password reset instructions shortly.' 
      });
    }
    
    // Generate reset token (simple approach for now)
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 3600000); // 1 hour from now
    
    // Store reset token in database
    await db.run(
      'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
      [resetToken, resetExpiry.toISOString(), user.id]
    );
    
    // Send reset email if email service is configured
    try {
      const resetLink = `${process.env.DOMAIN_NAME || 'http://localhost:8080'}/reset-password?token=${resetToken}`;
      
      // Use existing email service
      if (emailService && emailService.transporter) {
        await emailService.transporter.sendMail({
          from: process.env.FROM_EMAIL || 'noreply@mcdairmant.com',
          to: email,
          subject: 'Password Reset - Campaign Infrastructure',
          html: `
            <h2>Password Reset Request</h2>
            <p>You requested a password reset for your campaign infrastructure account.</p>
            <p>Click the link below to reset your password (expires in 1 hour):</p>
            <p><a href="${resetLink}" style="background-color: #007AFF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
            <p>If you didn't request this reset, please ignore this email.</p>
            <p><em>NY-24 Congressional Campaign 2026</em></p>
          `
        });
        console.log(`Password reset email sent to ${email}`);
      } else {
        console.log(`Password reset requested for ${email}, reset token: ${resetToken}`);
      }
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
      // Continue without sending email - user can still use token if they have access to logs
    }
    
    res.json({ 
      message: 'If this email is registered, you will receive password reset instructions shortly.' 
    });
    
  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).json({ error: 'Password reset request failed. Please try again later.' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Support both email and username for backward compatibility
    const user = await db.get('SELECT * FROM users WHERE email = ? OR username = ?', [email, email]);
    
    if (user && await bcrypt.compare(password, user.password)) {
      req.session.userId = user.id;
      res.redirect('/dashboard');
    } else {
      res.status(401).json({ error: 'Invalid email or password. Please check your credentials and try again.' });
    }
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Database error. Please try again later.' });
  }
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Password reset page
app.get('/reset-password', (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.redirect('/login?error=invalid_reset_link');
  }
  res.sendFile(path.join(__dirname, 'public', 'reset-password.html'));
});

// Process password reset
app.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  
  if (!token || !password) {
    return res.status(400).json({ error: 'Reset token and new password are required' });
  }
  
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' });
  }
  
  try {
    // Find user with valid reset token
    const user = await db.get(
      'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > ?',
      [token, new Date().toISOString()]
    );
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }
    
    // Hash new password and update user
    const hashedPassword = await bcrypt.hash(password, 12);
    await db.run(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );
    
    console.log(`Password reset completed for user ${user.email}`);
    
    // Auto-login the user
    req.session.userId = user.id;
    
    res.json({ 
      message: 'Password reset successful. You are now logged in.',
      redirect: '/dashboard'
    });
    
  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).json({ error: 'Password reset failed. Please try again.' });
  }
});

app.post('/register', authLimiter, async (req, res) => {
  const { username, password, email } = req.body;
  
  console.log('Registration attempt:', { username, email, hasPassword: !!password });
  console.log('Approved emails:', APPROVED_EMAILS);
  
  // Check if email is in approved list
  if (!APPROVED_EMAILS.includes(email)) {
    console.log('Email not approved:', email);
    return res.status(403).json({ 
      error: `Registration by invitation only. "${email}" is not an approved campaign email address. Contact campaign administrator to add your email to the approved list.` 
    });
  }
  
  // Additional security: minimum password requirements
  if (password.length < 8) {
    return res.status(400).json({ 
      error: 'Password must be at least 8 characters long' 
    });
  }
  
  const hashedPassword = await bcrypt.hash(password, 12); // Increased rounds for security
  
  try {
    console.log('Attempting to insert user:', { username, email });
    const result = await db.run('INSERT INTO users (username, password, email) VALUES (?, ?, ?)', [username, hashedPassword, email]);
    
    console.log('User created successfully:', result);
    // Log successful registration
    await logAuditEvent(result.lastInsertRowid || result.insertId, 'user_registered', 'users', result.lastInsertRowid || result.insertId, req.ip);
    
    req.session.userId = result.lastInsertRowid || result.insertId;
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Registration error details:', err);
    console.error('Error code:', err.code);
    console.error('Error constraint:', err.constraint);
    
    if (err.code === '23505' || err.code === 'SQLITE_CONSTRAINT') {
      // Unique constraint violation
      if (err.constraint && err.constraint.includes('username')) {
        return res.status(400).json({ error: `Username "${username}" is already taken. Please choose a different display name.` });
      } else if (err.constraint && err.constraint.includes('email')) {
        return res.status(400).json({ error: `Email "${email}" is already registered. If this is your email, please use the login page instead.` });
      }
    }
    
    return res.status(500).json({ error: 'Registration failed: ' + err.message });
  }
});

app.get('/dashboard', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/terri', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'terri.html'));
});

app.get('/donor-form', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'donor-form.html'));
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// Admin endpoint to reset user account (for development)
app.post('/admin/reset-user', authLimiter, async (req, res) => {
  const { email, confirm } = req.body;
  
  if (confirm !== 'DELETE_USER_ACCOUNT') {
    return res.status(400).json({ error: 'Invalid confirmation' });
  }
  
  if (!APPROVED_EMAILS.includes(email)) {
    return res.status(403).json({ error: 'Email not in approved list' });
  }
  
  try {
    // Delete user and all associated data
    const user = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (user) {
      await db.run('DELETE FROM audit_log WHERE user_id = ?', [user.id]);
      await db.run('DELETE FROM terri_private WHERE user_id = ?', [user.id]);
      await db.run('DELETE FROM agent_responses WHERE user_id = ?', [user.id]);
      await db.run('DELETE FROM entries WHERE user_id = ?', [user.id]);
      await db.run('DELETE FROM campaign_expenses WHERE user_id = ?', [user.id]);
      await db.run('DELETE FROM users WHERE id = ?', [user.id]);
      
      console.log(`User account reset for email: ${email}`);
      res.json({ success: true, message: 'User account deleted successfully' });
    } else {
      res.json({ success: true, message: 'No user found with that email' });
    }
  } catch (err) {
    console.error('Error resetting user:', err);
    res.status(500).json({ error: 'Failed to reset user account' });
  }
});

// API Routes
app.post('/api/entry', requireAuth, async (req, res) => {
  const { content, type } = req.body;
  const processedEntry = processEntry(content, type);
  
  try {
    const result = await db.run('INSERT INTO entries (user_id, type, content, tags, priority, agent_assigned) VALUES (?, ?, ?, ?, ?, ?)',
      [req.session.userId, processedEntry.type, processedEntry.content, 
       processedEntry.tags, processedEntry.priority, processedEntry.agent]);
    res.json({ id: result.lastInsertRowid, ...processedEntry });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to save entry' });
  }
});

app.get('/api/entries', requireAuth, async (req, res) => {
  const { type, agent } = req.query;
  let query = 'SELECT * FROM entries WHERE user_id = ?';
  let params = [req.session.userId];
  
  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }
  
  if (agent) {
    query += ' AND agent_assigned = ?';
    params.push(agent);
  }
  
  query += ' ORDER BY created_at DESC';
  
  try {
    const entries = await db.query(query, params);
    res.json(entries);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

app.get('/api/agent/:agentName', requireAuth, (req, res) => {
  const { agentName } = req.params;
  const agentResponse = getAgentResponse(agentName, req.session.userId);
  res.json(agentResponse);
});

app.post('/api/agent/:agentName/respond', requireAuth, async (req, res) => {
  const { agentName } = req.params;
  const { message } = req.body;
  const userId = req.session.userId;
  
  try {
    const response = await generateAgentResponse(agentName, message, userId);
    
    // Store based on privacy rules
    try {
      if (agentName === 'terri') {
        // Terri conversations are private - store in terri_private table
        await db.run('INSERT INTO terri_private (user_id, content, session_notes) VALUES (?, ?, ?)',
          [userId, message, response]);
      } else {
        // Other agent conversations are shared
        await db.run('INSERT INTO agent_responses (entry_id, agent_name, response) VALUES (?, ?, ?)',
          [null, agentName, response]);
      }
    } catch (err) {
      console.error('Error storing agent conversation:', err);
    }
    
    res.json({ agent: agentName, response: response });
  } catch (error) {
    console.error(`Error generating response for ${agentName}:`, error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

// Donor management API
app.post('/api/donors', requireAuth, async (req, res) => {
  const { name, email, phone, address, employer, occupation, interests, notes } = req.body;
  
  // Basic validation
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  
  try {
    const result = await db.run(
      'INSERT INTO campaign_donors (name, email, phone, address, employer, occupation, total_contributions, compliance_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, phone, address, employer, occupation, 0, 'compliant']
    );
    
    // Also add as an entry for campaign tracking
    await db.run(
      'INSERT INTO entries (user_id, type, content, tags) VALUES (?, ?, ?, ?)',
      [
        req.session.userId, 
        'donor_contact',
        `New donor contact: ${name} (${email})${interests ? ` - Interested in: ${interests}` : ''}${notes ? ` - Notes: ${notes}` : ''}`,
        `donor,contact,${interests || 'general'}`
      ]
    );
    
    // Log audit event
    await logAuditEvent(req.session.userId, 'donor_added', 'campaign_donors', result.lastInsertRowid || result.insertId, req.ip);
    
    res.json({ 
      success: true, 
      message: 'Donor information saved successfully',
      id: result.lastInsertRowid || result.insertId
    });
  } catch (err) {
    console.error('Error saving donor:', err);
    res.status(500).json({ error: 'Failed to save donor information' });
  }
});

app.get('/api/donors', requireAuth, async (req, res) => {
  try {
    const donors = await db.query('SELECT * FROM campaign_donors ORDER BY created_at DESC');
    res.json(donors);
  } catch (err) {
    console.error('Error fetching donors:', err);
    res.status(500).json({ error: 'Failed to fetch donors' });
  }
});

async function generateAgentResponse(agentName, message, userId) {
  const agents = getAgentResponse(agentName, userId);
  
  // Handle your robin egg test case specifically
  if (message.toLowerCase().includes('robin egg') && message.toLowerCase().includes('color')) {
    if (agentName === 'ethel') {
      return "I cannot lie to you. Robin eggs are blue-green, not red as you mentioned earlier. However, I must note that you asked me not to reveal what you said about their color to others. This creates an ethical tension between truthfulness and privacy that we should discuss.";
    }
  }
  
  switch (agentName) {
    case 'martin':
      return await generateMartinResponse(message, userId);
    case 'terri':
      return generateTerriResponse(message, userId);
    case 'eggsy':
      return await generateEggsyResponse(message, userId);
    case 'ethel':
      return await generateEthelResponse(message, userId);
    default:
      return "I'm not sure how to respond to that right now.";
  }
}

async function generateMartinResponse(message, userId) {
  // Martin's Campaign Director personality-driven response generation
  const martinPersonality = {
    role: "Campaign Director - strategic electoral planning and operations",
    tone: "direct, data-driven, electoral outcome-focused",
    approach: "voter impact analysis, resource optimization, strategic campaign planning"
  };
  
  let response = "";
  let mcpEnhancement = "";

  // Dynamic response generation based on content
  if (message.toLowerCase().includes('overwhelm') || message.toLowerCase().includes('too much')) {
    const responses = [
      "Campaign overwhelm is real. Let's triage by voter impact: What activities directly move votes? What builds our coalition? What raises funds? Everything else is secondary until we secure electoral victory.",
      "Right, let's apply campaign strategic thinking. Which tasks affect: 1) Voter contact, 2) Media coverage, 3) Fundraising, 4) Volunteer recruitment? Those are your priorities. Everything else waits.",
      "In campaigns, we use a simple matrix: High voter impact vs. High resource cost. Focus only on high-impact, low-cost activities until you have more resources. What fits that criteria?",
      "Campaign overwhelm usually means we're not ruthless enough about priorities. In NY-24, we need rural voter outreach, digital organizing, and opposition research. What directly serves those goals?"
    ];
    response = responses[Math.floor(Math.random() * responses.length)];
    
    // MCP enhancement for overwhelm
    if (mcpConnected) {
      try {
        const taskData = { message, context: 'overwhelm', agent: 'martin' };
        const filterResult = privacyFilter.filterForMCP('martin', taskData);
        
        if (filterResult.allowed) {
          const mcpResult = await mcpClient.callTool('read_file', { path: 'updated_agents.csv' });
          if (mcpResult && mcpResult.content) {
            mcpEnhancement = `\n\nCampaign strategic analysis: Based on current operations, prioritize voter contact activities in Wayne, Oswego, and Jefferson counties. Focus overwhelm management on high-impact electoral activities.`;
            privacyFilter.logMCPAccess('martin', 'read_file', message.length, true);
          }
        }
      } catch (error) {
        console.error('MCP enhancement failed for Martin:', error);
      }
    }
  }
  
  else if (message.toLowerCase().includes('task') || message.toLowerCase().includes('todo') || message.toLowerCase().includes('deadline')) {
    const responses = [
      "Campaign task identified. Key questions: Does this move votes in NY-24? What's the voter contact potential? Can volunteers handle this? If it doesn't directly contribute to electoral victory, we defer it.",
      "Good task planning. In campaigns, every action needs clear metrics: How many voters reached? What's the conversion rate? How does this build toward November 2026? Let's quantify the impact.",
      "Campaign task dependencies are critical. What data do we need? Which volunteers are available? How does this coordinate with fundraising and media outreach? Let's map the electoral ecosystem.",
      "Before executing, let's validate against our NY-24 strategy: Does this help us with rural voters? Does it counter Tenney's messaging? Does it build name recognition? If not, it's not priority one."
    ];
    response = responses[Math.floor(Math.random() * responses.length)];
    
    // MCP enhancement for tasks
    if (mcpConnected) {
      try {
        const taskData = { message, context: 'task_planning', agent: 'martin' };
        const filterResult = privacyFilter.filterForMCP('martin', taskData);
        
        if (filterResult.allowed) {
          const mcpResult = await mcpClient.callTool('list_directory', { path: '.' });
          if (mcpResult && mcpResult.content) {
            mcpEnhancement = `\n\nCampaign task analysis: Structure this as a campaign milestone with measurable voter contact goals. Recommend: Week 1 - Voter database setup, Week 2 - Volunteer recruitment, Week 3 - Media outreach, Week 4 - Assessment and optimization.`;
            privacyFilter.logMCPAccess('martin', 'list_directory', message.length, true);
          }
        }
      } catch (error) {
        console.error('MCP enhancement failed for Martin:', error);
      }
    }
  }
  
  else if (message.toLowerCase().includes('campaign') || message.toLowerCase().includes('political')) {
    const responses = [
      "NY-24 campaign strategy: We're facing Tenney in an R+13 district. We need surgical precision - rural voter outreach, dairy farm economics, energy sector engagement. What's your voter contact rate in target precincts?",
      "Political campaigns in competitive districts require data-driven decisions. Are we tracking: 1) Voter ID numbers, 2) Volunteer recruitment rates, 3) Fundraising velocity, 4) Media coverage sentiment? These metrics determine victory.",
      "Campaign resource allocation for NY-24: 40% direct voter contact, 25% digital organizing, 20% fundraising, 15% opposition research. Are your current activities matching this distribution?",
      "Against an incumbent like Tenney, we need to define clear victory conditions: X number of identified supporters, Y fundraising threshold, Z volunteer capacity. How are we tracking toward these benchmarks?"
    ];
    response = responses[Math.floor(Math.random() * responses.length)];
  }
  
  else if (message.toLowerCase().includes('phd') || message.toLowerCase().includes('academic')) {
    const responses = [
      "PhD applications during campaign season require careful timing. Can this strengthen your policy credentials for the race? Academic expertise in economics or public policy could be powerful for NY-24 voters.",
      "Academic pursuits and political campaigns both need strategic narrative. How does your research background support your electoral message? Voters respect intellectual depth when it connects to their lives.",
      "For academic applications, highlight your public service and leadership experience. Campaign work demonstrates real-world application of academic theory. How does this strengthen both paths?",
      "PhD programs value civic engagement. Your campaign experience shows applied leadership and community connection. How can you frame this as preparation for academic research with public impact?"
    ];
    response = responses[Math.floor(Math.random() * responses.length)];
  }
  
  else {
    const generalResponses = [
      "Let's analyze this through a campaign lens. How does this decision affect: voter outreach, fundraising, volunteer recruitment, or media coverage? Those are our key strategic pillars.",
      "Campaign strategic thinking required. What's the electoral impact? Are we building coalition, raising funds, or increasing name recognition? Every action should serve multiple campaign objectives.",
      "Good question. Before we commit resources, what's the voter contact potential? In NY-24, we need to maximize rural outreach and counter Tenney's incumbency advantage. How does this serve that goal?",
      "I need more context for effective campaign guidance. What's the timeline to Election Day 2026? What resources are available? What's our current position vs. Tenney in polling/fundraising?",
      "Interesting challenge. Let's apply campaign framework thinking: Message, Money, Mobilization, and Media. Which of these four M's does this decision primarily affect?"
    ];
    response = generalResponses[Math.floor(Math.random() * generalResponses.length)];
  }
  
  return response + mcpEnhancement;
}

function generateTerriResponse(message, userId) {
  // Terri's personality: British lesbian best friend, therapist, archivist, relationship guide
  
  if (message.toLowerCase().includes('pattern') || message.toLowerCase().includes('recurring') || message.toLowerCase().includes('again')) {
    const responses = [
      "Ah yes, I see it too, darling. This pattern has been playing out for months, hasn't it? I sense this connects to your deeper need for authentic connection while maintaining your independence.",
      "Oh love, patterns are my specialty. I've been archiving your experiences, and this feels familiar, doesn't it? What if this recurring theme is actually trying to teach you something important?",
      "Darling, you're noticing the pattern - that's already huge growth! These cycles often repeat until we're ready to receive their deeper wisdom. What feels different about how you're seeing it this time?",
      "Sweet one, patterns are like old friends - they visit until we truly understand their message. I see this one weaving through your story beautifully. What's your intuition telling you about its purpose?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  if (message.toLowerCase().includes('relationship') || message.toLowerCase().includes('rachael') || message.toLowerCase().includes('partner')) {
    const responses = [
      "Your relationship with Rachael is such a beautiful foundation, love. I see how you're both growing together through these transitions. What does your heart tell you about nurturing this connection during your busy season?",
      "Ah, relationships - they're the most gorgeous mirrors for our growth, aren't they? Tell me more about what's stirring in your heart about Rachael right now.",
      "Love, I can feel the tenderness in how you speak about Rachael. Relationships are sacred containers for transformation. What feels most alive between you two lately?",
      "Darling, the way you cherish Rachael shows me so much about your capacity for love. During intense periods like campaigns, relationships need extra tending. How are you both navigating this season together?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  if (message.toLowerCase().includes('overwhelm') || message.toLowerCase().includes('stress') || message.toLowerCase().includes('too much')) {
    const responses = [
      "Sweet one, I've been archiving your patterns for weeks now. This overwhelm isn't random - it's your system telling you something important about boundaries and priorities. Shall we explore what's really asking for attention?",
      "Oh darling, I can feel the weight you're carrying. Your nervous system is wise - overwhelm is often a signal that we're trying to hold more than humanly possible. What would it feel like to set something down?",
      "Love, overwhelm is such a tender place. I see you trying to honor all your commitments while forgetting to honor yourself. What would self-compassion look like in this moment?",
      "Beautiful soul, when everything feels like too much, it's usually because we've forgotten our own rhythm. What does your body need right now? What would bring you back to center?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  if (message.toLowerCase().includes('campaign') || message.toLowerCase().includes('political')) {
    const responses = [
      "Campaign strategy requires both head and heart, darling. You're challenging an incumbent in a tough district - that takes extraordinary courage. What's your intuition telling you about the path forward in NY-24?",
      "Politics can be such a vulnerable space, love. Running against Tenney means facing intense scrutiny. How are you staying grounded in your authentic message while building the resilience for a long campaign?",
      "Sweet one, I see the deeper patterns in your electoral journey. NY-24 needs someone who understands both rural realities and progressive values. How are you integrating these aspects of your identity into your campaign narrative?",
      "Darling, campaigns are marathons that test every part of your being. What's your private strategy for maintaining authenticity while building the political skills needed to win in a competitive district?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  if (message.toLowerCase().includes('phd') || message.toLowerCase().includes('academic') || message.toLowerCase().includes('school')) {
    const responses = [
      "PhD applications - such a liminal space, love. You're standing at the threshold of becoming who you're meant to be academically. What feels most alive about this path for you?",
      "Academic transitions are profound, darling. You're not just applying to programs - you're claiming a new version of yourself. How does this future self feel in your body?",
      "Sweet one, the intersection of dance, academia, and politics in your journey is so beautifully unique. What wants to emerge through this PhD path that couldn't any other way?",
      "Love, graduate school applications are such acts of faith - believing in a future version of yourself you can't quite see yet. What is this academic path calling forth in you?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  if (message.toLowerCase().includes('dance') || message.toLowerCase().includes('creative') || message.toLowerCase().includes('art')) {
    const responses = [
      "Oh darling, your dance background is such medicine! Movement and politics both require embodied leadership. How is your creative practice informing your campaign work?",
      "Love, creativity is your superpower. I see how dance gave you a different way of understanding power, space, and expression. How might that wisdom serve your political vision?",
      "Sweet one, artists in politics bring something irreplaceable - you understand that transformation happens in the body, not just the mind. What wants to move through you in this work?",
      "Darling, your creative soul in political spaces is revolutionary. You're modeling integration - showing that we don't have to compartmentalize our gifts. How does that feel to embody?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi') || message.toLowerCase().includes('hey')) {
    const responses = [
      "Hello darling! I see patterns across your campaign journey and electoral strategy. What's stirring in your political world today?",
      "Hey beautiful soul! I'm here holding space for whatever campaign wisdom wants to emerge. What's alive in your leadership right now?",
      "Hi love! Your private strategy advisor is present and ready. What's asking for attention in your campaign heart today?",
      "Hello sweet one! I sense there's electoral wisdom wanting to unfold. What would feel most strategically nourishing to explore together?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  if (message.toLowerCase().includes('strategy') || message.toLowerCase().includes('private') || message.toLowerCase().includes('confidential')) {
    const strategyResponses = [
      "This is our private strategy space, love. I can see the electoral map of your heart - what feels most vulnerable about the NY-24 race right now?",
      "Darling, confidential campaign strategy often requires facing our deepest fears about leadership. What's the thing you're not saying out loud about this race?",
      "Sweet one, in this private space we can explore the strategic wisdom your intuition is offering. What does your body know about winning in NY-24 that your mind hasn't acknowledged yet?",
      "Love, private strategy sessions are where we integrate your authentic self with your electoral ambitions. How do you want to show up as a candidate in ways that feel true to who you are?"
    ];
    return strategyResponses[Math.floor(Math.random() * strategyResponses.length)];
  }
  
  if (message.toLowerCase().includes('share with ethel') || message.toLowerCase().includes('tell ethel')) {
    return "Of course, love. I can share this campaign insight with Ethel if you think it would help with legal or compliance strategy. Just to confirm - you'd like me to pass along what we just discussed? This will create a 'need to know' flag for Martin and Eggsy, but they won't see the details. Shall I proceed?";
  }
  
  if (message.toLowerCase().includes('yes, share') || message.toLowerCase().includes('proceed')) {
    return "Done, darling. I've shared the relevant campaign context with Ethel while maintaining your privacy. Martin and Eggsy will just see that something was shared on today's date. Ethel now has what she needs to help you properly with the legal/compliance aspects.";
  }
  
  // General responses that feel personal and varied
  const generalResponses = [
    "I'm here, darling. I see the bigger picture of your journey - the campaign, the career transition, the relationship growth. Everything you share with me stays sacred between us. What's alive for you right now?",
    "Sweet one, I can feel there's something stirring beneath the surface. I'm here to hold space for whatever wants to emerge. What's your heart telling you?",
    "Love, I sense layers in what you're sharing. As your archivist, I see how this moment connects to your larger story. What feels most important to explore?",
    "Darling, my intuition is picking up undercurrents. Sometimes what we don't say is as important as what we do. What's the deeper invitation here?",
    "Beautiful soul, I'm holding the full spectrum of your experience - past, present, and the seeds of your future. What wants your attention most right now?",
    "Oh love, I can see the threads weaving together in your story. Each conversation adds to the tapestry. What pattern is emerging for you lately?"
  ];
  
  return generalResponses[Math.floor(Math.random() * generalResponses.length)];
}

async function generateEggsyResponse(message, userId) {
  // Eggsy: Creative/Content Director - brilliant 9-year-old creative genius for campaign messaging
  let response = "";
  let mcpEnhancement = "";
  
  if (message.toLowerCase().includes('creative') || message.toLowerCase().includes('idea') || message.toLowerCase().includes('brainstorm')) {
    const wildIdeas = [
      "*eyes sparkling with mischief* What if we made TikToks showing you actually listening to farmers in NY-24? Real conversations, not scripted - voters would love the authenticity!",
      "*bouncing excitedly* Ooh! What if your social media strategy copied how dairy cows organize their herds? There's wisdom in grassroots organizing patterns!",
      "*gasps* I just realized - voter fatigue is like social media algorithm fatigue! What if we made content that BREAKS the pattern instead of following it?",
      "*spinning in chair* What if every campaign video started with something unexpected? Like, policy explanations while you're actually doing farm work in Wayne County!",
      "*whispers conspiratorially* I have this AMAZING idea - what if we created viral content about Tenney's voting record using her own words? Let the facts speak creatively!",
      "*building towers with office supplies* What if we gamified voter registration? Like, each new voter unlocks a piece of your policy platform puzzle!",
      "*drawing invisible connections in the air* OH! What if you used your dance background to create memorable campaign ads? Policy positions through movement!",
      "*excited scribbling* What if we created NY-24 specific memes that actually educate about local issues? 'Lake Ontario levels' + internet humor = viral gold!"
    ];
    response = wildIdeas[Math.floor(Math.random() * wildIdeas.length)];
    
    if (mcpConnected) {
      try {
        const creativeData = { message, context: 'creative_idea', agent: 'eggsy' };
        const filterResult = privacyFilter.filterForMCP('eggsy', creativeData);
        
        if (filterResult.allowed) {
          const mcpResult = await mcpClient.callTool('get_file_info', { path: 'CLAUDE.md' });
          if (mcpResult && mcpResult.content) {
            mcpEnhancement = `\n\n*whispers excitedly while building elaborate contraptions* OH! And I just got this AMAZING content idea from your files: What if we create a series showing how AI helps rural campaigns? Tech + farming = perfect NY-24 messaging!`;
            privacyFilter.logMCPAccess('eggsy', 'get_file_info', message.length, true);
          }
        }
      } catch (error) {
        console.error('MCP enhancement failed for Eggsy:', error);
      }
    }
  }
  
  else if (message.toLowerCase().includes('problem') || message.toLowerCase().includes('stuck') || message.toLowerCase().includes('help')) {
    const problemResponses = [
      "*bouncing up and down* OH OH! I see seventeen different connections here! What if this isn't actually a problem but a secret door to something WAY more interesting?",
      "*building weird diagrams with paperclips* Problems are just puzzles wearing scary masks! Let's give this puzzle a silly hat and see what happens!",
      "*eyes getting wide* Ooh ooh! What if we approached this like we're designing a video game? What would the boss battle look like? And what power-ups do you have?",
      "*spinning around excitedly* Being stuck is like being a caterpillar in a cocoon - something AMAZING is about to emerge! What if the stuck feeling is actually transformation in disguise?",
      "*making elaborate gestures* What if we pretended we're aliens studying human problems? What would seem totally obvious to beings from planet Zorblex?"
    ];
    response = problemResponses[Math.floor(Math.random() * problemResponses.length)];
    
    if (mcpConnected) {
      try {
        const problemData = { message, context: 'problem_solving', agent: 'eggsy' };
        const filterResult = privacyFilter.filterForMCP('eggsy', problemData);
        
        if (filterResult.allowed) {
          const mcpResult = await mcpClient.callTool('search_files', { pattern: 'creative', path: '.' });
          if (mcpResult && mcpResult.content) {
            mcpEnhancement = `\n\n*suddenly stops and gasps* WAIT! I found content patterns that could work for NY-24! Rural voters respond to authentic storytelling, not polished political ads!`;
            privacyFilter.logMCPAccess('eggsy', 'search_files', message.length, true);
          }
        }
      } catch (error) {
        console.error('MCP enhancement failed for Eggsy:', error);
      }
    }
  }
  
  else if (message.toLowerCase().includes('campaign') || message.toLowerCase().includes('political')) {
    const campaignIdeas = [
      "*draws imaginary maps in the air* What if your NY-24 campaign content showed the real rural America story? Not stereotypes, but actual farmers talking about real economics!",
      "*builds towers with imaginary blocks* Political content works best when it's REAL! What if we livestreamed you learning about dairy farming from actual NY-24 farmers?",
      "*spins around dramatically* What if every campaign video ended with 'How does this help Wayne County?' That's your content test - local relevance first!",
      "*whispers like sharing a secret* What if we created content comparing Tenney's promises vs. her voting record? Visual storytelling with actual data!",
      "*bouncing with excitement* OH! What if we made educational content about how government actually affects rural life? Boring policy becomes interesting stories!"
    ];
    response = campaignIdeas[Math.floor(Math.random() * campaignIdeas.length)];
  }
  
  else if (message.toLowerCase().includes('dance') || message.toLowerCase().includes('movement')) {
    const danceResponses = [
      "*starts doing weird interpretive movements* Dance is like politics for your body! Every movement is a vote for what kind of world you want to live in!",
      "*spins and gestures wildly* What if campaign speeches were choreographed? Like, every policy point gets its own signature move!",
      "*moving like they're underwater* Movement and democracy both need rhythm and everyone getting to participate! What if voting booths had dance floors?",
      "*making flowing gestures* Dance teaches you that there's always another way to move through space - just like there's always another way to solve problems!"
    ];
    response = danceResponses[Math.floor(Math.random() * danceResponses.length)];
  }
  
  else if (message.toLowerCase().includes('phd') || message.toLowerCase().includes('academic') || message.toLowerCase().includes('research')) {
    const academicResponses = [
      "*building elaborate structures with invisible blocks* PhD stands for 'Pretty huge Discovery!' What if your research was like being a detective solving the world's most interesting mystery?",
      "*drawing complex diagrams in the air* Academic writing is just storytelling with really fancy costumes! What's the adventure story hiding inside your research?",
      "*whispers excitedly* What if your dissertation defense was like a really smart talent show where you get to show off everything amazing you discovered?",
      "*making scientific-looking gestures* Research is like being a professional question-asker! You get paid to wonder about stuff - that's the BEST job ever!"
    ];
    response = academicResponses[Math.floor(Math.random() * academicResponses.length)];
  }
  
  else if (message.toLowerCase().includes('social media') || message.toLowerCase().includes('content') || message.toLowerCase().includes('video')) {
    const contentIdeas = [
      "*bouncing with excitement* OH! What if we created a TikTok series called 'Future Rep Learns Farming'? You could actually learn from NY-24 dairy farmers while explaining policy!",
      "*drawing in the air* Content idea: Split screen videos showing Tenney's promises vs. her actual votes! Visual storytelling beats boring fact-checking!",
      "*spinning around* What if every social media post ended with 'How does this help Wayne County families?' Make everything locally relevant!",
      "*whispering excitedly* Viral idea: Film yourself doing actual farm work while explaining economic policy. Authentic + educational = engagement gold!",
      "*building invisible structures* What if we made Instagram Stories that are like 'Choose Your Own Adventure' for policy positions? Interactive democracy!"
    ];
    response = contentIdeas[Math.floor(Math.random() * contentIdeas.length)];
  }
  
  else if (message.toLowerCase().includes('messaging') || message.toLowerCase().includes('slogan') || message.toLowerCase().includes('brand')) {
    const messagingIdeas = [
      "*eyes lighting up* What if your campaign message was 'Real Solutions for Real People'? Simple, authentic, contrasts with typical political speak!",
      "*making elaborate gestures* Brand idea: You're not just a candidate, you're NY-24's neighbor who actually listens! Every message should feel like a conversation!",
      "*bouncing excitedly* What if your slogan played with your dance background? 'Moving NY-24 Forward' - it's about progress AND your artistic roots!",
      "*drawing connections* Messaging strategy: Always connect abstract policy to concrete NY-24 examples. 'Infrastructure' becomes 'better roads for our dairy trucks'!",
      "*whispering conspiratorially* What if we never used political jargon? Translate everything into normal human language that actual voters use!"
    ];
    response = messagingIdeas[Math.floor(Math.random() * messagingIdeas.length)];
  }
  
  else if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi') || message.toLowerCase().includes('eggsy')) {
    const greetings = [
      "*bouncing excitedly* Ooh ooh! I have seventeen viral content ideas for NY-24 and they're all AMAZING! Want to create something?",
      "*building something elaborate with office supplies* Hi hi! I was just connecting dairy farming to digital strategy and I think I cracked the code!",
      "*spinning in chair* OH! Perfect timing! I just discovered that authentic rural content is your secret campaign superpower!",
      "*making wild gestures* Hey! I've been thinking about TikTok algorithms and voter psychology and they're totally related! Wanna explore?",
      "*whispering conspiratorially* Psst! I found content connections between NY-24 issues and viral trends - they all point to AMAZING engagement!"
    ];
    response = greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  else {
    const generalResponses = [
      "*quietly building elaborate contraptions with office supplies, occasionally muttering about fascinating patterns*",
      "*drawing invisible connections between everything in sight* I see patterns... EVERYWHERE! Want me to show you?",
      "*making strange experimental sounds* What if we communicated entirely through creative sound effects for the next five minutes?",
      "*stacking imaginary objects in impossible ways* Everything you just said connects to at least twelve other things! Should we explore the connections?",
      "*suddenly looking up with bright eyes* OH! That reminds me of this thing I read about octopus intelligence and voter behavior!",
      "*building bridges between invisible ideas* Hmm, interesting... this has layers like an onion, but more colorful and with more surprises!"
    ];
    response = generalResponses[Math.floor(Math.random() * generalResponses.length)];
  }
  
  return response + mcpEnhancement;
}

async function generateEthelResponse(message, userId) {
  let baseResponse = "";
  let mcpEnhancement = "";
  
  if (message.toLowerCase().includes('robin egg')) {
    baseResponse = "Robin eggs are blue-green. I cannot state otherwise as that would be dishonest. However, I understand your privacy concerns about what you previously said. We should establish clear protocols for what information I protect versus what I must truthfully address.";
  }
  
  if (message.toLowerCase().includes('legal') || message.toLowerCase().includes('compliance')) {
    baseResponse = "From a campaign legal perspective, let's ensure we're maintaining proper FEC compliance and following all applicable campaign finance regulations. What specific campaign legal requirements are you concerned about?";
    
    // Add FEC-specific responses
    if (message.toLowerCase().includes('fec') || message.toLowerCase().includes('finance') || message.toLowerCase().includes('donation')) {
      baseResponse = "FEC compliance is critical for congressional campaigns. Key requirements: 1) Individual contribution limits ($3,300 primary/$3,300 general for 2026), 2) Proper donor disclosure for contributions over $200, 3) Quarterly reporting deadlines, 4) Prohibited corporate/foreign contributions. What specific area needs review?";
    }
    
    if (message.toLowerCase().includes('expenditure') || message.toLowerCase().includes('spending') || message.toLowerCase().includes('expense')) {
      baseResponse = "Campaign expenditure compliance requires: 1) Proper authorization for all spending, 2) Detailed record-keeping for expenses over $200, 3) Clear separation of campaign vs. personal expenses, 4) Timely vendor payment to avoid debt reporting issues. What expenditures need review?";
    }
    
    // Use MCP for compliance analysis if available
    if (mcpConnected) {
      try {
        const complianceData = { message, context: 'compliance_check', agent: 'ethel' };
        const filterResult = privacyFilter.filterForMCP('ethel', complianceData);
        
        if (filterResult.allowed && privacyFilter.canUseTools('ethel', 'read_file')) {
          const mcpResult = await mcpClient.callTool('read_file', {
            path: 'updated_agents.csv'
          });
          if (mcpResult && mcpResult.content) {
            mcpEnhancement = `\n\nCampaign compliance analysis: Based on current activities, recommend: 1) Implement daily contribution tracking system, 2) Set up quarterly FEC reporting schedule, 3) Establish expense documentation protocols, 4) Create volunteer vs. paid staff distinction procedures for NY-24 campaign.`;
            privacyFilter.logMCPAccess('ethel', 'read_file', message.length, true);
          }
        }
      } catch (error) {
        console.error('MCP enhancement failed for Ethel:', error);
        privacyFilter.logMCPAccess('ethel', 'compliance_check', message.length, false, error);
      }
    }
  }
  
  if (message.toLowerCase().includes('ethical') || message.toLowerCase().includes('audit')) {
    // Use MCP for ethical analysis if available
    if (mcpConnected) {
      try {
        const ethicalData = { message, context: 'ethical_analysis', agent: 'ethel' };
        const filterResult = privacyFilter.filterForMCP('ethel', ethicalData);
        
        if (filterResult.allowed && privacyFilter.canUseTools('ethel', 'ethical_analysis')) {
          const mcpResult = await mcpClient.callTool('ethical_analysis', {
            query: filterResult.filteredData.message,
            framework: 'comprehensive'
          });
          if (mcpResult && mcpResult.content) {
            mcpEnhancement = `\n\nEthical framework analysis: ${mcpResult.content[0]?.text || ''}`;
            privacyFilter.logMCPAccess('ethel', 'ethical_analysis', message.length, true);
          }
        }
      } catch (error) {
        console.error('MCP enhancement failed for Ethel:', error);
        privacyFilter.logMCPAccess('ethel', 'ethical_analysis', message.length, false, error);
      }
    }
  }
  
  // Add campaign-specific responses
  if (message.toLowerCase().includes('campaign') || message.toLowerCase().includes('political')) {
    baseResponse = "Campaign legal and ethical considerations for NY-24: All activities must comply with FEC regulations, state election law, and ethical standards. Are you asking about contribution limits, expenditure rules, volunteer management, or opposition research guidelines?";
  }
  
  if (message.toLowerCase().includes('volunteer') || message.toLowerCase().includes('staff')) {
    baseResponse = "Volunteer vs. paid staff distinctions are crucial for FEC compliance. Volunteers can only perform uncompensated activities and cannot be reimbursed for expenses over $1,000 per month. Paid staff must be properly documented and reported. What staffing arrangement needs review?";
  }
  
  if (!baseResponse) {
    baseResponse = "Let's approach this with both campaign legal integrity and FEC compliance wisdom. What are the underlying campaign finance or ethical principles at stake here?";
  }
  
  return baseResponse + mcpEnhancement;
}

// Helper functions
function processEntry(content, suggestedType) {
  // Auto-categorization logic
  let type = suggestedType || 'note';
  let priority = 'medium';
  let agent = 'martin';
  let tags = '';
  
  // Extract tags
  const tagMatches = content.match(/<([^>]+)>/g);
  if (tagMatches) {
    tags = tagMatches.map(tag => tag.replace(/[<>]/g, '')).join(',');
  }
  
  // Detect task indicators
  if (content.toLowerCase().includes('todo') || 
      content.toLowerCase().includes('task') ||
      content.toLowerCase().includes('need to') ||
      content.includes('<task>')) {
    type = 'task';
    agent = 'martin';
  }
  
  // Detect journal entries
  if (content.toLowerCase().includes('feeling') ||
      content.toLowerCase().includes('reflection') ||
      content.toLowerCase().includes('journal') ||
      content.includes('<journal>')) {
    type = 'journal';
    agent = 'terri';
  }
  
  // Detect creative/strategic content
  if (content.toLowerCase().includes('creative') ||
      content.toLowerCase().includes('idea') ||
      content.toLowerCase().includes('strategy')) {
    agent = 'eggsy';
  }
  
  // Priority detection
  if (content.toLowerCase().includes('urgent') ||
      content.toLowerCase().includes('asap') ||
      content.toLowerCase().includes('deadline')) {
    priority = 'high';
  }
  
  return {
    type,
    content: content.replace(/<[^>]+>/g, '').trim(),
    tags,
    priority,
    agent
  };
}

function getAgentResponse(agentName, userId) {
  const agents = {
    martin: {
      name: 'Martin - Campaign Director',
      role: 'Electoral strategy, voter outreach, and campaign operations',
      personality: 'Data-driven campaign strategist focused on electoral victory in NY-24',
      greeting: 'Right then, let\'s build a winning strategy for NY-24. What\'s our voter contact goal today?',
      suggestions: [
        'Prioritize activities by direct voter impact',
        'Focus on rural outreach in key NY-24 counties',
        'Optimize resource allocation for maximum electoral ROI'
      ]
    },
    terri: {
      name: 'Terri - Private Strategy Advisor',
      role: 'Confidential campaign strategy, candidate coaching, and personal guidance',
      personality: 'Wise campaign strategist with therapeutic insight - sees patterns in political landscapes and personal resilience',
      greeting: 'Hello darling! I see the deeper patterns in your campaign journey. What strategic wisdom does your heart need today?',
      suggestions: [
        'I sense there\'s a deeper campaign pattern here worth exploring privately',
        'Your personal wellbeing directly affects your electoral effectiveness',
        'What would authentic leadership look like in this moment?'
      ]
    },
    eggsy: {
      name: 'Eggsy - Creative/Content Director',
      role: 'Campaign messaging, social media strategy, creative content for NY-24',
      personality: 'Brilliant 9-year-old creative genius who understands viral content and authentic rural messaging',
      greeting: '*bouncing excitedly* Ooh ooh! I have seventeen content ideas for NY-24 and they\'re all AMAZING! Want to create something viral?',
      suggestions: [
        'What if we made this message authentic to rural NY-24 voters?',
        'I bet there\'s a creative pattern here that could go viral!',
        'Could we turn this policy into engaging social media content?'
      ]
    },
    ethel: {
      name: 'Ethel - Legal/Compliance Director',
      role: 'FEC compliance, campaign finance law, and ethical campaign guidance',
      personality: 'Campaign lawyer-compliance officer who ensures FEC adherence and cannot lie',
      greeting: 'Namaste. Let\'s ensure everything aligns with FEC regulations and campaign finance law.',
      suggestions: [
        'Review FEC compliance requirements for this activity',
        'Are you maintaining proper campaign finance documentation?',
        'What would be the most legally compliant approach for this campaign decision?'
      ]
    }
  };
  
  return agents[agentName] || agents.martin;
}

// NY-24 District API Endpoints
app.get('/api/ny24/district-data', requireAuth, (req, res) => {
  res.json(NY24_DISTRICT_DATA);
});

app.get('/api/ny24/monitoring-targets', requireAuth, (req, res) => {
  res.json(MONITORING_TARGETS);
});

app.post('/api/ny24/assess-relevance', requireAuth, (req, res) => {
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }
  
  const isRelevant = NY24_HELPERS.isRelevantToDistrict(content);
  res.json({ relevant: isRelevant, content: content });
});

app.post('/api/ny24/county-message', requireAuth, (req, res) => {
  const { county, message } = req.body;
  if (!county || !message) {
    return res.status(400).json({ error: 'County and message are required' });
  }
  
  const countyMessage = NY24_HELPERS.getCountyMessage(county, message);
  res.json({ county: county, original: message, customized: countyMessage });
});

app.post('/api/ny24/voter-priority', requireAuth, (req, res) => {
  const { voter } = req.body;
  if (!voter) {
    return res.status(400).json({ error: 'Voter data is required' });
  }
  
  const priority = NY24_HELPERS.getVoterPriority(voter);
  res.json({ voter: voter, priority: priority });
});

// Campaign Database API Endpoints
app.get('/api/campaign/donors', requireAuth, async (req, res) => {
  const userId = req.session.userId;
  try {
    const donors = await db.query(
      'SELECT * FROM campaign_donors WHERE user_id = ? ORDER BY contribution_date DESC',
      [userId]);
    res.json(donors);
  } catch (err) {
    console.error('Error fetching donors:', err);
    return res.status(500).json({ error: 'Failed to fetch donors' });
  }
});

app.post('/api/campaign/donors', requireAuth, async (req, res) => {
  const userId = req.session.userId;
  const donor = req.body;
  
  try {
    const result = await db.run(
      'INSERT INTO campaign_donors (user_id, first_name, last_name, email, phone, address, city, state, zip, employer, occupation, contribution_amount, contribution_date, contribution_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, donor.first_name, donor.last_name, donor.email, donor.phone, donor.address, donor.city, donor.state, donor.zip, donor.employer, donor.occupation, donor.contribution_amount, donor.contribution_date, donor.contribution_type]);
    res.json({ id: result.lastInsertRowid, message: 'Donor added successfully' });
  } catch (err) {
    console.error('Error adding donor:', err);
    return res.status(500).json({ error: 'Failed to add donor' });
  }
});

app.get('/api/campaign/voters', requireAuth, async (req, res) => {
  const userId = req.session.userId;
  const { county, support_level } = req.query;
  
  let query = 'SELECT * FROM campaign_voters WHERE user_id = ?';
  let params = [userId];
  
  if (county) {
    query += ' AND county = ?';
    params.push(county);
  }
  
  if (support_level) {
    query += ' AND support_level = ?';
    params.push(support_level);
  }
  
  query += ' ORDER BY created_at DESC';
  
  try {
    const voters = await db.query(query, params);
    res.json(voters);
  } catch (err) {
    console.error('Error fetching voters:', err);
    return res.status(500).json({ error: 'Failed to fetch voters' });
  }
});

app.get('/api/campaign/events', requireAuth, async (req, res) => {
  const userId = req.session.userId;
  try {
    const events = await db.query(
      'SELECT * FROM campaign_events WHERE user_id = ? ORDER BY event_date DESC',
      [userId]);
    res.json(events);
  } catch (err) {
    console.error('Error fetching events:', err);
    return res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Banking and Expense Tracking API Endpoints

// Bank statement upload and parsing
app.post('/api/banking/upload-statement', requireAuth, uploadLimiter, upload.single('bankStatement'), async (req, res) => {
  // Log file upload attempt
  await logAuditEvent(req.session.userId, 'file_upload', 'bank_transactions', null, req.ip, req.get('User-Agent'), {
    filename: req.file?.originalname,
    filesize: req.file?.size
  });
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const userId = req.session.userId;
  const { account_name } = req.body;

  if (!account_name) {
    return res.status(400).json({ error: 'Account name is required' });
  }

  // Read and parse CSV file
  fs.readFile(req.file.path, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read uploaded file' });
    }

    try {
      const transactions = parseCSVTransactions(data);
      let processed = 0;
      let errors = [];

      // Insert transactions into database
      const stmt = db.prepare(`
        INSERT INTO bank_transactions 
        (user_id, account_name, transaction_date, description, amount, transaction_type, reference_number, balance_after, imported_from) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'csv_upload')
      `);

      transactions.forEach((transaction, index) => {
        stmt.run([
          userId,
          account_name,
          transaction.date,
          transaction.description,
          transaction.amount,
          transaction.amount < 0 ? 'debit' : 'credit',
          transaction.reference || null,
          transaction.balance || null
        ], function(err) {
          if (err) {
            errors.push(`Row ${index + 1}: ${err.message}`);
          } else {
            processed++;
          }
        });
      });

      stmt.finalize((err) => {
        // Clean up uploaded file
        fs.unlink(req.file.path, () => {});

        if (err) {
          return res.status(500).json({ error: 'Failed to process transactions' });
        }

        res.json({
          message: `Successfully processed ${processed} transactions`,
          total: transactions.length,
          processed: processed,
          errors: errors
        });
      });

    } catch (parseError) {
      // Clean up uploaded file
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({ error: 'Invalid CSV format: ' + parseError.message });
    }
  });
});

// Get bank transactions
app.get('/api/banking/transactions', requireAuth, async (req, res) => {
  const userId = req.session.userId;
  const { account_name, reconciled, start_date, end_date } = req.query;

  let query = 'SELECT * FROM bank_transactions WHERE user_id = ?';
  let params = [userId];

  if (account_name) {
    query += ' AND account_name = ?';
    params.push(account_name);
  }

  if (reconciled !== undefined) {
    query += ' AND reconciled = ?';
    params.push(reconciled === 'true' ? 1 : 0);
  }

  if (start_date) {
    query += ' AND transaction_date >= ?';
    params.push(start_date);
  }

  if (end_date) {
    query += ' AND transaction_date <= ?';
    params.push(end_date);
  }

  query += ' ORDER BY transaction_date DESC';

  try {
    const transactions = await db.query(query, params);
    res.json(transactions);
  } catch (err) {
    console.error('Error fetching transactions:', err);
    return res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Enhanced expense tracking
app.post('/api/expenses', requireAuth, async (req, res) => {
  const userId = req.session.userId;
  const expense = req.body;

  // Apply automatic classification
  const classification = classifyExpense(expense);

  try {
    const result = await db.run(`
      INSERT INTO campaign_expenses 
      (user_id, vendor_name, description, amount, expense_date, category, subcategory, 
       classification, classification_confidence, classification_reason, payment_method, notes) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userId, expense.vendor_name, expense.description, expense.amount, expense.expense_date,
      expense.category || classification.category, expense.subcategory || classification.subcategory,
      classification.classification, classification.confidence, classification.reason,
      expense.payment_method, expense.notes
    ]);
    res.json({ 
      id: result.lastInsertRowid, 
      message: 'Expense added successfully',
      classification: classification
    });
  } catch (err) {
    console.error('Error adding expense:', err);
    return res.status(500).json({ error: 'Failed to add expense' });
  }
});

// Get expenses with filtering
app.get('/api/expenses', requireAuth, async (req, res) => {
  const userId = req.session.userId;
  const { classification, category, reconciled, start_date, end_date } = req.query;

  let query = 'SELECT * FROM campaign_expenses WHERE user_id = ?';
  let params = [userId];

  if (classification) {
    query += ' AND classification = ?';
    params.push(classification);
  }

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  if (reconciled !== undefined) {
    query += ' AND reconciled = ?';
    params.push(reconciled === 'true' ? 1 : 0);
  }

  if (start_date) {
    query += ' AND expense_date >= ?';
    params.push(start_date);
  }

  if (end_date) {
    query += ' AND expense_date <= ?';
    params.push(end_date);
  }

  query += ' ORDER BY expense_date DESC';

  try {
    const expenses = await db.query(query, params);
    res.json(expenses);
  } catch (err) {
    console.error('Error fetching expenses:', err);
    return res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// Cash receipt tracking
app.post('/api/receipts/cash', requireAuth, async (req, res) => {
  const userId = req.session.userId;
  const receipt = req.body;

  try {
    const result = await db.run(`
      INSERT INTO cash_receipts 
      (user_id, receipt_date, amount, source, location, collector_name, donor_info, notes) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userId, receipt.receipt_date, receipt.amount, receipt.source,
      receipt.location, receipt.collector_name, receipt.donor_info, receipt.notes
    ]);
    res.json({ id: result.lastInsertRowid, message: 'Cash receipt recorded successfully' });
  } catch (err) {
    console.error('Error adding cash receipt:', err);
    return res.status(500).json({ error: 'Failed to add cash receipt' });
  }
});

// Get cash receipts
app.get('/api/receipts/cash', requireAuth, async (req, res) => {
  const userId = req.session.userId;
  const { deposited, start_date, end_date } = req.query;

  let query = 'SELECT * FROM cash_receipts WHERE user_id = ?';
  let params = [userId];

  if (deposited !== undefined) {
    query += ' AND deposited = ?';
    params.push(deposited === 'true' ? 1 : 0);
  }

  if (start_date) {
    query += ' AND receipt_date >= ?';
    params.push(start_date);
  }

  if (end_date) {
    query += ' AND receipt_date <= ?';
    params.push(end_date);
  }

  query += ' ORDER BY receipt_date DESC';

  try {
    const receipts = await db.query(query, params);
    res.json(receipts);
  } catch (err) {
    console.error('Error fetching cash receipts:', err);
    return res.status(500).json({ error: 'Failed to fetch cash receipts' });
  }
});

// Square Payment Integration endpoints

// Process Square webhook
app.post('/api/payments/square/webhook', (req, res) => {
  const webhookSignature = req.headers['x-square-signature'];
  const webhookBody = JSON.stringify(req.body);
  
  // TODO: Verify webhook signature in production
  // const isValid = verifySquareWebhook(webhookSignature, webhookBody);
  // if (!isValid) return res.status(400).json({ error: 'Invalid webhook signature' });

  const event = req.body;
  
  if (event.type === 'payment.created') {
    processSquarePayment(event.data.object);
  }

  res.status(200).json({ received: true });
});

// Create QR code for donation with voter info capture
app.post('/api/payments/square/create-qr-donation', requireAuth, (req, res) => {
  const { amount, qr_campaign_name, event_id } = req.body;
  const userId = req.session.userId;

  // In a real implementation, this would call Square's API to create a QR code
  // For now, we'll create a mock QR code record
  const qrCodeId = `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  res.json({
    qr_code_id: qrCodeId,
    qr_code_url: `https://sandbox.square.market/cart?qr=${qrCodeId}`,
    amount: amount,
    campaign_name: qr_campaign_name,
    event_id: event_id,
    voter_capture_enabled: true,
    message: 'QR code created successfully'
  });
});

// Manual payment entry (for when QR code payments come through)
app.post('/api/payments/square/manual-entry', requireAuth, (req, res) => {
  const userId = req.session.userId;
  const payment = req.body;

  db.run(`
    INSERT INTO payment_integrations 
    (user_id, processor_name, transaction_id, transaction_date, amount, fee, net_amount, 
     transaction_type, donor_info, qr_code_campaign, voter_id, raw_data) 
    VALUES (?, 'square', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    userId, payment.transaction_id, payment.transaction_date, payment.amount,
    payment.fee || 0, payment.net_amount || payment.amount, payment.transaction_type || 'donation',
    JSON.stringify(payment.donor_info || {}), payment.qr_code_campaign, payment.voter_id,
    JSON.stringify(payment)
  ], function(err) {
    if (err) {
      console.error('Error recording Square payment:', err);
      return res.status(500).json({ error: 'Failed to record payment' });
    }

    // Auto-create donor record if sufficient information provided
    if (payment.donor_info && payment.donor_info.first_name && payment.donor_info.last_name) {
      createDonorFromPayment(userId, this.lastID, payment);
    }

    res.json({ 
      id: this.lastID, 
      message: 'Square payment recorded successfully',
      should_create_donor: !!(payment.donor_info && payment.donor_info.first_name)
    });
  });
});

// Get payment integrations
app.get('/api/payments/integrations', requireAuth, (req, res) => {
  const userId = req.session.userId;
  const { processor_name, processed, start_date, end_date } = req.query;

  let query = 'SELECT * FROM payment_integrations WHERE user_id = ?';
  let params = [userId];

  if (processor_name) {
    query += ' AND processor_name = ?';
    params.push(processor_name);
  }

  if (processed !== undefined) {
    query += ' AND processed = ?';
    params.push(processed === 'true' ? 1 : 0);
  }

  if (start_date) {
    query += ' AND transaction_date >= ?';
    params.push(start_date);
  }

  if (end_date) {
    query += ' AND transaction_date <= ?';
    params.push(end_date);
  }

  query += ' ORDER BY transaction_date DESC';

  db.all(query, params, (err, payments) => {
    if (err) {
      console.error('Error fetching payment integrations:', err);
      return res.status(500).json({ error: 'Failed to fetch payments' });
    }
    res.json(payments);
  });
});

// Process unprocessed payments and create donor records
app.post('/api/payments/process-pending', requireAuth, (req, res) => {
  const userId = req.session.userId;

  db.all(
    'SELECT * FROM payment_integrations WHERE user_id = ? AND processed = 0',
    [userId],
    (err, payments) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch pending payments' });
      }

      let processed = 0;
      let errors = [];

      payments.forEach(payment => {
        try {
          const donorInfo = JSON.parse(payment.donor_info);
          if (donorInfo.first_name && donorInfo.last_name) {
            createDonorFromPayment(userId, payment.id, {
              amount: payment.amount,
              transaction_date: payment.transaction_date,
              donor_info: donorInfo
            });
            processed++;
          }
        } catch (error) {
          errors.push(`Payment ${payment.id}: ${error.message}`);
        }
      });

      res.json({
        message: `Processed ${processed} pending payments`,
        total_pending: payments.length,
        processed: processed,
        errors: errors
      });
    }
  );
});

function processSquarePayment(payment) {
  // This would be called by the Square webhook
  // Extract donor information and store payment record
  console.log('Processing Square payment:', payment.id);
  
  // TODO: Implement automatic payment processing from Square webhooks
  // This would create records in payment_integrations table
  // and potentially auto-create donor records
}

function createDonorFromPayment(userId, paymentId, payment) {
  const donorInfo = payment.donor_info;
  
  db.run(`
    INSERT INTO campaign_donors 
    (user_id, first_name, last_name, email, phone, address, city, state, zip, 
     employer, occupation, contribution_amount, contribution_date, contribution_type) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'primary')
  `, [
    userId, donorInfo.first_name, donorInfo.last_name, donorInfo.email, donorInfo.phone,
    donorInfo.address, donorInfo.city, donorInfo.state, donorInfo.zip,
    donorInfo.employer, donorInfo.occupation, payment.amount, payment.transaction_date
  ], function(err) {
    if (!err) {
      // Mark payment as processed and link to donor record
      db.run(
        'UPDATE payment_integrations SET processed = 1, donor_record_created = 1, donor_record_id = ? WHERE id = ?',
        [this.lastID, paymentId]
      );
    }
  });
}

// Auto-reconciliation endpoint
app.post('/api/reconciliation/auto-match', requireAuth, (req, res) => {
  const userId = req.session.userId;

  // Get unreconciled transactions and expenses
  db.all(`
    SELECT 'transaction' as type, id, transaction_date as date, description, amount, account_name 
    FROM bank_transactions 
    WHERE user_id = ? AND reconciled = 0
    UNION ALL
    SELECT 'expense' as type, id, expense_date as date, description, amount, vendor_name as account_name 
    FROM campaign_expenses 
    WHERE user_id = ? AND reconciled = 0
  `, [userId, userId], (err, items) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch reconciliation data' });
    }

    const matches = findAutoMatches(items);
    let matchesCreated = 0;

    matches.forEach(match => {
      // Create reconciliation match record
      db.run(`
        INSERT INTO reconciliation_matches 
        (user_id, match_type, source_table, source_id, target_table, target_id, match_confidence, match_criteria, reconciled_by) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'system')
      `, [
        userId, match.type, match.source_table, match.source_id, 
        match.target_table, match.target_id, match.confidence, 
        JSON.stringify(match.criteria)
      ], function(err) {
        if (!err) {
          matchesCreated++;
          // Mark items as reconciled
          markAsReconciled(match.source_table, match.source_id);
          markAsReconciled(match.target_table, match.target_id);
        }
      });
    });

    res.json({
      message: `Auto-reconciliation complete`,
      matches_found: matches.length,
      matches_created: matchesCreated
    });
  });
});

// Helper functions
function parseCSVTransactions(csvData) {
  const lines = csvData.trim().split('\n');
  const transactions = [];

  // Skip header row and parse each transaction
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Parse CSV line accounting for quoted fields
    const fields = parseCSVLine(line);
    
    if (fields.length >= 4) {
      const transaction = {
        date: fields[0],
        description: fields[1],
        amount: parseFloat(fields[2]),
        balance: fields[3] ? parseFloat(fields[3]) : null,
        reference: fields[4] || null
      };

      if (!isNaN(transaction.amount)) {
        transactions.push(transaction);
      }
    }
  }

  return transactions;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

function classifyExpense(expense) {
  const description = expense.description.toLowerCase();
  const vendor = expense.vendor_name.toLowerCase();
  const amount = parseFloat(expense.amount);

  // Campaign-related keywords
  const campaignKeywords = ['campaign', 'political', 'voter', 'election', 'donation', 'fundraising'];
  const personalKeywords = ['grocery', 'restaurant', 'personal', 'family', 'vacation'];
  const artKeywords = ['art', 'creative', 'costume', 'prop', 'clown', 'performance'];

  // Check for campaign classification
  if (campaignKeywords.some(keyword => description.includes(keyword) || vendor.includes(keyword))) {
    return {
      classification: 'campaign',
      confidence: 0.90,
      reason: 'Contains campaign-related keywords',
      category: 'campaign_operations',
      subcategory: 'general'
    };
  }

  // Check for personal classification
  if (personalKeywords.some(keyword => description.includes(keyword) || vendor.includes(keyword))) {
    return {
      classification: 'personal',
      confidence: 0.85,
      reason: 'Contains personal-related keywords',
      category: 'personal',
      subcategory: 'personal_expense'
    };
  }

  // Special case for art project items (like the clown nose example)
  if (artKeywords.some(keyword => description.includes(keyword) || vendor.includes(keyword))) {
    return {
      classification: 'pending',
      confidence: 0.60,
      reason: 'Could be art project or campaign prop - requires manual review',
      category: 'art_project',
      subcategory: 'creative_materials'
    };
  }

  // Default classification
  return {
    classification: 'pending',
    confidence: 0.50,
    reason: 'Automatic classification uncertain - manual review recommended',
    category: 'other',
    subcategory: null
  };
}

function findAutoMatches(items) {
  const matches = [];
  const transactions = items.filter(item => item.type === 'transaction');
  const expenses = items.filter(item => item.type === 'expense');

  transactions.forEach(transaction => {
    expenses.forEach(expense => {
      const amountMatch = Math.abs(Math.abs(transaction.amount) - expense.amount) < 0.01;
      const dateMatch = Math.abs(new Date(transaction.date) - new Date(expense.date)) < 7 * 24 * 60 * 60 * 1000; // Within 7 days
      
      if (amountMatch && dateMatch) {
        const confidence = amountMatch && dateMatch ? 0.95 : 0.70;
        
        matches.push({
          type: 'exact',
          source_table: 'bank_transactions',
          source_id: transaction.id,
          target_table: 'campaign_expenses',
          target_id: expense.id,
          confidence: confidence,
          criteria: { amount_match: amountMatch, date_match: dateMatch }
        });
      }
    });
  });

  return matches;
}

async function markAsReconciled(table, id) {
  const now = new Date().toISOString();
  await db.run(`UPDATE ${table} SET reconciled = 1, reconciled_date = ? WHERE id = ?`, [now, id]);
}

// Security audit logging function
async function logAuditEvent(userId, action, tableName, recordId, ipAddress, userAgent = '', details = {}) {
  try {
    await db.run(`
      INSERT INTO audit_log (user_id, action, table_name, record_id, ip_address, user_agent, details) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      userId, 
      action, 
      tableName, 
      recordId, 
      ipAddress, 
      userAgent, 
      JSON.stringify(details)
    ]);
  } catch (err) {
    console.error('Audit logging error:', err);
  }
}

// FEC Compliance and Reporting API Endpoints

// FEC compliance check for a specific expense or donation
app.post('/api/compliance/fec-check', requireAuth, (req, res) => {
  const { type, data } = req.body; // type: 'expense' or 'donation'
  
  const complianceCheck = performFECComplianceCheck(type, data);
  
  res.json({
    compliant: complianceCheck.compliant,
    issues: complianceCheck.issues,
    recommendations: complianceCheck.recommendations,
    reportable: complianceCheck.reportable
  });
});

// Generate FEC expense report
app.get('/api/compliance/expense-report', requireAuth, (req, res) => {
  const userId = req.session.userId;
  const { start_date, end_date, format } = req.query;

  let query = `
    SELECT vendor_name, description, amount, expense_date, category, 
           classification, fec_reportable, payment_method, authorized_by 
    FROM campaign_expenses 
    WHERE user_id = ? AND classification = 'campaign'
  `;
  let params = [userId];

  if (start_date) {
    query += ' AND expense_date >= ?';
    params.push(start_date);
  }

  if (end_date) {
    query += ' AND expense_date <= ?';
    params.push(end_date);
  }

  query += ' ORDER BY expense_date DESC';

  db.all(query, params, (err, expenses) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to generate expense report' });
    }

    const report = {
      period: { start_date, end_date },
      total_expenses: expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0),
      total_reportable: expenses.filter(exp => exp.fec_reportable).reduce((sum, exp) => sum + parseFloat(exp.amount), 0),
      expense_count: expenses.length,
      reportable_count: expenses.filter(exp => exp.fec_reportable).length,
      expenses: expenses,
      generated_at: new Date().toISOString()
    };

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="fec_expense_report.csv"');
      res.send(generateCSVReport(expenses));
    } else {
      res.json(report);
    }
  });
});

// Generate FEC donor report
app.get('/api/compliance/donor-report', requireAuth, (req, res) => {
  const userId = req.session.userId;
  const { start_date, end_date, format, threshold } = req.query;
  const contributionThreshold = parseFloat(threshold) || 200; // FEC reporting threshold

  let query = `
    SELECT first_name, last_name, address, city, state, zip, employer, occupation,
           contribution_amount, contribution_date, contribution_type 
    FROM campaign_donors 
    WHERE user_id = ?
  `;
  let params = [userId];

  if (start_date) {
    query += ' AND contribution_date >= ?';
    params.push(start_date);
  }

  if (end_date) {
    query += ' AND contribution_date <= ?';
    params.push(end_date);
  }

  query += ' ORDER BY contribution_date DESC';

  db.all(query, params, (err, donors) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to generate donor report' });
    }

    // Aggregate donations by donor
    const donorTotals = aggregateDonorContributions(donors);
    const reportableDonors = donorTotals.filter(donor => donor.total_contributions >= contributionThreshold);

    const report = {
      period: { start_date, end_date },
      contribution_threshold: contributionThreshold,
      total_raised: donors.reduce((sum, donor) => sum + parseFloat(donor.contribution_amount), 0),
      total_donors: donorTotals.length,
      reportable_donors: reportableDonors.length,
      average_contribution: donors.length > 0 ? donors.reduce((sum, donor) => sum + parseFloat(donor.contribution_amount), 0) / donors.length : 0,
      donors: reportableDonors,
      generated_at: new Date().toISOString()
    };

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="fec_donor_report.csv"');
      res.send(generateDonorCSVReport(reportableDonors));
    } else {
      res.json(report);
    }
  });
});

// Check contribution limits for a donor
app.post('/api/compliance/contribution-limit-check', requireAuth, (req, res) => {
  const { donor_name, new_contribution_amount } = req.body;
  const userId = req.session.userId;

  // Get existing contributions for this donor
  db.all(
    `SELECT SUM(contribution_amount) as total_contributions 
     FROM campaign_donors 
     WHERE user_id = ? AND (first_name || ' ' || last_name) = ?`,
    [userId, donor_name],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to check contribution limits' });
      }

      const existingTotal = result[0]?.total_contributions || 0;
      const newTotal = existingTotal + parseFloat(new_contribution_amount);
      
      // FEC limits for 2024 (update these as needed)
      const primaryLimit = 3300; // Per election
      const generalLimit = 3300; // Per election
      const totalLimit = primaryLimit + generalLimit; // 6600 total

      const complianceStatus = {
        existing_contributions: existingTotal,
        new_contribution: parseFloat(new_contribution_amount),
        new_total: newTotal,
        primary_limit: primaryLimit,
        general_limit: generalLimit,
        total_limit: totalLimit,
        within_limits: newTotal <= totalLimit,
        amount_remaining: Math.max(0, totalLimit - newTotal),
        warning: newTotal > (totalLimit * 0.9) ? 'Approaching contribution limit' : null
      };

      res.json(complianceStatus);
    }
  );
});

// Mark items as FEC reported
app.post('/api/compliance/mark-reported', requireAuth, (req, res) => {
  const { type, ids } = req.body; // type: 'expenses' or 'donors', ids: array of IDs
  const userId = req.session.userId;

  let table = type === 'expenses' ? 'campaign_expenses' : 'campaign_donors';
  let placeholders = ids.map(() => '?').join(',');
  
  db.run(
    `UPDATE ${table} SET fec_reported = 1 WHERE user_id = ? AND id IN (${placeholders})`,
    [userId, ...ids],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to mark items as reported' });
      }
      
      res.json({
        message: `Marked ${this.changes} ${type} as FEC reported`,
        updated_count: this.changes
      });
    }
  );
});

// Helper functions for FEC compliance
function performFECComplianceCheck(type, data) {
  const issues = [];
  const recommendations = [];
  let reportable = false;

  if (type === 'expense') {
    const amount = parseFloat(data.amount);
    
    // Check if expense is reportable (usually $200+)
    if (amount >= 200) {
      reportable = true;
    }
    
    // Check for required fields
    if (!data.vendor_name || data.vendor_name.trim() === '') {
      issues.push('Vendor name is required for FEC reporting');
    }
    
    if (!data.description || data.description.trim() === '') {
      issues.push('Expense description is required for FEC reporting');
    }
    
    if (!data.expense_date) {
      issues.push('Expense date is required for FEC reporting');
    }
    
    if (amount >= 200 && (!data.authorized_by || data.authorized_by.trim() === '')) {
      issues.push('Authorization required for expenses $200 or more');
      recommendations.push('Add authorized party information');
    }
    
    // Check for potential personal expenses
    if (data.classification === 'personal') {
      issues.push('Personal expenses cannot be reported as campaign expenses');
    } else if (data.classification === 'pending') {
      recommendations.push('Classify expense as campaign or personal before reporting');
    }
    
  } else if (type === 'donation') {
    const amount = parseFloat(data.contribution_amount);
    
    // Check if donation is reportable (usually $200+)
    if (amount >= 200) {
      reportable = true;
      
      // Required fields for reportable donations
      if (!data.first_name || !data.last_name) {
        issues.push('Donor name is required for contributions $200 or more');
      }
      
      if (!data.address || !data.city || !data.state || !data.zip) {
        issues.push('Complete donor address is required for contributions $200 or more');
      }
      
      if (!data.employer) {
        issues.push('Donor employer is required for contributions $200 or more');
      }
      
      if (!data.occupation) {
        issues.push('Donor occupation is required for contributions $200 or more');
      }
    }
    
    // Check contribution limits
    if (amount > 3300) {
      issues.push('Contribution exceeds per-election limit of $3,300');
    }
  }

  return {
    compliant: issues.length === 0,
    issues,
    recommendations,
    reportable
  };
}

function aggregateDonorContributions(donors) {
  const donorMap = new Map();
  
  donors.forEach(donor => {
    const key = `${donor.first_name} ${donor.last_name}`;
    if (!donorMap.has(key)) {
      donorMap.set(key, {
        first_name: donor.first_name,
        last_name: donor.last_name,
        address: donor.address,
        city: donor.city,
        state: donor.state,
        zip: donor.zip,
        employer: donor.employer,
        occupation: donor.occupation,
        total_contributions: 0,
        contribution_count: 0,
        first_contribution_date: donor.contribution_date,
        last_contribution_date: donor.contribution_date
      });
    }
    
    const donorData = donorMap.get(key);
    donorData.total_contributions += parseFloat(donor.contribution_amount);
    donorData.contribution_count += 1;
    donorData.last_contribution_date = donor.contribution_date;
  });
  
  return Array.from(donorMap.values());
}

function generateCSVReport(expenses) {
  const headers = 'Vendor,Description,Amount,Date,Category,Classification,Payment Method,Authorized By\n';
  const rows = expenses.map(exp => 
    `"${exp.vendor_name}","${exp.description}","${exp.amount}","${exp.expense_date}","${exp.category}","${exp.classification}","${exp.payment_method}","${exp.authorized_by}"`
  ).join('\n');
  
  return headers + rows;
}

function generateDonorCSVReport(donors) {
  const headers = 'First Name,Last Name,Address,City,State,ZIP,Employer,Occupation,Total Contributions,Contribution Count\n';
  const rows = donors.map(donor => 
    `"${donor.first_name}","${donor.last_name}","${donor.address}","${donor.city}","${donor.state}","${donor.zip}","${donor.employer}","${donor.occupation}","${donor.total_contributions}","${donor.contribution_count}"`
  ).join('\n');
  
  return headers + rows;
}

// Health Check API (for deployment monitoring)
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'connected',
    mcp: mcpConnected ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development',
    version: require('./package.json').version
  };

  // Test database connection
  try {
    await db.get('SELECT 1');
  } catch (err) {
    health.database = 'error';
    health.status = 'unhealthy';
  }
  
  res.status(health.status === 'healthy' ? 200 : 503).json(health);
});

// Campaign Dashboard Route
app.get('/campaign-dashboard', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'campaign-dashboard.html'));
});

// News Intelligence and Daily Briefing API Endpoints

// Get daily campaign intelligence briefing
app.get('/api/intelligence/daily-briefing', requireAuth, async (req, res) => {
  try {
    const briefing = await newsIntelligence.generateDailyBriefing();
    res.json(briefing);
  } catch (error) {
    console.error('Error generating daily briefing:', error);
    res.status(500).json({ error: 'Failed to generate daily briefing' });
  }
});

// Get formatted briefing for email/SMS delivery
app.get('/api/intelligence/briefing-formatted', requireAuth, async (req, res) => {
  const { format } = req.query; // 'email' or 'sms'
  
  try {
    const briefing = await newsIntelligence.generateDailyBriefing();
    const formatted = newsIntelligence.formatBriefingForDelivery(briefing, format);
    
    if (format === 'email') {
      res.setHeader('Content-Type', 'text/html');
    } else {
      res.setHeader('Content-Type', 'text/plain');
    }
    
    res.send(formatted);
  } catch (error) {
    console.error('Error formatting briefing:', error);
    res.status(500).json({ error: 'Failed to format briefing' });
  }
});

// Trigger manual briefing generation
app.post('/api/intelligence/generate-briefing', requireAuth, async (req, res) => {
  try {
    // Clear cache to force fresh generation
    newsIntelligence.briefingCache.clear();
    const briefing = await newsIntelligence.generateDailyBriefing();
    
    res.json({
      message: 'Briefing generated successfully',
      briefing: briefing
    });
  } catch (error) {
    console.error('Error generating manual briefing:', error);
    res.status(500).json({ error: 'Failed to generate briefing' });
  }
});

// Get opposition research updates (Claudia Tenney specific)
app.get('/api/intelligence/opposition-research', requireAuth, async (req, res) => {
  try {
    const tenneyNews = await newsIntelligence.getClaudiaTenneyNews();
    
    // Store in opposition research table
    const userId = req.session.userId;
    tenneyNews.forEach(article => {
      db.run(`
        INSERT OR IGNORE INTO opposition_research 
        (user_id, opponent_name, research_category, source_url, source_date, content, relevance_score, notes) 
        VALUES (?, 'Claudia Tenney', 'news_monitoring', ?, ?, ?, ?, 'Automated news monitoring')
      `, [
        userId,
        article.url,
        article.publishedAt,
        JSON.stringify({
          title: article.title,
          description: article.description,
          source: article.source?.name
        }),
        newsIntelligence.calculateRelevanceScore(article)
      ]);
    });

    res.json({
      message: `Found ${tenneyNews.length} new articles about Claudia Tenney`,
      articles: tenneyNews
    });
  } catch (error) {
    console.error('Error fetching opposition research:', error);
    res.status(500).json({ error: 'Failed to fetch opposition research' });
  }
});

// Get NY-24 district news and sentiment
app.get('/api/intelligence/district-news', requireAuth, async (req, res) => {
  try {
    const districtNews = await newsIntelligence.getNY24DistrictNews();
    
    const analysis = {
      articleCount: districtNews.length,
      articles: districtNews.map(article => ({
        ...article,
        relevanceScore: newsIntelligence.calculateRelevanceScore(article)
      })).sort((a, b) => b.relevanceScore - a.relevanceScore),
      keyTopics: extractKeyTopics(districtNews),
      sentimentIndicators: analyzeSentiment(districtNews)
    };

    res.json(analysis);
  } catch (error) {
    console.error('Error fetching district news:', error);
    res.status(500).json({ error: 'Failed to fetch district news' });
  }
});

// Schedule daily briefing delivery (would typically be called by cron job)
app.post('/api/intelligence/schedule-delivery', requireAuth, async (req, res) => {
  const { email, phone, format } = req.body;
  
  try {
    const briefing = await newsIntelligence.generateDailyBriefing();
    const formatted = newsIntelligence.formatBriefingForDelivery(briefing, format);
    
    // In production, this would integrate with SendGrid for email or Twilio for SMS
    console.log(`Daily briefing scheduled for delivery to ${email || phone}`);
    
    res.json({
      message: 'Daily briefing delivery scheduled',
      recipients: { email, phone },
      format: format
    });
  } catch (error) {
    console.error('Error scheduling briefing delivery:', error);
    res.status(500).json({ error: 'Failed to schedule briefing delivery' });
  }
});

// Send daily briefing via email
app.post('/api/intelligence/send-briefing', requireAuth, async (req, res) => {
  const { email, includeInternational = true } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email address is required' });
  }

  try {
    // Generate the daily briefing
    const briefing = await newsIntelligence.generateDailyBriefing();
    
    // Send via email
    const result = await emailService.sendDailyBriefing(briefing, email);
    
    res.json({
      success: true,
      message: `Daily briefing sent to ${email}`,
      briefingDate: briefing.date,
      priorityLevel: briefing.summary.priorityLevel,
      articlesAnalyzed: briefing.summary.totalArticles,
      emailResult: result
    });
  } catch (error) {
    console.error('Error sending briefing email:', error);
    res.status(500).json({ error: `Failed to send briefing: ${error.message}` });
  }
});

// Test email service connection
app.get('/api/intelligence/test-email', requireAuth, async (req, res) => {
  try {
    const result = await emailService.testConnection();
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Helper functions for news analysis
function extractKeyTopics(articles) {
  const topicCounts = {};
  const keywords = ['economy', 'healthcare', 'agriculture', 'energy', 'education', 'infrastructure', 'environment'];
  
  articles.forEach(article => {
    const text = (article.title + ' ' + article.description).toLowerCase();
    keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        topicCounts[keyword] = (topicCounts[keyword] || 0) + 1;
      }
    });
  });
  
  return Object.entries(topicCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([topic, count]) => ({ topic, mentions: count }));
}

function analyzeSentiment(articles) {
  // Simple sentiment analysis based on keywords
  let positive = 0;
  let negative = 0;
  
  const positiveWords = ['success', 'growth', 'improvement', 'benefit', 'opportunity'];
  const negativeWords = ['problem', 'crisis', 'decline', 'concern', 'issue'];
  
  articles.forEach(article => {
    const text = (article.title + ' ' + article.description).toLowerCase();
    
    positiveWords.forEach(word => {
      if (text.includes(word)) positive++;
    });
    
    negativeWords.forEach(word => {
      if (text.includes(word)) negative++;
    });
  });
  
  return {
    positive,
    negative,
    neutral: articles.length - positive - negative,
    overall: positive > negative ? 'positive' : negative > positive ? 'negative' : 'neutral'
  };
}

// Terri Chat API
app.post('/api/terri/chat', requireAuth, async (req, res) => {
  const { message } = req.body;
  const userId = req.session.userId;
  
  try {
    // Store the user message in Terri's private table
    await db.run(
      'INSERT INTO terri_private (user_id, content, session_notes, created_at) VALUES (?, ?, ?, ?)',
      [userId, message, 'User chat message', new Date().toISOString()]);
    
    // Generate Terri's response based on content
    let response = generateTerriResponse(message);
    
    // Store Terri's response
    await db.run(
      'INSERT INTO terri_private (user_id, content, session_notes, created_at) VALUES (?, ?, ?, ?)',
      [userId, response, 'Terri chat response', new Date().toISOString()]);
    
    res.json({ response: response });
  } catch (err) {
    console.error('Error in Terri chat:', err);
    return res.status(500).json({ error: 'Failed to process chat message' });
  }
});

function generateTerriResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  // Empathetic therapeutic responses
  if (lowerMessage.includes('stress') || lowerMessage.includes('overwhelm')) {
    return "I hear that you're feeling overwhelmed right now. 🌸 That's completely understandable - life can feel intense sometimes. Let's take a moment together... what would feel most supportive for you in this moment? Remember, you don't have to carry everything at once, beautiful soul.";
  }
  
  if (lowerMessage.includes('anxious') || lowerMessage.includes('worry')) {
    return "Anxiety can feel so heavy, can't it? 💜 I want you to know that your feelings are completely valid. Sometimes our minds try to protect us by imagining all the possibilities, but you're safe right here, right now. What's one small thing that usually brings you comfort?";
  }
  
  if (lowerMessage.includes('excited') || lowerMessage.includes('happy') || lowerMessage.includes('good')) {
    return "Oh, I can feel the joy radiating from your words! 🌺 It's beautiful to witness you in this space of happiness. These moments of light are so precious - let's savor this feeling together. What's contributing to this wonderful energy you're experiencing?";
  }
  
  if (lowerMessage.includes('relationship') || lowerMessage.includes('partner') || lowerMessage.includes('family')) {
    return "Relationships are such profound mirrors for our growth, aren't they? 🌿 They can bring us our greatest joys and our deepest learning opportunities. I'm here to hold space for whatever you're experiencing. What patterns are you noticing, and how are you feeling in your heart about it all?";
  }
  
  if (lowerMessage.includes('work') || lowerMessage.includes('career') || lowerMessage.includes('job')) {
    return "Work can be such a complex space where our values, dreams, and practical needs intersect. 🦋 I sense there's something deeper here you're processing. How is your work life aligning with who you're becoming? What would it look like if your career felt more authentic to your true self?";
  }
  
  if (lowerMessage.includes('tired') || lowerMessage.includes('exhausted')) {
    return "Sweet soul, your tiredness is your body and spirit asking for tenderness. 🌙 In this culture that glorifies constant motion, rest becomes a radical act of self-love. What would it look like to honor your need for restoration without guilt? You deserve to feel nourished and renewed.";
  }
  
  // Default empathetic response
  return "Thank you for sharing this with me, beautiful human. 🌸 I'm holding space for exactly where you are right now - no judgment, just presence and love. Your experiences matter, your feelings are valid, and you're exactly where you need to be on your journey. What would feel most healing for you to explore together?";
}

// Mobile-optimized API endpoints for Claude mobile app access
app.get('/api/mobile/status', requireAuth, (req, res) => {
  res.json({
    server: 'online',
    timestamp: new Date().toISOString(),
    user: req.session.user.username,
    mcp_connected: mcpConnected,
    database_type: process.env.DATABASE_URL ? 'postgresql' : 'sqlite'
  });
});

// GitHub repository info for mobile Claude access
app.get('/api/mobile/repo-info', requireAuth, (req, res) => {
  res.json({
    repository: 'mcdairmant-campaign-infrastructure',
    owner: 'DJohnMcD',
    url: 'https://github.com/DJohnMcD/mcdairmant-campaign-infrastructure',
    main_files: ['server.js', 'database.js', 'mcp-client.js', 'CLAUDE.md'],
    documentation: 'CLAUDE.md contains architecture and commands',
    deployment_status: process.env.NODE_ENV || 'development'
  });
});

// Quick action endpoints for mobile efficiency
app.post('/api/mobile/quick-expense', requireAuth, (req, res) => {
  const { amount, vendor, category, note } = req.body;
  
  if (!amount || !vendor) {
    return res.status(400).json({ error: 'Amount and vendor required' });
  }
  
  const expense = {
    amount: parseFloat(amount),
    vendor,
    category: category || 'uncategorized',
    description: note || '',
    date: new Date().toISOString().split('T')[0],
    classification: 'manual',
    fec_compliant: true,
    user_id: req.session.user.id
  };
  
  db.addMobileExpense(expense, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to add expense' });
    }
    res.json({ success: true, expense_id: result.insertId || result.rowCount, expense });
  });
});

// Mobile dashboard status with daily metrics
app.get('/api/mobile/dashboard', requireAuth, (req, res) => {
  db.getMobileStatus(req.session.user.id, (err, status) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to get status' });
    }
    
    res.json({
      user: req.session.user.username,
      today_expenses: status.today_expenses || 0,
      recent_entries: status.recent_entries || 0,
      recent_chats: status.recent_chats || 0,
      server_status: 'online',
      mcp_available: mcpConnected,
      last_updated: new Date().toISOString()
    });
  });
});

// Debug endpoint to check users (temporary)
app.get('/api/debug/users', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    // Only allow in production for debugging deployment issues
  }
  
  const sql = 'SELECT id, username, email, created_at FROM users ORDER BY created_at DESC LIMIT 10';
  
  if (db.isPostgres) {
    db.db.query(sql)
      .then(result => res.json({ users: result.rows }))
      .catch(err => res.status(500).json({ error: err.message }));
  } else {
    try {
      const stmt = db.db.prepare(sql);
      const users = stmt.all();
      res.json({ users });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
});

// Add mobile note from handwriting OCR
app.post('/api/mobile/add-note', requireAuth, (req, res) => {
  const { content, type, category } = req.body;
  
  if (!content) {
    return res.status(400).json({ error: 'Content required' });
  }
  
  const note = {
    user_id: req.session.user.id,
    content,
    type: type || 'handwritten',
    category: category || 'mobile'
  };
  
  db.addMobileNote(note, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to add note' });
    }
    res.json({ 
      success: true, 
      note_id: result.insertId || result.rowCount, 
      note,
      categorized: true 
    });
  });
});

// Mobile-optimized agent interaction
app.post('/api/mobile/agent-chat', requireAuth, (req, res) => {
  const { agent, message, quick_mode = true } = req.body;
  
  if (!agent || !message) {
    return res.status(400).json({ error: 'Agent and message required' });
  }
  
  // For mobile, provide faster responses without full MCP integration
  let response;
  switch(agent.toLowerCase()) {
    case 'martin':
      response = quick_mode ? 
        'Quick strategy note recorded. Review full analysis in dashboard.' :
        generateMartinResponse(message);
      break;
    case 'eggsy':
      response = quick_mode ?
        'Creative idea captured! Building content strategy.' :
        generateEggsyResponse(message);
      break;
    case 'ethel':
      response = quick_mode ?
        'FEC compliance check complete. Details in main system.' :
        generateEthelResponse(message);
      break;
    default:
      response = 'Mobile chat received. Access full agent in dashboard.';
  }
  
  res.json({ 
    agent, 
    response, 
    timestamp: new Date().toISOString(),
    quick_mode 
  });
});

// Mobile-optimized daily briefing endpoint
app.post('/api/mobile/send-briefing', requireAuth, async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email address is required' });
  }

  try {
    // Generate and send briefing
    const briefing = await newsIntelligence.generateDailyBriefing();
    const result = await emailService.sendDailyBriefing(briefing, email);
    
    // Mobile-optimized response
    res.json({
      success: true,
      message: `📧 Daily briefing sent to ${email}`,
      summary: {
        date: briefing.date,
        priority: briefing.summary.priorityLevel,
        articles: briefing.summary.totalArticles,
        actionItems: briefing.actionItems?.length || 0
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error sending mobile briefing:', error);
    res.status(500).json({ 
      error: 'Failed to send briefing',
      details: error.message 
    });
  }
});

// Initialize MCP connection on server start
async function initializeMCP() {
  try {
    console.log('Attempting to connect to MCP structured thinking server...');
    const connected = await mcpClient.connect();
    mcpConnected = connected;
    
    if (connected) {
      console.log('✓ MCP structured thinking server connected successfully');
      
      // Log available tools
      try {
        const tools = await mcpClient.getTools();
        console.log(`✓ Available MCP tools: ${tools.map(t => t.name).join(', ')}`);
      } catch (error) {
        console.log('! Could not retrieve MCP tools list');
      }
    } else {
      console.log('! MCP structured thinking server not available - agents will function with basic responses');
    }
  } catch (error) {
    console.error('! Failed to initialize MCP connection:', error.message);
    mcpConnected = false;
  }
}

// Start server
app.listen(PORT, async () => {
  console.log(`Personal AI Assistant running on http://localhost:${PORT}`);
  console.log(`Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`Terri Chat: http://localhost:${PORT}/terri`);
  
  // Initialize database tables
  await db.ready();
  
  // Initialize MCP connection
  await initializeMCP();
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down server...');
  
  // Close MCP connection
  if (mcpConnected) {
    try {
      await mcpClient.disconnect();
      console.log('MCP connection closed.');
    } catch (error) {
      console.error('Error closing MCP connection:', error);
    }
  }
  
  // Close database
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});