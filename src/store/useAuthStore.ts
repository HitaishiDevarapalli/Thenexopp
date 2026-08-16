import { create } from 'zustand';
import { API_BASE_URL } from '../db/marketplaceDb';

export interface User {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  gender?: string;
  district?: string;
  avatar?: string;
  role?: 'Verified Investor' | 'Franchise Partner' | 'Business Buyer' | 'Capital Partner' | 'SUPER_ADMIN' | 'ADMIN';
  profileCompleted?: boolean;
  propertyInterest?: boolean;
  businessInterest?: boolean;
}

interface AuthState {
  user: User | null;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  initializeAuth: () => Promise<void>;
  loginWithGmail: (
    email: string,
    role?: string,
    customName?: string,
    customPhone?: string,
    customGender?: string,
    customDistrict?: string
  ) => void;
  updateUserProfile: (data: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoginModalOpen: false,

  openLoginModal: () => set({ isLoginModalOpen: true }),
  closeLoginModal: () => {
    set((state) => {
      if (state.user && state.user.profileCompleted !== true) {
        // Run logout asynchronously to prevent state transition conflicts
        setTimeout(() => {
          useAuthStore.getState().logout();
        }, 50);
      }
      return { isLoginModalOpen: false };
    });
  },

  initializeAuth: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          set({
            user: {
              id: data.user.id,
              name: data.user.fullName || data.user.name,
              email: data.user.email,
              phone: data.user.mobile || data.user.phone,
              gender: data.user.gender,
              district: data.user.district || data.user.area,
              role: data.user.role,
              avatar: data.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.user.fullName || 'U')}&background=007A55&color=fff`,
              profileCompleted: data.user.profileCompleted,
              propertyInterest: data.user.propertyInterest,
              businessInterest: data.user.businessInterest
            } as any
          });
        }
      }
    } catch (e) {
      console.error('Initialize auth failed:', e);
    }
  },

  loginWithGmail: async (
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
      profileCompleted: true,
    };

    set({ user: newUser, isLoginModalOpen: false });

    // Sync logged-in customer profile directly to backend API with credentials
    try {
      const res = await fetch(`${API_BASE_URL}/api/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone || '',
          gender: newUser.gender || 'Male',
          district: newUser.district || 'Guntur',
          role: newUser.role || 'Verified Investor',
          avatar: newUser.avatar,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const customerId = data.id || (data.user && data.user.id);
        if (customerId) {
          set({ user: { ...newUser, id: customerId } });
        }
      }
      window.dispatchEvent(new Event('nexopp_data_changed'));
    } catch (err) {
      console.error('Customer DB sync failed:', err);
    }
  },

  updateUserProfile: (data: Partial<User>) => {
    set((state) => {
      if (!state.user) return state;
      const updated = { ...state.user, ...data };
      if (data.name) {
        updated.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=007A55&color=fff&size=128&bold=true`;
      }
      return { user: updated };
    });
    window.dispatchEvent(new Event('nexopp_data_changed'));
  },

  logout: () => {
    set({ user: null });
    fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {});
  },
}));
