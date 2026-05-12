# Full Development Phase Plan

## Project

**Working name:** VC Intelligence & Startup Diligence Platform  
**Product type:** SaaS web application  
**Stack:** React, Node.js, TypeScript, NestJS, Prisma, MySQL, BullMQ, Redis, LLM API  
**Related documents:**

- `docs/software-engineering-requirements.md`
- `docs/backend-development-plan.md`
- `docs/frontend-development-plan.md`

## 1. Purpose

This document defines the full development plan for building the MVP in phases. Each phase includes:

- Backend development module.
- Frontend development module.
- Testing and QA module.
- Acceptance criteria.
- Dependencies and notes.

The goal is to build the software in working vertical slices, so each phase produces a testable product improvement rather than disconnected backend or frontend work.

## 2. Development Strategy

The MVP should be built in **10 phases**.

The order is intentional:

1. Build the technical foundation.
2. Build authentication and role control.
3. Build profile and organization management.
4. Build startup/company workflows.
5. Build document and data room workflows.
6. Build AI extraction and diligence.
7. Build valuation and readiness.
8. Build investor matching.
9. Build investor workflow tools.
10. Build admin settings, hardening, and release readiness.

Each phase must end with working frontend screens connected to backend APIs, even if some advanced features are stubbed or basic at first.

## 3. Phase Overview

| Phase | Name | Main Outcome |
| --- | --- | --- |
| 1 | Foundation and Project Setup | Monorepo, backend, frontend, database, health checks, base UI |
| 2 | Authentication and Role Access | Login/register, JWT auth, role routing, protected dashboards |
| 3 | Admin, User, and Organization Base | Admin control, user management, investor organizations |
| 4 | Founder, Investor, and Company Profiles | Complete profile creation for founders, investors, and startups |
| 5 | Startup Submission and Admin Review | Founder submits company, admin approves, investor sees approved startups |
| 6 | Documents and Data Room | Upload documents, manage visibility, process document jobs |
| 7 | AI Extraction, Claims, and Red Flags | LLM document extraction, claim detection, verification, red flags |
| 8 | Valuation and Readiness | Valuation formulas, SAFE calculator, readiness scoring |
| 9 | Investor Matching and Discovery | Matching matrix, LLM thesis fit, founder/investor match pages |
| 10 | Pipeline, Memos, Requests, Notifications, and Release Hardening | Deal CRM, memos, requests, notifications, settings, tests, release QA |

## 4. Phase 1: Foundation and Project Setup

## 4.1 Goal

Create the base application structure and prove that the frontend, backend, database, and local development environment can run together.

## 4.2 Backend Development Module

Build:

- Monorepo structure.
- NestJS backend app.
- Environment configuration.
- Prisma setup.
- MySQL connection.
- Health module.
- Base error response format.
- Global validation pipe.
- Global exception filter.
- Basic logging.
- Initial Prisma schema shell.
- Seed script skeleton.

Backend APIs:

- `GET /api/v1/health`
- `GET /api/v1/health/db`
- `GET /api/v1/health/redis`

Backend files/modules:

- `apps/api/src/main.ts`
- `apps/api/src/app.module.ts`
- `apps/api/src/config`
- `apps/api/src/health`
- `apps/api/src/prisma`
- `apps/api/prisma/schema.prisma`
- `apps/api/prisma/seed.ts`

## 4.3 Frontend Development Module

Build:

- Vite React TypeScript app.
- Tailwind CSS setup.
- shadcn/ui setup.
- React Router setup.
- React Query setup.
- API client wrapper.
- Basic public entry page.
- Base error/loading/empty components.
- Base app shell placeholder.

Frontend routes:

- `/`
- `/login`
- `/register`

Frontend files/modules:

- `apps/web/src/main.tsx`
- `apps/web/src/app/App.tsx`
- `apps/web/src/app/router.tsx`
- `apps/web/src/app/providers.tsx`
- `apps/web/src/lib/api-client.ts`
- `apps/web/src/components/ui`
- `apps/web/src/components/layout`

## 4.4 Testing Module

Test:

- Backend starts successfully.
- Frontend starts successfully.
- Health endpoint returns OK.
- MySQL connection check works.
- Redis connection check works if Redis is enabled.
- API client can call backend health endpoint.
- Basic frontend route rendering works.

