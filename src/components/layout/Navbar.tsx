import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  FaHome, FaBuilding, FaBriefcase, FaCoins, FaInfoCircle, 
  FaChevronDown, FaMapMarkerAlt, FaStore, FaHandHoldingUsd, 
  FaChartLine, FaShieldAlt, FaEnvelope, FaRegHeart, FaHeart, 
  FaUser, FaBars, FaShoppingBag, FaPlus, FaTimes, FaLayerGroup,
  FaSignOutAlt, FaKey
} from 'react-icons/fa';
import { selectedCity, setSelectedCity, siteSettingsDb, isModuleActive, franchiseDb, propertiesDb, businessDb } from '../../db/marketplaceDb';
import { Logo } from '../common/Logo';
import { useAuth } from '../../context/AuthContext';
import { useLocationStore } from '../../context/LocationContext';
import { useWishlist } from '../../context/WishlistContext';
import { LocationSelectorPanel } from './LocationSelectorPanel';
import { UserProfileModal } from '../auth/UserProfileModal';

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
  currentPage?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  heroBgIndex: _heroBgIndex,
  onOpenWishlist,
  onNavigateBusiness,
  onNavigateProperties,
  onNavigateFranchise,
  onNavigateFinance,
  onGoHome,
  isSubpage,
  onNavigateToPage,
  currentPage
}) => {
  const { user, openLoginModal, logout } = useAuth();
  const { wishlistItems } = useWishlist();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);

  // Close dropdown when tapping/clicking anywhere outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, []);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpandedSection, setMobileExpandedSection] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [, setCurrentCityState] = useState(selectedCity);

  // Lock background body scroll cleanly when mobile menu drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add('mobile-drawer-open');
    } else {
      document.body.classList.remove('mobile-drawer-open');
    }
    return () => {
      document.body.classList.remove('mobile-drawer-open');
    };
  }, [mobileMenuOpen]);

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

      // Only perform homepage scroll section tracking if on home page
      const isHome = (!currentPage || currentPage === 'home') && !isSubpage;
      if (!isHome) return;

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
  }, [currentPage, isSubpage]);

  // Compute active navigation tab precisely so Home does not glow on other pages
  const currentActiveTab = React.useMemo(() => {
    const pathname = (window.location.pathname || '').toLowerCase();
    
    // Explicit override for business detail/related pages
    if (pathname.includes('/biz-') || pathname.includes('biz-')) {
      return 'business';
    }

    if (currentPage && currentPage !== 'home') {
      if (['propertiesPage', 'flatsPage', 'villasPage', 'landPage', 'rentPage', 'sellPropertyPage', 'propertyDetails'].includes(currentPage)) {
        return 'properties';
      }
      if (['franchisePage', 'newFranchise', 'franchiseResales', 'franchiseDetails'].includes(currentPage)) {
        return 'franchise';
      }
      if (['businessPage', 'businessListings', 'sellBusinessPage'].includes(currentPage)) {
        return 'business';
      }
      if (['financePage', 'loansPage', 'insurancePage', 'financeServicePage'].includes(currentPage)) {
        return 'finance';
      }
      if (currentPage === 'aboutUsPage') {
        return 'about';
      }
      if (currentPage === 'contactUsPage') {
        return 'contact';
      }
      return '';
    }

    if (isSubpage) {
      if (pathname.includes('/properties') || pathname.includes('/flats') || pathname.includes('/villas') || pathname.includes('/land') || pathname.includes('/rent')) {
        return 'properties';
      }
      if (pathname.includes('/franchise')) {
        return 'franchise';
      }
      if (pathname.includes('/business')) {
        return 'business';
      }
      if (pathname.includes('/finance') || pathname.includes('/loans') || pathname.includes('/insurance')) {
        return 'finance';
      }
      if (pathname.includes('/about')) {
        return 'about';
      }
      if (pathname.includes('/contact')) {
        return 'contact';
      }
      return '';
    }

    return activeSection;
  }, [currentPage, isSubpage, activeSection]);

  const rawMenuItems = [
    { id: 'hero', label: 'Home', icon: <FaHome /> },
    { 
      id: 'properties', 
      label: 'Properties', 
      icon: <FaBuilding />, 
      dropdown: [
        { name: 'Buy Property', desc: 'Browse verified real estate & property listings', link: 'propertiesPage', subIcon: <FaBuilding />, color: '#059669' },
        { name: 'Rent Property', desc: 'Explore verified residential & commercial rentals', link: 'rentPage', subIcon: <FaKey />, color: '#2563EB' },
        { name: 'Sell / Post Property', desc: 'List your property to thousands of buyers', link: 'sellPropertyPage', subIcon: <FaHandHoldingUsd />, color: '#D97706', isCta: true },
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

  const menuItems = rawMenuItems.filter(item => {
    if (item.id === 'hero' || item.id === 'about' || item.id === 'contact') return true;
    if (!isModuleActive(item.id)) return false;
    if ((item.id === 'franchise' || item.id === 'franchises') && (siteSettingsDb.showFranchiseSection === false || franchiseDb.length === 0)) return false;
    if ((item.id === 'business' || item.id === 'businesses') && businessDb.length === 0) return false;
    if ((item.id === 'properties' || item.id === 'property') && propertiesDb.length === 0) return false;
    return true;
  });

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

  const displayLocation = location?.area || location?.locality || location?.city || selectedCity || 'Hyderabad';

  return (
    <>
      <header ref={headerRef} className="navbar" style={{
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
        display: 'flex',
        alignItems: 'center',
      }}>
        <div
          className="navbar-inner-container"
          style={{
            maxWidth: '1440px',
            width: '100%',
            margin: '0 auto',
            padding: '0 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
          }}
        >

          {/* 1. Left: Mobile Toggle + Brand Logo */}
          <div
            className="navbar-left-group"
            style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0, marginRight: '16px' }}
          >
            <button
              className="mobile-only"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
              title="TheNexopp – India's Trusted Marketplace"
              className="navbar-brand-logo-link"
              style={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <Logo size="md" className="header-brand-logo" />
            </a>
          </div>

          {/* 2. Center: Clean & Professional Desktop Navigation */}
          <nav className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {menuItems.map((item) => {
              const isActive = currentActiveTab === item.id;
              const isDropdownOpen = openDropdown === item.id;

              return (
                <div
                  key={item.id}
                  style={{ position: 'relative' }}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (item.dropdown) {
                        setOpenDropdown(prev => prev === item.id ? null : item.id);
                      } else {
                        handleNavItemClick(item.id);
                      }
                    }}
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
                      if (!isActive && !isDropdownOpen) {
                        e.currentTarget.style.backgroundColor = '#F8FAFC';
                        e.currentTarget.style.color = '#059669';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive && !isDropdownOpen) {
                        e.currentTarget.style.backgroundColor = 'transparent';
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

                  {/* Modern Floating Dropdown Card (Clean Option Names, Pure Click-to-Open) */}
                  {item.dropdown && isDropdownOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 4px)',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '14px',
                        boxShadow: '0 16px 36px -8px rgba(15, 23, 42, 0.14), 0 0 0 1px rgba(0, 0, 0, 0.02)',
                        padding: '6px',
                        minWidth: '220px',
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
                              gap: '10px',
                              padding: '8px 12px',
                              borderRadius: '10px',
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
                              width: '28px',
                              height: '28px',
                              borderRadius: '8px',
                              backgroundColor: sub.isCta ? '#059669' : `${sub.color}14`,
                              color: sub.isCta ? '#FFFFFF' : sub.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '13px',
                              flexShrink: 0,
                            }}>
                              {sub.subIcon}
                            </div>
                            <div style={{
                              fontSize: '13.5px',
                              fontWeight: sub.isCta ? 700 : 600,
                              color: sub.isCta ? '#059669' : '#0F172A',
                              whiteSpace: 'nowrap',
                            }}>
                              {sub.name}
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

          {/* 3. Right: Location Pill, Saved Wishlist, Sell CTA, Sign In / Profile */}
          <div className="navbar-right-group" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, marginLeft: '16px' }}>
            
            {/* Location Selector Pill */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={openLocationPicker}
                title={`Selected Location: ${displayLocation}`}
                className="location-pill-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  backgroundColor: isLocationPickerOpen ? '#ECFDF5' : '#F8FAFC',
                  border: '1px solid',
                  borderColor: isLocationPickerOpen ? '#059669' : '#E2E8F0',
                  height: '42px',
                  padding: '0 14px',
                  borderRadius: '24px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
                  boxShadow: isLocationPickerOpen ? '0 0 0 3px rgba(5,150,105,0.12)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isLocationPickerOpen) {
                    e.currentTarget.style.backgroundColor = '#F1F5F9';
                    e.currentTarget.style.borderColor = '#CBD5E1';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLocationPickerOpen) {
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                    e.currentTarget.style.borderColor = '#E2E8F0';
                  }
                }}
              >
                <FaMapMarkerAlt style={{ color: '#059669', fontSize: '13px', flexShrink: 0 }} />
                <span
                  className="location-pill-text"
                  style={{
                    color: '#0F172A',
                    fontWeight: 700,
                    fontSize: '13px',
                    maxWidth: '120px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {displayLocation}
                </span>
                <FaChevronDown style={{
                  color: '#94A3B8',
                  fontSize: '10px',
                  transition: 'transform 0.2s ease',
                  transform: isLocationPickerOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  flexShrink: 0,
                }} />
              </button>
              <LocationSelectorPanel onClose={closeLocationPicker} />
            </div>

            {/* Saved / Wishlist Button */}
            <button
              onClick={onOpenWishlist}
              className="desktop-only"
              title="Favourites"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: wishlistItems.length > 0 ? '#EF4444' : '#64748B',
                fontSize: '15px',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F1F5F9';
                e.currentTarget.style.borderColor = '#CBD5E1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F8FAFC';
                e.currentTarget.style.borderColor = '#E2E8F0';
              }}
            >
              {wishlistItems.length > 0 ? <FaHeart style={{ color: '#EF4444' }} /> : <FaRegHeart />}
              {wishlistItems.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  backgroundColor: '#059669',
                  color: '#FFFFFF',
                  fontSize: '10px',
                  fontWeight: 800,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 5px rgba(5,150,105,0.4)',
                }}>
                  {wishlistItems.length}
                </span>
              )}
            </button>

            {/* Post Property Quick Action */}
            <button
              onClick={() => onNavigateToPage?.('sellPropertyPage')}
              className="desktop-only"
              title="List your property or business"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#FFFFFF',
                color: '#059669',
                border: '1.5px solid #059669',
                height: '42px',
                padding: '0 16px',
                borderRadius: '24px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#059669';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.color = '#059669';
              }}
            >
              <FaPlus style={{ fontSize: '11px', color: '#D97706' }} />
              <span>Post Property</span>
            </button>

            {/* Desktop User Profile Button / Sign In */}
            {user && user.profileCompleted === true ? (
              <div style={{ position: 'relative' }} className="desktop-only">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'user' ? null : 'user')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#059669',
                    backgroundImage: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    height: '42px',
                    padding: '0 14px 0 6px',
                    borderRadius: '24px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)',
                  }}
                >
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: '#064E3B',
                    color: '#FDE047',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 800,
                  }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span style={{
                    fontWeight: 700,
                    fontSize: '13px',
                    maxWidth: '90px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {user.name}
                  </span>
                  <FaChevronDown style={{ 
                    fontSize: '10px', 
                    opacity: 0.8,
                    transition: 'transform 0.2s ease',
                    transform: openDropdown === 'user' ? 'rotate(180deg)' : 'rotate(0deg)',
                  }} />
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
                    minWidth: '230px',
                    zIndex: 10000,
                    overflow: 'hidden',
                    padding: '6px 0',
                  }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #F1F5F9' }}>
                      <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Signed In As</div>
                      <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>{user.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px', wordBreak: 'break-all' }}>
                        {user.email && !user.email.includes('@nexopp.in') && !user.email.includes('@thenexopp') ? user.email : (user.phone ? `+91 ${user.phone.replace('+91', '').trim()}` : '')}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenDropdown(null);
                        setIsProfileModalOpen(true);
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
                      <FaUser style={{ color: '#059669' }} /> My Profile &amp; Account
                    </button>
                    <button
                      type="button"
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
                      <FaHeart style={{ color: '#EF4444' }} /> Favourites ({wishlistItems.length})
                    </button>
                    {(user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') && (
                      <button
                        type="button"
                        onClick={() => {
                          setOpenDropdown(null);
                          if (onNavigateToPage) onNavigateToPage('adminPortal');
                          else window.location.href = '/secure-control-x7k9p2';
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
                        <FaBuilding style={{ color: '#002B66' }} /> Admin Portal Desk
                      </button>
                    )}
                    <button
                      type="button"
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
                      <FaSignOutAlt /> Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openLoginModal}
                className="desktop-only"
                title="Sign in to your account"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#059669',
                  backgroundImage: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  height: '42px',
                  padding: '0 20px',
                  borderRadius: '24px',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)',
                  fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundImage = 'linear-gradient(135deg, #047857 0%, #065F46 100%)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(5, 150, 105, 0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundImage = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(5, 150, 105, 0.25)';
                }}
              >
                <FaUser style={{ fontSize: '12px', color: '#FDE047' }} />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Header Profile Avatar Button (MOBILE ONLY) */}
            {user && user.profileCompleted === true ? (
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="mobile-only mobile-signin-btn"
                title="Open My Profile"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#059669',
                  backgroundImage: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  height: '38px',
                  padding: '0 10px 0 4px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)',
                  flexShrink: 0,
                }}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#064E3B',
                  color: '#FDE047',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 800,
                  flexShrink: 0,
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="mobile-profile-name" style={{ maxWidth: '45px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name.split(' ')[0]}
                </span>
              </button>
            ) : (
              <button
                onClick={openLoginModal}
                className="mobile-only mobile-signin-btn"
                title="Sign In"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#059669',
                  backgroundImage: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  height: '38px',
                  padding: '0 14px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)',
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                }}
              >
                <FaUser style={{ fontSize: '11px', color: '#FDE047', flexShrink: 0 }} />
                <span>Sign In</span>
              </button>
            )}

          </div>
        </div>

      </header>

      {/* 4. Mobile Menu Drawer (Portalled to document.body) */}
      {mobileMenuOpen && createPortal(
        <div
          className="navbar-mobile-drawer-container"
          style={{
            position: 'fixed',
            top: '78px',
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: 'calc(100vh - 78px)',
            backgroundColor: '#FFFFFF',
            zIndex: 99999999,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y',
            padding: '20px 18px 80px 18px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            animation: 'fadeIn 0.2s ease',
            boxSizing: 'border-box',
          }}
        >
          {/* Mobile User Profile Card */}
          {user && user.profileCompleted === true ? (
            <div
              onClick={() => {
                setMobileMenuOpen(false);
                setIsProfileModalOpen(true);
              }}
              style={{
                marginBottom: '16px',
                padding: '14px 16px',
                backgroundColor: '#064E3B',
                backgroundImage: 'linear-gradient(135deg, #064E3B 0%, #059669 100%)',
                borderRadius: '16px',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(6, 78, 59, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: '#064E3B',
                  border: '2px solid rgba(253, 224, 71, 0.6)',
                  color: '#FDE047',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '17px',
                  fontWeight: 800,
                  flexShrink: 0,
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{user.name}</span>
                    <span style={{ fontSize: '10px', backgroundColor: '#F59E0B', color: '#FFF', padding: '1px 6px', borderRadius: '6px', fontWeight: 800 }}>Verified</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#D1FAE5', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.email && !user.email.includes('@nexopp.in') && !user.email.includes('@thenexopp') ? user.email : (user.phone ? `+91 ${user.phone.replace('+91', '').trim()}` : '')}
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '12px', color: '#FDE047', fontWeight: 800, flexShrink: 0, marginLeft: '8px' }}>
                My Profile →
              </span>
            </div>
          ) : (
            <div
              onClick={() => {
                setMobileMenuOpen(false);
                openLoginModal();
              }}
              style={{
                marginBottom: '16px',
                padding: '14px 16px',
                backgroundColor: '#F0FDF4',
                border: '1.5px solid #86EFAC',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(5, 150, 105, 0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: '#FDE047',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                }}>
                  <FaUser />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#064E3B' }}>Sign In to Your Account</div>
                  <div style={{ fontSize: '12px', color: '#059669' }}>Access favourites &amp; profile</div>
                </div>
              </div>
              <span style={{
                fontSize: '12px',
                backgroundColor: '#059669',
                color: '#FFFFFF',
                fontWeight: 800,
                padding: '6px 14px',
                borderRadius: '20px',
              }}>
                Sign In
              </span>
            </div>
          )}

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

          {/* Mobile Nav Menu List */}
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {menuItems.map((item) => {
              const isExpanded = mobileExpandedSection === item.id;

              return (
                <li key={item.id} style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '4px' }}>
                  <div
                    onClick={() => {
                      if (item.dropdown) {
                        setMobileExpandedSection(isExpanded ? null : item.id);
                      } else {
                        handleNavItemClick(item.id);
                        setMobileMenuOpen(false);
                      }
                    }}
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
                          onClick={(e) => {
                            setMobileMenuOpen(false);
                            handleDropdownClick(item.id, sub.name, sub.link, e);
                          }}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '30px' }}>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateToPage?.('sellPropertyPage');
              }}
              style={{
                width: '100%',
                padding: '13px',
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
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
              }}
            >
              <FaPlus /> Post Property Listing
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenWishlist();
              }}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <FaHeart style={{ color: '#EF4444' }} /> Saved Wishlist ({wishlistItems.length})
            </button>

            {user && user.profileCompleted === true ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#FEF2F2',
                  color: '#DC2626',
                  border: '1px solid #FECACA',
                  borderRadius: '12px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <FaSignOutAlt /> Log Out of Account
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openLoginModal();
                }}
                style={{
                  width: '100%',
                  padding: '13px',
                  backgroundColor: '#059669',
                  backgroundImage: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
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
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
                }}
              >
                <FaUser style={{ color: '#FDE047' }} /> Sign In / Register
              </button>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onNavigateToPage={onNavigateToPage}
        onOpenWishlist={onOpenWishlist}
      />
    </>
  );
};

export default Navbar;
