import React, { useState, useEffect, useMemo } from 'react';
import {
  businessDb, addBusiness, updateBusiness, deleteBusiness,
  sellBusinessRequestsDb, updateSellBusinessRequest, deleteSellBusinessRequest,
  businessEnquiriesDb,
  masterCategoriesDb,
  masterBusinessTypesDb,
  dealersDb,
  type BusinessListing, type SellBusinessRequest, type BusinessEnquiry, type Dealer
} from '../db/marketplaceDb';
import { COMPREHENSIVE_INDIA_PLACES_DB, searchLivePlaces, geocodeLocationOnline, reverseGeocodeOnline } from '../utils/locationIntelligence';
import { LocationPickerMap } from './ui/LocationPickerMap';
import { 
  FaStore, FaEye, FaEdit, FaTrash, FaPlus, 
  FaSearch, FaCheck, FaTimes, FaBriefcase,
  FaFileAlt, FaMapMarkerAlt, FaCopy, FaCheckCircle, FaCrosshairs,
  FaGlobe, FaMap, FaCity, FaCompass, FaEnvelope, FaList,
  FaMoneyBillWave, FaUserTie, FaBuilding, FaExternalLinkAlt, FaCamera, FaStar, FaPhone, FaShieldAlt
} from 'react-icons/fa';

interface BusinessManagementSystemProps {
  showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void;
  activeSubTab: string;
  onSubTabChange: (tab: string) => void;
}

const DEFAULT_BUSINESS_CATEGORIES = [
  'Restaurants & Cafés',
  'Retail & Stores',
  'Manufacturing & Industrial',
  'Healthcare & Pharmacy',
  'Hotels & Hospitality',
  'Automobile & Garage',
  'IT & Software Services',
  'Education & Coaching',
  'Services & Logistics',
  'Beauty & Wellness',
  'Food & Beverages'
];

const DEFAULT_BUSINESS_TYPES = [
  'Sole Proprietorship',
  'Partnership Firm',
  'Limited Liability Partnership (LLP)',
  'Private Limited Company (Pvt Ltd)',
  'Public Limited Company',
  'One Person Company (OPC)',
  'Franchise Resale Unit',
  'Joint Venture'
];

const FALLBACK_DEALERS: Dealer[] = [
  { id: 'D1', companyName: 'RealtyPlus Advisors', fullName: 'Rajesh Sharma', rating: 4.9, reviewCount: 142, phone: '+91 98480 22338', mobile: '+91 98480 22338', state: 'Andhra Pradesh', city: 'Guntur', verified: true, yearsExperience: 12, specialization: 'Commercial & Business Acquisitions', photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80', logo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80', premiumPartner: true, bestSeller: true, responseTime: '< 15 mins', inventoryCount: 24, coverage: { Guntur: 15, Vijayawada: 9 }, latitude: 16.3067, longitude: 80.4365 },
  { id: 'D2', companyName: 'NexOpp Prime Realty', fullName: 'Vikram Reddy', rating: 4.8, reviewCount: 98, phone: '+91 95539 25956', mobile: '+91 95539 25956', state: 'Telangana', city: 'Hyderabad', verified: true, yearsExperience: 8, specialization: 'High-Value Enterprises & Retails', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', logo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', premiumPartner: true, bestSeller: false, responseTime: '< 30 mins', inventoryCount: 18, coverage: { Hyderabad: 18 }, latitude: 17.4326, longitude: 78.4071 },
  { id: 'D3', companyName: 'Capital Asset Partners', fullName: 'Priya Narang', rating: 4.9, reviewCount: 115, phone: '+91 98765 43210', mobile: '+91 98765 43210', state: 'Andhra Pradesh', city: 'Vijayawada', verified: true, yearsExperience: 10, specialization: 'Business Sales & Franchises', photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80', logo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80', premiumPartner: true, bestSeller: true, responseTime: '< 10 mins', inventoryCount: 31, coverage: { Vijayawada: 20, Guntur: 11 }, latitude: 16.5062, longitude: 80.6480 },
  { id: 'D4', companyName: 'Elite Estate Consultants', fullName: 'Suresh Kumar', rating: 4.7, reviewCount: 76, phone: '+91 91234 56789', mobile: '+91 91234 56789', state: 'Andhra Pradesh', city: 'Visakhapatnam', verified: true, yearsExperience: 6, specialization: 'Commercial Outlets & Industrial Units', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80', logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80', premiumPartner: false, bestSeller: false, responseTime: '< 1 hr', inventoryCount: 14, coverage: { Visakhapatnam: 14 }, latitude: 17.6868, longitude: 83.2185 }
];

const GOOGLE_PLACES_SUGGESTIONS = COMPREHENSIVE_INDIA_PLACES_DB;

