import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminApiService, API_BASE_URL } from '../services/api';
import { AgentSummary, AgentStatus, PropertyListing } from '../types';
import { ImageLightbox } from '../components/ImageLightbox';
import {
  CheckCircle2,
  AlertTriangle,
  Search,
  Radio,
  RefreshCw,
  XCircle,
  Building2,
  ExternalLink,
  MapPin,
  Clock,
  Layers,
  Phone,
  Eye,
  EyeOff,
  Layers3,
  Trash2,
  Edit3,
  Save,
  Download,
  FolderDown,
  ChevronLeft,
  ChevronRight,
  User,
  ShieldCheck,
  CreditCard,
  FileText,
  Check,
  Copy,
  ZoomIn,
  Image as ImageIcon,
  UserCheck,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from 'lucide-react';
import JSZip from 'jszip';
import { adminSocket } from '../services/websocket';
import { Modal } from '../components/Modal';

export const Agents: React.FC = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<AgentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  // Rejection modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [pendingStatus, setPendingStatus] = useState<AgentStatus | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Agent Listings Modal State
  const [selectedAgentForListings, setSelectedAgentForListings] = useState<AgentSummary | null>(null);
  const [agentProperties, setAgentProperties] = useState<PropertyListing[]>([]);
  const [loadingAgentProperties, setLoadingAgentProperties] = useState(false);

  // Property Inspector Modal State
  const [inspectProperty, setInspectProperty] = useState<PropertyListing | null>(null);

  // Lightbox Modal State
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxTitle, setLightboxTitle] = useState('');

  // Keyboard Navigation for Lightbox
  useEffect(() => {
    if (lightboxImages.length === 0) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxImages([]);
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev > 0 ? prev - 1 : lightboxImages.length - 1));
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev < lightboxImages.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxImages.length]);

  // Aadhaar & PAN Reveal States
  const [revealedAadhaar, setRevealedAadhaar] = useState<Record<string, boolean>>({});
  const [revealedPan, setRevealedPan] = useState<Record<string, boolean>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Photo Download State
  const [downloadingPropertyId, setDownloadingPropertyId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<string>('');

  // Edit Partner State
  const [editingAgent, setEditingAgent] = useState<AgentSummary | null>(null);
  const [editForm, setEditForm] = useState({
    fullName: '',
    mobileNumber: '',
    areaLocation: '',
    workPlatform: '',
    age: '',
    gender: '',
    status: 'APPROVED',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchAgents();

    // Listen to real-time events
    const handleStatusUpdate = () => {
      fetchAgents();
    };

    adminSocket.on('agent.status.updated', handleStatusUpdate);
    adminSocket.on('kyc.status.updated', handleStatusUpdate);

    return () => {
      adminSocket.off('agent.status.updated', handleStatusUpdate);
      adminSocket.off('kyc.status.updated', handleStatusUpdate);
    };
  }, [filterStatus]);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const statusParam = filterStatus === 'ALL' ? undefined : (filterStatus as AgentStatus);
      const res = await AdminApiService.getAgents(statusParam);
      if (res.success) {
        setAgents(res.data);
      }
    } catch (_) {}
    setLoading(false);
  };

  const resolveImageUrl = (keyOrUrl?: string | null, bucket: string = 'private-kyc') => {
    if (!keyOrUrl) return null;
    if (keyOrUrl.startsWith('http://') || keyOrUrl.startsWith('https://') || keyOrUrl.startsWith('data:image/')) {
      return keyOrUrl;
    }
    return `${API_BASE_URL}/uploads/local-mock-view?key=${encodeURIComponent(keyOrUrl)}&bucket=${bucket}`;
  };

  const handleCopy = (text: string, fieldId: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const openLightbox = (images: string[], index = 0, title = 'Photo Preview') => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxTitle(title);
  };

  const getCleanExtension = (img: { imageKey?: string; url?: string | null }, blob?: Blob) => {
    if (img.imageKey && img.imageKey.includes('.')) {
      const ext = img.imageKey.split('.').pop()?.toLowerCase();
      if (ext && ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif'].includes(ext)) {
        return ext === 'jpeg' ? 'jpg' : ext;
      }
    }
    if (img.url) {
      const keyMatch = img.url.match(/key=([^&]+)/i);
      if (keyMatch && keyMatch[1] && keyMatch[1].includes('.')) {
        const ext = keyMatch[1].split('.').pop()?.toLowerCase();
        if (ext && ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif'].includes(ext)) {
          return ext === 'jpeg' ? 'jpg' : ext;
        }
      }
      const dotMatch = img.url.split('?')[0].match(/\.([a-zA-Z0-9]+)$/);
      if (dotMatch && dotMatch[1] && ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif'].includes(dotMatch[1].toLowerCase())) {
        return dotMatch[1].toLowerCase() === 'jpeg' ? 'jpg' : dotMatch[1].toLowerCase();
      }
    }
    if (blob && blob.type) {
      if (blob.type.includes('png')) return 'png';
      if (blob.type.includes('webp')) return 'webp';
      if (blob.type.includes('avif')) return 'avif';
      if (blob.type.includes('gif')) return 'gif';
    }
    return 'jpg';
  };

  const downloadSinglePhoto = async (url: string, defaultFilename?: string) => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Fetch failed');
      const blob = await res.blob();
      const ext = getCleanExtension({ url }, blob);
      const cleanName = defaultFilename ? (defaultFilename.includes('.') ? defaultFilename : `${defaultFilename}.${ext}`) : `Photo_${Date.now()}.${ext}`;
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = cleanName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (_) {
      window.open(url, '_blank');
    }
  };

  const downloadAllPropertyPhotosZip = async (prop: PropertyListing) => {
    const images = prop.images?.filter((img) => !!img.url) || [];
    if (images.length === 0) {
      alert('No photos available for this property.');
      return;
    }

    setDownloadingPropertyId(prop.id);
    setDownloadProgress(`Packing 0/${images.length}...`);

    try {
      const zip = new JSZip();
      const cleanTitle = (prop.title || 'Property')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .substring(0, 30);

      let addedCount = 0;
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        setDownloadProgress(`Downloading photo ${i + 1}/${images.length}...`);
        try {
          const res = await fetch(img.url!);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const blob = await res.blob();
          if (blob.size > 0 && !blob.type.includes('text') && !blob.type.includes('html')) {
            const ext = getCleanExtension(img, blob);
            const fileName = `Photo_${i + 1}${img.isPrimary ? '_PRIMARY' : ''}.${ext}`;
            zip.file(fileName, blob, { binary: true });
            addedCount++;
          }
        } catch (err) {
          console.error('Failed to fetch image for zip', err);
        }
      }

      if (addedCount === 0) {
        alert('Could not download image files for this property.');
        return;
      }

      setDownloadProgress('Generating ZIP archive...');
      const content = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });
      const zipUrl = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = zipUrl;
      link.download = `${cleanTitle}_Photos.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(zipUrl);
    } catch (err) {
      console.error('Zip generation error', err);
      alert('Failed to generate ZIP archive. Opening photos individually.');
    } finally {
      setDownloadingPropertyId(null);
      setDownloadProgress('');
    }
  };

  const downloadLightboxPhotosZip = async () => {
    if (inspectProperty) {
      await downloadAllPropertyPhotosZip(inspectProperty);
      return;
    }
    if (lightboxImages.length === 0) return;
    setDownloadingPropertyId('lightbox');
    setDownloadProgress(`Packing 0/${lightboxImages.length}...`);
    try {
      const zip = new JSZip();
      const cleanTitle = (lightboxTitle || 'Property').replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
      let addedCount = 0;
      for (let i = 0; i < lightboxImages.length; i++) {
        const url = lightboxImages[i];
        setDownloadProgress(`Downloading photo ${i + 1}/${lightboxImages.length}...`);
        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const blob = await res.blob();
          if (blob.size > 0 && !blob.type.includes('text') && !blob.type.includes('html')) {
            const ext = getCleanExtension({ url }, blob);
            zip.file(`Photo_${i + 1}.${ext}`, blob, { binary: true });
            addedCount++;
          }
        } catch (e) {
          console.error(e);
        }
      }
      if (addedCount === 0) {
        alert('Could not download image files.');
        return;
      }
      setDownloadProgress('Generating ZIP archive...');
      const content = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });
      const zipUrl = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = zipUrl;
      link.download = `${cleanTitle}_Photos.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(zipUrl);
    } catch (err) {
      console.error(err);
      alert('Failed to generate ZIP archive.');
    } finally {
      setDownloadingPropertyId(null);
      setDownloadProgress('');
    }
  };

  const handleAction = (agentId: string, status: AgentStatus) => {
    if (status === 'REJECTED' || status === 'SUSPENDED') {
      setSelectedAgentId(agentId);
      setPendingStatus(status);
      setRejectionReason('');
      setModalOpen(true);
    } else {
      executeStatusUpdate(agentId, status);
    }
  };

  const executeStatusUpdate = async (agentId: string, status: AgentStatus, reason?: string) => {
    try {
      await AdminApiService.updateAgentStatus(agentId, status, reason);
      setModalOpen(false);
      fetchAgents();
    } catch (e: any) {
      alert(e.message || 'Status update failed');
    }
  };

  const handleOpenEdit = (agent: AgentSummary) => {
    setEditingAgent(agent);
    setEditForm({
      fullName: agent.fullName || '',
      mobileNumber: agent.mobileNumber || '',
      areaLocation: agent.areaLocation || '',
      workPlatform: agent.workPlatform || '',
      age: agent.age ? String(agent.age) : '21',
      gender: agent.gender || 'Male',
      status: agent.status || 'APPROVED',
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAgent) return;
    setIsSaving(true);
    try {
      await AdminApiService.updateAgent(editingAgent.id, {
        fullName: editForm.fullName,
        mobileNumber: editForm.mobileNumber,
        areaLocation: editForm.areaLocation,
        workPlatform: editForm.workPlatform,
        age: editForm.age,
        gender: editForm.gender,
        status: editForm.status,
      });
      setEditingAgent(null);
      await fetchAgents();
    } catch (err: any) {
      alert(err.message || 'Failed to update agent details');
    }
    setIsSaving(false);
  };

  const handleDeleteAgent = async (agentId: string, name?: string | null) => {
    if (!window.confirm(`⚠️ Permanently delete agent ${name || 'partner'} and ALL their listings, KYC records, and transactions?\nThis cannot be undone.`)) {
      return;
    }
    try {
      await AdminApiService.deleteAgent(agentId);
      if (selectedAgentForListings?.id === agentId) {
        setSelectedAgentForListings(null);
      }
      await fetchAgents();
    } catch (err: any) {
      alert(err.message || 'Failed to delete agent');
    }
  };

  // Open Agent Listings
  const handleOpenAgentListings = async (agent: AgentSummary) => {
    setSelectedAgentForListings(agent);
    setLoadingAgentProperties(true);
    try {
      const res = await AdminApiService.getProperties({ agentId: agent.id });
      if (res.success) {
        setAgentProperties(res.data);
      }
    } catch (_) {}
    setLoadingAgentProperties(false);
  };

  const handleReviewPropertyFromModal = async (propertyId: string, approve: boolean) => {
    let reason: string | undefined = undefined;
    let commission: number | undefined = undefined;

    if (!approve) {
      reason = prompt('Enter rejection reason:') || 'Property criteria not met';
    } else {
      const input = prompt('Enter Agent Commission Amount (₹) for this Approved Property:', '60');
      if (input === null) return; // Cancelled
      commission = Number(input) || 60;
    }

    try {
      await AdminApiService.reviewProperty(propertyId, approve, reason, commission);
      if (selectedAgentForListings) {
        handleOpenAgentListings(selectedAgentForListings);
      }
      if (inspectProperty && inspectProperty.id === propertyId) {
        setInspectProperty((prev) => prev ? { ...prev, status: approve ? 'APPROVED' : 'REJECTED', commissionAmount: commission } : null);
      }
      fetchAgents();
    } catch (e: any) {
      alert(e.message || 'Property review action failed');
    }
  };

  // Sorting State
  const [sortField, setSortField] = useState<'date' | 'listings' | 'approvedListings' | 'name' | 'paid' | 'status'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedAgents = React.useMemo(() => {
    const list = agents.filter((a) => {
      const nameMatch = (a.fullName || '').toLowerCase().includes(search.toLowerCase());
      const phoneMatch = (a.mobileNumber || '').includes(search);
      const areaMatch = (a.areaLocation || '').toLowerCase().includes(search.toLowerCase());
      return nameMatch || phoneMatch || areaMatch;
    });

    return list.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = (a.fullName || '').localeCompare(b.fullName || '');
      } else if (sortField === 'listings') {
        comparison = (a.totalProperties || 0) - (b.totalProperties || 0);
      } else if (sortField === 'approvedListings') {
        comparison = (a.approvedProperties || 0) - (b.approvedProperties || 0);
      } else if (sortField === 'paid') {
        comparison = (a.totalPaid || 0) - (b.totalPaid || 0);
      } else if (sortField === 'status') {
        comparison = (a.status || '').localeCompare(b.status || '');
      } else if (sortField === 'date') {
        comparison = new Date(a.createdAt || a.submittedAt || 0).getTime() - new Date(b.createdAt || b.submittedAt || 0).getTime();
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [agents, search, sortField, sortDirection]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Agents & Human Partners</h2>
            <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              <Radio className="h-3 w-3 animate-pulse text-emerald-600" />
              <span>Live Socket Stream</span>
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Click any agent to inspect their full property portfolio, performance stats, and payout history
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Sort Selector */}
          <div className="flex items-center space-x-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
            <ArrowUpDown className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="text-xs font-bold text-slate-500 hidden sm:inline">Sort:</span>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as any)}
              className="bg-transparent text-xs font-bold text-slate-800 border-none focus:outline-none cursor-pointer pr-1"
            >
              <option value="date">Registration Date</option>
              <option value="listings">Total Listings</option>
              <option value="approvedListings">Approved Listings</option>
              <option value="paid">Money Transferred (₹)</option>
              <option value="name">Agent Name</option>
              <option value="status">Account Status</option>
            </select>
            <button
              onClick={() => setSortDirection((d) => (d === 'desc' ? 'asc' : 'desc'))}
              className="p-1 hover:bg-slate-100 rounded text-emerald-600 transition-colors"
              title="Toggle Ascending/Descending"
            >
              {sortDirection === 'desc' ? <ArrowDown className="h-3.5 w-3.5" /> : <ArrowUp className="h-3.5 w-3.5" />}
            </button>
          </div>

          <button
            onClick={fetchAgents}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm"
            title="Refresh Table"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 w-56 shadow-sm"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 shadow-sm"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {/* Quick Status Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setFilterStatus('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filterStatus === 'ALL'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Agents ({agents.length})
        </button>
        <button
          onClick={() => setFilterStatus('PENDING_APPROVAL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filterStatus === 'PENDING_APPROVAL'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
          }`}
        >
          Pending Approval ({agents.filter((a) => a.status === 'PENDING_APPROVAL').length})
        </button>
        <button
          onClick={() => setFilterStatus('APPROVED')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filterStatus === 'APPROVED'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
          }`}
        >
          Approved ({agents.filter((a) => a.status === 'APPROVED').length})
        </button>
        <button
          onClick={() => setFilterStatus('REJECTED')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filterStatus === 'REJECTED'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
          }`}
        >
          Rejected ({agents.filter((a) => a.status === 'REJECTED').length})
        </button>
        <button
          onClick={() => setFilterStatus('SUSPENDED')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filterStatus === 'SUSPENDED'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-white text-purple-700 border border-purple-200 hover:bg-purple-50'
          }`}
        >
          Suspended ({agents.filter((a) => a.status === 'SUSPENDED').length})
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto shadow-sm">
        <table className="w-full text-left text-sm min-w-[1100px]">
          <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th
                className="p-4 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                onClick={() => {
                  if (sortField === 'name') {
                    setSortDirection((d) => (d === 'desc' ? 'asc' : 'desc'));
                  } else {
                    setSortField('name');
                    setSortDirection('asc');
                  }
                }}
              >
                <div className="flex items-center space-x-1.5">
                  <span>Agent Name</span>
                  {sortField === 'name' ? (
                    sortDirection === 'desc' ? <ArrowDown className="h-3.5 w-3.5 text-emerald-600" /> : <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                  )}
                </div>
              </th>
              <th className="p-4 whitespace-nowrap">Mobile & Area</th>
              <th
                className="p-4 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                onClick={() => {
                  if (sortField === 'listings') {
                    setSortDirection((d) => (d === 'desc' ? 'asc' : 'desc'));
                  } else {
                    setSortField('listings');
                    setSortDirection('desc');
                  }
                }}
              >
                <div className="flex items-center space-x-1.5">
                  <span>Listings Performance</span>
                  {sortField === 'listings' ? (
                    sortDirection === 'desc' ? <ArrowDown className="h-3.5 w-3.5 text-emerald-600" /> : <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                  )}
                </div>
              </th>
              <th
                className="p-4 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                onClick={() => {
                  if (sortField === 'paid') {
                    setSortDirection((d) => (d === 'desc' ? 'asc' : 'desc'));
                  } else {
                    setSortField('paid');
                    setSortDirection('desc');
                  }
                }}
              >
                <div className="flex items-center space-x-1.5">
                  <span>Money Transferred (₹)</span>
                  {sortField === 'paid' ? (
                    sortDirection === 'desc' ? <ArrowDown className="h-3.5 w-3.5 text-emerald-600" /> : <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                  )}
                </div>
              </th>
              <th className="p-4 whitespace-nowrap">KYC State</th>
              <th
                className="p-4 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                onClick={() => {
                  if (sortField === 'status') {
                    setSortDirection((d) => (d === 'desc' ? 'asc' : 'desc'));
                  } else {
                    setSortField('status');
                    setSortDirection('asc');
                  }
                }}
              >
                <div className="flex items-center space-x-1.5">
                  <span>Account Status</span>
                  {sortField === 'status' ? (
                    sortDirection === 'desc' ? <ArrowDown className="h-3.5 w-3.5 text-emerald-600" /> : <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                  )}
                </div>
              </th>
              <th className="p-4 text-right whitespace-nowrap min-w-[240px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">Loading live agents database...</td>
              </tr>
            ) : filteredAndSortedAgents.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">No agents found matching criteria.</td>
              </tr>
            ) : (
              filteredAndSortedAgents.map((agent) => (
                <tr
                  key={agent.id}
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  onClick={() => handleOpenAgentListings(agent)}
                >
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      {agent.profilePhotoUrl ? (
                        <img
                          src={agent.profilePhotoUrl}
                          alt={agent.fullName || 'Agent'}
                          className="h-10 w-10 rounded-xl object-cover border border-slate-200 shadow-sm"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-xl bg-slate-100 group-hover:bg-emerald-100 group-hover:text-emerald-800 text-slate-700 font-extrabold flex items-center justify-center text-xs transition-colors border border-slate-200">
                          {agent.fullName ? agent.fullName.charAt(0).toUpperCase() : 'A'}
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-slate-900 group-hover:text-emerald-700 block transition-colors">
                          {agent.fullName || 'Unfilled Profile'}
                        </span>
                        <span className="text-xs text-slate-400">ID: {agent.id.substring(0, 8)}...</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <div className="text-slate-900 font-semibold">+91 {agent.mobileNumber}</div>
                    <div className="text-xs text-slate-500">{agent.areaLocation || 'N/A'} • {agent.workPlatform || 'Individual'}</div>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenAgentListings(agent);
                        }}
                        className="font-extrabold text-slate-900 text-sm hover:underline flex items-center space-x-1"
                      >
                        <Building2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>{agent.totalListings || 0} Total</span>
                      </button>
                      <span className="text-slate-300">•</span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200" title="Accepted / Approved">
                        {agent.acceptedListings || 0} Accepted
                      </span>
                      {(agent.rejectedListings || 0) > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200" title="Rejected">
                          {agent.rejectedListings} Rejected
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <div className="font-extrabold text-emerald-700 text-base">
                      ₹{Number(agent.totalPaid || 0).toLocaleString('en-IN')}
                    </div>
                    {(agent.pendingEarnings || 0) > 0 && (
                      <div className="text-[11px] text-amber-600 font-semibold">
                        ₹{Number(agent.pendingEarnings).toLocaleString('en-IN')} Pending
                      </div>
                    )}
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      agent.kycStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      agent.kycStatus === 'REJECTED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {agent.kycStatus}
                    </span>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      agent.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      agent.status === 'PENDING_APPROVAL' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                      agent.status === 'SUSPENDED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {agent.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-1.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleOpenAgentListings(agent)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors inline-flex items-center space-x-1"
                      title="View all properties by this agent"
                    >
                      <Building2 className="h-3 w-3" />
                      <span>Listings</span>
                    </button>
                    {agent.status !== 'APPROVED' && (
                      <button
                        onClick={() => handleAction(agent.id, 'APPROVED')}
                        className="px-3 py-1.5 bg-emerald-600 text-white font-semibold rounded-lg text-xs hover:bg-emerald-700 transition-colors shadow-sm"
                      >
                        Approve
                      </button>
                    )}
                    {agent.status !== 'SUSPENDED' && (
                      <button
                        onClick={() => handleAction(agent.id, 'SUSPENDED')}
                        className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 font-semibold rounded-lg text-xs hover:bg-rose-600 hover:text-white transition-colors"
                      >
                        Suspend
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenEdit(agent)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs border border-slate-200 transition-colors inline-flex items-center"
                      title="Edit Agent Details"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteAgent(agent.id, agent.fullName)}
                      className="p-1.5 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 rounded-lg text-xs border border-rose-200 transition-colors inline-flex items-center"
                      title="Delete Agent Partner"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Selected Agent Listings & Full KYC Documents Modal */}
      {selectedAgentForListings && (
        <Modal
          isOpen={!!selectedAgentForListings}
          onClose={() => setSelectedAgentForListings(null)}
          title={`Partner Profile & Property Portfolio — ${selectedAgentForListings.fullName || 'Agent'}`}
          maxWidth="max-w-4xl"
        >
          <div className="space-y-6">
            {/* Agent Summary Banner with Fixed Responsive Badges */}
            <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4 min-w-0">
                  {selectedAgentForListings.profilePhotoUrl ? (
                    <img
                      src={resolveImageUrl(selectedAgentForListings.profilePhotoUrl, 'private-kyc') || selectedAgentForListings.profilePhotoUrl}
                      alt={selectedAgentForListings.fullName || 'Agent'}
                      onClick={() => {
                        const url = resolveImageUrl(selectedAgentForListings.profilePhotoUrl, 'private-kyc') || selectedAgentForListings.profilePhotoUrl;
                        if (url) openLightbox([url], 0, `${selectedAgentForListings.fullName || 'Agent'} — Profile Photo`);
                      }}
                      className="h-16 w-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-md cursor-pointer hover:scale-105 transition-transform shrink-0"
                      title="Click to view full photo"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-extrabold flex items-center justify-center text-xl shadow-md shrink-0">
                      {selectedAgentForListings.fullName ? selectedAgentForListings.fullName.charAt(0).toUpperCase() : 'A'}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-extrabold text-lg text-slate-900 truncate">
                        {selectedAgentForListings.fullName || 'Agent Partner'}
                      </h3>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                        ID: {selectedAgentForListings.id.substring(0, 8)}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 flex flex-wrap items-center gap-2 mt-1 font-medium">
                      <span className="flex items-center space-x-1 text-slate-900 font-bold">
                        <Phone className="h-3.5 w-3.5 text-emerald-600 inline" />
                        <span>+91 {selectedAgentForListings.mobileNumber}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1 text-slate-700">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 inline" />
                        <span>{selectedAgentForListings.areaLocation || 'Andhra Pradesh'}</span>
                      </span>
                      <span>•</span>
                      <span className="text-slate-600">
                        {selectedAgentForListings.workPlatform || 'Human Agent / Partner'}
                      </span>
                      {selectedAgentForListings.age && (
                        <>
                          <span>•</span>
                          <span>{selectedAgentForListings.age} Yrs</span>
                        </>
                      )}
                      {selectedAgentForListings.gender && (
                        <>
                          <span>•</span>
                          <span>{selectedAgentForListings.gender}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Badges Cleanly Structured Without Box Overflow */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 self-start md:self-center">
                  <span className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 shadow-2xs ${
                    selectedAgentForListings.kycStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    selectedAgentForListings.kycStatus === 'REJECTED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                    'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>KYC: {selectedAgentForListings.kycStatus}</span>
                  </span>

                  <span className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center space-x-1 shadow-2xs ${
                    selectedAgentForListings.status === 'APPROVED' ? 'bg-emerald-600 text-white border border-emerald-600' :
                    selectedAgentForListings.status === 'PENDING_APPROVAL' ? 'bg-purple-600 text-white border border-purple-600' :
                    selectedAgentForListings.status === 'SUSPENDED' ? 'bg-rose-600 text-white border border-rose-600' :
                    'bg-amber-600 text-white border border-amber-600'
                  }`}>
                    <UserCheck className="h-3.5 w-3.5" />
                    <span>{selectedAgentForListings.status}</span>
                  </span>
                </div>
              </div>

              {/* Complete Identity Documents & Bank Details Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200/80 text-xs">
                {/* Aadhaar & PAN Identity Section */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center space-x-1.5">
                      <FileText className="h-4 w-4 text-emerald-600" />
                      <span className="font-bold text-slate-900 text-sm">Identity & KYC Information</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      AES-256 Encrypted
                    </span>
                  </div>

                  {/* Aadhaar Row */}
                  <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                    <div>
                      <span className="text-slate-500 font-semibold block text-[11px]">Aadhaar Card Number</span>
                      <div className="font-mono font-extrabold text-slate-900 text-sm mt-0.5 flex items-center space-x-2">
                        <span>
                          {revealedAadhaar[selectedAgentForListings.id]
                            ? (selectedAgentForListings.aadhaarFullNumber || (selectedAgentForListings.aadhaarLast4 ? `XXXX XXXX ${selectedAgentForListings.aadhaarLast4}` : '1234 5678 9012'))
                            : (selectedAgentForListings.aadhaarLast4 ? `XXXX XXXX ${selectedAgentForListings.aadhaarLast4}` : 'XXXX XXXX 9012')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setRevealedAadhaar((prev) => ({ ...prev, [selectedAgentForListings.id]: !prev[selectedAgentForListings.id] }))}
                        className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
                        title={revealedAadhaar[selectedAgentForListings.id] ? 'Mask Aadhaar' : 'Show Full Aadhaar Number'}
                      >
                        {revealedAadhaar[selectedAgentForListings.id] ? <EyeOff className="h-4 w-4 text-emerald-700" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleCopy(selectedAgentForListings.aadhaarFullNumber || selectedAgentForListings.aadhaarLast4 || '', 'aadhaar')}
                        className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
                        title="Copy Aadhaar"
                      >
                        {copiedField === 'aadhaar' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* PAN Card Row */}
                  <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                    <div>
                      <span className="text-slate-500 font-semibold block text-[11px]">PAN Card Number</span>
                      <div className="font-mono font-extrabold text-slate-900 text-sm mt-0.5">
                        {revealedPan[selectedAgentForListings.id]
                          ? (selectedAgentForListings.panFullNumber || selectedAgentForListings.panMasked || 'ABCDE1234F')
                          : (selectedAgentForListings.panMasked || 'XXXXX1234F')}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setRevealedPan((prev) => ({ ...prev, [selectedAgentForListings.id]: !prev[selectedAgentForListings.id] }))}
                        className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
                        title={revealedPan[selectedAgentForListings.id] ? 'Mask PAN' : 'Show Full PAN Number'}
                      >
                        {revealedPan[selectedAgentForListings.id] ? <EyeOff className="h-4 w-4 text-emerald-700" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleCopy(selectedAgentForListings.panFullNumber || selectedAgentForListings.panMasked || '', 'pan')}
                        className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
                        title="Copy PAN"
                      >
                        {copiedField === 'pan' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Registration Document Photos Gallery */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Partner KYC Document Photos
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {/* Aadhaar Photo */}
                      {(() => {
                        const aadhaarUrl = resolveImageUrl(selectedAgentForListings.aadhaarDocUrl || selectedAgentForListings.aadhaarDocKey, 'private-kyc');
                        return aadhaarUrl ? (
                          <div
                            onClick={() => openLightbox([aadhaarUrl], 0, `${selectedAgentForListings.fullName || 'Agent'} — Aadhaar Document`)}
                            className="relative h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group cursor-pointer shadow-xs hover:border-emerald-500 transition-all"
                          >
                            <img src={aadhaarUrl} alt="Aadhaar" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end justify-between p-1.5">
                              <span className="text-[10px] font-bold text-white flex items-center space-x-1">
                                <FileText className="h-3 w-3" />
                                <span>Aadhaar Doc</span>
                              </span>
                              <ZoomIn className="h-3.5 w-3.5 text-white/90" />
                            </div>
                          </div>
                        ) : (
                          <div className="h-20 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                            <FileText className="h-4 w-4 mb-0.5" />
                            <span className="text-[10px] font-medium">Aadhaar Photo Not Uploaded</span>
                          </div>
                        );
                      })()}

                      {/* PAN Photo */}
                      {(() => {
                        const panUrl = resolveImageUrl(selectedAgentForListings.panDocUrl || selectedAgentForListings.panDocKey, 'private-kyc');
                        return panUrl ? (
                          <div
                            onClick={() => openLightbox([panUrl], 0, `${selectedAgentForListings.fullName || 'Agent'} — PAN Card Document`)}
                            className="relative h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group cursor-pointer shadow-xs hover:border-emerald-500 transition-all"
                          >
                            <img src={panUrl} alt="PAN Card" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end justify-between p-1.5">
                              <span className="text-[10px] font-bold text-white flex items-center space-x-1">
                                <CreditCard className="h-3 w-3" />
                                <span>PAN Card Doc</span>
                              </span>
                              <ZoomIn className="h-3.5 w-3.5 text-white/90" />
                            </div>
                          </div>
                        ) : (
                          <div className="h-20 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                            <CreditCard className="h-4 w-4 mb-0.5" />
                            <span className="text-[10px] font-medium">PAN Photo Not Uploaded</span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Bank Account & Payouts Section */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center space-x-1.5">
                      <CreditCard className="h-4 w-4 text-emerald-600" />
                      <span className="font-bold text-slate-900 text-sm">Banking & Payout Channels</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      Direct Transfer
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl border border-slate-200/70">
                      <div>
                        <span className="text-slate-500 font-medium block text-[11px]">Bank Account Number</span>
                        <span className="font-mono font-extrabold text-slate-900 text-xs">
                          {selectedAgentForListings.bankAccountFullNumber || (selectedAgentForListings.bankAccountLast4 ? `•••• •••• ${selectedAgentForListings.bankAccountLast4}` : '12345678901234')}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(selectedAgentForListings.bankAccountFullNumber || selectedAgentForListings.bankAccountLast4 || '', 'bankAcc')}
                        className="p-1 hover:bg-slate-200 rounded text-slate-600"
                        title="Copy Account"
                      >
                        {copiedField === 'bankAcc' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/70">
                        <span className="text-slate-500 font-medium block text-[11px]">IFSC Code</span>
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          {selectedAgentForListings.bankIfscCode || 'SBIN0001234'}
                        </span>
                      </div>

                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/70">
                        <span className="text-slate-500 font-medium block text-[11px]">PhonePe Number</span>
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          {selectedAgentForListings.bankPhonepeNumber || selectedAgentForListings.mobileNumber || 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 flex justify-between items-center">
                      <div>
                        <span className="text-slate-500 font-medium block text-[11px]">UPI Payout ID</span>
                        <span className="font-mono font-bold text-emerald-800 text-xs truncate">
                          {selectedAgentForListings.bankUpiId || 'agent@okaxis'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(selectedAgentForListings.bankUpiId || '', 'upi')}
                        className="p-1 hover:bg-slate-200 rounded text-slate-600"
                        title="Copy UPI ID"
                      >
                        {copiedField === 'upi' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-center justify-between">
                      <span className="text-emerald-800 font-semibold text-[11px]">Total Transferred / Payouts</span>
                      <span className="font-extrabold text-emerald-700 text-sm">
                        ₹{Number(selectedAgentForListings.totalPaid || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Agent Properties Catalog */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-bold text-base text-slate-900">
                    Agent Listings Catalog ({agentProperties.length})
                  </h4>
                  <p className="text-xs text-slate-500">
                    Click any property card below to open full property details, photos, and review actions.
                  </p>
                </div>
                <div className="text-xs font-semibold text-slate-500 flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                    {agentProperties.filter((p) => p.status === 'APPROVED').length} Approved
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold border border-amber-200">
                    {agentProperties.filter((p) => p.status === 'SUBMITTED' || p.status === 'UNDER_REVIEW').length} Under Review
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-bold border border-rose-200">
                    {agentProperties.filter((p) => p.status === 'REJECTED').length} Rejected
                  </span>
                </div>
              </div>

              {loadingAgentProperties ? (
                <div className="py-12 text-center text-slate-400 text-xs">Loading agent properties...</div>
              ) : agentProperties.length === 0 ? (
                <div className="py-12 text-center text-slate-400 bg-slate-50 border border-slate-200 rounded-2xl">
                  <Building2 className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-700 text-sm">No Properties Submitted Yet</p>
                  <p className="text-xs text-slate-400 mt-0.5">This partner has not submitted any properties yet.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                  {agentProperties.map((prop) => {
                    const primaryImg = prop.images?.find((i) => i.isPrimary) || prop.images?.[0];
                    const photoCount = prop.images?.length || 0;
                    return (
                      <div
                        key={prop.id}
                        onClick={() => setInspectProperty(prop)}
                        className="bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md rounded-2xl p-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all group"
                      >
                        <div className="flex items-center space-x-3.5 min-w-0">
                          <div className="relative shrink-0">
                            {primaryImg?.url ? (
                              <img
                                src={primaryImg.url}
                                alt={prop.title}
                                className="h-20 w-20 rounded-xl object-cover border border-slate-200 group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="h-20 w-20 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                                <Building2 className="h-7 w-7" />
                              </div>
                            )}
                            {photoCount > 0 && (
                              <span className="absolute bottom-1 right-1 px-1.5 py-0.2 bg-black/75 text-white text-[10px] font-bold rounded-md flex items-center space-x-0.5">
                                <ImageIcon className="h-2.5 w-2.5 inline" />
                                <span>{photoCount}</span>
                              </span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-bold uppercase">
                                {prop.category.replace('_', ' ')}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                                  prop.status === 'APPROVED'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : prop.status === 'REJECTED'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                {prop.status}
                              </span>
                            </div>

                            <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors truncate mt-1">
                              {prop.title}
                            </h4>

                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                              <span className="font-extrabold text-emerald-700 text-sm">
                                ₹{Number(prop.price).toLocaleString('en-IN')}
                              </span>
                              <span>•</span>
                              <span className="truncate flex items-center space-x-1 text-slate-600">
                                <MapPin className="h-3.5 w-3.5 text-slate-400 inline" />
                                <span>{prop.location}</span>
                              </span>
                              <span>•</span>
                              <span className="text-[11px] text-slate-400">
                                {new Date(prop.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setInspectProperty(prop)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors inline-flex items-center space-x-1"
                          >
                            <Eye className="h-3.5 w-3.5 text-emerald-700" />
                            <span>Inspect</span>
                          </button>

                          {prop.status !== 'APPROVED' && (
                            <button
                              onClick={() => handleReviewPropertyFromModal(prop.id, true)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                            >
                              Approve
                            </button>
                          )}
                          {prop.status !== 'REJECTED' && (
                            <button
                              onClick={() => handleReviewPropertyFromModal(prop.id, false)}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors"
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Property Inspection / Details Modal */}
      {inspectProperty && (
        <Modal
          isOpen={!!inspectProperty}
          onClose={() => setInspectProperty(null)}
          title={`Property Details — ${inspectProperty.title}`}
          maxWidth="max-w-4xl"
        >
          <div className="space-y-6">
            {/* Status & Category Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 bg-slate-200 text-slate-800 rounded-lg text-xs font-bold uppercase">
                  {inspectProperty.category.replace('_', ' ')}
                </span>
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-extrabold ${
                    inspectProperty.status === 'APPROVED'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : inspectProperty.status === 'REJECTED'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {inspectProperty.status}
                </span>
                {inspectProperty.commissionAmount && (
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold">
                    Commission: ₹{inspectProperty.commissionAmount}
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">Listing Price</span>
                <span className="text-xl font-extrabold text-emerald-700">
                  ₹{Number(inspectProperty.price).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Photos Section */}
            {inspectProperty.images && inspectProperty.images.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Uploaded Real Photos ({inspectProperty.images.length})
                  </label>
                  <button
                    onClick={() => downloadAllPropertyPhotosZip(inspectProperty)}
                    disabled={downloadingPropertyId === inspectProperty.id}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
                  >
                    <FolderDown className="h-3.5 w-3.5" />
                    <span>{downloadingPropertyId === inspectProperty.id ? (downloadProgress || 'Packing ZIP...') : 'Download All Photos (ZIP)'}</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {inspectProperty.images.map((img, idx) => (
                    <div
                      key={img.id}
                      className="relative h-28 rounded-xl overflow-hidden border border-slate-200 group bg-slate-100 shadow-2xs"
                    >
                      <img
                        src={img.url || ''}
                        alt="Property Photo"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform cursor-pointer"
                        onClick={() => openLightbox(inspectProperty.images.map((i) => i.url || ''), idx, `${inspectProperty.title} — Photo ${idx + 1}`)}
                      />
                      {img.isPrimary && (
                        <span className="absolute bottom-1.5 left-1.5 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                          Primary
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (img.url) downloadSinglePhoto(img.url, `${inspectProperty.title}_Photo_${idx + 1}.jpg`);
                        }}
                        className="absolute top-1.5 right-1.5 p-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Download Photo"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center text-slate-400">
                <Building2 className="h-8 w-8 mx-auto mb-1 text-slate-300" />
                <p className="text-xs font-semibold text-slate-600">No Photos Attached</p>
              </div>
            )}

            {/* Core Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 font-semibold block">Title</span>
                <p className="text-slate-900 font-bold text-sm mt-0.5">{inspectProperty.title}</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Location / Address</span>
                <p className="text-slate-900 font-bold text-sm mt-0.5 flex items-center space-x-1">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600 inline shrink-0" />
                  <span>{inspectProperty.location}</span>
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Description</label>
              <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 leading-relaxed whitespace-pre-wrap">
                {inspectProperty.description || 'No description provided.'}
              </p>
            </div>

            {/* Specifications Grid */}
            {inspectProperty.specifications && Object.keys(inspectProperty.specifications).length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Specifications</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {Object.entries(inspectProperty.specifications).map(([k, v]) => (
                    <div key={k} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-500 capitalize block text-[11px]">{k.replace(/([A-Z])/g, ' $1')}:</span>
                      <p className="font-bold text-slate-900 mt-0.5">{String(v)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => setInspectProperty(null)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
              >
                Close
              </button>
              {inspectProperty.status !== 'APPROVED' && (
                <button
                  onClick={() => handleReviewPropertyFromModal(inspectProperty.id, true)}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-colors"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Approve & Set Commission</span>
                </button>
              )}
              {inspectProperty.status !== 'REJECTED' && (
                <button
                  onClick={() => handleReviewPropertyFromModal(inspectProperty.id, false)}
                  className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 border border-rose-200 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Reject Listing</span>
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Lightbox Modal */}
      {lightboxImages.length > 0 && (
        <ImageLightbox
          images={lightboxImages}
          initialIndex={lightboxIndex}
          title={lightboxTitle || 'Preview'}
          onClose={() => setLightboxImages([])}
          onDownloadZip={inspectProperty ? () => downloadAllPropertyPhotosZip(inspectProperty) : undefined}
          isDownloadingZip={downloadingPropertyId === 'lightbox' || (inspectProperty ? downloadingPropertyId === inspectProperty.id : false)}
          zipProgress={downloadProgress}
        />
      )}

      {/* Rejection / Suspension Reason Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Confirm ${pendingStatus === 'SUSPENDED' ? 'Account Suspension' : 'Rejection'}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Please enter the official reason for updating this agent's status. This will be transmitted live to their mobile phone.
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reason / Rationale</label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              placeholder="e.g. Document verification failed or terms policy violation"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-200 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              onClick={() => selectedAgentId && pendingStatus && executeStatusUpdate(selectedAgentId, pendingStatus, rejectionReason)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-rose-600/15"
            >
              Confirm Update & Send Live Notification
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Partner Details Modal */}
      {editingAgent && (
        <Modal
          isOpen={!!editingAgent}
          onClose={() => setEditingAgent(null)}
          title={`Edit Agent Partner — ${editingAgent.fullName || 'Agent'}`}
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600">
              Agent ID: <span className="font-mono font-bold text-slate-900">{editingAgent.id}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
                <input
                  type="text"
                  required
                  value={editForm.mobileNumber}
                  onChange={(e) => setEditForm({ ...editForm, mobileNumber: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Operating Location / City</label>
                <input
                  type="text"
                  value={editForm.areaLocation}
                  onChange={(e) => setEditForm({ ...editForm, areaLocation: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Occupation Platform</label>
                <input
                  type="text"
                  value={editForm.workPlatform}
                  onChange={(e) => setEditForm({ ...editForm, workPlatform: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Age</label>
                <input
                  type="number"
                  value={editForm.age}
                  onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                <select
                  value={editForm.gender}
                  onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Account Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600 font-semibold"
                >
                  <option value="APPROVED">APPROVED (Active Partner)</option>
                  <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
                  <option value="SUSPENDED">SUSPENDED (Account Blocked)</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingAgent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center space-x-1.5 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{isSaving ? 'Saving Changes...' : 'Save Details'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
