#!/usr/bin/env bash
#
# Rebuild Docker stack, rsync to lab host, bring it up.
#
#   ./scripts/lab-stack-up.sh
#   ./scripts/lab-stack-up.sh --no-cache
#   RSYNC_DELETE=1 ./scripts/lab-stack-up.sh
#
# Remote: tears down the old stack first, then rsync, then build + up.
# If the desired port is still bound after teardown, increments until a free one is found.
# Env (defaults suit 192.168.2.100 lab):
#   LAB_HOST / DEPLOY_HOST     — default 192.168.2.100
#   LAB_PATH / DEPLOY_PATH     — default /srv/sparkki
#   LAB_USER / DEPLOY_USER     — default root
#   SSH_PROXY_JUMP             — e.g. pi@sparkki.dudeisland.eu:4322 (GitHub Actions / remote deploy)
#   APP_PORT                   — desired host port (default 1337); auto-increments if taken
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
REMOTE_PATH="${LAB_PATH:-${DEPLOY_PATH:-/srv/sparkki}}"
REMOTE_USER="${LAB_USER:-${DEPLOY_USER:-root}}"
PROXY_JUMP="${SSH_PROXY_JUMP:-}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

SSH_COMMON_OPTS=(-o StrictHostKeyChecking=accept-new)
if [[ -n "$PROXY_JUMP" ]]; then
  SSH_COMMON_OPTS+=(-J "$PROXY_JUMP")
fi
ssh_remote() {
  ssh "${SSH_COMMON_OPTS[@]}" "$@"
}
RSYNC_RSH="ssh"
for opt in "${SSH_COMMON_OPTS[@]}"; do
  RSYNC_RSH+=" $(printf '%q' "$opt")"
done

RSYNC_FLAGS=(-a -z)
if [[ "${RSYNC_DELETE:-}" == "1" ]]; then
  RSYNC_FLAGS+=(--delete)
fi

# --- 1. Tear down old stack before syncing new code ---
echo "==> Remote: tear down old stack"
# shellcheck disable=SC2029
ssh_remote "${REMOTE_USER}@${HOST}" \
  "[ -d '${REMOTE_PATH}' ] && cd '${REMOTE_PATH}' && docker compose down --remove-orphans 2>/dev/null || true"

# --- 2. Sync files ---
echo "==> Sync → ${REMOTE_USER}@${HOST}:${REMOTE_PATH}"
ssh_remote "${REMOTE_USER}@${HOST}" "mkdir -p '${REMOTE_PATH}'"

rsync "${RSYNC_FLAGS[@]}" \
  -e "$RSYNC_RSH" \
  --exclude node_modules \
  --exclude .git \
  --exclude .next \
  --exclude .env.local \
  --exclude '.env.*.local' \
  --exclude apps/sparkki-checker/node_modules \
  --exclude apps/sparkki-checker/src-tauri/target \
  ./ "${REMOTE_USER}@${HOST}:${REMOTE_PATH}/"

# --- 3. Find a free port on the remote host ---
DESIRED_PORT="${APP_PORT:-1337}"
# shellcheck disable=SC2029
REMOTE_PORT=$(ssh_remote "${REMOTE_USER}@${HOST}" "
  port=${DESIRED_PORT}
  while ss -tlnH 2>/dev/null | awk '{print \$4}' | grep -q \":\${port}\$\"; do
    port=\$((port + 1))
  done
  echo \"\$port\"
")

if [[ "$REMOTE_PORT" != "$DESIRED_PORT" ]]; then
  echo "  Port ${DESIRED_PORT} is taken → using ${REMOTE_PORT}"
fi

# --- 4. Build and bring up ---
BUILD_CMD="docker compose build --pull"
if [[ -n "$NO_CACHE" ]]; then
  BUILD_CMD+=" --no-cache"
fi

echo "==> Remote: ${BUILD_CMD} && docker compose up -d (port ${REMOTE_PORT})"
# shellcheck disable=SC2029
ssh_remote "${REMOTE_USER}@${HOST}" \
  "cd '${REMOTE_PATH}' && APP_PORT=${REMOTE_PORT} ${BUILD_CMD} && APP_PORT=${REMOTE_PORT} docker compose up -d"

BASE_URL="http://${HOST}:${REMOTE_PORT}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Stack up:  ${BASE_URL}"
echo "  Admin:     ${BASE_URL}/admin"
echo "  Health:    ${BASE_URL}/api/health"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "If the port was auto-selected, persist it in ${REMOTE_PATH}/.env as APP_PORT=${REMOTE_PORT}."
echo "Ensure ${REMOTE_PATH}/.env (synced if present locally) includes at least:"
echo "  APP_PORT=${REMOTE_PORT}"
echo "  NEXTAUTH_URL=${BASE_URL}"
echo "  NEXT_PUBLIC_SITE_URL=${BASE_URL}"
echo "  NEXT_PUBLIC_CALENDLY_EMBED_URL=\"https://calendly.com/…\"   # if /tuki booking embed is used"
echo "  NEXTAUTH_SECRET=… (32+ chars)"
echo ""
