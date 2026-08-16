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
      if (saved) {
        const parsed = JSON.parse(saved);
        // If cached location was a false ISP fallback, ignore
        return parsed;
      }
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
      localStorage.setItem('nexopp_selected_city', loc.city || '');
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

  // Geolocation detector using genuine hardware/browser GPS + High-Accuracy Reverse Geocoding
  const detectCurrentLocation = useCallback(async (): Promise<LocationData | null> => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      return null;
    }
    setIsDetectingGPS(true);

    const gpsResult = await new Promise<LocationData | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;

            // Use high-precision reverse geocoding engine (BigDataCloud + OpenStreetMap)
            const onlineLoc = await reverseGeocodeOnline(latitude, longitude);
            const loc: LocationData = {
              displayName: onlineLoc.formatted_address || `${onlineLoc.area || onlineLoc.city}, ${onlineLoc.city}`,
              city: onlineLoc.city || 'Guntur',
              district: onlineLoc.district || onlineLoc.city || '',
              area: onlineLoc.area || '',
              locality: onlineLoc.area || '',
              suburb: onlineLoc.area || '',
              state: onlineLoc.state || 'Andhra Pradesh',
              country: onlineLoc.country || 'India',
              postalCode: onlineLoc.postal_code || '',
              pincode: onlineLoc.postal_code || '',
              lat: latitude,
              lng: longitude,
            };

            setLocation(loc);
            setIsDetectingGPS(false);
            resolve(loc);
            return;
          } catch (e) {
            console.warn('GPS location reverse geocoding error:', e);
          }
          setIsDetectingGPS(false);
          resolve(null);
        },
        (error) => {
          console.warn('Browser GPS permission/hardware error:', error.message);
          setIsDetectingGPS(false);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });

    setIsDetectingGPS(false);
    return gpsResult;
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