Automated tests:

- Backend health controller test.
- API client utility test.
- Frontend render smoke test.

Manual QA:

- Visit frontend root page.
- Confirm no console errors.
- Confirm backend `/health` responds.

## 4.5 Acceptance Criteria

Phase 1 is complete when:

- `apps/api` runs locally.
- `apps/web` runs locally.
- MySQL connection works.
- Prisma can generate client.
- Health endpoints return expected responses.
- Frontend can call the backend.

## 5. Phase 2: Authentication and Role Access

## 5.1 Goal

Allow users to register, log in, log out, and access the correct dashboard based on role.

## 5.2 Backend Development Module

Build:

- Auth module.
- Users module.
- Roles and permissions foundation.
- Password hashing.
- JWT access tokens.
- Refresh token support.
- Admin seed user.
- Account status handling.
- Auth guards.
- Role guards.
- Current user decorator.

Backend APIs:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/verify-email`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `GET /api/v1/auth/me`
- `GET /api/v1/users/me`
- `PATCH /api/v1/users/me`
- `PATCH /api/v1/users/me/password`

Database models:

- `User`
- `Role`
- `Permission`
- `UserRole`
- `RefreshToken`
- `PasswordResetToken`
- `EmailVerificationToken`

## 5.3 Frontend Development Module

Build:

- Login screen.
- Register screen.
- Forgot password screen.
- Reset password screen.
- Email verification screen.
- Auth provider.
- Token handling.
- Protected route component.
- Role-based redirect.
- Placeholder dashboards for admin, founder, and investor.
- Account page skeleton.

Frontend routes:

- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/verify-email`
- `/admin`
- `/founder`
- `/investor`
- `/account`
- `/account/security`

## 5.4 Testing Module

Test:

- Register founder.
- Register investor.
- Login as admin.
- Login as founder.
- Login as investor.
- Invalid login fails gracefully.
- Protected routes redirect unauthenticated users.
- Admin routes reject non-admin users.
- Refresh token flow works.
- Logout clears session.

Automated tests:

- Auth service unit tests.
- Password hashing tests.
- JWT guard tests.
- Login form validation tests.
- Role redirect tests.

Manual QA:

- Register and log in as each role.
- Confirm role-specific dashboard redirect.
- Confirm account status blocks suspended users.

## 5.5 Acceptance Criteria

Phase 2 is complete when:

- Users can register and log in.
- Admin seed account works.
- Role-based protected routes work.
- Backend prevents unauthorized access.
- Frontend redirects users to the correct dashboard.

## 6. Phase 3: Admin, User, and Organization Base

## 6.1 Goal

Give the admin real control over users and investor organizations. Build the first version of the admin dashboard.

## 6.2 Backend Development Module

Build:

- Admin module.
- Organization module.
- Organization membership module.
- Admin user management APIs.
- Admin organization review APIs.
- Audit log base.
- Admin dashboard summary endpoints.

Backend APIs:

- `GET /api/v1/admin/dashboard/summary`
- `GET /api/v1/admin/dashboard/pending-actions`
- `GET /api/v1/admin/users`
- `GET /api/v1/admin/users/:userId`
- `PATCH /api/v1/admin/users/:userId/status`
- `PATCH /api/v1/admin/users/:userId/roles`
- `DELETE /api/v1/admin/users/:userId`
- `POST /api/v1/organizations`
- `GET /api/v1/organizations/:organizationId`
- `PATCH /api/v1/organizations/:organizationId`
- `GET /api/v1/organizations/:organizationId/members`
- `POST /api/v1/organizations/:organizationId/invitations`
- `PATCH /api/v1/organizations/:organizationId/members/:memberId/role`
- `DELETE /api/v1/organizations/:organizationId/members/:memberId`
- `GET /api/v1/admin/organizations`
- `PATCH /api/v1/admin/organizations/:organizationId/status`

Database models:

- `Organization`
- `OrganizationMember`
- `OrganizationInvitation`
- `AuditLog`

## 6.3 Frontend Development Module

Build:

- Admin app shell.
- Admin dashboard.
- Admin user list.
- Admin user detail.
- User status controls.
- Role management controls.
- Admin organization list.
- Admin organization detail.
- Organization approval controls.
- Investor organization creation form.
- Organization member list.

Frontend routes:

