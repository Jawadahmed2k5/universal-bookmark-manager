import CryptoJS from 'crypto-js';
import { ENCRYPTION_SETTINGS } from '../constants';

/**
 * AES-256 encryption utility class
 */
export class EncryptionManager {
  private static instance: EncryptionManager;
  private encryptionKey: string | null = null;

  private constructor() {}

  static getInstance(): EncryptionManager {
    if (!EncryptionManager.instance) {
      EncryptionManager.instance = new EncryptionManager();
    }
    return EncryptionManager.instance;
  }

  /**
   * Generate a new encryption key
   */
  generateKey(): string {
    return CryptoJS.lib.WordArray.random(32).toString(); // 256 bits
  }

  /**
   * Set the encryption key for this session
   */
  setKey(key: string): void {
    this.encryptionKey = key;
  }

  /**
   * Get the current encryption key
   */
  getKey(): string | null {
    return this.encryptionKey;
  }

  /**
   * Encrypt data using AES-256
   */
  encrypt(data: string, key?: string): string {
    const keyToUse = key || this.encryptionKey;
    if (!keyToUse) {
      throw new Error('No encryption key available');
    }

    try {
      const encrypted = CryptoJS.AES.encrypt(data, keyToUse).toString();
      return encrypted;
    } catch (error) {
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Decrypt data using AES-256
   */
  decrypt(encryptedData: string, key?: string): string {
    const keyToUse = key || this.encryptionKey;
    if (!keyToUse) {
      throw new Error('No encryption key available');
    }

    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, keyToUse);
      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedString) {
        throw new Error('Invalid key or corrupted data');
      }
      
      return decryptedString;
    } catch (error) {
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Hash password for key derivation
   */
  hashPassword(password: string, salt?: string): string {
    const saltToUse = salt || CryptoJS.lib.WordArray.random(128 / 8).toString();
    const hash = CryptoJS.PBKDF2(password, saltToUse, {
      keySize: 256 / 32,
      iterations: 100000
    });
    return hash.toString();
  }

  /**
   * Create checksum for data integrity
   */
  createChecksum(data: string): string {
    return CryptoJS.SHA256(data).toString();
  }

  /**
   * Verify data integrity using checksum
   */
  verifyChecksum(data: string, checksum: string): boolean {
    const calculatedChecksum = this.createChecksum(data);
    return calculatedChecksum === checksum;
  }

  /**
   * Secure random string generation
   */
  generateSecureRandom(length: number = 32): string {
    return CryptoJS.lib.WordArray.random(length).toString();
  }

  /**
   * Encrypt bookmark data with metadata
   */
  encryptBookmarkData(data: any): {
    encrypted: string;
    checksum: string;
    timestamp: number;
  } {
    const jsonData = JSON.stringify(data);
    const encrypted = this.encrypt(jsonData);
    const checksum = this.createChecksum(jsonData);
    
    return {
      encrypted,
      checksum,
      timestamp: Date.now()
    };
  }

  /**
   * Decrypt bookmark data and verify integrity
   */
  decryptBookmarkData(encryptedPackage: {
    encrypted: string;
    checksum: string;
    timestamp: number;
  }): any {
    const decrypted = this.decrypt(encryptedPackage.encrypted);
    
    if (!this.verifyChecksum(decrypted, encryptedPackage.checksum)) {
      throw new Error('Data integrity check failed');
    }
    
    try {
      return JSON.parse(decrypted);
    } catch (error) {
      throw new Error('Failed to parse decrypted data');
    }
  }
}