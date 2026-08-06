import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  MessageSquare,
  ShieldAlert,
  Star,
  Car,
  Clock,
  CheckCircle2,
  ChevronDown,
  Navigation,
  MapPin,
  Wifi,
  WifiOff,
  Radio,
} from 'lucide-react';
import type { DriverProfile, Booking } from '../types';
import { FEATURED_DRIVER } from '../data/mockData';
import { LeafletMap } from '../components/LeafletMap';
import type { LatLng } from '../components/LeafletMap';
import { bridgeListen } from '../lib/bridge';
import type { DriverLocationPayload } from '../lib/bridge';
import { startTraccarPolling, isTraccarConfigured } from '../lib/traccar';
import { fetchRoute } from '../lib/routing';

interface LiveTrackingViewProps {
  booking?: Booking | null;
  onOpenDriverProfile: (driver: DriverProfile) => void;
  onCancelRide?: () => void;
}

// Default coordinates: Connaught Place, New Delhi & DEL Airport
const DEFAULT_PICKUP: LatLng = { lat: 28.6315, lng: 77.2167 };
const DEFAULT_DEST: LatLng = { lat: 28.5562, lng: 77.1000 };

export const LiveTrackingView: React.FC<LiveTrackingViewProps> = ({
  booking,
  onOpenDriverProfile,
  onCancelRide,
}) => {
  const driver = booking?.driver || FEATURED_DRIVER;

  const [driverLocation, setDriverLocation] = useState<LatLng | undefined>(undefined);
  const [driverHeading, setDriverHeading] = useState<number | undefined>(45);
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [trackingSource, setTrackingSource] = useState<'traccar' | 'bridge' | 'simulated'>('simulated');
  const [lastSeen, setLastSeen] = useState<Date | null>(null);
  const [etaMins, setEtaMins] = useState(11);
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [showDetailsSheet, setShowDetailsSheet] = useState(false);
  const [routeGeometry, setRouteGeometry] = useState<[number, number][] | undefined>(undefined);
  const etaTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Pickup and destination LatLng
  const pickupLatLng: LatLng = (booking as any)?.pickupLatLng || DEFAULT_PICKUP;
  const destLatLng: LatLng = (booking as any)?.destinationLatLng || DEFAULT_DEST;

  // Fetch OSRM route line
  useEffect(() => {
    fetchRoute(pickupLatLng, destLatLng).then(r => {
      if (r?.geometry) setRouteGeometry(r.geometry);
    });
  }, [pickupLatLng.lat, pickupLatLng.lng, destLatLng.lat, destLatLng.lng]);

  // 1. Traccar Polling (if configured)
  useEffect(() => {
    if (!isTraccarConfigured()) return;
    const cleanup = startTraccarPolling((pos) => {
      setDriverLocation({ lat: pos.lat, lng: pos.lng });
      setDriverHeading(pos.heading);
      setIsLiveTracking(true);
      setTrackingSource('traccar');
      setLastSeen(new Date());
    }, 3000);
    return cleanup;
  }, []);

  // 2. BroadcastChannel bridge listener (real local GPS from Driver App)
  useEffect(() => {
    const cleanup = bridgeListen((msg) => {
      if (msg.sentFrom !== 'driver-app') return;

      if (msg.type === 'DRIVER_LOCATION') {
        const loc = msg.payload as DriverLocationPayload;
        setDriverLocation({ lat: loc.lat, lng: loc.lng });
        if (loc.heading !== undefined) setDriverHeading(loc.heading);
        setIsLiveTracking(true);
        setTrackingSource('bridge');
        setLastSeen(new Date());
      }

      if (msg.type === 'TRIP_STARTED') {
        setIsLiveTracking(true);
        if (etaTimerRef.current) clearInterval(etaTimerRef.current);
        etaTimerRef.current = setInterval(() => {
          setEtaMins(prev => Math.max(0, prev - 1));
        }, 60_000);
      }

      if (msg.type === 'TRIP_COMPLETED') {
        setIsLiveTracking(false);
        if (etaTimerRef.current) clearInterval(etaTimerRef.current);
        setEtaMins(0);
      }
    });
    return () => {
      cleanup();
      if (etaTimerRef.current) clearInterval(etaTimerRef.current);
    };
  }, []);

  // Fallback: smooth movement simulation along pickup path when no active GPS feed
  useEffect(() => {
    if (isLiveTracking) return;
    let step = 0;
    const startLat = pickupLatLng.lat - 0.005;
    const startLng = pickupLatLng.lng - 0.005;
    const interval = setInterval(() => {
      step++;
      setDriverLocation({
        lat: startLat + step * 0.0003,
        lng: startLng + step * 0.0003,
      });
      setDriverHeading(45);
    }, 2500);
    return () => clearInterval(interval);
  }, [isLiveTracking, pickupLatLng.lat, pickupLatLng.lng]);

  const mapCenter = driverLocation ?? pickupLatLng;

  return (
    <div className="relative w-full h-full min-h-[540px] overflow-hidden bg-slate-900 animate-fade-in">

      {/* ── LEAFLET MAP (full background) ── */}
      <div className="absolute inset-0 z-0">
        <LeafletMap
          center={mapCenter}
          zoom={14}
          className="w-full h-full"
          driverLocation={driverLocation}
          driverHeading={driverHeading}
          pickup={pickupLatLng}
          destination={destLatLng}
          pickupLabel={booking?.pickupLocation || 'Pickup'}
          destinationLabel={booking?.destinationLocation || 'Destination'}
          routeGeometry={routeGeometry}
          darkMode={true}
        />
      </div>

      {/* ── TOP STATUS BAR ── */}
      <div className="absolute top-3 left-3.5 right-3.5 z-20 flex items-center justify-between pointer-events-auto">
        {/* Live / Simulated indicator */}
        <div className={`px-3 py-1.5 rounded-full backdrop-blur-md border shadow-md flex items-center gap-1.5 text-[10px] font-extrabold ${
          isLiveTracking
            ? 'bg-emerald-900/80 border-emerald-700 text-emerald-300'
            : 'bg-white/90 border-slate-200 text-slate-800'
        }`}>
          {isLiveTracking ? (
            <><Wifi className="w-3 h-3" /><span>{trackingSource === 'traccar' ? 'Traccar GPS Live' : 'Bridge GPS Live'}</span><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /></>
          ) : (
            <><WifiOff className="w-3 h-3 text-slate-400" /><span>Simulated GPS Tracking</span></>
          )}
        </div>

        {/* SOS Button */}
        <button
          type="button"
          onClick={() => {
            setIsSOSActive(!isSOSActive);
            if (!isSOSActive) alert('Emergency SOS broadcasted to RIDINGO Safety Team!');
          }}
          className={`px-3 py-1.5 rounded-full font-black text-[10px] flex items-center gap-1 shadow-md transition-all cursor-pointer ${
            isSOSActive
              ? 'bg-rose-600 text-white animate-bounce'
              : 'bg-white/90 text-rose-600 hover:bg-rose-50 border border-rose-200'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>{isSOSActive ? 'SOS BROADCASTED' : 'SOS'}</span>
        </button>
      </div>

      {/* ── BOTTOM FLOATING DRIVER CARD ── */}
      <div className="absolute bottom-28 left-3.5 right-3.5 z-20 pointer-events-auto">
        <div className="bg-white rounded-[28px] p-4 shadow-2xl border border-slate-200/90 space-y-3">

          {/* ETA & Status */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#a18200]">
                {isLiveTracking ? 'Driver En Route' : 'Estimated Arrival'}
              </span>
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-1.5 mt-0.5">
                <Clock className="w-4 h-4 text-[#fcd502] fill-[#fcd502]/25 stroke-[2]" />
                {etaMins > 0 ? `${etaMins} Mins` : 'Arriving Now'}
              </h3>
              {lastSeen && (
                <p className="text-[10px] text-emerald-600 font-bold mt-0.5">
                  GPS updated {Math.round((Date.now() - lastSeen.getTime()) / 1000)}s ago
                </p>
              )}
            </div>
            <div className="text-right">
              <span className="px-3 py-1 rounded-full bg-[#121212] text-[#fcd502] text-[10px] font-black uppercase tracking-wider shadow-sm">
                {booking ? booking.vehicle.name : 'Executive Sedan'}
              </span>
              <p className="text-[10px] text-slate-400 font-bold mt-1">Confirmed Chauffeur</p>
            </div>
          </div>

          {/* Driver Profile */}
          <div className="flex items-center justify-between gap-3">
            <div
              onClick={() => onOpenDriverProfile(driver)}
              className="flex items-center gap-2.5 cursor-pointer group min-w-0 flex-1"
            >
              <div className="relative flex-shrink-0">
                <img
                  src={driver.photo}
                  alt={driver.name}
                  className="w-11 h-11 rounded-2xl object-cover border border-slate-100 shadow-md group-hover:scale-105 transition-transform"
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#fcd502] text-[#121212] flex items-center justify-center text-[8px] font-black shadow-sm">✓</span>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-[#a18200] transition-colors truncate leading-snug">
                  {driver.name}
                </h4>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 font-bold mt-0.5 whitespace-nowrap truncate">
                  <span className="flex items-center gap-0.5 text-amber-500 font-black flex-shrink-0">
                    <Star className="w-3 h-3 fill-current" /> {driver.rating}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="truncate">{driver.yearsExperience} Yrs Exp</span>
                </div>
              </div>
            </div>

            {/* Call & Chat */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <a
                href={`tel:${driver.phone}`}
                className="w-9 h-9 rounded-xl bg-[#121212] hover:bg-black text-[#fcd502] flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer"
                title="Call Driver"
              >
                <Phone className="w-4 h-4 text-[#fcd502] fill-[#fcd502]/25 stroke-[2]" />
              </a>
              <button
                type="button"
                onClick={() => alert(`Opening encrypted instant chat with ${driver.name}`)}
                className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 flex items-center justify-center border border-slate-200 shadow-xs transition-all active:scale-95 cursor-pointer"
                title="Chat Driver"
              >
                <MessageSquare className="w-4 h-4 text-slate-700 fill-slate-700/20 stroke-[2]" />
              </button>
            </div>
          </div>

          {/* Trip Details Toggle */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-extrabold text-slate-700">
            <span className="flex items-center gap-1 text-[#a18200]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#fcd502] fill-[#fcd502]/25 stroke-[2]" /> Suit Uniform Driver
            </span>
            <button
              type="button"
              onClick={() => setShowDetailsSheet(!showDetailsSheet)}
              className="flex items-center gap-1 text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              <span>{showDetailsSheet ? 'Hide Details' : 'Trip Details'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDetailsSheet ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Expandable Route Details */}
          {showDetailsSheet && (
            <div className="pt-2 space-y-2 text-xs text-slate-600 animate-fade-in border-t border-slate-100">
              <div className="flex items-start gap-2">
                <Navigation className="w-3.5 h-3.5 text-[#fcd502] mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Pickup Location</p>
                  <p className="font-extrabold text-slate-800 truncate">{booking?.pickupLocation || '742 Evergreen Terrace, Beverly Hills'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-rose-500 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Destination</p>
                  <p className="font-extrabold text-slate-800 truncate">{booking?.destinationLocation || 'LAX Airport Executive Terminal'}</p>
                </div>
              </div>
              {onCancelRide && (
                <button
                  type="button"
                  onClick={onCancelRide}
                  className="w-full py-2 mt-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-black text-xs transition-colors cursor-pointer"
                >
                  Cancel Ride
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};