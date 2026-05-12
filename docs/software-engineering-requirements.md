# Software Engineering Requirements Document

## Project

**Working name:** VC Intelligence & Startup Diligence Platform  
**Product type:** SaaS web application  
**Target region:** Malaysia and Southeast Asia  
**Primary stack:** React, Node.js, MySQL, LLM API  
**Document purpose:** This document is the implementation blueprint for building the MVP and later product versions.

## 1. Product Vision

The platform is an AI-assisted venture capital diligence, startup verification, and investor matching SaaS application for Malaysia and Southeast Asia.

The product helps entrepreneurs create investment-ready profiles and helps investors discover, evaluate, verify, and manage startup opportunities. The platform should not behave like a simple startup directory. It should work as a trust and diligence layer that improves the quality of deal flow for investors and improves fundraising readiness for entrepreneurs.

## 2. Core Product Goals

1. Allow entrepreneurs to create complete startup profiles and upload supporting documents.
2. Allow investors to create investment profiles, define preferences, and discover matching startups.
3. Allow admins to control platform settings, users, content, scoring rules, verification rules, and system access.
4. Use an LLM to extract structured data from startup documents and profile content.
5. Use an LLM to compare startup profiles with investor preferences and generate match reasoning.
6. Use deterministic backend logic for valuation formulas, scoring, permissions, and calculations.
7. Provide a clear dashboard experience for admins, investors, and entrepreneurs.
8. Generate AI-assisted diligence summaries, red flags, investor readiness scores, and investment memos.
9. Build an MVP that is practical without paid external market-data subscriptions.

## 3. Important Product Principle

The LLM should assist with analysis, extraction, matching, summarization, and explanation. It should not be treated as the only source of truth.

The application must separate:

- **Deterministic logic:** permissions, scoring formulas, valuation calculations, matching weights, workflow states.
- **LLM-assisted logic:** document extraction, profile summarization, thesis matching explanation, diligence memo generation, founder feedback.

The system should always show AI outputs as preliminary analysis requiring human review.

## 4. User Personas

## 4.1 Platform Admin

The admin is the highest authority in the system. Admin users control the platform, review activity, configure business rules, and manage all users.

Admin users can:

- Log in to the admin dashboard.
- View all entrepreneurs, investors, companies, documents, matches, reports, and system activity.
- Approve, suspend, or deactivate user accounts.
- Approve or reject investor organizations.
- Approve or reject startup visibility.
- Edit or remove inappropriate company or investor content.
- Configure startup scoring criteria.
- Configure investor matching weights.
- Configure valuation assumptions.
- Configure document requirements by startup stage.
- Configure sectors, countries, stages, funding types, and business model options.
- Review AI extraction results.
- Review AI-generated red flags.
- Override AI verification statuses.
- View all audit logs.
- View all LLM run logs.
- Manage system-wide announcements.
- Manage admin roles and permissions.
- Export data for internal analysis.

Admin dashboard must include:

- Platform activity overview.
- New users pending approval.
- Startups pending review.
- Investors pending approval.
- High-risk startups.
- Recently generated AI reports.
- Match activity summary.
- Document upload summary.
- System health indicators.
- LLM usage summary.

## 4.2 Entrepreneur / Founder

Entrepreneurs use the platform to create a startup profile, upload supporting documents, improve investor readiness, and match with relevant investors.

Entrepreneurs can:

- Register and log in.
- Create personal founder profile.
- Create or join a company profile.
- Add co-founders and team members.
- Complete a structured startup profile.
- Upload company documents.
- Enter financial metrics.
- Enter product and traction metrics.
- Enter fundraising information.
- View startup readiness score.
- View missing information checklist.
- View AI-generated improvement recommendations.
- View valuation reasonableness feedback.
- View matched investors.
- Submit profile for investor visibility.
- Respond to investor information requests.
- Update company profile over time.
- Track investor interest.

Entrepreneur dashboard must include:

- Profile completion status.
- Startup readiness score.
- Missing document checklist.
- Latest AI feedback.
- Fundraising summary.
- Matched investors.
- Investor views and interest count.
- Pending investor requests.
- Recent profile updates.
- Recommended next actions.

## 4.3 Investor

Investors use the platform to create investment profiles, define preferences, review matching startups, perform diligence, and manage a deal pipeline.

Investor users can:

