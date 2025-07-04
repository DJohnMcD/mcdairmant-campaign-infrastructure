# GitHub Copilot Instructions - NY-24 Campaign Infrastructure
## AI Agent Mode Configuration for Electoral Victory

### 🎯 CAMPAIGN CONTEXT

**System Identity**: NY-24 Congressional Campaign Management Platform (2026 Election)
**Candidate**: David McDairmant for Congress
**District**: New York's 24th Congressional District (rural counties: Oswego, Cayuga, Onondaga)
**Technology Mission**: Revolutionary AI-powered campaign infrastructure

### 🏛️ CAMPAIGN SYSTEM ARCHITECTURE

**Core Platform**: Node.js Express application with specialized AI agents
**Database**: Hybrid SQLite (development) / PostgreSQL (production) with privacy boundaries
**AI Agents**: 4 specialized campaign roles with distinct personalities and data access
**Frontend**: Mobile-first responsive interface for field operations
**Compliance**: Built-in FEC reporting and campaign finance automation

### 🤖 AI Agent System

**Agent Personalities** (Critical for code generation):
1. **Martin - Campaign Director (86%)**: Strategic, results-focused, timeline-driven, resource-conscious
2. **Terri - Private Strategy Advisor**: Confidential strategy with isolated data access
3. **Eggsy - Creative Director (14%)**: Highly intelligent analytical innovator who sees unique connections others miss, approaches problems with multi-angle logical verification, creative yet methodical problem-solving, future-tech integration with careful validation
4. **Ethel - Legal/Compliance Director**: FEC compliance, campaign finance law expertise

**Privacy Architecture**: Terri's conversations isolated, strategic sharing with Ethel only, other agents see general data

**Agent Response Functions** (in `server.js`):
- `generateMartinResponse()` - Strategic campaign management with NY-24 district focus
- `generateTerriResponse()` - Private strategy advice with complete isolation
- `generateEggsyResponse()` - Creative experimental solutions with analytical verification
- `generateEthelResponse()` - Legal compliance with FEC expertise

