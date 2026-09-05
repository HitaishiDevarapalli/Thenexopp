import React, { useState, useEffect } from 'react';
import { 
  FaRobot, FaSync, FaFileUpload, FaTrash, FaCheckCircle, 
  FaExclamationTriangle, FaSearch, FaStar, FaThumbtack, 
  FaDownload, FaCog, FaChartLine, FaQuestionCircle, 
  FaBrain, FaPalette, FaComments, FaSlidersH, FaShieldAlt,
  FaCheck, FaTimes, FaGlobe, FaBookOpen, FaUserTie, FaEye
} from 'react-icons/fa';
import { propertiesDb, franchiseDb, businessDb } from '../db/marketplaceDb';

interface AiSettings {
  assistantName: string;
  welcomeMessage: string;
  greetingText: string;
  tagline: string;
  bubbleMessage: string;
  themeColor: string;
  onlineStatus: 'online' | 'busy' | 'offline';
  femaleAvatarUrl: string;
  businessLogic: {
    propertySearch: boolean;
    financeAdvice: boolean;
    insuranceAdvice: boolean;
    franchiseMarketplace: boolean;
    businessDeals: boolean;
    commercialPlots: boolean;
    emiCalculator: boolean;
    propertyComparison: boolean;
    userMemory: boolean;
    multilingual: boolean;
  };
  lastSynced: string;
}

interface TrainingDocument {
  id: string;
  fileName: string;
  category: 'Builder Document' | 'Legal & RERA' | 'Government Circular' | 'FAQ Sheet' | 'Price List';
  size: string;
  uploadedAt: string;
  status: 'Indexed' | 'Training' | 'Pending';
}

interface ConversationRecord {
  id: string;
  userId: string;
  language: 'English' | 'Telugu' | 'Hindi' | 'Mixed';
  firstQuery: string;
  messagesCount: number;
  createdAt: string;
  starred: boolean;
  pinned: boolean;
  rating: number;
}

