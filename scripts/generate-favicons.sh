#!/usr/bin/env bash
# Regenerate raster favicons from app/icon.svg (requires ImageMagick `convert`).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
SVG="app/icon.svg"
test -f "$SVG" || { echo "missing $SVG" >&2; exit 1; }
command -v convert >/dev/null || { echo "install ImageMagick (convert)" >&2; exit 1; }
convert "$SVG" -background none -density 300 -define icon:auto-resize=64,48,32,16 app/favicon.ico
convert "$SVG" -background "#101214" -resize 180x180 app/apple-icon.png
echo "Wrote app/favicon.ico app/apple-icon.png"
