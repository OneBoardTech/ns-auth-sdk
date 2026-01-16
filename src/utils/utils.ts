/**
 * @packageDocumentation
 */

/**
 * @param bytes
 * @returns
 */
export function bytesToHex(bytes: Uint8Array): string {
  const key = '0123456789abcdef';
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    const firstNibble = bytes[i] >> 4;
    const secondNibble = bytes[i] & 15;
    hex += key[firstNibble] + key[secondNibble];
  }
  return hex;
}

/**
 * @param hex
 * @returns
 */
export function hexToBytes(hex: string): Uint8Array {
  const key = '0123456789abcdef';
  const bytes = [];
  let currentByte = 0;
  let highNibble = true;

  for (let i = 0; i < hex.length; i++) {
    const charValue = key.indexOf(hex[i].toLowerCase());
    if (charValue === -1) continue;

    if (highNibble) {
      currentByte = charValue << 4;
      highNibble = false;
    } else {
      currentByte += charValue;
      bytes.push(currentByte);
      highNibble = true;
    }
  }

  return new Uint8Array(bytes);
}
