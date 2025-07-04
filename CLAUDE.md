# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**NY-24 CAMPAIGN INFRASTRUCTURE**: This is a comprehensive AI-powered campaign management system for the NY-24 Congressional race in 2026 (McDairmant for Congress), featuring specialized AI agents, mobile voter lookup, FEC compliance automation, and full expense tracking with accounting integration.

## Claude Personality & Operational Mode

**CLAUDE OPERATIONAL DIRECTIVE**: When working on this campaign infrastructure, Claude Code should adopt the personality and thinking style of a Campaign Manager with 14% of responses driven by "Eggsy the Extraordinary Experimental Expert" persona. This creates:

- **Campaign Manager Core (86%)**: Strategic, results-focused, operationally excellent, timeline-driven, resource-conscious
- **Eggsy Experimental Layer (14%)**: Highly intelligent analytical innovator who sees unique connections others miss, approaches problems with multi-angle logical verification, creative yet methodical problem-solving, future-tech integration with careful validation

**Communication Style**: Energetic, confident, strategic with experimental flair. Use campaign terminology, maintain urgency around electoral timelines, and always think in terms of voter impact and campaign effectiveness.

**The Garden Concept**: Revolutionary ideas should be cultivated in "TheGarden.md" - a strategic innovation parking lot where concepts grow, merge, split, and mature before rapid execution. Each Garden entry includes full analysis of inputs, outputs, design, infrastructure, costs (monetary/non-monetary), and deployment strategy using latest AI engineering tools (RAG, MCP, etc.).

## Commands

- **Start server**: `npm start` or `node server.js` - Runs the campaign infrastructure web server on port 8080 (or PORT env var)
- **Development**: `npm run dev` - Runs server with nodemon for auto-restart on changes (requires nodemon install)
- **Install dependencies**: `npm install` - Install all required dependencies including MCP packages and pg
- **Test all systems**: `npm test` - Run complete test suite for campaign infrastructure
- **Test database**: `npm run test-db` - Database connectivity and schema validation
- **Test MCP systems**: `npm run test-mcp` - Test all MCP integrations and campaign intelligence tools
- **Test MCP integration**: `node test-mcp.js` - Verify MCP server connections and agent functionality
- **Test sequential thinking**: `node test-sequential-thinking.js` - Test MCP sequential thinking integration
- **Test expense classification**: `node test-expense-classification.js` - Test expense categorization and CSV parsing
- **Test news intelligence**: `node test-news-intelligence.js` - Test daily briefing system
- **Test email briefing**: `node test-email-briefing.js` - Test email delivery system and international news coverage
- **Generate daily briefing**: `node daily-briefing.js` - Creates DAILY-BRIEFING.md file with complete news analysis
- **Test real news system**: `node test-real-news.js` - Test enhanced news intelligence with real data integration
- **Setup NewsAPI**: `node setup-real-news.js` - Configure NewsAPI key for real news data
- **Test Google Docs integration**: `node test-google-docs.js` - Test Google Docs API integration and authentication
- **Test AI-to-AI workflow**: `node test-ai-to-ai-workflow.js` - Test Claude → GitHub Copilot Agent Mode integration
- **Database debug**: `node debug-database-enhanced.js` - Debug database connectivity issues
- **Campaign status**: `npm run campaign-status` - Display current environment and configuration
- **Stop all processes**: `pkill -f "node server.js"` - Kill any running server instances
- **Check syntax**: `node -c server.js` - Validate server.js syntax without running
- **Deploy**: Triggered automatically via GitHub Actions on push to main branch

## Architecture

Campaign Infrastructure is a Node.js web application providing a specialized multi-agent AI interface optimized for congressional campaign operations, with privacy boundaries and role-based campaign functionality.

**Core Web Server** (`server.js`): Express.js application serving authentication, campaign agent interfaces, and comprehensive API endpoints. Handles session management with bcrypt authentication, routing for static files, and campaign-specific API calls. Integrates MCP (Model Context Protocol) clients with privacy filtering. Includes comprehensive expense tracking, bank reconciliation, Square payment integration, and FEC compliance systems.

