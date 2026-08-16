import React, { useState, useEffect } from 'react';
import { 
  FaHome, FaBuilding, FaBriefcase, FaCoins, FaInfoCircle, 
  FaChevronDown, FaMapMarkerAlt, FaStore, FaHandHoldingUsd, 
  FaChartLine, FaShieldAlt, FaEnvelope, FaRegHeart, FaHeart, 
  FaUser, FaBars, FaShoppingBag, FaPlus, FaTimes, FaLayerGroup, FaSignOutAlt
} from 'react-icons/fa';
import { selectedCity, setSelectedCity, siteSettingsDb, isModuleActive } from '../../db/marketplaceDb';
import { Logo } from '../common/Logo';
import { useAuth } from '../../context/AuthContext';
import { useLocationStore } from '../../context/LocationContext';
import { useWishlist } from '../../context/WishlistContext';
import { LocationSelectorPanel } from './LocationSelectorPanel';

interface NavbarProps {
  heroBgIndex: number;
  onOpenWishlist: () => void;
  onNavigateBusiness?: (industry: 'Food' | 'Healthcare' | 'Retail & Stores') => void;
  onNavigateProperties?: () => void;
  onNavigateFranchise?: () => void;
  onNavigateFinance?: () => void;
  onGoHome?: () => void;
  isSubpage?: boolean;
  onNavigateToPage?: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  heroBgIndex: _heroBgIndex,
  onOpenWishlist,
  onNavigateBusiness,
  onNavigateProperties,
  onNavigateFranchise,
  onNavigateFinance,
  onGoHome,
  isSubpage: _isSubpage,
  onNavigateToPage
}) => {
  const { user, openLoginModal, logout } = useAuth();
  const { wishlistItems } = useWishlist();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpandedSection, setMobileExpandedSection] = useState<string | null>(null);
  const [, setCurrentCityState] = useState(selectedCity);

  // Location Context & Panel State
  const { location, isLocationPickerOpen, openLocationPicker, closeLocationPicker } = useLocationStore();

  useEffect(() => {
    const handler = () => {
      setCurrentCityState(selectedCity);
    };
    window.addEventListener('nexopp_data_changed', handler);
    return () => window.removeEventListener('nexopp_data_changed', handler);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY || document.documentElement.scrollTop;
      setScrolled(scrollPos > 20);

      // If at top of homepage, force 'hero' (Home) as active section
      if (scrollPos < 150) {
        setActiveSection('hero');
        return;
      }

      // Check if at the bottom of the page
      if (window.innerHeight + scrollPos >= (document.documentElement.scrollHeight - 180)) {
        setActiveSection('contact');
        return;
      }

      const sections = ['properties', 'franchise', 'business', 'finance', 'about'];
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 140 && rect.bottom >= 180) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const rawMenuItems = [
    { id: 'hero', label: 'Home', icon: <FaHome /> },
    { 
      id: 'properties', 
      label: 'Properties', 
      icon: <FaBuilding />, 
      dropdown: [
        { name: 'All Properties', desc: 'Browse verified real estate listings', link: 'propertiesPage', subIcon: <FaBuilding />, color: '#059669' },
        { name: 'Flats & Apartments', desc: '1, 2, 3, 4+ BHK Gated communities', link: 'flatsPage', subIcon: <FaBuilding />, color: '#002B66' },
        { name: 'Luxury Villas & Houses', desc: 'Premium standalone duplex & villas', link: 'villasPage', subIcon: <FaHome />, color: '#D97706' },
        { name: 'Plots & Lands', desc: 'RERA & DTCP approved commercial lands', link: 'landPage', subIcon: <FaLayerGroup />, color: '#2563EB' },
        { name: 'Rental Properties', desc: 'Residential & corporate office rentals', link: 'rentPage', subIcon: <FaStore />, color: '#7C3AED' },
        { name: 'Sell / Post Property', desc: 'List your property to thousands of buyers', link: 'sellPropertyPage', subIcon: <FaHandHoldingUsd />, color: '#059669', isCta: true },
      ]
    },
    { 
      id: 'franchise', 
      label: 'Franchises', 
      icon: <FaStore />, 
      dropdown: [
        { name: 'Franchise Marketplace', desc: 'Explore all high-ROI brand opportunities', link: 'franchisePage', subIcon: <FaBuilding />, color: '#059669' },
        { name: 'New Brand Expansion', desc: 'Fresh franchise setups with training', link: 'newFranchise', subIcon: <FaStore />, color: '#D97706' },
        { name: 'Running Franchise Resales', desc: 'Operational units with existing cash flow', link: 'franchiseResales', subIcon: <FaBriefcase />, color: '#002B66' },
      ]
    },
    { 
      id: 'business', 
      label: 'Businesses', 
      icon: <FaBriefcase />, 
      dropdown: [
        { name: 'Buy Operational Business', desc: 'Verified companies across retail, tech & F&B', link: 'businessPage', subIcon: <FaShoppingBag />, color: '#059669' },
        { name: 'Sell a Business', desc: 'Confidential valuation & buyer matchmaking', link: 'sellBusinessPage', subIcon: <FaHandHoldingUsd />, color: '#D97706', isCta: true },
      ]
    },
    { 
      id: 'finance', 
      label: 'Finance', 
      icon: <FaCoins />, 
      dropdown: [
        { name: 'Finance & Advisory Desk', desc: 'Comprehensive loan & capital advisory', link: 'financePage', subIcon: <FaCoins />, color: '#059669' },
        { name: 'Home & Property Loans', desc: 'Competitive interest rates with top banks', link: 'loansPage', subIcon: <FaHandHoldingUsd />, color: '#002B66' },
        { name: 'Asset & Business Insurance', desc: 'Risk mitigation & equity protection', link: 'insurancePage', subIcon: <FaShieldAlt />, color: '#2563EB' },
        { name: 'Investment Advisory', desc: 'Due diligence & transaction guidance', link: 'financeServicePage', subIcon: <FaChartLine />, color: '#D97706' },
      ]
    },
    { id: 'about', label: 'About Us', icon: <FaInfoCircle /> },
    { id: 'contact', label: 'Contact Us', icon: <FaEnvelope /> },
  ];

  const menuItems = rawMenuItems.filter(item => item.id === 'hero' || item.id === 'about' || item.id === 'contact' || isModuleActive(item.id));

  const handleNavItemClick = (itemId: string) => {
    if (itemId === 'hero') {
      if (onGoHome) onGoHome();
      setOpenDropdown(null);
      return;
    }
    if (itemId === 'properties' && onNavigateProperties) {
      onNavigateProperties();
      setOpenDropdown(null);
      return;
    }
    if (itemId === 'franchise' && onNavigateFranchise) {
      onNavigateFranchise();
      setOpenDropdown(null);
      return;
    }
    if (itemId === 'business' && onNavigateToPage) {
      onNavigateToPage('businessPage');
      setOpenDropdown(null);
      return;
    }
    if (itemId === 'finance' && onNavigateFinance) {
      onNavigateFinance();
      setOpenDropdown(null);
      return;
    }
    if (itemId === 'about' && onNavigateToPage) {
      onNavigateToPage('aboutUsPage');
      setOpenDropdown(null);
      return;
    }
    if (itemId === 'contact' && onNavigateToPage) {
      onNavigateToPage('contactUsPage');
      setOpenDropdown(null);
      return;
    }
  };

  const handleDropdownClick = (_itemId: string, _subName: string, subLink: string, e: React.MouseEvent) => {
    setOpenDropdown(null);
    e.preventDefault();
    if (onNavigateToPage && subLink) {
      onNavigateToPage(subLink);
    }
  };

  const handleMobileItemClick = (item: any, e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (item.dropdown) {
      setMobileExpandedSection(prev => prev === item.id ? null : item.id);
    } else {
      handleNavItemClick(item.id);
      setMobileMenuOpen(false);
    }
  };

  const handleMobileSubItemClick = (item: any, sub: any, e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMobileMenuOpen(false);
    handleDropdownClick(item.id, sub.name, sub.link, e as any);
  };

  const toggleMobileMenu = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMobileMenuOpen(prev => !prev);
  };

  const displayLocation = location?.area || location?.locality || location?.city || selectedCity || 'Hyderabad';

  return (
    <header className="navbar" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      zIndex: 999999,
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid #E2E8F0',
      boxShadow: scrolled ? '0 4px 20px -2px rgba(15, 23, 42, 0.08)' : '0 1px 3px rgba(15, 23, 42, 0.03)',
      transition: 'all 0.25s ease-in-out',
      height: '78px',
    }}>
      <div style={{
        maxWidth: '1440px',
        width: '100%',
        margin: '0 auto',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
        height: '100%',
      }}>

        {/* 1. Left: Mobile Toggle + Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0, marginRight: '16px' }}>
          <button
            className="mobile-only"
            onClick={toggleMobileMenu}
            onTouchStart={toggleMobileMenu}
            aria-label="Toggle Menu"
            style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0F172A',
              fontSize: '18px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>

          <a
            href="/"
            onClick={(e) => { e.preventDefault(); if (onGoHome) onGoHome(); }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              if (onNavigateToPage) onNavigateToPage('adminPortal');
              else window.location.href = '/admin';
            }}
            title="TheNexopp – India's Trusted Marketplace"
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <Logo size="md" />
          </a>
        </div>

        {/* 2. Center: Clean & Professional Desktop Navigation */}
        <nav className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {menuItems.map((item) => {
            const isActive = activeSection === item.id;
            const isDropdownOpen = openDropdown === item.id;

            return (
              <div
                key={item.id}
                style={{ position: 'relative' }}
                onMouseEnter={() => {
                  if (item.dropdown) setOpenDropdown(item.id);
                }}
                onMouseLeave={() => {
                  setOpenDropdown(null);
                }}
              >
                <button
                  onClick={() => handleNavItemClick(item.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: isActive ? '#ECFDF5' : isDropdownOpen ? '#F8FAFC' : 'transparent',
                    color: isActive ? '#059669' : '#1E293B',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '8px 16px',
                    fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
                    fontSize: '14.5px',
                    fontWeight: isActive ? 700 : 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease-in-out',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '#F8FAFC';
                      e.currentTarget.style.color = '#059669';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = isDropdownOpen ? '#F8FAFC' : 'transparent';
                      e.currentTarget.style.color = '#1E293B';
                    }
                  }}
                >
                  <span>{item.label}</span>
                  {item.dropdown && (
                    <FaChevronDown style={{
                      fontSize: '10px',
                      color: isActive ? '#059669' : '#94A3B8',
                      transition: 'transform 0.2s ease',
                      transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    }} />
                  )}
                </button>

                {/* Modern Floating Dropdown Card */}
                {item.dropdown && isDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 4px)',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '16px',
                      boxShadow: '0 20px 40px -12px rgba(15, 23, 42, 0.16), 0 0 0 1px rgba(0, 0, 0, 0.02)',
                      padding: '8px',
                      minWidth: '290px',
                      zIndex: 10000,
                      animation: 'fadeIn 0.15s ease-out',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {item.dropdown.map((sub, idx) => (
                        <a
                          key={idx}
                          href="#"
                          onClick={(e) => handleDropdownClick(item.id, sub.name, sub.link, e)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '10px 12px',
                            borderRadius: '12px',
                            textDecoration: 'none',
                            transition: 'all 0.15s ease',
                            backgroundColor: sub.isCta ? '#F0FDF4' : 'transparent',
                            border: sub.isCta ? '1px dashed #86EFAC' : 'none',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = sub.isCta ? '#DCFCE7' : '#F8FAFC';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = sub.isCta ? '#F0FDF4' : 'transparent';
                          }}
                        >
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            backgroundColor: sub.isCta ? '#059669' : `${sub.color}14`,
                            color: sub.isCta ? '#FFFFFF' : sub.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '15px',
                            flexShrink: 0,
                          }}>
                            {sub.subIcon}
                          </div>
                          <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{
                              fontSize: '13.5px',
                              fontWeight: 700,
                              color: sub.isCta ? '#059669' : '#0F172A',
                              lineHeight: 1.25,
                            }}>
                              {sub.name}
                            </div>
                            {sub.desc && (
                              <div style={{
                                fontSize: '11.5px',
                                color: '#64748B',
                                marginTop: '2px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}>
                                {sub.desc}
                              </div>
                            )}
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* 3. Right: Location Pill, Saved Wishlist, Sell CTA, Sign In */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, marginLeft: '16px' }}>
          
          {/* Location Selector Pill */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={openLocationPicker}
              title={`Selected Location: ${displayLocation}`}
              className={`navbar-location-btn ${isLocationPickerOpen ? 'active' : ''}`}
            >
              <FaMapMarkerAlt className="navbar-location-icon" />
              <span className="navbar-location-text">
                {displayLocation}
              </span>
              <FaChevronDown 
                className="navbar-location-arrow" 
                style={{
                  transition: 'transform 0.2s ease',
                  transform: isLocationPickerOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }} 
              />
            </button>
            <LocationSelectorPanel onClose={closeLocationPicker} />
          </div>

          {/* Saved / Wishlist Button */}
          <button
            onClick={onOpenWishlist}
            className="navbar-wishlist-btn"
            title="Saved Properties & Wishlist"
          >
            {wishlistItems.length > 0 ? <FaHeart style={{ color: '#EF4444' }} /> : <FaRegHeart />}
            {wishlistItems.length > 0 && (
              <span className="navbar-wishlist-badge">
                {wishlistItems.length}
              </span>
            )}
          </button>

          {/* Post Property Quick Action */}
          <button
            onClick={() => onNavigateToPage?.('sellPropertyPage')}
            className="navbar-post-btn"
            title="List your property or business"
          >
            <FaPlus className="navbar-post-icon" />
            <span className="navbar-post-text">Post Property</span>
          </button>

          {/* User Sign In / Account Dropdown */}
          {user && user.profileCompleted === true ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setOpenDropdown(openDropdown === 'user' ? null : 'user')}
                className="navbar-user-btn"
              >
                <div className="navbar-user-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="navbar-user-name">
                  {user.name}
                </span>
                <FaChevronDown className="navbar-user-chevron" />
              </button>

              {openDropdown === 'user' && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  boxShadow: '0 20px 40px -10px rgba(0,0,0,0.12)',
                  minWidth: '220px',
                  zIndex: 10000,
                  overflow: 'hidden',
                  padding: '6px 0',
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #F1F5F9' }}>
                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Signed In As</div>
                    <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>{user.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px', wordBreak: 'break-all' }}>{user.email}</div>
                  </div>
                  <button
                    onClick={() => {
                      setOpenDropdown(null);
                      if (onNavigateToPage) onNavigateToPage('admin');
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 16px',
                      background: 'none',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#0F172A',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <FaUser style={{ color: '#059669' }} /> My Portal / Dashboard
                  </button>
                  <button
                    onClick={() => {
                      setOpenDropdown(null);
                      onOpenWishlist();
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 16px',
                      background: 'none',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#0F172A',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <FaHeart style={{ color: '#EF4444' }} /> Saved Listings
                  </button>
                  <button
                    onClick={() => { logout(); setOpenDropdown(null); }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 16px',
                      background: 'none',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#EF4444',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      borderTop: '1px solid #F1F5F9',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={openLoginModal}
              title="Sign in to your account"
              className="navbar-signin-btn"
            >
              <FaUser style={{ fontSize: '12px', color: '#10B981' }} />
              <span className="navbar-signin-text">Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="navbar-mobile-drawer">
          {/* Mobile Search / Location Header */}
          <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
              Your Location
            </div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openLocationPicker();
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 700,
                color: '#0F172A',
                cursor: 'pointer',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaMapMarkerAlt style={{ color: '#059669' }} /> {displayLocation}
              </span>
              <span style={{ fontSize: '12px', color: '#059669' }}>Change</span>
            </button>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {menuItems.map((item) => {
              const isExpanded = mobileExpandedSection === item.id;

              return (
                <li key={item.id} style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '4px' }}>
                  <div
                    onClick={(e) => handleMobileItemClick(item, e)}
                    onTouchStart={(e) => handleMobileItemClick(item, e)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 8px',
                      fontSize: '15px',
                      fontWeight: 700,
                      color: '#0F172A',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: '#059669', fontSize: '16px' }}>{item.icon}</span>
                      {item.label}
                    </span>
                    {item.dropdown && (
                      <FaChevronDown style={{
                        fontSize: '12px',
                        color: '#94A3B8',
                        transition: 'transform 0.2s ease',
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      }} />
                    )}
                  </div>

                  {item.dropdown && isExpanded && (
                    <div style={{ paddingLeft: '28px', paddingBottom: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {item.dropdown.map((sub, sIdx) => (
                        <a
                          key={sIdx}
                          href="#"
                          onClick={(e) => handleMobileSubItemClick(item, sub, e)}
                          onTouchStart={(e) => handleMobileSubItemClick(item, sub, e)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 10px',
                            color: sub.isCta ? '#059669' : '#334155',
                            textDecoration: 'none',
                            fontSize: '13.5px',
                            fontWeight: sub.isCta ? 800 : 600,
                            borderRadius: '8px',
                            backgroundColor: sub.isCta ? '#F0FDF4' : 'transparent',
                          }}
                        >
                          <span style={{ color: sub.color || '#059669', fontSize: '13px' }}>{sub.subIcon}</span>
                          <span>{sub.name}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Mobile Bottom Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateToPage?.('sellPropertyPage');
              }}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#059669',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <FaPlus /> Post Property Listing
            </button>

            {user ? (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigateToPage?.('wishlistPage');
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#1E40AF',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <FaUser style={{ color: '#FCD34D' }} /> My Profile & Dashboard
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#F1F5F9',
                    color: '#475569',
                    border: '1px solid #CBD5E1',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <FaSignOutAlt /> Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openLoginModal();
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#002B66',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <FaUser style={{ color: '#10B981' }} /> Sign In / Register
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
