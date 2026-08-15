/**
 * Google Analytics 4 (GA4) Integration Utility
 * Initializes GA4 asynchronously without blocking Core Web Vitals (FCP, LCP, TBT).
 * Only activates if a valid VITE_GA_MEASUREMENT_ID is provided in environment.
 */

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let isInitialized = false;

export const initGA = (): void => {
  if (typeof window === 'undefined' || isInitialized) return;

  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  if (!measurementId || typeof measurementId !== 'string' || !measurementId.startsWith('G-')) {
    return;
  }

  try {
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', measurementId, {
      send_page_view: false, // We control page views explicitly on SPA route changes
      anonymize_ip: true,
    });

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);

    isInitialized = true;
  } catch (err) {
    console.warn('GA initialization deferred:', err);
  }
};

export const trackPageView = (path: string, title?: string): void => {
  if (typeof window === 'undefined') return;

  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!measurementId || !window.gtag) return;

  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title || document.title,
    page_location: window.location.href,
  });
};

export const trackEvent = (eventName: string, params: Record<string, unknown> = {}): void => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', eventName, params);
};
