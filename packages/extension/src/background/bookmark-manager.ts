import browser from 'webextension-polyfill';
import { 
  Bookmark, 
  BookmarkFolder, 
  SearchOptions, 
  SearchResult,
  BookmarkStorage,
  ChromeStorage,
  generateId,
  filterBookmarks,
  sortBookmarks,
  validateBookmark
} from '@shared';
import Fuse from 'fuse.js';

export class BookmarkManager {
  private storage: BookmarkStorage;
  private searchIndex: Fuse<Bookmark> | null = null;

  constructor() {
    this.storage = new BookmarkStorage(new ChromeStorage());
  }

  async initialize() {
    try {
      // Initialize default folder structure if needed
      const folders = await this.storage.getFolders();
      if (folders.length === 0) {
        await this.createDefaultFolders();
      }
      
      // Build search index
      await this.buildSearchIndex();
      
      console.log('Bookmark manager initialized');
    } catch (error) {
      console.error('Failed to initialize bookmark manager:', error);
      throw error;
    }
  }

  async getAllBookmarks(): Promise<Bookmark[]> {
    return await this.storage.getBookmarks();
  }

  async getAllFolders(): Promise<BookmarkFolder[]> {
    return await this.storage.getFolders();
  }

  async addBookmark(bookmarkData: Omit<Bookmark, 'id'>): Promise<Bookmark> {
    // Validate bookmark data
    const errors = validateBookmark(bookmarkData);
    if (errors.length > 0) {
      throw new Error(`Invalid bookmark data: ${errors.join(', ')}`);
    }

    const bookmark: Bookmark = {
      ...bookmarkData,
      id: generateId(),
      dateAdded: Date.now(),
      dateModified: Date.now()
    };

    await this.storage.addBookmark(bookmark);
    await this.buildSearchIndex(); // Rebuild search index
    
    return bookmark;
  }

  async updateBookmark(updatedBookmark: Bookmark): Promise<Bookmark> {
    // Validate updated bookmark
    const errors = validateBookmark(updatedBookmark);
    if (errors.length > 0) {
      throw new Error(`Invalid bookmark data: ${errors.join(', ')}`);
    }

    updatedBookmark.dateModified = Date.now();
    await this.storage.updateBookmark(updatedBookmark);
    await this.buildSearchIndex(); // Rebuild search index
    
    return updatedBookmark;
  }

  async deleteBookmark(bookmarkId: string): Promise<void> {
    await this.storage.removeBookmark(bookmarkId);
    await this.buildSearchIndex(); // Rebuild search index
  }

  async deleteBookmarkByNativeId(nativeId: string): Promise<void> {
    const bookmarks = await this.getAllBookmarks();
    const bookmark = bookmarks.find(b => b.metadata?.nativeId === nativeId);
    
    if (bookmark) {
      await this.deleteBookmark(bookmark.id);
    }
  }

