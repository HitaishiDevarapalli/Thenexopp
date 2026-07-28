import React, { useState, useMemo, useEffect } from 'react';
import { propertiesDb, dealersDb, franchiseDb, businessDb, enquiriesDb, notifyDataChanged, demandRegionsDb, getDistance, incrementPropertyViewCount } from '../db/marketplaceDb';
import type { Dealer } from '../db/marketplaceDb';
import { 
  FaArrowLeft, FaHeart, FaRegHeart, FaShareAlt, 
  FaMapMarkerAlt, FaShoppingCart, FaPhone, 
  FaChevronLeft, FaChevronRight 
} from 'react-icons/fa';
import { useWishlist } from '../context/WishlistContext';
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
  
  return <div ref={mapContainerRef} style={{ width: '100%', height: '100%', borderRadius: '16px', zIndex: 1 }} />;
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
}

export const PropertyDetailsPage: React.FC<PropertyDetailsPageProps> = ({ 
  propertyId, 
  onBack, 
  onPropertyClick,
  onBuyProperty
}) => {
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const [message, setMessage] = useState('');
  const [showSellerPortfolio, setShowSellerPortfolio] = useState(false);
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

  const handleOpenContactModal = (mode: 'contact' | 'book' = 'contact') => {
    setModalMode(mode);
    setContactName('');
    setContactPhone('');
    setContactPrice(property ? property.priceDisplay : '');
    setBookingDate('');
    setBookingTime('');
    setContactSubmitted(false);
    setShowContactModal(true);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim()) {
      alert('Please fill in your Name and Phone Number.');
      return;
    }
    
    if (modalMode === 'book' && (!bookingDate || !bookingTime)) {
      alert('Please select a date and time for your visit.');
      return;
    }
    
    const newEnquiry = {
      id: `ENQ-${Date.now()}`,
      customerName: contactName,
      phone: contactPhone,
      email: '',
      listingTitle: property ? property.title : 'Unknown Property',
      brokerName: dealer ? (dealer.fullName || dealer.companyName) : 'Not Assigned',
      status: 'New' as const,
      priority: 'High' as const,
      source: 'Property Details Page',
      date: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      name: contactName,
      interest: modalMode === 'book' 
        ? `Requested Visit: ${bookingDate} at ${bookingTime}`
        : `Offered Price: ${contactPrice}`
    };

    enquiriesDb.push(newEnquiry);
    notifyDataChanged();
    
    setContactSubmitted(true);
    setTimeout(() => {
      setShowContactModal(false);
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
      const index = parseInt(b.id.replace(/\D/g, '')) || 1;
      const dealerId = index % 2 === 0 ? 'D2' : 'D1';
      return {
        id: b.id,
        dealerId: dealerId,
        title: b.name,
        description: `Premium running operational unit in the ${b.industry} sector. Monthly revenue averages verified against GST/tax registries. Sale includes trade license transfers, lease assignment, assets, inventory, and supplier contracts. Seller profile: ${b.sellerProfile}.`,
        image: b.image,
        state: b.state || 'Telangana',
        district: 'Rangareddy',
        city: b.city || 'Hyderabad',
        area: b.location.split(',')[1]?.trim() || b.location,
        areaSqFt: 'Operational Unit',
        priceDisplay: b.priceDisplay,
        category: 'Commercial',
        specs: {
          'Type': 'Business Acquisition',
          'Industry': b.industry,
          'Trust Score': `${b.trustScore}%`,
          'Revenue': b.revenue,
          'Status': 'Running',
          'Seller Profile': b.sellerProfile,
          'Listed By': 'Broker Brokerage',
          'Headquarters': b.location
        }
      } as any;
    }

    return null;
  }, [propertyId]);

  // Reset all state, scroll to top, and increment property view count when propertyId changes
  useEffect(() => {
    setActiveImageIndex(0);
    setShowPhone(false);
    setMessage('');
    setShowSellerPortfolio(false);
    setAmenityCache({});
    if (propertyId) {
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
      if (ogImg) ogImg.setAttribute('content', property.image || property.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80');

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
        photo: property.agentImage || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
        logo: property.agentImage || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
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

  // Generate dynamic gallery images based on category
  const galleryImages = useMemo(() => {
    if (!property) return [];
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
      return ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80'];
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

  if (!property) {
    return (
      <div className="container" style={{ padding: '6rem 2rem', textAlign: 'center' }}>
        <h2>Property Not Found</h2>
        <button className="btn btn-gold mt-4" onClick={onBack}><FaArrowLeft /> Go Back</button>
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
        title: property.title,
        text: property.description,
        url: window.location.href,
      }).catch(() => {});
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

  // EMI Calculator State
  const [loanAmountLakhs, setLoanAmountLakhs] = useState<number>(150);
  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [loanTenureYears, setLoanTenureYears] = useState<number>(20);

  useEffect(() => {
    if (property.price) {
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

  // Derive specs fields
  const superArea = property.areaSqFt;
  const isPlot = property.category === 'Plot';
  const carpetArea = isPlot ? 'N/A' : `${Math.round(parseInt(superArea) * 0.85)} sqft`;
  const typeDisplay = isPlot ? 'Plots & Land' : (property.category === 'Villa' || property.category === 'House') ? 'House & Villa' : 'Flats & Apartments';

  const demandBadge = useMemo(() => {
    if (!property.latitude || !property.longitude) return null;
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
              <div className="prop-gallery-main">
                <button className="gallery-arrow arrow-left" onClick={handlePrevImage}>
                  <FaChevronLeft />
                </button>
                <img 
                  src={galleryImages[activeImageIndex]} 
                  alt={`${property.title} - View ${activeImageIndex + 1}`} 
                  className="prop-gallery-img" 
                />
                {(property.approvalStatus === 'Sold' || property.listingStatus === 'Sold') && (
                  <>
                    <style>{`
                      @keyframes soldBadgeFadeIn {
                        from { opacity: 0; transform: scale(0.9) rotate(-10deg); }
                        to { opacity: 1; transform: scale(1) rotate(-10deg); }
                      }
                    `}</style>
                    <div
                      style={{
                        position: 'absolute',
                        top: '20px',
                        left: '20px',
                        backgroundColor: '#E53935',
                        color: '#FFFFFF',
                        padding: '8px 18px',
                        borderRadius: '9999px',
                        fontSize: '14px',
                        fontWeight: 900,
                        letterSpacing: '0.05em',
                        boxShadow: '0 4px 12px rgba(229, 57, 53, 0.5)',
                        zIndex: 10,
                        transform: 'rotate(-10deg)',
                        animation: 'soldBadgeFadeIn 0.4s ease-out forwards',
                        fontFamily: "'Outfit', 'Inter', sans-serif"
                      }}
                    >
                      SOLD
                    </div>
                  </>
                )}
                <button className="gallery-arrow arrow-right" onClick={handleNextImage}>
                  <FaChevronRight />
                </button>
              </div>
              
              {/* Gallery Thumbnails */}
              <div className="prop-gallery-thumbs">
                {galleryImages.map((img, idx) => (
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
                {property.specs ? (
                  // Custom dynamic specifications for Franchise / Business
                  Object.entries(property.specs).reduce<any[]>((acc, [key, val], idx, arr) => {
                    if (idx % 2 === 0) {
                      const next = arr[idx + 1];
                      acc.push(
                        <div key={idx} className="prop-spec-row">
                          <div className="spec-col">
                            <span className="spec-lbl">{key}</span>
                            <span className="spec-val" style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{val as string}</span>
                          </div>
                          {next ? (
                            <div className="spec-col">
                              <span className="spec-lbl">{next[0]}</span>
                              <span className="spec-val" style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{next[1] as string}</span>
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
                  }, [])
                ) : (
                  // Default property specifications
                  <>
                    <div className="prop-spec-row">
                      <div className="spec-col">
                        <span className="spec-lbl">Type</span>
                        <span className="spec-val">{property.propertySubtype || typeDisplay}</span>
                      </div>
                      <div className="spec-col">
                        <span className="spec-lbl">Bedrooms</span>
                        <span className="spec-val">{isPlot ? 'N/A' : (property.bedrooms ?? 3)}</span>
                      </div>
                    </div>

                    <div className="prop-spec-row">
                      <div className="spec-col">
                        <span className="spec-lbl">Super Built-up area</span>
                        <span className="spec-val">{property.superBuiltUpArea || superArea}</span>
                      </div>
                      <div className="spec-col">
                        <span className="spec-lbl">Bathrooms</span>
                        <span className="spec-val">{isPlot ? 'N/A' : (property.bathrooms ?? 2)}</span>
                      </div>
                    </div>

                    <div className="prop-spec-row">
                      <div className="spec-col">
                        <span className="spec-lbl">Project Status</span>
                        <span className="spec-val">{property.listingStatus || 'Ready to Move'}</span>
                      </div>
                      <div className="spec-col">
                        <span className="spec-lbl">Ownership Type</span>
                        <span className="spec-val">{property.ownershipType || 'Freehold'}</span>
                      </div>
                    </div>

                    <div className="prop-spec-row">
                      <div className="spec-col">
                        <span className="spec-lbl">Facing Direction</span>
                        <span className="spec-val">{property.facing || 'North-East'}</span>
                      </div>
                      <div className="spec-col">
                        <span className="spec-lbl">Carpet area</span>
                        <span className="spec-val">{property.carpetArea || carpetArea}</span>
                      </div>
                    </div>

                    <div className="prop-spec-row">
                      <div className="spec-col">
                        <span className="spec-lbl">Parking Slots</span>
                        <span className="spec-val">{isPlot ? 'None' : (property.parkingSlots ?? 2)}</span>
                      </div>
                      <div className="spec-col">
                        <span className="spec-lbl">Furnishing</span>
                        <span className="spec-val">{property.furnishing || 'Semi-Furnished'}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Description Section */}
            <div className="prop-section-block" style={{ marginTop: '2rem' }}>
              <h3 className="section-block-title">Description</h3>
              <p className="prop-desc-text">{property.description}</p>
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
              {/* Interactive Map Grid Container */}
              <div style={{ width: '100%', height: '340px', borderRadius: '16px', position: 'relative', overflow: 'hidden', border: '2px solid #E2E8F0', marginBottom: '24px' }}>
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
                <h2 className="price-title">₹ {property.priceDisplay}</h2>
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
                {property.specs ? property.specs.Type || property.areaSqFt : `${isPlot ? 'Plot / Land' : '3 BHK - 2 Bathroom'} - ${superArea} sqft`}
              </h4>
              <p className="price-title-sub">{property.title}</p>
              
              <div className="price-box-footer">
                <span className="price-loc"><FaMapMarkerAlt /> {property.area}, {property.city}</span>
                <span className="price-date">Posted: {property.createdDate}</span>
                <span className="price-date" style={{ color: '#16A34A', display: 'flex', alignItems: 'center', gap: '4px' }}>👁️ {property.viewsCount || 0} Views</span>
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
                <img src={dealer.photo || dealer.logo} alt={dealer.fullName || dealer.companyName} style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'contain', border: '2px solid #E2E8F0', backgroundColor: '#EFF6FF' }} />
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
              <img 
                src={dealer.photo || dealer.logo} 
                alt={dealer.companyName} 
                className="portfolio-seller-img" 
                style={{ objectFit: 'contain', backgroundColor: '#EFF6FF' }}
              />
              <div className="portfolio-header-text">
                <span className="section-tag">Exclusive Portfolio</span>
                <h1 className="portfolio-title">{dealer.companyName}</h1>
                <div className="portfolio-meta">
                  <span className="meta-item">⭐ {dealer.rating} ({dealer.reviewCount} Reviews)</span>
                  <span className="meta-item">💼 {dealer.yearsExperience} Years Exp</span>
                  <span className="meta-item">🏢 {dealer.inventoryCount} Active Properties</span>
                </div>
              </div>
            </div>

            {/* Seller Profile & Contact Section */}
            <div className="portfolio-seller-details-card premium-card" style={{ marginBottom: '3rem', padding: '2.5rem' }}>
              <div className="seller-details-grid">
                <div className="seller-profile-column">
                  <img 
                    src={dealer.photo || dealer.logo} 
                    alt={dealer.companyName} 
                    className="seller-details-avatar" 
                    style={{ objectFit: 'contain', backgroundColor: '#EFF6FF' }}
                  />
                  <h3 className="seller-details-name">{dealer.companyName}</h3>
                  <div className="seller-details-badges" style={{ marginTop: '0.5rem' }}>
                    {dealer.verified && <span className="badge-verified" style={{ marginRight: '8px' }}>✔ Verified Dealer</span>}
                    {dealer.premiumPartner && <span className="badge-premium">💎 Premium Partner</span>}
                  </div>
                  <div className="seller-details-rating" style={{ marginTop: '1rem', fontSize: '1.1rem' }}>
                    ⭐ <strong>{dealer.rating}</strong> ({dealer.reviewCount} user reviews)
                  </div>
                </div>

                <div className="seller-info-column">
                  <h4 className="column-title">Contact & Agent Information</h4>
                  <div className="info-list">
                    <div className="info-item">
                      <span className="info-label">👤 Authorized Name</span>
                      <span className="info-value">{dealer.fullName || `${dealer.companyName} Operations Group`}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">📞 Mobile Number</span>
                      <span className="info-value" style={{ color: 'var(--gold)', fontWeight: 'bold' }}>{dealer.phone || dealer.mobileNumber || '+91 99890 87654'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">✉ Email Address</span>
                      <span className="info-value">{dealer.email || `info@${dealer.companyName.toLowerCase().replace(/\s+/g, '')}.com`}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">📍 Headquarters / City</span>
                      <span className="info-value">Jubilee Hills, Hyderabad, Telangana</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">⏱ Avg Response Time</span>
                      <span className="info-value">{dealer.responseTime}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">💼 Experience</span>
                      <span className="info-value">{dealer.yearsExperience} Years in Market</span>
                    </div>
                    {/* Instagram social link below everything in the contact info list */}
                    <div className="info-item">
                      <span className="info-label">📸 Instagram Profile</span>
                      <span className="info-value">
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)', textDecoration: 'underline' }}>
                          @thenexopp
                        </a>
                      </span>
                    </div>
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

            {/* Properties Grid */}
            <div className="portfolio-grid">
              {propertiesDb.filter(p => p.dealerId === dealer.id).map(prop => (
                <div 
                  key={prop.id} 
                  className="feed-card premium-card landscape-card portfolio-card-item" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setShowSellerPortfolio(false);
                    onPropertyClick(prop.id);
                    setActiveImageIndex(0);
                    setShowPhone(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <div className="feed-card-image-wrap">
                    <img 
                      src={prop.image} 
                      alt={prop.title} 
                      className="feed-card-img" 
                    />
                    <button 
                      className={`wishlist-btn ${isWishlisted(prop.id) ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(prop.id);
                      }}
                    >
                      {isWishlisted(prop.id) ? <FaHeart className="heart-icon filled" /> : <FaRegHeart className="heart-icon outline" />}
                    </button>
                    <button 
                      className="buy-now-badge"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowSellerPortfolio(false);
                        onBuyProperty?.(prop.id);
                      }}
                    >
                      <FaShoppingCart /> Buy
                    </button>
                    <div className="feed-card-badges">
                      {prop.premium && <span className="badge-premium">💎 Premium</span>}
                      {prop.verified && <span className="badge-verified">✔ Verified</span>}
                    </div>
                  </div>

                  <div className="feed-card-body">
                    <div className="feed-card-price-title">
                      <h3 className="feed-prop-price">₹ {prop.priceDisplay}</h3>
                      <h4 className="feed-prop-title">{prop.title}</h4>
                    </div>
                    <div className="feed-card-specs">
                      <span>📐 {prop.areaSqFt}</span>
                    </div>
                    <div className="feed-card-footer">
                      <span className="feed-prop-location"><FaMapMarkerAlt /> {prop.area}, {prop.city}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Contact Enquiry Modal */}
      {showContactModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 11000 }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '0', borderRadius: '24px', width: '90%', maxWidth: '460px', boxShadow: '0 20px 50px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0', margin: 'auto', textAlign: 'left', overflow: 'hidden' }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
              <div>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif", fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  {modalMode === 'book' ? 'Book Visit Slot' : 'Contact Broker'}
                </h3>
                <p style={{ margin: '4px 0 0 0', color: '#64748B', fontSize: '0.85rem' }}>{property?.title}</p>
              </div>
              <button 
                onClick={() => setShowContactModal(false)} 
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', fontWeight: 'bold', color: '#64748B', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            {contactSubmitted ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <span style={{ fontSize: '3rem' }}>✅</span>
                <h4 style={{ color: '#16A34A', fontSize: '1.2rem', fontWeight: 800, marginTop: '12px' }}>Inquiry Sent Successfully!</h4>
                <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '6px' }}>The broker will reach out to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Your Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={contactName} 
                    onChange={e => setContactName(e.target.value)} 
                    placeholder="Enter your full name" 
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.9rem' }} 
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Phone Number *</label>
                  <input 
                    type="text" 
                    required 
                    value={contactPhone} 
                    onChange={e => setContactPhone(e.target.value)} 
                    placeholder="Enter 10-digit number" 
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.9rem' }} 
                  />
                </div>

                {modalMode === 'contact' ? (
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Offered Price (Lakhs/Crores)</label>
                    <input 
                      type="text" 
                      value={contactPrice} 
                      onChange={e => setContactPrice(e.target.value)} 
                      placeholder="e.g. ₹ 75 Lakh" 
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.9rem' }} 
                    />
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Select Date *</label>
                      <input 
                        type="date" 
                        required 
                        value={bookingDate} 
                        onChange={e => setBookingDate(e.target.value)} 
                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }} 
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Select Time *</label>
                      <input 
                        type="time" 
                        required 
                        value={bookingTime} 
                        onChange={e => setBookingTime(e.target.value)} 
                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }} 
                      />
                    </div>
                  </div>
                )}

                <button 
                  type="submit" 
                  style={{ width: '100%', padding: '14px', backgroundColor: '#1E40AF', color: '#FFFFFF', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', marginTop: '8px', boxShadow: '0 4px 12px rgba(30, 64, 175, 0.3)' }}
                >
                  {modalMode === 'book' ? '📅 Confirm Booking Slot' : '✉ Submit Details to Broker'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default PropertyDetailsPage;
