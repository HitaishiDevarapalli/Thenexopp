export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL !== undefined
    ? import.meta.env.VITE_API_BASE_URL
    : (import.meta.env.DEV ? 'http://localhost:8081' : '')
).replace(/\/$/, '');

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

  city?: string;
  state?: string;
  district?: string;

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
  cityId?: string;
  areaId?: string;
  localityId?: string;
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
  sold?: boolean;
  soldDate?: string;
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
  customFields?: { label: string; value: string }[];

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
  askingPrice?: number;
  priceDisplay: string;
  revenueMonthly: string;
  profitMonthly: string;
  establishedYear: number;
  employeesCount: number | string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  trending: boolean;
  image: string;
  imageUrl?: string;
  description: string;
  reasonForSale: string;
  trustScore: number;
  revenue?: string;
  sellerProfile?: string;
  category?: string;
  businessType?: string;
  published?: boolean;
  featured?: boolean;
  status?: string;  // 'Available' | 'Sold' | 'Unavailable' | 'Under_Review'
  updatedAt?: string;
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
  message?: string;
  notes?: string;
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
  showFranchiseSection?: boolean;
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
  heroTitle: '',
  heroHighlightText: '',
  heroSubtitle: '',
  heroBgUrl: '',
  heroMediaType: 'image',
  heroVideoUrl: '',
  heroPopularTags: [],
  heroBadge1Text: '',
  heroBadge2Text: '',
  primaryColor: '#10B981',
  themeStyle: 'professional-white-green',
  analytics: {
    activeListings: 0,
    happyClients: 0,
    dealsClosed: 0,
    totalVisitors: 0
  },
  availableCities: [],
  defaultCity: '',
  promotionalVideoUrl: '',
  showFranchiseSection: true,
  mainPageStats: {
    propertiesListed: '0',
    franchisesCount: '0',
    verifiedBrokers: '0',
    citiesCovered: '0',
    totalPropertyValue: '₹0',
    happyClients: '0',
    activeListingsWhy: '0',
    happyCustomersWhy: '0',
    citiesCoveredWhy: '0',
    verifiedListingsWhy: '0',
    customerSupportWhy: '0'
  }
};

export interface AdminModuleItem {
  id: string;
  label: string;
  category: 'CONTENT MANAGEMENT' | 'USER MANAGEMENT' | 'SITE MANAGEMENT';
  isActive: boolean;
  custom?: boolean;
}

export const defaultAdminModules: AdminModuleItem[] = [
  { id: 'properties', label: 'Property Management', category: 'CONTENT MANAGEMENT', isActive: true },
  { id: 'franchises', label: 'Franchise Management', category: 'CONTENT MANAGEMENT', isActive: true },
  { id: 'business', label: 'Business Management', category: 'CONTENT MANAGEMENT', isActive: true },
  { id: 'demand_regions', label: 'Demand Regions', category: 'CONTENT MANAGEMENT', isActive: true },
  { id: 'master_filters', label: 'Filters & Categories Control', category: 'CONTENT MANAGEMENT', isActive: true },
  { id: 'brokers', label: 'Broker Management', category: 'USER MANAGEMENT', isActive: true },
  { id: 'users_data', label: 'User Management', category: 'USER MANAGEMENT', isActive: true },
  { id: 'team_members', label: 'Team Members', category: 'USER MANAGEMENT', isActive: true },
  { id: 'roles_permissions', label: 'Roles & Permissions', category: 'USER MANAGEMENT', isActive: true },
  { id: 'ai_assistant', label: 'AI Assistant', category: 'SITE MANAGEMENT', isActive: true },
  { id: 'main_page_settings', label: 'Main Page Settings', category: 'SITE MANAGEMENT', isActive: true },
];

// Storage helpers for permanent persistence across reloads
const saveToStorage = (key: string, data: any) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, JSON.stringify(data));
    }
  } catch (e) {}
};

const loadFromStorage = <T>(key: string, fallback: T): T => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    }
  } catch (e) {}
  return fallback;
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
export let adminModulesDb: AdminModuleItem[] = loadFromStorage('nexopp_admin_modules', [...defaultAdminModules]);

export interface ShowcaseVideo {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string;
  linkedCategory: 'Property' | 'Franchise' | 'Business' | 'None';
  linkedId?: string;
  title: string;
  displayOrder: number;
  status: 'Active' | 'Inactive';
  tags?: string[];
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

const defaultShowcaseVideos: ShowcaseVideo[] = [];
const defaultDemandRegions: DemandRegion[] = [];

// Reactive Selected City State (Stored in Memory)
export let selectedCity: string = '';
export const setSelectedCity = (city: string) => {
  selectedCity = city;
  window.dispatchEvent(new CustomEvent('nexopp_data_changed'));
};



export const isModuleActive = (moduleId: string): boolean => {
  const item = adminModulesDb.find(m => 
    m.id === moduleId || 
    (moduleId === 'franchise' && m.id === 'franchises') || 
    (moduleId === 'franchises' && m.id === 'franchises') ||
    (moduleId === 'property' && m.id === 'properties') ||
    (moduleId === 'properties' && m.id === 'properties') ||
    (moduleId === 'business' && m.id === 'business') ||
    (moduleId === 'businesses' && m.id === 'business')
  );
  return item ? item.isActive !== false : true;
};

export const saveAdminModules = (modules: AdminModuleItem[]) => {
  adminModulesDb = modules;
  notifyDataChanged();
};

export const toggleAdminModuleActive = (id: string) => {
  const current = adminModulesDb.find(m => m.id === id);
  const newActive = current ? !current.isActive : false;

  if (current) {
    adminModulesDb = adminModulesDb.map(m => m.id === id ? { ...m, isActive: newActive } : m);
  } else {
    adminModulesDb = [...adminModulesDb, { id, label: id, category: 'CONTENT MANAGEMENT', isActive: newActive, custom: false }];
  }
  saveToStorage('nexopp_admin_modules', adminModulesDb);
  notifyDataChanged();
  
  fetch(`${API_BASE_URL}/api/admin-modules/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isActive: newActive, id })
  }).catch(err => console.error('API Sync Error:', err));
};

export const deleteAdminModule = (id: string) => {
  adminModulesDb = adminModulesDb.filter(m => m.id !== id);
  notifyDataChanged();

  fetch(`${API_BASE_URL}/api/admin-modules/${id}`, {
    method: 'DELETE'
  }).catch(err => console.error('API Sync Error:', err));
};

export const addAdminModule = (label: string, category: AdminModuleItem['category']) => {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const newItem: AdminModuleItem = { id, label, category, isActive: true, custom: true };
  adminModulesDb = [...adminModulesDb, newItem];
  notifyDataChanged();

  fetch(`${API_BASE_URL}/api/admin-modules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newItem)
  }).catch(err => console.error('API Sync Error:', err));
};

