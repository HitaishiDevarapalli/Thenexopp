import React, { useState, useMemo, useEffect } from 'react';
import { propertiesDb, selectedCity, dealersDb, demandRegionsDb, getDistance } from '../db/marketplaceDb';
import {
  FaSearch,
  FaMapMarkerAlt,
  FaHome,
  FaBuilding,
  FaBed,
  FaBath,
  FaRulerCombined,
  FaCar,
  FaHeart,
  FaRegHeart,
  FaStar,
  FaCheckCircle,
  FaCrown,
  FaFire,
  FaList,
  FaMap,
  FaColumns,
  FaChevronDown,
  FaChevronUp,
  FaCrosshairs,
  FaPlus,
  FaMinus,
  FaExpand,
  FaFilter,
} from 'react-icons/fa';
import { LiveLocationMap } from './ui/LiveLocationMap';
import { useLocationStore } from '../context/LocationContext';

interface PropertyCategoriesProps {
  onPropertyClick?: (id: string) => void;
  onBuyProperty?: (id: string) => void;
  onCategorySelect?: (category: string) => void;
  initialCategory?: string | null;
  searchQuery?: string;
  onClearSearch?: () => void;
  title?: string;
  subtitle?: string;
  onBack?: () => void;
}

export const PropertyCategories: React.FC<PropertyCategoriesProps> = ({
  onPropertyClick,
  onBuyProperty,
  onCategorySelect: _onCategorySelect,
  initialCategory: _initialCategory,
  searchQuery,
  onClearSearch,
  title,
  subtitle,
  onBack,
}) => {
  // Top Search Card State
  const { location } = useLocationStore();
  const [activeTab, setActiveTab] = useState<'Buy' | 'Rent' | 'Commercial' | 'Plots' | 'New Projects'>('Buy');
  const [locationText, setLocationText] = useState('');
  const [propertyType, setPropertyType] = useState('All Types');
  const [budget, setBudget] = useState('₹ 1K - 1Cr+');
  const [bhkFilter, setBhkFilter] = useState('Any BHK');

  useEffect(() => {
    setLocationText(selectedCity || '');
  }, [selectedCity]);

  // Left Sidebar Filters State
  const [budgetOpen, setBudgetOpen] = useState(true);
  const [bhkOpen, setBhkOpen] = useState(true);
  const [typeOpen, setTypeOpen] = useState(true);
  const [moreOpen, setMoreOpen] = useState(false);

  const [selectedBhks, setSelectedBhks] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedMoreFilters, setSelectedMoreFilters] = useState<string[]>([]);

  useEffect(() => {
    if (!_initialCategory) {
      setSelectedTypes([]);
      setPropertyType('All Types');
      // Do not return here, allow the search params effect below to run
    } else {
      if (_initialCategory === 'BuyApartment') {
        setSelectedTypes(['Apartment']);
        setPropertyType('Apartment');
        setActiveTab('Buy');
      } else if (_initialCategory === 'BuyHouse') {
        setSelectedTypes(['Independent House']);
        setPropertyType('Independent House');
        setActiveTab('Buy');
      } else if (_initialCategory === 'BuyVilla') {
        setSelectedTypes(['Villa']);
        setPropertyType('Villa');
        setActiveTab('Buy');
      } else if (_initialCategory === 'BuyLand') {
        setSelectedTypes(['Plot / Land']);
        setPropertyType('Plot / Land');
        setActiveTab('Plots');
      } else if (_initialCategory === 'Commercial') {
        setSelectedTypes(['Commercial Property']);
        setPropertyType('Commercial Property');
        setActiveTab('Commercial');
      } else if (_initialCategory === 'Industrial') {
        setSelectedTypes(['Industrial Property']);
        setPropertyType('Industrial Property');
        setActiveTab('Commercial');
      } else if (_initialCategory === 'FarmLand') {
        setSelectedTypes(['Farm Land']);
        setPropertyType('Farm Land');
        setActiveTab('Plots');
      }
    }

    // Read from URL params if available
    const searchParams = new URLSearchParams(window.location.search);
    const loc = searchParams.get('location');
    const type = searchParams.get('type');
    const bgt = searchParams.get('budget');
    
    if (loc) {
      setLocationText(loc);
    }
    if (type) {
      if (type.includes('BHK')) {
        setBhkFilter(type);
        setSelectedBhks([type]);
      } else {
        setPropertyType(type);
        setSelectedTypes([type]);
      }
    }
    if (bgt) {
      setBudget(bgt);
      // Synchronize slider bounds manually based on budget if needed, but the effect will pick it up
    }
  }, [_initialCategory]);

  // Centralized numeric budget limits (in Lakhs: 0.01 to 100)
  const [minBudget, setMinBudget] = useState(0.01);
  const [maxBudget, setMaxBudget] = useState(100);
  const [dragging, setDragging] = useState<'min' | 'max' | null>(null);

  const isRent = activeTab === 'Rent';
  const sliderMin = 0.01;
  const sliderMax = isRent ? 10 : 100;

  // Synchronize dropdown selects and sidebar multiselect states
  const handleBudgetSelectChange = (val: string) => {
    setBudget(val);
    const isRentTab = activeTab === 'Rent';
    if (isRentTab) {
      if (val === '₹ 1K - 10L+') {
        setMinBudget(0.01);
        setMaxBudget(10);
      } else if (val === 'Under ₹ 15K') {
        setMinBudget(0.01);
        setMaxBudget(0.15);
      } else if (val === '₹ 15K - ₹ 35K') {
        setMinBudget(0.15);
        setMaxBudget(0.35);
      } else if (val === '₹ 35K - ₹ 75K') {
        setMinBudget(0.35);
        setMaxBudget(0.75);
      } else if (val === '₹ 75K+') {
        setMinBudget(0.75);
        setMaxBudget(10);
      }
    } else {
      if (val === '₹ 1K - 1Cr+') {
        setMinBudget(0.01);
        setMaxBudget(100);
      } else if (val === 'Under ₹ 5L') {
        setMinBudget(0.01);
        setMaxBudget(5);
      } else if (val === '₹ 5L - ₹ 25L') {
        setMinBudget(5);
        setMaxBudget(25);
      } else if (val === '₹ 25L - ₹ 75L') {
        setMinBudget(25);
        setMaxBudget(75);
      } else if (val === '₹ 75L - ₹ 1Cr') {
        setMinBudget(75);
        setMaxBudget(100);
      }
    }
  };

  const handleBhkSelectChange = (val: string) => {
    setBhkFilter(val);
    if (val === 'Any BHK') {
      setSelectedBhks([]);
    } else {
      setSelectedBhks([val]);
    }
  };

  const handleTypeSelectChange = (val: string) => {
    setPropertyType(val);
    if (val === 'All Types') {
      setSelectedTypes([]);
    } else {
      setSelectedTypes([val]);
    }
  };

  // Synchronize budget bounds when activeTab changes
  useEffect(() => {
    const isRentTab = activeTab === 'Rent';
    setMinBudget(0.01);
    setMaxBudget(isRentTab ? 10 : 100);
    setBudget(isRentTab ? '₹ 1K - 10L+' : '₹ 1K - 1Cr+');
  }, [activeTab]);

  // Draggable logic for double budget range slider
  useEffect(() => {
    if (!dragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      const slider = document.getElementById('budget-slider-track');
      if (!slider) return;
      const rect = slider.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const rawVal = sliderMin + pct * (sliderMax - sliderMin);
      const val = parseFloat(rawVal.toFixed(2));
      if (dragging === 'min') {
        setMinBudget(Math.min(val, maxBudget - 0.01));
      } else {
        setMaxBudget(Math.max(val, minBudget + 0.01));
      }
    };
    const handleMouseUp = () => {
      setDragging(null);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, minBudget, maxBudget, sliderMin, sliderMax]);

  // Right Results State
  const [viewMode, setViewMode] = useState<'list' | 'map' | 'split'>('list');
  const [sortBy, setSortBy] = useState('Relevance');
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null);
  const [wishlisted, setWishlisted] = useState<Record<string, boolean>>({});
  const [demandFilter, setDemandFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlisted((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleBhk = (val: string) => {
    setSelectedBhks((prev) =>
      prev.includes(val) ? prev.filter((item) => item !== val) : [...prev, val]
    );
  };

  const toggleType = (val: string) => {
    setSelectedTypes((prev) => {
      const next = prev.includes(val) ? prev.filter((item) => item !== val) : [...prev, val];
      // Sync the top dropdown with sidebar checkboxes
      if (next.length === 1) {
        setPropertyType(next[0]);
      } else {
        setPropertyType('All Types');
      }
      return next;
    });
  };

  const toggleMoreFilter = (val: string) => {
    setSelectedMoreFilters((prev) =>
      prev.includes(val) ? prev.filter((item) => item !== val) : [...prev, val]
    );
  };

  const clearAllFilters = () => {
    setSelectedBhks([]);
    setSelectedTypes([]);
    setSelectedMoreFilters([]);
    setMinBudget(0.01);
    setMaxBudget(isRent ? 10 : 100);
    setActiveQuickFilter(null);
    setPropertyType('All Types');
    setBudget(isRent ? '₹ 1K - 10L+' : '₹ 1K - 1Cr+');
    setBhkFilter('Any BHK');
    if (onClearSearch) onClearSearch();
  };

  // Rich screenshot-matching properties list
  const displayProperties = useMemo(() => {
    const activeListings = propertiesDb;
    const baseList = activeListings.map((p) => {
      const assignedBroker = dealersDb.find(d => d.id === p.dealerId || (p.assignedBrokerIds && p.assignedBrokerIds.includes(d.id)));
      const brokerName = assignedBroker?.companyName || assignedBroker?.fullName || p.agentName || 'RealtyPlus Advisors';
      const brokerRating = assignedBroker?.rating ? `${assignedBroker.rating} (${assignedBroker.reviewCount || 10})` : (p.agentRating ? `${p.agentRating} (${p.reviewCount || 10})` : '4.8 (24)');
      const brokerImg = assignedBroker?.photo || assignedBroker?.logo || p.agentImage || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80';
      return {
        id: p.id,
        title: p.title || `${p.bedrooms || 3} BHK ${p.category}`,
        location: `${p.area ? p.area + ', ' : ''}${p.city || ''}`,
        badge: p.verified ? 'Verified' : (p.premium ? 'Premium' : 'New'),
        badgeType: p.verified ? 'verified' : (p.premium ? 'premium' : 'new'),
        image: p.image || p.imageUrl || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&auto=format&fit=crop&q=80',
        area: p.sqft ? `${p.sqft} sq ft` : (p.builtUpArea ? `${p.builtUpArea} sq ft` : '1500 sq ft'),
        bhk: String(p.bedrooms || 3),
        bath: String(p.bathrooms || 3),
        parking: String(p.parking || 1),
        price: p.priceDisplay || (`₹ ${p.price || 1} L`),
        dist: '1.2 KM away',
        brokerName,
        brokerRating,
        brokerImg,
        dealerId: assignedBroker?.id || p.dealerId,
        type: p.category || 'Apartment',
        latitude: p.latitude,
        longitude: p.longitude,
        city: p.city,
        rawPrice: (p.price && p.price < 10) ? p.price * 100 : (p.price || 0),
        status: p.status || 'Buy',
        availabilityCount: p.availabilityCount || 0,
        trending: p.trending || false,
        approvalStatus: p.approvalStatus,
        listingStatus: p.listingStatus,
        viewsCount: p.viewsCount || 0,
      };
    });

    return baseList.filter((item) => {
      // 0.5 Demand Region Filter
      if (demandFilter !== 'All') {
        const matchingRegions = demandRegionsDb.filter(r => r.demandLevel === demandFilter);
        if (item.latitude && item.longitude) {
          const matchDemand = matchingRegions.some(r => {
            const dist = getDistance(r.latitude, r.longitude, item.latitude, item.longitude);
            return dist <= r.radius;
          });
          if (!matchDemand) return false;
        } else {
          return false;
        }
      }

      // 1. Search Query
      if (searchQuery && searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const match =
          item.title.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          item.type.toLowerCase().includes(q);
        if (!match) return false;
      }

      // 2. Geospatial Location Filtering
      if (location && location.lat && location.lng) {
        if (item.latitude && item.longitude) {
          const dist = getDistance(location.lat, location.lng, item.latitude, item.longitude);
          // Only show properties within 50km radius
          if (dist > 50) return false;
        } else {
          // Fallback to string matching if property doesn't have lat/lng yet in the mock DB
          const loc = location.city.toLowerCase() || location.displayName.toLowerCase();
          const matchLoc = item.location.toLowerCase().includes(loc) || (item.city && item.city.toLowerCase().includes(loc));
          if (!matchLoc) return false;
        }
      } else if (locationText && locationText.trim() !== '') {
        const loc = locationText.toLowerCase();
        if (!loc.includes('current location') && !loc.includes('gps')) {
          const matchLoc = item.location.toLowerCase().includes(loc) || (item.city && item.city.toLowerCase().includes(loc));
          if (!matchLoc) return false;
        }
      }

      // 3. Tab Categorization — skip tab filter when a specific property type is already selected
      if (selectedTypes.length === 0) {
        if (activeTab === 'Buy' && item.status.toLowerCase() !== 'buy' && item.status.toLowerCase() !== 'sell') return false;
        if (activeTab === 'Rent' && item.status.toLowerCase() !== 'rent') return false;
        if (activeTab === 'Commercial' && item.type.toLowerCase() !== 'commercial' && item.type.toLowerCase() !== 'commercial property') return false;
        if (activeTab === 'Plots' && item.type.toLowerCase() !== 'plot' && item.type.toLowerCase() !== 'plot / land' && item.type.toLowerCase() !== 'land') return false;
        if (activeTab === 'New Projects' && !item.trending && item.badgeType !== 'new') return false;
      }

      // 4. BHK Multi-select (OR within category)
      if (selectedBhks.length > 0) {
        const bhkStr = `${item.bhk} BHK`;
        const matchBhk = selectedBhks.some((val) => {
          if (val === '4+ BHK' && parseInt(item.bhk) >= 4) return true;
          return val === bhkStr;
        });
        if (!matchBhk) return false;
      }

      // 5. Property Type Multi-select (OR within category)
      if (selectedTypes.length > 0) {
        const typeMatch = selectedTypes.some((selectedLabel) => {
          const normLabel = selectedLabel.toLowerCase();
          const normItemType = item.type.toLowerCase();
          if (normLabel.includes('apartment') && (normItemType.includes('apartment') || normItemType.includes('flat'))) return true;
          if (normLabel.includes('villa') && normItemType.includes('villa')) return true;
          if (normLabel.includes('house') && !normLabel.includes('villa') && (normItemType.includes('house') || normItemType.includes('independent'))) return true;
          if (normLabel.includes('plot') && (normItemType.includes('plot') || normItemType.includes('land'))) return true;
          if (normLabel.includes('commercial') && normItemType.includes('commercial')) return true;
          if (normLabel.includes('farm') && (normItemType.includes('farm') || normItemType.includes('agricultural'))) return true;
          if (normLabel.includes('industrial') && normItemType.includes('industrial')) return true;
          return normItemType === normLabel;
        });
        if (!typeMatch) return false;
      }

      // 6. Budget Slider Min / Max
      if (item.rawPrice < minBudget || item.rawPrice > maxBudget) {
        return false;
      }

      // 7. More Filters (AND logic)
      if (selectedMoreFilters.length > 0) {
        if (selectedMoreFilters.includes('Verified Only') && item.badgeType !== 'verified') return false;
        if (selectedMoreFilters.includes('Ready to Move') && item.availabilityCount === 0) return false;
        if (selectedMoreFilters.includes('Parking Available') && parseInt(item.parking) === 0) return false;
      }

      // 8. Quick Filters (AND logic)
      if (activeQuickFilter) {
        if (activeQuickFilter === 'Verified Properties' && item.badgeType !== 'verified') return false;
        if (activeQuickFilter === 'Ready to Move' && item.availabilityCount === 0) return false;
        if (activeQuickFilter === 'New Launch' && item.badgeType !== 'new') return false;
        if (activeQuickFilter === 'Premium' && item.badgeType !== 'premium') return false;
        if (activeQuickFilter === 'Top Brokers' && parseFloat(item.brokerRating) < 4.5) return false;
      }

      return true;
    });
  }, [propertiesDb, searchQuery, locationText, location, activeTab, selectedBhks, selectedTypes, selectedMoreFilters, minBudget, maxBudget, activeQuickFilter]);

  const totalPages = Math.ceil(displayProperties.length / itemsPerPage);
  const validPage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));
  const paginatedProperties = useMemo(() => {
    const start = (validPage - 1) * itemsPerPage;
    return displayProperties.slice(start, start + itemsPerPage);
  }, [displayProperties, validPage, itemsPerPage]);

  const tabs = [
    { id: 'Buy' as const, label: 'Buy', icon: FaHome },
    { id: 'Rent' as const, label: 'Rent', icon: FaBed },
    { id: 'Commercial' as const, label: 'Commercial', icon: FaBuilding },
    { id: 'Plots' as const, label: 'Plots', icon: FaMapMarkerAlt },
    { id: 'New Projects' as const, label: 'New Projects', icon: FaFire },
  ];

  return (
    <section
      style={{
        backgroundColor: '#F8FAFC',
        paddingTop: '115px',
        paddingBottom: '60px',
        minHeight: '100vh',
        fontFamily: "'Outfit', 'Inter', -apple-system, sans-serif",
      }}
    >
      <div style={{ maxWidth: '1360px', width: '100%', margin: '0 auto', padding: '0 24px', boxSizing: 'border-box' }}>
        
        {/* TOP HEADER ROW WITH BACK BUTTON */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #E2E8F0', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {onBack && (
              <button
                onClick={onBack}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '12px',
                  color: '#0F172A',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; e.currentTarget.style.borderColor = '#16A34A'; e.currentTarget.style.color = '#16A34A'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.color = '#0F172A'; }}
              >
                <span>←</span>
                <span>Back</span>
              </button>
            )}
            <div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                {title || 'Properties Marketplace'}
              </h1>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0', fontWeight: 500 }}>
                {subtitle || 'Explore verified residential, commercial, plots and new projects across India'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#16A34A', backgroundColor: '#DCFCE7', padding: '6px 14px', borderRadius: '9999px', border: '1px solid #BBF7D0' }}>
              ● {propertiesDb.length} Active Properties
            </span>
          </div>
        </div>

        {/* TOP BIG WHITE SEARCH BOX CARD */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            padding: '24px 28px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
            border: '1px solid #E2E8F0',
            marginBottom: '32px',
          }}
        >
          {/* Top Tabs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              borderBottom: '1px solid #F1F5F9',
              paddingBottom: '16px',
              marginBottom: '20px',
              flexWrap: 'wrap',
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
                    padding: '8px 18px',
                    borderRadius: '9999px',
                    border: 'none',
                    backgroundColor: isActive ? '#DCFCE7' : 'transparent',
                    color: isActive ? '#16A34A' : '#475569',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative',
                  }}
                >
                  <Icon style={{ fontSize: '15px' }} />
                  <span>{tab.label}</span>
                  {isActive && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '-17px',
                        left: '15%',
                        right: '15%',
                        height: '3px',
                        backgroundColor: '#16A34A',
                        borderRadius: '3px 3px 0 0',
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Row of Filter Inputs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2.2fr 1.3fr 1.3fr 1.1fr 1.3fr auto',
              gap: '14px',
              alignItems: 'start',
            }}
          >
            {/* Location Input */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: '6px' }}>
                Location
              </label>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <FaSearch style={{ color: '#94A3B8', fontSize: '14px', flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Search locality, landmark or city"
                  value={locationText}
                  onChange={(e) => setLocationText(e.target.value)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    width: '100%',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#0F172A',
                  }}
                />
              </div>
              <button
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(() => {
                      setLocationText('Current Location (GPS)');
                    });
                  } else {
                    setLocationText('Hyderabad, Telangana');
                  }
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#16A34A',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '8px',
                  padding: 0,
                }}
              >
                <FaCrosshairs />
                <span>Use My Current Location</span>
              </button>
            </div>

            {/* Property Type Dropdown */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: '6px' }}>
                Property Type
              </label>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaBuilding style={{ color: '#64748B', fontSize: '14px' }} />
                  <select
                    value={propertyType}
                    onChange={(e) => handleTypeSelectChange(e.target.value)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      outline: 'none',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#0F172A',
                      cursor: 'pointer',
                      width: '100%',
                    }}
                  >
                    <option value="All Types">All Types</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Villa">Villa</option>
                    <option value="Independent House">Independent House</option>
                    <option value="Plot / Land">Plot / Land</option>
                    <option value="Commercial Property">Commercial Property</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Budget Dropdown */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: '6px' }}>
                Budget
              </label>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                  <span style={{ fontWeight: 800, color: '#64748B', fontSize: '14px' }}>₹</span>
                  <select
                    value={budget}
                    onChange={(e) => handleBudgetSelectChange(e.target.value)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      outline: 'none',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#0F172A',
                      cursor: 'pointer',
                      width: '100%',
                    }}
                  >
                    {activeTab === 'Rent' ? (
                      <>
                        <option value="₹ 5K - 10L+">₹ 5K - 10L+</option>
                        <option value="Under ₹ 15K">Under ₹ 15K</option>
                        <option value="₹ 15K - ₹ 35K">₹ 15K - ₹ 35K</option>
                        <option value="₹ 35K - ₹ 75K">₹ 35K - ₹ 75K</option>
                        <option value="₹ 75K+">₹ 75K+</option>
                      </>
                    ) : (
                      <>
                        <option value="₹ 1K - 1Cr+">₹ 1K - 1Cr+</option>
                        <option value="Under ₹ 5L">Under ₹ 5L</option>
                        <option value="₹ 5L - ₹ 25L">₹ 5L - ₹ 25L</option>
                        <option value="₹ 25L - ₹ 75L">₹ 25L - ₹ 75L</option>
                        <option value="₹ 75L - ₹ 1Cr">₹ 75L - ₹ 1Cr</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* BHK Dropdown */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: '6px' }}>
                BHK
              </label>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <select
                  value={bhkFilter}
                  onChange={(e) => handleBhkSelectChange(e.target.value)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#0F172A',
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  <option value="Any BHK">Any BHK</option>
                  <option value="1 BHK">1 BHK</option>
                  <option value="2 BHK">2 BHK</option>
                  <option value="3 BHK">3 BHK</option>
                  <option value="4+ BHK">4+ BHK</option>
                </select>
              </div>
            </div>

            {/* Demand Region Filter */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: '6px' }}>
                Demand Region
              </label>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <select
                  value={demandFilter}
                  onChange={(e) => setDemandFilter(e.target.value as any)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#0F172A',
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  <option value="All">All Regions</option>
                  <option value="High">🟢 High Demand</option>
                  <option value="Medium">🟡 Medium Demand</option>
                  <option value="Low">🔴 Low Demand</option>
                </select>
              </div>
            </div>

            {/* Search Button & Advanced Search */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '22px' }}>
              <button
                onClick={() => alert('Searching properties...')}
                style={{
                  backgroundColor: '#16A34A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 28px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)',
                  transition: 'all 0.2s',
                  width: '100%',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#15803D')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#16A34A')}
              >
                <FaSearch />
                <span>Search Properties</span>
              </button>
              <button
                onClick={() => alert('Opening Advanced Search Options...')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer',
                  marginTop: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>Advanced Search</span>
                <FaChevronDown style={{ fontSize: '10px' }} />
              </button>
            </div>
          </div>
        </div>

        {/* MAIN 2-COLUMN GRID AREA */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '270px 1fr',
            gap: '28px',
            alignItems: 'start',
          }}
        >
          {/* LEFT SIDEBAR: "Filter By" Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #E2E8F0',
              padding: '22px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #F1F5F9', paddingBottom: '14px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Filter By
              </h3>
              <button
                onClick={clearAllFilters}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#16A34A',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Clear All
              </button>
            </div>

            {/* Budget Section */}
            <div style={{ paddingBottom: '4px' }}>
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}
              >
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>Budget</span>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '10px' }}>
                  <span>{isRent ? '₹ 1K' : '₹ 1K'}</span>
                  <span>{isRent ? '₹ 10 Lac+' : '₹ 1 Cr+'}</span>
                </div>
                {/* Range Bar Graphic */}
                <div
                  id="budget-slider-track"
                  style={{ position: 'relative', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', margin: '14px 6px' }}
                >
                  {/* Active green range fill */}
                  <div
                    style={{
                      position: 'absolute',
                      left: `${((minBudget - sliderMin) / (sliderMax - sliderMin)) * 100}%`,
                      right: `${100 - ((maxBudget - sliderMin) / (sliderMax - sliderMin)) * 100}%`,
                      top: 0,
                      bottom: 0,
                      backgroundColor: '#16A34A',
                      borderRadius: '3px',
                    }}
                  />
                  {/* Min thumb */}
                  <div
                    onMouseDown={() => setDragging('min')}
                    style={{
                      position: 'absolute',
                      left: `calc(${((minBudget - sliderMin) / (sliderMax - sliderMin)) * 100}% - 9px)`,
                      top: '-6px',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      backgroundColor: '#FFFFFF',
                      border: '3px solid #16A34A',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                      cursor: 'ew-resize',
                      zIndex: 2,
                    }}
                  />
                  {/* Max thumb */}
                  <div
                    onMouseDown={() => setDragging('max')}
                    style={{
                      position: 'absolute',
                      left: `calc(${((maxBudget - sliderMin) / (sliderMax - sliderMin)) * 100}% - 9px)`,
                      top: '-6px',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      backgroundColor: '#FFFFFF',
                      border: '3px solid #16A34A',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                      cursor: 'ew-resize',
                      zIndex: 2,
                    }}
                  />
                </div>
                <div style={{ fontSize: '11px', color: '#16A34A', fontWeight: 800, marginTop: '8px', textAlign: 'center' }}>
                  Selected: {minBudget < 1 ? `₹ ${Math.round(minBudget * 1000)}` : minBudget >= 100 ? `₹ ${(minBudget / 100).toFixed(1)} Cr` : `₹ ${minBudget.toFixed(1)} Lac`} - {maxBudget >= sliderMax ? (isRent ? '₹ 10 Lac+' : '₹ 1 Cr+') : maxBudget >= 100 ? `₹ ${(maxBudget / 100).toFixed(1)} Cr` : maxBudget < 1 ? `₹ ${Math.round(maxBudget * 1000)}` : `₹ ${maxBudget.toFixed(1)} Lac`}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT RESULTS AREA */}
          <div>
            
            {/* Top Bar: View toggles + Count + Sort */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              {/* View Mode Tabs */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px' }}>
                {[
                  { id: 'list' as const, label: 'List View', icon: FaList },
                  { id: 'map' as const, label: 'Map View', icon: FaMap },
                  { id: 'split' as const, label: 'Split View', icon: FaColumns },
                ].map((vm) => {
                  const Icon = vm.icon;
                  const isActive = viewMode === vm.id;
                  return (
                    <button
                      key={vm.id}
                      onClick={() => setViewMode(vm.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: isActive ? '#16A34A' : '#64748B',
                        fontWeight: isActive ? 800 : 600,
                        fontSize: '14px',
                        cursor: 'pointer',
                        paddingBottom: '8px',
                        position: 'relative',
                      }}
                    >
                      <Icon />
                      <span>{vm.label}</span>
                      {isActive && (
                        <span
                          style={{
                            position: 'absolute',
                            bottom: '-9px',
                            left: 0,
                            right: 0,
                            height: '2.5px',
                            backgroundColor: '#16A34A',
                            borderRadius: '2px',
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Count & Sort */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                  Showing <strong style={{ color: '#0F172A' }}>{displayProperties.length} properties</strong>
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', padding: '6px 12px' }}>
                  <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '12px', fontWeight: 800, color: '#0F172A', cursor: 'pointer' }}
                  >
                    <option value="Relevance">Relevance</option>
                    <option value="Price: Low to High">Price: Low to High</option>
                    <option value="Price: High to Low">Price: High to Low</option>
                    <option value="Newest First">Newest First</option>
                    <option value="Distance">Distance</option>
                  </select>
                </div>
              </div>
            </div>



            {/* BIG INTERACTIVE MAP VIEW BOX (Show when viewMode is 'list' or 'map' or 'split') */}
            {(viewMode === 'list' || viewMode === 'map' || viewMode === 'split') && (
              <div style={{ marginBottom: '24px' }}>
                <LiveLocationMap
                  items={displayProperties}
                  type="property"
                  onSelectItem={(id) => {
                    if (onPropertyClick) onPropertyClick(id);
                    else if (onBuyProperty) onBuyProperty(id);
                  }}
                  height={viewMode === 'map' ? '550px' : '360px'}
                />
              </div>
            )}

            {/* QUICK FILTERS ROW */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginRight: '4px' }}>
                Quick Filters:
              </span>
              {[
                { label: 'Verified Properties', icon: FaCheckCircle, id: 'Verified Properties' },
                { label: 'Ready to Move', icon: FaHome, id: 'Ready to Move' },
                { label: 'New Launch', icon: FaFire, id: 'New Launch' },
                { label: 'Premium', icon: FaCrown, id: 'Premium' },
                { label: 'Price Drop', icon: FaCheckCircle, id: 'Price Drop' },
                { label: 'Top Brokers', icon: FaStar, id: 'Top Brokers' },
              ].map((qf) => {
                const Icon = qf.icon;
                const isActive = activeQuickFilter === qf.id;
                return (
                  <button
                    key={qf.id}
                    onClick={() => setActiveQuickFilter(isActive ? null : qf.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      borderRadius: '9999px',
                      border: isActive ? '1px solid #16A34A' : '1px solid #CBD5E1',
                      backgroundColor: isActive ? '#DCFCE7' : '#FFFFFF',
                      color: isActive ? '#16A34A' : '#334155',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Icon style={{ color: '#16A34A', fontSize: '13px' }} />
                    <span>{qf.label}</span>
                  </button>
                );
              })}
            </div>

            {/* PROPERTY CARDS GRID */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: viewMode === 'map' ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                gap: '20px',
                marginBottom: '36px',
              }}
            >
              {displayProperties.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', backgroundColor: '#FFFFFF', padding: '60px 20px', borderRadius: '24px', border: '1px solid #E2E8F0', textAlign: 'center', color: '#64748B' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🏠</div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>No Properties Found</h3>
                  <p style={{ fontSize: '0.95rem', maxWidth: '400px', margin: '0 auto' }}>There are currently no active properties matching your filter criteria or in the marketplace.</p>
                </div>
              ) : (
                paginatedProperties.map((prop) => {
                const isFav = !!wishlisted[prop.id];
                let badgeBg = '#DCFCE7';
                let badgeColor = '#16A34A';
                let BadgeIcon = FaCheckCircle;

                if (prop.badgeType === 'premium') {
                  badgeBg = '#E0E7FF';
                  badgeColor = '#4F46E5';
                  BadgeIcon = FaCrown;
                } else if (prop.badgeType === 'ready') {
                  badgeBg = '#DBEAFE';
                  badgeColor = '#2563EB';
                  BadgeIcon = FaHome;
                } else if (prop.badgeType === 'new') {
                  badgeBg = '#FFEDD5';
                  badgeColor = '#EA580C';
                  BadgeIcon = FaFire;
                }

                return (
                  <div
                    key={prop.id}
                    onClick={() => onPropertyClick?.(prop.id)}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '20px',
                      border: '1px solid #E2E8F0',
                      overflow: 'hidden',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.04)';
                    }}
                  >
                    {/* Image Banner */}
                    <div style={{ position: 'relative', height: '180px', backgroundColor: '#0F172A' }}>
                      <img
                        src={prop.image}
                        alt={prop.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />

                      {/* Top Left Badge */}
                      {prop.approvalStatus === 'Sold' || prop.listingStatus === 'Sold' ? (
                        <>
                          <style>{`
                            @keyframes soldBadgeFadeIn {
                              from { opacity: 0; transform: scale(0.9) rotate(-10deg); }
                              to { opacity: 1; transform: scale(1) rotate(-10deg); }
                            }
                          `}</style>
                          <div
                            style={{
                              position: 'absolute',
                              top: '12px',
                              left: '12px',
                              backgroundColor: '#E53935',
                              color: '#FFFFFF',
                              padding: '6px 14px',
                              borderRadius: '9999px',
                              fontSize: '12px',
                              fontWeight: 900,
                              letterSpacing: '0.05em',
                              boxShadow: '0 4px 10px rgba(229, 57, 53, 0.4)',
                              zIndex: 10,
                              transform: 'rotate(-10deg)',
                              animation: 'soldBadgeFadeIn 0.4s ease-out forwards',
                              fontFamily: "'Outfit', 'Inter', sans-serif"
                            }}
                          >
                            SOLD
                          </div>
                        </>
                      ) : (
                        <div
                          style={{
                            position: 'absolute',
                            top: '12px',
                            left: '12px',
                            backgroundColor: badgeBg,
                            color: badgeColor,
                            padding: '4px 10px',
                            borderRadius: '9999px',
                            fontSize: '11px',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          }}
                        >
                          <BadgeIcon />
                          <span>{prop.badge}</span>
                        </div>
                      )}

                      {/* Top Right Heart Button */}
                      <button
                        onClick={(e) => toggleWishlist(prop.id, e)}
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(0, 0, 0, 0.4)',
                          backdropFilter: 'blur(4px)',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        {isFav ? (
                          <FaHeart style={{ color: '#EF4444', fontSize: '15px' }} />
                        ) : (
                          <FaRegHeart style={{ color: '#FFFFFF', fontSize: '15px' }} />
                        )}
                      </button>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                          {prop.title}
                        </h4>
                        <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{prop.location}</span>
                          <span style={{ color: '#16A34A', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>👁️ {prop.viewsCount || 0}</span>
                        </div>

                        {/* Specs Row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', fontWeight: 600, color: '#475569', backgroundColor: '#F8FAFC', padding: '8px 10px', borderRadius: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FaRulerCombined style={{ color: '#3B82F6' }} /> {prop.area}
                          </span>
                          {prop.bhk !== '0' && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <FaBed style={{ color: '#3B82F6' }} /> {prop.bhk}
                            </span>
                          )}
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FaBath style={{ color: '#3B82F6' }} /> {prop.bath}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FaCar style={{ color: '#3B82F6' }} /> {prop.parking}
                          </span>
                        </div>

                        {/* Price & Distance Row */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>
                            {prop.price}
                          </span>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#16A34A', backgroundColor: '#DCFCE7', padding: '2px 8px', borderRadius: '6px' }}>
                            {prop.dist}
                          </span>
                        </div>
                      </div>

                      {/* Broker Footer */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={prop.brokerImg}
                            alt={prop.brokerName}
                            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'contain', border: '2px solid #1E40AF', backgroundColor: '#EFF6FF' }}
                          />
                          <div>
                            <div style={{ fontSize: '10px', fontWeight: 600, color: '#64748B' }}>Posted by:</div>
                            <div style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', wordBreak: 'break-word' }}>{prop.brokerName}</div>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '1px' }}>
                              <FaStar /> {prop.brokerRating}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onPropertyClick?.(prop.id);
                          }}
                          style={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #CBD5E1',
                            padding: '6px 12px',
                            borderRadius: '10px',
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#0F172A',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#0F172A';
                            e.currentTarget.style.color = '#FFFFFF';
                            e.currentTarget.style.borderColor = '#0F172A';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#FFFFFF';
                            e.currentTarget.style.color = '#0F172A';
                            e.currentTarget.style.borderColor = '#CBD5E1';
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }))}
            </div>

            {/* BOTTOM PAGINATION BAR */}
            {displayProperties.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid #CBD5E1',
                  paddingTop: '20px',
                  flexWrap: 'wrap',
                  gap: '14px',
                }}
              >
                {/* Page Numbers */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={validPage <= 1}
                    style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: validPage <= 1 ? '#F1F5F9' : '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: validPage <= 1 ? 'not-allowed' : 'pointer', color: validPage <= 1 ? '#94A3B8' : '#64748B', fontWeight: 700 }}
                  >
                    &lt;
                  </button>
                  {Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1).map((pNum) => {
                    const isCur = validPage === pNum;
                    return (
                      <button
                        key={pNum}
                        onClick={() => setCurrentPage(pNum)}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          border: isCur ? '1px solid #16A34A' : '1px solid #CBD5E1',
                          backgroundColor: isCur ? '#16A34A' : '#FFFFFF',
                          color: isCur ? '#FFFFFF' : '#334155',
                          fontWeight: 700,
                          fontSize: '13px',
                          cursor: 'pointer',
                        }}
                      >
                        {pNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(Math.max(1, totalPages), p + 1))}
                    disabled={validPage >= totalPages}
                    style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: validPage >= totalPages ? '#F1F5F9' : '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: validPage >= totalPages ? 'not-allowed' : 'pointer', color: validPage >= totalPages ? '#94A3B8' : '#64748B', fontWeight: 700 }}
                  >
                    &gt;
                  </button>
                </div>

                {/* Show items per page */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>Show:</span>
                  <select
                    value={`${itemsPerPage} per page`}
                    onChange={(e) => {
                      const val = parseInt(e.target.value.split(' ')[0], 10);
                      if (!isNaN(val)) {
                        setItemsPerPage(val);
                        setCurrentPage(1);
                      }
                    }}
                    style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '6px 12px', fontSize: '13px', fontWeight: 700, color: '#0F172A', cursor: 'pointer' }}
                  >
                    <option value="12 per page">12 per page</option>
                    <option value="24 per page">24 per page</option>
                    <option value="48 per page">48 per page</option>
                  </select>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </section>
  );
};

export default PropertyCategories;