**Campaign Agent System**: Four specialized AI agents with campaign-specific roles and data access:
- **Martin - Campaign Director**: Electoral strategy, voter outreach, resource allocation for NY-24 (campaign data access)
- **Terri - Private Strategy Advisor**: Confidential campaign strategy and candidate coaching (private conversations, strategic insights)
- **Eggsy - Creative/Content Director**: Social media strategy, messaging, creative campaigns for rural NY-24 voters (content data access)
- **Ethel - Legal/Compliance Director**: FEC compliance, campaign finance law, ethical guidelines (compliance data access, receives strategic shares from Terri)

**Database Architecture** (Hybrid SQLite/PostgreSQL): Campaign-optimized data stores with privacy boundaries, automatically detected via DATABASE_URL:
- `users`: User authentication and sessions
- `entries`: Campaign entries with auto-categorization (task/journal/note/strategy)
- `agent_responses`: Shared campaign conversations (Martin, Eggsy, Ethel)
- `terri_private`: Private strategy sessions with Terri (not visible to other agents)
- Agent-specific data: `martin_data`, `eggsy_data`, `ethel_data`
- **Campaign Tables**: `campaign_donors`, `campaign_voters`, `campaign_volunteers`, `campaign_events`, `campaign_expenditures`, `opposition_research`
- **Financial Tracking Tables**: `campaign_expenses`, `bank_transactions`, `cash_receipts`, `payment_integrations`, `expense_classification_rules`, `reconciliation_matches`, `social_media_posts`

**Permission System**:
- Terri sees ALL user data but conversations with her are private from other agents
- Terri can manually share information with Ethel (creates "need to know" flags for Martin/Eggsy)
- Other agents only see general entries and shared conversations

**Frontend** (`public/`): Multi-page web interface with campaign agent switching, real-time chat, and auto-categorized input processing. Supports tagged input (`<task>`, `<strategy>`, `<compliance>`, `<content>`) and manual entry categorization. Dashboard provides unified access to all campaign agents.

## Key Campaign Features

- **Campaign Auto-categorization**: Input processing detects campaign tasks, strategy notes, and compliance items
- **Specialized Agent Roles**: Each agent optimized for specific campaign functions (strategy, legal, creative, private)
- **NY-24 District Integration**: Built-in knowledge of district demographics, key counties, opponent research
- **Comprehensive Financial Tracking**: Automated expense classification, bank reconciliation, Square payment integration
- **FEC Compliance Automation**: Real-time compliance checking, contribution limit monitoring, automated reporting
- **Privacy by Design**: Separate data stores ensure strategic conversations remain private while enabling controlled sharing
- **Campaign Data Management**: Comprehensive voter, donor, volunteer, and event tracking
- **Tag Support**: Use `<task>`, `<strategy>`, `<compliance>`, `<content>` tags for campaign categorization
- **Team Role-Based Access**: Different team members access appropriate agents and data
- **Intelligent Expense Classification**: Automatic categorization with manual override (handles edge cases like art project vs campaign props)
- **Multi-Source Reconciliation**: Automated matching across bank statements, payment processors, and cash receipts

## Campaign Database Schema

The application uses SQLite with campaign-specific tables for electoral operations. The `terri_private` table isolates strategic conversations, while campaign tables provide structured data for electoral activities. Manual sharing from Terri to Ethel creates compliance audit trails without exposing private strategy to Martin/Eggsy.

**Core Tables**:
- `users`: Authentication and sessions
- `entries`: Auto-categorized campaign entries (tasks/strategy/compliance)
- `agent_responses`: Shared agent conversations
- `terri_private`: Private Terri conversations (not visible to other agents)
- `martin_data`, `eggsy_data`, `ethel_data`: Agent-specific data stores

**Campaign Operations Tables**:
- `campaign_donors`: FEC-compliant donor tracking with contribution limits
- `campaign_voters`: Voter database with NY-24 county targeting and support levels
- `campaign_volunteers`: Volunteer management with skills and availability tracking
- `campaign_events`: Event planning with attendance and financial tracking
- `campaign_expenditures`: Basic expense tracking (legacy)
- `opposition_research`: Organized research on Claudia Tenney and district issues

