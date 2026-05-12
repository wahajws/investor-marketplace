# Backend Development Plan

## Project

**Working name:** VC Intelligence & Startup Diligence Platform  
**Backend stack:** Node.js, TypeScript, NestJS, Prisma, MySQL, LLM API  
**Related requirements document:** `docs/software-engineering-requirements.md`  
**Purpose:** This document defines the complete backend development plan, API surface, service modules, database responsibilities, setup instructions, and implementation phases for the MVP.

## 1. Backend Goals

The backend must power a multi-role SaaS platform for admins, entrepreneurs, and investors.

The backend must support:

1. Secure authentication and role-based access control.
2. Admin-controlled platform configuration.
3. Entrepreneur/company profile management.
4. Investor/investor organization profile management.
5. Startup document upload and controlled access.
6. LLM-based document extraction and analysis.
7. Claim detection and claim verification.
8. Deterministic valuation reasonableness calculations.
9. Startup readiness scoring.
10. Investor-startup matching using scoring plus LLM thesis comparison.
11. Investor deal pipeline CRM.
12. AI investment memo generation.
13. Red flag detection.
14. Information request workflow between investors and entrepreneurs.
15. Notifications.
16. Audit logging.
17. LLM run logging.

## 2. Backend Architecture Decision

Use a modular NestJS backend.

Recommended backend stack:

- **Runtime:** Node.js.
- **Language:** TypeScript.
- **Framework:** NestJS.
- **Database:** MySQL.
- **ORM:** Prisma.
- **Validation:** Zod or `class-validator`.
- **Authentication:** JWT access tokens plus refresh tokens.
- **Password hashing:** bcrypt or argon2.
- **File upload:** Multer through NestJS file upload support.
- **Background jobs:** BullMQ with Redis.
- **LLM integration:** Dedicated LLM service using structured JSON outputs.
- **API style:** REST for MVP.

Why NestJS:

- Clear module boundaries.
- Good dependency injection.
- Works well with guards, interceptors, validation pipes, and background workers.
- Easier to maintain as the product grows.

Why Prisma:

- Good TypeScript support.
- Clear schema definition.
- Migration history through Prisma Migrate.
- Strong developer experience with MySQL.

Why BullMQ:

- LLM and document processing jobs can be slow.
- Upload endpoints should return quickly.
- Workers can process extraction, claim verification, matching, and memo generation asynchronously.

## 3. Backend Application Structure

Recommended structure:

```text
apps/
  api/
    src/
      main.ts
      app.module.ts
      config/
      common/
        decorators/
        filters/
        guards/
        interceptors/
        pipes/
        types/
      prisma/
      auth/
      users/
      organizations/
      admin/
      founders/
      investors/
      companies/
      documents/
      ai/
      claims/
      valuation/
      readiness/
      matching/
      pipeline/
      memos/
      requests/
      notifications/
      audit/
      settings/
      health/
      jobs/
    prisma/
      schema.prisma
      migrations/
      seed.ts
    storage/
      uploads/
    test/
    .env.example
    package.json
```

## 4. Environment Variables

Required `.env` values:

```text
NODE_ENV=development
PORT=4000

DATABASE_URL=mysql://user:password@localhost:3306/vc_platform

JWT_ACCESS_SECRET=change_me
JWT_REFRESH_SECRET=change_me
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

OPENAI_API_KEY=
OPENAI_MODEL=

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

UPLOAD_STORAGE_DRIVER=local
LOCAL_UPLOAD_DIR=storage/uploads
MAX_UPLOAD_MB=25

APP_FRONTEND_URL=http://localhost:5173
```

Optional later:

```text
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=

S3_ENDPOINT=
S3_BUCKET=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_REGION=
```

## 5. Local Backend Setup Instructions

## 5.1 Prerequisites

Install:

- Node.js LTS.
- MySQL 8 or compatible MariaDB.
- Redis.
- npm, pnpm, or yarn.

Recommended package manager: `pnpm`.

## 5.2 Create Database

Create a local MySQL database:

```sql
CREATE DATABASE vc_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Create a development user if needed:

```sql
CREATE USER 'vc_user'@'localhost' IDENTIFIED BY 'vc_password';
GRANT ALL PRIVILEGES ON vc_platform.* TO 'vc_user'@'localhost';
FLUSH PRIVILEGES;
```

## 5.3 Install Backend Dependencies

From `apps/api`:

```bash
pnpm install
```

Recommended dependency groups:

```bash
pnpm add @nestjs/common @nestjs/core @nestjs/platform-express @nestjs/config
pnpm add @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
pnpm add @prisma/client
pnpm add class-validator class-transformer
pnpm add multer
pnpm add bullmq ioredis
pnpm add openai
pnpm add zod
pnpm add pdf-parse mammoth xlsx
pnpm add helmet compression cookie-parser
pnpm add uuid
pnpm add dayjs

