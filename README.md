# Investor Marketplace

AI-assisted venture capital diligence, startup verification, valuation reasonableness, and investor matching SaaS for Malaysia and Southeast Asia.

## Current Status

MVP application:

- Premium React/Vite frontend.
- NestJS backend API.
- Prisma/MySQL database.
- Founder, investor, and admin dashboards.
- Startup profile, metrics, fundraising, team, and data room workflows.
- Investor preferences, discovery, matching, pipeline, memos, and requests.
- Admin user, organization, startup review, settings, AI review, and audit log workflows.
- LLM-assisted extraction and diligence via backend-only Alibaba/DashScope configuration.

## Important Secret Handling

Do not put LLM provider API keys in frontend `VITE_` variables. Vite exposes `VITE_` variables to browser users. The Alibaba/DashScope API key must stay in the backend `.env` only.

## Local Setup

Install dependencies once a package manager is available:

```bash
npm install
```

Create environment files:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Run MySQL and Redis, then migrate:

```bash
npm run prisma:migrate -w apps/api
npm run prisma:generate -w apps/api
```

Start development:

```bash
npm run dev
```

Backend:

```text
http://localhost:4000/api/v1/health
```

Frontend:

```text
http://localhost:5173
```

Default seeded admin:

```text
admin@example.com
ChangeMe123!
```
