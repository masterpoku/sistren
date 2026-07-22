#!/usr/bin/env bash
# Package Sistren for cPanel Node.js App (upload & extract, then npm install).
# Produces sistren-deploy.zip containing source + built .next (no build on server).
set -euo pipefail

LOCAL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$LOCAL_DIR/dist-deploy"
ZIP="$LOCAL_DIR/sistren-deploy.zip"
IGNORE="$LOCAL_DIR/.deployignore"

cd "$LOCAL_DIR"

echo "==> Building..."
bun run build

echo "==> Assembling bundle in $OUT_DIR ..."
rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

# Copy everything except ignored paths
if command -v rsync >/dev/null 2>&1; then
  rsync -a --exclude-from="$IGNORE" "$LOCAL_DIR/" "$OUT_DIR/"
else
  # fallback: manual copy of common needed items
  cp -r src public .next package.json "$OUT_DIR/"
  [ -f bun.lockb ] && cp bun.lockb "$OUT_DIR/" || true
  [ -f package-lock.json ] && cp package-lock.json "$OUT_DIR/" || true
  [ -f next.config.ts ] && cp next.config.ts "$OUT_DIR/" || true
  [ -f next.config.js ] && cp next.config.js "$OUT_DIR/" || true
  [ -f tsconfig.json ] && cp tsconfig.json "$OUT_DIR/" || true
  [ -f drizzle.config.ts ] && cp drizzle.config.ts "$OUT_DIR/" || true
  [ -f .env.example ] && cp .env.example "$OUT_DIR/" || true
fi

echo "==> Zipping -> $ZIP"
rm -f "$ZIP"
( cd "$LOCAL_DIR" && zip -r "$ZIP" "$(basename "$OUT_DIR")" )

echo "==> Done: $ZIP"
echo "    Size: $(du -h "$ZIP" | cut -f1)"
echo ""
echo "    Next steps on cPanel:"
echo "    1. Upload & extract to your Node.js App root."
echo "    2. Create .env from .env.example (set DATABASE_URL, BETTER_AUTH_SECRET,"
echo "       BETTER_AUTH_URL, DOCUMENT_ENCRYPTION_KEY, NODE_ENV=production)."
echo "    3. Terminal: npm install"
echo "    4. Terminal: npx drizzle-kit push   (or migrate)"
echo "    5. Node.js App startup command: npm run start"
