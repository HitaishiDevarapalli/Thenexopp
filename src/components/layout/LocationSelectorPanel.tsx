import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FaSearch,
  FaCrosshairs,
  FaHistory,
  FaMapMarkerAlt,
  FaTimes,
  FaSpinner,
  FaChevronRight,
  FaFire,
  FaCity,
  FaCompass,
} from 'react-icons/fa';
import { useLocationStore, type LocationData } from '../../context/LocationContext';
import { useLocationStore as useZustandLocationStore } from '../../store/useLocationStore';

interface LocationSelectorPanelProps {
  onClose: () => void;
}

export const LocationSelectorPanel: React.FC<LocationSelectorPanelProps> = ({ onClose }) => {
  const { setLocation: setContextLocation, recentLocations, clearRecentLocations } = useLocationStore();
  const setZustandLocation = useZustandLocationStore(state => state.setLocation);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [popularCities, setPopularCities] = useState<any[]>([]);
  const [trendingLocations, setTrendingLocations] = useState<any[]>([]);
  const [nearbyLocations, setNearbyLocations] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  
  // Pagination & Infinite Scroll State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Keyboard navigation state
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const modalRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Focus search input on mount & lock body scroll
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Fetch Popular Cities & Trending Locations on mount
  useEffect(() => {
    fetch('/api/location/popular')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setPopularCities(data.data);
        }
      })
      .catch(() => {});

    fetch('/api/location/trending')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setTrendingLocations(data.data);
        }
      })
      .catch(() => {});
  }, []);

  // 250ms Debounced Live Search with AbortController
  useEffect(() => {
    const trimmed = query.trim();
    setSelectedIndex(-1);

    if (trimmed.length < 1) {
      setResults([]);
      setPage(1);
      setHasMore(false);
      setLoading(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);

    const timer = setTimeout(() => {
      const latParam = userCoords ? `&lat=${userCoords.lat}&lng=${userCoords.lng}` : '';
      fetch(`/api/location/search?q=${encodeURIComponent(trimmed)}&page=1&limit=20${latParam}`, {
        signal: controller.signal,
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setResults(data.data || []);
            setPage(1);
            setHasMore(data.hasMore || false);
          }
        })
        .catch(err => {
          if (err.name !== 'AbortError') {
            console.error('Search error:', err);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, userCoords]);

  // Load More (Infinite Scroll) handler
  const loadMoreResults = useCallback(() => {
    if (!hasMore || loadingMore || loading || !query.trim()) return;

    setLoadingMore(true);
    const nextPage = page + 1;
    const latParam = userCoords ? `&lat=${userCoords.lat}&lng=${userCoords.lng}` : '';

    fetch(`/api/location/search?q=${encodeURIComponent(query.trim())}&page=${nextPage}&limit=20${latParam}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setResults(prev => [...prev, ...(data.data || [])]);
          setPage(nextPage);
          setHasMore(data.hasMore || false);
        }
      })
      .catch(err => console.error('Load more error:', err))
      .finally(() => setLoadingMore(false));
  }, [hasMore, loadingMore, loading, page, query, userCoords]);

  // Scroll listener for Infinite Scroll
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    if (scrollHeight - scrollTop - clientHeight < 80) {
      loadMoreResults();
    }
  };

  // Select Location Handler
  const handleSelectLocation = (locItem: any) => {
    const cityName = locItem.city || locItem.name || 'Guntur';
    const districtName = locItem.district || cityName;
    const areaName = locItem.locality || (locItem.name !== cityName ? locItem.name : '');
    const latVal = locItem.latitude || locItem.lat || 16.3067;
    const lngVal = locItem.longitude || locItem.lng || 80.4365;

    const locData: LocationData = {
      id: locItem.id || locItem.slug,
      name: locItem.name,
      type: locItem.type || 'City',
      displayName: locItem.displayName || [locItem.name, locItem.city, locItem.state].filter(Boolean).join(', '),
      city: cityName,
      locality: areaName,
      district: districtName,
      state: locItem.state || 'Andhra Pradesh',
      country: locItem.country || 'India',
      pincode: locItem.pincode || '',
      lat: latVal,
      lng: lngVal,
      listingCount: locItem.listingCount || 0,
      distanceKm: locItem.distanceKm || null,
    };

    // Update Context and Zustand store
    setContextLocation(locData);
    setZustandLocation(cityName, districtName, areaName, latVal, lngVal);

    onClose();
  };

  // GPS Geolocation Detector & Nearby Locations Fetcher
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async pos => {
        try {
          const { latitude, longitude } = pos.coords;
          setUserCoords({ lat: latitude, lng: longitude });

          // Fetch nearby locations from local database API
          const res = await fetch(`/api/location/nearby?lat=${latitude}&lng=${longitude}&radius=50`);
          const data = await res.json();

          if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            setNearbyLocations(data.data.slice(0, 6));
            // Auto select nearest locality/city
            handleSelectLocation(data.data[0]);
            return;
          }

          // Fallback reverse geocoding via Nominatim
          try {
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=jsonv2`
            );
            const geoData = await geoRes.json();
            if (geoData && geoData.address) {
              const addr = geoData.address;
              const cityName = addr.city || addr.town || addr.village || addr.county || addr.state || 'Detected Location';
              handleSelectLocation({
                name: cityName,
                displayName: geoData.display_name || `${cityName}, India`,
                city: cityName,
                locality: addr.suburb || addr.neighbourhood || '',
                state: addr.state || '',
                country: addr.country || 'India',
                latitude,
                longitude,
              });
              return;
            }
          } catch (e) {}

          // Final graceful fallback if external reverse geocoding is offline/blocked
          handleSelectLocation({
            name: 'Current Location',
            displayName: `Current Location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`,
            city: 'My Location',
            locality: 'GPS Position',
            state: 'India',
            country: 'India',
            latitude,
            longitude,
          });
        } catch (err) {
          console.error('GPS error:', err);
          handleSelectLocation({
            name: 'Current Location',
            displayName: 'Current Location (GPS)',
            city: 'My Location',
            locality: '',
            state: 'India',
            country: 'India',
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        } finally {
          setDetecting(false);
        }
      },
      (err) => {
        setDetecting(false);
        if (err.code === 1) {
          alert('Location access was denied. Please allow location permission in browser settings.');
        } else {
          alert('Could not retrieve GPS position. Please select location manually.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Full Keyboard Navigation (Up, Down, Enter, Escape, Tab)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }

    if (query.trim().length >= 1 && results.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelectLocation(results[selectedIndex]);
        } else if (results.length > 0) {
          handleSelectLocation(results[0]);
        }
      }
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUpMobile {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes modalScale {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        .location-modal-container {
          width: 100%;
          max-width: 520px;
          height: 650px;
          max-height: 90vh;
          background-color: #FFFFFF;
          border-radius: 20px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
          animation: modalScale 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @media (max-width: 640px) {
          .location-modal-container {
            max-width: 100%;
            height: 85vh;
            border-radius: 24px 24px 0 0;
            position: absolute;
            bottom: 0;
            animation: slideUpMobile 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #CBD5E1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94A3B8;
        }
      `}</style>

      <div ref={modalRef} className="location-modal-container" onKeyDown={handleKeyDown}>
        {/* Sticky Header with Search Bar & Close Button */}
        <div
          style={{
            padding: '18px 20px',
            borderBottom: '1px solid #F1F5F9',
            backgroundColor: '#FFFFFF',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  backgroundColor: '#ECFDF5',
                  color: '#10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '15px',
                }}
              >
                <FaCompass />
              </div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>Select Location</h3>
            </div>
            <button
              onClick={onClose}
              aria-label="Close modal"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748B',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#F1F5F9';
                e.currentTarget.style.color = '#0F172A';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#F8FAFC';
                e.currentTarget.style.color = '#64748B';
              }}
            >
              <FaTimes style={{ fontSize: '14px' }} />
            </button>
          </div>

          {/* Search Input Field */}
          <div style={{ position: 'relative' }}>
            <FaSearch
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94A3B8',
                fontSize: '15px',
              }}
            />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search city, area or locality..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{
                width: '100%',
                height: '48px',
                padding: '0 42px 0 46px',
                borderRadius: '14px',
                border: '1.5px solid #E2E8F0',
                fontSize: '14.5px',
                fontWeight: 500,
                color: '#0F172A',
                outline: 'none',
                backgroundColor: '#F8FAFC',
                boxSizing: 'border-box',
                transition: 'all 0.2s ease',
              }}
              onFocus={e => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.borderColor = '#10B981';
                e.currentTarget.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.12)';
              }}
              onBlur={e => {
                e.currentTarget.style.backgroundColor = '#F8FAFC';
                e.currentTarget.style.borderColor = '#E2E8F0';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  if (searchInputRef.current) searchInputRef.current.focus();
                }}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '4px',
                }}
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="custom-scrollbar"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 0',
          }}
        >
          {/* SEARCH RESULTS MODE (When query typed) */}
          {query.trim().length >= 1 ? (
            <div>
              {loading && (
                <div style={{ padding: '24px 20px' }}>
                  {[1, 2, 3, 4].map(idx => (
                    <div
                      key={idx}
                      style={{
                        height: '54px',
                        marginBottom: '8px',
                        backgroundColor: '#F1F5F9',
                        borderRadius: '12px',
                        animation: 'pulse 1.2s infinite ease-in-out',
                      }}
                    />
                  ))}
                </div>
              )}

              {!loading && results.length === 0 && (
                <div
                  style={{
                    padding: '60px 20px',
                    textAlign: 'center',
                    color: '#64748B',
                  }}
                >
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      backgroundColor: '#F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px auto',
                      fontSize: '24px',
                      color: '#94A3B8',
                    }}
                  >
                    <FaSearch />
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                    No matching locations found
                  </div>
                  <div style={{ fontSize: '13.5px', color: '#64748B' }}>
                    Try searching for another city, area, or locality.
                  </div>
                </div>
              )}

              {!loading &&
                results.map((item, idx) => {
                  const isSelected = selectedIndex === idx;
                  return (
                    <div
                      key={item.id || idx}
                      onClick={() => handleSelectLocation(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      style={{
                        padding: '12px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        backgroundColor: isSelected ? '#ECFDF5' : 'transparent',
                        borderLeft: isSelected ? '4px solid #10B981' : '4px solid transparent',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            backgroundColor: isSelected ? '#D1FAE5' : '#F1F5F9',
                            color: isSelected ? '#059669' : '#64748B',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '15px',
                            flexShrink: 0,
                          }}
                        >
                          <FaMapMarkerAlt />
                        </div>
                        <div>
                          <div style={{ fontSize: '14.5px', fontWeight: 600, color: '#0F172A' }}>
                            {item.name}
                          </div>
                          <div
                            style={{
                              fontSize: '12px',
                              color: '#64748B',
                              marginTop: '2px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                            }}
                          >
                            <span>
                              {[item.city !== item.name ? item.city : '', item.state].filter(Boolean).join(', ')}
                            </span>
                            {item.distanceKm && (
                              <span
                                style={{
                                  backgroundColor: '#EFF6FF',
                                  color: '#2563EB',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  fontWeight: 600,
                                }}
                              >
                                {item.distanceKm} km away
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {item.type && (
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.4px',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              backgroundColor: '#F8FAFC',
                              color: '#475569',
                              border: '1px solid #E2E8F0',
                            }}
                          >
                            {item.type}
                          </span>
                        )}
                        {item.listingCount > 0 && (
                          <span
                            style={{
                              fontSize: '12px',
                              fontWeight: 600,
                              color: '#10B981',
                              backgroundColor: '#F0FDF4',
                              padding: '2px 8px',
                              borderRadius: '12px',
                            }}
                          >
                            {item.listingCount.toLocaleString()} Listings
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

              {loadingMore && (
                <div style={{ padding: '16px', textAlign: 'center', color: '#10B981', fontSize: '13px' }}>
                  <FaSpinner className="fa-spin" style={{ marginRight: '6px' }} /> Loading more locations...
                </div>
              )}
            </div>
          ) : (
            /* DEFAULT EXPLORER MODE (Empty Query) */
            <div>
              {/* 1. GPS Location Button */}
              <div style={{ padding: '0 20px 12px 20px' }}>
                <button
                  onClick={handleDetectLocation}
                  disabled={detecting}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: '14px',
                    backgroundColor: '#ECFDF5',
                    border: '1.5px solid #A7F3D0',
                    cursor: detecting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    if (!detecting) e.currentTarget.style.backgroundColor = '#D1FAE5';
                  }}
                  onMouseLeave={e => {
                    if (!detecting) e.currentTarget.style.backgroundColor = '#ECFDF5';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        backgroundColor: '#10B981',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                      }}
                    >
                      {detecting ? <FaSpinner className="fa-spin" /> : <FaCrosshairs />}
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ color: '#047857', fontWeight: 700, fontSize: '14.5px' }}>
                        {detecting ? 'Detecting GPS Location...' : 'Use current location'}
                      </div>
                      <div style={{ color: '#059669', fontSize: '12px', marginTop: '2px' }}>
                        Using GPS for high-accuracy location
                      </div>
                    </div>
                  </div>
                  <FaChevronRight style={{ color: '#10B981', fontSize: '14px' }} />
                </button>
              </div>

              {/* Nearby Locations (If GPS coordinates detected) */}
              {nearbyLocations.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <div
                    style={{
                      padding: '8px 20px',
                      fontSize: '11.5px',
                      fontWeight: 800,
                      color: '#64748B',
                      letterSpacing: '0.6px',
                      textTransform: 'uppercase',
                    }}
                  >
                    NEARBY LOCATIONS (GPS WITHIN 5 KM)
                  </div>
                  {nearbyLocations.map((loc, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectLocation(loc)}
                      style={{
                        padding: '10px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FaMapMarkerAlt style={{ color: '#10B981', fontSize: '14px' }} />
                        <div>
                          <span style={{ color: '#0F172A', fontWeight: 600, fontSize: '14px' }}>
                            {loc.name}
                          </span>
                          <span style={{ color: '#64748B', fontSize: '12px', marginLeft: '6px' }}>
                            ({loc.distanceKm} km away)
                          </span>
                        </div>
                      </div>
                      <span style={{ color: '#10B981', fontSize: '12px', fontWeight: 600 }}>Select →</span>
                    </div>
                  ))}
                </div>
              )}

              {/* 2. Recent Searches (Up to 10) */}
              {recentLocations.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <div
                    style={{
                      padding: '8px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '11.5px',
                        fontWeight: 800,
                        color: '#64748B',
                        letterSpacing: '0.6px',
                        textTransform: 'uppercase',
                      }}
                    >
                      RECENT SEARCHES
                    </span>
                    <button
                      onClick={clearRecentLocations}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#EF4444',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Clear
                    </button>
                  </div>
                  {recentLocations.map((loc, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectLocation(loc)}
                      style={{
                        padding: '10px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FaHistory style={{ color: '#94A3B8', fontSize: '14px' }} />
                        <span style={{ color: '#0F172A', fontWeight: 500, fontSize: '14px' }}>
                          {loc.displayName}
                        </span>
                      </div>
                      <FaChevronRight style={{ color: '#CBD5E1', fontSize: '12px' }} />
                    </div>
                  ))}
                </div>
              )}

              {/* 3. Popular Cities */}
              <div style={{ marginBottom: '16px' }}>
                <div
                  style={{
                    padding: '8px 20px',
                    fontSize: '11.5px',
                    fontWeight: 800,
                    color: '#64748B',
                    letterSpacing: '0.6px',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <FaCity style={{ color: '#10B981' }} /> POPULAR CITIES
                </div>
                {popularCities.map((city, idx) => (
                  <div
                    key={city.id || idx}
                    onClick={() => handleSelectLocation(city)}
                    style={{
                      padding: '12px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '8px',
                          backgroundColor: '#F1F5F9',
                          color: '#64748B',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                        }}
                      >
                        <FaMapMarkerAlt />
                      </div>
                      <div>
                        <div style={{ color: '#0F172A', fontWeight: 600, fontSize: '14.5px' }}>
                          {city.name}
                        </div>
                        {city.listingCount > 0 && (
                          <div style={{ color: '#64748B', fontSize: '12px', marginTop: '1px' }}>
                            {city.listingCount.toLocaleString()} Listings
                          </div>
                        )}
                      </div>
                    </div>
                    <span style={{ color: '#2563EB', fontSize: '13px', fontWeight: 600 }}>Select →</span>
                  </div>
                ))}
              </div>

              {/* 4. Trending Locations */}
              {trendingLocations.length > 0 && (
                <div>
                  <div
                    style={{
                      padding: '8px 20px',
                      fontSize: '11.5px',
                      fontWeight: 800,
                      color: '#64748B',
                      letterSpacing: '0.6px',
                      textTransform: 'uppercase',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <FaFire style={{ color: '#F59E0B' }} /> TRENDING LOCATIONS
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '8px 20px 16px 20px' }}>
                    {trendingLocations.map((loc, idx) => (
                      <button
                        key={loc.id || idx}
                        onClick={() => handleSelectLocation(loc)}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '20px',
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          color: '#1E293B',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.backgroundColor = '#F0FDF4';
                          e.currentTarget.style.borderColor = '#10B981';
                          e.currentTarget.style.color = '#047857';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.backgroundColor = '#F8FAFC';
                          e.currentTarget.style.borderColor = '#E2E8F0';
                          e.currentTarget.style.color = '#1E293B';
                        }}
                      >
                        <FaMapMarkerAlt style={{ color: '#F59E0B', fontSize: '11px' }} />
                        {loc.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
