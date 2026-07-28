/**
 * AES-256-GCM Encryption/Decryption for secrets at rest
 * Uses ENCRYPTION_KEY environment variable (32-byte hex string)
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is required for encryption');
  }
  // Support hex-encoded 32-byte keys or derive from passphrase
  if (key.length === 64 && /^[0-9a-fA-F]+$/.test(key)) {
    return Buffer.from(key, 'hex');
  }
  // Derive a 32-byte key from a passphrase using SHA-256
  return crypto.createHash('sha256').update(key).digest();
}

export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // Format: base64(iv + authTag + ciphertext)
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

export function decrypt(ciphertext: string): string {
  const key = getEncryptionKey();
  const data = Buffer.from(ciphertext, 'base64');
  const iv = data.subarray(0, IV_LENGTH);
  const authTag = data.subarray(IV_LENGTH, IV_LENGTH + 16);
  const encrypted = data.subarray(IV_LENGTH + 16);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}

export function isEncrypted(value: string): boolean {
  // Encrypted values are base64 strings with at least IV + authTag + some data
  if (!value || typeof value !== 'string') return false;
  try {
    const buf = Buffer.from(value, 'base64');
    return buf.length > IV_LENGTH + 16;
  } catch {
    return false;
  }
}

export function maskApiKey(key: string): string {
  if (!key || key.length <= 4) return '****';
  return `****${key.slice(-4)}`;
}

export function encryptIfPlaintext(value: string): string {
  if (!value) return value;
  if (isEncrypted(value)) return value;
  return encrypt(value);
}

export function decryptIfEncrypted(value: string): string {
  if (!value) return value;
  if (isEncrypted(value)) {
    try {
      return decrypt(value);
    } catch {
      return value;
    }
  }
  return value;
}
