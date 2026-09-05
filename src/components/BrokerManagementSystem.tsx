import React, { useState, useMemo } from 'react';
import { 
  dealersDb, 
  addDealer, 
  updateDealer, 
  deleteDealer, 
  propertiesDb, 
  franchiseDb, 
  businessDb,
  enquiriesDb
} from '../db/marketplaceDb';
import type { Dealer } from '../db/marketplaceDb';
import { 
  FaUserTie, FaSearch, FaFilter, FaPlus, FaEdit, FaTrash, FaCheckCircle, 
  FaFileExport, 
  FaCrown, FaStar, FaBuilding, 
  FaMedal, FaChartPie, FaChartLine, FaCheck, FaTimes
} from 'react-icons/fa';

interface BrokerManagementSystemProps {
  showNotification: (msg: string, type?: string) => void;
  activeSubTab?: string;
  onSubTabChange?: (tab: string) => void;
}

const PROPERTY_CATEGORIES_LIST = [
  'Flats', 'Apartments', 'Individual Houses', 'Villas', 
  'Residential Plots', 'Commercial Properties', 'Agricultural Lands', 
  'Farm Lands', 'Luxury Properties'
];

const FRANCHISE_CATEGORIES_LIST = [
  'Food', 'Healthcare', 'Retail', 'Education', 
  'Automotive', 'Beauty', 'Technology', 'Existing Business', 'New Franchise'
];

