import React, { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useWishlistStore } from '../store/useWishlistStore';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '../db/marketplaceDb';

interface WishlistContextType {
  wishlistItems: string[];
  toggleWishlist: (listingId: string, listingType?: 'PROPERTY' | 'BUSINESS') => Promise<void>;
  isWishlisted: (listingId: string) => boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const store = useWishlistStore();
  const { user, openLoginModal } = useAuth();

  const fetchUserFavorites = async () => {
    if (!user) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/favorites`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const ids = data.map((item: any) => item.listingId || item.propertyId || item.businessId || item.id);
          store.setWishlistIds(ids);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch user favorites:', e);
    }
  };

  useEffect(() => {
    fetchUserFavorites();
  }, [user?.id, user?.phone]);

  useEffect(() => {
    const handleDataChanged = () => {
      fetchUserFavorites();
    };
    window.addEventListener('nexopp_data_changed', handleDataChanged);
    return () => window.removeEventListener('nexopp_data_changed', handleDataChanged);
  }, [user]);

  const toggleWishlist = async (listingId: string, listingType: 'PROPERTY' | 'BUSINESS' = 'PROPERTY') => {
    if (!user) {
      openLoginModal();
      return;
    }

    const isCurrentlyWishlisted = store.isWishlisted(listingId);
    // Optimistic in-memory update for instant UI feedback
    store.toggleWishlist(listingId);

    try {
      if (isCurrentlyWishlisted) {
        await fetch(`${API_BASE_URL}/api/favorites/${listingId}`, {
          method: 'DELETE',
          credentials: 'include'
        });
      } else {
        await fetch(`${API_BASE_URL}/api/favorites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ listingType, listingId })
        });
      }
      await fetchUserFavorites();
    } catch (e) {
      console.error('Failed to sync favorite with server:', e);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems: store.wishlistIds,
        toggleWishlist,
        isWishlisted: store.isWishlisted,
        refreshWishlist: fetchUserFavorites
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
      toggleWishlist: async (id: string) => store.toggleWishlist(id),
      isWishlisted: store.isWishlisted,
      refreshWishlist: async () => {},
    };
  }
  return context;
};
