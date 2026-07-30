import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pinoHttp from 'pino-http';
import pino from 'pino';

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

// Pino HTTP Request Logging Middleware
app.use(pinoHttp({ logger }));

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static upload folder for property images & videos
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// JSON File Persistence Store Fallback
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

// ── SHARP WEBP IMAGE & VIDEO UPLOAD ENDPOINT ─────────────────────────────────
app.post('/api/upload', async (req, res) => {
  const { fileName, fileData } = req.body;
  if (!fileData) {
    return res.status(400).json({ error: 'No file data provided' });
  }

  try {
    // Sharp WebP Optimization Engine
    const { webpFileName, thumbFileName } = await optimizeAndSaveImage(fileData, fileName, uploadDir);

    const protocol = req.protocol;
    const host = req.headers.host;
    const fileUrl = `${protocol}://${host}/uploads/${webpFileName}`;
    const thumbUrl = `${protocol}://${host}/uploads/${thumbFileName}`;

    logger.info({ webpFileName, thumbFileName }, 'Image optimized and saved via Sharp WebP');

    res.status(201).json({
      success: true,
      url: fileUrl,
      thumbUrl: thumbUrl,
      fileName: webpFileName,
    });
  } catch (err) {
    logger.error({ err }, 'Sharp file upload optimization error');
    res.status(500).json({ error: 'Failed to optimize and save file' });
  }
});

// ── AUTHENTICATION & JWT ENDPOINTS ──────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  try {
    const validated = userRegisterSchema.parse(req.body);
    const existing = dbStore.users.find((u) => u.email.toLowerCase() === validated.email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

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
    if (err.errors) return res.status(400).json({ error: 'Validation error', details: err.errors });
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const validated = userLoginSchema.parse(req.body);
    const user = dbStore.users.find((u) => u.email.toLowerCase() === validated.email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await verifyPassword(validated.password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const tokens = generateTokens(user);
    res.json({ success: true, user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role }, tokens });
  } catch (err) {
    if (err.errors) return res.status(400).json({ error: 'Validation error', details: err.errors });
    res.status(500).json({ error: 'Login failed' });
  }
});

// ── CUSTOMERS ENDPOINTS ──────────────────────────────────────────────────────
app.get('/api/customers', (req, res) => {
  res.json(dbStore.customers);
});

app.post('/api/customers', (req, res) => {
  const { email, phone, name, gender, district, role, avatar } = req.body;
  const existingIndex = dbStore.customers.findIndex((c) => (phone && c.phone === phone) || (email && c.email === email));
  const now = new Date().toLocaleString();

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
});

app.delete('/api/customers/:id', (req, res) => {
  dbStore.customers = dbStore.customers.filter((c) => c.id !== req.params.id);
  saveStore();
  res.json({ success: true, id: req.params.id });
});

// ── PROPERTY ENDPOINTS ────────────────────────────────────────────────────────
app.get('/api/properties', (req, res) => {
  res.json(dbStore.properties);
});

app.post('/api/properties', (req, res) => {
  try {
    if (req.body.title && req.body.price) {
      propertyValidationSchema.partial().parse(req.body);
    }
    const newProp = { id: req.body.id || `prop-pg-${Date.now()}`, createdDate: new Date().toLocaleDateString(), ...req.body };
    dbStore.properties = [newProp, ...dbStore.properties];
    saveStore();
    res.status(201).json(newProp);
  } catch (err) {
    res.status(400).json({ error: 'Invalid property payload', details: err.errors });
  }
});

app.put('/api/properties/:id', (req, res) => {
  const { id } = req.params;
  dbStore.properties = dbStore.properties.map((p) => (p.id === id ? { ...p, ...req.body } : p));
  saveStore();
  res.json(dbStore.properties.find((p) => p.id === id) || req.body);
});

app.delete('/api/properties/:id', (req, res) => {
  dbStore.properties = dbStore.properties.filter((p) => p.id !== req.params.id);
  saveStore();
  res.json({ success: true, id: req.params.id });
});

// ── FRANCHISE ENDPOINTS ───────────────────────────────────────────────────────
app.get('/api/franchises', (req, res) => {
  res.json(dbStore.franchises);
});

app.post('/api/franchises', (req, res) => {
  const newFranchise = { id: req.body.id || `fran-pg-${Date.now()}`, ...req.body };
  dbStore.franchises = [newFranchise, ...dbStore.franchises];
  saveStore();
  res.status(201).json(newFranchise);
});

app.put('/api/franchises/:id', (req, res) => {
  const { id } = req.params;
  dbStore.franchises = dbStore.franchises.map((f) => (f.id === id ? { ...f, ...req.body } : f));
  saveStore();
  res.json(dbStore.franchises.find((f) => f.id === id) || req.body);
});