- `/admin`
- `/admin/users`
- `/admin/users/:userId`
- `/admin/organizations`
- `/admin/organizations/:organizationId`
- `/investor/organization`

## 6.4 Testing Module

Test:

- Admin can list users.
- Admin can suspend/reactivate users.
- Founder/investor cannot access admin endpoints.
- Investor can create organization.
- Admin can approve or reject organization.
- Organization members are scoped correctly.
- Audit logs are created for sensitive actions.

Automated tests:

- Admin guard tests.
- Organization access tests.
- Admin user API integration tests.
- Organization API integration tests.
- Admin dashboard render tests.

Manual QA:

- Admin reviews a new investor organization.
- Suspended user cannot log in or use APIs.
- Organization member permissions behave correctly.

## 6.5 Acceptance Criteria

Phase 3 is complete when:

- Admin can manage users.
- Admin can manage investor organizations.
- Investor organizations can be created.
- Organization member access works.
- Audit logs exist for admin actions.

## 7. Phase 4: Founder, Investor, and Company Profiles

## 7.1 Goal

Enable founders, investors, and companies to create complete structured profiles.

## 7.2 Backend Development Module

Build:

- Founder profile module.
- Investor profile module.
- Investor preference module.
- Company module.
- Company team module.
- Company metrics module.
- Fundraising module.
- Profile completion logic.

Backend APIs:

- `GET /api/v1/founder/profile`
- `PUT /api/v1/founder/profile`
- `PATCH /api/v1/founder/profile`
- `GET /api/v1/investor/profile`
- `PUT /api/v1/investor/profile`
- `PATCH /api/v1/investor/profile`
- `GET /api/v1/investor/preferences`
- `PUT /api/v1/investor/preferences`
- `PATCH /api/v1/investor/preferences`
- `POST /api/v1/companies`
- `GET /api/v1/companies`
- `GET /api/v1/companies/:companyId`
- `PATCH /api/v1/companies/:companyId`
- `GET /api/v1/companies/:companyId/team`
- `POST /api/v1/companies/:companyId/team`
- `PATCH /api/v1/companies/:companyId/team/:memberId`
- `DELETE /api/v1/companies/:companyId/team/:memberId`
- `GET /api/v1/companies/:companyId/metrics`
- `PUT /api/v1/companies/:companyId/metrics`
- `PATCH /api/v1/companies/:companyId/metrics`
- `GET /api/v1/companies/:companyId/fundraising`
- `PUT /api/v1/companies/:companyId/fundraising`
- `PATCH /api/v1/companies/:companyId/fundraising`

Database models:

- `FounderProfile`
- `InvestorProfile`
- `InvestorPreference`
- `Company`
- `CompanyMember`
- `CompanyMetric`
- `FundraisingRound`

## 7.3 Frontend Development Module

Build:

- Founder onboarding flow.
- Founder profile form.
- Company profile form.
- Company team form/table.
- Company metrics form.
- Fundraising form.
- Investor onboarding flow.
- Investor profile form.
- Investor preferences form.
- Investor thesis editor.
- Founder dashboard with profile completion.
- Investor dashboard with preference completion.

Frontend routes:

- `/founder/onboarding`
- `/founder/profile`
- `/founder/company`
- `/founder/company/team`
- `/founder/company/metrics`
- `/founder/company/fundraising`
- `/investor/onboarding`
- `/investor/profile`
- `/investor/preferences`

## 7.4 Testing Module

Test:

- Founder can create and update founder profile.
- Founder can create company.
- Founder can add team, metrics, and fundraising data.
- Investor can create profile and preferences.
- Form validation works for required fields.
- Users cannot edit profiles they do not own.
- Company list respects role-based visibility.

Automated tests:

- Profile service tests.
- Company ownership guard tests.
- Form schema tests.
- Profile creation integration tests.

Manual QA:

- Complete founder onboarding.
- Complete investor onboarding.
- Test long text, missing fields, invalid URLs, and currency fields.

## 7.5 Acceptance Criteria

Phase 4 is complete when:

- Founder can create a complete startup profile draft.
- Investor can create profile and preferences.
- Company ownership rules work.
- Dashboards show profile completion status.

## 8. Phase 5: Startup Submission and Admin Review

## 8.1 Goal

Create the review workflow where founders submit startups, admins approve them, and investors can only see approved startups.

