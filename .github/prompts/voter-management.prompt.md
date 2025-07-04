---
mode: agent
tools: [edit_file, read_file, run_in_terminal, search_workspace, mcp.campaign-intelligence.analyze_voter_demographics, mcp.campaign-intelligence.query_campaign_database, mcp.campaign-intelligence.mobile_optimization_check]
---

# Voter Management Feature Development
## Campaign-Specific Voter Database Enhancement

Implement voter management features for NY-24 Congressional Campaign field operations with mobile-first design and rural voter considerations.

### FEATURE REQUIREMENTS

**Target Users**: Field staff, volunteers, campaign coordinators
**Use Cases**: Door-to-door canvassing, phone banking, voter registration drives
**Priority**: HIGH - Critical for 2026 election ground game

### IMPLEMENTATION CHECKLIST

**Step 1: Analyze Current Voter Data Structure**
- Read existing voter database schema from `database.js`
- Check `campaign_voters` table structure and capabilities
- Review NY-24 district data integration points

**Step 2: Mobile Interface Design**
- Create touch-friendly voter lookup forms
- Implement quick search by phone, email, or address
- Design offline-capable data entry for poor rural connectivity
- Add voter support level tracking (Strong Support/Lean Support/Undecided/Oppose)

**Step 3: Database Enhancement**
- Add voter contact history tracking
- Implement county-specific voter categorization
- Create voter engagement scoring system
- Add data validation for voter information

**Step 4: Field Operation Integration**
- Create canvassing interface with GPS integration
- Add photo capability for voter notes/documentation
- Implement volunteer assignment tracking
- Design real-time voter contact reporting

### CAMPAIGN-SPECIFIC REQUIREMENTS

**NY-24 District Integration**:
- County-specific voter strategies (Oswego agricultural, Cayuga rural/suburban, Onondaga urban)
- Rural voter messaging preferences
- Local issue tracking (agricultural policy, infrastructure, economic development)

**Mobile Field Operations**:
- Offline capability for areas with poor cell coverage
- Large touch targets for use with gloves in winter
- Quick data entry for door-to-door efficiency
- Battery-efficient design for long canvassing sessions

**Data Privacy & Security**:
- Voter data encryption and secure storage
- Role-based access (volunteers see limited data)
- Audit trail for voter contact attempts
- Compliance with voter privacy regulations

### EXPECTED DELIVERABLES

1. **Enhanced voter database schema** with campaign-specific fields
2. **Mobile-responsive voter lookup interface** for field staff
3. **Canvassing tools** with offline capability and GPS integration
4. **Voter engagement tracking system** with support level management
5. **Reporting dashboard** for campaign managers to track voter outreach progress

### TECHNICAL SPECIFICATIONS

**Database Updates**:
- Add voter_contacts table for interaction history
- Include county-specific data fields
- Implement voter_engagement_score calculation
- Add mobile_optimized flags for interface preferences

**API Endpoints**:
- `/api/voters/quick-search` - Fast voter lookup for field operations
- `/api/voters/contact-log` - Record voter interactions
- `/api/voters/county-analysis` - County-specific voter data
- `/api/canvassing/route-optimizer` - Efficient door-to-door routing

**Mobile Interface Features**:
- Progressive web app capabilities
- Touch-optimized form controls
- Offline data synchronization
- GPS-based voter address verification

**Testing Requirements**:
- Field testing with actual volunteers
- Rural connectivity simulation
- Cross-device compatibility validation
- Performance testing on older mobile devices

### SUCCESS METRICS

- **Voter Contact Efficiency**: 50% faster data entry compared to paper forms
- **Data Quality**: 95% accurate voter information with validation
- **Mobile Usage**: 80% of voter contacts logged via mobile interface
- **Field Adoption**: 90% volunteer satisfaction with mobile tools
- **Rural Performance**: Functional operation with 2G connectivity

Execute this voter management enhancement with electoral urgency! Every voter contact system improvement directly impacts our 2026 ground game effectiveness!