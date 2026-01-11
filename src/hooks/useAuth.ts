import { useEffect } from 'react';
import type { AuthService } from '../services/auth.service';
import type { AuthState } from '../types/auth';

/**
 * Hook to initialize auth state on app load
 */
export function useAuthInit(
  authService: AuthService,
  setAuthenticated: AuthState['setAuthenticated']
): void {
  useEffect(() => {
    if (authService.hasKeyInfo()) {
      const keyInfo = authService.getCurrentKeyInfo();
      if (keyInfo) {
        setAuthenticated(keyInfo);
      }
    }
  }, [authService, setAuthenticated]);
}

