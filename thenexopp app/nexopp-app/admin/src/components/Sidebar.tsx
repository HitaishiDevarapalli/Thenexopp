import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, FileCheck, Building2, WalletCards, Shield, LifeBuoy, TrendingUp } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const links = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/performance', label: 'Agent Performance', icon: TrendingUp },
    { to: '/agents', label: 'Agents & Partners', icon: Users },
    { to: '/kyc', label: 'KYC Verification', icon: FileCheck },
    { to: '/properties', label: 'Property Listings', icon: Building2 },
    { to: '/financials', label: 'Earnings & Payouts', icon: WalletCards },
    { to: '/tickets', label: 'Support Tickets', icon: LifeBuoy },
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#E8E2D8] flex flex-col min-h-screen">
      <div className="p-6 border-b border-[#E8E2D8] flex items-center space-x-3">
        <div className="h-10 w-10 bg-[#DDE3DA] border border-[#BAC7B6] rounded-xl flex items-center justify-center text-[#2C3629]">
          <Shield className="h-5 w-5 text-[#5F7359]" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-[#1B211E] tracking-tight">TheNexopp</h1>
          <p className="text-xs text-[#6E736E] font-medium">Agent Network Admin</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-[#1B211E] text-white shadow-sm font-semibold'
                    : 'text-[#6E736E] hover:bg-[#F2EFEB] hover:text-[#1B211E]'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#E8E2D8]">
        <div className="bg-[#FAF8F5] border border-[#E8E2D8] p-3 rounded-xl text-xs text-[#6E736E] text-center font-medium">
          Production Admin v1.0.0
        </div>
      </div>
    </aside>
  );
};
