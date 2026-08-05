import React from 'react';
import { FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaCheckCircle, FaStar, FaCrown, FaDirections } from 'react-icons/fa';
import { PropertySearchResultItem } from '../../hooks/usePropertySearch';

interface PropertyDistanceCardProps {
  property: PropertySearchResultItem;
  onViewDetails?: (id: string) => void;
}

export const PropertyDistanceCard: React.FC<PropertyDistanceCardProps> = ({
  property,
  onViewDetails,
}) => {
  const {
    id,
    title,
    image,
    priceDisplay,
    price,
    area,
    city,
    state,
    fullAddress,
    distanceText,
    bedrooms,
    bathrooms,
    areaSqFt,
    verified,
    premium,
    trending,
  } = property;

  const displayPrice = priceDisplay || (price ? `₹ ${(price / 100000).toFixed(2)} L` : 'Price on Request');

  return (
    <div
      onClick={() => onViewDetails && onViewDetails(id)}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.1)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.04)';
      }}
    >
      {/* Property Image Container */}
      <div style={{ position: 'relative', height: '200px', width: '100%', backgroundColor: '#F1F5F9', overflow: 'hidden' }}>
        <img
          src={image || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&auto=format&fit=crop&q=80'}
          alt={title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* Top Right Badges */}
        <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {verified && (
            <span style={{ backgroundColor: '#10B981', color: '#FFFFFF', fontSize: '0.72rem', fontWeight: 800, padding: '4px 10px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
              <FaCheckCircle style={{ fontSize: '11px' }} /> Verified
            </span>
          )}
          {premium && (
            <span style={{ backgroundColor: '#F59E0B', color: '#FFFFFF', fontSize: '0.72rem', fontWeight: 800, padding: '4px 10px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
              <FaCrown style={{ fontSize: '11px' }} /> Premium
            </span>
          )}
        </div>

        {/* Bottom Left Distance Badge (OLX-Style) */}
        {distanceText && (
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              backgroundColor: 'rgba(15, 23, 42, 0.88)',
              backdropFilter: 'blur(8px)',
              color: '#34D399',
              fontSize: '0.78rem',
              fontWeight: 800,
              padding: '6px 12px',
              borderRadius: '20px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
              border: '1px solid rgba(52, 211, 153, 0.4)',
            }}
          >
            <FaDirections style={{ fontSize: '12px' }} />
            <span>{distanceText}</span>
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Price Tag */}
        <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#00A86B', marginBottom: '6px' }}>
          {displayPrice}
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: '1.05rem',
            fontWeight: 800,
            color: '#0F172A',
            margin: '0 0 8px 0',
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {title}
        </h3>

        {/* Location & Address */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', color: '#64748B', fontSize: '0.82rem', marginBottom: '14px', lineHeight: 1.4 }}>
          <FaMapMarkerAlt style={{ color: '#10B981', fontSize: '14px', flexShrink: 0, marginTop: '2px' }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {area ? `${area}, ` : ''}{city || 'Guntur'} {state ? `(${state})` : ''}
          </span>
        </div>

        {/* Specs Row */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: '12px',
            borderTop: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8rem',
            color: '#475569',
            fontWeight: 700,
          }}
        >
          {bedrooms ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FaBed style={{ color: '#059669' }} /> {bedrooms} BHK
            </div>
          ) : null}

          {bathrooms ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FaBath style={{ color: '#059669' }} /> {bathrooms} Baths
            </div>
          ) : null}

          {areaSqFt ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FaRulerCombined style={{ color: '#059669' }} /> {areaSqFt}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
