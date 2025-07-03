// Email Service for Campaign Intelligence Briefings
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  // Initialize nodemailer transporter
  initializeTransporter() {
    const config = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    };

    // Only create transporter if SMTP credentials are provided
    if (config.auth.user && config.auth.pass) {
      this.transporter = nodemailer.createTransporter(config);
      console.log('📧 Email service initialized with SMTP configuration');
    } else {
      console.log('📧 Email service not configured - SMTP credentials missing');
    }
  }

  // Send daily briefing email
  async sendDailyBriefing(briefing, recipientEmail) {
    if (!this.transporter) {
      throw new Error('Email service not configured. Please set SMTP environment variables.');
    }

    const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER;
    const fromName = process.env.FROM_NAME || 'NY-24 Campaign Intelligence';

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: recipientEmail,
      subject: `🗞️ Daily Campaign Briefing - ${briefing.date} (Priority: ${briefing.summary.priorityLevel})`,
      html: this.generateEmailHTML(briefing),
      text: this.generateEmailText(briefing)
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`📧 Briefing email sent to ${recipientEmail}: ${info.messageId}`);
      return {
        success: true,
        messageId: info.messageId,
        recipient: recipientEmail
      };
    } catch (error) {
      console.error('📧 Error sending email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  // Generate HTML email content
  generateEmailHTML(briefing) {
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Daily Campaign Briefing</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4; }
          .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px; }
          .priority-high { color: #dc2626; font-weight: bold; }
          .priority-medium { color: #ea580c; font-weight: bold; }
          .priority-low { color: #16a34a; font-weight: bold; }
          .section { margin-bottom: 30px; }
          .section h2 { color: #1e40af; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
          .article-list { list-style: none; padding: 0; }
          .article-item { background: #f8fafc; margin: 10px 0; padding: 15px; border-left: 4px solid #3b82f6; border-radius: 4px; }
          .article-title { font-weight: bold; margin-bottom: 5px; }
          .article-source { color: #6b7280; font-size: 0.9em; }
          .action-item { background: #fef3c7; padding: 15px; margin: 10px 0; border-left: 4px solid #f59e0b; border-radius: 4px; }
          .stats { display: flex; justify-content: space-around; background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .stat { text-align: center; }
          .stat-number { font-size: 2em; font-weight: bold; color: #1e40af; }
          .stat-label { color: #6b7280; font-size: 0.9em; }
          .footer { background: #f8fafc; padding: 20px; text-align: center; color: #6b7280; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🗞️ Daily Campaign Intelligence Briefing</h1>
            <p>NY-24 Congressional Campaign 2026</p>
          </div>
          
          <div class="content">
            <div class="stats">
              <div class="stat">
                <div class="stat-number">${briefing.date}</div>
                <div class="stat-label">Date</div>
              </div>
              <div class="stat">
                <div class="stat-number priority-${briefing.summary.priorityLevel.toLowerCase()}">${briefing.summary.priorityLevel}</div>
                <div class="stat-label">Priority</div>
              </div>
              <div class="stat">
                <div class="stat-number">${briefing.summary.totalArticles}</div>
                <div class="stat-label">Articles Analyzed</div>
              </div>
            </div>
            
            <div class="section">
              <h2>📋 Executive Summary</h2>
              <ul>
                ${briefing.summary.keyHighlights.map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
    `;

    // Add action items
    if (briefing.actionItems && briefing.actionItems.length > 0) {
      html += `
        <div class="section">
          <h2>⚡ Action Items</h2>
          ${briefing.actionItems.map(action => `
            <div class="action-item">
              <strong>${action.priority.toUpperCase()}:</strong> ${action.description}
              ${action.dueDate ? `<br><small>Due: ${new Date(action.dueDate).toLocaleDateString()}</small>` : ''}
            </div>
          `).join('')}
        </div>
      `;
    }

    // Add news sections
    if (briefing.sections) {
      Object.values(briefing.sections).forEach(section => {
        if (section.articles && section.articles.length > 0) {
          html += `
            <div class="section">
              <h2>${section.title}</h2>
              <ul class="article-list">
                ${section.articles.slice(0, 5).map(article => `
                  <li class="article-item">
                    <div class="article-title">
                      <a href="${article.url}" target="_blank" style="color: #1e40af; text-decoration: none;">
                        ${article.title}
                      </a>
                    </div>
                    <div class="article-source">${article.source} • ${new Date(article.publishedAt).toLocaleDateString()}</div>
                    ${article.description ? `<div style="margin-top: 8px; color: #374151;">${article.description.substring(0, 200)}${article.description.length > 200 ? '...' : ''}</div>` : ''}
                  </li>
                `).join('')}
              </ul>
            </div>
          `;
        }
      });
    }

    // Add opportunity alerts if present
    if (briefing.opportunityAlerts && briefing.opportunityAlerts.length > 0) {
      html += `
        <div class="section">
          <h2>🎯 Opportunity Alerts</h2>
          ${briefing.opportunityAlerts.map(opportunity => `
            <div class="action-item" style="background: #dcfce7; border-left-color: #16a34a;">
              <strong>${opportunity.type.toUpperCase()}:</strong> ${opportunity.description}
              ${opportunity.source ? `<br><small>Source: ${opportunity.source}</small>` : ''}
            </div>
          `).join('')}
        </div>
      `;
    }

    html += `
          </div>
          
          <div class="footer">
            <p><em>Generated at ${new Date(briefing.generatedAt).toLocaleString()}</em></p>
            <p>NY-24 Campaign Intelligence System</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return html;
  }

  // Generate plain text email content
  generateEmailText(briefing) {
    let text = `
🗞️ DAILY CAMPAIGN INTELLIGENCE BRIEFING
NY-24 Congressional Campaign 2026

Date: ${briefing.date}
Priority Level: ${briefing.summary.priorityLevel}
Articles Analyzed: ${briefing.summary.totalArticles}

EXECUTIVE SUMMARY:
${briefing.summary.keyHighlights.map(item => `• ${item}`).join('\n')}
`;

    // Add action items
    if (briefing.actionItems && briefing.actionItems.length > 0) {
      text += `\n\n⚡ ACTION ITEMS:\n`;
      briefing.actionItems.forEach(action => {
        text += `• [${action.priority.toUpperCase()}] ${action.description}\n`;
        if (action.dueDate) {
          text += `  Due: ${new Date(action.dueDate).toLocaleDateString()}\n`;
        }
      });
    }

    // Add news sections
    if (briefing.sections) {
      Object.values(briefing.sections).forEach(section => {
        if (section.articles && section.articles.length > 0) {
          text += `\n\n${section.title.toUpperCase()}:\n`;
          section.articles.slice(0, 3).forEach(article => {
            text += `• ${article.title}\n  ${article.source} • ${article.url}\n`;
          });
        }
      });
    }

    text += `\n\nGenerated at ${new Date(briefing.generatedAt).toLocaleString()}`;
    
    return text;
  }

  // Test email configuration
  async testConnection() {
    if (!this.transporter) {
      return { success: false, error: 'Email service not configured' };
    }

    try {
      await this.transporter.verify();
      return { success: true, message: 'Email service connection successful' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = EmailService;