import React, { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
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
  const isFetchingRef = useRef(false);
  const isTogglingRef = useRef(false);

  const fetchUserFavorites = async () => {
    if (!user) {
      store.setWishlistIds([]);
      return;
    }

    // Don't re-fetch while a toggle operation is in progress
    if (isTogglingRef.current) return;
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const userPhone = (user.phone || (user as any).mobile || '').replace(/\D/g, '');
      const userId = user.id || '';
      const params = new URLSearchParams();
      if (userPhone) params.set('phone', userPhone);
      if (userId) params.set('customerId', userId);

      const res = await fetch(`${API_BASE_URL}/api/favorites?${params.toString()}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const ids = data
            .filter((item: any) => item.status === 'ACTIVE' || !item.status)
            .map((item: any) => String(item.listingId || item.propertyId || item.businessId || item.id))
            .filter(Boolean);
          store.setWishlistIds(ids);
        }
      }
    } catch (e) {
      console.warn('Database fetch for favorites failed:', e);
    } finally {
      isFetchingRef.current = false;
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
    const userPhone = (user.phone || (user as any).mobile || '').replace(/\D/g, '');
    const userId = user.id || '';

    // Optimistic UI update
    store.toggleWishlist(listingId);

    // Mark toggling in progress to prevent fetchUserFavorites from overwriting
    isTogglingRef.current = true;

    try {
      if (isCurrentlyWishlisted) {
        // REMOVE from favorites
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
        }
      } else {
        // ADD to favorites
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

        const responseData = await res.json().catch(() => ({}));

        if (!res.ok || responseData.success === false) {
          // Revert on failure
          store.removeFromWishlist(listingId);
          console.error('Failed to save favorite:', responseData);
        }
      }
    } catch (e) {
      console.error('Database sync error for favorites:', e);
      // Revert optimistic change on network error
      if (isCurrentlyWishlisted) {
        store.addToWishlist(listingId);
      } else {
        store.removeFromWishlist(listingId);
      }
    } finally {
      // Allow fetch again after a short delay to let DB settle
      setTimeout(() => {
        isTogglingRef.current = false;
        fetchUserFavorites();
      }, 500);
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