## 8.2 Backend Development Module

Build:

- Company submission workflow.
- Company visibility status.
- Admin company review APIs.
- Investor approved-company discovery API behavior.
- Founder dashboard summary endpoints.
- Investor dashboard summary endpoints.
- Admin risk summary placeholder.

Backend APIs:

- `POST /api/v1/companies/:companyId/submit`
- `POST /api/v1/companies/:companyId/archive`
- `GET /api/v1/admin/companies`
- `GET /api/v1/admin/companies/:companyId`
- `PATCH /api/v1/admin/companies/:companyId/status`
- `PATCH /api/v1/admin/companies/:companyId/visibility`
- `GET /api/v1/founder/dashboard/summary`
- `GET /api/v1/investor/dashboard/summary`
- `GET /api/v1/investor/dashboard/recommendations`
- `GET /api/v1/admin/dashboard/risk-summary`

Database updates:

- Add company status lifecycle fields.
- Add review metadata.
- Add rejection or return-for-changes reason.

## 8.3 Frontend Development Module

Build:

- Founder company review screen.
- Submit for review action.
- Founder dashboard company status.
- Admin company approval queue.
- Admin company detail page.
- Admin approve/reject/return controls.
- Investor discovery page with approved companies only.
- Startup detail shell for investor/admin.

Frontend routes:

- `/founder`
- `/founder/company`
- `/admin/companies`
- `/admin/companies/:companyId`
- `/investor`
- `/investor/discover`
- `/investor/startups/:companyId`

## 8.4 Testing Module

Test:

- Founder can submit company.
- Admin can approve company.
- Admin can reject or return company for changes.
- Investor cannot see draft or rejected companies.
- Founder can see own company regardless of approval status.
- Approval status changes appear on dashboards.

Automated tests:

- Company lifecycle integration tests.
- Visibility rule tests.
- Admin company action tests.
- Investor discovery route tests.

Manual QA:

- Submit a company as founder.
- Approve it as admin.
- Confirm investor can now see it.
- Reject another company and confirm investor cannot see it.

## 8.5 Acceptance Criteria

Phase 5 is complete when:

- Startup submission and approval workflow works end to end.
- Investors only see approved startups.
- Admin can manage startup status.
- Dashboard summaries reflect review state.

## 9. Phase 6: Documents and Data Room

## 9.1 Goal

Allow founders to upload startup documents and allow authorized users to view or process them.

## 9.2 Backend Development Module

Build:

- Document module.
- Local file storage.
- File type validation.
- File size validation.
- Document metadata.
- Document access grants.
- Secure download endpoint.
- Document processing status.
- Background job queue setup.
- Document extraction queue stub.

Backend APIs:

- `POST /api/v1/companies/:companyId/documents`
- `GET /api/v1/companies/:companyId/documents`
- `GET /api/v1/documents/:documentId`
- `GET /api/v1/documents/:documentId/download`
- `PATCH /api/v1/documents/:documentId`
- `DELETE /api/v1/documents/:documentId`
- `POST /api/v1/documents/:documentId/process`
- `GET /api/v1/documents/:documentId/extraction`
- `POST /api/v1/documents/:documentId/access-grants`
- `DELETE /api/v1/documents/:documentId/access-grants/:grantId`

Database models:

- `Document`
- `DocumentAccessGrant`
- `DocumentExtraction`
- `JobRun`

## 9.3 Frontend Development Module

Build:

- Founder data room page.
- File upload dropzone.
- Document category selector.
- Visibility selector.
- Document table.
- Document processing status badge.
- Document metadata edit.
- Download action.
- Process/reprocess action.
- Missing document checklist placeholder.
- Investor document tab on startup detail.
- Admin document review section.

Frontend routes:

- `/founder/company/documents`
- `/investor/startups/:companyId`
- `/admin/companies/:companyId`

## 9.4 Testing Module

Test:

- Founder can upload PDF/DOCX/XLSX/CSV.
- Unsupported files are rejected.
- Oversized files are rejected.
- Founder can view own documents.
- Investor cannot access private document without grant.
- Admin can view document metadata.
- Processing job can be queued.

Automated tests:

- Document upload integration tests.
- File validation tests.
- Document access guard tests.
- Frontend file upload component tests.

Manual QA:

