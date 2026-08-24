import React, { useState, useMemo, useEffect } from 'react';
import type { PropertyListing } from '../db/marketplaceDb';
import { 
  propertiesDb, 
  masterLocationsDb, 
  masterLocalitiesDb 
} from '../db/marketplaceDb';
import { useWishlist } from '../context/WishlistContext';
import { useLocationStore } from '../context/LocationContext';
import { LiveLocationMap } from './ui/LiveLocationMap';
import {
  FaSearch,
  FaMapMarkerAlt,
  FaHome,
  FaBuilding,
  FaBed,
  FaBath,
  FaRulerCombined,
  FaHeart,
  FaRegHeart,
  FaCheckCircle,
  FaCrown,
  FaFilter,
  FaTimes,
  FaCalendarAlt,
  FaTag,
  FaKey,
  FaList,
  FaMap,
  FaSlidersH,
  FaChevronDown,
  FaChevronUp,
  FaPhoneAlt,
  FaEnvelope,
  FaUser,
  FaShareAlt,
  FaInfoCircle,
  FaUndo,
  FaCheck,
  FaStar,
  FaShieldAlt,
  FaCar,
  FaArrowLeft
} from 'react-icons/fa';

interface RentPropertyPageProps {
  onBack?: () => void;
  onPropertyClick?: (id: string) => void;
  onBuyProperty?: (id: string) => void;
  searchQuery?: string;
  onClearSearch?: () => void;
}

