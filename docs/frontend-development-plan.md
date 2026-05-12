# Frontend Development Plan

## Project

**Working name:** VC Intelligence & Startup Diligence Platform  
**Frontend stack:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query, React Hook Form, Zod  
**Backend dependency:** `docs/backend-development-plan.md`  
**Product requirements dependency:** `docs/software-engineering-requirements.md`  
**Purpose:** This document defines the complete frontend development plan, routes, screens, layouts, components, API integration strategy, role-based access, and implementation phases for the MVP.

## 1. Frontend Goals

The frontend must provide a complete SaaS experience for three main user types:

1. **Admin:** Full control over users, startups, investors, organizations, settings, AI outputs, approvals, and audit logs.
2. **Entrepreneur / Founder:** Create startup profile, upload documents, receive readiness feedback, view investor matches, and respond to investor requests.
3. **Investor:** Create investor profile, define preferences, discover matched startups, review diligence data, manage deal pipeline, request information, and generate memos.

The frontend must match the backend API design in `docs/backend-development-plan.md` and must be built so each feature can be connected to the backend incrementally.

## 2. Frontend Architecture Decision

Use a React single-page application for the MVP.

Recommended stack:

- **React** for UI.
- **TypeScript** for type safety.
- **Vite** for fast local development.
- **Tailwind CSS** for styling.
- **shadcn/ui** for accessible UI primitives.
- **React Router** for client-side routing.
- **React Query** for server-state fetching and caching.
- **React Hook Form** for forms.
- **Zod** for frontend validation schemas.
- **Recharts** for charts and dashboard visualizations.
- **Lucide React** for icons.

Recommended app location:

```text
apps/
  web/
```

## 3. Frontend Product Principles

1. Build the actual SaaS application, not a marketing landing page.
2. Dashboards should be practical, dense, and useful for repeated work.
3. The UI should feel like a professional investor workflow tool.
4. Avoid decorative complexity that slows down development.
5. Every AI output must show that it is preliminary and reviewable.
6. Every role must only see screens and actions they are allowed to use.
7. The frontend must not enforce security alone; backend authorization remains final.
8. Forms should save progress where practical.
9. Expensive AI actions should show job status and completion feedback.
10. The first MVP should favor clarity, reliability, and end-to-end workflows.

## 4. Visual Design Direction

The application should feel like a serious private-market intelligence product.

Design qualities:

- Clean.
- Professional.
- Data-dense.
- Calm.
- Trustworthy.
- Fast to scan.
- Built for analysts, founders, and fund managers.

Avoid:

- Marketing-style hero pages as the main product experience.
- Oversized decorative cards.
- One-note purple/blue gradient-heavy design.
- Decorative blobs or abstract backgrounds.
- UI copy that explains obvious functionality.
- Overly playful styling for diligence screens.

Preferred UI patterns:

- Sidebar navigation for authenticated areas.
- Top bar with account, organization, notifications, and search.
- Tables for admin and investor workflows.
- Stepper or tabbed forms for long profiles.
- Status badges for approvals, AI jobs, readiness, and risk.
- Tabs for startup detail sections.
- Drawers or modals for quick edits and notes.
- Cards only for repeated items, summaries, and contained tools.
- Compact charts for pipeline, sector, score, and activity summaries.

## 5. App Structure

Recommended file structure:

```text
apps/
  web/
    src/
      main.tsx
      app/
        App.tsx
        router.tsx
        providers.tsx
      config/
        env.ts
        routes.ts
      lib/
        api-client.ts
        auth.ts
        query-client.ts
        format.ts
        permissions.ts
        constants.ts
      components/
        ui/
        layout/
        auth/
        data-display/
        forms/
        dashboards/
        documents/
        ai/
        valuation/
        matching/
        pipeline/
        memos/
      features/
        auth/
        admin/
        founder/
        investor/
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
        settings/
        audit/
      pages/
        public/
        auth/
        admin/
        founder/
        investor/
        shared/
      hooks/
      types/
      styles/
        globals.css
```

## 6. Environment Variables

Required frontend `.env`:

```text
VITE_API_BASE_URL=http://localhost:4000/api/v1
VITE_APP_NAME=VC Intelligence
VITE_APP_REGION=Malaysia and Southeast Asia
```

Optional later:

```text
VITE_ENABLE_EMAIL_AUTH=true
VITE_ENABLE_DEMO_MODE=false
VITE_ENABLE_ANALYTICS=false
```

## 7. Local Frontend Setup Instructions

## 7.1 Prerequisites

Install:

- Node.js LTS.
- pnpm.
- Backend API running on `http://localhost:4000`.

## 7.2 Install Dependencies

From `apps/web`:

```bash
pnpm install
```

Recommended dependencies:

