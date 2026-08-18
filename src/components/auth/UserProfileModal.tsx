import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaShieldAlt, 
  FaHeart, FaPlus, FaSignOutAlt, FaTimes, FaEdit, FaCheck, 
  FaBriefcase, FaStore, FaBuilding, FaInbox
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { API_BASE_URL, enquiriesDb } from '../../db/marketplaceDb';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToPage?: (page: string) => void;
  onOpenWishlist?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onNavigateToPage,
  onOpenWishlist,
}) => {
  const { user, updateUserProfile, logout } = useAuth();
  const { wishlistItems } = useWishlist();

  const [activeTab, setActiveTab] = useState<'overview' | 'enquiries' | 'edit'>('overview');
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editDistrict, setEditDistrict] = useState(user?.district || 'Guntur');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [userEnquiries, setUserEnquiries] = useState<any[]>([]);
  const [loadingEnquiries, setLoadingEnquiries] = useState(false);

  const fetchUserEnquiries = async () => {
    if (!user) return;
    setLoadingEnquiries(true);
    try {
      const rawPhone = user.phone || (user as any).mobile || '';
      const userPhone = rawPhone.replace(/\D/g, '');
      const userId = user.id || '';
      const userEmail = (user.email && !user.email.includes('@nexopp.in') && !user.email.includes('@thenexopp')) ? user.email : '';
      const userName = user.name || '';

      const params = new URLSearchParams();
      if (userPhone) params.set('phone', userPhone);
      if (userId) params.set('customerId', userId);
      if (userEmail) params.set('email', userEmail);
      if (userName) params.set('name', userName);

      let serverEnqs: any[] = [];
      const enqRes = await fetch(`${API_BASE_URL}/api/enquiries?${params.toString()}&mine=true`, { credentials: 'include' }).catch(() => null);
      if (enqRes && enqRes.ok) {
        const enqs = await enqRes.json().catch(() => null);
        if (Array.isArray(enqs)) {
          serverEnqs = enqs;
        }
      }

      const mergedMap = new Map<string, any>();
      serverEnqs.forEach(e => { if (e && e.id) mergedMap.set(e.id, e); });

      const normUserPhone = userPhone.length >= 10 ? userPhone.slice(-10) : userPhone;
      (enquiriesDb || []).forEach(localEnq => {
        if (!localEnq) return;
        const ePhone = String(localEnq.phone || '').replace(/\D/g, '');
        const normEPhone = ePhone.length >= 10 ? ePhone.slice(-10) : ePhone;
        const phoneMatch = normUserPhone && normEPhone && normEPhone.includes(normUserPhone);
        const emailMatch = userEmail && localEnq.email && localEnq.email.toLowerCase() === userEmail.toLowerCase();
        const idMatch = userId && (localEnq.customerId === userId || localEnq.userId === userId);
        const nameMatch = userName && userName !== 'User' && localEnq.customerName && localEnq.customerName.toLowerCase().includes(userName.toLowerCase());

        if ((phoneMatch || emailMatch || idMatch || nameMatch || (!normUserPhone && !userEmail && !userId)) && localEnq.id) {
          if (!mergedMap.has(localEnq.id)) {
            mergedMap.set(localEnq.id, localEnq);
          }
        }
      });

      const finalEnquiries = Array.from(mergedMap.values()).sort((a, b) => 
        new Date(b.createdAt || b.date || 0).getTime() - new Date(a.createdAt || a.date || 0).getTime()
      );
      setUserEnquiries(finalEnquiries);
    } catch (e) {
      console.warn('Failed to fetch user enquiries in profile modal:', e);
    } finally {
      setLoadingEnquiries(false);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchUserEnquiries();
    }
  }, [isOpen, user?.id, user?.phone, user?.email]);

  if (!isOpen || !user) return null;

  const hasRealEmail = user.email && !user.email.includes('@nexopp.in') && !user.email.includes('@thenexopp');
  const displayContact = hasRealEmail ? user.email : (user.phone ? (user.phone.startsWith('+91') ? user.phone : `+91 ${user.phone.trim()}`) : '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: editName.trim() || user.name,
      phone: editPhone.trim() || user.phone,
      district: editDistrict.trim() || user.district,
      role: 'User',
    });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setActiveTab('overview');
    }, 1200);
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  const modalContent = (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 99999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '540px',
          maxHeight: '90vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
          border: '1px solid #E2E8F0',
          position: 'relative',
        }}
      >
        {/* Profile Header Card */}
        <div style={{
          backgroundColor: '#064E3B',
          backgroundImage: 'linear-gradient(135deg, #064E3B 0%, #059669 100%)',
          padding: '24px',
          color: '#FFFFFF',
          position: 'relative',
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '18px',
              right: '18px',
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)')}
          >
            <FaTimes />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#064E3B',
              border: '3px solid rgba(253, 224, 71, 0.6)',
              color: '#FDE047',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 800,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              flexShrink: 0,
            }}>
              {(user.name || 'U').charAt(0).toUpperCase()}
            </div>

            <div style={{ overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                  {user.name || 'User'}
                </h3>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#F59E0B',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '12px',
                }}>
                  <FaShieldAlt style={{ fontSize: '10px' }} /> Verified
                </span>
              </div>

              {displayContact && (
                <div style={{ fontSize: '13px', color: '#D1FAE5', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {hasRealEmail ? <FaEnvelope style={{ fontSize: '11px', opacity: 0.8 }} /> : <FaPhone style={{ fontSize: '11px', opacity: 0.8 }} />}
                  <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{displayContact}</span>
                </div>
              )}

              <div style={{ display: 'inline-block', marginTop: '6px', fontSize: '11.5px', fontWeight: 700, backgroundColor: 'rgba(255, 255, 255, 0.18)', color: '#FFFFFF', padding: '2px 10px', borderRadius: '8px' }}>
                User
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: '6px', marginTop: '16px' }}>
            <button
              onClick={() => setActiveTab('overview')}
              style={{
                flex: 1,
                padding: '8px 6px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: activeTab === 'overview' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.12)',
                color: activeTab === 'overview' ? '#064E3B' : '#FFFFFF',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('enquiries')}
              style={{
                flex: 1.2,
                padding: '8px 6px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: activeTab === 'enquiries' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.12)',
                color: activeTab === 'enquiries' ? '#064E3B' : '#FFFFFF',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                transition: 'all 0.15s ease',
              }}
            >
              <FaInbox style={{ fontSize: '11px' }} /> Enquiries ({userEnquiries.length})
            </button>
            <button
              onClick={() => {
                setEditName(user.name || '');
                setEditPhone(user.phone || '');
                setEditDistrict(user.district || 'Guntur');
                setActiveTab('edit');
              }}
              style={{
                flex: 1,
                padding: '8px 6px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: activeTab === 'edit' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.12)',
                color: activeTab === 'edit' ? '#064E3B' : '#FFFFFF',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                transition: 'all 0.15s ease',
              }}
            >
              <FaEdit style={{ fontSize: '11px' }} /> Edit
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {activeTab === 'overview' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Account Details Box */}
              <div style={{ backgroundColor: '#F8FAFC', borderRadius: '16px', padding: '16px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                  Personal Information
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13.5px' }}>
                    <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaUser style={{ color: '#94A3B8', fontSize: '12px' }} /> Full Name:
                    </span>
                    <strong style={{ color: '#0F172A' }}>{user.name || 'User'}</strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13.5px' }}>
                    <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaPhone style={{ color: '#94A3B8', fontSize: '12px' }} /> Phone Number:
                    </span>
                    <strong style={{ color: '#0F172A' }}>
                      {user.phone ? (user.phone.startsWith('+91') ? user.phone : `+91 ${user.phone.trim()}`) : 'Not Provided'}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13.5px' }}>
                    <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaEnvelope style={{ color: '#94A3B8', fontSize: '12px' }} /> Email Address:
                    </span>
                    <strong style={{ color: '#0F172A' }}>{hasRealEmail ? user.email : 'Not Provided'}</strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13.5px' }}>
                    <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaMapMarkerAlt style={{ color: '#94A3B8', fontSize: '12px' }} /> Location / District:
                    </span>
                    <strong style={{ color: '#0F172A' }}>{user.district || 'Andhra Pradesh & Telangana'}</strong>
                  </div>
                </div>
              </div>

              {/* Quick Action Navigation Grid */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                  Quick Hub &amp; Shortcuts
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    onClick={() => {
                      onClose();
                      if (onOpenWishlist) onOpenWishlist();
                      else if (onNavigateToPage) onNavigateToPage('wishlist');
                    }}
                    style={{
                      padding: '14px',
                      borderRadius: '14px',
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F0FDF4')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                  >
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#FEE2E2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                      <FaHeart />
                    </div>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>Saved Wishlist</div>
                      <div style={{ fontSize: '11.5px', color: '#64748B' }}>{wishlistItems.length} Saved</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('enquiries')}
                    style={{
                      padding: '14px',
                      borderRadius: '14px',
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ECFDF5')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                  >
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#D1FAE5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                      <FaInbox />
                    </div>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>My Enquiries</div>
                      <div style={{ fontSize: '11.5px', color: '#64748B' }}>{userEnquiries.length} Sent</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onClose();
                      if (onNavigateToPage) onNavigateToPage('sellPropertyPage');
                    }}
                    style={{
                      padding: '14px',
                      borderRadius: '14px',
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F0FDF4')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                  >
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#DCFCE7', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                      <FaPlus />
                    </div>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>Post Property</div>
                      <div style={{ fontSize: '11.5px', color: '#64748B' }}>List For Sale/Rent</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onClose();
                      if (onNavigateToPage) onNavigateToPage('franchisePage');
                    }}
                    style={{
                      padding: '14px',
                      borderRadius: '14px',
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                  >
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                      <FaStore />
                    </div>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>Franchises</div>
                      <div style={{ fontSize: '11.5px', color: '#64748B' }}>Brand Setups</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onClose();
                      if (onNavigateToPage) onNavigateToPage('businessPage');
                    }}
                    style={{
                      padding: '14px',
                      borderRadius: '14px',
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                  >
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#DBEAFE', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                      <FaBriefcase />
                    </div>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>Businesses</div>
                      <div style={{ fontSize: '11.5px', color: '#64748B' }}>Operational Units</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          ) : activeTab === 'enquiries' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Sent Enquiries &amp; Bookings ({userEnquiries.length})
                </span>
                <button
                  onClick={fetchUserEnquiries}
                  style={{ background: 'none', border: 'none', color: '#059669', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Refresh
                </button>
              </div>

              {loadingEnquiries ? (
                <div style={{ textAlign: 'center', padding: '24px', color: '#64748B', fontSize: '13px' }}>Loading your enquiries...</div>
              ) : userEnquiries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 16px', backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1px dashed #CBD5E1' }}>
                  <FaInbox style={{ fontSize: '28px', color: '#94A3B8', marginBottom: '8px' }} />
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#475569' }}>No enquiries submitted yet</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94A3B8' }}>Your sent property, business, and slot booking enquiries will appear here.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {userEnquiries.map((enq) => {
                    const statusColor = enq.status === 'Closed' ? '#16A34A' : enq.status === 'Contacted' ? '#2563EB' : enq.status === 'Follow-up' ? '#D97706' : '#059669';
                    const statusBg = enq.status === 'Closed' ? '#DCFCE7' : enq.status === 'Contacted' ? '#DBEAFE' : enq.status === 'Follow-up' ? '#FEF3C7' : '#ECFDF5';
                    return (
                      <div key={enq.id} style={{ padding: '14px', borderRadius: '14px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                          <strong style={{ fontSize: '13.5px', color: '#0F172A', fontWeight: 700, flex: 1 }}>{enq.listingTitle || 'General Enquiry'}</strong>
                          <span style={{ backgroundColor: statusBg, color: statusColor, fontSize: '10.5px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', textTransform: 'uppercase', flexShrink: 0 }}>
                            {enq.status || 'New'}
                          </span>
                        </div>

                        {enq.message && (
                          <div style={{ fontSize: '12.5px', color: '#475569', backgroundColor: '#F8FAFC', padding: '8px 10px', borderRadius: '8px', borderLeft: '3px solid #007A55', fontStyle: 'italic' }}>
                            "{enq.message}"
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                          <span>Type: <strong style={{ color: '#64748B' }}>{enq.enquiryType || enq.listingType || 'PROPERTY'}</strong></span>
                          <span>{enq.date || new Date(enq.createdAt || Date.now()).toLocaleDateString('en-IN')}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#0F172A',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Mobile Phone Number
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#0F172A',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Preferred City / District
                </label>
                <input
                  type="text"
                  value={editDistrict}
                  onChange={(e) => setEditDistrict(e.target.value)}
                  placeholder="e.g. Hyderabad, Guntur, Vijayawada"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#0F172A',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#475569',
                    fontWeight: 700,
                    fontSize: '13.5px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 2,
                    padding: '12px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: '#059669',
                    backgroundImage: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)',
                  }}
                >
                  {saveSuccess ? (
                    <>
                      <FaCheck /> Changes Saved!
                    </>
                  ) : (
                    'Save Profile Details'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid #F1F5F9',
          backgroundColor: '#F8FAFC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') ? 'space-between' : 'flex-end',
        }}>
          {(user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') && (
            <button
              onClick={() => {
                onClose();
                if (onNavigateToPage) onNavigateToPage('adminPortal');
                else window.location.href = '/admin';
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#059669',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Open Admin Desk
            </button>
          )}

          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '10px',
              border: '1px solid #FECACA',
              backgroundColor: '#FEF2F2',
              color: '#DC2626',
              fontWeight: 700,
              fontSize: '12.5px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FEE2E2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FEF2F2';
            }}
          >
            <FaSignOutAlt /> Log Out
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
