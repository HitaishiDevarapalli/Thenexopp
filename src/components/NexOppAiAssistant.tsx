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

interface NexOppAiAssistantProps {
  onNavigate?: (page: string, queryParams?: string) => void;
  onPropertyClick?: (id: string) => void;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  type?: 'welcome' | 'text' | 'options' | 'city_input' | 'searching' | 'results' | 'no_results' | 'emi_calc' | 'comparison';
  options?: { label: string; value: string; action?: string }[];
  properties?: (PropertyListing & { aiMatchScore: number })[];
  totalCount?: number;
}

interface UserMemoryState {
  intent?: string;
  budget?: string;
  city?: string;
  type?: string;
  purpose?: string;
  maxPrice?: number;
  verifiedOnly?: boolean;
  recentSearches: string[];
}

// Supported Language Types
type DetectedLanguage = 'en' | 'te' | 'hi' | 'te_roman' | 'hi_roman';

// Language & Script Detector
const detectQueryLanguage = (text: string): DetectedLanguage => {
  // Telugu Script (\u0C00-\u0C7F)
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te';
  
  // Hindi / Devanagari Script (\u0900-\u097F)
  if (/[\u0900-\u097F]/.test(text)) return 'hi';

  const lower = text.toLowerCase();
  
  // Roman Telugu Keywords (e.g. "naku 50 lakhs properties chupinchu", "kavali", "unnaya", "kosam")
  if (/\b(naku|chupinchu|kavali|unnaya|kosam|chupinchey|enti|ekada|lo)\b/i.test(lower)) {
    return 'te_roman';
  }

  // Roman Hindi Keywords (e.g. "chahiye", "hai", "kaise", "dikhaye", "me", "ke liye")
  if (/\b(chahiye|dikhaye|hai|batao|kya|ke liye|chahiye|mein)\b/i.test(lower)) {
    return 'hi_roman';
  }

  return 'en';
};

// 3D Professional Female AI Avatar (Blue Blazer, White Shirt, Friendly Smile, Green Online Dot)
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
      src="/assets/nexopp_female_ai_avatar.jpg"
      alt="NexOpp 3D Female AI Consultant"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        objectFit: 'cover',
        border: '2px solid #E5E7EB',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
      }}
      onError={(e) => {
        // Fallback styling if image is missing
        e.currentTarget.style.display = 'none';
      }}
    />

    {/* Green Online Status Indicator Dot */}
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