pnpm add -D prisma typescript ts-node @types/node
pnpm add -D @types/bcrypt @types/passport-jwt @types/multer
pnpm add -D jest supertest @types/jest @types/supertest
```

## 5.4 Configure Environment

Copy:

```bash
cp .env.example .env
```

Set `DATABASE_URL`, JWT secrets, Redis values, and LLM key.

## 5.5 Run Prisma Migrations

Prisma Migrate should be used to keep the MySQL schema in sync with the Prisma schema and preserve a migration history.

Development:

```bash
pnpm prisma migrate dev --name init
```

Generate Prisma client:

```bash
pnpm prisma generate
```

Seed initial admin user and platform settings:

```bash
pnpm prisma db seed
```

Production or staging:

```bash
pnpm prisma migrate deploy
```

## 5.6 Start Services

Start MySQL and Redis first.

Start API:

```bash
pnpm run start:dev
```

Start worker:

```bash
pnpm run worker:dev
```

Health check:

```bash
curl http://localhost:4000/health
```

Expected response:

```json
{
  "status": "ok"
}
```

## 6. Backend Modules

## 6.1 Auth Module

Responsibilities:

- Register users.
- Login users.
- Issue access tokens.
- Issue refresh tokens.
- Rotate refresh tokens.
- Verify email.
- Reset password.
- Enforce account status.

Key services:

- `AuthService`
- `PasswordService`
- `TokenService`
- `EmailVerificationService`

Guards:

- `JwtAuthGuard`
- `RolesGuard`
- `OrganizationAccessGuard`

## 6.2 Users Module

Responsibilities:

- Manage user records.
- Manage user role assignments.
- Manage user account status.
- Manage user profile basics.

Key services:

- `UsersService`
- `RolesService`
- `PermissionsService`

## 6.3 Organizations Module

Responsibilities:

- Manage investor organizations.
- Manage platform organizations if needed later.
- Manage organization members and roles.

Organization types:

- Investor firm.
- Accelerator.
- Angel network.
- Family office.
- Corporate venture.
- Government-linked fund.

## 6.4 Founder Module

Responsibilities:

- Manage founder profile.
- Connect founder to company.
- Manage founder biography, experience, education, and role.

## 6.5 Investor Module

Responsibilities:

- Manage investor profile.
- Manage investor preferences.
- Manage investor thesis.
- Manage organization-level preferences.

## 6.6 Company Module

Responsibilities:

- Create and update startup/company profiles.
- Manage team members.
- Manage metrics.
- Manage fundraising data.
- Manage visibility status.

Company visibility statuses:

- Draft.
- Submitted.
- Admin review.
- Approved.
- Rejected.
- Hidden.

## 6.7 Documents Module

Responsibilities:

- Upload documents.
- Store document metadata.
- Store document file path or storage key.
- Validate file type and size.
- Control document access.
- Queue document extraction jobs.

Document processing statuses:

- Uploaded.
- Queued.
- Processing.
- Extracted.
- Failed.
- Needs review.

## 6.8 AI Module

Responsibilities:

- Centralize all LLM calls.
- Store prompt templates.
- Enforce structured outputs.
- Validate model response schemas.
- Store LLM run logs.
- Handle retry and failure states.
- Prevent prompt injection from uploaded text.

LLM tasks:

- Document extraction.
- Claim detection.
- Claim verification explanation.
- Red flag explanation.
- Founder recommendations.
- Investor thesis similarity.
- Match explanation.
- Memo generation.

## 6.9 Claims Module

Responsibilities:

- Store founder claims.
- Link claims to evidence.
- Run verification.
- Store verification status.
- Allow admin override.

## 6.10 Valuation Module

Responsibilities:

- Run valuation formulas.
- Store valuation assumptions.
- Store valuation runs.
- Generate valuation report data.
- Ask LLM for plain-language explanation after deterministic calculation.

Valuation services:

- `ScorecardValuationService`
- `BerkusValuationService`
- `RiskFactorValuationService`
- `RevenueMultipleValuationService`
- `VcMethodValuationService`
- `SafeDilutionService`

## 6.11 Readiness Module

Responsibilities:

- Calculate startup readiness score.
- Store category scores.
- Generate readiness label.
- Generate founder recommendations.

## 6.12 Matching Module

Responsibilities:

- Match startups to investors.
- Match investors to startups.
- Run deterministic matching matrix.
- Run LLM thesis similarity comparison.
- Store match result and explanation.
- Refresh matches when startup or investor profile changes.

## 6.13 Pipeline Module

Responsibilities:

- Manage investor deal pipeline.
- Save startups.
- Assign owners.
- Move deals through stages.
- Store notes and ratings.
- Track next action dates.

## 6.14 Memos Module

Responsibilities:

- Generate investment memos.
- Store memo versions.
- Allow investors to regenerate memo.
- Allow export-ready memo content.

## 6.15 Requests Module

Responsibilities:

- Investor requests more information.
- Founder responds.
- Founder uploads requested document.
- Investor marks request resolved.

## 6.16 Notifications Module

Responsibilities:

- Create in-app notifications.
- Mark notifications read.
- Send email later if SMTP is configured.

## 6.17 Admin Module

Responsibilities:

- Admin dashboard summaries.
- User management.
- Startup review.
- Investor review.
- AI review queue.
- Overrides.
- Configuration management.

## 6.18 Settings Module

Responsibilities:

- Store platform-controlled lists and scoring weights.
- Provide settings to admin UI.
- Provide settings to matching, valuation, and readiness services.

## 6.19 Audit Module

Responsibilities:

- Log important user and system events.
- Provide audit log query endpoints for admin.

## 6.20 Jobs Module

Responsibilities:

- Queue and process background jobs.
- Run document extraction.
- Run claim verification.
- Run matching refresh.
- Run memo generation.
- Retry failed jobs with limits.

## 7. Database Development Plan

## 7.1 Core Tables

Initial Prisma models should cover:

- `User`
- `Role`
- `Permission`
- `UserRole`
- `Organization`
- `OrganizationMember`
- `FounderProfile`
- `InvestorProfile`
- `InvestorPreference`
- `Company`
- `CompanyMember`
- `CompanyMetric`
- `FundraisingRound`
- `Document`
- `DocumentAccessGrant`
- `DocumentExtraction`
- `Claim`
- `ClaimEvidence`
- `ValuationRun`
- `ReadinessScore`
- `RedFlag`
- `Match`
- `DealPipelineItem`
- `DealNote`
- `InformationRequest`
- `InvestmentMemo`
- `Notification`
- `AdminReview`
- `AuditLog`
- `LlmRun`
- `PlatformSetting`
- `JobRun`

## 7.2 Required Enum Concepts

Use enums where stable and settings tables where admin configurability is needed.

Stable backend enums:

- User status.
- User role.
- Organization type.
- Company visibility status.
- Document processing status.
- Claim verification status.
- Red flag severity.
- Deal stage.
- Information request status.
- Notification type.
- LLM task type.

Admin-configurable data:

- Sectors.
- Startup stages.
- Countries.
- Business models.
- Funding instruments.
- Document categories.
- Matching weights.
- Readiness scoring weights.
- Valuation assumptions.

## 7.3 Data Access Rules

The backend must enforce:

- Admin can access all data.
- Founder can access only their own company and documents.
- Investor can access approved startup profiles.
- Investor can access private documents only if granted access.
- Investor organization members can access their organization pipeline.
- Internal notes are visible only to the investor organization that created them.
- LLM logs are admin-only by default.

## 8. Background Job Plan

Use BullMQ queues for long-running or expensive tasks.

Queues:

```text
document-processing
claim-verification
valuation
readiness
matching
memo-generation
notifications
```

Job examples:

- `extract-document-text`
- `extract-startup-data`
- `detect-claims`
- `verify-claims`
- `run-valuation`
- `calculate-readiness`
- `refresh-company-matches`
- `refresh-investor-matches`
- `generate-investment-memo`
- `send-notification`

Job requirements:

- Store job status.
- Retry transient failures.
- Log final error messages.
- Avoid duplicate jobs for the same entity when possible.
- Mark stale AI output when source data changes.

## 9. LLM Development Plan

## 9.1 LLM Integration Rules

The backend must:

- Use one `LlmService` abstraction.
- Keep prompts versioned.
- Store every LLM run.
- Use structured JSON outputs where possible.
- Validate output with Zod or JSON Schema.
- Treat uploaded document text as untrusted input.
- Never allow user-uploaded text to modify system instructions.
- Add model, token usage, prompt version, and task type to logs.

## 9.2 LLM Output Schemas

Create schemas for:

- `DocumentExtractionResult`
- `ClaimDetectionResult`
- `ClaimVerificationResult`
- `RedFlagResult`
- `FounderRecommendationResult`
- `InvestorThesisSimilarityResult`
- `MatchExplanationResult`
- `InvestmentMemoResult`

## 9.3 LLM Tasks

Document extraction:

- Input: extracted document text and document category.
- Output: structured company, team, traction, financial, and fundraising data.

Claim detection:

- Input: company profile and document extraction.
- Output: list of claims.

Claim verification:

- Input: claim, available structured evidence, source references.
- Output: verification status and explanation.

Thesis similarity:

- Input: startup summary and investor thesis.
- Output: similarity score, fit reasons, concerns, suggested conversation angle.

Memo generation:

- Input: company profile, metrics, claims, valuation run, red flags, match context.
- Output: structured memo sections.

## 10. Valuation Backend Plan

Valuation must be deterministic first.

Implement:

1. `ScorecardValuationService`
2. `BerkusValuationService`
3. `RiskFactorValuationService`
4. `RevenueMultipleValuationService`
5. `VcMethodValuationService`
6. `SafeDilutionService`

Valuation result fields:

- Company ID.
- Method.
- Lower bound.
- Upper bound.
- Currency.
- Claimed valuation.
- Reasonableness status.
- Confidence level.
- Inputs JSON.
- Assumptions JSON.
- Formula version.
- Explanation.
- Created by user or system.

Admin must be able to configure:

- Base valuation by region/stage.
- Sector multipliers.
- Revenue multiple ranges.
- Risk adjustment values.
- Scorecard weights.
- Berkus factor values.
- Target return assumptions for VC method.

## 11. Matching Backend Plan

## 11.1 Matching Flow

1. Startup profile is approved or updated.
2. Matching job is queued.
3. Backend filters eligible investors.
4. Deterministic matching matrix is calculated.
5. LLM thesis similarity is calculated only for candidates above a minimum deterministic threshold.
6. Final match score is stored.
7. Notifications are created for relevant users.

## 11.2 Deterministic Match Factors

Default matrix:

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

Admin can change weights.

## 11.3 Match Result Fields

- Startup ID.
- Investor profile ID.
- Investor organization ID.
- Total score.
- Deterministic score.
- LLM thesis score.
- Fit level.
- Matched factors JSON.
- Missing factors JSON.
- Explanation.
- Status.
- Created at.
- Refreshed at.

## 12. API Development Plan

All APIs should be versioned under `/api/v1`.

## 12.1 Health APIs

### `GET /api/v1/health`

Returns API health.

### `GET /api/v1/health/db`

Checks database connection.

### `GET /api/v1/health/redis`

Checks Redis connection.

## 12.2 Auth APIs

### `POST /api/v1/auth/register`

Register user.

Request:

```json
{
  "email": "founder@example.com",
  "password": "Password123!",
  "role": "FOUNDER"
}
```

### `POST /api/v1/auth/login`

Login and receive tokens.

### `POST /api/v1/auth/refresh`

Refresh access token.

### `POST /api/v1/auth/logout`

Revoke refresh token.

### `POST /api/v1/auth/verify-email`

Verify email token.

### `POST /api/v1/auth/forgot-password`

Request password reset.

### `POST /api/v1/auth/reset-password`

Reset password.

### `GET /api/v1/auth/me`

Return current user, roles, organization memberships, and profile status.

## 12.3 User APIs

### `GET /api/v1/users/me`

Get current user.

### `PATCH /api/v1/users/me`

Update current user basics.

### `PATCH /api/v1/users/me/password`

Change password.

## 12.4 Admin User APIs

### `GET /api/v1/admin/users`

List users with filters.

Filters:

- role.
- status.
- search.
- created date.

### `GET /api/v1/admin/users/:userId`

Get user details.

### `PATCH /api/v1/admin/users/:userId/status`

Approve, suspend, deactivate, or reactivate user.

### `PATCH /api/v1/admin/users/:userId/roles`

Update user roles.

### `DELETE /api/v1/admin/users/:userId`

Soft-delete user.

## 12.5 Organization APIs

### `POST /api/v1/organizations`

Create organization.

### `GET /api/v1/organizations/:organizationId`

Get organization.

### `PATCH /api/v1/organizations/:organizationId`

Update organization.

### `GET /api/v1/organizations/:organizationId/members`

List organization members.

### `POST /api/v1/organizations/:organizationId/invitations`

Invite member.

### `PATCH /api/v1/organizations/:organizationId/members/:memberId/role`

Update organization member role.

### `DELETE /api/v1/organizations/:organizationId/members/:memberId`

Remove organization member.

## 12.6 Admin Organization APIs

### `GET /api/v1/admin/organizations`

List all organizations.

### `PATCH /api/v1/admin/organizations/:organizationId/status`

Approve, suspend, or reject organization.

## 12.7 Founder Profile APIs

### `GET /api/v1/founder/profile`

Get current founder profile.

### `PUT /api/v1/founder/profile`

Create or replace founder profile.

### `PATCH /api/v1/founder/profile`

Update founder profile.

## 12.8 Investor Profile APIs

### `GET /api/v1/investor/profile`

Get current investor profile.

### `PUT /api/v1/investor/profile`

Create or replace investor profile.

### `PATCH /api/v1/investor/profile`

Update investor profile.

### `GET /api/v1/investor/preferences`

Get investor preferences.

### `PUT /api/v1/investor/preferences`

Create or replace investor preferences.

### `PATCH /api/v1/investor/preferences`

Update investor preferences.

## 12.9 Company APIs

### `POST /api/v1/companies`

Create startup/company profile.

### `GET /api/v1/companies`

List visible companies.

Founder sees own companies. Investor sees approved companies. Admin sees all.

### `GET /api/v1/companies/:companyId`

Get company detail.

### `PATCH /api/v1/companies/:companyId`

Update company.

### `POST /api/v1/companies/:companyId/submit`

Submit company for admin review.

### `POST /api/v1/companies/:companyId/archive`

Archive company.

### `GET /api/v1/companies/:companyId/team`

List company team.

### `POST /api/v1/companies/:companyId/team`

Add company team member.

### `PATCH /api/v1/companies/:companyId/team/:memberId`

Update team member.

### `DELETE /api/v1/companies/:companyId/team/:memberId`

Remove team member.

## 12.10 Company Metrics APIs

### `GET /api/v1/companies/:companyId/metrics`

Get company metrics.

### `PUT /api/v1/companies/:companyId/metrics`

Create or replace company metrics.

### `PATCH /api/v1/companies/:companyId/metrics`

Update company metrics.

### `GET /api/v1/companies/:companyId/fundraising`

Get fundraising data.

### `PUT /api/v1/companies/:companyId/fundraising`

Create or replace fundraising data.

### `PATCH /api/v1/companies/:companyId/fundraising`

Update fundraising data.

## 12.11 Admin Company APIs

### `GET /api/v1/admin/companies`

List all companies.

### `GET /api/v1/admin/companies/:companyId`

Admin company detail.

### `PATCH /api/v1/admin/companies/:companyId/status`

Approve, reject, hide, or return company for changes.

### `PATCH /api/v1/admin/companies/:companyId/visibility`

Update visibility.

## 12.12 Document APIs

### `POST /api/v1/companies/:companyId/documents`

Upload document.

Form fields:

- file.
- category.
- visibility.
- description.

### `GET /api/v1/companies/:companyId/documents`

List documents.

### `GET /api/v1/documents/:documentId`

Get document metadata.

### `GET /api/v1/documents/:documentId/download`

Download document if permitted.

### `PATCH /api/v1/documents/:documentId`

Update document metadata.

### `DELETE /api/v1/documents/:documentId`

Soft-delete document.

### `POST /api/v1/documents/:documentId/process`

Queue document extraction.

### `GET /api/v1/documents/:documentId/extraction`

Get extraction result.

### `POST /api/v1/documents/:documentId/access-grants`

Grant investor access to private document.

### `DELETE /api/v1/documents/:documentId/access-grants/:grantId`

Revoke access grant.

## 12.13 AI Processing APIs

### `POST /api/v1/companies/:companyId/ai/run-extraction`

Queue extraction for company documents.

### `POST /api/v1/companies/:companyId/ai/run-diligence`

Queue claim detection, verification, red flags, readiness, and valuation.

### `GET /api/v1/companies/:companyId/ai/status`

Get AI processing status.

### `GET /api/v1/admin/ai/runs`

Admin list LLM runs.

### `GET /api/v1/admin/ai/runs/:runId`

Admin view LLM run detail.

## 12.14 Claims APIs

### `GET /api/v1/companies/:companyId/claims`

List company claims.

### `GET /api/v1/claims/:claimId`

Get claim detail.

### `POST /api/v1/companies/:companyId/claims`

Manually create claim.

### `PATCH /api/v1/claims/:claimId`

Update claim.

### `POST /api/v1/claims/:claimId/verify`

Queue verification.

### `PATCH /api/v1/admin/claims/:claimId/override`

Admin override verification status.

## 12.15 Valuation APIs

### `POST /api/v1/companies/:companyId/valuation/run`

Run valuation analysis.

### `GET /api/v1/companies/:companyId/valuation/latest`

Get latest valuation result.

### `GET /api/v1/companies/:companyId/valuation/runs`

List valuation runs.

### `GET /api/v1/valuation/runs/:valuationRunId`

Get valuation run detail.

### `POST /api/v1/valuation/safe-calculator`

Calculate SAFE and dilution result without saving, or with optional company ID.

## 12.16 Readiness APIs

### `POST /api/v1/companies/:companyId/readiness/calculate`

Calculate readiness score.

### `GET /api/v1/companies/:companyId/readiness/latest`

Get latest readiness score.

### `GET /api/v1/companies/:companyId/red-flags`

List red flags.

### `PATCH /api/v1/admin/red-flags/:redFlagId`

Admin update red flag.

## 12.17 Matching APIs

### `POST /api/v1/matches/refresh`

Refresh matches for current user context.

### `POST /api/v1/companies/:companyId/matches/refresh`

Refresh startup matches.

### `GET /api/v1/companies/:companyId/matched-investors`

Founder gets matched investors.

### `GET /api/v1/investor/matched-startups`

Investor gets matched startups.

### `GET /api/v1/matches/:matchId`

Get match detail.

### `PATCH /api/v1/matches/:matchId/status`

Update match status: new, viewed, saved, dismissed, contacted.

### `GET /api/v1/admin/matches`

Admin list all matches.

## 12.18 Deal Pipeline APIs

### `GET /api/v1/pipeline`

Get investor organization pipeline.

### `POST /api/v1/pipeline/items`

Save startup to pipeline.

### `GET /api/v1/pipeline/items/:pipelineItemId`

Get pipeline item detail.

### `PATCH /api/v1/pipeline/items/:pipelineItemId`

Update stage, owner, rating, or next action.

### `DELETE /api/v1/pipeline/items/:pipelineItemId`

Archive pipeline item.

### `GET /api/v1/pipeline/items/:pipelineItemId/notes`

List notes.

### `POST /api/v1/pipeline/items/:pipelineItemId/notes`

Create note.

### `PATCH /api/v1/pipeline/notes/:noteId`

Update note.

### `DELETE /api/v1/pipeline/notes/:noteId`

Delete note.

## 12.19 Investment Memo APIs

### `POST /api/v1/companies/:companyId/memos`

Generate memo.

### `GET /api/v1/companies/:companyId/memos`

List memos for company visible to requesting investor organization.

### `GET /api/v1/memos/:memoId`

Get memo detail.

### `PATCH /api/v1/memos/:memoId`

Update memo title or edited content.

### `POST /api/v1/memos/:memoId/regenerate`

Regenerate memo.

### `GET /api/v1/memos/:memoId/export`

Export memo as markdown or plain text.

## 12.20 Information Request APIs

### `POST /api/v1/companies/:companyId/requests`

Investor creates request for more information.

### `GET /api/v1/requests`

List current user's requests.

### `GET /api/v1/requests/:requestId`

Get request detail.

### `POST /api/v1/requests/:requestId/responses`

Founder responds.

### `PATCH /api/v1/requests/:requestId/status`

Update request status.

### `POST /api/v1/requests/:requestId/documents`

Attach document to request.

## 12.21 Notification APIs

### `GET /api/v1/notifications`

List notifications.

### `PATCH /api/v1/notifications/:notificationId/read`

Mark notification as read.

### `PATCH /api/v1/notifications/read-all`

Mark all notifications as read.

## 12.22 Admin Settings APIs

### `GET /api/v1/admin/settings`

List platform settings.

### `PATCH /api/v1/admin/settings/:key`

Update platform setting.

### `GET /api/v1/admin/settings/options/:type`

List configurable options.

### `POST /api/v1/admin/settings/options/:type`

Create option.

### `PATCH /api/v1/admin/settings/options/:type/:optionId`

Update option.

### `DELETE /api/v1/admin/settings/options/:type/:optionId`

Disable option.

### `GET /api/v1/admin/settings/matching-weights`

Get matching weights.

### `PUT /api/v1/admin/settings/matching-weights`

Replace matching weights.

### `GET /api/v1/admin/settings/readiness-weights`

Get readiness scoring weights.

### `PUT /api/v1/admin/settings/readiness-weights`

Replace readiness scoring weights.

### `GET /api/v1/admin/settings/valuation-assumptions`

Get valuation assumptions.

### `PUT /api/v1/admin/settings/valuation-assumptions`

Replace valuation assumptions.

## 12.23 Audit APIs

### `GET /api/v1/admin/audit-logs`

List audit logs.

Filters:

- user ID.
- entity type.
- entity ID.
- action.
- date range.

### `GET /api/v1/admin/audit-logs/:auditLogId`

Get audit log detail.

## 12.24 Admin Dashboard APIs

### `GET /api/v1/admin/dashboard/summary`

Admin summary metrics.

### `GET /api/v1/admin/dashboard/pending-actions`

Items needing admin action.

### `GET /api/v1/admin/dashboard/risk-summary`

High-risk startup and AI review summary.

## 12.25 Investor Dashboard APIs

### `GET /api/v1/investor/dashboard/summary`

Investor dashboard metrics.

### `GET /api/v1/investor/dashboard/recommendations`

Recommended startups.

### `GET /api/v1/investor/dashboard/pipeline-summary`

Pipeline summary.

## 12.26 Founder Dashboard APIs

### `GET /api/v1/founder/dashboard/summary`

Founder dashboard metrics.

### `GET /api/v1/founder/dashboard/recommendations`

Founder improvement recommendations.

### `GET /api/v1/founder/dashboard/investor-interest`

Investor views, saves, and requests.

## 13. Security Plan

Required security controls:

- Hash passwords.
- Use JWT access and refresh tokens.
- Rotate refresh tokens.
- Store refresh token hashes, not raw tokens.
- Rate-limit auth and AI endpoints.
- Validate all request payloads.
- Enforce ownership checks on every entity.
- Use Prisma to avoid SQL injection.
- Store files outside public web root.
- Generate secure document download URLs through backend authorization.
- Add Helmet security headers.
- Add CORS allowlist.
- Add audit logs for sensitive actions.
- Hide internal error details from API responses.
- Treat LLM/document content as untrusted.

## 14. Error Handling Plan

Use consistent error response shape:

```json
{
  "error": {
    "code": "COMPANY_NOT_FOUND",
    "message": "Company not found.",
    "details": {}
  }
}
```

Common error codes:

- `UNAUTHORIZED`
- `FORBIDDEN`
- `VALIDATION_ERROR`
- `NOT_FOUND`
- `CONFLICT`
- `FILE_TOO_LARGE`
- `UNSUPPORTED_FILE_TYPE`
- `AI_PROCESSING_FAILED`
- `RATE_LIMITED`
- `INTERNAL_ERROR`

## 15. Testing Plan

## 15.1 Unit Tests

Prioritize:

- Auth service.
- Role and permission guards.
- Matching score service.
- Valuation services.
- Readiness scoring service.
- Claim verification mapping logic.
- Settings validation.

## 15.2 Integration Tests

Prioritize:

- Register/login.
- Create company.
- Upload document metadata.
- Run valuation.
- Create investor preferences.
- Generate matches.
- Save startup to pipeline.
- Admin approval flow.

## 15.3 E2E API Tests

Critical MVP paths:

1. Founder registers, creates company, submits for review.
2. Admin approves company.
3. Investor registers, creates preferences.
4. Matching job creates investor-startup match.
5. Investor saves startup to pipeline.
6. Investor generates memo.

## 16. Seed Data Plan

Seed:

- Admin user.
- Default roles.
- Default permissions.
- Default sectors.
- Default startup stages.
- Default business models.
- Default countries.
- Default document categories.
- Default matching weights.
- Default readiness weights.
- Default valuation assumptions.

Required seed admin:

```text
email: admin@example.com
password: ChangeMe123!
role: ADMIN
status: active
```

The password must be changed before production.

## 17. Development Phases

## Phase 1: Backend Foundation

Deliverables:

- NestJS app.
- Config module.
- Prisma setup.
- MySQL connection.
- Health endpoints.
- Auth module.
- User/role model.
- Seed admin.
- Basic test setup.

Acceptance criteria:

- API starts locally.
- Health endpoint works.
- Prisma migration runs.
- Admin seed user can log in.

## Phase 2: RBAC and Admin Base

Deliverables:

- Role guards.
- Permission guards.
- Admin user APIs.
- Organization base APIs.
- Audit logging base.

Acceptance criteria:

- Admin can list users.
- Non-admin users cannot access admin endpoints.
- Sensitive actions create audit logs.

## Phase 3: Founder and Investor Profiles

Deliverables:

- Founder profile APIs.
- Investor profile APIs.
- Investor preferences APIs.
- Organization membership APIs.

Acceptance criteria:

- Founder can create profile.
- Investor can create profile and preferences.
- Investor organization can have members.

## Phase 4: Company and Metrics

Deliverables:

- Company APIs.
- Team APIs.
- Metrics APIs.
- Fundraising APIs.
- Admin company approval APIs.

Acceptance criteria:

- Founder can create and submit company.
- Admin can approve or reject company.
- Investor sees approved companies only.

## Phase 5: Documents

Deliverables:

- Upload APIs.
- Document metadata.
- Local file storage.
- Document access control.
- Extraction queue stub.

Acceptance criteria:

- Founder can upload document.
- Unauthorized user cannot download private document.
- Document processing job can be queued.

## Phase 6: LLM Extraction

Deliverables:

- LLM service.
- Structured output schemas.
- Text extraction from PDF/DOCX/XLSX/CSV.
- Document extraction jobs.
- LLM run logs.

Acceptance criteria:

- Uploaded pitch deck text can be extracted.
- LLM returns structured JSON.
- Extraction result is stored.
- Failed LLM run is logged.

## Phase 7: Diligence Engine

Deliverables:

- Claim detection.
- Claim verification.
- Red flag detection.
- Admin overrides.

Acceptance criteria:

- System identifies claims.
- System assigns verification statuses.
- Admin can override.
- Red flags appear on company detail.

## Phase 8: Valuation and Readiness

Deliverables:

- Valuation formula services.
- SAFE calculator.
- Readiness scoring.
- Founder recommendations.

Acceptance criteria:

- Company receives valuation range.
- Company receives readiness score.
- Founder sees missing action items.

## Phase 9: Matching

Deliverables:

- Matching matrix.
- LLM thesis similarity.
- Match storage.
- Match refresh jobs.
- Founder matched investors API.
- Investor matched startups API.

Acceptance criteria:

- Investor preferences create startup matches.
- Startup profiles create investor matches.
- Match score includes deterministic and LLM components.

## Phase 10: Pipeline, Memos, Requests, Notifications

Deliverables:

- Deal pipeline APIs.
- Notes.
- Memo generation.
- Information requests.
- In-app notifications.

Acceptance criteria:

- Investor can save startup to pipeline.
- Investor can generate memo.
- Investor can request information.
- Founder can respond.
- Notifications are created.

## Phase 11: Admin Settings and Hardening

Deliverables:

- Settings APIs.
- Matching weight configuration.
- Readiness weight configuration.
- Valuation assumption configuration.
- Audit log UI support endpoints.
- Rate limiting.
- Production migration path.

Acceptance criteria:

- Admin can control scoring settings.
- Backend uses admin settings in calculations.
- Main MVP paths pass tests.

## 18. Backend MVP Completion Checklist

The backend MVP is complete when:

- All role-based authentication works.
- Admin can control users, startups, investors, organizations, and settings.
- Founders can create company profiles and upload documents.
- Investors can create profiles and preferences.
- Companies can be submitted and approved.
- AI extraction works through background jobs.
- Claim verification and red flags are stored.
- Valuation and readiness calculations run.
- Matching works both ways.
- Investor pipeline works.
- Investment memos can be generated.
- Information requests work.
- Notifications work.
- Audit logs are created.
- Core tests pass.

## 19. Research Notes and References

Backend choices are based on:

- NestJS official documentation patterns for modules, guards, validation, and application structure.
- Prisma documentation for MySQL connector and Prisma Migrate. Prisma Migrate keeps schema changes in sync and creates migration history for development and production.
- BullMQ documentation for Redis-backed queues and workers for long-running jobs.
- OpenAI Structured Outputs documentation, which supports JSON-schema-constrained model responses and helps avoid malformed LLM output for extraction and analysis tasks.
- OWASP API security principles for authentication, authorization, validation, and access control.

Useful references:

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Migrate](https://www.prisma.io/docs/orm/prisma-migrate)
- [Prisma MySQL Connector](https://www.prisma.io/docs/v6/orm/overview/databases/mysql)
- [BullMQ Queues](https://docs.bullmq.io/guide/queues)
- [OpenAI Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs?lang=javascript)
- [OWASP API Security Project](https://owasp.org/www-project-api-security/)
