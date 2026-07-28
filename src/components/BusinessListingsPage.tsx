import React, { useEffect, useState } from 'react';
import { businessDb, dealersDb, propertiesDb } from '../db/marketplaceDb';
import { FaArrowLeft, FaMapMarkerAlt, FaBriefcase, FaChartLine, FaShoppingCart, FaHeart, FaRegHeart } from 'react-icons/fa';
import { useWishlist } from '../context/WishlistContext';

interface BusinessListingsPageProps {
  industry: 'Food' | 'Healthcare' | 'Retail & Stores' | 'All';
  onBack: () => void;
  onPropertyClick?: (id: string) => void;
  onBuyProperty?: (id: string) => void;
  searchQuery?: string;
  onClearSearch?: () => void;
}

export const BusinessListingsPage: React.FC<BusinessListingsPageProps> = ({ industry, onBack, onPropertyClick, onBuyProperty, searchQuery, onClearSearch }) => {
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [selectedDealer, setSelectedDealer] = useState<any | null>(null);
  const [showSellerPortfolio, setShowSellerPortfolio] = useState<any | null>(null);

  // Scroll to top when page mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [industry]);

  // Map display industry to database industry field
  const getDbIndustryName = () => {
    if (industry === 'Food') return 'Food & Beverage';
    if (industry === 'Healthcare') return 'Healthcare';
    if (industry === 'All') return 'All';
    return 'Retail / FMCG';
  };

  const getDealer = (bizId: string) => {
    const index = parseInt(bizId.replace(/\D/g, '')) || 1;
    const dealerId = index % 2 === 0 ? 'D2' : 'D1';
    return dealersDb.find(d => d.id === dealerId) || dealersDb[0];
  };

  useEffect(() => {
    const lenis = (window as any).lenis;
    if (showSellerPortfolio || selectedDealer) {
      lenis?.stop();
      document.body.classList.add('modal-open');
    } else {
      lenis?.start();
      document.body.classList.remove('modal-open');
    }
    return () => {
      lenis?.start();
      document.body.classList.remove('modal-open');
    };
  }, [showSellerPortfolio, selectedDealer]);

  const dbIndustry = getDbIndustryName();
  const filteredListings = businessDb.filter(biz => {
    if (dbIndustry !== 'All' && biz.industry !== dbIndustry) {
      // If active search query is present, check if it matches regardless of industry
      if (!searchQuery || searchQuery.trim() === '') return false;
    }
    if (searchQuery && searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const matchesName = biz.name.toLowerCase().includes(q);
      const matchesInd = biz.industry.toLowerCase().includes(q);
      const matchesLoc = biz.location.toLowerCase().includes(q) || biz.city.toLowerCase().includes(q) || biz.state.toLowerCase().includes(q);
      if (!matchesName && !matchesInd && !matchesLoc) return false;
    }
    return true;
  });

  return (
    <div className="franchise-resales-page">
      {/* Page Header */}
      <div className="franchise-resales-header">
        <div className="business-header-flex" style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
          <button className="circle-back-btn" style={{ position: 'absolute', left: '15px' }} onClick={() => onBack?.()} title="Go Back">
            <FaArrowLeft />
          </button>
          <div className="header-content" style={{ textAlign: 'center' }}>
            <span className="section-tag">Acquisition Registry</span>
            <h1 className="page-title">
              {industry === 'All' ? 'Business Marketplace' : industry === 'Food' ? 'Food Businesses' : industry === 'Healthcare' ? 'Healthcare Businesses' : 'Retail & Stores'}
            </h1>
            <p className="page-subtitle">
              Secure investment-ready operational business units with verified cashflow.
            </p>
          </div>
        </div>
      </div>

      {/* Directory Content */}
      <div className="container section-padding">
        {searchQuery && searchQuery.trim() !== '' && (
          <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', padding: '14px 22px', borderRadius: '12px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <span style={{ color: '#1E40AF', fontWeight: 600, fontSize: '0.95rem' }}>
              🔍 Active Search Results for: <strong>"{searchQuery}"</strong> ({filteredListings.length} listings found)
            </span>
            {onClearSearch && (
              <button onClick={onClearSearch} style={{ backgroundColor: '#1E40AF', color: '#FFFFFF', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>
                Clear Search ✕
              </button>
            )}
          </div>
        )}
        <div className="property-feed-list">
          {filteredListings.length === 0 ? (
            <div style={{ textAlign: 'center', width: '100%', padding: '4rem 0' }}>
              <h3>No active listings in this category currently.</h3>
              <p>Check back later or contact our support team for offline inventory.</p>
            </div>
          ) : (
            filteredListings.map(biz => (
              <div key={biz.id} className="feed-card premium-card landscape-card">
                <div className="feed-card-image-wrap">
                  <img 
                    src={biz.image} 
                    alt={biz.name} 
                    className="feed-card-img" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => onPropertyClick?.(biz.id)}
                  />
                  <button 
                    className="buy-now-badge"
                    onClick={(e) => {
                      e.stopPropagation();
                      onBuyProperty?.(biz.id);
                    }}
                  >
                    <FaShoppingCart /> Buy
                  </button>
                  <div className="feed-card-badges">
                    {biz.trending && <span className="badge-premium">🔥 Trending</span>}
                    {biz.verified && <span className="badge-verified">✔ Verified</span>}
                  </div>
                </div>
                
                <div className="feed-card-body">
                  <div className="feed-card-price-title">
                    <h3 className="feed-prop-price">{biz.priceDisplay}</h3>
                    <h4 
                      className="feed-prop-title" 
                      style={{ cursor: 'pointer' }}
                      onClick={() => onPropertyClick?.(biz.id)}
                    >
                      {biz.name}
                    </h4>
                  </div>
                  
                  <div className="feed-card-specs">
                    <span className="spec-item"><FaBriefcase /> {biz.industry}</span>
                    <span className="spec-item"><FaChartLine /> {biz.trustScore}% Trust Score</span>
                    <span className="spec-item spec-highlight">Annual Revenue: {biz.revenue}</span>
                  </div>

                  <div className="feed-card-footer">
                    <div className="footer-left">
                      <p className="feed-prop-location" style={{ marginBottom: '0.5rem' }}>
                        <a href="#" className="location-link" onClick={(e) => e.preventDefault()}>
                          <FaMapMarkerAlt /> {biz.location}
                        </a>
                      </p>
                      <p className="feed-prop-seller">
                        👤 Seller Profile: {biz.sellerProfile}
                      </p>
                    </div>
                    <div className="footer-right">
                      <div className="feed-seller-action-container">
                        <div className="feed-seller-label-group">
                          <span className="feed-seller-label">Seller</span>
                          <span className="feed-seller-rating">⭐ {biz.rating}</span>
                        </div>
                        <div className="feed-seller-photo-wrap" onClick={() => setSelectedDealer(getDealer(biz.id))}>
                          <img 
                            src={getDealer(biz.id).photo || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150'} 
                            alt="Seller Profile" 
                            className="feed-seller-photo-btn" 
                            title="View Seller Details" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Seller Details Modal */}
      {selectedDealer && (
        <div className="seller-modal-overlay" onClick={() => setSelectedDealer(null)}>
          <div className="seller-modal-content seller-modal-wide" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setSelectedDealer(null)}>×</button>
            
            <div className="seller-modal-split">
              {/* Left Column: Seller Details */}
              <div className="seller-modal-left">
                <div className="seller-modal-header">
                  <img 
                    src={selectedDealer.photo || selectedDealer.logo} 
                    alt={selectedDealer.companyName} 
                    className="seller-modal-img" 
                    style={{ cursor: 'pointer' }}
                    title="View Fullscreen Portfolio"
                    onClick={() => {
                      setShowSellerPortfolio(selectedDealer);
                      setSelectedDealer(null);
                    }}
                  />
                  <div className="seller-modal-title">
                    <h3>{selectedDealer.companyName}</h3>
                    <div className="seller-badges">
                      {selectedDealer.verified && <span className="badge-verified">✔ Verified</span>}
                      {selectedDealer.premiumPartner && <span className="badge-premium">💎 Premium</span>}
                    </div>
                  </div>
                </div>
                <div className="seller-modal-body">
                  <div className="seller-stat-grid">
                    <div className="seller-stat">
                      <span className="stat-label">Rating</span>
                      <span className="stat-val">⭐ {selectedDealer.rating} ({selectedDealer.reviewCount})</span>
                    </div>
                    <div className="seller-stat">
                      <span className="stat-label">Experience</span>
                      <span className="stat-val">{selectedDealer.yearsExperience} Years</span>
                    </div>
                    <div className="seller-stat">
                      <span className="stat-label">Inventory</span>
                      <span className="stat-val">{selectedDealer.inventoryCount} Properties</span>
                    </div>
                    <div className="seller-stat">
                      <span className="stat-label">Response Time</span>
                      <span className="stat-val">{selectedDealer.responseTime}</span>
                    </div>
                  </div>
                  <button className="btn btn-gold w-100 mt-4" style={{marginTop: '1.5rem', width: '100%'}} onClick={() => alert(`Contacting ${selectedDealer.companyName}...`)}>Contact Seller</button>
                  <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)', fontSize: '0.9rem', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                      📸 Instagram: @thenexopp
                    </a>
                  </div>
                </div>
              </div>

              {/* Right Column: Seller Inventory */}
              <div className="seller-modal-right">
                <h4 className="inventory-title">Available Properties</h4>
                <div className="seller-inventory-grid">
                  {propertiesDb.filter(p => p.dealerId === selectedDealer.id).length === 0 ? (
                    <p className="no-inventory-msg">No properties found for this seller.</p>
                  ) : (
                    propertiesDb.filter(p => p.dealerId === selectedDealer.id).map(invProp => (
                      <div key={invProp.id} className="inventory-card">
                        <div className="inventory-card-img-wrap">
                          <img src={invProp.image} alt={invProp.title} className="inventory-card-img" />
                          {invProp.premium && <span className="inventory-badge-tiny">💎</span>}
                        </div>
                        <div className="inventory-card-details">
                          <span className="inventory-price">₹ {invProp.priceDisplay}</span>
                          <span className="inventory-area">{invProp.area}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Seller Portfolio */}
      {showSellerPortfolio && (
        <div className="fullscreen-portfolio-overlay" data-lenis-prevent="true">
          <div className="container portfolio-container">
            <button 
              className="btn btn-back portfolio-back-btn" 
              onClick={() => {
                setSelectedDealer(showSellerPortfolio);
                setShowSellerPortfolio(null);
              }}
            >
              <FaArrowLeft /> Back to Details
            </button>

            <div className="portfolio-header">
              <img 
                src={showSellerPortfolio.photo || showSellerPortfolio.logo} 
                alt={showSellerPortfolio.companyName} 
                className="portfolio-seller-img" 
              />
              <div className="portfolio-header-text">
                <span className="section-tag">Exclusive Portfolio</span>
                <h1 className="portfolio-title">{showSellerPortfolio.companyName}</h1>
                <div className="portfolio-meta">
                  <span className="meta-item">⭐ {showSellerPortfolio.rating} ({showSellerPortfolio.reviewCount} Reviews)</span>
                  <span className="meta-item">💼 {showSellerPortfolio.yearsExperience} Years Exp</span>
                  <span className="meta-item">🏢 {showSellerPortfolio.inventoryCount} Active Properties</span>
                </div>
              </div>
            </div>

            {/* Seller Profile & Contact Section */}
            <div className="portfolio-seller-details-card premium-card" style={{ marginBottom: '3rem', padding: '2.5rem' }}>
              <div className="seller-details-grid">
                <div className="seller-profile-column">
                  <img 
                    src={showSellerPortfolio.photo || showSellerPortfolio.logo} 
                    alt={showSellerPortfolio.companyName} 
                    className="seller-details-avatar" 
                  />
                  <h3 className="seller-details-name">{showSellerPortfolio.companyName}</h3>
                  <div className="seller-details-badges" style={{ marginTop: '0.5rem' }}>
                    {showSellerPortfolio.verified && <span className="badge-verified" style={{ marginRight: '8px' }}>✔ Verified Dealer</span>}
                    {showSellerPortfolio.premiumPartner && <span className="badge-premium">💎 Premium Partner</span>}
                  </div>
                  <div className="seller-details-rating" style={{ marginTop: '1rem', fontSize: '1.1rem' }}>
                    ⭐ <strong>{showSellerPortfolio.rating}</strong> ({showSellerPortfolio.reviewCount} user reviews)
                  </div>
                </div>

                <div className="seller-info-column">
                  <h4 className="column-title">Contact & Agent Information</h4>
                  <div className="info-list">
                    <div className="info-item">
                      <span className="info-label">👤 Authorized Name</span>
                      <span className="info-value">{showSellerPortfolio.companyName} Operations Group</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">📞 Mobile Number</span>
                      <span className="info-value" style={{ color: 'var(--gold)', fontWeight: 'bold' }}>+91 99890 87654</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">✉ Email Address</span>
                      <span className="info-value">info@{showSellerPortfolio.companyName.toLowerCase().replace(/\s+/g, '')}.com</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">📍 Headquarters / City</span>
                      <span className="info-value">Jubilee Hills, Hyderabad, Telangana</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">⏱ Avg Response Time</span>
                      <span className="info-value">{showSellerPortfolio.responseTime}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">💼 Experience</span>
                      <span className="info-value">{showSellerPortfolio.yearsExperience} Years in Market</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">📸 Instagram Profile</span>
                      <span className="info-value">
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)', textDecoration: 'underline' }}>
                          @thenexopp
                        </a>
                      </span>
                    </div>
                  </div>

                  <div className="portfolio-message-box" style={{ marginTop: '2rem' }}>
                    <h5 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Send Direct Message</h5>
                    <textarea 
                      className="inquiry-textarea" 
                      placeholder={`Write your inquiry message for ${showSellerPortfolio.companyName} here...`}
                      style={{ width: '100%', height: '100px', padding: '1rem', borderRadius: '6px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontFamily: 'inherit', resize: 'none' }}
                    />
                    <button 
                      className="btn btn-gold" 
                      style={{ marginTop: '1rem', width: '100%' }}
                      onClick={() => alert(`Your inquiry has been successfully sent to ${showSellerPortfolio.companyName}! They will get back to you shortly.`)}
                    >
                      Submit Inquiry
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Properties Grid */}
            <div className="portfolio-grid">
              {propertiesDb.filter(p => p.dealerId === showSellerPortfolio.id).map(prop => (
                <div key={prop.id} className="feed-card premium-card landscape-card portfolio-card-item" style={{ cursor: 'pointer' }} onClick={() => {
                  setShowSellerPortfolio(null);
                  onBuyProperty?.(prop.id);
                }}>
                  <div className="feed-card-image-wrap">
                    <img 
                      src={prop.image} 
                      alt={prop.title} 
                      className="feed-card-img" 
                    />
                    <button 
                      className={`wishlist-btn ${isWishlisted(prop.id) ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(prop.id);
                      }}
                    >
                      {isWishlisted(prop.id) ? <FaHeart className="heart-icon filled" /> : <FaRegHeart className="heart-icon outline" />}
                    </button>
                    <button 
                      className="buy-now-badge"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowSellerPortfolio(null);
                        onBuyProperty?.(prop.id);
                      }}
                    >
                      <FaShoppingCart /> Buy
                    </button>
                    <div className="feed-card-badges">
                      {prop.premium && <span className="badge-premium">💎 Premium</span>}
                      {prop.verified && <span className="badge-verified">✔ Verified</span>}
                    </div>
                  </div>

                  <div className="feed-card-body">
                    <div className="feed-card-price-title">
                      <h3 className="feed-prop-price">₹ {prop.priceDisplay}</h3>
                      <h4 className="feed-prop-title">{prop.title}</h4>
                    </div>
                    <div className="feed-card-specs">
                      <span>📐 {prop.areaSqFt}</span>
                    </div>
                    <div className="feed-card-footer">
                      <span className="feed-prop-location"><FaMapMarkerAlt /> {prop.area}, {prop.city}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
