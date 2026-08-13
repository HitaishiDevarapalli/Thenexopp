import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pinoHttp from 'pino-http';
import pino from 'pino';
import cookieParser from 'cookie-parser';

import { prisma, checkDatabaseConnection } from './db.js';
import { hashPassword, verifyPassword, generateTokens, authMiddleware, requireRole } from './auth.js';
import { optimizeAndSaveImage } from './imageProcessor.js';
import { verifyWidgetToken } from './services/msg91WidgetService.js';
import {
  initLocationDb,
  searchLocationsService,
  reverseGeocodeService,
  getPopularCitiesService,
  searchPropertiesByLocationService,
} from './services/locationService.js';
import {
  userRegisterSchema,
  userLoginSchema,
  propertyValidationSchema,
  franchiseValidationSchema,
  enquirySchema,
} from './validators.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const app = express();
const PORT = process.env.PORT || 8081;

// Trust first proxy (Nginx reverse proxy) — required for express-rate-limit behind Nginx
app.set('trust proxy', 1);


// ── SECURITY & PERFORMANCE MIDDLEWARES ───────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(compression());
app.use(hpp());

// Configure CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8081',
  'https://thenexopp.com',
  'https://venturo-tawny.vercel.app',
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) {
      callback(null, true);
    } else {
      callback(null, true); // Allow flexible CORS in hybrid environment
    }
  },
  credentials: true,
}));

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', apiLimiter);

// Pino HTTP Request Logging Middleware
app.use(pinoHttp({ logger }));

app.use(express.json({ limit: '1000mb' }));
app.use(express.urlencoded({ extended: true, limit: '1000mb' }));
app.use(cookieParser());

// ── FILE STORAGE SUBDIRECTORIES ──────────────────────────────────────────────
const uploadDir = path.join(__dirname, '../uploads');
const subDirs = ['property-images', 'broker-images', 'profile-images'];
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
subDirs.forEach(sub => {
  const p = path.join(uploadDir, sub);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});
app.use('/uploads', express.static(uploadDir, { maxAge: '30d' }));

// Ensure PostgreSQL is connected & initialize Location DB
checkDatabaseConnection().then(async (connected) => {
  if (connected) {
    try {
      await initLocationDb(prisma);
    } catch (err) {
      logger.warn({ error: err.message }, "Location DB initialization notice (non-fatal)");
    }
  } else {
    logger.warn("Running without PostgreSQL connection.");
  }
});

// ── LOCATION & GEOLOCATION ENDPOINTS ──────────────────────────────────────────
app.get('/api/locations/search', async (req, res, next) => {
  try {
    const { q = '', limit = 10 } = req.query;
    const locations = await searchLocationsService(prisma, q, limit);
    return res.json(locations);
  } catch (err) {
    next(err);
  }
});

app.post('/api/locations/reverse-geocode', async (req, res, next) => {
  try {
    const { lat, lng } = req.body;
    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }
    const location = await reverseGeocodeService(prisma, lat, lng);
    return res.json(location);
  } catch (err) {
    next(err);
  }
});

app.get('/api/locations/popular', async (req, res, next) => {
  try {
    const popular = await getPopularCitiesService(prisma);
    return res.json(popular);
  } catch (err) {
    next(err);
  }
});

