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

import { prisma, checkDatabaseConnection } from './db.js';
import { hashPassword, verifyPassword, generateTokens, authMiddleware, requireRole } from './auth.js';
import { optimizeAndSaveImage } from './imageProcessor.js';
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

// Pino HTTP Request Logging Middleware
app.use(pinoHttp({ logger }));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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

// ── JSON FILE PERSISTENCE FALLBACK ───────────────────────────────────────────
const DATA_FILE = path.join(__dirname, 'db_store.json');
let dbStore = {
  properties: [],
  franchises: [],
  businesses: [],
  dealers: [],
  enquiries: [],
  showcaseVideos: [],
  customers: [],
  settings: {},
  users: [],
  teamMembers: [],
  employees: [],
  roles: [],
  demandRegions: [],
  franchiseEnquiries: [],
};

if (fs.existsSync(DATA_FILE)) {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    dbStore = { ...dbStore, ...JSON.parse(raw) };
  } catch (err) {
    logger.error('Failed to load JSON data store file', err);
  }
}

const saveStore = () => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(dbStore, null, 2), 'utf-8');
  } catch (err) {
    logger.error('Failed to save JSON data store file', err);
  }
};

let isPostgresConnected = false;
checkDatabaseConnection().then(connected => {
  isPostgresConnected = connected;
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

// ── AUTHENTICATION ENDPOINTS ──────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res, next) => {
  try {
    const validated = userRegisterSchema.parse(req.body);

    if (isPostgresConnected) {
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
      return res.status(201).json({ success: true, user: { id: newUser.id, email: newUser.email, fullName: newUser.fullName, role: newUser.role }, tokens });
    }

    // Fallback handler
    const existing = dbStore.users.find((u) => u.email.toLowerCase() === validated.email.toLowerCase());
    if (existing) return res.status(400).json({ error: 'User with this email already exists' });

    const passwordHash = await hashPassword(validated.password);
    const newUser = {
      id: `usr-${Date.now()}`,
      email: validated.email,
      fullName: validated.fullName,
      passwordHash,
      role: validated.role || 'USER',
      createdAt: new Date().toISOString(),
    };
    dbStore.users.push(newUser);
    saveStore();

    const tokens = generateTokens(newUser);
    res.status(201).json({ success: true, user: { id: newUser.id, email: newUser.email, fullName: newUser.fullName, role: newUser.role }, tokens });
  } catch (err) {
    next(err);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const validated = userLoginSchema.parse(req.body);

    if (isPostgresConnected) {
      const user = await prisma.user.findUnique({ where: { email: validated.email.toLowerCase() } });
      if (!user) return res.status(401).json({ error: 'Invalid email or password' });

      const isMatch = await verifyPassword(validated.password, user.passwordHash);
      if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

      const tokens = generateTokens(user);
      return res.json({ success: true, user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role }, tokens });
    }

    // Fallback handler
    const user = dbStore.users.find((u) => u.email.toLowerCase() === validated.email.toLowerCase());
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const isMatch = await verifyPassword(validated.password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

    const tokens = generateTokens(user);
    res.json({ success: true, user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role }, tokens });
  } catch (err) {
    next(err);
  }
});

// ── CUSTOMERS ENDPOINTS ──────────────────────────────────────────────────────
app.get('/api/customers', async (req, res, next) => {
  try {
    if (isPostgresConnected) {
      const customers = await prisma.customer.findMany({ orderBy: { createdAt: 'desc' } });
      return res.json(customers);
    }
    res.json(dbStore.customers);
  } catch (err) {
    next(err);
  }
});

