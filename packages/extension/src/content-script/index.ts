import browser from 'webextension-polyfill';
import { MessageType, ExtensionMessage } from '@shared';

class ContentScript {
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (this.isInitialized) return;

    // Listen for messages from the extension
    browser.runtime.onMessage.addListener(this.handleMessage.bind(this));

    // Add bookmark detection
    this.setupBookmarkDetection();

    // Setup page metadata extraction
    this.extractPageMetadata();

    this.isInitialized = true;
    console.log('Universal Bookmark Manager content script initialized');
  }

  private async handleMessage(
    message: ExtensionMessage, 
    sender: browser.Runtime.MessageSender
  ) {
    switch (message.type) {
      case MessageType.ADD_BOOKMARK:
        return await this.addCurrentPageBookmark();
      
      default:
        return { error: `Unknown message type: ${message.type}` };
    }
  }

  private setupBookmarkDetection() {
    // Add keyboard shortcut listener
    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        this.addCurrentPageBookmark();
      }
    });

    // Detect bookmark-worthy content
    this.detectBookmarkableContent();
  }

  private async addCurrentPageBookmark() {
    try {
      const metadata = this.extractPageMetadata();
      
      const bookmarkData = {
        title: document.title,
        url: window.location.href,
        favicon: this.getFaviconUrl(),
        description: metadata.description,
        tags: this.extractTags(),
        metadata: {
          pageTitle: document.title,
          pageDescription: metadata.description,
          pageKeywords: metadata.keywords,
          wordCount: this.getWordCount()
        }
      };

      // Send to background script
      const response = await browser.runtime.sendMessage({
        type: MessageType.ADD_BOOKMARK,
        data: bookmarkData
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // Show success notification
      this.showNotification('Bookmark added successfully!', 'success');
      
      return response;
    } catch (error) {
      console.error('Failed to add bookmark:', error);
      this.showNotification('Failed to add bookmark', 'error');
      throw error;
    }
  }

  private extractPageMetadata() {
    const getMetaContent = (name: string) => {
      const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
      return meta?.getAttribute('content') || '';
    };

    return {
      description: getMetaContent('description') || getMetaContent('og:description'),
      keywords: getMetaContent('keywords').split(',').map(k => k.trim()).filter(Boolean),
      author: getMetaContent('author'),
      publishedTime: getMetaContent('article:published_time'),
      modifiedTime: getMetaContent('article:modified_time')
    };
  }

  private getFaviconUrl(): string {
    const favicon = document.querySelector('link[rel*="icon"]') as HTMLLinkElement;
    if (favicon && favicon.href) {
      return favicon.href;
    }
    
    // Fallback to Google's favicon service
    return `https://www.google.com/s2/favicons?domain=${window.location.hostname}&sz=32`;
  }

  private extractTags(): string[] {
    const tags: string[] = [];
    
    // Extract from URL path
    const pathTags = window.location.pathname
      .split('/')
      .filter(segment => segment.length > 2 && segment.length < 20)
      .map(segment => segment.toLowerCase());
    
    tags.push(...pathTags);
    
    // Extract from page title
    const titleWords = document.title.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3 && word.length < 15);
    
    tags.push(...titleWords.slice(0, 3)); // Limit to first 3 words
    
    // Extract from meta keywords
    const metaKeywords = this.extractPageMetadata().keywords;
    tags.push(...metaKeywords.slice(0, 5)); // Limit to 5 keywords
    
    return [...new Set(tags)].slice(0, 10); // Remove duplicates and limit to 10 tags
  }

  private detectBookmarkableContent() {
    // Detect if this is likely a useful page to bookmark
    const indicators = {
      hasArticle: !!document.querySelector('article, .article, .post, .entry'),
      hasLongContent: this.getWordCount() > 500,
      hasVideo: !!document.querySelector('video, iframe[src*="youtube"], iframe[src*="vimeo"]'),
      hasCodeBlocks: !!document.querySelector('pre, code, .code, .highlight'),
      isDocumentation: /\b(docs?|documentation|api|guide|tutorial|reference)\b/i.test(document.title + ' ' + window.location.href),
      isGitHub: window.location.hostname.includes('github.com')
    };

    const score = Object.values(indicators).filter(Boolean).length;
    
    // If this looks like valuable content, suggest bookmarking
    if (score >= 2) {
      this.suggestBookmarking();
    }
  }

  private getWordCount(): number {
    const text = document.body.innerText || '';
    return text.trim().split(/\s+/).length;
  }

  private suggestBookmarking() {
    // Create a subtle suggestion UI (optional)
    const suggestion = document.createElement('div');
    suggestion.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #3b82f6;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      cursor: pointer;
      z-index: 10000;
      transition: opacity 0.3s ease;
    `;
    
    suggestion.innerHTML = `
      📚 Save to bookmarks?
      <span style="margin-left: 8px; opacity: 0.8; font-size: 12px;">Ctrl+Shift+D</span>
    `;
    
    suggestion.addEventListener('click', () => {
      this.addCurrentPageBookmark();
      document.body.removeChild(suggestion);
    });
    
    document.body.appendChild(suggestion);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (document.body.contains(suggestion)) {
        suggestion.style.opacity = '0';
        setTimeout(() => {
          if (document.body.contains(suggestion)) {
            document.body.removeChild(suggestion);
          }
        }, 300);
      }
    }, 5000);
  }

  private showNotification(message: string, type: 'success' | 'error') {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#16a34a' : '#dc2626'};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10001;
      transition: opacity 0.3s ease;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}

// Initialize content script
new ContentScript();