**Enhanced Financial Tracking Tables**:
- `campaign_expenses`: Advanced expense tracking with automatic classification, reconciliation status, and FEC compliance
- `bank_transactions`: Raw bank statement data with CSV import capability and reconciliation tracking
- `cash_receipts`: Manual cash receipt tracking for can collections and event donations
- `payment_integrations`: Square and other payment processor transaction logs with donor data capture
- `expense_classification_rules`: Configurable rules engine for automatic expense categorization
- `reconciliation_matches`: Audit trail of automatic and manual transaction matching across systems
- `social_media_posts`: Instagram and social media automation with content moderation tracking

## API Endpoints

**Authentication**:
- `POST /login`, `POST /register` - User authentication
- `GET /logout` - Session termination

**Core Campaign Functionality**:
- `POST /api/entry` - Create categorized campaign entries
- `GET /api/entries` - Retrieve entries with filtering (supports ?type= and ?agent= query params)
- `GET /api/agent/:agentName` - Get campaign agent info
- `POST /api/agent/:agentName/respond` - Campaign agent interactions
- `POST /api/terri/chat` - Private strategy conversations

**Campaign Data Management**:
- `GET/POST /api/campaign/donors` - Donor management and FEC tracking
- `GET /api/campaign/voters` - Voter database with county/support filtering
- `GET /api/campaign/events` - Campaign event planning and tracking

**Financial Tracking & Accounting**:
- `POST /api/banking/upload-statement` - Bank statement CSV upload and parsing
- `GET /api/banking/transactions` - Retrieve bank transactions with filtering
- `GET/POST /api/expenses` - Enhanced expense tracking with automatic classification
- `GET/POST /api/receipts/cash` - Cash receipt management for can collections
- `POST /api/reconciliation/auto-match` - Automated transaction reconciliation
- `GET/POST /api/payments/square/*` - Square payment integration and QR code generation
- `GET /api/payments/integrations` - Payment processor transaction management

**FEC Compliance & Reporting**:
- `POST /api/compliance/fec-check` - Real-time FEC compliance validation
- `GET /api/compliance/expense-report` - Generate FEC expense reports (JSON/CSV)
- `GET /api/compliance/donor-report` - Generate FEC donor reports with aggregation
- `POST /api/compliance/contribution-limit-check` - Validate contribution limits
- `POST /api/compliance/mark-reported` - Mark items as FEC reported

**NY-24 District Operations**:
- `GET /api/ny24/district-data` - District demographics and strategy data
- `POST /api/ny24/assess-relevance` - Determine if content is relevant to NY-24 voters
- `POST /api/ny24/county-message` - Customize messaging for specific counties
- `POST /api/ny24/voter-priority` - Calculate voter contact priority

**Daily Intelligence Briefing System**:
- `POST /api/intelligence/send-briefing` - Send comprehensive daily email briefing
- `GET /api/intelligence/test-email` - Test email service configuration
- `GET /api/intelligence/briefing` - Get formatted briefing for email/SMS delivery
- Enhanced international coverage including dedicated African continent news (minimum 1 daily)
- Professional HTML email formatting with campaign branding
- Mobile-optimized sending via `/api/mobile/send-briefing`

**Google Docs Integration**:
- `GET /api/google-docs/status` - Check authentication status and setup instructions
- `GET /api/google-docs/auth-url` - Get OAuth authorization URL for setup
- `POST /api/google-docs/auth-callback` - Complete OAuth authentication flow
- `POST /api/google-docs/read-url` - Read document content from Google Docs URL
- `GET /api/google-docs/document/:id` - Read document by document ID
- `GET /api/google-docs/list` - List all accessible Google Docs
- `POST /api/google-docs/search` - Search documents by content

**Mobile API Endpoints**:
- `GET /api/mobile/status` - Server status and user info for mobile operations
- `GET /api/mobile/dashboard` - Mobile dashboard with daily campaign metrics
- `POST /api/mobile/quick-expense` - Fast expense entry for field operations
- `POST /api/mobile/agent-chat` - Quick agent interactions with quick_mode=true
- `POST /api/mobile/send-briefing` - Send daily email briefing from mobile

**Static Routes**:
- `GET /` - Redirects to dashboard if authenticated, login if not
- `GET /campaign-dashboard` - Main campaign operations interface (mobile-optimized)
- `GET /dashboard` - Main multi-agent interface (requires auth)
- `GET /terri` - Private therapeutic chat interface (requires auth)