app.post('/api/locations/select', async (req, res, next) => {
  try {
    const { id } = req.body;
    if (id) {
      await prisma.location.update({
        where: { id },
        data: { popularity: { increment: 1 } },
      }).catch(() => {});
    }
    return res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

app.get('/api/properties/search', async (req, res, next) => {
  try {
    const properties = await searchPropertiesByLocationService(prisma, req.query);
    return res.json(properties);
  } catch (err) {
    next(err);
  }
});

// ── SHARP WEBP IMAGE UPLOAD ENDPOINT ─────────────────────────────────────────
app.post('/api/upload', async (req, res, next) => {
  const { fileName, fileData, folder = 'property-images' } = req.body;
  if (!fileData) {
    return res.status(400).json({ error: 'No file data provided' });
  }

  try {
    const targetDir = path.join(uploadDir, subDirs.includes(folder) ? folder : 'property-images');
    const { webpFileName, thumbFileName } = await optimizeAndSaveImage(fileData, fileName, targetDir);

    const protocol = req.protocol;
    const host = req.headers.host;
    const relFolder = subDirs.includes(folder) ? folder : 'property-images';
    const fileUrl = `${protocol}://${host}/uploads/${relFolder}/${webpFileName}`;
    const thumbUrl = `${protocol}://${host}/uploads/${relFolder}/${thumbFileName}`;

    logger.info({ webpFileName, thumbFileName, relFolder }, 'Image optimized and saved via Sharp WebP');

    res.status(201).json({
      success: true,
      url: fileUrl,
      thumbUrl: thumbUrl,
      fileName: webpFileName,
    });
  } catch (err) {
    next(err);
  }
});

// ── EMAIL OTP AUTHENTICATION ENDPOINTS ──────────────────────────────────────
const emailOtpsMap = new Map();

app.post('/api/auth/send-email-otp', async (req, res) => {
  try {
    const { email, fullName } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email address is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    emailOtpsMap.set(cleanEmail, {
      otp,
      expiresAt,
      fullName: fullName || cleanEmail.split('@')[0],
    });

    console.log(`\n==========================================`);
    console.log(`[EMAIL OTP GENERATED] Email: ${cleanEmail} | OTP: ${otp}`);
    console.log(`==========================================\n`);

    return res.json({
      success: true,
      message: `OTP sent to ${cleanEmail}`,
      otp: otp,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to send OTP to email' });
  }
});

app.post('/api/auth/verify-email-otp', async (req, res) => {
  try {
    const { email, otp, fullName, mobile } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const record = emailOtpsMap.get(cleanEmail);

    if (!record) {
      return res.status(400).json({ error: 'No OTP requested for this email. Please request a new OTP.' });
    }

    if (Date.now() > record.expiresAt) {
      emailOtpsMap.delete(cleanEmail);
      return res.status(400).json({ error: 'OTP has expired. Please request a new OTP.' });
    }

    if (record.otp !== otp.trim()) {
      return res.status(400).json({ error: 'Invalid OTP code. Please check your email and try again.' });
    }

    // Clear used OTP
    emailOtpsMap.delete(cleanEmail);

    const now = new Date().toLocaleString();
    const userName = fullName || record.fullName || cleanEmail.split('@')[0];

    let customer = null;
    try {
      const existing = await prisma.customer.findFirst({
        where: { email: cleanEmail },
      });

      if (existing) {
        customer = await prisma.customer.update({
          where: { id: existing.id },
          data: {
            name: userName || existing.name,
            phone: mobile || existing.phone || '',
            lastLoginAt: now,
            loginCount: existing.loginCount + 1,
          },
        });
      } else {
        customer = await prisma.customer.create({
          data: {
            name: userName,
            email: cleanEmail,
            phone: mobile || '',
            gender: 'Not Specified',
            district: 'General',
            role: 'Verified Investor',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=007A55&color=fff`,
            lastLoginAt: now,
            loginCount: 1,
            status: 'Active',
            registeredDate: new Date().toLocaleDateString(),
          },
        });
      }
    } catch (dbErr) {
      logger.warn({ dbErr }, 'Database offline during Email OTP login, falling back to mock customer');
      customer = {
        id: `cust-${cleanEmail}`,
        name: userName,
        email: cleanEmail,
        phone: mobile || '',
        gender: 'Not Specified',
        district: 'General',
        role: 'Verified Investor',
      };
    }

    const userPayload = {
      id: customer.id,
      email: customer.email,
      fullName: customer.name,
      mobile: customer.phone,
      role: customer.role || 'Verified Investor',
    };

    const tokens = generateTokens(userPayload);

    res.cookie('auth_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      message: 'Email OTP verification successful',
      user: userPayload,
      tokens,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'OTP Verification failed' });
  }
});

// ── CUSTOM MSG91 OTP AUTHENTICATION ENDPOINTS & RATE LIMITING ────────────────
const otpSessionsMap = new Map();

// Helper to validate and clean Indian mobile number (10 digits)
function cleanIndianMobile(mobile) {
  if (!mobile) return null;
  const cleaned = mobile.toString().replace(/\D/g, '');
  if (cleaned.length === 10) {
    return cleaned;
  }
  // If user sent with 91 prefix, handle it
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return cleaned.slice(2);
  }
  return null;
}

app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { mobile } = req.body;
    const cleaned = cleanIndianMobile(mobile);
    if (!cleaned) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit Indian mobile number.' });
    }

    const now = Date.now();
    let session = otpSessionsMap.get(cleaned);

    if (session) {
      // Check block state
      if (session.blockedUntil && now < session.blockedUntil) {
        const minutesLeft = Math.ceil((session.blockedUntil - now) / (60 * 1000));
        return res.status(429).json({ error: `Too many attempts or requests. Please try again after ${minutesLeft} minutes.` });
      }

      // Check 30 seconds limit between requests
      if (now - session.lastOtpRequestAt < 30000) {
        const secondsLeft = Math.ceil((30000 - (now - session.lastOtpRequestAt)) / 1000);
        return res.status(429).json({ error: `Please wait ${secondsLeft} seconds before requesting another OTP.` });
      }

      // Check 15-minute rate limit window
      if (now - session.firstRequestInWindowAt > 15 * 60 * 1000) {
        session.firstRequestInWindowAt = now;
        session.requestCount = 1;
      } else {
        if (session.requestCount >= 3) {
          session.blockedUntil = now + 15 * 60 * 1000;
          otpSessionsMap.set(cleaned, session);
          return res.status(429).json({ error: 'Maximum 3 OTP requests allowed within 15 minutes. Temporarily blocked.' });
        }
        session.requestCount++;
      }

      session.lastOtpRequestAt = now;
      session.otpAttemptCount = 0; // reset attempts for the new OTP
    } else {
      session = {
        mobile: cleaned,
        firstRequestInWindowAt: now,
        requestCount: 1,
        lastOtpRequestAt: now,
        otpAttemptCount: 0,
        blockedUntil: null
      };
    }

    otpSessionsMap.set(cleaned, session);

    const authKey = process.env.MSG91_AUTH_KEY || process.env.MSG91_TOKEN_AUTH;
    const templateId = process.env.MSG91_TEMPLATE_ID || '6a7d73335c4fafe2050bbfb4';

    if (!authKey) {
      console.error('MSG91 auth key is missing in environment variables.');
      return res.status(500).json({ error: 'SMS service configuration is missing. Please contact support.' });
    }

    const formattedMobile = `91${cleaned}`;
    const url = `https://control.msg91.com/api/v5/otp?template_id=${templateId}&mobile=${formattedMobile}&otp_length=6`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authkey': authKey
      }
    });

    const data = await response.json();

    if (response.ok && (data.type === 'success' || data.status === 'success')) {
      return res.json({
        success: true,
        message: 'OTP sent successfully.'
      });
    } else {
      console.error('MSG91 Send OTP failure response:', data);
      return res.status(502).json({ error: 'We couldn\'t send the OTP right now. Please try again.' });
    }
  } catch (err) {
    console.error('Error in send-otp route:', err);
    return res.status(500).json({ error: 'An internal server error occurred while sending OTP.' });
  }
});

app.post('/api/auth/resend-otp', async (req, res) => {
  try {
    const { mobile } = req.body;
    const cleaned = cleanIndianMobile(mobile);
    if (!cleaned) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit Indian mobile number.' });
    }

    const now = Date.now();
    const session = otpSessionsMap.get(cleaned);

    if (!session) {
      return res.status(400).json({ error: 'No active OTP session found. Please request a new OTP first.' });
    }

    // Check block state
    if (session.blockedUntil && now < session.blockedUntil) {
      const minutesLeft = Math.ceil((session.blockedUntil - now) / (60 * 1000));
      return res.status(429).json({ error: `Too many attempts or requests. Please try again after ${minutesLeft} minutes.` });
    }

    // Check 30 seconds limit between requests
    if (now - session.lastOtpRequestAt < 30000) {
      const secondsLeft = Math.ceil((30000 - (now - session.lastOtpRequestAt)) / 1000);
      return res.status(429).json({ error: `Please wait ${secondsLeft} seconds before resending OTP.` });
    }

    // Check 15-minute rate limit window
    if (now - session.firstRequestInWindowAt > 15 * 60 * 1000) {
      session.firstRequestInWindowAt = now;
      session.requestCount = 1;
    } else {
      if (session.requestCount >= 3) {
        session.blockedUntil = now + 15 * 60 * 1000;
        otpSessionsMap.set(cleaned, session);
        return res.status(429).json({ error: 'Maximum 3 OTP requests allowed within 15 minutes. Temporarily blocked.' });
      }
      session.requestCount++;
    }

    session.lastOtpRequestAt = now;
    session.otpAttemptCount = 0; // reset attempts for retry/new OTP
    otpSessionsMap.set(cleaned, session);

    const authKey = process.env.MSG91_AUTH_KEY || process.env.MSG91_TOKEN_AUTH;

    if (!authKey) {
      console.error('MSG91 auth key is missing in environment variables.');
      return res.status(500).json({ error: 'SMS service configuration is missing. Please contact support.' });
    }

    const formattedMobile = `91${cleaned}`;
    const url = `https://control.msg91.com/api/v5/otp/retry?mobile=${formattedMobile}&retrytype=text`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'authkey': authKey,
        'accept': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok && (data.type === 'success' || data.status === 'success')) {
      return res.json({
        success: true,
        message: 'OTP resent successfully.'
      });
    } else {
      console.error('MSG91 Resend OTP failure response:', data);
      return res.status(502).json({ error: data.message || 'Failed to resend OTP. Please request a new one.' });
    }
  } catch (err) {
    console.error('Error in resend-otp route:', err);
    return res.status(500).json({ error: 'An internal server error occurred while resending OTP.' });
  }
});

app.post('/api/auth/verify-otp', async (req, res, next) => {
  try {
    const { mobile, otp, fullName, gender, district } = req.body;
    const cleaned = cleanIndianMobile(mobile);
    if (!cleaned) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit Indian mobile number.' });
    }

    if (!otp || otp.trim().length !== 6) {
      return res.status(400).json({ error: 'Please enter a valid 6-digit verification code.' });
    }

    const now = Date.now();
    const session = otpSessionsMap.get(cleaned);

    if (!session) {
      return res.status(400).json({ error: 'No active OTP session found. Please request a new OTP.' });
    }

    // Check block state
    if (session.blockedUntil && now < session.blockedUntil) {
      const minutesLeft = Math.ceil((session.blockedUntil - now) / (60 * 1000));
      return res.status(429).json({ error: `Too many attempts or requests. Please try again after ${minutesLeft} minutes.` });
    }

    // Check verification attempt count
    if (session.otpAttemptCount >= 5) {
      session.blockedUntil = now + 15 * 60 * 1000;
      otpSessionsMap.set(cleaned, session);
      return res.status(429).json({ error: 'Too many incorrect attempts. Please try again after 15 minutes.' });
    }

    session.otpAttemptCount++;
    otpSessionsMap.set(cleaned, session);

    const authKey = process.env.MSG91_AUTH_KEY || process.env.MSG91_TOKEN_AUTH;
    if (!authKey) {
      console.error('MSG91 auth key is missing in environment variables.');
      return res.status(500).json({ error: 'SMS service configuration is missing. Please contact support.' });
    }

    let isVerified = false;
    const formattedMobile = `91${cleaned}`;
    const url = `https://control.msg91.com/api/v5/otp/verify?mobile=${formattedMobile}&otp=${otp.trim()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'authkey': authKey,
        'accept': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok && (data.type === 'success' || data.status === 'success' || data.message === 'number_verified_successfully')) {
      isVerified = true;
    } else {
      console.error('MSG91 Verify OTP failure response:', data);
    }

    if (!isVerified) {
      if (session.otpAttemptCount >= 5) {
        session.blockedUntil = now + 15 * 60 * 1000;
        otpSessionsMap.set(cleaned, session);
        return res.status(429).json({ error: 'Too many incorrect attempts. Please try again after 15 minutes.' });
      }
      return res.status(400).json({ error: 'Invalid OTP. Please check the code and try again.' });
    }

    // Verification successful - clear session
    otpSessionsMap.delete(cleaned);

    const verifiedMobile = cleaned;
    const timestamp = new Date().toLocaleString();
    const mockEmail = `${verifiedMobile}@nexopp.in`;
    const targetName = fullName || 'Verified Investor';

    let customer = null;
    try {
      const existing = await prisma.customer.findFirst({
        where: { OR: [{ phone: verifiedMobile }, { email: mockEmail }] },
      });

      if (existing) {
        customer = await prisma.customer.update({
          where: { id: existing.id },
          data: {
            name: existing.name || targetName,
            gender: existing.gender || gender,
            district: existing.district || district,
            lastLoginAt: timestamp,
            loginCount: existing.loginCount + 1,
          },
        });
      } else {
        customer = await prisma.customer.create({
          data: {
            name: targetName,
            email: mockEmail,
            phone: verifiedMobile,
            gender: gender || 'Male',
            district: district || 'Hyderabad',
            role: 'Verified Investor',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(targetName)}&background=007A55&color=fff`,
            lastLoginAt: timestamp,
            loginCount: 1,
            status: 'Active',
            registeredDate: new Date().toLocaleDateString(),
          },
        });
      }
    } catch (dbErr) {
      logger.warn({ dbErr }, 'Database offline or query error during OTP verification, falling back to session payload');
      customer = {
        id: `cust-${verifiedMobile}`,
        name: targetName,
        email: mockEmail,
        phone: verifiedMobile,
        gender: gender || 'Male',
        district: district || 'Hyderabad',
        role: 'Verified Investor',
      };
    }

    // Generate JWT Token
    const userPayload = {
      id: customer.id,
      email: customer.email,
      fullName: customer.name,
      mobile: customer.phone,
      role: customer.role || 'Verified Investor',
      gender: customer.gender,
      district: customer.district,
    };

    const tokens = generateTokens(userPayload);

    // Set HTTP-Only Cookie
    res.cookie('auth_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.json({
      success: true,
      message: 'OTP verified successfully.',
      user: userPayload,
      tokens,
    });
  } catch (err) {
    next(err);
  }
});

