import React, { useState } from 'react';
import { 
  FaChartLine, FaMagic, FaTag, FaSearch, FaUserTie, 
  FaBullhorn, FaStar, FaCheckCircle, FaExclamationTriangle,
  FaDownload, FaFilePdf, FaFileExcel, FaRobot, FaSync, FaShieldAlt
} from 'react-icons/fa';
import { propertiesDb } from '../db/marketplaceDb';

interface SellerAiProps {
  onNavigate?: (page: string) => void;
}

export const SellerAiIntelligencePanel: React.FC<SellerAiProps> = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'optimizer' | 'pricing' | 'seo' | 'marketing' | 'scorecard'>('dashboard');

  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(propertiesDb[0]?.id || '1');
  const selectedProp = propertiesDb.find(p => p.id === selectedPropertyId) || propertiesDb[0];

  // Generator states
  const [generatedDescLang, setGeneratedDescLang] = useState<'en' | 'te' | 'hi'>('en');
  const [generatedDesc, setGeneratedDesc] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleGenerateDescription = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      if (generatedDescLang === 'te') {
        setGeneratedDesc(`అద్భుతమైన ${selectedProp.bedrooms || 3} BHK విల్లా / ప్లాట్ ${selectedProp.city} ప్రధాన ప్రాంతంలో అందుబాటులో ఉంది. ఆర్ఎఆర్ఏ రక్షణ, గేటెడ్ కమ్యూనిటీ, క్లబ్‌హౌస్ మరియు సమీపంలో ఇంటర్నేషనల్ స్కూల్స్ కలవు.`);
      } else if (generatedDescLang === 'hi') {
        setGeneratedDesc(`प्रीमियम ${selectedProp.bedrooms || 3} BHK लग्जरी प्रॉपर्टी ${selectedProp.city} के प्राइम लोकेशन में बिक्री के लिए उपलब्ध है। 24x7 सुरक्षा, क्लब हाउस और बेहतरीन कनेक्टिविटी के साथ।`);
      } else {
        setGeneratedDesc(`Exquisite ${selectedProp.bedrooms || 3} BHK Premium Residence located in prime ${selectedProp.area}, ${selectedProp.city}. RERA Approved, Gated Security, 100% Vastu Compliant with 24x7 Power Backup & Clubhouse amenities.`);
      }
    }, 600);
  };

  return (
    <div style={{ backgroundColor: '#F9FAFB', minHeight: '100vh', padding: '24px', fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif" }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', backgroundColor: '#FFFFFF', padding: '20px 24px', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
            <FaMagic />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#111827' }}>
              NexOpp Seller AI Intelligence Platform
            </h2>
            <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '2px' }}>
              AI-Powered Listing Optimization, Price Advisor & Buyer Intelligence for Sellers & Brokers
            </div>
          </div>
        </div>

        {/* Property Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151' }}>Target Property:</span>
          <select
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#111827',
              backgroundColor: '#FFFFFF',
              outline: 'none'
            }}
          >
            {propertiesDb.map(p => (
              <option key={p.id} value={p.id}>
                {p.title} (₹ {p.priceDisplay})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #E5E7EB', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
        {[
          { id: 'dashboard', label: '📊 Performance Dashboard' },
          { id: 'optimizer', label: '⚡ AI Listing Optimizer' },
          { id: 'pricing', label: '💰 Price Advisor' },
          { id: 'seo', label: '🔍 SEO & Tag Generator' },
          { id: 'marketing', label: '📢 Marketing AI Assistant' },
          { id: 'scorecard', label: '🏆 Property Scorecard (0-100)' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            style={{
              padding: '12px 18px',
              border: 'none',
              borderBottom: activeTab === t.id ? '3px solid #10B981' : '3px solid transparent',
              backgroundColor: activeTab === t.id ? '#FFFFFF' : 'transparent',
              color: activeTab === t.id ? '#10B981' : '#6B7280',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              borderRadius: '8px 8px 0 0',
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '20px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Total Listing Views</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#111827', marginTop: '6px' }}>{selectedProp.viewsCount || 248}</div>
              <div style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 700, marginTop: '4px' }}>↑ +18% this week</div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '20px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Wishlist Saves</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#10B981', marginTop: '6px' }}>42 Saves</div>
              <div style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 700, marginTop: '4px' }}>High Buyer Intent</div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '20px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Site Visit Enquiries</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#111827', marginTop: '6px' }}>14 Leads</div>
              <div style={{ fontSize: '0.72rem', color: '#3B82F6', fontWeight: 700, marginTop: '4px' }}>5 Visits Scheduled</div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '20px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>AI Health Score</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#10B981', marginTop: '6px' }}>92 / 100</div>
              <div style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 700, marginTop: '4px' }}>Optimal Visibility</div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 2. OPTIMIZER TAB ================= */}
      {activeTab === 'optimizer' && (
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px', maxWidth: '800px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 800, color: '#111827' }}>AI Description & Title Generator</h3>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '6px' }}>Target Language:</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setGeneratedDescLang('en')} style={{ padding: '8px 16px', borderRadius: '8px', border: generatedDescLang === 'en' ? '2px solid #10B981' : '1px solid #CBD5E1', backgroundColor: generatedDescLang === 'en' ? '#ECFDF5' : '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}>English</button>
              <button onClick={() => setGeneratedDescLang('te')} style={{ padding: '8px 16px', borderRadius: '8px', border: generatedDescLang === 'te' ? '2px solid #10B981' : '1px solid #CBD5E1', backgroundColor: generatedDescLang === 'te' ? '#ECFDF5' : '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}>తెలుగు</button>
              <button onClick={() => setGeneratedDescLang('hi')} style={{ padding: '8px 16px', borderRadius: '8px', border: generatedDescLang === 'hi' ? '2px solid #10B981' : '1px solid #CBD5E1', backgroundColor: generatedDescLang === 'hi' ? '#ECFDF5' : '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}>हिन्दी</button>
            </div>
          </div>

          <button
            onClick={handleGenerateDescription}
            disabled={isGenerating}
            style={{ backgroundColor: '#10B981', color: '#FFFFFF', border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FaMagic /> {isGenerating ? 'Generating Description...' : 'Generate AI Description'}
          </button>

          {generatedDesc && (
            <div style={{ marginTop: '20px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', padding: '16px', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10B981', textTransform: 'uppercase', marginBottom: '6px' }}>Generated Property Copy</div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#111827', lineHeight: 1.6 }}>{generatedDesc}</p>
            </div>
          )}
        </div>
      )}

      {/* ================= 3. PRICING TAB ================= */}
      {activeTab === 'pricing' && (
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px', maxWidth: '800px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 800, color: '#111827' }}>AI Price Advisor & Competitor Benchmark</h3>
          <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', padding: '16px', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#065F46' }}>Current Listing Price: ₹ {selectedProp.priceDisplay}</div>
            <div style={{ fontSize: '0.8rem', color: '#047857', marginTop: '4px' }}>
              AI Price Recommendation: ₹ {selectedProp.priceDisplay} is optimally competitive for {selectedProp.area}, {selectedProp.city} based on 14 recent sales.
            </div>
          </div>
        </div>
      )}

      {/* ================= 4. SCORECARD TAB ================= */}
      {activeTab === 'scorecard' && (
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px', maxWidth: '800px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 800, color: '#111827' }}>Property Scorecard & Optimization Tips</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#10B981' }}>92 / 100</div>
          <div style={{ fontSize: '0.85rem', color: '#4B5563', marginTop: '6px' }}>
            ✓ RERA Approved • High Resolution Photos • Verified Seller Credentials
          </div>
        </div>
      )}
    </div>
  );
};