- Upload valid and invalid files.
- Try downloading private document as unauthorized investor.
- Check document status transitions.

## 9.5 Acceptance Criteria

Phase 6 is complete when:

- Data room works for founders.
- Secure document access works.
- Document processing jobs can be queued.
- Investor/admin detail pages can show document availability.

## 10. Phase 7: AI Extraction, Claims, and Red Flags

## 10.1 Goal

Use the LLM to extract structured data from documents, detect startup claims, verify claims against evidence, and surface red flags.

## 10.2 Backend Development Module

Build:

- LLM service abstraction.
- Prompt templates.
- Structured output validation.
- LLM run logging.
- Text extraction for PDF/DOCX/XLSX/CSV.
- Document extraction worker.
- Claim detection worker.
- Claim verification worker.
- Red flag detection worker.
- Admin override APIs.
- AI processing status API.

Backend APIs:

- `POST /api/v1/companies/:companyId/ai/run-extraction`
- `POST /api/v1/companies/:companyId/ai/run-diligence`
- `GET /api/v1/companies/:companyId/ai/status`
- `GET /api/v1/admin/ai/runs`
- `GET /api/v1/admin/ai/runs/:runId`
- `GET /api/v1/companies/:companyId/claims`
- `GET /api/v1/claims/:claimId`
- `POST /api/v1/companies/:companyId/claims`
- `PATCH /api/v1/claims/:claimId`
- `POST /api/v1/claims/:claimId/verify`
- `PATCH /api/v1/admin/claims/:claimId/override`
- `GET /api/v1/companies/:companyId/red-flags`
- `PATCH /api/v1/admin/red-flags/:redFlagId`

Database models:

- `LlmRun`
- `Claim`
- `ClaimEvidence`
- `RedFlag`
- `AdminReview`

## 10.3 Frontend Development Module

Build:

- Founder AI feedback page.
- AI run status panel.
- Run extraction action.
- Run diligence action.
- Claim verification table.
- Red flag list.
- Extraction result panel.
- Admin AI runs list.
- Admin AI run detail page.
- Admin claim override UI.
- Investor AI diligence tab on startup detail.

Frontend routes:

- `/founder/company/ai-feedback`
- `/admin/ai-runs`
- `/admin/ai-runs/:runId`
- `/admin/claims`
- `/admin/companies/:companyId`
- `/investor/startups/:companyId`

## 10.4 Testing Module

Test:

- Document text extraction works for supported files.
- LLM response is validated before saving.
- Malformed LLM responses fail safely.
- Claims are created from extracted data.
- Verification statuses are saved.
- Red flags are saved.
- Admin can override claim status.
- AI pages show queued, processing, complete, failed states.

Automated tests:

- LLM service mock tests.
- JSON schema validation tests.
- Claim verification service tests.
- Red flag service tests.
- AI job integration tests with mocked LLM.
- AI status component tests.

Manual QA:

- Upload sample pitch deck.
- Run extraction.
- Run diligence.
- Check founder, investor, and admin views.

## 10.5 Acceptance Criteria

Phase 7 is complete when:

- AI extraction runs through background jobs.
- Claims and red flags are visible.
- LLM logs are stored.
- Admin can review and override AI outputs.
- Investor can view AI diligence for approved startups.

## 11. Phase 8: Valuation and Readiness

## 11.1 Goal

Build deterministic valuation and readiness engines with frontend reports for founders, investors, and admins.

## 11.2 Backend Development Module

Build:

- Valuation module.
- Scorecard method.
- Berkus method.
- Risk factor summation.
- Revenue multiple method.
- VC method.
- SAFE/dilution calculator.
- Readiness scoring module.
- Founder recommendation generation.
- Valuation explanation through LLM, optional but logged.
- Readiness calculation endpoint.

Backend APIs:

- `POST /api/v1/companies/:companyId/valuation/run`
- `GET /api/v1/companies/:companyId/valuation/latest`
- `GET /api/v1/companies/:companyId/valuation/runs`
- `GET /api/v1/valuation/runs/:valuationRunId`
- `POST /api/v1/valuation/safe-calculator`
- `POST /api/v1/companies/:companyId/readiness/calculate`
- `GET /api/v1/companies/:companyId/readiness/latest`
- `GET /api/v1/founder/dashboard/recommendations`

