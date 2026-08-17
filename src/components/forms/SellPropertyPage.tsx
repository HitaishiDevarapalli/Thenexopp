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
  FaBuilding,
} from 'react-icons/fa';

interface SellPropertyPageProps {
  onBack?: () => void;
}

export const SellPropertyPage: React.FC<SellPropertyPageProps> = ({ onBack }) => {
  const [formData, setFormData] = useState({
    sellerName: '',
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
    if (!formData.sellerName.trim()) newErrors.sellerName = 'Name is required';
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
      name: formData.sellerName,
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
  const activeCities = [
    { id: 'c1', name: 'Hyderabad' },
    { id: 'c2', name: 'Vijayawada' },
    { id: 'c3', name: 'Guntur' },
    { id: 'c4', name: 'Visakhapatnam' },
  ];

  const contactMethods = ['Phone Call', 'WhatsApp', 'Email'];

  const steps = [
    { icon: <FaPaperPlane />, title: 'Submit Your Details', desc: 'Fill the contact form with your basic information' },
    { icon: <FaPhone />, title: 'NexOpp Team Calls Seller', desc: 'Our advisory team will reach out within 24 hours' },
    { icon: <FaFileAlt />, title: 'Collect Property Details & Documents', desc: 'We collect property specs, photos & ownership documents' },
    { icon: <FaShieldAlt />, title: 'Document Verification & Approval', desc: 'Rigorous document verification and listing preparation' },
    { icon: <FaHandshake />, title: 'Publish Listing', desc: 'Your property goes live on NexOpp marketplace' },
  ];

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
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
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

        {/* Contact Information Form Card (POSITIONED AT TOP) */}
        <div
          className="sell-form-card"
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.05)',
            border: '1px solid #E2E8F0',
          }}
        >
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#D1FAE5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  margin: '0 auto 20px auto',
                }}
              >
                <FaCheckCircle />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginBottom: '10px' }}>
                Sell Request Submitted!
              </h3>
              <p style={{ fontSize: '1rem', color: '#475569', maxWidth: '500px', margin: '0 auto 24px auto' }}>
                Thank you <strong>{formData.sellerName}</strong>. TheNexOpp Team will call you back within 24 hours to collect property details, verify documents, and publish your listing!
              </p>
              <button
                onClick={() => setSubmitted(false)}
                style={{
                  backgroundColor: '#1E40AF',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 28px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '28px', borderBottom: '1px solid #F1F5F9', paddingBottom: '16px' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Property Sell Contact Information
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#64748B', marginTop: '4px' }}>
                  Fill in your details below. TheNexOpp team will contact you to collect property specs & document verification.
                </p>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '24px',
                  marginBottom: '28px',
                }}
              >
                {/* Full Name */}
                <div>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#0F172A',
                      marginBottom: '8px',
                    }}
                  >
                    <FaUser style={{ color: '#1E40AF' }} /> Seller Name <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.sellerName}
                    onChange={(e) => handleChange('sellerName', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: errors.sellerName ? '2px solid #EF4444' : '1px solid #CBD5E1',
                      fontSize: '14px',
                      fontWeight: 500,
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border 0.2s',
                    }}
                  />
                  {errors.sellerName && (
                    <span style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      {errors.sellerName}
                    </span>
                  )}
                </div>

                {/* Mobile */}
                <div>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#0F172A',
                      marginBottom: '8px',
                    }}
                  >
                    <FaPhone style={{ color: '#1E40AF' }} /> Mobile Number <span style={{ color: '#EF4444' }}>*</span>
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
                      border: errors.mobile ? '2px solid #EF4444' : '1px solid #CBD5E1',
                      fontSize: '14px',
                      fontWeight: 500,
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border 0.2s',
                    }}
                  />
                  {errors.mobile && (
                    <span style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      {errors.mobile}
                    </span>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#0F172A',
                      marginBottom: '8px',
                    }}
                  >
                    <FaEnvelope style={{ color: '#1E40AF' }} /> Email Address <span style={{ color: '#94A3B8', fontWeight: 400 }}>(Optional)</span>
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
                      border: '1px solid #CBD5E1',
                      fontSize: '14px',
                      fontWeight: 500,
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border 0.2s',
                    }}
                  />
                </div>

                {/* City Selection */}
                <div>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#0F172A',
                      marginBottom: '8px',
                    }}
                  >
                    <FaMapMarkerAlt style={{ color: '#1E40AF' }} /> City / Location <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: errors.city ? '2px solid #EF4444' : '1px solid #CBD5E1',
                      fontSize: '14px',
                      fontWeight: 500,
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box',
                      transition: 'border 0.2s',
                    }}
                  >
                    <option value="">Select City</option>
                    {activeCities.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.city && (
                    <span style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      {errors.city}
                    </span>
                  )}
                </div>

                {/* Property Type Selection */}
                <div>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#0F172A',
                      marginBottom: '8px',
                    }}
                  >
                    <FaBuilding style={{ color: '#1E40AF' }} /> Property Type <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <select
                    value={formData.propertyType}
                    onChange={(e) => handleChange('propertyType', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: errors.propertyType ? '2px solid #EF4444' : '1px solid #CBD5E1',
                      fontSize: '14px',
                      fontWeight: 500,
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box',
                      transition: 'border 0.2s',
                    }}
                  >
                    <option value="">Select Property Type</option>
                    {activePropertyTypes.map((pt) => (
                      <option key={pt.id} value={pt.title}>
                        {pt.title}
                      </option>
                    ))}
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
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {contactMethods.map((method) => {
                      const isSelected = formData.preferredContactMethod === method;
                      return (
                        <button
                          key={method}
                          type="button"
                          onClick={() => {
                            handleChange('preferredContactMethod', method);
                          }}
                          style={{
                            flex: '1 1 85px',
                            minWidth: '85px',
                            padding: '10px 8px',
                            borderRadius: '12px',
                            border: isSelected ? '2px solid #1E40AF' : '1px solid #CBD5E1',
                            backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                            color: isSelected ? '#1E40AF' : '#475569',
                            fontSize: '12.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxSizing: 'border-box',
                            whiteSpace: 'nowrap',
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
          )}
        </div>

        {/* 3D Modern Flowchart — How It Works (POSITIONED BELOW CONTACT INFORMATION) */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '28px',
            padding: '44px 40px',
            marginTop: '48px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.07), 0 0 1px rgba(0,0,0,0.1)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Ambient Glow */}
          <div
            style={{
              position: 'absolute',
              top: '-40px',
              right: '-40px',
              width: '240px',
              height: '240px',
              background: 'radial-gradient(circle, rgba(30, 64, 175, 0.08) 0%, rgba(255,255,255,0) 70%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 800,
                color: '#1E40AF',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                backgroundColor: '#EFF6FF',
                padding: '6px 16px',
                borderRadius: '999px',
                display: 'inline-block',
                marginBottom: '10px',
              }}
            >
              Step-By-Step Flowchart
            </span>
            <h2
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: '#0F172A',
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              How Listing Your Property Works
            </h2>
          </div>

          {/* 3D Flowchart Container with horizontal scroll and no wrap */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'nowrap',
              gap: '24px',
              position: 'relative',
              alignItems: 'stretch',
              overflowX: 'auto',
              paddingBottom: '16px',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            {steps.map((step, idx) => (
              <div
                key={idx}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: '1 1 0%',
                  minWidth: '160px',
                  maxWidth: '240px',
                }}
              >
                {/* 3D Modern Box */}
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '20px',
                    padding: '24px 16px',
                    width: '100%',
                    textAlign: 'center',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 12px 24px -6px rgba(15, 23, 42, 0.06), 0 4px 6px -2px rgba(15, 23, 42, 0.03)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    minHeight: '260px',
                    height: '100%',
                    boxSizing: 'border-box',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 20px 30px -10px rgba(30, 64, 175, 0.18), 0 0 0 2px #1E40AF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 12px 24px -6px rgba(15, 23, 42, 0.06)';
                  }}
                >
                  {/* Step Badge */}
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#1E40AF',
                      backgroundColor: '#EFF6FF',
                      padding: '3px 10px',
                      borderRadius: '999px',
                      marginBottom: '12px',
                    }}
                  >
                    STEP 0{idx + 1}
                  </div>

                  {/* 3D Floating Icon */}
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '18px',
                      background: idx === 0 
                        ? 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)' 
                        : 'linear-gradient(135deg, #2563EB 0%, #60A5FA 100%)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      marginBottom: '16px',
                      boxShadow: '0 10px 20px -5px rgba(30, 64, 175, 0.4)',
                    }}
                  >
                    {step.icon}
                  </div>

                  {/* Title & Desc */}
                  <div>
                    <h4
                      style={{
                        fontSize: '0.95rem',
                        fontWeight: 800,
                        color: '#0F172A',
                        marginBottom: '8px',
                        lineHeight: 1.3,
                      }}
                    >
                      {step.title}
                    </h4>
                    <p
                      style={{
                        fontSize: '0.8rem',
                        color: '#64748B',
                        lineHeight: 1.5,
                        margin: 0,
                      }}
                    >
                      {step.desc}
                    </p>
                  </div>
                </div>

                {/* 3D Flowchart Connecting Arrow */}
                {idx < steps.length - 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      right: '-14px',
                      transform: 'translateY(-50%)',
                      zIndex: 10,
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: '#FFFFFF',
                      border: '2px solid #3B82F6',
                      boxShadow: '0 4px 10px rgba(37, 99, 235, 0.25)',
                      color: '#1E40AF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 900,
                    }}
                  >
                    ➔
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SellPropertyPage;
