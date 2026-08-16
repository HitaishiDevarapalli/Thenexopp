import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

import { reverseGeocodeOnline } from '../utils/locationIntelligence';

export interface LocationData {
  id?: string;
  displayName: string;
  city: string;
  district?: string;
  suburb?: string;
  area?: string;
  locality?: string;
  state: string;
  country: string;
  postalCode?: string;
  pincode?: string;
  lat: number;
  lng: number;
  radiusKm?: number;
}

interface LocationContextType {
  location: LocationData | null;
  setLocation: (loc: LocationData) => void;
  recentLocations: LocationData[];
  clearRecentLocations: () => void;
  isLocationPickerOpen: boolean;
  openLocationPicker: () => void;
  closeLocationPicker: () => void;
  detectCurrentLocation: () => Promise<LocationData | null>;
  isDetectingGPS: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const STORAGE_KEY = 'nexopp_selected_location';
const RECENT_LOCATIONS_KEY = 'nexopp_recent_locations';

// Fallback IP Geolocation resolver when GPS hardware/permission is unavailable
const fetchIPLocationFallback = async (): Promise<LocationData | null> => {
  try {
    const res = await fetch('https://ipapi.co/json/').catch(() => null);
    if (res && res.ok) {
      const data = await res.json();
      if (data && (data.city || data.region)) {
        return {
          displayName: `${data.city || data.region}, ${data.region || data.country_name || 'India'}`,
          city: data.city || 'Hyderabad',
          district: data.region || data.city || '',
          area: data.city || '',
          locality: data.city || '',
          state: data.region || 'Telangana',
          country: data.country_name || 'India',
          postalCode: data.postal || '',
          pincode: data.postal || '',
          lat: Number(data.latitude) || 17.3850,
          lng: Number(data.longitude) || 78.4867,
        };
      }
    }
  } catch {}

  try {
    const res2 = await fetch('https://ipwho.is/').catch(() => null);
    if (res2 && res2.ok) {
      const data2 = await res2.json();
      if (data2 && data2.success !== false && (data2.city || data2.region)) {
        return {
          displayName: `${data2.city || data2.region}, ${data2.region || data2.country || 'India'}`,
          city: data2.city || 'Hyderabad',
          district: data2.region || data2.city || '',
          area: data2.city || '',
          locality: data2.city || '',
          state: data2.region || 'Telangana',
          country: data2.country || 'India',
          postalCode: data2.postal || '',
          pincode: data2.postal || '',
          lat: Number(data2.latitude) || 17.3850,
          lng: Number(data2.longitude) || 78.4867,
        };
      }
    }
  } catch {}

  return null;
};

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocationState] = useState<LocationData | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const [recentLocations, setRecentLocations] = useState<LocationData[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_LOCATIONS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);

  const openLocationPicker = useCallback(() => setIsLocationPickerOpen(true), []);
  const closeLocationPicker = useCallback(() => setIsLocationPickerOpen(false), []);

  const setLocation = useCallback((loc: LocationData) => {
    setLocationState(loc);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
    } catch {}

    setRecentLocations((prev) => {
      const filtered = prev.filter(
        (p) => p.displayName.toLowerCase() !== loc.displayName.toLowerCase()
      );
      const updated = [loc, ...filtered].slice(0, 10);
      try {
        localStorage.setItem(RECENT_LOCATIONS_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Notify backend of selection to increment popularity
    if (loc.id) {
      fetch('/api/locations/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: loc.id }),
      }).catch(() => {});
    }

    window.dispatchEvent(new Event('nexopp_data_changed'));
  }, []);

  const clearRecentLocations = useCallback(() => {
    setRecentLocations([]);
    try {
      localStorage.removeItem(RECENT_LOCATIONS_KEY);
    } catch {}
  }, []);

  // Geolocation detector with GPS + backend + online reverse geocoding + IP fallback
  const detectCurrentLocation = useCallback(async (): Promise<LocationData | null> => {
    setIsDetectingGPS(true);

    // 1. Try Browser Geolocation API
    if (typeof window !== 'undefined' && navigator.geolocation) {
      const gpsResult = await new Promise<LocationData | null>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              let loc: LocationData | null = null;

              // Try backend reverse geocoder
              try {
                const res = await fetch('/api/locations/reverse-geocode', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ lat: latitude, lng: longitude }),
                });
                
                if (res.ok) {
                  const data = await res.json();
                  if (data && (data.city || data.displayName)) {
                    loc = {
                      id: data.id,
                      displayName: data.displayName || `${data.locality || data.area || data.city}, ${data.city}`,
                      city: data.city || 'Hyderabad',
                      district: data.district || '',
                      area: data.area || data.locality || '',
                      locality: data.locality || data.area || '',
                      state: data.state || 'Telangana',
                      country: data.country || 'India',
                      postalCode: data.postalCode || '',
                      pincode: data.postalCode || '',
                      lat: latitude,
                      lng: longitude,
                    };
                  }
                }
              } catch {}

              // Fallback to client reverse geocode
              if (!loc) {
                const onlineLoc = await reverseGeocodeOnline(latitude, longitude);
                loc = {
                  displayName: onlineLoc.formatted_address || `${onlineLoc.area || onlineLoc.city}, ${onlineLoc.city}`,
                  city: onlineLoc.city || 'Hyderabad',
                  district: onlineLoc.district || '',
                  area: onlineLoc.area || '',
                  locality: onlineLoc.area || '',
                  state: onlineLoc.state || 'Telangana',
                  country: onlineLoc.country || 'India',
                  postalCode: onlineLoc.postal_code || '',
                  pincode: onlineLoc.postal_code || '',
                  lat: latitude,
                  lng: longitude,
                };
              }

              if (loc) {
                setLocation(loc);
                resolve(loc);
                return;
              }
            } catch (e) {
              console.warn('GPS location parsing error:', e);
            }
            resolve(null);
          },
          (error) => {
            console.warn('Browser GPS permission/hardware response:', error.message);
            resolve(null);
          },
          { enableHighAccuracy: false, timeout: 7000, maximumAge: 0 }
        );
      });

      if (gpsResult) {
        setIsDetectingGPS(false);
        return gpsResult;
      }
    }

    // 2. If GPS was denied/timed out/not supported, use IP Geolocation fallback
    const ipLoc = await fetchIPLocationFallback();
    if (ipLoc) {
      setLocation(ipLoc);
      setIsDetectingGPS(false);
      return ipLoc;
    }

    setIsDetectingGPS(false);
    return null;
  }, [setLocation]);

  // Request browser location permission immediately on website load
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      detectCurrentLocation().then((loc) => {
        if (!loc && !localStorage.getItem(STORAGE_KEY)) {
          openLocationPicker();
        }
      });
    } else {
      if (!localStorage.getItem(STORAGE_KEY)) {
        openLocationPicker();
      }
    }
  }, [detectCurrentLocation, openLocationPicker]);

  return (
    <LocationContext.Provider
      value={{
        location,
        setLocation,
        recentLocations,
        clearRecentLocations,
        isLocationPickerOpen,
        openLocationPicker,
        closeLocationPicker,
        detectCurrentLocation,
        isDetectingGPS,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationStore = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocationStore must be used within a LocationProvider');
  }
  return context;
};

