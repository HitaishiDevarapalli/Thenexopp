import React, { createContext, useContext, useState, useEffect } from 'react';

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
  const [location, setLocationState] = useState<LocationData | null>({
    displayName: 'Guntur, Andhra Pradesh',
    city: 'Guntur',
    locality: '',
    state: 'Andhra Pradesh',
    country: 'India',
    pincode: '522002',
    lat: 16.3067,
    lng: 80.4365,
  });

  const [recentLocations, setRecentLocations] = useState<LocationData[]>([]);

  const setLocation = (loc: LocationData) => {
    setLocationState(loc);
    setRecentLocations(prev => {
      const filtered = prev.filter(p => p.displayName !== loc.displayName);
      return [loc, ...filtered].slice(0, 5);
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
