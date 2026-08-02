import { create } from 'zustand';

interface LocationState {
  selectedCity: string;
  selectedDistrict: string;
  selectedArea: string;
  latitude: number | null;
  longitude: number | null;
  setSelectedCity: (city: string) => void;
  setSelectedDistrict: (district: string) => void;
  setSelectedArea: (area: string) => void;
  setLocation: (city: string, district?: string, area?: string, lat?: number | null, lng?: number | null) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  selectedCity: 'Guntur',
  selectedDistrict: 'Guntur',
  selectedArea: '',
  latitude: 16.3067,
  longitude: 80.4363,

  setSelectedCity: (city: string) => set({ selectedCity: city }),
  setSelectedDistrict: (district: string) => set({ selectedDistrict: district }),
  setSelectedArea: (area: string) => set({ selectedArea: area }),
  setLocation: (city: string, district = '', area = '', lat: number | null = null, lng: number | null = null) =>
    set({
      selectedCity: city,
      selectedDistrict: district || city,
      selectedArea: area,
      latitude: lat,
      longitude: lng,
    }),
}));
