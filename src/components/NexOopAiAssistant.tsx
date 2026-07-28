import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  FaPaperPlane, FaTimes, FaCheckCircle, 
  FaHeart, FaRegHeart, FaMapMarkerAlt, 
  FaRedo
} from 'react-icons/fa';
import { 
  propertiesDb, franchiseDb, businessDb, demandRegionsDb, 
  dealersDb, siteSettingsDb, getDistance 
} from '../db/marketplaceDb';
import type { PropertyListing } from '../db/marketplaceDb';
import { useWishlist } from '../context/WishlistContext';

interface NexOopAiAssistantProps {
  onNavigate?: (page: string) => void;
  onPropertyClick?: (id: string) => void;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  type?: 'welcome' | 'text' | 'options' | 'city_input' | 'searching' | 'results' | 'emi_calc' | 'comparison';
  options?: { label: string; value: string; action?: string }[];
  properties?: (PropertyListing & { aiMatchScore: number })[];
}

interface UserMemoryState {
  intent?: string;
  budget?: string;
  city?: string;
  type?: string;
  purpose?: string;
  recentSearches: string[];
}

// Language Types supported by RAG Engine
type DetectedLanguage = 'en' | 'te' | 'hi';

// Multilingual Auto-Detection Helper
const detectQueryLanguage = (text: string): DetectedLanguage => {
  // Telugu Unicode Range check (\u0C00-\u0C7F)
  if (/[\u0C00-\u0C7F]/.test(text) || /\b(నమస్కారం|ఇల్లు|ప్లాట్|కొనాలి|అద్దె|ధర|హైదరాబాద్|గుంటూరు|వైజాగ్)\b/i.test(text)) {
    return 'te';
  }
  // Hindi / Devanagari Unicode Range check (\u0900-\u097F)
  if (/[\u0900-\u097F]/.test(text) || /\b(नमस्ते|घर|प्लॉट|खरीदना|किराया|कीमत|हैदराबाद|गुंटूर|वैजाग)\b/i.test(text)) {
    return 'hi';
  }
  return 'en';
};

// 3D Realistic Professional Female AI Avatar (Blue Blazer, White Shirt, Friendly Smile, Green Online Dot)
const FemaleAiAvatar: React.FC<{ size?: number; className?: string }> = ({ size = 48, className = '' }) => (
  <div 
    style={{ 
      width: `${size}px`, 
      height: `${size}px`, 
      borderRadius: '50%', 
      position: 'relative',
      overflow: 'visible',
      flexShrink: 0
    }} 
    className={className}
  >
    <img
      src="/assets/nexoop_female_ai_avatar.jpg"
      alt="NexOop 3D Female AI Consultant"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        objectFit: 'cover',
        border: '2px solid #E5E7EB',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
      }}
      onError={(e) => {
        // Fallback to SVG if image loading fails
        e.currentTarget.style.display = 'none';
      }}
    />

    {/* Green Online Status Dot */}
    <span 
      style={{ 
        position: 'absolute', 
        bottom: '1px', 
        right: '1px', 
        width: '13px', 
        height: '13px', 
        backgroundColor: '#10B981', 
        borderRadius: '50%', 
        border: '2.5px solid #FFFFFF',
        boxShadow: '0 0 8px rgba(16, 185, 129, 0.8)',
        zIndex: 5
      }} 
    />
  </div>
);

