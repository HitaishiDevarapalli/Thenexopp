import React, { createContext, useContext, useState, useEffect } from 'react';
import { setSelectedCity } from '../db/marketplaceDb';

export interface LocationData {
  id?: string;
  name?: string;
  type?: string;
  displayName: string;
  city: string;
  locality?: string;
  district?: string;
  state: string;
  country: string;
  pincode?: string;
  lat: number;
  lng: number;
  listingCount?: number;
  distanceKm?: number | null;
}

interface LocationContextType {
  location: LocationData | null;
  setLocation: (loc: LocationData) => void;
  recentLocations: LocationData[];
  clearRecentLocations: () => void;
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
        if (parsed && (parsed.city || parsed.displayName)) {
          setSelectedCity(parsed.city || parsed.displayName);
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Failed to load saved location:", e);
    }
    return {
      displayName: 'Guntur, Andhra Pradesh',
      city: 'Guntur',
      locality: '',
      state: 'Andhra Pradesh',
      country: 'India',
      pincode: '522002',
      lat: 16.3067,
      lng: 80.4365,
    };
  });

  const [recentLocations, setRecentLocations] = useState<LocationData[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_LOCATIONS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const setLocation = (loc: LocationData) => {
    setLocationState(loc);
    const targetCity = loc.city || loc.locality || loc.displayName.split(',')[0] || 'Guntur';
    setSelectedCity(targetCity);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
    } catch (e) {}
    setRecentLocations(prev => {
      const filtered = prev.filter(p => p.displayName !== loc.displayName);
      const updated = [loc, ...filtered].slice(0, 10);
      try {
        localStorage.setItem(RECENT_LOCATIONS_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // Notify backend
    fetch('/api/location/recent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: loc.displayName,
        locationName: loc.displayName,
        locationId: loc.id || null,
      }),
    }).catch(() => {});

    window.dispatchEvent(new Event('nexopp_data_changed'));
    window.dispatchEvent(new CustomEvent('nexopp_data_changed'));
  };

  const clearRecentLocations = () => {
    setRecentLocations([]);
    try {
      localStorage.removeItem(RECENT_LOCATIONS_KEY);
    } catch (e) {}
  };

  return (
    <LocationContext.Provider value={{ location, setLocation, recentLocations, clearRecentLocations }}>
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