export const persistAllToStorage = () => {
  saveToStorage('nexopp_properties_db', propertiesDb);
  saveToStorage('nexopp_franchise_db', franchiseDb);
  saveToStorage('nexopp_business_db', businessDb);
  saveToStorage('nexopp_dealers_db', dealersDb);
  saveToStorage('nexopp_enquiries_db', enquiriesDb);
  saveToStorage('nexopp_franchise_enquiries_db', franchiseEnquiriesDb);
  saveToStorage('nexopp_site_settings_db', siteSettingsDb);
  saveToStorage('nexopp_team_members_db', teamMembersDb);
  saveToStorage('nexopp_employee_users_db', employeeUsersDb);
  saveToStorage('nexopp_roles_db', rolesDb);
  saveToStorage('nexopp_demand_regions_db', demandRegionsDb);
  saveToStorage('nexopp_showcase_videos_db', showcaseVideosDb);
};

// PostgreSQL Data Sync Loader & LocalStorage Fallback Persistence
const loadData = async () => {
  try {
    // 1. Restore from permanent local storage immediately on startup
    propertiesDb = loadFromStorage('nexopp_properties_db', []);
    franchiseDb = loadFromStorage('nexopp_franchise_db', []);
    businessDb = loadFromStorage('nexopp_business_db', []);
    dealersDb = loadFromStorage('nexopp_dealers_db', []);
    enquiriesDb = loadFromStorage('nexopp_enquiries_db', []);
    franchiseEnquiriesDb = loadFromStorage('nexopp_franchise_enquiries_db', []);
    siteSettingsDb = loadFromStorage('nexopp_site_settings_db', defaultSettings);
    teamMembersDb = loadFromStorage('nexopp_team_members_db', []);
    employeeUsersDb = loadFromStorage('nexopp_employee_users_db', []);
    rolesDb = loadFromStorage('nexopp_roles_db', []);
    demandRegionsDb = loadFromStorage('nexopp_demand_regions_db', []);
    showcaseVideosDb = loadFromStorage('nexopp_showcase_videos_db', []);
    
    adminModulesDb = [...defaultAdminModules];
    sellPropertyRequestsDb = [];
    sellBusinessRequestsDb = [];

    // 2. Fetch from backend server API if available, replacing with server state as source of truth
    fetch(`${API_BASE_URL}/api/properties`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          propertiesDb = data;
          recalculateAllDemandRegions();
          notifyDataChanged();
        }
      })
      .catch(err => console.error('API Sync Error:', err));

    fetch(`${API_BASE_URL}/api/franchises`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          franchiseDb = data;
          recalculateAllDemandRegions();
          notifyDataChanged();
        }
      })
      .catch(err => console.error('API Sync Error:', err));

    fetch(`${API_BASE_URL}/api/businesses`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          businessDb = data;
          recalculateAllDemandRegions();
          notifyDataChanged();
        }
      })
      .catch(err => console.error('API Sync Error:', err));

    fetch(`${API_BASE_URL}/api/dealers`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          dealersDb = data;
          notifyDataChanged();
        }
      })
      .catch(err => console.error('API Sync Error:', err));

    fetch(`${API_BASE_URL}/api/employees`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          employeeUsersDb = data;
          notifyDataChanged();
        }
      })
      .catch(err => console.error('API Sync Error:', err));

    fetch(`${API_BASE_URL}/api/roles`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          rolesDb = data;
          notifyDataChanged();
        }
      })
      .catch(err => console.error('API Sync Error:', err));

    fetch(`${API_BASE_URL}/api/team-members`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          teamMembersDb = data;
          notifyDataChanged();
        }
      })
      .catch(err => console.error('API Sync Error:', err));

    fetch(`${API_BASE_URL}/api/demand-regions`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          demandRegionsDb = data;
          notifyDataChanged();
        }
      })
      .catch(err => console.error('API Sync Error:', err));

    fetch(`${API_BASE_URL}/api/enquiries`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          enquiriesDb = data;
          notifyDataChanged();
        }
      })
      .catch(err => console.error('API Sync Error:', err));

    fetch(`${API_BASE_URL}/api/franchise-enquiries`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          franchiseEnquiriesDb = data;
          notifyDataChanged();
        }
      })
      .catch(err => console.error('API Sync Error:', err));

    fetch(`${API_BASE_URL}/api/settings`)
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          siteSettingsDb = { ...siteSettingsDb, ...data };
          notifyDataChanged();
        }
      })
      .catch(err => console.error('API Sync Error:', err));

    fetch(`${API_BASE_URL}/api/admin-modules`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          adminModulesDb = data;
          notifyDataChanged();
        }
      })
      .catch(err => console.error('API Sync Error for admin modules:', err));

    // Fetch sell business requests
    try {
      const sbrRes = await fetch(`${API_BASE_URL}/api/sell-business-requests`);
      if (sbrRes.ok) {
        const sbrData = await sbrRes.json();
        if (Array.isArray(sbrData) && sbrData.length > 0) {
          sellBusinessRequestsDb = sbrData;
          notifyDataChanged();
        }
      }
    } catch (e) { console.warn('Could not fetch sell business requests'); }

    // Fetch sell property requests
    try {
      const sprRes = await fetch(`${API_BASE_URL}/api/sell-requests`);
      if (sprRes.ok) {
        const sprData = await sprRes.json();
        if (Array.isArray(sprData) && sprData.length > 0) {
          sellPropertyRequestsDb = sprData.map((d: any) => ({
            id: d.id,
            name: d.sellerName,
            mobile: d.mobile,
            email: d.email || '',
            city: d.city,
            propertyType: d.propertyType,
            preferredContactMethod: d.message ? d.message.replace('Contact via ', '') : 'Phone Call',
            status: d.status,
            adminNotes: d.adminNotes || '',
            createdAt: d.createdAt,
            updatedAt: d.updatedAt,
          }));
          notifyDataChanged();
        }
      }
    } catch (e) { console.warn('Could not fetch sell property requests'); }

  } catch (err) {
    console.error("Error initializing marketplace data:", err);
  }
};