// ── MSG91 WIDGET OTP AUTHENTICATION ENDPOINT ─────────────────────────────────
app.post('/api/auth/widget-login', async (req, res, next) => {
  try {
    const { verificationToken, fullName, gender, district } = req.body;
    if (!verificationToken) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    // Verify verificationToken with MSG91 Widget API
    const verifyResult = await verifyWidgetToken(verificationToken);
    if (!verifyResult.success || !verifyResult.mobile) {
      return res.status(400).json({ error: verifyResult.message || 'MSG91 Widget Token verification failed' });
    }

    const verifiedMobile = verifyResult.mobile;
    const now = new Date().toLocaleString();
    const mockEmail = `${verifiedMobile}@nexopp.in`;

    let customer = null;
    try {
      const existing = await prisma.customer.findFirst({
        where: { OR: [{ phone: verifiedMobile }, { email: mockEmail }] },
      });

      if (existing) {
        customer = await prisma.customer.update({
          where: { id: existing.id },
          data: {
            name: fullName || existing.name,
            gender: gender || existing.gender,
            district: district || existing.district,
            lastLoginAt: now,
            loginCount: existing.loginCount + 1,
          },
        });
      } else {
        customer = await prisma.customer.create({
          data: {
            name: fullName || 'Verified Investor',
            email: mockEmail,
            phone: verifiedMobile,
            gender: gender || 'Male',
            district: district || 'Hyderabad',
            role: 'Verified Investor',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || 'User')}&background=007A55&color=fff`,
            lastLoginAt: now,
            loginCount: 1,
            status: 'Active',
            registeredDate: new Date().toLocaleDateString(),
          },
        });
      }
    } catch (dbErr) {
      logger.warn({ dbErr }, 'Database offline or query error during Widget login, falling back to session payload');
      customer = {
        id: `cust-${verifiedMobile}`,
        name: fullName || 'Verified Investor',
        email: mockEmail,
        phone: verifiedMobile,
        gender: gender || 'Male',
        district: district || 'Hyderabad',
        role: 'Verified Investor',
      };
    }

    // Generate JWT Token
    const userPayload = {
      id: customer.id,
      email: customer.email,
      fullName: customer.name,
      mobile: customer.phone,
      role: customer.role || 'Verified Investor',
      gender: customer.gender,
      district: customer.district,
    };

    const tokens = generateTokens(userPayload);

    // Set HTTP-Only Cookie
    res.cookie('auth_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.json({
      success: true,
      message: 'Widget login successful',
      user: userPayload,
      tokens,
    });
  } catch (err) {
    next(err);
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  return res.json({ success: true, user: req.user });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('auth_token');
  return res.json({ success: true, message: 'Logged out successfully' });
});

app.post('/api/auth/register', async (req, res, next) => {
  try {
    const validated = userRegisterSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email: validated.email.toLowerCase() } });
    if (existing) return res.status(400).json({ error: 'User with this email already exists' });

    const passwordHash = await hashPassword(validated.password);
    const newUser = await prisma.user.create({
      data: {
        email: validated.email.toLowerCase(),
        fullName: validated.fullName,
        passwordHash,
        role: validated.role || 'USER',
      },
    });

    const tokens = generateTokens(newUser);
    res.cookie('auth_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({ success: true, user: { id: newUser.id, email: newUser.email, fullName: newUser.fullName, role: newUser.role }, tokens });
  } catch (err) {
    next(err);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const validated = userLoginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: validated.email.toLowerCase() } });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const isMatch = await verifyPassword(validated.password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

    const tokens = generateTokens(user);
    res.cookie('auth_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true, user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role }, tokens });
  } catch (err) {
    next(err);
  }
});

// ── CUSTOMERS ENDPOINTS ──────────────────────────────────────────────────────
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({ orderBy: { createdAt: 'desc' } }).catch(() => []);
    return res.json(customers || []);
  } catch (err) {
    return res.json([]);
  }
});

app.post('/api/customers', async (req, res, next) => {
  try {
    const { email, phone, name, gender, district, role, avatar } = req.body;
    const now = new Date().toLocaleString();

    const existing = await prisma.customer.findFirst({
      where: {
        OR: [
          phone ? { phone } : undefined,
          email ? { email } : undefined,
        ].filter(Boolean),
      },
    });

    if (existing) {
      const updated = await prisma.customer.update({
        where: { id: existing.id },
        data: {
          name: name || existing.name,
          gender: gender || existing.gender,
          district: district || existing.district,
          role: role || existing.role,
          avatar: avatar || existing.avatar,
          lastLoginAt: now,
          loginCount: existing.loginCount + 1,
        },
      });
      return res.json(updated);
    } else {
      const newCust = await prisma.customer.create({
        data: {
          name: name || 'Anonymous User',
          email: email || `${phone || Date.now()}@nexopp.in`,
          phone: phone || '',
          gender: gender || 'Male',
          district: district || 'Guntur',
          role: role || 'Verified Investor',
          avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=007A55&color=fff`,
          lastLoginAt: now,
          loginCount: 1,
          status: 'Active',
          registeredDate: new Date().toLocaleDateString(),
        },
      });
      return res.status(201).json(newCust);
    }
  } catch (err) {
    next(err);
  }
});

