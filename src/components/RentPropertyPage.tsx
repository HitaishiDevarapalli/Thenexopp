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

  // Primary Category selection
  const [activeCategoryTab, setActiveCategoryTab] = useState<'All' | 'Residential' | 'Commercial'>('All');

  // Filter states
  const [selectedCity, setSelectedCity] = useState<string>('All Cities');
  const [selectedLocality, setSelectedLocality] = useState<string>('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [minRentInput, setMinRentInput] = useState<number>(0);
  const [maxRentInput, setMaxRentInput] = useState<number>(500000);
  const [selectedBhk, setSelectedBhk] = useState<string>('Any');
  const [selectedFurnishing, setSelectedFurnishing] = useState<string>('Any');

  // Display controls
  const [textSearch, setTextSearch] = useState<string>(searchQuery);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Accordion open states
  const [openAccordions, setOpenAccordions] = useState<{ [key: string]: boolean }>({
    location: true,
    propertyType: true,
    rent: true,
    sizeBhk: true,
    furnishing: true,
  });

  // Modal State
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

  const toggleAccordion = (section: string) => {
    setOpenAccordions(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Get all rental properties from propertiesDb
  const allRentalProperties = useMemo(() => {
    const list = (propertiesDb || []).filter(p => {
      const statusLower = (p.status || '').toLowerCase();
      const catLower = (p.category || '').toLowerCase();
      const listingStatus = (p.listingStatus || '').toLowerCase();
      return (
        statusLower.includes('rent') ||
        statusLower.includes('lease') ||
        catLower.includes('rent') ||
        listingStatus.includes('rent') ||
        p.status === 'Available' ||
        true // Include all available properties in rentals database
      );
    });
    return list.length > 0 ? list : (propertiesDb || []);
  }, [propertiesDb]);

  // Dynamic Cities & Localities
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

  const togglePropertyTypeFilter = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  // Main Filter Logic
  const filteredRentals = useMemo(() => {
    return allRentalProperties.filter(prop => {
      const catLower = (prop.category || '').toLowerCase();
      const titleLower = (prop.title || '').toLowerCase();
      const descLower = (prop.description || '').toLowerCase();
      const areaLower = (prop.area || '').toLowerCase();
      const cityLower = (prop.city || '').toLowerCase();

      // 1. Categories
      if (activeCategoryTab === 'Residential') {
        const isCommercial = catLower.includes('commercial') || catLower.includes('office') || catLower.includes('shop') || catLower.includes('warehouse') || catLower.includes('showroom');
        if (isCommercial) return false;
      } else if (activeCategoryTab === 'Commercial') {
        const isCommercial = catLower.includes('commercial') || catLower.includes('office') || catLower.includes('shop') || catLower.includes('warehouse') || catLower.includes('showroom') || titleLower.includes('office') || titleLower.includes('showroom') || titleLower.includes('warehouse');
        if (!isCommercial) return false;
      }

      // 2. City Filter
      if (selectedCity !== 'All Cities') {
        if (!cityLower.includes(selectedCity.toLowerCase()) && !selectedCity.toLowerCase().includes(cityLower)) {
          return false;
        }
      }

      // 3. Locality Filter
      if (selectedLocality.trim()) {
        const queryLoc = selectedLocality.toLowerCase().trim();
        if (!areaLower.includes(queryLoc) && !cityLower.includes(queryLoc) && !titleLower.includes(queryLoc)) {
          return false;
        }
      }

      // 4. Property Type
      if (selectedTypes.length > 0) {
        const matchesType = selectedTypes.some(type => {
          const typeLow = type.toLowerCase();
          return catLower.includes(typeLow) || titleLower.includes(typeLow) || descLower.includes(typeLow);
        });
        if (!matchesType) return false;
      }

      // 5. Monthly Rent
      const numRent = typeof prop.price === 'number' ? prop.price : parseFloat(String(prop.price).replace(/[^0-9.]/g, '')) || 0;
      if (minRentInput > 0 && numRent < minRentInput) return false;
      if (maxRentInput < 500000 && numRent > maxRentInput) return false;

      // 6. BHK Filter
      if (selectedBhk !== 'Any') {
        const bhkNum = prop.bedrooms || 0;
        if (selectedBhk === '1 BHK' && bhkNum !== 1) return false;
        if (selectedBhk === '2 BHK' && bhkNum !== 2) return false;
        if (selectedBhk === '3 BHK' && bhkNum !== 3) return false;
        if (selectedBhk === '4+ BHK' && bhkNum < 4) return false;
      }

      // 7. Text Search Query
      if (textSearch.trim()) {
        const q = textSearch.toLowerCase().trim();
        const matchesSearch = titleLower.includes(q) || areaLower.includes(q) || cityLower.includes(q) || catLower.includes(q) || descLower.includes(q);
        if (!matchesSearch) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rent_asc') {
        const priceA = typeof a.price === 'number' ? a.price : 0;
        const priceB = typeof b.price === 'number' ? b.price : 0;
        return priceA - priceB;
      }
      if (sortBy === 'rent_desc') {
        const priceA = typeof a.price === 'number' ? a.price : 0;
        const priceB = typeof b.price === 'number' ? b.price : 0;
        return priceB - priceA;
      }
      if (sortBy === 'newest') {
        return new Date(b.createdDate || 0).getTime() - new Date(a.createdDate || 0).getTime();
      }
      return 0;
    });
  }, [allRentalProperties, activeCategoryTab, selectedCity, selectedLocality, selectedTypes, minRentInput, maxRentInput, selectedBhk, textSearch, sortBy]);

  const handleResetFilters = () => {
    setActiveCategoryTab('All');
    setSelectedCity('All Cities');
    setSelectedLocality('');
    setSelectedTypes([]);
    setMinRentInput(0);
    setMaxRentInput(500000);
    setSelectedBhk('Any');
    setSelectedFurnishing('Any');
    setTextSearch('');
    if (onClearSearch) onClearSearch();
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setModalSuccess(true);
    setTimeout(() => {
      setActiveModal(null);
      setModalSuccess(false);
      setModalForm({ name: '', phone: '', email: '', date: '', message: '' });
    }, 2000);
  };

  const activeFiltersCount = 
    (activeCategoryTab !== 'All' ? 1 : 0) +
    (selectedCity !== 'All Cities' ? 1 : 0) +
    (selectedLocality ? 1 : 0) +
    selectedTypes.length +
    (selectedBhk !== 'Any' ? 1 : 0) +
    (minRentInput > 0 || maxRentInput < 500000 ? 1 : 0) +
    (textSearch ? 1 : 0);

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', paddingTop: '80px', paddingBottom: '60px', fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      
      {/* ── HERO BANNER & SEARCH HEADER ────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: '#FFFFFF', padding: '48px 0 40px 0', borderBottom: '1px solid #334155' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <div>
              {onBack && (
                <button
                  onClick={onBack}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#94A3B8', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginBottom: '16px', transition: 'all 0.2s' }}
                >
                  <FaArrowLeft /> Back
                </button>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ backgroundColor: '#059669', color: '#FFFFFF', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px', borderRadius: '6px' }}>
                  Rental Marketplace
                </span>
                <span style={{ color: '#94A3B8', fontSize: '13px', fontWeight: 600 }}>
                  Direct Owner & Verified Agent Rentals
                </span>
              </div>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#FFFFFF', margin: 0, lineHeight: 1.2 }}>
                Discover Verified Homes & Offices for Rent
              </h1>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', padding: '12px 20px', borderRadius: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#059669' }}>{filteredRentals.length}</div>
                <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700 }}>Available Rentals</div>
              </div>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', padding: '12px 20px', borderRadius: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#D97706' }}>100%</div>
                <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700 }}>Verified Listings</div>
              </div>
            </div>
          </div>

          {/* Glassmorphic Search Bar */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', padding: '12px 16px', boxShadow: '0 20px 40px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 280px', display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#F8FAFC', padding: '10px 16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <FaSearch style={{ color: '#059669', fontSize: '16px' }} />
              <input
                type="text"
                placeholder="Search by area, property type, BHK, or keyword..."
                value={textSearch}
                onChange={(e) => setTextSearch(e.target.value)}
                style={{ width: '100%', border: 'none', outline: 'none', backgroundColor: 'transparent', fontSize: '14px', fontWeight: 600, color: '#0F172A' }}
              />
              {textSearch && (
                <button onClick={() => setTextSearch('')} style={{ border: 'none', background: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                  <FaTimes />
                </button>
              )}
            </div>

            {/* City Selector */}
            <div style={{ flex: '0 0 200px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <FaMapMarkerAlt style={{ color: '#002B66', fontSize: '15px' }} />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                style={{ width: '100%', border: 'none', outline: 'none', backgroundColor: 'transparent', fontSize: '13px', fontWeight: 700, color: '#0F172A', cursor: 'pointer' }}
              >
                <option value="All Cities">All Cities</option>
                {availableCitiesList.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* View Mode Buttons */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{ padding: '10px 18px', borderRadius: '12px', border: 'none', backgroundColor: viewMode === 'grid' ? '#002B66' : '#F1F5F9', color: viewMode === 'grid' ? '#FFFFFF' : '#475569', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <FaList /> Grid
              </button>
              <button
                onClick={() => setViewMode('map')}
                style={{ padding: '10px 18px', borderRadius: '12px', border: 'none', backgroundColor: viewMode === 'map' ? '#002B66' : '#F1F5F9', color: viewMode === 'map' ? '#FFFFFF' : '#475569', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <FaMap /> Map View
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── MAIN CONTENT AREA ─────────────────────────────────────────────────── */}
      <div style={{ maxWidth: '1280px', margin: '36px auto 0 auto', padding: '0 24px' }}>
        
        {/* Category Tabs Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '28px', backgroundColor: '#FFFFFF', padding: '12px 20px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveCategoryTab('All')}
              style={{ padding: '10px 22px', borderRadius: '12px', border: 'none', backgroundColor: activeCategoryTab === 'All' ? '#059669' : '#F1F5F9', color: activeCategoryTab === 'All' ? '#FFFFFF' : '#475569', fontSize: '14px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}
            >
              All Rentals ({allRentalProperties.length})
            </button>
            <button
              onClick={() => setActiveCategoryTab('Residential')}
              style={{ padding: '10px 22px', borderRadius: '12px', border: 'none', backgroundColor: activeCategoryTab === 'Residential' ? '#059669' : '#F1F5F9', color: activeCategoryTab === 'Residential' ? '#FFFFFF' : '#475569', fontSize: '14px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <FaHome /> Residential Homes
            </button>
            <button
              onClick={() => setActiveCategoryTab('Commercial')}
              style={{ padding: '10px 22px', borderRadius: '12px', border: 'none', backgroundColor: activeCategoryTab === 'Commercial' ? '#059669' : '#F1F5F9', color: activeCategoryTab === 'Commercial' ? '#FFFFFF' : '#475569', fontSize: '14px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <FaBuilding /> Commercial Spaces
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748B' }}>Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', fontSize: '13px', fontWeight: 700, color: '#0F172A', outline: 'none', cursor: 'pointer' }}
            >
              <option value="featured">Featured First</option>
              <option value="rent_asc">Rent: Low to High</option>
              <option value="rent_desc">Rent: High to Low</option>
              <option value="newest">Newest First</option>
            </select>

            {activeFiltersCount > 0 && (
              <button
                onClick={handleResetFilters}
                style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid #FCA5A5', backgroundColor: '#FEF2F2', color: '#DC2626', fontSize: '13px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <FaUndo /> Reset ({activeFiltersCount})
              </button>
            )}
          </div>
        </div>

        {/* Layout Grid: Sidebar + Listing Feed */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '28px', alignItems: 'start' }}>
          
          {/* ── FILTER SIDEBAR ──────────────────────────────────────────────── */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #F1F5F9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                <FaFilter style={{ color: '#059669' }} /> Filter Rentals
              </div>
              {activeFiltersCount > 0 && (
                <button onClick={handleResetFilters} style={{ border: 'none', background: 'none', color: '#DC2626', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}>
                  Clear All
                </button>
              )}
            </div>

            {/* BHK Filter */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#0F172A', marginBottom: '10px' }}>
                Bedrooms (BHK)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {['Any', '1 BHK', '2 BHK', '3 BHK', '4+ BHK'].map(bhk => (
                  <button
                    key={bhk}
                    onClick={() => setSelectedBhk(bhk)}
                    style={{ padding: '8px', borderRadius: '8px', border: selectedBhk === bhk ? '2px solid #059669' : '1px solid #E2E8F0', backgroundColor: selectedBhk === bhk ? '#ECFDF5' : '#F8FAFC', color: selectedBhk === bhk ? '#059669' : '#475569', fontSize: '12px', fontWeight: 800, cursor: 'pointer', textAlign: 'center' }}
                  >
                    {bhk}
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Localities */}
            {availableLocalitiesList.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#0F172A', marginBottom: '10px' }}>
                  Popular Areas
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {availableLocalitiesList.map(area => {
                    const isSelected = selectedLocality === area;
                    return (
                      <button
                        key={area}
                        onClick={() => setSelectedLocality(isSelected ? '' : area)}
                        style={{ padding: '5px 10px', borderRadius: '8px', border: isSelected ? '1px solid #059669' : '1px solid #E2E8F0', backgroundColor: isSelected ? '#059669' : '#F8FAFC', color: isSelected ? '#FFFFFF' : '#475569', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        {area}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Property Types Checklist */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#0F172A', marginBottom: '10px' }}>
                Property Type
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['Apartment', 'Independent House', 'Villa', 'Office', 'Shop / Retail', 'Warehouse'].map(type => {
                  const isChecked = selectedTypes.includes(type);
                  return (
                    <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => togglePropertyTypeFilter(type)}
                        style={{ width: '16px', height: '16px', accentColor: '#059669', cursor: 'pointer' }}
                      />
                      {type}
                    </label>
                  );
                })}
              </div>
            </div>

          </div>

          {/* ── LISTINGS FEED GRID ────────────────────────────────────────────── */}
          <div>
            
            {viewMode === 'map' ? (
              <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
                <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>Interactive Rental Map</h3>
                  <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Showing {filteredRentals.length} properties</span>
                </div>
                <LiveLocationMap
                  items={filteredRentals}
                  type="property"
                  height="560px"
                  onSelectItem={(id) => {
                    if (onPropertyClick) onPropertyClick(id);
                  }}
                />
              </div>
            ) : filteredRentals.length === 0 ? (
              /* EMPTY STATE */
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '60px 24px', textAlign: 'center', border: '1px solid #E2E8F0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
                <div style={{ width: '64px', height: '64px', backgroundColor: '#ECFDF5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', color: '#059669', fontSize: '24px' }}>
                  <FaHome />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                  No Rental Properties Found
                </h3>
                <p style={{ fontSize: '14px', color: '#64748B', maxWidth: '420px', margin: '0 auto 24px auto', lineHeight: 1.6 }}>
                  We couldn't find any rental properties matching your current filter selections. Try broadening your location or price criteria.
                </p>
                <button
                  onClick={handleResetFilters}
                  style={{ backgroundColor: '#059669', color: '#FFFFFF', border: 'none', padding: '12px 28px', borderRadius: '12px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)' }}
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              /* PROPERTY CARDS GRID */
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {filteredRentals.map(prop => {
                  const isFav = isWishlisted(prop.id);
                  const formattedRent = typeof prop.price === 'number'
                    ? `₹${prop.price.toLocaleString('en-IN')}`
                    : prop.priceDisplay || `₹${prop.price || 15000}`;

                  const imgSrc = prop.image || prop.imageUrl || '/assets/luxury_apartment.png';

                  return (
                    <div
                      key={prop.id}
                      style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 14px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s, box-shadow 0.3s' }}
                    >
                      {/* Image Banner */}
                      <div style={{ position: 'relative', width: '100%', height: '200px', backgroundColor: '#F1F5F9', cursor: 'pointer' }} onClick={() => onPropertyClick && onPropertyClick(prop.id)}>
                        <img
                          src={imgSrc}
                          alt={prop.title || 'Rental Property'}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ backgroundColor: '#059669', color: '#FFFFFF', fontSize: '10px', fontWeight: 800, padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase' }}>
                            FOR RENT
                          </span>
                          {prop.verified && (
                            <span style={{ backgroundColor: '#1E40AF', color: '#FFFFFF', fontSize: '10px', fontWeight: 800, padding: '4px 10px', borderRadius: '6px' }}>
                              VERIFIED
                            </span>
                          )}
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(prop.id, 'PROPERTY');
                          }}
                          style={{ position: 'absolute', top: '12px', right: '12px', width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: isFav ? '#DC2626' : '#475569' }}
                        >
                          {isFav ? <FaHeart style={{ color: '#DC2626' }} /> : <FaRegHeart />}
                        </button>
                      </div>

                      {/* Card Content */}
                      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                            <FaMapMarkerAlt style={{ color: '#059669' }} />
                            <span>{prop.area ? `${prop.area}, ${prop.city}` : prop.city}</span>
                          </div>

                          <h3
                            onClick={() => onPropertyClick && onPropertyClick(prop.id)}
                            style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginBottom: '14px', lineHeight: 1.35, cursor: 'pointer' }}
                          >
                            {prop.title || `${prop.bedrooms || 2} BHK Apartment for Rent`}
                          </h3>

                          {/* Price Tag */}
                          <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', padding: '10px 14px', borderRadius: '12px', marginBottom: '16px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                            <div>
                              <div style={{ fontSize: '11px', fontWeight: 700, color: '#065F46' }}>Rent / Month</div>
                              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#047857' }}>{formattedRent}</div>
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', backgroundColor: '#FFFFFF', padding: '3px 8px', borderRadius: '6px' }}>
                              Deposit: 2 Mo.
                            </span>
                          </div>

                          {/* Specs */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '12px', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '16px' }}>
                            <div>
                              <div style={{ fontSize: '10px', color: '#94A3B8' }}>BHK</div>
                              <div>{prop.bedrooms || 2} BHK</div>
                            </div>
                            <div>
                              <div style={{ fontSize: '10px', color: '#94A3B8' }}>Bathrooms</div>
                              <div>{prop.bathrooms || 2} Bath</div>
                            </div>
                            <div>
                              <div style={{ fontSize: '10px', color: '#94A3B8' }}>Area</div>
                              <div>{prop.sqft ? `${prop.sqft} sq.ft` : '1500 sq.ft'}</div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => onPropertyClick && onPropertyClick(prop.id)}
                            style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #002B66', backgroundColor: '#FFFFFF', color: '#002B66', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => {
                              setSelectedModalProp(prop);
                              setActiveModal('book');
                            }}
                            style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: '#059669', color: '#FFFFFF', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
                          >
                            Book Visit
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* ── BOOK VISIT / ENQUIRE MODAL ─────────────────────────────────────── */}
      {activeModal && selectedModalProp && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', maxWidth: '480px', width: '100%', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative' }}>
            <button
              onClick={() => setActiveModal(null)}
              style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: 'none', fontSize: '18px', color: '#94A3B8', cursor: 'pointer' }}
            >
              <FaTimes />
            </button>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0F172A', marginBottom: '6px' }}>
              Book Visit for {selectedModalProp.title}
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px' }}>
              Schedule a site visit with our verified property advisor.
            </p>

            {modalSuccess ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <FaCheckCircle style={{ fontSize: '48px', color: '#059669', marginBottom: '12px' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>Visit Scheduled!</h4>
                <p style={{ fontSize: '13px', color: '#64748B' }}>Our agent will contact you shortly to confirm your visit time.</p>
              </div>
            ) : (
              <form onSubmit={handleModalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <input
                  type="text"
                  placeholder="Your Full Name *"
                  required
                  value={modalForm.name}
                  onChange={(e) => setModalForm(prev => ({ ...prev, name: e.target.value }))}
                  style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', outline: 'none' }}
                />
                <input
                  type="tel"
                  placeholder="Phone Number *"
                  required
                  value={modalForm.phone}
                  onChange={(e) => setModalForm(prev => ({ ...prev, phone: e.target.value }))}
                  style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', outline: 'none' }}
                />
                <input
                  type="date"
                  required
                  value={modalForm.date}
                  onChange={(e) => setModalForm(prev => ({ ...prev, date: e.target.value }))}
                  style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', outline: 'none' }}
                />
                <button
                  type="submit"
                  style={{ backgroundColor: '#059669', color: '#FFFFFF', border: 'none', padding: '14px', borderRadius: '12px', fontSize: '15px', fontWeight: 800, cursor: 'pointer', marginTop: '8px' }}
                >
                  Confirm & Schedule Visit
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default RentPropertyPage;
