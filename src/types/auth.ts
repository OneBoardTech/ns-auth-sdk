import type { NostrKeyInfo } from 'nosskey-sdk';

/**
 * Authentication state interface
 */
export interface AuthState {
  isAuthenticated: boolean;
  publicKey: string | null;
  keyInfo: NostrKeyInfo | null;
  loginError: string | null;
  setAuthenticated: (keyInfo: NostrKeyInfo | null) => void;
  setLoginError: (error: string | null) => void;
  logout: () => void;
}

/**
 * Auth service configuration
 */
export interface AuthServiceConfig {
  rpId?: string;
  rpName?: string;
  storageKey?: string;
  cacheTimeoutMs?: number;
}

/**
 * Relay service configuration
 */
export interface RelayServiceConfig {
  relayUrls?: string[];
}