app.delete('/api/customers/:id', async (req, res, next) => {
  try {
    await prisma.customer.deleteMany({ where: { id: req.params.id } });
    return res.json({ success: true, id: req.params.id });
  } catch (err) {
    next(err);
  }
});

// ── PROPERTY ENDPOINTS ────────────────────────────────────────────────────────
app.get('/api/properties', async (req, res) => {
  try {
    const props = await prisma.property.findMany({ orderBy: { createdAt: 'desc' } }).catch(() => []);
    return res.json(props || []);
  } catch (err) {
    return res.json([]);
  }
});

app.post('/api/properties', async (req, res, next) => {
  try {
    if (req.body.title && req.body.price) {
      try { propertyValidationSchema.partial().parse(req.body); } catch (_) {}
    }
    const newProp = { id: req.body.id || `prop-pg-${Date.now()}`, createdDate: new Date().toLocaleDateString(), ...req.body };

    let listingStatus = 'PUBLISHED';
    if (newProp.listingStatus) {
      const upper = String(newProp.listingStatus).toUpperCase();
      if (['DRAFT', 'PENDING', 'PUBLISHED', 'HIDDEN', 'RESERVED', 'SOLD', 'EXPIRED', 'ARCHIVED'].includes(upper)) {
        listingStatus = upper;
      }
    }

    const created = await prisma.property.create({
      data: {
        id: newProp.id,
        title: newProp.title || 'Untitled Property',
        description: newProp.description || '',
        image: newProp.image || '',
        image2: newProp.image2 || null,
        image3: newProp.image3 || null,
        image4: newProp.image4 || null,
        image5: newProp.image5 || null,
        image6: newProp.image6 || null,
        state: newProp.state || 'Andhra Pradesh',
        district: newProp.district || 'Guntur',
        city: newProp.city || 'Guntur',
        area: newProp.area || '',
        latitude: Number(newProp.latitude) || 16.3067,
        longitude: Number(newProp.longitude) || 80.4363,
        price: Number(newProp.price) || 0,
        priceDisplay: newProp.priceDisplay || `₹${newProp.price}`,
        category: newProp.category || 'Flats',
        status: newProp.status || 'Buy',
        listingStatus: listingStatus,
        areaSqFt: newProp.areaSqFt || '1000 Sq.ft',
        bedrooms: Number(newProp.bedrooms) || 0,
        bathrooms: Number(newProp.bathrooms) || 0,
        verified: newProp.verified !== false,
        premium: Boolean(newProp.premium),
        trending: Boolean(newProp.trending),
        agentName: newProp.agentName || 'NEXOPP Advisor',
        createdDate: newProp.createdDate,
      },
    });
    return res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

app.put('/api/properties/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const d = req.body;
    const updateData = {};
    if (d.title !== undefined) updateData.title = String(d.title);
    if (d.description !== undefined) updateData.description = String(d.description);
    if (d.image !== undefined) updateData.image = String(d.image);
    if (d.image2 !== undefined) updateData.image2 = d.image2;
    if (d.image3 !== undefined) updateData.image3 = d.image3;
    if (d.image4 !== undefined) updateData.image4 = d.image4;
    if (d.image5 !== undefined) updateData.image5 = d.image5;
    if (d.image6 !== undefined) updateData.image6 = d.image6;
    if (d.state !== undefined) updateData.state = String(d.state);
    if (d.district !== undefined) updateData.district = String(d.district);
    if (d.city !== undefined) updateData.city = String(d.city);
    if (d.area !== undefined) updateData.area = String(d.area);
    if (d.latitude !== undefined) updateData.latitude = Number(d.latitude);
    if (d.longitude !== undefined) updateData.longitude = Number(d.longitude);
    if (d.price !== undefined) updateData.price = Number(d.price);
    if (d.priceDisplay !== undefined) updateData.priceDisplay = String(d.priceDisplay);
    if (d.category !== undefined) updateData.category = String(d.category);
    if (d.status !== undefined) updateData.status = String(d.status);
    if (d.areaSqFt !== undefined) updateData.areaSqFt = String(d.areaSqFt);
    if (d.bedrooms !== undefined) updateData.bedrooms = Number(d.bedrooms);
    if (d.bathrooms !== undefined) updateData.bathrooms = Number(d.bathrooms);
    if (d.verified !== undefined) updateData.verified = Boolean(d.verified);
    if (d.premium !== undefined) updateData.premium = Boolean(d.premium);
    if (d.trending !== undefined) updateData.trending = Boolean(d.trending);
    if (d.agentName !== undefined) updateData.agentName = d.agentName;
    if (d.viewsCount !== undefined) updateData.viewsCount = Number(d.viewsCount);
    if (d.listingStatus !== undefined) updateData.listingStatus = d.listingStatus;

    const updated = await prisma.property.update({
      where: { id },
      data: updateData,
    });
    return res.json(updated);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/properties/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.property.deleteMany({ where: { id } });
    return res.json({ success: true, id });
  } catch (err) {
    next(err);
  }
});

app.get('/api/franchises', async (req, res) => {
  try {
    const franchises = await prisma.franchise.findMany({ orderBy: { createdAt: 'desc' } }).catch(() => []);
    return res.json(franchises || []);
  } catch (err) {
    return res.json([]);
  }
});

app.post('/api/franchises', async (req, res, next) => {
  try {
    const f = req.body;
    const created = await prisma.franchise.create({
      data: {
        id: f.id || `fran-pg-${Date.now()}`,
        brand: f.brand || f.name || 'Franchise Brand',
        type: f.type || 'Standard',
        category: f.category || 'Retail',
        investment: Number(f.investment) || 500000,
        investmentDisplay: f.investmentDisplay || `₹${f.investment || '5 Lakhs'}`,
        location: f.location || 'Guntur',
        state: f.state || 'Andhra Pradesh',
        city: f.city || 'Guntur',
        latitude: Number(f.latitude) || 16.3067,
        longitude: Number(f.longitude) || 80.4363,
        rating: Number(f.rating) || 4.8,
        reviewCount: Number(f.reviewCount) || 0,
        verified: f.verified !== false,
        trending: Boolean(f.trending),
        availableBranchCount: Number(f.availableBranchCount) || 1,
        image: f.image || '',
        logo: f.logo || f.image || '',
        trustScore: Number(f.trustScore) || 95,
        status: f.status || 'Active',
      },
    });
    return res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

app.put('/api/franchises/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const f = req.body;
    const updateData = {};
    if (f.brand !== undefined) updateData.brand = f.brand;
    if (f.type !== undefined) updateData.type = f.type;
    if (f.category !== undefined) updateData.category = f.category;
    if (f.investment !== undefined) updateData.investment = Number(f.investment);
    if (f.investmentDisplay !== undefined) updateData.investmentDisplay = f.investmentDisplay;
    if (f.location !== undefined) updateData.location = f.location;
    if (f.state !== undefined) updateData.state = f.state;
    if (f.city !== undefined) updateData.city = f.city;
    if (f.rating !== undefined) updateData.rating = Number(f.rating);
    if (f.verified !== undefined) updateData.verified = Boolean(f.verified);
    if (f.trending !== undefined) updateData.trending = Boolean(f.trending);
    if (f.image !== undefined) updateData.image = f.image;
    if (f.logo !== undefined) updateData.logo = f.logo;
    if (f.status !== undefined) updateData.status = f.status;

    const updated = await prisma.franchise.update({ where: { id }, data: updateData });
    return res.json(updated);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/franchises/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.franchise.deleteMany({ where: { id } });
    return res.json({ success: true, id });
  } catch (err) {
    next(err);
  }
});

app.get('/api/businesses', async (req, res) => {
  try {
    const { published, location, category, businessType, minPrice, maxPrice, sort, search, featured } = req.query;
    
    const where = {};
    if (published === 'true') where.published = true;
    if (location) where.location = { contains: String(location), mode: 'insensitive' };
    if (category) where.category = String(category);
    if (businessType) where.businessType = String(businessType);
    if (featured === 'true') where.featured = true;
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { description: { contains: String(search), mode: 'insensitive' } },
        { industry: { contains: String(search), mode: 'insensitive' } }
      ];
    }
    
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    let orderBy = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    else if (sort === 'price_desc') orderBy = { price: 'desc' };
    else if (sort === 'rating_desc') orderBy = { rating: 'desc' };

    const businesses = await prisma.business.findMany({ where, orderBy }).catch(() => []);
    return res.json(businesses || []);
  } catch (err) {
    return res.json([]);
  }
});