import { queryClient } from '../api/queryClient';

// Dispatch Data Changed Event and Persist State
export const notifyDataChanged = () => {
  try {
    persistAllToStorage();
    window.dispatchEvent(new Event('nexopp_data_changed'));
    queryClient.invalidateQueries();
  } catch (err) {
    console.error("Error dispatching nexopp_data_changed event:", err);
  }
};

// Initialize immediately on module load
loadData();

// Mutations
export const addProperty = (item: PropertyListing) => {
  propertiesDb = [item, ...propertiesDb];
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/properties`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  }).catch(err => console.error("Sync failed:", err));
};

export const updateProperty = (id: string, updated: Partial<PropertyListing>) => {
  propertiesDb = propertiesDb.map(p => p.id === id ? { ...p, ...updated } : p);
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/properties/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated)
  }).catch(err => console.error("Sync failed:", err));
};

export const deleteProperty = (id: string) => {
  propertiesDb = propertiesDb.filter(p => p.id !== id);
  showcaseVideosDb = showcaseVideosDb.filter(v => !(v.linkedCategory === 'Property' && v.linkedId === id));
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/properties/${id}`, {
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
  fetch(`${API_BASE_URL}/api/franchises`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  }).catch(err => console.error('API Sync Error:', err));
};

export const updateFranchise = (id: string, updated: Partial<FranchiseListing>) => {
  franchiseDb = franchiseDb.map(f => f.id === id ? { ...f, ...updated } : f);
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/franchises/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated)
  }).catch(err => console.error('API Sync Error:', err));
};

export const deleteFranchise = (id: string) => {
  franchiseDb = franchiseDb.filter(f => f.id !== id);
  showcaseVideosDb = showcaseVideosDb.filter(v => !(v.linkedCategory === 'Franchise' && v.linkedId === id));
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/franchises/${id}`, {
    method: 'DELETE'
  }).catch(err => console.error('API Sync Error:', err));
};

export const addDealer = (item: Dealer) => {
  dealersDb = [item, ...dealersDb];
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/dealers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  }).catch(err => console.error('API Sync Error:', err));
};

export const updateDealer = (id: string, updated: Partial<Dealer>) => {
  dealersDb = dealersDb.map(d => d.id === id ? { ...d, ...updated } : d);
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/dealers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated)
  }).catch(err => console.error('API Sync Error:', err));
};

export const deleteDealer = (id: string) => {
  dealersDb = dealersDb.filter(d => d.id !== id);
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/dealers/${id}`, {
    method: 'DELETE'
  }).catch(err => console.error('API Sync Error:', err));
};

export const addBusiness = (item: BusinessListing) => {
  const norm: BusinessListing = {
    ...item,
    id: item.id || `biz-${Date.now()}`,
    name: item.name || (item as any).title || 'Business Listing',
    price: item.price !== undefined ? item.price : ((item as any).askingPrice || 50),
    priceDisplay: item.priceDisplay || `₹ ${item.price || (item as any).askingPrice || 50} Lakhs`,
    published: item.published !== false,
    status: item.status || 'Available',
  };
  businessDb = [norm, ...businessDb];
  saveToStorage('nexopp_business_db', businessDb);
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/businesses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(norm)
  }).catch(err => console.error('API Sync Error:', err));
};

export const updateBusiness = (id: string, updated: Partial<BusinessListing>) => {
  businessDb = businessDb.map(b => b.id === id ? { ...b, ...updated } : b);
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/businesses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated)
  }).catch(err => console.error('API Sync Error:', err));
};

export const deleteBusiness = (id: string) => {
  businessDb = businessDb.filter(b => b.id !== id);
  showcaseVideosDb = showcaseVideosDb.filter(v => !(v.linkedCategory === 'Business' && v.linkedId === id));
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/businesses/${id}`, {
    method: 'DELETE'
  }).catch(err => console.error('API Sync Error:', err));
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
  fetch(`${API_BASE_URL}/api/showcase-videos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newVideo)
  }).catch(err => console.error('API Sync Error:', err));
};

export const updateShowcaseVideo = (id: string, updated: Partial<ShowcaseVideo>) => {
  showcaseVideosDb = showcaseVideosDb.map(v => v.id === id ? { ...v, ...updated } : v);
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/showcase-videos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated)
  }).catch(err => console.error('API Sync Error:', err));
};

export const deleteShowcaseVideo = (id: string) => {
  showcaseVideosDb = showcaseVideosDb.filter(v => v.id !== id);
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/showcase-videos/${id}`, {
    method: 'DELETE'
  }).catch(err => console.error('API Sync Error:', err));
};

export const updateShowcaseSettings = (updated: Partial<ShowcaseSettings>) => {
  showcaseSettingsDb = { ...showcaseSettingsDb, ...updated };
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/showcase-settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated)
  }).catch(err => console.error('API Sync Error:', err));
};

export const deleteEnquiry = (id: string) => {
  enquiriesDb = enquiriesDb.filter(e => e.id !== id);
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/enquiries/${id}`, {
    method: 'DELETE'
  }).catch(err => console.error('API Sync Error:', err));
};

export const updateEnquiryStatus = (id: string, status: 'New' | 'Contacted' | 'Follow-up' | 'Closed') => {
  enquiriesDb = enquiriesDb.map(e => e.id === id ? { ...e, status } : e);
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/enquiries/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  }).catch(err => console.error('API Sync Error:', err));
};

export const updateSiteSettings = (settings: Partial<SiteSettings>) => {
  siteSettingsDb = { ...siteSettingsDb, ...settings };
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  }).catch(err => console.error('API Sync Error:', err));
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
  Promise.all(ids.map(id => 
    fetch(`${API_BASE_URL}/api/properties/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingStatus: 'Published' })
    })
  )).catch(err => console.error('API Sync Error:', err));
};

export const bulkHideProperties = (ids: string[]) => {
  propertiesDb = propertiesDb.map(p => ids.includes(p.id) ? { ...p, listingStatus: 'Hidden' } : p);
  notifyDataChanged();
  Promise.all(ids.map(id => 
    fetch(`${API_BASE_URL}/api/properties/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingStatus: 'Hidden' })
    })
  )).catch(err => console.error('API Sync Error:', err));
};