export const NexOppAiAssistant: React.FC<NexOppAiAssistantProps> = ({ onNavigate, onPropertyClick }) => {
  const { toggleWishlist, isWishlisted } = useWishlist();
  
  // State toggles
  const [isOpen, setIsOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // User Memory State (In-Memory)
  const [userMemory, setUserMemory] = useState<UserMemoryState>({ recentSearches: [] });

  // Guided Flow State
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
      text: "Hi 👋 I'm **NexOpp AI**, your personal property consultant. I can help you find verified properties, franchises, businesses, home loans, and calculate EMIs across Andhra Pradesh & Telangana.",
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

  // Timers for floating speech bubble
  useEffect(() => {
    const hideTimer = setTimeout(() => setShowBubble(false), 5000);
    return () => clearTimeout(hideTimer);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setShowBubble(false);
      return;
    }
    const returnTimer = setTimeout(() => {
      if (!isOpen) setShowBubble(true);
    }, 30000);
    return () => clearTimeout(returnTimer);
  }, [isOpen]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isSearching]);

  // Monthly EMI Calculation
  const calculatedEmiVal = useMemo(() => {
    const P = emiAmount * 100000;
    const r = emiRate / (12 * 100);
    const n = emiTenure * 12;
    if (r === 0) return Math.round(P / n);
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(emi);
  }, [emiAmount, emiRate, emiTenure]);

  // Database Property Retrieval Pipeline with Multi-Turn Context & Explainability
  const executePropertySearchPipeline = (userQuery: string, searchCity?: string, searchType?: string, searchMaxPrice?: number, searchVerified?: boolean, searchSort?: 'asc' | 'desc') => {
    setIsSearching(true);

    const lower = userQuery.toLowerCase();
    
    // Resolve entities with context memory preservation across turns
    const targetCity = searchCity || (lower.includes('vijayawada') ? 'Vijayawada' : (lower.includes('hyderabad') ? 'Hyderabad' : (lower.includes('guntur') ? 'Guntur' : userMemory.city)));
    const targetType = searchType || (lower.includes('villa') ? 'Villa' : (lower.includes('plot') || lower.includes('land') ? 'Plot' : (lower.includes('flat') || lower.includes('apartment') || lower.includes('bhk') ? 'Apartment' : (lower.includes('house') ? 'House' : (lower.includes('commercial') ? 'Commercial' : userMemory.type)))));
    
    // Max Price extraction
    let maxPriceVal = searchMaxPrice;
    if (!maxPriceVal) {
      const priceMatch = lower.match(/(?:under|below|less than|<=|₹)?\s*(\d+)\s*(lakh|lakhs|cr|crore)/i);
      if (priceMatch) {
        const val = parseInt(priceMatch[1], 10);
        const unit = priceMatch[2].toLowerCase();
        maxPriceVal = unit.includes('cr') ? val * 100 : val;
      }
    }

    const isVerifiedOnly = searchVerified || lower.includes('verified') || lower.includes('verified ones') || userMemory.verifiedOnly;
    const sortOrder = searchSort || (lower.includes('lowest') || lower.includes('cheap') ? 'asc' : (lower.includes('highest') || lower.includes('expensive') ? 'desc' : undefined));

    // Update session memory
    const updatedMem = {
      ...userMemory,
      city: targetCity || userMemory.city,
      type: targetType || userMemory.type,
      maxPrice: maxPriceVal || userMemory.maxPrice,
      verifiedOnly: isVerifiedOnly,
      recentSearches: Array.from(new Set([userQuery, ...(userMemory.recentSearches || [])])).slice(0, 5)
    };
    setUserMemory(updatedMem);

    // Filter database listings
    setTimeout(() => {
      setIsSearching(false);

      // Exclude sold properties by default unless explicitly requested
      const isSoldRequested = lower.includes('sold') || lower.includes('recently sold');

      let matches = propertiesDb.filter(p => {
        if (!isSoldRequested && (p.sold || p.approvalStatus === 'Sold' || p.listingStatus === 'Sold')) {
          return false;
        }
        if (targetCity) {
          const matchCity = p.city.toLowerCase().includes(targetCity.toLowerCase()) || 
                            p.state.toLowerCase().includes(targetCity.toLowerCase()) ||
                            (p.area && p.area.toLowerCase().includes(targetCity.toLowerCase())) ||
                            (p.fullAddress && p.fullAddress.toLowerCase().includes(targetCity.toLowerCase()));
          if (!matchCity) return false;
        }
        if (targetType) {
          const t = targetType.toLowerCase();
          const cat = p.category ? p.category.toLowerCase() : '';
          if (t.includes('villa') && !cat.includes('villa')) return false;
          if ((t.includes('apartment') || t.includes('flat')) && !cat.includes('apartment') && !cat.includes('flat')) return false;
          if (t.includes('house') && !t.includes('villa') && !cat.includes('house')) return false;
          if (t.includes('plot') && !cat.includes('plot') && !cat.includes('land')) return false;
          if (t.includes('commercial') && !cat.includes('commercial')) return false;
        }
        if (isVerifiedOnly && !p.verified) return false;
        
        // Price parsing check
        if (updatedMem.maxPrice) {
          const numericPrice = parseFloat(p.priceDisplay.replace(/[^0-9.]/g, '')) || p.price || 0;
          const priceInLakhs = p.priceDisplay.toLowerCase().includes('cr') ? numericPrice * 100 : (numericPrice < 10 ? numericPrice * 100 : numericPrice);
          if (priceInLakhs > updatedMem.maxPrice) return false;
        }
        return true;
      });

      const totalCount = matches.length;

      if (totalCount === 0) {
        // Fallback check for recently sold properties in area as reference
        const soldAlternatives = propertiesDb.filter(p => {
          if (!(p.sold || p.approvalStatus === 'Sold' || p.listingStatus === 'Sold')) return false;
          if (targetCity) {
            const matchCity = p.city.toLowerCase().includes(targetCity.toLowerCase()) || p.state.toLowerCase().includes(targetCity.toLowerCase());
            if (!matchCity) return false;
          }
          return true;
        }).slice(0, 2);

        setMessages(prev => [
          ...prev.filter(m => m.type !== 'searching'),
          {
            id: `ai-nores-${Date.now()}`,
            sender: 'ai',
            text: soldAlternatives.length > 0
              ? `I searched our active inventory and found 0 available properties matching your exact criteria, but here are recently sold properties in ${targetCity || 'this area'} for reference:`
              : "I searched our latest property listings and found 0 matching properties.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'no_results',
            properties: soldAlternatives.length > 0 ? soldAlternatives.map(p => ({ ...p, aiMatchScore: 80 })) : undefined,
            options: [
              { label: '📈 Increase Budget', value: 'increase_budget', action: 'start_buy' },
              { label: '🌆 Change City', value: 'change_city', action: 'ask_city' },
              { label: '🏠 View Similar Properties', value: 'view_similar', action: 'view_all' },
              { label: '🔔 Notify Me When Available', value: 'notify_me', action: 'notify_me' }
            ]
          }
        ]);
        return;
      }

      // Sort & Rank items
      const scored = matches.map(p => {
        let score = 85;
        if (p.verified) score += 8;
        if (p.premium) score += 4;
        if (targetCity && p.city.toLowerCase() === targetCity.toLowerCase()) score += 2;
        if (score > 99) score = 99;
        return { ...p, aiMatchScore: score };
      }).sort((a, b) => sortOrder ? (sortOrder === 'asc' ? a.price - b.price : b.price - a.price) : b.aiMatchScore - a.aiMatchScore);

      // Display first 3 properties inside chat
      const top3 = scored.slice(0, 3);

      const explainText = `I found ${totalCount} properties matching your requirements. Here are the best matches:`;

      setMessages(prev => [
        ...prev.filter(m => m.type !== 'searching'),
        {
          id: `ai-res-${Date.now()}`,
          sender: 'ai',
          text: explainText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'results',
          properties: top3,
          totalCount: totalCount
        }
      ]);
    }, 600);
  };

  // Intent Detection & Confidence Engine (<70% threshold guardrail)
  const classifyIntentAndConfidence = (query: string) => {
    const trimmed = query.trim();
    const lower = trimmed.toLowerCase();

    // Greetings
    const greetingKeywords = ['hello', 'hi', 'hey', 'namaste', 'నమస్కారం', 'नमस्ते', 'good morning'];
    if (greetingKeywords.some(g => lower === g || lower === g + '!' || lower.startsWith(g + ' '))) {
      return {
        confidence: 100,
        category: 'greeting',
        response: "Hi! 👋 I'm NexOpp AI, your personal property consultant. How can I help you today?"
      };
    }

    // Appreciation
    const thanksKeywords = ['thanks', 'thank you', 'thx', 'ధన్యవాదాలు', 'धन्यवाद'];
    if (thanksKeywords.some(t => lower.includes(t))) {
      return {
        confidence: 100,
        category: 'appreciation',
        response: "You're welcome! Let me know if you'd like help finding a property or answering any real estate questions."
      };
    }

    // Small Talk / How are you
    if (lower.includes('how are you') || lower.includes('how r u')) {
      return {
        confidence: 100,
        category: 'small_talk',
        response: "I'm doing great, thank you for asking! 😊 How can I help you find your dream property, business, or calculate a home loan today?"
      };
    }

    // Jokes
    if (lower.includes('joke') || lower.includes('funny')) {
      return {
        confidence: 100,
        category: 'joke',
        response: "Why did the house go to the doctor? Because it had a window pain! 😄 How can I assist you with real estate today?"
      };
    }

    // Capability Summary ("What can you do?")
    if (lower.includes('what can you do') || lower.includes('help me with') || lower.includes('your features')) {
      return {
        confidence: 100,
        category: 'help',
        response: "I'm NexOpp AI, your senior property consultant. I can help you:\n• Search & filter verified properties in AP & Telangana\n• Compare up to 4 listings side-by-side\n• Calculate instant Home Loan EMIs\n• Explore commercial businesses & franchises\n• Schedule verified site visits"
      };
    }

    // Real Estate Query Signal Words & Property Intelligence Terms
    const realEstateKeywords = [
      'bhk', 'flat', 'flats', 'apartment', 'villa', 'house', 'plot', 'land', 'commercial',
      'duplex', 'farm house', 'farm land', 'agricultural', 'warehouse', 'industrial', 'shop',
      'office', 'coworking', 'hostel', 'pg', 'rental', 'luxury', 'premium', 'gated',
      'buy', 'sell', 'rent', 'lease', 'price', 'lakh', 'lakhs', 'cr', 'crore', 'guntur', 'hyderabad',
      'vizag', 'vijayawada', 'emi', 'loan', 'franchise', 'business', 'invest', 'investment',
      'contact', 'phone', 'support', 'compare', 'comparison', 'builder', 'rera', 'location',
      'verified', 'lowest', 'sort', 'only', 'under', 'below', 'near', 'beach', 'airport',
      'కొనాలి', 'అద్దె', 'ధర', 'ఇల్లు', 'ప్లాట్', 'హైదరాబాద్', 'గుంటూరు', 'చూపించు', 'కావాలి', 'ఉన్నాయా',
      'खरीदना', 'किराया', 'घर', 'प्लॉट', 'चाहिए'
    ];

    const hasRealEstateWord = realEstateKeywords.some(k => lower.includes(k));

    // Gibberish / Random Strings (e.g. "rgr", "asdf", "qwerty")
    const gibberishPattern = /^[a-z]{1,4}$|^[0-9]+$|^(asdf|qwerty|zxcv|rgr|abcd|test|1234|aaaa|zzzz)$/i;

    if (gibberishPattern.test(lower) && !hasRealEstateWord) {
      return {
        confidence: 20, // Confidence < 70%
        category: 'unknown',
        response: "Sorry, I couldn't understand that. Can you tell me what you're looking for?",
        options: [
          { label: '🏠 Buy Property', value: 'I want to buy a property', action: 'start_buy' },
          { label: '🔑 Rent Property', value: 'I want to rent a property', action: 'start_rent' },
          { label: '📈 Investment', value: 'Looking for investment opportunities', action: 'start_invest' },
          { label: '💰 EMI Calculator', value: 'Calculate loan EMI', action: 'open_emi' },
          { label: '⚖️ Compare Properties', value: 'Compare saved properties', action: 'open_compare' }
        ]
      };
    }

    if (!hasRealEstateWord && trimmed.length < 8) {
      return {
        confidence: 30, // Confidence < 70%
        category: 'unknown',
        response: "Sorry, I couldn't understand that. Can you tell me what you're looking for?",
        options: [
          { label: '🏠 Buy Property', value: 'I want to buy a property', action: 'start_buy' },
          { label: '🔑 Rent Property', value: 'I want to rent a property', action: 'start_rent' },
          { label: '📈 Investment', value: 'Looking for investment opportunities', action: 'start_invest' },
          { label: '💰 EMI Calculator', value: 'Calculate loan EMI', action: 'open_emi' },
          { label: '⚖️ Compare Properties', value: 'Compare saved properties', action: 'open_compare' }
        ]
      };
    }

    return {
      confidence: 95,
      category: 'real_estate'
    };
  };

  // Option Click Handler
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

    if (opt.action === 'ask_city') {
      askCityStep();
      return;
    }

    if (opt.action === 'view_all') {
      executePropertySearchPipeline('');
      return;
    }

    // Start Buy / Rent flow
    if (opt.action === 'start_buy' || opt.action === 'start_rent' || opt.action === 'start_invest' || opt.action === 'start_commercial' || opt.action === 'start_plot') {
      setUserMemory(prev => ({ ...prev, intent: opt.label }));
      setGuidedStep('budget');
      
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text: "Sure! I'll help you find the perfect property. **What is your budget?**",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'options',
            options: [
              { label: 'Under ₹ 25 Lakhs', value: '25' },
              { label: '₹ 25L - ₹ 50 Lakhs', value: '50' },
              { label: '₹ 50L - ₹ 80 Lakhs', value: '80' },
              { label: 'Above ₹ 1 Crore+', value: '200' }
            ]
          }
        ]);
      }, 400);
      return;
    }

    // Step 2: Budget selected -> Ask City
    if (guidedStep === 'budget') {
      const priceVal = parseInt(opt.value, 10);
      setUserMemory(prev => ({ ...prev, maxPrice: priceVal, budget: opt.label }));
      askCityStep();
      return;
    }

    // Step 3: City selected -> Ask Type
    if (guidedStep === 'city') {
      if (opt.value === 'Others') {
        setGuidedStep('custom_city');
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              id: `ai-${Date.now()}`,
              sender: 'ai',
              text: "Please tell me the city name:",
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: 'city_input'
            }
          ]);
        }, 400);
        return;
      }

      setUserMemory(prev => ({ ...prev, city: opt.value }));
      askPropertyTypeStep();
      return;
    }

    // Step 4: Type selected -> Ask Purpose
    if (guidedStep === 'type') {
      setUserMemory(prev => ({ ...prev, type: opt.value }));
      askPurposeStep();
      return;
    }

    // Step 5: Purpose selected -> Execute Search
    if (guidedStep === 'purpose') {
      const updatedMem = { ...userMemory, purpose: opt.value };
      setUserMemory(updatedMem);
      setGuidedStep('complete');
      executePropertySearchPipeline('', updatedMem.city, updatedMem.type, updatedMem.maxPrice);
      return;
    }

  const triggerSiteVisitBooking = (propertyTitle?: string) => {
    setMessages(prev => [
      ...prev,
      {
        id: `ai-visit-${Date.now()}`,
        sender: 'ai',
        text: `Great! Let's book your site visit${propertyTitle ? ` for **${propertyTitle}**` : ''}. Please select your preferred date & time:`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'options',
        options: [
          { label: '📅 Today (10:30 AM)', value: 'Today 10:30 AM', action: 'confirm_visit' },
          { label: '📅 Tomorrow (11:00 AM)', value: 'Tomorrow 11:00 AM', action: 'confirm_visit' },
          { label: '📅 Friday (03:00 PM)', value: 'Friday 03:00 PM', action: 'confirm_visit' },
          { label: '📅 Saturday (05:00 PM)', value: 'Saturday 05:00 PM', action: 'confirm_visit' }
        ]
      }
    ]);
  };

    if (opt.action === 'book_visit') {
      triggerSiteVisitBooking();
      return;
    }

    if (opt.action === 'confirm_visit') {
      setMessages(prev => [
        ...prev,
        {
          id: `ai-conf-${Date.now()}`,
          sender: 'ai',
          text: `✓ **Site visit booked successfully for ${opt.value}!**\n\nA confirmation details badge has been dispatched to your WhatsApp and Email.\n\nWould you like me to recommend similar properties while you wait?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'options',
          options: [
            { label: 'Yes, please', value: 'yes_similar', action: 'view_all' },
            { label: 'No, thanks', value: 'no_thanks' }
          ]
        }
      ]);
      return;
    }

    if (opt.action === 'notify_me') {
      appendAiResponse(`✓ **Property Alert Created!**\n\nWe'll notify you via WhatsApp and Email as soon as new properties matching your criteria are listed in ${userMemory.city || 'your area'}.`);
      return;
    }

    appendAiResponse(`I understand you're interested in ${opt.label}. Let me search verified listings for you...`);
  };

  const askCityStep = () => {
    setGuidedStep('city');
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: "Which city are you looking in?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'options',
          options: [
            { label: 'Guntur', value: 'Guntur' },
            { label: 'Vijayawada', value: 'Vijayawada' },
            { label: 'Hyderabad', value: 'Hyderabad' },
            { label: 'Others', value: 'Others' }
          ]
        }
      ]);
    }, 400);
  };

  const askPropertyTypeStep = () => {
    setGuidedStep('type');
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: "What type of property are you looking for?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'options',
          options: [
            { label: 'Apartment', value: 'Apartment' },
            { label: 'Villa', value: 'Villa' },
            { label: 'Independent House', value: 'House' },
            { label: 'Plot / Land', value: 'Plot' }
          ]
        }
      ]);
    }, 400);
  };

  const askPurposeStep = () => {
    setGuidedStep('purpose');
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: "What is the purpose of buying?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'options',
          options: [
            { label: 'Living', value: 'Living' },
            { label: 'Investment', value: 'Investment' },
            { label: 'Rental Income', value: 'Rental Income' }
          ]
        }
      ]);
    }, 400);
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

  // Free-form User Chat Submit (ChatGPT-Style Conversational Engine with Multi-Turn Memory)
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

    // 1. Intent & Confidence Check (<70% threshold guardrail)
    const intentResult = classifyIntentAndConfidence(userQuery);

    if (intentResult.confidence < 70) {
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: `ai-err-${Date.now()}`,
            sender: 'ai',
            text: intentResult.response || "Sorry, I couldn't understand that. Can you tell me what you're looking for?",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'options',
            options: intentResult.options || [
              { label: '🏠 Buy Property', value: 'I want to buy a property', action: 'start_buy' },
              { label: '🔑 Rent Property', value: 'I want to rent a property', action: 'start_rent' },
              { label: '📈 Investment', value: 'Looking for investment opportunities', action: 'start_invest' },
              { label: '💰 EMI Calculator', value: 'Calculate loan EMI', action: 'open_emi' }
            ]
          }
        ]);
      }, 400);
      return;
    }

    if (intentResult.response && intentResult.category !== 'real_estate') {
      setTimeout(() => appendAiResponse(intentResult.response!), 400);
      return;
    }

    // 2. Parse Natural Language Entities (City, Property Type, Budget Range, Multi-Turn Follow-Ups)
    const lower = userQuery.toLowerCase();
    const lang = detectQueryLanguage(userQuery);

    // Multi-turn comparison follow-up check (e.g. "Compare the first two")
    if (lower.includes('compare the first two') || lower.includes('compare first 2')) {
      const topProps = propertiesDb.slice(0, 2);
      setCompareItems(topProps);
      setShowCompareModal(true);
      return;
    }

    // Parse City
    let detectedCity = lower.includes('vijayawada') ? 'Vijayawada' : (lower.includes('hyderabad') ? 'Hyderabad' : (lower.includes('guntur') ? 'Guntur' : undefined));
    
    // Parse Property Type
    let detectedType = lower.includes('villa') ? 'Villa' : (lower.includes('plot') || lower.includes('land') ? 'Plot' : (lower.includes('flat') || lower.includes('apartment') || lower.includes('bhk') ? 'Apartment' : (lower.includes('house') ? 'House' : (lower.includes('commercial') ? 'Commercial' : undefined))));

    // Parse Budget
    let detectedBudget: number | undefined = undefined;
    const budgetMatch = lower.match(/(?:under|below|less than|<=|₹)?\s*(\d+)\s*(lakh|lakhs|cr|crore)/i);
    if (budgetMatch) {
      const val = parseInt(budgetMatch[1], 10);
      const unit = budgetMatch[2].toLowerCase();
      detectedBudget = unit.includes('cr') ? val * 100 : val;
    }

    // Parse Intent Queries (Loans, Site Visit, Comparison, Franchise, Business)
    if (lower.includes('loan') || lower.includes('finance') || lower.includes('interest')) {
      setTimeout(() => {
        appendAiResponse("We offer competitive **Home Loans starting at 8.5% p.a.** with flexible repayment tenures up to 30 years and zero processing fees for select properties. Would you like to calculate your monthly EMI or speak with our finance expert?");
        appendEmiCalculator();
      }, 400);
      return;
    }

    if (lower.includes('visit') || lower.includes('book site') || lower.includes('site visit')) {
      setTimeout(() => {
        appendAiResponse("📅 I can help you schedule a verified site visit! Please select a property or provide your preferred date and time, and our local consultant will pick you up.");
      }, 400);
      return;
    }

    if (lower.includes('compare') || lower.includes('comparison')) {
      openComparisonDrawer();
      return;
    }

    if (lower.includes('franchise')) {
      onNavigate?.('franchisePage');
      appendAiResponse(`We have **${franchiseDb.length}+ Verified Franchise Opportunities** across Food, Retail, and Healthcare! Navigating you to the Franchise section.`);
      return;
    }

    if (lower.includes('business')) {
      onNavigate?.('businessPage');
      appendAiResponse(`We have **${businessDb.length}+ Commercial Businesses** available for takeover or partnership.`);
      return;
    }

    // 3. Conversational Follow-up Prompts
    if (detectedType && !detectedCity && !userMemory.city) {
      setUserMemory(prev => ({ ...prev, type: detectedType }));
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: `ai-askcity-${Date.now()}`,
            sender: 'ai',
            text: lang === 'te' || lang === 'te_roman' ? `సరే! ${detectedType}ల కోసం ఏ నగరంలో చూడాలనుకుంటున్నారు?` : `Sure! Which city are you looking for a **${detectedType}** in?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'options',
            options: [
              { label: 'Guntur', value: 'Guntur' },
              { label: 'Vijayawada', value: 'Vijayawada' },
              { label: 'Hyderabad', value: 'Hyderabad' },
              { label: 'Others', value: 'Others' }
            ]
          }
        ]);
        setGuidedStep('city');
      }, 400);
      return;
    }

    // 4. Multi-Turn Search Execution
    const effectiveCity = detectedCity || userMemory.city;
    const effectiveType = detectedType || userMemory.type;
    const effectivePrice = detectedBudget || userMemory.maxPrice;
    
    executePropertySearchPipeline(userQuery, effectiveCity, effectiveType, effectivePrice);
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
        text: "💰 **NexOpp Instant Home Loan EMI Calculator**",
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
      if (exists) return prev.filter(p => p.id !== prop.id);
      if (prev.length >= 4) {
        alert("You can compare up to 4 properties side-by-side.");
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
        text: "Hi 👋 I'm **NexOpp AI**, your personal property consultant. How can I assist you today?",
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
              Ask NexOpp AI ⚡
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
          title="Open NexOpp AI Property Assistant"
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
                    NexOpp AI
                  </span>
                  <FaCheckCircle style={{ color: '#10B981', fontSize: '0.85rem' }} title="Verified Property Consultant" />
                </div>
                <div style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 500 }}>
                  Your Property Consultant
                </div>
                <div style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', backgroundColor: '#10B981', borderRadius: '50%', display: 'inline-block' }} />
                  Online
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

                  {/* Property Cards */}
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
                          {/* Image & Badges */}
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

                            {(prop.sold || prop.approvalStatus === 'Sold' || prop.listingStatus === 'Sold') && (
                              <div
                                style={{
                                  position: 'absolute',
                                  top: '8px',
                                  left: '8px',
                                  backgroundColor: '#DC2626',
                                  color: '#FFFFFF',
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  fontSize: '0.65rem',
                                  fontWeight: 800,
                                  boxShadow: '0 2px 6px rgba(220, 38, 38, 0.4)',
                                  zIndex: 10
                                }}
                              >
                                SOLD
                              </div>
                            )}

                            {/* Verified Badge */}
                            {prop.verified && !(prop.sold || prop.approvalStatus === 'Sold' || prop.listingStatus === 'Sold') && (
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
                                Verified
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
                                Premium
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

                  {msg.totalCount && msg.totalCount > 3 && (
                    <button
                      onClick={() => {
                        const params = new URLSearchParams();
                        if (userMemory.city) params.set('location', userMemory.city);
                        if (userMemory.type) params.set('type', userMemory.type);
                        if (userMemory.maxPrice) params.set('budget', String(userMemory.maxPrice));
                        onNavigate?.('propertiesPage', `?${params.toString()}`);
                        setIsOpen(false);
                      }}
                      style={{
                        width: '100%',
                        marginTop: '12px',
                        backgroundColor: '#10B981',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '10px 16px',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                        transition: 'all 0.2s'
                      }}
                    >
                      View All {msg.totalCount} Properties →
                    </button>
                  )}
                </div>

                <div style={{ fontSize: '0.65rem', color: '#9CA3AF', marginTop: '4px', padding: '0 4px' }}>
                  {msg.timestamp}
                </div>
              </div>
            ))}

            {/* Searching Indicator */}
            {isSearching && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', padding: '10px 14px', borderRadius: '18px', width: 'fit-content' }}>
                <FemaleAiAvatar size={24} />
                <span style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 600 }}>Searching our latest property listings...</span>
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
              placeholder="Ask about properties, investments, businesses or finance..."
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
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>NexOpp AI Property Comparison</h3>
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
                    <tr>
                      <td style={{ padding: '10px', fontWeight: 700, borderBottom: '1px solid #F3F4F6' }}>Key Pros</td>
                      {compareItems.map(p => (
                        <td key={p.id} style={{ padding: '10px', color: '#059669', fontSize: '0.78rem', borderBottom: '1px solid #F3F4F6' }}>
                          ✔ {p.verified ? 'Verified Ownership' : 'Great Location'}<br/>
                          ✔ {p.readyToMove ? 'Ready Possession' : 'High ROI Potential'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td style={{ padding: '10px', fontWeight: 700, borderBottom: '1px solid #F3F4F6' }}>Considerations</td>
                      {compareItems.map(p => (
                        <td key={p.id} style={{ padding: '10px', color: '#D97706', fontSize: '0.78rem', borderBottom: '1px solid #F3F4F6' }}>
                          • High Demand Region<br/>
                          • Rapid Price Appreciation
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td style={{ padding: '10px', fontWeight: 800, borderBottom: '1px solid #F3F4F6', color: '#10B981' }}>AI Winner</td>
                      {compareItems.map((p, idx) => (
                        <td key={p.id} style={{ padding: '10px', borderBottom: '1px solid #F3F4F6' }}>
                          {idx === 0 ? (
                            <span style={{ backgroundColor: '#ECFDF5', color: '#10B981', padding: '4px 8px', borderRadius: '6px', fontWeight: 800, fontSize: '0.75rem' }}>
                              🏆 Best Value Match
                            </span>
                          ) : (
                            <span style={{ color: '#6B7280', fontSize: '0.75rem' }}>Good Alternative</span>
                          )}
                        </td>
                      ))}
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

export default NexOppAiAssistant;