```bash
pnpm add react react-dom react-router-dom
pnpm add @tanstack/react-query
pnpm add react-hook-form zod @hookform/resolvers
pnpm add lucide-react
pnpm add recharts
pnpm add clsx tailwind-merge class-variance-authority
pnpm add date-fns
pnpm add sonner

pnpm add -D vite typescript @vitejs/plugin-react
pnpm add -D tailwindcss postcss autoprefixer
pnpm add -D eslint prettier
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

Add shadcn/ui after Tailwind is configured:

```bash
pnpm dlx shadcn@latest init
```

Suggested shadcn components:

```bash
pnpm dlx shadcn@latest add button input textarea select checkbox radio-group switch tabs table badge card dialog drawer dropdown-menu form alert separator progress skeleton tooltip sheet popover command calendar
```

## 7.3 Start Frontend

```bash
pnpm run dev
```

Expected local URL:

```text
http://localhost:5173
```

## 8. API Client Plan

Create one API client wrapper in:

```text
src/lib/api-client.ts
```

Responsibilities:

- Prefix requests with `VITE_API_BASE_URL`.
- Attach access token.
- Refresh token when access token expires.
- Normalize backend error responses.
- Support JSON requests.
- Support multipart document upload.
- Handle unauthorized redirects.
- Avoid exposing raw tokens to UI components.

Backend error shape expected:

```json
{
  "error": {
    "code": "COMPANY_NOT_FOUND",
    "message": "Company not found.",
    "details": {}
  }
}
```

Frontend error display:

- Form validation errors near fields.
- Toast for successful actions.
- Inline alerts for page-level errors.
- Empty states for missing data.
- Retry buttons for failed AI jobs or data fetches.

## 9. Authentication and Session Plan

## 9.1 Auth Screens

Routes:

- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/verify-email`

Screens:

- Login form.
- Registration form with role selection: founder or investor.
- Forgot password form.
- Reset password form.
- Email verification status page.

