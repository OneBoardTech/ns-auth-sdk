import { create } from 'zustand';
import type { NostrKeyInfo } from '../utils';
import type { AuthState } from '../types/auth';

export const createAuthStore = () => {
  return create<AuthState>((set) => ({
    isAuthenticated: false,
    publicKey: null,
    keyInfo: null,
    loginError: null,
    setAuthenticated: (keyInfo: NostrKeyInfo | null) => {
      set({
        isAuthenticated: !!keyInfo,
        publicKey: keyInfo?.pubkey || null,
        keyInfo,
        loginError: null,
      });
    },
    setLoginError: (error: string | null) => {
      set({ loginError: error });
    },
    logout: () => {
      set({
        isAuthenticated: false,
        publicKey: null,
        keyInfo: null,
        loginError: null,
      });
    },
  }));
};

// Default singleton instance
export const useAuthStore = createAuthStore();

