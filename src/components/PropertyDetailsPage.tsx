import React, { useState, useMemo, useEffect } from 'react';
import { propertiesDb, dealersDb, franchiseDb, businessDb, enquiriesDb, addEnquiry, addBusinessEnquiry, notifyDataChanged, demandRegionsDb, getDistance, incrementPropertyViewCount, API_BASE_URL } from '../db/marketplaceDb';
import type { Dealer } from '../db/marketplaceDb';
import { 
  FaArrowLeft, FaHeart, FaRegHeart, FaShareAlt, 
  FaMapMarkerAlt, FaShoppingCart, FaPhone, 
  FaChevronLeft, FaChevronRight, FaEye
} from 'react-icons/fa';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const PropertyLocationMap: React.FC<{ latitude: number; longitude: number; title: string; area: string; price: string }> = ({ latitude, longitude, title, area, price }) => {
  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    if (!mapContainerRef.current) return;
    
    const defaultLat = latitude || 16.3067;
    const defaultLng = longitude || 80.4365;
    
    const map = L.map(mapContainerRef.current, {
      center: [defaultLat, defaultLng],
      zoom: 15,
      zoomControl: true
    });
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    const customIcon = L.divIcon({
      className: 'custom-property-details-pin',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translateY(-12px);">
          <div style="background-color: #EF4444; color: #FFFFFF; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 800; box-shadow: 0 4px 14px rgba(239,68,68,0.4); border: 2px solid #FFFFFF; white-space: nowrap; display: flex; align-items: center; gap: 4px;">
            🏠 ${title} (${price})
          </div>
          <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #EF4444; margin-top: -1px;"></div>
        </div>
      `,
      iconSize: [120, 38],
      iconAnchor: [60, 38]
    });
    
    L.marker([defaultLat, defaultLng], { icon: customIcon }).addTo(map);
    
    setTimeout(() => {
      map.invalidateSize();
    }, 300);
    
    return () => {
      map.remove();
    };
  }, [latitude, longitude, title, area, price]);
  
  return <div ref={mapContainerRef} data-lenis-prevent="true" style={{ width: '100%', height: '100%', borderRadius: '16px', zIndex: 1 }} />;
};

const getNearbyAmenities = (category: string, area: string, city: string) => {
  const baseDist = Math.floor(Math.random() * 8) / 10 + 0.4;
  switch (category) {
    case 'schools':
      return [
        { name: `Oakridge International School (${area})`, type: 'CBSE & IB World School', dist: (baseDist).toFixed(1), time: '3 mins drive' },
        { name: `Chirec Public School`, type: 'International Campus', dist: (baseDist + 1.1).toFixed(1), time: '6 mins drive' },
        { name: `Delhi Public School (${city})`, type: 'Senior Secondary CBSE', dist: (baseDist + 1.8).toFixed(1), time: '10 mins drive' },
        { name: `Kendriya Vidyalaya`, type: 'Central Government School', dist: (baseDist + 2.5).toFixed(1), time: '14 mins drive' }
      ];
    case 'hospitals':
      return [
        { name: `Apollo Hospitals Multispecialty`, type: '24/7 Emergency & ICU', dist: (baseDist + 0.5).toFixed(1), time: '4 mins drive' },
        { name: `Care Hospitals & Trauma Centre`, type: 'Super Specialty Hospital', dist: (baseDist + 1.4).toFixed(1), time: '8 mins drive' },
        { name: `Rainbow Children's Hospital`, type: 'Pediatric & Maternity Care', dist: (baseDist + 2.1).toFixed(1), time: '11 mins drive' },
        { name: `Vijaya Diagnostic Centre`, type: 'Radiology & Pathology Lab', dist: (baseDist + 0.3).toFixed(1), time: '2 mins walk' }
      ];
    case 'transit':
      return [
        { name: `${area} Metro Station`, type: 'Blue / Red Line Corridor', dist: (baseDist - 0.1 > 0 ? baseDist - 0.1 : 0.4).toFixed(1), time: '5 mins walk' },
        { name: `Main Bus Stop (${area})`, type: 'City & Intercity Transit', dist: '0.3', time: '3 mins walk' },
        { name: `${city} Central Railway Station`, type: 'Major Railway Junction', dist: (baseDist + 5.2).toFixed(1), time: '20 mins drive' },
        { name: `International Airport Express`, type: 'Direct Highway Access', dist: (baseDist + 22.0).toFixed(1), time: '35 mins drive' }
      ];
    case 'shopping':
      return [
        { name: `Inorbit Mall & Multiplex`, type: 'Premium Shopping Mall', dist: (baseDist + 0.8).toFixed(1), time: '5 mins drive' },
        { name: `Ratnadeep Supermarket`, type: 'Grocery & Daily Needs', dist: '0.4', time: '4 mins walk' },
        { name: `Starbucks Coffee & Lounge`, type: 'Cafe & Workspace', dist: '0.6', time: '6 mins walk' },
        { name: `Barbeque Nation & Fine Dining`, type: 'Multi-cuisine Restaurant', dist: (baseDist + 1.2).toFixed(1), time: '7 mins drive' }
      ];
    case 'banks':
      return [
        { name: `HDFC Bank & ATM Branch`, type: 'Banking & Wealth Management', dist: '0.3', time: '3 mins walk' },
        { name: `ICICI Bank 24/7 ATM`, type: 'Automated Teller Machine', dist: '0.5', time: '5 mins walk' },
        { name: `State Bank of India (SBI)`, type: 'Regional Branch Office', dist: (baseDist + 0.7).toFixed(1), time: '4 mins drive' },
        { name: `Axis Bank Priority Lounge`, type: 'Forex & Locker Facility', dist: (baseDist + 1.1).toFixed(1), time: '6 mins drive' }
      ];
    case 'fuel':
    default:
      return [
        { name: `Indian Oil 24/7 Petrol Pump`, type: 'Fuel & EV Charging Station', dist: (baseDist + 0.4).toFixed(1), time: '3 mins drive' },
        { name: `HP Petrol & Speed Mart`, type: 'Premium Fuel & Nitrogen', dist: (baseDist + 1.3).toFixed(1), time: '6 mins drive' },
        { name: `Bharat Petroleum (BPCL)`, type: 'Highway Fuel Station', dist: (baseDist + 2.4).toFixed(1), time: '10 mins drive' },
        { name: `Tata Power EV Fast Charging`, type: '60kW DC Fast Charger', dist: (baseDist + 0.9).toFixed(1), time: '5 mins drive' }
      ];
  }
};

interface PropertyDetailsPageProps {
  propertyId: string;
  onBack: () => void;
  onPropertyClick: (id: string) => void;
  onBuyProperty?: (id: string) => void;
  onContactBroker?: (id: string) => void;
  onBookSlot?: (id: string) => void;
}

