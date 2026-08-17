import React, { useEffect, useState } from 'react';
import { useWishlist } from '../context/WishlistContext';
import { propertiesDb, franchiseDb, businessDb, API_BASE_URL } from '../db/marketplaceDb';
import { useAuth } from '../context/AuthContext';
import { 
  FaHeart, 
  FaArrowLeft, 
  FaMapMarkerAlt, 
  FaTimes, 
  FaInbox, 
  FaLock
} from 'react-icons/fa';

interface WishlistPageProps {
  onBack: () => void;
  onPropertyClick?: (id: string) => void;
  onBuyProperty?: (id: string) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({ onBack, onPropertyClick, onBuyProperty }) => {
  const { wishlistItems, toggleWishlist } = useWishlist();
  const { user, openLoginModal } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [dbFavorites, setDbFavorites] = useState<any[]>([]);
  const [dbEnquiries, setDbEnquiries] = useState<any[]>([]);
  const [dbBookings, setDbBookings] = useState<any[]>([]);

  // Load and fetch customer dashboard metrics directly from database
  const fetchDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userPhone = user.phone || (user as any).mobile || '';
      const userId = user.id || '';
      const params = new URLSearchParams();
      if (userPhone) params.set('phone', userPhone);
      if (userId) params.set('customerId', userId);

      // 1. Favorites from PostgreSQL
      const favRes = await fetch(`${API_BASE_URL}/api/favorites?${params.toString()}`, { credentials: 'include' });
      if (favRes.ok) {
        const favs = await favRes.json();
        if (Array.isArray(favs)) {
          setDbFavorites(favs);
        }
      }

      // 2. Enquiries from PostgreSQL
      const enqRes = await fetch(`${API_BASE_URL}/api/enquiries?mine=true`, { credentials: 'include' });
      if (enqRes.ok) {
        const enqs = await enqRes.json();
        if (Array.isArray(enqs)) {
          setDbEnquiries(enqs);
        }
      }

      // 3. Bookings from PostgreSQL
      const bookRes = await fetch(`${API_BASE_URL}/api/bookings?mine=true`, { credentials: 'include' });
      if (bookRes.ok) {
        const books = await bookRes.json();
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

  const getStatusColor = (status: string) => {
    switch ((status || '').toUpperCase()) {
      case 'CONFIRMED':
      case 'COMPLETED':
      case 'ACTIVE':
      case 'APPROVED':
        return '#059669';
      case 'PENDING':
      case 'REQUESTED':
      case 'NEW':
        return '#D97706';
      case 'CANCELLED':
      case 'REMOVED':
      case 'REJECTED':
        return '#DC2626';
      default:
        return '#4B5563';
    }
  };

  const renderFavoriteItem = (fav: any) => {
    const listingType = fav.listingType || 'PROPERTY';
    const isProp = listingType === 'PROPERTY';
    const targetId = String(fav.listingId || fav.id);
    
    let details: any = null;
    if (isProp) {
      details = fav.property || propertiesDb.find((p: any) => String(p.id) === targetId);
    } else {
      details = fav.business || businessDb.find((b: any) => String(b.id) === targetId) || franchiseDb.find((f: any) => String(f.id) === targetId);
    }

    const title = details?.title || details?.name || details?.brand || fav.title || 'Saved Listing';
    const image = details?.image || (details?.images && details.images[0]?.url) || fav.image || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80';
    const priceDisplay = details?.priceDisplay || details?.investmentDisplay || (details?.price ? `₹${details.price.toLocaleString()}` : '₹Ask Price');
    const city = details?.city || details?.location?.split(',')[1]?.trim() || 'Andhra Pradesh';
    const area = details?.area || details?.location?.split(',')[0]?.trim() || 'Verified Location';
    const listingStatus = details?.listingStatus || details?.status || 'ACTIVE';
    const isRemoved = fav.status === 'REMOVED';

    return (
      <div 
        key={fav.id || targetId} 
        className="wishlist-item-card"
        style={{
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '1rem',
          position: 'relative',
          backgroundColor: isRemoved ? '#FFF5F5' : '#FFFFFF',
          transition: 'all 0.2s',
          opacity: isRemoved ? 0.8 : 1,
          display: 'flex',
          gap: '16px'
        }}
      >
        {/* Thumbnail */}
        <div className="wishlist-item-thumb" style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, width: '140px', height: '100px' }}>
          <img 
            src={image} 
            alt={title} 
            style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer', borderRadius: '6px' }}
            onClick={() => isProp && onPropertyClick?.(targetId)}
          />
          <span style={{
            position: 'absolute',
            top: '6px',
            left: '6px',
            backgroundColor: isProp ? '#007A55' : '#D97706',
            color: '#FFFFFF',
            fontSize: '0.68rem',
            fontWeight: 800,
            padding: '2px 6px',
            borderRadius: '4px',
            textTransform: 'uppercase'
          }}>
            {listingType}
          </span>
        </div>

        {/* Details */}
        <div className="wishlist-item-details" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexGrow: 1 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <h4 
                style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', margin: 0, cursor: 'pointer' }}
                onClick={() => isProp && onPropertyClick?.(targetId)}
              >
                {title}
              </h4>
              <button 
                onClick={() => removeFavorite(fav.id, listingType, targetId)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px', fontSize: '1.1rem', display: 'flex', alignItems: 'center' }}
                title="Remove Favorite"
              >
                <FaTimes />
              </button>
            </div>
            <h3 style={{ color: '#007A55', fontSize: '1.15rem', fontWeight: 800, margin: '4px 0 6px' }}>
              {priceDisplay}
            </h3>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748B', fontSize: '0.82rem' }}>
              <FaMapMarkerAlt style={{ color: '#007A55' }} />
              <span>{area}, {city}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {isRemoved ? (
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#DC2626', backgroundColor: '#FEE2E2', padding: '3px 8px', borderRadius: '6px' }}>
                  ⚠️ {fav.removalReason || 'SOLD'}
                </span>
              ) : (
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: getStatusColor(listingStatus), backgroundColor: getStatusColor(listingStatus) + '10', padding: '3px 8px', borderRadius: '6px' }}>
                  ● {listingStatus}
                </span>
              )}
              
              {!isRemoved && isProp && (
                <button 
                  onClick={() => onBuyProperty?.(targetId)}
                  style={{
                    backgroundColor: '#007A55',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Contact
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', paddingBottom: '4rem' }}>
      
      {/* ── HEADER ── */}
      <div style={{
        backgroundColor: '#002B66',
        backgroundImage: 'linear-gradient(135deg, #002B66 0%, #004080 100%)',
        padding: '3rem 0',
        color: '#FFFFFF',
        position: 'relative',
        marginBottom: '2rem'
      }}>
        <div className="container" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <button 
            className="circle-back-btn" 
            style={{ 
              position: 'absolute', 
              left: '15px', 
              top: '0', 
              backgroundColor: 'rgba(255,255,255,0.15)', 
              color: '#FFFFFF',
              border: 'none'
            }} 
            onClick={onBack} 
            title="Go Back"
          >
            <FaArrowLeft />
          </button>
          
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
              My Profile & Dashboard
            </h1>
            <p style={{ color: '#A3D9C9', fontSize: '1rem', marginTop: '0.5rem', fontWeight: 500 }}>
              Trace your marketplace requests, inquiries, and bookmarked investments.
            </p>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <div className="container" style={{ padding: '0 16px' }}>
        
        {/* ── LOGIN WALL ── */}
        {!user ? (
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            padding: '4rem 2rem',
            textAlign: 'center',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#E6F4EA',
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
                color: '#FFFFFF',
                border: 'none',
                padding: '16px 36px',
                borderRadius: '12px',
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
            
            {/* Profile Card (Name Big, details) */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '2.5rem 1.5rem', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', textAlign: 'center' }}>
              <div style={{ width: '90px', height: '90px', borderRadius: '50%', backgroundColor: '#E6F4EA', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#007A55', fontSize: '2.5rem', fontWeight: 800 }}>
                {(user.name || 'U').charAt(0).toUpperCase()}
              </div>
              <h2 style={{ fontSize: '3rem', fontWeight: 900, color: '#0F172A', margin: '0 0 0.5rem 0', letterSpacing: '-1.5px', lineHeight: '1.1' }}>
                {user.name || 'User'}
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', fontSize: '1rem', color: '#64748B', fontWeight: 600, marginTop: '12px' }}>
                {user.phone && (
                  <span style={{ backgroundColor: '#F1F5F9', padding: '4px 12px', borderRadius: '20px' }}>
                    📞 {user.phone.startsWith('+91') ? user.phone : `+91 ${user.phone.trim()}`}
                  </span>
                )}
                {user.email && !user.email.includes('@nexopp.in') && !user.email.includes('@thenexopp') && (
                  <span style={{ backgroundColor: '#F1F5F9', padding: '4px 12px', borderRadius: '20px' }}>✉️ {user.email}</span>
                )}
                <span style={{ backgroundColor: '#F1F5F9', padding: '4px 12px', borderRadius: '20px' }}>📍 {user.district || 'India'}</span>
              </div>
            </div>

            {/* Favourites Section */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '2.5rem 2rem', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 850, color: '#0F172A', borderBottom: '3px solid #007A55', paddingBottom: '12px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '-0.5px' }}>
                <FaHeart style={{ color: '#EF4444' }} /> MY FAVORITES ({favoritesToShow.length})
              </h3>

              {/* 1. Property Favourites */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#475569', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderLeft: '3px solid #007A55', paddingLeft: '8px' }}>
                  🏡 Property Favorites
                </h4>
                {favoritesToShow.filter(f => (f.listingType || 'PROPERTY') === 'PROPERTY').length === 0 ? (
                  <p style={{ color: '#94A3B8', fontStyle: 'italic', margin: 0, paddingLeft: '12px' }}>No property favorites bookmarked.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {favoritesToShow.filter(f => (f.listingType || 'PROPERTY') === 'PROPERTY').map(fav => renderFavoriteItem(fav))}
                  </div>
                )}
              </div>

              {/* 2. Business Favourites */}
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#475569', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderLeft: '3px solid #D97706', paddingLeft: '8px' }}>
                  💼 Business Favorites
                </h4>
                {favoritesToShow.filter(f => f.listingType !== 'PROPERTY').length === 0 ? (
                  <p style={{ color: '#94A3B8', fontStyle: 'italic', margin: 0, paddingLeft: '12px' }}>No business favorites bookmarked.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {favoritesToShow.filter(f => f.listingType !== 'PROPERTY').map(fav => renderFavoriteItem(fav))}
                  </div>
                )}
              </div>
            </div>

            {/* Enquiries Section */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '2.5rem 2rem', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 850, color: '#0F172A', borderBottom: '3px solid #007A55', paddingBottom: '12px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '-0.5px' }}>
                <FaInbox style={{ color: '#007A55' }} /> SENT ENQUIRIES & SLOT BOOKINGS
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {dbEnquiries.length === 0 && dbBookings.length === 0 ? (
                  <p style={{ color: '#94A3B8', fontStyle: 'italic', margin: 0, paddingLeft: '12px' }}>No enquiries or viewings submitted yet.</p>
                ) : (
                  <>
                    {/* Render Enquiries */}
                    {dbEnquiries.map((enq) => (
                      <div key={enq.id} style={{ border: '1px solid #E2E8F0', padding: '16px 20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <strong style={{ fontSize: '1.05rem', color: '#1E293B', display: 'block' }}>{enq.listingTitle}</strong>
                          {enq.message && <p style={{ margin: '6px 0', fontSize: '0.88rem', color: '#475569', fontStyle: 'italic', paddingLeft: '8px', borderLeft: '2px solid #007A55' }}>"{enq.message}"</p>}
                          <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Sent on {new Date(enq.createdAt).toLocaleDateString()}</span>
                        </div>
                        <span style={{ backgroundColor: '#ECFDF5', color: '#059669', fontSize: '0.75rem', fontWeight: 800, padding: '6px 12px', borderRadius: '6px', textTransform: 'uppercase' }}>{enq.status}</span>
                      </div>
                    ))}

                    {/* Render Bookings */}
                    {dbBookings.map((book) => {
                      let title = 'Viewing Appointment';
                      const details = book.property || book.business;
                      if (details) {
                        title = details.title || details.name || title;
                      }
                      return (
                        <div key={book.id} style={{ border: '1px solid #E2E8F0', padding: '16px 20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', flexWrap: 'wrap', gap: '12px' }}>
                          <div>
                            <strong style={{ fontSize: '1.05rem', color: '#1E293B', display: 'block' }}>📅 Viewing: {title}</strong>
                            <div style={{ display: 'flex', gap: '12px', fontSize: '0.82rem', color: '#64748B', marginTop: '4px' }}>
                              <span>Date: <strong>{book.bookingDate}</strong></span>
                              <span>Time: <strong>{book.bookingTime}</strong></span>
                            </div>
                            {book.notes && <span style={{ fontSize: '0.8rem', color: '#64748B', display: 'block', marginTop: '4px' }}>Notes: {book.notes}</span>}
                          </div>
                          <span style={{ backgroundColor: '#FFFBEB', color: '#B45309', border: '1px solid #FDE68A', fontSize: '0.75rem', fontWeight: 800, padding: '6px 12px', borderRadius: '6px', textTransform: 'uppercase' }}>{book.status}</span>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
