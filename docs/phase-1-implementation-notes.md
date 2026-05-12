# Phase 1 Implementation Notes

## Completed Scope

Phase 1 scaffolds the base monorepo, backend, frontend, database configuration, and health-check experience.

## Backend

Created:

- `apps/api`
- NestJS app shell.
- Config module.
- Prisma MySQL schema.
- Health endpoints.
- Database health endpoint.
- Redis health endpoint.
- Global validation pipe.
- Global exception filter.
- CORS and Helmet setup.
- Environment example.

Phase 1 backend APIs:

- `GET /api/v1/health`
- `GET /api/v1/health/db`
- `GET /api/v1/health/redis`

## Frontend

Created:

- `apps/web`
- Vite React TypeScript app shell.
- React Router.
- React Query.
- API client.
- Public entry page.
- Login placeholder.
- Register placeholder.
- Health status panel.
- Environment example.

Phase 1 frontend routes:

- `/`
- `/login`
- `/register`

## LLM Provider Configuration

Alibaba/DashScope is configured as a backend-only provider through environment variables:

```text
ALIBABA_API_KEY=replace_with_rotated_key
ALIBABA_API_BASE_URL=https://dashscope-intl.aliyuncs.com
ALIBABA_MODEL=qwen-plus
```

Do not use `VITE_ALIBABA_API_KEY`. Vite exposes `VITE_` variables to the browser.

## Local Verification Results

Phase 1 was run and tested locally on May 7, 2026.

Installed local tooling/services:

- Node.js and npm through Homebrew.
- Redis through Homebrew.
- MySQL was already installed and running through Homebrew.

Created local MySQL database/user:

```text
database: vc_platform
user: vc_user
password: vc_password
```

Generated Prisma client and synced schema:

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

Live backend checks passed:

```text
GET /api/v1/health       -> ok
GET /api/v1/health/db    -> ok
GET /api/v1/health/redis -> ok, PONG
```

Live frontend check passed:

```text
http://localhost:5173/ -> HTTP 200
```

Notes:

- `npm install` completed successfully with 0 vulnerabilities.
- Prisma CLI required elevated filesystem/network access for local engine cache and MySQL schema operations.
- Local backend and frontend dev servers were stopped after verification.

## Next Phase

Phase 2 will implement:

- User registration.
- Login.
- JWT authentication.
- Refresh tokens.
- Role guards.
- Role-based routing.
- Admin/founder/investor dashboard shells.
