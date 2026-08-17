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
    if (!user) return;
    try {
      const userPhone = user.phone || (user as any).mobile || '';
      const userId = user.id || '';
      const params = new URLSearchParams();
      if (userPhone) params.set('phone', userPhone);
      if (userId) params.set('customerId', userId);

      const res = await fetch(`${API_BASE_URL}/api/favorites?${params.toString()}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const serverIds = data.map((item: any) => item.listingId || item.propertyId || item.businessId || item.id).filter(Boolean);
          // Union server IDs with existing local IDs
          const combined = Array.from(new Set([...store.wishlistIds, ...serverIds]));
          store.setWishlistIds(combined);
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
    if (!listingId) return;

    if (!user) {
      openLoginModal();
      return;
    }

    const isCurrentlyWishlisted = store.isWishlisted(listingId);
    // Instant optimistic update saved to local storage
    store.toggleWishlist(listingId);

    const userPhone = user.phone || (user as any).mobile || '';
    const userId = user.id || '';

    try {
      if (isCurrentlyWishlisted) {
        await fetch(`${API_BASE_URL}/api/favorites/${listingId}`, {
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
      } else {
        await fetch(`${API_BASE_URL}/api/favorites`, {
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
      }
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