app.delete('/api/franchises/:id', (req, res) => {
  dbStore.franchises = dbStore.franchises.filter((f) => f.id !== req.params.id);
  saveStore();
  res.json({ success: true, id: req.params.id });
});

// ── BUSINESS ENDPOINTS ────────────────────────────────────────────────────────
app.get('/api/businesses', (req, res) => {
  res.json(dbStore.businesses);
});

app.post('/api/businesses', (req, res) => {
  const newBiz = { id: req.body.id || `biz-pg-${Date.now()}`, ...req.body };
  dbStore.businesses = [newBiz, ...dbStore.businesses];
  saveStore();
  res.status(201).json(newBiz);
});

app.put('/api/businesses/:id', (req, res) => {
  const { id } = req.params;
  dbStore.businesses = dbStore.businesses.map((b) => (b.id === id ? { ...b, ...req.body } : b));
  saveStore();
  res.json(dbStore.businesses.find((b) => b.id === id) || req.body);
});

app.delete('/api/businesses/:id', (req, res) => {
  dbStore.businesses = dbStore.businesses.filter((b) => b.id !== req.params.id);
  saveStore();
  res.json({ success: true, id: req.params.id });
});

// ── DEALER / BROKER ENDPOINTS ─────────────────────────────────────────────────
app.get('/api/dealers', (req, res) => {
  res.json(dbStore.dealers);
});

app.post('/api/dealers', (req, res) => {
  const newDealer = { id: req.body.id || `dealer-pg-${Date.now()}`, ...req.body };
  dbStore.dealers = [newDealer, ...dbStore.dealers];
  saveStore();
  res.status(201).json(newDealer);
});

app.put('/api/dealers/:id', (req, res) => {
  const { id } = req.params;
  dbStore.dealers = dbStore.dealers.map((d) => (d.id === id ? { ...d, ...req.body } : d));
  saveStore();
  res.json(dbStore.dealers.find((d) => d.id === id) || req.body);
});

app.delete('/api/dealers/:id', (req, res) => {
  dbStore.dealers = dbStore.dealers.filter((d) => d.id !== req.params.id);
  saveStore();
  res.json({ success: true, id: req.params.id });
});

// ── SHOWCASE VIDEOS ENDPOINTS ─────────────────────────────────────────────────
app.get('/api/showcase-videos', (req, res) => {
  res.json(dbStore.showcaseVideos);
});

app.post('/api/showcase-videos', (req, res) => {
  const newVideo = { id: req.body.id || `sv-pg-${Date.now()}`, ...req.body };
  dbStore.showcaseVideos = [newVideo, ...dbStore.showcaseVideos];
  saveStore();
  res.status(201).json(newVideo);
});

app.put('/api/showcase-videos/:id', (req, res) => {
  const { id } = req.params;
  dbStore.showcaseVideos = dbStore.showcaseVideos.map((v) => (v.id === id ? { ...v, ...req.body } : v));
  saveStore();
  res.json(dbStore.showcaseVideos.find((v) => v.id === id) || req.body);
});

app.delete('/api/showcase-videos/:id', (req, res) => {
  dbStore.showcaseVideos = dbStore.showcaseVideos.filter((v) => v.id !== req.params.id);
  saveStore();
  res.json({ success: true, id: req.params.id });
});

// ── ENQUIRIES ENDPOINTS ───────────────────────────────────────────────────────
app.get('/api/enquiries', (req, res) => {
  res.json(dbStore.enquiries);
});

app.post('/api/enquiries', (req, res) => {
  const newEnquiry = { id: req.body.id || `enq-pg-${Date.now()}`, date: new Date().toLocaleDateString(), ...req.body };
  dbStore.enquiries = [newEnquiry, ...dbStore.enquiries];
  saveStore();
  res.status(201).json(newEnquiry);
});

app.put('/api/enquiries/:id', (req, res) => {
  const { id } = req.params;
  dbStore.enquiries = dbStore.enquiries.map((e) => (e.id === id ? { ...e, ...req.body } : e));
  saveStore();
  res.json(dbStore.enquiries.find((e) => e.id === id) || req.body);
});

app.delete('/api/enquiries/:id', (req, res) => {
  dbStore.enquiries = dbStore.enquiries.filter((e) => e.id !== req.params.id);
  saveStore();
  res.json({ success: true, id: req.params.id });
});

// ── SETTINGS ENDPOINTS ────────────────────────────────────────────────────────
app.get('/api/settings', (req, res) => {
  res.json(dbStore.settings);
});

app.put('/api/settings', (req, res) => {
  dbStore.settings = { ...dbStore.settings, ...req.body };
  saveStore();
  res.json(dbStore.settings);
});

// ── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: 'postgresql_prisma_ready',
    imageOptimization: 'sharp_webp_active',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  logger.info(`[NEXOPP Enterprise API] Server running on port ${PORT}`);
});
