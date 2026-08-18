import React, { useState, useMemo } from 'react';
import { propertiesDb, dealersDb, franchiseDb, businessDb, enquiriesDb, addEnquiry, addBusinessEnquiry, notifyDataChanged, API_BASE_URL } from '../db/marketplaceDb';
import type { Dealer } from '../db/marketplaceDb';
import { FaArrowLeft, FaMapMarkerAlt, FaPhone, FaCalendarAlt, FaEnvelope, FaUser, FaCheckCircle, FaChevronLeft, FaChevronRight, FaHome, FaClock, FaBed, FaBath, FaRulerCombined, FaTag, FaUserTie } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

interface EnquiryPageProps {
  propertyId: string;
  mode: 'contact' | 'book';
  onBack: () => void;
}

const EnquiryPage: React.FC<EnquiryPageProps> = ({ propertyId, mode, onBack }) => {
  const { user, openLoginModal } = useAuth();

  // Resolve listing
  const property = useMemo(() => {
    const p = propertiesDb.find(p => p.id === propertyId);
    if (p) return p;
    const f = franchiseDb.find(f => f.id === propertyId);
    if (f) {
      const index = parseInt(f.id.replace(/\D/g, '')) || 1;
      const dealerId = index % 2 === 0 ? 'D2' : 'D1';
      return {
        id: f.id, dealerId, title: f.brand,
        description: `Verified operational setup for ${f.brand} (${f.type}). High customer retention, stable local supply chains, fully integrated POS systems, and complete staff handover.`,
        image: f.image, state: f.state || 'Telangana', district: 'Rangareddy', city: f.city || 'Hyderabad',
        area: f.location.split(',')[1]?.trim() || f.location, areaSqFt: `${f.availableBranchCount} Units Available`,
        priceDisplay: f.investmentDisplay, category: 'Commercial'
      } as any;
    }
    const b = businessDb.find(b => b.id === propertyId);
    if (b) {
      const index = parseInt(b.id.replace(/\D/g, '')) || 1;
      const dealerId = index % 2 === 0 ? 'D2' : 'D1';
      return {
        id: b.id, dealerId, title: b.name,
        description: `Premium running operational unit in the ${b.industry} sector. Monthly revenue averages verified against GST/tax registries.`,
        image: b.image, state: b.state || 'Telangana', district: 'Rangareddy', city: b.city || 'Hyderabad',
        area: b.location.split(',')[1]?.trim() || b.location, areaSqFt: 'Operational Unit',
        priceDisplay: b.priceDisplay, category: 'Commercial'
      } as any;
    }
    return null;
  }, [propertyId]);

  // Resolve dealer
  const dealer = useMemo((): Dealer | null => {
    if (!property) return null;
    let found = dealersDb.find(d => d.id === property.dealerId);
    if (!found && property.assignedBrokerIds?.length > 0) {
      found = dealersDb.find(d => property.assignedBrokerIds.includes(d.id));
    }
    if (!found) {
      return {
        id: property.dealerId || 'temp-dealer',
        fullName: property.agentName || 'Verified Advisor',
        companyName: property.agentName || 'RealtyPlus Advisors',
        photo: property.agentImage || '',
        phone: '1234567890', email: 'agent@nexopp.com'
      } as Dealer;
    }
    return found;
  }, [property]);

  // Gallery
  const galleryImages = useMemo(() => {
    if (!property) return [];
    const list = [property.image, property.image2, property.image3, property.image4, property.image5, property.image6].filter(Boolean) as string[];
    return list.length > 0 ? list : ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80'];
  }, [property]);

  // Form state
  const [contactName, setContactName] = useState(user?.name || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [contactMessage, setContactMessage] = useState('');
  const [contactPrice, setContactPrice] = useState(property?.priceDisplay || '');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [timePeriod, setTimePeriod] = useState<'AM' | 'PM'>('AM');
  const [customTime, setCustomTime] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeImgIdx, setActiveImgIdx] = useState(0);

  const AM_SLOTS = [
    { label: '09:00 AM - 10:00 AM', time: '09:00 AM', tag: 'Early Morning' },
    { label: '10:00 AM - 11:00 AM', time: '10:00 AM', tag: '⭐ Popular' },
    { label: '11:00 AM - 12:00 PM', time: '11:00 AM', tag: 'Morning' },
  ];

  const PM_SLOTS = [
    { label: '12:00 PM - 01:00 PM', time: '12:00 PM', tag: 'Noon' },
    { label: '02:00 PM - 03:00 PM', time: '02:00 PM', tag: 'Afternoon' },
    { label: '03:00 PM - 04:00 PM', time: '03:00 PM', tag: 'Afternoon' },
    { label: '04:00 PM - 05:00 PM', time: '04:00 PM', tag: '⭐ Popular' },
    { label: '05:00 PM - 06:00 PM', time: '05:00 PM', tag: 'Evening' },
    { label: '06:00 PM - 07:00 PM', time: '06:00 PM', tag: 'Late Evening' },
  ];

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim()) {
      alert('Please fill in your Name and Phone Number.');
      return;
    }
    if (mode === 'book' && (!bookingDate || !bookingTime)) {
      alert('Please select a date and time for your visit.');
      return;
    }

    setSubmitting(true);

    // Determine listing type
    const isProperty = !!propertiesDb.find(p => p.id === propertyId);
    const isBusiness = !!businessDb.find(b => b.id === propertyId);
    const listingType = isProperty ? 'PROPERTY' : isBusiness ? 'BUSINESS' : 'FRANCHISE';

    try {
      addEnquiry({
        id: `ENQ-${Date.now()}`,
        customerName: contactName.trim(),
        phone: contactPhone.trim(),
        email: contactEmail.trim(),
        listingTitle: property ? property.title : 'Unknown Property',
        brokerName: dealer ? (dealer.fullName || dealer.companyName) : 'NEXOPP Advisor',
        status: 'New' as const,
        priority: 'High' as const,
        source: 'Enquiry Page',
        listingType: listingType || 'PROPERTY',
        enquiryType: mode === 'book' ? ('SLOT_BOOKING' as const) : ('BUY' as const),
        date: mode === 'book' ? bookingDate : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        preferredTime: mode === 'book' ? bookingTime : undefined,
        preferredMoveInDate: mode === 'book' ? bookingDate : undefined,
        name: contactName.trim(),
        interest: mode === 'book'
          ? `Requested Visit: ${bookingDate} at ${bookingTime}`
          : `Offered Price: ${contactPrice}`,
        message: contactMessage.trim() || (mode === 'book' ? `Visit Slot Booking for ${bookingDate} at ${bookingTime}` : `Offered Price: ${contactPrice}`)
      });

      if (isBusiness) {
        addBusinessEnquiry({
          id: `BE-${Date.now()}`,
          businessId: propertyId,
          businessName: property ? property.title : 'Business Listing',
          name: contactName,
          mobile: contactPhone,
          email: contactEmail,
          message: contactMessage || (mode === 'book' ? `Visit Slot: ${bookingDate} at ${bookingTime}` : `Offer: ${contactPrice}`),
          status: 'New',
          notes: mode === 'book' ? `Visit Slot: ${bookingDate} at ${bookingTime}` : `Offer: ${contactPrice}`,
          createdAt: new Date().toISOString()
        });
      }

      setSubmitting(false);
      setSubmitted(true);
    } catch (err) {
      console.warn('Enquiry submission error:', err);
      setSubmitting(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  if (!property) {
    return (
      <div style={{ padding: '6rem 2rem', textAlign: 'center' }}>
        <h2>Property Not Found</h2>
        <button onClick={onBack} style={{ marginTop: '1rem', padding: '10px 24px', backgroundColor: '#007A55', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>
          <FaArrowLeft /> Go Back
        </button>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px 14px 44px',
    borderRadius: '12px',
    border: '1.5px solid #E2E8F0',
    fontSize: '0.95rem',
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    outline: 'none',
    boxSizing: 'border-box'
  };

  const iconStyle: React.CSSProperties = {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#007A55',
    fontSize: '14px'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: 700,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px'
  };

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      <style>{`
        .enquiry-page-grid {
          display: grid;
          grid-template-columns: 1fr 420px;
          gap: 2.5rem;
          align-items: start;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 16px;
        }
        @media (max-width: 960px) {
          .enquiry-page-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          .enquiry-form-card {
            padding: 1.5rem !important;
          }
          .enquiry-prop-sticky {
            position: static !important;
          }
        }
        @media (max-width: 480px) {
          .enquiry-page-grid {
            padding: 0 10px;
            gap: 1rem;
          }
          .enquiry-form-card {
            padding: 1.25rem !important;
          }
          .enquiry-date-time-grid {
            grid-template-columns: 1fr !important;
          }
        }
        .enquiry-gallery-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255,255,255,0.9);
          border: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 14px;
          color: #0F172A;
          transition: all 0.2s;
        }
        .enquiry-gallery-btn:hover {
          background: #FFFFFF;
          box-shadow: 0 4px 14px rgba(0,0,0,0.2);
        }
      `}</style>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #004D36 0%, #007A55 100%)',
        padding: '1.5rem 0',
        color: '#FFFFFF'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onBack}
            style={{
              width: '40px', height: '40px', borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.15)', border: 'none',
              color: '#FFFFFF', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', fontSize: '16px',
              flexShrink: 0
            }}
          >
            <FaArrowLeft />
          </button>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
              {mode === 'book' ? '📅 Book a Visit Slot' : '✉️ Contact Broker'}
            </h1>
            <p style={{ margin: '4px 0 0', color: '#A3D9C9', fontSize: '0.9rem', fontWeight: 500 }}>
              {property.title} — {property.area}, {property.city}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ padding: '2rem 0 4rem' }}>
        <div className="enquiry-page-grid">

          {/* LEFT — Form Area */}
          <div className="enquiry-form-card" style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            padding: '2.5rem',
            order: 1
          }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <div style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  backgroundColor: '#E6F4EA', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1.5rem', color: '#16A34A', fontSize: '2.5rem'
                }}>
                  <FaCheckCircle />
                </div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0F172A', margin: '0 0 0.5rem' }}>
                  {mode === 'book' ? 'Visit Booked Successfully!' : 'Enquiry Sent Successfully!'}
                </h2>
                <p style={{ color: '#64748B', fontSize: '1rem', lineHeight: 1.6, maxWidth: '400px', margin: '0 auto 2rem' }}>
                  {mode === 'book'
                    ? `Your viewing slot for ${bookingDate} at ${bookingTime} has been requested. The broker will confirm shortly.`
                    : 'The broker has received your enquiry and will reach out to you shortly.'
                  }
                </p>
                <button
                  onClick={onBack}
                  style={{
                    padding: '14px 32px', backgroundColor: '#007A55', color: '#FFFFFF',
                    border: 'none', borderRadius: '12px', fontWeight: 700,
                    fontSize: '1rem', cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(0,122,85,0.3)'
                  }}
                >
                  <FaArrowLeft style={{ marginRight: '8px' }} /> Back to Property
                </button>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    {mode === 'book' ? 'Schedule Your Visit' : 'Send Your Enquiry'}
                  </h2>
                  <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '6px' }}>
                    {mode === 'book'
                      ? 'Pick a date and time that works for you. The broker will confirm your slot.'
                      : 'Fill in your details below. The listing broker will contact you directly.'
                    }
                  </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Name */}
                  <div>
                    <label style={labelStyle}>Your Full Name *</label>
                    <div style={{ position: 'relative' }}>
                      <FaUser style={iconStyle} />
                      <input
                        type="text" required value={contactName}
                        onChange={e => setContactName(e.target.value)}
                        placeholder="Enter your full name"
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label style={labelStyle}>Phone Number *</label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ ...iconStyle, display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, fontSize: '0.85rem' }}>
                        <FaPhone style={{ fontSize: '12px' }} />
                        <span>+91</span>
                      </div>
                      <input
                        type="tel" required value={contactPhone}
                        onChange={e => setContactPhone(e.target.value)}
                        placeholder="Enter 10-digit mobile number" maxLength={10}
                        style={{ ...inputStyle, paddingLeft: '70px' }}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label style={labelStyle}>Email (optional)</label>
                    <div style={{ position: 'relative' }}>
                      <FaEnvelope style={iconStyle} />
                      <input
                        type="email" value={contactEmail}
                        onChange={e => setContactEmail(e.target.value)}
                        placeholder="name@email.com"
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  {/* Contact mode: Offered Price */}
                  {mode === 'contact' && (
                    <div>
                      <label style={labelStyle}>Your Offered Price</label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ ...iconStyle, fontWeight: 800, fontSize: '16px' }}>₹</span>
                        <input
                          type="text" value={contactPrice}
                          onChange={e => setContactPrice(e.target.value)}
                          placeholder="e.g. ₹ 75 Lakh"
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  )}

                  {/* Book mode: Date + Enhanced AM/PM Time Slot Selector */}
                  {mode === 'book' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {/* Preferred Date Input */}
                      <div>
                        <label style={labelStyle}>Preferred Visit Date *</label>
                        <div style={{ position: 'relative' }}>
                          <FaCalendarAlt style={iconStyle} />
                          <input
                            type="date"
                            required
                            value={bookingDate}
                            onChange={e => setBookingDate(e.target.value)}
                            min={todayStr}
                            style={inputStyle}
                          />
                        </div>
                      </div>

                      {/* Intuitive AM/PM Time Slot Selector */}
                      <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1.5px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                          <label style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                            <FaClock style={{ color: '#059669' }} /> Select Visit Time Slot *
                          </label>
                          
                          {/* AM / PM Segmented Switch */}
                          <div style={{ display: 'flex', backgroundColor: '#E2E8F0', padding: '3px', borderRadius: '8px', gap: '2px' }}>
                            <button
                              type="button"
                              onClick={() => setTimePeriod('AM')}
                              style={{
                                padding: '6px 14px',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                backgroundColor: timePeriod === 'AM' ? '#FFFFFF' : 'transparent',
                                color: timePeriod === 'AM' ? '#059669' : '#64748B',
                                boxShadow: timePeriod === 'AM' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
                              }}
                            >
                              ☀️ Morning (AM)
                            </button>
                            <button
                              type="button"
                              onClick={() => setTimePeriod('PM')}
                              style={{
                                padding: '6px 14px',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                backgroundColor: timePeriod === 'PM' ? '#FFFFFF' : 'transparent',
                                color: timePeriod === 'PM' ? '#059669' : '#64748B',
                                boxShadow: timePeriod === 'PM' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
                              }}
                            >
                              🌙 Afternoon / Evening (PM)
                            </button>
                          </div>
                        </div>

                        {/* Quick-Pick Slot Chips Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '10px' }}>
                          {(timePeriod === 'AM' ? AM_SLOTS : PM_SLOTS).map(slot => {
                            const isSelected = bookingTime === slot.label || bookingTime === slot.time;
                            return (
                              <button
                                key={slot.label}
                                type="button"
                                onClick={() => setBookingTime(slot.label)}
                                style={{
                                  padding: '10px 12px',
                                  borderRadius: '8px',
                                  border: isSelected ? '2px solid #059669' : '1px solid #CBD5E1',
                                  backgroundColor: isSelected ? '#ECFDF5' : '#FFFFFF',
                                  color: isSelected ? '#059669' : '#334155',
                                  fontWeight: isSelected ? 800 : 600,
                                  fontSize: '0.82rem',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  gap: '4px',
                                  transition: 'all 0.2s',
                                  boxShadow: isSelected ? '0 2px 8px rgba(5, 150, 105, 0.15)' : 'none'
                                }}
                              >
                                <span style={{ fontSize: '0.85rem' }}>{slot.label}</span>
                                {slot.tag && (
                                  <span style={{
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    color: isSelected ? '#047857' : '#64748B',
                                    backgroundColor: isSelected ? '#D1FAE5' : '#F1F5F9',
                                    padding: '2px 6px',
                                    borderRadius: '4px'
                                  }}>
                                    {slot.tag}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Selected Time Confirmation Badge */}
                        {bookingTime && (
                          <div style={{ marginTop: '12px', padding: '8px 12px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', color: '#065F46' }}>
                            <span>
                              ✓ Selected Visit Time: <strong style={{ color: '#047857' }}>{bookingTime}</strong>
                            </span>
                            <button
                              type="button"
                              onClick={() => setBookingTime('')}
                              style={{ background: 'none', border: 'none', color: '#059669', cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem', textDecoration: 'underline' }}
                            >
                              Change
                            </button>
                          </div>
                        )}

                        {/* Custom Time Option Toggle */}
                        <div style={{ marginTop: '10px', textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => setCustomTime(!customTime)}
                            style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '0.78rem', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}
                          >
                            {customTime ? 'Hide custom time' : 'Need a custom specific time?'}
                          </button>
                        </div>

                        {customTime && (
                          <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input
                              type="time"
                              value={bookingTime.includes('-') ? '' : bookingTime}
                              onChange={e => setBookingTime(e.target.value)}
                              style={{ ...inputStyle, paddingLeft: '14px', flexGrow: 1 }}
                              placeholder="Select exact time..."
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Message */}
                  <div>
                    <label style={labelStyle}>Message / Notes</label>
                    <textarea
                      value={contactMessage}
                      onChange={e => setContactMessage(e.target.value)}
                      placeholder={mode === 'book' ? 'Any special requests for the visit...' : 'Tell the broker about your requirements...'}
                      rows={4}
                      style={{
                        ...inputStyle,
                        paddingLeft: '16px',
                        resize: 'vertical',
                        minHeight: '100px'
                      }}
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      width: '100%', padding: '16px',
                      backgroundColor: submitting ? '#94A3B8' : '#007A55', color: '#FFFFFF',
                      border: 'none', borderRadius: '14px',
                      fontWeight: 800, fontSize: '1.05rem',
                      cursor: submitting ? 'not-allowed' : 'pointer', marginTop: '8px',
                      boxShadow: submitting ? 'none' : '0 6px 20px rgba(0,122,85,0.3)',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: '8px',
                      transition: 'all 0.2s'
                    }}
                  >
                    {submitting 
                      ? 'Submitting...' 
                      : mode === 'book' ? '📅 Confirm Visit Booking' : '✉️ Submit Enquiry to Broker'
                    }
                  </button>
                </form>
              </>
            )}
          </div>

          {/* RIGHT — Property Details Summary */}
          <div className="enquiry-prop-sticky" style={{ position: 'sticky', top: '2rem', order: 2 }}>
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              overflow: 'hidden'
            }}>
              {/* Image Gallery */}
              <div style={{ position: 'relative', height: '260px', overflow: 'hidden' }}>
                <img
                  src={galleryImages[activeImgIdx]}
                  alt={property.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {galleryImages.length > 1 && (
                  <>
                    <button
                      className="enquiry-gallery-btn"
                      style={{ left: '10px' }}
                      onClick={() => setActiveImgIdx(prev => prev === 0 ? galleryImages.length - 1 : prev - 1)}
                    >
                      <FaChevronLeft />
                    </button>
                    <button
                      className="enquiry-gallery-btn"
                      style={{ right: '10px' }}
                      onClick={() => setActiveImgIdx(prev => prev === galleryImages.length - 1 ? 0 : prev + 1)}
                    >
                      <FaChevronRight />
                    </button>
                  </>
                )}
                {/* Dots */}
                {galleryImages.length > 1 && (
                  <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px' }}>
                    {galleryImages.map((_, i) => (
                      <div
                        key={i}
                        onClick={() => setActiveImgIdx(i)}
                        style={{
                          width: activeImgIdx === i ? '20px' : '8px',
                          height: '8px',
                          borderRadius: '4px',
                          backgroundColor: activeImgIdx === i ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      />
                    ))}
                  </div>
                )}
                {/* Badge */}
                <span style={{
                  position: 'absolute', top: '12px', left: '12px',
                  backgroundColor: mode === 'book' ? '#1E40AF' : '#007A55',
                  color: '#FFFFFF', fontSize: '0.72rem', fontWeight: 800,
                  padding: '5px 12px', borderRadius: '8px', textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {mode === 'book' ? '📅 Visit Booking' : '✉️ Enquiry'}
                </span>
              </div>

              {/* Property Info */}
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px', lineHeight: 1.3 }}>
                  {property.title}
                </h3>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#007A55', margin: '0 0 12px' }}>
                  ₹ {property.priceDisplay}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', fontSize: '0.9rem', marginBottom: '16px' }}>
                  <FaMapMarkerAlt style={{ color: '#007A55', flexShrink: 0 }} />
                  <span>{property.area}, {property.city}, {property.state}</span>
                </div>

                {/* Specs Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                  {property.bedrooms && (
                    <div style={{ backgroundColor: '#F8FAFC', padding: '10px 12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaBed style={{ color: '#007A55', fontSize: '14px' }} />
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Beds</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>{property.bedrooms}</div>
                      </div>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div style={{ backgroundColor: '#F8FAFC', padding: '10px 12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaBath style={{ color: '#007A55', fontSize: '14px' }} />
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Baths</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>{property.bathrooms}</div>
                      </div>
                    </div>
                  )}
                  {property.areaSqFt && (
                    <div style={{ backgroundColor: '#F8FAFC', padding: '10px 12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaRulerCombined style={{ color: '#007A55', fontSize: '14px' }} />
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Area</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>{property.areaSqFt}</div>
                      </div>
                    </div>
                  )}
                  {property.category && (
                    <div style={{ backgroundColor: '#F8FAFC', padding: '10px 12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaTag style={{ color: '#007A55', fontSize: '14px' }} />
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Type</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>{property.category}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                {property.description && (
                  <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.6, margin: '0 0 16px', borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
                    {property.description.length > 200 ? property.description.substring(0, 200) + '...' : property.description}
                  </p>
                )}

                {/* Broker Card */}
                {dealer && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '12px',
                    border: '1px solid #E2E8F0'
                  }}>
                    {dealer.photo || dealer.logo ? (
                      <img
                        src={dealer.photo || dealer.logo}
                        alt={dealer.fullName || dealer.companyName}
                        style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #E2E8F0' }}
                      />
                    ) : (
                      <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#E0F2FE', color: '#0369A1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.15rem', border: '2px solid #BAE6FD', flexShrink: 0 }}>
                        <FaUserTie />
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }}>
                        {dealer.fullName || dealer.companyName}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                        {dealer.companyName || 'Verified Broker'} • {dealer.yearsExperience || 5}+ yrs
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnquiryPage;