  async searchBookmarks(options: SearchOptions): Promise<SearchResult[]> {
    const bookmarks = await this.getAllBookmarks();
    
    // Apply filters first
    let filteredBookmarks = filterBookmarks(bookmarks, options);
    
    // If there's a search query, use fuzzy search
    if (options.query && options.query.trim()) {
      if (options.fuzzy !== false) {
        return this.performFuzzySearch(options.query, filteredBookmarks, options.maxResults);
      } else {
        // Simple text search
        const query = options.query.toLowerCase();
        filteredBookmarks = filteredBookmarks.filter(bookmark => 
          bookmark.title.toLowerCase().includes(query) ||
          bookmark.url.toLowerCase().includes(query) ||
          bookmark.description?.toLowerCase().includes(query) ||
          bookmark.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }
    }
    
    // Sort results
    const sortedBookmarks = sortBookmarks(filteredBookmarks, 'title', 'asc');
    
    // Convert to search results
    const results: SearchResult[] = sortedBookmarks.map(bookmark => ({
      bookmark,
      score: 1.0,
      matchedFields: ['title'] // Default matched field
    }));
    
    // Apply max results limit
    return options.maxResults ? results.slice(0, options.maxResults) : results;
  }

  private async performFuzzySearch(
    query: string, 
    bookmarks: Bookmark[], 
    maxResults?: number
  ): Promise<SearchResult[]> {
    if (!this.searchIndex) {
      await this.buildSearchIndex();
    }
    
    if (!this.searchIndex) {
      throw new Error('Search index not available');
    }
    
    const fuseResults = this.searchIndex.search(query, {
      limit: maxResults || 100
    });
    
    return fuseResults.map(result => ({
      bookmark: result.item,
      score: 1 - (result.score || 0),
      matchedFields: result.matches?.map(match => match.key || '') || []
    }));
  }

  private async buildSearchIndex() {
    try {
      const bookmarks = await this.getAllBookmarks();
      
      this.searchIndex = new Fuse(bookmarks, {
        keys: [
          { name: 'title', weight: 0.4 },
          { name: 'url', weight: 0.3 },
          { name: 'description', weight: 0.2 },
          { name: 'tags', weight: 0.1 }
        ],
        threshold: 0.4,
        includeScore: true,
        includeMatches: true,
        minMatchCharLength: 2
      });
      
      console.log(`Search index built for ${bookmarks.length} bookmarks`);
    } catch (error) {
      console.error('Failed to build search index:', error);
    }
  }

  async addFolder(folderData: Omit<BookmarkFolder, 'id'>): Promise<BookmarkFolder> {
    const folder: BookmarkFolder = {
      ...folderData,
      id: generateId(),
      dateAdded: Date.now(),
      dateModified: Date.now()
    };

    await this.storage.addFolder(folder);
    return folder;
  }

  async updateFolder(updatedFolder: BookmarkFolder): Promise<BookmarkFolder> {
    updatedFolder.dateModified = Date.now();
    await this.storage.updateFolder(updatedFolder);
    return updatedFolder;
  }

  async deleteFolder(folderId: string): Promise<void> {
    // Move bookmarks in this folder to default folder
    const bookmarks = await this.getAllBookmarks();
    const bookmarksInFolder = bookmarks.filter(b => b.folder === folderId);
    
    for (const bookmark of bookmarksInFolder) {
      bookmark.folder = 'default';
      await this.updateBookmark(bookmark);
    }
    
    await this.storage.removeFolder(folderId);
  }

  async exportBookmarks(format: 'json' | 'html' | 'csv' | 'markdown'): Promise<string> {
    const data = await this.storage.exportAllData();
    
    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);
        
      case 'html':
        return this.generateHTMLExport(data.bookmarks, data.folders);
        
      case 'csv':
        return this.generateCSVExport(data.bookmarks);
        
      case 'markdown':
        return this.generateMarkdownExport(data.bookmarks, data.folders);
        
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  async importBookmarks(data: any): Promise<{ imported: number; errors: string[] }> {
    let imported = 0;
    const errors: string[] = [];
    
    try {
      if (Array.isArray(data.bookmarks)) {
        for (const bookmarkData of data.bookmarks) {
          try {
            await this.addBookmark(bookmarkData);
            imported++;
          } catch (error) {
            errors.push(`Failed to import bookmark "${bookmarkData.title}": ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      }
      
      if (Array.isArray(data.folders)) {
        for (const folderData of data.folders) {
          try {
            await this.addFolder(folderData);
          } catch (error) {
            errors.push(`Failed to import folder "${folderData.name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      }
    } catch (error) {
      errors.push(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    return { imported, errors };
  }

  private async createDefaultFolders() {
    const defaultFolders: Omit<BookmarkFolder, 'id' | 'dateAdded' | 'dateModified'>[] = [
      {
        name: 'Default',
        children: [],
        color: '#2563eb'
      },
      {
        name: 'Work',
        children: [],
        color: '#dc2626'
      },
      {
        name: 'Personal',
        children: [],
        color: '#16a34a'
      },
      {
        name: 'Reading List',
        children: [],
        color: '#ca8a04'
      }
    ];

    for (const folderData of defaultFolders) {
      await this.addFolder(folderData);
    }
  }

  private generateHTMLExport(bookmarks: Bookmark[], folders: BookmarkFolder[]): string {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Bookmarks</title>
</head>
<body>
    <h1>Universal Bookmark Manager Export</h1>
    <dl>
        ${bookmarks.map(bookmark => `
        <dt><a href="${bookmark.url}">${bookmark.title}</a></dt>
        <dd>${bookmark.description || ''}</dd>
        `).join('')}
    </dl>
</body>
</html>`;
    
    return html.trim();
  }

  private generateCSVExport(bookmarks: Bookmark[]): string {
    const headers = ['Title', 'URL', 'Description', 'Tags', 'Folder', 'Date Added'];
    const rows = bookmarks.map(bookmark => [
      `"${bookmark.title.replace(/"/g, '""')}"`,
      `"${bookmark.url}"`,
      `"${bookmark.description?.replace(/"/g, '""') || ''}"`,
      `"${bookmark.tags.join(', ')}"`,
      `"${bookmark.folder}"`,
      `"${new Date(bookmark.dateAdded).toISOString()}"`
    ]);
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  private generateMarkdownExport(bookmarks: Bookmark[], folders: BookmarkFolder[]): string {
    let markdown = '# Universal Bookmark Manager Export\n\n';
    
    // Group bookmarks by folder
    const folderMap = new Map<string, BookmarkFolder>();
    folders.forEach(folder => folderMap.set(folder.id, folder));
    
    const bookmarksByFolder = new Map<string, Bookmark[]>();
    bookmarks.forEach(bookmark => {
      const folderBookmarks = bookmarksByFolder.get(bookmark.folder) || [];
      folderBookmarks.push(bookmark);
      bookmarksByFolder.set(bookmark.folder, folderBookmarks);
    });
    
    // Generate markdown for each folder
    bookmarksByFolder.forEach((folderBookmarks, folderId) => {
      const folder = folderMap.get(folderId);
      const folderName = folder?.name || 'Unknown Folder';
      
      markdown += `## ${folderName}\n\n`;
      
      folderBookmarks.forEach(bookmark => {
        markdown += `- [${bookmark.title}](${bookmark.url})`;
        if (bookmark.description) {
          markdown += ` - ${bookmark.description}`;
        }
        if (bookmark.tags.length > 0) {
          markdown += ` (${bookmark.tags.map(tag => `#${tag}`).join(' ')})`;
        }
        markdown += '\n';
      });
      
      markdown += '\n';
    });
    
    return markdown;
  }
}