export const PropertyDetailsPage: React.FC<PropertyDetailsPageProps> = ({ 
  propertyId, 
  onBack, 
  onPropertyClick,
  onBuyProperty,
  onContactBroker,
  onBookSlot
}) => {
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageFitMode, setImageFitMode] = useState<'cover' | 'contain'>('cover');
  const [showPhone, setShowPhone] = useState(false);
  const [message, setMessage] = useState('');
  const [showSellerPortfolio, setShowSellerPortfolio] = useState(false);
  const [portfolioTab, setPortfolioTab] = useState<'active' | 'sold'>('active');
  const [nearbyRadiusFilter, setNearbyRadiusFilter] = useState<number>(5); // Default 5 km
  const [activeAmenityTab, setActiveAmenityTab] = useState<string>('schools');
  const [amenityCache, setAmenityCache] = useState<Record<string, any[]>>({});
  const [loadingAmenities, setLoadingAmenities] = useState(false);

  const [showContactModal, setShowContactModal] = useState(false);
  const [modalMode, setModalMode] = useState<'contact' | 'book'>('contact');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactPrice, setContactPrice] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const { user, openLoginModal } = useAuth();

  const handleOpenContactModal = (mode: 'contact' | 'book' = 'contact') => {
    if (!user) {
      openLoginModal();
      return;
    }
    if (mode === 'contact' && onContactBroker) {
      onContactBroker(propertyId);
    } else if (mode === 'book' && onBookSlot) {
      onBookSlot(propertyId);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim()) {
      alert('Please fill in your Name and Phone Number.');
      return;
    }
    
    if (modalMode === 'book' && (!bookingDate || !bookingTime)) {
      alert('Please select a date and time for your visit.');
      return;
    }
    
    const isProp = !!propertiesDb.find(p => p.id === propertyId);
    const isBiz = !!businessDb.find(b => b.id === propertyId);
    const listingType = isProp ? 'PROPERTY' : isBiz ? 'BUSINESS' : 'FRANCHISE';

    const newEnquiry = {
      id: `ENQ-${Date.now()}`,
      customerName: contactName,
      phone: contactPhone,
      email: '',
      listingTitle: property ? property.title : 'Unknown Property',
      brokerName: dealer ? (dealer.fullName || dealer.companyName) : 'Not Assigned',
      status: 'New' as const,
      priority: 'High' as const,
      source: isBiz ? 'Business Details Page' : 'Property Details Page',
      listingType: listingType as any,
      enquiryType: modalMode === 'book' ? ('SLOT_BOOKING' as const) : ('BUY' as const),
      date: modalMode === 'book' ? bookingDate : new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      preferredTime: modalMode === 'book' ? bookingTime : undefined,
      preferredMoveInDate: modalMode === 'book' ? bookingDate : undefined,
      message: modalMode === 'book' 
        ? `Requested Visit Slot for ${bookingDate} at ${bookingTime}`
        : (contactPrice ? `Offered Price: ${contactPrice}` : 'Customer submitted property enquiry'),
      name: contactName,
      interest: modalMode === 'book' 
        ? `Requested Visit: ${bookingDate} at ${bookingTime}`
        : `Offered Price: ${contactPrice}`
    };

    addEnquiry(newEnquiry);

    if (isBiz) {
      addBusinessEnquiry({
        id: `BE-${Date.now()}`,
        businessId: propertyId,
        businessName: property ? property.title : 'Business Listing',
        name: contactName,
        mobile: contactPhone,
        email: '',
        message: modalMode === 'book' ? `Visit Slot: ${bookingDate} at ${bookingTime}` : `Offer: ${contactPrice}`,
        status: 'New',
        notes: modalMode === 'book' ? `Visit Slot: ${bookingDate} at ${bookingTime}` : `Offer: ${contactPrice}`,
        createdAt: new Date().toISOString()
      });
    }

    setContactSubmitted(true);
    setTimeout(() => {
      setShowContactModal(false);
      setContactSubmitted(false);
    }, 2000);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 999;
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Fetch current property or franchise or business
  const property = useMemo(() => {
    const p = propertiesDb.find(p => p.id === propertyId);
    if (p) return p;

    const f = franchiseDb.find(f => f.id === propertyId);
    if (f) {
      const index = parseInt(f.id.replace(/\D/g, '')) || 1;
      const dealerId = index % 2 === 0 ? 'D2' : 'D1';
      return {
        id: f.id,
        dealerId: dealerId,
        title: f.brand,
        description: `Verified operational setup for ${f.brand} (${f.type}). High customer retention, stable local supply chains, fully integrated POS systems, and complete staff handover. Ideal for owner-operator or passive investment.`,
        image: f.image,
        state: f.state || 'Telangana',
        district: 'Rangareddy',
        city: f.city || 'Hyderabad',
        area: f.location.split(',')[1]?.trim() || f.location,
        areaSqFt: `${f.availableBranchCount} Units Available`,
        priceDisplay: f.investmentDisplay,
        category: 'Commercial',
        specs: {
          'Type': f.type,
          'Branches': f.availableBranchCount,
          'Trust Score': `${f.trustScore}%`,
          'Status': 'Operational',
          'Verification': 'Verified Franchise',
          'Industry': f.type.split(' ')[0] || 'Retail',
          'Listed By': 'Brand Partner',
          'Headquarters': f.location
        }
      } as any;
    }

    const b = businessDb.find(b => b.id === propertyId);
    if (b) {
      const assignedBrokerId = b.dealerId || (b.assignedBrokerIds && b.assignedBrokerIds[0]) || '';
      const bDealer = assignedBrokerId ? dealersDb.find(d => d.id === assignedBrokerId) : null;
      const primaryImage = b.image || b.imageUrl || (b.images && b.images[0]) || '';
      const imagesArr = b.images && b.images.length > 0 ? b.images : [primaryImage].filter(Boolean);

      const cleanRev = (b.revenueMonthly === '₹1 Lakh/mo' || b.revenueMonthly === '₹ 1 Lakh/mo') ? '' : (b.revenueMonthly || '');
      const cleanProfit = (b.profitMonthly === '₹30,000/mo' || b.profitMonthly === '₹ 30,000/mo') ? '' : (b.profitMonthly || '');
      const cleanEmployees = (b.employeesCount && Number(b.employeesCount) > 0) ? `${b.employeesCount} Staff` : '';

      const bSpecs: Record<string, string> = {};
      if (b.businessType) bSpecs['Type'] = b.businessType;
      if (b.category || b.industry) bSpecs['Category'] = b.category || b.industry || '';
      if (cleanRev) bSpecs['Monthly Revenue'] = cleanRev;
      if (cleanProfit) bSpecs['Monthly Profit'] = cleanProfit;
      if (b.establishedYear && Number(b.establishedYear) > 1900) bSpecs['Established Year'] = String(b.establishedYear);
      if (cleanEmployees) bSpecs['Employees'] = cleanEmployees;
      if (b.status) bSpecs['Status'] = b.status;
      if (b.reasonForSale && b.reasonForSale !== 'Retirement') bSpecs['Reason for Sale'] = b.reasonForSale;
      if (bDealer) bSpecs['Listed By'] = bDealer.companyName || bDealer.fullName || 'Verified Broker';
      const locDisplay = [b.subLocation || b.landmark, b.area, b.city, b.state].filter(Boolean).join(', ') || b.location || '';
      if (locDisplay) bSpecs['Location'] = locDisplay;

      return {
        id: b.id,
        dealerId: assignedBrokerId || undefined,
        assignedBrokerIds: b.assignedBrokerIds || (assignedBrokerId ? [assignedBrokerId] : []),
        agentName: b.agentName || (bDealer ? (bDealer.companyName || bDealer.fullName) : undefined),
        agentPhone: b.agentPhone || (bDealer ? (bDealer.mobile || bDealer.phone) : undefined),
        title: b.name || b.title || 'Business Listing',
        description: b.description || '',
        image: primaryImage,
        image2: b.image2 || (imagesArr[1] || undefined),
        image3: b.image3 || (imagesArr[2] || undefined),
        image4: b.image4 || (imagesArr[3] || undefined),
        image5: b.image5 || (imagesArr[4] || undefined),
        image6: b.image6 || (imagesArr[5] || undefined),
        images: imagesArr,
        state: b.state || 'Telangana',
        district: b.district || '',
        city: b.city || 'Hyderabad',
        area: b.area || b.location || '',
        subLocation: b.subLocation || b.sub_location || b.landmark || '',
        landmark: b.landmark || b.subLocation || '',
        pincode: b.pincode || b.postal_code || '',
        postal_code: b.pincode || b.postal_code || '',
        latitude: b.latitude || 17.4326,
        longitude: b.longitude || 78.4071,
        areaSqFt: b.employeesCount ? `${b.employeesCount} Employees` : 'Operational Business Unit',
        priceDisplay: b.priceDisplay || `₹${b.price || b.askingPrice || 0} Lakhs`,
        price: b.price || b.askingPrice || 0,
        category: b.category || b.industry || 'Business',
        status: b.status || 'Available',
        verified: b.verified !== false,
        featured: !!b.featured,
        specs: bSpecs
      } as any;
    }

    return null;
  }, [propertyId]);

  const lastIncrementedPropIdRef = React.useRef<string | null>(null);

  // Reset all state, scroll to top, and increment property view count when propertyId changes
  useEffect(() => {
    setActiveImageIndex(0);
    setShowPhone(false);
    setMessage('');
    setShowSellerPortfolio(false);
    setAmenityCache({});
    if (propertyId && lastIncrementedPropIdRef.current !== propertyId) {
      lastIncrementedPropIdRef.current = propertyId;
      incrementPropertyViewCount(propertyId);
    }

    if (property) {
      // Dynamic Title & Description
      document.title = `${property.title} | ${property.city}, ${property.state} | TheNexOpp`;
      
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', `${property.title} in ${property.area}, ${property.city}. Price: ${property.priceDisplay}. Bedrooms: ${property.bedrooms || 3}, Area: ${property.areaSqFt || '1500 Sq.Ft'}. Verified Listing.`);
      }

      // Dynamic OpenGraph Image & Title
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', `${property.title} - ${property.priceDisplay}`);
      const ogImg = document.querySelector('meta[property="og:image"]');
      if (ogImg) ogImg.setAttribute('content', property.image || property.images?.[0] || '/assets/luxury_apartment.png');

      // Schema.org RealEstateListing Structured Data Injection
      let schemaScript = document.getElementById('property-schema-ld');
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.id = 'property-schema-ld';
        schemaScript.setAttribute('type', 'application/ld+json');
        document.head.appendChild(schemaScript);
      }
      schemaScript.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "RealEstateListing",
        "name": property.title,
        "description": property.description || `${property.title} in ${property.city}`,
        "url": window.location.href,
        "image": property.image || property.images?.[0],
        "datePosted": property.createdDate || "2026-01-01",
        "price": property.priceDisplay,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": property.city,
          "addressRegion": property.state,
          "addressCountry": "IN"
        }
      });
    }
  }, [propertyId, property]);

  useEffect(() => {
    if (!property || !property.latitude || !property.longitude) return;
    const category = activeAmenityTab;
    if (amenityCache[category]) return; // Already cached

    const queryMap: Record<string, string> = {
      schools: 'school',
      hospitals: 'hospital',
      transit: 'bus_station',
      shopping: 'supermarket',
      banks: 'bank',
      fuel: 'fuel'
    };

    const queryType = queryMap[category] || 'amenity';
    setLoadingAmenities(true);

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${queryType}&lat=${property.latitude}&lon=${property.longitude}&limit=6`;

    fetch(url, {
      headers: {
        'Accept-Language': 'en'
      }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const list = data.map(item => {
            const itemLat = parseFloat(item.lat);
            const itemLng = parseFloat(item.lon);
            const dist = calculateDistance(property.latitude, property.longitude, itemLat, itemLng);
            const name = item.name || item.display_name.split(',')[0];
            
            let typeLabel = '';
            if (category === 'schools') typeLabel = 'Education Facility';
            else if (category === 'hospitals') typeLabel = 'Healthcare Provider';
            else if (category === 'transit') typeLabel = 'Transit Node';
            else if (category === 'shopping') typeLabel = 'Shopping / Dining';
            else if (category === 'banks') typeLabel = 'Financial Service';
            else typeLabel = 'Fuel Station';

            const timeVal = Math.round(dist * 2.5 + 2);

            return {
              name,
              type: typeLabel,
              dist: dist.toFixed(1),
              time: `${timeVal} mins drive`
            };
          });
          setAmenityCache(prev => ({ ...prev, [category]: list }));
        }
      })
      .catch(err => {
        console.error("Error fetching real nearby amenities:", err);
      })
      .finally(() => {
        setLoadingAmenities(false);
      });
  }, [activeAmenityTab, property, amenityCache]);

  useEffect(() => {
    const lenis = (window as any).lenis;
    if (showSellerPortfolio) {
      lenis?.stop();
      document.body.classList.add('modal-open');
    } else {
      lenis?.start();
      document.body.classList.remove('modal-open');
    }
    return () => {
      lenis?.start();
      document.body.classList.remove('modal-open');
    };
  }, [showSellerPortfolio]);



  // Fetch dealer
  const dealer = useMemo(() => {
    if (!property) return null;
    let found = dealersDb.find(d => d.id === property.dealerId);
    if (!found && property.assignedBrokerIds && property.assignedBrokerIds.length > 0) {
      found = dealersDb.find(d => property.assignedBrokerIds.includes(d.id));
    }
    if (!found && property.agentName) {
      found = dealersDb.find(d => d.companyName?.toLowerCase() === property.agentName.toLowerCase() || d.fullName?.toLowerCase() === property.agentName.toLowerCase());
    }
    if (!found && (property.agentName || property.dealerId)) {
      return {
        id: property.dealerId || 'temp-dealer',
        fullName: property.agentName || 'Verified Advisor',
        companyName: property.agentName || 'RealtyPlus Advisors',
        photo: property.agentImage || '',
        logo: property.agentImage || '',
        rating: property.agentRating || 4.8,
        reviewCount: property.reviewCount || 10,
        verified: true,
        premiumPartner: false,
        bestSeller: false,
        yearsExperience: 5,
        responseTime: '10 mins',
        inventoryCount: 1,
        coverage: {},
        latitude: property.latitude || 16.3067,
        longitude: property.longitude || 80.4365,
        phone: '1234567890',
        email: 'agent@nexopp.com'
      } as Dealer;
    }
    return found || null;
  }, [property]);

  // Broker active and sold listings
  const brokerListings = useMemo(() => {
    if (!dealer) return { active: [], sold: [] };
    const bId = dealer.id;
    const dName = (dealer.fullName || dealer.companyName || '').toLowerCase().trim();
    const dCompany = (dealer.companyName || '').toLowerCase().trim();
    
    // Properties
    const allProps = propertiesDb.filter(p => {
      const matchId = p.dealerId === bId || (p.assignedBrokerIds && p.assignedBrokerIds.includes(bId));
      const matchName = dName && p.agentName && (p.agentName.toLowerCase().includes(dName) || dName.includes(p.agentName.toLowerCase()));
      const matchComp = dCompany && p.agentName && (p.agentName.toLowerCase().includes(dCompany) || dCompany.includes(p.agentName.toLowerCase()));
      const isCurrent = property && p.id === property.id;
      return matchId || matchName || matchComp || isCurrent;
    });
    
    // Businesses
    const allBiz = businessDb ? businessDb.filter((b: any) => {
      const matchId = b.dealerId === bId || (b as any).assignedBrokerIds?.includes(bId);
      const matchName = dName && (b as any).agentName && (b as any).agentName.toLowerCase().includes(dName);
      const matchComp = dCompany && (b as any).agentName && (b as any).agentName.toLowerCase().includes(dCompany);
      return matchId || matchName || matchComp;
    }) : [];
    
    // Franchises
    const allFran = franchiseDb ? franchiseDb.filter((f: any) => {
      const matchId = f.dealerId === bId || (f as any).assignedBrokerIds?.includes(bId);
      const matchName = dName && (f as any).agentName && (f as any).agentName.toLowerCase().includes(dName);
      const matchComp = dCompany && (f as any).agentName && (f as any).agentName.toLowerCase().includes(dCompany);
      return matchId || matchName || matchComp;
    }) : [];

    const activeProps = allProps.filter(p => !p.sold && p.listingStatus !== 'Sold' && p.status !== 'Sold' && p.approvalStatus !== 'Sold').map(p => ({ ...p, itemType: 'Property', isSold: false }));
    const soldProps = allProps.filter(p => p.sold || p.listingStatus === 'Sold' || p.status === 'Sold' || p.approvalStatus === 'Sold').map(p => ({ ...p, itemType: 'Property', isSold: true }));

    const activeBiz = allBiz.filter((b: any) => !(b as any).sold && b.status !== 'Sold' && (b as any).listingStatus !== 'Sold').map((b: any) => ({ ...b, itemType: 'Business', title: b.name || b.title, priceDisplay: b.priceDisplay || `₹${b.price || 50} Lac`, isSold: false }));
    const soldBiz = allBiz.filter((b: any) => (b as any).sold || b.status === 'Sold' || (b as any).listingStatus === 'Sold').map((b: any) => ({ ...b, itemType: 'Business', title: b.name || b.title, priceDisplay: b.priceDisplay || `₹${b.price || 50} Lac`, isSold: true }));

    const activeFran = allFran.filter((f: any) => !(f as any).sold && f.status !== 'Sold' && (f as any).listingStatus !== 'Sold' && (f as any).approvalStatus !== 'Closed').map((f: any) => ({ ...f, itemType: 'Franchise', title: f.brand, priceDisplay: f.investmentDisplay || `₹${f.investment || 25} Lac`, isSold: false }));
    const soldFran = allFran.filter((f: any) => (f as any).sold || f.status === 'Sold' || (f as any).listingStatus === 'Sold' || (f as any).approvalStatus === 'Closed').map((f: any) => ({ ...f, itemType: 'Franchise', title: f.brand, priceDisplay: f.investmentDisplay || `₹${f.investment || 25} Lac`, isSold: true }));

    return {
      active: [...activeProps, ...activeBiz, ...activeFran],
      sold: [...soldProps, ...soldBiz, ...soldFran]
    };
  }, [dealer, property, propertiesDb, businessDb, franchiseDb]);

  // Generate dynamic gallery images based on category
  const galleryImages = useMemo(() => {
    if (!property) return [];
    if (Array.isArray(property.images) && property.images.length > 0) {
      return property.images.filter(Boolean);
    }
    const imagesList = [
      property.image,
      property.image2,
      property.image3,
      property.image4,
      property.image5,
      property.image6
    ].filter(Boolean) as string[];
    
    // Fallback if absolutely no photos were uploaded
    if (imagesList.length === 0) {
      return ["data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='500' viewBox='0 0 800 500'%3E%3Crect fill='%23F1F5F9' width='800' height='500'/%3E%3Ctext fill='%2394A3B8' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20'%3ENo Photo Available%3C/text%3E%3C/svg%3E"];
    }
    return imagesList;
  }, [property]);

  // Fetch other properties of the same dealer
  const otherProperties = useMemo(() => {
    if (!property) return [];
    return propertiesDb.filter(p => p.dealerId === property.dealerId && p.id !== property.id);
  }, [property]);



  const nearbyPropertiesWithDistance = useMemo(() => {
    if (!property) return [];
    const propLat = property.latitude || 17.4326;
    const propLng = property.longitude || 78.4071;
    return propertiesDb
      .filter(p => p.id !== property.id)
      .map(p => {
        const dist = calculateDistance(propLat, propLng, p.latitude || 17.4326, p.longitude || 78.4071);
        return { ...p, distanceKm: dist };
      })
      .filter(p => p.distanceKm <= nearbyRadiusFilter)
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [property, nearbyRadiusFilter]);

  // EMI Calculator State
  const [loanAmountLakhs, setLoanAmountLakhs] = useState<number>(150);
  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [loanTenureYears, setLoanTenureYears] = useState<number>(20);

  useEffect(() => {
    if (property?.price) {
      setLoanAmountLakhs(Math.round(property.price * 100 * 0.8));
    }
  }, [property]);

  const calculatedEmi = useMemo(() => {
    const P = loanAmountLakhs * 100000;
    const r = interestRate / (12 * 100);
    const n = loanTenureYears * 12;
    if (r === 0) return Math.round(P / n);
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(emi);
  }, [loanAmountLakhs, interestRate, loanTenureYears]);

  const demandBadge = useMemo(() => {
    if (!property?.latitude || !property?.longitude) return null;
    let closestRegion: any = null;
    let minDistance = Infinity;

    demandRegionsDb.forEach(r => {
      const dist = getDistance(r.latitude, r.longitude, property.latitude, property.longitude);
      if (dist <= r.radius && dist < minDistance) {
        minDistance = dist;
        closestRegion = r;
      }
    });

    if (!closestRegion) return null;

    const level = closestRegion.demandLevel;
    const color = level === 'High' ? '#DCFCE7' : (level === 'Medium' ? '#FEF9C3' : '#FEE2E2');
    const textColor = level === 'High' ? '#16A34A' : (level === 'Medium' ? '#CA8A04' : '#EF4444');
    const icon = level === 'High' ? '🔥' : (level === 'Medium' ? '⭐' : '📍');
    const label = level === 'High' ? 'High Demand Area' : (level === 'Medium' ? 'Moderate Demand Area' : 'Low Demand Area');
    const desc = level === 'High' ? `Located in one of the most demanded regions within a ${closestRegion.radius} km radius.` : `Located in a ${level.toLowerCase()} demand zone within a ${closestRegion.radius} km radius.`;

    return (
      <div style={{ backgroundColor: color, color: textColor, padding: '12px 20px', borderRadius: '12px', border: `1px solid ${textColor}`, display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', fontWeight: 700, marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <span style={{ fontSize: '1.5rem' }}>{icon}</span>
        <div>
          <span style={{ display: 'block', fontWeight: 800 }}>{label}</span>
          <span style={{ fontSize: '0.8rem', opacity: 0.85, fontWeight: 500 }}>{desc}</span>
        </div>
      </div>
    );
  }, [property]);

  if (!property) {
    return (
      <div className="container" style={{ padding: '8rem 2rem', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A', marginBottom: '12px' }}>Property Listing Unavailable</h2>
        <p style={{ color: '#64748B', maxWidth: '480px', margin: '0 auto 24px auto', fontSize: '1rem', lineHeight: 1.5 }}>
          The requested property could not be found or has been unlisted. Please explore other available verified properties.
        </p>
        <button className="btn btn-gold" onClick={onBack} style={{ padding: '12px 28px', borderRadius: '10px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <FaArrowLeft /> Back to Properties
        </button>
      </div>
    );
  }

  const handlePrevImage = () => {
    setActiveImageIndex(prev => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex(prev => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property ? property.title : 'Property Listing',
        text: `Check out this listing on TheNexOpp: ${property?.title}`,
        url: window.location.href,
      }).catch(err => console.log('Share error:', err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    alert(`Inquiry message successfully sent to ${dealer?.companyName || 'Seller'}! They will contact you shortly.`);
    setMessage('');
  };

  // Derive specs fields
  const superArea = property.areaSqFt || '1500';
  const catLower = (property.category || '').toLowerCase();
  const titleLower = (property.title || '').toLowerCase();
  const isPlot = catLower.includes('plot') || catLower.includes('land') || titleLower.includes('plot') || titleLower.includes('land') || titleLower.includes('farm');
  const isCommercial = catLower.includes('commercial') || catLower.includes('office') || catLower.includes('shop') || titleLower.includes('commercial') || titleLower.includes('office') || titleLower.includes('shop');
  const formatArea = (areaVal?: string | number, fallback?: string) => {
    if (!areaVal && !fallback) return 'N/A';
    let str = String(areaVal || fallback || '').trim();
    if (!str || str === 'N/A') return 'N/A';
    str = str.replace(/(?:\s*(?:sq\.?\s*ft|sqft))+$/i, '').trim();
    return `${str} sqft`;
  };

  const carpetArea = isPlot ? 'N/A' : `${Math.round(parseInt(superArea) * 0.85) || 1200} sqft`;
  const typeDisplay = isPlot ? 'Plots & Land' : isCommercial ? 'Commercial Property' : (catLower.includes('villa') || catLower.includes('house')) ? 'House & Villa' : 'Flats & Apartments';

  return (
    <div className="prop-details-page animation-fade-in" style={{ padding: '115px 0 3rem', background: 'var(--bg-main)', minHeight: '100vh' }}>
      <div className="container" style={{ position: 'relative' }}>
        
        {/* Demand Region Badge */}
        {demandBadge}
        
        {/* Back navigation */}
        <button className="circle-back-btn" onClick={onBack} title="Go Back" style={{ position: 'relative', left: '0', display: 'inline-flex', marginBottom: '1.5rem', zIndex: 10 }}>
          <FaArrowLeft />
        </button>

        {/* Location Hierarchy Breadcrumbs */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: '12px 20px', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '0.85rem', fontWeight: 600, color: '#475569', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <span style={{ color: '#1E40AF', display: 'flex', alignItems: 'center', gap: '4px' }}><FaMapMarkerAlt /> India</span>
          <span>→</span>
          <span>{property.state || 'Telangana'}</span>
          <span>→</span>
          <span>{property.district || 'Hyderabad'}</span>
          <span>→</span>
          <span style={{ color: '#0F172A', fontWeight: 700 }}>{property.city}</span>
          <span>→</span>
          <span style={{ color: '#2563EB', fontWeight: 700 }}>{property.area}</span>
          {property.postal_code && (
            <>
              <span>→</span>
              <span style={{ backgroundColor: '#F1F5F9', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', color: '#64748B' }}>PIN: {property.postal_code}</span>
            </>
          )}
        </div>

        <div className="prop-details-split">
          
          {/* Left Column: Media & Specifications */}
          <div className="prop-details-left">
            
            {/* Gallery Slider */}
            <div className="prop-gallery-container">
              <div className="prop-gallery-main" style={{ position: 'relative', overflow: 'hidden', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px' }}>
                <div 
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url(${galleryImages[activeImageIndex]})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(24px) brightness(0.7)',
                    transform: 'scale(1.15)',
                    zIndex: 1,
                    display: imageFitMode === 'contain' ? 'block' : 'none'
                  }}
                />
                <button className="gallery-arrow arrow-left" onClick={handlePrevImage} style={{ zIndex: 10 }}>
                  <FaChevronLeft />
                </button>
                <button className="gallery-arrow arrow-right" onClick={handleNextImage} style={{ zIndex: 10 }}>
                  <FaChevronRight />
                </button>

                {/* View Mode Toggle Button: Fit vs Fill */}
                <button
                  onClick={() => setImageFitMode(prev => prev === 'cover' ? 'contain' : 'cover')}
                  title={imageFitMode === 'cover' ? 'Click to view full uncropped photo' : 'Click to fill container'}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    zIndex: 12,
                    backgroundColor: 'rgba(15, 23, 42, 0.78)',
                    backdropFilter: 'blur(8px)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                >
                  {imageFitMode === 'cover' ? '🔍 View Full Uncropped Photo' : '🖼️ Fill Gallery Container'}
                </button>

                <img 
                  src={galleryImages[activeImageIndex]} 
                  alt={`${property.title} - View ${activeImageIndex + 1}`} 
                  className="prop-gallery-img" 
                  style={{ position: 'relative', zIndex: 2, width: '100%', height: '100%', objectFit: imageFitMode }}
                />
                {(property.sold || property.approvalStatus === 'Sold' || property.listingStatus === 'Sold') && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '16px',
                      left: '16px',
                      backgroundColor: '#DC2626',
                      color: '#FFFFFF',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      boxShadow: '0 2px 8px rgba(220, 38, 38, 0.4)',
                      zIndex: 10,
                      fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif"
                    }}
                  >
                    SOLD
                  </div>
                )}
                <button className="gallery-arrow arrow-right" onClick={handleNextImage}>
                  <FaChevronRight />
                </button>
              </div>
              
              {/* Gallery Thumbnails */}
              <div className="prop-gallery-thumbs">
                {galleryImages.map((img: string, idx: number) => (
                  <div 
                    key={idx} 
                    className={`thumb-wrap ${idx === activeImageIndex ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(idx)}
                  >
                    <img src={img} alt="thumbnail" />
                  </div>
                ))}
              </div>
            </div>

            {/* Specifications Table */}
            <div className="prop-section-block">
              <h3 className="section-block-title">Details</h3>
              <div className="prop-spec-table">
                {(() => {
                  const activeSpecsList: { label: string; value: string }[] = [];

                  if (property.specs && typeof property.specs === 'object' && Object.keys(property.specs).length > 0) {
                    Object.entries(property.specs).forEach(([k, v]) => {
                      if (v !== undefined && v !== null && String(v).trim() !== '') {
                        activeSpecsList.push({ label: k, value: String(v) });
                      }
                    });
                  } else {
                    const rawType = property.propertySubtype || property.category || property.type || property.propertyType;
                    if (rawType && String(rawType).trim() !== '') {
                      activeSpecsList.push({
                        label: isCommercial ? 'Commercial Type' : (isPlot ? 'Property Category' : 'Property Type'),
                        value: String(rawType)
                      });
                    }

                    if (property.superBuiltUpArea || property.areaSqFt) {
                      activeSpecsList.push({
                        label: isPlot ? 'Plot Area' : 'Super Built-up Area',
                        value: String(property.superBuiltUpArea || property.areaSqFt)
                      });
                    }

                    if (property.carpetArea && String(property.carpetArea).trim() !== '') {
                      activeSpecsList.push({
                        label: 'Carpet Area',
                        value: String(property.carpetArea)
                      });
                    }

                    if (property.plotArea && !property.superBuiltUpArea && !property.areaSqFt) {
                      activeSpecsList.push({
                        label: 'Plot Area',
                        value: String(property.plotArea)
                      });
                    }

                    if (property.bedrooms !== undefined && property.bedrooms !== null && String(property.bedrooms).trim() !== '' && Number(property.bedrooms) > 0) {
                      activeSpecsList.push({
                        label: 'Bedrooms / BHK',
                        value: `${property.bedrooms} BHK`
                      });
                    }

                    if (property.bathrooms !== undefined && property.bathrooms !== null && String(property.bathrooms).trim() !== '' && Number(property.bathrooms) > 0) {
                      activeSpecsList.push({
                        label: isCommercial ? 'Washrooms' : 'Bathrooms',
                        value: `${property.bathrooms} ${isCommercial ? 'Washrooms' : 'Bathrooms'}`
                      });
                    }

                    if (property.parkingSlots !== undefined && property.parkingSlots !== null && String(property.parkingSlots).trim() !== '' && Number(property.parkingSlots) > 0) {
                      activeSpecsList.push({
                        label: 'Parking Slots',
                        value: `${property.parkingSlots} Reserved`
                      });
                    }

                    if (property.ownershipType && String(property.ownershipType).trim() !== '') {
                      activeSpecsList.push({
                        label: 'Ownership Type',
                        value: String(property.ownershipType)
                      });
                    }

                    if (property.facing && String(property.facing).trim() !== '') {
                      activeSpecsList.push({
                        label: 'Facing Direction',
                        value: String(property.facing).includes('Facing') ? String(property.facing) : `${property.facing} Facing`
                      });
                    }

                    if (property.furnishing && String(property.furnishing).trim() !== '') {
                      activeSpecsList.push({
                        label: 'Furnishing Status',
                        value: String(property.furnishing)
                      });
                    }

                    if (property.reraNumber && String(property.reraNumber).trim() !== '') {
                      activeSpecsList.push({
                        label: 'RERA Registration',
                        value: String(property.reraNumber)
                      });
                    }

                    if (property.listingStatus || property.status) {
                      activeSpecsList.push({
                        label: 'Status',
                        value: String(property.listingStatus || property.status)
                      });
                    }

                    if (Array.isArray(property.customFields)) {
                      property.customFields.forEach((cf: any) => {
                        if (cf && cf.label && cf.value && String(cf.value).trim() !== '') {
                          activeSpecsList.push({ label: String(cf.label), value: String(cf.value) });
                        }
                      });
                    }
                  }

                  if (activeSpecsList.length === 0) {
                    activeSpecsList.push({ label: 'Category', value: property.category || 'Property' });
                    activeSpecsList.push({ label: 'Location', value: property.city || property.area || 'Available' });
                  }

                  return activeSpecsList.reduce<any[]>((acc, item, idx, arr) => {
                    if (idx % 2 === 0) {
                      const next = arr[idx + 1];
                      acc.push(
                        <div key={idx} className="prop-spec-row">
                          <div className="spec-col">
                            <span className="spec-lbl">{item.label}</span>
                            <span className="spec-val" style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{item.value}</span>
                          </div>
                          {next ? (
                            <div className="spec-col">
                              <span className="spec-lbl">{next.label}</span>
                              <span className="spec-val" style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{next.value}</span>
                            </div>
                          ) : (
                            <div className="spec-col">
                              <span className="spec-lbl"></span>
                              <span className="spec-val"></span>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return acc;
                  }, []);
                })()}
              </div>
            </div>

            {/* Description Section */}
            <div className="prop-section-block" style={{ marginTop: '2rem' }}>
              <h3 className="section-block-title">Description</h3>
              <div 
                className="prop-desc-text"
                style={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  lineHeight: '1.85',
                  fontSize: '1rem',
                  color: '#334155',
                  backgroundColor: '#FFFFFF',
                  padding: '24px',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                }}
              >
                {property.description || 'No description provided.'}
              </div>
            </div>

            {/* Amenities Section */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="prop-section-block" style={{ marginTop: '2rem' }}>
                <h3 className="section-block-title">Amenities & Facilities</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '1rem' }}>
                  {property.amenities.map((am: string, i: number) => (
                    <span key={i} style={{ padding: '8px 16px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      ✓ {am}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Virtual Tour Section */}
            {property.virtualTourUrl && (
              <div className="prop-section-block" style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px' }}>
                <h3 className="section-block-title" style={{ color: '#1E40AF' }}>🎥 360° Virtual Walkthrough & Tour</h3>
                <p style={{ fontSize: '0.9rem', color: '#334155', margin: '0.5rem 0 1rem 0' }}>Experience a full digital interactive walkthrough of this property from anywhere.</p>
                <a href={property.virtualTourUrl} target="_blank" rel="noopener noreferrer" className="btn" style={{ backgroundColor: '#1E40AF', color: '#FFF', padding: '10px 24px', borderRadius: '4px', textDecoration: 'none', fontWeight: 700, display: 'inline-block' }}>
                  Launch 360° Virtual Walkthrough →
                </a>
              </div>
            )}

            {/* Interactive Location Intelligence & Nearby Places Amenity Discovery Section */}
            <div className="prop-section-block" style={{ marginTop: '2.5rem', backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 className="section-block-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#0F172A' }}>
                    🗺️ Google Maps Location
                  </h3>
                  <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
                    {property.formatted_address || `${property.area}, ${property.city}, ${property.state}`}
                  </span>
                </div>
                {property.google_place_id && (
                  <span style={{ backgroundColor: '#EFF6FF', color: '#1D4ED8', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid #BFDBFE', fontFamily: 'monospace' }}>
                    Place ID: {property.google_place_id}
                  </span>
                )}
              </div>

              {/* Interactive Map Grid Container */}
              <div className="property-map-container">
                <PropertyLocationMap
                  latitude={property.latitude}
                  longitude={property.longitude}
                  title={property.title}
                  area={property.area}
                  price={property.priceDisplay}
                />

                {/* Map Bottom Bar */}
                <div style={{ position: 'absolute', bottom: '12px', left: '12px', right: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000 }}>
                  <span style={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', color: '#FFFFFF', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #334155' }}>
                    GPS: {(property.latitude || 17.4326).toFixed(4)}° N, {(property.longitude || 78.4071).toFixed(4)}° E
                  </span>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(property.formatted_address || (property.area + ', ' + property.city))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ backgroundColor: '#2563EB', color: '#FFFFFF', padding: '8px 16px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)' }}
                  >
                    📍 Get Google Maps Navigation →
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing, Seller, Maps */}
          <div className="prop-details-right">
            
            {/* Price Box */}
            <div className="prop-right-box prop-price-box">
              <div className="price-box-header">
                <h2 className="price-title">{property.priceDisplay?.startsWith('₹') ? property.priceDisplay : `₹ ${property.priceDisplay}`}</h2>
                <div className="price-actions">
                  <button className="action-circle-btn" onClick={handleShare} title="Share Link">
                    <FaShareAlt />
                  </button>
                  <button 
                    className={`action-circle-btn wishlist-circle-btn ${isWishlisted(property.id) ? 'active' : ''}`} 
                    onClick={() => toggleWishlist(property.id)}
                    title={isWishlisted(property.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  >
                    {isWishlisted(property.id) ? <FaHeart className="filled" /> : <FaRegHeart />}
                  </button>
                </div>
              </div>
              <h4 className="price-specs-subtitle">
                {property.specs
                  ? property.specs.Type || property.areaSqFt
                  : isPlot
                  ? `${property.plotArea || property.areaSqFt || `${superArea} Sq. Yds`} • Clear Title Plot`
                  : isCommercial
                  ? `${property.superBuiltUpArea || `${superArea} sqft`} • Commercial Property`
                  : `${property.bedrooms ? `${property.bedrooms} BHK` : '3 BHK'} - ${property.bathrooms ? `${property.bathrooms} Bathroom` : '2 Bathroom'} • ${superArea} sqft`}
              </h4>
              <p className="price-title-sub" style={{ marginBottom: (property.sold || property.approvalStatus === 'Sold' || property.listingStatus === 'Sold') ? '6px' : undefined }}>{property.title}</p>
              
              {(property.sold || property.approvalStatus === 'Sold' || property.listingStatus === 'Sold') && (
                <div style={{ marginTop: '8px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      backgroundColor: '#DC2626',
                      color: '#FFFFFF',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      boxShadow: '0 2px 8px rgba(220, 38, 38, 0.4)',
                      fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif"
                    }}
                  >
                    SOLD
                  </span>
                  <span style={{ color: '#DC2626', fontWeight: 800, fontSize: '0.88rem' }}>
                    Recently Sold
                  </span>
                </div>
              )}
              
              <div className="price-box-footer" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
                  <span className="price-loc"><FaMapMarkerAlt /> {property.area}, {property.city}</span>
                  <span className="price-date">Posted: {property.createdDate}</span>
                </div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  color: '#059669',
                  fontWeight: 700,
                  backgroundColor: '#ECFDF5',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  border: '1px solid #A7F3D0'
                }}>
                  <FaEye style={{ fontSize: '0.8rem', color: '#059669' }} />
                  <span>{(property.viewsCount || 0).toLocaleString()} Views</span>
                </div>
              </div>

              {dealer && (
                <div style={{ marginTop: '1rem', borderTop: '1px solid #E2E8F0', paddingTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748B' }}>Posted by:</span>
                  <button 
                    onClick={() => setShowSellerPortfolio(true)} 
                    style={{ background: 'none', border: 'none', padding: 0, color: '#1E40AF', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline', fontSize: '0.85rem' }}
                    title="View Broker Profile"
                  >
                    {dealer.fullName || dealer.companyName}
                  </button>
                </div>
              )}

              {(property.approvalStatus === 'Sold' || property.listingStatus === 'Sold') ? (
                <>
                  <button 
                    className="btn w-100 mt-4" 
                    style={{ width: '100%', marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', backgroundColor: '#DC2626', borderColor: '#DC2626', color: '#FFFFFF', cursor: 'not-allowed' }}
                    disabled
                  >
                    Property Sold
                  </button>
                  <button 
                    className="btn w-100 mt-2" 
                    style={{ width: '100%', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', backgroundColor: '#94A3B8', borderColor: '#94A3B8', color: '#FFFFFF', cursor: 'not-allowed' }}
                    disabled
                    title="This property has been sold."
                  >
                    Book Visit
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className="btn btn-gold w-100 mt-4" 
                    style={{ width: '100%', marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', backgroundColor: '#16A34A', borderColor: '#16A34A', color: '#FFFFFF' }}
                    onClick={() => handleOpenContactModal('contact')}
                  >
                    <FaPhone /> Contact Us
                  </button>
                  <button 
                    className="btn btn-outline w-100 mt-2" 
                    style={{ width: '100%', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: '1px solid #CBD5E1', color: '#0F172A' }}
                    onClick={() => handleOpenContactModal('book')}
                  >
                    Book Slot
                  </button>
                </>
              )}
            </div>

            {/* Seller Contact Card */}
            {dealer && (
              <div 
                className="prop-right-box prop-seller-card" 
                style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', cursor: 'pointer', marginTop: '1rem' }}
                onClick={() => setShowSellerPortfolio(true)}
                title="View Broker Profile"
              >
                {dealer.photo || dealer.logo ? (
                  <img 
                    src={dealer.photo || dealer.logo} 
                    alt={dealer.fullName || dealer.companyName} 
                    style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #E2E8F0', backgroundColor: '#EFF6FF', flexShrink: 0 }} 
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                      if (e.currentTarget.parentElement) {
                        const fallback = document.createElement('div');
                        fallback.style.cssText = 'width:45px;height:45px;border-radius:50%;background-color:#1E40AF;color:#FFFFFF;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.95rem;border:2px solid #E2E8F0;flex-shrink:0;';
                        fallback.innerText = (dealer.fullName || dealer.companyName || 'B').substring(0, 2).toUpperCase();
                        e.currentTarget.parentElement.insertBefore(fallback, e.currentTarget);
                      }
                    }}
                  />
                ) : (
                  <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#1E40AF', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.95rem', border: '2px solid #E2E8F0', flexShrink: 0 }}>
                    {(dealer.fullName || dealer.companyName || 'B').substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', fontWeight: 600 }}>Assigned Broker</span>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>{dealer.fullName || dealer.companyName}</h4>
                </div>
              </div>
            )}

            {/* Posted In Section */}
            <div className="prop-right-box prop-posted-in" style={{ marginTop: '1rem' }}>
              <h4 className="posted-in-title">Posted in</h4>
              <p className="posted-in-text"><FaMapMarkerAlt /> {property.area}, {property.city}, {property.state}</p>
            </div>
 
          </div>
        </div>

        {/* Bottom Section: Automated Properties Nearby (Within 2 KM, 5 KM, 10 KM) */}
        <div className="prop-other-listings-section" style={{ marginTop: '4rem', borderTop: '1px solid var(--border-color)', paddingTop: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '2rem' }}>
            <div>
              <h3 className="section-block-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                📍 Properties Nearby (Spatial Haversine Calculation)
              </h3>
              <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Showing properties within {nearbyRadiusFilter} KM of {property.area}, {property.city}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[2, 5, 10, 25].map(rad => (
                <button
                  key={rad}
                  onClick={() => setNearbyRadiusFilter(rad)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: nearbyRadiusFilter === rad ? '2px solid #1E40AF' : '1px solid #CBD5E1',
                    backgroundColor: nearbyRadiusFilter === rad ? '#1E40AF' : '#FFFFFF',
                    color: nearbyRadiusFilter === rad ? '#FFFFFF' : '#475569',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  Within {rad} KM
                </button>
              ))}
            </div>
          </div>

          {nearbyPropertiesWithDistance.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1px dashed #CBD5E1' }}>
              <FaMapMarkerAlt style={{ fontSize: '2rem', color: '#94A3B8', marginBottom: '10px' }} />
              <h4 style={{ margin: '0 0 6px 0', color: '#334155' }}>No properties found within {nearbyRadiusFilter} KM</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>Try expanding your distance filter to 10 KM or 25 KM to see more listings.</p>
            </div>
          ) : (
            <div className="other-listings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
              {nearbyPropertiesWithDistance.map(invProp => (
                <div 
                  key={invProp.id} 
                  className="feed-card premium-card landscape-card" 
                  style={{ cursor: 'pointer', flexDirection: 'column' }}
                  onClick={() => {
                    onPropertyClick(invProp.id);
                    setActiveImageIndex(0);
                    setShowPhone(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <div className="feed-card-image-wrap" style={{ width: '100%', height: '200px' }}>
                    <img src={invProp.image} alt={invProp.title} className="feed-card-img" />
                    <div className="feed-card-badges">
                      {invProp.premium && <span className="badge-premium">💎 Premium</span>}
                      <span style={{ backgroundColor: '#EFF6FF', color: '#1D4ED8', padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800, border: '1px solid #BFDBFE' }}>
                        📍 {invProp.distanceKm.toFixed(1)} KM Away
                      </span>
                    </div>
                  </div>
                  <div className="feed-card-body" style={{ width: '100%', padding: '1.25rem' }}>
                    <div className="feed-card-price-title">
                      <h3 className="feed-prop-price" style={{ fontSize: '1.2rem' }}>₹ {invProp.priceDisplay}</h3>
                      <h4 className="feed-prop-title" style={{ fontSize: '1rem', marginTop: '0.25rem' }}>{invProp.title}</h4>
                    </div>
                    <div className="feed-card-specs" style={{ margin: '0.75rem 0', fontSize: '0.85rem' }}>
                      <span>🛏 {invProp.category === 'Apartment' ? '3 BHK' : 'House'}</span>
                      <span>📐 {invProp.areaSqFt} Sq.Ft.</span>
                    </div>
                    <div className="feed-card-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="feed-prop-location" style={{ fontSize: '0.85rem' }}><FaMapMarkerAlt /> {invProp.area}, {invProp.city}</span>
                      <span style={{ fontSize: '0.75rem', color: '#1E40AF', fontWeight: 700 }}>View Property →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Section: Other listings by the same seller */}
        {otherProperties.length > 0 && (
          <div className="prop-other-listings-section" style={{ marginTop: '4rem', borderTop: '1px solid var(--border-color)', paddingTop: '3rem' }}>
            <h3 className="section-block-title" style={{ marginBottom: '2rem' }}>Other Properties by this Seller</h3>
            <div className="other-listings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
              {otherProperties.map(invProp => (
                <div 
                  key={invProp.id} 
                  className="feed-card premium-card landscape-card" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    onPropertyClick(invProp.id);
                    setActiveImageIndex(0);
                    setShowPhone(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <div className="feed-card-image-wrap" style={{ height: '200px' }}>
                    <img src={invProp.image} alt={invProp.title} className="feed-card-img" />
                    <div className="feed-card-badges">
                      {invProp.premium && <span className="badge-premium">💎 Premium</span>}
                      {invProp.verified && <span className="badge-verified">✔ Verified</span>}
                    </div>
                  </div>
                  <div className="feed-card-body" style={{ padding: '1.25rem' }}>
                    <div className="feed-card-price-title">
                      <h3 className="feed-prop-price" style={{ fontSize: '1.2rem' }}>₹ {invProp.priceDisplay}</h3>
                      <h4 className="feed-prop-title" style={{ fontSize: '1rem', marginTop: '0.25rem' }}>{invProp.title}</h4>
                    </div>
                    <div className="feed-card-specs" style={{ margin: '0.75rem 0', fontSize: '0.85rem' }}>
                      <span>🛏 {invProp.category === 'Apartment' ? '3 BHK' : 'House'}</span>
                      <span>📐 {invProp.areaSqFt} Sq.Ft.</span>
                    </div>
                    <div className="feed-card-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
                      <span className="feed-prop-location" style={{ fontSize: '0.85rem' }}><FaMapMarkerAlt /> {invProp.area}, {invProp.city}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {showSellerPortfolio && dealer && (
        <div className="fullscreen-portfolio-overlay" data-lenis-prevent="true">
          <div className="container portfolio-container">
            <button 
              className="btn btn-back portfolio-back-btn" 
              onClick={() => setShowSellerPortfolio(false)}
            >
              <FaArrowLeft /> Back to Details
            </button>

            <div className="portfolio-header">
              {dealer.photo || dealer.logo ? (
                <img 
                  src={dealer.photo || dealer.logo} 
                  alt={dealer.companyName} 
                  className="portfolio-seller-img" 
                  style={{ objectFit: 'cover', backgroundColor: '#EFF6FF' }}
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                    if (e.currentTarget.parentElement) {
                      const fallback = document.createElement('div');
                      fallback.className = 'portfolio-seller-img';
                      fallback.style.cssText = 'background-color:#1E40AF;color:#FFFFFF;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:2rem;border-radius:50%;';
                      fallback.innerText = (dealer.companyName || 'B').substring(0, 2).toUpperCase();
                      e.currentTarget.parentElement.insertBefore(fallback, e.currentTarget);
                    }
                  }}
                />
              ) : (
                <div className="portfolio-seller-img" style={{ backgroundColor: '#1E40AF', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '2rem', borderRadius: '50%' }}>
                  {(dealer.companyName || 'B').substring(0, 2).toUpperCase()}
                </div>
              )}
              <div className="portfolio-header-text">
                <span className="section-tag">Exclusive Portfolio</span>
                <h1 className="portfolio-title">{dealer.companyName}</h1>
                <div className="portfolio-meta">
                  {dealer.rating > 0 && <span className="meta-item">⭐ {dealer.rating} {dealer.reviewCount ? `(${dealer.reviewCount} Reviews)` : ''}</span>}
                  {dealer.yearsExperience != null && <span className="meta-item">💼 {dealer.yearsExperience} Years Exp</span>}
                  <span className="meta-item">🏢 {brokerListings.active.length} Active Listings</span>
                  <span className="meta-item">🤝 {brokerListings.sold.length} Sold Properties</span>
                </div>
              </div>
            </div>

            {/* Seller Profile & Contact Section */}
            <div className="portfolio-seller-details-card premium-card" style={{ marginBottom: '2rem', padding: '2.5rem' }}>
              <div className="seller-details-grid">
                <div className="seller-profile-column">
                  {dealer.photo || dealer.logo ? (
                    <img 
                      src={dealer.photo || dealer.logo} 
                      alt={dealer.companyName} 
                      className="seller-details-avatar" 
                      style={{ objectFit: 'cover', backgroundColor: '#EFF6FF' }}
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                        if (e.currentTarget.parentElement) {
                          const fallback = document.createElement('div');
                          fallback.className = 'seller-details-avatar';
                          fallback.style.cssText = 'background-color:#1E40AF;color:#FFFFFF;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:2rem;border-radius:50%;';
                          fallback.innerText = (dealer.companyName || 'B').substring(0, 2).toUpperCase();
                          e.currentTarget.parentElement.insertBefore(fallback, e.currentTarget);
                        }
                      }}
                    />
                  ) : (
                    <div className="seller-details-avatar" style={{ backgroundColor: '#1E40AF', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '2rem', borderRadius: '50%' }}>
                      {(dealer.companyName || 'B').substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <h3 className="seller-details-name">{dealer.companyName}</h3>
                  <div className="seller-details-badges" style={{ marginTop: '0.5rem' }}>
                    {dealer.verified && <span className="badge-verified" style={{ marginRight: '8px' }}>✔ Verified Dealer</span>}
                    {dealer.premiumPartner && <span className="badge-premium">💎 Premium Partner</span>}
                  </div>
                  {dealer.rating > 0 && (
                    <div className="seller-details-rating" style={{ marginTop: '1rem', fontSize: '1.1rem' }}>
                      ⭐ <strong>{dealer.rating}</strong> {dealer.reviewCount ? `(${dealer.reviewCount} user reviews)` : ''}
                    </div>
                  )}
                </div>

                <div className="seller-info-column">
                  <h4 className="column-title">Contact & Agent Information</h4>
                  <div className="info-list">
                    {dealer.fullName && (
                      <div className="info-item">
                        <span className="info-label">👤 Authorized Name</span>
                        <span className="info-value">{dealer.fullName}</span>
                      </div>
                    )}
                    {(dealer.city || dealer.state || dealer.district) && (
                      <div className="info-item">
                        <span className="info-label">📍 Headquarters / City</span>
                        <span className="info-value">{[dealer.city, dealer.district, dealer.state].filter(Boolean).join(', ')}</span>
                      </div>
                    )}
                    {dealer.responseTime && (
                      <div className="info-item">
                        <span className="info-label">⏱ Avg Response Time</span>
                        <span className="info-value">{dealer.responseTime}</span>
                      </div>
                    )}
                    {dealer.yearsExperience != null && (
                      <div className="info-item">
                        <span className="info-label">💼 Experience</span>
                        <span className="info-value">{dealer.yearsExperience} Years in Market</span>
                      </div>
                    )}
                  </div>

                  <div className="portfolio-message-box" style={{ marginTop: '2rem' }}>
                    <h5 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Send Direct Message</h5>
                    <textarea 
                      className="inquiry-textarea" 
                      placeholder={`Write your inquiry message for ${dealer.companyName} here...`}
                      style={{ width: '100%', height: '100px', padding: '1rem', borderRadius: '6px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontFamily: 'inherit', resize: 'none' }}
                    />
                    <button 
                      className="btn btn-gold" 
                      style={{ marginTop: '1rem', width: '100%' }}
                      onClick={() => alert(`Your inquiry has been successfully sent to ${dealer.companyName}! They will get back to you shortly.`)}
                    >
                      Submit Inquiry
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs Header */}
            <div style={{ marginBottom: '1.5rem', borderBottom: '2px solid #E2E8F0', paddingBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Broker Listings & Portfolio
                </h3>
                <p style={{ margin: '4px 0 0 0', color: '#64748B', fontSize: '0.88rem' }}>
                  Explore active offerings and previous transactions by {dealer.companyName}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', backgroundColor: '#F1F5F9', padding: '4px', borderRadius: '12px' }}>
                <button
                  type="button"
                  onClick={() => setPortfolioTab('active')}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: portfolioTab === 'active' ? '#FFFFFF' : 'transparent',
                    color: portfolioTab === 'active' ? '#1E40AF' : '#64748B',
                    boxShadow: portfolioTab === 'active' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
                  }}
                >
                  Active Listings ({brokerListings.active.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPortfolioTab('sold')}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: portfolioTab === 'sold' ? '#FFFFFF' : 'transparent',
                    color: portfolioTab === 'sold' ? '#DC2626' : '#64748B',
                    boxShadow: portfolioTab === 'sold' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
                  }}
                >
                  Previously Sold ({brokerListings.sold.length})
                </button>
              </div>
            </div>

            {/* Properties Grid */}
            <div className="portfolio-grid">
              {(portfolioTab === 'active' ? brokerListings.active : brokerListings.sold).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', gridColumn: '1 / -1', backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                  <p style={{ fontSize: '1rem', color: '#64748B', fontWeight: 600 }}>
                    {portfolioTab === 'active' 
                      ? `No active listings currently available for ${dealer.companyName}.`
                      : `No previously sold properties recorded yet for ${dealer.companyName}.`}
                  </p>
                </div>
              ) : (
                (portfolioTab === 'active' ? brokerListings.active : brokerListings.sold).map((item: any) => (
                  <div 
                    key={item.id} 
                    className="feed-card premium-card landscape-card portfolio-card-item" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      if (item.itemType === 'Property') {
                        setShowSellerPortfolio(false);
                        onPropertyClick(item.id);
                        setActiveImageIndex(0);
                        setShowPhone(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                  >
                    <div className="feed-card-image-wrap" style={{ position: 'relative' }}>
                      <img 
                        src={item.image || item.imageUrl || '/assets/luxury_apartment.png'} 
                        alt={item.title || item.name} 
                        className="feed-card-img" 
                      />
                      {item.isSold ? (
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          left: '12px',
                          backgroundColor: '#DC2626',
                          color: '#FFFFFF',
                          padding: '5px 12px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 800,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                          boxShadow: '0 4px 10px rgba(220, 38, 38, 0.3)',
                          zIndex: 3
                        }}>
                          SOLD / CLOSED DEAL
                        </div>
                      ) : (
                        <button 
                          className="buy-now-badge"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowSellerPortfolio(false);
                            onBuyProperty?.(item.id);
                          }}
                        >
                          <FaShoppingCart /> Buy
                        </button>
                      )}
                      <div className="feed-card-badges">
                        {item.itemType && <span style={{ backgroundColor: '#EFF6FF', color: '#1E40AF', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 800 }}>{item.itemType}</span>}
                        {item.premium && <span className="badge-premium">💎 Premium</span>}
                        {item.verified && <span className="badge-verified">✔ Verified</span>}
                      </div>
                    </div>

                    <div className="feed-card-body">
                      <div className="feed-card-price-title">
                        <h3 className="feed-prop-price" style={{ color: item.isSold ? '#DC2626' : undefined }}>
                          ₹ {item.priceDisplay || item.price}
                        </h3>
                        <h4 className="feed-prop-title">{item.title || item.name}</h4>
                      </div>
                      <div className="feed-card-specs">
                        {item.areaSqFt && <span>📐 {item.areaSqFt}</span>}
                        {item.isSold && <span style={{ color: '#DC2626', fontWeight: 700 }}>✓ Transaction Completed</span>}
                      </div>
                      <div className="feed-card-footer">
                        <span className="feed-prop-location"><FaMapMarkerAlt /> {item.area || item.location || ''}{item.city ? `, ${item.city}` : ''}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default PropertyDetailsPage;
