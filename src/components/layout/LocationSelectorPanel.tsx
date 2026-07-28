import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaCrosshairs, FaHistory, FaMapMarkerAlt, FaTimes, FaSpinner } from 'react-icons/fa';
import { useLocationStore, type LocationData } from '../../context/LocationContext';

interface LocationSelectorPanelProps {
  onClose: () => void;
}

export const LocationSelectorPanel: React.FC<LocationSelectorPanelProps> = ({ onClose }) => {
  const { location, setLocation, recentLocations } = useLocationStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const POPULAR_CITIES = ['Hyderabad', 'Guntur', 'Vijayawada', 'Bangalore', 'Chennai'];

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

  // Debounced Photon API Search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=6&lang=en`);
        const data = await res.json();
        setResults(data.features || []);
      } catch (err) {
        console.error("Photon API error:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectPhotonResult = (feature: any) => {
    const { properties, geometry } = feature;
    const loc: LocationData = {
      displayName: [properties.name, properties.city, properties.state].filter(Boolean).join(', '),
      city: properties.city || properties.name || '',
      locality: properties.district || properties.name || '',
      state: properties.state || '',
      country: properties.country || '',
      pincode: properties.postcode || '',
      lat: geometry.coordinates[1],
      lng: geometry.coordinates[0],
    };
    setLocation(loc);
    onClose();
  };

  const handleSelectRecentOrPopular = (cityString: string) => {
    // If it's just a string (Popular), we approximate or use the known string.
    // In a real app we'd map popular cities to hardcoded lat/lngs to save an API call.
    // For now, let's just do a quick geocode if it's not a LocationData object.
    const loc: LocationData = {
      displayName: cityString,
      city: cityString,
      locality: '',
      state: '',
      country: 'India',
      pincode: '',
      lat: 0,
      lng: 0
    };
    setLocation(loc);
    onClose();
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
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=jsonv2`);
          const data = await res.json();
          
          if (data && data.address) {
            const addr = data.address;
            const city = addr.city || addr.town || addr.village || addr.county || 'Unknown';
            const loc: LocationData = {
              displayName: data.display_name,
              city: city,
              locality: addr.suburb || addr.neighbourhood || '',
              state: addr.state || '',
              country: addr.country || '',
              pincode: addr.postcode || '',
              lat: latitude,
              lng: longitude,
            };
            setLocation(loc);
            onClose();
          }
        } catch (err) {
          console.error("Reverse geocoding failed", err);
          alert("Failed to detect location address.");
        } finally {
          setDetecting(false);
        }
      },
      () => {
        setDetecting(false);
        alert("Location access denied. Please search manually.");
      },
      { timeout: 10000 }
    );
  };

  return (
    <div
      ref={panelRef}
      style={{
        position: 'absolute',
        top: '60px',
        left: '0', // Adjust this based on parent relative positioning
        width: '360px',
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        border: '1px solid #E2E8F0',
        zIndex: 1000,
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
          placeholder="Search city, area or neighborhood"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          style={{
            width: '100%',
            padding: '10px 10px 10px 36px',
            borderRadius: '8px',
            border: '1px solid #CBD5E1',
            fontSize: '14px',
            outline: 'none',
            color: '#1E293B',
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

      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {/* Live Results */}
        {query.trim().length >= 2 ? (
          <div>
            {loading && <div style={{ padding: '16px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}><FaSpinner className="fa-spin" /> Searching...</div>}
            {!loading && results.length === 0 && (
              <div style={{ padding: '16px', textAlign: 'center', color: '#64748B', fontSize: '14px' }}>No locations found</div>
            )}
            {!loading && results.map((res, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectPhotonResult(res)}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #F1F5F9',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <FaMapMarkerAlt style={{ color: '#94A3B8', marginTop: '4px', flexShrink: 0 }} />
                <div>
                  <div style={{ color: '#0F172A', fontWeight: 600, fontSize: '14px' }}>{res.properties.name}</div>
                  <div style={{ color: '#64748B', fontSize: '12px', marginTop: '2px' }}>
                    {[res.properties.city, res.properties.state, res.properties.country].filter(Boolean).join(', ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Default State: Current Location, Recent, Popular */
          <div style={{ padding: '12px 0' }}>
            
            {/* Detect Location */}
            <button
              onClick={detectLocation}
              disabled={detecting}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 20px',
                background: 'none',
                border: 'none',
                cursor: detecting ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                borderBottom: '1px solid #F1F5F9'
              }}
              onMouseEnter={(e) => !detecting && (e.currentTarget.style.backgroundColor = '#F0FDF4')}
              onMouseLeave={(e) => !detecting && (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <FaCrosshairs style={{ color: '#2563EB', fontSize: '18px' }} />
              <div>
                <div style={{ color: '#2563EB', fontWeight: 600, fontSize: '14px' }}>
                  {detecting ? 'Detecting Location...' : 'Use current location'}
                </div>
                <div style={{ color: '#64748B', fontSize: '12px', marginTop: '2px' }}>Using GPS</div>
              </div>
            </button>

            {/* Recent Locations */}
            {recentLocations.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ padding: '8px 20px', fontSize: '11px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.5px' }}>RECENT LOCATIONS</div>
                {recentLocations.map((loc, idx) => (
                  <div
                    key={idx}
                    onClick={() => { setLocation(loc); onClose(); }}
                    style={{
                      padding: '10px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <FaHistory style={{ color: '#94A3B8', fontSize: '14px' }} />
                    <div>
                      <div style={{ color: '#1E293B', fontWeight: 500, fontSize: '14px' }}>{loc.displayName.split(',')[0]}</div>
                      <div style={{ color: '#64748B', fontSize: '12px' }}>{loc.state}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Popular Locations */}
            <div style={{ marginTop: '8px' }}>
              <div style={{ padding: '8px 20px', fontSize: '11px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.5px' }}>POPULAR CITIES</div>
              {POPULAR_CITIES.map((city, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectRecentOrPopular(city)}
                  style={{
                    padding: '10px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <FaMapMarkerAlt style={{ color: '#CBD5E1', fontSize: '14px' }} />
                  <div style={{ color: '#1E293B', fontWeight: 500, fontSize: '14px' }}>{city}</div>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