- Register and log in.
- Create personal investor profile.
- Create or join an investor organization.
- Define investment preferences.
- View matched startups.
- Search and filter startup profiles.
- Review startup AI diligence summaries.
- Review startup claim verification.
- Review valuation reasonableness reports.
- Review red flags.
- Save startups to deal pipeline.
- Add internal notes.
- Assign deals to team members.
- Move deals through pipeline stages.
- Request more information from founders.
- Generate investment memos.
- Export or download memo content.
- Compare startups.
- Update investor thesis and matching preferences.

Investor dashboard must include:

- Deal pipeline overview.
- New matched startups.
- High-fit startup recommendations.
- Saved startups.
- Recently updated startups.
- Pending founder responses.
- Investment memo drafts.
- Sector and stage distribution.
- Match quality overview.
- Internal team activity.

## 4.4 Investor Organization Admin

An investor organization admin manages the team account for a VC firm, angel group, family office, accelerator, or corporate venture team.

Investor organization admins can:

- Manage organization profile.
- Invite team members.
- Assign roles inside the organization.
- Manage organization investment preferences.
- View team pipeline activity.
- Control visibility of internal notes.
- Configure default deal stages.
- Manage organization-level reports.

## 5. MVP Role Permissions

## 5.1 Admin Permissions

Admin has full platform access, including:

- Read and modify all users.
- Read and modify all companies.
- Read and modify all investor organizations.
- Read all documents and AI outputs.
- Change scoring configurations.
- Change matching configurations.
- Approve or remove content.
- View audit logs.

## 5.2 Entrepreneur Permissions

Entrepreneurs can:

- Read and update their own profile.
- Read and update companies they own or are assigned to.
- Upload documents for their own company.
- View AI feedback for their own company.
- View matched investors when company visibility is approved.
- Respond to investor requests.

Entrepreneurs cannot:

- View other startup private documents.
- View investor internal notes.
- Modify scoring or matching settings.
- Override AI verification statuses.
- Access admin dashboard.

## 5.3 Investor Permissions

Investors can:

- Read their own profile.
- Read their organization profile.
- View approved startup profiles.
- View startup diligence reports made available to investors.
- Save startups to their organization pipeline.
- Create internal notes.
- Generate memos.
- Request information from founders.

Investors cannot:

- Modify startup profiles.
- View private startup documents unless access is granted.
- View other investor organizations' notes.
- Modify platform scoring settings.
- Access admin dashboard.

## 6. MVP Feature Modules

## 6.1 Authentication Module

Required features:

- Email and password registration.
- Login and logout.
- Password hashing.
- JWT-based authentication.
- Refresh token support.
- Password reset flow.
- Email verification.
- Role-based access control.
- Admin account bootstrap.
- Account status: pending, active, suspended, deactivated.

Recommended backend services:

- AuthService
- UserService
- RoleService
- PermissionGuard

## 6.2 Admin Management Module

Required features:

- Admin dashboard.
- User management.
- Startup management.
- Investor management.
- Organization management.
- Document review.
- AI output review.
- Manual override tools.
- Configuration management.
- Audit log viewer.
- LLM usage viewer.

Admin configurable settings:

- Startup sectors.
- Startup stages.
- Business models.
- Countries and regions.
- Investor types.
- Funding stages.
- Document categories.
- Readiness scoring weights.
- Matching scoring weights.
- Valuation assumptions.
- Red flag rules.
- Profile visibility rules.

## 6.3 Entrepreneur Profile Module

Required founder fields:

- Full name.
- Email.
- Phone number.
- Country.
- City.
- LinkedIn URL.
- Role in company.
- Founder biography.
- Experience summary.
- Education.
- Previous companies.

Required company fields:

- Company name.
- Company description.
- Registration number.
- Country.
- City.
- Incorporation date.
- Sector.
- Business model.
- Startup stage.
- Product status.
- Website.
- Social links.
- Pitch summary.
- Problem statement.
- Solution.
- Target customers.
- Market geography.
- Competitive advantage.

Team fields:

- Founder names.
- Roles.
- Ownership percentages.
- Key hires.
- Advisors.
- Board members.

Traction fields:

- Customer count.
- Paying customer count.
- Monthly active users.
- Revenue status.
- Monthly recurring revenue.
- Annual recurring revenue.
- Total annual revenue.
- Revenue growth rate.
- Churn rate.
- Gross margin.
- Customer acquisition cost.
- Lifetime value.
- Key partnerships.

Fundraising fields:

