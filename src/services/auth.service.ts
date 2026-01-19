import { NosskeyManager, type NostrKeyInfo, type NostrEvent, type PasskeyCreationOptions } from '../utils';
import type { AuthServiceConfig } from '../types/auth';

/**
 * Service wrapper around NosskeyManager
 * Handles WebAuthn/Passkey integration with Nostr
 */
export class AuthService {
  private manager: NosskeyManager | null = null;
  private config: AuthServiceConfig;

  constructor(config: AuthServiceConfig = {}) {
    this.config = {
      rpId: config.rpId || (typeof window !== 'undefined' ? window.location.hostname.replace(/^www\./, '') : 'localhost'),
      rpName: config.rpName || this.getDefaultRpName(),
      storageKey: config.storageKey || 'nsauth_keyinfo',
      cacheTimeoutMs: config.cacheTimeoutMs || 30 * 60 * 1000,
      cacheOnCreation: config.cacheOnCreation !== undefined ? config.cacheOnCreation : true,
    };
  }

  private getDefaultRpName(): string {
    if (typeof window === 'undefined') return 'localhost';
    const hostname = window.location.hostname;
    if (hostname.includes('nosskey.app')) return 'nosskey.app';
    return hostname.replace(/^www\./, '');
  }

  /**
   * Initialize the NosskeyManager instance
   */
  private getManager(): NosskeyManager {
    if (!this.manager) {
      this.manager = new NosskeyManager({
        cacheOptions: {
          enabled: true,
          timeoutMs: this.config.cacheTimeoutMs,
          cacheOnCreation: this.config.cacheOnCreation,
        },
        storageOptions: {
          enabled: true,
          storageKey: this.config.storageKey,
        },
      });
    }
    return this.manager;
  }

  /**
   * Create a new passkey
   * Uses platform authenticator only (Touch ID, Face ID, Windows Hello)
   */
  async createPasskey(username?: string): Promise<Uint8Array> {
    const manager = this.getManager();
    
    const rpId = this.config.rpId === 'localhost' ? 'localhost' : this.config.rpId;
    const rpName = this.config.rpName;
    
    const trimmedUsername = username?.trim();
    const uniqueUsername = trimmedUsername 
      ? trimmedUsername 
      : `user-${Date.now()}@example.com`;
    
    const options: PasskeyCreationOptions = {
      rp: {
        id: rpId,
        name: rpName,
      },
      user: {
        name: uniqueUsername,
        displayName: trimmedUsername || 'User',
      },
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
      extensions: {
        prf: {},
      },
    };
    
    return await manager.createPasskey(options);
  }

  /**
   * Create a new Nostr key from a credential ID
   */
  async createNostrKey(credentialId?: Uint8Array): Promise<NostrKeyInfo> {
    const manager = this.getManager();
    return await manager.createNostrKey(credentialId);
  }

  /**
   * Get the current public key
   */
  async getPublicKey(): Promise<string> {
    const manager = this.getManager();
    return await manager.getPublicKey();
  }

  /**
   * Sign a Nostr event
   */
  async signEvent(event: NostrEvent): Promise<NostrEvent> {
    const manager = this.getManager();
    return await manager.signEvent(event);
  }

  /**
   * Get current key info
   */
  getCurrentKeyInfo(): NostrKeyInfo | null {
    const manager = this.getManager();
    return manager.getCurrentKeyInfo();
  }

  /**
   * Set current key info
   */
  setCurrentKeyInfo(keyInfo: NostrKeyInfo): void {
    const manager = this.getManager();
    manager.setCurrentKeyInfo(keyInfo);
  }

  /**
   * Check if key info exists
   */
  hasKeyInfo(): boolean {
    const manager = this.getManager();
    return manager.hasKeyInfo();
  }

  /**
   * Clear stored key info
   */
  clearStoredKeyInfo(): void {
    const manager = this.getManager();
    manager.clearStoredKeyInfo();
  }

  /**
   * Check if PRF is supported
   */
  async isPrfSupported(): Promise<boolean> {
    const { isPrfSupported } = await import('../utils');
    return await isPrfSupported();
  }
}

