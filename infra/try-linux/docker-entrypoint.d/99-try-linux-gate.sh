#!/bin/sh
set -e
# Optional shared gate: set TRY_LINUX_ACCESS_TOKEN (same value as Vire NEXT_PUBLIC_TRY_LINUX_ACCESS_TOKEN).
# Generates /etc/nginx/conf.d/01-gate.conf before nginx loads config.
GATE_FILE=/etc/nginx/conf.d/01-gate.conf
if [ -n "${TRY_LINUX_ACCESS_TOKEN:-}" ]; then
  esc=$(printf '%s' "$TRY_LINUX_ACCESS_TOKEN" | sed 's/\\/\\\\/g; s/"/\\"/g')
  printf 'map $arg_access_token $try_linux_gate { default 0; "%s" 1; }\n' "$esc" >"$GATE_FILE"
else
  printf '%s\n' 'map $arg_access_token $try_linux_gate { default 1; }' >"$GATE_FILE"
fi