export const BrokerManagementSystem: React.FC<BrokerManagementSystemProps> = ({ showNotification, activeSubTab, onSubTabChange }) => {
  const [activeTab, setActiveTab] = useState<'directory' | 'leaderboard' | 'premium' | 'category_rank' | 'location_rank' | 'analytics'>('directory');

  // Trigger re-render on global data change
  const [dataUpdated, setDataUpdated] = useState(0);
  React.useEffect(() => {
    const handleDataChange = () => setDataUpdated(prev => prev + 1);
    window.addEventListener('nexopp_data_changed', handleDataChange);
    return () => window.removeEventListener('nexopp_data_changed', handleDataChange);
  }, []);

  React.useEffect(() => {
    if (activeSubTab) {
      if (activeSubTab === 'add') {
        openNewBrokerModal();
      } else if (activeSubTab === 'kyc' || activeSubTab === 'premium') {
        setActiveTab('premium');
      } else if (activeSubTab === 'analytics') {
        setActiveTab('analytics');
      } else if (['directory', 'leaderboard', 'premium', 'category_rank', 'location_rank', 'analytics'].includes(activeSubTab)) {
        setActiveTab(activeSubTab as any);
      } else {
        setActiveTab('directory');
      }
    }
  }, [activeSubTab]);

  // Directory Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive' | 'Premium' | 'Verified'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'personal' | 'professional' | 'categories' | 'service_areas' | 'contact' | 'performance'>('personal');
  const [editingBrokerId, setEditingBrokerId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State for Add / Edit
  const [formData, setFormData] = useState<Partial<Dealer>>({
    companyName: '',
    fullName: '',
    mobileNumber: '',
    email: '',
    dob: '1985-06-15',
    gender: 'Male',
    photo: '',
    logo: '',
    yearsExperience: 5,
    reraNumber: '',
    languages: 'English, Telugu, Hindi',
    specialization: 'Residential & Commercial',
    areasOfExpertise: ['Apartments', 'Villas'],
    propertyCategories: ['Flats', 'Apartments', 'Villas'],
    franchiseCategories: ['Food', 'Retail'],
    serviceAreas: [
      { state: 'Telangana', district: 'Hyderabad', city: 'Hyderabad', area: 'Banjara Hills', pincode: '500034' }
    ],
    officeAddress: '',
    googleMapsLink: '',
    phone: '',
    whatsapp: '',
    alternateMobile: '',
    socialLinks: { website: '', facebook: '', instagram: '', linkedin: '' },
    rating: 4.8,
    reviewCount: 25,
    verified: true,
    premiumPartner: false,
    featured: false,
    status: 'Active',
    totalPropertiesSold: 15,
    totalFranchiseDealsClosed: 5,
    revenueGenerated: 10.5,
    successRate: 92,
    totalLeadsHandled: 80,
    responseTime: 'Within 30 mins',
    coverage: { 'Hyderabad': 1 }
  });

  // Leaderboard filters
  const [timePeriod, setTimePeriod] = useState<'Today' | 'This Week' | 'This Month' | 'This Year' | 'Overall'>('Overall');
  const [sortBy, setSortBy] = useState<'sales' | 'revenue' | 'leads' | 'rating' | 'response'>('sales');
  const [leaderboardLimit, setLeaderboardLimit] = useState<'10' | '25' | '50' | 'All'>('All');

  // Category ranking state
  const [selectedCategory, setSelectedCategory] = useState<string>('Flats');

  // Location ranking state
  const [filterState, setFilterState] = useState('All');
  const [filterDistrict, setFilterDistrict] = useState('All');
  const [filterCity, setFilterCity] = useState('All');
  const [filterAreaSearch, setFilterAreaSearch] = useState('');

  // Open modal for new broker
  const openNewBrokerModal = () => {
    setEditingBrokerId(null);
    setFormData({
      id: `D${Date.now()}`,
      companyName: '',
      fullName: '',
      name: '',
      mobileNumber: '',
      phone: '',
      email: '',
      dob: '',
      gender: 'Male',
      photo: '',
      logo: '',
      yearsExperience: 5,
      reraNumber: '',
      languages: 'English, Telugu, Hindi',
      specialization: 'Residential & Commercial',
      areasOfExpertise: ['Apartments', 'Villas'],
      propertyCategories: ['Flats', 'Apartments', 'Villas'],
      franchiseCategories: ['Food', 'Retail'],
      serviceAreas: [],
      officeAddress: '',
      whatsapp: '',
      rating: 4.8,
      reviewCount: 25,
      verified: true,
      premiumPartner: false,
      featured: false,
      status: 'Active',
      totalPropertiesSold: 0,
      totalFranchiseDealsClosed: 0,
      revenueGenerated: 0,
      successRate: 0,
      totalLeadsHandled: 0,
      responseTime: 'Within 30 mins',
      coverage: {}
    });
    setModalTab('personal');
    setIsModalOpen(true);
  };

  // Open modal to edit broker
  const openEditBrokerModal = (broker: Dealer) => {
    setEditingBrokerId(broker.id);
    setFormData({
      ...broker,
      fullName: broker.fullName || broker.name || broker.companyName || '',
      name: broker.fullName || broker.name || broker.companyName || '',
      companyName: broker.companyName || broker.fullName || '',
      mobileNumber: broker.mobileNumber || broker.phone || '',
      phone: broker.phone || broker.mobileNumber || '',
      rating: typeof broker.rating === 'number' ? broker.rating : (parseFloat(String(broker.rating)) || 4.8),
      reviewCount: typeof broker.reviewCount === 'number' ? broker.reviewCount : (parseInt(String(broker.reviewCount), 10) || 0),
      propertyCategories: broker.propertyCategories || ['Flats', 'Apartments'],
      franchiseCategories: broker.franchiseCategories || ['Food'],
      serviceAreas: broker.serviceAreas && broker.serviceAreas.length > 0 ? broker.serviceAreas : [
        { state: 'Telangana', district: 'Hyderabad', city: 'Hyderabad', area: 'Jubilee Hills', pincode: '500033' }
      ]
    });
    setModalTab('personal');
    setIsModalOpen(true);
  };

  const handleSaveBroker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    const fullName = (formData.fullName || formData.name || '').trim();
    const companyName = (formData.companyName || formData.fullName || '').trim();

    if (!fullName && !companyName) {
      showNotification("Please enter Full Name or Company Name.", "warning");
      return;
    }

    const ratingNum = formData.rating !== undefined && formData.rating !== null && String(formData.rating) !== '' ? parseFloat(String(formData.rating)) : 4.8;
    const cleanRating = isNaN(ratingNum) ? 4.8 : Math.max(0, Math.min(5, Number(ratingNum.toFixed(1))));

    const finalBrokerData: Partial<Dealer> = {
      ...formData,
      fullName: fullName || companyName,
      name: fullName || companyName,
      companyName: companyName || fullName,
      phone: formData.phone || formData.mobileNumber || '',
      mobileNumber: formData.mobileNumber || formData.phone || '',
      rating: cleanRating,
      reviewCount: Number(formData.reviewCount) || 0,
      yearsExperience: Number(formData.yearsExperience) || 0,
      status: formData.status || 'Active',
      verified: formData.verified !== false
    };

    try {
      setIsSaving(true);
      if (editingBrokerId) {
        await updateDealer(editingBrokerId, finalBrokerData);
        showNotification(`Broker '${finalBrokerData.fullName || finalBrokerData.companyName}' updated in database!`);
      } else {
        const newBroker: Dealer = {
          ...finalBrokerData as Dealer,
          id: formData.id || `D${Date.now()}`,
          inventoryCount: propertiesDb.filter(p => p.dealerId === formData.id).length
        };
        await addDealer(newBroker);
        showNotification(`New Broker '${newBroker.fullName || newBroker.companyName}' registered in database!`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showNotification(`Broker was not saved: ${err?.message || 'database request failed'}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // CSV Export
  const exportToCSV = () => {
    const headers = ['ID', 'Company Name', 'Full Name', 'Phone', 'Email', 'Experience (Yrs)', 'Rating', 'Properties Sold', 'Franchise Deals', 'Revenue (Cr)', 'Status', 'Premium'];
    const rows = dealersDb.map(d => [
      d.id,
      `"${d.companyName || ''}"`,
      `"${d.fullName || ''}"`,
      `"${d.phone || d.mobileNumber || ''}"`,
      `"${d.email || ''}"`,
      d.yearsExperience || 0,
      d.rating || 0,
      d.totalPropertiesSold || 0,
      d.totalFranchiseDealsClosed || 0,
      d.revenueGenerated || 0,
      d.status || 'Active',
      d.premiumPartner ? 'YES' : 'NO'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `TheNexOpp_Brokers_Export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification("Broker database exported to CSV.");
  };

  // Filtered Brokers for Directory
  const filteredBrokers = useMemo(() => {
    return dealersDb.filter(b => {
      const matchSearch = searchTerm === '' || 
        b.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.fullName && b.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (b.phone && b.phone.includes(searchTerm)) ||
        (b.email && b.email.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchStatus = statusFilter === 'All' ||
        (statusFilter === 'Active' && (b.status === 'Active' || !b.status)) ||
        (statusFilter === 'Inactive' && b.status === 'Inactive') ||
        (statusFilter === 'Premium' && b.premiumPartner) ||
        (statusFilter === 'Verified' && b.verified);

      return matchSearch && matchStatus;
    });
  }, [dealersDb, searchTerm, statusFilter, dataUpdated]);

  // Leaderboard sorted brokers
  const leaderboardBrokers = useMemo(() => {
    const multiplier = timePeriod === 'Today' ? 0.05 : timePeriod === 'This Week' ? 0.15 : timePeriod === 'This Month' ? 0.35 : timePeriod === 'This Year' ? 0.8 : 1.0;
    
    const calculated = dealersDb.map(b => {
      const brokerProps = propertiesDb.filter(p => p.dealerId === b.id || (p.agentName && b.companyName && p.agentName.toLowerCase() === b.companyName.toLowerCase()));
      const soldProps = brokerProps.filter(p => p.sold || p.listingStatus === 'Sold' || p.approvalStatus === 'Sold');
      const dynamicSold = soldProps.length;
      const dynamicRevenue = soldProps.reduce((acc, p) => acc + (p.price || 0), 0) / 10000000;

      const totalSold = b.totalPropertiesSold ?? dynamicSold;
      const totalRevenue = b.revenueGenerated ?? parseFloat(dynamicRevenue.toFixed(2));

      return {
        ...b,
        totalPropertiesSold: totalSold,
        revenueGenerated: totalRevenue,
        calcSales: Math.round(totalSold * multiplier),
        calcFranchise: Math.round((b.totalFranchiseDealsClosed || 0) * multiplier),
        calcRevenue: parseFloat((totalRevenue * multiplier).toFixed(2)),
        calcLeads: Math.round((b.totalLeadsHandled || 0) * multiplier)
      };
    });

    const sorted = calculated.sort((a, b) => {
      if (sortBy === 'sales') return (b.calcSales + b.calcFranchise) - (a.calcSales + a.calcFranchise);
      if (sortBy === 'revenue') return b.calcRevenue - a.calcRevenue;
      if (sortBy === 'leads') return b.calcLeads - a.calcLeads;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return parseInt(a.responseTime || '0') - parseInt(b.responseTime || '0');
    });

    if (leaderboardLimit === 'All') return sorted;
    return sorted.slice(0, parseInt(leaderboardLimit));
  }, [dealersDb, propertiesDb, timePeriod, sortBy, leaderboardLimit, dataUpdated]);

  // Category ranked brokers
  const categoryRankedBrokers = useMemo(() => {
    return dealersDb.filter(b => {
      if (!b.propertyCategories) return true;
      return b.propertyCategories.includes(selectedCategory);
    }).sort((a, b) => (b.totalPropertiesSold || 0) - (a.totalPropertiesSold || 0));
  }, [dealersDb, selectedCategory, dataUpdated]);

  // Location ranked brokers
  const locationRankedBrokers = useMemo(() => {
    return dealersDb.filter(b => {
      const areas = b.serviceAreas || [];
      const matchState = filterState === 'All' || areas.some(a => a.state.toLowerCase() === filterState.toLowerCase());
      const matchDistrict = filterDistrict === 'All' || areas.some(a => a.district.toLowerCase() === filterDistrict.toLowerCase());
      const matchCity = filterCity === 'All' || areas.some(a => a.city.toLowerCase() === filterCity.toLowerCase());
      const matchArea = filterAreaSearch === '' || areas.some(a => a.area.toLowerCase().includes(filterAreaSearch.toLowerCase()));
      return matchState && matchDistrict && matchCity && matchArea;
    }).sort((a, b) => (b.totalPropertiesSold || 0) - (a.totalPropertiesSold || 0));
  }, [dealersDb, filterState, filterDistrict, filterCity, filterAreaSearch, dataUpdated]);

  // Real-time dynamic broker metrics
  const brokerMetrics = useMemo(() => {
    const totalBrokers = dealersDb.length;
    const activeBrokers = dealersDb.filter(d => d.status !== 'Inactive').length;
    const premiumBrokers = dealersDb.filter(d => d.premiumPartner).length;
    const verifiedBrokers = dealersDb.filter(d => d.verified).length;

    // Real property sales calculated from propertiesDb + broker declared sales
    const dbSoldProps = propertiesDb.filter(p => p.sold || p.recentlySold || p.listingStatus === 'Sold').length;
    const brokerDeclaredSales = dealersDb.reduce((acc, d) => acc + (d.totalPropertiesSold || 0), 0);
    const totalPropertySales = Math.max(dbSoldProps, brokerDeclaredSales);

    // Real franchise deals
    const dbSoldFranchise = franchiseDb.filter(f => (f as any).sold || (f as any).status === 'Closed' || (f as any).status === 'Sold').length;
    const brokerDeclaredFranchise = dealersDb.reduce((acc, d) => acc + (d.totalFranchiseDealsClosed || 0), 0);
    const totalFranchiseDeals = Math.max(dbSoldFranchise, brokerDeclaredFranchise);

    // Real avg rating
    const avgRating = totalBrokers > 0
      ? (dealersDb.reduce((acc, d) => acc + (typeof d.rating === 'number' ? d.rating : (parseFloat(String(d.rating)) || 4.8)), 0) / totalBrokers).toFixed(1)
      : '0.0';

    // Real conversion rate
    const totalEnquiries = enquiriesDb.length;
    const resolvedEnquiries = enquiriesDb.filter(e => (e.status as string) === 'Resolved' || (e.status as string) === 'Closed' || (e as any).status === 'Converted').length;
    const totalListings = propertiesDb.length + businessDb.length + franchiseDb.length;
    const totalSoldListings = propertiesDb.filter(p => p.sold || p.recentlySold).length + businessDb.filter(b => (b as any).sold).length;

    let conversionRate = '0.0%';
    if (totalEnquiries > 0) {
      conversionRate = `${((resolvedEnquiries / totalEnquiries) * 100).toFixed(1)}%`;
    } else if (totalListings > 0 && totalSoldListings > 0) {
      conversionRate = `${((totalSoldListings / totalListings) * 100).toFixed(1)}%`;
    } else if (totalBrokers > 0) {
      const avgRate = dealersDb.reduce((acc, d) => acc + (d.successRate || 0), 0) / totalBrokers;
      conversionRate = avgRate > 0 ? `${avgRate.toFixed(1)}%` : '0.0%';
    }

    // Monthly Performance (2026) calculated from real listings / enquiries
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const activeMonths = monthNames.slice(0, Math.max(6, currentMonth + 1));

    const monthlyData = activeMonths.map((m, idx) => {
      const pCount = propertiesDb.filter(p => {
        const d = new Date(p.createdDate || (p as any).createdAt || '');
        return !isNaN(d.getTime()) && d.getMonth() === idx;
      }).length;
      const eCount = enquiriesDb.filter(e => {
        const d = new Date((e as any).createdAt || (e as any).date || '');
        return !isNaN(d.getTime()) && d.getMonth() === idx;
      }).length;
      return { month: m, count: pCount + eCount };
    });

    const maxMonthVal = Math.max(...monthlyData.map(d => d.count), 1);
    const monthlyFormatted = monthlyData.map(d => ({
      ...d,
      barHeight: d.count === 0 ? 12 : Math.max(20, Math.min(140, Math.round((d.count / maxMonthVal) * 130)))
    }));

    // Top Revenue Contributing Brokers (₹ Cr)
    const brokerRevenues = dealersDb.map(d => {
      const bProps = propertiesDb.filter(p => 
        p.dealerId === d.id || 
        (p.agentName && (p.agentName.toLowerCase() === (d.companyName || '').toLowerCase() || p.agentName.toLowerCase() === (d.fullName || '').toLowerCase()))
      );
      const propRev = bProps.reduce((sum, p) => sum + (p.price || 0), 0) / 10000000; // Crores
      const declaredRev = typeof d.revenueGenerated === 'number' && d.revenueGenerated > 0 ? d.revenueGenerated : 0;
      const computedRev = declaredRev > 0 ? declaredRev : Number(propRev.toFixed(2));
      return {
        id: d.id,
        name: d.fullName || d.companyName || 'Broker',
        companyName: d.companyName || d.fullName || 'Broker',
        revenue: computedRev,
        propertiesCount: bProps.length
      };
    }).sort((a, b) => b.revenue - a.revenue);

    const totalRevenueSum = Number(brokerRevenues.reduce((acc, b) => acc + b.revenue, 0).toFixed(2));
    const topRevenueBrokers = brokerRevenues.slice(0, 6).map(b => ({
      ...b,
      pct: totalRevenueSum > 0 ? Math.round((b.revenue / totalRevenueSum) * 100) : 0
    }));

    return {
      totalBrokers,
      activeBrokers,
      premiumBrokers,
      verifiedBrokers,
      totalPropertySales,
      totalFranchiseDeals,
      avgRating,
      conversionRate,
      monthlySales: monthlyFormatted,
      topRevenueBrokers,
      totalRevenueSum
    };
  }, [dealersDb, propertiesDb, franchiseDb, businessDb, enquiriesDb, dataUpdated]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>
      
      {/* Top Header & Navigation Tabs */}
      <div style={{ backgroundColor: '#FFFFFF', padding: '24px 30px', border: '1px solid #E2E8F0', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", fontSize: '1.6rem', fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FaUserTie style={{ color: '#1E40AF' }} /> EXECUTIVE BROKER MANAGEMENT SYSTEM
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.9rem', margin: 0 }}>
              Comprehensive administration for realty brokers, franchise advisors, leaderboards, location analytics, and public profile syndication.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={exportToCSV}
              style={{ padding: '10px 18px', backgroundColor: '#F1F5F9', color: '#334155', border: '1px solid #CBD5E1', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <FaFileExport /> EXPORT DATA
            </button>
            <button
              onClick={openNewBrokerModal}
              style={{ padding: '10px 20px', backgroundColor: '#059669', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(5,150,105,0.25)' }}
            >
              <FaPlus /> REGISTER NEW BROKER
            </button>
          </div>
        </div>

        {/* Navigation Subtabs Bar */}
        <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #F1F5F9', paddingTop: '16px', overflowX: 'auto' }}>
          {[
            { id: 'directory', label: 'Broker Directory', count: dealersDb.length, icon: FaUserTie },
            { id: 'leaderboard', label: 'Top Leaderboard', count: dealersDb.filter(d => (d.totalPropertiesSold || 0) > 0).length, icon: FaMedal },
            { id: 'premium', label: 'Premium Privileges & KYC', count: dealersDb.filter(d => d.premiumPartner).length, icon: FaCrown },
            { id: 'analytics', label: 'Revenue Analytics', count: brokerMetrics.totalRevenueSum ? `₹${brokerMetrics.totalRevenueSum.toFixed(1)}Cr` : '0', icon: FaChartLine }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                onSubTabChange?.(tab.id);
              }}
              style={{
                padding: '10px 18px',
                border: 'none',
                borderBottom: activeTab === tab.id ? '3px solid #059669' : '3px solid transparent',
                backgroundColor: activeTab === tab.id ? '#ECFDF5' : 'transparent',
                color: activeTab === tab.id ? '#059669' : '#475569',
                fontWeight: 800,
                fontSize: '0.88rem',
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s'
              }}
            >
              <tab.icon /> {tab.label}
              <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', backgroundColor: activeTab === tab.id ? '#A7F3D0' : '#F1F5F9', color: activeTab === tab.id ? '#065F46' : '#64748B' }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

      </div>

      {/* ================= TAB 1: DIRECTORY & PROFILE MANAGEMENT ================= */}
      {activeTab === 'directory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Search & Status Filters */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '18px 24px', border: '1px solid #E2E8F0', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ position: 'relative', flexGrow: 1, maxWidth: '450px' }}>
              <FaSearch style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input
                type="text"
                placeholder="Search by broker name, agency, phone, or email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '10px 14px 10px 40px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}><FaFilter /> Status:</span>
              {(['All', 'Active', 'Inactive', 'Premium', 'Verified'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: statusFilter === status ? '1px solid #1E40AF' : '1px solid #E2E8F0',
                    backgroundColor: statusFilter === status ? '#1E40AF' : '#F8FAFC',
                    color: statusFilter === status ? '#FFFFFF' : '#475569',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Broker Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' }}>
            {filteredBrokers.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', backgroundColor: '#FFFFFF', padding: '60px', textAlign: 'center', border: '1px solid #E2E8F0', borderRadius: '12px', color: '#64748B' }}>
                <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>No brokers match your filter criteria.</p>
              </div>
            ) : (
              filteredBrokers.map(broker => (
                <div key={broker.id} style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  
                  {/* Card Header Banner */}
                  <div style={{ padding: '16px 20px', backgroundColor: '#F8FAFC', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, backgroundColor: broker.status === 'Inactive' ? '#FEE2E2' : '#DCFCE7', color: broker.status === 'Inactive' ? '#DC2626' : '#16A34A' }}>
                        {broker.status || 'Active'}
                      </span>
                      {broker.premiumPartner && (
                        <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaCrown /> PREMIUM
                        </span>
                      )}
                      {broker.verified && (
                        <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, backgroundColor: '#EFF6FF', color: '#1E40AF', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaCheckCircle /> VERIFIED
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B' }}>ID: {broker.id}</span>
                  </div>

                  {/* Body Profile Info */}
                  <div style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'flex-start', flexGrow: 1 }}>
                    {broker.photo ? (
                      <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '3px solid #1E40AF', flexShrink: 0, overflow: 'hidden', backgroundColor: '#EFF6FF' }}>
                        <img src={broker.photo} alt={broker.companyName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </div>
                    ) : (
                      <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#1E40AF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF', border: '3px solid #1E40AF' }}>
                        {(broker.fullName || broker.companyName || 'B').substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                      <h4 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0', wordBreak: 'break-word' }}>{broker.companyName || 'N/A'}</h4>
                      <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E40AF', margin: '0 0 8px 0', wordBreak: 'break-word' }}>{broker.fullName || 'Authorized Partner'}</p>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: '#475569', marginBottom: '8px' }}>
                        <span>Exp: <strong>{broker.yearsExperience} Yrs</strong></span>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: '#64748B', margin: '0 0 8px 0', lineHeight: 1.5 }}>
                        <div>Phone: {broker.phone || broker.mobileNumber}</div>
                        <div>Email: {broker.email || 'N/A'}</div>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {(broker.propertyCategories || ['Flats', 'Villas']).slice(0, 3).map(cat => (
                          <span key={cat} style={{ padding: '2px 8px', backgroundColor: '#F1F5F9', borderRadius: '4px', fontSize: '0.72rem', color: '#334155', fontWeight: 600 }}>{cat}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics Bar */}
                  {(() => {
                    const brokerProperties = propertiesDb.filter(p => p.dealerId === broker.id || (p.assignedBrokerIds && p.assignedBrokerIds.includes(broker.id)));
                    const brokerPropertyListed = brokerProperties.filter(p => p.approvalStatus !== 'Sold' && p.listingStatus !== 'Sold').length;
                    const brokerPropertySold = brokerProperties.filter(p => p.approvalStatus === 'Sold' || p.listingStatus === 'Sold').length;
                    const brokerBusinessCount = businessDb.filter(b => b.dealerId === broker.id || b.brokerId === broker.id || (b.assignedBrokerIds && b.assignedBrokerIds.includes(broker.id))).length;
                    const brokerFranchiseCount = franchiseDb.filter(f => (f as any).dealerId === broker.id || (f as any).brokerId === broker.id || ((f as any).assignedBrokerIds && (f as any).assignedBrokerIds.includes(broker.id))).length;
                    const totalBizFranchise = brokerBusinessCount + brokerFranchiseCount;
                    return (
                      <div style={{ padding: '12px 20px', backgroundColor: '#F8FAFC', borderTop: '1px solid #F1F5F9', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', textAlign: 'center', gap: '8px' }}>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>PROPERTIES</div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>{brokerPropertyListed} Listed</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>SOLD</div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#16A34A' }}>{brokerPropertySold} Sold</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>BUSINESSES</div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>{totalBizFranchise} Listed</div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Action Buttons */}
                  <div style={{ padding: '14px 20px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                    <button
                      onClick={() => openEditBrokerModal(broker)}
                      style={{ flexGrow: 1, padding: '8px', backgroundColor: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <FaEdit /> EDIT PROFILE
                    </button>
                    <button
                      onClick={() => {
                        const nextStatus = broker.status === 'Inactive' ? 'Active' : 'Inactive';
                        updateDealer(broker.id, { status: nextStatus });
                        showNotification(`Broker status updated to ${nextStatus}.`);
                      }}
                      style={{ padding: '8px 12px', backgroundColor: '#F8FAFC', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                      title="Toggle Active Status"
                    >
                      {broker.status === 'Inactive' ? <FaCheck style={{ color: '#16A34A' }} /> : <FaTimes style={{ color: '#DC2626' }} />}
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete broker '${broker.companyName}'?`)) {
                          deleteDealer(broker.id);
                          showNotification("Broker deleted successfully.", "warning");
                        }
                      }}
                      style={{ padding: '8px 12px', backgroundColor: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: '6px', cursor: 'pointer' }}
                      title="Delete Broker"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: BROKER LEADERBOARD ================= */}
      {activeTab === 'leaderboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Leaderboard Controls */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '18px 24px', border: '1px solid #E2E8F0', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Time Period:</span>
              {(['Today', 'This Week', 'This Month', 'This Year', 'Overall'] as const).map(tp => (
                <button
                  key={tp}
                  onClick={() => setTimePeriod(tp)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: timePeriod === tp ? '1px solid #1E40AF' : '1px solid #E2E8F0',
                    backgroundColor: timePeriod === tp ? '#1E40AF' : '#F8FAFC',
                    color: timePeriod === tp ? '#FFFFFF' : '#475569',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {tp}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Sort By:</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontWeight: 600, fontSize: '0.85rem' }}
                >
                  <option value="sales">Highest Sales Count</option>
                  <option value="revenue">Highest Revenue (₹ Cr)</option>
                  <option value="leads">Most Leads Handled</option>
                  <option value="rating">Best Customer Rating</option>
                  <option value="response">Fastest Response Time</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Display:</span>
                {(['10', '25', '50', 'All'] as const).map(l => (
                  <button
                    key={l}
                    onClick={() => setLeaderboardLimit(l)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '4px',
                      border: leaderboardLimit === l ? '1px solid #1E40AF' : '1px solid #E2E8F0',
                      backgroundColor: leaderboardLimit === l ? '#EFF6FF' : '#FFFFFF',
                      color: leaderboardLimit === l ? '#1E40AF' : '#64748B',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    Top {l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '16px 20px' }}>Rank</th>
                  <th style={{ padding: '16px 20px' }}>Broker Profile</th>
                  <th style={{ padding: '16px 20px' }}>Location</th>
                  <th style={{ padding: '16px 20px' }}>Properties Sold</th>
                  <th style={{ padding: '16px 20px' }}>Franchise Deals</th>
                  <th style={{ padding: '16px 20px' }}>Revenue Gen.</th>
                  <th style={{ padding: '16px 20px' }}>Rating</th>
                  <th style={{ padding: '16px 20px' }}>Success Rate</th>
                  <th style={{ padding: '16px 20px' }}>Response</th>
                  <th style={{ padding: '16px 20px' }}>Leads Handled</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardBrokers.map((broker, idx) => {
                  const rank = idx + 1;
                  const medalColor = rank === 1 ? '#F59E0B' : rank === 2 ? '#94A3B8' : rank === 3 ? '#D97706' : '#64748B';
                  return (
                    <tr key={broker.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.15s ease' }}>
                      <td style={{ padding: '16px 20px', fontWeight: 800, fontSize: '1.1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {rank <= 3 && <FaMedal style={{ color: medalColor, fontSize: '1.3rem' }} />}
                          <span style={{ color: medalColor }}>#{rank}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {broker.photo || broker.logo ? (
                            <img 
                              src={broker.photo || broker.logo} 
                              alt={broker.companyName} 
                              style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #1E40AF', flexShrink: 0 }} 
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                                if (e.currentTarget.parentElement) {
                                  const fallback = document.createElement('div');
                                  fallback.style.cssText = 'width:44px;height:44px;border-radius:50%;background-color:#1E40AF;color:#FFFFFF;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.9rem;border:1.5px solid #1E40AF;flex-shrink:0;';
                                  fallback.innerText = (broker.fullName || broker.companyName || 'B').substring(0, 2).toUpperCase();
                                  e.currentTarget.parentElement.insertBefore(fallback, e.currentTarget);
                                }
                              }}
                            />
                          ) : (
                            <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#1E40AF', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem', border: '1.5px solid #1E40AF', flexShrink: 0 }}>
                              {(broker.fullName || broker.companyName || 'B').substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>{broker.companyName}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{broker.fullName || 'Partner'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '0.88rem', color: '#475569' }}>
                        {broker.serviceAreas?.[0]?.city || (broker as any).city || 'N/A'}
                      </td>
                      <td style={{ padding: '16px 20px', fontWeight: 700, color: '#0F172A' }}>
                        {broker.calcSales} Units
                      </td>
                      <td style={{ padding: '16px 20px', fontWeight: 700, color: '#0F172A' }}>
                        {broker.calcFranchise} Deals
                      </td>
                      <td style={{ padding: '16px 20px', fontWeight: 800, color: '#1E40AF' }}>
                        ₹{broker.calcRevenue} Cr
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: '#D97706' }}>
                          <FaStar /> {broker.rating || 4.5}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#DCFCE7', color: '#16A34A', fontWeight: 700, fontSize: '0.8rem' }}>
                          {broker.successRate ? `${broker.successRate}%` : 'N/A'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '0.85rem', color: '#64748B' }}>
                        {broker.responseTime || 'N/A'}
                      </td>
                      <td style={{ padding: '16px 20px', fontWeight: 700, color: '#334155' }}>
                        {broker.calcLeads} Leads
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 3: PREMIUM BROKER MANAGEMENT ================= */}
      {activeTab === 'premium' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ backgroundColor: '#FFFFFF', padding: '24px', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", fontSize: '1.3rem', fontWeight: 700, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaCrown style={{ color: '#D97706' }} /> PREMIUM BROKER PRIVILEGES CONTROL
              </h3>
              <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '20px' }}>
                Upgrade high-performing brokers to Premium Status to grant priority placement, homepage spotlights, and featured badge visibility.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {dealersDb.map(broker => {
                  const isPrem = Boolean(broker.premiumPartner);
                  return (
                    <div key={broker.id} style={{ padding: '18px', border: isPrem ? '2px solid #F59E0B' : '1px solid #E2E8F0', borderRadius: '10px', backgroundColor: isPrem ? '#FFFBEB' : '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s ease' }}>
                      <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                        {broker.photo || broker.logo ? (
                          <img 
                            src={broker.photo || broker.logo} 
                            alt="" 
                            style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: isPrem ? '2px solid #F59E0B' : '1px solid #CBD5E1' }} 
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                              if (e.currentTarget.parentElement) {
                                const fallback = document.createElement('div');
                                fallback.style.cssText = `width:56px;height:56px;border-radius:50%;background-color:${isPrem ? '#D97706' : '#1E40AF'};color:#FFFFFF;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.1rem;flex-shrink:0;`;
                                fallback.innerText = (broker.fullName || broker.companyName || 'B').substring(0, 2).toUpperCase();
                                e.currentTarget.parentElement.insertBefore(fallback, e.currentTarget);
                              }
                            }}
                          />
                        ) : (
                          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: isPrem ? '#D97706' : '#1E40AF', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', flexShrink: 0 }}>
                            {(broker.fullName || broker.companyName || 'B').substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>{broker.fullName || broker.companyName}</h4>
                            {broker.companyName && broker.fullName && broker.companyName !== broker.fullName && (
                              <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>({broker.companyName})</span>
                            )}
                            {isPrem ? (
                              <span style={{ padding: '3px 8px', backgroundColor: '#F59E0B', color: '#FFFFFF', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <FaCrown /> PREMIUM ACTIVE
                              </span>
                            ) : (
                              <span style={{ padding: '3px 8px', backgroundColor: '#F1F5F9', color: '#64748B', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>
                                STANDARD
                              </span>
                            )}
                          </div>
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748B' }}>
                            {isPrem ? (
                              <>Valid: <strong>{broker.premiumStartDate || new Date().toISOString().slice(0,10)}</strong> to <strong>{broker.premiumExpiryDate || new Date(Date.now() + 365*24*60*60*1000).toISOString().slice(0,10)}</strong></>
                            ) : (
                              <>Status: <strong>Standard Partner</strong> • Priority: <strong>Standard</strong></>
                            )}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={async () => {
                            const nextPrem = !isPrem;
                            const now = new Date();
                            const nextYear = new Date();
                            nextYear.setFullYear(now.getFullYear() + 1);
                            const sDate = now.toISOString().slice(0, 10);
                            const eDate = nextYear.toISOString().slice(0, 10);

                            await updateDealer(broker.id, { 
                              premiumPartner: nextPrem,
                              featuredHomepageListing: nextPrem,
                              highlightPremiumCards: nextPrem,
                              showPremiumBadge: nextPrem,
                              premiumStartDate: nextPrem ? sDate : '',
                              premiumExpiryDate: nextPrem ? eDate : ''
                            });
                            showNotification(nextPrem ? `Upgraded '${broker.fullName || broker.companyName}' to Premium Status!` : `Revoked Premium status for '${broker.fullName || broker.companyName}'.`);
                          }}
                          style={{
                            padding: '10px 18px',
                            backgroundColor: isPrem ? '#FEE2E2' : '#D97706',
                            color: isPrem ? '#DC2626' : '#FFFFFF',
                            border: isPrem ? '1px solid #FECACA' : 'none',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            boxShadow: isPrem ? 'none' : '0 2px 8px rgba(217,119,6,0.3)',
                            transition: 'all 0.2s'
                          }}
                        >
                          {isPrem ? 'REVOKE PREMIUM' : 'UPGRADE TO PREMIUM'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Premium Benefits Sidebar */}
          <div style={{ backgroundColor: '#1E40AF', color: '#FFFFFF', padding: '28px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '20px', height: 'fit-content' }}>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", fontSize: '1.3rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaCrown style={{ color: '#FCD34D' }} /> PREMIUM BENEFITS
            </h3>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: '#E2E8F0', margin: 0 }}>
              Premium partners receive superior distribution algorithms across TheNexOpp ecosystem:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem' }}>
              {[
                { title: 'Homepage Visibility', desc: 'Featured carousel spot on main landing page.' },
                { title: 'Priority Search Results', desc: 'Ranked at the top of category & location queries.' },
                { title: 'Featured Listings Badge', desc: 'Exclusive Gold Crown on all assigned properties.' },
                { title: 'Higher Lead Distribution', desc: '3x more organic lead routing from public enquiries.' },
                { title: 'Dedicated Account Advisor', desc: 'Direct priority support from NexOpp headquarters.' }
              ].map((ben, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <FaCheckCircle style={{ color: '#FCD34D', marginTop: '3px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 700 }}>{ben.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#BFDBFE' }}>{ben.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: CATEGORY-BASED BROKER RANKING ================= */}
      {activeTab === 'category_rank' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', border: '1px solid #E2E8F0', borderRadius: '12px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {PROPERTY_CATEGORIES_LIST.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '25px',
                  border: selectedCategory === cat ? '2px solid #1E40AF' : '1px solid #E2E8F0',
                  backgroundColor: selectedCategory === cat ? '#1E40AF' : '#F8FAFC',
                  color: selectedCategory === cat ? '#FFFFFF' : '#475569',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '24px', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", fontSize: '1.3rem', margin: '0 0 20px 0', color: '#0F172A' }}>
              TOP PERFORMING BROKERS IN: <span style={{ color: '#1E40AF' }}>{selectedCategory.toUpperCase()}</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {categoryRankedBrokers.map((broker, idx) => (
                <div key={broker.id} style={{ padding: '20px', border: '1px solid #E2E8F0', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: idx === 0 ? '#FEFCE8' : '#FFFFFF' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: idx === 0 ? '#F59E0B' : '#1E40AF', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem' }}>
                      #{idx + 1}
                    </div>
                    {broker.photo || broker.logo ? (
                      <img 
                        src={broker.photo || broker.logo} 
                        alt="" 
                        style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} 
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                          if (e.currentTarget.parentElement) {
                            const fallback = document.createElement('div');
                            fallback.style.cssText = 'width:60px;height:60px;border-radius:50%;background-color:#1E40AF;color:#FFFFFF;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.2rem;flex-shrink:0;';
                            fallback.innerText = (broker.companyName || 'B').substring(0, 2).toUpperCase();
                            e.currentTarget.parentElement.insertBefore(fallback, e.currentTarget);
                          }
                        }}
                      />
                    ) : (
                      <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#1E40AF', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', flexShrink: 0 }}>
                        {(broker.companyName || 'B').substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{broker.companyName}</h4>
                      <p style={{ margin: '2px 0 0 0', color: '#64748B', fontSize: '0.85rem' }}>⭐ {broker.rating} ({broker.reviewCount} reviews) • {broker.fullName}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '24px', textAlign: 'right', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>CATEGORY SALES</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>{broker.totalPropertiesSold || 0} Units</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>REVENUE</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E40AF' }}>₹{broker.revenueGenerated || 0} Cr</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 5: LOCATION-BASED BROKER RANKING ================= */}
      {activeTab === 'location_rank' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Geographic Cascade Filter */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', border: '1px solid #E2E8F0', borderRadius: '12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>State / Region</label>
              <input
                type="text"
                value={filterState === 'All' ? '' : filterState}
                onChange={e => setFilterState(e.target.value || 'All')}
                placeholder="Filter by State..."
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontWeight: 600 }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>District</label>
              <input
                type="text"
                value={filterDistrict === 'All' ? '' : filterDistrict}
                onChange={e => setFilterDistrict(e.target.value || 'All')}
                placeholder="Filter by District..."
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontWeight: 600 }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>City / Area</label>
              <input
                type="text"
                value={filterCity === 'All' ? '' : filterCity}
                onChange={e => setFilterCity(e.target.value || 'All')}
                placeholder="Filter by City / Area..."
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontWeight: 600 }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Search Locality / Area</label>
              <input type="text" placeholder="e.g. Jubilee Hills, Benz Circle" value={filterAreaSearch} onChange={e => setFilterAreaSearch(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1' }} />
            </div>
          </div>

          {/* Podium Display for Top 3 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {locationRankedBrokers.slice(0, 3).map((broker, idx) => {
              const medal = idx === 0 ? 'Rank 1 (Gold)' : idx === 1 ? 'Rank 2 (Silver)' : 'Rank 3 (Bronze)';
              const borderColor = idx === 0 ? '#F59E0B' : idx === 1 ? '#94A3B8' : '#D97706';
              return (
                <div key={broker.id} style={{ backgroundColor: '#FFFFFF', padding: '24px', borderTop: `6px solid ${borderColor}`, border: '1px solid #E2E8F0', borderRadius: '12px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: borderColor, marginBottom: '14px' }}>{medal}</div>
                  {broker.photo || broker.logo ? (
                    <img 
                      src={broker.photo || broker.logo} 
                      alt="" 
                      style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: `3px solid ${borderColor}`, marginBottom: '12px', flexShrink: 0 }} 
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                        if (e.currentTarget.parentElement) {
                          const fallback = document.createElement('div');
                          fallback.style.cssText = `width:80px;height:80px;border-radius:50%;background-color:#1E40AF;color:#FFFFFF;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.5rem;border:3px solid ${borderColor};margin-bottom:12px;flex-shrink:0;`;
                          fallback.innerText = (broker.companyName || 'B').substring(0, 2).toUpperCase();
                          e.currentTarget.parentElement.insertBefore(fallback, e.currentTarget);
                        }
                      }}
                    />
                  ) : (
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#1E40AF', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.5rem', border: `3px solid ${borderColor}`, marginBottom: '12px', flexShrink: 0 }}>
                      {(broker.companyName || 'B').substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '1.15rem', fontWeight: 700 }}>{broker.companyName}</h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0 0 12px 0' }}>{broker.serviceAreas?.[0]?.city || (broker as any).city || 'N/A'}</p>
                  
                  <div style={{ width: '100%', padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '8px', marginBottom: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#64748B' }}>SOLD</div>
                      <div style={{ fontWeight: 800, color: '#0F172A' }}>{broker.totalPropertiesSold || 0} Units</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#64748B' }}>RATING</div>
                      <div style={{ fontWeight: 800, color: '#D97706' }}>{broker.rating} / 5.0</div>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: '#475569', margin: 0 }}>Phone: {broker.phone || broker.mobileNumber}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 6: BROKER ANALYTICS DASHBOARD ================= */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Executive KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {[
              { label: 'Total Brokers', val: brokerMetrics.totalBrokers, color: '#1E40AF', icon: <FaUserTie /> },
              { label: 'Active Brokers', val: brokerMetrics.activeBrokers, color: '#16A34A', icon: <FaCheckCircle /> },
              { label: 'Premium Brokers', val: brokerMetrics.premiumBrokers, color: '#D97706', icon: <FaCrown /> },
              { label: 'Verified Partners', val: brokerMetrics.verifiedBrokers, color: '#2563EB', icon: <FaMedal /> },
              { label: 'Total Property Sales', val: brokerMetrics.totalPropertySales, color: '#7C3AED', icon: <FaBuilding /> },
              { label: 'Franchise Deals Closed', val: brokerMetrics.totalFranchiseDeals, color: '#EA580C', icon: <FaChartLine /> },
              { label: 'Avg Customer Rating', val: `${brokerMetrics.avgRating} ⭐`, color: '#F59E0B', icon: <FaStar /> },
              { label: 'Conversion Rate', val: brokerMetrics.conversionRate, color: '#0F172A', icon: <FaChartPie /> }
            ].map((kpi, i) => (
              <div key={i} style={{ backgroundColor: '#FFFFFF', padding: '20px', border: '1px solid #E2E8F0', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontSize: '0.85rem', fontWeight: 600 }}>
                  <span>{kpi.label}</span>
                  <span style={{ color: kpi.color, fontSize: '1.1rem' }}>{kpi.icon}</span>
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: kpi.color }}>{kpi.val}</div>
              </div>
            ))}
          </div>

          {/* Visual Charts Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            
            {/* Monthly Sales Performance Bar Chart */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '24px', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h4 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", fontSize: '1.15rem', margin: 0, color: '#0F172A' }}>Monthly Activity & Sales (2026)</h4>
                <span style={{ fontSize: '0.78rem', color: '#16A34A', fontWeight: 700, backgroundColor: '#DCFCE7', padding: '3px 8px', borderRadius: '4px' }}>● Live Sync</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '180px', paddingBottom: '20px', borderBottom: '1px solid #E2E8F0' }}>
                {brokerMetrics.monthlySales.map((m) => (
                  <div key={m.month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: m.count > 0 ? '#1E40AF' : '#94A3B8' }}>{m.count}</div>
                    <div style={{ width: '36px', height: `${m.barHeight}px`, backgroundColor: m.count > 0 ? '#1E40AF' : '#E2E8F0', borderRadius: '6px 6px 0 0', transition: 'height 0.3s ease' }} />
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B' }}>{m.month}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue Contribution by Broker */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '24px', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h4 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", fontSize: '1.15rem', margin: 0, color: '#0F172A' }}>Top Revenue Contributing Brokers (₹ Cr)</h4>
                <span style={{ fontSize: '0.8rem', color: '#1E40AF', fontWeight: 700 }}>Total: ₹{brokerMetrics.totalRevenueSum} Cr</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {brokerMetrics.topRevenueBrokers.length === 0 ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: '#94A3B8', fontSize: '0.9rem' }}>No broker revenue recorded yet.</div>
                ) : (
                  brokerMetrics.topRevenueBrokers.map((d, i) => (
                    <div key={d.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                        <span>{d.name} {d.companyName && d.companyName !== d.name ? `(${d.companyName})` : ''}</span>
                        <span style={{ color: '#1E40AF' }}>₹{d.revenue} Cr ({d.pct}%)</span>
                      </div>
                      <div style={{ width: '100%', height: '10px', backgroundColor: '#F1F5F9', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.max(d.pct, d.revenue > 0 ? 5 : 0)}%`, height: '100%', backgroundColor: i === 0 ? '#F59E0B' : '#1E40AF', borderRadius: '5px', transition: 'width 0.4s ease' }} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT BROKER PROFILE ================= */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.7)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div data-lenis-prevent="true" style={{ backgroundColor: '#FFFFFF', width: '100%', maxWidth: '850px', maxHeight: '90vh', borderRadius: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '24px 30px', backgroundColor: '#1E40AF', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", fontSize: '1.35rem', margin: 0 }}>
                {editingBrokerId ? 'EDIT BROKER PROFILE' : 'REGISTER NEW BROKER PARTNER'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#FFFFFF', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>

            {/* Modal Form Sub-tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', padding: '0 30px', overflowX: 'auto' }}>
              {[
                { id: 'personal', label: '1. Personal Info' },
                { id: 'professional', label: '2. Professional Info' },
                { id: 'categories', label: '3. Categories' },
                { id: 'service_areas', label: '4. Service Areas' },
                { id: 'contact', label: '5. Contact & Social' },
                { id: 'performance', label: '6. Settings & Stats' }
              ].map(mt => (
                <button
                  key={mt.id}
                  type="button"
                  onClick={() => setModalTab(mt.id as any)}
                  style={{
                    padding: '14px 18px',
                    border: 'none',
                    borderBottom: modalTab === mt.id ? '3px solid #1E40AF' : '3px solid transparent',
                    backgroundColor: 'transparent',
                    color: modalTab === mt.id ? '#1E40AF' : '#64748B',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {mt.label}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveBroker} style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {modalTab === 'personal' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Company / Agency Name</label>
                    <input type="text" value={formData.companyName || ''} onChange={e => setFormData({ ...formData, companyName: e.target.value })} placeholder="e.g. TheNexOpp Premier Realty" style={{ width: '100%', padding: '12px', border: '1px solid #CBD5E1', borderRadius: '6px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Full Name (Broker Name) *</label>
                    <input required type="text" value={formData.fullName || ''} onChange={e => setFormData({ ...formData, fullName: e.target.value, name: e.target.value })} placeholder="e.g. Rajeshwar Reddy" style={{ width: '100%', padding: '12px', border: '1px solid #CBD5E1', borderRadius: '6px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Mobile Number *</label>
                    <input required type="text" value={formData.mobileNumber || formData.phone || ''} onChange={e => setFormData({ ...formData, mobileNumber: e.target.value, phone: e.target.value })} placeholder="+91 98480 12345" style={{ width: '100%', padding: '12px', border: '1px solid #CBD5E1', borderRadius: '6px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Email Address</label>
                    <input type="text" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="broker@thenexopp.in" style={{ width: '100%', padding: '12px', border: '1px solid #CBD5E1', borderRadius: '6px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Gender</label>
                    <select value={formData.gender || 'Male'} onChange={e => setFormData({ ...formData, gender: e.target.value as any })} style={{ width: '100%', padding: '12px', border: '1px solid #CBD5E1', borderRadius: '6px' }}>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Profile Photo</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      {formData.photo && (
                        <img src={formData.photo} alt="Profile" style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #CBD5E1' }} />
                      )}
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 18px', backgroundColor: '#1E40AF', color: '#FFF', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', transition: 'background 0.2s' }}>
                        Upload Photo
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              setFormData({ ...formData, photo: ev.target?.result as string });
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                      {formData.photo && (
                        <button onClick={() => setFormData({ ...formData, photo: '' })} style={{ background: 'none', border: 'none', color: '#EF4444', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>Remove</button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Company Logo</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      {formData.logo && (
                        <img src={formData.logo} alt="Logo" style={{ width: '52px', height: '52px', borderRadius: '8px', objectFit: 'cover', border: '2px solid #CBD5E1' }} />
                      )}
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 18px', backgroundColor: '#0F172A', color: '#FFF', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', transition: 'background 0.2s' }}>
                        Upload Logo
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              setFormData({ ...formData, logo: ev.target?.result as string });
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                      {formData.logo && (
                        <button onClick={() => setFormData({ ...formData, logo: '' })} style={{ background: 'none', border: 'none', color: '#EF4444', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>Remove</button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {modalTab === 'professional' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Company / Agency Name</label>
                    <input type="text" value={formData.companyName || ''} onChange={e => setFormData({ ...formData, companyName: e.target.value })} placeholder="e.g. TheNexOpp Premier Realty" style={{ width: '100%', padding: '12px', border: '1px solid #CBD5E1', borderRadius: '6px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Experience (Years)</label>
                    <input type="number" min="0" value={formData.yearsExperience ?? 0} onChange={e => setFormData({ ...formData, yearsExperience: parseInt(e.target.value) || 0 })} style={{ width: '100%', padding: '12px', border: '1px solid #CBD5E1', borderRadius: '6px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>⭐ Admin Rating (0.0 – 5.0) *</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      required
                      value={formData.rating !== undefined ? formData.rating : 4.8}
                      onChange={e => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })}
                      placeholder="e.g. 4.8"
                      style={{ width: '100%', padding: '12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontWeight: 700, color: '#D97706' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Total Reviews Count</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.reviewCount !== undefined ? formData.reviewCount : 0}
                      onChange={e => setFormData({ ...formData, reviewCount: parseInt(e.target.value) || 0 })}
                      placeholder="e.g. 25"
                      style={{ width: '100%', padding: '12px', border: '1px solid #CBD5E1', borderRadius: '6px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>RERA Registration Number</label>
                    <input type="text" value={formData.reraNumber || ''} onChange={e => setFormData({ ...formData, reraNumber: e.target.value })} placeholder="RERA-TS-2026-001" style={{ width: '100%', padding: '12px', border: '1px solid #CBD5E1', borderRadius: '6px' }} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Languages Known</label>
                    <input type="text" value={formData.languages || ''} onChange={e => setFormData({ ...formData, languages: e.target.value })} placeholder="English, Telugu, Hindi" style={{ width: '100%', padding: '12px', border: '1px solid #CBD5E1', borderRadius: '6px' }} />
                  </div>
                </div>
              )}

              {modalTab === 'categories' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div>
                    <label style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E40AF', display: 'block', marginBottom: '12px' }}>Property Categories</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                      {PROPERTY_CATEGORIES_LIST.map(pc => {
                        const checked = (formData.propertyCategories || []).includes(pc);
                        return (
                          <label key={pc} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={e => {
                                const curr = formData.propertyCategories || [];
                                const updated = e.target.checked ? [...curr, pc] : curr.filter(c => c !== pc);
                                setFormData({ ...formData, propertyCategories: updated });
                              }}
                            />
                            {pc}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E40AF', display: 'block', marginBottom: '12px' }}>Franchise Categories</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                      {FRANCHISE_CATEGORIES_LIST.map(fc => {
                        const checked = (formData.franchiseCategories || []).includes(fc);
                        return (
                          <label key={fc} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={e => {
                                const curr = formData.franchiseCategories || [];
                                const updated = e.target.checked ? [...curr, fc] : curr.filter(c => c !== fc);
                                setFormData({ ...formData, franchiseCategories: updated });
                              }}
                            />
                            {fc}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {modalTab === 'service_areas' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700 }}>Service Locations</span>
                    <button
                      type="button"
                      onClick={() => {
                        const curr = formData.serviceAreas || [];
                        setFormData({ ...formData, serviceAreas: [...curr, { state: 'Telangana', district: 'Hyderabad', city: 'Hyderabad', area: 'Gachibowli', pincode: '500032' }] });
                      }}
                      style={{ padding: '6px 12px', backgroundColor: '#1E40AF', color: '#FFFFFF', border: 'none', borderRadius: '4px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      + Add Location
                    </button>
                  </div>

                  {(formData.serviceAreas || []).map((area, idx) => (
                    <div key={idx} style={{ padding: '16px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '10px', alignItems: 'center' }}>
                      <input type="text" value={area.state} onChange={e => {
                        const next = [...(formData.serviceAreas || [])];
                        next[idx].state = e.target.value;
                        setFormData({ ...formData, serviceAreas: next });
                      }} placeholder="State" style={{ padding: '8px', border: '1px solid #CBD5E1', borderRadius: '4px' }} />
                      <input type="text" value={area.district} onChange={e => {
                        const next = [...(formData.serviceAreas || [])];
                        next[idx].district = e.target.value;
                        setFormData({ ...formData, serviceAreas: next });
                      }} placeholder="District" style={{ padding: '8px', border: '1px solid #CBD5E1', borderRadius: '4px' }} />
                      <input type="text" value={area.city} onChange={e => {
                        const next = [...(formData.serviceAreas || [])];
                        next[idx].city = e.target.value;
                        setFormData({ ...formData, serviceAreas: next });
                      }} placeholder="City" style={{ padding: '8px', border: '1px solid #CBD5E1', borderRadius: '4px' }} />
                      <input type="text" value={area.area} onChange={e => {
                        const next = [...(formData.serviceAreas || [])];
                        next[idx].area = e.target.value;
                        setFormData({ ...formData, serviceAreas: next });
                      }} placeholder="Locality / Area" style={{ padding: '8px', border: '1px solid #CBD5E1', borderRadius: '4px' }} />
                      <button
                        type="button"
                        onClick={() => {
                          const next = (formData.serviceAreas || []).filter((_, i) => i !== idx);
                          setFormData({ ...formData, serviceAreas: next });
                        }}
                        style={{ color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {modalTab === 'contact' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Office Address</label>
                    <input type="text" value={formData.officeAddress || ''} onChange={e => setFormData({ ...formData, officeAddress: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #CBD5E1', borderRadius: '6px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>WhatsApp Number</label>
                    <input type="text" value={formData.whatsapp || ''} onChange={e => setFormData({ ...formData, whatsapp: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #CBD5E1', borderRadius: '6px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Website URL</label>
                    <input type="text" value={formData.socialLinks?.website || ''} onChange={e => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, website: e.target.value } })} style={{ width: '100%', padding: '12px', border: '1px solid #CBD5E1', borderRadius: '6px' }} />
                  </div>
                </div>
              )}

              {modalTab === 'performance' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>⭐ Admin Rating (0.0 – 5.0)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={formData.rating !== undefined ? formData.rating : 4.8}
                      onChange={e => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })}
                      placeholder="e.g. 4.8"
                      style={{ width: '100%', padding: '12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontWeight: 700, color: '#D97706' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Total Reviews Count</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.reviewCount !== undefined ? formData.reviewCount : 0}
                      onChange={e => setFormData({ ...formData, reviewCount: parseInt(e.target.value) || 0 })}
                      placeholder="e.g. 25"
                      style={{ width: '100%', padding: '12px', border: '1px solid #CBD5E1', borderRadius: '6px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Premium Broker Status</label>
                    <select value={formData.premiumPartner ? 'yes' : 'no'} onChange={e => setFormData({ ...formData, premiumPartner: e.target.value === 'yes' })} style={{ width: '100%', padding: '12px', border: '1px solid #CBD5E1', borderRadius: '6px' }}>
                      <option value="yes">Yes – Premium Partner</option>
                      <option value="no">No – Standard Partner</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Active Status</label>
                    <select value={formData.status || 'Active'} onChange={e => setFormData({ ...formData, status: e.target.value as any })} style={{ width: '100%', padding: '12px', border: '1px solid #CBD5E1', borderRadius: '6px' }}>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '12px 24px', backgroundColor: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>CANCEL</button>
                {modalTab !== 'performance' ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (modalTab === 'personal') setModalTab('professional');
                      else if (modalTab === 'professional') setModalTab('categories');
                      else if (modalTab === 'categories') setModalTab('service_areas');
                      else if (modalTab === 'service_areas') setModalTab('contact');
                      else if (modalTab === 'contact') setModalTab('performance');
                    }}
                    style={{ padding: '12px 30px', backgroundColor: '#1E40AF', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    NEXT &rarr;
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSaving}
                    style={{ padding: '12px 30px', backgroundColor: '#10B981', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.75 : 1 }}
                  >
                    {isSaving ? 'SAVING...' : 'SAVE BROKER PROFILE'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
