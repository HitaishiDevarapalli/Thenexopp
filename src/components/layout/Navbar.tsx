import React, { useState, useEffect } from 'react';
import { FaHome, FaBuilding, FaBriefcase, FaCoins, FaInfoCircle, FaChevronDown, FaMapMarkedAlt, FaStore, FaHandHoldingUsd, FaChartLine, FaShieldAlt, FaEnvelope, FaUtensils, FaMedkit, FaSearch, FaRegHeart, FaUser, FaBars } from 'react-icons/fa';
import { selectedCity, setSelectedCity } from '../../db/marketplaceDb';
import { searchLivePlaces, geocodeLocationOnline } from '../../utils/locationIntelligence';
import { Logo } from '../common/Logo';
import { useAuth } from '../../context/AuthContext';
import { useLocationStore } from '../../context/LocationContext';
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

export const Navbar: React.FC<NavbarProps> = ({ heroBgIndex: _heroBgIndex, onOpenWishlist, onNavigateBusiness, onNavigateProperties, onNavigateFranchise, onNavigateFinance, onGoHome, isSubpage: _isSubpage, onNavigateToPage }) => {
  const { user, openLoginModal, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentCity, setCurrentCityState] = useState(selectedCity);

  // Location Context & Panel State
  const { location } = useLocationStore();
  const [showLocationPanel, setShowLocationPanel] = useState(false);



  useEffect(() => {
    const handler = () => setCurrentCityState(selectedCity);
    window.addEventListener('nexopp_data_changed', handler);
    return () => window.removeEventListener('nexopp_data_changed', handler);
  }, []);



  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY || document.documentElement.scrollTop;
      if (scrollPos > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      // If at top of homepage, force 'hero' (Home) as active section
      if (scrollPos < 120) {
        setActiveSection('hero');
        return;
      }

      // Simple active section detection based on page scroll
      const sections = ['properties', 'franchise', 'business', 'finance', 'about', 'contact'];
      let current = 'hero';
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 150) {
            current = section;
            break;
          }
        }
      }
      setActiveSection(current);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { id: 'hero', label: 'Home', icon: <FaHome /> },
    { id: 'properties', label: 'Property', icon: <FaHome />, dropdown: [
      { name: 'Flats', link: '#properties', subIcon: <FaBuilding /> },
      { name: 'Individual Houses', link: '#properties', subIcon: <FaHome /> },
      { name: 'Land', link: '#properties', subIcon: <FaMapMarkedAlt /> },
    ]},
    { id: 'franchise', label: 'Franchise', icon: <FaBuilding />, dropdown: [
      { name: 'New Franchise', link: '#franchise', subIcon: <FaStore /> },
      { name: 'Existing Franchise', link: '#franchise', subIcon: <FaBriefcase /> },
    ]},
    { id: 'business', label: 'Business', icon: <FaBriefcase />, dropdown: [
      { name: 'Food', link: 'Food', subIcon: <FaUtensils /> },
      { name: 'Healthcare', link: 'Healthcare', subIcon: <FaMedkit /> },
      { name: 'Retail & Stores', link: 'Retail & Stores', subIcon: <FaStore /> },
    ]},
    { id: 'finance', label: 'Finance', icon: <FaCoins />, dropdown: [
      { name: 'Loans', link: '#finance', subIcon: <FaHandHoldingUsd /> },
      { name: 'Finance', link: '#finance', subIcon: <FaChartLine /> },
      { name: 'Insurance', link: '#finance', subIcon: <FaShieldAlt /> },
    ]},
    { id: 'about', label: 'About Us', icon: <FaInfoCircle /> },
    { id: 'contact', label: 'Contact Us', icon: <FaEnvelope /> },
  ];

  const handleScrollTo = (id: string) => {
    if (onGoHome) {
      onGoHome();
    }
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
    setOpenDropdown(null);
  };

  const handleNavItemClick = (itemId: string) => {
    // For category pages, navigate to the dedicated page instead of scrolling
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
    if (itemId === 'adminPortal') {
      if (onNavigateToPage) onNavigateToPage('adminPortal');
      else window.location.href = '/admin';
      setOpenDropdown(null);
      return;
    }
    if (itemId === 'hero' && onGoHome) {
      onGoHome();
      setOpenDropdown(null);
      return;
    }
    if (itemId === 'about' && onNavigateToPage) {
      onNavigateToPage('aboutUsPage');
      setOpenDropdown(null);
      return;
    }
    // For contact, scroll on the homepage
    handleScrollTo(itemId);
  };

  const handleDropdownClick = (itemId: string, subName: string, subLink: string, e: React.MouseEvent) => {
    setOpenDropdown(null);
    e.preventDefault();

    if (itemId === 'business') {
      if (onNavigateBusiness) {
        onNavigateBusiness(subLink as any);
      }
      return;
    }

    if (onNavigateToPage) {
      if (itemId === 'properties') {
        if (subName === 'Flats') onNavigateToPage('flatsPage');
        else if (subName === 'Individual Houses') onNavigateToPage('housesPage');
        else if (subName === 'Land') onNavigateToPage('landPage');
      } else if (itemId === 'franchise') {
        if (subName === 'New Franchise') onNavigateToPage('newFranchise');
        else if (subName === 'Existing Franchise') onNavigateToPage('franchiseResales');
      } else if (itemId === 'finance') {
        if (subName === 'Loans') onNavigateToPage('loansPage');
        else if (subName === 'Finance') onNavigateToPage('financeServicePage');
        else if (subName === 'Insurance') onNavigateToPage('insurancePage');
      }
    } else {
      // Fallback behavior
      if (itemId === 'properties') {
        if (onNavigateProperties) onNavigateProperties();
      } else if (itemId === 'franchise') {
        if (onNavigateFranchise) onNavigateFranchise();
      } else if (itemId === 'finance') {
        if (onNavigateFinance) onNavigateFinance();
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('select-finance-category', { detail: subName.toLowerCase() }));
        }, 200);
      }
    }
  };

  const getNavTextColor = (itemId: string) => {
    if (activeSection === itemId || hoveredItem === itemId) return '#16A34A';
    return '#4B5563';
  };

  return (
    <nav className="navbar" style={{
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #E5E7EB',
      boxShadow: scrolled ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
      transition: 'box-shadow 0.3s ease',
    }}>
      <div className="navbar-container flex-wrap-safe" style={{
        maxWidth: '1360px',
        margin: '0 auto',
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        boxSizing: 'border-box',
      }}>

        {/* Left: Logo */}
        <a
          href="#hero"
          onClick={(e) => { e.preventDefault(); if (onGoHome) onGoHome(); }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            if (onNavigateToPage) onNavigateToPage('adminPortal');
            else window.location.href = '/secret-admin';
          }}
          title="Double-click for Admin Portal"
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

        {/* Center: Nav Items */}
        <ul className="navbar-menu" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          listStyle: 'none',
          margin: 0,
          padding: 0,
        }}>
          {menuItems.map((item) => (
            <li
              key={item.id}
              style={{ position: 'relative', display: 'flex', alignItems: 'center', height: '80px' }}
              onMouseEnter={() => {
                setHoveredItem(item.id);
                if (item.dropdown) setOpenDropdown(item.id);
              }}
              onMouseLeave={() => {
                setHoveredItem(null);
                setOpenDropdown(null);
              }}
            >
              <button
                onClick={() => handleNavItemClick(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px 4px',
                  fontSize: '14.5px',
                  fontWeight: 600,
                  color: getNavTextColor(item.id),
                  transition: 'color 0.2s ease',
                  whiteSpace: 'nowrap',
                  position: 'relative'
                }}
              >
                <span>{item.label}</span>
                {activeSection === item.id && (
                  <div style={{
                    position: 'absolute',
                    bottom: '0px',
                    left: '0',
                    width: '100%',
                    height: '2px',
                    backgroundColor: '#16A34A',
                    borderRadius: '2px'
                  }} />
                )}
                {item.dropdown && (
                  <FaChevronDown style={{
                    fontSize: '10px',
                    transition: 'transform 0.2s ease',
                    transform: openDropdown === item.id ? 'rotate(180deg)' : 'rotate(0deg)',
                    opacity: 0.6,
                  }} />
                )}
              </button>

              {item.dropdown && openDropdown === item.id && (
                <ul style={{
                  position: 'absolute',
                  top: '100%',
                  left: '0',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '10px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  padding: '8px 0',
                  minWidth: '200px',
                  listStyle: 'none',
                  margin: 0,
                  zIndex: 1001,
                  animation: 'fadeIn 0.15s ease',
                }}>
                  {item.dropdown.map((sub, idx) => (
                    <li key={idx}>
                      <a
                        href="#"
                        onClick={(e) => handleDropdownClick(item.id, sub.name, sub.link, e)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 18px',
                          color: '#374151',
                          textDecoration: 'none',
                          fontSize: '14px',
                          fontWeight: 500,
                          transition: 'background-color 0.15s ease, color 0.15s ease',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.backgroundColor = '#F0FDF4';
                          (e.currentTarget as HTMLElement).style.color = '#16A34A';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                          (e.currentTarget as HTMLElement).style.color = '#374151';
                        }}
                      >
                        {sub.subIcon && <span style={{ fontSize: '15px', opacity: 0.75, display: 'flex', alignItems: 'center' }}>{sub.subIcon}</span>}
                        <span>{sub.name}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>

        {/* Right: Watchlist, Post, Profile */}
        <div className="mobile-stack flex-wrap-safe" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexShrink: 0,
          marginLeft: '8px',
        }}>
          {/* Vertical Separator */}
          <div style={{ width: '1px', height: '28px', backgroundColor: '#E2E8F0', marginRight: '8px' }} />

          {/* Location Trigger Button */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowLocationPanel(!showLocationPanel)}
              onMouseEnter={(e) => {
                if(!showLocationPanel) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = '#F8FAFC';
                  (e.currentTarget as HTMLElement).style.borderColor = '#CBD5E1';
                }
              }}
              onMouseLeave={(e) => {
                if(!showLocationPanel) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = '#FFFFFF';
                  (e.currentTarget as HTMLElement).style.borderColor = '#E2E8F0';
                }
              }}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                backgroundColor: showLocationPanel ? '#F8FAFC' : '#FFFFFF', 
                border: '1px solid',
                borderColor: showLocationPanel ? '#CBD5E1' : '#E2E8F0',
                height: '42px',
                padding: '0 16px', 
                borderRadius: '21px', 
                cursor: 'pointer', 
                transition: 'all 0.2s ease' 
              }}
            >
              <FaMapMarkedAlt style={{ color: '#10B981', fontSize: '15px' }} />
              <span style={{ color: '#1E293B', fontWeight: 600, fontSize: '13.5px' }}>{location?.city || 'Location'}</span>
              <FaChevronDown style={{ color: '#64748B', fontSize: '11px', marginLeft: '2px', transition: 'transform 0.2s', transform: showLocationPanel ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </button>
            {showLocationPanel && <LocationSelectorPanel onClose={() => setShowLocationPanel(false)} />}
          </div>

          {/* Saved / Wishlist Button */}
          <button
            onClick={onOpenWishlist}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = '#F8FAFC';
              (e.currentTarget as HTMLElement).style.borderColor = '#CBD5E1';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = '#FFFFFF';
              (e.currentTarget as HTMLElement).style.borderColor = '#E2E8F0';
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              height: '42px',
              padding: '0 16px',
              borderRadius: '21px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <FaRegHeart style={{ color: '#EF4444', fontSize: '15px' }} />
            <span style={{ color: '#1E293B', fontWeight: 600, fontSize: '13.5px' }}>Saved</span>
          </button>

          {/* Login / Profile Section */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setOpenDropdown(openDropdown === 'user' ? null : 'user')}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = '#F8FAFC';
                  (e.currentTarget as HTMLElement).style.borderColor = '#CBD5E1';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = '#FFFFFF';
                  (e.currentTarget as HTMLElement).style.borderColor = '#E2E8F0';
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  height: '42px',
                  padding: '0 12px 0 6px',
                  borderRadius: '21px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                  color: '#FFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 700
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span style={{ color: '#1E293B', fontWeight: 600, fontSize: '13.5px' }}>{user.name}</span>
                <FaChevronDown style={{ fontSize: '11px', color: '#64748B', marginLeft: '2px' }} />
              </button>

              {openDropdown === 'user' && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                  minWidth: '220px',
                  zIndex: 50,
                  overflow: 'hidden',
                  padding: '6px 0'
                }}>
                  <div style={{ padding: '8px 16px', borderBottom: '1px solid #F1F5F9' }}>
                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>PROFILE DETAILS</div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>{user.name}</div>
                    <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px', wordBreak: 'break-all' }}>{user.email}</div>
                    {user.phone && (
                      <div style={{ fontSize: '11px', color: '#0D9488', fontWeight: 700, marginTop: '2px' }}>📞 {user.phone}</div>
                    )}
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
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <FaUser style={{ color: '#10B981' }} /> My Dashboard
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setOpenDropdown(null);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 16px',
                      background: 'none',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#EF4444',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'background 0.15s',
                      borderTop: '1px solid #F1F5F9'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={openLoginModal}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#FFFFFF',
                color: '#16A34A',
                border: '1px solid #16A34A',
                padding: '7px 16px',
                borderRadius: '20px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F0FDF4';
                e.currentTarget.style.color = '#15803D';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.color = '#16A34A';
              }}
            >
              <FaUser style={{ fontSize: '12px' }} />
              <span>Login / Register</span>
            </button>
          )}
        </div>

      </div>


    </nav>
  );
};
export default Navbar;
