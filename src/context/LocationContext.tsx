import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

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

const DEFAULT_LOCATION: LocationData = {
  id: 'loc-default-guntur',
  displayName: 'Brodipet, Guntur, Andhra Pradesh',
  city: 'Guntur',
  area: 'Brodipet',
  locality: 'Brodipet',
  state: 'Andhra Pradesh',
  country: 'India',
  postalCode: '522002',
  pincode: '522002',
  lat: 16.3067,
  lng: 80.4365,
  radiusKm: 10,
};

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocationState] = useState<LocationData | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_LOCATION;
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

  // Geolocation detector calling backend OpenStreetMap Nominatim reverse geocoder
  const detectCurrentLocation = useCallback(async (): Promise<LocationData | null> => {
    if (!navigator.geolocation) return null;
    setIsDetectingGPS(true);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch('/api/locations/reverse-geocode', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ lat: latitude, lng: longitude }),
            });
            
            if (res.ok) {
              const data = await res.json();
              const loc: LocationData = {
                id: data.id,
                displayName: data.displayName || `${data.locality || data.area || data.city}, ${data.city}`,
                city: data.city,
                area: data.area || data.locality || '',
                locality: data.locality || data.area || '',
                state: data.state,
                country: data.country || 'India',
                postalCode: data.postalCode || '',
                pincode: data.postalCode || '',
                lat: latitude,
                lng: longitude,
              };
              setLocation(loc);
              setIsDetectingGPS(false);
              resolve(loc);
              return;
            }
          } catch {}
          setIsDetectingGPS(false);
          resolve(null);
        },
        (_error) => {
          // If permission denied: do not show disruptive errors, open location picker modal smoothly
          setIsDetectingGPS(false);
          openLocationPicker();
          resolve(null);
        },
        { timeout: 8000 }
      );
    });
  }, [setLocation, openLocationPicker]);

  // Request browser location permission immediately on website load if no explicit saved location or on initial load
  useEffect(() => {
    const hasInitialPermissionPrompted = sessionStorage.getItem('nexopp_gps_prompted');
    if (!hasInitialPermissionPrompted && navigator.geolocation) {
      sessionStorage.setItem('nexopp_gps_prompted', 'true');
      detectCurrentLocation();
    }
  }, [detectCurrentLocation]);

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

