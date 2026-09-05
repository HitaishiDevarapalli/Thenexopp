import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  ExternalLink,
  Search,
  Menu,
  ChevronRight,
  ShieldCheck,
  LogOut,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
} from 'lucide-react';
import { AdminBadge } from './ui/AdminBadge';
import { AdminButton } from './ui/AdminButton';

export interface AdminHeaderProps {
  activeTab: string;
  activeTabLabel: string;
  categoryLabel?: string;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  currentUserName: string;
  currentUserEmail?: string;
  currentUserRole: string;
  onLogout: () => void;
  onRefreshData?: () => void;
  isRefreshing?: boolean;
  unreadInquiriesCount?: number;
  onOpenInquiries?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeTab,
  activeTabLabel,
  categoryLabel,
  isSidebarCollapsed,
  onToggleSidebar,
  currentUserName,
  currentUserEmail,
  currentUserRole,
  onLogout,
  onRefreshData,
  isRefreshing = false,
  unreadInquiriesCount = 0,
  onOpenInquiries,
  searchQuery,
  onSearchChange,
}) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-20 h-16 bg-white border-b border-slate-200/90 shadow-xs flex items-center justify-between px-4 sm:px-6 transition-all duration-200">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-3">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <span className="text-slate-400">Portal</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          {categoryLabel && (
            <>
              <span className="text-slate-500">{categoryLabel}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            </>
          )}
          <span className="text-slate-900 font-semibold">{activeTabLabel}</span>
        </nav>
      </div>

      {/* Middle: Optional Search */}
      {onSearchChange !== undefined && (
        <div className="hidden md:flex items-center flex-1 max-w-xs mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Filter current view..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>
      )}

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Live sync badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50/80 border border-emerald-200/60 text-emerald-700 text-[11px] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live API Synced</span>
        </div>

        {/* Refresh button */}
        {onRefreshData && (
          <button
            type="button"
            onClick={onRefreshData}
            disabled={isRefreshing}
            title="Refresh portal data"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        )}

        {/* Notifications / Inquiries button */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => {
              if (onOpenInquiries) {
                onOpenInquiries();
              } else {
                setNotifOpen(!notifOpen);
              }
            }}
            title="Inquiries & Notifications"
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadInquiriesCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
                {unreadInquiriesCount > 99 ? '99+' : unreadInquiriesCount}
              </span>
            )}
          </button>
        </div>

        {/* Live Public Site Button */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors"
        >
          <span>Live Site</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
        </a>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1 sm:px-2 sm:py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white text-xs font-bold shadow-xs">
              {currentUserName ? currentUserName.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="hidden xl:flex flex-col text-left leading-tight">
              <span className="text-xs font-semibold text-slate-800 truncate max-w-[120px]">
                {currentUserName || 'Admin'}
              </span>
              <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                {currentUserRole || 'Administrator'}
              </span>
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200/80 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900 truncate">{currentUserName || 'Administrator'}</p>
                <p className="text-[11px] text-slate-500 truncate">{currentUserEmail || 'admin@thenexopp.com'}</p>
                <div className="mt-1.5">
                  <AdminBadge
                    variant={currentUserRole === 'Super Admin' ? 'purple' : 'info'}
                    size="sm"
                    dot
                  >
                    {currentUserRole}
                  </AdminBadge>
                </div>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    onLogout();
                  }}
                  className="w-full px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sign Out of Portal</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