Auth APIs:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/verify-email`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `GET /api/v1/auth/me`

## 9.2 Session State

Frontend must store:

- Current user.
- Roles.
- Organization memberships.
- Profile status.
- Access token.
- Refresh token if backend uses client-managed refresh.

Preferred storage:

- Access token in memory if possible.
- Refresh token in secure HTTP-only cookie if backend supports it.
- If MVP uses local storage, isolate token logic in `auth.ts` so it can be changed later.

## 9.3 Role-Based Redirects

After login:

- Admin goes to `/admin`.
- Founder goes to `/founder`.
- Investor goes to `/investor`.

If profile setup is incomplete:

- Founder goes to `/founder/onboarding`.
- Investor goes to `/investor/onboarding`.

## 10. Route Plan

## 10.1 Public Routes

```text
/
/login
/register
/forgot-password
/reset-password
/verify-email
```

The root page may redirect logged-in users to their dashboard. For MVP, it can be a simple product entry page with login/register actions.

## 10.2 Admin Routes

```text
/admin
/admin/users
/admin/users/:userId
/admin/organizations
/admin/organizations/:organizationId
/admin/companies
/admin/companies/:companyId
/admin/ai-runs
/admin/ai-runs/:runId
/admin/claims
/admin/matches
/admin/audit-logs
/admin/settings
/admin/settings/options
/admin/settings/matching-weights
/admin/settings/readiness-weights
/admin/settings/valuation-assumptions
```

## 10.3 Founder Routes

```text
/founder
/founder/onboarding
/founder/profile
/founder/company
/founder/company/team
/founder/company/metrics
/founder/company/fundraising
/founder/company/documents
/founder/company/ai-feedback
/founder/company/valuation
/founder/company/readiness
/founder/matched-investors
/founder/requests
/founder/requests/:requestId
/founder/notifications
```

## 10.4 Investor Routes

```text
/investor
/investor/onboarding
/investor/profile
/investor/organization
/investor/preferences
/investor/discover
/investor/startups/:companyId
/investor/matched-startups
/investor/pipeline
/investor/pipeline/:pipelineItemId
/investor/memos
/investor/memos/:memoId
/investor/requests
/investor/requests/:requestId
/investor/notifications
```

## 10.5 Shared Authenticated Routes

```text
/account
/account/security
/notifications
```

## 11. Layout Plan

## 11.1 Authenticated Shell

Authenticated layout must include:

- Sidebar navigation.
- Top bar.
- Breadcrumbs where useful.
- Current organization switcher for investors.
- Notification icon.
- User menu.
- Main content region.
- Mobile responsive sidebar drawer.

## 11.2 Admin Layout

Admin navigation:

- Dashboard.
- Users.
- Organizations.
- Startups.
- AI Review.
- Claims.
- Matches.
- Audit Logs.
- Settings.

## 11.3 Founder Layout

Founder navigation:

- Dashboard.
- Founder Profile.
- Company Profile.
- Team.
- Metrics.
- Fundraising.
- Data Room.
- AI Feedback.
- Readiness.
- Matched Investors.
- Requests.

## 11.4 Investor Layout

Investor navigation:

- Dashboard.
- Profile.
- Organization.
- Preferences.
- Discover.
- Matched Startups.
- Pipeline.
- Memos.
- Requests.

## 12. Shared Component Plan

## 12.1 Layout Components

- `AppShell`
- `SidebarNav`
- `TopBar`
- `Breadcrumbs`
- `UserMenu`
- `NotificationBell`
- `RoleGate`
- `PageHeader`
- `PageSection`

## 12.2 Data Display Components

- `DataTable`
- `MetricCard`
- `StatusBadge`
- `RiskBadge`
- `ScoreRing`
- `ScoreBar`
- `EmptyState`
- `LoadingState`
- `ErrorState`
- `ConfirmDialog`
- `DetailList`
- `Timeline`
- `ActivityFeed`

## 12.3 Form Components

- `TextField`
- `TextareaField`
- `SelectField`
- `MultiSelectField`
- `CurrencyField`
- `NumberField`
- `DateField`
- `UrlField`
- `FileDropzone`
- `FormStepper`
- `FormSection`
- `SaveBar`

## 12.4 AI Components

- `AiStatusBadge`
- `AiRunStatusPanel`
- `AiDisclaimer`
- `ExtractionResultPanel`
- `ClaimVerificationTable`
- `RedFlagList`
- `FounderRecommendationList`
- `MemoPreview`

## 12.5 Matching Components

- `MatchScoreBadge`
- `MatchFactorBreakdown`
- `MatchReasonPanel`
- `InvestorCard`
- `StartupCard`
- `MatchFilters`

## 12.6 Valuation Components

- `ValuationRangeCard`
- `ValuationMethodTabs`
- `ValuationAssumptionsPanel`
- `SafeDilutionCalculator`
- `ReasonablenessBadge`

## 12.7 Pipeline Components

- `PipelineBoard`
- `PipelineStageColumn`
- `PipelineItemCard`
- `PipelineNoteList`
- `PipelineStageSelect`
- `NextActionPicker`

## 13. Admin Frontend Plan

## 13.1 Admin Dashboard

Route:

- `/admin`

APIs:

- `GET /api/v1/admin/dashboard/summary`
- `GET /api/v1/admin/dashboard/pending-actions`
- `GET /api/v1/admin/dashboard/risk-summary`

Widgets:

- Total users.
- Total founders.
- Total investors.
- Total startups.
- Pending user approvals.
- Pending organization approvals.
- Pending startup approvals.
- High-risk startups.
- Recent LLM runs.
- Match generation activity.
- Recent audit events.

Actions:

- Review pending startup.
- Review investor organization.
- Open high-risk company.
- Open AI review item.

## 13.2 Admin Users

Routes:

- `/admin/users`
- `/admin/users/:userId`

APIs:

- `GET /api/v1/admin/users`
- `GET /api/v1/admin/users/:userId`
- `PATCH /api/v1/admin/users/:userId/status`
- `PATCH /api/v1/admin/users/:userId/roles`
- `DELETE /api/v1/admin/users/:userId`

Features:

- Search users.
- Filter by role.
- Filter by status.
- View user details.
- Approve, suspend, deactivate, or reactivate user.
- Update roles.
- Soft-delete user.

## 13.3 Admin Organizations

Routes:

- `/admin/organizations`
- `/admin/organizations/:organizationId`

APIs:

- `GET /api/v1/admin/organizations`
- `PATCH /api/v1/admin/organizations/:organizationId/status`
- `GET /api/v1/organizations/:organizationId`
- `GET /api/v1/organizations/:organizationId/members`

Features:

- List investor organizations.
- Review pending organizations.
- Approve, suspend, or reject organizations.
- View organization members.
- View organization investor preferences.

## 13.4 Admin Companies

Routes:

- `/admin/companies`
- `/admin/companies/:companyId`

APIs:

- `GET /api/v1/admin/companies`
- `GET /api/v1/admin/companies/:companyId`
- `PATCH /api/v1/admin/companies/:companyId/status`
- `PATCH /api/v1/admin/companies/:companyId/visibility`
- `GET /api/v1/companies/:companyId/claims`
- `GET /api/v1/companies/:companyId/red-flags`
- `GET /api/v1/companies/:companyId/valuation/latest`
- `GET /api/v1/companies/:companyId/readiness/latest`

Features:

- Company approval queue.
- Company detail tabs.
- Profile review.
- Document review.
- Claims review.
- Red flag review.
- Readiness review.
- Valuation review.
- Visibility control.
- Return for founder changes.

## 13.5 Admin AI Runs

Routes:

- `/admin/ai-runs`
- `/admin/ai-runs/:runId`

APIs:

- `GET /api/v1/admin/ai/runs`
- `GET /api/v1/admin/ai/runs/:runId`

Features:

- List AI runs.
- Filter by task type.
- Filter by status.
- View prompt version.
- View input summary.
- View output JSON.
- View errors.
- View token usage if provided.

## 13.6 Admin Claims and Red Flags

Routes:

- `/admin/claims`
- `/admin/companies/:companyId`

APIs:

- `GET /api/v1/companies/:companyId/claims`
- `PATCH /api/v1/admin/claims/:claimId/override`
- `PATCH /api/v1/admin/red-flags/:redFlagId`

Features:

- Review claim verification results.
- Override status.
- Add admin note.
- Update red flag severity or visibility.

## 13.7 Admin Matches

Route:

- `/admin/matches`

APIs:

- `GET /api/v1/admin/matches`
- `GET /api/v1/matches/:matchId`

Features:

- View platform-wide matches.
- Filter by investor, company, fit level, sector, stage, score.
- Inspect match factor breakdown.

## 13.8 Admin Settings

Routes:

- `/admin/settings`
- `/admin/settings/options`
- `/admin/settings/matching-weights`
- `/admin/settings/readiness-weights`
- `/admin/settings/valuation-assumptions`

APIs:

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

Features:

- Manage sectors.
- Manage startup stages.
- Manage countries.
- Manage document categories.
- Manage business models.
- Edit matching weights.
- Edit readiness weights.
- Edit valuation assumptions.

## 13.9 Admin Audit Logs

Route:

- `/admin/audit-logs`

APIs:

- `GET /api/v1/admin/audit-logs`
- `GET /api/v1/admin/audit-logs/:auditLogId`

Features:

- Filter by user, entity type, action, date range.
- View audit detail.
- Export later if backend supports it.

## 14. Founder Frontend Plan

## 14.1 Founder Dashboard

Route:

- `/founder`

APIs:

- `GET /api/v1/founder/dashboard/summary`
- `GET /api/v1/founder/dashboard/recommendations`
- `GET /api/v1/founder/dashboard/investor-interest`

Widgets:

- Profile completion.
- Company approval status.
- Readiness score.
- Missing documents.
- Valuation status.
- Investor matches.
- Investor interest.
- Open information requests.
- Recommended next actions.

Actions:

- Continue profile setup.
- Upload document.
- Run AI diligence.
- View matched investors.
- Respond to request.

## 14.2 Founder Onboarding

Route:

- `/founder/onboarding`

Steps:

1. Founder profile.
2. Company basics.
3. Team.
4. Metrics.
5. Fundraising.
6. Documents.
7. Review and submit.

APIs:

- `PUT /api/v1/founder/profile`
- `POST /api/v1/companies`
- `POST /api/v1/companies/:companyId/team`
- `PUT /api/v1/companies/:companyId/metrics`
- `PUT /api/v1/companies/:companyId/fundraising`
- `POST /api/v1/companies/:companyId/documents`
- `POST /api/v1/companies/:companyId/submit`

Features:

- Stepper navigation.
- Save progress.
- Field validation.
- Completion checklist.
- Review screen before submission.

## 14.3 Founder Profile

Route:

- `/founder/profile`

APIs:

- `GET /api/v1/founder/profile`
- `PUT /api/v1/founder/profile`
- `PATCH /api/v1/founder/profile`

Fields:

- Full name.
- Phone.
- Country.
- City.
- LinkedIn.
- Role.
- Biography.
- Experience summary.
- Education.
- Previous companies.

## 14.4 Company Profile

Routes:

- `/founder/company`
- `/founder/company/team`
- `/founder/company/metrics`
- `/founder/company/fundraising`

APIs:

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

Features:

- Company basics form.
- Team management table.
- Metrics form.
- Fundraising form.
- Profile completion indicator.
- Submit for admin review.

## 14.5 Founder Data Room

Route:

- `/founder/company/documents`

APIs:

- `POST /api/v1/companies/:companyId/documents`
- `GET /api/v1/companies/:companyId/documents`
- `GET /api/v1/documents/:documentId`
- `GET /api/v1/documents/:documentId/download`
- `PATCH /api/v1/documents/:documentId`
- `DELETE /api/v1/documents/:documentId`
- `POST /api/v1/documents/:documentId/process`
- `GET /api/v1/documents/:documentId/extraction`

Features:

- File upload dropzone.
- Document category selector.
- Document visibility selector.
- Document table.
- Processing status.
- Extraction result preview.
- Reprocess action.
- Missing document checklist.

## 14.6 Founder AI Feedback

Route:

- `/founder/company/ai-feedback`

APIs:

- `POST /api/v1/companies/:companyId/ai/run-extraction`
- `POST /api/v1/companies/:companyId/ai/run-diligence`
- `GET /api/v1/companies/:companyId/ai/status`
- `GET /api/v1/companies/:companyId/claims`
- `GET /api/v1/companies/:companyId/red-flags`

Features:

- AI processing status.
- Claim verification summary.
- Red flag list.
- Missing evidence.
- Recommended founder actions.
- Run or rerun AI analysis.

## 14.7 Founder Readiness and Valuation

Routes:

- `/founder/company/readiness`
- `/founder/company/valuation`

APIs:

- `POST /api/v1/companies/:companyId/readiness/calculate`
- `GET /api/v1/companies/:companyId/readiness/latest`
- `POST /api/v1/companies/:companyId/valuation/run`
- `GET /api/v1/companies/:companyId/valuation/latest`
- `GET /api/v1/companies/:companyId/valuation/runs`
- `POST /api/v1/valuation/safe-calculator`

Features:

- Readiness score.
- Category score breakdown.
- Readiness label.
- Recommended next actions.
- Valuation range.
- Valuation reasonableness badge.
- Valuation assumptions.
- SAFE/dilution calculator.

## 14.8 Founder Matched Investors

Route:

- `/founder/matched-investors`

APIs:

- `GET /api/v1/companies/:companyId/matched-investors`
- `POST /api/v1/companies/:companyId/matches/refresh`
- `GET /api/v1/matches/:matchId`
- `PATCH /api/v1/matches/:matchId/status`

Features:

- Matched investor cards.
- Fit score.
- Fit explanation.
- Matched criteria.
- Weak criteria.
- Investor profile summary.
- Refresh matches.
- Mark viewed or dismissed.

## 14.9 Founder Requests

Routes:

- `/founder/requests`
- `/founder/requests/:requestId`

APIs:

- `GET /api/v1/requests`
- `GET /api/v1/requests/:requestId`
- `POST /api/v1/requests/:requestId/responses`
- `POST /api/v1/requests/:requestId/documents`

Features:

- Request list.
- Request detail.
- Response form.
- Attach document.
- Request status display.

## 15. Investor Frontend Plan

## 15.1 Investor Dashboard

Route:

- `/investor`

APIs:

- `GET /api/v1/investor/dashboard/summary`
- `GET /api/v1/investor/dashboard/recommendations`
- `GET /api/v1/investor/dashboard/pipeline-summary`

Widgets:

- New matched startups.
- High-fit startup recommendations.
- Saved startups.
- Pipeline by stage.
- Pending founder responses.
- Recent memos.
- Sector distribution.
- Stage distribution.

Actions:

- View matched startups.
- Open pipeline.
- Generate memo.
- Request information.

## 15.2 Investor Onboarding

Route:

- `/investor/onboarding`

Steps:

1. Investor profile.
2. Organization creation or join.
3. Investment preferences.
4. Thesis.
5. Review.

APIs:

- `PUT /api/v1/investor/profile`
- `POST /api/v1/organizations`
- `PUT /api/v1/investor/preferences`

Features:

- Stepper form.
- Investment preference builder.
- Thesis editor.
- Ticket size range inputs.
- Sector/stage/geography multi-selects.

## 15.3 Investor Profile and Organization

Routes:

- `/investor/profile`
- `/investor/organization`
- `/investor/preferences`

APIs:

- `GET /api/v1/investor/profile`
- `PUT /api/v1/investor/profile`
- `PATCH /api/v1/investor/profile`
- `GET /api/v1/investor/preferences`
- `PUT /api/v1/investor/preferences`
- `PATCH /api/v1/investor/preferences`
- `GET /api/v1/organizations/:organizationId`
- `PATCH /api/v1/organizations/:organizationId`
- `GET /api/v1/organizations/:organizationId/members`
- `POST /api/v1/organizations/:organizationId/invitations`
- `PATCH /api/v1/organizations/:organizationId/members/:memberId/role`
- `DELETE /api/v1/organizations/:organizationId/members/:memberId`

Features:

- Investor profile form.
- Organization profile form.
- Team member management.
- Preferences editor.
- Thesis editor.

## 15.4 Investor Discovery

Routes:

- `/investor/discover`
- `/investor/startups/:companyId`

APIs:

- `GET /api/v1/companies`
- `GET /api/v1/companies/:companyId`
- `GET /api/v1/companies/:companyId/claims`
- `GET /api/v1/companies/:companyId/red-flags`
- `GET /api/v1/companies/:companyId/valuation/latest`
- `GET /api/v1/companies/:companyId/readiness/latest`
- `GET /api/v1/companies/:companyId/documents`

Features:

- Startup search.
- Filters by sector, stage, country, revenue, readiness, risk.
- Startup cards.
- Startup detail page with tabs:
  - Overview.
  - Team.
  - Metrics.
  - Fundraising.
  - AI diligence.
  - Claims.
  - Red flags.
  - Valuation.
  - Documents.
  - Memos.
  - Requests.
- Save to pipeline action.
- Request information action.
- Generate memo action.

## 15.5 Investor Matched Startups

Route:

- `/investor/matched-startups`

APIs:

- `GET /api/v1/investor/matched-startups`
- `POST /api/v1/matches/refresh`
- `GET /api/v1/matches/:matchId`
- `PATCH /api/v1/matches/:matchId/status`

Features:

- Ranked matched startup list.
- Match score.
- Match factor breakdown.
- AI thesis fit explanation.
- Save to pipeline.
- Dismiss match.

## 15.6 Investor Pipeline

Routes:

- `/investor/pipeline`
- `/investor/pipeline/:pipelineItemId`

APIs:

- `GET /api/v1/pipeline`
- `POST /api/v1/pipeline/items`
- `GET /api/v1/pipeline/items/:pipelineItemId`
- `PATCH /api/v1/pipeline/items/:pipelineItemId`
- `DELETE /api/v1/pipeline/items/:pipelineItemId`
- `GET /api/v1/pipeline/items/:pipelineItemId/notes`
- `POST /api/v1/pipeline/items/:pipelineItemId/notes`
- `PATCH /api/v1/pipeline/notes/:noteId`
- `DELETE /api/v1/pipeline/notes/:noteId`

Features:

- Kanban pipeline board.
- Stage columns.
- Pipeline item detail.
- Owner assignment.
- Rating.
- Next action date.
- Internal notes.
- Archive item.

## 15.7 Investor Memos

Routes:

- `/investor/memos`
- `/investor/memos/:memoId`

APIs:

- `POST /api/v1/companies/:companyId/memos`
- `GET /api/v1/companies/:companyId/memos`
- `GET /api/v1/memos/:memoId`
- `PATCH /api/v1/memos/:memoId`
- `POST /api/v1/memos/:memoId/regenerate`
- `GET /api/v1/memos/:memoId/export`

Features:

- Memo list.
- Memo detail.
- Memo generation progress.
- Edit memo title/content.
- Regenerate memo.
- Export memo as markdown/plain text.

## 15.8 Investor Requests

Routes:

- `/investor/requests`
- `/investor/requests/:requestId`

APIs:

- `POST /api/v1/companies/:companyId/requests`
- `GET /api/v1/requests`
- `GET /api/v1/requests/:requestId`
- `PATCH /api/v1/requests/:requestId/status`

Features:

- Request list.
- Create request from startup detail.
- Request detail.
- Founder response display.
- Mark resolved or closed.

## 16. Notification Frontend Plan

Routes:

- `/notifications`
- `/founder/notifications`
- `/investor/notifications`

APIs:

- `GET /api/v1/notifications`
- `PATCH /api/v1/notifications/:notificationId/read`
- `PATCH /api/v1/notifications/read-all`

Features:

- Notification bell count.
- Notification dropdown.
- Notification page.
- Mark one as read.
- Mark all as read.
- Deep links to relevant page.

## 17. Frontend State Management Plan

Use React Query for server state.

Query key examples:

```text
auth.me
admin.users
admin.organizations
admin.companies
admin.settings
founder.profile
founder.dashboard
investor.profile
investor.preferences
companies.list
companies.detail
company.documents
company.claims
company.valuation.latest
company.readiness.latest
matches.founder
matches.investor
pipeline.items
memos.list
requests.list
notifications.list
```

Use local component state for:

- Dialog open/closed.
- Form stepper current step.
- Temporary filters before apply.
- Unsaved draft fields.

Avoid global state unless needed. If global state is required, use a small Zustand store only for:

- UI sidebar state.
- Current selected organization.
- Temporary auth state if not handled by React Query.

## 18. Forms and Validation Plan

Use React Hook Form and Zod.

Required form schemas:

- Login.
- Register.
- Forgot password.
- Reset password.
- Founder profile.
- Investor profile.
- Organization profile.
- Investor preferences.
- Company basics.
- Company team member.
- Company metrics.
- Fundraising.
- Document upload metadata.
- Claim manual creation.
- Valuation SAFE calculator.
- Pipeline note.
- Information request.
- Founder request response.
- Admin settings.

Form requirements:

- Show field-level validation.
- Prevent accidental submit while saving.
- Show save success state.
- Show unsaved changes warning for long forms where practical.
- Use backend errors in form fields when possible.

## 19. Table and Filtering Plan

Tables needed:

- Admin users.
- Admin organizations.
- Admin companies.
- Admin AI runs.
- Admin matches.
- Admin audit logs.
- Company documents.
- Company claims.
- Red flags.
- Investor startup discovery.
- Pipeline items.
- Memos.
- Requests.

Table features:

- Search.
- Filters.
- Sort.
- Pagination.
- Empty states.
- Row actions.
- Responsive horizontal overflow for dense data.

## 20. AI UX Plan

AI actions are asynchronous and must be shown clearly.

AI status states:

- Not run.
- Queued.
- Processing.
- Complete.
- Failed.
- Needs review.

AI UI requirements:

- Show status badge.
- Show last run timestamp.
- Show source documents where available.
- Show confidence scores where available.
- Show "requires human review" disclaimer.
- Show retry action for failed jobs.
- Avoid presenting AI output as final investment advice.

AI screens:

- Founder AI feedback.
- Admin AI run detail.
- Investor diligence tab.
- Claim verification table.
- Memo generation page.
- Match explanation panel.

## 21. Startup Detail Page Plan

Startup detail should be shared between admin and investor, with role-specific actions.

Tabs:

- Overview.
- Team.
- Metrics.
- Fundraising.
- Documents.
- AI Diligence.
- Claims.
- Red Flags.
- Valuation.
- Readiness.
- Matches, admin only.
- Memos, investor only.
- Requests, investor/founder.

Admin actions:

- Approve.
- Reject.
- Hide.
- Return for changes.
- Override claim.
- Update red flag.

Investor actions:

- Save to pipeline.
- Generate memo.
- Request information.
- Download accessible document.

Founder actions:

- Edit profile.
- Upload document.
- Run AI analysis.
- Submit for review.

## 22. Access Control Plan

Create route guards:

- `RequireAuth`
- `RequireRole`
- `RequireProfileComplete`
- `RequireOrganization`

Frontend route access:

- Admin routes require admin role.
- Founder routes require founder role.
- Investor routes require investor role.
- Shared account routes require authentication.

Important:

Frontend route guards are for user experience only. Backend must still enforce authorization.

## 23. Loading, Empty, and Error States

Every route should define:

- Loading state.
- Empty state.
- Error state.
- Permission denied state.
- Retry action where appropriate.

Examples:

- No matched startups yet.
- No documents uploaded.
- No pipeline items.
- AI analysis not run yet.
- Startup not approved.
- Organization pending approval.

## 24. Responsive Design Plan

Desktop first, but usable on tablet and mobile.

Desktop:

- Sidebar always visible.
- Dense tables and dashboard cards.
- Two-column detail layouts where useful.

Tablet:

- Sidebar collapsible.
- Tables scroll horizontally.
- Forms remain single or two-column depending on width.

Mobile:

- Sidebar in drawer.
- Dashboard cards stack.
- Dense tables become simplified lists where necessary.
- Avoid overflowing buttons and labels.

## 25. Frontend Security Plan

Frontend must:

- Never trust role data without backend confirmation.
- Never show private document links without API authorization.
- Never store secrets in frontend environment variables.
- Sanitize or safely render AI-generated text.
- Avoid rendering AI output as raw HTML.
- Use HTTPS in production.
- Avoid logging tokens.
- Clear auth state on logout.
- Redirect users when token refresh fails.

## 26. API Integration Map

## 26.1 Auth

Frontend feature:

- Login, register, session, password reset.

Backend APIs:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/verify-email`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `GET /api/v1/auth/me`