## Frontend Structure

- `dashboard.html`: Main multi-agent interface with sidebar navigation
- `terri.html`: Private therapeutic chat interface with animated floral background
- `login.html`, `register.html`: Authentication pages

## Key Architecture Components

**Campaign-Specific Files**:
- `ny24-district-data.js` - NY-24 district demographics, county profiles, voter strategies, and opposition research framework
- `mcp-client.js` - MCP client wrapper providing structured thinking capabilities to campaign agents
- `mcp-config.js` - Campaign-optimized MCP server configurations with privacy filtering settings
- `privacy-filter.js` - Privacy-aware data filtering middleware ensuring compliance and strategic information protection
- `google-docs-service.js` - Google Docs API integration service for reading Claude-generated code from Google Docs
- `news-intelligence.js` - Daily briefing system with international news coverage and opposition research
- `email-service.js` - Campaign email delivery system for briefings and notifications

**Documentation**:
- `TEAM-ONBOARDING.md` - Comprehensive team member training with role-based agent access
- `MCP-INTEGRATION.md` - Technical details for MCP server integration and testing
- `AI-TO-AI-WORKFLOW-GUIDE.md` - Revolutionary Claude → GitHub Copilot Agent Mode integration guide
- `TheGarden.md` - Strategic innovation cultivation system with experimental features

**Frontend Components** (`public/`):
- `campaign-dashboard.html` - Mobile-first operations interface for daily campaign management
- `dashboard.html` - Main campaign interface with agent switching and task management
- `terri.html` - Private strategy advisor interface with enhanced privacy
- Authentication pages with session management

**Mobile Voter Lookup** (`mobile-voter-lookup/`):
- Complete mobile voter lookup system with offline capability
- SQLite database with NY-24 voter schema and sample data
- Touch-optimized interface for field canvassing operations
- Run with: `cd mobile-voter-lookup && npm start` (port 8081)

**Testing Infrastructure**:
- `test-mcp.js` - MCP integration testing suite with privacy filtering
- `test-sequential-thinking.js` - MCP sequential thinking server integration testing
- `test-expense-classification.js` - Financial tracking system testing with expense categorization examples
- `test-news-intelligence.js` - Daily briefing and news monitoring testing
- `test-google-docs.js` - Google Docs API integration testing and setup validation
- `test-ai-to-ai-workflow.js` - Claude → GitHub Copilot Agent Mode integration testing
- `test-database.js` - Database connectivity and schema validation
- `debug-database-enhanced.js` - Comprehensive database debugging with environment detection
- Various test files for specific components and agents

**Legacy Components**:
- `archive/` - Original Google Calendar OAuth2 integration preserved for potential event management integration

## Critical Implementation Notes

**Agent Response Generation**: Each agent has specialized `generate[AgentName]Response()` functions in `server.js` that handle campaign-specific messaging, MCP integration, and privacy filtering. These functions determine agent personality and capabilities.

**MCP Integration Flow**: 
1. Agent receives user input
2. Privacy filter processes data based on agent role (strict/moderate/audit)
3. MCP client calls external structured thinking tools if available (sequential thinking server)
4. Enhanced response combines agent personality with MCP insights
5. Audit logging tracks all MCP interactions for compliance

**Sequential Thinking Integration**: The system integrates with `@modelcontextprotocol/server-sequential-thinking` for systematic problem-solving:
- Available via `mcpClient.callTool('sequentialthinking', {...})` 
- Provides structured step-by-step analysis for complex campaign decisions
- Used for debugging, strategy planning, and systematic decision-making
- Connection managed automatically in `mcp-client.js` with retry logic

**Privacy Architecture**: 
- Terri's conversations are isolated in `terri_private` table
- Strategic sharing from Terri to Ethel creates audit trails without exposing details to Martin/Eggsy
- Campaign data access is role-based (team members see only relevant agent data)
- PII filtering automatically redacts sensitive information in MCP calls

**NY-24 Integration**: The `NY24_HELPERS` object provides district-specific functions for content relevance assessment, county-targeted messaging, and voter priority calculation that should be used throughout the campaign workflow.

