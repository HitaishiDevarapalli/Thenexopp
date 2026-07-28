export interface Dealer {
  id: string;
  logo: string;
  photo: string;
  image?: string;
  companyName: string;
  company?: string;
  name?: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  premiumPartner: boolean;
  bestSeller: boolean;
  yearsExperience: number;
  responseTime: string;
  inventoryCount: number;
  coverage: { [city: string]: number };
  latitude: number;
  longitude: number;
  phone?: string;
  whatsapp?: string;
  email?: string;
  specialization?: string;
  languages?: string;
  reraNumber?: string;

  // Personal Information
  fullName?: string;
  mobileNumber?: string;
  dob?: string;
  gender?: 'Male' | 'Female' | 'Other';

  // Professional Information
  areasOfExpertise?: string[];

  // Property Categories
  propertyCategories?: string[]; // Flats, Apartments, Individual Houses, Villas, Residential Plots, Commercial Properties, Agricultural Lands, Farm Lands, Luxury Properties

  // Franchise Categories
  franchiseCategories?: string[]; // Food, Healthcare, Retail, Education, Automobile, Beauty, Technology, Existing Business, New Franchise

  // Service Areas
  serviceAreas?: {
    state: string;
    district: string;
    city: string;
    area: string;
    pincode?: string;
  }[];

  // Contact Information
  officeAddress?: string;
  googleMapsLink?: string;
  alternateMobile?: string;

  // Social Links
  socialLinks?: {
    website?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };

  // Performance Settings & Status
  featured?: boolean;
  status?: 'Active' | 'Inactive';

  // Leaderboard & Performance Stats
  totalPropertiesSold?: number;
  totalFranchiseDealsClosed?: number;
  revenueGenerated?: number; // In Crores or Lakhs e.g. 42.5 (Cr)
  successRate?: number; // percentage e.g. 96
  totalLeadsHandled?: number;

  // Premium Broker Management
  premiumStartDate?: string;
  premiumExpiryDate?: string;
  featuredHomepageListing?: boolean;
  highlightPremiumCards?: boolean;
  showPremiumBadge?: boolean;
  createdDate?: string;
}

export interface PropertyListing {
  id: string;
  dealerId: string;
  featured?: boolean;
  title: string;
  description: string;
  image: string;
  image2?: string;
  image3?: string;
  image4?: string;
  image5?: string;
  image6?: string;
  images?: string[];
  state: string;
  district: string;
  city: string;
  area: string;
  latitude: number;
  longitude: number;
  price: number;
  priceDisplay: string;
  category: 'Apartment' | 'Villa' | 'House' | 'Plot' | 'Commercial' | string;
  status: 'Buy' | 'Sell' | 'Rent' | string;
  areaSqFt: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  premium: boolean;
  trending: boolean;
  bestSeller: boolean;
  availabilityCount: number;
  trustScore: number;
  createdDate: string;
  listingStatus?: 'Draft' | 'Pending' | 'Published' | 'Hidden' | 'Reserved' | 'Sold' | 'Expired' | 'Archived';
  urgent?: boolean;
  luxury?: boolean;
  hotDeal?: boolean;
  topPick?: boolean;
  newArrival?: boolean;
  editorsChoice?: boolean;
  readyToMove?: boolean;
  underConstruction?: boolean;
  bedrooms?: number;
  bathrooms?: number;
  balconies?: number;
  floors?: number;
  facing?: string;
  ageYears?: number;
  furnishing?: string;
  parkingSlots?: number;
  amenities?: string[];
  imageUrl?: string;
  sqft?: string;
  builtUpArea?: string;
  agentName?: string;
  agentRating?: number;
  agentImage?: string;
  parking?: string;

  // Property Analytics (Admin Only)
  viewsCount?: number;
  uniqueVisitorsCount?: number;
  lastViewedAt?: string;

  // Property Management System Extensions
  propertyPurpose?: 'Sale' | 'Rent' | 'Lease';
  propertySubtype?: string;
  negotiable?: boolean;
  superBuiltUpArea?: string;
  carpetArea?: string;
  plotArea?: string;
  floorNumber?: number;
  totalFloors?: number;
  ownershipType?: string;

  // Detailed Location
  country?: string;
  locality?: string;
  landmark?: string;
  pincode?: string;
  postal_code?: string;
  fullAddress?: string;
  formatted_address?: string;
  google_place_id?: string;
  service_radius?: number; // in KM

  // Rich Media
  coverImage?: string;
  videoUrl?: string;
  virtualTourUrl?: string;
  floorPlanImages?: string[];
  masterPlanImage?: string;
  documentPdfs?: string[];
  galleryCaptions?: Record<string, string>;

  // Multi-Broker Assignment
  assignedBrokerIds?: string[];

  // Approval Workflow & Publishing
  approvalStatus?: 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected' | 'Published' | 'Archived' | 'Sold' | 'Reserved' | 'Available';
  reviewComments?: string[];
  scheduledPublishDate?: string;

