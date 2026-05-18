# CI — local and GitHub Actions

Sparkki uses one shell pipeline for **GitHub Actions** and **local** runs: [`scripts/ci-local.sh`](../scripts/ci-local.sh).

## Quick commands

| Command | What it runs |
|---------|----------------|
| `npm run ci` | Full pipeline (same as GitHub CI) |
| `npm run ci:fast` | Lint + unit tests only |
| `npm run ci:quick` | Lint + unit (no script; fastest manual check) |
| `npm run ci:act` | Full workflow via [nektos/act](https://github.com/nektos/act) (optional) |

## Full local CI

```bash
# Postgres: uses existing server on :5432, or starts `docker compose up -d db`
npm run ci
```

**Requirements:** Node 20, npm, Docker (if Postgres is not already running on port 5432).

The script sets the same env defaults as [`.github/workflows/ci.yml`](../.github/workflows/ci.yml):

- `DATABASE_URL=postgresql://postgres:password@127.0.0.1:5432/sparkki`
- `NEXTAUTH_URL` / `NEXT_PUBLIC_SITE_URL` → `http://127.0.0.1:1337`
- `CI=true` (Playwright reuse + retries match Actions)

**Pipeline order:** `npm ci` → audit (informational) → Prisma migrate + seed → lint → unit → functional → `next build` → Playwright e2e → Lighthouse (informational).

### Flags

```bash
./scripts/ci-local.sh --fast           # lint + unit only
./scripts/ci-local.sh --no-e2e         # skip Playwright + Lighthouse
./scripts/ci-local.sh --no-lighthouse  # skip Lighthouse only
./scripts/ci-local.sh --skip-install   # deps already installed
./scripts/ci-local.sh --skip-db        # do not start Docker Postgres
```

Free port **1337** before e2e, or stop `docker compose web` / `npm run dev`.

## GitHub Actions

Workflow: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)

**Triggers:** push and pull requests to `main` / `master`, plus `workflow_dispatch`.

**Job:** `test` — Postgres 16 service, `npm ci`, then `./scripts/ci-local.sh --skip-install --skip-db`.

**After green CI on `main`:** [`.github/workflows/deploy-production.yml`](../.github/workflows/deploy-production.yml) can deploy automatically (`workflow_run` on successful CI).

### Status badge (optional)

Add to `README.md`:

```markdown
[![CI](https://github.com/janiluuk/sparkki/actions/workflows/ci.yml/badge.svg)](https://github.com/janiluuk/sparkki/actions/workflows/ci.yml)
```

## Run GitHub workflow locally with `act`

[act](https://github.com/nektos/act) runs Actions jobs in Docker:

```bash
# Install act (see https://github.com/nektos/act#installation)
npm run ci:act
# or
act pull_request -j test --container-architecture linux/amd64
```

`act` needs a larger runner image for Playwright (`-P ubuntu-latest=...`). For day-to-day work, prefer **`npm run ci`** — it matches the same script without emulating the full Actions VM.

## Pre-push checklist

```bash
npm run lint
npm run test:unit
# before opening a PR:
npm run ci
```

See also [`README.md`](../README.md) § Tests and CI.
