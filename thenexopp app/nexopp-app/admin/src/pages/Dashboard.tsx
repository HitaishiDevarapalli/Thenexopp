import React, { useEffect, useState } from 'react';
import { Users, FileCheck, Building2, Wallet, ArrowUpRight, Clock, ShieldCheck } from 'lucide-react';
import { AdminApiService } from '../services/api';
import { AgentSummary } from '../types';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const [agents, setAgents] = useState<AgentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await AdminApiService.getAgents();
      if (res.success) {
        setAgents(res.data);
      }
    } catch (_) {}
    setLoading(false);
  };

  const pendingKycCount = agents.filter((a) => a.kycStatus === 'UNDER_REVIEW' || a.status === 'KYC_INCOMPLETE').length;
  const pendingApprovalCount = agents.filter((a) => a.status === 'PENDING_APPROVAL').length;
  const approvedAgentsCount = agents.filter((a) => a.status === 'APPROVED').length;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[#1B211E] tracking-tight">Executive Dashboard</h2>
        <p className="text-[#6E736E] text-sm mt-1">Real-time overview of TheNexopp Agent Network & Operations</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-[#E8E2D8] p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6E736E] uppercase tracking-wider">Total Agents</span>
            <div className="p-2 bg-[#FAF8F5] text-[#1B211E] rounded-xl border border-[#E8E2D8]">
              <Users className="h-5 w-5 text-[#5F7359]" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#1B211E]">{agents.length}</div>
          <p className="text-xs text-[#6E736E] flex items-center space-x-1">
            <span className="text-[#2C3629] font-semibold">{approvedAgentsCount} Active Approved</span>
          </p>
        </div>

        <div className="bg-white border border-[#E8E2D8] p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6E736E] uppercase tracking-wider">Pending KYC</span>
            <div className="p-2 bg-[#F5EFE0] text-[#7A6025] rounded-xl border border-[#E6D8B8]">
              <FileCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#7A6025]">{pendingKycCount}</div>
          <Link to="/kyc" className="text-xs text-[#7A6025] hover:underline flex items-center space-x-1 font-semibold">
            <span>Review Submissions</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="bg-white border border-[#E8E2D8] p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6E736E] uppercase tracking-wider">Pending Approvals</span>
            <div className="p-2 bg-[#FAF8F5] text-[#5F7359] rounded-xl border border-[#E8E2D8]">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#1B211E]">{pendingApprovalCount}</div>
          <Link to="/agents" className="text-xs text-[#5F7359] hover:underline flex items-center space-x-1 font-semibold">
            <span>Approve Agents</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="bg-white border border-[#E8E2D8] p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6E736E] uppercase tracking-wider">WebSocket Gateway</span>
            <div className="p-2 bg-[#DDE3DA] text-[#2C3629] rounded-xl border border-[#BAC7B6]">
              <ShieldCheck className="h-5 w-5 text-[#5F7359]" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#2C3629]">Connected</div>
          <p className="text-xs text-[#5F7359] font-medium">Live Syncing to Mobile Phones</p>
        </div>
      </div>

      {/* Recent Agents Table */}
      <div className="bg-white border border-[#E8E2D8] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-[#1B211E]">Recent Registered Agents</h3>
          <Link to="/agents" className="text-xs font-semibold text-[#5F7359] hover:underline">
            View All Agents
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[700px]">
            <thead>
              <tr className="text-xs font-semibold text-[#6E736E] border-b border-[#E8E2D8] uppercase tracking-wider bg-[#FAF8F5]">
                <th className="p-3 whitespace-nowrap">Agent</th>
                <th className="p-3 whitespace-nowrap">Mobile</th>
                <th className="p-3 whitespace-nowrap">Work Platform</th>
                <th className="p-3 whitespace-nowrap">Status</th>
                <th className="p-3 whitespace-nowrap min-w-[100px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2D8]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-[#6E736E]">Loading recent agents...</td>
                </tr>
              ) : agents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-[#6E736E]">No agents registered yet.</td>
                </tr>
              ) : (
                agents.slice(0, 5).map((agent) => (
                  <tr key={agent.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-4 px-3 font-semibold text-[#1B211E] whitespace-nowrap">{agent.fullName || 'New Partner'}</td>
                    <td className="py-4 px-3 text-[#6E736E] whitespace-nowrap">+91 {agent.mobileNumber}</td>
                    <td className="py-4 px-3 text-[#6E736E] whitespace-nowrap">{agent.workPlatform || 'Individual'}</td>
                    <td className="py-4 px-3 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        agent.status === 'APPROVED' ? 'bg-[#DDE3DA] text-[#2C3629] border border-[#BAC7B6]' :
                        agent.status === 'PENDING_APPROVAL' ? 'bg-[#F5EFE0] text-[#7A6025] border border-[#E6D8B8]' :
                        'bg-[#FAF8F5] text-[#6E736E] border border-[#E8E2D8]'
                      }`}>
                        {agent.status}
                      </span>
                    </td>
                    <td className="py-4 px-3 whitespace-nowrap">
                      <Link to="/agents" className="text-xs text-[#5F7359] hover:underline font-semibold">
                        Inspect
                      </Link>
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
