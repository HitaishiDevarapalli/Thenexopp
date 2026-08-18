import React, { useState, useMemo } from 'react';
import { propertiesDb, dealersDb, franchiseDb, businessDb, API_BASE_URL, enquiriesDb, notifyDataChanged } from '../db/marketplaceDb';
import { 
  FaArrowLeft, FaMapMarkerAlt, FaShoppingCart, 
  FaPhone, FaEnvelope, FaCheckCircle, FaLock, FaBuilding 
} from 'react-icons/fa';

interface CloseDealPageProps {
  propertyId: string;
  onBack: () => void;
}

export const CloseDealPage: React.FC<CloseDealPageProps> = ({ propertyId, onBack }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [contactMode, setContactMode] = useState<'Call' | 'WhatsApp' | 'Email'>('Call');
  const [visitDate, setVisitDate] = useState('');
  const [inquiry, setInquiry] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Fetch current property or franchise or business
  const property = useMemo(() => {
    const p = propertiesDb.find(p => p.id === propertyId);
    if (p) return p;
    
    const f = franchiseDb.find(f => f.id === propertyId);
    if (f) {
      const index = parseInt(f.id.replace(/\D/g, '')) || 1;
      const dealerId = index % 2 === 0 ? 'D2' : 'D1';
      return {
        id: f.id,
        dealerId: dealerId,
        title: `${f.brand} (${f.type})`,
        description: `Verified operational Franchise acquisition opportunity. locations: ${f.availableBranchCount}, trust score: ${f.trustScore}%.`,
        image: f.image,
        state: f.state || 'Telangana',
        district: 'Rangareddy',
        city: f.city || 'Hyderabad',
        area: f.location.split(',')[1]?.trim() || f.location,
        areaSqFt: `${f.availableBranchCount} Units`,
        priceDisplay: f.investmentDisplay,
        category: 'Commercial'
      } as any;
    }
    
    const b = businessDb.find(b => b.id === propertyId);
    if (b) {
      const assignedDealerId = b.dealerId || (b.assignedBrokerIds && b.assignedBrokerIds[0]) || '';
      return {
        id: b.id,
        dealerId: assignedDealerId || undefined,
        assignedBrokerIds: b.assignedBrokerIds || (assignedDealerId ? [assignedDealerId] : []),
        title: b.name || b.title,
        description: b.description || `Business acquisition opportunity in ${b.industry || b.category || 'Commercial'}.`,
        image: b.image || (b.images && b.images[0]) || '',
        state: b.state || 'Telangana',
        district: b.district || '',
        city: b.city || 'Hyderabad',
        area: b.area || b.location || '',
        areaSqFt: b.employeesCount ? `${b.employeesCount} Staff` : 'Operational unit',
        priceDisplay: b.priceDisplay || `₹${b.price || 0} Lakhs`,
        category: b.category || b.industry || 'Commercial'
      } as any;
    }
    
    return null;
  }, [propertyId]);

  // Fetch dealer
  const dealer = useMemo(() => {
    if (!property) return null;
    return dealersDb.find(d => d.id === property.dealerId) || null;
  }, [property]);

  if (!property) {
    return (
      <div className="container" style={{ padding: '8rem 2rem', textAlign: 'center' }}>
        <h2>Property Not Found</h2>
        <button className="btn btn-gold mt-4" onClick={onBack}><FaArrowLeft /> Go Back</button>
      </div>
    );
  }

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    const newEnquiry = {
      customerName: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      listingTitle: `Offer / Deal Close: ${property.title}`,
      listingType: property.category || 'PROPERTY',
      listingId: property.id,
      enquiryType: visitDate ? 'SLOT_BOOKING' : 'OFFER',
      message: inquiry.trim() ? `[Contact Mode: ${contactMode}] ${inquiry.trim()}` : `Offer submitted via Deal Close. Contact mode: ${contactMode}`,
      source: 'Close Deal Page',
      priority: 'High' as const,
      brokerName: dealer ? (dealer.fullName || dealer.companyName) : 'NEXOPP Advisor',
      date: visitDate || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      preferredTime: visitDate ? '10:00 AM' : ''
    };

    try {
      await fetch(`${API_BASE_URL}/api/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newEnquiry)
      });
    } catch (err) {
      console.warn('API sync warning:', err);
    } finally {
      enquiriesDb.unshift({
        id: `ENQ-OFFER-${Date.now()}`,
        ...newEnquiry,
        status: 'New' as const
      });
      notifyDataChanged();
      setSubmitted(true);
    }
  };

  const handleReturnHome = () => {
    // Force history reset to homepage
    window.location.reload();
  };

  return (
    <div className="checkout-page" style={{ paddingTop: '120px', paddingBottom: '4rem', background: 'var(--bg-main)', minHeight: '100vh' }}>
      <div className="container" style={{ position: 'relative' }}>
        
        {/* Back button */}
        <button className="circle-back-btn" onClick={onBack} title="Go Back" style={{ marginBottom: '1.5rem' }}>
          <FaArrowLeft />
        </button>

        {submitted ? (
          /* Success Screen */
          <div className="premium-card animation-fade-in" style={{ maxWidth: '600px', margin: '3rem auto', padding: '3.5rem 2.5rem', textAlign: 'center', borderRadius: '16px' }}>
            <FaCheckCircle style={{ color: '#22c55e', fontSize: '5rem', marginBottom: '1.5rem' }} />
            <h2 className="section-title" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Deal Request Submitted!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
              Congratulations! Your request to purchase <strong>{property.title}</strong> has been logged in our ecosystem.
              <br />
              <strong>{dealer?.companyName || 'The Seller'}</strong>'s representative has been notified and will call you at <strong style={{ color: 'var(--gold)' }}>{phone}</strong> within <strong style={{ color: 'var(--gold)' }}>15 minutes</strong> to finalize the Escrow Agreement and review legal paperwork.
            </p>
            <button className="btn btn-gold w-100" style={{ width: '100%' }} onClick={handleReturnHome}>
              Return to Homepage
            </button>
          </div>
        ) : (
          /* Main Form Split */
          <div className="checkout-split">
            
            {/* Left Column: Property Summary & Buyer Form */}
            <div className="checkout-left">
              
              {/* Property Summary Card */}
              <div className="checkout-summary-card premium-card" style={{ padding: '1.5rem', marginBottom: '2rem', borderRadius: '12px' }}>
                <h3 className="column-title" style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: 'none', padding: '0' }}>
                  {property?.status?.toLowerCase() === 'rent' ? 'Rental Property Selected for Enquiry' : 'Property Selected for Purchase'}
                </h3>
                {property?.status?.toLowerCase() === 'rent' && (
                  <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '10px', padding: '10px 14px', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 700, color: '#1E40AF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🤝</span>
                    <span>TheNexOpp Team Coordinates Tenant & Owner throughout the rental agreement process</span>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <img 
                    src={property.image} 
                    alt={property.title} 
                    style={{ width: '160px', height: '100px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)' }} 
                  />
                  <div style={{ flex: '1', minWidth: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{property.title}</h4>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        <FaMapMarkerAlt /> {property.area}, {property.city}
                      </p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>📐 {property.areaSqFt} Sq.Ft.</span>
                      <strong style={{ fontSize: '1.35rem', color: 'var(--gold)' }}>₹ {property.priceDisplay}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Buyer Information Form */}
              <div className="checkout-form-card premium-card" style={{ padding: '2.5rem', borderRadius: '16px' }}>
                <h3 className="column-title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
                  Provide Buyer Information
                </h3>
                <form onSubmit={handleSubmitOffer} className="checkout-form">
                  <div className="form-input-group">
                    <label className="form-label">👤 Full Name *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Enter your full name" 
                      required 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', marginTop: '0.5rem' }}
                    />
                  </div>

                  <div className="form-input-group" style={{ marginTop: '1.5rem' }}>
                    <label className="form-label">📞 Mobile Number *</label>
                    <input 
                      type="tel" 
                      className="form-input" 
                      placeholder="Enter 10-digit mobile number" 
                      required 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', marginTop: '0.5rem' }}
                    />
                  </div>

                  <div className="form-input-group" style={{ marginTop: '1.5rem' }}>
                    <label className="form-label">✉ Email Address *</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      placeholder="Enter your email address" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', marginTop: '0.5rem' }}
                    />
                  </div>

                  <div className="form-input-group" style={{ marginTop: '1.5rem' }}>
                    <label className="form-label">💬 Preferred Contact Mode</label>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                      {['Call', 'WhatsApp', 'Email'].map((mode) => (
                        <label 
                          key={mode} 
                          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem 1rem', borderRadius: '4px', background: contactMode === mode ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${contactMode === mode ? 'var(--gold)' : 'var(--border-color)'}` }}
                        >
                          <input 
                            type="radio" 
                            name="contactMode" 
                            checked={contactMode === mode} 
                            onChange={() => setContactMode(mode as any)}
                            style={{ display: 'none' }}
                          />
                          {mode}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="form-input-group" style={{ marginTop: '1.5rem' }}>
                    <label className="form-label">📅 Preferred Site Visit Date (Optional)</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', marginTop: '0.5rem' }}
                    />
                  </div>

                  <div className="form-input-group" style={{ marginTop: '1.5rem' }}>
                    <label className="form-label">📝 Message / Closing Offer Conditions</label>
                    <textarea 
                      className="inquiry-textarea" 
                      placeholder="Mention any specific terms, offers, or site inspection requests here..." 
                      value={inquiry}
                      onChange={(e) => setInquiry(e.target.value)}
                      style={{ width: '100%', height: '100px', padding: '0.8rem', borderRadius: '6px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', marginTop: '0.5rem', resize: 'none' }}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-gold w-100" 
                    style={{ width: '100%', marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <FaShoppingCart /> Confirm Offer & Contact Seller
                  </button>
                </form>
              </div>

            </div>

            {/* Right Column: Seller Details & Process Steps */}
            <div className="checkout-right">
              
              {/* Seller Contact Card */}
              {dealer && (
                <div className="premium-card" style={{ padding: '2rem', borderRadius: '16px', marginBottom: '2rem' }}>
                  <h3 className="column-title" style={{ fontSize: '1.35rem', marginBottom: '1.5rem' }}>
                    Seller Information
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <img 
                      src={dealer.photo || dealer.logo} 
                      alt={dealer.companyName} 
                      style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--gold)' }} 
                    />
                    <div>
                      <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{dealer.companyName}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        ⭐ {dealer.rating} ({dealer.reviewCount} Reviews)
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <FaPhone style={{ color: 'var(--gold)' }} />
                      <div>
                        <span style={{ fontSize: '0.85rem', display: 'block', color: 'var(--text-secondary)' }}>Mobile Number</span>
                        <strong style={{ color: 'var(--gold)', fontSize: '1.05rem' }}>+91 99890 87654</strong>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <FaEnvelope style={{ color: 'var(--gold)' }} />
                      <div>
                        <span style={{ fontSize: '0.85rem', display: 'block', color: 'var(--text-secondary)' }}>Email Address</span>
                        <span style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>info@{dealer.companyName.toLowerCase().replace(/\s+/g, '')}.com</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <FaBuilding style={{ color: 'var(--gold)' }} />
                      <div>
                        <span style={{ fontSize: '0.85rem', display: 'block', color: 'var(--text-secondary)' }}>Headquarters</span>
                        <span style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>Jubilee Hills, Hyderabad</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ color: 'var(--gold)', fontSize: '1.1rem' }}>📸</span>
                      <div>
                        <span style={{ fontSize: '0.85rem', display: 'block', color: 'var(--text-secondary)' }}>Instagram</span>
                        <a href="https://www.instagram.com/thenexopp?igsh=MTcxc21nMXJ3Y2lzeA%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)', fontSize: '0.95rem', textDecoration: 'underline' }}>@thenexopp</a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Secure Transaction Closing Roadmap */}
              <div className="premium-card" style={{ padding: '2rem', borderRadius: '16px' }}>
                <h3 className="column-title" style={{ fontSize: '1.35rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaLock style={{ color: 'var(--gold)', fontSize: '1.1rem' }} /> Secure Closing Steps
                </h3>
                
                <div className="transaction-steps-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  <div className="step-timeline-item" style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(212,175,55,0.2)', border: '1px solid var(--gold)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', color: 'var(--gold)', fontSize: '0.85rem', fontWeight: 'bold', flexShrink: 0 }}>
                      1
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>Submit Purchase Details</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Fill and submit the buyer form to link contact details with the seller.</p>
                    </div>
                  </div>

                  <div className="step-timeline-item" style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 'bold', flexShrink: 0 }}>
                      2
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>Immediate Representative Callback</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>A dedicated representative will contact you in 15 mins to confirm visit details.</p>
                    </div>
                  </div>

                  <div className="step-timeline-item" style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 'bold', flexShrink: 0 }}>
                      3
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>Review Escrow Agreement</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Draft legal agreements and fund secure escrow through TheNexOpp's partner bank.</p>
                    </div>
                  </div>

                  <div className="step-timeline-item" style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 'bold', flexShrink: 0 }}>
                      4
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>Physical Inspection & Registry</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Verify documents during site visit and complete title transfer registry.</p>
                    </div>
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
export default CloseDealPage;
