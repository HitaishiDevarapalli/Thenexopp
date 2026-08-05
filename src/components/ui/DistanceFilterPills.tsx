import React from 'react';
import { FaMapMarkerAlt, FaCompass, FaCheckCircle, FaRegCircle } from 'react-icons/fa';
import type { DistanceRadiusOption } from '../../hooks/usePropertySearch';

interface DistanceFilterPillsProps {
  locationName: string;
  selectedRadius: DistanceRadiusOption;
  onRadiusChange: (radius: DistanceRadiusOption) => void;
  totalCount: number;
}

export const DistanceFilterPills: React.FC<DistanceFilterPillsProps> = ({
  locationName,
  selectedRadius,
  onRadiusChange,
  totalCount,
}) => {
  const options: { label: string; value: DistanceRadiusOption }[] = [
    { label: 'Within 50 km', value: 50000 },
    { label: 'Within 100 km', value: 100000 },
    { label: 'Within 200 km', value: 200000 },
    { label: 'Anywhere', value: null },
  ];

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        padding: '16px 20px',
        marginBottom: '24px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        {/* Left: Location tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#DCFCE7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FaMapMarkerAlt style={{ color: '#16A34A', fontSize: '16px' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              SEARCH LOCATION
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
              {locationName || 'Hyderabad'}
            </div>
          </div>
        </div>

        {/* Right: Distance Selector Pills */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginRight: '4px' }}>
            <FaCompass style={{ color: '#059669', fontSize: '15px' }} />
            <span>Distance:</span>
          </div>

          {options.map(opt => {
            const isSelected = selectedRadius === opt.value;
            return (
              <button
                key={opt.label}
                onClick={() => onRadiusChange(opt.value)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '24px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: isSelected ? '#00A86B' : '#F8FAFC',
                  color: isSelected ? '#FFFFFF' : '#475569',
                  border: isSelected ? '1px solid #00A86B' : '1px solid #E2E8F0',
                  boxShadow: isSelected ? '0 4px 12px rgba(0, 168, 107, 0.25)' : 'none',
                }}
              >
                {isSelected ? (
                  <FaCheckCircle style={{ fontSize: '14px', color: '#FFFFFF' }} />
                ) : (
                  <FaRegCircle style={{ fontSize: '13px', color: '#94A3B8' }} />
                )}
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Result Count Indicator */}
      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748B' }}>
        <span>
          Showing properties within <strong style={{ color: '#0F172A' }}>{selectedRadius ? `${selectedRadius / 1000} km` : 'all locations'}</strong> of <strong>{locationName}</strong>
        </span>
        <span style={{ fontWeight: 800, color: '#16A34A', backgroundColor: '#F0FDF4', padding: '4px 10px', borderRadius: '12px', border: '1px solid #DCFCE7' }}>
          {totalCount} Properties Found
        </span>
      </div>
    </div>
  );
};