Database models:

- `ValuationRun`
- `ReadinessScore`
- `PlatformSetting` updates for scoring assumptions.

## 11.3 Frontend Development Module

Build:

- Founder readiness page.
- Founder valuation page.
- Investor valuation tab.
- Investor readiness tab.
- Admin valuation review panel.
- Readiness score breakdown.
- Valuation range card.
- Valuation method tabs.
- Valuation assumptions panel.
- SAFE/dilution calculator.
- Founder recommendations list.

Frontend routes:

- `/founder/company/readiness`
- `/founder/company/valuation`
- `/investor/startups/:companyId`
- `/admin/companies/:companyId`

## 11.4 Testing Module

Test:

- Valuation formulas return expected outputs.
- SAFE calculator returns correct dilution results.
- Readiness score changes when inputs change.
- Missing inputs are handled gracefully.
- Founder sees recommendations.
- Investor sees valuation/readiness for approved companies.
- Admin sees valuation/readiness for all companies.

Automated tests:

- Unit tests for each valuation formula.
- SAFE calculator unit tests.
- Readiness scoring unit tests.
- API integration tests for valuation and readiness endpoints.
- Frontend valuation component tests.

Manual QA:

- Test pre-revenue startup.
- Test revenue-generating startup.
- Test missing financials.
- Test high claimed valuation with weak evidence.

## 11.5 Acceptance Criteria

Phase 8 is complete when:

- Companies can receive valuation range and readiness score.
- SAFE calculator works.
- Founder can understand missing items and recommendations.
- Investor/admin can view reports clearly.

## 12. Phase 9: Investor Matching and Discovery

## 12.1 Goal

Build two-way matching between startups and investors using deterministic scores plus LLM thesis similarity.

## 12.2 Backend Development Module

Build:

- Matching module.
- Deterministic matching matrix.
- Configurable matching weights from settings.
- LLM thesis similarity comparison.
- Match storage.
- Match refresh jobs.
- Match status updates.
- Founder matched investors endpoint.
- Investor matched startups endpoint.
- Admin match list endpoint.

Backend APIs:

- `POST /api/v1/matches/refresh`
- `POST /api/v1/companies/:companyId/matches/refresh`
- `GET /api/v1/companies/:companyId/matched-investors`
- `GET /api/v1/investor/matched-startups`
- `GET /api/v1/matches/:matchId`
- `PATCH /api/v1/matches/:matchId/status`
- `GET /api/v1/admin/matches`

Database models:

- `Match`

## 12.3 Frontend Development Module

Build:

- Founder matched investors page.
- Investor matched startups page.
- Match detail panel.
- Match score badge.
- Match factor breakdown.
- AI thesis fit explanation.
- Refresh matches action.
- Dismiss/view/save status actions.
- Admin matches page.
- Investor discovery filters improvement.

Frontend routes:

- `/founder/matched-investors`
- `/investor/matched-startups`
- `/investor/discover`
- `/admin/matches`

## 12.4 Testing Module

Test:

- Matching matrix calculates expected score.
- Excluded sectors prevent matches.
- Ticket size mismatch lowers score.
- Stage mismatch lowers score.
- LLM thesis score is included only when appropriate.
- Founder sees matched investors.
- Investor sees matched startups.
- Match status updates work.
- Admin can inspect matches.

Automated tests:

- Matching service unit tests.
- LLM thesis similarity mocked tests.
- Match refresh job tests.
- Match API integration tests.
- Match UI component tests.

Manual QA:

- Create investor preferences.
- Create approved startup.
- Refresh matches.
- Verify both founder and investor views.

## 12.5 Acceptance Criteria

Phase 9 is complete when:

- Matching works both ways.
- Match scores and explanations are visible.
- Investors can act on matched startups.
- Founders can understand why investors match.
- Admin can review match quality.

## 13. Phase 10: Pipeline, Memos, Requests, Notifications, and Release Hardening

## 13.1 Goal

Complete the investor workflow and prepare the MVP for internal/demo release.

## 13.2 Backend Development Module

Build:

- Deal pipeline module.
- Pipeline notes.
- Investment memo generation.
- Information request workflow.
- In-app notifications.
- Admin settings module.
- Audit log viewer APIs.
- Matching weight settings.
- Readiness weight settings.
- Valuation assumption settings.
- Rate limiting.
- Production migration workflow.
- Final security hardening.

