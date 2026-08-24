const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const businessId = `biz-pg-${Date.now()}`;
    const bId = null;
    const safeBrokerId = null;
    const priceParsed = 10000;
    const askingPriceParsed = 10000;
    const estYearParsed = 2020;
    const empCountParsed = 10;
    const assignedIds = [];
    const imagesList = [];
    const b = {};

    const businessData = {
      name: b.name || b.title || 'Business Listing',
      title: b.title || b.name || 'Business Listing',
      industry: b.category || b.industry || 'Retail',
      category: b.category || b.industry || 'Retail',
      businessType: b.businessType || 'Private Limited',
      location: b.location || [b.area, b.city, b.state].filter(Boolean).join(', ') || 'Hyderabad',
      state: b.state || 'Telangana',
      district: b.district || '',
      city: b.city || 'Hyderabad',
      area: b.area || '',
      subLocation: b.subLocation || '',
      landmark: b.landmark || '',
      pincode: b.pincode || b.postal_code || '',
      fullAddress: b.fullAddress || '',
      latitude: !isNaN(Number(b.latitude)) && Number(b.latitude) !== 0 ? Number(b.latitude) : 17.4326,
      longitude: !isNaN(Number(b.longitude)) && Number(b.longitude) !== 0 ? Number(b.longitude) : 78.4071,
      price: priceParsed,
      askingPrice: askingPriceParsed,
      priceDisplay: b.priceDisplay || `₹${priceParsed} Lakhs`,
      revenueMonthly: b.revenueMonthly || '',
      profitMonthly: b.profitMonthly || '',
      establishedYear: (!isNaN(estYearParsed) && estYearParsed > 1800) ? estYearParsed : 2020,
      employeesCount: (!isNaN(empCountParsed) && empCountParsed >= 0) ? empCountParsed : 10,
      rating: !isNaN(Number(b.rating)) ? Number(b.rating) : 4.7,
      reviewCount: !isNaN(Number(b.reviewCount)) ? Number(b.reviewCount) : 0,
      verified: b.verified !== false,
      published: b.published !== false,
      featured: b.featured === true || b.featured === 'true',
      status: b.status || (b.sold ? 'Sold' : 'Available'),
      sold: b.sold === true || b.status === 'Sold',
      recentlySold: b.recentlySold === true,
      soldDate: b.soldDate || null,
      badge: b.badge || null,
      image: b.image || b.imageUrl || (imagesList[0] || ''),
      image2: b.image2 || (imagesList[1] || null),
      image3: b.image3 || (imagesList[2] || null),
      image4: b.image4 || (imagesList[3] || null),
      image5: b.image5 || (imagesList[4] || null),
      image6: b.image6 || (imagesList[5] || null),
      images: imagesList,
      description: b.description || '',
      reasonForSale: b.reasonForSale || '',
      trustScore: !isNaN(Number(b.trustScore)) ? Number(b.trustScore) : 95,
      sellerProfile: b.sellerProfile || '',
      agentName: b.agentName || '',
      agentPhone: b.agentPhone || '',
      assignedBrokerIds: assignedIds,
      dealerId: bId || null,
      brokerId: safeBrokerId,
    };

    console.log("Attempting to insert business...");
    const created = await prisma.business.upsert({
      where: { id: businessId },
      update: businessData,
      create: {
        id: businessId,
        ...businessData,
      }
    });

    console.log("Success!");
  } catch (err) {
    console.error("Prisma error:", err);
  } finally {
    await prisma.$disconnect();
  }
}
test();