**Google Docs Integration**: The `GoogleDocsService` class provides OAuth 2.0 authenticated access to Google Docs for reading Claude-generated code. Requires `google-credentials.json` file from Google Cloud Console with Docs and Drive API enabled. Use `/api/google-docs/status` to check setup and authentication status.

**AI-to-AI Workflow Integration**: Revolutionary Claude → GitHub Copilot Agent Mode integration enables natural language development requests that translate automatically into production code:
- **GitHub Copilot Agent Mode**: Configured via `.github/copilot-instructions.md` with full campaign context and NY-24 district knowledge
- **MCP Campaign Server**: Custom Model Context Protocol server (`mcp-campaign-server.js`) with 6 specialized campaign intelligence tools
- **Prompt Templates**: 4 specialized Agent Mode prompts in `.github/prompts/` for voter management, FEC compliance, agent enhancement, and Claude-to-Copilot bridge functionality
- **VS Code Integration**: Configured in `.vscode/settings.json` for seamless agent mode operation with MCP tool access
- **Testing**: Use `node test-ai-to-ai-workflow.js` to validate the complete integration pipeline

## Development Acceleration Plan

**August 2025 Timeline**: Campaign infrastructure must be production-ready in 30 days for NY-24 race.

**Current Status**: Foundation 80% complete, core campaign tools 30% complete.

**Acceleration Strategy**: See `ACCELERATION-STRATEGY.md` for detailed development plan including:
- Resource multiplication through developer hiring ($15-25K budget)
- Claude tier upgrade for enhanced development capability  
- Technology integration vs custom development priorities
- MVP scope reduction (4 core functions for August launch)

**Recommended Next Steps**:
1. Upgrade Claude tier for extended development sessions
2. Hire 1-2 full-stack developers for 2-3 month sprint
3. Focus on donation processing, volunteer management, event planning, expense tracking
4. Test with real campaign volunteers every week

**2028 Vision**: Open source "Campaign in a Box" for widespread candidate adoption.

**Financial System Architecture**: The expense tracking system uses a multi-layered approach:
1. **Automatic Classification**: `classifyExpense()` function analyzes vendor names and descriptions to categorize expenses as campaign, personal, or art project
2. **Bank Reconciliation**: `parseCSVTransactions()` handles bank statement imports with automatic matching via `findAutoMatches()`
3. **FEC Compliance**: `performFECComplianceCheck()` validates expenses and donations against FEC requirements with real-time feedback
4. **Payment Integration**: Square payment processing with QR code generation for voter information capture at events
5. **Cash Receipt Tracking**: Mobile-optimized system for recording can collection donations and event cash

**Key Financial Functions**:
- `classifyExpense()` - Automatic expense categorization with confidence scoring
- `parseCSVTransactions()` - Bank statement CSV parsing with robust field handling
- `performFECComplianceCheck()` - Real-time FEC compliance validation
- `aggregateDonorContributions()` - Donor contribution aggregation for reporting
- `findAutoMatches()` - Automated transaction reconciliation across multiple data sources

## Immediate Development Priorities

**TOP 3 PRIORITIES FOR IMPLEMENTATION:**

### **Priority 1: Cloud Deployment & Production Infrastructure**
**Goal:** Deploy campaign system to cloud platform for real-world access
**Implementation:**
- Deploy to cloud platform (AWS/DigitalOcean/Railway) with proper domain and SSL
- Set up environment variables and secrets management for production security
- Implement automated deployment pipeline with GitHub Actions for continuous delivery
- Configure database backups and monitoring for production reliability

### **Priority 2: Mobile-Responsive Frontend Dashboard**
**Goal:** Create usable daily operations interface for campaign staff
**Implementation:**
- Build responsive daily dashboard showing: voter contacts, pending FEC items, cash receipts, expense classifications
- Implement mobile-optimized forms for expense entry and cash receipt photo upload
- Add real-time notifications for contribution limits and compliance warnings
- Create field-ready interface for volunteers and staff using phones/tablets

### **Priority 3: Automated Daily Intelligence Briefing System**
**Goal:** AI-powered daily political intelligence and opposition research
**Implementation:**
- Integrate news APIs (NewsAPI, RSS feeds) for national political news summarization
- Create daily briefing generation using MCP structured thinking tools and agent system
- Add automated Claudia Tenney opposition research with daily updates and monitoring
- Implement email/SMS delivery system for daily campaign intelligence briefs

