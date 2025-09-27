// Popup functionality for Universal Bookmark Manager

class PopupManager {
  constructor() {
    this.initialize();
  }

  async initialize() {
    try {
      await this.setupEventListeners();
      await this.loadCurrentPageInfo();
      await this.loadRecentBookmarks();
      console.log('Popup initialized');
    } catch (error) {
      console.error('Failed to initialize popup:', error);
      this.showError('Failed to initialize popup');
    }
  }

  setupEventListeners() {
    // Form submission
    const form = document.getElementById('bookmarkForm');
    form.addEventListener('submit', this.handleFormSubmit.bind(this));

    // Search functionality
    const searchBtn = document.getElementById('searchBtn');
    searchBtn.addEventListener('click', this.handleSearch.bind(this));

    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleSearch();
      }
    });

    // Dashboard button
    const dashboardBtn = document.getElementById('dashboardBtn');
    dashboardBtn.addEventListener('click', this.openDashboard.bind(this));
  }

  async loadCurrentPageInfo() {
    try {
      // Get current tab info
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab) {
        document.getElementById('title').value = tab.title || '';
        document.getElementById('url').value = tab.url || '';
      }
    } catch (error) {
      console.error('Failed to load current page info:', error);
    }
  }

  async loadRecentBookmarks() {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GET_BOOKMARKS',
        data: { limit: 5 }
      });

      if (response.error) {
        throw new Error(response.error);
      }

      this.displayRecentBookmarks(response || []);
    } catch (error) {
      console.error('Failed to load recent bookmarks:', error);
      document.getElementById('recentList').innerHTML = '<div style="color: #6b7280; font-size: 12px;">No recent bookmarks</div>';
    }
  }

  displayRecentBookmarks(bookmarks) {
    const container = document.getElementById('recentList');
    
    if (!bookmarks || bookmarks.length === 0) {
      container.innerHTML = '<div style="color: #6b7280; font-size: 12px;">No bookmarks yet</div>';
      return;
    }

    const html = bookmarks.slice(0, 5).map(bookmark => `
      <div class="bookmark-item">
        <img class="bookmark-favicon" 
             src="${bookmark.favicon || this.getDefaultFavicon(bookmark.url)}" 
             alt="" 
             onerror="this.src='data:image/svg+xml,<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"16\\" height=\\"16\\" fill=\\"%23666\\"><circle cx=\\"8\\" cy=\\"8\\" r=\\"6\\"/></svg>'">
        <div class="bookmark-info">
          <div class="bookmark-title" title="${this.escapeHtml(bookmark.title)}">${this.escapeHtml(bookmark.title)}</div>
          <div class="bookmark-url" title="${this.escapeHtml(bookmark.url)}">${this.escapeHtml(this.truncateUrl(bookmark.url))}</div>
        </div>
      </div>
    `).join('');

    container.innerHTML = html;
  }

  async handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const bookmarkData = {
      title: formData.get('title').trim(),
      url: formData.get('url').trim(),
      folder: formData.get('folder') || 'default',
      description: formData.get('description').trim(),
      tags: formData.get('tags').split(',').map(tag => tag.trim()).filter(Boolean)
    };

    // Validate required fields
    if (!bookmarkData.title || !bookmarkData.url) {
      this.showError('Title and URL are required');
      return;
    }

    if (!this.isValidUrl(bookmarkData.url)) {
      this.showError('Please enter a valid URL');
      return;
    }

    try {
      this.showLoading('Adding bookmark...');
      
      const response = await chrome.runtime.sendMessage({
        type: 'ADD_BOOKMARK',
        data: bookmarkData
      });

      if (response.error) {
        throw new Error(response.error);
      }

      this.showSuccess('Bookmark added successfully!');
      
      // Reset form
      e.target.reset();
      
      // Reload recent bookmarks
      await this.loadRecentBookmarks();
      
    } catch (error) {
      console.error('Failed to add bookmark:', error);
      this.showError('Failed to add bookmark: ' + error.message);
    }
  }

  async handleSearch() {
    const query = document.getElementById('searchInput').value.trim();
    
    if (!query) {
      this.openDashboard();
      return;
    }

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'SEARCH_BOOKMARKS',
        data: { query, maxResults: 10 }
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // Open dashboard with search results
      await this.openDashboard(`?search=${encodeURIComponent(query)}`);
      
    } catch (error) {
      console.error('Search failed:', error);
      this.showError('Search failed: ' + error.message);
    }
  }

  async openDashboard(params = '') {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'OPEN_DASHBOARD',
        data: { params }
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // Close popup
      window.close();
      
    } catch (error) {
      console.error('Failed to open dashboard:', error);
      this.showError('Failed to open dashboard');
    }
  }

  isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  getDefaultFavicon(url) {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
    } catch (_) {
      return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="%23666"><circle cx="8" cy="8" r="6"/></svg>';
    }
  }

  truncateUrl(url, maxLength = 35) {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.className = type;
    notification.textContent = message;
    notification.style.display = 'block';

    setTimeout(() => {
      notification.style.display = 'none';
    }, 3000);
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showLoading(message) {
    this.showNotification(message, 'loading');
  }
}

// Initialize popup when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new PopupManager());
} else {
  new PopupManager();
}