export const bulkDeleteProperties = (ids: string[]) => {
  propertiesDb = propertiesDb.filter(p => !ids.includes(p.id));
  notifyDataChanged();
  Promise.all(ids.map(id => 
    fetch(`${API_BASE_URL}/api/properties/${id}`, { method: 'DELETE' })
  )).catch(err => console.error('API Sync Error:', err));
};

export const addTeamMember = (item: TeamMember) => {
  teamMembersDb = [item, ...teamMembersDb];
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/team-members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  }).catch(err => console.error('API Sync Error:', err));
};

export const updateTeamMember = (id: string, updated: Partial<TeamMember>) => {
  teamMembersDb = teamMembersDb.map(m => m.id === id ? { ...m, ...updated } : m);
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/team-members/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated)
  }).catch(err => console.error('API Sync Error:', err));
};

export const deleteTeamMember = (id: string) => {
  teamMembersDb = teamMembersDb.filter(m => m.id !== id);
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/team-members/${id}`, {
    method: 'DELETE'
  }).catch(err => console.error('API Sync Error:', err));
};

export const addEmployeeUser = (item: EmployeeUser) => {
  employeeUsersDb = [item, ...employeeUsersDb];
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/employees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  }).catch(err => console.error('API Sync Error:', err));
};

export const updateEmployeeUser = (id: string, updated: Partial<EmployeeUser>) => {
  employeeUsersDb = employeeUsersDb.map(u => u.id === id ? { ...u, ...updated } : u);
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/employees/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated)
  }).catch(err => console.error('API Sync Error:', err));
};

export const deleteEmployeeUser = (id: string) => {
  employeeUsersDb = employeeUsersDb.filter(u => u.id !== id);
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/employees/${id}`, {
    method: 'DELETE'
  }).catch(err => console.error('API Sync Error:', err));
};

export const updateRole = (id: string, permissions: string[]) => {
  rolesDb = rolesDb.map(r => r.id === id ? { ...r, permissions } : r);
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/roles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ permissions })
  }).catch(err => console.error('API Sync Error:', err));
};

export const addRole = (role: Role) => {
  rolesDb = [...rolesDb, role];
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/roles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(role)
  }).catch(err => console.error('API Sync Error:', err));
};

export const deleteRole = (id: string) => {
  rolesDb = rolesDb.filter(r => r.id !== id);
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/roles/${id}`, {
    method: 'DELETE'
  }).catch(err => console.error('API Sync Error:', err));
};

export const addFranchiseEnquiry = (item: FranchiseEnquiry) => {
  franchiseEnquiriesDb = [item, ...franchiseEnquiriesDb];
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/franchise-enquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  }).catch(err => console.error('API Sync Error:', err));
};

export const updateFranchiseEnquiryStatus = (id: string, status: FranchiseEnquiry['status']) => {
  franchiseEnquiriesDb = franchiseEnquiriesDb.map(e => e.id === id ? { ...e, status } : e);
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/franchise-enquiries/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  }).catch(err => console.error('API Sync Error:', err));
};

export const assignFranchiseEnquiryBroker = (id: string, brokerId: string, brokerName: string) => {
  franchiseEnquiriesDb = franchiseEnquiriesDb.map(e => e.id === id ? { ...e, assignedBrokerId: brokerId, assignedBrokerName: brokerName } : e);
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/franchise-enquiries/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assignedBrokerId: brokerId, assignedBrokerName: brokerName })
  }).catch(err => console.error('API Sync Error:', err));
};

export const deleteFranchiseEnquiry = (id: string) => {
  franchiseEnquiriesDb = franchiseEnquiriesDb.filter(e => e.id !== id);
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/franchise-enquiries/${id}`, {
    method: 'DELETE'
  }).catch(err => console.error('API Sync Error:', err));
};

export const bulkPublishFranchises = (ids: string[]) => {
  franchiseDb = franchiseDb.map(f => ids.includes(f.id) ? { ...f, approvalStatus: 'Published', status: 'Active' } : f);
  notifyDataChanged();
  Promise.all(ids.map(id => 
    fetch(`${API_BASE_URL}/api/franchises/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvalStatus: 'Published', status: 'Active' })
    })
  )).catch(err => console.error('API Sync Error:', err));
};

export const bulkArchiveFranchises = (ids: string[]) => {
  franchiseDb = franchiseDb.map(f => ids.includes(f.id) ? { ...f, approvalStatus: 'Archived' } : f);
  notifyDataChanged();
  Promise.all(ids.map(id => 
    fetch(`${API_BASE_URL}/api/franchises/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvalStatus: 'Archived' })
    })
  )).catch(err => console.error('API Sync Error:', err));
};

