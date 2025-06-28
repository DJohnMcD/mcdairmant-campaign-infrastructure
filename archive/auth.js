const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

class GoogleAuth {
  constructor() {
    this.credentialsPath = path.join(__dirname, 'credentials.json');
    this.tokenPath = path.join(__dirname, 'token.json');
    this.auth = null;
  }

  async authenticate() {
    // Load credentials and create OAuth2 client
    const credentials = JSON.parse(fs.readFileSync(this.credentialsPath));
    const { client_secret, client_id, redirect_uris } = credentials.web;
    
    this.auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    
    // Check if we have a stored token
    if (fs.existsSync(this.tokenPath)) {
      const token = fs.readFileSync(this.tokenPath);
      this.auth.setCredentials(JSON.parse(token));
      return this.auth;
    } else {
      return await this.getNewToken();
    }
  }

  async getNewToken() {
    const authUrl = this.auth.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/calendar']
    });
    
    console.log('Authorize this app by visiting:', authUrl);
    return this.auth;
  }
}

module.exports = GoogleAuth;