## 26.2 Admin

Frontend feature:

- Admin dashboard, users, organizations, companies, AI runs, settings, audit.

Backend APIs:

- `GET /api/v1/admin/dashboard/summary`
- `GET /api/v1/admin/dashboard/pending-actions`
- `GET /api/v1/admin/dashboard/risk-summary`
- `GET /api/v1/admin/users`
- `GET /api/v1/admin/users/:userId`
- `PATCH /api/v1/admin/users/:userId/status`
- `PATCH /api/v1/admin/users/:userId/roles`
- `DELETE /api/v1/admin/users/:userId`
- `GET /api/v1/admin/organizations`
- `PATCH /api/v1/admin/organizations/:organizationId/status`
- `GET /api/v1/admin/companies`
- `GET /api/v1/admin/companies/:companyId`
- `PATCH /api/v1/admin/companies/:companyId/status`
- `PATCH /api/v1/admin/companies/:companyId/visibility`
- `GET /api/v1/admin/ai/runs`
- `GET /api/v1/admin/ai/runs/:runId`
- `GET /api/v1/admin/matches`
- `GET /api/v1/admin/audit-logs`
- `GET /api/v1/admin/audit-logs/:auditLogId`
- `GET /api/v1/admin/settings`
- `PATCH /api/v1/admin/settings/:key`

