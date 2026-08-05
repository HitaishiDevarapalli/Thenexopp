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

const defaultShowcaseVideos: ShowcaseVideo[] = [];
const defaultDemandRegions: DemandRegion[] = [];

// Reactive Selected City State (Stored in Memory)
export let selectedCity: string = 'Guntur';
export const setSelectedCity = (city: string) => {
  selectedCity = city;
  window.dispatchEvent(new CustomEvent('nexopp_data_changed'));
};

// LocalStorage Persistence Helpers with Quota Guard
const saveLocal = (key: string, data: any) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, JSON.stringify(data));
    }
  } catch (err) {
    console.warn(`Failed to save ${key} to localStorage (quota exceeded), attempting compact save:`, err);
    try {
      if (Array.isArray(data)) {
        const compactData = data.map(item => {
          if (item && typeof item === 'object') {
            const clone = { ...item };
            delete (clone as any).image2;
            delete (clone as any).image3;
            delete (clone as any).image4;
            delete (clone as any).image5;
            delete (clone as any).image6;
            return clone;
          }
          return item;
        });
        window.localStorage.setItem(key, JSON.stringify(compactData));
      }
    } catch (e) {
      console.error(`Compact save also failed for ${key}:`, e);
    }
  }
};

const getLocal = <T>(key: string): T | null => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    }
  } catch (err) {
    console.warn(`Failed to load ${key} from localStorage:`, err);
  }
  return null;
};

// PostgreSQL Data Sync Loader with LocalStorage Cache Backup
const loadData = () => {
  try {
    // 1. Immediately hydrate from LocalStorage cache (so created items never vanish on refresh!)
    propertiesDb = getLocal<PropertyListing[]>('nexopp_properties_cache') || [];
    franchiseDb = getLocal<FranchiseListing[]>('nexopp_franchises_cache') || [];
    businessDb = getLocal<BusinessListing[]>('nexopp_businesses_cache') || [];
    dealersDb = getLocal<Dealer[]>('nexopp_dealers_cache') || [];
    enquiriesDb = getLocal<CustomerEnquiry[]>('nexopp_enquiries_cache') || [];
    franchiseEnquiriesDb = getLocal<FranchiseEnquiry[]>('nexopp_franchise_enquiries_cache') || [];
    siteSettingsDb = defaultSettings;
    teamMembersDb = [];
    employeeUsersDb = [];
    rolesDb = [];
    demandRegionsDb = [];
    showcaseVideosDb = [];
    showcaseSettingsDb = {
      maxVideoSizeMB: 200,
      maxVideoDurationSec: 60,
      defaultPlaybackDurationSec: 10
    };

    // Async Fetch from PostgreSQL API Backend Server
    fetch(`${API_BASE_URL}/api/properties`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const apiIds = new Set(data.map(p => p.id));
          const localOnly = propertiesDb.filter(p => !apiIds.has(p.id));
          propertiesDb = [...data, ...localOnly];
          saveLocal('nexopp_properties_cache', propertiesDb);
          recalculateAllDemandRegions();
          window.dispatchEvent(new Event('nexopp_data_changed'));
        }
      })
      .catch(() => {});

    fetch(`${API_BASE_URL}/api/franchises`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const apiIds = new Set(data.map(f => f.id));
          const localOnly = franchiseDb.filter(f => !apiIds.has(f.id));
          franchiseDb = [...data, ...localOnly];
          saveLocal('nexopp_franchises_cache', franchiseDb);
          recalculateAllDemandRegions();
          window.dispatchEvent(new Event('nexopp_data_changed'));
        }
      })
      .catch(() => {});

    fetch(`${API_BASE_URL}/api/businesses`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const apiIds = new Set(data.map(b => b.id));
          const localOnly = businessDb.filter(b => !apiIds.has(b.id));
          businessDb = [...data, ...localOnly];
          saveLocal('nexopp_businesses_cache', businessDb);
          recalculateAllDemandRegions();
          window.dispatchEvent(new Event('nexopp_data_changed'));
        }
      })
      .catch(() => {});

    fetch(`${API_BASE_URL}/api/enquiries`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          enquiriesDb = data;
          saveLocal('nexopp_enquiries_cache', enquiriesDb);
          window.dispatchEvent(new Event('nexopp_data_changed'));
        }
      })
      .catch(() => {});

    fetch(`${API_BASE_URL}/api/showcase-videos`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          showcaseVideosDb = data;
          window.dispatchEvent(new Event('nexopp_data_changed'));
        }
      })
      .catch(() => {});

    fetch(`${API_BASE_URL}/api/settings`)
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          siteSettingsDb = { ...siteSettingsDb, ...data };
          window.dispatchEvent(new Event('nexopp_data_changed'));
        }
      })
      .catch(() => {});

    fetch(`${API_BASE_URL}/api/dealers`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const apiIds = new Set(data.map(d => d.id));
          const localOnly = dealersDb.filter(d => !apiIds.has(d.id));
          dealersDb = [...data, ...localOnly];
          saveLocal('nexopp_dealers_cache', dealersDb);
          window.dispatchEvent(new Event('nexopp_data_changed'));
        }
      })
      .catch(() => {});

    fetch(`${API_BASE_URL}/api/team-members`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          teamMembersDb = data;
          window.dispatchEvent(new Event('nexopp_data_changed'));
        }
      })
      .catch(() => {});

    fetch(`${API_BASE_URL}/api/employees`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          employeeUsersDb = data;
          window.dispatchEvent(new Event('nexopp_data_changed'));
        }
      })
      .catch(() => {});

    fetch(`${API_BASE_URL}/api/roles`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          rolesDb = data;
          window.dispatchEvent(new Event('nexopp_data_changed'));
        }
      })
      .catch(() => {});

    fetch(`${API_BASE_URL}/api/demand-regions`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          demandRegionsDb = data;
          window.dispatchEvent(new Event('nexopp_data_changed'));
        }
      })
      .catch(() => {});

    fetch(`${API_BASE_URL}/api/franchise-enquiries`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          franchiseEnquiriesDb = data;
          window.dispatchEvent(new Event('nexopp_data_changed'));
        }
      })
      .catch(() => {});

    fetch(`${API_BASE_URL}/api/showcase-settings`)
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === 'object') {
          showcaseSettingsDb = { ...showcaseSettingsDb, ...data };
          window.dispatchEvent(new Event('nexopp_data_changed'));
        }
      })
      .catch(() => {});

  } catch (err) {
    console.error("Error initializing PostgreSQL marketplace data:", err);
  }
};


