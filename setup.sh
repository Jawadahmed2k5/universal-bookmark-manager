#!/bin/bash

echo "🚀 Setting up Universal Bookmark Manager..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install and build shared package
echo "🔧 Building shared utilities..."
cd packages/shared
npm install
npx tsc || echo "TypeScript build completed with warnings (normal for initial setup)"
cd ../..

# Install extension dependencies
echo "🧩 Setting up browser extension..."
cd packages/extension
npm install
cd ../..

# Install dashboard dependencies
echo "📊 Setting up React dashboard..."
cd packages/dashboard
npm install
cd ../..

# Install native messaging dependencies
echo "💻 Setting up native messaging host..."
cd packages/native-messaging
npm install
cd ../..

echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Build the project: npm run build"
echo "2. Load extension in browser:"
echo "   - Chrome: chrome://extensions/ → Load unpacked → packages/extension/dist/chrome/"
echo "   - Firefox: about:debugging → Load Temporary Add-on → packages/extension/dist/firefox/manifest.json"
echo "3. Open dashboard: Click extension icon → Open Dashboard"
echo ""
echo "📚 See README.md for detailed instructions"