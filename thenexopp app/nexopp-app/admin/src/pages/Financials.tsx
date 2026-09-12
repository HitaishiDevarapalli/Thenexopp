import React, { useEffect, useState } from 'react';
import { AdminApiService } from '../services/api';
import { adminSocket } from '../services/websocket';
import { PaymentRecord, PaymentAnalytics, AgentSummary, PendingPaymentRecord, AgentCreditSummary } from '../types';
import {
  Wallet,
  DollarSign,
  Send,
  CheckCircle2,
  Calendar,
  Search,
  RefreshCw,
  TrendingUp,
  CreditCard,
  User,
  ArrowUpRight,
  Clock,
  Trash2,
  AlertTriangle,
  Hourglass,
  ArrowRight,
  ShieldCheck,
  Building2,
  X,
  Coins,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Shuffle,
} from 'lucide-react';

export const Financials: React.FC = () => {
  const [tab, setTab] = useState<'credits' | 'records' | 'pending' | 'payout' | 'earning'>('credits');

  // Agent Credits & Balances State
  const [credits, setCredits] = useState<AgentCreditSummary[]>([]);
  const [creditsSummary, setCreditsSummary] = useState({
    totalCommission: 0,
    totalPaid: 0,
    totalPending: 0,
    totalAgents: 0,
  });
  const [creditsLoading, setCreditsLoading] = useState(true);
  const [creditsSearch, setCreditsSearch] = useState('');

  // Sorting state for Agent Credits
  const [creditsSortField, setCreditsSortField] = useState<'name' | 'commission' | 'paid' | 'pending' | 'approved'>('pending');
  const [creditsSortDirection, setCreditsSortDirection] = useState<'asc' | 'desc'>('desc');

  const sortedCredits = React.useMemo(() => {
    const list = [...credits];
    return list.sort((a, b) => {
      let comparison = 0;
      if (creditsSortField === 'name') {
        comparison = (a.fullName || '').localeCompare(b.fullName || '');
      } else if (creditsSortField === 'approved') {
        comparison = (a.approvedPropertiesCount || 0) - (b.approvedPropertiesCount || 0);
      } else if (creditsSortField === 'commission') {
        comparison = (Number(a.totalCommission) || 0) - (Number(b.totalCommission) || 0);
      } else if (creditsSortField === 'paid') {
        comparison = (Number(a.totalPaid) || 0) - (Number(b.totalPaid) || 0);
      } else if (creditsSortField === 'pending') {
        comparison = (Number(a.pendingAmount) || 0) - (Number(b.pendingAmount) || 0);
      }
      return creditsSortDirection === 'asc' ? comparison : -comparison;
    });
  }, [credits, creditsSortField, creditsSortDirection]);

  // Pay Agent Direct Modal State
  const [payTargetAgent, setPayTargetAgent] = useState<AgentCreditSummary | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('UPI');
  const [payTxnId, setPayTxnId] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [payLoading, setPayLoading] = useState(false);

  // Ledger records and analytics
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [analytics, setAnalytics] = useState<PaymentAnalytics>({
    totalSpent: 0,
    todaySpent: 0,
    thisWeekSpent: 0,
    thisMonthSpent: 0,
    totalTransactions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  // Sorting state for Payment Records
  const [recordsSortField, setRecordsSortField] = useState<'date' | 'amount' | 'name'>('date');
  const [recordsSortDirection, setRecordsSortDirection] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedPayments = React.useMemo(() => {
    const list = payments.filter((p) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const txnMatch = (p.transactionId || '').toLowerCase().includes(q);
      const agentMatch = (p.agent?.fullName || '').toLowerCase().includes(q);
      const phoneMatch = (p.agent?.mobileNumber || '').includes(q);
      const methodMatch = (p.paymentMethod || '').toLowerCase().includes(q);
      return txnMatch || agentMatch || phoneMatch || methodMatch;
    });

    return list.sort((a, b) => {
      let comparison = 0;
      if (recordsSortField === 'name') {
        comparison = (a.agent?.fullName || '').localeCompare(b.agent?.fullName || '');
      } else if (recordsSortField === 'amount') {
        comparison = (Number(a.amount) || 0) - (Number(b.amount) || 0);
      } else if (recordsSortField === 'date') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return recordsSortDirection === 'asc' ? comparison : -comparison;
    });
  }, [payments, search, recordsSortField, recordsSortDirection]);

  // Pending payments state
  const [pendingPayments, setPendingPayments] = useState<PendingPaymentRecord[]>([]);
  const [totalPendingAmount, setTotalPendingAmount] = useState(0);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingSearch, setPendingSearch] = useState('');
  const [pendingSortOrder, setPendingSortOrder] = useState<'asc' | 'desc' | 'random'>('desc');
  const [pendingSortSeed, setPendingSortSeed] = useState<number>(1);

  const sortedPendingPayments = React.useMemo(() => {
    const list = [...pendingPayments];
    if (pendingSortOrder === 'asc') {
      return list.sort((a, b) => Number(a.amount) - Number(b.amount) || new Date(a.earnedDate).getTime() - new Date(b.earnedDate).getTime());
    }
    if (pendingSortOrder === 'desc') {
      return list.sort((a, b) => Number(b.amount) - Number(a.amount) || new Date(b.earnedDate).getTime() - new Date(a.earnedDate).getTime());
    }
    // Random shuffle based on seed
    return list
      .map((item, idx) => ({ item, rand: Math.sin(pendingSortSeed * 9999 + idx * 7919) }))
      .sort((a, b) => a.rand - b.rand)
      .map(({ item }) => item);
  }, [pendingPayments, pendingSortOrder, pendingSortSeed]);

  // Settle modal state
  const [settleTarget, setSettleTarget] = useState<PendingPaymentRecord | null>(null);
  const [settleTxnId, setSettleTxnId] = useState('');
  const [settleMethod, setSettleMethod] = useState('UPI');
  const [settleLoading, setSettleLoading] = useState(false);

  // Agents list for dropdown autofill (filtered for KYC approved only)
  const [agents, setAgents] = useState<AgentSummary[]>([]);

  // Earning form state
  const [earningAgentId, setEarningAgentId] = useState('');
  const [earningTitle, setEarningTitle] = useState('');
  const [earningAmount, setEarningAmount] = useState('');

  // Payout form state
  const [payoutAgentId, setPayoutAgentId] = useState('');
  const [payoutAmount, setPayoutAmount] = useState('');
  const [txnId, setTxnId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  const [formLoading, setFormLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAgentCredits();
    fetchPayments();
    fetchPendingPayments();
    fetchAgents();

    const handleUpdate = () => {
      fetchAgentCredits();
      fetchPayments();
      fetchPendingPayments();
    };

    adminSocket.on('payment.created', handleUpdate);
    adminSocket.on('payment.deleted', handleUpdate);
    adminSocket.on('pending_payments.updated', handleUpdate);
    adminSocket.on('earning.created', handleUpdate);
    adminSocket.on('credits.updated', handleUpdate);

    return () => {
      adminSocket.off('payment.created', handleUpdate);
      adminSocket.off('payment.deleted', handleUpdate);
      adminSocket.off('pending_payments.updated', handleUpdate);
      adminSocket.off('earning.created', handleUpdate);
      adminSocket.off('credits.updated', handleUpdate);
    };
  }, [dateFilter, startDate, endDate]);

  const fetchAgentCredits = async () => {
    setCreditsLoading(true);
    try {
      const res = await AdminApiService.getAgentCredits(creditsSearch);
      if (res.success) {
        setCredits(res.data);
        if (res.summary) {
          setCreditsSummary(res.summary);
        }
      }
    } catch (_) {}
    setCreditsLoading(false);
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

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const range = getDateRange();
      const res = await AdminApiService.getPayments({
        startDate: range.start,
        endDate: range.end,
        search: search.trim() || undefined,
      });
      if (res.success) {
        setPayments(res.data);
        setAnalytics(res.analytics);
      }
    } catch (_) {}
    setLoading(false);
  };

  const fetchPendingPayments = async () => {
    setPendingLoading(true);
    try {
      const res = await AdminApiService.getPendingPayments(pendingSearch.trim() || undefined);
      if (res.success) {
        setPendingPayments(res.data);
        setTotalPendingAmount(res.totalPendingAmount || 0);
      }
    } catch (_) {}
    setPendingLoading(false);
  };

  const fetchAgents = async () => {
    try {
      const res = await AdminApiService.getAgents();
      if (res.success) {
        setAgents(res.data);
      }
    } catch (_) {}
  };

  const approvedAgents = agents.filter(
    (a) => a.status === 'APPROVED' || a.kycStatus === 'APPROVED',
  );

  const handleCreditsSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAgentCredits();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPayments();
  };

  const handlePendingSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPendingPayments();
  };

  const handleOpenPayAgent = (agent: AgentCreditSummary) => {
    setPayTargetAgent(agent);
    setPayAmount(agent.pendingAmount > 0 ? String(agent.pendingAmount) : '');
    setPayMethod('UPI');
    setPayTxnId(`TXN${Date.now().toString().slice(-8)}`);
    setPayNotes(`Disbursement for approved property commissions`);
  };

  const handleConfirmPayAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payTargetAgent) return;

    const amountNum = Number(payAmount);
    if (!amountNum || amountNum <= 0) {
      alert('Please enter a valid payment amount greater than 0.');
      return;
    }
    if (amountNum > payTargetAgent.pendingAmount) {
      alert(`Payment amount (₹${amountNum}) cannot exceed the agent's pending balance (₹${payTargetAgent.pendingAmount}).`);
      return;
    }

    setPayLoading(true);
    try {
      const res = await AdminApiService.payAgent({
        agentId: payTargetAgent.agentId,
        amount: amountNum,
        paymentMethod: payMethod,
        transactionId: payTxnId.trim() || undefined,
        notes: payNotes.trim() || undefined,
      });

      if (res.success) {
        setSuccessMsg(
          `Payment of ₹${amountNum.toLocaleString('en-IN')} via ${payMethod} disbursed to ${payTargetAgent.fullName} (Ref: ${payTxnId})! Remaining Pending: ₹${res.data?.agent?.pendingAmount?.toLocaleString('en-IN') || 0}.`,
        );
        setPayTargetAgent(null);
        fetchAgentCredits();
        fetchPayments();
        fetchPendingPayments();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Payment processing failed');
    } finally {
      setPayLoading(false);
    }
  };

  const handleAddEarning = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setSuccessMsg('');

    try {
      await AdminApiService.createEarning(earningAgentId.trim(), earningTitle.trim(), Number(earningAmount));
      setSuccessMsg(`Successfully credited ₹${Number(earningAmount).toLocaleString('en-IN')} to agent!`);
      setEarningAgentId('');
      setEarningTitle('');
      setEarningAmount('');
      fetchAgentCredits();
      fetchPayments();
      fetchPendingPayments();
    } catch (err: any) {
      alert(err.message || 'Failed to add earning');
    } finally {
      setFormLoading(false);
    }
  };

  const handleRecordPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setSuccessMsg('');

    try {
      await AdminApiService.recordPayment(payoutAgentId.trim(), Number(payoutAmount), txnId.trim(), paymentMethod);
      setSuccessMsg(`Successfully recorded payout transaction ${txnId}!`);
      setPayoutAgentId('');
      setPayoutAmount('');
      setTxnId('');
      fetchAgentCredits();
      fetchPayments();
      fetchPendingPayments();
    } catch (err: any) {
      alert(err.message || 'Failed to record payment');
    } finally {
      setFormLoading(false);
    }
  };

  const handleOpenSettle = (item: PendingPaymentRecord) => {
    setSettleTarget(item);
    setSettleTxnId(`UTR${Date.now().toString().slice(-8)}`);
    setSettleMethod('UPI');
  };

  const handleConfirmSettle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settleTarget) return;

    setSettleLoading(true);
    try {
      const res = await AdminApiService.settlePendingPayment(
        settleTarget.id,
        settleTxnId.trim(),
        settleMethod,
      );
      if (res.success) {
        setSuccessMsg(
          `Payment of ₹${Number(settleTarget.amount).toLocaleString('en-IN')} for "${settleTarget.title}" settled successfully (Ref: ${settleTxnId})!`,
        );
        setSettleTarget(null);
        fetchAgentCredits();
        fetchPayments();
        fetchPendingPayments();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to settle pending payment');
    } finally {
      setSettleLoading(false);
    }
  };

  const handleDeletePayment = async (paymentId: string, txnId: string, amount: number) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete transaction "${txnId}" (₹${Number(amount).toLocaleString('en-IN')})?\n\nThis will update total expenditures and ledger records in real-time.`,
    );
    if (!confirmed) return;

    setDeleteLoadingId(paymentId);
    try {
      const res = await AdminApiService.deletePayment(paymentId);
      if (res.success) {
        setSuccessMsg(`Transaction "${txnId}" deleted successfully.`);
        fetchAgentCredits();
        fetchPayments();
        fetchPendingPayments();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete payment transaction');
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const handleDeletePendingPayment = async (earningId: string, title: string, amount: number) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel and delete pending listing reward "${title}" (₹${Number(amount).toLocaleString('en-IN')})?\n\nThis will remove the pending payout from both the admin queue and the agent's app.`,
    );
    if (!confirmed) return;

    try {
      await AdminApiService.deleteEarning(earningId);
      setSuccessMsg(`Pending reward "${title}" cancelled and deleted.`);
      fetchAgentCredits();
      fetchPendingPayments();
    } catch (err: any) {
      alert(err.message || 'Failed to delete pending payment');
    }
  };

  const filteredPayments = payments.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const txnMatch = (p.transactionId || '').toLowerCase().includes(q);
    const agentMatch = (p.agent?.fullName || '').toLowerCase().includes(q);
    const phoneMatch = (p.agent?.mobileNumber || '').includes(q);
    const methodMatch = (p.paymentMethod || '').toLowerCase().includes(q);
    return txnMatch || agentMatch || phoneMatch || methodMatch;
  });

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Agent Credits & Financials Ledger</h2>
        <p className="text-slate-500 text-sm mt-1">
          Track agent commissions, approved property pending balances, disburse payments with automatic FIFO deduction, and inspect complete transaction history.
        </p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm font-medium flex items-center space-x-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-2 min-w-0 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-blue-600 uppercase">
            <span className="truncate">Total Approved Commission</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl shrink-0 ml-2">
              <Coins className="h-4 w-4" />
            </div>
          </div>
          <div className="my-1">
            <CurrencyValue amount={creditsSummary.totalCommission} colorClass="text-slate-900" sizeClass="text-lg sm:text-xl xl:text-2xl" />
          </div>
          <span className="text-[11px] text-slate-400 block font-medium truncate">Earned across all agents</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-2 min-w-0 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 uppercase">
            <span className="truncate">Total Paid Out</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl shrink-0 ml-2">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="my-1">
            <CurrencyValue amount={creditsSummary.totalPaid || analytics.totalSpent} colorClass="text-emerald-700" sizeClass="text-lg sm:text-xl xl:text-2xl" />
          </div>
          <span className="text-[11px] text-emerald-600 block font-medium truncate">{analytics.totalTransactions} Completed Disbursals</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-2 min-w-0 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-700 uppercase">
            <span className="truncate">Current Pending Balance</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl shrink-0 ml-2">
              <Hourglass className="h-4 w-4" />
            </div>
          </div>
          <div className="my-1">
            <CurrencyValue amount={creditsSummary.totalPending || totalPendingAmount} colorClass="text-amber-700" sizeClass="text-lg sm:text-xl xl:text-2xl" />
          </div>
          <span className="text-[11px] text-amber-600 block font-medium truncate">Pending = Commission − Paid</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-2 min-w-0 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 uppercase">
            <span className="truncate">Today's Disbursed</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl shrink-0 ml-2">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="my-1">
            <CurrencyValue amount={analytics.todaySpent} colorClass="text-purple-700" sizeClass="text-lg sm:text-xl xl:text-2xl" />
          </div>
          <span className="text-[11px] text-slate-400 block font-medium truncate">Disbursed today</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-slate-200 gap-x-8 gap-y-2">
        <button
          onClick={() => { setTab('credits'); setSuccessMsg(''); }}
          className={`pb-3 font-bold text-sm transition-colors border-b-2 flex items-center space-x-2 ${
            tab === 'credits' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Coins className="h-4 w-4" />
          <span>Agent Credit & Balances ({credits.length})</span>
        </button>

        <button
          onClick={() => { setTab('records'); setSuccessMsg(''); }}
          className={`pb-3 font-bold text-sm transition-colors border-b-2 ${
            tab === 'records' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Payment Transactions ({payments.length})
        </button>

        <button
          onClick={() => { setTab('pending'); setSuccessMsg(''); }}
          className={`pb-3 font-bold text-sm transition-colors border-b-2 flex items-center space-x-2 ${
            tab === 'pending' ? 'border-amber-500 text-amber-700' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>Pending Properties Queue</span>
          {pendingPayments.length > 0 && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-300">
              {pendingPayments.length}
            </span>
          )}
        </button>

        <button
          onClick={() => { setTab('payout'); setSuccessMsg(''); }}
          className={`pb-3 font-bold text-sm transition-colors border-b-2 ${
            tab === 'payout' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          + Record Manual Payout
        </button>

        <button
          onClick={() => { setTab('earning'); setSuccessMsg(''); }}
          className={`pb-3 font-bold text-sm transition-colors border-b-2 ${
            tab === 'earning' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          + Credit Commission
        </button>
      </div>

      {/* Tab 1: Agent Credit & Balances */}
      {tab === 'credits' ? (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <form onSubmit={handleCreditsSearchSubmit} className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search agent by name, mobile number, or location..."
                value={creditsSearch}
                onChange={(e) => setCreditsSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-24 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Search
              </button>
            </form>
            <button
              onClick={fetchAgentCredits}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors"
              title="Refresh Agent Credits"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto shadow-sm">
            <table className="w-full text-left text-sm min-w-[1100px]">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th
                    className="p-4 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                    onClick={() => {
                      if (creditsSortField === 'name') {
                        setCreditsSortDirection((d) => (d === 'desc' ? 'asc' : 'desc'));
                      } else {
                        setCreditsSortField('name');
                        setCreditsSortDirection('asc');
                      }
                    }}
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>Agent Partner</span>
                      {creditsSortField === 'name' ? (
                        creditsSortDirection === 'desc' ? <ArrowDown className="h-3.5 w-3.5 text-emerald-600" /> : <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                      )}
                    </div>
                  </th>
                  <th
                    className="p-4 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                    onClick={() => {
                      if (creditsSortField === 'approved') {
                        setCreditsSortDirection((d) => (d === 'desc' ? 'asc' : 'desc'));
                      } else {
                        setCreditsSortField('approved');
                        setCreditsSortDirection('desc');
                      }
                    }}
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>Approved Listings</span>
                      {creditsSortField === 'approved' ? (
                        creditsSortDirection === 'desc' ? <ArrowDown className="h-3.5 w-3.5 text-emerald-600" /> : <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                      )}
                    </div>
                  </th>
                  <th
                    className="p-4 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                    onClick={() => {
                      if (creditsSortField === 'commission') {
                        setCreditsSortDirection((d) => (d === 'desc' ? 'asc' : 'desc'));
                      } else {
                        setCreditsSortField('commission');
                        setCreditsSortDirection('desc');
                      }
                    }}
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>Total Commission</span>
                      {creditsSortField === 'commission' ? (
                        creditsSortDirection === 'desc' ? <ArrowDown className="h-3.5 w-3.5 text-emerald-600" /> : <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                      )}
                    </div>
                  </th>
                  <th
                    className="p-4 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                    onClick={() => {
                      if (creditsSortField === 'paid') {
                        setCreditsSortDirection((d) => (d === 'desc' ? 'asc' : 'desc'));
                      } else {
                        setCreditsSortField('paid');
                        setCreditsSortDirection('desc');
                      }
                    }}
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>Total Paid</span>
                      {creditsSortField === 'paid' ? (
                        creditsSortDirection === 'desc' ? <ArrowDown className="h-3.5 w-3.5 text-emerald-600" /> : <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                      )}
                    </div>
                  </th>
                  <th
                    className="p-4 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                    onClick={() => {
                      if (creditsSortField === 'pending') {
                        setCreditsSortDirection((d) => (d === 'desc' ? 'asc' : 'desc'));
                      } else {
                        setCreditsSortField('pending');
                        setCreditsSortDirection('desc');
                      }
                    }}
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>Pending Amount</span>
                      {creditsSortField === 'pending' ? (
                        creditsSortDirection === 'desc' ? <ArrowDown className="h-3.5 w-3.5 text-emerald-600" /> : <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                      )}
                    </div>
                  </th>
                  <th className="p-4 whitespace-nowrap">Last Payout Date</th>
                  <th className="p-4 text-right whitespace-nowrap min-w-[160px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {creditsLoading ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">Loading agent balances...</td>
                  </tr>
                ) : sortedCredits.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">No agents found matching search criteria.</td>
                  </tr>
                ) : (
                  sortedCredits.map((agent) => {
                    const isPending = agent.pendingAmount > 0;
                    return (
                      <tr key={agent.agentId} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-slate-900">{agent.fullName}</div>
                          <div className="text-xs text-slate-500 flex items-center space-x-2">
                            <span>+91 {agent.mobileNumber}</span>
                            {agent.areaLocation && <span>• {agent.areaLocation}</span>}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                            {agent.approvedPropertiesCount} Approved
                          </span>
                        </td>
                        <td className="p-4 font-bold text-blue-900">
                          ₹{Number(agent.totalCommission).toLocaleString('en-IN')}
                        </td>
                        <td className="p-4 font-bold text-emerald-700">
                          ₹{Number(agent.totalPaid).toLocaleString('en-IN')}
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-extrabold ${
                              isPending
                                ? 'bg-amber-50 text-amber-900 border border-amber-300'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            ₹{Number(agent.pendingAmount).toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-slate-500">
                          {agent.lastPaymentDate
                            ? new Date(agent.lastPaymentDate).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : 'No payouts yet'}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleOpenPayAgent(agent)}
                            disabled={!isPending}
                            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all inline-flex items-center space-x-1.5 ${
                              isPending
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            <CreditCard className="h-3.5 w-3.5" />
                            <span>{isPending ? 'Pay Agent' : 'Fully Paid'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : tab === 'records' ? (
        <div className="space-y-4">
          {/* Top Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="bg-transparent font-semibold text-slate-900 focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">All Time Transactions</option>
                    <option value="TODAY">Today's Payouts</option>
                    <option value="YESTERDAY">Yesterday's Payouts</option>
                    <option value="WEEK">This Week (Last 7 Days)</option>
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

              <button
                onClick={fetchPayments}
                className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 transition-colors self-end lg:self-auto"
                title="Refresh Ledger"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search transaction UTR, agent name, mobile number, or method..."
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

          {/* Payment Records Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto shadow-sm">
            <table className="w-full text-left text-sm min-w-[1200px]">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-4 whitespace-nowrap">Transaction UTR / Ref</th>
                  <th
                    className="p-4 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                    onClick={() => {
                      if (recordsSortField === 'name') {
                        setRecordsSortDirection((d) => (d === 'desc' ? 'asc' : 'desc'));
                      } else {
                        setRecordsSortField('name');
                        setRecordsSortDirection('asc');
                      }
                    }}
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>Agent Partner</span>
                      {recordsSortField === 'name' ? (
                        recordsSortDirection === 'desc' ? <ArrowDown className="h-3.5 w-3.5 text-emerald-600" /> : <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                      )}
                    </div>
                  </th>
                  <th className="p-4 whitespace-nowrap">Method</th>
                  <th className="p-4 whitespace-nowrap">Prev Pending</th>
                  <th
                    className="p-4 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                    onClick={() => {
                      if (recordsSortField === 'amount') {
                        setRecordsSortDirection((d) => (d === 'desc' ? 'asc' : 'desc'));
                      } else {
                        setRecordsSortField('amount');
                        setRecordsSortDirection('desc');
                      }
                    }}
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>Paid Amount</span>
                      {recordsSortField === 'amount' ? (
                        recordsSortDirection === 'desc' ? <ArrowDown className="h-3.5 w-3.5 text-emerald-600" /> : <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                      )}
                    </div>
                  </th>
                  <th className="p-4 whitespace-nowrap">Remaining Pending</th>
                  <th
                    className="p-4 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                    onClick={() => {
                      if (recordsSortField === 'date') {
                        setRecordsSortDirection((d) => (d === 'desc' ? 'asc' : 'desc'));
                      } else {
                        setRecordsSortField('date');
                        setRecordsSortDirection('desc');
                      }
                    }}
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>Date & Time</span>
                      {recordsSortField === 'date' ? (
                        recordsSortDirection === 'desc' ? <ArrowDown className="h-3.5 w-3.5 text-emerald-600" /> : <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                      )}
                    </div>
                  </th>
                  <th className="p-4 whitespace-nowrap">Status</th>
                  <th className="p-4 text-right whitespace-nowrap min-w-[120px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">Loading payment ledger from database...</td>
                  </tr>
                ) : filteredAndSortedPayments.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">No payment records found matching criteria.</td>
                  </tr>
                ) : (
                  filteredAndSortedPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="font-mono font-bold text-slate-900 text-xs">{payment.transactionId}</div>
                        {payment.notes && (
                          <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{payment.notes}</div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-900">{payment.agent?.fullName || 'Agent Partner'}</div>
                        <div className="text-xs text-slate-500">+91 {payment.agent?.mobileNumber}</div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold border border-slate-200">
                          {payment.paymentMethod}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-slate-600 text-xs">
                        ₹{Number(payment.previousPendingAmount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-4 font-extrabold text-emerald-700 text-base">
                        ₹{Number(payment.amount).toLocaleString('en-IN')}
                      </td>
                      <td className="p-4 font-bold text-amber-800 text-xs">
                        ₹{Number(payment.remainingPendingAmount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-4 text-xs">
                        <div className="font-semibold text-slate-800">
                          {new Date(payment.paidAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-[11px] text-emerald-700 font-bold flex items-center space-x-1 mt-0.5">
                          <Clock className="h-3 w-3 inline text-emerald-600" />
                          <span>
                            {new Date(payment.paidAt).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1 w-max">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>COMPLETED</span>
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeletePayment(payment.id, payment.transactionId, payment.amount)}
                          disabled={deleteLoadingId === payment.id}
                          className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-200 transition-colors disabled:opacity-50 inline-flex items-center space-x-1"
                          title="Delete Transaction Record"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="text-xs font-semibold">Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : tab === 'pending' ? (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <form onSubmit={handlePendingSearchSubmit} className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by agent name, phone, property title, or location..."
                value={pendingSearch}
                onChange={(e) => setPendingSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-24 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Search
              </button>
            </form>

            {/* Sorting Controls */}
            <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1 shadow-sm self-start lg:self-auto">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">Sort:</span>
              
              <button
                type="button"
                onClick={() => setPendingSortOrder('asc')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  pendingSortOrder === 'asc'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
                title="Sort by lowest pending commission first"
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
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
                title="Sort by highest pending commission first"
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
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
                title="Shuffle in random order"
              >
                <Shuffle className="h-3.5 w-3.5" />
                <span>Random</span>
              </button>
            </div>

            <button
              onClick={fetchPendingPayments}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors"
              title="Refresh Pending List"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto shadow-sm">
            <table className="w-full text-left text-sm min-w-[1150px]">
              <thead className="bg-amber-50/60 text-xs font-semibold text-amber-900 uppercase tracking-wider border-b border-amber-200">
                <tr>
                  <th className="p-4 whitespace-nowrap">Approved Property Title</th>
                  <th className="p-4 whitespace-nowrap">Beneficiary Agent</th>
                  <th className="p-4 whitespace-nowrap">Location</th>
                  <th className="p-4 whitespace-nowrap">Pending Commission</th>
                  <th className="p-4 whitespace-nowrap">Approved Date</th>
                  <th className="p-4 whitespace-nowrap">Status</th>
                  <th className="p-4 text-right whitespace-nowrap min-w-[200px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">Loading pending payments queue...</td>
                  </tr>
                ) : sortedPendingPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      🎉 No pending payments in queue! All approved property commissions are fully disbursed.
                    </td>
                  </tr>
                ) : (
                  sortedPendingPayments.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-900">
                        {item.title}
                        {item.propertyId && (
                          <div className="text-[11px] text-slate-400 font-normal">Property ID: {item.propertyId.substring(0, 8)}...</div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-900">{item.agent?.fullName}</div>
                        <div className="text-xs text-slate-500">+91 {item.agent?.mobileNumber}</div>
                      </td>
                      <td className="p-4 text-xs text-slate-600">{item.propertyLocation || 'Bangalore'}</td>
                      <td className="p-4 font-extrabold text-amber-800 text-base">
                        ₹{Number(item.amount).toLocaleString('en-IN')}
                      </td>
                      <td className="p-4 text-xs text-slate-600">
                        {new Date(item.earnedDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          PENDING
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-1.5">
                        <button
                          onClick={() => handleOpenSettle(item)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm inline-flex items-center space-x-1"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                          <span>Settle ₹{Number(item.amount).toLocaleString('en-IN')}</span>
                        </button>
                        <button
                          onClick={() => handleDeletePendingPayment(item.id, item.title, item.amount)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Cancel Pending Reward"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : tab === 'earning' ? (
        <form onSubmit={handleAddEarning} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 max-w-2xl">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">Select Beneficiary Agent</label>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {approvedAgents.length} Approved Agents
              </span>
            </div>
            <select
              value={earningAgentId}
              onChange={(e) => setEarningAgentId(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
            >
              <option value="">
                {approvedAgents.length === 0
                  ? '-- No Approved Agents Found --'
                  : '-- Choose Agent to Credit --'}
              </option>
              {approvedAgents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.fullName} (+91 {a.mobileNumber}) - ID: {a.id.substring(0, 8)}... [KYC: APPROVED]
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Commission Title / Reason</label>
            <input
              type="text"
              required
              value={earningTitle}
              onChange={(e) => setEarningTitle(e.target.value)}
              placeholder="e.g. Listing Commission for Villa"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (INR ₹)</label>
            <input
              type="number"
              required
              value={earningAmount}
              onChange={(e) => setEarningAmount(e.target.value)}
              placeholder="60"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={formLoading || (!earningAgentId && approvedAgents.length === 0)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 font-semibold py-3 rounded-xl text-white shadow-md shadow-emerald-600/15 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <Send className="h-4 w-4" />
            <span>{formLoading ? 'Processing...' : 'Credit Commission to Agent'}</span>
          </button>
        </form>
      ) : (
        <form onSubmit={handleRecordPayout} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 max-w-2xl">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">Select Agent Partner</label>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {approvedAgents.length} Agents Available
              </span>
            </div>
            <select
              value={payoutAgentId}
              onChange={(e) => setPayoutAgentId(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
            >
              <option value="">
                {approvedAgents.length === 0
                  ? '-- No Approved Agents Found --'
                  : '-- Choose Agent --'}
              </option>
              {approvedAgents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.fullName} (+91 {a.mobileNumber}) - ID: {a.id.substring(0, 8)}...
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Payout Amount (INR ₹)</label>
            <input
              type="number"
              required
              value={payoutAmount}
              onChange={(e) => setPayoutAmount(e.target.value)}
              placeholder="30"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Transaction Ref / Bank UTR ID</label>
            <input
              type="text"
              required
              value={txnId}
              onChange={(e) => setTxnId(e.target.value)}
              placeholder="e.g. UTR123456789 or UPI987654"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
            >
              <option value="UPI">UPI Instant Transfer</option>
              <option value="CASH">Cash Payment</option>
              <option value="BANK_TRANSFER">Bank Transfer (NEFT / IMPS / RTGS)</option>
              <option value="CHEQUE">Cheque</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={formLoading || (!payoutAgentId && approvedAgents.length === 0)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 font-semibold py-3 rounded-xl text-white shadow-md shadow-emerald-600/15 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <Wallet className="h-4 w-4" />
            <span>{formLoading ? 'Recording Transaction...' : 'Record Payout & Push Live Notification'}</span>
          </button>
        </form>
      )}

      {/* Pay Agent Direct Modal with FIFO Allocation */}
      {payTargetAgent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Pay Agent Commission</h3>
                  <p className="text-xs text-slate-500">Clears earliest pending commissions first (FIFO)</p>
                </div>
              </div>
              <button
                onClick={() => setPayTargetAgent(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Agent Balance Details Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Agent Partner:</span>
                <span className="font-bold text-slate-900">{payTargetAgent.fullName} (+91 {payTargetAgent.mobileNumber})</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Total Commission Earned:</span>
                <span className="font-semibold text-blue-900">₹{payTargetAgent.totalCommission.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Total Already Paid:</span>
                <span className="font-semibold text-emerald-700">₹{payTargetAgent.totalPaid.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="text-slate-800 font-bold">Current Pending Balance:</span>
                <span className="text-lg font-extrabold text-amber-700">₹{payTargetAgent.pendingAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Pay Form */}
            <form onSubmit={handleConfirmPayAgent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Amount (INR ₹) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-500">₹</span>
                  <input
                    type="number"
                    min="1"
                    max={payTargetAgent.pendingAmount}
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    placeholder={`Max ₹${payTargetAgent.pendingAmount}`}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 font-mono"
                  />
                </div>
                {Number(payAmount) > payTargetAgent.pendingAmount && (
                  <p className="text-xs text-rose-600 font-semibold mt-1">
                    ⚠️ Payment amount cannot exceed current pending balance of ₹{payTargetAgent.pendingAmount}.
                  </p>
                )}
              </div>

              {/* Dynamic Live Balance Breakdown Preview */}
              {Number(payAmount) > 0 && Number(payAmount) <= payTargetAgent.pendingAmount && (
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 text-xs space-y-1 text-emerald-950">
                  <div className="flex justify-between">
                    <span>Previous Pending:</span>
                    <span className="font-bold">₹{payTargetAgent.pendingAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Amount Being Paid:</span>
                    <span>- ₹{Number(payAmount).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-emerald-200 font-extrabold text-slate-900">
                    <span>Remaining Pending Balance:</span>
                    <span className="text-amber-800">
                      ₹{Math.max(0, payTargetAgent.pendingAmount - Number(payAmount)).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 font-medium"
                >
                  <option value="UPI">UPI Instant (Google Pay / PhonePe / Paytm)</option>
                  <option value="CASH">Cash Direct Disbursal</option>
                  <option value="BANK_TRANSFER">Direct Bank Transfer (NEFT / IMPS / RTGS)</option>
                  <option value="CHEQUE">Bank Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Transaction Ref / UTR / Remarks</label>
                <input
                  type="text"
                  value={payTxnId}
                  onChange={(e) => setPayTxnId(e.target.value)}
                  placeholder="e.g. UPI12345678 or UTR987654"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Notes (Optional)</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="e.g. First installment for approved residential listings"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPayTargetAgent(null)}
                  className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={payLoading || !Number(payAmount) || Number(payAmount) > payTargetAgent.pendingAmount}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>{payLoading ? 'Processing...' : `Confirm Pay ₹${Number(payAmount || 0).toLocaleString('en-IN')}`}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settle Pending Payment Modal */}
      {settleTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Settle Pending Listing Reward</h3>
                  <p className="text-xs text-slate-500">Transfer reward to agent partner</p>
                </div>
              </div>
              <button
                onClick={() => setSettleTarget(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Target Details Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Agent Partner:</span>
                <span className="font-bold text-slate-900">{settleTarget.agent?.fullName} (+91 {settleTarget.agent?.mobileNumber})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Listing Reference:</span>
                <span className="font-semibold text-slate-800">{settleTarget.title}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="text-slate-700 font-bold">Reward Amount:</span>
                <span className="text-lg font-extrabold text-emerald-700">₹{Number(settleTarget.amount).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Settle Form */}
            <form onSubmit={handleConfirmSettle} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Transaction Ref / Bank UTR ID</label>
                <input
                  type="text"
                  required
                  value={settleTxnId}
                  onChange={(e) => setSettleTxnId(e.target.value)}
                  placeholder="e.g. UTR987654321 or UPI123456"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={settleMethod}
                  onChange={(e) => setSettleMethod(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                >
                  <option value="UPI">UPI Instant Transfer</option>
                  <option value="CASH">Cash</option>
                  <option value="BANK_TRANSFER">Bank Transfer (NEFT / IMPS / RTGS)</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSettleTarget(null)}
                  className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={settleLoading}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>{settleLoading ? 'Settling...' : 'Confirm & Disburse'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
