import React, { useState } from 'react';
import { FaHome, FaSearch, FaBuilding, FaStore, FaHandshake, FaArrowLeft } from 'react-icons/fa';

interface NotFoundPageProps {
  onNavigate: (page: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onNavigate('propertiesPage');
    }
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      backgroundColor: '#F8FAFC',
      fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif"
    }}>
      <div style={{
        maxWidth: '680px',
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        padding: 'clamp(28px, 6vw, 48px)',
        boxShadow: '0 20px 40px rgba(15, 23, 42, 0.06)',
        border: '1px solid #E2E8F0',
        textAlign: 'center'
      }}>
        {/* Visual Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '88px',
          height: '88px',
          borderRadius: '50%',
          backgroundColor: '#ECFDF5',
          border: '3px solid #A7F3D0',
          color: '#059669',
          fontSize: '2.5rem',
          fontWeight: 900,
          marginBottom: '20px'
        }}>
          404
        </div>

        <h1 style={{
          fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
          fontWeight: 800,
          color: '#0F172A',
          letterSpacing: '-0.02em',
          margin: '0 0 12px 0'
        }}>
          Page Not Found
        </h1>

        <p style={{
          fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
          color: '#64748B',
          lineHeight: 1.6,
          margin: '0 0 28px 0',
          maxWidth: '520px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          The listing or page you requested could not be located or may have been updated. Search verified listings or use the quick links below.
        </p>

        {/* Search Recovery Form */}
        <form onSubmit={handleSearch} style={{
          display: 'flex',
          gap: '8px',
          maxWidth: '480px',
          margin: '0 auto 32px auto',
          position: 'relative'
        }}>
          <input
            type="text"
            placeholder="Search properties, franchises, or businesses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              padding: '14px 18px',
              borderRadius: '12px',
              border: '1.5px solid #CBD5E1',
              fontSize: '0.98rem',
              outline: 'none',
              transition: 'border-color 0.2s',
              backgroundColor: '#F8FAFC'
            }}
          />
          <button
            type="submit"
            style={{
              padding: '14px 22px',
              backgroundColor: '#059669',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)'
            }}
          >
            <FaSearch />
            <span style={{ display: 'inline' }}>Search</span>
          </button>
        </form>

        {/* Quick Navigation Chips */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          justifyContent: 'center',
          marginBottom: '32px'
        }}>
          <button
            onClick={() => onNavigate('propertiesPage')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '100px',
              backgroundColor: '#F1F5F9',
              color: '#334155',
              border: '1px solid #CBD5E1',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <FaBuilding style={{ color: '#059669' }} />
            Properties
          </button>

          <button
            onClick={() => onNavigate('franchisePage')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '100px',
              backgroundColor: '#F1F5F9',
              color: '#334155',
              border: '1px solid #CBD5E1',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <FaStore style={{ color: '#D97706' }} />
            Franchises
          </button>

          <button
            onClick={() => onNavigate('businessPage')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '100px',
              backgroundColor: '#F1F5F9',
              color: '#334155',
              border: '1px solid #CBD5E1',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <FaHandshake style={{ color: '#002B66' }} />
            Businesses
          </button>
        </div>

        {/* Primary Action Button */}
        <div>
          <button
            onClick={() => onNavigate('home')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#002B66',
              color: '#FFFFFF',
              border: 'none',
              padding: '14px 28px',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0, 43, 102, 0.25)',
              transition: 'transform 0.2s'
            }}
          >
            <FaHome />
            Return to Homepage
          </button>
        </div>
      </div>
    </div>
  );
};
