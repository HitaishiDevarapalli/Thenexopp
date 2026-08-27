import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { businessDb, masterCategoriesDb, masterLocationsDb, masterBusinessTypesDb, masterLocalitiesDb, masterAreasDb, dealersDb } from '../db/marketplaceDb';
import { useWishlist } from '../context/WishlistContext';
import {
  FaSearch,
  FaMapMarkerAlt,
  FaBriefcase,
  FaUtensils,
  FaShoppingBag,
  FaMedkit,
  FaIndustry,
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
  FaChartLine,
  FaUsers,
  FaDollarSign,
  FaBalanceScale,
  FaUserTie,
} from 'react-icons/fa';
import { LiveLocationMap } from './ui/LiveLocationMap';
import { useLocationStore } from '../context/LocationContext';

interface BusinessMarketplaceProps {
  onExploreCategory?: (category: any) => void;
  onPropertyClick?: (id: string) => void;
  onBuyProperty?: (id: string) => void;
  title?: string;
  subtitle?: string;
  onBack?: () => void;
}

export const BusinessMarketplace: React.FC<BusinessMarketplaceProps> = ({
  onPropertyClick,
  onBuyProperty,
  title,
  subtitle,
  onBack,
}) => {
  const { location, setLocation } = useLocationStore();
  const lastSyncedGlobalCityRef = useRef<string>(location?.city || location?.displayName || '');
  const [, setForceUpdate] = useState(0);
  useEffect(() => {
    const handler = () => setForceUpdate((prev) => prev + 1);
    window.addEventListener('nexopp_data_changed', handler);
    return () => window.removeEventListener('nexopp_data_changed', handler);
  }, []);

  // Top Search Card State
  const [activeTab, setActiveTab] = useState<string>('All');
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [selectedAreaId, setSelectedAreaId] = useState<string>('');
  const [locationText, setLocationText] = useState(() => {
    return location?.area || location?.city || location?.displayName || 'All Cities';
  });
  const [industry, setIndustry] = useState('All Categories');
  const [valuation, setValuation] = useState('Any Budget');
  const [revenue, setRevenue] = useState('Any Revenue');

  // Dynamic Cities (Master locations + any unique cities present in businessDb)
  const availableCities = useMemo(() => {
    const masterCities = masterLocationsDb.filter(c => c.is_active);
    const bizCities = new Set<string>();
    businessDb.forEach((b: any) => {
      if (b.city && b.city.trim()) bizCities.add(b.city.trim());
    });
    const list = [...masterCities];
    bizCities.forEach(cName => {
      if (!list.some(c => c.name.toLowerCase() === cName.toLowerCase())) {
        list.push({ id: `city_${cName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`, name: cName, is_active: true, type: 'location' });
      }
    });
    return list;
  }, [masterLocationsDb, businessDb]);

  // Dynamic Areas for Selected City (ONLY areas that actually have active businesses in this city)
  const availableAreas = useMemo(() => {
    if (!selectedCityId) return [];
    const selectedCityObj = availableCities.find(c => c.id === selectedCityId);
    const cityName = selectedCityObj ? selectedCityObj.name.toLowerCase().trim() : '';

    const areaSet = new Set<string>();

    businessDb.forEach((b: any) => {
      const bCity = (b.city || '').toLowerCase().trim();
      if ((cityName && (bCity.includes(cityName) || cityName.includes(bCity))) || !cityName) {
        const areaVal = b.area || b.location;
        if (areaVal && areaVal.trim()) {
          areaSet.add(areaVal.trim());
        }
      }
    });

    return Array.from(areaSet).sort((a, b) => a.localeCompare(b)).map(name => ({
      id: `area_biz_${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
      name,
      cityId: selectedCityId,
      is_active: true
    }));
  }, [selectedCityId, availableCities, businessDb]);

  useEffect(() => {
    const currentGlobalCity = location?.city || location?.displayName || '';
    if (currentGlobalCity) {
      setLocationText(currentGlobalCity);
      const matchedCity = availableCities.find(c => c.is_active && (currentGlobalCity.toLowerCase().includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(currentGlobalCity.toLowerCase())));
      if (lastSyncedGlobalCityRef.current !== currentGlobalCity) {
        if (matchedCity) {
          setSelectedCityId(matchedCity.id);
        }
        lastSyncedGlobalCityRef.current = currentGlobalCity;
      }
    }
  }, [location, availableCities]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const loc = searchParams.get('location');
    const type = searchParams.get('type');
    const bgt = searchParams.get('budget');
    
    if (loc) {
      setLocationText(loc);
      const matched = availableCities.find(c => c.name.toLowerCase() === loc.toLowerCase());
      if (matched) setSelectedCityId(matched.id);
    }
    if (type && type !== 'Any') {
      setIndustry(type);
      setSelectedInds([type]);
    }
    if (bgt && bgt !== 'Any') {
      setValuation(bgt);
    }
  }, [availableCities]);

  // Centralized numeric budget limits (in Lakhs: 0.01 = 1K, 100 = 1Cr, 1000 = 10Cr)
  const [minBudget, setMinBudget] = useState(0.01);
  const [maxBudget, setMaxBudget] = useState(1000);
  const [dragging, setDragging] = useState<'min' | 'max' | null>(null);

  const sliderMin = 0.01;
  const sliderMax = 1000;

  // Accordion Expand/Collapse States for Sidebar Filter Sections
  const [isBudgetOpen, setIsBudgetOpen] = useState(true);
  const [isLocationOpen, setIsLocationOpen] = useState(true);
  const [isIndustryOpen, setIsIndustryOpen] = useState(true);
  const [isStructureOpen, setIsStructureOpen] = useState(true);
  const [isVerifiedOpen, setIsVerifiedOpen] = useState(true);

  const formatPriceVal = useCallback((valLakhs: number) => {
    if (valLakhs < 1) {
      const thousand = Math.round(valLakhs * 100);
      return thousand > 0 ? `${thousand} K` : '1 K';
    }
    if (valLakhs >= 100) {
      const cr = valLakhs / 100;
      return `${cr % 1 === 0 ? cr : cr.toFixed(1)} Cr`;
    }
    return `${valLakhs % 1 === 0 ? valLakhs : valLakhs.toFixed(1)} Lac`;
  }, []);

  const [minInputText, setMinInputText] = useState(formatPriceVal(minBudget));
  const [maxInputText, setMaxInputText] = useState(formatPriceVal(maxBudget));

  useEffect(() => {
    setMinInputText(formatPriceVal(minBudget));
  }, [minBudget, formatPriceVal]);

  useEffect(() => {
    setMaxInputText(formatPriceVal(maxBudget));
  }, [maxBudget, formatPriceVal]);

  const parseAndSetMin = (str: string) => {
    setMinInputText(str);
    const clean = str.toLowerCase().replace(/,/g, '').trim();
    if (!clean) return;
    let lakhs: number | null = null;
    if (clean.endsWith('cr') || clean.endsWith('crore') || clean.endsWith('crores')) {
      const num = parseFloat(clean.replace(/[^\d.]/g, ''));
      if (!isNaN(num)) lakhs = num * 100;
    } else if (clean.endsWith('k') || clean.endsWith('thousand')) {
      const num = parseFloat(clean.replace(/[^\d.]/g, ''));
      if (!isNaN(num)) lakhs = num / 100;
    } else if (clean.endsWith('l') || clean.endsWith('lac') || clean.endsWith('lakh') || clean.endsWith('lakhs')) {
      const num = parseFloat(clean.replace(/[^\d.]/g, ''));
      if (!isNaN(num)) lakhs = num;
    } else {
      const rawNum = parseFloat(clean.replace(/[^\d.]/g, ''));
      if (!isNaN(rawNum)) {
        if (rawNum >= 1000) lakhs = rawNum / 100000;
        else lakhs = rawNum;
      }
    }
    if (lakhs !== null && lakhs >= sliderMin) {
      setMinBudget(Math.min(lakhs, maxBudget - 0.01));
    }
  };

  const parseAndSetMax = (str: string) => {
    setMaxInputText(str);
    const clean = str.toLowerCase().replace(/,/g, '').trim();
    if (!clean) return;
    let lakhs: number | null = null;
    if (clean.endsWith('cr') || clean.endsWith('crore') || clean.endsWith('crores')) {
      const num = parseFloat(clean.replace(/[^\d.]/g, ''));
      if (!isNaN(num)) lakhs = num * 100;
    } else if (clean.endsWith('k') || clean.endsWith('thousand')) {
      const num = parseFloat(clean.replace(/[^\d.]/g, ''));
      if (!isNaN(num)) lakhs = num / 100;
    } else if (clean.endsWith('l') || clean.endsWith('lac') || clean.endsWith('lakh') || clean.endsWith('lakhs')) {
      const num = parseFloat(clean.replace(/[^\d.]/g, ''));
      if (!isNaN(num)) lakhs = num;
    } else {
      const rawNum = parseFloat(clean.replace(/[^\d.]/g, ''));
      if (!isNaN(rawNum)) {
        if (rawNum >= 1000) lakhs = rawNum / 100000;
        else lakhs = rawNum;
      }
    }
    if (lakhs !== null) {
      setMaxBudget(Math.max(lakhs, minBudget + 0.01));
    }
  };

  // Draggable & touch logic for double budget range slider
  useEffect(() => {
    if (!dragging) return;

    const handlePointerMove = (clientX: number) => {
      const slider = document.getElementById('biz-budget-slider-track');
      if (!slider) return;
      const rect = slider.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const rawVal = sliderMin + pct * (sliderMax - sliderMin);
      const val = parseFloat(rawVal.toFixed(2));
      if (dragging === 'min') {
        setMinBudget(Math.min(val, maxBudget - 0.01));
      } else {
        setMaxBudget(Math.max(val, minBudget + 0.01));
      }
    };

    const handleMouseMove = (e: MouseEvent) => handlePointerMove(e.clientX);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) handlePointerMove(e.touches[0].clientX);
    };

    const handleMouseUp = () => setDragging(null);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [dragging, minBudget, maxBudget, sliderMin, sliderMax]);

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const slider = document.getElementById('biz-budget-slider-track');
    if (!slider) return;
    const rect = slider.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const rawVal = sliderMin + pct * (sliderMax - sliderMin);
    const val = parseFloat(rawVal.toFixed(2));
    
    const distToMin = Math.abs(val - minBudget);
    const distToMax = Math.abs(val - maxBudget);
    if (distToMin < distToMax) {
      setMinBudget(Math.min(val, maxBudget - 0.01));
    } else {
      setMaxBudget(Math.max(val, minBudget + 0.01));
    }
  };

  // Left Sidebar Filters State
  const [selectedInds, setSelectedInds] = useState<string[]>([]);
  const [selectedProfs, setSelectedProfs] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>('');
  const [selectedLocality, setSelectedLocality] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  const handleCityChange = (cityId: string) => {
    setSelectedCityId(cityId);
    setSelectedAreaId('');
    const matched = availableCities.find(c => c.id === cityId);
    setLocationText(matched ? matched.name : 'All Cities');

    if (cityId) {
      if (matched) {
        lastSyncedGlobalCityRef.current = matched.name;
        setLocation({
          city: matched.name,
          displayName: matched.name,
          state: '',
          country: 'India',
          lat: 0,
          lng: 0
        });
      }
    } else {
      lastSyncedGlobalCityRef.current = '';
      setLocation({
        city: '',
        displayName: 'All India',
        state: '',
        country: 'India',
        lat: 0,
        lng: 0
      });
    }
  };

  const handleAreaChange = (areaId: string) => {
    setSelectedAreaId(areaId);
  };

  // Right Results State
  const [viewMode, setViewMode] = useState<'list' | 'map' | 'split'>('list');
  const [sortBy, setSortBy] = useState('Relevance');
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null);
  const [wishlisted, setWishlisted] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const { toggleWishlist: globalToggleWishlist, isWishlisted } = useWishlist();

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    globalToggleWishlist(id, 'BUSINESS');
  };

  const toggleInd = (val: string) => {
    setSelectedInds((prev) =>
      prev.includes(val) ? prev.filter((item) => item !== val) : [...prev, val]
    );
  };

  const toggleProf = (val: string) => {
    setSelectedProfs((prev) =>
      prev.includes(val) ? prev.filter((item) => item !== val) : [...prev, val]
    );
  };

  const clearAllFilters = () => {
    setSelectedInds([]);
    setSelectedProfs([]);
    setSelectedLocations([]);
    setMinBudget(0.01);
    setMaxBudget(1000);
    setSelectedCityId('');
    setSelectedAreaId('');
    setLocationText('All Cities');
    setActiveQuickFilter(null);
    setIndustry('All Categories');
    setValuation('Any Budget');
    setActiveTab('All');
    setSortBy('Relevance');
  };

  const businessesList = useMemo(() => {
    const list = businessDb
      .filter((b: any) => b.published !== false && !b.sold && b.status !== 'Sold' && b.listingStatus !== 'Sold')
      .map((b: any) => {
        const assignedBroker = b.dealerId ? dealersDb.find(d => d.id === b.dealerId) : null;
        const cleanRev = (b.revenueMonthly === '₹1 Lakh/mo' || b.revenueMonthly === '₹ 1 Lakh/mo') ? '' : (b.revenueMonthly || b.revenue || '');
        const cleanProfit = (b.profitMonthly === '₹30,000/mo' || b.profitMonthly === '₹ 30,000/mo') ? '' : (b.profitMonthly || '');
        const cleanEmployees = (b.employeesCount && Number(b.employeesCount) > 0) ? `${b.employeesCount} Staff` : '';

        return {
          id: b.id,
          title: b.name || b.title || 'Business For Sale',
          industry: b.category || b.industry || 'Retail',
          category: b.category || b.industry || 'Retail',
          businessType: b.businessType || 'Private Limited',
          badge: b.featured ? 'Featured Opportunity' : (b.verified ? 'Verified Seller' : ''),
          badgeType: b.featured ? 'deal' : (b.verified ? 'verified' : ''),
          featured: b.featured || false,
          status: b.status || 'Available',
          image: b.image || b.imageUrl || (b.images && b.images[0]) || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect fill='%23F1F5F9' width='600' height='400'/%3E%3Ctext fill='%2394A3B8' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18'%3EBusiness%3C/text%3E%3C/svg%3E",
          valuation: b.priceDisplay || (b.price ? `₹${b.price} Lakhs` : ''),
          price: Number(b.price) || Number(b.askingPrice) || 0,
          revenue: cleanRev,
          margin: cleanProfit,
          employees: cleanEmployees,
          location: [b.area, b.city, b.state].filter(Boolean).join(', ') || b.location || '',
          brokerName: b.agentName || (assignedBroker ? (assignedBroker.companyName || assignedBroker.fullName) : 'Direct Listing'),
          brokerRating: assignedBroker ? `${assignedBroker.rating || 4.8}` : '',
          brokerImg: assignedBroker ? (assignedBroker.photo || assignedBroker.logo || '') : '',
          latitude: b.latitude,
          longitude: b.longitude,
          city: b.city,
          locality: b.location,
          createdAt: (b as any).createdAt || '',
        };
      });

    let filtered = list.filter((item) => {
      // Category filter
      if (activeTab !== 'All' && item.category !== activeTab) return false;
      if (selectedInds.length > 0 && !selectedInds.includes(item.category)) return false;
      
      // City & Area Location filter
      if (selectedCityId) {
        const selCity = availableCities.find(c => c.id === selectedCityId);
        const selCityName = selCity ? selCity.name.toLowerCase().trim() : '';
        const itemCity = (item.city || '').toLowerCase().trim();
        const itemLoc = (item.location || '').toLowerCase().trim();
        
        const isCityMatch = selCityName && (itemCity.includes(selCityName) || selCityName.includes(itemCity) || itemLoc.includes(selCityName));
        
        if (selectedAreaId) {
          const selArea = availableAreas.find(a => a.id === selectedAreaId);
          const selAreaName = selArea ? selArea.name.toLowerCase().trim() : '';
          const itemArea = ((item as any).area || item.locality || item.location || '').toLowerCase().trim();
          const isAreaMatch = selAreaName && (itemArea.includes(selAreaName) || selAreaName.includes(itemArea));
          if (!isAreaMatch) return false;
        } else if (!isCityMatch) {
          return false;
        }


      // Business structure / deal type filter
      if (selectedProfs.length > 0 && !selectedProfs.includes(item.businessType)) return false;
      
      // Budget Range Filter (slider)
      if (item.price > 0) {
        if (item.price < minBudget) return false;
        if (maxBudget < sliderMax && item.price > maxBudget) return false;
      }

      // Quick filters
      if (activeQuickFilter) {
        if (activeQuickFilter === 'Verified Sellers' && item.badgeType !== 'verified') return false;
        if (activeQuickFilter === 'Profitable Now' && item.badgeType !== 'profit') return false;
        if (activeQuickFilter === 'Featured' && !item.featured) return false;
      }
      return true;
    });

    // Sort
    if (sortBy === 'Valuation: Low to High' || sortBy === 'Price: Low to High') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'Valuation: High to Low' || sortBy === 'Price: High to Low') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'Featured') {
      filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return filtered;
  }, [businessDb, activeTab, selectedInds, selectedCityId, selectedAreaId, availableCities, availableAreas, locationText, selectedProfs, minBudget, maxBudget, sliderMax, activeQuickFilter, sortBy]);

  const totalPages = Math.ceil(businessesList.length / itemsPerPage);
  const validPage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));
  const paginatedBusinesses = useMemo(() => {
    const start = (validPage - 1) * itemsPerPage;
    return businessesList.slice(start, start + itemsPerPage);
  }, [businessesList, validPage, itemsPerPage]);

  const activeCategories = masterCategoriesDb.filter(c => c.is_active !== false);
  
  const tabs = [
    { id: 'All', label: 'All Businesses', icon: FaBriefcase },
    ...activeCategories.slice(0, 5).map(cat => ({
      id: cat.name,
      label: cat.name,
      icon: cat.name.includes('Restaurant') ? FaUtensils :
            cat.name.includes('Healthcare') ? FaMedkit :
            cat.name.includes('Retail') ? FaShoppingBag :
            cat.name.includes('Manufacturing') ? FaIndustry : FaBriefcase,
    })),
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
                {title || 'Business Marketplace'}
              </h1>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0', fontWeight: 500 }}>
                {subtitle || 'Discover verified businesses for sale, investment, and strategic acquisitions'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#16A34A', backgroundColor: '#DCFCE7', padding: '6px 14px', borderRadius: '9999px', border: '1px solid #BBF7D0' }}>
              ● {businessDb.length} Active Businesses
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
          {/* Active Context Tab Badge - Keeps only Buy Business */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              borderBottom: '1px solid #F1F5F9',
              paddingBottom: '16px',
              marginBottom: '20px',
            }}
          >
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 22px',
                borderRadius: '9999px',
                border: 'none',
                backgroundColor: '#DCFCE7',
                color: '#16A34A',
                fontWeight: 800,
                fontSize: '14px',
                cursor: 'default',
              }}
            >
              <FaBriefcase style={{ fontSize: '15px' }} />
              <span>Buy Business</span>
            </button>
          </div>
          <div className="top-search-filter-bar-5">


            {/* Category Dropdown */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: '6px' }}>
                Category
              </label>
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '12px', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <select
                  value={industry}
                  onChange={(e) => {
                    const val = e.target.value;
                    setIndustry(val);
                    if (val === 'All Categories') {
                      setSelectedInds([]);
                    } else {
                      setSelectedInds([val]);
                    }
                  }}
                  style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', fontWeight: 600, color: '#0F172A', cursor: 'pointer', width: '100%' }}
                >
                  <option value="All Categories">All Categories</option>
                  {activeCategories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Valuation Budget Dropdown */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: '6px' }}>
                Price / Valuation
              </label>
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '12px', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <select
                  value={valuation}
                  onChange={(e) => setValuation(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', fontWeight: 600, color: '#0F172A', cursor: 'pointer', width: '100%' }}
                >
                  <option value="Any Budget">Any Budget</option>
                  <option value="Under ₹ 20 Lac">Under ₹ 20 Lac</option>
                  <option value="₹ 20 Lac - ₹ 50 Lac">₹ 20 Lac - ₹ 50 Lac</option>
                  <option value="₹ 50 Lac - ₹ 2 Cr">₹ 50 Lac - ₹ 2 Cr</option>
                  <option value="₹ 2 Cr - ₹ 5 Cr">₹ 2 Cr - ₹ 5 Cr</option>
                  <option value="₹ 5 Cr+">₹ 5 Cr+</option>
                </select>
              </div>
            </div>

            {/* City Dropdown */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: '6px' }}>
                City
              </label>
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '12px', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <select
                  value={selectedCityId}
                  onChange={(e) => handleCityChange(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', fontWeight: 600, color: '#0F172A', cursor: 'pointer', width: '100%' }}
                >
                  <option value="">All Cities</option>
                  {availableCities.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search Button */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '22px' }}>
              <button
                onClick={() => {
                  const el = document.getElementById('biz-results-header');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
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
                <span>Search Businesses</span>
              </button>
            </div>
          </div>
        </div>

        {/* MAIN GRID AREA */}
        <div className="layout-sidebar-main">
          
          {/* LEFT SIDEBAR: "Explore Businesses by Type" Filter Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #E2E8F0',
              padding: '22px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
              alignSelf: 'start',
              position: 'sticky',
              top: '100px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
                borderBottom: '1px solid #F1F5F9',
                paddingBottom: '14px',
              }}
            >
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Explore Businesses by Type
              </h2>
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

            {/* Budget Range Section */}
            <div style={{ paddingBottom: '16px', borderBottom: '1px solid #F1F5F9' }}>
              <div 
                onClick={() => setIsBudgetOpen(!isBudgetOpen)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isBudgetOpen ? '10px' : '0', cursor: 'pointer', userSelect: 'none' }}
              >
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>Budget Range</span>
                {isBudgetOpen ? <FaChevronUp style={{ fontSize: '12px', color: '#64748B' }} /> : <FaChevronDown style={{ fontSize: '12px', color: '#64748B' }} />}
              </div>

              {isBudgetOpen && (
                <div>
                  {/* Direct Min & Max Price Inputs */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '4px' }}>Min Price</span>
                      <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '10px', padding: '6px 10px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#16A34A', marginRight: '4px' }}>₹</span>
                        <input
                          type="text"
                          value={minInputText}
                          onChange={(e) => parseAndSetMin(e.target.value)}
                          onBlur={() => setMinInputText(formatPriceVal(minBudget))}
                          placeholder="Min ₹"
                          style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '12.5px', fontWeight: 800, color: '#0F172A' }}
                        />
                      </div>
                    </div>
                    <span style={{ color: '#94A3B8', fontWeight: 700, marginTop: '16px' }}>—</span>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '4px' }}>Max Price</span>
                      <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '10px', padding: '6px 10px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#16A34A', marginRight: '4px' }}>₹</span>
                        <input
                          type="text"
                          value={maxInputText}
                          onChange={(e) => parseAndSetMax(e.target.value)}
                          onBlur={() => setMaxInputText(formatPriceVal(maxBudget))}
                          placeholder="Max ₹"
                          style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '12.5px', fontWeight: 800, color: '#0F172A' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#64748B', marginBottom: '6px' }}>
                    <span>₹ 1K</span>
                    <span>₹ 10 Cr+</span>
                  </div>

                  {/* Range Bar Graphic with Dragging & Track Clicking */}
                  <div
                    id="biz-budget-slider-track"
                    onClick={handleTrackClick}
                    style={{ position: 'relative', height: '8px', backgroundColor: '#E2E8F0', borderRadius: '4px', margin: '14px 6px', cursor: 'pointer' }}
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
                        borderRadius: '4px',
                      }}
                    />
                    {/* Min thumb */}
                    <div
                      onMouseDown={(e) => { e.stopPropagation(); setDragging('min'); }}
                      onTouchStart={(e) => { e.stopPropagation(); setDragging('min'); }}
                      style={{
                        position: 'absolute',
                        left: `calc(${((minBudget - sliderMin) / (sliderMax - sliderMin)) * 100}% - 10px)`,
                        top: '-6px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: '#FFFFFF',
                        border: '3.5px solid #16A34A',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                        cursor: 'grab',
                        zIndex: 2,
                        transform: dragging === 'min' ? 'scale(1.25)' : 'scale(1)',
                        transition: dragging === 'min' ? 'none' : 'transform 0.1s',
                      }}
                    />
                    {/* Max thumb */}
                    <div
                      onMouseDown={(e) => { e.stopPropagation(); setDragging('max'); }}
                      onTouchStart={(e) => { e.stopPropagation(); setDragging('max'); }}
                      style={{
                        position: 'absolute',
                        left: `calc(${((maxBudget - sliderMin) / (sliderMax - sliderMin)) * 100}% - 10px)`,
                        top: '-6px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: '#FFFFFF',
                        border: '3.5px solid #16A34A',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                        cursor: 'grab',
                        zIndex: 2,
                        transform: dragging === 'max' ? 'scale(1.25)' : 'scale(1)',
                        transition: dragging === 'max' ? 'none' : 'transform 0.1s',
                      }}
                    />
                  </div>

                  <div style={{ fontSize: '12px', color: '#16A34A', fontWeight: 800, marginTop: '12px', textAlign: 'center', backgroundColor: '#F0FDF4', padding: '6px 12px', borderRadius: '8px', border: '1px solid #DCFCE7' }}>
                    Selected: {formatPriceVal(minBudget)} – {maxBudget >= sliderMax ? '₹ 10 Cr+' : formatPriceVal(maxBudget)}
                  </div>
                </div>
              )}
            </div>

            {/* Hierarchical Location Filter: City → Area */}
            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px', marginTop: '16px' }}>
              <div 
                onClick={() => setIsLocationOpen(!isLocationOpen)}
                style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginBottom: isLocationOpen ? '12px' : '0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}
              >
                <span>■ Location</span>
                {isLocationOpen ? <FaChevronUp style={{ fontSize: '12px', color: '#64748B' }} /> : <FaChevronDown style={{ fontSize: '12px', color: '#64748B' }} />}
              </div>

              {isLocationOpen && (
                <div>
                  {/* City Select */}
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>City</label>
                    <select
                      value={selectedCityId}
                      onChange={(e) => handleCityChange(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', fontWeight: 700, color: selectedCityId ? '#0F172A' : '#64748B', backgroundColor: '#FFFFFF', cursor: 'pointer', outline: 'none' }}
                    >
                      <option value="">All Cities</option>
                      {availableCities.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Area Select */}
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Area</label>
                    <select
                      disabled={!selectedCityId}
                      value={selectedAreaId}
                      onChange={(e) => handleAreaChange(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: selectedAreaId ? '#0F172A' : '#64748B',
                        backgroundColor: selectedCityId ? '#FFFFFF' : '#F8FAFC',
                        cursor: selectedCityId ? 'pointer' : 'not-allowed',
                        outline: 'none',
                        opacity: selectedCityId ? 1 : 0.6,
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="">{selectedCityId ? `All Areas (${availableCities.find(c => c.id === selectedCityId)?.name || 'All'})` : 'Select city first'}</option>
                      {availableAreas.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Business Industry / Sector Checkboxes */}
            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px', marginTop: '16px' }}>
              <div 
                onClick={() => setIsIndustryOpen(!isIndustryOpen)}
                style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginBottom: isIndustryOpen ? '12px' : '0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}
              >
                <span>■ Industry / Sector</span>
                {isIndustryOpen ? <FaChevronUp style={{ fontSize: '12px', color: '#64748B' }} /> : <FaChevronDown style={{ fontSize: '12px', color: '#64748B' }} />}
              </div>

              {isIndustryOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
                  {masterCategoriesDb.filter(c => c.is_active !== false).map((catItem) => {
                    const isSelected = selectedInds.includes(catItem.name);
                    return (
                      <label key={catItem.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', color: isSelected ? '#16A34A' : '#334155', fontWeight: isSelected ? 700 : 500 }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleInd(catItem.name)}
                          style={{ accentColor: '#16A34A', width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <span>{catItem.name}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Business Structure & Deal Type */}
            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px', marginTop: '16px' }}>
              <div 
                onClick={() => setIsStructureOpen(!isStructureOpen)}
                style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginBottom: isStructureOpen ? '12px' : '0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}
              >
                <span>■ Business Structure & Deal</span>
                {isStructureOpen ? <FaChevronUp style={{ fontSize: '12px', color: '#64748B' }} /> : <FaChevronDown style={{ fontSize: '12px', color: '#64748B' }} />}
              </div>

              {isStructureOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {masterBusinessTypesDb.filter(bt => bt.is_active !== false).map((btItem) => {
                    const isSelected = selectedProfs.includes(btItem.name);
                    return (
                      <label key={btItem.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', color: isSelected ? '#16A34A' : '#334155', fontWeight: isSelected ? 700 : 500 }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleProf(btItem.name)}
                          style={{ accentColor: '#16A34A', width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <span>{btItem.name}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quality & Verification Flags */}
            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px', marginTop: '16px' }}>
              <div 
                onClick={() => setIsVerifiedOpen(!isVerifiedOpen)}
                style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginBottom: isVerifiedOpen ? '12px' : '0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}
              >
                <span>■ Verified & Quality</span>
                {isVerifiedOpen ? <FaChevronUp style={{ fontSize: '12px', color: '#64748B' }} /> : <FaChevronDown style={{ fontSize: '12px', color: '#64748B' }} />}
              </div>

              {isVerifiedOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { id: 'Verified Sellers', label: 'Verified Sellers Only' },
                    { id: 'Profitable Now', label: 'Profitable Now (Cash Flow Positive)' },
                    { id: 'Featured', label: 'Featured Listings' }
                  ].map((qf) => {
                    const isSelected = activeQuickFilter === qf.id;
                    return (
                      <label key={qf.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', color: isSelected ? '#16A34A' : '#334155', fontWeight: isSelected ? 700 : 500 }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => setActiveQuickFilter(prev => prev === qf.id ? null : qf.id)}
                          style={{ accentColor: '#16A34A', width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <span>{qf.label}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT RESULTS AREA */}
          <div>
            
            {/* Top Bar: View toggles + Count + Sort */}
            <div id="biz-results-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px' }}>
                {[
                  { id: 'list' as const, label: 'List View', icon: FaList },
                  { id: 'map' as const, label: 'Map View', icon: FaMap },
                  { id: 'split' as const, label: 'Split View', icon: FaColumns },
                ].map((vm) => {
                  const Icon = vm.icon;
                  const isActive = viewMode === vm.id;
                  return (
                    <button key={vm.id} onClick={() => setViewMode(vm.id)} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: isActive ? '#16A34A' : '#64748B', fontWeight: isActive ? 800 : 600, fontSize: '14px', cursor: 'pointer', paddingBottom: '8px', position: 'relative' }}>
                      <Icon />
                      <span>{vm.label}</span>
                      {isActive && <span style={{ position: 'absolute', bottom: '-9px', left: 0, right: 0, height: '2.5px', backgroundColor: '#16A34A', borderRadius: '2px' }} />}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                  Showing <strong style={{ color: '#0F172A' }}>{businessesList.length} active businesses</strong>
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', padding: '6px 12px' }}>
                  <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Sort by:</span>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '12px', fontWeight: 800, color: '#0F172A', cursor: 'pointer' }}>
                    <option value="Relevance">Relevance</option>
                    <option value="Valuation: Low to High">Valuation: Low to High</option>
                    <option value="Revenue: High to Low">Revenue: High to Low</option>
                    <option value="Profit Margin">Profit Margin</option>
                  </select>
                </div>
              </div>
            </div>



            {/* INTERACTIVE MAP VIEW BOX */}
            {(viewMode === 'list' || viewMode === 'map' || viewMode === 'split') && (
              <div style={{ marginBottom: '24px' }}>
                <LiveLocationMap
                  items={businessesList}
                  type="business"
                  onSelectItem={(id) => {
                    if (onPropertyClick) onPropertyClick(id);
                    else if (onBuyProperty) onBuyProperty(id);
                  }}
                  height={viewMode === 'map' ? '550px' : '360px'}
                  localSearchLocation={selectedLocality ? `${selectedLocality}, ${locationText}` : locationText}
                />
              </div>
            )}

            {/* QUICK FILTERS ROW */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginRight: '4px' }}>Quick Filters:</span>
              {[
                { label: 'Verified Sellers', icon: FaCheckCircle, id: 'Verified Sellers' },
                { label: 'Profitable Now', icon: FaChartLine, id: 'Profitable Now' },
                { label: 'Distress Sale / Great Deal', icon: FaCrown, id: 'Distress Sale / Great Deal' },
                { label: 'Prime Location', icon: FaMapMarkerAlt, id: 'Prime Location' },
                { label: 'Top Brokers', icon: FaStar, id: 'Top Brokers' },
              ].map((qf) => {
                const Icon = qf.icon;
                const isActive = activeQuickFilter === qf.id;
                return (
                  <button key={qf.id} onClick={() => setActiveQuickFilter(isActive ? null : qf.id)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '9999px', border: isActive ? '1px solid #16A34A' : '1px solid #CBD5E1', backgroundColor: isActive ? '#DCFCE7' : '#FFFFFF', color: isActive ? '#16A34A' : '#334155', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                    <Icon style={{ color: '#16A34A', fontSize: '13px' }} />
                    <span>{qf.label}</span>
                  </button>
                );
              })}
            </div>

            {/* BUSINESS CARDS GRID */}
            <div className={`responsive-property-grid ${viewMode === 'map' ? 'map-view-grid' : ''}`} style={{ marginBottom: '36px' }}>
              {businessesList.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', backgroundColor: '#FFFFFF', padding: '60px 20px', borderRadius: '24px', border: '1px solid #E2E8F0', textAlign: 'center', color: '#64748B' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>💼</div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>No Businesses Found</h3>
                  <p style={{ fontSize: '0.95rem', maxWidth: '400px', margin: '0 auto' }}>There are currently no active business listings matching your filter criteria.</p>
                </div>
              ) : (
                paginatedBusinesses.map((item) => {
                const isFav = isWishlisted(item.id);
                let badgeBg = '#DCFCE7';
                let badgeColor = '#16A34A';
                let BadgeIcon = FaCheckCircle;

                if (item.featured) {
                  badgeBg = '#FEF3C7';
                  badgeColor = '#D97706';
                  BadgeIcon = FaCrown;
                }

                return (
                  <div key={item.id} onClick={() => onPropertyClick?.(item.id)} style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column' }}>
                    {/* Image Banner */}
                    <div style={{ position: 'relative', height: '180px', backgroundColor: '#0F172A' }}>
                      <img src={item.image} alt={item.title} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {item.badge && (
                        <div style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: badgeBg, color: badgeColor, padding: '4px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <BadgeIcon />
                          <span>{item.badge}</span>
                        </div>
                      )}
                      <button onClick={(e) => toggleWishlist(item.id, e)} style={{ position: 'absolute', top: '12px', right: '12px', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(0, 0, 0, 0.4)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        {isFav ? <FaHeart style={{ color: '#EF4444', fontSize: '15px' }} /> : <FaRegHeart style={{ color: '#FFFFFF', fontSize: '15px' }} />}
                      </button>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>{item.title}</h4>
                        <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500, marginBottom: '12px' }}>
                          {item.industry}{item.location ? ` • ${item.location}` : ''}
                        </div>

                        {/* Specs Row - Only shown when user has filled revenue or profit */}
                        {(item.revenue || item.margin) && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', fontWeight: 600, color: '#475569', backgroundColor: '#F8FAFC', padding: '10px', borderRadius: '10px', marginBottom: '14px' }}>
                            {item.revenue && (
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span><FaChartLine style={{ color: '#3B82F6', marginRight: '4px' }} /> Monthly Revenue:</span>
                                <strong style={{ color: '#0F172A' }}>{item.revenue}</strong>
                              </div>
                            )}
                            {item.margin && (
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span><FaUsers style={{ color: '#16A34A', marginRight: '4px' }} /> Monthly Profit:</span>
                                <strong style={{ color: '#16A34A' }}>{item.margin}</strong>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Valuation & Employees */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0px' }}>
                          <div>
                            <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Asking Price</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>{item.valuation}</div>
                          </div>
                          {item.employees && (
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB', backgroundColor: '#DBEAFE', padding: '4px 8px', borderRadius: '6px' }}>{item.employees}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }))}
            </div>

            {/* BOTTOM PAGINATION BAR */}
            {businessesList.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #CBD5E1', paddingTop: '20px', flexWrap: 'wrap', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={validPage <= 1}
                    style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: validPage <= 1 ? '#F1F5F9' : '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: validPage <= 1 ? 'not-allowed' : 'pointer', color: validPage <= 1 ? '#94A3B8' : '#334155', fontWeight: 700 }}
                  >&lt;</button>
                  {Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1).map((pNum) => {
                    const isCur = validPage === pNum;
                    return (
                      <button
                        key={pNum}
                        onClick={() => setCurrentPage(pNum)}
                        style={{ width: '36px', height: '36px', borderRadius: '8px', border: isCur ? '1px solid #16A34A' : '1px solid #CBD5E1', backgroundColor: isCur ? '#16A34A' : '#FFFFFF', color: isCur ? '#FFFFFF' : '#334155', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                      >{pNum}</button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(Math.max(1, totalPages), p + 1))}
                    disabled={validPage >= totalPages}
                    style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: validPage >= totalPages ? '#F1F5F9' : '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: validPage >= totalPages ? 'not-allowed' : 'pointer', color: validPage >= totalPages ? '#94A3B8' : '#334155', fontWeight: 700 }}
                  >&gt;</button>
                </div>

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

export default BusinessMarketplace;
