# Universal Bookmark Manager (Browser Extension)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2+-61dafb.svg)](https://reactjs.org/)
[![Chrome Extension](https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-brightgreen.svg)](https://developer.chrome.com/docs/extensions/mv3/)

A powerful cross-browser extension for managing bookmarks with advanced features including real-time sync, fuzzy search, drag-and-drop organization, and cloud backup integration.

## 🌟 Features

### Core Functionality
- **Cross-Browser Support**: Chrome, Firefox, Safari, Edge (Manifest V3)
- **Advanced Search**: Fuzzy search with configurable thresholds
- **Real-time Sync**: IndexedDB + Chrome Storage API + WebSocket integration
- **Drag & Drop**: Intuitive bookmark organization
- **Bulk Operations**: Import/Export in multiple formats (HTML, JSON, CSV, Markdown)

### Security & Privacy
- **AES-256 Encryption**: Client-side data encryption
- **OAuth 2.0 Integration**: Secure cloud backup (Google Drive, Dropbox)
- **Local-first**: Data stored locally with optional cloud sync
- **No tracking**: Complete privacy-focused design

### Advanced Features
- **Native Messaging**: Access local bookmark databases (SQLite, JSON)
- **Conflict Resolution**: Smart duplicate handling
- **Metadata Extraction**: Auto-fetch page titles, descriptions, thumbnails
- **Tag System**: Organize with hashtags and custom folders
- **Dark Mode**: Responsive UI with theme support

## 🏗️ Architecture

This project uses a **monorepo structure** with the following packages:

```
packages/
├── shared/           # Common utilities, types, and constants
├── extension/        # Browser extension (Manifest V3)
├── dashboard/        # React dashboard (opens in new tab)
└── native-messaging/ # Native host for local database access
```

### Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Extension** | TypeScript, WebExtensions API | Core browser extension functionality |
| **Dashboard** | React 18, TypeScript, Tailwind CSS | Full-featured bookmark management UI |
| **Native Host** | Node.js, SQLite3 | Local bookmark database extraction |
| **Shared** | TypeScript, Crypto-JS, Fuse.js | Common utilities and types |
| **Build** | Vite, npm workspaces | Modern build system |
| **Testing** | Jest, TypeScript | Unit and integration testing |

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/universal-bookmark-manager.git
   cd universal-bookmark-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build all packages**
   ```bash
   npm run build
   ```

4. **Load extension in browser**

   **Chrome:**
   1. Open `chrome://extensions/`
   2. Enable "Developer mode"
   3. Click "Load unpacked"
   4. Select `packages/extension/dist/chrome/`

   **Firefox:**
   1. Open `about:debugging`
   2. Click "This Firefox"
   3. Click "Load Temporary Add-on"
   4. Select `packages/extension/dist/firefox/manifest.json`

### Development

1. **Start development servers**
   ```bash
   npm run dev
   ```

2. **Build for specific browser**
   ```bash
   npm run build:chrome   # Chrome build
   npm run build:firefox  # Firefox build
   ```

3. **Install native messaging host**
   ```bash
   npm run install:native
   ```

## 📖 Usage Guide

### Basic Operations

#### Adding Bookmarks
1. **Right-click** on any webpage → "Add to Universal Bookmarks"
2. **Click extension icon** → Use popup interface
3. **Keyboard shortcut**: Ctrl+Shift+D (customizable)

#### Opening Dashboard
1. **Click extension icon** → "Open Dashboard"
2. **Right-click extension icon** → "Open Bookmark Dashboard"
3. **Navigate to**: `chrome-extension://[extension-id]/dashboard/index.html`

#### Search & Organization
- **Fuzzy Search**: Type in search box, supports typos and partial matches
- **Tag Filtering**: Use `#tag` syntax or filter by tags
- **Folder Navigation**: Organize bookmarks in custom folders
- **Drag & Drop**: Reorder bookmarks and move between folders

### Advanced Features

#### Cloud Backup Setup
1. Open **Settings** in dashboard
2. Navigate to **Cloud Backup**
3. Connect **Google Drive** or **Dropbox**
4. Configure **auto-backup** interval
5. Set **encryption password** (recommended)

#### Import/Export Data
```typescript
// Export bookmarks
const data = await bookmarkManager.exportBookmarks('json');

// Import bookmarks
await bookmarkManager.importBookmarks(data);
```

#### Native Database Access
The extension can extract bookmarks from browser databases:
- **Chrome**: `%LOCALAPPDATA%\Google\Chrome\User Data\Default\Bookmarks`
- **Firefox**: `%APPDATA%\Mozilla\Firefox\Profiles\[profile]\places.sqlite`
- **Safari**: `~/Library/Safari/Bookmarks.plist`

## 🔧 Configuration

### Environment Variables

Create `.env` files for configuration:

```bash
# packages/shared/.env
GOOGLE_CLIENT_ID=your_google_client_id
DROPBOX_CLIENT_ID=your_dropbox_client_id

# packages/extension/.env
EXTENSION_KEY=your_extension_key_for_consistent_id
```

### Manifest Configuration

The extension supports multiple browser targets through build-time configuration:

```json
{
  "manifest_version": 3,
  "permissions": [
    "storage", "bookmarks", "tabs", "activeTab",
    "identity", "nativeMessaging", "contextMenus"
  ],
  "host_permissions": ["<all_urls>"],
  "oauth2": {
    "client_id": "YOUR_GOOGLE_CLIENT_ID",
    "scopes": ["https://www.googleapis.com/auth/drive.file"]
  }
}
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Test specific package
npm run test --workspace=shared
npm run test --workspace=extension
npm run test --workspace=dashboard

# Coverage report
npm run test:coverage
```

### Test Structure
```
tests/
├── unit/           # Unit tests for individual components
├── integration/    # Integration tests for workflows
└── e2e/           # End-to-end browser tests
```

## 📦 Build & Deployment

### Development Build
```bash
npm run dev          # Start all dev servers
npm run dev:extension # Extension only
npm run dev:dashboard # Dashboard only
```

### Production Build
```bash
npm run build                    # Build all packages
npm run build:chrome            # Chrome-specific build
npm run build:firefox           # Firefox-specific build
cross-env TARGET_BROWSER=safari npm run build:extension
```

### Extension Packaging
```bash
# Create distribution packages
npm run package:chrome   # Creates chrome-extension.zip
npm run package:firefox  # Creates firefox-addon.xpi
```

## 🔐 Security

### Data Protection
- **Local Storage**: All data encrypted with AES-256
- **Cloud Backup**: End-to-end encryption before upload
- **API Keys**: Stored securely in extension storage
- **Permissions**: Minimal required permissions only

### Privacy Policy
This extension:
- ✅ Stores data locally by default
- ✅ Encrypts sensitive data
- ✅ No telemetry or tracking
- ✅ Open source for transparency
- ❌ No data collection without consent
- ❌ No third-party analytics

## 🤝 Contributing

### Development Setup
1. **Fork** the repository
2. **Create** feature branch: `git checkout -b feature/amazing-feature`
3. **Install** dependencies: `npm install`
4. **Make** changes and add tests
5. **Run** tests: `npm test`
6. **Commit** changes: `git commit -m 'Add amazing feature'`
7. **Push** to branch: `git push origin feature/amazing-feature`
8. **Open** Pull Request

### Code Style
- **TypeScript** for all new code
- **ESLint** for linting
- **Prettier** for formatting
- **Jest** for testing
- **Conventional Commits** for commit messages

### Issue Reporting
Please use the issue templates and include:
- **Browser version** and extension version
- **Steps to reproduce** the issue
- **Expected behavior** vs actual behavior
- **Console errors** (if applicable)
- **Screenshots** (if helpful)

## 📚 API Reference

### Extension Messaging API

```typescript
// Send message to extension
const response = await chrome.runtime.sendMessage({
  type: MessageType.GET_BOOKMARKS,
  data: { folder: 'work' }
});

// Background script message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case MessageType.ADD_BOOKMARK:
      // Handle bookmark creation
      break;
  }
});
```

### Storage API

```typescript
import { BookmarkStorage, ChromeStorage } from '@shared';

const storage = new BookmarkStorage(new ChromeStorage());

// CRUD operations
await storage.addBookmark(bookmark);
await storage.updateBookmark(updatedBookmark);
await storage.removeBookmark(bookmarkId);
const bookmarks = await storage.getBookmarks();
```

### Search API

```typescript
import { BookmarkManager } from '@extension/background';

const manager = new BookmarkManager();

// Search with options
const results = await manager.searchBookmarks({
  query: 'react tutorial',
  fuzzy: true,
  maxResults: 10,
  tags: ['programming', 'javascript']
});
```

## 🛠️ Troubleshooting

### Common Issues

#### Extension Not Loading
1. Check browser developer mode is enabled
2. Verify manifest.json syntax
3. Check console for errors: `chrome://extensions/`

#### Native Messaging Fails
1. Ensure native host is installed: `npm run install:native`
2. Check native host permissions
3. Verify browser can find native manifest

#### Sync Issues
1. Check network connectivity
2. Verify OAuth tokens are valid
3. Check IndexedDB storage limits

#### Build Failures
1. Clear node_modules: `rm -rf node_modules && npm install`
2. Clear build cache: `npm run clean`
3. Check Node.js version compatibility

### Debug Mode
Enable debug logging:
```typescript
// In extension background script
console.log('Debug mode enabled');
localStorage.setItem('ubm_debug', 'true');
```

### Performance Optimization
- **Lazy Loading**: Components loaded on demand
- **Virtual Scrolling**: Handle large bookmark lists
- **Debounced Search**: Reduce API calls
- **Cached Results**: Store search results locally

## 📊 Browser Compatibility

| Browser | Version | Manifest | Status |
|---------|---------|----------|--------|
| Chrome | 88+ | V3 | ✅ Full Support |
| Firefox | 109+ | V3 | ✅ Full Support |
| Safari | 14+ | V3 | 🚧 In Progress |
| Edge | 88+ | V3 | ✅ Full Support |

## 🗺️ Roadmap

### Version 1.1
- [ ] Safari extension support
- [ ] Advanced bookmark analytics
- [ ] Bookmark sharing features
- [ ] Mobile companion app

### Version 1.2
- [ ] AI-powered bookmark categorization
- [ ] Social bookmark sharing
- [ ] Advanced collaboration features
- [ ] Plugin system for extensibility

### Version 2.0
- [ ] Cross-device real-time sync
- [ ] Machine learning recommendations
- [ ] Enterprise features
- [ ] Advanced security options

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **WebExtensions API** community for excellent documentation
- **React** team for the amazing framework
- **Fuse.js** for fuzzy search capabilities
- **Crypto-JS** for encryption utilities
- **Tailwind CSS** for styling framework

## 📞 Support

- **Documentation**: [Wiki](https://github.com/your-username/universal-bookmark-manager/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/universal-bookmark-manager/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/universal-bookmark-manager/discussions)
- **Email**: support@ubm.dev

---

**Made with ❤️ by the Universal Bookmark Manager Team**