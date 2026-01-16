/**
 * Cryptographic utilities for Nosskey
 * @packageDocumentation
 */

const INFO_BYTES = new TextEncoder().encode('nostr-pwk');
const AES_LENGTH = 256; // bits

/**
 * PRF AES-GCM
 * @param secret PRF
 * @param salt
 * @returns AES-GCM
 */
export async function deriveAesGcmKey(secret: Uint8Array, salt: Uint8Array): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey('raw', secret, 'HKDF', false, ['deriveKey']);

  return crypto.subtle.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt, info: INFO_BYTES },
    keyMaterial,
    { name: 'AES-GCM', length: AES_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * AES-GCM
 * @param key
 * @param iv
 * @param plaintext
 * @returns
 */
export async function aesGcmEncrypt(key: CryptoKey, iv: Uint8Array, plaintext: Uint8Array) {
  const buf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);

  const bytes = new Uint8Array(buf);
  return {
    ciphertext: bytes.slice(0, -16),
    tag: bytes.slice(-16),
  };
}

/**
 * AES-GCM
 * @param key
 * @param iv
 * @param ct
 * @param tag
 * @returns
 */
export async function aesGcmDecrypt(
  key: CryptoKey,
  iv: Uint8Array,
  ct: Uint8Array,
  tag: Uint8Array
): Promise<Uint8Array> {
  const buf = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    new Uint8Array([...ct, ...tag])
  );
  return new Uint8Array(buf);
}
