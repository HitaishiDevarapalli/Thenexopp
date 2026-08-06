import React, { useState, useMemo, useEffect } from 'react';
import { 
  propertiesDb, 
  addProperty, 
  updateProperty, 
  deleteProperty, 
  dealersDb,
  notifyDataChanged
} from '../db/marketplaceDb';
import type { PropertyListing } from '../db/marketplaceDb';
import { COMPREHENSIVE_INDIA_PLACES_DB, searchLivePlaces, geocodeLocationOnline, reverseGeocodeOnline } from '../utils/locationIntelligence';
import { LocationPickerMap } from './ui/LocationPickerMap';
import { 
  FaBuilding, FaSearch, FaPlus, FaEdit, FaTrash, 
  FaCrown, FaMapMarkerAlt, FaFileExport, FaCopy, 
  FaCheck, FaChartBar, FaGlobe, FaMap, FaCity, FaCompass, 
  FaEnvelope, FaCrosshairs, FaExternalLinkAlt, FaTimes, 
  FaArrowRight, FaCheckCircle, FaLightbulb, FaList, FaLayerGroup, 
  FaMoneyBillWave, FaCamera, FaUserTie, FaShareAlt, FaEye
} from 'react-icons/fa';

interface PropertyManagementSystemProps {
  showNotification?: (message: string, type?: string) => void;
  activeSubTab?: string;
  onSubTabChange?: (tab: string) => void;
}

const ALL_AMENITIES = [
  "Lift", "Parking", "Swimming Pool", "Gym", "Club House", 
  "Children's Play Area", "Security", "CCTV", "Power Backup", "Garden", 
  "Water Supply", "Internet", "Visitor Parking", "Rainwater Harvesting", "EV Charging"
];

const CATEGORY_SUBTYPES: Record<string, string[]> = {
  Residential: ["Flats", "Apartments", "Individual Houses", "Villas", "Duplex Houses", "Studio Apartments"],
  Land: ["Residential Plots", "Commercial Plots", "Agricultural Land", "Farm Land", "Industrial Land"],
  Commercial: ["Office Space", "Shops", "Showrooms", "Warehouses", "Industrial Buildings"]
};

const GOOGLE_PLACES_SUGGESTIONS = COMPREHENSIVE_INDIA_PLACES_DB;