## 26.3 Founder

Frontend feature:

- Founder profile, company profile, data room, AI feedback, matches, requests.

Backend APIs:

- `GET /api/v1/founder/dashboard/summary`
- `GET /api/v1/founder/dashboard/recommendations`
- `GET /api/v1/founder/dashboard/investor-interest`
- `GET /api/v1/founder/profile`
- `PUT /api/v1/founder/profile`
- `PATCH /api/v1/founder/profile`
- `POST /api/v1/companies`
- `GET /api/v1/companies/:companyId`
- `PATCH /api/v1/companies/:companyId`
- `POST /api/v1/companies/:companyId/submit`
- `GET /api/v1/companies/:companyId/matched-investors`
- `GET /api/v1/requests`

## 26.4 Investor

Frontend feature:

- Investor profile, organization, preferences, discovery, matches, pipeline, memos, requests.

Backend APIs:

- `GET /api/v1/investor/dashboard/summary`
- `GET /api/v1/investor/dashboard/recommendations`
- `GET /api/v1/investor/dashboard/pipeline-summary`
- `GET /api/v1/investor/profile`
- `PUT /api/v1/investor/profile`
- `PATCH /api/v1/investor/profile`
- `GET /api/v1/investor/preferences`
- `PUT /api/v1/investor/preferences`
- `PATCH /api/v1/investor/preferences`
- `GET /api/v1/investor/matched-startups`
- `GET /api/v1/companies`
- `GET /api/v1/companies/:companyId`
- `GET /api/v1/pipeline`
- `POST /api/v1/pipeline/items`
- `POST /api/v1/companies/:companyId/memos`
- `POST /api/v1/companies/:companyId/requests`

