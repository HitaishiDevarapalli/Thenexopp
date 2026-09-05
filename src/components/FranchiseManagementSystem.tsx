import React, { useState, useMemo } from 'react';
import {
  franchiseDb,
  dealersDb,
  franchiseEnquiriesDb,
  addFranchise,
  updateFranchise,
  deleteFranchise,
  updateFranchiseEnquiryStatus,
  assignFranchiseEnquiryBroker,
  deleteFranchiseEnquiry,
  bulkPublishFranchises,
  bulkArchiveFranchises,
  bulkDeleteFranchises
} from '../db/marketplaceDb';
import type { FranchiseListing } from '../db/marketplaceDb';
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaImages,
  FaFileExcel,
  FaFileCsv,
  FaFilePdf,
  FaCopy,
  FaBuilding,
  FaCheck,
  FaMapMarkerAlt,
  FaGlobe,
  FaMap,
  FaCity,
  FaCompass,
  FaEnvelope,
  FaCrosshairs,
  FaList,
  FaCheckCircle,
  FaExternalLinkAlt,
  FaLightbulb,
  FaUserTie,
  FaStore,
  FaChartBar
} from 'react-icons/fa';
import { COMPREHENSIVE_INDIA_PLACES_DB, searchLivePlaces, geocodeLocationOnline, reverseGeocodeOnline } from '../utils/locationIntelligence';
import { LocationPickerMap } from './ui/LocationPickerMap';

interface FranchiseManagementSystemProps {
  showNotification: (msg: string, type?: string) => void;
  activeSubTab?: string;
  onSubTabChange?: (tab: string) => void;
  mode?: 'franchise' | 'business';
}

const DEFAULT_CATEGORIES = [
  'Food & Beverage',
  'Healthcare',
  'Retail',
  'Education',
  'Beauty & Wellness',
  'Automobile',
  'Technology',
  'Hospitality',
  'Existing Running Businesses',
  'Manufacturing',
  'Logistics',
  'Agriculture',
  'Other Business Opportunities'
];

