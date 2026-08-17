import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState {
  wishlistIds: string[];
  setWishlistIds: (ids: string[]) => void;
  addToWishlist: (id: string) => void;
  removeFromWishlist: (id: string) => void;
  toggleWishlist: (id: string) => void;
  isWishlisted: (id: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlistIds: [],

      setWishlistIds: (ids: string[]) => set({ wishlistIds: Array.from(new Set(ids)) }),

      addToWishlist: (id: string) =>
        set((state: WishlistState) => ({
          wishlistIds: state.wishlistIds.includes(id) ? state.wishlistIds : [...state.wishlistIds, id],
        })),

      removeFromWishlist: (id: string) =>
        set((state: WishlistState) => ({
          wishlistIds: state.wishlistIds.filter((item: string) => item !== id),
        })),

      toggleWishlist: (id: string) => {
        const isPresent = get().wishlistIds.includes(id);
        if (isPresent) {
          get().removeFromWishlist(id);
        } else {
          get().addToWishlist(id);
        }
      },

      isWishlisted: (id: string) => get().wishlistIds.includes(id),
      clearWishlist: () => set({ wishlistIds: [] }),
    }),
    {
      name: 'nexopp_wishlist_storage',
    }
  )
);
