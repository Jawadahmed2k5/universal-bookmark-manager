import { Bookmark, BookmarkFolder, SearchOptions, SearchResult } from '../types';

/**
 * Generate a unique ID for bookmarks and folders
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:', 'ftp:', 'file:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return '';
  }
}

/**
 * Get favicon URL for a given website URL
 */
export function getFaviconUrl(url: string): string {
  const domain = extractDomain(url);
  if (!domain) return '';
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
}

/**
 * Sanitize bookmark title
 */
export function sanitizeTitle(title: string): string {
  return title.trim().replace(/[\n\r\t]/g, ' ').replace(/\s+/g, ' ');
}

/**
 * Extract tags from text using hashtags
 */
export function extractTags(text: string): string[] {
  const tagRegex = /#([a-zA-Z0-9_-]+)/g;
  const tags: string[] = [];
  let match;
  
  while ((match = tagRegex.exec(text)) !== null) {
    tags.push(match[1].toLowerCase());
  }
  
  return [...new Set(tags)]; // Remove duplicates
}

/**
 * Calculate reading time based on content
 */
export function calculateReadingTime(wordCount: number): number {
  const wordsPerMinute = 225; // Average reading speed
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Debounce function for search queries
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T;
  if (typeof obj === 'object') {
    const cloned = {} as Record<string, any>;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned as T;
  }
  return obj;
}

/**
 * Compare two bookmarks for equality
 */
export function bookmarksEqual(a: Bookmark, b: Bookmark): boolean {
  return (
    a.id === b.id &&
    a.title === b.title &&
    a.url === b.url &&
    a.folder === b.folder &&
    JSON.stringify(a.tags.sort()) === JSON.stringify(b.tags.sort()) &&
    a.description === b.description
  );
}

/**
 * Sort bookmarks by various criteria
 */
export function sortBookmarks(
  bookmarks: Bookmark[],
  sortBy: 'title' | 'date' | 'url' | 'visitCount',
  order: 'asc' | 'desc' = 'asc'
): Bookmark[] {
  const sorted = [...bookmarks].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'date':
        comparison = a.dateAdded - b.dateAdded;
        break;
      case 'url':
        comparison = a.url.localeCompare(b.url);
        break;
      case 'visitCount':
        comparison = a.visitCount - b.visitCount;
        break;
    }
    
    return order === 'desc' ? -comparison : comparison;
  });
  
  return sorted;
}

/**
 * Filter bookmarks based on search criteria
 */
export function filterBookmarks(
  bookmarks: Bookmark[],
  options: Partial<SearchOptions>
): Bookmark[] {
  return bookmarks.filter(bookmark => {
    // Filter by tags
    if (options.tags && options.tags.length > 0) {
      const hasMatchingTag = options.tags.some(tag =>
        bookmark.tags.includes(tag.toLowerCase())
      );
      if (!hasMatchingTag) return false;
    }
    
    // Filter by folders
    if (options.folders && options.folders.length > 0) {
      if (!options.folders.includes(bookmark.folder)) return false;
    }
    
    // Filter by date range
    if (options.dateRange) {
      const bookmarkDate = new Date(bookmark.dateAdded);
      if (bookmarkDate < options.dateRange.start || bookmarkDate > options.dateRange.end) {
        return false;
      }
    }
    
    // Filter by sources
    if (options.sources && options.sources.length > 0) {
      if (!options.sources.includes(bookmark.source)) return false;
    }
    
    return true;
  });
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format date in relative time
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minute = 60 * 1000;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30;
  const year = day * 365;
  
  if (diff < minute) return 'Just now';
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  if (diff < week) return `${Math.floor(diff / day)}d ago`;
  if (diff < month) return `${Math.floor(diff / week)}w ago`;
  if (diff < year) return `${Math.floor(diff / month)}mo ago`;
  return `${Math.floor(diff / year)}y ago`;
}

/**
 * Validate bookmark data
 */
export function validateBookmark(bookmark: Partial<Bookmark>): string[] {
  const errors: string[] = [];
  
  if (!bookmark.title || bookmark.title.trim().length === 0) {
    errors.push('Title is required');
  }
  
  if (!bookmark.url || !isValidUrl(bookmark.url)) {
    errors.push('Valid URL is required');
  }
  
  if (!bookmark.folder || bookmark.folder.trim().length === 0) {
    errors.push('Folder is required');
  }
  
  return errors;
}

/**
 * Create a safe filename from bookmark title
 */
export function createSafeFilename(title: string, extension: string = ''): string {
  const safe = title
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase()
    .substring(0, 50);
  
  return extension ? `${safe}.${extension}` : safe;
}