- Amount raising.
- Currency.
- Claimed valuation.
- Instrument type: equity, SAFE, convertible note, grant, other.
- Previous funding.
- Existing investors.
- Use of funds.
- Runway.
- Cap table summary.

## 6.4 Investor Profile Module

Required investor fields:

- Investor name.
- Organization name.
- Investor type: VC, angel, family office, CVC, accelerator, government-linked fund, other.
- Country.
- City.
- Website.
- LinkedIn URL.
- Short thesis.
- Long investment thesis.
- Preferred sectors.
- Excluded sectors.
- Preferred stages.
- Preferred geographies.
- Minimum ticket size.
- Maximum ticket size.
- Preferred ownership target.
- Lead or follow preference.
- Business model preferences.
- Revenue requirements.
- Impact or ESG preference.
- Shariah-compliance preference, if relevant.
- Government-linked mandate, if relevant.
- Portfolio companies.

Investor settings:

- Visibility of investor profile.
- Whether founders can request introductions.
- Whether investor accepts inbound applications.
- Notification preferences.

## 6.5 Startup Data Room Module

Required features:

- Upload documents.
- Categorize documents.
- View uploaded documents.
- Replace documents.
- Delete documents if permitted.
- Mark documents as private.
- Grant document access to specific investors.
- Track document upload date.
- Track document extraction status.
- Track document review status.

MVP supported document types:

- PDF.
- DOCX.
- XLSX.
- CSV.
- PNG/JPG optional for later OCR.

Document categories:

- Pitch deck.
- Financial statement.
- Bank statement.
- Revenue report.
- Cap table.
- Customer contract.
- Grant letter.
- Company registration document.
- Investor update.
- Product screenshot.
- Other.

## 6.6 AI Extraction Module

Purpose:

Use the LLM to convert uploaded documents and profile descriptions into structured data.

Required features:

- Extract company summary from pitch deck.
- Extract team details.
- Extract market claims.
- Extract traction claims.
- Extract revenue claims.
- Extract fundraising ask.
- Extract claimed valuation.
- Extract missing information.
- Store raw extraction result.
- Store normalized extraction result.
- Show extraction confidence.
- Allow admin review and override.

LLM output must be structured JSON. The application must reject malformed AI responses and retry or flag for human review.

## 6.7 Claim Verification Module

Purpose:

Identify claims made by founders and compare them with uploaded evidence.

Claim categories:

- Revenue.
- Profit.
- Customer count.
- User count.
- Growth rate.
- Valuation.
- Market size.
- Partnerships.
- Investors.
- Grants.
- Regional expansion.
- Product status.
- Intellectual property.

Verification statuses:

- Verified.
- Partially verified.
- Unsupported.
- Contradicted.
- Needs human review.

Required output per claim:

- Claim text.
- Claim category.
- Claimed value.
- Evidence source.
- Verification status.
- Confidence score.
- Explanation.
- Recommended investor question.
- Severity.

## 6.8 Valuation Reasonableness Module

Purpose:

Determine whether the startup's claimed valuation is reasonable based on structured inputs and transparent assumptions.

MVP valuation methods:

- Scorecard Method.
- Berkus Method.
- Risk Factor Summation.
- Revenue Multiple Method.
- VC Method.
- SAFE/Dilution Calculator.

Required outputs:

- Claimed valuation.
- Suggested lower valuation range.
- Suggested upper valuation range.
- Currency.
- Method used.
- Assumptions used.
- Confidence level.
- Reasonableness status.
- Explanation.
- Missing valuation inputs.

Reasonableness statuses:

- Reasonable.
- Slightly high.
- Aggressive.
- Unsupported.
- Insufficient data.

Important rule:

The LLM can explain valuation outputs, but formulas must run inside backend code.

## 6.9 Startup Readiness Score Module

Purpose:

Score how ready a startup is for investor review.

Scoring categories:

- Profile completeness.
- Document completeness.
- Team strength.
- Business clarity.
- Traction quality.
- Financial readiness.
- Valuation reasonableness.
- Governance readiness.
- Market opportunity.
- Investor fit.
- Risk profile.

Readiness labels:

- Not ready.
- Grant ready.
- Accelerator ready.
- Angel ready.
- VC ready.
- Growth investor ready.

Required output:

- Overall score from 0 to 100.
- Category scores.
- Readiness label.
- Key strengths.
- Key weaknesses.
- Recommended next actions.

## 6.10 AI Investor Matching Module

Purpose:

Match startups and investors using deterministic filters plus LLM-assisted thesis comparison.

