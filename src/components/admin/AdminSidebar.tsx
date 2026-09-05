import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Store,
  Briefcase,
  MapPin,
  SlidersHorizontal,
  UserCheck,
  Users,
  ShieldCheck,
  KeyRound,
  Mail,
  Bot,
  LayoutTemplate,
  BarChart3,
  Settings,
  PhoneCall,
  Search,
  ChevronDown,
  ChevronRight,
  LogOut,
  ExternalLink,
  ChevronLeft,
} from 'lucide-react';
import { Logo } from '../common/Logo';

export interface AdminSidebarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  expandedGroups: Record<string, boolean>;
  onToggleGroup: (groupId: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  counts: {
    pendingProperties?: number;
    inquiries?: number;
    users?: number;
    brokers?: number;
  };
  currentUserRole: string;
  currentUserName: string;
  currentUserEmail?: string;
  hasPermission: (permKey: string) => boolean;
  onLogout: () => void;
  propertySubTab?: string;
  onSelectPropertySubTab?: (subId: string) => void;
  franchiseSubTab?: string;
  onSelectFranchiseSubTab?: (subId: string) => void;
  businessSubTab?: string;
  onSelectBusinessSubTab?: (subId: string) => void;
  brokerSubTab?: string;
  onSelectBrokerSubTab?: (subId: string) => void;
}

export interface AdminSubItem {
  id: string;
  label: string;
}

export interface AdminNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  permKey: string;
  hasSubMenu?: boolean;
  badgeCount?: number;
  badgeVariant?: string;
  subItems?: AdminSubItem[];
  currentSub?: string;
  onSelectSub?: (subId: string) => void;
}