app.post('/api/customers', async (req, res, next) => {
  try {
    const { email, phone, name, gender, district, role, avatar } = req.body;
    const now = new Date().toLocaleString();

    if (isPostgresConnected) {
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
    }

    // Fallback handler
    const existingIndex = dbStore.customers.findIndex((c) => (phone && c.phone === phone) || (email && c.email === email));
    if (existingIndex >= 0) {
      const existing = dbStore.customers[existingIndex];
      const updated = {
        ...existing,
        name: name || existing.name,
        gender: gender || existing.gender,
        district: district || existing.district,
        role: role || existing.role,
        avatar: avatar || existing.avatar,
        lastLoginAt: now,
        loginCount: (existing.loginCount || 1) + 1,
      };
      dbStore.customers[existingIndex] = updated;
      saveStore();
      return res.json(updated);
    } else {
      const newCustomer = {
        id: `cust-pg-${Date.now()}`,
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
      };
      dbStore.customers = [newCustomer, ...dbStore.customers];
      saveStore();
      return res.status(201).json(newCustomer);
    }
  } catch (err) {
    next(err);
  }
});

app.delete('/api/customers/:id', async (req, res, next) => {
  try {
    if (isPostgresConnected) {
      await prisma.customer.delete({ where: { id: req.params.id } });
      return res.json({ success: true, id: req.params.id });
    }
    dbStore.customers = dbStore.customers.filter((c) => c.id !== req.params.id);
    saveStore();
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    next(err);
  }
});

// ── PROPERTY ENDPOINTS ────────────────────────────────────────────────────────
app.get('/api/properties', async (req, res, next) => {
  try {
    if (isPostgresConnected) {
      const props = await prisma.property.findMany({ orderBy: { createdAt: 'desc' } });
      return res.json(props);
    }
    res.json(dbStore.properties);
  } catch (err) {
    next(err);
  }
});

app.post('/api/properties', async (req, res, next) => {
  try {
    if (req.body.title && req.body.price) {
      propertyValidationSchema.partial().parse(req.body);
    }
    const newProp = { id: req.body.id || `prop-pg-${Date.now()}`, createdDate: new Date().toLocaleDateString(), ...req.body };

    if (isPostgresConnected) {
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
    }

    dbStore.properties = [newProp, ...dbStore.properties];
    saveStore();
    res.status(201).json(newProp);
  } catch (err) {
    next(err);
  }
});

app.put('/api/properties/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (isPostgresConnected) {
      const updated = await prisma.property.update({
        where: { id },
        data: req.body,
      });
      return res.json(updated);
    }
    dbStore.properties = dbStore.properties.map((p) => (p.id === id ? { ...p, ...req.body } : p));
    saveStore();
    res.json(dbStore.properties.find((p) => p.id === id) || req.body);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/properties/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (isPostgresConnected) {
      await prisma.property.delete({ where: { id } });
      return res.json({ success: true, id });
    }
    dbStore.properties = dbStore.properties.filter((p) => p.id !== id);
    saveStore();
    res.json({ success: true, id });
  } catch (err) {
    next(err);
  }
});

// ── FRANCHISE ENDPOINTS ───────────────────────────────────────────────────────
app.get('/api/franchises', async (req, res, next) => {
  try {
    if (isPostgresConnected) {
      const franchises = await prisma.franchise.findMany({ orderBy: { createdAt: 'desc' } });
      return res.json(franchises);
    }
    res.json(dbStore.franchises);
  } catch (err) {
    next(err);
  }
});

app.post('/api/franchises', async (req, res, next) => {
  try {
    const newFranchise = { id: req.body.id || `fran-pg-${Date.now()}`, ...req.body };
    if (isPostgresConnected) {
      const created = await prisma.franchise.create({ data: newFranchise });
      return res.status(201).json(created);
    }
    dbStore.franchises = [newFranchise, ...dbStore.franchises];
    saveStore();
    res.status(201).json(newFranchise);
  } catch (err) {
    next(err);
  }
});

app.put('/api/franchises/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (isPostgresConnected) {
      const updated = await prisma.franchise.update({ where: { id }, data: req.body });
      return res.json(updated);
    }
    dbStore.franchises = dbStore.franchises.map((f) => (f.id === id ? { ...f, ...req.body } : f));
    saveStore();
    res.json(dbStore.franchises.find((f) => f.id === id) || req.body);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/franchises/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (isPostgresConnected) {
      await prisma.franchise.delete({ where: { id } });
      return res.json({ success: true, id });
    }
    dbStore.franchises = dbStore.franchises.filter((f) => f.id !== id);
    saveStore();
    res.json({ success: true, id });
  } catch (err) {
    next(err);
  }
});

