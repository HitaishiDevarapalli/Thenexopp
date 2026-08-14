import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App.tsx'
import { WishlistProvider } from './context/WishlistContext.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { LocationProvider } from './context/LocationContext.tsx'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './api/queryClient.ts'

// Image and Media Asset Protection (OLX-style: prevents right click save on images while DevTools/Inspect remains functional)
if (typeof window !== 'undefined') {
  document.addEventListener('contextmenu', (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === 'IMG' || target.closest('.property-card-img') || target.closest('.listing-card-img') || target.closest('.wishlist-card-img') || target.closest('.nx-gallery-img'))) {
      e.preventDefault();
    }
  }, { capture: true });

  document.addEventListener('dragstart', (e: DragEvent) => {
    const target = e.target as HTMLElement | null;
    if (target && target.tagName === 'IMG') {
      e.preventDefault();
    }
  }, { capture: true });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LocationProvider>
          <WishlistProvider>
            <App />
          </WishlistProvider>
        </LocationProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)

