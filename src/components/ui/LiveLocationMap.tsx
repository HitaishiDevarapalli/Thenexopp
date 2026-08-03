import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { parseIndiaLocation } from '../../utils/locationIntelligence';
import { selectedCity as dbSelectedCity, demandRegionsDb, getDistance } from '../../db/marketplaceDb';
import { FaLocationArrow, FaPlus, FaMinus, FaCompressArrowsAlt, FaMapMarkerAlt } from 'react-icons/fa';

interface LiveLocationMapProps {
  items: Array<any>;
  type: 'property' | 'business' | 'franchise';
  onSelectItem?: (id: string) => void;
  height?: string;
  localSearchLocation?: string;
}

export const LiveLocationMap: React.FC<LiveLocationMapProps> = ({
  items,
  type,
  onSelectItem,
  height = '380px',
  localSearchLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [centerCity, setCenterCity] = useState<string>(() => {
    return localStorage.getItem('nexopp_selected_city') || dbSelectedCity || 'Hyderabad';
  });
  const [userGps, setUserGps] = useState<{ lat: number; lng: number; label: string } | null>(null);
  const [detectingGps, setDetectingGps] = useState(false);
  const [demandFilter, setDemandFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');

  // Listen to city changes in localStorage or db
  useEffect(() => {
    const handleStorage = () => {
      const city = localStorage.getItem('nexopp_selected_city') || dbSelectedCity || 'Hyderabad';
      if (city !== centerCity) {
        setCenterCity(city);
      }
    };
    const interval = setInterval(handleStorage, 1000);
    window.addEventListener('storage', handleStorage);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
    };
  }, [centerCity]);

  const effectiveCity = localSearchLocation && localSearchLocation.trim() !== '' && !localSearchLocation.toLowerCase().includes('current location') && !localSearchLocation.toLowerCase().includes('gps') 
    ? localSearchLocation 
    : centerCity;
    
  const cityGeo = parseIndiaLocation(effectiveCity);
  const mapCenter = useMemo(() => {
    return userGps || { lat: cityGeo.latitude, lng: cityGeo.longitude, label: `${effectiveCity}` };
  }, [userGps, cityGeo.latitude, cityGeo.longitude, effectiveCity]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [mapCenter.lat, mapCenter.lng],
      zoom: 13,
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
      touchZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = layerGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers & Center
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    // Clear old markers
    layer.clearLayers();

    // 1. Add Center pulsing marker ("You are here" / Selected Location)
    const centerIcon = L.divIcon({
      className: 'custom-center-pin',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; top: -38px; background-color: #FFFFFF; padding: 6px 14px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.18); font-size: 12px; font-weight: 800; color: #0F172A; white-space: nowrap; border: 2px solid #2563EB; z-index: 1000;">
            📍 You are here (${mapCenter.label})
            <div style="position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid #2563EB;"></div>
          </div>
          <div style="width: 22px; height: 22px; border-radius: 50%; background-color: #2563EB; border: 4px solid #FFFFFF; box-shadow: 0 0 0 8px rgba(37,99,235,0.3); animation: pulse 2s infinite;"></div>
        </div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });
    L.marker([mapCenter.lat, mapCenter.lng], { icon: centerIcon, zIndexOffset: 1000 }).addTo(layer);

    const boundsPoints: L.LatLng[] = [L.latLng(mapCenter.lat, mapCenter.lng)];

    // 1.5 Draw Demand Regions if filtered/enabled
    const activeRegions = demandRegionsDb.filter(r => 
      r.city.toLowerCase() === centerCity.toLowerCase() && 
      (demandFilter === 'All' || r.demandLevel === demandFilter)
    );

    activeRegions.forEach(region => {
      const color = region.demandLevel === 'High' ? '#16A34A' : (region.demandLevel === 'Medium' ? '#EAB308' : '#EF4444');
      
      // Draw Circle Overlay based on configured radius
      L.circle([region.latitude, region.longitude], {
        color: color,
        fillColor: color,
        fillOpacity: 0.12,
        radius: region.radius * 1000, // in meters
        weight: 2
      }).addTo(layer);

      // Draw Region Label Marker
      const labelIcon = L.divIcon({
        className: 'demand-region-label',
        html: `
          <div style="background-color: ${color}; color: #FFFFFF; padding: 4px 10px; border-radius: 8px; font-size: 10px; font-weight: 800; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.15); cursor: pointer;">
            📍 ${region.name} (${region.demandLevel} Demand)
          </div>
        `,
        iconSize: [120, 24],
        iconAnchor: [60, 12]
      });

      const regionMarker = L.marker([region.latitude, region.longitude], { icon: labelIcon }).addTo(layer);
      regionMarker.on('click', () => {
        map.flyTo([region.latitude, region.longitude], 14, { duration: 1.2 });
      });
    });

    // 2. Filter items according to Selected Demand Level inside configured radius
    const filteredItems = items.filter(item => {
      if (demandFilter === 'All') return true;
      return activeRegions.some(region => {
        if (item.latitude && item.longitude) {
          const dist = getDistance(region.latitude, region.longitude, item.latitude, item.longitude);
          return dist <= region.radius;
        }
        return false;
      });
    });

    // 3. Add property / business / franchise markers
    filteredItems.forEach((item, idx) => {
      let lat = item.latitude;
      let lng = item.longitude;

      // If invalid lat/lng (outside India bounds or 0,0), generate realistic coordinates around center
      if (!lat || !lng || lat < 6 || lat > 38 || lng < 68 || lng > 98) {
        const str = item.id || item.title || item.name || String(idx);
        let hash = 0;
        for (let i = 0; i < str.length; i++) hash = (hash << 5) - hash + str.charCodeAt(i);
        const offsetLat = ((hash % 100) - 50) * 0.0008; // approx 1-3 km radius around center
        const offsetLng = (((hash >> 3) % 100) - 50) * 0.0008;
        lat = mapCenter.lat + offsetLat;
        lng = mapCenter.lng + offsetLng;
      }

      boundsPoints.push(L.latLng(lat, lng));

      const displayPrice = item.priceDisplay || item.investmentDisplay || (item.price ? `₹${item.price}` : 'View Price');
      const title = item.title || item.name || item.brand || 'Property';
      const cat = item.category || item.type || item.industry || 'Listing';
      const img = item.image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=500&q=80';

      const pinColor = type === 'property' ? '#16A34A' : (type === 'business' ? '#4F46E5' : '#EA580C');

      const itemIcon = L.divIcon({
        className: 'custom-item-pin',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: transform 0.2s;">
            <div style="background-color: ${pinColor}; color: #FFFFFF; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 800; box-shadow: 0 4px 14px rgba(0,0,0,0.25); border: 2px solid #FFFFFF; white-space: nowrap; display: flex; align-items: center; gap: 4px;">
              <span>${displayPrice}</span>
            </div>
            <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid ${pinColor}; margin-top: -1px;"></div>
          </div>
        `,
        iconSize: [80, 32],
        iconAnchor: [40, 32],
      });

      const marker = L.marker([lat, lng], { icon: itemIcon }).addTo(layer);

      const popupHtml = `
        <div style="width: 220px; font-family: 'Outfit', 'Inter', sans-serif; padding: 4px;">
          <div style="width: 100%; height: 110px; border-radius: 12px; overflow: hidden; margin-bottom: 8px; position: relative; background-color: #F1F5F9;">
            <img src="${img}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=500&q=80'" />
            <span style="position: absolute; top: 6px; left: 6px; background: rgba(15,23,42,0.75); color: #FFF; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 6px; backdrop-filter: blur(4px);">${cat}</span>
            ${(item.approvalStatus === 'Sold' || item.listingStatus === 'Sold' || item.status === 'Sold') ? `
              <div style="position: absolute; top: 6px; right: 6px; background-color: #E53935; color: #FFFFFF; font-size: 10px; font-weight: 900; padding: 2px 8px; border-radius: 4px; box-shadow: 0 2px 6px rgba(229, 57, 53, 0.4); transform: rotate(5deg); font-family: 'Outfit', sans-serif; z-index: 10;">SOLD</div>
            ` : ''}
          </div>
          <h4 style="font-size: 14px; font-weight: 800; color: #0F172A; margin: 0 0 4px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${title}</h4>
          <p style="font-size: 12px; color: #64748B; margin: 0 0 8px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">📍 ${item.area || item.city || item.location || centerCity}</p>
          <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #E2E8F0; padding-top: 8px;">
            <span style="font-size: 14px; font-weight: 800; color: ${pinColor};">${displayPrice}</span>
            <button id="btn-select-${item.id}" style="background-color: #0F172A; color: #FFFFFF; border: none; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">View Details →</button>
          </div>
        </div>
      `;

      const popup = L.popup({
        closeButton: false,
        className: 'custom-map-popup',
        offset: [0, -28],
      }).setContent(popupHtml);

      marker.bindPopup(popup);

      marker.on('popupopen', () => {
        setTimeout(() => {
          const btn = document.getElementById(`btn-select-${item.id}`);
          if (btn && onSelectItem) {
            btn.onclick = () => onSelectItem(item.id);
          }
        }, 50);
      });
    });

    // Auto-fit to visible markers (including center pin)
    if (boundsPoints.length > 1) {
      const bounds = L.latLngBounds(boundsPoints);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    } else {
      map.flyTo([mapCenter.lat, mapCenter.lng], 13, { duration: 1.2 });
    }
  }, [items, mapCenter, centerCity, type, onSelectItem, demandFilter]);

  const handleDetectLiveGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserGps({ lat: latitude, lng: longitude, label: 'Live GPS Location' });
        setDetectingGps(false);
      },
      () => {
        setDetectingGps(false);
        alert('Could not retrieve live GPS location. Make sure location permissions are allowed.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const nearbyCount = useMemo(() => {
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; // km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };
    return items.filter(item => {
      const lat = item.latitude;
      const lng = item.longitude;
      if (!lat || !lng) return false;
      const dist = calculateDistance(mapCenter.lat, mapCenter.lng, lat, lng);
      return dist <= 15;
    }).length;
  }, [items, mapCenter]);

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([mapCenter.lat, mapCenter.lng], 13, { duration: 1 });
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: '24px', overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}>
      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 12px rgba(37, 99, 235, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
        }
        .custom-item-pin:hover div {
          transform: scale(1.12);
        }
        .leaflet-popup-content-wrapper {
          border-radius: 16px !important;
          box-shadow: 0 10px 25px rgba(0,0,0,0.18) !important;
          padding: 8px !important;
          border: 1px solid #E2E8F0 !important;
        }
        .leaflet-popup-tip-container {
          width: 20px !important;
          height: 10px !important;
        }
        .leaflet-container {
          font-family: 'Outfit', 'Inter', -apple-system, sans-serif !important;
          z-index: 1;
        }
      `}</style>

      {/* Map Container */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', backgroundColor: '#E2E8F0' }} />

      {/* Top Floating Bar: Location Indicator & Live GPS Button */}
      <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 500, display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)', padding: '8px 16px', borderRadius: '14px', border: '1px solid #CBD5E1', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaMapMarkerAlt style={{ color: '#2563EB', fontSize: '16px' }} />
          <div>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Map Center</span>
            <span style={{ fontSize: '13px', color: '#0F172A', fontWeight: 800 }}>{mapCenter.label}</span>
          </div>
        </div>

        <button
          onClick={handleDetectLiveGps}
          disabled={detectingGps}
          style={{
            backgroundColor: '#2563EB',
            color: '#FFFFFF',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '14px',
            fontSize: '13px',
            fontWeight: 800,
            cursor: detectingGps ? 'wait' : 'pointer',
            boxShadow: '0 4px 16px rgba(37, 99, 235, 0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1D4ED8')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2563EB')}
        >
          <FaLocationArrow className={detectingGps ? 'animate-spin' : ''} />
          <span>{detectingGps ? 'Locating GPS...' : 'Live GPS'}</span>
        </button>

        {/* Demand Region Selector */}
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)', padding: '7px 14px', borderRadius: '14px', border: '1px solid #CBD5E1', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Demand Region</span>
          <select
            value={demandFilter}
            onChange={(e) => setDemandFilter(e.target.value as any)}
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '12px', fontWeight: 800, color: '#0F172A', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <option value="All">All Regions</option>
            <option value="High">🟢 High Demand</option>
            <option value="Medium">🟡 Medium Demand</option>
            <option value="Low">🔴 Low Demand</option>
          </select>
        </div>
      </div>

      {/* Right Zoom & Reset Controls */}
      <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 500, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={() => mapInstanceRef.current?.zoomIn()}
          title="Zoom In"
          style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)', border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: '#0F172A', fontSize: '15px', fontWeight: 700, transition: 'all 0.2s' }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <FaPlus />
        </button>
        <button
          onClick={() => mapInstanceRef.current?.zoomOut()}
          title="Zoom Out"
          style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)', border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: '#0F172A', fontSize: '15px', fontWeight: 700, transition: 'all 0.2s' }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <FaMinus />
        </button>
        <button
          onClick={handleResetView}
          title="Reset View"
          style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)', border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: '#0F172A', fontSize: '15px', fontWeight: 700, marginTop: '4px', transition: 'all 0.2s' }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <FaCompressArrowsAlt />
        </button>
      </div>

      {/* Bottom Live Status Banner */}
      <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px', zIndex: 1000, display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none' }}>
        <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', color: '#FFFFFF', padding: '8px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, boxShadow: '0 4px 16px rgba(0,0,0,0.2)', pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22C55E', display: 'inline-block', animation: 'pulse 1.5s infinite' }}></span>
          <span>Showing {nearbyCount} listings within 15 km of {mapCenter.label}</span>
        </div>
      </div>
    </div>
  );
};
