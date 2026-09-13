import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AdminApiService, resolveImageUrl } from '../services/api';
import { PropertyListing, PropertyStatus, AgentSummary } from '../types';
import { ImageLightbox } from '../components/ImageLightbox';
import {
  Building2,
  CheckCircle2,
  XCircle,
  MapPin,
  Tag,
  Search,
  Calendar,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  Clock,
  Layers,
  LayoutGrid,
  List,
  RefreshCw,
  X,
  Download,
  FolderDown,
  FileArchive,
  Loader2,
  Trash2,
  Edit3,
  Save,
  Upload,
  Image as ImageIcon,
  Plus,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from 'lucide-react';
import JSZip from 'jszip';
import { Modal } from '../components/Modal';

export const Properties: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialAgentId = searchParams.get('agentId') || '';

  const [properties, setProperties] = useState<PropertyListing[]>([]);
  const [agents, setAgents] = useState<AgentSummary[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>(initialAgentId);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Review & Inspect Modals
  const [inspectProperty, setInspectProperty] = useState<PropertyListing | null>(null);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);

  // Failed / Broken Image Tracking
  const [failedImageMap, setFailedImageMap] = useState<Record<string, boolean>>({});
  const [uploadingPropertyId, setUploadingPropertyId] = useState<string | null>(null);

  // Edit Property State
  const [editingProperty, setEditingProperty] = useState<PropertyListing | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    price: 0,
    commissionAmount: 60,
    category: 'RESIDENTIAL_RENT',
    locationAddress: '',
    locationCity: '',
    status: 'APPROVED',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Approval Modal State with Commission Input
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [approvalTarget, setApprovalTarget] = useState<PropertyListing | null>(null);
  const [approvalCommission, setApprovalCommission] = useState<number>(60);

  // Image Lightbox Modal
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxProperty, setLightboxProperty] = useState<PropertyListing | null>(null);
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

  // Photo Download State
  const [downloadingPropertyId, setDownloadingPropertyId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<string>('');

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
      alert('Failed to generate ZIP archive. Initiating direct photo downloads.');
      for (let i = 0; i < images.length; i++) {
        await downloadSinglePhoto(images[i].url!, `Photo_${i + 1}.jpg`);
        await new Promise((r) => setTimeout(r, 250));
      }
    } finally {
      setDownloadingPropertyId(null);
      setDownloadProgress('');
    }
  };

  const downloadLightboxPhotosZip = async () => {
    if (lightboxProperty) {
      await downloadAllPropertyPhotosZip(lightboxProperty);
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

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    const urlAgent = searchParams.get('agentId') || '';
    if (urlAgent !== selectedAgentId) {
      setSelectedAgentId(urlAgent);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProperties();
  }, [filterStatus, dateFilter, startDate, endDate, selectedAgentId]);

  const fetchAgents = async () => {
    try {
      const res = await AdminApiService.getAgents();
      if (res.success) {
        setAgents(res.data);
      }
    } catch (_) {}
  };

  const getDateRange = () => {
    if (dateFilter === 'TODAY') {
      const today = new Date().toISOString().split('T')[0];
      return { start: today, end: today };
    }
    if (dateFilter === 'YESTERDAY') {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      return { start: yesterday, end: yesterday };
    }
    if (dateFilter === 'WEEK') {
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
      return { start: weekAgo, end: new Date().toISOString().split('T')[0] };
    }
    if (dateFilter === 'MONTH') {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      return { start: monthStart, end: now.toISOString().split('T')[0] };
    }
    if (dateFilter === 'CUSTOM') {
      return { start: startDate || undefined, end: endDate || undefined };
    }
    return { start: undefined, end: undefined };
  };

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const range = getDateRange();
      const statusParam = filterStatus === 'ALL' ? undefined : (filterStatus as PropertyStatus);
      const res = await AdminApiService.getProperties({
        status: statusParam,
        agentId: selectedAgentId || undefined,
        startDate: range.start,
        endDate: range.end,
        search: search.trim() || undefined,
      });
      if (res.success) {
        setProperties(res.data);
      }
    } catch (_) {}
    setLoading(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProperties();
  };

  const handleReviewAction = async (property: PropertyListing, approve: boolean) => {
    if (!approve) {
      setSelectedPropertyId(property.id);
      setRejectionReason('');
      setRejectionModalOpen(true);
    } else {
      setApprovalTarget(property);
      setApprovalCommission(Number(property.commissionAmount || 60));
      setApprovalModalOpen(true);
    }
  };

  const executeReview = async (propertyId: string, approve: boolean, reason?: string, commission?: number) => {
    setActionLoading(true);
    try {
      await AdminApiService.reviewProperty(propertyId, approve, reason, commission);
      setRejectionModalOpen(false);
      setApprovalModalOpen(false);
      setApprovalTarget(null);
      if (inspectProperty?.id === propertyId) {
        setInspectProperty(null);
      }
      fetchProperties();
    } catch (e: any) {
      alert(e.message || 'Review failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenEditProperty = (prop: PropertyListing) => {
    setEditingProperty(prop);
    setEditForm({
      title: prop.title || '',
      description: prop.description || '',
      price: Number(prop.price || 0),
      commissionAmount: Number(prop.commissionAmount || 60),
      category: prop.category || 'RESIDENTIAL_RENT',
      locationAddress: prop.locationAddress || prop.location || '',
      locationCity: prop.locationCity || '',
      status: prop.status || 'APPROVED',
    });
  };

  const handleSavePropertyEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProperty) return;
    setIsSaving(true);
    try {
      await AdminApiService.updateProperty(editingProperty.id, {
        title: editForm.title,
        description: editForm.description,
        price: Number(editForm.price),
        commissionAmount: Number(editForm.commissionAmount),
        category: editForm.category,
        locationAddress: editForm.locationAddress,
        locationCity: editForm.locationCity,
        status: editForm.status,
      });
      setEditingProperty(null);
      if (inspectProperty?.id === editingProperty.id) {
        setInspectProperty(null);
      }
      await fetchProperties();
    } catch (err: any) {
      alert(err.message || 'Failed to update property details');
    }
    setIsSaving(false);
  };

  const handleDeleteProperty = async (propertyId: string, title?: string) => {
    if (!window.confirm(`⚠️ Permanently delete property listing "${title || 'this property'}" and all its photos?\nThis cannot be undone.`)) {
      return;
    }
    try {
      await AdminApiService.deleteProperty(propertyId);
      if (inspectProperty?.id === propertyId) {
        setInspectProperty(null);
      }
      await fetchProperties();
    } catch (err: any) {
      alert(err.message || 'Failed to delete property');
    }
  };

  const handleImageUpload = async (propertyId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingPropertyId(propertyId);
    try {
      const newKeys: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await AdminApiService.directUpload(file, 'property-images');
        if (res.success && res.data?.fileKey) {
          newKeys.push(res.data.fileKey);
        }
      }

      if (newKeys.length > 0) {
        await AdminApiService.updateProperty(propertyId, {
          newImageKeys: newKeys,
          replaceImages: false,
        });
        await fetchProperties();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to upload property photos');
    } finally {
      setUploadingPropertyId(null);
    }
  };

  const openLightbox = (
    images: { url: string | null }[] | string[],
    startIndex = 0,
    property?: PropertyListing | null,
    title?: string,
  ) => {
    let validUrls: string[] = [];
    if (images.length > 0 && typeof images[0] === 'string') {
      validUrls = (images as string[]).map((u) => resolveImageUrl(u, 'property-images')).filter(Boolean);
    } else {
      validUrls = (images as { url: string | null; imageKey?: string }[])
        .map((img) => resolveImageUrl(img.url || img.imageKey, 'property-images'))
        .filter((u): u is string => !!u);
    }
    if (validUrls.length > 0) {
      setLightboxImages(validUrls);
      setLightboxIndex(startIndex);
      setLightboxProperty(property || inspectProperty || null);
      setLightboxTitle(title || property?.title || inspectProperty?.title || 'Property Photos');
    }
  };

  // Sorting State
  const [sortField, setSortField] = useState<'date' | 'price' | 'commission' | 'title' | 'photos' | 'status'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedProperties = React.useMemo(() => {
    const list = properties.filter((p) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const titleMatch = (p.title || '').toLowerCase().includes(q);
      const locationMatch = (p.location || '').toLowerCase().includes(q);
      const agentMatch = (p.agent?.fullName || '').toLowerCase().includes(q);
      const phoneMatch = (p.agent?.mobileNumber || '').includes(q);
      return titleMatch || locationMatch || agentMatch || phoneMatch;
    });

    return list.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'title') {
        comparison = (a.title || '').localeCompare(b.title || '');
      } else if (sortField === 'price') {
        comparison = (Number(a.price) || 0) - (Number(b.price) || 0);
      } else if (sortField === 'commission') {
        comparison = (Number(a.commissionAmount) || 60) - (Number(b.commissionAmount) || 60);
      } else if (sortField === 'photos') {
        comparison = (a.images?.length || 0) - (b.images?.length || 0);
      } else if (sortField === 'status') {
        comparison = (a.status || '').localeCompare(b.status || '');
      } else if (sortField === 'date') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [properties, search, sortField, sortDirection]);

  // Group properties day-wise / date-wise
  const groupPropertiesByDate = () => {
    const groups: { [dateStr: string]: PropertyListing[] } = {};
    filteredAndSortedProperties.forEach((prop) => {
      const dateKey = new Date(prop.createdAt).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(prop);
    });
    return groups;
  };

  const grouped = groupPropertiesByDate();
  const totalCount = properties.length;
  const underReviewCount = properties.filter((p) => p.status === 'SUBMITTED' || p.status === 'UNDER_REVIEW').length;
  const approvedCount = properties.filter((p) => p.status === 'APPROVED').length;
  const rejectedCount = properties.filter((p) => p.status === 'REJECTED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Property Listings & Asset Management</h2>
          <p className="text-slate-500 text-sm mt-1">
            Review agent-submitted listings, inspect pictures, verify specifications, and track day-wise asset submissions
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchProperties}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm"
            title="Refresh Listings"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold uppercase">Total Listings</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalCount}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-amber-600 font-semibold uppercase">Under Review</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">{underReviewCount}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-emerald-600 font-semibold uppercase">Approved Live</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{approvedCount}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-rose-600 font-semibold uppercase">Rejected</span>
          <p className="text-2xl font-bold text-rose-600 mt-1">{rejectedCount}</p>
        </div>
      </div>

      {/* Top Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: 'All Statuses', val: 'ALL' },
              { label: 'Under Review', val: 'SUBMITTED' },
              { label: 'Approved', val: 'APPROVED' },
              { label: 'Rejected', val: 'REJECTED' },
            ].map((t) => (
              <button
                key={t.val}
                onClick={() => setFilterStatus(t.val)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filterStatus === t.val
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Filters: Date & Agent Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Agent Selector Dropdown */}
            <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700">
              <User className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={selectedAgentId}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedAgentId(val);
                  if (val) {
                    setSearchParams({ agentId: val });
                  } else {
                    setSearchParams({});
                  }
                }}
                className="bg-transparent font-semibold text-slate-900 focus:outline-none cursor-pointer max-w-[180px] truncate"
              >
                <option value="">All Agents</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.fullName || 'Unfilled'} (+91 {a.mobileNumber})
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Selector Dropdown */}
            <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700">
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
              <span className="font-bold text-slate-500 hidden sm:inline">Sort:</span>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as any)}
                className="bg-transparent font-semibold text-slate-900 focus:outline-none cursor-pointer"
              >
                <option value="date">Date Listed</option>
                <option value="price">Price (₹)</option>
                <option value="commission">Commission (₹)</option>
                <option value="photos">Photo Count</option>
                <option value="title">Title (A-Z)</option>
                <option value="status">Status</option>
              </select>
              <button
                type="button"
                onClick={() => setSortDirection((d) => (d === 'desc' ? 'asc' : 'desc'))}
                className="p-1 hover:bg-slate-200 rounded text-emerald-600 transition-colors"
                title="Toggle Ascending / Descending"
              >
                {sortDirection === 'desc' ? <ArrowDown className="h-3.5 w-3.5" /> : <ArrowUp className="h-3.5 w-3.5" />}
              </button>
            </div>

            {/* Date Filter Dropdown */}
            <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-transparent font-semibold text-slate-900 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Time</option>
                <option value="TODAY">Today's Listings</option>
                <option value="YESTERDAY">Yesterday</option>
                <option value="WEEK">Last 7 Days</option>
                <option value="MONTH">This Month</option>
                <option value="CUSTOM">Custom Date Range</option>
              </select>
            </div>

            {dateFilter === 'CUSTOM' && (
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
                <span className="text-xs text-slate-400">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>
            )}
          </div>
        </div>

        {/* Selected Agent Pill Banner */}
        {selectedAgentId && (
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-xs">
            <div className="flex items-center space-x-2 text-emerald-900 font-semibold">
              <Building2 className="h-4 w-4 text-emerald-600" />
              <span>
                Filtering listings by Agent:{' '}
                <strong className="text-emerald-950 font-bold">
                  {agents.find((a) => a.id === selectedAgentId)?.fullName || selectedAgentId}
                </strong>
              </span>
            </div>
            <button
              onClick={() => {
                setSelectedAgentId('');
                setSearchParams({});
              }}
              className="text-emerald-700 hover:text-emerald-950 p-1 rounded-lg flex items-center space-x-1 font-bold"
            >
              <X className="h-3.5 w-3.5" />
              <span>Clear Filter</span>
            </button>
          </div>
        )}

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search property title, location, or Agent Name / Mobile Number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-24 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
          />
          <button
            type="submit"
            className="absolute right-2 top-2 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Property Listing View */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 font-medium">
          Loading property listings & pictures...
        </div>
      ) : filteredAndSortedProperties.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
          <Building2 className="h-12 w-12 mx-auto text-slate-300 mb-3" />
          <p className="font-semibold text-slate-700">No Property Listings Found</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting the status or date filters above.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Day-wise Grouped Grid View */
        <div className="space-y-8">
          {Object.entries(grouped).map(([dateHeader, list]) => (
            <div key={dateHeader} className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-slate-100 text-slate-800 px-3.5 py-1 rounded-full text-xs font-bold border border-slate-200">
                  <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{dateHeader}</span>
                </div>
                <span className="text-xs font-semibold text-slate-400">({list.length} listings)</span>
                <div className="h-px bg-slate-200 flex-1" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {list.map((prop) => {
                  const primaryImg = prop.images?.find((i) => i.isPrimary) || prop.images?.[0];
                  return (
                    <div
                      key={prop.id}
                      className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
                    >
                      {/* Image Preview Banner */}
                      <div className="relative h-48 bg-slate-100 overflow-hidden group">
                        {primaryImg && (primaryImg.url || primaryImg.imageKey) && !failedImageMap[primaryImg.url || primaryImg.imageKey] ? (
                          <img
                            src={resolveImageUrl(primaryImg.url || primaryImg.imageKey, 'property-images')}
                            alt={prop.title}
                            onError={() => setFailedImageMap((prev) => ({ ...prev, [(primaryImg.url || primaryImg.imageKey)!]: true }))}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                            onClick={() => openLightbox(prop.images || [])}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100/90 text-slate-400 p-4 space-y-2 text-center">
                            <div className="p-2.5 bg-white rounded-xl shadow-xs border border-slate-200">
                              <Building2 className="h-6 w-6 text-slate-400" />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-700 block">No Real Photos Uploaded</span>
                              <span className="text-[10px] text-slate-400">Agent has not attached genuine property photos</span>
                            </div>
                            <label className="cursor-pointer px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 shadow-xs flex items-center space-x-1 transition-all">
                              {uploadingPropertyId === prop.id ? (
                                <Loader2 className="h-3 w-3 animate-spin text-emerald-600" />
                              ) : (
                                <Upload className="h-3 w-3 text-emerald-600" />
                              )}
                              <span>Upload Real Photo</span>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => handleImageUpload(prop.id, e.target.files)}
                              />
                            </label>
                          </div>
                        )}

                        {/* Top Category & Photo Count Badges */}
                        <div className="absolute top-3 left-3 flex items-center space-x-2">
                          <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-bold text-slate-800 shadow-sm">
                            {prop.category.replace('_', ' ')}
                          </span>
                        </div>

                        {prop.images && prop.images.filter(i => i.url && !failedImageMap[i.url]).length > 1 && (
                          <button
                            onClick={() => openLightbox(prop.images)}
                            className="absolute top-3 right-3 px-2.5 py-1 bg-slate-900/80 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center space-x-1 backdrop-blur-sm shadow-sm"
                          >
                            <Layers className="h-3 w-3" />
                            <span>{prop.images.filter(i => i.url && !failedImageMap[i.url]).length} Photos</span>
                          </button>
                        )}

                        {/* Status Badge */}
                        <div className="absolute bottom-3 left-3">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-extrabold shadow-sm ${
                              prop.status === 'APPROVED'
                                ? 'bg-emerald-600 text-white'
                                : prop.status === 'REJECTED'
                                ? 'bg-rose-600 text-white'
                                : 'bg-amber-500 text-white'
                            }`}
                          >
                            {prop.status}
                          </span>
                        </div>
                      </div>

                      {/* Content Details */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-baseline justify-between">
                            <h3 className="font-bold text-base text-slate-900 line-clamp-1" title={prop.title}>
                              {prop.title}
                            </h3>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-emerald-700 font-extrabold text-lg">
                              ₹{Number(prop.price).toLocaleString('en-IN')}
                            </p>
                            <div className="flex items-center space-x-1 bg-amber-50 border border-amber-200/80 text-amber-900 px-2 py-0.5 rounded-lg text-xs font-bold">
                              <Tag className="h-3 w-3 text-amber-600 shrink-0" />
                              <span>Commission: ₹{Number(prop.commissionAmount || 60).toLocaleString('en-IN')}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="line-clamp-1">{prop.location}</span>
                          </div>
                        </div>

                        {/* Agent / Listed By Section */}
                        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="h-7 w-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                                {prop.agent?.fullName ? prop.agent.fullName.charAt(0).toUpperCase() : 'A'}
                              </div>
                              <div>
                                <span className="text-xs font-bold text-slate-900 block leading-tight">
                                  {prop.agent?.fullName || 'Agent Partner'}
                                </span>
                                <span className="text-[11px] text-slate-500 flex items-center space-x-1">
                                  <Phone className="h-2.5 w-2.5 inline" />
                                  <span>+91 {prop.agent?.mobileNumber}</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200">
                            <span className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{new Date(prop.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </span>
                            <span className="text-slate-500 font-medium">{prop.agent?.areaLocation || 'Bangalore'}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-1.5 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => {
                              setInspectProperty(prop);
                              setApprovalCommission(Number(prop.commissionAmount || 60));
                            }}
                            className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs flex items-center justify-center space-x-1 transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Inspect</span>
                          </button>

                          <button
                            onClick={() => handleOpenEditProperty(prop)}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs border border-slate-200 transition-colors"
                            title="Edit Listing Details"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>

                          {prop.images && prop.images.length > 0 && (
                            <button
                              onClick={() => downloadAllPropertyPhotosZip(prop)}
                              disabled={downloadingPropertyId === prop.id}
                              className="px-2 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 font-semibold rounded-xl text-xs flex items-center justify-center space-x-1 transition-colors"
                              title="Download Complete Photos (ZIP)"
                            >
                              {downloadingPropertyId === prop.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />
                              ) : (
                                <Download className="h-3.5 w-3.5" />
                              )}
                            </button>
                          )}

                          {prop.status !== 'APPROVED' && (
                            <button
                              onClick={() => handleReviewAction(prop, true)}
                              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center space-x-1 shadow-sm transition-colors"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Approve</span>
                            </button>
                          )}

                          {prop.status !== 'REJECTED' && (
                            <button
                              onClick={() => handleReviewAction(prop, false)}
                              className="p-2 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 border border-rose-200 rounded-xl transition-colors"
                              title="Reject Listing"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteProperty(prop.id, prop.title)}
                            className="p-2 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 border border-rose-200 rounded-xl transition-colors"
                            title="Delete Property Listing"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto shadow-sm">
          <table className="w-full text-left text-sm min-w-[1200px]">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th
                  className="p-4 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                  onClick={() => {
                    if (sortField === 'title') {
                      setSortDirection((d) => (d === 'desc' ? 'asc' : 'desc'));
                    } else {
                      setSortField('title');
                      setSortDirection('asc');
                    }
                  }}
                >
                  <div className="flex items-center space-x-1.5">
                    <span>Property</span>
                    {sortField === 'title' ? (
                      sortDirection === 'desc' ? <ArrowDown className="h-3.5 w-3.5 text-emerald-600" /> : <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                    )}
                  </div>
                </th>
                <th className="p-4 whitespace-nowrap">Listed By (Agent)</th>
                <th className="p-4 whitespace-nowrap">Category</th>
                <th
                  className="p-4 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                  onClick={() => {
                    if (sortField === 'price') {
                      setSortDirection((d) => (d === 'desc' ? 'asc' : 'desc'));
                    } else {
                      setSortField('price');
                      setSortDirection('desc');
                    }
                  }}
                >
                  <div className="flex items-center space-x-1.5">
                    <span>Price (₹)</span>
                    {sortField === 'price' ? (
                      sortDirection === 'desc' ? <ArrowDown className="h-3.5 w-3.5 text-emerald-600" /> : <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                    )}
                  </div>
                </th>
                <th
                  className="p-4 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                  onClick={() => {
                    if (sortField === 'commission') {
                      setSortDirection((d) => (d === 'desc' ? 'asc' : 'desc'));
                    } else {
                      setSortField('commission');
                      setSortDirection('desc');
                    }
                  }}
                >
                  <div className="flex items-center space-x-1.5">
                    <span>Commission (₹)</span>
                    {sortField === 'commission' ? (
                      sortDirection === 'desc' ? <ArrowDown className="h-3.5 w-3.5 text-emerald-600" /> : <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                    )}
                  </div>
                </th>
                <th className="p-4 whitespace-nowrap">Location</th>
                <th
                  className="p-4 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                  onClick={() => {
                    if (sortField === 'date') {
                      setSortDirection((d) => (d === 'desc' ? 'asc' : 'desc'));
                    } else {
                      setSortField('date');
                      setSortDirection('desc');
                    }
                  }}
                >
                  <div className="flex items-center space-x-1.5">
                    <span>Submission Date</span>
                    {sortField === 'date' ? (
                      sortDirection === 'desc' ? <ArrowDown className="h-3.5 w-3.5 text-emerald-600" /> : <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                    )}
                  </div>
                </th>
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
                    <span>Status</span>
                    {sortField === 'status' ? (
                      sortDirection === 'desc' ? <ArrowDown className="h-3.5 w-3.5 text-emerald-600" /> : <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                    )}
                  </div>
                </th>
                <th className="p-4 text-right whitespace-nowrap min-w-[260px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAndSortedProperties.map((prop) => (
                <tr key={prop.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      {prop.images?.[0] && (prop.images[0].url || prop.images[0].imageKey) && !failedImageMap[prop.images[0].url || prop.images[0].imageKey] ? (
                        <img
                          src={resolveImageUrl(prop.images[0].url || prop.images[0].imageKey, 'property-images')}
                          alt={prop.title}
                          onError={() => setFailedImageMap((prev) => ({ ...prev, [(prop.images![0].url || prop.images![0].imageKey)!]: true }))}
                          className="h-10 w-10 rounded-lg object-cover cursor-pointer"
                          onClick={() => openLightbox(prop.images)}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                          <Building2 className="h-5 w-5" />
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-slate-900 block line-clamp-1">{prop.title}</span>
                        <span className="text-xs text-slate-400">{prop.images?.filter(i => i.url && !failedImageMap[i.url]).length || 0} real photos</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <div>
                      <span className="font-semibold text-slate-900 block">{prop.agent?.fullName || 'Agent Partner'}</span>
                      <span className="text-xs text-slate-500">+91 {prop.agent?.mobileNumber}</span>
                    </div>
                  </td>
                  <td className="p-4 whitespace-nowrap text-slate-700">{prop.category.replace('_', ' ')}</td>
                  <td className="p-4 whitespace-nowrap font-bold text-emerald-700">₹{Number(prop.price).toLocaleString('en-IN')}</td>
                  <td className="p-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
                      ₹{Number(prop.commissionAmount || 60).toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td className="p-4 whitespace-nowrap text-slate-600">{prop.location}</td>
                  <td className="p-4 whitespace-nowrap text-slate-600 text-xs">
                    {new Date(prop.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        prop.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : prop.status === 'REJECTED'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {prop.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => {
                        setInspectProperty(prop);
                        setApprovalCommission(Number(prop.commissionAmount || 60));
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                    >
                      Inspect
                    </button>
                    <button
                      onClick={() => handleOpenEditProperty(prop)}
                      className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs border border-slate-200 transition-colors inline-flex items-center"
                      title="Edit Property Listing"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    {prop.images && prop.images.length > 0 && (
                      <button
                        onClick={() => downloadAllPropertyPhotosZip(prop)}
                        disabled={downloadingPropertyId === prop.id}
                        className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold inline-flex items-center space-x-1"
                        title="Download Complete Photos (ZIP)"
                      >
                        {downloadingPropertyId === prop.id ? (
                          <Loader2 className="h-3 w-3 animate-spin text-emerald-600" />
                        ) : (
                          <Download className="h-3 w-3" />
                        )}
                      </button>
                    )}
                    {prop.status !== 'APPROVED' && (
                      <button
                        onClick={() => handleReviewAction(prop, true)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm"
                      >
                        Approve
                      </button>
                    )}
                    {prop.status !== 'REJECTED' && (
                      <button
                        onClick={() => handleReviewAction(prop, false)}
                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold"
                      >
                        Reject
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteProperty(prop.id, prop.title)}
                      className="p-1 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold inline-flex items-center"
                      title="Delete Property Listing"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Property Full Inspection Modal */}
      {inspectProperty && (
        <Modal isOpen={!!inspectProperty} onClose={() => setInspectProperty(null)} title="Property Details & Specifications">
          <div className="space-y-6">
            {/* Gallery */}
            {inspectProperty.images && inspectProperty.images.filter(i => i.url && !failedImageMap[i.url]).length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Uploaded Real Photos ({inspectProperty.images.filter(i => i.url && !failedImageMap[i.url]).length})
                  </label>
                  <div className="flex items-center space-x-2">
                    <label className="cursor-pointer px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1 transition-all border border-slate-200">
                      {uploadingPropertyId === inspectProperty.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />
                      ) : (
                        <Plus className="h-3.5 w-3.5 text-emerald-600" />
                      )}
                      <span>Add Photos</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={async (e) => {
                          await handleImageUpload(inspectProperty.id, e.target.files);
                        }}
                      />
                    </label>
                    <button
                      onClick={() => downloadAllPropertyPhotosZip(inspectProperty)}
                      disabled={downloadingPropertyId === inspectProperty.id}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
                    >
                      {downloadingPropertyId === inspectProperty.id ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>{downloadProgress || 'Packing ZIP...'}</span>
                        </>
                      ) : (
                        <>
                          <FolderDown className="h-3.5 w-3.5" />
                          <span>Download All Photos (ZIP)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {inspectProperty.images.filter(i => (i.url || i.imageKey) && !failedImageMap[i.url || i.imageKey]).map((img, idx) => (
                    <div
                      key={img.id}
                      className="relative h-24 rounded-xl overflow-hidden border border-slate-200 group bg-slate-100"
                    >
                      <img
                        src={resolveImageUrl(img.url || img.imageKey, 'property-images')}
                        alt="prop"
                        onError={() => setFailedImageMap((prev) => ({ ...prev, [(img.url || img.imageKey)!]: true }))}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform cursor-pointer"
                        onClick={() => openLightbox(inspectProperty.images, idx)}
                      />
                      {img.isPrimary && (
                        <span className="absolute bottom-1 left-1 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                          Primary
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadSinglePhoto(img.url!, `${inspectProperty.title}_Photo_${idx + 1}.jpg`);
                        }}
                        className="absolute top-1 right-1 p-1 bg-slate-900/70 hover:bg-slate-900 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Download this photo"
                      >
                        <Download className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-xs text-slate-400">
                    <Building2 className="h-7 w-7" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">No Physical Photos Attached</h4>
                    <p className="text-[11px] text-slate-500">Agent submitted listing without real photos. You can upload authentic photos here.</p>
                  </div>
                </div>
                <label className="cursor-pointer px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center space-x-1.5 transition-all shrink-0">
                  {uploadingPropertyId === inspectProperty.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Upload className="h-3.5 w-3.5" />
                  )}
                  <span>Upload Real Photos</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={async (e) => {
                      await handleImageUpload(inspectProperty.id, e.target.files);
                    }}
                  />
                </label>
              </div>
            )}

            {/* Core Info */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 font-semibold">Title:</span>
                <p className="text-slate-900 font-bold mt-0.5">{inspectProperty.title}</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Price:</span>
                <p className="text-emerald-700 font-bold mt-0.5">₹{Number(inspectProperty.price).toLocaleString('en-IN')}</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Category:</span>
                <p className="text-slate-900 font-bold mt-0.5">{inspectProperty.category.replace('_', ' ')}</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Location:</span>
                <p className="text-slate-900 font-bold mt-0.5">{inspectProperty.location}</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Description</label>
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                {inspectProperty.description || 'No description provided.'}
              </p>
            </div>

            {/* Specifications */}
            {inspectProperty.specifications && Object.keys(inspectProperty.specifications).length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Specifications</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {Object.entries(inspectProperty.specifications).map(([k, v]) => (
                    <div key={k} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <span className="text-slate-500 capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>
                      <p className="font-bold text-slate-900 mt-0.5">{String(v)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Listed By Agent */}
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="text-emerald-800 font-semibold">Listed by Verified Agent</span>
                <p className="text-slate-900 font-bold text-sm mt-0.5">{inspectProperty.agent?.fullName || 'Agent Partner'}</p>
                <p className="text-slate-600 mt-0.5">Mobile: +91 {inspectProperty.agent?.mobileNumber}</p>
              </div>
              <div className="text-right text-slate-500">
                <span>Submitted on</span>
                <p className="font-bold text-slate-800">
                  {new Date(inspectProperty.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {/* Action Bar inside modal */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setInspectProperty(null)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
              >
                Close
              </button>
              <button
                onClick={() => handleOpenEditProperty(inspectProperty)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center space-x-1.5 border border-slate-200"
              >
                <Edit3 className="h-4 w-4 text-slate-600" />
                <span>Edit Listing</span>
              </button>
              {inspectProperty.status !== 'APPROVED' && (
                <button
                  onClick={() => handleReviewAction(inspectProperty, true)}
                  disabled={actionLoading}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-sm"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Approve & Set Commission</span>
                </button>
              )}
              {inspectProperty.status !== 'REJECTED' && (
                <button
                  onClick={() => {
                    setSelectedPropertyId(inspectProperty.id);
                    setRejectionReason('');
                    setRejectionModalOpen(true);
                  }}
                  disabled={actionLoading}
                  className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 border border-rose-200 font-semibold rounded-xl text-xs flex items-center justify-center space-x-1.5"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Reject Listing</span>
                </button>
              )}
              <button
                onClick={() => handleDeleteProperty(inspectProperty.id, inspectProperty.title)}
                className="py-2.5 px-3 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center space-x-1"
                title="Delete Property Listing"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Rejection Reason Modal */}
      <Modal isOpen={rejectionModalOpen} onClose={() => setRejectionModalOpen(false)} title="Reject Property Listing">
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Please enter the official reason for rejecting this listing. The reason will be pushed directly to the agent's mobile app.
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Rejection Reason</label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              placeholder="e.g. Incomplete address, photos unclear, or price invalid"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button
              onClick={() => setRejectionModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              onClick={() => selectedPropertyId && executeReview(selectedPropertyId, false, rejectionReason)}
              disabled={actionLoading}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-rose-600/15"
            >
              {actionLoading ? 'Processing...' : 'Confirm Rejection'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Image Lightbox Modal */}
      {lightboxImages.length > 0 && (
        <ImageLightbox
          images={lightboxImages}
          initialIndex={lightboxIndex}
          title={lightboxTitle || 'Property Photos'}
          onClose={() => setLightboxImages([])}
          onDownloadZip={lightboxProperty ? () => downloadAllPropertyPhotosZip(lightboxProperty) : undefined}
          isDownloadingZip={downloadingPropertyId === 'lightbox' || (lightboxProperty ? downloadingPropertyId === lightboxProperty.id : false)}
          zipProgress={downloadProgress}
        />
      )}

      {/* Edit Property Listing Modal */}
      {editingProperty && (
        <Modal
          isOpen={!!editingProperty}
          onClose={() => setEditingProperty(null)}
          title={`Edit Property Listing — ${editingProperty.title}`}
        >
          <form onSubmit={handleSavePropertyEdit} className="space-y-4">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600">
              Listing ID: <span className="font-mono font-bold text-slate-900">{editingProperty.id}</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Property Title</label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Agent Commission (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editForm.commissionAmount}
                    onChange={(e) => setEditForm({ ...editForm, commissionAmount: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600 font-mono font-bold text-amber-900"
                    placeholder="60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600"
                  >
                    <option value="RESIDENTIAL_RENT">Residential Rent</option>
                    <option value="RESIDENTIAL_SALE">Residential Sale</option>
                    <option value="COMMERCIAL_RENT">Commercial Rent</option>
                    <option value="COMMERCIAL_SALE">Commercial Sale</option>
                    <option value="LAND_SALE">Land / Plot Sale</option>
                    <option value="PG_CO_LIVING">PG & Co-Living</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Address / Landmark</label>
                  <input
                    type="text"
                    value={editForm.locationAddress}
                    onChange={(e) => setEditForm({ ...editForm, locationAddress: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={editForm.locationCity}
                    onChange={(e) => setEditForm({ ...editForm, locationCity: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Listing Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600 font-semibold"
                >
                  <option value="APPROVED">APPROVED (Active & Published)</option>
                  <option value="SUBMITTED">SUBMITTED (Under Review)</option>
                  <option value="REJECTED">REJECTED (Listing Declined)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Attach / Upload Real Listing Photos</label>
                <label className="w-full flex flex-col items-center justify-center p-3.5 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl cursor-pointer bg-slate-50 hover:bg-emerald-50/40 transition-colors">
                  <Upload className="h-5 w-5 text-slate-400 mb-1" />
                  <span className="text-xs font-bold text-slate-700">Choose Genuine Photos from Computer</span>
                  <span className="text-[10px] text-slate-400">Uploads directly to server storage</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={async (e) => {
                      if (editingProperty) {
                        await handleImageUpload(editingProperty.id, e.target.files);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingProperty(null)}
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
                <span>{isSaving ? 'Saving Changes...' : 'Save & Publish Updates'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Approval Confirmation & Commission Modal */}
      {approvalModalOpen && approvalTarget && (
        <Modal
          isOpen={approvalModalOpen}
          onClose={() => setApprovalModalOpen(false)}
          title="Approve Property & Set Agent Commission"
        >
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-xs text-emerald-950 space-y-1">
              <p className="font-bold text-sm text-emerald-900">{approvalTarget.title}</p>
              <p className="text-emerald-700">
                Agent: <strong>{approvalTarget.agent?.fullName || 'Agent Partner'}</strong> (+91 {approvalTarget.agent?.mobileNumber})
              </p>
              <p className="text-emerald-700">
                Property Price: <strong>₹{Number(approvalTarget.price).toLocaleString('en-IN')}</strong>
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Commission Amount (₹) <span className="text-rose-500">*</span>
              </label>
              <p className="text-[11px] text-slate-500">
                This commission will automatically be added to the agent's <strong>Pending Payments</strong> upon approval.
              </p>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-500">₹</span>
                <input
                  type="number"
                  min="0"
                  required
                  value={approvalCommission}
                  onChange={(e) => setApprovalCommission(Number(e.target.value))}
                  placeholder="60"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                />
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900">
              💡 <strong>Business Rule:</strong> Approving this property will create a pending credit of{' '}
              <strong className="text-emerald-800">₹{approvalCommission.toLocaleString('en-IN')}</strong> for{' '}
              <strong>{approvalTarget.agent?.fullName || 'the agent'}</strong> in the Credit & Payments section.
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setApprovalModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading || approvalCommission < 0}
                onClick={() => executeReview(approvalTarget.id, true, undefined, approvalCommission)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md flex items-center space-x-1.5 disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{actionLoading ? 'Processing...' : `Approve with ₹${approvalCommission} Commission`}</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

