import React, { useState } from 'react';
import { addSellBusinessRequest, masterCategoriesDb } from '../../db/marketplaceDb';
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaBriefcase,
  FaCommentDots,
  FaArrowLeft,
  FaCheckCircle,
  FaPaperPlane,
  FaShieldAlt,
  FaHandshake,
  FaFileAlt,
} from 'react-icons/fa';

interface SellBusinessPageProps {
  onBack?: () => void;
}

export const SellBusinessPage: React.FC<SellBusinessPageProps> = ({ onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    city: '',
    businessCategory: '',
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
    if (!formData.businessCategory) newErrors.businessCategory = 'Select a business category';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    const request = {
      id: `sbr-${Date.now()}`,
      ...formData,
      status: 'PENDING_REVIEW',
      createdAt: new Date().toISOString(),
    };

    try {
      addSellBusinessRequest(request);
      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting sell business request:', err);
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

  const activeCategories = masterCategoriesDb.filter((c) => c.is_active !== false);

  const contactMethods = ['Phone Call', 'WhatsApp', 'Email'];

  const steps = [
    { icon: <FaPaperPlane />, title: 'Submit Your Details', desc: 'Fill the contact form with your basic information' },
    { icon: <FaPhone />, title: 'NexOpp Team Contacts You', desc: 'Our team will reach out within 24 hours' },
    { icon: <FaFileAlt />, title: 'Business Details & Documents', desc: 'We collect comprehensive business information' },
    { icon: <FaShieldAlt />, title: 'Verification & Approval', desc: 'Document verification and listing preparation' },
    { icon: <FaHandshake />, title: 'Published Listing', desc: 'Your business goes live on NexOpp marketplace' },
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
              The NexOpp team will contact you shortly to discuss your business listing. We'll guide you through the entire process.
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
              ← Back to Business Marketplace
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
        paddingTop: '115px',
        paddingBottom: '60px',
        minHeight: '100vh',
        fontFamily: "'Outfit', 'Inter', -apple-system, sans-serif",
      }}
    >
      <div style={{ maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '0 24px', boxSizing: 'border-box' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '32px',
            paddingBottom: '16px',
            borderBottom: '1px solid #E2E8F0',
          }}
        >
          {onBack && (
            <button
              onClick={onBack}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '12px',
                color: '#0F172A',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                transition: 'all 0.2s',
              }}
            >
              <FaArrowLeft />
              <span>Back</span>
            </button>
          )}
          <div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
              List Your Business
            </h1>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0', fontWeight: 500 }}>
              Sell your business through NexOpp — India's trusted marketplace
            </p>
          </div>
        </div>


        {/* Contact Form */}
        <div
          className="sell-form-card"
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.06)',
            border: '1px solid #E2E8F0',
          }}
        >
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
            Contact Information
          </h2>
          <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '28px', fontWeight: 500 }}>
            Share your details below and our team will reach out to guide you through the selling process.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {/* Name */}
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
                  <FaUser style={{ color: '#1E40AF' }} /> Name <span style={{ color: '#EF4444' }}>*</span>
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
                    border: errors.name ? '2px solid #EF4444' : '1px solid #CBD5E1',
                    fontSize: '14px',
                    fontWeight: 500,
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border 0.2s',
                  }}
                />
                {errors.name && (
                  <span style={{ fontSize: '12px', color: '#EF4444', fontWeight: 600, marginTop: '4px', display: 'block' }}>
                    {errors.name}
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
                  onChange={(e) => handleChange('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
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
                  <span style={{ fontSize: '12px', color: '#EF4444', fontWeight: 600, marginTop: '4px', display: 'block' }}>
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
                  <FaEnvelope style={{ color: '#1E40AF' }} /> Email Address{' '}
                  <span style={{ color: '#94A3B8', fontWeight: 500 }}>(Optional)</span>
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
                    border: errors.email ? '2px solid #EF4444' : '1px solid #CBD5E1',
                    fontSize: '14px',
                    fontWeight: 500,
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border 0.2s',
                  }}
                />
                {errors.email && (
                  <span style={{ fontSize: '12px', color: '#EF4444', fontWeight: 600, marginTop: '4px', display: 'block' }}>
                    {errors.email}
                  </span>
                )}
              </div>

              {/* City */}
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
                  <FaMapMarkerAlt style={{ color: '#1E40AF' }} /> City / Location{' '}
                  <span style={{ color: '#EF4444' }}>*</span>
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
                    border: errors.city ? '2px solid #EF4444' : '1px solid #CBD5E1',
                    fontSize: '14px',
                    fontWeight: 500,
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border 0.2s',
                  }}
                />
                {errors.city && (
                  <span style={{ fontSize: '12px', color: '#EF4444', fontWeight: 600, marginTop: '4px', display: 'block' }}>
                    {errors.city}
                  </span>
                )}
              </div>

              {/* Business Category */}
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
                  <FaBriefcase style={{ color: '#1E40AF' }} /> Business Category{' '}
                  <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select
                  value={formData.businessCategory}
                  onChange={(e) => handleChange('businessCategory', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: errors.businessCategory ? '2px solid #EF4444' : '1px solid #CBD5E1',
                    fontSize: '14px',
                    fontWeight: 500,
                    outline: 'none',
                    boxSizing: 'border-box',
                    cursor: 'pointer',
                    backgroundColor: '#FFFFFF',
                    transition: 'border 0.2s',
                  }}
                >
                  <option value="">Select Category</option>
                  {activeCategories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.businessCategory && (
                  <span style={{ fontSize: '12px', color: '#EF4444', fontWeight: 600, marginTop: '4px', display: 'block' }}>
                    {errors.businessCategory}
                  </span>
                )}
              </div>

              {/* Preferred Contact Method */}
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
                  <FaCommentDots style={{ color: '#1E40AF' }} /> Preferred Contact Method
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
                          borderRadius: '10px',
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
            <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center' }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  background: 'linear-gradient(135deg, #1E40AF, #3B82F6)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '16px 48px',
                  fontSize: '16px',
                  fontWeight: 800,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 6px 20px rgba(30, 64, 175, 0.35)',
                  transition: 'all 0.3s',
                  opacity: isSubmitting ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <FaPaperPlane />
                {isSubmitting ? 'Submitting...' : 'Submit / Contact TheNexOpp'}
              </button>
            </div>
          </form>
        </div>

        {/* 3D Modern Flowchart — How It Works (Positioned BELOW Contact Information) */}
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
              How Listing Your Business Works
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

export default SellBusinessPage;
