import browser from 'webextension-polyfill';
import { 
  SyncState, 
  BookmarkChange, 
  ConflictResolution, 
  Bookmark,
  BookmarkStorage,
  ChromeStorage,
  SYNC_SETTINGS,
  ChangeType
} from '@shared';

export class SyncManager {
  private storage: BookmarkStorage;
  private syncInProgress: boolean = false;
  private syncInterval: NodeJS.Timer | null = null;

  constructor() {
    this.storage = new BookmarkStorage(new ChromeStorage());
  }

  async initialize() {
    try {
      // Initialize sync state if it doesn't exist
      let syncState = await this.storage.getSyncState();
      if (!syncState) {
        syncState = {
          lastSync: 0,
          conflicts: [],
          pendingChanges: [],
          syncInProgress: false
        };
        await this.storage.saveSyncState(syncState);
      }

      console.log('Sync manager initialized');
    } catch (error) {
      console.error('Failed to initialize sync manager:', error);
      throw error;
    }
  }

  async performSync(): Promise<{ success: boolean; changes: number; conflicts: number }> {
    if (this.syncInProgress) {
      throw new Error('Sync already in progress');
    }

    this.syncInProgress = true;
    let changes = 0;
    let conflicts = 0;

    try {
      const syncState = await this.storage.getSyncState();
      if (!syncState) {
        throw new Error('Sync state not initialized');
      }

      // Process pending changes
      for (const change of syncState.pendingChanges) {
        try {
          await this.processChange(change);
          changes++;
        } catch (error) {
          console.error('Failed to process change:', change, error);
          conflicts++;
        }
      }

      // Update sync state
      syncState.lastSync = Date.now();
      syncState.pendingChanges = [];
      syncState.syncInProgress = false;
      await this.storage.saveSyncState(syncState);

      return { success: true, changes, conflicts };
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  async addPendingChange(change: BookmarkChange): Promise<void> {
    const syncState = await this.storage.getSyncState();
    if (syncState) {
      syncState.pendingChanges.push(change);
      await this.storage.saveSyncState(syncState);
    }
  }

  async getSyncState(): Promise<SyncState | null> {
    return await this.storage.getSyncState();
  }

  private async processChange(change: BookmarkChange): Promise<void> {
    switch (change.type) {
      case ChangeType.CREATE:
        if (change.bookmark) {
          await this.storage.addBookmark(change.bookmark);
        }
        break;
      case ChangeType.UPDATE:
        if (change.bookmark) {
          await this.storage.updateBookmark(change.bookmark);
        }
        break;
      case ChangeType.DELETE:
        await this.storage.removeBookmark(change.id);
        break;
      default:
        throw new Error(`Unknown change type: ${change.type}`);
    }
  }

  startPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(async () => {
      try {
        await this.performSync();
      } catch (error) {
        console.error('Periodic sync failed:', error);
      }
    }, SYNC_SETTINGS.INTERVAL);
  }

  stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}