import { create } from 'zustand';

interface WishlistState {
  wishlistIds: string[];
  addToWishlist: (id: string) => void;
  removeFromWishlist: (id: string) => void;
  toggleWishlist: (id: string) => void;
  isWishlisted: (id: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlistIds: [],

  addToWishlist: (id) =>
    set((state) => ({
      wishlistIds: state.wishlistIds.includes(id) ? state.wishlistIds : [...state.wishlistIds, id],
    })),

  removeFromWishlist: (id) =>
    set((state) => ({
      wishlistIds: state.wishlistIds.filter((item) => item !== id),
    })),

  toggleWishlist: (id) => {
    const isPresent = get().wishlistIds.includes(id);
    if (isPresent) {
      get().removeFromWishlist(id);
    } else {
      get().addToWishlist(id);
    }
  },

  isWishlisted: (id) => get().wishlistIds.includes(id),
  clearWishlist: () => set({ wishlistIds: [] }),
}));
