# Vercel Deployment Guide

This repository is ready for Vercel frontend deployment and a separate production API host.

## Recommended Architecture

- Vercel hosts the React/Vite frontend from `apps/web`.
- The NestJS API in `apps/api` runs on a Node server platform such as Railway, Render, Fly.io, AWS, DigitalOcean, or a VPS.
- MySQL, Redis, SMTP, uploaded document storage, and Alibaba DashScope/Qwen secrets belong to the API environment, not the Vercel frontend environment.

## Vercel Project Settings

Import this GitHub repository into Vercel and use these settings:

- Framework Preset: `Vite`
- Install Command: `npm install`
- Build Command: `npm run build -w apps/web`
- Output Directory: `apps/web/dist`

The root `vercel.json` already contains these values and an SPA rewrite to `index.html`.

## Vercel Environment Variables

Set only frontend-safe variables in Vercel:

```text
VITE_API_BASE_URL=https://api.your-domain.com/api/v1
VITE_APP_NAME=VC Intelligence
VITE_APP_REGION=Malaysia and Southeast Asia
```

Do not add `DATABASE_URL`, `ALIBABA_API_KEY`, JWT secrets, SMTP credentials, Redis credentials, or storage paths to Vercel unless you later convert the API to a serverless deployment.

## API Host Environment Variables

Use `.env.production.example` as the API host checklist. Required production values include:

```text
NODE_ENV=production
DATABASE_URL=mysql://USER:PASSWORD@HOST:3306/vc_platform
REDIS_HOST=HOST
APP_FRONTEND_URL=https://your-vercel-domain.com
STORAGE_PATH=/absolute/persistent/storage/path
JWT_ACCESS_SECRET=at_least_32_random_characters
JWT_REFRESH_SECRET=at_least_32_random_characters
ALIBABA_API_KEY=your_dashscope_key
SMTP_HOST=smtp.example.com
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
EMAIL_FROM=no-reply@your-domain.com
```

## Migration-Safe Production Release

For production, never use Prisma `db push`. Use migration deploy only.

On the API host, after setting `DATABASE_URL` and before starting the public API process:

```bash
npm install
npm run db:deploy
npm run build -w apps/api
```

For a brand-new production database, seed once only if you need the bootstrap admin/demo data:

```bash
npm run seed
```

Immediately change seeded credentials after first login.

## Pre-Launch Verification

Before pointing users to the Vercel app:

```bash
npm run prod:check
```

Then verify the production API:

```text
GET https://api.your-domain.com/api/v1/health
GET https://api.your-domain.com/api/v1/health/db
GET https://api.your-domain.com/api/v1/health/redis
GET https://api.your-domain.com/api/v1/health/storage
GET https://api.your-domain.com/api/v1/health/ai
```

All health checks should be healthy. The AI health endpoint should confirm Qwen is configured.
