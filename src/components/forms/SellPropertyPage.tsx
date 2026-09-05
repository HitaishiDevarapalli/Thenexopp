import React, { useState, useRef } from 'react';
import { addSellPropertyRequest } from '../../db/marketplaceDb';
import type { SellPropertyPhoto } from '../../db/marketplaceDb';
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
  FaBuilding,
  FaCamera,
  FaTrash,
  FaRupeeSign,
  FaBed,
  FaBath,
  FaCompass,
  FaCouch,
  FaCalendarAlt,
  FaLayerGroup,
  FaCheck,
  FaInfoCircle,
  FaUpload,
  FaStar,
} from 'react-icons/fa';

interface SellPropertyPageProps {
  onBack?: () => void;
}

const POPULAR_AMENITIES = [
  'Covered Car Parking',
  '24/7 Security & CCTV',
  'Power Backup',
  'High-Speed Elevators',
  'Clubhouse & Gym',
  'Swimming Pool',
  'Children Play Area',
  'Gated Community',
  '100% Vastu Compliant',
  'Rainwater Harvesting',
  'Landscaped Gardens',
  'Intercom Facility',
];

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

    // Specifications
    bedrooms: '3 BHK',
    bathrooms: '3',
    balconies: '2',
    areaSqFt: '',
    carpetArea: '',
    facing: 'East',
    furnishing: 'Semi-Furnished',
    propertyAge: 'Ready to Move',
    floorNumber: '',
    totalFloors: '',
    parkingSlots: '1',
    description: '',
  });

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'Covered Car Parking',
    '24/7 Security & CCTV',
    'Power Backup',
  ]);

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
  const formatIndianPrice = (numStr: string) => {
    const val = parseFloat(numStr.replace(/,/g, ''));
    if (isNaN(val) || val <= 0) return '';
    if (val >= 10000000) {
      const cr = (val / 10000000).toFixed(2);
      return '₹ ' + cr + ' Crore';
    }
    if (val >= 100000) {
      const lk = (val / 100000).toFixed(2);
      return '₹ ' + lk + ' Lakh';
    }
    return '₹ ' + val.toLocaleString('en-IN');
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

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  // ── Handle Lossless High-Res Photo Upload ─────────────────────────────────
  const handlePhotoFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingPhoto(true);
    setUploadProgressText('Uploading ' + files.length + ' photo(s) in original quality...');

    const newUploaded: SellPropertyPhoto[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgressText('Uploading image ' + (i + 1) + ' of ' + files.length + ': ' + file.name + '...');

      try {
        const base64 = await readFileAsBase64(file);

        // Upload to uncompressed lossless endpoint
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
            originalName: file.name,
            size: file.size,
            mimeType: file.type,
          });
        } else {
          newUploaded.push({
            url: base64,
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

    // Specifications
    if (!formData.areaSqFt.trim() || parseFloat(formData.areaSqFt) <= 0) {
      newErrors.areaSqFt = 'Total Area (Sq.Ft / Sq.Yards) is required';
    }

    // Mandatory Photos (MINIMUM 6 PHOTOS)
    if (uploadedPhotos.length < 6) {
      newErrors.photos = 'Minimum 6 property photos are required (Currently uploaded: ' + uploadedPhotos.length + '/6). Please add at least ' + (6 - uploadedPhotos.length) + ' more photo(s).';
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

      bedrooms: formData.bedrooms,
      bathrooms: formData.bathrooms,
      balconies: formData.balconies,
      areaSqFt: formData.areaSqFt.trim(),
      carpetArea: formData.carpetArea.trim(),
      facing: formData.facing,
      furnishing: formData.furnishing,
      propertyAge: formData.propertyAge,
      floorNumber: formData.floorNumber.trim(),
      totalFloors: formData.totalFloors.trim(),
      parkingSlots: formData.parkingSlots,
      amenities: selectedAmenities,
      description: formData.description.trim(),

      photos: uploadedPhotos,
      primaryPhoto: uploadedPhotos[0]?.url || '',

      status: 'PENDING_REVIEW',
      adminNotes: '',
      createdAt: new Date().toISOString(),
    };

    try {
      addSellPropertyRequest(requestPayload);
      setSubmittedRefId(leadId);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error submitting post property request:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { icon: <FaPaperPlane />, title: 'Post Property Details', desc: 'Submit property specs & minimum 6 high-res photos' },
    { icon: <FaPhone />, title: 'NexOpp Advisor Verification', desc: 'Our team verifies documents & confirms listing details' },
    { icon: <FaShieldAlt />, title: 'High-Clarity Media Check', desc: 'Full-resolution photos inspected and verified' },
    { icon: <FaHandshake />, title: 'Publish & Connect with Buyers', desc: 'Listing goes live to thousands of verified buyers' },
  ];

  return (
    <section
      style={{
        backgroundColor: '#F8FAFC',
        paddingTop: '100px',
        paddingBottom: '80px',
        minHeight: '100vh',
        fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#EFF6FF',
              color: '#1E40AF',
              padding: '6px 18px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '0.04em',
              marginBottom: '14px',
            }}
          >
            <FaHome style={{ fontSize: '13px' }} />
            <span>POST YOUR PROPERTY</span>
          </div>
          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              color: '#0F172A',
              marginBottom: '12px',
              letterSpacing: '-0.02em',
            }}
          >
            Post Your Property With The NexOpp
          </h1>
          <p
            style={{
              fontSize: '1.05rem',
              color: '#64748B',
              maxWidth: '720px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Reach verified buyers and high-intent investors across Hyderabad, Vijayawada, Guntur & Visakhapatnam. Complete assistance from property details collection to document verification & publishing.
          </p>
        </div>

        {/* ================= SUBMITTED SUCCESS CARD ================= */}
        {submitted ? (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.07)',
              border: '1px solid #E2E8F0',
              padding: '48px 32px',
              textAlign: 'center',
              maxWidth: '760px',
              margin: '0 auto',
            }}
          >
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: '#DCFCE7',
                color: '#16A34A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                margin: '0 auto 20px auto',
              }}
            >
              <FaCheckCircle />
            </div>
            
            <span
              style={{
                fontSize: '12px',
                fontWeight: 800,
                color: '#16A34A',
                backgroundColor: '#F0FDF4',
                padding: '4px 12px',
                borderRadius: '999px',
                display: 'inline-block',
                marginBottom: '10px',
              }}
            >
              LEAD ID: {submittedRefId}
            </span>

            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A', marginBottom: '12px' }}>
              Property Posted Successfully!
            </h2>
            <p style={{ fontSize: '1.02rem', color: '#475569', lineHeight: 1.6, maxWidth: '580px', margin: '0 auto 24px auto' }}>
              Thank you <strong>{formData.sellerName}</strong>. Your property <strong>"{formData.title}"</strong> along with {uploadedPhotos.length} high-resolution photos has been submitted to TheNexOpp team.
            </p>

            <div
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '20px',
                textAlign: 'left',
                maxWidth: '520px',
                margin: '0 auto 28px auto',
              }}
            >
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Submission Summary
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem', color: '#475569' }}>
                <div><strong>Property Type:</strong> {formData.propertyType}</div>
                <div><strong>Purpose:</strong> For {formData.propertyPurpose}</div>
                <div><strong>Expected Price:</strong> {formatIndianPrice(formData.expectedPrice)}</div>
                <div><strong>City / Locality:</strong> {formData.locality}, {formData.city === 'Other' ? formData.customCity : formData.city}</div>
                <div><strong>Bedrooms:</strong> {formData.bedrooms}</div>
                <div><strong>Photos Uploaded:</strong> {uploadedPhotos.length} Original Photos</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setUploadedPhotos([]);
                  setFormData((prev) => ({
                    ...prev,
                    title: '',
                    expectedPrice: '',
                    areaSqFt: '',
                    locality: '',
                    address: '',
                    description: '',
                  }));
                }}
                style={{
                  backgroundColor: '#1E40AF',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px 28px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(30, 64, 175, 0.25)',
                }}
              >
                Post Another Property
              </button>
              <a
                href="/properties"
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#334155',
                  border: '1px solid #CBD5E1',
                  borderRadius: '12px',
                  padding: '14px 28px',
                  fontSize: '14px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                Browse Marketplace
              </a>
            </div>
          </div>
        ) : (
          /* ================= MAIN PROPERTY SUBMISSION FORM ================= */
          <form
            onSubmit={handleSubmit}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.05)',
              border: '1px solid #E2E8F0',
              padding: '36px 32px',
            }}
          >
            {/* Global Error Banner */}
            {Object.keys(errors).length > 0 && (
              <div
                className="form-error-anchor"
                style={{
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  borderRadius: '14px',
                  padding: '14px 18px',
                  marginBottom: '28px',
                  color: '#B91C1C',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <FaInfoCircle size={18} style={{ flexShrink: 0 }} />
                <span>
                  Please correct the highlighted fields below before submitting.
                </span>
              </div>
            )}

            {/* ── SECTION 1: SELLER CONTACT INFORMATION ───────────────────── */}
            <div style={{ marginBottom: '36px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', borderBottom: '2px solid #F1F5F9', paddingBottom: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EFF6FF', color: '#1E40AF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px' }}>
                  1
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Seller Contact Information
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '2px 0 0 0' }}>
                    Your contact info is kept confidential and shared only with verified leads
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                {/* Seller Name */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                    <FaUser style={{ color: '#1E40AF' }} /> Seller Full Name <span style={{ color: '#EF4444' }}>*</span>
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
                    placeholder="e.g. Luxury 3 BHK Gated Community Apartment with East Facing in Madhapur"
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
                    <option value="Commercial Office / Shop">Commercial Office / Shop</option>
                    <option value="Commercial Land / Building">Commercial Land / Building</option>
                    <option value="Residential Plot / Land">Residential Plot / Land</option>
                    <option value="Agricultural / Farm Land">Agricultural / Farm Land</option>
                    <option value="Penthouse / Duplex">Penthouse / Duplex</option>
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

            {/* ── SECTION 4: PROPERTY SPECIFICATIONS ──────────────────────── */}
            <div style={{ marginBottom: '36px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', borderBottom: '2px solid #F1F5F9', paddingBottom: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EFF6FF', color: '#1E40AF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px' }}>
                  4
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Property Specifications &amp; Features
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '2px 0 0 0' }}>
                    Detailed size, room configuration and facing details
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                {/* Bedrooms */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                    <FaBed style={{ color: '#1E40AF' }} /> Bedrooms / BHK
                  </label>
                  <select
                    value={formData.bedrooms}
                    onChange={(e) => handleChange('bedrooms', e.target.value)}
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
                    <option value="1 BHK">1 BHK</option>
                    <option value="2 BHK">2 BHK</option>
                    <option value="2.5 BHK">2.5 BHK</option>
                    <option value="3 BHK">3 BHK</option>
                    <option value="3.5 BHK">3.5 BHK</option>
                    <option value="4 BHK">4 BHK</option>
                    <option value="5+ BHK">5+ BHK</option>
                    <option value="Plot / NA">Plot / Commercial / NA</option>
                  </select>
                </div>

                {/* Bathrooms */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                    <FaBath style={{ color: '#1E40AF' }} /> Bathrooms
                  </label>
                  <select
                    value={formData.bathrooms}
                    onChange={(e) => handleChange('bathrooms', e.target.value)}
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
                    <option value="1">1 Bathroom</option>
                    <option value="2">2 Bathrooms</option>
                    <option value="3">3 Bathrooms</option>
                    <option value="4">4 Bathrooms</option>
                    <option value="5+">5+ Bathrooms</option>
                  </select>
                </div>

                {/* Balconies */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                    Balconies
                  </label>
                  <select
                    value={formData.balconies}
                    onChange={(e) => handleChange('balconies', e.target.value)}
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
                    <option value="0">0 Balconies</option>
                    <option value="1">1 Balcony</option>
                    <option value="2">2 Balconies</option>
                    <option value="3">3 Balconies</option>
                    <option value="4+">4+ Balconies</option>
                  </select>
                </div>

                {/* Super Builtup Area */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                    Super Built-up Area (Sq.Ft / Sq.Yds) <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 1850"
                    value={formData.areaSqFt}
                    onChange={(e) => handleChange('areaSqFt', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: errors.areaSqFt ? '2px solid #EF4444' : '1px solid #CBD5E1',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  {errors.areaSqFt && <span style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.areaSqFt}</span>}
                </div>

                {/* Carpet Area */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                    Carpet Area (Sq.Ft) <span style={{ color: '#94A3B8', fontWeight: 400 }}>(Optional)</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 1450"
                    value={formData.carpetArea}
                    onChange={(e) => handleChange('carpetArea', e.target.value)}
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

                {/* Facing */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                    <FaCompass style={{ color: '#1E40AF' }} /> Facing Direction
                  </label>
                  <select
                    value={formData.facing}
                    onChange={(e) => handleChange('facing', e.target.value)}
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
                    <option value="East">East</option>
                    <option value="North">North</option>
                    <option value="West">West</option>
                    <option value="South">South</option>
                    <option value="North-East">North-East</option>
                    <option value="North-West">North-West</option>
                    <option value="South-East">South-East</option>
                    <option value="South-West">South-West</option>
                  </select>
                </div>

                {/* Furnishing */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                    <FaCouch style={{ color: '#1E40AF' }} /> Furnishing Status
                  </label>
                  <select
                    value={formData.furnishing}
                    onChange={(e) => handleChange('furnishing', e.target.value)}
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
                    <option value="Unfurnished">Unfurnished</option>
                    <option value="Semi-Furnished">Semi-Furnished</option>
                    <option value="Fully-Furnished">Fully-Furnished</option>
                  </select>
                </div>

                {/* Construction Stage */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                    <FaCalendarAlt style={{ color: '#1E40AF' }} /> Property Age / Stage
                  </label>
                  <select
                    value={formData.propertyAge}
                    onChange={(e) => handleChange('propertyAge', e.target.value)}
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
                    <option value="Ready to Move">Ready to Move (New)</option>
                    <option value="Under Construction">Under Construction</option>
                    <option value="0 - 2 Years Old">0 - 2 Years Old</option>
                    <option value="2 - 5 Years Old">2 - 5 Years Old</option>
                    <option value="5 - 10 Years Old">5 - 10 Years Old</option>
                    <option value="10+ Years Old">10+ Years Old</option>
                  </select>
                </div>

                {/* Floor Number */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                    <FaLayerGroup style={{ color: '#1E40AF' }} /> Floor Number
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 4"
                    value={formData.floorNumber}
                    onChange={(e) => handleChange('floorNumber', e.target.value)}
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

                {/* Total Floors */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                    Total Floors in Building
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 12"
                    value={formData.totalFloors}
                    onChange={(e) => handleChange('totalFloors', e.target.value)}
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

                {/* Parking Slots */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                    Car Parking Slots
                  </label>
                  <select
                    value={formData.parkingSlots}
                    onChange={(e) => handleChange('parkingSlots', e.target.value)}
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
                    <option value="0">0 Parking</option>
                    <option value="1">1 Covered Parking</option>
                    <option value="2">2 Covered Parkings</option>
                    <option value="3+">3+ Parkings</option>
                  </select>
                </div>
              </div>

              {/* Key Amenities */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '10px' }}>
                  Select Available Amenities
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                  {POPULAR_AMENITIES.map((amenity) => {
                    const isChecked = selectedAmenities.includes(amenity);
                    return (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => toggleAmenity(amenity)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: isChecked ? '1.5px solid #1E40AF' : '1px solid #E2E8F0',
                          backgroundColor: isChecked ? '#EFF6FF' : '#FFFFFF',
                          color: isChecked ? '#1E40AF' : '#475569',
                          fontSize: '12px',
                          fontWeight: isChecked ? 700 : 500,
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '4px',
                            border: isChecked ? '1px solid #1E40AF' : '1px solid #CBD5E1',
                            backgroundColor: isChecked ? '#1E40AF' : '#FFFFFF',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            flexShrink: 0,
                          }}
                        >
                          {isChecked && <FaCheck />}
                        </div>
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{amenity}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                  Property Description / Detailed Remarks <span style={{ color: '#94A3B8', fontWeight: 400 }}>(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Mention unique highlights such as rental yield, modular kitchen, corner unit, nearby schools or hospital, etc."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
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
            <div
              style={{
                marginBottom: '36px',
                padding: '24px',
                borderRadius: '18px',
                backgroundColor: '#F8FAFC',
                border: errors.photos ? '2px solid #EF4444' : '1px solid #E2E8F0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#1E40AF', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px' }}>
                    5
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      Property Photos <span style={{ color: '#EF4444' }}>* (Minimum 6 Photos Required)</span>
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '2px 0 0 0' }}>
                      Upload at least 6 clear photos of living room, bedrooms, kitchen, bathrooms, balcony, and building exterior.
                    </p>
                  </div>
                </div>

                {/* Photo Counter Badge */}
                <div
                  style={{
                    padding: '6px 14px',
                    borderRadius: '999px',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: uploadedPhotos.length >= 6 ? '#DCFCE7' : '#FEF3C7',
                    color: uploadedPhotos.length >= 6 ? '#15803D' : '#B45309',
                    border: uploadedPhotos.length >= 6 ? '1px solid #86EFAC' : '1px solid #FDE68A',
                  }}
                >
                  {uploadedPhotos.length >= 6 ? (
                    <>
                      <FaCheckCircle /> {uploadedPhotos.length} / 6 Photos Uploaded (Requirement Met)
                    </>
                  ) : (
                    <>
                      <FaInfoCircle /> {uploadedPhotos.length} / 6 Photos (Need at least {6 - uploadedPhotos.length} more)
                    </>
                  )}
                </div>
              </div>

              {/* Upload Drop Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed #93C5FD',
                  borderRadius: '16px',
                  backgroundColor: '#FFFFFF',
                  padding: '32px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  marginBottom: '20px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#1E40AF')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#93C5FD')}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoFilesSelected}
                  style={{ display: 'none' }}
                />

                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: '#EFF6FF',
                    color: '#1E40AF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                    margin: '0 auto 12px auto',
                  }}
                >
                  {isUploadingPhoto ? <FaUpload className="animate-bounce" /> : <FaCamera />}
                </div>

                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
                  {isUploadingPhoto ? uploadProgressText : 'Click to Upload or Drag & Drop Photos Here'}
                </div>
                <p style={{ fontSize: '0.82rem', color: '#64748B', maxWidth: '440px', margin: '0 auto' }}>
                  Supports PNG, JPG, JPEG, WEBP. Photos are stored in <strong>100% original full resolution &amp; clarity</strong> without pixel compression.
                </p>
              </div>

              {errors.photos && (
                <div style={{ color: '#EF4444', fontSize: '13px', fontWeight: 700, marginBottom: '16px' }}>
                  ⚠️ {errors.photos}
                </div>
              )}

              {/* Uploaded Photos Grid */}
              {uploadedPhotos.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '10px' }}>
                    Uploaded Images ({uploadedPhotos.length}):
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                      gap: '12px',
                    }}
                  >
                    {uploadedPhotos.map((photo, idx) => (
                      <div
                        key={idx}
                        style={{
                          position: 'relative',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          border: idx === 0 ? '2px solid #1E40AF' : '1px solid #CBD5E1',
                          backgroundColor: '#FFFFFF',
                          aspectRatio: '1',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                        }}
                      >
                        <img
                          src={photo.url}
                          alt={photo.originalName || ('Property Photo ' + (idx + 1))}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />

                        {/* Primary Badge */}
                        {idx === 0 ? (
                          <div
                            style={{
                              position: 'absolute',
                              top: '6px',
                              left: '6px',
                              backgroundColor: '#1E40AF',
                              color: '#FFFFFF',
                              fontSize: '9.5px',
                              fontWeight: 800,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px',
                            }}
                          >
                            <FaStar size={8} /> Cover
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setPrimaryPhoto(idx)}
                            title="Set as Cover Photo"
                            style={{
                              position: 'absolute',
                              top: '6px',
                              left: '6px',
                              backgroundColor: 'rgba(15, 23, 42, 0.75)',
                              color: '#FFFFFF',
                              fontSize: '9.5px',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              border: 'none',
                              cursor: 'pointer',
                            }}
                          >
                            Set Cover
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          title="Remove Photo"
                          style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            backgroundColor: 'rgba(239, 68, 68, 0.9)',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '11px',
                          }}
                        >
                          <FaTrash />
                        </button>

                        <div
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            backgroundColor: 'rgba(15, 23, 42, 0.7)',
                            color: '#FFFFFF',
                            fontSize: '9.5px',
                            padding: '3px 6px',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {photo.originalName || ('Photo #' + (idx + 1))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── SUBMIT BUTTON ───────────────────────────────────────────── */}
            <div style={{ textAlign: 'center', paddingTop: '10px' }}>
              <button
                type="submit"
                disabled={isSubmitting || isUploadingPhoto}
                style={{
                  backgroundColor: '#1E40AF',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '16px 54px',
                  fontSize: '16px',
                  fontWeight: 800,
                  cursor: isSubmitting || isUploadingPhoto ? 'not-allowed' : 'pointer',
                  boxShadow: '0 6px 20px rgba(30, 64, 175, 0.35)',
                  transition: 'all 0.2s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  opacity: isSubmitting || isUploadingPhoto ? 0.7 : 1,
                }}
              >
                <FaPaperPlane />
                <span>{isSubmitting ? 'Submitting Property Lead...' : 'Submit & Post Property'}</span>
              </button>
              <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '10px' }}>
                By submitting, you agree to TheNexOpp terms of listing &amp; verified publishing policy.
              </p>
            </div>
          </form>
        )}

        {/* ── 3D MODERN FLOWCHART ─────────────────────────────────────────── */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '28px',
            padding: '44px 40px',
            marginTop: '48px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.07)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 800,
                color: '#1E40AF',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                backgroundColor: '#EFF6FF',
                padding: '5px 14px',
                borderRadius: '999px',
                display: 'inline-block',
                marginBottom: '10px',
              }}
            >
              Step-By-Step Process
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
              How Posting Your Property Works
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '20px',
              position: 'relative',
            }}
          >
            {steps.map((step, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  padding: '24px 20px',
                  textAlign: 'center',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 10px 20px -5px rgba(15, 23, 42, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#1E40AF',
                    backgroundColor: '#EFF6FF',
                    padding: '3px 10px',
                    borderRadius: '999px',
                    marginBottom: '14px',
                  }}
                >
                  STEP 0{idx + 1}
                </div>

                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                    marginBottom: '14px',
                    boxShadow: '0 8px 16px -4px rgba(30, 64, 175, 0.35)',
                  }}
                >
                  {step.icon}
                </div>

                <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                  {step.title}
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SellPropertyPage;
