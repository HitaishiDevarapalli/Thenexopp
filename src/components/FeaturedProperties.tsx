import React, { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart, FaShoppingCart, FaEye } from 'react-icons/fa';
import { useWishlist } from '../context/WishlistContext';
import { propertiesDb, getDistance } from '../db/marketplaceDb';
import { useLocationStore } from '../context/LocationContext';

interface FeaturedPropertiesProps {
  onPropertyClick?: (id: string) => void;
  onBuyProperty?: (id: string) => void;
  categoryFilter?: 'BuyApartment' | 'BuyHouse' | 'BuyLand';
}

export const FeaturedProperties: React.FC<FeaturedPropertiesProps> = ({ onPropertyClick, onBuyProperty, categoryFilter }) => {
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { location } = useLocationStore();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const handler = () => setTick(t => t + 1);
    window.addEventListener('nexopp_data_changed', handler);
    return () => window.removeEventListener('nexopp_data_changed', handler);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  tick;

  const filteredProperties = propertiesDb.filter(prop => {
    if (location && location.lat && location.lng) {
      if (prop.latitude && prop.longitude) {
        const dist = getDistance(location.lat, location.lng, prop.latitude, prop.longitude);
        (prop as any).distanceKm = Math.round(dist * 10) / 10;
        if (dist > 30) return false; // 30 KM radius proximity check
      } else {
        const loc = (location.city || location.displayName || '').toLowerCase();
        const matchCity = prop.city?.toLowerCase().includes(loc) || prop.state?.toLowerCase().includes(loc) || prop.area?.toLowerCase().includes(loc);
        if (!matchCity) return false;
      }
    }
    if (categoryFilter === 'BuyApartment') return prop.category === 'Apartment';
    if (categoryFilter === 'BuyHouse') return prop.category === 'Villa' || prop.category === 'House';
    if (categoryFilter === 'BuyLand') return prop.category === 'Plot';
    return true;
  }).sort((a, b) => ((a as any).distanceKm || 0) - ((b as any).distanceKm || 0));

  return (
    <section className="section-padding featured-properties-section">
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center', marginTop: '3rem' }}>
        {filteredProperties.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6B7280', fontSize: '1.1rem' }}>
            No listings found matching this category.
          </div>
        ) : (
          filteredProperties.map((prop) => (
            <div key={prop.id} className="property-card premium-card landscape-card" style={{ width: '100%' }}>
              <div className="property-image-container">
                <img 
                  src={prop.image || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'} 
                  alt={prop.title} 
                  loading="lazy"
                  decoding="async"
                  className="property-img" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => onPropertyClick?.(prop.id)}
                />
                
                {(prop.sold || prop.approvalStatus === 'Sold' || prop.listingStatus === 'Sold') && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      backgroundColor: '#DC2626',
                      color: '#FFFFFF',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      boxShadow: '0 2px 8px rgba(220, 38, 38, 0.4)',
                      zIndex: 10,
                      fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif"
                    }}
                  >
                    SOLD
                  </div>
                )}

                <button 
                  className={`wishlist-btn ${isWishlisted(prop.id) ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(prop.id);
                  }}
                >
                  {isWishlisted(prop.id) ? <FaHeart className="heart-icon filled" /> : <FaRegHeart className="heart-icon outline" />}
                </button>
                {(prop.sold || prop.approvalStatus === 'Sold' || prop.listingStatus === 'Sold') ? (
                  <button 
                    className="buy-now-badge"
                    style={{ backgroundColor: '#DC2626', cursor: 'not-allowed' }}
                    disabled
                    onClick={(e) => e.stopPropagation()}
                    title="This property has been sold."
                  >
                    Sold
                  </button>
                ) : (
                  <button 
                    className="buy-now-badge"
                    onClick={(e) => {
                      e.stopPropagation();
                      onBuyProperty?.(prop.id);
                    }}
                  >
                    <FaShoppingCart /> Buy
                  </button>
                )}
                {!(prop.sold || prop.approvalStatus === 'Sold' || prop.listingStatus === 'Sold') && (
                  <span className={`status-badge ${prop.status.toLowerCase()}`}>
                    For {prop.status}
                  </span>
                )}
              </div>
              <div className="property-details">
                <div className="property-meta-top">
                  <span className="property-type">{prop.category}</span>
                  <span className="property-type" style={{ color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: '8px', fontWeight: 700 }}>
                    <FaEye style={{ fontSize: '0.78rem' }} /> {prop.viewsCount || 0}
                  </span>
                  <span className="property-area">{prop.areaSqFt || prop.area}</span>
                </div>
                <h3 
                  className="property-name" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => onPropertyClick?.(prop.id)}
                >
                  {prop.title}
                </h3>
                <p className="property-location">{prop.area}, {prop.city}</p>
                <div className="property-meta-bottom">
                  <span className="property-price">{prop.priceDisplay}</span>
                  {prop.approvalStatus === 'Sold' || prop.listingStatus === 'Sold' ? (
                    <button 
                      className="btn btn-gold btn-view-details" 
                      style={{ backgroundColor: '#DC2626', borderColor: '#DC2626', color: '#FFFFFF', cursor: 'not-allowed' }} 
                      disabled
                    >
                      Property Sold
                    </button>
                  ) : (
                    <button className="btn btn-gold btn-view-details" onClick={() => onBuyProperty?.(prop.id)}>
                      BUY NOW
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default FeaturedProperties;
