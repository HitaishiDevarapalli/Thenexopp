import React, { useState, useMemo, useEffect } from 'react';
import { 
  dealersDb, 
  propertiesDb, 
  franchiseDb, 
  businessDb, 
  insuranceDb, 
  servicesDb,
  selectedCity as globalCity,
  setSelectedCity as setGlobalCity
} from '../db/marketplaceDb';
import { searchLivePlaces, geocodeLocationOnline } from '../utils/locationIntelligence';
import type { 
  Dealer
} from '../db/marketplaceDb';
import { 
  FaMapMarkerAlt, 
  FaStar, 
  FaFilter, 
  FaMap, 
  FaThLarge, 
  FaColumns, 
  FaUserTie, 
  FaShieldAlt, 
  FaMapSigns, 
  FaCompass, 
  FaLayerGroup,
  FaRedo,
  FaShoppingCart
} from 'react-icons/fa';

interface MarketplaceExplorerProps {
  onPropertyClick?: (id: string) => void;
  onBuyProperty?: (id: string) => void;
}

export const MarketplaceExplorer: React.FC<MarketplaceExplorerProps> = ({ onPropertyClick, onBuyProperty }) => {
  const [activeMarket, setActiveMarket] = useState<'properties' | 'franchises' | 'businesses' | 'finance'>('properties');
  
  // Layout Toggle State
  const [viewMode, setViewMode] = useState<'grid' | 'map' | 'split'>('split');
  
  // Refresh State for database mutations
  const [dbTick, setDbTick] = useState(0);
  const triggerRefresh = () => setDbTick(prev => prev + 1);

  useEffect(() => {
    const handleRefresh = () => triggerRefresh();
    window.addEventListener('nexopp_data_changed', handleRefresh);
    return () => window.removeEventListener('nexopp_data_changed', handleRefresh);
  }, []);

  // Filters State
  const [selectedState, setSelectedState] = useState<string>('Telangana');
  const [selectedCity, setSelectedCity] = useState<string>(globalCity === 'All India' || globalCity === 'All Cities' ? 'Hyderabad' : globalCity);

  useEffect(() => {
    const handler = () => {
      const c = localStorage.getItem('nexopp_selected_city') || 'Hyderabad';
      if (c !== 'All India' && c !== 'All Cities') {
        setSelectedCity(c);
      }
    };
    window.addEventListener('nexopp_data_changed', handler);
    return () => window.removeEventListener('nexopp_data_changed', handler);
  }, []);

  const [expLocQuery, setExpLocQuery] = useState('');
  const [expSuggestions, setExpSuggestions] = useState<any[]>([]);
  const [isExpSearching, setIsExpSearching] = useState(false);
  const [expDetecting, setExpDetecting] = useState(false);

  useEffect(() => {
    if (!expLocQuery || expLocQuery.trim().length < 2) {
      setExpSuggestions([]);
      return;
    }
    setIsExpSearching(true);
    const timer = setTimeout(() => {
      searchLivePlaces(expLocQuery).then(res => {
        setExpSuggestions(res);
        setIsExpSearching(false);
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [expLocQuery]);

  const handleExpDetectGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setExpDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const geo = await geocodeLocationOnline(`${latitude}, ${longitude}`);
        const newCity = geo.city || geo.area || 'Guntur';
        setSelectedCity(newCity);
        setGlobalCity(newCity);
        setExpDetecting(false);
      },
      () => {
        setExpDetecting(false);
        alert("Unable to retrieve your location. Please check browser permissions.");
      }
    );
  };

  const [selectedArea, setSelectedArea] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedBudget, setSelectedBudget] = useState<number>(300); // Max Lakhs slider
  const [buySellRent, setBuySellRent] = useState<string>('All');
  const [selectedRadius, setSelectedRadius] = useState<number>(10); // KM
  
  // Checkbox Filters
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [topRatedOnly, setTopRatedOnly] = useState(false);
  const [premiumOnly, setPremiumOnly] = useState(false);
  
  // Sorting State
  const [sortBy, setSortBy] = useState<string>('featured'); // newest, price-asc, price-desc, rating

  // Map Visual Style Overlay Layers
  const [mapLayer, setMapLayer] = useState<'street' | 'satellite' | 'traffic'>('street');
  const [selectedPin, setSelectedPin] = useState<any | null>(null);
  const [heatmapView, setHeatmapView] = useState(false);
  const [showTraffic, setShowTraffic] = useState(false);
  const [showDealerProfile, setShowDealerProfile] = useState<Dealer | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number }>({ lat: 17.4483, lon: 78.3741 });

  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => console.log("Geolocation denied or unavailable, using default coordinates.")
      );
    }
  }, []);

  // Hardcoded coordinate hubs for radius calculations
  const cityCoordinates: { [key: string]: { lat: number; lon: number } } = {
    'Hyderabad': { lat: 17.4483, lon: 78.3741 },
    'Guntur': { lat: 16.3067, lon: 80.4363 },
    'Vijayawada': { lat: 16.5062, lon: 80.6480 },
    'Visakhapatnam': { lat: 17.6868, lon: 83.2185 },
    'Bengaluru': { lat: 12.9716, lon: 77.5946 },
  };

  // Helper formula to calculate approximate Distance (Haversine KM)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // radius of Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getCustomerDistance = (lat?: number, lon?: number) => {
    if (!lat || !lon) return '1.2 km away';
    const dist = calculateDistance(userLocation.lat, userLocation.lon, lat, lon);
    return dist < 1 ? `${(dist * 1000).toFixed(0)} m away` : `${dist.toFixed(1)} km away`;
  };

  // Helper to resolve dealer detail
  const getDealer = (id: string): Dealer | undefined => {
    return dealersDb.find(d => d.id === id);
  };

  // Filters application for properties
  const filteredProperties = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    dbTick; // dependency hook
    const hub = cityCoordinates[selectedCity] || { lat: 0, lon: 0 };
    
    let items = [...propertiesDb];

    // Priority sorting filter (Trust Score & High Ratings appear first)
    items.sort((a, b) => {
      const aScore = (a.rating > 4.8 ? 100 : 0) + (a.verified ? 50 : 0);
      const bScore = (b.rating > 4.8 ? 100 : 0) + (b.verified ? 50 : 0);
      return bScore - aScore;
    });

    return items.filter(item => {
      // Location state/city matching
      if (selectedCity && selectedCity !== 'All India' && selectedCity !== 'All Cities') {
        if (item.city !== selectedCity && item.district !== selectedCity && !item.area?.includes(selectedCity)) {
          const dist = calculateDistance(hub.lat, hub.lon, item.latitude, item.longitude);
          if (dist > selectedRadius) return false;
        }
      }
      
      // Area Subcategory
      if (selectedArea !== 'All' && item.area !== selectedArea) return false;
      
      // Property type
      if (selectedType !== 'All' && item.category !== selectedType) return false;
      
      // Budget cap
      if (item.price > selectedBudget) return false;
      
      // Buy/Sell/Rent
      if (buySellRent !== 'All' && item.status !== buySellRent) return false;
      
      // Badges check
      if (verifiedOnly && !item.verified) return false;
      if (premiumOnly && !item.premium) return false;
      if (topRatedOnly && item.rating < 4.8) return false;
      
      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0; // default priority sorting
    });
  }, [selectedState, selectedCity, selectedArea, selectedType, selectedBudget, buySellRent, selectedRadius, verifiedOnly, premiumOnly, topRatedOnly, sortBy, dbTick]);

  // Franchise listings filter
  const filteredFranchises = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    dbTick;
    return franchiseDb.filter(fran => {
      if (selectedCity && selectedCity !== 'All India' && selectedCity !== 'All Cities') {
        if (fran.city !== selectedCity && !fran.location?.includes(selectedCity)) return false;
      }
      if (verifiedOnly && !fran.verified) return false;
      if (topRatedOnly && fran.rating < 4.8) return false;
      return true;
    });
  }, [selectedState, selectedCity, verifiedOnly, topRatedOnly, dbTick]);

  // Business listings filter
  const filteredBusinesses = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    dbTick;
    return businessDb.filter(biz => {
      if (selectedCity && selectedCity !== 'All India' && selectedCity !== 'All Cities') {
        if (biz.city !== selectedCity && !biz.location?.includes(selectedCity)) return false;
      }
      if (verifiedOnly && !biz.verified) return false;
      if (topRatedOnly && biz.rating < 4.8) return false;
      return true;
    });
  }, [selectedState, selectedCity, verifiedOnly, topRatedOnly, dbTick]);

  // Insurance desk filters
  const filteredInsurance = useMemo(() => {
    return insuranceDb.filter(ins => {
      if (ins.state !== selectedState) return false;
      if (ins.city !== selectedCity) return false;
      if (verifiedOnly && !ins.verified) return false;
      return true;
    });
  }, [selectedState, selectedCity, verifiedOnly]);

  // Services desk filters
  const filteredServices = useMemo(() => {
    return servicesDb.filter(serv => {
      if (serv.state !== selectedState) return false;
      if (serv.city !== selectedCity) return false;
      if (verifiedOnly && !serv.verified) return false;
      return true;
    });
  }, [selectedState, selectedCity, verifiedOnly]);

  // Dynamic nearby city check (triggers when inventory is low in selected city)
  const nearbySuggestions = useMemo(() => {
    if (activeMarket !== 'properties' || filteredProperties.length >= 2) return [];
    
    // Hardcoded nearby recommendations mapping
    const suggestionsConfig: { [city: string]: { name: string; count: number; dist: number }[] } = {
      'Guntur': [
        { name: 'Vijayawada', count: 12, dist: 32 },
        { name: 'Hyderabad', count: 24, dist: 270 }
      ],
      'Vijayawada': [
        { name: 'Guntur', count: 6, dist: 32 }
      ]
    };
    return suggestionsConfig[selectedCity] || [];
  }, [activeMarket, filteredProperties.length, selectedCity]);

  // Active dataset summary computed metrics
  const summaryMetrics = useMemo(() => {
    const total = filteredProperties.length;
    const topRated = filteredProperties.filter(p => p.rating >= 4.8).length;
    const hasBestSeller = filteredProperties.some(p => p.bestSeller);
    return { total, topRated, hasBestSeller };
  }, [filteredProperties]);

  return (
    <section className="section-padding explorer-portal-section">
      <div className="container">
        <span className="section-tag text-center">Interactive Discovery</span>
        <h2 className="section-title text-center">Unified Marketplace Explorer</h2>
        <p className="section-subtitle text-center">
          Compare assets and consult with certified dealers. View live radius mappings and trust metrics on an enterprise interactive layout.
        </p>

        {/* Dynamic tabs navigation */}
        <div className="explorer-market-tabs">
          <button className={`tab-btn ${activeMarket === 'properties' ? 'active' : ''}`} onClick={() => setActiveMarket('properties')}>Properties Portal</button>
          <button className={`tab-btn ${activeMarket === 'franchises' ? 'active' : ''}`} onClick={() => setActiveMarket('franchises')}>Franchise Hub</button>
          <button className={`tab-btn ${activeMarket === 'businesses' ? 'active' : ''}`} onClick={() => setActiveMarket('businesses')}>Business Registry</button>
          <button className={`tab-btn ${activeMarket === 'finance' ? 'active' : ''}`} onClick={() => setActiveMarket('finance')}>Finance & Services</button>
        </div>

        <div className="explorer-dashboard-grid">
            {/* Left Column: Advanced Search & Filtering Console */}
            <div className="explorer-filters-card premium-card">
              <div className="filter-header">
                <h3><FaFilter /> Search Parameters</h3>
                <button className="clear-filters-btn" onClick={() => {
                  setSelectedState('Andhra Pradesh');
                  setSelectedCity('Guntur');
                  setSelectedArea('All');
                  setSelectedType('All');
                  setSelectedBudget(300);
                  setBuySellRent('All');
                  setSelectedRadius(10);
                  setVerifiedOnly(false);
                  setTopRatedOnly(false);
                  setPremiumOnly(false);
                }}><FaRedo /> Reset</button>
              </div>

              {/* Live Location Picker & GPS (Replaces Manual Selects) */}
              <div className="filter-group" style={{ position: 'relative' }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0F172A', fontWeight: 700 }}><FaMapMarkerAlt style={{ color: '#10B981' }} /> Target Location</span>
                  <button
                    type="button"
                    onClick={handleExpDetectGPS}
                    disabled={expDetecting}
                    style={{ background: 'none', border: 'none', color: '#059669', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <FaCompass /> {expDetecting ? 'Detecting...' : 'Use Live GPS'}
                  </button>
                </label>
                <input
                  type="text"
                  value={expLocQuery}
                  onChange={e => setExpLocQuery(e.target.value)}
                  placeholder={selectedCity ? `${selectedCity} (Search area or city...)` : "Search city, locality, or road..."}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', outline: 'none' }}
                />
                {isExpSearching && (
                  <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '4px', fontWeight: 600 }}>Searching live places...</div>
                )}
                {expSuggestions.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, backgroundColor: '#FFF', border: '1px solid #CBD5E1', borderRadius: '8px', boxShadow: '0 10px 20px rgba(0,0,0,0.15)', maxHeight: '200px', overflowY: 'auto', marginTop: '4px' }}>
                    {expSuggestions.map((sug, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          const c = sug.city || sug.area || sug.formatted_address.split(',')[0];
                          setSelectedCity(c);
                          setGlobalCity(c);
                          setExpSuggestions([]);
                          setExpLocQuery('');
                        }}
                        style={{ padding: '10px 12px', borderBottom: '1px solid #F1F5F9', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#ECFDF5'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FFF'}
                      >
                        <FaMapMarkerAlt style={{ color: '#059669', flexShrink: 0 }} />
                        <div>
                          <span>{sug.area || sug.city}</span> <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 400 }}>({sug.formatted_address})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {activeMarket === 'properties' && (
                <>
                  <div className="filter-group">
                    <label>Property Category</label>
                    <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                      <option value="All">All Categories</option>
                      <option value="Apartment">Apartments</option>
                      <option value="Villa">Villas</option>
                      <option value="House">Houses</option>
                      <option value="Plot">Plots</option>
                      <option value="Commercial">Commercial Spaces</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <label>Radius Search (Selected Hub)</label>
                    <select value={selectedRadius} onChange={(e) => setSelectedRadius(parseInt(e.target.value))}>
                      <option value={2}>Within 2 KM</option>
                      <option value={5}>Within 5 KM</option>
                      <option value={10}>Within 10 KM</option>
                      <option value={20}>Within 20 KM</option>
                      <option value={50}>Within 50 KM</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <div className="slider-label-row">
                      <label>Maximum Price Cap</label>
                      <span className="slider-val">₹{selectedBudget} Lakhs</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="300" 
                      value={selectedBudget} 
                      onChange={(e) => setSelectedBudget(parseInt(e.target.value))}
                      className="budget-slider"
                    />
                  </div>

                  <div className="filter-group">
                    <label>Ecosystem Transaction Mode</label>
                    <div className="radio-group-tabs">
                      <button className={`radio-tab ${buySellRent === 'All' ? 'active' : ''}`} onClick={() => setBuySellRent('All')}>All</button>
                      <button className={`radio-tab ${buySellRent === 'Buy' ? 'active' : ''}`} onClick={() => setBuySellRent('Buy')}>Buy</button>
                      <button className={`radio-tab ${buySellRent === 'Sell' ? 'active' : ''}`} onClick={() => setBuySellRent('Sell')}>Sell</button>
                      <button className={`radio-tab ${buySellRent === 'Rent' ? 'active' : ''}`} onClick={() => setBuySellRent('Rent')}>Rent</button>
                    </div>
                  </div>
                </>
              )}

              <div className="filter-group checkbox-filters-group">
                <label className="checkbox-label">
                  <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} />
                  <span>Verified Listings Only</span>
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" checked={topRatedOnly} onChange={(e) => setTopRatedOnly(e.target.checked)} />
                  <span>Top Rated (⭐ 4.8+)</span>
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" checked={premiumOnly} onChange={(e) => setPremiumOnly(e.target.checked)} />
                  <span>Premium Partner Items</span>
                </label>
              </div>

              <div className="filter-group">
                <label>Sort Order</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="featured">Featured Priorities</option>
                  <option value="newest">Newest Registries</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Vetted Rating</option>
                </select>
              </div>
            </div>

            {/* Right Column: Search Results Dashboard & Map */}
            <div className="explorer-dashboard-results">
              {/* Header result counts and view toggles */}
              <div className="results-toolbar-header">
                {activeMarket === 'properties' && (
                  <div className="toolbar-stats-summary">
                    Showing <strong className="gold-text">{summaryMetrics.total} Properties</strong> in {selectedCity}
                    {summaryMetrics.topRated > 0 && <span className="stat-pill"><FaStar /> {summaryMetrics.topRated} Top Vetted</span>}
                    {summaryMetrics.hasBestSeller && <span className="stat-pill b-seller">🏆 Best Seller</span>}
                  </div>
                )}
                {activeMarket === 'franchises' && <div className="toolbar-stats-summary">Available Franchise Outlets: <strong className="gold-text">{filteredFranchises.length}</strong> in {selectedCity}</div>}
                {activeMarket === 'businesses' && <div className="toolbar-stats-summary">Cash-Flowing Acquisitions: <strong className="gold-text">{filteredBusinesses.length}</strong> in {selectedCity}</div>}
                {activeMarket === 'finance' && <div className="toolbar-stats-summary">Affiliated Financial Providers: <strong className="gold-text">{filteredInsurance.length + filteredServices.length}</strong></div>}

                <div className="view-mode-toggle-group">
                  <button className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}><FaThLarge /> Grid</button>
                  <button className={`view-toggle-btn ${viewMode === 'map' ? 'active' : ''}`} onClick={() => setViewMode('map')}><FaMap /> Full Map</button>
                  <button className={`view-toggle-btn ${viewMode === 'split' ? 'active' : ''}`} onClick={() => setViewMode('split')}><FaColumns /> Split Screen</button>
                </div>
              </div>

              {/* Layout Display Wrapper */}
              <div className={`explorer-view-wrapper mode-${viewMode}`}>
                
                {/* Visual Map Canvas Representation */}
                {(viewMode === 'map' || viewMode === 'split') && (
                  <div className="interactive-map-canvas-container premium-card">
                    {/* Layer Controls */}
                    <div className="map-layer-selector">
                      <button className={`layer-btn ${mapLayer === 'street' ? 'active' : ''}`} onClick={() => setMapLayer('street')}><FaCompass /> Map View</button>
                      <button className={`layer-btn ${mapLayer === 'satellite' ? 'active' : ''}`} onClick={() => setMapLayer('satellite')}><FaLayerGroup /> Satellite</button>
                      <button className={`layer-btn ${mapLayer === 'traffic' ? 'active' : ''}`} onClick={() => { setMapLayer('traffic'); setShowTraffic(!showTraffic); }}><FaMapSigns /> Traffic</button>
                      <button className={`layer-btn ${heatmapView ? 'active' : ''}`} onClick={() => setHeatmapView(!heatmapView)}><FaLayerGroup /> Heatmap</button>
                    </div>

                    {/* SVG Map Layout View representing city plots */}
                    <div className={`map-grid-layer ${mapLayer}`}>
                      {showTraffic && <div className="animated-traffic-lines"></div>}
                      {heatmapView && <div className="density-heatmap-overlay"></div>}
                      
                      {/* Grid background */}
                      <div className="map-vector-routes"></div>

                      {/* Map Pins Plotting based on listing coords */}
                      {activeMarket === 'properties' && filteredProperties.map((prop) => {
                        // Plot relative map coordinate positions
                        const relativeLeft = ((prop.longitude - 77.0) * 8.5) % 100;
                        const relativeTop = ((18.5 - prop.latitude) * 11.5) % 100;
                        
                        return (
                          <button 
                            key={prop.id} 
                            className={`map-interactive-pin ${selectedPin?.id === prop.id ? 'pin-active' : ''}`}
                            style={{ left: `${Math.abs(relativeLeft)}%`, top: `${Math.abs(relativeTop)}%` }}
                            onClick={() => setSelectedPin(prop)}
                          >
                            <FaMapMarkerAlt />
                            <span className="pin-price-lbl">₹{prop.price >= 100 ? `${(prop.price/100).toFixed(1)}Cr` : `${prop.price}L`}</span>
                          </button>
                        );
                      })}

                      {activeMarket === 'franchises' && filteredFranchises.map((fran) => {
                        const relativeLeft = ((fran.longitude - 77.0) * 8.5) % 100;
                        const relativeTop = ((18.5 - fran.latitude) * 11.5) % 100;
                        
                        return (
                          <button 
                            key={fran.id} 
                            className="map-interactive-pin"
                            style={{ left: `${Math.abs(relativeLeft)}%`, top: `${Math.abs(relativeTop)}%` }}
                            onClick={() => setSelectedPin(fran)}
                          >
                            <FaMapMarkerAlt className="pin-gold" />
                            <span className="pin-price-lbl">{fran.logo} {fran.brand}</span>
                          </button>
                        );
                      })}

                      {activeMarket === 'businesses' && filteredBusinesses.map((biz) => {
                        const relativeLeft = ((biz.longitude - 77.0) * 8.5) % 100;
                        const relativeTop = ((18.5 - biz.latitude) * 11.5) % 100;
                        
                        return (
                          <button 
                            key={biz.id} 
                            className="map-interactive-pin"
                            style={{ left: `${Math.abs(relativeLeft)}%`, top: `${Math.abs(relativeTop)}%` }}
                            onClick={() => setSelectedPin(biz)}
                          >
                            <FaMapMarkerAlt className="pin-dark" />
                            <span className="pin-price-lbl">₹{biz.price}L</span>
                          </button>
                        );
                      })}

                      {/* Fallback Pin Popover Detail Panel overlay */}
                      {selectedPin && (
                        <div className="map-pin-overlay-popover glass-card">
                          <button className="popover-close-btn" onClick={() => setSelectedPin(null)}>&times;</button>
                          <div className="popover-flex">
                            <img src={selectedPin.image || '/assets/luxury_apartment.png'} alt="" className="popover-img" />
                            <div className="popover-details">
                              <span className="popover-status">{selectedPin.category || selectedPin.type || 'Ecosystem Listing'}</span>
                              <h4>{selectedPin.title || selectedPin.brand || selectedPin.name}</h4>
                              <p className="popover-price">{selectedPin.priceDisplay || selectedPin.investmentDisplay || `₹${selectedPin.price} Lakhs`}</p>
                              <div className="popover-rating"><FaStar /> {selectedPin.rating} ({selectedPin.reviewCount || 12} reviews)</div>
                              
                              {selectedPin.dealerId && (
                                <button className="popover-dealer-btn" onClick={() => {
                                  const d = getDealer(selectedPin.dealerId);
                                  if (d) setShowDealerProfile(d);
                                }}>
                                  Dealer: {getDealer(selectedPin.dealerId)?.companyName}
                                </button>
                              )}

                              <button className="btn btn-gold popover-details-btn" onClick={() => {
                                alert(`Opening secure registry details for ${selectedPin.title || selectedPin.brand || selectedPin.name}`);
                              }}>
                                View Vetted Details
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Grid Lists layout panels */}
                {(viewMode === 'grid' || viewMode === 'split') && (
                  <div className="listings-scroll-container">
                    
                    {/* Dynamic low inventory alerts nearby recommendations */}
                    {nearbySuggestions.length > 0 && (
                      <div className="low-inventory-alert-box premium-card">
                        <h4>⚠️ Limited Options in {selectedCity}</h4>
                        <p>We found higher availability in these nearby locations within reach:</p>
                        <div className="nearby-suggestions-flex">
                          {nearbySuggestions.map((sug, idx) => (
                            <button key={idx} className="nearby-suggestion-card glass-card" onClick={() => {
                              setSelectedCity(sug.name);
                            }}>
                              <strong>{sug.name}</strong>
                              <span>{sug.count} Listings • {sug.dist} KM Away</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Properties List */}
                    {activeMarket === 'properties' && (
                      <div className="property-feed-list">
                        {filteredProperties.length === 0 ? (
                          <div className="no-listings-fallback">No property listings match your selected parameters. Select Guntur or Hyderabad for more listings.</div>
                        ) : (
                          filteredProperties.map((prop) => (
                            <div key={prop.id} className="listing-card-premium premium-card landscape-card">
                              <div className="card-image-wrap">
                                <img 
                                  src={prop.image} 
                                  alt={prop.title} 
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => onPropertyClick?.(prop.id)}
                                />
                                <button 
                                  className="buy-now-badge"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onBuyProperty?.(prop.id);
                                  }}
                                >
                                  <FaShoppingCart /> Buy
                                </button>
                                <div className="card-badges">
                                  {(prop.sold || prop.approvalStatus === 'Sold' || prop.listingStatus === 'Sold') && (
                                    <span style={{ backgroundColor: '#DC2626', color: '#FFFFFF', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', boxShadow: '0 2px 8px rgba(220, 38, 38, 0.4)', zIndex: 10, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>SOLD</span>
                                  )}
                                  {prop.verified && <span className="badge verified">Verified</span>}
                                  {prop.premium && <span className="badge premium">Premium</span>}
                                  {prop.trending && <span className="badge trending">Trending</span>}
                                </div>
                                <span className="availability-badge">Qty: {prop.availabilityCount} available</span>
                              </div>
                              <div className="card-body-wrap">
                                <div className="card-meta-row">
                                  <span className="card-type">{prop.category}</span>
                                  <span className="card-rating"><FaStar /> {prop.rating} ({prop.reviewCount})</span>
                                </div>
                                <h3 
                                  className="card-title-text" 
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => onPropertyClick?.(prop.id)}
                                >
                                  {prop.title}
                                </h3>
                                <p className="card-location-text" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                  <span>{prop.area}, {prop.city}</span>
                                  <span style={{ padding: '2px 8px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600', border: '1px solid rgba(16, 185, 129, 0.3)' }}>Distance: {getCustomerDistance(prop.latitude, prop.longitude)}</span>
                                </p>
                                
                                <div className="card-bottom-flex">
                                  <div className="card-price-block">
                                    <span className="label">Ecosystem Price</span>
                                    <span className="price-val">{prop.priceDisplay}</span>
                                  </div>
                                  <div className="card-action-block">
                                    <button className="btn btn-secondary card-dir-btn" onClick={() => alert(`Calculating route distance to ${prop.title} from your location...`)}>
                                      <FaMapSigns /> Coords
                                    </button>
                                    <button className="btn btn-gold card-view-btn" onClick={() => onPropertyClick?.(prop.id)}>
                                      Explore
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* Franchises List */}
                    {activeMarket === 'franchises' && (
                      <div className="property-feed-list">
                        {filteredFranchises.length === 0 ? (
                          <div className="no-listings-fallback">No franchise brand listing matches.</div>
                        ) : (
                          filteredFranchises.map((fran) => (
                            <div key={fran.id} className="listing-card-premium premium-card landscape-card">
                              <div className="card-image-wrap">
                                <img src={fran.image} alt={fran.brand} />
                                <button 
                                  className="buy-now-badge"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onBuyProperty?.(fran.id);
                                  }}
                                >
                                  <FaShoppingCart /> Buy
                                </button>
                                <div className="card-badges">
                                  {fran.verified && <span className="badge verified">Verified</span>}
                                  {fran.trending && <span className="badge trending">Trending</span>}
                                </div>
                              </div>
                              <div className="card-body-wrap">
                                <div className="card-meta-row">
                                  <span className="card-type">{fran.type}</span>
                                  <span className="card-rating"><FaStar /> {fran.rating} ({fran.reviewCount})</span>
                                </div>
                                <h3 className="card-title-text">{fran.brand}</h3>
                                <p className="card-location-text" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                  <span>{fran.location}</span>
                                  <span style={{ padding: '2px 8px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600', border: '1px solid rgba(16, 185, 129, 0.3)' }}>Distance: {getCustomerDistance(fran.latitude, fran.longitude)}</span>
                                </p>
                                
                                <div className="card-bottom-flex">
                                  <div className="card-price-block">
                                    <span className="label">Required Investment</span>
                                    <span className="price-val">{fran.investmentDisplay}</span>
                                  </div>
                                  <button className="btn btn-gold" onClick={() => alert(`Requesting franchise kit for ${fran.brand}`)}>
                                    Contact Brand
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* Businesses List */}
                    {activeMarket === 'businesses' && (
                      <div className="property-feed-list">
                        {filteredBusinesses.length === 0 ? (
                          <div className="no-listings-fallback">No business acquisition options match.</div>
                        ) : (
                          filteredBusinesses.map((biz) => (
                            <div key={biz.id} className="listing-card-premium premium-card landscape-card">
                              <div className="card-image-wrap">
                                <img src={biz.image} alt={biz.name} />
                                <button 
                                  className="buy-now-badge"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onBuyProperty?.(biz.id);
                                  }}
                                >
                                  <FaShoppingCart /> Buy
                                </button>
                                <div className="card-badges">
                                  {biz.verified && <span className="badge verified">Verified</span>}
                                  {biz.trending && <span className="badge trending">Trending</span>}
                                </div>
                              </div>
                              <div className="card-body-wrap">
                                <div className="card-meta-row">
                                  <span className="card-type">{biz.industry}</span>
                                  <span className="card-rating"><FaStar /> {biz.rating} ({biz.reviewCount})</span>
                                </div>
                                <h3 className="card-title-text">{biz.name}</h3>
                                <p className="card-location-text" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                  <span>{biz.location}</span>
                                  <span style={{ padding: '2px 8px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600', border: '1px solid rgba(16, 185, 129, 0.3)' }}>Distance: {getCustomerDistance(biz.latitude, biz.longitude)}</span>
                                </p>
                                
                                <div className="card-bottom-flex">
                                  <div className="card-price-block">
                                    <span className="label">Acquisition Price</span>
                                    <span className="price-val">{biz.priceDisplay}</span>
                                  </div>
                                  <button className="btn btn-gold" onClick={() => alert(`Opening escrow evaluation profile for ${biz.name}`)}>
                                    Acquire
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* Finance split list */}
                    {activeMarket === 'finance' && (
                      <div className="finance-services-explorer-grid">
                        <div className="finance-sub-explorer">
                          <h4 className="flex-sub-title"><FaShieldAlt /> Vetted Insurance Desks</h4>
                          <div className="listings-vertical-list">
                            {filteredInsurance.map((ins) => (
                              <div key={ins.id} className="service-card-explorer glass-card">
                                <div>
                                  <h4 className="service-p-name">{ins.name}</h4>
                                  <span className="service-p-cat">{ins.category} Insurance</span>
                                  <p className="service-p-desc">{ins.coverageAmount} • {ins.claimProcess}</p>
                                </div>
                                <div className="service-p-right">
                                  <span className="price">{ins.premiumStartingPrice}</span>
                                  <span className="rating"><FaStar /> {ins.rating}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="finance-sub-explorer">
                          <h4 className="flex-sub-title"><FaUserTie /> Verified Professional Advisory</h4>
                          <div className="listings-vertical-list">
                            {filteredServices.map((serv) => (
                              <div key={serv.id} className="service-card-explorer glass-card">
                                <div>
                                  <h4 className="service-p-name">{serv.name}</h4>
                                  <span className="service-p-cat">{serv.category}</span>
                                  <p className="service-p-desc">Experience: {serv.experience} Years Vetted Practice</p>
                                </div>
                                <div className="service-p-right">
                                  <span className="rating"><FaStar /> {serv.rating}</span>
                                  <button className="btn-text-link" onClick={() => alert(`Booking legal call consultation with ${serv.name}`)}>Book Call</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
      </div>

      {/* Dealer Profile Modal Overlay Detail */}
      {showDealerProfile && (
        <div className="dealer-profile-modal-overlay">
          <div className="dealer-profile-sheet premium-card">
            <button className="popover-close-btn" onClick={() => setShowDealerProfile(null)}>&times;</button>
            <div className="dealer-header-flex">
              <img src={showDealerProfile.photo} alt={showDealerProfile.companyName} className="dealer-photo" />
              <div className="dealer-main-info">
                <span className="dealer-tag-badge">🏆 Verified Partner Dealer</span>
                <h2>{showDealerProfile.companyName}</h2>
                <div className="dealer-rating-row">
                  <FaStar /> <span>{showDealerProfile.rating} ({showDealerProfile.reviewCount} Vetted Reviews)</span>
                </div>
              </div>
            </div>
            
            <div className="dealer-stats-grid">
              <div className="d-stat">
                <span className="label">Broker Experience</span>
                <span className="value">{showDealerProfile.yearsExperience} Years</span>
              </div>
              <div className="d-stat">
                <span className="label">Response Rating</span>
                <span className="value">{showDealerProfile.responseTime}</span>
              </div>
              <div className="d-stat">
                <span className="label">Registered Inventory</span>
                <span className="value">{showDealerProfile.inventoryCount} Assets</span>
              </div>
            </div>

            <div className="dealer-coverage-section">
              <h4>Ecosystem Geographic Coverage</h4>
              <div className="coverage-locations-flex">
                {Object.entries(showDealerProfile.coverage).map(([city, count]) => (
                  <div key={city} className="coverage-badge-item glass-card">
                    <strong>{city}</strong>
                    <span>({count} listings)</span>
                  </div>
                ))}
              </div>
            </div>

            <button className="btn btn-gold w-full mt-4" onClick={() => alert(`Sending priority message to ${showDealerProfile.companyName}`)}>
              Message Representative Now
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default MarketplaceExplorer;
