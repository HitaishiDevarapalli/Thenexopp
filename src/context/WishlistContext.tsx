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
      store.setWishlistIds([]);
      return;
    }

    try {
      const userPhone = user.phone || (user as any).mobile || '';
      const userId = user.id || '';
      const params = new URLSearchParams();
      if (userPhone) params.set('phone', userPhone);
      if (userId) params.set('customerId', userId);

      const res = await fetch(`${API_BASE_URL}/api/favorites?${params.toString()}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const ids = data
            .map((item: any) => item.listingId || item.propertyId || item.businessId || item.id)
            .filter(Boolean);
          store.setWishlistIds(ids);
        }
      }
    } catch (e) {
      console.warn('Database fetch for favorites failed:', e);
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
    if (!listingId) return;

    if (!user) {
      openLoginModal();
      return;
    }

    const isCurrentlyWishlisted = store.isWishlisted(listingId);
    const userPhone = user.phone || (user as any).mobile || '';
    const userId = user.id || '';

    // Optimistic in-memory update for fast UI response
    store.toggleWishlist(listingId);

    try {
      if (isCurrentlyWishlisted) {
        const res = await fetch(`${API_BASE_URL}/api/favorites/${listingId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            customerId: userId,
            phone: userPhone,
            listingType,
            listingId
          })
        });
        if (!res.ok) {
          // Revert on failure
          store.addToWishlist(listingId);
        } else {
          await fetchUserFavorites();
        }
      } else {
        const res = await fetch(`${API_BASE_URL}/api/favorites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            customerId: userId,
            phone: userPhone,
            listingType,
            listingId
          })
        });
        if (!res.ok) {
          // Revert on failure
          store.removeFromWishlist(listingId);
        } else {
          await fetchUserFavorites();
        }
      }
    } catch (e) {
      console.error('Database sync error for favorites:', e);
      // Re-fetch true database state
      await fetchUserFavorites();
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
