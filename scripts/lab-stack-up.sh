#!/usr/bin/env bash
#
# Rebuild Docker stack, rsync to lab host, bring it up.
#
#   ./scripts/lab-stack-up.sh
#   ./scripts/lab-stack-up.sh --no-cache
#   RSYNC_DELETE=1 ./scripts/lab-stack-up.sh
#
# Remote: always runs `docker compose down` first so old containers are removed,
# then `docker compose build` and `docker compose up -d`.
# Env (defaults suit 192.168.2.100 lab):
#   LAB_HOST / DEPLOY_HOST     — default 192.168.2.100
#   LAB_PATH / DEPLOY_PATH     — default /srv/vire
#   LAB_USER / DEPLOY_USER     — default $USER, fallback root
#   RSYNC_DELETE=1             — rsync --delete (careful)
#
# `.env` is synced from this repo root when it exists locally (override secrets per
# machine as needed). `.env.local` / `.env.*.local` stay excluded.
#
set -euo pipefail

NO_CACHE=""
for arg in "$@"; do
  case "$arg" in
    --no-cache) NO_CACHE=1 ;;
    -h | --help)
      sed -n '2,20p' "$0"
      exit 0
      ;;
  esac
done

HOST="${LAB_HOST:-${DEPLOY_HOST:-192.168.2.100}}"
REMOTE_PATH="${LAB_PATH:-${DEPLOY_PATH:-/srv/vire}}"
REMOTE_USER="${LAB_USER:-${DEPLOY_USER:-${USER:-root}}}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

RSYNC_FLAGS=(-a -z)
if [[ "${RSYNC_DELETE:-}" == "1" ]]; then
  RSYNC_FLAGS+=(--delete)
fi

echo "==> Sync → ${REMOTE_USER}@${HOST}:${REMOTE_PATH}"
ssh "${REMOTE_USER}@${HOST}" "mkdir -p '${REMOTE_PATH}'"

rsync "${RSYNC_FLAGS[@]}" \
  --exclude node_modules \
  --exclude .git \
  --exclude .next \
  --exclude .env.local \
  --exclude '.env.*.local' \
  --exclude apps/vire-checker/node_modules \
  --exclude apps/vire-checker/src-tauri/target \
  ./ "${REMOTE_USER}@${HOST}:${REMOTE_PATH}/"

# Published port: host APP_PORT in docker-compose (default 1337). Override locally: APP_PORT=8080 ./scripts/lab-stack-up.sh
REMOTE_PORT="${APP_PORT:-1337}"

BUILD_CMD="docker compose build --pull"
if [[ -n "$NO_CACHE" ]]; then
  BUILD_CMD+=" --no-cache"
fi

echo "==> Remote: docker compose down && ${BUILD_CMD} && docker compose up -d"
# shellcheck disable=SC2029
ssh "${REMOTE_USER}@${HOST}" "cd '${REMOTE_PATH}' && docker compose down --remove-orphans || true && ${BUILD_CMD} && docker compose up -d"

BASE_URL="http://${HOST}:${REMOTE_PORT}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Stack up:  ${BASE_URL}"
echo "  Admin:     ${BASE_URL}/admin"
echo "  Health:    ${BASE_URL}/api/health"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "If the host publishes another port, set APP_PORT when running this script (must match ${REMOTE_PATH}/.env APP_PORT for the printed URL)."
echo "Ensure ${REMOTE_PATH}/.env (synced if present locally) includes at least:"
echo "  NEXTAUTH_URL=${BASE_URL}"
echo "  NEXT_PUBLIC_SITE_URL=${BASE_URL}"
echo "  NEXT_PUBLIC_CALENDLY_EMBED_URL=\"https://calendly.com/…\"   # if /tuki booking embed is used"
echo "  NEXTAUTH_SECRET=… (32+ chars)"
echo ""