export const bulkDeleteFranchises = (ids: string[]) => {
  franchiseDb = franchiseDb.filter(f => !ids.includes(f.id));
  notifyDataChanged();
  Promise.all(ids.map(id => 
    fetch(`${API_BASE_URL}/api/franchises/${id}`, { method: 'DELETE' })
  )).catch(err => console.error('API Sync Error:', err));
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
  propertiesDb.forEach((p: any) => {
    const isNearby = (p.latitude && p.longitude) ? getDistance(region.latitude, region.longitude, p.latitude, p.longitude) <= region.radius : false;
    const isCityMatch = (p.city || p.district || p.location || p.address || '').toLowerCase().includes(region.city.toLowerCase()) || (region.name && (p.city || p.district || p.location || p.address || '').toLowerCase().includes(region.name.toLowerCase()));
    
    if (isNearby || isCityMatch) {
      if (p.sold || p.listingStatus === 'Sold' || p.status === 'Sold' || p.approvalStatus === 'Sold') {
        propSales++;
      } else {
        activeProps++;
      }
    }
  });

  let franSales = 0;
  let activeFrans = 0;
  franchiseDb.forEach((f: any) => {
    const isNearby = (f.latitude && f.longitude) ? getDistance(region.latitude, region.longitude, f.latitude, f.longitude) <= region.radius : false;
    const isCityMatch = (f.city || f.location || f.address || '').toLowerCase().includes(region.city.toLowerCase()) || (region.name && (f.city || f.location || f.address || '').toLowerCase().includes(region.name.toLowerCase()));

    if (isNearby || isCityMatch) {
      if (f.sold || f.listingStatus === 'Sold' || f.status === 'Sold' || f.approvalStatus === 'Closed') {
        franSales++;
      } else {
        activeFrans++;
      }
    }
  });

  let busSales = 0;
  let activeBuses = 0;
  businessDb.forEach((b: any) => {
    const isNearby = (b.latitude && b.longitude) ? getDistance(region.latitude, region.longitude, b.latitude, b.longitude) <= region.radius : false;
    const isCityMatch = (b.city || b.location || b.address || '').toLowerCase().includes(region.city.toLowerCase()) || (region.name && (b.city || b.location || b.address || '').toLowerCase().includes(region.name.toLowerCase()));

    if (isNearby || isCityMatch) {
      if (b.sold || b.listingStatus === 'Sold' || b.status === 'Sold') {
        busSales++;
      } else {
        activeBuses++;
      }
    }
  });

  const totalSales = propSales + franSales + busSales;
  const totalActive = activeProps + activeFrans + activeBuses;
  
  let score = 15 + (totalSales * 20) + (totalActive * 5);
  
  if (totalSales > 0) {
    score = Math.max(score, 75);
  }

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
  fetch(`${API_BASE_URL}/api/demand-regions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(finalRegion)
  }).catch(err => console.error('API Sync Error:', err));
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
  
  const updatedRegion = demandRegionsDb.find(r => r.id === id);
  if (updatedRegion) {
    fetch(`${API_BASE_URL}/api/demand-regions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedRegion)
    }).catch(err => console.error('API Sync Error:', err));
  }
};

