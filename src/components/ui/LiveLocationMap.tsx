import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { parseIndiaLocation } from '../../utils/locationIntelligence';
import { selectedCity as dbSelectedCity, demandRegionsDb } from '../../db/marketplaceDb';
import { FaLocationArrow, FaPlus, FaMinus, FaCompressArrowsAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { useLocationStore } from '../../context/LocationContext';

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
  const { location: navbarLocation } = useLocationStore();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [userGps, setUserGps] = useState<{ lat: number; lng: number; label: string } | null>(null);
  const [detectingGps, setDetectingGps] = useState(false);
  const [demandFilter, setDemandFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');

  // Compute map center dynamically from Navbar LocationContext, localSearchLocation, or default
  const mapCenter = useMemo(() => {
    if (userGps) return userGps;

    if (navbarLocation && typeof navbarLocation.lat === 'number' && typeof navbarLocation.lng === 'number') {
      const areaLabel = navbarLocation.suburb || navbarLocation.area || navbarLocation.locality || navbarLocation.city || 'Location';
      return {
        lat: navbarLocation.lat,
        lng: navbarLocation.lng,
        label: areaLabel,
      };
    }

    const effectiveCity = localSearchLocation && localSearchLocation.trim() !== '' && !localSearchLocation.toLowerCase().includes('current location') && !localSearchLocation.toLowerCase().includes('gps') 
      ? localSearchLocation 
      : (localStorage.getItem('nexopp_selected_city') || dbSelectedCity || '');
      
    const cityGeo = parseIndiaLocation(effectiveCity);
    return {
      lat: cityGeo.latitude,
      lng: cityGeo.longitude,
      label: effectiveCity || cityGeo.area || cityGeo.city || 'All Locations',
    };
  }, [userGps, navbarLocation, localSearchLocation]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [mapCenter.lat, mapCenter.lng],
      zoom: 14,
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

  // Update Map Position & Markers whenever mapCenter changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    // Smoothly fly to selected Navbar location coordinates
    map.flyTo([mapCenter.lat, mapCenter.lng], 14, { duration: 1.2 });

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

    // 1.5 Draw Demand Regions if filtered/enabled
    const activeRegions = demandRegionsDb.filter(r => 
      demandFilter === 'All' || r.demandLevel === demandFilter
    );

    activeRegions.forEach((region: any) => {
      const regionColor = region.demandLevel === 'High' ? '#EF4444' : region.demandLevel === 'Medium' ? '#F59E0B' : '#3B82F6';
      const rLat = parseFloat(region.latitude || region.lat || 16.3067);
      const rLng = parseFloat(region.longitude || region.lng || 80.4365);
      const rRad = parseFloat(region.radiusKm || region.radius || 5);
      L.circle([rLat, rLng], {
        color: regionColor,
        fillColor: regionColor,
        fillOpacity: 0.15,
        radius: rRad * 1000,
        weight: 1.5,
        dashArray: '4, 6'
      }).addTo(layer);
    });

    // 2. Add Property/Business/Franchise Item Markers
    items.forEach((item) => {
      const itemLat = parseFloat(item.latitude);
      const itemLng = parseFloat(item.longitude);
      if (isNaN(itemLat) || isNaN(itemLng)) return;

      const title = item.title || item.name || item.brand || 'Listing';
      const price = item.priceDisplay || item.investmentDisplay || (item.price ? `₹${item.price}` : 'View Details');
      const itemCategory = item.category || item.type || type;
      const itemId = item.id;

      const markerBg = type === 'property' ? '#10B981' : type === 'business' ? '#8B5CF6' : '#F59E0B';

      const itemIcon = L.divIcon({
        className: 'custom-item-pin',
        html: `
          <div style="background-color: ${markerBg}; color: #FFFFFF; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 800; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.25); border: 2px solid #FFFFFF; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: transform 0.2s;">
            <span>${price}</span>
          </div>
        `,
        iconSize: [80, 30],
        iconAnchor: [40, 15],
      });

      const marker = L.marker([itemLat, itemLng], { icon: itemIcon }).addTo(layer);

      const popupContent = `
        <div style="width: 220px; font-family: 'Outfit', sans-serif;">
          ${item.image ? `<img src="${item.image}" style="width: 100%; height: 110px; object-fit: cover; border-radius: 10px; margin-bottom: 8px;" />` : ''}
          <div style="font-size: 10px; font-weight: 800; color: ${markerBg}; text-transform: uppercase; margin-bottom: 2px;">${itemCategory}</div>
          <div style="font-size: 13px; font-weight: 800; color: #0F172A; line-height: 1.3; margin-bottom: 4px;">${title}</div>
          <div style="font-size: 12px; font-weight: 800; color: #10B981; margin-bottom: 8px;">${price}</div>
          <button id="btn-view-${itemId}" style="width: 100%; background-color: #0F172A; color: #FFFFFF; border: none; padding: 6px 0; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer;">
            View Listing
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-view-${itemId}`);
        if (btn && onSelectItem) {
          btn.onclick = () => onSelectItem(itemId);
        }
      });
    });
  }, [items, mapCenter, type, onSelectItem, demandFilter]);

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

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([mapCenter.lat, mapCenter.lng], 14, { duration: 1 });
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
      <div style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', maxWidth: 'calc(100% - 32px)', zIndex: 500, display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
            transition: 'all 0.2s',
          }}
        >
          <FaLocationArrow style={{ animation: detectingGps ? 'spin 1s linear infinite' : 'none' }} />
          <span>{detectingGps ? 'Detecting...' : 'Live GPS'}</span>
        </button>

        {/* Demand Filter Pill Chips */}
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)', padding: '4px 6px', borderRadius: '14px', border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 800, paddingLeft: '6px', textTransform: 'uppercase' }}>Demand:</span>
          {(['All', 'High', 'Medium', 'Low'] as const).map(lvl => (
            <button
              key={lvl}
              onClick={() => setDemandFilter(lvl)}
              style={{
                border: 'none',
                backgroundColor: demandFilter === lvl ? '#0F172A' : 'transparent',
                color: demandFilter === lvl ? '#FFFFFF' : '#475569',
                fontSize: '11px',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Right Controls: Recenter, Zoom */}
      <div style={{ position: 'absolute', bottom: '20px', right: '20px', zIndex: 500, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={handleResetView}
          title="Recenter Map"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #CBD5E1',
            color: '#0F172A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            fontSize: '15px',
          }}
        >
          <FaCompressArrowsAlt />
        </button>
        <button
          onClick={() => mapInstanceRef.current?.zoomIn()}
          title="Zoom In"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px 12px 4px 4px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #CBD5E1',
            color: '#0F172A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            fontSize: '14px',
          }}
        >
          <FaPlus />
        </button>
        <button
          onClick={() => mapInstanceRef.current?.zoomOut()}
          title="Zoom Out"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '4px 4px 12px 12px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #CBD5E1',
            color: '#0F172A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            fontSize: '14px',
          }}
        >
          <FaMinus />
        </button>
      </div>
    </div>
  );
};
