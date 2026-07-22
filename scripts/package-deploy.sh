#!/usr/bin/env bash
# Package Sistren SOURCE ONLY (small) for cPanel Node.js App.
# Server has bun -> run `bun install` there (no rm, avoids fork-bomb).
# Includes .next build so no build step needed on server.
set -euo pipefail

LOCAL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$LOCAL_DIR/dist-deploy"
ZIP="$LOCAL_DIR/sistren-deploy.zip"

echo "==> Assembling source bundle in $OUT_DIR ..."
rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"
cp server.js package.json "$OUT_DIR/"
[ -f bun.lockb ] && cp bun.lockb "$OUT_DIR/" || true
cp -r src public .next "$OUT_DIR/"

echo "==> Zipping -> $ZIP"
( cd "$LOCAL_DIR" && rm -f "$ZIP" && zip -r "$ZIP" dist-deploy )

echo "==> Done: $ZIP"
echo "    Upload & extract to /home/sisk7554/nodes/sistren_next via cPanel File Manager."
echo "    cPanel Terminal (NO rm):"
echo "      source /home/sisk7554/nodevenv/nodes/sistren_next/22/bin/activate"
echo "      cd /home/sisk7554/nodes/sistren_next"
echo "      bun install"
echo "      bun server.js   # test; Ctrl+C"
echo "    Then Restart Node.js App (startup = server.js)."
