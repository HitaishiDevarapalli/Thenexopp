import { trackPageView } from './analytics';

export interface PageSEO {
  title: string;
  description: string;
  canonicalPath: string;
  robots?: string;
  ogType?: string;
  ogImage?: string;
  breadcrumbs?: { name: string; path: string }[];
}

export const PRIMARY_CANONICAL_DOMAIN = 'https://thenexopp.com';
const DEFAULT_IMAGE = 'https://thenexopp.com/logo.png';

export const SEO_CONFIG: Record<string, PageSEO> = {
  home: {
    title: "TheNexopp | Verified Properties, Businesses & Franchise Listings",
    description: "TheNexopp is India's marketplace for verified properties, businesses and franchises. Buy, sell, rent and discover your next opportunity across India.",
    canonicalPath: '/',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    breadcrumbs: [
      { name: 'Home', path: '/' }
    ]
  },
  propertiesPage: {
    title: "Verified Properties for Sale & Rent in India | TheNexopp",
    description: "Explore 100% verified residential and commercial properties for buy and rent across India. Verified legal titles, verified broker connections, transparent pricing.",
    canonicalPath: '/properties',
    robots: 'index, follow',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Properties', path: '/properties' }
    ]
  },
  rentPage: {
    title: "Rental Properties & Apartments | TheNexopp",
    description: "Browse verified rental flats, independent houses, villas, and commercial spaces across India. Zero fake listings.",
    canonicalPath: '/properties/rent',
    robots: 'index, follow',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Properties', path: '/properties' },
      { name: 'Rent', path: '/properties/rent' }
    ]
  },
  sellPropertyPage: {
    title: "Sell Your Property Online | TheNexopp",
    description: "List your residential, commercial, or plot property on TheNexopp to reach verified buyers and investors across India.",
    canonicalPath: '/properties/sell',
    robots: 'index, follow',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Properties', path: '/properties' },
      { name: 'Sell Property', path: '/properties/sell' }
    ]
  },
  flatsPage: {
    title: "Flats & Apartments for Sale | TheNexopp",
    description: "Discover verified 2BHK, 3BHK, 4BHK flats and gated community apartments across prime locations in India.",
    canonicalPath: '/properties/flats',
    robots: 'index, follow',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Properties', path: '/properties' },
      { name: 'Flats & Apartments', path: '/properties/flats' }
    ]
  },
  villasPage: {
    title: "Villas for Sale | TheNexopp",
    description: "Explore verified luxury villas, duplexes, and private gated community residences with clear legal titles.",
    canonicalPath: '/properties/villas',
    robots: 'index, follow',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Properties', path: '/properties' },
      { name: 'Villas', path: '/properties/villas' }
    ]
  },
  housesPage: {
    title: "Independent Houses for Sale | TheNexopp",
    description: "Browse verified independent houses, row houses, and standalone residential homes across top Indian cities.",
    canonicalPath: '/properties/houses',
    robots: 'index, follow',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Properties', path: '/properties' },
      { name: 'Independent Houses', path: '/properties/houses' }
    ]
  },
  landPage: {
    title: "Plots & Lands for Sale | TheNexopp",
    description: "Buy verified land parcels, residential plots, and commercial development sites with clear title deeds.",
    canonicalPath: '/properties/lands',
    robots: 'index, follow',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Properties', path: '/properties' },
      { name: 'Plots & Lands', path: '/properties/lands' }
    ]
  },
  franchisePage: {
    title: "Franchises for Sale | TheNexopp",
    description: "Explore verified franchise opportunities across F&B, Retail, Healthcare, and Education in India. Transparent ROI and master rights.",
    canonicalPath: '/franchise',
    robots: 'index, follow',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Franchise', path: '/franchise' }
    ]
  },
  franchiseResales: {
    title: "Franchise Resales & Running Outlets | TheNexopp",
    description: "Acquire running, revenue-generating franchise outlets with established customer bases and operational staff.",
    canonicalPath: '/franchise/existing',
    robots: 'index, follow',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Franchise', path: '/franchise' },
      { name: 'Resales', path: '/franchise/existing' }
    ]
  },
  newFranchise: {
    title: "New Brand Franchises & Master Rights | TheNexopp",
    description: "Acquire new brand franchise territories and master rights with complete operational guidance.",
    canonicalPath: '/franchise/new',
    robots: 'index, follow',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Franchise', path: '/franchise' },
      { name: 'New Franchises', path: '/franchise/new' }
    ]
  },
  businessPage: {
    title: "Businesses for Sale | TheNexopp",
    description: "India's trusted marketplace to buy and sell verified operational businesses across retail, manufacturing, tech, and services.",
    canonicalPath: '/business',
    robots: 'index, follow',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Business', path: '/business' }
    ]
  },
  businessListings: {
    title: "Businesses for Sale | TheNexopp",
    description: "Review financial turnover, EBITDA, and asset valuations for verified businesses available for acquisition.",
    canonicalPath: '/business',
    robots: 'index, follow',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Business', path: '/business' }
    ]
  },
  sellBusinessPage: {
    title: "Sell Your Business Confidentially | TheNexopp",
    description: "Connect with high-net-worth individual buyers and corporate investors under strict confidentiality.",
    canonicalPath: '/business/sell',
    robots: 'index, follow',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Business', path: '/business' },
      { name: 'Sell Business', path: '/business/sell' }
    ]
  },
  financePage: {
    title: "Finance Solutions | TheNexopp",
    description: "Access tailored financial advisory, home loans, commercial credit, and asset protection insurance from top institutional partners.",
    canonicalPath: '/finance',
    robots: 'index, follow',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Finance', path: '/finance' }
    ]
  },
  loansPage: {
    title: "Home Loans & Business Acquisition Loans | TheNexopp",
    description: "Competitive real estate mortgage loans, commercial financing, and quick pre-approvals.",
    canonicalPath: '/finance/loans',
    robots: 'index, follow',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Finance', path: '/finance' },
      { name: 'Loans', path: '/finance/loans' }
    ]
  },
  insurancePage: {
    title: "Commercial & Asset Insurance | TheNexopp",
    description: "Asset protection insurance policies for commercial properties, high-value homes, and businesses.",
    canonicalPath: '/finance/insurance',
    robots: 'index, follow',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Finance', path: '/finance' },
      { name: 'Insurance', path: '/finance/insurance' }
    ]
  },
  financeServicePage: {
    title: "Financial & Due Diligence Advisory | TheNexopp",
    description: "Professional transactional due diligence, valuation, and legal structuring services.",
    canonicalPath: '/finance/advisory',
    robots: 'index, follow',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Finance', path: '/finance' },
      { name: 'Advisory', path: '/finance/advisory' }
    ]
  },
  aboutUsPage: {
    title: "About TheNexopp – India's Verified Asset Platform",
    description: "Learn about TheNexopp's mission, executive team, and innovative ecosystem for property, business, and franchise transactions.",
    canonicalPath: '/about',
    robots: 'index, follow',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'About Us', path: '/about' }
    ]
  },
  contactUsPage: {
    title: "Contact Us | TheNexopp",
    description: "Get in touch with TheNexopp acquisition team. Submit your property, franchise, or business requirement for personalized advisory.",
    canonicalPath: '/contact',
    robots: 'index, follow',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Contact Us', path: '/contact' }
    ]
  },
  wishlist: {
    title: "Saved Properties & Wishlist | TheNexopp",
    description: "View and manage your shortlisted properties, favorited businesses, and active site visit bookings.",
    canonicalPath: '/favourites',
    robots: 'noindex, follow'
  },
  enquiryPage: {
    title: "Inquire / Book a Visit | TheNexopp",
    description: "Schedule an in-person site visit or submit an executive price inquiry.",
    canonicalPath: '/contact',
    robots: 'noindex, follow'
  },
  bookSlotPage: {
    title: "Book a Property Visit Slot | TheNexopp",
    description: "Reserve a guaranteed inspection time with the verified property broker.",
    canonicalPath: '/contact',
    robots: 'noindex, follow'
  },
  closeDeal: {
    title: "Complete Acquisition & Close Deal | TheNexopp",
    description: "Direct settlement assistance, escrow coordination, and verified documentation.",
    canonicalPath: '/contact',
    robots: 'noindex, follow'
  },
  adminPortal: {
    title: "Management Console | TheNexopp",
    description: "Enterprise administration portal for listing management, dealer approvals, and customer analytics.",
    canonicalPath: '/admin',
    robots: 'noindex, nofollow'
  },
  notFound: {
    title: "404 - Page Not Found | TheNexopp",
    description: "The page you are looking for does not exist or has been moved. Explore our verified properties, franchises, and business opportunities.",
    canonicalPath: '/404',
    robots: 'noindex, follow'
  }
};