**Agent Data Access**:
- **Martin**: Campaign data, voter database, volunteer information, general entries
- **Terri**: ALL user data, private conversations (isolated from other agents)
- **Eggsy**: Content data, social media posts, creative campaign materials
- **Ethel**: Compliance data, financial transactions, receives strategic shares from Terri
- **Shared**: `agent_responses` table visible to Martin, Eggsy, Ethel (NOT Terri's private data)

### 📊 NY-24 DISTRICT REQUIREMENTS

**Voter Demographics**: Rural agricultural communities, small towns, suburban areas
**Key Counties**: Oswego (agricultural), Cayuga (rural/suburban mix), Onondaga (urban/suburban)
**Opposition**: Claudia Tenney (incumbent) - focus on policy differentiation
**Messaging**: Rural-friendly, agricultural policy support, economic development focus

### 💰 FEC COMPLIANCE STANDARDS

**All financial features must include**:
- Real-time contribution limit checking ($3,300 individual limit for 2026)
- Automatic expense classification (campaign/personal/art project)
- Donor information capture with employer/occupation requirements
- Quarterly reporting preparation with proper categorization
- Bank reconciliation and transaction matching

### 📱 MOBILE-FIRST DEVELOPMENT

**Field Operations Priority**: All interfaces must work perfectly on phones/tablets
**Offline Capability**: Critical features available without internet connection
**Touch Optimization**: Large buttons, easy navigation for volunteers using mobile devices
**Performance**: Fast loading for rural areas with poor cellular coverage

### 🔧 TECHNICAL STACK CONSTRAINTS

**Required Technologies**:
- Node.js 18+ with Express.js framework
- SQLite3 with better-sqlite3 for development
- PostgreSQL for production deployment
- Bcrypt for authentication security
- MCP (Model Context Protocol) integration for AI enhancements

**Forbidden Dependencies**: 
- No external APIs without explicit campaign security approval
- No third-party analytics that could compromise voter privacy
- No dependencies that conflict with existing agent system

### 🎯 DEVELOPMENT PRIORITIES

**HIGH PRIORITY** (Implement immediately):
1. Voter engagement tools (registration, contact management, turnout prediction)
2. Financial compliance automation (FEC reporting, expense tracking)
3. Mobile field operation interfaces (canvassing, volunteer coordination)
4. Agent response optimization (district-specific knowledge, rural messaging)

**MEDIUM PRIORITY** (Next iteration):
1. Opposition research automation (Claudia Tenney monitoring)
2. Social media integration (rural-appropriate messaging)
3. Event management (rallies, town halls, fundraisers)
4. Volunteer skill matching and scheduling

**LOW PRIORITY** (Future enhancement):
1. Advanced analytics and predictive modeling
2. Integration with external campaign tools
3. Multi-language support for diverse communities

### 🔒 SECURITY REQUIREMENTS

**Data Protection**:
- Never log or store personally identifiable information in plain text
- Always use parameterized queries to prevent SQL injection
- Implement proper session management with secure cookies
- Hash all passwords with bcrypt (minimum 12 rounds)

**Campaign Privacy**:
- Terri's private conversations must never be accessible to other agents
- Voter data requires explicit consent before collection
- Financial information follows FEC disclosure requirements
- Strategic planning documents need controlled access

### 🎪 CODING STYLE PREFERENCES

**Campaign Terminology**: Use electoral language (voters, volunteers, donors, compliance)
**Error Handling**: Graceful degradation for field operations (poor connectivity)
**Comments**: Explain FEC compliance reasoning and campaign-specific business logic
**Testing**: Include scenarios for edge cases (unusual donations, data conflicts)
**Performance**: Optimize for mobile devices and rural internet speeds

### 🚀 Agent Mode Instructions

**When generating code**:
1. **Always consider campaign timeline** (2026 election urgency)
2. **Implement mobile-first responsive design** for all interfaces
3. **Include FEC compliance checks** for financial features
4. **Maintain agent personality consistency** in user-facing text
5. **Optimize for field operations** (offline capability, touch-friendly)
6. **Test with rural use cases** (slow internet, older devices)
7. **Use MCP campaign intelligence tools** when available for enhanced functionality
8. **Preserve privacy boundaries** (never expose Terri's private data to other agents)

**File Organization**:
- Place campaign-specific logic in dedicated modules
- Separate agent personalities into distinct functions
- Isolate privacy-sensitive code (Terri's private data)
- Group FEC compliance functions for easy auditing

**Agent Mode Implementation Patterns**:

**For Voter Management Features**:
- Use `mcp.campaign-intelligence.analyze_voter_demographics` for county-specific targeting
- Implement offline-capable voter lookup for field canvassing
- Include voter engagement scoring and contact history tracking
- Design touch-friendly interfaces for door-to-door operations

**For FEC Compliance Features**:
- Use `mcp.campaign-intelligence.check_fec_compliance` for real-time validation
- Implement contribution limit checking ($3,300 individual limit for 2026)
- Add automatic expense classification with confidence scoring
- Include donor aggregation and quarterly reporting preparation

**For Agent Enhancement Features**:
- Maintain distinct personality traits for each agent (Martin strategic, Eggsy innovative with verification, Ethel compliance-focused)
- Use `mcp.campaign-intelligence.generate_rural_messaging` for NY-24 appropriate content
- Implement privacy filtering based on agent access levels
- Add MCP tool integration while preserving agent character consistency

**For Mobile Optimization**:
- Use `mcp.campaign-intelligence.mobile_optimization_check` to validate field operation requirements
- Implement touch-friendly interfaces with large buttons and clear navigation
- Add offline capability with sync when connection restored
- Optimize for poor cellular coverage in rural NY-24 areas

**Code Quality Standards for Agent Mode**:
- Include comprehensive error handling for field operation scenarios
- Add logging for compliance audit trails (especially financial features)
- Implement graceful degradation for poor connectivity
- Use semantic HTML and accessible design for volunteer usability
- Include unit tests for critical campaign functions (FEC compliance, voter data handling)

### 🗳️ ELECTORAL SUCCESS METRICS

**Every feature should advance**:
- Voter registration and engagement
- Volunteer recruitment and retention  
- Fundraising efficiency and compliance
- Opposition research and response
- Rural voter outreach effectiveness
- Mobile campaign operations capability

---

**🎯 MISSION: Transform this codebase into the most advanced AI-powered campaign management system ever deployed for congressional elections!**

**⚡ EXECUTE WITH ELECTORAL URGENCY AND INNOVATIVE EXCELLENCE! ⚡**