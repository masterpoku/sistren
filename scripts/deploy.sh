#!/usr/bin/env bash
# Deploy Sistren to Rumahweb cPanel (Node.js App / Passenger).
# Requires: ssh/config alias `cpanel-sistren` + standalone build.
set -euo pipefail

REMOTE_USER_HOST="cpanel-sistren"        # alias dari ~/.ssh/config
REMOTE_APP_DIR="~/sistren"                # app dir di cPanel
LOCAL_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> Building standalone..."
( cd "$LOCAL_DIR" && bun run build )

echo "==> Uploading standalone bundle..."
rsync -az --delete \
  --exclude=".env*" \
  "$LOCAL_DIR/.next/standalone/" "$REMOTE_USER_HOST:$REMOTE_APP_DIR/"

# public + static harus ada di root app (standalone menaruhnya terpisah)
rsync -az "$LOCAL_DIR/.next/static/" "$REMOTE_USER_HOST:$REMOTE_APP_DIR/.next/static/"
rsync -az "$LOCAL_DIR/public/" "$REMOTE_USER_HOST:$REMOTE_APP_DIR/public/"

# server.js entry
rsync -az "$LOCAL_DIR/server.js" "$REMOTE_USER_HOST:$REMOTE_APP_DIR/server.js"
rsync -az "$LOCAL_DIR/package.json" "$REMOTE_USER_HOST:$REMOTE_APP_DIR/package.json"

echo "==> Migrating database on server..."
ssh "$REMOTE_USER_HOST" "cd $REMOTE_APP_DIR && bunx drizzle-kit migrate"

echo "==> Restart hint: lakukan 'Restart' pada Node.js App di cPanel."
echo "==> Done."
