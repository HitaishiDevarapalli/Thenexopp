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

  // Geolocation detector with backend + online reverse geocoding fallback
  const detectCurrentLocation = useCallback(async (): Promise<LocationData | null> => {
    if (typeof window === 'undefined' || !navigator.geolocation) return null;
    setIsDetectingGPS(true);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            let loc: LocationData | null = null;

            // 1. Try backend reverse geocoder
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
            } catch (err) {
              console.warn('Backend reverse-geocode failed, using online reverse-geocode fallback:', err);
            }

            // 2. Fallback to client reverse geocode if backend didn't respond
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
              setIsDetectingGPS(false);
              resolve(loc);
              return;
            }
          } catch (e) {
            console.warn('GPS location parsing error:', e);
          }
          setIsDetectingGPS(false);
          resolve(null);
        },
        (error) => {
          console.warn('GPS Geolocation prompt status:', error.message);
          setIsDetectingGPS(false);
          // If user denies or ignores GPS permission and no location is set, open the location picker modal
          if (!localStorage.getItem(STORAGE_KEY)) {
            openLocationPicker();
          }
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  }, [setLocation, openLocationPicker]);

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

