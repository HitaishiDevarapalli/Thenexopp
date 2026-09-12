import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Search,
  RefreshCw,
  Wallet,
  CheckCircle2,
  Clock,
  Building2,
  Users,
  Receipt,
  X,
  Send,
  Eye,
  AlertCircle,
  Calendar,
  ChevronRight,
  Check,
  CreditCard,
  FileText,
  BadgePercent,
  Layers,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Shuffle,
} from 'lucide-react';
import { AdminApiService } from '../services/api';
import {
  AgentPerformanceSummary,
  SuccessfulTransactionRecord,
  AgentPerformanceDetails,
  PropertyListing,
} from '../types';

export const AgentPerformance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'listings' | 'payments' | 'pending'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });

  // Data states
  const [summaryData, setSummaryData] = useState<{
    totalAgents: number;
    totalListings: number;
    approvedListings: number;
    totalCommission: number;
    totalPaid: number;
    pendingAmount: number;
    successfulTransactions: number;
  }>({
    totalAgents: 0,
    totalListings: 0,
    approvedListings: 0,
    totalCommission: 0,
    totalPaid: 0,
    pendingAmount: 0,
    successfulTransactions: 0,
  });
  const [agents, setAgents] = useState<AgentPerformanceSummary[]>([]);
  const [transactions, setTransactions] = useState<SuccessfulTransactionRecord[]>([]);
  const [allProperties, setAllProperties] = useState<PropertyListing[]>([]);

  // Agent Detail Modal state
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [agentDetails, setAgentDetails] = useState<AgentPerformanceDetails | null>(null);
  const [isAgentDetailLoading, setIsAgentDetailLoading] = useState(false);
  const [agentDetailTab, setAgentDetailTab] = useState<'listings' | 'payments'>('listings');

  // Pay Agent Modal state
  const [payModalAgent, setPayModalAgent] = useState<{ id: string; name: string; pending: number } | null>(null);
  const [payAmount, setPayAmount] = useState<number | ''>('');
  const [payMethod, setPayMethod] = useState('UPI');
  const [payTxnId, setPayTxnId] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [payProofKey, setPayProofKey] = useState('');
  const [payError, setPayError] = useState<string | null>(null);
  const [paySuccessMsg, setPaySuccessMsg] = useState<string | null>(null);

  // Proof Image Preview Modal
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string | null>(null);

  const fetchPerformanceData = async () => {
    setIsLoading(true);
    try {
      const [perfRes, txnsRes, propsRes] = await Promise.all([
        AdminApiService.getAgentPerformanceSummary(searchQuery, statusFilter),
        AdminApiService.getSuccessfulTransactions(searchQuery, dateFilter.start, dateFilter.end),
        AdminApiService.getProperties({ search: searchQuery }),
      ]);

      if (perfRes.success) {
        setSummaryData(perfRes.summary);
        setAgents(perfRes.data || []);
      }
      if (txnsRes.success) {
        setTransactions(txnsRes.data || []);
      }
      if (propsRes.success) {
        setAllProperties(propsRes.data || []);
      }
    } catch (err) {
      console.error('Failed to load performance data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
  }, [searchQuery, statusFilter, dateFilter]);

  const openAgentDetails = async (agentId: string) => {
    setSelectedAgentId(agentId);
    setIsAgentDetailLoading(true);
    setAgentDetailTab('listings');
    try {
      const res = await AdminApiService.getAgentPerformanceDetails(agentId);
      if (res.success) {
        setAgentDetails(res);
      }
    } catch (err) {
      console.error('Failed to load agent details', err);
    } finally {
      setIsAgentDetailLoading(false);
    }
  };

  const closeAgentDetails = () => {
    setSelectedAgentId(null);
    setAgentDetails(null);
  };

  const openPayModal = (agentId: string, agentName: string, pending: number) => {
    setPayModalAgent({ id: agentId, name: agentName, pending });
    setPayAmount(pending > 0 ? pending : '');
    setPayMethod('UPI');
    setPayTxnId(`TXN${Date.now().toString().slice(-8)}`);
    setPayNotes(`Disbursement for ${agentName}`);
    setPayProofKey('');
    setPayError(null);
    setPaySuccessMsg(null);
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payModalAgent) return;
    const amountNum = Number(payAmount);
    if (!amountNum || amountNum <= 0) {
      setPayError('Please enter a valid amount greater than ₹0.');
      return;
    }
    if (amountNum > payModalAgent.pending) {
      setPayError(`Amount cannot exceed pending balance of ₹${payModalAgent.pending.toLocaleString('en-IN')}.`);
      return;
    }

    setIsActionLoading(true);
    setPayError(null);
    try {
      const res = await AdminApiService.payAgent({
        agentId: payModalAgent.id,
        amount: amountNum,
        paymentMethod: payMethod,
        transactionId: payTxnId || undefined,
        notes: payNotes || undefined,
        paymentProofKey: payProofKey || undefined,
      });
      if (res.success) {
        setPaySuccessMsg(`Successfully disbursed ₹${amountNum.toLocaleString('en-IN')} to ${payModalAgent.name}!`);
        await fetchPerformanceData();
        if (selectedAgentId === payModalAgent.id) {
          openAgentDetails(payModalAgent.id);
        }
        setTimeout(() => {
          setPayModalAgent(null);
          setPaySuccessMsg(null);
        }, 1200);
      }
    } catch (err: any) {
      setPayError(err.response?.data?.message || 'Failed to process payment. Please verify input.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const formatExactDateTime = (dateStr?: string | null) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr);
      return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    } catch {
      return String(dateStr);
    }
  };

  const formatCurrency = (amt?: number | null) => {
    const num = Math.round(Number(amt || 0));
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const CurrencyValue = ({
    amount,
    colorClass = 'text-slate-900',
    sizeClass = 'text-xl sm:text-2xl',
  }: {
    amount?: number | null;
    colorClass?: string;
    sizeClass?: string;
  }) => {
    const num = Math.round(Number(amount || 0));
    const formatted = num.toLocaleString('en-IN');

    return (
      <div className={`flex items-baseline font-black tracking-tight whitespace-nowrap ${colorClass}`}>
        <span className="text-sm font-bold mr-0.5 opacity-90 shrink-0">₹</span>
        <span className={`${sizeClass} font-black tracking-tight whitespace-nowrap`}>{formatted}</span>
      </div>
    );
  };

  // Sorting state for Agent Overview
  const [overviewSortField, setOverviewSortField] = useState<'listings' | 'approvedListings' | 'commission' | 'paid' | 'pending' | 'name' | 'txns'>('listings');
  const [overviewSortOrder, setOverviewSortOrder] = useState<'asc' | 'desc'>('desc');

  // Sorting state for Transactions
  const [txnsSortField, setTxnsSortField] = useState<'date' | 'amount' | 'name'>('date');
  const [txnsSortOrder, setTxnsSortOrder] = useState<'asc' | 'desc'>('desc');

  // Sorting state for Listings
  const [listingsSortField, setListingsSortField] = useState<'date' | 'price' | 'commission' | 'title' | 'agent'>('date');
  const [listingsSortOrder, setListingsSortOrder] = useState<'asc' | 'desc'>('desc');

  const sortedAgents = React.useMemo(() => {
    const list = [...agents];
    return list.sort((a, b) => {
      let comparison = 0;
      if (overviewSortField === 'name') {
        comparison = (a.agentName || '').localeCompare(b.agentName || '');
      } else if (overviewSortField === 'listings') {
        comparison = (a.totalListings || 0) - (b.totalListings || 0);
      } else if (overviewSortField === 'approvedListings') {
        comparison = (a.approvedListings || 0) - (b.approvedListings || 0);
      } else if (overviewSortField === 'commission') {
        comparison = (a.totalCommission || 0) - (b.totalCommission || 0);
      } else if (overviewSortField === 'paid') {
        comparison = (a.totalPaid || 0) - (b.totalPaid || 0);
      } else if (overviewSortField === 'pending') {
        comparison = (a.pendingAmount || 0) - (b.pendingAmount || 0);
      } else if (overviewSortField === 'txns') {
        comparison = (a.successfulTransactions || 0) - (b.successfulTransactions || 0);
      }
      return overviewSortOrder === 'asc' ? comparison : -comparison;
    });
  }, [agents, overviewSortField, overviewSortOrder]);

  const sortedTransactions = React.useMemo(() => {
    const list = [...transactions];
    return list.sort((a, b) => {
      let comparison = 0;
      if (txnsSortField === 'name') {
        comparison = (a.agentName || '').localeCompare(b.agentName || '');
      } else if (txnsSortField === 'amount') {
        comparison = (a.amount || 0) - (b.amount || 0);
      } else if (txnsSortField === 'date') {
        comparison = new Date(a.paymentDate || a.paidAt || a.createdAt || 0).getTime() - new Date(b.paymentDate || b.paidAt || b.createdAt || 0).getTime();
      }
      return txnsSortOrder === 'asc' ? comparison : -comparison;
    });
  }, [transactions, txnsSortField, txnsSortOrder]);

  const sortedListings = React.useMemo(() => {
    const list = [...allProperties];
    return list.sort((a, b) => {
      let comparison = 0;
      if (listingsSortField === 'title') {
        comparison = (a.title || '').localeCompare(b.title || '');
      } else if (listingsSortField === 'agent') {
        comparison = (a.agent?.fullName || '').localeCompare(b.agent?.fullName || '');
      } else if (listingsSortField === 'price') {
        comparison = (Number(a.price) || 0) - (Number(b.price) || 0);
      } else if (listingsSortField === 'commission') {
        comparison = (Number(a.commissionAmount) || 0) - (Number(b.commissionAmount) || 0);
      } else if (listingsSortField === 'date') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return listingsSortOrder === 'asc' ? comparison : -comparison;
    });
  }, [allProperties, listingsSortField, listingsSortOrder]);

  const [pendingSortOrder, setPendingSortOrder] = useState<'asc' | 'desc' | 'random'>('desc');
  const [pendingSortSeed, setPendingSortSeed] = useState<number>(1);

  const pendingAgentsList = agents.filter((a) => a.pendingAmount > 0);

  const sortedPendingAgentsList = React.useMemo(() => {
    const list = [...pendingAgentsList];
    if (pendingSortOrder === 'asc') {
      return list.sort((a, b) => a.pendingAmount - b.pendingAmount || a.agentName.localeCompare(b.agentName));
    }
    if (pendingSortOrder === 'desc') {
      return list.sort((a, b) => b.pendingAmount - a.pendingAmount || a.agentName.localeCompare(b.agentName));
    }
    // Random shuffle based on seed
    return list
      .map((item, idx) => ({ item, rand: Math.sin(pendingSortSeed * 9999 + idx * 7919) }))
      .sort((a, b) => a.rand - b.rand)
      .map(({ item }) => item);
  }, [pendingAgentsList, pendingSortOrder, pendingSortSeed]);

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="h-11 w-11 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Agent Performance & Transactions</h1>
              <p className="text-sm text-slate-500 font-medium">
                Live agent listing metrics, commission generation, and permanent disbursement audit trail.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchPerformanceData}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Live Data</span>
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all min-w-0 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 truncate">Total Commission</span>
            <div className="h-8 w-8 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0 ml-2">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="my-1">
            <CurrencyValue amount={summaryData.totalCommission} colorClass="text-slate-900" sizeClass="text-lg sm:text-xl xl:text-2xl" />
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium truncate">Sum of all approved commissions</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all min-w-0 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 truncate">Total Paid Out</span>
            <div className="h-8 w-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0 ml-2">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="my-1">
            <CurrencyValue amount={summaryData.totalPaid} colorClass="text-blue-700" sizeClass="text-lg sm:text-xl xl:text-2xl" />
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium truncate">Sum of all successful payouts</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200/70 shadow-sm hover:border-amber-300 transition-all bg-gradient-to-br from-amber-50/30 to-white min-w-0 flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 truncate">Pending Balance</span>
            <div className="h-8 w-8 bg-amber-100 rounded-xl flex items-center justify-center text-amber-700 shrink-0 ml-2">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="my-1">
            <CurrencyValue amount={summaryData.pendingAmount} colorClass="text-amber-700" sizeClass="text-lg sm:text-xl xl:text-2xl" />
          </div>
          <p className="text-xs text-amber-600 mt-1 font-medium truncate">Commission − Total Paid</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all min-w-0 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 truncate">Approved Listings</span>
            <div className="h-8 w-8 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 shrink-0 ml-2">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="my-1 flex items-baseline space-x-1.5 overflow-hidden">
            <span className="text-lg sm:text-xl xl:text-2xl font-black text-slate-900 tracking-tight">{summaryData.approvedListings}</span>
            <span className="text-xs font-semibold text-slate-500 truncate">/ {summaryData.totalListings} total</span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium truncate">Active verified properties</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all min-w-0 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 truncate">Successful Txns</span>
            <div className="h-8 w-8 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0 ml-2">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div className="my-1">
            <span className="text-lg sm:text-xl xl:text-2xl font-black text-emerald-700 tracking-tight">{summaryData.successfulTransactions}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium truncate">Completed payout receipts</p>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Navigation Tabs */}
        <div className="border-b border-slate-200 px-6 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex space-x-1 sm:space-x-3 overflow-x-auto pb-px">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center space-x-2 px-3.5 py-3 font-bold text-sm border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Agent Overview</span>
              <span className="ml-1 px-2 py-0.5 text-xs bg-slate-100 rounded-full font-bold text-slate-600">
                {agents.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('transactions')}
              className={`flex items-center space-x-2 px-3.5 py-3 font-bold text-sm border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'transactions'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Receipt className="h-4 w-4" />
              <span>Successful Transactions</span>
              <span className="ml-1 px-2 py-0.5 text-xs bg-emerald-100 rounded-full font-bold text-emerald-700">
                {transactions.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('listings')}
              className={`flex items-center space-x-2 px-3.5 py-3 font-bold text-sm border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'listings'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Agent-wise Listings</span>
              <span className="ml-1 px-2 py-0.5 text-xs bg-slate-100 rounded-full font-bold text-slate-600">
                {allProperties.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('payments')}
              className={`flex items-center space-x-2 px-3.5 py-3 font-bold text-sm border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'payments'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <CreditCard className="h-4 w-4" />
              <span>Agent-wise Payments</span>
            </button>

            <button
              onClick={() => setActiveTab('pending')}
              className={`flex items-center space-x-2 px-3.5 py-3 font-bold text-sm border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'pending'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Clock className="h-4 w-4" />
              <span>Pending Commission</span>
              {pendingAgentsList.length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-amber-100 rounded-full font-bold text-amber-700 animate-pulse">
                  {pendingAgentsList.length}
                </span>
              )}
            </button>
          </div>

          {/* Controls Bar (Search + Sort) */}
          <div className="flex flex-wrap items-center gap-2.5 pb-3 sm:pb-0">
            {/* Sort Dropdown */}
            <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-xs">
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap hidden md:inline">Sort by:</span>
              {activeTab === 'overview' && (
                <select
                  value={overviewSortField}
                  onChange={(e) => setOverviewSortField(e.target.value as any)}
                  className="bg-transparent text-xs font-bold text-slate-800 border-none focus:outline-none cursor-pointer pr-1"
                >
                  <option value="listings">Total Listings</option>
                  <option value="approvedListings">Approved Listings</option>
                  <option value="commission">Total Commission</option>
                  <option value="paid">Amount Paid</option>
                  <option value="pending">Pending Balance</option>
                  <option value="txns">Successful Txns</option>
                  <option value="name">Agent Name</option>
                </select>
              )}
              {activeTab === 'transactions' && (
                <select
                  value={txnsSortField}
                  onChange={(e) => setTxnsSortField(e.target.value as any)}
                  className="bg-transparent text-xs font-bold text-slate-800 border-none focus:outline-none cursor-pointer pr-1"
                >
                  <option value="date">Date & Time</option>
                  <option value="amount">Amount Credited</option>
                  <option value="name">Agent Name</option>
                </select>
              )}
              {activeTab === 'listings' && (
                <select
                  value={listingsSortField}
                  onChange={(e) => setListingsSortField(e.target.value as any)}
                  className="bg-transparent text-xs font-bold text-slate-800 border-none focus:outline-none cursor-pointer pr-1"
                >
                  <option value="date">Submission Date</option>
                  <option value="price">Property Price</option>
                  <option value="commission">Commission</option>
                  <option value="title">Property Title</option>
                  <option value="agent">Agent Name</option>
                </select>
              )}
              {activeTab === 'payments' && (
                <select
                  value={overviewSortField}
                  onChange={(e) => setOverviewSortField(e.target.value as any)}
                  className="bg-transparent text-xs font-bold text-slate-800 border-none focus:outline-none cursor-pointer pr-1"
                >
                  <option value="listings">Total Listings</option>
                  <option value="commission">Total Commission</option>
                  <option value="paid">Amount Paid</option>
                  <option value="pending">Pending Balance</option>
                  <option value="name">Agent Name</option>
                </select>
              )}
              {activeTab === 'pending' && (
                <select
                  value={pendingSortOrder}
                  onChange={(e) => setPendingSortOrder(e.target.value as any)}
                  className="bg-transparent text-xs font-bold text-slate-800 border-none focus:outline-none cursor-pointer pr-1"
                >
                  <option value="desc">Highest Pending First</option>
                  <option value="asc">Lowest Pending First</option>
                  <option value="random">Shuffle Order</option>
                </select>
              )}
              {activeTab !== 'pending' && (
                <button
                  onClick={() => {
                    if (activeTab === 'overview' || activeTab === 'payments') {
                      setOverviewSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
                    } else if (activeTab === 'transactions') {
                      setTxnsSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
                    } else if (activeTab === 'listings') {
                      setListingsSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
                    }
                  }}
                  className="p-1 hover:bg-slate-200 text-slate-600 rounded-md transition-colors"
                  title="Toggle Ascending / Descending"
                >
                  {(activeTab === 'overview' || activeTab === 'payments'
                    ? overviewSortOrder
                    : activeTab === 'transactions'
                    ? txnsSortOrder
                    : listingsSortOrder) === 'desc' ? (
                    <ArrowDown className="h-3.5 w-3.5 text-emerald-700" />
                  ) : (
                    <ArrowUp className="h-3.5 w-3.5 text-emerald-700" />
                  )}
                </button>
              )}
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search agent, mobile, txn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-medium w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab 1: Agent Overview Table */}
        {activeTab === 'overview' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 min-w-[1100px]">
              <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase border-b border-slate-200">
                <tr>
                  <th 
                    className="px-6 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                    onClick={() => {
                      if (overviewSortField === 'name') {
                        setOverviewSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'));
                      } else {
                        setOverviewSortField('name');
                        setOverviewSortOrder('asc');
                      }
                    }}
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>Agent Name</span>
                      {overviewSortField === 'name' ? (
                        overviewSortOrder === 'desc' ? <ArrowDown className="h-3.5 w-3.5 text-emerald-600" /> : <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3.5 text-center cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                    onClick={() => {
                      if (overviewSortField === 'listings') {
                        setOverviewSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'));
                      } else {
                        setOverviewSortField('listings');
                        setOverviewSortOrder('desc');
                      }
                    }}
                  >
                    <div className="flex items-center justify-center space-x-1.5">
                      <span>Listings (Total / Approved)</span>
                      {overviewSortField === 'listings' ? (
                        overviewSortOrder === 'desc' ? <ArrowDown className="h-3.5 w-3.5 text-emerald-600" /> : <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3.5 text-right cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                    onClick={() => {
                      if (overviewSortField === 'commission') {
                        setOverviewSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'));
                      } else {
                        setOverviewSortField('commission');
                        setOverviewSortOrder('desc');
                      }
                    }}
                  >
                    <div className="flex items-center justify-end space-x-1.5">
                      <span>Total Commission</span>
                      {overviewSortField === 'commission' ? (
                        overviewSortOrder === 'desc' ? <ArrowDown className="h-3.5 w-3.5 text-emerald-600" /> : <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3.5 text-right cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                    onClick={() => {
                      if (overviewSortField === 'paid') {
                        setOverviewSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'));
                      } else {
                        setOverviewSortField('paid');
                        setOverviewSortOrder('desc');
                      }
                    }}
                  >
                    <div className="flex items-center justify-end space-x-1.5">
                      <span>Amount Paid</span>
                      {overviewSortField === 'paid' ? (
                        overviewSortOrder === 'desc' ? <ArrowDown className="h-3.5 w-3.5 text-emerald-600" /> : <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3.5 text-right cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                    onClick={() => {
                      if (overviewSortField === 'pending') {
                        setOverviewSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'));
                      } else {
                        setOverviewSortField('pending');
                        setOverviewSortOrder('desc');
                      }
                    }}
                  >
                    <div className="flex items-center justify-end space-x-1.5">
                      <span>Pending Amount</span>
                      {overviewSortField === 'pending' ? (
                        overviewSortOrder === 'desc' ? <ArrowDown className="h-3.5 w-3.5 text-emerald-600" /> : <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3.5 text-center cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                    onClick={() => {
                      if (overviewSortField === 'txns') {
                        setOverviewSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'));
                      } else {
                        setOverviewSortField('txns');
                        setOverviewSortOrder('desc');
                      }
                    }}
                  >
                    <div className="flex items-center justify-center space-x-1.5">
                      <span>Successful Txns</span>
                      {overviewSortField === 'txns' ? (
                        overviewSortOrder === 'desc' ? <ArrowDown className="h-3.5 w-3.5 text-emerald-600" /> : <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3.5 text-right whitespace-nowrap min-w-[150px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-medium">
                      <div className="flex flex-col items-center space-y-2">
                        <RefreshCw className="h-6 w-6 animate-spin text-emerald-600" />
                        <span>Loading agent performance records...</span>
                      </div>
                    </td>
                  </tr>
                ) : sortedAgents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-medium">
                      No agent records found matching criteria.
                    </td>
                  </tr>
                ) : (
                  sortedAgents.map((agent) => {
                    const isFullyPaid = agent.pendingAmount === 0 && agent.totalCommission > 0;
                    const hasPending = agent.pendingAmount > 0;

                    return (
                      <tr
                        key={agent.agentId}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                        onClick={() => openAgentDetails(agent.agentId)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center font-bold text-sm border border-slate-200">
                              {agent.agentName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 hover:text-emerald-600 transition-colors">
                                {agent.agentName}
                              </p>
                              <p className="text-xs text-slate-500">{agent.mobileNumber} • {agent.areaLocation || 'Agent'}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-700">
                            <Building2 className="h-3.5 w-3.5 text-slate-500" />
                            <span>{agent.totalListings} Listings</span>
                            <span className="text-slate-500">({agent.approvedListings} Approved)</span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-right font-black text-slate-900">
                          {formatCurrency(agent.totalCommission)}
                        </td>

                        <td className="px-6 py-4 text-right font-black text-blue-700">
                          {formatCurrency(agent.totalPaid)}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <span
                            className={`font-black text-sm px-2.5 py-1 rounded-lg ${
                              hasPending
                                ? 'bg-amber-100 text-amber-900 border border-amber-300/50'
                                : isFullyPaid
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'text-slate-500'
                            }`}
                          >
                            {formatCurrency(agent.pendingAmount)}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full font-bold text-xs border border-emerald-200/60">
                            {agent.successfulTransactions} Txns
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                          {hasPending ? (
                            <button
                              onClick={() => openPayModal(agent.agentId, agent.agentName, agent.pendingAmount)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all active:scale-95 inline-flex items-center space-x-1"
                            >
                              <Send className="h-3 w-3" />
                              <span>Pay Agent</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => openAgentDetails(agent.agentId)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all inline-flex items-center space-x-1"
                            >
                              <Eye className="h-3 w-3 text-slate-500" />
                              <span>Details</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Successful Transactions Ledger */}
        {activeTab === 'transactions' && (
          <div>
            <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-600">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Permanent Successful Transactions Audit Ledger ({transactions.length} Records)</span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  value={dateFilter.start}
                  onChange={(e) => setDateFilter((prev) => ({ ...prev, start: e.target.value }))}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
                />
                <span className="text-xs text-slate-500 font-bold">to</span>
                <input
                  type="date"
                  value={dateFilter.end}
                  onChange={(e) => setDateFilter((prev) => ({ ...prev, end: e.target.value }))}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
                />
                {(dateFilter.start || dateFilter.end) && (
                  <button
                    onClick={() => setDateFilter({ start: '', end: '' })}
                    className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-1"
                  >
                    Clear Dates
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 min-w-[1250px]">
                <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase border-b border-slate-200">
                  <tr>
                    <th
                      className="px-6 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                      onClick={() => {
                        if (txnsSortField === 'date') {
                          setTxnsSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'));
                        } else {
                          setTxnsSortField('date');
                          setTxnsSortOrder('desc');
                        }
                      }}
                    >
                      <div className="flex items-center space-x-1.5">
                        <span>Transaction ID & Exact Time</span>
                        {txnsSortField === 'date' ? (
                          txnsSortOrder === 'desc' ? <ArrowDown className="h-3.5 w-3.5 text-emerald-600" /> : <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                      onClick={() => {
                        if (txnsSortField === 'name') {
                          setTxnsSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'));
                        } else {
                          setTxnsSortField('name');
                          setTxnsSortOrder('asc');
                        }
                      }}
                    >
                      <div className="flex items-center space-x-1.5">
                        <span>Agent Name</span>
                        {txnsSortField === 'name' ? (
                          txnsSortOrder === 'desc' ? <ArrowDown className="h-3.5 w-3.5 text-emerald-600" /> : <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                      onClick={() => {
                        if (txnsSortField === 'amount') {
                          setTxnsSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'));
                        } else {
                          setTxnsSortField('amount');
                          setTxnsSortOrder('desc');
                        }
                      }}
                    >
                      <div className="flex items-center space-x-1.5">
                        <span>Amount Credited</span>
                        {txnsSortField === 'amount' ? (
                          txnsSortOrder === 'desc' ? <ArrowDown className="h-3.5 w-3.5 text-emerald-600" /> : <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3.5 whitespace-nowrap">Method</th>
                    <th className="px-6 py-3.5 whitespace-nowrap">Related Property / Listing</th>
                    <th className="px-6 py-3.5 whitespace-nowrap">Previous & Remaining Pending</th>
                    <th className="px-6 py-3.5 text-center whitespace-nowrap">Status</th>
                    <th className="px-6 py-3.5 text-right whitespace-nowrap min-w-[120px]">Proof</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-slate-500 font-medium">
                        <div className="flex flex-col items-center space-y-2">
                          <RefreshCw className="h-6 w-6 animate-spin text-emerald-600" />
                          <span>Loading transaction ledger...</span>
                        </div>
                      </td>
                    </tr>
                  ) : sortedTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-slate-500 font-medium">
                        No completed transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    sortedTransactions.map((txn) => (
                      <tr key={txn.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {txn.transactionId}
                            </span>
                            <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium pt-0.5">
                              <Calendar className="h-3 w-3 text-slate-500" />
                              <span>{formatExactDateTime(txn.paidAt)}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <button
                            onClick={() => openAgentDetails(txn.agentId)}
                            className="text-left group"
                          >
                            <p className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors flex items-center space-x-1">
                              <span>{txn.agentName}</span>
                              <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </p>
                            <p className="text-xs text-slate-500">{txn.mobileNumber}</p>
                          </button>
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-black text-base text-emerald-700">
                            {formatCurrency(txn.amount)}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md font-bold text-xs border border-blue-200/60">
                            {txn.paymentMethod || 'UPI'}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          {txn.relatedProperty ? (
                            <div className="max-w-xs">
                              <p className="font-bold text-xs text-slate-900 truncate">{txn.relatedProperty.title}</p>
                              <p className="text-xs text-slate-500 truncate">{txn.relatedProperty.location}</p>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500 italic">{txn.earningTitle || 'Direct Payout'}</span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          {txn.previousPendingAmount !== null && txn.remainingPendingAmount !== null ? (
                            <div className="text-xs space-y-0.5 bg-slate-50 p-2 rounded-lg border border-slate-200 inline-block">
                              <div className="text-slate-500">
                                Previous Pending: <span className="font-bold text-amber-700">{formatCurrency(txn.previousPendingAmount)}</span>
                              </div>
                              <div className="text-slate-700">
                                Remaining Pending: <span className="font-bold text-slate-900">{formatCurrency(txn.remainingPendingAmount)}</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500">Recorded</span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full font-bold text-xs border border-emerald-200">
                            <Check className="h-3 w-3" />
                            <span>Successful</span>
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          {txn.paymentProofUrl ? (
                            <button
                              onClick={() => setProofPreviewUrl(txn.paymentProofUrl || null)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold inline-flex items-center space-x-1 transition-all"
                            >
                              <Receipt className="h-3 w-3 text-slate-500" />
                              <span>View Proof</span>
                            </button>
                          ) : (
                            <span className="text-xs text-slate-500 italic">No proof</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Agent-wise Listings */}
        {activeTab === 'listings' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 min-w-[1100px]">
              <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase border-b border-slate-200">
                <tr>
                  <th
                    className="px-6 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                    onClick={() => {
                      if (listingsSortField === 'title') {
                        setListingsSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'));
                      } else {
                        setListingsSortField('title');
                        setListingsSortOrder('asc');
                      }
                    }}
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>Property / Listing</span>
                      {listingsSortField === 'title' ? (
                        listingsSortOrder === 'desc' ? <ArrowDown className="h-3.5 w-3.5 text-emerald-600" /> : <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                    onClick={() => {
                      if (listingsSortField === 'agent') {
                        setListingsSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'));
                      } else {
                        setListingsSortField('agent');
                        setListingsSortOrder('asc');
                      }
                    }}
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>Agent Details</span>
                      {listingsSortField === 'agent' ? (
                        listingsSortOrder === 'desc' ? <ArrowDown className="h-3.5 w-3.5 text-emerald-600" /> : <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                    onClick={() => {
                      if (listingsSortField === 'price') {
                        setListingsSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'));
                      } else {
                        setListingsSortField('price');
                        setListingsSortOrder('desc');
                      }
                    }}
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>Price</span>
                      {listingsSortField === 'price' ? (
                        listingsSortOrder === 'desc' ? <ArrowDown className="h-3.5 w-3.5 text-emerald-600" /> : <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3.5 text-right cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                    onClick={() => {
                      if (listingsSortField === 'commission') {
                        setListingsSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'));
                      } else {
                        setListingsSortField('commission');
                        setListingsSortOrder('desc');
                      }
                    }}
                  >
                    <div className="flex items-center justify-end space-x-1.5">
                      <span>Commission</span>
                      {listingsSortField === 'commission' ? (
                        listingsSortOrder === 'desc' ? <ArrowDown className="h-3.5 w-3.5 text-emerald-600" /> : <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                    onClick={() => {
                      if (listingsSortField === 'date') {
                        setListingsSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'));
                      } else {
                        setListingsSortField('date');
                        setListingsSortOrder('desc');
                      }
                    }}
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>Submission Date & Time</span>
                      {listingsSortField === 'date' ? (
                        listingsSortOrder === 'desc' ? <ArrowDown className="h-3.5 w-3.5 text-emerald-600" /> : <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3.5 text-center whitespace-nowrap min-w-[120px]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sortedListings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">
                      No property listings recorded yet.
                    </td>
                  </tr>
                ) : (
                  sortedListings.map((prop) => (
                    <tr key={prop.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 text-sm">{prop.title}</div>
                        <div className="text-xs text-slate-500">{prop.location} • {prop.category}</div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => prop.agentId && openAgentDetails(prop.agentId)}
                          className="text-left font-bold text-slate-900 hover:text-emerald-600 transition-colors"
                        >
                          {prop.agent?.fullName || 'Agent Partner'}
                        </button>
                        <div className="text-xs text-slate-500">{prop.agent?.mobileNumber}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {formatCurrency(prop.price)}
                      </td>
                      <td className="px-6 py-4 text-right font-black text-emerald-700">
                        {formatCurrency(prop.commissionAmount || 60)}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {formatExactDateTime(prop.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            prop.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : prop.status === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {prop.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Agent-wise Payments Breakdown */}
        {activeTab === 'payments' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="font-bold text-base text-slate-900">Agent Payments Directory</h3>
              <p className="text-xs text-slate-500">Select any agent to view their complete payment receipts and commission allocations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {agents.map((agent) => (
                <div
                  key={agent.agentId}
                  onClick={() => openAgentDetails(agent.agentId)}
                  className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-slate-100 text-slate-700 rounded-2xl flex items-center justify-center font-bold text-base border border-slate-200">
                      {agent.agentName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{agent.agentName}</h4>
                      <p className="text-xs text-slate-500">{agent.mobileNumber} • {agent.areaLocation || 'Agent'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs">
                    <div>
                      <span className="text-slate-500 font-medium">Commission</span>
                      <p className="font-bold text-slate-900 mt-0.5">{formatCurrency(agent.totalCommission)}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Paid</span>
                      <p className="font-bold text-blue-700 mt-0.5">{formatCurrency(agent.totalPaid)}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Pending</span>
                      <p className="font-bold text-amber-700 mt-0.5">{formatCurrency(agent.pendingAmount)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                    <span className="text-slate-500">{agent.successfulTransactions} Successful Payouts</span>
                    <span className="font-bold text-emerald-600 flex items-center space-x-1">
                      <span>View History</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Pending Commission Ledger */}
        {activeTab === 'pending' && (
          <div className="p-6">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
                  <span>Agents with Outstanding Pending Balance</span>
                  <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-xs font-extrabold rounded-full border border-amber-300">
                    {sortedPendingAgentsList.length}
                  </span>
                </h3>
                <p className="text-xs text-slate-500">Disburse full or partial payment to immediately reduce pending commissions.</p>
              </div>

              {/* Sorting Controls */}
              <div className="flex items-center space-x-1.5 bg-white border border-slate-200 rounded-xl p-1 shadow-sm self-start md:self-auto">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">Sort:</span>
                
                <button
                  type="button"
                  onClick={() => setPendingSortOrder('asc')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    pendingSortOrder === 'asc'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title="Sort by lowest pending balance first"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                  <span>Ascending</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPendingSortOrder('desc')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    pendingSortOrder === 'desc'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title="Sort by highest pending balance first"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                  <span>Descending</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPendingSortOrder('random');
                    setPendingSortSeed(Math.random());
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    pendingSortOrder === 'random'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title="Shuffle in random order"
                >
                  <Shuffle className="h-3.5 w-3.5" />
                  <span>Random</span>
                </button>
              </div>
            </div>

            {sortedPendingAgentsList.length === 0 ? (
              <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-slate-800">All Agent Commissions Are Fully Settled!</p>
                <p className="text-xs text-slate-500">There are no outstanding pending amounts.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {sortedPendingAgentsList.map((agent) => (
                  <div
                    key={agent.agentId}
                    className="p-5 rounded-2xl border border-amber-200 bg-gradient-to-b from-amber-50/40 to-white shadow-sm flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900 text-base">{agent.agentName}</h4>
                          <p className="text-xs text-slate-500">{agent.mobileNumber} • {agent.areaLocation || 'Agent'}</p>
                        </div>
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-md">
                          PENDING
                        </span>
                      </div>

                      <div className="mt-4 pt-4 border-t border-amber-200/60 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-500">Total Generated:</span>
                          <p className="font-bold text-slate-900">{formatCurrency(agent.totalCommission)}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Already Paid:</span>
                          <p className="font-bold text-blue-700">{formatCurrency(agent.totalPaid)}</p>
                        </div>
                      </div>

                      <div className="mt-3 p-3 bg-white rounded-xl border border-amber-300/60 flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-900">Current Pending:</span>
                        <span className="text-lg font-black text-amber-700">{formatCurrency(agent.pendingAmount)}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <button
                        onClick={() => openAgentDetails(agent.agentId)}
                        className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                      >
                        View Breakdown
                      </button>
                      <button
                        onClick={() => openPayModal(agent.agentId, agent.agentName, agent.pendingAmount)}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center space-x-1"
                      >
                        <Send className="h-3 w-3" />
                        <span>Disburse Payment</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* AGENT DETAILS DEEP-DIVE MODAL              */}
      {/* ========================================== */}
      {selectedAgentId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between relative overflow-hidden">
              <div className="relative z-10 flex items-center space-x-4">
                <div className="h-14 w-14 bg-emerald-500/20 border border-emerald-400/30 rounded-2xl flex items-center justify-center text-emerald-400 font-bold text-2xl">
                  {agentDetails?.agent.fullName.charAt(0).toUpperCase() || 'A'}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-bold tracking-tight">{agentDetails?.agent.fullName || 'Agent Details'}</h2>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-md border border-emerald-400/30">
                      {agentDetails?.agent.status || 'ACTIVE'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {agentDetails?.agent.mobileNumber} • {agentDetails?.agent.areaLocation || 'India'} • Member since {formatExactDateTime(agentDetails?.agent.joinedAt)}
                  </p>
                </div>
              </div>

              <button
                onClick={closeAgentDetails}
                className="h-9 w-9 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Quick Summary Bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-white rounded-xl border border-slate-200 min-w-0">
                <span className="text-xs font-bold text-slate-500 uppercase truncate block">Listings Added</span>
                <p className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                  {agentDetails?.summary.approvedListings ?? 0}{' '}
                  <span className="text-xs font-semibold text-slate-500">/ {agentDetails?.summary.totalListings ?? 0}</span>
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 min-w-0 flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-slate-500 uppercase truncate block">Total Commission</span>
                <div className="mt-0.5">
                  <CurrencyValue amount={agentDetails?.summary.totalCommission} colorClass="text-slate-900" sizeClass="text-base sm:text-lg" />
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 min-w-0 flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-slate-500 uppercase truncate block">Amount Paid</span>
                <div className="mt-0.5">
                  <CurrencyValue amount={agentDetails?.summary.totalPaid} colorClass="text-blue-700" sizeClass="text-base sm:text-lg" />
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 min-w-0 flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-amber-800 uppercase truncate block">Pending Balance</span>
                <div className="mt-0.5">
                  <CurrencyValue amount={agentDetails?.summary.pendingAmount} colorClass="text-amber-700" sizeClass="text-base sm:text-lg" />
                </div>
              </div>
            </div>

            {/* Modal Sub-Tabs */}
            <div className="border-b border-slate-200 px-6 pt-3 flex items-center justify-between">
              <div className="flex space-x-6">
                <button
                  onClick={() => setAgentDetailTab('listings')}
                  className={`pb-3 font-bold text-sm border-b-2 transition-all flex items-center space-x-2 ${
                    agentDetailTab === 'listings'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="h-4 w-4" />
                  <span>Listings & Properties ({agentDetails?.listings.length ?? 0})</span>
                </button>

                <button
                  onClick={() => setAgentDetailTab('payments')}
                  className={`pb-3 font-bold text-sm border-b-2 transition-all flex items-center space-x-2 ${
                    agentDetailTab === 'payments'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Receipt className="h-4 w-4" />
                  <span>Payment History ({agentDetails?.payments.length ?? 0})</span>
                </button>
              </div>

              {agentDetails && agentDetails.summary.pendingAmount > 0 && (
                <button
                  onClick={() => openPayModal(agentDetails.agent.id, agentDetails.agent.fullName, agentDetails.summary.pendingAmount)}
                  className="mb-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm flex items-center space-x-1"
                >
                  <Send className="h-3 w-3" />
                  <span>Pay Balance ({formatCurrency(agentDetails.summary.pendingAmount)})</span>
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {isAgentDetailLoading ? (
                <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center space-y-2">
                  <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
                  <p className="font-bold">Fetching agent records...</p>
                </div>
              ) : agentDetailTab === 'listings' ? (
                agentDetails?.listings.length === 0 ? (
                  <div className="py-12 text-center text-slate-500">No properties uploaded by this agent yet.</div>
                ) : (
                  <div className="space-y-3">
                    {agentDetails?.listings.map((prop) => (
                      <div
                        key={prop.id}
                        className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                      >
                        <div className="flex items-center space-x-3.5">
                          <div className="h-12 w-12 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200">
                            {prop.primaryImageUrl ? (
                              <img src={prop.primaryImageUrl} alt={prop.title} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-slate-500">
                                <Building2 className="h-6 w-6" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{prop.title}</h4>
                            <p className="text-xs text-slate-500">{prop.location} • Listing Date & Time: {formatExactDateTime(prop.createdAt)}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 self-end sm:self-center">
                          <div className="text-right">
                            <span className="text-xs text-slate-500 font-medium">Commission Generated</span>
                            <p className="font-black text-emerald-700 text-sm">{formatCurrency(prop.commissionAmount)}</p>
                          </div>

                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              prop.status === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : prop.status === 'REJECTED'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {prop.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : agentDetails?.payments.length === 0 ? (
                <div className="py-12 text-center text-slate-500">No payment transactions recorded for this agent yet.</div>
              ) : (
                <div className="space-y-3">
                  {agentDetails?.payments.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {p.transactionId}
                          </span>
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-md">
                            {p.paymentMethod}
                          </span>
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-md">
                            SUCCESSFUL
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Exact Time: {formatExactDateTime(p.paidAt)} • {p.notes || 'Commission Payout'}
                        </p>
                      </div>

                      <div className="flex items-center space-x-4 self-end sm:self-center">
                        <div className="text-right">
                          <p className="text-base font-black text-emerald-700">{formatCurrency(p.amount)}</p>
                          {p.remainingPendingAmount !== null && (
                            <p className="text-xs text-slate-500">
                              Remaining Pending: <span className="font-bold text-slate-700">{formatCurrency(p.remainingPendingAmount)}</span>
                            </p>
                          )}
                        </div>

                        {p.paymentProofUrl && (
                          <button
                            onClick={() => setProofPreviewUrl(p.paymentProofUrl || null)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
                          >
                            Receipt
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={closeAgentDetails}
                className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* PAY AGENT MODAL                            */}
      {/* ========================================== */}
      {payModalAgent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">Disburse Payment</h3>
                <p className="text-xs text-slate-500">To: {payModalAgent.name}</p>
              </div>
              <button
                onClick={() => setPayModalAgent(null)}
                className="h-8 w-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleProcessPayment} className="p-6 space-y-4">
              {payError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{payError}</span>
                </div>
              )}

              {paySuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-semibold flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  <span>{paySuccessMsg}</span>
                </div>
              )}

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
                <span className="font-bold text-amber-900">Current Pending Balance:</span>
                <span className="font-black text-base text-amber-800">{formatCurrency(payModalAgent.pending)}</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Payment Amount (₹) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={payModalAgent.pending}
                  step="0.01"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder={`Max ₹${payModalAgent.pending}`}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Payment Method *
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="UPI">UPI (GooglePay / PhonePe / Paytm)</option>
                  <option value="BANK_TRANSFER">Bank Transfer (NEFT / IMPS / RTGS)</option>
                  <option value="CASH">Cash in Hand</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Transaction / Reference ID
                </label>
                <input
                  type="text"
                  value={payTxnId}
                  onChange={(e) => setPayTxnId(e.target.value)}
                  placeholder="e.g. UTR12345678"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Notes / Description
                </label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="e.g. Partial commission settlement"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {payAmount && Number(payAmount) > 0 && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between text-slate-500">
                    <span>Previous Pending:</span>
                    <span>{formatCurrency(payModalAgent.pending)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Disbursing Now:</span>
                    <span>− {formatCurrency(Number(payAmount))}</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-black border-t border-slate-200 pt-1">
                    <span>Remaining Pending:</span>
                    <span>{formatCurrency(Math.max(0, payModalAgent.pending - Number(payAmount)))}</span>
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPayModalAgent(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isActionLoading || !!paySuccessMsg}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isActionLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Confirm & Disburse</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* PROOF RECEIPT PREVIEW MODAL                */}
      {/* ========================================== */}
      {proofPreviewUrl && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <span className="text-sm font-bold">Payment Receipt Proof</span>
              <button
                onClick={() => setProofPreviewUrl(null)}
                className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-slate-100">
              <img
                src={proofPreviewUrl}
                alt="Payment Proof"
                className="max-h-96 rounded-xl object-contain border border-slate-200"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
