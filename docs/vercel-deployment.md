# Vercel Deployment Guide

This repository is ready for Vercel deployment with the React/Vite frontend and a NestJS API exposed through Vercel serverless functions.

## Recommended Architecture

- Vercel hosts the React/Vite frontend from `apps/web`.
- Vercel exposes the NestJS API through `/api/*` serverless functions.
- MySQL must be hosted externally, for example PlanetScale, Railway, Aiven, AWS RDS, DigitalOcean, or another managed MySQL provider.
- Redis, SMTP, uploaded document storage, and Alibaba DashScope/Qwen are optional integrations for the first production deploy.

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

Set these values in Vercel before deploying:

```text
DATABASE_URL=mysql://USER:PASSWORD@HOST:3306/vc_platform
APP_FRONTEND_URL=https://your-vercel-domain.vercel.app
JWT_ACCESS_SECRET=at_least_32_random_characters
JWT_REFRESH_SECRET=at_least_32_random_characters
VITE_APP_NAME=VC Intelligence
VITE_APP_REGION=Malaysia and Southeast Asia
```

`VITE_API_BASE_URL` is optional for the Vercel deployment. If it is not set, the frontend calls the same deployment at `/api/v1`.

Optional backend integrations:

- `ALIBABA_API_KEY`
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`

## Migration-Safe Production Release

For production, never use Prisma `db push`. Use migration deploy only against the external production MySQL database.

After setting `DATABASE_URL` locally or in a trusted CI environment:

```bash
npm install
npm run db:deploy
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
GET https://your-vercel-domain.vercel.app/api/v1/health
GET https://your-vercel-domain.vercel.app/api/v1/health/db
```

The base health endpoint confirms the serverless API boots. The database health endpoint confirms auth can reach MySQL.
