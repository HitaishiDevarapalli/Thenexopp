import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { propertiesDb, selectedCity, dealersDb, demandRegionsDb, getDistance, masterLocationsDb, masterPropertyTypesDb, masterPropertyStatusesDb, masterPropertyOwnershipsDb, masterLocalitiesDb, masterAreasDb } from '../db/marketplaceDb';
import { useWishlist } from '../context/WishlistContext';
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
  FaEye,
  FaLayerGroup,
  FaShieldAlt,
  FaBriefcase,
  FaUserTie,
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
  const [rentCategoryFilter, setRentCategoryFilter] = useState<'All' | 'Residential' | 'Commercial'>('All');

  // Dynamic Cities (Master locations + any unique cities present in propertiesDb)
  const availableCities = useMemo(() => {
    const masterCities = masterLocationsDb.filter(c => c.is_active);
    const propCities = new Set<string>();
    propertiesDb.forEach(p => {
      if (p.city && p.city.trim()) propCities.add(p.city.trim());
    });
    const list = [...masterCities];
    propCities.forEach(cName => {
      if (!list.some(c => c.name.toLowerCase() === cName.toLowerCase())) {
        list.push({ id: `city_${cName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`, name: cName, is_active: true, type: 'location' });
      }
    });
    return list;
  }, [masterLocationsDb, propertiesDb]);

  useEffect(() => {
    const currentGlobalCity = location?.city || location?.displayName || selectedCity || '';
    if (currentGlobalCity) {
      setLocationText(currentGlobalCity);
      // Auto-select city if it matches available cities
      const matchedCity = availableCities.find(c => c.is_active && (currentGlobalCity.toLowerCase().includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(currentGlobalCity.toLowerCase())));
      if (matchedCity && !selectedCityId) {
        setSelectedCityId(matchedCity.id);
      }
    }
  }, [location?.city, location?.displayName, selectedCity, availableCities]);

  const [, setTick] = useState(0);
  useEffect(() => {
    const handler = () => setTick(t => t + 1);
    window.addEventListener('nexopp_data_changed', handler);
    return () => window.removeEventListener('nexopp_data_changed', handler);
  }, []);

  // Left Sidebar Filters State
  const [budgetOpen, setBudgetOpen] = useState(true);
  const [bhkOpen, setBhkOpen] = useState(true);
  const [typeOpen, setTypeOpen] = useState(true);
  const [moreOpen, setMoreOpen] = useState(false);
  const [isFurnishingOpen, setIsFurnishingOpen] = useState(true);

  const [selectedBhks, setSelectedBhks] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedMoreFilters, setSelectedMoreFilters] = useState<string[]>([]);
  const [selectedFurnishingsFilter, setSelectedFurnishingsFilter] = useState<string[]>([]);
  const [availabilityFilter, setAvailabilityFilter] = useState<'All' | 'Available' | 'Sold'>('All');

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
      } else if (_initialCategory === 'Rent') {
        setActiveTab('Rent');
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

  const isRent = activeTab === 'Rent' || _initialCategory === 'Rent';
  const sliderMin = 0.01;
  const sliderMax = isRent ? 10 : 100;

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
    if (val.startsWith('Any ') || val === 'All') {
      setSelectedBhks([]);
    } else {
      setSelectedBhks([val]);
    }
  };

  const handleTypeSelectChange = (val: string) => {
    setPropertyType(val);
    if (val === 'All Types' || val === 'All Plots' || val === 'All Commercial' || val === 'All Projects') {
      setSelectedTypes([]);
      setBhkFilter('Any Configuration');
      setSelectedBhks([]);
    } else {
      setSelectedTypes([val]);
      const lower = val.toLowerCase();
      if (lower.includes('plot') || lower.includes('land')) {
        setBhkFilter('Any Size');
        setSelectedBhks([]);
      } else if (lower.includes('commercial') || lower.includes('office') || lower.includes('shop') || lower.includes('showroom') || lower.includes('warehouse')) {
        setBhkFilter('Any Usage');
        setSelectedBhks([]);
      } else if (lower.includes('villa') || lower.includes('house')) {
        setBhkFilter('Any Configuration');
        setSelectedBhks([]);
      } else {
        setBhkFilter('Any BHK');
        setSelectedBhks([]);
      }
    }
  };

  // Dynamic Tab & Property Type Configurations for Context-Aware Filters
  const tabConfigs = useMemo(() => {
    const isPlot = activeTab === 'Plots' || propertyType === 'Plot / Land' || propertyType.toLowerCase().includes('plot') || propertyType.toLowerCase().includes('land');
    if (isPlot) {
      return {
        typeLabel: 'Plot / Land Type',
        types: activeTab === 'Plots' 
          ? ['All Plots', 'Residential Plot', 'Commercial Plot', 'Agricultural Land / Farm Land', 'Industrial Plot']
          : ['Plot / Land', 'All Types', 'Apartment', 'Villa', 'Independent House', 'Commercial Property'],
        specLabel: 'Plot Area / Land Size',
        specs: ['Any Size', 'Up to 150 Sq.Yd', '150 - 300 Sq.Yd', '300 - 500 Sq.Yd', '500+ Sq.Yd', '1 - 5 Acres', '5+ Acres', 'RERA / DTCP Approved', 'Corner Plot'],
      };
    }

    const isCommercial = activeTab === 'Commercial' || propertyType === 'Commercial Property' || propertyType.toLowerCase().includes('commercial') || propertyType.toLowerCase().includes('office') || propertyType.toLowerCase().includes('shop');
    if (isCommercial) {
      return {
        typeLabel: 'Commercial Type',
        types: activeTab === 'Commercial'
          ? ['All Commercial', 'Office Space', 'Retail Shop', 'Commercial Showroom', 'Warehouse / Godown', 'Industrial Building', 'Commercial Land']
          : ['Commercial Property', 'All Types', 'Apartment', 'Villa', 'Independent House', 'Plot / Land'],
        specLabel: 'Commercial Usage / Type',
        specs: ['Any Usage', 'Corporate Office Space', 'Retail Shop / Showroom', 'Commercial Building', 'Warehouse / Godown', 'Commercial Plot', 'Industrial Facility'],
      };
    }

    if (activeTab === 'New Projects') {
      return {
        typeLabel: 'Project Type',
        types: ['All Projects', 'Residential Apartment Project', 'Luxury Villa Project', 'Commercial Complex', 'Plotting Township'],
        specLabel: 'Project Stage',
        specs: ['Any Stage', 'New Launch', 'Under Construction', 'Ready to Move', 'Upcoming Launch'],
      };
    }

    if (propertyType === 'Villa' || propertyType === 'Independent House') {
      return {
        typeLabel: 'Property Type',
        types: ['All Types', 'Apartment', 'Villa', 'Independent House', 'Plot / Land', 'Commercial Property'],
        specLabel: 'Villa / House Configuration',
        specs: ['Any Configuration', '2 BHK House', '3 BHK Villa / Duplex', '4 BHK Luxury Villa', '5+ BHK Mansion / Duplex'],
      };
    }

    if (propertyType === 'Apartment' || propertyType === 'Flats') {
      return {
        typeLabel: 'Property Type',
        types: ['All Types', 'Apartment', 'Villa', 'Independent House', 'Plot / Land', 'Commercial Property'],
        specLabel: 'Apartment BHK',
        specs: ['Any BHK', '1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK / Penthouse'],
      };
    }

    if (activeTab === 'Rent') {
      return {
        typeLabel: 'Property Type',
        types: ['All Types', 'Apartment', 'Villa', 'Independent House', 'PG / Co-Living', 'Furnished Flat', 'Commercial Space'],
        specLabel: 'BHK / Category',
        specs: ['Any BHK', '1 BHK', '2 BHK', '3 BHK', '4+ BHK', 'Commercial Space'],
      };
    }

    return {
      typeLabel: 'Property Type',
      types: ['All Types', 'Apartment', 'Villa', 'Independent House', 'Plot / Land', 'Commercial Property'],
      specLabel: 'BHK / Configuration',
      specs: ['Any BHK', '1 BHK', '2 BHK', '3 BHK', '4+ BHK'],
    };
  }, [activeTab, propertyType]);

  // Synchronize budget bounds and context dropdowns when activeTab changes
  useEffect(() => {
    const isRentTab = activeTab === 'Rent';
    setMinBudget(0.01);
    setMaxBudget(isRentTab ? 10 : 100);
    setBudget(isRentTab ? '₹ 1K - 10L+' : '₹ 1K - 1Cr+');

    if (activeTab === 'Commercial') {
      setPropertyType('All Commercial');
      setBhkFilter('Any Usage');
      setSelectedTypes([]);
      setSelectedBhks([]);
    } else if (activeTab === 'Plots') {
      setPropertyType('All Plots');
      setBhkFilter('Any Size');
      setSelectedTypes([]);
      setSelectedBhks([]);
    } else if (activeTab === 'New Projects') {
      setPropertyType('All Projects');
      setBhkFilter('Any Stage');
      setSelectedTypes([]);
      setSelectedBhks([]);
    } else {
      setPropertyType('All Types');
      setBhkFilter('Any BHK');
      setSelectedTypes([]);
      setSelectedBhks([]);
    }
  }, [activeTab]);

  // Draggable & touch logic for double budget range slider
  useEffect(() => {
    if (!dragging) return;

    const handlePointerMove = (clientX: number) => {
      const slider = document.getElementById('budget-slider-track');
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
      if (e.touches && e.touches[0]) {
        handlePointerMove(e.touches[0].clientX);
      }
    };
    const handleEnd = () => setDragging(null);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [dragging, minBudget, maxBudget, sliderMin, sliderMax]);

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const slider = document.getElementById('budget-slider-track');
    if (!slider) return;
    const rect = slider.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const rawVal = sliderMin + pct * (sliderMax - sliderMin);
    const val = parseFloat(rawVal.toFixed(2));
    
    const distMin = Math.abs(val - minBudget);
    const distMax = Math.abs(val - maxBudget);
    
    if (distMin < distMax) {
      setMinBudget(Math.min(val, maxBudget - 0.01));
    } else {
      setMaxBudget(Math.max(val, minBudget + 0.01));
    }
  };

  // Right Results State
  const [viewMode, setViewMode] = useState<'list' | 'map' | 'split'>('list');
  const [sortBy, setSortBy] = useState('Newest First');
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null);
  const [wishlisted, setWishlisted] = useState<Record<string, boolean>>({});
  const [demandFilter, setDemandFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // 6 Specified Property Filter States (Location, Property Type, Price, Status, Ownership, Sort By)
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [selectedAreaId, setSelectedAreaId] = useState<string>('');
  const [selectedLocalityId, setSelectedLocalityId] = useState<string>('');
  const [areaSearchText, setAreaSearchText] = useState<string>('');
  const [localitySearchText, setLocalitySearchText] = useState<string>('');
  const [areaDropdownOpen, setAreaDropdownOpen] = useState<boolean>(false);
  const [localityDropdownOpen, setLocalityDropdownOpen] = useState<boolean>(false);



  const [selectedPropertyTypesFilter, setSelectedPropertyTypesFilter] = useState<string[]>([]);
  const [selectedPropertyStatusesFilter, setSelectedPropertyStatusesFilter] = useState<string[]>([]);
  const [selectedPropertyOwnershipsFilter, setSelectedPropertyOwnershipsFilter] = useState<string[]>([]);

  // Accordion Expand/Collapse States for Sidebar Filter Sections
  const [isLocationOpen, setIsLocationOpen] = useState<boolean>(true);
  const [isPropertyTypeOpen, setIsPropertyTypeOpen] = useState<boolean>(true);
  const [isPropertyStatusOpen, setIsPropertyStatusOpen] = useState<boolean>(true);
  const [isPropertyOwnershipOpen, setIsPropertyOwnershipOpen] = useState<boolean>(true);

  const handleCityChange = (cityId: string) => {
    setSelectedCityId(cityId);
    setSelectedAreaId('');
    setSelectedLocalityId('');
    setAreaSearchText('');
    setLocalitySearchText('');
  };

  const handleAreaChange = (areaId: string) => {
    setSelectedAreaId(areaId);
    setSelectedLocalityId('');
    setLocalitySearchText('');
  };

  // Dynamic Areas for Selected City (ONLY areas that actually have active properties in this city)
  const availableAreas = useMemo(() => {
    if (!selectedCityId) return [];
    const selectedCityObj = availableCities.find(c => c.id === selectedCityId);
    const cityName = selectedCityObj ? selectedCityObj.name.toLowerCase().trim() : '';

    const activeListings = propertiesDb.filter(
      (p) => !p.sold && p.approvalStatus !== 'Sold' && p.listingStatus !== 'Sold' && p.status !== 'Sold' && (p.approvalStatus || 'Published') === 'Published'
    );

    const areaSet = new Set<string>();

    activeListings.forEach(p => {
      const pCity = (p.city || '').toLowerCase().trim();
      if ((cityName && (pCity.includes(cityName) || cityName.includes(pCity))) || !cityName) {
        if (p.area && p.area.trim()) {
          areaSet.add(p.area.trim());
        }
      }
    });

    return Array.from(areaSet).sort((a, b) => a.localeCompare(b)).map(name => ({
      id: `area_${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
      name,
      cityId: selectedCityId,
      is_active: true
    }));
  }, [selectedCityId, availableCities, propertiesDb]);

  // Dynamic Localities for Selected Area (ONLY localities that actually have properties in this area)
  const availableLocalities = useMemo(() => {
    if (!selectedAreaId) return [];
    const selectedAreaObj = availableAreas.find(a => a.id === selectedAreaId);
    const areaName = selectedAreaObj ? selectedAreaObj.name.toLowerCase().trim() : '';

    const activeListings = propertiesDb.filter(
      (p) => !p.sold && p.approvalStatus !== 'Sold' && p.listingStatus !== 'Sold' && p.status !== 'Sold' && (p.approvalStatus || 'Published') === 'Published'
    );

    const locSet = new Set<string>();

    activeListings.forEach(p => {
      const pArea = (p.area || '').toLowerCase().trim();
      if ((areaName && (pArea.includes(areaName) || areaName.includes(pArea))) || !areaName) {
        if (p.locality && p.locality.trim()) {
          locSet.add(p.locality.trim());
        }
      }
    });

    return Array.from(locSet).sort((a, b) => a.localeCompare(b)).map(name => ({
      id: `loc_${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
      name,
      areaId: selectedAreaId,
      is_active: true
    }));
  }, [selectedAreaId, availableAreas, propertiesDb]);

  const { toggleWishlist: globalToggleWishlist, isWishlisted } = useWishlist();

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    globalToggleWishlist(id);
  };



  const togglePropertyTypeFilter = (val: string) => {
    setSelectedPropertyTypesFilter((prev) =>
      prev.includes(val) ? prev.filter((item) => item !== val) : [...prev, val]
    );
  };

  const togglePropertyStatusFilter = (val: string) => {
    setSelectedPropertyStatusesFilter((prev) =>
      prev.includes(val) ? prev.filter((item) => item !== val) : [...prev, val]
    );
  };

  const togglePropertyOwnershipFilter = (val: string) => {
    setSelectedPropertyOwnershipsFilter((prev) =>
      prev.includes(val) ? prev.filter((item) => item !== val) : [...prev, val]
    );
  };

  const toggleBhk = (val: string) => {
    setSelectedBhks((prev) =>
      prev.includes(val) ? prev.filter((item) => item !== val) : [...prev, val]
    );
  };

  const toggleType = (val: string) => {
    setSelectedTypes((prev) => {
      const next = prev.includes(val) ? prev.filter((item) => item !== val) : [...prev, val];
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

  const toggleFurnishingFilter = (val: string) => {
    setSelectedFurnishingsFilter((prev) =>
      prev.includes(val) ? prev.filter((item) => item !== val) : [...prev, val]
    );
  };

  const clearAllFilters = () => {
    setSelectedPropertyTypesFilter([]);
    setSelectedPropertyStatusesFilter([]);
    setSelectedPropertyOwnershipsFilter([]);
    setSelectedFurnishingsFilter([]);
    setSelectedBhks([]);
    setSelectedTypes([]);
    setSelectedMoreFilters([]);
    setMinBudget(0.01);
    setMaxBudget(isRent ? 10 : 100);
    setActiveQuickFilter(null);
    setPropertyType('All Types');
    setBudget(isRent ? '₹ 1K - 10L+' : '₹ 1K - 1Cr+');
    setBhkFilter('Any BHK');
    setSortBy('Newest First');
    setSelectedCityId('');
    setSelectedAreaId('');
    setSelectedLocalityId('');
    setAreaSearchText('');
    setLocalitySearchText('');
    if (onClearSearch) onClearSearch();
  };

  // Rich screenshot-matching properties list
  const displayProperties = useMemo(() => {
    const activeListings = propertiesDb.filter(
      (p) => !p.sold && p.approvalStatus !== 'Sold' && p.listingStatus !== 'Sold' && p.status !== 'Sold' && (p.approvalStatus || 'Published') === 'Published'
    );
    const baseList = activeListings.map((p) => {
      const assignedBroker = dealersDb.find(d => d.id === p.dealerId || (p.assignedBrokerIds && p.assignedBrokerIds.includes(d.id)));
      const brokerName = assignedBroker?.companyName || assignedBroker?.fullName || p.agentName || 'RealtyPlus Advisors';
      const brokerRating = assignedBroker?.rating ? `${assignedBroker.rating}${assignedBroker.reviewCount ? ` (${assignedBroker.reviewCount})` : ''}` : (p.agentRating ? `${p.agentRating}${p.reviewCount ? ` (${p.reviewCount})` : ''}` : '');
      const brokerImg = assignedBroker?.photo || assignedBroker?.logo || p.agentImage || '';

      // Resolve location IDs from text names if not already set
      let resolvedCityId = p.cityId || '';
      let resolvedAreaId = p.areaId || '';
      let resolvedLocalityId = p.localityId || '';
      if (!resolvedCityId && p.city) {
        const matchedCity = masterLocationsDb.find(c => c.name.toLowerCase() === p.city.toLowerCase());
        if (matchedCity) resolvedCityId = matchedCity.id;
      }
      if (!resolvedAreaId && p.area && resolvedCityId) {
        const matchedArea = masterAreasDb.find(a => a.name.toLowerCase() === p.area.toLowerCase() && a.cityId === resolvedCityId);
        if (matchedArea) resolvedAreaId = matchedArea.id;
      }
      if (!resolvedLocalityId && p.locality && resolvedAreaId) {
        const matchedLoc = masterLocalitiesDb.find(l => l.name.toLowerCase() === p.locality!.toLowerCase() && l.areaId === resolvedAreaId);
        if (matchedLoc) resolvedLocalityId = matchedLoc.id;
      }

      return {
        id: p.id,
        title: p.title || `${p.bedrooms || 3} BHK ${p.category}`,
        location: `${p.area ? p.area + ', ' : ''}${p.city || ''}`,
        badge: p.verified ? 'Verified' : (p.premium ? 'Premium' : 'New'),
        badgeType: p.verified ? 'verified' : (p.premium ? 'premium' : 'new'),
        image: p.image || p.imageUrl || '/assets/luxury_apartment.png',
        area: p.sqft ? `${p.sqft} sq ft` : (p.builtUpArea ? `${p.builtUpArea} sq ft` : '1500 sq ft'),
        bhk: String(p.bedrooms || 3),
        bath: String(p.bathrooms || 3),
        parking: String(p.parking || 1),
        price: p.priceDisplay || (`₹ ${p.price || 1} L`),
        priceDisplay: p.priceDisplay || (`₹ ${p.price || 1} L`),
        dist: '1.2 KM away',
        brokerName,
        brokerRating,
        brokerImg,
        dealerId: assignedBroker?.id || p.dealerId,
        type: p.category || 'Apartment',
        facing: p.facing || 'East',
        furnishing: p.furnishing || (p as any).furnishingStatus || 'Unfurnished',
        latitude: p.latitude,
        longitude: p.longitude,
        city: p.city,
        rawPrice: (p.price && p.price < 10) ? p.price * 100 : (p.price || 0),
        propertyPurpose: p.propertyPurpose || (String(p.status).toLowerCase().includes('rent') ? 'Rent' : 'Sale'),
        status: (
          String(p.status || '').toLowerCase().includes('rent') ||
          String(p.status || '').toLowerCase().includes('lease') ||
          String(p.propertyPurpose || '').toLowerCase().includes('rent') ||
          String(p.propertyPurpose || '').toLowerCase().includes('lease') ||
          String(p.title || '').toLowerCase().includes('for rent') ||
          String(p.title || '').toLowerCase().includes('for lease') ||
          String(p.title || '').toLowerCase().includes('rent/lease') ||
          String(p.priceDisplay || '').toLowerCase().includes('/mo') ||
          String(p.priceDisplay || '').toLowerCase().includes('/month')
        ) ? 'Rent' : (p.status || 'Buy'),
        availabilityCount: p.availabilityCount || 0,
        trending: p.trending || false,
        approvalStatus: p.approvalStatus,
        listingStatus: p.listingStatus,
        sold: p.sold || p.approvalStatus === 'Sold' || p.listingStatus === 'Sold' || false,
        soldDate: p.soldDate,
        recentlySold: p.recentlySold || p.badge === 'RECENTLY SOLD' || false,
        viewsCount: p.viewsCount || 0,
        cityId: resolvedCityId,
        areaId: resolvedAreaId,
        localityId: resolvedLocalityId,
        distanceKm: (p.latitude && p.longitude && location?.lat && location?.lng) ? getDistance(location.lat, location.lng, p.latitude, p.longitude) : 0,
      };
    });

    const hasLocalSearch = locationText && locationText.trim() !== '' && !locationText.toLowerCase().includes('current location') && !locationText.toLowerCase().includes('gps');
    
    let searchLat = location?.lat;
    let searchLng = location?.lng;
    
    if (hasLocalSearch && (!searchLat || !searchLng)) {
      const locStr = locationText.toLowerCase().trim();
      const anchorProp = baseList.find(item => 
        (item.city && item.city.toLowerCase() === locStr) ||
        (item.location && item.location.toLowerCase().includes(locStr))
      );
      if (anchorProp && anchorProp.latitude && anchorProp.longitude) {
        searchLat = anchorProp.latitude;
        searchLng = anchorProp.longitude;
      }
    }

    let filtered = baseList.filter((item) => {
      // Hierarchical Location Filter (City → Area → Locality)
      if (selectedCityId) {
        const selCity = availableCities.find(c => c.id === selectedCityId);
        const selCityName = selCity ? selCity.name.toLowerCase().trim() : '';
        const itemCity = (item.city || '').toLowerCase().trim();
        const itemLoc = (item.location || '').toLowerCase().trim();
        
        const isCityMatch = (item.cityId && item.cityId === selectedCityId) || (selCityName && (itemCity.includes(selCityName) || selCityName.includes(itemCity) || itemLoc.includes(selCityName)));
        
        // If an Area is specifically selected, must match that area
        if (selectedAreaId) {
          const selArea = availableAreas.find(a => a.id === selectedAreaId);
          const selAreaName = selArea ? selArea.name.toLowerCase().trim() : '';
          const itemArea = (item.area || '').toLowerCase().trim();
          const isAreaMatch = (item.areaId && item.areaId === selectedAreaId) || (selAreaName && (itemArea.includes(selAreaName) || itemLoc.includes(selAreaName) || selAreaName.includes(itemArea)));
          if (!isAreaMatch) return false;
        } else if (!isCityMatch) {
          // Calculate distance from the selected city to apply Location Intelligence tiers
          if (selCity && selCity.latitude && selCity.longitude && item.latitude && item.longitude) {
             const dist = getDistance(selCity.latitude, selCity.longitude, item.latitude, item.longitude);
             (item as any).distanceKm = dist;
          } else {
             return false;
          }
        }
      }

      if (selectedLocalityId) {
        const selLoc = availableLocalities.find(l => l.id === selectedLocalityId);
        const selLocName = selLoc ? selLoc.name.toLowerCase().trim() : '';
        const itemLocality = ((item as any).locality || '').toLowerCase().trim();
        const isLocMatch = (item.localityId && item.localityId === selectedLocalityId) || (selLocName && itemLocality.includes(selLocName));
        if (!isLocMatch) return false;
      }

      // Availability Filter: By default, sold properties disappear from main feed and display in Recently Sold section down below
      if (availabilityFilter !== 'Sold' && item.sold) return false;
      if (availabilityFilter === 'Sold' && !item.sold) return false;

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

      let exactLocationMatch = true;
      let distanceKm = 0;
      // 2. Geospatial Location Filtering
      
      const locStr = locationText ? locationText.toLowerCase().trim() : '';

      if (searchLat && searchLng && item.latitude && item.longitude) {
         const dist = getDistance(searchLat, searchLng, item.latitude, item.longitude);
         distanceKm = dist;
         
         const targetLoc = (location?.area || location?.locality || location?.city || location?.displayName || locStr).toLowerCase();
         const itemCity = (item.city || '').toLowerCase();
         const itemArea = (item.area || '').toLowerCase();
         const itemSubLoc = ((item as any).subLocation || (item as any).sub_location || '').toLowerCase();
         const itemLocStr = (item.location || '').toLowerCase();
         
         if (targetLoc) {
             exactLocationMatch = itemCity === targetLoc || itemArea.includes(targetLoc) || itemSubLoc.includes(targetLoc) || itemLocStr.includes(targetLoc) || (item.title || '').toLowerCase().includes(targetLoc);
         } else {
             exactLocationMatch = dist <= 10;
         }
      } else if (hasLocalSearch) {
         // Fallback to string only if no lat/lng found anywhere
         const itemSubLoc = ((item as any).subLocation || (item as any).sub_location || '').toLowerCase();
         const matchLoc =
          (item.city && item.city.toLowerCase().includes(locStr)) ||
          (item.area && item.area.toLowerCase().includes(locStr)) ||
          (itemSubLoc && itemSubLoc.includes(locStr)) ||
          (item.location && item.location.toLowerCase().includes(locStr)) ||
          (item.title && item.title.toLowerCase().includes(locStr)) ||
          (item.type && item.type.toLowerCase().includes(locStr));
         if (!matchLoc) return false;
         
         const itemCity = (item.city || '').toLowerCase();
         const itemArea = (item.area || '').toLowerCase();
         const itemLocStr = (item.location || '').toLowerCase();
         exactLocationMatch = itemCity === locStr || itemArea.includes(locStr) || itemSubLoc.includes(locStr) || itemLocStr.includes(locStr) || (item.title || '').toLowerCase().includes(locStr);
      } else {
         // If no search, exactLocationMatch is true (shows all by default if no filters)
         exactLocationMatch = true; 
      }
      
      (item as any).exactLocationMatch = exactLocationMatch;
      if (distanceKm > 0) {
         (item as any).distanceKm = distanceKm;
      } else if ((item as any).distanceKm) {
         distanceKm = (item as any).distanceKm;
         exactLocationMatch = false; // It's from a city filter fallback, so not exact
         (item as any).exactLocationMatch = false;
      }
      
      let distanceTier = 0;
      if (!exactLocationMatch && distanceKm > 0) {
        if (distanceKm <= 50) distanceTier = 50;
        else if (distanceKm <= 100) distanceTier = 100;
        else if (distanceKm <= 150) distanceTier = 150;
        else if (distanceKm <= 200) distanceTier = 200;
        else if (distanceKm <= 250) distanceTier = 250;
        else distanceTier = 300;
      }
      (item as any).distanceTier = distanceTier;

      // 3. Tab Categorization
      const isItemRent = item.status.toLowerCase() === 'rent' ||
                         String((item as any).propertyPurpose || '').toLowerCase() === 'rent' ||
                         item.title.toLowerCase().includes('for rent') ||
                         (item.price || '').toLowerCase().includes('/mo') ||
                         (item.price || '').toLowerCase().includes('/month');

      if (activeTab === 'Buy') {
        if (isItemRent) return false;
      } else if (activeTab === 'Rent') {
        if (!isItemRent) return false;
        if (rentCategoryFilter !== 'All') {
          const itemType = (item.type || '').toLowerCase();
          const itemTitle = (item.title || '').toLowerCase();
          const isComm = itemType.includes('commercial') || itemType.includes('office') || itemType.includes('shop') || itemType.includes('showroom') || itemType.includes('warehouse') || itemType.includes('industrial') || itemTitle.includes('commercial') || itemTitle.includes('office') || itemTitle.includes('shop');
          if (rentCategoryFilter === 'Commercial' && !isComm) return false;
          if (rentCategoryFilter === 'Residential' && isComm) return false;
        }
      } else if (activeTab === 'Commercial') {
        const itemType = (item.type || '').toLowerCase();
        const itemTitle = (item.title || '').toLowerCase();
        const isComm = itemType.includes('commercial') || itemType.includes('office') || itemType.includes('shop') || itemType.includes('showroom') || itemType.includes('warehouse') || itemType.includes('godown') || itemType.includes('industrial') || itemTitle.includes('commercial') || itemTitle.includes('office') || itemTitle.includes('shop') || itemTitle.includes('showroom');
        if (!isComm) return false;
      } else if (activeTab === 'Plots') {
        const itemType = (item.type || '').toLowerCase();
        const itemTitle = (item.title || '').toLowerCase();
        const isPlot = itemType.includes('plot') || itemType.includes('land') || itemTitle.includes('plot') || itemTitle.includes('land') || itemTitle.includes('farm');
        if (!isPlot) return false;
      } else if (activeTab === 'New Projects') {
        if (!item.trending && item.badgeType !== 'new') return false;
      }

      // 4. BHK / Spec / Plot Area / Commercial Usage Filter
      if (selectedBhks.length > 0 && !selectedBhks.includes('Any BHK') && !selectedBhks.includes('Any Usage') && !selectedBhks.includes('Any Zone') && !selectedBhks.includes('Any Stage') && !selectedBhks.includes('Any Size') && !selectedBhks.includes('Any Configuration')) {
        const matchBhk = selectedBhks.some((val) => {
          if (val === '4+ BHK' && parseInt(item.bhk) >= 4) return true;
          if (val.includes('BHK')) return `${item.bhk} BHK` === val || (item.title || '').toLowerCase().includes(val.toLowerCase());
          const normVal = val.toLowerCase();
          const normTitle = (item.title || '').toLowerCase();
          const normType = (item.type || '').toLowerCase();
          const normArea = (item.area || '').toLowerCase();
          return normTitle.includes(normVal) || normType.includes(normVal) || normArea.includes(normVal);
        });
        if (!matchBhk) return false;
      }

      // 5. Property Type Multi-select (OR within category)
      if (selectedTypes.length > 0 && !selectedTypes.includes('All Types') && !selectedTypes.includes('All Commercial') && !selectedTypes.includes('All Plots') && !selectedTypes.includes('All Projects')) {
        const typeMatch = selectedTypes.some((selectedLabel) => {
          const normLabel = selectedLabel.toLowerCase();
          const normItemType = item.type.toLowerCase();
          const normItemTitle = item.title.toLowerCase();

          if (normLabel.includes('apartment') && (normItemType.includes('apartment') || normItemType.includes('flat') || normItemTitle.includes('apartment'))) return true;
          if (normLabel.includes('villa') && (normItemType.includes('villa') || normItemTitle.includes('villa'))) return true;
          if (normLabel.includes('house') && (normItemType.includes('house') || normItemType.includes('independent') || normItemTitle.includes('house'))) return true;
          if (normLabel.includes('office') && (normItemType.includes('office') || normItemType.includes('commercial') || normItemTitle.includes('office'))) return true;
          if (normLabel.includes('shop') && (normItemType.includes('shop') || normItemType.includes('retail') || normItemType.includes('commercial') || normItemTitle.includes('shop'))) return true;
          if (normLabel.includes('showroom') && (normItemType.includes('showroom') || normItemType.includes('commercial') || normItemTitle.includes('showroom'))) return true;
          if ((normLabel.includes('warehouse') || normLabel.includes('godown')) && (normItemType.includes('warehouse') || normItemType.includes('godown') || normItemTitle.includes('warehouse'))) return true;
          if (normLabel.includes('industrial') && (normItemType.includes('industrial') || normItemTitle.includes('industrial'))) return true;
          if ((normLabel.includes('plot') || normLabel.includes('land')) && (normItemType.includes('plot') || normItemType.includes('land') || normItemTitle.includes('plot') || normItemTitle.includes('land'))) return true;
          if (normLabel.includes('commercial') && (normItemType.includes('commercial') || normItemTitle.includes('office') || normItemTitle.includes('shop') || normItemTitle.includes('showroom'))) return true;

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

      // SPECIFIED FILTER 1: Location — now handled by hierarchical City→Area→Locality filter above

      // SPECIFIED FILTER 2: Property Type (Residential, Commercial, Agricultural, Luxury Properties, New Projects)
      if (selectedPropertyTypesFilter.length > 0) {
        const itemType = (item.type || '').toLowerCase();
        const itemTitle = (item.title || '').toLowerCase();
        const matchPropType = selectedPropertyTypesFilter.some((pt) => {
          const norm = pt.toLowerCase();
          if (norm === 'residential') return itemType.includes('apartment') || itemType.includes('villa') || itemType.includes('house') || itemType.includes('flat') || itemTitle.includes('residential') || itemTitle.includes('apartment') || itemTitle.includes('villa');
          if (norm === 'commercial') return itemType.includes('commercial') || itemType.includes('office') || itemType.includes('shop') || itemType.includes('showroom') || itemTitle.includes('commercial');
          if (norm === 'agricultural') return itemType.includes('agricultural') || itemType.includes('land') || itemType.includes('farm') || itemType.includes('plot') || itemTitle.includes('farm') || itemTitle.includes('land');
          if (norm === 'luxury properties') return itemType.includes('luxury') || itemType.includes('villa') || itemTitle.includes('luxury') || (item as any).badgeType === 'premium';
          if (norm === 'new projects') return itemType.includes('project') || itemTitle.includes('project') || (item as any).badgeType === 'new' || (item as any).trending;
          return itemType.includes(norm);
        });
        if (!matchPropType) return false;
      }

      // SPECIFIED FILTER 4: Property Status (Ready to Move, Under Construction, New Property, Resale Property)
      if (selectedPropertyStatusesFilter.length > 0) {
        const matchStatus = selectedPropertyStatusesFilter.some((ps) => {
          const norm = ps.toLowerCase();
          if (norm === 'ready to move') return (item as any).availabilityCount > 0 || (item as any).badgeType === 'verified';
          if (norm === 'under construction') return (item as any).badgeType === 'new';
          if (norm === 'new property') return (item as any).badgeType === 'new' || (item as any).trending;
          if (norm === 'resale property') return !(item as any).trending;
          return true;
        });
        if (!matchStatus) return false;
      }

      // SPECIFIED FILTER 5: Property Ownership (Individual, Company / Developer, Builder, Agent)
      if (selectedPropertyOwnershipsFilter.length > 0) {
        const matchOwner = selectedPropertyOwnershipsFilter.some((po) => {
          const norm = po.toLowerCase();
          const bName = (item.brokerName || '').toLowerCase();
          if (norm === 'individual') return bName.includes('owner') || bName.includes('individual') || !bName;
          if (norm === 'company / developer' || norm.includes('developer')) return bName.includes('developer') || bName.includes('realty') || bName.includes('pvts');
          if (norm === 'builder') return bName.includes('builder') || bName.includes('constructions');
          if (norm === 'agent') return bName.includes('advisors') || bName.includes('broker') || bName.includes('agent');
          return true;
        });
        if (!matchOwner) return false;
      }

      // SPECIFIED FILTER 6: Furnishing Status (Furnished, Semi-Furnished, Unfurnished)
      if (selectedFurnishingsFilter.length > 0) {
        const itemFurn = ((item as any).furnishing || (item as any).furnishingStatus || '').toLowerCase();
        const matchFurn = selectedFurnishingsFilter.some((f) => {
          const norm = f.toLowerCase();
          if (norm === 'furnished') return itemFurn.includes('furnished') && !itemFurn.includes('semi');
          if (norm === 'semi-furnished') return itemFurn.includes('semi');
          if (norm === 'unfurnished') return itemFurn.includes('unfurnished') || (!itemFurn.includes('furnished') && !itemFurn.includes('semi'));
          return itemFurn.includes(norm);
        });
        if (!matchFurn) return false;
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

      // Hide sold properties from main active grid unless Availability filter is set to "Sold"
      if (item.sold && availabilityFilter !== 'Sold') {
        return false;
      }

      return true;
    });

    // SPECIFIED FILTER 6: Sorting (Newest First, Featured, Price: Low to High, Price: High to Low)
    filtered.sort((a, b) => {
      if ((a as any).exactLocationMatch && !(b as any).exactLocationMatch) return -1;
      if (!(a as any).exactLocationMatch && (b as any).exactLocationMatch) return 1;

      const aTier = (a as any).distanceTier || 0;
      const bTier = (b as any).distanceTier || 0;
      if (aTier !== bTier) {
         return aTier - bTier;
      }

      if (sortBy === 'Price: Low to High') {
        return a.rawPrice - b.rawPrice;
      } else if (sortBy === 'Price: High to Low') {
        return b.rawPrice - a.rawPrice;
      } else if (sortBy === 'Featured') {
        if (a.badgeType === 'premium' && b.badgeType !== 'premium') return -1;
        if (a.badgeType !== 'premium' && b.badgeType === 'premium') return 1;
        return b.viewsCount - a.viewsCount;
      } else if (sortBy === 'Newest First' || sortBy === 'Newest' || !sortBy || sortBy === 'Relevance') {
        return b.id.localeCompare(a.id);
      }
      return 0;
    });

    return filtered;
  }, [propertiesDb, searchQuery, locationText, location, activeTab, selectedBhks, selectedTypes, selectedCityId, selectedAreaId, selectedLocalityId, selectedPropertyTypesFilter, selectedPropertyStatusesFilter, selectedPropertyOwnershipsFilter, selectedMoreFilters, minBudget, maxBudget, activeQuickFilter, availabilityFilter, sortBy]);

  const totalPages = Math.ceil(displayProperties.length / itemsPerPage);
  const validPage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));
  const paginatedProperties = useMemo(() => {
    const start = (validPage - 1) * itemsPerPage;
    return displayProperties.slice(start, start + itemsPerPage);
  }, [displayProperties, validPage, itemsPerPage]);

  const recentlySoldList = useMemo(() => {
    return propertiesDb.filter((p: any) => p.sold || p.approvalStatus === 'Sold' || p.listingStatus === 'Sold' || p.status === 'Sold' || p.recentlySold || p.badge === 'RECENTLY SOLD');
  }, [propertiesDb]);

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
        paddingTop: '120px',
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
                {title || 'Verified Properties for Sale & Rent in India'}
              </h1>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0', fontWeight: 500 }}>
                {subtitle || 'Explore verified residential, commercial, plots and new projects across India.'}
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
          {/* Active Context Tab Badge - Only keeps active tab (Buy / Rent) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              borderBottom: '1px solid #F1F5F9',
              paddingBottom: '16px',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
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
                <FaHome style={{ fontSize: '15px' }} />
                <span>{isRent ? 'Rent Property' : (_initialCategory === 'Sell' ? 'Sell Property' : 'Buy Property')}</span>
              </button>

              {isRent && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>Categories:</span>
                  {[
                    { id: 'All', label: 'All Categories' },
                    { id: 'Residential', label: '1. Residential' },
                    { id: 'Commercial', label: '2. Commercial' },
                  ].map((cat) => {
                    const isSelected = rentCategoryFilter === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setRentCategoryFilter(cat.id as any)}
                        style={{
                          padding: '6px 16px',
                          borderRadius: '9999px',
                          border: isSelected ? '2px solid #16A34A' : '1px solid #CBD5E1',
                          backgroundColor: isSelected ? '#16A34A' : '#FFFFFF',
                          color: isSelected ? '#FFFFFF' : '#475569',
                          fontWeight: isSelected ? 800 : 600,
                          fontSize: '13px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: isSelected ? '0 2px 8px rgba(22, 163, 74, 0.2)' : 'none',
                        }}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <div className="top-search-filter-bar">


            {/* Property Type Dropdown */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: '6px' }}>
                {tabConfigs.typeLabel}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                  <FaBuilding style={{ color: '#64748B', fontSize: '14px', flexShrink: 0 }} />
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
                    {tabConfigs.types.map((typeOpt) => (
                      <option key={typeOpt} value={typeOpt}>{typeOpt}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* BHK / Spec Dropdown */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: '6px' }}>
                {tabConfigs.specLabel}
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
                  {tabConfigs.specs.map((specOpt) => (
                    <option key={specOpt} value={specOpt}>{specOpt}</option>
                  ))}
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
            </div>
          </div>
        </div>

        {/* MAIN 2-COLUMN GRID AREA */}
        <div className="layout-sidebar-main">
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
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Explore Properties by Type
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

            {/* Budget Section */}
            <div style={{ paddingBottom: '8px' }}>
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}
              >
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>Budget Range</span>
              </div>

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
                  <span>{isRent ? '₹ 1K' : '₹ 1K'}</span>
                  <span>{isRent ? '₹ 10 Lac+' : '₹ 1 Cr+'}</span>
                </div>

                {/* Range Bar Graphic with Dragging & Track Clicking */}
                <div
                  id="budget-slider-track"
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
                  Selected: {formatPriceVal(minBudget)} – {maxBudget >= sliderMax ? (isRent ? '₹ 10 Lac+' : '₹ 1 Cr+') : formatPriceVal(maxBudget)}
                </div>
              </div>
            </div>

            {/* 1. Hierarchical Location Filter: City → Area → Locality */}
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
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>City</label>
                    <select
                      value={selectedCityId}
                      onChange={(e) => handleCityChange(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #E2E8F0', fontSize: '13.5px', fontWeight: 600, color: selectedCityId ? '#0F172A' : '#94A3B8', backgroundColor: '#FFFFFF', cursor: 'pointer', outline: 'none', transition: 'border-color 0.2s' }}
                    >
                      <option value="">All Cities</option>
                      {availableCities.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Area Select */}
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Area</label>
                    <select
                      disabled={!selectedCityId}
                      value={selectedAreaId}
                      onChange={(e) => handleAreaChange(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: '1.5px solid #E2E8F0',
                        fontSize: '13.5px',
                        fontWeight: 600,
                        color: selectedAreaId ? '#0F172A' : '#64748B',
                        backgroundColor: selectedCityId ? '#FFFFFF' : '#F8FAFC',
                        cursor: selectedCityId ? 'pointer' : 'not-allowed',
                        outline: 'none',
                        opacity: selectedCityId ? 1 : 0.6,
                        transition: 'border-color 0.2s',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="">{selectedCityId ? `All Areas (${availableCities.find(c => c.id === selectedCityId)?.name || 'All'})` : 'Select city first'}</option>
                      {availableAreas.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Locality Select */}
                  {availableLocalities.length > 0 && (
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Locality</label>
                      <select
                        disabled={!selectedAreaId}
                        value={selectedLocalityId}
                        onChange={(e) => setSelectedLocalityId(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: '1.5px solid #E2E8F0',
                          fontSize: '13.5px',
                          fontWeight: 600,
                          color: selectedLocalityId ? '#0F172A' : '#64748B',
                          backgroundColor: selectedAreaId ? '#FFFFFF' : '#F8FAFC',
                          cursor: selectedAreaId ? 'pointer' : 'not-allowed',
                          outline: 'none',
                          opacity: selectedAreaId ? 1 : 0.6,
                          transition: 'border-color 0.2s',
                          boxSizing: 'border-box'
                        }}
                      >
                        <option value="">All Localities</option>
                        {availableLocalities.map(l => (
                          <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2. Property Type Filter Section */}
            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px', marginTop: '16px' }}>
              <div 
                onClick={() => setIsPropertyTypeOpen(!isPropertyTypeOpen)}
                style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginBottom: isPropertyTypeOpen ? '10px' : '0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}
              >
                <span>■ Property Type</span>
                {isPropertyTypeOpen ? <FaChevronUp style={{ fontSize: '12px', color: '#64748B' }} /> : <FaChevronDown style={{ fontSize: '12px', color: '#64748B' }} />}
              </div>

              {isPropertyTypeOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {masterPropertyTypesDb.filter(pt => pt.is_active).map((pt) => {
                    const isSelected = selectedPropertyTypesFilter.includes(pt.name);
                    return (
                      <label key={pt.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13.5px', color: isSelected ? '#16A34A' : '#334155', fontWeight: isSelected ? 700 : 500 }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => togglePropertyTypeFilter(pt.name)}
                          style={{ accentColor: '#16A34A', width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <span>{pt.name}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 4. Property Status Filter Section (Hidden for Rental Property) */}
            {!isRent && (
              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px', marginTop: '16px' }}>
                <div 
                  onClick={() => setIsPropertyStatusOpen(!isPropertyStatusOpen)}
                  style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginBottom: isPropertyStatusOpen ? '10px' : '0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}
                >
                  <span>■ Property Status</span>
                  {isPropertyStatusOpen ? <FaChevronUp style={{ fontSize: '12px', color: '#64748B' }} /> : <FaChevronDown style={{ fontSize: '12px', color: '#64748B' }} />}
                </div>

                {isPropertyStatusOpen && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {masterPropertyStatusesDb.filter(ps => ps.is_active).map((ps) => {
                      const isSelected = selectedPropertyStatusesFilter.includes(ps.name);
                      return (
                        <label key={ps.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13.5px', color: isSelected ? '#16A34A' : '#334155', fontWeight: isSelected ? 700 : 500 }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => togglePropertyStatusFilter(ps.name)}
                            style={{ accentColor: '#16A34A', width: '16px', height: '16px', cursor: 'pointer' }}
                          />
                          <span>{ps.name}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 5. Property Ownership Filter Section (Hidden for Rental Property) */}
            {!isRent && (
              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px', marginTop: '16px' }}>
                <div 
                  onClick={() => setIsPropertyOwnershipOpen(!isPropertyOwnershipOpen)}
                  style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginBottom: isPropertyOwnershipOpen ? '10px' : '0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}
                >
                  <span>■ Property Ownership</span>
                  {isPropertyOwnershipOpen ? <FaChevronUp style={{ fontSize: '12px', color: '#64748B' }} /> : <FaChevronDown style={{ fontSize: '12px', color: '#64748B' }} />}
                </div>

                {isPropertyOwnershipOpen && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {masterPropertyOwnershipsDb.filter(po => po.is_active).map((po) => {
                      const isSelected = selectedPropertyOwnershipsFilter.includes(po.name);
                      return (
                        <label key={po.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13.5px', color: isSelected ? '#16A34A' : '#334155', fontWeight: isSelected ? 700 : 500 }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => togglePropertyOwnershipFilter(po.name)}
                            style={{ accentColor: '#16A34A', width: '16px', height: '16px', cursor: 'pointer' }}
                          />
                          <span>{po.name}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 6. Furnishing Status Filter Section */}
            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px', marginTop: '16px' }}>
              <div 
                onClick={() => setIsFurnishingOpen(!isFurnishingOpen)}
                style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginBottom: isFurnishingOpen ? '10px' : '0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}
              >
                <span>■ Furnishing Status</span>
                {isFurnishingOpen ? <FaChevronUp style={{ fontSize: '12px', color: '#64748B' }} /> : <FaChevronDown style={{ fontSize: '12px', color: '#64748B' }} />}
              </div>

              {isFurnishingOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {['Furnished', 'Semi-Furnished', 'Unfurnished'].map((f) => {
                    const isSelected = selectedFurnishingsFilter.includes(f);
                    return (
                      <label key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13.5px', color: isSelected ? '#16A34A' : '#334155', fontWeight: isSelected ? 700 : 500 }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleFurnishingFilter(f)}
                          style={{ accentColor: '#16A34A', width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <span>{f}</span>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', maxWidth: '100%' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                  Showing <strong style={{ color: '#0F172A' }}>{displayProperties.length} properties</strong>
                </span>

                {/* Availability Filter Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', padding: '6px 12px' }}>
                  <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Availability:</span>
                  <select
                    value={availabilityFilter}
                    onChange={(e) => setAvailabilityFilter(e.target.value as any)}
                    style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '12px', fontWeight: 800, color: '#0F172A', cursor: 'pointer' }}
                  >
                    <option value="All">All</option>
                    <option value="Available">Available</option>
                    <option value="Sold">Sold</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', padding: '6px 12px' }}>
                  <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '12px', fontWeight: 800, color: '#0F172A', cursor: 'pointer' }}
                  >
                    <option value="Newest First">Newest First</option>
                    <option value="Featured">Featured</option>
                    <option value="Price: Low to High">Price: Low to High</option>
                    <option value="Price: High to Low">Price: High to Low</option>
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
                  localSearchLocation={(() => {
                    const parts: string[] = [];
                    if (selectedLocalityId) { const loc = masterLocalitiesDb.find(l => l.id === selectedLocalityId); if (loc) parts.push(loc.name); }
                    if (selectedAreaId) { const area = masterAreasDb.find(a => a.id === selectedAreaId); if (area) parts.push(area.name); }
                    if (selectedCityId) { const city = masterLocationsDb.find(c => c.id === selectedCityId); if (city) parts.push(city.name); }
                    return parts.length > 0 ? parts.join(', ') : locationText;
                  })()}
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
              className={`responsive-property-grid ${viewMode === 'map' ? 'map-view-grid' : ''}`}
              style={{
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
                paginatedProperties.map((prop, index) => {
                const selCityForTitle = availableCities.find(c => c.id === selectedCityId)?.name;
                const targetCityRaw = location?.city || location?.displayName || (locationText && locationText.trim() !== '' && !locationText.toLowerCase().includes('current location') ? locationText : selCityForTitle);
                const targetCity = targetCityRaw ? targetCityRaw.charAt(0).toUpperCase() + targetCityRaw.slice(1) : 'your selected city';
                const currentTier = (prop as any).distanceTier || 0;
                const prevTier = index === 0 ? 0 : ((paginatedProperties[index - 1] as any).distanceTier || 0);
                
                const showSeparator = currentTier > 0 && currentTier > prevTier;

                const isFav = isWishlisted(prop.id);
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
                  <React.Fragment key={prop.id + '-wrap'}>
                    {showSeparator && (
                      <div style={{ gridColumn: '1 / -1', marginTop: index > 0 ? '12px' : '0', marginBottom: '8px', paddingBottom: '12px', borderBottom: '2px solid #E2E8F0' }}>
                        <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#475569', fontWeight: 700 }}>
                          {currentTier === 50 ? `Properties within 50 kms from ${targetCity}` :
                           currentTier === 100 ? `Properties above 50 kms from ${targetCity}` :
                           currentTier === 150 ? `Properties above 100 kms from ${targetCity}` :
                           currentTier >= 200 ? `Properties above 150 kms from ${targetCity}` :
                           `Properties within ${currentTier} kms from ${targetCity}`}
                        </h2>
                      </div>
                    )}
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
                        loading="lazy"
                        decoding="async"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />

                      {/* Top Left Badge */}
                      {(prop.recentlySold || prop.badge === 'RECENTLY SOLD') ? (
                        <div
                          style={{
                            position: 'absolute',
                            top: '12px',
                            left: '12px',
                            backgroundColor: '#DC2626',
                            backgroundImage: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
                            color: '#FFFFFF',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            letterSpacing: '0.05em',
                            boxShadow: '0 2px 10px rgba(220, 38, 38, 0.5)',
                            zIndex: 10,
                            fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif"
                          }}
                        >
                          RECENTLY SOLD
                        </div>
                      ) : (prop.sold || prop.approvalStatus === 'Sold' || prop.listingStatus === 'Sold') ? (
                        <div
                          style={{
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
                          }}
                        >
                          SOLD
                        </div>
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
                        <h3 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', textTransform: 'capitalize', lineHeight: 1.3 }}>
                          {prop.title}
                        </h3>
                        <div style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>{prop.location}</span>
                          <span style={{ color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 700, fontSize: '11.5px', backgroundColor: '#ECFDF5', padding: '2px 8px', borderRadius: '6px' }}>
                            <FaEye style={{ fontSize: '0.78rem' }} /> {prop.viewsCount || 0} views
                          </span>
                        </div>

                        {/* Category-Relevant Specs Row */}
                        {(() => {
                          const isPlot = (prop.type || '').toLowerCase().includes('plot') || (prop.type || '').toLowerCase().includes('land') || (prop.title || '').toLowerCase().includes('plot') || (prop.title || '').toLowerCase().includes('land') || (prop.title || '').toLowerCase().includes('farm');
                          const isComm = (prop.type || '').toLowerCase().includes('commercial') || (prop.type || '').toLowerCase().includes('office') || (prop.type || '').toLowerCase().includes('shop') || (prop.type || '').toLowerCase().includes('showroom') || (prop.type || '').toLowerCase().includes('warehouse') || (prop.title || '').toLowerCase().includes('commercial') || (prop.title || '').toLowerCase().includes('office') || (prop.title || '').toLowerCase().includes('shop');

                          if (isPlot) {
                            return (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', fontWeight: 600, color: '#065F46', backgroundColor: '#ECFDF5', padding: '8px 10px', borderRadius: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <FaRulerCombined style={{ color: '#059669' }} /> {prop.area || 'Plot Area'}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <FaLayerGroup style={{ color: '#059669' }} /> {prop.facing ? `${prop.facing} Facing` : 'Clear Title Plot'}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <FaShieldAlt style={{ color: '#059669' }} /> RERA / DTCP Approved
                                </span>
                              </div>
                            );
                          }

                          if (isComm) {
                            return (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', fontWeight: 600, color: '#1E40AF', backgroundColor: '#EFF6FF', padding: '8px 10px', borderRadius: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <FaRulerCombined style={{ color: '#2563EB' }} /> {prop.area}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <FaBriefcase style={{ color: '#2563EB' }} /> {prop.type || 'Commercial Space'}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <FaCar style={{ color: '#2563EB' }} /> {prop.parking ? `${prop.parking} Parking` : 'Ample Parking'}
                                </span>
                              </div>
                            );
                          }

                          return (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', fontWeight: 600, color: '#475569', backgroundColor: '#F8FAFC', padding: '8px 10px', borderRadius: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FaRulerCombined style={{ color: '#3B82F6' }} /> {prop.area}
                              </span>
                              {prop.bhk && prop.bhk !== '0' && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <FaBed style={{ color: '#3B82F6' }} /> {prop.bhk.includes('BHK') ? prop.bhk : `${prop.bhk} BHK`}
                                </span>
                              )}
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FaBath style={{ color: '#3B82F6' }} /> {prop.bath}
                              </span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FaCar style={{ color: '#3B82F6' }} /> {prop.parking}
                              </span>
                              {prop.furnishing && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#059669', backgroundColor: '#ECFDF5', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                                  🛋️ {prop.furnishing}
                                </span>
                              )}
                            </div>
                          );
                        })()}

                        {/* Price & Distance Row */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0px', flexWrap: 'nowrap', gap: '8px' }}>
                          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap' }}>
                            {prop.price}
                          </span>
                          <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#16A34A', backgroundColor: '#DCFCE7', padding: '4px 10px', borderRadius: '8px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                            {prop.dist}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  </React.Fragment>
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

            {/* DOWN RECENTLY SOLD PROPERTIES SECTION */}
            {recentlySoldList.length > 0 && (
              <div style={{ marginTop: '48px', paddingTop: '36px', borderTop: '2px dashed #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.05em', backgroundColor: '#FEF2F2', padding: '4px 12px', borderRadius: '20px', border: '1px solid #FCA5A5' }}>
                      🏷️ Successfully Closed Deals
                    </span>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginTop: '8px', margin: '8px 0 0 0' }}>Recently Sold Properties</h2>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748B' }}>
                    {recentlySoldList.length} Verified Closed Deals
                  </span>
                </div>

                <div className="responsive-property-grid">
                  {recentlySoldList.map((prop: any) => {
                    const isFav = isWishlisted(prop.id);
                    return (
                      <div
                        key={'sold-' + prop.id}
                        onClick={() => onPropertyClick?.(prop.id)}
                        style={{
                          backgroundColor: '#FFFFFF',
                          borderRadius: '20px',
                          border: '1.5px solid #FECACA',
                          overflow: 'hidden',
                          boxShadow: '0 4px 16px rgba(220, 38, 38, 0.06)',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          flexDirection: 'column',
                          position: 'relative'
                        }}
                      >
                        <div style={{ position: 'relative', height: '180px', backgroundColor: '#0F172A' }}>
                          <img
                            src={prop.image}
                            alt={prop.title}
                            loading="lazy"
                            decoding="async"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <div
                            style={{
                              position: 'absolute',
                              top: '12px',
                              left: '12px',
                              backgroundColor: '#DC2626',
                              backgroundImage: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
                              color: '#FFFFFF',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              letterSpacing: '0.05em',
                              boxShadow: '0 2px 10px rgba(220, 38, 38, 0.5)',
                              zIndex: 10,
                            }}
                          >
                            RECENTLY SOLD
                          </div>
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
                              border: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                            }}
                          >
                            {isFav ? <FaHeart style={{ color: '#EF4444', fontSize: '15px' }} /> : <FaRegHeart style={{ color: '#FFFFFF', fontSize: '15px' }} />}
                          </button>
                        </div>

                        <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', textTransform: 'capitalize' }}>
                              {prop.title}
                            </h3>
                            <div style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 600, marginBottom: '12px' }}>
                              {prop.location}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#DC2626' }}>
                                {prop.price}
                              </span>
                              <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#DC2626', backgroundColor: '#FEF2F2', padding: '3px 8px', borderRadius: '6px' }}>
                                Deal Closed
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
