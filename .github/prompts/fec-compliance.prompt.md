---
mode: agent
tools: [edit_file, read_file, run_in_terminal, search_workspace, mcp.campaign-intelligence.check_fec_compliance, mcp.campaign-intelligence.query_campaign_database]
---

# FEC Compliance Automation
## Campaign Finance Legal Compliance System

Implement automated FEC compliance checking and reporting for NY-24 Congressional Campaign with real-time validation and mobile expense tracking.

### COMPLIANCE REQUIREMENTS

**Legal Framework**: Federal Election Campaign Act (FECA) and FEC regulations
**Reporting Deadlines**: Quarterly reports, pre-election reports, post-election reports
**Individual Contribution Limits**: $3,300 per election (2026 cycle)
**Disclosure Thresholds**: $200 for itemized contributor information

### IMPLEMENTATION CHECKLIST

**Step 1: Real-Time Contribution Validation**
- Create contribution limit checking system ($3,300 individual limit)
- Implement aggregate donor tracking across election cycle
- Add occupation and employer validation for contributions over $200
- Design prohibited contribution detection (corporate, foreign)

**Step 2: Automated Expense Classification**
- Enhance existing `classifyExpense()` function with FEC categories
- Create campaign vs. personal vs. art project classification logic
- Implement expense documentation requirements
- Add vendor information validation and storage

**Step 3: Reporting Automation**
- Generate FEC-compliant CSV export formats
- Create Schedule A (receipts) and Schedule B (disbursements) templates
- Implement quarterly reporting deadline reminders
- Add report validation and error checking

**Step 4: Mobile Compliance Interface**
- Design field-friendly expense entry forms
- Create quick compliance status dashboard
- Implement photo receipt capture and storage
- Add real-time compliance warnings for field staff

### CAMPAIGN-SPECIFIC REQUIREMENTS

**Multi-Source Transaction Handling**:
- Bank statement reconciliation with FEC categorization
- Square payment processor integration with donor capture
- Cash receipt tracking for small donor events
- Check and money order processing workflows

**Art Project Expense Classification**:
- Special handling for candidate's art-related expenses
- Clear separation from campaign expenses
- Documentation requirements for personal vs. campaign art supplies
- Audit trail for unusual expense classifications

**Rural Campaign Considerations**:
- Cash donation handling at agricultural events
- Small-dollar fundraising at county fairs
- Volunteer expense reimbursement tracking
- Local vendor payment processing

### EXPECTED DELIVERABLES

1. **Real-time compliance checking system** with instant validation
2. **Automated FEC report generation** with Schedule A/B formatting
3. **Mobile expense tracking interface** with photo receipt capture
4. **Donor aggregation system** with contribution limit monitoring
5. **Compliance dashboard** with deadline tracking and status alerts

### TECHNICAL SPECIFICATIONS

**Database Enhancements**:
- Expand `campaign_expenses` table with FEC-specific fields
- Add `fec_reporting_periods` table for deadline tracking
- Implement `donor_aggregation` views for contribution limits
- Create `compliance_audit_log` for change tracking

**API Endpoints**:
- `/api/compliance/validate-contribution` - Real-time contribution checking
- `/api/compliance/classify-expense` - Automated expense categorization
- `/api/compliance/generate-report` - FEC report generation
- `/api/compliance/upload-receipt` - Mobile photo receipt processing

**Compliance Functions**:
- `validateContributionLimits()` - Check individual and aggregate limits
- `classifyExpenseForFEC()` - Categorize expenses with confidence scoring
- `generateScheduleA()` - Create receipts report in FEC format
- `generateScheduleB()` - Create disbursements report in FEC format

**Mobile Interface Features**:
- Touch-optimized expense entry forms
- Photo receipt capture with OCR processing
- Offline expense queue with sync capability
- Real-time compliance status indicators

### LEGAL COMPLIANCE CHECKLIST

**Contribution Compliance**:
- ✅ Individual contribution limits enforced ($3,300)
- ✅ Aggregate donor tracking across election cycle
- ✅ Occupation/employer capture for $200+ contributions
- ✅ Prohibited contribution detection and rejection
- ✅ Corporate and foreign contribution blocking

**Expense Compliance**:
- ✅ Campaign purpose documentation requirements
- ✅ Vendor information validation and storage
- ✅ Personal use prohibition enforcement
- ✅ Receipt retention and digital archival
- ✅ FEC expense category mapping

**Reporting Compliance**:
- ✅ Quarterly reporting deadline automation
- ✅ Schedule A/B format validation
- ✅ Electronic filing preparation
- ✅ Amendment filing capability
- ✅ Audit trail maintenance

### SUCCESS METRICS

- **Compliance Accuracy**: 99.5% error-free FEC reports
- **Processing Speed**: Real-time validation under 500ms
- **Mobile Usage**: 75% of expenses logged via mobile interface
- **Audit Readiness**: Complete documentation for all transactions
- **Deadline Performance**: 100% on-time FEC report filing

### CRITICAL IMPLEMENTATION NOTES

**Security Requirements**:
- Encrypt all financial data at rest and in transit
- Implement role-based access to financial information
- Maintain complete audit trails for all transactions
- Regular security audits of financial data handling

**Error Prevention**:
- Multiple validation layers for all financial data
- Human review requirements for high-value transactions
- Automated backup systems for financial records
- Regular data integrity checks and reconciliation

Execute this FEC compliance system with legal precision! Campaign finance violations can end electoral campaigns - this system protects our 2026 victory through bulletproof compliance automation!