export const FranchiseManagementSystem: React.FC<FranchiseManagementSystemProps> = ({ showNotification, activeSubTab, onSubTabChange, mode = 'franchise' }) => {
  const [activeTab, setActiveTab] = useState<'listings' | 'editProperty' | 'featured' | 'analytics' | 'categories' | 'locations' | 'soldOut' | 'reports' | 'approvals' | 'enquiries' | 'gallery'>('listings');

  // Search & Filter state for listings
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedBroker, setSelectedBroker] = useState('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [modalSubTab, setModalSubTab] = useState<'basic' | 'investment' | 'business' | 'space' | 'location' | 'media' | 'broker'>('basic');
  const [editingFranchise, setEditingFranchise] = useState<Partial<FranchiseListing>>({});

  React.useEffect(() => {
    if (activeSubTab) {
      if (activeSubTab === 'all' || activeSubTab === 'listings') {
        setActiveTab('listings');
        setSelectedCategory('All');
        setSelectedStatus('All');
        setSelectedBroker('All');
        setSearchQuery('');
        setIsModalOpen(false);
      } else if (activeSubTab === 'add') {
        setActiveTab('listings');
        setIsModalOpen(true);
        setModalMode('add');
        setEditingFranchise({});
        setModalSubTab('basic');
      } else if (activeSubTab === 'soldOut' || activeSubTab === 'sold') {
        setActiveTab('soldOut');
        setSelectedCategory('All');
        setSelectedStatus('All');
        setSearchQuery('');
        setIsModalOpen(false);
      } else if (activeSubTab === 'resales' || activeSubTab === 'resale_requests') {
        setActiveTab('reports');
        setIsModalOpen(false);
      } else if (activeSubTab === 'enquiries' || activeSubTab === 'franchise_leads') {
        setActiveTab('enquiries');
        setIsModalOpen(false);
      } else if (['listings', 'editProperty', 'featured', 'analytics', 'categories', 'locations', 'soldOut', 'reports', 'approvals', 'enquiries', 'gallery'].includes(activeSubTab)) {
        setActiveTab(activeSubTab as any);
        setIsModalOpen(false);
      } else {
        setActiveTab('listings');
        setSelectedCategory('All');
        setSelectedStatus('All');
        setSearchQuery('');
        setIsModalOpen(false);
      }
    }
  }, [activeSubTab]);

  // Location Intelligence Picker States & Helpers inside Modal
  const [addressSearchQuery, setAddressSearchQuery] = useState('');
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [mapMarkerPos, setMapMarkerPos] = useState<{ lat: number; lng: number }>({ lat: 17.4065, lng: 78.4772 });
  const [liveSuggestions, setLiveSuggestions] = useState<any[]>(COMPREHENSIVE_INDIA_PLACES_DB.slice(0, 15));
  const [isSearchingLive, setIsSearchingLive] = useState(false);
  const [isAdminDetectingGPS, setIsAdminDetectingGPS] = useState(false);

  React.useEffect(() => {
    if (!addressSearchQuery || addressSearchQuery.trim().length < 2) {
      setLiveSuggestions(COMPREHENSIVE_INDIA_PLACES_DB.slice(0, 15));
      return;
    }
    setIsSearchingLive(true);
    const timer = setTimeout(() => {
      searchLivePlaces(addressSearchQuery).then(res => {
        setLiveSuggestions(res);
        setIsSearchingLive(false);
      }).catch(() => setIsSearchingLive(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [addressSearchQuery]);

  const handleSelectGooglePlace = (place: any) => {
    const lat = Number(place.latitude);
    const lng = Number(place.longitude);
    setEditingFranchise(prev => ({
      ...prev,
      google_place_id: place.google_place_id,
      formatted_address: place.formatted_address,
      fullAddress: place.fullAddress || place.formatted_address,
      latitude: lat,
      longitude: lng,
      country: place.country || 'India',
      state: place.state,
      district: place.district,
      city: place.city,
      area: place.area,
      locality: place.area,
      pincode: place.postal_code,
      location: `${place.area}, ${place.city}`
    }));
    setMapMarkerPos({ lat, lng });
    setAddressSearchQuery(place.formatted_address);
    setShowLocationSuggestions(false);
    showNotification?.(`Verified location selected: ${place.area}, ${place.city} (Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)})`, "success");
  };

  const handleAdminDetectGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsAdminDetectingGPS(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const place = await reverseGeocodeOnline(latitude, longitude);
          handleSelectGooglePlace(place);
        } catch (e) {
          console.warn("GPS reverse geocoding failed:", e);
        }
        setIsAdminDetectingGPS(false);
      },
      (err) => {
        setIsAdminDetectingGPS(false);
        alert(`Could not retrieve GPS location: ${err.message}. Please allow location permission in your browser or search your address above.`);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 0 }
    );
  };

  const handleMarkerDrag = async (newLat: number, newLng: number) => {
    setMapMarkerPos({ lat: newLat, lng: newLng });
    const revPlace = await reverseGeocodeOnline(newLat, newLng);
    setEditingFranchise(prev => ({
      ...prev,
      latitude: newLat,
      longitude: newLng,
      country: revPlace.country || prev.country || 'India',
      state: revPlace.state || prev.state || '',
      district: revPlace.district || prev.district || '',
      city: revPlace.city || prev.city || '',
      area: revPlace.area || prev.area || '',
      pincode: revPlace.postal_code || prev.pincode || '',
      postal_code: revPlace.postal_code || prev.postal_code || '',
      formatted_address: revPlace.formatted_address,
      fullAddress: revPlace.fullAddress || revPlace.formatted_address
    }));
    showNotification?.(`Reverse Geocoded: Marker shifted to Lat ${newLat.toFixed(6)}, Lng ${newLng.toFixed(6)}`, "success");
  };

  // Broker Search inside Modal
  const [brokerSearch, setBrokerSearch] = useState('');

  // Categories & Locations state
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [newCatName, setNewCatName] = useState('');

  // Cascading Location state
  const [selectedState, setSelectedState] = useState('Telangana');
  const [_selectedDistrict, _setSelectedDistrict] = useState('Hyderabad');
  const [selectedCity, setSelectedCity] = useState('Hyderabad');
  const [newAreaInput, setNewAreaInput] = useState('');
  const [areasList, setAreasList] = useState<string[]>(['Jubilee Hills', 'Banjara Hills', 'Gachibowli', 'Hitech City', 'Madhapur']);

  // Enquiry CRM search
  const [enquirySearch, setEnquirySearch] = useState('');
  const [enquiryStatusFilter, setEnquiryStatusFilter] = useState('All');

  // Gallery state
  const [galleryFranchiseId, setGalleryFranchiseId] = useState<string>(franchiseDb[0]?.id || '');
  const [newImageUrl, setNewImageUrl] = useState('');

  // Derived filtered listings
  const filteredListings = useMemo(() => {
    return franchiseDb.filter(f => {
      // Filter by mode
      if (mode === 'franchise') {
        if (f.opportunityType === 'Existing Business') return false;
      } else if (mode === 'business') {
        if (f.opportunityType !== 'Existing Business') return false;
      }

      if (selectedCategory !== 'All' && f.category !== selectedCategory && f.type !== selectedCategory) return false;
      if (selectedStatus !== 'All' && (f.approvalStatus || 'Published') !== selectedStatus) return false;
      if (selectedBroker !== 'All' && !f.assignedBrokerIds?.includes(selectedBroker) && f.dealerId !== selectedBroker) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchBrand = f.brand.toLowerCase().includes(q);
        const matchType = f.type.toLowerCase().includes(q);
        const matchLoc = f.location.toLowerCase().includes(q);
        const matchId = f.id.toLowerCase().includes(q);
        if (!matchBrand && !matchType && !matchLoc && !matchId) return false;
      }
      return true;
    });
  }, [franchiseDb, selectedCategory, selectedStatus, selectedBroker, searchQuery, mode]);

  // Bulk Actions handler
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredListings.map(f => f.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  const handleBulkPublish = () => {
    if (selectedIds.length === 0) return;
    bulkPublishFranchises(selectedIds);
    setSelectedIds([]);
    showNotification(`Published ${selectedIds.length} franchise opportunities successfully.`, 'success');
  };

  const handleBulkArchive = () => {
    if (selectedIds.length === 0) return;
    bulkArchiveFranchises(selectedIds);
    setSelectedIds([]);
    showNotification(`Archived ${selectedIds.length} franchise opportunities.`, 'warning');
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Are you sure you want to permanently delete ${selectedIds.length} franchises?`)) {
      bulkDeleteFranchises(selectedIds);
      setSelectedIds([]);
      showNotification(`Deleted selected franchises successfully.`, 'warning');
    }
  };

  // Open Add Modal
  const openAddModal = () => {
    setModalMode('add');
    setMapMarkerPos({ lat: 17.4065, lng: 78.4772 });
    setAddressSearchQuery('');
    setEditingFranchise({
      id: `${mode === 'business' ? 'B' : 'F'}${Date.now().toString().slice(-4)}`,
      brand: '',
      type: '',
      category: 'Food & Beverage',
      opportunityType: mode === 'business' ? 'Existing Business' : 'New Franchise',
      status: 'Active',
      investment: 30,
      investmentDisplay: '₹25 - ₹40 Lakhs',
      minInvestment: 25,
      maxInvestment: 40,
      franchiseFee: '₹5 Lakhs',
      securityDeposit: '₹2 Lakhs',
      workingCapital: '₹3 Lakhs',
      expectedRoi: '35% - 45%',
      paybackPeriod: '15 - 18 Months',
      profitMargin: '25%',
      royaltyFee: '5% of revenue',
      marketingFee: '1.5% of revenue',
      companyName: '',
      yearEstablished: 2020,
      existingOutletsCount: 10,
      totalFranchiseUnits: 25,
      brandRecognition: 'National',
      requiredExperience: 'Management background preferred',
      requiredStaff: '5 - 8 Staff',
      businessModel: 'FOFO',
      supportOffered: ['Location Assistance', 'Staff Training', 'Marketing Support'],
      minAreaSqFt: 500,
      maxAreaSqFt: 1200,
      shopType: 'High Street',
      floorPreference: 'Ground Floor',
      parkingRequirement: 'Adequate visitor parking',
      country: 'India',
      state: 'Telangana',
      district: 'Hyderabad',
      city: 'Hyderabad',
      area: 'Jubilee Hills',
      pincode: '500033',
      location: 'Hyderabad',
      latitude: 17.4065,
      longitude: 78.4772,
      rating: 4.8,
      reviewCount: 15,
      verified: true,
      trending: false,
      availableBranchCount: 3,
      image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
      images: ['https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80'],
      logo: 'https://images.unsplash.com/photo-15144323-a09d9b4aefdd?auto=format&fit=crop&w=200&q=80',
      trustScore: 95,
      assignedBrokerIds: [dealersDb[0]?.id || 'D1'],
      dealerId: dealersDb[0]?.id || 'D1',
      approvalStatus: 'Published',
      featured: false,
      premiumFranchise: false,
      createdDate: new Date().toISOString().split('T')[0]
    });
    setModalSubTab('basic');
    setIsModalOpen(true);
  };

  const openEditModal = (franchise: FranchiseListing) => {
    setModalMode('edit');
    setMapMarkerPos({ lat: franchise.latitude || 17.4065, lng: franchise.longitude || 78.4772 });
    setAddressSearchQuery(franchise.formatted_address || franchise.location || '');
    setEditingFranchise({ ...franchise });
    setModalSubTab('basic');
    setIsModalOpen(true);
  };

  const handleDuplicate = (franchise: FranchiseListing) => {
    const duplicated: FranchiseListing = {
      ...franchise,
      id: `F${Date.now().toString().slice(-4)}`,
      brand: `${franchise.brand} (Copy)`,
      approvalStatus: 'Draft'
    };
    addFranchise(duplicated);
    showNotification(`Duplicated franchise '${franchise.brand}' to Drafts.`, 'success');
  };

  const handleSaveFranchise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFranchise.brand || !editingFranchise.type) {
      showNotification('Please fill in required fields (Brand Name & Business Type).', 'warning');
      return;
    }
    if (modalMode === 'add') {
      addFranchise(editingFranchise as FranchiseListing);
      showNotification(`Added new franchise opportunity '${editingFranchise.brand}'!`, 'success');
    } else {
      updateFranchise(editingFranchise.id!, editingFranchise);
      showNotification(`Updated franchise '${editingFranchise.brand}' successfully!`, 'success');
    }
    setIsModalOpen(false);
  };

  // Toggle Broker Assignment inside Modal
  const toggleBrokerAssignment = (brokerId: string) => {
    const current = editingFranchise.assignedBrokerIds || [];
    let updated: string[];
    if (current.includes(brokerId)) {
      updated = current.filter(id => id !== brokerId);
    } else {
      updated = [...current, brokerId];
    }
    setEditingFranchise({
      ...editingFranchise,
      assignedBrokerIds: updated,
      dealerId: updated[0] || editingFranchise.dealerId
    });
  };

  // Analytics metrics calculation
  const stats = useMemo(() => {
    const total = franchiseDb.length;
    const active = franchiseDb.filter(f => f.status === 'Active' && (f.approvalStatus === 'Published' || !f.approvalStatus)).length;
    const existingBiz = franchiseDb.filter(f => f.opportunityType === 'Existing Business').length;
    const newFranchise = franchiseDb.filter(f => f.opportunityType === 'New Franchise' || !f.opportunityType).length;
    const premiumCount = franchiseDb.filter(f => f.premiumFranchise || f.featured).length;
    const totalInvValue = franchiseDb.reduce((acc, f) => acc + (f.maxInvestment || f.investment || 30), 0);
    const totalEnquiries = franchiseEnquiriesDb.length;
    return { total, active, existingBiz, newFranchise, premiumCount, totalInvValue, totalEnquiries };
  }, [franchiseDb, franchiseEnquiriesDb]);

  // Export report simulation
  const exportReport = (format: string) => {
    showNotification(`Exporting Franchise Management Report as ${format.toUpperCase()}... Download initiated.`, 'success');
  };

  return (
    <div className="franchise-management-system" style={{ backgroundColor: '#F8FAFC', padding: '24px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
      
      {/* Top System Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '2px solid #E2E8F0', paddingBottom: '16px' }}>
        <div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
            {mode === 'business' ? 'Business Management System' : 'Enterprise Franchise Management System'}
          </h2>
          <p style={{ margin: 0, color: '#64748B', fontSize: '0.9rem' }}>
            {mode === 'business' 
              ? 'Centralized hub for managing business listings, approvals, analytics and website synchronization.' 
              : 'Centralized hub for franchise opportunities, existing business sales, broker CRM workflows, approvals, and public website synchronization.'}
          </p>
        </div>
        <button
          onClick={openAddModal}
          style={{ padding: '12px 24px', backgroundColor: '#059669', color: '#FFFFFF', border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", letterSpacing: '0.04em', boxShadow: '0 2px 6px rgba(5,150,105,0.2)' }}
        >
          <FaPlus /> {mode === 'business' ? '+ ADD NEW BUSINESS' : '+ ADD NEW FRANCHISE OPPORTUNITY'}
        </button>
      </div>

      {/* Navigation Subtabs Bar */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #E2E8F0', paddingBottom: '2px', marginBottom: '20px', overflowX: 'auto' }}>
        {[
          { id: 'listings', label: 'All Franchises', count: franchiseDb.length, icon: FaStore },
          { id: 'enquiries', label: 'Franchise Leads', count: franchiseEnquiriesDb.length, icon: FaEnvelope },
          { id: 'categories', label: 'Categories', count: categories.length, icon: FaList },
          { id: 'reports', label: 'Analytics & Reports', count: stats.total, icon: FaChartBar }
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

      {/* ================= MODULE 1: FRANCHISE LISTINGS (Also handles Edit Franchise) ================= */}
      {(activeTab === 'listings' || activeTab === 'editProperty') && (
        <div>
          {/* Advanced Search & Filter Bar */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', border: '1px solid #E2E8F0', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexGrow: 1, gap: '12px', minWidth: '300px' }}>
              <div style={{ position: 'relative', flexGrow: 1 }}>
                <FaSearch style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="text"
                  placeholder="Search by Brand, Business Type, Location or ID..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px 10px 38px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                style={{ padding: '10px 14px', border: '1px solid #CBD5E1', fontWeight: 600, fontSize: '0.85rem', color: '#334155' }}
              >
                <option value="All">All Categories</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>

              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                style={{ padding: '10px 14px', border: '1px solid #CBD5E1', fontWeight: 600, fontSize: '0.85rem', color: '#334155' }}
              >
                <option value="All">All Statuses</option>
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Archived">Archived</option>
              </select>

              <select
                value={selectedBroker}
                onChange={e => setSelectedBroker(e.target.value)}
                style={{ padding: '10px 14px', border: '1px solid #CBD5E1', fontWeight: 600, fontSize: '0.85rem', color: '#334155' }}
              >
                <option value="All">All Assigned Brokers</option>
                {dealersDb.map(d => <option key={d.id} value={d.id}>{d.name} ({d.company})</option>)}
              </select>
            </div>
          </div>

          {/* Bulk Action Controls */}
          {selectedIds.length > 0 && (
            <div style={{ backgroundColor: '#ECFDF5', padding: '14px 20px', border: '1px solid #A7F3D0', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, color: '#059669', fontSize: '0.95rem' }}>
                Selected {selectedIds.length} Franchise Opportunity {selectedIds.length === 1 ? 'Listing' : 'Listings'}
              </span>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={handleBulkPublish} style={{ padding: '8px 16px', backgroundColor: '#059669', color: '#FFFFFF', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>
                  PUBLISH SELECTED
                </button>
                <button onClick={handleBulkArchive} style={{ padding: '8px 16px', backgroundColor: '#059669', color: '#FFFFFF', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>
                  ARCHIVE SELECTED
                </button>
                <button onClick={handleBulkDelete} style={{ padding: '8px 16px', backgroundColor: '#EF4444', color: '#FFFFFF', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>
                  DELETE SELECTED
                </button>
              </div>
            </div>
          )}

          {/* Listings Table */}
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '2px solid #CBD5E1' }}>
                  <th style={{ padding: '14px 16px', width: '40px' }}>
                    <input
                      type="checkbox"
                      checked={filteredListings.length > 0 && selectedIds.length === filteredListings.length}
                      onChange={e => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th style={{ padding: '14px 16px', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>BRAND & OPPORTUNITY</th>
                  <th style={{ padding: '14px 16px', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>CATEGORY / TYPE</th>
                  <th style={{ padding: '14px 16px', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>INVESTMENT & ROI</th>
                  <th style={{ padding: '14px 16px', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>ASSIGNED BROKER</th>
                  <th style={{ padding: '14px 16px', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>STATUS</th>
                  <th style={{ padding: '14px 16px', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", fontSize: '0.85rem', fontWeight: 700, color: '#334155', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredListings.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748B', fontWeight: 600 }}>
                      No franchise listings matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredListings.map(fran => {
                    const assignedBroker = dealersDb.find(d => d.id === fran.dealerId || fran.assignedBrokerIds?.includes(d.id));
                    return (
                      <tr key={fran.id} style={{ borderBottom: '1px solid #E2E8F0', transition: 'background 0.2s' }}>
                        <td style={{ padding: '16px' }}>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(fran.id)}
                            onChange={e => handleSelectOne(fran.id, e.target.checked)}
                          />
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <img src={fran.logo || fran.image} alt={fran.brand} style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #CBD5E1' }} />
                            <div>
                              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>
                                {fran.brand} {fran.featured && <span style={{ fontSize: '0.7rem', padding: '2px 6px', backgroundColor: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', marginLeft: '6px', fontWeight: 700 }}>FEATURED</span>}
                              </div>
                              <div style={{ color: '#64748B', fontSize: '0.8rem' }}>ID: {fran.id} • {fran.location}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ padding: '4px 10px', backgroundColor: '#ECFDF5', color: '#059669', fontWeight: 700, fontSize: '0.78rem', border: '1px solid #A7F3D0' }}>
                            {fran.category || 'Food & Beverage'}
                          </span>
                          <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px' }}>{fran.opportunityType || 'New Franchise'}</div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontWeight: 800, color: '#059669', fontSize: '0.95rem' }}>{fran.investmentDisplay || `₹${fran.investment} Lakhs`}</div>
                          <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>Expected ROI: <strong>{fran.expectedRoi || '35% - 45%'}</strong></div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          {assignedBroker ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {assignedBroker.image || assignedBroker.photo || assignedBroker.logo ? (
                                <img src={assignedBroker.image || assignedBroker.photo || assignedBroker.logo} alt={assignedBroker.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                              ) : (
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#E0F2FE', color: '#0369A1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>
                                  <FaUserTie />
                                </div>
                              )}
                              <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>{assignedBroker.name}</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{assignedBroker.company}</div>
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: '#94A3B8', fontSize: '0.85rem' }}>Unassigned</span>
                          )}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            padding: '4px 10px',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            backgroundColor: (fran.approvalStatus || 'Published') === 'Published' ? '#ECFDF5' : (fran.approvalStatus === 'Draft' ? '#ECFDF5' : '#FEE2E2'),
                            color: (fran.approvalStatus || 'Published') === 'Published' ? '#059669' : (fran.approvalStatus === 'Draft' ? '#059669' : '#991B1B'),
                            border: '1px solid currentColor'
                          }}>
                            {(fran.approvalStatus || 'Published').toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '16px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => openEditModal(fran)}
                              title="Edit Franchise"
                              style={{ padding: '8px 12px', backgroundColor: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <FaEdit /> Edit
                            </button>
                            <button
                              onClick={() => handleDuplicate(fran)}
                              title="Duplicate Listing"
                              style={{ padding: '8px 12px', backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <FaCopy /> Copy
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete franchise '${fran.brand}'?`)) {
                                  deleteFranchise(fran.id);
                                  showNotification('Franchise deleted.', 'warning');
                                }
                              }}
                              title="Delete Franchise"
                              style={{ padding: '8px 12px', backgroundColor: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 2: APPROVAL WORKFLOW MANAGEMENT ================= */}
      {activeTab === 'approvals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>
              FRANCHISE APPROVAL & GOVERNANCE BOARD
            </h3>
            <p style={{ margin: 0, color: '#64748B', fontSize: '0.88rem' }}>
              Review submitted franchise opportunities, add internal compliance review notes, and transition listings across lifecycle stages.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {['Draft', 'Pending Approval', 'Approved', 'Published', 'Archived'].map(stage => {
              const items = franchiseDb.filter(f => (f.approvalStatus || 'Published') === stage);
              return (
                <div key={stage} style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: '16px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #E2E8F0', paddingBottom: '10px', marginBottom: '14px' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>
                      {stage.toUpperCase()} ({items.length})
                    </span>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: stage === 'Published' ? '#059669' : (stage === 'Pending Approval' ? '#059669' : '#64748B') }}></span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {items.length === 0 ? (
                      <p style={{ margin: '20px 0', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>No listings in {stage}.</p>
                    ) : (
                      items.map(f => (
                        <div key={f.id} style={{ padding: '14px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '4px' }}>
                          <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.95rem', marginBottom: '4px' }}>{f.brand}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '8px' }}>Inv: {f.investmentDisplay} • Broker: {f.dealerId || 'D1'}</div>
                          
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                            {stage !== 'Published' && (
                              <button
                                onClick={() => { updateFranchise(f.id, { approvalStatus: 'Published', status: 'Active' }); showNotification(`Published '${f.brand}'!`, 'success'); }}
                                style={{ padding: '6px 10px', backgroundColor: '#059669', color: '#FFFFFF', border: 'none', fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer' }}
                              >
                                PUBLISH
                              </button>
                            )}
                            {stage !== 'Pending Approval' && (
                              <button
                                onClick={() => { updateFranchise(f.id, { approvalStatus: 'Pending Approval' }); showNotification(`Moved '${f.brand}' to Pending Review.`, 'info'); }}
                                style={{ padding: '6px 10px', backgroundColor: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer' }}
                              >
                                → TO REVIEW
                              </button>
                            )}
                            {stage !== 'Archived' && (
                              <button
                                onClick={() => { updateFranchise(f.id, { approvalStatus: 'Archived' }); showNotification(`Archived '${f.brand}'.`, 'warning'); }}
                                style={{ padding: '6px 10px', backgroundColor: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer' }}
                              >
                                ARCHIVE
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 3: FEATURED & PREMIUM CONTROL HUB ================= */}
      {activeTab === 'featured' && (
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', border: '1px solid #E2E8F0' }}>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>
            FEATURED & PREMIUM SPONSORSHIP CONTROL HUB
          </h3>
          <p style={{ margin: '0 0 20px 0', color: '#64748B', fontSize: '0.88rem' }}>
            Configure homepage priority ordering, spotlight card badges, verified trust emblems, and sponsored rank durations.
          </p>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '2px solid #CBD5E1' }}>
                <th style={{ padding: '14px 16px', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>FRANCHISE BRAND</th>
                <th style={{ padding: '14px 16px', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>FEATURED STATUS</th>
                <th style={{ padding: '14px 16px', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>PREMIUM BADGE</th>
                <th style={{ padding: '14px 16px', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>HOMEPAGE PRIORITY</th>
                <th style={{ padding: '14px 16px', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>DURATION VALIDITY</th>
              </tr>
            </thead>
            <tbody>
              {franchiseDb.map(f => (
                <tr key={f.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '16px', fontWeight: 800, color: '#0F172A' }}>{f.brand}</td>
                  <td style={{ padding: '16px' }}>
                    <button
                      onClick={() => { updateFranchise(f.id, { featured: !f.featured }); showNotification(`Toggled featured status for '${f.brand}'.`, 'success'); }}
                      style={{
                        padding: '6px 14px',
                        backgroundColor: f.featured ? '#059669' : '#F1F5F9',
                        color: f.featured ? '#FFFFFF' : '#64748B',
                        border: 'none',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        cursor: 'pointer'
                      }}
                    >
                      {f.featured ? 'FEATURED ACTIVE' : 'MARK AS FEATURED'}
                    </button>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <button
                      onClick={() => { updateFranchise(f.id, { premiumFranchise: !f.premiumFranchise }); showNotification(`Toggled premium badge for '${f.brand}'.`, 'success'); }}
                      style={{
                        padding: '6px 14px',
                        backgroundColor: f.premiumFranchise ? '#059669' : '#F1F5F9',
                        color: f.premiumFranchise ? '#FFFFFF' : '#64748B',
                        border: 'none',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        cursor: 'pointer'
                      }}
                    >
                      {f.premiumFranchise ? 'PREMIUM VERIFIED' : 'ENABLE PREMIUM'}
                    </button>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <select
                      value={f.homepagePriority || 1}
                      onChange={e => { updateFranchise(f.id, { homepagePriority: Number(e.target.value) }); showNotification('Updated priority order.', 'info'); }}
                      style={{ padding: '6px 10px', border: '1px solid #CBD5E1', fontWeight: 700 }}
                    >
                      <option value={1}>Priority #1 (Top Spotlight)</option>
                      <option value={2}>Priority #2 (Upper Row)</option>
                      <option value={3}>Priority #3 (Standard Flow)</option>
                    </select>
                  </td>
                  <td style={{ padding: '16px', color: '#64748B', fontSize: '0.85rem' }}>
                    {f.featuredDuration || '30 Days'} (Exp: 2026-08-15)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= TAB 4: ANALYTICS DASHBOARD ================= */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* KPI Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div style={{ backgroundColor: '#FFFFFF', padding: '20px', border: '1px solid #E2E8F0', borderLeft: '4px solid #059669' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em' }}>TOTAL FRANCHISE LISTINGS</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', marginTop: '6px', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>{stats.total}</div>
            </div>
            <div style={{ backgroundColor: '#FFFFFF', padding: '20px', border: '1px solid #E2E8F0', borderLeft: '4px solid #059669' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em' }}>ACTIVE OPPORTUNITIES</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#059669', marginTop: '6px', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>{stats.active}</div>
            </div>
            <div style={{ backgroundColor: '#FFFFFF', padding: '20px', border: '1px solid #E2E8F0', borderLeft: '4px solid #059669' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em' }}>PREMIUM / FEATURED</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#059669', marginTop: '6px', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>{stats.premiumCount}</div>
            </div>
            <div style={{ backgroundColor: '#FFFFFF', padding: '20px', border: '1px solid #E2E8F0', borderLeft: '4px solid #059669' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em' }}>TOTAL LEADS / ENQUIRIES</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#059669', marginTop: '6px', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>{stats.totalEnquiries}</div>
            </div>
          </div>

          {/* Breakdown Charts & Progress Bars */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ backgroundColor: '#FFFFFF', padding: '24px', border: '1px solid #E2E8F0' }}>
              <h4 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: '0 0 16px 0' }}>
                CATEGORY-WISE OPPORTUNITY DISTRIBUTION
              </h4>
              {['Food & Beverage', 'Healthcare', 'Automobile', 'Retail', 'Education'].map((cat, idx) => {
                const count = franchiseDb.filter(f => f.category === cat || f.type.includes(cat.split(' ')[0])).length || (idx === 0 ? 1 : 0);
                const pct = Math.round((count / Math.max(stats.total, 1)) * 100);
                return (
                  <div key={cat} style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                      <span>{cat}</span>
                      <span>{count} Listings ({pct}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.max(pct, 15)}%`, height: '100%', backgroundColor: idx === 0 ? '#059669' : (idx === 1 ? '#059669' : '#059669') }}></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ backgroundColor: '#FFFFFF', padding: '24px', border: '1px solid #E2E8F0' }}>
              <h4 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: '0 0 16px 0' }}>
                TOP PERFORMING ASSIGNED BROKERS
              </h4>
              {dealersDb.slice(0, 3).map(dealer => {
                const assignedCount = franchiseDb.filter(f => f.dealerId === dealer.id || f.assignedBrokerIds?.includes(dealer.id)).length;
                return (
                  <div key={dealer.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F1F5F9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={dealer.image} alt={dealer.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0F172A' }}>{dealer.name}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{dealer.company} • Rating: {dealer.rating}</div>
                      </div>
                    </div>
                    <span style={{ padding: '4px 12px', backgroundColor: '#ECFDF5', color: '#059669', fontWeight: 800, fontSize: '0.8rem', border: '1px solid #A7F3D0' }}>
                      {assignedCount} Franchises
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 5: CATEGORIES & LOCATIONS ================= */}
      {(activeTab === 'categories' || activeTab === 'locations') && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Categories Manager */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '24px', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', margin: '0 0 14px 0' }}>
              FRANCHISE CATEGORY MASTER ({categories.length})
            </h3>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="New category name..."
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                style={{ flexGrow: 1, padding: '10px 14px', border: '1px solid #CBD5E1', outline: 'none' }}
              />
              <button
                onClick={() => {
                  if (!newCatName.trim()) return;
                  if (!categories.includes(newCatName.trim())) {
                    setCategories([...categories, newCatName.trim()]);
                    showNotification(`Added category '${newCatName}'!`, 'success');
                    setNewCatName('');
                  }
                }}
                style={{ padding: '10px 16px', backgroundColor: '#059669', color: '#FFFFFF', border: 'none', fontWeight: 700, cursor: 'pointer' }}
              >
                + ADD
              </button>
            </div>

            <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {categories.map((cat, idx) => (
                <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#334155' }}>{idx + 1}. {cat}</span>
                  <button
                    onClick={() => {
                      if (categories.length <= 1) return;
                      setCategories(categories.filter(c => c !== cat));
                      showNotification(`Removed category '${cat}'.`, 'warning');
                    }}
                    style={{ color: '#DC2626', background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Cascading Location Hierarchy Manager */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '24px', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', margin: '0 0 14px 0' }}>
              LOCATION HIERARCHY (State → District → City → Area)
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '4px' }}>SELECT STATE / REGION</label>
                <input
                  type="text"
                  value={selectedState}
                  onChange={e => setSelectedState(e.target.value)}
                  placeholder="e.g. Andhra Pradesh, Telangana..."
                  style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', fontWeight: 700, borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '4px' }}>SELECT CITY / DISTRICT</label>
                <input
                  type="text"
                  value={selectedCity}
                  onChange={e => setSelectedCity(e.target.value)}
                  placeholder="e.g. Guntur, Hyderabad..."
                  style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', fontWeight: 700, borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '4px' }}>MANAGE AREAS IN {selectedCity.toUpperCase()}</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="New area (e.g. Kondapur)..."
                    value={newAreaInput}
                    onChange={e => setNewAreaInput(e.target.value)}
                    style={{ flexGrow: 1, padding: '10px 14px', border: '1px solid #CBD5E1' }}
                  />
                  <button
                    onClick={() => {
                      if (!newAreaInput.trim()) return;
                      setAreasList([...areasList, newAreaInput.trim()]);
                      setNewAreaInput('');
                      showNotification('Area added to location master.', 'success');
                    }}
                    style={{ padding: '10px 16px', backgroundColor: '#059669', color: '#FFFFFF', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                  >
                    + ADD AREA
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {areasList.map(area => (
                <span key={area} style={{ padding: '6px 12px', backgroundColor: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {area}
                  <button onClick={() => setAreasList(areasList.filter(a => a !== area))} style={{ background: 'none', border: 'none', color: '#991B1B', cursor: 'pointer', fontWeight: 800 }}>×</button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODULE: SOLD OUT ================= */}
      {activeTab === 'soldOut' && (
        <div style={{ backgroundColor: '#FFFFFF', padding: '40px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
          <FaCheckCircle style={{ fontSize: '3rem', color: '#94A3B8', marginBottom: '16px' }} />
          <h3 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>
            Sold Out & Closed Deals
          </h3>
          <p style={{ margin: 0, color: '#64748B' }}>
            No historically closed deals found. When opportunities are marked as sold out, they will appear here.
          </p>
        </div>
      )}

      {/* ================= TAB 6: FRANCHISE CRM & ENQUIRY MANAGEMENT ================= */}
      {activeTab === 'enquiries' && (
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              PROSPECTIVE FRANCHISEE CRM ({franchiseEnquiriesDb.length} LEADS)
            </h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                placeholder="Search lead or franchise..."
                value={enquirySearch}
                onChange={e => setEnquirySearch(e.target.value)}
                style={{ padding: '8px 14px', border: '1px solid #CBD5E1' }}
              />
              <select value={enquiryStatusFilter} onChange={e => setEnquiryStatusFilter(e.target.value)} style={{ padding: '8px 14px', border: '1px solid #CBD5E1', fontWeight: 700 }}>
                <option value="All">All Statuses</option>
                <option value="New">New</option>
                <option value="Meeting Scheduled">Meeting Scheduled</option>
                <option value="Proposal Sent">Proposal Sent</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '2px solid #CBD5E1' }}>
                <th style={{ padding: '14px', fontSize: '0.85rem', fontWeight: 700 }}>CUSTOMER PROSPECT</th>
                <th style={{ padding: '14px', fontSize: '0.85rem', fontWeight: 700 }}>INTERESTED FRANCHISE</th>
                <th style={{ padding: '14px', fontSize: '0.85rem', fontWeight: 700 }}>BUDGET & LOCATION</th>
                <th style={{ padding: '14px', fontSize: '0.85rem', fontWeight: 700 }}>ASSIGNED BROKER</th>
                <th style={{ padding: '14px', fontSize: '0.85rem', fontWeight: 700 }}>LEAD STATUS</th>
                <th style={{ padding: '14px', fontSize: '0.85rem', fontWeight: 700, textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {franchiseEnquiriesDb
                .filter(enq => enquiryStatusFilter === 'All' || enq.status === enquiryStatusFilter)
                .map(enq => (
                  <tr key={enq.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '14px' }}>
                      <div style={{ fontWeight: 800, color: '#0F172A' }}>{enq.customerName}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Tel: {enq.mobileNumber} • {enq.email}</div>
                    </td>
                    <td style={{ padding: '14px', fontWeight: 700, color: '#059669' }}>{enq.interestedFranchise}</td>
                    <td style={{ padding: '14px' }}>
                      <div style={{ fontWeight: 700, color: '#059669' }}>{enq.investmentBudget}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{enq.preferredLocation}</div>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <select
                        value={enq.assignedBrokerId || 'D1'}
                        onChange={e => {
                          const dealer = dealersDb.find(d => d.id === e.target.value);
                          assignFranchiseEnquiryBroker(enq.id, e.target.value, dealer?.name || 'RealtyPlus Advisors');
                          showNotification(`Assigned lead to broker ${dealer?.name}.`, 'info');
                        }}
                        style={{ padding: '6px 10px', border: '1px solid #CBD5E1', fontWeight: 700, fontSize: '0.8rem' }}
                      >
                        {dealersDb.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <select
                        value={enq.status}
                        onChange={e => {
                          updateFranchiseEnquiryStatus(enq.id, e.target.value as any);
                          showNotification(`Updated CRM status to ${e.target.value}.`, 'success');
                        }}
                        style={{
                          padding: '6px 10px',
                          border: '1px solid #CBD5E1',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          backgroundColor: enq.status === 'New' ? '#ECFDF5' : '#ECFDF5',
                          color: enq.status === 'New' ? '#059669' : '#059669'
                        }}
                      >
                        <option value="New">New Lead</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Meeting Scheduled">Meeting Scheduled</option>
                        <option value="Proposal Sent">Proposal Sent</option>
                        <option value="Negotiation">Negotiation</option>
                        <option value="Closed">Closed Won</option>
                        <option value="Lost">Closed Lost</option>
                      </select>
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right' }}>
                      <button
                        onClick={() => { deleteFranchiseEnquiry(enq.id); showNotification('Lead removed.', 'warning'); }}
                        style={{ padding: '6px 12px', backgroundColor: '#FEE2E2', color: '#DC2626', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= TAB 7: MEDIA & GALLERY HUB ================= */}
      {activeTab === 'gallery' && (
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              FRANCHISE MEDIA & GALLERY MANAGER
            </h3>
            <select
              value={galleryFranchiseId}
              onChange={e => setGalleryFranchiseId(e.target.value)}
              style={{ padding: '8px 14px', border: '1px solid #CBD5E1', fontWeight: 700 }}
            >
              {franchiseDb.map(f => <option key={f.id} value={f.id}>{f.brand} ({f.id})</option>)}
            </select>
          </div>

          <div style={{ border: '2px dashed #94A3B8', padding: '40px', textAlign: 'center', backgroundColor: '#F8FAFC', marginBottom: '24px' }}>
            <FaImages style={{ fontSize: '2.5rem', color: '#64748B', marginBottom: '12px' }} />
            <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', color: '#0F172A' }}>Drag & Drop Franchise Storefront Images, Floor Plans or PDF Brochures</h4>
            <p style={{ margin: '0 0 16px 0', color: '#64748B', fontSize: '0.85rem' }}>Supports high-resolution PNG, JPG, WebP images and PDF investment presentations.</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <input
                type="text"
                placeholder="Or paste high-res image URL..."
                value={newImageUrl}
                onChange={e => setNewImageUrl(e.target.value)}
                style={{ width: '320px', padding: '10px', border: '1px solid #CBD5E1' }}
              />
              <button
                onClick={() => {
                  if (!newImageUrl.trim() || !galleryFranchiseId) return;
                  const item = franchiseDb.find(f => f.id === galleryFranchiseId);
                  if (item) {
                    const updatedImgs = [...(item.images || [item.image]), newImageUrl.trim()];
                    updateFranchise(item.id, { images: updatedImgs });
                    showNotification('Added photo to franchise gallery!', 'success');
                    setNewImageUrl('');
                  }
                }}
                style={{ padding: '10px 20px', backgroundColor: '#059669', color: '#FFFFFF', border: 'none', fontWeight: 700, cursor: 'pointer' }}
              >
                + ATTACH MEDIA
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {(franchiseDb.find(f => f.id === galleryFranchiseId)?.images || [franchiseDb.find(f => f.id === galleryFranchiseId)?.image]).map((img, i) => (
              <div key={i} style={{ position: 'relative', border: '1px solid #CBD5E1', borderRadius: '4px', overflow: 'hidden' }}>
                <img src={img} alt="Gallery item" style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                <div style={{ padding: '8px', backgroundColor: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>{i === 0 ? 'COVER IMAGE' : `Slide #${i + 1}`}</span>
                  <button
                    onClick={() => {
                      const item = franchiseDb.find(f => f.id === galleryFranchiseId);
                      if (item && item.images && item.images.length > 1) {
                        updateFranchise(item.id, { images: item.images.filter((_, idx) => idx !== i) });
                        showNotification('Deleted photo from gallery.', 'warning');
                      } else {
                        showNotification('Cannot delete primary cover photo.', 'warning');
                      }
                    }}
                    style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', fontWeight: 800 }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 8: REPORTS & DATA EXPORT ================= */}
      {activeTab === 'reports' && (
        <div style={{ backgroundColor: '#FFFFFF', padding: '28px', border: '1px solid #E2E8F0' }}>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', margin: '0 0 10px 0' }}>
            ENTERPRISE FRANCHISE REPORTS & DATA EXPORT ENGINE
          </h3>
          <p style={{ margin: '0 0 24px 0', color: '#64748B', fontSize: '0.9rem' }}>
            Generate executive compliance reports, category inventory spreadsheets, and broker performance statements.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {[
              { title: 'Complete Franchise Inventory Report', desc: 'Detailed snapshot of all active, draft, and closed opportunities with ROI specifications.' },
              { title: 'Category & Location Distribution Statement', desc: 'Geographic and sector-wise breakdown across major metropolitan hubs.' },
              { title: 'Broker Assignment & Lead Conversion Report', desc: 'Performance analytics tracking assigned brokers and CRM enquiry close rates.' }
            ].map((rep, i) => (
              <div key={i} style={{ padding: '20px', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>{rep.title}</h4>
                <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: '#64748B' }}>{rep.desc}</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => exportReport('Excel')} style={{ padding: '8px 14px', backgroundColor: '#059669', color: '#FFFFFF', border: 'none', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaFileExcel /> EXCEL
                  </button>
                  <button onClick={() => exportReport('CSV')} style={{ padding: '8px 14px', backgroundColor: '#059669', color: '#FFFFFF', border: 'none', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaFileCsv /> CSV
                  </button>
                  <button onClick={() => exportReport('PDF')} style={{ padding: '8px 14px', backgroundColor: '#EF4444', color: '#FFFFFF', border: 'none', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaFilePdf /> PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= 7-SUBTAB ADD/EDIT FRANCHISE MODAL ================= */}
      {/* ================= REDESIGNED STEP-BY-STEP MODAL (MATCHING Master Property DESIGN SYSTEM) ================= */}
      {isModalOpen && (
        <div data-lenis-prevent="true" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.82)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '24px' }}>
          <div style={{ backgroundColor: '#F8FAFC', width: '100%', maxWidth: '1280px', height: '92vh', display: 'flex', flexDirection: 'column', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)', border: '1px solid #E2E8F0' }}>
            
            {/* Modal Header */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '24px 32px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: '#ECFDF5', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', color: '#059669', flexShrink: 0 }}>
                  <FaBuilding />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h3 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                      {modalMode === 'add' 
                        ? (mode === 'business' ? 'Add New Business' : 'Add New Franchise Opportunity') 
                        : (mode === 'business' ? 'Edit Business Listing' : 'Edit Franchise Opportunity')}
                    </h3>
                    <span style={{ backgroundColor: '#F1F5F9', color: '#475569', padding: '4px 14px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.5px' }}>
                      {editingFranchise.id || 'NEW'}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: '#F1F5F9', border: 'none', color: '#64748B', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', cursor: 'pointer', transition: 'all 0.2s' }} title="Close">×</button>
            </div>

            {/* Horizontal Stepper Bar */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '20px 36px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, overflowX: 'auto' }}>
              {[
                { id: 'basic', num: 1, label: 'Basic Info', sub: 'Details of opportunity' },
                { id: 'investment', num: 2, label: 'Investment', sub: 'Roi & Capital terms' },
                { id: 'business', num: 3, label: 'Company', sub: 'Establishment & outlets' },
                { id: 'space', num: 4, label: 'Space', sub: 'Area & space preference' },
                { id: 'location', num: 5, label: 'Location', sub: 'Geographic region' },
                { id: 'media', num: 6, label: 'Media', sub: 'Image & brand logo' },
                { id: 'broker', num: 7, label: 'Broker', sub: 'Assign broker CRM' }
              ].map((step, idx, arr) => {
                const isActive = modalSubTab === step.id;
                const isCompleted = arr.findIndex(x => x.id === modalSubTab) > idx;
                return (
                  <React.Fragment key={step.id}>
                    <button
                      type="button"
                      onClick={() => setModalSubTab(step.id as any)}
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, whiteSpace: 'nowrap' }}
                    >
                      <div style={{
                        width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.95rem',
                        backgroundColor: isActive ? '#059669' : isCompleted ? '#059669' : '#F1F5F9',
                        color: isActive || isCompleted ? '#FFFFFF' : '#64748B',
                        boxShadow: isActive ? '0 2px 6px rgba(5,150,105,0.2)' : 'none',
                        transition: 'all 0.2s'
                      }}>
                        {isCompleted ? <FaCheck style={{ fontSize: '0.85rem' }} /> : step.num}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.92rem', color: isActive ? '#059669' : isCompleted ? '#0F172A' : '#475569' }}>{step.label}</span>
                        <span style={{ fontWeight: 500, fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>{step.sub}</span>
                      </div>
                    </button>
                    {idx < arr.length - 1 && (
                      <div style={{ flexGrow: 1, height: '1.5px', backgroundColor: isCompleted ? '#059669' : '#E2E8F0', minWidth: '24px', margin: '0 16px', transition: 'background 0.2s' }} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSaveFranchise} style={{ padding: '28px 36px', overflowY: 'auto', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              
              <div style={{ flexGrow: 1, marginBottom: '24px' }}>
                {modalSubTab === 'basic' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: '24px', alignItems: 'stretch' }}>
                    {/* Left Column: Form Card */}
                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '28px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669', margin: 0 }}>1. Basic Information</h4>
                        <p style={{ color: '#64748B', fontSize: '0.88rem', margin: '4px 0 20px 0' }}>Provide essential details about the opportunity</p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>BRAND / TITLE NAME *</label>
                          <input
                            type="text"
                            required
                            value={editingFranchise.brand || ''}
                            onChange={e => setEditingFranchise({ ...editingFranchise, brand: e.target.value })}
                            placeholder={mode === 'business' ? "e.g. Premium Coffee Shop & Lounge" : "e.g. Starbucks Coffee Franchise"}
                            style={{ width: '100%', padding: '14px', border: '1.5px solid #CBD5E1', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, outline: 'none' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>BUSINESS SUBTYPE DESCRIPTION *</label>
                          <input
                            type="text"
                            required
                            value={editingFranchise.type || ''}
                            onChange={e => setEditingFranchise({ ...editingFranchise, type: e.target.value })}
                            placeholder="e.g. Artisanal Coffee & Bakery Chain"
                            style={{ width: '100%', padding: '14px', border: '1.5px solid #CBD5E1', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, outline: 'none' }}
                          />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <div>
                            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>CATEGORY</label>
                            <select
                              value={editingFranchise.category || 'Food & Beverage'}
                              onChange={e => setEditingFranchise({ ...editingFranchise, category: e.target.value })}
                              style={{ width: '100%', padding: '14px', border: '1.5px solid #CBD5E1', borderRadius: '8px', fontWeight: 600, backgroundColor: '#FFFFFF' }}
                            >
                              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                          </div>
                          <div>
                            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>OPPORTUNITY TYPE</label>
                            <select
                              value={editingFranchise.opportunityType || (mode === 'business' ? 'Existing Business' : 'New Franchise')}
                              onChange={e => setEditingFranchise({ ...editingFranchise, opportunityType: e.target.value as any })}
                              style={{ width: '100%', padding: '14px', border: '1.5px solid #CBD5E1', borderRadius: '8px', fontWeight: 600, backgroundColor: '#FFFFFF' }}
                            >
                              <option value="New Franchise">New Franchise Opportunity</option>
                              <option value="Existing Business">Existing Running Business for Sale</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>DETAILED OPPORTUNITY OVERVIEW</label>
                          <textarea
                            rows={4}
                            value={editingFranchise.detailedDescription || ''}
                            onChange={e => setEditingFranchise({ ...editingFranchise, detailedDescription: e.target.value })}
                            placeholder="Provide a rich, compelling overview of the business architecture, operational margins, views, surroundings, and exclusive features..."
                            style={{ width: '100%', padding: '14px', border: '1.5px solid #CBD5E1', borderRadius: '8px', fontSize: '0.95rem', lineHeight: 1.6, outline: 'none' }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Guide Card */}
                    <div style={{ backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center' }}>
                      <h5 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#059669', margin: 0 }}>Listing Guidelines</h5>
                      <p style={{ color: '#475569', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
                        Provide clear, precise descriptions of the operational model and brand parameters. Standardizing the title and subtype formatting makes your listings highly searchable for prospective brokers and investors.
                      </p>
                      <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', padding: '16px', display: 'flex', gap: '12px', color: '#059669', fontSize: '0.85rem', fontWeight: 600 }}>
                        <span style={{ fontSize: '1.25rem' }}></span>
                        <span>Ensure brand name matches registered trade name exactly to ensure successful verification.</span>
                      </div>
                    </div>
                  </div>
                )}

                {modalSubTab === 'investment' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: '24px', alignItems: 'stretch' }}>
                    {/* Left Column: Form Card */}
                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '28px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669', margin: 0 }}>2. Investment & ROI Terms</h4>
                        <p style={{ color: '#64748B', fontSize: '0.88rem', margin: '4px 0 20px 0' }}>Provide financial parameters and capital requirements</p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <div>
                            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>MINIMUM INVESTMENT (Lakhs ₹)</label>
                            <input
                              type="number"
                              value={editingFranchise.minInvestment || 25}
                              onChange={e => setEditingFranchise({ ...editingFranchise, minInvestment: Number(e.target.value), investmentDisplay: `₹${e.target.value} - ₹${editingFranchise.maxInvestment || 45} Lakhs` })}
                              style={{ width: '100%', padding: '14px', border: '1.5px solid #CBD5E1', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, outline: 'none' }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>MAXIMUM INVESTMENT (Lakhs ₹)</label>
                            <input
                              type="number"
                              value={editingFranchise.maxInvestment || 45}
                              onChange={e => setEditingFranchise({ ...editingFranchise, maxInvestment: Number(e.target.value), investmentDisplay: `₹${editingFranchise.minInvestment || 25} - ₹${e.target.value} Lakhs` })}
                              style={{ width: '100%', padding: '14px', border: '1.5px solid #CBD5E1', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, outline: 'none' }}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <div>
                            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>EXPECTED ROI (%)</label>
                            <input
                              type="text"
                              placeholder="e.g. 35% - 45%"
                              value={editingFranchise.expectedRoi || ''}
                              onChange={e => setEditingFranchise({ ...editingFranchise, expectedRoi: e.target.value })}
                              style={{ width: '100%', padding: '14px', border: '1.5px solid #CBD5E1', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, outline: 'none' }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>EXPECTED PAYBACK PERIOD</label>
                            <input
                              type="text"
                              placeholder="e.g. 14 - 18 Months"
                              value={editingFranchise.paybackPeriod || ''}
                              onChange={e => setEditingFranchise({ ...editingFranchise, paybackPeriod: e.target.value })}
                              style={{ width: '100%', padding: '14px', border: '1.5px solid #CBD5E1', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, outline: 'none' }}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <div>
                            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>FRANCHISE FEE</label>
                            <input
                              type="text"
                              placeholder="e.g. ₹5 Lakhs"
                              value={editingFranchise.franchiseFee || ''}
                              onChange={e => setEditingFranchise({ ...editingFranchise, franchiseFee: e.target.value })}
                              style={{ width: '100%', padding: '14px', border: '1.5px solid #CBD5E1', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, outline: 'none' }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>ROYALTY FEE</label>
                            <input
                              type="text"
                              placeholder="e.g. 6% of monthly revenue"
                              value={editingFranchise.royaltyFee || ''}
                              onChange={e => setEditingFranchise({ ...editingFranchise, royaltyFee: e.target.value })}
                              style={{ width: '100%', padding: '14px', border: '1.5px solid #CBD5E1', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, outline: 'none' }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Guide Card */}
                    <div style={{ backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center' }}>
                      <h5 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#059669', margin: 0 }}>Investment Verification</h5>
                      <p style={{ color: '#475569', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
                        Provide transparent financial projections. Minimum and maximum capital thresholds will help filter candidates effectively based on their budget profiles.
                      </p>
                    </div>
                  </div>
                )}

                {modalSubTab === 'business' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: '24px', alignItems: 'stretch' }}>
                    {/* Left Column: Form Card */}
                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '28px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669', margin: 0 }}>3. Company & Operational Details</h4>
                        <p style={{ color: '#64748B', fontSize: '0.88rem', margin: '4px 0 20px 0' }}>Provide company background and historical parameters</p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>LEGAL COMPANY NAME</label>
                          <input
                            type="text"
                            value={editingFranchise.companyName || ''}
                            onChange={e => setEditingFranchise({ ...editingFranchise, companyName: e.target.value })}
                            placeholder="e.g. Coffee Labs Private Limited"
                            style={{ width: '100%', padding: '14px', border: '1.5px solid #CBD5E1', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, outline: 'none' }}
                          />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <div>
                            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>YEAR ESTABLISHED</label>
                            <input
                              type="number"
                              value={editingFranchise.yearEstablished || 2020}
                              onChange={e => setEditingFranchise({ ...editingFranchise, yearEstablished: Number(e.target.value) })}
                              style={{ width: '100%', padding: '14px', border: '1.5px solid #CBD5E1', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, outline: 'none' }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>EXISTING OPERATIONAL OUTLETS</label>
                            <input
                              type="number"
                              value={editingFranchise.existingOutletsCount || 10}
                              onChange={e => setEditingFranchise({ ...editingFranchise, existingOutletsCount: Number(e.target.value) })}
                              style={{ width: '100%', padding: '14px', border: '1.5px solid #CBD5E1', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, outline: 'none' }}
                            />
                          </div>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>BUSINESS MODEL</label>
                          <input
                            type="text"
                            placeholder="FOFO / FOCO / COCO"
                            value={editingFranchise.businessModel || 'FOFO'}
                            onChange={e => setEditingFranchise({ ...editingFranchise, businessModel: e.target.value })}
                            style={{ width: '100%', padding: '14px', border: '1.5px solid #CBD5E1', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, outline: 'none' }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Guide Card */}
                    <div style={{ backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center' }}>
                      <h5 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#059669', margin: 0 }}>Operational Models</h5>
                      <p style={{ color: '#475569', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
                        Select the correct operational model category:
                        <br />• <strong>FOFO</strong>: Franchise Owned Franchise Operated
                        <br />• <strong>FOCO</strong>: Franchise Owned Company Operated
                        <br />• <strong>COCO</strong>: Company Owned Company Operated
                      </p>
                    </div>
                  </div>
                )}

                {modalSubTab === 'space' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: '24px', alignItems: 'stretch' }}>
                    {/* Left Column: Form Card */}
                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '28px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669', margin: 0 }}>4. Space Specifications</h4>
                        <p style={{ color: '#64748B', fontSize: '0.88rem', margin: '4px 0 20px 0' }}>Provide structural and layout requirements</p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <div>
                            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>MINIMUM AREA REQUIRED (Sq. Ft.)</label>
                            <input
                              type="number"
                              value={editingFranchise.minAreaSqFt || 500}
                              onChange={e => setEditingFranchise({ ...editingFranchise, minAreaSqFt: Number(e.target.value) })}
                              style={{ width: '100%', padding: '14px', border: '1.5px solid #CBD5E1', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, outline: 'none' }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>SHOP TYPE PREFERENCE</label>
                            <select
                              value={editingFranchise.shopType || 'High Street'}
                              onChange={e => setEditingFranchise({ ...editingFranchise, shopType: e.target.value as any })}
                              style={{ width: '100%', padding: '14px', border: '1.5px solid #CBD5E1', borderRadius: '8px', fontWeight: 600, backgroundColor: '#FFFFFF' }}
                            >
                              <option value="High Street">High Street Frontage</option>
                              <option value="Mall">Shopping Mall</option>
                              <option value="Standalone">Standalone Building</option>
                              <option value="Kiosk">Kiosk / Island</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Guide Card */}
                    <div style={{ backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center' }}>
                      <h5 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#059669', margin: 0 }}>Space Guidelines</h5>
                      <p style={{ color: '#475569', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
                        Provide details on spatial specifications to verify structural requirements fit standard brand blueprints cleanly.
                      </p>
                    </div>
                  </div>
                )}

                {modalSubTab === 'location' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 1fr)', gap: '24px', alignItems: 'stretch' }}>
                      
                      {/* Left Column: Franchise/Business Location Details */}
                      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '28px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669', margin: 0 }}>5. Listing Location</h4>
                          <p style={{ color: '#64748B', fontSize: '0.88rem', margin: '4px 0 20px 0' }}>Search and select the exact location of the business/franchise</p>

                          {/* Search Bar Row */}
                          <div style={{ position: 'relative' }}>
                            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '8px' }}>Search Address</label>
                            <div style={{ display: 'flex', gap: '12px' }}>
                              <div style={{ flexGrow: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <FaMapMarkerAlt style={{ position: 'absolute', left: '16px', color: '#059669', fontSize: '1.1rem' }} />
                                <input
                                  type="text"
                                  value={addressSearchQuery || editingFranchise.formatted_address || editingFranchise.fullAddress || ''}
                                  onChange={e => {
                                    setAddressSearchQuery(e.target.value);
                                    setShowLocationSuggestions(true);
                                  }}
                                  onFocus={() => setShowLocationSuggestions(true)}
                                  placeholder="e.g. Jubilee Hills Road No 36, Hyderabad, Telangana, India"
                                  style={{ width: '100%', padding: '12px 40px 12px 44px', border: '1.5px solid #059669', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, color: '#0F172A', outline: 'none', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)', boxSizing: 'border-box' }}
                                />
                                {(addressSearchQuery || editingFranchise.formatted_address) && (
                                  <button type="button" onClick={() => { setAddressSearchQuery(''); setEditingFranchise({ ...editingFranchise, formatted_address: '', fullAddress: '' }); }} style={{ position: 'absolute', right: '14px', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '1.1rem', padding: '2px' }}>×</button>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={handleAdminDetectGPS}
                                disabled={isAdminDetectingGPS}
                                style={{ padding: '12px 22px', backgroundColor: '#059669', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', boxShadow: '0 2px 6px rgba(5,150,105,0.2)', transition: 'background 0.2s' }}
                              >
                                <FaCrosshairs /> {isAdminDetectingGPS ? 'Detecting...' : 'Detect My Location'}
                              </button>
                            </div>

                            {/* Autocomplete Suggestions Dropdown */}
                            {showLocationSuggestions && (
                              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 5000, backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)', marginTop: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                                {isSearchingLive && (
                                  <div style={{ padding: '12px 16px', color: '#059669', fontWeight: 600, fontSize: '0.85rem', backgroundColor: '#ECFDF5' }}>
                                    Searching live location data...
                                  </div>
                                )}
                                {liveSuggestions.map((place, idx) => (
                                  <div
                                    key={idx}
                                    onClick={() => handleSelectGooglePlace(place)}
                                    style={{ padding: '12px 16px', borderBottom: '1px solid #F1F5F9', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: '12px', transition: 'background 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                                  >
                                    <FaMapMarkerAlt style={{ color: '#EF4444', marginTop: '3px', flexShrink: 0 }} />
                                    <div>
                                      <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.9rem' }}>{place.area}, {place.city}</div>
                                      <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{place.formatted_address}</div>
                                    </div>
                                  </div>
                                ))}
                                {addressSearchQuery && (
                                  <div
                                    onClick={async () => {
                                      setIsSearchingLive(true);
                                      const customPlace = await geocodeLocationOnline(addressSearchQuery);
                                      setIsSearchingLive(false);
                                      handleSelectGooglePlace(customPlace);
                                    }}
                                    style={{ padding: '12px 16px', backgroundColor: '#ECFDF5', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600, color: '#059669', fontSize: '0.85rem' }}
                                  >
                                    <FaMapMarkerAlt /> Use "{addressSearchQuery}" (Auto-Geocode)
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Success/Warning Banner */}
                          {editingFranchise.latitude && editingFranchise.latitude !== 0 ? (
                            <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', padding: '14px 18px', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '10px', color: '#059669', fontWeight: 700, fontSize: '0.88rem' }}>
                              <FaCheckCircle style={{ fontSize: '1.1rem', flexShrink: 0 }} />
                              <span>Location verified successfully</span>
                            </div>
                          ) : (
                            <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FEF3C7', borderRadius: '8px', padding: '14px 18px', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '10px', color: '#B45309', fontWeight: 700, fontSize: '0.88rem' }}>
                              <FaMapMarkerAlt style={{ fontSize: '1.1rem', flexShrink: 0 }} />
                              <span>Please search for a location or drag the marker on the map</span>
                            </div>
                          )}

                          {/* Location Details (Auto-Geocoded & Manual Entry) */}
                          <h5 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#059669', margin: '24px 0 14px 0' }}>Location Details (Auto-Geocoded & Manual Entry)</h5>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                            <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                              <FaGlobe style={{ fontSize: '1.1rem', color: '#64748B', marginTop: '2px', flexShrink: 0 }} />
                              <div>
                                <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>Country</div>
                                <div style={{ fontSize: '0.92rem', color: '#0F172A', fontWeight: 800, marginTop: '2px' }}>{editingFranchise.country || 'India'}</div>
                              </div>
                            </div>
                            <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                              <FaMap style={{ fontSize: '1.1rem', color: '#64748B', marginTop: '2px', flexShrink: 0 }} />
                              <div>
                                <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>State</div>
                                <div style={{ fontSize: '0.92rem', color: '#0F172A', fontWeight: 800, marginTop: '2px' }}>{editingFranchise.state || '-'}</div>
                              </div>
                            </div>
                            <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                              <FaMapMarkerAlt style={{ fontSize: '1.1rem', color: '#64748B', marginTop: '2px', flexShrink: 0 }} />
                              <div>
                                <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>District</div>
                                <div style={{ fontSize: '0.92rem', color: '#0F172A', fontWeight: 800, marginTop: '2px' }}>{editingFranchise.district || '-'}</div>
                              </div>
                            </div>
                            <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                              <FaCity style={{ fontSize: '1.1rem', color: '#64748B', marginTop: '2px', flexShrink: 0 }} />
                              <div>
                                <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>City</div>
                                <div style={{ fontSize: '0.92rem', color: '#0F172A', fontWeight: 800, marginTop: '2px' }}>{editingFranchise.city || '-'}</div>
                              </div>
                            </div>
                            <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                              <FaCompass style={{ fontSize: '1.1rem', color: '#059669', marginTop: '2px', flexShrink: 0 }} />
                              <div style={{ width: '100%' }}>
                                <label style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, display: 'block', marginBottom: '2px' }}>Area / Locality</label>
                                <input 
                                  type="text" 
                                  value={editingFranchise.area || ''} 
                                  onChange={e => setEditingFranchise({ ...editingFranchise, area: e.target.value })} 
                                  placeholder="Enter Area / Locality" 
                                  style={{ width: '100%', padding: '4px 0', border: 'none', borderBottom: '1px solid #CBD5E1', backgroundColor: 'transparent', fontSize: '0.92rem', color: '#0F172A', fontWeight: 800, outline: 'none' }} 
                                />
                              </div>
                            </div>
                            <div style={{ backgroundColor: '#ECFDF5', border: '1.5px solid #A7F3D0', borderRadius: '8px', padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                              <FaMapMarkerAlt style={{ fontSize: '1.1rem', color: '#059669', marginTop: '2px', flexShrink: 0 }} />
                              <div style={{ width: '100%' }}>
                                <label style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 800, display: 'block', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Sub-Location / Landmark (Manual Entry)</label>
                                <input 
                                  type="text" 
                                  value={editingFranchise.subLocation || editingFranchise.sub_location || ''} 
                                  onChange={e => {
                                    const subLoc = e.target.value;
                                    setEditingFranchise({ 
                                      ...editingFranchise, 
                                      subLocation: subLoc,
                                      sub_location: subLoc,
                                      landmark: subLoc
                                    });
                                  }} 
                                  placeholder="e.g. Phase 2, Near Tech Park, Sector 5" 
                                  style={{ width: '100%', padding: '4px 0', border: 'none', borderBottom: '1.5px solid #059669', backgroundColor: 'transparent', fontSize: '0.92rem', color: '#064E3B', fontWeight: 800, outline: 'none' }} 
                                />
                              </div>
                            </div>
                            <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                              <FaEnvelope style={{ fontSize: '1.1rem', color: '#64748B', marginTop: '2px', flexShrink: 0 }} />
                              <div style={{ width: '100%' }}>
                                <label style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, display: 'block', marginBottom: '2px' }}>Postal Code (Manual Entry)</label>
                                <input 
                                  type="text" 
                                  value={editingFranchise.pincode || editingFranchise.postal_code || ''} 
                                  onChange={e => {
                                    const newPin = e.target.value;
                                    const oldPin = editingFranchise.pincode || editingFranchise.postal_code;
                                    let newAddress = editingFranchise.formatted_address || editingFranchise.fullAddress || '';
                                    if (oldPin && newAddress.includes(oldPin)) {
                                      newAddress = newAddress.replace(oldPin, newPin);
                                    } else {
                                      newAddress = newAddress.replace(/\b\d{6}\b/, newPin);
                                    }
                                    setEditingFranchise({ 
                                      ...editingFranchise, 
                                      postal_code: newPin, 
                                      pincode: newPin,
                                      formatted_address: newAddress,
                                      fullAddress: newAddress
                                    });
                                  }} 
                                  placeholder="Enter Pincode" 
                                  style={{ width: '100%', padding: '4px 0', border: 'none', borderBottom: '1px solid #CBD5E1', backgroundColor: 'transparent', fontSize: '0.92rem', color: '#0F172A', fontWeight: 800, outline: 'none' }} 
                                />
                              </div>
                            </div>
                          </div>

                          {/* Coordinates Row */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '12px' }}>
                            <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <FaCrosshairs style={{ color: '#059669', fontSize: '1rem', flexShrink: 0 }} />
                              <div>
                                <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>Latitude</div>
                                <div style={{ fontSize: '0.88rem', color: '#059669', fontWeight: 800 }}>{editingFranchise.latitude?.toFixed(6) || '-'}</div>
                              </div>
                            </div>
                            <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <FaCompass style={{ color: '#059669', fontSize: '1rem', flexShrink: 0 }} />
                              <div>
                                <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>Longitude</div>
                                <div style={{ fontSize: '0.88rem', color: '#059669', fontWeight: 800 }}>{editingFranchise.longitude?.toFixed(6) || '-'}</div>
                              </div>
                            </div>
                          </div>

                          {/* Formatted Address Box */}
                          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px 18px', marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Full Formatted Address</span>
                              <span style={{ fontSize: '0.88rem', color: '#0F172A', fontWeight: 700 }}>{editingFranchise.formatted_address || editingFranchise.fullAddress || '-'}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(editingFranchise.formatted_address || editingFranchise.fullAddress || 'Jubilee Hills, Hyderabad');
                                showNotification?.('Address copied to clipboard!', 'success');
                              }}
                              style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '1.2rem', padding: '4px', display: 'flex', alignItems: 'center' }}
                              title="Copy Address"
                            >
                              <FaCopy />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Location Map Preview */}
                      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '28px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669', margin: 0 }}>Location Preview</h4>
                              <p style={{ color: '#64748B', fontSize: '0.88rem', margin: '4px 0 0 0' }}>Drag the marker to fine-tune the exact location</p>
                            </div>
                            <a
                              href={`https://maps.google.com/?q=${mapMarkerPos.lat},${mapMarkerPos.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ padding: '8px 16px', backgroundColor: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
                            >
                              Open in Google Maps <FaExternalLinkAlt style={{ fontSize: '0.75rem' }} />
                            </a>
                          </div>

                          {/* Leaflet LocationPickerMap Container */}
                          <div style={{ marginTop: '20px', position: 'relative', height: '380px', borderRadius: '16px', overflow: 'hidden' }}>
                            <LocationPickerMap
                              latitude={mapMarkerPos.lat}
                              longitude={mapMarkerPos.lng}
                              onChange={handleMarkerDrag}
                              radius={editingFranchise.service_radius || 10}
                              city={editingFranchise.city || 'Hyderabad'}
                              height="380px"
                            />

                            {/* Fine-tune Controls Overlay */}
                            <div style={{ position: 'absolute', bottom: '14px', left: '14px', right: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.95)', padding: '8px 14px', borderRadius: '8px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)', border: '1px solid #E2E8F0', zIndex: 1000 }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>Fine-tune Marker GPS:</span>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button type="button" onClick={() => handleMarkerDrag(mapMarkerPos.lat + 0.0002, mapMarkerPos.lng)} style={{ padding: '6px 12px', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', color: '#1E293B' }}>↑ N</button>
                                <button type="button" onClick={() => handleMarkerDrag(mapMarkerPos.lat - 0.0002, mapMarkerPos.lng)} style={{ padding: '6px 12px', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', color: '#1E293B' }}>↓ S</button>
                                <button type="button" onClick={() => handleMarkerDrag(mapMarkerPos.lat, mapMarkerPos.lng - 0.0002)} style={{ padding: '6px 12px', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', color: '#1E293B' }}>← W</button>
                                <button type="button" onClick={() => handleMarkerDrag(mapMarkerPos.lat, mapMarkerPos.lng + 0.0002)} style={{ padding: '6px 12px', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', color: '#1E293B' }}>→ E</button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Tip Box */}
                        <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', padding: '14px 18px', marginTop: '20px', display: 'flex', alignItems: 'center', gap: '12px', color: '#059669', fontSize: '0.88rem', fontWeight: 600 }}>
                          <FaLightbulb style={{ color: '#059669', fontSize: '1.2rem', flexShrink: 0 }} />
                          <span>Tip: Drag the marker to adjust the exact location if needed.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {modalSubTab === 'media' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: '24px', alignItems: 'stretch' }}>
                    {/* Left Column: Form Card */}
                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '28px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669', margin: 0 }}>6. Media & Creative Uploads</h4>
                        <p style={{ color: '#64748B', fontSize: '0.88rem', margin: '4px 0 20px 0' }}>Upload brand cover and logo images</p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Primary Cover Image */}
                        <div style={{ backgroundColor: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#059669' }}>
                              PRIMARY COVER IMAGE
                            </span>
                          </div>
                          {editingFranchise.image && (
                            <div style={{ width: '100%', height: '180px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#E2E8F0' }}>
                              <img src={editingFranchise.image} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          )}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                e.preventDefault();
                                const file = e.dataTransfer.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (ev) => {
                                    setEditingFranchise({ ...editingFranchise, image: ev.target?.result as string });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              onClick={() => document.getElementById('franchise-cover-file')?.click()}
                              style={{
                                border: '2px dashed #CBD5E1',
                                borderRadius: '8px',
                                padding: '16px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                backgroundColor: '#FFFFFF',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                color: '#475569',
                              }}
                            >
                              <div>Drag & Drop or Click to Upload Primary Cover Image</div>
                              <div style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: '2px' }}>PNG, JPG, or WEBP</div>
                            </div>
                            <input
                              id="franchise-cover-file"
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (ev) => {
                                    setEditingFranchise({ ...editingFranchise, image: ev.target?.result as string });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </div>
                        </div>

                        {/* Brand Logo */}
                        <div style={{ backgroundColor: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#059669' }}>
                              BRAND LOGO
                            </span>
                          </div>
                          {editingFranchise.logo && (
                            <div style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#E2E8F0', border: '2px solid #059669', alignSelf: 'center' }}>
                              <img src={editingFranchise.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          )}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                e.preventDefault();
                                const file = e.dataTransfer.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (ev) => {
                                    setEditingFranchise({ ...editingFranchise, logo: ev.target?.result as string });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              onClick={() => document.getElementById('franchise-logo-file')?.click()}
                              style={{
                                border: '2px dashed #CBD5E1',
                                borderRadius: '8px',
                                padding: '16px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                backgroundColor: '#FFFFFF',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                color: '#475569',
                              }}
                            >
                              <div>Drag & Drop or Click to Upload Brand Logo</div>
                              <div style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: '2px' }}>PNG, JPG, or WEBP</div>
                            </div>
                            <input
                              id="franchise-logo-file"
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (ev) => {
                                    setEditingFranchise({ ...editingFranchise, logo: ev.target?.result as string });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Guide Card */}
                    <div style={{ backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center' }}>
                      <h5 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#059669', margin: 0 }}>Creative Requirements</h5>
                      <p style={{ color: '#475569', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
                        High-quality cover assets increase click-through rates by up to 4x. Make sure the cover is a landscape image, and logo is a square layout.
                      </p>
                    </div>
                  </div>
                )}

                {modalSubTab === 'broker' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: '24px', alignItems: 'stretch' }}>
                    {/* Left Column: Form Card */}
                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '28px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669', margin: 0 }}>7. Broker Assignments</h4>
                        <p style={{ color: '#64748B', fontSize: '0.88rem', margin: '4px 0 20px 0' }}>Assign sales representatives or advisors to handle leads</p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <input
                          type="text"
                          placeholder="Search broker by name or company..."
                          value={brokerSearch}
                          onChange={e => setBrokerSearch(e.target.value)}
                          style={{ width: '100%', padding: '14px', border: '1.5px solid #CBD5E1', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, outline: 'none' }}
                        />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                          {dealersDb
                            .filter(d => (d.name || d.companyName || '').toLowerCase().includes(brokerSearch.toLowerCase()) || (d.company || d.companyName || '').toLowerCase().includes(brokerSearch.toLowerCase()))
                            .map(dealer => {
                              const isAssigned = (editingFranchise.assignedBrokerIds || []).includes(dealer.id);
                              return (
                                <div
                                  key={dealer.id}
                                  onClick={() => toggleBrokerAssignment(dealer.id)}
                                  style={{
                                    padding: '14px',
                                    border: isAssigned ? '2px solid #059669' : '1px solid #CBD5E1',
                                    backgroundColor: isAssigned ? '#ECFDF5' : '#FFFFFF',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    borderRadius: '8px',
                                    transition: 'all 0.2s',
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {dealer.image || dealer.photo || dealer.logo ? (
                                      <img src={dealer.image || dealer.photo || dealer.logo} alt={dealer.name} style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} />
                                    ) : (
                                      <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#E0F2FE', color: '#0369A1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                                        <FaUserTie />
                                      </div>
                                    )}
                                    <div>
                                      <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0F172A' }}>{dealer.name}</div>
                                      <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{dealer.company} • {dealer.rating}</div>
                                    </div>
                                  </div>
                                  <span style={{ fontWeight: 800, color: isAssigned ? '#059669' : '#94A3B8', fontSize: '0.85rem' }}>{isAssigned ? 'ASSIGNED' : '+ Assign'}</span>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Guide Card */}
                    <div style={{ backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center' }}>
                      <h5 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#059669', margin: 0 }}>Broker CRM Workflows</h5>
                      <p style={{ color: '#475569', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
                        Assigning active brokers gives them access to leads, client inquiries, and transaction pipelines linked to this marketplace listing.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer Controls */}
              <div style={{ marginTop: 'auto', borderTop: '1px solid #E2E8F0', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '12px 24px', backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', color: '#475569', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  CANCEL
                </button>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="submit"
                    style={{ padding: '12px 28px', backgroundColor: '#059669', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 2px 6px rgba(5,150,105,0.2)', transition: 'all 0.2s' }}
                  >
                    {modalMode === 'add' ? 'SAVE & PUBLISH' : 'SAVE CHANGES'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
