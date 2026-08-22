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
  mobile?: string;
  contactNumber?: string;
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
  recentlySold?: boolean;
  badge?: string;
  badgeType?: string;
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
  subLocation?: string;
  sub_location?: string;
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
  subLocation?: string;
  sub_location?: string;
  locality?: string;
  landmark?: string;
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
  district?: string;
  city: string;
  area?: string;
  subLocation?: string;
  sub_location?: string;
  locality?: string;
  landmark?: string;
  pincode?: string;
  postal_code?: string;
  formatted_address?: string;
  fullAddress?: string;
  latitude: number;
  longitude: number;
  price: number;
  askingPrice?: number;
  priceDisplay: string;
  revenueMonthly?: string;
  profitMonthly?: string;
  establishedYear?: number;
  employeesCount?: number | string;
  rating?: number;
  reviewCount?: number;
  verified?: boolean;
  trending?: boolean;
  image: string;
  image2?: string;
  image3?: string;
  image4?: string;
  image5?: string;
  image6?: string;
  images?: string[];
  imageUrl?: string;
  description: string;
  reasonForSale?: string;
  trustScore?: number;
  revenue?: string;
  sellerProfile?: string;
  category?: string;
  businessType?: string;
  dealerId?: string;
  brokerId?: string;
  agentName?: string;
  agentPhone?: string;
  assignedBrokerIds?: string[];
  published?: boolean;
  featured?: boolean;
  status?: string;  // 'Available' | 'Sold' | 'Unavailable' | 'Under_Review'
  sold?: boolean;
  recentlySold?: boolean;
  soldDate?: string;
  badge?: string;
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
  customerId?: string;
  userId?: string;
  customerName: string;
  phone: string;
  email: string;
  listingTitle: string;
  brokerName: string;
  status: 'New' | 'Contacted' | 'Follow-up' | 'Closed';
  priority: 'High' | 'Medium' | 'Low';
  source: string;
  date: string;
  listingType?: string;
  listingId?: string;
  enquiryType?: 'BUY' | 'RENT' | 'LEASE' | 'SLOT_BOOKING' | 'GENERAL_ENQUIRY' | string;
  preferredTime?: string;
  preferredMoveInDate?: string;
  name?: string;
  interest?: string;
  message?: string;
  notes?: string;
  createdAt?: string;
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
  showVideoShowcase?: boolean;
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
  showVideoShowcase: true,
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

// Exported Reactive Data Variables - NO localStorage, start empty, filled from server only
export let dealersDb: Dealer[] = [];
export let propertiesDb: PropertyListing[] = [];
export let franchiseDb: FranchiseListing[] = [];
export let businessDb: BusinessListing[] = [];

