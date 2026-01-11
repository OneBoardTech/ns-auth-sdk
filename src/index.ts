// Services
export { AuthService } from './services/auth.service';
export { RelayService } from './services/relay.service';

// Components
export { LoginButton } from './components/auth/LoginButton';
export { RegistrationFlow } from './components/auth/RegistrationFlow';
export { MembershipPage } from './components/membership/MembershipPage';
export { BarcodeScanner } from './components/membership/BarcodeScanner';
export { ProfilePage } from './components/profile/ProfilePage';

// Hooks
export { useAuthInit } from './hooks/useAuth';

// Store
export { createAuthStore, useAuthStore } from './store/authStore';

// Types
export type { NostrEvent, ProfileMetadata, FollowEntry } from './types/nostr';
export type { AuthState, AuthServiceConfig, RelayServiceConfig } from './types/auth';

// Styles (to be imported separately)
import './components/auth/Auth.css';
import './components/membership/Membership.css';
import './components/profile/Profile.css';