  // Featured & Premium Management
  featuredDuration?: string;
  homepagePriority?: number;
  highlightPropertyCard?: boolean;
  sponsoredListing?: boolean;
  homepageBannerPlacement?: boolean;
  prioritySearchPlacement?: boolean;
  premiumStartDate?: string;
  premiumExpiryDate?: string;

  // SEO & Marketing
  seoTitle?: string;
  metaDescription?: string;
  urlSlug?: string;
  openGraphImage?: string;
  searchKeywords?: string[];
  marketingFlags?: {
    featureOnHomepage?: boolean;
    pushNotification?: boolean;
    emailCampaign?: boolean;
    socialMediaShare?: boolean;
  };

  // Main Page display flags
  showSoldOnHomepage?: boolean;
}

export interface FranchiseListing {
  id: string;
  brand: string;
  type: string;
  category?: string;
  investment: number;
  investmentDisplay: string;
  location: string;
  state: string;
  city: string;
  latitude: number;
  longitude: number;
  rating: number;
  reviewCount: number;
  verified: boolean;
  trending: boolean;
  availableBranchCount: number;
  image: string;
  images?: string[];
  logo: string;
  trustScore: number;
  dealerId?: string;

  // Granular Enterprise Fields
  franchiseCode?: string;
  opportunityType?: 'New Franchise' | 'Existing Business';
  status?: 'Active' | 'Closed' | 'Sold' | 'Investment Completed';
  shortDescription?: string;
  detailedDescription?: string;

  // Investment Details
  minInvestment?: number; // in Lakhs
  maxInvestment?: number; // in Lakhs
  franchiseFee?: string;
  securityDeposit?: string;
  workingCapital?: string;
  expectedRoi?: string;
  paybackPeriod?: string;
  profitMargin?: string;
  royaltyFee?: string;
  marketingFee?: string;

  // Business Information
  companyName?: string;
  yearEstablished?: number;
  existingOutletsCount?: number;
  totalFranchiseUnits?: number;
  brandRecognition?: 'Global' | 'National' | 'Regional' | 'Emerging';
  requiredExperience?: string;
  requiredStaff?: string;
  businessModel?: string;
  supportOffered?: string[];

  // Space Requirements
  minAreaSqFt?: number;
  maxAreaSqFt?: number;
  shopType?: 'High Street' | 'Mall' | 'Standalone' | 'Kiosk' | 'Any';
  floorPreference?: string;
  parkingRequirement?: string;

  // Location Hierarchy
  country?: string;
  district?: string;
  area?: string;
  pincode?: string;
  postal_code?: string;
  formatted_address?: string;
  fullAddress?: string;
  service_radius?: number;
  businessAddress?: string;
  googleMapsUrl?: string;

  // Media & Documents
  coverImage?: string;
  brandLogo?: string;
  videoUrls?: string[];
  promotionalVideoUrl?: string;
  brochurePdfUrl?: string;
  sampleAgreementUrl?: string;
  investmentPresentationUrl?: string;

  // Broker Assignment
  assignedBrokerIds?: string[];
  commissionRate?: string;

  // Approval Workflow
  approvalStatus?: 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected' | 'Published' | 'Archived' | 'Closed';
  reviewNotes?: string;

  // Featured & Premium Control
  featured?: boolean;
  featuredDuration?: string;
  homepagePriority?: number;
  highlightCard?: boolean;
  premiumFranchise?: boolean;
  sponsoredListing?: boolean;
  validityDate?: string;

  // SEO & Marketing
  seoTitle?: string;
  metaDescription?: string;
  urlSlug?: string;
  keywords?: string[];
  openGraphImage?: string;

  createdDate?: string;
}

export interface FranchiseEnquiry {
  id: string;
  franchiseId?: string;
  customerName: string;
  mobileNumber: string;
  email: string;
  interestedFranchise: string;
  investmentBudget: string;
  preferredLocation: string;
  assignedBrokerId?: string;
  assignedBrokerName?: string;
  status: 'New' | 'Contacted' | 'Meeting Scheduled' | 'Proposal Sent' | 'Negotiation' | 'Closed' | 'Lost';
  date?: string;
  createdDate?: string;
}


export interface BusinessListing {
  id: string;
  name: string;
  title?: string;
  industry: string;
  location: string;
  state: string;
  city: string;
  latitude: number;
  longitude: number;
  price: number;
  priceDisplay: string;
  revenueMonthly: string;
  profitMonthly: string;
  establishedYear: number;
  employeesCount: number;
  rating: number;
  reviewCount: number;
  verified: boolean;
  trending: boolean;
  image: string;
  description: string;
  reasonForSale: string;
  trustScore: number;
  revenue?: string;
  sellerProfile?: string;
}

export interface InsuranceProvider {
  id: string;
  name: string;
  category: string;
  coverageAmount: string;
  claimProcess: string;
  premiumStartingPrice: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  logo: string;
  state: string;
  city: string;
}

export interface ServiceProvider {
  id: string;
  name: string;
  category: string;
  experience: number;
  rating: number;
  reviewCount: number;
  verified: boolean;
  photo: string;
  state: string;
  city: string;
}

