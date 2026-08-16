import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  FaHome, FaBuilding, FaBriefcase, FaCoins, FaInfoCircle, 
  FaChevronDown, FaMapMarkerAlt, FaStore, FaHandHoldingUsd, 
  FaChartLine, FaShieldAlt, FaEnvelope, FaRegHeart, FaHeart, 
  FaUser, FaBars, FaShoppingBag, FaPlus, FaTimes, FaLayerGroup,
  FaSignOutAlt
} from 'react-icons/fa';
import { selectedCity, setSelectedCity, siteSettingsDb, isModuleActive } from '../../db/marketplaceDb';
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
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [, setCurrentCityState] = useState(selectedCity);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
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

  const displayLocation = location?.area || location?.locality || location?.city || selectedCity || 'Hyderabad';

  return (
    <>
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
        display: 'flex',
        alignItems: 'center',
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
        }}>

          {/* 1. Left: Mobile Toggle + Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0, marginRight: '16px' }}>
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

          {/* 3. Right: Location Pill, Saved Wishlist, Sell CTA, Sign In / Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, marginLeft: '16px' }}>
            
            {/* Location Selector Pill */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={openLocationPicker}
                title={`Selected Location: ${displayLocation}`}
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
                <FaMapMarkerAlt style={{ color: '#059669', fontSize: '13px' }} />
                <span style={{
                  color: '#0F172A',
                  fontWeight: 700,
                  fontSize: '13px',
                  maxWidth: '120px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {displayLocation}
                </span>
                <FaChevronDown style={{
                  color: '#94A3B8',
                  fontSize: '10px',
                  transition: 'transform 0.2s ease',
                  transform: isLocationPickerOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }} />
              </button>
              <LocationSelectorPanel onClose={closeLocationPicker} />
            </div>

            {/* Saved / Wishlist Button */}
            <button
              onClick={onOpenWishlist}
              className="desktop-only"
              title="Saved Properties & Wishlist"
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
                color: '#002B66',
                border: '1.5px solid #002B66',
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
                e.currentTarget.style.backgroundColor = '#002B66';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.color = '#002B66';
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
                    backgroundColor: '#002B66',
                    color: '#FFFFFF',
                    border: 'none',
                    height: '42px',
                    padding: '0 14px 0 6px',
                    borderRadius: '24px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(0, 43, 102, 0.2)',
                  }}
                >
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: '#059669',
                    color: '#FFFFFF',
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
                  <FaChevronDown style={{ fontSize: '10px', opacity: 0.8 }} />
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
                      <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px', wordBreak: 'break-all' }}>{user.email}</div>
                    </div>
                    <button
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
                      <FaHeart style={{ color: '#EF4444' }} /> Saved Listings ({wishlistItems.length})
                    </button>
                    <button
                      onClick={() => {
                        setOpenDropdown(null);
                        if (onNavigateToPage) onNavigateToPage('adminPortal');
                        else window.location.href = '/admin';
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
                  backgroundColor: '#002B66',
                  color: '#FFFFFF',
                  border: 'none',
                  height: '42px',
                  padding: '0 20px',
                  borderRadius: '24px',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0, 43, 102, 0.25)',
                  fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#001E47';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 43, 102, 0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#002B66';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 43, 102, 0.25)';
                }}
              >
                <FaUser style={{ fontSize: '12px', color: '#10B981' }} />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Header Profile Avatar Button (MOBILE ONLY) */}
            {user && user.profileCompleted === true ? (
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="mobile-only"
                title="Open My Profile"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#002B66',
                  color: '#FFFFFF',
                  border: 'none',
                  height: '38px',
                  padding: '0 10px 0 4px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  boxShadow: '0 2px 6px rgba(0,43,102,0.2)',
                }}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#059669',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 800,
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span style={{ maxWidth: '75px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name.split(' ')[0]}
                </span>
              </button>
            ) : (
              <button
                onClick={openLoginModal}
                className="mobile-only"
                title="Sign In"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#002B66',
                  color: '#FFFFFF',
                  border: 'none',
                  height: '38px',
                  padding: '0 14px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  boxShadow: '0 2px 6px rgba(0,43,102,0.2)',
                }}
              >
                <FaUser style={{ fontSize: '11px', color: '#10B981' }} />
                <span>Sign In</span>
              </button>
            )}

          </div>
        </div>

      </header>

      {/* 4. Mobile Menu Drawer (Portalled to document.body) */}
      {mobileMenuOpen && createPortal(
        <div style={{
          position: 'fixed',
          top: '78px',
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: 'calc(100vh - 78px)',
          backgroundColor: '#FFFFFF',
          zIndex: 99999999,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: '20px 24px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          animation: 'fadeIn 0.2s ease',
          boxSizing: 'border-box',
        }}>
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
                backgroundColor: '#002B66',
                borderRadius: '16px',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0, 43, 102, 0.2)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: '#059669',
                  border: '2px solid rgba(255,255,255,0.4)',
                  color: '#FFFFFF',
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
                    <span style={{ fontSize: '10px', backgroundColor: '#10B981', color: '#FFF', padding: '1px 6px', borderRadius: '6px' }}>Verified</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#93C5FD', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.email}
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '12px', color: '#34D399', fontWeight: 700, flexShrink: 0, marginLeft: '8px' }}>
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
                backgroundColor: '#F8FAFC',
                border: '1.5px dashed #CBD5E1',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#002B66', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                  <FaUser />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>Sign In to Your Account</div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>Access saved listings &amp; profile</div>
                </div>
              </div>
              <span style={{ fontSize: '12px', color: '#059669', fontWeight: 800 }}>Sign In</span>
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
                  boxShadow: '0 4px 12px rgba(0, 43, 102, 0.25)',
                }}
              >
                <FaUser style={{ color: '#10B981' }} /> Sign In / Register
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
