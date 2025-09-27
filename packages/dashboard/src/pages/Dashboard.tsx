import React, { useState, useEffect } from 'react';
import { Bookmark, BookmarkFolder } from '@shared';

const Dashboard: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [folders, setFolders] = useState<BookmarkFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      setError(null);

      // In a real extension, this would use chrome.runtime.sendMessage
      // For now, we'll use placeholder data
      const mockBookmarks: Bookmark[] = [
        {
          id: '1',
          title: 'React Documentation',
          url: 'https://reactjs.org/docs',
          favicon: 'https://reactjs.org/favicon.ico',
          tags: ['react', 'documentation', 'frontend'],
          folder: 'work',
          description: 'Official React documentation',
          dateAdded: Date.now() - 86400000,
          dateModified: Date.now() - 86400000,
          visitCount: 5,
          isArchived: false,
          source: 'manual' as any,
          metadata: {
            pageTitle: 'React Documentation',
            pageDescription: 'A JavaScript library for building user interfaces'
          }
        },
        {
          id: '2',
          title: 'TypeScript Handbook',
          url: 'https://www.typescriptlang.org/docs/',
          favicon: 'https://www.typescriptlang.org/favicon.ico',
          tags: ['typescript', 'documentation', 'programming'],
          folder: 'work',
          description: 'Learn TypeScript',
          dateAdded: Date.now() - 172800000,
          dateModified: Date.now() - 172800000,
          visitCount: 3,
          isArchived: false,
          source: 'manual' as any,
          metadata: {
            pageTitle: 'TypeScript Handbook',
            pageDescription: 'TypeScript extends JavaScript by adding types'
          }
        }
      ];

      const mockFolders: BookmarkFolder[] = [
        {
          id: 'work',
          name: 'Work',
          children: ['1', '2'],
          dateAdded: Date.now() - 259200000,
          dateModified: Date.now() - 259200000,
          color: '#3b82f6'
        },
        {
          id: 'personal',
          name: 'Personal',
          children: [],
          dateAdded: Date.now() - 259200000,
          dateModified: Date.now() - 259200000,
          color: '#10b981'
        }
      ];

      setBookmarks(mockBookmarks);
      setFolders(mockFolders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // In a real implementation, this would trigger a search
  };

  const filteredBookmarks = bookmarks.filter(bookmark =>
    bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bookmark.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bookmark.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={loadBookmarks}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          📚 Universal Bookmark Manager
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage your bookmarks with advanced search, organization, and sync
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search bookmarks by title, URL, or tags..."
            className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm">📖</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Bookmarks</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{bookmarks.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm">📁</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Folders</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{folders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm">🏷️</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tags</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {[...new Set(bookmarks.flatMap(b => b.tags))].length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bookmarks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBookmarks.map((bookmark) => (
          <div
            key={bookmark.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6"
          >
            <div className="flex items-start space-x-3">
              <img
                src={bookmark.favicon || `https://www.google.com/s2/favicons?domain=${new URL(bookmark.url).hostname}&sz=32`}
                alt=""
                className="w-8 h-8 rounded flex-shrink-0"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="%23666"><circle cx="16" cy="16" r="12"/></svg>';
                }}
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                  {bookmark.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {bookmark.url}
                </p>
                {bookmark.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                    {bookmark.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-1 mt-2">
                  {bookmark.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      #{tag}
                    </span>
                  ))}
                  {bookmark.tags.length > 3 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      +{bookmark.tags.length - 3} more
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(bookmark.dateAdded).toLocaleDateString()}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => window.open(bookmark.url, '_blank')}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Open
                    </button>
                    <button className="text-gray-600 hover:text-gray-800 text-sm">
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBookmarks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📚</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No bookmarks found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery ? 'Try adjusting your search query' : 'Start by adding your first bookmark'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;