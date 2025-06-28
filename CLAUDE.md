# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**CAMPAIGN INFRASTRUCTURE STATUS**: This codebase has been transformed from a personal AI assistant into a comprehensive campaign management system for the NY-24 Congressional race in 2026, with full expense tracking and accounting integration.

## Commands

- **Start server**: `npm start` or `node server.js` - Runs the campaign infrastructure web server on port 8080
- **Development**: `npm run dev` - Runs server with nodemon for auto-restart on changes (requires nodemon install)
- **Install dependencies**: `npm install` - Install all required dependencies including MCP packages
- **Test MCP integration**: `node test-mcp.js` - Verify MCP server connections and agent functionality
- **Test expense classification**: `node test-expense-classification.js` - Test expense categorization and CSV parsing
- **Database file**: `personal_ai.db` - SQLite database created automatically on first run with campaign tables
- **Stop all processes**: `pkill -f "node server.js"` - Kill any running server instances
- **Check syntax**: `node -c server.js` - Validate server.js syntax without running

## Architecture

Campaign Infrastructure is a Node.js web application providing a specialized multi-agent AI interface optimized for congressional campaign operations, with privacy boundaries and role-based campaign functionality.

**Core Web Server** (`server.js`): Express.js application serving authentication, campaign agent interfaces, and comprehensive API endpoints. Handles session management with bcrypt authentication, routing for static files, and campaign-specific API calls. Integrates MCP (Model Context Protocol) clients with privacy filtering. Includes comprehensive expense tracking, bank reconciliation, Square payment integration, and FEC compliance systems.

**Campaign Agent System**: Four specialized AI agents with campaign-specific roles and data access:
- **Martin - Campaign Director**: Electoral strategy, voter outreach, resource allocation for NY-24 (campaign data access)
- **Terri - Private Strategy Advisor**: Confidential campaign strategy and candidate coaching (private conversations, strategic insights)
- **Eggsy - Creative/Content Director**: Social media strategy, messaging, creative campaigns for rural NY-24 voters (content data access)
- **Ethel - Legal/Compliance Director**: FEC compliance, campaign finance law, ethical guidelines (compliance data access, receives strategic shares from Terri)

**Database Architecture** (SQLite): Campaign-optimized data stores with privacy boundaries:
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

**Static Routes**:
- `GET /` - Redirects to dashboard if authenticated, login if not
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

**Documentation**:
- `TEAM-ONBOARDING.md` - Comprehensive team member training with role-based agent access
- `MCP-INTEGRATION.md` - Technical details for MCP server integration and testing

**Frontend Components** (`public/`):
- `dashboard.html` - Main campaign interface with agent switching and task management
- `terri.html` - Private strategy advisor interface with enhanced privacy
- Authentication pages with session management

**Testing Infrastructure**:
- `test-mcp.js` - MCP integration testing suite
- `test-expense-classification.js` - Financial tracking system testing with expense categorization examples
- `test-*.js` - Various component and agent-specific tests

**Legacy Components**:
- `archive/` - Original Google Calendar OAuth2 integration preserved for potential event management integration

## Critical Implementation Notes

**Agent Response Generation**: Each agent has specialized `generate[AgentName]Response()` functions in `server.js` that handle campaign-specific messaging, MCP integration, and privacy filtering. These functions determine agent personality and capabilities.

**MCP Integration Flow**: 
1. Agent receives user input
2. Privacy filter processes data based on agent role (strict/moderate/audit)
3. MCP client calls external structured thinking tools if available
4. Enhanced response combines agent personality with MCP insights
5. Audit logging tracks all MCP interactions for compliance

**Privacy Architecture**: 
- Terri's conversations are isolated in `terri_private` table
- Strategic sharing from Terri to Ethel creates audit trails without exposing details to Martin/Eggsy
- Campaign data access is role-based (team members see only relevant agent data)
- PII filtering automatically redacts sensitive information in MCP calls

**NY-24 Integration**: The `NY24_HELPERS` object provides district-specific functions for content relevance assessment, county-targeted messaging, and voter priority calculation that should be used throughout the campaign workflow.

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