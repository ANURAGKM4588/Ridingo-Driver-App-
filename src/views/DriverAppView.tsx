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
  Award, 
  TrendingUp, 
  Car, 
  FileText, 
  AlertCircle,
  ChevronRight,
  ArrowRight,
  LogOut,
  Sparkles,
  Zap,
  RotateCcw,
  Star,
  Bell,
  X
} from 'lucide-react';
import { bridgeListen, bridgeSend } from '../lib/bridge';

interface DriverAppViewProps {
  onSwitchToCustomerApp: () => void;
}

export const DriverAppView: React.FC<DriverAppViewProps> = ({ onSwitchToCustomerApp }) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [activeDriverTab, setActiveDriverTab] = useState<'rides' | 'earnings' | 'history' | 'profile'>('rides');
  
  // Driver Live Ride Request State
  const [incomingRequest, setIncomingRequest] = useState<any | null>({
    id: 'REQ-8841',
    customerName: 'Alexander Vance',
    customerRating: 4.95,
    pickup: '742 Evergreen Terrace, Beverly Hills',
    destination: 'LAX Airport Terminal 4',
    serviceType: 'Executive Hourly Chauffeur',
    duration: '4 Hours',
    totalFare: 140.00,
    driverPayout: 112.00,
    distance: '3.2 miles away',
    timeRemaining: 15,
  });

  const [activeTrip, setActiveTrip] = useState<any | null>(null);
  const [tripStep, setTripStep] = useState<'en_route' | 'arrived' | 'trip_started' | 'completed'>('en_route');
  const [requestTimer, setRequestTimer] = useState<number>(15);

  // Earnings Summary State
  const [todayEarnings, setTodayEarnings] = useState<number>(248.50);
  const [completedTripsCount, setCompletedTripsCount] = useState<number>(5);

  // Driver Profile & Settings State
  const [preferredNav, setPreferredNav] = useState<'google_maps' | 'waze' | 'apple_maps'>('google_maps');
  const [autoAccept, setAutoAccept] = useState<boolean>(false);
  const [pickupRadius, setPickupRadius] = useState<number>(15);
  const [destinationAddress, setDestinationAddress] = useState<string>('742 Evergreen Terrace, Beverly Hills');
  const [destinationFilterEnabled, setDestinationFilterEnabled] = useState<boolean>(false);

  // Driver Notifications State
  const [showNotificationsModal, setShowNotificationsModal] = useState<boolean>(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(2);
  const [notificationsList, setNotificationsList] = useState([
    { id: '1', title: 'High Demand Surge Bonus ⚡', desc: 'Earn +$15.00 extra per completed trip in Beverly Hills zone until 6:00 PM.', time: '10m ago', unread: true, type: 'offer', icon: Sparkles },
    { id: '2', title: 'Vehicle Inspection Verified ✓', desc: 'Your 2024 Mercedes-Maybach commercial permit was approved for 2026.', time: '1h ago', unread: true, type: 'driver', icon: ShieldCheck },
    { id: '3', title: 'Weekly Payout Ready 💰', desc: 'Direct deposit of $1,420.50 initiated to Chase Checking ****4921.', time: '5h ago', unread: false, type: 'booking', icon: CheckCircle2 },
  ]);

  // Real-Time Cross-Tab Dispatch Listener (Connects User App to Driver App)
  useEffect(() => {
    const cleanup = bridgeListen((msg) => {
      if (msg.sentFrom !== 'user-app') return;

      if (msg.type === 'BOOKING_REQUEST') {
        const payload = msg.payload as any;
        setRequestTimer(30);
        setIncomingRequest({
          id: payload.requestId || payload.bookingNumber || `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
          bookingNumber: payload.bookingNumber || payload.requestId,
          customerName: payload.customerName || 'Alexander Vance',
          customerRating: payload.customerRating || 4.98,
          pickup: payload.pickup || '742 Evergreen Terrace, Beverly Hills',
          destination: payload.destination || 'LAX International Airport',
          serviceType: payload.serviceType || 'Executive Chauffeur Drive',
          duration: payload.duration || '4 Hours',
          totalFare: payload.totalFare || 140.00,
          driverPayout: payload.driverPayout || Math.round((payload.totalFare || 140) * 0.80 * 100) / 100,
          distance: '1.4 miles away',
          timeRemaining: 30,
        });
        setActiveDriverTab('rides');
      }

      if (msg.type === 'BOOKING_CANCELLED') {
        setIncomingRequest(null);
        setActiveTrip(null);
      }
    });

    return cleanup;
  }, []);

  const handleAcceptRequest = () => {
    if (!incomingRequest) return;
    setActiveTrip(incomingRequest);

    // Broadcast Acceptance back to User App
    bridgeSend('BOOKING_ACCEPTED', {
      requestId: incomingRequest.id,
      bookingNumber: incomingRequest.bookingNumber || incomingRequest.id,
      driverName: 'Marcus Vance',
      driverRating: 4.98,
      driverPhone: '+1 (555) 382-9102',
      estimatedArrival: '8 mins',
      status: 'accepted'
    }, 'driver-app');

    setIncomingRequest(null);
    setTripStep('en_route');
  };

  const handleDeclineRequest = () => {
    if (incomingRequest) {
      bridgeSend('BOOKING_DECLINED', {
        requestId: incomingRequest.id,
        bookingNumber: incomingRequest.bookingNumber || incomingRequest.id,
        driverName: 'Marcus Vance',
        driverRating: 4.98,
        driverPhone: '+1 (555) 382-9102',
        status: 'declined'
      }, 'driver-app');
    }
    setIncomingRequest(null);
  };

  const handleSimulateNewRequest = () => {
    setRequestTimer(15);
    setIncomingRequest({
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: 'Sophia Loren',
      customerRating: 4.98,
      pickup: '100 Wilshire Blvd, Santa Monica',
      destination: 'The Beverly Hills Hotel, Sunset Blvd',
      serviceType: 'Outstation Luxury Drive',
      duration: '2 Hours',
      totalFare: 195.00,
      driverPayout: 156.00,
      distance: '1.8 miles away',
      timeRemaining: 15,
    });
  };

  const [completedTripData, setCompletedTripData] = useState<any | null>(null);

  // Payment Request Slip Modal State
  const [showPaymentSlipModal, setShowPaymentSlipModal] = useState<boolean>(false);
  const [isPaymentCollected, setIsPaymentCollected] = useState<boolean>(false);
  const [isClosingPaymentSlip, setIsClosingPaymentSlip] = useState<boolean>(false);

  const handleClosePaymentSlipModal = () => {
    setIsClosingPaymentSlip(true);
    setTimeout(() => {
      setShowPaymentSlipModal(false);
      setIsClosingPaymentSlip(false);
      setActiveTrip(null);
      setTripStep('en_route');
    }, 280);
  };

  const handleCompleteTrip = () => {
    if (activeTrip) {
      setTodayEarnings((prev) => prev + activeTrip.driverPayout);
      setCompletedTripsCount((prev) => prev + 1);
      setCompletedTripData(activeTrip);
      setTripStep('completed');
      setIsPaymentCollected(false);
      setShowPaymentSlipModal(true);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#FAFAFA] text-slate-900 animate-fade-in overflow-hidden font-sans">
      {/* Top Driver Bar */}
      <div className="bg-white pt-2 pb-3 px-4 border-b border-slate-200 flex items-center justify-between flex-shrink-0 z-30 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#fcd502] text-slate-950 flex items-center justify-center font-black text-sm shadow-md">
            RD
          </div>
          <div>
            <h2 className="font-extrabold text-sm text-slate-900 tracking-tight">RIDINGO Driver</h2>
            <p className="text-[10px] text-slate-500 font-medium">Marcus Vance • S-Class Chauffeur</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Online / Offline Toggle Pill */}
          <button
            type="button"
            onClick={() => setIsOnline(!isOnline)}
            className={`px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
              isOnline 
                ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Power className="w-3.5 h-3.5 stroke-[3]" />
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
            onClick={() => setActiveDriverTab('profile')}
            className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-xs hover:ring-2 hover:ring-[#fcd502] active:scale-95 transition-all flex-shrink-0 cursor-pointer"
            title="Driver Profile"
          >
            <img
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80"
              alt="Marcus Vance"
              className="w-full h-full object-cover rounded-full"
            />
          </button>

          {/* Switch to Rider App */}
          <button
            type="button"
            onClick={onSwitchToCustomerApp}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer border border-slate-200"
            title="Switch to Customer Rider App"
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Scrollable Driver App Body */}
      <div className="flex-1 overflow-y-auto p-4 pb-28 space-y-4 scrollbar-none">
        
        {/* Offline Banner if Offline */}
        {!isOnline && (
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Power className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">You Are Currently Offline</h3>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Toggle online above to start receiving live Chauffeur ride requests in your area.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOnline(true)}
              className="py-3 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              Go Online Now
            </button>
          </div>
        )}


        {activeDriverTab === 'rides' && isOnline && (
          <div className="space-y-4">

            {/* Greeting Section (Only on Home tab as requested) */}
            <div className="bg-white p-4.5 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-[26px] sm:text-[28px] font-medium text-slate-900 leading-[1.15] tracking-tight">
                    <span className="block">Good</span>
                    <span className="block">afternoon, Marcus 💪</span>
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

            {/* Interactive Map Canvas Container */}
            <div className="relative w-full h-64 rounded-3xl bg-slate-900 border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between p-3.5">
              {/* Simulated Map Visual Vector Background */}
              <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
              
              {/* Floating Map Roads / GPS Route Line Mock */}
              <svg className="absolute inset-0 w-full h-full stroke-amber-400/40" strokeWidth="3" fill="none">
                <path d="M 40 220 Q 150 120 280 180 T 400 60" strokeDasharray="6 6" />
              </svg>

              {/* Driver Live Marker Pin */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-[#fcd502] text-slate-950 flex items-center justify-center shadow-lg border-2 border-white ring-4 ring-[#fcd502]/30 animate-pulse">
                  <Navigation className="w-5 h-5 fill-slate-950" />
                </div>
                <span className="mt-1.5 px-2.5 py-0.5 rounded-full bg-slate-950 text-white font-black text-[10px] shadow-md border border-slate-800">
                  Beverly Hills GPS
                </span>
              </div>

              {/* Map Top Status Pill */}
              <div className="relative z-20 flex items-center justify-between">
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-md backdrop-blur-md ${
                  isOnline 
                    ? 'bg-emerald-500/90 text-white border border-emerald-400/40' 
                    : 'bg-slate-800/90 text-slate-300 border border-slate-700'
                }`}>
                  {isOnline ? '🟢 Online • Searching Nearby Rides' : '⚪ Offline'}
                </span>

                {!incomingRequest && !activeTrip && (
                  <button
                    type="button"
                    onClick={handleSimulateNewRequest}
                    className="px-3 py-1.5 rounded-full bg-[#fcd502] hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1 shadow-md border border-amber-300 cursor-pointer active:scale-95 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Simulate Request</span>
                  </button>
                )}
              </div>
            </div>

            {/* Clean Professional Incoming Ride Request Card */}
            {incomingRequest && !activeTrip && (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-lg space-y-4 font-sans animate-drop-up text-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Incoming Dispatch</span>
                    <h3 className="font-black text-lg text-slate-900">{incomingRequest.customerName}</h3>
                    <p className="text-xs text-slate-500 font-medium">★ {incomingRequest.customerRating} • {incomingRequest.serviceType}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-slate-900 block">${incomingRequest.driverPayout.toFixed(2)}</span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-block">Net Payout</span>
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
              <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-lg space-y-4 font-sans animate-drop-up text-slate-900">
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
                    onClick={() => alert(`Launching ${preferredNav.toUpperCase()} Navigation...`)}
                    className="py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-900 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Navigation className="w-3.5 h-3.5 text-blue-600" />
                    <span>Maps</span>
                  </button>
                </div>

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
                      onClick={() => setTripStep('trip_started')}
                      className="w-full py-4 px-5 rounded-2xl bg-[#fcd502] hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider text-center shadow-md cursor-pointer transition-all active:scale-95"
                    >
                      Start Ride Meter
                    </button>
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

        {/* Tab 2: Earnings */}
        {activeDriverTab === 'earnings' && (
          <div className="space-y-4 animate-fade-in text-slate-900">
            <div className="p-5 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Available Balance</span>
                  <h3 className="text-3xl font-black text-slate-900">${todayEarnings.toFixed(2)}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => alert(`Initiating instant payout of $${todayEarnings.toFixed(2)} to Chase Bank ****4921`)}
                  className="py-2.5 px-4 rounded-xl bg-[#fcd502] hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md cursor-pointer"
                >
                  Instant Payout
                </button>
              </div>

              <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Weekly Target: $1,200.00</span>
                <span className="text-emerald-600 font-bold">82% Achieved</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-4 border border-slate-200 space-y-3 shadow-xs">
              <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">Recent Trip Payouts</h4>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">Beverly Hills ➔ LAX Airport</span>
                    <span className="text-[10px] text-slate-500">4 Hours • Executive SUV</span>
                  </div>
                  <span className="font-black text-emerald-600 text-sm">+$112.00</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">Santa Monica ➔ Sunset Blvd</span>
                    <span className="text-[10px] text-slate-500">2 Hours • Maybach Chauffeur</span>
                  </div>
                  <span className="font-black text-emerald-600 text-sm">+$136.50</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: History */}
        {activeDriverTab === 'history' && (
          <div className="space-y-3 animate-fade-in text-xs text-slate-900">
            <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider px-1">Completed Ride History</h4>
            {[
              { customer: 'Alexander Vance', date: 'Today, 2:30 PM', fare: '$112.00', status: 'Completed', rating: '5.0 ★' },
              { customer: 'Lady Eleanor Vance', date: 'Yesterday, 6:15 PM', fare: '$180.00', status: 'Completed', rating: '5.0 ★' },
              { customer: 'David Miller', date: '08/03/2026', fare: '$95.00', status: 'Completed', rating: '4.9 ★' },
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
                <div>
                  <span className="font-extrabold text-slate-900 block">{item.customer}</span>
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

        {/* Tab 4: Profile & Vehicle Settings */}
        {activeDriverTab === 'profile' && (
          <div className="space-y-4 animate-fade-in text-xs pb-6 text-slate-900">
            
            {/* 1. DRIVER PROFILE CARD */}
            <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-3.5">
                <img
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80"
                  alt="Marcus Vance"
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-[#fcd502] shadow-xs"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-base text-slate-900 truncate">Marcus Vance</h3>
                  <p className="text-xs text-slate-500 font-medium">Senior Chauffeur</p>
                  <p className="text-[11px] text-slate-400 font-medium pt-0.5">+1 (555) 234-5678 • marcus.v@ridingo.com</p>
                </div>
              </div>
            </div>

            {/* 2. ASSIGNED VEHICLE */}
            <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Fleet Vehicle</span>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-sm text-slate-900">2024 Mercedes-Maybach S-Class</h4>
                  <p className="text-xs text-slate-500 font-medium">Executive Chauffeur • CA 7XYZ99</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Active & Insured
                </span>
              </div>
            </div>

            {/* 3. APP & DISPATCH PREFERENCES */}
            <div className="p-4 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Preferences</span>
              
              {/* Navigation App Engine Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 block">Preferred Navigation Map Engine</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPreferredNav('google_maps')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      preferredNav === 'google_maps' 
                        ? 'bg-[#fcd502] text-slate-950 border-[#fcd502] font-black shadow-xs' 
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Google Maps
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreferredNav('waze')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      preferredNav === 'waze' 
                        ? 'bg-[#fcd502] text-slate-950 border-[#fcd502] font-black shadow-xs' 
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Waze
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreferredNav('apple_maps')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      preferredNav === 'apple_maps' 
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
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    autoAccept ? 'bg-[#fcd502]' : 'bg-slate-300'
                  }`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-xs ${
                    autoAccept ? 'right-0.5' : 'left-0.5'
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
            <div className="p-4 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Banking & Support</span>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
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

          </div>
        )}

      </div>

      {/* Bottom Driver App Tab Navigation */}
      <div className="bg-white border-t border-slate-200 p-2.5 px-4 pb-[max(env(safe-area-inset-bottom,0px)+0.75rem,1rem)] flex-shrink-0 flex items-center justify-around z-30 shadow-lg text-slate-700">
        <button
          type="button"
          onClick={() => setActiveDriverTab('rides')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
            activeDriverTab === 'rides' ? 'text-slate-950 font-black' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-extrabold">Home</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveDriverTab('earnings')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
            activeDriverTab === 'earnings' ? 'text-slate-950 font-black' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <DollarSign className="w-5 h-5" />
          <span className="text-[10px] font-extrabold">Earnings</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveDriverTab('history')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
            activeDriverTab === 'history' ? 'text-slate-950 font-black' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px] font-extrabold">History</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveDriverTab('profile')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
            activeDriverTab === 'profile' ? 'text-slate-950 font-black' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-extrabold">Account</span>
        </button>
      </div>

      {/* PAYMENT REQUEST SLIP POPUP MODAL WITH SMOOTH ANIMATION */}
      {showPaymentSlipModal && (activeTrip || completedTripData) && (
        <div className={`absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md text-slate-900 transition-opacity duration-300 ${
          isClosingPaymentSlip ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}>
          <div className={`bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4 relative overflow-hidden font-sans transition-all duration-300 transform ${
            isClosingPaymentSlip ? 'scale-95 translate-y-4 opacity-0' : 'scale-100 translate-y-0 opacity-100 animate-drop-up'
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
                    className={`glass-card rounded-3xl p-4 border transition-all flex items-start gap-3.5 ${
                      !item.unread
                        ? 'bg-white/80 border-slate-200/70 text-slate-700 opacity-90'
                        : 'bg-white border-[#fcd502] text-slate-900 shadow-md ring-1 ring-[#fcd502]/30'
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      item.type === 'driver' ? 'bg-[#121212] text-[#fcd502]' :
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
  );
};
