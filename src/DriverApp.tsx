import React, { useState, useEffect } from 'react';
import {
  Home,
  Navigation,
  DollarSign,
  Clock,
  ShieldCheck,
  MapPin,
  User,
  Phone,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Power,
  Star,
  Search,
  Mail,
  ArrowRight,
  Sparkles,
  Zap,
  RotateCcw,
  TrendingUp,
  Shield,
  Award,
  ChevronRight,
  Flame,
  Radio,
  Bell,
  X
} from 'lucide-react';
import ridingoLogo from './assets/ridingo-logo.png';
import { MobileControlCenterStatusBar } from './components/MobileControlCenterStatusBar';
import { bridgeSend, bridgeListen } from './lib/bridge';
import type { BookingRequestPayload, BookingResponsePayload, DriverLocationPayload, TripEventPayload } from './lib/bridge';
import { traccarReportPosition } from './lib/traccar';
import { fetchRoute } from './lib/routing';
import type { Route } from './lib/routing';
import { LeafletMap } from './components/LeafletMap';
import { NavigationPanel } from './components/NavigationPanel';

export function DriverApp() {
  // Driver Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isOtpStep, setIsOtpStep] = useState<boolean>(false);
  const [driverEmail, setDriverEmail] = useState<string>('');
  const [driverPhone, setDriverPhone] = useState<string>('');
  const [driverName, setDriverName] = useState<string>('Marcus Vance');
  const [demoOtp, setDemoOtp] = useState<string>('492018');

  // Main Driver State
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'rides' | 'earnings' | 'history' | 'profile'>('rides');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<'Hourly' | 'Airport' | 'Outstation'>('Hourly');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [todayEarnings, setTodayEarnings] = useState<number>(248.50);
  const [completedTripsCount, setCompletedTripsCount] = useState<number>(5);

  // Driver Profile & Settings State
  const [preferredNav, setPreferredNav] = useState<'google_maps' | 'waze' | 'apple_maps'>('google_maps');
  const [autoAccept, setAutoAccept] = useState<boolean>(false);
  const [pickupRadius, setPickupRadius] = useState<number>(15);
  const [destinationAddress, setDestinationAddress] = useState<string>('742 Evergreen Terrace, Beverly Hills');
  const [destinationFilterEnabled, setDestinationFilterEnabled] = useState<boolean>(false);

  // Incoming Dispatch Request State — null by default, populated via BroadcastChannel from User App
  const [incomingRequest, setIncomingRequest] = useState<any | null>(null);
  const [pendingRequestId, setPendingRequestId] = useState<string | null>(null);

  const [activeTrip, setActiveTrip] = useState<any | null>(null);
  const [completedTripData, setCompletedTripData] = useState<any | null>(null);
  const [tripStep, setTripStep] = useState<'en_route' | 'arrived' | 'trip_started' | 'completed'>('en_route');
  const [requestTimer, setRequestTimer] = useState<number>(30);
  const geoWatchRef = React.useRef<number | null>(null);
  const [locationTrackingActive, setLocationTrackingActive] = useState(false);

  // Geospatial, Navigation & Traccar State
  const [driverCurrentLocation, setDriverCurrentLocation] = useState<{ lat: number; lng: number }>({ lat: 28.6289, lng: 77.2065 });
  const [driverHeading, setDriverHeading] = useState<number>(45);
  const [pickupLatLng, setPickupLatLng] = useState<{ lat: number; lng: number }>({ lat: 28.6315, lng: 77.2167 });
  const [destLatLng, setDestLatLng] = useState<{ lat: number; lng: number }>({ lat: 28.5562, lng: 77.1000 });
  const [activeRoute, setActiveRoute] = useState<Route | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState<boolean>(false);
  const [currentNavStepIndex, setCurrentNavStepIndex] = useState<number>(0);
  const [showNavPanel, setShowNavPanel] = useState<boolean>(true);

  // Fetch OSRM navigation route on trip step change
  React.useEffect(() => {
    if (!activeTrip) {
      setActiveRoute(null);
      return;
    }
    setIsLoadingRoute(true);
    setCurrentNavStepIndex(0);

    const from = (tripStep === 'en_route' || tripStep === 'arrived') ? driverCurrentLocation : pickupLatLng;
    const to   = (tripStep === 'en_route' || tripStep === 'arrived') ? pickupLatLng : destLatLng;

    fetchRoute(from, to).then((r) => {
      setActiveRoute(r);
      setIsLoadingRoute(false);
    }).catch(() => {
      setIsLoadingRoute(false);
    });
  }, [activeTrip, tripStep]);

  // Payment Request Slip Modal State
  const [showPaymentSlipModal, setShowPaymentSlipModal] = useState<boolean>(false);
  const [isPaymentCollected, setIsPaymentCollected] = useState<boolean>(false);
  const [isClosingPaymentSlip, setIsClosingPaymentSlip] = useState<boolean>(false);

  // Driver Notifications State
  const [showNotificationsModal, setShowNotificationsModal] = useState<boolean>(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(2);
  const [notificationsList, setNotificationsList] = useState([
    { id: '1', title: 'High Demand Surge Bonus ⚡', desc: 'Earn +$15.00 extra per completed trip in Beverly Hills zone until 6:00 PM.', time: '10m ago', unread: true, type: 'offer', icon: Sparkles },
    { id: '2', title: 'Vehicle Inspection Verified ✓', desc: 'Your 2024 Mercedes-Maybach commercial permit was approved for 2026.', time: '1h ago', unread: true, type: 'driver', icon: ShieldCheck },
    { id: '3', title: 'Weekly Payout Ready 💰', desc: 'Direct deposit of $1,420.50 initiated to Chase Checking ****4921.', time: '5h ago', unread: false, type: 'booking', icon: CheckCircle2 },
  ]);

  // ── BroadcastChannel: Listen for booking requests from User App ──
  useEffect(() => {
    const cleanup = bridgeListen((msg) => {
      if (msg.sentFrom !== 'user-app') return;

      if (msg.type === 'BOOKING_REQUEST') {
        const req = msg.payload as BookingRequestPayload;
        // Only show if driver is online and not on an active trip
        if (!isOnline) return;
        setPendingRequestId(req.requestId);
        setRequestTimer(30);
        setIncomingRequest({
          id: req.requestId,
          bookingNumber: req.bookingNumber,
          customerName: req.customerName,
          customerRating: req.customerRating,
          pickup: req.pickup,
          destination: req.destination,
          serviceType: req.serviceType,
          duration: req.duration,
          totalFare: req.totalFare,
          driverPayout: req.driverPayout,
          paymentMethod: req.paymentMethod,
          vehicleName: req.vehicleName,
          flightNumber: req.flightNumber,
          airlineName: req.airlineName,
          distance: '1.4 mi away',
          timeRemaining: 30,
          fromUserApp: true, // flag — this is a real request
        });
        // Add notification
        setUnreadNotificationsCount(prev => prev + 1);
        setNotificationsList(prev => [{
          id: req.requestId,
          title: '🚗 New Ride Request!',
          desc: `${req.customerName} needs a ride from ${req.pickup.substring(0, 30)}...`,
          time: 'just now',
          unread: true,
          type: 'booking',
          icon: Radio,
        }, ...prev]);
      }

      if (msg.type === 'BOOKING_CANCELLED') {
        const p = msg.payload as { requestId: string };
        // Dismiss if this is the active incoming request
        setIncomingRequest((prev: any) => {
          if (prev?.bookingNumber === p.requestId || prev?.id === p.requestId) return null;
          return prev;
        });
        setPendingRequestId(null);
      }
    });
    return cleanup;
  }, [isOnline]);

  // ── Request timer countdown ──
  useEffect(() => {
    if (!incomingRequest) return;
    if (requestTimer <= 0) {
      // Auto-decline when timer hits 0
      setIncomingRequest(null);
      setPendingRequestId(null);
      return;
    }
    const t = setTimeout(() => setRequestTimer(prev => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [requestTimer, incomingRequest]);

  const handleClosePaymentSlipModal = () => {
    setIsClosingPaymentSlip(true);
    setTimeout(() => {
      setShowPaymentSlipModal(false);
      setIsClosingPaymentSlip(false);
      setActiveTrip(null);
      setTripStep('en_route');
    }, 280);
  };

  // Incoming request stays active until accepted or declined by driver

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticated(true);
  };

  const handleVerifyOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsAuthenticated(true);
  };

  const handleAcceptRequest = () => {
    if (!incomingRequest) return;
    // If this came from real User App, broadcast acceptance back
    if (incomingRequest.fromUserApp) {
      const response: BookingResponsePayload = {
        requestId: incomingRequest.id,
        bookingNumber: incomingRequest.bookingNumber || incomingRequest.id,
        driverName: driverName,
        driverRating: 4.96,
        driverPhone: '+1 (555) 382-9102',
        estimatedArrival: '8 minutes',
        status: 'accepted',
      };
      bridgeSend('BOOKING_ACCEPTED', response, 'driver-app');
    }
    setActiveTrip(incomingRequest);
    setIncomingRequest(null);
    setPendingRequestId(null);
    setTripStep('en_route');
  };

  const handleDeclineRequest = () => {
    if (incomingRequest?.fromUserApp) {
      const response: BookingResponsePayload = {
        requestId: incomingRequest.id,
        bookingNumber: incomingRequest.bookingNumber || incomingRequest.id,
        driverName: driverName,
        driverRating: 4.96,
        driverPhone: '+1 (555) 382-9102',
        status: 'declined',
      };
      bridgeSend('BOOKING_DECLINED', response, 'driver-app');
    }
    setIncomingRequest(null);
    setPendingRequestId(null);
  };

  const handleSimulateNewRequest = () => {
    setRequestTimer(30);
    setIncomingRequest({
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: 'Sophia Loren',
      customerRating: 4.95,
      pickup: '100 Wilshire Blvd, Santa Monica',
      destination: 'The Beverly Hills Hotel, Sunset Blvd',
      serviceType: 'Outstation Luxury Drive',
      duration: '2 Hours',
      totalFare: 195.00,
      driverPayout: 156.00,
      distance: '1.8 mi away',
      timeRemaining: 30,
      fromUserApp: false,
    });
  };

  const handleCompleteTrip = () => {
    if (activeTrip) {
      // Stop GPS streaming
      stopLocationTracking();
      // Broadcast trip completed to User App
      bridgeSend('TRIP_COMPLETED', {
        bookingNumber: activeTrip.bookingNumber || activeTrip.id,
        driverName: driverName,
        timestamp: Date.now(),
      } as TripEventPayload, 'driver-app');
      setTodayEarnings((prev) => prev + activeTrip.driverPayout);
      setCompletedTripsCount((prev) => prev + 1);
      setCompletedTripData(activeTrip);
      setTripStep('completed');
      setIsPaymentCollected(false);
      setShowPaymentSlipModal(true);
    }
  };

  // ── GPS Location Tracking ──
  const startLocationTracking = (bookingNumber: string) => {
    if (!navigator.geolocation) return;
    // Clear any existing watcher
    if (geoWatchRef.current !== null) navigator.geolocation.clearWatch(geoWatchRef.current);

    geoWatchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const payload: DriverLocationPayload = {
          bookingNumber,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          heading: pos.coords.heading ?? undefined,
          speed: pos.coords.speed ? pos.coords.speed * 3.6 : undefined, // m/s → km/h
          accuracy: pos.coords.accuracy,
          timestamp: Date.now(),
        };
        // Update driver state
        setDriverCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        if (pos.coords.heading) setDriverHeading(pos.coords.heading);

        // 1. Broadcast via local BroadcastChannel bridge
        bridgeSend('DRIVER_LOCATION', payload, 'driver-app');

        // 2. Report to Traccar server (OsmAnd protocol)
        traccarReportPosition(
          pos.coords.latitude,
          pos.coords.longitude,
          pos.coords.accuracy,
          pos.coords.speed ?? undefined,
          pos.coords.heading ?? undefined
        );
      },
      (err) => console.warn('[GPS] Error:', err.message),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
    setLocationTrackingActive(true);
  };

  const stopLocationTracking = () => {
    if (geoWatchRef.current !== null) {
      navigator.geolocation.clearWatch(geoWatchRef.current);
      geoWatchRef.current = null;
    }
    setLocationTrackingActive(false);
  };

  // Cleanup GPS on unmount
  React.useEffect(() => () => stopLocationTracking(), []);

  const navTabs = [
    { id: 'rides' as const, label: 'Home', icon: Home },
    { id: 'earnings' as const, label: 'Earnings', icon: DollarSign },
    { id: 'history' as const, label: 'History', icon: Clock },
    { id: 'profile' as const, label: 'Account', icon: User },
  ];

  return (
    <div className="min-h-screen h-screen w-full bg-slate-950 flex items-center justify-center selection:bg-[#fcd502] selection:text-black overflow-hidden p-0 md:p-3 font-sans">
      {/* Ultra-Modern iPhone 16 Pro Mobile Container with Frame Bezel */}
      <div className="w-full max-w-[420px] h-full md:h-[90vh] md:max-h-[880px] md:rounded-[48px] bg-[#FAFAFA] text-[#0F172A] flex flex-col relative shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] border-x md:border-[8px] border-slate-900 overflow-hidden ring-1 ring-slate-800/90">

        {/* Sticky Mobile Status Bar with Dynamic Island */}
        <MobileControlCenterStatusBar />

        {/* AUTHENTICATION & LOGIN SCREEN */}
        {!isAuthenticated ? (
          <div className="w-full h-full overflow-y-auto bg-white p-6 flex flex-col justify-between pt-3 pb-5 space-y-6">
            <div className="space-y-6 my-auto max-w-sm mx-auto w-full">
              <div className="flex items-center justify-between w-full pb-1">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Driver Portal</span>
                <button
                  type="button"
                  onClick={() => setIsAuthenticated(true)}
                  className="px-4 py-1.5 rounded-full bg-[#fcd502] hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer border border-amber-300"
                >
                  <span>Skip Login</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>

              <div className="text-center space-y-3">
                <img
                  src={ridingoLogo}
                  alt="RIDINGO Driver"
                  className="h-16 w-auto object-contain mx-auto drop-shadow-xs"
                />
                <div className="inline-flex items-center gap-1.5 bg-[#fcd502]/20 border border-[#fcd502]/60 px-3.5 py-1 rounded-full text-[#a18200] font-bold text-xs uppercase tracking-widest">
                  <ShieldCheck className="w-4 h-4 text-[#a18200]" />
                  <span>Driver Partner Portal</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight pt-1">Driver Partner Sign In</h1>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">Enter your registered credentials to start accepting rides</p>
              </div>

              {!isOtpStep ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        required
                        value={driverEmail}
                        onChange={(e) => setDriverEmail(e.target.value)}
                        placeholder="marcus.vance@ridingo.com"
                        className="w-full py-3 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#fcd502] focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Mobile Number</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="tel"
                        required
                        value={driverPhone}
                        onChange={(e) => setDriverPhone(e.target.value)}
                        placeholder="+1 (555) 019-2834"
                        className="w-full py-3 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#fcd502] focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-[#fcd502] hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95 cursor-pointer"
                  >
                    <span>Sign In (Skip OTP)</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAuthenticated(true)}
                    className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-200"
                  >
                    <span>⚡ Skip Login & Enter Driver App</span>
                  </button>
                </form>
              ) : (
                /* Demo Mode OTP verification step */
                <form onSubmit={handleVerifyOtp} className="space-y-4 animate-fade-in">
                  <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-center space-y-2.5 shadow-xs">
                    <div className="flex items-center justify-center gap-1.5 font-bold text-amber-700 text-xs tracking-wider uppercase">
                      <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span>Demo Driver Mode Active</span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium">
                      Your generated Demo OTP code is below. Any 6-digit code will sign you in:
                    </p>
                    <div className="font-mono text-2xl font-extrabold text-slate-900 tracking-widest bg-white px-4 py-1.5 rounded-2xl border border-amber-200 shadow-inner inline-block">
                      {demoOtp}
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAuthenticated(true)}
                      className="w-full py-3 px-4 rounded-2xl bg-[#fcd502] hover:bg-amber-400 text-[#121212] font-black text-xs uppercase tracking-wider shadow-md transition-transform active:scale-95 cursor-pointer block"
                    >
                      ⚡ One-Tap Auto-Fill & Sign In
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-2 py-1">
                    {[0, 1, 2, 3, 4, 5].map((idx) => (
                      <input
                        key={idx}
                        type="text"
                        maxLength={1}
                        value={demoOtp[idx] || ''}
                        readOnly
                        className="w-11 h-12 text-center text-lg font-bold rounded-2xl border-2 border-slate-200 bg-slate-50 text-slate-900 focus:outline-none"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-[#121212] hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider shadow-lg transition-transform active:scale-95 cursor-pointer"
                  >
                    Verify & Enter Driver App
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsOtpStep(false)}
                    className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer py-1"
                  >
                    ← Change Driver Credentials
                  </button>
                </form>
              )}
            </div>

            <div className="text-center text-[10px] text-slate-400 font-medium space-y-1">
              <p>RIDINGO Chauffeur Partner Network v2.5</p>
              <p>256-bit Encrypted Security & Verified Background Checks</p>
            </div>
          </div>
        ) : (
          /* MAIN ULTRA-MODERN DRIVER APP PORTAL */
          <div className="w-full h-full flex flex-col bg-[#FAFAFA] text-slate-900 overflow-hidden relative">

            {/* Clean Professional Header Bar */}
            <header className="shrink-0 sticky top-0 z-40 w-full px-4 sm:px-5 pt-2 pb-3 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
                <div className="flex items-center gap-2">
                  <img
                    src={ridingoLogo}
                    alt="RIDINGO"
                    className="h-8 w-auto object-contain"
                  />
                  <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                    DRIVER
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Online / Offline Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => setIsOnline(!isOnline)}
                    className={`px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${isOnline
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                  >
                    <Power className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
                  </button>

                  {/* Notification Bell Icon Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowNotificationsModal(true);
                      setUnreadNotificationsCount(0);
                    }}
                    className="relative p-2 rounded-full bg-slate-100/90 text-slate-700 hover:bg-slate-200/90 active:scale-95 transition-all cursor-pointer shadow-2xs"
                    aria-label="Notifications"
                    title="Driver Notifications"
                  >
                    <Bell className="w-4 h-4 text-slate-800 fill-slate-800/25 stroke-[2]" />
                    {unreadNotificationsCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#fcd502] text-slate-950 text-[9px] font-black flex items-center justify-center border border-white shadow-xs animate-pulse">
                        {unreadNotificationsCount}
                      </span>
                    )}
                  </button>

                  {/* Profile Avatar Icon Button */}
                  <button
                    type="button"
                    onClick={() => setActiveTab('profile')}
                    className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-xs hover:ring-2 hover:ring-[#fcd502] active:scale-95 transition-all flex-shrink-0 cursor-pointer"
                    title="Driver Profile"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80"
                      alt={driverName}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </button>
                </div>
              </div>
            </header>

            {/* Scrollable Main Content Body */}
            <div className="flex-1 overflow-y-auto px-4 pt-3.5 pb-24 space-y-4 scrollbar-none">

              {/* TAB 1: RIDES & DISPATCH (HOME TAB) */}
              {activeTab === 'rides' && (
                <div className="space-y-4">

                  {/* Greeting Section (Only on Home tab as requested) */}
                  <div className="bg-white p-4.5 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-[26px] sm:text-[28px] font-medium text-slate-900 leading-[1.15] tracking-tight">
                          <span className="block">Good</span>
                          <span className="block">afternoon, {driverName.split(' ')[0]} 💪</span>
                        </h1>
                        <p className="text-xs text-slate-500 font-semibold pt-1 flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span>4.96 Rating</span>
                          <span>•</span>
                          <span>2024 Mercedes-Maybach S-Class</span>
                        </p>
                      </div>
                    </div>

                    {/* 3 Quick Driver Stats Cards */}
                    {isOnline && (
                      <div className="grid grid-cols-3 gap-2.5 pt-1">
                        <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-2xl text-center space-y-0.5 shadow-2xs">
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Today's Pay</span>
                          <span className="text-base font-black text-slate-900">${todayEarnings.toFixed(2)}</span>
                          <span className="text-[9px] font-bold text-emerald-600 flex items-center justify-center gap-0.5">
                            <TrendingUp className="w-2.5 h-2.5" /> +14.2%
                          </span>
                        </div>
                        <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-2xl text-center space-y-0.5 shadow-2xs">
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed</span>
                          <span className="text-base font-black text-slate-900">{completedTripsCount} Rides</span>
                          <span className="text-[9px] font-bold text-slate-500">100% Accept</span>
                        </div>
                        <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-2xl text-center space-y-0.5 shadow-2xs">
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rating</span>
                          <span className="text-base font-black text-amber-500 flex items-center justify-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> 4.96
                          </span>
                          <span className="text-[9px] font-bold text-amber-700">Top 1% Driver</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Offline Card */}
                  {!isOnline && (
                    <div className="p-6 rounded-3xl bg-white border border-slate-200 text-center space-y-3 shadow-xs">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <Power className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-slate-900">You Are Offline</h3>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                          Switch to Online status in the header bar above to accept new ride requests.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsOnline(true)}
                        className="py-3 px-6 rounded-2xl bg-[#fcd502] hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer"
                      >
                        Go Online Now
                      </button>
                    </div>
                  )}

                  {/* Online & Ready — Idle Waiting State */}
                  {isOnline && !incomingRequest && !activeTrip && (
                    <div className="p-5 rounded-3xl bg-white border border-slate-200 text-center space-y-3 shadow-xs">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                        <Radio className="w-6 h-6 animate-pulse" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-slate-900">Waiting for Ride Requests</h3>
                        <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                          Open the <span className="font-bold text-slate-800">User App</span> in another browser tab, book a ride, and it will appear here instantly.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <div className="flex-1 h-px bg-slate-100" />
                        <span className="text-[10px] text-slate-400 font-medium">or test locally</span>
                        <div className="flex-1 h-px bg-slate-100" />
                      </div>
                      <button
                        type="button"
                        onClick={handleSimulateNewRequest}
                        className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Simulate Demo Request
                      </button>
                    </div>
                  )}


                  {incomingRequest && !activeTrip && (
                    <div className={`bg-white border rounded-3xl p-5 shadow-lg space-y-4 font-sans animate-drop-up ${incomingRequest.fromUserApp ? 'border-[#fcd502] ring-2 ring-[#fcd502]/30 shadow-[#fcd502]/20' : 'border-slate-200/90'}`}>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Incoming Dispatch</span>
                            {incomingRequest.fromUserApp && (
                              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block" />
                                LIVE
                              </span>
                            )}
                          </div>
                          <h3 className="font-black text-lg text-slate-900">{incomingRequest.customerName}</h3>
                          <p className="text-xs text-slate-500 font-medium">★ {incomingRequest.customerRating} • {incomingRequest.serviceType}</p>
                          {incomingRequest.vehicleName && (
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">🚗 {incomingRequest.vehicleName}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-black text-slate-900 block">${incomingRequest.driverPayout.toFixed(2)}</span>
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-block">Net Payout</span>
                          {/* Countdown timer */}
                          <div className={`mt-1.5 text-[11px] font-black tabular-nums ${requestTimer <= 10 ? 'text-rose-600' : 'text-slate-500'}`}>
                            ⏱ {requestTimer}s
                          </div>
                        </div>
                      </div>

                      {/* Route Pickup / Dropoff Timeline */}
                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-3 text-xs">
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col items-center pt-1">
                            <div className="w-3 h-3 rounded-full bg-emerald-500" />
                            <div className="w-0.5 h-6 bg-slate-300 my-0.5" />
                            <div className="w-3 h-3 rounded-full bg-amber-500" />
                          </div>
                          <div className="flex-1 space-y-3">
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase block">Pickup ({incomingRequest.distance})</span>
                              <span className="font-bold text-slate-900 block">{incomingRequest.pickup}</span>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase block">Dropoff</span>
                              <span className="font-bold text-slate-900 block">{incomingRequest.destination}</span>
                            </div>
                          </div>
                        </div>
                        {/* Flight info if airport transfer */}
                        {incomingRequest.flightNumber && (
                          <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2 text-[11px]">
                            <span className="text-slate-400 font-medium">✈️ Flight:</span>
                            <span className="font-bold text-slate-900">{incomingRequest.flightNumber}</span>
                            {incomingRequest.airlineName && <span className="text-slate-500">({incomingRequest.airlineName})</span>}
                          </div>
                        )}
                        {/* Duration & fare */}
                        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-medium">Duration: <span className="text-slate-900 font-bold">{incomingRequest.duration}</span></span>
                          <span className="text-slate-500 font-medium">Total: <span className="text-slate-900 font-bold">${incomingRequest.totalFare?.toFixed(2)}</span></span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleDeclineRequest}
                          className="py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer border border-slate-200"
                        >
                          Decline
                        </button>
                        <button
                          type="button"
                          onClick={handleAcceptRequest}
                          className="col-span-2 py-3.5 rounded-2xl bg-[#fcd502] hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer"
                        >
                          Accept Ride Request
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Clean Professional Active Ride Progress Card */}
                  {activeTrip && (
                    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-lg space-y-4 font-sans animate-drop-up">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Active Trip</span>
                          <h3 className="font-black text-lg text-slate-900">{activeTrip.customerName}</h3>
                        </div>
                        <span className="text-xl font-black text-slate-900 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-2xl border border-emerald-200">
                          ${activeTrip.driverPayout.toFixed(2)}
                        </span>
                      </div>

                      {/* Passenger Contact Actions */}
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => alert(`Calling Customer ${activeTrip.customerName}...`)}
                          className="py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-900 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Call</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => alert(`Opening chat with ${activeTrip.customerName}...`)}
                          className="py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-900 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                          <span>Chat</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowNavPanel(!showNavPanel)}
                          className="py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-900 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Navigation className="w-3.5 h-3.5 text-blue-600" />
                          <span>{showNavPanel ? 'Hide Nav' : 'Show Nav'}</span>
                        </button>
                      </div>

                      {/* Live Leaflet Driver Map View */}
                      <div className="w-full h-56 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-md relative">
                        <LeafletMap
                          center={driverCurrentLocation}
                          zoom={15}
                          className="w-full h-full"
                          driverLocation={driverCurrentLocation}
                          driverHeading={driverHeading}
                          pickup={pickupLatLng}
                          destination={destLatLng}
                          pickupLabel={activeTrip.pickup}
                          destinationLabel={activeTrip.destination}
                          routeGeometry={activeRoute?.geometry}
                          darkMode={true}
                        />
                      </div>

                      {/* Turn-by-Turn Navigation Panel for Driver */}
                      {showNavPanel && (
                        <NavigationPanel
                          route={activeRoute}
                          isLoading={isLoadingRoute}
                          pickup={activeTrip.pickup}
                          destination={activeTrip.destination}
                          currentStepIndex={currentNavStepIndex}
                          onClose={() => setShowNavPanel(false)}
                          onNextStep={() => setCurrentNavStepIndex((prev) => (activeRoute ? Math.min(prev + 1, activeRoute.steps.length - 1) : prev))}
                        />
                      )}

                      {/* Route Timeline */}
                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-3 text-xs">
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col items-center pt-1">
                            <div className="w-3 h-3 rounded-full bg-emerald-500" />
                            <div className="w-0.5 h-6 bg-slate-300 my-0.5" />
                            <div className="w-3 h-3 rounded-full bg-amber-500" />
                          </div>
                          <div className="flex-1 space-y-3">
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase block">Pickup Location</span>
                              <span className="font-bold text-slate-900 block">{activeTrip.pickup}</span>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase block">Destination</span>
                              <span className="font-bold text-slate-900 block">{activeTrip.destination}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Primary Step Action Button */}
                      <div className="pt-1">
                        {tripStep === 'en_route' && (
                          <button
                            type="button"
                            onClick={() => setTripStep('arrived')}
                            className="w-full py-4 px-5 rounded-2xl bg-[#fcd502] hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider text-center shadow-md cursor-pointer transition-all active:scale-95"
                          >
                            Arrived at Pickup Location
                          </button>
                        )}

                        {tripStep === 'arrived' && (
                          <button
                            type="button"
                            onClick={() => {
                              setTripStep('trip_started');
                              // Start GPS broadcast to User App
                              bridgeSend('TRIP_STARTED', {
                                bookingNumber: activeTrip.bookingNumber || activeTrip.id,
                                driverName: driverName,
                                timestamp: Date.now(),
                              } as TripEventPayload, 'driver-app');
                              startLocationTracking(activeTrip.bookingNumber || activeTrip.id);
                            }}
                            className="w-full py-4 px-5 rounded-2xl bg-[#fcd502] hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider text-center shadow-md cursor-pointer transition-all active:scale-95"
                          >
                            Start Ride Meter
                          </button>
                        )}
                        {/* Live GPS indicator when trip is running */}
                        {tripStep === 'trip_started' && locationTrackingActive && (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 self-start">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-emerald-700">GPS Live — Streaming Location</span>
                          </div>
                        )}

                        {tripStep === 'trip_started' && (
                          <button
                            type="button"
                            onClick={handleCompleteTrip}
                            className="w-full py-4 px-5 rounded-2xl bg-[#fcd502] hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider text-center shadow-md cursor-pointer transition-all active:scale-95"
                          >
                            Complete Ride & Collect ${activeTrip.driverPayout.toFixed(2)}
                          </button>
                        )}

                        {tripStep === 'completed' && (
                          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                            <h4 className="font-bold text-sm text-slate-900">Trip Completed Successfully!</h4>
                            <p className="text-xs text-slate-500 font-medium">
                              ${activeTrip.driverPayout.toFixed(2)} added to your Driver Balance.
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTrip(null);
                                setTripStep('en_route');
                              }}
                              className="py-2.5 px-6 rounded-xl bg-[#fcd502] hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer mt-2 shadow-xs"
                            >
                              Ready for Next Ride
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* TAB 2: EARNINGS & CASHOUT */}
              {activeTab === 'earnings' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Available Driver Balance</span>
                        <h3 className="text-3xl font-black text-slate-900">${todayEarnings.toFixed(2)}</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => alert(`Initiating instant payout of $${todayEarnings.toFixed(2)} to Chase Bank ****4921`)}
                        className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider shadow-md cursor-pointer"
                      >
                        Instant Cashout
                      </button>
                    </div>

                    <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span>Weekly Goal: $1,200.00</span>
                      <span className="text-emerald-600 font-bold">82% Completed</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3">
                    <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">Recent Ride Payouts</h4>
                    <div className="space-y-2 text-xs">
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900 block">Beverly Hills ➔ LAX Airport</span>
                          <span className="text-[10px] text-slate-500 font-medium">4 Hours • Executive SUV</span>
                        </div>
                        <span className="font-bold text-emerald-600 text-sm">+$112.00</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900 block">Santa Monica ➔ Sunset Blvd</span>
                          <span className="text-[10px] text-slate-500 font-medium">2 Hours • Maybach Chauffeur</span>
                        </div>
                        <span className="font-bold text-emerald-600 text-sm">+$136.50</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: TRIP HISTORY */}
              {activeTab === 'history' && (
                <div className="space-y-3 animate-fade-in text-xs">
                  <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider px-1">Completed Chauffeur Trips</h4>
                  {[
                    { customer: 'Alexander Vance', date: 'Today, 2:30 PM', fare: '$112.00', status: 'Completed', rating: '5.0 ★' },
                    { customer: 'Lady Eleanor Vance', date: 'Yesterday, 6:15 PM', fare: '$180.00', status: 'Completed', rating: '5.0 ★' },
                    { customer: 'David Miller', date: '08/03/2026', fare: '$95.00', status: 'Completed', rating: '4.9 ★' },
                  ].map((item, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 block">{item.customer}</span>
                        <span className="text-[10px] text-slate-500 font-medium">{item.date} • {item.rating}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-slate-900 text-sm block">{item.fare}</span>
                        <span className="text-[9px] font-bold text-emerald-600 uppercase">{item.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 4: DRIVER PROFILE & ACCOUNT */}
              {activeTab === 'profile' && (
                <div className="space-y-4 animate-fade-in text-xs pb-6">

                  {/* 1. DRIVER CARD */}
                  <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img
                          src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80"
                          alt={driverName}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-[#fcd502] shadow-sm"
                        />
                        <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">✓</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-base text-slate-900 truncate">{driverName}</h3>
                        </div>
                        <p className="text-xs text-slate-500 font-medium pt-0.5">Senior Executive Chauffeur</p>
                        <div className="flex items-center gap-1.5 mt-1 text-[10px] text-emerald-600 font-semibold">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Verified Commercial Chauffeur</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-slate-600 font-medium">
                      <div className="flex items-center gap-1.5 truncate">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>+1 (555) 234-5678</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>marcus.v@ridingo.com</span>
                      </div>
                    </div>
                  </div>

                  {/* 2. ASSIGNED FLEET VEHICLE CARD */}
                  <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Fleet Vehicle</span>
                      <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Active & Insured</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">2024 Mercedes-Maybach S-Class</h4>
                        <p className="text-xs text-slate-500 font-medium">Black • Luxury First Class Chauffeur</p>
                      </div>
                      <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-900 font-mono font-black text-xs border border-slate-200">
                        CA 7XYZ99
                      </span>
                    </div>
                  </div>

                  {/* 3. APP & DISPATCH PREFERENCES */}
                  <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Preferences</span>

                    {/* Navigation App Engine Selection */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-800 block">Preferred Navigation Map Engine</label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setPreferredNav('google_maps')}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${preferredNav === 'google_maps'
                              ? 'bg-[#fcd502] text-slate-950 border-[#fcd502] font-black shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                          Google Maps
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreferredNav('waze')}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${preferredNav === 'waze'
                              ? 'bg-[#fcd502] text-slate-950 border-[#fcd502] font-black shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                          Waze
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreferredNav('apple_maps')}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${preferredNav === 'apple_maps'
                              ? 'bg-[#fcd502] text-slate-950 border-[#fcd502] font-black shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                          Apple Maps
                        </button>
                      </div>
                    </div>

                    {/* Auto-Accept Toggle */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div>
                        <span className="font-bold text-slate-900 block">Auto-Accept Incoming Requests</span>
                        <span className="text-[10px] text-slate-500">Automatically confirm back-to-back rides</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAutoAccept(!autoAccept)}
                        className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${autoAccept ? 'bg-[#fcd502]' : 'bg-slate-300'
                          }`}
                      >
                        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-xs ${autoAccept ? 'right-0.5' : 'left-0.5'
                          }`} />
                      </button>
                    </div>

                    {/* Max Pickup Radius Slider */}
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">Maximum Pickup Radius</span>
                        <span className="font-black text-slate-950 bg-[#fcd502] px-2 py-0.5 rounded-full text-xs">
                          {pickupRadius} miles
                        </span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="35"
                        step="5"
                        value={pickupRadius}
                        onChange={(e) => setPickupRadius(Number(e.target.value))}
                        className="w-full accent-[#fcd502] cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* 4. BANKING & SUPPORT */}
                  <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Banking & Support</span>
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                          CHASE
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">Chase Checking ****4921</h4>
                          <p className="text-[10px] text-slate-500 font-medium">Direct Deposit • Instant Cashout Enabled</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => alert('Payout method edit modal opening...')}
                        className="text-xs font-bold text-amber-700 hover:text-amber-800 cursor-pointer"
                      >
                        Manage
                      </button>
                    </div>
                  </div>

                  {/* 5. LOG OUT BUTTON */}
                  <button
                    type="button"
                    onClick={() => setIsAuthenticated(false)}
                    className="w-full p-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-extrabold text-xs text-center cursor-pointer transition-colors shadow-xs"
                  >
                    Log Out of Driver App
                  </button>
                </div>
              )}

            </div>

            {/* FLOATING BOTTOM NAVIGATION PILL (MATCHING FloatingNav.tsx 1:1) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-sm pointer-events-auto transition-all duration-300">
              <nav className="glass-floating-dark rounded-full p-2 flex items-center justify-between shadow-2xl border border-slate-800/90 backdrop-blur-2xl bg-[#121212]/95 ring-1 ring-white/10">
                {navTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative flex items-center justify-center gap-2 py-3 px-4 rounded-full transition-all duration-300 cursor-pointer ${isActive
                          ? 'bg-[#fcd502] text-[#121212] shadow-lg shadow-[#fcd502]/20 font-black flex-1'
                          : 'text-slate-400 hover:text-white font-bold hover:bg-slate-800/60'
                        }`}
                      aria-label={tab.label}
                    >
                      <Icon className={`w-5 h-5 transition-all duration-300 ${isActive ? 'scale-110 text-[#121212] fill-[#121212]/20 stroke-[2.5]' : 'text-slate-400 stroke-[2]'
                        }`} />

                      {isActive && (
                        <span className="text-xs font-black tracking-tight whitespace-nowrap text-[#121212]">
                          {tab.label}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* PAYMENT REQUEST SLIP POPUP MODAL WITH SMOOTH ANIMATION */}
            {showPaymentSlipModal && (activeTrip || completedTripData) && (
              <div className={`absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300 ${isClosingPaymentSlip ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}>
                <div className={`bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 text-slate-900 space-y-4 relative overflow-hidden font-sans transition-all duration-300 transform ${isClosingPaymentSlip ? 'scale-95 translate-y-4 opacity-0' : 'scale-100 translate-y-0 opacity-100 animate-drop-up'
                  }`}>

                  {/* Decorative Slip Header Ticket Accent */}
                  <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-[#fcd502] to-amber-500" />

                  {/* Slip Title Bar */}
                  <div className="flex items-center justify-between pt-1 border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-black tracking-widest text-[#a18200] uppercase block">Ridingo Chauffeur</span>
                      <h3 className="font-extrabold text-base text-slate-900">Payment Request Slip</h3>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                      #SLIP-8841
                    </span>
                  </div>

                  {/* Passenger & Trip Summary */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Passenger</span>
                      <span className="font-bold text-slate-900">{(activeTrip || completedTripData)?.customerName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Service</span>
                      <span className="font-bold text-slate-900">{(activeTrip || completedTripData)?.serviceType}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span className="text-slate-500 font-medium">Date & Time</span>
                      <span className="font-semibold text-slate-700">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  {/* Fare Breakdown Details */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Base Ride Fare</span>
                      <span className="font-semibold text-slate-900">${(((activeTrip || completedTripData)?.totalFare || 140) * 0.75).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Distance & Toll Charges</span>
                      <span className="font-semibold text-slate-900">${(((activeTrip || completedTripData)?.totalFare || 140) * 0.25).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200 font-extrabold text-sm">
                      <span className="text-slate-900">Total Fare Due</span>
                      <span className="text-xl font-black text-slate-900">${((activeTrip || completedTripData)?.totalFare || 140).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl font-bold border border-emerald-200">
                      <span>Net Driver Payout</span>
                      <span>${((activeTrip || completedTripData)?.driverPayout || 112).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* QR Code Section */}
                  <div className="bg-amber-500/10 border border-amber-200 text-slate-900 p-4 rounded-2xl text-center space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Scan QR Code</span>
                      <span className="text-[10px] font-mono text-slate-500">UPI / Card / GPay</span>
                    </div>

                    {/* QR Code Graphic Container */}
                    <div className="bg-white p-3 rounded-2xl inline-block shadow-md border-2 border-[#fcd502]">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=ridingo@upi%26pn=RidingoChauffeur%26am=${(activeTrip || completedTripData)?.totalFare || 140}%26cu=USD`}
                        alt="Payment QR Code"
                        className="w-36 h-36 mx-auto object-contain"
                      />
                    </div>

                    <p className="text-[10px] text-slate-600 font-medium">
                      Scan via GPay, PhonePe, Apple Pay, or Mobile Banking to pay immediately.
                    </p>
                  </div>

                  {/* Payment Status & Action Buttons */}
                  <div className="space-y-2 pt-1">
                    {!isPaymentCollected ? (
                      <button
                        type="button"
                        onClick={() => {
                          setIsPaymentCollected(true);
                          setTimeout(() => {
                            handleClosePaymentSlipModal();
                          }, 1000);
                        }}
                        className="w-full py-3.5 rounded-2xl bg-[#fcd502] hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer text-center"
                      >
                        Mark Payment Collected (${((activeTrip || completedTripData)?.totalFare || 140).toFixed(2)})
                      </button>
                    ) : (
                      <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center font-bold text-xs flex items-center justify-center gap-2 animate-fade-in">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Payment Verified & Collected! Closing...</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => alert('Sending digital receipt to customer email & SMS...')}
                        className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200"
                      >
                        <span>📧 Receipt</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleClosePaymentSlipModal}
                        className="py-2.5 px-3 rounded-xl bg-[#fcd502] hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-transform"
                      >
                        <span>Done & Close</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DRIVER NOTIFICATIONS SLIDE DRAWER (MATCHING USER APP NOTIFICATION UI STYLE 1:1) */}
            {showNotificationsModal && (
              <div className="absolute inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in">
                {/* Backdrop overlay */}
                <div
                  className="absolute inset-0"
                  onClick={() => setShowNotificationsModal(false)}
                />

                {/* Right Slide Panel Container matching App.tsx */}
                <div className="relative w-[340px] max-w-full h-full bg-[#FAFAFA] shadow-2xl flex flex-col z-10 animate-slide-left border-l border-slate-200/80 font-sans">
                  {/* Minimal Single-Line Drawer Top Header matching App.tsx */}
                  <div className="px-4 pt-7 pb-3 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm shrink-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">Notifications</h3>
                      {notificationsList.filter(n => n.unread).length > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-[#fcd502] text-[#121212] text-[10px] font-black">
                          {notificationsList.filter(n => n.unread).length}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setNotificationsList(notificationsList.map(n => ({ ...n, unread: false })));
                        setUnreadNotificationsCount(0);
                      }}
                      className="text-[11px] font-extrabold text-[#a18200] hover:underline whitespace-nowrap cursor-pointer"
                    >
                      Mark all read
                    </button>
                  </div>

                  {/* Scrollable Notification Cards List matching NotificationsView.tsx */}
                  <div className="flex-1 overflow-y-auto p-3.5 space-y-3 scrollbar-none relative">
                    {notificationsList.map((item) => {
                      const Icon = item.icon || Bell;

                      return (
                        <div
                          key={item.id}
                          className={`glass-card rounded-3xl p-4 border transition-all flex items-start gap-3.5 ${!item.unread
                              ? 'bg-white/80 border-slate-200/70 text-slate-700 opacity-90'
                              : 'bg-white border-[#fcd502] text-slate-900 shadow-md ring-1 ring-[#fcd502]/30'
                            }`}
                        >
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${item.type === 'driver' ? 'bg-[#121212] text-[#fcd502]' :
                              item.type === 'booking' ? 'bg-emerald-500/10 text-emerald-600' :
                                item.type === 'offer' ? 'bg-amber-500/10 text-amber-600' :
                                  'bg-blue-500/10 text-blue-600'
                            }`}>
                            <Icon className="w-5 h-5" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-extrabold text-sm text-slate-900 truncate">{item.title}</h4>
                              <span className="text-[10px] text-slate-400 font-medium ml-2 flex-shrink-0">{item.time}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                              {item.desc}
                            </p>
                          </div>

                          {item.unread && (
                            <span className="w-2.5 h-2.5 rounded-full bg-[#fcd502] flex-shrink-0 mt-2 animate-pulse" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Thumb-Friendly Bottom Round Transparent Close Icon Button matching App.tsx */}
                  <div className="p-3 bg-transparent flex justify-center pb-6 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowNotificationsModal(false)}
                      className="w-11 h-11 rounded-full bg-slate-900/10 hover:bg-slate-900/20 backdrop-blur-md border border-slate-300/80 text-slate-800 flex items-center justify-center transition-all active:scale-90 cursor-pointer shadow-lg"
                      aria-label="Close notifications"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

export default DriverApp;