// PostgreSQL-Only Data Sync — Server is the ONLY source of truth
export const syncWithBackend = async () => {
  try {
    const safeFetchJson = async (url: string) => {
      try {
        let res = await fetch(url).catch(() => null);
        if (!res || !res.ok) {
          const relativePath = url.includes('/api/') ? '/api/' + url.split('/api/')[1] : null;
          if (relativePath && relativePath !== url) {
            res = await fetch(relativePath).catch(() => null);
          }
        }
        if (!res || !res.ok) return null;
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) return null;
        return await res.json().catch(() => null);
      } catch {
        return null;
      }
    };

    const results = await Promise.allSettled([
      safeFetchJson(`${API_BASE_URL}/api/properties`),
      safeFetchJson(`${API_BASE_URL}/api/franchises`),
      safeFetchJson(`${API_BASE_URL}/api/businesses`),
      safeFetchJson(`${API_BASE_URL}/api/dealers`),
      safeFetchJson(`${API_BASE_URL}/api/employees`),
      safeFetchJson(`${API_BASE_URL}/api/roles`),
      safeFetchJson(`${API_BASE_URL}/api/team-members`),
      safeFetchJson(`${API_BASE_URL}/api/demand-regions`),
      safeFetchJson(`${API_BASE_URL}/api/enquiries`),
      safeFetchJson(`${API_BASE_URL}/api/franchise-enquiries`),
      safeFetchJson(`${API_BASE_URL}/api/settings`),
      safeFetchJson(`${API_BASE_URL}/api/contact-settings`),
      safeFetchJson(`${API_BASE_URL}/api/customers`),
      safeFetchJson(`${API_BASE_URL}/api/bookings`),
    ]);

    const [propsRes, franRes, bizRes, dealersRes, empRes, rolesRes, teamRes, demandRes, enqRes, franEnqRes, settingsRes, contactRes, custRes, bookRes] = results;

    // SERVER DATA = TRUTH. Replace local arrays completely.
    // SERVER DATA = TRUTH. Merge with unsynced local creations so items never vanish.
    if (propsRes.status === 'fulfilled' && Array.isArray(propsRes.value)) {
      const serverPropMap = new Map(propsRes.value.map((p: any) => [String(p.id), p]));
      const unsyncedProps = (propertiesDb || []).filter(p => p && p.id && !serverPropMap.has(String(p.id)));

      const serverMappedProps = propsRes.value.map((p: any) => {
        const brokerId = p.dealerId || p.brokerId || (p.broker ? p.broker.id : undefined);
        return {
          ...p,
          dealerId: brokerId,
          assignedBrokerIds: p.assignedBrokerIds?.length ? p.assignedBrokerIds : (brokerId ? [brokerId] : [])
        };
      });
      propertiesDb = [...serverMappedProps, ...unsyncedProps];
    }
    if (franRes.status === 'fulfilled' && Array.isArray(franRes.value)) {
      franchiseDb = franRes.value;
    }
    if (bizRes.status === 'fulfilled' && Array.isArray(bizRes.value)) {
      const serverBizMap = new Map(bizRes.value.map((b: any) => [String(b.id), b]));
      const unsyncedBiz = (businessDb || []).filter(b => b && b.id && !serverBizMap.has(String(b.id)));

      const serverMappedBiz = bizRes.value.map((b: any) => {
        const brokerId = b.dealerId || b.brokerId || (b.assignedBrokerIds && b.assignedBrokerIds[0]);
        return {
          ...b,
          dealerId: brokerId,
          brokerId: brokerId,
          assignedBrokerIds: b.assignedBrokerIds?.length ? b.assignedBrokerIds : (brokerId ? [brokerId] : [])
        };
      });
      businessDb = [...serverMappedBiz, ...unsyncedBiz];
    }
    if (dealersRes.status === 'fulfilled' && Array.isArray(dealersRes.value) && dealersRes.value.length > 0) {
      dealersDb = dealersRes.value;
    }
    if (empRes.status === 'fulfilled' && Array.isArray(empRes.value)) employeeUsersDb = empRes.value;
    if (rolesRes.status === 'fulfilled' && Array.isArray(rolesRes.value)) rolesDb = rolesRes.value;
    if (teamRes.status === 'fulfilled' && Array.isArray(teamRes.value)) teamMembersDb = teamRes.value;
    if (demandRes.status === 'fulfilled' && Array.isArray(demandRes.value)) demandRegionsDb = demandRes.value;
    if (enqRes.status === 'fulfilled' && Array.isArray(enqRes.value)) {
      enquiriesDb = enqRes.value;
      businessEnquiriesDb = enqRes.value.filter((e: any) => 
        e.listingType === 'BUSINESS' || 
        e.listingType === 'business' || 
        (e.source && e.source.toLowerCase().includes('business')) || 
        (e.listingTitle && e.listingTitle.toLowerCase().includes('business'))
      );
    }
    if (franEnqRes.status === 'fulfilled' && Array.isArray(franEnqRes.value)) franchiseEnquiriesDb = franEnqRes.value;
    if (settingsRes.status === 'fulfilled' && settingsRes.value && typeof settingsRes.value === 'object') {
      siteSettingsDb = { ...siteSettingsDb, ...settingsRes.value };
    }
    if (contactRes.status === 'fulfilled' && contactRes.value && typeof contactRes.value === 'object') {
      contactDetailsDb = { ...contactDetailsDb, ...contactRes.value };
    }

    // Admin modules
    try {
      const modRes = await fetch(`${API_BASE_URL}/api/admin-modules`);
      if (modRes.ok) {
        const data = await modRes.json();
        if (Array.isArray(data) && data.length > 0) {
          const map = new Map();
          defaultAdminModules.forEach(m => map.set(m.id, { ...m }));
          data.forEach((m: any) => {
            if (m && m.id) {
              const prev = map.get(m.id) || { id: m.id, category: 'CONTENT MANAGEMENT', custom: true };
              map.set(m.id, { ...prev, ...m, isActive: m.isActive !== false });
            }
          });
          adminModulesDb = Array.from(map.values());
        }
      }
    } catch {}

    // Sell requests
    try {
      const sbrRes = await fetch(`${API_BASE_URL}/api/sell-business-requests`);
      if (sbrRes.ok) {
        const sbrData = await sbrRes.json();
        if (Array.isArray(sbrData)) sellBusinessRequestsDb = sbrData;
      }
    } catch {}
    try {
      const sprRes = await fetch(`${API_BASE_URL}/api/sell-requests`);
      if (sprRes.ok) {
        const sprData = await sprRes.json();
        if (Array.isArray(sprData)) {
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
        }
      }
    } catch {}

    recalculateAllDemandRegions();
    notifyDataChanged();
  } catch (err) {
    console.error("Error syncing with backend:", err);
  }
};


