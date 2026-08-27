import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationPickerMapProps {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
  radius?: number;
  city?: string;
  height?: string;
}

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  latitude,
  longitude,
  onChange,
  radius = 10,
  city = 'Hyderabad',
  height = '380px',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [latitude, longitude],
      zoom: 14,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 20,
    }).addTo(map);

    // Create a beautiful custom marker pin
    const pinIcon = L.divIcon({
      className: 'custom-picker-pin',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: grab; transform: translateY(-16px);">
          <div style="background-color: #2563EB; color: #FFFFFF; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 800; box-shadow: 0 4px 14px rgba(37,99,235,0.4); border: 2px solid #FFFFFF; white-space: nowrap; display: flex; align-items: center; gap: 4px;">
            📍 Drag Me
          </div>
          <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #2563EB; margin-top: -1px;"></div>
        </div>
      `,
      iconSize: [80, 42],
      iconAnchor: [40, 42],
    });

    const marker = L.marker([latitude, longitude], {
      draggable: true,
      icon: pinIcon,
    }).addTo(map);

    // Circle Overlay for Radius
    const circle = L.circle([latitude, longitude], {
      color: '#3B82F6',
      fillColor: '#3B82F6',
      fillOpacity: 0.15,
      radius: radius * 1000, // KM to meters
      dashArray: '5, 10',
    }).addTo(map);

    // Listen to dragend event
    marker.on('dragend', () => {
      const position = marker.getLatLng();
      onChange(position.lat, position.lng);
    });

    mapRef.current = map;
    markerRef.current = marker;
    circleRef.current = circle;

    // Invalidate size after mount to ensure proper loading of map tiles
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      circleRef.current = null;
    };
  }, []);

  // Update marker, circle and pan when coordinates change externally
  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    const circle = circleRef.current;

    if (map && marker && circle) {
      const newLatLng = L.latLng(latitude, longitude);
      
      // Update marker position
      if (!marker.getLatLng().equals(newLatLng)) {
        marker.setLatLng(newLatLng);
      }

      // Update circle center
      circle.setLatLng(newLatLng);
      circle.setRadius(radius * 1000);

      // Pan/fly to the new location smoothly
      map.setView(newLatLng, map.getZoom());
    }
  }, [latitude, longitude, radius]);

  return (
    <div 
      ref={mapContainerRef} 
      data-lenis-prevent="true"
      style={{ 
        width: '100%', 
        height: height, 
        borderRadius: '16px', 
        border: '1px solid #E2E8F0', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
        overflow: 'hidden',
        zIndex: 1
      }} 
    />
  );
};
