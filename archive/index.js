const http = require('http');
const url = require('url');
const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');

// Load credentials
let credentials;
try {
    const credentialsPath = path.join(__dirname, 'credentials.json');
    credentials = require(credentialsPath);
} catch (error) {
    console.error('Error loading credentials.json:', error.message);
    process.exit(1);
}

// OAuth2 setup
const { client_id, client_secret, redirect_uris } = credentials.web || credentials.installed;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

// Scopes for Google Calendar API
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

// Token file path
const TOKEN_PATH = path.join(__dirname, 'token.json');

// Server setup
const PORT = 3000;

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const { pathname, query } = parsedUrl;

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    try {
        if (pathname === '/') {
            // Root path - start OAuth flow or show status
            const token = await loadToken();
            
            if (token) {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(`
                    <html>
                        <body>
                            <h1>Calendar Bridge</h1>
                            <p>✅ Already authenticated!</p>
                            <p><a href="/calendars">View Calendars</a></p>
                            <p><a href="/auth">Re-authenticate</a></p>
                        </body>
                    </html>
                `);
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(`
                    <html>
                        <body>
                            <h1>Calendar Bridge</h1>
                            <p>Not authenticated yet.</p>
                            <p><a href="/auth">Start Authentication</a></p>
                        </body>
                    </html>
                `);
            }
        } else if (pathname === '/auth') {
            // Start OAuth flow
            const authUrl = oAuth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: SCOPES,
            });
            
            res.writeHead(302, { Location: authUrl });
            res.end();
        } else if (pathname === '/oauth/callback' || query.code) {
            // Handle OAuth callback
            if (query.code) {
                try {
                    const { tokens } = await oAuth2Client.getToken(query.code);
                    oAuth2Client.setCredentials(tokens);
                    
                    // Save token
                    await saveToken(tokens);
                    
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(`
                        <html>
                            <body>
                                <h1>Calendar Bridge</h1>
                                <p>✅ Authentication successful!</p>
                                <p><a href="/calendars">View Calendars</a></p>
                                <p><a href="/">Back to Home</a></p>
                            </body>
                        </html>
                    `);
                } catch (error) {
                    console.error('Error getting tokens:', error);
                    res.writeHead(400, { 'Content-Type': 'text/html' });
                    res.end(`
                        <html>
                            <body>
                                <h1>Authentication Error</h1>
                                <p>Failed to get access token: ${error.message}</p>
                                <p><a href="/auth">Try Again</a></p>
                            </body>
                        </html>
                    `);
                }
            } else {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('No authorization code provided');
            }
        } else if (pathname === '/calendars') {
            // Show calendars
            const token = await loadToken();
            if (!token) {
                res.writeHead(302, { Location: '/auth' });
                res.end();
                return;
            }
            
            oAuth2Client.setCredentials(token);
            const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
            
            try {
                const calendarList = await calendar.calendarList.list();
                const calendars = calendarList.data.items || [];
                
                const calendarHtml = calendars.map(cal => 
                    `<li><strong>${cal.summary}</strong> (${cal.id})</li>`
                ).join('');
                
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(`
                    <html>
                        <body>
                            <h1>Your Calendars</h1>
                            <ul>${calendarHtml}</ul>
                            <p><a href="/">Back to Home</a></p>
                        </body>
                    </html>
                `);
            } catch (error) {
                console.error('Error fetching calendars:', error);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error fetching calendars: ' + error.message);
            }
        } else {
            // 404
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
        }
    } catch (error) {
        console.error('Server error:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
});

// Helper functions
async function loadToken() {
    try {
        const token = await fs.readFile(TOKEN_PATH);
        return JSON.parse(token);
    } catch (error) {
        return null;
    }
}

async function saveToken(token) {
    try {
        await fs.writeFile(TOKEN_PATH, JSON.stringify(token));
        console.log('Token stored to', TOKEN_PATH);
    } catch (error) {
        console.error('Error saving token:', error);
    }
}

// Start server
server.listen(PORT, () => {
    console.log(`Calendar Bridge server running on http://localhost:${PORT}`);
    console.log('Visit http://localhost:3000 to start authentication');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});