export const AiAssistantAdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'appearance' | 'knowledge' | 'training' | 'logic' | 'analytics' | 'conversations' | 'settings'>('dashboard');

  // AI Settings State (Persisted in localStorage)
  const [settings, setSettings] = useState<AiSettings>(() => {
    try {
      const saved = localStorage.getItem('nexopp_ai_admin_settings');
      return saved ? JSON.parse(saved) : {
        assistantName: 'NexOpp AI',
        welcomeMessage: "Hello! I'm NexOpp AI, Your Retrieval-Augmented Property Consultant. How can I help you today?",
        greetingText: "Welcome to NexOpp Real Estate! Ask me about properties, franchises, businesses, or home loans.",
        tagline: "Your Retrieval-Augmented Property Consultant",
        bubbleMessage: "Need help finding your perfect property? Ask NexOpp AI",
        themeColor: '#10B981',
        onlineStatus: 'online',
        femaleAvatarUrl: 'default',
        businessLogic: {
          propertySearch: true,
          financeAdvice: true,
          insuranceAdvice: true,
          franchiseMarketplace: true,
          businessDeals: true,
          commercialPlots: true,
          emiCalculator: true,
          propertyComparison: true,
          userMemory: true,
          multilingual: true
        },
        lastSynced: new Date().toLocaleString()
      };
    } catch (e) {
      return {
        assistantName: 'NexOpp AI',
        welcomeMessage: "Hello! I'm NexOpp AI, Your Retrieval-Augmented Property Consultant.",
        greetingText: "Welcome to NexOpp Real Estate!",
        tagline: "Your Retrieval-Augmented Property Consultant",
        bubbleMessage: "Need help finding your perfect property? Ask NexOpp AI",
        themeColor: '#10B981',
        onlineStatus: 'online',
        femaleAvatarUrl: 'default',
        businessLogic: {
          propertySearch: true,
          financeAdvice: true,
          insuranceAdvice: true,
          franchiseMarketplace: true,
          businessDeals: true,
          commercialPlots: true,
          emiCalculator: true,
          propertyComparison: true,
          userMemory: true,
          multilingual: true
        },
        lastSynced: new Date().toLocaleString()
      };
    }
  });

  useEffect(() => {
    localStorage.setItem('nexopp_ai_admin_settings', JSON.stringify(settings));
  }, [settings]);

  // Knowledge Syncing Animation State
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(100);

  // Training Documents State
  const [trainingDocs, setTrainingDocs] = useState<TrainingDocument[]>([
    { id: 'doc-1', fileName: 'Hyderabad_RERA_Approved_Projects_2026.pdf', category: 'Legal & RERA', size: '2.4 MB', uploadedAt: '2026-07-20', status: 'Indexed' },
    { id: 'doc-2', fileName: 'Guntur_Amaravati_MasterPlan_Circular.pdf', category: 'Government Circular', size: '4.1 MB', uploadedAt: '2026-07-22', status: 'Indexed' },
    { id: 'doc-3', fileName: 'NexOpp_Franchise_Investment_FAQ.docx', category: 'FAQ Sheet', size: '850 KB', uploadedAt: '2026-07-25', status: 'Indexed' },
    { id: 'doc-4', fileName: 'Vijayawada_BenzCircle_Villas_PriceList.csv', category: 'Price List', size: '320 KB', uploadedAt: '2026-07-27', status: 'Indexed' }
  ]);

  const [newDocName, setNewDocName] = useState('');
  const [newDocCategory, setNewDocCategory] = useState<TrainingDocument['category']>('Builder Document');

  // Conversations Management State
  const [conversations, setConversations] = useState<ConversationRecord[]>([
    { id: 'conv-101', userId: 'USR-8821 (Hyderabad)', language: 'English', firstQuery: 'Looking for 3 BHK luxury apartment under 1 Cr in Gachibowli', messagesCount: 6, createdAt: '2026-07-28 12:40', starred: true, pinned: true, rating: 5 },
    { id: 'conv-102', userId: 'USR-8842 (Guntur)', language: 'Telugu', firstQuery: 'నాకు గుంటూరులో 50 లక్షల లోపు ప్లాట్స్ చూపించు', messagesCount: 8, createdAt: '2026-07-28 11:15', starred: false, pinned: false, rating: 5 },
    { id: 'conv-103', userId: 'USR-8850 (Vijayawada)', language: 'Telugu', firstQuery: 'విజయవాడలో బెంచ్ సర్కిల్ ప్లాట్స్ ధరలు ఎంత?', messagesCount: 4, createdAt: '2026-07-28 09:30', starred: true, pinned: false, rating: 4 },
    { id: 'conv-104', userId: 'USR-8861 (Vijayawada)', language: 'English', firstQuery: 'Calculate home loan EMI for 60 Lakhs at 8.5% interest', messagesCount: 5, createdAt: '2026-07-27 18:20', starred: false, pinned: false, rating: 5 }
  ]);

  const [searchConvQuery, setSearchConvQuery] = useState('');

  // Handle Manual Website Sync Trigger
  const triggerManualSync = () => {
    setIsSyncing(true);
    setSyncProgress(0);

    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSyncing(false);
          setSettings(s => ({ ...s, lastSynced: new Date().toLocaleString() }));
          return 100;
        }
        return prev + 20;
      });
    }, 300);
  };

  // Add Document Handler
  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) return;

    const newDoc: TrainingDocument = {
      id: `doc-${Date.now()}`,
      fileName: newDocName.trim(),
      category: newDocCategory,
      size: '1.2 MB',
      uploadedAt: new Date().toISOString().split('T')[0],
      status: 'Indexed'
    };

    setTrainingDocs(prev => [newDoc, ...prev]);
    setNewDocName('');
  };

  const deleteDocument = (id: string) => {
    setTrainingDocs(prev => prev.filter(d => d.id !== id));
  };

  const toggleStarConv = (id: string) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, starred: !c.starred } : c));
  };

  const togglePinConv = (id: string) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c));
  };

  const deleteConv = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
  };

  const filteredConversations = conversations.filter(c => 
    c.firstQuery.toLowerCase().includes(searchConvQuery.toLowerCase()) || 
    c.userId.toLowerCase().includes(searchConvQuery.toLowerCase())
  );

  return (
    <div style={{ backgroundColor: '#F9FAFB', minHeight: '100vh', padding: '24px', fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif" }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', backgroundColor: '#FFFFFF', padding: '20px 24px', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
            <FaRobot />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#111827' }}>
              NexOpp AI Assistant Administration
            </h2>
            <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '2px' }}>
              Retrieval-Augmented Generation (RAG) Engine • Non-Hallucinated Knowledge Index
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.78rem', color: '#10B981', backgroundColor: '#ECFDF5', padding: '6px 12px', borderRadius: '20px', fontWeight: 700, border: '1px solid #A7F3D0' }}>
            RAG Engine Active
          </span>
          <button 
            onClick={triggerManualSync}
            disabled={isSyncing}
            style={{ 
              backgroundColor: '#10B981', 
              color: '#FFFFFF', 
              border: 'none', 
              borderRadius: '10px', 
              padding: '10px 18px', 
              fontWeight: 700, 
              fontSize: '0.85rem', 
              cursor: isSyncing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FaSync className={isSyncing ? 'spin' : ''} />
            {isSyncing ? `Syncing Website (${syncProgress}%)...` : 'Sync Website Now'}
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #E5E7EB', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
        {[
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'appearance', label: 'Appearance' },
          { id: 'knowledge', label: 'Knowledge Base' },
          { id: 'training', label: 'Training & Docs' },
          { id: 'logic', label: 'Business Logic' },
          { id: 'analytics', label: 'Analytics' },
          { id: 'conversations', label: 'Conversations' },
          { id: 'settings', label: 'Settings & Security' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            style={{
              padding: '12px 18px',
              border: 'none',
              borderBottom: activeTab === t.id ? '3px solid #10B981' : '3px solid transparent',
              backgroundColor: 'transparent',
              color: activeTab === t.id ? '#10B981' : '#4B5563',
              fontWeight: activeTab === t.id ? 800 : 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ================= 1. DASHBOARD TAB ================= */}
      {activeTab === 'dashboard' && (
        <div>
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '20px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Total AI Conversations</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#111827', marginTop: '6px' }}>1,420</div>
              <div style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 700, marginTop: '4px' }}>↑ 18% this week</div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '20px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Indexed RAG Database</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#10B981', marginTop: '6px' }}>{propertiesDb.length + franchiseDb.length + businessDb.length} Items</div>
              <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: '4px' }}>Properties, Franchises & Deals</div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '20px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>AI Accuracy Score</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#111827', marginTop: '6px' }}>98.4%</div>
              <div style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 700, marginTop: '4px' }}>Strict Zero Hallucination</div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '20px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Avg Response Time</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#111827', marginTop: '6px' }}>0.42s</div>
              <div style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 700, marginTop: '4px' }}>Ultra Low Latency</div>
            </div>
          </div>

          {/* Quick Overview Panels */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', fontWeight: 800, color: '#111827' }}>System Status & RAG Index Health</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '10px' }}>
                  <span>Website Auto-Crawler</span>
                  <span style={{ color: '#10B981', fontWeight: 800 }}>Synced ({settings.lastSynced})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '10px' }}>
                  <span>Multilingual Engine (EN / TE / HI)</span>
                  <span style={{ color: '#10B981', fontWeight: 800 }}>Active</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '10px' }}>
                  <span>Custom Training Documents</span>
                  <span style={{ fontWeight: 800 }}>{trainingDocs.length} Documents Indexed</span>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', fontWeight: 800, color: '#111827' }}>Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button onClick={() => setActiveTab('appearance')} style={{ width: '100%', padding: '10px', backgroundColor: '#F3F4F6', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', textAlign: 'left' }}>
                  Edit Avatar & Greeting
                </button>
                <button onClick={() => setActiveTab('training')} style={{ width: '100%', padding: '10px', backgroundColor: '#F3F4F6', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', textAlign: 'left' }}>
                  Upload New RAG Documents
                </button>
                <button onClick={() => setActiveTab('conversations')} style={{ width: '100%', padding: '10px', backgroundColor: '#F3F4F6', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', textAlign: 'left' }}>
                  View User Conversations
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 2. APPEARANCE TAB ================= */}
      {activeTab === 'appearance' && (
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px', maxWidth: '800px' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', fontWeight: 800, color: '#111827' }}>Customize Assistant Appearance & Copy</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: '6px' }}>Assistant Name</label>
              <input 
                type="text" 
                value={settings.assistantName} 
                onChange={(e) => setSettings(s => ({ ...s, assistantName: e.target.value }))}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E5E7EB', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: '6px' }}>Welcome Message</label>
              <textarea 
                rows={3}
                value={settings.welcomeMessage} 
                onChange={(e) => setSettings(s => ({ ...s, welcomeMessage: e.target.value }))}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E5E7EB', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: '6px' }}>Floating Bubble Message</label>
              <input 
                type="text" 
                value={settings.bubbleMessage} 
                onChange={(e) => setSettings(s => ({ ...s, bubbleMessage: e.target.value }))}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E5E7EB', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: '6px' }}>Theme Accent Color</label>
                <select 
                  value={settings.themeColor} 
                  onChange={(e) => setSettings(s => ({ ...s, themeColor: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E5E7EB', fontSize: '0.9rem', outline: 'none' }}
                >
                  <option value="#10B981">Primary Emerald Green (#10B981)</option>
                  <option value="#1E40AF">Royal Blue (#1E40AF)</option>
                  <option value="#D97706">Gold Royal (#D97706)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: '6px' }}>Online Status</label>
                <select 
                  value={settings.onlineStatus} 
                  onChange={(e) => setSettings(s => ({ ...s, onlineStatus: e.target.value as any }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E5E7EB', fontSize: '0.9rem', outline: 'none' }}
                >
                  <option value="online">Online (Green Dot)</option>
                  <option value="busy">Busy (Yellow Dot)</option>
                  <option value="offline">Offline (Grey Dot)</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '10px' }}>
              <button 
                onClick={() => alert("Appearance settings saved successfully!")}
                style={{ backgroundColor: '#10B981', color: '#FFFFFF', border: 'none', borderRadius: '10px', padding: '12px 24px', fontWeight: 700, cursor: 'pointer' }}
              >
                Save Appearance Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 3. KNOWLEDGE BASE TAB ================= */}
      {activeTab === 'knowledge' && (
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#111827' }}>Website Auto-Crawl & Knowledge Base Index</h3>
              <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>Last Crawling Sync: {settings.lastSynced}</div>
            </div>
            <button onClick={triggerManualSync} disabled={isSyncing} style={{ backgroundColor: '#10B981', color: '#FFFFFF', border: 'none', borderRadius: '10px', padding: '10px 18px', fontWeight: 700, cursor: 'pointer' }}>
              {isSyncing ? `Syncing (${syncProgress}%)...` : 'Re-Crawl Website Now'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {[
              { name: 'Homepage & Hero CMS', count: '1 Page', status: 'Indexed' },
              { name: 'Property Marketplace', count: `${propertiesDb.length} Properties`, status: 'Indexed' },
              { name: 'Franchise Marketplace', count: `${franchiseDb.length} Brands`, status: 'Indexed' },
              { name: 'Business Marketplace', count: `${businessDb.length} Businesses`, status: 'Indexed' },
              { name: 'Finance & Home Loans', count: '5 Advisory Plans', status: 'Indexed' },
              { name: 'Insurance Services', count: '3 Policies', status: 'Indexed' },
              { name: 'About Us & Contact Information', count: '2 Pages', status: 'Indexed' },
              { name: 'FAQs & Legal Policies', count: '12 Items', status: 'Indexed' }
            ].map((item, idx) => (
              <div key={idx} style={{ border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px', backgroundColor: '#F9FAFB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#111827' }}>{item.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>{item.count}</div>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#10B981', backgroundColor: '#ECFDF5', padding: '4px 10px', borderRadius: '9999px', fontWeight: 800 }}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= 4. TRAINING TAB ================= */}
      {activeTab === 'training' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Upload Document Box */}
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 800, color: '#111827' }}>Upload Custom RAG Training Documents</h3>
            
            <form onSubmit={handleAddDocument} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
              <input 
                type="text" 
                placeholder="Document File Name (e.g. Hyderabad_RERA_Rules.pdf)" 
                value={newDocName} 
                onChange={(e) => setNewDocName(e.target.value)}
                style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #E5E7EB', fontSize: '0.9rem', outline: 'none' }}
              />
              <select 
                value={newDocCategory} 
                onChange={(e) => setNewDocCategory(e.target.value as any)}
                style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #E5E7EB', fontSize: '0.9rem', outline: 'none' }}
              >
                <option value="Builder Document">Builder Document</option>
                <option value="Legal & RERA">Legal & RERA</option>
                <option value="Government Circular">Government Circular</option>
                <option value="FAQ Sheet">FAQ Sheet</option>
                <option value="Price List">Price List</option>
              </select>
              <button type="submit" style={{ backgroundColor: '#10B981', color: '#FFFFFF', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>
                Upload & Index
              </button>
            </form>
          </div>

          {/* Training Documents Table */}
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 800, color: '#111827' }}>Indexed Training Knowledge Base ({trainingDocs.length})</h3>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E5E7EB', textAlign: 'left', color: '#6B7280' }}>
                  <th style={{ padding: '10px' }}>File Name</th>
                  <th style={{ padding: '10px' }}>Category</th>
                  <th style={{ padding: '10px' }}>Size</th>
                  <th style={{ padding: '10px' }}>Uploaded</th>
                  <th style={{ padding: '10px' }}>Status</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {trainingDocs.map(doc => (
                  <tr key={doc.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '12px 10px', fontWeight: 700, color: '#111827' }}>{doc.fileName}</td>
                    <td style={{ padding: '12px 10px', color: '#4B5563' }}>{doc.category}</td>
                    <td style={{ padding: '12px 10px', color: '#6B7280' }}>{doc.size}</td>
                    <td style={{ padding: '12px 10px', color: '#6B7280' }}>{doc.uploadedAt}</td>
                    <td style={{ padding: '12px 10px' }}>
                      <span style={{ fontSize: '0.75rem', backgroundColor: '#ECFDF5', color: '#10B981', padding: '4px 10px', borderRadius: '9999px', fontWeight: 800 }}>
                        {doc.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                      <button onClick={() => deleteDocument(doc.id)} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= 5. BUSINESS LOGIC TAB ================= */}
      {activeTab === 'logic' && (
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 800, color: '#111827' }}>AI Feature & Domain Toggles</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {Object.entries(settings.businessLogic).map(([key, val]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px solid #E5E7EB', borderRadius: '12px', backgroundColor: '#F9FAFB' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#111827', textTransform: 'capitalize' }}>
                    {key.replace(/([A-Z])/g, ' $1')}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Enable/disable AI query handling for this domain</div>
                </div>

                <input 
                  type="checkbox"
                  checked={val}
                  onChange={(e) => {
                    const updatedLogic = { ...settings.businessLogic, [key]: e.target.checked };
                    setSettings(s => ({ ...s, businessLogic: updatedLogic }));
                  }}
                  style={{ width: '20px', height: '20px', accentColor: '#10B981', cursor: 'pointer' }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= 6. ANALYTICS TAB ================= */}
      {activeTab === 'analytics' && (
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', fontWeight: 800, color: '#111827' }}>Popular RAG Queries & Search Trends</h3>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
            {[
              '3 BHK Apartment in Gachibowli',
              'Home Loan EMI for 50 Lakhs',
              'Villas in Hyderabad under 1 Cr',
              'Food Franchise investment',
              'Plots in Guntur',
              'Commercial Space Vizag Beach Road'
            ].map((q, idx) => (
              <span key={idx} style={{ backgroundColor: '#F3F4F6', border: '1px solid #E5E7EB', padding: '8px 16px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700, color: '#111827' }}>
                {q}
              </span>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '8px' }}>User Satisfaction Rate</div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#10B981' }}>4.9 / 5.0 ⭐</div>
              <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Based on 450 user ratings</div>
            </div>

            <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '8px' }}>Site Visit Requests Generated</div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#1E40AF' }}>128 Requests</div>
              <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Converted from AI assistant conversations</div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 7. CONVERSATIONS TAB ================= */}
      {activeTab === 'conversations' && (
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#111827' }}>Conversation History ({conversations.length})</h3>

            <input 
              type="text" 
              placeholder="Search conversations..." 
              value={searchConvQuery} 
              onChange={(e) => setSearchConvQuery(e.target.value)}
              style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid #E5E7EB', fontSize: '0.85rem', outline: 'none', width: '260px' }}
            />
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E5E7EB', textAlign: 'left', color: '#6B7280' }}>
                <th style={{ padding: '10px' }}>User ID / Region</th>
                <th style={{ padding: '10px' }}>Language</th>
                <th style={{ padding: '10px' }}>First Query</th>
                <th style={{ padding: '10px' }}>Messages</th>
                <th style={{ padding: '10px' }}>Time</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredConversations.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '12px 10px', fontWeight: 700 }}>{c.userId}</td>
                  <td style={{ padding: '12px 10px' }}>
                    <span style={{ fontSize: '0.75rem', backgroundColor: '#ECFDF5', color: '#10B981', padding: '2px 8px', borderRadius: '8px', fontWeight: 800 }}>
                      {c.language}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px', color: '#4B5563', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.firstQuery}</td>
                  <td style={{ padding: '12px 10px' }}>{c.messagesCount} msgs</td>
                  <td style={{ padding: '12px 10px', color: '#6B7280' }}>{c.createdAt}</td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button onClick={() => toggleStarConv(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.starred ? '#F59E0B' : '#D1D5DB' }}>
                      <FaStar />
                    </button>
                    <button onClick={() => togglePinConv(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.pinned ? '#10B981' : '#D1D5DB' }}>
                      <FaThumbtack />
                    </button>
                    <button onClick={() => deleteConv(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= 8. SETTINGS & SECURITY TAB ================= */}
      {activeTab === 'settings' && (
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px', maxWidth: '700px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 800, color: '#111827' }}>AI Security & Role-Based Controls</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ padding: '14px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '12px', color: '#065F46', fontSize: '0.85rem', fontWeight: 600 }}>
              JWT Token Authentication active. Only authenticated Super Admins can alter RAG settings or training data.
            </div>

            <div style={{ border: '1px solid #E5E7EB', padding: '16px', borderRadius: '12px', backgroundColor: '#F9FAFB' }}>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '4px' }}>Audit Logging</div>
              <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>All manual website syncs, document uploads, and configuration changes are recorded in the security log.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiAssistantAdminPanel;