## 27. Testing Plan

## 27.1 Unit Tests

Test:

- Form validation schemas.
- Permission helper functions.
- API client error normalization.
- Match score display helpers.
- Formatting utilities.

## 27.2 Component Tests

Test:

- Login form.
- Register form.
- Role guard rendering.
- Dashboard metric card.
- Data table empty and loading states.
- Document upload form.
- Match factor breakdown.
- Valuation range card.
- Pipeline item card.

## 27.3 Integration Tests

Test:

- Login and dashboard redirect.
- Founder onboarding flow.
- Investor onboarding flow.
- Admin user approval flow.
- Document upload UI flow.
- Investor saves startup to pipeline.
- Founder responds to information request.

## 27.4 Manual QA

Manual QA should cover:

- Admin cannot be accessed by founder or investor.
- Founder cannot access investor pipeline.
- Investor cannot edit company profile.
- Mobile sidebar behavior.
- Long company names and long investor names.
- Empty states.
- Failed API states.
- AI job processing states.

## 28. Frontend Development Phases

## Phase 1: Frontend Foundation

Deliverables:

- Vite React TypeScript app.
- Tailwind setup.
- shadcn/ui setup.
- React Router setup.
- React Query setup.
- API client.
- Auth provider.
- Base layouts.

Acceptance criteria:

