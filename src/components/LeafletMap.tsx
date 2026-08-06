/**
 * LeafletMap — Interactive map with Leaflet.js + OpenStreetMap + OSRM route display
 * 100% free, no API key required.
 */
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon paths broken by bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export interface LatLng { lat: number; lng: number; }

export interface LeafletMapProps {
  center?: LatLng;
  zoom?: number;
  className?: string;
  pickup?: LatLng;
  destination?: LatLng;
  driverLocation?: LatLng;
  driverHeading?: number;
  pickupLabel?: string;
  destinationLabel?: string;
  darkMode?: boolean;
  /** OSRM geometry: array of [lng, lat] pairs */
  routeGeometry?: [number, number][];
  onMapReady?: (map: L.Map) => void;
}

const makeDriverIcon = (heading?: number) => L.divIcon({
  className: '',
  html: `<div style="
    width:42px;height:42px;border-radius:50%;
    background:#fcd502;display:flex;align-items:center;
    justify-content:center;border:3px solid #fff;
    box-shadow:0 4px 18px rgba(252,213,2,0.65);
    transform:rotate(${heading ?? 0}deg);
    transition:transform 0.5s ease;
  ">
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="#121212">
      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
    </svg>
  </div>`,
  iconSize: [42, 42],
  iconAnchor: [21, 21],
});

const pickupIcon = L.divIcon({
  className: '',
  html: `<div style="position:relative;display:flex;flex-direction:column;align-items:center;">
    <div style="width:16px;height:16px;border-radius:50%;background:#22c55e;border:3px solid #fff;box-shadow:0 2px 8px rgba(34,197,94,0.7);"></div>
    <div style="width:2px;height:10px;background:#22c55e;opacity:0.6;"></div>
  </div>`,
  iconSize: [16, 26],
  iconAnchor: [8, 8],
});

const destIcon = L.divIcon({
  className: '',
  html: `<div style="position:relative;display:flex;flex-direction:column;align-items:center;">
    <div style="width:16px;height:16px;border-radius:50%;background:#f59e0b;border:3px solid #fff;box-shadow:0 2px 8px rgba(245,158,11,0.7);"></div>
    <div style="width:2px;height:10px;background:#f59e0b;opacity:0.6;"></div>
  </div>`,
  iconSize: [16, 26],
  iconAnchor: [8, 8],
});

const DARK_TILES  = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const LIGHT_TILES = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const DARK_ATTR   = '&copy; <a href="https://carto.com">CARTO</a> &copy; <a href="https://openstreetmap.org">OSM</a>';
const LIGHT_ATTR  = '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors';

export const LeafletMap: React.FC<LeafletMapProps> = ({
  center = { lat: 12.9716, lng: 77.5946 },
  zoom = 14,
  className = 'w-full h-full',
  pickup,
  destination,
  driverLocation,
  driverHeading,
  pickupLabel = 'Pickup',
  destinationLabel = 'Destination',
  darkMode = true,
  routeGeometry,
  onMapReady,
}) => {
  const containerRef     = useRef<HTMLDivElement>(null);
  const mapRef           = useRef<L.Map | null>(null);
  const driverMarkerRef  = useRef<L.Marker | null>(null);
  const pickupMarkerRef  = useRef<L.Marker | null>(null);
  const destMarkerRef    = useRef<L.Marker | null>(null);
  const osrmRouteRef     = useRef<L.Polyline | null>(null);
  const fallbackLineRef  = useRef<L.Polyline | null>(null);
  const headingRef       = useRef<number | undefined>(driverHeading);

  // ── Init map ──
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [center.lat, center.lng],
      zoom,
      zoomControl: false,
      attributionControl: true,
    });

    L.tileLayer(darkMode ? DARK_TILES : LIGHT_TILES, {
      attribution: darkMode ? DARK_ATTR : LIGHT_ATTR,
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    mapRef.current = map;
    onMapReady?.(map);

    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // ── Pickup marker ──
  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    pickupMarkerRef.current?.remove(); pickupMarkerRef.current = null;
    if (pickup) {
      pickupMarkerRef.current = L.marker([pickup.lat, pickup.lng], { icon: pickupIcon })
        .bindTooltip(`📍 ${pickupLabel}`, { permanent: false, className: 'ridingo-tooltip' })
        .addTo(map);
    }
  }, [pickup?.lat, pickup?.lng, pickupLabel]);

  // ── Destination marker ──
  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    destMarkerRef.current?.remove(); destMarkerRef.current = null;
    if (destination) {
      destMarkerRef.current = L.marker([destination.lat, destination.lng], { icon: destIcon })
        .bindTooltip(`🏁 ${destinationLabel}`, { permanent: false, className: 'ridingo-tooltip' })
        .addTo(map);
    }
  }, [destination?.lat, destination?.lng, destinationLabel]);

  // ── OSRM route polyline (real road geometry) ──
  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    fallbackLineRef.current?.remove(); fallbackLineRef.current = null;
    osrmRouteRef.current?.remove(); osrmRouteRef.current = null;

    if (routeGeometry && routeGeometry.length > 1) {
      // OSRM returns [lng, lat], Leaflet needs [lat, lng]
      const latlngs = routeGeometry.map(([lng, lat]) => [lat, lng] as [number, number]);
      // Casing shadow (thicker, darker)
      L.polyline(latlngs, { color: '#000', weight: 8, opacity: 0.3 }).addTo(map);
      // Main route line
      osrmRouteRef.current = L.polyline(latlngs, {
        color: '#fcd502',
        weight: 5,
        opacity: 0.95,
        lineJoin: 'round',
        lineCap: 'round',
      }).addTo(map);

      // Fit bounds to route
      const bounds = L.latLngBounds(latlngs);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (pickup && destination) {
      // Fallback dashed line if no route
      fallbackLineRef.current = L.polyline(
        [[pickup.lat, pickup.lng], [destination.lat, destination.lng]],
        { color: '#fcd502', weight: 3, opacity: 0.6, dashArray: '8 6' }
      ).addTo(map);
      map.fitBounds([[pickup.lat, pickup.lng], [destination.lat, destination.lng]], { padding: [40, 40] });
    }
  }, [routeGeometry, pickup?.lat, pickup?.lng, destination?.lat, destination?.lng]);

  // ── Driver marker with heading rotation ──
  useEffect(() => {
    const map = mapRef.current; if (!map || !driverLocation) return;
    headingRef.current = driverHeading;

    if (!driverMarkerRef.current) {
      driverMarkerRef.current = L.marker(
        [driverLocation.lat, driverLocation.lng],
        { icon: makeDriverIcon(driverHeading), zIndexOffset: 1000 }
      )
        .bindTooltip('🚗 Your Chauffeur', { permanent: false })
        .addTo(map);
    } else {
      driverMarkerRef.current.setLatLng([driverLocation.lat, driverLocation.lng]);
      driverMarkerRef.current.setIcon(makeDriverIcon(driverHeading));
    }
    map.panTo([driverLocation.lat, driverLocation.lng], { animate: true, duration: 0.8 });
  }, [driverLocation?.lat, driverLocation?.lng, driverHeading]);

  return (
    <>
      <style>{`
        .ridingo-tooltip {
          background: #121212;
          border: 1px solid #fcd502;
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          border-radius: 8px;
          padding: 3px 8px;
        }
        .ridingo-tooltip::before { display: none; }
      `}</style>
      <div ref={containerRef} className={className} style={{ background: '#1e293b' }} />
    </>
  );
};