export interface CustomerEnquiry {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  listingTitle: string;
  brokerName: string;
  status: 'New' | 'Contacted' | 'Follow-up' | 'Closed';
  priority: 'High' | 'Medium' | 'Low';
  source: string;
  date: string;
  name?: string;
  interest?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  designation: string;
  photo: string;
  phone?: string;
  email?: string;
  linkedin?: string;
}

export interface EmployeeUser {
  id: string;
  fullName: string;
  email: string;
  password: string;
  role: string;
  status: 'Active' | 'Suspended';
  createdAt: string;
  customPermissions?: string[];
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export interface MainPageStats {
  propertiesListed: string;
  franchisesCount: string;
  verifiedBrokers: string;
  citiesCovered: string;
  totalPropertyValue: string;
  happyClients: string;
  activeListingsWhy?: string;
  happyCustomersWhy?: string;
  citiesCoveredWhy?: string;
  verifiedListingsWhy?: string;
  customerSupportWhy?: string;
}

export interface SiteSettings {
  heroTitle: string;
  heroHighlightText?: string;
  heroSubtitle: string;
  heroBgUrl: string;
  heroMediaType?: 'image' | 'video';
  heroVideoUrl?: string;
  heroPopularTags?: string[];
  heroBadge1Text?: string;
  heroBadge2Text?: string;
  primaryColor: string;
  themeStyle: 'light-luxury' | 'gold-royal' | 'professional-white-green';
  analytics: {
    activeListings: number;
    happyClients: number;
    dealsClosed: number;
    totalVisitors: number;
  };
  availableCities?: string[];
  defaultCity?: string;
  promotionalVideoUrl?: string;
  mainPageStats?: MainPageStats;
}

export interface DemandRegion {
  id: string;
  name: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  radius: number;
  demandScore: number;
  demandLevel: 'High' | 'Medium' | 'Low';
  propertySalesCount: number;
  franchiseSalesCount: number;
  businessSalesCount: number;
  lastUpdated: string;
  isAiEnabled: boolean;
  manualOverrideLevel?: 'High' | 'Medium' | 'Low' | null;
}

const defaultDealers: Dealer[] = [];

const sampleTeamMembers: TeamMember[] = [];
const sampleDealers: Dealer[] = defaultDealers;
const sampleProperties: PropertyListing[] = [];
const sampleFranchises: FranchiseListing[] = [];
const sampleBusinesses: BusinessListing[] = [];
const sampleFranchiseEnquiries: FranchiseEnquiry[] = [];

const defaultSettings: SiteSettings = {
  heroTitle: "Your Next Opportunity",
  heroHighlightText: "One Click Away",
  heroSubtitle: "India's Premier Integrated Portal for Luxury Properties, Enterprise Franchises & Acquisitions.",
  heroBgUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  heroMediaType: "image",
  heroVideoUrl: "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-building-exterior-41580-large.mp4",
  heroPopularTags: ['Apartment', 'Villa', 'Franchise', 'Commercial Property'],
  heroBadge1Text: "View More Pics",
  heroBadge2Text: "Verified Genuine Listings",
  primaryColor: "#10B981",
  themeStyle: "professional-white-green",
  analytics: {
    activeListings: 12,
    happyClients: 180,
    dealsClosed: 45,
    totalVisitors: 14500
  },
  availableCities: ['Hyderabad', 'Bengaluru', 'Mumbai', 'Delhi NCR', 'Chennai', 'Pune'],
  defaultCity: 'Hyderabad',
  promotionalVideoUrl: "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-building-exterior-41580-large.mp4",
  mainPageStats: {
    propertiesListed: '18,500+',
    franchisesCount: '950+',
    verifiedBrokers: '2,400+',
    citiesCovered: '32',
    totalPropertyValue: '₹850 Cr+',
    happyClients: '15K+',
    activeListingsWhy: '10,000+',
    happyCustomersWhy: '5,000+',
    citiesCoveredWhy: '50+',
    verifiedListingsWhy: '100%',
    customerSupportWhy: '24/7'
  }
};

// Exported Reactive Data Variables
export let dealersDb: Dealer[] = [];
export let propertiesDb: PropertyListing[] = [];
export let franchiseDb: FranchiseListing[] = [];
export let businessDb: BusinessListing[] = [];
export let insuranceDb: InsuranceProvider[] = [];
export let servicesDb: ServiceProvider[] = [];
export let enquiriesDb: CustomerEnquiry[] = [];
export let franchiseEnquiriesDb: FranchiseEnquiry[] = [];
export let siteSettingsDb: SiteSettings = defaultSettings;
export let teamMembersDb: TeamMember[] = [];
export let employeeUsersDb: EmployeeUser[] = [];
export let rolesDb: Role[] = [];
export let demandRegionsDb: DemandRegion[] = [];

export interface ShowcaseVideo {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string;
  linkedCategory: 'Property' | 'Franchise' | 'Business' | 'None';
  linkedId?: string;
  title: string;
  displayOrder: number;
  status: 'Active' | 'Inactive';
  autoplayDuration?: number;
  createdDate: string;
}

export interface ShowcaseSettings {
  maxVideoSizeMB: number;
  maxVideoDurationSec: number;
  defaultPlaybackDurationSec: number;
}

export let showcaseVideosDb: ShowcaseVideo[] = [];
export let showcaseSettingsDb: ShowcaseSettings = {
  maxVideoSizeMB: 200,
  maxVideoDurationSec: 60,
  defaultPlaybackDurationSec: 10
};

const defaultShowcaseVideos: ShowcaseVideo[] = [
  {
    id: 'sv1',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-modern-villa-with-a-swimming-pool-42526-large.mp4',
    title: 'Luxury Villa Showcase',
    linkedCategory: 'None',
    displayOrder: 1,
    status: 'Active',
    createdDate: new Date().toLocaleDateString()
  },
  {
    id: 'sv2',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-office-building-glass-facade-reflecting-the-sky-40439-large.mp4',
    title: 'Commercial Business Center',
    linkedCategory: 'None',
    displayOrder: 2,
    status: 'Active',
    createdDate: new Date().toLocaleDateString()
  },
  {
    id: 'sv3',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-typing-on-a-laptop-42171-large.mp4',
    title: 'Modern Workspaces & Offices',
    linkedCategory: 'None',
    displayOrder: 3,
    status: 'Active',
    createdDate: new Date().toLocaleDateString()
  },
  {
    id: 'sv4',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-chef-preparing-a-fresh-vegetable-salad-41617-large.mp4',
    title: 'Premium Restaurant Opportunities',
    linkedCategory: 'None',
    displayOrder: 4,
    status: 'Active',
    createdDate: new Date().toLocaleDateString()
  },
  {
    id: 'sv5',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-shopping-in-a-clothing-store-42323-large.mp4',
    title: 'Retail Shops & Showrooms',
    linkedCategory: 'None',
    displayOrder: 5,
    status: 'Active',
    createdDate: new Date().toLocaleDateString()
  }
];


const defaultDemandRegions: DemandRegion[] = [
  {
    id: 'dr1',
    name: 'Jubilee Hills',
    city: 'Hyderabad',
    state: 'Telangana',
    latitude: 17.4300,
    longitude: 78.4000,
    radius: 5,
    demandScore: 85,
    demandLevel: 'High',
    propertySalesCount: 12,
    franchiseSalesCount: 4,
    businessSalesCount: 2,
    lastUpdated: new Date().toLocaleDateString(),
    isAiEnabled: true
  },
  {
    id: 'dr2',
    name: 'Koramangala',
    city: 'Bengaluru',
    state: 'Karnataka',
    latitude: 12.9300,
    longitude: 77.6200,
    radius: 5,
    demandScore: 78,
    demandLevel: 'High',
    propertySalesCount: 15,
    franchiseSalesCount: 6,
    businessSalesCount: 1,
    lastUpdated: new Date().toLocaleDateString(),
    isAiEnabled: true
  },
  {
    id: 'dr3',
    name: 'Bandra West',
    city: 'Mumbai',
    state: 'Maharashtra',
    latitude: 19.0500,
    longitude: 72.8200,
    radius: 2,
    demandScore: 92,
    demandLevel: 'High',
    propertySalesCount: 18,
    franchiseSalesCount: 8,
    businessSalesCount: 3,
    lastUpdated: new Date().toLocaleDateString(),
    isAiEnabled: true
  },
  {
    id: 'dr4',
    name: 'Gachibowli',
    city: 'Hyderabad',
    state: 'Telangana',
    latitude: 17.4400,
    longitude: 78.3400,
    radius: 5,
    demandScore: 55,
    demandLevel: 'Medium',
    propertySalesCount: 6,
    franchiseSalesCount: 2,
    businessSalesCount: 0,
    lastUpdated: new Date().toLocaleDateString(),
    isAiEnabled: true
  },
  {
    id: 'dr5',
    name: 'Whitefield',
    city: 'Bengaluru',
    state: 'Karnataka',
    latitude: 12.9600,
    longitude: 77.7500,
    radius: 10,
    demandScore: 48,
    demandLevel: 'Medium',
    propertySalesCount: 8,
    franchiseSalesCount: 1,
    businessSalesCount: 1,
    lastUpdated: new Date().toLocaleDateString(),
    isAiEnabled: true
  }
];


// Reactive Selected City State
export let selectedCity: string = localStorage.getItem('nexopp_selected_city') || 'Hyderabad';
export const setSelectedCity = (city: string) => {
  selectedCity = city;
  localStorage.setItem('nexopp_selected_city', city);
  window.dispatchEvent(new CustomEvent('nexopp_data_changed'));
};

// Load from LocalStorage
const loadData = () => {
  try {
    if (localStorage.getItem('nexopp_wiped_fake_data_v11_all') !== 'true') {
      localStorage.removeItem('nexopp_properties');
      localStorage.removeItem('nexopp_franchises');
      localStorage.removeItem('nexopp_dealers');
      localStorage.removeItem('nexopp_enquiries');
      localStorage.removeItem('nexopp_franchise_enquiries');
      localStorage.removeItem('nexopp_team_members');
      localStorage.removeItem('nexopp_businesses');
      localStorage.removeItem('nexopp_employee_users');
      localStorage.setItem('nexopp_wiped_fake_data_v11_all', 'true');
    }

    const p = localStorage.getItem('nexopp_properties');
    const f = localStorage.getItem('nexopp_franchises');
    const d = localStorage.getItem('nexopp_dealers');
    const e = localStorage.getItem('nexopp_enquiries');
    const fe = localStorage.getItem('nexopp_franchise_enquiries');
    const s = localStorage.getItem('nexopp_settings');
    const t = localStorage.getItem('nexopp_team_members');
    const b = localStorage.getItem('nexopp_businesses');
    const dr = localStorage.getItem('nexopp_demand_regions');
    const sv = localStorage.getItem('nexopp_showcase_videos');
    const ss = localStorage.getItem('nexopp_showcase_settings');
    const eu = localStorage.getItem('nexopp_employee_users');
    const rd = localStorage.getItem('nexopp_roles');

    propertiesDb = p ? JSON.parse(p) : [];
    franchiseDb = f ? JSON.parse(f) : [];
    businessDb = b ? JSON.parse(b) : [];
    dealersDb = d ? JSON.parse(d) : [];
    if (!dealersDb || dealersDb.length === 0) {
      dealersDb = defaultDealers;
    }
    enquiriesDb = e ? JSON.parse(e) : [];
    franchiseEnquiriesDb = fe ? JSON.parse(fe) : [];
    siteSettingsDb = s ? JSON.parse(s) : defaultSettings;
    teamMembersDb = t ? JSON.parse(t) : [];
    employeeUsersDb = eu ? JSON.parse(eu) : [];
    
    // Default roles if none exist
    rolesDb = rd ? JSON.parse(rd) : [
      { id: 'r1', name: 'Super Admin', permissions: ['all'] },
      { id: 'r2', name: 'Property Editor', permissions: ['properties'] },
      { id: 'r3', name: 'Franchise Editor', permissions: ['franchises'] },
      { id: 'r4', name: 'Data Manager', permissions: ['properties', 'franchises', 'businesses', 'demand_regions', 'brokers'] },
      { id: 'r5', name: 'Photo Manager', permissions: ['media_manager'] }
    ];

    demandRegionsDb = dr ? JSON.parse(dr) : defaultDemandRegions;
    showcaseVideosDb = sv ? JSON.parse(sv) : defaultShowcaseVideos;
    showcaseSettingsDb = ss ? JSON.parse(ss) : {
      maxVideoSizeMB: 200,
      maxVideoDurationSec: 60,
      defaultPlaybackDurationSec: 10
    };

    if (siteSettingsDb.primaryColor === '#D4AF37') {
      siteSettingsDb.primaryColor = '#10B981';
    }
    if (!siteSettingsDb.availableCities || !siteSettingsDb.availableCities.includes('Guntur')) {
      siteSettingsDb.availableCities = ['Guntur', 'Vijayawada', 'Hyderabad', 'Visakhapatnam', 'Bengaluru', 'Mumbai', 'Delhi NCR', 'Chennai', 'Pune'];
    }
    if (!siteSettingsDb.promotionalVideoUrl) {
      siteSettingsDb.promotionalVideoUrl = "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-building-exterior-41580-large.mp4";
    }
    if (!siteSettingsDb.heroHighlightText) {
      siteSettingsDb.heroHighlightText = "One Click Away";
    }
    if (!siteSettingsDb.heroMediaType) {
      siteSettingsDb.heroMediaType = "image";
    }
    if (!siteSettingsDb.heroVideoUrl) {
      siteSettingsDb.heroVideoUrl = "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-building-exterior-41580-large.mp4";
    }
    if (!siteSettingsDb.heroPopularTags || siteSettingsDb.heroPopularTags.length === 0) {
      siteSettingsDb.heroPopularTags = ['Apartment', 'Villa', 'Franchise', 'Commercial Property'];
    }
    if (!siteSettingsDb.heroBadge1Text) {
      siteSettingsDb.heroBadge1Text = "View More Pics";
    }
    if (!siteSettingsDb.heroBadge2Text) {
      siteSettingsDb.heroBadge2Text = "Verified Genuine Listings";
    }
    if (!siteSettingsDb.mainPageStats) {
      siteSettingsDb.mainPageStats = defaultSettings.mainPageStats;
    }
    insuranceDb = [];
    servicesDb = [];
  } catch (err) {
    console.error("Error loading marketplace data from localStorage:", err);
    propertiesDb = [];
    franchiseDb = [];
    dealersDb = [];
    enquiriesDb = [];
    franchiseEnquiriesDb = [];
    siteSettingsDb = defaultSettings;
    teamMembersDb = [];
    showcaseVideosDb = defaultShowcaseVideos;
    showcaseSettingsDb = {
      maxVideoSizeMB: 200,
      maxVideoDurationSec: 60,
      defaultPlaybackDurationSec: 10
    };
  }
};

// Save to LocalStorage and Notify App
export const notifyDataChanged = () => {
  try {
    localStorage.setItem('nexopp_properties', JSON.stringify(propertiesDb));
    localStorage.setItem('nexopp_franchises', JSON.stringify(franchiseDb));
    localStorage.setItem('nexopp_businesses', JSON.stringify(businessDb));
    localStorage.setItem('nexopp_dealers', JSON.stringify(dealersDb));
    localStorage.setItem('nexopp_enquiries', JSON.stringify(enquiriesDb));
    localStorage.setItem('nexopp_franchise_enquiries', JSON.stringify(franchiseEnquiriesDb));
    localStorage.setItem('nexopp_settings', JSON.stringify(siteSettingsDb));
    localStorage.setItem('nexopp_team_members', JSON.stringify(teamMembersDb));
    localStorage.setItem('nexopp_employee_users', JSON.stringify(employeeUsersDb));
    localStorage.setItem('nexopp_roles', JSON.stringify(rolesDb));
    localStorage.setItem('nexopp_demand_regions', JSON.stringify(demandRegionsDb));
    localStorage.setItem('nexopp_showcase_videos', JSON.stringify(showcaseVideosDb));
    localStorage.setItem('nexopp_showcase_settings', JSON.stringify(showcaseSettingsDb));
    window.dispatchEvent(new Event('nexopp_data_changed'));
  } catch (err) {
    console.error("Error saving data to localStorage:", err);
  }
};

// Initialize immediately on module load
loadData();

// Mutations
export const addProperty = (item: PropertyListing) => {
  propertiesDb = [item, ...propertiesDb];
  notifyDataChanged();
  fetch('http://localhost:8081/api/properties', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  }).catch(err => console.error("Sync failed:", err));
};

