import type { NostrKeyInfo } from '../utils';

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
  cacheOnCreation?: boolean;
}

/**
 * Relay service configuration
 */
export interface RelayServiceConfig {
  relayUrls?: string[];
}