app.post('/api/businesses', async (req, res, next) => {
  try {
    const b = req.body;
    const created = await prisma.business.create({
      data: {
        id: b.id || `biz-pg-${Date.now()}`,
        name: b.name || b.title || 'Business Listing',
        industry: b.category || b.industry || 'Retail',
        category: b.category || b.industry || 'Retail',
        businessType: b.businessType || 'Private Limited',
        location: b.location || b.city || 'Guntur',
        state: b.state || 'Andhra Pradesh',
        city: b.city || 'Guntur',
        latitude: Number(b.latitude) || 16.3067,
        longitude: Number(b.longitude) || 80.4363,
        price: Number(b.price) || Number(b.askingPrice) || 50,
        priceDisplay: b.priceDisplay || `₹${b.price || b.askingPrice || 50} Lakhs`,
        revenueMonthly: b.revenueMonthly || '₹1 Lakh/mo',
        profitMonthly: b.profitMonthly || '₹30,000/mo',
        establishedYear: Number(b.establishedYear) || 2020,
        employeesCount: Number(b.employeesCount) || 5,
        rating: Number(b.rating) || 4.7,
        reviewCount: Number(b.reviewCount) || 0,
        verified: b.verified !== false,
        image: b.image || b.imageUrl || '',
        description: b.description || '',
        reasonForSale: b.reasonForSale || 'Retirement',
        trustScore: Number(b.trustScore) || 95,
        published: b.published !== false,
        featured: b.featured === true || b.featured === 'true',
        status: b.status || 'Available',
      },
    });
    return res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

app.put('/api/businesses/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const b = req.body;
    const updateData = {};
    if (b.name !== undefined) updateData.name = b.name;
    if (b.industry !== undefined) updateData.industry = b.industry;
    if (b.category !== undefined) updateData.category = b.category;
    if (b.businessType !== undefined) updateData.businessType = b.businessType;
    if (b.location !== undefined) updateData.location = b.location;
    if (b.city !== undefined) updateData.city = b.city;
    if (b.state !== undefined) updateData.state = b.state;
    if (b.price !== undefined) updateData.price = Number(b.price);
    if (b.priceDisplay !== undefined) updateData.priceDisplay = b.priceDisplay;
    if (b.revenueMonthly !== undefined) updateData.revenueMonthly = b.revenueMonthly;
    if (b.profitMonthly !== undefined) updateData.profitMonthly = b.profitMonthly;
    if (b.establishedYear !== undefined) updateData.establishedYear = Number(b.establishedYear);
    if (b.employeesCount !== undefined) updateData.employeesCount = Number(b.employeesCount);
    if (b.image !== undefined) updateData.image = b.image;
    if (b.description !== undefined) updateData.description = b.description;
    if (b.reasonForSale !== undefined) updateData.reasonForSale = b.reasonForSale;
    if (b.verified !== undefined) updateData.verified = b.verified === true || b.verified === 'true';
    if (b.trustScore !== undefined) updateData.trustScore = Number(b.trustScore);
    if (b.rating !== undefined) updateData.rating = Number(b.rating);
    if (b.published !== undefined) updateData.published = b.published === true || b.published === 'true';
    if (b.featured !== undefined) updateData.featured = b.featured === true || b.featured === 'true';
    if (b.status !== undefined) updateData.status = b.status;

    const updated = await prisma.business.update({ where: { id }, data: updateData });
    return res.json(updated);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/businesses/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.business.deleteMany({ where: { id } });
    return res.json({ success: true, id });
  } catch (err) {
    next(err);
  }
});

// ── SELL BUSINESS REQUESTS ENDPOINTS ─────────────────────────────────────────
app.get('/api/sell-business-requests', async (req, res) => {
  try {
    const requests = await prisma.sellBusinessRequest.findMany({ orderBy: { createdAt: 'desc' } }).catch(() => []);
    return res.json(requests || []);
  } catch (err) {
    return res.json([]);
  }
});

app.post('/api/sell-business-requests', async (req, res, next) => {
  try {
    const r = req.body;
    if (!r.name || !r.mobile) {
      return res.status(400).json({ error: 'Name and mobile number are required' });
    }
    const created = await prisma.sellBusinessRequest.create({
      data: {
        id: r.id || `sbr-${Date.now()}`,
        name: String(r.name),
        mobile: String(r.mobile),
        email: r.email || null,
        city: String(r.city || ''),
        businessCategory: String(r.businessCategory || 'Retail'),
        preferredContactMethod: String(r.preferredContactMethod || 'Phone Call'),
        status: 'PENDING_REVIEW',
        adminNotes: null,
      },
    });
    return res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

app.put('/api/sell-business-requests/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const r = req.body;
    const updateData = {};
    if (r.status !== undefined) updateData.status = String(r.status);
    if (r.adminNotes !== undefined) updateData.adminNotes = String(r.adminNotes);
    if (r.name !== undefined) updateData.name = String(r.name);
    if (r.mobile !== undefined) updateData.mobile = String(r.mobile);
    if (r.email !== undefined) updateData.email = r.email;
    if (r.city !== undefined) updateData.city = String(r.city);
    if (r.businessCategory !== undefined) updateData.businessCategory = String(r.businessCategory);
    if (r.preferredContactMethod !== undefined) updateData.preferredContactMethod = String(r.preferredContactMethod);
    const updated = await prisma.sellBusinessRequest.update({ where: { id }, data: updateData });
    return res.json(updated);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/sell-business-requests/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.sellBusinessRequest.deleteMany({ where: { id } });
    return res.json({ success: true, id });
  } catch (err) {
    next(err);
  }
});

// ── SELL PROPERTY REQUESTS ENDPOINTS ─────────────────────────────────────────
app.get('/api/sell-requests', async (req, res) => {
  try {
    const requests = await prisma.sellRequest.findMany({ orderBy: { createdAt: 'desc' } }).catch(() => []);
    return res.json(requests || []);
  } catch (err) {
    return res.json([]);
  }
});

app.post('/api/sell-requests', async (req, res, next) => {
  try {
    const r = req.body;
    if (!r.sellerName || !r.mobile) {
      return res.status(400).json({ error: 'Seller name and mobile number are required' });
    }
    const created = await prisma.sellRequest.create({
      data: {
        id: r.id || `sr-${Date.now()}`,
        sellerName: String(r.sellerName),
        mobile: String(r.mobile),
        email: r.email || null,
        city: String(r.city || ''),
        propertyType: String(r.propertyType || 'Residential'),
        message: r.message || null,
        status: 'PENDING_REVIEW',
        adminNotes: null,
      },
    });
    return res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

app.put('/api/sell-requests/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const r = req.body;
    const updateData = {};
    if (r.status !== undefined) updateData.status = String(r.status);
    if (r.adminNotes !== undefined) updateData.adminNotes = String(r.adminNotes);
    if (r.sellerName !== undefined) updateData.sellerName = String(r.sellerName);
    if (r.mobile !== undefined) updateData.mobile = String(r.mobile);
    if (r.email !== undefined) updateData.email = r.email;
    if (r.city !== undefined) updateData.city = String(r.city);
    if (r.propertyType !== undefined) updateData.propertyType = String(r.propertyType);
    if (r.message !== undefined) updateData.message = r.message;
    const updated = await prisma.sellRequest.update({ where: { id }, data: updateData });
    return res.json(updated);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/sell-requests/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.sellRequest.deleteMany({ where: { id } });
    return res.json({ success: true, id });
  } catch (err) {
    next(err);
  }
});

// ── DEALER / BROKER ENDPOINTS ─────────────────────────────────────────────────
app.get('/api/dealers', async (req, res) => {
  try {
    const dealers = await prisma.broker.findMany({ orderBy: { createdAt: 'desc' } }).catch(() => []);
    return res.json(dealers || []);
  } catch (err) {
    return res.json([]);
  }
});

app.post('/api/dealers', async (req, res, next) => {
  try {
    const d = req.body;
    const created = await prisma.broker.create({
      data: {
        id: d.id || `dealer-pg-${Date.now()}`,
        companyName: d.companyName || d.fullName || 'Independent Realty',
        logo: d.logo || d.photo || null,
        photo: d.photo || d.logo || null,
        rating: Number(d.rating) || 4.8,
        reviewCount: Number(d.reviewCount) || 0,
        verified: d.verified !== false,
        yearsExperience: Number(d.yearsExperience) || 5,
        phone: d.phone || d.mobileNumber || null,
        email: d.email || null,
        specialization: d.specialization || 'Residential & Commercial',
        reraNumber: d.reraNumber || null,
        state: d.state || 'Andhra Pradesh',
        city: d.city || 'Guntur',
        status: d.status || 'Active',
      },
    });
    return res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

app.put('/api/dealers/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const d = req.body;
    const updateData = {};
    if (d.companyName !== undefined || d.fullName !== undefined) updateData.companyName = d.companyName || d.fullName;
    if (d.logo !== undefined) updateData.logo = d.logo;
    if (d.photo !== undefined) updateData.photo = d.photo;
    if (d.rating !== undefined) updateData.rating = Number(d.rating);
    if (d.verified !== undefined) updateData.verified = Boolean(d.verified);
    if (d.yearsExperience !== undefined) updateData.yearsExperience = Number(d.yearsExperience);
    if (d.phone !== undefined || d.mobileNumber !== undefined) updateData.phone = d.phone || d.mobileNumber;
    if (d.email !== undefined) updateData.email = d.email;
    if (d.specialization !== undefined) updateData.specialization = d.specialization;
    if (d.reraNumber !== undefined) updateData.reraNumber = d.reraNumber;
    if (d.state !== undefined) updateData.state = d.state;
    if (d.city !== undefined) updateData.city = d.city;
    if (d.status !== undefined) updateData.status = d.status;

    const updated = await prisma.broker.update({ where: { id }, data: updateData });
    return res.json(updated);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/dealers/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.broker.deleteMany({ where: { id } });
    return res.json({ success: true, id });
  } catch (err) {
    next(err);
  }
});

// ── SHOWCASE VIDEOS ENDPOINTS ─────────────────────────────────────────────────
app.get('/api/showcase-videos', async (req, res) => {
  try {
    const videos = await prisma.showcaseVideo.findMany({ orderBy: { displayOrder: 'asc' } }).catch(() => []);
    return res.json(videos || []);
  } catch (err) {
    return res.json([]);
  }
});

app.post('/api/showcase-videos', async (req, res, next) => {
  try {
    const v = req.body;
    const created = await prisma.showcaseVideo.create({
      data: {
        id: v.id || `sv-pg-${Date.now()}`,
        videoUrl: v.videoUrl,
        thumbnailUrl: v.thumbnailUrl || null,
        title: v.title || 'Untitled Video',
        linkedCategory: v.linkedCategory || 'Property',
        linkedId: v.linkedId || null,
        displayOrder: Number(v.displayOrder) || 1,
        status: v.status || 'Active',
        tags: Array.isArray(v.tags) ? v.tags : [],
        createdDate: v.createdDate || new Date().toLocaleDateString(),
      },
    });
    return res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

app.put('/api/showcase-videos/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const v = req.body;
    const updateData = {};
    if (v.videoUrl !== undefined) updateData.videoUrl = v.videoUrl;
    if (v.thumbnailUrl !== undefined) updateData.thumbnailUrl = v.thumbnailUrl;
    if (v.title !== undefined) updateData.title = v.title;
    if (v.linkedCategory !== undefined) updateData.linkedCategory = v.linkedCategory;
    if (v.linkedId !== undefined) updateData.linkedId = v.linkedId;
    if (v.displayOrder !== undefined) updateData.displayOrder = Number(v.displayOrder);
    if (v.status !== undefined) updateData.status = v.status;
    if (v.tags !== undefined) updateData.tags = Array.isArray(v.tags) ? v.tags : [];
    const updated = await prisma.showcaseVideo.update({ where: { id }, data: updateData });
    return res.json(updated);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/showcase-videos/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.showcaseVideo.deleteMany({ where: { id } });
    return res.json({ success: true, id });
  } catch (err) {
    next(err);
  }
});

// ── ENQUIRIES ENDPOINTS ───────────────────────────────────────────────────────
app.get('/api/enquiries', async (req, res) => {
  try {
    const enquiries = await prisma.enquiry.findMany({ orderBy: { createdAt: 'desc' } }).catch(() => []);
    return res.json(enquiries || []);
  } catch (err) {
    return res.json([]);
  }
});

app.post('/api/enquiries', async (req, res, next) => {
  try {
    const newEnquiry = { id: req.body.id || `enq-pg-${Date.now()}`, date: new Date().toLocaleDateString(), ...req.body };
    const created = await prisma.enquiry.create({ data: newEnquiry });
    return res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

app.put('/api/enquiries/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await prisma.enquiry.update({ where: { id }, data: req.body });
    return res.json(updated);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/enquiries/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.enquiry.deleteMany({ where: { id } });
    return res.json({ success: true, id });
  } catch (err) {
    next(err);
  }
});

// ── SETTINGS ENDPOINTS ────────────────────────────────────────────────────────
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: 'default' } }).catch(() => null);
    return res.json(settings || {});
  } catch (err) {
    return res.json({});
  }
});