- App starts locally.
- Login/register routes exist.
- API base URL is configurable.
- Auth state can be loaded from `/auth/me`.

## Phase 2: Authentication and Role Routing

Deliverables:

- Login screen.
- Register screen.
- Forgot/reset password screens.
- Email verification screen.
- Role-based dashboard redirects.
- Route guards.

Acceptance criteria:

- User can log in.
- User is redirected by role.
- Protected routes block unauthenticated access.

## Phase 3: Shared App Shell

Deliverables:

- Admin shell.
- Founder shell.
- Investor shell.
- Sidebar navigation.
- Top bar.
- Notification bell placeholder.
- User menu.

Acceptance criteria:

- Each role sees the correct navigation.
- Layout works on desktop and mobile.

## Phase 4: Admin Core

Deliverables:

- Admin dashboard.
- User management.
- Organization management.
- Startup approval list.
- Startup admin detail.

Acceptance criteria:

- Admin can review users, organizations, and companies.
- Admin can call status update actions.

## Phase 5: Founder Core

Deliverables:

- Founder dashboard.
- Founder onboarding.
- Founder profile form.
- Company profile forms.
- Team, metrics, fundraising forms.
- Submit company for review.

Acceptance criteria:

- Founder can create complete startup profile.
- Founder can submit company for admin review.

