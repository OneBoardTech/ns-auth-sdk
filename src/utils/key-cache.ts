/**
 * Key cache management for Nosskey
 * @packageDocumentation
 */

import type { KeyCacheOptions } from './types.js';
import { bytesToHex } from './utils.js';

/**
 * Key cache entry with expiration time
 */
interface CacheEntry {
  id: string;
  sk: Uint8Array;
  expireAt: number;
}

/**
 * Key cache manager for managing temporary secret keys
 */
export class KeyCache {
  #cachedEntry: CacheEntry | null = null;

  #expiryTimer: NodeJS.Timeout | null = null;

  #cacheOptions: KeyCacheOptions = {
    enabled: false,
    timeoutMs: 5 * 60 * 1000,
  };

  /**
   * KeyCache
   * @param options
   */
  constructor(options?: Partial<KeyCacheOptions>) {
    if (options) {
      this.#cacheOptions = { ...this.#cacheOptions, ...options };
    }
  }

  /**
   * @param options
   */
  setCacheOptions(options: Partial<KeyCacheOptions>): void {
    if (Object.keys(options).length > 0 && this.#cachedEntry !== null) {
      this.clearAllCachedKeys();
    }

    this.#cacheOptions = { ...this.#cacheOptions, ...options };
  }

  getCacheOptions(): KeyCacheOptions {
    return { ...this.#cacheOptions };
  }

  isEnabled(): boolean {
    return this.#cacheOptions.enabled;
  }

  /**
   * @param credentialId
   * @param sk
   */
  setKey(credentialId: Uint8Array | string, sk: Uint8Array): void {
    if (!this.#cacheOptions.enabled) return;

    const id = typeof credentialId === 'string' ? credentialId : bytesToHex(credentialId);
    const timeout =
      this.#cacheOptions.timeoutMs !== undefined ? this.#cacheOptions.timeoutMs : 5 * 60 * 1000;
    const expireAt = Date.now() + timeout;

    this.#clearCachedEntry();

    this.#cachedEntry = {
      id,
      sk: new Uint8Array(sk),
      expireAt,
    };

    try {
      this.#scheduleExpiry();
    } catch (error) {
      this.#clearCachedEntry();
      throw error;
    }
  }

  /**
   * @param credentialId
   * @returns undefined
   */
  getKey(credentialId: Uint8Array | string): Uint8Array | undefined {
    if (!this.#cacheOptions.enabled) return undefined;

    const id = typeof credentialId === 'string' ? credentialId : bytesToHex(credentialId);
    return this.#getCachedKeyIfValid(id);
  }

  /**
   * @param credentialId
   */
  clearCachedKey(credentialId: Uint8Array | string): void {
    const id = typeof credentialId === 'string' ? credentialId : bytesToHex(credentialId);

    if (this.#cachedEntry && this.#cachedEntry.id === id) {
      this.#clearCachedEntry();
    }
  }

  clearAllCachedKeys(): void {
    this.#clearCachedEntry();
  }

  /**
   * @param credentialId
   * @returns undefined
   */
  #getCachedKeyIfValid(credentialId: string): Uint8Array | undefined {
    if (!this.#cachedEntry || this.#cachedEntry.id !== credentialId) {
      return undefined;
    }

    if (Date.now() < this.#cachedEntry.expireAt) {
      return this.#cachedEntry.sk;
    }

    this.#clearCachedEntry();
    return undefined;
  }

  #clearCachedEntry(): void {
    if (this.#cachedEntry) {
      this.#clearKey(this.#cachedEntry.sk);
      this.#cachedEntry = null;
    }

    if (this.#expiryTimer) {
      clearTimeout(this.#expiryTimer);
      this.#expiryTimer = null;
    }
  }

  #scheduleExpiry(): void {
    if (!this.#cachedEntry) return;

    const now = Date.now();
    const timeToExpiry = this.#cachedEntry.expireAt - now;

    if (timeToExpiry <= 0) {
      this.#clearCachedEntry();
      return;
    }

    this.#expiryTimer = setTimeout(() => {
      this.#clearCachedEntry();
    }, timeToExpiry + 1);
  }

  /**
   * @param key
   */
  #clearKey(key: Uint8Array): void {
    key?.fill?.(0);
  }
}
