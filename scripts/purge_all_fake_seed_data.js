import { prisma } from '../server/db.js';

async function purgeAllFakeSeedData() {
  console.log('\n======================================================');
  console.log('🧹 Purging Fake Seed Data from PostgreSQL Database');
  console.log('======================================================\n');

  try {
    const bizPurge = await prisma.business.deleteMany({
      where: {
        OR: [
          { id: { startsWith: 'biz-seed-' } },
          { id: { startsWith: 'test-biz-' } },
          { name: { contains: 'Automated Test' } },
          { name: { contains: 'Seed' } }
        ]
      }
    });
    console.log(`  ✅ Purged ${bizPurge.count} fake business records from PostgreSQL!`);

    const propPurge = await prisma.property.deleteMany({
      where: {
        OR: [
          { id: { startsWith: 'prop-pg-' } },
          { id: { startsWith: 'rent_res_' } },
          { id: { startsWith: 'rent_com_' } },
          { id: { startsWith: 'test-prop-' } },
          { title: { contains: 'Automated Test' } }
        ]
      }
    });
    console.log(`  ✅ Purged ${propPurge.count} fake property records from PostgreSQL!`);

    console.log('\n======================================================');
    console.log('🎉 ALL FAKE/SEED PROPERTY & BUSINESS DATA PURGED CLEANLY!');
    console.log('======================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error purging seed data:', err.message);
    process.exit(1);
  }
}

purgeAllFakeSeedData();
