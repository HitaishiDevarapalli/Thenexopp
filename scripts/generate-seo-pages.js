import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, '../dist');
const templatePath = path.join(distDir, 'index.html');

if (!fs.existsSync(templatePath)) {
  console.error('Error: dist/index.html not found. Run "vite build" first.');
  process.exit(1);
}

const baseTemplate = fs.readFileSync(templatePath, 'utf-8');

const routes = [
  {
    path: '/',
    title: "TheNexopp | Verified Properties, Businesses & Listings",
    description: "TheNexopp is India's marketplace for verified properties, businesses and franchises. Buy, sell, rent and discover your next opportunity across India.",
    keywords: "TheNexopp, verified properties, properties for sale, properties for rent, buy business India, sell business India, franchise opportunities India",
    canonicalUrl: "https://thenexopp.com/",
    h1: "TheNexopp – Verified Properties, Businesses, Franchises & Marketplace Listings in India",
    crawlerBody: `
      <section>
        <h1 style="font-size: 2.2rem; font-weight: 900; color: #0F172A; margin-bottom: 16px;">TheNexopp – Verified Properties, Businesses, Franchises &amp; Marketplace Listings in India</h1>
        <p style="font-size: 1.1rem; color: #475569; margin-bottom: 24px;">Discover verified residential properties, premium commercial spaces, profitable running businesses, and high-ROI franchise opportunities across India. Verified listings, transparent pricing, and direct broker advisory help investors, buyers, and sellers make confident transactions.</p>
      </section>

      <section style="margin-top: 32px;">
        <h2 style="font-size: 1.5rem; font-weight: 800; color: #002B66; margin-bottom: 12px;">Verified Properties for Sale and Rent</h2>
        <p style="color: #475569; margin-bottom: 16px;">Explore 100% verified real estate listings with authenticated legal titles, RERA compliance, structural inspections, and transparent market valuations across major metropolitan regions and emerging growth corridors.</p>
        <ul style="padding-left: 20px; color: #334155; margin-bottom: 24px;">
          <li><strong>Flats &amp; Apartments:</strong> 1 BHK, 2 BHK, 3 BHK &amp; 4+ BHK luxury apartments in premium gated communities.</li>
          <li><strong>Luxury Villas &amp; Independent Houses:</strong> Standalone private residences, luxury duplex villas, and premium row houses.</li>
          <li><strong>Plots &amp; Commercial Lands:</strong> RERA and DTCP approved residential layouts and commercial parcels.</li>
          <li><strong>Rental Properties:</strong> Verified residential flats, furnished corporate apartments, and commercial office spaces.</li>
        </ul>
      </section>

      <section style="margin-top: 32px;">
        <h2 style="font-size: 1.5rem; font-weight: 800; color: #D97706; margin-bottom: 12px;">Business Opportunities &amp; Strategic Acquisitions</h2>
        <p style="color: #475569; margin-bottom: 16px;">Acquire verified operational businesses across retail, food &amp; beverage, healthcare, educational institutions, manufacturing, and tech with complete financial due diligence and turnover verification.</p>
      </section>

      <section style="margin-top: 32px;">
        <h2 style="font-size: 1.5rem; font-weight: 800; color: #059669; margin-bottom: 12px;">Franchise Opportunities &amp; Master Distribution Rights</h2>
        <p style="color: #475569; margin-bottom: 16px;">Invest in high-performing brand franchises and running resale outlets with proven customer footfalls, established supply chains, and comprehensive marketing support.</p>
      </section>
    `,
    breadcrumbs: [{ name: 'Home', path: '/' }]
  },
  {
    path: '/properties',
    title: "Verified Properties for Sale & Rent in India | TheNexopp",
    description: "Explore 100% verified residential and commercial properties for buy and rent across India. Verified legal titles, verified broker connections, transparent pricing.",
    keywords: "verified properties, buy property India, rent property, commercial real estate, apartments for sale, plot sales India",
    canonicalUrl: "https://thenexopp.com/properties",
    h1: "Verified Properties for Sale & Rent in India",
    crawlerBody: `
      <section>
        <h1 style="font-size: 2.2rem; font-weight: 900; color: #0F172A; margin-bottom: 16px;">Verified Properties for Sale &amp; Rent in India</h1>
        <p style="font-size: 1.1rem; color: #475569; margin-bottom: 24px;">Browse 100% verified real estate listings including luxury apartments, independent villas, approved land plots, and prime commercial spaces across Hyderabad, Vijayawada, Guntur, Visakhapatnam, Amaravati, and major Indian metros.</p>
      </section>

      <section style="margin-top: 32px;">
        <h2 style="font-size: 1.5rem; font-weight: 800; color: #002B66; margin-bottom: 12px;">Property Categories Available</h2>
        <ul style="padding-left: 20px; color: #334155; margin-bottom: 24px;">
          <li><a href="/properties/flats" style="color: #002B66; font-weight: 700;">Flats &amp; Apartments:</a> Modern 2BHK, 3BHK, 4BHK apartments in gated communities with clubhouses and 24/7 security.</li>
          <li><a href="/properties/villas" style="color: #002B66; font-weight: 700;">Luxury Villas:</a> Standalone duplex villas and private gated estates with private garden spaces.</li>
          <li><a href="/properties/houses" style="color: #002B66; font-weight: 700;">Independent Houses:</a> Multi-story residential houses with clear land title deeds.</li>
          <li><a href="/properties/lands" style="color: #002B66; font-weight: 700;">Plots &amp; Commercial Land:</a> RERA &amp; DTCP approved residential layouts and highway land parcels.</li>
          <li><a href="/properties/rent" style="color: #002B66; font-weight: 700;">Properties for Rent:</a> Residential flats, corporate suites, and retail store rentals.</li>
        </ul>
      </section>

      <section style="margin-top: 32px;">
        <h2 style="font-size: 1.5rem; font-weight: 800; color: #0F172A; margin-bottom: 12px;">TheNexopp Verification Guarantee</h2>
        <p style="color: #475569; margin-bottom: 16px;">Every property on TheNexopp undergoes title verification, encumbrance checks, physical inspection, and broker credential verification to ensure zero fake or misleading listings.</p>
      </section>
    `,
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Properties', path: '/properties' }
    ]
  },
  {
    path: '/properties/rent',
    title: "Rental Properties & Apartments for Rent in India | TheNexopp",
    description: "Browse verified rental flats, independent houses, villas, and commercial spaces across India. Zero fake listings, direct owner & verified broker connections.",
    keywords: "rental properties, flats for rent, houses for rent, commercial space rent, house rent India",
    canonicalUrl: "https://thenexopp.com/properties/rent",
    h1: "Verified Rental Properties & Apartments for Rent in India",
    crawlerBody: `
      <section>
        <h1 style="font-size: 2.2rem; font-weight: 900; color: #0F172A; margin-bottom: 16px;">Verified Rental Properties &amp; Apartments for Rent in India</h1>
        <p style="font-size: 1.1rem; color: #475569; margin-bottom: 24px;">Find verified residential flats, luxury independent houses, fully furnished corporate suites, and commercial office rentals with transparent lease agreements and direct broker contacts.</p>
      </section>

      <section style="margin-top: 32px;">
        <h2 style="font-size: 1.5rem; font-weight: 800; color: #002B66; margin-bottom: 12px;">Types of Rental Properties Available</h2>
        <ul style="padding-left: 20px; color: #334155; margin-bottom: 24px;">
          <li><strong>Residential Apartments:</strong> 1BHK, 2BHK, 3BHK flats in high-rise gated communities.</li>
          <li><strong>Independent Houses &amp; Villas:</strong> Spacious family homes with private parking and yards.</li>
          <li><strong>Commercial Offices &amp; Shops:</strong> Prime retail storefronts and corporate office floors in business districts.</li>
        </ul>
      </section>
    `,
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Properties', path: '/properties' },
      { name: 'Rent', path: '/properties/rent' }
    ]
  },
  {
    path: '/properties/flats',
    title: "Flats & Apartments for Sale in India | TheNexopp",
    description: "Discover verified 1BHK, 2BHK, 3BHK, 4BHK flats and gated community apartments across prime locations in India. Clear titles, modern amenities, top builders.",
    keywords: "flats for sale, apartments for sale, 2bhk flat, 3bhk flat, gated community flats",
    canonicalUrl: "https://thenexopp.com/properties/flats",
    h1: "Verified Flats & Gated Community Apartments for Sale",
    crawlerBody: `
      <section>
        <h1 style="font-size: 2.2rem; font-weight: 900; color: #0F172A; margin-bottom: 16px;">Verified Flats &amp; Gated Community Apartments for Sale</h1>
        <p style="font-size: 1.1rem; color: #475569; margin-bottom: 24px;">Explore 100% verified 2BHK, 3BHK, and 4BHK apartments in premium gated communities with modern amenities, swimming pools, clubhouses, and 24/7 security.</p>
      </section>
    `,
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Properties', path: '/properties' },
      { name: 'Flats & Apartments', path: '/properties/flats' }
    ]
  },
  {
    path: '/properties/villas',
    title: "Luxury Villas & Duplexes for Sale in India | TheNexopp",
    description: "Explore verified luxury villas, duplexes, independent row houses, and private gated community residences with clear legal titles across India.",
    keywords: "villas for sale, luxury villa, duplex house, gated community villa, independent villa India",
    canonicalUrl: "https://thenexopp.com/properties/villas",
    h1: "Luxury Villas & Gated Independent Residences for Sale",
    crawlerBody: `
      <section>
        <h1 style="font-size: 2.2rem; font-weight: 900; color: #0F172A; margin-bottom: 16px;">Luxury Villas &amp; Gated Independent Residences for Sale</h1>
        <p style="font-size: 1.1rem; color: #475569; margin-bottom: 24px;">Discover verified independent luxury villas, multi-level duplexes, and gated community villa projects with private lawns and top-tier security.</p>
      </section>
    `,
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Properties', path: '/properties' },
      { name: 'Villas', path: '/properties/villas' }
    ]
  },
  {
    path: '/properties/houses',
    title: "Independent Houses for Sale in India | TheNexopp",
    description: "Browse verified independent houses, standalone residential homes, and multi-story houses with clear land ownership across top Indian cities.",
    keywords: "independent house for sale, standalone house, individual house sale, row house India",
    canonicalUrl: "https://thenexopp.com/properties/houses",
    h1: "Verified Independent Houses & Standalone Homes for Sale",
    crawlerBody: `
      <section>
        <h1 style="font-size: 2.2rem; font-weight: 900; color: #0F172A; margin-bottom: 16px;">Verified Independent Houses &amp; Standalone Homes for Sale</h1>
        <p style="font-size: 1.1rem; color: #475569; margin-bottom: 24px;">Find standalone independent houses and multi-floor family residences with clear title deeds and direct seller connections.</p>
      </section>
    `,
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Properties', path: '/properties' },
      { name: 'Independent Houses', path: '/properties/houses' }
    ]
  },
  {
    path: '/properties/lands',
    title: "Plots & Lands for Sale | RERA & DTCP Approved | TheNexopp",
    description: "Buy verified land parcels, residential plots, commercial development sites, and industrial lands with clear title deeds across India.",
    keywords: "plots for sale, land for sale, DTCP approved plots, RERA plots, commercial land India",
    canonicalUrl: "https://thenexopp.com/properties/lands",
    h1: "Approved Residential Plots & Commercial Land Parcels",
    crawlerBody: `
      <section>
        <h1 style="font-size: 2.2rem; font-weight: 900; color: #0F172A; margin-bottom: 16px;">Approved Residential Plots &amp; Commercial Land Parcels</h1>
        <p style="font-size: 1.1rem; color: #475569; margin-bottom: 24px;">Invest in RERA &amp; DTCP approved residential layouts, highway commercial plots, and agricultural land parcels with authenticated boundary surveys.</p>
      </section>
    `,
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Properties', path: '/properties' },
      { name: 'Plots & Lands', path: '/properties/lands' }
    ]
  },
  {
    path: '/properties/sell',
    title: "Sell Your Property Online in India | TheNexopp",
    description: "List your residential flat, villa, plot, or commercial property on TheNexopp. Reach thousands of verified buyers and investors with direct broker assistance.",
    keywords: "sell property online, post property ad, sell plot, sell apartment India",
    canonicalUrl: "https://thenexopp.com/properties/sell",
    h1: "Sell Your Property Fast with Verified Buyers",
    crawlerBody: `
      <section>
        <h1 style="font-size: 2.2rem; font-weight: 900; color: #0F172A; margin-bottom: 16px;">Sell Your Property Fast with Verified Buyers</h1>
        <p style="font-size: 1.1rem; color: #475569; margin-bottom: 24px;">Post your property listing on India's trusted marketplace. Connect directly with active buyers, real estate investors, and verified property advisors.</p>
      </section>
    `,
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Properties', path: '/properties' },
      { name: 'Sell Property', path: '/properties/sell' }
    ]
  },
  {
    path: '/franchise',
    title: "Franchise Opportunities & Master Rights in India | TheNexopp",
    description: "Explore verified franchise opportunities across F&B, Retail, Healthcare, and Education in India. Transparent ROI, master rights, and turnkey operational support.",
    keywords: "franchise opportunities, buy franchise India, food franchise, retail franchise, master franchise rights",
    canonicalUrl: "https://thenexopp.com/franchise",
    h1: "Top Brand Franchise Opportunities & Business Investments in India",
    crawlerBody: `
      <section>
        <h1 style="font-size: 2.2rem; font-weight: 900; color: #0F172A; margin-bottom: 16px;">Top Brand Franchise Opportunities &amp; Business Investments in India</h1>
        <p style="font-size: 1.1rem; color: #475569; margin-bottom: 24px;">Discover verified brand franchises, master distribution rights, and running resale outlets across food &amp; beverage, retail showrooms, healthcare, and educational sectors.</p>
      </section>

      <section style="margin-top: 32px;">
        <h2 style="font-size: 1.5rem; font-weight: 800; color: #D97706; margin-bottom: 12px;">Franchise Categories</h2>
        <ul style="padding-left: 20px; color: #334155; margin-bottom: 24px;">
          <li><a href="/franchise/existing" style="color: #D97706; font-weight: 700;">Franchise Resales &amp; Running Outlets:</a> Purchase operational brand outlets with existing cash flow and trained staff.</li>
          <li><a href="/franchise/new" style="color: #D97706; font-weight: 700;">New Brand Franchises &amp; Master Rights:</a> Secure exclusive territorial franchise rights for fast-growing national brands.</li>
        </ul>
      </section>
    `,
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Franchise', path: '/franchise' }
    ]
  },
  {
    path: '/franchise/existing',
    title: "Franchise Resales & Running Outlets for Sale | TheNexopp",
    description: "Acquire running, revenue-generating franchise outlets with established customer bases, trained staff, and verified financial audits across India.",
    keywords: "franchise resale, running outlet for sale, existing franchise sale, operating franchise India",
    canonicalUrl: "https://thenexopp.com/franchise/existing",
    h1: "Verified Franchise Resales & Running Revenue-Generating Outlets",
    crawlerBody: `
      <section>
        <h1 style="font-size: 2.2rem; font-weight: 900; color: #0F172A; margin-bottom: 16px;">Verified Franchise Resales &amp; Running Revenue-Generating Outlets</h1>
        <p style="font-size: 1.1rem; color: #475569; margin-bottom: 24px;">Buy existing operating franchise stores with immediate daily revenue, active inventory, trained workforce, and established lease terms.</p>
      </section>
    `,
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Franchise', path: '/franchise' },
      { name: 'Resales', path: '/franchise/existing' }
    ]
  },
  {
    path: '/franchise/new',
    title: "New Brand Franchises & Master Distribution Rights | TheNexopp",
    description: "Acquire new brand franchise territories, regional unit franchises, and master rights with complete operational guidance, training, and brand support.",
    keywords: "new franchise, master franchise, unit franchise, franchise territory rights India",
    canonicalUrl: "https://thenexopp.com/franchise/new",
    h1: "New Franchise Brands & Master Regional Rights",
    crawlerBody: `
      <section>
        <h1 style="font-size: 2.2rem; font-weight: 900; color: #0F172A; margin-bottom: 16px;">New Franchise Brands &amp; Master Regional Rights</h1>
        <p style="font-size: 1.1rem; color: #475569; margin-bottom: 24px;">Partner with top expanding brands to launch new unit franchises or secure exclusive city-wide master franchise rights.</p>
      </section>
    `,
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Franchise', path: '/franchise' },
      { name: 'New Franchises', path: '/franchise/new' }
    ]
  },
  {
    path: '/business',
    title: "Businesses for Sale in India | Operational Acquisitions | TheNexopp",
    description: "India's trusted marketplace to buy and sell verified operational businesses across retail, manufacturing, tech, healthcare, and service sectors.",
    keywords: "businesses for sale, buy business, running business acquisition, sell running business India",
    canonicalUrl: "https://thenexopp.com/business",
    h1: "Verified Running Businesses for Sale & Strategic Acquisitions",
    crawlerBody: `
      <section>
        <h1 style="font-size: 2.2rem; font-weight: 900; color: #0F172A; margin-bottom: 16px;">Verified Running Businesses for Sale &amp; Strategic Acquisitions</h1>
        <p style="font-size: 1.1rem; color: #475569; margin-bottom: 24px;">Acquire profitable, running enterprises with verified turnover audits, clear financial balance sheets, and full operational transition support.</p>
      </section>

      <section style="margin-top: 32px;">
        <h2 style="font-size: 1.5rem; font-weight: 800; color: #002B66; margin-bottom: 12px;">Business Acquisition Categories</h2>
        <ul style="padding-left: 20px; color: #334155; margin-bottom: 24px;">
          <li><strong>Food &amp; Beverage:</strong> Restaurants, cafes, cloud kitchens, and bakery chains.</li>
          <li><strong>Healthcare &amp; Wellness:</strong> Diagnostic labs, pharmacies, dental clinics, and fitness centers.</li>
          <li><strong>Retail &amp; Supermarkets:</strong> Supermarkets, apparel stores, electronics outlets, and boutique shops.</li>
          <li><a href="/business/sell" style="color: #002B66; font-weight: 700;">Sell Your Business:</a> Confidential valuation and exit advisory for business owners.</li>
        </ul>
      </section>
    `,
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Business', path: '/business' }
    ]
  },
  {
    path: '/business/sell',
    title: "Sell Your Business Confidentially in India | TheNexopp",
    description: "List your business for acquisition under strict confidentiality. Connect with high-net-worth investors and buyers with verified financial valuations.",
    keywords: "sell business, confidential business sale, business exit advisory, sell enterprise India",
    canonicalUrl: "https://thenexopp.com/business/sell",
    h1: "Confidential Business Sales & Exit Advisory",
    crawlerBody: `
      <section>
        <h1 style="font-size: 2.2rem; font-weight: 900; color: #0F172A; margin-bottom: 16px;">Confidential Business Sales &amp; Exit Advisory</h1>
        <p style="font-size: 1.1rem; color: #475569; margin-bottom: 24px;">Sell your operating business or equity stake confidentially. TheNexopp connects qualified sellers with verified strategic buyers and HNW investors.</p>
      </section>
    `,
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Business', path: '/business' },
      { name: 'Sell Business', path: '/business/sell' }
    ]
  },
  {
    path: '/finance',
    title: "Finance, Loans & Asset Advisory Services | TheNexopp",
    description: "Access tailored financial advisory, home loans, commercial credit, and asset protection insurance from top institutional financial partners.",
    keywords: "finance solutions, home loan, business loan, asset insurance, financial advisory India",
    canonicalUrl: "https://thenexopp.com/finance",
    h1: "Financial Services, Acquisition Loans & Commercial Insurance",
    crawlerBody: `
      <section>
        <h1 style="font-size: 2.2rem; font-weight: 900; color: #0F172A; margin-bottom: 16px;">Financial Services, Acquisition Loans &amp; Commercial Insurance</h1>
        <p style="font-size: 1.1rem; color: #475569; margin-bottom: 24px;">Complete financial ecosystem providing residential mortgage loans, commercial credit lines, asset insurance, and transactional due diligence advisory.</p>
      </section>

      <section style="margin-top: 32px;">
        <h2 style="font-size: 1.5rem; font-weight: 800; color: #059669; margin-bottom: 12px;">Financial Services Directory</h2>
        <ul style="padding-left: 20px; color: #334155; margin-bottom: 24px;">
          <li><a href="/finance/loans" style="color: #059669; font-weight: 700;">Home &amp; Business Loans:</a> Low-interest real estate financing and business acquisition loans.</li>
          <li><a href="/finance/insurance" style="color: #059669; font-weight: 700;">Asset &amp; Property Insurance:</a> Comprehensive coverage for real estate assets and commercial inventory.</li>
          <li><a href="/finance/advisory" style="color: #059669; font-weight: 700;">Due Diligence Advisory:</a> Valuation services, title searches, and legal transaction support.</li>
        </ul>
      </section>
    `,
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Finance', path: '/finance' }
    ]
  },
  {
    path: '/finance/loans',
    title: "Home Loans & Business Acquisition Loans | TheNexopp",
    description: "Get fast home loan approvals, real estate mortgage financing, and business acquisition credit with competitive interest rates and low processing fees.",
    keywords: "home loan India, mortgage loan, business acquisition loan, property financing",
    canonicalUrl: "https://thenexopp.com/finance/loans",
    h1: "Home Loans, Real Estate Mortgage & Business Acquisition Credit",
    crawlerBody: `
      <section>
        <h1 style="font-size: 2.2rem; font-weight: 900; color: #0F172A; margin-bottom: 16px;">Home Loans, Real Estate Mortgage &amp; Business Acquisition Credit</h1>
        <p style="font-size: 1.1rem; color: #475569; margin-bottom: 24px;">Secure pre-approved home loans, commercial property mortgages, and business expansion capital through our network of leading institutional bank partners.</p>
      </section>
    `,
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Finance', path: '/finance' },
      { name: 'Loans', path: '/finance/loans' }
    ]
  },
  {
    path: '/finance/insurance',
    title: "Commercial & Property Asset Insurance | TheNexopp",
    description: "Protect your commercial real estate, residential properties, and business assets with comprehensive property and asset protection insurance policies.",
    keywords: "property insurance, commercial asset insurance, home insurance, business loss insurance",
    canonicalUrl: "https://thenexopp.com/finance/insurance",
    h1: "Property & Commercial Asset Insurance Solutions",
    crawlerBody: `
      <section>
        <h1 style="font-size: 2.2rem; font-weight: 900; color: #0F172A; margin-bottom: 16px;">Property &amp; Commercial Asset Insurance Solutions</h1>
        <p style="font-size: 1.1rem; color: #475569; margin-bottom: 24px;">Protect your real estate holdings, commercial premises, and business operations against property damage, liability, and operational risks.</p>
      </section>
    `,
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Finance', path: '/finance' },
      { name: 'Insurance', path: '/finance/insurance' }
    ]
  },
  {
    path: '/finance/advisory',
    title: "Financial & Due Diligence Advisory Services | TheNexopp",
    description: "Professional transactional due diligence, business valuation, legal title verification, and escrow structuring services for buyers and investors.",
    keywords: "financial advisory, due diligence service, business valuation India, legal title verification",
    canonicalUrl: "https://thenexopp.com/finance/advisory",
    h1: "Financial Due Diligence & Legal Transaction Advisory",
    crawlerBody: `
      <section>
        <h1 style="font-size: 2.2rem; font-weight: 900; color: #0F172A; margin-bottom: 16px;">Financial Due Diligence &amp; Legal Transaction Advisory</h1>
        <p style="font-size: 1.1rem; color: #475569; margin-bottom: 24px;">Expert advisory services offering independent property title searches, business turnover audits, asset valuations, and secure legal contracts.</p>
      </section>
    `,
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Finance', path: '/finance' },
      { name: 'Advisory', path: '/finance/advisory' }
    ]
  },
  {
    path: '/about',
    title: "About TheNexopp – India's Verified Asset Platform",
    description: "Learn about TheNexopp's mission, executive leadership, multi-tier verification process, and innovative marketplace for properties, businesses, and franchises.",
    keywords: "about TheNexopp, verified marketplace India, company profile, real estate portal",
    canonicalUrl: "https://thenexopp.com/about",
    h1: "About TheNexopp – India's Marketplace for Verified Assets",
    crawlerBody: `
      <section>
        <h1 style="font-size: 2.2rem; font-weight: 900; color: #0F172A; margin-bottom: 16px;">About TheNexopp – India's Marketplace for Verified Assets</h1>
        <p style="font-size: 1.1rem; color: #475569; margin-bottom: 24px;">TheNexopp is India's premier verified ecosystem dedicated to modernizing property, business, and franchise transactions through strict verification standards and expert advisory.</p>
      </section>

      <section style="margin-top: 32px;">
        <h2 style="font-size: 1.5rem; font-weight: 800; color: #002B66; margin-bottom: 12px;">Our Mission &amp; Verification Standard</h2>
        <p style="color: #475569; margin-bottom: 16px;">We bridge the gap between buyers, sellers, brokers, and investors by ensuring that every property, running business, and franchise listed on our platform is 100% verified with legal, financial, and physical documentation.</p>
      </section>
    `,
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'About Us', path: '/about' }
    ]
  },
  {
    path: '/contact',
    title: "Contact Us | TheNexopp Customer & Advisory Support",
    description: "Get in touch with TheNexopp acquisition team. Submit your property, franchise, or business requirement for personalized advisory and site visit arrangements.",
    keywords: "contact TheNexopp, real estate support, customer care, property advisory contact",
    canonicalUrl: "https://thenexopp.com/contact",
    h1: "Contact TheNexopp – Advisory & Customer Support",
    crawlerBody: `
      <section>
        <h1 style="font-size: 2.2rem; font-weight: 900; color: #0F172A; margin-bottom: 16px;">Contact TheNexopp – Advisory &amp; Customer Support</h1>
        <p style="font-size: 1.1rem; color: #475569; margin-bottom: 24px;">Have questions about buying a property, investing in a franchise, or selling your business? Our dedicated customer care and investment advisors are here to help.</p>
        <p style="color: #475569; margin-bottom: 12px;"><strong>Email:</strong> support@thenexopp.com</p>
        <p style="color: #475569; margin-bottom: 12px;"><strong>Phone:</strong> +91 98765 43210</p>
        <p style="color: #475569; margin-bottom: 12px;"><strong>Head Office:</strong> Hyderabad, Telangana, India</p>
      </section>
    `,
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Contact Us', path: '/contact' }
    ]
  }
];

