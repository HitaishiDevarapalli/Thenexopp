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
  setLocation: (city: string, district?: string, area?: string, lat?: number, lng?: number) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  selectedCity: 'Guntur',
  selectedDistrict: 'Guntur',
  selectedArea: '',
  latitude: 16.3067,
  longitude: 80.4363,

  setSelectedCity: (city) => set({ selectedCity: city }),
  setSelectedDistrict: (district) => set({ selectedDistrict: district }),
  setSelectedArea: (area) => set({ selectedArea: area }),
  setLocation: (city, district = '', area = '', lat = null, lng = null) =>
    set({
      selectedCity: city,
      selectedDistrict: district || city,
      selectedArea: area,
      latitude: lat,
      longitude: lng,
    }),
}));
