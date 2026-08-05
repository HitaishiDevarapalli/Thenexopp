import React, { useState, useEffect, useRef } from 'react';
import { FaMapMarkerAlt, FaSearch, FaTimes, FaCrosshairs } from 'react-icons/fa';
import { COMPREHENSIVE_INDIA_PLACES_DB, type LocationIntelligenceResult } from '../../utils/locationIntelligence';

interface LocationSearchBarProps {
  currentLocationName: string;
  onSelectLocation: (location: LocationIntelligenceResult) => void;
  placeholder?: string;
}

export const LocationSearchBar: React.FC<LocationSearchBarProps> = ({
  currentLocationName,
  onSelectLocation,
  placeholder = 'Search location e.g. Hyderabad, Guntur, Madhapur, Banjara Hills...',
}) => {
  const [query, setQuery] = useState(currentLocationName || '');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationIntelligenceResult[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(currentLocationName);
  }, [currentLocationName]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (val.trim().length > 0) {
      const q = val.toLowerCase().trim();
      const filtered = COMPREHENSIVE_INDIA_PLACES_DB.filter(
        item =>
          item.city.toLowerCase().includes(q) ||
          item.area.toLowerCase().includes(q) ||
          item.formatted_address.toLowerCase().includes(q) ||
          item.district.toLowerCase().includes(q) ||
          item.state.toLowerCase().includes(q)
      ).slice(0, 7);

      setSuggestions(filtered);
      setIsOpen(true);
    } else {
      setSuggestions(COMPREHENSIVE_INDIA_PLACES_DB.slice(0, 6));
      setIsOpen(true);
    }
  };

  const handleSelect = (item: LocationIntelligenceResult) => {
    setQuery(item.area || item.city);
    setIsOpen(false);
    onSelectLocation(item);
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const { latitude, longitude } = pos.coords;
          const userLoc: LocationIntelligenceResult = {
            formatted_address: 'Your Current Location',
            google_place_id: 'current_loc',
            latitude,
            longitude,
            country: 'India',
            state: 'Telangana',
            district: 'Hyderabad',
            city: 'Current Location',
            area: 'Near Me',
            postal_code: '',
            fullAddress: 'Your Current Location',
          };
          onSelectLocation(userLoc);
          setQuery('Near Me');
          setIsOpen(false);
        },
        () => {
          alert('Unable to retrieve your current location. Please select a city manually.');
        }
      );
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', maxWidth: '640px', margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          border: isOpen ? '2px solid #10B981' : '2px solid #E2E8F0',
          borderRadius: '16px',
          padding: '6px 14px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
          transition: 'all 0.2s ease',
        }}
      >
        <FaMapMarkerAlt style={{ color: '#10B981', fontSize: '20px', marginRight: '10px', flexShrink: 0 }} />

        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length === 0) {
              setSuggestions(COMPREHENSIVE_INDIA_PLACES_DB.slice(0, 6));
            }
            setIsOpen(true);
          }}
          placeholder={placeholder}
          style={{
            border: 'none',
            outline: 'none',
            width: '100%',
            fontSize: '0.98rem',
            fontWeight: 600,
            color: '#0F172A',
            backgroundColor: 'transparent',
          }}
        />

        {query && (
          <button
            onClick={() => {
              setQuery('');
              setSuggestions(COMPREHENSIVE_INDIA_PLACES_DB.slice(0, 6));
              setIsOpen(true);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '4px',
              marginRight: '6px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <FaTimes style={{ fontSize: '14px' }} />
          </button>
        )}

        <button
          onClick={handleCurrentLocation}
          title="Use current GPS location"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#ECFDF5',
            color: '#059669',
            border: '1px solid #A7F3D0',
            padding: '6px 12px',
            borderRadius: '10px',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          <FaCrosshairs style={{ fontSize: '13px' }} />
          <span>Near Me</span>
        </button>
      </div>

      {/* Autocomplete Dropdown List */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.12)',
            zIndex: 99999,
            maxHeight: '320px',
            overflowY: 'auto',
            padding: '8px 0',
          }}
        >
          <div
            style={{
              padding: '8px 16px',
              fontSize: '0.75rem',
              fontWeight: 800,
              color: '#94A3B8',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            POPULAR LOCATIONS & CITIES
          </div>

          {suggestions.map((item, idx) => (
            <div
              key={item.google_place_id || idx}
              onClick={() => handleSelect(item)}
              style={{
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F1F5F9')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#DCFCE7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <FaMapMarkerAlt style={{ color: '#16A34A', fontSize: '14px' }} />
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.area || item.city}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.city}, {item.state} {item.postal_code ? `• ${item.postal_code}` : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
