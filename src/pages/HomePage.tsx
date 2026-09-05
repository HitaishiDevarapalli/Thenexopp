import React, { useState, useEffect } from 'react';
import { propertiesDb, dealersDb, selectedCity, setSelectedCity, siteSettingsDb, franchiseDb, businessDb, getDistance, demandRegionsDb, isModuleActive, showcaseVideosDb, showcaseSettingsDb, defaultMainPageStats } from '../db/marketplaceDb';
import { useLocationStore } from '../context/LocationContext';
import { useWishlist } from '../context/WishlistContext';
const ShowcaseVideoCarousel = React.lazy(() =>
  import('../components/ShowcaseVideoCarousel').then((m) => ({ default: m.ShowcaseVideoCarousel }))
);
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
  FaChevronDown,
  FaRegHeart,
  FaHeart,
  FaTag,
  FaHeadset,
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
  FaSmile,
  FaQuestionCircle,
  FaChevronUp,
  FaHandshake,
  FaFileContract,
  FaLayerGroup,
  FaChartLine
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
    image: '/assets/premium_villa.png',
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
    image: '/assets/luxury_apartment.png',
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
    image: '/assets/hero_skyline.png',
    isPremium: false,
    isVerified: true
  }
];

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onPropertyClick }) => {
  const [forceUpdate, setForceUpdate] = useState(0);
  useEffect(() => {
    const handler = () => setForceUpdate(prev => prev + 1);
    window.addEventListener('nexopp_data_changed', handler);
    return () => window.removeEventListener('nexopp_data_changed', handler);
  }, []);

  const { location } = useLocationStore();
  const currentGlobalCity = location?.city || location?.displayName || selectedCity || '';
  // Hero Carousel Index State
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);

  const s = siteSettingsDb.mainPageStats || defaultMainPageStats;

  const rawStats = [
    { icon: FaHome, color: '#059669', bg: '#ECFDF5', value: s.propertiesListed || defaultMainPageStats.propertiesListed, label: 'Properties Listed', mod: 'properties' },
    { icon: FaStore, color: '#D97706', bg: '#FEF3C7', value: s.franchisesCount || defaultMainPageStats.franchisesCount, label: 'Franchises', mod: 'franchises' },
    { icon: FaUsers, color: '#002B66', bg: '#EFF6FF', value: s.verifiedBrokers || defaultMainPageStats.verifiedBrokers, label: 'Verified Brokers' },
    { icon: FaCity, color: '#059669', bg: '#ECFDF5', value: s.citiesCovered || defaultMainPageStats.citiesCovered, label: 'Cities Covered' },
    { icon: FaCoins, color: '#D97706', bg: '#FEF3C7', value: s.totalPropertyValue || defaultMainPageStats.totalPropertyValue, label: 'Total Property Value', mod: 'properties' },
    { icon: FaSmile, color: '#002B66', bg: '#EFF6FF', value: s.happyClients || defaultMainPageStats.happyClients, label: 'Happy Clients' },
  ];
  const stats = rawStats.filter(st => !st.mod || isModuleActive(st.mod));

  const { toggleWishlist: globalToggleWishlist, isWishlisted } = useWishlist();

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    globalToggleWishlist(id);
  };

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const currentSlide = HERO_SLIDES[currentSlideIndex];

  // Category Cards List matching brand tri-color theme
  const rawPopularCategories = [
    { title: 'Residential', subtitle: 'Find your dream home', icon: FaHome, bg: '#EFF6FF', color: '#002B66', page: 'flatsPage', mod: 'properties' },
    { title: 'Commercial', subtitle: 'Office, Shops & Spaces', icon: FaBuilding, bg: '#FEF3C7', color: '#D97706', page: 'propertiesPage', mod: 'properties' },
    { title: 'Plots & Land', subtitle: 'Invest in Prime Land', icon: FaLeaf, bg: '#ECFDF5', color: '#059669', page: 'landPage', mod: 'properties' },
    { title: 'Franchise', subtitle: 'Start your Business', icon: FaStore, bg: '#FEF3C7', color: '#D97706', page: 'franchisePage', mod: 'franchises' },
    { title: 'Business', subtitle: 'Buy Profitable Business', icon: FaBriefcase, bg: '#EFF6FF', color: '#002B66', page: 'businessPage', mod: 'business' },
    { title: 'Finance & Insurance', subtitle: 'Secure your Future', icon: FaShieldAlt, bg: '#ECFDF5', color: '#059669', page: 'financePage' },
  ];
  const popularCategories = rawPopularCategories.filter(c => {
    if (!c.mod) return true;
    if (!isModuleActive(c.mod)) return false;
    if (c.mod === 'franchises' && (siteSettingsDb.showFranchiseSection === false || franchiseDb.length === 0)) return false;
    if (c.mod === 'business' && businessDb.length === 0) return false;
    if (c.mod === 'properties' && propertiesDb.length === 0) return false;
    return true;
  });

  const isPropertySold = (p: any) => {
    if (!p) return false;
    const statusUpper = String(p.status || '').toUpperCase();
    const listingUpper = String(p.listingStatus || '').toUpperCase();
    const approvalUpper = String(p.approvalStatus || '').toUpperCase();
    const badgeUpper = String(p.badge || '').toUpperCase();
    return (
      p.sold === true ||
      p.recentlySold === true ||
      statusUpper === 'SOLD' ||
      listingUpper === 'SOLD' ||
      approvalUpper === 'SOLD' ||
      badgeUpper === 'RECENTLY SOLD' ||
      badgeUpper === 'SOLD'
    );
  };

  const activeProperties = React.useMemo(() => propertiesDb.filter(p => !isPropertySold(p) && (p.approvalStatus || 'Published') === 'Published'), [propertiesDb, forceUpdate]);
  const activeFranchises = React.useMemo(() => franchiseDb.filter(f => (f.approvalStatus || 'Published') === 'Published' && (f.status === undefined || f.status === 'Active')), [franchiseDb, forceUpdate]);
  const activeBusinesses = React.useMemo(() => businessDb.filter(b => b.published !== false && !(b as any).sold && b.status !== 'Sold'), [businessDb, forceUpdate]);

  // Recently Sold properties and businesses (ordered by soldDate descending)
  const recentlySoldListings = React.useMemo(() => {
    const soldProps = propertiesDb
      .filter(isPropertySold)
      .map((p) => ({
        id: p.id,
        title: p.title || `${p.bedrooms || 3} BHK ${p.category}`,
        price: p.priceDisplay || (`₹${p.price || 1} L`),
        image: p.image || p.imageUrl || '/assets/luxury_apartment.png',
        location: `${p.area ? p.area + ', ' : ''}${p.city || 'Hyderabad'}`,
        bhk: `${p.bedrooms || 3} BHK`,
        area: p.sqft ? `${p.sqft} Sq.ft` : (p.builtUpArea ? `${p.builtUpArea} Sq.ft` : '1500 Sq.ft'),
        soldDate: p.soldDate,
        itemType: 'property' as const
      }));

    const soldBiz = businessDb
      .filter(b => b.sold === true || b.recentlySold === true || String(b.status).toUpperCase() === 'SOLD')
      .map((b) => ({
        id: b.id,
        title: b.name || b.title || 'Operational Business',
        price: b.priceDisplay || (`₹${b.price || b.askingPrice || 1} Lakhs`),
        image: b.image || (b.images && b.images[0]) || '/assets/business_restaurant.png',
        location: [b.area, b.city, b.state].filter(Boolean).join(', ') || b.location || 'AP/TS',
        bhk: b.category || b.industry || 'Enterprise',
        area: b.businessType || 'Operational Company',
        soldDate: b.soldDate,
        itemType: 'business' as const
      }));

    return [...soldProps, ...soldBiz].sort((a, b) => {
      const dateA = a.soldDate ? new Date(a.soldDate).getTime() : 0;
      const dateB = b.soldDate ? new Date(b.soldDate).getTime() : 0;
      return dateB - dateA;
    });
  }, [propertiesDb, businessDb, forceUpdate]);

  // Featured Listings from marketplaceDb
  // Get the target region for distance calculations
  const region = demandRegionsDb.find(r => r.name.toLowerCase() === currentGlobalCity.toLowerCase()) || 
                 (location?.lat ? { latitude: location.lat, longitude: location.lng } : null);

  const filterAndSortByDistance = (items: any[], isProperty = false) => {
    const targetLat = location?.lat || region?.latitude;
    const targetLng = location?.lng || region?.longitude;
    const targetLoc = (location?.city || currentGlobalCity || '').toLowerCase();

    const matched = items.filter(item => {
      if (isProperty && isPropertySold(item)) return false;

      const itemCity = (item.city || '').toLowerCase();
      const itemLocStr = (item.location || item.formatted_address || '').toLowerCase();
      const itemTitle = (item.title || item.brand || item.name || '').toLowerCase();

      // Distance match if lat/lng available
      if (targetLat && targetLng && item.latitude && item.longitude) {
        const dist = getDistance(targetLat, targetLng, item.latitude, item.longitude);
        item.distanceKm = Math.round(dist * 10) / 10;
        return dist <= 30; // 30km radius proximity filter
      }

      // Exact city string match fallback
      if (itemCity === targetLoc || itemLocStr.includes(targetLoc) || itemTitle.includes(targetLoc)) {
        item.distanceKm = 0;
        return true;
      }

      return false;
    }).sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

    // Fallback if fewer than 2 properties within 30km: return all items sorted by distance
    if (matched.length < 2 && targetLat && targetLng) {
      return items.filter(i => !isProperty || !isPropertySold(i)).map(item => {
        if (item.latitude && item.longitude) {
          item.distanceKm = Math.round(getDistance(targetLat, targetLng, item.latitude, item.longitude) * 10) / 10;
        } else {
          item.distanceKm = 999;
        }
        return item;
      }).sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
    }

    return matched;
  };

  // Featured Listings from marketplaceDb (Ensure at least 4 items so grid is full)
  const filteredProperties = filterAndSortByDistance(activeProperties, true);
  const rawListings = filteredProperties.length >= 2 ? filteredProperties : activeProperties;
  const featuredListings = rawListings.slice(0, 4).map((p) => {
    const assignedBroker = dealersDb.find(d => d.id === p.dealerId || (p.assignedBrokerIds && p.assignedBrokerIds.includes(d.id)));
    const brokerName = assignedBroker?.companyName || assignedBroker?.fullName || p.agentName || 'RealtyPlus Advisors';
    const brokerImg = assignedBroker?.photo || assignedBroker?.logo || p.agentImage || '';
    return {
      id: p.id,
      title: p.title || `${p.bedrooms || 3} BHK ${p.category}`,
      price: p.priceDisplay || (`₹ ${p.price || 75} Lakh`),
      badge: p.verified ? 'Verified' : (p.premium ? 'Premium' : 'New Launch'),
      badgeColor: p.verified ? '#DCFCE7' : (p.premium ? '#FEF08A' : '#E0E7FF'),
      badgeText: p.verified ? '#16A34A' : (p.premium ? '#854D0E' : '#4F46E5'),
      badgeIcon: p.verified ? FaCheckCircle : (p.premium ? FaCrown : FaStar),
      image: p.image || p.imageUrl || '/assets/luxury_apartment.png',
      location: `${p.area ? p.area + ', ' : ''}${p.city || 'Guntur'}`,
      bhk: `${p.bedrooms || 3} BHK`,
      area: p.sqft ? `${p.sqft} Sq.ft` : (p.builtUpArea ? `${p.builtUpArea} Sq.ft` : '1500 Sq.ft'),
      brokerName,
      brokerImg,
      approvalStatus: p.approvalStatus,
      listingStatus: p.listingStatus,
    };
  });

  const rawFranchises = filterAndSortByDistance(activeFranchises);
  const featuredFranchises = (rawFranchises.length >= 2 ? rawFranchises : activeFranchises).slice(0, 4);

  const rawBusinesses = filterAndSortByDistance(activeBusinesses);
  // Separate Property Showcase Listings (4-5 items)
  const propertyListingsShowcase = React.useMemo(() => {
    return activeProperties
      .filter(p => !isPropertySold(p) && p.listingStatus !== 'Hidden' && p.listingStatus !== 'Draft')
      .slice(0, 4)
      .map(p => ({
        id: p.id,
        title: p.title || `${p.bedrooms || 3} BHK ${p.category || 'Property'}`,
        price: p.priceDisplay || `₹${p.price || 75} Lakh`,
        image: p.image || p.imageUrl || '/assets/luxury_apartment.png',
        location: `${p.area ? p.area + ', ' : ''}${p.city || 'Guntur'}`,
        rating: p.rating || 0,
        reviewCount: p.reviewCount || 0,
        verified: p.verified || false,
        premium: p.premium || false,
        badge: p.status || 'Buy',
        badgeColor: p.status === 'Rent' ? '#EFF6FF' : '#ECFDF5',
        badgeText: p.status === 'Rent' ? '#2563EB' : '#059669',
      }));
  }, [activeProperties]);

  // Separate Business Showcase Listings (4-5 items)
  const businessListingsShowcase = React.useMemo(() => {
    return activeBusinesses
      .filter(b => b.published !== false && b.status !== 'Sold' && b.status !== 'Unavailable')
      .slice(0, 4)
      .map(b => ({
        id: b.id,
        title: b.name || b.title || 'Business For Sale',
        price: b.priceDisplay || (typeof b.price === 'number' ? `₹${b.price} Lakhs` : `${b.price || b.askingPrice || '0'} Lakhs`),
        image: b.image || (b.images && b.images[0]) || "/assets/business_restaurant.png",
        location: [b.area, b.city, b.state].filter(Boolean).join(', ') || b.location || '',
        rating: b.rating || 0,
        reviewCount: b.reviewCount || 0,
        verified: b.verified || false,
        premium: b.featured || false,
        badge: b.category || b.industry || '',
        badgeColor: '#FFFBEB',
        badgeText: '#D97706',
      }));
  }, [activeBusinesses]);

  return (
    <div style={{ backgroundColor: '#F8FAFC', paddingBottom: '60px', paddingTop: '105px', fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      
      {/* 1. HERO SECTION */}
      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '50px 24px 20px 24px' }}>
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
              TheNexopp – <span style={{ color: '#00A86B' }}>Verified Properties, Businesses, Franchises & Listings</span> in India
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
                loading="eager"
                decoding="async"
                width={1200}
                height={380}
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



      {/* 1. SEPARATE PROPERTY LISTINGS SECTION */}
      {isModuleActive('properties') && propertyListingsShowcase.length > 0 && (
        <div style={{ maxWidth: '1360px', margin: '40px auto 48px auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#059669', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: '3px' }}>
                Exclusive Real Estate
              </span>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                Property Listings
              </h2>
            </div>
            <button 
              onClick={() => onNavigate('propertiesPage')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#ECFDF5',
                color: '#059669',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#D1FAE5'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ECFDF5'; }}
            >
              <span>Explore All Properties</span>
              <FaArrowRight style={{ fontSize: '11px' }} />
            </button>
          </div>

          <div className="responsive-property-grid" style={{ gap: '16px' }}>
            {propertyListingsShowcase.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (onPropertyClick) onPropertyClick(item.id);
                  else onNavigate('propertyDetails', `?propertyId=${item.id}`);
                }}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(15, 23, 42, 0.08)';
                  e.currentTarget.style.borderColor = '#059669';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.03)';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }}
              >
                {/* Image Section */}
                <div style={{ position: 'relative', width: '100%', height: '150px', overflow: 'hidden', backgroundColor: '#F1F5F9' }}>
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    loading="lazy"
                    decoding="async"
                    width={360}
                    height={180}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                  />
                  
                  {item.rating > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      backgroundColor: 'rgba(15, 23, 42, 0.75)',
                      backdropFilter: 'blur(4px)',
                      color: '#FFFFFF',
                      padding: '3px 8px',
                      borderRadius: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '10px',
                      fontWeight: 800,
                      zIndex: 2,
                    }}>
                      <FaStar style={{ color: '#F59E0B', fontSize: '9.5px' }} />
                      <span>{item.rating.toFixed(1)}</span>
                      {item.reviewCount > 0 && <span style={{ color: '#94A3B8', fontWeight: 600 }}>({item.reviewCount})</span>}
                    </div>
                  )}

                  <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '8px',
                    backgroundColor: item.badgeColor,
                    color: item.badgeText,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
                    zIndex: 2,
                  }}>
                    Property • {item.badge}
                  </div>
                  
                  {item.verified && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      backgroundColor: '#DCFCE7',
                      color: '#16A34A',
                      padding: '4px 6px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      boxShadow: '0 2px 6px rgba(22, 163, 74, 0.2)',
                      zIndex: 2,
                    }}>
                      <FaCheckCircle />
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{
                      fontSize: '0.94rem',
                      fontWeight: 800,
                      color: '#0F172A',
                      margin: '0 0 4px 0',
                      lineHeight: 1.3,
                      wordBreak: 'break-word',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      height: '2.6em',
                    }}>
                      {item.title}
                    </h3>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748B', fontSize: '11.5px', marginBottom: '8px' }}>
                      <FaMapMarkerAlt style={{ color: '#EF4444', flexShrink: 0, fontSize: '10.5px' }} />
                      <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.location}</span>
                    </div>
                  </div>

                  <div className="card-price-btn-row" style={{ borderTop: '1px solid #F1F5F9', paddingTop: '8px', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: '9.5px', color: '#64748B', fontWeight: 700, display: 'block', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                        Asking Price
                      </span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#059669' }}>
                        {item.price}
                      </span>
                    </div>
                    
                    <button className="card-details-btn" style={{
                      backgroundColor: '#059669',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}>
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <button
              onClick={() => onNavigate('propertiesPage')}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#059669',
                border: '1.5px solid #059669',
                padding: '10px 28px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 10px rgba(5, 150, 105, 0.08)'
              }}
            >
              View More Property Listings →
            </button>
          </div>
        </div>
      )}

      {/* 2. SEPARATE BUSINESS LISTINGS SECTION */}
      {isModuleActive('business') && businessListingsShowcase.length > 0 && (
        <div style={{ maxWidth: '1360px', margin: '0 auto 44px auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#D97706', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: '3px' }}>
                Verified Commercial Deals
              </span>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                Business Listings
              </h2>
            </div>
            <button 
              onClick={() => onNavigate('businessPage')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#FEF3C7',
                color: '#D97706',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FDE68A'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FEF3C7'; }}
            >
              <span>Explore All Businesses</span>
              <FaArrowRight style={{ fontSize: '11px' }} />
            </button>
          </div>

          <div className="responsive-property-grid" style={{ gap: '16px' }}>
            {businessListingsShowcase.map((item) => (
              <div
                key={item.id}
                onClick={() => onNavigate('businessPage')}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(15, 23, 42, 0.08)';
                  e.currentTarget.style.borderColor = '#D97706';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.03)';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }}
              >
                {/* Image Section */}
                <div style={{ position: 'relative', width: '100%', height: '150px', overflow: 'hidden', backgroundColor: '#F1F5F9' }}>
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    loading="lazy"
                    decoding="async"
                    width={360}
                    height={180}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                  />
                  
                  {item.rating > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      backgroundColor: 'rgba(15, 23, 42, 0.75)',
                      backdropFilter: 'blur(4px)',
                      color: '#FFFFFF',
                      padding: '3px 8px',
                      borderRadius: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '10px',
                      fontWeight: 800,
                      zIndex: 2,
                    }}>
                      <FaStar style={{ color: '#F59E0B', fontSize: '9.5px' }} />
                      <span>{item.rating.toFixed(1)}</span>
                      {item.reviewCount > 0 && <span style={{ color: '#94A3B8', fontWeight: 600 }}>({item.reviewCount})</span>}
                    </div>
                  )}

                  <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '8px',
                    backgroundColor: item.badgeColor,
                    color: item.badgeText,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
                    zIndex: 2,
                  }}>
                    Business • {item.badge}
                  </div>
                  
                  {item.verified && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      backgroundColor: '#DCFCE7',
                      color: '#16A34A',
                      padding: '4px 6px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      boxShadow: '0 2px 6px rgba(22, 163, 74, 0.2)',
                      zIndex: 2,
                    }}>
                      <FaCheckCircle />
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{
                      fontSize: '0.94rem',
                      fontWeight: 800,
                      color: '#0F172A',
                      margin: '0 0 4px 0',
                      lineHeight: 1.3,
                      wordBreak: 'break-word',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      height: '2.6em',
                    }}>
                      {item.title}
                    </h3>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748B', fontSize: '11.5px', marginBottom: '8px' }}>
                      <FaMapMarkerAlt style={{ color: '#EF4444', flexShrink: 0, fontSize: '10.5px' }} />
                      <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.location}</span>
                    </div>
                  </div>

                  <div className="card-price-btn-row" style={{ borderTop: '1px solid #F1F5F9', paddingTop: '8px', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: '9.5px', color: '#64748B', fontWeight: 700, display: 'block', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                        Valuation / Price
                      </span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#D97706' }}>
                        {item.price}
                      </span>
                    </div>
                    
                    <button className="card-details-btn" style={{
                      backgroundColor: '#D97706',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}>
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <button
              onClick={() => onNavigate('businessPage')}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#D97706',
                border: '1.5px solid #D97706',
                padding: '10px 28px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 10px rgba(217, 119, 6, 0.08)'
              }}
            >
              View More Business Listings →
            </button>
          </div>
        </div>
      )}

      {/* ================= RECENTLY SOLD PROPERTIES SECTION (BELOW ALL BUSINESSES) ================= */}
      {recentlySoldListings.length > 0 && (
        <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '0 24px 48px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'inline-block', marginBottom: '4px' }}>
                🏷️ SUCCESSFULLY CLOSED DEALS
              </span>
              <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.5px' }}>
                Recently Sold Properties &amp; Closed Acquisitions
              </h2>
            </div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#DC2626', backgroundColor: '#FEF2F2', padding: '6px 16px', borderRadius: '20px', border: '1px solid #FECACA' }}>
              {recentlySoldListings.length} Deals Closed
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {recentlySoldListings.map(prop => (
              <div 
                key={prop.id}
                onClick={() => {
                  if (prop.itemType === 'business') {
                    onNavigate('businessPage');
                  } else {
                    if (onPropertyClick) onPropertyClick(prop.id);
                    else onNavigate('propertyDetails', prop.id);
                  }
                }}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1.5px solid #FECACA',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  position: 'relative',
                  boxShadow: '0 4px 15px rgba(220, 38, 38, 0.06)',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(220, 38, 38, 0.12)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(220, 38, 38, 0.06)';
                }}
              >
                {/* Image Container with Sold Badge */}
                <div style={{ position: 'relative', height: '180px', width: '100%', overflow: 'hidden' }}>
                  <img 
                    src={prop.image || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80'} 
                    alt={prop.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.95)' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: '#DC2626',
                    color: '#FFFFFF',
                    padding: '4px 12px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 900,
                    letterSpacing: '0.8px',
                    boxShadow: '0 2px 8px rgba(220, 38, 38, 0.4)'
                  }}>
                    RECENTLY SOLD
                  </div>
                  {prop.price && (
                    <div style={{
                      position: 'absolute',
                      bottom: '12px',
                      right: '12px',
                      backgroundColor: 'rgba(15, 23, 42, 0.85)',
                      color: '#FFFFFF',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 800
                    }}>
                      {prop.price}
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div style={{ padding: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {prop.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    📍 {prop.location || 'Hyderabad'}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '10px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#16A34A' }}>
                      ✓ Deal Closed
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#DC2626' }}>
                      View Details →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Row (6 Cards in a spacious 3x2 Grid) */}
      <div className="stats-container" style={{ maxWidth: '1360px', margin: '0 auto', padding: '0 24px 44px 24px' }}>
        <div className="responsive-stats-grid">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="stat-card"
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
                  className="stat-card-icon-wrap"
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
                  <Icon className="stat-card-icon" style={{ color: stat.color, fontSize: '20px' }} />
                </div>
                <div>
                  <div className="stat-card-value" style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                    {stat.value}
                  </div>
                  <div className="stat-card-label" style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', margin: '4px 0 0 0' }}>
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. POPULAR CATEGORIES SECTION */}
      {isModuleActive('properties') && (
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
      )}

      {/* 4. SHOWCASE & FEATURED PROPERTIES */}
      {isModuleActive('showcase_videos') && showcaseSettingsDb.enabled !== false && siteSettingsDb.showVideoShowcase !== false && showcaseVideosDb.some(v => v.status === 'Active') && (
        <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '0 24px' }}>
          <React.Suspense fallback={null}>
            <ShowcaseVideoCarousel onNavigate={onNavigate} onPropertyClick={onPropertyClick} />
          </React.Suspense>
        </div>
      )}

      {/* 6. WHAT IS THENEXOPP & MARKETPLACE OVERVIEW SECTION */}
      <div style={{ maxWidth: '1360px', margin: '0 auto 48px auto', padding: '0 24px' }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '40px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
        }}>
          <div style={{ maxWidth: '900px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#059669', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              India's Multi-Asset Marketplace
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.2, margin: '0 0 16px 0', letterSpacing: '-0.02em' }}>
              What is TheNexopp?
            </h2>
            <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: 1.7, margin: '0 0 20px 0' }}>
              <strong>TheNexopp</strong> is India's premier multi-asset platform designed to unify verified real estate transactions, operational business acquisitions, and brand franchise investments into a single transparent ecosystem. Whether you are looking to buy a verified luxury apartment, acquire a profitable running business, or expand a franchise footprint, TheNexopp provides verified inventory, vetted brokers, legal due diligence assistance, and institutional financing support.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '28px' }}>
            <div style={{ backgroundColor: '#F8FAFC', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1E40AF', marginBottom: '14px', fontSize: '20px' }}>
                <FaHome />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>Verified Properties</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                Explore 100% verified residential apartments, independent villas, commercial office spaces, and approved land plots with clear legal titles and transparent pricing.
              </p>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706', marginBottom: '14px', fontSize: '20px' }}>
                <FaBriefcase />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>Business Opportunities</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                Acquire running, revenue-generating businesses across retail, F&amp;B, healthcare, and tech with comprehensive turnover analysis and confidential deal execution.
              </p>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', marginBottom: '14px', fontSize: '20px' }}>
                <FaStore />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>Franchise Growth</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                Invest in established national brand franchises and turnkey resale outlets with documented ROI, established customer traction, and complete operational support.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 7. HOW THENEXOPP WORKS (3-STEP GUIDED JOURNEY) */}
      <div style={{ maxWidth: '1360px', margin: '0 auto 48px auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#002B66', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
            Simple &amp; Transparent Process
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            How TheNexopp Works
          </h2>
          <p style={{ color: '#64748B', fontSize: '1rem', marginTop: '8px', maxWidth: '600px', margin: '8px auto 0 auto' }}>
            A streamlined, safe experience designed to protect buyers, sellers, and investors at every step.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '32px 24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.02)', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#EFF6FF', color: '#002B66', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', margin: '0 auto 16px auto', fontWeight: 800 }}>
              1
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>Search &amp; Discover</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
              Explore authenticated listings filtered by city, budget, BHK, or business turnover. Every opportunity contains verified photos, legal attributes, and clear pricing.
            </p>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '32px 24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.02)', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', margin: '0 auto 16px auto', fontWeight: 800 }}>
              2
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>Inspect &amp; Verify</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
              Book an in-person site inspection or video tour with certified brokers. Review title deeds, financial documentation, and RERA approvals with full transparency.
            </p>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '32px 24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.02)', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', margin: '0 auto 16px auto', fontWeight: 800 }}>
              3
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>Close Deal Securely</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
              Finalize agreements with legal contract support, escrow coordination, and institutional bank financing options for immediate, stress-free settlement.
            </p>
          </div>
        </div>
      </div>

      {/* 8. CITIES & LOCATIONS SERVED */}
      <div style={{ maxWidth: '1360px', margin: '0 auto 48px auto', padding: '0 24px' }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '36px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#D97706', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Strategic Regional Coverage
              </span>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Cities &amp; Growth Corridors Served
              </h2>
            </div>
            <button
              onClick={() => onNavigate('propertiesPage')}
              style={{
                backgroundColor: '#EFF6FF',
                color: '#002B66',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              Browse by Location →
            </button>
          </div>

          <p style={{ fontSize: '0.95rem', color: '#64748B', lineHeight: 1.6, margin: '0 0 24px 0' }}>
            TheNexopp operates across high-demand residential, commercial, and industrial corridors in South India and prime metropolitan markets across India:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {[
              { name: 'Hyderabad', state: 'Telangana', areas: 'Gachibowli, Madhapur, Hitec City, Kondapur, Jubilee Hills' },
              { name: 'Vijayawada', state: 'Andhra Pradesh', areas: 'Benz Circle, MG Road, Gannavaram, Governorpet' },
              { name: 'Guntur', state: 'Andhra Pradesh', areas: 'Brodipet, SVN Colony, Kothapet, Mangalagiri' },
              { name: 'Visakhapatnam', state: 'Andhra Pradesh', areas: 'Maddilapalem, MVP Colony, Gajuwaka, Rushikonda' },
              { name: 'Amaravati Region', state: 'Andhra Pradesh', areas: 'Capital Growth Zone, Tulluru, Mangalagiri Corridors' },
              { name: 'Bengaluru & Metro Hubs', state: 'Karnataka & Pan-India', areas: 'Expanding Tech Parks, Prime Commercial & Retail Zones' },
            ].map((loc, idx) => (
              <div
                key={idx}
                onClick={() => onNavigate('propertiesPage', `?location=${encodeURIComponent(loc.name)}`)}
                style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: '14px',
                  padding: '16px',
                  border: '1px solid #E2E8F0',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#059669';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#F8FAFC';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <FaMapMarkerAlt style={{ color: '#059669', fontSize: '13px' }} />
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>{loc.name}</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#002B66', fontWeight: 700, marginBottom: '6px' }}>{loc.state}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', lineHeight: 1.4 }}>{loc.areas}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 9. FREQUENTLY ASKED QUESTIONS (FAQ ACCORDION) */}
      <div style={{ maxWidth: '1360px', margin: '0 auto 20px auto', padding: '0 24px' }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '40px 32px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#059669', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              Clear Answers to Common Questions
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Frequently Asked Questions
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.95rem', marginTop: '8px' }}>
              Everything you need to know about buying, selling, and investing with TheNexopp.
            </p>
          </div>

          <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              {
                q: 'What is TheNexopp?',
                a: "TheNexopp is India's trusted platform and marketplace for verified properties, commercial real estate, profitable business acquisitions, and high-ROI franchise opportunities."
              },
              {
                q: 'How does TheNexopp verify property and business listings?',
                a: 'Every listing on TheNexopp undergoes a rigorous multi-tier verification process including ownership authentication, legal title verification, physical inspection where applicable, and broker credential validation to eliminate fake or misleading listings.'
              },
              {
                q: 'Can I buy, sell, or rent residential and commercial properties on TheNexopp?',
                a: 'Yes. TheNexopp features verified apartments, luxury villas, independent houses, commercial office spaces, retail shops, and residential/commercial plots for both sale and rent across major cities in India.'
              },
              {
                q: 'What franchise and business investment opportunities are available on TheNexopp?',
                a: 'TheNexopp connects entrepreneurs and investors with verified operational businesses for sale across retail, food & beverage, healthcare, and services, as well as established brand franchises with proven ROI and territorial rights.'
              },
              {
                q: 'Which cities and regions does TheNexopp serve in India?',
                a: 'TheNexopp actively serves prime residential, commercial, and industrial corridors including Hyderabad, Vijayawada, Guntur, Visakhapatnam, Amaravati Capital Region, Bengaluru, and expanding growth markets across India.'
              },
              {
                q: 'Does TheNexopp assist with loans, finance, and transaction closing?',
                a: 'Yes. TheNexopp provides dedicated advisory support, connecting buyers and business investors with leading institutional partners for real estate home loans, business acquisition financing, and asset insurance.'
              }
            ].map((faq, idx) => {
              const isExpanded = expandedFaqIndex === idx;
              return (
                <div
                  key={idx}
                  style={{
                    border: isExpanded ? '1.5px solid #002B66' : '1px solid #E2E8F0',
                    borderRadius: '16px',
                    backgroundColor: isExpanded ? '#F8FAFC' : '#FFFFFF',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <button
                    onClick={() => setExpandedFaqIndex(isExpanded ? null : idx)}
                    style={{
                      width: '100%',
                      padding: '18px 22px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      gap: '12px'
                    }}
                  >
                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                      {faq.q}
                    </span>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: isExpanded ? '#002B66' : '#F1F5F9',
                      color: isExpanded ? '#FFFFFF' : '#64748B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      flexShrink: 0
                    }}>
                      {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                    </div>
                  </button>
                  {isExpanded && (
                    <div style={{ padding: '0 22px 18px 22px', color: '#475569', fontSize: '0.95rem', lineHeight: 1.65, borderTop: '1px solid #F1F5F9', paddingTop: '14px' }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
};

export default HomePage;