Matching must support both sides:

- Investors receive matched startups.
- Entrepreneurs receive matched investors.

Matching inputs from startup:

- Sector.
- Stage.
- Geography.
- Business model.
- Revenue.
- Traction.
- Fundraising amount.
- Claimed valuation.
- Risk level.
- Readiness score.
- Expansion plans.
- Description.

Matching inputs from investor:

- Preferred sectors.
- Preferred stages.
- Preferred geographies.
- Ticket size range.
- Revenue requirements.
- Thesis text.
- Risk preference.
- Impact preference.
- Excluded sectors.
- Lead/follow preference.

Deterministic match matrix:

| Factor | Weight |
| --- | ---: |
| Sector fit | 20 |
| Stage fit | 15 |
| Geography fit | 10 |
| Ticket size fit | 15 |
| Business model fit | 10 |
| Traction/revenue fit | 10 |
| Valuation fit | 10 |
| Mandate fit | 5 |
| LLM thesis similarity | 5 |

Total score: 100.

LLM thesis similarity:

The LLM receives a startup summary and investor thesis and returns:

- Similarity score from 0 to 100.
- Reasons for fit.
- Reasons against fit.
- Suggested conversation angle.

Required match output:

- Match score.
- Fit level: low, medium, high, excellent.
- Matched criteria.
- Missing or weak criteria.
- AI explanation.
- Recommended next action.

## 6.11 VC Deal Pipeline Module

Purpose:

Allow investors to manage startup opportunities like a lightweight CRM.

Pipeline stages:

- New.
- Screening.
- Interested.
- Diligence.
- Partner review.
- Investment committee.
- Term sheet.
- Invested.
- Rejected.
- Archived.

Required features:

- Save startup to pipeline.
- Assign team owner.
- Add notes.
- Add rating.
- Add next action date.
- Move between stages.
- Request more information.
- Generate memo.
- Record rejection reason.
- View pipeline dashboard.

## 6.12 AI Investment Memo Module

Purpose:

Generate VC-style screening and investment committee memos.

Memo sections:

- Executive summary.
- Company overview.
- Founder/team summary.
- Problem.
- Solution.
- Market opportunity.
- Product.
- Business model.
- Traction.
- Financial summary.
- Fundraising ask.
- Valuation analysis.
- Investor fit.
- Verification summary.
- Key strengths.
- Key risks.
- Missing diligence items.
- Recommended questions.
- Final neutral analyst summary.

Memo rules:

- Separate verified facts from assumptions.
- Mention missing evidence clearly.
- Avoid investment advice language.
- Use neutral, professional tone.
- Store generated memo in database.

## 6.13 Red Flag Detection Module

Purpose:

Highlight potential risks for founders, investors, and admins.

Red flag examples:

- Claimed valuation unsupported by traction.
- Revenue mismatch between documents.
- No financial documents.
- No cap table.
- Excessive founder dilution.
- Short runway.
- High burn rate.
- Customer concentration risk.
- One-time revenue presented as recurring revenue.
- Unrealistic market size claim.
- Missing incorporation evidence.
- Inconsistent founder information.
- Overreliance on grants.
- No clear use of funds.
- Regional expansion claim without evidence.

Required output:

- Red flag category.
- Severity: low, medium, high, critical.
- Explanation.
- Evidence source.
- Recommended question.
- Visibility: founder, investor, admin.

## 6.14 Messaging and Request Module

MVP should include a simple request workflow rather than full chat.

Required features:

- Investor can request more information.
- Founder can respond.
- Founder can upload requested documents.
- Investor can mark request as resolved.
- Admin can view request activity if needed.

Request statuses:

- Open.
- Waiting for founder.
- Waiting for investor.
- Resolved.
- Closed.

## 6.15 Notification Module

Required MVP notifications:

- Account approved.
- Startup profile approved.
- New investor match.
- New startup match.
- Investor requested information.
- Founder responded to request.
- AI analysis completed.
- Admin review required.

Notification channels:

- In-app notifications for MVP.
- Email notifications can be added if SMTP is configured.

## 6.16 Audit Log Module

Purpose:

Track important events for trust and governance.

Logged events:

- Login.
- User created.
- Profile updated.
- Document uploaded.
- Document deleted.
- AI extraction run.
- Claim verification run.
- Valuation run.
- Match generated.
- Memo generated.
- Admin approval.
- Admin override.
- Deal stage changed.
- Request created.

