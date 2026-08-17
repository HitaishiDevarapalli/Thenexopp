import { create } from 'zustand';
import { API_BASE_URL } from '../db/marketplaceDb';

export interface User {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  gender?: string;
  district?: string;
  avatar?: string;
  role?: string;
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
  setUser: (user: User | null) => void;
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
        setTimeout(() => {
          useAuthStore.getState().logout();
        }, 50);
      }
      return { isLoginModalOpen: false };
    });
  },

  setUser: (user: User | null) => {
    set({ user });
    window.dispatchEvent(new Event('nexopp_data_changed'));
  },

  initializeAuth: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          const rawEmail = data.user.email || '';
          const cleanEmail = (rawEmail && !rawEmail.includes('@nexopp.in') && !rawEmail.includes('@thenexopp')) ? rawEmail : '';
          const userName = data.user.fullName || data.user.name || 'User';

          set({
            user: {
              id: data.user.id,
              name: userName,
              email: cleanEmail,
              phone: data.user.mobile || data.user.phone || '',
              gender: data.user.gender,
              district: data.user.district || data.user.area,
              role: data.user.role || 'User',
              avatar: data.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=007A55&color=fff`,
              profileCompleted: data.user.profileCompleted !== false,
              propertyInterest: data.user.propertyInterest,
              businessInterest: data.user.businessInterest
            }
          });
        }
      }
    } catch (e) {
      console.error('Initialize auth failed:', e);
    }
  },

  loginWithGmail: async (
    emailInput: string = '',
    role: string = 'User',
    customName?: string,
    customPhone?: string,
    customGender?: string,
    customDistrict?: string
  ) => {
    let email = (emailInput || '').trim();
    if (email.includes('@nexopp.in') || email.includes('@thenexopp')) {
      email = '';
    }

    let formattedName = '';
    if (customName && customName.trim()) {
      formattedName = customName.trim();
    } else if (email && email.includes('@')) {
      const namePart = email.split('@')[0];
      formattedName = namePart
        .split(/[\.\-_]/)
        .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ');
    } else {
      formattedName = 'User';
    }

    const assignedRole = (role === 'Verified Investor' ? 'User' : (role || 'User'));

    const newUser: User = {
      name: formattedName,
      email: email,
      phone: customPhone,
      gender: customGender,
      district: customDistrict,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formattedName || 'U')}&background=007A55&color=fff&size=128&bold=true`,
      role: assignedRole,
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
          email: newUser.email || '',
          phone: newUser.phone || '',
          gender: newUser.gender || 'Male',
          district: newUser.district || 'Guntur',
          role: assignedRole,
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