import { queryClient } from '../api/queryClient';

// Dispatch Data Changed Event — NO localStorage persistence
export const notifyDataChanged = () => {
  try {
    window.dispatchEvent(new Event('nexopp_data_changed'));
    queryClient.invalidateQueries();
  } catch (err) {
    console.error("Error dispatching nexopp_data_changed event:", err);
  }
};

// Initialize immediately on module load
syncWithBackend();

const sanitizeImgStr = (s: any) => {
  if (!s || typeof s !== 'string') return '';
  return s;
};

const cleanPropPayload = (item: any) => ({
  ...item,
  image: sanitizeImgStr(item.image),
  image2: sanitizeImgStr(item.image2),
  image3: sanitizeImgStr(item.image3),
  image4: sanitizeImgStr(item.image4),
  image5: sanitizeImgStr(item.image5),
  image6: sanitizeImgStr(item.image6),
});

// Mutations — Immediate UI response + VPS server persistence
export const addProperty = async (item: PropertyListing) => {
  // 1. Instant optimistic update so UI shows added property immediately
  const existingIdx = propertiesDb.findIndex(p => p.id === item.id);
  if (existingIdx >= 0) {
    propertiesDb[existingIdx] = { ...propertiesDb[existingIdx], ...item };
  } else {
    propertiesDb = [item, ...propertiesDb];
  }
  notifyDataChanged();

  // 2. Server persistence & sync
  const payload = cleanPropPayload(item);
  try {
    const res = await fetch(`${API_BASE_URL}/api/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      await syncWithBackend();
    } else {
      // Retry with lighter payload if payload size issue
      await fetch(`${API_BASE_URL}/api/properties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, image: '', image2: null, image3: null, image4: null, image5: null, image6: null })
      }).catch(() => null);
      await syncWithBackend();
    }
  } catch (err) {
    console.error("addProperty server error:", err);
  }
};

export const updateProperty = async (id: string, updated: Partial<PropertyListing>) => {
  propertiesDb = propertiesDb.map(p => p.id === id ? { ...p, ...updated } : p);
  notifyDataChanged();

  const payload = cleanPropPayload(updated);
  try {
    const res = await fetch(`${API_BASE_URL}/api/properties/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      await fetch(`${API_BASE_URL}/api/properties/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, image: undefined, image2: undefined, image3: undefined, image4: undefined, image5: undefined, image6: undefined })
      }).catch(() => null);
    }
    await syncWithBackend();
  } catch (err) {
    console.error("updateProperty server error:", err);
  }
};

