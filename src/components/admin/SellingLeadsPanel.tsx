import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Building2,
  Download,
  Eye,
  Trash2,
  Phone,
  Mail,
  MessageSquare,
  Clock,
  Search,
  CheckCircle2,
  ShieldCheck,
  Check,
  X,
  Image as ImageIcon,
  FileText,
  RefreshCw,
  MapPin,
  IndianRupee,
  AlignLeft
} from 'lucide-react';
import type { SellPropertyRequest, SellPropertyPhoto } from '../../db/marketplaceDb';
import {
  sellPropertyRequestsDb,
  updateSellPropertyRequest,
  deleteSellPropertyRequest,
  syncWithBackend
} from '../../db/marketplaceDb';
import { AdminBadge } from './ui/AdminBadge';
import { AdminButton } from './ui/AdminButton';
import { AdminCard, StatMetricCard } from './ui/AdminCard';
import { AdminModal } from './ui/AdminModal';
import { AdminEmptyState } from './ui/AdminEmptyState';

export interface SellingLeadsPanelProps {
  showNotification?: (message: string, type?: 'success' | 'error' | 'info') => void;
  onRefreshStats?: () => void;
}

// Helper functions for safe photo handling
const getPhotoUrl = (p: string | SellPropertyPhoto): string => {
  if (typeof p === 'string') return p;
  return p.url || '';
};

const getPhotoCover = (p: string | SellPropertyPhoto): boolean => {
  if (typeof p === 'string') return false;
  return !!p.isCover;
};

const getPhotoName = (p: string | SellPropertyPhoto, idx: number): string => {
  if (typeof p === 'string') {
    const fn = p.split('/').pop();
    return fn || `Property_Photo_${idx + 1}.jpg`;
  }
  return p.name || `Property_Photo_${idx + 1}.jpg`;
};

