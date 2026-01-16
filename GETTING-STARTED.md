## 1. Prerequisites

Node.js ≥ 14 (npm, pnpm or yarn).
A WebAuthn‑compatible browser (Chrome 89+, Edge, Safari 15+, Firefox 102+).
Access to at least one relay (e.g., wss://example.io).

## 2. Installation
#### npm
```bash
npm install ns-auth-sdk
```
#### pnpm
```bash
pnpm install ns-auth-sdk
```
#### yarn
```bash
yarn add ns-auth-sdk
```
The package ships with TypeScript typings, so you’ll get full IntelliSense in supported editors.

## 3. Quick‑Start Code Walkthrough
Below is a minimal, functional example using React:

### 3.1 Initialise Services
```typescript
// src/services.ts
import { AuthService, RelayService } from 'ns-auth-sdk';
import { EventStore } from 'applesauce-core';

// ---------- Auth ----------
export const authService = new AuthService({
  rpId: 'example.com',          // Your relying party identifier (domain)
  rpName: 'My Demo App',        // Human‑readable name shown in the authenticator UI
  storageKey: 'ns_auth_keyinfo' // LocalStorage key for persisting key metadata
});

// ---------- Relay ----------
export const relayService = new RelayService({
  relayUrls: ['wss://relay.damus.io']   // Add more URLs for redundancy
});

// ---------- AppleSauce ----------
export const eventStore = new EventStore({
  // …any AppleSauce config you need (e.g., cache, retry policy)
});
relayService.initialize(eventStore);
```
### 3.2 Hook the Auth Store into your UI
```typescript
// src/store.ts
import { create } from 'zustand';
import { AuthService } from 'ns-auth-sdk';

type AuthState = {
  publicKey: string | null;
  isAuthenticated: boolean;
  loginError: string | null;
  setAuthenticated: (pubKey: string) => void;
  setLoginError: (msg: string) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  publicKey: null,
  isAuthenticated: false,
  loginError: null,
  setAuthenticated: (pubKey) =>
    set({ publicKey: pubKey, isAuthenticated: true, loginError: null }),
  setLoginError: (msg) => set({ loginError: msg, isAuthenticated: false }),
  clear: () => set({ publicKey: null, isAuthenticated: false, loginError: null })
}));
```
### 3.3 Initialise on App Mount
```typescript
// src/App.tsx
import { useEffect } from 'react';
import { authService } from './services';
import { useAuthStore } from './store';
import { useAuthInit } from 'ns-auth-sdk/react'; // helper hook

export default function App() {
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);

  // Runs once when the component mounts
  useAuthInit(authService, setAuthenticated);

  // …render routes, layout, etc.
}
```
### 3.4 Registration Flow
```typescript
// src/pages/Register.tsx
import { RegistrationFlow } from 'ns-auth-sdk';
import { useRouter } from 'next/router';
import { authService } from '../services';
import { useAuthStore } from '../store';

export default function RegisterPage() {
  const router = useRouter();
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);

  return (
    <RegistrationFlow
      authService={authService}
      setAuthenticated={setAuthenticated}
      onSuccess={() => router.push('/profile')}
    />
  );
}
```
### 3.5 Login Flow
```typescript
// src/pages/Login.tsx
import { LoginButton } from 'ns-auth-sdk';
import { useRouter } from 'next/router';
import { authService } from '../services';
import { useAuthStore } from '../store';

export default function LoginPage() {
  const router = useRouter();
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const setLoginError = useAuthStore((s) => s.setLoginError);

  return (
    <LoginButton
      authService={authService}
      setAuthenticated={setAuthenticated}
      setLoginError={setLoginError}
      onSuccess={() => router.push('/dashboard')}
    />
  );
}
```
### 3.6 Profile & Membership Pages
Both pages receive the same authService and relayService instances. They can read the current publicKey from the store and call SDK helpers (fetchProfile, publishFollowList, etc.) as needed.

```typescript
// src/pages/Profile.tsx
import { ProfilePage } from 'ns-auth-sdk';
import { useRouter } from 'next/router';
import { authService, relayService } from '../services';
import { useAuthStore } from '../store';

export default function ProfilePageComponent() {
  const router = useRouter();
  const publicKey = useAuthStore((s) => s.publicKey);

  return (
    <ProfilePage
      authService={authService}
      relayService={relayService}
      publicKey={publicKey!}
      onUnauthenticated={() => router.push('/login')}
      onSuccess={() => router.push('/membership')}
      onRoleSuggestion={async (about) => {
        const resp = await fetch('/api/suggest-role', {
          method: 'POST',
          body: JSON.stringify({ about })
        });
        const { role } = await resp.json();
        return role ?? null;
      }}
    />
  );
}
```

## 4 Restoration (New Device) Workflow

Install the app and run the same initialization code.
Fetch the latest kind 30100 event for the user’s public key (you’ll need the public key from somewhere – e.g., QR code, email link, or manual entry).
Extract the PWKBlob from the event’s content field.
Prompt the user to authenticate with one of their registered passkeys.
Derive the PRF value from that passkey, decrypt the PWKBlob, and load the recovered private key into AuthService.
Set the authenticated state (setAuthenticated) and continue normal operation.


Because each passkey can have its own blob, the user can recover on any device that holds a registered credential.


## 5 Full Example Project Structure
```bash
my-ns-auth-app/
│
├─ src/
│   ├─ services.ts          # AuthService, RelayService, AppleSauce init
│   ├─ store.ts             # Zustand auth store
│   ├─ App.tsx              # Root component (calls useAuthInit)
│   └─ pages/
│       ├─ Register.tsx
│       ├─ Login.tsx
│       ├─ Profile.tsx
│       └─ Membership.tsx
│
├─ public/
│   └─ index.html
│
├─ package.json
└─ tsconfig.json
```
Running npm start (or the equivalent script for your bundler) will spin up a dev server with the full NS Auth flow ready to test.