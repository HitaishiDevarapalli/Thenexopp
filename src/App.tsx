import React, { useEffect, useState } from 'react';
import Lenis from '@studio-freight/lenis';
import Navbar from './components/layout/Navbar';
import Hero from './components/Hero';
import HomePage from './pages/HomePage';
import PropertyCategories from './components/PropertyCategories';
import FeaturedProperties from './components/FeaturedProperties';
import FranchiseMarketplace from './components/FranchiseMarketplace';
import BusinessMarketplace from './components/BusinessMarketplace';
import FinanceSection from './components/FinanceSection';
import WhyTheNexopp from './components/WhyTheNexopp';
import CTABanner from './components/common/CTABanner';
import AboutUs from './components/AboutUs';
import ContactUs from './components/ContactUs';
import Footer from './components/common/Footer';
import { FranchiseResalesPage } from './components/FranchiseResalesPage';
import { WishlistPage } from './components/WishlistPage';
import { FranchiseDetailsPage } from './components/FranchiseDetailsPage';
import { NewFranchisePage } from './components/NewFranchisePage';
import { BusinessListingsPage } from './components/BusinessListingsPage';
import PropertyDetailsPage from './components/PropertyDetailsPage';
import EnquiryPage from './components/EnquiryPage';
import CloseDealPage from './components/CloseDealPage';
import AdminPanel from './pages/AdminPanel';
import { FaArrowLeft } from 'react-icons/fa';
import { siteSettingsDb, updateSiteSettings, isModuleActive } from './db/marketplaceDb';
import { useAuth } from './context/AuthContext';
import { LoginModal } from './components/forms/LoginModal';
import { SellBusinessPage } from './components/forms/SellBusinessPage';
import { SellPropertyPage } from './components/forms/SellPropertyPage';
import NexOppAiAssistant from './components/NexOppAiAssistant';
import LoadingScreen from './components/common/LoadingScreen';

type PageType = 'home' | 'propertiesPage' | 'rentPage' | 'sellPropertyPage' | 'flatsPage' | 'villasPage' | 'housesPage' | 'landPage' | 'franchisePage' | 'businessPage' | 'sellBusinessPage' | 'financePage' | 'loansPage' | 'financeServicePage' | 'insurancePage' | 'franchiseResales' | 'wishlist' | 'franchiseDetails' | 'newFranchise' | 'businessListings' | 'propertyDetails' | 'closeDeal' | 'adminPortal' | 'aboutUsPage' | 'contactUsPage' | 'enquiryPage' | 'bookSlotPage';