export interface AdminNavSection {
  title: string;
  items: AdminNavItem[];
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  expandedGroups,
  onToggleGroup,
  isCollapsed,
  onToggleCollapse,
  counts,
  currentUserRole,
  currentUserName,
  currentUserEmail,
  hasPermission,
  onLogout,
  propertySubTab,
  onSelectPropertySubTab,
  franchiseSubTab,
  onSelectFranchiseSubTab,
  businessSubTab,
  onSelectBusinessSubTab,
  brokerSubTab,
  onSelectBrokerSubTab,
}) => {
  const sections: AdminNavSection[] = [
    {
      title: 'CORE PLATFORM',
      items: [
        {
          id: 'overview',
          label: 'Dashboard',
          icon: <LayoutDashboard size={17} />,
          permKey: 'overview',
        },
      ],
    },
    {
      title: 'MARKETPLACE INVENTORY',
      items: [
        {
          id: 'properties',
          label: 'Property Management',
          icon: <Building2 size={17} />,
          permKey: 'properties',
          hasSubMenu: true,
          badgeCount: counts.pendingProperties,
          badgeVariant: 'warning',
          subItems: [
            { id: 'all', label: 'All Properties' },
            { id: 'add', label: 'Add Property' },
            { id: 'pending', label: 'Pending Approvals' },
            { id: 'bulk', label: 'Bulk Operations' },
          ],
          currentSub: propertySubTab,
          onSelectSub: onSelectPropertySubTab,
        },
        {
          id: 'franchises',
          label: 'Franchise Management',
          icon: <Store size={17} />,
          permKey: 'franchises',
          hasSubMenu: true,
          subItems: [
            { id: 'all', label: 'All Franchises' },
            { id: 'add', label: 'Add Franchise' },
            { id: 'resales', label: 'Resale Requests' },
            { id: 'enquiries', label: 'Franchise Leads' },
          ],
          currentSub: franchiseSubTab,
          onSelectSub: onSelectFranchiseSubTab,
        },
        {
          id: 'businesses',
          label: 'Business Management',
          icon: <Briefcase size={17} />,
          permKey: 'businesses',
          hasSubMenu: true,
          subItems: [
            { id: 'all', label: 'All Businesses' },
            { id: 'add', label: 'Add Business' },
            { id: 'sell_requests', label: 'Sell Requests' },
            { id: 'enquiries', label: 'Business Inquiries' },
          ],
          currentSub: businessSubTab,
          onSelectSub: onSelectBusinessSubTab,
        },
        {
          id: 'demand_regions',
          label: 'Demand Regions',
          icon: <MapPin size={17} />,
          permKey: 'demand_regions',
        },
        {
          id: 'master_filters',
          label: 'Filters & Categories',
          icon: <SlidersHorizontal size={17} />,
          permKey: 'master_filters',
        },
      ],
    },
    {
      title: 'USER & PARTNER OPERATIONS',
      items: [
        {
          id: 'brokers',
          label: 'Broker Management',
          icon: <UserCheck size={17} />,
          permKey: 'brokers',
          hasSubMenu: true,
          badgeCount: counts.brokers,
          subItems: [
            { id: 'directory', label: 'Broker Directory' },
            { id: 'add', label: 'Add / Edit Broker' },
            { id: 'kyc', label: 'KYC Verification' },
            { id: 'premium', label: 'Premium Privileges' },
            { id: 'analytics', label: 'Revenue Analytics' },
          ],
          currentSub: brokerSubTab,
          onSelectSub: onSelectBrokerSubTab,
        },
        {
          id: 'users',
          label: 'User Management',
          icon: <Users size={17} />,
          permKey: 'users',
          badgeCount: counts.users,
        },
        {
          id: 'team',
          label: 'Team Members',
          icon: <ShieldCheck size={17} />,
          permKey: 'team',
        },
        {
          id: 'roles',
          label: 'Roles & Permissions',
          icon: <KeyRound size={17} />,
          permKey: 'roles',
        },
      ],
    },
    {
      title: 'COMMUNICATIONS & LEADS',
      items: [
        {
          id: 'inquiries',
          label: 'Contact & Lead Inbox',
          icon: <Mail size={17} />,
          permKey: 'inquiries',
          badgeCount: counts.inquiries,
          badgeVariant: 'info',
        },
        {
          id: 'ai_assistant',
          label: 'AI Assistant Studio',
          icon: <Bot size={17} />,
          permKey: 'ai_assistant',
        },
      ],
    },
    {
      title: 'SETTINGS & CUSTOMIZATION',
      items: [
        {
          id: 'hero_cms',
          label: 'Main Page Settings',
          icon: <LayoutTemplate size={17} />,
          permKey: 'site_settings',
        },
        {
          id: 'main_stats',
          label: 'Main Page Stats',
          icon: <BarChart3 size={17} />,
          permKey: 'site_settings',
        },
        {
          id: 'customization',
          label: 'Website Settings',
          icon: <Settings size={17} />,
          permKey: 'site_settings',
        },
        {
          id: 'contact_settings',
          label: 'Contact Us Details CMS',
          icon: <PhoneCall size={17} />,
          permKey: 'contact_settings',
        },
        {
          id: 'seo',
          label: 'SEO & Analytics',
          icon: <Search size={17} />,
          permKey: 'seo',
        },
      ],
    },
  ];

  return (
    <aside
      style={{
        width: isCollapsed ? '72px' : '260px',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        transition: 'width 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        flexShrink: 0,
        userSelect: 'none',
        fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
      }}
    >
      {/* Brand & Toggle Header */}
      <div
        style={{
          height: '64px',
          padding: isCollapsed ? '0 16px' : '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          borderBottom: '1px solid #F1F5F9',
        }}
      >
        {!isCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Logo size="sm" />
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#059669',
                backgroundColor: '#ECFDF5',
                padding: '2px 8px',
                borderRadius: '6px',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Console
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          style={{
            background: 'none',
            border: 'none',
            color: '#64748B',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F1F5F9')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: isCollapsed ? '12px 8px' : '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {sections.map((section, sIdx) => {
          const visibleItems = section.items.filter((item) => hasPermission(item.permKey));
          if (visibleItems.length === 0) return null;

          return (
            <div key={sIdx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {!isCollapsed && (
                <div
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    color: '#94A3B8',
                    letterSpacing: '0.06em',
                    padding: '0 10px 4px 10px',
                    textTransform: 'uppercase',
                  }}
                >
                  {section.title}
                </div>
              )}

              {visibleItems.map((item) => {
                const isActive = activeTab === item.id;
                const isGroupExpanded = !!expandedGroups[item.id];

                return (
                  <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTab(item.id);
                        if (item.hasSubMenu) {
                          onToggleGroup(item.id);
                        }
                      }}
                      title={isCollapsed ? item.label : undefined}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isCollapsed ? 'center' : 'space-between',
                        padding: isCollapsed ? '10px 0' : '9px 12px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: isActive ? '#ECFDF5' : 'transparent',
                        color: isActive ? '#059669' : '#475569',
                        fontWeight: isActive ? 700 : 500,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        width: '100%',
                        textAlign: 'left',
                        position: 'relative',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = '#F8FAFC';
                          e.currentTarget.style.color = '#0F172A';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#475569';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <span
                          style={{
                            color: isActive ? '#059669' : '#64748B',
                            display: 'inline-flex',
                            alignItems: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {item.icon}
                        </span>
                        {!isCollapsed && (
                          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {item.label}
                          </span>
                        )}
                      </div>

                      {!isCollapsed && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {item.badgeCount !== undefined && item.badgeCount > 0 && (
                            <span
                              style={{
                                padding: '1px 6px',
                                borderRadius: '10px',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                backgroundColor: isActive ? '#059669' : '#E2E8F0',
                                color: isActive ? '#FFFFFF' : '#475569',
                              }}
                            >
                              {item.badgeCount}
                            </span>
                          )}
                          {item.hasSubMenu && (
                            <span style={{ color: '#94A3B8' }}>
                              {isGroupExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </span>
                          )}
                        </div>
                      )}
                    </button>

                    {/* Submenu items */}
                    {!isCollapsed && item.hasSubMenu && isGroupExpanded && item.subItems && (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                          paddingLeft: '32px',
                          paddingTop: '2px',
                          paddingBottom: '2px',
                        }}
                      >
                        {item.subItems.map((sub) => {
                          const isSubActive = isActive && item.currentSub === sub.id;
                          return (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={() => {
                                onSelectTab(item.id);
                                if (item.onSelectSub) item.onSelectSub(sub.id);
                              }}
                              style={{
                                padding: '6px 10px',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: isSubActive ? '#F0FDF4' : 'transparent',
                                color: isSubActive ? '#059669' : '#64748B',
                                fontWeight: isSubActive ? 700 : 500,
                                fontSize: '0.8rem',
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                              onMouseEnter={(e) => {
                                if (!isSubActive) {
                                  e.currentTarget.style.backgroundColor = '#F8FAFC';
                                  e.currentTarget.style.color = '#0F172A';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isSubActive) {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                  e.currentTarget.style.color = '#64748B';
                                }
                              }}
                            >
                              {sub.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* User Profile & Quick Logout Footer */}
      <div
        style={{
          borderTop: '1px solid #F1F5F9',
          padding: isCollapsed ? '12px 8px' : '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          gap: '10px',
          backgroundColor: '#FAFAFA',
        }}
      >
        {!isCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                backgroundColor: '#DCFCE7',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.85rem',
                flexShrink: 0,
              }}
            >
              {currentUserName.charAt(0).toUpperCase() || 'A'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.825rem',
                  fontWeight: 700,
                  color: '#0F172A',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
              >
                {currentUserName}
              </div>
              <div
                style={{
                  fontSize: '0.725rem',
                  color: '#64748B',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
              >
                {currentUserRole}
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onLogout}
          title="Log out of console"
          style={{
            background: 'none',
            border: 'none',
            color: '#DC2626',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FEE2E2')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};
