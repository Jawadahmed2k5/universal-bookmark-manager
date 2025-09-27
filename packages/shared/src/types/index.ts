// Core bookmark types
export interface Bookmark {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  tags: string[];
  folder: string;
  description?: string;
  dateAdded: number;
  dateModified: number;
  visitCount: number;
  lastVisited?: number;
  isArchived: boolean;
  source: BookmarkSource;
  metadata?: BookmarkMetadata;
}

export interface BookmarkFolder {
  id: string;
  name: string;
  parentId?: string;
  children: string[];
  dateAdded: number;
  dateModified: number;
  color?: string;
  icon?: string;
}

export interface BookmarkMetadata {
  pageTitle?: string;
  pageDescription?: string;
  pageKeywords?: string[];
  thumbnailUrl?: string;
  readingTime?: number;
  wordCount?: number;
}

export enum BookmarkSource {
  CHROME = 'chrome',
  FIREFOX = 'firefox',
  SAFARI = 'safari',
  EDGE = 'edge',
  MANUAL = 'manual',
  IMPORT = 'import'
}

// Sync and storage types
export interface SyncState {
  lastSync: number;
  conflicts: ConflictResolution[];
  pendingChanges: BookmarkChange[];
  syncInProgress: boolean;
}

export interface BookmarkChange {
  id: string;
  type: ChangeType;
  bookmark?: Bookmark;
  timestamp: number;
  source: BookmarkSource;
}

export enum ChangeType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  MOVE = 'move'
}

export interface ConflictResolution {
  conflictId: string;
  localBookmark: Bookmark;
  remoteBookmark: Bookmark;
  resolution: 'local' | 'remote' | 'merge';
  timestamp: number;
}

// Search and filtering types
export interface SearchOptions {
  query: string;
  tags?: string[];
  folders?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  sources?: BookmarkSource[];
  fuzzy?: boolean;
  maxResults?: number;
}

export interface SearchResult {
  bookmark: Bookmark;
  score: number;
  matchedFields: string[];
}

// Extension messaging types
export interface ExtensionMessage {
  type: MessageType;
  data?: any;
  requestId?: string;
}

export enum MessageType {
  GET_BOOKMARKS = 'get_bookmarks',
  ADD_BOOKMARK = 'add_bookmark',
  UPDATE_BOOKMARK = 'update_bookmark',
  DELETE_BOOKMARK = 'delete_bookmark',
  SEARCH_BOOKMARKS = 'search_bookmarks',
  SYNC_BOOKMARKS = 'sync_bookmarks',
  EXPORT_BOOKMARKS = 'export_bookmarks',
  IMPORT_BOOKMARKS = 'import_bookmarks',
  GET_SYNC_STATE = 'get_sync_state',
  OPEN_DASHBOARD = 'open_dashboard'
}

// Cloud storage types
export interface CloudProvider {
  name: string;
  authenticate(): Promise<void>;
  upload(data: string, filename: string): Promise<string>;
  download(fileId: string): Promise<string>;
  delete(fileId: string): Promise<void>;
}

export interface CloudBackup {
  id: string;
  filename: string;
  timestamp: number;
  size: number;
  checksum: string;
  encrypted: boolean;
}

// Native messaging types
export interface NativeMessage {
  command: string;
  data?: any;
  requestId: string;
}

export interface NativeResponse {
  success: boolean;
  data?: any;
  error?: string;
  requestId: string;
}

// UI types
export interface UISettings {
  theme: 'light' | 'dark' | 'auto';
  compactMode: boolean;
  showFavicons: boolean;
  showPreview: boolean;
  defaultView: 'grid' | 'list' | 'tree';
  sortBy: 'title' | 'date' | 'url' | 'custom';
  sortOrder: 'asc' | 'desc';
}

export interface DragDropItem {
  id: string;
  type: 'bookmark' | 'folder';
  data: Bookmark | BookmarkFolder;
}