export const PropertyManagementSystem: React.FC<PropertyManagementSystemProps> = ({ showNotification, activeSubTab, onSubTabChange: _onSubTabChange }) => {
  // Main Navigation Tabs
  const [activeModuleTab, setActiveModuleTab] = useState<'listings' | 'editProperty' | 'featured' | 'analytics' | 'categories' | 'locations' | 'soldOut' | 'reports'>('listings');

  React.useEffect(() => {
    if (activeSubTab) {
      setActiveModuleTab(activeSubTab as any);
    }
  }, [activeSubTab]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>('All');

  // Bulk Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'duplicate'>('add');
  const [modalSubTab, setModalSubTab] = useState<'location' | 'basic' | 'specs' | 'pricing' | 'media' | 'review'>('location');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewAnalyticsProperty, setViewAnalyticsProperty] = useState<PropertyListing | null>(null);

  // Location Intelligence Picker State & Helpers
  const [addressSearchQuery, setAddressSearchQuery] = useState('');
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [mapMarkerPos, setMapMarkerPos] = useState<{ lat: number; lng: number }>({ lat: 17.4326, lng: 78.4071 });
  const [liveSuggestions, setLiveSuggestions] = useState<typeof GOOGLE_PLACES_SUGGESTIONS>(GOOGLE_PLACES_SUGGESTIONS);
  const [isSearchingLive, setIsSearchingLive] = useState(false);
  const [priceUnit, setPriceUnit] = useState<'Thousands' | 'Lakhs' | 'Crores'>('Lakhs');

  useEffect(() => {
    if (!addressSearchQuery || addressSearchQuery.trim().length < 2) {
      setLiveSuggestions(GOOGLE_PLACES_SUGGESTIONS.slice(0, 15));
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
    setFormData(prev => ({
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
      postal_code: place.postal_code
    }));
    setMapMarkerPos({ lat, lng });
    setAddressSearchQuery(place.formatted_address);
    setShowLocationSuggestions(false);
    showNotification?.(`Verified location selected: ${place.area}, ${place.city} (Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)})`, "success");
  };

  const [isAdminDetectingGPS, setIsAdminDetectingGPS] = useState(false);
  const handleAdminDetectGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsAdminDetectingGPS(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const place = await geocodeLocationOnline(`${latitude}, ${longitude}`);
        handleSelectGooglePlace(place);
        setIsAdminDetectingGPS(false);
      },
      () => {
        setIsAdminDetectingGPS(false);
        alert("Unable to retrieve your location. Please check browser permissions.");
      }
    );
  };

  const handleMarkerDrag = async (newLat: number, newLng: number) => {
    setMapMarkerPos({ lat: newLat, lng: newLng });
    const revPlace = await reverseGeocodeOnline(newLat, newLng);
    setFormData(prev => ({
      ...prev,
      latitude: newLat,
      longitude: newLng,
      country: revPlace.country || prev.country || 'India',
      state: revPlace.state || prev.state || '',
      district: revPlace.district || prev.district || '',
      city: revPlace.city || prev.city || '',
      area: revPlace.area || prev.area || '',
      locality: revPlace.area || prev.locality || '',
      postal_code: revPlace.postal_code || prev.postal_code || '',
      pincode: revPlace.postal_code || prev.pincode || '',
      formatted_address: revPlace.formatted_address,
      fullAddress: revPlace.fullAddress || revPlace.formatted_address
    }));
    showNotification?.(`Reverse Geocoded: Marker shifted to Lat ${newLat.toFixed(6)}, Lng ${newLng.toFixed(6)}`, "success");
  };

  // Form State
  const [formData, setFormData] = useState<Partial<PropertyListing>>({
    title: '',
    category: 'Villa',
    propertySubtype: 'Villas',
    propertyPurpose: 'Sale',
    status: 'Buy',
    price: 0,
    priceDisplay: '',
    areaSqFt: '',
    superBuiltUpArea: '',
    carpetArea: '',
    plotArea: '',
    bedrooms: undefined,
    bathrooms: undefined,
    balconies: undefined,
    floorNumber: undefined,
    totalFloors: undefined,
    facing: '',
    ageYears: undefined,
    furnishing: '',
    parkingSlots: undefined,
    ownershipType: '',
    negotiable: true,
    state: '',
    district: '',
    city: '',
    area: '',
    locality: '',
    landmark: '',
    pincode: '',
    postal_code: '',
    fullAddress: '',
    formatted_address: '',
    google_place_id: '',
    latitude: 0,
    longitude: 0,
    description: '',
    amenities: [],
    image: '',
    image2: '',
    image3: '',
    image4: '',
    image5: '',
    image6: '',
    images: [],
    dealerId: dealersDb[0]?.id || 'D1',
    assignedBrokerIds: [],
    approvalStatus: 'Published',
    listingStatus: 'Published',
    featured: false,
    featuredDuration: '30 Days',
    homepagePriority: 5,
    highlightPropertyCard: false,
    sponsoredListing: false,
    prioritySearchPlacement: false,
    rating: 4.8,
    reviewCount: 12,
    verified: true,
    premium: true,
    seoTitle: '',
    metaDescription: '',
    urlSlug: '',
    marketingFlags: {
      featureOnHomepage: true,
      pushNotification: false,
      emailCampaign: false,
      socialMediaShare: true
    }
  });

  // Auto-generate Property ID in Add Mode
  useEffect(() => {
    if (modalMode === 'add') {
      const num = propertiesDb.length + 1;
      const stateCode = formData.state ? formData.state.substring(0, 2).toUpperCase() : 'XX';
      const typeCode = formData.propertyPurpose === 'Rent' ? 'R' : 'S';
      let catCode = 'O';
      if (formData.category?.includes('Apartment') || formData.category?.includes('Flat')) catCode = 'F';
      else if (formData.category?.includes('Villa')) catCode = 'V';
      else if (formData.category?.includes('House')) catCode = 'H';
      else if (formData.category?.includes('Plot') || formData.category?.includes('Land')) catCode = 'P';
      else if (formData.category?.includes('Commercial')) catCode = 'C';
      
      const newId = `nexopp-${num}-${stateCode}-${typeCode}-${catCode}`;
      if (formData.id !== newId) {
        setFormData(prev => ({ ...prev, id: newId }));
      }
    }
  }, [formData.state, formData.propertyPurpose, formData.category, modalMode, propertiesDb.length]);


  // Location Hierarchy Manager State
  const [selectedHierarchyState, setSelectedHierarchyState] = useState<string>('Telangana');
  const [selectedHierarchyDistrict, setSelectedHierarchyDistrict] = useState<string>('Hyderabad');
  const [selectedHierarchyCity, setSelectedHierarchyCity] = useState<string>('Hyderabad');
  const [customAreaInput, setCustomAreaInput] = useState('');
  const [hierarchyAreas, setHierarchyAreas] = useState<string[]>(['Jubilee Hills', 'Banjara Hills', 'Gachibowli', 'HITEC City', 'Madhapur', 'Kondapur']);

  // Computed Filtered Properties
  const filteredProperties = useMemo(() => {
    return propertiesDb.filter(prop => {
      const matchesSearch = 
        prop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prop.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prop.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prop.city.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = selectedStatusFilter === 'All' || 
        prop.approvalStatus === selectedStatusFilter || 
        prop.listingStatus === selectedStatusFilter;
      
      const matchesCategory = selectedCategoryFilter === 'All' || prop.category === selectedCategoryFilter;
      const matchesCity = selectedCityFilter === 'All' || prop.city === selectedCityFilter;

      return matchesSearch && matchesStatus && matchesCategory && matchesCity;
    });
  }, [propertiesDb, searchQuery, selectedStatusFilter, selectedCategoryFilter, selectedCityFilter]);

  // Analytics KPIs
  const stats = useMemo(() => {
    const total = propertiesDb.length;
    const published = propertiesDb.filter(p => p.approvalStatus === 'Published' || p.listingStatus === 'Published').length;
    const pending = propertiesDb.filter(p => p.approvalStatus === 'Pending Approval').length;
    const sold = propertiesDb.filter(p => p.sold || p.approvalStatus === 'Sold' || p.listingStatus === 'Sold').length;
    const reserved = propertiesDb.filter(p => p.approvalStatus === 'Reserved' || p.listingStatus === 'Reserved').length;
    const featuredCount = propertiesDb.filter(p => p.featured || p.highlightPropertyCard).length;
    const totalValue = propertiesDb.reduce((acc, curr) => acc + (curr.price || 0), 0);
    const avgPrice = total > 0 ? (totalValue / total).toFixed(2) : '0.00';
    const sponsoredCount = propertiesDb.filter(p => p.premium || p.luxury).length;

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentlySold30Days = propertiesDb.filter(p => {
      const isSold = p.sold || p.approvalStatus === 'Sold' || p.listingStatus === 'Sold';
      if (!isSold) return false;
      if (!p.soldDate) return true;
      return new Date(p.soldDate) >= thirtyDaysAgo;
    }).length;

    return { 
      total, totalProperties: total, published, activeListings: published, 
      pending, pendingCount: pending, sold, totalSold: sold, 
      recentlySold30Days, reserved, featuredCount, sponsoredCount, 
      totalValue: totalValue.toFixed(2), avgPrice 
    };
  }, [propertiesDb]);

  const openAddModal = () => {
    setPriceUnit('Lakhs');
    setFormData({
      title: '',
      category: 'Villa',
      propertySubtype: 'Villas',
      propertyPurpose: 'Sale',
      status: 'Buy',
      price: 0,
      priceDisplay: '',
      areaSqFt: '',
      superBuiltUpArea: '',
      carpetArea: '',
      plotArea: '',
      bedrooms: undefined,
      bathrooms: undefined,
      balconies: undefined,
      floorNumber: undefined,
      totalFloors: undefined,
      facing: '',
      ageYears: undefined,
      furnishing: '',
      parkingSlots: undefined,
      ownershipType: '',
      negotiable: true,
      state: '',
      district: '',
      city: '',
      area: '',
      locality: '',
      landmark: '',
      pincode: '',
      postal_code: '',
      country: 'India',
      fullAddress: '',
      formatted_address: '',
      google_place_id: '',
      service_radius: 10,
      latitude: 0,
      longitude: 0,
      description: '',
      amenities: [],
      image: '',
      image2: '',
      image3: '',
      image4: '',
      image5: '',
      image6: '',
      images: [],
      dealerId: '',
      assignedBrokerIds: [],
      approvalStatus: 'Published',
      listingStatus: 'Published',
      featured: false,
      featuredDuration: '30 Days',
      homepagePriority: 5,
      highlightPropertyCard: false,
      sponsoredListing: false,
      prioritySearchPlacement: false,
      rating: 4.8,
      reviewCount: 5,
      verified: true,
      premium: true,
      seoTitle: '',
      metaDescription: '',
      urlSlug: ''
    });
    setAddressSearchQuery('');
    setMapMarkerPos({ lat: 17.4474, lng: 78.3762 });
    setModalMode('add');
    setEditingId(null);
    setModalSubTab('location');
    setIsModalOpen(true);
  };

  const openEditModal = (prop: PropertyListing) => {
    setFormData({
      ...prop,
      assignedBrokerIds: prop.assignedBrokerIds || [prop.dealerId]
    });
    setAddressSearchQuery(prop.formatted_address || prop.fullAddress || '');
    setMapMarkerPos({ lat: prop.latitude || 17.4326, lng: prop.longitude || 78.4071 });
    setModalMode('edit');
    setEditingId(prop.id);
    setModalSubTab('location');
    setIsModalOpen(true);
  };

  const openDuplicateModal = (prop: PropertyListing) => {
    const autoId = `PROP-${Math.floor(1000 + Math.random() * 9000)}`;
    setFormData({
      ...prop,
      id: autoId,
      title: `${prop.title} (Copy)`,
      approvalStatus: 'Draft',
      listingStatus: 'Draft'
    });
    setAddressSearchQuery(prop.formatted_address || prop.fullAddress || '');
    setMapMarkerPos({ lat: prop.latitude || 17.4326, lng: prop.longitude || 78.4071 });
    setModalMode('duplicate');
    setEditingId(null);
    setModalSubTab('location');
    setIsModalOpen(true);
  };

  const handleSaveDraft = (e: React.MouseEvent) => {
    e.preventDefault();
    const finalBrokerId = (formData.assignedBrokerIds && formData.assignedBrokerIds.length > 0)
      ? formData.assignedBrokerIds[0]
      : formData.dealerId || dealersDb[0]?.id || 'D1';
    const assignedBroker = dealersDb.find(d => d.id === finalBrokerId);

    const preparedProperty: PropertyListing = {
      ...formData as PropertyListing,
      id: formData.id || `P-${Date.now()}`,
      dealerId: finalBrokerId,
      assignedBrokerIds: formData.assignedBrokerIds || [finalBrokerId],
      agentName: assignedBroker?.companyName || assignedBroker?.fullName || formData.agentName || 'RealtyPlus Advisors',
      agentRating: assignedBroker?.rating || formData.agentRating || 4.8,
      agentImage: assignedBroker?.photo || assignedBroker?.logo || formData.agentImage || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
      createdDate: formData.createdDate || new Date().toISOString().split('T')[0],
      urlSlug: formData.urlSlug || formData.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || '',
      google_place_id: formData.google_place_id || `ChIJ_verified_${Date.now()}`,
      formatted_address: formData.formatted_address || formData.fullAddress || '',
      country: formData.country || 'India',
      service_radius: formData.service_radius || 10,
      approvalStatus: 'Draft',
      listingStatus: 'Draft'
    };

    if (modalMode === 'edit' && editingId) {
      updateProperty(editingId, preparedProperty);
      showNotification?.(`Property '${preparedProperty.title}' saved as Draft!`, "success");
    } else {
      addProperty(preparedProperty);
      showNotification?.(`Property '${preparedProperty.title}' saved as Draft!`, "success");
    }
    setIsModalOpen(false);
  };

  // Save Modal
  const handleSaveProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      showNotification?.("Please provide a valid property title in Step 2 (Basic Details).", "error");
      setModalSubTab('basic');
      return;
    }

    const assignedIds = (formData.assignedBrokerIds && formData.assignedBrokerIds.length > 0)
      ? formData.assignedBrokerIds
      : [formData.dealerId || dealersDb[0]?.id || 'd1'];

    const finalBrokerId = assignedIds[0];
    const assignedBroker = dealersDb.find(d => d.id === finalBrokerId);

    const fallbackLat = formData.latitude || 17.4474;
    const fallbackLng = formData.longitude || 78.3762;
    const fallbackAddress = formData.formatted_address || formData.fullAddress || `${formData.area || 'Jubilee Hills'}, ${formData.city || 'Hyderabad'}, Telangana, India`;

    const preparedProperty: PropertyListing = {
      ...formData as PropertyListing,
      id: formData.id || `P-${Date.now()}`,
      latitude: fallbackLat,
      longitude: fallbackLng,
      formatted_address: fallbackAddress,
      fullAddress: fallbackAddress,
      dealerId: finalBrokerId,
      assignedBrokerIds: assignedIds,
      agentName: assignedBroker?.companyName || assignedBroker?.fullName || formData.agentName || 'RealtyPlus Advisors',
      agentRating: assignedBroker?.rating || formData.agentRating || 4.8,
      agentImage: assignedBroker?.photo || assignedBroker?.logo || formData.agentImage || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
      createdDate: formData.createdDate || new Date().toISOString().split('T')[0],
      urlSlug: formData.urlSlug || formData.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || '',
      google_place_id: formData.google_place_id || `ChIJ_verified_${Date.now()}`,
      country: formData.country || 'India',
      service_radius: formData.service_radius || 10,
      sold: formData.sold || formData.approvalStatus === 'Sold' || formData.listingStatus === 'Sold' || false,
      soldDate: (formData.sold || formData.approvalStatus === 'Sold') ? (formData.soldDate || new Date().toISOString().slice(0, 10)) : undefined
    };

    if (preparedProperty.sold) {
      preparedProperty.listingStatus = 'Sold';
      preparedProperty.approvalStatus = 'Sold';
    }

    if (modalMode === 'edit' && editingId) {
      updateProperty(editingId, preparedProperty);
      showNotification?.(`Property '${preparedProperty.title}' updated successfully!`, "success");
    } else {
      addProperty(preparedProperty);
      showNotification?.(`Property '${preparedProperty.title}' created and published successfully!`, "success");
    }
    setIsModalOpen(false);
  };

  // Bulk Status Change
  const handleBulkStatusChange = (newStatus: PropertyListing['approvalStatus']) => {
    if (selectedIds.length === 0) return;
    selectedIds.forEach(id => {
      updateProperty(id, { approvalStatus: newStatus, listingStatus: newStatus as any });
    });
    showNotification?.(`Updated status to '${newStatus}' for ${selectedIds.length} properties.`, "success");
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Are you sure you want to permanently delete ${selectedIds.length} properties?`)) {
      selectedIds.forEach(id => deleteProperty(id));
      showNotification?.(`Deleted ${selectedIds.length} properties.`, "warning");
      setSelectedIds([]);
    }
  };


  // Export CSV
  const exportToCSV = () => {
    const headers = ["ID", "Title", "Category", "Subtype", "Purpose", "Price", "City", "Area", "Assigned Broker ID", "Status"];
    const rows = filteredProperties.map(p => [
      p.id,
      `"${p.title.replace(/"/g, '""')}"`,
      p.category,
      p.propertySubtype || '-',
      p.propertyPurpose || '-',
      p.priceDisplay,
      p.city,
      p.area,
      p.dealerId,
      p.approvalStatus || p.listingStatus
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `nexopp_property_portfolio_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification?.("Exported Property Portfolio dataset to CSV.", "success");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: "'Inter', 'Plus Jakarta Sans', -apple-system, sans-serif" }}>
      
      {/* Top Action Bar matching user screenshot */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button
          onClick={exportToCSV}
          style={{ padding: '10px 18px', backgroundColor: '#FFFFFF', color: '#059669', border: '1px solid #E2E8F0', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem' }}
        >
          <FaFileExport /> Export CSV
        </button>
        {activeModuleTab === 'listings' && (
          <button
            onClick={openAddModal}
            style={{ padding: '10px 22px', backgroundColor: '#059669', color: '#FFFFFF', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', boxShadow: '0 2px 6px rgba(5,150,105,0.2)' }}
          >
            <FaPlus /> + Add New Property
          </button>
        )}
      </div>

      {/* 8-Card KPI Summary Strip with Sold Statistics */}
      {activeModuleTab === 'listings' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '14px' }}>
          
          {/* Total Properties */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', marginBottom: '10px' }}>
              <FaBuilding style={{ fontSize: '1.1rem' }} />
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>Total Properties</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', margin: '2px 0 4px 0' }}>{stats.totalProperties}</div>
            <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 500 }}>Database count</div>
          </div>

          {/* Active Listings */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', marginBottom: '10px' }}>
              <FaCheckCircle style={{ fontSize: '1.1rem' }} />
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>Active Listings</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', margin: '2px 0 4px 0' }}>{stats.activeListings}</div>
            <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600 }}>Live on marketplace</div>
          </div>

          {/* Total Sold Properties */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '16px', border: '1px solid #FEF2F2', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#FEE2E2', border: '1px solid #FECACA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626', marginBottom: '10px' }}>
              <FaCheckCircle style={{ fontSize: '1.1rem' }} />
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#DC2626' }}>Total Reserved Properties</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#991B1B', margin: '2px 0 4px 0' }}>{stats.totalSold}</div>
            <div style={{ fontSize: '0.7rem', color: '#DC2626', fontWeight: 600 }}>Marked as Reserved</div>
          </div>

          {/* Recently Sold (30 Days) */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', marginBottom: '10px' }}>
              <FaChartBar style={{ fontSize: '1.1rem' }} />
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669' }}>Recently Reserved (30 Days)</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#059669', margin: '2px 0 4px 0' }}>{stats.recentlySold30Days}</div>
            <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600 }}>Last 30 days</div>
          </div>

          {/* Pending Approval */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', marginBottom: '10px' }}>
              <FaChartBar style={{ fontSize: '1.1rem' }} />
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>Pending Approval</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', margin: '2px 0 4px 0' }}>{stats.pendingCount}</div>
            <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 500 }}>Needs review</div>
          </div>

          {/* Featured */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', marginBottom: '10px' }}>
              <FaCrown style={{ fontSize: '1.1rem' }} />
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>Featured</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', margin: '2px 0 4px 0' }}>{stats.featuredCount}</div>
            <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 500 }}>Homepage priority</div>
          </div>

          {/* Premium */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', marginBottom: '10px' }}>
              <FaCrown style={{ fontSize: '1.1rem' }} />
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>Premium</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', margin: '2px 0 4px 0' }}>{stats.sponsoredCount}</div>
            <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600 }}>Premium badge active</div>
          </div>

          {/* Total Value */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', marginBottom: '10px' }}>
              <FaChartBar style={{ fontSize: '1.1rem' }} />
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>Total Value</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', margin: '2px 0 4px 0' }}>₹{stats.totalValue} Cr</div>
            <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600 }}>Total portfolio value</div>
          </div>

        </div>
      )}

      {/* ================= MODULE 1: LISTINGS & APPROVAL PIPELINE ================= */}
      {(activeModuleTab === 'listings' || activeModuleTab === 'editProperty') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Search & Filter Card matching screenshot exactly */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Row 1: Search & Filter buttons */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ flexGrow: 1, position: 'relative' }}>
                <FaSearch style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="text"
                  placeholder="Search by Property ID, Title, Location, or Broker..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '11px 16px 11px 44px', border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '0.88rem', outline: 'none', color: '#0F172A' }}
                />
              </div>

              <button style={{ padding: '11px 18px', border: '1px solid #E2E8F0', borderRadius: '10px', backgroundColor: '#FFFFFF', color: '#475569', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Filters <span>v</span>
              </button>

              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStatusFilter('All');
                  setSelectedCategoryFilter('All');
                  setSelectedCityFilter('All');
                }}
                style={{ padding: '11px 16px', border: 'none', background: 'none', color: '#EF4444', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                ↻ Clear All
              </button>
            </div>

            {/* Row 2: Dropdown filters */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <select
                value={selectedCategoryFilter}
                onChange={e => setSelectedCategoryFilter(e.target.value)}
                style={{ padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: '8px', fontWeight: 500, color: '#475569', fontSize: '0.85rem', backgroundColor: '#FFFFFF', outline: 'none' }}
              >
                <option value="All">All Categories</option>
                <option value="Villa">Villas</option>
                <option value="Apartment">Apartments</option>
                <option value="House">Individual Houses</option>
                <option value="Plot">Plots & Land</option>
                <option value="Commercial">Commercial</option>
              </select>

              <input
                type="text"
                value={selectedCityFilter === 'All' ? '' : selectedCityFilter}
                onChange={e => setSelectedCityFilter(e.target.value || 'All')}
                placeholder="Filter by City / Area..."
                style={{ padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: '8px', fontWeight: 500, color: '#475569', fontSize: '0.85rem', backgroundColor: '#FFFFFF', outline: 'none', width: '180px' }}
              />

              <select style={{ padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: '8px', fontWeight: 500, color: '#475569', fontSize: '0.85rem', backgroundColor: '#FFFFFF', outline: 'none' }}>
                <option>All Brokers</option>
              </select>

              <select
                value={selectedStatusFilter}
                onChange={e => setSelectedStatusFilter(e.target.value)}
                style={{ padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: '8px', fontWeight: 500, color: '#475569', fontSize: '0.85rem', backgroundColor: '#FFFFFF', outline: 'none' }}
              >
                <option value="All">All Status</option>
                <option value="Published">Published</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Draft">Draft</option>
                <option value="Sold">Sold</option>
              </select>

              <select style={{ padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: '8px', fontWeight: 500, color: '#475569', fontSize: '0.85rem', backgroundColor: '#FFFFFF', outline: 'none' }}>
                <option>Price Range</option>
              </select>

              <select style={{ padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: '8px', fontWeight: 500, color: '#475569', fontSize: '0.85rem', backgroundColor: '#FFFFFF', outline: 'none' }}>
                <option>More Filters</option>
              </select>
            </div>

          </div>

          {/* Bulk Actions Bar if any items selected */}
          {selectedIds.length > 0 && (
            <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #F59E0B', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, color: '#92400E', fontSize: '0.88rem' }}>
                ✓ {selectedIds.length} property items selected
              </span>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => handleBulkStatusChange('Published')} style={{ padding: '6px 14px', backgroundColor: '#059669', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>Publish Selected</button>
                <button onClick={() => handleBulkStatusChange('Approved')} style={{ padding: '6px 14px', backgroundColor: '#059669', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>Approve Selected</button>
                <button onClick={() => handleBulkStatusChange('Sold')} style={{ padding: '6px 14px', backgroundColor: '#059669', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>Mark as Reserved</button>
                <button onClick={() => handleBulkStatusChange('Archived')} style={{ padding: '6px 14px', backgroundColor: '#64748B', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>Archive Selected</button>
                <button onClick={handleBulkDelete} style={{ padding: '6px 14px', backgroundColor: '#DC2626', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>Delete Selected</button>
              </div>
            </div>
          )}

          {/* Table / List Grid matching screenshot exactly */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '16px', width: '40px' }}>
                    <input
                      type="checkbox"
                      checked={filteredProperties.length > 0 && selectedIds.length === filteredProperties.length}
                      onChange={e => {
                        if (e.target.checked) setSelectedIds(filteredProperties.map(p => p.id));
                        else setSelectedIds([]);
                      }}
                      style={{ borderRadius: '4px', cursor: 'pointer' }}
                    />
                  </th>
                  <th style={{ padding: '16px', fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Property Details</th>
                  <th style={{ padding: '16px', fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Category & Type ↕</th>
                  <th style={{ padding: '16px', fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Location</th>
                  <th style={{ padding: '16px', fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Assigned Broker</th>
                  <th style={{ padding: '16px', fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Price ↕</th>
                  <th style={{ padding: '16px', fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Status ↕</th>
                  <th style={{ padding: '16px', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProperties.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>
                      <p style={{ fontSize: '1.05rem', fontWeight: 600, margin: '0 0 12px 0' }}>No property listings matched your filters.</p>
                      {activeModuleTab === 'listings' && (
                        <button onClick={openAddModal} style={{ padding: '10px 20px', backgroundColor: '#059669', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 6px rgba(5,150,105,0.2)' }}>+ Add New Property</button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredProperties.map(prop => {
                    const assignedBroker = dealersDb.find(d => d.id === prop.dealerId);
                    const isSelected = selectedIds.includes(prop.id);
                    return (
                      <tr key={prop.id} style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: isSelected ? '#FEF9C3' : '#FFFFFF', transition: 'background 0.15s' }}>
                        <td style={{ padding: '16px' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={e => {
                              if (e.target.checked) setSelectedIds([...selectedIds, prop.id]);
                              else setSelectedIds(selectedIds.filter(id => id !== prop.id));
                            }}
                            style={{ borderRadius: '4px', cursor: 'pointer' }}
                          />
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                            <img src={prop.image || prop.images?.[0]} alt={prop.title} style={{ width: '64px', height: '52px', objectFit: 'cover', borderRadius: '8px' }} />
                            <div>
                              <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.9rem', marginBottom: '3px' }}>{prop.title}</div>
                              <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 500, marginBottom: '4px' }}>{prop.id}</div>
                              <span style={{ padding: '2px 6px', backgroundColor: '#ECFDF5', color: '#059669', fontSize: '0.7rem', fontWeight: 600, borderRadius: '4px' }}>
                                {prop.category}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.85rem' }}>{prop.category}</div>
                          <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>{prop.bedrooms ? `${prop.bedrooms} BHK ${prop.category}` : prop.propertySubtype || prop.category}</div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#0F172A', fontSize: '0.85rem' }}>
                            <FaMapMarkerAlt style={{ color: '#64748B', fontSize: '0.78rem' }} /> {prop.area}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px', paddingLeft: '18px' }}>{prop.city}, {prop.state}</div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          {assignedBroker ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', fontWeight: 700, fontSize: '0.78rem' }}>
                                {assignedBroker.companyName?.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.85rem' }}>{assignedBroker.companyName}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                  <span style={{ fontSize: '0.72rem', color: '#F59E0B', fontWeight: 600 }}>⭐ {assignedBroker.rating} (124)</span>
                                  {assignedBroker.premiumPartner && (
                                    <span style={{ padding: '1px 6px', backgroundColor: '#ECFDF5', color: '#059669', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700 }}>Premium</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: '#94A3B8', fontSize: '0.82rem' }}>Independent / Unassigned</span>
                          )}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.9rem' }}>{prop.priceDisplay}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>{prop.negotiable ? 'Negotiable' : 'Non-Negotiable'}</div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            display: 'inline-block',
                            backgroundColor: 
                              (prop.approvalStatus === 'Sold' || prop.listingStatus === 'Sold') ? '#FEE2E2' : '#ECFDF5',
                            color:
                              (prop.approvalStatus === 'Sold' || prop.listingStatus === 'Sold') ? '#EF4444' : '#059669'
                          }}>
                            {prop.approvalStatus || prop.listingStatus || 'Published'}
                          </span>
                          <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '4px' }}>Recently updated</div>
                        </td>
                        <td style={{ padding: '16px', textAlign: 'right' }}>
                          {activeModuleTab === 'editProperty' ? (
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                              <button
                                onClick={() => openEditModal(prop)}
                                title="Edit Property"
                                style={{ padding: '8px 14px', backgroundColor: '#F8FAFC', color: '#475569', border: '1px solid #E2E8F0', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                              >
                                <FaEdit /> Edit
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>View Only</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Dynamic Pagination Footer */}
            {filteredProperties.length > 0 && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
                <div style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 500 }}>
                  Showing {Math.min(1, filteredProperties.length)} to {filteredProperties.length} of {propertiesDb.length} properties
                </div>
                {Math.ceil(filteredProperties.length / 10) > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {Array.from({ length: Math.ceil(filteredProperties.length / 10) }, (_, i) => (
                      <button key={i} style={{ width: '32px', height: '32px', borderRadius: '8px', border: i === 0 ? 'none' : '1px solid #E2E8F0', backgroundColor: i === 0 ? '#ECFDF5' : 'transparent', color: i === 0 ? '#059669' : '#64748B', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>{i + 1}</button>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#64748B' }}>
                  Rows per page:
                  <select style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', fontSize: '0.82rem', fontWeight: 600, color: '#0F172A', outline: 'none' }}>
                    <option>10</option>
                    <option>25</option>
                    <option>50</option>
                  </select>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ================= MODULE 2: FEATURED & PREMIUM CONTROL HUB ================= */}
      {activeModuleTab === 'featured' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #F59E0B', padding: '20px', borderRadius: '4px' }}>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", margin: '0 0 8px 0', color: '#92400E', fontSize: '1.25rem' }}>
              Featured & Premium Spotlighting Hub
            </h3>
            <p style={{ margin: 0, color: '#78350F', fontSize: '0.9rem' }}>
              Mark listings as **Featured** or **Sponsored** to place them in top homepage carousels and highlight cards with gold badges.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
            {propertiesDb.map(prop => (
              <div key={prop.id} style={{ backgroundColor: '#FFFFFF', border: (prop.featured || prop.highlightPropertyCard) ? '2px solid #F59E0B' : '1px solid #E2E8F0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
                {(prop.featured || prop.highlightPropertyCard) && (
                  <span style={{ position: 'absolute', top: '-12px', right: '16px', backgroundColor: '#F59E0B', color: '#0F172A', fontSize: '0.7rem', fontWeight: 800, padding: '3px 10px', borderRadius: '12px' }}>
                    ACTIVE SPOTLIGHT
                  </span>
                )}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <img src={prop.image || prop.images?.[0]} alt={prop.title} style={{ width: '100px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669' }}>{prop.id} • {prop.area}</div>
                    <h4 style={{ margin: '2px 0', fontSize: '1rem', color: '#0F172A' }}>{prop.title}</h4>
                    <div style={{ fontWeight: 800, color: '#059669', fontSize: '0.9rem' }}>{prop.priceDisplay}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '4px' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '4px' }}>FEATURED DURATION</label>
                    <select
                      value={prop.featuredDuration || '30 Days'}
                      onChange={e => updateProperty(prop.id, { featuredDuration: e.target.value })}
                      style={{ width: '100%', padding: '6px', fontSize: '0.8rem', border: '1px solid #CBD5E1' }}
                    >
                      <option value="7 Days">7 Days</option>
                      <option value="15 Days">15 Days</option>
                      <option value="30 Days">30 Days</option>
                      <option value="Permanent">Permanent</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '4px' }}>HOMEPAGE PRIORITY</label>
                    <input
                      type="number"
                      value={prop.homepagePriority || 5}
                      onChange={e => updateProperty(prop.id, { homepagePriority: parseInt(e.target.value) || 5 })}
                      style={{ width: '100%', padding: '6px', fontSize: '0.8rem', border: '1px solid #CBD5E1' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                  <button
                    onClick={() => {
                      const nextVal = !prop.featured;
                      updateProperty(prop.id, { featured: nextVal, highlightPropertyCard: nextVal, sponsoredListing: nextVal, prioritySearchPlacement: nextVal });
                      showNotification?.(`Property spotlight ${nextVal ? 'activated' : 'removed'} for ${prop.title}.`, "success");
                    }}
                    style={{ flexGrow: 1, padding: '10px', backgroundColor: prop.featured ? '#FEF2F2' : '#F59E0B', color: prop.featured ? '#DC2626' : '#0F172A', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    {prop.featured ? 'REMOVE SPOTLIGHT' : 'ENABLE FEATURED STATUS'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= MODULE 3: PROPERTY ANALYTICS DASHBOARD ================= */}
      {activeModuleTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ backgroundColor: '#FFFFFF', padding: '24px', border: '1px solid #E2E8F0' }}>
              <h4 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", margin: '0 0 16px 0', fontSize: '1.1rem' }}>Category Distribution</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(() => {
                  const categoryCounts = propertiesDb.reduce((acc, p) => {
                    const cat = p.category || 'Unknown';
                    acc[cat] = (acc[cat] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>);
                  
                  const topCategories = Object.entries(categoryCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5);
                    
                  if (topCategories.length === 0) {
                    return <div style={{ color: '#64748B', fontSize: '0.85rem' }}>No listings available to determine category distribution.</div>;
                  }

                  return topCategories.map(([cat, count]) => {
                    const pct = propertiesDb.length > 0 ? Math.round((count / propertiesDb.length) * 100) : 0;
                    return (
                      <div key={cat}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                          <span>{cat}</span>
                          <span>{count} Listings ({pct}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', backgroundColor: '#059669' }} />
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', padding: '24px', border: '1px solid #E2E8F0' }}>
              <h4 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", margin: '0 0 16px 0', fontSize: '1.1rem' }}>Top Selling Cities</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(() => {
                  const cityCounts = propertiesDb.reduce((acc, p) => {
                    const city = p.city || 'Unknown';
                    acc[city] = (acc[city] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>);
                  
                  const topCities = Object.entries(cityCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5);
                    
                  if (topCities.length === 0) {
                    return <div style={{ color: '#64748B', fontSize: '0.85rem' }}>No listings available to determine top cities.</div>;
                  }

                  return topCities.map(([city, count]) => {
                    const pct = propertiesDb.length > 0 ? Math.round((count / propertiesDb.length) * 100) : 0;
                    return (
                      <div key={city}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                          <span>{city}</span>
                          <span>{count} Listings</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', backgroundColor: '#059669' }} />
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODULE 4: CATEGORY MASTER ================= */}
      {activeModuleTab === 'categories' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '24px', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", margin: '0 0 16px 0', fontSize: '1.3rem' }}>
              Property Category Master & Subtypes
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              {Object.entries(CATEGORY_SUBTYPES).map(([catName, sublist]) => (
                <div key={catName} style={{ backgroundColor: '#F8FAFC', padding: '20px', border: '1px solid #CBD5E1' }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#059669', fontSize: '1.1rem' }}>{catName}</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {sublist.map(sub => (
                      <li key={sub} style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 600 }}>{sub}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODULE 5: LOCATION MASTER HIERARCHY ================= */}
      {activeModuleTab === 'locations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '24px', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", margin: '0 0 16px 0', fontSize: '1.3rem' }}>
              Location Hierarchy Master (State → District → City → Area)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>1. STATE / REGION</label>
                <input
                  type="text"
                  value={selectedHierarchyState}
                  onChange={e => setSelectedHierarchyState(e.target.value)}
                  placeholder="e.g. Andhra Pradesh, Telangana..."
                  style={{ width: '100%', padding: '12px', border: '1px solid #CBD5E1', fontWeight: 700, borderRadius: '8px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>2. DISTRICT / REGION</label>
                <input
                  type="text"
                  value={selectedHierarchyDistrict}
                  onChange={e => setSelectedHierarchyDistrict(e.target.value)}
                  placeholder="e.g. Guntur, Hyderabad District..."
                  style={{ width: '100%', padding: '12px', border: '1px solid #CBD5E1', fontWeight: 700, borderRadius: '8px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>3. CITY</label>
                <input
                  type="text"
                  value={selectedHierarchyCity}
                  onChange={e => setSelectedHierarchyCity(e.target.value)}
                  placeholder="e.g. Guntur, Vijayawada, Hyderabad..."
                  style={{ width: '100%', padding: '12px', border: '1px solid #CBD5E1', fontWeight: 700, borderRadius: '8px' }}
                />
              </div>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '20px', border: '1px solid #CBD5E1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontWeight: 800, color: '#0F172A' }}>Registered Areas in {selectedHierarchyCity}:</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Add new locality / area..."
                    value={customAreaInput}
                    onChange={e => setCustomAreaInput(e.target.value)}
                    style={{ padding: '8px 12px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                  <button
                    onClick={() => {
                      if (customAreaInput.trim()) {
                        setHierarchyAreas([...hierarchyAreas, customAreaInput.trim()]);
                        setCustomAreaInput('');
                        showNotification?.("Added new locality to master.", "success");
                      }
                    }}
                    style={{ padding: '8px 16px', backgroundColor: '#059669', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    + Add Area
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {hierarchyAreas.map(area => (
                  <span key={area} style={{ padding: '8px 16px', backgroundColor: '#ECFDF5', border: '1px solid #BFDBFE', color: '#059669', fontWeight: 700, fontSize: '0.88rem', borderRadius: '16px' }}>
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODULE: SOLD OUT PROPERTIES ================= */}
      {activeModuleTab === 'soldOut' && (
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", margin: '0 0 8px 0', fontSize: '1.4rem', color: '#0F172A', fontWeight: 800 }}>Reserved Properties</h2>
              <p style={{ color: '#64748B', margin: 0, fontSize: '0.9rem' }}>Manage properties that have been marked as sold out and push them to the main page.</p>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '12px 16px' }}>Property Details</th>
                  <th style={{ padding: '12px 16px' }}>Price & Area</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {propertiesDb.filter(p => p.approvalStatus === 'Sold' || p.listingStatus === 'Sold').map(prop => (
                  <tr key={prop.id} style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '60px', height: '45px', backgroundColor: '#E2E8F0', overflow: 'hidden' }}>
                          <img src={prop.image || 'https://via.placeholder.com/60x45'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>{prop.title}</div>
                          <div style={{ color: '#64748B', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                            <FaMapMarkerAlt style={{ color: '#CBD5E1' }} /> {prop.area}, {prop.city}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 700, color: '#0F172A' }}>{prop.priceDisplay}</div>
                      <div style={{ color: '#64748B', fontSize: '0.85rem' }}>{prop.areaSqFt}</div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ padding: '4px 8px', backgroundColor: '#FEE2E2', color: '#EF4444', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                        Reserved
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          updateProperty(prop.id, { showSoldOnHomepage: !prop.showSoldOnHomepage });
                          showNotification && showNotification(
                            prop.showSoldOnHomepage 
                              ? 'Removed from Main Page' 
                              : 'Pushed to Main Page',
                            'success'
                          );
                        }}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: prop.showSoldOnHomepage ? '#F1F5F9' : '#059669',
                          color: prop.showSoldOnHomepage ? '#475569' : '#FFFFFF',
                          border: prop.showSoldOnHomepage ? '1px solid #CBD5E1' : 'none',
                          borderRadius: '6px',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        {prop.showSoldOnHomepage ? 'Remove from Main Page' : 'Push to Main Page'}
                      </button>
                    </td>
                  </tr>
                ))}
                {propertiesDb.filter(p => p.approvalStatus === 'Sold' || p.listingStatus === 'Sold').length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>
                      No sold out properties found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODULE 6: REPORTS & EXPORTS ================= */}
      {activeModuleTab === 'reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '30px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
            <FaFileExport style={{ fontSize: '3rem', color: '#059669', marginBottom: '12px' }} />
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", margin: '0 0 8px 0' }}>Export Complete Property Reports</h3>
            <p style={{ color: '#64748B', maxWidth: '600px', margin: '0 auto 20px auto' }}>Download real-time datasets including broker allocations, sales conversions, and specifications in formatted Excel or CSV files.</p>
            <button onClick={exportToCSV} style={{ padding: '14px 32px', backgroundColor: '#059669', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>
              DOWNLOAD MASTER EXCEL / CSV
            </button>
          </div>
        </div>
      )}

      {/* ================= ULTRA-MODERN STEP-BY-STEP PROPERTY MODAL (MATCHING SCREENSHOT) ================= */}
      {isModalOpen && (
        <div data-lenis-prevent="true" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.82)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '24px' }}>
          <div style={{ backgroundColor: '#F8FAFC', width: '100%', maxWidth: '1280px', maxHeight: '92vh', display: 'flex', flexDirection: 'column', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)', border: '1px solid #E2E8F0' }}>
            
            {/* Modal Header */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '24px 32px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#ECFDF5', border: '1px solid #ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', color: '#059669', flexShrink: 0 }}>
                  <FaBuilding />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h3 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                      {modalMode === 'add' ? 'Add New Property' : modalMode === 'edit' ? 'Edit Property' : 'Duplicate Property'}
                    </h3>
                    <span style={{ backgroundColor: '#F1F5F9', color: '#475569', padding: '4px 14px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.5px' }}>
                      {formData.id || 'P-NEW'}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: '#F1F5F9', border: 'none', color: '#64748B', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', cursor: 'pointer', transition: 'all 0.2s' }} title="Close">×</button>
            </div>

            {/* Horizontal Stepper Bar */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '20px 36px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, overflowX: 'auto' }}>
              {[
                { id: 'location', num: 1, label: 'Location', sub: 'Set property location' },
                { id: 'basic', num: 2, label: 'Basic Details', sub: 'Add property info' },
                { id: 'specs', num: 3, label: 'Specifications', sub: 'Property features' },
                { id: 'pricing', num: 4, label: 'Pricing', sub: 'Price & availability' },
                { id: 'media', num: 5, label: 'Media', sub: 'Photos & videos' },
                { id: 'review', num: 6, label: 'Assign Broker', sub: 'Assign broker CRM' }
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

            {/* Modal Body Container */}
            <form onSubmit={handleSaveProperty} style={{ padding: '28px 36px', overflowY: 'auto', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              
              {/* STEP 1: LOCATION (EXACT SCREENSHOT MATCH) */}
              {modalSubTab === 'location' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 1fr)', gap: '24px', alignItems: 'stretch' }}>
                    
                    {/* Left Column: Property Location */}
                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '28px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669', margin: 0 }}>1. Property Location</h4>
                        <p style={{ color: '#64748B', fontSize: '0.88rem', margin: '4px 0 20px 0' }}>Search and select the exact location of your property</p>

                        {/* Search Bar Row */}
                        <div style={{ position: 'relative' }}>
                          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '8px' }}>Search Property Address</label>
                          <div style={{ display: 'flex', gap: '12px' }}>
                            <div style={{ flexGrow: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                              <FaMapMarkerAlt style={{ position: 'absolute', left: '16px', color: '#059669', fontSize: '1.1rem' }} />
                              <input
                                type="text"
                                value={addressSearchQuery || formData.formatted_address || formData.fullAddress || ''}
                                onChange={e => {
                                  setAddressSearchQuery(e.target.value);
                                  setShowLocationSuggestions(true);
                                }}
                                onFocus={() => setShowLocationSuggestions(true)}
                                placeholder="Plot 45, HITEC City Phase 2, Hyderabad, Telangana 500081, India"
                                style={{ width: '100%', padding: '12px 40px 12px 44px', border: '1.5px solid #059669', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 600, color: '#0F172A', outline: 'none', boxShadow: '0 2px 8px rgba(37, 99, 235, 0.08)', boxSizing: 'border-box' }}
                              />
                              {(addressSearchQuery || formData.formatted_address) && (
                                <button type="button" onClick={() => { setAddressSearchQuery(''); setFormData({ ...formData, formatted_address: '', fullAddress: '' }); }} style={{ position: 'absolute', right: '14px', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '1.1rem', padding: '2px' }}>×</button>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={handleAdminDetectGPS}
                              disabled={isAdminDetectingGPS}
                              style={{ padding: '12px 22px', backgroundColor: '#059669', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)', transition: 'background 0.2s' }}
                            >
                              <FaCrosshairs /> {isAdminDetectingGPS ? 'Detecting...' : 'Detect My Location'}
                            </button>
                          </div>

                          {/* Autocomplete Suggestions Dropdown - OLX Style */}
                          {showLocationSuggestions && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '16px', boxShadow: '0 12px 32px rgba(15, 23, 42, 0.18)', marginTop: '8px', maxHeight: '340px', overflowY: 'auto' }}>
                              
                              {/* Current Location (GPS) Header Button */}
                              <div
                                onClick={handleAdminDetectGPS}
                                style={{ padding: '14px 18px', borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', transition: 'background 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#ECFDF5'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                              >
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', flexShrink: 0 }}>
                                  <FaCrosshairs style={{ fontSize: '1rem' }} />
                                </div>
                                <div>
                                  <div style={{ fontWeight: 800, color: '#059669', fontSize: '0.9rem' }}>Use Current Location (GPS)</div>
                                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Detect exact current location & lat/lng automatically</div>
                                </div>
                              </div>

                              {/* Popular Cities Chips (When no search query) */}
                              {(!addressSearchQuery || addressSearchQuery.trim().length < 2) && (
                                <div style={{ padding: '14px 18px', borderBottom: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
                                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Popular Cities & Hubs</div>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {['Hyderabad', 'Guntur', 'Vijayawada', 'Visakhapatnam', 'Amaravati', 'Bangalore', 'Chennai'].map(cName => {
                                      const foundPlace = COMPREHENSIVE_INDIA_PLACES_DB.find(p => p.city.toLowerCase().includes(cName.toLowerCase()) || p.area.toLowerCase().includes(cName.toLowerCase()));
                                      return (
                                        <button
                                          key={cName}
                                          type="button"
                                          onClick={() => {
                                            if (foundPlace) handleSelectGooglePlace(foundPlace);
                                            else {
                                              setAddressSearchQuery(cName);
                                            }
                                          }}
                                          style={{ padding: '6px 14px', backgroundColor: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 700, color: '#334155', cursor: 'pointer', transition: 'all 0.2s' }}
                                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#059669'; e.currentTarget.style.color = '#FFFFFF'; }}
                                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#F1F5F9'; e.currentTarget.style.color = '#334155'; }}
                                        >
                                          📍 {cName}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {isSearchingLive && (
                                <div style={{ padding: '12px 18px', color: '#059669', fontWeight: 700, fontSize: '0.85rem', backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <FaSearch style={{ animation: 'spin 1s linear infinite' }} />
                                  <span>Searching live location database & Nominatim...</span>
                                </div>
                              )}

                              {/* Location Suggestion Cards */}
                              {liveSuggestions.map((place, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => handleSelectGooglePlace(place)}
                                  style={{ padding: '14px 18px', borderBottom: '1px solid #E2E8F0', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', transition: 'background 0.2s' }}
                                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                                >
                                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flexGrow: 1 }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', flexShrink: 0, marginTop: '2px' }}>
                                      <FaMapMarkerAlt style={{ fontSize: '0.95rem' }} />
                                    </div>
                                    <div>
                                      <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.92rem' }}>{place.area || place.city}</div>
                                      <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>{place.formatted_address || `${place.city}, ${place.state}`}</div>
                                    </div>
                                  </div>

                                  {/* Exact Lat/Lng Badge */}
                                  <div style={{ flexShrink: 0, textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#059669', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', padding: '3px 8px', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                                      📍 {place.latitude?.toFixed(6)}, {place.longitude?.toFixed(6)}
                                    </div>
                                    <div style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: '3px', fontWeight: 600 }}>Exact GPS</div>
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
                                  style={{ padding: '14px 18px', backgroundColor: '#ECFDF5', borderTop: '1px solid #BFDBFE', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', fontWeight: 700, color: '#059669', fontSize: '0.85rem' }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <FaMapMarkerAlt style={{ color: '#059669' }} />
                                    <span>Use "{addressSearchQuery}" (Auto-Geocode Engine)</span>
                                  </div>
                                  <span style={{ fontSize: '0.75rem', backgroundColor: '#ECFDF5', color: '#059669', padding: '2px 8px', borderRadius: '4px' }}>Live Geocode</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Success/Warning Banner */}
                        {formData.latitude && formData.latitude !== 0 ? (
                          <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '14px 18px', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '10px', color: '#059669', fontWeight: 700, fontSize: '0.88rem' }}>
                            <FaCheckCircle style={{ fontSize: '1.1rem', flexShrink: 0 }} />
                            <span>Location verified successfully from Google Maps</span>
                          </div>
                        ) : (
                          <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FEF3C7', borderRadius: '12px', padding: '14px 18px', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '10px', color: '#B45309', fontWeight: 700, fontSize: '0.88rem' }}>
                            <FaMapMarkerAlt style={{ fontSize: '1.1rem', flexShrink: 0 }} />
                            <span>Please search for a location or drag the marker on the map</span>
                          </div>
                        )}

                        {/* Location Details (Auto-Geocoded) */}
                        <h5 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#059669', margin: '24px 0 14px 0' }}>Location Details (Auto-Geocoded)</h5>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <FaGlobe style={{ fontSize: '1.1rem', color: '#64748B', marginTop: '2px', flexShrink: 0 }} />
                            <div>
                              <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>Country</div>
                              <div style={{ fontSize: '0.92rem', color: '#0F172A', fontWeight: 800, marginTop: '2px' }}>{formData.country || '-'}</div>
                            </div>
                          </div>
                          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <FaMap style={{ fontSize: '1.1rem', color: '#64748B', marginTop: '2px', flexShrink: 0 }} />
                            <div>
                              <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>State</div>
                              <div style={{ fontSize: '0.92rem', color: '#0F172A', fontWeight: 800, marginTop: '2px' }}>{formData.state || '-'}</div>
                            </div>
                          </div>
                          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <FaMapMarkerAlt style={{ fontSize: '1.1rem', color: '#64748B', marginTop: '2px', flexShrink: 0 }} />
                            <div>
                              <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>District</div>
                              <div style={{ fontSize: '0.92rem', color: '#0F172A', fontWeight: 800, marginTop: '2px' }}>{formData.district || '-'}</div>
                            </div>
                          </div>
                          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <FaCity style={{ fontSize: '1.1rem', color: '#64748B', marginTop: '2px', flexShrink: 0 }} />
                            <div>
                              <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>City</div>
                              <div style={{ fontSize: '0.92rem', color: '#0F172A', fontWeight: 800, marginTop: '2px' }}>{formData.city || '-'}</div>
                            </div>
                          </div>
                          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <FaCompass style={{ fontSize: '1.1rem', color: '#64748B', marginTop: '2px', flexShrink: 0 }} />
                            <div>
                              <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>Area / Locality</div>
                              <div style={{ fontSize: '0.92rem', color: '#0F172A', fontWeight: 800, marginTop: '2px' }}>{formData.area || '-'}</div>
                            </div>
                          </div>
                          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <FaEnvelope style={{ fontSize: '1.1rem', color: '#64748B', marginTop: '2px', flexShrink: 0 }} />
                            <div style={{ width: '100%' }}>
                              <label style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, display: 'block', marginBottom: '2px' }}>Postal Code (Manual Entry)</label>
                              <input 
                                type="text" 
                                value={formData.postal_code || formData.pincode || ''} 
                                onChange={e => {
                                  const newPin = e.target.value;
                                  const oldPin = formData.postal_code || formData.pincode;
                                  let newAddress = formData.formatted_address || formData.fullAddress || '';
                                  if (oldPin && newAddress.includes(oldPin)) {
                                    newAddress = newAddress.replace(oldPin, newPin);
                                  } else {
                                    newAddress = newAddress.replace(/\b\d{6}\b/, newPin);
                                  }
                                  setFormData({ 
                                    ...formData, 
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

                        {/* Coordinates & Place ID Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '12px' }}>
                          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaCrosshairs style={{ color: '#059669', fontSize: '1rem', flexShrink: 0 }} />
                            <div>
                              <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>Latitude</div>
                              <div style={{ fontSize: '0.88rem', color: '#059669', fontWeight: 800 }}>{formData.latitude?.toFixed(6) || '-'}</div>
                            </div>
                          </div>
                          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaCompass style={{ color: '#059669', fontSize: '1rem', flexShrink: 0 }} />
                            <div>
                              <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>Longitude</div>
                              <div style={{ fontSize: '0.88rem', color: '#059669', fontWeight: 800 }}>{formData.longitude?.toFixed(6) || '-'}</div>
                            </div>
                          </div>
                          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaList style={{ color: '#059669', fontSize: '1rem', flexShrink: 0 }} />
                            <div style={{ overflow: 'hidden' }}>
                              <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>Google Place ID</div>
                              <div style={{ fontSize: '0.82rem', color: '#059669', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{formData.google_place_id || '-'}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Full Formatted Address Box */}
                      <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '16px 18px', marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Full Formatted Address</span>
                          <span style={{ fontSize: '0.88rem', color: '#0F172A', fontWeight: 700 }}>{formData.formatted_address || formData.fullAddress || '-'}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(formData.formatted_address || formData.fullAddress || 'Plot 45, HITEC City Phase 2, Hyderabad');
                            showNotification?.('Address copied to clipboard!', 'success');
                          }}
                          style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '1.2rem', padding: '4px', display: 'flex', alignItems: 'center' }}
                          title="Copy Address"
                        >
                          <FaCopy />
                        </button>
                      </div>
                    </div>

                    {/* Right Column: Location Preview */}
                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '28px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
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
                            style={{ padding: '8px 16px', backgroundColor: '#ECFDF5', color: '#059669', border: '1px solid #BFDBFE', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
                          >
                            Open in Google Maps <FaExternalLinkAlt style={{ fontSize: '0.75rem' }} />
                          </a>
                        </div>

                        {/* Interactive Map Preview Box */}
                        <div style={{ marginTop: '20px', position: 'relative', height: '380px', borderRadius: '16px', overflow: 'hidden' }}>
                          <LocationPickerMap
                            latitude={mapMarkerPos.lat}
                            longitude={mapMarkerPos.lng}
                            onChange={handleMarkerDrag}
                            radius={formData.service_radius}
                            city={formData.city}
                            height="380px"
                          />

                          {/* Map Controls & Nudge Buttons */}
                          <div style={{ position: 'absolute', bottom: '14px', left: '14px', right: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.95)', padding: '8px 14px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', border: '1px solid #E2E8F0', zIndex: 1000 }}>
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
                      <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #BFDBFE', borderRadius: '12px', padding: '14px 18px', marginTop: '20px', display: 'flex', alignItems: 'center', gap: '12px', color: '#059669', fontSize: '0.88rem', fontWeight: 600 }}>
                        <FaLightbulb style={{ color: '#059669', fontSize: '1.2rem', flexShrink: 0 }} />
                        <span>Tip: Drag the marker to adjust the exact location if needed.</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Full-Width Card: Search Radius (Optional) */}
                  <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '28px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                      <div>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669', margin: 0 }}>Search Radius (Optional)</h4>
                        <p style={{ color: '#64748B', fontSize: '0.88rem', margin: '4px 0 0 0' }}>Set the service or visibility radius for this property</p>
                      </div>
                      <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <FaLayerGroup style={{ color: '#059669', fontSize: '1.5rem', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Selected Radius</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>{formData.service_radius || 10} KM</div>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#64748B', maxWidth: '260px', lineHeight: 1.4, borderLeft: '1px solid #E2E8F0', paddingLeft: '16px' }}>
                          Properties within this radius will be considered for search and listing.
                        </div>
                      </div>
                    </div>

                    {/* Slider Control */}
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={formData.service_radius || 10}
                      onChange={e => setFormData({ ...formData, service_radius: Number(e.target.value) })}
                      style={{ width: '100%', marginTop: '24px', accentColor: '#059669', height: '6px', cursor: 'pointer' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, color: '#64748B', marginTop: '10px' }}>
                      <span>1 KM</span>
                      <span>5 KM</span>
                      <span style={{ color: '#059669', fontWeight: 800 }}>10 KM</span>
                      <span>20 KM</span>
                      <span>50 KM</span>
                      <span>100 KM</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: BASIC DETAILS */}
              {modalSubTab === 'basic' && (
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669', margin: 0, borderBottom: '1px solid #E2E8F0', paddingBottom: '16px' }}>2. Basic Property Information</h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>PROPERTY ID (Auto-Generated) *</label>
                      <input type="text" value={formData.id || ''} readOnly style={{ width: '100%', padding: '14px', border: '1px solid #E2E8F0', borderRadius: '12px', fontWeight: 700, color: '#64748B', backgroundColor: '#F8FAFC', outline: 'none' }} required />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>PROPERTY TITLE *</label>
                      <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Ultra Luxury Sky Villa with Private Pool in Jubilee Hills" style={{ width: '100%', padding: '14px', border: '1.5px solid #CBD5E1', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 600, outline: 'none' }} required />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>PURPOSE *</label>
                      <select value={formData.propertyPurpose || 'Sale'} onChange={e => setFormData({ ...formData, propertyPurpose: e.target.value as any, status: e.target.value === 'Sale' ? 'Buy' : 'Rent' })} style={{ width: '100%', padding: '14px', border: '1.5px solid #CBD5E1', borderRadius: '12px', fontWeight: 600, backgroundColor: '#FFFFFF' }}>
                        <option value="Sale">Sale (Buy)</option>
                        <option value="Rent">Rent</option>
                        <option value="Lease">Long-term Lease</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>MAJOR CATEGORY *</label>
                      <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as any })} style={{ width: '100%', padding: '14px', border: '1.5px solid #CBD5E1', borderRadius: '12px', fontWeight: 600, backgroundColor: '#FFFFFF' }}>
                        <option value="Villa">Villa</option>
                        <option value="Apartment">Apartment</option>
                        <option value="House">Individual House</option>
                        <option value="Plot">Land / Plot</option>
                        <option value="Commercial">Commercial</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>APPROVAL PIPELINE *</label>
                      <select value={formData.approvalStatus || 'Published'} onChange={e => setFormData({ ...formData, approvalStatus: e.target.value as any, listingStatus: e.target.value as any, sold: e.target.value === 'Sold', soldDate: e.target.value === 'Sold' ? (formData.soldDate || new Date().toISOString().slice(0, 10)) : undefined })} style={{ width: '100%', padding: '14px', border: '1.5px solid #059669', borderRadius: '12px', fontWeight: 700, color: '#059669', backgroundColor: '#FFFFFF' }}>
                        <option value="Published">Published Immediately</option>
                        <option value="Pending Approval">Pending Approval</option>
                        <option value="Draft">Save as Draft</option>
                        <option value="Sold">Mark as Reserved</option>
                      </select>
                    </div>
                  </div>

                  {/* Mark as Reserved Toggle Switch Component */}
                  <div style={{ backgroundColor: formData.sold ? '#FEF2F2' : '#F8FAFC', border: `1.5px solid ${formData.sold ? '#EF4444' : '#CBD5E1'}`, borderRadius: '14px', padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: formData.sold ? '#DC2626' : '#0F172A', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span>Mark Property as Reserved</span>
                        {formData.sold && <span style={{ backgroundColor: '#DC2626', color: '#FFF', fontSize: '0.75rem', padding: '3px 10px', borderRadius: '6px', fontWeight: 800, letterSpacing: '0.5px' }}>RESERVED</span>}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '4px' }}>
                        When enabled, a prominent red <strong>RESERVED</strong> badge will appear on all property cards, search listings, and detail pages.
                      </div>
                    </div>
                    <label style={{ position: 'relative', display: 'inline-block', width: '56px', height: '30px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.sold || formData.approvalStatus === 'Sold' || formData.listingStatus === 'Sold' || false}
                        onChange={e => {
                          const isSold = e.target.checked;
                          setFormData({
                            ...formData,
                            sold: isSold,
                            soldDate: isSold ? (formData.soldDate || new Date().toISOString().slice(0, 10)) : undefined,
                            approvalStatus: isSold ? 'Sold' : 'Published',
                            listingStatus: isSold ? 'Sold' : 'Published'
                          });
                        }}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: (formData.sold || formData.approvalStatus === 'Sold') ? '#DC2626' : '#CBD5E1', transition: '0.3s', borderRadius: '34px' }}>
                        <span style={{ position: 'absolute', content: '""', height: '22px', width: '22px', left: (formData.sold || formData.approvalStatus === 'Sold') ? '30px' : '4px', bottom: '4px', backgroundColor: 'white', transition: '0.3s', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                      </span>
                    </label>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>DETAILED PROPERTY DESCRIPTION</label>
                    <textarea rows={5} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Provide a rich, compelling overview of the property architecture, views, surroundings, and exclusive features..." style={{ width: '100%', padding: '14px', border: '1.5px solid #CBD5E1', borderRadius: '12px', fontSize: '0.95rem', lineHeight: 1.6, outline: 'none' }} />
                  </div>
                </div>
              )}

              {/* STEP 3: SPECIFICATIONS & AMENITIES */}
              {modalSubTab === 'specs' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669', margin: '0 0 20px 0', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px' }}>3. Technical Specifications & Dimensions</h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                      <div>
                        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>SUPER BUILT-UP AREA *</label>
                        <input type="text" value={formData.superBuiltUpArea || ''} onChange={e => setFormData({ ...formData, superBuiltUpArea: e.target.value, areaSqFt: e.target.value })} placeholder="e.g. 2,500 Sq.Ft" style={{ width: '100%', padding: '14px', border: '1.5px solid #CBD5E1', borderRadius: '12px', fontWeight: 600 }} required />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>CARPET AREA *</label>
                        <input type="text" value={formData.carpetArea || ''} onChange={e => setFormData({ ...formData, carpetArea: e.target.value })} placeholder="e.g. 2,100 Sq.Ft" style={{ width: '100%', padding: '14px', border: '1.5px solid #CBD5E1', borderRadius: '12px', fontWeight: 600 }} required />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>BEDROOMS (BHK) *</label>
                        <input type="number" value={formData.bedrooms ?? ''} onChange={e => setFormData({ ...formData, bedrooms: e.target.value === '' ? undefined : parseInt(e.target.value) || undefined })} placeholder="e.g. 3" style={{ width: '100%', padding: '14px', border: '1.5px solid #CBD5E1', borderRadius: '12px', fontWeight: 600 }} required />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>BATHROOMS *</label>
                        <input type="number" value={formData.bathrooms ?? ''} onChange={e => setFormData({ ...formData, bathrooms: e.target.value === '' ? undefined : parseInt(e.target.value) || undefined })} placeholder="e.g. 3" style={{ width: '100%', padding: '14px', border: '1.5px solid #CBD5E1', borderRadius: '12px', fontWeight: 600 }} required />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>PARKING SLOTS *</label>
                        <input type="number" value={formData.parkingSlots ?? ''} onChange={e => setFormData({ ...formData, parkingSlots: e.target.value === '' ? undefined : parseInt(e.target.value) || undefined })} placeholder="e.g. 2" style={{ width: '100%', padding: '14px', border: '1.5px solid #CBD5E1', borderRadius: '12px', fontWeight: 600 }} required />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>OWNERSHIP TYPE *</label>
                        <select value={formData.ownershipType || ''} onChange={e => setFormData({ ...formData, ownershipType: e.target.value })} style={{ width: '100%', padding: '14px', border: '1.5px solid #CBD5E1', borderRadius: '12px', fontWeight: 600, backgroundColor: '#FFFFFF' }} required>
                          <option value="">Select Ownership Type</option>
                          <option value="Freehold">Freehold</option>
                          <option value="Leasehold">Leasehold</option>
                          <option value="Co-operative Society">Co-operative Society</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>FACING DIRECTION *</label>
                        <select value={formData.facing || ''} onChange={e => setFormData({ ...formData, facing: e.target.value })} style={{ width: '100%', padding: '14px', border: '1.5px solid #CBD5E1', borderRadius: '12px', fontWeight: 600, backgroundColor: '#FFFFFF' }} required>
                          <option value="">Select Facing Direction</option>
                          <option value="East">East Facing</option>
                          <option value="North-East">North-East Facing</option>
                          <option value="North">North Facing</option>
                          <option value="West">West Facing</option>
                          <option value="South">South Facing</option>
                          <option value="South-East">South-East Facing</option>
                          <option value="South-West">South-West Facing</option>
                          <option value="North-West">North-West Facing</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Amenities Section */}
                  <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669', margin: '0 0 16px 0' }}>Available Amenities & Features</h4>
                    <p style={{ color: '#64748B', fontSize: '0.88rem', margin: '0 0 20px 0' }}>Select all amenities available in this property project</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                      {ALL_AMENITIES.map(am => {
                        const isChecked = formData.amenities?.includes(am);
                        return (
                          <label key={am} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', backgroundColor: isChecked ? '#ECFDF5' : '#F8FAFC', border: isChecked ? '1.5px solid #059669' : '1px solid #E2E8F0', cursor: 'pointer', borderRadius: '12px', fontWeight: 700, color: isChecked ? '#059669' : '#334155', transition: 'all 0.2s' }}>
                            <input
                              type="checkbox"
                              checked={!!isChecked}
                              onChange={e => {
                                const curr = formData.amenities || [];
                                if (e.target.checked) setFormData({ ...formData, amenities: [...curr, am] });
                                else setFormData({ ...formData, amenities: curr.filter(x => x !== am) });
                              }}
                              style={{ width: '18px', height: '18px', accentColor: '#059669' }}
                            />
                            {am}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: PRICING */}
              {modalSubTab === 'pricing' && (
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669', margin: 0, borderBottom: '1px solid #E2E8F0', paddingBottom: '16px' }}>4. Price & Financial Terms</h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>PRICE VALUE *</label>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <input
                          type="number"
                          step="any"
                          value={formData.price || ''}
                          onChange={e => {
                            const val = parseFloat(e.target.value) || 0;
                            let label = '';
                            if (priceUnit === 'Crores') {
                              label = `₹${val.toFixed(2)} Crore`;
                            } else if (priceUnit === 'Lakhs') {
                              label = `₹${val.toFixed(2)} Lakh`;
                            } else {
                              label = `₹${val.toLocaleString('en-IN')}`;
                            }
                            setFormData({ ...formData, price: val, priceDisplay: label });
                          }}
                          placeholder="e.g. 75"
                          style={{ flexGrow: 1, padding: '14px', border: '1.5px solid #059669', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 800, color: '#059669', outline: 'none' }}
                          required
                        />
                        <select
                          value={priceUnit}
                          onChange={e => {
                            const unit = e.target.value as any;
                            setPriceUnit(unit);
                            const val = formData.price || 0;
                            let label = '';
                            if (unit === 'Crores') {
                              label = `₹${val.toFixed(2)} Crore`;
                            } else if (unit === 'Lakhs') {
                              label = `₹${val.toFixed(2)} Lakh`;
                            } else {
                              label = `₹${val.toLocaleString('en-IN')}`;
                            }
                            setFormData({ ...formData, priceDisplay: label });
                          }}
                          style={{ padding: '14px', border: '1.5px solid #059669', borderRadius: '12px', fontSize: '1.05rem', fontWeight: 700, backgroundColor: '#FFFFFF', cursor: 'pointer', outline: 'none' }}
                        >
                          <option value="Thousands">Thousands (₹)</option>
                          <option value="Lakhs">Lakhs (₹)</option>
                          <option value="Crores">Crores (₹)</option>
                        </select>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '6px', display: 'block' }}>Enter numerical value and select the currency unit (Thousands, Lakhs, Crores)</span>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>PRICE DISPLAY LABEL</label>
                      <input type="text" value={formData.priceDisplay || ''} onChange={e => setFormData({ ...formData, priceDisplay: e.target.value })} placeholder="e.g. ₹75.00 Lakh" style={{ width: '100%', padding: '14px', border: '1.5px solid #CBD5E1', borderRadius: '12px', fontSize: '1rem', fontWeight: 700 }} />
                      <span style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '6px', display: 'block' }}>Formatted price string shown to users on listing cards</span>
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#F8FAFC', padding: '20px', borderRadius: '14px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <FaMoneyBillWave style={{ fontSize: '2rem', color: '#059669', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '1rem' }}>Transparent Valuation Guarantee</div>
                      <div style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '4px' }}>All property prices on TheNexOpp are verified directly with sellers/builders with zero hidden markups.</div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: MEDIA & PHOTOS */}
              {modalSubTab === 'media' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px', marginBottom: '24px' }}>
                      <div>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669', margin: 0 }}>5. Media Gallery</h4>
                        <p style={{ color: '#64748B', fontSize: '0.88rem', margin: '4px 0 0 0' }}>Drag & drop or upload showcase images for your property listing (Optional)</p>
                      </div>
                      <span style={{ padding: '6px 14px', backgroundColor: '#ECFDF5', color: '#059669', borderRadius: '16px', fontWeight: 700, fontSize: '0.8rem' }}>
                        {((formData.image ? 1 : 0) + (formData.image2 ? 1 : 0) + (formData.image3 ? 1 : 0) + (formData.image4 ? 1 : 0) + (formData.image5 ? 1 : 0) + (formData.image6 ? 1 : 0))} / 6 Photos Uploaded
                      </span>
                    </div>

                    {/* Single Optional Drag & Drop Zone */}
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            const base64 = ev.target?.result as string;
                            if (!formData.image) setFormData({ ...formData, image: base64 });
                            else if (!formData.image2) setFormData({ ...formData, image2: base64 });
                            else if (!formData.image3) setFormData({ ...formData, image3: base64 });
                            else if (!formData.image4) setFormData({ ...formData, image4: base64 });
                            else if (!formData.image5) setFormData({ ...formData, image5: base64 });
                            else if (!formData.image6) setFormData({ ...formData, image6: base64 });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      onClick={() => {
                        if (!formData.image) document.getElementById('optional-file-input-0')?.click();
                        else if (!formData.image2) document.getElementById('optional-file-input-1')?.click();
                        else if (!formData.image3) document.getElementById('optional-file-input-2')?.click();
                        else if (!formData.image4) document.getElementById('optional-file-input-3')?.click();
                        else if (!formData.image5) document.getElementById('optional-file-input-4')?.click();
                        else if (!formData.image6) document.getElementById('optional-file-input-5')?.click();
                      }}
                      style={{
                        border: '2.5px dashed #059669',
                        borderRadius: '16px',
                        padding: '40px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        backgroundColor: '#F8FAFC',
                        transition: 'all 0.2s',
                        marginBottom: '24px',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                      }}
                    >
                      <FaCamera style={{ fontSize: '2.5rem', color: '#059669', marginBottom: '12px' }} />
                      <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#059669' }}>Drag & Drop or Click to Upload Image</div>
                      <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '6px' }}>PNG, JPG, or WEBP (Max 6 showcase images)</div>
                      <div style={{ display: 'none' }}>
                        <input id="optional-file-input-0" type="file" accept="image/*" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => setFormData({ ...formData, image: ev.target?.result as string });
                            reader.readAsDataURL(file);
                          }
                        }} />
                        <input id="optional-file-input-1" type="file" accept="image/*" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => setFormData({ ...formData, image2: ev.target?.result as string });
                            reader.readAsDataURL(file);
                          }
                        }} />
                        <input id="optional-file-input-2" type="file" accept="image/*" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => setFormData({ ...formData, image3: ev.target?.result as string });
                            reader.readAsDataURL(file);
                          }
                        }} />
                        <input id="optional-file-input-3" type="file" accept="image/*" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => setFormData({ ...formData, image4: ev.target?.result as string });
                            reader.readAsDataURL(file);
                          }
                        }} />
                        <input id="optional-file-input-4" type="file" accept="image/*" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => setFormData({ ...formData, image5: ev.target?.result as string });
                            reader.readAsDataURL(file);
                          }
                        }} />
                        <input id="optional-file-input-5" type="file" accept="image/*" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => setFormData({ ...formData, image6: ev.target?.result as string });
                            reader.readAsDataURL(file);
                          }
                        }} />
                      </div>
                    </div>

                    {/* Previews of Uploaded Images */}
                    {(formData.image || formData.image2 || formData.image3 || formData.image4 || formData.image5 || formData.image6) ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                        {[
                          { key: 'image', val: formData.image, label: '★ COVER HERO IMAGE' },
                          { key: 'image2', val: formData.image2, label: 'SHOWCASE SLIDE #2' },
                          { key: 'image3', val: formData.image3, label: 'SHOWCASE SLIDE #3' },
                          { key: 'image4', val: formData.image4, label: 'SHOWCASE SLIDE #4' },
                          { key: 'image5', val: formData.image5, label: 'SHOWCASE SLIDE #5' },
                          { key: 'image6', val: formData.image6, label: 'SHOWCASE SLIDE #6' }
                        ].map((item, idx) => {
                          if (!item.val) return null;
                          return (
                            <div key={idx} style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.01)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: idx === 0 ? '#059669' : '#334155' }}>
                                  {item.label}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormData({ ...formData, [item.key]: '' });
                                  }}
                                  style={{ background: '#FEE2E2', border: 'none', color: '#EF4444', borderRadius: '6px', padding: '4px 8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                                >
                                  Remove
                                </button>
                              </div>
                              <div style={{ width: '100%', height: '180px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#E2E8F0' }}>
                                <img src={item.val} alt={item.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '24px', color: '#94A3B8', fontStyle: 'italic', fontSize: '0.9rem' }}>
                        No images uploaded yet.
                      </div>
                    )}
                  </div>

                  {/* 360 Virtual Tour Box */}
                  <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669', margin: '0 0 8px 0' }}>360° Virtual Tour & Video Walkthrough</h4>
                    <p style={{ color: '#64748B', fontSize: '0.88rem', margin: '0 0 20px 0' }}>Embed Matterport 3D tours or YouTube walkthrough links for immersive client exploration</p>
                    <input
                      type="text"
                      value={formData.virtualTourUrl || ''}
                      onChange={e => setFormData({ ...formData, virtualTourUrl: e.target.value })}
                      placeholder="https://my.matterport.com/show/?m=... or https://youtube.com/watch?v=..."
                      style={{ width: '100%', padding: '14px', border: '1.5px solid #CBD5E1', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 600 }}
                    />
                  </div>
                </div>
              )}

              {/* STEP 6: REVIEW & PUBLISH */}
              {modalSubTab === 'review' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* Assigned Broker Section */}
                  <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FaUserTie /> Assign Verified Broker Partner
                    </h4>
                    <p style={{ color: '#64748B', fontSize: '0.88rem', margin: '0 0 20px 0' }}>Select the authorized realty advisor responsible for client inquiries and site visits</p>
                    
                    {dealersDb.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '32px 20px', backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1px border-dashed #CBD5E1' }}>
                        <p style={{ color: '#64748B', fontWeight: 600, margin: '0 0 12px 0' }}>No broker partners found in system.</p>
                        <p style={{ color: '#94A3B8', fontSize: '0.82rem', margin: 0 }}>Brokers can be added from the Broker Management tab in the Admin Panel.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                        {dealersDb.map(broker => {
                          const isAssigned = formData.assignedBrokerIds?.includes(broker.id) || formData.dealerId === broker.id;
                          return (
                            <div
                              key={broker.id}
                              onClick={() => {
                                const curr = formData.assignedBrokerIds || [];
                                if (isAssigned) {
                                  setFormData({ ...formData, assignedBrokerIds: curr.filter(id => id !== broker.id) });
                                } else {
                                  setFormData({ ...formData, assignedBrokerIds: [...curr, broker.id], dealerId: broker.id });
                                }
                              }}
                              style={{ padding: '16px 20px', backgroundColor: isAssigned ? '#ECFDF5' : '#F8FAFC', border: isAssigned ? '2px solid #059669' : '1px solid #E2E8F0', borderRadius: '16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s', boxShadow: isAssigned ? '0 4px 12px rgba(37, 99, 235, 0.15)' : 'none' }}
                            >
                              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                                <img src={broker.photo || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=100&q=80'} alt={broker.companyName} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
                                <div>
                                  <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.95rem' }}>{broker.companyName}</div>
                                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{broker.fullName || 'Advisor'} • ⭐ {broker.rating}</div>
                                </div>
                              </div>
                              <div>
                                {isAssigned ? (
                                  <span style={{ padding: '6px 14px', backgroundColor: '#059669', color: '#FFF', fontWeight: 800, fontSize: '0.78rem', borderRadius: '16px' }}>✓ ASSIGNED</span>
                                ) : (
                                  <span style={{ padding: '6px 14px', backgroundColor: '#E2E8F0', color: '#475569', fontWeight: 700, fontSize: '0.78rem', borderRadius: '16px' }}>SELECT</span>
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
            </form>

            {/* Modal Footer Bar */}
            <div style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #E2E8F0', padding: '18px 36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '12px 28px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '12px', fontWeight: 700, fontSize: '0.92rem', color: '#475569', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  Cancel
                </button>
                {modalMode === 'edit' && formData.id && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setTimeout(() => setViewAnalyticsProperty(formData as any), 100);
                      }}
                      style={{ padding: '10px 16px', backgroundColor: '#ECFDF5', color: '#059669', border: '1px solid #BFDBFE', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                      title="View Property Analytics"
                    >
                      <FaEye /> Views
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setTimeout(() => openDuplicateModal(formData as any), 100);
                      }}
                      style={{ padding: '10px 16px', backgroundColor: '#F8FAFC', color: '#475569', border: '1px solid #E2E8F0', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                      title="Duplicate Listing"
                    >
                      <FaCopy /> Duplicate
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Permanently delete '${formData.title}'?`)) {
                          deleteProperty(formData.id!);
                          showNotification?.("Property deleted.", "warning");
                          setIsModalOpen(false);
                        }
                      }}
                      style={{ padding: '10px 16px', backgroundColor: '#FEF2F2', color: '#EF4444', border: '1px solid #FECACA', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                      title="Delete Property"
                    >
                      <FaTrash /> Delete
                    </button>
                  </>
                )}
              </div>
              <div style={{ display: 'flex', gap: '14px' }}>
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  style={{ padding: '12px 28px', backgroundColor: '#ECFDF5', border: '1px solid #BFDBFE', borderRadius: '12px', fontWeight: 700, fontSize: '0.92rem', color: '#059669', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  onClick={e => {
                    if (modalSubTab === 'location') setModalSubTab('basic');
                    else if (modalSubTab === 'basic') setModalSubTab('specs');
                    else if (modalSubTab === 'specs') setModalSubTab('pricing');
                    else if (modalSubTab === 'pricing') setModalSubTab('media');
                    else if (modalSubTab === 'media') setModalSubTab('review');
                    else handleSaveProperty(e as any);
                  }}
                  style={{ padding: '12px 32px', backgroundColor: '#059669', color: '#FFFFFF', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)', transition: 'all 0.2s' }}
                >
                  {modalSubTab === 'review' ? (
                    <>✓ Save & Publish</>
                  ) : (
                    <>Save & Continue <FaArrowRight style={{ fontSize: '0.8rem' }} /></>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Property View Analytics Modal (Admin Only) */}
      {viewAnalyticsProperty && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10000, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', maxWidth: '460px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #E2E8F0', overflow: 'hidden', animation: 'fadeIn 0.2s ease-out' }}>
            <div style={{ backgroundColor: '#059669', padding: '24px', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                  👁️
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF' }}>Property View Analytics</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#93C5FD', fontWeight: 500 }}>Admin Only • Live Database Insights</p>
                </div>
              </div>
              <button onClick={() => setViewAnalyticsProperty(null)} style={{ background: 'none', border: 'none', color: '#FFFFFF', fontSize: '1.4rem', cursor: 'pointer', opacity: 0.8 }} title="Close">✕</button>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '20px', backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                <img src={viewAnalyticsProperty.image || viewAnalyticsProperty.images?.[0]} alt="" style={{ width: '60px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0F172A', lineClamp: 1, WebkitLineClamp: 1, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{viewAnalyticsProperty.title}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>{viewAnalyticsProperty.city} • {viewAnalyticsProperty.priceDisplay}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginBottom: '20px' }}>
                <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #BFDBFE', padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Views</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#059669', marginTop: '4px' }}>👁️ {viewAnalyticsProperty.viewsCount || 0}</div>
                  <div style={{ display: 'flex', gap: '4px', marginTop: '10px' }}>
                    <button
                      onClick={() => {
                        const amt = prompt('Enter new views count:', String(viewAnalyticsProperty.viewsCount || 0));
                        if (amt !== null && !isNaN(Number(amt))) {
                          updateProperty(viewAnalyticsProperty.id, { viewsCount: Number(amt) });
                          setViewAnalyticsProperty({ ...viewAnalyticsProperty, viewsCount: Number(amt) });
                          notifyDataChanged();
                        }
                      }}
                      style={{ flex: 1, padding: '4px 6px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#059669', fontSize: '0.62rem', fontWeight: 700, borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        updateProperty(viewAnalyticsProperty.id, { viewsCount: 0 });
                        setViewAnalyticsProperty({ ...viewAnalyticsProperty, viewsCount: 0 });
                        notifyDataChanged();
                      }}
                      style={{ flex: 1, padding: '4px 6px', border: '1px solid #FCA5A5', backgroundColor: '#FEF2F2', color: '#EF4444', fontSize: '0.62rem', fontWeight: 700, borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Reset
                    </button>
                  </div>
                </div>
                <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unique Visitors</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#14532D', marginTop: '4px' }}>👤 {viewAnalyticsProperty.uniqueVisitorsCount || Math.max(0, Math.floor((viewAnalyticsProperty.viewsCount || 0) * 0.75))}</div>
                  <div style={{ display: 'flex', gap: '4px', marginTop: '10px' }}>
                    <button
                      onClick={() => {
                        const amt = prompt('Enter new unique visitors count:', String(viewAnalyticsProperty.uniqueVisitorsCount || 0));
                        if (amt !== null && !isNaN(Number(amt))) {
                          updateProperty(viewAnalyticsProperty.id, { uniqueVisitorsCount: Number(amt) });
                          setViewAnalyticsProperty({ ...viewAnalyticsProperty, uniqueVisitorsCount: Number(amt) });
                          notifyDataChanged();
                        }
                      }}
                      style={{ flex: 1, padding: '4px 6px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#059669', fontSize: '0.62rem', fontWeight: 700, borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        updateProperty(viewAnalyticsProperty.id, { uniqueVisitorsCount: 0 });
                        setViewAnalyticsProperty({ ...viewAnalyticsProperty, uniqueVisitorsCount: 0 });
                        notifyDataChanged();
                      }}
                      style={{ flex: 1, padding: '4px 6px', border: '1px solid #FCA5A5', backgroundColor: '#FEF2F2', color: '#EF4444', fontSize: '0.62rem', fontWeight: 700, borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', padding: '14px 18px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748B' }}>Last Viewed Date & Time:</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A' }}>{viewAnalyticsProperty.lastViewedAt || 'Not viewed yet'}</span>
              </div>
            </div>

            <div style={{ padding: '16px 24px', backgroundColor: '#F1F5F9', borderTop: '1px solid #E2E8F0', textAlign: 'right' }}>
              <button onClick={() => setViewAnalyticsProperty(null)} style={{ padding: '10px 24px', backgroundColor: '#059669', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
