/**
 * Type definitions for Nosskey SDK (PRF Direct Usage Only)
 * @packageDocumentation
 */

/**
 * Nostr event JSON
 */
export interface NostrEvent {
  id?: string; // sha256 hash of serialized event
  pubkey?: string; // hex
  created_at?: number;
  kind: number;
  tags?: string[][];
  content: string;
  sig?: string; // hex
}

/**
 * Nostr key information (PRF)
 * PWKBlob
 */
export interface NostrKeyInfo {
  credentialId: string; // ID hex
  pubkey: string; // hex
  salt: string; // PRF salt（hex "6e6f7374722d6b6579"）
  username?: string;
}

export interface PasskeyCreationOptions {
  rp?: {
    name?: string;
    id?: string;
  };
  user?: {
    name?: string;
    displayName?: string;
  };
  authenticatorSelection?: AuthenticatorSelectionCriteria;
  pubKeyCredParams?: PublicKeyCredentialParameters[];
  extensions?: Record<string, unknown>;
}

/**
 * Key options
 */
export interface KeyOptions {
  username?: string;
}

/**
 * PRF secret
 */
export interface GetPrfSecretOptions {
  /** Relying Party ID */
  rpId?: string;
  timeout?: number;
  userVerification?: UserVerificationRequirement;
}

export interface KeyCacheOptions {
  enabled: boolean;
  timeoutMs?: number;
}

/**
 * NostrKeyInfo
 */
export interface NostrKeyStorageOptions {
  /** NostrKeyInfo */
  enabled: boolean;
  /** localStorage */
  storage?: Storage;
  /** nosskey_keyinfo */
  storageKey?: string;
}

/**
 * Sign options
 */
export interface SignOptions {
  clearMemory?: boolean;
  tags?: string[][];
}

/**
 * NosskeyManager
 */
export interface NosskeyManagerOptions {
  cacheOptions?: Partial<KeyCacheOptions>;
  storageOptions?: Partial<NostrKeyStorageOptions>;
  prfOptions?: GetPrfSecretOptions;
}

/**
 * SDK public interface
 */
export interface NosskeyManagerLike {
  /**
   * NIP-07
   */
  getPublicKey(): Promise<string>;

  /**
   * NIP-07
   * NostrKeyInfo
   * @param event Nostr
   */
  signEvent(event: NostrEvent): Promise<NostrEvent>;

  /**
   * NostrKeyInfo
   * @param keyInfo NostrKeyInfo
   */
  setCurrentKeyInfo(keyInfo: NostrKeyInfo): void;

  /**
   * NostrKeyInfo
   */
  getCurrentKeyInfo(): NostrKeyInfo | null;

  /**
   * NostrKeyInfo
   * @returns NostrKeyInfo
   */
  hasKeyInfo(): boolean;

  /**
   * NostrKeyInfo
   * @param options
   */
  setStorageOptions(options: Partial<NostrKeyStorageOptions>): void;

  /**
   * NostrKeyInfo
   */
  getStorageOptions(): NostrKeyStorageOptions;

  /**
   * NostrKeyInfo
   */
  clearStoredKeyInfo(): void;

  /**
   * PRF
   */
  isPrfSupported(): Promise<boolean>;

  /**
   * @param options
   * @returns Credential
   */
  createPasskey(options?: PasskeyCreationOptions): Promise<Uint8Array>;

  /**
   * NostrKeyInfo
   * @param credentialId
   * @param options
   */
  createNostrKey(credentialId?: Uint8Array, options?: KeyOptions): Promise<NostrKeyInfo>;

  /**
   * @param event Nostr
   * @param keyInfo NostrKeyInfo
   * @param options
   */
  signEventWithKeyInfo(
    event: NostrEvent,
    keyInfo: NostrKeyInfo,
    options?: SignOptions
  ): Promise<NostrEvent>;

  /**
   * @param options
   */
  setCacheOptions(options: Partial<KeyCacheOptions>): void;

  getCacheOptions(): KeyCacheOptions;

  /**
   * @param credentialId
   */
  clearCachedKey(credentialId: Uint8Array | string): void;

  clearAllCachedKeys(): void;

  /**
   * @param keyInfo NostrKeyInfo
   * @param credentialId NostrKeyInfoのcredentialId
   * @param options
   * @returns
   */
  exportNostrKey(
    keyInfo: NostrKeyInfo,
    credentialId?: Uint8Array,
    options?: KeyOptions
  ): Promise<string>;
}