// Subpage header with back button
const SubpageHeader = ({ title, leftTitle, onBack }: { title: string; leftTitle?: string; onBack: () => void }) => (
  <div className="subpage-header">
    <div className="container" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ position: 'absolute', left: 0, display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="circle-back-btn" onClick={onBack} title="Go Back">
          <FaArrowLeft />
        </button>
        {leftTitle && <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>{leftTitle}</h3>}
      </div>
      <h2 className="subpage-title" style={{ margin: 0 }}>{title}</h2>
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
  if (path.startsWith('/property/')) {
    return { page: 'propertyDetails' as PageType, propertyId: path.split('/')[2] };
  }
  if (path.startsWith('/buy/')) {
    return { page: 'closeDeal' as PageType, buyPropertyId: path.split('/')[2] };
  }
  if (path.startsWith('/franchise/details/')) {
    return { page: 'franchiseDetails' as PageType, franchiseId: path.split('/')[3] };
  }
  if (path.startsWith('/business/listings/')) {
    return { page: 'businessListings' as PageType, industry: decodeURIComponent(path.split('/')[3]) as 'Food' | 'Healthcare' | 'Retail & Stores' };
  }
  
  return { page: routeMap[path] || 'home' as PageType };
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

  // Auto-open login modal if user session is active but profile is incomplete
  useEffect(() => {
    if (user && user.profileCompleted === false) {
      openLoginModal();
    }
  }, [user, openLoginModal]);

  // Dynamic SEO Document Title update
  useEffect(() => {
    const pageData = parseUrl(window.location.pathname);
    const page = pageData.page;
    switch (page) {
      case 'home':
        document.title = "The Nexopp – India's Trusted Platform for Verified Listings to Buy and Sell";
        break;
      case 'propertiesPage':
      case 'flatsPage':
      case 'villasPage':
      case 'housesPage':
      case 'landPage':
        document.title = "Verified Real Estate Properties for Sale & Rent | The Nexopp";
        break;
      case 'franchisePage':
      case 'franchiseResales':
      case 'newFranchise':
        document.title = "Verified Franchise Opportunities & Resales in India | The Nexopp";
        break;
      case 'businessPage':
      case 'businessListings':
        document.title = "Operational Businesses for Buy and Sell | The Nexopp";
        break;
      case 'adminPortal':
        document.title = "Enterprise Admin Management Console | The Nexopp";
        break;
      case 'wishlist':
        document.title = "Saved Properties & Wishlist | The Nexopp";
        break;
      default:
        document.title = "The Nexopp – India's Trusted Platform for Verified Listings to Buy and Sell";
    }
  }, [currentPath]);
 
   // Sync state with URL
   useEffect(() => {
     const handlePopState = () => setCurrentPath(window.location.pathname);
     window.addEventListener('popstate', handlePopState);
     return () => window.removeEventListener('popstate', handlePopState);
   }, []);
 
   // Visitor counter increment
   useEffect(() => {
     if (!sessionStorage.getItem('nexopp_visited_session')) {
       sessionStorage.setItem('nexopp_visited_session', 'true');
       const currentCount = siteSettingsDb.analytics?.totalVisitors || 0;
       updateSiteSettings({
         analytics: {
           ...(siteSettingsDb.analytics || {}),
           totalVisitors: currentCount + 1
         }
       });
     }
   }, []);

  const routeData = parseUrl(currentPath);
  const currentPage = routeData.page;
  
  const [selectedFranchiseId] = useState<string | null>(routeData.franchiseId || null);
  const [selectedBusinessIndustry, setSelectedBusinessIndustry] = useState<'Food' | 'Healthcare' | 'Retail & Stores' | null>(routeData.industry || null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(routeData.propertyId || null);
  const [selectedBuyPropertyId, setSelectedBuyPropertyId] = useState<string | null>(routeData.buyPropertyId || null);
  const [enquiryTargetId, setEnquiryTargetId] = useState<string | null>(null);
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');

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
    let url = getPathForPage(page);
    let queryParams = '';

    if (typeof params === 'string') {
      queryParams = params;
    } else {
      if (page === 'propertyDetails') {
        const pid = params?.propertyId || selectedPropertyId;
        if (pid) url = `/property/${pid}`;
      }
      if (page === 'closeDeal') {
        const bid = params?.propertyId || selectedBuyPropertyId;
        if (bid) url = `/buy/${bid}`;
      }
      if (page === 'franchiseDetails') {
        const fid = params?.franchiseId || selectedFranchiseId;
        if (fid) url = `/franchise/details/${fid}`;
      }
      if (page === 'businessListings') {
        const ind = params?.industry || selectedBusinessIndustry;
        if (ind) url = `/business/listings/${encodeURIComponent(ind)}`;
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
      ) : currentPage === 'franchiseDetails' && selectedFranchiseId ? (
        <FranchiseDetailsPage 
          franchiseId={selectedFranchiseId} 
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
          onPropertyClick={(id) => {
            setSelectedPropertyId(id);
            navigateTo('propertyDetails', { propertyId: id });
          }}
          onBuyProperty={(id) => {
            setSelectedBuyPropertyId(id);
            navigateTo('closeDeal', { propertyId: id });
          }}
        />
      ) : currentPage === 'propertyDetails' && selectedPropertyId ? (
        <PropertyDetailsPage 
          propertyId={selectedPropertyId} 
          onBack={navigateBack}            
          onPropertyClick={(id) => {
              setSelectedPropertyId(id);
              navigateTo('propertyDetails', { propertyId: id });
            }}
          onBuyProperty={(id) => {
            setSelectedBuyPropertyId(id);
            navigateTo('closeDeal');
          }}
          onContactBroker={(id) => {
            setEnquiryTargetId(id);
            navigateTo('enquiryPage');
          }}
          onBookSlot={(id) => {
            setEnquiryTargetId(id);
            navigateTo('bookSlotPage');
          }}
        />
      ) : (currentPage === 'enquiryPage' || currentPage === 'bookSlotPage') && enquiryTargetId ? (
        <EnquiryPage
          propertyId={enquiryTargetId}
          mode={currentPage === 'bookSlotPage' ? 'book' : 'contact'}
          onBack={navigateBack}
        />
      ) : currentPage === 'closeDeal' && selectedBuyPropertyId ? (
        <CloseDealPage 
          propertyId={selectedBuyPropertyId} 
          onBack={navigateBack} 
        />
      ) : currentPage === 'businessListings' && selectedBusinessIndustry ? (
        <BusinessListingsPage 
          industry={selectedBusinessIndustry} 
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
            title="Properties Marketplace"
            subtitle="Explore verified residential, commercial, plots and new projects across India"
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

      ) : (currentPage === 'rentPage' || currentPage === 'flatsPage' || currentPage === 'villasPage' || currentPage === 'housesPage' || currentPage === 'landPage') ? (
        <PropertyCategories 
          title={
            currentPage === 'rentPage' ? 'Rental Properties Marketplace' :
            currentPage === 'flatsPage' ? 'Flats & Apartments' :
            currentPage === 'villasPage' ? 'Villas' :
            currentPage === 'housesPage' ? 'Individual Houses' : 'Lands & Plots'
          }
          subtitle={
            currentPage === 'rentPage' ? 'Explore verified residential & commercial properties for rent' :
            currentPage === 'flatsPage' ? 'Explore 1, 2, 3 & 4+ BHK luxury apartments and gated societies' :
            currentPage === 'villasPage' ? 'Discover premium luxury villas and row houses' :
            currentPage === 'housesPage' ? 'Discover independent houses, villas and bungalows for sale & rent' : 'Verified residential plots, commercial lands and agricultural layouts'
          }
          onBack={navigateBack}
          initialCategory={
            currentPage === 'rentPage' ? 'Rent' :
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
        <NexOppAiAssistant 
          onNavigate={(page) => navigateTo(page as PageType)}
          onPropertyClick={(id) => {
            setSelectedPropertyId(id);
            navigateTo('propertyDetails', { propertyId: id });
          }}
        />
      )}
      <LoginModal />
    </div>
  );
};

export default App;