app.put('/api/settings', async (req, res, next) => {
  try {
    const settings = await prisma.siteSettings.upsert({
      where: { id: 'default' },
      update: req.body,
      create: { id: 'default', ...req.body },
    });
    return res.json(settings);
  } catch (err) {
    next(err);
  }
});

// ── STUB ENDPOINTS FOR UNIMPLEMENTED ADMIN ROUTES ───────────────────────────
// ── STUB ENDPOINTS FOR UNIMPLEMENTED ADMIN ROUTES ───────────────────────────
// ── TEAM MEMBERS ENDPOINTS ──────────────────────────────────────────────────
app.get('/api/team-members', async (req, res) => {
  try {
    const data = await prisma.teamMember.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json(data || []);
  } catch (err) { return res.json([]); }
});

app.post('/api/team-members', async (req, res, next) => {
  try {
    const data = { id: req.body.id || `tm-${Date.now()}`, ...req.body };
    const created = await prisma.teamMember.create({ data });
    return res.status(201).json(created);
  } catch (err) { next(err); }
});

app.put('/api/team-members/:id', async (req, res, next) => {
  try {
    const updated = await prisma.teamMember.update({ where: { id: req.params.id }, data: req.body });
    return res.json(updated);
  } catch (err) { next(err); }
});

app.delete('/api/team-members/:id', async (req, res, next) => {
  try {
    await prisma.teamMember.deleteMany({ where: { id: req.params.id } });
    return res.json({ success: true, id: req.params.id });
  } catch (err) { next(err); }
});