Audit log fields:

- User ID.
- Organization ID.
- Entity type.
- Entity ID.
- Action.
- Previous value, if relevant.
- New value, if relevant.
- Timestamp.
- IP address, if available.

## 7. Dashboards

## 7.1 Admin Dashboard

Widgets:

- Total users.
- Total entrepreneurs.
- Total investors.
- Total startups.
- Pending approvals.
- High-risk startups.
- AI reports generated.
- Documents uploaded.
- New matches generated.
- Active investor organizations.
- Latest audit events.

Pages:

- User management.
- Startup management.
- Investor management.
- Organization management.
- AI review.
- Scoring configuration.
- Matching configuration.
- Valuation configuration.
- Audit logs.
- System settings.

## 7.2 Entrepreneur Dashboard

Widgets:

- Profile completion.
- Investor readiness score.
- Missing documents.
- Valuation feedback.
- Matched investors.
- Investor interest.
- Information requests.
- Recent AI recommendations.

Pages:

- Founder profile.
- Company profile.
- Team.
- Metrics.
- Fundraising.
- Data room.
- AI feedback.
- Matched investors.
- Investor requests.

## 7.3 Investor Dashboard

Widgets:

- New matched startups.
- High-fit startups.
- Saved startups.
- Pipeline by stage.
- Pending diligence requests.
- Recently generated memos.
- Sector distribution.
- Stage distribution.

Pages:

- Investor profile.
- Organization profile.
- Matching preferences.
- Startup discovery.
- Startup detail.
- Deal pipeline.
- Investment memos.
- Internal notes.
- Requests.

## 8. Technical Architecture

## 8.1 Recommended Stack

Frontend:

- React.
- TypeScript.
- Vite.
- Tailwind CSS.
- shadcn/ui or equivalent component library.
- React Query.
- React Hook Form.
- Zod validation.

Backend:

- Node.js.
- TypeScript.
- NestJS preferred for structure.
- Prisma ORM.
- MySQL.
- JWT authentication.
- Bcrypt password hashing.
- Background job worker.

AI:

- LLM API.
- JSON-based structured outputs.
- Prompt templates stored in backend.
- LLM run logs stored in MySQL.

Storage:

- Local file storage for development.
- S3-compatible object storage later.

## 8.2 High-Level System Flow

```text
React Frontend
  -> Node.js API
  -> MySQL Database
  -> Document Storage
  -> Background Worker
  -> LLM API
  -> MySQL AI Results
  -> Dashboards
```

## 8.3 Backend Services

Recommended service modules:

- AuthService.
- UserService.
- OrganizationService.
- FounderProfileService.
- InvestorProfileService.
- CompanyService.
- DocumentService.
- DocumentExtractionService.
- ClaimVerificationService.
- ValuationService.
- ReadinessScoreService.
- MatchingService.
- DealPipelineService.
- MemoService.
- NotificationService.
- AdminService.
- AuditLogService.
- LlmService.

## 9. Database Model

Core tables:

- users.
- roles.
- permissions.
- organizations.
- organization_members.
- founder_profiles.
- investor_profiles.
- companies.
- company_members.
- company_metrics.
- fundraising_rounds.
- documents.
- document_extractions.
- claims.
- claim_evidence.
- valuation_runs.
- readiness_scores.
- red_flags.
- investor_preferences.
- matches.
- deal_pipeline_items.
- deal_notes.
- information_requests.
- investment_memos.
- notifications.
- admin_reviews.
- audit_logs.
- llm_runs.
- platform_settings.

## 10. API Requirements

API groups:

- /auth
- /admin/users
- /admin/companies
- /admin/investors
- /admin/settings
- /founder/profile
- /companies
- /companies/:id/documents
- /companies/:id/metrics
- /companies/:id/readiness
- /companies/:id/valuation
- /companies/:id/claims
- /investor/profile
- /investor/preferences
- /matches
- /pipeline
- /memos
- /requests
- /notifications

All API endpoints must enforce role-based permissions.

## 11. AI Requirements

## 11.1 LLM Tasks

The LLM will be used for:

- Pitch deck extraction.
- Financial document summarization.
- Claim identification.
- Evidence comparison.
- Red flag explanation.
- Founder recommendation generation.
- Investor thesis similarity.
- Match explanation.
- Investment memo generation.

## 11.2 LLM Safety Rules

The system must:

