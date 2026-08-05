import React, { useState, useMemo, useEffect } from 'react';
import { businessDb } from '../db/marketplaceDb';
import {
  FaSearch,
  FaMapMarkerAlt,
  FaBriefcase,
  FaUtensils,
  FaShoppingBag,
  FaMedkit,
  FaIndustry,
  FaHeart,
  FaRegHeart,
  FaStar,
  FaCheckCircle,
  FaCrown,
  FaFire,
  FaList,
  FaMap,
  FaColumns,
  FaChevronDown,
  FaChevronUp,
  FaCrosshairs,
  FaPlus,
  FaMinus,
  FaExpand,
  FaChartLine,
  FaUsers,
  FaDollarSign,
  FaBalanceScale,
} from 'react-icons/fa';
import { LiveLocationMap } from './ui/LiveLocationMap';

interface BusinessMarketplaceProps {
  onExploreCategory?: (category: any) => void;
  onPropertyClick?: (id: string) => void;
  onBuyProperty?: (id: string) => void;
  title?: string;
  subtitle?: string;
  onBack?: () => void;
}

export const BusinessMarketplace: React.FC<BusinessMarketplaceProps> = ({
  onPropertyClick,
  onBuyProperty,
  title,
  subtitle,
  onBack,
}) => {
  // Top Search Card State
  const [activeTab, setActiveTab] = useState<'All' | 'Food' | 'Healthcare' | 'Retail' | 'Manufacturing'>('All');
  const [locationText, setLocationText] = useState('Hyderabad & Andhra Pradesh');
  const [industry, setIndustry] = useState('All Industries');
  const [valuation, setValuation] = useState('₹ 20L - 10Cr+');
  const [revenue, setRevenue] = useState('Any Revenue');

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const loc = searchParams.get('location');
    const type = searchParams.get('type');
    const bgt = searchParams.get('budget');
    
    if (loc) {
      setLocationText(loc);
    }
    if (type && type !== 'Any') {
      setIndustry(type);
      setSelectedInds([type]);
    }
    if (bgt && bgt !== 'Any') {
      setValuation(bgt);
    }
  }, []);

  // Left Sidebar Filters State
  const [valOpen, setValOpen] = useState(true);
  const [indOpen, setIndOpen] = useState(true);
  const [profOpen, setProfOpen] = useState(true);
  const [ageOpen, setAgeOpen] = useState(false);

  const [selectedInds, setSelectedInds] = useState<string[]>([]);
  const [selectedProfs, setSelectedProfs] = useState<string[]>([]);

  // Right Results State
  const [viewMode, setViewMode] = useState<'list' | 'map' | 'split'>('list');
  const [sortBy, setSortBy] = useState('Relevance');
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null);
  const [wishlisted, setWishlisted] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlisted((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleInd = (val: string) => {
    setSelectedInds((prev) =>
      prev.includes(val) ? prev.filter((item) => item !== val) : [...prev, val]
    );
  };

  const toggleProf = (val: string) => {
    setSelectedProfs((prev) =>
      prev.includes(val) ? prev.filter((item) => item !== val) : [...prev, val]
    );
  };

  const clearAllFilters = () => {
    setSelectedInds([]);
    setSelectedProfs([]);
    setActiveQuickFilter(null);
    setIndustry('All Industries');
    setValuation('₹ 20L - 10Cr+');
    setRevenue('Any Revenue');
  };

  const businessesList = useMemo(() => {
    const list = businessDb.map((b) => ({
      id: b.id,
      title: b.name || 'Business For Sale',
      industry: b.industry || 'Food & Dining',
      badge: b.verified ? 'Verified Seller' : (b.trending ? 'Profitable Now' : 'Great Deal'),
      badgeType: b.verified ? 'verified' : (b.trending ? 'profit' : 'deal'),
      image: b.image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
      valuation: b.priceDisplay || (`₹ ${b.price || 50} Lac`),
      revenue: b.revenueMonthly || b.revenue || '₹ 10 L / month',
      margin: b.profitMonthly || '20% Net Profit',
      employees: b.employeesCount ? `${b.employeesCount} Staff` : '10 Staff',
      location: `${b.city || ''}${b.state ? ', ' + b.state : ''}`,
      brokerName: 'Karan Sharma',
      brokerRating: b.rating ? `${b.rating} (${b.reviewCount || 10})` : '4.9 (24)',
      brokerImg: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      latitude: b.latitude,
      longitude: b.longitude,
      city: b.city,
      locality: b.location,
    }));

    return list.filter((item) => {
      if (activeTab !== 'All') {
        if (activeTab === 'Food' && item.industry !== 'Food & Dining') return false;
        if (activeTab === 'Healthcare' && item.industry !== 'Healthcare') return false;
        if (activeTab === 'Retail' && item.industry !== 'Retail & Stores') return false;
        if (activeTab === 'Manufacturing' && item.industry !== 'Manufacturing & Industrial') return false;
      }
      if (selectedInds.length > 0 && !selectedInds.includes(item.industry)) return false;
      if (activeQuickFilter) {
        if (activeQuickFilter === 'Verified Sellers' && item.badgeType !== 'verified') return false;
        if (activeQuickFilter === 'Profitable Now' && item.badgeType !== 'profit') return false;
        if (activeQuickFilter === 'Distress Sale / Great Deal' && item.badgeType !== 'deal') return false;
      }
      return true;
    });
  }, [businessDb, activeTab, selectedInds, activeQuickFilter]);

  const totalPages = Math.ceil(businessesList.length / itemsPerPage);
  const validPage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));
  const paginatedBusinesses = useMemo(() => {
    const start = (validPage - 1) * itemsPerPage;
    return businessesList.slice(start, start + itemsPerPage);
  }, [businessesList, validPage, itemsPerPage]);

  const tabs = [
    { id: 'All' as const, label: 'All Businesses', icon: FaBriefcase },
    { id: 'Food' as const, label: 'Food & Dining', icon: FaUtensils },
    { id: 'Healthcare' as const, label: 'Healthcare & Clinics', icon: FaMedkit },
    { id: 'Retail' as const, label: 'Retail & Stores', icon: FaShoppingBag },
    { id: 'Manufacturing' as const, label: 'Manufacturing & Industrial', icon: FaIndustry },
  ];

  return (
    <section
      style={{
        backgroundColor: '#F8FAFC',
        paddingTop: '115px',
        paddingBottom: '60px',
        minHeight: '100vh',
        fontFamily: "'Outfit', 'Inter', -apple-system, sans-serif",
      }}
    >
      <div style={{ maxWidth: '1360px', width: '100%', margin: '0 auto', padding: '0 24px', boxSizing: 'border-box' }}>
        
        {/* TOP HEADER ROW WITH BACK BUTTON */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #E2E8F0', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {onBack && (
              <button
                onClick={onBack}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '12px',
                  color: '#0F172A',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; e.currentTarget.style.borderColor = '#16A34A'; e.currentTarget.style.color = '#16A34A'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.color = '#0F172A'; }}
              >
                <span>←</span>
                <span>Back</span>
              </button>
            )}
            <div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                {title || 'Business Marketplace'}
              </h1>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0', fontWeight: 500 }}>
                {subtitle || 'Discover verified businesses for sale, investment, and strategic acquisitions'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#16A34A', backgroundColor: '#DCFCE7', padding: '6px 14px', borderRadius: '9999px', border: '1px solid #BBF7D0' }}>
              ● {businessDb.length} Active Businesses
            </span>
          </div>
        </div>

        {/* TOP BIG WHITE SEARCH BOX CARD */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            padding: '24px 28px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
            border: '1px solid #E2E8F0',
            marginBottom: '32px',
          }}
        >
          {/* Top Tabs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              borderBottom: '1px solid #F1F5F9',
              paddingBottom: '16px',
              marginBottom: '20px',
              flexWrap: 'wrap',
            }}
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 18px',
                    borderRadius: '9999px',
                    border: 'none',
                    backgroundColor: isActive ? '#DCFCE7' : 'transparent',
                    color: isActive ? '#16A34A' : '#475569',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative',
                  }}
                >
                  <Icon style={{ fontSize: '15px' }} />
                  <span>{tab.label}</span>
                  {isActive && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '-17px',
                        left: '15%',
                        right: '15%',
                        height: '3px',
                        backgroundColor: '#16A34A',
                        borderRadius: '3px 3px 0 0',
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Row of Filter Inputs */}
          <div className="top-search-filter-bar-5">


            {/* Industry Dropdown */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: '6px' }}>
                Industry
              </label>
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '12px', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', fontWeight: 600, color: '#0F172A', cursor: 'pointer', width: '100%' }}
                >
                  <option value="All Industries">All Industries</option>
                  <option value="Food & Dining">Food & Dining</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Retail & Stores">Retail & Stores</option>
                  <option value="Technology">Technology</option>
                  <option value="Manufacturing & Industrial">Manufacturing & Industrial</option>
                </select>
              </div>
            </div>

            {/* Valuation Budget Dropdown */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: '6px' }}>
                Price / Valuation
              </label>
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '12px', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <select
                  value={valuation}
                  onChange={(e) => setValuation(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', fontWeight: 600, color: '#0F172A', cursor: 'pointer', width: '100%' }}
                >
                  <option value="₹ 20L - 10Cr+">₹ 20L - 10Cr+</option>
                  <option value="Under ₹ 50L">Under ₹ 50L</option>
                  <option value="₹ 50L - ₹ 2Cr">₹ 50L - ₹ 2Cr</option>
                  <option value="₹ 2Cr - ₹ 5Cr">₹ 2Cr - ₹ 5Cr</option>
                  <option value="₹ 5Cr+">₹ 5Cr+</option>
                </select>
              </div>
            </div>

            {/* Annual Revenue Dropdown */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: '6px' }}>
                Annual Revenue
              </label>
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '12px', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <select
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', fontWeight: 600, color: '#0F172A', cursor: 'pointer', width: '100%' }}
                >
                  <option value="Any Revenue">Any Revenue</option>
                  <option value="₹ 50L - ₹ 1Cr">₹ 50L - ₹ 1Cr</option>
                  <option value="₹ 1Cr - ₹ 5Cr">₹ 1Cr - ₹ 5Cr</option>
                  <option value="₹ 5Cr+">₹ 5Cr+</option>
                </select>
              </div>
            </div>

            {/* Search Button & Advanced Search */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '22px' }}>
              <button
                onClick={() => alert('Searching Businesses...')}
                style={{
                  backgroundColor: '#16A34A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 28px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)',
                  transition: 'all 0.2s',
                  width: '100%',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#15803D')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#16A34A')}
              >
                <FaSearch />
                <span>Search Businesses</span>
              </button>
              <button
                onClick={() => alert('Opening Advanced Search Options...')}
                style={{ background: 'none', border: 'none', color: '#64748B', fontWeight: 600, fontSize: '12px', cursor: 'pointer', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <span>Advanced Search</span>
                <FaChevronDown style={{ fontSize: '10px' }} />
              </button>
            </div>
          </div>
        </div>

        {/* MAIN 2-COLUMN GRID AREA */}
        <div className="layout-sidebar-main">
          
          {/* LEFT SIDEBAR: "Filter By" Card */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '22px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #F1F5F9', paddingBottom: '14px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Filter By</h3>
              <button onClick={clearAllFilters} style={{ background: 'none', border: 'none', color: '#16A34A', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>Clear All</button>
            </div>

            {/* Valuation Budget Slider */}
            <div style={{ marginBottom: '24px', borderBottom: '1px solid #F1F5F9', paddingBottom: '20px' }}>
              <div onClick={() => setValOpen(!valOpen)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: '14px' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>Valuation Budget</span>
                {valOpen ? <FaChevronUp style={{ fontSize: '11px', color: '#64748B' }} /> : <FaChevronDown style={{ fontSize: '11px', color: '#64748B' }} />}
              </div>

              {valOpen && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '10px' }}>
                    <span>₹ 10 Lac</span>
                    <span>₹ 10 Cr+</span>
                  </div>
                  <div style={{ position: 'relative', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', margin: '14px 6px' }}>
                    <div style={{ position: 'absolute', left: '10%', right: '15%', top: 0, bottom: 0, backgroundColor: '#16A34A', borderRadius: '3px' }} />
                    <div style={{ position: 'absolute', left: '10%', top: '-6px', width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#FFFFFF', border: '3px solid #16A34A', boxShadow: '0 2px 6px rgba(0,0,0,0.2)', cursor: 'pointer' }} />
                    <div style={{ position: 'absolute', right: '15%', top: '-6px', width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#FFFFFF', border: '3px solid #16A34A', boxShadow: '0 2px 6px rgba(0,0,0,0.2)', cursor: 'pointer' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Industry Checkboxes */}
            <div style={{ marginBottom: '24px', borderBottom: '1px solid #F1F5F9', paddingBottom: '20px' }}>
              <div onClick={() => setIndOpen(!indOpen)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: '14px' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>Industry</span>
                {indOpen ? <FaChevronUp style={{ fontSize: '11px', color: '#64748B' }} /> : <FaChevronDown style={{ fontSize: '11px', color: '#64748B' }} />}
              </div>

              {indOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { label: 'Food & Dining', icon: FaUtensils },
                    { label: 'Healthcare', icon: FaMedkit },
                    { label: 'Retail & Stores', icon: FaShoppingBag },
                    { label: 'Technology', icon: FaBriefcase },
                    { label: 'Manufacturing & Industrial', icon: FaIndustry },
                  ].map((indItem) => {
                    const checked = selectedInds.includes(indItem.label);
                    const Icon = indItem.icon;
                    return (
                      <label key={indItem.label} onClick={() => toggleInd(indItem.label)} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: checked ? 700 : 500, color: checked ? '#0F172A' : '#475569', cursor: 'pointer' }}>
                        <input type="checkbox" checked={checked} onChange={() => toggleInd(indItem.label)} style={{ accentColor: '#16A34A', width: '16px', height: '16px', cursor: 'pointer' }} />
                        <Icon style={{ color: checked ? '#16A34A' : '#94A3B8', fontSize: '14px' }} />
                        <span>{indItem.label}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Profitability Checkboxes */}
            <div style={{ marginBottom: '20px', borderBottom: '1px solid #F1F5F9', paddingBottom: '20px' }}>
              <div onClick={() => setProfOpen(!profOpen)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: '14px' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>Profitability</span>
                {profOpen ? <FaChevronUp style={{ fontSize: '11px', color: '#64748B' }} /> : <FaChevronDown style={{ fontSize: '11px', color: '#64748B' }} />}
              </div>

              {profOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {['Profitable Now', 'High Growth', 'Asset-Light', 'Cashflow Positive'].map((pr) => {
                    const checked = selectedProfs.includes(pr);
                    return (
                      <label key={pr} onClick={() => toggleProf(pr)} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: checked ? 700 : 500, color: checked ? '#0F172A' : '#475569', cursor: 'pointer' }}>
                        <input type="checkbox" checked={checked} onChange={() => toggleProf(pr)} style={{ accentColor: '#16A34A', width: '16px', height: '16px', cursor: 'pointer' }} />
                        <span>{pr}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Business Age Section */}
            <div>
              <div onClick={() => setAgeOpen(!ageOpen)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>Business Age</span>
                {ageOpen ? <FaChevronUp style={{ fontSize: '11px', color: '#64748B' }} /> : <FaChevronDown style={{ fontSize: '11px', color: '#64748B' }} />}
              </div>

              {ageOpen && (
                <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {['Under 1 Year', '1 - 3 Years', '3 - 5 Years', '5+ Years Established'].map((ag) => (
                    <label key={ag} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#475569', cursor: 'pointer' }}>
                      <input type="checkbox" style={{ accentColor: '#16A34A' }} />
                      <span>{ag}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT RESULTS AREA */}
          <div>
            
            {/* Top Bar: View toggles + Count + Sort */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px' }}>
                {[
                  { id: 'list' as const, label: 'List View', icon: FaList },
                  { id: 'map' as const, label: 'Map View', icon: FaMap },
                  { id: 'split' as const, label: 'Split View', icon: FaColumns },
                ].map((vm) => {
                  const Icon = vm.icon;
                  const isActive = viewMode === vm.id;
                  return (
                    <button key={vm.id} onClick={() => setViewMode(vm.id)} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: isActive ? '#16A34A' : '#64748B', fontWeight: isActive ? 800 : 600, fontSize: '14px', cursor: 'pointer', paddingBottom: '8px', position: 'relative' }}>
                      <Icon />
                      <span>{vm.label}</span>
                      {isActive && <span style={{ position: 'absolute', bottom: '-9px', left: 0, right: 0, height: '2.5px', backgroundColor: '#16A34A', borderRadius: '2px' }} />}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                  Showing <strong style={{ color: '#0F172A' }}>{businessesList.length} active businesses</strong>
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', padding: '6px 12px' }}>
                  <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Sort by:</span>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '12px', fontWeight: 800, color: '#0F172A', cursor: 'pointer' }}>
                    <option value="Relevance">Relevance</option>
                    <option value="Valuation: Low to High">Valuation: Low to High</option>
                    <option value="Revenue: High to Low">Revenue: High to Low</option>
                    <option value="Profit Margin">Profit Margin</option>
                  </select>
                </div>
              </div>
            </div>



            {/* INTERACTIVE MAP VIEW BOX */}
            {(viewMode === 'list' || viewMode === 'map' || viewMode === 'split') && (
              <div style={{ marginBottom: '24px' }}>
                <LiveLocationMap
                  items={businessesList}
                  type="business"
                  onSelectItem={(id) => {
                    if (onPropertyClick) onPropertyClick(id);
                    else if (onBuyProperty) onBuyProperty(id);
                  }}
                  height={viewMode === 'map' ? '550px' : '360px'}
                />
              </div>
            )}

            {/* QUICK FILTERS ROW */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginRight: '4px' }}>Quick Filters:</span>
              {[
                { label: 'Verified Sellers', icon: FaCheckCircle, id: 'Verified Sellers' },
                { label: 'Profitable Now', icon: FaChartLine, id: 'Profitable Now' },
                { label: 'Distress Sale / Great Deal', icon: FaCrown, id: 'Distress Sale / Great Deal' },
                { label: 'Prime Location', icon: FaMapMarkerAlt, id: 'Prime Location' },
                { label: 'Top Brokers', icon: FaStar, id: 'Top Brokers' },
              ].map((qf) => {
                const Icon = qf.icon;
                const isActive = activeQuickFilter === qf.id;
                return (
                  <button key={qf.id} onClick={() => setActiveQuickFilter(isActive ? null : qf.id)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '9999px', border: isActive ? '1px solid #16A34A' : '1px solid #CBD5E1', backgroundColor: isActive ? '#DCFCE7' : '#FFFFFF', color: isActive ? '#16A34A' : '#334155', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                    <Icon style={{ color: '#16A34A', fontSize: '13px' }} />
                    <span>{qf.label}</span>
                  </button>
                );
              })}
            </div>

            {/* BUSINESS CARDS GRID */}
            <div className={`responsive-property-grid ${viewMode === 'map' ? 'map-view-grid' : ''}`} style={{ marginBottom: '36px' }}>
              {businessesList.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', backgroundColor: '#FFFFFF', padding: '60px 20px', borderRadius: '24px', border: '1px solid #E2E8F0', textAlign: 'center', color: '#64748B' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>💼</div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>No Businesses Found</h3>
                  <p style={{ fontSize: '0.95rem', maxWidth: '400px', margin: '0 auto' }}>There are currently no active business listings matching your filter criteria.</p>
                </div>
              ) : (
                paginatedBusinesses.map((item) => {
                const isFav = !!wishlisted[item.id];
                let badgeBg = '#DCFCE7';
                let badgeColor = '#16A34A';
                let BadgeIcon = FaCheckCircle;

                if (item.badgeType === 'profit') {
                  badgeBg = '#E0E7FF';
                  badgeColor = '#4F46E5';
                  BadgeIcon = FaChartLine;
                } else if (item.badgeType === 'deal') {
                  badgeBg = '#FFEDD5';
                  badgeColor = '#EA580C';
                  BadgeIcon = FaCrown;
                }

                return (
                  <div key={item.id} onClick={() => onPropertyClick?.(item.id)} style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column' }}>
                    {/* Image Banner */}
                    <div style={{ position: 'relative', height: '180px', backgroundColor: '#0F172A' }}>
                      <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: badgeBg, color: badgeColor, padding: '4px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <BadgeIcon />
                        <span>{item.badge}</span>
                      </div>
                      <button onClick={(e) => toggleWishlist(item.id, e)} style={{ position: 'absolute', top: '12px', right: '12px', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(0, 0, 0, 0.4)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        {isFav ? <FaHeart style={{ color: '#EF4444', fontSize: '15px' }} /> : <FaRegHeart style={{ color: '#FFFFFF', fontSize: '15px' }} />}
                      </button>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>{item.title}</h4>
                        <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500, marginBottom: '12px' }}>{item.industry} • {item.location}</div>

                        {/* Specs Row */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', fontWeight: 600, color: '#475569', backgroundColor: '#F8FAFC', padding: '10px', borderRadius: '10px', marginBottom: '14px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span><FaChartLine style={{ color: '#3B82F6', marginRight: '4px' }} /> Monthly Revenue:</span>
                            <strong style={{ color: '#0F172A' }}>{item.revenue}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span><FaUsers style={{ color: '#16A34A', marginRight: '4px' }} /> Profit Margin:</span>
                            <strong style={{ color: '#16A34A' }}>{item.margin}</strong>
                          </div>
                        </div>

                        {/* Valuation */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                          <div>
                            <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Valuation</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>{item.valuation}</div>
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB', backgroundColor: '#DBEAFE', padding: '4px 8px', borderRadius: '6px' }}>{item.employees}</span>
                        </div>
                      </div>

                      {/* Broker Footer */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <img src={item.brokerImg} alt={item.brokerName} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                          <div>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: '#334155' }}>{item.brokerName}</div>
                            <div style={{ fontSize: '10px', fontWeight: 700, color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '2px' }}><FaStar /> {item.brokerRating}</div>
                          </div>
                        </div>

                        <button onClick={(e) => { e.stopPropagation(); onPropertyClick?.(item.id); }} style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', padding: '6px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: 700, color: '#0F172A', cursor: 'pointer' }}>View Details</button>
                      </div>
                    </div>
                  </div>
                );
              }))}
            </div>

            {/* BOTTOM PAGINATION BAR */}
            {businessesList.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #CBD5E1', paddingTop: '20px', flexWrap: 'wrap', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={validPage <= 1}
                    style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: validPage <= 1 ? '#F1F5F9' : '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: validPage <= 1 ? 'not-allowed' : 'pointer', color: validPage <= 1 ? '#94A3B8' : '#334155', fontWeight: 700 }}
                  >&lt;</button>
                  {Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1).map((pNum) => {
                    const isCur = validPage === pNum;
                    return (
                      <button
                        key={pNum}
                        onClick={() => setCurrentPage(pNum)}
                        style={{ width: '36px', height: '36px', borderRadius: '8px', border: isCur ? '1px solid #16A34A' : '1px solid #CBD5E1', backgroundColor: isCur ? '#16A34A' : '#FFFFFF', color: isCur ? '#FFFFFF' : '#334155', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                      >{pNum}</button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(Math.max(1, totalPages), p + 1))}
                    disabled={validPage >= totalPages}
                    style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: validPage >= totalPages ? '#F1F5F9' : '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: validPage >= totalPages ? 'not-allowed' : 'pointer', color: validPage >= totalPages ? '#94A3B8' : '#334155', fontWeight: 700 }}
                  >&gt;</button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>Show:</span>
                  <select
                    value={`${itemsPerPage} per page`}
                    onChange={(e) => {
                      const val = parseInt(e.target.value.split(' ')[0], 10);
                      if (!isNaN(val)) {
                        setItemsPerPage(val);
                        setCurrentPage(1);
                      }
                    }}
                    style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '6px 12px', fontSize: '13px', fontWeight: 700, color: '#0F172A', cursor: 'pointer' }}
                  >
                    <option value="12 per page">12 per page</option>
                    <option value="24 per page">24 per page</option>
                    <option value="48 per page">48 per page</option>
                  </select>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </section>
  );
};

export default BusinessMarketplace;