export const updateProperty = (id: string, updated: Partial<PropertyListing>) => {
  propertiesDb = propertiesDb.map(p => p.id === id ? { ...p, ...updated } : p);
  notifyDataChanged();
  fetch(`http://localhost:8081/api/properties/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated)
  }).catch(err => console.error("Sync failed:", err));
};

export const deleteProperty = (id: string) => {
  propertiesDb = propertiesDb.filter(p => p.id !== id);
  showcaseVideosDb = showcaseVideosDb.filter(v => !(v.linkedCategory === 'Property' && v.linkedId === id));
  notifyDataChanged();
  fetch(`http://localhost:8081/api/properties/${id}`, {
    method: 'DELETE'
  }).catch(err => console.error("Sync failed:", err));
};

export const updatePropertyVerification = (id: string, verified: boolean) => {
  updateProperty(id, { verified });
};

export const togglePropertyFeatured = (id: string) => {
  const item = propertiesDb.find(p => p.id === id);
  if (item) updateProperty(id, { premium: !item.premium });
};

export const togglePropertyTrending = (id: string) => {
  const item = propertiesDb.find(p => p.id === id);
  if (item) updateProperty(id, { trending: !item.trending });
};

export const incrementPropertyViewCount = (id: string) => {
  const prop = propertiesDb.find(p => p.id === id);
  if (!prop) return;
  
  const currentViews = prop.viewsCount || 0;
  const currentUniques = prop.uniqueVisitorsCount || Math.max(1, Math.floor(currentViews * 0.75));
  
  const sessionKey = `viewed_prop_${id}`;
  const isNewVisitor = !sessionStorage.getItem(sessionKey);
  if (isNewVisitor) {
    sessionStorage.setItem(sessionKey, 'true');
  }

  const updatedViews = currentViews + 1;
  const updatedUniques = isNewVisitor ? currentUniques + 1 : currentUniques;
  const nowFormatted = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  updateProperty(id, {
    viewsCount: updatedViews,
    uniqueVisitorsCount: updatedUniques,
    lastViewedAt: nowFormatted
  });
};

