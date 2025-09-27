#!/usr/bin/env node

import { stdin, stdout } from 'process';
import { ChromeExtractor } from './extractors/chrome-extractor';
import { FirefoxExtractor } from './extractors/firefox-extractor';
import { SafariExtractor } from './extractors/safari-extractor';
import { NativeMessage, NativeResponse } from '@shared';

class NativeMessagingHost {
  private chromeExtractor = new ChromeExtractor();
  private firefoxExtractor = new FirefoxExtractor();
  private safariExtractor = new SafariExtractor();

  constructor() {
    this.setupMessageListener();
  }

  private setupMessageListener() {
    let messageLength = 0;
    let messageBuffer = Buffer.alloc(0);
    let expectingLength = true;

    stdin.on('data', (data: Buffer) => {
      messageBuffer = Buffer.concat([messageBuffer, data]);

      while (true) {
        if (expectingLength && messageBuffer.length >= 4) {
          // Read message length (first 4 bytes, little-endian)
          messageLength = messageBuffer.readUInt32LE(0);
          messageBuffer = messageBuffer.slice(4);
          expectingLength = false;
        }

        if (!expectingLength && messageBuffer.length >= messageLength) {
          // Read the complete message
          const messageData = messageBuffer.slice(0, messageLength);
          messageBuffer = messageBuffer.slice(messageLength);
          expectingLength = true;
          messageLength = 0;

          try {
            const message: NativeMessage = JSON.parse(messageData.toString('utf8'));
            this.handleMessage(message);
          } catch (error) {
            this.sendError('Invalid message format', 'unknown');
          }
        } else {
          // Wait for more data
          break;
        }
      }
    });

    stdin.on('end', () => {
      process.exit(0);
    });
  }

  private async handleMessage(message: NativeMessage) {
    try {
      let result: any;

      switch (message.command) {
        case 'extractBookmarks':
          result = await this.extractBookmarks(message.data?.browser || 'chrome');
          break;

        case 'getBookmarkDatabases':
          result = await this.getBookmarkDatabases();
          break;

        case 'ping':
          result = { status: 'alive', timestamp: Date.now() };
          break;

        default:
          throw new Error(`Unknown command: ${message.command}`);
      }

      this.sendResponse({
        success: true,
        data: result,
        requestId: message.requestId
      });

    } catch (error) {
      this.sendError(
        error instanceof Error ? error.message : 'Unknown error',
        message.requestId
      );
    }
  }

  private async extractBookmarks(browser: string) {
    switch (browser.toLowerCase()) {
      case 'chrome':
        return await this.chromeExtractor.extractBookmarks();
      
      case 'firefox':
        return await this.firefoxExtractor.extractBookmarks();
      
      case 'safari':
        return await this.safariExtractor.extractBookmarks();
      
      default:
        throw new Error(`Unsupported browser: ${browser}`);
    }
  }

  private async getBookmarkDatabases() {
    const databases = {
      chrome: await this.chromeExtractor.getDatabasePath(),
      firefox: await this.firefoxExtractor.getDatabasePath(),
      safari: await this.safariExtractor.getDatabasePath()
    };

    return databases;
  }

  private sendResponse(response: NativeResponse) {
    this.sendMessage(response);
  }

  private sendError(error: string, requestId: string) {
    this.sendMessage({
      success: false,
      error,
      requestId
    });
  }

  private sendMessage(message: any) {
    const messageStr = JSON.stringify(message);
    const messageLength = Buffer.byteLength(messageStr, 'utf8');
    
    // Write message length (4 bytes, little-endian)
    const lengthBuffer = Buffer.alloc(4);
    lengthBuffer.writeUInt32LE(messageLength, 0);
    
    // Write length header and message
    stdout.write(lengthBuffer);
    stdout.write(messageStr, 'utf8');
  }
}

// Start the native messaging host
new NativeMessagingHost();