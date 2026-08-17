import React, { createContext, useContext, useEffect, useRef, useCallback, type ReactNode } from 'react';
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
  const toggleLockRef = useRef(false);

  const fetchUserFavorites = useCallback(async () => {
    if (!user) {
      store.setWishlistIds([]);
      return;
    }

    // Never overwrite state while a toggle is in progress
    if (toggleLockRef.current) return;

    try {
      const userPhone = (user.phone || (user as any).mobile || '').replace(/\D/g, '');
      const userId = user.id || '';
      const params = new URLSearchParams();
      if (userPhone) params.set('phone', userPhone);
      if (userId) params.set('customerId', userId);

      const res = await fetch(`${API_BASE_URL}/api/favorites?${params.toString()}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && !toggleLockRef.current) {
          const ids = data
            .filter((item: any) => item.status === 'ACTIVE' || !item.status)
            .map((item: any) => String(item.listingId || item.propertyId || item.businessId || item.id))
            .filter(Boolean);
          store.setWishlistIds(ids);
        }
      }
    } catch (e) {
      console.warn('Database fetch for favorites failed:', e);
    }
  }, [user?.id, user?.phone]);

  // Fetch favorites on login / page load only
  useEffect(() => {
    fetchUserFavorites();
  }, [fetchUserFavorites]);

  const toggleWishlist = useCallback(async (listingId: string, listingType: 'PROPERTY' | 'BUSINESS' = 'PROPERTY') => {
    if (!listingId) return;

    if (!user) {
      openLoginModal();
      return;
    }

    // Prevent double-clicks
    if (toggleLockRef.current) return;
    toggleLockRef.current = true;

    const isCurrentlyWishlisted = store.isWishlisted(listingId);
    const userPhone = (user.phone || (user as any).mobile || '').replace(/\D/g, '');
    const userId = user.id || '';

    // Optimistic UI update — this is the source of truth for the UI
    store.toggleWishlist(listingId);

    try {
      if (isCurrentlyWishlisted) {
        // REMOVE from favorites
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
        }).catch(() => {});
        // Don't revert — the user wanted to remove, so keep it removed in UI
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

        if (!res.ok) {
          // Only revert if the server explicitly rejected (4xx)
          const status = res.status;
          if (status >= 400 && status < 500) {
            store.removeFromWishlist(listingId);
          }
          // For 5xx or network errors, keep the optimistic state — 
          // the server catch-all returns 200 anyway
        }
        // Don't call fetchUserFavorites here — trust the optimistic state
      }
    } catch (e) {
      // Network error — keep the optimistic state, don't revert
      console.warn('Favorite toggle network error (state preserved):', e);
    } finally {
      // Release the lock after a delay to prevent any pending fetches from overwriting
      setTimeout(() => {
        toggleLockRef.current = false;
      }, 2000);
    }
  }, [user, openLoginModal, store]);

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