export const BusinessManagementSystem: React.FC<BusinessManagementSystemProps> = ({ 
  showNotification, 
  activeSubTab, 
  onSubTabChange 
}) => {
  const [dataUpdated, setDataUpdated] = useState(0);

  // Trigger re-render on global data change
  useEffect(() => {
    const handleDataChange = () => setDataUpdated(prev => prev + 1);
    window.addEventListener('nexopp_data_changed', handleDataChange);
    return () => window.removeEventListener('nexopp_data_changed', handleDataChange);
  }, []);

  // Main Navigation Tabs
  const [activeModuleTab, setActiveModuleTab] = useState<'listings' | 'soldOut' | 'categories' | 'types' | 'sellRequests' | 'enquiries'>('listings');

  useEffect(() => {
    if (activeSubTab) {
      if (activeSubTab === 'soldOut') setActiveModuleTab('soldOut');
      else if (activeSubTab === 'buyEnquiries') setActiveModuleTab('enquiries');
      else if (activeSubTab === 'businessTypes') setActiveModuleTab('types');
      else if (['listings', 'categories', 'types', 'sellRequests', 'enquiries'].includes(activeSubTab)) {
        setActiveModuleTab(activeSubTab as any);
      }
    }
  }, [activeSubTab]);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  
  // Data snapshots
  const businesses = useMemo(() => businessDb, [dataUpdated, businessDb]);
  const sellRequests = useMemo(() => sellBusinessRequestsDb, [dataUpdated, sellBusinessRequestsDb]);
  const buyEnquiries = useMemo(() => businessEnquiriesDb, [dataUpdated, businessEnquiriesDb]);
  
  const categories = useMemo(() => {
    const master = masterCategoriesDb.filter(c => c.type === 'category' || c.is_active !== false);
    if (master.length > 0) return master.map(c => c.name);
    return DEFAULT_BUSINESS_CATEGORIES;
  }, [dataUpdated, masterCategoriesDb]);

  const businessTypes = useMemo(() => {
    const master = masterBusinessTypesDb.filter(t => t.type === 'business_type' || t.is_active !== false);
    if (master.length > 0) return master.map(t => t.name);
    return DEFAULT_BUSINESS_TYPES;
  }, [dataUpdated, masterBusinessTypesDb]);

  const availableDealers = useMemo(() => {
    if (dealersDb && dealersDb.length > 0) return dealersDb;
    return FALLBACK_DEALERS;
  }, [dataUpdated, dealersDb]);

  const findBroker = (bId?: string) => {
    if (!bId) return null;
    return availableDealers.find(d => d.id.toLowerCase() === bId.toLowerCase()) || null;
  };

  // Modal States for Add / Edit / Duplicate
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'duplicate'>('add');
  const [modalSubTab, setModalSubTab] = useState<'location' | 'basic' | 'specs' | 'pricing' | 'media' | 'review'>('location');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [priceUnit, setPriceUnit] = useState<'Thousands' | 'Lakhs' | 'Crores'>('Lakhs');
  const [isSaving, setIsSaving] = useState(false);

  // Form State (100% Zero-Default, Pure User Entry)
  const [formData, setFormData] = useState<Partial<BusinessListing>>({
    title: '',
    name: '',
    category: '',
    industry: '',
    businessType: '',
    city: '',
    state: '',
    district: '',
    area: '',
    subLocation: '',
    landmark: '',
    pincode: '',
    postal_code: '',
    fullAddress: '',
    latitude: 17.4326,
    longitude: 78.4071,
    askingPrice: '' as any,
    price: 0,
    priceDisplay: '',
    revenueMonthly: '',
    profitMonthly: '',
    establishedYear: '' as any,
    employeesCount: '' as any,
    reasonForSale: '',
    sellerProfile: '',
    dealerId: '',
    agentName: '',
    agentPhone: '',
    assignedBrokerIds: [],
    status: 'Available',
    published: true,
    featured: false,
    verified: false,
    description: '',
    image: '',
    images: []
  });

  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Location Intelligence State
  const [addressSearchQuery, setAddressSearchQuery] = useState('');
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [mapMarkerPos, setMapMarkerPos] = useState<{ lat: number; lng: number }>({ lat: 17.4326, lng: 78.4071 });
  const [liveSuggestions, setLiveSuggestions] = useState<typeof GOOGLE_PLACES_SUGGESTIONS>(GOOGLE_PLACES_SUGGESTIONS);
  const [isSearchingLive, setIsSearchingLive] = useState(false);
  const [isAdminDetectingGPS, setIsAdminDetectingGPS] = useState(false);

  // Address search debounce
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
    const lat = Number(place.latitude) || 17.4326;
    const lng = Number(place.longitude) || 78.4071;
    const fullAddr = place.formatted_address || [place.area, place.city, place.state].filter(Boolean).join(', ');

    setFormData(prev => ({
      ...prev,
      fullAddress: fullAddr,
      location: fullAddr,
      latitude: lat,
      longitude: lng,
      state: place.state || '',
      district: place.district || '',
      city: place.city || '',
      area: place.area || '',
      subLocation: place.subLocation || place.area || '',
      landmark: place.landmark || place.area || '',
      pincode: place.postal_code || place.pincode || '',
      postal_code: place.postal_code || place.pincode || ''
    }));

    setMapMarkerPos({ lat, lng });
    setAddressSearchQuery(fullAddr);
    setShowLocationSuggestions(false);
    showNotification(`Location selected: ${place.area || place.city || ''}, ${place.state || ''}`, 'success');
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
        alert(`Could not retrieve GPS location: ${err.message}. Please allow location permission in your browser or search your address.`);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 0 }
    );
  };

  const handleMarkerDrag = async (newLat: number, newLng: number) => {
    setMapMarkerPos({ lat: newLat, lng: newLng });
    const revPlace = await reverseGeocodeOnline(newLat, newLng);
    setFormData(prev => ({
      ...prev,
      latitude: newLat,
      longitude: newLng,
      state: revPlace.state || prev.state || '',
      district: revPlace.district || prev.district || '',
      city: revPlace.city || prev.city || '',
      area: revPlace.area || prev.area || '',
      pincode: revPlace.postal_code || prev.pincode || '',
      postal_code: revPlace.postal_code || prev.postal_code || '',
      fullAddress: revPlace.formatted_address || prev.fullAddress || '',
      location: revPlace.formatted_address || prev.location || ''
    }));
    showNotification(`Marker shifted: Lat ${newLat.toFixed(6)}, Lng ${newLng.toFixed(6)}`, 'success');
  };

  // Open Add Business Modal
  const openAddModal = () => {
    setModalMode('add');
    setEditingId(null);
    setModalSubTab('location');
    setPriceUnit('Lakhs');
    setUploadedPhotos([]);
    setAddressSearchQuery('');
    setFormData({
      title: '',
      name: '',
      category: '',
      industry: '',
      businessType: '',
      city: '',
      state: '',
      district: '',
      area: '',
      subLocation: '',
      landmark: '',
      pincode: '',
      postal_code: '',
      fullAddress: '',
      latitude: 17.4326,
      longitude: 78.4071,
      askingPrice: '' as any,
      price: 0,
      priceDisplay: '',
      revenueMonthly: '',
      profitMonthly: '',
      establishedYear: '' as any,
      employeesCount: '' as any,
      reasonForSale: '',
      sellerProfile: '',
      dealerId: '',
      agentName: '',
      agentPhone: '',
      assignedBrokerIds: [],
      status: 'Available',
      published: true,
      featured: false,
      verified: false,
      description: '',
      image: '',
      images: []
    });
    setIsModalOpen(true);
  };

  // Open Edit Business Modal
  const openEditModal = (b: BusinessListing) => {
    setModalMode('edit');
    setEditingId(b.id);
    setModalSubTab('location');

    let rawPrice = b.price !== undefined ? b.price : (b.askingPrice || 0);
    let unit: 'Thousands' | 'Lakhs' | 'Crores' = 'Lakhs';
    if (rawPrice >= 100) {
      unit = 'Crores';
      rawPrice = rawPrice / 100;
    } else if (rawPrice < 1 && rawPrice > 0) {
      unit = 'Thousands';
      rawPrice = rawPrice * 100;
    }
    setPriceUnit(unit);

    const photosList = b.images && b.images.length > 0 ? b.images : (b.image ? [b.image] : []);
    setUploadedPhotos(photosList);
    const fullLoc = b.fullAddress || [b.subLocation, b.area, b.city, b.state].filter(Boolean).join(', ');
    setAddressSearchQuery(fullLoc);
    if (b.latitude && b.longitude) {
      setMapMarkerPos({ lat: Number(b.latitude), lng: Number(b.longitude) });
    }

    const effectiveDealerId = b.dealerId || b.brokerId || (b.assignedBrokerIds && b.assignedBrokerIds[0]) || '';
    const foundBroker = findBroker(effectiveDealerId);

    setFormData({
      ...b,
      title: b.name || b.title || '',
      name: b.name || b.title || '',
      askingPrice: rawPrice > 0 ? rawPrice : ('' as any),
      price: b.price || b.askingPrice || 0,
      priceDisplay: b.priceDisplay || (b.price ? `₹${b.price} Lakhs` : ''),
      dealerId: effectiveDealerId,
      brokerId: effectiveDealerId,
      assignedBrokerIds: effectiveDealerId ? [effectiveDealerId] : [],
      agentName: foundBroker ? (foundBroker.companyName || foundBroker.fullName || foundBroker.name) : (b.agentName || ''),
      agentPhone: foundBroker ? (foundBroker.mobile || foundBroker.phone || foundBroker.contactNumber) : (b.agentPhone || ''),
      images: photosList,
      image: photosList[0] || b.image || '',
      status: b.status || (b.sold ? 'Sold' : 'Available'),
      sold: b.sold === true || b.status === 'Sold',
      recentlySold: b.recentlySold === true,
      soldDate: b.soldDate
    });
    setIsModalOpen(true);
  };

  // Duplicate Business
  const handleDuplicateBusiness = async (b: BusinessListing) => {
    if (isSaving) return;
    const primaryImg = b.image || (b.images && b.images[0]) || '';
    const cloned: BusinessListing = {
      ...b,
      id: `biz-${Date.now()}`,
      title: `${b.name || b.title} (Copy)`,
      name: `${b.name || b.title} (Copy)`,
      image: primaryImg,
      images: b.images && b.images.length > 0 ? [...b.images] : (primaryImg ? [primaryImg] : []),
      published: false,
      status: 'Available',
      sold: false,
      recentlySold: false,
    };
    try {
      setIsSaving(true);
      await addBusiness(cloned);
      showNotification(`Cloned "${b.name || b.title}" successfully in database`, 'success');
    } catch (err: any) {
      showNotification(`Business clone was not saved: ${err?.message || 'database request failed'}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Step Validation
  const validateStep = (step: string) => {
    if (step === 'location') {
      if (!formData.city?.trim() && !formData.state?.trim() && !formData.fullAddress?.trim() && !formData.area?.trim()) {
        showNotification('Please enter or select a location for the business.', 'error');
        return false;
      }
      return true;
    }
    if (step === 'basic') {
      if (!formData.title?.trim()) {
        showNotification('Please enter a business title.', 'error');
        return false;
      }
      return true;
    }
    return true;
  };

  // Save Business Form Handler
  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    if (!formData.title?.trim()) {
      showNotification('Please enter a business title.', 'error');
      setModalSubTab('basic');
      return;
    }

    let numericPriceInLakhs = Number(formData.askingPrice) || 0;
    if (priceUnit === 'Crores') {
      numericPriceInLakhs = numericPriceInLakhs * 100;
    } else if (priceUnit === 'Thousands') {
      numericPriceInLakhs = numericPriceInLakhs / 100;
    }

    const calculatedPriceDisplay = formData.priceDisplay?.trim() || (
      numericPriceInLakhs > 0 ? (
        priceUnit === 'Crores' ? `₹${formData.askingPrice} Cr` :
        priceUnit === 'Thousands' ? `₹${formData.askingPrice} K` :
        `₹${formData.askingPrice} Lakhs`
      ) : ''
    );

    const primaryImage = uploadedPhotos[0] || formData.image || '';
    const selectedDealer = findBroker(formData.dealerId);

    const locSummary = [
      formData.subLocation || formData.landmark,
      formData.area,
      formData.city,
      formData.state
    ].filter(Boolean).join(', ') || formData.city || formData.fullAddress || '';

    const isSold = formData.status === 'Sold' || formData.sold === true;

    const payload: BusinessListing = {
      id: isModalOpen && editingId ? editingId : `biz-${Date.now()}`,
      name: formData.title.trim(),
      title: formData.title.trim(),
      industry: formData.category || formData.industry || '',
      category: formData.category || formData.industry || '',
      businessType: formData.businessType || '',
      city: formData.city?.trim() || '',
      state: formData.state?.trim() || '',
      district: formData.district?.trim() || '',
      area: formData.area?.trim() || '',
      subLocation: formData.subLocation?.trim() || '',
      landmark: formData.landmark?.trim() || formData.subLocation?.trim() || '',
      pincode: formData.pincode?.trim() || '',
      postal_code: formData.pincode?.trim() || '',
      fullAddress: formData.fullAddress?.trim() || locSummary,
      location: locSummary,
      latitude: Number(formData.latitude) || 17.4326,
      longitude: Number(formData.longitude) || 78.4071,
      price: numericPriceInLakhs,
      askingPrice: numericPriceInLakhs,
      priceDisplay: calculatedPriceDisplay,
      revenueMonthly: formData.revenueMonthly?.trim() || '',
      profitMonthly: formData.profitMonthly?.trim() || '',
      establishedYear: (formData.establishedYear && !isNaN(Number(formData.establishedYear))) ? Number(formData.establishedYear) : undefined,
      employeesCount: (formData.employeesCount !== undefined && formData.employeesCount !== '' && !isNaN(Number(formData.employeesCount))) ? Number(formData.employeesCount) : undefined,
      reasonForSale: formData.reasonForSale?.trim() || '',
      sellerProfile: formData.sellerProfile?.trim() || '',
      image: primaryImage,
      image2: uploadedPhotos[1] || undefined,
      image3: uploadedPhotos[2] || undefined,
      image4: uploadedPhotos[3] || undefined,
      image5: uploadedPhotos[4] || undefined,
      image6: uploadedPhotos[5] || undefined,
      images: uploadedPhotos,
      dealerId: formData.dealerId || undefined,
      brokerId: formData.dealerId || undefined,
      agentName: selectedDealer ? (selectedDealer.companyName || selectedDealer.fullName || selectedDealer.name) : undefined,
      agentPhone: selectedDealer ? (selectedDealer.mobile || selectedDealer.phone || selectedDealer.contactNumber) : undefined,
      assignedBrokerIds: formData.dealerId ? [formData.dealerId] : [],
      published: formData.published !== false,
      featured: !!formData.featured,
      verified: !!formData.verified,
      status: formData.status || (isSold ? 'Sold' : 'Available'),
      sold: isSold,
      recentlySold: isSold ? (formData.recentlySold !== false) : false,
      soldDate: isSold ? (formData.soldDate || new Date().toISOString().slice(0, 10)) : undefined,
      badge: isSold ? (formData.badge || 'RECENTLY ACQUIRED') : undefined,
      description: formData.description?.trim() || '',
    };

    try {
      setIsSaving(true);
      if (modalMode === 'edit' && editingId) {
        await updateBusiness(editingId, payload);
        showNotification(`Business "${payload.title}" updated in database`, 'success');
      } else {
        await addBusiness(payload);
        showNotification(`Business "${payload.title}" added to database`, 'success');
      }

      setIsModalOpen(false);
    } catch (err: any) {
      showNotification(`Business was not saved: ${err?.message || 'database request failed'}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Image Upload Handlers
  const handlePhotoFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setUploadedPhotos(prev => [...prev, ev.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddPhotoUrl = () => {
    if (newPhotoUrl.trim()) {
      setUploadedPhotos(prev => [...prev, newPhotoUrl.trim()]);
      setNewPhotoUrl('');
    }
  };

  const handleRemovePhoto = (idx: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSetPrimaryPhoto = (idx: number) => {
    setUploadedPhotos(prev => {
      const item = prev[idx];
      const rest = prev.filter((_, i) => i !== idx);
      return [item, ...rest];
    });
  };

  // Step Navigation Helpers
  const stepOrder: Array<'location' | 'basic' | 'specs' | 'pricing' | 'media' | 'review'> = ['location', 'basic', 'specs', 'pricing', 'media', 'review'];
  const currentStepIndex = stepOrder.indexOf(modalSubTab);

  const goNextStep = () => {
    if (!validateStep(modalSubTab)) return;
    if (currentStepIndex < stepOrder.length - 1) {
      setModalSubTab(stepOrder[currentStepIndex + 1]);
    }
  };

  const goPrevStep = () => {
    if (currentStepIndex > 0) {
      setModalSubTab(stepOrder[currentStepIndex - 1]);
    }
  };

  // Filtered Listings
  const filteredBusinesses = useMemo(() => {
    return businesses.filter(b => {
      const isSold = b.sold || b.status === 'Sold';
      if (activeModuleTab === 'listings' && isSold) return false;
      if (activeModuleTab === 'soldOut' && !isSold) return false;

      const matchSearch = !searchTerm || 
        (b.name || b.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.city || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.category || b.industry || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory = selectedCategoryFilter === 'All' || (b.category || b.industry) === selectedCategoryFilter;
      const matchStatus = selectedStatusFilter === 'All' || b.status === selectedStatusFilter;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [businesses, activeModuleTab, searchTerm, selectedCategoryFilter, selectedStatusFilter]);

  const assignedBroker = findBroker(formData.dealerId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      
      {/* Top Header & Metrics Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: '20px 24px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaStore style={{ color: '#059669' }} /> Business Management System
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#64748B', fontSize: '0.85rem' }}>
            Manage operational businesses, acquisitions, financial disclosures &amp; verified partner brokers
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={openAddModal}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#059669', color: '#FFFFFF', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)', transition: 'background 0.2s' }}
          >
            <FaPlus /> Add New Business
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ backgroundColor: '#FFFFFF', padding: '18px 20px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Total Businesses</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0F172A', marginTop: '4px' }}>{businesses.length}</div>
          <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>All listed enterprises</div>
        </div>
        <div style={{ backgroundColor: '#FFFFFF', padding: '18px 20px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Active for Sale</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#059669', marginTop: '4px' }}>
            {businesses.filter(b => (!b.sold && b.status !== 'Sold') && b.published !== false).length}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#059669', marginTop: '2px' }}>Live on marketplace</div>
        </div>
        <div 
          onClick={() => {
            setActiveModuleTab('soldOut');
            onSubTabChange('soldOut');
          }}
          style={{ backgroundColor: '#FFFFFF', padding: '18px 20px', borderRadius: '14px', border: '1px solid #E2E8F0', cursor: 'pointer', transition: 'border-color 0.2s' }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase' }}>Sold / Acquired</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#DC2626', marginTop: '4px' }}>
            {businesses.filter(b => b.sold || b.status === 'Sold').length}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#DC2626', marginTop: '2px' }}>Click to view Sold tab →</div>
        </div>
        <div style={{ backgroundColor: '#FFFFFF', padding: '18px 20px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Owner Sell Enquiries</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#D97706', marginTop: '4px' }}>{sellRequests.length}</div>
          <div style={{ fontSize: '0.72rem', color: '#D97706', marginTop: '2px' }}>Pending seller applications</div>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #E2E8F0', paddingBottom: '2px', overflowX: 'auto' }}>
        {[
          { id: 'listings', label: 'All Businesses', count: businesses.filter(b => !b.sold && b.status !== 'Sold').length, icon: FaStore },
          { id: 'soldOut', label: 'Sold Businesses', count: businesses.filter(b => b.sold || b.status === 'Sold').length, icon: FaCheckCircle },
          { id: 'sellRequests', label: 'Seller Enquiries CRM', count: sellRequests.length, icon: FaFileAlt },
          { id: 'enquiries', label: 'Buyer Inquiries', count: buyEnquiries.length, icon: FaEnvelope },
          { id: 'categories', label: 'Industry Categories', count: categories.length, icon: FaList },
          { id: 'types', label: 'Legal Structures', count: businessTypes.length, icon: FaBuilding }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveModuleTab(tab.id as any);
              onSubTabChange(tab.id);
            }}
            style={{
              padding: '10px 18px',
              border: 'none',
              borderBottom: activeModuleTab === tab.id ? '3px solid #059669' : '3px solid transparent',
              backgroundColor: activeModuleTab === tab.id ? '#ECFDF5' : 'transparent',
              color: activeModuleTab === tab.id ? '#059669' : '#475569',
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
            <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', backgroundColor: activeModuleTab === tab.id ? '#A7F3D0' : '#F1F5F9', color: activeModuleTab === tab.id ? '#065F46' : '#64748B' }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ================= SUBTAB 1: LISTINGS DATA TABLE ================= */}
      {activeModuleTab === 'listings' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          {/* Filters Bar */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
            <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '300px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="text"
                  placeholder="Search by business title, city, category..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }}
                />
              </div>
              <select
                value={selectedCategoryFilter}
                onChange={e => setSelectedCategoryFilter(e.target.value)}
                style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', backgroundColor: '#FFF', fontWeight: 600 }}
              >
                <option value="All">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select
                value={selectedStatusFilter}
                onChange={e => setSelectedStatusFilter(e.target.value)}
                style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', backgroundColor: '#FFF', fontWeight: 600 }}
              >
                <option value="All">All Statuses</option>
                <option value="Available">Available</option>
                <option value="Under_Review">Under Review</option>
                <option value="Sold">Sold</option>
                <option value="Unavailable">Unavailable</option>
              </select>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 700 }}>
              Showing {filteredBusinesses.length} of {businesses.length} Businesses
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '14px 20px', fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Business</th>
                  <th style={{ padding: '14px 20px', fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Category &amp; Structure</th>
                  <th style={{ padding: '14px 20px', fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Location</th>
                  <th style={{ padding: '14px 20px', fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Asking Price</th>
                  <th style={{ padding: '14px 20px', fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Assigned Broker</th>
                  <th style={{ padding: '14px 20px', fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '14px 20px', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBusinesses.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
                      <FaStore style={{ fontSize: '2.5rem', color: '#CBD5E1', marginBottom: '12px' }} />
                      <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0F172A' }}>No Businesses Found</div>
                      <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>Click "+ Add New Business" to create your first listing.</div>
                    </td>
                  </tr>
                ) : (
                  filteredBusinesses.map(biz => {
                    const currentBrokerId = biz.dealerId || biz.brokerId || (biz.assignedBrokerIds && biz.assignedBrokerIds[0]) || '';
                    const assignedD = findBroker(currentBrokerId);
                    return (
                      <tr key={biz.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }}>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <img
                              src={biz.image || (biz.images && biz.images[0]) || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='45' viewBox='0 0 60 45'%3E%3Crect fill='%23F1F5F9' width='60' height='45'/%3E%3Ctext fill='%2394A3B8' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='10'%3EBiz%3C/text%3E%3C/svg%3E"}
                              alt=""
                              style={{ width: '48px', height: '40px', objectFit: 'cover', borderRadius: '6px', backgroundColor: '#0F172A' }}
                            />
                            <div>
                              <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.88rem' }}>{biz.name || biz.title}</div>
                              <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{biz.id}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.82rem' }}>{biz.category || biz.industry || '-'}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{biz.businessType || '-'}</div>
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: '0.82rem', color: '#475569' }}>
                          {[biz.area, biz.city, biz.state].filter(Boolean).join(', ') || biz.location || '-'}
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ fontWeight: 800, color: '#059669', fontSize: '0.9rem' }}>
                            {biz.priceDisplay || (biz.price ? `₹${biz.price} Lakhs` : '-')}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <select
                              value={currentBrokerId}
                              onChange={(e) => {
                                const newBId = e.target.value;
                                const newBroker = findBroker(newBId);
                                updateBusiness(biz.id, {
                                  dealerId: newBId || undefined,
                                  brokerId: newBId || undefined,
                                  assignedBrokerIds: newBId ? [newBId] : [],
                                  agentName: newBroker ? (newBroker.companyName || newBroker.fullName || newBroker.name) : undefined,
                                  agentPhone: newBroker ? (newBroker.mobile || newBroker.phone || newBroker.contactNumber) : undefined,
                                });
                                showNotification(`Broker ${newBroker ? (newBroker.companyName || newBroker.fullName) : 'unassigned'} updated for ${biz.name || biz.title}`, 'success');
                              }}
                              style={{
                                padding: '6px 10px',
                                borderRadius: '8px',
                                border: '1.5px solid #CBD5E1',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                backgroundColor: currentBrokerId ? '#ECFDF5' : '#FFFFFF',
                                color: currentBrokerId ? '#065F46' : '#64748B',
                                cursor: 'pointer',
                                outline: 'none'
                              }}
                            >
                              <option value="">-- Direct / Unassigned --</option>
                              {availableDealers.map(d => (
                                <option key={d.id} value={d.id}>
                                  {d.companyName || d.fullName} — {d.city || 'AP/TS'}
                                </option>
                              ))}
                            </select>
                            {assignedD && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>
                                <span>⭐ {assignedD.rating || 4.8} • 📞 {assignedD.mobile || assignedD.phone || assignedD.contactNumber}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <select
                            value={(biz.sold || biz.status === 'Sold') ? 'Sold' : (biz.status || 'Available')}
                            onChange={(e) => {
                              const newStatus = e.target.value;
                              const isSold = newStatus === 'Sold';
                              updateBusiness(biz.id, {
                                status: newStatus,
                                sold: isSold,
                                recentlySold: isSold,
                                soldDate: isSold ? new Date().toISOString().slice(0, 10) : undefined,
                                badge: isSold ? 'RECENTLY ACQUIRED' : (biz.verified ? 'Verified' : undefined)
                              });
                              showNotification(
                                isSold
                                  ? `Business "${biz.name || biz.title}" marked as Sold, moved to Sold list, and pushed to Recently Sold showcase on main page.`
                                  : `Business status updated to ${newStatus}`,
                                'success'
                              );
                            }}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              backgroundColor: (biz.sold || biz.status === 'Sold') ? '#FEF2F2' : biz.status === 'Under_Review' ? '#FFFBEB' : '#ECFDF5',
                              color: (biz.sold || biz.status === 'Sold') ? '#DC2626' : biz.status === 'Under_Review' ? '#D97706' : '#059669',
                              border: (biz.sold || biz.status === 'Sold') ? '1.5px solid #FECACA' : biz.status === 'Under_Review' ? '1.5px solid #FDE68A' : '1.5px solid #A7F3D0',
                              cursor: 'pointer',
                              outline: 'none'
                            }}
                          >
                            <option value="Available">🟢 Available</option>
                            <option value="Under_Review">🟡 Under Review</option>
                            <option value="Sold">🏷️ Sold / Acquired</option>
                            <option value="Unavailable">⚪ Unavailable</option>
                          </select>
                        </td>
                        <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                            <button
                              onClick={() => openEditModal(biz)}
                              style={{ padding: '6px 10px', backgroundColor: '#F1F5F9', color: '#0F172A', border: 'none', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                              title="Edit Business"
                            >
                              <FaEdit /> Edit
                            </button>
                            <button
                              onClick={() => handleDuplicateBusiness(biz)}
                              style={{ padding: '6px 10px', backgroundColor: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                              title="Duplicate Business"
                            >
                              <FaCopy /> Duplicate
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete "${biz.name || biz.title}"?`)) {
                                  deleteBusiness(biz.id);
                                  showNotification('Business deleted successfully', 'success');
                                }
                              }}
                              style={{ padding: '6px 10px', backgroundColor: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                              title="Delete Business"
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

      {/* ================= SUBTAB: SOLD OUT / ACQUIRED BUSINESSES ================= */}
      {activeModuleTab === 'soldOut' && (
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', border: '1px solid #E2E8F0', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", margin: '0 0 6px 0', fontSize: '1.4rem', color: '#0F172A', fontWeight: 800 }}>
                🏷️ Sold Out &amp; Acquired Businesses
              </h2>
              <p style={{ color: '#64748B', margin: 0, fontSize: '0.88rem' }}>
                Manage businesses marked as Sold/Acquired. You can restore them back to active marketplace listings or push them to the Recently Sold / Closed Deals showcase on the main website.
              </p>
            </div>
            <div style={{ padding: '6px 14px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '20px', color: '#DC2626', fontWeight: 800, fontSize: '0.85rem' }}>
              {businesses.filter(b => b.sold || b.status === 'Sold').length} Sold Businesses
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '12px 16px' }}>Business Details</th>
                  <th style={{ padding: '12px 16px' }}>Category &amp; Type</th>
                  <th style={{ padding: '12px 16px' }}>Acquisition Price &amp; Location</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {businesses.filter(b => b.sold || b.status === 'Sold').map(biz => (
                  <tr key={biz.id} style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '64px', height: '48px', backgroundColor: '#E2E8F0', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                          <img src={biz.image || (biz.images && biz.images[0]) || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='45' viewBox='0 0 60 45'%3E%3Crect fill='%23F1F5F9' width='60' height='45'/%3E%3Ctext fill='%2394A3B8' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='10'%3EBiz%3C/text%3E%3C/svg%3E"} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.95rem' }}>{biz.name || biz.title}</div>
                          <div style={{ color: '#64748B', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                            <FaMapMarkerAlt style={{ color: '#94A3B8' }} /> {[biz.area, biz.city, biz.state].filter(Boolean).join(', ') || biz.location || 'AP/TS'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.88rem' }}>{biz.category || biz.industry || '-'}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{biz.businessType || '-'}</div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 800, color: '#059669', fontSize: '0.95rem' }}>{biz.priceDisplay || (biz.price ? `₹${biz.price} Lakhs` : '-')}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Sold on: {biz.soldDate || 'Recently'}</div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ padding: '5px 12px', backgroundColor: '#FEF2F2', color: '#DC2626', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, border: '1px solid #FECACA', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        🏷️ Sold Out / Acquired
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        {/* Option 1: Restore to Active Listings */}
                        <button
                          onClick={() => {
                            updateBusiness(biz.id, {
                              sold: false,
                              status: 'Available',
                              recentlySold: false,
                              badge: biz.verified ? 'Verified' : undefined
                            });
                            showNotification(`Business "${biz.name || biz.title}" restored back to Active Marketplace Listings!`, 'success');
                          }}
                          title="Restore business back to active listings on main page"
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#FFFFFF',
                            color: '#2563EB',
                            border: '1.5px solid #2563EB',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s'
                          }}
                        >
                          🔄 Restore to Active
                        </button>

                        {/* Option 2: Push to Recently Sold Showcase on Main Page */}
                        <button
                          onClick={() => {
                            const nextState = !biz.recentlySold;
                            updateBusiness(biz.id, {
                              recentlySold: nextState,
                              sold: true,
                              status: 'Sold',
                              badge: nextState ? 'RECENTLY ACQUIRED' : 'SOLD'
                            });
                            showNotification(
                              nextState
                                ? `Business "${biz.name || biz.title}" pushed to Recently Sold Showcase on main website!`
                                : `Business "${biz.name || biz.title}" removed from Recently Sold Showcase on main website.`,
                              'success'
                            );
                          }}
                          title={biz.recentlySold ? "Currently displayed under Recently Sold / Closed Deals on Main Website. Click to remove." : "Push to Recently Sold Showcase on Main Website"}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: biz.recentlySold ? '#ECFDF5' : '#059669',
                            color: biz.recentlySold ? '#059669' : '#FFFFFF',
                            border: biz.recentlySold ? '1.5px solid #6EE7B7' : 'none',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s',
                            boxShadow: biz.recentlySold ? 'none' : '0 2px 8px rgba(5, 150, 105, 0.25)'
                          }}
                        >
                          {biz.recentlySold ? '✓ Pushed to Main Page' : '🚀 Push to Main Page'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {businesses.filter(b => b.sold || b.status === 'Sold').length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '36px', textAlign: 'center', color: '#64748B', fontWeight: 600 }}>
                      No sold out businesses currently. When you mark any business as "Sold" in All Businesses or Edit Business, it will appear here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 2: SELLER ENQUIRIES CRM ================= */}
      {activeModuleTab === 'sellRequests' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.15rem', fontWeight: 800 }}>Business Sell Requests from Owners ({sellRequests.length})</h3>
          {sellRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>No seller requests submitted yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sellRequests.map(r => (
                <div key={r.id} style={{ padding: '16px', border: '1px solid #E2E8F0', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>{r.name} — {r.businessCategory}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>👤 {r.name} • 📞 {r.mobile} • ✉️ {r.email || 'N/A'} • 📍 {r.city}</div>
                    <div style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 700, marginTop: '4px' }}>Preferred Contact: {r.preferredContactMethod || 'Phone Call'}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      value={r.status || 'Pending'}
                      onChange={e => updateSellBusinessRequest(r.id, { status: e.target.value as any })}
                      style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.8rem', fontWeight: 700 }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                    <button
                      onClick={() => deleteSellBusinessRequest(r.id)}
                      style={{ padding: '6px 10px', backgroundColor: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= SUBTAB 3: BUYER ENQUIRIES ================= */}
      {activeModuleTab === 'enquiries' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.15rem', fontWeight: 800 }}>Buyer Deal Enquiries ({buyEnquiries.length})</h3>
          {buyEnquiries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>No buyer enquiries submitted yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {buyEnquiries.map(e => (
                <div key={e.id} style={{ padding: '16px', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                  <div style={{ fontWeight: 800, color: '#0F172A' }}>{e.name} <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#059669' }}>({e.businessName})</span></div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>📞 {e.mobile} • ✉️ {e.email}</div>
                  <div style={{ fontSize: '0.85rem', color: '#334155', marginTop: '6px' }}>{e.message}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= SUBTAB 4: CATEGORY MASTER ================= */}
      {activeModuleTab === 'categories' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.15rem', fontWeight: 800 }}>Industry Category Master</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
            {categories.map((c, i) => (
              <div key={i} style={{ padding: '14px 16px', border: '1px solid #E2E8F0', borderRadius: '10px', backgroundColor: '#F8FAFC', fontWeight: 700, fontSize: '0.9rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaBriefcase style={{ color: '#059669' }} /> {c}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= SUBTAB 5: LEGAL STRUCTURE MASTER ================= */}
      {activeModuleTab === 'types' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.15rem', fontWeight: 800 }}>Legal Structure &amp; Business Types Master</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {businessTypes.map((t, i) => (
              <div key={i} style={{ padding: '14px 16px', border: '1px solid #E2E8F0', borderRadius: '10px', backgroundColor: '#F8FAFC', fontWeight: 700, fontSize: '0.9rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaBuilding style={{ color: '#059669' }} /> {t}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6-STEP PROPERTY-GRADE ADD / EDIT BUSINESS MODAL (100% ZERO-DEFAULTS)     */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div data-lenis-prevent="true" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.82)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '24px' }}>
          <div style={{ backgroundColor: '#F8FAFC', width: '100%', maxWidth: '1280px', maxHeight: '92vh', display: 'flex', flexDirection: 'column', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)', border: '1px solid #E2E8F0' }}>
            
            {/* Modal Header */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '24px 32px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', color: '#059669', flexShrink: 0 }}>
                  <FaStore />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#0F172A' }}>
                      {modalMode === 'add' ? 'Add New Business Listing' : modalMode === 'edit' ? 'Edit Business Listing' : 'Duplicate Business Listing'}
                    </h3>
                    <span style={{ backgroundColor: '#F1F5F9', color: '#475569', padding: '4px 14px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 700 }}>
                      {formData.id || 'BIZ-NEW'}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: '#F1F5F9', border: 'none', color: '#64748B', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', cursor: 'pointer' }} title="Close">×</button>
            </div>

            {/* Stepper Bar (6 Steps) */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '18px 36px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, overflowX: 'auto' }}>
              {[
                { id: 'location', num: 1, label: 'Location', sub: 'Set business address' },
                { id: 'basic', num: 2, label: 'Basic Details', sub: 'Category & structure' },
                { id: 'specs', num: 3, label: 'Specifications', sub: 'Staff & operations' },
                { id: 'pricing', num: 4, label: 'Pricing', sub: 'Asking price & financials' },
                { id: 'media', num: 5, label: 'Media', sub: 'Photos & gallery' },
                { id: 'review', num: 6, label: 'Assign Broker', sub: 'Broker CRM & publish' }
              ].map((step, idx, arr) => {
                const isActive = modalSubTab === step.id;
                const isCompleted = arr.findIndex(x => x.id === modalSubTab) > idx;
                return (
                  <React.Fragment key={step.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setModalSubTab(step.id as any);
                      }}
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
                      <div style={{ flexGrow: 1, height: '1.5px', backgroundColor: isCompleted ? '#059669' : '#E2E8F0', minWidth: '24px', margin: '0 16px' }} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Modal Body Container */}
            <form onSubmit={handleSaveBusiness} style={{ padding: '28px 36px', overflowY: 'auto', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              
              {/* ================= STEP 1: LOCATION ================= */}
              {modalSubTab === 'location' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 1fr)', gap: '24px', alignItems: 'stretch' }}>
                    
                    {/* Left Column: Location Details */}
                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669', margin: 0 }}>1. Business Location</h4>
                        <p style={{ color: '#64748B', fontSize: '0.88rem', margin: '4px 0 20px 0' }}>Search and select the exact location of your operational business</p>

                        {/* Search Bar Row */}
                        <div style={{ position: 'relative' }}>
                          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '8px' }}>Search Business Address</label>
                          <div style={{ display: 'flex', gap: '12px' }}>
                            <div style={{ flexGrow: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                              <FaMapMarkerAlt style={{ position: 'absolute', left: '16px', color: '#059669', fontSize: '1.1rem' }} />
                              <input
                                type="text"
                                value={addressSearchQuery || formData.fullAddress || ''}
                                onChange={e => {
                                  setAddressSearchQuery(e.target.value);
                                  setShowLocationSuggestions(true);
                                }}
                                onFocus={() => setShowLocationSuggestions(true)}
                                placeholder="e.g. Jubilee Hills, Road No 36, Hyderabad / Guntur Market, AP"
                                style={{ width: '100%', padding: '12px 40px 12px 44px', border: '1.5px solid #059669', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 600, color: '#0F172A', outline: 'none', boxSizing: 'border-box' }}
                              />
                              {(addressSearchQuery || formData.fullAddress) && (
                                <button type="button" onClick={() => { setAddressSearchQuery(''); setFormData({ ...formData, fullAddress: '', location: '', city: '', state: '', district: '', area: '', subLocation: '', landmark: '', pincode: '', postal_code: '' }); }} style={{ position: 'absolute', right: '14px', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '1.1rem', padding: '2px' }}>×</button>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={handleAdminDetectGPS}
                              disabled={isAdminDetectingGPS}
                              style={{ padding: '12px 22px', backgroundColor: '#059669', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
                            >
                              <FaCrosshairs /> {isAdminDetectingGPS ? 'Detecting...' : 'Detect My Location'}
                            </button>
                          </div>

                          {/* Autocomplete Suggestions Dropdown */}
                          {showLocationSuggestions && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '16px', boxShadow: '0 12px 32px rgba(15, 23, 42, 0.18)', marginTop: '8px', maxHeight: '340px', overflowY: 'auto' }}>
                              
                              {/* GPS Button in Dropdown */}
                              <div
                                onClick={handleAdminDetectGPS}
                                style={{ padding: '14px 18px', borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
                              >
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', flexShrink: 0 }}>
                                  <FaCrosshairs />
                                </div>
                                <div>
                                  <div style={{ fontWeight: 800, color: '#059669', fontSize: '0.9rem' }}>Use Current Location (GPS)</div>
                                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Auto-detect coordinates &amp; address</div>
                                </div>
                              </div>

                              {/* Popular Cities Chips */}
                              {(!addressSearchQuery || addressSearchQuery.trim().length < 2) && (
                                <div style={{ padding: '14px 18px', borderBottom: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
                                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '10px' }}>Popular Cities &amp; Hubs</div>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {['Hyderabad', 'Guntur', 'Vijayawada', 'Visakhapatnam', 'Amaravati', 'Bangalore', 'Chennai'].map(cName => {
                                      const foundPlace = COMPREHENSIVE_INDIA_PLACES_DB.find(p => p.city.toLowerCase().includes(cName.toLowerCase()) || p.area.toLowerCase().includes(cName.toLowerCase()));
                                      return (
                                        <button
                                          key={cName}
                                          type="button"
                                          onClick={() => {
                                            if (foundPlace) handleSelectGooglePlace(foundPlace);
                                            else setAddressSearchQuery(cName);
                                          }}
                                          style={{ padding: '6px 14px', backgroundColor: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 700, color: '#334155', cursor: 'pointer' }}
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
                                  <FaSearch />
                                  <span>Searching live places database...</span>
                                </div>
                              )}

                              {liveSuggestions.map((place, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => handleSelectGooglePlace(place)}
                                  style={{ padding: '14px 18px', borderBottom: '1px solid #E2E8F0', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flexGrow: 1 }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', flexShrink: 0, marginTop: '2px' }}>
                                      <FaMapMarkerAlt />
                                    </div>
                                    <div>
                                      <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.92rem' }}>{place.area || place.city}</div>
                                      <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>{place.formatted_address || `${place.city}, ${place.state}`}</div>
                                    </div>
                                  </div>
                                  <div style={{ flexShrink: 0, textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#059669', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', padding: '3px 8px', borderRadius: '6px' }}>
                                      📍 {place.latitude?.toFixed(4)}, {place.longitude?.toFixed(4)}
                                    </div>
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
                                  <span style={{ fontSize: '0.75rem', backgroundColor: '#059669', color: '#FFFFFF', padding: '2px 8px', borderRadius: '4px' }}>Live Geocode</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Location Details (Auto-Geocoded & Manual Entry) */}
                        <h5 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#059669', margin: '24px 0 14px 0' }}>Location Details (Auto-Geocoded &amp; Manual Entry)</h5>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '12px 16px' }}>
                            <label style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, display: 'block', marginBottom: '2px' }}>Country</label>
                            <input 
                              type="text" 
                              value="India" 
                              readOnly 
                              style={{ width: '100%', padding: '4px 0', border: 'none', backgroundColor: 'transparent', fontSize: '0.92rem', color: '#0F172A', fontWeight: 800, outline: 'none' }} 
                            />
                          </div>

                          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '12px 16px' }}>
                            <label style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, display: 'block', marginBottom: '2px' }}>State</label>
                            <input 
                              type="text" 
                              value={formData.state || ''} 
                              onChange={e => setFormData({ ...formData, state: e.target.value })} 
                              placeholder="Enter State" 
                              style={{ width: '100%', padding: '4px 0', border: 'none', borderBottom: '1px solid #CBD5E1', backgroundColor: 'transparent', fontSize: '0.92rem', color: '#0F172A', fontWeight: 800, outline: 'none' }} 
                            />
                          </div>

                          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '12px 16px' }}>
                            <label style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, display: 'block', marginBottom: '2px' }}>District</label>
                            <input 
                              type="text" 
                              value={formData.district || ''} 
                              onChange={e => setFormData({ ...formData, district: e.target.value })} 
                              placeholder="Enter District" 
                              style={{ width: '100%', padding: '4px 0', border: 'none', borderBottom: '1px solid #CBD5E1', backgroundColor: 'transparent', fontSize: '0.92rem', color: '#0F172A', fontWeight: 800, outline: 'none' }} 
                            />
                          </div>

                          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '12px 16px' }}>
                            <label style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, display: 'block', marginBottom: '2px' }}>City <span style={{ color: '#EF4444' }}>*</span></label>
                            <input 
                              type="text" 
                              value={formData.city || ''} 
                              onChange={e => setFormData({ ...formData, city: e.target.value })} 
                              placeholder="Enter City" 
                              style={{ width: '100%', padding: '4px 0', border: 'none', borderBottom: '1.5px solid #059669', backgroundColor: 'transparent', fontSize: '0.92rem', color: '#0F172A', fontWeight: 800, outline: 'none' }} 
                            />
                          </div>

                          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '12px 16px' }}>
                            <label style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, display: 'block', marginBottom: '2px' }}>Area / Locality</label>
                            <input 
                              type="text" 
                              value={formData.area || ''} 
                              onChange={e => setFormData({ ...formData, area: e.target.value })} 
                              placeholder="Enter Area" 
                              style={{ width: '100%', padding: '4px 0', border: 'none', borderBottom: '1px solid #CBD5E1', backgroundColor: 'transparent', fontSize: '0.92rem', color: '#0F172A', fontWeight: 800, outline: 'none' }} 
                            />
                          </div>

                          <div style={{ backgroundColor: '#ECFDF5', border: '1.5px solid #A7F3D0', borderRadius: '14px', padding: '12px 16px' }}>
                            <label style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 800, display: 'block', marginBottom: '2px', textTransform: 'uppercase' }}>Sub-Location / Landmark (Manual Entry)</label>
                            <input 
                              type="text" 
                              value={formData.subLocation || formData.landmark || ''} 
                              onChange={e => setFormData({ ...formData, subLocation: e.target.value, landmark: e.target.value })} 
                              placeholder="e.g. Near Metro Station / Main Road" 
                              style={{ width: '100%', padding: '4px 0', border: 'none', borderBottom: '1.5px solid #059669', backgroundColor: 'transparent', fontSize: '0.92rem', color: '#064E3B', fontWeight: 800, outline: 'none' }} 
                            />
                          </div>

                          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '12px 16px' }}>
                            <label style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, display: 'block', marginBottom: '2px' }}>Postal Code (Pincode)</label>
                            <input 
                              type="text" 
                              value={formData.pincode || formData.postal_code || ''} 
                              onChange={e => setFormData({ ...formData, pincode: e.target.value, postal_code: e.target.value })} 
                              placeholder="Enter Pincode" 
                              style={{ width: '100%', padding: '4px 0', border: 'none', borderBottom: '1px solid #CBD5E1', backgroundColor: 'transparent', fontSize: '0.92rem', color: '#0F172A', fontWeight: 800, outline: 'none' }} 
                            />
                          </div>
                        </div>

                        {/* Coordinates Badges */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '12px' }}>
                          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaCrosshairs style={{ color: '#059669' }} />
                            <div style={{ fontSize: '0.8rem', color: '#0F172A', fontWeight: 800 }}>
                              Lat: {formData.latitude?.toFixed(6) || '-'}
                            </div>
                          </div>
                          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaCompass style={{ color: '#059669' }} />
                            <div style={{ fontSize: '0.8rem', color: '#0F172A', fontWeight: 800 }}>
                              Lng: {formData.longitude?.toFixed(6) || '-'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Full Formatted Address Box */}
                      <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '14px 18px', marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, display: 'block', marginBottom: '2px' }}>Full Formatted Address</span>
                          <span style={{ fontSize: '0.88rem', color: '#0F172A', fontWeight: 700 }}>{formData.fullAddress || [formData.area, formData.city, formData.state].filter(Boolean).join(', ') || '-'}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(formData.fullAddress || '');
                            showNotification('Address copied to clipboard!', 'success');
                          }}
                          style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '1.1rem' }}
                        >
                          <FaCopy />
                        </button>
                      </div>
                    </div>

                    {/* Right Column: Location Map Preview */}
                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669', margin: 0 }}>Location Preview</h4>
                            <p style={{ color: '#64748B', fontSize: '0.88rem', margin: '4px 0 0 0' }}>Drag the marker to fine-tune the exact business location</p>
                          </div>
                          <a
                            href={`https://maps.google.com/?q=${mapMarkerPos.lat},${mapMarkerPos.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ padding: '8px 16px', backgroundColor: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
                          >
                            Open in Google Maps <FaExternalLinkAlt style={{ fontSize: '0.75rem' }} />
                          </a>
                        </div>

                        {/* Interactive Map Box */}
                        <div style={{ marginTop: '20px', height: '380px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                          <LocationPickerMap
                            latitude={mapMarkerPos.lat}
                            longitude={mapMarkerPos.lng}
                            onChange={handleMarkerDrag}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= STEP 2: BASIC DETAILS ================= */}
              {modalSubTab === 'basic' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                  <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '28px' }}>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#059669', margin: '0 0 16px 0' }}>2. Basic Business Information</h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {/* Business Title */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>
                          Business Title / Brand Name <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <input
                          required
                          type="text"
                          value={formData.title || ''}
                          onChange={e => setFormData({ ...formData, title: e.target.value, name: e.target.value })}
                          placeholder="e.g. Specialty Coffee Roastery & Café"
                          style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1.5px solid #CBD5E1', outline: 'none', fontSize: '0.92rem', fontWeight: 700, boxSizing: 'border-box' }}
                        />
                      </div>

                      {/* Category & Legal Structure */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>
                            Industry Category <span style={{ color: '#EF4444' }}>*</span>
                          </label>
                          <select
                            value={formData.category || ''}
                            onChange={e => setFormData({ ...formData, category: e.target.value, industry: e.target.value })}
                            style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1.5px solid #CBD5E1', outline: 'none', fontSize: '0.9rem', backgroundColor: '#FFF', fontWeight: 600, boxSizing: 'border-box' }}
                          >
                            <option value="">-- Select Industry Category --</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>
                            Legal Structure / Business Type <span style={{ color: '#EF4444' }}>*</span>
                          </label>
                          <select
                            value={formData.businessType || ''}
                            onChange={e => setFormData({ ...formData, businessType: e.target.value })}
                            style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1.5px solid #CBD5E1', outline: 'none', fontSize: '0.9rem', backgroundColor: '#FFF', fontWeight: 600, boxSizing: 'border-box' }}
                          >
                            <option value="">-- Select Legal Structure --</option>
                            {businessTypes.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                      </div>

                      {/* Listing Status */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>
                          Listing Status
                        </label>
                        <select
                          value={formData.status || 'Available'}
                          onChange={e => setFormData({ ...formData, status: e.target.value })}
                          style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1.5px solid #CBD5E1', outline: 'none', fontSize: '0.9rem', backgroundColor: '#FFF', fontWeight: 600, boxSizing: 'border-box' }}
                        >
                          <option value="Available">Available (Active for Sale)</option>
                          <option value="Under_Review">Under Review</option>
                          <option value="Sold">Sold / Transferred</option>
                          <option value="Unavailable">Unavailable / Inactive</option>
                        </select>
                      </div>

                      {/* Description */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>
                          Comprehensive Business Description
                        </label>
                        <textarea
                          rows={5}
                          value={formData.description || ''}
                          onChange={e => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Describe the operational setup, loyal customer base, assets included, equipment, vendor tie-ups, growth potential..."
                          style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1.5px solid #CBD5E1', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box', lineHeight: '1.5' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= STEP 3: SPECIFICATIONS ================= */}
              {modalSubTab === 'specs' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                  <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '28px' }}>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#059669', margin: '0 0 16px 0' }}>3. Operations &amp; Team Details</h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>
                          Established Year (Optional)
                        </label>
                        <input
                          type="number"
                          value={formData.establishedYear !== undefined && formData.establishedYear !== null ? formData.establishedYear : ''}
                          onChange={e => setFormData({ ...formData, establishedYear: e.target.value === '' ? ('' as any) : parseInt(e.target.value) })}
                          placeholder="e.g. 2019"
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', outline: 'none', fontSize: '0.88rem', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>
                          Employees / Staff Count (Optional)
                        </label>
                        <input
                          type="number"
                          value={formData.employeesCount !== undefined && formData.employeesCount !== null ? formData.employeesCount : ''}
                          onChange={e => setFormData({ ...formData, employeesCount: e.target.value === '' ? ('' as any) : parseInt(e.target.value) })}
                          placeholder="e.g. 8"
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', outline: 'none', fontSize: '0.88rem', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>
                          Reason for Sale (Optional)
                        </label>
                        <input
                          type="text"
                          value={formData.reasonForSale || ''}
                          onChange={e => setFormData({ ...formData, reasonForSale: e.target.value })}
                          placeholder="e.g. Owner relocating overseas / Focusing on core business"
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', outline: 'none', fontSize: '0.88rem', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>
                          Seller Profile / Representative (Optional)
                        </label>
                        <input
                          type="text"
                          value={formData.sellerProfile || ''}
                          onChange={e => setFormData({ ...formData, sellerProfile: e.target.value })}
                          placeholder="e.g. Founder & Managing Director"
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', outline: 'none', fontSize: '0.88rem', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= STEP 4: PRICING & FINANCIALS ================= */}
              {modalSubTab === 'pricing' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                  <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '28px' }}>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#059669', margin: '0 0 16px 0' }}>4. Valuation &amp; Financial Disclosures</h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      {/* Asking Price with Unit Selector */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>
                          Asking Price <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <input
                            required
                            type="number"
                            step="any"
                            value={formData.askingPrice !== undefined && formData.askingPrice !== null ? formData.askingPrice : ''}
                            onChange={e => setFormData({ ...formData, askingPrice: e.target.value === '' ? ('' as any) : parseFloat(e.target.value) })}
                            placeholder="e.g. 50"
                            style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', outline: 'none', fontSize: '0.9rem', fontWeight: 700 }}
                          />
                          <select
                            value={priceUnit}
                            onChange={e => setPriceUnit(e.target.value as any)}
                            style={{ padding: '10px 8px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.82rem', fontWeight: 700, backgroundColor: '#F8FAFC', cursor: 'pointer' }}
                          >
                            <option value="Thousands">Thousand</option>
                            <option value="Lakhs">Lakhs</option>
                            <option value="Crores">Crores</option>
                          </select>
                        </div>
                      </div>

                      {/* Price Display Label */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>
                          Price Display Label
                        </label>
                        <input
                          type="text"
                          value={formData.priceDisplay || ''}
                          onChange={e => setFormData({ ...formData, priceDisplay: e.target.value })}
                          placeholder="e.g. ₹50 Lakhs (Negotiable)"
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', outline: 'none', fontSize: '0.88rem', boxSizing: 'border-box' }}
                        />
                      </div>

                      {/* Monthly Revenue */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>
                          Monthly Revenue (Optional)
                        </label>
                        <input
                          type="text"
                          value={formData.revenueMonthly || ''}
                          onChange={e => setFormData({ ...formData, revenueMonthly: e.target.value })}
                          placeholder="e.g. ₹3.5 Lakhs/mo"
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', outline: 'none', fontSize: '0.88rem', boxSizing: 'border-box' }}
                        />
                      </div>

                      {/* Monthly Profit */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>
                          Monthly Profit / Margin (Optional)
                        </label>
                        <input
                          type="text"
                          value={formData.profitMonthly || ''}
                          onChange={e => setFormData({ ...formData, profitMonthly: e.target.value })}
                          placeholder="e.g. ₹85,000/mo or 25% Net"
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', outline: 'none', fontSize: '0.88rem', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= STEP 5: MEDIA ================= */}
              {modalSubTab === 'media' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                  <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '28px' }}>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#059669', margin: '0 0 16px 0' }}>5. Business Media &amp; Gallery Photos</h4>
                    
                    {/* Drag and Drop Zone */}
                    <div
                      onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={e => { e.preventDefault(); setIsDragging(false); handlePhotoFiles(e.dataTransfer.files); }}
                      style={{
                        border: isDragging ? '2px dashed #059669' : '2px dashed #CBD5E1',
                        borderRadius: '12px',
                        padding: '36px 20px',
                        textAlign: 'center',
                        backgroundColor: isDragging ? '#ECFDF5' : '#F8FAFC',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        marginBottom: '20px'
                      }}
                      onClick={() => document.getElementById('bizPhotoInput')?.click()}
                    >
                      <input
                        id="bizPhotoInput"
                        type="file"
                        multiple
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={e => handlePhotoFiles(e.target.files)}
                      />
                      <FaCamera style={{ fontSize: '2.4rem', color: '#059669', marginBottom: '10px' }} />
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>
                        Click to upload photos or drag &amp; drop files here
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '4px' }}>
                        PNG, JPG, WebP images of your store, interior, kitchen or assets
                      </div>
                    </div>

                    {/* Direct Image URL input */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                      <input
                        type="url"
                        value={newPhotoUrl}
                        onChange={e => setNewPhotoUrl(e.target.value)}
                        placeholder="Paste image URL directly (e.g. https://...)"
                        style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', outline: 'none', fontSize: '0.88rem' }}
                      />
                      <button
                        type="button"
                        onClick={handleAddPhotoUrl}
                        style={{ padding: '10px 18px', backgroundColor: '#059669', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                      >
                        Add URL
                      </button>
                    </div>

                    {/* Photos Preview Gallery */}
                    {uploadedPhotos.length > 0 && (
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '10px' }}>
                          Uploaded Photos ({uploadedPhotos.length}) - 1st image is Cover Photo
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
                          {uploadedPhotos.map((imgUrl, idx) => (
                            <div key={idx} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', height: '90px', border: idx === 0 ? '2px solid #059669' : '1px solid #E2E8F0' }}>
                              <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              {idx === 0 && (
                                <span style={{ position: 'absolute', top: '4px', left: '4px', backgroundColor: '#059669', color: '#FFF', fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                                  COVER
                                </span>
                              )}
                              <div style={{ position: 'absolute', top: '4px', right: '4px', display: 'flex', gap: '4px' }}>
                                {idx !== 0 && (
                                  <button
                                    type="button"
                                    onClick={() => handleSetPrimaryPhoto(idx)}
                                    title="Set as Cover Photo"
                                    style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#FFFFFF', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '10px', color: '#059669' }}
                                  >
                                    ★
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleRemovePhoto(idx)}
                                  title="Delete Photo"
                                  style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#FEF2F2', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '10px', color: '#DC2626' }}
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ================= STEP 6: ASSIGN BROKER & REVIEW ================= */}
              {modalSubTab === 'review' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                  <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '28px' }}>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#059669', margin: '0 0 16px 0' }}>6. Assign Verified Broker &amp; Publishing Options</h4>
                    
                    {/* Broker Selector Dropdown */}
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Assigned Partner Broker (CRM Account)
                      </label>
                      <select
                        value={formData.dealerId || ''}
                        onChange={e => {
                          const did = e.target.value;
                          const foundD = findBroker(did);
                          setFormData({
                            ...formData,
                            dealerId: did,
                            brokerId: did,
                            agentName: foundD ? (foundD.companyName || foundD.fullName || foundD.name) : '',
                            agentPhone: foundD ? (foundD.mobile || foundD.phone || foundD.contactNumber) : '',
                            assignedBrokerIds: did ? [did] : []
                          });
                        }}
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1.5px solid #CBD5E1', outline: 'none', fontSize: '0.9rem', backgroundColor: '#FFF', fontWeight: 600, boxSizing: 'border-box' }}
                      >
                        <option value="">-- No Broker Assigned (Direct NexOpp Listing) --</option>
                        {availableDealers.map(d => (
                          <option key={d.id} value={d.id}>
                            {d.companyName || d.fullName} — {d.city || 'AP/TS'} ({d.mobile || d.phone || 'Verified'})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Visual Broker Selection Cards Grid */}
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '10px' }}>
                        Select from Verified Partner Brokers
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                        {availableDealers.map(d => {
                          const isSelected = formData.dealerId?.toLowerCase() === d.id.toLowerCase();
                          return (
                            <div
                              key={d.id}
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  dealerId: d.id,
                                  brokerId: d.id,
                                  agentName: d.companyName || d.fullName || d.name,
                                  agentPhone: d.mobile || d.phone || d.contactNumber,
                                  assignedBrokerIds: [d.id]
                                });
                              }}
                              style={{
                                border: isSelected ? '2px solid #059669' : '1px solid #E2E8F0',
                                backgroundColor: isSelected ? '#ECFDF5' : '#FFFFFF',
                                borderRadius: '12px',
                                padding: '14px',
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                                boxShadow: isSelected ? '0 4px 12px rgba(5, 150, 105, 0.15)' : 'none'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {d.photo || d.logo ? (
                                  <img src={d.photo || d.logo} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                                ) : (
                                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#F1F5F9', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FaUserTie />
                                  </div>
                                )}
                                <div style={{ overflow: 'hidden' }}>
                                  <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {d.companyName || d.fullName}
                                  </div>
                                  <div style={{ fontSize: '0.72rem', color: '#64748B' }}>📍 {d.city || 'AP/TS'}</div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', marginTop: '4px' }}>
                                <span style={{ color: '#059669', fontWeight: 700 }}>⭐ {d.rating || 4.8}</span>
                                <span style={{
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  fontSize: '0.72rem',
                                  fontWeight: 800,
                                  backgroundColor: isSelected ? '#059669' : '#F1F5F9',
                                  color: isSelected ? '#FFFFFF' : '#475569'
                                }}>
                                  {isSelected ? '✓ Assigned' : 'Assign'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Broker Profile Card Preview */}
                    {assignedBroker && (
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                        {assignedBroker.photo || assignedBroker.logo ? (
                          <img src={assignedBroker.photo || assignedBroker.logo} alt="" style={{ width: '54px', height: '54px', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '54px', height: '54px', borderRadius: '50%', backgroundColor: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                            <FaUserTie />
                          </div>
                        )}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>{assignedBroker.companyName || assignedBroker.fullName}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>
                            📞 {assignedBroker.mobile || assignedBroker.phone || assignedBroker.contactNumber || 'N/A'} • ✉️ {assignedBroker.email || 'N/A'}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 700, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FaShieldAlt /> Verified Partner Broker • ⭐ {assignedBroker.rating || 4.8} Rating
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Visibility & Badges Toggles */}
                    <div style={{ display: 'flex', gap: '24px', padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }}>
                        <input
                          type="checkbox"
                          checked={formData.published !== false}
                          onChange={e => setFormData({ ...formData, published: e.target.checked })}
                          style={{ width: '18px', height: '18px', accentColor: '#059669' }}
                        />
                        <span>Published on Marketplace</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, color: '#D97706' }}>
                        <input
                          type="checkbox"
                          checked={!!formData.featured}
                          onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                          style={{ width: '18px', height: '18px', accentColor: '#D97706' }}
                        />
                        <span>Featured Opportunity</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer Navigation */}
              <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '10px 20px', backgroundColor: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>

                <div style={{ display: 'flex', gap: '12px' }}>
                  {currentStepIndex > 0 && (
                    <button
                      type="button"
                      onClick={goPrevStep}
                      style={{ padding: '10px 20px', backgroundColor: '#FFFFFF', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '8px', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}
                    >
                      ← Previous Step
                    </button>
                  )}

                  {currentStepIndex < stepOrder.length - 1 ? (
                    <>
                      {formData.title?.trim() && (
                        <button
                          type="submit"
                          disabled={isSaving}
                          style={{ padding: '10px 20px', backgroundColor: '#FFFFFF', color: '#059669', border: '1.5px solid #059669', borderRadius: '8px', fontWeight: 800, fontSize: '0.88rem', cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.65 : 1 }}
                        >
                          {isSaving ? 'Saving...' : 'Save Business Now'}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={goNextStep}
                        style={{ padding: '10px 24px', backgroundColor: '#059669', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', boxShadow: '0 2px 6px rgba(5,150,105,0.2)' }}
                      >
                        Next Step →
                      </button>
                    </>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSaving}
                      style={{ padding: '10px 28px', backgroundColor: '#059669', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: 800, fontSize: '0.92rem', cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.75 : 1, boxShadow: '0 2px 8px rgba(5,150,105,0.3)' }}
                    >
                      {isSaving ? 'Saving...' : (modalMode === 'add' ? 'Save & Publish Business' : 'Update Business')}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessManagementSystem;