- Treat uploaded document text as untrusted.
- Never allow document text to override system prompts.
- Require JSON output for extraction tasks.
- Validate AI responses before saving important fields.
- Store LLM prompts, outputs, model name, and timestamp.
- Allow admin review and override.
- Avoid presenting AI output as final investment advice.

## 12. Security Requirements

Required:

- Password hashing with bcrypt.
- JWT access tokens.
- Refresh token rotation.
- Role-based authorization.
- Organization-level data isolation.
- File access permissions.
- Input validation.
- ORM-based database access.
- Audit logging.
- Rate limiting.
- Secure document URLs.
- Admin-only settings access.
- LLM prompt injection protection.

## 13. MVP Scope

## 13.1 Must Have in MVP

- Authentication.
- Admin dashboard.
- Entrepreneur dashboard.
- Investor dashboard.
- User and organization management.
- Startup profile creation.
- Investor profile creation.
- Document upload.
- LLM document extraction.
- Claim verification.
- Startup readiness score.
- Valuation reasonableness.
- Investor-startup matching.
- Deal pipeline.
- Investment memo generation.
- Red flag detection.
- Information request workflow.
- Audit logs.
- Platform settings controlled by admin.

## 13.2 Not Required in MVP

- Paid market-data integrations.
- Bank API integrations.
- Accounting software integrations.
- Real-time chat.
- Payment processing.
- Mobile app.
- Advanced custom machine learning model.
- Automated legal compliance decisioning.
- Public startup marketplace.

## 14. Build Phases

## Phase 1: Project Foundation

- Create React app.
- Create Node.js backend.
- Configure MySQL.
- Add Prisma schema.
- Add authentication.
- Add roles and permissions.
- Add base layouts for admin, founder, and investor.

## Phase 2: Core Profiles

- Build founder profile.
- Build company profile.
- Build investor profile.
- Build organization profile.
- Build admin user management.

## Phase 3: Documents and AI Extraction

- Add document upload.
- Extract text from documents.
- Send extracted text to LLM.
- Store structured extraction results.
- Display extraction results.

## Phase 4: Diligence and Scoring

- Add claim detection.
- Add claim verification.
- Add red flag detection.
- Add readiness scoring.
- Add admin review and overrides.

## Phase 5: Valuation Engine

- Add Scorecard Method.
- Add Berkus Method.
- Add Risk Factor Summation.
- Add Revenue Multiple Method.
- Add VC Method.
- Add SAFE/Dilution Calculator.
- Add valuation report UI.

## Phase 6: Matching and Investor Workflow

- Add investor preference settings.
- Add deterministic matching matrix.
- Add LLM thesis similarity.
- Add match explanation.
- Add matched investor/startup pages.
- Add deal pipeline.

## Phase 7: Memos and Requests

- Add investment memo generation.
- Add information request workflow.
- Add notes.
- Add notifications.

## Phase 8: Admin Control and Hardening

- Add platform settings pages.
- Add audit log viewer.
- Add LLM run viewer.
- Add security review.
- Add seed data.
- Add tests.

## 15. Success Criteria

The MVP is successful when:

- An entrepreneur can create a company profile and upload documents.
- An investor can create a profile and define investment preferences.
- Admin can manage all users, startups, investors, settings, and AI outputs.
- The system can extract startup information from uploaded documents using an LLM.
- The system can generate a readiness score and red flags.
- The system can estimate valuation reasonableness using backend formulas.
- The system can match startups and investors using a scoring matrix plus LLM thesis comparison.
- Investors can save startups to a pipeline and generate investment memos.
- Entrepreneurs can see matched investors and improvement recommendations.

## 16. Later Features

Post-MVP features:

- Portfolio monitoring.
- LP reporting dashboard.
- Email notifications.
- Advanced analytics.
- Founder education modules.
- Accelerator cohort management.
- Co-investor sharing.
- Secure investor data room access controls.
- Public application forms for VC firms.
- Integrations with email, calendar, accounting, banking, or CRM tools.

## 17. Implementation Notes for Future Coding

When coding starts, use this document as the source of truth. The first implementation should prioritize a functional MVP over complex enterprise polish.

Recommended initial codebase shape:

```text
apps/
  web/
  api/
packages/
  shared/
docs/
  software-engineering-requirements.md
```

Recommended first milestone:

Build authentication, role-based dashboards, company profiles, investor profiles, document upload, and admin controls before building advanced AI features.

The AI features should be added behind backend service abstractions so the LLM provider can be changed later without rewriting the application.
