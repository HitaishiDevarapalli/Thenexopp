import React, { useState } from 'react';
import { addSellPropertyRequest, masterPropertyTypesDb } from '../../db/marketplaceDb';
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaHome,
  FaCheckCircle,
  FaPaperPlane,
  FaShieldAlt,
  FaHandshake,
  FaFileAlt,
} from 'react-icons/fa';

interface SellPropertyPageProps {
  onBack?: () => void;
}

export const SellPropertyPage: React.FC<SellPropertyPageProps> = ({ onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    city: '',
    propertyType: '',
    preferredContactMethod: 'Phone Call',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile.trim())) {
      newErrors.mobile = 'Enter a valid 10-digit mobile number';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!formData.city.trim()) newErrors.city = 'City / Location is required';
    if (!formData.propertyType) newErrors.propertyType = 'Select a property type';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    const request = {
      id: `spr-${Date.now()}`,
      ...formData,
      status: 'PENDING_REVIEW',
      createdAt: new Date().toISOString(),
    };

    try {
      addSellPropertyRequest(request);
      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting sell property request:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const activePropertyTypes = masterPropertyTypesDb.filter((pt) => pt.is_active !== false);

  const contactMethods = ['Phone Call', 'WhatsApp', 'Email'];

  const steps = [
    { icon: <FaPaperPlane />, title: 'Submit Your Details', desc: 'Fill the contact form with your basic information' },
    { icon: <FaPhone />, title: 'NexOpp Team Calls Seller', desc: 'Our advisory team will reach out within 24 hours' },
    { icon: <FaFileAlt />, title: 'Collect Property Details & Documents', desc: 'We collect property specs, photos & ownership documents' },
    { icon: <FaShieldAlt />, title: 'Document Verification & Approval', desc: 'Rigorous document verification and listing preparation' },
    { icon: <FaHandshake />, title: 'Publish Listing', desc: 'Your property goes live on NexOpp marketplace' },
  ];

  if (submitted) {
    return (
      <section
        style={{
          backgroundColor: '#F8FAFC',
          paddingTop: '120px',
          paddingBottom: '80px',
          minHeight: '100vh',
          fontFamily: "'Outfit', 'Inter', -apple-system, sans-serif",
        }}
      >
        <div style={{ maxWidth: '640px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '60px 40px',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.06)',
              border: '1px solid #E2E8F0',
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #DCFCE7, #BBF7D0)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px auto',
              }}
            >
              <FaCheckCircle style={{ fontSize: '36px', color: '#16A34A' }} />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginBottom: '12px' }}>
              Thank You!
            </h2>
            <p style={{ fontSize: '1.05rem', color: '#64748B', lineHeight: 1.7, maxWidth: '420px', margin: '0 auto 32px auto' }}>
              The NexOpp property team will contact you shortly to collect property details, verify documents, and prepare your listing.
            </p>
            <button
              onClick={onBack}
              style={{
                backgroundColor: '#1E40AF',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                padding: '14px 32px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(30, 64, 175, 0.3)',
                transition: 'all 0.2s',
              }}
            >
              Back to Marketplace
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      style={{
        backgroundColor: '#F8FAFC',
        paddingTop: '100px',
        paddingBottom: '80px',
        minHeight: '100vh',
        fontFamily: "'Outfit', 'Inter', -apple-system, sans-serif",
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#EFF6FF',
              color: '#1E40AF',
              padding: '8px 20px',
              borderRadius: '9999px',
              fontSize: '13px',
              fontWeight: 700,
              marginBottom: '16px',
            }}
          >
            <FaHome style={{ fontSize: '14px' }} />
            <span>SELL YOUR PROPERTY</span>
          </div>
          <h1
            style={{
              fontSize: '2.4rem',
              fontWeight: 800,
              color: '#0F172A',
              marginBottom: '14px',
              letterSpacing: '-0.02em',
            }}
          >
            Sell Your Property With The NexOpp
          </h1>
          <p
            style={{
              fontSize: '1.1rem',
              color: '#64748B',
              maxWidth: '680px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Reach verified buyers across Hyderabad, Vijayawada, Guntur & Visakhapatnam. Complete assistance from property details collection to document verification & publishing.
          </p>
        </div>

        {/* How It Works Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            padding: '36px 40px',
            marginBottom: '40px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
          }}
        >
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#0F172A',
              marginBottom: '28px',
              textAlign: 'left',
            }}
          >
            How It Works
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '20px',
              position: 'relative',
            }}
          >
            {steps.map((step, idx) => (
              <div
                key={idx}
                style={{
                  textAlign: 'center',
                  padding: '16px 12px',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    backgroundColor: idx === 0 ? '#1E40AF' : '#2563EB',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px auto',
                    fontSize: '22px',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
                  }}
                >
                  {step.icon}
                </div>
                <h4
                  style={{
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    color: '#0F172A',
                    marginBottom: '6px',
                    lineHeight: 1.3,
                  }}
                >
                  {step.title}
                </h4>
                <p
                  style={{
                    fontSize: '0.8rem',
                    color: '#64748B',
                    lineHeight: 1.4,
                    margin: 0,
                  }}
                >
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information Form */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            padding: '40px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div style={{ marginBottom: '28px' }}>
            <h2
              style={{
                fontSize: '1.4rem',
                fontWeight: 800,
                color: '#0F172A',
                marginBottom: '6px',
              }}
            >
              Contact Information
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#64748B', margin: 0 }}>
              Share your details below and our property team will reach out to guide you through the selling process.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px',
                marginBottom: '32px',
              }}
            >
              {/* Name */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#0F172A',
                    marginBottom: '8px',
                  }}
                >
                  <FaUser style={{ color: '#1E40AF', marginRight: '6px' }} />
                  Name <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: errors.name ? '1.5px solid #EF4444' : '1px solid #CBD5E1',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
                    boxSizing: 'border-box',
                  }}
                />
                {errors.name && (
                  <span style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    {errors.name}
                  </span>
                )}
              </div>

              {/* Mobile Number */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#0F172A',
                    marginBottom: '8px',
                  }}
                >
                  <FaPhone style={{ color: '#1E40AF', marginRight: '6px' }} />
                  Mobile Number <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={formData.mobile}
                  onChange={(e) => handleChange('mobile', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: errors.mobile ? '1.5px solid #EF4444' : '1px solid #CBD5E1',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
                    boxSizing: 'border-box',
                  }}
                />
                {errors.mobile && (
                  <span style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    {errors.mobile}
                  </span>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#0F172A',
                    marginBottom: '8px',
                  }}
                >
                  <FaEnvelope style={{ color: '#1E40AF', marginRight: '6px' }} />
                  Email Address <span style={{ color: '#94A3B8', fontWeight: 500 }}>(Optional)</span>
                </label>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: errors.email ? '1.5px solid #EF4444' : '1px solid #CBD5E1',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
                    boxSizing: 'border-box',
                  }}
                />
                {errors.email && (
                  <span style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    {errors.email}
                  </span>
                )}
              </div>

              {/* City / Location */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#0F172A',
                    marginBottom: '8px',
                  }}
                >
                  <FaMapMarkerAlt style={{ color: '#1E40AF', marginRight: '6px' }} />
                  City / Location <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hyderabad, Guntur, Vijayawada"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: errors.city ? '1.5px solid #EF4444' : '1px solid #CBD5E1',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
                    boxSizing: 'border-box',
                  }}
                />
                {errors.city && (
                  <span style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    {errors.city}
                  </span>
                )}
              </div>

              {/* Property Type Dropdown */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#0F172A',
                    marginBottom: '8px',
                  }}
                >
                  <FaHome style={{ color: '#1E40AF', marginRight: '6px' }} />
                  Property Type <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select
                  value={formData.propertyType}
                  onChange={(e) => handleChange('propertyType', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: errors.propertyType ? '1.5px solid #EF4444' : '1px solid #CBD5E1',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
                    boxSizing: 'border-box',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">Select Property Type</option>
                  {activePropertyTypes.length > 0 ? (
                    activePropertyTypes.map((pt) => (
                      <option key={pt.id} value={pt.name}>
                        {pt.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Residential Apartment">Residential Apartment</option>
                      <option value="Luxury Villa">Luxury Villa</option>
                      <option value="Independent House">Independent House</option>
                      <option value="Residential Land / Plot">Residential Land / Plot</option>
                      <option value="Commercial Property">Commercial Property</option>
                    </>
                  )}
                </select>
                {errors.propertyType && (
                  <span style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    {errors.propertyType}
                  </span>
                )}
              </div>

              {/* Preferred Contact Method */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#0F172A',
                    marginBottom: '8px',
                  }}
                >
                  Preferred Contact Method
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {contactMethods.map((method) => {
                    const isSelected = formData.preferredContactMethod === method;
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => {
                          handleChange('preferredContactMethod', method);
                          if (method === 'WhatsApp') {
                            const msg = encodeURIComponent(`Hello TheNexOpp Team, I am interested in listing/selling my property.`);
                            window.open(`https://wa.me/919989087654?text=${msg}`, '_blank');
                          } else if (method === 'Email') {
                            window.location.href = `mailto:contact@thenexopp.com?subject=${encodeURIComponent('Sell Property Enquiry - TheNexOpp')}`;
                          } else if (method === 'Phone Call') {
                            window.location.href = `tel:+919989087654`;
                          }
                        }}
                        style={{
                          flex: 1,
                          padding: '12px 8px',
                          borderRadius: '12px',
                          border: isSelected ? '2px solid #1E40AF' : '1px solid #CBD5E1',
                          backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                          color: isSelected ? '#1E40AF' : '#475569',
                          fontWeight: isSelected ? 700 : 500,
                          fontSize: '13px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        {method}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ textAlign: 'center' }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  backgroundColor: '#1E40AF',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '16px 48px',
                  fontSize: '16px',
                  fontWeight: 800,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 16px rgba(30, 64, 175, 0.3)',
                  transition: 'all 0.2s',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <FaPaperPlane />
                <span>{isSubmitting ? 'Submitting...' : 'Submit / Contact TheNexOpp'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default SellPropertyPage;
