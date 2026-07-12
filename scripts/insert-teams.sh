#!/usr/bin/env bash
#
# Seed the teams table.
#
# Usage:
#   ./scripts/insert-teams.sh --local
#   ./scripts/insert-teams.sh --remote
#
set -euo pipefail

TARGET="${1:---local}"

if [ "$TARGET" != "--local" ] && [ "$TARGET" != "--remote" ]; then
  echo "Usage: $0 --local|--remote" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

pnpm exec wrangler d1 execute fossil-beans "$TARGET" \
  --file=./scripts/seed/teams.sql
