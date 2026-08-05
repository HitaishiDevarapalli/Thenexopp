import React, { useState, useEffect } from 'react';
import {
  FaSearch,
  FaHome,
  FaStore,
  FaBriefcase,
  FaMapMarkerAlt,
  FaBuilding,
  FaChevronDown,
  FaCheckCircle,
  FaHeart,
  FaRegHeart,
  FaChevronLeft,
  FaChevronRight,
  FaBed,
  FaBath,
  FaRulerCombined,
  FaUsers,
  FaCity,
  FaCoins,
  FaSmile,
  FaCrosshairs,
} from 'react-icons/fa';
import { siteSettingsDb, selectedCity } from '../db/marketplaceDb';

interface HeroProps {
  currentBg?: number;
  setCurrentBg?: React.Dispatch<React.SetStateAction<number>>;
  onPropertyClick?: (id: string) => void;
  onSearch?: (category: string, query: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onPropertyClick, onSearch }) => {
  const [activeTab, setActiveTab] = useState<'Property' | 'Franchise' | 'Business' | 'Plots/Land' | 'Commercial'>('Property');
  const [locationText, setLocationText] = useState(selectedCity || 'Guntur, Andhra Pradesh');
  const [radius, setRadius] = useState('5 KM');
  const [budget, setBudget] = useState('₹10L - ₹5 Cr');
  const [propertyType, setPropertyType] = useState('All Types');
  const [bhk, setBhk] = useState('All BHK');
  const [priceRange, setPriceRange] = useState('Any Price');
  const [isSaved, setIsSaved] = useState(false);
  const [sliderIndex, setSliderIndex] = useState(0);

  // Sync location text if selectedCity changes
  useEffect(() => {
    if (selectedCity && selectedCity !== 'All India') {
      setLocationText(selectedCity);
    }
  }, [selectedCity]);

  // Sync dropdown defaults when activeTab changes
  useEffect(() => {
    if (activeTab === 'Commercial') {
      setPropertyType('All Commercial');
      setBhk('Any Usage');
    } else if (activeTab === 'Plots/Land') {
      setPropertyType('All Plots');
      setBhk('Any Zone');
    } else {
      setPropertyType('All Types');
      setBhk('All BHK');
    }
  }, [activeTab]);

  const handleSearch = () => {
    if (onSearch) {
      let query = locationText;
      if (activeTab === 'Plots/Land') query += ' land plot';
      else if (activeTab === 'Commercial') query += ' commercial office shop';
      onSearch(activeTab, query);
    }
  };

  const handlePopularSearch = (tag: string) => {
    if (onSearch) {
      if (tag === 'Apartment' || tag === 'Villa' || tag === 'Plots' || tag === 'Commercial' || tag === 'Farm Land') {
        onSearch('Property', tag);
      } else if (tag === 'Franchise') {
        onSearch('Franchise', '');
      } else {
        onSearch('All Categories', tag);
      }
    }
  };

  const tabs = [
    { id: 'Property' as const, label: 'Property', icon: FaHome },
    { id: 'Franchise' as const, label: 'Franchise', icon: FaStore },
    { id: 'Business' as const, label: 'Business', icon: FaBriefcase },
    { id: 'Plots/Land' as const, label: 'Plots/Land', icon: FaMapMarkerAlt },
    { id: 'Commercial' as const, label: 'Commercial', icon: FaBuilding },
  ];

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

  return (
    <section
      id="hero"
      style={{
        paddingTop: '115px',
        paddingBottom: '3rem',
        background: 'linear-gradient(135deg, #E0F2FE 0%, #F0F9FF 40%, #FFFFFF 100%)',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Outfit', 'Inter', -apple-system, sans-serif",
      }}
    >
      {/* Main Container */}
      <div
        style={{
          maxWidth: '1360px',
          margin: '0 auto',
          padding: '2rem 24px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* Top 2-Column Hero Section */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 1fr',
            gap: '40px',
            alignItems: 'center',
            marginBottom: '50px',
          }}
        >
          {/* Left Column: Typography & Search Card */}
          <div>
            {/* SEO Trust Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              padding: '6px 16px',
              borderRadius: '9999px',
              color: '#047857',
              fontSize: '0.88rem',
              fontWeight: 800,
              marginBottom: '16px'
            }}>
              <FaCheckCircle style={{ color: '#10B981' }} />
              India's Trusted Platform for Verified Listings
            </div>

            <h1
              style={{
                fontSize: '3.1rem',
                fontWeight: 900,
                color: '#0F172A',
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
                margin: '0 0 16px 0',
              }}
            >
              The Nexopp – India's Trusted Platform
              <br />
              for Verified Listings to{' '}
              <span style={{ color: '#16A34A', position: 'relative', display: 'inline-block' }}>
                Buy and Sell
                {/* Hand-drawn underline graphic */}
                <svg
                  viewBox="0 0 260 20"
                  style={{
                    position: 'absolute',
                    bottom: '-8px',
                    left: 0,
                    width: '100%',
                    height: '16px',
                    overflow: 'visible',
                  }}
                >
                  <path
                    d="M 5 15 Q 130 -5, 255 12"
                    fill="none"
                    stroke="#FACC15"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p
              style={{
                fontSize: '1.1rem',
                color: '#475569',
                lineHeight: 1.6,
                marginBottom: '28px',
                maxWidth: '560px',
                fontWeight: 500,
              }}
            >
              The Nexopp connects buyers, sellers, investors, and business owners with 100% verified real estate properties, luxury villas, commercial spaces, and operational franchises across India.
            </p>

            {/* Multi-Tab Search Box Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '24px',
                padding: '24px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.08)',
                border: '1px solid #E2E8F0',
              }}
            >
              {/* Top Tabs */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexWrap: 'wrap',
                  marginBottom: '20px',
                  borderBottom: '1px solid #F1F5F9',
                  paddingBottom: '16px',
                }}
              >
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 18px',
                        borderRadius: '9999px',
                        border: isActive ? '1px solid #16A34A' : '1px solid #E2E8F0',
                        backgroundColor: isActive ? '#16A34A' : '#F8FAFC',
                        color: isActive ? '#FFFFFF' : '#475569',
                        fontWeight: 600,
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Icon style={{ fontSize: '15px' }} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Row 1: Main Search Inputs */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1.2fr auto',
                  gap: '12px',
                  marginBottom: '16px',
                }}
              >
                {/* Search Location */}
                <div
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '14px',
                    padding: '10px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                    <FaMapMarkerAlt style={{ color: '#16A34A' }} /> Search Location
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <input
                      type="text"
                      value={locationText}
                      onChange={(e) => setLocationText(e.target.value)}
                      style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', fontWeight: 600, color: '#0F172A', width: '100%' }}
                    />
                    <FaChevronDown style={{ fontSize: '10px', color: '#94A3B8' }} />
                  </div>
                </div>

                {/* Radius */}
                <div
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '14px',
                    padding: '10px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', marginBottom: '2px' }}>
                    Radius
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <select
                      value={radius}
                      onChange={(e) => setRadius(e.target.value)}
                      style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', fontWeight: 600, color: '#0F172A', width: '100%', cursor: 'pointer' }}
                    >
                      <option value="1 KM">1 KM</option>
                      <option value="3 KM">3 KM</option>
                      <option value="5 KM">5 KM</option>
                      <option value="10 KM">10 KM</option>
                      <option value="20 KM">20 KM</option>
                    </select>
                  </div>
                </div>

                {/* Budget */}
                <div
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '14px',
                    padding: '10px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', marginBottom: '2px' }}>
                    Budget
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <select
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', fontWeight: 600, color: '#0F172A', width: '100%', cursor: 'pointer' }}
                    >
                      <option value="₹10L - ₹5 Cr">₹10L - ₹5 Cr</option>
                      <option value="Under ₹25L">Under ₹25L</option>
                      <option value="₹25L - ₹50L">₹25L - ₹50L</option>
                      <option value="₹50L - ₹1 Cr">₹50L - ₹1 Cr</option>
                      <option value="₹1 Cr - ₹5 Cr">₹1 Cr - ₹5 Cr</option>
                      <option value="₹5 Cr+">₹5 Cr+</option>
                    </select>
                  </div>
                </div>

                {/* Search Button */}
                <button
                  onClick={handleSearch}
                  style={{
                    backgroundColor: '#16A34A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '14px',
                    padding: '0 28px',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#15803D')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#16A34A')}
                >
                  <FaSearch />
                  <span>Search</span>
                </button>
              </div>

              {/* Row 2: Secondary Filters & Use My Location */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginBottom: '18px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '8px 12px', fontSize: '12px', fontWeight: 600, color: '#334155', cursor: 'pointer', outline: 'none' }}
                  >
                    {activeTab === 'Commercial' ? (
                      <>
                        <option value="All Commercial">Commercial Type</option>
                        <option value="Office Space">Office Space</option>
                        <option value="Retail Shop">Retail Shop</option>
                        <option value="Commercial Showroom">Showroom</option>
                        <option value="Warehouse / Godown">Warehouse / Godown</option>
                        <option value="Industrial Building">Industrial Building</option>
                      </>
                    ) : activeTab === 'Plots/Land' ? (
                      <>
                        <option value="All Plots">Plot Type</option>
                        <option value="Residential Plot">Residential Plot</option>
                        <option value="Commercial Plot">Commercial Plot</option>
                        <option value="Agricultural Land">Agricultural Land</option>
                      </>
                    ) : (
                      <>
                        <option value="All Types">Property Type</option>
                        <option value="Apartment">Apartment</option>
                        <option value="Villa">Villa</option>
                        <option value="Independent House">Independent House</option>
                        <option value="Plot/Land">Plot / Land</option>
                      </>
                    )}
                  </select>

                  <select
                    value={bhk}
                    onChange={(e) => setBhk(e.target.value)}
                    style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '8px 12px', fontSize: '12px', fontWeight: 600, color: '#334155', cursor: 'pointer', outline: 'none' }}
                  >
                    {activeTab === 'Commercial' ? (
                      <>
                        <option value="Any Usage">Suitable For</option>
                        <option value="Corporate Office">Corporate Office</option>
                        <option value="Retail Store">Retail Store</option>
                        <option value="Showroom">Showroom</option>
                        <option value="Warehouse">Warehouse</option>
                      </>
                    ) : activeTab === 'Plots/Land' ? (
                      <>
                        <option value="Any Zone">Zone</option>
                        <option value="Residential Zone">Residential Zone</option>
                        <option value="Commercial Zone">Commercial Zone</option>
                        <option value="Agricultural Zone">Agricultural Zone</option>
                      </>
                    ) : (
                      <>
                        <option value="All BHK">BHK</option>
                        <option value="1 BHK">1 BHK</option>
                        <option value="2 BHK">2 BHK</option>
                        <option value="3 BHK">3 BHK</option>
                        <option value="4+ BHK">4+ BHK</option>
                      </>
                    )}
                  </select>

                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '8px 12px', fontSize: '12px', fontWeight: 600, color: '#334155', cursor: 'pointer', outline: 'none' }}
                  >
                    <option value="Any Price">Price Range</option>
                    <option value="Under 50L">Under ₹50 Lakh</option>
                    <option value="50L - 1Cr">₹50 Lakh - ₹1 Cr</option>
                    <option value="1Cr - 3Cr">₹1 Cr - ₹3 Cr</option>
                  </select>

                  <button
                    onClick={() => alert('Opening More Filters...')}
                    style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '8px 12px', fontSize: '12px', fontWeight: 600, color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <span>⚙ More Filters</span>
                    <FaChevronDown style={{ fontSize: '10px' }} />
                  </button>
                </div>

                <button
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(() => {
                        setLocationText('Current Location (GPS)');
                      });
                    } else {
                      setLocationText('Guntur, AP');
                    }
                  }}
              </div>

              {/* Row 3: Popular Searches & Advanced Search */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid #F1F5F9',
                  paddingTop: '16px',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>
                    Popular Searches:
                  </span>
                  {['Apartment', 'Villa', 'Plots', 'Commercial', 'Franchise', 'Farm Land'].map((tag) => {
                    const isPurple = tag === 'Villa';
                    return (
                      <button
                        key={tag}
                        onClick={() => handlePopularSearch(tag)}
                        style={{
                          padding: '4px 12px',
                          borderRadius: '9999px',
                          border: isPurple ? '1px solid #D8B4FE' : '1px solid #E2E8F0',
                          backgroundColor: isPurple ? '#F3E8FF' : '#F8FAFC',
                          color: isPurple ? '#7E22CE' : '#475569',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>

                <a
                  href="#advanced"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Opening Advanced Search...');
                  }}
                  style={{
                    color: '#0284C7',
                    fontWeight: 700,
                    fontSize: '13px',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>Advanced Search</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Image Slider Card */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                borderRadius: '28px',
                overflow: 'hidden',
                boxShadow: '0 25px 60px -15px rgba(0,0,0,0.2)',
                border: '4px solid #FFFFFF',
                position: 'relative',
                aspectRatio: '16 / 10.5',
                backgroundColor: '#0F172A',
              }}
            >
              {/* Image */}
              <img
                src={sliderIndex === 0 ? "/assets/hero_villa.jpg" : "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"}
                alt="Skyline Heights Villa"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  transition: 'transform 0.5s ease',
                }}
              />

              {/* Top Left Badges */}
              <div style={{ position: 'absolute', top: '20px', left: '20px', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 10 }}>
                <span
                  style={{
                    backgroundColor: '#FEF08A',
                    color: '#854D0E',
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                >
                  👑 Premium Listing
                </span>
                <span
                  style={{
                    backgroundColor: '#DCFCE7',
                    color: '#16A34A',
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                >
                  <FaCheckCircle /> Verified
                </span>
              </div>

              {/* Top Right Heart Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSaved(!isSaved);
                }}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  backdropFilter: 'blur(8px)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 10,
                  transition: 'transform 0.2s',
                }}
              >
                {isSaved ? <FaHeart style={{ color: '#EF4444', fontSize: '20px' }} /> : <FaRegHeart style={{ color: '#FFFFFF', fontSize: '20px' }} />}
              </button>

              {/* Slider Arrows */}
              <button
                onClick={() => setSliderIndex((sliderIndex + 1) % 2)}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '16px',
                  transform: 'translateY(-50%)',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  zIndex: 10,
                }}
              >
                <FaChevronLeft style={{ color: '#0F172A', fontSize: '14px' }} />
              </button>
              <button
                onClick={() => setSliderIndex((sliderIndex + 1) % 2)}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '16px',
                  transform: 'translateY(-50%)',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  zIndex: 10,
                }}
              >
                <FaChevronRight style={{ color: '#0F172A', fontSize: '14px' }} />
              </button>

              {/* Bottom Overlay Banner */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(to top, rgba(15, 23, 42, 0.96) 0%, rgba(15, 23, 42, 0.75) 65%, transparent 100%)',
                  padding: '36px 24px 24px 24px',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  zIndex: 5,
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
                    Skyline Heights Villa
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#CBD5E1', marginBottom: '14px', fontWeight: 500 }}>
                    <FaMapMarkerAlt style={{ color: '#16A34A' }} />
                    <span>Gachibowli, Hyderabad</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', fontWeight: 600, color: '#E2E8F0' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FaBed style={{ color: '#38BDF8' }} /> 4 BHK
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FaBath style={{ color: '#38BDF8' }} /> 5 Bath
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FaRulerCombined style={{ color: '#38BDF8' }} /> 3200 Sq.ft
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FaHome style={{ color: '#38BDF8' }} /> Villa
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1 }}>
                    ₹1.82 Cr
                  </div>
                  <button
                    onClick={() => onPropertyClick?.('P5')}
                    style={{
                      backgroundColor: '#16A34A',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '10px 20px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(22, 163, 74, 0.4)',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#15803D')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#16A34A')}
                  >
                    <span>View Details</span>
                    <span>→</span>
                  </button>
                </div>
              </div>

              {/* Bottom Center Dots */}
              <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px', zIndex: 10 }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: sliderIndex === 0 ? '#16A34A' : 'rgba(255,255,255,0.4)', display: 'block' }} />
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: sliderIndex === 1 ? '#16A34A' : 'rgba(255,255,255,0.4)', display: 'block' }} />
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.4)', display: 'block' }} />
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.4)', display: 'block' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row (6 Cards in a spacious 3x2 Grid) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px',
            marginTop: '28px',
          }}
        >
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
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', marginTop: '4px' }}>
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Hero;
