import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = process.env.AES_ENCRYPTION_KEY || '32_bytes_long_secret_encryption_key_2026!!';

export class CryptoUtil {
  private static getKey(): Buffer {
    return crypto.scryptSync(SECRET_KEY, 'thenexopp_salt_2026', 32);
  }

  public static encrypt(text: string): string {
    if (!text) return text;
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, this.getKey(), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  }

  public static decrypt(encryptedText: string): string {
    if (!encryptedText || !encryptedText.includes(':')) return encryptedText;
    try {
      const [ivHex, textHex] = encryptedText.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      const decipher = crypto.createDecipheriv(ALGORITHM, this.getKey(), iv);
      let decrypted = decipher.update(textHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch {
      return encryptedText;
    }
  }

  public static maskAadhaar(aadhaar: string): string {
    const clean = aadhaar ? aadhaar.replace(/\D/g, '') : '';
    if (clean.length < 4) return 'XXXX XXXX XXXX';
    const last4 = clean.slice(-4);
    return `XXXX XXXX ${last4}`;
  }

  public static maskPan(pan: string): string {
    const clean = pan ? pan.trim().toUpperCase() : '';
    if (clean.length !== 10) return 'XXXXX0000X';
    return `XXXXX${clean.slice(5, 9)}${clean.slice(-1)}`;
  }

  public static maskBankAccount(accountNum: string): string {
    const clean = accountNum ? accountNum.replace(/\D/g, '') : '';
    if (clean.length < 4) return 'XXXX XXXX 0000';
    return `XXXX XXXX ${clean.slice(-4)}`;
  }
}
