import { useState } from 'react';
import type { AuthService } from '../../services/auth.service';
import type { AuthState } from '../../types/auth';
import './Auth.css';

interface LoginButtonProps {
  authService: AuthService;
  setAuthenticated: AuthState['setAuthenticated'];
  setLoginError: AuthState['setLoginError'];
  onSuccess?: () => void;
}

export function LoginButton({
  authService,
  setAuthenticated,
  setLoginError,
  onSuccess,
}: LoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    setLoginError(null);

    try {
      if (!authService.hasKeyInfo()) {
        throw new Error('No account found. Please register first.');
      }

      const keyInfo = authService.getCurrentKeyInfo();
      if (!keyInfo) {
        throw new Error('Failed to load account information.');
      }

      await authService.getPublicKey();
      setAuthenticated(keyInfo);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to login';
      setLoginError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="login-button-container">
      <button
        className="auth-button secondary"
        onClick={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </div>
  );
}