// ── BUSINESS ENDPOINTS ────────────────────────────────────────────────────────
app.get('/api/businesses', async (req, res, next) => {
  try {
    if (isPostgresConnected) {
      const businesses = await prisma.business.findMany({ orderBy: { createdAt: 'desc' } });
      return res.json(businesses);
    }
    res.json(dbStore.businesses);
  } catch (err) {
    next(err);
  }
});

app.post('/api/businesses', async (req, res, next) => {
  try {
    const newBiz = { id: req.body.id || `biz-pg-${Date.now()}`, ...req.body };
    if (isPostgresConnected) {
      const created = await prisma.business.create({ data: newBiz });
      return res.status(201).json(created);
    }
    dbStore.businesses = [newBiz, ...dbStore.businesses];
    saveStore();
    res.status(201).json(newBiz);
  } catch (err) {
    next(err);
  }
});

app.put('/api/businesses/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (isPostgresConnected) {
      const updated = await prisma.business.update({ where: { id }, data: req.body });
      return res.json(updated);
    }
    dbStore.businesses = dbStore.businesses.map((b) => (b.id === id ? { ...b, ...req.body } : b));
    saveStore();
    res.json(dbStore.businesses.find((b) => b.id === id) || req.body);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/businesses/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (isPostgresConnected) {
      await prisma.business.delete({ where: { id } });
      return res.json({ success: true, id });
    }
    dbStore.businesses = dbStore.businesses.filter((b) => b.id !== id);
    saveStore();
    res.json({ success: true, id });
  } catch (err) {
    next(err);
  }
});

// ── DEALER / BROKER ENDPOINTS ─────────────────────────────────────────────────
app.get('/api/dealers', async (req, res, next) => {
  try {
    if (isPostgresConnected) {
      const dealers = await prisma.broker.findMany({ orderBy: { createdAt: 'desc' } });
      return res.json(dealers);
    }
    res.json(dbStore.dealers);
  } catch (err) {
    next(err);
  }
});

app.post('/api/dealers', async (req, res, next) => {
  try {
    const newDealer = { id: req.body.id || `dealer-pg-${Date.now()}`, ...req.body };
    if (isPostgresConnected) {
      const created = await prisma.broker.create({ data: newDealer });
      return res.status(201).json(created);
    }
    dbStore.dealers = [newDealer, ...dbStore.dealers];
    saveStore();
    res.status(201).json(newDealer);
  } catch (err) {
    next(err);
  }
});

app.put('/api/dealers/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (isPostgresConnected) {
      const updated = await prisma.broker.update({ where: { id }, data: req.body });
      return res.json(updated);
    }
    dbStore.dealers = dbStore.dealers.map((d) => (d.id === id ? { ...d, ...req.body } : d));
    saveStore();
    res.json(dbStore.dealers.find((d) => d.id === id) || req.body);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/dealers/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (isPostgresConnected) {
      await prisma.broker.delete({ where: { id } });
      return res.json({ success: true, id });
    }
    dbStore.dealers = dbStore.dealers.filter((d) => d.id !== id);
    saveStore();
    res.json({ success: true, id });
  } catch (err) {
    next(err);
  }
});

// ── SHOWCASE VIDEOS ENDPOINTS ─────────────────────────────────────────────────
app.get('/api/showcase-videos', async (req, res, next) => {
  try {
    if (isPostgresConnected) {
      const videos = await prisma.showcaseVideo.findMany({ orderBy: { displayOrder: 'asc' } });
      return res.json(videos);
    }
    res.json(dbStore.showcaseVideos);
  } catch (err) {
    next(err);
  }
});

