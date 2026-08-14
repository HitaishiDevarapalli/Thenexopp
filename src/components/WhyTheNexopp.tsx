import React from 'react';
import { FaListAlt, FaUsers, FaMapMarkerAlt, FaCheckCircle, FaHeadset } from 'react-icons/fa';
import { siteSettingsDb } from '../db/marketplaceDb';

interface StatItem {
  icon: React.ReactNode;
  value: string;
  label: string;
}

export const WhyTheNexopp: React.FC = () => {
  const s = siteSettingsDb.mainPageStats || {
    activeListingsWhy: '10,000+',
    happyCustomersWhy: '5,000+',
    citiesCoveredWhy: '50+',
    verifiedListingsWhy: '100%',
    customerSupportWhy: '24/7'
  };

  const stats: StatItem[] = [
    { icon: <FaListAlt />, value: s.activeListingsWhy || '10,000+', label: 'Active Listings' },
    { icon: <FaUsers />, value: s.happyCustomersWhy || '5,000+', label: 'Happy Customers' },
    { icon: <FaMapMarkerAlt />, value: s.citiesCoveredWhy || '50+', label: 'Cities Covered' },
    { icon: <FaCheckCircle />, value: s.verifiedListingsWhy || '100%', label: 'Verified Listings' },
    { icon: <FaHeadset />, value: s.customerSupportWhy || '24/7', label: 'Customer Support' },
  ];

  return (
    <section
      style={{
        padding: '60px 20px',
        backgroundColor: '#FAFAFA',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <h2
          style={{
            fontSize: 'clamp(1.4rem, 3.5vw, 1.85rem)',
            fontWeight: 800,
            color: '#0F172A',
            textAlign: 'center',
            marginBottom: 36,
            letterSpacing: '-0.02em'
          }}
        >
          Why Choose The Nexopp?
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '20px',
            alignItems: 'center'
          }}
        >
          {stats.map((stat, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                padding: '16px 8px',
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
              }}
            >
                {/* Icon circle */}
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    backgroundColor: '#F0FDF4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    color: '#16A34A',
                    marginBottom: 14,
                  }}
                >
                  {stat.icon}
                </div>

                {/* Value */}
                <span
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: '#1F2937',
                    lineHeight: 1.2,
                  }}
                >
                  {stat.value}
                </span>

                {/* Label */}
                <span
                  style={{
                    fontSize: '0.85rem',
                    color: '#6B7280',
                    marginTop: 4,
                  }}
                >
                  {stat.label}
                </span>
              </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyTheNexopp;
