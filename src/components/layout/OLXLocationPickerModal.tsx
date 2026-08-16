import React, { useState, useEffect, useRef } from 'react';
import {
  FaSearch,
  FaCrosshairs,
  FaClock,
  FaMapMarkerAlt,
  FaTimes,
  FaSpinner,
  FaBuilding,
  FaChevronRight,
  FaShieldAlt,
} from 'react-icons/fa';
import { useLocationStore, type LocationData } from '../../context/LocationContext';

interface OLXLocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_CITY_CARDS = [
  { city: 'Hyderabad', state: 'Telangana', listings: '450+', lat: 17.3850, lng: 78.4867 },
  { city: 'Guntur', state: 'Andhra Pradesh', listings: '220+', lat: 16.3067, lng: 80.4365 },
  { city: 'Vijayawada', state: 'Andhra Pradesh', listings: '260+', lat: 16.5062, lng: 80.6480 },
  { city: 'Visakhapatnam', state: 'Andhra Pradesh', listings: '310+', lat: 17.6868, lng: 83.2185 },
  { city: 'Bangalore', state: 'Karnataka', listings: '380+', lat: 12.9716, lng: 77.5946 },
  { city: 'Chennai', state: 'Tamil Nadu', listings: '290+', lat: 13.0827, lng: 80.2707 },
  { city: 'Mumbai', state: 'Maharashtra', listings: '610+', lat: 19.0760, lng: 72.8777 },
  { city: 'Delhi', state: 'Delhi NCR', listings: '540+', lat: 28.7041, lng: 77.1025 },
  { city: 'Pune', state: 'Maharashtra', listings: '240+', lat: 18.5204, lng: 73.8567 },
];

