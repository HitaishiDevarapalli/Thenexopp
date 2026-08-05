import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FaSearch,
  FaCrosshairs,
  FaClock,
  FaMapMarkerAlt,
  FaTimes,
  FaSpinner,
  FaTrashAlt,
  FaCity,
  FaChevronRight,
} from 'react-icons/fa';
import { useLocationStore, type LocationData } from '../../context/LocationContext';

interface OLXLocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OLXLocationPickerModal: React.FC<OLXLocationPickerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    location: currentLocation,
    setLocation,
    recentLocations,
    clearRecentLocations,
    detectCurrentLocation,
    isDetectingGPS,
  } = useLocationStore();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationData[]>([]);
  const [popularCities, setPopularCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch Popular Cities on Load
  useEffect(() => {
    fetch('/api/locations/popular')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPopularCities(data);
      })
      .catch(() => {});
  }, []);

  // Auto Focus Input when Modal Opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setSelectedIndex(-1);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Handle Esc Key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced 300ms Search calling PostgreSQL pg_trgm backend endpoint
  // Debounced 250ms Search calling PostgreSQL backend endpoint with Photon backup for instant results
  useEffect(() => {
    const cleanQuery = query.trim();
    if (cleanQuery.length < 1) {
      setResults([]);
      setLoading(false);
      setSelectedIndex(-1);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/locations/search?q=${encodeURIComponent(cleanQuery)}&limit=10`).catch(() => null);
        let data: any[] = [];
        if (res && res.ok) {
          data = await res.json().catch(() => []);
        }

        // If backend search returns empty, use Photon Geocoder API as instant client fallback
        if (!Array.isArray(data) || data.length === 0) {
          const photonRes = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(cleanQuery + ' India')}&limit=8&lang=en`).catch(() => null);
          if (photonRes && photonRes.ok) {
            const photonData = await photonRes.json().catch(() => null);
            if (photonData && Array.isArray(photonData.features)) {
              data = photonData.features.map((f: any) => {
                const props = f.properties || {};
                const coords = f.geometry?.coordinates || [80.4363, 16.3067];
                const areaName = props.name || props.street || props.district || props.city || cleanQuery;
                const cityName = props.city || props.county || props.district || 'Guntur';
                const stateName = props.state || 'Andhra Pradesh';
                return {
                  id: `photon-${props.osm_id || Math.random()}`,
                  displayName: [areaName, cityName, stateName].filter(Boolean).join(', '),
                  city: cityName,
                  district: props.district || cityName,
                  suburb: areaName,
                  area: areaName,
                  locality: areaName,
                  state: stateName,
                  country: props.country || 'India',
                  postalCode: props.postcode || '',
                  pincode: props.postcode || '',
                  latitude: coords[1],
                  longitude: coords[0],
                  lat: coords[1],
                  lng: coords[0],
                };
              });
            }
          }
        }

        setResults(data || []);
      } catch (err) {
        console.error('Location search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard Navigation: ArrowUp, ArrowDown, Enter
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!results.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelectLocation(results[selectedIndex]);
      } else if (results.length > 0) {
        handleSelectLocation(results[0]);
      }
    }
  };

  const handleSelectLocation = (loc: LocationData | any) => {
    const formatted: LocationData = {
      id: loc.id,
      displayName: loc.displayName || `${loc.area || loc.locality || loc.city}, ${loc.city}, ${loc.state}`,
      city: loc.city || loc.name || 'Guntur',
      area: loc.area || loc.locality || loc.city || '',
      locality: loc.locality || loc.area || '',
      state: loc.state || 'Andhra Pradesh',
      country: loc.country || 'India',
      postalCode: loc.postalCode || loc.pincode || '',
      pincode: loc.postalCode || loc.pincode || '',
      lat: parseFloat(loc.latitude || loc.lat || 16.3067),
      lng: parseFloat(loc.longitude || loc.lng || 80.4365),
    };
    setLocation(formatted);
    onClose();
  };

  const handleGPSDetect = async () => {
    const loc = await detectCurrentLocation();
    if (loc) onClose();
  };

  // Helper to Highlight Matching Text
  const renderHighlightedText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark
              key={i}
              style={{
                backgroundColor: '#DCFCE7',
                color: '#15803D',
                fontWeight: 800,
                padding: '0 2px',
                borderRadius: '3px',
              }}
            >
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className="olx-location-modal"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '88vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
          border: '1px solid #E2E8F0',
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            padding: '20px 24px 16px 24px',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#FFFFFF',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
              📍 Select Location
            </h3>
            <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: '#64748B', fontWeight: 500 }}>
              Search across cities, areas & localities in India
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: '#F8FAFC',
              color: '#64748B',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '15px',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F1F5F9';
              e.currentTarget.style.color = '#0F172A';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#F8FAFC';
              e.currentTarget.style.color = '#64748B';
            }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Top Search Input Box (Debounced 300ms) */}
        <div style={{ padding: '16px 24px', backgroundColor: '#FAFBFC', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <FaSearch
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: query ? '#16A34A' : '#94A3B8',
                fontSize: '16px',
                transition: 'color 0.2s',
              }}
            />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search City, Area or Locality (e.g. Madhapur, Brodipet...)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleInputKeyDown}
              style={{
                width: '100%',
                padding: '13px 40px 13px 44px',
                borderRadius: '12px',
                border: '2px solid',
                borderColor: query ? '#16A34A' : '#E2E8F0',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: '#0F172A',
                outline: 'none',
                backgroundColor: '#FFFFFF',
                boxSizing: 'border-box',
                boxShadow: query ? '0 0 0 3px rgba(22, 163, 74, 0.12)' : 'none',
                transition: 'all 0.2s ease',
              }}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94A3B8',
                  padding: '4px',
                  fontSize: '14px',
                }}
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {/* SEARCH RESULTS LIST */}
          {query.trim().length >= 1 ? (
            <div>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: '#64748B',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  marginBottom: '12px',
                }}
              >
                SEARCH RESULTS {loading && '(Searching...)'}
              </div>

              {loading && (
                <div style={{ padding: '32px 0', textAlign: 'center', color: '#64748B' }}>
                  <FaSpinner style={{ animation: 'spin 1s linear infinite', fontSize: '24px', color: '#16A34A' }} />
                  <div style={{ marginTop: '10px', fontWeight: 600, fontSize: '0.88rem' }}>
                    Searching PostgreSQL locations database...
                  </div>
                </div>
              )}

              {!loading && results.length === 0 && (
                <div
                  style={{
                    padding: '36px 16px',
                    textAlign: 'center',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '14px',
                    border: '1px dashed #CBD5E1',
                    margin: '12px 0',
                  }}
                >
                  <FaMapMarkerAlt style={{ fontSize: '32px', color: '#94A3B8', marginBottom: '10px' }} />
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>
                    No matching location found for "{query}"
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '4px' }}>
                    Try searching for major cities like Guntur, Hyderabad, Vijayawada, or use GPS detection below.
                  </div>
                </div>
              )}

              {!loading &&
                results.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    onClick={() => handleSelectLocation(item)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '12px',
                      marginBottom: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      backgroundColor: selectedIndex === idx ? '#DCFCE7' : '#FFFFFF',
                      border: selectedIndex === idx ? '1px solid #16A34A' : '1px solid #F1F5F9',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      setSelectedIndex(idx);
                      e.currentTarget.style.backgroundColor = '#F0FDF4';
                    }}
                    onMouseLeave={(e) => {
                      if (selectedIndex !== idx) e.currentTarget.style.backgroundColor = '#FFFFFF';
                    }}
                  >
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        backgroundColor: '#EFF6FF',
                        color: '#2563EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        flexShrink: 0,
                      }}
                    >
                      <FaMapMarkerAlt />
                    </div>
                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          color: '#0F172A',
                          marginBottom: '2px',
                        }}
                      >
                        📍 {renderHighlightedText(item.suburb || item.area || item.locality || item.city, query)}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500 }}>
                        {renderHighlightedText(`${item.city || item.district || ''}${item.state ? ', ' + item.state : ''}`, query)}
                      </div>
                    </div>
                    <FaChevronRight style={{ color: '#CBD5E1', fontSize: '12px' }} />
                  </div>
                ))}
            </div>
          ) : (
            /* DEFAULT INITIAL STATE: GPS, Recent Searches & Popular Cities */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* 1. USE CURRENT LOCATION BUTTON */}
              <button
                onClick={handleGPSDetect}
                disabled={isDetectingGPS}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  borderRadius: '14px',
                  border: '1px solid #BBF7D0',
                  background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)',
                  cursor: isDetectingGPS ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(22, 163, 74, 0.08)',
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    backgroundColor: '#16A34A',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    flexShrink: 0,
                  }}
                >
                  <FaCrosshairs style={{ animation: isDetectingGPS ? 'spin 1.5s linear infinite' : 'none' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#15803D' }}>
                    {isDetectingGPS ? 'Detecting your GPS location...' : 'Use Current Location'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 600, marginTop: '2px' }}>
                    Auto-detect via OpenStreetMap Nominatim
                  </div>
                </div>
              </button>

              {/* 2. RECENT SEARCHES SECTION */}
              {recentLocations.length > 0 && (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '10px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        color: '#64748B',
                        letterSpacing: '0.05em',
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
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <FaTrashAlt /> Clear
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {recentLocations.slice(0, 5).map((recent, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectLocation(recent)}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1px solid #F1F5F9',
                          backgroundColor: '#FAFBFC',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F1F5F9')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FAFBFC')}
                      >
                        <FaClock style={{ color: '#94A3B8', fontSize: '14px', flexShrink: 0 }} />
                        <div style={{ flexGrow: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: '0.88rem',
                              fontWeight: 700,
                              color: '#0F172A',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            📍 {recent.area || recent.locality || recent.city}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                            {recent.city}, {recent.state}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. POPULAR CITIES GRID */}
              <div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: '#64748B',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    marginBottom: '12px',
                  }}
                >
                  POPULAR CITIES
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '10px',
                  }}
                >
                  {popularCities.map((pop, idx) => (
                    <button
                      key={pop.id || idx}
                      onClick={() => handleSelectLocation(pop)}
                      style={{
                        padding: '12px 10px',
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0',
                        backgroundColor:
                          currentLocation?.city.toLowerCase() === pop.city.toLowerCase()
                            ? '#DCFCE7'
                            : '#FFFFFF',
                        borderColor:
                          currentLocation?.city.toLowerCase() === pop.city.toLowerCase()
                            ? '#16A34A'
                            : '#E2E8F0',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.borderColor = '#16A34A';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        if (currentLocation?.city.toLowerCase() !== pop.city.toLowerCase()) {
                          e.currentTarget.style.borderColor = '#E2E8F0';
                        }
                      }}
                    >
                      <FaCity
                        style={{
                          color:
                            currentLocation?.city.toLowerCase() === pop.city.toLowerCase()
                              ? '#16A34A'
                              : '#64748B',
                          fontSize: '18px',
                        }}
                      />
                      <span
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color:
                            currentLocation?.city.toLowerCase() === pop.city.toLowerCase()
                              ? '#15803D'
                              : '#0F172A',
                          textAlign: 'center',
                        }}
                      >
                        {pop.city}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div
          style={{
            padding: '12px 24px',
            backgroundColor: '#F8FAFC',
            borderTop: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.78rem',
            color: '#64748B',
          }}
        >
          <span>Current: <strong style={{ color: '#0F172A' }}>{currentLocation?.displayName}</strong></span>
          <span style={{ color: '#16A34A', fontWeight: 700 }}>⚡ Powered by PostGIS & OpenStreetMap</span>
        </div>
      </div>
    </div>
  );
};
