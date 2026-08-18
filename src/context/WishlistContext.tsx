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

const normalizePhone = (phone?: string) => String(phone || '').replace(/\D/g, '').slice(-10);

const getUserWishlistStorageKey = (user: any) => {
  const phone = normalizePhone(user?.phone || user?.mobile);
  return phone ? `nexopp_wishlist_${phone}` : user?.id ? `nexopp_wishlist_${user.id}` : '';
};

const loadLocalWishlistIds = (user: any): string[] => {
  const key = getUserWishlistStorageKey(user);
  if (!key || typeof window === 'undefined') return [];
  try {
    const saved = window.localStorage.getItem(key);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [];
  } catch (_) {
    return [];
  }
};

const saveLocalWishlistIds = (user: any, ids: string[]) => {
  const key = getUserWishlistStorageKey(user);
  if (!key || typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(Array.from(new Set(ids.map(String).filter(Boolean)))));
  } catch (_) {}
};

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const store = useWishlistStore();
  const { user, openLoginModal } = useAuth();
  const toggleLockRef = useRef(false);

  const fetchUserFavorites = useCallback(async () => {
    if (!user) {
      store.setWishlistIds([]);
      return;
    }

    const localIds = loadLocalWishlistIds(user);
    if (localIds.length > 0 && store.wishlistIds.length === 0) {
      store.setWishlistIds(localIds);
    }

    // Never overwrite state while a toggle is in progress
    if (toggleLockRef.current) return;

    try {
      const userPhone = (user.phone || (user as any).mobile || '').replace(/\D/g, '');
      const userId = user.id || '';
      const params = new URLSearchParams();
      if (userPhone) params.set('phone', userPhone);
      if (userId) params.set('customerId', userId);

      let res = await fetch(`${API_BASE_URL}/api/favorites?${params.toString()}`, { credentials: 'include' }).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(`/api/favorites?${params.toString()}`, { credentials: 'include' }).catch(() => null);
      }
      if (res && res.ok) {
        const data = await res.json().catch(() => null);
        if (Array.isArray(data) && !toggleLockRef.current) {
          const ids = data
            .filter((item: any) => item.status === 'ACTIVE' || !item.status)
            .map((item: any) => String(item.listingId || item.propertyId || item.businessId || item.id))
            .filter(Boolean);
          const mergedIds = Array.from(new Set([...ids, ...localIds]));
          store.setWishlistIds(mergedIds);
          saveLocalWishlistIds(user, mergedIds);
        }
      }
    } catch (e) {
      console.warn('Database fetch for favorites failed:', e);
      store.setWishlistIds(localIds);
    }
  }, [user?.id, user?.phone, store.wishlistIds.length]);

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
    const localIds = loadLocalWishlistIds(user);

    // Optimistic UI update — this is the source of truth for the UI
    store.toggleWishlist(listingId);
    if (isCurrentlyWishlisted) {
      saveLocalWishlistIds(user, localIds.filter(id => id !== listingId));
    } else {
      saveLocalWishlistIds(user, [...localIds, listingId]);
    }

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
        }).catch(() => null);
        await fetch(`/api/favorites/${listingId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            customerId: userId,
            phone: userPhone,
            listingType,
            listingId
          })
        }).catch(() => null);
      } else {
        // ADD to favorites
        const payload = JSON.stringify({
          customerId: userId,
          phone: userPhone,
          listingType,
          listingId
        });
        await fetch(`${API_BASE_URL}/api/favorites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: payload
        }).catch(() => null);
        await fetch(`/api/favorites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: payload
        }).catch(() => null);
      }
    } catch (e) {
      console.warn('Favorite toggle network error (state preserved):', e);
    } finally {
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
