import React, { useState } from 'react';
import { propertiesDb, dealersDb, selectedCity, setSelectedCity, siteSettingsDb } from '../db/marketplaceDb';
import { ShowcaseVideoCarousel } from '../components/ShowcaseVideoCarousel';
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
    { icon: FaHome, color: '#16A34A', bg: '#DCFCE7', value: s.propertiesListed, label: 'Properties Listed' },
    { icon: FaStore, color: '#9333EA', bg: '#F3E8FF', value: s.franchisesCount, label: 'Franchises' },
    { icon: FaUsers, color: '#EA580C', bg: '#FFEDD5', value: s.verifiedBrokers, label: 'Verified Brokers' },
    { icon: FaCity, color: '#2563EB', bg: '#DBEAFE', value: s.citiesCovered, label: 'Cities Covered' },
    { icon: FaCoins, color: '#DB2777', bg: '#FCE7F3', value: s.totalPropertyValue, label: 'Total Property Value' },
    { icon: FaSmile, color: '#16A34A', bg: '#DCFCE7', value: s.happyClients, label: 'Happy Clients' },
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

  // Category Cards List matching the mockup
  const popularCategories = [
    { title: 'Residential', subtitle: 'Find your dream home', icon: FaHome, bg: '#DCFCE7', color: '#16A34A', page: 'flatsPage' },
    { title: 'Commercial', subtitle: 'Office, Shops & Spaces', icon: FaBuilding, bg: '#DBEAFE', color: '#2563EB', page: 'propertiesPage' },
    { title: 'Plots & Land', subtitle: 'Invest in Prime Land', icon: FaLeaf, bg: '#DCFCE7', color: '#16A34A', page: 'landPage' },
    { title: 'Franchise', subtitle: 'Start your Business', icon: FaStore, bg: '#F3E8FF', color: '#9333EA', page: 'franchisePage' },
    { title: 'Business', subtitle: 'Buy Profitable Business', icon: FaBriefcase, bg: '#E0F2FE', color: '#0284C7', page: 'businessPage' },
    { title: 'Finance & Insurance', subtitle: 'Secure your Future', icon: FaShieldAlt, bg: '#DCFCE7', color: '#16A34A', page: 'financePage' },
  ];

  // Recently Sold properties
  const recentlySoldListings = propertiesDb
    .filter((p) => p.showSoldOnHomepage && (p.approvalStatus === 'Sold' || p.listingStatus === 'Sold'))
    .map((p) => {
      return {
        id: p.id,
        title: p.title || `${p.bedrooms || 3} BHK ${p.category}`,
        price: p.priceDisplay || (`₹${p.price || 1} L`),
        image: p.image || p.imageUrl || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&auto=format&fit=crop&q=80',
        location: `${p.area ? p.area + ', ' : ''}${p.city || 'Guntur'}`,
        bhk: `${p.bedrooms || 3} BHK`,
        area: p.sqft ? `${p.sqft} Sq.ft` : (p.builtUpArea ? `${p.builtUpArea} Sq.ft` : '1500 Sq.ft'),
      };
    });

  // Featured Listings from marketplaceDb
  const featuredListings = propertiesDb.slice(0, 4).map((p) => {
    const assignedBroker = dealersDb.find(d => d.id === p.dealerId || (p.assignedBrokerIds && p.assignedBrokerIds.includes(d.id)));
    const brokerName = assignedBroker?.companyName || assignedBroker?.fullName || p.agentName || 'RealtyPlus Advisors';
    const brokerImg = assignedBroker?.photo || assignedBroker?.logo || p.agentImage || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80';
    return {
      id: p.id,
      title: p.title || `${p.bedrooms || 3} BHK ${p.category}`,
      price: p.priceDisplay || (`₹${p.price || 1} L`),
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

  return (
    <div style={{ backgroundColor: '#F8FAFC', paddingBottom: '60px', paddingTop: '80px', fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      
      {/* 1. HERO SECTION */}
      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '50px 24px 20px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: '36px', alignItems: 'center' }}>
          
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

            {/* Main Headline */}
            <h1 style={{
              fontSize: '3.2rem',
              fontWeight: 900,
              lineHeight: 1.15,
              color: '#0F172A',
              letterSpacing: '-0.03em',
              margin: '0 0 18px 0'
            }}>
              Your Next Opportunity<br />
              Is Just <span style={{ color: '#10B981', position: 'relative', display: 'inline-block' }}>
                One Click Away
                {/* Curved Yellow Underline Accent */}
                <svg style={{ position: 'absolute', bottom: '-10px', left: 0, width: '100%', height: '14px' }} viewBox="0 0 200 12" fill="none">
                  <path d="M3 9C55 3 145 3 197 9" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
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
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              
              {/* Overlay Gradient */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(180deg, rgba(15,23,42,0.3) 0%, rgba(15,23,42,0.85) 100%)'
              }} />

              {/* Badges Top Left */}
              <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', gap: '8px', zIndex: 3 }}>
                <span style={{
                  padding: '6px 14px',
                  backgroundColor: '#FEF08A',
                  color: '#854D0E',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <FaCrown /> Premium Listing
                </span>
                <span style={{
                  padding: '6px 14px',
                  backgroundColor: '#DCFCE7',
                  color: '#16A34A',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <FaCheckCircle /> Verified
                </span>
              </div>

              {/* Wishlist Button Top Right */}
              <button
                onClick={(e) => toggleWishlist(currentSlide.id, e)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.85)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 3
                }}
              >
                {wishlisted[currentSlide.id] ? (
                  <FaHeart style={{ color: '#EF4444', fontSize: '18px' }} />
                ) : (
                  <FaRegHeart style={{ color: '#1E293B', fontSize: '18px' }} />
                )}
              </button>

              {/* Navigation Arrow Buttons */}
              <button
                onClick={handlePrevSlide}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  zIndex: 4
                }}
              >
                <FaChevronLeft style={{ fontSize: '14px', color: '#1E293B' }} />
              </button>

              <button
                onClick={handleNextSlide}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  zIndex: 4
                }}
              >
                <FaChevronRight style={{ fontSize: '14px', color: '#1E293B' }} />
              </button>

              {/* Bottom Details Overlay */}
              <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', zIndex: 3, color: '#FFFFFF' }}>
                <div style={{ fontSize: '0.9rem', color: '#E2E8F0', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <FaMapMarkerAlt style={{ color: '#10B981' }} />
                  <span>{currentSlide.location}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.85rem', color: '#CBD5E1' }}>
                    <span><FaBed /> {currentSlide.bhk}</span>
                    <span><FaBath /> {currentSlide.baths}</span>
                    <span><FaRulerCombined /> {currentSlide.area}</span>
                    <span><FaHome /> {currentSlide.type}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#FFFFFF' }}>
                      {currentSlide.price}
                    </span>
                    <button
                      onClick={() => onNavigate('propertiesPage')}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#10B981',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '20px',
                        fontWeight: 800,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      View Details <FaArrowRight style={{ fontSize: '12px' }} />
                    </button>
                  </div>
                </div>

                {/* Carousel Dots */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '12px' }}>
                  {HERO_SLIDES.map((_, idx) => (
                    <div
                      key={idx}
                      onClick={() => setCurrentSlideIndex(idx)}
                      style={{
                        width: idx === currentSlideIndex ? '20px' : '7px',
                        height: '7px',
                        borderRadius: '4px',
                        backgroundColor: idx === currentSlideIndex ? '#10B981' : 'rgba(255,255,255,0.4)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    />
                  ))}
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>

      {/* 2. FLOATING SEARCH & FILTER CARD (Wide Horizontal Bar as in Picture 2) */}
      <div style={{ maxWidth: '1360px', margin: '24px auto 48px auto', padding: '0 24px' }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '32px 36px',
          boxShadow: '0 20px 50px -10px rgba(15, 23, 42, 0.07), 0 0 1px rgba(0,0,0,0.05)',
          border: '1px solid #E2E8F0'
        }}>
          
          {/* Top Category Tabs (5 Pills in 1 Single Horizontal Row) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', flexWrap: 'nowrap', overflowX: 'auto' }}>
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
                    padding: '10px 22px',
                    borderRadius: '20px',
                    border: isActive ? 'none' : '1px solid #E2E8F0',
                    backgroundColor: isActive ? '#00A86B' : '#F8FAFC',
                    color: isActive ? '#FFFFFF' : '#475569',
                    fontWeight: isActive ? 800 : 600,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
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

          {/* Filter Dropdowns Grid (1 Horizontal Row) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.3fr 1.1fr 1.1fr 1.1fr auto 1.4fr',
            gap: '14px',
            alignItems: 'center'
          }}>

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

          {/* Popular Searches Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid #F1F5F9'
          }}>
            {/* Left: Popular Searches */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569' }}>
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
                    padding: '6px 16px',
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

            {/* Right: Advanced Search Link */}
            <button
              onClick={() => onNavigate('propertiesPage')}
              style={{
                background: 'none',
                border: 'none',
                color: '#00A86B',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              Advanced Search <FaArrowRight style={{ fontSize: '11px' }} />
            </button>
          </div>

        </div>
      </div>

      {/* Stats Row (6 Horizontal Pill Cards) */}
      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '0 24px 40px 24px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: '16px',
          }}
        >
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '18px',
                  padding: '18px 16px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                  border: '1px solid #F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
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

        {/* Categories Grid (6 Cards) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px' }}>
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

      {/* 5. RECENTLY SOLD PROPERTIES */}
      {recentlySoldListings.length > 0 && (
        <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '40px 24px 60px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Recently Sold Out
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
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
                  <div style={{ position: 'absolute', top: '12px', left: '12px', padding: '4px 10px', backgroundColor: '#EF4444', color: '#FFFFFF', fontSize: '0.75rem', fontWeight: 800, borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FaCheckCircle /> SOLD OUT
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