/**
 * Dynamically updates document metadata for SEO compliance with clean canonicalization (stripping filter params)
 */
export function updateSEO(pageKey: string, dynamicData?: { title?: string; description?: string; path?: string; image?: string }) {
  if (typeof document === 'undefined') return;

  const config = SEO_CONFIG[pageKey] || SEO_CONFIG.home;
  const title = dynamicData?.title || config.title;
  const description = dynamicData?.description || config.description;
  
  // Clean canonical path (strips query parameters like ?location=guntur&price=5000000)
  const rawPath = dynamicData?.path || config.canonicalPath;
  const cleanPath = rawPath.split('?')[0].split('#')[0];
  const canonicalUrl = `${PRIMARY_CANONICAL_DOMAIN}${cleanPath === '/' ? '/' : cleanPath}`;
  const image = dynamicData?.image || DEFAULT_IMAGE;
  const robots = config.robots || 'index, follow';

  // 1. Document Title
  document.title = title;

  // 2. Meta Description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', description);

  // 3. Robots Meta Tag
  let metaRobots = document.querySelector('meta[name="robots"]');
  if (!metaRobots) {
    metaRobots = document.createElement('meta');
    metaRobots.setAttribute('name', 'robots');
    document.head.appendChild(metaRobots);
  }
  metaRobots.setAttribute('content', robots);

  // 4. Canonical Link Tag (Standardized to PRIMARY_CANONICAL_DOMAIN)
  let linkCanonical = document.querySelector('link[rel="canonical"]');
  if (!linkCanonical) {
    linkCanonical = document.createElement('link');
    linkCanonical.setAttribute('rel', 'canonical');
    document.head.appendChild(linkCanonical);
  }
  linkCanonical.setAttribute('href', canonicalUrl);

  // 5. OpenGraph & Twitter Tags
  const setMetaTag = (attr: 'name' | 'property', attrValue: string, content: string) => {
    let tag = document.querySelector(`meta[${attr}="${attrValue}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute(attr, attrValue);
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
  };

  setMetaTag('property', 'og:title', title);
  setMetaTag('property', 'og:description', description);
  setMetaTag('property', 'og:url', canonicalUrl);
  setMetaTag('property', 'og:image', image);
  setMetaTag('name', 'twitter:title', title);
  setMetaTag('name', 'twitter:description', description);
  setMetaTag('name', 'twitter:image', image);
  setMetaTag('name', 'twitter:url', canonicalUrl);

  // 6. BreadcrumbList Structured Data (JSON-LD)
  if (config.breadcrumbs && config.breadcrumbs.length > 1) {
    let breadcrumbScript = document.getElementById('seo-breadcrumb-jsonld') as HTMLScriptElement | null;
    if (!breadcrumbScript) {
      breadcrumbScript = document.createElement('script');
      breadcrumbScript.id = 'seo-breadcrumb-jsonld';
      breadcrumbScript.type = 'application/ld+json';
      document.head.appendChild(breadcrumbScript);
    }
    breadcrumbScript.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": config.breadcrumbs.map((b, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "name": b.name,
        "item": `${PRIMARY_CANONICAL_DOMAIN}${b.path === '/' ? '/' : b.path}`
      }))
    });
  } else {
    const existing = document.getElementById('seo-breadcrumb-jsonld');
    if (existing) existing.remove();
  }

  // 7. Track page view in GA4 if configured
  trackPageView(cleanPath, title);
}