export const SellingLeadsPanel: React.FC<SellingLeadsPanelProps> = ({
  showNotification,
  onRefreshStats,
}) => {
  const [leads, setLeads] = useState<SellPropertyRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING_REVIEW' | 'CONTACTED' | 'IN_VERIFICATION' | 'APPROVED' | 'REJECTED'>('ALL');
  const [purposeFilter, setPurposeFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [cityFilter, setCityFilter] = useState<string>('ALL');

  // Lead Details Modal
  const [selectedLead, setSelectedLead] = useState<SellPropertyRequest | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'details' | 'photos' | 'seller' | 'adminNotes'>('details');
  const [adminNotesInput, setAdminNotesInput] = useState('');
  const [statusInput, setStatusInput] = useState<string>('PENDING_REVIEW');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Full Screen Lightbox Photo
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);

  // Load leads
  const refreshLeadsList = () => {
    setLoading(true);
    syncWithBackend().then(() => {
      setLeads([...sellPropertyRequestsDb]);
      setLoading(false);
      if (onRefreshStats) onRefreshStats();
    }).catch(() => {
      setLeads([...sellPropertyRequestsDb]);
      setLoading(false);
    });
  };

  useEffect(() => {
    refreshLeadsList();
    const interval = setInterval(() => {
      setLeads([...sellPropertyRequestsDb]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Update selected lead notes/status when opened
  useEffect(() => {
    if (selectedLead) {
      setAdminNotesInput(selectedLead.adminNotes || '');
      setStatusInput(selectedLead.status || 'PENDING_REVIEW');
    }
  }, [selectedLead]);

  // Statistics
  const totalLeads = leads.length;
  const pendingLeads = leads.filter(l => l.status === 'PENDING_REVIEW' || !l.status).length;
  const contactedLeads = leads.filter(l => l.status === 'CONTACTED' || l.status === 'IN_VERIFICATION').length;
  const approvedLeads = leads.filter(l => l.status === 'APPROVED').length;

  // Filtered Leads
  const filteredLeads = leads.filter(lead => {
    // Search match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = (lead.name || lead.sellerName || '').toLowerCase().includes(q);
      const phoneMatch = (lead.mobile || '').includes(q);
      const emailMatch = (lead.email || '').toLowerCase().includes(q);
      const titleMatch = (lead.title || '').toLowerCase().includes(q);
      const cityMatch = (lead.city || '').toLowerCase().includes(q);
      const locMatch = (lead.locality || '').toLowerCase().includes(q);
      const typeMatch = (lead.propertyType || '').toLowerCase().includes(q);
      if (!nameMatch && !phoneMatch && !emailMatch && !titleMatch && !cityMatch && !locMatch && !typeMatch) {
        return false;
      }
    }

    // Status match
    if (statusFilter !== 'ALL') {
      const currentStatus = lead.status || 'PENDING_REVIEW';
      if (currentStatus !== statusFilter) return false;
    }

    // Purpose match
    if (purposeFilter !== 'ALL') {
      if (lead.propertyPurpose !== purposeFilter) return false;
    }

    // Category match
    if (categoryFilter !== 'ALL') {
      if (lead.propertyType !== categoryFilter) return false;
    }

    // City match
    if (cityFilter !== 'ALL') {
      if (lead.city !== cityFilter) return false;
    }

    return true;
  });

  // Cities List for Filter
  const availableCities = Array.from(new Set(leads.map(l => l.city).filter(Boolean)));

  // Handle Lossless Download of Single Photo
  const downloadOriginalPhoto = (photoUrl: string, fileName?: string) => {
    try {
      const filename = photoUrl.split('/').pop() || 'property-photo.jpg';
      const cleanName = fileName || filename;
      const downloadUrl = `/api/download-lead-file?file=${encodeURIComponent(filename)}&name=${encodeURIComponent(cleanName)}`;
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', cleanName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      if (showNotification) {
        showNotification(`Downloading original photo: ${cleanName}`, 'success');
      }
    } catch (err) {
      window.open(photoUrl, '_blank');
    }
  };

  // Handle Batch Lossless Download of All Photos for a Lead
  const handleDownloadAllPhotos = async (lead: SellPropertyRequest) => {
    if (!lead.photos || lead.photos.length === 0) {
      if (showNotification) showNotification('No photos available to download for this property lead.', 'error');
      return;
    }

    setDownloadingAll(true);
    if (showNotification) {
      showNotification(`Starting lossless download of ${lead.photos.length} original photos...`, 'info');
    }

    const cleanTitle = (lead.title || `property_${lead.id.substring(0, 6)}`).replace(/[^a-zA-Z0-9]/g, '_');

    for (let i = 0; i < lead.photos.length; i++) {
      const photo = lead.photos[i];
      const photoUrl = getPhotoUrl(photo);
      const isCover = getPhotoCover(photo);
      const ext = photoUrl.split('.').pop() || 'jpg';
      const name = `${cleanTitle}_photo_${i + 1}_${isCover ? 'cover' : 'detail'}.${ext}`;
      downloadOriginalPhoto(photoUrl, name);
      // Stagger downloads by 350ms so browser accepts batch
      await new Promise(res => setTimeout(res, 350));
    }

    setDownloadingAll(false);
    if (showNotification) {
      showNotification(`Successfully initiated download of all ${lead.photos.length} photos in 100% original clarity!`, 'success');
    }
  };

  // Quick Status Updater
  const handleQuickStatusChange = async (leadId: string, newStatus: string) => {
    updateSellPropertyRequest(leadId, { status: newStatus as any });
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus as any } : l));
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead(prev => prev ? { ...prev, status: newStatus as any } : null);
    }
    if (showNotification) {
      showNotification(`Lead status updated to ${newStatus.replace('_', ' ')}`, 'success');
    }
  };

  // Save Modal Status & Notes
  const handleSaveLeadReview = () => {
    if (!selectedLead) return;
    setIsUpdatingStatus(true);
    updateSellPropertyRequest(selectedLead.id, {
      status: statusInput as any,
      adminNotes: adminNotesInput,
    });
    setLeads(prev => prev.map(l => l.id === selectedLead.id ? { ...l, status: statusInput as any, adminNotes: adminNotesInput } : l));
    setSelectedLead(prev => prev ? { ...prev, status: statusInput as any, adminNotes: adminNotesInput } : null);
    setIsUpdatingStatus(false);
    if (showNotification) {
      showNotification('Lead review notes and status successfully saved!', 'success');
    }
  };

  // Delete Lead
  const handleDeleteLead = (leadId: string, leadTitle: string) => {
    if (window.confirm(`Are you sure you want to permanently remove this selling lead ("${leadTitle || 'Untitled'}")?`)) {
      deleteSellPropertyRequest(leadId);
      setLeads(prev => prev.filter(l => l.id !== leadId));
      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead(null);
      }
      if (showNotification) {
        showNotification('Property selling lead deleted successfully.', 'info');
      }
    }
  };

  // Format Currency
  const formatPrice = (priceVal?: number | string) => {
    if (!priceVal) return 'Price on Request';
    const num = Number(priceVal);
    if (isNaN(num)) return String(priceVal);
    if (num >= 10000000) {
      return `₹ ${(num / 10000000).toFixed(2)} Cr`;
    }
    if (num >= 100000) {
      return `₹ ${(num / 100000).toFixed(2)} Lac`;
    }
    return `₹ ${num.toLocaleString('en-IN')}`;
  };

  // Get status badge variant
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'APPROVED':
        return <AdminBadge variant="success" dot>Approved & Listed</AdminBadge>;
      case 'CONTACTED':
        return <AdminBadge variant="info" dot>Contacted</AdminBadge>;
      case 'IN_VERIFICATION':
        return <AdminBadge variant="purple" dot>In Verification</AdminBadge>;
      case 'REJECTED':
        return <AdminBadge variant="danger" dot>Rejected</AdminBadge>;
      case 'PENDING_REVIEW':
      default:
        return <AdminBadge variant="warning" dot>Pending Review</AdminBadge>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '1600px', margin: '0 auto', paddingBottom: '60px' }}>
      
      {/* ── TOP HERO BANNER & STATS ────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ display: 'inline-flex', padding: '6px', backgroundColor: '#ECFDF5', borderRadius: '8px', color: '#059669' }}>
              <Sparkles size={20} />
            </span>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
              New Selling Leads & Property Submissions
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748B' }}>
            Live customer submissions from the <strong>Post Your Property</strong> portal with verified seller info and 100% original lossless uncompressed photos.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AdminButton
            variant="outline"
            size="sm"
            icon={<RefreshCw size={15} className={loading ? 'animate-spin' : ''} />}
            onClick={refreshLeadsList}
          >
            Refresh Leads
          </AdminButton>
        </div>
      </div>

      {/* ── METRIC CARDS ROW ──────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <StatMetricCard
          title="Total Postings Received"
          value={totalLeads}
          icon={<Building2 size={20} />}
          iconBg="#EFF6FF"
          iconColor="#2563EB"
          description="All-time property submissions from owners & brokers"
        />
        <StatMetricCard
          title="Pending Review (New)"
          value={pendingLeads}
          change={pendingLeads > 0 ? `${pendingLeads} Action Required` : 'All Clear'}
          changeType={pendingLeads > 0 ? 'negative' : 'positive'}
          icon={<Clock size={20} />}
          iconBg="#FFFBEB"
          iconColor="#D97706"
          description="Awaiting admin inspection & initial phone call"
        />
        <StatMetricCard
          title="In Verification / Contacted"
          value={contactedLeads}
          icon={<Phone size={20} />}
          iconBg="#FAF5FF"
          iconColor="#9333EA"
          description="Currently in follow-up or document verification"
        />
        <StatMetricCard
          title="Approved & Published"
          value={approvedLeads}
          icon={<CheckCircle2 size={20} />}
          iconBg="#ECFDF5"
          iconColor="#059669"
          description="Verified and live on the public marketplace"
        />
      </div>

      {/* ── SEARCH & FILTER CONTROLS ─────────────────────────────────────── */}
      <AdminCard padding="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Status Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
            {[
              { id: 'ALL', label: 'All Submissions', count: totalLeads },
              { id: 'PENDING_REVIEW', label: 'Pending Review', count: pendingLeads, highlight: pendingLeads > 0 },
              { id: 'CONTACTED', label: 'Contacted', count: leads.filter(l => l.status === 'CONTACTED').length },
              { id: 'IN_VERIFICATION', label: 'In Verification', count: leads.filter(l => l.status === 'IN_VERIFICATION').length },
              { id: 'APPROVED', label: 'Approved & Listed', count: approvedLeads },
              { id: 'REJECTED', label: 'Rejected', count: leads.filter(l => l.status === 'REJECTED').length },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id as any)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '0.84rem',
                  fontWeight: statusFilter === tab.id ? 700 : 600,
                  color: statusFilter === tab.id ? '#059669' : '#64748B',
                  backgroundColor: statusFilter === tab.id ? '#ECFDF5' : 'transparent',
                  border: statusFilter === tab.id ? '1px solid #A7F3D0' : '1px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    padding: '2px 7px',
                    borderRadius: '12px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    backgroundColor: statusFilter === tab.id ? '#059669' : tab.highlight ? '#FEF3C7' : '#F1F5F9',
                    color: statusFilter === tab.id ? '#FFFFFF' : tab.highlight ? '#B45309' : '#64748B',
                  }}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search and Secondary Dropdowns */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ flex: '1 1 280px', position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', color: '#94A3B8' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by seller name, mobile, title, city or locality..."
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  fontSize: '0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  outline: 'none',
                  backgroundColor: '#F8FAFC',
                  color: '#0F172A',
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Purpose Filter */}
            <div style={{ minWidth: '140px' }}>
              <select
                value={purposeFilter}
                onChange={e => setPurposeFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  color: '#334155',
                  outline: 'none',
                }}
              >
                <option value="ALL">All Purposes</option>
                <option value="Sell">For Sale</option>
                <option value="Rent">For Rent</option>
                <option value="Lease">Commercial Lease</option>
              </select>
            </div>

            {/* Category Filter */}
            <div style={{ minWidth: '160px' }}>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  color: '#334155',
                  outline: 'none',
                }}
              >
                <option value="ALL">All Categories</option>
                <option value="Apartment / Flat">Apartment / Flat</option>
                <option value="Independent House / Villa">Independent House / Villa</option>
                <option value="Gated Community Villa">Gated Community Villa</option>
                <option value="Residential Plot / Land">Residential Plot / Land</option>
                <option value="Agricultural / Farm Land">Agricultural / Farm Land</option>
                <option value="Commercial Office / Shop">Commercial Office / Shop</option>
                <option value="Commercial Land / Building">Commercial Land / Building</option>
                <option value="Penthouse / Duplex">Penthouse / Duplex</option>
                <option value="Builder Floor">Builder Floor</option>
                <option value="Industrial / Warehouse">Industrial / Warehouse</option>
              </select>
            </div>

            {/* City Filter */}
            {availableCities.length > 0 && (
              <div style={{ minWidth: '140px' }}>
                <select
                  value={cityFilter}
                  onChange={e => setCityFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    color: '#334155',
                    outline: 'none',
                  }}
                >
                  <option value="ALL">All Cities</option>
                  {availableCities.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </AdminCard>

      {/* ── LEADS TABLE / LIST ────────────────────────────────────────────── */}
      {filteredLeads.length === 0 ? (
        <AdminCard padding="lg">
          <AdminEmptyState
            icon={<Building2 size={40} style={{ color: '#059669' }} />}
            title="No property selling leads found"
            description={
              searchQuery || statusFilter !== 'ALL' || purposeFilter !== 'ALL' || categoryFilter !== 'ALL'
                ? "No property postings matched your active search or filter criteria."
                : "No customer property postings have been submitted yet. Submissions from '/properties/sell' will automatically appear here."
            }
            actionLabel={
              (searchQuery || statusFilter !== 'ALL' || purposeFilter !== 'ALL' || categoryFilter !== 'ALL') ? "Clear All Filters" : undefined
            }
            onAction={
              (searchQuery || statusFilter !== 'ALL' || purposeFilter !== 'ALL' || categoryFilter !== 'ALL') ? () => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setPurposeFilter('ALL');
                setCategoryFilter('ALL');
                setCityFilter('ALL');
              } : undefined
            }
          />
        </AdminCard>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredLeads.map(lead => {
            const photosCount = lead.photos ? lead.photos.length : 0;

            return (
              <div
                key={lead.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#CBD5E1';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.06)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(15, 23, 42, 0.04)';
                }}
              >
                {/* Header Strip */}
                <div
                  style={{
                    padding: '12px 20px',
                    backgroundColor: '#F8FAFC',
                    borderBottom: '1px solid #F1F5F9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, fontFamily: 'monospace', color: '#64748B', backgroundColor: '#E2E8F0', padding: '2px 8px', borderRadius: '4px' }}>
                      #LEAD-{lead.id.substring(0, 8).toUpperCase()}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} /> {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently Submitted'}
                    </span>
                    {lead.propertyPurpose && (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: lead.propertyPurpose === 'Sell' ? '#ECFDF5' : lead.propertyPurpose === 'Rent' ? '#EFF6FF' : '#FAF5FF',
                          color: lead.propertyPurpose === 'Sell' ? '#059669' : lead.propertyPurpose === 'Rent' ? '#2563EB' : '#9333EA',
                          border: `1px solid ${lead.propertyPurpose === 'Sell' ? '#A7F3D0' : lead.propertyPurpose === 'Rent' ? '#BFDBFE' : '#E9D5FF'}`,
                        }}
                      >
                        For {lead.propertyPurpose}
                      </span>
                    )}
                  </div>

                  {/* Inline Status Dropdown */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>Status:</span>
                    <select
                      value={lead.status || 'PENDING_REVIEW'}
                      onChange={e => handleQuickStatusChange(lead.id, e.target.value)}
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        backgroundColor:
                          lead.status === 'APPROVED' ? '#ECFDF5' :
                          lead.status === 'CONTACTED' ? '#EFF6FF' :
                          lead.status === 'IN_VERIFICATION' ? '#FAF5FF' :
                          lead.status === 'REJECTED' ? '#FEF2F2' : '#FFFBEB',
                        color:
                          lead.status === 'APPROVED' ? '#059669' :
                          lead.status === 'CONTACTED' ? '#1D4ED8' :
                          lead.status === 'IN_VERIFICATION' ? '#7E22CE' :
                          lead.status === 'REJECTED' ? '#DC2626' : '#B45309',
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="PENDING_REVIEW">Pending Review</option>
                      <option value="CONTACTED">Contacted</option>
                      <option value="IN_VERIFICATION">In Verification</option>
                      <option value="APPROVED">Approved & Listed</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                </div>

                {/* Main Content Body */}
                <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) minmax(320px, 1.4fr) minmax(260px, 1fr)', gap: '20px' }}>
                  
                  {/* Column 1: Seller Profile & Quick Contact */}
                  <div style={{ borderRight: '1px solid #F1F5F9', paddingRight: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                          {lead.name || lead.sellerName || 'Anonymous Seller'}
                        </h4>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: '#F1F5F9', color: '#475569' }}>
                          {lead.sellerType || 'Owner'}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B' }}>
                        Preferred Contact: <strong>{lead.preferredContactMethod || 'Phone Call'}</strong> {lead.bestTimeToContact ? `(${lead.bestTimeToContact})` : ''}
                      </p>
                    </div>

                    {/* Direct Contact Triggers */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {/* Phone / WhatsApp */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <a
                          href={`tel:${lead.mobile}`}
                          style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '7px 12px',
                            borderRadius: '6px',
                            backgroundColor: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            color: '#0F172A',
                            textDecoration: 'none',
                          }}
                        >
                          <Phone size={14} style={{ color: '#059669' }} />
                          <span>{lead.mobile}</span>
                        </a>

                        <a
                          href={`https://wa.me/91${(lead.mobile || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${lead.name || ''}, regarding your property posting for "${lead.title || lead.propertyType || 'property'}" on TheNexopp:`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Chat on WhatsApp"
                          style={{
                            padding: '7px 12px',
                            borderRadius: '6px',
                            backgroundColor: '#25D366',
                            color: '#FFFFFF',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <MessageSquare size={14} />
                          <span>WhatsApp</span>
                        </a>
                      </div>

                      {/* Email */}
                      {lead.email && (
                        <a
                          href={`mailto:${lead.email}?subject=${encodeURIComponent(`Regarding your property listing on TheNexopp: ${lead.title || ''}`)}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            backgroundColor: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            color: '#475569',
                            textDecoration: 'none',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <Mail size={13} style={{ color: '#2563EB' }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{lead.email}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Column 2: Property Overview & Details */}
                  <div style={{ borderRight: '1px solid #F1F5F9', paddingRight: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {lead.propertyType || 'Property'}
                        </span>
                      </div>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.3 }}>
                        {lead.title || `${lead.propertyType || 'Property'} in ${lead.locality || lead.city || 'Prime Location'}`}
                      </h4>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={13} style={{ color: '#DC2626' }} />
                        <span>{lead.locality ? `${lead.locality}, ` : ''}<strong>{lead.city || 'AP / Telangana'}</strong> {lead.pincode ? `- ${lead.pincode}` : ''}</span>
                      </p>
                    </div>

                    {/* Price Tag */}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', backgroundColor: '#F0FDF4', padding: '6px 12px', borderRadius: '6px', border: '1px solid #DCFCE7' }}>
                      <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#166534' }}>
                        {lead.priceDisplay || formatPrice(lead.expectedPrice)}
                      </span>
                      {lead.isPriceNegotiable && (
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#059669', backgroundColor: '#DCFCE7', padding: '1px 6px', borderRadius: '4px' }}>
                          Negotiable
                        </span>
                      )}
                    </div>

                    {/* Description preview if present */}
                    {lead.description && (
                      <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {lead.description}
                      </p>
                    )}
                  </div>

                  {/* Column 3: Lossless Photos Preview & Quick Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <ImageIcon size={14} style={{ color: '#059669' }} />
                          <span>Property Photos ({photosCount})</span>
                        </span>
                        {photosCount >= 6 && (
                          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#059669', backgroundColor: '#ECFDF5', padding: '2px 6px', borderRadius: '4px' }}>
                            6+ Uploaded
                          </span>
                        )}
                      </div>

                      {/* Photo Thumbnails Strip */}
                      {photosCount === 0 ? (
                        <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px dashed #CBD5E1', textAlign: 'center', fontSize: '0.78rem', color: '#94A3B8' }}>
                          No photos attached
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                          {lead.photos?.slice(0, 4).map((p, idx) => {
                            const pUrl = getPhotoUrl(p);
                            return (
                              <div
                                key={idx}
                                onClick={() => setPreviewPhoto(pUrl)}
                                style={{
                                  position: 'relative',
                                  aspectRatio: '1',
                                  borderRadius: '6px',
                                  overflow: 'hidden',
                                  border: '1px solid #E2E8F0',
                                  cursor: 'pointer',
                                  backgroundColor: '#F1F5F9',
                                }}
                              >
                                <img
                                  src={pUrl}
                                  alt="Spec"
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                {idx === 3 && photosCount > 4 && (
                                  <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 800 }}>
                                    +{photosCount - 4}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <AdminButton
                        variant="primary"
                        size="sm"
                        icon={<Eye size={14} />}
                        onClick={() => {
                          setSelectedLead(lead);
                          setActiveModalTab('details');
                        }}
                        style={{ width: '100%', justifyContent: 'center' }}
                      >
                        Inspect Details & Photos
                      </AdminButton>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <AdminButton
                          variant="outline"
                          size="sm"
                          icon={<Download size={13} />}
                          onClick={() => handleDownloadAllPhotos(lead)}
                          disabled={photosCount === 0 || downloadingAll}
                          style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem' }}
                        >
                          Download All ({photosCount})
                        </AdminButton>

                        <button
                          type="button"
                          onClick={() => handleDeleteLead(lead.id, lead.title || lead.name || '')}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1px solid #FECACA',
                            backgroundColor: '#FEF2F2',
                            color: '#DC2626',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          title="Delete Lead"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── COMPREHENSIVE LEAD DETAILS & ORIGINAL PHOTO DOWNLOAD MODAL ──────── */}
      {selectedLead && (
        <AdminModal
          isOpen={!!selectedLead}
          onClose={() => setSelectedLead(null)}
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                {selectedLead.title || selectedLead.propertyType || 'Property Posting'}
              </span>
              {getStatusBadge(selectedLead.status)}
            </div>
          }
          subtitle={`Lead ID: #LEAD-${selectedLead.id.toUpperCase()} • Submitted by ${selectedLead.name || selectedLead.sellerName || 'Owner'} (${selectedLead.mobile})`}
          maxWidth="6xl"
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Change Status:</span>
                <select
                  value={statusInput}
                  onChange={e => setStatusInput(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    outline: 'none',
                  }}
                >
                  <option value="PENDING_REVIEW">Pending Review</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="IN_VERIFICATION">In Verification</option>
                  <option value="APPROVED">Approved & Listed</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AdminButton
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedLead(null)}
                >
                  Close
                </AdminButton>
                <AdminButton
                  variant="primary"
                  size="sm"
                  icon={<Check size={15} />}
                  onClick={handleSaveLeadReview}
                  loading={isUpdatingStatus}
                >
                  Save Notes & Status
                </AdminButton>
              </div>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Modal Internal Navigation Tabs */}
            <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px' }}>
              {[
                { id: 'details', label: 'Property Overview & Details', icon: <Building2 size={15} /> },
                { id: 'photos', label: `Original Photos (${selectedLead.photos?.length || 0})`, icon: <ImageIcon size={15} /> },
                { id: 'seller', label: 'Seller & Contact Info', icon: <Phone size={15} /> },
                { id: 'adminNotes', label: 'Admin Follow-up Notes', icon: <FileText size={15} /> },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveModalTab(tab.id as any)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: activeModalTab === tab.id ? 700 : 600,
                    color: activeModalTab === tab.id ? '#059669' : '#64748B',
                    backgroundColor: activeModalTab === tab.id ? '#ECFDF5' : 'transparent',
                    border: activeModalTab === tab.id ? '1px solid #A7F3D0' : '1px solid transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* TAB 1: DETAILS & DESCRIPTION */}
            {activeModalTab === 'details' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Core Details Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Property Purpose</span>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>For {selectedLead.propertyPurpose || 'Sale'}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Property Type</span>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>{selectedLead.propertyType || 'Residential'}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Expected Price</span>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
                      {selectedLead.priceDisplay || formatPrice(selectedLead.expectedPrice)}
                      {selectedLead.isPriceNegotiable ? ' (Negotiable)' : ''}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>City & Locality</span>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                      {selectedLead.locality ? `${selectedLead.locality}, ` : ''}{selectedLead.city || 'AP/Telangana'}
                    </div>
                  </div>
                  {selectedLead.address && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Address / Landmark</span>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>
                        {selectedLead.address} {selectedLead.pincode ? `- ${selectedLead.pincode}` : ''}
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
                    Seller Description / Notes
                  </h4>
                  <div style={{ padding: '14px 16px', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: '0.88rem', color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {selectedLead.description || 'No additional description provided by the seller.'}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ORIGINAL PHOTOS & LOSSLESS DOWNLOADS */}
            {activeModalTab === 'photos' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Banner Guarantee */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', padding: '16px 20px', backgroundColor: '#F0FDF4', borderRadius: '10px', border: '1px solid #BBF7D0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#14532D' }}>
                        100% Original Resolution & Lossless Clarity Guarantee
                      </h4>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#166534' }}>
                        All photos uploaded by the seller are preserved with exact original pixel dimensions without lossy compression. Download individual photos or batch download all photos below.
                      </p>
                    </div>
                  </div>

                  <AdminButton
                    variant="primary"
                    size="sm"
                    icon={<Download size={15} />}
                    onClick={() => handleDownloadAllPhotos(selectedLead)}
                    loading={downloadingAll}
                    disabled={!selectedLead.photos || selectedLead.photos.length === 0}
                  >
                    Download All ({selectedLead.photos?.length || 0}) Photos
                  </AdminButton>
                </div>

                {/* Photos Grid */}
                {(!selectedLead.photos || selectedLead.photos.length === 0) ? (
                  <AdminEmptyState
                    icon={<ImageIcon size={36} />}
                    title="No photos uploaded for this property"
                    description="The seller submitted this lead without photos."
                  />
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                    {selectedLead.photos.map((photo, idx) => {
                      const photoUrl = getPhotoUrl(photo);
                      const isCover = getPhotoCover(photo);
                      const photoName = getPhotoName(photo, idx);
                      const ext = photoUrl.split('.').pop() || 'jpg';
                      const cleanTitle = (selectedLead.title || 'property').replace(/[^a-zA-Z0-9]/g, '_');
                      const dlName = `${cleanTitle}_photo_${idx + 1}_${isCover ? 'cover' : 'spec'}.${ext}`;

                      return (
                        <div
                          key={idx}
                          style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: '10px',
                            border: '1px solid #E2E8F0',
                            overflow: 'hidden',
                            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                            display: 'flex',
                            flexDirection: 'column',
                          }}
                        >
                          {/* Image Thumbnail Container */}
                          <div
                            style={{
                              position: 'relative',
                              aspectRatio: '4/3',
                              backgroundColor: '#0F172A',
                              cursor: 'pointer',
                              overflow: 'hidden',
                            }}
                            onClick={() => setPreviewPhoto(photoUrl)}
                          >
                            <img
                              src={photoUrl}
                              alt={`Photo ${idx + 1}`}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.2s' }}
                              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                            />
                            {isCover && (
                              <span style={{ position: 'absolute', top: '8px', left: '8px', padding: '3px 8px', borderRadius: '4px', backgroundColor: '#059669', color: '#FFFFFF', fontSize: '0.7rem', fontWeight: 800 }}>
                                Primary Cover Photo
                              </span>
                            )}
                            <div style={{ position: 'absolute', bottom: '8px', right: '8px', padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(0,0,0,0.6)', color: '#FFFFFF', fontSize: '0.68rem', fontWeight: 700 }}>
                              Photo #{idx + 1}
                            </div>
                          </div>

                          {/* Image Footer with Download Button */}
                          <div style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', backgroundColor: '#F8FAFC' }}>
                            <div style={{ overflow: 'hidden' }}>
                              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                {photoName}
                              </div>
                              <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                                Original Lossless Quality
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => downloadOriginalPhoto(photoUrl, dlName)}
                              style={{
                                padding: '6px 10px',
                                borderRadius: '6px',
                                backgroundColor: '#059669',
                                color: '#FFFFFF',
                                border: 'none',
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                whiteSpace: 'nowrap',
                                transition: 'background-color 0.15s',
                              }}
                              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#047857'}
                              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#059669'}
                              title="Download in Exact Clarity"
                            >
                              <Download size={13} />
                              <span>Download</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: SELLER & CONTACT INFO */}
            {activeModalTab === 'seller' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '20px', borderRadius: '10px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>
                        {selectedLead.name || selectedLead.sellerName || 'Anonymous Seller'}
                      </h3>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: '#64748B' }}>
                        Registered as <strong>{selectedLead.sellerType || 'Property Owner'}</strong>
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <a
                        href={`tel:${selectedLead.mobile}`}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          backgroundColor: '#059669',
                          color: '#FFFFFF',
                          fontSize: '0.84rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Phone size={15} /> Call Seller ({selectedLead.mobile})
                      </a>

                      <a
                        href={`https://wa.me/91${(selectedLead.mobile || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${selectedLead.name || ''}, regarding your property listing on TheNexopp:`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          backgroundColor: '#25D366',
                          color: '#FFFFFF',
                          fontSize: '0.84rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <MessageSquare size={15} /> WhatsApp
                      </a>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>Primary Mobile Number</span>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>{selectedLead.mobile}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>Email Address</span>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>{selectedLead.email || 'Not Provided'}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>Preferred Contact Channel</span>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>{selectedLead.preferredContactMethod || 'Phone Call'}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>Best Time to Reach</span>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>{selectedLead.bestTimeToContact || 'Anytime during working hours'}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: ADMIN NOTES */}
            {activeModalTab === 'adminNotes' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>
                  Log internal verification notes, negotiation remarks, verified title deed details, or scheduled physical visit dates.
                </p>

                <textarea
                  rows={5}
                  value={adminNotesInput}
                  onChange={e => setAdminNotesInput(e.target.value)}
                  placeholder="e.g., Called seller on 5th Sep. Clear title, verified ownership. Scheduled site visit on Saturday..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.88rem',
                    color: '#0F172A',
                    fontFamily: 'inherit',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>
            )}

          </div>
        </AdminModal>
      )}

      {/* ── FULL SCREEN LIGHTBOX IMAGE PREVIEW ───────────────────────────── */}
      {previewPhoto && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000000,
            backgroundColor: 'rgba(10, 15, 29, 0.92)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
          onClick={() => setPreviewPhoto(null)}
        >
          <div style={{ position: 'absolute', top: '20px', right: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AdminButton
              variant="primary"
              size="sm"
              icon={<Download size={15} />}
              onClick={(e) => {
                e.stopPropagation();
                downloadOriginalPhoto(previewPhoto);
              }}
            >
              Download Original Clarity
            </AdminButton>
            <button
              type="button"
              onClick={() => setPreviewPhoto(null)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>
          </div>

          <img
            src={previewPhoto}
            alt="Full Preview"
            style={{
              maxWidth: '90vw',
              maxHeight: '85vh',
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

    </div>
  );
};