export const deleteProperty = async (id: string) => {
  propertiesDb = propertiesDb.filter(p => p.id !== id);
  notifyDataChanged();

  try {
    await fetch(`${API_BASE_URL}/api/properties/${id}`, { method: 'DELETE' });
    await syncWithBackend();
  } catch (err) {
    console.error("deleteProperty server error:", err);
  }
};
export let insuranceDb: InsuranceProvider[] = [];
export let servicesDb: ServiceProvider[] = [];
export let enquiriesDb: CustomerEnquiry[] = [];
export let franchiseEnquiriesDb: FranchiseEnquiry[] = [];
export let siteSettingsDb: SiteSettings = defaultSettings;

export interface ContactDetails {
  companyName: string;
  headquartersTitle: string;
  buildingName: string;
  headquartersAddress: string;
  workingHours: string;
  phone1: string;
  phone2: string;
  emailDesk: string;
  emailAcquisitions: string;
  whatsappNumber: string;
  mapEmbedUrl: string;
  contactSubtitle: string;
}

export const defaultContactDetails: ContactDetails = {
  companyName: 'TheNexopp Advisory Desk',
  headquartersTitle: 'Registry Headquarters',
  buildingName: 'TheNexopp Towers',
  headquartersAddress: 'Level 14, Financial District, Gachibowli, Hyderabad, Telangana - 500032',
  workingHours: 'Mon – Sat: 9:00 AM – 7:30 PM',
  phone1: '+91 40 4900 2200',
  phone2: '+91 80 5600 7800',
  emailDesk: 'desk@thenexopp.in',
  emailAcquisitions: 'acquisitions@thenexopp.in',
  whatsappNumber: '+91 80 5600 7800',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.8272225611135!2d78.3415!3d17.4262!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb93f21132711d%3A0x6b772be425e24b45!2sGachibowli%2C%20Hyderabad%2C%20Telangana!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
  contactSubtitle: 'Whether you are acquiring premium real estate, seeking loan assistance, exploring business opportunities, or protecting assets, our dedicated portfolio team is here to assist you.'
};

