import { create } from 'zustand';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface User {
  id?: string;
  email: string;
  name: string;
  profilePhoto?: string | null;
  avatar?: string;
  googleId?: string | null;
  role?: string;
  fullName?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  sendEmailOtp: (email: string) => Promise<{ success: boolean; message?: string }>;
  verifyEmailOtp: (email: string, otp: string, name?: string) => Promise<{ success: boolean; message?: string; user?: User }>;
  loginWithGoogle: (payload: { googleId?: string; email: string; name: string; profilePhoto?: string; credential?: string }) => Promise<{ success: boolean; message?: string; user?: User }>;
  checkSession: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  isLoginModalOpen: false,

  openLoginModal: () => set({ isLoginModalOpen: true }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),

  sendEmailOtp: async (email: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/send-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.error || data.message || 'Failed to send Email OTP' };
      }
      return { success: true, message: data.message || `OTP sent to ${email}` };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error while sending OTP' };
    }
  },

  verifyEmailOtp: async (email: string, otp: string, name?: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, otp, name }),
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.user) {
        return { success: false, message: data.error || data.message || 'Invalid 6-digit OTP code' };
      }

      const authenticatedUser: User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name || data.user.fullName || email.split('@')[0],
        fullName: data.user.fullName || data.user.name || email.split('@')[0],
        profilePhoto: data.user.profilePhoto || data.user.avatar || null,
        avatar: data.user.profilePhoto || data.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.user.name || email.split('@')[0])}&background=007A55&color=fff`,
        googleId: data.user.googleId || null,
        role: data.user.role || 'USER',
      };

      set({ user: authenticatedUser, isAuthenticated: true, isLoginModalOpen: false });
      window.dispatchEvent(new Event('nexopp_auth_changed'));
      return { success: true, user: authenticatedUser };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error verifying OTP' };
    }
  },

  loginWithGoogle: async ({ googleId, email, name, profilePhoto, credential }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ googleId, email, name, profilePhoto, credential }),
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.user) {
        return { success: false, message: data.error || data.message || 'Google authentication failed' };
      }

      const authenticatedUser: User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name || data.user.fullName || name,
        fullName: data.user.fullName || data.user.name || name,
        profilePhoto: data.user.profilePhoto || profilePhoto || null,
        avatar: data.user.profilePhoto || profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=007A55&color=fff`,
        googleId: data.user.googleId || googleId || null,
        role: data.user.role || 'USER',
      };

      set({ user: authenticatedUser, isAuthenticated: true, isLoginModalOpen: false });
      window.dispatchEvent(new Event('nexopp_auth_changed'));
      return { success: true, user: authenticatedUser };
    } catch (err: any) {
      return { success: false, message: err.message || 'Google login network error' };
    }
  },

  checkSession: async () => {
    set({ loading: true });
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        const u = data.user;
        set({
          user: {
            id: u.id,
            email: u.email,
            name: u.name || u.fullName || u.email.split('@')[0],
            fullName: u.fullName || u.name || u.email.split('@')[0],
            profilePhoto: u.profilePhoto || u.avatar || null,
            avatar: u.profilePhoto || u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'User')}&background=007A55&color=fff`,
            googleId: u.googleId || null,
            role: u.role || 'USER',
          },
          isAuthenticated: true,
          loading: false,
        });
      } else {
        set({ user: null, isAuthenticated: false, loading: false });
      }
    } catch (err) {
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },

  logout: async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
    } catch (e) {}
    set({ user: null, isAuthenticated: false });
    window.dispatchEvent(new Event('nexopp_auth_changed'));
  },
}));