Backend APIs:

- `GET /api/v1/pipeline`
- `POST /api/v1/pipeline/items`
- `GET /api/v1/pipeline/items/:pipelineItemId`
- `PATCH /api/v1/pipeline/items/:pipelineItemId`
- `DELETE /api/v1/pipeline/items/:pipelineItemId`
- `GET /api/v1/pipeline/items/:pipelineItemId/notes`
- `POST /api/v1/pipeline/items/:pipelineItemId/notes`
- `PATCH /api/v1/pipeline/notes/:noteId`
- `DELETE /api/v1/pipeline/notes/:noteId`
- `POST /api/v1/companies/:companyId/memos`
- `GET /api/v1/companies/:companyId/memos`
- `GET /api/v1/memos/:memoId`
- `PATCH /api/v1/memos/:memoId`
- `POST /api/v1/memos/:memoId/regenerate`
- `GET /api/v1/memos/:memoId/export`
- `POST /api/v1/companies/:companyId/requests`
- `GET /api/v1/requests`
- `GET /api/v1/requests/:requestId`
- `POST /api/v1/requests/:requestId/responses`
- `PATCH /api/v1/requests/:requestId/status`
- `POST /api/v1/requests/:requestId/documents`
- `GET /api/v1/notifications`
- `PATCH /api/v1/notifications/:notificationId/read`
- `PATCH /api/v1/notifications/read-all`
- `GET /api/v1/admin/settings`
- `PATCH /api/v1/admin/settings/:key`
- `GET /api/v1/admin/settings/options/:type`
- `POST /api/v1/admin/settings/options/:type`
- `PATCH /api/v1/admin/settings/options/:type/:optionId`
- `DELETE /api/v1/admin/settings/options/:type/:optionId`
- `GET /api/v1/admin/settings/matching-weights`
- `PUT /api/v1/admin/settings/matching-weights`
- `GET /api/v1/admin/settings/readiness-weights`
- `PUT /api/v1/admin/settings/readiness-weights`
- `GET /api/v1/admin/settings/valuation-assumptions`
- `PUT /api/v1/admin/settings/valuation-assumptions`
- `GET /api/v1/admin/audit-logs`
- `GET /api/v1/admin/audit-logs/:auditLogId`

Database models:

- `DealPipelineItem`
- `DealNote`
- `InvestmentMemo`
- `InformationRequest`
- `InformationRequestResponse`
- `Notification`
- `PlatformSetting`

## 13.3 Frontend Development Module

Build:

- Investor pipeline board.
- Pipeline detail page.
- Internal notes.
- Investment memo list.
- Investment memo detail.
- Memo generation and regeneration UI.
- Memo export action.
- Investor request creation.
- Founder request response.
- Request list and detail for both roles.
- Notification bell.
- Notification page.
- Admin settings pages.
- Matching weight editor.
- Readiness weight editor.
- Valuation assumption editor.
- Audit log page.
- Final responsive polish.
- Final empty/error/loading states.

Frontend routes:

- `/investor/pipeline`
- `/investor/pipeline/:pipelineItemId`
- `/investor/memos`
- `/investor/memos/:memoId`
- `/investor/requests`
- `/investor/requests/:requestId`
- `/founder/requests`
- `/founder/requests/:requestId`
- `/notifications`
- `/admin/settings`
- `/admin/settings/options`
- `/admin/settings/matching-weights`
- `/admin/settings/readiness-weights`
- `/admin/settings/valuation-assumptions`
- `/admin/audit-logs`

## 13.4 Testing Module

Test:

- Investor can save startup to pipeline.
- Investor can move pipeline stages.
- Investor can add/edit/delete notes.
- Investor can generate memo.
- Memo generation handles AI failure.
- Investor can request information.
- Founder can respond.
- Founder can attach document to request.
- Notifications are created and marked read.
- Admin can update settings.
- Settings affect matching/readiness/valuation behavior.
- Audit logs are queryable.
- Full end-to-end MVP flow works.

Automated tests:

- Pipeline API integration tests.
- Memo generation mocked LLM tests.
- Request workflow tests.
- Notification tests.
- Settings tests.
- Audit log tests.
- Critical frontend component tests.
- End-to-end happy path tests.