function generateHtmlForRoute(baseHtml, route) {
  let html = baseHtml;

  // 1. Replace Title Tag
  html = html.replace(/<title>.*?<\/title>/s, `<title>${route.title}</title>`);

  // 2. Replace Meta Description
  html = html.replace(
    /<meta name="description" content=".*?" \/>/s,
    `<meta name="description" content="${route.description}" />`
  );

  // 3. Replace Meta Keywords if present
  if (route.keywords) {
    html = html.replace(
      /<meta name="keywords" content=".*?" \/>/s,
      `<meta name="keywords" content="${route.keywords}" />`
    );
  }

  // 4. Replace Canonical Link Tag
  html = html.replace(
    /<link rel="canonical" href=".*?" \/>/s,
    `<link rel="canonical" href="${route.canonicalUrl}" />`
  );

  // 5. Replace OpenGraph & Twitter Tags
  html = html.replace(
    /<meta property="og:title" content=".*?" \/>/s,
    `<meta property="og:title" content="${route.title}" />`
  );
  html = html.replace(
    /<meta property="og:description" content=".*?" \/>/s,
    `<meta property="og:description" content="${route.description}" />`
  );
  html = html.replace(
    /<meta property="og:url" content=".*?" \/>/s,
    `<meta property="og:url" content="${route.canonicalUrl}" />`
  );

  html = html.replace(
    /<meta name="twitter:title" content=".*?" \/>/s,
    `<meta name="twitter:title" content="${route.title}" />`
  );
  html = html.replace(
    /<meta name="twitter:description" content=".*?" \/>/s,
    `<meta name="twitter:description" content="${route.description}" />`
  );
  html = html.replace(
    /<meta name="twitter:url" content=".*?" \/>/s,
    `<meta name="twitter:url" content="${route.canonicalUrl}" />`
  );

  // 6. Replace Breadcrumb JSON-LD if present, or add inside head
  const breadcrumbJson = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": route.breadcrumbs.map((b, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "name": b.name,
      "item": `https://thenexopp.com${b.path === '/' ? '/' : b.path}`
    }))
  });
  const breadcrumbScriptTag = `<script type="application/ld+json" id="seo-breadcrumb-jsonld">${breadcrumbJson}</script>`;

  if (html.includes('id="seo-breadcrumb-jsonld"')) {
    html = html.replace(/<script type="application\/ld\+json" id="seo-breadcrumb-jsonld">.*?<\/script>/s, breadcrumbScriptTag);
  } else {
    html = html.replace('</head>', `  ${breadcrumbScriptTag}\n</head>`);
  }

  // 7. Replace <div class="seo-crawler-shell"> content
  const crawlerShellRegex = /<div class="seo-crawler-shell"[\s\S]*?<\/footer>\s*<\/div>/;
  if (crawlerShellRegex.test(html)) {
    const newShell = `<div class="seo-crawler-shell" style="max-width: 1200px; margin: 0 auto; padding: 20px; font-family: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif; color: #0F172A; line-height: 1.6;">
        <header style="border-bottom: 1px solid #E2E8F0; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
          <a href="/" style="font-size: 1.5rem; font-weight: 900; color: #002B66; text-decoration: none;">The<span style="color: #D97706;">Nex</span><span style="color: #059669;">opp</span></a>
          <nav style="display: flex; gap: 16px; flex-wrap: wrap;">
            <a href="/properties" style="color: #002B66; font-weight: 700; text-decoration: none;">Properties</a>
            <a href="/properties/rent" style="color: #002B66; font-weight: 700; text-decoration: none;">Rent</a>
            <a href="/properties/flats" style="color: #002B66; font-weight: 700; text-decoration: none;">Flats</a>
            <a href="/properties/villas" style="color: #002B66; font-weight: 700; text-decoration: none;">Villas</a>
            <a href="/properties/lands" style="color: #002B66; font-weight: 700; text-decoration: none;">Plots &amp; Lands</a>
            <a href="/franchise" style="color: #D97706; font-weight: 700; text-decoration: none;">Franchise</a>
            <a href="/business" style="color: #002B66; font-weight: 700; text-decoration: none;">Business</a>
            <a href="/finance" style="color: #059669; font-weight: 700; text-decoration: none;">Finance</a>
            <a href="/about" style="color: #475569; font-weight: 600; text-decoration: none;">About</a>
            <a href="/contact" style="color: #475569; font-weight: 600; text-decoration: none;">Contact</a>
          </nav>
        </header>

        <main>
          ${route.crawlerBody}
        </main>

        <footer style="margin-top: 48px; border-top: 1px solid #E2E8F0; padding-top: 20px; font-size: 0.85rem; color: #64748B; display: flex; justify-content: space-between; flex-wrap: wrap;">
          <p>© 2026 TheNexopp. All Rights Reserved.</p>
          <p>India's Trusted Marketplace for Verified Listings</p>
        </footer>
      </div>`;

    html = html.replace(crawlerShellRegex, newShell);
  }

  return html;
}

let generatedCount = 0;

for (const route of routes) {
  const routeHtml = generateHtmlForRoute(baseTemplate, route);
  if (route.path === '/') {
    fs.writeFileSync(templatePath, routeHtml, 'utf-8');
    generatedCount++;
    console.log(`[SEO Generator] Updated root index.html -> canonical: ${route.canonicalUrl}`);
  } else {
    const routeFolder = path.join(distDir, route.path.slice(1));
    if (!fs.existsSync(routeFolder)) {
      fs.mkdirSync(routeFolder, { recursive: true });
    }
    const outputPath = path.join(routeFolder, 'index.html');
    fs.writeFileSync(outputPath, routeHtml, 'utf-8');
    generatedCount++;
    console.log(`[SEO Generator] Created ${route.path}/index.html -> canonical: ${route.canonicalUrl}`);
  }
}

console.log(`\n✅ Successfully generated static SEO HTML pages for all ${generatedCount} routes!`);
