import React, { useState, useEffect } from 'react';
import {
  FaSearch,
  FaPlus,
  FaFileUpload,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaMapMarkerAlt,
  FaCity,
  FaLayerGroup,
  FaStar,
  FaFire,
  FaSpinner,
} from 'react-icons/fa';

export const LOCATION_TYPES = [
  'Country',
  'State',
  'District',
  'City',
  'Area',
  'Locality',
  'Village',
  'Pincode',
];

export const LocationManagementModule: React.FC = () => {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any | null>(null);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: 'City',
    latitude: '',
    longitude: '',
    parentName: '',
    city: '',
    district: '',
    state: 'Andhra Pradesh',
    country: 'India',
    aliases: '',
    searchKeywords: '',
    population: '0',
    priority: '50',
    listingCount: '0',
    status: 'Active',
    featured: false,
    trending: false,
  });

  // Fetch locations
  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/locations?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setLocations(data.data);
      }
    } catch (err) {
      console.error('Error fetching admin locations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [searchQuery]);

  const handleOpenAdd = () => {
    setEditingLocation(null);
    setFormData({
      name: '',
      slug: '',
      type: 'City',
      latitude: '',
      longitude: '',
      parentName: '',
      city: '',
      district: '',
      state: 'Andhra Pradesh',
      country: 'India',
      aliases: '',
      searchKeywords: '',
      population: '0',
      priority: '50',
      listingCount: '0',
      status: 'Active',
      featured: false,
      trending: false,
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (loc: any) => {
    setEditingLocation(loc);
    setFormData({
      name: loc.name || '',
      slug: loc.slug || '',
      type: loc.type || 'City',
      latitude: loc.latitude ? String(loc.latitude) : '',
      longitude: loc.longitude ? String(loc.longitude) : '',
      parentName: loc.parentName || '',
      city: loc.city || '',
      district: loc.district || '',
      state: loc.state || 'Andhra Pradesh',
      country: loc.country || 'India',
      aliases: Array.isArray(loc.aliases) ? loc.aliases.join(', ') : '',
      searchKeywords: Array.isArray(loc.searchKeywords) ? loc.searchKeywords.join(', ') : '',
      population: String(loc.population || 0),
      priority: String(loc.priority || 50),
      listingCount: String(loc.listingCount || 0),
      status: loc.status || 'Active',
      featured: Boolean(loc.featured),
      trending: Boolean(loc.trending),
    });
    setShowAddModal(true);
  };

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Location Name is required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        latitude: parseFloat(formData.latitude || '0'),
        longitude: parseFloat(formData.longitude || '0'),
        population: parseInt(formData.population || '0', 10),
        priority: parseInt(formData.priority || '50', 10),
        listingCount: parseInt(formData.listingCount || '0', 10),
        aliases: formData.aliases ? formData.aliases.split(',').map(a => a.trim()) : [],
        searchKeywords: formData.searchKeywords ? formData.searchKeywords.split(',').map(k => k.trim()) : [formData.name.toLowerCase()],
      };

      let res;
      if (editingLocation) {
        res = await fetch(`/api/admin/locations/${editingLocation.id || editingLocation.slug}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/admin/locations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        fetchLocations();
      } else {
        alert(data.error || 'Failed to save location.');
      }
    } catch (err) {
      console.error('Error saving location:', err);
      alert('Network error while saving location.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (loc: any) => {
    const newStatus = loc.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await fetch(`/api/admin/locations/${loc.id || loc.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) fetchLocations();
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  const handleDeleteLocation = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this location?')) return;
    try {
      const res = await fetch(`/api/admin/locations/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchLocations();
    } catch (err) {
      console.error('Delete location error:', err);
    }
  };

  const handleImportCsv = async () => {
    if (!csvText.trim()) {
      alert('Please paste CSV text or upload a CSV file.');
      return;
    }

    setSaving(true);
    try {
      const lines = csvText.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const items: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const vals = lines[i].split(',').map(v => v.trim());
        const item: any = {};
        headers.forEach((h, idx) => {
          item[h] = vals[idx] || '';
        });
        items.push(item);
      }

      const res = await fetch('/api/admin/locations/import-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`Successfully imported ${data.importedCount} locations.`);
        setShowCsvModal(false);
        setCsvText('');
        fetchLocations();
      } else {
        alert(data.error || 'Failed to import CSV.');
      }
    } catch (err) {
      console.error('CSV import error:', err);
      alert('Error parsing or importing CSV.');
    } finally {
      setSaving(false);
    }
  };

  const filteredLocations = locations.filter(loc => {
    if (selectedType !== 'ALL' && loc.type !== selectedType) return false;
    return true;
  });

  return (
    <div style={{ padding: '24px', backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          backgroundColor: '#FFFFFF',
          padding: '20px 24px',
          borderRadius: '16px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#0F172A' }}>
              Location Management System
            </h2>
            <span
              style={{
                backgroundColor: '#ECFDF5',
                color: '#059669',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              {filteredLocations.length} Records
            </span>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '13.5px', color: '#64748B' }}>
            Manage Country, State, District, City, Area, Locality, Village, and Pincode database records.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setShowCsvModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #CBD5E1',
              color: '#334155',
              padding: '10px 18px',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            <FaFileUpload style={{ color: '#2563EB' }} /> Import CSV
          </button>
          <button
            onClick={handleOpenAdd}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#10B981',
              color: '#FFFFFF',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
            }}
          >
            <FaPlus /> Add New Location
          </button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '20px',
          backgroundColor: '#FFFFFF',
          padding: '16px 20px',
          borderRadius: '14px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ position: 'relative', flex: 1 }}>
          <FaSearch
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94A3B8',
            }}
          />
          <input
            type="text"
            placeholder="Search locations by name, city, state, or type..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: '42px',
              padding: '0 14px 0 40px',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <select
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
          style={{
            height: '42px',
            padding: '0 16px',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            fontSize: '14px',
            fontWeight: 600,
            color: '#334155',
            outline: 'none',
            backgroundColor: '#FFFFFF',
            cursor: 'pointer',
          }}
        >
          <option value="ALL">All Types</option>
          {LOCATION_TYPES.map(t => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Locations Data Table */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#10B981' }}>
            <FaSpinner className="fa-spin" style={{ fontSize: '28px', marginBottom: '12px' }} />
            <div>Loading location database records...</div>
          </div>
        ) : filteredLocations.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>
            No location records found matching criteria.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '14px 20px' }}>Location Name / Slug</th>
                <th style={{ padding: '14px 16px' }}>Type</th>
                <th style={{ padding: '14px 16px' }}>City / State</th>
                <th style={{ padding: '14px 16px' }}>Coordinates</th>
                <th style={{ padding: '14px 16px' }}>Listings</th>
                <th style={{ padding: '14px 16px' }}>Badges</th>
                <th style={{ padding: '14px 16px' }}>Status</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLocations.map((loc, idx) => (
                <tr
                  key={loc.id || loc.slug || idx}
                  style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.15s ease' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#0F172A' }}>{loc.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>/{loc.slug}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: '8px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        backgroundColor: '#EFF6FF',
                        color: '#2563EB',
                        border: '1px solid #BFDBFE',
                      }}
                    >
                      {loc.type || 'City'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13.5px', color: '#334155' }}>
                    {loc.city || loc.name}, {loc.state || 'AP'}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '12.5px', color: '#64748B' }}>
                    {loc.latitude && loc.longitude ? `${loc.latitude}, ${loc.longitude}` : 'N/A'}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13.5px', fontWeight: 600, color: '#059669' }}>
                    {(loc.listingCount || 0).toLocaleString()}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {loc.featured && (
                        <span style={{ backgroundColor: '#FEF3C7', color: '#D97706', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <FaStar /> Featured
                        </span>
                      )}
                      {loc.trending && (
                        <span style={{ backgroundColor: '#FFEDD5', color: '#EA580C', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <FaFire /> Trending
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <button
                      onClick={() => handleToggleStatus(loc)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: loc.status === 'Active' ? '#D1FAE5' : '#FEE2E2',
                        color: loc.status === 'Active' ? '#047857' : '#B91C1C',
                      }}
                    >
                      {loc.status || 'Active'}
                    </button>
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        onClick={() => handleOpenEdit(loc)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          backgroundColor: '#FFFFFF',
                          color: '#2563EB',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteLocation(loc.id || loc.slug)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          border: '1px solid #FCA5A5',
                          backgroundColor: '#FEF2F2',
                          color: '#EF4444',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ADD / EDIT LOCATION MODAL */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15,23,42,0.6)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '680px',
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
                {editingLocation ? 'Edit Location' : 'Add New Location'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', color: '#64748B', cursor: 'pointer' }}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSaveLocation} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Location Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Guntur"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Location Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }}
                  >
                    {LOCATION_TYPES.map(t => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    City Name
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Guntur"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    State Name
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                    placeholder="e.g. Andhra Pradesh"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={e => setFormData({ ...formData, latitude: e.target.value })}
                    placeholder="16.3067"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={e => setFormData({ ...formData, longitude: e.target.value })}
                    placeholder="80.4365"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Aliases (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.aliases}
                  onChange={e => setFormData({ ...formData, aliases: e.target.value })}
                  placeholder="e.g. BZA, Bezawada, Vijayawada Central"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Listing Count
                  </label>
                  <input
                    type="number"
                    value={formData.listingCount}
                    onChange={e => setFormData({ ...formData, listingCount: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Priority (0-100)
                  </label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px', padding: '10px 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#1E293B', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                  />
                  Featured Location
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#1E293B', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.trending}
                    onChange={e => setFormData({ ...formData, trending: e.target.checked })}
                  />
                  Trending Location
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', backgroundColor: '#10B981', color: '#FFFFFF', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}
                >
                  {saving ? 'Saving...' : 'Save Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV BULK IMPORT MODAL */}
      {showCsvModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15,23,42,0.6)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '620px',
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
                Bulk CSV Import Locations
              </h3>
              <button onClick={() => setShowCsvModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', color: '#64748B', cursor: 'pointer' }}>
                <FaTimes />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '12px' }}>
              Paste CSV text below with columns: <code>name,type,city,district,state,latitude,longitude,aliases,listingCount</code>
            </p>

            <textarea
              rows={8}
              value={csvText}
              onChange={e => setCsvText(e.target.value)}
              placeholder={`name,type,city,district,state,latitude,longitude,aliases,listingCount\nKondapur,Locality,Hyderabad,Rangareddy,Telangana,17.4600,78.3660,Kondapur Hyd,1980`}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                fontFamily: 'monospace',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box',
                marginBottom: '16px',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setShowCsvModal(false)}
                style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImportCsv}
                disabled={saving}
                style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', backgroundColor: '#2563EB', color: '#FFFFFF', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}
              >
                {saving ? 'Importing...' : 'Upload & Import CSV'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