import { queryClient } from '../api/queryClient';

// Dispatch Data Changed Event (No LocalStorage)
export const notifyDataChanged = () => {
  try {
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
  saveLocal('nexopp_properties_cache', propertiesDb);
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/properties`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  }).catch(err => console.error("Sync failed:", err));
};

export const updateProperty = (id: string, updated: Partial<PropertyListing>) => {
  propertiesDb = propertiesDb.map(p => p.id === id ? { ...p, ...updated } : p);
  saveLocal('nexopp_properties_cache', propertiesDb);
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
  saveLocal('nexopp_properties_cache', propertiesDb);
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
  saveLocal('nexopp_franchises_cache', franchiseDb);
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/franchises`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  }).catch(() => {});
};

export const updateFranchise = (id: string, updated: Partial<FranchiseListing>) => {
  franchiseDb = franchiseDb.map(f => f.id === id ? { ...f, ...updated } : f);
  saveLocal('nexopp_franchises_cache', franchiseDb);
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/franchises/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated)
  }).catch(() => {});
};

export const deleteFranchise = (id: string) => {
  franchiseDb = franchiseDb.filter(f => f.id !== id);
  showcaseVideosDb = showcaseVideosDb.filter(v => !(v.linkedCategory === 'Franchise' && v.linkedId === id));
  saveLocal('nexopp_franchises_cache', franchiseDb);
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/franchises/${id}`, {
    method: 'DELETE'
  }).catch(() => {});
};

export const addDealer = (item: Dealer) => {
  dealersDb = [item, ...dealersDb];
  saveLocal('nexopp_dealers_cache', dealersDb);
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/dealers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  }).catch(() => {});
};

export const updateDealer = (id: string, updated: Partial<Dealer>) => {
  dealersDb = dealersDb.map(d => d.id === id ? { ...d, ...updated } : d);
  saveLocal('nexopp_dealers_cache', dealersDb);
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/dealers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated)
  }).catch(() => {});
};

export const deleteDealer = (id: string) => {
  dealersDb = dealersDb.filter(d => d.id !== id);
  saveLocal('nexopp_dealers_cache', dealersDb);
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/dealers/${id}`, {
    method: 'DELETE'
  }).catch(() => {});
};

export const addBusiness = (item: BusinessListing) => {
  businessDb = [item, ...businessDb];
  saveLocal('nexopp_businesses_cache', businessDb);
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/businesses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  }).catch(() => {});
};

export const updateBusiness = (id: string, updated: Partial<BusinessListing>) => {
  businessDb = businessDb.map(b => b.id === id ? { ...b, ...updated } : b);
  saveLocal('nexopp_businesses_cache', businessDb);
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/businesses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated)
  }).catch(() => {});
};

export const deleteBusiness = (id: string) => {
  businessDb = businessDb.filter(b => b.id !== id);
  showcaseVideosDb = showcaseVideosDb.filter(v => !(v.linkedCategory === 'Business' && v.linkedId === id));
  saveLocal('nexopp_businesses_cache', businessDb);
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/businesses/${id}`, {
    method: 'DELETE'
  }).catch(() => {});
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
  }).catch(() => {});
};

export const updateShowcaseVideo = (id: string, updated: Partial<ShowcaseVideo>) => {
  showcaseVideosDb = showcaseVideosDb.map(v => v.id === id ? { ...v, ...updated } : v);
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/showcase-videos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated)
  }).catch(() => {});
};

export const deleteShowcaseVideo = (id: string) => {
  showcaseVideosDb = showcaseVideosDb.filter(v => v.id !== id);
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/showcase-videos/${id}`, {
    method: 'DELETE'
  }).catch(() => {});
};

