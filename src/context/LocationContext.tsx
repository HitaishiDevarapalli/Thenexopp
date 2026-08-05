import React, { createContext, useContext, useState, useEffect } from 'react';
import { setSelectedCity } from '../db/marketplaceDb';

export interface LocationData {
  displayName: string;
  city: string;
  locality: string;
  state: string;
  country: string;
  pincode: string;
  lat: number;
  lng: number;
}

interface LocationContextType {
  location: LocationData | null;
  setLocation: (loc: LocationData) => void;
  recentLocations: LocationData[];
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
        if (parsed && parsed.city) {
          setSelectedCity(parsed.city);
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
      const updated = [loc, ...filtered].slice(0, 5);
      try {
        localStorage.setItem(RECENT_LOCATIONS_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    window.dispatchEvent(new Event('nexopp_data_changed'));
  };

  return (
    <LocationContext.Provider value={{ location, setLocation, recentLocations }}>
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