export const formatGoogleMapEmbedUrl = (rawInput?: string | null, fallbackAddress?: string): string => {
  if (!rawInput || typeof rawInput !== 'string' || !rawInput.trim()) {
    if (fallbackAddress && fallbackAddress.trim()) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(fallbackAddress.trim())}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }
    return 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.8272225611135!2d78.3415!3d17.4262!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb93f21132711d%3A0x6b772be425e24b45!2sGachibowli%2C%20Hyderabad%2C%20Telangana!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin';
  }

  let input = rawInput.trim();

  // 1. If user pasted an <iframe> code snippet, extract the src URL
  if (input.includes('<iframe') || input.includes('src=')) {
    const srcMatch = input.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) {
      input = srcMatch[1].trim();
    }
  }

  // Remove any surrounding quotes or backticks
  input = input.replace(/^['"`]|['"`]$/g, '').trim();

  // 2. Already a valid Google Maps embed URL
  if (
    (input.includes('google.com/maps/embed') || input.includes('maps.google.com/maps/embed')) &&
    (input.startsWith('http://') || input.startsWith('https://'))
  ) {
    return input;
  }

  // 3. Already contains output=embed
  if (input.includes('output=embed') && (input.startsWith('http://') || input.startsWith('https://'))) {
    return input;
  }

  // 4. Google Maps Place URL: e.g. https://www.google.com/maps/place/Place+Name/@17.44,78.34,14z/...
  if (input.includes('/maps/place/') || input.includes('/place/')) {
    const placeMatch = input.match(/\/place\/([^/@?]+)/);
    if (placeMatch && placeMatch[1]) {
      const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
      return `https://maps.google.com/maps?q=${encodeURIComponent(placeName)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }

    const coordMatch = input.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordMatch && coordMatch[1] && coordMatch[2]) {
      return `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }
  }

  // 5. Google Maps Search / Query URL: e.g. https://www.google.com/maps/search/Query
  if (input.includes('/maps/search/') || input.includes('/search/')) {
    const searchMatch = input.match(/\/search\/([^/?]+)/);
    if (searchMatch && searchMatch[1]) {
      const query = decodeURIComponent(searchMatch[1].replace(/\+/g, ' '));
      return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }
  }

  // 6. Generic maps.google or google.com/maps query parameters
  if (input.includes('maps.google.') || input.includes('google.com/maps')) {
    try {
      const urlObj = new URL(input.startsWith('http') ? input : `https://${input}`);
      const q = urlObj.searchParams.get('q') || urlObj.searchParams.get('query') || urlObj.searchParams.get('destination');
      if (q) {
        return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
      }
      const coordMatch = urlObj.pathname.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (coordMatch && coordMatch[1] && coordMatch[2]) {
        return `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
      }
    } catch (_) {}
  }

  // 7. Google short links (maps.app.goo.gl or goo.gl/maps)
  if (input.includes('maps.app.goo.gl') || input.includes('goo.gl/maps')) {
    if (fallbackAddress && fallbackAddress.trim()) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(fallbackAddress.trim())}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }
    return `https://maps.google.com/maps?q=${encodeURIComponent(input)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  }

  // 8. Plain lat/long numbers e.g. "17.4262, 78.3415" or "17.4262,78.3415"
  const latLngMatch = input.match(/^(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)$/);
  if (latLngMatch && latLngMatch[1] && latLngMatch[2]) {
    return `https://maps.google.com/maps?q=${latLngMatch[1]},${latLngMatch[2]}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  }

  // 9. Plain address or location name string (e.g. "Gachibowli, Hyderabad")
  return `https://maps.google.com/maps?q=${encodeURIComponent(input)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
};

export let contactDetailsDb: ContactDetails = loadFromStorage('nexopp_contact_details', defaultContactDetails);

export const updateContactDetails = (newDetails: Partial<ContactDetails>) => {
  const processed = { ...newDetails };
  if (processed.mapEmbedUrl !== undefined) {
    processed.mapEmbedUrl = formatGoogleMapEmbedUrl(processed.mapEmbedUrl, processed.headquartersAddress || contactDetailsDb.headquartersAddress);
  }
  contactDetailsDb = { ...contactDetailsDb, ...processed };
  saveToStorage('nexopp_contact_details', contactDetailsDb);
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/contact-settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(contactDetailsDb)
  }).catch(() => {});
};

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
  enabled?: boolean;
  maxVideoSizeMB: number;
  maxVideoDurationSec: number;
  defaultPlaybackDurationSec: number;
}

export const defaultShowcaseSettings: ShowcaseSettings = {
  enabled: true,
  maxVideoSizeMB: 200,
  maxVideoDurationSec: 60,
  defaultPlaybackDurationSec: 10
};

export let showcaseVideosDb: ShowcaseVideo[] = [];
export let showcaseSettingsDb: ShowcaseSettings = loadFromStorage('nexopp_showcase_settings_db', defaultShowcaseSettings);

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
    (moduleId === 'businesses' && m.id === 'business') ||
    (moduleId === 'showcase_videos' && (m.id === 'main_page_settings' || m.id === 'showcase_videos')) ||
    (moduleId === 'main_page_settings' && m.id === 'main_page_settings')
  );
  if (item) {
    if (item.isActive === false) return false;
  }
  // Cross check with siteSettings for franchise
  if (moduleId === 'franchise' || moduleId === 'franchises') {
    if (siteSettingsDb.showFranchiseSection === false) return false;
  }
  if (moduleId === 'showcase_videos' || moduleId === 'main_page_settings') {
    if (showcaseSettingsDb.enabled === false) return false;
    if (siteSettingsDb.showVideoShowcase === false) return false;
  }
  return item ? item.isActive !== false : true;
};

export const saveAdminModules = (modules: AdminModuleItem[]) => {
  adminModulesDb = modules;
  saveToStorage('nexopp_admin_modules', adminModulesDb);
  notifyDataChanged();
};

