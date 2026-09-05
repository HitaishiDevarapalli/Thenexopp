import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateSecret, generateURI, verifySync } from 'otplib';
import QRCode from 'qrcode';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Secure storage directory
const DATA_DIR = path.join(__dirname, 'data');
const STORE_PATH = path.join(DATA_DIR, 'admin_2fa_store.json');

// Configure TOTP tolerance (allows +/- 1 step of 30 seconds for clock drift)
// authenticator.options is no longer used directly as we are using discrete functions
// We will use standard options where needed

// Strictly authorized administrator emails
export const AUTHORIZED_ADMIN_EMAILS = [
  'thenexopptech@gmail.com',
  'talatalareddy870@gmail.com',
  'mk0081709@gmail.com'
];

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadStore() {
  try {
    ensureDataDir();
    if (fs.existsSync(STORE_PATH)) {
      const data = fs.readFileSync(STORE_PATH, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error loading admin 2FA store:', err);
  }
  return {};
}

function saveStore(store) {
  try {
    ensureDataDir();
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving admin 2FA store:', err);
  }
}

/**
 * Check if the email is one of the two authorized administrators
 */
export function isAuthorizedAdminEmail(email) {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return AUTHORIZED_ADMIN_EMAILS.includes(clean);
}

/**
 * Get 2FA record for a specific administrator
 */
export function getAdmin2FARecord(email) {
  const clean = (email || '').trim().toLowerCase();
  if (!isAuthorizedAdminEmail(clean)) return null;

  const store = loadStore();
  return store[clean] || null;
}

/**
 * Generate a new TOTP secret & QR code for Google Authenticator setup
 */
export async function generateAdminTotpSetup(email) {
  const clean = (email || '').trim().toLowerCase();
  if (!isAuthorizedAdminEmail(clean)) {
    throw new Error(`Unauthorized email: ${clean}`);
  }

  const store = loadStore();
  let record = store[clean];

  // If secret doesn't exist or not yet configured, create a new secret
  if (!record || !record.secret) {
    const secret = generateSecret();
    record = {
      email: clean,
      secret,
      isConfigured: false,
      createdAt: new Date().toISOString(),
      lastVerifiedAt: null,
    };
    store[clean] = record;
    saveStore(store);
  }

  // Format label for Google Authenticator app: TheNexopp (email)
  const otpauthUrl = generateURI({
    issuer: 'TheNexopp Admin',
    label: clean,
    secret: record.secret,
  });
  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl, {
    margin: 2,
    width: 260,
    color: {
      dark: '#0F172A',
      light: '#FFFFFF',
    },
  });

  return {
    email: clean,
    secret: record.secret,
    qrCodeDataUrl,
    otpauthUrl,
    isConfigured: !!record.isConfigured,
  };
}

/**
 * Verify 6-digit TOTP code against the specific administrator's secret
 */
export function verifyAdminTotp(email, code) {
  const clean = (email || '').trim().toLowerCase();
  if (!isAuthorizedAdminEmail(clean)) {
    return { success: false, error: 'Unauthorized admin email' };
  }

  const store = loadStore();
  const record = store[clean];

  if (!record || !record.secret) {
    return { success: false, error: 'Authenticator is not configured yet. Please complete setup.' };
  }

  const cleanCode = (code || '').trim().replace(/\s+/g, '');
  if (!/^\d{6}$/.test(cleanCode)) {
    return { success: false, error: 'Invalid code format. Enter a 6-digit number.' };
  }

  let isValid = false;
  try {
    const verifyResult = verifySync({
      token: cleanCode,
      secret: record.secret,
    });
    isValid = verifyResult === true || (verifyResult && verifyResult.valid === true);
  } catch (err) {
    console.error('TOTP verification error:', err);
    isValid = false;
  }

  if (!isValid) {
    return { success: false, error: 'Incorrect 6-digit code. Check your Google Authenticator app and try again.' };
  }

  // Mark as verified and configured
  record.isConfigured = true;
  record.lastVerifiedAt = new Date().toISOString();
  store[clean] = record;
  saveStore(store);

  return { success: true };
}
