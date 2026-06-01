#!/usr/bin/env bash
#
# Fetch today's NBA box scores and upsert them into D1.
#
# Usage:
#   ./scripts/insert-todays-games.sh --local
#   ./scripts/insert-todays-games.sh --remote
#   ./scripts/insert-todays-games.sh --local 2025-01-15
#   ./scripts/insert-todays-games.sh --remote 2025-01-15
#
set -euo pipefail

TARGET="${1:---local}"
DATE_ARG="${2:-}"

if [ "$TARGET" != "--local" ] && [ "$TARGET" != "--remote" ]; then
  echo "Usage: $0 --local|--remote [YYYY-MM-DD]" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

TMP=$(mktemp -t fossil-beans-games-XXXXXX.sql)
trap 'rm -f "$TMP"' EXIT

if [ -n "$DATE_ARG" ]; then
  pnpm exec tsx scripts/fetch-games.ts --date "$DATE_ARG" > "$TMP"
else
  pnpm exec tsx scripts/fetch-games.ts > "$TMP"
fi

if [ ! -s "$TMP" ]; then
  echo "No SQL produced (no games?)" >&2
  exit 0
fi

pnpm exec wrangler d1 execute fossil-beans "$TARGET" --file="$TMP"