export const toggleAdminModuleActive = (id: string) => {
  const normalizedId = id === 'franchise' ? 'franchises' : id;
  const current = adminModulesDb.find(m => m.id === normalizedId || (normalizedId === 'franchises' && m.id === 'franchise'));
  const newActive = current ? !current.isActive : false;

  let exists = false;
  adminModulesDb = adminModulesDb.map(m => {
    if (m.id === normalizedId || (normalizedId === 'franchises' && m.id === 'franchise')) {
      exists = true;
      return { ...m, id: normalizedId, isActive: newActive };
    }
    return m;
  });

  if (!exists) {
    adminModulesDb.push({ id: normalizedId, label: normalizedId, category: 'CONTENT MANAGEMENT', isActive: newActive, custom: false });
  }

  if (normalizedId === 'franchises') {
    siteSettingsDb = { ...siteSettingsDb, showFranchiseSection: newActive };
    saveToStorage('nexopp_site_settings', siteSettingsDb);
  }

  saveToStorage('nexopp_admin_modules', adminModulesDb);
  notifyDataChanged();
  
  fetch(`${API_BASE_URL}/api/admin-modules/${normalizedId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isActive: newActive, id: normalizedId })
  }).catch(err => console.error('API Sync Error:', err));
};

export const deleteAdminModule = (id: string) => {
  adminModulesDb = adminModulesDb.filter(m => m.id !== id);
  saveToStorage('nexopp_admin_modules', adminModulesDb);
  notifyDataChanged();

  fetch(`${API_BASE_URL}/api/admin-modules/${id}`, {
    method: 'DELETE'
  }).catch(err => console.error('API Sync Error:', err));
};

export const addAdminModule = (label: string, category: AdminModuleItem['category']) => {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const newItem: AdminModuleItem = { id, label, category, isActive: true, custom: true };
  adminModulesDb = [...adminModulesDb, newItem];
  saveToStorage('nexopp_admin_modules', adminModulesDb);
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
  saveToStorage('nexopp_showcase_settings_db', showcaseSettingsDb);
};


export const updatePropertyVerification = (id: string, verified: boolean) => {
  updateProperty(id, { verified });
};

export const togglePropertyPremium = (id: string) => {
  const item = propertiesDb.find(p => p.id === id);
  if (item) updateProperty(id, { premium: !item.premium });
};

export const togglePropertyFeatured = (id: string) => {
  const item = propertiesDb.find(p => p.id === id);
  if (item) updateProperty(id, { featured: !item.featured });
};

export const togglePropertyTrending = (id: string) => {
  const item = propertiesDb.find(p => p.id === id);
  if (item) updateProperty(id, { trending: !item.trending });
};

export const togglePropertyRecentlySold = (id: string) => {
  const item = propertiesDb.find(p => p.id === id);
  if (item) {
    const isRecentlySold = !item.recentlySold;
    updateProperty(id, {
      recentlySold: isRecentlySold,
      sold: true,
      approvalStatus: 'Sold',
      listingStatus: 'Sold',
      badge: isRecentlySold ? 'RECENTLY SOLD' : 'SOLD'
    });
  }
};

export const setPropertyViewCount = (id: string, newViewsCount: number, newUniqueVisitors?: number) => {
  const count = Math.max(0, Math.floor(newViewsCount));
  const uniques = newUniqueVisitors !== undefined 
    ? Math.max(0, Math.floor(newUniqueVisitors)) 
    : Math.max(0, Math.floor(count * 0.75));
    
  const nowFormatted = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  updateProperty(id, {
    viewsCount: count,
    uniqueVisitorsCount: uniques,
    lastViewedAt: nowFormatted
  });
};

const lastTrackedViewsTimestamp: Record<string, number> = {};

export const incrementPropertyViewCount = (id: string) => {
  if (!id) return;
  const now = Date.now();
  // Prevent duplicate increments within 4 seconds for the same property
  if (lastTrackedViewsTimestamp[id] && now - lastTrackedViewsTimestamp[id] < 4000) {
    return;
  }
  lastTrackedViewsTimestamp[id] = now;

  const prop = propertiesDb.find(p => p.id === id);
  if (!prop) return;
  
  const currentViews = prop.viewsCount || 0;
  const currentUniques = prop.uniqueVisitorsCount || Math.max(1, Math.floor(currentViews * 0.75));
  
  let isNewVisitor = false;
  try {
    const sessionKey = `viewed_prop_${id}`;
    isNewVisitor = !sessionStorage.getItem(sessionKey);
    if (isNewVisitor) {
      sessionStorage.setItem(sessionKey, 'true');
    }
  } catch (_err) {
    // ignore storage errors
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

export const addDealer = async (item: Dealer) => {
  try {
    await fetch(`${API_BASE_URL}/api/dealers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    await syncWithBackend();
  } catch (err) {
    console.error('API Sync Error:', err);
  }
};

