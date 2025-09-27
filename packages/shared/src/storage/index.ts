import { Bookmark, BookmarkFolder, SyncState, UISettings } from '../types';
import { STORAGE_KEYS } from '../constants';

/**
 * Abstract storage interface for different storage backends
 */
export interface StorageInterface {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  getAllKeys(): Promise<string[]>;
}

/**
 * Chrome Extension Storage implementation
 */
export class ChromeStorage implements StorageInterface {
  private storage: chrome.storage.StorageArea;

  constructor(storageType: 'local' | 'sync' = 'local') {
    if (typeof chrome === 'undefined' || !chrome.storage) {
      throw new Error('Chrome storage API not available');
    }
    this.storage = storageType === 'sync' ? chrome.storage.sync : chrome.storage.local;
  }

  async get<T>(key: string): Promise<T | null> {
    return new Promise((resolve, reject) => {
      this.storage.get([key], (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(result[key] || null);
        }
      });
    });
  }

  async set<T>(key: string, value: T): Promise<void> {
    return new Promise((resolve, reject) => {
      this.storage.set({ [key]: value }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  }

  async remove(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.storage.remove([key], () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  }

  async clear(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.storage.clear(() => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  }

  async getAllKeys(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.storage.get(null, (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(Object.keys(result));
        }
      });
    });
  }
}

/**
 * IndexedDB Storage implementation
 */
export class IndexedDBStorage implements StorageInterface {
  private dbName: string;
  private dbVersion: number;
  private db: IDBDatabase | null = null;

  constructor(dbName: string = 'UBM_Storage', dbVersion: number = 1) {
    this.dbName = dbName;
    this.dbVersion = dbVersion;
  }

  private async openDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(new Error('Failed to open IndexedDB'));
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('storage')) {
          db.createObjectStore('storage', { keyPath: 'key' });
        }
      };
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['storage'], 'readonly');
      const store = transaction.objectStore('storage');
      const request = store.get(key);

      request.onerror = () => reject(new Error('Failed to get item from IndexedDB'));
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.value : null);
      };
    });
  }

  async set<T>(key: string, value: T): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['storage'], 'readwrite');
      const store = transaction.objectStore('storage');
      const request = store.put({ key, value });

      request.onerror = () => reject(new Error('Failed to set item in IndexedDB'));
      request.onsuccess = () => resolve();
    });
  }

  async remove(key: string): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['storage'], 'readwrite');
      const store = transaction.objectStore('storage');
      const request = store.delete(key);

      request.onerror = () => reject(new Error('Failed to remove item from IndexedDB'));
      request.onsuccess = () => resolve();
    });
  }

  async clear(): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['storage'], 'readwrite');
      const store = transaction.objectStore('storage');
      const request = store.clear();

      request.onerror = () => reject(new Error('Failed to clear IndexedDB'));
      request.onsuccess = () => resolve();
    });
  }

  async getAllKeys(): Promise<string[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['storage'], 'readonly');
      const store = transaction.objectStore('storage');
      const request = store.getAllKeys();

      request.onerror = () => reject(new Error('Failed to get keys from IndexedDB'));
      request.onsuccess = () => resolve(request.result as string[]);
    });
  }
}

/**
 * Storage Manager for bookmark data
 */
export class BookmarkStorage {
  private storage: StorageInterface;

  constructor(storage: StorageInterface) {
    this.storage = storage;
  }

  // Bookmarks
  async getBookmarks(): Promise<Bookmark[]> {
    const bookmarks = await this.storage.get<Bookmark[]>(STORAGE_KEYS.BOOKMARKS);
    return bookmarks || [];
  }

  async saveBookmarks(bookmarks: Bookmark[]): Promise<void> {
    await this.storage.set(STORAGE_KEYS.BOOKMARKS, bookmarks);
  }

  async addBookmark(bookmark: Bookmark): Promise<void> {
    const bookmarks = await this.getBookmarks();
    bookmarks.push(bookmark);
    await this.saveBookmarks(bookmarks);
  }

  async updateBookmark(updatedBookmark: Bookmark): Promise<void> {
    const bookmarks = await this.getBookmarks();
    const index = bookmarks.findIndex(b => b.id === updatedBookmark.id);
    if (index !== -1) {
      bookmarks[index] = updatedBookmark;
      await this.saveBookmarks(bookmarks);
    }
  }

  async removeBookmark(bookmarkId: string): Promise<void> {
    const bookmarks = await this.getBookmarks();
    const filtered = bookmarks.filter(b => b.id !== bookmarkId);
    await this.saveBookmarks(filtered);
  }

  // Folders
  async getFolders(): Promise<BookmarkFolder[]> {
    const folders = await this.storage.get<BookmarkFolder[]>(STORAGE_KEYS.FOLDERS);
    return folders || [];
  }

  async saveFolders(folders: BookmarkFolder[]): Promise<void> {
    await this.storage.set(STORAGE_KEYS.FOLDERS, folders);
  }

  async addFolder(folder: BookmarkFolder): Promise<void> {
    const folders = await this.getFolders();
    folders.push(folder);
    await this.saveFolders(folders);
  }

  async updateFolder(updatedFolder: BookmarkFolder): Promise<void> {
    const folders = await this.getFolders();
    const index = folders.findIndex(f => f.id === updatedFolder.id);
    if (index !== -1) {
      folders[index] = updatedFolder;
      await this.saveFolders(folders);
    }
  }

  async removeFolder(folderId: string): Promise<void> {
    const folders = await this.getFolders();
    const filtered = folders.filter(f => f.id !== folderId);
    await this.saveFolders(filtered);
  }

  // Settings
  async getSettings(): Promise<UISettings | null> {
    return await this.storage.get<UISettings>(STORAGE_KEYS.SETTINGS);
  }

  async saveSettings(settings: UISettings): Promise<void> {
    await this.storage.set(STORAGE_KEYS.SETTINGS, settings);
  }

  // Sync state
  async getSyncState(): Promise<SyncState | null> {
    return await this.storage.get<SyncState>(STORAGE_KEYS.SYNC_STATE);
  }

  async saveSyncState(syncState: SyncState): Promise<void> {
    await this.storage.set(STORAGE_KEYS.SYNC_STATE, syncState);
  }

  // Utility methods
  async exportAllData(): Promise<{
    bookmarks: Bookmark[];
    folders: BookmarkFolder[];
    settings: UISettings | null;
    exportTimestamp: number;
  }> {
    const [bookmarks, folders, settings] = await Promise.all([
      this.getBookmarks(),
      this.getFolders(),
      this.getSettings()
    ]);

    return {
      bookmarks,
      folders,
      settings,
      exportTimestamp: Date.now()
    };
  }

  async importAllData(data: {
    bookmarks: Bookmark[];
    folders: BookmarkFolder[];
    settings?: UISettings;
  }): Promise<void> {
    await Promise.all([
      this.saveBookmarks(data.bookmarks),
      this.saveFolders(data.folders),
      data.settings ? this.saveSettings(data.settings) : Promise.resolve()
    ]);
  }
}