// ── ROLES ENDPOINTS ─────────────────────────────────────────────────────────
app.get('/api/roles', async (req, res) => {
  try {
    const data = await prisma.customRole.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json(data || []);
  } catch (err) { return res.json([]); }
});

app.post('/api/roles', async (req, res, next) => {
  try {
    const { id, name, permissions } = req.body;
    const created = await prisma.customRole.create({
      data: {
        id: id || `role-${Date.now()}`,
        name: String(name || 'Custom Role'),
        permissions: Array.isArray(permissions) ? permissions : [],
      },
    });
    return res.status(201).json(created);
  } catch (err) { next(err); }
});

app.put('/api/roles/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = {};
    if (req.body.name !== undefined) updateData.name = String(req.body.name);
    if (req.body.permissions !== undefined && Array.isArray(req.body.permissions)) {
      updateData.permissions = req.body.permissions;
    }
    const updated = await prisma.customRole.update({ where: { id }, data: updateData });
    return res.json(updated);
  } catch (err) { next(err); }
});

app.delete('/api/roles/:id', async (req, res, next) => {
  try {
    await prisma.customRole.deleteMany({ where: { id: req.params.id } });
    return res.json({ success: true, id: req.params.id });
  } catch (err) { next(err); }
});

// ── EMPLOYEES ENDPOINTS ─────────────────────────────────────────────────────
app.get('/api/employees', async (req, res) => {
  try {
    const data = await prisma.employeeUser.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json(data || []);
  } catch (err) { return res.json([]); }
});

