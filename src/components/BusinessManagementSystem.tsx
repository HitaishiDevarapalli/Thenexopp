import React, { useState, useEffect, useMemo } from 'react';
import {
  businessDb, addBusiness, updateBusiness, deleteBusiness,
  sellBusinessRequestsDb, updateSellBusinessRequest, deleteSellBusinessRequest,
  businessEnquiriesDb,
  masterCategoriesDb, addFilterMasterItem, updateFilterMasterItem, deleteFilterMasterItem,
  masterBusinessTypesDb,
  type BusinessListing, type SellBusinessRequest, type BusinessEnquiry, type FilterMasterItem
} from '../db/marketplaceDb';
import { 
  FaStore, FaEye, FaEyeSlash, FaStar, FaEdit, FaTrash, FaPlus, 
  FaSearch, FaCheck, FaTimes, FaInbox, FaChartBar, FaTags, FaBriefcase,
  FaFileAlt, FaMapMarkerAlt, FaRegStar, FaEllipsisV, FaMoneyBillWave, FaCloudUploadAlt
} from 'react-icons/fa';

interface BusinessManagementSystemProps {
  showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void;
  activeSubTab: string;
  onSubTabChange: (tab: string) => void;
}

export const BusinessManagementSystem: React.FC<BusinessManagementSystemProps> = ({ showNotification, activeSubTab, onSubTabChange }) => {
  const [dataUpdated, setDataUpdated] = useState(0);

  // Trigger re-render on data change
  useEffect(() => {
    const handleDataChange = () => setDataUpdated(prev => prev + 1);
    window.addEventListener('nexopp_data_changed', handleDataChange);
    return () => window.removeEventListener('nexopp_data_changed', handleDataChange);
  }, []);

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditId, setCurrentEditId] = useState<string | null>(null);

  // Search states
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data snapshots
  const businesses = useMemo(() => businessDb, [dataUpdated, businessDb]);
  const sellRequests = useMemo(() => sellBusinessRequestsDb, [dataUpdated, sellBusinessRequestsDb]);
  const buyEnquiries = useMemo(() => businessEnquiriesDb, [dataUpdated, businessEnquiriesDb]);
  const categories = useMemo(() => masterCategoriesDb.filter(c => c.type === 'category'), [dataUpdated, masterCategoriesDb]);
  const businessTypes = useMemo(() => masterBusinessTypesDb.filter(t => t.type === 'business_type'), [dataUpdated, masterBusinessTypesDb]);

  // Dashboard Stats
  const totalBusinesses = businesses.length;
  const publishedBusinesses = businesses.filter(b => b.published !== false).length;
  const unpublishedBusinesses = businesses.filter(b => b.published === false).length;
  const featuredBusinesses = businesses.filter(b => b.featured === true).length;
  const pendingSellRequests = sellRequests.filter(r => r.status === 'PENDING_REVIEW').length;
  const totalBuyEnquiries = buyEnquiries.length;
  const availableBusinesses = businesses.filter(b => b.status === 'Available' || !b.status).length;
  const soldBusinesses = businesses.filter(b => b.status === 'Sold' || b.status === 'Unavailable').length;

  const handleTogglePublish = (id: string, currentPublished: boolean) => {
    updateBusiness(id, { published: !currentPublished });
    showNotification(`Business ${!currentPublished ? 'published' : 'unpublished'} successfully`, 'success');
  };

  const handleToggleFeatured = (id: string, currentFeatured: boolean) => {
    updateBusiness(id, { featured: !currentFeatured });
    showNotification(`Business ${!currentFeatured ? 'marked as featured' : 'removed from featured'}`, 'success');
  };

  const handleDeleteBusiness = (id: string) => {
    if (window.confirm('Are you sure you want to delete this business?')) {
      deleteBusiness(id);
      showNotification('Business deleted successfully', 'success');
    }
  };

  const renderDashboard = () => {
    const statCards = [
      { title: 'Total Businesses', value: totalBusinesses, icon: <FaStore />, color: '#1E40AF', borderColor: '#1E40AF' },
      { title: 'Published', value: publishedBusinesses, icon: <FaEye />, color: '#059669', borderColor: '#059669' },
      { title: 'Unpublished', value: unpublishedBusinesses, icon: <FaEyeSlash />, color: '#64748B', borderColor: '#64748B' },
      { title: 'Featured', value: featuredBusinesses, icon: <FaStar />, color: '#D97706', borderColor: '#D97706' },
      { title: 'Pending Sell Requests', value: pendingSellRequests, icon: <FaFileAlt />, color: '#EA580C', borderColor: '#EA580C' },
      { title: 'Buy Enquiries', value: totalBuyEnquiries, icon: <FaInbox />, color: '#4F46E5', borderColor: '#4F46E5' },
      { title: 'Available', value: availableBusinesses, icon: <FaCheck />, color: '#10B981', borderColor: '#10B981' },
      { title: 'Sold/Unavailable', value: soldBusinesses, icon: <FaTimes />, color: '#EF4444', borderColor: '#EF4444' },
    ];

    // Distributions
    const categoryCounts = businesses.reduce((acc, b) => {
      const cat = b.category || 'Retail';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const typeCounts = businesses.reduce((acc, b) => {
      const type = b.businessType || 'Private Limited';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const cityCounts = businesses.reduce((acc, b) => {
      const city = b.city || 'Hyderabad';
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusCounts = businesses.reduce((acc, b) => {
      const status = b.status || 'Available';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return (
      <div style={{ padding: '24px', fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '12px', margin: '0 0 24px 0' }}>
          <FaChartBar style={{ color: '#1E40AF' }} /> Business Dashboard & Analytics
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {statCards.map((stat, idx) => (
            <div key={idx} style={{ backgroundColor: '#FFFFFF', padding: '18px 20px', borderRadius: '16px', border: '1px solid #E2E8F0', borderLeft: `4px solid ${stat.borderColor}`, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{stat.title}</span>
                <strong style={{ fontSize: '1.8rem', fontWeight: 800, color: stat.color, display: 'block', marginTop: '6px' }}>{stat.value}</strong>
              </div>
              <div style={{ fontSize: '1.8rem', color: stat.color, opacity: 0.25 }}>
                {stat.icon}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginTop: '24px' }}>
          {/* Card 1: Category Distribution */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '0.85rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category Distribution</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {Object.entries(categoryCounts).map(([cat, count]) => {
                const pct = totalBusinesses > 0 ? Math.round((count / totalBusinesses) * 100) : 0;
                return (
                  <div key={cat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#1E293B' }}>
                      <span>{cat}</span>
                      <span>{count} ({pct}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', backgroundColor: '#1E40AF', borderRadius: '4px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 2: Business Type Distribution */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '0.85rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Business Type Distribution</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {Object.entries(typeCounts).map(([type, count]) => {
                const pct = totalBusinesses > 0 ? Math.round((count / totalBusinesses) * 100) : 0;
                return (
                  <div key={type}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#1E293B' }}>
                      <span>{type}</span>
                      <span>{count} ({pct}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', backgroundColor: '#4F46E5', borderRadius: '4px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 3: Location Distribution */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '0.85rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>City Distribution</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {Object.entries(cityCounts).map(([city, count]) => {
                const pct = totalBusinesses > 0 ? Math.round((count / totalBusinesses) * 100) : 0;
                return (
                  <div key={city}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#1E293B' }}>
                      <span>{city}</span>
                      <span>{count} ({pct}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', backgroundColor: '#059669', borderRadius: '4px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 4: Status Distribution */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '0.85rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Listing Status</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {Object.entries(statusCounts).map(([status, count]) => {
                const pct = totalBusinesses > 0 ? Math.round((count / totalBusinesses) * 100) : 0;
                return (
                  <div key={status}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#1E293B' }}>
                      <span>{status}</span>
                      <span>{count} ({pct}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', backgroundColor: '#10B981', borderRadius: '4px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderListings = () => {
    const filteredBusinesses = businesses.filter(b => 
      (b.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.city || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.category || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div style={{ padding: '24px', fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
            <FaStore style={{ color: '#1E40AF' }} /> All Businesses
          </h2>
          <button 
            onClick={() => onSubTabChange('addBusiness')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', backgroundColor: '#1E40AF', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', transition: 'background-color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1D4ED8'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1E40AF'}
          >
            <FaPlus /> Add Business
          </button>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '20px', display: 'flex', alignItems: 'center', position: 'relative' }}>
          <FaSearch style={{ position: 'absolute', left: '28px', color: '#94A3B8' }} />
          <input 
            type="text" 
            placeholder="Search by name, city, or category..." 
            style={{ width: '100%', padding: '12px 16px 12px 40px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.9rem', fontWeight: 500, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#475569', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '16px', fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Business Details</th>
                  <th style={{ padding: '16px', fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Category & Type</th>
                  <th style={{ padding: '16px', fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Location</th>
                  <th style={{ padding: '16px', fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Price</th>
                  <th style={{ padding: '16px', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '16px', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textAlign: 'center' }}>Published</th>
                  <th style={{ padding: '16px', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textAlign: 'center' }}>Featured</th>
                  <th style={{ padding: '16px', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBusinesses.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: '#64748B', fontWeight: 600 }}>No businesses found matching your search.</td>
                  </tr>
                ) : (
                  filteredBusinesses.map(b => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F8FAFC'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                          <img src={b.imageUrl || b.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='52' viewBox='0 0 64 52'%3E%3Crect fill='%23F1F5F9' width='64' height='52'/%3E%3Ctext fill='%2394A3B8' x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='10'%3EBusiness%3C/text%3E%3C/svg%3E"} alt={b.title} style={{ width: '64px', height: '52px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                          <div>
                            <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.9rem', marginBottom: '3px' }}>{b.title}</div>
                            <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 500, marginBottom: '4px' }}>{b.id}</div>
                            <span style={{ padding: '2px 6px', backgroundColor: '#EFF6FF', color: '#1E40AF', fontSize: '0.7rem', fontWeight: 600, borderRadius: '4px' }}>
                              {b.category}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <p style={{ color: '#0F172A', margin: 0, fontWeight: 600, fontSize: '0.88rem' }}>{b.category}</p>
                        <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '2px 0 0 0' }}>{b.businessType}</p>
                      </td>
                      <td style={{ padding: '16px', color: '#475569', fontWeight: 600, fontSize: '0.88rem' }}>{b.city}</td>
                      <td style={{ padding: '16px', fontWeight: 700, color: '#0F172A', fontSize: '0.9rem' }}>{b.priceDisplay || (b.askingPrice !== undefined ? `₹${b.askingPrice} L` : `₹${b.price} L`)}</td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <select 
                          style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid #CBD5E1', fontSize: '0.78rem', fontWeight: 700, outline: 'none', cursor: 'pointer', backgroundColor: '#FFF', color: '#334155' }}
                          value={b.status || 'Available'}
                          onChange={(e) => updateBusiness(b.id, { status: e.target.value as any })}
                        >
                          <option value="Available">Available</option>
                          <option value="Sold">Sold</option>
                          <option value="Unavailable">Unavailable</option>
                          <option value="Under_Review">Under Review</option>
                        </select>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <button onClick={() => handleTogglePublish(b.id, b.published !== false)} style={{ border: 'none', backgroundColor: 'transparent', cursor: 'pointer', padding: '6px', borderRadius: '50%' }}>
                          {b.published !== false ? <FaEye style={{ color: '#059669', fontSize: '1.2rem' }} /> : <FaEyeSlash style={{ color: '#EF4444', fontSize: '1.2rem' }} />}
                        </button>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <button onClick={() => handleToggleFeatured(b.id, !!b.featured)} style={{ border: 'none', backgroundColor: 'transparent', cursor: 'pointer', padding: '6px', borderRadius: '50%' }}>
                          {b.featured ? <FaStar style={{ color: '#D97706', fontSize: '1.2rem' }} /> : <FaRegStar style={{ color: '#94A3B8', fontSize: '1.2rem' }} />}
                        </button>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button onClick={() => handleDeleteBusiness(b.id)} style={{ border: 'none', backgroundColor: 'transparent', color: '#EF4444', cursor: 'pointer', fontSize: '0.95rem', padding: '6px', borderRadius: '6px', transition: 'background-color 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FEE2E2'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const AddBusinessForm = () => {
    const [formData, setFormData] = useState<Partial<BusinessListing>>({
      title: '', description: '', category: categories[0]?.name || 'Retail', businessType: businessTypes[0]?.name || 'Private Limited',
      city: 'Hyderabad', state: 'Andhra Pradesh', askingPrice: 50, priceDisplay: '', imageUrl: '', 
      establishedYear: new Date().getFullYear(), employeesCount: '1-10', revenueMonthly: '₹ 2 L / month', profitMonthly: '25% Net Profit',
      reasonForSale: 'Business Expansion', featured: false, published: true, status: 'Available'
    });

    const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileUpload = (files: FileList | null) => {
      if (!files || files.length === 0) return;
      Array.from(files).forEach((file) => {
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            const base64 = e.target.result as string;
            setUploadedPhotos((prev) => {
              const updated = [...prev, base64];
              setFormData((f) => ({ ...f, imageUrl: updated[0], image: updated[0] }));
              return updated;
            });
          }
        };
        reader.readAsDataURL(file);
      });
    };

    const removePhoto = (index: number) => {
      setUploadedPhotos((prev) => {
        const updated = prev.filter((_, i) => i !== index);
        const nextPrimary = updated[0] || '';
        setFormData((f) => ({ ...f, imageUrl: nextPrimary, image: nextPrimary }));
        return updated;
      });
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const primaryImage = uploadedPhotos[0] || formData.imageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80';
      const payload: any = {
        ...formData,
        id: `biz-${Date.now()}`,
        name: formData.title || 'Business Listing',
        title: formData.title || 'Business Listing',
        price: Number(formData.askingPrice) || 0,
        askingPrice: Number(formData.askingPrice) || 0,
        priceDisplay: formData.priceDisplay || `₹ ${formData.askingPrice || 50} Lakhs`,
        image: primaryImage,
        imageUrl: primaryImage,
        images: uploadedPhotos.length > 0 ? uploadedPhotos : [primaryImage],
        published: true,
        status: formData.status || 'Available',
        createdAt: new Date().toISOString(),
      };
      addBusiness(payload as BusinessListing);
      showNotification('Business added successfully with photos & published', 'success');
      onSubTabChange('listings');
    };

    return (
      <div style={{ padding: '24px', fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <FaPlus style={{ color: '#1E40AF' }} /> Add New Business
        </h2>
        
        <form onSubmit={handleSubmit} style={{ backgroundColor: '#FFFFFF', padding: '28px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)', maxWidth: '840px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>Business Name</label>
              <input required type="text" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>

            {/* Drag & Drop Photo Uploader */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '8px' }}>
                <span>📷 Upload Business Photos</span>
                {uploadedPhotos.length > 0 && <span style={{ color: '#059669' }}>{uploadedPhotos.length} Photo(s) Added</span>}
              </label>
              
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleFileUpload(e.dataTransfer.files);
                }}
                onClick={() => document.getElementById('business-multi-photo-input')?.click()}
                style={{
                  border: '2px dashed #CBD5E1',
                  borderRadius: '12px',
                  padding: '28px 16px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: isDragging ? '#EFF6FF' : '#F8FAFC',
                  borderColor: isDragging ? '#1E40AF' : '#CBD5E1',
                  transition: 'all 0.2s'
                }}
              >
                <input
                  id="business-multi-photo-input"
                  type="file"
                  multiple
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
                <FaCloudUploadAlt style={{ fontSize: '2.5rem', color: '#1E40AF', marginBottom: '8px' }} />
                <p style={{ margin: '0 0 4px 0', fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>Drag & Drop Photos Here or Click to Upload</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B' }}>Supports JPG, PNG, WEBP, GIF, SVG (Upload multiple photos at once)</p>
              </div>

              {/* Photos Gallery Preview */}
              {uploadedPhotos.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '16px' }}>
                  {uploadedPhotos.map((photo, idx) => (
                    <div key={idx} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E2E8F0', width: '96px', height: '80px', backgroundColor: '#F1F5F9', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                      <img src={photo} alt={`Upload ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {idx === 0 && <span style={{ position: 'absolute', top: '4px', left: '4px', backgroundColor: '#1E40AF', color: '#FFF', fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>Cover</span>}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removePhoto(idx); }}
                        style={{ position: 'absolute', top: '4px', right: '4px', backgroundColor: '#EF4444', color: '#FFF', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '9px' }}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>Category</label>
              <select style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.9rem', backgroundColor: '#FFF', boxSizing: 'border-box' }} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>Business Type</label>
              <select style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.9rem', backgroundColor: '#FFF', boxSizing: 'border-box' }} value={formData.businessType} onChange={e => setFormData({...formData, businessType: e.target.value})}>
                {businessTypes.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>City</label>
              <select required style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.9rem', backgroundColor: '#FFF', boxSizing: 'border-box' }} value={formData.city || 'Hyderabad'} onChange={e => setFormData({...formData, city: e.target.value})}>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Vijayawada">Vijayawada</option>
                <option value="Guntur">Guntur</option>
                <option value="Visakhapatnam">Visakhapatnam</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>State</label>
              <input required type="text" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }} value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>Asking Price (Lakhs)</label>
              <input required type="number" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }} value={formData.askingPrice} onChange={e => setFormData({...formData, askingPrice: Number(e.target.value)})} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>Price Display (e.g. ₹50 Lakhs)</label>
              <input type="text" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }} value={formData.priceDisplay} onChange={e => setFormData({...formData, priceDisplay: e.target.value})} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>Description</label>
              <textarea rows={4} style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box', fontFamily: 'inherit' }} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button type="submit" style={{ padding: '12px 24px', backgroundColor: '#1E40AF', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.92rem', cursor: 'pointer', transition: 'background-color 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1D4ED8'} onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1E40AF'}>Save Business</button>
          </div>
        </form>
      </div>
    );
  };

  const renderSellRequests = () => {
    return (
      <div style={{ padding: '24px', fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <FaFileAlt style={{ color: '#1E40AF' }} /> Sell Business Requests
        </h2>
        
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#475569', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '16px' }}>ID</th>
                  <th style={{ padding: '16px' }}>Contact Info</th>
                  <th style={{ padding: '16px' }}>Business Details</th>
                  <th style={{ padding: '16px' }}>Status</th>
                  <th style={{ padding: '16px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sellRequests.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: '#64748B', fontWeight: 600 }}>No sell business requests found.</td>
                  </tr>
                ) : (
                  sellRequests.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F8FAFC'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '16px', fontSize: '0.82rem', fontFamily: 'monospace', color: '#64748B', fontWeight: 600 }}>{r.id.substring(0,8)}</td>
                      <td style={{ padding: '16px' }}>
                        <p style={{ fontWeight: 700, color: '#0F172A', margin: 0, fontSize: '0.92rem' }}>{r.name}</p>
                        <p style={{ fontSize: '0.78rem', color: '#475569', margin: '2px 0 0 0', fontWeight: 600 }}>{r.mobile}</p>
                        <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '1px 0 0 0' }}>{r.email}</p>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <p style={{ color: '#0F172A', margin: 0, fontWeight: 700, fontSize: '0.92rem' }}>{r.businessCategory}</p>
                        <p style={{ fontSize: '0.78rem', color: '#475569', margin: '2px 0 0 0', fontWeight: 600 }}>{r.city}</p>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <select 
                          style={{ 
                            padding: '6px 12px', 
                            borderRadius: '20px', 
                            border: 'none', 
                            fontSize: '0.78rem', 
                            fontWeight: 700, 
                            outline: 'none', 
                            cursor: 'pointer',
                            backgroundColor: r.status === 'PENDING_REVIEW' ? '#FFEDD5' : r.status === 'APPROVED' ? '#DCFCE7' : r.status === 'REJECTED' ? '#FEE2E2' : '#DBEAFE',
                            color: r.status === 'PENDING_REVIEW' ? '#C2410C' : r.status === 'APPROVED' ? '#15803D' : r.status === 'REJECTED' ? '#B91C1C' : '#1E40AF'
                          }}
                          value={r.status}
                          onChange={(e) => updateSellBusinessRequest(r.id, { status: e.target.value as any })}
                        >
                          <option value="PENDING_REVIEW">Pending</option>
                          <option value="CONTACTED">Contacted</option>
                          <option value="APPROVED">Approved</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <button onClick={() => {
                          if(window.confirm('Delete request?')) {
                            deleteSellBusinessRequest(r.id);
                            showNotification('Request deleted', 'success');
                          }
                        }} style={{ border: 'none', backgroundColor: 'transparent', color: '#EF4444', cursor: 'pointer', fontSize: '1rem', padding: '6px', borderRadius: '6px', transition: 'background-color 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FEE2E2'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderBuyEnquiries = () => {
    return (
      <div style={{ padding: '24px', fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <FaInbox style={{ color: '#1E40AF' }} /> Buy Enquiries
        </h2>
        <div style={{ backgroundColor: '#FFFFFF', padding: '36px', borderRadius: '16px', border: '1px solid #E2E8F0', textAlign: 'center', color: '#64748B' }}>
          <FaInbox style={{ fontSize: '2.5rem', color: '#CBD5E1', marginBottom: '12px' }} />
          <p style={{ margin: 0, fontWeight: 600 }}>Buy enquiries will be displayed here.</p>
        </div>
      </div>
    );
  };

  const renderCategories = () => (
    <div style={{ padding: '24px', fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <FaTags style={{ color: '#1E40AF' }} /> Categories
      </h2>
      <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)' }}>
        {categories.map(c => (
          <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #F1F5F9' }}>
            <span style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.92rem' }}>{c.name}</span>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '4px 10px', borderRadius: '12px', backgroundColor: (c.is_active ?? c.active) !== false ? '#DCFCE7' : '#FEE2E2', color: (c.is_active ?? c.active) !== false ? '#15803D' : '#B91C1C' }}>
              {(c.is_active ?? c.active) !== false ? 'Active' : 'Inactive'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBusinessTypes = () => (
    <div style={{ padding: '24px', fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <FaBriefcase style={{ color: '#1E40AF' }} /> Business Types
      </h2>
      <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)' }}>
        {businessTypes.map(t => (
          <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #F1F5F9' }}>
            <span style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.92rem' }}>{t.name}</span>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '4px 10px', borderRadius: '12px', backgroundColor: (t.is_active ?? t.active) !== false ? '#DCFCE7' : '#FEE2E2', color: (t.is_active ?? t.active) !== false ? '#15803D' : '#B91C1C' }}>
              {(t.is_active ?? t.active) !== false ? 'Active' : 'Inactive'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFeatured = () => (
    <div style={{ padding: '24px', fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <FaStar style={{ color: '#D97706' }} /> Featured Businesses
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {businesses.filter(b => b.featured).map(b => (
          <div key={b.id} style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)' }}>
            <img src={b.imageUrl || b.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect fill='%23F1F5F9' width='300' height='200'/%3E%3Ctext fill='%2394A3B8' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16'%3EFeatured Business%3C/text%3E%3C/svg%3E"} alt={b.title} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
            <div style={{ padding: '16px' }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>{b.title}</h3>
              <p style={{ margin: '0 0 16px 0', color: '#64748B', fontSize: '0.85rem', fontWeight: 550 }}>{b.category}</p>
              <button onClick={() => handleToggleFeatured(b.id, true)} style={{ border: 'none', backgroundColor: 'transparent', color: '#EF4444', fontSize: '0.82rem', fontWeight: 700, padding: 0, cursor: 'pointer', textDecoration: 'underline' }}>Remove from Featured</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', width: '100%', boxSizing: 'border-box' }}>
      {activeSubTab === 'dashboard' && renderDashboard()}
      {activeSubTab === 'listings' && renderListings()}
      {activeSubTab === 'addBusiness' && <AddBusinessForm />}
      {activeSubTab === 'sellRequests' && renderSellRequests()}
      {activeSubTab === 'buyEnquiries' && renderBuyEnquiries()}
      {activeSubTab === 'categories' && renderCategories()}
      {activeSubTab === 'businessTypes' && renderBusinessTypes()}
      {activeSubTab === 'featured' && renderFeatured()}
    </div>
  );
};

export default BusinessManagementSystem;
