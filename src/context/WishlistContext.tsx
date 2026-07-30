import React, { createContext, useContext, type ReactNode } from 'react';
import { useWishlistStore } from '../store/useWishlistStore';

interface WishlistContextType {
  wishlistItems: string[];
  toggleWishlist: (propertyId: string) => void;
  isWishlisted: (propertyId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const store = useWishlistStore();

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems: store.wishlistIds,
        toggleWishlist: store.toggleWishlist,
        isWishlisted: store.isWishlisted,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    const store = useWishlistStore();
    return {
      wishlistItems: store.wishlistIds,
      toggleWishlist: store.toggleWishlist,
      isWishlisted: store.isWishlisted,
    };
  }
  return context;
};