export const addFranchise = (item: FranchiseListing) => {
  franchiseDb = [item, ...franchiseDb];
  notifyDataChanged();
};

export const updateFranchise = (id: string, updated: Partial<FranchiseListing>) => {
  franchiseDb = franchiseDb.map(f => f.id === id ? { ...f, ...updated } : f);
  notifyDataChanged();
};

export const deleteFranchise = (id: string) => {
  franchiseDb = franchiseDb.filter(f => f.id !== id);
  showcaseVideosDb = showcaseVideosDb.filter(v => !(v.linkedCategory === 'Franchise' && v.linkedId === id));
  notifyDataChanged();
};

export const addDealer = (item: Dealer) => {
  dealersDb = [item, ...dealersDb];
  notifyDataChanged();
};

export const updateDealer = (id: string, updated: Partial<Dealer>) => {
  dealersDb = dealersDb.map(d => d.id === id ? { ...d, ...updated } : d);
  notifyDataChanged();
};

export const deleteDealer = (id: string) => {
  dealersDb = dealersDb.filter(d => d.id !== id);
  notifyDataChanged();
};

export const addBusiness = (item: BusinessListing) => {
  businessDb = [item, ...businessDb];
  notifyDataChanged();
};

export const deleteBusiness = (id: string) => {
  businessDb = businessDb.filter(b => b.id !== id);
  showcaseVideosDb = showcaseVideosDb.filter(v => !(v.linkedCategory === 'Business' && v.linkedId === id));
  notifyDataChanged();
};

