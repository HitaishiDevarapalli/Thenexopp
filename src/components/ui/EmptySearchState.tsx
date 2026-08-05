import React from 'react';
import { FaCompass, FaGlobeAsia, FaSearchLocation } from 'react-icons/fa';
import { DistanceRadiusOption } from '../../hooks/usePropertySearch';

interface EmptySearchStateProps {
  locationName: string;
  currentRadius: DistanceRadiusOption;
  onExpandRadius: (radius: DistanceRadiusOption) => void;
}

export const EmptySearchState: React.FC<EmptySearchStateProps> = ({
  locationName,
  currentRadius,
  onExpandRadius,
}) => {
  const radiusKmText = currentRadius ? `${currentRadius / 1000} km` : 'selected area';

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid #E2E8F0',
        padding: '48px 24px',
        textAlign: 'center',
        maxWidth: '600px',
        margin: '40px auto',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: '#ECFDF5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto',
        }}
      >
        <FaSearchLocation style={{ color: '#059669', fontSize: '32px' }} />
      </div>

      <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0F172A', margin: '0 0 10px 0' }}>
        No properties found within {radiusKmText}
      </h3>

      <p style={{ fontSize: '0.95rem', color: '#64748B', lineHeight: 1.6, margin: '0 0 28px 0' }}>
        There are currently no verified property listings matching <strong>{locationName}</strong> within {radiusKmText}.
        Expand your search radius to find nearby properties in surrounding regions:
      </p>

      {/* Quick Action Expansion Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px' }}>
        {currentRadius !== 100000 && (
          <button
            onClick={() => onExpandRadius(100000)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#00A86B',
              color: '#FFFFFF',
              border: 'none',
              padding: '12px 22px',
              borderRadius: '24px',
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0, 168, 107, 0.3)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <FaCompass style={{ fontSize: '15px' }} />
            <span>Search within 100 km</span>
          </button>
        )}

        {currentRadius !== 200000 && (
          <button
            onClick={() => onExpandRadius(200000)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
              border: 'none',
              padding: '12px 22px',
              borderRadius: '24px',
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.25)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <FaCompass style={{ fontSize: '15px' }} />
            <span>Search within 200 km</span>
          </button>
        )}

        {currentRadius !== null && (
          <button
            onClick={() => onExpandRadius(null)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#F1F5F9',
              color: '#334155',
              border: '1px solid #CBD5E1',
              padding: '12px 22px',
              borderRadius: '24px',
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#E2E8F0')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#F1F5F9')}
          >
            <FaGlobeAsia style={{ fontSize: '15px', color: '#64748B' }} />
            <span>Search Anywhere</span>
          </button>
        )}
      </div>
    </div>
  );
};
