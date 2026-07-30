import React from 'react';
import { FaBolt, FaCheckCircle, FaBullhorn, FaPlus } from 'react-icons/fa';

export const CTABanner: React.FC = () => {
  const features = [
    { icon: <FaBolt />, title: 'Quick Approval', desc: 'Get your listing live in less than 24 hrs' },
    { icon: <FaCheckCircle />, title: 'Verified Listings', desc: 'Only genuine & verified opportunities' },
    { icon: <FaBullhorn />, title: 'Maximum Reach', desc: 'Promote to the right audience' },
  ];

  return (
    <section style={{
      padding: '0 5%',
      margin: '3rem auto',
      maxWidth: '1280px',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #16A34A 0%, #15803D 50%, #166534 100%)',
        borderRadius: '1.25rem',
        padding: '3rem 3.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '2rem',
        flexWrap: 'wrap' as const,
      }}>
        {/* Left text */}
        <div style={{ flex: '1 1 200px' }}>
          <h2 style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '1.6rem',
            fontWeight: 800,
            color: '#FFFFFF',
            lineHeight: 1.3,
            marginBottom: '0.5rem',
          }}>
            List Your Opportunity<br />
            Get Maximum Exposure
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.9rem',
            color: 'rgba(255,255,255,0.8)',
          }}>
            Reach thousands of potential buyers, investors & customers.
          </p>
        </div>

        {/* Features */}
        {features.map((feat, idx) => (
          <div key={idx} style={{
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            textAlign: 'center' as const,
            gap: '0.5rem',
            flex: '0 0 auto',
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontSize: '1.1rem',
            }}>
              {feat.icon}
            </div>
            <span style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#FFFFFF',
            }}>{feat.title}</span>
            <span style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.75)',
              maxWidth: '140px',
            }}>{feat.desc}</span>
          </div>
        ))}

        {/* CTA Button */}
        <div style={{
          display: 'flex',
          flexDirection: 'column' as const,
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <button 
            onClick={() => {
              const el = document.getElementById('contact');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              } else {
                window.location.hash = 'contact';
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.85rem 1.8rem',
              borderRadius: '0.6rem',
              border: '2px solid #FFFFFF',
              background: '#FFFFFF',
              color: '#16A34A',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.95rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F0FDF4'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
          >
            Contact Us to List Your Property
          </button>
          <span style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.8rem',
            color: 'rgba(255,255,255,0.85)',
            fontStyle: 'italic',
            fontWeight: 600
          }}>Quick Response & Easy Listing</span>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;
