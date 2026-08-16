import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

import { reverseGeocodeOnline } from '../utils/locationIntelligence';

export interface LocationData {
  id?: string;
  name?: string;
  type?: string;
  displayName: string;
  city: string;
  district?: string;
  suburb?: string;
  area?: string;
  locality?: string;
  state: string;
  country: string;
  countryCode?: string;
  postalCode?: string;
  pincode?: string;
  lat: number;
  lng: number;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  radiusKm?: number;
}

// Permission status returned by detectCurrentLocation so the UI knows exactly what happened
export type GeoPermissionStatus = 'granted' | 'denied' | 'prompt' | 'unavailable' | 'timeout';

export interface DetectLocationResult {
  location: LocationData | null;
  permissionStatus: GeoPermissionStatus;
}

interface LocationContextType {
  location: LocationData | null;
  setLocation: (loc: LocationData) => void;
  recentLocations: LocationData[];
  clearRecentLocations: () => void;
  removeRecentLocation: (index: number) => void;
  isLocationPickerOpen: boolean;
  openLocationPicker: () => void;
  closeLocationPicker: () => void;
  detectCurrentLocation: () => Promise<DetectLocationResult>;
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
        // Active purge of false "Anantapur" ISP fallback
        if (parsed && (parsed.displayName?.includes('Anantapur') || parsed.city === 'Anantapur' || parsed.area === 'Anantapur')) {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem('nexopp_selected_city');
          return null;
        }
        return parsed;
      }
    } catch {}
    return null;
  });

  const [recentLocations, setRecentLocations] = useState<LocationData[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_LOCATIONS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(
            (p: LocationData) => !p.displayName?.includes('Anantapur') && p.city !== 'Anantapur' && p.area !== 'Anantapur'
          );
          localStorage.setItem(RECENT_LOCATIONS_KEY, JSON.stringify(cleaned));
          return cleaned;
        }
      }
    } catch {}
    return [];
  });

  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);

  const openLocationPicker = useCallback(() => setIsLocationPickerOpen(true), []);
  const closeLocationPicker = useCallback(() => setIsLocationPickerOpen(false), []);

  const setLocation = useCallback((loc: LocationData) => {
    const normalized: LocationData = {
      ...loc,
      lat: Number(loc.lat ?? loc.latitude),
      lng: Number(loc.lng ?? loc.longitude),
      latitude: Number(loc.lat ?? loc.latitude),
      longitude: Number(loc.lng ?? loc.longitude),
    };

    setLocationState(normalized);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      localStorage.setItem('nexopp_selected_city', normalized.city || '');
    } catch {}

    setRecentLocations((prev) => {
      const filtered = prev.filter(
        (p) => p.displayName.toLowerCase() !== normalized.displayName.toLowerCase() && !p.displayName.includes('Anantapur') && p.city !== 'Anantapur'
      );
      const updated = [normalized, ...filtered].slice(0, 10);
      try {
        localStorage.setItem(RECENT_LOCATIONS_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Notify backend of selection to increment popularity
    if (normalized.id) {
      fetch('/api/locations/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: normalized.id }),
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

  const removeRecentLocation = useCallback((index: number) => {
    setRecentLocations((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      try {
        localStorage.setItem(RECENT_LOCATIONS_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  // Helper to reverse geocode lat/lng
  const resolveLocationFromCoords = async (latitude: number, longitude: number, accuracy: number): Promise<LocationData | null> => {
    let loc: LocationData | null = null;
    try {
      const res = await fetch(`/api/location/reverse?lat=${latitude}&lng=${longitude}`);
      if (res.ok) {
        const data = await res.json();
        if (data && (data.locality || data.city || data.displayName)) {
          loc = {
            id: data.id || `loc-gps-${Date.now()}`,
            displayName: data.displayName,
            city: data.city || 'Guntur',
            district: data.district || data.city || '',
            area: data.area || data.locality || '',
            locality: data.locality || data.area || '',
            suburb: data.suburb || data.area || '',
            state: data.state || 'Andhra Pradesh',
            country: data.country || 'India',
            countryCode: data.countryCode || 'IN',
            postalCode: data.postcode || data.postalCode || '',
            pincode: data.postcode || data.postalCode || '',
            lat: latitude,
            lng: longitude,
            latitude,
            longitude,
            accuracy: Math.round(accuracy) || 15,
          };
        }
      }
    } catch {}

    if (!loc) {
      try {
        const onlineLoc = await reverseGeocodeOnline(latitude, longitude);
        loc = {
          id: `loc-client-${Date.now()}`,
          displayName: onlineLoc.formatted_address || `${onlineLoc.area || onlineLoc.city}, ${onlineLoc.city}`,
          city: onlineLoc.city || 'Guntur',
          district: onlineLoc.district || onlineLoc.city || '',
          area: onlineLoc.area || '',
          locality: onlineLoc.area || '',
          suburb: onlineLoc.area || '',
          state: onlineLoc.state || 'Andhra Pradesh',
          country: onlineLoc.country || 'India',
          countryCode: 'IN',
          postalCode: onlineLoc.postal_code || '',
          pincode: onlineLoc.postal_code || '',
          lat: latitude,
          lng: longitude,
          latitude,
          longitude,
          accuracy: Math.round(accuracy) || 15,
        };
      } catch {}
    }
    return loc;
  };

  // ─── Check browser permission state using Permissions API ───
  const checkGeolocationPermission = async (): Promise<GeoPermissionStatus> => {
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        if (result.state === 'denied') return 'denied';
        if (result.state === 'granted') return 'granted';
        return 'prompt'; // Browser will show the Allow/Block popup
      }
    } catch {
      // Permissions API not supported — assume 'prompt' (browser will handle it)
    }
    return 'prompt';
  };

  // ─── Main GPS detection — ONLY call this from a user click handler ───
  const detectCurrentLocation = useCallback(async (): Promise<DetectLocationResult> => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      return { location: null, permissionStatus: 'unavailable' };
    }

    // Step 0: Check if permission is already denied by the browser
    const permState = await checkGeolocationPermission();
    if (permState === 'denied') {
      // Browser has permanently blocked location for this site.
      // getCurrentPosition will NOT show a popup — it will silently fail.
      // We must tell the user to reset permission manually.
      return { location: null, permissionStatus: 'denied' };
    }

    setIsDetectingGPS(true);

    const getPositionPromise = (highAccuracy: boolean, timeout: number) => {
      return new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: highAccuracy,
          timeout,
          maximumAge: highAccuracy ? 0 : 60000,
        });
      });
    };

    let pos: GeolocationPosition | null = null;
    let finalStatus: GeoPermissionStatus = 'prompt';

    try {
      // Step 1: Try High Accuracy GPS — this WILL trigger the browser's Allow/Block popup
      // if permission state is 'prompt'
      pos = await getPositionPromise(true, 10000);
      finalStatus = 'granted';
    } catch (err: any) {
      if (err?.code === 1) {
        // PERMISSION_DENIED — user clicked "Block" on the popup
        finalStatus = 'denied';
      } else if (err?.code === 2) {
        // POSITION_UNAVAILABLE — GPS hardware error, try standard
        finalStatus = 'unavailable';
      } else if (err?.code === 3) {
        // TIMEOUT — try lower accuracy fallback
        finalStatus = 'timeout';
      }

      // If not a hard denial, try standard (Wi-Fi/network) positioning
      if (err?.code !== 1) {
        try {
          pos = await getPositionPromise(false, 15000);
          finalStatus = 'granted';
        } catch (fallbackErr: any) {
          if (fallbackErr?.code === 1) finalStatus = 'denied';
        }
      }
    }

    if (pos) {
      try {
        const { latitude, longitude, accuracy } = pos.coords;
        const loc = await resolveLocationFromCoords(latitude, longitude, accuracy);
        if (loc) {
          setLocation(loc);
          setIsDetectingGPS(false);
          return { location: loc, permissionStatus: 'granted' };
        }
      } catch (e) {
        console.warn('GPS location resolution error:', e);
      }
    }

    setIsDetectingGPS(false);
    return { location: null, permissionStatus: finalStatus };
  }, [setLocation]);

  // ─── On page load: auto-trigger the Chrome location permission popup ───
  // On HTTPS sites, Chrome WILL show the "Allow location?" popup when
  // getCurrentPosition is called, even without a user gesture, as long as
  // the permission state is 'prompt' (not yet decided).
  // If already 'granted', we detect location silently.
  // If already 'denied', we open the picker with reset instructions.
  useEffect(() => {
    const autoDetectOnLoad = async () => {
      // If user already has a saved location, don't bother
      if (localStorage.getItem(STORAGE_KEY)) return;

      // Check current permission state
      const permState = await checkGeolocationPermission();

      if (permState === 'granted' || permState === 'prompt') {
        // 'prompt' → Chrome will show the Allow/Block popup
        // 'granted' → Location will be detected silently
        const result = await detectCurrentLocation();
        if (!result.location) {
          // GPS failed or user clicked Block → open the picker
          openLocationPicker();
        }
      } else {
        // 'denied' → Chrome won't show the popup. Open picker with instructions
        openLocationPicker();
      }
    };

    if (typeof window !== 'undefined' && navigator.geolocation) {
      autoDetectOnLoad();
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
        removeRecentLocation,
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


