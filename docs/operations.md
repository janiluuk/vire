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
docker exec vire-db-1 pg_dump -U postgres -d vire -Fc -f /tmp/vire.dump
docker cp vire-db-1:/tmp/vire.dump ./backups/vire-$(date -u +%Y%m%d-%H%M).dump
```

**Restore into a fresh database (drill / staging)**

```bash
# Create empty DB, then:
pg_restore -h localhost -U postgres -d vire_restore --clean --if-exists ./backups/vire-YYYYMMDD.dump
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
