#!/usr/bin/env bash
#
# Fetch NBA box scores for today or a specific date and upsert them into D1,
# then purge the edge cache for the home page so the next request re-renders
# against fresh data.
#
# Usage:
#   ./scripts/insert-games.sh --local
#   ./scripts/insert-games.sh --remote
#   ./scripts/insert-games.sh --local 2025-01-15
#   ./scripts/insert-games.sh --remote 2025-01-15
#
# Cache purge is best-effort. It uses these env vars (with sensible local
# defaults):
#   PURGE_URL     base URL of the deployment (e.g. https://fossil-beans.workers.dev)
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

if [ "$TARGET" = "--local" ]; then
  : "${PURGE_URL:=http://localhost:3000}"
  : "${PURGE_SECRET:=local-dev-purge-secret}"
fi

if [ -n "${PURGE_URL:-}" ] && [ -n "${PURGE_SECRET:-}" ]; then
  echo "Purging cache at $PURGE_URL/api/purge-cache"
  if ! curl -fsS -X POST \
    -H "Authorization: Bearer $PURGE_SECRET" \
    "$PURGE_URL/api/purge-cache"; then
    echo "(purge failed — is the worker running / PURGE_SECRET correct?)" >&2
  fi
  echo
else
  echo "(skipping cache purge; PURGE_URL or PURGE_SECRET not set)" >&2
fi