// Showcase Video Mutations
export const addShowcaseVideo = (video: Omit<ShowcaseVideo, 'id' | 'createdDate'>) => {
  const newVideo: ShowcaseVideo = {
    ...video,
    id: 'sv_' + Date.now(),
    createdDate: new Date().toLocaleDateString()
  };
  showcaseVideosDb = [...showcaseVideosDb, newVideo];
  notifyDataChanged();
};

export const updateShowcaseVideo = (id: string, updated: Partial<ShowcaseVideo>) => {
  showcaseVideosDb = showcaseVideosDb.map(v => v.id === id ? { ...v, ...updated } : v);
  notifyDataChanged();
};

export const deleteShowcaseVideo = (id: string) => {
  showcaseVideosDb = showcaseVideosDb.filter(v => v.id !== id);
  notifyDataChanged();
};

export const updateShowcaseSettings = (updated: Partial<ShowcaseSettings>) => {
  showcaseSettingsDb = { ...showcaseSettingsDb, ...updated };
  notifyDataChanged();
};

export const deleteEnquiry = (id: string) => {
  enquiriesDb = enquiriesDb.filter(e => e.id !== id);
  notifyDataChanged();
};

export const updateEnquiryStatus = (id: string, status: 'New' | 'Contacted' | 'Follow-up' | 'Closed') => {
  enquiriesDb = enquiriesDb.map(e => e.id === id ? { ...e, status } : e);
  notifyDataChanged();
};

