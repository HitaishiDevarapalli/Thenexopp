import React, { useState } from 'react';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaPaperPlane, FaClock, FaCheckCircle, FaBuilding, FaShieldAlt, FaBriefcase, FaCoins } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

export const ContactUs: React.FC = () => {
  const { user, openLoginModal } = useAuth();

  React.useEffect(() => {
    const lenis = (window as any).lenis;
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    category: 'Properties',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('🔒 Login required to submit contact inquiries. Please sign in to continue.');
      openLoginModal();
      return;
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        phone: '',
        email: '',
        category: 'Properties',
        message: ''
      });
    }, 4000);
  };

  return (
    <section id="contact" className="section-padding contact-section" style={{ backgroundColor: '#F8FAFC', padding: '60px 20px', minHeight: '80vh', fontFamily: "'Outfit', 'Inter', -apple-system, sans-serif" }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header - Matching About Us exact styling */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '2px', backgroundColor: '#EFF6FF', padding: '6px 16px', borderRadius: '20px', display: 'inline-block', marginBottom: '16px' }}>
            GET IN TOUCH
          </span>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0F172A', margin: '0 0 16px 0', letterSpacing: '-0.03em' }}>
            Connect with TheNexOpp Advisory Desk
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#64748B', maxWidth: '720px', margin: '0 auto', lineHeight: '1.6' }}>
            Whether you are acquiring premium real estate, seeking loan assistance, exploring business opportunities, or protecting assets, our dedicated portfolio team is here to assist you.
          </p>
        </div>

        {/* 3 Executive Contact Info Cards Grid - Matching About Us Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px', marginBottom: '48px' }}>
          
          {/* Card 1: Headquarters */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '32px 28px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)',
              transition: 'transform 0.3s ease, boxShadow 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(15, 23, 42, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(15, 23, 42, 0.04)';
            }}
          >
            <div>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '20px' }}>
                <FaMapMarkerAlt />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
                Registry Headquarters
              </h3>
              <p style={{ fontSize: '0.98rem', fontWeight: 700, color: '#2563EB', margin: '0 0 12px 0' }}>
                TheNexopp Towers
              </p>
              <p style={{ fontSize: '0.95rem', color: '#64748B', lineHeight: '1.6', margin: 0 }}>
                Level 14, Financial District, Gachibowli, Hyderabad, Telangana - 500032
              </p>
            </div>
            
            <div style={{ borderTop: '1px solid #F1F5F9', marginTop: '24px', paddingTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontSize: '0.88rem', fontWeight: 700 }}>
              <FaClock />
              <span>Mon – Sat: 9:00 AM – 7:30 PM</span>
            </div>
          </div>

          {/* Card 2: Priority Phone Desk */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '32px 28px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)',
              transition: 'transform 0.3s ease, boxShadow 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(15, 23, 42, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(15, 23, 42, 0.04)';
            }}
          >
            <div>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '20px' }}>
                <FaPhoneAlt />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
                Priority Call Desk
              </h3>
              <p style={{ fontSize: '0.98rem', fontWeight: 700, color: '#059669', margin: '0 0 12px 0' }}>
                Immediate Assistance
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a href="tel:+914049002200" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', textDecoration: 'none' }}>
                  +91 40 4900 2200
                </a>
                <a href="tel:+918056007800" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', textDecoration: 'none' }}>
                  +91 80 5600 7800
                </a>
              </div>
            </div>
            
            <div style={{ borderTop: '1px solid #F1F5F9', marginTop: '24px', paddingTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#2563EB', fontSize: '0.88rem', fontWeight: 700 }}>
              <FaCheckCircle />
              <span>Direct Line to Portfolio Directors</span>
            </div>
          </div>

          {/* Card 3: Email Inquiries */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '32px 28px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)',
              transition: 'transform 0.3s ease, boxShadow 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(15, 23, 42, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(15, 23, 42, 0.04)';
            }}
          >
            <div>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '20px' }}>
                <FaEnvelope />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
                Official Email Desk
              </h3>
              <p style={{ fontSize: '0.98rem', fontWeight: 700, color: '#DC2626', margin: '0 0 12px 0' }}>
                Written Requests & Documentation
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a href="mailto:desk@thenexopp.in" style={{ fontSize: '1.02rem', fontWeight: 700, color: '#0F172A', textDecoration: 'none' }}>
                  desk@thenexopp.in
                </a>
                <a href="mailto:acquisitions@thenexopp.in" style={{ fontSize: '1.02rem', fontWeight: 700, color: '#0F172A', textDecoration: 'none' }}>
                  acquisitions@thenexopp.in
                </a>
              </div>
            </div>
            
            <div style={{ borderTop: '1px solid #F1F5F9', marginTop: '24px', paddingTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#DC2626', fontSize: '0.88rem', fontWeight: 700 }}>
              <FaPaperPlane />
              <span>Replies within 24 Hours</span>
            </div>
          </div>

        </div>

        <style>{`
          .contact-two-col-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 36px;
            align-items: start;
          }
          @media (max-width: 900px) {
            .contact-two-col-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>

        {/* 2-Column Main Section: Consultation Form + Map */}
        <div className="contact-two-col-grid">
          
          {/* Consultation Form Card */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '40px 36px', border: '1px solid #E2E8F0', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '1.5px', backgroundColor: '#ECFDF5', padding: '4px 12px', borderRadius: '14px', display: 'inline-block', marginBottom: '12px' }}>
              EXECUTIVE FORM
            </span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
              Initiate Consultation
            </h3>
            <p style={{ fontSize: '0.98rem', color: '#64748B', marginBottom: '28px', lineHeight: '1.5' }}>
              Submit your requirements below and an acquisition director will reach out within 24 hours.
            </p>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '36px 20px', backgroundColor: '#ECFDF5', borderRadius: '16px', border: '1px solid #A7F3D0' }}>
                <FaCheckCircle style={{ fontSize: '3.5rem', color: '#059669', marginBottom: '16px' }} />
                <h4 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0' }}>Inquiry Registered!</h4>
                <p style={{ fontSize: '0.98rem', color: '#065F46', margin: 0, lineHeight: '1.6' }}>
                  Your request has been logged securely. A portfolio director has been assigned and will call you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div>
                    <label htmlFor="name" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Full Name *</label>
                    <input 
                      type="text" 
                      id="name" 
                      required 
                      placeholder="e.g. Rahul Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '0.98rem', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Contact Number *</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      required 
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '0.98rem', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div>
                    <label htmlFor="email" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Email Address *</label>
                    <input 
                      type="email" 
                      id="email" 
                      required 
                      placeholder="rahul@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '0.98rem', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label htmlFor="category" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Inquiry Portfolio *</label>
                    <select 
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '0.98rem', outline: 'none', backgroundColor: '#FFFFFF', boxSizing: 'border-box' }}
                    >
                      <option value="Properties">Properties (Buy, Sell, Rent)</option>
                      <option value="Franchise">Franchise Opportunities</option>
                      <option value="Business">Business Acquisition / Sale</option>
                      <option value="Loans">Loans (Real Estate & Business)</option>
                      <option value="Insurance">Insurance & Asset Protection</option>
                      <option value="Services">Professional Advisory Desk</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Your Requirements / Notes *</label>
                  <textarea 
                    id="message" 
                    rows={4} 
                    required
                    placeholder="Describe your budget, location preferences, or specific inquiry..."
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '0.98rem', outline: 'none', fontFamily: 'inherit', minHeight: '110px', boxSizing: 'border-box' }}
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  style={{ 
                    backgroundColor: '#059669', 
                    color: '#FFFFFF', 
                    border: 'none', 
                    padding: '16px 28px', 
                    borderRadius: '14px', 
                    fontSize: '1.05rem', 
                    fontWeight: 800, 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '10px', 
                    boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)', 
                    transition: 'all 0.2s ease',
                    marginTop: '8px'
                  }}
                >
                  <FaPaperPlane />
                  <span>Request Confidential Callback</span>
                </button>
              </form>
            )}
          </div>

          {/* Location Map & HQ Banner Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '32px', border: '1px solid #E2E8F0', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
                Visit Our Headquarters
              </h3>
              <p style={{ fontSize: '0.92rem', color: '#64748B', margin: '0 0 20px 0', lineHeight: 1.5 }}>
                Located in the heart of Gachibowli Financial District, accessible via Outer Ring Road.
              </p>
              
              <div style={{ borderRadius: '18px', overflow: 'hidden', height: '280px', border: '1px solid #CBD5E1', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.8272225611135!2d78.3415!3d17.4262!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb93f21132711d%3A0x6b772be425e24b45!2sGachibowli%2C%20Hyderabad%2C%20Telangana!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={true} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="TheNexopp Towers Location Map"
                ></iframe>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default ContactUs;
