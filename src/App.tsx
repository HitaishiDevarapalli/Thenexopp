import React, { useEffect, useState, lazy, Suspense } from 'react';
import Lenis from '@studio-freight/lenis';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import WhyTheNexopp from './components/WhyTheNexopp';
import CTABanner from './components/common/CTABanner';
import ContactUs from './components/ContactUs';
import Footer from './components/common/Footer';
import { FaArrowLeft } from 'react-icons/fa';
import { siteSettingsDb, updateSiteSettings, isModuleActive, propertiesDb, isInitialSyncCompleted } from './db/marketplaceDb';
import { useAuth } from './context/AuthContext';
import LoadingScreen from './components/common/LoadingScreen';
import { updateSEO } from './utils/seo';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Route-level Code Splitting: Lazy-load subpages, heavy forms & admin panel
const LoginModal = lazy(() => import('./components/forms/LoginModal').then(m => ({ default: m.LoginModal })));
const PropertyCategories = lazy(() => import('./components/PropertyCategories'));
const FranchiseMarketplace = lazy(() => import('./components/FranchiseMarketplace'));
const BusinessMarketplace = lazy(() => import('./components/BusinessMarketplace'));
const FinanceSection = lazy(() => import('./components/FinanceSection'));
const AboutUs = lazy(() => import('./components/AboutUs'));
const FranchiseResalesPage = lazy(() => import('./components/FranchiseResalesPage').then(m => ({ default: m.FranchiseResalesPage })));
const WishlistPage = lazy(() => import('./components/WishlistPage').then(m => ({ default: m.WishlistPage })));
const FranchiseDetailsPage = lazy(() => import('./components/FranchiseDetailsPage').then(m => ({ default: m.FranchiseDetailsPage })));
const NewFranchisePage = lazy(() => import('./components/NewFranchisePage').then(m => ({ default: m.NewFranchisePage })));
const BusinessListingsPage = lazy(() => import('./components/BusinessListingsPage').then(m => ({ default: m.BusinessListingsPage })));
const PropertyDetailsPage = lazy(() => import('./components/PropertyDetailsPage'));
const EnquiryPage = lazy(() => import('./components/EnquiryPage'));
const CloseDealPage = lazy(() => import('./components/CloseDealPage'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const SellBusinessPage = lazy(() => import('./components/forms/SellBusinessPage').then(m => ({ default: m.SellBusinessPage })));
const SellPropertyPage = lazy(() => import('./components/forms/SellPropertyPage').then(m => ({ default: m.SellPropertyPage })));
const NotFoundPage = lazy(() => import('./components/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const NexOppAiAssistant = lazy(() => import('./components/NexOppAiAssistant'));

type PageType = 'home' | 'propertiesPage' | 'rentPage' | 'sellPropertyPage' | 'flatsPage' | 'villasPage' | 'housesPage' | 'landPage' | 'franchisePage' | 'businessPage' | 'sellBusinessPage' | 'financePage' | 'loansPage' | 'financeServicePage' | 'insurancePage' | 'franchiseResales' | 'wishlist' | 'franchiseDetails' | 'newFranchise' | 'businessListings' | 'propertyDetails' | 'closeDeal' | 'adminPortal' | 'aboutUsPage' | 'contactUsPage' | 'enquiryPage' | 'bookSlotPage' | 'notFound';

// Subpage header with back button
const SubpageHeader = ({ title, leftTitle, onBack }: { title: string; leftTitle?: string; onBack: () => void }) => (
  <div className="subpage-header">
    <div className="container" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ position: 'absolute', left: 0, display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="circle-back-btn" onClick={onBack} title="Go Back">
          <FaArrowLeft />
        </button>
      </div>
      <h2>{title}</h2>
      {leftTitle && <span className="subpage-header-left-title">{leftTitle}</span>}
    </div>
  </div>
);

const routeMap: Record<string, PageType> = {
  '/': 'home',
  '/properties': 'propertiesPage',
  '/properties/rent': 'rentPage',
  '/properties/sell': 'sellPropertyPage',
  '/properties/flats': 'flatsPage',
  '/properties/villas': 'villasPage',
  '/properties/houses': 'housesPage',
  '/properties/lands': 'landPage',
  '/franchise': 'franchisePage',
  '/franchise/existing': 'franchiseResales',
  '/franchise/new': 'newFranchise',
  '/business': 'businessPage',
  '/business/sell': 'sellBusinessPage',
  '/finance': 'financePage',
  '/finance/loans': 'loansPage',
  '/finance/advisory': 'financeServicePage',
  '/finance/insurance': 'insurancePage',
  '/favourites': 'wishlist',
  '/admin': 'adminPortal',
  '/about': 'aboutUsPage',
  '/contact': 'contactUsPage',
  '/enquiry': 'enquiryPage',
  '/book-slot': 'bookSlotPage',
  '/secret-admin': 'adminPortal',
  '/portal': 'adminPortal',
  '/nexopp-admin': 'adminPortal',
};

const getPathForPage = (page: PageType): string => {
  const path = Object.keys(routeMap).find(k => routeMap[k] === page);
  return path || '/';
};

const parseUrl = (path: string) => {
  if (window.location.search.includes('admin=true') || window.location.search.includes('portal=true')) {
    return { page: 'adminPortal' as PageType };
  }
  let cleanPath = (path || '').split('?')[0].split('#')[0];
  if (cleanPath !== '/' && cleanPath.endsWith('/')) {
    cleanPath = cleanPath.slice(0, -1);
  }
  if (cleanPath.startsWith('/property/')) {
    const rawId = cleanPath.split('/')[2];
    return { page: 'propertyDetails' as PageType, propertyId: rawId ? decodeURIComponent(rawId) : undefined };
  }
  if (cleanPath.startsWith('/buy/')) {
    const rawId = cleanPath.split('/')[2];
    return { page: 'closeDeal' as PageType, buyPropertyId: rawId ? decodeURIComponent(rawId) : undefined };
  }
  if (cleanPath.startsWith('/franchise/details/')) {
    const rawId = cleanPath.split('/')[3];
    return { page: 'franchiseDetails' as PageType, franchiseId: rawId ? decodeURIComponent(rawId) : undefined };
  }
  if (cleanPath.startsWith('/business/listings/')) {
    const rawInd = cleanPath.split('/')[3];
    return { page: 'businessListings' as PageType, industry: rawInd ? decodeURIComponent(rawInd) as any : undefined };
  }
  if (cleanPath.startsWith('/enquiry/')) {
    const rawId = cleanPath.split('/')[2];
    return { page: 'enquiryPage' as PageType, propertyId: rawId ? decodeURIComponent(rawId) : undefined };
  }
  if (cleanPath.startsWith('/book-slot/')) {
    const rawId = cleanPath.split('/')[2];
    return { page: 'bookSlotPage' as PageType, propertyId: rawId ? decodeURIComponent(rawId) : undefined };
  }
  if (routeMap[cleanPath]) {
    return { page: routeMap[cleanPath] };
  }
  if (cleanPath === '' || cleanPath === '/') {
    return { page: 'home' as PageType };
  }
  return { page: 'notFound' as PageType };
};

export const App: React.FC = () => {
  const { user, openLoginModal } = useAuth();
  const [heroBgIndex, setHeroBgIndex] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  const [currentPath, setCurrentPath] = useState(window.location.pathname + window.location.search);

  // Force update when global data/modules change
  const [, forceUpdate] = useState({});
  useEffect(() => {
    const handler = () => forceUpdate({});
    window.addEventListener('nexopp_data_changed', handler);
    return () => window.removeEventListener('nexopp_data_changed', handler);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  // Dynamic SEO Metadata, Canonical & Document Title update
  useEffect(() => {
    const pageData = parseUrl(window.location.pathname);
    updateSEO(pageData.page, { path: window.location.pathname });
  }, [currentPath]);
 
   // Sync state with URL
   useEffect(() => {
     const handlePopState = () => setCurrentPath(window.location.pathname);
     window.addEventListener('popstate', handlePopState);
     return () => window.removeEventListener('popstate', handlePopState);
   }, []);
 
   // Visitor counter increment
   useEffect(() => {
     if (isInitialSyncCompleted && !sessionStorage.getItem('nexopp_visited_session')) {
       sessionStorage.setItem('nexopp_visited_session', 'true');
       const currentCount = siteSettingsDb.analytics?.totalVisitors || 0;
       updateSiteSettings({
         analytics: {
           ...(siteSettingsDb.analytics || {}),
           totalVisitors: currentCount + 1
         }
       });
     }
   }, [isInitialSyncCompleted]);

  const routeData = parseUrl(currentPath);
  const currentPage = routeData.page;
  
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<string | null>(routeData.franchiseId || null);
  const [selectedBusinessIndustry, setSelectedBusinessIndustry] = useState<'Food' | 'Healthcare' | 'Retail & Stores' | null>(routeData.industry || null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(routeData.propertyId || null);
  const [selectedBuyPropertyId, setSelectedBuyPropertyId] = useState<string | null>(routeData.buyPropertyId || null);
  const [enquiryTargetId, setEnquiryTargetId] = useState<string | null>(null);
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');

  const activePropertyId = routeData.propertyId || selectedPropertyId;
  const activeBuyPropertyId = routeData.buyPropertyId || selectedBuyPropertyId;
  const activeFranchiseId = routeData.franchiseId || selectedFranchiseId;
  const activeBusinessIndustry = routeData.industry || selectedBusinessIndustry;

  const publicPages: PageType[] = ['home', 'aboutUsPage', 'adminPortal'];

  const navigateToUrl = (url: string) => {
    window.history.pushState({}, '', url);
    setCurrentPath(url);
    
    // Scroll to top immediately, taking Lenis into account
    const lenis = (window as any).lenis;
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  };

  const navigateTo = (page: PageType, params?: { propertyId?: string, franchiseId?: string, industry?: string } | string) => {
    if (!publicPages.includes(page) && !user) {
      openLoginModal();
      return;
    }

    let url = getPathForPage(page);
    let queryParams = '';

    if (typeof params === 'string') {
      queryParams = params;
    } else {
      if (page === 'propertyDetails') {
        const pid = params?.propertyId || activePropertyId;
        if (pid) url = `/property/${pid}`;
      }
      if (page === 'closeDeal') {
        const bid = params?.propertyId || activeBuyPropertyId;
        if (bid) url = `/buy/${bid}`;
      }
      if (page === 'franchiseDetails') {
        const fid = params?.franchiseId || activeFranchiseId;
        if (fid) url = `/franchise/details/${fid}`;
      }
      if (page === 'businessListings') {
        const ind = params?.industry || activeBusinessIndustry;
        if (ind) url = `/business/listings/${encodeURIComponent(ind)}`;
      }
      if (page === 'enquiryPage') {
        const pid = params?.propertyId || enquiryTargetId || activePropertyId;
        if (pid) url = `/enquiry/${pid}`;
        else url = '/enquiry';
      }
      if (page === 'bookSlotPage') {
        const pid = params?.propertyId || enquiryTargetId || activePropertyId;
        if (pid) url = `/book-slot/${pid}`;
        else url = '/book-slot';
      }
    }
    
    if (queryParams && !url.includes('?')) {
       url += queryParams.startsWith('?') ? queryParams : `?${queryParams}`;
    }
    navigateToUrl(url);
  };

  const navigateBack = () => {
    window.history.back();
    setTimeout(() => {
      const lenis = (window as any).lenis;
      if (lenis) {
        lenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo(0, 0);
      }
    }, 100);
  };

  useEffect(() => {
    if (currentPage === 'adminPortal') {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
      return;
    }

    document.documentElement.classList.add('lenis', 'lenis-smooth');

    // Initialize Lenis Smooth Scroll
    const lenis = new Lenis({
      duration: 0.9,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1,
      syncTouch: false,
    });
    
    (window as any).lenis = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      (window as any).lenis = null;
      document.documentElement.classList.remove('lenis', 'lenis-smooth');
    };
  }, [currentPage]);

  if (isInitialLoading) {
    return <LoadingScreen message="Loading..." />;
  }

  return (
    <div className="app-container">
      {currentPage !== 'adminPortal' && (
        <Navbar 
          currentPage={currentPage}
          isSubpage={currentPage !== 'home'}
          heroBgIndex={heroBgIndex} 
          onOpenWishlist={() => navigateTo('wishlist')} 
          onNavigateBusiness={(industry) => {
            setSelectedBusinessIndustry(industry);
            navigateTo('businessListings', { industry });
          }}
          onNavigateProperties={() => navigateTo('propertiesPage')}
          onNavigateFranchise={() => navigateTo('franchisePage')}
          onNavigateFinance={() => navigateTo('financePage')}
          onNavigateToPage={(page: any) => navigateTo(page)}
          onGoHome={() => {
            window.history.pushState({}, '', '/');
            setCurrentPath('/');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}
      
      {currentPage !== 'home' ? (
        <ErrorBoundary>
          <Suspense fallback={<LoadingScreen message="Loading page..." />}>
            {currentPage === 'adminPortal' ? (
              <AdminPanel onDataChange={() => {}} />
            ) : currentPage === 'franchiseResales' ? (
              <FranchiseResalesPage 
                onBack={navigateBack} 
                searchQuery={globalSearchQuery}
                onClearSearch={() => setGlobalSearchQuery('')}
                onPropertyClick={(id) => {
                  setSelectedPropertyId(id);
                  navigateTo('propertyDetails', { propertyId: id });
                }}
                onBuyProperty={(id) => {
                  setSelectedBuyPropertyId(id);
                  navigateTo('closeDeal', { propertyId: id });
                }}
              />
            ) : currentPage === 'franchiseDetails' && activeFranchiseId ? (
              <FranchiseDetailsPage 
                franchiseId={activeFranchiseId} 
                onBack={navigateBack} 
                onBuyProperty={(id) => {
                  setSelectedBuyPropertyId(id);
                  navigateTo('closeDeal', { propertyId: id });
                }}
              />
            ) : currentPage === 'newFranchise' ? (
              <NewFranchisePage 
                onBack={navigateBack} 
                searchQuery={globalSearchQuery}
                onClearSearch={() => setGlobalSearchQuery('')}
                onPropertyClick={(id) => {
                  setSelectedPropertyId(id);
                  navigateTo('propertyDetails', { propertyId: id });
                }}
                onBuyProperty={(id) => {
                  setSelectedBuyPropertyId(id);
                  navigateTo('closeDeal', { propertyId: id });
                }}
              />
            ) : currentPage === 'wishlist' ? (
              <WishlistPage 
                onBack={navigateBack} 
                onNavigateToPage={(page) => navigateTo(page as PageType)}
                onPropertyClick={(id) => {
                  setSelectedPropertyId(id);
                  navigateTo('propertyDetails', { propertyId: id });
                }}
                onBuyProperty={(id) => {
                  setSelectedBuyPropertyId(id);
                  navigateTo('closeDeal', { propertyId: id });
                }}
              />
            ) : currentPage === 'propertyDetails' && activePropertyId ? (
              <PropertyDetailsPage 
                propertyId={activePropertyId} 
                onBack={navigateBack}            
                onPropertyClick={(id) => {
                    setSelectedPropertyId(id);
                    navigateTo('propertyDetails', { propertyId: id });
                  }}
                onBuyProperty={(id) => {
                  setSelectedBuyPropertyId(id);
                  navigateTo('closeDeal', { propertyId: id });
                }}
                onContactBroker={(id) => {
                  setEnquiryTargetId(id);
                  navigateTo('enquiryPage', { propertyId: id });
                }}
                onBookSlot={(id) => {
                  setEnquiryTargetId(id);
                  navigateTo('bookSlotPage', { propertyId: id });
                }}
              />
            ) : (currentPage === 'enquiryPage' || currentPage === 'bookSlotPage') ? (
              <EnquiryPage
                propertyId={enquiryTargetId || activePropertyId || (propertiesDb[0]?.id || 'P1')}
                mode={currentPage === 'bookSlotPage' ? 'book' : 'contact'}
                onBack={navigateBack}
              />
            ) : currentPage === 'closeDeal' && activeBuyPropertyId ? (
              <CloseDealPage 
                propertyId={activeBuyPropertyId} 
                onBack={navigateBack} 
              />
            ) : currentPage === 'businessListings' && activeBusinessIndustry ? (
              <BusinessListingsPage 
                industry={activeBusinessIndustry} 
                onBack={navigateBack} 
                searchQuery={globalSearchQuery}
                onClearSearch={() => setGlobalSearchQuery('')}
                onPropertyClick={(id) => {
                  setSelectedPropertyId(id);
                  navigateTo('propertyDetails', { propertyId: id });
                }}
                onBuyProperty={(id) => {
                  setSelectedBuyPropertyId(id);
                  navigateTo('closeDeal', { propertyId: id });
                }}
              />
            ) : currentPage === 'propertiesPage' ? (
              !isModuleActive('properties') ? (
                <div style={{ textAlign: 'center', padding: '100px 24px', fontFamily: "'Outfit', sans-serif" }}>
                  <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', marginBottom: '12px' }}>Property Section Temporarily Offline</h2>
                  <p style={{ fontSize: '1.05rem', color: '#64748B', maxWidth: '500px', margin: '0 auto 24px auto' }}>This section is currently disabled by the site administrator. Please explore our active franchise and business listings.</p>
                  <button onClick={() => navigateTo('home')} className="btn btn-gold" style={{ padding: '12px 28px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}>Back to Homepage</button>
                </div>
              ) : (
                <PropertyCategories 
                  title="Verified Properties for Sale & Rent in India"
                  subtitle="Explore verified residential, commercial, plots and new projects across India."
                onBack={navigateBack}
                searchQuery={globalSearchQuery}
                onClearSearch={() => setGlobalSearchQuery('')}
                onPropertyClick={(id) => {
                  setSelectedPropertyId(id);
                  navigateTo('propertyDetails', { propertyId: id });
                }} 
                onBuyProperty={(id) => {
                  setSelectedBuyPropertyId(id);
                  navigateTo('closeDeal', { propertyId: id });
                }}
                onCategorySelect={(cat) => {
                  if (cat === 'BuyApartment') navigateTo('flatsPage');
                  else if (cat === 'BuyVilla') navigateTo('villasPage');
                  else if (cat === 'BuyHouse') navigateTo('housesPage');
                  else if (cat === 'BuyLand') navigateTo('landPage');
                }}
              />
              )
            ) : currentPage === 'rentPage' ? (
              <PropertyCategories 
                title="Properties for Rent"
                subtitle="Explore verified residential and commercial rental properties across India."
                initialCategory="Rent"
                onBack={navigateBack}
                searchQuery={globalSearchQuery}
                onClearSearch={() => setGlobalSearchQuery('')}
                onPropertyClick={(id) => {
                  setSelectedPropertyId(id);
                  navigateTo('propertyDetails', { propertyId: id });
                }} 
                onBuyProperty={(id) => {
                  setSelectedBuyPropertyId(id);
                  navigateTo('closeDeal', { propertyId: id });
                }}
              />
            ) : (currentPage === 'flatsPage' || currentPage === 'villasPage' || currentPage === 'housesPage' || currentPage === 'landPage') ? (
              <PropertyCategories 
                title={
                  currentPage === 'flatsPage' ? 'Flats & Apartments' :
                  currentPage === 'villasPage' ? 'Villas' :
                  currentPage === 'housesPage' ? 'Individual Houses' : 'Lands & Plots'
                }
                subtitle={
                  currentPage === 'flatsPage' ? 'Explore 1, 2, 3 & 4+ BHK luxury apartments and gated societies' :
                  currentPage === 'villasPage' ? 'Discover premium luxury villas and row houses' :
                  currentPage === 'housesPage' ? 'Discover independent houses, villas and bungalows for sale & rent' : 'Verified residential plots, commercial lands and agricultural layouts'
                }
                onBack={navigateBack}
                initialCategory={
                  currentPage === 'flatsPage' ? 'BuyApartment' :
                  currentPage === 'villasPage' ? 'BuyVilla' :
                  currentPage === 'housesPage' ? 'BuyHouse' : 'BuyLand'
                }
                searchQuery={globalSearchQuery}
                onClearSearch={() => setGlobalSearchQuery('')}
                onPropertyClick={(id) => {
                  setSelectedPropertyId(id);
                  navigateTo('propertyDetails', { propertyId: id });
                }} 
                onBuyProperty={(id) => {
                  setSelectedBuyPropertyId(id);
                  navigateTo('closeDeal', { propertyId: id });
                }}
                onCategorySelect={(cat) => {
                  if (cat === 'BuyApartment') navigateTo('flatsPage');
                  else if (cat === 'BuyVilla') navigateTo('villasPage');
                  else if (cat === 'BuyHouse') navigateTo('housesPage');
                  else if (cat === 'BuyLand') navigateTo('landPage');
                }}
              />
            ) : currentPage === 'sellPropertyPage' ? (
              <SellPropertyPage onBack={navigateBack} />
            ) : currentPage === 'franchisePage' ? (
              !isModuleActive('franchises') || siteSettingsDb.showFranchiseSection === false ? (
                <div style={{ textAlign: 'center', padding: '100px 24px', fontFamily: "'Outfit', sans-serif" }}>
                  <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', marginBottom: '12px' }}>Franchise Section Temporarily Offline</h2>
                  <p style={{ fontSize: '1.05rem', color: '#64748B', maxWidth: '500px', margin: '0 auto 24px auto' }}>This section is currently undergoing maintenance. Please explore our verified properties and business listings.</p>
                  <button onClick={() => navigateTo('home')} className="btn btn-gold" style={{ padding: '12px 28px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}>Back to Homepage</button>
                </div>
              ) : (
                <FranchiseMarketplace 
                  title="Franchise Marketplace"
                  subtitle="Explore top brand franchises, resales, and new commercial opportunities across India"
                  onBack={navigateBack}
                  onExploreResales={() => navigateTo('franchiseResales')} 
                  onExploreNew={() => navigateTo('newFranchise')}
                  onPropertyClick={(id) => {
                    setSelectedPropertyId(id);
                    navigateTo('propertyDetails', { propertyId: id });
                  }}
                  onBuyProperty={(id) => {
                    setSelectedBuyPropertyId(id);
                    navigateTo('closeDeal', { propertyId: id });
                  }}
                />
              )
            ) : currentPage === 'businessPage' ? (
              !isModuleActive('business') ? (
                <div style={{ textAlign: 'center', padding: '100px 24px', fontFamily: "'Outfit', sans-serif" }}>
                  <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', marginBottom: '12px' }}>Business Section Temporarily Offline</h2>
                  <p style={{ fontSize: '1.05rem', color: '#64748B', maxWidth: '500px', margin: '0 auto 24px auto' }}>This page is currently disabled by the site administrator. Please explore our active property and franchise listings.</p>
                  <button onClick={() => navigateTo('home')} className="btn btn-gold" style={{ padding: '12px 28px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}>Back to Homepage</button>
                </div>
              ) : (
                <BusinessMarketplace 
                  title="Business Marketplace"
                  subtitle="Discover verified businesses for sale, investment, and strategic acquisitions"
                  onBack={navigateBack}
                  onExploreCategory={(industry) => {
                    setSelectedBusinessIndustry(industry);
                    navigateTo('businessListings');
                  }}
                  onPropertyClick={(id) => {
                    setSelectedPropertyId(id);
                    navigateTo('propertyDetails', { propertyId: id });
                  }}
                />
              )
            ) : currentPage === 'sellBusinessPage' ? (
              <SellBusinessPage onBack={navigateBack} />
            ) : currentPage === 'aboutUsPage' ? (
              <>
                <SubpageHeader title="About Us & Leadership" onBack={navigateBack} />
                <AboutUs />
              </>
            ) : currentPage === 'contactUsPage' ? (
              <>
                <SubpageHeader title="Contact Us & Inquiry Desk" onBack={navigateBack} />
                <ContactUs />
              </>
            ) : currentPage === 'financePage' ? (
              <>
                <SubpageHeader title="Loans & Insurance Solutions" onBack={navigateBack} />
                <FinanceSection 
                  onCategorySelect={(cat) => {
                    if (cat === 'loans') navigateTo('loansPage');
                    else if (cat === 'insurance') navigateTo('insurancePage');
                  }}
                />
              </>
            ) : (currentPage === 'loansPage' || currentPage === 'insurancePage') ? (
              <>
                <SubpageHeader 
                  title={
                    currentPage === 'loansPage' ? 'Loans — Real Estate & Business Finance' : 'Insurance — Insurance Solutions'
                  } 
                  onBack={navigateBack} 
                />
                <FinanceSection 
                  initialCategory={
                    currentPage === 'loansPage' ? 'loans' : 'insurance'
                  }
                  onCategorySelect={(cat) => {
                    if (cat === 'loans') navigateTo('loansPage');
                    else if (cat === 'insurance') navigateTo('insurancePage');
                  }}
                />
              </>
            ) : (
              <>
                <SubpageHeader title="Page Not Found" onBack={() => navigateTo('home')} />
                <NotFoundPage onNavigate={(page) => navigateTo(page as PageType)} />
              </>
            )}
          </Suspense>
        </ErrorBoundary>
      ) : (
        <>
          <HomePage 
            onNavigate={(page) => navigateTo(page as PageType)} 
            onPropertyClick={(id) => {
              setSelectedPropertyId(id);
              navigateTo('propertyDetails', { propertyId: id });
            }}
          />
          <CTABanner />
          <WhyTheNexopp />
          <ContactUs />
        </>
      )}

      {currentPage !== 'adminPortal' && (
        <Footer 
          onNavigate={(page) => navigateTo(page as PageType)} 
          onScrollToSection={(sectionId) => {
            navigateTo('home');
            setTimeout(() => {
              const el = document.getElementById(sectionId);
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }, 150);
          }}
        />
      )}
      {currentPage !== 'adminPortal' && (
        <Suspense fallback={null}>
          <NexOppAiAssistant 
            onNavigate={(page) => navigateTo(page as PageType)}
            onPropertyClick={(id) => {
              setSelectedPropertyId(id);
              navigateTo('propertyDetails', { propertyId: id });
            }}
          />
        </Suspense>
      )}
      <Suspense fallback={null}>
        <LoginModal />
      </Suspense>
    </div>
  );
};

export default App;
