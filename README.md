# NY-24 Campaign Infrastructure

**AI-Powered Campaign Management System - McDairmant for Congress 2026**

This is a comprehensive campaign management platform featuring AI agents, expense tracking, FEC compliance automation, and daily intelligence briefing systems.

## 🚀 Quick Start

### Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Access dashboard
http://localhost:8080/campaign-dashboard
```

### Production Deployment
See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment guide.

**Fastest Deploy (Railway):**
1. Fork this repo
2. Connect to [Railway.app](https://railway.app)
3. Add environment variables from `.env.example`
4. Deploy!

## 🎯 Campaign Features

### **AI Campaign Agents**
- **Martin**: Campaign Director - Electoral strategy and voter outreach
- **Eggsy**: Creative Director - Social media and messaging for rural NY-24
- **Ethel**: Legal Director - FEC compliance and campaign finance law
- **Terri**: Private Advisor - Confidential strategy and candidate coaching

### **Financial Management**
- ✅ Automated expense classification (campaign vs personal vs art project)
- ✅ Bank statement reconciliation with CSV upload
- ✅ Square payment integration for QR code donations
- ✅ Cash receipt tracking for can collections
- ✅ Real-time FEC compliance monitoring
- ✅ Automated contribution limit checking

### **Intelligence & Research**
- ✅ Daily news briefings with political intelligence
- ✅ Automated Claudia Tenney opposition research
- ✅ NY-24 district sentiment tracking
- ✅ Rural/agricultural issue monitoring
- ✅ Campaign finance news alerts

### **Mobile-First Operations**
- ✅ Responsive dashboard for field operations
- ✅ Mobile expense entry and receipt photo upload
- ✅ Real-time notifications for compliance issues
- ✅ Agent chat interface for on-the-go strategy

## 🏗️ Architecture

**Tech Stack:**
- Node.js + Express.js backend
- SQLite database (upgradeable to PostgreSQL)
- Vanilla JavaScript frontend (mobile-optimized)
- Docker containerization
- GitHub Actions CI/CD

**Key Components:**
- `server.js` - Main application server with all APIs
- `news-intelligence.js` - Daily briefing and news monitoring
- `ny24-district-data.js` - NY-24 specific voter targeting
- `campaign-dashboard.html` - Mobile-first operations interface

## 📊 Database Schema

**Financial Tracking:**
- `campaign_expenses` - Enhanced expense tracking with auto-classification
- `bank_transactions` - Bank statement data with reconciliation
- `cash_receipts` - Manual cash receipt tracking
- `payment_integrations` - Square/payment processor logs

**Campaign Operations:**
- `campaign_donors` - FEC-compliant donor management
- `campaign_voters` - NY-24 voter database with targeting
- `opposition_research` - Automated Claudia Tenney monitoring

## 🔧 Configuration

### Required Environment Variables
```bash
NODE_ENV=production
SESSION_SECRET=your-secure-secret
NEWS_API_KEY=your-newsapi-key
CAMPAIGN_NAME="McDairmant for Congress"
CAMPAIGN_DISTRICT="NY-24"
```

### Optional Integrations
```bash
# Payment Processing
SQUARE_APPLICATION_ID=your-square-app-id
SQUARE_ACCESS_TOKEN=your-square-token

# Notifications
SENDGRID_API_KEY=your-sendgrid-key
TWILIO_ACCOUNT_SID=your-twilio-sid
```

## 🧪 Testing

```bash
# Test all systems
npm test

# Test expense classification
node test-expense-classification.js

# Test news intelligence
node test-news-intelligence.js

# Test MCP integration
node test-mcp.js
```

## 📱 API Endpoints

### Campaign Operations
- `GET /campaign-dashboard` - Main operations interface
- `GET/POST /api/expenses` - Expense tracking with auto-classification
- `GET/POST /api/receipts/cash` - Cash receipt management
- `POST /api/banking/upload-statement` - Bank statement upload

### Financial Compliance
- `POST /api/compliance/fec-check` - Real-time FEC compliance
- `GET /api/compliance/expense-report` - Generate FEC reports
- `POST /api/compliance/contribution-limit-check` - Check donor limits

### Intelligence & Research
- `GET /api/intelligence/daily-briefing` - Daily campaign intelligence
- `GET /api/intelligence/opposition-research` - Claudia Tenney monitoring
- `GET /api/intelligence/district-news` - NY-24 news analysis

### AI Agents
- `POST /api/agent/martin/respond` - Campaign strategy discussions
- `POST /api/agent/ethel/respond` - Legal compliance guidance
- `POST /api/agent/eggsy/respond` - Creative content development

## 🎪 The Clown Candidate Approach

This system is designed for an unconventional campaign that combines:
- **Performance Art**: Can collection with campaign materials (clown nose classification example)
- **Authentic Rural Messaging**: AI agents understand NY-24's agricultural community
- **Small-Dollar Fundraising**: QR codes + voter information capture at events
- **FEC Compliance**: Automated compliance for creative campaign activities

### Example: Clown Nose Expense Classification
The system automatically categorizes a "$50 clown nose from France" as:
- **Classification**: `pending` (60% confidence)
- **Reason**: "Could be art project or campaign prop - requires manual review"
- **Category**: `art_project` → `creative_materials`

This allows manual reclassification based on actual usage (personal art vs campaign events).

## 🚀 Deployment Timeline

### Phase 1: Foundation (Complete)
- ✅ Cloud deployment infrastructure
- ✅ Mobile campaign dashboard
- ✅ Daily intelligence briefings

### Phase 2: Field Operations (Next)
- Real-time notifications
- Photo receipt uploads
- Volunteer coordination app

### Phase 3: Election Operations (Future)
- GOTV automation
- Voter contact optimization
- Results tracking

## 🤝 Contributing

This is an open-source campaign infrastructure. Future candidates can:
1. Fork the repository
2. Update district data and opponent information
3. Customize AI agent personalities
4. Deploy for their own campaigns

## 📧 Contact

**Campaign**: McDairmant for Congress
**District**: NY-24 (Challenging Claudia Tenney in 2026)
**Tech**: AI-powered campaign infrastructure

---

*"Politics as Performance Art" - Bringing authentic representation to rural New York.*