export const updateSiteSettings = (settings: Partial<SiteSettings>) => {
  siteSettingsDb = { ...siteSettingsDb, ...settings };
  notifyDataChanged();
};

export const clearAllStaticData = () => {
  propertiesDb = [];
  franchiseDb = [];
  dealersDb = [];
  enquiriesDb = [];
  franchiseEnquiriesDb = [];
  teamMembersDb = [];
  notifyDataChanged();
};

export const bulkPublishProperties = (ids: string[]) => {
  propertiesDb = propertiesDb.map(p => ids.includes(p.id) ? { ...p, listingStatus: 'Published' } : p);
  notifyDataChanged();
};

export const bulkHideProperties = (ids: string[]) => {
  propertiesDb = propertiesDb.map(p => ids.includes(p.id) ? { ...p, listingStatus: 'Hidden' } : p);
  notifyDataChanged();
};

export const bulkDeleteProperties = (ids: string[]) => {
  propertiesDb = propertiesDb.filter(p => !ids.includes(p.id));
  notifyDataChanged();
};

export const addTeamMember = (item: TeamMember) => {
  teamMembersDb = [item, ...teamMembersDb];
  notifyDataChanged();
};

export const updateTeamMember = (id: string, updated: Partial<TeamMember>) => {
  teamMembersDb = teamMembersDb.map(m => m.id === id ? { ...m, ...updated } : m);
  notifyDataChanged();
};

export const deleteTeamMember = (id: string) => {
  teamMembersDb = teamMembersDb.filter(m => m.id !== id);
  notifyDataChanged();
};

export const addEmployeeUser = (item: EmployeeUser) => {
  employeeUsersDb = [item, ...employeeUsersDb];
  notifyDataChanged();
};

export const updateEmployeeUser = (id: string, updated: Partial<EmployeeUser>) => {
  employeeUsersDb = employeeUsersDb.map(u => u.id === id ? { ...u, ...updated } : u);
  notifyDataChanged();
};

export const deleteEmployeeUser = (id: string) => {
  employeeUsersDb = employeeUsersDb.filter(u => u.id !== id);
  notifyDataChanged();
};

export const updateRole = (id: string, permissions: string[]) => {
  rolesDb = rolesDb.map(r => r.id === id ? { ...r, permissions } : r);
  notifyDataChanged();
};

export const addRole = (role: Role) => {
  rolesDb = [...rolesDb, role];
  notifyDataChanged();
};

export const deleteRole = (id: string) => {
  rolesDb = rolesDb.filter(r => r.id !== id);
  notifyDataChanged();
};

export const addFranchiseEnquiry = (item: FranchiseEnquiry) => {
  franchiseEnquiriesDb = [item, ...franchiseEnquiriesDb];
  notifyDataChanged();
};

export const updateFranchiseEnquiryStatus = (id: string, status: FranchiseEnquiry['status']) => {
  franchiseEnquiriesDb = franchiseEnquiriesDb.map(e => e.id === id ? { ...e, status } : e);
  notifyDataChanged();
};

export const assignFranchiseEnquiryBroker = (id: string, brokerId: string, brokerName: string) => {
  franchiseEnquiriesDb = franchiseEnquiriesDb.map(e => e.id === id ? { ...e, assignedBrokerId: brokerId, assignedBrokerName: brokerName } : e);
  notifyDataChanged();
};

export const deleteFranchiseEnquiry = (id: string) => {
  franchiseEnquiriesDb = franchiseEnquiriesDb.filter(e => e.id !== id);
  notifyDataChanged();
};

