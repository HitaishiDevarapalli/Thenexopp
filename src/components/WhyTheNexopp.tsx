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
            fontSize: '1.75rem',
            fontWeight: 700,
            color: '#1F2937',
            textAlign: 'center',
            marginBottom: 48,
          }}
        >
          Why Choose TheNexOpp?
        </h2>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 0,
          }}
        >
          {stats.map((stat, idx) => (
            <React.Fragment key={idx}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: 1,
                  padding: '0 16px',
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

              {/* Vertical divider (skip after last item) */}
              {idx < stats.length - 1 && (
                <div
                  style={{
                    width: 1,
                    height: 80,
                    backgroundColor: '#E5E7EB',
                    alignSelf: 'center',
                    flexShrink: 0,
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyTheNexopp;