export const deleteDemandRegion = (id: string) => {
  demandRegionsDb = demandRegionsDb.filter(r => r.id !== id);
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/demand-regions/${id}`, {
    method: 'DELETE'
  }).catch(err => console.error('API Sync Error:', err));
};

// ── DYNAMIC FILTERS & CATEGORIES MASTER DATA (is_active toggle support) ──────
export interface FilterMasterItem {
  id: string;
  name: string;
  is_active: boolean;
  active?: boolean;
  type: 'category' | 'location' | 'business_type';
  displayOrder?: number;
}

const defaultMasterCategories: FilterMasterItem[] = [
  { id: 'cat_1', name: 'Retail', is_active: true, type: 'category' },
  { id: 'cat_2', name: 'Manufacturing', is_active: true, type: 'category' },
  { id: 'cat_3', name: 'Restaurants & Cafés', is_active: true, type: 'category' },
  { id: 'cat_4', name: 'Hotels & Resorts', is_active: true, type: 'category' },
  { id: 'cat_5', name: 'Healthcare', is_active: true, type: 'category' },
  { id: 'cat_6', name: 'Education', is_active: true, type: 'category' },
  { id: 'cat_7', name: 'IT & Technology', is_active: true, type: 'category' },
  { id: 'cat_8', name: 'Services', is_active: true, type: 'category' },
  { id: 'cat_9', name: 'Wholesale & Distribution', is_active: true, type: 'category' },
  { id: 'cat_10', name: 'Agriculture', is_active: true, type: 'category' },
];

const defaultMasterLocations: FilterMasterItem[] = [
  { id: 'loc_1', name: 'Hyderabad', is_active: true, type: 'location' },
  { id: 'loc_2', name: 'Vijayawada', is_active: true, type: 'location' },
  { id: 'loc_3', name: 'Guntur', is_active: true, type: 'location' },
  { id: 'loc_4', name: 'Visakhapatnam', is_active: true, type: 'location' },
];

const defaultMasterPropertyTypes: FilterMasterItem[] = [
  { id: 'pt_1', name: 'Residential', is_active: true, type: 'category' },
  { id: 'pt_2', name: 'Commercial', is_active: true, type: 'category' },
  { id: 'pt_3', name: 'Agricultural', is_active: true, type: 'category' },
  { id: 'pt_4', name: 'Luxury Properties', is_active: true, type: 'category' },
  { id: 'pt_5', name: 'New Projects', is_active: true, type: 'category' },
];

const defaultMasterPropertyStatuses: FilterMasterItem[] = [
  { id: 'ps_1', name: 'Ready to Move', is_active: true, type: 'category' },
  { id: 'ps_2', name: 'Under Construction', is_active: true, type: 'category' },
  { id: 'ps_3', name: 'New Property', is_active: true, type: 'category' },
  { id: 'ps_4', name: 'Resale Property', is_active: true, type: 'category' },
];

const defaultMasterPropertyOwnerships: FilterMasterItem[] = [
  { id: 'po_1', name: 'Individual', is_active: true, type: 'category' },
  { id: 'po_2', name: 'Company / Developer', is_active: true, type: 'category' },
  { id: 'po_3', name: 'Builder', is_active: true, type: 'category' },
  { id: 'po_4', name: 'Agent', is_active: true, type: 'category' },
];

const defaultMasterBusinessTypes: FilterMasterItem[] = [
  { id: 'bt_1', name: 'Proprietorship', is_active: true, type: 'business_type' },
  { id: 'bt_2', name: 'Partnership', is_active: true, type: 'business_type' },
  { id: 'bt_3', name: 'LLP', is_active: true, type: 'business_type' },
  { id: 'bt_4', name: 'Private Limited', is_active: true, type: 'business_type' },
  { id: 'bt_5', name: 'Public Limited', is_active: true, type: 'business_type' },
];

const loadFilterMasterItems = (key: string, defaults: FilterMasterItem[]): FilterMasterItem[] => {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return defaults;
};

export let masterCategoriesDb: FilterMasterItem[] = loadFilterMasterItems('nexopp_master_categories', defaultMasterCategories);
export let masterLocationsDb: FilterMasterItem[] = loadFilterMasterItems('nexopp_master_locations', defaultMasterLocations);
export let masterPropertyTypesDb: FilterMasterItem[] = loadFilterMasterItems('nexopp_master_property_types', defaultMasterPropertyTypes);
export let masterPropertyStatusesDb: FilterMasterItem[] = loadFilterMasterItems('nexopp_master_property_statuses', defaultMasterPropertyStatuses);
export let masterPropertyOwnershipsDb: FilterMasterItem[] = loadFilterMasterItems('nexopp_master_property_ownerships', defaultMasterPropertyOwnerships);
export let masterBusinessTypesDb: FilterMasterItem[] = loadFilterMasterItems('nexopp_master_business_types', defaultMasterBusinessTypes);

const saveFilterMasterItems = (key: string, items: FilterMasterItem[]) => {
  try {
    localStorage.getItem(key);
    localStorage.setItem(key, JSON.stringify(items));
  } catch (e) {}
  notifyDataChanged();
};

export const addFilterMasterItem = (type: 'category' | 'location' | 'business_type' | 'property_type' | 'property_status' | 'property_ownership', name: string) => {
  const newItem: FilterMasterItem = {
    id: `${type}_${Date.now()}`,
    name,
    is_active: true,
    type: type as any,
  };
  if (type === 'category') {
    masterCategoriesDb = [...masterCategoriesDb, newItem];
    saveFilterMasterItems('nexopp_master_categories', masterCategoriesDb);
  } else if (type === 'location') {
    masterLocationsDb = [...masterLocationsDb, newItem];
    saveFilterMasterItems('nexopp_master_locations', masterLocationsDb);
  } else if (type === 'property_type') {
    masterPropertyTypesDb = [...masterPropertyTypesDb, newItem];
    saveFilterMasterItems('nexopp_master_property_types', masterPropertyTypesDb);
  } else if (type === 'property_status') {
    masterPropertyStatusesDb = [...masterPropertyStatusesDb, newItem];
    saveFilterMasterItems('nexopp_master_property_statuses', masterPropertyStatusesDb);
  } else if (type === 'property_ownership') {
    masterPropertyOwnershipsDb = [...masterPropertyOwnershipsDb, newItem];
    saveFilterMasterItems('nexopp_master_property_ownerships', masterPropertyOwnershipsDb);
  } else if (type === 'business_type') {
    masterBusinessTypesDb = [...masterBusinessTypesDb, newItem];
    saveFilterMasterItems('nexopp_master_business_types', masterBusinessTypesDb);
  }
};

export const toggleFilterMasterItemActive = (id: string, type: 'category' | 'location' | 'business_type' | 'property_type' | 'property_status' | 'property_ownership') => {
  if (type === 'category') {
    masterCategoriesDb = masterCategoriesDb.map(i => i.id === id ? { ...i, is_active: !i.is_active } : i);
    saveFilterMasterItems('nexopp_master_categories', masterCategoriesDb);
  } else if (type === 'location') {
    masterLocationsDb = masterLocationsDb.map(i => i.id === id ? { ...i, is_active: !i.is_active } : i);
    saveFilterMasterItems('nexopp_master_locations', masterLocationsDb);
  } else if (type === 'property_type') {
    masterPropertyTypesDb = masterPropertyTypesDb.map(i => i.id === id ? { ...i, is_active: !i.is_active } : i);
    saveFilterMasterItems('nexopp_master_property_types', masterPropertyTypesDb);
  } else if (type === 'property_status') {
    masterPropertyStatusesDb = masterPropertyStatusesDb.map(i => i.id === id ? { ...i, is_active: !i.is_active } : i);
    saveFilterMasterItems('nexopp_master_property_statuses', masterPropertyStatusesDb);
  } else if (type === 'property_ownership') {
    masterPropertyOwnershipsDb = masterPropertyOwnershipsDb.map(i => i.id === id ? { ...i, is_active: !i.is_active } : i);
    saveFilterMasterItems('nexopp_master_property_ownerships', masterPropertyOwnershipsDb);
  } else if (type === 'business_type') {
    masterBusinessTypesDb = masterBusinessTypesDb.map(i => i.id === id ? { ...i, is_active: !i.is_active } : i);
    saveFilterMasterItems('nexopp_master_business_types', masterBusinessTypesDb);
  }
};

export const deleteFilterMasterItem = (id: string, type: 'category' | 'location' | 'business_type' | 'property_type' | 'property_status' | 'property_ownership') => {
  if (type === 'category') {
    masterCategoriesDb = masterCategoriesDb.filter(i => i.id !== id);
    saveFilterMasterItems('nexopp_master_categories', masterCategoriesDb);
  } else if (type === 'location') {
    masterLocationsDb = masterLocationsDb.filter(i => i.id !== id);
    saveFilterMasterItems('nexopp_master_locations', masterLocationsDb);
  } else if (type === 'property_type') {
    masterPropertyTypesDb = masterPropertyTypesDb.filter(i => i.id !== id);
    saveFilterMasterItems('nexopp_master_property_types', masterPropertyTypesDb);
  } else if (type === 'property_status') {
    masterPropertyStatusesDb = masterPropertyStatusesDb.filter(i => i.id !== id);
    saveFilterMasterItems('nexopp_master_property_statuses', masterPropertyStatusesDb);
  } else if (type === 'property_ownership') {
    masterPropertyOwnershipsDb = masterPropertyOwnershipsDb.filter(i => i.id !== id);
    saveFilterMasterItems('nexopp_master_property_ownerships', masterPropertyOwnershipsDb);
  } else if (type === 'business_type') {
    masterBusinessTypesDb = masterBusinessTypesDb.filter(i => i.id !== id);
    saveFilterMasterItems('nexopp_master_business_types', masterBusinessTypesDb);
  }
};

export const editFilterMasterItem = (id: string, type: 'category' | 'location' | 'business_type', newName: string) => {
  if (type === 'category') {
    masterCategoriesDb = masterCategoriesDb.map(i => i.id === id ? { ...i, name: newName } : i);
    saveFilterMasterItems('nexopp_master_categories', masterCategoriesDb);
  } else if (type === 'location') {
    masterLocationsDb = masterLocationsDb.map(i => i.id === id ? { ...i, name: newName } : i);
    saveFilterMasterItems('nexopp_master_locations', masterLocationsDb);
  } else if (type === 'business_type') {
    masterBusinessTypesDb = masterBusinessTypesDb.map(i => i.id === id ? { ...i, name: newName } : i);
    saveFilterMasterItems('nexopp_master_business_types', masterBusinessTypesDb);
  }
};

export const updateFilterMasterItem = editFilterMasterItem;

// ── MASTER AREAS & LOCALITIES DATA ─────────────────────────────────────────
export interface AreaMasterItem {
  id: string;
  cityId: string;
  name: string;
  is_active: boolean;
}

export interface LocalityMasterItem {
  id: string;
  areaId: string;
  name: string;
  is_active: boolean;
}

const defaultMasterAreas: AreaMasterItem[] = [
  // Hyderabad (loc_1)
  { id: 'area_hyd_1', cityId: 'loc_1', name: 'Kukatpally', is_active: true },
  { id: 'area_hyd_2', cityId: 'loc_1', name: 'Madhapur', is_active: true },
  { id: 'area_hyd_3', cityId: 'loc_1', name: 'Gachibowli', is_active: true },
  { id: 'area_hyd_4', cityId: 'loc_1', name: 'Banjara Hills', is_active: true },
  { id: 'area_hyd_5', cityId: 'loc_1', name: 'Jubilee Hills', is_active: true },
  { id: 'area_hyd_6', cityId: 'loc_1', name: 'Secunderabad', is_active: true },
  // Vijayawada (loc_2)
  { id: 'area_vij_1', cityId: 'loc_2', name: 'Benz Circle', is_active: true },
  { id: 'area_vij_2', cityId: 'loc_2', name: 'Patamata', is_active: true },
  { id: 'area_vij_3', cityId: 'loc_2', name: 'Labbipet', is_active: true },
  { id: 'area_vij_4', cityId: 'loc_2', name: 'Governorpet', is_active: true },
  { id: 'area_vij_5', cityId: 'loc_2', name: 'Kanuru', is_active: true },
  // Guntur (loc_3)
  { id: 'area_gun_1', cityId: 'loc_3', name: 'Brodipet', is_active: true },
  { id: 'area_gun_2', cityId: 'loc_3', name: 'Arundelpet', is_active: true },
  { id: 'area_gun_3', cityId: 'loc_3', name: 'Lakshmipuram', is_active: true },
  { id: 'area_gun_4', cityId: 'loc_3', name: 'Koretipadu', is_active: true },
  { id: 'area_gun_5', cityId: 'loc_3', name: 'Nagarampalem', is_active: true }
];

const defaultMasterLocalities: LocalityMasterItem[] = [
  // Hyderabad -> Kukatpally (area_hyd_1)
  { id: 'loc_lh1', areaId: 'area_hyd_1', name: 'JNTU Road', is_active: true },
  { id: 'loc_lh2', areaId: 'area_hyd_1', name: 'KPHB Colony', is_active: true },
  { id: 'loc_lh3', areaId: 'area_hyd_1', name: 'Pragathi Nagar', is_active: true },
  { id: 'loc_lh4', areaId: 'area_hyd_1', name: 'Nizampet Road', is_active: true },
  // Hyderabad -> Madhapur (area_hyd_2)
  { id: 'loc_lh5', areaId: 'area_hyd_2', name: 'Hitech City', is_active: true },
  { id: 'loc_lh6', areaId: 'area_hyd_2', name: 'Kavuri Hills', is_active: true },
  { id: 'loc_lh7', areaId: 'area_hyd_2', name: 'Ayyappa Society', is_active: true },
  // Hyderabad -> Gachibowli (area_hyd_3)
  { id: 'loc_lh8', areaId: 'area_hyd_3', name: 'Financial District', is_active: true },
  { id: 'loc_lh9', areaId: 'area_hyd_3', name: 'Nanakramguda', is_active: true },
  { id: 'loc_lh10', areaId: 'area_hyd_3', name: 'Telecom Nagar', is_active: true },
  { id: 'loc_lh11', areaId: 'area_hyd_3', name: 'DLF Road', is_active: true },
  // Hyderabad -> Banjara Hills (area_hyd_4)
  { id: 'loc_lh12', areaId: 'area_hyd_4', name: 'Road No 1', is_active: true },
  { id: 'loc_lh13', areaId: 'area_hyd_4', name: 'Road No 12', is_active: true },
  { id: 'loc_lh14', areaId: 'area_hyd_4', name: 'MLA Colony', is_active: true },
  // Hyderabad -> Jubilee Hills (area_hyd_5)
  { id: 'loc_lh15', areaId: 'area_hyd_5', name: 'Road No 36', is_active: true },
  { id: 'loc_lh16', areaId: 'area_hyd_5', name: 'Road No 45', is_active: true },
  // Secunderabad (area_hyd_6)
  { id: 'loc_lh17', areaId: 'area_hyd_6', name: 'Sindhi Colony', is_active: true },
  { id: 'loc_lh18', areaId: 'area_hyd_6', name: 'Sainikpuri', is_active: true },

  // Vijayawada -> Benz Circle (area_vij_1)
  { id: 'loc_lv1', areaId: 'area_vij_1', name: 'Ring Road', is_active: true },
  { id: 'loc_lv2', areaId: 'area_vij_1', name: 'Mahanadu Road', is_active: true },
  // Vijayawada -> Patamata (area_vij_2)
  { id: 'loc_lv3', areaId: 'area_vij_2', name: 'Patamata Lanka', is_active: true },
  { id: 'loc_lv4', areaId: 'area_vij_2', name: 'Pantakaluva Road', is_active: true },
  // Vijayawada -> Labbipet (area_vij_3)
  { id: 'loc_lv5', areaId: 'area_vij_3', name: 'MG Road', is_active: true },
  { id: 'loc_lv6', areaId: 'area_vij_3', name: 'Siddhartha Nagar', is_active: true },

  // Guntur -> Brodipet (area_gun_1)
  { id: 'loc_lg1', areaId: 'area_gun_1', name: '1st Lane', is_active: true },
  { id: 'loc_lg2', areaId: 'area_gun_1', name: '3rd Lane', is_active: true },
  { id: 'loc_lg3', areaId: 'area_gun_1', name: '5th Lane', is_active: true },
  // Guntur -> Arundelpet (area_gun_2)
  { id: 'loc_lg4', areaId: 'area_gun_2', name: '10th Line', is_active: true },
  { id: 'loc_lg5', areaId: 'area_gun_2', name: '12th Line', is_active: true },
  // Guntur -> Lakshmipuram (area_gun_3)
  { id: 'loc_lg6', areaId: 'area_gun_3', name: 'Vidya Nagar', is_active: true },
  { id: 'loc_lg7', areaId: 'area_gun_3', name: 'NGO Colony', is_active: true },
];

const loadAreas = (): AreaMasterItem[] => {
  try {
    const stored = localStorage.getItem('nexopp_master_areas');
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return defaultMasterAreas;
};

const loadLocalities = (): LocalityMasterItem[] => {
  try {
    const stored = localStorage.getItem('nexopp_master_localities');
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return defaultMasterLocalities;
};

export let masterAreasDb: AreaMasterItem[] = loadAreas();
export let masterLocalitiesDb: LocalityMasterItem[] = loadLocalities();

const saveAreas = () => {
  try {
    localStorage.setItem('nexopp_master_areas', JSON.stringify(masterAreasDb));
  } catch (e) {}
  notifyDataChanged();
};

const saveLocalities = () => {
  try {
    localStorage.setItem('nexopp_master_localities', JSON.stringify(masterLocalitiesDb));
  } catch (e) {}
  notifyDataChanged();
};

export const addArea = (name: string, cityId: string) => {
  const newItem: AreaMasterItem = {
    id: `area_${Date.now()}`,
    cityId,
    name,
    is_active: true
  };
  masterAreasDb = [...masterAreasDb, newItem];
  saveAreas();
};

export const editArea = (id: string, newName: string) => {
  masterAreasDb = masterAreasDb.map(a => a.id === id ? { ...a, name: newName } : a);
  saveAreas();
};

export const toggleAreaActive = (id: string) => {
  masterAreasDb = masterAreasDb.map(a => a.id === id ? { ...a, is_active: !a.is_active } : a);
  saveAreas();
};

export const deleteArea = (id: string) => {
  masterAreasDb = masterAreasDb.filter(a => a.id !== id);
  masterLocalitiesDb = masterLocalitiesDb.filter(l => l.areaId !== id);
  saveAreas();
  saveLocalities();
};

export const addLocality = (name: string, areaId: string) => {
  const newItem: LocalityMasterItem = {
    id: `loc_l_${Date.now()}`,
    areaId,
    name,
    is_active: true
  };
  masterLocalitiesDb = [...masterLocalitiesDb, newItem];
  saveLocalities();
};

export const editLocality = (id: string, newName: string) => {
  masterLocalitiesDb = masterLocalitiesDb.map(l => l.id === id ? { ...l, name: newName } : l);
  saveLocalities();
};

export const toggleLocalityActive = (id: string) => {
  masterLocalitiesDb = masterLocalitiesDb.map(l => l.id === id ? { ...l, is_active: !l.is_active } : l);
  saveLocalities();
};

export const deleteLocality = (id: string) => {
  masterLocalitiesDb = masterLocalitiesDb.filter(l => l.id !== id);
  saveLocalities();
};

// ── SELL BUSINESS REQUESTS ─────────────────────────────────────────────────
export interface SellBusinessRequest {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  city: string;
  businessCategory: string;
  preferredContactMethod: string;
  status: string;
  adminNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export let sellBusinessRequestsDb: SellBusinessRequest[] = [];

export const addSellBusinessRequest = (item: SellBusinessRequest) => {
  sellBusinessRequestsDb = [item, ...sellBusinessRequestsDb];
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/sell-business-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  }).catch(err => console.error('API Sync Error:', err));
};

export const updateSellBusinessRequest = (id: string, updated: Partial<SellBusinessRequest>) => {
  sellBusinessRequestsDb = sellBusinessRequestsDb.map(r => r.id === id ? { ...r, ...updated } : r);
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/sell-business-requests/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated)
  }).catch(err => console.error('API Sync Error:', err));
};

export const deleteSellBusinessRequest = (id: string) => {
  sellBusinessRequestsDb = sellBusinessRequestsDb.filter(r => r.id !== id);
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/sell-business-requests/${id}`, {
    method: 'DELETE'
  }).catch(err => console.error('API Sync Error:', err));
};

