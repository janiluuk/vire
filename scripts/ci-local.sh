#!/usr/bin/env bash
# Local CI — same pipeline as .github/workflows/ci.yml (lint, tests, build, e2e, Lighthouse).
#
# Usage:
#   ./scripts/ci-local.sh              # full pipeline (matches GitHub CI)
#   ./scripts/ci-local.sh --fast       # lint + unit tests only
#   ./scripts/ci-local.sh --no-e2e     # skip Playwright + Lighthouse
#   ./scripts/ci-local.sh --no-lighthouse
#   ./scripts/ci-local.sh --skip-install   # skip npm ci (deps already installed)
#   ./scripts/ci-local.sh --skip-db      # do not start Docker Postgres (use DATABASE_URL)
#
# Environment (defaults mirror GitHub Actions):
#   DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, NEXT_PUBLIC_SITE_URL,
#   ADMIN_EMAIL, ADMIN_PASSWORD, PLAYWRIGHT_BASE_URL, CI=true
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

FAST=false
NO_E2E=false
NO_LIGHTHOUSE=false
SKIP_INSTALL=false
SKIP_DB=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --fast) FAST=true; shift ;;
    --no-e2e) NO_E2E=true; shift ;;
    --no-lighthouse) NO_LIGHTHOUSE=true; shift ;;
    --skip-install) SKIP_INSTALL=true; shift ;;
    --skip-db) SKIP_DB=true; shift ;;
    -h|--help)
      sed -n '2,12p' "$0"
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      exit 1
      ;;
  esac
done

export CI="${CI:-true}"
export DATABASE_URL="${DATABASE_URL:-postgresql://postgres:password@127.0.0.1:5432/sparkki}"
export NEXTAUTH_SECRET="${NEXTAUTH_SECRET:-ci-secret-ci-secret-ci-secret-ci-secret}"
export NEXTAUTH_URL="${NEXTAUTH_URL:-http://127.0.0.1:1337}"
export NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL:-http://127.0.0.1:1337}"
export ADMIN_EMAIL="${ADMIN_EMAIL:-admin@sparkki.fi}"
export ADMIN_PASSWORD="${ADMIN_PASSWORD:-testpassword123}"
export PLAYWRIGHT_BASE_URL="${PLAYWRIGHT_BASE_URL:-http://127.0.0.1:1337}"

log() {
  printf '\n── %s ──\n' "$1"
}

ensure_postgres() {
  if [[ "$SKIP_DB" == true ]]; then
    log "Database (--skip-db; using DATABASE_URL)"
    return
  fi

  if command -v pg_isready >/dev/null 2>&1; then
    if pg_isready -h 127.0.0.1 -p 5432 -U postgres >/dev/null 2>&1; then
      log "Postgres already reachable on 127.0.0.1:5432"
      return
    fi
  fi

  if ! command -v docker >/dev/null 2>&1; then
    echo "Postgres is not reachable and Docker is not installed." >&2
    echo "Start Postgres or run: docker compose up -d db" >&2
    exit 1
  fi

  log "Starting Postgres (docker compose db)"
  docker compose up -d db
  for _ in $(seq 1 30); do
    if docker compose exec -T db pg_isready -U postgres >/dev/null 2>&1; then
      return
    fi
    sleep 1
  done
  echo "Postgres did not become ready in time." >&2
  exit 1
}

run_audit() {
  log "npm audit (informational)"
  set +e
  echo "=== Production dependencies ==="
  npm audit --omit=dev || true
  echo "=== All dependencies ==="
  npm audit --audit-level=critical || true
  set -e
}

run_lighthouse() {
  log "Lighthouse CI (informational)"
  set +e
  cd .next/standalone
  PORT=1337 HOSTNAME=127.0.0.1 node server.js &
  local server_pid=$!
  cd "$ROOT"
  for _ in $(seq 1 90); do
    if curl -sf "http://127.0.0.1:1337/fi" >/dev/null; then
      echo "Lighthouse: server ready"
      break
    fi
    sleep 2
  done
  npx @lhci/cli autorun --config=./lighthouserc.json
  kill "$server_pid" 2>/dev/null || true
  wait "$server_pid" 2>/dev/null || true
  if command -v lsof >/dev/null 2>&1; then
    for p in $(lsof -ti:1337 2>/dev/null || true); do
      kill -9 "$p" 2>/dev/null || true
    done
  fi
  set -e
}

main() {
  log "Sparkki CI (local)"
  echo "DATABASE_URL=$DATABASE_URL"

  if [[ "$SKIP_INSTALL" != true ]]; then
    log "npm ci"
    npm ci
  fi

  if [[ "$FAST" == true ]]; then
    log "Lint"
    npm run lint
    log "Unit tests"
    npm run test:unit
    log "CI fast checks passed"
    return
  fi

  ensure_postgres
  run_audit

  log "Prisma migrate"
  npx prisma migrate deploy

  log "Prisma seed"
  npx prisma db seed

  log "Lint"
  npm run lint

  log "Unit tests"
  npm run test:unit

  log "Functional tests"
  npm run test:functional

  log "Build"
  npm run build

  if [[ "$NO_E2E" != true ]]; then
    log "Playwright browsers"
    npx playwright install chromium --with-deps

    log "E2E tests"
    npm run test:e2e
  fi

  if [[ "$NO_E2E" != true && "$NO_LIGHTHOUSE" != true ]]; then
    run_lighthouse
  fi

  log "CI passed"
}

main "$@"