const DEFAULT_LEFT_RESULTS: LocationData[] = [
  { displayName: 'SVN Colony, Guntur, Andhra Pradesh', city: 'Guntur', area: 'SVN Colony', locality: 'SVN Colony', state: 'Andhra Pradesh', country: 'India', lat: 16.3100, lng: 80.4300 },
  { displayName: 'Madhapur, Hyderabad, Telangana', city: 'Hyderabad', area: 'Madhapur', locality: 'Madhapur', state: 'Telangana', country: 'India', lat: 17.4483, lng: 78.3915 },
  { displayName: 'Madinaguda, Hyderabad, Telangana', city: 'Hyderabad', area: 'Madinaguda', locality: 'Madinaguda', state: 'Telangana', country: 'India', lat: 17.4950, lng: 78.3450 },
  { displayName: 'Maddilapalem, Visakhapatnam, Andhra Pradesh', city: 'Visakhapatnam', area: 'Maddilapalem', locality: 'Maddilapalem', state: 'Andhra Pradesh', country: 'India', lat: 17.7300, lng: 83.3200 },
  { displayName: 'Brodipet, Guntur, Andhra Pradesh', city: 'Guntur', area: 'Brodipet', locality: 'Brodipet', state: 'Andhra Pradesh', country: 'India', lat: 16.3067, lng: 80.4365 },
  { displayName: 'Kothapet, Guntur, Andhra Pradesh', city: 'Guntur', area: 'Kothapet', locality: 'Kothapet', state: 'Andhra Pradesh', country: 'India', lat: 16.3010, lng: 80.4410 },
];

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
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Lock main page background scroll when modal opens
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 100);
      setSelectedIndex(-1);
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
      setResults([]);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle Esc Key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
    const listToNavigate = query.trim().length > 0 ? results : DEFAULT_LEFT_RESULTS;
    if (!listToNavigate.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < listToNavigate.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : listToNavigate.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < listToNavigate.length) {
        handleSelectLocation(listToNavigate[selectedIndex]);
      } else if (listToNavigate.length > 0) {
        handleSelectLocation(listToNavigate[0]);
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
      suburb: loc.suburb || loc.area || '',
      district: loc.district || loc.city || '',
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

  const [gpsStatusMsg, setGpsStatusMsg] = useState<string | null>(null);

  const handleGPSDetect = async () => {
    setGpsStatusMsg('Requesting GPS location...');
    try {
      const loc = await detectCurrentLocation();
      if (loc) {
        setGpsStatusMsg(`📍 Location detected: ${loc.displayName}`);
        setTimeout(() => {
          setGpsStatusMsg(null);
          onClose();
        }, 500);
      } else {
        setGpsStatusMsg('⚠️ Location access was blocked or unavailable. Please choose your city below or enable location in browser settings.');
      }
    } catch {
      setGpsStatusMsg('⚠️ Location access was blocked or unavailable. Please choose your city below.');
    }
  };

  // Helper to Highlight Matching Text
  const renderHighlightedText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <span
              key={i}
              style={{
                color: '#16A34A',
                fontWeight: 800,
              }}
            >
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  if (!isOpen) return null;

  const displayLeftResults = query.trim().length > 0 ? results : DEFAULT_LEFT_RESULTS;

  return (
    <div
      className="olx-modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 99999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box',
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
          maxWidth: '860px',
          maxHeight: '88vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
          border: '1px solid #E2E8F0',
          position: 'relative',
        }}
      >
        {/* Header Bar */}
        <div
          className="olx-modal-header"
          style={{
            padding: '24px 28px 18px 28px',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#FFFFFF',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: '#DCFCE7',
                color: '#16A34A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                flexShrink: 0,
              }}
            >
              <FaMapMarkerAlt />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#0F172A' }}>
                Choose Your Location
              </h3>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.88rem', color: '#64748B', fontWeight: 500 }}>
                Find properties near you or search any city, area or locality.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '38px',
              height: '38px',
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

        {/* Search Input Box */}
        <div className="olx-modal-search" style={{ padding: '16px 28px', backgroundColor: '#FFFFFF', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <FaSearch
              style={{
                position: 'absolute',
                left: '18px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: query ? '#16A34A' : '#94A3B8',
                fontSize: '17px',
                transition: 'color 0.2s',
              }}
            />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search city, area or locality..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleInputKeyDown}
              style={{
                width: '100%',
                padding: '14px 44px 14px 48px',
                borderRadius: '14px',
                border: '2px solid #16A34A',
                fontSize: '0.96rem',
                fontWeight: 600,
                color: '#0F172A',
                outline: 'none',
                backgroundColor: '#FFFFFF',
                boxSizing: 'border-box',
                boxShadow: '0 0 0 3px rgba(22, 163, 74, 0.1)',
                transition: 'all 0.2s ease',
              }}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                style={{
                  position: 'absolute',
                  right: '16px',
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

        <style>{`
          .olx-modal-scroll {
            max-height: 460px;
            overflow-y: auto !important;
            overscroll-behavior: contain;
          }
          .olx-modal-scroll::-webkit-scrollbar {
            width: 8px;
          }
          .olx-modal-scroll::-webkit-scrollbar-track {
            background: #F1F5F9;
            border-radius: 4px;
          }
          .olx-modal-scroll::-webkit-scrollbar-thumb {
            background: #16A34A;
            border-radius: 4px;
          }
          .olx-modal-scroll::-webkit-scrollbar-thumb:hover {
            background: #15803D;
          }
        `}</style>
        <div
          className="olx-modal-scroll"
          onWheel={(e) => {
            e.stopPropagation();
          }}
          style={{
            flex: '1 1 auto',
            minHeight: '200px',
            WebkitOverflowScrolling: 'touch',
            padding: '24px 28px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            alignItems: 'start',
          }}
        >
          {/* LEFT COLUMN: SEARCH RESULTS */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
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
              SEARCH RESULTS {loading && '(SEARCHING...)'}
            </div>

            {loading && (
              <div style={{ padding: '32px 0', textAlign: 'center', color: '#64748B' }}>
                <FaSpinner style={{ animation: 'spin 1s linear infinite', fontSize: '24px', color: '#16A34A' }} />
                <div style={{ marginTop: '10px', fontWeight: 600, fontSize: '0.88rem' }}>
                  Searching locations...
                </div>
              </div>
            )}

            {!loading && query.trim().length > 0 && results.length === 0 && (
              <div
                style={{
                  padding: '32px 16px',
                  textAlign: 'center',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '16px',
                  border: '1px dashed #CBD5E1',
                  margin: '12px 0',
                }}
              >
                <FaMapMarkerAlt style={{ fontSize: '32px', color: '#94A3B8', marginBottom: '10px' }} />
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>
                  No matching location found for "{query}"
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '4px' }}>
                  Try searching for SVN Colony, Madhapur, Gachibowli, Brodipet, or use GPS detection.
                </div>
              </div>
            )}

            {!loading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {displayLeftResults.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    onClick={() => handleSelectLocation(item)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '14px',
                      border: selectedIndex === idx ? '1px solid #16A34A' : '1px solid #F1F5F9',
                      backgroundColor: selectedIndex === idx ? '#F0FDF4' : '#FAFBFC',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      setSelectedIndex(idx);
                      e.currentTarget.style.backgroundColor = '#F0FDF4';
                      e.currentTarget.style.borderColor = '#16A34A';
                    }}
                    onMouseLeave={(e) => {
                      if (selectedIndex !== idx) {
                        e.currentTarget.style.backgroundColor = '#FAFBFC';
                        e.currentTarget.style.borderColor = '#F1F5F9';
                      }
                    }}
                  >
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: '#DCFCE7',
                        color: '#16A34A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '15px',
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
                        {renderHighlightedText(item.suburb || item.area || item.locality || item.city, query)}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 500 }}>
                        {renderHighlightedText(`${item.city || item.district || ''}${item.state ? ', ' + item.state : ''}`, query)}
                      </div>
                    </div>
                    <FaChevronRight style={{ color: '#16A34A', fontSize: '13px', flexShrink: 0 }} />
                  </div>
                ))}

                {query.trim().length > 0 && results.length > 0 && (
                  <button
                    onClick={() => {
                      if (results[0]) handleSelectLocation(results[0]);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      marginTop: '6px',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      color: '#16A34A',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F0FDF4')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                  >
                    View all results for "{query}" <FaChevronRight style={{ fontSize: '11px' }} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: USE LOCATION, RECENT SEARCHES, POPULAR CITIES */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {gpsStatusMsg && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  backgroundColor: gpsStatusMsg.includes('⚠️') ? '#FFFBEB' : '#ECFDF5',
                  border: gpsStatusMsg.includes('⚠️') ? '1px solid #FDE68A' : '1px solid #A7F3D0',
                  color: gpsStatusMsg.includes('⚠️') ? '#B45309' : '#047857',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {gpsStatusMsg}
              </div>
            )}
            {/* 1. USE CURRENT LOCATION CARD */}
            <button
              onClick={handleGPSDetect}
              disabled={isDetectingGPS}
              style={{
                width: '100%',
                padding: '18px 20px',
                borderRadius: '16px',
                border: '1px solid #BBF7D0',
                background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)',
                cursor: isDetectingGPS ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 10px rgba(22, 163, 74, 0.08)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  color: '#16A34A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  flexShrink: 0,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                }}
              >
                <FaCrosshairs style={{ animation: isDetectingGPS ? 'spin 1.5s linear infinite' : 'none' }} />
              </div>
              <div style={{ flexGrow: 1 }}>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>
                  {isDetectingGPS ? 'Detecting your GPS location...' : 'Use Current Location'}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 500, marginTop: '2px' }}>
                  Detect my location automatically
                </div>
                <div style={{ fontSize: '0.74rem', color: '#166534', fontWeight: 600, marginTop: '1px' }}>
                  Using GPS + OpenStreetMap
                </div>
              </div>
              <FaChevronRight style={{ color: '#16A34A', fontSize: '15px' }} />
            </button>

            {/* 2. RECENT SEARCHES SECTION */}
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
                {recentLocations.length > 0 && (
                  <button
                    onClick={clearRecentLocations}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#EF4444',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {(recentLocations.length > 0
                  ? recentLocations.slice(0, 5)
                  : [
                      { displayName: 'Madhapur, Hyderabad', city: 'Hyderabad', area: 'Madhapur', state: 'Telangana', country: 'India', lat: 17.4483, lng: 78.3915 },
                      { displayName: 'SVN Colony, Guntur', city: 'Guntur', area: 'SVN Colony', state: 'Andhra Pradesh', country: 'India', lat: 16.3100, lng: 80.4300 },
                      { displayName: 'Brodipet, Guntur', city: 'Guntur', area: 'Brodipet', state: 'Andhra Pradesh', country: 'India', lat: 16.3067, lng: 80.4365 },
                      { displayName: 'Arundelpet Police Station', city: 'Guntur', area: 'Arundelpet', state: 'Andhra Pradesh', country: 'India', lat: 16.3050, lng: 80.4380 },
                      { displayName: 'Kothapet, Guntur', city: 'Guntur', area: 'Kothapet', state: 'Andhra Pradesh', country: 'India', lat: 16.3010, lng: 80.4410 },
                    ]
                ).map((recent, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectLocation(recent)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '20px',
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: '#0F172A',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#F0FDF4';
                      e.currentTarget.style.borderColor = '#16A34A';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                      e.currentTarget.style.borderColor = '#E2E8F0';
                    }}
                  >
                    <FaClock style={{ color: '#94A3B8', fontSize: '12px' }} />
                    <span>{recent.area || recent.locality || recent.displayName.split(',')[0]}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Remove single recent location item if needed
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#94A3B8',
                        cursor: 'pointer',
                        padding: 0,
                        marginLeft: '2px',
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            </div>

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
                  gap: '12px',
                }}
              >
                {POPULAR_CITY_CARDS.map((pop, idx) => (
                  <button
                    key={idx}
                    onClick={() =>
                      handleSelectLocation({
                        displayName: `${pop.city}, ${pop.state}`,
                        city: pop.city,
                        state: pop.state,
                        country: 'India',
                        lat: pop.lat,
                        lng: pop.lng,
                      })
                    }
                    style={{
                      padding: '14px 10px',
                      borderRadius: '16px',
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
                      gap: '4px',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.borderColor = '#16A34A';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(22, 163, 74, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      if (currentLocation?.city.toLowerCase() !== pop.city.toLowerCase()) {
                        e.currentTarget.style.borderColor = '#E2E8F0';
                      }
                    }}
                  >
                    <FaBuilding
                      style={{
                        color: '#16A34A',
                        fontSize: '22px',
                        marginBottom: '2px',
                      }}
                    />
                    <span
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        color: '#0F172A',
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
        </div>

        {/* Footer Bar */}
        <div
          className="olx-modal-footer"
          style={{
            padding: '14px 28px',
            backgroundColor: '#F8FAFC',
            borderTop: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.82rem',
            color: '#64748B',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#DCFCE7', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', flexShrink: 0 }}>
              <FaMapMarkerAlt />
            </div>
            <div>
              <span style={{ color: '#64748B' }}>Selected Location: </span>
              <strong style={{ color: '#0F172A' }}>
                {currentLocation?.area ? `${currentLocation.area}, ${currentLocation.city}` : currentLocation?.city || 'Hyderabad'}
              </strong>
              {currentLocation?.state && (
                <span style={{ color: '#64748B' }}>, {currentLocation.state}</span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaShieldAlt style={{ color: '#059669', fontSize: '15px' }} />
            <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.78rem' }}>Verified GPS Location Intelligence</span>
          </div>
        </div>
      </div>
    </div>
  );
};
