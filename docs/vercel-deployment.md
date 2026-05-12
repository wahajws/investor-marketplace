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

If the Vercel Root Directory is the repository root:

- Build Command: `if [ -d apps/web ]; then npm --prefix apps/web run build; else npm run build; fi`
- Output Directory: `apps/web/dist`

If the Vercel Root Directory is `apps/web`:

- Build Command: `npm run build`
- Output Directory: `dist`

The repository includes both a root `vercel.json` and an `apps/web/vercel.json`, so either setup can work. If Vercel shows `No workspaces found: --workspace=apps/web`, the project Root Directory is already `apps/web`; use the second set of commands above. If Vercel shows `cd: apps/web: No such file or directory`, the project Root Directory is also already `apps/web`; use `npm run build`.

Important: do not press **Redeploy** on an old failed deployment. Vercel redeploys the exact same old commit, so it will continue using the old build command. Create a new deployment from the latest `main` commit instead. The fixed commits are after `1131621`; any deployment cloning `1131621` is using stale code.

## Vercel Environment Variables

Set only frontend-safe variables in Vercel before deploying. Vite bakes `VITE_` values into the browser bundle at build time, so add or change these values and then trigger a new deployment:

```text
VITE_API_BASE_URL=https://api.your-domain.com/api/v1
VITE_APP_NAME=VC Intelligence
VITE_APP_REGION=Malaysia and Southeast Asia
```

`VITE_API_BASE_URL` is required for production builds. If it is missing, the frontend will fail fast instead of calling `localhost:4000`, because `localhost` in a deployed browser points to the visitor's computer, not the backend API.

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