// ── SELL PROPERTY REQUESTS ──────────────────────────────────────────────────
export interface SellPropertyRequest {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  city: string;
  propertyType: string;
  preferredContactMethod: string;
  status: string;
  adminNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export let sellPropertyRequestsDb: SellPropertyRequest[] = [];

export const addSellPropertyRequest = (item: SellPropertyRequest) => {
  sellPropertyRequestsDb = [item, ...sellPropertyRequestsDb];
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/sell-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: item.id,
      sellerName: item.name,
      mobile: item.mobile,
      email: item.email,
      city: item.city,
      propertyType: item.propertyType,
      message: `Contact via ${item.preferredContactMethod}`,
      status: item.status,
    })
  }).catch(err => console.error('API Sync Error:', err));
};

export const updateSellPropertyRequest = (id: string, updated: Partial<SellPropertyRequest>) => {
  sellPropertyRequestsDb = sellPropertyRequestsDb.map(r => r.id === id ? { ...r, ...updated } : r);
  notifyDataChanged();

  const backendUpdate: any = { ...updated };
  if (updated.name !== undefined) {
    backendUpdate.sellerName = updated.name;
    delete backendUpdate.name;
  }
  if (updated.preferredContactMethod !== undefined) {
    backendUpdate.message = `Contact via ${updated.preferredContactMethod}`;
    delete backendUpdate.preferredContactMethod;
  }

  fetch(`${API_BASE_URL}/api/sell-requests/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(backendUpdate)
  }).catch(err => console.error('API Sync Error:', err));
};

export const deleteSellPropertyRequest = (id: string) => {
  sellPropertyRequestsDb = sellPropertyRequestsDb.filter(r => r.id !== id);
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/sell-requests/${id}`, {
    method: 'DELETE'
  }).catch(err => console.error('API Sync Error:', err));
};

// ── BUSINESS ENQUIRIES ─────────────────────────────────────────────────────
export interface BusinessEnquiry {
  id: string;
  businessId: string;
  businessName: string;
  name: string;
  mobile: string;
  email: string;
  message: string;
  status: string;
  adminNotes?: string;
  createdAt?: string;
}

export let businessEnquiriesDb: BusinessEnquiry[] = [];

export const addBusinessEnquiry = (item: BusinessEnquiry) => {
  businessEnquiriesDb = [item, ...businessEnquiriesDb];
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/enquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: item.id,
      customerName: item.name,
      phone: item.mobile,
      email: item.email,
      listingTitle: item.businessName,
      status: 'New',
      priority: 'Medium',
      source: 'Business Portal',
      enquiryType: 'BUY_BUSINESS',
      date: new Date().toLocaleDateString(),
    })
  }).catch(err => console.error('API Sync Error:', err));
};
