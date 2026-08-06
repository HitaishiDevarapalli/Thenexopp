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
      propertyValidationSchema.partial().parse(req.body);
    }
    const newProp = { id: req.body.id || `prop-pg-${Date.now()}`, createdDate: new Date().toLocaleDateString(), ...req.body };

    const created = await prisma.property.create({
      data: {
        id: newProp.id,
        title: newProp.title,
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
    const businesses = await prisma.business.findMany({ orderBy: { createdAt: 'desc' } }).catch(() => []);
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
    await prisma.business.deleteMany({ where: { id } });
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
