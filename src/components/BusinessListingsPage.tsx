import React, { useEffect, useState, useMemo } from 'react';
import { businessDb, dealersDb, propertiesDb, franchiseDb } from '../db/marketplaceDb';
import { FaArrowLeft, FaMapMarkerAlt, FaBriefcase, FaChartLine, FaShoppingCart, FaHeart, FaRegHeart, FaUserTie } from 'react-icons/fa';
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
  const [portfolioTab, setPortfolioTab] = useState<'active' | 'sold'>('active');

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

  const brokerListings = useMemo(() => {
    if (!showSellerPortfolio) return { active: [], sold: [] };
    const bId = showSellerPortfolio.id;
    const allProps = propertiesDb.filter(p => p.dealerId === bId || (p.assignedBrokerIds && p.assignedBrokerIds.includes(bId)));
    const allBiz = businessDb ? businessDb.filter(b => (b as any).dealerId === bId || (b as any).assignedBrokerIds?.includes(bId)) : [];
    const allFran = franchiseDb ? franchiseDb.filter((f: any) => f.dealerId === bId || (f as any).assignedBrokerIds?.includes(bId)) : [];

    const activeProps = allProps.filter(p => !p.sold && p.listingStatus !== 'Sold' && p.status !== 'Sold' && p.approvalStatus !== 'Sold').map(p => ({ ...p, itemType: 'Property', isSold: false }));
    const soldProps = allProps.filter(p => p.sold || p.listingStatus === 'Sold' || p.status === 'Sold' || p.approvalStatus === 'Sold').map(p => ({ ...p, itemType: 'Property', isSold: true }));

    const activeBiz = allBiz.filter(b => !(b as any).sold && b.status !== 'Sold' && (b as any).listingStatus !== 'Sold').map(b => ({ ...b, itemType: 'Business', title: b.name, priceDisplay: b.priceDisplay || `₹${b.price || 50} Lac`, isSold: false }));
    const soldBiz = allBiz.filter(b => (b as any).sold || b.status === 'Sold' || (b as any).listingStatus === 'Sold').map(b => ({ ...b, itemType: 'Business', title: b.name, priceDisplay: b.priceDisplay || `₹${b.price || 50} Lac`, isSold: true }));

    const activeFran = allFran.filter((f: any) => !(f as any).sold && f.status !== 'Sold' && (f as any).listingStatus !== 'Sold' && (f as any).approvalStatus !== 'Closed').map((f: any) => ({ ...f, itemType: 'Franchise', title: f.brand, priceDisplay: f.investmentDisplay || `₹${f.investment || 25} Lac`, isSold: false }));
    const soldFran = allFran.filter((f: any) => (f as any).sold || f.status === 'Sold' || (f as any).listingStatus === 'Sold' || (f as any).approvalStatus === 'Closed').map((f: any) => ({ ...f, itemType: 'Franchise', title: f.brand, priceDisplay: f.investmentDisplay || `₹${f.investment || 25} Lac`, isSold: true }));

    return {
      active: [...activeProps, ...activeBiz, ...activeFran],
      sold: [...soldProps, ...soldBiz, ...soldFran]
    };
  }, [showSellerPortfolio]);

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
                          {getDealer(biz.id).photo || getDealer(biz.id).logo ? (
                            <img 
                              src={getDealer(biz.id).photo || getDealer(biz.id).logo} 
                              alt="Seller Profile" 
                              className="feed-seller-photo-btn" 
                              title="View Seller Details" 
                            />
                          ) : (
                            <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#E0F2FE', color: '#0369A1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', border: '1.5px solid #BAE6FD', cursor: 'pointer' }} title="View Seller Details">
                              <FaUserTie />
                            </div>
                          )}
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
                  {selectedDealer.photo || selectedDealer.logo ? (
                    <img 
                      src={selectedDealer.photo || selectedDealer.logo} 
                      alt={selectedDealer.companyName} 
                      className="seller-modal-img" 
                      style={{ cursor: 'pointer', objectFit: 'cover' }}
                      title="View Fullscreen Portfolio"
                      onClick={() => {
                        setShowSellerPortfolio(selectedDealer);
                        setSelectedDealer(null);
                      }}
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                        if (e.currentTarget.parentElement) {
                          const fallback = document.createElement('div');
                          fallback.className = 'seller-modal-img';
                          fallback.style.cssText = 'background-color:#1E40AF;color:#FFFFFF;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.5rem;border-radius:50%;cursor:pointer;';
                          fallback.innerText = (selectedDealer.companyName || 'B').substring(0, 2).toUpperCase();
                          fallback.onclick = () => { setShowSellerPortfolio(selectedDealer); setSelectedDealer(null); };
                          e.currentTarget.parentElement.insertBefore(fallback, e.currentTarget);
                        }
                      }}
                    />
                  ) : (
                    <div 
                      className="seller-modal-img" 
                      style={{ backgroundColor: '#1E40AF', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.5rem', borderRadius: '50%', cursor: 'pointer' }}
                      onClick={() => {
                        setShowSellerPortfolio(selectedDealer);
                        setSelectedDealer(null);
                      }}
                    >
                      {(selectedDealer.companyName || 'B').substring(0, 2).toUpperCase()}
                    </div>
                  )}
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
                    <a href="https://www.instagram.com/thenexopp?igsh=MTcxc21nMXJ3Y2lzeA%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)', fontSize: '0.9rem', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
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
              {showSellerPortfolio.photo || showSellerPortfolio.logo ? (
                <img 
                  src={showSellerPortfolio.photo || showSellerPortfolio.logo} 
                  alt={showSellerPortfolio.companyName} 
                  className="portfolio-seller-img" 
                  style={{ objectFit: 'cover' }}
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                    if (e.currentTarget.parentElement) {
                      const fallback = document.createElement('div');
                      fallback.className = 'portfolio-seller-img';
                      fallback.style.cssText = 'background-color:#1E40AF;color:#FFFFFF;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:2rem;border-radius:50%;';
                      fallback.innerText = (showSellerPortfolio.companyName || 'B').substring(0, 2).toUpperCase();
                      e.currentTarget.parentElement.insertBefore(fallback, e.currentTarget);
                    }
                  }}
                />
              ) : (
                <div className="portfolio-seller-img" style={{ backgroundColor: '#1E40AF', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '2rem', borderRadius: '50%' }}>
                  {(showSellerPortfolio.companyName || 'B').substring(0, 2).toUpperCase()}
                </div>
              )}
              <div className="portfolio-header-text">
                <span className="section-tag">Exclusive Portfolio</span>
                <h1 className="portfolio-title">{showSellerPortfolio.companyName}</h1>
                <div className="portfolio-meta">
                  {showSellerPortfolio.rating > 0 && <span className="meta-item">⭐ {showSellerPortfolio.rating} {showSellerPortfolio.reviewCount ? `(${showSellerPortfolio.reviewCount} Reviews)` : ''}</span>}
                  {showSellerPortfolio.yearsExperience != null && <span className="meta-item">💼 {showSellerPortfolio.yearsExperience} Years Exp</span>}
                  <span className="meta-item">🏢 {brokerListings.active.length} Active Listings</span>
                  <span className="meta-item">🤝 {brokerListings.sold.length} Sold Properties</span>
                </div>
              </div>
            </div>

            {/* Seller Profile & Contact Section */}
            <div className="portfolio-seller-details-card premium-card" style={{ marginBottom: '2rem', padding: '2.5rem' }}>
              <div className="seller-details-grid">
                <div className="seller-profile-column">
                  {showSellerPortfolio.photo || showSellerPortfolio.logo ? (
                    <img 
                      src={showSellerPortfolio.photo || showSellerPortfolio.logo} 
                      alt={showSellerPortfolio.companyName} 
                      className="seller-details-avatar" 
                      style={{ objectFit: 'cover', backgroundColor: '#EFF6FF' }}
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                        if (e.currentTarget.parentElement) {
                          const fallback = document.createElement('div');
                          fallback.className = 'seller-details-avatar';
                          fallback.style.cssText = 'background-color:#1E40AF;color:#FFFFFF;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:2rem;border-radius:50%;';
                          fallback.innerText = (showSellerPortfolio.companyName || 'B').substring(0, 2).toUpperCase();
                          e.currentTarget.parentElement.insertBefore(fallback, e.currentTarget);
                        }
                      }}
                    />
                  ) : (
                    <div className="seller-details-avatar" style={{ backgroundColor: '#1E40AF', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '2rem', borderRadius: '50%' }}>
                      {(showSellerPortfolio.companyName || 'B').substring(0, 2).toUpperCase()}
                    </div>
                  )}<h3 className="seller-details-name">{showSellerPortfolio.companyName}</h3>
                  <div className="seller-details-badges" style={{ marginTop: '0.5rem' }}>
                    {showSellerPortfolio.verified && <span className="badge-verified" style={{ marginRight: '8px' }}>✔ Verified Dealer</span>}
                    {showSellerPortfolio.premiumPartner && <span className="badge-premium">💎 Premium Partner</span>}
                  </div>
                  {showSellerPortfolio.rating > 0 && (
                    <div className="seller-details-rating" style={{ marginTop: '1rem', fontSize: '1.1rem' }}>
                      ⭐ <strong>{showSellerPortfolio.rating}</strong> {showSellerPortfolio.reviewCount ? `(${showSellerPortfolio.reviewCount} user reviews)` : ''}
                    </div>
                  )}
                </div>

                <div className="seller-info-column">
                  <h4 className="column-title">Contact & Agent Information</h4>
                  <div className="info-list">
                    {showSellerPortfolio.fullName && (
                      <div className="info-item">
                        <span className="info-label">👤 Authorized Name</span>
                        <span className="info-value">{showSellerPortfolio.fullName}</span>
                      </div>
                    )}
                    {(showSellerPortfolio.city || showSellerPortfolio.state || showSellerPortfolio.district) && (
                      <div className="info-item">
                        <span className="info-label">📍 Headquarters / City</span>
                        <span className="info-value">{[showSellerPortfolio.city, showSellerPortfolio.district, showSellerPortfolio.state].filter(Boolean).join(', ')}</span>
                      </div>
                    )}
                    {showSellerPortfolio.responseTime && (
                      <div className="info-item">
                        <span className="info-label">⏱ Avg Response Time</span>
                        <span className="info-value">{showSellerPortfolio.responseTime}</span>
                      </div>
                    )}
                    {showSellerPortfolio.yearsExperience != null && (
                      <div className="info-item">
                        <span className="info-label">💼 Experience</span>
                        <span className="info-value">{showSellerPortfolio.yearsExperience} Years in Market</span>
                      </div>
                    )}
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

            {/* Tabs Header */}
            <div style={{ marginBottom: '1.5rem', borderBottom: '2px solid #E2E8F0', paddingBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Broker Listings & Portfolio
                </h3>
                <p style={{ margin: '4px 0 0 0', color: '#64748B', fontSize: '0.88rem' }}>
                  Explore active offerings and previous transactions by {showSellerPortfolio.companyName}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', backgroundColor: '#F1F5F9', padding: '4px', borderRadius: '12px' }}>
                <button
                  type="button"
                  onClick={() => setPortfolioTab('active')}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: portfolioTab === 'active' ? '#FFFFFF' : 'transparent',
                    color: portfolioTab === 'active' ? '#1E40AF' : '#64748B',
                    boxShadow: portfolioTab === 'active' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
                  }}
                >
                  Active Listings ({brokerListings.active.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPortfolioTab('sold')}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: portfolioTab === 'sold' ? '#FFFFFF' : 'transparent',
                    color: portfolioTab === 'sold' ? '#DC2626' : '#64748B',
                    boxShadow: portfolioTab === 'sold' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
                  }}
                >
                  Previously Sold ({brokerListings.sold.length})
                </button>
              </div>
            </div>

            {/* Properties Grid */}
            <div className="portfolio-grid">
              {(portfolioTab === 'active' ? brokerListings.active : brokerListings.sold).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', gridColumn: '1 / -1', backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                  <p style={{ fontSize: '1rem', color: '#64748B', fontWeight: 600 }}>
                    {portfolioTab === 'active' 
                      ? `No active listings currently available for ${showSellerPortfolio.companyName}.`
                      : `No previously sold properties recorded yet for ${showSellerPortfolio.companyName}.`}
                  </p>
                </div>
              ) : (
                (portfolioTab === 'active' ? brokerListings.active : brokerListings.sold).map((item: any) => (
                  <div 
                    key={item.id} 
                    className="feed-card premium-card landscape-card portfolio-card-item" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      if (item.itemType === 'Property') {
                        setShowSellerPortfolio(null);
                        onBuyProperty?.(item.id);
                      }
                    }}
                  >
                    <div className="feed-card-image-wrap" style={{ position: 'relative' }}>
                      <img 
                        src={item.image || item.imageUrl || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&auto=format&fit=crop&q=80'} 
                        alt={item.title || item.name} 
                        className="feed-card-img" 
                      />
                      {item.isSold ? (
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          left: '12px',
                          backgroundColor: '#DC2626',
                          color: '#FFFFFF',
                          padding: '5px 12px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 800,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                          boxShadow: '0 4px 10px rgba(220, 38, 38, 0.3)',
                          zIndex: 3
                        }}>
                          SOLD / CLOSED DEAL
                        </div>
                      ) : (
                        <button 
                          className="buy-now-badge"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowSellerPortfolio(null);
                            onBuyProperty?.(item.id);
                          }}
                        >
                          <FaShoppingCart /> Buy
                        </button>
                      )}
                      <div className="feed-card-badges">
                        {item.itemType && <span style={{ backgroundColor: '#EFF6FF', color: '#1E40AF', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 800 }}>{item.itemType}</span>}
                        {item.premium && <span className="badge-premium">💎 Premium</span>}
                        {item.verified && <span className="badge-verified">✔ Verified</span>}
                      </div>
                    </div>

                    <div className="feed-card-body">
                      <div className="feed-card-price-title">
                        <h3 className="feed-prop-price" style={{ color: item.isSold ? '#DC2626' : undefined }}>
                          ₹ {item.priceDisplay || item.price}
                        </h3>
                        <h4 className="feed-prop-title">{item.title || item.name}</h4>
                      </div>
                      <div className="feed-card-specs">
                        {item.areaSqFt && <span>📐 {item.areaSqFt}</span>}
                        {item.isSold && <span style={{ color: '#DC2626', fontWeight: 700 }}>✓ Transaction Completed</span>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
