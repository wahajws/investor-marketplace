# Production Readiness Runbook

This runbook prepares Investor Marketplace for deployment. It does not perform deployment.

## 1. Required Services

- Node.js 20 or newer.
- MySQL 8 or compatible managed MySQL.
- Redis 7 or compatible managed Redis.
- Persistent file storage for uploaded documents.
- SMTP provider for verification and password reset email.
- Alibaba DashScope/Qwen API key.
- HTTPS domain and reverse proxy or managed platform routing.

## 2. Environment Variables

Use `.env.production.example` as the production checklist.

Required in production:

- `NODE_ENV=production`
- `DATABASE_URL`
- `REDIS_HOST`
- `APP_FRONTEND_URL`
- `STORAGE_PATH`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `ALIBABA_API_KEY`
- `SMTP_HOST`
- `SMTP_USER`
- `SMTP_PASS`
- `EMAIL_FROM`
- `VITE_API_BASE_URL`

JWT secrets must be at least 32 random characters. Never use `replace_me`, `change_me`, or committed examples.

## 3. Pre-Deployment Build Checks

Run locally before packaging or deploying:

```bash
npm install
npm run prod:check
```

If lint fails on existing style issues, resolve them before launch or temporarily run the individual hard gates:

```bash
npm run test
npm run build
npm audit --omit=dev
```

## 4. Database

For a clean production database:

```bash
npm run db:deploy
```

For first admin setup:

```bash
npm run seed
```

Immediately change the seeded admin password after first login.

## 5. Health Checks

After starting the API, verify:

```text
GET /api/v1/health
GET /api/v1/health/db
GET /api/v1/health/redis
GET /api/v1/health/storage
GET /api/v1/health/ai
```

All must return healthy before opening the app to users. `/health/ai` must show Qwen configured.

## 6. Smoke Test

Complete this production smoke test before launch:

1. Register founder.
2. Verify founder email.
3. Register investor.
4. Verify investor email.
5. Admin logs in.
6. Founder completes profile.
7. Founder creates company.
8. Founder adds metrics and fundraising.
9. Founder uploads a PDF or DOCX.
10. Founder processes the document with AI.
11. Founder runs AI extraction, diligence, readiness, and valuation.
12. Founder submits startup.
13. Admin approves startup and sets visibility to investors.
14. Investor creates organization and preferences.
15. Admin approves investor organization.
16. Investor refreshes matches.
17. Investor discovers approved startup.
18. Investor saves startup to pipeline.
19. Investor generates memo.
20. Investor creates information request.
21. Founder responds.
22. Investor resolves request.

## 7. Security Checklist

- Production secrets are not committed.
- `ALIBABA_API_KEY` exists only in backend environment.
- `VITE_` variables do not contain secrets.
- HTTPS is enabled.
- CORS `APP_FRONTEND_URL` matches the production frontend.
- Database is not publicly open except to trusted hosts.
- Redis is password-protected or private-network only.
- Uploaded documents are stored outside the public web root.
- File downloads go through the API.
- Admin seed password is changed.
- SMTP credentials are private.
- Backups are configured before launch.

## 8. Backup Checklist

- MySQL daily automated backup.
- Uploaded document storage daily backup.
- Backup restore test before public launch.
- Keep at least 7 daily backups and 4 weekly backups for MVP rollout.

## 9. Monitoring Checklist

At minimum, monitor:

- API process uptime.
- API error rate.
- MySQL availability.
- Redis availability.
- Disk usage for `STORAGE_PATH`.
- AI provider failures.
- Email delivery failures.
- Failed login spikes.

## 10. Rollback Plan

Before every release:

- Take a database backup.
- Preserve the previous build artifact.
- Record the migration version.
- Keep the previous environment file available outside git.

Rollback order:

1. Stop new traffic.
2. Restore previous app build.
3. Restore database backup only if the release migration caused data incompatibility.
4. Restart API and frontend.
5. Run health checks and smoke test login.

## 11. Known Launch Limitations

- AI output must be treated as decision support, not investment advice.
- External research agent is not included yet.
- Advanced CRM/calendar integrations are post-launch.
- Billing/subscriptions are post-launch.

