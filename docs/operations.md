# Operations — monitoring, logs, backups, CSP

This document complements **`docker-compose.yml`** (healthchecks) and **`docs/api-public.md`**.

## Synthetic monitoring

Point an external checker (Uptime Kuma, Grafana Cloud, Better Stack, etc.) at:

1. **`GET /api/health`** — JSON `{ "ok": true }`; use as the primary uptime signal.
2. A public page such as **`/fi`** or **`/en`** — catches routing and static asset regressions the health route might miss.

Configure reasonable intervals (for example 1–5 minutes) and alert on non-200 responses or missing JSON `ok`.

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

## Content-Security-Policy (staging)

Baseline security headers are set in **`next.config.mjs`**. A strict **CSP** with nonces requires coordinated changes (inline scripts, Stripe, Calendly/Discord embeds, analytics). Recommended approach:

1. Set **`ENABLE_CSP_REPORT_ONLY=true`** in the environment (see **`next.config.mjs`**) to emit **`Content-Security-Policy-Report-Only`** with a first-pass policy (Stripe / common embeds allowlisted). Collect violations in the browser or via a reporting endpoint.
2. Tighten **`script-src`** / **`frame-src`** incrementally; keep Stripe and embed allowlists explicit.
3. Switch to enforcing **`Content-Security-Policy`** when reports are clean.

Do not enable a strict enforcing policy in production until third-party domains and Next.js chunks are verified end-to-end.
