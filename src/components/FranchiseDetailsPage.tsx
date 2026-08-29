import React, { useState, useEffect } from 'react';
import { franchiseDb, dealersDb, addFranchiseEnquiry, demandRegionsDb, getDistance, API_BASE_URL, isDemandRegionsEnabled } from '../db/marketplaceDb';
import {
  FaArrowLeft,
  FaCheckCircle,
  FaShoppingCart,
  FaPhone,
  FaEnvelope,
  FaFileDownload,
  FaShareAlt,
  FaShieldAlt,
  FaImages,
  FaUserTie
} from 'react-icons/fa';

interface FranchiseDetailsPageProps {
  franchiseId: string;
  onBack: () => void;
  onBuyProperty?: (id: string) => void;
  showNotification?: (msg: string, type?: 'success' | 'warning' | 'info') => void;
}

export const FranchiseDetailsPage: React.FC<FranchiseDetailsPageProps> = ({
  franchiseId,
  onBack,
  onBuyProperty,
  showNotification
}) => {
  const franchise = franchiseDb.find(f => f.id === franchiseId);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'contact' | 'book'>('contact');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [timePeriod, setTimePeriod] = useState<'AM' | 'PM'>('AM');

  const AM_SLOTS = [
    { label: '09:00 AM - 10:00 AM', time: '09:00 AM' },
    { label: '10:00 AM - 11:00 AM', time: '10:00 AM' },
    { label: '11:00 AM - 12:00 PM', time: '11:00 AM' },
  ];

  const PM_SLOTS = [
    { label: '12:00 PM - 01:00 PM', time: '12:00 PM' },
    { label: '02:00 PM - 03:00 PM', time: '02:00 PM' },
    { label: '03:00 PM - 04:00 PM', time: '03:00 PM' },
    { label: '04:00 PM - 05:00 PM', time: '04:00 PM' },
    { label: '05:00 PM - 06:00 PM', time: '05:00 PM' },
    { label: '06:00 PM - 07:00 PM', time: '06:00 PM' },
  ];


  // Form states
  const [custName, setCustName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [budget, setBudget] = useState('₹30 - ₹50 Lakhs');
  const [locationPref, setLocationPref] = useState('Hyderabad');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [franchiseId]);

  if (!franchise) {
    return (
      <div style={{ padding: '100px', textAlign: 'center', background: '#F8FAFC', minHeight: '80vh' }}>
        <h3 style={{ fontFamily: "'Playfair Display', 'Cinzel', 'Georgia', serif", color: '#0F172A', fontSize: '1.8rem' }}>
          Franchise Opportunity Not Found
        </h3>
        <button onClick={onBack} style={{ marginTop: '20px', padding: '12px 24px', backgroundColor: '#1E40AF', color: '#FFFFFF', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
          ← Back to Marketplace
        </button>
      </div>
    );
  }

  const imagesList = franchise.images && franchise.images.length > 0 ? franchise.images : [franchise.image];
  const assignedBroker = dealersDb.find(d => d.id === franchise.dealerId || franchise.assignedBrokerIds?.includes(d.id)) || dealersDb[0];

  const handleSendEnquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !mobile) {
      showNotification?.('Please enter your name and mobile number.', 'warning');
      return;
    }
    addFranchiseEnquiry({
      id: `FE-${Date.now().toString().slice(-4)}`,
      franchiseId: franchise.id,
      customerName: custName,
      mobileNumber: mobile,
      email: email || 'not-provided@example.com',
      interestedFranchise: franchise.brand,
      investmentBudget: budget,
      preferredLocation: modalMode === 'book' ? `${locationPref} (Slot: ${bookingDate} at ${bookingTime})` : locationPref,
      status: 'New',
      createdDate: new Date().toISOString().split('T')[0],
      assignedBrokerId: assignedBroker?.id || 'D1',
      assignedBrokerName: assignedBroker?.name || 'RealtyPlus Advisors'
    });

    // Async backend sync
    try {
      fetch(`${API_BASE_URL}/api/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          customerName: custName.trim(),
          phone: mobile.trim(),
          email: email.trim(),
          listingTitle: franchise.brand,
          listingType: 'BUSINESS',
          listingId: franchise.id,
          enquiryType: modalMode === 'book' ? 'SLOT_BOOKING' : 'FRANCHISE_ENQUIRY',
          message: modalMode === 'book' 
            ? `Franchise visit slot requested for ${bookingDate} at ${bookingTime}. Budget: ${budget}` 
            : `Franchise enquiry: ${franchise.brand}. Budget: ${budget}, Location: ${locationPref}`,
          preferredMoveInDate: modalMode === 'book' ? bookingDate : '',
          date: modalMode === 'book' ? bookingDate : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          preferredTime: modalMode === 'book' ? bookingTime : '',
          source: 'Franchise Details Page',
          mode: modalMode
        })
      }).catch(err => console.warn('Franchise enquiry backend sync warning:', err));
    } catch (_) {}

    showNotification?.(modalMode === 'book' ? `Booking slot submitted for ${franchise.brand}!` : `Enquiry submitted successfully for ${franchise.brand}! An advisor will contact you within 24 hours.`, 'success');
    setIsEnquiryModalOpen(false);
    setCustName('');
    setMobile('');
    setBookingDate('');
    setBookingTime('');
  };

  const handleOpenModal = (mode: 'contact' | 'book' = 'contact') => {
    setModalMode(mode);
    setIsEnquiryModalOpen(true);
  };

  const demandBadge = React.useMemo(() => {
    if (!franchise.latitude || !franchise.longitude) return null;
    let closestRegion: any = null;
    let minDistance = Infinity;

    demandRegionsDb.forEach(r => {
      const dist = getDistance(r.latitude, r.longitude, franchise.latitude, franchise.longitude);
      if (dist <= r.radius && dist < minDistance) {
        minDistance = dist;
        closestRegion = r;
      }
    });

    if (!closestRegion) return null;

    const level = closestRegion.demandLevel;
    const color = level === 'High' ? '#DCFCE7' : (level === 'Medium' ? '#FEF9C3' : '#FEE2E2');
    const textColor = level === 'High' ? '#16A34A' : (level === 'Medium' ? '#CA8A04' : '#EF4444');
    const icon = level === 'High' ? '🔥' : (level === 'Medium' ? '⭐' : '📍');
    const label = level === 'High' ? 'High Demand Area' : (level === 'Medium' ? 'Moderate Demand Area' : 'Low Demand Area');
    const desc = level === 'High' ? `Located in one of the most demanded regions within a ${closestRegion.radius} km radius.` : `Located in a ${level.toLowerCase()} demand zone within a ${closestRegion.radius} km radius.`;

    return (
      <div style={{ backgroundColor: color, color: textColor, padding: '12px 20px', borderRadius: '12px', border: `1px solid ${textColor}`, display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', fontWeight: 700, marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <span style={{ fontSize: '1.5rem' }}>{icon}</span>
        <div>
          <span style={{ display: 'block', fontWeight: 800 }}>{label}</span>
          <span style={{ fontSize: '0.8rem', opacity: 0.85, fontWeight: 500 }}>{desc}</span>
        </div>
      </div>
    );
  }, [franchise]);

  return (
    <div style={{ backgroundColor: '#F8FAFC', padding: '115px 0 32px', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px' }}>
        {isDemandRegionsEnabled() && demandBadge}
        
        {/* Top bar & Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <button
            onClick={onBack}
            style={{ padding: '10px 18px', backgroundColor: '#FFFFFF', color: '#1E40AF', border: '1px solid #CBD5E1', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '6px', fontSize: '0.9rem' }}
          >
            <FaArrowLeft /> Back to Listings
          </button>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                showNotification?.('Link copied to clipboard!', 'info');
              }}
              style={{ padding: '10px 16px', backgroundColor: '#FFFFFF', color: '#475569', border: '1px solid #CBD5E1', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '6px' }}
            >
              <FaShareAlt /> Share
            </button>
            <button
              onClick={() => showNotification?.('Brochure PDF download initiated.', 'success')}
              style={{ padding: '10px 18px', backgroundColor: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '6px' }}
            >
              <FaFileDownload /> Download Prospectus PDF
            </button>
          </div>
        </div>

        {/* Hero Title Header */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '28px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <img src={franchise.logo || franchise.image} alt={franchise.brand} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span style={{ padding: '4px 10px', backgroundColor: '#1E40AF', color: '#FFFFFF', fontWeight: 800, fontSize: '0.75rem', borderRadius: '4px' }}>
                  {(franchise.category || 'FRANCHISE').toUpperCase()}
                </span>
                {franchise.opportunityType && (
                  <span style={{ padding: '4px 10px', backgroundColor: '#EFF6FF', color: '#1E40AF', fontWeight: 700, fontSize: '0.75rem', borderRadius: '4px', border: '1px solid #BFDBFE' }}>
                    {franchise.opportunityType}
                  </span>
                )}
                {franchise.verified && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10B981', fontWeight: 700, fontSize: '0.8rem' }}>
                    <FaCheckCircle /> Verified Genuine
                  </span>
                )}
              </div>
              <h1 style={{ fontFamily: "'Playfair Display', 'Cinzel', 'Georgia', serif", fontSize: '2.2rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
                {franchise.brand}
              </h1>
              <p style={{ margin: 0, color: '#64748B', fontSize: '0.95rem' }}>
                📍 {franchise.location} • {franchise.type} • Est. {franchise.yearEstablished || 2020}
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Required Investment</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10B981', fontFamily: "'Playfair Display', 'Cinzel', 'Georgia', serif" }}>
              {franchise.investmentDisplay || `₹${franchise.investment} Lakhs`}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '2px' }}>Expected ROI: <strong style={{ color: '#0F172A' }}>{franchise.expectedRoi || '35% - 45%'}</strong></div>
          </div>
        </div>

        {/* Main Content Grid Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
          
          {/* Left Column: Gallery & Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Image Showcase Slider */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
              <div style={{ position: 'relative', height: '420px', backgroundColor: '#0F172A' }}>
                <img
                  src={imagesList[activeImageIndex]}
                  alt="Franchise Showroom"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', bottom: '16px', right: '16px', backgroundColor: 'rgba(15, 23, 42, 0.8)', color: '#FFFFFF', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
                  <FaImages style={{ marginRight: '6px' }} /> {activeImageIndex + 1} / {imagesList.length}
                </div>
              </div>

              {imagesList.length > 1 && (
                <div style={{ display: 'flex', gap: '10px', padding: '16px', overflowX: 'auto', backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
                  {imagesList.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt="Thumbnail"
                      onClick={() => setActiveImageIndex(i)}
                      style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer', border: activeImageIndex === i ? '3px solid #1E40AF' : '1px solid #CBD5E1' }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Financial & Investment Specifications */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '28px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <h3 style={{ fontFamily: "'Playfair Display', 'Cinzel', 'Georgia', serif", fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', margin: '0 0 20px 0', borderBottom: '2px solid #F1F5F9', paddingBottom: '12px' }}>
                💰 INVESTMENT & FINANCIAL BREAKDOWN
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B' }}>FRANCHISE FEE</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>{franchise.franchiseFee || '₹5 Lakhs'}</div>
                </div>
                <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B' }}>SECURITY DEPOSIT</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>{franchise.securityDeposit || '₹2 Lakhs'}</div>
                </div>
                <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B' }}>WORKING CAPITAL REQ.</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>{franchise.workingCapital || '₹3 Lakhs'}</div>
                </div>
                <div style={{ padding: '16px', backgroundColor: '#ECFDF5', borderRadius: '8px', border: '1px solid #A7F3D0' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#065F46' }}>PAYBACK PERIOD</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#065F46', marginTop: '4px' }}>{franchise.paybackPeriod || '15 - 18 Months'}</div>
                </div>
                <div style={{ padding: '16px', backgroundColor: '#EFF6FF', borderRadius: '8px', border: '1px solid #BFDBFE' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1E40AF' }}>ROYALTY FEE</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E40AF', marginTop: '4px' }}>{franchise.royaltyFee || '5% of monthly revenue'}</div>
                </div>
                <div style={{ padding: '16px', backgroundColor: '#FEF3C7', borderRadius: '8px', border: '1px solid #FDE68A' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#92400E' }}>EXPECTED PROFIT MARGIN</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#92400E', marginTop: '4px' }}>{franchise.profitMargin || '25% - 32%'}</div>
                </div>
              </div>
            </div>

            {/* Space Requirements & Operational Overview */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '28px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <h3 style={{ fontFamily: "'Playfair Display', 'Cinzel', 'Georgia', serif", fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', margin: '0 0 20px 0', borderBottom: '2px solid #F1F5F9', paddingBottom: '12px' }}>
                🏢 SPACE SPECIFICATIONS & SUPPORT OFFERED
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <h4 style={{ margin: '0 0 10px 0', color: '#334155', fontSize: '0.95rem' }}>Area Requirements</h4>
                  <p style={{ margin: '0 0 6px 0', color: '#0F172A', fontWeight: 700, fontSize: '1.1rem' }}>
                    📐 {franchise.minAreaSqFt || 500} - {franchise.maxAreaSqFt || 1200} Sq. Ft.
                  </p>
                  <p style={{ margin: 0, color: '#64748B', fontSize: '0.85rem' }}>Preferred format: <strong>{franchise.shopType || 'High Street / Ground Floor'}</strong></p>
                </div>
                <div>
                  <h4 style={{ margin: '0 0 10px 0', color: '#334155', fontSize: '0.95rem' }}>Business Footprint</h4>
                  <p style={{ margin: '0 0 6px 0', color: '#0F172A', fontWeight: 700, fontSize: '1.1rem' }}>
                    🏪 {franchise.existingOutletsCount || 12} Active Units Nationwide
                  </p>
                  <p style={{ margin: 0, color: '#64748B', fontSize: '0.85rem' }}>Business Model: <strong>{franchise.businessModel || 'FOFO / Revenue Share'}</strong></p>
                </div>
              </div>

              <div>
                <h4 style={{ margin: '0 0 12px 0', color: '#334155', fontSize: '0.95rem' }}>Comprehensive Franchisor Assistance</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {(franchise.supportOffered || [
                    'Site Selection & Lease Negotiation',
                    'Turnkey Interior Layout & Setup',
                    'Comprehensive Staff Training Program',
                    'Digital Marketing & Launch Campaign',
                    'Ongoing POS Software & Supply Chain Support'
                  ]).map((sup, idx) => (
                    <span key={idx} style={{ padding: '8px 14px', backgroundColor: '#F1F5F9', color: '#334155', borderRadius: '20px', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      ✓ {sup}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Detailed Description */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '28px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <h3 style={{ fontFamily: "'Playfair Display', 'Cinzel', 'Georgia', serif", fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', margin: '0 0 16px 0' }}>
                📋 EXECUTIVE OPPORTUNITY OVERVIEW
              </h3>
              <p style={{ color: '#334155', lineHeight: '1.8', fontSize: '0.98rem', whiteSpace: 'pre-line' }}>
                {franchise.detailedDescription || `Partnering with ${franchise.brand} provides an exceptional turnkey business opportunity in high-growth commercial sectors. Backed by automated operational systems, national brand equity, and structured training programs, franchisees achieve break-even within record time frames.\n\nWhether you are an aspiring entrepreneur or an established investor seeking portfolio diversification, our dedicated leasing and onboarding teams assist at every step from store fit-out to grand opening.`}
              </p>
            </div>
          </div>

          {/* Right Column: Broker Card & CTA Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Primary Action Card */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '2px solid #1E40AF', boxShadow: '0 10px 25px -5px rgba(30, 64, 175, 0.1)' }}>
              <h3 style={{ fontFamily: "'Playfair Display', 'Cinzel', 'Georgia', serif", fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', margin: '0 0 12px 0' }}>
                EXPRESS INTEREST & GET CALL
              </h3>
              <p style={{ margin: '0 0 20px 0', color: '#64748B', fontSize: '0.88rem' }}>
                Schedule a private consultation with our assigned investment advisor to receive the confidential investment deck.
              </p>

              <button
                onClick={() => handleOpenModal('contact')}
                style={{ width: '100%', padding: '16px', backgroundColor: '#1E40AF', color: '#FFFFFF', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', borderRadius: '8px', marginBottom: '12px', fontFamily: "'Playfair Display', 'Cinzel', 'Georgia', serif", letterSpacing: '0.04em', boxShadow: '0 4px 12px rgba(30, 64, 175, 0.25)' }}
              >
                REQUEST PROSPECTUS & MEETING
              </button>

              <button
                onClick={() => handleOpenModal('book')}
                style={{ width: '100%', padding: '16px', backgroundColor: '#FFFFFF', color: '#1E40AF', border: '2px solid #1E40AF', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', borderRadius: '8px', marginBottom: '12px', fontFamily: "'Playfair Display', 'Cinzel', 'Georgia', serif", letterSpacing: '0.04em' }}
              >
                BOOK SLOT & DATE
              </button>

              <button
                onClick={() => {
                  onBuyProperty?.(franchise.id);
                  showNotification?.('Initiated checkout / reservation flow.', 'success');
                }}
                style={{ width: '100%', padding: '14px', backgroundColor: '#10B981', color: '#FFFFFF', border: 'none', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <FaShoppingCart /> LOCK / RESERVE TERRITORY
              </button>
            </div>

            {/* Assigned Broker Card */}
            {assignedBroker && (
              <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
                  ASSIGNED FRANCHISE BROKER
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  {assignedBroker.image || assignedBroker.photo || assignedBroker.logo ? (
                    <img src={assignedBroker.image || assignedBroker.photo || assignedBroker.logo} alt={assignedBroker.name} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #1E40AF' }} />
                  ) : (
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#E0F2FE', color: '#0369A1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', border: '2px solid #BAE6FD', flexShrink: 0 }}>
                      <FaUserTie />
                    </div>
                  )}
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>{assignedBroker.name}</h4>
                    <div style={{ fontSize: '0.85rem', color: '#64748B' }}>{assignedBroker.company}</div>
                    <div style={{ fontSize: '0.8rem', color: '#F59E0B', fontWeight: 700, marginTop: '2px' }}>★ {assignedBroker.rating} Verified Advisor</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <a href={`tel:${assignedBroker.phone}`} style={{ padding: '10px', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '6px', textAlign: 'center', color: '#0F172A', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <FaPhone style={{ color: '#10B981' }} /> {assignedBroker.phone}
                  </a>
                  <a href={`mailto:${assignedBroker.email}`} style={{ padding: '10px', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '6px', textAlign: 'center', color: '#0F172A', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <FaEnvelope style={{ color: '#3B82F6' }} /> Send Direct Email
                  </a>
                </div>
              </div>
            )}

            {/* Trust Assurance Badge Box */}
            <div style={{ backgroundColor: '#F8FAFC', padding: '20px', borderRadius: '12px', border: '1px solid #CBD5E1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0F172A', fontWeight: 800, marginBottom: '8px' }}>
                <FaShieldAlt style={{ color: '#1E40AF', fontSize: '1.2rem' }} /> REALTYPLUS VERIFIED GUARANTEE
              </div>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748B', lineHeight: '1.5' }}>
                All franchise data, ROI projections, and franchisor registration documents have undergone preliminary diligence. Your deposit remains escrow-protected during territory review.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enquiry Form Modal */}
      {isEnquiryModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.35)', backdropFilter: 'blur(3px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#FFFFFF', width: '100%', maxWidth: '520px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '20px 24px', backgroundColor: '#1E40AF', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: "'Playfair Display', 'Cinzel', 'Georgia', serif", fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                {modalMode === 'book' ? `Book Visit Slot: ${franchise.brand}` : `Request Prospectus: ${franchise.brand}`}
              </h3>
              <button onClick={() => setIsEnquiryModalOpen(false)} style={{ background: 'none', border: 'none', color: '#FFFFFF', fontSize: '1.5rem', cursor: 'pointer', fontWeight: 700 }}>×</button>
            </div>

            <form onSubmit={handleSendEnquiry} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>YOUR FULL NAME *</label>
                <input type="text" required placeholder="Enter your full name" value={custName} onChange={e => setCustName(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #CBD5E1', borderRadius: '6px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>MOBILE NUMBER *</label>
                <input type="tel" required placeholder="Enter 10-digit mobile number" value={mobile} onChange={e => setMobile(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #CBD5E1', borderRadius: '6px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>EMAIL ADDRESS</label>
                <input type="email" placeholder="Enter your email address" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #CBD5E1', borderRadius: '6px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>INVESTMENT BUDGET</label>
                <select value={budget} onChange={e => setBudget(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #CBD5E1', borderRadius: '6px' }}>
                  <option value="₹15 - ₹25 Lakhs">₹15 - ₹25 Lakhs</option>
                  <option value="₹25 - ₹40 Lakhs">₹25 - ₹40 Lakhs</option>
                  <option value="₹40 - ₹75 Lakhs">₹40 - ₹75 Lakhs</option>
                  <option value="₹75 Lakhs+">₹75 Lakhs+</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>PREFERRED CITY / LOCATION</label>
                <input type="text" placeholder="Hyderabad / Bengaluru / Mumbai..." value={locationPref} onChange={e => setLocationPref(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #CBD5E1', borderRadius: '6px', boxSizing: 'border-box' }} />
              </div>

              {modalMode === 'book' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>PREFERRED VISIT DATE *</label>
                    <input type="date" required value={bookingDate} onChange={e => setBookingDate(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #CBD5E1', borderRadius: '6px', boxSizing: 'border-box' }} />
                  </div>
                  
                  <div style={{ backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>SELECT TIME SLOT *</label>
                      <div style={{ display: 'flex', backgroundColor: '#E2E8F0', padding: '2px', borderRadius: '6px', gap: '2px' }}>
                        <button
                          type="button"
                          onClick={() => setTimePeriod('AM')}
                          style={{
                            padding: '4px 10px',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            backgroundColor: timePeriod === 'AM' ? '#FFFFFF' : 'transparent',
                            color: timePeriod === 'AM' ? '#1E40AF' : '#64748B'
                          }}
                        >
                          ☀️ Morning (AM)
                        </button>
                        <button
                          type="button"
                          onClick={() => setTimePeriod('PM')}
                          style={{
                            padding: '4px 10px',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            backgroundColor: timePeriod === 'PM' ? '#FFFFFF' : 'transparent',
                            color: timePeriod === 'PM' ? '#1E40AF' : '#64748B'
                          }}
                        >
                          🌙 Afternoon / Evening (PM)
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
                      {(timePeriod === 'AM' ? AM_SLOTS : PM_SLOTS).map(slot => {
                        const isSelected = bookingTime === slot.label || bookingTime === slot.time;
                        return (
                          <button
                            key={slot.label}
                            type="button"
                            onClick={() => setBookingTime(slot.label)}
                            style={{
                              padding: '8px',
                              borderRadius: '6px',
                              border: isSelected ? '2px solid #1E40AF' : '1px solid #CBD5E1',
                              backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                              color: isSelected ? '#1E40AF' : '#334155',
                              fontWeight: isSelected ? 800 : 600,
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                              textAlign: 'center'
                            }}
                          >
                            {slot.label}
                          </button>
                        );
                      })}
                    </div>

                    {bookingTime && (
                      <div style={{ marginTop: '10px', padding: '6px 10px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '6px', fontSize: '0.8rem', color: '#1E40AF', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>✓ Selected: {bookingTime}</span>
                        <button type="button" onClick={() => setBookingTime('')} style={{ background: 'none', border: 'none', color: '#1E40AF', cursor: 'pointer', fontSize: '0.72rem', textDecoration: 'underline' }}>Change</button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button type="submit" style={{ marginTop: '10px', padding: '14px', backgroundColor: '#1E40AF', color: '#FFFFFF', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', borderRadius: '6px', fontFamily: "'Playfair Display', 'Cinzel', 'Georgia', serif" }}>
                {modalMode === 'book' ? 'CONFIRM BOOKING SLOT' : 'SUBMIT & SCHEDULE CONSULTATION'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
