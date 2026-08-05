import React, { useState, useEffect } from 'react';
import { propertiesDb, dealersDb, selectedCity, setSelectedCity, siteSettingsDb, franchiseDb, businessDb, getDistance, demandRegionsDb } from '../db/marketplaceDb';
import { ShowcaseVideoCarousel } from '../components/ShowcaseVideoCarousel';
import { usePropertySearch } from '../hooks/usePropertySearch';
import { useLocationStore } from '../context/LocationContext';
import { LocationSearchBar } from '../components/ui/LocationSearchBar';
import { DistanceFilterPills } from '../components/ui/DistanceFilterPills';
import { PropertyDistanceCard } from '../components/ui/PropertyDistanceCard';
import { EmptySearchState } from '../components/ui/EmptySearchState';
import {
  FaBuilding,
  FaHome,
  FaMapMarkerAlt,
  FaStore,
  FaBriefcase,
  FaShieldAlt,
  FaArrowRight,
  FaCheckCircle,
  FaCrown,
  FaStar,
  FaSearch,
  FaChevronDown,
  FaRegHeart,
  FaHeart,
  FaTag,
  FaHeadset,
  FaSlidersH,
  FaBed,
  FaBath,
  FaRulerCombined,
  FaChevronLeft,
  FaChevronRight,
  FaTree,
  FaLeaf,
  FaUsers,
  FaCity,
  FaCoins,
  FaSmile
} from 'react-icons/fa';

interface HomePageProps {
  onNavigate: (page: string, queryParams?: string) => void;
  onPropertyClick?: (id: string) => void;
}

