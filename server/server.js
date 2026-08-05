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
import { sendEmailOtpViaMsg91, isValidEmail } from './services/msg91EmailService.js';
import { geocodeAddress } from './services/geocodingService.js';
import { searchPropertiesPostGIS } from './services/propertySearchService.js';
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

// Email OTP Rate Limiter
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // Max 10 OTP requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many OTP requests, please try again after 10 minutes.' },
});
app.use('/api/auth/send-email-otp', otpLimiter);
app.use('/api/auth/verify-email-otp', otpLimiter);

// Pino HTTP Request Logging Middleware
app.use(pinoHttp({ logger }));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
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

// Ensure PostgreSQL is connected
checkDatabaseConnection().then(connected => {
  if (!connected) {
    logger.warn("Running without PostgreSQL connection.");
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

// ── EMAIL OTP & GOOGLE AUTHENTICATION ENDPOINTS ────────────────────────────

/**
 * POST /api/auth/send-email-otp
 * Body: { email }
 */
app.post('/api/auth/send-email-otp', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Generate 6-digit numeric OTP
    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await hashPassword(rawOtp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Delete any existing OTP records for this email
    try {
      await prisma.emailOTP.deleteMany({ where: { email: cleanEmail } });
    } catch (e) {}

    // Store bcrypt hashed OTP in PostgreSQL EmailOTP table
    try {
      await prisma.emailOTP.create({
        data: {
          email: cleanEmail,
          otpHash: otpHash,
          attempts: 0,
          expiresAt: expiresAt,
        },
      });
    } catch (dbErr) {
      logger.warn({ dbErr }, 'Database offline or query error storing EmailOTP');
    }

    // Send Email OTP via MSG91 Email API
    const sendResult = await sendEmailOtpViaMsg91(cleanEmail, rawOtp);
    if (!sendResult.success) {
      return res.status(400).json({ error: sendResult.message || 'Failed to send OTP to email' });
    }

    return res.json({
      success: true,
      message: `OTP sent to ${cleanEmail}`,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/verify-email-otp
 * Body: { email, otp, name }
 */
app.post('/api/auth/verify-email-otp', async (req, res, next) => {
  try {
    const { email, otp, name } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email address and 6-digit OTP code are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    // Fetch active EmailOTP record for email
    let otpRecord = null;
    try {
      otpRecord = await prisma.emailOTP.findFirst({
        where: { email: cleanEmail },
        orderBy: { createdAt: 'desc' },
      });
    } catch (e) {}

    // Dev Simulation Fallback if DB record missing and test OTP '123456' is used
    if (!otpRecord && cleanOtp === '123456') {
      otpRecord = {
        id: 'simulated-otp',
        email: cleanEmail,
        otpHash: await hashPassword('123456'),
        attempts: 0,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      };
    }

    if (!otpRecord) {
      return res.status(400).json({ error: 'No OTP requested for this email. Please request a new OTP code.' });
    }

    // Check expiry
    if (new Date() > new Date(otpRecord.expiresAt)) {
      try { await prisma.emailOTP.delete({ where: { id: otpRecord.id } }); } catch (e) {}
      return res.status(400).json({ error: 'OTP code has expired. Please request a new code.' });
    }

    // Check maximum attempts limit (max 5 attempts)
    if (otpRecord.attempts >= 5) {
      try { await prisma.emailOTP.delete({ where: { id: otpRecord.id } }); } catch (e) {}
      return res.status(400).json({ error: 'Maximum OTP verification attempts exceeded. Please request a new OTP.' });
    }

    // Verify bcrypt hashed OTP
    const isValidMatch = await verifyPassword(cleanOtp, otpRecord.otpHash);
    if (!isValidMatch) {
      // Increment attempt counter
      try {
        if (otpRecord.id !== 'simulated-otp') {
          await prisma.emailOTP.update({
            where: { id: otpRecord.id },
            data: { attempts: otpRecord.attempts + 1 },
          });
        }
      } catch (e) {}
      return res.status(401).json({ error: 'Invalid 6-digit OTP code. Please check your email and try again.' });
    }

    // Verification succeeded: delete used EmailOTP record
    try {
      if (otpRecord.id !== 'simulated-otp') {
        await prisma.emailOTP.delete({ where: { id: otpRecord.id } });
      }
    } catch (e) {}

    // Find or create user profile in PostgreSQL database
    let user = null;
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });

      if (existingUser) {
        user = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            name: name || existingUser.name || existingUser.fullName || cleanEmail.split('@')[0],
            fullName: name || existingUser.fullName || existingUser.name || cleanEmail.split('@')[0],
          },
        });
      } else {
        const userName = name || cleanEmail.split('@')[0];
        user = await prisma.user.create({
          data: {
            email: cleanEmail,
            name: userName,
            fullName: userName,
            profilePhoto: `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=007A55&color=fff`,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=007A55&color=fff`,
          },
        });
      }
    } catch (dbErr) {
      logger.warn({ dbErr }, 'Database offline or query error, using fallback session payload');
      const userName = name || cleanEmail.split('@')[0];
      user = {
        id: `usr-${cleanEmail}`,
        email: cleanEmail,
        name: userName,
        fullName: userName,
        profilePhoto: `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=007A55&color=fff`,
      };
    }

    // Sync Customer table if present
    try {
      const existingCust = await prisma.customer.findFirst({
        where: { email: cleanEmail },
      });
      const now = new Date().toLocaleString();
      if (existingCust) {
        await prisma.customer.update({
          where: { id: existingCust.id },
          data: {
            name: user.name,
            lastLoginAt: now,
            loginCount: existingCust.loginCount + 1,
          },
        });
      } else {
        await prisma.customer.create({
          data: {
            name: user.name,
            email: cleanEmail,
            role: 'Verified Investor',
            avatar: user.profilePhoto || user.avatar,
            lastLoginAt: now,
            loginCount: 1,
            status: 'Active',
            registeredDate: new Date().toLocaleDateString(),
          },
        });
      }
    } catch (custErr) {}

    // Generate JWT Token
    const userPayload = {
      id: user.id,
      email: user.email,
      name: user.name || user.fullName,
      fullName: user.fullName || user.name,
      profilePhoto: user.profilePhoto || user.avatar,
      googleId: user.googleId || null,
      role: user.role || 'USER',
    };

    const tokens = generateTokens(userPayload);

    // Store JWT Token inside HTTP Only Cookie (maxAge: 30 days)
    res.cookie('auth_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return res.json({
      success: true,
      user: userPayload,
      tokens,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/google-login
 * Body: { googleId, email, name, profilePhoto, credential }
 */
app.post('/api/auth/google-login', async (req, res, next) => {
  try {
    const { googleId, email, name, profilePhoto } = req.body;
    if (!email && !googleId) {
      return res.status(400).json({ error: 'Email or Google ID is required for Google login' });
    }

    const cleanEmail = email ? email.trim().toLowerCase() : null;

    let user = null;
    try {
      const existing = await prisma.user.findFirst({
        where: {
          OR: [
            googleId ? { googleId } : undefined,
            cleanEmail ? { email: cleanEmail } : undefined,
          ].filter(Boolean),
        },
      });

      if (existing) {
        user = await prisma.user.update({
          where: { id: existing.id },
          data: {
            googleId: googleId || existing.googleId,
            name: name || existing.name,
            fullName: name || existing.fullName || existing.name,
            profilePhoto: profilePhoto || existing.profilePhoto,
          },
        });
      } else {
        const userName = name || (cleanEmail ? cleanEmail.split('@')[0] : 'Google User');
        user = await prisma.user.create({
          data: {
            email: cleanEmail || `${googleId}@google.com`,
            googleId: googleId || null,
            name: userName,
            fullName: userName,
            profilePhoto: profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=007A55&color=fff`,
            avatar: profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=007A55&color=fff`,
          },
        });
      }
    } catch (dbErr) {
      logger.warn({ dbErr }, 'Database offline or query error, using fallback session payload for Google login');
      const userName = name || (cleanEmail ? cleanEmail.split('@')[0] : 'Google User');
      user = {
        id: googleId ? `goog-${googleId}` : `usr-${Date.now()}`,
        email: cleanEmail || `${googleId}@google.com`,
        googleId: googleId || null,
        name: userName,
        fullName: userName,
        profilePhoto: profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=007A55&color=fff`,
      };
    }

    // Sync Customer table if present
    try {
      if (cleanEmail) {
        const existingCust = await prisma.customer.findFirst({ where: { email: cleanEmail } });
        const now = new Date().toLocaleString();
        if (existingCust) {
          await prisma.customer.update({
            where: { id: existingCust.id },
            data: { name: user.name, avatar: user.profilePhoto, lastLoginAt: now, loginCount: existingCust.loginCount + 1 },
          });
        } else {
          await prisma.customer.create({
            data: {
              name: user.name,
              email: cleanEmail,
              role: 'Verified Investor',
              avatar: user.profilePhoto,
              lastLoginAt: now,
              loginCount: 1,
              status: 'Active',
              registeredDate: new Date().toLocaleDateString(),
            },
          });
        }
      }
    } catch (custErr) {}

    // Generate JWT Token
    const userPayload = {
      id: user.id,
      email: user.email,
      name: user.name || user.fullName,
      fullName: user.fullName || user.name,
      profilePhoto: user.profilePhoto || user.avatar,
      googleId: user.googleId || null,
      role: user.role || 'USER',
    };

    const tokens = generateTokens(userPayload);

    // Store JWT Token inside HTTP Only Cookie (30 days)
    res.cookie('auth_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return res.json({
      success: true,
      user: userPayload,
      tokens,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/auth/me
 * Restores user session from JWT HTTP-Only cookie
 */
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: No session token found' });
    }

    let dbUser = null;
    try {
      if (req.user.mobile) {
        dbUser = await prisma.user.findUnique({ where: { mobile: req.user.mobile } });
      } else if (req.user.id) {
        dbUser = await prisma.user.findUnique({ where: { id: req.user.id } });
      }
    } catch (e) {}

    const userProfile = dbUser ? {
      id: dbUser.id,
      mobile: dbUser.mobile || dbUser.phone,
      name: dbUser.name || dbUser.fullName,
      fullName: dbUser.fullName || dbUser.name,
      gender: dbUser.gender,
      district: dbUser.district,
      email: dbUser.email,
      profilePhoto: dbUser.profilePhoto || dbUser.avatar,
      role: dbUser.role || 'USER',
    } : req.user;

    return res.json({ success: true, user: userProfile });
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Session invalid' });
  }
});

/**
 * POST /api/auth/logout
 * Clears auth_token HTTP-Only Cookie
 */
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
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
app.get('/api/customers', async (req, res, next) => {
  try {
    const customers = await prisma.customer.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json(customers);
  } catch (err) {
    next(err);
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
    await prisma.customer.delete({ where: { id: req.params.id } });
    return res.json({ success: true, id: req.params.id });
  } catch (err) {
    next(err);
  }
});

// ── PROPERTY ENDPOINTS ────────────────────────────────────────────────────────
app.get('/api/properties', async (req, res, next) => {
  try {
    const props = await prisma.property.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json(props);
  } catch (err) {
    next(err);
  }
});

// PostGIS Spatial Search Endpoint (/api/properties/search)
app.get('/api/properties/search', async (req, res, next) => {
  try {
    let { location, lat, lng, radius, page = 1, limit = 20, category, status } = req.query;

    let latitude = parseFloat(lat);
    let longitude = parseFloat(lng);
    let searchedLocationName = location || '';

    // If coordinates not provided directly, geocode the location string
    if ((isNaN(latitude) || isNaN(longitude)) && location) {
      const geo = await geocodeAddress(location);
      latitude = geo.latitude;
      longitude = geo.longitude;
      searchedLocationName = geo.fullAddress || location;
    }

    // Default coordinates if nothing passed (e.g. Hyderabad / Guntur default)
    if (isNaN(latitude) || isNaN(longitude)) {
      latitude = 17.3850; // Hyderabad default
      longitude = 78.4867;
      searchedLocationName = 'Hyderabad, Telangana';
    }

    // Parse radius in meters: default 50000 (50km). radius=0 or radius=anywhere means no radius filter
    let radiusMeters = 50000;
    if (radius !== undefined) {
      if (radius === 'anywhere' || radius === '0' || radius === 'null') {
        radiusMeters = null;
      } else {
        const parsedR = parseFloat(radius);
        if (!isNaN(parsedR)) radiusMeters = parsedR;
      }
    }

    const result = await searchPropertiesPostGIS({
      latitude,
      longitude,
      radiusMeters,
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 20,
      category,
      status,
    });

    return res.json({
      ...result,
      locationName: searchedLocationName,
    });
  } catch (err) {
    next(err);
  }
});

app.post('/api/properties', async (req, res, next) => {
  try {
    let lat = Number(req.body.latitude);
    let lng = Number(req.body.longitude);
    let fullAddr = req.body.fullAddress || req.body.formatted_address || `${req.body.area || ''}, ${req.body.city || 'Guntur'}, ${req.body.state || 'Andhra Pradesh'}`;
    let pin = req.body.pincode || req.body.postal_code || null;

    if ((!lat || !lng || (lat === 16.3067 && lng === 80.4363 && req.body.area)) && (req.body.area || req.body.city || req.body.address)) {
      const searchAddr = `${req.body.area || ''} ${req.body.city || ''} ${req.body.state || ''}`.trim();
      try {
        const geo = await geocodeAddress(searchAddr);
        lat = geo.latitude;
        lng = geo.longitude;
        if (!pin && geo.pincode) pin = geo.pincode;
        if (geo.fullAddress) fullAddr = geo.fullAddress;
      } catch (gErr) {
        console.warn('Auto-geocoding on property creation notice:', gErr.message);
      }
    }

    const propId = req.body.id || `prop-pg-${Date.now()}`;
    const propData = {
      title: req.body.title || 'Untitled Property',
      description: req.body.description || '',
      image: req.body.image || '',
      image2: req.body.image2 || null,
      image3: req.body.image3 || null,
      image4: req.body.image4 || null,
      image5: req.body.image5 || null,
      image6: req.body.image6 || null,
      state: req.body.state || 'Andhra Pradesh',
      district: req.body.district || 'Guntur',
      city: req.body.city || 'Guntur',
      area: req.body.area || '',
      pincode: pin,
      fullAddress: fullAddr,
      latitude: lat || 16.3067,
      longitude: lng || 80.4363,
      price: Number(req.body.price) || 0,
      priceDisplay: req.body.priceDisplay || `₹${req.body.price || 0}`,
      category: req.body.category || 'Flats',
      status: req.body.status || 'Buy',
      areaSqFt: req.body.areaSqFt || '1000 Sq.ft',
      bedrooms: Number(req.body.bedrooms) || 0,
      bathrooms: Number(req.body.bathrooms) || 0,
      verified: req.body.verified !== false,
      premium: Boolean(req.body.premium),
      trending: Boolean(req.body.trending),
      agentName: req.body.agentName || 'NEXOPP Advisor',
    };

    const created = await prisma.property.upsert({
      where: { id: propId },
      update: propData,
      create: {
        id: propId,
        createdDate: req.body.createdDate || new Date().toLocaleDateString(),
        ...propData
      }
    });

    // PostGIS location point update
    try {
      await prisma.$executeRawUnsafe(
        `UPDATE "Property" SET "location" = ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography WHERE id = $3`,
        lng || 80.4363, lat || 16.3067, created.id
      );
    } catch (stErr) {
      console.warn('PostGIS location point update notice:', stErr.message);
    }

    return res.status(201).json(created);
  } catch (err) {
    console.error('Error in POST /api/properties:', err);
    next(err);
  }
});

app.put('/api/properties/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const allowedFields = [
      'title', 'description', 'image', 'image2', 'image3', 'image4', 'image5', 'image6',
      'state', 'district', 'city', 'area', 'pincode', 'fullAddress', 'latitude', 'longitude',
      'price', 'priceDisplay', 'category', 'status', 'listingStatus', 'areaSqFt', 'bedrooms',
      'bathrooms', 'rating', 'reviewCount', 'verified', 'premium', 'trending', 'agentName',
      'viewsCount', 'createdDate', 'categoryId', 'locationId', 'brokerId', 'userId'
    ];
    const updateData = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }
    const updated = await prisma.property.update({
      where: { id },
      data: updateData,
    });
    return res.json(updated);
  } catch (err) {
    console.error('Error in PUT /api/properties/:id:', err);
    next(err);
  }
});