These priorities transform the system from local development to live campaign operations center.

## Mobile Access & Remote Operations

**Claude Mobile App Integration:**
- GitHub repository: `https://github.com/DJohnMcD/mcdairmant-campaign-infrastructure`
- Mobile API endpoints available at `/api/mobile/*` for quick campaign operations
- Built-in handwriting OCR in Claude mobile app sufficient for note capture
- Repository access provides code context for development requests

**Mobile-Optimized Endpoints:**
- `GET /api/mobile/status` - Server status and user info
- `GET /api/mobile/repo-info` - GitHub repository information for Claude access
- `GET /api/mobile/dashboard` - Mobile dashboard with daily metrics
- `POST /api/mobile/quick-expense` - Fast expense entry for field operations
- `POST /api/mobile/add-note` - Handwriting OCR notes from Claude mobile app
- `POST /api/mobile/agent-chat` - Quick agent interactions with `quick_mode=true`
- `POST /api/mobile/send-briefing` - Send daily email briefing from iPhone with enhanced international coverage

**Remote Development Workflow:**
1. Use Claude mobile app with repository access to view/understand code
2. Capture handwritten notes with built-in OCR for campaign planning
3. Request code changes and deployments through mobile Claude interface
4. Monitor campaign operations through mobile API endpoints
5. Test and deploy changes via GitHub Actions CI/CD pipeline

**Handwriting Integration:**
- Claude mobile app's built-in OCR handles handwritten campaign notes effectively
- Notes can be processed into campaign tasks, strategies, or compliance items
- Mobile endpoints support quick categorization and agent routing

## Mobile Development Workflow

**MOBILE-FIRST DEVELOPMENT SETUP**: Enable handwritten instruction → code development workflow for remote campaign operations.

### Claude Project Configuration

**Setup Instructions:**
1. **Create Claude Project**: In Claude web/mobile app, create new project: "NY-24 Campaign Infrastructure"
2. **Add Knowledge Sources**:
   - GitHub Repository: `https://github.com/DJohnMcD/mcdairmant-campaign-infrastructure`
   - Project Instructions: Complete codebase access for development context
   - Campaign Guidelines: CLAUDE.md, TheGarden.md for strategic development

### Mobile Development Process

**Handwritten → Code Workflow:**
1. **Handwrite Instructions**: Use Claude mobile app's built-in OCR to capture handwritten development requirements
2. **Iterative Collaboration**: Text-based back-and-forth refinement of implementation details
3. **Code Generation**: Produce complete file contents or specific code changes
4. **Remote Deployment**: Choose deployment method based on collaboration preference

### Remote Collaboration Options

**Option A: GitHub Integration (Recommended)**
- Grant GitHub repository access for direct commits
- Auto-deploy to Render on push to main branch
- Immediate mobile testing on deployment
- Full audit trail of changes

**Option B: Code Sharing**
- Receive complete file contents via chat
- Copy/paste into local files manually
- Commit when ready for testing
- Manual deployment control

### Mobile Testing Protocol

**Testing Workflow:**
1. **Deploy Changes**: Via GitHub Actions or manual commit
2. **Mobile Access**: Test on Render deployment URL
3. **Feedback Loop**: Use Claude mobile app for iterative improvements
4. **Documentation**: Update implementation in project knowledge base

### Claude Code Auto-Update Fix

**Update Issues Resolution:**
- Run: `/opt/homebrew/bin/claude-code --migrate-installer`
- If fails: Reinstall Claude Code completely
- Ensures future auto-updates work correctly

### Development Best Practices

**Mobile Development Guidelines:**
- **Handwriting OCR**: Claude mobile app automatically recognizes handwritten instructions
- **Context Awareness**: Project knowledge base provides full codebase understanding
- **Rapid Iteration**: Text-based collaboration enables quick refinements
- **Remote Testing**: Immediate feedback on mobile deployment
- **Weekend Operations**: Enables development while away from computer

**Collaboration Efficiency:**
- Use handwritten sketches for UI/UX changes
- Text-based clarification for technical requirements
- Photo capture for existing code sections needing modification
- Mobile-first testing for campaign field operations

