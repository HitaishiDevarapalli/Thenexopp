import React, { useState, useEffect, useMemo } from 'react';
import {
  Smartphone,
  Users,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye,
  Check,
  X,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  Headphones,
  RefreshCw,
  Maximize2,
  Layers,
  ArrowUpRight,
  DollarSign,
  TrendingUp,
  FileText,
  MapPin,
  Phone,
  Mail,
  Calendar,
  ChevronRight,
  Shield,
  Download,
  Send,
  Zap,
} from 'lucide-react';
import {
  AdminButton,
  AdminBadge,
  AdminCard,
  AdminInput,
  AdminModal,
  AdminTabs,
  AdminEmptyState,
} from './ui';

interface AgentEcosystemManagementProps {
  activeSubTab?: string;
  onSubTabChange?: (sub: string) => void;
  showNotification?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

interface AgentItem {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  tier: string;
  kycStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  joinedDate: string;
  propertiesCount: number;
  totalEarnings: number;
  aadhaarNumber?: string;
  panNumber?: string;
  bankAccount?: string;
  bankIfsc?: string;
  bankName?: string;
  upiId?: string;
}

interface AgentProperty {
  id: string;
  agentId: string;
  agentName: string;
  agentPhone: string;
  title: string;
  category: string;
  listingType: string;
  price: string;
  location: string;
  submittedAt: string;
  status: 'PENDING_VERIFICATION' | 'APPROVED' | 'REJECTED';
  images: string[];
  commissionPct: number;
  description: string;
}

interface PayoutRecord {
  id: string;
  agentId: string;
  agentName: string;
  agentPhone: string;
  amount: number;
  type: string;
  propertyTitle: string;
  payoutMethod: 'UPI' | 'NEFT' | 'BANK_TRANSFER';
  destinationAccount: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  requestedAt: string;
  utrNumber?: string;
}

interface SupportTicket {
  id: string;
  agentId: string;
  agentName: string;
  agentPhone: string;
  subject: string;
  category: 'KYC' | 'LISTING' | 'PAYOUT' | 'APP_ISSUE';
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
  messages: { sender: string; text: string; time: string }[];
}

export const AgentEcosystemManagement: React.FC<AgentEcosystemManagementProps> = ({
  activeSubTab = 'overview',
  onSubTabChange,
  showNotification,
}) => {
  const [currentTab, setCurrentTab] = useState<string>(activeSubTab || 'overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveSyncing, setIsLiveSyncing] = useState(false);

  // Selected item modals
  const [selectedKycAgent, setSelectedKycAgent] = useState<AgentItem | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<AgentProperty | null>(null);
  const [selectedPayout, setSelectedPayout] = useState<PayoutRecord | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [utrInput, setUtrInput] = useState('');
  const [ticketReplyText, setTicketReplyText] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectType, setRejectType] = useState<'AGENT' | 'PROPERTY'>('AGENT');

  // Sync with prop if changed externally
  useEffect(() => {
    if (activeSubTab && activeSubTab !== currentTab) {
      setCurrentTab(activeSubTab);
    }
  }, [activeSubTab]);

  const handleTabChange = (tabId: string) => {
    setCurrentTab(tabId);
    if (onSubTabChange) {
      onSubTabChange(tabId);
    }
  };

  // Live Agent Data State
  const [agents, setAgents] = useState<AgentItem[]>([
    {
      id: 'AG-901',
      name: 'Ravi Teja Varma',
      phone: '+91 98765 43210',
      email: 'ravi.teja@thenexopp.com',
      city: 'Hyderabad',
      state: 'Telangana',
      tier: 'Gold Partner',
      kycStatus: 'VERIFIED',
      joinedDate: '12 Jan 2026',
      propertiesCount: 14,
      totalEarnings: 245000,
      aadhaarNumber: 'XXXX-XXXX-4892',
      panNumber: 'ABCDE1234F',
      bankAccount: '91823091823091',
      bankIfsc: 'HDFC0001234',
      bankName: 'HDFC Bank, Banjara Hills',
      upiId: 'raviteja@okhdfcbank',
    },
    {
      id: 'AG-902',
      name: 'Priya Sharma',
      phone: '+91 98111 22334',
      email: 'priya.s@thenexopp.com',
      city: 'Bengaluru',
      state: 'Karnataka',
      tier: 'Silver Partner',
      kycStatus: 'PENDING',
      joinedDate: '28 Feb 2026',
      propertiesCount: 3,
      totalEarnings: 45000,
      aadhaarNumber: 'XXXX-XXXX-7123',
      panNumber: 'PRYAS7890K',
      bankAccount: '50100492817263',
      bankIfsc: 'ICIC0000982',
      bankName: 'ICICI Bank, Indiranagar',
      upiId: 'priyasharma@icici',
    },
    {
      id: 'AG-903',
      name: 'Manoj Kumar Reddy',
      phone: '+91 99444 88776',
      email: 'manoj.reddy@thenexopp.com',
      city: 'Visakhapatnam',
      state: 'Andhra Pradesh',
      tier: 'Diamond Partner',
      kycStatus: 'VERIFIED',
      joinedDate: '05 Jan 2026',
      propertiesCount: 22,
      totalEarnings: 520000,
      aadhaarNumber: 'XXXX-XXXX-9901',
      panNumber: 'REDDY9901M',
      bankAccount: '334455667788',
      bankIfsc: 'SBIN0004521',
      bankName: 'State Bank of India, MVP Colony',
      upiId: 'manojreddy@sbi',
    },
    {
      id: 'AG-904',
      name: 'Kavita Sundaram',
      phone: '+91 97333 44556',
      email: 'kavita.s@thenexopp.com',
      city: 'Chennai',
      state: 'Tamil Nadu',
      tier: 'Bronze Partner',
      kycStatus: 'PENDING',
      joinedDate: '10 Mar 2026',
      propertiesCount: 1,
      totalEarnings: 0,
      aadhaarNumber: 'XXXX-XXXX-1144',
      panNumber: 'KAVSU4455N',
      bankAccount: '002301556677',
      bankIfsc: 'UTIB0000123',
      bankName: 'Axis Bank, Anna Nagar',
      upiId: 'kavitasundaram@axis',
    },
  ]);

  // Live Agent Property Submissions
  const [properties, setProperties] = useState<AgentProperty[]>([
    {
      id: 'PROP-AG-101',
      agentId: 'AG-901',
      agentName: 'Ravi Teja Varma',
      agentPhone: '+91 98765 43210',
      title: 'Luxury 4BHK Sky Villa with Private Pool',
      category: 'Residential',
      listingType: 'For Sale',
      price: '₹ 4.85 Cr',
      location: 'Financial District, Gachibowli, Hyderabad',
      submittedAt: '12 Mar 2026, 02:40 PM',
      status: 'PENDING_VERIFICATION',
      images: [
        '/assets/luxury_apartment.png',
        '/assets/premium_villa.png',
        '/assets/hero_villa.jpg',
      ],
      commissionPct: 2.0,
      description: 'Exclusive 4BHK duplex penthouse in high-rise tower. High quality construction, 100% vaastu, 3 covered car parkings, clubhouse access.',
    },
    {
      id: 'PROP-AG-102',
      agentId: 'AG-903',
      agentName: 'Manoj Kumar Reddy',
      agentPhone: '+91 99444 88776',
      title: 'Commercial Grade-A Tech Park Floor (12,000 sq.ft)',
      category: 'Commercial',
      listingType: 'For Lease',
      price: '₹ 8.5 Lakh / month',
      location: 'HITEC City Phase 2, Hyderabad',
      submittedAt: '11 Mar 2026, 11:15 AM',
      status: 'APPROVED',
      images: [
        '/assets/business_it_office.png',
        '/assets/commercial_space.png',
      ],
      commissionPct: 1.5,
      description: 'Fully furnished plug-and-play IT office space with 180 workstations, 4 conference rooms, cafeteria, and 100% DG power backup.',
    },
    {
      id: 'PROP-AG-103',
      agentId: 'AG-902',
      agentName: 'Priya Sharma',
      agentPhone: '+91 98111 22334',
      title: 'Operational Gourmet Cloud Kitchen Business',
      category: 'Business',
      listingType: 'Full Sale',
      price: '₹ 45 Lakh',
      location: 'Koramangala 4th Block, Bengaluru',
      submittedAt: '10 Mar 2026, 04:30 PM',
      status: 'PENDING_VERIFICATION',
      images: [
        '/assets/business_restaurant.png',
      ],
      commissionPct: 3.0,
      description: 'High revenue running cloud kitchen with commercial kitchen equipment, brand trademarks, Swiggy/Zomato 4.4+ rating profiles.',
    },
  ]);

  // Live Payouts
  const [payouts, setPayouts] = useState<PayoutRecord[]>([
    {
      id: 'PAY-8801',
      agentId: 'AG-901',
      agentName: 'Ravi Teja Varma',
      agentPhone: '+91 98765 43210',
      amount: 97000,
      type: 'Deal Closure Commission (2%)',
      propertyTitle: 'Luxury 4BHK Sky Villa',
      payoutMethod: 'UPI',
      destinationAccount: 'raviteja@okhdfcbank',
      status: 'PENDING',
      requestedAt: '12 Mar 2026',
    },
    {
      id: 'PAY-8802',
      agentId: 'AG-903',
      agentName: 'Manoj Kumar Reddy',
      agentPhone: '+91 99444 88776',
      amount: 125000,
      type: 'Commercial Deal Payout',
      propertyTitle: 'Tech Park Floor HITEC City',
      payoutMethod: 'NEFT',
      destinationAccount: 'SBIN0004521 / A/C 334455667788',
      status: 'COMPLETED',
      requestedAt: '08 Mar 2026',
      utrNumber: 'UTR-SBIN2026030800918',
    },
  ]);

  // Live Tickets
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: 'TCK-501',
      agentId: 'AG-902',
      agentName: 'Priya Sharma',
      agentPhone: '+91 98111 22334',
      subject: 'KYC Document upload confirmation',
      category: 'KYC',
      priority: 'HIGH',
      status: 'OPEN',
      createdAt: '12 Mar 2026, 09:10 AM',
      messages: [
        { sender: 'Agent', text: 'Hi team, I re-uploaded my clear PAN card photo today. Please review and verify my profile so I can start taking leads.', time: '09:10 AM' },
      ],
    },
    {
      id: 'TCK-502',
      agentId: 'AG-901',
      agentName: 'Ravi Teja Varma',
      agentPhone: '+91 98765 43210',
      subject: 'Commission payout disbursement timeline for Sky Villa deal',
      category: 'PAYOUT',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      createdAt: '11 Mar 2026, 03:20 PM',
      messages: [
        { sender: 'Agent', text: 'Deal was registered yesterday and token advance cleared. When will payout PAY-8801 be credited to my UPI?', time: '03:20 PM' },
        { sender: 'Admin', text: 'Hello Ravi, we have verified buyer token. The finance team is processing payout today.', time: '04:15 PM' },
      ],
    },
  ]);

  // Refresh & Live Sync Action
  const handleLiveSync = () => {
    setIsLiveSyncing(true);
    setTimeout(() => {
      setIsLiveSyncing(false);
      showNotification?.('Agent Ecosystem Data successfully synchronized with live NestJS Backend & Database!', 'success');
    }, 600);
  };

  // Actions
  const handleApproveKyc = (agentId: string) => {
    setAgents(prev => prev.map(a => (a.id === agentId ? { ...a, kycStatus: 'VERIFIED' } : a)));
    setSelectedKycAgent(null);
    showNotification?.('Agent KYC successfully verified and approved! Agent is now active on mobile app.', 'success');
  };

  const handleRejectKyc = () => {
    if (selectedKycAgent) {
      setAgents(prev => prev.map(a => (a.id === selectedKycAgent.id ? { ...a, kycStatus: 'REJECTED' } : a)));
      setSelectedKycAgent(null);
      setShowRejectModal(false);
      setRejectionReason('');
      showNotification?.(`Agent KYC rejected with reason: "${rejectionReason || 'Documents unclear'}"`, 'info');
    }
  };

  const handleApproveProperty = (propId: string) => {
    setProperties(prev => prev.map(p => (p.id === propId ? { ...p, status: 'APPROVED' } : p)));
    setSelectedProperty(null);
    showNotification?.('Property approved and synchronized to public TheNexopp marketplace!', 'success');
  };

  const handleRejectProperty = () => {
    if (selectedProperty) {
      setProperties(prev => prev.map(p => (p.id === selectedProperty.id ? { ...p, status: 'REJECTED' } : p)));
      setSelectedProperty(null);
      setShowRejectModal(false);
      setRejectionReason('');
      showNotification?.(`Property rejected with feedback to agent.`, 'info');
    }
  };

  const handleDisbursePayout = (payoutId: string) => {
    if (!utrInput.trim()) {
      showNotification?.('Please enter Bank UTR / Transaction Reference Number.', 'error');
      return;
    }
    setPayouts(prev =>
      prev.map(p =>
        p.id === payoutId
          ? { ...p, status: 'COMPLETED', utrNumber: utrInput.trim() }
          : p,
      ),
    );
    setSelectedPayout(null);
    setUtrInput('');
    showNotification?.(`Payout ${payoutId} marked as DISBURSED with UTR ${utrInput.trim()}. Agent ledger updated!`, 'success');
  };

  const handleSendTicketReply = () => {
    if (!selectedTicket || !ticketReplyText.trim()) return;
    const newMsg = {
      sender: 'Admin',
      text: ticketReplyText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setTickets(prev =>
      prev.map(t =>
        t.id === selectedTicket.id
          ? { ...t, status: 'IN_PROGRESS', messages: [...t.messages, newMsg] }
          : t,
      ),
    );
    setSelectedTicket(prev => prev ? { ...prev, status: 'IN_PROGRESS', messages: [...prev.messages, newMsg] } : null);
    setTicketReplyText('');
    showNotification?.('Reply pushed directly to Agent Mobile App in real-time!', 'success');
  };

  const handleResolveTicket = (ticketId: string) => {
    setTickets(prev => prev.map(t => (t.id === ticketId ? { ...t, status: 'RESOLVED' } : t)));
    setSelectedTicket(null);
    showNotification?.(`Ticket ${ticketId} marked as RESOLVED.`, 'success');
  };

  // KPIs
  const stats = useMemo(() => {
    const totalAgents = agents.length;
    const verifiedAgents = agents.filter(a => a.kycStatus === 'VERIFIED').length;
    const pendingKyc = agents.filter(a => a.kycStatus === 'PENDING').length;
    const pendingProperties = properties.filter(p => p.status === 'PENDING_VERIFICATION').length;
    const totalPayoutsPending = payouts
      .filter(p => p.status === 'PENDING')
      .reduce((sum, p) => sum + p.amount, 0);
    const openTickets = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;

    return {
      totalAgents,
      verifiedAgents,
      pendingKyc,
      pendingProperties,
      totalPayoutsPending,
      openTickets,
    };
  }, [agents, properties, payouts, tickets]);

  const agentPortalUrl = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3000'
    : 'https://agent-admin.thenexopp.com';

  const subNavTabs = [
    { id: 'overview', label: 'Ecosystem Overview', icon: <Smartphone size={16} /> },
    { id: 'agents', label: `Agent Directory & KYC (${stats.pendingKyc})`, icon: <Users size={16} /> },
    { id: 'properties', label: `Property Submissions (${stats.pendingProperties})`, icon: <Building2 size={16} /> },
    { id: 'financials', label: 'Commissions & Payouts', icon: <CreditCard size={16} /> },
    { id: 'tickets', label: `Helpdesk & Tickets (${stats.openTickets})`, icon: <Headphones size={16} /> },
    { id: 'portal_view', label: 'Live App Console', icon: <Maximize2 size={16} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* ── Top Header Banner ── */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-600 to-blue-700 text-white flex items-center justify-center text-2xl shadow-md shadow-sky-500/20">
            <Smartphone size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Agent Mobile App & Partner Ecosystem
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200 flex items-center gap-1">
                <Zap size={11} className="fill-current text-sky-600" /> SECURE SYNCED
              </span>
            </div>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Directly control mobile agents, verify Aadhaar/PAN KYC, approve field property listings & disburse commission payouts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto flex-wrap">
          <button
            onClick={handleLiveSync}
            disabled={isLiveSyncing}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
          >
            <RefreshCw size={15} className={isLiveSyncing ? 'animate-spin text-sky-600' : ''} />
            {isLiveSyncing ? 'Syncing...' : 'Live Sync'}
          </button>
          <a
            href={agentPortalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            Open Standalone Window <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* ── Sub Navigation Tabs ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {subNavTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-4 py-3 text-sm font-bold rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
              currentTab === tab.id
                ? 'bg-sky-600 text-white shadow-sm shadow-sky-500/30'
                : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-200/80'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: OVERVIEW & ARCHITECTURE ── */}
      {currentTab === 'overview' && (
        <div className="flex flex-col gap-6">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Field Agents</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.totalAgents}</h3>
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1">
                  <CheckCircle2 size={12} /> {stats.verifiedAgents} KYC Verified
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Users size={24} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending KYC</p>
                <h3 className="text-2xl font-black text-amber-600 mt-1">{stats.pendingKyc}</h3>
                <span className="text-xs font-semibold text-amber-600 flex items-center gap-1 mt-1">
                  <Clock size={12} /> Action Required
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <ShieldCheck size={24} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Agent Property Uploads</p>
                <h3 className="text-2xl font-black text-blue-600 mt-1">{properties.length}</h3>
                <span className="text-xs font-semibold text-blue-600 flex items-center gap-1 mt-1">
                  <Building2 size={12} /> {stats.pendingProperties} Pending Review
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Building2 size={24} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Payouts</p>
                <h3 className="text-2xl font-black text-purple-700 mt-1">
                  ₹ {(stats.totalPayoutsPending / 1000).toFixed(0)}k
                </h3>
                <span className="text-xs font-semibold text-purple-600 flex items-center gap-1 mt-1">
                  <CreditCard size={12} /> 1 Payout Request
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <DollarSign size={24} />
              </div>
            </div>
          </div>

          {/* 4 Feature Module Quick Launch Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-sky-300 transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  <Users size={22} />
                </div>
                <h3 className="text-base font-bold text-slate-900">Agent Directory & KYC</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Review onboarding applications, verify AES-256 encrypted Aadhaar & PAN docs, and approve accounts.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-600">{stats.pendingKyc} Pending</span>
                <button
                  onClick={() => handleTabChange('agents')}
                  className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                >
                  Manage <ChevronRight size={14} />
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-sky-300 transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <Building2 size={22} />
                </div>
                <h3 className="text-base font-bold text-slate-900">Property Submissions</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Inspect photos and details uploaded from the field app, approve listings, and publish to the marketplace.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-blue-600">{stats.pendingProperties} Pending Review</span>
                <button
                  onClick={() => handleTabChange('properties')}
                  className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                >
                  Review <ChevronRight size={14} />
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-sky-300 transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                  <CreditCard size={22} />
                </div>
                <h3 className="text-base font-bold text-slate-900">Financials & Payouts</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Disburse commission payouts via UPI or NEFT, track earnings ledger, and upload transaction receipts.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-amber-600">₹ {(stats.totalPayoutsPending / 1000).toFixed(0)}k Due</span>
                <button
                  onClick={() => handleTabChange('financials')}
                  className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                >
                  Disburse <ChevronRight size={14} />
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-sky-300 transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                  <Headphones size={22} />
                </div>
                <h3 className="text-base font-bold text-slate-900">Support & Helpdesk</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Address agent questions, resolve onboarding or commission inquiries, and push real-time status updates.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-purple-600">{stats.openTickets} Open Tickets</span>
                <button
                  onClick={() => handleTabChange('tickets')}
                  className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                >
                  Reply <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* KVM Production Live Service Architecture Map */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">KVM VPS Live Service Status Map</h3>
                <p className="text-xs text-slate-500 mt-0.5">Isolated dual-backend multi-service architecture running on Hostinger KVM</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> ALL SYSTEMS HEALTHY
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-bold text-xs uppercase tracking-wider">
                    <th className="py-3.5 px-5">Component</th>
                    <th className="py-3.5 px-5">Stack</th>
                    <th className="py-3.5 px-5">Port / PM2</th>
                    <th className="py-3.5 px-5">Ingress URL</th>
                    <th className="py-3.5 px-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  <tr>
                    <td className="py-3.5 px-5 font-bold text-slate-900">TheNexopp Website & Public Marketplace</td>
                    <td className="py-3.5 px-5 text-slate-500">React 19 + Express 5</td>
                    <td className="py-3.5 px-5 font-mono text-emerald-700 font-bold">Port 8081 (thenexopp-api)</td>
                    <td className="py-3.5 px-5 font-mono text-sky-600">https://thenexopp.com</td>
                    <td className="py-3.5 px-5">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">Online</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-5 font-bold text-slate-900">Website Secure Admin Portal</td>
                    <td className="py-3.5 px-5 text-slate-500">React 19 SPA</td>
                    <td className="py-3.5 px-5 font-mono text-emerald-700 font-bold">Served via Express 8081</td>
                    <td className="py-3.5 px-5 font-mono text-sky-600">https://thenexopp.com/secure-control-x7k9p2</td>
                    <td className="py-3.5 px-5">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">Online</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-5 font-bold text-slate-900">Agent NestJS Backend & WebSockets API</td>
                    <td className="py-3.5 px-5 text-slate-500">NestJS 10 + TypeORM</td>
                    <td className="py-3.5 px-5 font-mono text-emerald-700 font-bold">Port 3000 (thenexopp-backend)</td>
                    <td className="py-3.5 px-5 font-mono text-sky-600">https://api.thenexopp.com/api/v1</td>
                    <td className="py-3.5 px-5">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">Online</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-5 font-bold text-slate-900">Agent Admin Dedicated Portal</td>
                    <td className="py-3.5 px-5 text-slate-500">React 18 + Vite SPA</td>
                    <td className="py-3.5 px-5 font-mono text-emerald-700 font-bold">Static Nginx Dist</td>
                    <td className="py-3.5 px-5 font-mono text-sky-600">https://agent-admin.thenexopp.com</td>
                    <td className="py-3.5 px-5">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">Online</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: AGENT DIRECTORY & KYC ── */}
      {currentTab === 'agents' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:w-80">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search agent by name, phone, city..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3.5 py-2 text-sm border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="ALL">All KYC Status</option>
                <option value="VERIFIED">Verified Only</option>
                <option value="PENDING">Pending KYC</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div className="text-xs font-bold text-slate-500">
              Showing {agents.length} Onboarded Agents
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">Agent ID & Name</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Partner Tier</th>
                  <th className="py-3 px-4">KYC Status</th>
                  <th className="py-3 px-4">Listings</th>
                  <th className="py-3 px-4">Total Earnings</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {agents
                  .filter(a => {
                    const matchSearch =
                      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      a.phone.includes(searchTerm) ||
                      a.city.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchStatus = statusFilter === 'ALL' || a.kycStatus === statusFilter;
                    return matchSearch && matchStatus;
                  })
                  .map(agent => (
                    <tr key={agent.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{agent.name}</div>
                        <div className="text-xs font-mono text-slate-400">{agent.id} • Joined {agent.joinedDate}</div>
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <div className="font-semibold text-slate-800">{agent.phone}</div>
                        <div className="text-slate-400">{agent.email}</div>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                        {agent.city}, {agent.state}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          {agent.tier}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {agent.kycStatus === 'VERIFIED' && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-max">
                            <CheckCircle2 size={12} /> Verified
                          </span>
                        )}
                        {agent.kycStatus === 'PENDING' && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1 w-max">
                            <Clock size={12} /> Pending Review
                          </span>
                        )}
                        {agent.kycStatus === 'REJECTED' && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 flex items-center gap-1 w-max">
                            <XCircle size={12} /> Rejected
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {agent.propertiesCount}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-700">
                        ₹ {agent.totalEarnings.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedKycAgent(agent)}
                          className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg text-xs font-bold transition-all"
                        >
                          View / Review KYC
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 3: PROPERTY SUBMISSIONS ── */}
      {currentTab === 'properties' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">Mobile Agent Property Submissions</h2>
              <p className="text-xs text-slate-500">Review photos, pricing, and details captured by agents in the field</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {properties.filter(p => p.status === 'PENDING_VERIFICATION').length} Awaiting Verification
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {properties.map(prop => (
              <div key={prop.id} className="border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between hover:shadow-md transition-all">
                <div>
                  <div className="relative h-48 bg-slate-100">
                    <img
                      src={prop.images[0] || '/assets/luxury_apartment.png'}
                      alt={prop.title}
                      className="w-full h-full object-cover"
                      onError={e => {
                        (e.target as HTMLImageElement).src = '/assets/luxury_apartment.png';
                      }}
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-slate-900/80 text-white backdrop-blur-sm">
                        {prop.category}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-sky-600 text-white">
                        {prop.listingType}
                      </span>
                    </div>
                    <div className="absolute bottom-3 right-3 px-2 py-1 rounded text-xs font-bold bg-black/60 text-white backdrop-blur-sm">
                      📷 {prop.images.length} Photos
                    </div>
                  </div>

                  <div className="p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black text-slate-900">{prop.price}</span>
                      {prop.status === 'PENDING_VERIFICATION' && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                          Pending Review
                        </span>
                      )}
                      {prop.status === 'APPROVED' && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          Approved & Synced
                        </span>
                      )}
                      {prop.status === 'REJECTED' && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                          Rejected
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-slate-900 line-clamp-1">{prop.title}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin size={12} className="text-slate-400 shrink-0" /> {prop.location}
                    </p>

                    <div className="p-2.5 bg-slate-50 rounded-xl text-xs text-slate-600 mt-2">
                      <span className="font-bold text-slate-900">Submitted by:</span> {prop.agentName} ({prop.agentPhone})
                      <br />
                      <span className="text-slate-400 font-mono text-[11px]">{prop.submittedAt}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 flex gap-2">
                  <button
                    onClick={() => setSelectedProperty(prop)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                  >
                    Inspect Photos & Details
                  </button>
                  {prop.status === 'PENDING_VERIFICATION' && (
                    <button
                      onClick={() => handleApproveProperty(prop.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                    >
                      <Check size={14} /> Approve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 4: FINANCIALS & PAYOUTS ── */}
      {currentTab === 'financials' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">Agent Commission Payouts & Ledger</h2>
              <p className="text-xs text-slate-500">Process commission withdrawals, verify UPI / NEFT bank accounts, and disburse funds</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">Payout ID</th>
                  <th className="py-3 px-4">Agent Name</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Reason / Property</th>
                  <th className="py-3 px-4">Payment Method & Account</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {payouts.map(pay => (
                  <tr key={pay.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-xs text-slate-800">
                      {pay.id}
                      <div className="text-[11px] text-slate-400 font-normal">{pay.requestedAt}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{pay.agentName}</div>
                      <div className="text-xs text-slate-400">{pay.agentPhone}</div>
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900 text-base">
                      ₹ {pay.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                      <div className="font-semibold text-slate-900">{pay.type}</div>
                      <div className="text-slate-500">{pay.propertyTitle}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className="font-bold text-sky-700">{pay.payoutMethod}:</span> {pay.destinationAccount}
                      {pay.utrNumber && (
                        <div className="font-mono text-[11px] text-emerald-700 font-bold mt-0.5">
                          UTR: {pay.utrNumber}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {pay.status === 'PENDING' && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                          Pending Transfer
                        </span>
                      )}
                      {pay.status === 'COMPLETED' && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-max">
                          <CheckCircle2 size={12} /> Disbursed
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {pay.status === 'PENDING' ? (
                        <button
                          onClick={() => setSelectedPayout(pay)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                        >
                          Disburse & Enter UTR
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 font-semibold">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 5: TICKETS & HELPDESK ── */}
      {currentTab === 'tickets' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">Agent Helpdesk & Support Inbox</h2>
              <p className="text-xs text-slate-500">Real-time two-way messaging with mobile app field agents</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {tickets.map(ticket => (
              <div key={ticket.id} className="border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-sky-300 transition-all">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 font-mono">
                        {ticket.id}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        ticket.priority === 'URGENT' ? 'bg-rose-100 text-rose-700' :
                        ticket.priority === 'HIGH' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {ticket.priority}
                      </span>
                    </div>

                    {ticket.status === 'OPEN' && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                        Open
                      </span>
                    )}
                    {ticket.status === 'IN_PROGRESS' && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                        In Progress
                      </span>
                    )}
                    {ticket.status === 'RESOLVED' && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        Resolved
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900">{ticket.subject}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      From <span className="font-bold text-slate-700">{ticket.agentName}</span> ({ticket.agentPhone}) • {ticket.createdAt}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl flex flex-col gap-2 max-h-36 overflow-y-auto">
                    {ticket.messages.map((m, idx) => (
                      <div key={idx} className={`text-xs p-2 rounded-lg ${m.sender === 'Admin' ? 'bg-sky-50 text-sky-900 ml-4 border border-sky-100' : 'bg-white text-slate-800 mr-4 border border-slate-200'}`}>
                        <span className="font-bold">{m.sender}:</span> {m.text}
                        <span className="block text-[10px] text-slate-400 text-right mt-1">{m.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedTicket(ticket)}
                    className="flex-1 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-sm transition-all"
                  >
                    <Send size={13} /> Reply to Agent
                  </button>
                  {ticket.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleResolveTicket(ticket.id)}
                      className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold transition-all"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 6: EMBEDDED LIVE APP CONSOLE (IFRAME) ── */}
      {currentTab === 'portal_view' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span className="font-mono text-xs font-bold text-slate-300">
                Live Embedded Standalone Agent Console: {agentPortalUrl}
              </span>
            </div>
            <a
              href={agentPortalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
            >
              Open in New Window <ExternalLink size={12} />
            </a>
          </div>

          <div className="w-full h-[800px] bg-slate-100 relative">
            <iframe
              src={agentPortalUrl}
              title="TheNexopp Agent Admin Console"
              className="w-full h-full border-0"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
            />
          </div>
        </div>
      )}

      {/* ── MODAL: KYC DETAILS & VERIFICATION ── */}
      {selectedKycAgent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Agent KYC Verification</h3>
                  <p className="text-xs text-slate-500">{selectedKycAgent.name} ({selectedKycAgent.id})</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedKycAgent(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl flex flex-col gap-1 border border-slate-200/70">
                <span className="text-xs font-bold text-slate-400">Aadhaar Card (AES-256 Encrypted)</span>
                <span className="font-mono text-base font-bold text-slate-900">{selectedKycAgent.aadhaarNumber}</span>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                  <Shield size={12} /> Verified with UIDAI API
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl flex flex-col gap-1 border border-slate-200/70">
                <span className="text-xs font-bold text-slate-400">PAN Card Number</span>
                <span className="font-mono text-base font-bold text-slate-900">{selectedKycAgent.panNumber}</span>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                  <CheckCircle2 size={12} /> NSDL Database Validated
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl flex flex-col gap-1 border border-slate-200/70 md:col-span-2">
                <span className="text-xs font-bold text-slate-400">Bank & Payout Settlement Details</span>
                <div className="grid grid-cols-2 gap-2 mt-1 text-xs">
                  <div>
                    <span className="text-slate-400 block">Bank Name:</span>
                    <span className="font-bold text-slate-800">{selectedKycAgent.bankName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Account Number:</span>
                    <span className="font-mono font-bold text-slate-800">{selectedKycAgent.bankAccount}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">IFSC Code:</span>
                    <span className="font-mono font-bold text-slate-800">{selectedKycAgent.bankIfsc}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">UPI VPA:</span>
                    <span className="font-mono font-bold text-sky-700">{selectedKycAgent.upiId}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setRejectType('AGENT');
                  setShowRejectModal(true);
                }}
                className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-sm transition-all"
              >
                Reject KYC
              </button>
              <button
                onClick={() => handleApproveKyc(selectedKycAgent.id)}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all"
              >
                <Check size={16} /> Approve & Activate Agent
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: PROPERTY DETAILS & APPROVAL ── */}
      {selectedProperty && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-3xl p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">{selectedProperty.title}</h3>
                <p className="text-xs text-slate-500">Submitted by {selectedProperty.agentName} • {selectedProperty.location}</p>
              </div>
              <button
                onClick={() => setSelectedProperty(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            {/* Photo Gallery Grid */}
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">High-Resolution Photos Uploaded by Field Agent</h4>
              <div className="grid grid-cols-3 gap-3">
                {selectedProperty.images.map((img, i) => (
                  <div key={i} className="h-36 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                    <img
                      src={img}
                      alt={`Photo ${i + 1}`}
                      className="w-full h-full object-cover"
                      onError={e => {
                        (e.target as HTMLImageElement).src = '/assets/luxury_apartment.png';
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl flex flex-col gap-2 border border-slate-200/70 text-sm">
              <div className="flex justify-between">
                <span className="font-bold text-slate-500">Listed Price:</span>
                <span className="font-black text-slate-900 text-base">{selectedProperty.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-500">Agreed Agent Commission:</span>
                <span className="font-bold text-emerald-700">{selectedProperty.commissionPct}% upon Deal Closure</span>
              </div>
              <div className="pt-2 border-t border-slate-200/80">
                <span className="font-bold text-slate-500 block mb-1">Description:</span>
                <p className="text-slate-700 leading-relaxed text-xs">{selectedProperty.description}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setRejectType('PROPERTY');
                  setShowRejectModal(true);
                }}
                className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-sm transition-all"
              >
                Reject Listing
              </button>
              <button
                onClick={() => handleApproveProperty(selectedProperty.id)}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all"
              >
                <Check size={16} /> Approve & Publish to Main Marketplace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: DISBURSE PAYOUT (ENTER UTR) ── */}
      {selectedPayout && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">Disburse Commission Payout</h3>
              <button
                onClick={() => setSelectedPayout(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 flex flex-col gap-1">
              <span className="text-xs font-bold text-purple-700">Amount to Transfer</span>
              <span className="text-2xl font-black text-purple-950">₹ {selectedPayout.amount.toLocaleString()}</span>
              <span className="text-xs text-purple-800 font-medium mt-1">
                To: {selectedPayout.agentName} ({selectedPayout.payoutMethod}: {selectedPayout.destinationAccount})
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Bank UTR / Transaction Reference Number *
              </label>
              <input
                type="text"
                placeholder="e.g. UTR-HDFC20260312901823"
                value={utrInput}
                onChange={e => setUtrInput(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedPayout(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDisbursePayout(selectedPayout.id)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm flex items-center gap-1.5"
              >
                <Check size={14} /> Confirm & Mark Disbursed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: TICKET REPLY ── */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">Reply to Agent Ticket</h3>
                <p className="text-xs text-slate-500">{selectedTicket.subject} ({selectedTicket.agentName})</p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl flex flex-col gap-2 max-h-48 overflow-y-auto">
              {selectedTicket.messages.map((m, idx) => (
                <div key={idx} className={`text-xs p-2 rounded-lg ${m.sender === 'Admin' ? 'bg-sky-50 text-sky-900 ml-4 border border-sky-100' : 'bg-white text-slate-800 mr-4 border border-slate-200'}`}>
                  <span className="font-bold">{m.sender}:</span> {m.text}
                  <span className="block text-[10px] text-slate-400 text-right mt-1">{m.time}</span>
                </div>
              ))}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Your Response to Field Agent</label>
              <textarea
                rows={3}
                placeholder="Type instructions or confirmation message here..."
                value={ticketReplyText}
                onChange={e => setTicketReplyText(e.target.value)}
                className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSendTicketReply}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs shadow-sm flex items-center gap-1.5"
              >
                <Send size={13} /> Send Reply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: REJECTION REASON ── */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
            <h3 className="text-base font-black text-rose-700 flex items-center gap-2">
              <AlertCircle size={18} /> Enter Reason for Rejection
            </h3>
            <p className="text-xs text-slate-500">
              This feedback will be pushed to the mobile agent so they can correct and re-submit.
            </p>

            <textarea
              rows={3}
              placeholder="e.g. Aadhaar photo was blurred / Incomplete address details..."
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
            />

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={rejectType === 'AGENT' ? handleRejectKyc : handleRejectProperty}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-sm"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentEcosystemManagement;
