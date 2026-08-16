import React, { createContext, useContext, type ReactNode } from 'react';
import { useAuthStore, type User } from '../store/useAuthStore';

export type { User };

interface AuthContextType {
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
  updateUserProfile: (data: Partial<User>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const store = useAuthStore();

  React.useEffect(() => {
    store.initializeAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: store.user,
        isLoginModalOpen: store.isLoginModalOpen,
        openLoginModal: store.openLoginModal,
        closeLoginModal: store.closeLoginModal,
        loginWithGmail: store.loginWithGmail,
        updateUserProfile: store.updateUserProfile,
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