Manual QA:

- Run full founder to investor flow.
- Run full investor diligence flow.
- Run full admin review flow.
- Test role boundaries.
- Test mobile navigation.
- Test failed network responses.
- Test failed AI responses.

## 13.5 Acceptance Criteria

Phase 10 is complete when:

- Investor workflow is complete from discovery to pipeline to memo to request.
- Founder can respond to investor requests.
- Notifications work.
- Admin can control platform settings.
- Audit logs are visible.
- Main MVP paths pass tests.
- Product is ready for demo or internal pilot.

## 14. Full MVP End-to-End Test Scenarios

## 14.1 Founder to Investor Match Flow

1. Founder registers.
2. Founder completes profile.
3. Founder creates company.
4. Founder adds team, metrics, and fundraising data.
5. Founder uploads pitch deck and financial documents.
6. Founder submits company.
7. Admin approves company.
8. Investor registers.
9. Investor creates profile and preferences.
10. Matching job runs.
11. Founder sees matched investor.
12. Investor sees matched startup.

Expected result:

- Match exists for both sides with score and explanation.

## 14.2 Investor Diligence Flow

1. Investor opens matched startup.
2. Investor reviews overview, metrics, fundraising, documents, AI diligence, claims, red flags, valuation, and readiness.
3. Investor saves startup to pipeline.
4. Investor adds internal note.
5. Investor generates memo.
6. Investor requests missing information.
7. Founder responds and attaches document.
8. Investor marks request resolved.

Expected result:

- Investor can manage the opportunity without leaving the platform.

## 14.3 Admin Control Flow

1. Admin logs in.
2. Admin reviews pending users.
3. Admin reviews pending investor organization.
4. Admin reviews pending startup.
5. Admin reviews AI runs.
6. Admin overrides a claim verification result.
7. Admin updates matching weights.
8. Admin checks audit logs.

Expected result:

- Admin can control and audit the platform.

## 15. Cross-Phase Engineering Rules

These rules apply to every phase:

1. Every backend endpoint must enforce authorization.
2. Every frontend page must handle loading, empty, error, and permission states.
3. Every form must use validation.
4. Every sensitive backend action must create an audit log.
5. Every AI call must be logged.
6. Every LLM output must be validated before being trusted.
7. Every file download must go through backend authorization.
8. Every phase must include tests before moving to the next phase.
9. Mock data should be removed as soon as real APIs exist.
10. Keep implementation practical and avoid unpaid external subscription dependencies.

## 16. Suggested Sprint Breakdown

Each phase can be treated as one or more development sprints depending on team size.

Suggested breakdown:

- Phase 1: 1 sprint.
- Phase 2: 1 sprint.
- Phase 3: 1 sprint.
- Phase 4: 2 sprints.
- Phase 5: 1 sprint.
- Phase 6: 1 sprint.
- Phase 7: 2 sprints.
- Phase 8: 2 sprints.
- Phase 9: 1 to 2 sprints.
- Phase 10: 2 sprints.

For a small team, expect the full MVP to take roughly **13 to 15 focused sprints**.

## 17. Recommended Build Order Inside Each Phase

Use this order inside every phase:

1. Define or update database models.
2. Build backend service logic.
3. Build backend APIs.
4. Add backend tests.
5. Build frontend API hooks.
6. Build frontend screens.
7. Add frontend tests.
8. Run manual QA.
9. Fix bugs.
10. Update documentation if implementation differs from plan.

## 18. Phase Exit Checklist

Before closing any phase:

- Backend compiles.
- Frontend compiles.
- Database migrations run.
- Relevant seed data exists.
- Main APIs have tests.
- Main screens render.
- Role access is verified.
- No critical console errors.
- No critical server errors.
- Documentation remains accurate.

## 19. MVP Completion Definition

The MVP is complete when:

- Admin can control users, organizations, startups, AI outputs, settings, and audit logs.
- Founder can create a startup, upload documents, run AI feedback, view readiness, view valuation, and see matched investors.
- Investor can create preferences, discover startups, view diligence, see matched startups, save to pipeline, generate memos, and request information.
- AI extraction, claim verification, red flags, valuation, readiness, and matching work end to end.
- Role-based security works across frontend and backend.
- All core end-to-end scenarios pass.
- The application is stable enough for internal demo or pilot use.

