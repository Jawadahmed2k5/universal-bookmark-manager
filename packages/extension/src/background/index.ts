import browser from 'webextension-polyfill';
import { 
  MessageType, 
  ExtensionMessage, 
  Bookmark, 
  BookmarkSource,
  EXTENSION_URLS,
  generateId,
  getFaviconUrl 
} from '@shared';
import { BookmarkManager } from './bookmark-manager';
import { SyncManager } from './sync-manager';
import { NativeMessagingClient } from './native-messaging';

class BackgroundScript {
  private bookmarkManager: BookmarkManager;
  private syncManager: SyncManager;
  private nativeClient: NativeMessagingClient;

  constructor() {
    this.bookmarkManager = new BookmarkManager();
    this.syncManager = new SyncManager();
    this.nativeClient = new NativeMessagingClient();
    
    this.initializeExtension();
    this.setupMessageListeners();
    this.setupContextMenus();
    this.setupBookmarkListeners();
  }

  private async initializeExtension() {
    try {
      // Initialize storage and sync
      await this.bookmarkManager.initialize();
      await this.syncManager.initialize();
      
      // Start periodic sync
      this.startPeriodicSync();
      
      console.log('Universal Bookmark Manager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize extension:', error);
    }
  }

  private setupMessageListeners() {
    browser.runtime.onMessage.addListener(async (message: ExtensionMessage, sender) => {
      try {
        switch (message.type) {
          case MessageType.GET_BOOKMARKS:
            return await this.bookmarkManager.getAllBookmarks();
            
          case MessageType.ADD_BOOKMARK:
            return await this.bookmarkManager.addBookmark(message.data);
            
          case MessageType.UPDATE_BOOKMARK:
            return await this.bookmarkManager.updateBookmark(message.data);
            
          case MessageType.DELETE_BOOKMARK:
            return await this.bookmarkManager.deleteBookmark(message.data.id);
            
          case MessageType.SEARCH_BOOKMARKS:
            return await this.bookmarkManager.searchBookmarks(message.data);
            
          case MessageType.SYNC_BOOKMARKS:
            return await this.syncManager.performSync();
            
          case MessageType.EXPORT_BOOKMARKS:
            return await this.bookmarkManager.exportBookmarks(message.data.format);
            
          case MessageType.IMPORT_BOOKMARKS:
            return await this.bookmarkManager.importBookmarks(message.data);
            
          case MessageType.GET_SYNC_STATE:
            return await this.syncManager.getSyncState();
            
          case MessageType.OPEN_DASHBOARD:
            await this.openDashboard();
            return { success: true };
            
          default:
            throw new Error(`Unknown message type: ${message.type}`);
        }
      } catch (error) {
        console.error('Error handling message:', error);
        return { 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      }
    });
  }

  private setupContextMenus() {
    browser.contextMenus.create({
      id: 'add-bookmark',
      title: 'Add to Universal Bookmarks',
      contexts: ['page']
    });

    browser.contextMenus.create({
      id: 'open-dashboard',
      title: 'Open Bookmark Dashboard',
      contexts: ['action']
    });

    browser.contextMenus.onClicked.addListener(async (info, tab) => {
      switch (info.menuItemId) {
        case 'add-bookmark':
          if (tab?.url && tab?.title) {
            await this.addCurrentPageBookmark(tab.url, tab.title, tab.favIconUrl);
          }
          break;
          
        case 'open-dashboard':
          await this.openDashboard();
          break;
      }
    });
  }

  private setupBookmarkListeners() {
    // Listen for native bookmark changes to sync with our storage
    if (browser.bookmarks) {
      browser.bookmarks.onCreated.addListener(async (id, bookmark) => {
        if (bookmark.url) {
          await this.syncNativeBookmark('create', bookmark);
        }
      });

      browser.bookmarks.onChanged.addListener(async (id, changeInfo) => {
        const bookmark = await browser.bookmarks.get(id);
        if (bookmark[0]?.url) {
          await this.syncNativeBookmark('update', bookmark[0]);
        }
      });

      browser.bookmarks.onRemoved.addListener(async (id) => {
        await this.bookmarkManager.deleteBookmarkByNativeId(id);
      });
    }
  }

  private async addCurrentPageBookmark(url: string, title: string, favIconUrl?: string) {
    try {
      const bookmark: Omit<Bookmark, 'id'> = {
        title,
        url,
        favicon: favIconUrl || getFaviconUrl(url),
        tags: [],
        folder: 'default',
        description: '',
        dateAdded: Date.now(),
        dateModified: Date.now(),
        visitCount: 0,
        isArchived: false,
        source: this.detectBrowserSource(),
        metadata: {
          pageTitle: title
        }
      };

      const newBookmark = await this.bookmarkManager.addBookmark(bookmark);
      
      // Show notification
      await browser.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Bookmark Added',
        message: `Added "${title}" to your bookmarks`
      });

      return newBookmark;
    } catch (error) {
      console.error('Failed to add bookmark:', error);
      throw error;
    }
  }

  private async syncNativeBookmark(action: 'create' | 'update', nativeBookmark: any) {
    try {
      if (action === 'create') {
        const bookmark: Omit<Bookmark, 'id'> = {
          title: nativeBookmark.title,
          url: nativeBookmark.url,
          favicon: getFaviconUrl(nativeBookmark.url),
          tags: [],
          folder: 'imported',
          description: '',
          dateAdded: nativeBookmark.dateAdded || Date.now(),
          dateModified: Date.now(),
          visitCount: 0,
          isArchived: false,
          source: this.detectBrowserSource(),
          metadata: {
            pageTitle: nativeBookmark.title
          }
        };
        
        await this.bookmarkManager.addBookmark(bookmark);
      }
    } catch (error) {
      console.error('Failed to sync native bookmark:', error);
    }
  }

  private detectBrowserSource(): BookmarkSource {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return BookmarkSource.CHROME;
    if (userAgent.includes('Firefox')) return BookmarkSource.FIREFOX;
    if (userAgent.includes('Safari')) return BookmarkSource.SAFARI;
    if (userAgent.includes('Edge')) return BookmarkSource.EDGE;
    return BookmarkSource.CHROME; // Default
  }

  private async openDashboard() {
    const dashboardUrl = browser.runtime.getURL(EXTENSION_URLS.DASHBOARD);
    
    // Check if dashboard is already open
    const tabs = await browser.tabs.query({ url: dashboardUrl });
    
    if (tabs.length > 0) {
      // Focus existing tab
      await browser.tabs.update(tabs[0].id!, { active: true });
      await browser.windows.update(tabs[0].windowId!, { focused: true });
    } else {
      // Open new tab
      await browser.tabs.create({ url: dashboardUrl });
    }
  }

  private startPeriodicSync() {
    // Sync every 5 minutes
    setInterval(async () => {
      try {
        await this.syncManager.performSync();
      } catch (error) {
        console.error('Periodic sync failed:', error);
      }
    }, 5 * 60 * 1000);
  }
}

// Initialize background script
new BackgroundScript();