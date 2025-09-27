import browser from 'webextension-polyfill';
import { NativeMessage, NativeResponse, NATIVE_APP_NAME, NATIVE_MESSAGE_TIMEOUT } from '@shared';

export class NativeMessagingClient {
  private port: browser.Runtime.Port | null = null;
  private messageHandlers = new Map<string, (response: NativeResponse) => void>();

  constructor() {
    this.connectToNativeHost();
  }

  private connectToNativeHost() {
    try {
      if (!browser.runtime.connectNative) {
        console.warn('Native messaging not supported in this browser');
        return;
      }

      this.port = browser.runtime.connectNative(NATIVE_APP_NAME);
      
      this.port.onMessage.addListener((response: NativeResponse) => {
        this.handleNativeResponse(response);
      });

      this.port.onDisconnect.addListener(() => {
        console.log('Native messaging host disconnected');
        this.port = null;
        
        // Attempt to reconnect after a delay
        setTimeout(() => {
          this.connectToNativeHost();
        }, 5000);
      });

      console.log('Connected to native messaging host');
    } catch (error) {
      console.error('Failed to connect to native messaging host:', error);
    }
  }

  async sendMessage(command: string, data?: any): Promise<any> {
    if (!this.port) {
      throw new Error('Native messaging host not connected');
    }

    const requestId = this.generateRequestId();
    const message: NativeMessage = {
      command,
      data,
      requestId
    };

    return new Promise((resolve, reject) => {
      // Set up response handler
      this.messageHandlers.set(requestId, (response: NativeResponse) => {
        this.messageHandlers.delete(requestId);
        
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error || 'Native messaging error'));
        }
      });

      // Set up timeout
      setTimeout(() => {
        if (this.messageHandlers.has(requestId)) {
          this.messageHandlers.delete(requestId);
          reject(new Error('Native messaging timeout'));
        }
      }, NATIVE_MESSAGE_TIMEOUT);

      // Send message
      try {
        this.port!.postMessage(message);
      } catch (error) {
        this.messageHandlers.delete(requestId);
        reject(error);
      }
    });
  }

  async extractBookmarks(browser: string = 'chrome'): Promise<any[]> {
    try {
      const bookmarks = await this.sendMessage('extractBookmarks', { browser });
      return bookmarks || [];
    } catch (error) {
      console.error(`Failed to extract ${browser} bookmarks:`, error);
      return [];
    }
  }

  async getBookmarkDatabases(): Promise<{ [browser: string]: string }> {
    try {
      const databases = await this.sendMessage('getBookmarkDatabases');
      return databases || {};
    } catch (error) {
      console.error('Failed to get bookmark databases:', error);
      return {};
    }
  }

  async ping(): Promise<boolean> {
    try {
      const response = await this.sendMessage('ping');
      return response && response.status === 'alive';
    } catch (error) {
      console.error('Native host ping failed:', error);
      return false;
    }
  }

  private handleNativeResponse(response: NativeResponse) {
    const handler = this.messageHandlers.get(response.requestId);
    if (handler) {
      handler(response);
    } else {
      console.warn('Received response for unknown request:', response.requestId);
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  isConnected(): boolean {
    return this.port !== null;
  }

  disconnect(): void {
    if (this.port) {
      this.port.disconnect();
      this.port = null;
    }
  }
}