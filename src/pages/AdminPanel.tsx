import React, { useState, useEffect } from 'react';
import { 
  FaBuilding, 
  FaStore, 
  FaEnvelope, 
  FaTrash, 
  FaEdit, 
  FaSignOutAlt, 
  FaPalette, 
  FaCheckCircle,
  FaUserTie,
  FaChartPie,
  FaSearch,
  FaBell,
  FaUserShield,
  FaPlus,
  FaDesktop,
  FaVideo,
  FaUpload,
  FaChevronDown,
  FaChevronRight,
  FaHome,
  FaBriefcase,
  FaUsers,
  FaCog,
  FaChartLine,
  FaListAlt,
  FaQuestionCircle,
  FaMapMarkerAlt,
  FaEllipsisV,
  FaEye,
  FaEyeSlash,
  FaArrowUp,
  FaCalendarAlt,
  FaFileAlt,
  FaStar,
  FaChartBar,
  FaFolder,
  FaClock,
  FaImage,
  FaTrophy,
  FaCompass,
  FaRobot
} from 'react-icons/fa';
import { LocationManagementModule } from '../components/admin/LocationManagementModule';
import { 
  propertiesDb, 
  franchiseDb, 
  businessDb,
  dealersDb, 
  enquiriesDb, 
  siteSettingsDb, 
  teamMembersDb,
  deleteEnquiry, 
  updateEnquiryStatus, 
  updateSiteSettings, 
  addTeamMember,
  deleteTeamMember,
  updateProperty,
  updateFranchise,
  updateDealer,
  clearAllStaticData,
  employeeUsersDb,
  addEmployeeUser,
  updateEmployeeUser,
  deleteEmployeeUser,
  rolesDb,
  updateRole,
  addRole,
  deleteRole,
  demandRegionsDb,
  addDemandRegion,
  updateDemandRegion,
  deleteDemandRegion,
  recalculateAllDemandRegions,
  showcaseVideosDb,
  showcaseSettingsDb,
  addShowcaseVideo,
  updateShowcaseVideo,
  deleteShowcaseVideo,
  updateShowcaseSettings,
  API_BASE_URL
} from '../db/marketplaceDb';
import { BrokerManagementSystem } from '../components/BrokerManagementSystem';
import { Logo } from '../components/common/Logo';
import { PropertyManagementSystem } from '../components/PropertyManagementSystem';
import { FranchiseManagementSystem } from '../components/FranchiseManagementSystem';
import { AiAssistantAdminPanel } from '../components/AiAssistantAdminPanel';
import type {
  PropertyListing,
  FranchiseListing,
  Dealer,
  SiteSettings,
  TeamMember,
  ShowcaseVideo,
  ShowcaseSettings,
  EmployeeUser,
  Role
} from '../db/marketplaceDb';

