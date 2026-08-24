import { prisma } from '../server/db.js';

async function main() {
  console.log('🧪 Starting Database CRUD Upload Test for 5 Properties & 5 Businesses...\n');

  // 1. Create 5 Properties directly in PostgreSQL database
  const propertiesToSeed = [
    {
      id: `test-prop-1-${Date.now()}`,
      title: 'Luxury 3 BHK Sky Villa in Jubilee Hills',
      description: 'Ultra-luxurious 3 BHK villa with private pool and panoramic skyline views.',
      image: '/assets/premium_villa.png',
      category: 'Villas',
      status: 'Buy',
      listingStatus: 'PUBLISHED',
      price: 35000000,
      priceDisplay: '₹3.50 Cr',
      city: 'Hyderabad',
      state: 'Telangana',
      area: 'Jubilee Hills',
      bedrooms: 3,
      bathrooms: 4,
      areaSqFt: '3200 sqft',
      published: true,
      featured: true,
      createdDate: new Date().toLocaleDateString('en-IN')
    },
    {
      id: `test-prop-2-${Date.now()}`,
      title: 'Premium 2 BHK Apartment in Gachibowli',
      description: 'Modern 2 BHK gated community flat near Financial District IT Hub.',
      image: '/assets/luxury_apartment.png',
      category: 'Flats',
      status: 'Rent',
      listingStatus: 'PUBLISHED',
      price: 45000,
      priceDisplay: '₹45,000 /mo',
      city: 'Hyderabad',
      state: 'Telangana',
      area: 'Gachibowli',
      bedrooms: 2,
      bathrooms: 2,
      areaSqFt: '1450 sqft',
      published: true,
      featured: true,
      createdDate: new Date().toLocaleDateString('en-IN')
    },
    {
      id: `test-prop-3-${Date.now()}`,
      title: 'Commercial Office Space in Hitech City',
      description: 'Fully furnished 80-seater IT office space ready for immediate occupancy.',
      image: '/assets/business_restaurant.png',
      category: 'Commercial',
      status: 'Rent',
      listingStatus: 'PUBLISHED',
      price: 180000,
      priceDisplay: '₹1.80 Lakhs /mo',
      city: 'Hyderabad',
      state: 'Telangana',
      area: 'Hitech City',
      bedrooms: 0,
      bathrooms: 2,
      areaSqFt: '4500 sqft',
      published: true,
      featured: false,
      createdDate: new Date().toLocaleDateString('en-IN')
    },
    {
      id: `test-prop-4-${Date.now()}`,
      title: 'Independent 4 BHK House in Banjara Hills',
      description: 'Spacious independent house with private lawn and 2 car parkings.',
      image: '/assets/premium_villa.png',
      category: 'Houses',
      status: 'Buy',
      listingStatus: 'PUBLISHED',
      price: 48000000,
      priceDisplay: '₹4.80 Cr',
      city: 'Hyderabad',
      state: 'Telangana',
      area: 'Banjara Hills',
      bedrooms: 4,
      bathrooms: 5,
      areaSqFt: '4200 sqft',
      published: true,
      featured: true,
      createdDate: new Date().toLocaleDateString('en-IN')
    },
    {
      id: `test-prop-5-${Date.now()}`,
      title: 'Residential Plot in Guntur Ring Road',
      description: 'East-facing 300 sq.yards corner plot with 40ft wide road access.',
      image: '/assets/luxury_apartment.png',
      category: 'Lands',
      status: 'Buy',
      listingStatus: 'PUBLISHED',
      price: 9500000,
      priceDisplay: '₹95.00 Lakhs',
      city: 'Guntur',
      state: 'Andhra Pradesh',
      area: 'Ring Road',
      bedrooms: 0,
      bathrooms: 0,
      areaSqFt: '2700 sqft',
      published: true,
      featured: false,
      createdDate: new Date().toLocaleDateString('en-IN')
    }
  ];

  console.log('📦 Uploading 5 Properties to Database...');
  for (const p of propertiesToSeed) {
    const created = await prisma.property.create({ data: p });
    console.log(`  [PROPERTY CREATED] ID: ${created.id} | Title: "${created.title}" | Price: ${created.priceDisplay}`);
  }

  // 2. Create 5 Businesses directly in PostgreSQL database
  const businessesToSeed = [
    {
      id: `test-biz-1-${Date.now()}`,
      name: 'Organic Supermarket & Grocery Store',
      title: 'Profitable Organic Supermarket in Madhapur',
      industry: 'Retail',
      category: 'Retail',
      businessType: 'Private Limited',
      location: 'Madhapur, Hyderabad, Telangana',
      city: 'Hyderabad',
      state: 'Telangana',
      area: 'Madhapur',
      price: 4500000,
      askingPrice: 4500000,
      priceDisplay: '₹45 Lakhs',
      revenueMonthly: '₹8.5 Lakhs',
      profitMonthly: '₹2.2 Lakhs',
      establishedYear: 2021,
      employeesCount: 6,
      published: true,
      featured: true,
      status: 'Available',
      image: '/assets/business_restaurant.png',
      description: 'Fully running organic grocery store with 1200+ monthly active regular customers.'
    },
    {
      id: `test-biz-2-${Date.now()}`,
      name: 'Multi-Cuisine Fine Dining Restaurant',
      title: 'Running 80-Seater Restaurant in Jubilee Hills',
      industry: 'Food & Beverage',
      category: 'Food & Beverage',
      businessType: 'Partnership',
      location: 'Jubilee Hills, Hyderabad, Telangana',
      city: 'Hyderabad',
      state: 'Telangana',
      area: 'Jubilee Hills',
      price: 8500000,
      askingPrice: 8500000,
      priceDisplay: '₹85 Lakhs',
      revenueMonthly: '₹14 Lakhs',
      profitMonthly: '₹3.8 Lakhs',
      establishedYear: 2019,
      employeesCount: 14,
      published: true,
      featured: true,
      status: 'Available',
      image: '/assets/business_restaurant.png',
      description: 'Prime main-road location restaurant with liquor license and Swiggy/Zomato top ratings.'
    },
    {
      id: `test-biz-3-${Date.now()}`,
      name: 'SaaS Software & IT Services Firm',
      title: 'B2B Software Agency with Recurring MRR',
      industry: 'Technology',
      category: 'Technology',
      businessType: 'Private Limited',
      location: 'Gachibowli, Hyderabad, Telangana',
      city: 'Hyderabad',
      state: 'Telangana',
      area: 'Gachibowli',
      price: 15000000,
      askingPrice: 15000000,
      priceDisplay: '₹1.50 Cr',
      revenueMonthly: '₹22 Lakhs',
      profitMonthly: '₹7.5 Lakhs',
      establishedYear: 2020,
      employeesCount: 18,
      published: true,
      featured: true,
      status: 'Available',
      image: '/assets/business_restaurant.png',
      description: 'Tech company with 24 enterprise SaaS client retainers and solid IP assets.'
    },
    {
      id: `test-biz-4-${Date.now()}`,
      name: 'Unisex Luxury Salon & Spa',
      title: 'High Revenue Luxury Salon & Day Spa in Kondapur',
      industry: 'Beauty & Wellness',
      category: 'Beauty & Wellness',
      businessType: 'Proprietorship',
      location: 'Kondapur, Hyderabad, Telangana',
      city: 'Hyderabad',
      state: 'Telangana',
      area: 'Kondapur',
      price: 3200000,
      askingPrice: 3200000,
      priceDisplay: '₹32 Lakhs',
      revenueMonthly: '₹6.2 Lakhs',
      profitMonthly: '₹1.9 Lakhs',
      establishedYear: 2022,
      employeesCount: 8,
      published: true,
      featured: false,
      status: 'Available',
      image: '/assets/business_restaurant.png',
      description: 'Established salon brand with imported styling stations and loyal customer base.'
    },
    {
      id: `test-biz-5-${Date.now()}`,
      name: 'Pharma Franchise Distribution Hub',
      title: 'WHO-GMP Certified Pharma Distribution Business',
      industry: 'Healthcare',
      category: 'Healthcare',
      businessType: 'Private Limited',
      location: 'Vijayawada, Andhra Pradesh',
      city: 'Vijayawada',
      state: 'Andhra Pradesh',
      area: 'Autonagar',
      price: 12000000,
      askingPrice: 12000000,
      priceDisplay: '₹1.20 Cr',
      revenueMonthly: '₹35 Lakhs',
      profitMonthly: '₹5.5 Lakhs',
      establishedYear: 2018,
      employeesCount: 12,
      published: true,
      featured: true,
      status: 'Available',
      image: '/assets/business_restaurant.png',
      description: 'Distribution network across 4 districts supplying 180+ hospitals and pharmacies.'
    }
  ];

  console.log('\n💼 Uploading 5 Businesses to Database...');
  for (const b of businessesToSeed) {
    const created = await prisma.business.create({ data: b });
    console.log(`  [BUSINESS CREATED] ID: ${created.id} | Name: "${created.name}" | Price: ${created.priceDisplay}`);
  }

  // 3. Verify counts in PostgreSQL
  const totalProps = await prisma.property.count();
  const totalBiz = await prisma.business.count();

  console.log('\n======================================================');
  console.log('✅ VERIFICATION SUCCESSFUL!');
  console.log(`• Total Properties in Database: ${totalProps}`);
  console.log(`• Total Businesses in Database: ${totalBiz}`);
  console.log('======================================================\n');

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('❌ Database Test Failed:', err);
  prisma.$disconnect().catch(() => {});
  process.exit(1);
});
