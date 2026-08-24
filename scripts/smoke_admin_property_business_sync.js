import fs from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '../server/db.js';

const API_BASE = 'http://127.0.0.1:8081';
const now = Date.now();
const brokerId = `smoke-broker-${now}`;
const propertyId = `smoke-property-${now}`;
const businessId = `smoke-business-${now}`;

const tinyPng =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=';

async function api(pathname, options = {}) {
  const res = await fetch(`${API_BASE}${pathname}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`${options.method || 'GET'} ${pathname} failed (${res.status}): ${body?.error || body?.message || 'no JSON error'}`);
  }
  return body;
}

async function cleanup() {
  await prisma.property.deleteMany({ where: { id: propertyId } }).catch(() => null);
  await prisma.business.deleteMany({ where: { id: businessId } }).catch(() => null);
  await prisma.broker.deleteMany({ where: { id: brokerId } }).catch(() => null);
}

async function main() {
  const results = [];
  await cleanup();

  try {
    const uploadedPropertyImage = await api('/api/upload', {
      method: 'POST',
      body: JSON.stringify({
        fileName: `${propertyId}.png`,
        fileData: tinyPng,
        folder: 'property-images',
      }),
    });
    if (!uploadedPropertyImage.url || !uploadedPropertyImage.url.includes('/uploads/property-images/')) {
      throw new Error('Property image upload did not return a durable uploads URL');
    }
    results.push(`property image upload -> ${uploadedPropertyImage.url}`);

    const uploadedBusinessImage = await api('/api/upload', {
      method: 'POST',
      body: JSON.stringify({
        fileName: `${businessId}.png`,
        fileData: tinyPng,
        folder: 'property-images',
      }),
    });
    if (!uploadedBusinessImage.url || !uploadedBusinessImage.url.includes('/uploads/property-images/')) {
      throw new Error('Business image upload did not return a durable uploads URL');
    }
    results.push(`business image upload -> ${uploadedBusinessImage.url}`);

    const broker = await api('/api/dealers', {
      method: 'POST',
      body: JSON.stringify({
        id: brokerId,
        companyName: 'Smoke Test Broker',
        fullName: 'Smoke Test Broker',
        phone: '+91 90000 00000',
        email: 'smoke-broker@example.com',
        city: 'Hyderabad',
        state: 'Telangana',
        verified: true,
      }),
    });
    if (broker.id !== brokerId) throw new Error('Broker API did not return expected broker id');
    results.push(`broker create -> ${broker.id}`);

    const property = await api('/api/properties', {
      method: 'POST',
      body: JSON.stringify({
        id: propertyId,
        title: 'Smoke Test Admin Property',
        description: 'Created by admin DB sync smoke test',
        image: uploadedPropertyImage.url,
        image2: uploadedBusinessImage.url,
        state: 'Telangana',
        district: 'Hyderabad',
        city: 'Hyderabad',
        area: 'Gachibowli',
        latitude: 17.4326,
        longitude: 78.4071,
        price: 12345678,
        priceDisplay: '₹1.23 Cr',
        category: 'Villa',
        status: 'Buy',
        listingStatus: 'PUBLISHED',
        areaSqFt: '2400 Sq.ft',
        bedrooms: 3,
        bathrooms: 3,
        dealerId: brokerId,
        assignedBrokerIds: [brokerId],
        published: true,
        verified: true,
      }),
    });
    if (property.id !== propertyId) throw new Error('Property API did not return expected property id');
    results.push(`property create -> ${property.id}`);

    const business = await api('/api/businesses', {
      method: 'POST',
      body: JSON.stringify({
        id: businessId,
        name: 'Smoke Test Admin Business',
        title: 'Smoke Test Admin Business',
        industry: 'Retail',
        category: 'Retail',
        businessType: 'Private Limited',
        location: 'Gachibowli, Hyderabad',
        state: 'Telangana',
        district: 'Hyderabad',
        city: 'Hyderabad',
        area: 'Gachibowli',
        latitude: 17.4401,
        longitude: 78.3489,
        price: 88,
        askingPrice: 88,
        priceDisplay: '₹88 Lakhs',
        image: uploadedBusinessImage.url,
        images: [uploadedBusinessImage.url, uploadedPropertyImage.url],
        description: 'Created by admin DB sync smoke test',
        dealerId: brokerId,
        brokerId,
        assignedBrokerIds: [brokerId],
        published: true,
        verified: true,
      }),
    });
    if (business.id !== businessId) throw new Error('Business API did not return expected business id');
    results.push(`business create -> ${business.id}`);

    const [dbProperty, dbBusiness, apiProperties, apiBusinesses] = await Promise.all([
      prisma.property.findUnique({ where: { id: propertyId }, include: { broker: true } }),
      prisma.business.findUnique({ where: { id: businessId }, include: { broker: true } }),
      api('/api/properties'),
      api('/api/businesses'),
    ]);

    if (!dbProperty) throw new Error('Property not found in PostgreSQL');
    if (dbProperty.brokerId !== brokerId) throw new Error(`Property broker assignment mismatch: ${dbProperty.brokerId}`);
    if (!String(dbProperty.image).includes('/uploads/property-images/')) throw new Error('Property DB image is not an uploads URL');
    if (!dbProperty.broker) throw new Error('Property broker relation did not load');
    results.push('property DB row + broker relation verified');

    if (!dbBusiness) throw new Error('Business not found in PostgreSQL');
    if (dbBusiness.brokerId !== brokerId) throw new Error(`Business broker assignment mismatch: ${dbBusiness.brokerId}`);
    if (!dbBusiness.assignedBrokerIds.includes(brokerId)) throw new Error('Business assignedBrokerIds missing broker');
    if (!String(dbBusiness.image).includes('/uploads/property-images/')) throw new Error('Business DB image is not an uploads URL');
    if (!dbBusiness.broker) throw new Error('Business broker relation did not load');
    results.push('business DB row + broker relation verified');

    const fetchedProperty = apiProperties.find((item) => item.id === propertyId);
    const fetchedBusiness = apiBusinesses.find((item) => item.id === businessId);
    if (!fetchedProperty) throw new Error('Property missing from GET /api/properties');
    if (!fetchedBusiness) throw new Error('Business missing from GET /api/businesses');
    results.push('multi-device fetch feeds verified');

    const uploadPath = new URL(uploadedPropertyImage.url).pathname.replace(/^\/uploads\//, '');
    const diskPath = path.join(process.cwd(), 'uploads', uploadPath);
    await fs.access(diskPath);
    results.push('uploaded image exists on server disk');

    console.log('ADMIN_DB_SYNC_SMOKE_PASS');
    for (const result of results) console.log(`- ${result}`);
  } finally {
    await cleanup();
    await prisma.$disconnect();
  }
}

main().catch(async (err) => {
  console.error('ADMIN_DB_SYNC_SMOKE_FAIL');
  console.error(err.message);
  await cleanup();
  await prisma.$disconnect();
  process.exit(1);
});
