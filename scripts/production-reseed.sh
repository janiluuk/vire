#!/usr/bin/env bash
# Re-seed production Postgres after deploy (admin, guides, models, reference catalog).
# Run on the production host inside /srv/sparkki, or via SSH from deploy script.
set -euo pipefail

ROOT="${DEPLOY_PATH:-$(cd "$(dirname "$0")/.." && pwd)}"
cd "$ROOT"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

DB_USER="${POSTGRES_USER:-postgres}"
DB_PASS="${POSTGRES_PASSWORD:-password}"
DB_NAME="${POSTGRES_DB:-sparkki}"
# Always use the compose `db` hostname (`.env` may point at localhost for host-side tools).
export DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@db:5432/${DB_NAME}"

echo "==> Re-seed (migrate already applied by web entrypoint)"
echo "    DATABASE_URL host: db"

docker compose run --rm \
  -e DATABASE_URL \
  -v "$ROOT:/app" \
  -w /app \
  migrate \
  sh -c '
    set -e
    apt-get update -qq
    apt-get install -y -qq openssl ca-certificates >/dev/null
    npm ci
    npx prisma generate
    npx prisma db seed
    npx tsx scripts/import-laptop-reference.ts
  '

echo "==> Re-seed complete"
