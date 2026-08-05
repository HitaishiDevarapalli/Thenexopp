import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  FaMapMarkerAlt,
  FaSearch,
  FaTimes,
  FaCheckCircle,
  FaExclamationTriangle,
  FaGlobe,
  FaMap,
  FaCity,
  FaCompass,
  FaEnvelope,
  FaCrosshairs,
  FaSpinner,
} from 'react-icons/fa';
import { COMPREHENSIVE_INDIA_PLACES_DB } from '../../utils/locationIntelligence';
import type { LocationIntelligenceResult } from '../../utils/locationIntelligence';

export interface AdminLocationData {
  address: string;
  formatted_address: string;
  fullAddress: string;
  city: string;
  district: string;
  state: string;
  country: string;
  postal_code: string;
  pincode: string;
  area: string;
  locality?: string;
  latitude: number;
  longitude: number;
  google_place_id?: string;
  verified: boolean;
}

interface AdminLocationStepProps {
  initialData?: Partial<AdminLocationData>;
  onChange: (data: AdminLocationData) => void;
  onValidationChange?: (isValid: boolean) => void;
}

// In-memory cache for recent autocomplete & geocoding requests
const searchCache = new Map<string, any[]>();
const reverseCache = new Map<string, any>();

export const AdminLocationStep: React.FC<AdminLocationStepProps> = ({
  initialData,
  onChange,
  onValidationChange,
}) => {
  // ── 1. LOCATION STATE ────────────────────────────────────────────────────────
  const [locationData, setLocationData] = useState<AdminLocationData>({
    address: initialData?.address || initialData?.fullAddress || '',
    formatted_address: initialData?.formatted_address || initialData?.fullAddress || '',
    fullAddress: initialData?.fullAddress || initialData?.formatted_address || '',
    city: initialData?.city || '',
    district: initialData?.district || '',
    state: initialData?.state || '',
    country: initialData?.country || 'India',
    postal_code: initialData?.postal_code || initialData?.pincode || '',
    pincode: initialData?.pincode || initialData?.postal_code || '',
    area: initialData?.area || initialData?.locality || '',
    locality: initialData?.locality || initialData?.area || '',
    latitude: initialData?.latitude || 17.3850, // Default Hyderabad
    longitude: initialData?.longitude || 78.4867,
    google_place_id: initialData?.google_place_id || '',
    verified: Boolean(initialData?.verified || (initialData?.latitude && initialData?.longitude)),
  });

  // ── 2. AUTOCOMPLETE STATE ──────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState(
    initialData?.area || initialData?.city || initialData?.formatted_address || ''
  );
  const [suggestions, setSuggestions] = useState<LocationIntelligenceResult[]>([]);
  const [isOpenSuggestions, setIsOpenSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // ── 3. MAP REFS ─────────────────────────────────────────────────────────────
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // ── 4. VALIDATION EFFECT ────────────────────────────────────────────────────
  const isValid = Boolean(
    locationData.verified &&
    locationData.latitude &&
    locationData.longitude &&
    (locationData.city || locationData.area || locationData.formatted_address)
  );

  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isValid);
    }
  }, [isValid, onValidationChange]);

  // Notify parent on state change
  const updateLocationState = (newData: Partial<AdminLocationData>) => {
    setLocationData(prev => {
      const updated: AdminLocationData = {
        ...prev,
        ...newData,
        verified: true,
      };
      onChange(updated);
      return updated;
    });
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsOpenSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── 5. REVERSE GEOCODING (ON MARKER DRAG) ──────────────────────────────────
  const performReverseGeocode = useCallback(async (lat: number, lng: number) => {
    setIsReverseGeocoding(true);
    const cacheKey = `${lat.toFixed(5)},${lng.toFixed(5)}`;

    if (reverseCache.has(cacheKey)) {
      const cached = reverseCache.get(cacheKey);
      updateLocationState({
        latitude: lat,
        longitude: lng,
        ...cached,
      });
      setIsReverseGeocoding(false);
      return;
    }

    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'VenturoAdminPropertyWizard/1.0' },
      });

      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const fullAddr = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

        const parsed = {
          formatted_address: fullAddr,
          fullAddress: fullAddr,
          address: fullAddr,
          city: addr.city || addr.town || addr.village || addr.county || 'Hyderabad',
          district: addr.state_district || addr.county || addr.district || '',
          state: addr.state || 'Telangana',
          country: addr.country || 'India',
          area: addr.suburb || addr.neighbourhood || addr.residential || addr.road || '',
          locality: addr.suburb || addr.neighbourhood || '',
          postal_code: addr.postcode || locationData.postal_code || '',
          pincode: addr.postcode || locationData.pincode || '',
        };

        reverseCache.set(cacheKey, parsed);
        updateLocationState({
          latitude: lat,
          longitude: lng,
          ...parsed,
        });
      } else {
        updateLocationState({ latitude: lat, longitude: lng });
      }
    } catch (err) {
      console.warn('Reverse geocoding error:', err);
      updateLocationState({ latitude: lat, longitude: lng });
    } finally {
      setIsReverseGeocoding(false);
    }
  }, [locationData.postal_code, locationData.pincode]);

  // ── 6. LEAFLET MAP INITIALIZATION & UPDATE ────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [locationData.latitude, locationData.longitude],
        zoom: 15,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const customPin = L.divIcon({
        className: 'custom-admin-picker-pin',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: grab; transform: translateY(-16px);">
            <div style="background-color: #2563EB; color: #FFFFFF; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 800; box-shadow: 0 4px 14px rgba(37,99,235,0.4); border: 2px solid #FFFFFF; white-space: nowrap; display: flex; align-items: center; gap: 4px;">
              📍 Drag Me
            </div>
            <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #2563EB; margin-top: -1px;"></div>
          </div>
        `,
        iconSize: [80, 42],
        iconAnchor: [40, 42],
      });

      const marker = L.marker([locationData.latitude, locationData.longitude], {
        draggable: true,
        icon: customPin,
      }).addTo(map);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        performReverseGeocode(pos.lat, pos.lng);
      });

      mapRef.current = map;
      markerRef.current = marker;

      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    } else {
      const map = mapRef.current;
      const marker = markerRef.current;

      if (map && marker) {
        const currentLatLng = marker.getLatLng();
        if (
          Math.abs(currentLatLng.lat - locationData.latitude) > 0.0001 ||
          Math.abs(currentLatLng.lng - locationData.longitude) > 0.0001
        ) {
          marker.setLatLng([locationData.latitude, locationData.longitude]);
          map.panTo([locationData.latitude, locationData.longitude], { animate: true });
        }
      }
    }
  }, [locationData.latitude, locationData.longitude, performReverseGeocode]);

  // Fine-tune marker adjustment buttons (N/S/E/W)
  const nudgeMarker = (latOffset: number, lngOffset: number) => {
    const newLat = locationData.latitude + latOffset;
    const newLng = locationData.longitude + lngOffset;
    performReverseGeocode(newLat, newLng);
  };

  // ── 7. AUTOCOMPLETE SEARCH LOGIC (NOMINATIN + PHOTON + LOCAL DB) ─────────
  const fetchAutocompleteSuggestions = async (queryStr: string) => {
    if (!queryStr || queryStr.trim().length < 2) {
      setSuggestions(COMPREHENSIVE_INDIA_PLACES_DB.slice(0, 6));
      setIsSearching(false);
      return;
    }

    const q = queryStr.toLowerCase().trim();

    if (searchCache.has(q)) {
      setSuggestions(searchCache.get(q)!);
      setIsSearching(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsSearching(true);
    setSearchError(null);

    // Filter local DB first for instant match
    const localMatches = COMPREHENSIVE_INDIA_PLACES_DB.filter(
      item =>
        item.area.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q) ||
        item.formatted_address.toLowerCase().includes(q) ||
        item.district.toLowerCase().includes(q)
    );

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        queryStr + ', India'
      )}&limit=6&addressdetails=1`;

      const res = await fetch(url, {
        signal: abortControllerRef.current.signal,
        headers: { 'User-Agent': 'VenturoAdminPropertyWizard/1.0' },
      });

      if (res.ok) {
        const remoteData = await res.json();

        const formattedRemote: LocationIntelligenceResult[] = remoteData.map((item: any) => {
          const addr = item.address || {};
          return {
            formatted_address: item.display_name,
            google_place_id: item.place_id?.toString() || `osm_${item.osm_id}`,
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            country: addr.country || 'India',
            state: addr.state || 'Telangana',
            district: addr.state_district || addr.county || '',
            city: addr.city || addr.town || addr.village || addr.county || 'Hyderabad',
            area: addr.suburb || addr.neighbourhood || addr.residential || addr.road || item.display_name.split(',')[0],
            postal_code: addr.postcode || '',
            fullAddress: item.display_name,
          };
        });

        // Combine local DB and remote API results
        const combinedMap = new Map<string, LocationIntelligenceResult>();
        localMatches.forEach(item => combinedMap.set(item.google_place_id || item.area, item));
        formattedRemote.forEach(item => combinedMap.set(item.google_place_id || item.area, item));

        const finalResults = Array.from(combinedMap.values()).slice(0, 8);

        searchCache.set(q, finalResults);
        setSuggestions(finalResults);
      } else {
        setSuggestions(localMatches.slice(0, 6));
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setSuggestions(localMatches.slice(0, 6));
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    setIsOpenSuggestions(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchAutocompleteSuggestions(val);
    }, 300);
  };

  const handleSelectSuggestion = (place: LocationIntelligenceResult) => {
    setSearchQuery(place.area || place.city || place.formatted_address);
    setIsOpenSuggestions(false);

    updateLocationState({
      address: place.formatted_address || place.fullAddress,
      formatted_address: place.formatted_address || place.fullAddress,
      fullAddress: place.formatted_address || place.fullAddress,
      city: place.city,
      district: place.district,
      state: place.state,
      country: place.country || 'India',
      postal_code: place.postal_code || locationData.postal_code,
      pincode: place.postal_code || locationData.pincode,
      area: place.area,
      locality: place.area,
      latitude: place.latitude,
      longitude: place.longitude,
      google_place_id: place.google_place_id,
      verified: true,
    });

    if (mapRef.current) {
      mapRef.current.flyTo([place.latitude, place.longitude], 16, { animate: true, duration: 1.2 });
    }
  };

  const handleDetectGPSLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsSearching(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        performReverseGeocode(latitude, longitude);
        setIsSearching(false);
        if (mapRef.current) {
          mapRef.current.flyTo([latitude, longitude], 16, { animate: true });
        }
      },
      err => {
        setIsSearching(false);
        alert(`GPS location detection failed: ${err.message}`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div style={{ width: '100%', fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      
      {/* ── 2-COLUMN RESPONSIVE LAYOUT (Desktop: Left Form, Right Map) ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 1fr)',
          gap: '24px',
          alignItems: 'start',
        }}
        className="responsive-admin-location-grid"
      >
        
        {/* LEFT COLUMN: Location Form & Details */}
        <div>
          
          {/* STEP 1: Intelligent Autocomplete Search Bar */}
          <div ref={searchContainerRef} style={{ position: 'relative', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div
                style={{
                  position: 'relative',
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#FFFFFF',
                  border: isOpenSuggestions ? '2px solid #2563EB' : '1.5px solid #CBD5E1',
                  borderRadius: '14px',
                  padding: '8px 14px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                  transition: 'all 0.2s ease',
                }}
              >
                <FaMapMarkerAlt style={{ color: '#2563EB', fontSize: '18px', marginRight: '10px', flexShrink: 0 }} />

                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onFocus={() => {
                    if (suggestions.length === 0) {
                      setSuggestions(COMPREHENSIVE_INDIA_PLACES_DB.slice(0, 6));
                    }
                    setIsOpenSuggestions(true);
                  }}
                  placeholder="Search city, locality, landmark or complete address..."
                  style={{
                    border: 'none',
                    outline: 'none',
                    width: '100%',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    color: '#0F172A',
                    backgroundColor: 'transparent',
                  }}
                />

                {isSearching ? (
                  <FaSpinner style={{ fontSize: '16px', color: '#2563EB', animation: 'spin 1s linear infinite' }} />
                ) : searchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSuggestions(COMPREHENSIVE_INDIA_PLACES_DB.slice(0, 6));
                      setIsOpenSuggestions(true);
                    }}
                    style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '2px' }}
                  >
                    <FaTimes style={{ fontSize: '14px' }} />
                  </button>
                ) : null}
              </div>

              {/* Detect My Location GPS Button */}
              <button
                type="button"
                onClick={handleDetectGPSLocation}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '10px 18px',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
                  transition: 'all 0.2s ease',
                }}
              >
                <FaCrosshairs style={{ fontSize: '14px' }} />
                <span>Detect My Location</span>
              </button>
            </div>

            {/* Live Autocomplete Suggestions Dropdown */}
            {isOpenSuggestions && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  right: 0,
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12)',
                  zIndex: 99999,
                  maxHeight: '300px',
                  overflowY: 'auto',
                  padding: '6px 0',
                }}
              >
                <div style={{ padding: '8px 16px', fontSize: '0.72rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  SEARCH RESULTS & SUGGESTIONS
                </div>

                {suggestions.map((item, idx) => (
                  <div
                    key={item.google_place_id || idx}
                    onClick={() => handleSelectSuggestion(item)}
                    style={{
                      padding: '10px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#EFF6FF')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FaMapMarkerAlt style={{ color: '#2563EB', fontSize: '14px' }} />
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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

          {/* STEP 5: Location Status Card */}
          {isValid ? (
            <div
              style={{
                backgroundColor: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: '16px',
                padding: '16px 20px',
                marginBottom: '20px',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#16A34A', fontWeight: 800, fontSize: '0.95rem', marginBottom: '10px' }}>
                <FaCheckCircle style={{ fontSize: '20px', flexShrink: 0 }} />
                <span>Location Verified & Confirmed</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '0.82rem', fontWeight: 700, color: '#15803D' }}>
                <div>✓ Location Verified</div>
                <div>✓ GPS Coordinates Generated</div>
                <div>✓ Marker Confirmed</div>
                <div>✓ Ready for Radius Search</div>
              </div>
            </div>
          ) : (
            <div
              style={{
                backgroundColor: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: '16px',
                padding: '14px 18px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#B45309',
                fontWeight: 700,
                fontSize: '0.88rem',
              }}
            >
              <FaExclamationTriangle style={{ fontSize: '18px', flexShrink: 0 }} />
              <span>⚠ Please select a valid location from autocomplete or drag the map marker.</span>
            </div>
          )}

          {/* STEP 3: Auto-Filled Location Details Cards (Read-only for admin consistency, editable pincode & full address) */}
          <div style={{ marginBottom: '16px' }}>
            <h5 style={{ fontSize: '1.02rem', fontWeight: 800, color: '#0F172A', margin: '0 0 14px 0' }}>
              Location Details (Auto-Geocoded)
            </h5>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {/* Country */}
              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaGlobe style={{ fontSize: '1rem', color: '#64748B', flexShrink: 0 }} />
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Country</div>
                  <div style={{ fontSize: '0.88rem', color: '#0F172A', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {locationData.country || 'India'}
                  </div>
                </div>
              </div>

              {/* State */}
              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaMap style={{ fontSize: '1rem', color: '#64748B', flexShrink: 0 }} />
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>State</div>
                  <div style={{ fontSize: '0.88rem', color: '#0F172A', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {locationData.state || '-'}
                  </div>
                </div>
              </div>

              {/* District */}
              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaMapMarkerAlt style={{ fontSize: '1rem', color: '#64748B', flexShrink: 0 }} />
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>District</div>
                  <div style={{ fontSize: '0.88rem', color: '#0F172A', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {locationData.district || '-'}
                  </div>
                </div>
              </div>

              {/* City */}
              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaCity style={{ fontSize: '1rem', color: '#64748B', flexShrink: 0 }} />
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>City</div>
                  <div style={{ fontSize: '0.88rem', color: '#0F172A', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {locationData.city || '-'}
                  </div>
                </div>
              </div>

              {/* Area / Locality */}
              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaCompass style={{ fontSize: '1rem', color: '#64748B', flexShrink: 0 }} />
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Area / Locality</div>
                  <div style={{ fontSize: '0.88rem', color: '#0F172A', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {locationData.area || '-'}
                  </div>
                </div>
              </div>

              {/* Editable Postal Code */}
              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaEnvelope style={{ fontSize: '1rem', color: '#64748B', flexShrink: 0 }} />
                <div style={{ width: '100%' }}>
                  <label style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
                    Postal Code (Editable)
                  </label>
                  <input
                    type="text"
                    value={locationData.postal_code || locationData.pincode || ''}
                    onChange={e => {
                      const val = e.target.value;
                      updateLocationState({ postal_code: val, pincode: val });
                    }}
                    placeholder="Enter Pincode"
                    style={{
                      width: '100%',
                      border: 'none',
                      borderBottom: '1.5px solid #94A3B8',
                      backgroundColor: 'transparent',
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      color: '#0F172A',
                      outline: 'none',
                      padding: '2px 0',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Editable Complete Formatted Address */}
          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '14px 16px' }}>
            <label style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
              Complete Formatted Address (Editable for Admin Fine-Tuning)
            </label>
            <input
              type="text"
              value={locationData.formatted_address || locationData.fullAddress || ''}
              onChange={e => {
                const val = e.target.value;
                updateLocationState({ formatted_address: val, fullAddress: val, address: val });
              }}
              placeholder="e.g. Plot 45, HITEC City Phase 2, Madhapur, Hyderabad, Telangana 500081"
              style={{
                width: '100%',
                border: 'none',
                borderBottom: '1.5px solid #94A3B8',
                backgroundColor: 'transparent',
                fontSize: '0.92rem',
                fontWeight: 800,
                color: '#0F172A',
                outline: 'none',
                padding: '4px 0',
              }}
            />
          </div>

        </div>

        {/* RIGHT COLUMN: STEP 2 - Interactive Leaflet Map */}
        <div style={{ position: 'relative', width: '100%' }}>
          
          <div
            style={{
              position: 'relative',
              borderRadius: '20px',
              overflow: 'hidden',
              border: '2px solid #E2E8F0',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
              height: '420px',
              backgroundColor: '#F1F5F9',
            }}
          >
            <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

            {/* Reverse Geocoding Overlay Spinner */}
            {isReverseGeocoding && (
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  backgroundColor: 'rgba(15, 23, 42, 0.85)',
                  backdropFilter: 'blur(4px)',
                  color: '#FFFFFF',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  zIndex: 9999,
                }}
              >
                <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                <span>Reverse Geocoding Coordinates...</span>
              </div>
            )}

            {/* Fine-Tune Marker Adjustment Nudge Overlay (N / S / W / E) */}
            <div
              style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                padding: '6px 10px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                zIndex: 9999,
                fontSize: '0.78rem',
                fontWeight: 800,
                color: '#334155',
              }}
            >
              <span>Fine-tune Marker:</span>
              <button
                type="button"
                onClick={() => nudgeMarker(0.0002, 0)}
                title="Nudge North"
                style={{ border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', borderRadius: '6px', padding: '2px 6px', cursor: 'pointer', fontWeight: 800 }}
              >
                ↑ N
              </button>
              <button
                type="button"
                onClick={() => nudgeMarker(-0.0002, 0)}
                title="Nudge South"
                style={{ border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', borderRadius: '6px', padding: '2px 6px', cursor: 'pointer', fontWeight: 800 }}
              >
                ↓ S
              </button>
              <button
                type="button"
                onClick={() => nudgeMarker(0, -0.0002)}
                title="Nudge West"
                style={{ border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', borderRadius: '6px', padding: '2px 6px', cursor: 'pointer', fontWeight: 800 }}
              >
                ← W
              </button>
              <button
                type="button"
                onClick={() => nudgeMarker(0, 0.0002)}
                title="Nudge East"
                style={{ border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', borderRadius: '6px', padding: '2px 6px', cursor: 'pointer', fontWeight: 800 }}
              >
                → E
              </button>
            </div>
          </div>

          <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#64748B', fontWeight: 600, textAlign: 'center' }}>
            💡 Drag marker or click directional buttons to fine-tune exact property position.
          </div>
        </div>

      </div>

    </div>
  );
};