app.post('/api/employees', async (req, res, next) => {
  try {
    const d = req.body;
    const created = await prisma.employeeUser.create({
      data: {
        id: d.id || `emp-${Date.now()}`,
        fullName: String(d.fullName || d.name || 'Employee User'),
        email: String(d.email || `emp_${Date.now()}@nexopp.com`),
        password: String(d.password || 'password123'),
        role: String(d.role || 'Property Editor'),
        status: String(d.status || 'Active'),
        customPermissions: Array.isArray(d.customPermissions) ? d.customPermissions : [],
      },
    });
    return res.status(201).json(created);
  } catch (err) { next(err); }
});

app.put('/api/employees/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const d = req.body;
    const updateData = {};
    if (d.fullName !== undefined || d.name !== undefined) updateData.fullName = String(d.fullName || d.name);
    if (d.email !== undefined) updateData.email = String(d.email);
    if (d.password !== undefined) updateData.password = String(d.password);
    if (d.role !== undefined) updateData.role = String(d.role);
    if (d.status !== undefined) updateData.status = String(d.status);
    if (d.customPermissions !== undefined && Array.isArray(d.customPermissions)) {
      updateData.customPermissions = d.customPermissions;
    }
    const updated = await prisma.employeeUser.update({ where: { id }, data: updateData });
    return res.json(updated);
  } catch (err) { next(err); }
});

app.delete('/api/employees/:id', async (req, res, next) => {
  try {
    await prisma.employeeUser.deleteMany({ where: { id: req.params.id } });
    return res.json({ success: true, id: req.params.id });
  } catch (err) { next(err); }
});

// ── DEMAND REGIONS ENDPOINTS ────────────────────────────────────────────────
app.get('/api/demand-regions', async (req, res) => {
  try {
    const data = await prisma.demandRegion.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json(data || []);
  } catch (err) { return res.json([]); }
});

app.post('/api/demand-regions', async (req, res, next) => {
  try {
    const data = { id: req.body.id || `dr-${Date.now()}`, ...req.body };
    const created = await prisma.demandRegion.create({ data });
    return res.status(201).json(created);
  } catch (err) { next(err); }
});

app.put('/api/demand-regions/:id', async (req, res, next) => {
  try {
    const updated = await prisma.demandRegion.update({ where: { id: req.params.id }, data: req.body });
    return res.json(updated);
  } catch (err) { next(err); }
});

app.delete('/api/demand-regions/:id', async (req, res, next) => {
  try {
    await prisma.demandRegion.deleteMany({ where: { id: req.params.id } });
    return res.json({ success: true, id: req.params.id });
  } catch (err) { next(err); }
});

// ── FRANCHISE ENQUIRIES ENDPOINTS ───────────────────────────────────────────
app.get('/api/franchise-enquiries', async (req, res) => {
  try {
    const data = await prisma.franchiseEnquiry.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json(data || []);
  } catch (err) { return res.json([]); }
});

app.post('/api/franchise-enquiries', async (req, res, next) => {
  try {
    const data = { id: req.body.id || `fenq-${Date.now()}`, ...req.body };
    const created = await prisma.franchiseEnquiry.create({ data });
    return res.status(201).json(created);
  } catch (err) { next(err); }
});

app.put('/api/franchise-enquiries/:id', async (req, res, next) => {
  try {
    const updated = await prisma.franchiseEnquiry.update({ where: { id: req.params.id }, data: req.body });
    return res.json(updated);
  } catch (err) { next(err); }
});

app.delete('/api/franchise-enquiries/:id', async (req, res, next) => {
  try {
    await prisma.franchiseEnquiry.deleteMany({ where: { id: req.params.id } });
    return res.json({ success: true, id: req.params.id });
  } catch (err) { next(err); }
});

// ── SHOWCASE SETTINGS ENDPOINTS ─────────────────────────────────────────────
app.get('/api/showcase-settings', async (req, res) => {
  try {
    const data = await prisma.showcaseSettings.findUnique({ where: { id: 'default' } });
    return res.json(data || { maxVideoSizeMB: 200, maxVideoDurationSec: 60, defaultPlaybackDurationSec: 10 });
  } catch (err) { return res.json({ maxVideoSizeMB: 200, maxVideoDurationSec: 60, defaultPlaybackDurationSec: 10 }); }
});

app.put('/api/showcase-settings', async (req, res, next) => {
  try {
    const settings = await prisma.showcaseSettings.upsert({
      where: { id: 'default' },
      update: req.body,
      create: { id: 'default', ...req.body },
    });
    return res.json(settings);
  } catch (err) { next(err); }
});

app.put('/api/showcase-settings', async (req, res, next) => {
  try {
    const settings = await prisma.showcaseSettings.upsert({
      where: { id: 'default' },
      update: req.body,
      create: { id: 'default', ...req.body },
    });
    return res.json(settings);
  } catch (err) { next(err); }
});

// ── HEALTH CHECK ENDPOINT ──────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'production',
    database: 'postgresql_prisma_active',
    imageOptimization: 'sharp_webp_active',
    securityMiddlewares: ['helmet', 'rateLimit', 'compression', 'hpp'],
    timestamp: new Date().toISOString(),
  });
});

// ── CENTRALIZED ERROR HANDLING MIDDLEWARE ─────────────────────────────────────
app.use((err, req, res, next) => {
  logger.error({ err: err.message, stack: err.stack }, 'Unhandled application error');
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
});

// ── GLOBAL PROCESS CRASH PROTECTION ──────────────────────────────────────────
process.on('uncaughtException', (err) => {
  logger.error({ err: err.message, stack: err.stack }, 'CRITICAL: Caught uncaughtException to prevent process crash');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason, promise }, 'CRITICAL: Caught unhandledRejection to prevent process crash');
});

app.listen(PORT, () => {
  logger.info(`[NEXOPP Enterprise API] Server running on port ${PORT} (${process.env.NODE_ENV || 'production'})`);
});