## Phase 6: Investor Core

Deliverables:

- Investor dashboard.
- Investor onboarding.
- Investor profile.
- Organization profile.
- Preferences editor.
- Startup discovery.

Acceptance criteria:

- Investor can define preferences.
- Investor can browse approved startups.

## Phase 7: Documents and AI Feedback

Deliverables:

- Founder data room.
- Document upload.
- Document table.
- Extraction status.
- AI feedback page.
- Investor diligence tabs.
- Admin AI runs.

Acceptance criteria:

- Founder can upload documents.
- AI job statuses are visible.
- Investor/admin can view AI analysis where authorized.

## Phase 8: Readiness, Valuation, Claims, Red Flags

Deliverables:

- Readiness score UI.
- Valuation report UI.
- SAFE calculator UI.
- Claim verification table.
- Red flag list.
- Admin override UI.

Acceptance criteria:

- Scores and valuation results display clearly.
- Admin can review and override AI-related outputs.

## Phase 9: Matching

Deliverables:

- Founder matched investors.
- Investor matched startups.
- Match detail panel.
- Match score/factor breakdown.
- Refresh matches action.

Acceptance criteria:

- Both roles can see role-appropriate matches.
- Match explanations and weak criteria display clearly.

## Phase 10: Pipeline, Memos, Requests, Notifications

Deliverables:

- Investor pipeline board.
- Pipeline item detail.
- Internal notes.
- Memo list and detail.
- Memo generation action.
- Request list/detail.
- Notification dropdown/page.

Acceptance criteria:

- Investor can save startup to pipeline.
- Investor can generate memo.
- Investor can request information.
- Founder can respond.
- Notifications are visible.

## Phase 11: Admin Settings and Polish

Deliverables:

- Settings pages.
- Matching weight editor.
- Readiness weight editor.
- Valuation assumption editor.
- Audit log page.
- Responsive QA.
- Error and empty state pass.

Acceptance criteria:

- Admin can configure platform behavior.
- Main MVP workflows feel complete and reliable.

## 29. MVP Completion Checklist

The frontend MVP is complete when:

- Auth screens work.
- Role-based routing works.
- Admin dashboard and controls work.
- Founder can create and submit startup profile.
- Founder can upload documents.
- Founder can view AI feedback, readiness, valuation, matches, and requests.
- Investor can create profile and preferences.
- Investor can discover and review startups.
- Investor can view AI diligence, valuation, claims, red flags, and readiness.
- Investor can save startups to pipeline.
- Investor can generate memos.
- Investor can create information requests.
- Notifications are visible.
- Admin can manage users, organizations, companies, AI runs, settings, and audit logs.
- All main pages have loading, empty, error, and permission states.
- UI is responsive enough for desktop, tablet, and mobile.

## 30. Implementation Notes for Future Coding

When frontend coding starts:

1. Build layout, routing, auth, and API client first.
2. Add role-specific dashboards early so backend work can be tested visually.
3. Build forms with Zod schemas that mirror backend DTOs.
4. Keep all API calls in feature-level hooks rather than inside page components.
5. Use placeholder/mock data only temporarily and remove it once backend endpoints exist.
6. Keep AI components generic so they can display extraction, claim, matching, and memo states consistently.
7. Keep admin configuration screens simple but complete; admin control is a core requirement.

Recommended hook naming:

```text
useCurrentUser()
useAdminUsers()
useFounderProfile()
useInvestorProfile()
useCompany()
useCompanyDocuments()
useCompanyClaims()
useCompanyValuation()
useCompanyReadiness()
useFounderMatches()
useInvestorMatches()
usePipeline()
useMemos()
useRequests()
useNotifications()
```

Recommended first coding milestone:

Build the shell, authentication flow, role dashboards, and empty-state pages before deeper feature screens. This gives the project a stable frame and lets backend endpoints plug in cleanly as they are completed.
