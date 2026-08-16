import React, { useState, useEffect } from 'react';
import { 
  FaBars,
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
  FaLink,
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
  FaRobot,
  FaTimes,
  FaLock,
  FaHeart,
  FaInbox,
  FaHistory
} from 'react-icons/fa';
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
  masterCategoriesDb,
  masterLocationsDb,
  masterPropertyTypesDb,
  masterPropertyStatusesDb,
  masterPropertyOwnershipsDb,
  masterBusinessTypesDb,
  addFilterMasterItem,
  toggleFilterMasterItemActive,
  deleteFilterMasterItem,
  editFilterMasterItem,
  masterLocalitiesDb,
  masterAreasDb,
  addArea,
  toggleAreaActive,
  deleteArea,
  addLocality,
  toggleLocalityActive,
  adminModulesDb,
  toggleAdminModuleActive,
  deleteAdminModule,
  addAdminModule,
  isModuleActive,
  API_BASE_URL
} from '../db/marketplaceDb';
import { BrokerManagementSystem } from '../components/BrokerManagementSystem';
import { Logo } from '../components/common/Logo';
import { PropertyManagementSystem } from '../components/PropertyManagementSystem';
import { FranchiseManagementSystem } from '../components/FranchiseManagementSystem';
import { BusinessManagementSystem } from '../components/BusinessManagementSystem';
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
  const [currentUserName, setCurrentUserName] = useState<string>(() => {
    return sessionStorage.getItem('nexopp_admin_user_name') || 'Super Admin';
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewEmpPassword, setShowNewEmpPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newCityInput, setNewCityInput] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [newCatInput, setNewCatInput] = useState('');
  const [newLocInput, setNewLocInput] = useState('');
  const [newBtInput, setNewBtInput] = useState('');
  const [newPropTypeInput, setNewPropTypeInput] = useState('');
  const [newPropStatusInput, setNewPropStatusInput] = useState('');
  const [newPropOwnershipInput, setNewPropOwnershipInput] = useState('');

  // Main Category Tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'main_stats' | 'customization' | 'hero_cms' | 'properties' | 'franchises' | 'businesses' | 'demand_regions' | 'master_filters' | 'brokers' | 'users' | 'users_data' | 'team' | 'roles' | 'inquiries' | 'media_manager' | 'ai_assistant'>('overview');
  const [expandedMenu, setExpandedMenu] = useState<string | null>('brokers');
  const [analyticsDateRange, setAnalyticsDateRange] = useState<'This Week' | 'This Month' | 'Last 30 Days' | 'This Year'>('This Week');
  const [activeAnalyticsSlide, setActiveAnalyticsSlide] = useState<'property' | 'franchise' | 'business'>('property');
  const [propertySubTab, setPropertySubTab] = useState<string>('listings');
  const [franchiseSubTab, setFranchiseSubTab] = useState<string>('listings');
  const [businessSubTab, setBusinessSubTab] = useState<string>('listings');
  const [brokerSubTab, setBrokerSubTab] = useState<string>('directory');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // CRM Customer Management states
  const [userTabSection, setUserTabSection] = useState<'customers' | 'bookings' | 'employees'>('customers');
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerAreaFilter, setCustomerAreaFilter] = useState('');
  const [customerInterestFilter, setCustomerInterestFilter] = useState('');
  const [customerStatusFilter, setCustomerStatusFilter] = useState('');
  const [customerDateFilter, setCustomerDateFilter] = useState('');
  const [customerPage, setCustomerPage] = useState(1);
  const [customersData, setCustomersData] = useState<any[]>([]);
  const [customerTotalPages, setCustomerTotalPages] = useState(1);
  const [customerTotalCount, setCustomerTotalCount] = useState(0);
  const [selectedCustomerProfile, setSelectedCustomerProfile] = useState<any | null>(null);
  const [customerProfileActiveTab, setCustomerProfileActiveTab] = useState<'overview' | 'logins' | 'favorites' | 'enquiries' | 'bookings' | 'activity'>('overview');
  
  // Dashboard & Enquiries/Bookings states
  const [adminStats, setAdminStats] = useState<any>(null);
  const [allEnquiries, setAllEnquiries] = useState<any[]>([]);
  const [allBookings, setAllBookings] = useState<any[]>([]);

  const SUB_MENU_ITEMS: Record<string, { id: string; label: string; icon: any }[]> = {
    properties: [
      { id: 'listings', label: 'All Properties', icon: <FaListAlt /> },
      { id: 'editProperty', label: 'Edit Property', icon: <FaEdit /> },
      { id: 'sellRequests', label: 'Sell Requests', icon: <FaFileAlt /> },
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
      { id: 'dashboard', label: 'Dashboard', icon: <FaChartBar /> },
      { id: 'listings', label: 'All Businesses', icon: <FaListAlt /> },
      { id: 'addBusiness', label: 'Add Business', icon: <FaPlus /> },
      { id: 'sellRequests', label: 'Sell Requests', icon: <FaFileAlt /> },
      { id: 'buyEnquiries', label: 'Buy Enquiries', icon: <FaEnvelope /> },
      { id: 'categories', label: 'Categories', icon: <FaFolder /> },
      { id: 'businessTypes', label: 'Business Types', icon: <FaBriefcase /> },
      { id: 'featured', label: 'Featured & Premium', icon: <FaStar /> },
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
  const [customerLoginHistory, setCustomerLoginHistory] = useState<any[]>([]);

  const fetchCustomerLoginHistory = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/customers-login-history`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setCustomerLoginHistory(Array.isArray(data) ? data : []);
      } else {
        const fallbackRes = await fetch(`${API_BASE_URL}/api/customers-login-history`);
        if (fallbackRes.ok) {
          const data = await fallbackRes.json();
          setCustomerLoginHistory(Array.isArray(data) ? data : []);
        }
      }
    } catch (e) {
      console.error('Failed to fetch login history:', e);
    }
  };

  const fetchCustomerDetails = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/customers/${id}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setSelectedCustomerProfile(data);
        setCustomerProfileActiveTab('overview');
      }
    } catch (e) {
      console.error('Failed to fetch customer profile details:', e);
    }
  };

  const customerLimit = 10;

  const fetchCustomersList = async () => {
    try {
      const queryParams = new URLSearchParams({
        search: customerSearch,
        area: customerAreaFilter,
        interest: customerInterestFilter,
        status: customerStatusFilter,
        joinedDate: customerDateFilter,
        page: String(customerPage),
        limit: String(customerLimit)
      });
      const res = await fetch(`${API_BASE_URL}/api/admin/customers?${queryParams.toString()}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setCustomersData(data.customers || []);
        setCustomerTotalPages(data.totalPages || 1);
        setCustomerTotalCount(data.total || 0);
        if (Array.isArray(data.customers)) {
          setRegisteredCustomers(data.customers);
        }
      }
    } catch (e) {
      console.error('Failed to fetch customers:', e);
    }
  };

  const fetchAdminDashboardStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/dashboard-stats`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setAdminStats(data);
      }
    } catch (e) {
      console.error('Failed to fetch admin stats:', e);
    }
  };

  const fetchAllEnquiriesAndBookings = async () => {
    try {
      const enqRes = await fetch(`${API_BASE_URL}/api/enquiries`);
      if (enqRes.ok) {
        const data = await enqRes.json();
        setAllEnquiries(data || []);
      }
      const bookRes = await fetch(`${API_BASE_URL}/api/bookings`);
      if (bookRes.ok) {
        const data = await bookRes.json();
        setAllBookings(data || []);
      }
    } catch (e) {
      console.error('Failed to fetch enquiries/bookings:', e);
    }
  };

  const fetchRegisteredCustomers = async () => {
    fetchCustomersList();
    fetchCustomerLoginHistory();
    try {
      const res = await fetch(`${API_BASE_URL}/api/customers`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setRegisteredCustomers(data);
        }
      }
    } catch (e) {
      console.error('Failed to fetch registered customers list:', e);
    }
  };

  const handleUpdateEnquiryStatus = async (id: string, newStatus: string) => {
    const isDbEnq = allEnquiries.some(e => e.id === id);
    if (isDbEnq) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/enquiries/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
        if (res.ok) {
          triggerRefresh();
        }
      } catch (err) {
        console.error('Failed to update enquiry status:', err);
      }
    } else {
      updateEnquiryStatus(id, newStatus as any);
      triggerRefresh();
    }
  };

  const handleDeleteEnquiry = async (id: string) => {
    const isDbEnq = allEnquiries.some(e => e.id === id);
    if (isDbEnq) {
      if (window.confirm('Are you sure you want to delete this enquiry?')) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/enquiries/${id}`, {
            method: 'DELETE'
          });
          if (res.ok) {
            triggerRefresh();
          }
        } catch (err) {
          console.error('Failed to delete enquiry:', err);
        }
      }
    } else {
      deleteEnquiry(id);
      triggerRefresh();
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    if (activeTab === 'users' && userTabSection === 'customers') {
      fetchCustomersList();
    }
  }, [customerSearch, customerAreaFilter, customerInterestFilter, customerStatusFilter, customerDateFilter, customerPage, activeTab, userTabSection, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (activeTab === 'overview') {
      fetchAdminDashboardStats();
    }
    if ((activeTab as string) === 'users_data') {
      fetchRegisteredCustomers();
    }
  }, [activeTab, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchAllEnquiriesAndBookings();
  }, [tick, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchRegisteredCustomers();
    const handler = () => {
      setTick(t => t + 1);
      fetchRegisteredCustomers();
    };
    window.addEventListener('nexopp_data_changed', handler);
    return () => window.removeEventListener('nexopp_data_changed', handler);
  }, [isAuthenticated]);

  useEffect(() => {
    const lenis = (window as any).lenis;
    if (lenis) {
      lenis.stop();
      lenis.scrollTo(0, { immediate: true });
    }
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;

    return () => {
      const lenis = (window as any).lenis;
      if (lenis) {
        lenis.start();
      }
    };
  }, [isAuthenticated]);


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
      setCurrentUserName('Super Admin');
      setError(null);
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
      return;
    }

    // Check Employee Users DB
    const employee = employeeUsersDb.find(u => (u.email || '').toLowerCase() === email.toLowerCase() && u.password === password);
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
      setCurrentUserName(employee.fullName);
      setError(null);
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;

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
    setCurrentUserRole('Super Admin');
    setCurrentUserName('Super Admin');
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
      photo: newTeamMember.photo || '',
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

  // Areas & Localities Management State
  const [newAreaName, setNewAreaName] = useState('');
  const [selectedAreaCityId, setSelectedAreaCityId] = useState(masterLocationsDb[0]?.id || 'loc_3');
  const [newLocalityName, setNewLocalityName] = useState('');
  const [selectedLocalityCityId, setSelectedLocalityCityId] = useState(masterLocationsDb[0]?.id || 'loc_3');
  const [selectedLocalityAreaId, setSelectedLocalityAreaId] = useState('');


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
  const currentEmpUser = employeeUsersDb.find(u => (u.email || '').toLowerCase() === loggedInEmail.toLowerCase());
  const userRoleData = rolesDb.find(r => r.name === currentUserRole);

  // If user has customPermissions explicitly defined (even if empty or custom), use it! Otherwise fallback to role permissions
  const activePermissions = (currentEmpUser && currentEmpUser.customPermissions !== undefined)
    ? currentEmpUser.customPermissions
    : (userRoleData ? userRoleData.permissions : []);

  const hasPermission = (permKey: string) => {
    if (permKey === 'overview' || permKey === 'dashboard') {
      return currentUserRole === 'Super Admin' || currentUserRole === 'Admin';
    }
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

  // Redirect non-admin employees away from Dashboard tab automatically
  useEffect(() => {
    if (isAuthenticated && !hasPermission('overview') && activeTab === 'overview') {
      if (hasPermission('properties')) {
        setActiveTab('properties');
        setExpandedMenu('properties');
      } else if (hasPermission('franchises')) {
        setActiveTab('franchises');
        setExpandedMenu('franchises');
      } else if (hasPermission('businesses')) {
        setActiveTab('businesses');
        setExpandedMenu('businesses');
      } else if (hasPermission('demand_regions')) {
        setActiveTab('demand_regions');
        setExpandedMenu(null);
      } else if (hasPermission('brokers')) {
        setActiveTab('brokers');
        setExpandedMenu('brokers');
      } else if (hasPermission('users')) {
        setActiveTab('users');
        setExpandedMenu(null);
      } else if (hasPermission('inquiries')) {
        setActiveTab('inquiries');
        setExpandedMenu(null);
      } else if (hasPermission('media_manager')) {
        setActiveTab('media_manager');
        setExpandedMenu(null);
      } else if (hasPermission('site_settings')) {
        setActiveTab('customization');
        setExpandedMenu(null);
      }
    }
  }, [isAuthenticated, currentUserRole, activeTab]);

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
      default: return { title: `Welcome back, ${currentUserName}`, sub: `Role: ${currentUserRole} — Here's what's happening with your marketplace today.` };
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
      
      {/* Mobile Sidebar Overlay Backdrop */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', zIndex: 9998 }}
        />
      )}

      {/* Sidebar Navigation */}
      <div className={`admin-sidebar-drawer ${isSidebarOpen ? 'admin-sidebar-open' : 'admin-sidebar-closed'}`} style={{ width: '265px', height: '100%', backgroundColor: '#FFFFFF', borderRight: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', flexShrink: 0, zIndex: 10 }}>
        
        {/* Top Brand Box */}
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9' }}>
          <Logo size="sm" showTagline={false} />
          <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '1.25rem', cursor: 'pointer', padding: '4px' }}>
            ✕
          </button>
        </div>

        {/* Sidebar Scrollable Nav */}
        <nav data-lenis-prevent="true" style={{ display: 'flex', flexDirection: 'column', padding: '10px 14px', gap: '4px', overflowY: 'auto', flexGrow: 1 }}>
          
          {/* Active Item: Dashboard */}
          {hasPermission('overview') && (
            <button
              onClick={() => {
                setActiveTab('overview');
                setExpandedMenu(null);
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 16px', borderRadius: '10px', cursor: 'pointer',
                fontSize: '0.88rem', fontWeight: activeTab === 'overview' ? 700 : 500,
                backgroundColor: activeTab === 'overview' ? '#ECFDF5' : 'transparent',
                color: activeTab === 'overview' ? '#059669' : '#475569',
                border: activeTab === 'overview' ? '1px solid #A7F3D0' : '1px solid transparent',
                transition: 'all 0.15s', textAlign: 'left', width: '100%', boxSizing: 'border-box',
                fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif"
              }}
            >
              <span style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', color: activeTab === 'overview' ? '#059669' : '#64748B' }}><FaHome /></span>
              <span style={{ flexGrow: 1 }}>Dashboard</span>
            </button>
          )}

          {/* Section: CONTENT MANAGEMENT */}
          {(hasPermission('properties') || hasPermission('franchises') || hasPermission('businesses') || hasPermission('demand_regions')) && (
            <div style={{ padding: '16px 10px 6px 10px', fontSize: '0.68rem', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              CONTENT MANAGEMENT
            </div>
          )}
          {hasPermission('properties') && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  onClick={() => {
                    setActiveTab('properties');
                    setExpandedMenu(expandedMenu === 'properties' ? null : 'properties');
                  }}
                  style={{
                    flexGrow: 1, padding: '11px 12px', backgroundColor: activeTab === 'properties' ? '#ECFDF5' : 'transparent', color: activeTab === 'properties' ? '#059669' : '#475569', border: activeTab === 'properties' ? '1px solid #A7F3D0' : '1px solid transparent', textAlign: 'left', cursor: 'pointer', borderRadius: '10px', fontWeight: activeTab === 'properties' ? 700 : 500, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif"
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FaBuilding style={{ color: activeTab === 'properties' ? '#059669' : '#64748B' }} /> Property Management</div>
                  <FaChevronDown style={{ transform: expandedMenu === 'properties' ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', fontSize: '0.7rem' }} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleAdminModuleActive('properties');
                    showNotification(`Property Management is now ${isModuleActive('properties') ? 'Disabled' : 'Enabled'} on website`);
                    triggerRefresh();
                  }}
                  title={isModuleActive('properties') ? 'Click to Disable Property page on Website' : 'Click to Enable Property page on Website'}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    backgroundColor: isModuleActive('properties') ? '#DCFCE7' : '#FEE2E2',
                    color: isModuleActive('properties') ? '#15803D' : '#DC2626',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {isModuleActive('properties') ? 'ON' : 'OFF'}
                </button>
              </div>
              
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
                          padding: '8px 12px', backgroundColor: propertySubTab === sub.id && activeTab === 'properties' ? '#F0FDF4' : 'transparent', color: propertySubTab === sub.id && activeTab === 'properties' ? '#059669' : '#64748B', border: 'none', textAlign: 'left', width: '100%', cursor: 'pointer', borderRadius: '6px', fontSize: '0.82rem', fontWeight: propertySubTab === sub.id && activeTab === 'properties' ? 700 : 500, display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  onClick={() => {
                    setActiveTab('franchises');
                    setExpandedMenu(expandedMenu === 'franchises' ? null : 'franchises');
                  }}
                  style={{
                    flexGrow: 1, padding: '11px 12px', backgroundColor: activeTab === 'franchises' ? '#ECFDF5' : 'transparent', color: activeTab === 'franchises' ? '#059669' : '#475569', border: activeTab === 'franchises' ? '1px solid #A7F3D0' : '1px solid transparent', textAlign: 'left', cursor: 'pointer', borderRadius: '10px', fontWeight: activeTab === 'franchises' ? 700 : 500, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif"
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FaStore style={{ color: activeTab === 'franchises' ? '#059669' : '#64748B' }} /> Franchise Management</div>
                  <FaChevronDown style={{ transform: expandedMenu === 'franchises' ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', fontSize: '0.7rem' }} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleAdminModuleActive('franchises');
                    showNotification(`Franchise Management is now ${isModuleActive('franchises') ? 'Disabled' : 'Enabled'} on website`);
                    triggerRefresh();
                  }}
                  title={isModuleActive('franchises') ? 'Click to Disable Franchise page on Website' : 'Click to Enable Franchise page on Website'}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    backgroundColor: isModuleActive('franchises') ? '#DCFCE7' : '#FEE2E2',
                    color: isModuleActive('franchises') ? '#15803D' : '#DC2626',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {isModuleActive('franchises') ? 'ON' : 'OFF'}
                </button>
              </div>

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
                          padding: '8px 12px', backgroundColor: franchiseSubTab === sub.id && activeTab === 'franchises' ? '#F0FDF4' : 'transparent', color: franchiseSubTab === sub.id && activeTab === 'franchises' ? '#059669' : '#64748B', border: 'none', textAlign: 'left', width: '100%', cursor: 'pointer', borderRadius: '6px', fontSize: '0.82rem', fontWeight: franchiseSubTab === sub.id && activeTab === 'franchises' ? 700 : 500, display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  onClick={() => {
                    setActiveTab('businesses');
                    setExpandedMenu(expandedMenu === 'businesses' ? null : 'businesses');
                  }}
                  style={{
                    flexGrow: 1, padding: '11px 12px', backgroundColor: activeTab === 'businesses' ? '#ECFDF5' : 'transparent', color: activeTab === 'businesses' ? '#059669' : '#475569', border: activeTab === 'businesses' ? '1px solid #A7F3D0' : '1px solid transparent', textAlign: 'left', cursor: 'pointer', borderRadius: '10px', fontWeight: activeTab === 'businesses' ? 700 : 500, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif"
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FaBriefcase style={{ color: activeTab === 'businesses' ? '#059669' : '#64748B' }} /> Business Management</div>
                  <FaChevronDown style={{ transform: expandedMenu === 'businesses' ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', fontSize: '0.7rem' }} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleAdminModuleActive('business');
                    showNotification(`Business Management is now ${isModuleActive('business') ? 'Disabled' : 'Enabled'} on website`);
                    triggerRefresh();
                  }}
                  title={isModuleActive('business') ? 'Click to Disable Business page on Website' : 'Click to Enable Business page on Website'}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    backgroundColor: isModuleActive('business') ? '#DCFCE7' : '#FEE2E2',
                    color: isModuleActive('business') ? '#15803D' : '#DC2626',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {isModuleActive('business') ? 'ON' : 'OFF'}
                </button>
              </div>

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
                          padding: '8px 12px', backgroundColor: businessSubTab === sub.id && activeTab === 'businesses' ? '#F0FDF4' : 'transparent', color: businessSubTab === sub.id && activeTab === 'businesses' ? '#059669' : '#64748B', border: 'none', textAlign: 'left', width: '100%', cursor: 'pointer', borderRadius: '6px', fontSize: '0.82rem', fontWeight: businessSubTab === sub.id && activeTab === 'businesses' ? 700 : 500, display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
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
                padding: '11px 16px', backgroundColor: activeTab === 'demand_regions' ? '#ECFDF5' : 'transparent', color: activeTab === 'demand_regions' ? '#059669' : '#475569', border: activeTab === 'demand_regions' ? '1px solid #A7F3D0' : '1px solid transparent', textAlign: 'left', width: '100%', cursor: 'pointer', borderRadius: '10px', fontWeight: activeTab === 'demand_regions' ? 700 : 500, display: 'flex', alignItems: 'center', gap: '12px', fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif"
              }}
            >
              <FaMapMarkerAlt style={{ color: activeTab === 'demand_regions' ? '#059669' : '#64748B' }} /> Demand Regions
            </button>
          )}

          <button
            onClick={() => {
              setActiveTab('master_filters');
              setExpandedMenu(null);
            }}
            style={{
              padding: '11px 16px', backgroundColor: activeTab === 'master_filters' ? '#ECFDF5' : 'transparent', color: activeTab === 'master_filters' ? '#059669' : '#475569', border: activeTab === 'master_filters' ? '1px solid #A7F3D0' : '1px solid transparent', textAlign: 'left', width: '100%', cursor: 'pointer', borderRadius: '10px', fontWeight: activeTab === 'master_filters' ? 700 : 500, display: 'flex', alignItems: 'center', gap: '12px', fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif"
            }}
          >
            <FaFolder style={{ color: activeTab === 'master_filters' ? '#059669' : '#64748B' }} /> Filters & Categories Control
          </button>

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
                  padding: '11px 16px', backgroundColor: activeTab === 'brokers' ? '#ECFDF5' : 'transparent', color: activeTab === 'brokers' ? '#059669' : '#475569', border: activeTab === 'brokers' ? '1px solid #A7F3D0' : '1px solid transparent', textAlign: 'left', width: '100%', cursor: 'pointer', borderRadius: '10px', fontWeight: activeTab === 'brokers' ? 700 : 500, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif"
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><FaUserTie style={{ color: activeTab === 'brokers' ? '#059669' : '#64748B' }} /> Broker Management</div>
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
                          padding: '10px 12px', backgroundColor: brokerSubTab === sub.id && activeTab === 'brokers' ? '#F0FDF4' : 'transparent', color: brokerSubTab === sub.id && activeTab === 'brokers' ? '#059669' : '#64748B', border: 'none', textAlign: 'left', width: '100%', cursor: 'pointer', borderRadius: '6px', fontSize: '0.85rem', fontWeight: brokerSubTab === sub.id && activeTab === 'brokers' ? 700 : 500, display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
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
                    padding: '11px 16px', backgroundColor: activeTab === 'users' ? '#ECFDF5' : 'transparent', color: activeTab === 'users' ? '#059669' : '#475569', border: activeTab === 'users' ? '1px solid #A7F3D0' : '1px solid transparent', textAlign: 'left', width: '100%', cursor: 'pointer', borderRadius: '10px', fontWeight: activeTab === 'users' ? 700 : 500, display: 'flex', alignItems: 'center', gap: '12px', fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif"
                  }}
                >
                  <FaUsers style={{ color: activeTab === 'users' ? '#059669' : '#64748B' }} /> User Management
                </button>
                <button
                  onClick={() => {
                    setActiveTab('team');
                    setExpandedMenu(null);
                  }}
                  style={{
                    padding: '11px 16px', backgroundColor: activeTab === 'team' ? '#ECFDF5' : 'transparent', color: activeTab === 'team' ? '#059669' : '#475569', border: activeTab === 'team' ? '1px solid #A7F3D0' : '1px solid transparent', textAlign: 'left', width: '100%', cursor: 'pointer', borderRadius: '10px', fontWeight: activeTab === 'team' ? 700 : 500, display: 'flex', alignItems: 'center', gap: '12px', fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif"
                  }}
                >
                  <FaUserShield style={{ color: activeTab === 'team' ? '#059669' : '#64748B' }} /> Team Members
                </button>
                <button
                  onClick={() => {
                    setActiveTab('roles');
                    setExpandedMenu(null);
                  }}
                  style={{
                    padding: '11px 16px', backgroundColor: activeTab === 'roles' ? '#ECFDF5' : 'transparent', color: activeTab === 'roles' ? '#059669' : '#475569', border: activeTab === 'roles' ? '1px solid #A7F3D0' : '1px solid transparent', textAlign: 'left', width: '100%', cursor: 'pointer', borderRadius: '10px', fontWeight: activeTab === 'roles' ? 700 : 500, display: 'flex', alignItems: 'center', gap: '12px', fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif"
                  }}
                >
                  <FaCog style={{ color: activeTab === 'roles' ? '#059669' : '#64748B' }} /> Roles & Permissions
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
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 16px', borderRadius: '10px', cursor: 'pointer',
                        fontSize: '0.88rem', fontWeight: isActive ? 700 : 500,
                        backgroundColor: isActive ? '#ECFDF5' : 'transparent',
                        color: isActive ? '#059669' : '#475569',
                        border: isActive ? '1px solid #A7F3D0' : '1px solid transparent',
                        transition: 'all 0.15s', textAlign: 'left', width: '100%', boxSizing: 'border-box',
                        fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif"
                      }}
                    >
                      <span style={{ fontSize: '1rem', color: isActive ? '#059669' : '#94A3B8', display: 'flex', alignItems: 'center' }}>{item.icon}</span>
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
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 16px', borderRadius: '10px', cursor: 'pointer',
                  fontSize: '0.88rem', fontWeight: isActive ? 700 : 500,
                  backgroundColor: isActive ? '#ECFDF5' : 'transparent',
                  color: isActive ? '#059669' : '#475569',
                  border: isActive ? '1px solid #A7F3D0' : '1px solid transparent',
                  transition: 'all 0.15s', textAlign: 'left', width: '100%', boxSizing: 'border-box',
                  fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif"
                }}
              >
                <span style={{ fontSize: '1rem', color: isActive ? '#059669' : '#94A3B8', display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                <span style={{ flexGrow: 1 }}>{item.label}</span>
              </button>
            );
          })}

          {/* VERY BOTTOM OPTION: Users Data (Registered Customers) */}
          <div style={{ padding: '16px 10px 6px 10px', fontSize: '0.68rem', fontWeight: 700, color: '#059669', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            CUSTOMER DATA
          </div>
          <button
            onClick={() => {
              setActiveTab('users_data' as any);
              setExpandedMenu(null);
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 16px', borderRadius: '10px', cursor: 'pointer',
              fontSize: '0.88rem', fontWeight: (activeTab as string) === 'users_data' ? 700 : 500,
              backgroundColor: (activeTab as string) === 'users_data' ? '#ECFDF5' : 'transparent',
              color: (activeTab as string) === 'users_data' ? '#059669' : '#475569',
              border: (activeTab as string) === 'users_data' ? '1px solid #A7F3D0' : '1px solid transparent',
              transition: 'all 0.15s', textAlign: 'left', width: '100%', boxSizing: 'border-box',
              fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif"
            }}
          >
            <span style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', color: (activeTab as string) === 'users_data' ? '#059669' : '#64748B' }}><FaUsers /></span>
            <span style={{ flexGrow: 1 }}>Users Data</span>
            <span style={{ backgroundColor: '#ECFDF5', color: '#059669', padding: '2px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 800, border: '1px solid #A7F3D0' }}>
              {registeredCustomers.length}
            </span>
          </button>
        </nav>
      </div>

      {/* ================= RIGHT MAIN PANEL ================= */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        
        {/* Top Navbar */}
        <div style={{ minHeight: '72px', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="mobile-sidebar-toggle-btn"
              style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#059669', fontSize: '1.2rem', cursor: 'pointer', padding: '8px 12px', borderRadius: '8px', marginRight: '12px', display: 'none' }}
            >
              <FaBars />
            </button>
            <div>
              <h1 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                {activeTab === 'overview' ? `Welcome back, ${currentUserName}` : getHeaderInfo().title}
              </h1>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: '#64748B', fontWeight: 500 }}>
                <span style={{ fontWeight: 700, color: '#059669', marginRight: '6px' }}>{currentUserRole}</span> • {getHeaderInfo().sub}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', minWidth: '200px', maxWidth: '260px' }}>
              <FaSearch style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '0.85rem' }} />
              <input
                type="text"
                placeholder="Search anything..."
                style={{ width: '100%', padding: '9px 14px 9px 38px', border: '1px solid #E2E8F0', borderRadius: '8px', backgroundColor: '#F8FAFC', fontSize: '0.85rem', color: '#0F172A', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '16px', borderLeft: '1px solid #E2E8F0' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#059669', fontSize: '0.85rem', letterSpacing: '0.5px' }}>
                {currentUserName ? currentUserName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'SA'}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F172A' }}>
                  {currentUserName}
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
        <div className="admin-content-area" data-lenis-prevent="true" style={{ padding: '32px 36px', overflowY: 'auto', flexGrow: 1, backgroundColor: '#F8FAFC' }}>
          
          {/* ================= CATEGORY 0: GRAND OVERVIEW ================= */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif" }}>
              {/* ROW 1: Top 6 Stat Cards with SVG Sparkline Graphs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {/* Card 1: TOTAL PROPERTIES */}
                <div
                  onClick={() => setStatModalTopic('properties')}
                  title="Click to view interactive graph & real database statistics"
                  style={{ backgroundColor: '#FFFFFF', padding: '18px 20px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '135px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                      <FaHome />
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B', letterSpacing: '0.04em', textTransform: 'uppercase' }}>PROPERTIES</span>
                  </div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', margin: '10px 0 6px 0', letterSpacing: '-0.03em', lineHeight: 1 }}>
                    {propertiesDb.length.toLocaleString()}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '2px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#059669', backgroundColor: '#ECFDF5', padding: '2px 6px', borderRadius: '4px' }}>Real-Time DB</span>
                    <svg width="55" height="20" viewBox="0 0 60 22" fill="none">
                      <path d="M2 16 C 14 16, 24 6, 36 10 C 48 14, 52 4, 58 6" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                {/* Card 2: FRANCHISES */}
                <div
                  onClick={() => setStatModalTopic('franchises')}
                  title="Click to view interactive graph & real database statistics"
                  style={{ backgroundColor: '#FFFFFF', padding: '18px 20px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '135px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                      <FaStore />
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B', letterSpacing: '0.04em', textTransform: 'uppercase' }}>FRANCHISES</span>
                  </div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', margin: '10px 0 6px 0', letterSpacing: '-0.03em', lineHeight: 1 }}>
                    {franchiseDb.length.toLocaleString()}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '2px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#059669', backgroundColor: '#ECFDF5', padding: '2px 6px', borderRadius: '4px' }}>Real-Time DB</span>
                    <svg width="55" height="20" viewBox="0 0 60 22" fill="none">
                      <path d="M2 18 C 14 18, 22 8, 34 14 C 46 18, 50 6, 58 8" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                {/* Card 3: BUSINESSES */}
                <div
                  onClick={() => setStatModalTopic('businesses')}
                  title="Click to view interactive graph & real database statistics"
                  style={{ backgroundColor: '#FFFFFF', padding: '18px 20px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '135px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                      <FaBriefcase />
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B', letterSpacing: '0.04em', textTransform: 'uppercase' }}>BUSINESSES</span>
                  </div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', margin: '10px 0 6px 0', letterSpacing: '-0.03em', lineHeight: 1 }}>
                    {businessDb.length.toLocaleString()}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '2px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#059669', backgroundColor: '#ECFDF5', padding: '2px 6px', borderRadius: '4px' }}>Real-Time DB</span>
                    <svg width="55" height="20" viewBox="0 0 60 22" fill="none">
                      <path d="M2 18 C 16 10, 24 16, 34 8 C 44 4, 50 12, 58 6" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                {/* Card 4: LEAD ENQUIRIES */}
                <div
                  onClick={() => setStatModalTopic('enquiries')}
                  title="Click to view interactive graph & real database statistics"
                  style={{ backgroundColor: '#FFFFFF', padding: '18px 20px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '135px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                      <FaEnvelope />
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B', letterSpacing: '0.04em', textTransform: 'uppercase' }}>LEAD ENQUIRIES</span>
                  </div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', margin: '10px 0 6px 0', letterSpacing: '-0.03em', lineHeight: 1 }}>
                    {enquiriesDb.length.toLocaleString()}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '2px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#059669', backgroundColor: '#ECFDF5', padding: '2px 6px', borderRadius: '4px' }}>Active Leads</span>
                    <svg width="55" height="20" viewBox="0 0 60 22" fill="none">
                      <path d="M2 16 C 14 16, 24 10, 36 12 C 48 14, 52 6, 58 8" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                {/* Card 5: TOTAL USERS */}
                <div
                  onClick={() => setStatModalTopic('users')}
                  title="Click to view interactive graph & real database statistics"
                  style={{ backgroundColor: '#FFFFFF', padding: '18px 20px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '135px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                      <FaUsers />
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B', letterSpacing: '0.04em', textTransform: 'uppercase' }}>TOTAL USERS</span>
                  </div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', margin: '10px 0 6px 0', letterSpacing: '-0.03em', lineHeight: 1 }}>
                    {registeredCustomers.length.toLocaleString()}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '2px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#059669', backgroundColor: '#ECFDF5', padding: '2px 6px', borderRadius: '4px' }}>Customer DB</span>
                    <svg width="55" height="20" viewBox="0 0 60 22" fill="none">
                      <path d="M2 18 C 14 18, 24 12, 36 15 C 48 16, 52 6, 58 10" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                {/* Card 6: TOTAL SOLD DATA */}
                <div
                  onClick={() => setStatModalTopic('sold')}
                  title="Click to view interactive graph & real database statistics"
                  style={{ backgroundColor: '#FFFFFF', padding: '18px 20px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '135px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                      <FaCheckCircle />
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B', letterSpacing: '0.04em', textTransform: 'uppercase' }}>SOLD DATA</span>
                  </div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', margin: '10px 0 6px 0', letterSpacing: '-0.03em', lineHeight: 1 }}>
                    {(
                      propertiesDb.filter((p: any) => p.sold || p.listingStatus === 'Sold' || p.status === 'Sold').length +
                      franchiseDb.filter((f: any) => f.sold || f.listingStatus === 'Sold' || f.status === 'Sold').length +
                      businessDb.filter((b: any) => b.sold || b.listingStatus === 'Sold' || b.status === 'Sold').length
                    ).toLocaleString()}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '2px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#059669', backgroundColor: '#ECFDF5', padding: '2px 6px', borderRadius: '4px' }}>Closed Deals</span>
                    <svg width="55" height="20" viewBox="0 0 60 22" fill="none">
                      <path d="M2 18 C 14 18, 24 12, 36 15 C 48 18, 52 6, 58 10" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* NEW ROW: Customer Access Metrics & Recent Logins Feed */}
              {adminStats && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '16px' }}>
                  {/* Left Column: Customer Access Statistics */}
                  <div style={{ backgroundColor: '#FFFFFF', padding: '22px 24px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)' }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Real-Time Customer Access Metrics
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                      {[
                        { label: 'Total Customers', val: adminStats.totalCustomers, desc: 'Registered customers' },
                        { label: 'New Today', val: adminStats.newCustomersToday, desc: 'Registered today', isNew: true },
                        { label: 'Active Status', val: adminStats.activeCustomers, desc: 'Active customer accounts' },
                        { label: 'Logged In Today', val: adminStats.customersLoggedInToday, desc: 'Unique logins today' },
                        { label: 'Logged In This Week', val: adminStats.customersLoggedInThisWeek, desc: 'Unique logins this week' },
                        { label: 'Logged In This Month', val: adminStats.customersLoggedInThisMonth, desc: 'Unique logins this month' },
                      ].map((item, idx) => (
                        <div key={idx} style={{ padding: '14px', border: '1px solid #F1F5F9', borderRadius: '10px', backgroundColor: '#F8FAFC' }}>
                          <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>{item.label}</span>
                          <strong style={{ fontSize: '1.4rem', fontWeight: 800, color: item.isNew && item.val > 0 ? '#10B981' : '#0F172A', display: 'block', margin: '4px 0 2px' }}>{item.val}</strong>
                          <span style={{ fontSize: '0.65rem', color: '#94A3B8' }}>{item.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Recent Customer Logins */}
                  <div style={{ backgroundColor: '#FFFFFF', padding: '22px 24px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)', display: 'flex', flexDirection: 'column' }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Recent Customer Logins
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '180px', flexGrow: 1 }}>
                      {adminStats.recentLogins && adminStats.recentLogins.length > 0 ? (
                        adminStats.recentLogins.map((login: any) => (
                          <div 
                            key={login.id} 
                            onClick={() => {
                              fetchCustomerDetails(login.customerId);
                            }}
                            style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center', 
                              padding: '8px 12px', 
                              borderBottom: '1px solid #F1F5F9',
                              cursor: 'pointer',
                              borderRadius: '6px',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <div>
                              <strong style={{ fontSize: '0.85rem', color: '#334155', display: 'block' }}>{login.name}</strong>
                              <span style={{ fontSize: '0.72rem', color: '#64748B' }}>+91 {login.mobile} • {login.deviceType} ({login.browser})</span>
                            </div>
                            <span style={{ fontSize: '0.72rem', color: '#007A55', fontWeight: 700 }}>
                              {new Date(login.loginAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontStyle: 'italic' }}>No customer logins recorded today.</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

            {/* ROW 2: 3 Columns Grid (Overview Analytics Line Chart, Recent Activity, Top Performing Locations Pie Chart) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 1fr) minmax(0, 1fr)', gap: '16px', alignItems: 'stretch' }}>
              
              {/* Col 1: Overview Analytics (Bar Graph showing listings by category with Slide navigation) */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '22px 24px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '340px' }}>
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
                    { id: 'property', label: 'Properties' },
                    { id: 'franchise', label: 'Franchises' },
                    { id: 'business', label: 'Businesses' }
                  ].map(tab => {
                    const active = activeAnalyticsSlide === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveAnalyticsSlide(tab.id as any)}
                        style={{
                          flex: 1,
                          padding: '7px 12px',
                          border: active ? '1px solid #059669' : '1px solid #E2E8F0',
                          backgroundColor: active ? '#059669' : '#FFFFFF',
                          color: active ? '#FFFFFF' : '#475569',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          borderRadius: '8px',
                          transition: 'all 0.2s',
                          fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif"
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
                          const calculatedHeight = (item.val / maxVal) * 110;
                          const barHeight = item.val === 0 ? 8 : Math.max(calculatedHeight, 14);
                          const y = 140 - barHeight;
                          return (
                            <g key={idx}>
                              <rect x={x} y={y} width={barWidth} height={barHeight} fill={item.val > 0 ? "#059669" : "#E2E8F0"} rx="6" ry="6" style={{ transition: 'all 0.4s ease' }} />
                              <text x={x + barWidth/2} y={y - 6} fontSize="9" fontWeight="800" fill={item.val > 0 ? "#059669" : "#94A3B8"} textAnchor="middle">{item.val}</text>
                              <text x={x + barWidth/2} y="156" fontSize="9" fontWeight="600" fill="#475569" textAnchor="middle">{item.label}</text>
                            </g>
                          );
                        })}
                      </svg>
                    );
                  })()}

                  {activeAnalyticsSlide === 'franchise' && (() => {
                    const data = [
                      { label: 'Food/Dining', val: franchiseDb.filter(f => (f.type || '').toLowerCase().includes('food') || (f.type || '').toLowerCase().includes('restaurant')).length },
                      { label: 'Retail/Stores', val: franchiseDb.filter(f => (f.type || '').toLowerCase().includes('retail') || (f.type || '').toLowerCase().includes('store')).length },
                      { label: 'Services', val: franchiseDb.filter(f => (f.type || '').toLowerCase().includes('service')).length },
                      { label: 'Education', val: franchiseDb.filter(f => (f.type || '').toLowerCase().includes('education')).length }
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
                      { label: 'Food/Dining', val: businessDb.filter(b => (b.industry || '').toLowerCase().includes('food')).length },
                      { label: 'Healthcare', val: businessDb.filter(b => (b.industry || '').toLowerCase().includes('health')).length },
                      { label: 'Retail Stores', val: businessDb.filter(b => (b.industry || '').toLowerCase().includes('retail') || (b.industry || '').toLowerCase().includes('store')).length },
                      { label: 'Services', val: businessDb.filter(b => (b.industry || '').toLowerCase().includes('service')).length },
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
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '22px 24px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>Recent Activity</span>
                  <button onClick={() => setActiveTab('inquiries')} style={{ fontSize: '0.78rem', fontWeight: 700, color: '#059669', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
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
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '22px 24px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>Top Performing Locations</span>
                  <button onClick={() => setActiveTab('properties')} style={{ fontSize: '0.78rem', fontWeight: 700, color: '#059669', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
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
              
              {/* Franchise Section Visibility Toggle Card */}
              <div style={{ 
                backgroundColor: settingsForm.showFranchiseSection !== false ? '#ECFDF5' : '#FEF2F2', 
                padding: '24px 28px', 
                border: settingsForm.showFranchiseSection !== false ? '2px solid #10B981' : '2px solid #EF4444', 
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                transition: 'all 0.3s ease'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '1.4rem' }}>
                      {settingsForm.showFranchiseSection !== false ? '🏪' : '🙈'}
                    </span>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      FRANCHISE SECTION VISIBILITY
                    </h3>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      fontSize: '0.72rem', 
                      fontWeight: 800, 
                      backgroundColor: settingsForm.showFranchiseSection !== false ? '#10B981' : '#EF4444',
                      color: '#FFFFFF',
                      letterSpacing: '0.05em'
                    }}>
                      {settingsForm.showFranchiseSection !== false ? 'LIVE & VISIBLE' : 'HIDDEN FROM WEBSITE'}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, maxWidth: '650px' }}>
                    {settingsForm.showFranchiseSection !== false 
                      ? 'The Franchise section is currently visible to all users across the website, navigation menu, and footer.'
                      : 'The Franchise section is hidden from the live website, navbar menu, and footer. All franchise data remains 100% safe in the database.'
                    }
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <label style={{ position: 'relative', display: 'inline-block', width: '64px', height: '34px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={settingsForm.showFranchiseSection !== false}
                      onChange={(e) => setSettingsForm({ ...settingsForm, showFranchiseSection: e.target.checked })}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: settingsForm.showFranchiseSection !== false ? '#10B981' : '#CBD5E1',
                      transition: '0.3s',
                      borderRadius: '34px'
                    }}>
                      <span style={{
                        position: 'absolute',
                        content: '""',
                        height: '26px',
                        width: '26px',
                        left: settingsForm.showFranchiseSection !== false ? '34px' : '4px',
                        bottom: '4px',
                        backgroundColor: 'white',
                        transition: '0.3s',
                        borderRadius: '50%',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }} />
                    </span>
                  </label>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: settingsForm.showFranchiseSection !== false ? '#059669' : '#DC2626' }}>
                    {settingsForm.showFranchiseSection !== false ? 'SHOW' : 'HIDE'}
                  </span>
                </div>
              </div>

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
          <BusinessManagementSystem showNotification={showNotification} activeSubTab={businessSubTab} onSubTabChange={setBusinessSubTab} />
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
                  style={{ padding: '10px 18px', backgroundColor: '#059669', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: '0 2px 6px rgba(5,150,105,0.2)' }}
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
                style={{ padding: '10px 18px', backgroundColor: '#059669', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: '0 2px 6px rgba(5,150,105,0.2)' }}
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
                          style={{ padding: '4px 8px', fontSize: '0.75rem', backgroundColor: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', borderRadius: '4px', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
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

        {/* ================= CATEGORY 4.4: FILTERS & CATEGORIES MASTER CONTROL ================= */}
        {activeTab === 'master_filters' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
            
            {/* Header Card */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '24px 28px', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaFolder style={{ color: '#059669' }} /> Dynamic Filters & Categories Control Panel
              </h2>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '6px 0 0 0', fontWeight: 500 }}>
                Manage live filter options across Business Categories, Locations, and Entity Types. Toggling <strong>Show/Hide (is_active)</strong> instantly updates or removes items from the live website without redeployment.
              </p>
            </div>

            {/* 3-Column Manager Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
              
              {/* CARD 1: Business Categories */}
              <div style={{ backgroundColor: '#FFFFFF', padding: '22px', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Business Categories</h3>
                  <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: '#ECFDF5', color: '#059669', padding: '4px 10px', borderRadius: '9999px' }}>
                    {masterCategoriesDb.filter(c => c.is_active).length} Active / {masterCategoriesDb.length} Total
                  </span>
                </div>

                {/* Add Category Form */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newCatInput.trim()) return;
                    addFilterMasterItem('category', newCatInput.trim());
                    setNewCatInput('');
                    showNotification('Business category added successfully!', 'success');
                  }}
                  style={{ display: 'flex', gap: '8px' }}
                >
                  <input
                    type="text"
                    placeholder="Add new category..."
                    value={newCatInput}
                    onChange={(e) => setNewCatInput(e.target.value)}
                    style={{ flex: 1, padding: '9px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                  />
                  <button
                    type="submit"
                    style={{ backgroundColor: '#059669', color: '#FFFFFF', border: 'none', padding: '9px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <FaPlus /> Add
                  </button>
                </form>

                {/* Items List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
                  {masterCategoriesDb.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        backgroundColor: item.is_active ? '#F8FAFC' : '#FEF2F2',
                        border: item.is_active ? '1px solid #E2E8F0' : '1px solid #FECACA',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: item.is_active ? '#0F172A' : '#991B1B' }}>
                          {item.name}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* Toggle Switch */}
                        <button
                          type="button"
                          onClick={() => {
                            toggleFilterMasterItemActive(item.id, 'category');
                            showNotification(`Category "${item.name}" ${item.is_active ? 'hidden' : 'activated'}`, 'info');
                          }}
                          style={{
                            backgroundColor: item.is_active ? '#10B981' : '#CBD5E1',
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '5px 12px',
                            borderRadius: '9999px',
                            fontSize: '11px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {item.is_active ? <><FaEye /> Show</> : <><FaEyeSlash /> Hide</>}
                        </button>

                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CARD 2: Locations */}
              <div style={{ backgroundColor: '#FFFFFF', padding: '22px', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Locations / Cities</h3>
                  <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: '#ECFDF5', color: '#059669', padding: '4px 10px', borderRadius: '9999px' }}>
                    {masterLocationsDb.filter(l => l.is_active).length} Active / {masterLocationsDb.length} Total
                  </span>
                </div>

                {/* Add Location Form */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newLocInput.trim()) return;
                    addFilterMasterItem('location', newLocInput.trim());
                    setNewLocInput('');
                    showNotification('Location added successfully!', 'success');
                  }}
                  style={{ display: 'flex', gap: '8px' }}
                >
                  <input
                    type="text"
                    placeholder="Add new location..."
                    value={newLocInput}
                    onChange={(e) => setNewLocInput(e.target.value)}
                    style={{ flex: 1, padding: '9px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                  />
                  <button
                    type="submit"
                    style={{ backgroundColor: '#059669', color: '#FFFFFF', border: 'none', padding: '9px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <FaPlus /> Add
                  </button>
                </form>

                {/* Items List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
                  {masterLocationsDb.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        backgroundColor: item.is_active ? '#F8FAFC' : '#FEF2F2',
                        border: item.is_active ? '1px solid #E2E8F0' : '1px solid #FECACA',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: item.is_active ? '#0F172A' : '#991B1B' }}>
                          📍 {item.name}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* Toggle Switch */}
                        <button
                          type="button"
                          onClick={() => {
                            toggleFilterMasterItemActive(item.id, 'location');
                            showNotification(`Location "${item.name}" ${item.is_active ? 'hidden' : 'activated'}`, 'info');
                          }}
                          style={{
                            backgroundColor: item.is_active ? '#10B981' : '#CBD5E1',
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '5px 12px',
                            borderRadius: '9999px',
                            fontSize: '11px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {item.is_active ? <><FaEye /> Show</> : <><FaEyeSlash /> Hide</>}
                        </button>

                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CARD 3: Business Types */}
              <div style={{ backgroundColor: '#FFFFFF', padding: '22px', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Business Types</h3>
                  <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: '#ECFDF5', color: '#059669', padding: '4px 10px', borderRadius: '9999px' }}>
                    {masterBusinessTypesDb.filter(bt => bt.is_active).length} Active / {masterBusinessTypesDb.length} Total
                  </span>
                </div>

                {/* Add Business Type Form */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newBtInput.trim()) return;
                    addFilterMasterItem('business_type', newBtInput.trim());
                    setNewBtInput('');
                    showNotification('Business type added successfully!', 'success');
                  }}
                  style={{ display: 'flex', gap: '8px' }}
                >
                  <input
                    type="text"
                    placeholder="Add entity structure..."
                    value={newBtInput}
                    onChange={(e) => setNewBtInput(e.target.value)}
                    style={{ flex: 1, padding: '9px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                  />
                  <button
                    type="submit"
                    style={{ backgroundColor: '#059669', color: '#FFFFFF', border: 'none', padding: '9px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <FaPlus /> Add
                  </button>
                </form>

                {/* Items List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
                  {masterBusinessTypesDb.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        backgroundColor: item.is_active ? '#F8FAFC' : '#FEF2F2',
                        border: item.is_active ? '1px solid #E2E8F0' : '1px solid #FECACA',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: item.is_active ? '#0F172A' : '#991B1B' }}>
                          💼 {item.name}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* Toggle Switch */}
                        <button
                          type="button"
                          onClick={() => {
                            toggleFilterMasterItemActive(item.id, 'business_type');
                            showNotification(`Business type "${item.name}" ${item.is_active ? 'hidden' : 'activated'}`, 'info');
                          }}
                          style={{
                            backgroundColor: item.is_active ? '#10B981' : '#CBD5E1',
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '5px 12px',
                            borderRadius: '9999px',
                            fontSize: '11px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {item.is_active ? <><FaEye /> Show</> : <><FaEyeSlash /> Hide</>}
                        </button>

                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CARD 4: Property Types */}
              <div style={{ backgroundColor: '#FFFFFF', padding: '22px', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Property Types</h3>
                  <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: '#ECFDF5', color: '#059669', padding: '4px 10px', borderRadius: '9999px' }}>
                    {masterPropertyTypesDb.filter(c => c.is_active).length} Active / {masterPropertyTypesDb.length} Total
                  </span>
                </div>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newPropTypeInput.trim()) return;
                    addFilterMasterItem('property_type', newPropTypeInput.trim());
                    setNewPropTypeInput('');
                    showNotification('Property type added successfully!', 'success');
                  }}
                  style={{ display: 'flex', gap: '8px' }}
                >
                  <input
                    type="text"
                    placeholder="Add property type (e.g. Residential)..."
                    value={newPropTypeInput}
                    onChange={(e) => setNewPropTypeInput(e.target.value)}
                    style={{ flex: 1, padding: '9px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                  />
                  <button
                    type="submit"
                    style={{ backgroundColor: '#059669', color: '#FFFFFF', border: 'none', padding: '9px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <FaPlus /> Add
                  </button>
                </form>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
                  {masterPropertyTypesDb.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        backgroundColor: item.is_active ? '#F8FAFC' : '#FEF2F2',
                        border: item.is_active ? '1px solid #E2E8F0' : '1px solid #FECACA',
                      }}
                    >
                      <span style={{ fontSize: '13px', fontWeight: 700, color: item.is_active ? '#0F172A' : '#991B1B' }}>
                        🏢 {item.name}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            toggleFilterMasterItemActive(item.id, 'property_type');
                            showNotification(`Property type "${item.name}" updated`, 'info');
                          }}
                          style={{ backgroundColor: item.is_active ? '#10B981' : '#CBD5E1', color: '#FFFFFF', border: 'none', padding: '5px 12px', borderRadius: '9999px', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}
                        >
                          {item.is_active ? <><FaEye /> Show</> : <><FaEyeSlash /> Hide</>}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CARD 5: Property Statuses */}
              <div style={{ backgroundColor: '#FFFFFF', padding: '22px', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Property Statuses</h3>
                  <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: '#ECFDF5', color: '#059669', padding: '4px 10px', borderRadius: '9999px' }}>
                    {masterPropertyStatusesDb.filter(c => c.is_active).length} Active / {masterPropertyStatusesDb.length} Total
                  </span>
                </div>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newPropStatusInput.trim()) return;
                    addFilterMasterItem('property_status', newPropStatusInput.trim());
                    setNewPropStatusInput('');
                    showNotification('Property status added successfully!', 'success');
                  }}
                  style={{ display: 'flex', gap: '8px' }}
                >
                  <input
                    type="text"
                    placeholder="Add status (e.g. Ready to Move)..."
                    value={newPropStatusInput}
                    onChange={(e) => setNewPropStatusInput(e.target.value)}
                    style={{ flex: 1, padding: '9px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                  />
                  <button
                    type="submit"
                    style={{ backgroundColor: '#059669', color: '#FFFFFF', border: 'none', padding: '9px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <FaPlus /> Add
                  </button>
                </form>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
                  {masterPropertyStatusesDb.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        backgroundColor: item.is_active ? '#F8FAFC' : '#FEF2F2',
                        border: item.is_active ? '1px solid #E2E8F0' : '1px solid #FECACA',
                      }}
                    >
                      <span style={{ fontSize: '13px', fontWeight: 700, color: item.is_active ? '#0F172A' : '#991B1B' }}>
                        🔑 {item.name}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            toggleFilterMasterItemActive(item.id, 'property_status');
                            showNotification(`Property status "${item.name}" updated`, 'info');
                          }}
                          style={{ backgroundColor: item.is_active ? '#10B981' : '#CBD5E1', color: '#FFFFFF', border: 'none', padding: '5px 12px', borderRadius: '9999px', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}
                        >
                          {item.is_active ? <><FaEye /> Show</> : <><FaEyeSlash /> Hide</>}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CARD 6: Property Ownerships */}
              <div style={{ backgroundColor: '#FFFFFF', padding: '22px', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Property Ownership</h3>
                  <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: '#ECFDF5', color: '#059669', padding: '4px 10px', borderRadius: '9999px' }}>
                    {masterPropertyOwnershipsDb.filter(c => c.is_active).length} Active / {masterPropertyOwnershipsDb.length} Total
                  </span>
                </div>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newPropOwnershipInput.trim()) return;
                    addFilterMasterItem('property_ownership', newPropOwnershipInput.trim());
                    setNewPropOwnershipInput('');
                    showNotification('Property ownership added successfully!', 'success');
                  }}
                  style={{ display: 'flex', gap: '8px' }}
                >
                  <input
                    type="text"
                    placeholder="Add ownership (e.g. Individual)..."
                    value={newPropOwnershipInput}
                    onChange={(e) => setNewPropOwnershipInput(e.target.value)}
                    style={{ flex: 1, padding: '9px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                  />
                  <button
                    type="submit"
                    style={{ backgroundColor: '#059669', color: '#FFFFFF', border: 'none', padding: '9px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <FaPlus /> Add
                  </button>
                </form>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
                  {masterPropertyOwnershipsDb.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        backgroundColor: item.is_active ? '#F8FAFC' : '#FEF2F2',
                        border: item.is_active ? '1px solid #E2E8F0' : '1px solid #FECACA',
                      }}
                    >
                      <span style={{ fontSize: '13px', fontWeight: 700, color: item.is_active ? '#0F172A' : '#991B1B' }}>
                        👤 {item.name}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            toggleFilterMasterItemActive(item.id, 'property_ownership');
                            showNotification(`Property ownership "${item.name}" updated`, 'info');
                          }}
                          style={{ backgroundColor: item.is_active ? '#10B981' : '#CBD5E1', color: '#FFFFFF', border: 'none', padding: '5px 12px', borderRadius: '9999px', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}
                        >
                          {item.is_active ? <><FaEye /> Show</> : <><FaEyeSlash /> Hide</>}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CARD 6.5: Areas by City Management */}
              <div style={{ backgroundColor: '#FFFFFF', padding: '22px', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Areas by City</h3>
                  <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: '#ECFDF5', color: '#059669', padding: '4px 10px', borderRadius: '9999px' }}>
                    {masterAreasDb.filter(a => a.is_active).length} Active / {masterAreasDb.length} Total
                  </span>
                </div>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newAreaName.trim() || !selectedAreaCityId) return;
                    addArea(newAreaName.trim(), selectedAreaCityId);
                    setNewAreaName('');
                    showNotification('Area added successfully! It will now appear in filters.', 'success');
                  }}
                  style={{ display: 'flex', gap: '8px' }}
                >
                  <select 
                    value={selectedAreaCityId} 
                    onChange={(e) => setSelectedAreaCityId(e.target.value)}
                    style={{ width: '38%', padding: '9px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', backgroundColor: '#FFFFFF' }}
                  >
                    {masterLocationsDb.filter(l => l.is_active).map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Add area (e.g. Brodipet, Arundelpet)..."
                    value={newAreaName}
                    onChange={(e) => setNewAreaName(e.target.value)}
                    style={{ flex: 1, padding: '9px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                  />
                  <button
                    type="submit"
                    disabled={!selectedAreaCityId}
                    style={{ backgroundColor: selectedAreaCityId ? '#059669' : '#94A3B8', color: '#FFFFFF', border: 'none', padding: '9px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: selectedAreaCityId ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <FaPlus /> Add
                  </button>
                </form>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
                  {masterAreasDb.filter(a => !selectedAreaCityId || a.cityId === selectedAreaCityId).map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        backgroundColor: item.is_active ? '#F8FAFC' : '#FEF2F2',
                        border: item.is_active ? '1px solid #E2E8F0' : '1px solid #FECACA',
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: item.is_active ? '#0F172A' : '#991B1B' }}>
                          📌 {item.name}
                        </span>
                        <span style={{ fontSize: '10.5px', color: '#64748B', marginTop: '2px', fontWeight: 600 }}>
                          City: {masterLocationsDb.find(c => c.id === item.cityId)?.name || item.cityId}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            toggleAreaActive(item.id);
                            showNotification(`Area "${item.name}" updated`, 'info');
                          }}
                          style={{ backgroundColor: item.is_active ? '#10B981' : '#CBD5E1', color: '#FFFFFF', border: 'none', padding: '5px 12px', borderRadius: '9999px', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}
                        >
                          {item.is_active ? <><FaEye /> Show</> : <><FaEyeSlash /> Hide</>}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete area "${item.name}"?`)) {
                              deleteArea(item.id);
                              showNotification(`Area "${item.name}" deleted`, 'info');
                            }
                          }}
                          style={{ backgroundColor: '#EF4444', color: '#FFFFFF', border: 'none', padding: '5px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CARD 7: Localities & Areas Management */}
              <div style={{ backgroundColor: '#FFFFFF', padding: '22px', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Localities by Area</h3>
                  <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: '#ECFDF5', color: '#059669', padding: '4px 10px', borderRadius: '9999px' }}>
                    {masterLocalitiesDb.filter(c => c.is_active).length} Active / {masterLocalitiesDb.length} Total
                  </span>
                </div>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newLocalityName.trim() || !selectedLocalityAreaId) return;
                    addLocality(newLocalityName.trim(), selectedLocalityAreaId);
                    setNewLocalityName('');
                    showNotification('Locality added successfully!', 'success');
                  }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
                >
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select 
                      value={selectedLocalityCityId} 
                      onChange={(e) => { setSelectedLocalityCityId(e.target.value); setSelectedLocalityAreaId(''); }}
                      style={{ width: '30%', padding: '9px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', backgroundColor: '#FFFFFF' }}
                    >
                      {masterLocationsDb.filter(l => l.is_active).map(loc => (
                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                      ))}
                    </select>
                    <select 
                      value={selectedLocalityAreaId} 
                      onChange={(e) => setSelectedLocalityAreaId(e.target.value)}
                      style={{ width: '30%', padding: '9px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', backgroundColor: '#FFFFFF' }}
                    >
                      <option value="">Select Area</option>
                      {masterAreasDb.filter(a => a.cityId === selectedLocalityCityId && a.is_active).map(area => (
                        <option key={area.id} value={area.id}>{area.name}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Add locality..."
                      value={newLocalityName}
                      onChange={(e) => setNewLocalityName(e.target.value)}
                      style={{ flex: 1, padding: '9px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                    />
                    <button
                      type="submit"
                      disabled={!selectedLocalityAreaId}
                      style={{ backgroundColor: selectedLocalityAreaId ? '#059669' : '#94A3B8', color: '#FFFFFF', border: 'none', padding: '9px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: selectedLocalityAreaId ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <FaPlus /> Add
                    </button>
                  </div>
                </form>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
                  {masterLocalitiesDb.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        backgroundColor: item.is_active ? '#F8FAFC' : '#FEF2F2',
                        border: item.is_active ? '1px solid #E2E8F0' : '1px solid #FECACA',
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: item.is_active ? '#0F172A' : '#991B1B' }}>
                          📍 {item.name}
                        </span>
                        <span style={{ fontSize: '10.5px', color: '#64748B', marginTop: '2px', fontWeight: 600 }}>
                          Area: {(() => { const area = masterAreasDb.find(a => a.id === item.areaId); return area ? `${area.name} (${masterLocationsDb.find(c => c.id === area.cityId)?.name || ''})` : item.areaId; })()}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            toggleLocalityActive(item.id);
                            showNotification(`Locality "${item.name}" updated`, 'info');
                          }}
                          style={{ backgroundColor: item.is_active ? '#10B981' : '#CBD5E1', color: '#FFFFFF', border: 'none', padding: '5px 12px', borderRadius: '9999px', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}
                        >
                          {item.is_active ? <><FaEye /> Show</> : <><FaEyeSlash /> Hide</>}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

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
            {(() => {
              const enquiriesToShow = allEnquiries.length > 0 ? allEnquiries : enquiriesDb;
              
              return enquiriesToShow.length === 0 ? (
                <div style={{ backgroundColor: '#FFFFFF', padding: '60px', textAlign: 'center', border: '1px solid #E2E8F0', color: '#64748B', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", fontSize: '1.1rem', fontWeight: 700 }}>
                  NO CUSTOMER INQUIRIES RECEIVED YET.
                </div>
              ) : (
                enquiriesToShow.map(enq => (
                  <div key={enq.id} style={{ backgroundColor: '#FFFFFF', padding: '20px 24px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                        <h4 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', letterSpacing: '0.03em' }}>{enq.customerName}</h4>
                        <span style={{ padding: '2px 10px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: enq.status === 'New' ? '#FEE2E2' : '#EFF6FF', color: enq.status === 'New' ? '#DC2626' : '#1E40AF', border: enq.status === 'New' ? '1px solid #FECACA' : '1px solid #BFDBFE', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>{enq.status.toUpperCase()}</span>
                        <span style={{ color: '#94A3B8', fontSize: '0.85rem' }}>{enq.date || new Date(enq.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: '#475569' }}>
                        Inquired about: <strong style={{ color: '#0F172A' }}>{enq.listingTitle}</strong>
                        {enq.enquiryType === 'SLOT_BOOKING' && <span style={{ marginLeft: '8px', padding: '2px 8px', backgroundColor: '#FEF3C7', color: '#D97706', fontSize: '0.72rem', fontWeight: 700, borderRadius: '4px' }}>SLOT BOOKING</span>}
                      </p>
                      {enq.message && <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#475569', backgroundColor: '#F8FAFC', padding: '8px 12px', borderRadius: '6px', borderLeft: '3px solid #007A55' }}>"{enq.message}"</p>}
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>📞 {enq.phone} • ✉️ {enq.email}</p>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <select
                        value={enq.status}
                        onChange={e => handleUpdateEnquiryStatus(enq.id, e.target.value)}
                        style={{ padding: '8px 14px', border: '1px solid #E2E8F0', fontWeight: 700, fontSize: '0.85rem', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", borderRadius: '6px', outline: 'none' }}
                      >
                        <option value="New">STATUS: NEW</option>
                        <option value="Contacted">STATUS: CONTACTED</option>
                        <option value="Follow-up">STATUS: FOLLOW-UP</option>
                        <option value="Closed">STATUS: CLOSED</option>
                      </select>
                      <button
                        onClick={() => handleDeleteEnquiry(enq.id)}
                        style={{ padding: '8px 14px', backgroundColor: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA', cursor: 'pointer', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))
              );
            })()}
          </div>
        )}

        {activeTab === 'users' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>
            
            {/* Tab Section Switcher */}
            <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid #E2E8F0', paddingBottom: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setUserTabSection('customers')}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  backgroundColor: userTabSection === 'customers' ? '#007A55' : 'transparent',
                  color: userTabSection === 'customers' ? '#FFFFFF' : '#64748B',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                CUSTOMERS DIRECTORY ({customerTotalCount})
              </button>
              <button
                onClick={() => setUserTabSection('bookings')}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  backgroundColor: userTabSection === 'bookings' ? '#007A55' : 'transparent',
                  color: userTabSection === 'bookings' ? '#FFFFFF' : '#64748B',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                ALL SLOT BOOKINGS ({allBookings.length})
              </button>
              <button
                onClick={() => setUserTabSection('employees')}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  backgroundColor: userTabSection === 'employees' ? '#007A55' : 'transparent',
                  color: userTabSection === 'employees' ? '#FFFFFF' : '#64748B',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                STAFF CREDENTIALS ({employeeUsersDb.length})
              </button>
            </div>

            {/* SECTION 1: CUSTOMERS DIRECTORY */}
            {userTabSection === 'customers' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Advanced Filter Panel */}
                <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                  <div style={{ flexGrow: 1, minWidth: '220px', position: 'relative' }}>
                    <FaSearch style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    <input
                      type="text"
                      placeholder="Search name or mobile..."
                      value={customerSearch}
                      onChange={(e) => { setCustomerSearch(e.target.value); setCustomerPage(1); }}
                      style={{ width: '100%', padding: '10px 14px 10px 38px', border: '1.5px solid #E2E8F0', borderRadius: '8px', outline: 'none', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div style={{ minWidth: '150px' }}>
                    <select
                      value={customerInterestFilter}
                      onChange={(e) => { setCustomerInterestFilter(e.target.value); setCustomerPage(1); }}
                      style={{ width: '100%', padding: '10px', border: '1.5px solid #E2E8F0', borderRadius: '8px', outline: 'none', fontSize: '0.88rem', backgroundColor: '#FFFFFF', fontWeight: 600, color: '#334155' }}
                    >
                      <option value="">All Interests</option>
                      <option value="PROPERTY">Property Interest</option>
                      <option value="BUSINESS">Business Interest</option>
                    </select>
                  </div>

                  <div style={{ minWidth: '150px' }}>
                    <select
                      value={customerStatusFilter}
                      onChange={(e) => { setCustomerStatusFilter(e.target.value); setCustomerPage(1); }}
                      style={{ width: '100%', padding: '10px', border: '1.5px solid #E2E8F0', borderRadius: '8px', outline: 'none', fontSize: '0.88rem', backgroundColor: '#FFFFFF', fontWeight: 600, color: '#334155' }}
                    >
                      <option value="">All Statuses</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Blocked">Blocked</option>
                    </select>
                  </div>

                  <div style={{ minWidth: '150px' }}>
                    <input
                      type="text"
                      placeholder="Filter Area/District..."
                      value={customerAreaFilter}
                      onChange={(e) => { setCustomerAreaFilter(e.target.value); setCustomerPage(1); }}
                      style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E2E8F0', borderRadius: '8px', outline: 'none', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div>
                    <input
                      type="date"
                      value={customerDateFilter}
                      onChange={(e) => { setCustomerDateFilter(e.target.value); setCustomerPage(1); }}
                      style={{ padding: '9px 14px', border: '1.5px solid #E2E8F0', borderRadius: '8px', outline: 'none', fontSize: '0.88rem', color: '#475569' }}
                    />
                  </div>

                  {(customerSearch || customerAreaFilter || customerInterestFilter || customerStatusFilter || customerDateFilter) && (
                    <button
                      onClick={() => {
                        setCustomerSearch('');
                        setCustomerAreaFilter('');
                        setCustomerInterestFilter('');
                        setCustomerStatusFilter('');
                        setCustomerDateFilter('');
                        setCustomerPage(1);
                      }}
                      style={{ padding: '10px 16px', border: 'none', backgroundColor: '#F1F5F9', color: '#64748B', fontWeight: 700, borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      Clear Filters
                    </button>
                  )}
                </div>

                {/* Customers Table */}
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                  {customersData.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                      <FaUsers style={{ fontSize: '2.5rem', color: '#CBD5E1', marginBottom: '1rem' }} />
                      <h3 style={{ color: '#1E293B', fontSize: '1.1rem', fontWeight: 700 }}>No customers found</h3>
                      <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '0.25rem' }}>No customer records match your filter criteria.</p>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0' }}>
                            <th style={{ padding: '14px 18px', color: '#475569', fontSize: '0.82rem', fontWeight: 800 }}>Customer Name</th>
                            <th style={{ padding: '14px 18px', color: '#475569', fontSize: '0.82rem', fontWeight: 800 }}>Mobile</th>
                            <th style={{ padding: '14px 18px', color: '#475569', fontSize: '0.82rem', fontWeight: 800 }}>Gender</th>
                            <th style={{ padding: '14px 18px', color: '#475569', fontSize: '0.82rem', fontWeight: 800 }}>Area / Location</th>
                            <th style={{ padding: '14px 18px', color: '#475569', fontSize: '0.82rem', fontWeight: 800 }}>Interests</th>
                            <th style={{ padding: '14px 18px', color: '#475569', fontSize: '0.82rem', fontWeight: 800 }}>Joined Date</th>
                            <th style={{ padding: '14px 18px', color: '#475569', fontSize: '0.82rem', fontWeight: 800 }}>Last Login</th>
                            <th style={{ padding: '14px 18px', color: '#475569', fontSize: '0.82rem', fontWeight: 800 }}>Status</th>
                            <th style={{ padding: '14px 18px', color: '#475569', fontSize: '0.82rem', fontWeight: 800, textAlign: 'center' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {customersData.map((customer) => (
                            <tr key={customer.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'all 0.15s' }}>
                              <td style={{ padding: '16px 18px', fontWeight: 700, color: '#0F172A' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <img 
                                    src={customer.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.name)}&background=007A55&color=fff`} 
                                    alt={customer.name} 
                                    style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                                  />
                                  <span>{customer.name}</span>
                                </div>
                              </td>
                              <td style={{ padding: '16px 18px', color: '#475569', fontWeight: 600 }}>+91 {customer.mobile || customer.phone || 'N/A'}</td>
                              <td style={{ padding: '16px 18px', color: '#64748B', fontSize: '0.88rem' }}>{customer.gender || 'Male'}</td>
                              <td style={{ padding: '16px 18px', color: '#334155', fontSize: '0.88rem' }}>{customer.area || customer.district || 'N/A'}</td>
                              <td style={{ padding: '16px 18px', fontSize: '0.8rem' }}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                  {customer.propertyInterest && (
                                    <span style={{ backgroundColor: '#E6F4EA', color: '#007A55', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>Property</span>
                                  )}
                                  {customer.businessInterest && (
                                    <span style={{ backgroundColor: '#FFF3E0', color: '#E65100', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>Business</span>
                                  )}
                                  {!customer.propertyInterest && !customer.businessInterest && (
                                    <span style={{ color: '#94A3B8' }}>None</span>
                                  )}
                                </div>
                              </td>
                              <td style={{ padding: '16px 18px', color: '#64748B', fontSize: '0.85rem' }}>
                                {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : customer.registeredDate || 'N/A'}
                              </td>
                              <td style={{ padding: '16px 18px', color: '#64748B', fontSize: '0.85rem' }} title={customer.lastLoginAt}>
                                {customer.lastLoginAt ? customer.lastLoginAt.split(',')[0] : 'Never'}
                              </td>
                              <td style={{ padding: '16px 18px' }}>
                                <span style={{
                                  backgroundColor: customer.status === 'Active' ? '#ECFDF5' : '#FEE2E2',
                                  color: customer.status === 'Active' ? '#059669' : '#DC2626',
                                  fontSize: '0.75rem',
                                  fontWeight: 800,
                                  padding: '4px 10px',
                                  borderRadius: '6px'
                                }}>
                                  {customer.status}
                                </span>
                              </td>
                              <td style={{ padding: '16px 18px', textAlign: 'center' }}>
                                <button
                                  onClick={() => fetchCustomerDetails(customer.id)}
                                  style={{
                                    backgroundColor: '#ECFDF5',
                                    color: '#007A55',
                                    border: '1px solid #A7F3D0',
                                    padding: '6px 14px',
                                    borderRadius: '6px',
                                    fontWeight: 700,
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s'
                                  }}
                                >
                                  VIEW PROFILE
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Pagination Row */}
                  {customerTotalPages > 1 && (
                    <div style={{ padding: '16px 20px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 500 }}>
                        Showing Page <strong>{customerPage}</strong> of <strong>{customerTotalPages}</strong>
                      </span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => setCustomerPage(prev => Math.max(prev - 1, 1))}
                          disabled={customerPage === 1}
                          style={{ padding: '6px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', backgroundColor: '#FFFFFF', cursor: customerPage === 1 ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: 600, opacity: customerPage === 1 ? 0.5 : 1 }}
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setCustomerPage(prev => Math.min(prev + 1, customerTotalPages))}
                          disabled={customerPage === customerTotalPages}
                          style={{ padding: '6px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', backgroundColor: '#FFFFFF', cursor: customerPage === customerTotalPages ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: 600, opacity: customerPage === customerTotalPages ? 0.5 : 1 }}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* SECTION 1.5: ALL SLOT BOOKINGS */}
            {userTabSection === 'bookings' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase' }}>
                    ALL SCHEDULED SLOT VIEWINGS ({allBookings.length})
                  </h3>
                  <p style={{ margin: '0 0 16px 0', color: '#64748B', fontSize: '0.85rem' }}>
                    Manage slot bookings submitted by customers. You can view customer profiles, confirm, reschedule, or cancel slots.
                  </p>

                  {allBookings.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                      <FaCalendarAlt style={{ fontSize: '2.5rem', color: '#CBD5E1', marginBottom: '1rem' }} />
                      <p style={{ color: '#64748B', fontStyle: 'italic', margin: 0 }}>No slot viewings booked yet.</p>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0' }}>
                            <th style={{ padding: '14px 18px', color: '#475569', fontSize: '0.82rem', fontWeight: 800 }}>Customer</th>
                            <th style={{ padding: '14px 18px', color: '#475569', fontSize: '0.82rem', fontWeight: 800 }}>Listing Title</th>
                            <th style={{ padding: '14px 18px', color: '#475569', fontSize: '0.82rem', fontWeight: 800 }}>Type</th>
                            <th style={{ padding: '14px 18px', color: '#475569', fontSize: '0.82rem', fontWeight: 800 }}>Date</th>
                            <th style={{ padding: '14px 18px', color: '#475569', fontSize: '0.82rem', fontWeight: 800 }}>Time</th>
                            <th style={{ padding: '14px 18px', color: '#475569', fontSize: '0.82rem', fontWeight: 800 }}>Notes</th>
                            <th style={{ padding: '14px 18px', color: '#475569', fontSize: '0.82rem', fontWeight: 800 }}>Status</th>
                            <th style={{ padding: '14px 18px', color: '#475569', fontSize: '0.82rem', fontWeight: 800, textAlign: 'center' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allBookings.map((book) => {
                            let details = book.property || book.business || propertiesDb.find(p => p.id === book.listingId) || businessDb.find(b => b.id === book.listingId);
                            const title = details?.title || details?.name || `Listing ID #${book.listingId.substring(0, 6)}`;
                            
                            const getStatusColor = (status: string) => {
                              switch (status) {
                                case 'CONFIRMED': return '#059669';
                                case 'RESCHEDULED': return '#D97706';
                                case 'CANCELLED': return '#DC2626';
                                case 'COMPLETED': return '#3B82F6';
                                default: return '#64748B';
                              }
                            };

                            return (
                              <tr key={book.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'all 0.15s' }}>
                                <td style={{ padding: '16px 18px', fontWeight: 700, color: '#0F172A' }}>
                                  <div 
                                    onClick={() => fetchCustomerDetails(book.customerId)}
                                    style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
                                    title="Click to view profile"
                                  >
                                    <span>{book.customer?.name || 'Unknown User'}</span>
                                    <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 500 }}>+91 {book.customer?.mobile || book.customer?.phone || ''}</span>
                                  </div>
                                </td>
                                <td style={{ padding: '16px 18px', color: '#334155', fontWeight: 600 }}>{title}</td>
                                <td style={{ padding: '16px 18px', fontSize: '0.82rem', fontWeight: 700 }}>
                                  <span style={{ backgroundColor: book.listingType === 'PROPERTY' ? '#E6F4EA' : '#FFF3E0', color: book.listingType === 'PROPERTY' ? '#007A55' : '#E65100', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                                    {book.listingType}
                                  </span>
                                </td>
                                <td style={{ padding: '16px 18px', color: '#475569', fontSize: '0.88rem' }}>{book.bookingDate}</td>
                                <td style={{ padding: '16px 18px', color: '#475569', fontSize: '0.88rem' }}>{book.bookingTime}</td>
                                <td style={{ padding: '16px 18px', color: '#64748B', fontSize: '0.85rem', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={book.notes}>
                                  {book.notes || '-'}
                                </td>
                                <td style={{ padding: '16px 18px' }}>
                                  <select
                                    value={book.status}
                                    onChange={async (e) => {
                                      const newStatus = e.target.value;
                                      try {
                                        const res = await fetch(`${API_BASE_URL}/api/bookings/${book.id}`, {
                                          method: 'PUT',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ status: newStatus })
                                        });
                                        if (res.ok) {
                                          triggerRefresh();
                                        }
                                      } catch (err) {
                                        console.error('Failed to update booking status:', err);
                                      }
                                    }}
                                    style={{ 
                                      padding: '6px 10px', 
                                      border: '1px solid #CBD5E1', 
                                      borderRadius: '6px', 
                                      fontSize: '0.82rem', 
                                      fontWeight: 700,
                                      color: getStatusColor(book.status),
                                      backgroundColor: '#FFFFFF',
                                      outline: 'none'
                                    }}
                                  >
                                    <option value="REQUESTED">Requested</option>
                                    <option value="CONFIRMED">Confirmed</option>
                                    <option value="RESCHEDULED">Rescheduled</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="CANCELLED">Cancelled</option>
                                  </select>
                                </td>
                                <td style={{ padding: '16px 18px', textAlign: 'center' }}>
                                  <button
                                    onClick={() => fetchCustomerDetails(book.customerId)}
                                    style={{
                                      backgroundColor: '#ECFDF5',
                                      color: '#007A55',
                                      border: '1px solid #A7F3D0',
                                      padding: '6px 14px',
                                      borderRadius: '6px',
                                      fontWeight: 700,
                                      fontSize: '0.8rem',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    VIEW CUSTOMER
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SECTION 2: STAFF / EMPLOYEES CREDENTIALS */}
            {userTabSection === 'employees' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div style={{ backgroundColor: '#FFFFFF', padding: '28px', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
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

            {/* CUSTOMER DETAILED PROFILE MODAL */}
            {selectedCustomerProfile && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(4px)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px'
              }}>
                <div style={{
                  backgroundColor: '#FFFFFF',
                  width: '100%',
                  maxWidth: '960px',
                  height: '85vh',
                  borderRadius: '16px',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}>
                  {/* Modal Header */}
                  <div style={{
                    padding: '20px 28px',
                    borderBottom: '1px solid #E2E8F0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#F8FAFC'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img 
                        src={selectedCustomerProfile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedCustomerProfile.name)}&background=007A55&color=fff`} 
                        alt={selectedCustomerProfile.name} 
                        style={{ width: '45px', height: '45px', borderRadius: '50%' }}
                      />
                      <div>
                        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                          {selectedCustomerProfile.name}
                        </h2>
                        <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500 }}>
                          Customer ID: {selectedCustomerProfile.id}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedCustomerProfile(null)}
                      style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '1.4rem', padding: '6px' }}
                    >
                      <FaTimes />
                    </button>
                  </div>

                  {/* Profile Sub-Tabs */}
                  <div style={{
                    display: 'flex',
                    gap: '6px',
                    padding: '12px 28px',
                    backgroundColor: '#FFFFFF',
                    borderBottom: '1px solid #E2E8F0',
                    overflowX: 'auto'
                  }}>
                    {[
                      { id: 'overview', label: 'Overview', icon: <FaUsers /> },
                      { id: 'logins', label: 'Login History', icon: <FaLock /> },
                      { id: 'favorites', label: 'Favorites', icon: <FaHeart /> },
                      { id: 'enquiries', label: 'Property Enquiries', icon: <FaInbox /> },
                      { id: 'bookings', label: 'Slot Bookings', icon: <FaCalendarAlt /> },
                      { id: 'activity', label: 'Activity Logs', icon: <FaHistory /> },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setCustomerProfileActiveTab(tab.id as any)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 16px',
                          border: 'none',
                          borderRadius: '8px',
                          backgroundColor: customerProfileActiveTab === tab.id ? 'rgba(0,122,85,0.08)' : 'transparent',
                          color: customerProfileActiveTab === tab.id ? '#007A55' : '#64748B',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {tab.icon} {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Modal Body (Scrollable Content) */}
                  <div style={{ padding: '24px 28px', overflowY: 'auto', flexGrow: 1, backgroundColor: '#F8FAFC' }}>
                    
                    {/* PROFILE TAB 1: OVERVIEW */}
                    {customerProfileActiveTab === 'overview' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        
                        {/* Left Card: Personal Details */}
                        <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                          <h4 style={{ margin: '0 0 16px 0', fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
                            Personal Profile
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                              <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Full Name</span>
                              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B' }}>{selectedCustomerProfile.name}</span>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Mobile Number</span>
                              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B' }}>+91 {selectedCustomerProfile.mobile || selectedCustomerProfile.phone || 'N/A'}</span>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Email Address</span>
                              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B' }}>{selectedCustomerProfile.email || 'N/A'}</span>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Gender</span>
                              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B' }}>{selectedCustomerProfile.gender || 'Male'}</span>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Area / Location</span>
                              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B' }}>{selectedCustomerProfile.area || selectedCustomerProfile.district || 'N/A'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right Card: Account Stats */}
                        <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                          <h4 style={{ margin: '0 0 16px 0', fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
                            Activity Statistics
                          </h4>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                            <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
                              <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Total Logins</span>
                              <strong style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', display: 'block', marginTop: '4px' }}>{selectedCustomerProfile.loginCount}</strong>
                            </div>
                            <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
                              <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Saved Favorites</span>
                              <strong style={{ fontSize: '1.25rem', fontWeight: 800, color: '#007A55', display: 'block', marginTop: '4px' }}>{selectedCustomerProfile.favorites?.length || 0}</strong>
                            </div>
                            <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
                              <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Enquiries raised</span>
                              <strong style={{ fontSize: '1.25rem', fontWeight: 800, color: '#007A55', display: 'block', marginTop: '4px' }}>{selectedCustomerProfile.enquiries?.length || 0}</strong>
                            </div>
                            <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
                              <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Slot Bookings</span>
                              <strong style={{ fontSize: '1.25rem', fontWeight: 800, color: '#007A55', display: 'block', marginTop: '4px' }}>{selectedCustomerProfile.bookings?.length || 0}</strong>
                            </div>
                          </div>
                          
                          <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#FFFBEB', borderRadius: '8px', border: '1px solid #FCD34D', fontSize: '0.82rem', color: '#B45309', fontWeight: 600 }}>
                            ⭐ Interest Match: {selectedCustomerProfile.propertyInterest ? 'Property' : ''} {selectedCustomerProfile.propertyInterest && selectedCustomerProfile.businessInterest ? ' & ' : ''} {selectedCustomerProfile.businessInterest ? 'Business' : ''}
                          </div>
                        </div>

                      </div>
                    )}

                    {/* PROFILE TAB 2: LOGIN HISTORY */}
                    {customerProfileActiveTab === 'logins' && (
                      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                        {selectedCustomerProfile.loginHistory?.length === 0 ? (
                          <p style={{ padding: '24px', color: '#64748B', fontStyle: 'italic', margin: 0 }}>No login audits recorded.</p>
                        ) : (
                          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                <th style={{ padding: '12px 16px', color: '#475569', fontSize: '0.8rem', fontWeight: 800 }}>Date & Time</th>
                                <th style={{ padding: '12px 16px', color: '#475569', fontSize: '0.8rem', fontWeight: 800 }}>Method</th>
                                <th style={{ padding: '12px 16px', color: '#475569', fontSize: '0.8rem', fontWeight: 800 }}>Device</th>
                                <th style={{ padding: '12px 16px', color: '#475569', fontSize: '0.8rem', fontWeight: 800 }}>Browser / OS</th>
                                <th style={{ padding: '12px 16px', color: '#475569', fontSize: '0.8rem', fontWeight: 800 }}>IP Address</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedCustomerProfile.loginHistory.map((login: any) => (
                                <tr key={login.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                  <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#334155', fontWeight: 600 }}>
                                    {new Date(login.loginAt).toLocaleString()}
                                  </td>
                                  <td style={{ padding: '12px 16px', fontSize: '0.82rem', fontWeight: 700, color: '#007A55' }}>
                                    {login.loginMethod}
                                  </td>
                                  <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#475569' }}>
                                    {login.deviceType || 'Desktop'}
                                  </td>
                                  <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#475569' }}>
                                    {login.browser || 'Chrome'} / {login.operatingSystem || 'Windows'}
                                  </td>
                                  <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#64748B', fontFamily: 'monospace' }}>
                                    {login.ipAddress || '127.0.0.1'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    )}

                    {/* PROFILE TAB 3: FAVORITES */}
                    {customerProfileActiveTab === 'favorites' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {selectedCustomerProfile.favorites?.length === 0 ? (
                          <p style={{ color: '#64748B', fontStyle: 'italic', padding: '12px 0' }}>This customer has not bookmarked any listings.</p>
                        ) : (
                          selectedCustomerProfile.favorites.map((fav: any) => {
                            const details = fav.property || fav.business;
                            const title = details?.title || details?.name || `Listing ID #${fav.listingId}`;
                            const isRemoved = fav.status === 'REMOVED';

                            return (
                              <div key={fav.id} style={{ border: '1px solid #E2E8F0', padding: '14px 20px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: isRemoved ? '#FFF5F5' : '#FFFFFF' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <span style={{ fontSize: '0.7rem', color: fav.listingType === 'PROPERTY' ? '#007A55' : '#D97706', fontWeight: 800 }}>{fav.listingType}</span>
                                  <strong style={{ fontSize: '0.95rem', color: '#1E293B' }}>{title}</strong>
                                  <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Saved on {new Date(fav.createdAt).toLocaleDateString()}</span>
                                </div>
                                <span style={{
                                  backgroundColor: isRemoved ? '#FEE2E2' : '#ECFDF5',
                                  color: isRemoved ? '#DC2626' : '#059669',
                                  fontSize: '0.75rem',
                                  fontWeight: 800,
                                  padding: '4px 10px',
                                  borderRadius: '6px'
                                }}>
                                  {isRemoved ? `REMOVED (${fav.removalReason || 'Sold Out'})` : 'ACTIVE'}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}

                    {/* PROFILE TAB 4: ENQUIRIES */}
                    {customerProfileActiveTab === 'enquiries' && (
                      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                        {selectedCustomerProfile.enquiries?.length === 0 ? (
                          <p style={{ padding: '24px', color: '#64748B', fontStyle: 'italic', margin: 0 }}>No inquiries raised yet.</p>
                        ) : (
                          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                <th style={{ padding: '12px 16px', color: '#475569', fontSize: '0.8rem', fontWeight: 800 }}>Listing Title</th>
                                <th style={{ padding: '12px 16px', color: '#475569', fontSize: '0.8rem', fontWeight: 800 }}>Date</th>
                                <th style={{ padding: '12px 16px', color: '#475569', fontSize: '0.8rem', fontWeight: 800 }}>Message</th>
                                <th style={{ padding: '12px 16px', color: '#475569', fontSize: '0.8rem', fontWeight: 800 }}>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedCustomerProfile.enquiries.map((enq: any) => (
                                <tr key={enq.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                  <td style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                                    {enq.listingTitle}
                                  </td>
                                  <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: '#64748B' }}>
                                    {new Date(enq.createdAt).toLocaleDateString()}
                                  </td>
                                  <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#475569', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={enq.message}>
                                    {enq.message}
                                  </td>
                                  <td style={{ padding: '12px 16px' }}>
                                    <span style={{
                                      backgroundColor: '#ECFDF5',
                                      color: '#059669',
                                      fontSize: '0.75rem',
                                      fontWeight: 800,
                                      padding: '4px 10px',
                                      borderRadius: '6px'
                                    }}>
                                      {enq.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    )}

                    {/* PROFILE TAB 5: BOOKINGS */}
                    {customerProfileActiveTab === 'bookings' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {selectedCustomerProfile.bookings?.length === 0 ? (
                          <p style={{ color: '#64748B', fontStyle: 'italic', padding: '12px 0' }}>No slot viewings booked.</p>
                        ) : (
                          selectedCustomerProfile.bookings.map((book: any) => {
                            const details = book.property || book.business;
                            const title = details?.title || details?.name || `Listing Slot #${book.listingId}`;

                            return (
                              <div key={book.id} style={{ border: '1px solid #E2E8F0', padding: '14px 20px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <span style={{ fontSize: '0.7rem', color: '#007A55', fontWeight: 800, textTransform: 'uppercase' }}>{book.listingType} Slot</span>
                                  <strong style={{ fontSize: '0.95rem', color: '#1E293B' }}>{title}</strong>
                                  <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>
                                    <span>Date: <strong>{book.bookingDate}</strong></span>
                                    <span>Time: <strong>{book.bookingTime}</strong></span>
                                  </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <select
                                    value={book.status}
                                    onChange={async (e) => {
                                      const newStatus = e.target.value;
                                      try {
                                        const res = await fetch(`${API_BASE_URL}/api/bookings/${book.id}`, {
                                          method: 'PUT',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ status: newStatus })
                                        });
                                        if (res.ok) {
                                          // Refresh customer details modal state
                                          fetchCustomerDetails(selectedCustomerProfile.id);
                                          triggerRefresh();
                                        }
                                      } catch (err) {
                                        console.error('Failed to update booking status:', err);
                                      }
                                    }}
                                    style={{ padding: '6px 10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}
                                  >
                                    <option value="REQUESTED">Requested</option>
                                    <option value="CONFIRMED">Confirmed</option>
                                    <option value="RESCHEDULED">Rescheduled</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="CANCELLED">Cancelled</option>
                                  </select>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}

                    {/* PROFILE TAB 6: USER ACTIVITY LOG */}
                    {customerProfileActiveTab === 'activity' && (
                      <div style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '16px', marginLeft: '8px' }}>
                        {selectedCustomerProfile.activities?.length === 0 ? (
                          <p style={{ color: '#64748B', fontStyle: 'italic', margin: 0, paddingLeft: '12px' }}>No user activities logged.</p>
                        ) : (
                          selectedCustomerProfile.activities.map((act: any) => (
                            <div key={act.id} style={{ position: 'relative' }}>
                              <div style={{
                                position: 'absolute',
                                left: 'calc(-1.5rem - 6px)',
                                top: '4px',
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                backgroundColor: '#007A55',
                                border: '2px solid #FFFFFF',
                                boxShadow: '0 0 0 2px #A3D9C9'
                              }} />
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <strong style={{ fontSize: '0.9rem', color: '#1E293B' }}>{act.description}</strong>
                                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{new Date(act.createdAt).toLocaleString()}</span>
                              </div>
                              <span style={{ display: 'inline-block', fontSize: '0.68rem', backgroundColor: 'rgba(0,122,85,0.06)', color: '#007A55', padding: '2px 8px', borderRadius: '4px', marginTop: '4px', fontWeight: 700 }}>
                                {act.activityType}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {activeTab === 'roles' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif" }}>
            
            {/* Professional White Header Card */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '24px 28px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', color: '#059669', padding: '3px 10px', borderRadius: '6px', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      ACCESS & PERMISSIONS CONTROL
                    </span>
                    <span style={{ backgroundColor: '#DCFCE7', color: '#15803D', padding: '3px 10px', borderRadius: '6px', fontWeight: 700, fontSize: '0.72rem' }}>
                      LIVE DATABASE SYNC
                    </span>
                  </div>

                  <h2 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif", margin: '0 0 6px 0', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0F172A' }}>
                    Role & Permissions Access Manager
                  </h2>
                  <p style={{ margin: 0, color: '#64748B', fontSize: '0.88rem', maxWidth: '750px', lineHeight: 1.5, fontWeight: 500 }}>
                    Configure exact module visibility and granular feature sub-options per employee user. When saved, only authorized tabs will be accessible in their admin portal.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>Total Accounts: <strong style={{ color: '#0F172A' }}>{employeeUsersDb.length}</strong></span>
                </div>
              </div>
            </div>

            {/* Direct User Permission Assignment Suite */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '24px 28px', border: '1px solid #E2E8F0', borderRadius: '16px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)' }}>
              
              {/* Step 1: Select Employee Header */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
                <div style={{ maxWidth: '540px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '0.8rem', marginBottom: '8px', color: '#0F172A', letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif" }}>
                    <FaUserShield style={{ color: '#059669' }} /> SELECT EMPLOYEE USER TO CONFIGURE
                  </label>
                  <select
                    value={selectedUserForPerms}
                    onChange={(e) => handleSelectUserForPerms(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px', border: '1px solid #E2E8F0', borderRadius: '8px', outline: 'none', backgroundColor: '#FFFFFF', fontSize: '0.9rem', fontWeight: 700, color: '#0F172A', transition: 'all 0.2s', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif" }}
                  >
                    <option value="">-- Select Employee Account --</option>
                    {employeeUsersDb.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.fullName} ({emp.email}) - {emp.role}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedUserForPerms && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', padding: '18px 22px', borderRadius: '12px' }}>
                    
                    {/* Active Employee Header Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '8px', backgroundColor: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.05rem', border: '1px solid #A7F3D0' }}>
                          {employeeUsersDb.find(u => u.id === selectedUserForPerms)?.fullName.substring(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif" }}>
                              {employeeUsersDb.find(u => u.id === selectedUserForPerms)?.fullName}
                            </h3>
                            <span style={{ backgroundColor: '#DCFCE7', color: '#059669', padding: '3px 10px', borderRadius: '6px', fontWeight: 800, fontSize: '0.75rem' }}>
                              {employeeUsersDb.find(u => u.id === selectedUserForPerms)?.role}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 500, marginTop: '2px' }}>
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
                          padding: '10px 24px',
                          backgroundColor: savedUserSuccess ? '#059669' : (isSavingUserPerms ? '#6EE7B7' : '#059669'),
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.88rem',
                          cursor: isSavingUserPerms ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: '0 2px 6px rgba(5,150,105,0.2)',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          letterSpacing: '0.01em',
                          fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif"
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
                      <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #10B981', color: '#065F46', padding: '10px 16px', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaCheckCircle style={{ color: '#10B981', fontSize: '1.1rem' }} />
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
                      {tm.photo ? (
                        <img src={tm.photo} alt={tm.name} style={{ width: '64px', height: '64px', objectFit: 'cover', border: '1px solid #E2E8F0', borderRadius: '8px' }} />
                      ) : (
                        <div style={{ width: '64px', height: '64px', backgroundColor: '#E0F2FE', color: '#0369A1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', border: '1px solid #BAE6FD', borderRadius: '8px', flexShrink: 0 }}>
                          <FaUserTie />
                        </div>
                      )}
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
          const PRESET_TAGS = ['Premium', 'Featured', 'Trending', 'New', 'Exclusive', 'Top Rated'];
          const tagColorMap: Record<string, { bg: string; text: string }> = {
            'Premium': { bg: '#FEF3C7', text: '#D97706' },
            'Featured': { bg: '#EDE9FE', text: '#7C3AED' },
            'Trending': { bg: '#FEE2E2', text: '#DC2626' },
            'New': { bg: '#D1FAE5', text: '#059669' },
            'Exclusive': { bg: '#FCE7F3', text: '#DB2777' },
            'Top Rated': { bg: '#DBEAFE', text: '#2563EB' },
          };
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
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: '#64748B', fontWeight: 500 }}>Manage videos and tags displayed on the homepage carousel</p>
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

            {/* Add New Video Form — Enhanced with Upload & Tags */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '24px 28px', borderRadius: '16px', border: '1px solid #F1F5F9', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaPlus style={{ color: '#16A34A' }} /> Add New Video
              </h3>
              {(() => {
                const [addVideoUrl, setAddVideoUrl] = React.useState('');
                const [addVideoTitle, setAddVideoTitle] = React.useState('');
                const [addLinkedCategory, setAddLinkedCategory] = React.useState<'Property' | 'Franchise' | 'Business' | 'None'>('None');
                const [addLinkedId, setAddLinkedId] = React.useState('');
                const [addDisplayOrder, setAddDisplayOrder] = React.useState(videos.length + 1);
                const [addStatusActive, setAddStatusActive] = React.useState(true);
                const [addSelectedTags, setAddSelectedTags] = React.useState<string[]>([]);
                const [addCustomTag, setAddCustomTag] = React.useState('');
                const [addVideoInputMode, setAddVideoInputMode] = React.useState<'url' | 'upload'>('url');
                const [addUploading, setAddUploading] = React.useState(false);

                const handleTagToggle = (tag: string) => {
                  setAddSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
                };
                const handleAddCustomTag = () => {
                  const tag = addCustomTag.trim();
                  if (tag && !addSelectedTags.includes(tag)) {
                    setAddSelectedTags(prev => [...prev, tag]);
                    setAddCustomTag('');
                  }
                };
                const handleFileUpload = async (file: File) => {
                  setAddUploading(true);
                  try {
                    const reader = new FileReader();
                    reader.onload = async () => {
                      const base64 = (reader.result as string).split(',')[1];
                      const res = await fetch('/api/upload', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ fileName: file.name, fileData: base64, folder: 'property-images' }),
                      });
                      const data = await res.json();
                      if (data.url) {
                        setAddVideoUrl(data.url);
                        showNotification('Video uploaded successfully!');
                      } else {
                        showNotification('Upload failed', 'warning');
                      }
                      setAddUploading(false);
                    };
                    reader.readAsDataURL(file);
                  } catch {
                    showNotification('Upload failed', 'warning');
                    setAddUploading(false);
                  }
                };

                const handleSubmit = () => {
                  if (!addVideoUrl.trim() || !addVideoTitle.trim()) {
                    showNotification('Please enter Video URL and Title', 'warning');
                    return;
                  }
                  addShowcaseVideo({
                    videoUrl: addVideoUrl.trim(),
                    title: addVideoTitle.trim(),
                    linkedCategory: addLinkedCategory,
                    linkedId: addLinkedId.trim() || undefined,
                    displayOrder: addDisplayOrder,
                    status: addStatusActive ? 'Active' : 'Inactive',
                    tags: addSelectedTags,
                  });
                  showNotification(`Added "${addVideoTitle.trim()}" to showcase videos!`);
                  setAddVideoUrl(''); setAddVideoTitle(''); setAddLinkedCategory('None');
                  setAddLinkedId(''); setAddDisplayOrder(videos.length + 2);
                  setAddStatusActive(true); setAddSelectedTags([]);
                  triggerRefresh();
                };

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Video Input Mode Toggle */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                      <button onClick={() => setAddVideoInputMode('url')} style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: addVideoInputMode === 'url' ? '#16A34A' : '#FFF', color: addVideoInputMode === 'url' ? '#FFF' : '#475569', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
                        <FaLink /> Paste URL
                      </button>
                      <button onClick={() => setAddVideoInputMode('upload')} style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: addVideoInputMode === 'upload' ? '#16A34A' : '#FFF', color: addVideoInputMode === 'upload' ? '#FFF' : '#475569', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
                        <FaUpload /> Upload Video
                      </button>
                    </div>

                    {/* URL or Upload Input */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontWeight: 700, fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                          {addVideoInputMode === 'url' ? 'Video URL *' : 'Upload Video File *'}
                        </label>
                        {addVideoInputMode === 'url' ? (
                          <input value={addVideoUrl} onChange={e => setAddVideoUrl(e.target.value)} type="url" placeholder="https://example.com/video.mp4 or YouTube URL" style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.9rem', color: '#0F172A', boxSizing: 'border-box', outline: 'none', backgroundColor: '#F8FAFC' }} />
                        ) : (
                          <div style={{ position: 'relative' }}>
                            <input
                              type="file"
                              accept="video/mp4,video/webm,video/*"
                              onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }}
                              style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.9rem', color: '#0F172A', boxSizing: 'border-box', outline: 'none', backgroundColor: '#F8FAFC' }}
                            />
                            {addUploading && <span style={{ position: 'absolute', right: '12px', top: '12px', fontSize: '0.8rem', color: '#16A34A', fontWeight: 700 }}>Uploading...</span>}
                            {addVideoUrl && !addUploading && <div style={{ marginTop: '6px', fontSize: '0.78rem', color: '#16A34A', fontWeight: 600 }}>✅ Uploaded: {addVideoUrl.split('/').pop()}</div>}
                          </div>
                        )}
                      </div>
                      <div>
                        <label style={{ display: 'block', fontWeight: 700, fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Title *</label>
                        <input value={addVideoTitle} onChange={e => setAddVideoTitle(e.target.value)} type="text" placeholder="e.g. Luxury Villa Showcase" style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.9rem', color: '#0F172A', boxSizing: 'border-box', outline: 'none', backgroundColor: '#F8FAFC' }} />
                      </div>
                    </div>

                    {/* Tags Section */}
                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Tags</label>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                        {PRESET_TAGS.map(tag => {
                          const isSelected = addSelectedTags.includes(tag);
                          const colors = tagColorMap[tag] || { bg: '#F1F5F9', text: '#475569' };
                          return (
                            <button key={tag} onClick={() => handleTagToggle(tag)} style={{
                              padding: '6px 14px', borderRadius: '20px', border: isSelected ? '2px solid ' + colors.text : '1px solid #E2E8F0',
                              backgroundColor: isSelected ? colors.bg : '#FAFBFC', color: isSelected ? colors.text : '#94A3B8',
                              fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', transition: 'all 0.15s',
                              transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                            }}>
                              {isSelected ? '✓ ' : ''}{tag}
                            </button>
                          );
                        })}
                      </div>
                      {/* Custom Tag Input */}
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input value={addCustomTag} onChange={e => setAddCustomTag(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomTag(); } }}
                          placeholder="Add custom tag..." style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.85rem', color: '#0F172A', outline: 'none', backgroundColor: '#F8FAFC', width: '200px' }} />
                        <button onClick={handleAddCustomTag} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#FFF', color: '#475569', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>+ Add</button>
                      </div>
                      {/* Selected Tags Display */}
                      {addSelectedTags.length > 0 && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                          {addSelectedTags.map(tag => {
                            const colors = tagColorMap[tag] || { bg: '#F1F5F9', text: '#475569' };
                            return (
                              <span key={tag} style={{ padding: '4px 10px', borderRadius: '6px', backgroundColor: colors.bg, color: colors.text, fontWeight: 700, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {tag}
                                <span onClick={() => handleTagToggle(tag)} style={{ cursor: 'pointer', opacity: 0.7, fontWeight: 900 }}>×</span>
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontWeight: 700, fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Linked Category</label>
                        <select value={addLinkedCategory} onChange={e => setAddLinkedCategory(e.target.value as any)} style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.9rem', color: '#0F172A', boxSizing: 'border-box', outline: 'none', backgroundColor: '#F8FAFC' }}>
                          <option value="None">None</option>
                          <option value="Property">Property</option>
                          <option value="Franchise">Franchise</option>
                          <option value="Business">Business</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontWeight: 700, fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Linked ID</label>
                        <input value={addLinkedId} onChange={e => setAddLinkedId(e.target.value)} type="text" placeholder="Optional ID" style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.9rem', color: '#0F172A', boxSizing: 'border-box', outline: 'none', backgroundColor: '#F8FAFC' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontWeight: 700, fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Display Order</label>
                        <input value={addDisplayOrder} onChange={e => setAddDisplayOrder(Number(e.target.value) || 1)} type="number" min={1} style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.9rem', color: '#0F172A', boxSizing: 'border-box', outline: 'none', backgroundColor: '#F8FAFC' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontWeight: 700, fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Status</label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', cursor: 'pointer' }}>
                          <input type="checkbox" checked={addStatusActive} onChange={e => setAddStatusActive(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#16A34A' }} />
                          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0F172A' }}>Active</span>
                        </label>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button onClick={handleSubmit} style={{ padding: '12px 28px', backgroundColor: '#16A34A', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 8px rgba(22,163,74,0.25)', transition: 'all 0.2s' }}>
                        <FaPlus /> Add Showcase Video
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Video List — Enhanced with Tags */}
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', backgroundColor: '#F1F5F9', padding: '2px 8px', borderRadius: '6px' }}>{video.linkedCategory}</span>
                          {video.linkedId && <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>ID: {video.linkedId}</span>}
                          <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{video.createdDate}</span>
                          {/* Tag Chips */}
                          {(video as any).tags && (video as any).tags.length > 0 && (video as any).tags.map((tag: string, ti: number) => {
                            const colors = tagColorMap[tag] || { bg: '#F1F5F9', text: '#475569' };
                            return <span key={ti} style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', backgroundColor: colors.bg, color: colors.text }}>{tag}</span>;
                          })}
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
                              const tagsInput = window.prompt('Edit tags (comma-separated):', ((video as any).tags || []).join(', '));
                              const newTags = tagsInput !== null ? tagsInput.split(',').map((t: string) => t.trim()).filter(Boolean) : (video as any).tags || [];
                              updateShowcaseVideo(video.id, { title: newTitle.trim(), videoUrl: newUrl.trim(), displayOrder: Number(newOrder) || video.displayOrder, tags: newTags } as any);
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

            {/* ── ADMIN SIDEBAR HEADINGS & MODULE VISIBILITY CONTROL PANEL ── */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '28px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', marginTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaFolder style={{ color: '#059669' }} /> Admin Side Headings & Module Control
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748B' }}>
                    Add, Delete, or Hide/Show any side heading module. Hiding a module removes it from Admin sidebar AND public website.
                  </p>
                </div>
              </div>

              {/* Category Groups */}
              {['CONTENT MANAGEMENT', 'USER MANAGEMENT', 'SITE MANAGEMENT'].map((categoryName) => {
                const modules = adminModulesDb.filter(m => m.category === categoryName);
                return (
                  <div key={categoryName} style={{ marginBottom: '24px' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px', paddingBottom: '6px', borderBottom: '1px solid #ECFDF5' }}>
                      {categoryName}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                      {modules.map((mod) => (
                        <div key={mod.id} style={{ padding: '16px 18px', borderRadius: '12px', border: '1.5px solid #E2E8F0', backgroundColor: mod.isActive ? '#FFFFFF' : '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: mod.isActive ? '#0F172A' : '#94A3B8' }}>{mod.label}</div>
                            <div style={{ fontSize: '0.72rem', color: mod.isActive ? '#059669' : '#DC2626', fontWeight: 600, marginTop: '2px' }}>
                              {mod.isActive ? '● Visible on Admin & Web' : '○ Hidden from Web & Admin'}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {/* Toggle Button */}
                            <button
                              onClick={() => {
                                toggleAdminModuleActive(mod.id);
                                showNotification(`"${mod.label}" is now ${mod.isActive ? 'Hidden' : 'Visible'}`);
                                triggerRefresh();
                              }}
                              style={{
                                padding: '6px 14px', borderRadius: '20px', border: 'none',
                                backgroundColor: mod.isActive ? '#DCFCE7' : '#FEE2E2',
                                color: mod.isActive ? '#15803D' : '#DC2626',
                                fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer'
                              }}
                            >
                              {mod.isActive ? 'Hide' : 'Show'}
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete module "${mod.label}" permanently?`)) {
                                  deleteAdminModule(mod.id);
                                  showNotification(`Deleted "${mod.label}"`, 'warning');
                                  triggerRefresh();
                                }
                              }}
                              title="Delete Module"
                              style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #FEE2E2', backgroundColor: '#FFFFFF', color: '#DC2626', cursor: 'pointer', fontSize: '0.8rem' }}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Add New Module Form */}
              <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.92rem', fontWeight: 800, color: '#0F172A' }}>➕ Add Custom Side Heading / Module</h4>
                {(() => {
                  const [newModName, setNewModName] = React.useState('');
                  const [newModCat, setNewModCat] = React.useState<'CONTENT MANAGEMENT' | 'USER MANAGEMENT' | 'SITE MANAGEMENT'>('CONTENT MANAGEMENT');

                  const handleAdd = () => {
                    if (!newModName.trim()) return;
                    addAdminModule(newModName.trim(), newModCat);
                    showNotification(`Module "${newModName.trim()}" added!`);
                    setNewModName('');
                    triggerRefresh();
                  };

                  return (
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="e.g. Real Estate Auctions"
                        value={newModName}
                        onChange={e => setNewModName(e.target.value)}
                        style={{ padding: '9px 14px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.88rem', flexGrow: 1, minWidth: '200px' }}
                      />
                      <select
                        value={newModCat}
                        onChange={e => setNewModCat(e.target.value as any)}
                        style={{ padding: '9px 14px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.88rem', fontWeight: 600, color: '#0F172A' }}
                      >
                        <option value="CONTENT MANAGEMENT">CONTENT MANAGEMENT</option>
                        <option value="USER MANAGEMENT">USER MANAGEMENT</option>
                        <option value="SITE MANAGEMENT">SITE MANAGEMENT</option>
                      </select>
                      <button
                        onClick={handleAdd}
                        style={{ padding: '10px 22px', backgroundColor: '#059669', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer' }}
                      >
                        + Add Module
                      </button>
                    </div>
                  );
                })()}
              </div>
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
                <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>TOTAL OTP LOGINS</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#8B5CF6', marginTop: '6px' }}>
                  {customerLoginHistory.length}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, marginTop: '4px' }}>Real Login Sessions</div>
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

            {/* Real-Time OTP Login Activity Logs */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginTop: '24px' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>OTP Login Activity Logs</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '4px 0 0 0' }}>Real-time audit log of all successful mobile OTP logins generated directly from the database.</p>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: 700 }}>
                      <th style={{ padding: '16px 24px' }}>Customer Profile</th>
                      <th style={{ padding: '16px 20px' }}>Contact Phone</th>
                      <th style={{ padding: '16px 20px' }}>Location</th>
                      <th style={{ padding: '16px 20px' }}>Device & OS</th>
                      <th style={{ padding: '16px 20px' }}>Browser</th>
                      <th style={{ padding: '16px 20px' }}>IP Address</th>
                      <th style={{ padding: '16px 24px' }}>Login Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerLoginHistory.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: '#64748B', fontWeight: 600 }}>No OTP login history found.</td>
                      </tr>
                    ) : (
                      customerLoginHistory.map((log: any) => (
                        <tr key={log.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '16px 24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <img
                                src={log.customer?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(log.customer?.name || 'User')}&background=007A55&color=fff`}
                                alt={log.customer?.name}
                                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                              />
                              <div>
                                <div style={{ fontWeight: 800, color: '#0F172A' }}>{log.customer?.name || 'Verified Investor'}</div>
                                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{log.customer?.email}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '16px 20px', fontWeight: 700, color: '#0F172A' }}>{log.customer?.phone || 'N/A'}</td>
                          <td style={{ padding: '16px 20px', color: '#047857', fontWeight: 700 }}>{log.customer?.district || log.customer?.area || 'Hyderabad'}</td>
                          <td style={{ padding: '16px 20px', color: '#475569' }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{log.device || 'Mobile'}</span>
                            <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block' }}>{log.os || 'Android'}</span>
                          </td>
                          <td style={{ padding: '16px 20px', color: '#475569', fontSize: '0.82rem' }}>{log.browser || 'Chrome'}</td>
                          <td style={{ padding: '16px 20px', fontFamily: 'monospace', color: '#64748B', fontSize: '0.8rem' }}>{log.ipAddress || '127.0.0.1'}</td>
                          <td style={{ padding: '16px 24px', fontSize: '0.82rem', color: '#0F172A', fontWeight: 600 }}>{log.loginAt ? new Date(log.loginAt).toLocaleString() : 'Just now'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', marginBottom: '8px', color: '#475569', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>AREA / LOCALITY</label>
                  <input type="text" value={editingProperty.area || ''} onChange={e => setEditingProperty({ ...editingProperty, area: e.target.value })} placeholder="e.g. HITEC City" style={{ width: '100%', padding: '12px', border: '1px solid #E2E8F0' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', marginBottom: '8px', color: '#059669', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>SUB-LOCATION / LANDMARK (MANUAL ENTRY)</label>
                  <input type="text" value={editingProperty.subLocation || editingProperty.landmark || ''} onChange={e => setEditingProperty({ ...editingProperty, subLocation: e.target.value, landmark: e.target.value })} placeholder="e.g. Phase 2, Near Cyber Towers" style={{ width: '100%', padding: '12px', border: '1.5px solid #059669', backgroundColor: '#ECFDF5' }} />
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