export const updateDealer = async (id: string, updated: Partial<Dealer>) => {
  try {
    await fetch(`${API_BASE_URL}/api/dealers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    await syncWithBackend();
  } catch (err) {
    console.error('API Sync Error:', err);
  }
};

export const deleteDealer = async (id: string) => {
  try {
    await fetch(`${API_BASE_URL}/api/dealers/${id}`, { method: 'DELETE' });
    await syncWithBackend();
  } catch (err) {
    console.error('API Sync Error:', err);
  }
};

export const addBusiness = async (item: BusinessListing) => {
  const primaryImg = item.image || item.imageUrl || (item.images && item.images[0]) || '';
  const allImages = item.images && item.images.length > 0 ? item.images : (primaryImg ? [primaryImg] : []);
  const effectiveDealerId = item.dealerId || item.brokerId || (item.assignedBrokerIds && item.assignedBrokerIds[0]) || undefined;

  const estYearParsed = item.establishedYear ? parseInt(String(item.establishedYear).replace(/\D/g, ''), 10) : NaN;
  const empCountParsed = item.employeesCount ? parseInt(String(item.employeesCount).replace(/\D/g, ''), 10) : NaN;
  const numPrice = typeof item.price === 'number' ? item.price : (parseFloat(String(item.price || item.askingPrice || 0).replace(/[^0-9.]/g, '')) || 0);

  const norm: BusinessListing = {
    ...item,
    id: item.id || `biz-${Date.now()}`,
    name: item.name || item.title || 'Business Listing',
    title: item.title || item.name || 'Business Listing',
    price: numPrice,
    askingPrice: numPrice,
    priceDisplay: item.priceDisplay || `₹${numPrice} Lakhs`,
    image: primaryImg,
    images: allImages,
    establishedYear: !isNaN(estYearParsed) && estYearParsed > 1800 ? estYearParsed : 2020,
    employeesCount: !isNaN(empCountParsed) && empCountParsed >= 0 ? empCountParsed : 10,
    published: item.published !== false,
    status: item.status || 'Available',
    dealerId: effectiveDealerId,
    brokerId: effectiveDealerId,
    assignedBrokerIds: effectiveDealerId ? [effectiveDealerId] : (item.assignedBrokerIds || []),
  };

  // Immediate optimistic update
  businessDb = [norm, ...businessDb.filter(b => b.id !== norm.id)];
  notifyDataChanged();

  try {
    await fetch(`${API_BASE_URL}/api/businesses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(norm)
    });
    await syncWithBackend();
  } catch (err) {
    console.error('API Business Sync Error:', err);
  }
};

