import React, { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useAuthStore, type User } from '../store/useAuthStore';

export type { User };

interface AuthContextType {
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const store = useAuthStore();

  useEffect(() => {
    store.checkSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: store.user,
        isAuthenticated: store.isAuthenticated,
        loading: store.loading,
        isLoginModalOpen: store.isLoginModalOpen,
        openLoginModal: store.openLoginModal,
        closeLoginModal: store.closeLoginModal,
        sendEmailOtp: store.sendEmailOtp,
        verifyEmailOtp: store.verifyEmailOtp,
        loginWithGoogle: store.loginWithGoogle,
        checkSession: store.checkSession,
        logout: store.logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return useAuthStore();
  }
  return context;
};
