import React from 'react';
import { LogOut, Bell, UserCheck, Radio } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { logout, socketConnected } = useAuth();

  return (
    <header className="h-16 bg-white/95 backdrop-blur border-b border-[#E8E2D8] px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center space-x-3 text-xs font-semibold">
        <div
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border transition-all ${
            socketConnected
              ? 'bg-[#DDE3DA] text-[#2C3629] border-[#BAC7B6]'
              : 'bg-[#F5EFE0] text-[#7A6025] border-[#E6D8B8]'
          }`}
        >
          <Radio className={`h-3.5 w-3.5 ${socketConnected ? 'animate-pulse text-[#5F7359]' : 'text-[#7A6025]'}`} />
          <span>{socketConnected ? 'Real-Time WebSocket Gateway Connected (Live Stream Active)' : 'Connecting Real-Time Gateway...'}</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-xl bg-[#F2EFEB] text-[#6E736E] hover:text-[#1B211E] transition-colors relative border border-[#E8E2D8]">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#5F7359]"></span>
        </button>

        <div className="flex items-center space-x-3 pl-4 border-l border-[#E8E2D8]">
          <div className="h-9 w-9 bg-[#DDE3DA] rounded-full flex items-center justify-center text-[#2C3629] font-bold text-sm border border-[#BAC7B6]">
            <UserCheck className="h-4.5 w-4.5 text-[#5F7359]" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-[#1B211E]">Executive Admin</p>
            <p className="text-xs text-[#6E736E]">admin@thenexopp.com</p>
          </div>
          <button
            onClick={logout}
            className="p-2 text-[#6E736E] hover:text-rose-600 transition-colors ml-2 rounded-lg hover:bg-rose-50"
            title="Logout"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
