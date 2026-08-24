import { prisma } from '../server/db.js';

const API_BASE = 'http://localhost:8081';

async function runVerification() {
  console.log('\n======================================================');
  console.log('🧪 Starting Property & Business Upload Integration Test');
  console.log('======================================================\n');

  let testPropId = `test-prop-${Date.now()}`;
  let testBizId = `test-biz-${Date.now()}`;

  let passedTests = 0;
  let failedTests = 0;

  // ── TEST 1: Property Creation (POST /api/properties) ────────────────────────
  try {
    console.log('[1/6] Testing Property Creation via POST /api/properties...');
    const propPayload = {
      id: testPropId,
      title: 'Automated Test Luxury Villa',
      description: 'Fully verified test villa with 4 BHK, garden, and pool',
      price: 15000000,
      priceDisplay: '₹1.5 Crores',
      category: 'Villas',
      status: 'Buy',
      listingStatus: 'PUBLISHED',
      state: 'Telangana',
      district: 'Hyderabad',
      city: 'Hyderabad',
      area: 'Jubilee Hills',
      latitude: 17.4326,
      longitude: 78.4071,
      bedrooms: 4,
      bathrooms: 4,
      areaSqFt: '3500 Sq.ft',
      ownershipType: 'Freehold',
      verified: true,
      featured: true,
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'
    };

    const res = await fetch(`${API_BASE}/api/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(propPayload)
    });

    if (res.ok) {
      const createdProp = await res.json();
      console.log(`  ✅ Property creation HTTP ${res.status} successful! ID: ${createdProp.id}`);

      // Verify PostgreSQL database record directly
      const dbRecord = await prisma.property.findUnique({ where: { id: testPropId } });
      if (dbRecord && dbRecord.title === 'Automated Test Luxury Villa') {
        console.log(`  ✅ Verified PostgreSQL Persistence: Property "${dbRecord.title}" saved cleanly!`);
        passedTests++;
      } else {
        console.error('  ❌ PostgreSQL Verification Failed: Record not found in DB!');
        failedTests++;
      }
    } else {
      console.error(`  ❌ Property creation failed with HTTP status ${res.status}`);
      failedTests++;
    }
  } catch (err) {
    console.error('  ❌ Property creation error:', err.message);
    failedTests++;
  }

  // ── TEST 2: Property Retrieval (GET /api/properties) ────────────────────────
  try {
    console.log('\n[2/6] Testing Multi-Device Property Fetching (GET /api/properties)...');
    const res = await fetch(`${API_BASE}/api/properties`);
    const allProps = await res.json();
    const found = allProps.find((p) => p.id === testPropId);
    if (found) {
      console.log(`  ✅ Property "${found.title}" successfully retrieved from multi-device API feed!`);
      passedTests++;
    } else {
      console.error('  ❌ Property not found in GET /api/properties feed!');
      failedTests++;
    }
  } catch (err) {
    console.error('  ❌ GET /api/properties error:', err.message);
    failedTests++;
  }

  // ── TEST 3: Business Creation (POST /api/businesses) ────────────────────────
  try {
    console.log('\n[3/6] Testing Business Creation via POST /api/businesses...');
    const bizPayload = {
      id: testBizId,
      name: 'Automated Test Supermarket Chain',
      title: 'Automated Test Supermarket Chain',
      category: 'Retail & Stores',
      industry: 'Retail & Stores',
      businessType: 'Private Limited Company (Pvt Ltd)',
      city: 'Hyderabad',
      state: 'Telangana',
      district: 'Hyderabad',
      area: 'Gachibowli',
      fullAddress: 'Plot 42, Gachibowli Main Road, Hyderabad',
      latitude: 17.4401,
      longitude: 78.3489,
      price: 85,
      askingPrice: 85,
      priceDisplay: '₹85 Lakhs',
      revenueMonthly: '₹12 Lakhs/mo',
      profitMonthly: '₹3.5 Lakhs/mo',
      establishedYear: 2019,
      employeesCount: 14,
      status: 'Available',
      published: true,
      verified: true,
      description: 'Fully running profitable supermarket with monthly turnover audit',
      image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800'
    };

    const res = await fetch(`${API_BASE}/api/businesses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bizPayload)
    });

    if (res.ok) {
      const createdBiz = await res.json();
      console.log(`  ✅ Business creation HTTP ${res.status} successful! ID: ${createdBiz.id}`);

      // Verify PostgreSQL database record directly
      const dbRecord = await prisma.business.findUnique({ where: { id: testBizId } });
      if (dbRecord && dbRecord.name === 'Automated Test Supermarket Chain') {
        console.log(`  ✅ Verified PostgreSQL Persistence: Business "${dbRecord.name}" saved cleanly!`);
        console.log(`     - District: ${dbRecord.district}`);
        console.log(`     - Area: ${dbRecord.area}`);
        console.log(`     - Revenue: ${dbRecord.revenueMonthly}`);
        console.log(`     - Established: ${dbRecord.establishedYear}`);
        passedTests++;
      } else {
        console.error('  ❌ PostgreSQL Verification Failed: Business record not found in DB!');
        failedTests++;
      }
    } else {
      console.error(`  ❌ Business creation failed with HTTP status ${res.status}`);
      failedTests++;
    }
  } catch (err) {
    console.error('  ❌ Business creation error:', err.message);
    failedTests++;
  }

  // ── TEST 4: Business Retrieval (GET /api/businesses) ────────────────────────
  try {
    console.log('\n[4/6] Testing Multi-Device Business Fetching (GET /api/businesses)...');
    const res = await fetch(`${API_BASE}/api/businesses`);
    const allBiz = await res.json();
    const found = allBiz.find((b) => b.id === testBizId);
    if (found) {
      console.log(`  ✅ Business "${found.name}" successfully retrieved from multi-device API feed!`);
      passedTests++;
    } else {
      console.error('  ❌ Business not found in GET /api/businesses feed!');
      failedTests++;
    }
  } catch (err) {
    console.error('  ❌ GET /api/businesses error:', err.message);
    failedTests++;
  }

  // ── TEST 5: Business Update (PUT /api/businesses/:id) ──────────────────────
  try {
    console.log('\n[5/6] Testing Business Update (PUT /api/businesses/:id)...');
    const updatePayload = {
      price: 90,
      priceDisplay: '₹90 Lakhs',
      revenueMonthly: '₹14 Lakhs/mo',
      status: 'Available'
    };

    const res = await fetch(`${API_BASE}/api/businesses/${testBizId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload)
    });

    if (res.ok) {
      const updatedRecord = await prisma.business.findUnique({ where: { id: testBizId } });
      if (updatedRecord && updatedRecord.price === 90 && updatedRecord.revenueMonthly === '₹14 Lakhs/mo') {
        console.log(`  ✅ Business update verified! Price: ₹${updatedRecord.price} Lakhs, Revenue: ${updatedRecord.revenueMonthly}`);
        passedTests++;
      } else {
        console.error('  ❌ Business update verification failed in DB!');
        failedTests++;
      }
    } else {
      console.error(`  ❌ PUT /api/businesses/${testBizId} failed with status ${res.status}`);
      failedTests++;
    }
  } catch (err) {
    console.error('  ❌ Business update error:', err.message);
    failedTests++;
  }

  // ── TEST 6: Cleanup Test Records ───────────────────────────────────────────
  try {
    console.log('\n[6/6] Cleaning up test records from PostgreSQL...');
    await prisma.property.deleteMany({ where: { id: testPropId } });
    await prisma.business.deleteMany({ where: { id: testBizId } });
    console.log('  ✅ Test records cleaned up successfully!');
    passedTests++;
  } catch (err) {
    console.warn('  ⚠️ Cleanup notice:', err.message);
  }

  console.log('\n======================================================');
  console.log(`📊 INTEGRATION TEST RESULT: ${passedTests} PASSED | ${failedTests} FAILED`);
  console.log('======================================================\n');

  if (failedTests === 0) {
    console.log('🎉 ALL PROPERTY AND BUSINESS UPLOAD APIs ARE WORKING 100% PERFECTLY!\n');
    process.exit(0);
  } else {
    console.error('❌ SOME TESTS FAILED! Check log above.\n');
    process.exit(1);
  }
}

runVerification();
