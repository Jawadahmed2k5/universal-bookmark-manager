import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Bookmark, BookmarkFolder, SearchResult } from '@shared';

// Types
interface BookmarkState {
  bookmarks: Bookmark[];
  folders: BookmarkFolder[];
  searchResults: SearchResult[];
  loading: boolean;
  error: string | null;
  selectedFolder: string | null;
  searchQuery: string;
}

type BookmarkAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_BOOKMARKS'; payload: Bookmark[] }
  | { type: 'SET_FOLDERS'; payload: BookmarkFolder[] }
  | { type: 'ADD_BOOKMARK'; payload: Bookmark }
  | { type: 'UPDATE_BOOKMARK'; payload: Bookmark }
  | { type: 'DELETE_BOOKMARK'; payload: string }
  | { type: 'SET_SEARCH_RESULTS'; payload: SearchResult[] }
  | { type: 'SET_SELECTED_FOLDER'; payload: string | null }
  | { type: 'SET_SEARCH_QUERY'; payload: string };

// Initial state
const initialState: BookmarkState = {
  bookmarks: [],
  folders: [],
  searchResults: [],
  loading: false,
  error: null,
  selectedFolder: null,
  searchQuery: '',
};

// Reducer
const bookmarkReducer = (state: BookmarkState, action: BookmarkAction): BookmarkState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_BOOKMARKS':
      return { ...state, bookmarks: action.payload, loading: false };
    
    case 'SET_FOLDERS':
      return { ...state, folders: action.payload };
    
    case 'ADD_BOOKMARK':
      return { 
        ...state, 
        bookmarks: [...state.bookmarks, action.payload],
        error: null 
      };
    
    case 'UPDATE_BOOKMARK':
      return {
        ...state,
        bookmarks: state.bookmarks.map(bookmark =>
          bookmark.id === action.payload.id ? action.payload : bookmark
        ),
        error: null
      };
    
    case 'DELETE_BOOKMARK':
      return {
        ...state,
        bookmarks: state.bookmarks.filter(bookmark => bookmark.id !== action.payload),
        error: null
      };
    
    case 'SET_SEARCH_RESULTS':
      return { ...state, searchResults: action.payload };
    
    case 'SET_SELECTED_FOLDER':
      return { ...state, selectedFolder: action.payload };
    
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    
    default:
      return state;
  }
};

// Context
interface BookmarkContextType {
  state: BookmarkState;
  dispatch: React.Dispatch<BookmarkAction>;
  // Action creators
  loadBookmarks: () => Promise<void>;
  addBookmark: (bookmark: Omit<Bookmark, 'id'>) => Promise<void>;
  updateBookmark: (bookmark: Bookmark) => Promise<void>;
  deleteBookmark: (id: string) => Promise<void>;
  searchBookmarks: (query: string) => Promise<void>;
  selectFolder: (folderId: string | null) => void;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

// Provider component
interface BookmarkProviderProps {
  children: ReactNode;
}

export const BookmarkProvider: React.FC<BookmarkProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(bookmarkReducer, initialState);

  // Action creators
  const loadBookmarks = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // In a real extension, this would use chrome.runtime.sendMessage
      // For development, we'll use mock data or local storage
      
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        // Extension environment
        const response = await chrome.runtime.sendMessage({
          type: 'GET_BOOKMARKS'
        });
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        dispatch({ type: 'SET_BOOKMARKS', payload: response || [] });
      } else {
        // Development environment - use mock data
        const mockBookmarks: Bookmark[] = [
          {
            id: '1',
            title: 'React Documentation',
            url: 'https://reactjs.org/docs',
            favicon: 'https://reactjs.org/favicon.ico',
            tags: ['react', 'documentation'],
            folder: 'work',
            description: 'Official React documentation',
            dateAdded: Date.now() - 86400000,
            dateModified: Date.now() - 86400000,
            visitCount: 5,
            isArchived: false,
            source: 'manual' as any
          }
        ];
        
        dispatch({ type: 'SET_BOOKMARKS', payload: mockBookmarks });
      }
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to load bookmarks' 
      });
    }
  };

  const addBookmark = async (bookmarkData: Omit<Bookmark, 'id'>) => {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        const response = await chrome.runtime.sendMessage({
          type: 'ADD_BOOKMARK',
          data: bookmarkData
        });
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        dispatch({ type: 'ADD_BOOKMARK', payload: response });
      } else {
        // Development environment
        const newBookmark: Bookmark = {
          ...bookmarkData,
          id: Date.now().toString(),
          dateAdded: Date.now(),
          dateModified: Date.now()
        };
        
        dispatch({ type: 'ADD_BOOKMARK', payload: newBookmark });
      }
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to add bookmark' 
      });
    }
  };

  const updateBookmark = async (bookmark: Bookmark) => {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        const response = await chrome.runtime.sendMessage({
          type: 'UPDATE_BOOKMARK',
          data: bookmark
        });
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        dispatch({ type: 'UPDATE_BOOKMARK', payload: response });
      } else {
        // Development environment
        dispatch({ type: 'UPDATE_BOOKMARK', payload: bookmark });
      }
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to update bookmark' 
      });
    }
  };

  const deleteBookmark = async (id: string) => {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        const response = await chrome.runtime.sendMessage({
          type: 'DELETE_BOOKMARK',
          data: { id }
        });
        
        if (response.error) {
          throw new Error(response.error);
        }
      }
      
      dispatch({ type: 'DELETE_BOOKMARK', payload: id });
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to delete bookmark' 
      });
    }
  };

  const searchBookmarks = async (query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
    
    if (!query.trim()) {
      dispatch({ type: 'SET_SEARCH_RESULTS', payload: [] });
      return;
    }

    try {
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        const response = await chrome.runtime.sendMessage({
          type: 'SEARCH_BOOKMARKS',
          data: { query, fuzzy: true, maxResults: 50 }
        });
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        dispatch({ type: 'SET_SEARCH_RESULTS', payload: response || [] });
      } else {
        // Development environment - simple filter
        const results = state.bookmarks
          .filter(bookmark =>
            bookmark.title.toLowerCase().includes(query.toLowerCase()) ||
            bookmark.url.toLowerCase().includes(query.toLowerCase()) ||
            bookmark.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
          )
          .map(bookmark => ({
            bookmark,
            score: 1.0,
            matchedFields: ['title']
          }));
        
        dispatch({ type: 'SET_SEARCH_RESULTS', payload: results });
      }
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Search failed' 
      });
    }
  };

  const selectFolder = (folderId: string | null) => {
    dispatch({ type: 'SET_SELECTED_FOLDER', payload: folderId });
  };

  const value: BookmarkContextType = {
    state,
    dispatch,
    loadBookmarks,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    searchBookmarks,
    selectFolder,
  };

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  );
};

// Hook for using the context
export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (context === undefined) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
};