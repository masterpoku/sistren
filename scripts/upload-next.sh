#!/usr/bin/env bash
# Upload .next to cPanel in small scp batches (avoids resource limits).
set -uo pipefail
LOCAL="$(cd "$(dirname "$0")/.." && pwd)/.next"
REMOTE="cpanel-sistren:nodes/sistren_next/.next"
SSH_OPTS="-p 2223 -o StrictHostKeyChecking=no"

# manifest files first
echo "==> manifests =="
scp $SSH_OPTS "$LOCAL"/BUILD_ID "$LOCAL"/export-marker.json "$LOCAL"/build-manifest.json \
  "$LOCAL"/fallback-build-manifest.json "$LOCAL"/images-manifest.json "$LOCAL"/prerender-manifest.json \
  "$LOCAL"/required-server-files.json "$LOCAL"/required-server-files.js "$LOCAL"/routes-manifest.json \
  "$LOCAL"/app-path-routes-manifest.json "$LOCAL"/next-server.js.nft.json "$LOCAL"/next-minimal-server.js.nft.json \
  "$LOCAL"/package.json "$LOCAL"/next-minimal-server.js.nft.json "$REMOTE/" 2>&1 | tail -3

echo "==> static/ =="
scp -r $SSH_OPTS "$LOCAL"/static "$REMOTE/" 2>&1 | tail -3

echo "==> server/ (per subdir) =="
for d in "$LOCAL"/server/*/; do
  name="$(basename "$d")"
  scp -r $SSH_OPTS "$LOCAL/server/$name" "$REMOTE/server/" 2>&1 | tail -2
done
# top-level server files
scp $SSH_OPTS "$LOCAL"/server/*.js "$LOCAL"/server/*.json "$LOCAL"/server/*.node "$REMOTE/server/" 2>&1 | tail -2

echo "==> DONE"
