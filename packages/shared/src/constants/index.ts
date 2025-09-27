export const APP_NAME = 'Universal Bookmark Manager';
export const APP_VERSION = '1.0.0';

// Storage keys
export const STORAGE_KEYS = {
  BOOKMARKS: 'ubm_bookmarks',
  FOLDERS: 'ubm_folders',
  SETTINGS: 'ubm_settings',
  SYNC_STATE: 'ubm_sync_state',
  ENCRYPTION_KEY: 'ubm_encryption_key',
  AUTH_TOKEN: 'ubm_auth_token',
  CLOUD_BACKUPS: 'ubm_cloud_backups',
  LAST_BACKUP: 'ubm_last_backup'
} as const;

// Extension URLs
export const EXTENSION_URLS = {
  DASHBOARD: '/dashboard/index.html',
  OPTIONS: '/options/index.html',
  POPUP: '/popup/index.html'
} as const;

// Native messaging
export const NATIVE_APP_NAME = 'com.ubm.native_host';
export const NATIVE_MESSAGE_TIMEOUT = 10000; // 10 seconds

// Sync settings
export const SYNC_SETTINGS = {
  INTERVAL: 300000, // 5 minutes
  MAX_RETRIES: 3,
  BATCH_SIZE: 100,
  CONFLICT_RESOLUTION_TIMEOUT: 86400000 // 24 hours
} as const;

// Search settings
export const SEARCH_SETTINGS = {
  MAX_RESULTS: 1000,
  FUZZY_THRESHOLD: 0.4,
  DEBOUNCE_DELAY: 300
} as const;

// File formats
export const SUPPORTED_IMPORT_FORMATS = [
  'html', 'json', 'csv', 'netscape-html'
] as const;

export const SUPPORTED_EXPORT_FORMATS = [
  'html', 'json', 'csv', 'markdown'
] as const;

// Browser detection
export const BROWSER_INFO = {
  CHROME: 'chrome',
  FIREFOX: 'firefox',
  SAFARI: 'safari',
  EDGE: 'edge'
} as const;

// Encryption
export const ENCRYPTION_SETTINGS = {
  ALGORITHM: 'AES-256-GCM',
  KEY_SIZE: 256,
  IV_SIZE: 12,
  TAG_SIZE: 16
} as const;

// OAuth providers
export const OAUTH_PROVIDERS = {
  GOOGLE_DRIVE: {
    CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
    SCOPES: ['https://www.googleapis.com/auth/drive.file'],
    REDIRECT_URI: chrome?.identity?.getRedirectURL?.() || ''
  },
  DROPBOX: {
    CLIENT_ID: process.env.DROPBOX_CLIENT_ID || '',
    REDIRECT_URI: chrome?.identity?.getRedirectURL?.() || ''
  }
} as const;

// Error codes
export const ERROR_CODES = {
  STORAGE_ERROR: 'STORAGE_ERROR',
  SYNC_ERROR: 'SYNC_ERROR',
  ENCRYPTION_ERROR: 'ENCRYPTION_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  NATIVE_HOST_ERROR: 'NATIVE_HOST_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR'
} as const;