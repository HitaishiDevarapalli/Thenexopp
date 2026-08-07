import React, { useState, useEffect } from 'react';
import { 
  FaHandHoldingUsd, 
  FaShieldAlt, 
  FaCheckCircle, 
  FaPhoneAlt,
  FaArrowRight
} from 'react-icons/fa';

interface FinanceSectionProps {
  onCategorySelect?: (category: 'loans' | 'insurance') => void;
  initialCategory?: 'loans' | 'insurance' | null;
}

export const FinanceSection: React.FC<FinanceSectionProps> = ({ onCategorySelect, initialCategory }) => {
  const [activeCategory, setActiveCategory] = useState<'loans' | 'insurance'>(
    initialCategory === 'insurance' ? 'insurance' : 'loans'
  );
  const [showForm, setShowForm] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', requirements: '' });

  useEffect(() => {
    if (initialCategory === 'insurance' || initialCategory === 'loans') {
      setActiveCategory(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    const handleSelect = (e: Event) => {
      const cat = (e as CustomEvent).detail;
      if (cat === 'insurance' || cat === 'loans') {
        if (onCategorySelect) {
          onCategorySelect(cat);
        } else {
          setActiveCategory(cat);
        }
      }
    };
    window.addEventListener('select-finance-category', handleSelect);
    return () => window.removeEventListener('select-finance-category', handleSelect);
  }, [onCategorySelect]);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setShowForm(null);
      setFormSubmitted(false);
      setFormData({ name: '', phone: '', email: '', requirements: '' });
    }, 3000);
  };

  const handleToggleCategory = (cat: 'loans' | 'insurance') => {
    if (onCategorySelect) {
      onCategorySelect(cat);
    } else {
      setActiveCategory(cat);
    }
  };

  return (
    <section id="finance" className="section-padding finance-section-global" style={{ paddingTop: initialCategory ? '2rem' : '3rem', fontFamily: "'Outfit', 'Inter', -apple-system, sans-serif" }}>
      <div className="container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px', boxSizing: 'border-box' }}>
        
        {!initialCategory && (
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="section-tag">FINANCIAL & PROTECTION SERVICES</span>
            <h2 className="section-title" style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A' }}>Loans & Insurance Solutions</h2>
          </div>
        )}

        {/* 2-Category Selector Tabs: Loans & Insurance */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleToggleCategory('loans')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 36px',
              borderRadius: '16px',
              border: activeCategory === 'loans' ? '2px solid #059669' : '1px solid #E2E8F0',
              backgroundColor: activeCategory === 'loans' ? '#ECFDF5' : '#FFFFFF',
              color: activeCategory === 'loans' ? '#059669' : '#475569',
              fontWeight: 800,
              fontSize: '1.15rem',
              cursor: 'pointer',
              boxShadow: activeCategory === 'loans' ? '0 8px 20px rgba(5,150,105,0.15)' : '0 2px 6px rgba(0,0,0,0.04)',
              transition: 'all 0.25s ease'
            }}
          >
            <FaHandHoldingUsd style={{ fontSize: '1.4rem', color: activeCategory === 'loans' ? '#059669' : '#64748B' }} />
            <span>Loans</span>
          </button>

          <button
            onClick={() => handleToggleCategory('insurance')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 36px',
              borderRadius: '16px',
              border: activeCategory === 'insurance' ? '2px solid #059669' : '1px solid #E2E8F0',
              backgroundColor: activeCategory === 'insurance' ? '#ECFDF5' : '#FFFFFF',
              color: activeCategory === 'insurance' ? '#059669' : '#475569',
              fontWeight: 800,
              fontSize: '1.15rem',
              cursor: 'pointer',
              boxShadow: activeCategory === 'insurance' ? '0 8px 20px rgba(5,150,105,0.15)' : '0 2px 6px rgba(0,0,0,0.04)',
              transition: 'all 0.25s ease'
            }}
          >
            <FaShieldAlt style={{ fontSize: '1.4rem', color: activeCategory === 'insurance' ? '#059669' : '#64748B' }} />
            <span>Insurance</span>
          </button>
        </div>

        {/* Content Box */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '40px 48px', border: '1px solid #E2E8F0', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          {activeCategory === 'loans' ? (
            <div>
              <div style={{ borderBottom: '2px solid #ECFDF5', paddingBottom: '20px', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0F172A', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
                  Loans
                </h2>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#059669', margin: 0 }}>
                  Real Estate & Business Finance
                </h3>
              </div>

              <p style={{ fontSize: '1.05rem', lineHeight: '1.8', color: '#334155', marginBottom: '28px' }}>
                Whether you're acquiring a property, expanding your business, or seeking capital for growth, THENEXOPP provides professional loan assistance through our network of leading banks and NBFCs. Our experienced team works closely with you to understand your requirements, compare suitable financing options, and support you throughout the application process for a smooth and efficient experience.
              </p>

              <div style={{ backgroundColor: '#F0FDF4', borderLeft: '5px solid #059669', padding: '24px 28px', borderRadius: '12px', marginBottom: '32px' }}>
                <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#065F46', lineHeight: '1.7' }}>
                  Please contact our team to discuss your financing requirements. Our specialists will guide you in identifying the most suitable lending solution based on your needs and eligibility.
                </p>
              </div>

              <button
                onClick={() => setShowForm('Loans - Real Estate & Business Finance')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: '#059669',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '16px 36px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(5,150,105,0.3)',
                  transition: 'all 0.2s ease'
                }}
              >
                <FaPhoneAlt />
                <span>Contact Our Team</span>
                <FaArrowRight />
              </button>
            </div>
          ) : (
            <div>
              <div style={{ borderBottom: '2px solid #ECFDF5', paddingBottom: '20px', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0F172A', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
                  Insurance
                </h2>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#059669', margin: 0 }}>
                  Insurance Solutions
                </h3>
              </div>

              <p style={{ fontSize: '1.05rem', lineHeight: '1.8', color: '#334155', marginBottom: '28px' }}>
                Protect your investments, business, and assets with insurance solutions tailored to your needs. THENEXOPP works with leading insurance providers to help individuals and businesses identify appropriate coverage through a simple and transparent process. Our team offers professional guidance to ensure you receive suitable protection and ongoing support.
              </p>

              <div style={{ backgroundColor: '#F0FDF4', borderLeft: '5px solid #059669', padding: '24px 28px', borderRadius: '12px', marginBottom: '32px' }}>
                <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#065F46', lineHeight: '1.7' }}>
                  Please contact our team to discuss your insurance requirements. Our specialists will help you compare available options and choose the most appropriate coverage for your circumstances.
                </p>
              </div>

              <button
                onClick={() => setShowForm('Insurance - Insurance Solutions')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: '#059669',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '16px 36px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(5,150,105,0.3)',
                  transition: 'all 0.2s ease'
                }}
              >
                <FaPhoneAlt />
                <span>Contact Our Team</span>
                <FaArrowRight />
              </button>
            </div>
          )}
        </div>

        {/* Contact Form Modal */}
        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(null)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ background: '#FFFFFF', padding: '2.5rem', borderRadius: '20px', width: '90%', maxWidth: '520px', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', border: '1px solid #E2E8F0' }}>
              <button onClick={() => setShowForm(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748B' }}>&times;</button>
              
              {!formSubmitted ? (
                <>
                  <h3 style={{ marginBottom: '0.5rem', color: '#0F172A', fontSize: '1.5rem', fontWeight: 800 }}>Contact Our Specialists</h3>
                  <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1.5rem', fontWeight: 600 }}>Inquiry for {showForm}</p>
                  
                  <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <input type="text" placeholder="Full Name *" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '1rem', width: '100%', boxSizing: 'border-box' }} />
                    <input type="tel" placeholder="Phone Number *" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '1rem', width: '100%', boxSizing: 'border-box' }} />
                    <input type="email" placeholder="Email Address *" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '1rem', width: '100%', boxSizing: 'border-box' }} />
                    <textarea placeholder="Tell us about your requirements..." value={formData.requirements} onChange={e => setFormData({...formData, requirements: e.target.value})} style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '1rem', minHeight: '100px', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }} />
                    <button type="submit" style={{ backgroundColor: '#059669', color: '#FFFFFF', border: 'none', padding: '14px', fontSize: '1.1rem', fontWeight: 800, width: '100%', borderRadius: '10px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(5,150,105,0.3)' }}>Submit Inquiry</button>
                  </form>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <FaCheckCircle style={{ fontSize: '4rem', color: '#059669', marginBottom: '1rem' }} />
                  <h3 style={{ color: '#0F172A', marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: 800 }}>Inquiry Submitted!</h3>
                  <p style={{ color: '#475569', fontSize: '1rem', lineHeight: '1.6' }}>Our financial specialist will contact you shortly to guide you on {showForm}.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default FinanceSection;
