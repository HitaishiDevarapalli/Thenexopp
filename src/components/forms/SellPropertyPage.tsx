import React, { useState, useRef } from 'react';
import { addSellPropertyRequest } from '../../db/marketplaceDb';
import type { SellPropertyPhoto } from '../../db/marketplaceDb';
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaBuilding,
  FaRupeeSign,
  FaCheckCircle,
  FaPaperPlane,
  FaUpload,
  FaTrash,
  FaImage,
  FaStar,
  FaInfoCircle,
  FaShieldAlt,
  FaArrowLeft,
  FaAlignLeft
} from 'react-icons/fa';

interface SellPropertyPageProps {
  onBack?: () => void;
}

const ACTIVE_CITIES = [
  'Hyderabad',
  'Vijayawada',
  'Guntur',
  'Visakhapatnam',
  'Tirupati',
  'Rajahmundry',
  'Warangal',
  'Kakinada',
  'Nellore',
  'Kurnool',
];

export const SellPropertyPage: React.FC<SellPropertyPageProps> = ({ onBack }) => {
  // ── Form State ────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    // Seller Info
    sellerName: '',
    mobile: '',
    email: '',
    sellerType: 'Owner', // Owner | Broker / Agent | Builder / Developer
    preferredContactMethod: 'Phone Call', // Phone Call | WhatsApp | Email
    bestTimeToContact: 'Anytime',

    // Property Basic Info
    title: '',
    propertyPurpose: 'Sale', // Sale | Rent | Lease
    propertyType: 'Apartment / Flat',
    expectedPrice: '',
    isPriceNegotiable: false,

    // Location
    city: 'Hyderabad',
    customCity: '',
    locality: '',
    address: '',
    pincode: '',

    // Description
    description: '',
  });

  // ── Photos State (Mandatory Min 6) ────────────────────────────────────────
  const [uploadedPhotos, setUploadedPhotos] = useState<SellPropertyPhoto[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Form Validation & Submission ──────────────────────────────────────────
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submittedRefId, setSubmittedRefId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Format Price in Indian Currency Words (Lakhs / Crores)
  const formatIndianPrice = (val: string | number) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num) || num <= 0) return '';
    if (num >= 10000000) {
      const cr = num / 10000000;
      return `₹ ${cr.toFixed(2)} Crore`;
    }
    if (num >= 100000) {
      const lk = num / 100000;
      return `₹ ${lk.toFixed(2)} Lakh`;
    }
    return `₹ ${num.toLocaleString('en-IN')}`;
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  // ── Lossless Photo Upload Handler ─────────────────────────────────────────
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingPhoto(true);
    setUploadProgressText(`Uploading ${files.length} photo(s) in original lossless clarity...`);

    const newUploaded: SellPropertyPhoto[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const base64 = await readFileAsBase64(file);
        const res = await fetch('/api/upload-lead-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileData: base64,
            mimeType: file.type,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          newUploaded.push({
            url: data.url,
            fullUrl: data.fullUrl || data.url,
            name: file.name,
            originalName: file.name,
            size: file.size,
            mimeType: file.type,
          });
        } else {
          newUploaded.push({
            url: base64,
            name: file.name,
            originalName: file.name,
            size: file.size,
            mimeType: file.type,
          });
        }
      } catch (err) {
        console.error('Error uploading photo:', err);
      }
    }

    setUploadedPhotos((prev) => [...prev, ...newUploaded]);
    setIsUploadingPhoto(false);
    setUploadProgressText('');

    if (errors.photos) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.photos;
        return copy;
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos((prev) => prev.filter((_, idx) => idx !== index));
  };

  const setPrimaryPhoto = (index: number) => {
    setUploadedPhotos((prev) => {
      const target = prev[index];
      const rest = prev.filter((_, idx) => idx !== index);
      return [target, ...rest];
    });
  };

  // ── Form Validation ───────────────────────────────────────────────────────
  const validate = () => {
    const newErrors: Record<string, string> = {};

    // Seller Info
    if (!formData.sellerName.trim()) newErrors.sellerName = 'Seller name is required';
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile.trim().replace(/\D/g, ''))) {
      newErrors.mobile = 'Enter a valid 10-digit mobile number';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Enter a valid email address';
    }

    // Property Overview
    if (!formData.title.trim()) newErrors.title = 'Property title / headline is required';
    if (!formData.expectedPrice || parseFloat(formData.expectedPrice) <= 0) {
      newErrors.expectedPrice = 'Expected price is required';
    }

    // Location
    const activeCity = formData.city === 'Other' ? formData.customCity : formData.city;
    if (!activeCity.trim()) newErrors.city = 'City / Location is required';
    if (!formData.locality.trim()) newErrors.locality = 'Locality / Area is required';

    // Mandatory Photos (MINIMUM 6 PHOTOS)
    if (uploadedPhotos.length < 6) {
      newErrors.photos = `Minimum 6 property photos are required (Currently uploaded: ${uploadedPhotos.length}/6). Please add at least ${6 - uploadedPhotos.length} more photo(s).`;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstError = document.querySelector('.form-error-anchor');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return Object.keys(newErrors).length === 0;
  };

  // ── Submit Form ───────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const leadId = 'lead-' + Date.now();
    const selectedCity = formData.city === 'Other' ? formData.customCity : formData.city;
    const priceNum = parseFloat(formData.expectedPrice) || 0;
    const priceDisplay = formatIndianPrice(formData.expectedPrice);

    const requestPayload = {
      id: leadId,
      name: formData.sellerName.trim(),
      sellerName: formData.sellerName.trim(),
      mobile: formData.mobile.trim(),
      email: formData.email.trim(),
      sellerType: formData.sellerType,
      preferredContactMethod: formData.preferredContactMethod,
      bestTimeToContact: formData.bestTimeToContact,

      title: formData.title.trim(),
      propertyPurpose: formData.propertyPurpose,
      propertyType: formData.propertyType,
      expectedPrice: priceNum,
      priceDisplay: priceDisplay,
      isPriceNegotiable: formData.isPriceNegotiable,

      city: selectedCity,
      locality: formData.locality.trim(),
      address: formData.address.trim(),
      pincode: formData.pincode.trim(),

      description: formData.description.trim(),

      photos: uploadedPhotos.map((p, idx) => ({
        url: p.url,
        fullUrl: p.fullUrl || p.url,
        name: p.name || p.originalName || `photo_${idx + 1}.jpg`,
        originalName: p.originalName || p.name,
        size: p.size,
        mimeType: p.mimeType,
        isCover: idx === 0,
      })),
      primaryPhoto: uploadedPhotos[0]?.url || '',

      status: 'PENDING_REVIEW',
      adminNotes: '',
    };

    try {
      addSellPropertyRequest(requestPayload as any);
      setSubmittedRefId(leadId.substring(0, 10).toUpperCase());
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success State Screen ──────────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={{ minHeight: '80vh', backgroundColor: '#F8FAFC', padding: '60px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            maxWidth: '640px',
            width: '100%',
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            padding: '48px 36px',
            boxShadow: '0 20px 40px -15px rgba(0, 43, 102, 0.08)',
            border: '1px solid #E2E8F0',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '76px',
              height: '76px',
              borderRadius: '50%',
              backgroundColor: '#ECFDF5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
              margin: '0 auto 20px auto',
              border: '2px solid #A7F3D0',
            }}
          >
            <FaCheckCircle />
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', margin: '0 0 10px 0', letterSpacing: '-0.02em' }}>
            Property Posted Successfully!
          </h2>

          <p style={{ color: '#475569', fontSize: '0.98rem', lineHeight: '1.6', margin: '0 0 24px 0' }}>
            Thank you, <strong>{formData.sellerName}</strong>. Your property posting for <strong>"{formData.title}"</strong> has been received by our verified executive team along with your {uploadedPhotos.length} high-resolution photos.
          </p>

          <div style={{ backgroundColor: '#F1F5F9', padding: '16px', borderRadius: '12px', marginBottom: '28px', display: 'inline-block' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Reference Lead ID
            </span>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', fontFamily: 'monospace', marginTop: '4px' }}>
              #{submittedRefId}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '360px', margin: '0 auto' }}>
            <button
              onClick={() => {
                setSubmitted(false);
                setUploadedPhotos([]);
                setFormData({
                  sellerName: '',
                  mobile: '',
                  email: '',
                  sellerType: 'Owner',
                  preferredContactMethod: 'Phone Call',
                  bestTimeToContact: 'Anytime',
                  title: '',
                  propertyPurpose: 'Sale',
                  propertyType: 'Apartment / Flat',
                  expectedPrice: '',
                  isPriceNegotiable: false,
                  city: 'Hyderabad',
                  customCity: '',
                  locality: '',
                  address: '',
                  pincode: '',
                  description: '',
                });
              }}
              style={{
                padding: '13px 24px',
                backgroundColor: '#059669',
                color: '#FFFFFF',
                borderRadius: '12px',
                border: 'none',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Post Another Property
            </button>

            {onBack && (
              <button
                onClick={onBack}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'transparent',
                  color: '#475569',
                  borderRadius: '12px',
                  border: '1px solid #CBD5E1',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Return to Properties
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Main Post Property Form Screen ────────────────────────────────────────
  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', padding: '40px 16px 80px 16px', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>
      <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
        
        {/* Top Header & Breadcrumbs */}
        <div style={{ marginBottom: '28px' }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                color: '#475569',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                marginBottom: '16px',
                transition: 'all 0.2s',
              }}
            >
              <FaArrowLeft /> Back to Marketplace
            </button>
          )}

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', backgroundColor: '#ECFDF5', color: '#059669', fontSize: '13px', fontWeight: 700, marginBottom: '10px' }}>
            <FaBuilding /> Verified Marketplace Submission
          </div>

          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Post Your Property for Sale, Rent or Lease
          </h1>
          <p style={{ fontSize: '1rem', color: '#64748B', margin: 0, maxWidth: '780px', lineHeight: 1.5 }}>
            Reach thousands of active buyers and investors across Andhra Pradesh and Telangana. Upload property details and 100% original uncompressed photos to connect with verified buyers.
          </p>
        </div>

        {/* ── MAIN CARD CONTAINER ─────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} noValidate>
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
              padding: '36px',
            }}
          >
            
            {/* ── SECTION 1: SELLER CONTACT INFO ──────────────────────────── */}
            <div style={{ marginBottom: '36px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', borderBottom: '2px solid #F1F5F9', paddingBottom: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EFF6FF', color: '#1E40AF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px' }}>
                  1
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Seller &amp; Contact Information
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '2px 0 0 0' }}>
                    How potential buyers and our advisory team will contact you
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                {/* Full Name */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                    <FaUser style={{ color: '#1E40AF' }} /> Full Name <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.sellerName}
                    onChange={(e) => handleChange('sellerName', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: errors.sellerName ? '2px solid #EF4444' : '1px solid #CBD5E1',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  {errors.sellerName && <span style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.sellerName}</span>}
                </div>

                {/* Mobile Number */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                    <FaPhone style={{ color: '#1E40AF' }} /> Mobile Number <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    value={formData.mobile}
                    onChange={(e) => handleChange('mobile', e.target.value.replace(/\D/g, ''))}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: errors.mobile ? '2px solid #EF4444' : '1px solid #CBD5E1',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  {errors.mobile && <span style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.mobile}</span>}
                </div>

                {/* Email */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                    <FaEnvelope style={{ color: '#1E40AF' }} /> Email Address <span style={{ color: '#94A3B8', fontWeight: 400 }}>(Optional)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: errors.email ? '2px solid #EF4444' : '1px solid #CBD5E1',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  {errors.email && <span style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.email}</span>}
                </div>

                {/* Seller Type */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                    You are <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <select
                    value={formData.sellerType}
                    onChange={(e) => handleChange('sellerType', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '14px',
                      backgroundColor: '#FFFFFF',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="Owner">Property Owner</option>
                    <option value="Broker / Agent">Real Estate Broker / Agent</option>
                    <option value="Builder / Developer">Builder / Developer</option>
                  </select>
                </div>

                {/* Preferred Contact Method */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                    Preferred Contact Method
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['Phone Call', 'WhatsApp', 'Email'].map((method) => {
                      const isSel = formData.preferredContactMethod === method;
                      return (
                        <button
                          key={method}
                          type="button"
                          onClick={() => handleChange('preferredContactMethod', method)}
                          style={{
                            flex: 1,
                            padding: '10px 6px',
                            borderRadius: '8px',
                            border: isSel ? '2px solid #1E40AF' : '1px solid #CBD5E1',
                            backgroundColor: isSel ? '#EFF6FF' : '#FFFFFF',
                            color: isSel ? '#1E40AF' : '#475569',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {method}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Best Time to Call */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                    Best Time to Call
                  </label>
                  <select
                    value={formData.bestTimeToContact}
                    onChange={(e) => handleChange('bestTimeToContact', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '14px',
                      backgroundColor: '#FFFFFF',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="Anytime">Anytime</option>
                    <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                    <option value="Afternoon (12 PM - 5 PM)">Afternoon (12 PM - 5 PM)</option>
                    <option value="Evening (5 PM - 9 PM)">Evening (5 PM - 9 PM)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ── SECTION 2: PROPERTY OVERVIEW & PRICING ──────────────────── */}
            <div style={{ marginBottom: '36px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', borderBottom: '2px solid #F1F5F9', paddingBottom: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EFF6FF', color: '#1E40AF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px' }}>
                  2
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Property Title, Category &amp; Pricing
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '2px 0 0 0' }}>
                    Provide a headline and price expectation for buyers
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                {/* Property Title */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                    Property Headline / Title <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 500 Sq.Yds Commercial Land near Highway / Luxury 3 BHK Flat in Madhapur"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: errors.title ? '2px solid #EF4444' : '1px solid #CBD5E1',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  {errors.title && <span style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.title}</span>}
                </div>

                {/* Purpose */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                    Listing Purpose <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {['Sale', 'Rent', 'Lease'].map((purp) => {
                      const isSel = formData.propertyPurpose === purp;
                      return (
                        <button
                          key={purp}
                          type="button"
                          onClick={() => handleChange('propertyPurpose', purp)}
                          style={{
                            flex: 1,
                            padding: '11px 12px',
                            borderRadius: '10px',
                            border: isSel ? '2px solid #1E40AF' : '1px solid #CBD5E1',
                            backgroundColor: isSel ? '#EFF6FF' : '#FFFFFF',
                            color: isSel ? '#1E40AF' : '#475569',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          For {purp}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Property Type */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                    <FaBuilding style={{ color: '#1E40AF' }} /> Property Category <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <select
                    value={formData.propertyType}
                    onChange={(e) => handleChange('propertyType', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '14px',
                      backgroundColor: '#FFFFFF',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="Apartment / Flat">Apartment / Flat</option>
                    <option value="Independent House / Villa">Independent House / Villa</option>
                    <option value="Gated Community Villa">Gated Community Villa</option>
                    <option value="Penthouse / Duplex">Penthouse / Duplex</option>
                    <option value="Builder Floor">Builder Floor</option>
                    <option value="Residential Plot / Land">Residential Plot / Land</option>
                    <option value="Agricultural / Farm Land">Agricultural / Farm Land</option>
                    <option value="Commercial Land / Building">Commercial Land / Building</option>
                    <option value="Commercial Office / Shop">Commercial Office / Shop</option>
                    <option value="Industrial / Warehouse">Industrial / Warehouse</option>
                  </select>
                </div>

                {/* Expected Price */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                    <FaRupeeSign style={{ color: '#1E40AF' }} /> Expected Price (in ₹) <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      placeholder="e.g. 7500000 (for ₹75 Lakh)"
                      value={formData.expectedPrice}
                      onChange={(e) => handleChange('expectedPrice', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: errors.expectedPrice ? '2px solid #EF4444' : '1px solid #CBD5E1',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  {formData.expectedPrice && (
                    <span style={{ color: '#059669', fontSize: '12.5px', fontWeight: 700, marginTop: '4px', display: 'block' }}>
                      Formatted: {formatIndianPrice(formData.expectedPrice)}
                    </span>
                  )}
                  {errors.expectedPrice && <span style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.expectedPrice}</span>}
                </div>
              </div>

              {/* Price Negotiable Checkbox */}
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.isPriceNegotiable}
                  onChange={(e) => handleChange('isPriceNegotiable', e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <span>Price is negotiable for serious buyers</span>
              </label>
            </div>

            {/* ── SECTION 3: LOCATION DETAILS ─────────────────────────────── */}
            <div style={{ marginBottom: '36px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', borderBottom: '2px solid #F1F5F9', paddingBottom: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EFF6FF', color: '#1E40AF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px' }}>
                  3
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Location &amp; Address Details
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '2px 0 0 0' }}>
                    Where is this property located?
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                {/* City */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                    <FaMapMarkerAlt style={{ color: '#1E40AF' }} /> City / Region <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: errors.city ? '2px solid #EF4444' : '1px solid #CBD5E1',
                      fontSize: '14px',
                      backgroundColor: '#FFFFFF',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  >
                    {ACTIVE_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="Other">Other City...</option>
                  </select>
                  {errors.city && <span style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.city}</span>}
                </div>

                {formData.city === 'Other' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                      Specify City Name <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter city name"
                      value={formData.customCity}
                      onChange={(e) => handleChange('customCity', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: '1px solid #CBD5E1',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                )}

                {/* Specific Locality */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                    Locality / Area / Colony <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Madhapur, Benz Circle, Lakshmipuram"
                    value={formData.locality}
                    onChange={(e) => handleChange('locality', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: errors.locality ? '2px solid #EF4444' : '1px solid #CBD5E1',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  {errors.locality && <span style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.locality}</span>}
                </div>

                {/* Landmark / Address */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                    Specific Landmark / Project Name <span style={{ color: '#94A3B8', fontWeight: 400 }}>(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Near Metro Station / Aparna Heights"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Pincode */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                    Pincode <span style={{ color: '#94A3B8', fontWeight: 400 }}>(Optional)</span>
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="e.g. 500081"
                    value={formData.pincode}
                    onChange={(e) => handleChange('pincode', e.target.value.replace(/\D/g, ''))}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* ── SECTION 4: PROPERTY DESCRIPTION & DETAILS ───────────────── */}
            <div style={{ marginBottom: '36px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', borderBottom: '2px solid #F1F5F9', paddingBottom: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EFF6FF', color: '#1E40AF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px' }}>
                  4
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Property Description &amp; Details
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '2px 0 0 0' }}>
                    Share property dimensions, features, road access, and key highlights
                  </p>
                </div>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                  <FaAlignLeft style={{ color: '#1E40AF' }} /> Property Details / Highlights <span style={{ color: '#94A3B8', fontWeight: 400 }}>(Optional)</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe your property details such as area/size, facing direction, floor, boundary wall, road width, surrounding landmarks, or key highlights for buyers..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
            </div>

            {/* ── SECTION 5: MANDATORY PROPERTY PHOTOS (MIN 6) ───────────── */}
            <div style={{ marginBottom: '36px' }} className="form-error-anchor">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', borderBottom: '2px solid #F1F5F9', paddingBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EFF6FF', color: '#1E40AF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px' }}>
                    5
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      Property Photos <span style={{ color: '#EF4444' }}>* (Minimum 6 Mandatory)</span>
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '2px 0 0 0' }}>
                      100% original lossless clarity guaranteed. No compression or downscaling.
                    </p>
                  </div>
                </div>

                {/* Live Counter Badge */}
                <div
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    backgroundColor: uploadedPhotos.length >= 6 ? '#ECFDF5' : '#FEF2F2',
                    color: uploadedPhotos.length >= 6 ? '#059669' : '#DC2626',
                    border: `1px solid ${uploadedPhotos.length >= 6 ? '#A7F3D0' : '#FECACA'}`,
                    fontSize: '13px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <FaImage />
                  <span>
                    {uploadedPhotos.length} / 6 Photos Uploaded {uploadedPhotos.length >= 6 ? '✓' : ''}
                  </span>
                </div>
              </div>

              {/* Upload Drop Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: errors.photos ? '2px dashed #EF4444' : '2px dashed #CBD5E1',
                  borderRadius: '16px',
                  backgroundColor: '#F8FAFC',
                  padding: '36px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  marginBottom: '20px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#1E40AF')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = errors.photos ? '#EF4444' : '#CBD5E1')}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/png, image/jpeg, image/webp, image/jpg"
                  onChange={handlePhotoUpload}
                  style={{ display: 'none' }}
                />

                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    backgroundColor: '#EFF6FF',
                    color: '#1E40AF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                    margin: '0 auto 14px auto',
                  }}
                >
                  <FaUpload />
                </div>

                <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
                  Click to select photos from your device
                </h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                  Upload at least <strong>6 photos</strong> of your property (Entrance, Surroundings, Views, Details).
                </p>
                <div style={{ marginTop: '10px', fontSize: '12px', color: '#059669', fontWeight: 700 }}>
                  ✓ Exact original pixel dimensions &amp; uncompressed clarity preserved
                </div>
              </div>

              {isUploadingPhoto && (
                <div style={{ padding: '12px', backgroundColor: '#EFF6FF', borderRadius: '10px', color: '#1E40AF', fontSize: '13px', fontWeight: 700, textAlign: 'center', marginBottom: '16px' }}>
                  {uploadProgressText}
                </div>
              )}

              {errors.photos && (
                <div style={{ padding: '12px 16px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', color: '#DC2626', fontSize: '13px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaInfoCircle /> {errors.photos}
                </div>
              )}

              {/* Photos Preview Grid */}
              {uploadedPhotos.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '14px' }}>
                  {uploadedPhotos.map((photo, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: 'relative',
                        aspectRatio: '4/3',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: idx === 0 ? '2px solid #059669' : '1px solid #CBD5E1',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        backgroundColor: '#0F172A',
                      }}
                    >
                      <img
                        src={photo.url}
                        alt={`Upload ${idx + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />

                      {/* Cover Badge */}
                      {idx === 0 ? (
                        <span
                          style={{
                            position: 'absolute',
                            top: '6px',
                            left: '6px',
                            backgroundColor: '#059669',
                            color: '#FFFFFF',
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '3px 6px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <FaStar /> Cover
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setPrimaryPhoto(idx)}
                          style={{
                            position: 'absolute',
                            top: '6px',
                            left: '6px',
                            backgroundColor: 'rgba(15, 23, 42, 0.7)',
                            color: '#FFFFFF',
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          Set as Cover
                        </button>
                      )}

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        style={{
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          backgroundColor: 'rgba(220, 38, 38, 0.85)',
                          color: '#FFFFFF',
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          cursor: 'pointer',
                        }}
                      >
                        <FaTrash />
                      </button>

                      {/* File Number */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '6px',
                          right: '6px',
                          backgroundColor: 'rgba(0,0,0,0.6)',
                          color: '#FFFFFF',
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        #{idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── SUBMIT BUTTON & TRUST BADGES ────────────────────────────── */}
            <div style={{ borderTop: '2px solid #F1F5F9', paddingTop: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '13px' }}>
                  <FaShieldAlt style={{ color: '#059669', fontSize: '16px' }} />
                  <span>Your contact details are protected under our privacy policy.</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '16px 36px',
                    borderRadius: '12px',
                    backgroundColor: '#059669',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '16px',
                    fontWeight: 800,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: '0 8px 20px rgba(5, 150, 105, 0.3)',
                    transition: 'all 0.2s',
                  }}
                >
                  <FaPaperPlane />
                  <span>{isSubmitting ? 'Submitting Property...' : 'Submit Property Listing'}</span>
                </button>
              </div>

            </div>

          </div>
        </form>

        {/* ── 3-STEP PROCESS FLOWCHART ────────────────────────────────────── */}
        <div style={{ marginTop: '48px', backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '32px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', textAlign: 'center', margin: '0 0 24px 0' }}>
            How Posting Your Property Works
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
            <div style={{ textAlign: 'center', padding: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#EFF6FF', color: '#1E40AF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 800, margin: '0 auto 12px auto' }}>
                1
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>Fill Details &amp; 6+ Photos</h4>
              <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                Enter property pricing, address, description, and upload minimum 6 uncompressed photos.
              </p>
            </div>

            <div style={{ textAlign: 'center', padding: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 800, margin: '0 auto 12px auto' }}>
                2
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>Admin Verification</h4>
              <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                Our operations team verifies your property details, checks title clarity and reaches out.
              </p>
            </div>

            <div style={{ textAlign: 'center', padding: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#FAF5FF', color: '#9333EA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 800, margin: '0 auto 12px auto' }}>
                3
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>Connect with Direct Buyers</h4>
              <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                Receive genuine inquiries from serious buyers and investors without spam.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