export const NexOopAiAssistant: React.FC<NexOopAiAssistantProps> = ({ onNavigate, onPropertyClick }) => {
  const { toggleWishlist, isWishlisted } = useWishlist();
  
  // State toggles
  const [isOpen, setIsOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(true);
  const [inputText, setInputText] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // User Session Memory State (Persisted in localStorage)
  const [userMemory, setUserMemory] = useState<UserMemoryState>(() => {
    try {
      const saved = localStorage.getItem('nexopp_ai_user_memory');
      return saved ? JSON.parse(saved) : { recentSearches: [] };
    } catch (e) {
      return { recentSearches: [] };
    }
  });

  useEffect(() => {
    localStorage.setItem('nexopp_ai_user_memory', JSON.stringify(userMemory));
  }, [userMemory]);

  // Guided Questionnaire State Flow
  const [guidedStep, setGuidedStep] = useState<'idle' | 'intent' | 'budget' | 'city' | 'custom_city' | 'type' | 'purpose' | 'complete'>('idle');
  const [customCityInput, setCustomCityInput] = useState('');

  // Comparison State
  const [compareItems, setCompareItems] = useState<PropertyListing[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // EMI Calculator State inside AI
  const [emiAmount, setEmiAmount] = useState<number>(50); // Lakhs
  const [emiRate, setEmiRate] = useState<number>(8.5); // %
  const [emiTenure, setEmiTenure] = useState<number>(20); // Years

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial Welcome Messages
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: "Hi 👋 I'm **NexOop AI**, Your Retrieval-Augmented Property Consultant. I can help you with Buy Property, Rent Property, Investment, Business, Franchise, Finance, Insurance, Commercial, Plots, Property Comparison, EMI, Site Visits, Navigation, and General Questions.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'welcome',
      options: [
        { label: '🏠 Buy Property', value: 'I want to buy a property', action: 'start_buy' },
        { label: '🔑 Rent Property', value: 'I want to rent a property', action: 'start_rent' },
        { label: '📈 Investment', value: 'Looking for investment opportunities', action: 'start_invest' },
        { label: '💼 Commercial', value: 'Commercial spaces & Offices', action: 'start_commercial' },
        { label: '🚜 Plots & Land', value: 'Plots and Land properties', action: 'start_plot' },
        { label: '🏢 Franchise', value: 'Explore Franchise Business', action: 'nav_franchise' },
        { label: '💰 EMI Calculator', value: 'Calculate loan EMI', action: 'open_emi' },
        { label: '⚖️ Compare Properties', value: 'Compare saved properties', action: 'open_compare' }
      ]
    }
  ]);

  // Floating Speech Bubble Timers
  useEffect(() => {
    // Auto hides bubble after 5 seconds
    const hideTimer = setTimeout(() => {
      setShowBubble(false);
    }, 5000);

    return () => clearTimeout(hideTimer);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setShowBubble(false);
      return;
    }

    // Returns bubble after 30 seconds of inactivity if closed
    const returnTimer = setTimeout(() => {
      if (!isOpen) {
        setShowBubble(true);
      }
    }, 30000);

    return () => clearTimeout(returnTimer);
  }, [isOpen]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isSearching]);

  // Calculate monthly EMI
  const calculatedEmiVal = useMemo(() => {
    const P = emiAmount * 100000;
    const r = emiRate / (12 * 100);
    const n = emiTenure * 12;
    if (r === 0) return Math.round(P / n);
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(emi);
  }, [emiAmount, emiRate, emiTenure]);

  // RAG RETRIEVAL ENGINE (Queries website databases & rules strictly without hallucination)
  const performRAGRetrieval = (userQuery: string): { text: string; properties?: (PropertyListing & { aiMatchScore: number })[]; type?: string } => {
    const lang = detectQueryLanguage(userQuery);
    const lower = userQuery.toLowerCase();

    // Store query in user memory
    setUserMemory(prev => ({
      ...prev,
      recentSearches: Array.from(new Set([userQuery, ...(prev.recentSearches || [])])).slice(0, 5)
    }));

    // 1. EMI / Loan / Finance RAG Lookup
    if (lower.includes('emi') || lower.includes('loan') || lower.includes('interest') || lower.includes('बैंक') || lower.includes('రుణం')) {
      if (lang === 'te') {
        return { text: "💰 **NexOop హోమ్ లోన్ ఇఎమ్‌ఐ క్యాలిక్యులేటర్**: మీ గృహ రుణం నెలకు ఎంత అవుతుందో ఇక్కడ గణించండి:" };
      }
      if (lang === 'hi') {
        return { text: "💰 **NexOop होम लोन ईएमआई कैलकुलेटर**: अपनी मासिक ईएमआई की गणना यहाँ करें:" };
      }
      return { text: "💰 **NexOop Instant Home Loan EMI Calculator**: Adjust your loan parameters below:" };
    }

    // 2. Franchise RAG Search
    if (lower.includes('franchise') || lower.includes('ఫ్రాంచైజ్') || lower.includes('फ्रेंचाइजी')) {
      const activeFranchises = franchiseDb;
      const count = activeFranchises.length;
      if (lang === 'te') {
        return { text: `🏢 మా వద్ద **${count} పరిశీలించిన ఫ్రాంచైజ్ బ్రాండ్లు** (ఆహారం, రిటైల్, ఆరోగ్య రక్షణ) అందుబాటులో ఉన్నాయి. ఫ్రాంచైజ్ మార్కెట్‌ప్లేస్‌ను పరిశీలించడానికి దిగువ బటన్ క్లిక్ చేయండి.` };
      }
      if (lang === 'hi') {
        return { text: `🏢 हमारे पास **${count} सत्यापित फ्रेंचाइजी ब्रांड** उपलब्ध हैं। फ्रेंचाइजी देखने के लिए नीचे दिए गए विकल्प पर क्लिक करें।` };
      }
      return { text: `🏢 We have **${count} Verified Franchise Brands** across Food, Retail, and Healthcare available in AP & Telangana.` };
    }

    // 3. Business Acquisition RAG Search
    if (lower.includes('business') || lower.includes('వ్యాపారం') || lower.includes('व्यापार')) {
      const count = businessDb.length;
      if (lang === 'te') {
        return { text: `💼 మా డేటాబేస్‌లో **${count} నడుస్తున్న వ్యాపార అవకాశాలు** అందుబాటులో ఉన్నాయి.` };
      }
      if (lang === 'hi') {
        return { text: `💼 हमारे डेटाबेस में **${count} चालू व्यवसाय अधिग्रहण अवसर** उपलब्ध हैं।` };
      }
      return { text: `💼 Found **${count} Operational Business Opportunities** available for acquisition/partnership.` };
    }

    // 4. Contact / Support Info RAG Lookup
    if (lower.includes('contact') || lower.includes('phone') || lower.includes('email') || lower.includes('support') || lower.includes('సంప్రదించండి') || lower.includes('संपर्क')) {
      const phone = '+91 98765 43210';
      const email = 'support@nexoop.in';
      if (lang === 'te') {
        return { text: `📞 **NexOop కస్టమర్ కేర్**: \n- ఫోన్: **${phone}**\n- ఈమెయిల్: **${email}**\n- పని వేళలు: ఉదయం 9:00 - రాత్రి 8:00 (సోమ - శని)` };
      }
      if (lang === 'hi') {
        return { text: `📞 **NexOop कस्टमर केयर**: \n- फोन: **${phone}**\n- ईमेल: **${email}**\n- कार्य समय: सुबह 9:00 - रात 8:00` };
      }
      return { text: `📞 **NexOop Customer Support**: \n- Phone: **${phone}**\n- Email: **${email}**\n- Working Hours: 9:00 AM - 8:00 PM (Mon-Sat)` };
    }

    // 5. Property RAG Retrieval Search across Database
    let matchedProps = propertiesDb.filter(p => {
      // Check City / Area match
      if (userMemory.city && !p.city.toLowerCase().includes(userMemory.city.toLowerCase()) && !p.state.toLowerCase().includes(userMemory.city.toLowerCase())) {
        return false;
      }
      // Check Query Location matches
      if (lower.includes('hyderabad') && !p.city.toLowerCase().includes('hyderabad')) return false;
      if (lower.includes('guntur') && !p.city.toLowerCase().includes('guntur')) return false;
      if (lower.includes('vizag') && !p.city.toLowerCase().includes('visakhapatnam') && !p.city.toLowerCase().includes('vizag')) return false;

      // Category match
      if (lower.includes('villa') && !p.category.toLowerCase().includes('villa')) return false;
      if (lower.includes('plot') && !p.category.toLowerCase().includes('plot') && !p.category.toLowerCase().includes('land')) return false;
      if (lower.includes('house') && !p.category.toLowerCase().includes('house') && !p.category.toLowerCase().includes('villa')) return false;
      if (lower.includes('flat') && !p.category.toLowerCase().includes('apartment')) return false;

      return true;
    });

    if (matchedProps.length === 0) {
      matchedProps = propertiesDb.slice(0, 3); // Fallback to top database listings
    }

    // RAG AI Match Scoring
    const scored = matchedProps.map(p => {
      let score = 80;
      if (p.verified) score += 10;
      if (p.premium) score += 5;
      if (p.readyToMove) score += 4;
      if (score > 99) score = 99;
      return { ...p, aiMatchScore: score };
    }).sort((a, b) => b.aiMatchScore - a.aiMatchScore).slice(0, 3);

    if (lang === 'te') {
      return {
        text: `🎉 మా స్థిరాస్తి డేటాబేస్ నుండి పొందిన **ముఖ్యమైన ప్రాపర్టీలు**:`,
        properties: scored,
        type: 'results'
      };
    }

    if (lang === 'hi') {
      return {
        text: `🎉 हमारे डेटाबेस से प्राप्त **शीर्ष संपत्तियां**:`,
        properties: scored,
        type: 'results'
      };
    }

    return {
      text: `🎉 **Top RAG Retrieved Verified Properties** matching your profile:`,
      properties: scored,
      type: 'results'
    };
  };

  // Handle Option Clicks from Guided Questionnaire
  const handleOptionClick = (opt: { label: string; value: string; action?: string }) => {
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: opt.label,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);

    if (opt.action === 'nav_franchise') {
      onNavigate?.('franchisePage');
      appendAiResponse("Navigating you to our **Verified Franchise Marketplace**...");
      return;
    }

    if (opt.action === 'open_emi') {
      appendEmiCalculator();
      return;
    }

    if (opt.action === 'open_compare') {
      openComparisonDrawer();
      return;
    }

    // Step 1: Start Buy / Rent Flow -> Ask Budget
    if (opt.action === 'start_buy' || opt.action === 'start_rent' || opt.action === 'start_invest' || opt.action === 'start_commercial' || opt.action === 'start_plot') {
      setUserMemory(prev => ({ ...prev, intent: opt.label }));
      setGuidedStep('budget');
      
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text: "Great choice! What is your target **Budget Range**?",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'options',
            options: [
              { label: 'Under ₹ 25 Lakhs', value: '25' },
              { label: '₹ 25L - ₹ 50 Lakhs', value: '50' },
              { label: '₹ 50L - ₹ 1 Crore', value: '100' },
              { label: 'Above ₹ 1 Crore+', value: '200' }
            ]
          }
        ]);
      }, 500);
      return;
    }

    // Step 2: Budget selected -> Ask City
    if (guidedStep === 'budget') {
      setUserMemory(prev => ({ ...prev, budget: opt.label }));
      setGuidedStep('city');

      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text: "Select your preferred **City / Region**:",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'options',
            options: [
              { label: 'Guntur', value: 'Guntur' },
              { label: 'Vizag', value: 'Vizag' },
              { label: 'Hyderabad', value: 'Hyderabad' },
              { label: 'Others', value: 'Others' }
            ]
          }
        ]);
      }, 500);
      return;
    }

    // Step 3: City selected
    if (guidedStep === 'city') {
      if (opt.value === 'Others') {
        setGuidedStep('custom_city');
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              id: `ai-${Date.now()}`,
              sender: 'ai',
              text: "Please enter your city:",
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: 'city_input'
            }
          ]);
        }, 500);
        return;
      }

      setUserMemory(prev => ({ ...prev, city: opt.value }));
      askPropertyTypeStep();
      return;
    }

    // Step 4: Property Type selected -> Ask Purpose
    if (guidedStep === 'type') {
      setUserMemory(prev => ({ ...prev, type: opt.value }));
      setGuidedStep('purpose');

      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text: "What is your main **Purpose** for this property?",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'options',
            options: [
              { label: 'Living', value: 'Living' },
              { label: 'Investment', value: 'Investment' },
              { label: 'Rental Income', value: 'Rental Income' },
              { label: 'Business', value: 'Business' }
            ]
          }
        ]);
      }, 500);
      return;
    }

    // Step 5: Purpose selected -> RAG Database Search
    if (guidedStep === 'purpose') {
      const updatedMem = { ...userMemory, purpose: opt.value };
      setUserMemory(updatedMem);
      executeRAGSearch(updatedMem);
      return;
    }

    appendAiResponse(`I understand you're interested in ${opt.label}. Let me search our verified database...`);
  };

  const askPropertyTypeStep = () => {
    setGuidedStep('type');
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: "Select preferred **Property Type**:",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'options',
          options: [
            { label: 'Apartment', value: 'Apartment' },
            { label: 'Villa', value: 'Villa' },
            { label: 'Independent House', value: 'House' },
            { label: 'Commercial', value: 'Commercial' },
            { label: 'Plot', value: 'Plot' },
            { label: 'Farm Land', value: 'Plot' }
          ]
        }
      ]);
    }, 500);
  };

  const handleCustomCitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCityInput.trim()) return;
    const cityVal = customCityInput.trim();
    
    setMessages(prev => [
      ...prev,
      {
        id: `u-${Date.now()}`,
        sender: 'user',
        text: cityVal,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    setUserMemory(prev => ({ ...prev, city: cityVal }));
    setCustomCityInput('');
    askPropertyTypeStep();
  };

  const executeRAGSearch = (memory: UserMemoryState) => {
    setIsSearching(true);
    setGuidedStep('complete');

    setMessages(prev => [
      ...prev,
      {
        id: `ai-search-${Date.now()}`,
        sender: 'ai',
        text: "⚡ RAG Engine: Retrieving verified listings from database...",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'searching'
      }
    ]);

    setTimeout(() => {
      setIsSearching(false);

      const scoredProperties = propertiesDb.map(p => {
        let score = 78;

        if (memory.city && (p.city.toLowerCase().includes(memory.city.toLowerCase()) || p.state.toLowerCase().includes(memory.city.toLowerCase()))) {
          score += 14;
        }

        if (memory.type && p.category.toLowerCase().includes(memory.type.toLowerCase())) {
          score += 6;
        }

        if (p.verified) score += 1;
        if (p.premium) score += 1;
        if (score > 99) score = 99;

        return { ...p, aiMatchScore: score };
      }).sort((a, b) => b.aiMatchScore - a.aiMatchScore).slice(0, 4);

      setMessages(prev => [
        ...prev.filter(m => m.type !== 'searching'),
        {
          id: `ai-res-${Date.now()}`,
          sender: 'ai',
          text: `🎉 Top **${scoredProperties.length} RAG Verified Matches** retrieved for your criteria:`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'results',
          properties: scoredProperties
        }
      ]);
    }, 1200);
  };

interface IntentValidationResult {
  confidenceScore: number;
  intentCategory: 'greeting' | 'appreciation' | 'gibberish' | 'real_estate_query' | 'help';
  customResponse?: string;
}

// Intent Confidence & Validation Engine
const validateIntentConfidence = (query: string): IntentValidationResult => {
  const trimmed = query.trim();
  const lower = trimmed.toLowerCase();

  // Greetings Detection
  const greetingKeywords = ['hello', 'hi', 'hey', 'namaste', 'నమస్కారం', 'नमस्ते', 'good morning', 'good afternoon', 'good evening'];
  if (greetingKeywords.some(g => lower === g || lower === g + '!' || lower.startsWith(g + ' ') || lower.endsWith(' ' + g))) {
    return {
      confidenceScore: 100,
      intentCategory: 'greeting',
      customResponse: "Hi! 👋 I'm NexOop AI. How can I help you today?"
    };
  }

  // Appreciation / Thanks Detection
  const thanksKeywords = ['thanks', 'thank you', 'thx', 'ధన్యవాదాలు', 'धन्यवाद', 'thanku'];
  if (thanksKeywords.some(t => lower.includes(t))) {
    return {
      confidenceScore: 100,
      intentCategory: 'appreciation',
      customResponse: "You're welcome! Let me know if you'd like help finding a property or answering any real estate questions."
    };
  }

  // Real Estate Keywords & Intent Signals
  const realEstateKeywords = [
    'bhk', 'flat', 'flats', 'apartment', 'villa', 'house', 'plot', 'land', 'commercial',
    'buy', 'sell', 'rent', 'price', 'lakh', 'lakhs', 'cr', 'crore', 'guntur', 'hyderabad',
    'vizag', 'vijayawada', 'emi', 'loan', 'franchise', 'business', 'invest', 'investment',
    'contact', 'phone', 'support', 'compare', 'comparison', 'builder', 'rera', 'location',
    'కొనాలి', 'అద్దె', 'ధర', 'ఇల్లు', 'ప్లాట్', 'హైదరాబాద్', 'గుంటూరు', 'खरीदना', 'किराया', 'घर', 'प्लॉट'
  ];

  const hasRealEstateKeyword = realEstateKeywords.some(k => lower.includes(k));

  // Specific Gibberish Detection (e.g. "rgr", "asdf", "qwerty", random single word < 5 chars without real estate keywords)
  const gibberishPattern = /^[a-z]{1,4}$|^[0-9]+$|^(asdf|qwerty|zxcv|rgr|abcd|test|1234|aaaa|zzzz|xxxx)$/i;
  
  if (gibberishPattern.test(lower) && !hasRealEstateKeyword) {
    if (lower === 'rgr') {
      return {
        confidenceScore: 20, // Confidence < 70%
        intentCategory: 'gibberish',
        customResponse: "I'm sorry, I couldn't understand your request. Could you tell me what you're looking for?"
      };
    }
    return {
      confidenceScore: 20, // Confidence < 70%
      intentCategory: 'gibberish',
      customResponse: "I didn't quite catch that. Are you looking to buy, rent, invest, compare properties, or calculate an EMI?"
    };
  }

  // Vague / Random Input without Real Estate signals
  if (!hasRealEstateKeyword && trimmed.length < 8) {
    return {
      confidenceScore: 35, // Confidence < 70%
      intentCategory: 'gibberish',
      customResponse: "I didn't quite catch that. Are you looking to buy, rent, invest, compare properties, or calculate an EMI?"
    };
  }

  // Valid Real Estate Intent detected
  if (hasRealEstateKeyword || trimmed.length >= 10) {
    return {
      confidenceScore: 95, // Confidence >= 70%
      intentCategory: 'real_estate_query'
    };
  }

  // Low confidence default (<70%)
  return {
    confidenceScore: 40,
    intentCategory: 'help',
    customResponse: "I'm sorry, I couldn't understand your request. Could you tell me what you're looking for?"
  };
};

  // Free-form User Chat Submit
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userQuery = inputText.trim();
    setInputText('');

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: userQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);

    // 1. Validate Intent & Confidence Score
    const intentValidation = validateIntentConfidence(userQuery);

    // 2. If Confidence < 70%: Do NOT search DB, do NOT call RAG, do NOT return property recommendations
    if (intentValidation.confidenceScore < 70) {
      setTimeout(() => {
        appendAiResponse(intentValidation.customResponse || "I didn't quite catch that. Are you looking to buy, rent, invest, compare properties, or calculate an EMI?");
      }, 400);
      return;
    }

    // 3. Special Conversational Intents (Greetings / Appreciation)
    if (intentValidation.customResponse && intentValidation.intentCategory !== 'real_estate_query') {
      setTimeout(() => {
        appendAiResponse(intentValidation.customResponse!);
      }, 400);
      return;
    }

    // 4. Real Estate Intent Detected (Confidence >= 70%) -> Run RAG Search Workflow
    setIsSearching(true);

    setTimeout(() => {
      setIsSearching(false);
      const ragResult = performRAGRetrieval(userQuery);

      if (ragResult.type === 'results' && ragResult.properties) {
        setMessages(prev => [
          ...prev,
          {
            id: `ai-rag-${Date.now()}`,
            sender: 'ai',
            text: ragResult.text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'results',
            properties: ragResult.properties
          }
        ]);
      } else if (userQuery.toLowerCase().includes('emi') || userQuery.toLowerCase().includes('loan')) {
        appendEmiCalculator();
      } else {
        appendAiResponse(ragResult.text);
      }
    }, 700);
  };

  const appendAiResponse = (text: string) => {
    setMessages(prev => [
      ...prev,
      {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const appendEmiCalculator = () => {
    setMessages(prev => [
      ...prev,
      {
        id: `ai-emi-${Date.now()}`,
        sender: 'ai',
        text: "💰 **NexOop Home Loan EMI Calculator**",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'emi_calc'
      }
    ]);
  };

  const openComparisonDrawer = () => {
    if (compareItems.length === 0) {
      setCompareItems(propertiesDb.slice(0, 2));
    }
    setShowCompareModal(true);
  };

  const toggleCompareItem = (prop: PropertyListing) => {
    setCompareItems(prev => {
      const exists = prev.some(p => p.id === prop.id);
      if (exists) {
        return prev.filter(p => p.id !== prop.id);
      }
      if (prev.length >= 3) {
        alert("You can compare up to 3 properties at a time.");
        return prev;
      }
      return [...prev, prop];
    });
  };

  const resetChat = () => {
    setGuidedStep('idle');
    setUserMemory({ recentSearches: [] });
    setMessages([
      {
        id: `m-reset-${Date.now()}`,
        sender: 'ai',
        text: "Hi 👋 I'm **NexOop AI**, Your Property Consultant. How can I assist you today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'welcome',
        options: [
          { label: '🏠 Buy Property', value: 'I want to buy a property', action: 'start_buy' },
          { label: '🔑 Rent Property', value: 'I want to rent a property', action: 'start_rent' },
          { label: '📈 Investment', value: 'Looking for investment opportunities', action: 'start_invest' },
          { label: '💼 Commercial', value: 'Commercial spaces & Offices', action: 'start_commercial' },
          { label: '🚜 Plots & Land', value: 'Plots and Land properties', action: 'start_plot' },
          { label: '💰 EMI Calculator', value: 'Calculate loan EMI', action: 'open_emi' }
        ]
      }
    ]);
  };

  return (
    <>
      {/* ================= 1. FLOATING SPEECH BUBBLE ================= */}
      {showBubble && !isOpen && (
        <div 
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '96px',
            right: '24px',
            zIndex: 99998,
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '20px',
            padding: '14px 18px',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
            cursor: 'pointer',
            animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            maxWidth: '280px',
            fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif"
          }}
        >
          <FemaleAiAvatar size={38} />
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111827', lineHeight: 1.25 }}>
              Need help finding your perfect property?
            </div>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#10B981', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Ask NexOop AI ⚡
            </div>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowBubble(false);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#9CA3AF',
              cursor: 'pointer',
              fontSize: '0.85rem',
              padding: '2px'
            }}
            title="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

      {/* ================= 2. FLOATING ACTION BUTTON (FAB) ================= */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setShowBubble(false);
          }}
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            border: '2px solid #E5E7EB',
            boxShadow: '0 10px 30px rgba(16, 185, 129, 0.35)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            position: 'relative',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            transform: isOpen ? 'scale(0.92)' : 'scale(1)',
            backdropFilter: 'blur(12px)'
          }}
          title="Open NexOop AI Property Assistant"
        >
          {/* Subtle Ring Pulse Animation */}
          <style>{`
            @keyframes ringPulse {
              0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); }
              70% { box-shadow: 0 0 0 12px rgba(16, 185, 129, 0); }
              100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
            }
            .ai-fab-pulse {
              animation: ringPulse 2.5s infinite;
            }
          `}</style>
          <div className="ai-fab-pulse" style={{ width: '100%', height: '100%', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isOpen ? (
              <FaTimes style={{ fontSize: '1.4rem', color: '#111827' }} />
            ) : (
              <FemaleAiAvatar size={54} />
            )}
          </div>
        </button>
      </div>

      {/* ================= 3. CHAT WINDOW MODAL ================= */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '96px',
            right: '24px',
            zIndex: 999999,
            width: '420px',
            maxWidth: 'calc(100vw - 32px)',
            height: '620px',
            maxHeight: 'calc(100vh - 120px)',
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
            animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
        >
          {/* ----- CHAT HEADER ----- */}
          <div
            style={{
              backgroundColor: '#111827',
              color: '#FFFFFF',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FemaleAiAvatar size={42} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                    NexOop AI
                  </span>
                  <FaCheckCircle style={{ color: '#10B981', fontSize: '0.85rem' }} title="Verified RAG Assistant" />
                </div>
                <div style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 500 }}>
                  Your Property Consultant
                </div>
                <div style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', backgroundColor: '#10B981', borderRadius: '50%', display: 'inline-block' }} />
                  Online Status • RAG Engine
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={resetChat}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#D1D5DB',
                  borderRadius: '8px',
                  padding: '6px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="Restart Chat"
              >
                <FaRedo />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  padding: '4px'
                }}
                title="Close Window"
              >
                ✕
              </button>
            </div>
          </div>

          {/* ----- CHAT MESSAGES BODY ----- */}
          <div
            style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              backgroundColor: '#F9FAFB',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                {/* Bubble Container */}
                <div
                  style={{
                    maxWidth: '85%',
                    backgroundColor: msg.sender === 'user' ? '#10B981' : '#FFFFFF',
                    color: msg.sender === 'user' ? '#FFFFFF' : '#111827',
                    padding: '12px 16px',
                    borderRadius: msg.sender === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                    border: msg.sender === 'user' ? 'none' : '1px solid #E5E7EB',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                    fontSize: '0.88rem',
                    lineHeight: 1.5
                  }}
                >
                  {/* Markdown bold formatting parsing */}
                  <div>
                    {msg.text.split('**').map((part, idx) => 
                      idx % 2 === 1 ? <strong key={idx} style={{ fontWeight: 800 }}>{part}</strong> : part
                    )}
                  </div>

                  {/* Options Chips */}
                  {msg.options && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                      {msg.options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => handleOptionClick(opt)}
                          style={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #10B981',
                            color: '#10B981',
                            padding: '8px 14px',
                            borderRadius: '20px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: '0 2px 6px rgba(16, 185, 129, 0.1)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#10B981';
                            e.currentTarget.style.color = '#FFFFFF';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#FFFFFF';
                            e.currentTarget.style.color = '#10B981';
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Custom City Input Step */}
                  {msg.type === 'city_input' && (
                    <form onSubmit={handleCustomCitySubmit} style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <input
                        type="text"
                        placeholder="City not listed"
                        value={customCityInput}
                        onChange={(e) => setCustomCityInput(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid #E5E7EB',
                          fontSize: '0.8rem',
                          outline: 'none'
                        }}
                      />
                      <button
                        type="submit"
                        style={{
                          backgroundColor: '#10B981',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 14px',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          cursor: 'pointer'
                        }}
                      >
                        Submit
                      </button>
                    </form>
                  )}

                  {/* Built-in Interactive EMI Calculator */}
                  {msg.type === 'emi_calc' && (
                    <div style={{ marginTop: '12px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', padding: '14px', borderRadius: '12px' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Loan Amount: ₹ {emiAmount} Lakhs
                      </div>
                      <input 
                        type="range" 
                        min="5" 
                        max="300" 
                        value={emiAmount} 
                        onChange={(e) => setEmiAmount(Number(e.target.value))}
                        style={{ width: '100%', accentColor: '#10B981', marginBottom: '12px' }}
                      />

                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Interest Rate: {emiRate}% • Tenure: {emiTenure} Yrs
                      </div>

                      <div style={{ backgroundColor: '#10B981', color: '#FFFFFF', padding: '10px', borderRadius: '10px', textAlign: 'center', marginTop: '10px' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', opacity: 0.9 }}>Estimated Monthly EMI</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 900 }}>₹ {calculatedEmiVal.toLocaleString()} / month</div>
                      </div>
                    </div>
                  )}

                  {/* Ranked Properties Results Cards */}
                  {msg.type === 'results' && msg.properties && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                      {msg.properties.map((prop) => (
                        <div
                          key={prop.id}
                          style={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E5E7EB',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                        >
                          {/* Image & Match Badge */}
                          <div style={{ position: 'relative', height: '110px' }}>
                            <img src={prop.image} alt={prop.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            
                            {/* AI Match % Badge */}
                            <div
                              style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                background: 'linear-gradient(135deg, #10B981, #059669)',
                                color: '#FFFFFF',
                                padding: '4px 10px',
                                borderRadius: '9999px',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                              }}
                            >
                              ⚡ {prop.aiMatchScore}% Match
                            </div>

                            {/* Verified Badge */}
                            {prop.verified && (
                              <div
                                style={{
                                  position: 'absolute',
                                  top: '8px',
                                  left: '8px',
                                  backgroundColor: 'rgba(16, 185, 129, 0.9)',
                                  color: '#FFFFFF',
                                  padding: '2px 8px',
                                  borderRadius: '9999px',
                                  fontSize: '0.65rem',
                                  fontWeight: 800
                                }}
                              >
                                Verified Badge
                              </div>
                            )}

                            {/* Premium Badge */}
                            {prop.premium && (
                              <div
                                style={{
                                  position: 'absolute',
                                  top: '32px',
                                  left: '8px',
                                  backgroundColor: '#1E40AF',
                                  color: '#FFFFFF',
                                  padding: '2px 8px',
                                  borderRadius: '9999px',
                                  fontSize: '0.65rem',
                                  fontWeight: 800
                                }}
                              >
                                Premium Badge
                              </div>
                            )}
                          </div>

                          {/* Details */}
                          <div style={{ padding: '12px' }}>
                            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#111827', margin: '0 0 2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {prop.title}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                              <FaMapMarkerAlt style={{ color: '#10B981' }} /> {prop.area}, {prop.city}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F3F4F6', paddingTop: '8px', marginTop: '4px' }}>
                              <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#10B981' }}>
                                ₹ {prop.priceDisplay}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: '#4B5563', fontWeight: 600 }}>
                                {prop.bedrooms ? `${prop.bedrooms} BHK • ` : ''}{prop.areaSqFt}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                              <button
                                onClick={() => {
                                  onPropertyClick?.(prop.id);
                                  setIsOpen(false);
                                }}
                                style={{
                                  flex: 1,
                                  backgroundColor: '#10B981',
                                  color: '#FFFFFF',
                                  border: 'none',
                                  borderRadius: '8px',
                                  padding: '6px',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                View Details
                              </button>

                              <button
                                onClick={() => toggleWishlist(prop.id)}
                                style={{
                                  padding: '6px 10px',
                                  backgroundColor: isWishlisted(prop.id) ? '#FEF2F2' : '#F3F4F6',
                                  color: isWishlisted(prop.id) ? '#EF4444' : '#4B5563',
                                  border: '1px solid #E5E7EB',
                                  borderRadius: '8px',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                                title="Save to Wishlist"
                              >
                                {isWishlisted(prop.id) ? <FaHeart style={{ color: '#EF4444' }} /> : <FaRegHeart />}
                              </button>

                              <button
                                onClick={() => toggleCompareItem(prop)}
                                style={{
                                  padding: '6px 10px',
                                  backgroundColor: compareItems.some(c => c.id === prop.id) ? '#ECFDF5' : '#F3F4F6',
                                  color: compareItems.some(c => c.id === prop.id) ? '#10B981' : '#4B5563',
                                  border: compareItems.some(c => c.id === prop.id) ? '1px solid #10B981' : '1px solid #E5E7EB',
                                  borderRadius: '8px',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                                title="Compare Side-by-Side"
                              >
                                Compare
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ fontSize: '0.65rem', color: '#9CA3AF', marginTop: '4px', padding: '0 4px' }}>
                  {msg.timestamp}
                </div>
              </div>
            ))}

            {/* Searching Skeleton / Typing Indicator */}
            {isSearching && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', padding: '10px 14px', borderRadius: '18px', width: 'fit-content' }}>
                <FemaleAiAvatar size={24} />
                <span style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 600 }}>NexOop RAG AI is searching verified databases...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ----- CHAT INPUT FOOTER ----- */}
          <form
            onSubmit={handleSendMessage}
            style={{
              padding: '12px 16px',
              backgroundColor: '#FFFFFF',
              borderTop: '1px solid #E5E7EB',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <input
              type="text"
              placeholder="Ask NexOop AI in English, Telugu, or Hindi..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                backgroundColor: '#F9FAFB',
                fontSize: '0.85rem',
                outline: 'none',
                color: '#111827'
              }}
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                backgroundColor: inputText.trim() ? '#10B981' : '#E5E7EB',
                color: '#FFFFFF',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: inputText.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s'
              }}
            >
              <FaPaperPlane style={{ fontSize: '0.85rem' }} />
            </button>
          </form>
        </div>
      )}

      {/* ================= 4. PROPERTY COMPARISON MODAL ================= */}
      {showCompareModal && (
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(17, 24, 39, 0.7)', 
            backdropFilter: 'blur(4px)',
            zIndex: 9999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div 
            style={{ 
              backgroundColor: '#FFFFFF', 
              borderRadius: '20px', 
              maxWidth: '800px', 
              width: '100%', 
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
              overflow: 'hidden',
              border: '1px solid #E5E7EB'
            }}
          >
            <div style={{ backgroundColor: '#111827', padding: '18px 24px', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.2rem' }}>⚖️</span>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>NexOop AI Property Comparison</h3>
              </div>
              <button onClick={() => setShowCompareModal(false)} style={{ background: 'none', border: 'none', color: '#FFFFFF', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ padding: '24px', overflowX: 'auto' }}>
              {compareItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#6B7280' }}>
                  No properties selected for comparison yet. Click Compare on any property card in the AI chat!
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #E5E7EB', color: '#6B7280' }}>Feature</th>
                      {compareItems.map(p => (
                        <th key={p.id} style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #E5E7EB', color: '#111827', fontWeight: 800 }}>
                          {p.title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '10px', fontWeight: 700, borderBottom: '1px solid #F3F4F6' }}>Price</td>
                      {compareItems.map(p => <td key={p.id} style={{ padding: '10px', color: '#10B981', fontWeight: 900, borderBottom: '1px solid #F3F4F6' }}>₹ {p.priceDisplay}</td>)}
                    </tr>
                    <tr>
                      <td style={{ padding: '10px', fontWeight: 700, borderBottom: '1px solid #F3F4F6' }}>Location</td>
                      {compareItems.map(p => <td key={p.id} style={{ padding: '10px', borderBottom: '1px solid #F3F4F6' }}>{p.area}, {p.city}</td>)}
                    </tr>
                    <tr>
                      <td style={{ padding: '10px', fontWeight: 700, borderBottom: '1px solid #F3F4F6' }}>Category</td>
                      {compareItems.map(p => <td key={p.id} style={{ padding: '10px', borderBottom: '1px solid #F3F4F6' }}>{p.category}</td>)}
                    </tr>
                    <tr>
                      <td style={{ padding: '10px', fontWeight: 700, borderBottom: '1px solid #F3F4F6' }}>Bedrooms</td>
                      {compareItems.map(p => <td key={p.id} style={{ padding: '10px', borderBottom: '1px solid #F3F4F6' }}>{p.bedrooms || 'N/A'} BHK</td>)}
                    </tr>
                    <tr>
                      <td style={{ padding: '10px', fontWeight: 700, borderBottom: '1px solid #F3F4F6' }}>Super Area</td>
                      {compareItems.map(p => <td key={p.id} style={{ padding: '10px', borderBottom: '1px solid #F3F4F6' }}>{p.areaSqFt}</td>)}
                    </tr>
                    <tr>
                      <td style={{ padding: '10px', fontWeight: 700, borderBottom: '1px solid #F3F4F6' }}>Status</td>
                      {compareItems.map(p => <td key={p.id} style={{ padding: '10px', borderBottom: '1px solid #F3F4F6' }}>{p.readyToMove ? 'Ready to Move' : 'Under Construction'}</td>)}
                    </tr>
                  </tbody>
                </table>
              )}
            </div>

            <div style={{ padding: '16px 24px', backgroundColor: '#F9FAFB', borderTop: '1px solid #E5E7EB', textAlign: 'right' }}>
              <button onClick={() => setShowCompareModal(false)} style={{ padding: '8px 20px', backgroundColor: '#111827', color: '#FFFFFF', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NexOopAiAssistant;