interface AdminPanelProps {
  onDataChange?: () => void;
  onRefresh?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onDataChange, onRefresh }) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('nexopp_admin_auth') === 'true';
  });
  const [currentUserRole, setCurrentUserRole] = useState<string>(() => {
    return sessionStorage.getItem('nexopp_admin_role') || 'Super Admin';
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewEmpPassword, setShowNewEmpPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newCityInput, setNewCityInput] = useState('');
  const [newTagInput, setNewTagInput] = useState('');

  // Main Category Tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'main_stats' | 'customization' | 'hero_cms' | 'properties' | 'franchises' | 'businesses' | 'demand_regions' | 'brokers' | 'users' | 'users_data' | 'team' | 'roles' | 'inquiries' | 'media_manager' | 'ai_assistant'>('overview');
  const [expandedMenu, setExpandedMenu] = useState<string | null>('brokers');
  const [analyticsDateRange, setAnalyticsDateRange] = useState<'This Week' | 'This Month' | 'Last 30 Days' | 'This Year'>('This Week');
  const [activeAnalyticsSlide, setActiveAnalyticsSlide] = useState<'property' | 'franchise' | 'business'>('property');
  const [propertySubTab, setPropertySubTab] = useState<string>('listings');
  const [franchiseSubTab, setFranchiseSubTab] = useState<string>('listings');
  const [businessSubTab, setBusinessSubTab] = useState<string>('listings');
  const [brokerSubTab, setBrokerSubTab] = useState<string>('directory');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const SUB_MENU_ITEMS: Record<string, { id: string; label: string; icon: any }[]> = {
    properties: [
      { id: 'listings', label: 'All Properties', icon: <FaListAlt /> },
      { id: 'editProperty', label: 'Edit Property', icon: <FaEdit /> },
      { id: 'featured', label: 'Featured & Premium', icon: <FaStar /> },
      { id: 'analytics', label: 'Analytics & Stats', icon: <FaChartBar /> },
      { id: 'categories', label: 'Categories & Subtypes', icon: <FaFolder /> },
      { id: 'locations', label: 'Location Intelligence', icon: <FaMapMarkerAlt /> },
      { id: 'soldOut', label: 'Sold Out Properties', icon: <FaCheckCircle /> },
      { id: 'reports', label: 'Reports & Export', icon: <FaFileAlt /> },
    ],
    franchises: [
      { id: 'listings', label: 'All Franchises', icon: <FaListAlt /> },
      { id: 'editProperty', label: 'Edit Franchise', icon: <FaEdit /> },
      { id: 'featured', label: 'Featured & Premium', icon: <FaStar /> },
      { id: 'analytics', label: 'Analytics & Stats', icon: <FaChartBar /> },
      { id: 'categories', label: 'Categories & Sectors', icon: <FaFolder /> },
      { id: 'locations', label: 'Location Intelligence', icon: <FaMapMarkerAlt /> },
      { id: 'soldOut', label: 'Sold Out Franchises', icon: <FaCheckCircle /> },
      { id: 'reports', label: 'Reports & Export', icon: <FaFileAlt /> },
    ],
    businesses: [
      { id: 'listings', label: 'All Businesses', icon: <FaListAlt /> },
      { id: 'editProperty', label: 'Edit Business', icon: <FaEdit /> },
      { id: 'featured', label: 'Featured & Premium', icon: <FaStar /> },
      { id: 'analytics', label: 'Analytics & Stats', icon: <FaChartBar /> },
      { id: 'categories', label: 'Categories & Industries', icon: <FaFolder /> },
      { id: 'locations', label: 'Location Intelligence', icon: <FaMapMarkerAlt /> },
      { id: 'soldOut', label: 'Sold Out Businesses', icon: <FaCheckCircle /> },
      { id: 'reports', label: 'Reports & Export', icon: <FaFileAlt /> },
    ],
    brokers: [
      { id: 'directory', label: 'Broker Directory', icon: <FaListAlt /> },
      { id: 'leaderboard', label: 'Top Leaderboard', icon: <FaTrophy /> },
      { id: 'premium', label: 'Premium Brokers', icon: <FaStar /> },
      { id: 'category_rank', label: 'Category Rankings', icon: <FaFolder /> },
      { id: 'location_rank', label: 'Location Rankings', icon: <FaMapMarkerAlt /> },
      { id: 'analytics', label: 'Broker Analytics', icon: <FaChartBar /> },
    ],
  };
  
  // New Team Member Form State
  const [newTeamMember, setNewTeamMember] = useState<Omit<TeamMember, 'id'>>({ name: '', designation: '', photo: '', phone: '', linkedin: '', email: '' });
  
  // New Employee User Form State
  const [newEmployee, setNewEmployee] = useState<Omit<EmployeeUser, 'id' | 'createdAt'>>({
    fullName: '',
    email: '',
    password: '',
    role: 'Property Editor',
    status: 'Active'
  });

  // Custom Role Form State
  const [newRoleName, setNewRoleName] = useState('');
  const [newRolePermissions, setNewRolePermissions] = useState<string[]>(['properties']);

  // User Specific Permissions State
  const [selectedUserForPerms, setSelectedUserForPerms] = useState<string>('');
  const [userCustomPerms, setUserCustomPerms] = useState<string[]>([]);
  const [isSavingUserPerms, setIsSavingUserPerms] = useState<boolean>(false);
  const [savedUserSuccess, setSavedUserSuccess] = useState<string | null>(null);

  
  // State for reactive refresh
  const [tick, setTick] = useState(0);
  const triggerRefresh = () => {
    setTick(t => t + 1);
    onDataChange?.();
    onRefresh?.();
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  triggerRefresh;

  // State for interactive Stat Graph Modal
  const [statModalTopic, setStatModalTopic] = useState<'properties' | 'franchises' | 'businesses' | 'enquiries' | 'users' | 'sold' | null>(null);
  const [registeredCustomers, setRegisteredCustomers] = useState<any[]>([]);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerDistrictFilter, setCustomerDistrictFilter] = useState('All');

  const fetchRegisteredCustomers = () => {
    fetch(`${API_BASE_URL}/api/customers`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRegisteredCustomers(data);
        }
      })
      .catch(err => console.error("Error fetching customers:", err));
  };

  useEffect(() => {
    fetchRegisteredCustomers();
    const handler = () => {
      setTick(t => t + 1);
      fetchRegisteredCustomers();
    };
    window.addEventListener('nexopp_data_changed', handler);
    return () => window.removeEventListener('nexopp_data_changed', handler);
  }, []);

  useEffect(() => {
    const lenis = (window as any).lenis;
    if (lenis) {
      lenis.stop();
    }
    return () => {
      const lenis = (window as any).lenis;
      if (lenis) {
        lenis.start();
      }
    };
  }, []);


  const [notification, setNotification] = useState<{ message: string; type: string } | null>(null);
  const showNotification = (message: string, type: string = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Single Master Super Admin Credentials
    const cleanEmail = email.trim().toLowerCase();
    const isMasterEmail = cleanEmail === 'admin@thenexopp.com' || cleanEmail === 'admin@thenexoop.com' || cleanEmail === 'admin';
    const isMasterPassword = password === 'thenexopp123' || password === 'thenexoop123';

    if (isMasterEmail && isMasterPassword) {
      sessionStorage.setItem('nexopp_admin_auth', 'true');
      sessionStorage.setItem('nexopp_admin_role', 'Super Admin');
      sessionStorage.setItem('nexopp_admin_user_name', 'Super Admin');
      sessionStorage.setItem('nexopp_admin_user_email', cleanEmail);
      setIsAuthenticated(true);
      setCurrentUserRole('Super Admin');
      setError(null);
      return;
    }

    // Check Employee Users DB
    const employee = employeeUsersDb.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (employee) {
      if (employee.status !== 'Active') {
        setError('Your account is currently suspended. Please contact the administrator.');
        return;
      }
      sessionStorage.setItem('nexopp_admin_auth', 'true');
      sessionStorage.setItem('nexopp_admin_role', employee.role);
      sessionStorage.setItem('nexopp_admin_user_name', employee.fullName);
      sessionStorage.setItem('nexopp_admin_user_email', employee.email);
      setIsAuthenticated(true);
      setCurrentUserRole(employee.role);
      setError(null);

      // Evaluate permissions to set active tab
      const empPerms = employee.customPermissions !== undefined
        ? employee.customPermissions
        : (rolesDb.find(r => r.name === employee.role)?.permissions || []);

      const can = (k: string) => empPerms.includes('all') || empPerms.includes(k) || empPerms.some(p => p.startsWith(k + ':'));

      if (can('properties')) {
        setActiveTab('properties');
        setExpandedMenu('properties');
      } else if (can('franchises')) {
        setActiveTab('franchises');
        setExpandedMenu('franchises');
      } else if (can('businesses')) {
        setActiveTab('businesses');
        setExpandedMenu('businesses');
      } else if (can('demand_regions')) {
        setActiveTab('demand_regions');
        setExpandedMenu(null);
      } else if (can('brokers')) {
        setActiveTab('brokers');
        setExpandedMenu('brokers');
      } else {
        setActiveTab('overview');
        setExpandedMenu(null);
      }
      return;
    }

    setError('Invalid Admin credentials. Please try again.');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('nexopp_admin_auth');
    sessionStorage.removeItem('nexopp_admin_role');
    sessionStorage.removeItem('nexopp_admin_user_name');
    sessionStorage.removeItem('nexopp_admin_user_email');
    setIsAuthenticated(false);
    setActiveTab('overview');
  };

  const handleAddTeamMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamMember.name || !newTeamMember.designation) {
      showNotification('Please enter Name and Designation', 'warning');
      return;
    }
    const id = 'TM_' + Date.now();
    const newMember = {
      id,
      name: newTeamMember.name,
      designation: newTeamMember.designation,
      photo: newTeamMember.photo || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80',
      phone: newTeamMember.phone,
      linkedin: newTeamMember.linkedin,
      email: newTeamMember.email
    };
    addTeamMember(newMember);
    showNotification(`Added ${newTeamMember.name} to Executive Leadership!`);
    setNewTeamMember({ name: '', designation: '', photo: '', phone: '', linkedin: '', email: '' });
  };

  const handleDeleteTeamMember = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name} from the leadership team?`)) {
      deleteTeamMember(id);
      showNotification(`Removed ${name} from Executive Leadership`, 'warning');
    }
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployee.fullName || !newEmployee.email || !newEmployee.password || !newEmployee.role.trim()) {
      showNotification('Please fill all required employee fields including Assigned Role', 'warning');
      return;
    }
    const id = 'EMP_' + Date.now();
    const newEmp: EmployeeUser = {
      ...newEmployee,
      role: newEmployee.role.trim(),
      id,
      createdAt: new Date().toISOString()
    };
    addEmployeeUser(newEmp);
    showNotification(`Created credentials for ${newEmployee.fullName} as ${newEmp.role}!`);
    setNewEmployee({ fullName: '', email: '', password: '', role: '', status: 'Active' });
  };

  const handleDeleteEmployee = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete credentials for ${name}?`)) {
      deleteEmployeeUser(id);
      showNotification(`Deleted employee: ${name}`, 'warning');
    }
  };

  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) {
      showNotification('Please enter a role name', 'warning');
      return;
    }
    const id = 'role_' + Date.now();
    const role: Role = {
      id,
      name: newRoleName.trim(),
      permissions: newRolePermissions.length === 0 ? ['properties'] : newRolePermissions
    };
    addRole(role);
    showNotification(`Created role: ${newRoleName.trim()}!`);
    setNewRoleName('');
    setNewRolePermissions(['properties']);
  };

  const handleToggleRolePermission = (roleId: string, currentPerms: string[], perm: string) => {
    let updated: string[];
    if (currentPerms.includes('all')) {
      const allModules = ['properties', 'franchises', 'businesses', 'demand_regions', 'brokers', 'users', 'media_manager', 'site_settings'];
      updated = allModules.filter(p => p !== perm);
    } else if (currentPerms.includes(perm)) {
      updated = currentPerms.filter(p => p !== perm);
    } else {
      updated = [...currentPerms, perm];
    }
    updateRole(roleId, updated);
    showNotification('Updated role permissions!');
  };

  const handleDeleteRole = (roleId: string, roleName: string) => {
    if (roleName === 'Super Admin') {
      showNotification('Cannot delete Super Admin role', 'error');
      return;
    }
    if (window.confirm(`Are you sure you want to delete the role "${roleName}"?`)) {
      deleteRole(roleId);
      showNotification(`Deleted role: ${roleName}`, 'warning');
    }
  };

  const handleSelectUserForPerms = (userId: string) => {
    setSelectedUserForPerms(userId);
    const user = employeeUsersDb.find(u => u.id === userId);
    if (user) {
      setUserCustomPerms(user.customPermissions || []);
    } else {
      setUserCustomPerms([]);
    }
  };

  const handleSaveUserPermissions = () => {
    if (!selectedUserForPerms) {
      showNotification('Please select an employee user first', 'warning');
      return;
    }
    const user = employeeUsersDb.find(u => u.id === selectedUserForPerms);
    if (!user) return;

    setIsSavingUserPerms(true);
    setSavedUserSuccess(null);

    setTimeout(() => {
      updateEmployeeUser(selectedUserForPerms, { customPermissions: [...userCustomPerms] });
      triggerRefresh();
      setIsSavingUserPerms(false);
      setSavedUserSuccess(`Permissions successfully saved & live-synced for ${user.fullName}!`);
      showNotification(`Custom permissions saved for ${user.fullName}!`);

      setTimeout(() => {
        setSavedUserSuccess(null);
      }, 5000);
    }, 450);
  };


  // Helper for multiple photo file uploads (Base64 conversion)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64List: string[]) => void) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    Promise.all(files.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    })).then(results => {
      callback(results);
    });
  };

  // --- Category 1: Website Control & Customization State ---
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(siteSettingsDb);
  useEffect(() => {
    setSettingsForm(siteSettingsDb);
  }, [tick]);

  const currentMainStats = settingsForm.mainPageStats || {
    propertiesListed: '18,500+',
    franchisesCount: '950+',
    verifiedBrokers: '2,400+',
    citiesCovered: '32',
    totalPropertyValue: '₹850 Cr+',
    happyClients: '15K+',
    activeListingsWhy: '10,000+',
    happyCustomersWhy: '5,000+',
    citiesCoveredWhy: '50+',
    verifiedListingsWhy: '100%',
    customerSupportWhy: '24/7'
  };

  const handleAddCity = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newCityInput.trim()) return;
    const currentCities = settingsForm.availableCities || ['Hyderabad', 'Bengaluru', 'Mumbai', 'Delhi NCR', 'Chennai', 'Pune'];
    if (!currentCities.includes(newCityInput.trim())) {
      setSettingsForm({ ...settingsForm, availableCities: [...currentCities, newCityInput.trim()] });
    }
    setNewCityInput('');
  };

  const handleRemoveCity = (cityToRemove: string) => {
    const currentCities = settingsForm.availableCities || ['Hyderabad', 'Bengaluru', 'Mumbai', 'Delhi NCR', 'Chennai', 'Pune'];
    setSettingsForm({ ...settingsForm, availableCities: currentCities.filter(c => c !== cityToRemove) });
  };

  const handleAddPopularTag = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newTagInput.trim()) return;
    const currentTags = settingsForm.heroPopularTags || ['Apartment', 'Villa', 'Franchise', 'Commercial Property'];
    if (!currentTags.includes(newTagInput.trim())) {
      setSettingsForm({ ...settingsForm, heroPopularTags: [...currentTags, newTagInput.trim()] });
    }
    setNewTagInput('');
  };

  const handleRemovePopularTag = (tagToRemove: string) => {
    const currentTags = settingsForm.heroPopularTags || ['Apartment', 'Villa', 'Franchise', 'Commercial Property'];
    setSettingsForm({ ...settingsForm, heroPopularTags: currentTags.filter(t => t !== tagToRemove) });
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteSettings(settingsForm);
    showNotification("Website appearance, locations & analytics successfully updated across the entire site!");
  };

  const handleClearStaticData = () => {
    if (window.confirm("Are you sure you want to remove all static sample data? This will clear initial demo properties and franchises.")) {
      clearAllStaticData();
      showNotification("All sample data cleared. Your database is now clean.", "warning");
    }
  };


  // --- Editing State for Modal / Inline Editing ---
  const [editingProperty, setEditingProperty] = useState<PropertyListing | null>(null);
  const [editingFranchise, setEditingFranchise] = useState<FranchiseListing | null>(null);
  const [editingBroker, setEditingBroker] = useState<Dealer | null>(null);


  // ================= PASSWORD AUTH LOGIN SCREEN (WHITE & GREEN PROFESSIONAL) =================
  if (!isAuthenticated) {
    return (
      <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', 'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", padding: '20px' }}>
        <div style={{ backgroundColor: '#FFFFFF', padding: '48px 40px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0', width: '100%', maxWidth: '440px', textAlign: 'center' }}>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <Logo size="xl" />
          </div>

          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0F172A', margin: '0 0 6px 0' }}>
            Secure Admin Login
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.85rem', margin: '0 0 32px 0', fontWeight: 500 }}>
            Enter your employee credentials to access the marketplace control center.
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                placeholder="admin@thenexoop.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', color: '#0F172A', fontSize: '0.95rem', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '14px 44px 14px 16px', borderRadius: '12px', border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', color: '#0F172A', fontSize: '0.95rem', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                  fontSize: '1.1rem',
                  transition: 'color 0.2s'
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            
            {error && (
              <span style={{ color: '#EF4444', fontSize: '0.85rem', fontWeight: 600 }}>
                {error}
              </span>
            )}

            <button
              type="submit"
              style={{ width: '100%', padding: '15px', borderRadius: '12px', border: 'none', backgroundColor: '#0F172A', color: '#FFFFFF', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', marginTop: '8px', boxShadow: '0 4px 12px rgba(15,23,42,0.15)' }}
            >
              Access Portal
            </button>
          </form>
          
          <div style={{ marginTop: '32px', borderTop: '1px solid #F1F5F9', paddingTop: '20px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
            <button
              onClick={() => window.location.href = '/'}
              style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              ← Return to Main Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Granular Permission Checking Logic
  const loggedInEmail = sessionStorage.getItem('nexopp_admin_user_email') || '';
  const currentEmpUser = employeeUsersDb.find(u => u.email.toLowerCase() === loggedInEmail.toLowerCase());
  const userRoleData = rolesDb.find(r => r.name === currentUserRole);

  // If user has customPermissions explicitly defined (even if empty or custom), use it! Otherwise fallback to role permissions
  const activePermissions = (currentEmpUser && currentEmpUser.customPermissions !== undefined)
    ? currentEmpUser.customPermissions
    : (userRoleData ? userRoleData.permissions : []);

  const hasPermission = (permKey: string) => {
    if (currentUserRole === 'Super Admin' || activePermissions.includes('all')) return true;
    if (activePermissions.includes(permKey)) return true;

    // Check category prefix (e.g. 'properties' for 'properties:editProperty')
    const category = permKey.split(':')[0];
    if (activePermissions.includes(category)) return true;

    // If checking a category (e.g. 'properties' or 'site_settings'), check if any granted permission starts with category + ':' or matches
    if (!permKey.includes(':')) {
      return activePermissions.some(p => p === category || p.startsWith(`${category}:`) || (category === 'site_settings' && p.startsWith('site:')) || (category === 'media_manager' && p.includes('media')));
    }

    return false;
  };

  const getHeaderInfo = () => {
    switch (activeTab) {
      case 'properties': return { title: 'Property Management System', sub: 'Manage, Publish & Grow Your Property Listings' };
      case 'franchises': return { title: 'Franchise Management System', sub: 'Manage, Publish & Grow Your Franchise Opportunities' };
      case 'businesses': return { title: 'Business Management System', sub: 'Manage, Publish & Grow Your Business Listings & Opportunities' };
      case 'brokers': return { title: 'Broker Management System', sub: 'Manage, Verify & Empower Your Real Estate Broker Network' };
      case 'main_stats': return { title: 'Main Page Stats & Trust Metrics', sub: 'Edit Live Homepage Statistics, Trust Badges & Numbers' };
      case 'hero_cms': return { title: 'Homepage Builder Studio & Stats', sub: 'Customize Hero Sections, Stats, Backgrounds & Visible Elements' };
      case 'customization': return { title: 'Website Settings & Customization', sub: 'Configure Showcase Feeds, Brand Interactions & Stats' };
      case 'inquiries': return { title: 'Orders & Leads Enquiries', sub: 'Track Customer Leads, Consultation Requests & Inquiries' };
      case 'team': return { title: 'Team Members Manager', sub: 'Manage Internal Staff, Roles & Portal Access' };
      case 'media_manager': return { title: '🖥️ Main Page Settings', sub: 'Manage videos and settings displayed on the homepage carousel' };
      case 'users_data': return { title: '👥 Users Data (Registered Customers)', sub: 'Database of all registered and logged-in customers across AP & Telangana' };
      default: return { title: 'Welcome back, Super Admin', sub: "Here's what's happening with your marketplace today." };
    }
  };

  const getStatGraphData = () => {
    let items: { label: string; count: number; color: string }[] = [];
    let totalCount = 0;

    if (statModalTopic === 'properties') {
      totalCount = propertiesDb.length;
      items = [
        { label: 'Commercial Office / Retail', count: propertiesDb.filter(p => p.category === 'Commercial').length, color: '#16A34A' },
        { label: 'Apartments & Flats', count: propertiesDb.filter(p => p.category === 'Apartment').length, color: '#2563EB' },
        { label: 'Luxury Villas', count: propertiesDb.filter(p => p.category === 'Villa').length, color: '#9333EA' },
        { label: 'Independent Houses', count: propertiesDb.filter(p => p.category === 'House').length, color: '#EA580C' },
        { label: 'Plots & Open Land', count: propertiesDb.filter(p => p.category === 'Plot').length, color: '#0891B2' },
      ];
    } else if (statModalTopic === 'franchises') {
      totalCount = franchiseDb.length;
      items = [
        { label: 'Cafe & Food Outlets', count: franchiseDb.filter(f => (f.category || '').includes('Cafe') || (f.category || '').includes('Food')).length, color: '#2563EB' },
        { label: 'Retail & Fashion Stores', count: franchiseDb.filter(f => (f.category || '').includes('Retail') || (f.category || '').includes('Fashion')).length, color: '#16A34A' },
        { label: 'Healthcare & Fitness', count: franchiseDb.filter(f => (f.category || '').includes('Health')).length, color: '#0891B2' },
        { label: 'Education & Training', count: franchiseDb.filter(f => (f.category || '').includes('Edu')).length, color: '#9333EA' },
        { label: 'Other Franchises', count: franchiseDb.filter(f => !(f.category || '').includes('Cafe') && !(f.category || '').includes('Retail') && !(f.category || '').includes('Health') && !(f.category || '').includes('Edu')).length, color: '#64748B' },
      ];
    } else if (statModalTopic === 'businesses') {
      totalCount = businessDb.length;
      items = [
        { label: 'Food & Restaurants', count: businessDb.filter((b: any) => (b.category || b.industry || '').includes('Food')).length, color: '#9333EA' },
        { label: 'Healthcare & Medical', count: businessDb.filter((b: any) => (b.category || b.industry || '').includes('Health')).length, color: '#059669' },
        { label: 'Retail Businesses', count: businessDb.filter((b: any) => (b.category || b.industry || '').includes('Retail')).length, color: '#2563EB' },
        { label: 'Services & Tech Firms', count: businessDb.filter((b: any) => !(b.category || b.industry || '').includes('Food') && !(b.category || b.industry || '').includes('Health') && !(b.category || b.industry || '').includes('Retail')).length, color: '#D97706' },
      ];
    } else if (statModalTopic === 'enquiries') {
      totalCount = enquiriesDb.length;
      items = [
        { label: 'New Lead Inquiries', count: enquiriesDb.filter(e => e.status === 'New').length, color: '#DC2626' },
        { label: 'Contacted / In Progress', count: enquiriesDb.filter(e => e.status === 'Contacted').length, color: '#2563EB' },
        { label: 'Follow-Up Scheduled', count: enquiriesDb.filter(e => e.status === 'Follow-up').length, color: '#D97706' },
        { label: 'Closed / Converted Leads', count: enquiriesDb.filter(e => e.status === 'Closed').length, color: '#16A34A' },
      ];
    } else if (statModalTopic === 'users') {
      totalCount = registeredCustomers.length;
      items = [
        { label: 'Guntur District Users', count: registeredCustomers.filter(c => (c.district || '').toLowerCase().includes('guntur')).length, color: '#16A34A' },
        { label: 'Vijayawada (NTR) Users', count: registeredCustomers.filter(c => (c.district || '').toLowerCase().includes('vijayawada')).length, color: '#2563EB' },
        { label: 'Hyderabad Users', count: registeredCustomers.filter(c => (c.district || '').toLowerCase().includes('hyderabad')).length, color: '#9333EA' },
        { label: 'Visakhapatnam Users', count: registeredCustomers.filter(c => (c.district || '').toLowerCase().includes('visakhapatnam')).length, color: '#0891B2' },
        { label: 'Other Districts', count: registeredCustomers.filter(c => !(c.district || '').toLowerCase().includes('guntur') && !(c.district || '').toLowerCase().includes('vijayawada') && !(c.district || '').toLowerCase().includes('hyderabad') && !(c.district || '').toLowerCase().includes('visakhapatnam')).length, color: '#64748B' },
      ];
    } else if (statModalTopic === 'sold') {
      const soldProps = propertiesDb.filter((p: any) => p.sold || p.listingStatus === 'Sold' || p.status === 'Sold').length;
      const soldFranchises = franchiseDb.filter((f: any) => f.sold || f.listingStatus === 'Sold' || f.status === 'Sold').length;
      const soldBiz = businessDb.filter((b: any) => b.sold || b.listingStatus === 'Sold' || b.status === 'Sold').length;
      totalCount = soldProps + soldFranchises + soldBiz;
      items = [
        { label: 'Properties Sold', count: soldProps, color: '#16A34A' },
        { label: 'Active Properties', count: propertiesDb.length - soldProps, color: '#3B82F6' },
        { label: 'Franchises Sold', count: soldFranchises, color: '#9333EA' },
        { label: 'Businesses Sold', count: soldBiz, color: '#EA580C' },
      ];
    }

    return { items, totalCount };
  };

  const headerInfo = getHeaderInfo();

  // ================= MAIN ULTRA-MODERN SAAS DASHBOARD EXACTLY MATCHING USER SCREENSHOT =================
  return (
    <div data-lenis-prevent="true" style={{ backgroundColor: '#F8FAFC', height: '100vh', width: '100%', overflow: 'hidden', fontFamily: "'Inter', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", color: '#0F172A', display: 'flex' }}>
      
      {/* Sidebar Navigation matching user screenshot exactly */}
      <div style={{ width: '265px', height: '100%', backgroundColor: '#FFFFFF', borderRight: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', flexShrink: 0, zIndex: 10 }}>
        
        {/* Top Brand Box */}
        <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 800, color: '#16A34A' }}>
              ✦
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em', color: '#0F172A', lineHeight: 1.1 }}>
                THENEXOPP
              </div>
              <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748B', letterSpacing: '0.02em', marginTop: '2px' }}>
                Marketplace Control Center
              </div>
            </div>
          </div>
          <button style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '1.25rem', cursor: 'pointer', padding: '4px' }}>
            ≡
          </button>
        </div>

        {/* Sidebar Scrollable Nav */}
        <nav data-lenis-prevent="true" style={{ display: 'flex', flexDirection: 'column', padding: '10px 14px', gap: '4px', overflowY: 'auto', flexGrow: 1 }}>
          
          {/* Active Item: Dashboard */}
          <button
            onClick={() => {
              setActiveTab('overview');
              setExpandedMenu(null);
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 16px', border: 'none', borderRadius: '10px', cursor: 'pointer',
              fontSize: '0.9rem', fontWeight: activeTab === 'overview' ? 700 : 500,
              backgroundColor: activeTab === 'overview' ? '#16A34A' : 'transparent',
              color: activeTab === 'overview' ? '#FFFFFF' : '#475569',
              transition: 'all 0.15s', textAlign: 'left', width: '100%', boxSizing: 'border-box'
            }}
          >
            <span style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center' }}><FaHome /></span>
            <span style={{ flexGrow: 1 }}>Dashboard</span>
          </button>

          {/* Section: CONTENT MANAGEMENT */}
          {(hasPermission('properties') || hasPermission('franchises') || hasPermission('businesses') || hasPermission('demand_regions')) && (
            <div style={{ padding: '16px 10px 6px 10px', fontSize: '0.68rem', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              CONTENT MANAGEMENT
            </div>
          )}

          {hasPermission('properties') && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <button
                onClick={() => {
                  setActiveTab('properties');
                  setExpandedMenu(expandedMenu === 'properties' ? null : 'properties');
                }}
                style={{
                  padding: '12px 16px', backgroundColor: activeTab === 'properties' ? '#DCFCE7' : 'transparent', color: activeTab === 'properties' ? '#0D9488' : '#334155', border: 'none', textAlign: 'left', width: '100%', cursor: 'pointer', borderRadius: '8px', fontWeight: activeTab === 'properties' ? 700 : 500, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif"
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><FaBuilding /> Property Management</div>
                <FaChevronDown style={{ transform: expandedMenu === 'properties' ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', fontSize: '0.7rem' }} />
              </button>
              
              {expandedMenu === 'properties' && (
                <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '24px', borderLeft: '2px solid #E2E8F0', paddingLeft: '8px', marginTop: '4px' }}>
                  {SUB_MENU_ITEMS['properties']
                    .filter(sub => hasPermission(`properties:${sub.id}`))
                    .map(sub => (
                      <button
                        key={sub.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setPropertySubTab(sub.id);
                          setActiveTab('properties');
                          if (window.innerWidth < 1024) setIsSidebarOpen(false);
                        }}
                        style={{
                          padding: '8px 12px', backgroundColor: propertySubTab === sub.id && activeTab === 'properties' ? '#F1F5F9' : 'transparent', color: propertySubTab === sub.id && activeTab === 'properties' ? '#0D9488' : '#64748B', border: 'none', textAlign: 'left', width: '100%', cursor: 'pointer', borderRadius: '6px', fontSize: '0.82rem', fontWeight: propertySubTab === sub.id && activeTab === 'properties' ? 700 : 500, display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
                        }}
                      >
                        {sub.icon} {sub.label}
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}
            
          {hasPermission('franchises') && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <button
                onClick={() => {
                  setActiveTab('franchises');
                  setExpandedMenu(expandedMenu === 'franchises' ? null : 'franchises');
                }}
                style={{
                  padding: '12px 16px', backgroundColor: activeTab === 'franchises' ? '#DCFCE7' : 'transparent', color: activeTab === 'franchises' ? '#0D9488' : '#334155', border: 'none', textAlign: 'left', width: '100%', cursor: 'pointer', borderRadius: '8px', fontWeight: activeTab === 'franchises' ? 700 : 500, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif"
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><FaStore /> Franchise Management</div>
                <FaChevronDown style={{ transform: expandedMenu === 'franchises' ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', fontSize: '0.7rem' }} />
              </button>

              {expandedMenu === 'franchises' && (
                <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '24px', borderLeft: '2px solid #E2E8F0', paddingLeft: '8px', marginTop: '4px' }}>
                  {SUB_MENU_ITEMS['franchises']
                    .filter(sub => hasPermission(`franchises:${sub.id}`))
                    .map(sub => (
                      <button
                        key={sub.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setFranchiseSubTab(sub.id);
                          setActiveTab('franchises');
                          if (window.innerWidth < 1024) setIsSidebarOpen(false);
                        }}
                        style={{
                          padding: '8px 12px', backgroundColor: franchiseSubTab === sub.id && activeTab === 'franchises' ? '#F1F5F9' : 'transparent', color: franchiseSubTab === sub.id && activeTab === 'franchises' ? '#0D9488' : '#64748B', border: 'none', textAlign: 'left', width: '100%', cursor: 'pointer', borderRadius: '6px', fontSize: '0.82rem', fontWeight: franchiseSubTab === sub.id && activeTab === 'franchises' ? 700 : 500, display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
                        }}
                      >
                        {sub.icon} {sub.label}
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}

          {hasPermission('businesses') && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <button
                onClick={() => {
                  setActiveTab('businesses');
                  setExpandedMenu(expandedMenu === 'businesses' ? null : 'businesses');
                }}
                style={{
                  padding: '12px 16px', backgroundColor: activeTab === 'businesses' ? '#DCFCE7' : 'transparent', color: activeTab === 'businesses' ? '#0D9488' : '#334155', border: 'none', textAlign: 'left', width: '100%', cursor: 'pointer', borderRadius: '8px', fontWeight: activeTab === 'businesses' ? 700 : 500, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif"
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><FaBriefcase /> Business Management</div>
                <FaChevronDown style={{ transform: expandedMenu === 'businesses' ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', fontSize: '0.7rem' }} />
              </button>

              {expandedMenu === 'businesses' && (
                <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '24px', borderLeft: '2px solid #E2E8F0', paddingLeft: '8px', marginTop: '4px' }}>
                  {SUB_MENU_ITEMS['businesses']
                    .filter(sub => hasPermission(`businesses:${sub.id}`))
                    .map(sub => (
                      <button
                        key={sub.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setBusinessSubTab(sub.id);
                          setActiveTab('businesses');
                          if (window.innerWidth < 1024) setIsSidebarOpen(false);
                        }}
                        style={{
                          padding: '8px 12px', backgroundColor: businessSubTab === sub.id && activeTab === 'businesses' ? '#F1F5F9' : 'transparent', color: businessSubTab === sub.id && activeTab === 'businesses' ? '#0D9488' : '#64748B', border: 'none', textAlign: 'left', width: '100%', cursor: 'pointer', borderRadius: '6px', fontSize: '0.82rem', fontWeight: businessSubTab === sub.id && activeTab === 'businesses' ? 700 : 500, display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
                        }}
                      >
                        {sub.icon} {sub.label}
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}

          {hasPermission('demand_regions') && (
            <button
              onClick={() => {
                setActiveTab('demand_regions');
                setExpandedMenu(null);
              }}
              style={{
                padding: '12px 16px', backgroundColor: activeTab === 'demand_regions' ? '#DCFCE7' : 'transparent', color: activeTab === 'demand_regions' ? '#0D9488' : '#334155', border: 'none', textAlign: 'left', width: '100%', cursor: 'pointer', borderRadius: '8px', fontWeight: activeTab === 'demand_regions' ? 700 : 500, display: 'flex', alignItems: 'center', gap: '12px', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif"
              }}
            >
              <FaMapMarkerAlt /> Demand Regions
            </button>
          )}

          {/* Section: USER MANAGEMENT */}
          {(hasPermission('brokers') || hasPermission('users')) && (
            <div style={{ padding: '16px 10px 6px 10px', fontSize: '0.68rem', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              USER MANAGEMENT
            </div>
          )}

          {hasPermission('brokers') && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <button
                onClick={() => {
                  setActiveTab('brokers');
                  setExpandedMenu(expandedMenu === 'brokers' ? null : 'brokers');
                }}
                style={{
                  padding: '12px 16px', backgroundColor: activeTab === 'brokers' ? '#DCFCE7' : 'transparent', color: activeTab === 'brokers' ? '#0D9488' : '#334155', border: 'none', textAlign: 'left', width: '100%', cursor: 'pointer', borderRadius: '8px', fontWeight: activeTab === 'brokers' ? 700 : 500, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif"
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><FaUserTie /> Broker Management</div>
                <FaChevronDown style={{ transform: expandedMenu === 'brokers' ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', fontSize: '0.7rem' }} />
              </button>
              
              {expandedMenu === 'brokers' && (
                <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '24px', borderLeft: '2px solid #E2E8F0', paddingLeft: '8px', marginTop: '4px' }}>
                  {SUB_MENU_ITEMS['brokers']
                    .filter(sub => hasPermission(`brokers:${sub.id}`))
                    .map(sub => (
                      <button
                        key={sub.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setBrokerSubTab(sub.id);
                          setActiveTab('brokers');
                          if (window.innerWidth < 1024) setIsSidebarOpen(false);
                        }}
                        style={{
                          padding: '10px 12px', backgroundColor: brokerSubTab === sub.id && activeTab === 'brokers' ? '#F1F5F9' : 'transparent', color: brokerSubTab === sub.id && activeTab === 'brokers' ? '#0D9488' : '#64748B', border: 'none', textAlign: 'left', width: '100%', cursor: 'pointer', borderRadius: '6px', fontSize: '0.85rem', fontWeight: brokerSubTab === sub.id && activeTab === 'brokers' ? 700 : 500, display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
                        }}
                      >
                        {sub.icon} {sub.label}
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}
            
            {hasPermission('users') && (
              <>
                <button
                  onClick={() => {
                    setActiveTab('users');
                    setExpandedMenu(null);
                  }}
                  style={{
                    padding: '12px 16px', backgroundColor: activeTab === 'users' ? '#DCFCE7' : 'transparent', color: activeTab === 'users' ? '#0D9488' : '#334155', border: 'none', textAlign: 'left', width: '100%', cursor: 'pointer', borderRadius: '8px', fontWeight: activeTab === 'users' ? 700 : 500, display: 'flex', alignItems: 'center', gap: '12px', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif"
                  }}
                >
                  <FaUsers /> User Management
                </button>
                <button
                  onClick={() => {
                    setActiveTab('team');
                    setExpandedMenu(null);
                  }}
                  style={{
                    padding: '12px 16px', backgroundColor: activeTab === 'team' ? '#DCFCE7' : 'transparent', color: activeTab === 'team' ? '#0D9488' : '#334155', border: 'none', textAlign: 'left', width: '100%', cursor: 'pointer', borderRadius: '8px', fontWeight: activeTab === 'team' ? 700 : 500, display: 'flex', alignItems: 'center', gap: '12px', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif"
                  }}
                >
                  <FaUserShield /> Team Members
                </button>
                <button
                  onClick={() => {
                    setActiveTab('roles');
                    setExpandedMenu(null);
                  }}
                  style={{
                    padding: '12px 16px', backgroundColor: activeTab === 'roles' ? '#DCFCE7' : 'transparent', color: activeTab === 'roles' ? '#0D9488' : '#334155', border: 'none', textAlign: 'left', width: '100%', cursor: 'pointer', borderRadius: '8px', fontWeight: activeTab === 'roles' ? 700 : 500, display: 'flex', alignItems: 'center', gap: '12px', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif"
                  }}
                >
                  <FaCog /> Roles & Permissions
                </button>
                <button
                  onClick={() => {
                    setActiveTab('locations');
                    setExpandedMenu(null);
                  }}
                  style={{
                    padding: '12px 16px', backgroundColor: activeTab === 'locations' ? '#DCFCE7' : 'transparent', color: activeTab === 'locations' ? '#0D9488' : '#334155', border: 'none', textAlign: 'left', width: '100%', cursor: 'pointer', borderRadius: '8px', fontWeight: activeTab === 'locations' ? 700 : 500, display: 'flex', alignItems: 'center', gap: '12px', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif"
                  }}
                >
                  <FaMapMarkerAlt /> Location Management
                </button>
              </>
            )}

          {/* Section: SITE MANAGEMENT */}
          {[
            { id: 'ai_assistant', label: '🤖 AI Assistant', icon: <FaRobot />, perm: 'ai_assistant' },
            { id: 'media_manager', label: '🖥️ Main page settings', icon: <FaVideo />, perm: 'media_manager' },
            { id: 'main_stats', label: 'Main Page Stats', icon: <FaChartLine />, perm: 'site:main_stats' },
            { id: 'hero_cms', label: 'CMS Builder', icon: <FaDesktop />, perm: 'site:hero_cms' },
            { id: 'customization', label: 'Website Settings', icon: <FaPalette />, perm: 'site:customization' },
            { id: 'seo', label: 'SEO & Analytics', icon: <FaChartLine />, perm: 'site:seo' },
            { id: 'newsletter', label: 'Newsletter', icon: <FaEnvelope />, perm: 'site:newsletter' },
          ].filter(item => hasPermission('site_settings') || hasPermission(item.perm) || hasPermission(item.id)).length > 0 && (
            <>
              <div style={{ padding: '16px 10px 6px 10px', fontSize: '0.68rem', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                SITE MANAGEMENT
              </div>
              {[
                { id: 'ai_assistant', label: '🤖 AI Assistant', icon: <FaRobot />, perm: 'ai_assistant' },
                { id: 'media_manager', label: '🖥️ Main page settings', icon: <FaVideo />, perm: 'media_manager' },
                { id: 'main_stats', label: 'Main Page Stats', icon: <FaChartLine />, perm: 'site:main_stats' },
                { id: 'hero_cms', label: 'CMS Builder', icon: <FaDesktop />, perm: 'site:hero_cms' },
                { id: 'customization', label: 'Website Settings', icon: <FaPalette />, perm: 'site:customization' },
                { id: 'seo', label: 'SEO & Analytics', icon: <FaChartLine />, perm: 'site:seo' },
                { id: 'newsletter', label: 'Newsletter', icon: <FaEnvelope />, perm: 'site:newsletter' },
              ]
                .filter(item => hasPermission('site_settings') || hasPermission(item.perm) || hasPermission(item.id))
                .map((item) => {
                  const isActive = activeTab === item.id || (item.id === 'seo' && activeTab === 'customization') || (item.id === 'newsletter' && activeTab === 'inquiries');
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (item.id === 'seo') setActiveTab('customization');
                        else if (item.id === 'newsletter') setActiveTab('inquiries');
                        else setActiveTab(item.id as any);
                        setExpandedMenu(null);
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', border: 'none', borderRadius: '10px', cursor: 'pointer',
                        fontSize: '0.88rem', fontWeight: isActive ? 700 : 500,
                        backgroundColor: isActive ? '#DCFCE7' : 'transparent',
                        color: isActive ? '#16A34A' : '#475569',
                        transition: 'all 0.15s', textAlign: 'left', width: '100%', boxSizing: 'border-box'
                      }}
                    >
                      <span style={{ fontSize: '1rem', color: isActive ? '#16A34A' : '#94A3B8', display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                      <span style={{ flexGrow: 1 }}>{item.label}</span>
                    </button>
                  );
                })}
            </>
          )}

          {/* Section: SYSTEM */}
          <div style={{ padding: '16px 10px 6px 10px', fontSize: '0.68rem', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            SYSTEM
          </div>

          {[
            { id: 'sys_settings', label: 'System Settings', icon: <FaCog /> },
            { id: 'logs', label: 'Activity Logs', icon: <FaFileAlt /> },
          ].map((item) => {
            const isActive = (item.id === 'sys_settings' && activeTab === 'customization') || (item.id === 'logs' && activeTab === 'overview');
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'sys_settings') setActiveTab('customization');
                  else setActiveTab('overview');
                  setExpandedMenu(null);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', border: 'none', borderRadius: '10px', cursor: 'pointer',
                  fontSize: '0.88rem', fontWeight: isActive ? 700 : 500,
                  backgroundColor: isActive ? '#DCFCE7' : 'transparent',
                  color: isActive ? '#16A34A' : '#475569',
                  transition: 'all 0.15s', textAlign: 'left', width: '100%', boxSizing: 'border-box'
                }}
              >
                <span style={{ fontSize: '1rem', color: isActive ? '#16A34A' : '#94A3B8', display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                <span style={{ flexGrow: 1 }}>{item.label}</span>
              </button>
            );
          })}

          {/* VERY BOTTOM OPTION: Users Data (Registered Customers) */}
          <div style={{ padding: '16px 10px 6px 10px', fontSize: '0.68rem', fontWeight: 700, color: '#16A34A', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            CUSTOMER DATA
          </div>
          <button
            onClick={() => {
              setActiveTab('users_data' as any);
              setExpandedMenu(null);
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: 'none', borderRadius: '12px', cursor: 'pointer',
              fontSize: '0.9rem', fontWeight: (activeTab as string) === 'users_data' ? 800 : 600,
              backgroundColor: (activeTab as string) === 'users_data' ? '#16A34A' : '#ECFDF5',
              color: (activeTab as string) === 'users_data' ? '#FFFFFF' : '#047857',
              boxShadow: (activeTab as string) === 'users_data' ? '0 4px 14px rgba(22, 163, 74, 0.3)' : 'none',
              transition: 'all 0.15s', textAlign: 'left', width: '100%', boxSizing: 'border-box'
            }}
          >
            <span style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center' }}><FaUsers /></span>
            <span style={{ flexGrow: 1 }}>Users Data</span>
            <span style={{ backgroundColor: (activeTab as string) === 'users_data' ? '#FFFFFF' : '#10B981', color: (activeTab as string) === 'users_data' ? '#16A34A' : '#FFFFFF', padding: '2px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 800 }}>
              {registeredCustomers.length}
            </span>
          </button>
        </nav>
      </div>

      {/* ================= RIGHT MAIN PANEL ================= */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        
        {/* Top Navbar */}
          <div style={{ height: '72px', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '0 36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              {getHeaderInfo().title}
            </h1>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: '#64748B', fontWeight: 500 }}>
              {getHeaderInfo().sub}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ position: 'relative', width: '260px' }}>
              <FaSearch style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '0.85rem' }} />
              <input
                type="text"
                placeholder="Search anything..."
                style={{ width: '100%', padding: '9px 40px 9px 38px', border: '1px solid #E2E8F0', borderRadius: '8px', backgroundColor: '#F8FAFC', fontSize: '0.85rem', color: '#0F172A', outline: 'none', boxSizing: 'border-box' }}
              />
              <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', backgroundColor: '#E2E8F0', color: '#64748B', fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                ⌘K
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '16px', borderLeft: '1px solid #E2E8F0' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#059669', fontSize: '0.85rem', letterSpacing: '0.5px' }}>
                {currentUserRole === 'Super Admin' ? 'SA' : currentUserRole.substring(0, 2).toUpperCase()}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F172A' }}>
                  {sessionStorage.getItem('nexopp_admin_user_name') || 'Administrator'}
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.72rem', color: '#059669' }}>{currentUserRole}</div>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                style={{ backgroundColor: '#FEE2E2', color: '#DC2626', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '6px' }}
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div data-lenis-prevent="true" style={{ padding: '32px 36px', overflowY: 'auto', flexGrow: 1, backgroundColor: '#F8FAFC' }}>
          
          {/* ================= LOCATION MANAGEMENT MODULE ================= */}
          {activeTab === 'locations' && <LocationManagementModule />}

          {/* ================= CATEGORY 0: GRAND OVERVIEW ================= */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: "'Inter', 'Plus Jakarta Sans', -apple-system, sans-serif" }}>
              {/* ROW 1: Top 6 Stat Cards with SVG Sparkline Graphs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px' }}>
                {/* Card 1: TOTAL PROPERTIES */}
                <div
                  onClick={() => setStatModalTopic('properties')}
                  title="Click to view interactive graph & real database statistics"
                  style={{ backgroundColor: '#FFFFFF', padding: '18px 20px', borderRadius: '16px', border: '1px solid #F1F5F9', boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '135px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                      <FaHome />
                  </div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', letterSpacing: '0.04em', textTransform: 'uppercase' }}>TOTAL PROPERTIES</span>
                </div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', margin: '10px 0 6px 0', letterSpacing: '-0.03em', lineHeight: 1 }}>
                  {propertiesDb.length.toLocaleString()}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '2px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#16A34A' }}>🟢 Real-Time DB</span>
                  <svg width="60" height="22" viewBox="0 0 60 22" fill="none">
                    <path d={propertiesDb.length === 0 ? "M2 18 L58 18" : "M2 18 C 12 14, 20 20, 32 10 C 44 2, 50 14, 58 6"} stroke="#16A34A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

              {/* Card 2: FRANCHISES */}
              <div
                onClick={() => setStatModalTopic('franchises')}
                title="Click to view interactive graph & real database statistics"
                style={{ backgroundColor: '#FFFFFF', padding: '18px 20px', borderRadius: '16px', border: '1px solid #F1F5F9', boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '135px', cursor: 'pointer', transition: 'all 0.2s ease' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#DBEAFE', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                    <FaStore />
                  </div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', letterSpacing: '0.04em', textTransform: 'uppercase' }}>FRANCHISES</span>
                </div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', margin: '10px 0 6px 0', letterSpacing: '-0.03em', lineHeight: 1 }}>
                  {franchiseDb.length.toLocaleString()}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '2px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#2563EB' }}>🟢 Real-Time DB</span>
                  <svg width="60" height="22" viewBox="0 0 60 22" fill="none">
                    <path d={franchiseDb.length === 0 ? "M2 18 L58 18" : "M2 16 C 14 18, 22 8, 34 14 C 46 20, 50 6, 58 8"} stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

              {/* Card 3: BUSINESSES */}
              <div
                onClick={() => setStatModalTopic('businesses')}
                title="Click to view interactive graph & real database statistics"
                style={{ backgroundColor: '#FFFFFF', padding: '18px 20px', borderRadius: '16px', border: '1px solid #F1F5F9', boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '135px', cursor: 'pointer', transition: 'all 0.2s ease' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#F3E8FF', color: '#9333EA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                    <FaBriefcase />
                  </div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', letterSpacing: '0.04em', textTransform: 'uppercase' }}>BUSINESSES</span>
                </div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', margin: '10px 0 6px 0', letterSpacing: '-0.03em', lineHeight: 1 }}>
                  {businessDb.length.toLocaleString()}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '2px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9333EA' }}>🟢 Real-Time DB</span>
                  <svg width="60" height="22" viewBox="0 0 60 22" fill="none">
                    <path d={businessDb.length === 0 ? "M2 18 L58 18" : "M2 18 C 16 10, 24 18, 34 8 C 44 -2, 50 14, 58 6"} stroke="#9333EA" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

              {/* Card 4: LEAD ENQUIRIES */}
              <div
                onClick={() => setStatModalTopic('enquiries')}
                title="Click to view interactive graph & real database statistics"
                style={{ backgroundColor: '#FFFFFF', padding: '18px 20px', borderRadius: '16px', border: '1px solid #F1F5F9', boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '135px', cursor: 'pointer', transition: 'all 0.2s ease' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#FFEDD5', color: '#EA580C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                    <FaEnvelope />
                  </div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', letterSpacing: '0.04em', textTransform: 'uppercase' }}>LEAD ENQUIRIES</span>
                </div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', margin: '10px 0 6px 0', letterSpacing: '-0.03em', lineHeight: 1 }}>
                  {enquiriesDb.length.toLocaleString()}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '2px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#EA580C' }}>📥 Active Leads</span>
                  <svg width="60" height="22" viewBox="0 0 60 22" fill="none">
                    <path d={enquiriesDb.length === 0 ? "M2 18 L58 18" : "M2 16 C 14 16, 24 10, 36 12 C 48 14, 52 6, 58 8"} stroke="#EA580C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

              {/* Card 5: TOTAL USERS */}
              <div
                onClick={() => setStatModalTopic('users')}
                title="Click to view interactive graph & real database statistics"
                style={{ backgroundColor: '#FFFFFF', padding: '18px 20px', borderRadius: '16px', border: '1px solid #F1F5F9', boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '135px', cursor: 'pointer', transition: 'all 0.2s ease' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#CCFBF1', color: '#0D9488', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                    <FaUsers />
                  </div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', letterSpacing: '0.04em', textTransform: 'uppercase' }}>TOTAL USERS</span>
                </div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', margin: '10px 0 6px 0', letterSpacing: '-0.03em', lineHeight: 1 }}>
                  {registeredCustomers.length.toLocaleString()}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '2px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0D9488' }}>👤 Customer DB</span>
                  <svg width="60" height="22" viewBox="0 0 60 22" fill="none">
                    <path d={registeredCustomers.length === 0 ? "M2 18 L58 18" : "M2 18 C 14 18, 24 12, 36 15 C 48 18, 52 6, 58 10"} stroke="#0D9488" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

              {/* Card 6: TOTAL SOLD DATA */}
              <div
                onClick={() => setStatModalTopic('sold')}
                title="Click to view interactive graph & real database statistics"
                style={{ backgroundColor: '#FFFFFF', padding: '18px 20px', borderRadius: '16px', border: '1px solid #F1F5F9', boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '135px', cursor: 'pointer', transition: 'all 0.2s ease' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                    <FaCheckCircle />
                  </div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', letterSpacing: '0.04em', textTransform: 'uppercase' }}>TOTAL SOLD DATA</span>
                </div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', margin: '10px 0 6px 0', letterSpacing: '-0.03em', lineHeight: 1 }}>
                  {(
                    propertiesDb.filter((p: any) => p.sold || p.listingStatus === 'Sold' || p.status === 'Sold').length +
                    franchiseDb.filter((f: any) => f.sold || f.listingStatus === 'Sold' || f.status === 'Sold').length +
                    businessDb.filter((b: any) => b.sold || b.listingStatus === 'Sold' || b.status === 'Sold').length
                  ).toLocaleString()}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '2px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#16A34A' }}>🏷️ Closed Deals</span>
                  <svg width="60" height="22" viewBox="0 0 60 22" fill="none">
                    <path d="M2 18 C 14 18, 24 12, 36 15 C 48 18, 52 6, 58 10" stroke="#16A34A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            {/* ROW 2: 3 Columns Grid (Overview Analytics Line Chart, Recent Activity, Top Performing Locations Pie Chart) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 1fr) minmax(0, 1fr)', gap: '20px', alignItems: 'stretch' }}>
              
              {/* Col 1: Overview Analytics (Bar Graph showing listings by category with Slide navigation) */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '22px 24px', border: '1px solid #F1F5F9', boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '340px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', display: 'block' }}>Overview Analytics</span>
                    <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Active listings distribution (Bar Graph)</span>
                  </div>
                  
                  {/* Slider Pagination Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button 
                      onClick={() => {
                        if (activeAnalyticsSlide === 'business') setActiveAnalyticsSlide('franchise');
                        else if (activeAnalyticsSlide === 'franchise') setActiveAnalyticsSlide('property');
                      }}
                      disabled={activeAnalyticsSlide === 'property'}
                      style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', cursor: activeAnalyticsSlide === 'property' ? 'not-allowed' : 'pointer', opacity: activeAnalyticsSlide === 'property' ? 0.4 : 1, fontSize: '0.8rem', fontWeight: 'bold' }}
                    >
                      ←
                    </button>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', minWidth: '50px', textAlign: 'center' }}>
                      {activeAnalyticsSlide === 'property' ? '1 / 3' : activeAnalyticsSlide === 'franchise' ? '2 / 3' : '3 / 3'}
                    </span>
                    <button 
                      onClick={() => {
                        if (activeAnalyticsSlide === 'property') setActiveAnalyticsSlide('franchise');
                        else if (activeAnalyticsSlide === 'franchise') setActiveAnalyticsSlide('business');
                      }}
                      disabled={activeAnalyticsSlide === 'business'}
                      style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', cursor: activeAnalyticsSlide === 'business' ? 'not-allowed' : 'pointer', opacity: activeAnalyticsSlide === 'business' ? 0.4 : 1, fontSize: '0.8rem', fontWeight: 'bold' }}
                    >
                      →
                    </button>
                  </div>
                </div>

                {/* Tabs Row for quick selection */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
                  {[
                    { id: 'property', label: 'Properties', color: '#16A34A', bgClass: '#DCFCE7' },
                    { id: 'franchise', label: 'Franchises', color: '#2563EB', bgClass: '#DBEAFE' },
                    { id: 'business', label: 'Businesses', color: '#9333EA', bgClass: '#F3E8FF' }
                  ].map(tab => {
                    const active = activeAnalyticsSlide === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveAnalyticsSlide(tab.id as any)}
                        style={{
                          flex: 1,
                          padding: '6px 10px',
                          border: active ? `2px solid ${tab.color}` : '1px solid #E2E8F0',
                          backgroundColor: active ? tab.bgClass : '#F8FAFC',
                          color: active ? tab.color : '#475569',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          borderRadius: '8px',
                          transition: 'all 0.2s'
                        }}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Dynamic SVG Bar Chart */}
                <div style={{ position: 'relative', height: '200px', width: '100%', flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                  {activeAnalyticsSlide === 'property' && (() => {
                    const data = [
                      { label: 'Flats', val: propertiesDb.filter(p => p.category?.toLowerCase() === 'apartment' || p.category?.toLowerCase() === 'flats').length },
                      { label: 'Villas', val: propertiesDb.filter(p => p.category?.toLowerCase() === 'villa').length },
                      { label: 'Houses', val: propertiesDb.filter(p => p.category?.toLowerCase() === 'house' || p.category?.toLowerCase() === 'independent house').length },
                      { label: 'Plots', val: propertiesDb.filter(p => p.category?.toLowerCase() === 'plot' || p.category?.toLowerCase() === 'land').length },
                      { label: 'Commercial', val: propertiesDb.filter(p => p.category?.toLowerCase() === 'commercial').length }
                    ];
                    const maxVal = Math.max(...data.map(d => d.val), 1);
                    return (
                      <svg viewBox="0 0 360 170" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                        {/* Grid lines */}
                        <line x1="30" y1="20" x2="350" y2="20" stroke="#F1F5F9" strokeWidth="1" />
                        <line x1="30" y1="65" x2="350" y2="65" stroke="#F1F5F9" strokeWidth="1" />
                        <line x1="30" y1="110" x2="350" y2="110" stroke="#F1F5F9" strokeWidth="1" />
                        <line x1="30" y1="140" x2="350" y2="140" stroke="#E2E8F0" strokeWidth="1.5" />
                        
                        {/* Y-axis values */}
                        <text x="5" y="24" fontSize="8" fill="#94A3B8" fontWeight="600">{maxVal}</text>
                        <text x="5" y="69" fontSize="8" fill="#94A3B8" fontWeight="600">{Math.round(maxVal * 0.6)}</text>
                        <text x="5" y="114" fontSize="8" fill="#94A3B8" fontWeight="600">{Math.round(maxVal * 0.3)}</text>
                        <text x="5" y="144" fontSize="8" fill="#94A3B8" fontWeight="600">0</text>

                        {data.map((item, idx) => {
                          const barWidth = 32;
                          const x = 50 + idx * 60;
                          const barHeight = (item.val / maxVal) * 110;
                          const y = 140 - barHeight;
                          return (
                            <g key={idx}>
                              <rect x={x} y={y} width={barWidth} height={barHeight} fill="#16A34A" rx="4" ry="4" style={{ transition: 'all 0.5s ease' }} />
                              <text x={x + barWidth/2} y={y - 6} fontSize="8" fontWeight="700" fill="#16A34A" textAnchor="middle">{item.val}</text>
                              <text x={x + barWidth/2} y="154" fontSize="8" fontWeight="600" fill="#475569" textAnchor="middle">{item.label}</text>
                            </g>
                          );
                        })}
                      </svg>
                    );
                  })()}

                  {activeAnalyticsSlide === 'franchise' && (() => {
                    const data = [
                      { label: 'Food/Dining', val: franchiseDb.filter(f => f.type.toLowerCase().includes('food') || f.type.toLowerCase().includes('restaurant')).length },
                      { label: 'Retail/Stores', val: franchiseDb.filter(f => f.type.toLowerCase().includes('retail') || f.type.toLowerCase().includes('store')).length },
                      { label: 'Services', val: franchiseDb.filter(f => f.type.toLowerCase().includes('service')).length },
                      { label: 'Education', val: franchiseDb.filter(f => f.type.toLowerCase().includes('education')).length }
                    ];
                    const maxVal = Math.max(...data.map(d => d.val), 1);
                    return (
                      <svg viewBox="0 0 360 170" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                        <line x1="30" y1="20" x2="350" y2="20" stroke="#F1F5F9" strokeWidth="1" />
                        <line x1="30" y1="65" x2="350" y2="65" stroke="#F1F5F9" strokeWidth="1" />
                        <line x1="30" y1="110" x2="350" y2="110" stroke="#F1F5F9" strokeWidth="1" />
                        <line x1="30" y1="140" x2="350" y2="140" stroke="#E2E8F0" strokeWidth="1.5" />
                        
                        <text x="5" y="24" fontSize="8" fill="#94A3B8" fontWeight="600">{maxVal}</text>
                        <text x="5" y="69" fontSize="8" fill="#94A3B8" fontWeight="600">{Math.round(maxVal * 0.6)}</text>
                        <text x="5" y="114" fontSize="8" fill="#94A3B8" fontWeight="600">{Math.round(maxVal * 0.3)}</text>
                        <text x="5" y="144" fontSize="8" fill="#94A3B8" fontWeight="600">0</text>

                        {data.map((item, idx) => {
                          const barWidth = 36;
                          const x = 55 + idx * 75;
                          const barHeight = (item.val / maxVal) * 110;
                          const y = 140 - barHeight;
                          return (
                            <g key={idx}>
                              <rect x={x} y={y} width={barWidth} height={barHeight} fill="#2563EB" rx="4" ry="4" style={{ transition: 'all 0.5s ease' }} />
                              <text x={x + barWidth/2} y={y - 6} fontSize="8" fontWeight="700" fill="#2563EB" textAnchor="middle">{item.val}</text>
                              <text x={x + barWidth/2} y="154" fontSize="8" fontWeight="600" fill="#475569" textAnchor="middle">{item.label}</text>
                            </g>
                          );
                        })}
                      </svg>
                    );
                  })()}

                  {activeAnalyticsSlide === 'business' && (() => {
                    const data = [
                      { label: 'Food/Dining', val: businessDb.filter(b => b.industry.toLowerCase().includes('food')).length },
                      { label: 'Healthcare', val: businessDb.filter(b => b.industry.toLowerCase().includes('health')).length },
                      { label: 'Retail Stores', val: businessDb.filter(b => b.industry.toLowerCase().includes('retail') || b.industry.toLowerCase().includes('store')).length },
                      { label: 'Services', val: businessDb.filter(b => b.industry.toLowerCase().includes('service')).length },
                    ];
                    const maxVal = Math.max(...data.map(d => d.val), 1);
                    return (
                      <svg viewBox="0 0 360 170" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                        <line x1="30" y1="20" x2="350" y2="20" stroke="#F1F5F9" strokeWidth="1" />
                        <line x1="30" y1="65" x2="350" y2="65" stroke="#F1F5F9" strokeWidth="1" />
                        <line x1="30" y1="110" x2="350" y2="110" stroke="#F1F5F9" strokeWidth="1" />
                        <line x1="30" y1="140" x2="350" y2="140" stroke="#E2E8F0" strokeWidth="1.5" />
                        
                        <text x="5" y="24" fontSize="8" fill="#94A3B8" fontWeight="600">{maxVal}</text>
                        <text x="5" y="69" fontSize="8" fill="#94A3B8" fontWeight="600">{Math.round(maxVal * 0.6)}</text>
                        <text x="5" y="114" fontSize="8" fill="#94A3B8" fontWeight="600">{Math.round(maxVal * 0.3)}</text>
                        <text x="5" y="144" fontSize="8" fill="#94A3B8" fontWeight="600">0</text>

                        {data.map((item, idx) => {
                          const barWidth = 36;
                          const x = 55 + idx * 75;
                          const barHeight = (item.val / maxVal) * 110;
                          const y = 140 - barHeight;
                          return (
                            <g key={idx}>
                              <rect x={x} y={y} width={barWidth} height={barHeight} fill="#9333EA" rx="4" ry="4" style={{ transition: 'all 0.5s ease' }} />
                              <text x={x + barWidth/2} y={y - 6} fontSize="8" fontWeight="700" fill="#9333EA" textAnchor="middle">{item.val}</text>
                              <text x={x + barWidth/2} y="154" fontSize="8" fontWeight="600" fill="#475569" textAnchor="middle">{item.label}</text>
                            </g>
                          );
                        })}
                      </svg>
                    );
                  })()}
                </div>
              </div>

              {/* Col 2: Recent Activity */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '22px 24px', border: '1px solid #F1F5F9', boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>Recent Activity</span>
                  <button onClick={() => setActiveTab('inquiries')} style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    View All
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', flexGrow: 1 }}>
                  {propertiesDb.length === 0 && franchiseDb.length === 0 && businessDb.length === 0 && enquiriesDb.length === 0 ? (
                    <div style={{ padding: '40px 10px', textAlign: 'center', color: '#64748B', fontSize: '0.85rem' }}>
                      No recent activity yet. Added listings and enquiries will appear here.
                    </div>
                  ) : (
                    <>
                      {propertiesDb[0] && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                          <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.9rem' }}>
                            <FaHome />
                          </div>
                          <div style={{ flexGrow: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0F172A' }}>New property added</span>
                              <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 600 }}>{propertiesDb[0].createdDate || 'Recently'}</span>
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '1px' }}>{propertiesDb[0].title} in {propertiesDb[0].city}</div>
                          </div>
                        </div>
                      )}
                      {franchiseDb[0] && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                          <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: '#DBEAFE', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.9rem' }}>
                            <FaStore />
                          </div>
                          <div style={{ flexGrow: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0F172A' }}>New franchise registered</span>
                              <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 600 }}>Recently</span>
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '1px' }}>{franchiseDb[0].brand} - {franchiseDb[0].city}</div>
                          </div>
                        </div>
                      )}
                      {businessDb[0] && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                          <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: '#F3E8FF', color: '#9333EA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.9rem' }}>
                            <FaBriefcase />
                          </div>
                          <div style={{ flexGrow: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0F172A' }}>New business listed</span>
                              <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 600 }}>Recently</span>
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '1px' }}>{businessDb[0].title} - {businessDb[0].location}</div>
                          </div>
                        </div>
                      )}
                      {enquiriesDb[0] && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                          <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: '#FFEDD5', color: '#EA580C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.9rem' }}>
                            <FaEnvelope />
                          </div>
                          <div style={{ flexGrow: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0F172A' }}>New lead received</span>
                              <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 600 }}>{enquiriesDb[0].date || 'Recently'}</span>
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '1px' }}>{enquiriesDb[0].name} ({enquiriesDb[0].interest})</div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Col 3: Top Performing Locations (Donut / Pie Chart) */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '22px 24px', border: '1px solid #F1F5F9', boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>Top Performing Locations</span>
                  <button onClick={() => setActiveTab('properties')} style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    View All
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexGrow: 1, margin: '8px 0' }}>
                  {/* Donut SVG Graphic */}
                  <div style={{ width: '130px', height: '130px', flexShrink: 0, position: 'relative' }}>
                    {(() => {
                      const countHyd = propertiesDb.filter(p => p.city === 'Hyderabad').length;
                      const countVij = propertiesDb.filter(p => p.city === 'Vijayawada').length;
                      const countGun = propertiesDb.filter(p => p.city === 'Guntur').length;
                      const countBen = propertiesDb.filter(p => p.city === 'Bengaluru').length;
                      const totalLocUnits = countHyd + countVij + countGun + countBen;

                      const totalCirc = 226;
                      const pctHyd = totalLocUnits > 0 ? countHyd / totalLocUnits : 0;
                      const pctVij = totalLocUnits > 0 ? countVij / totalLocUnits : 0;
                      const pctGun = totalLocUnits > 0 ? countGun / totalLocUnits : 0;
                      const pctBen = totalLocUnits > 0 ? countBen / totalLocUnits : 0;

                      const dashHyd = Math.round(pctHyd * totalCirc);
                      const dashVij = Math.round(pctVij * totalCirc);
                      const dashGun = Math.round(pctGun * totalCirc);
                      const dashBen = Math.round(pctBen * totalCirc);

                      return (
                        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                          {totalLocUnits === 0 ? (
                            <circle cx="50" cy="50" r="36" fill="transparent" stroke="#E2E8F0" strokeWidth="20" />
                          ) : (
                            <>
                              {dashHyd > 0 && <circle cx="50" cy="50" r="36" fill="transparent" stroke="#0D9488" strokeWidth="20" strokeDasharray={`${dashHyd} ${totalCirc}`} strokeDashoffset={0} />}
                              {dashVij > 0 && <circle cx="50" cy="50" r="36" fill="transparent" stroke="#10B981" strokeWidth="20" strokeDasharray={`${dashVij} ${totalCirc}`} strokeDashoffset={-dashHyd} />}
                              {dashGun > 0 && <circle cx="50" cy="50" r="36" fill="transparent" stroke="#8B5CF6" strokeWidth="20" strokeDasharray={`${dashGun} ${totalCirc}`} strokeDashoffset={-(dashHyd + dashVij)} />}
                              {dashBen > 0 && <circle cx="50" cy="50" r="36" fill="transparent" stroke="#F97316" strokeWidth="20" strokeDasharray={`${dashBen} ${totalCirc}`} strokeDashoffset={-(dashHyd + dashVij + dashGun)} />}
                            </>
                          )}
                        </svg>
                      );
                    })()}
                  </div>

                  {/* Locations List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexGrow: 1, fontSize: '0.72rem' }}>
                    {propertiesDb.length === 0 && franchiseDb.length === 0 ? (
                      <div style={{ color: '#64748B', fontSize: '0.8rem', padding: '10px 0' }}>No locations recorded yet.</div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#0D9488', fontWeight: 700 }}>● <span style={{ color: '#334155' }}>Hyderabad</span></span>
                          <span style={{ fontWeight: 700, color: '#0F172A' }}>{propertiesDb.filter(p => p.city === 'Hyderabad').length} <span style={{ color: '#94A3B8', fontWeight: 500 }}>units</span></span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#10B981', fontWeight: 700 }}>● <span style={{ color: '#334155' }}>Vijayawada</span></span>
                          <span style={{ fontWeight: 700, color: '#0F172A' }}>{propertiesDb.filter(p => p.city === 'Vijayawada').length} <span style={{ color: '#94A3B8', fontWeight: 500 }}>units</span></span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#8B5CF6', fontWeight: 700 }}>● <span style={{ color: '#334155' }}>Guntur</span></span>
                          <span style={{ fontWeight: 700, color: '#0F172A' }}>{propertiesDb.filter(p => p.city === 'Guntur').length} <span style={{ color: '#94A3B8', fontWeight: 500 }}>units</span></span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#F97316', fontWeight: 700 }}>● <span style={{ color: '#334155' }}>Bengaluru</span></span>
                          <span style={{ fontWeight: 700, color: '#0F172A' }}>{propertiesDb.filter(p => p.city === 'Bengaluru').length} <span style={{ color: '#94A3B8', fontWeight: 500 }}>units</span></span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Bottom Footer Pill */}
                <div style={{ backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #F1F5F9' }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 600 }}>Total Locations</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>{new Set([...propertiesDb.map(p => p.city), ...franchiseDb.map(f => f.city), ...businessDb.map(b => b.location)]).size} Cities</div>
                  </div>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>
                    <FaMapMarkerAlt />
                  </div>
                </div>
              </div>

            </div>

            {/* ROW 3: 2 Columns Grid (Latest Properties Table, System Health & Quick Actions) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1fr)', gap: '20px', alignItems: 'start' }}>
              
              {/* Col 1: Latest Properties Table */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '22px 24px', border: '1px solid #F1F5F9', boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>Latest Properties</span>
                  <button onClick={() => setActiveTab('properties')} style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    View All
                  </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #F1F5F9', color: '#64748B', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        <th style={{ padding: '10px 8px 10px 0' }}>PROPERTY</th>
                        <th style={{ padding: '10px 8px' }}>TYPE</th>
                        <th style={{ padding: '10px 8px' }}>LOCATION</th>
                        <th style={{ padding: '10px 8px' }}>PRICE</th>
                        <th style={{ padding: '10px 8px' }}>STATUS</th>
                        <th style={{ padding: '10px 8px' }}>ADDED ON</th>
                        <th style={{ padding: '10px 0 10px 8px', textAlign: 'right' }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {propertiesDb.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ padding: '30px', textAlign: 'center', color: '#64748B' }}>
                            No properties added yet. Click "Add Property" to create your first listing.
                          </td>
                        </tr>
                      ) : (
                        propertiesDb.slice(0, 5).map((row, idx) => (
                          <tr key={idx} style={{ borderBottom: idx === 4 ? 'none' : '1px solid #F8FAFC' }}>
                            <td style={{ padding: '12px 8px 12px 0' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <img src={row.image || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=150&auto=format&fit=crop&q=80'} alt={row.title} style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover' }} />
                                <div>
                                  <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.82rem' }}>{row.title}</div>
                                  <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>{row.id}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '12px 8px' }}>
                              <span style={{ padding: '3px 10px', borderRadius: '6px', backgroundColor: '#DBEAFE', color: '#2563EB', fontWeight: 700, fontSize: '0.7rem' }}>{row.category}</span>
                            </td>
                            <td style={{ padding: '12px 8px', color: '#475569', fontWeight: 500 }}>{row.city}</td>
                            <td style={{ padding: '12px 8px', fontWeight: 700, color: '#0F172A' }}>{row.priceDisplay || ('₹ ' + row.price + ' L')}</td>
                            <td style={{ padding: '12px 8px' }}>
                              <span style={{ padding: '3px 10px', borderRadius: '6px', backgroundColor: '#DCFCE7', color: '#16A34A', fontWeight: 700, fontSize: '0.7rem' }}>{row.listingStatus || 'Active'}</span>
                            </td>
                            <td style={{ padding: '12px 8px', color: '#64748B' }}>{row.createdDate || 'Recently'}</td>
                            <td style={{ padding: '12px 0 12px 8px', textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: '6px' }}>
                                <button onClick={() => setActiveTab('properties')} title="Edit" style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaEdit /></button>
                                <button onClick={() => setActiveTab('properties')} title="View" style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaEye /></button>
                                <button onClick={() => setActiveTab('properties')} title="More" style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaEllipsisV /></button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Col 2: System Health & Quick Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Card 1: System Health */}
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '22px 24px', border: '1px solid #F1F5F9', boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>System Health</span>
                    <button onClick={() => setActiveTab('customization')} style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      View All
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.8rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: '#475569', fontWeight: 500 }}>Server Uptime</span>
                        <span style={{ fontWeight: 700, color: '#0F172A' }}>99.9%</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: '99.9%', height: '100%', backgroundColor: '#16A34A' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: '#475569', fontWeight: 500 }}>Website Performance</span>
                        <span style={{ fontWeight: 700, color: '#0F172A' }}>95%</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: '95%', height: '100%', backgroundColor: '#16A34A' }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                      <span style={{ color: '#475569', fontWeight: 500 }}>Database Status</span>
                      <span style={{ fontWeight: 700, color: '#16A34A' }}>Healthy</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                      <span style={{ color: '#475569', fontWeight: 500 }}>SSL Certificate</span>
                      <span style={{ fontWeight: 700, color: '#16A34A' }}>Valid</span>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: '#475569', fontWeight: 500 }}>Storage Usage</span>
                        <span style={{ fontWeight: 700, color: '#0F172A' }}>72%</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: '72%', height: '100%', backgroundColor: '#16A34A' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2: Quick Actions */}
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '22px 24px', border: '1px solid #F1F5F9', boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.03)' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginBottom: '16px' }}>
                    Quick Actions
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                    <button
                      onClick={() => setActiveTab('properties')}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px 6px', backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: '14px', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                        <FaBuilding />
                      </div>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0F172A', textAlign: 'center' }}>Add Property</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('franchises')}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px 6px', backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: '14px', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#FFEDD5', color: '#EA580C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                        <FaStore />
                      </div>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0F172A', textAlign: 'center' }}>Add Franchise</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('businesses')}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px 6px', backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: '14px', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#F3E8FF', color: '#9333EA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                        <FaBriefcase />
                      </div>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0F172A', textAlign: 'center' }}>Add Business</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('brokers')}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px 6px', backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: '14px', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#DBEAFE', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                        <FaUserTie />
                      </div>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0F172A', textAlign: 'center' }}>Add Broker</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* ================= CATEGORY 1: CUSTOMIZATION & ANALYTICS ================= */}
        {activeTab === 'customization' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            
            {/* Clean Sample Data Banner */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '24px 28px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', letterSpacing: '0.04em' }}>DATABASE PURGE CONTROL</h3>
                <p style={{ margin: '4px 0 0 0', color: '#64748B', fontSize: '0.85rem' }}>Remove all static demo properties and franchises to start with a completely clean slate.</p>
              </div>
              <button
                onClick={handleClearStaticData}
                style={{ padding: '10px 20px', backgroundColor: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", letterSpacing: '0.05em' }}
              >
                <FaTrash /> REMOVE STATIC DATA
              </button>
            </div>

            <form onSubmit={handleSaveSettings} style={{ backgroundColor: '#FFFFFF', padding: '32px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* Prominent Executive Card for Main Center Video */}
              <div style={{ backgroundColor: '#F8FAFC', padding: '28px', color: '#0F172A', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <span style={{ backgroundColor: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE', padding: '4px 12px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>MAIN CENTER VIDEO</span>
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', letterSpacing: '0.04em' }}>🎬 16:9 SHOWCASE VIDEO FEED</h3>
                </div>
                <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
                  This video displays continuously on the main website center between the Hero banner and Browse by Category. Upload an exact 16:9 widescreen video (e.g. 1920x1080 or 1280x720 MP4).
                </p>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px', color: '#334155', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>DIRECT VIDEO URL OR UPLOAD MP4 FILE</label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input
                      type="text"
                      value={settingsForm.promotionalVideoUrl || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, promotionalVideoUrl: e.target.value })}
                      placeholder="https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-building-exterior-41580-large.mp4"
                      style={{ flexGrow: 1, padding: '12px 16px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#0F172A', fontSize: '0.95rem', outline: 'none' }}
                    />
                    <label style={{ padding: '12px 24px', backgroundColor: '#1E40AF', color: '#FFFFFF', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', transition: 'all 0.2s', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", letterSpacing: '0.06em' }}>
                      📁 UPLOAD MP4
                      <input
                        type="file"
                        accept="video/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload(e, (list) => { if (list[0]) setSettingsForm({ ...settingsForm, promotionalVideoUrl: list[0] }); })}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <h3 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", margin: 0, fontSize: '1.2rem', fontWeight: 700, borderBottom: '1px solid #E2E8F0', paddingBottom: '16px', color: '#0F172A', letterSpacing: '0.04em' }}>HERO SECTION BRANDING & COLORS</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px', color: '#475569', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>PRIMARY BRAND ACCENT COLOR</label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={settingsForm.primaryColor}
                      onChange={(e) => setSettingsForm({ ...settingsForm, primaryColor: e.target.value })}
                      style={{ width: '50px', height: '44px', padding: 0, border: '1px solid #E2E8F0', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={settingsForm.primaryColor}
                      onChange={(e) => setSettingsForm({ ...settingsForm, primaryColor: e.target.value })}
                      style={{ flexGrow: 1, padding: '12px 16px', border: '1px solid #E2E8F0', fontSize: '0.95rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px', color: '#475569', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>HERO BACKGROUND IMAGE (URL OR UPLOAD)</label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input
                      type="text"
                      value={settingsForm.heroBgUrl}
                      onChange={(e) => setSettingsForm({ ...settingsForm, heroBgUrl: e.target.value })}
                      placeholder="/assets/hero_villa.jpg"
                      style={{ flexGrow: 1, padding: '12px 16px', border: '1px solid #E2E8F0', fontSize: '0.95rem' }}
                    />
                    <label style={{ padding: '12px 16px', backgroundColor: '#1E40AF', color: '#FFFFFF', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>
                      <FaUpload /> UPLOAD
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload(e, (list) => { if (list[0]) setSettingsForm({ ...settingsForm, heroBgUrl: list[0] }); })}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px', color: '#475569', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>MAIN HERO TITLE</label>
                <input
                  type="text"
                  value={settingsForm.heroTitle}
                  onChange={(e) => setSettingsForm({ ...settingsForm, heroTitle: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid #E2E8F0', fontSize: '1rem', fontWeight: 600 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px', color: '#475569', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>HERO SUBTITLE TEXT</label>
                <textarea
                  rows={2}
                  value={settingsForm.heroSubtitle}
                  onChange={(e) => setSettingsForm({ ...settingsForm, heroSubtitle: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid #E2E8F0', fontSize: '0.95rem' }}
                />
              </div>

              <h3 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", margin: '12px 0 0 0', fontSize: '1.2rem', fontWeight: 700, borderBottom: '1px solid #E2E8F0', paddingBottom: '16px', color: '#0F172A', letterSpacing: '0.04em' }}>MANAGE DEFAULT CITIES / LOCATIONS</h3>
              <p style={{ margin: '-16px 0 0 0', fontSize: '0.85rem', color: '#64748B' }}>Add or remove locations that appear in the website navigation location filter dropdown.</p>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  placeholder="Add new city (e.g. Kolkata, Ahmedabad, Goa)"
                  value={newCityInput}
                  onChange={(e) => setNewCityInput(e.target.value)}
                  style={{ flexGrow: 1, padding: '12px 16px', border: '1px solid #E2E8F0', fontSize: '0.95rem' }}
                />
                <button
                  type="button"
                  onClick={handleAddCity}
                  style={{ padding: '12px 24px', backgroundColor: '#1E40AF', color: '#FFFFFF', border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", letterSpacing: '0.06em' }}
                >
                  + ADD CITY
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', backgroundColor: '#F8FAFC', padding: '16px', border: '1px solid #E2E8F0' }}>
                {(settingsForm.availableCities || ['Hyderabad', 'Bengaluru', 'Mumbai', 'Delhi NCR', 'Chennai', 'Pune']).map((city) => (
                  <div key={city} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FFFFFF', border: '1px solid #1E40AF', color: '#1E40AF', padding: '6px 14px', fontSize: '0.85rem', fontWeight: 700 }}>
                    <span>📍 {city}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCity(city)}
                      style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', fontWeight: 800, fontSize: '1rem', padding: '0 2px' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <h3 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", margin: '12px 0 0 0', fontSize: '1.2rem', fontWeight: 700, borderBottom: '1px solid #E2E8F0', paddingBottom: '16px', color: '#0F172A', letterSpacing: '0.04em' }}>PUBLIC ANALYTICS COUNTER METRICS</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', marginBottom: '6px', color: '#64748B', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>ACTIVE LISTINGS</label>
                  <input
                    type="number"
                    value={settingsForm.analytics.activeListings}
                    onChange={(e) => setSettingsForm({ ...settingsForm, analytics: { ...settingsForm.analytics, activeListings: Number(e.target.value) } })}
                    style={{ width: '100%', padding: '12px', border: '1px solid #E2E8F0', fontSize: '1.1rem', fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', marginBottom: '6px', color: '#64748B', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>HAPPY CUSTOMERS</label>
                  <input
                    type="number"
                    value={settingsForm.analytics.happyClients}
                    onChange={(e) => setSettingsForm({ ...settingsForm, analytics: { ...settingsForm.analytics, happyClients: Number(e.target.value) } })}
                    style={{ width: '100%', padding: '12px', border: '1px solid #E2E8F0', fontSize: '1.1rem', fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', marginBottom: '6px', color: '#64748B', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>DEALS CLOSED</label>
                  <input
                    type="number"
                    value={settingsForm.analytics.dealsClosed}
                    onChange={(e) => setSettingsForm({ ...settingsForm, analytics: { ...settingsForm.analytics, dealsClosed: Number(e.target.value) } })}
                    style={{ width: '100%', padding: '12px', border: '1px solid #E2E8F0', fontSize: '1.1rem', fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', marginBottom: '6px', color: '#64748B', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>TOTAL VISITORS</label>
                  <input
                    type="number"
                    value={settingsForm.analytics.totalVisitors}
                    onChange={(e) => setSettingsForm({ ...settingsForm, analytics: { ...settingsForm.analytics, totalVisitors: Number(e.target.value) } })}
                    style={{ width: '100%', padding: '12px', border: '1px solid #E2E8F0', fontSize: '1.1rem', fontWeight: 700 }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px' }}>
                <button type="submit" style={{ padding: '14px 32px', backgroundColor: '#1E40AF', color: '#FFFFFF', border: 'none', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", letterSpacing: '0.08em' }}>
                  SAVE ALL CUSTOMIZATIONS
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= CATEGORY: MAIN STATS ONLY ================= */}
        {activeTab === 'main_stats' && (
          <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* Header banner */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderLeft: '5px solid #1E40AF', padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <span style={{ backgroundColor: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE', padding: '5px 14px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>Live Stats Control</span>
                <h2 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", fontSize: '1.65rem', fontWeight: 700, color: '#0F172A', margin: '10px 0 6px 0', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Main Page Stats & Trust Metrics</h2>
                <p style={{ color: '#64748B', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>Configure the live front-end Hero stats bar (18,500+ Properties, etc.), trust badges and custom metrics.</p>
              </div>
              <button type="submit" style={{ padding: '14px 32px', backgroundColor: '#1E40AF', color: '#FFFFFF', border: 'none', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                <FaCheckCircle /> Save & Publish Live Stats
              </button>
            </div>

            {/* 1. MAIN HOMEPAGE STATS BAR & TRUST METRICS (LIVE EDITING) */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '32px', border: '1px solid #E2E8F0', borderTop: '4px solid #16A34A', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 800 }}>
                  📊
                </div>
                <div>
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', letterSpacing: '0.03em' }}>
                    1. MAIN HOMEPAGE STATS BAR & TRUST METRICS (LIVE EDITING)
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: '#64748B' }}>
                    Change any number or text here to immediately update the 6 stat cards displayed at the top of the main home page!
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '28px' }}>
                {/* Stat 1: Properties Listed */}
                <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px', color: '#16A34A' }}>
                    <span>🏠 Properties Listed Stat</span>
                  </label>
                  <input
                    type="text"
                    value={currentMainStats.propertiesListed}
                    onChange={(e) => setSettingsForm({
                      ...settingsForm,
                      mainPageStats: {
                        ...currentMainStats,
                        propertiesListed: e.target.value
                      }
                    })}
                    placeholder="e.g. 18,500+"
                    style={{ width: '100%', padding: '12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', boxSizing: 'border-box' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px', display: 'block' }}>Displayed in 1st green stat box on Home.</span>
                </div>

                {/* Stat 2: Franchises */}
                <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px', color: '#9333EA' }}>
                    <span>🏪 Franchises Stat</span>
                  </label>
                  <input
                    type="text"
                    value={currentMainStats.franchisesCount}
                    onChange={(e) => setSettingsForm({
                      ...settingsForm,
                      mainPageStats: {
                        ...currentMainStats,
                        franchisesCount: e.target.value
                      }
                    })}
                    placeholder="e.g. 950+"
                    style={{ width: '100%', padding: '12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', boxSizing: 'border-box' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px', display: 'block' }}>Displayed in 2nd purple stat box on Home.</span>
                </div>

                {/* Stat 3: Verified Brokers */}
                <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px', color: '#EA580C' }}>
                    <span>👥 Verified Brokers Stat</span>
                  </label>
                  <input
                    type="text"
                    value={currentMainStats.verifiedBrokers}
                    onChange={(e) => setSettingsForm({
                      ...settingsForm,
                      mainPageStats: {
                        ...currentMainStats,
                        verifiedBrokers: e.target.value
                      }
                    })}
                    placeholder="e.g. 2,400+"
                    style={{ width: '100%', padding: '12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', boxSizing: 'border-box' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px', display: 'block' }}>Displayed in 3rd orange stat box on Home.</span>
                </div>

                {/* Stat 4: Cities Covered */}
                <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px', color: '#2563EB' }}>
                    <span>🏙️ Cities Covered Stat</span>
                  </label>
                  <input
                    type="text"
                    value={currentMainStats.citiesCovered}
                    onChange={(e) => setSettingsForm({
                      ...settingsForm,
                      mainPageStats: {
                        ...currentMainStats,
                        citiesCovered: e.target.value
                      }
                    })}
                    placeholder="e.g. 32"
                    style={{ width: '100%', padding: '12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', boxSizing: 'border-box' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px', display: 'block' }}>Displayed in 4th blue stat box on Home.</span>
                </div>

                {/* Stat 5: Total Property Value */}
                <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px', color: '#DB2777' }}>
                    <span>💰 Total Property Value Stat</span>
                  </label>
                  <input
                    type="text"
                    value={currentMainStats.totalPropertyValue}
                    onChange={(e) => setSettingsForm({
                      ...settingsForm,
                      mainPageStats: {
                        ...currentMainStats,
                        totalPropertyValue: e.target.value
                      }
                    })}
                    placeholder="e.g. ₹850 Cr+"
                    style={{ width: '100%', padding: '12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', boxSizing: 'border-box' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px', display: 'block' }}>Displayed in 5th pink stat box on Home.</span>
                </div>

                {/* Stat 6: Happy Clients */}
                <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px', color: '#16A34A' }}>
                    <span>😊 Happy Clients Stat</span>
                  </label>
                  <input
                    type="text"
                    value={currentMainStats.happyClients}
                    onChange={(e) => setSettingsForm({
                      ...settingsForm,
                      mainPageStats: {
                        ...currentMainStats,
                        happyClients: e.target.value
                      }
                    })}
                    placeholder="e.g. 15K+"
                    style={{ width: '100%', padding: '12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', boxSizing: 'border-box' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px', display: 'block' }}>Displayed in 6th green stat box on Home.</span>
                </div>
              </div>

              {/* WHY VENTURO SECTION STATS */}
              <div style={{ borderTop: '1px dashed #CBD5E1', paddingTop: '20px' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', color: '#334155', fontWeight: 700 }}>
                  Why Venturo / Section Stats (Secondary Metrics)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', color: '#475569', marginBottom: '6px' }}>Active Listings</label>
                    <input
                      type="text"
                      value={currentMainStats.activeListingsWhy || '10,000+'}
                      onChange={(e) => setSettingsForm({
                        ...settingsForm,
                        mainPageStats: {
                          ...currentMainStats,
                          activeListingsWhy: e.target.value
                        }
                      })}
                      style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.95rem', fontWeight: 700, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', color: '#475569', marginBottom: '6px' }}>Happy Customers</label>
                    <input
                      type="text"
                      value={currentMainStats.happyCustomersWhy || '5,000+'}
                      onChange={(e) => setSettingsForm({
                        ...settingsForm,
                        mainPageStats: {
                          ...currentMainStats,
                          happyCustomersWhy: e.target.value
                        }
                      })}
                      style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.95rem', fontWeight: 700, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', color: '#475569', marginBottom: '6px' }}>Cities Covered</label>
                    <input
                      type="text"
                      value={currentMainStats.citiesCoveredWhy || '50+'}
                      onChange={(e) => setSettingsForm({
                        ...settingsForm,
                        mainPageStats: {
                          ...currentMainStats,
                          citiesCoveredWhy: e.target.value
                        }
                      })}
                      style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.95rem', fontWeight: 700, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', color: '#475569', marginBottom: '6px' }}>Verified %</label>
                    <input
                      type="text"
                      value={currentMainStats.verifiedListingsWhy || '100%'}
                      onChange={(e) => setSettingsForm({
                        ...settingsForm,
                        mainPageStats: {
                          ...currentMainStats,
                          verifiedListingsWhy: e.target.value
                        }
                      })}
                      style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.95rem', fontWeight: 700, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', color: '#475569', marginBottom: '6px' }}>Support</label>
                    <input
                      type="text"
                      value={currentMainStats.customerSupportWhy || '24/7'}
                      onChange={(e) => setSettingsForm({
                        ...settingsForm,
                        mainPageStats: {
                          ...currentMainStats,
                          customerSupportWhy: e.target.value
                        }
                      })}
                      style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.95rem', fontWeight: 700, boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button type="submit" style={{ padding: '16px 36px', backgroundColor: '#1E40AF', color: '#FFFFFF', border: 'none', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", letterSpacing: '0.08em' }}>
                <FaCheckCircle /> SAVE & PUBLISH LIVE STATS
              </button>
            </div>
          </form>
        )}

        {/* ================= CATEGORY: HOMEPAGE CMS BUILDER ONLY ================= */}
        {activeTab === 'hero_cms' && (
          <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* Header banner */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderLeft: '5px solid #1E40AF', padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <span style={{ backgroundColor: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE', padding: '5px 14px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>Homepage Builder</span>
                <h2 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", fontSize: '1.65rem', fontWeight: 700, color: '#0F172A', margin: '10px 0 6px 0', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Homepage Builder Studio</h2>
                <p style={{ color: '#64748B', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>Configure the Hero section backgrounds, headings, tags and promotional layouts.</p>
              </div>
              <button type="submit" style={{ padding: '14px 32px', backgroundColor: '#1E40AF', color: '#FFFFFF', border: 'none', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                <FaCheckCircle /> Save & Apply Hero Customizations
              </button>
            </div>

            {/* 2. RIGHT SIDE VISUAL MEDIA SETUP */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '32px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px' }}>
                <div style={{ width: '42px', height: '42px', border: '1px solid #1E40AF', backgroundColor: '#EFF6FF', color: '#1E40AF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                  <FaVideo />
                </div>
                <div>
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', letterSpacing: '0.05em' }}>RIGHT-SIDE HERO MEDIA DISPLAY</h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748B' }}>Choose whether to display a high-resolution photo or an engaging video loop on the right side of the Hero banner.</p>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", fontWeight: 700, fontSize: '0.85rem', marginBottom: '12px', color: '#1E40AF', letterSpacing: '0.08em', textTransform: 'uppercase' }}>SELECT MEDIA DISPLAY TYPE</label>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <label
                    onClick={() => setSettingsForm({ ...settingsForm, heroMediaType: 'image' })}
                    style={{
                      flex: 1, padding: '22px', border: settingsForm.heroMediaType !== 'video' ? '2px solid #1E40AF' : '1px solid #E2E8F0',
                      backgroundColor: settingsForm.heroMediaType !== 'video' ? '#EFF6FF' : '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.2s'
                    }}
                  >
                    <input type="radio" checked={settingsForm.heroMediaType !== 'video'} onChange={() => setSettingsForm({ ...settingsForm, heroMediaType: 'image' })} style={{ accentColor: '#1E40AF' }} />
                    <div>
                      <div style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", fontWeight: 700, fontSize: '1.05rem', color: '#0F172A' }}>📷 STATIC PHOTO / IMAGE</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '4px', lineHeight: 1.5 }}>Displays a crisp luxury architectural or property image with hover effect.</div>
                    </div>
                  </label>

                  <label
                    onClick={() => setSettingsForm({ ...settingsForm, heroMediaType: 'video' })}
                    style={{
                      flex: 1, padding: '22px', border: settingsForm.heroMediaType === 'video' ? '2px solid #1E40AF' : '1px solid #E2E8F0',
                      backgroundColor: settingsForm.heroMediaType === 'video' ? '#EFF6FF' : '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.2s'
                    }}
                  >
                    <input type="radio" checked={settingsForm.heroMediaType === 'video'} onChange={() => setSettingsForm({ ...settingsForm, heroMediaType: 'video' })} style={{ accentColor: '#1E40AF' }} />
                    <div>
                      <div style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", fontWeight: 700, fontSize: '1.05rem', color: '#0F172A' }}>🎬 AUTOPLAY VIDEO LOOP</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '4px', lineHeight: 1.5 }}>Streams a dynamic architectural video loop on the right column.</div>
                    </div>
                  </label>
                </div>
              </div>

              {settingsForm.heroMediaType !== 'video' ? (
                <div style={{ backgroundColor: '#F8FAFC', padding: '24px', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '12px', color: '#0F172A', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", letterSpacing: '0.05em' }}>HERO BACKGROUND PHOTO</label>
                  
                  {settingsForm.heroBgUrl && (
                    <div style={{ width: '100%', height: '180px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#E2E8F0', position: 'relative', marginBottom: '16px' }}>
                      <img src={settingsForm.heroBgUrl} alt="Hero Background" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => setSettingsForm({ ...settingsForm, heroBgUrl: '' })}
                        style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: '#EF4444', color: '#FFFFFF', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          setSettingsForm({ ...settingsForm, heroBgUrl: ev.target?.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    onClick={() => document.getElementById('hero-bg-file-input')?.click()}
                    style={{
                      border: '2px dashed #CBD5E1',
                      borderRadius: '12px',
                      padding: '24px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: '#FFFFFF',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#475569',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div>Drag & Drop or Click to Upload Hero Photo</div>
                    <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '4px' }}>PNG, JPG, or WEBP</div>
                    <input
                      id="hero-bg-file-input"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileUpload(e, (list) => { if (list[0]) setSettingsForm({ ...settingsForm, heroBgUrl: list[0] }); })}
                    />
                  </div>
                </div>
              ) : (
                <div style={{ backgroundColor: '#F8FAFC', padding: '24px', border: '1px solid #E2E8F0' }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px', color: '#0F172A', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", letterSpacing: '0.05em' }}>HERO VIDEO URL (DIRECT MP4 URL)</label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input
                      type="text"
                      value={settingsForm.heroVideoUrl || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, heroVideoUrl: e.target.value })}
                      placeholder="https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-building-exterior-41580-large.mp4"
                      style={{ flexGrow: 1, padding: '12px 16px', border: '1px solid #CBD5E1', fontSize: '0.95rem', backgroundColor: '#FFFFFF' }}
                    />
                    <label style={{ padding: '12px 24px', backgroundColor: '#1E40AF', color: '#FFFFFF', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", letterSpacing: '0.06em' }}>
                      <FaUpload /> UPLOAD VIDEO
                      <input
                        type="file"
                        accept="video/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload(e, (list) => { if (list[0]) setSettingsForm({ ...settingsForm, heroVideoUrl: list[0] }); })}
                      />
                    </label>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>QUICK VIDEO PRESETS:</span>
                    <button type="button" onClick={() => setSettingsForm({ ...settingsForm, heroVideoUrl: "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-building-exterior-41580-large.mp4" })} style={{ padding: '6px 12px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', color: '#1E40AF' }}>Apartment Exterior</button>
                    <button type="button" onClick={() => setSettingsForm({ ...settingsForm, heroVideoUrl: "https://assets.mixkit.co/videos/preview/mixkit-living-room-with-modern-decor-41575-large.mp4" })} style={{ padding: '6px 12px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', color: '#1E40AF' }}>Luxury Interior</button>
                    <button type="button" onClick={() => setSettingsForm({ ...settingsForm, heroVideoUrl: "https://assets.mixkit.co/videos/preview/mixkit-business-people-meeting-in-a-conference-room-42867-large.mp4" })} style={{ padding: '6px 12px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', color: '#1E40AF' }}>Enterprise Acquisitions</button>
                  </div>
                </div>
              )}
            </div>

            {/* 2. TYPOGRAPHY & CONTENT MATTER */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '32px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px' }}>
                <div style={{ width: '42px', height: '42px', border: '1px solid #1E40AF', backgroundColor: '#EFF6FF', color: '#1E40AF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                  <FaEdit />
                </div>
                <div>
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', letterSpacing: '0.05em' }}>CONTENT MATTER & HEADINGS</h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748B' }}>Customize the headline and description matter displayed on the left column of the Hero banner.</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px', color: '#334155', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>MAIN HERO HEADING TEXT</label>
                  <input
                    type="text"
                    value={settingsForm.heroTitle}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroTitle: e.target.value })}
                    placeholder="Your Next Opportunity"
                    style={{ width: '100%', padding: '12px 16px', border: '1px solid #E2E8F0', fontSize: '1rem', fontWeight: 600 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px', color: '#1E40AF', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>HIGHLIGHTED ACCENT WORDS</label>
                  <input
                    type="text"
                    value={settingsForm.heroHighlightText || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroHighlightText: e.target.value })}
                    placeholder="One Click Away"
                    style={{ width: '100%', padding: '12px 16px', border: '2px solid #1E40AF', fontSize: '1rem', fontWeight: 700, color: '#1E40AF' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px', color: '#334155', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>HERO SUBTITLE & DESCRIPTION MATTER</label>
                <textarea
                  rows={3}
                  value={settingsForm.heroSubtitle}
                  onChange={(e) => setSettingsForm({ ...settingsForm, heroSubtitle: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid #E2E8F0', fontSize: '0.95rem', lineHeight: 1.6 }}
                />
              </div>
            </div>

            {/* 3. INTERACTIVE SEARCH & POPULAR TAGS */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '32px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px' }}>
                <div style={{ width: '42px', height: '42px', border: '1px solid #1E40AF', backgroundColor: '#EFF6FF', color: '#1E40AF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                  <FaSearch />
                </div>
                <div>
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', letterSpacing: '0.05em' }}>SEARCH ENGINE & POPULAR TAGS</h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748B' }}>Add or remove quick-click search tags below the search bar to guide user discovery.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <input
                  type="text"
                  placeholder="Add new popular search tag (e.g. Penthouse, 3 BHK, Franchise, Commercial)"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  style={{ flexGrow: 1, padding: '12px 16px', border: '1px solid #E2E8F0', fontSize: '0.95rem' }}
                />
                <button
                  type="button"
                  onClick={handleAddPopularTag}
                  style={{ padding: '12px 24px', backgroundColor: '#1E40AF', color: '#FFFFFF', border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", letterSpacing: '0.06em' }}
                >
                  + ADD SEARCH TAG
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', backgroundColor: '#F8FAFC', padding: '18px', border: '1px solid #E2E8F0' }}>
                {(settingsForm.heroPopularTags || ['Apartment', 'Villa', 'Franchise', 'Commercial Property']).map((tag) => (
                  <div key={tag} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FFFFFF', border: '1px solid #1E40AF', color: '#1E40AF', padding: '6px 14px', fontSize: '0.85rem', fontWeight: 700 }}>
                    <span>🏷️ {tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePopularTag(tag)}
                      style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', fontWeight: 800, fontSize: '1rem', padding: '0 2px' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. TRUST BADGES & METRICS */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '32px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px' }}>
                <div style={{ width: '42px', height: '42px', border: '1px solid #1E40AF', backgroundColor: '#EFF6FF', color: '#1E40AF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                  <FaCheckCircle />
                </div>
                <div>
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', letterSpacing: '0.05em' }}>FLOATING BADGES & LIVE METRICS</h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748B' }}>Customize the floating trust badges surrounding the right column media.</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px', color: '#334155', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>HAPPY CUSTOMERS COUNT</label>
                  <input
                    type="number"
                    value={settingsForm.analytics.happyClients}
                    onChange={(e) => setSettingsForm({ ...settingsForm, analytics: { ...settingsForm.analytics, happyClients: Number(e.target.value) } })}
                    style={{ width: '100%', padding: '12px', border: '1px solid #E2E8F0', fontSize: '1rem', fontWeight: 700 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px', color: '#334155', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>LEFT ACTION BADGE LABEL</label>
                  <input
                    type="text"
                    value={settingsForm.heroBadge1Text || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroBadge1Text: e.target.value })}
                    placeholder="View More Pics"
                    style={{ width: '100%', padding: '12px', border: '1px solid #E2E8F0', fontSize: '0.95rem', fontWeight: 600 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px', color: '#334155', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>RIGHT VERIFIED BADGE LABEL</label>
                  <input
                    type="text"
                    value={settingsForm.heroBadge2Text || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroBadge2Text: e.target.value })}
                    placeholder="Verified Genuine Listings"
                    style={{ width: '100%', padding: '12px', border: '1px solid #E2E8F0', fontSize: '0.95rem', fontWeight: 600 }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" style={{ padding: '16px 36px', backgroundColor: '#1E40AF', color: '#FFFFFF', border: 'none', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", letterSpacing: '0.08em' }}>
                <FaCheckCircle /> SAVE & APPLY HERO CUSTOMIZATIONS
              </button>
            </div>
          </form>
        )}

        {/* ================= CATEGORY 3: PROPERTY MANAGEMENT SYSTEM ================= */}
        {activeTab === 'properties' && (
          <PropertyManagementSystem showNotification={showNotification} activeSubTab={propertySubTab} onSubTabChange={setPropertySubTab} />
        )}


        {/* ================= CATEGORY 4: FRANCHISES MANAGEMENT ================= */}
        {activeTab === 'franchises' && (
          <FranchiseManagementSystem showNotification={showNotification} activeSubTab={franchiseSubTab} onSubTabChange={setFranchiseSubTab} mode="franchise" />
        )}

        {/* ================= CATEGORY 4.2: BUSINESS MANAGEMENT ================= */}
        {activeTab === 'businesses' && (
          <FranchiseManagementSystem showNotification={showNotification} activeSubTab={businessSubTab} onSubTabChange={setBusinessSubTab} mode="business" />
        )}

        {/* ================= CATEGORY 4.3: DEMAND REGIONS ================= */}
        {activeTab === 'demand_regions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
            
            {/* Dashboard Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #F1F5F9', boxShadow: '0 2px 8px -2px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.5rem', marginBottom: '8px' }}>🟢</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>HIGH DEMAND REGIONS</div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                  {demandRegionsDb.filter(r => r.demandLevel === 'High').length}
                </div>
              </div>
              <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #F1F5F9', boxShadow: '0 2px 8px -2px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.5rem', marginBottom: '8px' }}>🟡</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>MEDIUM DEMAND REGIONS</div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                  {demandRegionsDb.filter(r => r.demandLevel === 'Medium').length}
                </div>
              </div>
              <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #F1F5F9', boxShadow: '0 2px 8px -2px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.5rem', marginBottom: '8px' }}>🔴</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>LOW DEMAND REGIONS</div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                  {demandRegionsDb.filter(r => r.demandLevel === 'Low').length}
                </div>
              </div>
              <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #F1F5F9', boxShadow: '0 2px 8px -2px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.5rem', marginBottom: '8px' }}>📍</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>TOTAL DEMAND ZONES</div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                  {demandRegionsDb.length}
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '16px 20px', borderRadius: '16px', border: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => {
                    recalculateAllDemandRegions();
                    showNotification("AI calculations updated for all regions!", "success");
                  }}
                  style={{ padding: '10px 18px', backgroundColor: '#1E3A8A', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  🔄 AI Refresh Calculations
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  const name = prompt("Enter Region Name (e.g. Jubilee Hills):");
                  if (!name) return;
                  const city = prompt("Enter City:");
                  if (!city) return;
                  const state = prompt("Enter State:");
                  if (!state) return;
                  const lat = prompt("Enter Latitude:", "17.43");
                  if (!lat) return;
                  const lng = prompt("Enter Longitude:", "78.40");
                  if (!lng) return;
                  const radius = prompt("Enter Radius (1, 2, 5, 10):", "5");
                  if (!radius) return;
                  
                  addDemandRegion({
                    name,
                    city,
                    state,
                    latitude: Number(lat),
                    longitude: Number(lng),
                    radius: Number(radius),
                    isAiEnabled: true
                  });
                  showNotification("New demand region added successfully!", "success");
                }}
                style={{ padding: '10px 18px', backgroundColor: '#16A34A', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                ➕ Add New Region
              </button>
            </div>

            {/* Demand Table */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '14px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>REGION NAME</th>
                    <th style={{ padding: '14px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>CITY / STATE</th>
                    <th style={{ padding: '14px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>RADIUS</th>
                    <th style={{ padding: '14px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>SALES (PROP / FRAN / BUS)</th>
                    <th style={{ padding: '14px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>DEMAND SCORE</th>
                    <th style={{ padding: '14px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>DEMAND LEVEL</th>
                    <th style={{ padding: '14px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>AI CALC</th>
                    <th style={{ padding: '14px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>LAST UPDATED</th>
                    <th style={{ padding: '14px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {demandRegionsDb.map(region => (
                    <tr key={region.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '14px 16px', fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }}>{region.name}</td>
                      <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#475569' }}>{region.city}, {region.state}</td>
                      <td style={{ padding: '14px 16px', fontSize: '0.85rem', fontWeight: 600, color: '#0F172A' }}>{region.radius} KM</td>
                      <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#475569' }}>
                        🏡 {region.propertySalesCount} • 🏪 {region.franchiseSalesCount} • 💼 {region.businessSalesCount}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>{region.demandScore}/100</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '4px 10px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 800,
                          backgroundColor: region.demandLevel === 'High' ? '#DCFCE7' : region.demandLevel === 'Medium' ? '#FEF9C3' : '#FEE2E2',
                          color: region.demandLevel === 'High' ? '#16A34A' : region.demandLevel === 'Medium' ? '#CA8A04' : '#EF4444'
                        }}>
                          {region.demandLevel.toUpperCase()} DEMAND
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: region.isAiEnabled ? '#16A34A' : '#DC2626' }}>
                          {region.isAiEnabled ? 'ON' : 'OFF'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.8rem', color: '#64748B' }}>{region.lastUpdated}</td>
                      <td style={{ padding: '14px 16px', display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            const newRadius = prompt("Enter new radius (1, 2, 5, 10 KM):", String(region.radius));
                            if (newRadius) {
                              updateDemandRegion(region.id, { radius: Number(newRadius) });
                              showNotification("Radius updated successfully!", "success");
                            }
                          }}
                          style={{ padding: '4px 8px', fontSize: '0.75rem', backgroundColor: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE', borderRadius: '4px', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                        >
                          Radius
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const override = confirm("Toggle AI calculation (Cancel = Disable AI & set manually)");
                            if (override) {
                              updateDemandRegion(region.id, { isAiEnabled: true, manualOverrideLevel: null });
                              showNotification("AI Calculation enabled.", "success");
                            } else {
                              const manualLevel = prompt("Enter Level (High, Medium, Low):", region.demandLevel);
                              if (manualLevel === 'High' || manualLevel === 'Medium' || manualLevel === 'Low') {
                                updateDemandRegion(region.id, { isAiEnabled: false, manualOverrideLevel: manualLevel });
                                showNotification("Manual override set to " + manualLevel, "success");
                              }
                            }
                          }}
                          style={{ padding: '4px 8px', fontSize: '0.75rem', backgroundColor: '#F8FAFC', color: '#475569', border: '1px solid #E2E8F0', borderRadius: '4px', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                        >
                          Override
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm("Delete demand region?")) {
                              deleteDemandRegion(region.id);
                              showNotification("Demand region deleted.", "warning");
                            }
                          }}
                          style={{ padding: '4px 8px', fontSize: '0.75rem', backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FCA5A5', borderRadius: '4px', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ================= CATEGORY 4.5: BROKER MANAGEMENT SYSTEM ================= */}
        {activeTab === 'brokers' && (
          <BrokerManagementSystem showNotification={showNotification} activeSubTab={brokerSubTab} onSubTabChange={setBrokerSubTab} />
        )}

        {/* ================= CATEGORY 5: CONTACT INQUIRIES ================= */}
        {activeTab === 'inquiries' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {enquiriesDb.length === 0 ? (
              <div style={{ backgroundColor: '#FFFFFF', padding: '60px', textAlign: 'center', border: '1px solid #E2E8F0', color: '#64748B', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", fontSize: '1.1rem', fontWeight: 700 }}>
                NO CUSTOMER INQUIRIES RECEIVED YET.
              </div>
            ) : (
              enquiriesDb.map(enq => (
                <div key={enq.id} style={{ backgroundColor: '#FFFFFF', padding: '20px 24px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                      <h4 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', letterSpacing: '0.03em' }}>{enq.customerName}</h4>
                      <span style={{ padding: '2px 10px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: enq.status === 'New' ? '#FEE2E2' : '#EFF6FF', color: enq.status === 'New' ? '#DC2626' : '#1E40AF', border: enq.status === 'New' ? '1px solid #FECACA' : '1px solid #BFDBFE', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>{enq.status.toUpperCase()}</span>
                      <span style={{ color: '#94A3B8', fontSize: '0.85rem' }}>{enq.date}</span>
                    </div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: '#475569' }}>Inquired about: <strong style={{ color: '#0F172A' }}>{enq.listingTitle}</strong></p>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>📞 {enq.phone} • ✉️ {enq.email}</p>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <select
                      value={enq.status}
                      onChange={e => updateEnquiryStatus(enq.id, e.target.value as any)}
                      style={{ padding: '8px 14px', border: '1px solid #E2E8F0', fontWeight: 700, fontSize: '0.85rem', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}
                    >
                      <option value="New">STATUS: NEW</option>
                      <option value="Contacted">STATUS: CONTACTED</option>
                      <option value="Follow-up">STATUS: FOLLOW-UP</option>
                      <option value="Closed">STATUS: CLOSED</option>
                    </select>
                    <button
                      onClick={() => deleteEnquiry(enq.id)}
                      style={{ padding: '8px 14px', backgroundColor: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA', cursor: 'pointer' }}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ backgroundColor: '#FFFFFF', padding: '28px', border: '1px solid #E2E8F0' }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", margin: '0 0 8px 0', fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', letterSpacing: '0.04em' }}>CREATE EMPLOYEE CREDENTIALS</h3>
              <p style={{ margin: '0 0 20px 0', color: '#64748B', fontSize: '0.85rem' }}>Set up admin portal access for staff members (Property Editors, Data Managers, etc.)</p>
              
              <form onSubmit={handleAddEmployee} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', marginBottom: '6px', color: '#334155', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>FULL NAME *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins"
                    value={newEmployee.fullName}
                    onChange={e => setNewEmployee({ ...newEmployee, fullName: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', border: '1px solid #CBD5E1', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', marginBottom: '6px', color: '#334155', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>USERNAME (EMAIL) *</label>
                  <input
                    type="email"
                    required
                    placeholder="sarah@nexopp.com"
                    value={newEmployee.email}
                    onChange={e => setNewEmployee({ ...newEmployee, email: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', border: '1px solid #CBD5E1', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', marginBottom: '6px', color: '#334155', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>PASSWORD *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNewEmpPassword ? 'text' : 'password'}
                      required
                      placeholder="Secure password"
                      value={newEmployee.password}
                      onChange={e => setNewEmployee({ ...newEmployee, password: e.target.value })}
                      style={{ width: '100%', padding: '12px 40px 12px 14px', border: '1px solid #CBD5E1', outline: 'none', boxSizing: 'border-box', borderRadius: '4px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewEmpPassword(!showNewEmpPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#64748B',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px',
                        fontSize: '1rem'
                      }}
                      title={showNewEmpPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewEmpPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', marginBottom: '6px', color: '#334155', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>ASSIGN ROLE *</label>
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    placeholder="Enter Role Name (e.g. Sales Executive, Property Editor, Manager)"
                    value={newEmployee.role}
                    onChange={e => setNewEmployee({ ...newEmployee, role: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      border: '1px solid #CBD5E1',
                      outline: 'none',
                      boxSizing: 'border-box',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      fontWeight: 600,
                      color: '#0F172A'
                    }}
                  />
                  <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block', marginTop: '4px', fontWeight: 500 }}>
                    Type any role name manually to assign
                  </span>
                </div>
                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <button
                    type="submit"
                    style={{ padding: '14px 28px', backgroundColor: '#10B981', color: '#FFFFFF', border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', letterSpacing: '0.04em', borderRadius: '8px' }}
                  >
                    <FaCheckCircle /> GENERATE CREDENTIALS
                  </button>
                </div>
              </form>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', padding: '28px', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", margin: '0 0 20px 0', fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', letterSpacing: '0.04em' }}>REGISTERED EMPLOYEES & CREDENTIALS ({employeeUsersDb.length})</h3>
              
              {employeeUsersDb.length === 0 ? (
                <p style={{ color: '#64748B', fontStyle: 'italic' }}>No employee accounts created yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {employeeUsersDb.map((emp) => (
                    <div key={emp.id} style={{ border: '1px solid #E2E8F0', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <h4 style={{ margin: 0, color: '#0F172A', fontSize: '1.1rem', fontWeight: 800 }}>{emp.fullName}</h4>
                          <span style={{ backgroundColor: '#DBEAFE', color: '#1E40AF', padding: '4px 12px', borderRadius: '6px', fontWeight: 800, fontSize: '0.78rem' }}>{emp.role}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#475569', fontSize: '0.85rem', fontWeight: 500 }}>
                          <span><strong>Username:</strong> {emp.email}</span>
                          <span>•</span>
                          <span><strong>Password:</strong> <code style={{ backgroundColor: '#E2E8F0', padding: '2px 8px', borderRadius: '4px', color: '#0F172A', fontFamily: 'monospace' }}>{emp.password}</code></span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteEmployee(emp.id, emp.fullName)}
                        style={{ backgroundColor: '#FEE2E2', color: '#DC2626', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.85rem' }}
                      >
                        <FaTrash /> REVOKE ACCESS
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'roles' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            
            {/* Neat & Classy White Header Card */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', padding: '28px 32px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px -4px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span style={{ backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', color: '#0F172A', padding: '4px 12px', borderRadius: '6px', fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  ROLE & PERMISSION CONTROL
                </span>
                <span style={{ backgroundColor: '#DCFCE7', color: '#15803D', padding: '4px 12px', borderRadius: '6px', fontWeight: 700, fontSize: '0.75rem' }}>
                  REAL-TIME PORTAL SYNC
                </span>
              </div>

              <h2 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", margin: '0 0 8px 0', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0F172A' }}>
                User Access Control & Sub-Option Manager
              </h2>
              <p style={{ margin: 0, color: '#64748B', fontSize: '0.92rem', maxWidth: '750px', lineHeight: 1.5 }}>
                Configure exact module visibility and granular feature sub-options per employee user. When saved, only selected options will appear in their portal.
              </p>
            </div>

            {/* Direct User Permission Assignment Suite */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '28px', border: '1px solid #E2E8F0', borderRadius: '14px', boxShadow: '0 4px 16px -4px rgba(0,0,0,0.03)' }}>
              
              {/* Step 1: Select Employee Header */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
                <div style={{ maxWidth: '520px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '0.82rem', marginBottom: '8px', color: '#0F172A', letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>
                    <FaUserShield style={{ color: '#2563EB' }} /> SELECT EMPLOYEE USER *
                  </label>
                  <select
                    value={selectedUserForPerms}
                    onChange={(e) => handleSelectUserForPerms(e.target.value)}
                    style={{ width: '100%', padding: '14px 16px', border: '1.5px solid #CBD5E1', borderRadius: '10px', outline: 'none', backgroundColor: '#FFFFFF', fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', transition: 'all 0.2s', cursor: 'pointer' }}
                  >
                    <option value="">-- Choose an Employee User --</option>
                    {employeeUsersDb.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.fullName} ({emp.email}) - {emp.role}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedUserForPerms && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', padding: '20px 24px', borderRadius: '12px' }}>
                    
                    {/* Active Employee Header Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#0F172A', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem' }}>
                          {employeeUsersDb.find(u => u.id === selectedUserForPerms)?.fullName.substring(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                              {employeeUsersDb.find(u => u.id === selectedUserForPerms)?.fullName}
                            </h3>
                            <span style={{ backgroundColor: '#E0F2FE', color: '#0369A1', padding: '4px 12px', borderRadius: '6px', fontWeight: 800, fontSize: '0.78rem' }}>
                              {employeeUsersDb.find(u => u.id === selectedUserForPerms)?.role}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 500, marginTop: '2px' }}>
                            {employeeUsersDb.find(u => u.id === selectedUserForPerms)?.email}
                          </div>
                        </div>
                      </div>

                      {/* Floating Save Action Button */}
                      <button
                        type="button"
                        onClick={handleSaveUserPermissions}
                        disabled={isSavingUserPerms}
                        style={{
                          padding: '12px 28px',
                          backgroundColor: savedUserSuccess ? '#059669' : (isSavingUserPerms ? '#6EE7B7' : '#10B981'),
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: 800,
                          fontSize: '0.9rem',
                          cursor: isSavingUserPerms ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          boxShadow: '0 4px 12px rgba(16,185,129,0.25)',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          transform: isSavingUserPerms ? 'scale(0.96)' : (savedUserSuccess ? 'scale(1.02)' : 'scale(1)'),
                          letterSpacing: '0.02em'
                        }}
                      >
                        {isSavingUserPerms ? (
                          <>SAVING PERMISSIONS...</>
                        ) : savedUserSuccess ? (
                          <><FaCheckCircle /> SAVED & SYNCED TO PORTAL!</>
                        ) : (
                          <><FaCheckCircle /> SAVE PERMISSIONS FOR THIS USER</>
                        )}
                      </button>
                    </div>

                    {savedUserSuccess && (
                      <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #10B981', color: '#065F46', padding: '12px 18px', borderRadius: '8px', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaCheckCircle style={{ color: '#10B981', fontSize: '1.2rem' }} />
                        {savedUserSuccess}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {selectedUserForPerms && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', borderTop: '1px solid #E2E8F0', paddingTop: '24px' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      MODULE ACCESSIBILITY & FEATURE SUB-OPTIONS
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#15803D', backgroundColor: '#DCFCE7', padding: '4px 12px', borderRadius: '6px', border: '1px solid #A7F3D0' }}>
                      {userCustomPerms.length} Sub-Options Selected
                    </div>
                  </div>

                  {/* Sub-Permission Modules Premium Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: '20px' }}>
                    
                    {/* Module 1: Property Management */}
                    <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '10px', borderBottom: '1px solid #F1F5F9' }}>
                        <FaBuilding style={{ color: '#0D9488' }} /> Property Management
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[
                          { id: 'properties:listings', label: 'All Properties List' },
                          { id: 'properties:editProperty', label: 'Add & Edit Property' },
                          { id: 'properties:featured', label: 'Featured & Premium Properties' },
                          { id: 'properties:analytics', label: 'Property Analytics & Stats' },
                          { id: 'properties:categories', label: 'Categories & Subtypes' },
                          { id: 'properties:locations', label: 'Location Intelligence' },
                          { id: 'properties:soldOut', label: 'Sold Out Properties' },
                          { id: 'properties:reports', label: 'Reports & Export' },
                        ].map(item => {
                          const isChecked = userCustomPerms.includes('properties') || userCustomPerms.includes('all') || userCustomPerms.includes(item.id);
                          return (
                            <div
                              key={item.id}
                              onClick={() => {
                                if (isChecked) {
                                  setUserCustomPerms(userCustomPerms.filter(p => p !== item.id && p !== 'properties' && p !== 'all'));
                                } else {
                                  setUserCustomPerms([...userCustomPerms, item.id]);
                                }
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '10px 14px',
                                border: isChecked ? '1.5px solid #10B981' : '1px solid #E2E8F0',
                                backgroundColor: isChecked ? '#F0FDF4' : '#FFFFFF',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.15s'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '18px', height: '18px', borderRadius: '4px', backgroundColor: isChecked ? '#10B981' : '#FFFFFF', border: isChecked ? 'none' : '1.5px solid #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontSize: '0.7rem', fontWeight: 800 }}>
                                  {isChecked && '✓'}
                                </div>
                                <span style={{ fontSize: '0.85rem', fontWeight: isChecked ? 700 : 500, color: isChecked ? '#065F46' : '#334155' }}>
                                  {item.label}
                                </span>
                              </div>
                              <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', backgroundColor: isChecked ? '#DCFCE7' : '#F1F5F9', color: isChecked ? '#15803D' : '#64748B' }}>
                                {isChecked ? 'Granted' : 'Restricted'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Module 2: Franchise Management */}
                    <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '10px', borderBottom: '1px solid #F1F5F9' }}>
                        <FaStore style={{ color: '#2563EB' }} /> Franchise Management
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[
                          { id: 'franchises:listings', label: 'All Franchises List' },
                          { id: 'franchises:editProperty', label: 'Add & Edit Franchise' },
                          { id: 'franchises:featured', label: 'Featured & Premium Franchises' },
                          { id: 'franchises:analytics', label: 'Franchise Analytics' },
                          { id: 'franchises:categories', label: 'Categories & Sectors' },
                          { id: 'franchises:locations', label: 'Location Intelligence' },
                          { id: 'franchises:soldOut', label: 'Sold Out Franchises' },
                          { id: 'franchises:reports', label: 'Reports & Export' },
                        ].map(item => {
                          const isChecked = userCustomPerms.includes('franchises') || userCustomPerms.includes('all') || userCustomPerms.includes(item.id);
                          return (
                            <div
                              key={item.id}
                              onClick={() => {
                                if (isChecked) {
                                  setUserCustomPerms(userCustomPerms.filter(p => p !== item.id && p !== 'franchises' && p !== 'all'));
                                } else {
                                  setUserCustomPerms([...userCustomPerms, item.id]);
                                }
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '10px 14px',
                                border: isChecked ? '1.5px solid #10B981' : '1px solid #E2E8F0',
                                backgroundColor: isChecked ? '#F0FDF4' : '#FFFFFF',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.15s'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '18px', height: '18px', borderRadius: '4px', backgroundColor: isChecked ? '#10B981' : '#FFFFFF', border: isChecked ? 'none' : '1.5px solid #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontSize: '0.7rem', fontWeight: 800 }}>
                                  {isChecked && '✓'}
                                </div>
                                <span style={{ fontSize: '0.85rem', fontWeight: isChecked ? 700 : 500, color: isChecked ? '#065F46' : '#334155' }}>
                                  {item.label}
                                </span>
                              </div>
                              <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', backgroundColor: isChecked ? '#DCFCE7' : '#F1F5F9', color: isChecked ? '#15803D' : '#64748B' }}>
                                {isChecked ? 'Granted' : 'Restricted'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Module 3: Business Management */}
                    <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '10px', borderBottom: '1px solid #F1F5F9' }}>
                        <FaBriefcase style={{ color: '#7C3AED' }} /> Business Management
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[
                          { id: 'businesses:listings', label: 'All Businesses List' },
                          { id: 'businesses:editProperty', label: 'Add & Edit Business' },
                          { id: 'businesses:featured', label: 'Featured & Premium Businesses' },
                          { id: 'businesses:analytics', label: 'Business Analytics' },
                          { id: 'businesses:categories', label: 'Categories & Industries' },
                          { id: 'businesses:locations', label: 'Location Intelligence' },
                          { id: 'businesses:soldOut', label: 'Sold Out Businesses' },
                          { id: 'businesses:reports', label: 'Reports & Export' },
                        ].map(item => {
                          const isChecked = userCustomPerms.includes('businesses') || userCustomPerms.includes('all') || userCustomPerms.includes(item.id);
                          return (
                            <div
                              key={item.id}
                              onClick={() => {
                                if (isChecked) {
                                  setUserCustomPerms(userCustomPerms.filter(p => p !== item.id && p !== 'businesses' && p !== 'all'));
                                } else {
                                  setUserCustomPerms([...userCustomPerms, item.id]);
                                }
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '10px 14px',
                                border: isChecked ? '1.5px solid #10B981' : '1px solid #E2E8F0',
                                backgroundColor: isChecked ? '#F0FDF4' : '#FFFFFF',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.15s'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '18px', height: '18px', borderRadius: '4px', backgroundColor: isChecked ? '#10B981' : '#FFFFFF', border: isChecked ? 'none' : '1.5px solid #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontSize: '0.7rem', fontWeight: 800 }}>
                                  {isChecked && '✓'}
                                </div>
                                <span style={{ fontSize: '0.85rem', fontWeight: isChecked ? 700 : 500, color: isChecked ? '#065F46' : '#334155' }}>
                                  {item.label}
                                </span>
                              </div>
                              <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', backgroundColor: isChecked ? '#DCFCE7' : '#F1F5F9', color: isChecked ? '#15803D' : '#64748B' }}>
                                {isChecked ? 'Granted' : 'Restricted'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Module 4: Broker Management */}
                    <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '10px', borderBottom: '1px solid #F1F5F9' }}>
                        <FaUsers style={{ color: '#D97706' }} /> Broker Management
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[
                          { id: 'brokers:directory', label: 'Broker Directory' },
                          { id: 'brokers:leaderboard', label: 'Top Leaderboard' },
                          { id: 'brokers:premium', label: 'Premium Brokers' },
                          { id: 'brokers:category_rank', label: 'Category Rankings' },
                          { id: 'brokers:location_rank', label: 'Location Rankings' },
                          { id: 'brokers:analytics', label: 'Broker Analytics' },
                        ].map(item => {
                          const isChecked = userCustomPerms.includes('brokers') || userCustomPerms.includes('all') || userCustomPerms.includes(item.id);
                          return (
                            <div
                              key={item.id}
                              onClick={() => {
                                if (isChecked) {
                                  setUserCustomPerms(userCustomPerms.filter(p => p !== item.id && p !== 'brokers' && p !== 'all'));
                                } else {
                                  setUserCustomPerms([...userCustomPerms, item.id]);
                                }
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '10px 14px',
                                border: isChecked ? '1.5px solid #10B981' : '1px solid #E2E8F0',
                                backgroundColor: isChecked ? '#F0FDF4' : '#FFFFFF',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.15s'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '18px', height: '18px', borderRadius: '4px', backgroundColor: isChecked ? '#10B981' : '#FFFFFF', border: isChecked ? 'none' : '1.5px solid #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontSize: '0.7rem', fontWeight: 800 }}>
                                  {isChecked && '✓'}
                                </div>
                                <span style={{ fontSize: '0.85rem', fontWeight: isChecked ? 700 : 500, color: isChecked ? '#065F46' : '#334155' }}>
                                  {item.label}
                                </span>
                              </div>
                              <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', backgroundColor: isChecked ? '#DCFCE7' : '#F1F5F9', color: isChecked ? '#15803D' : '#64748B' }}>
                                {isChecked ? 'Granted' : 'Restricted'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Module 5: Site Management & CMS */}
                    <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '10px', borderBottom: '1px solid #F1F5F9' }}>
                        <FaCog style={{ color: '#475569' }} /> Site Settings & CMS
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[
                          { id: 'demand_regions', label: 'Demand Regions' },
                          { id: 'users', label: 'User & Staff Management' },
                          { id: 'media_manager', label: 'Media Manager & Videos' },
                          { id: 'site_settings', label: 'Website Settings & CMS' },
                        ].map(item => {
                          const isChecked = userCustomPerms.includes(item.id) || userCustomPerms.includes('all');
                          return (
                            <div
                              key={item.id}
                              onClick={() => {
                                if (isChecked) {
                                  setUserCustomPerms(userCustomPerms.filter(p => p !== item.id && p !== 'all'));
                                } else {
                                  setUserCustomPerms([...userCustomPerms, item.id]);
                                }
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '10px 14px',
                                border: isChecked ? '1.5px solid #10B981' : '1px solid #E2E8F0',
                                backgroundColor: isChecked ? '#F0FDF4' : '#FFFFFF',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.15s'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '18px', height: '18px', borderRadius: '4px', backgroundColor: isChecked ? '#10B981' : '#FFFFFF', border: isChecked ? 'none' : '1.5px solid #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontSize: '0.7rem', fontWeight: 800 }}>
                                  {isChecked && '✓'}
                                </div>
                                <span style={{ fontSize: '0.85rem', fontWeight: isChecked ? 700 : 500, color: isChecked ? '#065F46' : '#334155' }}>
                                  {item.label}
                                </span>
                              </div>
                              <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', backgroundColor: isChecked ? '#DCFCE7' : '#F1F5F9', color: isChecked ? '#15803D' : '#64748B' }}>
                                {isChecked ? 'Granted' : 'Restricted'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>

            {/* Permitted Employees Directory Card */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '28px', border: '1px solid #E2E8F0', borderRadius: '14px', boxShadow: '0 4px 16px -4px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaUserShield style={{ color: '#059669' }} /> EMPLOYEE PERMISSIONS SUMMARY ({employeeUsersDb.length})
                </h3>
              </div>
              <p style={{ margin: '0 0 20px 0', color: '#64748B', fontSize: '0.88rem' }}>
                Overview of all registered staff accounts and their configured access permissions across the system.
              </p>

              {employeeUsersDb.length === 0 ? (
                <div style={{ padding: '24px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', textAlign: 'center', color: '#64748B', fontStyle: 'italic' }}>
                  No employee accounts added yet. Create employees in the <strong style={{ color: '#0F172A' }}>User Management</strong> tab first!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {employeeUsersDb.map(emp => {
                    const customPerms = emp.customPermissions || [];
                    const roleData = rolesDb.find(r => r.name === emp.role);
                    const activePerms = customPerms.length > 0 ? customPerms : (roleData ? roleData.permissions : []);
                    const isSelected = selectedUserForPerms === emp.id;

                    return (
                      <div
                        key={emp.id}
                        style={{
                          border: isSelected ? '1.5px solid #10B981' : '1px solid #E2E8F0',
                          backgroundColor: isSelected ? '#F0FDF4' : '#F8FAFC',
                          borderRadius: '10px',
                          padding: '18px 22px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#0F172A', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem' }}>
                              {emp.fullName.substring(0, 1).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <h4 style={{ margin: 0, color: '#0F172A', fontSize: '1.05rem', fontWeight: 800 }}>{emp.fullName}</h4>
                                <span style={{ backgroundColor: '#E0F2FE', color: '#0369A1', padding: '2px 10px', borderRadius: '4px', fontWeight: 800, fontSize: '0.75rem' }}>{emp.role}</span>
                              </div>
                              <div style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 500, marginTop: '2px' }}>
                                {emp.email}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              handleSelectUserForPerms(emp.id);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            style={{
                              padding: '10px 18px',
                              backgroundColor: isSelected ? '#10B981' : '#FFFFFF',
                              color: isSelected ? '#FFFFFF' : '#0F172A',
                              border: isSelected ? 'none' : '1px solid #CBD5E1',
                              borderRadius: '6px',
                              fontWeight: 800,
                              fontSize: '0.82rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              transition: 'all 0.2s'
                            }}
                          >
                            <FaEdit /> {isSelected ? 'CONFIGURING NOW' : 'EDIT ACCESS'}
                          </button>
                        </div>

                        {/* Permission Badges Summary */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingTop: '10px', borderTop: '1px solid #E2E8F0' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', marginRight: '4px' }}>
                            Granted Sub-Permissions:
                          </span>
                          {activePerms.length === 0 ? (
                            <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontStyle: 'italic' }}>No active permissions assigned</span>
                          ) : (
                            activePerms.map(p => {
                              const labelMap: Record<string, string> = {
                                'all': 'Full System Access',
                                'properties': 'All Property Modules',
                                'properties:listings': 'Property List',
                                'properties:editProperty': 'Add & Edit Property',
                                'properties:featured': 'Featured Properties',
                                'properties:analytics': 'Property Analytics',
                                'properties:categories': 'Property Categories',
                                'properties:locations': 'Property Locations',
                                'properties:soldOut': 'Sold Out Properties',
                                'properties:reports': 'Property Reports',
                                'franchises': 'All Franchise Modules',
                                'franchises:listings': 'Franchise List',
                                'franchises:editProperty': 'Add & Edit Franchise',
                                'franchises:featured': 'Featured Franchises',
                                'franchises:analytics': 'Franchise Analytics',
                                'franchises:categories': 'Franchise Categories',
                                'franchises:locations': 'Franchise Locations',
                                'franchises:soldOut': 'Sold Out Franchises',
                                'franchises:reports': 'Franchise Reports',
                                'businesses': 'All Business Modules',
                                'businesses:listings': 'Business List',
                                'businesses:editProperty': 'Add & Edit Business',
                                'businesses:featured': 'Featured Businesses',
                                'businesses:analytics': 'Business Analytics',
                                'businesses:categories': 'Business Categories',
                                'businesses:locations': 'Business Locations',
                                'businesses:soldOut': 'Sold Out Businesses',
                                'businesses:reports': 'Business Reports',
                                'brokers': 'All Broker Modules',
                                'brokers:directory': 'Broker Directory',
                                'brokers:leaderboard': 'Broker Leaderboard',
                                'brokers:premium': 'Premium Brokers',
                                'brokers:category_rank': 'Broker Rankings',
                                'brokers:location_rank': 'Broker Locations',
                                'brokers:analytics': 'Broker Analytics',
                                'users': 'User & Staff Mgt',
                                'demand_regions': 'Demand Regions',
                                'media_manager': 'Media Manager',
                                'site_settings': 'Site Settings & CMS'
                              };
                              return (
                                <span key={p} style={{ backgroundColor: '#DCFCE7', color: '#15803D', border: '1px solid #A7F3D0', padding: '3px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                                  {labelMap[p] || p}
                                </span>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {activeTab === 'team' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ backgroundColor: '#FFFFFF', padding: '28px', border: '1px solid #E2E8F0' }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", margin: '0 0 8px 0', fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', letterSpacing: '0.04em' }}>ADD NEW EXECUTIVE LEADERSHIP PROFILE</h3>
              <p style={{ margin: '0 0 20px 0', color: '#64748B', fontSize: '0.85rem' }}>Profiles added here will appear dynamically on the public About Us page.</p>
              
              <form onSubmit={handleAddTeamMember} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', marginBottom: '6px', color: '#334155', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>FULL NAME *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Sharma"
                    value={newTeamMember.name}
                    onChange={e => setNewTeamMember({ ...newTeamMember, name: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', border: '1px solid #CBD5E1', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', marginBottom: '6px', color: '#334155', fontFamily: "'Playfair Display', 'Cinzel', 'Georgia', serif" }}>DESIGNATION / TITLE *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Managing Director & CEO"
                    value={newTeamMember.designation}
                    onChange={e => setNewTeamMember({ ...newTeamMember, designation: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', border: '1px solid #CBD5E1', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', marginBottom: '6px', color: '#334155', fontFamily: "'Playfair Display', 'Cinzel', 'Georgia', serif" }}>PHOTO UPLOAD *</label>
                  <div 
                    style={{ 
                      width: '100%', padding: '24px', border: '2px dashed #CBD5E1', borderRadius: '12px', textAlign: 'center', backgroundColor: '#F8FAFC', cursor: 'pointer', position: 'relative', overflow: 'hidden'
                    }}
                  >
                    {newTeamMember.photo ? (
                      <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <img src={newTeamMember.photo} alt="Preview" style={{ height: '120px', width: '120px', objectFit: 'cover', borderRadius: '50%', marginBottom: '12px', border: '3px solid #1E40AF' }} />
                        <span style={{ fontSize: '0.8rem', color: '#1E40AF', fontWeight: 600 }}>Click or Drag to change photo</span>
                      </div>
                    ) : (
                      <div style={{ padding: '20px 0' }}>
                        <span style={{ fontSize: '2rem' }}>📸</span>
                        <p style={{ margin: '12px 0 0 0', fontWeight: 600, color: '#475569' }}>Drag & Drop photo here or Click to Upload</p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: '#94A3B8' }}>JPEG, PNG up to 5MB</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setNewTeamMember({ ...newTeamMember, photo: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', marginBottom: '6px', color: '#334155', fontFamily: "'Playfair Display', 'Cinzel', 'Georgia', serif" }}>GMAIL (EMAIL) ADDRESS</label>
                  <input
                    type="email"
                    placeholder="john@gmail.com"
                    value={newTeamMember.email || ''}
                    onChange={e => setNewTeamMember({ ...newTeamMember, email: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', border: '1px solid #CBD5E1', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', marginBottom: '6px', color: '#334155', fontFamily: "'Playfair Display', 'Cinzel', 'Georgia', serif" }}>PHONE NUMBER (OPTIONAL)</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={newTeamMember.phone || ''}
                    onChange={e => setNewTeamMember({ ...newTeamMember, phone: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', border: '1px solid #CBD5E1', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', marginBottom: '6px', color: '#334155', fontFamily: "'Playfair Display', 'Cinzel', 'Georgia', serif" }}>LINKEDIN PROFILE URL (OPTIONAL)</label>
                  <input
                    type="text"
                    placeholder="https://linkedin.com/in/..."
                    value={newTeamMember.linkedin || ''}
                    onChange={e => setNewTeamMember({ ...newTeamMember, linkedin: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', border: '1px solid #CBD5E1', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <button
                    type="submit"
                    style={{ padding: '14px 24px', backgroundColor: '#1E40AF', color: '#FFFFFF', border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: "'Playfair Display', 'Cinzel', 'Georgia', serif", letterSpacing: '0.06em' }}
                  >
                    <FaPlus /> ADD LEADERSHIP PROFILE
                  </button>
                </div>
              </form>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', padding: '28px', border: '1px solid #E2E8F0' }}>
              <h3 style={{ fontFamily: "'Playfair Display', 'Cinzel', 'Georgia', serif", margin: '0 0 20px 0', fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', letterSpacing: '0.04em' }}>CURRENT LEADERSHIP PROFILES ({teamMembersDb.length})</h3>
              
              {teamMembersDb.length === 0 ? (
                <p style={{ color: '#64748B', fontStyle: 'italic' }}>No profiles added yet.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                  {teamMembersDb.map((tm) => (
                    <div key={tm.id} style={{ border: '1px solid #E2E8F0', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <img src={tm.photo || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80'} alt={tm.name} style={{ width: '64px', height: '64px', objectFit: 'cover', border: '1px solid #E2E8F0' }} />
                      <div style={{ flexGrow: 1, minWidth: 0 }}>
                        <h4 style={{ fontFamily: "'Playfair Display', 'Cinzel', 'Georgia', serif", margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tm.name}</h4>
                        <p style={{ margin: '0 0 6px 0', fontSize: '0.85rem', color: '#1E40AF', fontWeight: 700, fontFamily: "'Playfair Display', 'Cinzel', 'Georgia', serif" }}>{tm.designation.toUpperCase()}</p>
                        <div style={{ display: 'flex', gap: '8px', fontSize: '0.8rem', color: '#64748B' }}>
                          {tm.phone && <span>{tm.phone}</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteTeamMember(tm.id, tm.name)}
                        style={{ padding: '10px', backgroundColor: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA', cursor: 'pointer' }}
                        title="Delete Profile"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= AI ASSISTANT TAB ================= */}
        {activeTab === 'ai_assistant' && <AiAssistantAdminPanel />}

        {/* ================= MEDIA MANAGER TAB ================= */}
        {activeTab === 'media_manager' && (() => {
          const videos: ShowcaseVideo[] = showcaseVideosDb;
          const settings: ShowcaseSettings = showcaseSettingsDb;
          return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Header */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '24px 28px', borderRadius: '16px', border: '1px solid #F1F5F9', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #16A34A, #059669)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                  <FaVideo />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>🖥️ Main Page Settings</h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: '#64748B', fontWeight: 500 }}>Manage videos displayed on the homepage carousel</p>
                </div>
                <div style={{ marginLeft: 'auto', backgroundColor: '#DCFCE7', color: '#16A34A', padding: '8px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem' }}>
                  {videos.filter(v => v.status === 'Active').length} Active / {videos.length} Total
                </div>
              </div>
            </div>

            {/* Settings Card */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '24px 28px', borderRadius: '16px', border: '1px solid #F1F5F9', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaCog style={{ color: '#16A34A' }} /> Showcase Settings
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                {/* Default Playback Duration */}
                <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Default Playback Duration (sec)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={() => { const val = Math.max(3, settings.defaultPlaybackDurationSec - 1); updateShowcaseSettings({ defaultPlaybackDurationSec: val }); triggerRefresh(); }} style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#FFF', cursor: 'pointer', fontWeight: 800, fontSize: '1.1rem', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', minWidth: '40px', textAlign: 'center' }}>{settings.defaultPlaybackDurationSec}</span>
                    <button onClick={() => { const val = settings.defaultPlaybackDurationSec + 1; updateShowcaseSettings({ defaultPlaybackDurationSec: val }); triggerRefresh(); }} style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#FFF', cursor: 'pointer', fontWeight: 800, fontSize: '1.1rem', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                  </div>
                </div>
                {/* Max Video Size */}
                <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Max Video Size (MB)</label>
                  <input type="number" value={settings.maxVideoSizeMB} onChange={e => { updateShowcaseSettings({ maxVideoSizeMB: Number(e.target.value) || 200 }); triggerRefresh(); }} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '1rem', fontWeight: 700, color: '#0F172A', boxSizing: 'border-box', outline: 'none' }} />
                </div>
                {/* Max Video Duration */}
                <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Max Video Duration (sec)</label>
                  <input type="number" value={settings.maxVideoDurationSec} onChange={e => { updateShowcaseSettings({ maxVideoDurationSec: Number(e.target.value) || 60 }); triggerRefresh(); }} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '1rem', fontWeight: 700, color: '#0F172A', boxSizing: 'border-box', outline: 'none' }} />
                </div>
              </div>
            </div>

            {/* Add New Video Form */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '24px 28px', borderRadius: '16px', border: '1px solid #F1F5F9', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaPlus style={{ color: '#16A34A' }} /> Add New Video
              </h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                const videoUrl = (formData.get('videoUrl') as string || '').trim();
                const title = (formData.get('title') as string || '').trim();
                const linkedCategory = (formData.get('linkedCategory') as string || 'None') as ShowcaseVideo['linkedCategory'];
                const linkedId = (formData.get('linkedId') as string || '').trim();
                const displayOrder = Number(formData.get('displayOrder')) || (videos.length + 1);
                const status = formData.get('statusToggle') ? 'Active' as const : 'Inactive' as const;
                if (!videoUrl || !title) { showNotification('Please enter Video URL and Title', 'warning'); return; }
                addShowcaseVideo({ videoUrl, title, linkedCategory, linkedId: linkedId || undefined, displayOrder, status });
                showNotification(`Added "${title}" to showcase videos!`);
                form.reset();
                triggerRefresh();
              }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Video URL *</label>
                    <input name="videoUrl" type="url" placeholder="https://example.com/video.mp4" required style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.9rem', color: '#0F172A', boxSizing: 'border-box', outline: 'none', backgroundColor: '#F8FAFC' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Title *</label>
                    <input name="title" type="text" placeholder="e.g. Luxury Villa Showcase" required style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.9rem', color: '#0F172A', boxSizing: 'border-box', outline: 'none', backgroundColor: '#F8FAFC' }} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Linked Category</label>
                    <select name="linkedCategory" defaultValue="None" style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.9rem', color: '#0F172A', boxSizing: 'border-box', outline: 'none', backgroundColor: '#F8FAFC' }}>
                      <option value="None">None</option>
                      <option value="Property">Property</option>
                      <option value="Franchise">Franchise</option>
                      <option value="Business">Business</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Linked ID</label>
                    <input name="linkedId" type="text" placeholder="Optional ID" style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.9rem', color: '#0F172A', boxSizing: 'border-box', outline: 'none', backgroundColor: '#F8FAFC' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Display Order</label>
                    <input name="displayOrder" type="number" defaultValue={videos.length + 1} min={1} style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.9rem', color: '#0F172A', boxSizing: 'border-box', outline: 'none', backgroundColor: '#F8FAFC' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Status</label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', cursor: 'pointer' }}>
                      <input name="statusToggle" type="checkbox" defaultChecked style={{ width: '18px', height: '18px', accentColor: '#16A34A' }} />
                      <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0F172A' }}>Active</span>
                    </label>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" style={{ padding: '12px 28px', backgroundColor: '#16A34A', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 8px rgba(22,163,74,0.25)', transition: 'all 0.2s' }}>
                    <FaPlus /> Add Showcase Video
                  </button>
                </div>
              </form>
            </div>

            {/* Video List */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '24px 28px', borderRadius: '16px', border: '1px solid #F1F5F9', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaListAlt style={{ color: '#16A34A' }} /> All Showcase Videos ({videos.length})
              </h3>
              {videos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 20px', color: '#94A3B8' }}>
                  <FaVideo style={{ fontSize: '2.5rem', marginBottom: '12px', opacity: 0.5 }} />
                  <p style={{ fontWeight: 600, fontSize: '1rem' }}>No showcase videos yet</p>
                  <p style={{ fontSize: '0.85rem' }}>Add your first video using the form above</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[...videos].sort((a, b) => a.displayOrder - b.displayOrder).map((video) => (
                    <div key={video.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 18px', borderRadius: '12px', border: '1px solid #F1F5F9', backgroundColor: '#FAFBFC', transition: 'all 0.15s' }}>
                      {/* Order Badge */}
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0 }}>
                        #{video.displayOrder}
                      </div>
                      {/* Video Thumbnail */}
                      <div style={{ width: '100px', height: '60px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#0F172A', flexShrink: 0 }}>
                        <video src={video.videoUrl} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} preload="metadata" />
                      </div>
                      {/* Info */}
                      <div style={{ flexGrow: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0F172A', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{video.title}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', backgroundColor: '#F1F5F9', padding: '2px 8px', borderRadius: '6px' }}>{video.linkedCategory}</span>
                          {video.linkedId && <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>ID: {video.linkedId}</span>}
                          <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{video.createdDate}</span>
                        </div>
                      </div>
                      {/* Status Badge */}
                      <span style={{ padding: '5px 14px', borderRadius: '20px', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.03em', backgroundColor: video.status === 'Active' ? '#DCFCE7' : '#F1F5F9', color: video.status === 'Active' ? '#16A34A' : '#94A3B8', flexShrink: 0 }}>
                        {video.status === 'Active' ? '● Active' : '○ Inactive'}
                      </span>
                      {/* Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        <button onClick={() => {
                          const newTitle = window.prompt('Edit video title:', video.title);
                          if (newTitle !== null && newTitle.trim()) {
                            const newUrl = window.prompt('Edit video URL:', video.videoUrl);
                            if (newUrl !== null && newUrl.trim()) {
                              const newOrder = window.prompt('Edit display order:', String(video.displayOrder));
                              updateShowcaseVideo(video.id, { title: newTitle.trim(), videoUrl: newUrl.trim(), displayOrder: Number(newOrder) || video.displayOrder });
                              showNotification(`Updated "${newTitle.trim()}"`);
                              triggerRefresh();
                            }
                          }
                        }} title="Edit" style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', fontSize: '0.8rem', transition: 'all 0.15s' }}>
                          <FaEdit />
                        </button>
                        <button onClick={() => {
                          updateShowcaseVideo(video.id, { status: video.status === 'Active' ? 'Inactive' : 'Active' });
                          showNotification(`${video.title} is now ${video.status === 'Active' ? 'Inactive' : 'Active'}`);
                          triggerRefresh();
                        }} title="Toggle Status" style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: video.status === 'Active' ? '#16A34A' : '#94A3B8', fontSize: '0.8rem', transition: 'all 0.15s' }}>
                          <FaEye />
                        </button>
                        <button onClick={() => {
                          if (window.confirm(`Delete "${video.title}"? This cannot be undone.`)) {
                            deleteShowcaseVideo(video.id);
                            showNotification(`Deleted "${video.title}"`, 'warning');
                            triggerRefresh();
                          }
                        }} title="Delete" style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #FEE2E2', backgroundColor: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', fontSize: '0.8rem', transition: 'all 0.15s' }}>
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
          );
        })()}

        {/* ================= CATEGORY: USERS DATA (REGISTERED CUSTOMERS) ================= */}
        {(activeTab as string) === 'users_data' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
            
            {/* Top Stat Cards for Customer Database */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>TOTAL REGISTERED USERS</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', marginTop: '6px' }}>{registeredCustomers.length}</div>
                <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600, marginTop: '4px' }}>Saved in PostgreSQL Database</div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>VERIFIED INVESTORS</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10B981', marginTop: '6px' }}>
                  {registeredCustomers.filter(c => c.role === 'Verified Investor' || !c.role).length}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, marginTop: '4px' }}>Property Buyers & Investors</div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>FRANCHISE & BIZ PARTNERS</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#2563EB', marginTop: '6px' }}>
                  {registeredCustomers.filter(c => c.role === 'Franchise Partner' || c.role === 'Business Buyer').length}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, marginTop: '4px' }}>Business Seekers</div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>GUNTUR & AP USERS</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#8B5CF6', marginTop: '6px' }}>
                  {registeredCustomers.filter(c => (c.district || '').toLowerCase().includes('guntur') || (c.district || '').toLowerCase().includes('vijayawada')).length}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, marginTop: '4px' }}>Regional Footprint</div>
              </div>
            </div>

            {/* Filter & Search Controls */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '18px 24px', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, maxWidth: '420px', backgroundColor: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '12px', padding: '10px 16px' }}>
                <FaSearch style={{ color: '#007A55' }} />
                <input
                  type="text"
                  placeholder="Search by name, phone, email, or district..."
                  value={customerSearchQuery}
                  onChange={(e) => setCustomerSearchQuery(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem', color: '#0F172A', fontWeight: 600 }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#475569' }}>Filter District:</span>
                <select
                  value={customerDistrictFilter}
                  onChange={(e) => setCustomerDistrictFilter(e.target.value)}
                  style={{ padding: '10px 16px', borderRadius: '12px', border: '1.5px solid #CBD5E1', backgroundColor: '#FFFFFF', fontSize: '0.9rem', color: '#0F172A', cursor: 'pointer', fontWeight: 700 }}
                >
                  <option value="All">All Districts</option>
                  <option value="Guntur">Guntur</option>
                  <option value="Vijayawada">Vijayawada (NTR)</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Visakhapatnam">Visakhapatnam</option>
                </select>
              </div>
            </div>

            {/* Customers Data Table */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Registered Customer Database</h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '4px 0 0 0' }}>All customer login accounts & registration profiles saved in PostgreSQL database.</p>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: 700 }}>
                    <th style={{ padding: '16px 24px' }}>Customer Profile</th>
                    <th style={{ padding: '16px 20px' }}>Contact Phone</th>
                    <th style={{ padding: '16px 20px' }}>Email Address</th>
                    <th style={{ padding: '16px 20px' }}>Gender</th>
                    <th style={{ padding: '16px 20px' }}>District</th>
                    <th style={{ padding: '16px 20px' }}>Role / Type</th>
                    <th style={{ padding: '16px 20px' }}>Last Login Time</th>
                    <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {registeredCustomers
                    .filter(c => {
                      const q = customerSearchQuery.toLowerCase();
                      const matchesSearch = !q || (c.name || '').toLowerCase().includes(q) || (c.phone || '').includes(q) || (c.email || '').toLowerCase().includes(q) || (c.district || '').toLowerCase().includes(q);
                      const matchesDistrict = customerDistrictFilter === 'All' || (c.district || '').includes(customerDistrictFilter);
                      return matchesSearch && matchesDistrict;
                    })
                    .map((cust) => (
                      <tr key={cust.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.15s' }}>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img
                              src={cust.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(cust.name || 'User')}&background=007A55&color=fff`}
                              alt={cust.name}
                              style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div>
                              <div style={{ fontWeight: 800, color: '#0F172A' }}>{cust.name}</div>
                              <div style={{ fontSize: '0.78rem', color: '#64748B' }}>ID: {cust.id}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px', fontWeight: 700, color: '#0F172A' }}>{cust.phone || 'N/A'}</td>
                        <td style={{ padding: '16px 20px', color: '#475569' }}>{cust.email}</td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700, backgroundColor: cust.gender === 'Female' ? '#FCE7F3' : '#E0F2FE', color: cust.gender === 'Female' ? '#DB2777' : '#0284C7' }}>
                            {cust.gender || 'Male'}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', fontWeight: 700, color: '#047857' }}>{cust.district || 'Guntur'}</td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ padding: '4px 12px', borderRadius: '14px', fontSize: '0.78rem', fontWeight: 800, backgroundColor: '#DCFCE7', color: '#15803D' }}>
                            {cust.role || 'Verified Investor'}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '0.82rem', color: '#64748B' }}>{cust.lastLoginAt || cust.registeredDate || 'Just now'}</td>
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to remove user record ${cust.name}?`)) {
                                fetch(`${API_BASE_URL}/api/customers/${cust.id}`, { method: 'DELETE' })
                                  .then(() => fetchRegisteredCustomers());
                              }
                            }}
                            style={{ padding: '8px 14px', borderRadius: '8px', backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                          >
                            Delete User
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* ================= MODAL: EDIT PROPERTY ================= */}
      {editingProperty && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div data-lenis-prevent="true" style={{ backgroundColor: '#FFFFFF', padding: '36px', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", margin: '0 0 24px 0', fontSize: '1.3rem', fontWeight: 700, color: '#0F172A', letterSpacing: '0.04em' }}>EDIT PROPERTY LISTING</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', marginBottom: '8px', color: '#475569', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>TITLE</label>
                <input type="text" value={editingProperty.title} onChange={e => setEditingProperty({ ...editingProperty, title: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #E2E8F0' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', marginBottom: '8px', color: '#475569', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>CATEGORY</label>
                  <select value={editingProperty.category} onChange={e => setEditingProperty({ ...editingProperty, category: e.target.value as any })} style={{ width: '100%', padding: '12px', border: '1px solid #E2E8F0' }}>
                    <option value="Apartment">Apartment</option>
                    <option value="Villa">Villa</option>
                    <option value="House">House</option>
                    <option value="Plot">Plot</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', marginBottom: '8px', color: '#475569', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>ASSIGN BROKER</label>
                  <select value={editingProperty.dealerId} onChange={e => setEditingProperty({ ...editingProperty, dealerId: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #E2E8F0' }}>
                    {dealersDb.map(d => <option key={d.id} value={d.id}>{d.companyName} ({d.fullName || 'Partner'}) — ⭐ {d.rating} {d.premiumPartner ? '👑 [PREMIUM]' : ''}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', marginBottom: '8px', color: '#475569', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>PRICE DISPLAY LABEL</label>
                  <input type="text" value={editingProperty.priceDisplay} onChange={e => setEditingProperty({ ...editingProperty, priceDisplay: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #E2E8F0' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', marginBottom: '8px', color: '#475569', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>CITY</label>
                  <input type="text" value={editingProperty.city} onChange={e => setEditingProperty({ ...editingProperty, city: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #E2E8F0' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', marginBottom: '8px', color: '#475569', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>UPLOAD / ADD MORE PHOTOS</label>
                <label style={{ display: 'block', padding: '16px', textAlign: 'center', border: '1px dashed #1E40AF', cursor: 'pointer', backgroundColor: '#F8FAFC', fontWeight: 700, fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>
                  CLICK TO SELECT NEW PHOTOS
                  <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={e => handleFileUpload(e, list => { if (list.length) setEditingProperty({ ...editingProperty, image: list[0], images: list }); })} />
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button onClick={() => setEditingProperty(null)} style={{ padding: '12px 24px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', fontWeight: 700, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>CANCEL</button>
                <button onClick={() => { updateProperty(editingProperty.id, editingProperty); setEditingProperty(null); showNotification("Property details updated."); }} style={{ padding: '12px 28px', backgroundColor: '#1E40AF', color: '#FFFFFF', border: 'none', fontWeight: 700, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", letterSpacing: '0.06em' }}>SAVE CHANGES</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT FRANCHISE ================= */}
      {editingFranchise && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div data-lenis-prevent="true" style={{ backgroundColor: '#FFFFFF', padding: '36px', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", margin: '0 0 24px 0', fontSize: '1.3rem', fontWeight: 700, color: '#0F172A', letterSpacing: '0.04em' }}>EDIT FRANCHISE OPPORTUNITY</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', marginBottom: '8px', color: '#475569', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>BRAND NAME</label>
                <input type="text" value={editingFranchise.brand} onChange={e => setEditingFranchise({ ...editingFranchise, brand: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #E2E8F0' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', marginBottom: '8px', color: '#475569', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>CATEGORY</label>
                  <select value={editingFranchise.category} onChange={e => setEditingFranchise({ ...editingFranchise, category: e.target.value as any, type: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #E2E8F0' }}>
                    <option value="Cafe & Restaurant">Cafe & Restaurant</option>
                    <option value="Retail & Fashion">Retail & Fashion</option>
                    <option value="Healthcare & Wellness">Healthcare & Wellness</option>
                    <option value="Education & Training">Education & Training</option>
                    <option value="Automotive & Services">Automotive & Services</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', marginBottom: '8px', color: '#475569', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>ASSIGN BROKER</label>
                  <select value={editingFranchise.dealerId} onChange={e => setEditingFranchise({ ...editingFranchise, dealerId: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #E2E8F0' }}>
                    {dealersDb.map(d => <option key={d.id} value={d.id}>{d.companyName} ({d.fullName || 'Partner'}) — ⭐ {d.rating} {d.premiumPartner ? '👑 [PREMIUM]' : ''}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', marginBottom: '8px', color: '#475569', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>INVESTMENT LABEL</label>
                  <input type="text" value={editingFranchise.investmentDisplay} onChange={e => setEditingFranchise({ ...editingFranchise, investmentDisplay: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #E2E8F0' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', marginBottom: '8px', color: '#475569', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>LOCATION</label>
                  <input type="text" value={editingFranchise.location} onChange={e => setEditingFranchise({ ...editingFranchise, location: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #E2E8F0' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button onClick={() => setEditingFranchise(null)} style={{ padding: '12px 24px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', fontWeight: 700, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>CANCEL</button>
                <button onClick={() => { updateFranchise(editingFranchise.id, editingFranchise); setEditingFranchise(null); showNotification("Franchise details updated."); }} style={{ padding: '12px 28px', backgroundColor: '#1E40AF', color: '#FFFFFF', border: 'none', fontWeight: 700, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", letterSpacing: '0.06em' }}>SAVE CHANGES</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT BROKER ================= */}
      {editingBroker && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div data-lenis-prevent="true" style={{ backgroundColor: '#FFFFFF', padding: '36px', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", margin: '0 0 24px 0', fontSize: '1.3rem', fontWeight: 700, color: '#0F172A', letterSpacing: '0.04em' }}>EDIT BROKER / PARTNER PROFILE</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', marginBottom: '8px', color: '#475569', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>AGENCY / BROKER NAME</label>
                <input type="text" value={editingBroker.companyName} onChange={e => setEditingBroker({ ...editingBroker, companyName: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #E2E8F0' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', marginBottom: '8px', color: '#475569', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>SPECIALIZATION</label>
                  <input type="text" value={editingBroker.specialization} onChange={e => setEditingBroker({ ...editingBroker, specialization: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #E2E8F0' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', marginBottom: '8px', color: '#475569', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>YEARS EXPERIENCE</label>
                  <input type="number" value={editingBroker.yearsExperience} onChange={e => setEditingBroker({ ...editingBroker, yearsExperience: Number(e.target.value) })} style={{ width: '100%', padding: '12px', border: '1px solid #E2E8F0' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', marginBottom: '8px', color: '#475569', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>PHONE NUMBER</label>
                  <input type="text" value={editingBroker.phone} onChange={e => setEditingBroker({ ...editingBroker, phone: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #E2E8F0' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', marginBottom: '8px', color: '#475569', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>EMAIL ADDRESS</label>
                  <input type="email" value={editingBroker.email} onChange={e => setEditingBroker({ ...editingBroker, email: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #E2E8F0' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', marginBottom: '8px', color: '#475569', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>UPLOAD NEW PROFILE PHOTO</label>
                <label style={{ display: 'block', padding: '16px', textAlign: 'center', border: '1px dashed #1E40AF', cursor: 'pointer', backgroundColor: '#F8FAFC', fontWeight: 700, fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>
                  CLICK TO CHANGE BROKER PHOTO
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFileUpload(e, list => { if (list[0]) setEditingBroker({ ...editingBroker, photo: list[0] }); })} />
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button onClick={() => setEditingBroker(null)} style={{ padding: '12px 24px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', fontWeight: 700, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>CANCEL</button>
                <button onClick={() => { updateDealer(editingBroker.id, editingBroker); setEditingBroker(null); showNotification("Broker profile updated successfully!"); }} style={{ padding: '12px 28px', backgroundColor: '#1E40AF', color: '#FFFFFF', border: 'none', fontWeight: 700, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", letterSpacing: '0.06em' }}>SAVE PROFILE</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= INTERACTIVE REAL-TIME DATABASE STAT GRAPH & SLIDABLE MODAL ================= */}
      {statModalTopic && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
          <div data-lenis-prevent="true" style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', width: '100%', maxWidth: '980px', maxHeight: '92vh', overflowY: 'auto', border: '1px solid #E2E8F0', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', padding: '36px' }}>
            
            {/* Modal Top Header with Close Button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid #F1F5F9', paddingBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.5rem' }}>
                    {statModalTopic === 'properties' ? '🏠' : statModalTopic === 'franchises' ? '🏪' : statModalTopic === 'businesses' ? '💼' : statModalTopic === 'enquiries' ? '📥' : statModalTopic === 'users' ? '👥' : '🏷️'}
                  </span>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    {statModalTopic === 'properties' ? 'Properties Database Analytics & Graphs' : statModalTopic === 'franchises' ? 'Franchises Database Analytics & Graphs' : statModalTopic === 'businesses' ? 'Businesses Database Analytics & Graphs' : statModalTopic === 'enquiries' ? 'Lead Enquiries Analytics & Graphs' : statModalTopic === 'users' ? 'Registered Customers Analytics & Graphs' : 'Sold Deals & Transaction Analytics'}
                  </h2>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '4px 0 0 0', fontWeight: 500 }}>
                  100% Real-Time Database Metrics computed dynamically from live PostgreSQL database.
                </p>
              </div>

              <button
                onClick={() => setStatModalTopic(null)}
                style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', color: '#0F172A', fontWeight: 800, cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            {/* Slidable Top Nav Tabs for 6 Topics */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#F8FAFC', padding: '8px', borderRadius: '16px', marginBottom: '28px', overflowX: 'auto' }}>
              {[
                { id: 'properties', label: '🏠 Properties', count: propertiesDb.length },
                { id: 'franchises', label: '🏪 Franchises', count: franchiseDb.length },
                { id: 'businesses', label: '💼 Businesses', count: businessDb.length },
                { id: 'enquiries', label: '📥 Lead Enquiries', count: enquiriesDb.length },
                { id: 'users', label: '👥 Registered Users', count: registeredCustomers.length },
                { id: 'sold', label: '🏷️ Sold Data', count: (propertiesDb.filter((p: any) => p.sold || p.listingStatus === 'Sold' || p.status === 'Sold').length + franchiseDb.filter((f: any) => f.sold || f.listingStatus === 'Sold' || f.status === 'Sold').length + businessDb.filter((b: any) => b.sold || b.listingStatus === 'Sold' || b.status === 'Sold').length) },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setStatModalTopic(t.id as any)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    backgroundColor: statModalTopic === t.id ? '#007A55' : 'transparent',
                    color: statModalTopic === t.id ? '#FFFFFF' : '#64748B',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease',
                    boxShadow: statModalTopic === t.id ? '0 4px 12px rgba(0, 122, 85, 0.25)' : 'none'
                  }}
                >
                  {t.label} ({t.count})
                </button>
              ))}
            </div>

            {/* Interactive Dynamic Bar Graph & Data Table */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Dynamic Visual Bar Graph */}
              <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Category Breakdown & Database Graph</h4>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#007A55', backgroundColor: '#ECFDF5', padding: '4px 12px', borderRadius: '12px' }}>
                    Total Count: {getStatGraphData().totalCount} Items
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {getStatGraphData().items.map((item, idx) => {
                    const total = getStatGraphData().totalCount;
                    const maxVal = Math.max(...getStatGraphData().items.map(i => i.count), 1);
                    const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
                    const barWidthPercent = total > 0 ? Math.max((item.count / maxVal) * 100, 4) : 0;

                    return (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem', fontWeight: 700 }}>
                          <span style={{ color: '#334155' }}>{item.label}</span>
                          <span style={{ color: '#0F172A' }}>{item.count} items ({percentage}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '14px', backgroundColor: '#F1F5F9', borderRadius: '8px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${barWidthPercent}%`,
                              height: '100%',
                              backgroundColor: item.color,
                              borderRadius: '8px',
                              transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Database Item Breakdown Table */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                <div style={{ padding: '16px 24px', backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', fontWeight: 800, color: '#0F172A', fontSize: '0.95rem' }}>
                  Live Database Itemized Records ({statModalTopic?.toUpperCase()})
                </div>
                <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
                  {getStatGraphData().totalCount === 0 ? (
                    <div style={{ padding: '30px', textAlign: 'center', color: '#94A3B8', fontWeight: 600 }}>
                      No database entries found for this category yet.
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 700, backgroundColor: '#FFFFFF' }}>
                          <th style={{ padding: '12px 20px' }}>Item Title / User</th>
                          <th style={{ padding: '12px 16px' }}>Category / District</th>
                          <th style={{ padding: '12px 16px' }}>Status / Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {statModalTopic === 'properties' && propertiesDb.slice(0, 10).map((p: any) => (
                          <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '12px 20px', fontWeight: 700, color: '#0F172A' }}>{p.title}</td>
                            <td style={{ padding: '12px 16px', color: '#475569' }}>{p.category} ({p.city || p.district})</td>
                            <td style={{ padding: '12px 16px', fontWeight: 800, color: '#16A34A' }}>{p.priceDisplay || `₹ ${p.price} L`}</td>
                          </tr>
                        ))}
                        {statModalTopic === 'franchises' && franchiseDb.slice(0, 10).map((f: any) => (
                          <tr key={f.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '12px 20px', fontWeight: 700, color: '#0F172A' }}>{f.brand || f.title}</td>
                            <td style={{ padding: '12px 16px', color: '#475569' }}>{f.category}</td>
                            <td style={{ padding: '12px 16px', fontWeight: 800, color: '#2563EB' }}>{f.investmentDisplay}</td>
                          </tr>
                        ))}
                        {statModalTopic === 'businesses' && businessDb.slice(0, 10).map((b: any) => (
                          <tr key={b.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '12px 20px', fontWeight: 700, color: '#0F172A' }}>{b.title || b.name}</td>
                            <td style={{ padding: '12px 16px', color: '#475569' }}>{b.category || b.industry}</td>
                            <td style={{ padding: '12px 16px', fontWeight: 800, color: '#9333EA' }}>{b.priceDisplay || `₹ ${b.askingPrice} L`}</td>
                          </tr>
                        ))}
                        {statModalTopic === 'enquiries' && enquiriesDb.slice(0, 10).map((e: any) => (
                          <tr key={e.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '12px 20px', fontWeight: 700, color: '#0F172A' }}>{e.customerName} ({e.phone})</td>
                            <td style={{ padding: '12px 16px', color: '#475569' }}>{e.listingTitle}</td>
                            <td style={{ padding: '12px 16px', fontWeight: 800, color: e.status === 'New' ? '#DC2626' : '#16A34A' }}>{e.status}</td>
                          </tr>
                        ))}
                        {statModalTopic === 'users' && registeredCustomers.slice(0, 10).map((c: any) => (
                          <tr key={c.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '12px 20px', fontWeight: 700, color: '#0F172A' }}>{c.name} ({c.email})</td>
                            <td style={{ padding: '12px 16px', color: '#475569' }}>{c.district} ({c.gender})</td>
                            <td style={{ padding: '12px 16px', fontWeight: 800, color: '#0D9488' }}>{c.role || 'Verified User'}</td>
                          </tr>
                        ))}
                        {statModalTopic === 'sold' && propertiesDb.slice(0, 10).map((p: any) => (
                          <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '12px 20px', fontWeight: 700, color: '#0F172A' }}>{p.title}</td>
                            <td style={{ padding: '12px 16px', color: '#475569' }}>{p.category}</td>
                            <td style={{ padding: '12px 16px', fontWeight: 800, color: (p.sold || p.listingStatus === 'Sold' || p.status === 'Sold') ? '#16A34A' : '#2563EB' }}>
                              {(p.sold || p.listingStatus === 'Sold' || p.status === 'Sold') ? '🏷️ SOLD OUT' : '🟢 Active'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      </div>
    </div>
  );
};
export default AdminPanel;
