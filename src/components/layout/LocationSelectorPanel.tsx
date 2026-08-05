import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaCrosshairs, FaHistory, FaMapMarkerAlt, FaTimes, FaSpinner } from 'react-icons/fa';
import { useLocationStore, type LocationData } from '../../context/LocationContext';
import { COMPREHENSIVE_INDIA_PLACES_DB, searchLivePlaces, geocodeLocationOnline, reverseGeocodeOnline, type LocationIntelligenceResult } from '../../utils/locationIntelligence';

interface LocationSelectorPanelProps {
  onClose: () => void;
}

export const LocationSelectorPanel: React.FC<LocationSelectorPanelProps> = ({ onClose }) => {
  const { location: _location, setLocation, recentLocations } = useLocationStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationIntelligenceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const POPULAR_CITIES = ['Hyderabad', 'Guntur', 'Vijayawada', 'Visakhapatnam', 'Amaravati', 'Bangalore', 'Chennai'];

  // Handle Click Outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Handle Esc Key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Debounced Search using Location Intelligence Engine
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const matches = await searchLivePlaces(query);
        setResults(matches);
      } catch (err) {
        console.error("Live place search error:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectResult = (place: LocationIntelligenceResult) => {
    const loc: LocationData = {
      displayName: place.formatted_address || place.fullAddress,
      city: place.city || place.area || 'Location',
      locality: place.area || '',
      state: place.state || '',
      country: place.country || 'India',
      pincode: place.postal_code || '',
      lat: place.latitude,
      lng: place.longitude,
    };
    setLocation(loc);
    onClose();
  };

  const handleSelectPopularCity = async (cityName: string) => {
    const found = COMPREHENSIVE_INDIA_PLACES_DB.find(
      p => p.city.toLowerCase() === cityName.toLowerCase() || p.area.toLowerCase().includes(cityName.toLowerCase())
    );
    if (found) {
      handleSelectResult(found);
    } else {
      setLoading(true);
      const geocoded = await geocodeLocationOnline(cityName);
      setLoading(false);
      handleSelectResult(geocoded);
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const revPlace = await reverseGeocodeOnline(latitude, longitude);
          
          const loc: LocationData = {
            displayName: revPlace.formatted_address || `${revPlace.area}, ${revPlace.city}`,
            city: revPlace.city || revPlace.area || 'Detected Location',
            locality: revPlace.area || '',
            state: revPlace.state || '',
            country: revPlace.country || 'India',
            pincode: revPlace.postal_code || '',
            lat: latitude,
            lng: longitude,
          };
          setLocation(loc);
          onClose();
        } catch (err) {
          console.error("Reverse geocoding failed", err);
          alert("Failed to detect location address accurately.");
        } finally {
          setDetecting(false);
        }
      },
      (err) => {
        setDetecting(false);
        console.warn("Geolocation permission error:", err);
        alert("Location access denied or unavailable. Please search your city manually.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div
      ref={panelRef}
      className="location-selector-dropdown"
      style={{
        position: 'absolute',
        top: '52px',
        right: '0',
        width: '380px',
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        boxShadow: '0 12px 36px rgba(15, 23, 42, 0.18)',
        border: '1px solid #CBD5E1',
        zIndex: 2000,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Search Input Box */}
      <div style={{ padding: '16px', borderBottom: '1px solid #F1F5F9', position: 'relative' }}>
        <FaSearch style={{ position: 'absolute', left: '30px', top: '28px', color: '#94A3B8', fontSize: '14px' }} />
        <input
          type="text"
          placeholder="Search city, area or neighborhood..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          style={{
            width: '100%',
            padding: '10px 36px 10px 38px',
            borderRadius: '10px',
            border: '1.5px solid #2563EB',
            fontSize: '14px',
            fontWeight: 600,
            outline: 'none',
            color: '#0F172A',
            boxSizing: 'border-box'
          }}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            style={{ position: 'absolute', right: '28px', top: '28px', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
          >
            <FaTimes />
          </button>
        )}
      </div>

      <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
        {/* Live Results */}
        {query.trim().length >= 2 ? (
          <div>
            {loading && (
              <div style={{ padding: '16px', textAlign: 'center', color: '#2563EB', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <FaSpinner className="fa-spin" /> Searching location database & GPS engine...
              </div>
            )}
            {!loading && results.length === 0 && (
              <div
                onClick={async () => {
                  setLoading(true);
                  const custom = await geocodeLocationOnline(query);
                  setLoading(false);
                  handleSelectResult(custom);
                }}
                style={{ padding: '14px 18px', backgroundColor: '#EFF6FF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', color: '#1E40AF', fontSize: '13px', fontWeight: 700 }}
              >
                <FaMapMarkerAlt /> Use "{query}" (Auto-Geocode via GPS)
              </div>
            )}
            {!loading && results.map((res, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectResult(res)}
                style={{
                  padding: '14px 18px',
                  borderBottom: '1px solid #F1F5F9',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '12px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flexGrow: 1 }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', flexShrink: 0, marginTop: '2px' }}>
                    <FaMapMarkerAlt style={{ fontSize: '14px' }} />
                  </div>
                  <div>
                    <div style={{ color: '#0F172A', fontWeight: 800, fontSize: '14px' }}>{res.area || res.city}</div>
                    <div style={{ color: '#64748B', fontSize: '12px', marginTop: '2px' }}>
                      {res.formatted_address || `${res.city}, ${res.state}`}
                    </div>
                  </div>
                </div>
                <div style={{ flexShrink: 0, textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#059669', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', padding: '3px 7px', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                    📍 {res.latitude?.toFixed(4)}, {res.longitude?.toFixed(4)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Default State: OLX Style Current Location & Popular Cities */
          <div>
            {/* Detect Location Button */}
            <button
              onClick={detectLocation}
              disabled={detecting}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px 20px',
                backgroundColor: '#F8FAFC',
                border: 'none',
                borderBottom: '1px solid #E2E8F0',
                cursor: detecting ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => !detecting && (e.currentTarget.style.backgroundColor = '#EFF6FF')}
              onMouseLeave={(e) => !detecting && (e.currentTarget.style.backgroundColor = '#F8FAFC')}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', flexShrink: 0 }}>
                {detecting ? <FaSpinner className="fa-spin" style={{ fontSize: '16px' }} /> : <FaCrosshairs style={{ fontSize: '16px' }} />}
              </div>
              <div>
                <div style={{ color: '#2563EB', fontWeight: 800, fontSize: '14px' }}>
                  {detecting ? 'Detecting exact GPS...' : 'Use current location'}
                </div>
                <div style={{ color: '#64748B', fontSize: '12px', marginTop: '2px' }}>Using GPS for high-accuracy location</div>
              </div>
            </button>

            {/* Recent Locations */}
            {recentLocations.length > 0 && (
              <div style={{ borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ padding: '10px 20px 6px 20px', fontSize: '11px', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.5px', textTransform: 'uppercase' }}>RECENT LOCATIONS</div>
                {recentLocations.map((loc, idx) => (
                  <div
                    key={idx}
                    onClick={() => { setLocation(loc); onClose(); }}
                    style={{
                      padding: '10px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <FaHistory style={{ color: '#94A3B8', fontSize: '14px' }} />
                      <div>
                        <div style={{ color: '#1E293B', fontWeight: 700, fontSize: '14px' }}>{loc.city || loc.displayName.split(',')[0]}</div>
                        <div style={{ color: '#64748B', fontSize: '12px' }}>{loc.locality ? `${loc.locality}, ${loc.state}` : loc.displayName}</div>
                      </div>
                    </div>
                    {loc.lat && loc.lng ? (
                      <div style={{ fontSize: '10px', color: '#059669', fontWeight: 700, backgroundColor: '#ECFDF5', padding: '2px 6px', borderRadius: '4px' }}>
                        {loc.lat.toFixed(3)}, {loc.lng.toFixed(3)}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}

            {/* Popular Locations */}
            <div style={{ padding: '12px 0' }}>
              <div style={{ padding: '0 20px 8px 20px', fontSize: '11px', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.5px', textTransform: 'uppercase' }}>POPULAR CITIES</div>
              {POPULAR_CITIES.map((city, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectPopularCity(city)}
                  style={{
                    padding: '10px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FaMapMarkerAlt style={{ color: '#94A3B8', fontSize: '14px' }} />
                    <div style={{ color: '#1E293B', fontWeight: 700, fontSize: '14px' }}>{city}</div>
                  </div>
                  <span style={{ fontSize: '12px', color: '#2563EB', fontWeight: 600 }}>Select →</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