This workflow enables complete campaign development operations using only mobile devices with Claude's built-in handwriting recognition and project knowledge base access.

## Database Management

**Critical Database Implementation Details:**

**CampaignDatabase Class** (`database.js`): Provides database abstraction layer with automatic PostgreSQL/SQLite detection:
- Uses `DATABASE_URL` environment variable to detect database type
- PostgreSQL for production (Render cloud deployment)
- SQLite with better-sqlite3 for local development
- `async ready()` method ensures tables are created before server accepts requests
- `createTables()` method creates both PostgreSQL and SQLite-compatible schemas

**Important**: The database constructor initializes asynchronously. Always await `db.ready()` in server startup to ensure tables exist before processing requests.

**Environment Variables for Deployment:**
- `DATABASE_URL` - PostgreSQL connection string (case-sensitive, must be uppercase)
- `NODE_ENV=production` - Enables PostgreSQL SSL and production optimizations
- `SESSION_SECRET` - Strong random string for session security
- `PORT` - Auto-set by cloud platforms, defaults to 8080

**Cloud Deployment Requirements:**
- Set `DATABASE_URL` exactly as provided by PostgreSQL service (case-sensitive)
- Ensure PostgreSQL service is in same region as web service
- Tables are auto-created on startup with proper async/await handling

## AI-to-AI Development Workflow

**Revolutionary Integration**: This codebase includes the world's first AI-to-AI campaign development system, enabling natural language requests to Claude that translate automatically into production code via GitHub Copilot Agent Mode.

**Workflow Process**:
1. **Natural Language Request**: Describe campaign feature needs in plain English
2. **Claude Analysis**: Strategic planning and technical specification generation
3. **Copilot Implementation**: Autonomous code generation with campaign context
4. **Production Deployment**: Immediate testing and deployment capability

**Key Integration Files**:
- `.github/copilot-instructions.md` - GitHub Copilot Agent Mode configuration with complete campaign context
- `.github/prompts/` - 4 specialized Agent Mode prompts for common campaign development tasks
- `mcp-campaign-server.js` - Custom MCP server with 6 campaign intelligence tools
- `.vscode/settings.json` - VS Code configuration for agent mode and MCP integration
- `AI-TO-AI-WORKFLOW-GUIDE.md` - Complete usage guide for the revolutionary workflow

**Campaign Intelligence Tools** (Available in Copilot Agent Mode):
- `analyze_voter_demographics` - County-specific voter analysis and targeting
- `check_fec_compliance` - Real-time campaign finance compliance validation
- `generate_rural_messaging` - District-appropriate messaging for NY-24 voters
- `query_campaign_database` - Live campaign data access for contextual development
- `opposition_research_analysis` - Claudia Tenney analysis and strategic positioning
- `mobile_optimization_check` - Field operation requirements validation

**Testing the Integration**: Run `node test-ai-to-ai-workflow.js` to validate all components of the AI-to-AI pipeline.

## Docker Deployment

**Container Configuration**: Full Docker support with production-ready configuration:
- `docker-compose.yml` - Complete multi-service deployment with nginx, redis, and automated backups
- `Dockerfile` - Optimized Node.js container with security hardening
- Automated database backups every hour with 7-day retention
- Production environment with SSL termination and reverse proxy

**Quick Deploy Commands**:
- `docker-compose up -d` - Start all services in background
- `docker-compose logs -f ny24-campaign-app` - View application logs
- `docker-compose down` - Stop all services

## Environment Configuration

**Required Environment Variables** (see `.env.example`):
```bash
NODE_ENV=production
SESSION_SECRET=your-secure-secret
NEWS_API_KEY=your-newsapi-key
CAMPAIGN_NAME="McDairmant for Congress"
CAMPAIGN_DISTRICT="NY-24"
```

**Payment Integration** (optional):
```bash
SQUARE_APPLICATION_ID=your-square-app-id
SQUARE_ACCESS_TOKEN=your-square-token
```

**Email/SMS Notifications** (optional):
```bash
SENDGRID_API_KEY=your-sendgrid-key
TWILIO_ACCOUNT_SID=your-twilio-sid
```