const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

class GoogleDocsService {
  constructor() {
    this.credentialsPath = path.join(__dirname, 'google-credentials.json');
    this.tokenPath = path.join(__dirname, 'google-token.json');
    this.auth = null;
    this.docs = null;
  }

  async authenticate() {
    try {
      // Load credentials
      if (!fs.existsSync(this.credentialsPath)) {
        throw new Error('Google credentials file not found. Please create google-credentials.json');
      }

      const credentials = JSON.parse(fs.readFileSync(this.credentialsPath));
      const { client_secret, client_id, redirect_uris } = credentials.web || credentials.installed;
      
      this.auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
      
      // Check if we have a stored token
      if (fs.existsSync(this.tokenPath)) {
        const token = fs.readFileSync(this.tokenPath);
        this.auth.setCredentials(JSON.parse(token));
      } else {
        throw new Error('No authentication token found. Please run authentication flow first.');
      }

      // Initialize Docs API
      this.docs = google.docs({ version: 'v1', auth: this.auth });
      
      return true;
    } catch (error) {
      console.error('Authentication failed:', error.message);
      return false;
    }
  }

  generateAuthUrl() {
    if (!this.auth) {
      throw new Error('OAuth client not initialized. Call authenticate() first.');
    }

    const authUrl = this.auth.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/documents.readonly',
        'https://www.googleapis.com/auth/drive.readonly'
      ]
    });
    
    return authUrl;
  }

  async saveAuthToken(code) {
    try {
      const { tokens } = await this.auth.getToken(code);
      this.auth.setCredentials(tokens);
      
      // Save token for future use
      fs.writeFileSync(this.tokenPath, JSON.stringify(tokens));
      
      // Initialize Docs API
      this.docs = google.docs({ version: 'v1', auth: this.auth });
      
      return true;
    } catch (error) {
      console.error('Failed to save auth token:', error.message);
      return false;
    }
  }

  async readDocument(documentId) {
    try {
      if (!this.docs) {
        const authenticated = await this.authenticate();
        if (!authenticated) {
          throw new Error('Failed to authenticate with Google Docs API');
        }
      }

      const response = await this.docs.documents.get({
        documentId: documentId
      });

      return this.extractTextFromDocument(response.data);
    } catch (error) {
      console.error('Failed to read document:', error.message);
      throw error;
    }
  }

  extractTextFromDocument(document) {
    const content = document.body.content;
    let text = '';
    
    content.forEach(element => {
      if (element.paragraph) {
        element.paragraph.elements.forEach(elem => {
          if (elem.textRun) {
            text += elem.textRun.content;
          }
        });
      } else if (element.table) {
        // Handle tables
        element.table.tableRows.forEach(row => {
          row.tableCells.forEach(cell => {
            cell.content.forEach(cellElement => {
              if (cellElement.paragraph) {
                cellElement.paragraph.elements.forEach(elem => {
                  if (elem.textRun) {
                    text += elem.textRun.content;
                  }
                });
              }
            });
          });
        });
      }
    });

    return {
      title: document.title,
      content: text,
      documentId: document.documentId,
      revisionId: document.revisionId
    };
  }

  async listDocuments(folderId = null) {
    try {
      const drive = google.drive({ version: 'v3', auth: this.auth });
      
      let query = "mimeType='application/vnd.google-apps.document'";
      if (folderId) {
        query += ` and '${folderId}' in parents`;
      }

      const response = await drive.files.list({
        q: query,
        fields: 'files(id, name, modifiedTime, webViewLink)'
      });

      return response.data.files;
    } catch (error) {
      console.error('Failed to list documents:', error.message);
      throw error;
    }
  }

  async searchDocuments(searchTerm) {
    try {
      const drive = google.drive({ version: 'v3', auth: this.auth });
      
      const query = `mimeType='application/vnd.google-apps.document' and fullText contains '${searchTerm}'`;

      const response = await drive.files.list({
        q: query,
        fields: 'files(id, name, modifiedTime, webViewLink)'
      });

      return response.data.files;
    } catch (error) {
      console.error('Failed to search documents:', error.message);
      throw error;
    }
  }

  extractDocumentIdFromUrl(url) {
    const match = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  }
}

module.exports = GoogleDocsService;