import React, { useEffect, useState } from 'react';
import { AdminApiService } from '../services/api';
import { SupportTicket, TicketStatus, TicketCategory, TicketPriority, TicketAnalytics } from '../types';
import {
  LifeBuoy,
  PhoneCall,
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Phone,
  User,
  MessageSquare,
  Send,
  HelpCircle,
  Tag,
  AlertTriangle,
  ArrowRight,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from 'lucide-react';
import { Modal } from '../components/Modal';
import { adminSocket } from '../services/websocket';

export const Tickets: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [analytics, setAnalytics] = useState<TicketAnalytics>({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  // Sorting State
  const [sortField, setSortField] = useState<'date' | 'priority' | 'status' | 'agent'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const priorityWeights: Record<string, number> = {
    URGENT: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  };

  const filteredAndSortedTickets = React.useMemo(() => {
    const list = [...tickets];
    return list.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'agent') {
        comparison = (a.agent?.fullName || '').localeCompare(b.agent?.fullName || '');
      } else if (sortField === 'status') {
        comparison = (a.status || '').localeCompare(b.status || '');
      } else if (sortField === 'priority') {
        comparison = (priorityWeights[a.priority] || 0) - (priorityWeights[b.priority] || 0);
      } else if (sortField === 'date') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [tickets, sortField, sortDirection]);

  // Ticket inspection & resolution modal
  const [inspectTicket, setInspectTicket] = useState<SupportTicket | null>(null);
  const [resolutionText, setResolutionText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  useEffect(() => {
    fetchTickets();

    const handleTicketCreated = (data: any) => {
      console.log('[Tickets Page] 🚨 New ticket received live:', data);
      setSuccessToast(`🚨 New Support Ticket: ${data?.ticketNumber || ''} - "${data?.subject || 'Help Request'}" by ${data?.agentName || 'Agent Partner'}`);
      setTimeout(() => setSuccessToast(''), 6000);
      fetchTickets();
    };

    const handleTicketUpdated = () => {
      fetchTickets();
    };

    adminSocket.on('ticket.created', handleTicketCreated);
    adminSocket.on('ticket.updated', handleTicketUpdated);

    return () => {
      adminSocket.off('ticket.created', handleTicketCreated);
      adminSocket.off('ticket.updated', handleTicketUpdated);
    };
  }, [filterStatus, filterCategory, filterPriority]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const statusParam = filterStatus === 'ALL' ? undefined : filterStatus;
      const categoryParam = filterCategory === 'ALL' ? undefined : filterCategory;
      const priorityParam = filterPriority === 'ALL' ? undefined : filterPriority;
      const res = await AdminApiService.getTickets({
        status: statusParam,
        category: categoryParam,
        priority: priorityParam,
        search: search.trim() || undefined,
      });

      if (res.success) {
        setTickets(res.data);
        if (res.analytics) {
          setAnalytics(res.analytics);
        }
      }
    } catch (_) {}
    setLoading(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTickets();
  };

  const handleUpdateStatus = async (status: TicketStatus, resolution?: string) => {
    if (!inspectTicket) return;
    setActionLoading(true);
    try {
      await AdminApiService.updateTicket(inspectTicket.id, {
        status,
        resolution: resolution || undefined,
      });
      setSuccessToast(`Ticket ${inspectTicket.ticketNumber} updated to ${status}`);
      setTimeout(() => setSuccessToast(''), 4000);
      setInspectTicket(null);
      setResolutionText('');
      fetchTickets();
    } catch (e: any) {
      alert(e.message || 'Failed to update ticket status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTicket = async (ticketId: string, ticketNumber?: string) => {
    if (!window.confirm(`Are you sure you want to delete support ticket ${ticketNumber || 'this ticket'}?`)) {
      return;
    }
    try {
      await AdminApiService.deleteTicket(ticketId);
      if (inspectTicket?.id === ticketId) {
        setInspectTicket(null);
      }
      fetchTickets();
    } catch (err: any) {
      alert(err.message || 'Failed to delete ticket');
    }
  };

  const getCategoryColor = (cat: TicketCategory) => {
    switch (cat) {
      case 'KYC':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'PAYMENTS':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PROPERTIES':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'TECHNICAL':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getPriorityBadge = (p: TicketPriority) => {
    switch (p) {
      case 'URGENT':
        return <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-extrabold border border-rose-300 animate-pulse">URGENT</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 text-[10px] font-bold border border-slate-200">LOW</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Agent Support & Helpdesk Hub</h2>
            <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              <LifeBuoy className="h-3.5 w-3.5 text-emerald-600" />
              <span>Live Inbound Tickets</span>
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Review, inspect, and resolve issues filed by agents from the mobile app, and trigger one-tap support calls
          </p>
        </div>

        <button
          onClick={fetchTickets}
          className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm self-start md:self-auto"
          title="Refresh Inbound Tickets"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {successToast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm font-semibold flex items-center space-x-2 shadow-sm">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Total Tickets</span>
            <HelpCircle className="h-4 w-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-1">{analytics.total}</p>
          <span className="text-[11px] text-slate-400 block mt-0.5">All-time raised</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-700 uppercase">
            <span>Open Issues</span>
            <AlertCircle className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-1">{analytics.open}</p>
          <span className="text-[11px] text-amber-600/80 block mt-0.5">Needs admin action</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-blue-700 uppercase">
            <span>In Progress</span>
            <Clock className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-700 mt-1">{analytics.inProgress}</p>
          <span className="text-[11px] text-blue-600/80 block mt-0.5">Currently working on</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 uppercase">
            <span>Resolved</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{analytics.resolved}</p>
          <span className="text-[11px] text-emerald-600/80 block mt-0.5">Successfully closed</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: 'All Tickets', val: 'ALL' },
              { label: `Open (${analytics.open})`, val: 'OPEN' },
              { label: `In Progress (${analytics.inProgress})`, val: 'IN_PROGRESS' },
              { label: `Resolved (${analytics.resolved})`, val: 'RESOLVED' },
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

          {/* Category & Priority Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="KYC">KYC Verification</option>
              <option value="PROPERTIES">Property Listings</option>
              <option value="PAYMENTS">Payments & Payouts</option>
              <option value="ACCOUNT">Account Status</option>
              <option value="TECHNICAL">Technical Problem</option>
              <option value="OTHER">Other Query</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Ticket # (e.g. TKT-123456), Agent Name, Phone, or Issue Subject..."
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

      {/* Tickets Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto shadow-sm">
        <table className="w-full text-left text-sm min-w-[1050px]">
          <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
            <tr>
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
                  <span>Ticket ID & Date</span>
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
                  if (sortField === 'agent') {
                    setSortDirection((d) => (d === 'desc' ? 'asc' : 'desc'));
                  } else {
                    setSortField('agent');
                    setSortDirection('asc');
                  }
                }}
              >
                <div className="flex items-center space-x-1.5">
                  <span>Agent Partner</span>
                  {sortField === 'agent' ? (
                    sortDirection === 'desc' ? <ArrowDown className="h-3.5 w-3.5 text-emerald-600" /> : <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                  )}
                </div>
              </th>
              <th
                className="p-4 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                onClick={() => {
                  if (sortField === 'priority') {
                    setSortDirection((d) => (d === 'desc' ? 'asc' : 'desc'));
                  } else {
                    setSortField('priority');
                    setSortDirection('desc');
                  }
                }}
              >
                <div className="flex items-center space-x-1.5">
                  <span>Category & Priority</span>
                  {sortField === 'priority' ? (
                    sortDirection === 'desc' ? <ArrowDown className="h-3.5 w-3.5 text-emerald-600" /> : <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                  )}
                </div>
              </th>
              <th className="p-4 whitespace-nowrap">Issue Description</th>
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
              <th className="p-4 text-right whitespace-nowrap min-w-[220px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">Loading support tickets...</td>
              </tr>
            ) : filteredAndSortedTickets.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">No support tickets found matching criteria.</td>
              </tr>
            ) : (
              filteredAndSortedTickets.map((t) => (
                <tr
                  key={t.id}
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => {
                    setInspectTicket(t);
                    setResolutionText(t.resolution || '');
                  }}
                >
                  <td className="p-4">
                    <div className="font-mono font-bold text-slate-900 text-xs">{t.ticketNumber}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{t.agent?.fullName || 'Agent Partner'}</div>
                    <div className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                      <span>+91 {t.agent?.mobileNumber}</span>
                      <span>•</span>
                      <span>{t.agent?.areaLocation || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getCategoryColor(t.category)}`}>
                        {t.category}
                      </span>
                      {getPriorityBadge(t.priority)}
                    </div>
                  </td>
                  <td className="p-4 max-w-xs">
                    <div className="font-semibold text-slate-900 truncate text-xs">{t.subject}</div>
                    <div className="text-xs text-slate-500 truncate mt-0.5">{t.description}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      t.status === 'OPEN'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : t.status === 'IN_PROGRESS'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {t.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-1.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <a
                      href={`tel:+91${t.agent?.mobileNumber}`}
                      className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold inline-flex items-center space-x-1"
                      title="Direct phone call to agent"
                    >
                      <Phone className="h-3 w-3" />
                      <span>Call</span>
                    </a>
                    <button
                      onClick={() => {
                        setInspectTicket(t);
                        setResolutionText(t.resolution || '');
                      }}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                    >
                      Inspect & Reply
                    </button>
                    <button
                      onClick={() => handleDeleteTicket(t.id, t.ticketNumber)}
                      className="p-1.5 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold inline-flex items-center transition-colors"
                      title="Delete Support Ticket"
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

      {/* Ticket Details & Resolution Modal */}
      {inspectTicket && (
        <Modal
          isOpen={!!inspectTicket}
          onClose={() => setInspectTicket(null)}
          title={`Ticket Details — ${inspectTicket.ticketNumber}`}
        >
          <div className="space-y-5">
            {/* Agent Info Banner */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="h-11 w-11 rounded-2xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-sm shadow-sm">
                  {inspectTicket.agent?.fullName ? inspectTicket.agent.fullName.charAt(0).toUpperCase() : 'A'}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{inspectTicket.agent?.fullName || 'Agent Partner'}</h4>
                  <p className="text-xs text-slate-500">+91 {inspectTicket.agent?.mobileNumber} • {inspectTicket.agent?.areaLocation || 'N/A'}</p>
                </div>
              </div>

              <a
                href={`tel:+91${inspectTicket.agent?.mobileNumber}`}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-colors self-start sm:self-auto"
              >
                <PhoneCall className="h-3.5 w-3.5" />
                <span>Call Agent Directly</span>
              </a>
            </div>

            {/* Ticket Info Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getCategoryColor(inspectTicket.category)}`}>
                    {inspectTicket.category}
                  </span>
                  {getPriorityBadge(inspectTicket.priority)}
                </div>
                <div className="text-xs text-slate-400 font-medium">
                  Filed on {new Date(inspectTicket.createdAt).toLocaleString()}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-base text-slate-900">{inspectTicket.subject}</h3>
                <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed mt-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {inspectTicket.description}
                </p>
              </div>

              {inspectTicket.resolution && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs">
                  <span className="font-bold text-emerald-900 block mb-1">Previous Resolution Remark:</span>
                  <p className="text-emerald-800">{inspectTicket.resolution}</p>
                </div>
              )}
            </div>

            {/* Resolution Form */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Admin Resolution / Response Note</label>
              <textarea
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                rows={3}
                placeholder="Type resolution remarks or instructions to send to the agent's phone..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-between items-center gap-3 pt-2 border-t border-slate-200">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setInspectTicket(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-200 hover:text-slate-900"
                >
                  Close
                </button>
                <button
                  onClick={() => handleDeleteTicket(inspectTicket.id, inspectTicket.ticketNumber)}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete Ticket</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                {inspectTicket.status !== 'IN_PROGRESS' && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus('IN_PROGRESS', resolutionText)}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
                  >
                    Mark In Progress
                  </button>
                )}

                <button
                  disabled={actionLoading}
                  onClick={() => handleUpdateStatus('RESOLVED', resolutionText || 'Issue verified and resolved by support')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/15 transition-colors disabled:opacity-50 flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Resolve & Close Ticket</span>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
