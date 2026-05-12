# Phase 2 Implementation Notes

## Completed Scope

Phase 2 implements authentication and role-based access for the MVP foundation.

## Backend

Created:

- Auth module.
- Users module.
- JWT access-token authentication.
- Refresh-token storage and rotation.
- Password hashing with Node.js `crypto.scrypt`.
- Role decorators and guards.
- Current-user decorator.
- Register, login, refresh, logout, forgot-password, reset-password, verify-email, and current-user APIs.
- User account update and change-password APIs.

Backend APIs implemented:

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

Database additions:

- `RefreshToken`
- `PasswordResetToken`
- `EmailVerificationToken`
- `User.emailVerifiedAt`

## Frontend

Created:

- Auth API client functions.
- Auth storage helpers.
- Auth context/provider.
- Protected route guard.
- Role-based routing.
- Functional login form.
- Functional register form.
- Forgot-password page.
- Reset-password page.
- Verify-email page.
- Protected admin dashboard shell.
- Protected founder dashboard shell.
- Protected investor dashboard shell.
- Account and security placeholder pages.

Frontend routes implemented:

- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/verify-email`
- `/admin`
- `/founder`
- `/founder/onboarding`
- `/founder/profile`
- `/founder/company`
- `/investor`
- `/investor/onboarding`
- `/investor/profile`
- `/investor/preferences`
- `/account`
- `/account/security`

## Verification Results

Phase 2 was run and tested locally on May 7, 2026.

Database commands:

```bash
npm run prisma:generate -w apps/api
npm exec -w apps/api -- prisma db push
npm run prisma:seed -w apps/api
```

Build and test commands passed:

```bash
npm run build
npm run test
```

Live backend auth checks passed:

```text
POST /api/v1/auth/register -> created founder, returned access/refresh tokens
GET  /api/v1/auth/me       -> returned authenticated user
POST /api/v1/auth/refresh  -> rotated refresh token and returned new tokens
POST /api/v1/auth/login    -> returned access/refresh tokens
POST /api/v1/auth/logout   -> revoked refresh token
GET  /api/v1/auth/me with invalid token -> 401
POST /api/v1/auth/login with seeded admin -> returned ADMIN access token
```

Live frontend checks passed:

```text
http://localhost:5173/      -> HTTP 200
http://localhost:5173/login -> HTTP 200
```

## Notes

- Founder and investor registrations are set to `ACTIVE` in the MVP so users can enter the app immediately.
- Admin users are created through the seed script.
- Local seeded admin credentials are `admin@example.com` / `ChangeMe123!`. Change this before production.
- Email sending is not implemented yet. Forgot-password returns a development token for local testing.
- Tokens are currently stored in local storage for MVP simplicity; this is isolated in `auth-storage.ts` so it can later be moved to secure HTTP-only cookies.

## Next Phase

Phase 3 will implement:

- Admin dashboard data.
- User management APIs and UI.
- Organization creation and management.
- Investor organization approval workflow.
- Audit log base.