export const bulkPublishFranchises = (ids: string[]) => {
  franchiseDb = franchiseDb.map(f => ids.includes(f.id) ? { ...f, approvalStatus: 'Published', status: 'Active' } : f);
  notifyDataChanged();
};

export const bulkArchiveFranchises = (ids: string[]) => {
  franchiseDb = franchiseDb.map(f => ids.includes(f.id) ? { ...f, approvalStatus: 'Archived' } : f);
  notifyDataChanged();
};

export const bulkDeleteFranchises = (ids: string[]) => {
  franchiseDb = franchiseDb.filter(f => !ids.includes(f.id));
  notifyDataChanged();
};

export const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in KM
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const calculateDemandScore = (region: DemandRegion): { score: number; level: 'High' | 'Medium' | 'Low'; propSales: number; franSales: number; busSales: number } => {
  if (!region.isAiEnabled && region.manualOverrideLevel) {
    const level = region.manualOverrideLevel;
    const score = level === 'High' ? 85 : (level === 'Medium' ? 50 : 15);
    return { score, level, propSales: region.propertySalesCount, franSales: region.franchiseSalesCount, busSales: region.businessSalesCount };
  }

  let propSales = 0;
  let activeProps = 0;
  propertiesDb.forEach(p => {
    if (p.latitude && p.longitude) {
      const dist = getDistance(region.latitude, region.longitude, p.latitude, p.longitude);
      if (dist <= region.radius) {
        if (p.approvalStatus === 'Sold') {
          propSales++;
        } else {
          activeProps++;
        }
      }
    }
  });

  let franSales = 0;
  let activeFrans = 0;
  franchiseDb.forEach(f => {
    if (f.latitude && f.longitude) {
      const dist = getDistance(region.latitude, region.longitude, f.latitude, f.longitude);
      if (dist <= region.radius) {
        if (f.status === 'Sold' || f.approvalStatus === 'Closed') {
          franSales++;
        } else {
          activeFrans++;
        }
      }
    }
  });

  let busSales = 0;
  let activeBuses = 0;
  businessDb.forEach(b => {
    if (b.latitude && b.longitude) {
      const dist = getDistance(region.latitude, region.longitude, b.latitude, b.longitude);
      if (dist <= region.radius) {
        // BusinessListing does not have status/approvalStatus. Treat all matched businesses as active
        activeBuses++;
      }
    }
  });

  const totalSales = propSales + franSales + busSales;
  const totalActive = activeProps + activeFrans + activeBuses;
  
  let score = 25 + (totalSales * 15) + (totalActive * 3);
  if (score > 100) score = 100;
  if (score < 0) score = 0;

  let level: 'High' | 'Medium' | 'Low' = 'Low';
  if (score > 70) level = 'High';
  else if (score > 30) level = 'Medium';

  return { score: Math.round(score), level, propSales, franSales, busSales };
};

export const recalculateAllDemandRegions = () => {
  demandRegionsDb = demandRegionsDb.map(r => {
    const calc = calculateDemandScore(r);
    return {
      ...r,
      demandScore: calc.score,
      demandLevel: calc.level,
      propertySalesCount: calc.propSales,
      franchiseSalesCount: calc.franSales,
      businessSalesCount: calc.busSales,
      lastUpdated: new Date().toLocaleDateString()
    };
  });
  notifyDataChanged();
};

export const addDemandRegion = (item: Omit<DemandRegion, 'id' | 'demandScore' | 'demandLevel' | 'propertySalesCount' | 'franchiseSalesCount' | 'businessSalesCount' | 'lastUpdated'>) => {
  const newId = 'dr_' + Date.now();
  const tempRegion: DemandRegion = {
    ...item,
    id: newId,
    demandScore: 0,
    demandLevel: 'Low',
    propertySalesCount: 0,
    franchiseSalesCount: 0,
    businessSalesCount: 0,
    lastUpdated: new Date().toLocaleDateString()
  };
  const calc = calculateDemandScore(tempRegion);
  const finalRegion = {
    ...tempRegion,
    demandScore: calc.score,
    demandLevel: calc.level,
    propertySalesCount: calc.propSales,
    franchiseSalesCount: calc.franSales,
    businessSalesCount: calc.busSales
  };
  demandRegionsDb = [finalRegion, ...demandRegionsDb];
  notifyDataChanged();
};

export const updateDemandRegion = (id: string, updated: Partial<DemandRegion>) => {
  demandRegionsDb = demandRegionsDb.map(r => {
    if (r.id === id) {
      const merged = { ...r, ...updated };
      const calc = calculateDemandScore(merged);
      return {
        ...merged,
        demandScore: calc.score,
        demandLevel: calc.level,
        propertySalesCount: calc.propSales,
        franchiseSalesCount: calc.franSales,
        businessSalesCount: calc.busSales,
        lastUpdated: new Date().toLocaleDateString()
      };
    }
    return r;
  });
  notifyDataChanged();
};

export const deleteDemandRegion = (id: string) => {
  demandRegionsDb = demandRegionsDb.filter(r => r.id !== id);
  notifyDataChanged();
};
