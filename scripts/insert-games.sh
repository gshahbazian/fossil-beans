#!/usr/bin/env bash
#
# Fetch NBA box scores for today or a specific date and ask the Worker to
# upsert them into D1 through the same Drizzle path used by the cron job.
#
# Usage:
#   ./scripts/insert-games.sh --local
#   ./scripts/insert-games.sh --remote
#   ./scripts/insert-games.sh --local 2025-01-15
#   ./scripts/insert-games.sh --remote 2025-01-15
#
# This calls POST /api/insert-games. The endpoint writes to D1 and purges the
# cached home page when it succeeds.
#
# Env vars:
#   PURGE_URL     base URL of the running Worker/app
#   PURGE_SECRET  bearer token matching the PURGE_SECRET worker var/secret
#
# For --remote you'll usually want:
#   PURGE_URL=https://your-deploy.example.com \
#   PURGE_SECRET=$(op read ...) \
#   ./scripts/insert-games.sh --remote
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

if [ "$TARGET" = "--local" ]; then
  : "${PURGE_URL:=http://localhost:3000}"
  : "${PURGE_SECRET:=local-dev-purge-secret}"
fi

if [ -z "${PURGE_URL:-}" ] || [ -z "${PURGE_SECRET:-}" ]; then
  echo "PURGE_URL and PURGE_SECRET are required for $TARGET" >&2
  exit 1
fi

URL="$PURGE_URL/api/insert-games"
if [ -n "$DATE_ARG" ]; then
  GAME_IDS="$(pnpm exec tsx scripts/get-game-ids.ts "$DATE_ARG")"
  if [ -z "$GAME_IDS" ]; then
    echo "No games found for $DATE_ARG" >&2
    exit 0
  fi
  URL="$URL?date=$DATE_ARG&gameIds=$GAME_IDS"
fi

echo "Inserting games through $URL"
if ! curl -fsS -X POST -H "Authorization: Bearer $PURGE_SECRET" "$URL"; then
  echo "(insert failed - is the app running and is PURGE_SECRET correct?)" >&2
  exit 1
fi
echo
