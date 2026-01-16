/**
 * Passkey-Derived Nostr Identity
 * @packageDocumentation
 */

export * from './types.js';

export { NosskeyManager } from './nosskey.js';

export { bytesToHex, hexToBytes } from './utils.js';

export { aesGcmDecrypt, aesGcmEncrypt, deriveAesGcmKey } from './crypto-utils.js';

export { createPasskey, getPrfSecret, isPrfSupported } from './prf-handler.js';

export { registerDummyPasskey } from './test-utils.js';
