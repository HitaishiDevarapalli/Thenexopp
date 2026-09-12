import React, { useEffect, useState } from 'react';
import { AdminApiService, API_BASE_URL } from '../services/api';
import { AgentSummary } from '../types';
import {
  FileCheck,
  ShieldCheck,
  ShieldAlert,
  Eye,
  EyeOff,
  User,
  MapPin,
  Briefcase,
  CreditCard,
  Building,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  FileText,
  Lock,
  Unlock,
  Image as ImageIcon,
  Trash2,
  Edit3,
  RotateCcw,
  Save,
  X,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from 'lucide-react';
import { Modal } from '../components/Modal';

export const KycReview: React.FC = () => {
  const [agents, setAgents] = useState<AgentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [search, setSearch] = useState('');
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [previewDoc, setPreviewDoc] = useState<{ title: string; key: string; url?: string | null; type?: string; number?: string; name?: string } | null>(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Edit Partner / KYC State
  const [editingAgent, setEditingAgent] = useState<AgentSummary | null>(null);
  const [editForm, setEditForm] = useState({
    fullName: '',
    mobileNumber: '',
    areaLocation: '',
    workPlatform: '',
    age: '',
    gender: '',
    aadhaarNumber: '',
    panNumber: '',
    bankAccountNumber: '',
    bankIfscCode: '',
    bankUpiId: '',
    bankPhonepeNumber: '',
    kycStatus: 'APPROVED',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchKycQueue();
  }, []);

  const openPreview = (doc: { title: string; key: string; url?: string | null; type?: string; number?: string; name?: string }) => {
    setZoomScale(1);
    setRotation(0);
    let resolvedUrl = doc.url;
    if (!resolvedUrl && doc.key) {
      if (doc.key.startsWith('http') || doc.key.startsWith('data:image/')) {
        resolvedUrl = doc.key;
      } else {
        resolvedUrl = `${API_BASE_URL}/uploads/local-mock-view?key=${encodeURIComponent(doc.key)}&bucket=private-kyc`;
      }
    }
    setPreviewDoc({ ...doc, url: resolvedUrl });
  };

  const fetchKycQueue = async () => {
    setLoading(true);
    try {
      const res = await AdminApiService.getAgents();
      if (res.success) {
        setAgents(res.data);
      }
    } catch (_) {}
    setLoading(false);
  };

  const toggleReveal = (agentId: string) => {
    setRevealedIds((prev) => ({ ...prev, [agentId]: !prev[agentId] }));
  };

  const handleReview = async (agentId: string, approve: boolean) => {
    const reason = !approve ? prompt('Enter KYC Rejection Reason:') || 'Document verification failed' : undefined;
    try {
      await AdminApiService.reviewKyc(agentId, approve, reason);
      await AdminApiService.updateAgentStatus(agentId, approve ? 'APPROVED' : 'REJECTED', reason);
    } catch (_) {}

    // Immediately update UI state in admin queue
    setAgents((prev) =>
      prev.map((a) =>
        a.id === agentId
          ? {
              ...a,
              kycStatus: approve ? 'APPROVED' : 'REJECTED',
              status: approve ? 'APPROVED' : 'REJECTED',
              rejectionReason: approve ? null : (reason || null),
            }
          : a,
      ),
    );
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
      aadhaarNumber: agent.aadhaarFullNumber || (agent.aadhaarLast4 ? `XXXX XXXX ${agent.aadhaarLast4}` : ''),
      panNumber: agent.panFullNumber || agent.panMasked || '',
      bankAccountNumber: agent.bankAccountFullNumber || (agent.bankAccountLast4 ? `•••• ${agent.bankAccountLast4}` : ''),
      bankIfscCode: agent.bankIfscCode || '',
      bankUpiId: agent.bankUpiId || '',
      bankPhonepeNumber: agent.bankPhonepeNumber || '',
      kycStatus: agent.kycStatus || 'APPROVED',
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAgent) return;
    setIsSaving(true);
    try {
      // 1. Update Agent Profile & Phone
      await AdminApiService.updateAgent(editingAgent.id, {
        fullName: editForm.fullName,
        mobileNumber: editForm.mobileNumber,
        areaLocation: editForm.areaLocation,
        workPlatform: editForm.workPlatform,
        age: editForm.age,
        gender: editForm.gender,
      });

      // 2. Update KYC & Banking
      await AdminApiService.updateKyc(editingAgent.id, {
        aadhaarNumber: editForm.aadhaarNumber,
        panNumber: editForm.panNumber,
        bankAccountNumber: editForm.bankAccountNumber,
        bankIfscCode: editForm.bankIfscCode,
        bankUpiId: editForm.bankUpiId,
        bankPhonepeNumber: editForm.bankPhonepeNumber,
        status: editForm.kycStatus,
      });

      setEditingAgent(null);
      await fetchKycQueue();
    } catch (err: any) {
      alert(err.message || 'Failed to update partner details');
    }
    setIsSaving(false);
  };

  const handleDeleteKyc = async (agentId: string, name?: string | null) => {
    if (!window.confirm(`Are you sure you want to reset/delete the KYC submission for ${name || 'this agent'}?\nThis will allow the agent to upload fresh KYC documents.`)) {
      return;
    }
    try {
      await AdminApiService.deleteKyc(agentId);
      await fetchKycQueue();
    } catch (err: any) {
      alert(err.message || 'Failed to reset KYC');
    }
  };

  const handleDeleteAgent = async (agentId: string, name?: string | null) => {
    if (!window.confirm(`⚠️ WARNING: Permanently delete agent ${name || 'partner'} and ALL their listings, KYC files, and transactions?\nThis action cannot be undone.`)) {
      return;
    }
    try {
      await AdminApiService.deleteAgent(agentId);
      await fetchKycQueue();
    } catch (err: any) {
      alert(err.message || 'Failed to delete agent');
    }
  };

  const [customPhotos, setCustomPhotos] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem('admin_custom_kyc_photos') || '{}');
    } catch {
      return {};
    }
  });

  const handleLocalImagePick = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setCustomPhotos((prev) => {
          const next = { ...prev, [type]: dataUrl };
          localStorage.setItem('admin_custom_kyc_photos', JSON.stringify(next));
          return next;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const allCount = agents.length;
  const pendingCount = agents.filter((a) => a.kycStatus !== 'APPROVED' && a.kycStatus !== 'REJECTED').length;
  const approvedCount = agents.filter((a) => a.kycStatus === 'APPROVED').length;
  const rejectedCount = agents.filter((a) => a.kycStatus === 'REJECTED').length;

  // Sorting State
  const [sortField, setSortField] = useState<'date' | 'name' | 'status'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedAgents = React.useMemo(() => {
    const list = agents.filter((agent) => {
      // Tab filtering
      if (activeTab === 'PENDING') {
        if (agent.kycStatus === 'APPROVED' || agent.kycStatus === 'REJECTED') return false;
      } else if (activeTab === 'APPROVED') {
        if (agent.kycStatus !== 'APPROVED') return false;
      } else if (activeTab === 'REJECTED') {
        if (agent.kycStatus !== 'REJECTED') return false;
      }

      // Search filtering
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const nameMatch = (agent.fullName || '').toLowerCase().includes(q);
        const phoneMatch = (agent.mobileNumber || '').includes(q);
        const locMatch = (agent.areaLocation || '').toLowerCase().includes(q);
        return nameMatch || phoneMatch || locMatch;
      }

      return true;
    });

    return list.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = (a.fullName || '').localeCompare(b.fullName || '');
      } else if (sortField === 'status') {
        comparison = (a.kycStatus || '').localeCompare(b.kycStatus || '');
      } else if (sortField === 'date') {
        comparison = new Date(a.createdAt || a.submittedAt || 0).getTime() - new Date(b.createdAt || b.submittedAt || 0).getTime();
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [agents, activeTab, search, sortField, sortDirection]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">KYC Identity Verification Queue</h2>
          <p className="text-slate-500 text-sm mt-1">
            Review agent identity documents, bank details, and manage approvals and rejections.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Sort Selector */}
          <div className="flex items-center space-x-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm text-xs">
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="font-bold text-slate-500 hidden sm:inline">Sort:</span>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as any)}
              className="bg-transparent font-bold text-slate-800 border-none focus:outline-none cursor-pointer pr-1"
            >
              <option value="date">Submission Date</option>
              <option value="name">Agent Name</option>
              <option value="status">KYC Status</option>
            </select>
            <button
              onClick={() => setSortDirection((d) => (d === 'desc' ? 'asc' : 'desc'))}
              className="p-1 hover:bg-slate-100 rounded text-emerald-600 transition-colors"
              title="Toggle Ascending/Descending"
            >
              {sortDirection === 'desc' ? <ArrowDown className="h-3.5 w-3.5" /> : <ArrowUp className="h-3.5 w-3.5" />}
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search name, phone, area..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 w-56 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs Header */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'ALL'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>All Submissions</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'ALL' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-700'}`}>
            {allCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('PENDING')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'PENDING'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
          }`}
        >
          <span>Pending Review</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'PENDING' ? 'bg-amber-800 text-white' : 'bg-amber-100 text-amber-800'}`}>
            {pendingCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('APPROVED')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'APPROVED'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
          }`}
        >
          <span>Approved Agents</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'APPROVED' ? 'bg-emerald-800 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
            {approvedCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('REJECTED')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'REJECTED'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
          }`}
        >
          <span>Rejected Agents</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'REJECTED' ? 'bg-rose-800 text-white' : 'bg-rose-100 text-rose-800'}`}>
            {rejectedCount}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 py-12 text-center text-slate-400">Loading KYC submissions...</div>
        ) : filteredAndSortedAgents.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-slate-400 bg-white border border-slate-200 rounded-2xl">
            <ShieldCheck className="h-10 w-10 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-700 text-sm">No Agents in {activeTab === 'ALL' ? 'Queue' : activeTab === 'APPROVED' ? 'Approved List' : activeTab === 'REJECTED' ? 'Rejected List' : 'Pending List'}</p>
            <p className="text-xs text-slate-400 mt-1">Agents will appear here according to their verification status.</p>
          </div>
        ) : (
          filteredAndSortedAgents.map((agent) => {
            const aadhaarNumber = agent.aadhaarFullNumber || (agent.aadhaarLast4 ? `•••• •••• ${agent.aadhaarLast4}` : 'Not Submitted');
            const panNumber = agent.panFullNumber || agent.panMasked || 'Not Submitted';
            const bankAccount = agent.bankAccountFullNumber || (agent.bankAccountLast4 ? `•••• ${agent.bankAccountLast4}` : 'Not Submitted');

            return (
              <div
                key={agent.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5 flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                {/* Agent Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center space-x-3.5">
                    {agent.profilePhotoUrl ? (
                      <img
                        src={agent.profilePhotoUrl}
                        alt="Selfie"
                        className="h-16 w-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-md cursor-pointer hover:scale-105 transition-transform"
                        onClick={() =>
                          openPreview({
                            title: `Selfie Photo - ${agent.fullName || 'Agent'}`,
                            key: agent.profilePhotoUrl!,
                            url: agent.profilePhotoUrl,
                            type: 'SELFIE',
                          })
                        }
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 font-extrabold flex flex-col items-center justify-center text-xs shadow-sm">
                        <User className="h-7 w-7 mb-0.5 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-500">{agent.fullName ? agent.fullName.charAt(0).toUpperCase() : 'A'}</span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{agent.fullName || 'Agent Partner'}</h3>
                      <p className="text-xs text-slate-600 font-semibold">+91 {agent.mobileNumber}</p>
                      <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
                        <span>Age: {agent.age || 'N/A'} yrs</span>
                        <span>•</span>
                        <span>Gender: {agent.gender || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-1.5">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide ${
                        agent.kycStatus === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : agent.kycStatus === 'REJECTED'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      KYC: {agent.kycStatus}
                    </span>
                    <span className="px-2.5 py-0.5 bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-[10px] font-bold flex items-center space-x-1">
                      <ShieldCheck className="h-3 w-3 text-emerald-600" />
                      <span>Partner KYC Profile</span>
                    </span>
                  </div>
                </div>

                {/* Location & Occupation */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Operating Location</span>
                      <span className="font-semibold text-slate-800">{agent.areaLocation || 'Not Specified'}</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Briefcase className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Occupation Platform</span>
                      <span className="font-semibold text-slate-800">{agent.workPlatform || 'Individual'}</span>
                    </div>
                  </div>
                </div>

                {/* Identity Documents Grid with Photo Previews */}
                <div className="space-y-2.5">
                  <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <FileText className="h-4 w-4 text-emerald-600" />
                      <span>Submitted Documents & Card Photos</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Aadhaar Card */}
                    <div className="border border-slate-200 rounded-xl p-3.5 bg-gradient-to-b from-white to-slate-50 space-y-2.5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-600 uppercase">Aadhaar Card</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                          agent.aadhaarDocKey ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-slate-500 bg-slate-100 border-slate-200'
                        }`}>
                          {agent.aadhaarDocKey ? 'SUBMITTED' : 'NOT SUBMITTED'}
                        </span>
                      </div>
                      <div className="font-mono text-sm font-black text-slate-900 tracking-wider">
                        {aadhaarNumber}
                      </div>
                      {agent.aadhaarDocKey || agent.aadhaarDocUrl ? (
                        <button
                          type="button"
                          onClick={() =>
                            openPreview({
                              title: `Aadhaar Card Document Photo - ${agent.fullName || 'Agent'}`,
                              key: agent.aadhaarDocKey || '',
                              url: agent.aadhaarDocUrl,
                              type: 'AADHAAR',
                              number: aadhaarNumber,
                              name: agent.fullName || 'Agent',
                            })
                          }
                          className="w-full py-2 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition-all"
                        >
                          <ImageIcon className="h-3.5 w-3.5" />
                          <span>View Uploaded Aadhaar Photo</span>
                        </button>
                      ) : (
                        <div className="w-full py-2 px-2.5 bg-slate-100 text-slate-400 rounded-lg text-xs font-medium flex items-center justify-center space-x-1 border border-slate-200">
                          <AlertCircle className="h-3.5 w-3.5" />
                          <span>No Aadhaar Photo Uploaded</span>
                        </div>
                      )}
                    </div>

                    {/* PAN Card */}
                    <div className="border border-slate-200 rounded-xl p-3.5 bg-gradient-to-b from-white to-slate-50 space-y-2.5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-600 uppercase">PAN Card</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                          agent.panDocKey ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-slate-500 bg-slate-100 border-slate-200'
                        }`}>
                          {agent.panDocKey ? 'SUBMITTED' : 'NOT SUBMITTED'}
                        </span>
                      </div>
                      <div className="font-mono text-sm font-black text-slate-900 tracking-wider">
                        {panNumber}
                      </div>
                      {agent.panDocKey || agent.panDocUrl ? (
                        <button
                          type="button"
                          onClick={() =>
                            openPreview({
                              title: `PAN Card Document Photo - ${agent.fullName || 'Agent'}`,
                              key: agent.panDocKey || '',
                              url: agent.panDocUrl,
                              type: 'PAN',
                              number: panNumber,
                              name: agent.fullName || 'Agent',
                            })
                          }
                          className="w-full py-2 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition-all"
                        >
                          <ImageIcon className="h-3.5 w-3.5" />
                          <span>View Uploaded PAN Photo</span>
                        </button>
                      ) : (
                        <div className="w-full py-2 px-2.5 bg-slate-100 text-slate-400 rounded-lg text-xs font-medium flex items-center justify-center space-x-1 border border-slate-200">
                          <AlertCircle className="h-3.5 w-3.5" />
                          <span>No PAN Photo Uploaded</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Banking & Payout Details */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
                  <div className="font-bold text-slate-900 flex items-center space-x-1.5 mb-1.5">
                    <CreditCard className="h-3.5 w-3.5 text-slate-600" />
                    <span>Bank & Payout Details</span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Account Number:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {bankAccount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">IFSC Code:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {agent.bankIfscCode || 'Not Submitted'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Primary UPI:</span>
                      <span className="font-mono font-bold text-slate-900 truncate">
                        {agent.bankUpiId || 'Not Submitted'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">PhonePe / Paytm:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {agent.bankPhonepeNumber || 'Not Submitted'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rejection Reason Notice if Rejected */}
                {agent.kycStatus === 'REJECTED' && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 space-y-1">
                    <div className="font-bold flex items-center space-x-1 text-rose-700">
                      <ShieldAlert className="h-3.5 w-3.5" />
                      <span>KYC Verification Rejected</span>
                    </div>
                    {agent.rejectionReason && <p className="text-slate-700">{agent.rejectionReason}</p>}
                  </div>
                )}

                {/* Terms & Conditions Acceptance */}
                <div className="flex items-center space-x-2 text-[11px] text-slate-500 bg-emerald-50/60 border border-emerald-100 rounded-xl px-3 py-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Agreed to Agent Terms & Conditions and KYC Compliance Policy</span>
                </div>

                {/* Action & Management Toolbar */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center space-x-2">
                    {agent.kycStatus === 'REJECTED' ? (
                      <button
                        onClick={() => handleReview(agent.id, true)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 font-bold py-2 rounded-xl text-xs text-white flex items-center justify-center space-x-1.5 shadow-sm transition-all"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        <span>Approve KYC</span>
                      </button>
                    ) : agent.kycStatus === 'APPROVED' ? (
                      <>
                        <div className="flex-1 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold py-2 rounded-xl text-xs flex items-center justify-center space-x-1.5">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <span>KYC Approved</span>
                        </div>
                        <button
                          onClick={() => handleReview(agent.id, false)}
                          className="px-3 py-2 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 font-bold rounded-xl text-xs border border-rose-200 flex items-center justify-center space-x-1 transition-all"
                          title="Reject KYC"
                        >
                          <ShieldAlert className="h-3.5 w-3.5" />
                          <span>Reject</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleReview(agent.id, true)}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 font-bold py-2 rounded-xl text-xs text-white flex items-center justify-center space-x-1.5 shadow-sm transition-all"
                        >
                          <ShieldCheck className="h-4 w-4" />
                          <span>Approve KYC</span>
                        </button>
                        <button
                          onClick={() => handleReview(agent.id, false)}
                          className="flex-1 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 font-bold py-2 rounded-xl text-xs border border-rose-200 flex items-center justify-center space-x-1.5 transition-all"
                        >
                          <ShieldAlert className="h-4 w-4" />
                          <span>Reject KYC</span>
                        </button>
                      </>
                    )}

                    {/* Edit Details Action */}
                    <button
                      onClick={() => handleOpenEdit(agent)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs border border-slate-200 flex items-center justify-center space-x-1 transition-all"
                      title="Edit Agent & KYC Details"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-slate-600" />
                      <span>Edit</span>
                    </button>

                    {/* Reset KYC Action */}
                    <button
                      onClick={() => handleDeleteKyc(agent.id, agent.fullName)}
                      className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-xs font-bold transition-all"
                      title="Reset / Delete KYC Submission (allows partner to re-upload)"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>

                    {/* Delete Agent Action */}
                    <button
                      onClick={() => handleDeleteAgent(agent.id, agent.fullName)}
                      className="p-2 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all"
                      title="Permanently Delete Agent Partner"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* High-Fidelity Photo Document Viewer Modal */}
      {previewDoc && (
        <Modal
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          title={previewDoc.title}
        >
          <div className="space-y-4">
            <div className="bg-slate-100 border border-slate-300 rounded-2xl p-4 flex flex-col items-center justify-center shadow-inner">
              {/* If preview has a direct image URL or Data URI, render with inspection toolbar */}
              {previewDoc.url && (previewDoc.url.startsWith('http') || previewDoc.url.startsWith('data:image/')) ? (
                <div className="w-full flex flex-col items-center space-y-3">
                  {/* Inspection Toolbar */}
                  <div className="flex flex-wrap items-center justify-between w-full gap-2 px-1 pb-2 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-700">Live Document Photo Stream</span>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setZoomScale((s) => Math.max(0.6, s - 0.2))}
                        className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold hover:bg-slate-50 shadow-xs"
                        title="Zoom Out"
                      >
                        -
                      </button>
                      <span className="text-xs font-mono font-bold text-slate-600 min-w-[36px] text-center">
                        {Math.round(zoomScale * 100)}%
                      </span>
                      <button
                        type="button"
                        onClick={() => setZoomScale((s) => Math.min(3.0, s + 0.2))}
                        className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold hover:bg-slate-50 shadow-xs"
                        title="Zoom In"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => setRotation((r) => (r + 90) % 360)}
                        className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold hover:bg-slate-50 shadow-xs flex items-center space-x-1"
                        title="Rotate 90 degrees"
                      >
                        <span>Rotate ↻</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => window.open(previewDoc.url!, '_blank')}
                        className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 shadow-sm flex items-center space-x-1"
                        title="Open in new window"
                      >
                        <span>Open Full Image ↗</span>
                      </button>
                    </div>
                  </div>

                  {/* Image Container with Zoom and Rotation */}
                  <div className="w-full max-h-[460px] overflow-auto flex items-center justify-center p-3 bg-slate-900/5 rounded-xl border border-slate-200">
                    <img
                      src={previewDoc.url}
                      alt={previewDoc.title}
                      style={{
                        transform: `scale(${zoomScale}) rotate(${rotation}deg)`,
                        transition: 'transform 0.2s ease-in-out',
                      }}
                      className="max-h-[400px] max-w-full rounded-xl object-contain shadow-xl border border-slate-300 bg-white"
                    />
                  </div>

                  <div className="flex items-center justify-between w-full text-xs text-slate-500 pt-1">
                    <span className="flex items-center space-x-1 text-emerald-700 font-bold">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Original Document Submitted by Agent</span>
                    </span>
                    <span className="font-mono text-[11px] text-slate-400 truncate max-w-[260px]">
                      {previewDoc.key}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-md text-center space-y-3">
                  <FileText className="h-12 w-12 text-slate-400 mx-auto" />
                  <h4 className="font-bold text-slate-900">{previewDoc.title}</h4>
                  <p className="text-xs text-slate-500 font-mono break-all">Key: {previewDoc.key}</p>
                  {previewDoc.number && (
                    <div className="bg-slate-50 p-2.5 rounded-xl text-sm font-bold font-mono text-slate-800 border border-slate-200">
                      ID Number: {previewDoc.number}
                    </div>
                  )}
                  <p className="text-xs text-slate-500">Document encrypted in backend storage.</p>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
              >
                Close Document Photo
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Partner & KYC Details Modal */}
      {editingAgent && (
        <Modal
          isOpen={!!editingAgent}
          onClose={() => setEditingAgent(null)}
          title={`Edit Partner & KYC Details — ${editingAgent.fullName || 'Agent'}`}
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600">
              Editing details for Partner ID: <span className="font-mono font-bold text-slate-900">{editingAgent.id}</span>
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Operating Location</label>
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

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Aadhaar Card Number</label>
                <input
                  type="text"
                  value={editForm.aadhaarNumber}
                  onChange={(e) => setEditForm({ ...editForm, aadhaarNumber: e.target.value })}
                  placeholder="12-digit Aadhaar number"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">PAN Card Number</label>
                <input
                  type="text"
                  value={editForm.panNumber}
                  onChange={(e) => setEditForm({ ...editForm, panNumber: e.target.value.toUpperCase() })}
                  placeholder="10-digit PAN"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bank Account Number</label>
                <input
                  type="text"
                  value={editForm.bankAccountNumber}
                  onChange={(e) => setEditForm({ ...editForm, bankAccountNumber: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bank IFSC Code</label>
                <input
                  type="text"
                  value={editForm.bankIfscCode}
                  onChange={(e) => setEditForm({ ...editForm, bankIfscCode: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Primary UPI ID</label>
                <input
                  type="text"
                  value={editForm.bankUpiId}
                  onChange={(e) => setEditForm({ ...editForm, bankUpiId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">PhonePe / Paytm Number</label>
                <input
                  type="text"
                  value={editForm.bankPhonepeNumber}
                  onChange={(e) => setEditForm({ ...editForm, bankPhonepeNumber: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">KYC Verification Status</label>
                <select
                  value={editForm.kycStatus}
                  onChange={(e) => setEditForm({ ...editForm, kycStatus: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600 font-semibold"
                >
                  <option value="APPROVED">APPROVED (Verified Partner)</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW (Pending Review)</option>
                  <option value="NOT_SUBMITTED">NOT_SUBMITTED (Unsubmitted)</option>
                  <option value="REJECTED">REJECTED (Verification Failed)</option>
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
                <span>{isSaving ? 'Saving Changes...' : 'Save & Update Details'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
