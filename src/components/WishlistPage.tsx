import React, { useEffect } from 'react';
import { useWishlist } from '../context/WishlistContext';
import { propertiesDb, franchiseDb, businessDb, dealersDb } from '../db/marketplaceDb';
import { FaHeart, FaArrowLeft, FaMapMarkerAlt, FaShoppingCart, FaTimes } from 'react-icons/fa';

interface WishlistPageProps {
  onBack: () => void;
  onPropertyClick?: (id: string) => void;
  onBuyProperty?: (id: string) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({ onBack, onPropertyClick, onBuyProperty }) => {
  const { wishlistItems, toggleWishlist } = useWishlist();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const resolvedProperties = wishlistItems.map((id: string) => {
    let prop = propertiesDb.find(p => p.id === id);
    if (prop) return { ...prop, type: prop.category };
    
    let fran = franchiseDb.find(f => f.id === id);
    if (fran) {
      const index = parseInt(fran.id.replace(/\D/g, '')) || 1;
      const dealerId = index % 2 === 0 ? 'D2' : 'D1';
      return { id: fran.id, title: fran.brand, image: fran.image, priceDisplay: fran.investmentDisplay, area: fran.location.split(',')[1]?.trim() || fran.location, city: fran.city || 'India', dealerId };
    }

    let biz = businessDb.find(b => b.id === id);
    if (biz) {
      const index = parseInt(biz.id.replace(/\D/g, '')) || 1;
      const dealerId = index % 2 === 0 ? 'D2' : 'D1';
      return { id: biz.id, title: biz.name, image: biz.image, priceDisplay: biz.priceDisplay, area: biz.location.split(',')[1]?.trim() || biz.location, city: biz.city || 'India', dealerId };
    }
    
    return null;
  }).filter(Boolean) as any[];

  const getDealer = (dealerId?: string) => {
    if (!dealerId) return null;
    return dealersDb.find(d => d.id === dealerId) || null;
  };

  return (
    <div className="franchise-resales-page">
      <div className="franchise-resales-header" style={{ padding: '3rem 0 2rem' }}>
        <div className="container" style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
          <button className="circle-back-btn" style={{ position: 'absolute', left: '15px' }} onClick={onBack} title="Go Back">
            <FaArrowLeft />
          </button>
          <div className="header-content" style={{ textAlign: 'center' }}>
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <FaHeart style={{ color: '#ff4757' }} /> Favourites
            </h1>
            <p className="page-subtitle">
              You have {resolvedProperties.length} saved properties.
            </p>
          </div>
        </div>
      </div>

      <div className="container section-padding" style={{ paddingTop: '2rem' }}>
        <div className="wishlist-list" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '2rem' }}>
          {resolvedProperties.length === 0 ? (
            <div className="empty-wishlist" style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '12px' }}>
              <FaHeart style={{ fontSize: '3rem', color: '#ccc', marginBottom: '1rem' }} />
              <h3>Your favourites list is empty</h3>
              <p>Save your favorite properties and businesses to view them here.</p>
            </div>
          ) : (
            resolvedProperties.map(prop => (
              <div key={prop.id} className="feed-card premium-card landscape-card" style={{ width: '100%' }}>
                <div className="feed-card-image-wrap">
                  <img 
                    src={prop.image} 
                    alt={prop.title} 
                    className="feed-card-img" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => onPropertyClick?.(prop.id)}
                  />
                  <button 
                    className="wishlist-remove-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(prop.id);
                    }}
                    title="Remove from Favourites"
                  >
                    <FaTimes />
                  </button>
                  <button 
                    className="buy-now-badge"
                    onClick={(e) => {
                      e.stopPropagation();
                      onBuyProperty?.(prop.id);
                    }}
                  >
                    <FaShoppingCart /> Buy
                  </button>
                </div>
                <div className="feed-card-body" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h4 
                      className="feed-prop-title" 
                      style={{ fontSize: '1.4rem', marginBottom: '0.5rem', cursor: 'pointer' }}
                      onClick={() => onPropertyClick?.(prop.id)}
                    >
                      {prop.title}
                    </h4>
                    <h3 className="feed-prop-price" style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>₹{prop.priceDisplay.replace('₹', '')}</h3>
                  </div>
                  
                  <div className="feed-card-footer" style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="footer-left">
                      <p className="feed-prop-location" style={{ margin: 0 }}>
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(prop.area + ', ' + prop.city)}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="location-link"
                          title="View on Google Maps"
                        >
                          <FaMapMarkerAlt /> {prop.area}, {prop.city}
                        </a>
                      </p>
                      <p className="feed-prop-seller" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        📅 Posted: Recently
                      </p>
                    </div>
                    <div className="footer-right">
                      {getDealer(prop.dealerId) ? (
                        <div className="feed-seller-action-container">
                          <div className="feed-seller-label-group">
                            <span className="feed-seller-label">Seller</span>
                            <span className="feed-seller-rating">⭐ {getDealer(prop.dealerId)?.rating}</span>
                          </div>
                          <div className="feed-seller-photo-wrap">
                            <img 
                              src={getDealer(prop.dealerId)?.photo || getDealer(prop.dealerId)?.logo} 
                              alt={getDealer(prop.dealerId)?.companyName} 
                              className="feed-seller-photo-btn" 
                              title={getDealer(prop.dealerId)?.companyName} 
                            />
                          </div>
                        </div>
                      ) : (
                        <button className="btn btn-gold btn-sm feed-view-btn" onClick={() => onPropertyClick?.(prop.id)}>View Details</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
