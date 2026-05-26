import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;

const key = process.env.DOCUMENT_ENCRYPTION_KEY;
if (!key) {
  throw new Error('DOCUMENT_ENCRYPTION_KEY environment variable is not set');
}
const keyBuffer = Buffer.from(key, 'utf8');
if (keyBuffer.length !== KEY_LENGTH) {
  throw new Error(
    `DOCUMENT_ENCRYPTION_KEY must be exactly ${KEY_LENGTH} bytes (32 characters for UTF-8), got ${keyBuffer.length} bytes`
  );
}

/**
 * Encrypts a buffer using AES-256-GCM.
 * Output format: [12-byte IV][ciphertext][16-byte auth tag]
 */
export function encryptBlob(data: Buffer): Buffer {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, keyBuffer, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, encrypted, authTag]);
}

/**
 * Decrypts a buffer encrypted by encryptBlob.
 * Output format: [12-byte IV][ciphertext][16-byte auth tag]
 */
export function decryptBlob(data: Buffer): Buffer {
  if (data.length < IV_LENGTH + AUTH_TAG_LENGTH) {
    throw new Error('Encrypted data is too short');
  }
  const iv = data.subarray(0, IV_LENGTH);
  const authTag = data.subarray(data.length - AUTH_TAG_LENGTH);
  const ciphertext = data.subarray(IV_LENGTH, data.length - AUTH_TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, keyBuffer, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}