const HERO_SLIDES = [
  {
    id: 'slide_1',
    title: 'Ultra Luxury Sky Villa with Private Pool',
    location: 'Gachibowli, Hyderabad',
    price: '₹1.82 Cr',
    bhk: '4 BHK',
    baths: '5 Bath',
    area: '3200 Sq.ft',
    type: 'Villa',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80',
    isPremium: true,
    isVerified: true
  },
  {
    id: 'slide_2',
    title: 'Modern High-Rise Penthouse in Benz Circle',
    location: 'Benz Circle, Vijayawada',
    price: '₹1.45 Cr',
    bhk: '3 BHK',
    baths: '3 Bath',
    area: '2400 Sq.ft',
    type: 'Apartment',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
    isPremium: true,
    isVerified: true
  },
  {
    id: 'slide_3',
    title: 'Prime Gated Villa Plot near AIIMS',
    location: 'Mangalagiri, Guntur',
    price: '₹65 Lakhs',
    bhk: 'Plot',
    baths: 'N/A',
    area: '240 Sq.Yds',
    type: 'Plots/Land',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&auto=format&fit=crop&q=80',
    isPremium: false,
    isVerified: true
  }
];

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onPropertyClick }) => {
  const [, setForceUpdate] = useState(0);
  useEffect(() => {
    const handler = () => setForceUpdate(prev => prev + 1);
    window.addEventListener('nexopp_data_changed', handler);
    return () => window.removeEventListener('nexopp_data_changed', handler);
  }, []);

  const spatialSearch = usePropertySearch({
    initialLocationName: 'Hyderabad',
    initialLat: 17.3850,
    initialLng: 78.4867,
    initialRadius: 50000,
  });

  const currentGlobalCity = selectedCity || 'Guntur';
  // Hero Carousel Index State
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const s = siteSettingsDb.mainPageStats || {
    propertiesListed: '18,500+',
    franchisesCount: '950+',
    verifiedBrokers: '2,400+',
    citiesCovered: '32',
    totalPropertyValue: '₹850 Cr+',
    happyClients: '15K+',
  };

  const stats = [
    { icon: FaHome, color: '#10B981', bg: '#ECFDF5', value: s.propertiesListed, label: 'Properties Listed' },
    { icon: FaStore, color: '#059669', bg: '#E6F4EA', value: s.franchisesCount, label: 'Franchises' },
    { icon: FaUsers, color: '#16A34A', bg: '#DCFCE7', value: s.verifiedBrokers, label: 'Verified Brokers' },
    { icon: FaCity, color: '#0D9488', bg: '#CCFBF1', value: s.citiesCovered, label: 'Cities Covered' },
    { icon: FaCoins, color: '#059669', bg: '#ECFDF5', value: s.totalPropertyValue, label: 'Total Property Value' },
    { icon: FaSmile, color: '#10B981', bg: '#DCFCE7', value: s.happyClients, label: 'Happy Clients' },
  ];

  // Search Bar Filter States
  const [activeSearchTab, setActiveSearchTab] = useState<'Property' | 'Franchise' | 'Business' | 'Plots/Land' | 'Commercial'>('Property');
  const [searchLocation, setSearchLocationState] = useState(selectedCity || 'Guntur');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('BHK');
  const [budgetFilter, setBudgetFilter] = useState('₹5L - ₹5 Cr');
  const [priceRangeFilter, setPriceRangeFilter] = useState('Any');
  const [selectedTag, setSelectedTag] = useState('Villa');
  const [wishlisted, setWishlisted] = useState<Record<string, boolean>>({});

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlisted((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchLocation) params.set('location', searchLocation);
    if (propertyTypeFilter && propertyTypeFilter !== 'Any' && propertyTypeFilter !== 'BHK') params.set('type', propertyTypeFilter);
    if (budgetFilter && budgetFilter !== 'Any') params.set('budget', budgetFilter);
    if (priceRangeFilter && priceRangeFilter !== 'Any') params.set('priceRange', priceRangeFilter);

    const query = params.toString() ? `?${params.toString()}` : '';

    if (activeSearchTab === 'Property') {
      onNavigate('propertiesPage', query);
    } else if (activeSearchTab === 'Franchise') {
      onNavigate('franchisePage', query);
    } else if (activeSearchTab === 'Business') {
      onNavigate('businessPage', query);
    } else if (activeSearchTab === 'Plots/Land') {
      onNavigate('landPage', query);
    } else if (activeSearchTab === 'Commercial') {
      params.set('type', 'Commercial Property');
      onNavigate('propertiesPage', `?${params.toString()}`);
    }
  };

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const currentSlide = HERO_SLIDES[currentSlideIndex];

  // Category Cards List matching the unified Emerald theme
  const popularCategories = [
    { title: 'Residential', subtitle: 'Find your dream home', icon: FaHome, bg: '#ECFDF5', color: '#10B981', page: 'flatsPage' },
    { title: 'Commercial', subtitle: 'Office, Shops & Spaces', icon: FaBuilding, bg: '#E6F4EA', color: '#059669', page: 'propertiesPage' },
    { title: 'Plots & Land', subtitle: 'Invest in Prime Land', icon: FaLeaf, bg: '#DCFCE7', color: '#16A34A', page: 'landPage' },
    { title: 'Franchise', subtitle: 'Start your Business', icon: FaStore, bg: '#ECFDF5', color: '#059669', page: 'franchisePage' },
    { title: 'Business', subtitle: 'Buy Profitable Business', icon: FaBriefcase, bg: '#CCFBF1', color: '#0D9488', page: 'businessPage' },
    { title: 'Finance & Insurance', subtitle: 'Secure your Future', icon: FaShieldAlt, bg: '#DCFCE7', color: '#10B981', page: 'financePage' },
  ];

  // Recently Sold properties (Latest 8 ordered by soldDate descending)
  const recentlySoldListings = propertiesDb
    .filter((p) => p.sold || p.approvalStatus === 'Sold' || p.listingStatus === 'Sold')
    .sort((a, b) => {
      const dateA = a.soldDate ? new Date(a.soldDate).getTime() : 0;
      const dateB = b.soldDate ? new Date(b.soldDate).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 8)
    .map((p) => {
      return {
        id: p.id,
        title: p.title || `${p.bedrooms || 3} BHK ${p.category}`,
        price: p.priceDisplay || (`₹${p.price || 1} L`),
        image: p.image || p.imageUrl || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&auto=format&fit=crop&q=80',
        location: `${p.area ? p.area + ', ' : ''}${p.city || 'Guntur'}`,
        bhk: `${p.bedrooms || 3} BHK`,
        area: p.sqft ? `${p.sqft} Sq.ft` : (p.builtUpArea ? `${p.builtUpArea} Sq.ft` : '1500 Sq.ft'),
        soldDate: p.soldDate
      };
    });

  // Featured Listings from marketplaceDb
  // Get the target region for distance calculations
  const region = demandRegionsDb.find(r => r.name.toLowerCase() === currentGlobalCity.toLowerCase()) || null;

  const filterAndSortByDistance = (items: any[], isProperty = false) => {
    return items.filter(item => {
      if (isProperty && (item.sold || item.approvalStatus === 'Sold' || item.listingStatus === 'Sold')) return false;

      const itemCity = (item.city || '').toLowerCase();
      const itemLocStr = (item.location || '').toLowerCase();
      const itemTitle = (item.title || item.brand || item.name || '').toLowerCase();
      const targetLoc = currentGlobalCity.toLowerCase();

      // Exact match
      let exactMatch = itemCity === targetLoc || itemLocStr.includes(targetLoc) || itemTitle.includes(targetLoc);

      if (exactMatch) {
        item.distanceKm = 0;
        return true;
      }

      // Distance match if lat/lng available
      if (region && region.latitude && region.longitude && item.latitude && item.longitude) {
        const dist = getDistance(region.latitude, region.longitude, item.latitude, item.longitude);
        item.distanceKm = dist;
        return dist <= 300; // Return true if within 300km
      }

      // If no exact match and no coordinates available, exclude
      return false;
    }).sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
  };

  // Featured Listings from marketplaceDb (Ensure at least 4 items so grid is full)
  const filteredProperties = filterAndSortByDistance(propertiesDb, true);
  const rawListings = filteredProperties.length >= 2 ? filteredProperties : propertiesDb;
  const featuredListings = rawListings.slice(0, 4).map((p) => {
    const assignedBroker = dealersDb.find(d => d.id === p.dealerId || (p.assignedBrokerIds && p.assignedBrokerIds.includes(d.id)));
    const brokerName = assignedBroker?.companyName || assignedBroker?.fullName || p.agentName || 'RealtyPlus Advisors';
    const brokerImg = assignedBroker?.photo || assignedBroker?.logo || p.agentImage || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80';
    return {
      id: p.id,
      title: p.title || `${p.bedrooms || 3} BHK ${p.category}`,
      price: p.priceDisplay || (`₹ ${p.price || 75} Lakh`),
      badge: p.verified ? 'Verified' : (p.premium ? 'Premium' : 'New Launch'),
      badgeColor: p.verified ? '#DCFCE7' : (p.premium ? '#FEF08A' : '#E0E7FF'),
      badgeText: p.verified ? '#16A34A' : (p.premium ? '#854D0E' : '#4F46E5'),
      badgeIcon: p.verified ? FaCheckCircle : (p.premium ? FaCrown : FaStar),
      image: p.image || p.imageUrl || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&auto=format&fit=crop&q=80',
      location: `${p.area ? p.area + ', ' : ''}${p.city || 'Guntur'}`,
      bhk: `${p.bedrooms || 3} BHK`,
      area: p.sqft ? `${p.sqft} Sq.ft` : (p.builtUpArea ? `${p.builtUpArea} Sq.ft` : '1500 Sq.ft'),
      brokerName,
      brokerImg,
      approvalStatus: p.approvalStatus,
      listingStatus: p.listingStatus,
    };
  });

  const rawFranchises = filterAndSortByDistance(franchiseDb);
  const featuredFranchises = (rawFranchises.length >= 2 ? rawFranchises : franchiseDb).slice(0, 4);

  const rawBusinesses = filterAndSortByDistance(businessDb);
  const featuredBusinesses = (rawBusinesses.length >= 2 ? rawBusinesses : businessDb).slice(0, 4);

  return (
    <div className="homepage-wrapper" style={{ backgroundColor: '#F8FAFC', paddingBottom: '60px', fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      
      {/* 1. HERO SECTION */}
      <div id="hero" className="hero-section-container" style={{ maxWidth: '1360px', margin: '0 auto' }}>
        <div className="responsive-hero-grid">
          
          {/* Left Column: Headline & Value Proposition */}
          <div>
            {/* Top Trust Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#475569',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
              marginBottom: '20px'
            }}>
              <FaShieldAlt style={{ color: '#10B981', fontSize: '14px' }} />
              <span>Trusted by 10,000+ Buyers & Investors</span>
            </div>

            {/* Headline */}
            <h1 style={{
              fontSize: '2.8rem',
              fontWeight: 900,
              color: '#0F172A',
              lineHeight: 1.15,
              margin: '0 0 20px 0',
              letterSpacing: '-0.03em'
            }}>
              Your Next Opportunity Is Just <span style={{ color: '#00A86B' }}>One Click Away</span>
            </h1>

            {/* Subtitle */}
            <p style={{
              fontSize: '1.05rem',
              color: '#64748B',
              lineHeight: 1.6,
              margin: '0 0 32px 0',
              maxWidth: '520px',
              fontWeight: 400
            }}>
              Discover verified properties, premium franchises, profitable businesses, financing & insurance — all in one place.
            </p>

            {/* Trust Features Row */}
            <div className="responsive-trust-badges">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FaShieldAlt style={{ color: '#10B981', fontSize: '18px' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A' }}>Verified Listings</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>100% Trusted</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FaTag style={{ color: '#10B981', fontSize: '16px' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A' }}>Best Prices</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Market Competitive</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FaHeadset style={{ color: '#10B981', fontSize: '18px' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A' }}>Expert Support</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>We're Here to Help</div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Featured Interactive Showcase Card */}
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'relative',
              borderRadius: '24px',
              overflow: 'hidden',
              height: '380px',
              boxShadow: '0 20px 40px rgba(15, 23, 42, 0.15)',
              backgroundColor: '#0F172A'
            }}>
              {/* Card Image */}
              <img
                src={currentSlide.image}
                alt={currentSlide.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(1.15) contrast(1.05)' }}
              />
              
              {/* Overlay Gradient (Lightened so picture is bright) */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(to top, rgba(2, 6, 23, 0.75) 0%, rgba(2, 6, 23, 0.1) 60%, transparent 100%)'
              }} />

              {/* Slide Counter / Category Badge */}
              <div style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(4px)',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 800,
                color: '#0F172A',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}>
                ⭐ Featured {currentSlide.type}
              </div>

              {/* Slider Controls */}
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <button
                  onClick={handlePrevSlide}
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    backdropFilter: 'blur(4px)',
                    color: '#FFF',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <FaChevronLeft style={{ fontSize: '12px' }} />
                </button>
                <button
                  onClick={handleNextSlide}
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    backdropFilter: 'blur(4px)',
                    color: '#FFF',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <FaChevronRight style={{ fontSize: '12px' }} />
                </button>
              </div>

              {/* Content Overlay */}
              <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', color: '#FFFFFF' }}>
                <h3 className="hero-slide-title" style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 6px 0', textShadow: '0 2px 10px rgba(0,0,0,0.95)' }}>
                  {currentSlide.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#F1F5F9', opacity: 0.95, margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '6px', textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}>
                  <FaMapMarkerAlt style={{ color: '#10B981' }} /> {currentSlide.location}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#34D399', textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}>
                    {currentSlide.price}
                  </span>
                  <button
                    onClick={() => onNavigate('propertiesPage')}
                    style={{
                      backgroundColor: '#10B981',
                      color: '#FFF',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    View Listing <FaArrowRight style={{ fontSize: '10px' }} />
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* 2. MAIN SEARCH FILTER CARD */}
      <div style={{ maxWidth: '1360px', margin: '0 auto 50px auto', padding: '0 24px' }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '0 10px 40px rgba(15, 23, 42, 0.06)',
          border: '1px solid #E2E8F0'
        }}>
          
          {/* Top Tabs */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            marginBottom: '20px',
            borderBottom: '1px solid #F1F5F9',
            paddingBottom: '16px'
          }}>
            {[
              { id: 'Property', label: 'Property', icon: FaHome },
              { id: 'Franchise', label: 'Franchise', icon: FaStore },
              { id: 'Business', label: 'Business', icon: FaBriefcase },
              { id: 'Plots/Land', label: 'Plots/Land', icon: FaMapMarkerAlt },
              { id: 'Commercial', label: 'Commercial', icon: FaBuilding },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeSearchTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSearchTab(tab.id as any)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    borderRadius: '30px',
                    border: isActive ? 'none' : '1px solid #E2E8F0',
                    backgroundColor: isActive ? '#00A86B' : '#F8FAFC',
                    color: isActive ? '#FFFFFF' : '#475569',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? '0 4px 14px rgba(0, 168, 107, 0.3)' : 'none',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <TabIcon style={{ fontSize: '14px' }} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Filter Dropdowns Grid */}
          <div className="top-search-filter-bar-home">
            {/* 1. Search Location */}
            <div style={{
              backgroundColor: '#F8FAFC',
              border: '1.5px solid #E2E8F0',
              borderRadius: '14px',
              padding: '10px 14px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                Search Location
              </span>
              <select
                value={searchLocation}
                onChange={(e) => {
                  setSearchLocationState(e.target.value);
                  setSelectedCity(e.target.value);
                }}
                style={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  color: '#0F172A',
                  outline: 'none',
                  cursor: 'pointer',
                  paddingTop: '2px'
                }}
              >
                <option value="Guntur">Guntur</option>
                <option value="Vijayawada">Vijayawada</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Visakhapatnam">Visakhapatnam</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Chennai">Chennai</option>
              </select>
            </div>

            {/* 2. Dynamic Type/Category Field */}
            <div style={{
              backgroundColor: '#F8FAFC',
              border: '1.5px solid #E2E8F0',
              borderRadius: '14px',
              padding: '10px 14px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                {activeSearchTab === 'Franchise' ? 'Industry' : 
                 activeSearchTab === 'Business' ? 'Category' : 
                 activeSearchTab === 'Plots/Land' ? 'Land Type' : 'Property Type'}
              </span>
              <select
                value={propertyTypeFilter}
                onChange={(e) => setPropertyTypeFilter(e.target.value)}
                style={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  color: '#0F172A',
                  outline: 'none',
                  cursor: 'pointer',
                  paddingTop: '2px'
                }}
              >
                {activeSearchTab === 'Property' && (
                  <>
                    <option value="BHK">BHK</option>
                    <option value="1 BHK">1 BHK</option>
                    <option value="2 BHK">2 BHK</option>
                    <option value="3 BHK">3 BHK</option>
                    <option value="4 BHK">4 BHK / Villa</option>
                  </>
                )}
                {activeSearchTab === 'Franchise' && (
                  <>
                    <option value="Any">Any</option>
                    <option value="Food & Beverage">Food & Beverage</option>
                    <option value="Retail">Retail</option>
                    <option value="Education">Education</option>
                    <option value="Healthcare">Healthcare</option>
                  </>
                )}
                {activeSearchTab === 'Business' && (
                  <>
                    <option value="Any">Any</option>
                    <option value="Tech">Tech</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Retail">Retail</option>
                    <option value="Services">Services</option>
                  </>
                )}
                {activeSearchTab === 'Plots/Land' && (
                  <>
                    <option value="Any">Any</option>
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Agricultural">Agricultural</option>
                    <option value="Industrial">Industrial</option>
                  </>
                )}
                {activeSearchTab === 'Commercial' && (
                  <>
                    <option value="Any">Any</option>
                    <option value="Office Space">Office Space</option>
                    <option value="Retail Shop">Retail Shop</option>
                    <option value="Warehouse">Warehouse</option>
                  </>
                )}
              </select>
            </div>

            {/* 3. Budget / Investment */}
            <div style={{
              backgroundColor: '#F8FAFC',
              border: '1.5px solid #E2E8F0',
              borderRadius: '14px',
              padding: '10px 14px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                {(activeSearchTab === 'Franchise' || activeSearchTab === 'Business') ? 'Investment Size' : 'Budget'}
              </span>
              <select
                value={budgetFilter}
                onChange={(e) => setBudgetFilter(e.target.value)}
                style={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  color: '#0F172A',
                  outline: 'none',
                  cursor: 'pointer',
                  paddingTop: '2px'
                }}
              >
                <option value="₹5L - ₹5 Cr">₹5L - ₹5 Cr</option>
                <option value="Under ₹50L">Under ₹50L</option>
                <option value="₹50L - ₹1 Cr">₹50L - ₹1 Cr</option>
                <option value="₹1 Cr - ₹3 Cr">₹1 Cr - ₹3 Cr</option>
                <option value="₹3 Cr+">₹3 Cr+</option>
              </select>
            </div>

            {/* 4. Price Range */}
            <div style={{
              backgroundColor: '#F8FAFC',
              border: '1.5px solid #E2E8F0',
              borderRadius: '14px',
              padding: '10px 14px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                Price Range
              </span>
              <select
                value={priceRangeFilter}
                onChange={(e) => setPriceRangeFilter(e.target.value)}
                style={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  color: '#0F172A',
                  outline: 'none',
                  cursor: 'pointer',
                  paddingTop: '2px'
                }}
              >
                <option value="Any">Any</option>
                <option value="Min Price">Min Price</option>
                <option value="Max Price">Max Price</option>
              </select>
            </div>

            {/* 5. More Filters Button */}
            <button
              onClick={() => onNavigate('propertiesPage')}
              style={{
                padding: '16px 20px',
                borderRadius: '14px',
                border: '1.5px solid #E2E8F0',
                backgroundColor: '#F8FAFC',
                color: '#475569',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap'
              }}
            >
              <FaSlidersH /> More Filters
            </button>

            {/* 6. Search Button */}
            <button
              onClick={handleSearch}
              style={{
                padding: '16px 28px',
                borderRadius: '14px',
                backgroundColor: '#00A86B',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                whiteSpace: 'nowrap',
                boxShadow: '0 6px 18px rgba(0, 168, 107, 0.3)'
              }}
            >
              <FaSearch /> Search Properties
            </button>

          </div>

          {/* Use My Location Checkbox */}
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontSize: '0.88rem',
              fontWeight: 700,
              color: '#00A86B',
              userSelect: 'none'
            }}>
              <input
                type="checkbox"
                style={{ width: '16px', height: '16px', accentColor: '#00A86B', cursor: 'pointer', borderRadius: '4px' }}
              />
              Use My Location
            </label>
          </div>

          {/* Popular Searches & Advanced Search Section */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid #F1F5F9'
          }}>
            {/* Top: Popular Searches Tags */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', marginRight: '4px' }}>
                Popular Searches:
              </span>
              {['Apartment', 'Villa', 'Plots', 'Commercial', 'Franchise', 'Farm Land'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSelectedTag(tag);
                    if (tag === 'Apartment') onNavigate('flatsPage');
                    else if (tag === 'Plots') onNavigate('landPage');
                    else if (tag === 'Franchise') onNavigate('franchisePage');
                    else onNavigate('propertiesPage');
                  }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '16px',
                    border: tag === selectedTag ? 'none' : '1px solid #E2E8F0',
                    backgroundColor: tag === selectedTag ? '#DCFCE7' : '#F8FAFC',
                    color: tag === selectedTag ? '#16A34A' : '#64748B',
                    fontWeight: tag === selectedTag ? 800 : 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Bottom: Advanced Search Link directly below */}
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '4px' }}>
              <button
                onClick={() => onNavigate('propertiesPage')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#00A86B',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: 0
                }}
              >
                <span>Advanced Search</span>
                <FaArrowRight style={{ fontSize: '12px' }} />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Stats Row (6 Cards in a spacious 3x2 Grid) */}
      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '0 24px 44px 24px' }}>
        <div className="responsive-stats-grid">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  padding: '20px 24px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.04)';
                }}
              >
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    backgroundColor: stat.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon style={{ color: stat.color, fontSize: '20px' }} />
                </div>
                <div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', margin: '4px 0 0 0' }}>
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. POPULAR CATEGORIES SECTION */}
      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '0 24px 40px 24px' }}>
        
        {/* Section Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Popular Categories
          </h2>
          <button
            onClick={() => onNavigate('propertiesPage')}
            style={{
              background: 'none',
              border: 'none',
              color: '#10B981',
              fontWeight: 700,
              fontSize: '0.92rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>View All Categories</span>
            <FaArrowRight style={{ fontSize: '12px' }} />
          </button>
        </div>

        {/* Categories Grid */}
        <div className="responsive-category-grid">
          {popularCategories.map((cat, idx) => {
            const CatIcon = cat.icon;
            return (
              <div
                key={idx}
                onClick={() => onNavigate(cat.page)}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  border: '1px solid #E2E8F0',
                  padding: '24px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = cat.color;
                  e.currentTarget.style.boxShadow = '0 12px 25px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)';
                }}
              >
                {/* Icon Container */}
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  backgroundColor: cat.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <CatIcon style={{ color: cat.color, fontSize: '20px' }} />
                </div>

                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
                  {cat.title}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 500, lineHeight: 1.4 }}>
                  {cat.subtitle}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* 4. SHOWCASE & FEATURED PROPERTIES */}
      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '0 24px' }}>
        <ShowcaseVideoCarousel onNavigate={onNavigate} onPropertyClick={onPropertyClick} />
      </div>

      
      {/* OLX-STYLE POSTGIS RADIUS LOCATION SEARCH SECTION */}
      <div id="spatial-property-search-section" style={{ maxWidth: '1360px', margin: '40px auto 20px auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
            Properties Near {spatialSearch.locationName}
          </h2>
          <p style={{ color: '#64748B', margin: 0, fontSize: '0.95rem', fontWeight: 500 }}>
            Explore verified properties sorted by nearest distance using PostGIS spatial intelligence.
          </p>
        </div>

        {/* Distance Filter Pills (50km, 100km, 200km, Anywhere) */}
        <DistanceFilterPills
          locationName={spatialSearch.locationName}
          selectedRadius={spatialSearch.radiusMeters}
          onRadiusChange={spatialSearch.changeRadius}
          totalCount={spatialSearch.totalCount}
        />

        {/* Loading State */}
        {spatialSearch.loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', margin: '24px 0' }}>
            {[1, 2, 3, 4].map(n => (
              <div key={n} style={{ height: '340px', backgroundColor: '#F1F5F9', borderRadius: '16px' }} />
            ))}
          </div>
        )}

        {/* Property Grid or Empty State */}
        {!spatialSearch.loading && spatialSearch.properties.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {spatialSearch.properties.map(p => (
              <PropertyDistanceCard
                key={p.id}
                property={p}
                onViewDetails={id => onPropertyClick ? onPropertyClick(id) : onNavigate('propertyDetails', `?propertyId=${id}`)}
              />
            ))}
          </div>
        ) : !spatialSearch.loading && spatialSearch.properties.length === 0 ? (
          <EmptySearchState
            locationName={spatialSearch.locationName}
            currentRadius={spatialSearch.radiusMeters}
            onExpandRadius={spatialSearch.changeRadius}
          />
        ) : null}
      </div>

      {/* FEATURED PROPERTIES GRID */}
      {featuredListings.length > 0 && (
        <div style={{ maxWidth: '1360px', margin: '40px auto 20px auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Properties in {currentGlobalCity}</h2>
            <p style={{ color: '#64748B', margin: 0, fontSize: '0.92rem', fontWeight: 500 }}>Top recommended residential and commercial properties.</p>
          </div>
          <div className="responsive-property-grid">
            {featuredListings.map((prop, idx) => (
              <div
                key={idx}
                onClick={() => onPropertyClick ? onPropertyClick(prop.id) : onNavigate('propertyDetails', `?propertyId=${prop.id}`)}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
              >
                {/* Image Container with Heart & Yellow Featured Tag */}
                <div style={{ position: 'relative', height: '145px', width: '100%', overflow: 'hidden' }}>
                  <img src={prop.image} alt={prop.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(prop.id, e); }}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      backgroundColor: '#FFFFFF',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                      cursor: 'pointer',
                      zIndex: 5
                    }}
                  >
                    {wishlisted[prop.id] ? (
                      <FaHeart style={{ color: '#EF4444', fontSize: '14px' }} />
                    ) : (
                      <FaRegHeart style={{ color: '#0F172A', fontSize: '14px' }} />
                    )}
                  </button>

                  <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '8px',
                    backgroundColor: '#FACC15',
                    color: '#0F172A',
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    zIndex: 5
                  }}>
                    FEATURED
                  </div>
                </div>

                {/* Details Container with Yellow Left Border Line (Picture 2 OLX Accent) */}
                <div style={{
                  padding: '10px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  justifyContent: 'space-between',
                  borderLeft: '4px solid #FACC15',
                  backgroundColor: '#FFFFFF'
                }}>
                  <div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0F172A', marginBottom: '2px', lineHeight: 1.2 }}>
                      {prop.price}
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {prop.title}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {prop.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
            <button onClick={() => onNavigate('propertiesPage')} style={{ padding: '12px 28px', backgroundColor: '#0F172A', color: '#FFF', borderRadius: '30px', fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>View More Properties</button>
          </div>
        </div>
      )}

      {/* FEATURED FRANCHISES GRID */}
      {featuredFranchises.length > 0 && (
        <div style={{ maxWidth: '1360px', margin: '40px auto 20px auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Franchises in {currentGlobalCity}</h2>
            <p style={{ color: '#64748B', margin: 0, fontSize: '0.92rem', fontWeight: 500 }}>Top brand opportunities available for setup.</p>
          </div>
          <div className="responsive-property-grid">
            {featuredFranchises.map((f, idx) => (
              <div
                key={idx}
                onClick={() => onNavigate('franchiseDetails', `?franchiseId=${f.id}`)}
                style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', position: 'relative' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 25px rgba(0,0,0,0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)'; }}
              >
                <div style={{ position: 'relative', height: '200px' }}>
                  <img src={f.logo || f.image || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=500&q=80'} alt={f.brand} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '16px' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>{f.investmentDisplay}</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.brand}</div>
                  <div style={{ color: '#64748B', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
                    <FaMapMarkerAlt /> {f.city || currentGlobalCity}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
            <button onClick={() => onNavigate('franchisePage')} style={{ padding: '12px 28px', backgroundColor: '#0F172A', color: '#FFF', borderRadius: '30px', fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>View More Franchises</button>
          </div>
        </div>
      )}

      {/* FEATURED BUSINESSES GRID */}
      {featuredBusinesses.length > 0 && (
        <div style={{ maxWidth: '1360px', margin: '40px auto 40px auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Businesses in {currentGlobalCity}</h2>
            <p style={{ color: '#64748B', margin: 0, fontSize: '0.92rem', fontWeight: 500 }}>Turnkey operations and commercial businesses for sale.</p>
          </div>
          <div className="responsive-property-grid">
            {featuredBusinesses.map((b, idx) => (
              <div
                key={idx}
                onClick={() => onNavigate('businessPage')}
                style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', position: 'relative' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 25px rgba(0,0,0,0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)'; }}
              >
                <div style={{ position: 'relative', height: '200px' }}>
                  <img src={b.image || 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=500&q=80'} alt={b.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '16px' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>{b.priceDisplay}</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.name}</div>
                  <div style={{ color: '#64748B', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
                    <FaMapMarkerAlt /> {b.city || currentGlobalCity}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
            <button onClick={() => onNavigate('businessPage')} style={{ padding: '12px 28px', backgroundColor: '#0F172A', color: '#FFF', borderRadius: '30px', fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>View More Businesses</button>
          </div>
        </div>
      )}

      {/* 5. RECENTLY SOLD PROPERTIES SECTION */}
      {recentlySoldListings.length > 0 && (
        <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '40px 24px 60px 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Recently Sold
            </h2>
            <p style={{ color: '#64748B', margin: 0, fontSize: '0.92rem', fontWeight: 500 }}>
              Explore properties successfully sold through NexOpp.
            </p>
          </div>
          <div className="responsive-property-grid">
            {recentlySoldListings.map((prop, idx) => (
              <div
                key={idx}
                onClick={() => onPropertyClick ? onPropertyClick(prop.id) : onNavigate(`propertyDetails_${prop.id}`)}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 25px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)';
                }}
              >
                <div style={{ position: 'relative', height: '200px' }}>
                  <img src={prop.image} alt={prop.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {/* Red SOLD Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: '#DC2626',
                    color: '#FFFFFF',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    boxShadow: '0 2px 8px rgba(220, 38, 38, 0.4)',
                    zIndex: 10,
                    fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif"
                  }}>
                    SOLD
                  </div>
                </div>
                <div style={{ padding: '16px' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>{prop.price}</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prop.title}</div>
                  <div style={{ color: '#64748B', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
                    <FaMapMarkerAlt /> {prop.location}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#475569', fontSize: '0.85rem', fontWeight: 600 }}>
                      <FaBed style={{ color: '#94A3B8' }} /> {prop.bhk}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#475569', fontSize: '0.85rem', fontWeight: 600 }}>
                      <FaRulerCombined style={{ color: '#94A3B8' }} /> {prop.area}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default HomePage;
