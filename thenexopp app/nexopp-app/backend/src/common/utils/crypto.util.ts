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

import * as fs from 'fs';
import * as path from 'path';

export class FileStorageUtil {
  public static saveBase64File(base64Data?: string, bucket: string = 'common'): string | undefined {
    if (!base64Data) return base64Data;
    if (!base64Data.startsWith('data:image/') && !base64Data.startsWith('data:application/pdf') && !base64Data.startsWith('data:')) {
      return base64Data; // Already a key or URL
    }

    try {
      const uploadDir = path.resolve('uploads', bucket);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      let ext = '.jpg';
      let cleanData = base64Data;
      if (base64Data.includes(';base64,')) {
        const parts = base64Data.split(';base64,');
        const mime = parts[0].replace('data:', '').toLowerCase();
        if (mime.includes('png')) ext = '.png';
        else if (mime.includes('webp')) ext = '.webp';
        else if (mime.includes('pdf')) ext = '.pdf';
        else if (mime.includes('svg')) ext = '.svg';
        cleanData = parts[1];
      }

      const buffer = Buffer.from(cleanData, 'base64');
      const fileKey = `${Date.now()}-${Math.floor(Math.random() * 1000000)}${ext}`;
      const filePath = path.join(uploadDir, fileKey);
      fs.writeFileSync(filePath, buffer);

      return fileKey;
    } catch (err) {
      console.error('[FileStorageUtil] Error saving base64 to disk:', err);
      return `file-${Date.now()}.jpg`;
    }
  }
}