export const updateBusiness = async (id: string, updated: Partial<BusinessListing>) => {
  const estYearParsed = updated.establishedYear ? parseInt(String(updated.establishedYear).replace(/\D/g, ''), 10) : undefined;
  const empCountParsed = updated.employeesCount ? parseInt(String(updated.employeesCount).replace(/\D/g, ''), 10) : undefined;

  const cleanUpdated = {
    ...updated,
    ...(estYearParsed !== undefined && !isNaN(estYearParsed) ? { establishedYear: estYearParsed } : {}),
    ...(empCountParsed !== undefined && !isNaN(empCountParsed) ? { employeesCount: empCountParsed } : {}),
  };

  businessDb = businessDb.map(b => b.id === id ? { ...b, ...cleanUpdated } : b);
  notifyDataChanged();

  try {
    await fetch(`${API_BASE_URL}/api/businesses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanUpdated)
    });
    await syncWithBackend();
  } catch (err) {
    console.error('API Sync Error:', err);
  }
};

export const deleteBusiness = async (id: string) => {
  businessDb = businessDb.filter(b => b.id !== id);
  notifyDataChanged();

  try {
    await fetch(`${API_BASE_URL}/api/businesses/${id}`, { method: 'DELETE' });
    await syncWithBackend();
  } catch (err) {
    console.error('API Sync Error:', err);
  }
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
  saveToStorage('nexopp_showcase_settings_db', showcaseSettingsDb);
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/showcase-settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated)
  }).catch(err => console.error('API Sync Error:', err));
};

export const addEnquiry = (enquiry: any) => {
  const normalized: CustomerEnquiry = {
    id: enquiry.id || `ENQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    customerName: enquiry.customerName || enquiry.name || 'Guest User',
    phone: enquiry.phone || enquiry.mobile || '',
    email: enquiry.email || '',
    listingTitle: enquiry.listingTitle || enquiry.title || 'General Enquiry',
    brokerName: enquiry.brokerName || 'NEXOPP Advisor',
    status: (enquiry.status as any) || 'New',
    priority: (enquiry.priority as any) || 'High',
    source: enquiry.source || 'Website',
    listingType: enquiry.listingType || 'PROPERTY',
    enquiryType: (enquiry.enquiryType as any) || 'BUY',
    date: enquiry.date || enquiry.preferredMoveInDate || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    preferredTime: enquiry.preferredTime || '',
    preferredMoveInDate: enquiry.preferredMoveInDate || enquiry.date || '',
    name: enquiry.customerName || enquiry.name || 'Guest User',
    interest: enquiry.interest || enquiry.message || '',
    message: enquiry.message || enquiry.interest || ''
  };

  // Deduplicate exact duplicate IDs only
  enquiriesDb = [normalized, ...enquiriesDb.filter(e => e.id !== normalized.id)];
  saveToStorage('nexopp_enquiries_db', enquiriesDb);

  if (normalized.listingType === 'BUSINESS' || normalized.source?.toLowerCase().includes('business')) {
    businessEnquiriesDb = [{
      id: normalized.id,
      businessId: normalized.id,
      businessName: normalized.listingTitle,
      name: normalized.customerName,
      mobile: normalized.phone,
      email: normalized.email,
      message: normalized.message || '',
      status: 'New',
      notes: normalized.interest || '',
      createdAt: new Date().toISOString()
    }, ...businessEnquiriesDb.filter(b => b.id !== normalized.id)];
  }

  notifyDataChanged();

  fetch(`${API_BASE_URL}/api/enquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(normalized)
  }).catch(err => console.error('API Sync Error:', err));

  return normalized;
};

export const clearAllLocalEnquiries = () => {
  enquiriesDb = [];
  businessEnquiriesDb = [];
  franchiseEnquiriesDb = [];
  try {
    localStorage.removeItem('nexopp_enquiries_db');
  } catch (e) {}
  notifyDataChanged();
};

export const deleteEnquiry = (id: string) => {
  enquiriesDb = enquiriesDb.filter(e => e.id !== id);
  saveToStorage('nexopp_enquiries_db', enquiriesDb);
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/enquiries/${id}`, {
    method: 'DELETE'
  }).catch(err => console.error('API Sync Error:', err));
};

export const updateEnquiryStatus = (id: string, status: 'New' | 'Contacted' | 'Follow-up' | 'Closed') => {
  enquiriesDb = enquiriesDb.map(e => e.id === id ? { ...e, status } : e);
  saveToStorage('nexopp_enquiries_db', enquiriesDb);
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
  notes?: string;
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
    credentials: 'include',
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