app.post('/api/showcase-videos', async (req, res, next) => {
  try {
    const newVideo = { id: req.body.id || `sv-pg-${Date.now()}`, ...req.body };
    if (isPostgresConnected) {
      const created = await prisma.showcaseVideo.create({ data: newVideo });
      return res.status(201).json(created);
    }
    dbStore.showcaseVideos = [newVideo, ...dbStore.showcaseVideos];
    saveStore();
    res.status(201).json(newVideo);
  } catch (err) {
    next(err);
  }
});

app.put('/api/showcase-videos/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (isPostgresConnected) {
      const updated = await prisma.showcaseVideo.update({ where: { id }, data: req.body });
      return res.json(updated);
    }
    dbStore.showcaseVideos = dbStore.showcaseVideos.map((v) => (v.id === id ? { ...v, ...req.body } : v));
    saveStore();
    res.json(dbStore.showcaseVideos.find((v) => v.id === id) || req.body);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/showcase-videos/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (isPostgresConnected) {
      await prisma.showcaseVideo.delete({ where: { id } });
      return res.json({ success: true, id });
    }
    dbStore.showcaseVideos = dbStore.showcaseVideos.filter((v) => v.id !== id);
    saveStore();
    res.json({ success: true, id });
  } catch (err) {
    next(err);
  }
});

// ── ENQUIRIES ENDPOINTS ───────────────────────────────────────────────────────
app.get('/api/enquiries', async (req, res, next) => {
  try {
    if (isPostgresConnected) {
      const enquiries = await prisma.enquiry.findMany({ orderBy: { createdAt: 'desc' } });
      return res.json(enquiries);
    }
    res.json(dbStore.enquiries);
  } catch (err) {
    next(err);
  }
});

app.post('/api/enquiries', async (req, res, next) => {
  try {
    const newEnquiry = { id: req.body.id || `enq-pg-${Date.now()}`, date: new Date().toLocaleDateString(), ...req.body };
    if (isPostgresConnected) {
      const created = await prisma.enquiry.create({ data: newEnquiry });
      return res.status(201).json(created);
    }
    dbStore.enquiries = [newEnquiry, ...dbStore.enquiries];
    saveStore();
    res.status(201).json(newEnquiry);
  } catch (err) {
    next(err);
  }
});

app.put('/api/enquiries/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (isPostgresConnected) {
      const updated = await prisma.enquiry.update({ where: { id }, data: req.body });
      return res.json(updated);
    }
    dbStore.enquiries = dbStore.enquiries.map((e) => (e.id === id ? { ...e, ...req.body } : e));
    saveStore();
    res.json(dbStore.enquiries.find((e) => e.id === id) || req.body);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/enquiries/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (isPostgresConnected) {
      await prisma.enquiry.delete({ where: { id } });
      return res.json({ success: true, id });
    }
    dbStore.enquiries = dbStore.enquiries.filter((e) => e.id !== id);
    saveStore();
    res.json({ success: true, id });
  } catch (err) {
    next(err);
  }
});

// ── SETTINGS ENDPOINTS ────────────────────────────────────────────────────────
app.get('/api/settings', async (req, res, next) => {
  try {
    if (isPostgresConnected) {
      const settings = await prisma.siteSettings.findUnique({ where: { id: 'default' } });
      return res.json(settings || dbStore.settings);
    }
    res.json(dbStore.settings);
  } catch (err) {
    next(err);
  }
});

app.put('/api/settings', async (req, res, next) => {
  try {
    if (isPostgresConnected) {
      const settings = await prisma.siteSettings.upsert({
        where: { id: 'default' },
        update: req.body,
        create: { id: 'default', ...req.body },
      });
      return res.json(settings);
    }
    dbStore.settings = { ...dbStore.settings, ...req.body };
    saveStore();
    res.json(dbStore.settings);
  } catch (err) {
    next(err);
  }
});

// ── HEALTH CHECK ENDPOINT ──────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'production',
    database: isPostgresConnected ? 'postgresql_prisma_active' : 'local_persistence_ready',
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
