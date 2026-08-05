import { useState, useEffect, useCallback } from 'react';
import { COMPREHENSIVE_INDIA_PLACES_DB, LocationIntelligenceResult } from '../utils/locationIntelligence';

export interface PropertySearchResultItem {
  id: string;
  title: string;
  description?: string;
  image: string;
  price: number;
  priceDisplay: string;
  area: string;
  city: string;
  district?: string;
  state?: string;
  pincode?: string;
  fullAddress?: string;
  latitude: number;
  longitude: number;
  distanceMeters?: number;
  distanceText?: string;
  verified?: boolean;
  premium?: boolean;
  trending?: boolean;
  category?: string;
  status?: string;
  bedrooms?: number;
  bathrooms?: number;
  areaSqFt?: string;
  agentName?: string;
}

export type DistanceRadiusOption = 50000 | 100000 | 200000 | null;

interface UsePropertySearchOptions {
  initialLocationName?: string;
  initialLat?: number;
  initialLng?: number;
  initialRadius?: DistanceRadiusOption;
}

export function usePropertySearch(options: UsePropertySearchOptions = {}) {
  const [locationName, setLocationName] = useState<string>(options.initialLocationName || 'Hyderabad');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: options.initialLat || 17.3850,
    lng: options.initialLng || 78.4867,
  });
  const [radiusMeters, setRadiusMeters] = useState<DistanceRadiusOption>(
    options.initialRadius !== undefined ? options.initialRadius : 50000
  );
  const [properties, setProperties] = useState<PropertySearchResultItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(20);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchProperties = useCallback(async (
    targetLat: number,
    targetLng: number,
    targetRadius: DistanceRadiusOption,
    targetPage: number
  ) => {
    setLoading(true);
    setError(null);

    try {
      const radiusParam = targetRadius === null ? 'anywhere' : targetRadius.toString();
      const queryUrl = `/api/properties/search?lat=${targetLat}&lng=${targetLng}&radius=${radiusParam}&page=${targetPage}&limit=${limit}`;

      const res = await fetch(queryUrl);

      if (!res.ok) {
        throw new Error(`API search failed with status ${res.status}`);
      }

      const data = await res.json();
      setProperties(data.properties || []);
      setTotalCount(data.totalCount || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      console.warn('Backend PostGIS search API error, applying client-side spatial calculation:', err?.message);

      // Client-side fallback calculation for seamless dev/offline execution
      try {
        const fallbackRes = await fetch('/api/properties');
        if (fallbackRes.ok) {
          const allProps: PropertySearchResultItem[] = await fallbackRes.json();

          // Calculate Haversine distance in meters
          const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
            const R = 6371e3; // metres
            const φ1 = (lat1 * Math.PI) / 180;
            const φ2 = (lat2 * Math.PI) / 180;
            const Δφ = ((lat2 - lat1) * Math.PI) / 180;
            const Δλ = ((lon2 - lon1) * Math.PI) / 180;

            const a =
              Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

            return R * c;
          };

          let calculatedProps = allProps.map(p => {
            const pLat = p.latitude || 16.3067;
            const pLng = p.longitude || 80.4363;
            const distMeters = calculateDistance(targetLat, targetLng, pLat, pLng);
            const distKm = (distMeters / 1000).toFixed(1);

            return {
              ...p,
              distanceMeters: distMeters,
              distanceText: distMeters < 1000 ? `${Math.round(distMeters)} m away` : `${distKm} km away`,
            };
          });

          if (targetRadius !== null) {
            calculatedProps = calculatedProps.filter(p => p.distanceMeters! <= targetRadius);
          }

          calculatedProps.sort((a, b) => (a.distanceMeters || 0) - (b.distanceMeters || 0));

          setTotalCount(calculatedProps.length);
          setTotalPages(Math.ceil(calculatedProps.length / limit));

          const start = (targetPage - 1) * limit;
          setProperties(calculatedProps.slice(start, start + limit));
        } else {
          setError('Unable to load properties.');
        }
      } catch (clientErr: any) {
        setError(clientErr?.message || 'Error searching properties.');
      }
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchProperties(coords.lat, coords.lng, radiusMeters, page);
  }, [coords.lat, coords.lng, radiusMeters, page, fetchProperties]);

  const selectLocation = (loc: LocationIntelligenceResult | { name: string; lat: number; lng: number }) => {
    if ('formatted_address' in loc) {
      setLocationName(loc.area || loc.city || loc.formatted_address);
      setCoords({ lat: loc.latitude, lng: loc.longitude });
    } else {
      setLocationName(loc.name);
      setCoords({ lat: loc.lat, lng: loc.lng });
    }
    setPage(1);
  };

  const changeRadius = (newRadius: DistanceRadiusOption) => {
    setRadiusMeters(newRadius);
    setPage(1);
  };

  return {
    locationName,
    coords,
    radiusMeters,
    properties,
    loading,
    error,
    totalCount,
    page,
    totalPages,
    selectLocation,
    changeRadius,
    setPage,
    refetch: () => fetchProperties(coords.lat, coords.lng, radiusMeters, page),
  };
}
