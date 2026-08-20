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

const USER_SESSION_KEY = 'nexopp_user_session';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export const loadStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem(USER_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.expiresAt && Date.now() > parsed.expiresAt) {
      localStorage.removeItem(USER_SESSION_KEY);
      return null;
    }
    return parsed?.user || null;
  } catch {
    return null;
  }
};

export const saveStoredUser = (user: User | null) => {
  try {
    if (!user) {
      localStorage.removeItem(USER_SESSION_KEY);
    } else {
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify({
        user,
        expiresAt: Date.now() + SEVEN_DAYS_MS
      }));
    }
  } catch {}
};

export const useAuthStore = create<AuthState>((set) => ({
  user: loadStoredUser(),
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
    saveStoredUser(user);
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

          const verifiedUser: User = {
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
          };

          saveStoredUser(verifiedUser);
          set({ user: verifiedUser });
        }
      }
    } catch (e) {
      console.warn('Background session verification check:', e);
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
    let updatedUser: User | null = null;
    set((state) => {
      if (!state.user) return state;
      const updated = { ...state.user, ...data };
      if (data.name) {
        updated.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=007A55&color=fff&size=128&bold=true`;
      }
      updatedUser = updated;
      saveStoredUser(updated);
      return { user: updated };
    });

    if (updatedUser) {
      const userToSync: User = updatedUser;
      const customerId = userToSync.id || (userToSync.phone ? `cust-${userToSync.phone.replace(/\D/g, '').slice(-10)}` : null);
      if (customerId) {
        fetch(`${API_BASE_URL}/api/customers/${customerId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: userToSync.name,
            gender: userToSync.gender || 'Male',
            district: userToSync.district || '',
            phone: userToSync.phone || '',
            email: userToSync.email || '',
            role: userToSync.role || 'User',
          }),
        }).catch(() => {});
      }
    }

    window.dispatchEvent(new Event('nexopp_data_changed'));
  },

  logout: () => {
    saveStoredUser(null);
    set({ user: null });
    fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {});
  },
}));
