#!/usr/bin/env bash
# Sync Supabase migration history with project pwlonviycrvejqbhlyaj, then push missing tables.
# Run from repo root: bash supabase/scripts/repair-migrations.sh

set -euo pipefail
cd "$(dirname "$0")/../.."

if [[ -z "${SUPABASE_DB_PASSWORD:-}" ]]; then
  echo "Enter your Supabase database password once (Dashboard → Settings → Database):"
  read -rs SUPABASE_DB_PASSWORD
  echo
  export SUPABASE_DB_PASSWORD
fi

DB_PASS=(-p "$SUPABASE_DB_PASSWORD")

echo "==> Reverting ghost / not-applied-on-remote migrations (single batch)..."
supabase migration repair --status reverted "${DB_PASS[@]}" \
  20250120000000 \
  20250120000001 \
  20250120000002 \
  20250120000003 \
  20260604100000 2>/dev/null || supabase migration repair --status reverted "${DB_PASS[@]}" \
  20250120000000 \
  20250120000001 \
  20250120000002 \
  20250120000003

echo "==> Marking migrations already on remote as applied (single batch)..."
supabase migration repair --status applied "${DB_PASS[@]}" \
  20250125000000 \
  20250820051119 \
  20250820061030 \
  20250822073139 \
  20250822073923 \
  20250822074453 \
  20250823045515 \
  20250823045547 \
  20250823045659 \
  20250823051254 \
  20250823084138 \
  20250823091932 \
  20250823093229 \
  20250823112843 \
  20250901090000 \
  20250901093000 \
  20250901093500 \
  20250901094000 \
  20250901095000 \
  20250901100000 \
  20250901101000 \
  20250901102000 \
  20250901103000 \
  20250901104000 \
  20260604000001

echo "==> Pushing pending migrations (categories, blog_posts, video_interactions)..."
supabase db push "${DB_PASS[@]}"

echo "==> Done. Hard-refresh the admin panel (Cmd+Shift+R)."