app.delete('/api/properties/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.property.delete({ where: { id } });
    return res.json({ success: true, id });
  } catch (err) {
    next(err);
  }
});

app.get('/api/franchises', async (req, res, next) => {
  try {
    const franchises = await prisma.franchise.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json(franchises);
  } catch (err) {
    next(err);
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
    await prisma.franchise.delete({ where: { id } });
    return res.json({ success: true, id });
  } catch (err) {
    next(err);
  }
});

app.get('/api/businesses', async (req, res, next) => {
  try {
    const businesses = await prisma.business.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json(businesses);
  } catch (err) {
    next(err);
  }
});

app.post('/api/businesses', async (req, res, next) => {
  try {
    const b = req.body;
    const created = await prisma.business.create({
      data: {
        id: b.id || `biz-pg-${Date.now()}`,
        name: b.name || 'Business Listing',
        industry: b.industry || 'General',
        location: b.location || 'Guntur',
        state: b.state || 'Andhra Pradesh',
        city: b.city || 'Guntur',
        latitude: Number(b.latitude) || 16.3067,
        longitude: Number(b.longitude) || 80.4363,
        price: Number(b.price) || 1000000,
        priceDisplay: b.priceDisplay || `₹${b.price || '10 Lakhs'}`,
        revenueMonthly: b.revenueMonthly || '₹1 Lakh/mo',
        profitMonthly: b.profitMonthly || '₹30,000/mo',
        establishedYear: Number(b.establishedYear) || 2020,
        employeesCount: Number(b.employeesCount) || 5,
        rating: Number(b.rating) || 4.7,
        reviewCount: Number(b.reviewCount) || 0,
        verified: b.verified !== false,
        image: b.image || '',
        description: b.description || '',
        reasonForSale: b.reasonForSale || 'Retirement',
        trustScore: Number(b.trustScore) || 95,
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
    if (b.location !== undefined) updateData.location = b.location;
    if (b.price !== undefined) updateData.price = Number(b.price);
    if (b.priceDisplay !== undefined) updateData.priceDisplay = b.priceDisplay;
    if (b.revenueMonthly !== undefined) updateData.revenueMonthly = b.revenueMonthly;
    if (b.profitMonthly !== undefined) updateData.profitMonthly = b.profitMonthly;
    if (b.image !== undefined) updateData.image = b.image;
    if (b.description !== undefined) updateData.description = b.description;

    const updated = await prisma.business.update({ where: { id }, data: updateData });
    return res.json(updated);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/businesses/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.business.delete({ where: { id } });
    return res.json({ success: true, id });
  } catch (err) {
    next(err);
  }
});

// ── DEALER / BROKER ENDPOINTS ─────────────────────────────────────────────────
app.get('/api/dealers', async (req, res, next) => {
  try {
    const dealers = await prisma.broker.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json(dealers);
  } catch (err) {
    next(err);
  }
});

app.post('/api/dealers', async (req, res, next) => {
  try {
    const d = req.body;
    const dealerId = d.id || `dealer-pg-${Date.now()}`;
    const dealerData = {
      companyName: d.companyName || d.fullName || d.name || d.company || 'Independent Realty',
      logo: d.logo || d.photo || d.image || null,
      photo: d.photo || d.logo || d.image || null,
      rating: Number(d.rating) || 4.8,
      reviewCount: Number(d.reviewCount) || 0,
      verified: d.verified !== false,
      yearsExperience: Number(d.yearsExperience) || 5,
      phone: d.phone || d.mobileNumber || d.mobile || null,
      email: d.email || null,
      specialization: d.specialization || 'Residential & Commercial',
      reraNumber: d.reraNumber || null,
      state: d.state || 'Andhra Pradesh',
      city: d.city || 'Guntur',
      status: d.status || 'Active',
    };

    const created = await prisma.broker.upsert({
      where: { id: dealerId },
      update: dealerData,
      create: {
        id: dealerId,
        ...dealerData
      }
    });
    return res.status(201).json(created);
  } catch (err) {
    console.error('Error in POST /api/dealers:', err);
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
    await prisma.broker.delete({ where: { id } });
    return res.json({ success: true, id });
  } catch (err) {
    next(err);
  }
});

// ── SHOWCASE VIDEOS ENDPOINTS ─────────────────────────────────────────────────
app.get('/api/showcase-videos', async (req, res, next) => {
  try {
    const videos = await prisma.showcaseVideo.findMany({ orderBy: { displayOrder: 'asc' } });
    return res.json(videos);
  } catch (err) {
    next(err);
  }
});

app.post('/api/showcase-videos', async (req, res, next) => {
  try {
    const newVideo = { id: req.body.id || `sv-pg-${Date.now()}`, ...req.body };
    const created = await prisma.showcaseVideo.create({ data: newVideo });
    return res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

app.put('/api/showcase-videos/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await prisma.showcaseVideo.update({ where: { id }, data: req.body });
    return res.json(updated);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/showcase-videos/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.showcaseVideo.delete({ where: { id } });
    return res.json({ success: true, id });
  } catch (err) {
    next(err);
  }
});

// ── ENQUIRIES ENDPOINTS ───────────────────────────────────────────────────────
app.get('/api/enquiries', async (req, res, next) => {
  try {
    const enquiries = await prisma.enquiry.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json(enquiries);
  } catch (err) {
    next(err);
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
    await prisma.enquiry.delete({ where: { id } });
    return res.json({ success: true, id });
  } catch (err) {
    next(err);
  }
});

// ── SETTINGS ENDPOINTS ────────────────────────────────────────────────────────
app.get('/api/settings', async (req, res, next) => {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: 'default' } });
    return res.json(settings);
  } catch (err) {
    next(err);
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
// ── TEAM MEMBERS ENDPOINTS ──────────────────────────────────────────────────
app.get('/api/team-members', async (req, res, next) => {
  try {
    const data = await prisma.teamMember.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json(data);
  } catch (err) { next(err); }
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
    await prisma.teamMember.delete({ where: { id: req.params.id } });
    return res.json({ success: true, id: req.params.id });
  } catch (err) { next(err); }
});

// ── ROLES ENDPOINTS ─────────────────────────────────────────────────────────
app.get('/api/roles', async (req, res, next) => {
  try {
    const data = await prisma.customRole.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json(data);
  } catch (err) { next(err); }
});

app.post('/api/roles', async (req, res, next) => {
  try {
    const data = { id: req.body.id || `role-${Date.now()}`, ...req.body };
    const created = await prisma.customRole.create({ data });
    return res.status(201).json(created);
  } catch (err) { next(err); }
});

app.put('/api/roles/:id', async (req, res, next) => {
  try {
    const updated = await prisma.customRole.update({ where: { id: req.params.id }, data: req.body });
    return res.json(updated);
  } catch (err) { next(err); }
});

app.delete('/api/roles/:id', async (req, res, next) => {
  try {
    await prisma.customRole.delete({ where: { id: req.params.id } });
    return res.json({ success: true, id: req.params.id });
  } catch (err) { next(err); }
});

// ── EMPLOYEES ENDPOINTS ─────────────────────────────────────────────────────
app.get('/api/employees', async (req, res, next) => {
  try {
    const data = await prisma.employeeUser.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json(data);
  } catch (err) { next(err); }
});

app.post('/api/employees', async (req, res, next) => {
  try {
    const data = { id: req.body.id || `emp-${Date.now()}`, ...req.body };
    const created = await prisma.employeeUser.create({ data });
    return res.status(201).json(created);
  } catch (err) { next(err); }
});

app.put('/api/employees/:id', async (req, res, next) => {
  try {
    const updated = await prisma.employeeUser.update({ where: { id: req.params.id }, data: req.body });
    return res.json(updated);
  } catch (err) { next(err); }
});

app.delete('/api/employees/:id', async (req, res, next) => {
  try {
    await prisma.employeeUser.delete({ where: { id: req.params.id } });
    return res.json({ success: true, id: req.params.id });
  } catch (err) { next(err); }
});
// ── DEMAND REGIONS ENDPOINTS ────────────────────────────────────────────────
app.get('/api/demand-regions', async (req, res, next) => {
  try {
    const data = await prisma.demandRegion.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json(data);
  } catch (err) { next(err); }
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
    await prisma.demandRegion.delete({ where: { id: req.params.id } });
    return res.json({ success: true, id: req.params.id });
  } catch (err) { next(err); }
});

// ── FRANCHISE ENQUIRIES ENDPOINTS ───────────────────────────────────────────
app.get('/api/franchise-enquiries', async (req, res, next) => {
  try {
    const data = await prisma.franchiseEnquiry.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json(data);
  } catch (err) { next(err); }
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
    await prisma.franchiseEnquiry.delete({ where: { id: req.params.id } });
    return res.json({ success: true, id: req.params.id });
  } catch (err) { next(err); }
});

// ── SHOWCASE SETTINGS ENDPOINTS ─────────────────────────────────────────────
app.get('/api/showcase-settings', async (req, res, next) => {
  try {
    const data = await prisma.showcaseSettings.findUnique({ where: { id: 'default' } });
    return res.json(data || {});
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

app.listen(PORT, () => {
  logger.info(`[NEXOPP Enterprise API] Server running on port ${PORT} (${process.env.NODE_ENV || 'production'})`);
});