export const updateShowcaseSettings = (updated: Partial<ShowcaseSettings>) => {
  showcaseSettingsDb = { ...showcaseSettingsDb, ...updated };
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/showcase-settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated)
  }).catch(() => {});
};

export const deleteEnquiry = (id: string) => {
  enquiriesDb = enquiriesDb.filter(e => e.id !== id);
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/enquiries/${id}`, {
    method: 'DELETE'
  }).catch(() => {});
};

export const updateEnquiryStatus = (id: string, status: 'New' | 'Contacted' | 'Follow-up' | 'Closed') => {
  enquiriesDb = enquiriesDb.map(e => e.id === id ? { ...e, status } : e);
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/enquiries/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  }).catch(() => {});
};

export const updateSiteSettings = (settings: Partial<SiteSettings>) => {
  siteSettingsDb = { ...siteSettingsDb, ...settings };
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  }).catch(() => {});
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
  )).catch(() => {});
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
  )).catch(() => {});
};

export const bulkDeleteProperties = (ids: string[]) => {
  propertiesDb = propertiesDb.filter(p => !ids.includes(p.id));
  notifyDataChanged();
  Promise.all(ids.map(id => 
    fetch(`${API_BASE_URL}/api/properties/${id}`, { method: 'DELETE' })
  )).catch(() => {});
};

export const addTeamMember = (item: TeamMember) => {
  teamMembersDb = [item, ...teamMembersDb];
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/team-members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  }).catch(() => {});
};

export const updateTeamMember = (id: string, updated: Partial<TeamMember>) => {
  teamMembersDb = teamMembersDb.map(m => m.id === id ? { ...m, ...updated } : m);
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/team-members/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated)
  }).catch(() => {});
};

export const deleteTeamMember = (id: string) => {
  teamMembersDb = teamMembersDb.filter(m => m.id !== id);
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/team-members/${id}`, {
    method: 'DELETE'
  }).catch(() => {});
};

export const addEmployeeUser = (item: EmployeeUser) => {
  employeeUsersDb = [item, ...employeeUsersDb];
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/employees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  }).catch(() => {});
};

export const updateEmployeeUser = (id: string, updated: Partial<EmployeeUser>) => {
  employeeUsersDb = employeeUsersDb.map(u => u.id === id ? { ...u, ...updated } : u);
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/employees/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated)
  }).catch(() => {});
};

export const deleteEmployeeUser = (id: string) => {
  employeeUsersDb = employeeUsersDb.filter(u => u.id !== id);
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/employees/${id}`, {
    method: 'DELETE'
  }).catch(() => {});
};

export const updateRole = (id: string, permissions: string[]) => {
  rolesDb = rolesDb.map(r => r.id === id ? { ...r, permissions } : r);
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/roles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ permissions })
  }).catch(() => {});
};

export const addRole = (role: Role) => {
  rolesDb = [...rolesDb, role];
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/roles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(role)
  }).catch(() => {});
};

export const deleteRole = (id: string) => {
  rolesDb = rolesDb.filter(r => r.id !== id);
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/roles/${id}`, {
    method: 'DELETE'
  }).catch(() => {});
};

export const addFranchiseEnquiry = (item: FranchiseEnquiry) => {
  franchiseEnquiriesDb = [item, ...franchiseEnquiriesDb];
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/franchise-enquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  }).catch(() => {});
};

export const updateFranchiseEnquiryStatus = (id: string, status: FranchiseEnquiry['status']) => {
  franchiseEnquiriesDb = franchiseEnquiriesDb.map(e => e.id === id ? { ...e, status } : e);
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/franchise-enquiries/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  }).catch(() => {});
};

export const assignFranchiseEnquiryBroker = (id: string, brokerId: string, brokerName: string) => {
  franchiseEnquiriesDb = franchiseEnquiriesDb.map(e => e.id === id ? { ...e, assignedBrokerId: brokerId, assignedBrokerName: brokerName } : e);
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/franchise-enquiries/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assignedBrokerId: brokerId, assignedBrokerName: brokerName })
  }).catch(() => {});
};

export const deleteFranchiseEnquiry = (id: string) => {
  franchiseEnquiriesDb = franchiseEnquiriesDb.filter(e => e.id !== id);
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/franchise-enquiries/${id}`, {
    method: 'DELETE'
  }).catch(() => {});
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
  )).catch(() => {});
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
  )).catch(() => {});
};

export const bulkDeleteFranchises = (ids: string[]) => {
  franchiseDb = franchiseDb.filter(f => !ids.includes(f.id));
  notifyDataChanged();
  Promise.all(ids.map(id => 
    fetch(`${API_BASE_URL}/api/franchises/${id}`, { method: 'DELETE' })
  )).catch(() => {});
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
  }).catch(() => {});
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
    }).catch(() => {});
  }
};

export const deleteDemandRegion = (id: string) => {
  demandRegionsDb = demandRegionsDb.filter(r => r.id !== id);
  notifyDataChanged();
  fetch(`${API_BASE_URL}/api/demand-regions/${id}`, {
    method: 'DELETE'
  }).catch(() => {});
};