export const RentPropertyPage: React.FC<RentPropertyPageProps> = ({
  onBack,
  onPropertyClick,
  onBuyProperty,
  searchQuery = '',
  onClearSearch,
}) => {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { location } = useLocationStore();

  // Primary Category selection from specification (Residential vs Commercial)
  const [activeCategoryTab, setActiveCategoryTab] = useState<'All' | 'Residential' | 'Commercial'>('All');

  // Filter state for the 5 specified groups
  const [selectedCity, setSelectedCity] = useState<string>('All Cities');
  const [selectedLocality, setSelectedLocality] = useState<string>('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [minRentInput, setMinRentInput] = useState<number>(0);
  const [maxRentInput, setMaxRentInput] = useState<number>(500000);
  const [selectedBhk, setSelectedBhk] = useState<string>('Any');
  const [selectedCommercialSize, setSelectedCommercialSize] = useState<string>('Any');
  const [selectedFurnishing, setSelectedFurnishing] = useState<string>('Any');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('Any');

  // Additional filters & display controls
  const [textSearch, setTextSearch] = useState<string>(searchQuery);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Accordion open states for filter sidebar
  const [openAccordions, setOpenAccordions] = useState<{ [key: string]: boolean }>({
    location: true,
    propertyType: true,
    rent: true,
    sizeBhk: true,
    furnishing: true,
  });

  // Contact / Book Modal State
  const [activeModal, setActiveModal] = useState<'book' | 'enquire' | null>(null);
  const [selectedModalProp, setSelectedModalProp] = useState<PropertyListing | null>(null);
  const [modalForm, setModalForm] = useState({ name: '', phone: '', email: '', date: '', message: '' });
  const [modalSuccess, setModalSuccess] = useState(false);

  // Synchronize global search query prop
  useEffect(() => {
    if (searchQuery !== undefined) {
      setTextSearch(searchQuery);
    }
  }, [searchQuery]);

  // Sync city from Navbar Location context if provided
  useEffect(() => {
    const contextCity = location?.city || location?.displayName;
    if (contextCity && selectedCity === 'All Cities') {
      setSelectedCity(contextCity);
    }
  }, [location?.city, location?.displayName]);

  const toggleAccordion = (section: string) => {
    setOpenAccordions(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Filter propertiesDb for rentals
  const allRentalProperties = useMemo(() => {
    return (propertiesDb || []).filter(p => {
      const statusLower = (p.status || '').toLowerCase();
      const catLower = (p.category || '').toLowerCase();
      return statusLower === 'rent' || statusLower === 'lease' || catLower.includes('rent');
    });
  }, [propertiesDb]);

  // Extract available dynamic Cities & Localities
  const availableCitiesList = useMemo(() => {
    const citiesSet = new Set<string>();
    masterLocationsDb.filter(c => c.is_active).forEach(c => citiesSet.add(c.name));
    allRentalProperties.forEach(p => {
      if (p.city && p.city.trim()) citiesSet.add(p.city.trim());
    });
    return Array.from(citiesSet);
  }, [allRentalProperties]);

  const availableLocalitiesList = useMemo(() => {
    const areaSet = new Set<string>();
    masterLocalitiesDb.filter(l => l.is_active).forEach(l => areaSet.add(l.name));
    allRentalProperties.forEach(p => {
      if (p.area && p.area.trim()) areaSet.add(p.area.trim());
    });
    return Array.from(areaSet).slice(0, 12);
  }, [allRentalProperties]);

  // Handle Property Type selections based on Category
  const availablePropertyTypes = useMemo(() => {
    if (activeCategoryTab === 'Residential') {
      return ['Apartment', 'Independent House', 'Villa', 'Builder Floor', 'PG / Co-Living'];
    } else if (activeCategoryTab === 'Commercial') {
      return ['Office', 'Shop / Retail', 'Warehouse', 'Showroom', 'Industrial Building'];
    }
    return ['Apartment', 'Independent House', 'Villa', 'Builder Floor', 'Office', 'Shop / Retail', 'Warehouse', 'Showroom'];
  }, [activeCategoryTab]);

  const togglePropertyTypeFilter = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  // Main Filter Logic implementing all 5 groups from specification
  const filteredRentals = useMemo(() => {
    return allRentalProperties.filter(prop => {
      const catLower = (prop.category || '').toLowerCase();
      const titleLower = (prop.title || '').toLowerCase();
      const descLower = (prop.description || '').toLowerCase();
      const areaLower = (prop.area || '').toLowerCase();
      const cityLower = (prop.city || '').toLowerCase();

      // 1. Categories (Residential vs Commercial)
      if (activeCategoryTab === 'Residential') {
        const isCommercial = catLower.includes('commercial') || catLower.includes('office') || catLower.includes('shop') || catLower.includes('warehouse') || catLower.includes('showroom');
        if (isCommercial) return false;
      } else if (activeCategoryTab === 'Commercial') {
        const isCommercial = catLower.includes('commercial') || catLower.includes('office') || catLower.includes('shop') || catLower.includes('warehouse') || catLower.includes('showroom') || titleLower.includes('office') || titleLower.includes('showroom') || titleLower.includes('warehouse');
        if (!isCommercial) return false;
      }

      // 2. Rental Filter 1: Location - City / Area
      if (selectedCity !== 'All Cities') {
        if (!cityLower.includes(selectedCity.toLowerCase()) && !selectedCity.toLowerCase().includes(cityLower)) {
          return false;
        }
      }
      if (selectedLocality.trim()) {
        const queryLoc = selectedLocality.toLowerCase().trim();
        if (!areaLower.includes(queryLoc) && !cityLower.includes(queryLoc) && !titleLower.includes(queryLoc)) {
          return false;
        }
      }

      // 3. Rental Filter 2: Property Type
      if (selectedTypes.length > 0) {
        const matchesType = selectedTypes.some(type => {
          const typeLow = type.toLowerCase();
          return catLower.includes(typeLow) || titleLower.includes(typeLow) || descLower.includes(typeLow);
        });
        if (!matchesType) return false;
      }

      // 4. Rental Filter 3: Monthly Rent (Min to Max)
      const numRent = typeof prop.price === 'number' ? prop.price : parseFloat(String(prop.price).replace(/[^0-9.]/g, '')) || 0;
      if (minRentInput > 0 && numRent < minRentInput) return false;
      if (maxRentInput < 500000 && numRent > maxRentInput) return false;

      // 5. Rental Filter 4: Bedrooms / Size (BHK for Residential / Sq.Ft. for Commercial)
      if (activeCategoryTab === 'Residential' || activeCategoryTab === 'All') {
        if (selectedBhk !== 'Any') {
          const bhkNum = prop.bedrooms || 0;
          if (selectedBhk === '1 BHK' && bhkNum !== 1) return false;
          if (selectedBhk === '2 BHK' && bhkNum !== 2) return false;
          if (selectedBhk === '3 BHK' && bhkNum !== 3) return false;
          if (selectedBhk === '4+ BHK' && bhkNum < 4) return false;
        }
      }

      if (activeCategoryTab === 'Commercial' || activeCategoryTab === 'All') {
        if (selectedCommercialSize !== 'Any') {
          const sqftNum = parseFloat(prop.areaSqFt || prop.sqft || '0') || 0;
          if (selectedCommercialSize === '< 500 sq ft' && sqftNum >= 500) return false;
          if (selectedCommercialSize === '500 - 1,000 sq ft' && (sqftNum < 500 || sqftNum > 1000)) return false;
          if (selectedCommercialSize === '1,000 - 2,500 sq ft' && (sqftNum < 1000 || sqftNum > 2500)) return false;
          if (selectedCommercialSize === '2,500 - 5,000 sq ft' && (sqftNum < 2500 || sqftNum > 5000)) return false;
          if (selectedCommercialSize === '5,000+ sq ft' && sqftNum < 5000) return false;
        }
      }

      // 6. Rental Filter 5: Furnishing / Availability
      if (selectedFurnishing !== 'Any') {
        const furnLow = (prop.furnishing || '').toLowerCase();
        if (selectedFurnishing === 'Furnished' && !furnLow.includes('furnished')) return false;
        if (selectedFurnishing === 'Semi-Furnished' && !furnLow.includes('semi')) return false;
        if (selectedFurnishing === 'Unfurnished' && (furnLow.includes('furnished') || furnLow.includes('semi'))) return false;
      }

      if (selectedAvailability !== 'Any') {
        if (selectedAvailability === 'Immediate' && !prop.readyToMove) return false;
      }

      // Verified Filter
      if (verifiedOnly && !prop.verified) return false;

      // Text Keyword Search
      if (textSearch.trim()) {
        const searchLow = textSearch.toLowerCase().trim();
        const fullContent = `${prop.title} ${prop.description} ${prop.city} ${prop.area} ${prop.category} ${prop.furnishing || ''}`.toLowerCase();
        if (!fullContent.includes(searchLow)) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rent_asc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'rent_desc') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'newest') return new Date(b.createdDate || '').getTime() - new Date(a.createdDate || '').getTime();
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [
    allRentalProperties,
    activeCategoryTab,
    selectedCity,
    selectedLocality,
    selectedTypes,
    minRentInput,
    maxRentInput,
    selectedBhk,
    selectedCommercialSize,
    selectedFurnishing,
    selectedAvailability,
    verifiedOnly,
    textSearch,
    sortBy,
  ]);

  // Clear all filters handler
  const handleResetFilters = () => {
    setActiveCategoryTab('All');
    setSelectedCity('All Cities');
    setSelectedLocality('');
    setSelectedTypes([]);
    setMinRentInput(0);
    setMaxRentInput(500000);
    setSelectedBhk('Any');
    setSelectedCommercialSize('Any');
    setSelectedFurnishing('Any');
    setSelectedAvailability('Any');
    setVerifiedOnly(false);
    setTextSearch('');
    if (onClearSearch) onClearSearch();
  };

  // Count active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (activeCategoryTab !== 'All') count++;
    if (selectedCity !== 'All Cities') count++;
    if (selectedLocality.trim() !== '') count++;
    if (selectedTypes.length > 0) count += selectedTypes.length;
    if (minRentInput > 0 || maxRentInput < 500000) count++;
    if (selectedBhk !== 'Any') count++;
    if (selectedCommercialSize !== 'Any') count++;
    if (selectedFurnishing !== 'Any') count++;
    if (selectedAvailability !== 'Any') count++;
    if (verifiedOnly) count++;
    if (textSearch.trim()) count++;
    return count;
  }, [
    activeCategoryTab, selectedCity, selectedLocality, selectedTypes,
    minRentInput, maxRentInput, selectedBhk, selectedCommercialSize,
    selectedFurnishing, selectedAvailability, verifiedOnly, textSearch
  ]);

  // Modal open helpers
  const handleOpenModal = (prop: PropertyListing, type: 'book' | 'enquire') => {
    setSelectedModalProp(prop);
    setActiveModal(type);
    setModalSuccess(false);
    setModalForm({ name: '', phone: '', email: '', date: '', message: '' });
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setModalSuccess(true);
    setTimeout(() => {
      setActiveModal(null);
      setModalSuccess(false);
    }, 2200);
  };

  return (
    <div className="rent-property-page bg-slate-50 min-h-screen pb-16">
      
      {/* 1. Header Banner & Page Title */}
      <div className="rent-hero-header bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white py-10 px-4 sm:px-6 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-7xl mx-auto">
          {/* Back button & Breadcrumb */}
          <div className="flex items-center gap-3 mb-4">
            {onBack && (
              <button 
                onClick={onBack} 
                className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 hover:text-emerald-300 transition-colors bg-white/10 px-3 py-1.5 rounded-full border border-white/15 backdrop-blur-md"
              >
                <FaArrowLeft /> Back
              </button>
            )}
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
              4. RENT PROPERTY
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3">
                Rent Property <span className="text-emerald-400">Marketplace</span>
              </h1>
              <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
                Discover verified residential homes and commercial spaces for rent. Filter by category, location, type, rent range, BHK/size, and furnishing availability.
              </p>
            </div>

            {/* Quick Stats Cards */}
            <div className="md:col-span-4 grid grid-cols-2 gap-3">
              <div className="bg-white/10 backdrop-blur-md border border-white/15 p-3.5 rounded-xl text-center">
                <span className="block text-2xl font-bold text-emerald-400">{allRentalProperties.length}</span>
                <span className="text-xs text-slate-300 font-medium">Total Rentals</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/15 p-3.5 rounded-xl text-center">
                <span className="block text-2xl font-bold text-white">100%</span>
                <span className="text-xs text-slate-300 font-medium">Verified Owners</span>
              </div>
            </div>
          </div>

          {/* Quick Search & Location Bar */}
          <div className="mt-8 bg-white p-3 sm:p-4 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-3 items-center text-slate-800 border border-slate-200/80">
            <div className="relative flex-1 w-full">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={textSearch}
                onChange={(e) => setTextSearch(e.target.value)}
                placeholder="Search rentals by location, landmark, project name or keyword..."
                className="w-full pl-11 pr-4 py-3 bg-slate-100/70 hover:bg-slate-100 focus:bg-white rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm font-medium"
              />
              {textSearch && (
                <button onClick={() => setTextSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <FaTimes />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-48">
                <FaMapMarkerAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full pl-9 pr-8 py-3 bg-slate-100/70 hover:bg-slate-100 rounded-xl border border-slate-200 focus:border-emerald-500 text-sm font-semibold text-slate-800 outline-none cursor-pointer appearance-none"
                >
                  <option value="All Cities">All Cities</option>
                  {availableCitiesList.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
              </div>

              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'map' : 'grid')}
                className={`px-4 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all whitespace-nowrap border ${
                  viewMode === 'map' 
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                }`}
              >
                {viewMode === 'grid' ? <><FaMap /> Map View</> : <><FaList /> Grid View</>}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">
        
        {/* Section 1: CATEGORIES (Residential vs Commercial) */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 inline-block mb-1">
                Category Selection
              </span>
              <h2 className="text-xl font-extrabold text-slate-900">Categories</h2>
            </div>
            {activeFiltersCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-200 transition-colors self-start sm:self-auto"
              >
                <FaUndo className="text-xs" /> Reset All Filters ({activeFiltersCount})
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setActiveCategoryTab('All')}
              className={`p-4 rounded-xl border-2 font-bold text-left flex items-center justify-between transition-all ${
                activeCategoryTab === 'All'
                  ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 shadow-md ring-2 ring-emerald-600/20'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${activeCategoryTab === 'All' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  <FaKey className="text-lg" />
                </div>
                <div>
                  <div className="text-base font-extrabold">All Rental Categories</div>
                  <div className="text-xs text-slate-500 font-normal">Explore Residential & Commercial</div>
                </div>
              </div>
              {activeCategoryTab === 'All' && <FaCheckCircle className="text-emerald-600 text-lg" />}
            </button>

            <button
              onClick={() => setActiveCategoryTab('Residential')}
              className={`p-4 rounded-xl border-2 font-bold text-left flex items-center justify-between transition-all ${
                activeCategoryTab === 'Residential'
                  ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 shadow-md ring-2 ring-emerald-600/20'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${activeCategoryTab === 'Residential' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  <FaHome className="text-lg" />
                </div>
                <div>
                  <div className="text-base font-extrabold">1. Residential</div>
                  <div className="text-xs text-slate-500 font-normal">Flats, Villas, Houses, PGs</div>
                </div>
              </div>
              {activeCategoryTab === 'Residential' && <FaCheckCircle className="text-emerald-600 text-lg" />}
            </button>

            <button
              onClick={() => setActiveCategoryTab('Commercial')}
              className={`p-4 rounded-xl border-2 font-bold text-left flex items-center justify-between transition-all ${
                activeCategoryTab === 'Commercial'
                  ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 shadow-md ring-2 ring-emerald-600/20'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${activeCategoryTab === 'Commercial' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  <FaBuilding className="text-lg" />
                </div>
                <div>
                  <div className="text-base font-extrabold">2. Commercial</div>
                  <div className="text-xs text-slate-500 font-normal">Offices, Shops, Warehouses</div>
                </div>
              </div>
              {activeCategoryTab === 'Commercial' && <FaCheckCircle className="text-emerald-600 text-lg" />}
            </button>
          </div>
        </div>

        {/* Section 2: RENTAL FILTERS Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Mobile Filter Toggle Button */}
          <div className="lg:hidden col-span-1 flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <span className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <FaFilter className="text-emerald-600" /> Filter Options ({activeFiltersCount})
            </span>
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold text-xs flex items-center gap-1.5"
            >
              <FaSlidersH /> {isMobileFilterOpen ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          {/* FILTER SIDEBAR (Desktop & Mobile Drawer) */}
          <div className={`lg:col-span-4 xl:col-span-3 ${isMobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 sticky top-24 space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <FaSlidersH className="text-emerald-600 text-base" />
                  <h3 className="font-extrabold text-slate-900 text-lg">Rental Filters</h3>
                </div>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={handleResetFilters}
                    className="text-xs font-semibold text-rose-600 hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* FILTER 1: Location - City / Area */}
              <div className="border-b border-slate-100 pb-5">
                <button
                  onClick={() => toggleAccordion('location')}
                  className="w-full flex items-center justify-between text-left font-bold text-slate-900 text-sm mb-3"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black flex items-center justify-center">1</span>
                    Location – City / Area
                  </span>
                  {openAccordions.location ? <FaChevronUp className="text-xs text-slate-400" /> : <FaChevronDown className="text-xs text-slate-400" />}
                </button>

                {openAccordions.location && (
                  <div className="space-y-3 pl-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Select City</label>
                      <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                      >
                        <option value="All Cities">All Cities</option>
                        {availableCitiesList.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Area / Locality Search</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={selectedLocality}
                          onChange={(e) => setSelectedLocality(e.target.value)}
                          placeholder="e.g. Gachibowli, Hitec City, Indiranagar"
                          className="w-full p-2.5 pr-7 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-emerald-500"
                        />
                        {selectedLocality && (
                          <button onClick={() => setSelectedLocality('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                            <FaTimes />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Popular Locality Chips */}
                    <div className="pt-1">
                      <span className="block text-[11px] font-semibold text-slate-400 mb-1.5">Top Areas:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {availableLocalitiesList.slice(0, 5).map(loc => (
                          <button
                            key={loc}
                            onClick={() => setSelectedLocality(selectedLocality === loc ? '' : loc)}
                            className={`text-[11px] px-2.5 py-1 rounded-md transition-colors ${
                              selectedLocality === loc
                                ? 'bg-emerald-600 text-white font-bold'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {loc}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* FILTER 2: Property Type */}
              <div className="border-b border-slate-100 pb-5">
                <button
                  onClick={() => toggleAccordion('propertyType')}
                  className="w-full flex items-center justify-between text-left font-bold text-slate-900 text-sm mb-3"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black flex items-center justify-center">2</span>
                    Property Type
                  </span>
                  {openAccordions.propertyType ? <FaChevronUp className="text-xs text-slate-400" /> : <FaChevronDown className="text-xs text-slate-400" />}
                </button>

                {openAccordions.propertyType && (
                  <div className="space-y-2 pl-2">
                    <p className="text-[11px] text-slate-500 font-medium">
                      {activeCategoryTab === 'Commercial' ? 'Commercial Types:' : 'Residential Types:'}
                    </p>
                    {availablePropertyTypes.map(type => {
                      const isChecked = selectedTypes.includes(type);
                      return (
                        <label
                          key={type}
                          onClick={() => togglePropertyTypeFilter(type)}
                          className={`flex items-center justify-between p-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                            isChecked ? 'bg-emerald-50 text-emerald-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            {type}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* FILTER 3: Monthly Rent – Minimum to Maximum */}
              <div className="border-b border-slate-100 pb-5">
                <button
                  onClick={() => toggleAccordion('rent')}
                  className="w-full flex items-center justify-between text-left font-bold text-slate-900 text-sm mb-3"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black flex items-center justify-center">3</span>
                    Monthly Rent Range
                  </span>
                  {openAccordions.rent ? <FaChevronUp className="text-xs text-slate-400" /> : <FaChevronDown className="text-xs text-slate-400" />}
                </button>

                {openAccordions.rent && (
                  <div className="space-y-3 pl-2">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                      <span>₹{minRentInput.toLocaleString('en-IN')}</span>
                      <span>to</span>
                      <span>{maxRentInput >= 500000 ? '₹5,00,000+' : `₹${maxRentInput.toLocaleString('en-IN')}`}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Min Rent</label>
                        <select
                          value={minRentInput}
                          onChange={(e) => setMinRentInput(Number(e.target.value))}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none"
                        >
                          <option value={0}>₹0 (Min)</option>
                          <option value={10000}>₹10,000</option>
                          <option value={20000}>₹20,000</option>
                          <option value={35000}>₹35,000</option>
                          <option value={50000}>₹50,000</option>
                          <option value={100000}>₹1,00,000</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Max Rent</label>
                        <select
                          value={maxRentInput}
                          onChange={(e) => setMaxRentInput(Number(e.target.value))}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none"
                        >
                          <option value={30000}>₹30,000</option>
                          <option value={50000}>₹50,000</option>
                          <option value={75000}>₹75,000</option>
                          <option value={150000}>₹1,50,000</option>
                          <option value={300000}>₹3,00,000</option>
                          <option value={500000}>₹5,00,000+</option>
                        </select>
                      </div>
                    </div>

                    {/* Quick Rent Preset Pills */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {[
                        { label: 'Under ₹25k', min: 0, max: 25000 },
                        { label: '₹25k - ₹50k', min: 25000, max: 50000 },
                        { label: '₹50k - ₹1L', min: 50000, max: 100000 },
                        { label: '₹1L+', min: 100000, max: 500000 },
                      ].map(p => (
                        <button
                          key={p.label}
                          onClick={() => { setMinRentInput(p.min); setMaxRentInput(p.max); }}
                          className="text-[10px] font-semibold px-2 py-1 rounded bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-slate-600 transition-colors"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* FILTER 4: Bedrooms / Size */}
              <div className="border-b border-slate-100 pb-5">
                <button
                  onClick={() => toggleAccordion('sizeBhk')}
                  className="w-full flex items-center justify-between text-left font-bold text-slate-900 text-sm mb-3"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black flex items-center justify-center">4</span>
                    {activeCategoryTab === 'Commercial' ? 'Size (Sq. Ft. for Commercial)' : 'Bedrooms (BHK for Residential)'}
                  </span>
                  {openAccordions.sizeBhk ? <FaChevronUp className="text-xs text-slate-400" /> : <FaChevronDown className="text-xs text-slate-400" />}
                </button>

                {openAccordions.sizeBhk && (
                  <div className="space-y-3 pl-2">
                    {/* BHK Selector for Residential */}
                    {(activeCategoryTab === 'Residential' || activeCategoryTab === 'All') && (
                      <div>
                        <span className="block text-[11px] font-semibold text-slate-500 mb-2">BHK Configuration:</span>
                        <div className="grid grid-cols-3 gap-1.5">
                          {['Any', '1 BHK', '2 BHK', '3 BHK', '4+ BHK'].map(bhk => (
                            <button
                              key={bhk}
                              onClick={() => setSelectedBhk(bhk)}
                              className={`py-2 px-1 rounded-lg text-xs font-bold transition-all text-center border ${
                                selectedBhk === bhk
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {bhk}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sq. Ft. Selector for Commercial */}
                    {(activeCategoryTab === 'Commercial' || activeCategoryTab === 'All') && (
                      <div className="pt-2">
                        <span className="block text-[11px] font-semibold text-slate-500 mb-2">Commercial Area (Sq. Ft.):</span>
                        <div className="space-y-1.5">
                          {['Any', '< 500 sq ft', '500 - 1,000 sq ft', '1,000 - 2,500 sq ft', '2,500 - 5,000 sq ft', '5,000+ sq ft'].map(sz => (
                            <button
                              key={sz}
                              onClick={() => setSelectedCommercialSize(sz)}
                              className={`w-full py-1.5 px-3 rounded-lg text-xs font-medium text-left transition-all border flex items-center justify-between ${
                                selectedCommercialSize === sz
                                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              <span>{sz}</span>
                              {selectedCommercialSize === sz && <FaCheck className="text-emerald-600 text-xs" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* FILTER 5: Furnishing / Availability */}
              <div className="pb-2">
                <button
                  onClick={() => toggleAccordion('furnishing')}
                  className="w-full flex items-center justify-between text-left font-bold text-slate-900 text-sm mb-3"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black flex items-center justify-center">5</span>
                    Furnishing / Availability
                  </span>
                  {openAccordions.furnishing ? <FaChevronUp className="text-xs text-slate-400" /> : <FaChevronDown className="text-xs text-slate-400" />}
                </button>

                {openAccordions.furnishing && (
                  <div className="space-y-4 pl-2">
                    {/* Furnishing */}
                    <div>
                      <span className="block text-[11px] font-semibold text-slate-500 mb-2">Furnishing Status:</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {['Any', 'Furnished', 'Semi-Furnished', 'Unfurnished'].map(f => (
                          <button
                            key={f}
                            onClick={() => setSelectedFurnishing(f)}
                            className={`py-1.5 px-2 rounded-lg text-xs font-bold text-center border transition-all ${
                              selectedFurnishing === f
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Availability */}
                    <div>
                      <span className="block text-[11px] font-semibold text-slate-500 mb-2">Available From:</span>
                      <div className="space-y-1.5">
                        {['Any', 'Immediate', 'Within 15 Days', 'Within 30 Days'].map(av => (
                          <button
                            key={av}
                            onClick={() => setSelectedAvailability(av)}
                            className={`w-full py-1.5 px-3 rounded-lg text-xs font-medium text-left transition-all border flex items-center justify-between ${
                              selectedAvailability === av
                                ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <FaCalendarAlt className="text-emerald-600 text-xs" /> {av}
                            </span>
                            {selectedAvailability === av && <FaCheck className="text-emerald-600 text-xs" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Verified Only Toggle */}
                    <div className="pt-2 border-t border-slate-100">
                      <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg bg-emerald-50/50 border border-emerald-100 hover:bg-emerald-50">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <FaShieldAlt className="text-emerald-600" /> Verified Properties Only
                        </span>
                        <input
                          type="checkbox"
                          checked={verifiedOnly}
                          onChange={(e) => setVerifiedOnly(e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* PROPERTY LISTINGS DISPLAY AREA */}
          <div className="lg:col-span-8 xl:col-span-9">
            
            {/* Sorting & Filter Summary Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <span>Rental Listings</span>
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
                    {filteredRentals.length} Properties
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Showing {activeCategoryTab} rentals matching your criteria
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="featured">Featured First</option>
                  <option value="rent_asc">Rent: Low to High</option>
                  <option value="rent_desc">Rent: High to Low</option>
                  <option value="newest">Newest First</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Active Filter Tags */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-6 bg-slate-100/80 p-3 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                  <FaFilter className="text-emerald-600 text-xs" /> Active:
                </span>
                {activeCategoryTab !== 'All' && (
                  <span className="text-xs bg-white text-emerald-800 font-semibold px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1">
                    Category: {activeCategoryTab}
                    <button onClick={() => setActiveCategoryTab('All')} className="text-slate-400 hover:text-slate-600 ml-1"><FaTimes /></button>
                  </span>
                )}
                {selectedCity !== 'All Cities' && (
                  <span className="text-xs bg-white text-emerald-800 font-semibold px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1">
                    City: {selectedCity}
                    <button onClick={() => setSelectedCity('All Cities')} className="text-slate-400 hover:text-slate-600 ml-1"><FaTimes /></button>
                  </span>
                )}
                {selectedLocality && (
                  <span className="text-xs bg-white text-emerald-800 font-semibold px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1">
                    Area: {selectedLocality}
                    <button onClick={() => setSelectedLocality('')} className="text-slate-400 hover:text-slate-600 ml-1"><FaTimes /></button>
                  </span>
                )}
                {selectedTypes.map(t => (
                  <span key={t} className="text-xs bg-white text-emerald-800 font-semibold px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1">
                    Type: {t}
                    <button onClick={() => togglePropertyTypeFilter(t)} className="text-slate-400 hover:text-slate-600 ml-1"><FaTimes /></button>
                  </span>
                ))}
                {selectedBhk !== 'Any' && (
                  <span className="text-xs bg-white text-emerald-800 font-semibold px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1">
                    {selectedBhk}
                    <button onClick={() => setSelectedBhk('Any')} className="text-slate-400 hover:text-slate-600 ml-1"><FaTimes /></button>
                  </span>
                )}
                {selectedFurnishing !== 'Any' && (
                  <span className="text-xs bg-white text-emerald-800 font-semibold px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1">
                    {selectedFurnishing}
                    <button onClick={() => setSelectedFurnishing('Any')} className="text-slate-400 hover:text-slate-600 ml-1"><FaTimes /></button>
                  </span>
                )}
                <button onClick={handleResetFilters} className="text-xs text-rose-600 font-bold hover:underline ml-auto">
                  Clear All
                </button>
              </div>
            )}

            {/* MAP VIEW MODE */}
            {viewMode === 'map' ? (
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-8">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                    <FaMap className="text-emerald-600" /> Interactive Rental Property Map
                  </h4>
                  <span className="text-xs text-slate-500">Showing {filteredRentals.length} locations</span>
                </div>
                <LiveLocationMap
                  items={filteredRentals}
                  type="property"
                  height="520px"
                  onSelectItem={(id) => {
                    if (onPropertyClick) onPropertyClick(id);
                  }}
                />
              </div>
            ) : (
              /* GRID VIEW MODE */
              filteredRentals.length === 0 ? (
                /* EMPTY STATE */
                <div className="bg-white p-12 rounded-2xl text-center border border-slate-200 shadow-sm">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                    <FaSearch />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No Rental Properties Found</h3>
                  <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
                    We couldn't find any rentals matching your exact filter criteria. Try adjusting your rent range, category, or location.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="bg-emerald-600 text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-emerald-700 transition-all shadow-md"
                  >
                    Reset All Rental Filters
                  </button>
                </div>
              ) : (
                /* PROPERTY CARDS GRID */
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredRentals.map(prop => {
                    const isFav = isWishlisted(prop.id);
                    const formattedRent = typeof prop.price === 'number' 
                      ? `₹${prop.price.toLocaleString('en-IN')}` 
                      : prop.priceDisplay || prop.price;

                    const isCommercial = (prop.category || '').toLowerCase().includes('commercial') || (prop.category || '').toLowerCase().includes('office') || (prop.category || '').toLowerCase().includes('shop') || (prop.category || '').toLowerCase().includes('warehouse');

                    return (
                      <div
                        key={prop.id}
                        className="group bg-white rounded-2xl border border-slate-200 hover:border-emerald-500/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative"
                      >
                        {/* Property Image & Overlay Badges */}
                        <div 
                          className="relative aspect-[16/10] overflow-hidden bg-slate-100 cursor-pointer"
                          onClick={() => onPropertyClick && onPropertyClick(prop.id)}
                        >
                          <img
                            src={prop.image || prop.imageUrl || '/assets/luxury_apartment.png'}
                            alt={prop.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-black/20 pointer-events-none"></div>

                          {/* Top Badges */}
                          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10 pointer-events-none">
                            <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md shadow-md uppercase tracking-wider flex items-center gap-1">
                              <FaKey className="text-[9px]" /> FOR RENT
                            </span>
                            {prop.verified && (
                              <span className="bg-blue-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md shadow-md flex items-center gap-1">
                                <FaCheckCircle className="text-[9px]" /> VERIFIED
                              </span>
                            )}
                            {prop.premium && (
                              <span className="bg-amber-500 text-white text-[10px] font-extrabold px-2 py-1 rounded-md shadow-md flex items-center gap-1">
                                <FaCrown className="text-[9px]" /> PREMIUM
                              </span>
                            )}
                          </div>

                          {/* Wishlist Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWishlist(prop.id, 'PROPERTY');
                            }}
                            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/80 hover:bg-white backdrop-blur-md flex items-center justify-center text-slate-700 hover:text-rose-600 transition-all shadow-md z-10"
                            title="Save to Wishlist"
                          >
                            {isFav ? <FaHeart className="text-rose-600 text-base" /> : <FaRegHeart className="text-base" />}
                          </button>

                          {/* Category Tag */}
                          <div className="absolute bottom-3 left-3 z-10">
                            <span className="text-xs font-bold text-white bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20">
                              {prop.category}
                            </span>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            {/* Location */}
                            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold mb-1.5">
                              <FaMapMarkerAlt className="text-emerald-600 shrink-0" />
                              <span className="truncate">{prop.area ? `${prop.area}, ${prop.city}` : prop.city}</span>
                            </div>

                            {/* Title */}
                            <h4 
                              onClick={() => onPropertyClick && onPropertyClick(prop.id)}
                              className="font-extrabold text-slate-900 text-base mb-3 hover:text-emerald-600 transition-colors line-clamp-2 cursor-pointer leading-snug"
                            >
                              {prop.title}
                            </h4>

                            {/* Rent Price Header */}
                            <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-100 mb-4 flex items-baseline justify-between">
                              <div>
                                <span className="text-xs font-semibold text-emerald-800 block">Monthly Rent</span>
                                <span className="text-xl font-black text-emerald-700">{formattedRent}</span>
                                <span className="text-xs text-slate-500 font-medium"> / month</span>
                              </div>
                              <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                                Deposit: 2 Mo.
                              </span>
                            </div>

                            {/* Key Specs Pill Bar */}
                            <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold text-slate-700 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                              {!isCommercial ? (
                                <div className="flex flex-col items-center justify-center">
                                  <span className="text-slate-400 text-[10px]">Bedrooms</span>
                                  <span className="flex items-center gap-1 font-bold text-slate-900">
                                    <FaBed className="text-emerald-600" /> {prop.bedrooms || 2} BHK
                                  </span>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center">
                                  <span className="text-slate-400 text-[10px]">Type</span>
                                  <span className="font-bold text-slate-900 truncate max-w-full">
                                    {prop.category}
                                  </span>
                                </div>
                              )}

                              <div className="flex flex-col items-center justify-center border-x border-slate-200">
                                <span className="text-slate-400 text-[10px]">Area Size</span>
                                <span className="flex items-center gap-1 font-bold text-slate-900">
                                  <FaRulerCombined className="text-emerald-600" /> {prop.areaSqFt || '1,200'} sqft
                                </span>
                              </div>

                              <div className="flex flex-col items-center justify-center">
                                <span className="text-slate-400 text-[10px]">Furnishing</span>
                                <span className="font-bold text-slate-900 truncate max-w-full">
                                  {prop.furnishing || 'Semi-Furnished'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 mt-auto">
                            <button
                              onClick={() => handleOpenModal(prop, 'book')}
                              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold rounded-xl transition-all text-center flex items-center justify-center gap-1.5"
                            >
                              <FaCalendarAlt className="text-emerald-600" /> Book Visit
                            </button>
                            <button
                              onClick={() => handleOpenModal(prop, 'enquire')}
                              className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-md text-center flex items-center justify-center gap-1.5"
                            >
                              <FaPhoneAlt className="text-xs" /> Contact Owner
                            </button>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}

          </div>

        </div>

      </div>

      {/* BOOK VISIT / CONTACT OWNER MODAL */}
      {activeModal && selectedModalProp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100 animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
            >
              <FaTimes />
            </button>

            {modalSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl">
                  <FaCheckCircle />
                </div>
                <h3 className="text-2xl font-black text-slate-900">Request Submitted!</h3>
                <p className="text-slate-600 text-sm max-w-xs mx-auto">
                  Our rental desk and landlord agent will contact you shortly regarding <strong>{selectedModalProp.title}</strong>.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
                    {activeModal === 'book' ? <FaCalendarAlt className="text-xl" /> : <FaPhoneAlt className="text-xl" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">
                      {activeModal === 'book' ? 'Schedule Rental Property Visit' : 'Contact Property Manager'}
                    </h3>
                    <p className="text-xs text-slate-500 truncate max-w-xs">
                      {selectedModalProp.title} ({selectedModalProp.city})
                    </p>
                  </div>
                </div>

                <form onSubmit={handleModalSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={modalForm.name}
                      onChange={(e) => setModalForm({ ...modalForm, name: e.target.value })}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={modalForm.phone}
                        onChange={(e) => setModalForm({ ...modalForm, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Date</label>
                      <input
                        type="date"
                        value={modalForm.date}
                        onChange={(e) => setModalForm({ ...modalForm, date: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Message / Requirements</label>
                    <textarea
                      rows={3}
                      value={modalForm.message}
                      onChange={(e) => setModalForm({ ...modalForm, message: e.target.value })}
                      placeholder="Mention expected move-in date or questions..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl transition-all shadow-lg text-sm mt-2"
                  >
                    Confirm & Send Request
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default RentPropertyPage;
