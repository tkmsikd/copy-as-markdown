#!/bin/bash
set -e

# Clean
rm -rf dist
mkdir -p dist/popup dist/icons

# TypeScript → JavaScript (esbuild for speed)
npx esbuild src/background.ts --bundle --outfile=dist/background.js --format=esm --target=es2022
npx esbuild src/content.ts --bundle --outfile=dist/content.js --format=iife --target=es2022
npx esbuild src/popup/popup.ts --bundle --outfile=dist/popup/popup.js --format=iife --target=es2022

# Copy static files
cp manifest.json dist/manifest.json
cp src/popup/popup.html dist/popup/popup.html
cp src/popup/popup.css dist/popup/popup.css

# Copy icons (if exist)
cp icons/*.png dist/icons/ 2>/dev/null || true

# Fix manifest paths for dist
cd dist
sed -i '' 's|src/background.ts|background.js|g' manifest.json
sed -i '' 's|src/content.ts|content.js|g' manifest.json
sed -i '' 's|src/popup/popup.html|popup/popup.html|g' manifest.json

# Fix popup.html script reference
sed -i '' 's|popup.ts" type="module"|popup.js"|g' popup/popup.html

echo "✅ Build complete! Load 'dist/' in chrome://extensions/"

# Optional: create ZIP for Chrome Web Store
if [ "$1" = "--zip" ]; then
  cd ..
  VERSION=$(node -p "require('./manifest.json').version")
  ZIP_NAME="copy-as-markdown-v${VERSION}.zip"
  rm -f "$ZIP_NAME"
  cd dist && zip -r "../$ZIP_NAME" . && cd ..
  echo "📦 Created $ZIP_NAME for Chrome Web Store upload"
fi
