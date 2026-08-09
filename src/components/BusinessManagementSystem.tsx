import React, { useState, useEffect, useMemo } from 'react';
import {
  businessDb, addBusiness, updateBusiness, deleteBusiness,
  sellBusinessRequestsDb, updateSellBusinessRequest, deleteSellBusinessRequest,
  businessEnquiriesDb,
  masterCategoriesDb, addFilterMasterItem, updateFilterMasterItem, deleteFilterMasterItem,
  masterBusinessTypesDb,
  type BusinessListing, type SellBusinessRequest, type BusinessEnquiry, type FilterMasterItem
} from '../db/marketplaceDb';
import { 
  FaStore, FaEye, FaEyeSlash, FaStar, FaEdit, FaTrash, FaPlus, 
  FaSearch, FaCheck, FaTimes, FaInbox, FaChartBar, FaTags, FaBriefcase,
  FaFileAlt, FaMapMarkerAlt, FaRegStar, FaEllipsisV, FaMoneyBillWave
} from 'react-icons/fa';

interface BusinessManagementSystemProps {
  showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void;
  activeSubTab: string;
  onSubTabChange: (tab: string) => void;
}

export const BusinessManagementSystem: React.FC<BusinessManagementSystemProps> = ({ showNotification, activeSubTab, onSubTabChange }) => {
  const [dataUpdated, setDataUpdated] = useState(0);

  // Trigger re-render on data change
  useEffect(() => {
    const handleDataChange = () => setDataUpdated(prev => prev + 1);
    window.addEventListener('nexopp_data_changed', handleDataChange);
    return () => window.removeEventListener('nexopp_data_changed', handleDataChange);
  }, []);

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditId, setCurrentEditId] = useState<string | null>(null);

  // Search states
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data snapshots
  const businesses = useMemo(() => businessDb, [dataUpdated, businessDb]);
  const sellRequests = useMemo(() => sellBusinessRequestsDb, [dataUpdated, sellBusinessRequestsDb]);
  const buyEnquiries = useMemo(() => businessEnquiriesDb, [dataUpdated, businessEnquiriesDb]);
  const categories = useMemo(() => masterCategoriesDb.filter(c => c.type === 'category'), [dataUpdated, masterCategoriesDb]);
  const businessTypes = useMemo(() => masterBusinessTypesDb.filter(t => t.type === 'business_type'), [dataUpdated, masterBusinessTypesDb]);

  // Dashboard Stats
  const totalBusinesses = businesses.length;
  const publishedBusinesses = businesses.filter(b => b.published !== false).length;
  const unpublishedBusinesses = businesses.filter(b => b.published === false).length;
  const featuredBusinesses = businesses.filter(b => b.featured === true).length;
  const pendingSellRequests = sellRequests.filter(r => r.status === 'PENDING_REVIEW').length;
  const totalBuyEnquiries = buyEnquiries.length;
  const availableBusinesses = businesses.filter(b => b.status === 'Available' || !b.status).length;
  const soldBusinesses = businesses.filter(b => b.status === 'Sold' || b.status === 'Unavailable').length;

  const handleTogglePublish = (id: string, currentPublished: boolean) => {
    updateBusiness(id, { published: !currentPublished });
    showNotification(`Business ${!currentPublished ? 'published' : 'unpublished'} successfully`, 'success');
  };

  const handleToggleFeatured = (id: string, currentFeatured: boolean) => {
    updateBusiness(id, { featured: !currentFeatured });
    showNotification(`Business ${!currentFeatured ? 'marked as featured' : 'removed from featured'}`, 'success');
  };

  const handleDeleteBusiness = (id: string) => {
    if (window.confirm('Are you sure you want to delete this business?')) {
      deleteBusiness(id);
      showNotification('Business deleted successfully', 'success');
    }
  };

  const renderDashboard = () => {
    const statCards = [
      { title: 'Total Businesses', value: totalBusinesses, icon: <FaStore />, color: '#1E40AF', borderColor: '#1E40AF' },
      { title: 'Published', value: publishedBusinesses, icon: <FaEye />, color: '#059669', borderColor: '#059669' },
      { title: 'Unpublished', value: unpublishedBusinesses, icon: <FaEyeSlash />, color: '#9CA3AF', borderColor: '#9CA3AF' },
      { title: 'Featured', value: featuredBusinesses, icon: <FaStar />, color: '#D4A10F', borderColor: '#D4A10F' },
      { title: 'Pending Sell Requests', value: pendingSellRequests, icon: <FaFileAlt />, color: '#EA580C', borderColor: '#EA580C' },
      { title: 'Buy Enquiries', value: totalBuyEnquiries, icon: <FaInbox />, color: '#4F46E5', borderColor: '#4F46E5' },
      { title: 'Available', value: availableBusinesses, icon: <FaCheck />, color: '#10B981', borderColor: '#10B981' },
      { title: 'Sold/Unavailable', value: soldBusinesses, icon: <FaTimes />, color: '#EF4444', borderColor: '#EF4444' },
    ];

    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center"><FaChartBar className="mr-3 text-[#1E40AF]" /> Business Dashboard</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border-l-4" style={{ borderColor: stat.borderColor }}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                </div>
                <div className="text-4xl opacity-20" style={{ color: stat.color }}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderListings = () => {
    const filteredBusinesses = businesses.filter(b => 
      b.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center"><FaStore className="mr-3 text-[#1E40AF]" /> All Businesses</h2>
          <button 
            onClick={() => onSubTabChange('addBusiness')}
            className="bg-[#1E40AF] hover:bg-blue-800 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <FaPlus className="mr-2" /> Add Business
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search by name, city, or category..." 
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 border-b">
                <th className="p-4 font-semibold">Image</th>
                <th className="p-4 font-semibold">Name & ID</th>
                <th className="p-4 font-semibold">Category & Type</th>
                <th className="p-4 font-semibold">Location</th>
                <th className="p-4 font-semibold">Price</th>
                <th className="p-4 font-semibold text-center">Status</th>
                <th className="p-4 font-semibold text-center">Published</th>
                <th className="p-4 font-semibold text-center">Featured</th>
                <th className="p-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBusinesses.map(b => (
                <tr key={b.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <img src={b.imageUrl || 'https://via.placeholder.com/50'} alt={b.title} className="w-12 h-12 rounded object-cover" />
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-gray-800">{b.title}</p>
                    <p className="text-xs text-gray-500">{b.id}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-gray-800">{b.category}</p>
                    <p className="text-xs text-gray-500">{b.businessType}</p>
                  </td>
                  <td className="p-4 text-gray-600">{b.city}</td>
                  <td className="p-4 font-medium text-gray-800">{b.priceDisplay || `₹${b.askingPrice}`}</td>
                  <td className="p-4 text-center">
                    <select 
                      className="border rounded px-2 py-1 text-sm outline-none"
                      value={b.status || 'Available'}
                      onChange={(e) => updateBusiness(b.id, { status: e.target.value as any })}
                    >
                      <option value="Available">Available</option>
                      <option value="Sold">Sold</option>
                      <option value="Unavailable">Unavailable</option>
                      <option value="Under_Review">Under Review</option>
                    </select>
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => handleTogglePublish(b.id, b.published !== false)}>
                      {b.published !== false ? <FaEye className="text-green-500 text-xl mx-auto" /> : <FaEyeSlash className="text-red-500 text-xl mx-auto" />}
                    </button>
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => handleToggleFeatured(b.id, !!b.featured)}>
                      {b.featured ? <FaStar className="text-yellow-500 text-xl mx-auto" /> : <FaRegStar className="text-gray-400 text-xl mx-auto" />}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center space-x-3">
                      <button className="text-blue-600 hover:text-blue-800"><FaEdit /></button>
                      <button onClick={() => handleDeleteBusiness(b.id)} className="text-red-600 hover:text-red-800"><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBusinesses.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-500">No businesses found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const AddBusinessForm = () => {
    const [formData, setFormData] = useState<Partial<BusinessListing>>({
      title: '', description: '', category: categories[0]?.name || '', businessType: businessTypes[0]?.name || '',
      city: '', state: 'Andhra Pradesh', askingPrice: 0, priceDisplay: '', imageUrl: '', 
      establishedYear: new Date().getFullYear(), employeesCount: '1-10', revenueMonthly: '', profitMonthly: '',
      reasonForSale: '', featured: false, published: true, status: 'Available'
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      addBusiness(formData as BusinessListing);
      showNotification('Business added successfully', 'success');
      onSubTabChange('listings');
    };

    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center"><FaPlus className="mr-3 text-[#1E40AF]" /> Add New Business</h2>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
              <input required type="text" className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1E40AF] outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input type="text" className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1E40AF] outline-none" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select className="w-full border rounded-lg px-4 py-2 outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
              <select className="w-full border rounded-lg px-4 py-2 outline-none" value={formData.businessType} onChange={e => setFormData({...formData, businessType: e.target.value})}>
                {businessTypes.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input required type="text" className="w-full border rounded-lg px-4 py-2 outline-none" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input required type="text" className="w-full border rounded-lg px-4 py-2 outline-none" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Asking Price (Numeric)</label>
              <input required type="number" className="w-full border rounded-lg px-4 py-2 outline-none" value={formData.askingPrice} onChange={e => setFormData({...formData, askingPrice: Number(e.target.value)})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price Display (e.g. ₹50 Lakhs)</label>
              <input type="text" className="w-full border rounded-lg px-4 py-2 outline-none" value={formData.priceDisplay} onChange={e => setFormData({...formData, priceDisplay: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea rows={4} className="w-full border rounded-lg px-4 py-2 outline-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
          </div>
          <div className="mt-8 flex justify-end">
            <button type="submit" className="bg-[#1E40AF] text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-800 transition-colors">Save Business</button>
          </div>
        </form>
      </div>
    );
  };

  const renderSellRequests = () => {
    const getStatusColor = (status: string) => {
      switch(status) {
        case 'PENDING_REVIEW': return 'bg-orange-100 text-orange-800';
        case 'APPROVED': return 'bg-green-100 text-green-800';
        case 'REJECTED': return 'bg-red-100 text-red-800';
        default: return 'bg-blue-100 text-blue-800';
      }
    };

    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center"><FaFileAlt className="mr-3 text-[#1E40AF]" /> Sell Business Requests</h2>
        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 border-b">
                <th className="p-4 font-semibold">ID</th>
                <th className="p-4 font-semibold">Contact Info</th>
                <th className="p-4 font-semibold">Business Details</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sellRequests.map(r => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 text-sm font-mono text-gray-500">{r.id.substring(0,8)}</td>
                  <td className="p-4">
                    <p className="font-semibold text-gray-800">{r.name}</p>
                    <p className="text-sm text-gray-600">{r.mobile}</p>
                    <p className="text-sm text-gray-600">{r.email}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-gray-800">{r.businessCategory}</p>
                    <p className="text-sm text-gray-600">{r.city}</p>
                  </td>
                  <td className="p-4">
                    <select 
                      className={`text-xs font-semibold px-2 py-1 rounded-full outline-none ${getStatusColor(r.status)}`}
                      value={r.status}
                      onChange={(e) => updateSellBusinessRequest(r.id, { status: e.target.value as any })}
                    >
                      <option value="PENDING_REVIEW">Pending</option>
                      <option value="CONTACTED">Contacted</option>
                      <option value="APPROVED">Approved</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <button className="text-red-500 hover:text-red-700" onClick={() => {
                      if(window.confirm('Delete request?')) {
                        deleteSellBusinessRequest(r.id);
                        showNotification('Request deleted', 'success');
                      }
                    }}><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderBuyEnquiries = () => {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center"><FaInbox className="mr-3 text-[#1E40AF]" /> Buy Enquiries</h2>
        <div className="bg-white rounded-xl shadow-sm overflow-x-auto p-4">
          <p className="text-gray-500">Buy enquiries will be displayed here.</p>
        </div>
      </div>
    );
  };

  const renderCategories = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center"><FaTags className="mr-3 text-[#1E40AF]" /> Categories</h2>
      <div className="bg-white rounded-xl shadow-sm p-4">
        {categories.map(c => (
          <div key={c.id} className="flex justify-between items-center border-b p-3">
            <span className="font-medium">{c.name}</span>
            <span className={`px-2 py-1 rounded text-xs ${c.active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {c.active !== false ? 'Active' : 'Inactive'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBusinessTypes = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center"><FaBriefcase className="mr-3 text-[#1E40AF]" /> Business Types</h2>
      <div className="bg-white rounded-xl shadow-sm p-4">
        {businessTypes.map(t => (
          <div key={t.id} className="flex justify-between items-center border-b p-3">
            <span className="font-medium">{t.name}</span>
            <span className={`px-2 py-1 rounded text-xs ${t.active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {t.active !== false ? 'Active' : 'Inactive'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFeatured = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center"><FaStar className="mr-3 text-[#D4A10F]" /> Featured Businesses</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {businesses.filter(b => b.featured).map(b => (
          <div key={b.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <img src={b.imageUrl || 'https://via.placeholder.com/300x200'} alt={b.title} className="w-full h-40 object-cover" />
            <div className="p-4">
              <h3 className="font-bold text-lg">{b.title}</h3>
              <p className="text-gray-500 text-sm mb-2">{b.category}</p>
              <button onClick={() => handleToggleFeatured(b.id, true)} className="text-red-500 text-sm hover:underline">Remove from Featured</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {activeSubTab === 'dashboard' && renderDashboard()}
      {activeSubTab === 'listings' && renderListings()}
      {activeSubTab === 'addBusiness' && <AddBusinessForm />}
      {activeSubTab === 'sellRequests' && renderSellRequests()}
      {activeSubTab === 'buyEnquiries' && renderBuyEnquiries()}
      {activeSubTab === 'categories' && renderCategories()}
      {activeSubTab === 'businessTypes' && renderBusinessTypes()}
      {activeSubTab === 'featured' && renderFeatured()}
    </div>
  );
};

export default BusinessManagementSystem;
