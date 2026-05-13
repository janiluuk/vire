#!/usr/bin/env bash
# Build the `web` image with a reachable DATABASE_URL for Prisma during `next build`.
# Starts `db`, waits for pg_isready, then runs `docker compose build web` (passes extra args through).
#
#   ./scripts/docker-build-web.sh
#   ./scripts/docker-build-web.sh --no-cache
#
# See docs/repository-layout.md § Known sharp edges.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

docker compose up -d db

for i in $(seq 1 90); do
  if docker compose exec -T db pg_isready -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-vire}" >/dev/null 2>&1; then
    echo "==> Postgres is ready; building web"
    exec docker compose build web "$@"
  fi
  sleep 1
done

echo "==> Timeout waiting for Postgres (docker compose up -d db)" >&2
exit 1
