import crypto from 'crypto';

// Clave AES-128 de 16 bytes exactos
const AES_KEY = 'UCN_Coquimbo2024';

export function encryptAES(text: string): string {
  const key = Buffer.from(AES_KEY, 'utf8');
  const cipher = crypto.createCipheriv('aes-128-ecb', key, null);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

export function decryptAES(encryptedText: string, key: string): string {
  try {
    const keyBuffer = Buffer.from(key, 'utf8');
    const decipher = crypto.createDecipheriv('aes-128-ecb', keyBuffer, null);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    return 'Error al descifrar';
  }
}

export function getAESKey(): string {
  return AES_KEY;
}
