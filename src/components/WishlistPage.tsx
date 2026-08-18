import React, { useEffect, useState } from 'react';
import { useWishlist } from '../context/WishlistContext';
import { propertiesDb, franchiseDb, businessDb, API_BASE_URL, enquiriesDb } from '../db/marketplaceDb';
import { useAuth } from '../context/AuthContext';
import { 
  FaHeart, 
  FaRegHeart,
  FaMapMarkerAlt, 
  FaTimes, 
  FaInbox, 
  FaLock,
  FaBookmark,
  FaCalendarAlt,
  FaChevronRight,
  FaCog,
  FaPlus,
  FaBuilding,
  FaHome,
  FaSearch,
  FaUser,
  FaPhoneAlt
} from 'react-icons/fa';

interface WishlistPageProps {
  onBack: () => void;
  onPropertyClick?: (id: string) => void;
  onBuyProperty?: (id: string) => void;
  onNavigateToPage?: (page: string) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({ 
  onBack, 
  onPropertyClick, 
  onBuyProperty,
  onNavigateToPage 
}) => {
  const { wishlistItems, toggleWishlist } = useWishlist();
  const { user, openLoginModal, updateUserProfile } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [dbFavorites, setDbFavorites] = useState<any[]>([]);
  const [dbEnquiries, setDbEnquiries] = useState<any[]>([]);
  const [dbBookings, setDbBookings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'favorites' | 'enquiries' | 'searches' | 'settings'>('favorites');

  // Load and fetch customer dashboard metrics directly from database
  const fetchDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const rawPhone = user.phone || (user as any).mobile || '';
      const userPhone = rawPhone.replace(/\D/g, '');
      const userId = user.id || '';
      const userEmail = (user.email && !user.email.includes('@nexopp.in') && !user.email.includes('@thenexopp')) ? user.email : '';
      const userName = user.name || '';

      const params = new URLSearchParams();
      if (userPhone) params.set('phone', userPhone);
      if (userId) params.set('customerId', userId);
      if (userEmail) params.set('email', userEmail);
      if (userName) params.set('name', userName);

      // 1. Favorites from PostgreSQL
      const favRes = await fetch(`${API_BASE_URL}/api/favorites?${params.toString()}`, { credentials: 'include' }).catch(() => null);
      if (favRes && favRes.ok) {
        const favs = await favRes.json().catch(() => null);
        if (Array.isArray(favs)) {
          setDbFavorites(favs);
        }
      }

      // 2. Enquiries from PostgreSQL merged with matching local enquiriesDb
      let serverEnqs: any[] = [];
      const enqRes = await fetch(`${API_BASE_URL}/api/enquiries?${params.toString()}&mine=true`, { credentials: 'include' }).catch(() => null);
      if (enqRes && enqRes.ok) {
        const enqs = await enqRes.json().catch(() => null);
        if (Array.isArray(enqs)) {
          serverEnqs = enqs;
        }
      }

      const mergedMap = new Map<string, any>();
      serverEnqs.forEach(e => { if (e && e.id) mergedMap.set(e.id, e); });

      const normUserPhone = userPhone.length >= 10 ? userPhone.slice(-10) : userPhone;
      (enquiriesDb || []).forEach(localEnq => {
        if (!localEnq) return;
        const ePhone = String(localEnq.phone || '').replace(/\D/g, '');
        const normEPhone = ePhone.length >= 10 ? ePhone.slice(-10) : ePhone;
        const phoneMatch = normUserPhone && normEPhone && normEPhone.includes(normUserPhone);
        const emailMatch = userEmail && localEnq.email && localEnq.email.toLowerCase() === userEmail.toLowerCase();
        const idMatch = userId && ((localEnq as any).customerId === userId || (localEnq as any).userId === userId);
        const nameMatch = userName && userName !== 'User' && localEnq.customerName && localEnq.customerName.toLowerCase().includes(userName.toLowerCase());

        if ((phoneMatch || emailMatch || idMatch || nameMatch || (!normUserPhone && !userEmail && !userId)) && localEnq.id) {
          if (!mergedMap.has(localEnq.id)) {
            mergedMap.set(localEnq.id, localEnq);
          }
        }
      });

      const finalEnquiries = Array.from(mergedMap.values()).sort((a, b) => 
        new Date(b.createdAt || b.date || 0).getTime() - new Date(a.createdAt || a.date || 0).getTime()
      );
      setDbEnquiries(finalEnquiries);

      // 3. Bookings from PostgreSQL
      const bookRes = await fetch(`${API_BASE_URL}/api/bookings?${params.toString()}&mine=true`, { credentials: 'include' }).catch(() => null);
      if (bookRes && bookRes.ok) {
        const books = await bookRes.json().catch(() => null);
        if (Array.isArray(books)) {
          setDbBookings(books);
        }
      }
    } catch (e) {
      console.warn('Dashboard DB fetch failed:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchDashboardData();
  }, [user?.id, user?.phone]);

  // Combine database favorites with active wishlist state
  const mergedFavoritesMap = new Map<string, any>();

  // Add DB items
  dbFavorites.forEach(f => {
    const key = String(f.listingId || f.id);
    if (key && f.status !== 'REMOVED') {
      mergedFavoritesMap.set(key, f);
    }
  });

  // Also include any items active in wishlist context
  wishlistItems.forEach(id => {
    const strId = String(id);
    if (!mergedFavoritesMap.has(strId)) {
      mergedFavoritesMap.set(strId, {
        id: strId,
        listingId: strId,
        listingType: 'PROPERTY',
        status: 'ACTIVE'
      });
    }
  });

  const favoritesToShow = Array.from(mergedFavoritesMap.values());

  const removeFavorite = async (favIdOrListingId: string, listingType?: string, listingId?: string) => {
    const idToToggle = listingId || favIdOrListingId;
    await toggleWishlist(idToToggle, (listingType as any) || 'PROPERTY');
    await fetchDashboardData();
  };

  const formattedPhone = user?.phone 
    ? (user.phone.startsWith('+91') ? user.phone : `+91 ${user.phone.trim()}`)
    : '+91 95539 25956';

  const userDistrict = user?.district || 'guntur';

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', padding: '6.5rem 0 5rem', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>
      <div className="container" style={{ maxWidth: '1140px', margin: '0 auto', padding: '0 16px' }}>
        
        {/* ── LOGIN WALL IF GUEST ── */}
        {!user ? (
          <div style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
            border: '1px solid #E2E8F0',
            padding: '4rem 2rem',
            textAlign: 'center',
            maxWidth: '580px',
            margin: '2rem auto'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#ECFDF5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              color: '#007A55'
            }}>
              <FaLock style={{ fontSize: '2rem' }} />
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.75rem' }}>Login Required</h2>
            <p style={{ color: '#64748B', marginBottom: '2rem', fontSize: '1rem', lineHeight: '1.6' }}>
              Access your personalized dashboard to manage favorite listings, track slot bookings, raise inquiries, and view activity history.
            </p>
            <button 
              onClick={openLoginModal}
              style={{
                backgroundColor: '#007A55',
                backgroundImage: 'linear-gradient(135deg, #007A55 0%, #047857 100%)',
                color: '#FFFFFF',
                border: 'none',
                padding: '16px 36px',
                borderRadius: '14px',
                fontSize: '1.05rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(0, 122, 85, 0.25)',
                transition: 'all 0.2s'
              }}
            >
              Sign In with Mobile OTP
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* ── TOP USER PROFILE BANNER CARD ── */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              padding: '28px 36px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '24px'
            }}>
              {/* Left Side: Avatar & Details */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '50%',
                  backgroundColor: '#D1FAE5',
                  color: '#007A55',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  fontWeight: 800,
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.15)'
                }}>
                  {(user.name || 'U').charAt(0).toUpperCase()}
                </div>

                <div>
                  <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.5px' }}>
                    {(user.name || 'mani').toLowerCase()}
                  </h1>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#64748B', fontSize: '0.92rem', marginTop: '6px', fontWeight: 600 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FaPhoneAlt style={{ fontSize: '11px', color: '#059669' }} /> {formattedPhone}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FaMapMarkerAlt style={{ fontSize: '12px', color: '#059669' }} /> {userDistrict.toLowerCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side: 4 Stat Metrics Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '28px', flexWrap: 'wrap' }}>
                {/* Metric 1: Favorites */}
                <div style={{ textAlign: 'center', paddingRight: '28px', borderRight: '1px solid #F1F5F9' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    backgroundColor: '#ECFDF5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 6px',
                    fontSize: '16px'
                  }}>
                    <FaHeart />
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>{favoritesToShow.length}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Favorites</div>
                </div>

                {/* Metric 2: Enquiries Sent */}
                <div style={{ textAlign: 'center', paddingRight: '28px', borderRight: '1px solid #F1F5F9' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    backgroundColor: '#ECFDF5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 6px',
                    fontSize: '16px'
                  }}>
                    <FaInbox />
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>{dbEnquiries.length}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Enquiries Sent</div>
                </div>

                {/* Metric 3: Saved Searches */}
                <div style={{ textAlign: 'center', paddingRight: '28px', borderRight: '1px solid #F1F5F9' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    backgroundColor: '#ECFDF5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 6px',
                    fontSize: '16px'
                  }}>
                    <FaBookmark />
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>1</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Saved Searches</div>
                </div>

                {/* Metric 4: Joined Date */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    backgroundColor: '#ECFDF5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 6px',
                    fontSize: '16px'
                  }}>
                    <FaCalendarAlt />
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Joined</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>Aug 2026</div>
                </div>
              </div>
            </div>

            {/* ── SUB-NAVIGATION TABS ── */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '32px',
              borderBottom: '1px solid #E2E8F0',
              paddingBottom: '0px',
              margin: '8px 0 4px'
            }}>
              <button
                onClick={() => setActiveTab('favorites')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '12px 4px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: activeTab === 'favorites' ? '#007A55' : '#64748B',
                  borderBottom: activeTab === 'favorites' ? '3px solid #007A55' : '3px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease'
                }}
              >
                <FaHeart style={{ color: activeTab === 'favorites' ? '#007A55' : '#94A3B8' }} />
                <span>My Favorites</span>
              </button>

              <button
                onClick={() => setActiveTab('enquiries')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '12px 4px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: activeTab === 'enquiries' ? '#007A55' : '#64748B',
                  borderBottom: activeTab === 'enquiries' ? '3px solid #007A55' : '3px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease'
                }}
              >
                <FaInbox style={{ color: activeTab === 'enquiries' ? '#007A55' : '#94A3B8' }} />
                <span>Sent Enquiries</span>
              </button>

              <button
                onClick={() => setActiveTab('searches')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '12px 4px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: activeTab === 'searches' ? '#007A55' : '#64748B',
                  borderBottom: activeTab === 'searches' ? '3px solid #007A55' : '3px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease'
                }}
              >
                <FaBookmark style={{ color: activeTab === 'searches' ? '#007A55' : '#94A3B8' }} />
                <span>Saved Searches</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '12px 4px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: activeTab === 'settings' ? '#007A55' : '#64748B',
                  borderBottom: activeTab === 'settings' ? '3px solid #007A55' : '3px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease'
                }}
              >
                <FaCog style={{ color: activeTab === 'settings' ? '#007A55' : '#94A3B8' }} />
                <span>Account Settings</span>
              </button>
            </div>

            {/* ── TWO COLUMN MAIN LAYOUT GRID ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
              
              {/* LEFT COLUMN: MAIN CONTENT AREA */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                
                {/* 1. MY FAVORITES SECTION */}
                {(activeTab === 'favorites' || activeTab === 'enquiries') && (
                  <div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', marginBottom: '16px', letterSpacing: '-0.3px' }}>
                      My Favorites ({favoritesToShow.length})
                    </h2>

                    {favoritesToShow.length === 0 ? (
                      <div style={{ backgroundColor: '#FFFFFF', padding: '2rem', borderRadius: '20px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                        <FaRegHeart style={{ fontSize: '32px', color: '#94A3B8', marginBottom: '8px' }} />
                        <p style={{ margin: 0, color: '#64748B', fontWeight: 600 }}>No favorites bookmarked yet.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {favoritesToShow.map((fav) => {
                          const listingType = fav.listingType || 'PROPERTY';
                          const isProp = listingType === 'PROPERTY';
                          const targetId = String(fav.listingId || fav.id);
                          
                          let details: any = null;
                          if (isProp) {
                            details = fav.property || propertiesDb.find((p: any) => String(p.id) === targetId);
                          } else {
                            details = fav.business || businessDb.find((b: any) => String(b.id) === targetId) || franchiseDb.find((f: any) => String(f.id) === targetId);
                          }

                          const title = details?.title || details?.name || details?.brand || fav.title || 'Residential Apartment';
                          const image = details?.image || (details?.images && details.images[0]?.url) || fav.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80';
                          const priceDisplay = details?.priceDisplay || details?.investmentDisplay || (details?.price ? `₹${(details.price / 100000).toFixed(2)} Lakh` : '₹100.00 Lakh');
                          const city = details?.city || details?.location?.split(',')[1]?.trim() || 'Hyderabad';
                          const area = details?.area || details?.location?.split(',')[0]?.trim() || 'Ward 115 Balaji Nagar';
                          const publishedDate = details?.createdDate || 'Aug 18, 2026';

                          return (
                            <div 
                              key={fav.id || targetId} 
                              style={{
                                backgroundColor: '#FFFFFF',
                                border: '1px solid #E2E8F0',
                                borderRadius: '20px',
                                padding: '18px 20px',
                                display: 'flex',
                                gap: '20px',
                                alignItems: 'center',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                                flexWrap: 'wrap'
                              }}
                            >
                              {/* Left Thumbnail with Badge */}
                              <div style={{ position: 'relative', width: '190px', height: '125px', borderRadius: '14px', overflow: 'hidden', flexShrink: 0 }}>
                                <img 
                                  src={image} 
                                  alt={title} 
                                  style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                                  onClick={() => isProp && onPropertyClick?.(targetId)}
                                />
                                <span style={{
                                  position: 'absolute',
                                  top: '8px',
                                  left: '8px',
                                  backgroundColor: '#007A55',
                                  color: '#FFFFFF',
                                  fontSize: '10.5px',
                                  fontWeight: 800,
                                  padding: '3px 8px',
                                  borderRadius: '5px',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.04em'
                                }}>
                                  {listingType}
                                </span>

                                <div style={{
                                  position: 'absolute',
                                  bottom: '8px',
                                  left: '8px',
                                  right: '8px',
                                  backgroundColor: 'rgba(255, 255, 255, 0.92)',
                                  backdropFilter: 'blur(4px)',
                                  color: '#0F172A',
                                  fontSize: '9.5px',
                                  fontWeight: 800,
                                  padding: '4px 6px',
                                  borderRadius: '6px',
                                  textAlign: 'center',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em'
                                }}>
                                  {title}
                                </div>
                              </div>

                              {/* Details Area */}
                              <div style={{ flex: 1, minWidth: '240px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', gap: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <h3 
                                    style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0, cursor: 'pointer' }}
                                    onClick={() => isProp && onPropertyClick?.(targetId)}
                                  >
                                    {title}
                                  </h3>
                                  <button 
                                    onClick={() => removeFavorite(fav.id, listingType, targetId)}
                                    style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '2px', fontSize: '1.2rem' }}
                                    title="Remove Favorite"
                                  >
                                    <FaHeart />
                                  </button>
                                </div>

                                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#007A55' }}>
                                  {priceDisplay}
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', fontSize: '0.86rem' }}>
                                  <FaMapMarkerAlt style={{ color: '#059669', fontSize: '12px' }} />
                                  <span>{area}, {city}</span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ backgroundColor: '#ECFDF5', color: '#059669', fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      ● Published
                                    </span>
                                    <span style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      <FaCalendarAlt style={{ fontSize: '11px' }} /> {publishedDate}
                                    </span>
                                  </div>

                                  <button 
                                    onClick={() => onBuyProperty?.(targetId)}
                                    style={{
                                      backgroundColor: 'transparent',
                                      color: '#007A55',
                                      border: '1.5px solid #007A55',
                                      padding: '8px 22px',
                                      borderRadius: '10px',
                                      fontSize: '0.88rem',
                                      fontWeight: 800,
                                      cursor: 'pointer',
                                      transition: 'all 0.15s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = '#007A55';
                                      e.currentTarget.style.color = '#FFFFFF';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = 'transparent';
                                      e.currentTarget.style.color = '#007A55';
                                    }}
                                  >
                                    Contact
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. SENT ENQUIRIES & SLOT BOOKINGS SECTION */}
                {(activeTab === 'favorites' || activeTab === 'enquiries') && (
                  <div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', marginBottom: '16px', letterSpacing: '-0.3px' }}>
                      Sent Enquiries &amp; Slot Bookings
                    </h2>

                    {dbEnquiries.length === 0 && dbBookings.length === 0 ? (
                      <div style={{ backgroundColor: '#FFFFFF', padding: '2rem', borderRadius: '20px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                        <FaInbox style={{ fontSize: '32px', color: '#94A3B8', marginBottom: '8px' }} />
                        <p style={{ margin: 0, color: '#64748B', fontWeight: 600 }}>No enquiries or viewings submitted yet.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {dbEnquiries.map((enq) => (
                          <div 
                            key={enq.id} 
                            style={{ 
                              backgroundColor: '#FFFFFF', 
                              border: '1px solid #E2E8F0', 
                              padding: '16px 20px', 
                              borderRadius: '16px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                backgroundColor: '#ECFDF5',
                                color: '#059669',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '20px',
                                flexShrink: 0
                              }}>
                                <FaBuilding />
                              </div>
                              <div>
                                <strong style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', display: 'block' }}>
                                  {enq.listingTitle || 'Apartment'}
                                </strong>
                                {enq.message && (
                                  <div style={{ fontSize: '0.88rem', color: '#475569', margin: '3px 0', fontWeight: 600 }}>
                                    {enq.message.startsWith('Offered Price:') ? (
                                      <>Offered Price: <strong style={{ color: '#059669' }}>{enq.message.replace('Offered Price:', '').trim()}</strong></>
                                    ) : enq.message}
                                  </div>
                                )}
                                <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '2px' }}>
                                  Enquiry sent on {enq.date || new Date(enq.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ 
                                backgroundColor: '#ECFDF5', 
                                color: '#059669', 
                                fontSize: '11px', 
                                fontWeight: 800, 
                                padding: '4px 10px', 
                                borderRadius: '6px', 
                                textTransform: 'uppercase' 
                              }}>
                                {enq.status || 'NEW'}
                              </span>
                              <FaChevronRight style={{ color: '#CBD5E1', fontSize: '12px' }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. SAVED SEARCHES SECTION */}
                {activeTab === 'searches' && (
                  <div style={{ backgroundColor: '#FFFFFF', padding: '2rem', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', marginBottom: '16px' }}>Saved Searches</h2>
                    <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '1rem', color: '#0F172A' }}>Gachibowli &amp; Kondapur - 3 BHK Apartments</strong>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748B' }}>Price range: ₹75 Lakh - ₹1.5 Cr | Status: Active Email Alerts</p>
                      </div>
                      <span style={{ backgroundColor: '#ECFDF5', color: '#059669', fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '6px' }}>ACTIVE</span>
                    </div>
                  </div>
                )}

                {/* 4. ACCOUNT SETTINGS SECTION */}
                {activeTab === 'settings' && (
                  <div style={{ backgroundColor: '#FFFFFF', padding: '2rem', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', marginBottom: '16px' }}>Account Settings</h2>
                    <form onSubmit={(e) => { e.preventDefault(); alert('Profile updated successfully!'); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '500px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Full Name</label>
                        <input type="text" defaultValue={user.name} onChange={(e) => updateUserProfile({ name: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', fontWeight: 600 }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Phone Number</label>
                        <input type="text" defaultValue={user.phone} onChange={(e) => updateUserProfile({ phone: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', fontWeight: 600 }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Preferred District / Location</label>
                        <input type="text" defaultValue={user.district || 'Guntur'} onChange={(e) => updateUserProfile({ district: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', fontWeight: 600 }} />
                      </div>
                      <button type="submit" style={{ backgroundColor: '#007A55', color: '#FFFFFF', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', marginTop: '8px' }}>Save Changes</button>
                    </form>
                  </div>
                )}

              </div>

              {/* RIGHT COLUMN: QUICK ACTIONS SIDEBAR */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '24px',
                border: '1px solid #E2E8F0',
                padding: '24px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
              }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '0 0 20px 0', letterSpacing: '-0.3px' }}>
                  Quick Actions
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Action 1: Post New Property */}
                  <div 
                    onClick={() => onNavigateToPage?.('sellPropertyPage')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '16px',
                      border: '1px solid #F1F5F9',
                      backgroundColor: '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#F8FAFC';
                      e.currentTarget.style.borderColor = '#CBD5E1';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                      e.currentTarget.style.borderColor = '#F1F5F9';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        backgroundColor: '#ECFDF5',
                        color: '#059669',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        flexShrink: 0
                      }}>
                        <FaPlus />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A' }}>Post New Property</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>List your property for sale/rent</div>
                      </div>
                    </div>
                    <FaChevronRight style={{ color: '#94A3B8', fontSize: '12px' }} />
                  </div>

                  {/* Action 2: Browse Properties */}
                  <div 
                    onClick={() => onNavigateToPage?.('propertiesPage')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '16px',
                      border: '1px solid #F1F5F9',
                      backgroundColor: '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#F8FAFC';
                      e.currentTarget.style.borderColor = '#CBD5E1';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                      e.currentTarget.style.borderColor = '#F1F5F9';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        backgroundColor: '#ECFDF5',
                        color: '#059669',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        flexShrink: 0
                      }}>
                        <FaHome />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A' }}>Browse Properties</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>Find properties that match you</div>
                      </div>
                    </div>
                    <FaChevronRight style={{ color: '#94A3B8', fontSize: '12px' }} />
                  </div>

                  {/* Action 3: My Enquiries */}
                  <div 
                    onClick={() => setActiveTab('enquiries')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '16px',
                      border: '1px solid #F1F5F9',
                      backgroundColor: '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#F8FAFC';
                      e.currentTarget.style.borderColor = '#CBD5E1';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                      e.currentTarget.style.borderColor = '#F1F5F9';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        backgroundColor: '#ECFDF5',
                        color: '#059669',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        flexShrink: 0
                      }}>
                        <FaInbox />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A' }}>My Enquiries</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>Track your sent enquiries</div>
                      </div>
                    </div>
                    <FaChevronRight style={{ color: '#94A3B8', fontSize: '12px' }} />
                  </div>

                  {/* Action 4: Account Settings */}
                  <div 
                    onClick={() => setActiveTab('settings')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '16px',
                      border: '1px solid #F1F5F9',
                      backgroundColor: '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#F8FAFC';
                      e.currentTarget.style.borderColor = '#CBD5E1';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                      e.currentTarget.style.borderColor = '#F1F5F9';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        backgroundColor: '#ECFDF5',
                        color: '#059669',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        flexShrink: 0
                      }}>
                        <FaCog />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A' }}>Account Settings</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>Manage your profile</div>
                      </div>
                    </div>
                    <FaChevronRight style={{ color: '#94A3B8', fontSize: '12px' }} />
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
