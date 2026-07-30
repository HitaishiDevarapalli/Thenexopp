import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  API_BASE_URL,
  type PropertyListing,
  type FranchiseListing,
  type BusinessListing,
  type Dealer,
  type CustomerEnquiry,
  type ShowcaseVideo,
  type SiteSettings,
} from '../db/marketplaceDb';

// ── QUERY KEYS ─────────────────────────────────────────────────────────────
export const QUERY_KEYS = {
  properties: ['properties'] as const,
  franchises: ['franchises'] as const,
  businesses: ['businesses'] as const,
  dealers: ['dealers'] as const,
  enquiries: ['enquiries'] as const,
  showcaseVideos: ['showcase-videos'] as const,
  settings: ['settings'] as const,
};

// ── FETCHERS ───────────────────────────────────────────────────────────────
const fetchJson = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed for ${url}: ${res.statusText}`);
  return res.json();
};

// ── QUERIES ────────────────────────────────────────────────────────────────

export const usePropertiesQuery = () => {
  return useQuery<PropertyListing[]>({
    queryKey: QUERY_KEYS.properties,
    queryFn: () => fetchJson<PropertyListing[]>(`${API_BASE_URL}/api/properties`),
  });
};

export const useFranchisesQuery = () => {
  return useQuery<FranchiseListing[]>({
    queryKey: QUERY_KEYS.franchises,
    queryFn: () => fetchJson<FranchiseListing[]>(`${API_BASE_URL}/api/franchises`),
  });
};

export const useBusinessesQuery = () => {
  return useQuery<BusinessListing[]>({
    queryKey: QUERY_KEYS.businesses,
    queryFn: () => fetchJson<BusinessListing[]>(`${API_BASE_URL}/api/businesses`),
  });
};

export const useDealersQuery = () => {
  return useQuery<Dealer[]>({
    queryKey: QUERY_KEYS.dealers,
    queryFn: () => fetchJson<Dealer[]>(`${API_BASE_URL}/api/dealers`),
  });
};

export const useEnquiriesQuery = () => {
  return useQuery<CustomerEnquiry[]>({
    queryKey: QUERY_KEYS.enquiries,
    queryFn: () => fetchJson<CustomerEnquiry[]>(`${API_BASE_URL}/api/enquiries`),
  });
};

export const useShowcaseVideosQuery = () => {
  return useQuery<ShowcaseVideo[]>({
    queryKey: QUERY_KEYS.showcaseVideos,
    queryFn: () => fetchJson<ShowcaseVideo[]>(`${API_BASE_URL}/api/showcase-videos`),
  });
};

export const useSettingsQuery = () => {
  return useQuery<Partial<SiteSettings>>({
    queryKey: QUERY_KEYS.settings,
    queryFn: () => fetchJson<Partial<SiteSettings>>(`${API_BASE_URL}/api/settings`),
  });
};

// ── MUTATIONS ──────────────────────────────────────────────────────────────

export const useAddPropertyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newProperty: PropertyListing) => {
      const res = await fetch(`${API_BASE_URL}/api/properties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProperty),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.properties });
    },
  });
};

export const useUpdatePropertyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updated }: { id: string; updated: Partial<PropertyListing> }) => {
      const res = await fetch(`${API_BASE_URL}/api/properties/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.properties });
    },
  });
};

export const useDeletePropertyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE_URL}/api/properties/${id}`, {
        method: 'DELETE',
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.properties });
    },
  });
};
