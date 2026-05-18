# Operations — monitoring, logs, backups, CSP

This document complements **`docker-compose.yml`** (healthchecks) and **`docs/api-public.md`**.

## Dependency and security audits

- Run **`npm run security:audit`** for the full tree (includes devDependencies such as Lighthouse CLI).
- Run **`npm run security:audit:prod`** to focus on **production** dependencies only.
- **`package.json`** uses an **`overrides`** entry for **`cookie`** (transitively pulled by **next-auth**) so patched releases win over vulnerable nested versions where npm can reconcile them.
- **Next.js** is pinned on the latest **14.2.x** line compatible with this app; the advisory database may still list ranges that include 14.2.x until metadata catches up — track [Next.js security releases](https://github.com/vercel/next.js/security) and upgrade minors when you can validate the app (jumping to **Next 15+** is a deliberate migration).
- Dev-only chains (**`eslint-config-next` → glob**, **`@lhci/cli` → tmp/inquirer**) may remain flagged until those packages ship fixes; CI prints both prod-only and full reports without failing the job.

## Synthetic monitoring

Point an external checker (Uptime Kuma, Grafana Cloud, Better Stack, etc.) at:

1. **`GET /api/health`** — JSON `{ "ok": true }`; use as the primary uptime signal.
2. A public page such as **`/fi`** or **`/en`** — catches routing and static asset regressions the health route might miss.

Configure reasonable intervals (for example 1–5 minutes) and alert on non-200 responses or missing JSON `ok`.

**Optional — GitHub Actions:** workflow **`synthetic-monitoring.yml`** runs on a schedule when you set repository variable **`SYNTHETIC_MONITORING_BASE_URL`** (production origin, no trailing slash). If unset, the job exits successfully without probing — use for repos that have not configured a live URL yet.

## Structured logging

API routes and the Stripe webhook emit **`logApiEvent`** lines from **`lib/logging/log.ts`**.

- In **production**, logs are **single-line JSON** (`ts`, `level`, `requestId`, `event`, plus route-specific fields).
- In **development**, logs default to a readable `[requestId] event` format unless **`STRUCTURED_LOG=1`** is set (then JSON).

Clients or proxies may send **`X-Request-Id`** or **`X-Correlation-Id`** (max 128 characters); otherwise a UUID is generated per request.

## Admin audit trail

Mutations from admin actions write rows to **`AdminAuditLog`** (Prisma). Order detail **`/admin/orders/[id]`** lists recent entries for that order. Other entities (guides, computer models) are also logged with `entity` / `entityId` for later UI expansion.

## Database backups

For production Postgres, schedule **`pg_dump`** (or managed backups) and document:

- where dumps are stored (encrypted off-site),
- retention,
- who can restore,
- a **quarterly restore drill** into a non-production database.

`docker-compose` defaults are for **local/lab** only.

**Example: scheduled dump (Postgres in Docker)**

```bash
# Replace container name / DB / user from your compose file.
docker compose exec -T db pg_dump -U postgres -d sparkki -Fc -f /tmp/sparkki.dump
docker compose cp db:/tmp/sparkki.dump ./backups/sparkki-$(date -u +%Y%m%d-%H%M).dump
```

**Restore into a fresh database (drill / staging)**

```bash
# Create empty DB, then:
pg_restore -h localhost -U postgres -d sparkki_restore --clean --if-exists ./backups/sparkki-YYYYMMDD.dump
```

Verify application connectivity and row counts after restore. Run a **restore drill** at least quarterly; keep dumps **encrypted** off-site with documented retention.

## Content-Security-Policy

**Current setup (repo):** **`content-security-policy.mjs`** holds one directive string. **`next.config.mjs`** may send **`Content-Security-Policy-Report-Only`** when **`ENABLE_CSP_REPORT_ONLY=true`**, and/or **`Content-Security-Policy`** when **`ENABLE_CSP_ENFORCE=true`**. If **`NEXT_PUBLIC_SITE_URL`** or **`CSP_REPORT_BASE_URL`** is set, the policy appends **`report-uri …/api/csp-report`**; browsers POST reports to **`POST /api/csp-report`** (see **`docs/api-public.md`**).

Baseline security headers are also set in **`next.config.mjs`** (non-CSP headers). Report-only and enforcing CSP modes use the **same** directive builder so they stay aligned.

### Report-only (staging)

1. Set **`ENABLE_CSP_REPORT_ONLY=true`** to emit **`Content-Security-Policy-Report-Only`** (Stripe, embeds, Plausible, fonts, etc. allowlisted; **`script-src`** still includes **`'unsafe-inline'`** / **`'unsafe-eval'`** for Next.js without per-request nonces). Collect violations in the browser or via a reporting endpoint.
2. Tighten **`script-src`** / **`frame-src`** incrementally as violations allow.

### Enforcing (baseline)

- Set **`ENABLE_CSP_ENFORCE=true`** to send **`Content-Security-Policy`** with the **same** directive string as report-only. Applies to all matched routes in **`next.config.mjs`** (including **`/admin`** and locale pages).
- You can run **report-only and enforcing together** during rollout: the browser reports on the relaxed policy while the enforcing header blocks (they should use the same rules to avoid confusion — both read **`getContentSecurityPolicyValue()`**).

### Report collection (`report-uri`)

When **`CSP_REPORT_BASE_URL`** or **`NEXT_PUBLIC_SITE_URL`** is set to a valid **`http(s):`** origin, **`content-security-policy.mjs`** appends **`report-uri {origin}/api/csp-report`**. Browsers then POST [CSP violation reports](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP#violation_report_syntax) to **`POST /api/csp-report`**, which returns **204**, rate-limits by IP, and logs **`csp_report.violation`** (summary fields) via **`logApiEvent`**.

- Use **`CSP_REPORT_BASE_URL`** if the reporting origin must differ from **`NEXT_PUBLIC_SITE_URL`**.
- **`report-uri`** is widely supported but legacy; **`report-to`** + **`Reporting-Endpoints`** is a possible follow-up.

### Stricter CSP (nonces / no `unsafe-inline`)

Removing **`'unsafe-inline'`** / **`'unsafe-eval'`** from **`script-src`** needs per-request **nonces** (or hashes) for Next.js hydration, **`next/script`**, and any inline bootstrapping, plus verification for **Stripe Checkout**, **Calendly**, **Discord**, and **YouTube** embeds. That is **optional hardening** after baseline enforcing is stable in production — not required for the initial enforcing rollout above.

Do not drop **`unsafe-inline`** / **`unsafe-eval`** from **`script-src`** until third-party domains and Next.js chunks are verified end-to-end with a nonce or hash strategy.

## Production deploy (GitHub Actions)

Workflow **`.github/workflows/deploy-production.yml`** rsyncs the repo and runs **`docker compose build && up`** on **`root@192.168.2.100:/srv/sparkki`**, using SSH **ProxyJump** through **`pi@sparkki.dudeisland.eu:4322`**.

| Item | Value |
|------|--------|
| Jumphost | `pi@sparkki.dudeisland.eu` port **4322** |
| Production | `root@192.168.2.100`, path **`/srv/sparkki`** |
| Secret | **`DEPLOY_SSH_PRIVATE_KEY`** — ed25519 key authorized on **both** hosts |
| Triggers | Manual **workflow_dispatch**; auto after **CI** succeeds on **`main`** |

Optional repository **variables**: `DEPLOY_JUMP_HOST`, `DEPLOY_JUMP_USER`, `DEPLOY_JUMP_PORT`, `DEPLOY_HOST`, `DEPLOY_PATH`, `DEPLOY_USER`, `DEPLOY_APP_PORT` (defaults match the table). Set **`DEPLOY_JUMP_USER`** if the jumphost account is not `pi` (e.g. `web`).

**CI host keys:** The deploy workflow runs `ssh-keyscan` for the jumphost and production (via jump) before SSH, and uses **`StrictHostKeyChecking=accept-new`** (same as `scripts/lab-stack-up.sh`). If you see `Host key verification failed`, re-run deploy after this workflow is on `main`; ensure the deploy key can reach both hosts (`Permission denied` is a different fix — re-run `ssh-copy-id` above).

**One-time key setup** (from a machine that already reaches both hosts):

```bash
ssh-keygen -t ed25519 -f ~/.ssh/sparkki_github_deploy -N "" -C "github-actions-sparkki-deploy"
ssh-copy-id -i ~/.ssh/sparkki_github_deploy.pub -p 4322 pi@sparkki.dudeisland.eu
ssh-copy-id -i ~/.ssh/sparkki_github_deploy.pub -o ProxyJump=pi@sparkki.dudeisland.eu:4322 root@192.168.2.100
gh secret set DEPLOY_SSH_PRIVATE_KEY < ~/.ssh/sparkki_github_deploy
```

Local deploy over the same jump host: **`SSH_PROXY_JUMP=pi@sparkki.dudeisland.eu:4322 ./scripts/lab-stack-up.sh`**. Direct LAN deploy (no jump): **`./scripts/lab-stack-up.sh`** (defaults to `192.168.2.100`).

Production **`.env`** lives on the server only; CI does not overwrite it (rsync excludes `.env.local`; root `.env` is not in the git tree).

## Scheduled jobs (cron)

Set **`CRON_SECRET`** in production. Callers must send **`Authorization: Bearer <CRON_SECRET>`**.

| Route | Schedule (`vercel.json`) | Purpose |
|-------|--------------------------|---------|
| **`GET /api/cron/care-lifecycle`** | Daily 08:00 UTC | Day **75** and **88** Care upsell emails for **`DONE`** orders (`careUpsell75SentAt` / `careUpsell88SentAt` on `Order`). Skips active Care subscribers and wizard Care+ interest. Requires **`RESEND_API_KEY`**. |
| **`GET /api/cron/stale-orders`** | Daily 04:15 UTC | Cancels **`PENDING`** orders older than **`STALE_ORDER_MAX_AGE_HOURS`** (default **24**). |
| **`GET /api/cron/specs-cache-cleanup`** | Daily 04:30 UTC | Deletes expired rows from **`LaptopSpecsInternetCache`** (`expiresAt` in the past). |

On non-Vercel hosts, trigger the same URLs from cron or Uptime Kuma with the bearer header.

**Rate limiting:** set **`UPSTASH_REDIS_REST_URL`** + **`UPSTASH_REDIS_REST_TOKEN`** in production. Optional **`REQUIRE_UPSTASH_RATE_LIMIT=true`** returns **503** on checkout, support-contact, and compatibility when Upstash is missing (otherwise a one-time warning is logged per process).
