import { create } from 'zustand';
import { API_BASE_URL } from '../db/marketplaceDb';

export interface User {
  name: string;
  email: string;
  phone?: string;
  gender?: string;
  district?: string;
  avatar?: string;
  role?: 'Verified Investor' | 'Franchise Partner' | 'Business Buyer' | 'Capital Partner';
}

interface AuthState {
  user: User | null;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  loginWithGmail: (
    email: string,
    role?: string,
    customName?: string,
    customPhone?: string,
    customGender?: string,
    customDistrict?: string
  ) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoginModalOpen: false,

  openLoginModal: () => set({ isLoginModalOpen: true }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),

  loginWithGmail: (
    emailInput: string,
    role: string = 'Verified Investor',
    customName?: string,
    customPhone?: string,
    customGender?: string,
    customDistrict?: string
  ) => {
    let email = emailInput.trim();
    if (!email) return;

    if (!email.includes('@')) {
      email = `${email}@gmail.com`;
    }

    let formattedName = '';
    if (customName && customName.trim()) {
      formattedName = customName.trim();
    } else {
      const namePart = email.split('@')[0];
      formattedName = namePart
        .split(/[\.\-_]/)
        .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ');
    }

    const newUser: User = {
      name: formattedName || 'Google User',
      email: email,
      phone: customPhone,
      gender: customGender,
      district: customDistrict,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formattedName || 'G')}&background=007A55&color=fff&size=128&bold=true`,
      role: role as any,
    };

    set({ user: newUser, isLoginModalOpen: false });

    // Sync logged-in customer profile directly to backend API
    fetch(`${API_BASE_URL}/api/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone || '',
        gender: newUser.gender || 'Male',
        district: newUser.district || 'Guntur',
        role: newUser.role || 'Verified Investor',
        avatar: newUser.avatar,
      }),
    })
      .then(() => window.dispatchEvent(new Event('nexopp_data_changed')))
      .catch((err) => console.error('Customer DB sync failed:', err));
  },

  logout: () => {
    set({ user: null });
    fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {});
  },
}));
