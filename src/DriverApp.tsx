import React, { useState, useEffect, useRef } from 'react';
import {
  Home,
  Edit3,
  FileText,
  Check,
  CheckCheck,
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
  ChevronDown,
  Flame,
  Radio,
  Bell,
  X,
  Compass,
  Camera,
  Lock,
  LocateFixed,
  Layers,
  ArrowUpRight,
  SlidersHorizontal,
  ChevronUp,
  Play,
  AlertCircle,
  Plane,
  Briefcase,
  Building2
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
import { VehicleInspectionModal } from './components/VehicleInspectionModal';
import type { VehicleConditionData } from './components/VehicleInspectionModal';
import { formatRupees } from './data/currencies';

export function DriverApp() {
  // Driver Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isOtpStep, setIsOtpStep] = useState<boolean>(false);
  const [driverEmail, setDriverEmail] = useState<string>('');
  const [driverPhone, setDriverPhone] = useState<string>('');
  const [driverFirstName, setDriverFirstName] = useState<string>('Marcus');
  const [driverLastName, setDriverLastName] = useState<string>('Vance');
  const [driverName, setDriverName] = useState<string>('Marcus Vance');
  const [driverPhonePrimary, setDriverPhonePrimary] = useState<string>('+91 98470 12345');
  const [driverPhoneEmergency, setDriverPhoneEmergency] = useState<string>('+91 98470 54321');
  const [driverProfileEmail, setDriverProfileEmail] = useState<string>('marcus.vance@ridingo.com');
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [showLegalModal, setShowLegalModal] = useState<'terms' | 'privacy' | null>(null);

  // Edit Profile Form State
  const [editFirstName, setEditFirstName] = useState<string>('Marcus');
  const [editLastName, setEditLastName] = useState<string>('Vance');
  const [editPhonePrimary, setEditPhonePrimary] = useState<string>('+91 98470 12345');
  const [editPhoneEmergency, setEditPhoneEmergency] = useState<string>('+91 98470 54321');
  const [editEmail, setEditEmail] = useState<string>('marcus.vance@ridingo.com');
  const [demoOtp, setDemoOtp] = useState<string>('492018');
  const [destinationFilterEnabled, setDestinationFilterEnabled] = useState<boolean>(false);
  const [autoAccept, setAutoAccept] = useState<boolean>(false);

  // Home Section Destination Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [activeDestinationFilter, setActiveDestinationFilter] = useState<string | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const HOT_DESTINATIONS = [
    {
      id: 'airport',
      name: 'Cochin Int. Airport (COK)',
      area: 'Nedumbassery T3 Departures',
      distance: '24 km',
      surge: '+₹250 Surge',
      lat: 10.1518,
      lng: 76.3930,
      icon: Plane,
    },
    {
      id: 'infopark',
      name: 'Infopark Kakkanad Campus',
      area: 'Phase 1 & 2 IT Express Way',
      distance: '12 km',
      surge: '+₹150 Surge',
      lat: 10.0105,
      lng: 76.3630,
      icon: Briefcase,
    },
    {
      id: 'marinedrive',
      name: 'Marine Drive & High Court',
      area: 'Rainbow Bridge, Menaka',
      distance: '4.2 km',
      surge: '+₹100 Surge',
      lat: 9.9790,
      lng: 76.2760,
      icon: MapPin,
    },
    {
      id: 'lulumall',
      name: 'Lulu Mall & Metro Station',
      area: 'Edappally Toll Junction',
      distance: '8.5 km',
      surge: 'High Demand',
      lat: 10.0275,
      lng: 76.3080,
      icon: Building2,
    },
    {
      id: 'railway',
      name: 'Ernakulam South Junction (ERS)',
      area: 'Railway Station Rd, Karikkamuri',
      distance: '3.1 km',
      surge: null,
      lat: 9.9710,
      lng: 76.2890,
      icon: Navigation,
    },
  ];

  const filteredDestinations = searchQuery.trim() === ''
    ? HOT_DESTINATIONS
    : HOT_DESTINATIONS.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.area.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const handleSelectDestination = (place: typeof HOT_DESTINATIONS[0]) => {
    setSearchQuery(place.name);
    setActiveDestinationFilter(place.name);
    setDestinationFilterEnabled(true);
    setDestLatLng({ lat: place.lat, lng: place.lng });
    setIsSearchFocused(false);
  };

  // Main Driver State
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'rides' | 'earnings' | 'history' | 'profile'>('rides');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<'Hourly' | 'Airport' | 'Outstation'>('Hourly');
  const [todayEarnings, setTodayEarnings] = useState<number>(2850.00);
  const [completedTripsCount, setCompletedTripsCount] = useState<number>(5);
  const [onlineHours, setOnlineHours] = useState<string>('4h 20m');

  // Incoming Dispatch Request State
  const [incomingRequest, setIncomingRequest] = useState<any | null>(null);
  const [pendingRequestId, setPendingRequestId] = useState<string | null>(null);

  const [activeTrip, setActiveTrip] = useState<any | null>(null);
  const [completedTripData, setCompletedTripData] = useState<any | null>(null);
  const [tripStep, setTripStep] = useState<'en_route' | 'arrived' | 'trip_started' | 'completed'>('en_route');
  const [requestTimer, setRequestTimer] = useState<number>(30);
  const geoWatchRef = useRef<number | null>(null);
  const [locationTrackingActive, setLocationTrackingActive] = useState(false);

  // Incomplete / Paused Trips State
  const [incompleteTrips, setIncompleteTrips] = useState<Array<{
    id: string;
    trip: any;
    tripStep: 'en_route' | 'arrived' | 'trip_started';
    pausedAt: string;
    vehicleInspectionData?: VehicleConditionData | null;
  }>>([]);

  // Completed Trips State (Kerala)
  const [completedTripsList, setCompletedTripsList] = useState<Array<{
    id: string;
    customer: string;
    route: string;
    date: string;
    fare: string;
    rating: string;
    serviceType?: string;
  }>>([
    { id: 'HIST-1', customer: 'Priya Sharma', route: 'Marine Drive, Kochi ➔ Cochin Airport (COK)', date: 'Today, 2:15 PM', fare: '₹1,250.00', rating: '5.0 ★', serviceType: 'Executive Sedan' },
    { id: 'HIST-2', customer: 'Alexander Vance', route: 'Fort Kochi Heritage ➔ Willingdon Island', date: 'Today, 10:45 AM', fare: '₹850.00', rating: '5.0 ★', serviceType: 'Luxury Chauffeur' },
    { id: 'HIST-3', customer: 'David Miller', route: 'Infopark Phase 1, Kakkanad ➔ MG Road, Kochi', date: 'Yesterday, 6:30 PM', fare: '₹950.00', rating: '4.9 ★', serviceType: 'Business Comfort' },
    { id: 'HIST-4', customer: 'Neha Kapoor', route: 'Aluva Metro Hub ➔ Thrissur Round East', date: '08/03/2026', fare: '₹1,450.00', rating: '5.0 ★', serviceType: 'Outstation Executive' },
  ]);

  // Geospatial, Navigation & Traccar State (Kerala, India)
  const [driverCurrentLocation, setDriverCurrentLocation] = useState<{ lat: number; lng: number }>({ lat: 9.9816, lng: 76.2999 }); // Marine Drive / MG Road, Kochi, Kerala
  const [driverHeading, setDriverHeading] = useState<number>(45);
  const [pickupLatLng, setPickupLatLng] = useState<{ lat: number; lng: number }>({ lat: 9.9784, lng: 76.2757 }); // Marine Drive Promenade, Kochi
  const [destLatLng, setDestLatLng] = useState<{ lat: number; lng: number }>({ lat: 10.1518, lng: 76.3930 }); // Cochin International Airport T3 (COK), Nedumbassery, Kerala
  const [activeRoute, setActiveRoute] = useState<Route | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState<boolean>(false);
  const [currentNavStepIndex, setCurrentNavStepIndex] = useState<number>(0);
  const [showNavPanel, setShowNavPanel] = useState<boolean>(false);

  // Payment Request Slip Modal State
  const [showPaymentSlipModal, setShowPaymentSlipModal] = useState<boolean>(false);
  const [isPaymentCollected, setIsPaymentCollected] = useState<boolean>(false);
  const [isClosingPaymentSlip, setIsClosingPaymentSlip] = useState<boolean>(false);

  // Vehicle Pre-Trip Condition Inspection Modal State
  const [showInspectionModal, setShowInspectionModal] = useState<boolean>(false);
  const [vehicleInspectionData, setVehicleInspectionData] = useState<VehicleConditionData | null>(null);

  // Driver Notifications State & Mock Initial Feed
  const INITIAL_DRIVER_NOTIFICATIONS = [
    { id: '1', title: 'High Demand Surge Active ⚡', desc: 'Earn +₹250 surge bonus per completed ride in Kochi Marine Drive & Kakkanad Infopark zone until 6:00 PM.', time: '8m ago', unread: true, type: 'offer', icon: Sparkles },
    { id: '2', title: 'Commercial Permit Verified ✓', desc: 'Kerala Motor Vehicles Department (KMVD) chauffeur permit is active.', time: '1h ago', unread: true, type: 'driver', icon: ShieldCheck },
    { id: '3', title: 'Direct Deposit Confirmed 💰', desc: 'Weekly earnings payout of ₹24,850.00 transferred to Federal Bank ****4921.', time: '4h ago', unread: false, type: 'booking', icon: CheckCircle2 },
  ];

  const [showNotificationsModal, setShowNotificationsModal] = useState<boolean>(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(2);
  const [notificationsList, setNotificationsList] = useState(INITIAL_DRIVER_NOTIFICATIONS);
  const [isClearingNotifications, setIsClearingNotifications] = useState<boolean>(false);
  const [clearingNotificationIds, setClearingNotificationIds] = useState<string[]>([]);

  // Smooth drop-right cascade clear when clicking "Mark all read"
  const handleMarkAllReadAndClear = () => {
    if (isClearingNotifications || notificationsList.length === 0) return;
    setIsClearingNotifications(true);
    setUnreadNotificationsCount(0);

    const totalDuration = 340 + (notificationsList.length * 60);
    setTimeout(() => {
      setNotificationsList([]);
      setIsClearingNotifications(false);
      setClearingNotificationIds([]);
    }, totalDuration);
  };

  // Smooth drop-right clear for single notification item
  const handleDismissNotification = (id: string) => {
    if (clearingNotificationIds.includes(id)) return;
    setClearingNotificationIds((prev) => [...prev, id]);
    setTimeout(() => {
      setNotificationsList((prev) => {
        const next = prev.filter((item) => item.id !== id);
        if (next.length === 0) {
          setUnreadNotificationsCount(0);
        }
        return next;
      });
      setClearingNotificationIds((prev) => prev.filter((itemKey) => itemKey !== id));
    }, 340);
  };

  // Fetch OSRM navigation route on trip step change
  useEffect(() => {
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

  // ── BroadcastChannel: Listen for booking requests from User App ──
  useEffect(() => {
    const cleanup = bridgeListen((msg) => {
      if (msg.sentFrom !== 'user-app') return;

      if (msg.type === 'BOOKING_REQUEST') {
        const req = msg.payload as BookingRequestPayload;
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
          fromUserApp: true,
        });
        setUnreadNotificationsCount(prev => prev + 1);
        setNotificationsList(prev => [{
          id: req.requestId,
          title: '🚗 New Ride Dispatch!',
          desc: `${req.customerName} requested pickup from ${req.pickup.substring(0, 30)}...`,
          time: 'just now',
          unread: true,
          type: 'booking',
          icon: Radio,
        }, ...prev]);
      }

      if (msg.type === 'BOOKING_CANCELLED') {
        const p = msg.payload as { requestId: string };
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
      setIncomingRequest(null);
      setPendingRequestId(null);
      return;
    }
    const t = setTimeout(() => setRequestTimer(prev => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [requestTimer, incomingRequest]);

  // ── Synchronize Active Trip & Step Progression into Incomplete Trips ──
  useEffect(() => {
    if (!activeTrip) return;
    const tripId = activeTrip.bookingNumber || activeTrip.id;
    if (!tripId) return;

    if (tripStep === 'completed') return;

    setIncompleteTrips((prev) => {
      const idx = prev.findIndex((t) => t.id === tripId);
      const updatedItem = {
        id: tripId,
        trip: activeTrip,
        tripStep: tripStep as 'en_route' | 'arrived' | 'trip_started',
        pausedAt: prev[idx]?.pausedAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        vehicleInspectionData: vehicleInspectionData || prev[idx]?.vehicleInspectionData,
      };

      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updatedItem;
        return copy;
      } else {
        return [updatedItem, ...prev];
      }
    });
  }, [activeTrip, tripStep, vehicleInspectionData]);

  const handleClosePaymentSlipModal = () => {
    setIsClosingPaymentSlip(true);
    const finishedTrip = activeTrip || completedTripData;
    if (finishedTrip) {
      const tripId = finishedTrip.bookingNumber || finishedTrip.id;
      setIncompleteTrips((prev) => prev.filter((t) => t.id !== tripId));
    }
    setTimeout(() => {
      setShowPaymentSlipModal(false);
      setIsClosingPaymentSlip(false);
      setActiveTrip(null);
      setCompletedTripData(null);
      setTripStep('en_route');
      setVehicleInspectionData(null);
    }, 280);
  };

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
    if (incomingRequest.fromUserApp) {
      const response: BookingResponsePayload = {
        requestId: incomingRequest.id,
        bookingNumber: incomingRequest.bookingNumber || incomingRequest.id,
        driverName: driverName,
        driverRating: 4.96,
        driverPhone: '+1 (555) 382-9102',
        estimatedArrival: '6 mins',
        status: 'accepted',
      };
      bridgeSend('BOOKING_ACCEPTED', response, 'driver-app');
    }

    // Immediately record newly accepted trip in incompleteTrips
    const tripId = incomingRequest.bookingNumber || incomingRequest.id || `TRIP-${Date.now()}`;
    const newIncompleteItem = {
      id: tripId,
      trip: incomingRequest,
      tripStep: 'en_route' as const,
      pausedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      vehicleInspectionData: null,
    };
    setIncompleteTrips((prev) => [newIncompleteItem, ...prev.filter((t) => t.id !== tripId)]);

    setActiveTrip(incomingRequest);
    setIncomingRequest(null);
    setPendingRequestId(null);
    setTripStep('en_route');
    setActiveTab('rides');

    setNotificationsList((prev) => [
      {
        id: `accepted-${Date.now()}`,
        title: '✅ Ride Accepted & In Progress',
        desc: `Accepted ride for ${incomingRequest.customerName}. Added to Incomplete Trips in History.`,
        time: 'just now',
        unread: true,
        type: 'booking',
        icon: CheckCircle2,
      },
      ...prev,
    ]);
    setUnreadNotificationsCount((prev) => prev + 1);
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
    setIsOnline(true);
    setActiveTab('rides');
    setRequestTimer(30);
    setIncomingRequest({
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: 'Priya Sharma',
      customerRating: 4.96,
      pickup: 'Marine Drive Walkway, Ernakulam, Kochi, Kerala',
      destination: 'Cochin International Airport (COK), Nedumbassery, Kerala',
      serviceType: 'Executive Chauffeur Drive',
      duration: '42 mins',
      totalFare: 1450.00,
      driverPayout: 1160.00,
      distance: '2.5 km away (6 min pickup)',
      timeRemaining: 30,
      fromUserApp: false,
    });
  };

  const handleConfirmStartTrip = (data: VehicleConditionData) => {
    if (!data || !data.front || !data.rightSide || !data.back || !data.leftSide) {
      alert('Trip Locked!\n\nAll 4 car images (Front, Right Side, Back, Left Side) must be captured before starting the trip.');
      setShowInspectionModal(true);
      return;
    }
    setVehicleInspectionData(data);
    setShowInspectionModal(false);
    setTripStep('trip_started');
    bridgeSend('TRIP_STARTED', {
      bookingNumber: activeTrip?.bookingNumber || activeTrip?.id || 'TRIP-DEMO',
      driverName: driverName,
      timestamp: Date.now(),
    } as TripEventPayload, 'driver-app');
    if (activeTrip) {
      startLocationTracking(activeTrip.bookingNumber || activeTrip.id);
    }
  };

  const handleCompleteTrip = () => {
    if (activeTrip) {
      stopLocationTracking();
      bridgeSend('TRIP_COMPLETED', {
        bookingNumber: activeTrip.bookingNumber || activeTrip.id,
        driverName: driverName,
        timestamp: Date.now(),
      } as TripEventPayload, 'driver-app');

      const tripId = activeTrip.bookingNumber || activeTrip.id;
      // Remove finished trip from Incomplete Trips
      setIncompleteTrips((prev) => prev.filter((t) => t.id !== tripId));

      // Append finished trip to Completed Trips History
      setCompletedTripsList((prev) => [
        {
          id: `COMPLETED-${Date.now()}`,
          customer: activeTrip.customerName || 'Passenger',
          route: `${activeTrip.pickup || 'Pickup'} ➔ ${activeTrip.destination || 'Destination'}`,
          date: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          fare: formatRupees(activeTrip.totalFare || 1450),
          rating: '5.0 ★',
          serviceType: activeTrip.serviceType || 'Executive Drive',
        },
        ...prev,
      ]);

      setTodayEarnings((prev) => prev + activeTrip.driverPayout);
      setCompletedTripsCount((prev) => prev + 1);
      setCompletedTripData(activeTrip);
      setTripStep('completed');
      setIsPaymentCollected(false);
      setShowPaymentSlipModal(true);
    }
  };

  // ── Cancel / Pause Active Trip -> Keep as Incomplete in History ──
  const handlePauseOrCancelActiveTrip = () => {
    if (!activeTrip) return;
    const tripId = activeTrip.bookingNumber || activeTrip.id || `TRIP-${Date.now()}`;
    const pausedItem = {
      id: tripId,
      trip: activeTrip,
      tripStep: (tripStep === 'completed' ? 'trip_started' : tripStep) as 'en_route' | 'arrived' | 'trip_started',
      pausedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      vehicleInspectionData: vehicleInspectionData,
    };
    setIncompleteTrips((prev) => [pausedItem, ...prev.filter((t) => t.id !== tripId)]);
    setActiveTrip(null);
    setShowNavPanel(false);
    stopLocationTracking();

    setNotificationsList((prev) => [
      {
        id: `incomplete-${Date.now()}`,
        title: '⏸️ Trip Minimized to Incomplete',
        desc: `Ride for ${activeTrip.customerName} remains in Incomplete Trips history. Tap 'Complete Step' anytime to resume.`,
        time: 'just now',
        unread: true,
        type: 'booking',
        icon: Clock,
      },
      ...prev,
    ]);
    setUnreadNotificationsCount((prev) => prev + 1);
  };

  // ── Resume Incomplete Trip Step from History / Map Pill ──
  const handleResumeTrip = (item: {
    id: string;
    trip: any;
    tripStep: 'en_route' | 'arrived' | 'trip_started';
    pausedAt: string;
    vehicleInspectionData?: VehicleConditionData | null;
  }) => {
    setActiveTrip(item.trip);
    setTripStep(item.tripStep);
    if (item.vehicleInspectionData) {
      setVehicleInspectionData(item.vehicleInspectionData);
    }
    setActiveTab('rides');
    setIsOnline(true);
    if (item.tripStep === 'trip_started') {
      startLocationTracking(item.trip.bookingNumber || item.trip.id);
    }
  };

  // ── Permanently Discard / Cancel Incomplete Trip ──
  const handleDiscardIncompleteTrip = (id: string) => {
    if (confirm('Cancel and remove this incomplete ride permanently?')) {
      setIncompleteTrips((prev) => prev.filter((t) => t.id !== id));
      if (activeTrip && (activeTrip.bookingNumber === id || activeTrip.id === id)) {
        setActiveTrip(null);
        stopLocationTracking();
      }
    }
  };

  // ── GPS Location Tracking ──
  const startLocationTracking = (bookingNumber: string) => {
    if (!navigator.geolocation) return;
    if (geoWatchRef.current !== null) navigator.geolocation.clearWatch(geoWatchRef.current);

    geoWatchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        // Strict Kerala boundary filter (Lat: 8.15 to 12.85, Lng: 74.85 to 77.40)
        // Ridingo operates exclusively in Kerala state: clamp to Kerala if testing outside
        const rawLat = pos.coords.latitude;
        const rawLng = pos.coords.longitude;
        const isKerala = rawLat >= 8.15 && rawLat <= 12.85 && rawLng >= 74.85 && rawLng <= 77.40;
        const finalLat = isKerala ? rawLat : 9.9816;
        const finalLng = isKerala ? rawLng : 76.2999;

        const payload: DriverLocationPayload = {
          bookingNumber,
          lat: finalLat,
          lng: finalLng,
          heading: pos.coords.heading ?? undefined,
          speed: pos.coords.speed ? pos.coords.speed * 3.6 : undefined,
          accuracy: pos.coords.accuracy,
          timestamp: Date.now(),
        };
        setDriverCurrentLocation({ lat: finalLat, lng: finalLng });
        if (pos.coords.heading !== null && !isNaN(pos.coords.heading)) {
          setDriverHeading(pos.coords.heading);
        }
        bridgeSend('DRIVER_LOCATION', payload, 'driver-app');
        traccarReportPosition(
          finalLat,
          finalLng,
          pos.coords.accuracy,
          pos.coords.speed ? pos.coords.speed * 3.6 : undefined,
          pos.coords.heading ?? undefined
        );
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
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

  const handleRecenterMap = () => {
    // Recenter strictly inside Kerala (Marine Drive, Kochi hub)
    setDriverCurrentLocation((prev) => {
      const isKerala = prev.lat >= 8.15 && prev.lat <= 12.85 && prev.lng >= 74.85 && prev.lng <= 77.40;
      return isKerala ? { ...prev } : { lat: 9.9816, lng: 76.2999 };
    });
  };

  const navTabs = [
    { id: 'rides' as const, label: 'Home', icon: Home },
    { id: 'earnings' as const, label: 'Earnings', icon: DollarSign },
    { id: 'history' as const, label: 'Trips', icon: Clock },
    { id: 'profile' as const, label: 'Account', icon: User },
  ];

  return (
    <div className="min-h-screen h-screen w-full bg-[#05080E] flex items-center justify-center selection:bg-[#fcd502] selection:text-black overflow-hidden p-0 sm:p-3 font-sans">
      {/* Authentic iPhone 15 Pro Device Frame Container (Exact 393px × 852px viewport) */}
      <div className="w-full sm:w-[393px] h-full sm:h-[852px] sm:max-h-[92vh] sm:rounded-[54px] bg-[#0A0E17] text-white flex flex-col relative shadow-[0_25px_70px_rgba(0,0,0,0.95)] sm:border-[10px] sm:border-[#1A2234] sm:ring-1 sm:ring-white/15 overflow-hidden select-none">

        {/* Minimal Mobile Status Bar */}
        <MobileControlCenterStatusBar theme="dark" />

        {/* ─── AUTHENTICATION / LOGIN VIEW ─── */}
        {!isAuthenticated ? (
          <div className="w-full h-full overflow-y-auto bg-[#0A0E17] text-white p-6 flex flex-col justify-between pt-4 pb-6 space-y-6">
            <div className="space-y-6 my-auto max-w-sm mx-auto w-full">
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Driver Partner</span>
                <button
                  type="button"
                  onClick={() => setIsAuthenticated(true)}
                  className="px-3.5 py-1.5 rounded-full bg-[#fcd502] text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer hover:bg-[#eac500] whitespace-nowrap"
                >
                  <span className="whitespace-nowrap">Skip to App</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                </button>
              </div>

              <div className="text-center space-y-2">
                <img
                  src={ridingoLogo}
                  alt="RIDINGO"
                  className="h-14 w-auto object-contain mx-auto"
                />
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight pt-1 whitespace-nowrap truncate">Driver Partner Console</h1>
                <p className="text-xs text-slate-400 font-medium whitespace-nowrap truncate">Sign in to start receiving trip dispatches</p>
              </div>

              {!isOtpStep ? (
                <form onSubmit={handleSendOtp} className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        required
                        value={driverEmail}
                        onChange={(e) => setDriverEmail(e.target.value)}
                        placeholder="marcus.vance@ridingo.com"
                        className="w-full py-3 pl-10 pr-4 bg-[#121824] border border-white/10 rounded-2xl text-xs font-semibold text-white placeholder:font-normal placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#fcd502] focus:bg-[#161E2E] transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">Mobile Number</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type="tel"
                        required
                        value={driverPhone}
                        onChange={(e) => setDriverPhone(e.target.value)}
                        placeholder="+1 (555) 019-2834"
                        className="w-full py-3 pl-10 pr-4 bg-[#121824] border border-white/10 rounded-2xl text-xs font-semibold text-white placeholder:font-normal placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#fcd502] focus:bg-[#161E2E] transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-[#fcd502] hover:bg-[#eac500] text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#fcd502]/20 transition-transform active:scale-[0.98] cursor-pointer"
                  >
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAuthenticated(true)}
                    className="w-full py-3 rounded-2xl bg-[#121824] hover:bg-[#182032] text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-white/10"
                  >
                    <span>⚡ Skip Login &amp; Explore Console</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#151D2C] border border-amber-400/30 text-center space-y-2">
                    <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">Demo Code</span>
                    <div className="font-mono text-2xl font-black text-[#fcd502] tracking-widest bg-[#0A0E17] px-4 py-1.5 rounded-xl border border-amber-400/30 inline-block">
                      {demoOtp}
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-[#fcd502] hover:bg-[#eac500] text-slate-950 font-black text-xs uppercase tracking-wider transition-transform active:scale-[0.98] cursor-pointer shadow-lg shadow-[#fcd502]/20"
                  >
                    Verify &amp; Enter
                  </button>
                </form>
              )}
            </div>

            <div className="text-center text-[11px] text-slate-500 font-medium">
              RIDINGO Driver App • Modern Map Cockpit
            </div>
          </div>
        ) : (
          /* ─── MAIN 2026 MAP-FIRST COCKPIT INTERFACE ─── */
          <div className="relative flex-1 w-full h-full overflow-hidden bg-[#0A0E17] flex flex-col font-sans">

            {/* ═════════ LAYER 0: FULL-BLEED LIVE MAP FOUNDATION ═════════ */}
            <div className="absolute inset-0 z-0 w-full h-full bg-[#080C14]">
              <LeafletMap
                center={driverCurrentLocation}
                zoom={activeTrip ? 15 : 14}
                className="w-full h-full"
                driverLocation={driverCurrentLocation}
                driverHeading={driverHeading}
                pickup={activeTrip ? pickupLatLng : undefined}
                destination={activeTrip ? destLatLng : undefined}
                pickupLabel={activeTrip?.pickup}
                destinationLabel={activeTrip?.destination}
                routeGeometry={activeRoute?.geometry}
                darkMode={true}
              />
            </div>

            {/* ═════════ LAYER 1: FLOATING TOP COCKPIT HUD ═════════ */}
            <div className="relative z-30 px-3 pt-2 pointer-events-auto">
              {/* Turn-by-Turn Navigation Top Banner (When in active trip & navigating) */}
              {activeTrip && activeRoute && (
                <div className="cockpit-glass rounded-2xl p-3 mb-2 shadow-2xl border border-white/10 flex items-center justify-between gap-3 animate-slide-up-smooth select-none">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-[#fcd502] text-slate-950 flex items-center justify-center font-black flex-shrink-0 shadow-md shadow-[#fcd502]/20">
                      <Navigation className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-white block truncate leading-tight whitespace-nowrap">
                        {activeRoute.steps[currentNavStepIndex]?.instruction || (tripStep === 'en_route' ? 'Navigate to pickup' : 'Head to passenger dropoff')}
                      </span>
                      <span className="text-[10px] text-[#fcd502] font-semibold flex items-center gap-1.5 mt-0.5 whitespace-nowrap truncate">
                        <span className="whitespace-nowrap">{tripStep === 'en_route' ? 'Pickup in 6 mins' : 'Dropoff in 18 mins'}</span>
                        <span>•</span>
                        <span className="text-slate-400 whitespace-nowrap">Step {currentNavStepIndex + 1}/{activeRoute.steps.length || 1}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowNavPanel(!showNavPanel)}
                      className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap"
                    >
                      <span className="whitespace-nowrap">Steps</span>
                      {showNavPanel ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Turn-by-turn expanded panel */}
              {activeTrip && showNavPanel && (
                <div className="mb-2 animate-slide-up-smooth">
                  <NavigationPanel
                    route={activeRoute}
                    isLoading={isLoadingRoute}
                    pickup={activeTrip.pickup}
                    destination={activeTrip.destination}
                    currentStepIndex={currentNavStepIndex}
                    onClose={() => setShowNavPanel(false)}
                    onNextStep={() => setCurrentNavStepIndex((prev) => (activeRoute ? Math.min(prev + 1, activeRoute.steps.length - 1) : prev))}
                  />
                </div>
              )}

              {/* Incomplete / Paused Trip Quick Resume Banner (When on map & incomplete trip exists) */}
              {incompleteTrips.length > 0 && !activeTrip && (
                <div className="cockpit-glass rounded-2xl p-2.5 mb-2 shadow-xl border border-amber-400/40 flex items-center justify-between gap-2 animate-slide-up-smooth select-none">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="w-2 h-2 rounded-full bg-[#fcd502] animate-pulse flex-shrink-0" />
                    <span className="text-[11px] font-bold text-white truncate whitespace-nowrap">
                      {incompleteTrips.length} Incomplete Trip{incompleteTrips.length > 1 ? 's' : ''} in History
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('history')}
                    className="px-2.5 py-1 rounded-xl bg-[#fcd502] text-slate-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <span className="whitespace-nowrap">Resume</span>
                    <ArrowRight className="w-3 h-3 stroke-[3]" />
                  </button>
                </div>
              )}

              {/* Top Cockpit Floating Header Capsule */}
              <div className="cockpit-glass rounded-full px-3 py-1.5 flex items-center justify-between shadow-xl border border-white/10 select-none">
                {/* Driver Avatar & Name */}
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center gap-2 cursor-pointer group active:scale-95 transition-all text-left min-w-0"
                  title="Open Driver Profile"
                >
                  <div className="relative w-7 h-7 rounded-full overflow-hidden border border-white/15 flex-shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80"
                      alt={driverName}
                      className="w-full h-full object-cover"
                    />
                    <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-black ${isOnline ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
                  </div>
                  <div className="hidden xs:flex items-center gap-1.5 text-xs text-white leading-tight whitespace-nowrap">
                    <span className="font-semibold truncate max-w-[70px] whitespace-nowrap">{driverName.split(' ')[0]}</span>
                    <span className="text-[11px] text-zinc-400 font-medium whitespace-nowrap">4.96 ★</span>
                  </div>
                </button>

                {/* Center Online/Offline Status Capsule */}
                <button
                  type="button"
                  onClick={() => setIsOnline(!isOnline)}
                  className={`px-3 py-1 rounded-full text-xs font-medium tracking-normal flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 whitespace-nowrap ${
                    isOnline
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-white/5 text-zinc-400 border border-white/10'
                  }`}
                  title="Toggle Driver Status"
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isOnline ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
                  <span className="whitespace-nowrap">{isOnline ? 'Online' : 'Offline'}</span>
                </button>

                {/* Right: Today Earnings Ticker & Notifications */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveTab('earnings')}
                    className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/10 flex items-center text-xs font-medium tabular-nums active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                    title="View Earnings"
                  >
                    <span className="text-[#F5C518] font-semibold whitespace-nowrap">{formatRupees(todayEarnings, 0)}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowNotificationsModal(true);
                    }}
                    className="relative p-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 active:scale-90 transition-all cursor-pointer shrink-0"
                    title="Notifications"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    {unreadNotificationsCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#F5C518] text-black text-[9px] font-bold flex items-center justify-center">
                        {unreadNotificationsCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* ── Home Cockpit Destination & Zone Search Bar ── */}
              <div className="relative mt-2 select-none" ref={searchContainerRef}>
                <div
                  className={`group flex items-center gap-2.5 px-3.5 h-10 rounded-2xl transition-all duration-200 ${
                    isSearchFocused
                      ? 'bg-[#171A22] border border-[#F5C518]/60 shadow-[0_8px_30px_rgba(0,0,0,0.7)] ring-1 ring-[#F5C518]/30'
                      : 'bg-[#12141A]/90 hover:bg-[#151821] backdrop-blur-xl border border-white/10 hover:border-white/20 shadow-lg'
                  }`}
                >
                  <Search className={`w-4 h-4 transition-colors shrink-0 ${isSearchFocused ? 'text-[#F5C518]' : 'text-white/40'}`} />

                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    placeholder="Where to? Set destination or hot zone..."
                    className="flex-1 bg-transparent text-xs text-white placeholder:text-white/40 font-normal outline-none min-w-0"
                  />

                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setActiveDestinationFilter(null);
                        setDestinationFilterEnabled(false);
                      }}
                      className="p-1 rounded-full text-white/40 hover:text-white transition-colors cursor-pointer shrink-0"
                      title="Clear Search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 shrink-0">
                      {destinationFilterEnabled && activeDestinationFilter ? (
                        <span className="px-2 py-0.5 rounded-full bg-[#F5C518]/20 border border-[#F5C518]/40 text-[#F5C518] text-[10px] font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F5C518] animate-pulse" />
                          Filter On
                        </span>
                      ) : (
                        <span className="text-[10px] text-white/30 font-medium tracking-wide">
                          Filter
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Active Destination Filter Banner (When set) */}
                {destinationFilterEnabled && activeDestinationFilter && !isSearchFocused && (
                  <div className="mt-1.5 flex items-center justify-between px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] animate-fade-in shadow-md">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <span className="truncate font-medium">Filtering rides towards: <strong className="font-semibold text-white">{activeDestinationFilter}</strong></span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveDestinationFilter(null);
                        setDestinationFilterEnabled(false);
                        setSearchQuery('');
                      }}
                      className="text-[10px] font-semibold text-emerald-300 hover:underline ml-2 shrink-0 cursor-pointer"
                    >
                      Turn off
                    </button>
                  </div>
                )}

                {/* Smooth Search Suggestions Dropdown */}
                {isSearchFocused && (
                  <div className="absolute left-0 right-0 top-12 bg-[#12141A]/95 backdrop-blur-2xl border border-white/12 rounded-2xl shadow-2xl overflow-hidden animate-slide-up-smooth z-50">
                    <div className="px-3.5 py-2 border-b border-white/[0.06] flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">
                        {searchQuery ? 'Matching Locations' : 'High-Demand Zones & Hotspots'}
                      </span>
                      <span className="text-[10px] text-[#F5C518] font-medium">Auto-filter trips</span>
                    </div>

                    <div className="max-h-[240px] overflow-y-auto scrollbar-none py-1 divide-y divide-white/[0.04]">
                      {filteredDestinations.map((place) => {
                        const Icon = place.icon;
                        return (
                          <button
                            key={place.id}
                            type="button"
                            onClick={() => handleSelectDestination(place)}
                            className="w-full px-3.5 py-2.5 flex items-center justify-between gap-3 text-left hover:bg-white/[0.06] active:bg-white/10 transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-[#F5C518] shrink-0 group-hover:bg-[#F5C518]/20 group-hover:border-[#F5C518]/40 transition-colors">
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-semibold text-white truncate group-hover:text-[#F5C518] transition-colors">
                                  {place.name}
                                </div>
                                <div className="text-[10px] text-white/40 truncate">
                                  {place.area} • {place.distance}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {place.surge && (
                                <span className="px-1.5 py-0.5 rounded-md bg-[#F5C518]/15 border border-[#F5C518]/30 text-[#F5C518] text-[9px] font-bold">
                                  {place.surge}
                                </span>
                              )}
                              <ChevronRight className="w-3.5 h-3.5 text-white/30 group-hover:text-white/70 transition-colors" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ═════════ LAYER 2: FLOATING RIGHT TACTICAL TOOLBAR ═════════ */}
            <div className="absolute right-3.5 top-[118px] z-20 flex flex-col bg-[#12141A]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-1 shadow-2xl gap-1 pointer-events-auto">
              {/* GPS Recenter */}
              <button
                type="button"
                onClick={handleRecenterMap}
                className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Recenter GPS Position"
              >
                <LocateFixed className="w-4 h-4" />
              </button>

              {/* Destination Filter Quick Pill */}
              <button
                type="button"
                onClick={() => {
                  const next = !destinationFilterEnabled;
                  setDestinationFilterEnabled(next);
                  if (!next) {
                    setActiveDestinationFilter(null);
                    setSearchQuery('');
                  } else if (!activeDestinationFilter) {
                    setIsSearchFocused(true);
                  }
                }}
                className={`w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-colors ${
                  destinationFilterEnabled
                    ? 'bg-[#F5C518] text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
                title={`Destination Filter: ${destinationFilterEnabled ? 'Active' : 'Off'}`}
              >
                <Compass className="w-4 h-4" />
              </button>

              {/* Auto-Accept Quick Pill */}
              <button
                type="button"
                onClick={() => setAutoAccept(!autoAccept)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-colors ${
                  autoAccept
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
                title={`Auto-Accept: ${autoAccept ? 'ON' : 'OFF'}`}
              >
                <Zap className="w-4 h-4" />
              </button>

              {/* Simulate Dispatch Quick Pill */}
              {!activeTrip && !incomingRequest && (
                <button
                  type="button"
                  onClick={handleSimulateNewRequest}
                  className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer text-[#F5C518] hover:bg-[#F5C518] hover:text-black transition-colors relative"
                  title="Simulate Dispatch Request"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* ═════════ LAYER 3: FLOATING HUD BOTTOM COCKPIT DRAWER ═════════ */}
            <div className="mt-auto relative z-30 pointer-events-auto px-3 pb-28 sm:pb-32">

              {/* ── STATE A: OFFLINE COCKPIT BOTTOM SHEET ── */}
              {!isOnline && !activeTrip && (
                <div className="cockpit-glass-elevated rounded-3xl p-4.5 space-y-3.5 shadow-2xl border border-white/10 animate-slide-up-smooth select-none">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-medium text-zinc-400 block whitespace-nowrap">Driver Console</span>
                      <h2 className="text-base font-semibold text-white whitespace-nowrap truncate">You're Offline</h2>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-white/5 text-zinc-400 text-[11px] font-medium border border-white/10 whitespace-nowrap shrink-0">
                      Resting
                    </span>
                  </div>

                  {/* 3-Stat Glanceable Bar */}
                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-white/[0.08]">
                    <div className="text-center min-w-0">
                      <span className="text-[10px] font-medium text-zinc-400 block whitespace-nowrap">Today's Earnings</span>
                      <span className="text-base font-semibold text-white tabular-nums block whitespace-nowrap">{formatRupees(todayEarnings, 0)}</span>
                    </div>
                    <div className="text-center border-x border-white/[0.08] min-w-0">
                      <span className="text-[10px] font-medium text-zinc-400 block whitespace-nowrap">Trips</span>
                      <span className="text-base font-semibold text-white tabular-nums block whitespace-nowrap">{completedTripsCount}</span>
                    </div>
                    <div className="text-center min-w-0">
                      <span className="text-[10px] font-medium text-zinc-400 block whitespace-nowrap">Online Hours</span>
                      <span className="text-base font-semibold text-white tabular-nums block whitespace-nowrap">{onlineHours}</span>
                    </div>
                  </div>

                  {/* Master Action Button */}
                  <button
                    type="button"
                    onClick={() => setIsOnline(true)}
                    className="w-full h-12 rounded-xl bg-[#F5C518] hover:bg-[#E5B510] text-black font-semibold text-xs tracking-normal shadow-md shadow-[#F5C518]/15 flex items-center justify-center gap-2 active:scale-[0.99] transition-all cursor-pointer whitespace-nowrap"
                  >
                    <Power className="w-4 h-4 stroke-[2.5] shrink-0" />
                    <span className="whitespace-nowrap">Go Online</span>
                  </button>
                </div>
              )}

              {/* Clean Map: No searching popup covering the map. The ride details popup appears ONLY when a ride request comes in below! */}

              {/* ── STATE B-INCOMPLETE: FLOATING INCOMPLETE TRIP RESUME HUD ── */}
              {isOnline && !activeTrip && !incomingRequest && incompleteTrips.length > 0 && (
                <div className="cockpit-glass-elevated rounded-3xl p-4 space-y-2.5 shadow-2xl border-2 border-[#fcd502]/70 bg-[#121824]/95 animate-slide-up-smooth mb-1 select-none">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#fcd502] animate-pulse shrink-0" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#fcd502] whitespace-nowrap truncate">
                        Incomplete Accepted Ride ({incompleteTrips.length})
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap shrink-0">
                      {incompleteTrips[0].pausedAt}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1 pr-2">
                      <h4 className="font-black text-sm text-white truncate whitespace-nowrap">{incompleteTrips[0].trip.customerName}</h4>
                      <span className="text-[11px] text-slate-300 block truncate whitespace-nowrap">
                        {incompleteTrips[0].tripStep === 'en_route' && 'Step 1: En Route to Pickup'}
                        {incompleteTrips[0].tripStep === 'arrived' && 'Step 2: Arrived & Inspection Required'}
                        {incompleteTrips[0].tripStep === 'trip_started' && 'Step 3: Ride in Progress'}
                      </span>
                    </div>
                    <span className="text-sm font-black text-[#fcd502] tabular-nums whitespace-nowrap shrink-0">
                      {formatRupees(incompleteTrips[0].trip.driverPayout)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleResumeTrip(incompleteTrips[0])}
                    className="w-full py-3.5 px-4 rounded-2xl bg-[#fcd502] hover:bg-[#eac500] text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-[#fcd502]/30 cursor-pointer active:scale-[0.98] transition-all whitespace-nowrap"
                  >
                    <Play className="w-4 h-4 fill-slate-950 stroke-none shrink-0" />
                    <span className="whitespace-nowrap truncate">
                      {incompleteTrips[0].tripStep === 'en_route' && 'Complete Step: Mark Arrived'}
                      {incompleteTrips[0].tripStep === 'arrived' && 'Complete Step: Inspect & Start'}
                      {incompleteTrips[0].tripStep === 'trip_started' && 'Complete Step: Finish & Collect'}
                    </span>
                    <ArrowRight className="w-4 h-4 stroke-[3] shrink-0" />
                  </button>
                </div>
              )}

              {/* ── STATE C: INCOMING DISPATCH HIGH-URGENCY SHEET ── */}
              {/* ── STATE C: INCOMING DISPATCH HIGH-URGENCY SHEET ── */}
              {incomingRequest && !activeTrip && (
                <div className="cockpit-glass-elevated rounded-3xl p-4.5 space-y-3 shadow-2xl border border-white/10 animate-slide-up-smooth select-none">
                  {/* Countdown Timer Header */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-medium text-[#F5C518] bg-[#F5C518]/10 border border-[#F5C518]/25 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F5C518] animate-pulse shrink-0" />
                        Incoming Ride Request
                      </span>
                      <span className={`text-xs font-medium tabular-nums whitespace-nowrap ${requestTimer <= 10 ? 'text-rose-400 font-semibold' : 'text-zinc-400'}`}>
                        {requestTimer}s remaining
                      </span>
                    </div>

                    {/* Timer progress bar */}
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ${requestTimer <= 10 ? 'bg-rose-500' : 'bg-[#F5C518]'}`}
                        style={{ width: `${(requestTimer / 30) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Customer Info & Net Payout Hero */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1 pr-2">
                      <h3 className="text-base font-semibold text-white whitespace-nowrap truncate">{incomingRequest.customerName}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium mt-0.5 whitespace-nowrap">
                        <span className="text-zinc-300 font-semibold shrink-0">
                          {incomingRequest.customerRating} ★
                        </span>
                        <span>•</span>
                        <span className="truncate">{incomingRequest.serviceType}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-2xl font-bold tracking-tight text-white tabular-nums block whitespace-nowrap">
                        {formatRupees(incomingRequest.driverPayout)}
                      </span>
                      <span className="text-[10px] font-medium text-zinc-400 block whitespace-nowrap">
                        Net Driver Payout
                      </span>
                    </div>
                  </div>

                  {/* Route Overview */}
                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.07] space-y-2 text-xs">
                    <div className="flex items-start gap-2.5">
                      <div className="flex flex-col items-center pt-1 shrink-0">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        <div className="w-0.5 h-6 bg-white/15 my-0.5" />
                        <div className="w-2 h-2 rounded-full bg-[#F5C518]" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="min-w-0">
                          <span className="text-[10px] font-medium text-zinc-400 block whitespace-nowrap">Pickup ({incomingRequest.distance})</span>
                          <span className="font-semibold text-white block truncate whitespace-nowrap">{incomingRequest.pickup}</span>
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-medium text-zinc-400 block whitespace-nowrap">Dropoff</span>
                          <span className="font-semibold text-white block truncate whitespace-nowrap">{incomingRequest.destination}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Decline / Accept Action Grid */}
                  <div className="grid grid-cols-3 gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={handleDeclineRequest}
                      className="h-11 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 font-medium text-xs cursor-pointer active:scale-95 transition-all whitespace-nowrap"
                    >
                      Decline
                    </button>
                    <button
                      type="button"
                      onClick={handleAcceptRequest}
                      className="col-span-2 h-11 rounded-xl bg-[#F5C518] hover:bg-[#E5B510] text-black font-semibold text-xs tracking-normal shadow-lg shadow-[#F5C518]/20 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                      <span className="whitespace-nowrap">Accept Ride</span>
                      <ArrowRight className="w-4 h-4 stroke-[2] shrink-0" />
                    </button>
                  </div>
                </div>
              )}

              {/* ── STATE D: ACTIVE TRIP PROGRESSION COCKPIT SHEET ── */}
              {activeTrip && (
                <div className="cockpit-glass-elevated rounded-3xl p-4 space-y-3 shadow-2xl border border-white/10 animate-slide-up-smooth select-none">
                  {/* Status Banner, Payout & X Cancel/Close Icon */}
                  <div className="flex items-start justify-between border-b border-white/[0.08] pb-2.5 gap-2">
                    <div className="min-w-0 flex-1 pr-2">
                      <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-full inline-block mb-1 whitespace-nowrap">
                        {tripStep === 'en_route' && 'En Route to Pickup'}
                        {tripStep === 'arrived' && 'Waiting for Passenger'}
                        {tripStep === 'trip_started' && 'Ride in Progress'}
                        {tripStep === 'completed' && 'Trip Completed'}
                      </span>
                      <h3 className="font-semibold text-sm text-white whitespace-nowrap truncate">{activeTrip.customerName}</h3>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <span className="text-base font-semibold text-white tabular-nums block whitespace-nowrap">
                          {formatRupees(activeTrip.driverPayout)}
                        </span>
                        <span className="text-[10px] font-medium text-zinc-400 whitespace-nowrap">Guaranteed</span>
                      </div>

                      {/* X Icon on Top Right Corner to cancel / move to incomplete in history */}
                      <button
                        type="button"
                        onClick={handlePauseOrCancelActiveTrip}
                        className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer active:scale-90 transition-all ml-1 border border-white/10 shrink-0"
                        title="Close & Move to Incomplete in Trips History"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* In-Trip Communication Shortcuts */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => alert(`Calling passenger ${activeTrip.customerName}...`)}
                      className="h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-200 text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all whitespace-nowrap"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="whitespace-nowrap">Call Passenger</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => alert(`Opening chat with ${activeTrip.customerName}...`)}
                      className="h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-200 text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all whitespace-nowrap"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#F5C518] shrink-0" />
                      <span className="whitespace-nowrap">Chat Message</span>
                    </button>
                  </div>

                  {/* Route Pickup / Dropoff Capsule */}
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                      <span className="text-[10px] text-zinc-400 whitespace-nowrap shrink-0">Pickup:</span>
                      <span className="font-semibold text-white truncate text-[11px] whitespace-nowrap flex-1 min-w-0">{activeTrip.pickup}</span>
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-[#F5C518] shrink-0" />
                      <span className="text-[10px] text-zinc-400 whitespace-nowrap shrink-0">Dropoff:</span>
                      <span className="font-semibold text-white truncate text-[11px] whitespace-nowrap flex-1 min-w-0">{activeTrip.destination}</span>
                    </div>
                  </div>

                  {/* Step Progression Buttons */}
                  <div className="pt-0.5">
                    {tripStep === 'en_route' && (
                      <button
                        type="button"
                        onClick={() => setTripStep('arrived')}
                        className="w-full h-12 rounded-xl bg-[#F5C518] hover:bg-[#E5B510] text-black font-semibold text-xs tracking-normal text-center shadow-md shadow-[#F5C518]/20 cursor-pointer transition-all active:scale-[0.99] whitespace-nowrap truncate"
                      >
                        Arrived at Pickup
                      </button>
                    )}

                    {tripStep === 'arrived' && (() => {
                      const isInspectionDone = Boolean(
                        vehicleInspectionData?.front &&
                        vehicleInspectionData?.rightSide &&
                        vehicleInspectionData?.back &&
                        vehicleInspectionData?.leftSide
                      );
                      const countTaken = vehicleInspectionData
                        ? [vehicleInspectionData.front, vehicleInspectionData.rightSide, vehicleInspectionData.back, vehicleInspectionData.leftSide].filter(Boolean).length
                        : 0;

                      return (
                        <div className="space-y-2">
                          {isInspectionDone ? (
                            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs gap-2">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <span className="font-semibold text-emerald-400 block text-xs whitespace-nowrap truncate">Condition Verified</span>
                                  <span className="text-[11px] text-white/50 block whitespace-nowrap truncate">4 angles &amp; {vehicleInspectionData?.defects.length || 0} defects documented</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setShowInspectionModal(true)}
                                className="text-xs font-medium text-white/80 bg-white/[0.06] hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 cursor-pointer whitespace-nowrap shrink-0 transition-colors"
                              >
                                Review
                              </button>
                            </div>
                          ) : (
                            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs gap-2">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <span className="font-semibold text-amber-200 text-xs block whitespace-nowrap truncate">Inspection Required</span>
                                  <span className="text-[11px] text-white/50 block whitespace-nowrap truncate">{countTaken}/4 angles photographed</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setShowInspectionModal(true)}
                                className="px-3 py-1.5 rounded-lg bg-[#F5C518] hover:bg-[#E5B510] text-black font-semibold text-xs cursor-pointer active:scale-95 transition-all whitespace-nowrap shrink-0"
                              >
                                Inspect
                              </button>
                            </div>
                          )}

                          {isInspectionDone ? (
                            <button
                              type="button"
                              onClick={() => handleConfirmStartTrip(vehicleInspectionData!)}
                              className="w-full h-12 px-4 rounded-xl bg-[#F5C518] hover:bg-[#E5B510] text-black font-semibold text-xs text-center shadow-md shadow-[#F5C518]/15 cursor-pointer transition-all active:scale-[0.98] flex items-center justify-center gap-2 whitespace-nowrap"
                            >
                              <CheckCircle2 className="w-4 h-4 stroke-[2.5] shrink-0" />
                              <span className="whitespace-nowrap">Start Trip</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setShowInspectionModal(true)}
                              className="w-full h-12 px-4 rounded-xl bg-white/[0.06] hover:bg-white/10 text-white/60 font-medium text-xs text-center cursor-pointer transition-all active:scale-[0.98] flex items-center justify-center gap-2 border border-white/[0.08] whitespace-nowrap"
                            >
                              <Lock className="w-4 h-4 text-[#F5C518] shrink-0" />
                              <span className="whitespace-nowrap">Take 4 Photos to Start ({countTaken}/4)</span>
                            </button>
                          )}
                        </div>
                      );
                    })()}

                    {tripStep === 'trip_started' && (
                      <div className="space-y-2">
                        {vehicleInspectionData && (
                          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs gap-2">
                            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 whitespace-nowrap truncate min-w-0">
                              <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> Condition Verified &amp; Saved
                            </span>
                            <button
                              type="button"
                              onClick={() => setShowInspectionModal(true)}
                              className="text-xs font-medium text-white/60 hover:text-white transition-colors whitespace-nowrap shrink-0"
                            >
                              View
                            </button>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={handleCompleteTrip}
                          className="w-full h-12 px-4 rounded-xl bg-[#F5C518] hover:bg-[#E5B510] text-black font-semibold text-xs text-center shadow-md shadow-[#F5C518]/15 cursor-pointer transition-all active:scale-[0.98] whitespace-nowrap"
                        >
                          Complete Ride &amp; Collect {formatRupees(activeTrip.driverPayout)}
                        </button>
                      </div>
                    )}

                    {tripStep === 'completed' && (
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2.5 select-none">
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                        <h4 className="font-semibold text-sm text-white whitespace-nowrap">Trip Completed</h4>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTrip(null);
                            setTripStep('en_route');
                          }}
                          className="h-10 px-5 rounded-xl bg-[#F5C518] hover:bg-[#E5B510] text-black font-semibold text-xs cursor-pointer active:scale-95 transition-all shadow-md shadow-[#F5C518]/15 whitespace-nowrap"
                        >
                          Ready for Next Ride
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* ═════════ LAYER 4: SLIDE-UP FULL SHEETS (EARNINGS, HISTORY, ACCOUNT) ═════════ */}

            {/* ── TAB 2: EARNINGS FULL SEPARATE PAGE ── */}
            {activeTab === 'earnings' && (
              <div className="absolute inset-0 z-40 bg-[#090A0D] text-white flex flex-col w-full h-full select-none overflow-hidden animate-fade-in font-sans">
                {/* Dedicated Page Header (Clean Minimal - Heading Only) */}
                <div className="px-5 py-3.5 flex items-center justify-between border-b border-white/[0.06] bg-[#090A0D] shrink-0">
                  <h2 className="font-semibold text-sm text-white tracking-tight whitespace-nowrap truncate">Earnings &amp; Payouts</h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium whitespace-nowrap shrink-0">
                    Live Sync
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-none pb-28 text-xs">
                  {/* Balance Hero Card */}
                  <div className="bg-[#12141A] border border-white/[0.07] p-5 rounded-2xl space-y-4">
                    <span className="text-xs font-medium text-white/50 block whitespace-nowrap">Total Available Balance</span>
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-3xl font-semibold tracking-tight text-white tabular-nums whitespace-nowrap">{formatRupees(todayEarnings)}</h3>
                      <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 whitespace-nowrap shrink-0">
                        +14.2% this week
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => alert(`Instant cashout of ${formatRupees(todayEarnings)} initiated to HDFC Bank ****4921`)}
                      className="w-full h-11 rounded-xl bg-[#F5C518] hover:bg-[#E5B510] text-black font-semibold text-xs shadow-md shadow-[#F5C518]/15 transition-all active:scale-[0.98] cursor-pointer text-center whitespace-nowrap"
                    >
                      Instant Cashout to Bank
                    </button>
                  </div>

                  {/* Weekly Goal Progress */}
                  <div className="bg-[#12141A] border border-white/[0.07] p-4 rounded-2xl space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white/60 font-medium whitespace-nowrap">Weekly Target</span>
                      <span className="text-white font-semibold whitespace-nowrap tabular-nums">₹25,000.00</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <div className="h-full bg-[#F5C518] rounded-full" style={{ width: '74%' }} />
                    </div>
                    <div className="flex justify-between text-[11px] text-white/40 font-normal">
                      <span className="whitespace-nowrap">₹18,450.00 earned</span>
                      <span className="text-emerald-400 font-medium whitespace-nowrap">74% achieved</span>
                    </div>
                  </div>

                  {/* Recent Payouts Feed */}
                  <div className="bg-[#12141A] border border-white/[0.07] p-4 rounded-2xl space-y-2.5">
                    <span className="text-xs font-medium text-white/50 block whitespace-nowrap">Recent Payouts</span>
                    <div className="space-y-2">
                      <div className="p-3 rounded-xl bg-[#171A22] border border-white/[0.05] flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <span className="font-medium text-white text-xs block truncate whitespace-nowrap">Marine Drive ➔ Cochin Airport (COK)</span>
                          <span className="text-[11px] text-white/40 font-normal block whitespace-nowrap">Today • Executive Sedan</span>
                        </div>
                        <span className="font-semibold text-emerald-400 text-xs tabular-nums whitespace-nowrap shrink-0">+₹1,250.00</span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#171A22] border border-white/[0.05] flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <span className="font-medium text-white text-xs block truncate whitespace-nowrap">Infopark Kakkanad ➔ Lulu Mall</span>
                          <span className="text-[11px] text-white/40 font-normal block whitespace-nowrap">Yesterday • Maybach Chauffeur</span>
                        </div>
                        <span className="font-semibold text-emerald-400 text-xs tabular-nums whitespace-nowrap shrink-0">+₹950.00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 3: TRIP HISTORY FULL SEPARATE PAGE ── */}
            {activeTab === 'history' && (
              <div className="absolute inset-0 z-40 bg-[#090A0D] text-white flex flex-col w-full h-full select-none overflow-hidden animate-fade-in font-sans">
                {/* Dedicated Page Header (Clean Minimal - Heading Only) */}
                <div className="px-5 py-3.5 flex items-center justify-between border-b border-white/[0.06] bg-[#090A0D] shrink-0">
                  <h2 className="font-semibold text-sm text-white tracking-tight whitespace-nowrap truncate">Trip History</h2>
                  <span className="px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/60 text-[10px] font-medium whitespace-nowrap shrink-0">
                    {completedTripsList.length} Total
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-none pb-28 text-xs">
                  {/* Incomplete / Active Trips Category */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-semibold text-white/70 flex items-center gap-2 whitespace-nowrap truncate">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${incompleteTrips.length > 0 ? 'bg-[#F5C518] animate-pulse' : 'bg-white/20'}`} />
                        Incomplete Trips ({incompleteTrips.length})
                      </span>
                      {incompleteTrips.length > 0 ? (
                        <span className="text-[10px] text-amber-300 font-medium bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 whitespace-nowrap shrink-0">
                          Pending Step
                        </span>
                      ) : (
                        <span className="text-[10px] text-white/40 font-normal whitespace-nowrap shrink-0">None</span>
                      )}
                    </div>

                    {incompleteTrips.length === 0 ? (
                      <div className="p-4 rounded-xl border border-white/[0.06] bg-[#12141A]/60 text-center space-y-1">
                        <Clock className="w-4 h-4 text-white/30 mx-auto" />
                        <span className="text-xs font-medium text-white/50 block whitespace-nowrap">No Incomplete Trips</span>
                        <span className="text-[11px] text-white/30 block whitespace-nowrap truncate">Accepted trips with pending steps appear here</span>
                      </div>
                    ) : (
                      incompleteTrips.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 rounded-2xl border border-white/[0.08] bg-[#12141A] space-y-3 relative overflow-hidden"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1 pr-2">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-sm text-white truncate whitespace-nowrap">{item.trip.customerName}</h4>
                                <span className="text-[10px] font-medium text-black bg-[#F5C518] px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
                                  {item.tripStep === 'en_route' ? 'Step 1' : item.tripStep === 'arrived' ? 'Step 2' : 'Step 3'}
                                </span>
                              </div>
                              <span className="text-xs text-white/60 block truncate mt-1 font-normal whitespace-nowrap">
                                {item.trip.pickup} ➔ {item.trip.destination}
                              </span>
                              <span className="text-[11px] text-white/40 font-normal mt-0.5 block whitespace-nowrap truncate">
                                Accepted {item.pausedAt} • {item.trip.serviceType}
                              </span>
                            </div>

                            <div className="text-right flex-shrink-0">
                              <span className="font-semibold text-[#F5C518] text-sm tabular-nums block whitespace-nowrap">
                                {formatRupees(item.trip.driverPayout)}
                              </span>
                              <span className="text-[10px] font-normal text-emerald-400 whitespace-nowrap">Guaranteed</span>
                            </div>
                          </div>

                          {/* Step Progression Visualizer */}
                          <div className="p-1.5 rounded-xl bg-[#171A22] border border-white/[0.05] grid grid-cols-3 gap-1 text-center text-[10px] font-medium">
                            <div className={`py-1 rounded-lg whitespace-nowrap truncate ${item.tripStep === 'en_route' ? 'bg-[#F5C518]/20 text-[#F5C518]' : 'bg-emerald-500/15 text-emerald-400'}`}>
                              1. En Route {item.tripStep !== 'en_route' && '✓'}
                            </div>
                            <div className={`py-1 rounded-lg whitespace-nowrap truncate ${item.tripStep === 'arrived' ? 'bg-[#F5C518]/20 text-[#F5C518]' : item.tripStep === 'trip_started' ? 'bg-emerald-500/15 text-emerald-400' : 'text-white/30'}`}>
                              2. Inspect {item.tripStep === 'trip_started' && '✓'}
                            </div>
                            <div className={`py-1 rounded-lg whitespace-nowrap truncate ${item.tripStep === 'trip_started' ? 'bg-[#F5C518]/20 text-[#F5C518]' : 'text-white/30'}`}>
                              3. In Transit
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 pt-1 border-t border-white/[0.06]">
                            <button
                              type="button"
                              onClick={() => handleResumeTrip(item)}
                              className="flex-1 h-10 px-3 rounded-xl bg-[#F5C518] hover:bg-[#E5B510] text-black font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#F5C518]/15 cursor-pointer active:scale-95 transition-all whitespace-nowrap truncate min-w-0"
                            >
                              <Play className="w-3.5 h-3.5 fill-black stroke-none shrink-0" />
                              <span className="whitespace-nowrap truncate">
                                {item.tripStep === 'en_route' && 'Arrive at Pickup'}
                                {item.tripStep === 'arrived' && 'Inspect & Start'}
                                {item.tripStep === 'trip_started' && 'Finish & Collect'}
                              </span>
                              <ArrowRight className="w-3.5 h-3.5 stroke-[2] shrink-0" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDiscardIncompleteTrip(item.id)}
                              className="h-10 px-3 rounded-xl bg-white/[0.06] hover:bg-rose-500/15 text-white/50 hover:text-rose-300 font-medium text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
                              title="Discard this trip"
                            >
                              Discard
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <span className="text-xs font-medium text-white/50 px-1 block whitespace-nowrap">Completed Trips</span>
                  {completedTripsList.map((item) => (
                    <div key={item.id} className="bg-[#12141A] border border-white/[0.07] p-3.5 rounded-2xl flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="font-medium text-white text-xs block truncate whitespace-nowrap">{item.customer}</span>
                        <span className="text-[11px] text-white/50 block truncate whitespace-nowrap">{item.route}</span>
                        <span className="text-[10px] text-white/40 font-normal mt-0.5 block whitespace-nowrap">{item.date} • {item.rating}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-semibold text-white text-xs tabular-nums block whitespace-nowrap">{item.fare}</span>
                        <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md whitespace-nowrap">
                          Completed
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── TAB 4: ACCOUNT / PROFILE FULL SEPARATE PAGE ── */}
            {activeTab === 'profile' && (
              <div className="absolute inset-0 z-40 bg-[#090A0D] text-white flex flex-col w-full h-full select-none overflow-hidden animate-fade-in font-sans">
                {isEditingProfile ? (
                  /* ── EDIT PROFILE SCREEN ── */
                  <>
                    <div className="px-5 py-3.5 flex items-center justify-between border-b border-white/[0.06] bg-[#090A0D] shrink-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(false)}
                          className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/10 text-white/70 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <h2 className="font-semibold text-sm text-white tracking-tight whitespace-nowrap truncate">Edit Profile</h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (!editFirstName.trim()) {
                            alert('First name is required');
                            return;
                          }
                          setDriverFirstName(editFirstName.trim());
                          setDriverLastName(editLastName.trim());
                          setDriverName(`${editFirstName.trim()} ${editLastName.trim()}`.trim());
                          setDriverPhonePrimary(editPhonePrimary.trim());
                          setDriverPhoneEmergency(editPhoneEmergency.trim());
                          setDriverProfileEmail(editEmail.trim());
                          setIsEditingProfile(false);
                        }}
                        className="px-3 py-1 rounded-lg bg-[#F5C518] hover:bg-[#E5B510] text-black font-semibold text-xs transition-all active:scale-95 cursor-pointer shadow-xs whitespace-nowrap"
                      >
                        Save
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-none pb-28 text-xs">
                      {/* Driver Avatar Header */}
                      <div className="bg-[#12141A] border border-white/[0.07] p-3.5 rounded-2xl flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img
                            src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80"
                            alt={driverName}
                            className="w-13 h-13 rounded-xl object-cover border border-white/10"
                          />
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#F5C518] text-black flex items-center justify-center shadow-xs">
                            <Camera className="w-2.5 h-2.5" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-xs text-white block truncate">{driverName}</span>
                          <p className="text-[11px] text-white/40 font-normal">Commercial Chauffeur Partner</p>
                          <span className="text-[10px] text-emerald-400 font-medium mt-0.5 inline-block">KMVD Badge Active ✓</span>
                        </div>
                      </div>

                      {/* Edit Fields Form */}
                      <div className="bg-[#12141A] border border-white/[0.07] p-4 rounded-2xl space-y-3">
                        {/* First Name / Username */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-white/50 block">First Name / Username</label>
                          <input
                            type="text"
                            value={editFirstName}
                            onChange={(e) => setEditFirstName(e.target.value)}
                            placeholder="First Name"
                            className="w-full h-10 px-3 rounded-xl bg-[#171A22] border border-white/[0.08] text-xs font-normal text-white placeholder:text-white/30 focus:outline-none focus:border-[#F5C518]/60 transition-colors"
                          />
                        </div>

                        {/* Last Name */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-white/50 block">Last Name</label>
                          <input
                            type="text"
                            value={editLastName}
                            onChange={(e) => setEditLastName(e.target.value)}
                            placeholder="Last Name"
                            className="w-full h-10 px-3 rounded-xl bg-[#171A22] border border-white/[0.08] text-xs font-normal text-white placeholder:text-white/30 focus:outline-none focus:border-[#F5C518]/60 transition-colors"
                          />
                        </div>

                        {/* Phone Number 1 (Contact No) */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-white/50 flex items-center justify-between">
                            <span>Phone Number 1 (Contact No)</span>
                            <span className="text-emerald-400 text-[10px] font-medium">Primary</span>
                          </label>
                          <div className="relative">
                            <Phone className="w-3.5 h-3.5 text-white/40 absolute left-3 top-3.5" />
                            <input
                              type="tel"
                              value={editPhonePrimary}
                              onChange={(e) => setEditPhonePrimary(e.target.value)}
                              placeholder="+91 98470 12345"
                              className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#171A22] border border-white/[0.08] text-xs font-normal text-white placeholder:text-white/30 focus:outline-none focus:border-[#F5C518]/60 transition-colors"
                            />
                          </div>
                        </div>

                        {/* Phone Number 2 (Emergency Contact No) */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-white/50 flex items-center justify-between">
                            <span>Phone Number 2 (Emergency Contact No)</span>
                            <span className="text-amber-300 text-[10px] font-medium">SOS Linked</span>
                          </label>
                          <div className="relative">
                            <Phone className="w-3.5 h-3.5 text-amber-400/80 absolute left-3 top-3.5" />
                            <input
                              type="tel"
                              value={editPhoneEmergency}
                              onChange={(e) => setEditPhoneEmergency(e.target.value)}
                              placeholder="+91 98470 54321"
                              className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#171A22] border border-white/[0.08] text-xs font-normal text-white placeholder:text-white/30 focus:outline-none focus:border-[#F5C518]/60 transition-colors"
                            />
                          </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-white/50 block">Email Address</label>
                          <div className="relative">
                            <Mail className="w-3.5 h-3.5 text-white/40 absolute left-3 top-3.5" />
                            <input
                              type="email"
                              value={editEmail}
                              onChange={(e) => setEditEmail(e.target.value)}
                              placeholder="marcus.vance@ridingo.com"
                              className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#171A22] border border-white/[0.08] text-xs font-normal text-white placeholder:text-white/30 focus:outline-none focus:border-[#F5C518]/60 transition-colors"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons: Cancel and Save */}
                      <div className="grid grid-cols-2 gap-2.5 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(false)}
                          className="w-full h-11 rounded-xl bg-white/[0.06] hover:bg-white/10 text-white/70 font-medium text-xs text-center cursor-pointer transition-colors border border-white/[0.08] active:scale-[0.98]"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!editFirstName.trim()) {
                              alert('First name is required');
                              return;
                            }
                            setDriverFirstName(editFirstName.trim());
                            setDriverLastName(editLastName.trim());
                            setDriverName(`${editFirstName.trim()} ${editLastName.trim()}`.trim());
                            setDriverPhonePrimary(editPhonePrimary.trim());
                            setDriverPhoneEmergency(editPhoneEmergency.trim());
                            setDriverProfileEmail(editEmail.trim());
                            setIsEditingProfile(false);
                          }}
                          className="w-full h-11 rounded-xl bg-[#F5C518] hover:bg-[#E5B510] text-black font-semibold text-xs text-center cursor-pointer transition-all active:scale-[0.98] shadow-md shadow-[#F5C518]/15"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  /* ── MAIN PROFILE OVERVIEW SCREEN ── */
                  <>
                    <div className="px-5 py-3.5 flex items-center justify-between border-b border-white/[0.06] bg-[#090A0D] shrink-0">
                      <h2 className="font-semibold text-sm text-white tracking-tight whitespace-nowrap truncate">Driver Account</h2>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium whitespace-nowrap shrink-0">
                        Verified
                      </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-none pb-28 text-xs">
                      {/* Driver Profile Card with Edit Profile button at bottom */}
                      <div className="bg-[#12141A] border border-white/[0.07] p-4 rounded-2xl space-y-3">
                        <div className="flex items-center gap-3">
                          <img
                            src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80"
                            alt={driverName}
                            className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm text-white whitespace-nowrap truncate">{driverName}</h3>
                            <p className="text-xs text-white/50 font-normal whitespace-nowrap truncate">Executive Partner Chauffeur</p>
                            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium mt-0.5 whitespace-nowrap truncate">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span className="whitespace-nowrap">Verified Chauffeur • 4.96 ★</span>
                            </div>
                          </div>
                        </div>

                        {/* Edit button placed at bottom of title card */}
                        <div className="pt-2 border-t border-white/[0.06]">
                          <button
                            type="button"
                            onClick={() => {
                              setEditFirstName(driverFirstName);
                              setEditLastName(driverLastName);
                              setEditPhonePrimary(driverPhonePrimary);
                              setEditPhoneEmergency(driverPhoneEmergency);
                              setEditEmail(driverProfileEmail);
                              setIsEditingProfile(true);
                            }}
                            className="w-full h-9 rounded-xl bg-[#171A22] hover:bg-white/[0.08] text-white/90 border border-white/[0.08] font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-[0.98]"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#F5C518]" />
                            <span>Edit Profile</span>
                          </button>
                        </div>
                      </div>

                      {/* Documents & Verification Status */}
                      <div className="bg-[#12141A] border border-white/[0.07] p-4 rounded-2xl space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-white/50">Documents &amp; Verification</span>
                          <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            All Active ✓
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          <div className="p-2.5 rounded-xl bg-[#171A22] border border-white/[0.04] flex items-center justify-between">
                            <div>
                              <span className="font-medium text-white text-xs block">Commercial Chauffeur Badge</span>
                              <span className="text-[11px] text-white/40">KMVD-CHAUF-2024-8841</span>
                            </div>
                            <span className="text-[10px] text-emerald-400 font-medium">Verified</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-[#171A22] border border-white/[0.04] flex items-center justify-between">
                            <div>
                              <span className="font-medium text-white text-xs block">Commercial Driving License</span>
                              <span className="text-[11px] text-white/40">KL-07-20180009214 • Exp 2029</span>
                            </div>
                            <span className="text-[10px] text-emerald-400 font-medium">Valid</span>
                          </div>
                        </div>
                      </div>

                      {/* Bank Account & Payout Method */}
                      <div className="bg-[#12141A] border border-white/[0.07] p-4 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-white/50">Direct Payout Account</span>
                          <span className="text-[10px] font-medium text-white/40">Default</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#171A22] border border-white/[0.04] flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <span className="font-medium text-white text-xs block truncate">HDFC Bank Limited</span>
                            <span className="text-[11px] text-white/40 font-mono">•••• 4921 • Primary Direct Deposit</span>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
                            Connected
                          </span>
                        </div>
                      </div>

                      {/* Safety & Emergency Support */}
                      <div className="bg-[#12141A] border border-white/[0.07] p-4 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-white/50">Safety &amp; Support</span>
                          <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            24/7 Active
                          </span>
                        </div>

                        {/* Quick Action SOS & Helpline Grid */}
                        <div className="grid grid-cols-2 gap-2">
                          <a
                            href="tel:+918000123456"
                            className="p-2.5 rounded-xl bg-[#171A22] hover:bg-white/[0.06] border border-white/[0.05] text-left transition-colors cursor-pointer block"
                          >
                            <Phone className="w-3.5 h-3.5 text-[#F5C518] mb-1" />
                            <span className="font-medium text-white text-xs block whitespace-nowrap truncate">Chauffeur Support</span>
                            <span className="text-[10px] text-white/40 block whitespace-nowrap truncate">Toll-Free Helpline</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => alert(`Emergency SOS Triggered:\nAlerting Police (112) & Emergency Contacts:\n• Primary Contact: ${driverPhonePrimary}\n• Emergency Contact: ${driverPhoneEmergency}`)}
                            className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 text-left transition-colors cursor-pointer"
                          >
                            <Shield className="w-3.5 h-3.5 text-rose-400 mb-1" />
                            <span className="font-medium text-rose-300 text-xs block whitespace-nowrap truncate">Emergency SOS</span>
                            <span className="text-[10px] text-rose-400/80 block whitespace-nowrap truncate">Police &amp; Contacts</span>
                          </button>
                        </div>

                        {/* Official Ridingo Support Contact & Email */}
                        <div className="pt-2 border-t border-white/[0.05] space-y-2">
                          {/* Ridingo Contact Phone */}
                          <a
                            href="tel:+918000123456"
                            className="p-2.5 rounded-xl bg-[#171A22] hover:bg-white/[0.06] border border-white/[0.04] flex items-center justify-between gap-2 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <div className="w-7 h-7 rounded-lg bg-[#F5C518]/15 text-[#F5C518] flex items-center justify-center shrink-0">
                                <Phone className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="text-[10px] text-white/50 block font-normal whitespace-nowrap truncate">Ridingo Support Contact No</span>
                                <span className="text-xs font-medium text-white block font-mono whitespace-nowrap truncate">+91 800 012 3456</span>
                              </div>
                            </div>
                            <span className="text-[10px] font-medium text-[#F5C518] bg-[#F5C518]/10 px-2 py-0.5 rounded-md border border-[#F5C518]/20 shrink-0">
                              Call
                            </span>
                          </a>

                          {/* Ridingo Support Email */}
                          <a
                            href="mailto:support@ridingo.com"
                            className="p-2.5 rounded-xl bg-[#171A22] hover:bg-white/[0.06] border border-white/[0.04] flex items-center justify-between gap-2 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                                <Mail className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="text-[10px] text-white/50 block font-normal whitespace-nowrap truncate">Ridingo Support Email</span>
                                <span className="text-xs font-medium text-white block whitespace-nowrap truncate">support@ridingo.com</span>
                              </div>
                            </div>
                            <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 shrink-0">
                              Email
                            </span>
                          </a>
                        </div>
                      </div>

                      {/* App Preferences */}
                      <div className="bg-[#12141A] border border-white/[0.07] p-4 rounded-2xl space-y-2.5">
                        <span className="text-xs font-medium text-white/50 block">Preferences</span>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between py-1 text-xs">
                            <span className="text-white/80 font-normal">App Language</span>
                            <span className="text-white/50 font-medium">English (India)</span>
                          </div>
                          <div className="flex items-center justify-between py-1 text-xs border-t border-white/[0.04]">
                            <span className="text-white/80 font-normal">Audio Alerts &amp; Chimes</span>
                            <span className="text-emerald-400 font-medium">Enabled</span>
                          </div>
                        </div>
                      </div>

                      {/* Legal & Policies: Terms & Conditions and Privacy Policy */}
                      <div className="bg-[#12141A] border border-white/[0.07] p-4 rounded-2xl space-y-1.5">
                        <span className="text-xs font-medium text-white/50 block">Legal &amp; Policies</span>
                        <button
                          type="button"
                          onClick={() => setShowLegalModal('terms')}
                          className="w-full py-2 flex items-center justify-between text-xs text-white/80 hover:text-white transition-colors cursor-pointer border-b border-white/[0.04]"
                        >
                          <span className="flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-white/40" />
                            <span>Terms &amp; Conditions</span>
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-white/40" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowLegalModal('privacy')}
                          className="w-full py-2 flex items-center justify-between text-xs text-white/80 hover:text-white transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <Shield className="w-3.5 h-3.5 text-white/40" />
                            <span>Privacy Policy</span>
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-white/40" />
                        </button>
                      </div>

                      {/* Log Out */}
                      <button
                        type="button"
                        onClick={() => setIsAuthenticated(false)}
                        className="w-full h-11 rounded-xl bg-[#171A22] hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 font-medium text-xs text-center cursor-pointer transition-colors border border-white/[0.07] whitespace-nowrap"
                      >
                        Log Out of Driver Console
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ═════════ LAYER 5: FLOATING MINIMAL BOTTOM COMMAND DOCK (TRANSPARENT BACKGROUND & ELEVATED) ═════════ */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-[340px] pointer-events-auto">
              <nav className="backdrop-blur-2xl bg-black/40 border border-white/10 rounded-full p-1.5 shadow-2xl flex items-center justify-between">
                {navTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.id);
                        if (tab.id !== 'profile') {
                          setIsEditingProfile(false);
                        }
                      }}
                      className={`relative flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-full transition-all duration-200 cursor-pointer select-none ${
                        isActive
                          ? 'bg-[#F5C518] text-black font-semibold shadow-sm flex-1 min-w-0'
                          : 'text-white/60 hover:text-white hover:bg-white/[0.06] font-medium px-3'
                      }`}
                      aria-label={tab.label}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
                      {isActive && (
                        <span className="text-xs font-semibold tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                          {tab.label}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* ═════════ FINTECH PAYMENT SLIP MODAL ═════════ */}
            {showPaymentSlipModal && (activeTrip || completedTripData) && (
              <div className={`absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity duration-200 ${
                isClosingPaymentSlip ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}>
                <div className="bg-[#12141A] rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-white/[0.08] text-white space-y-4 animate-slide-up-smooth font-sans">
                  {/* Slip Header */}
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-medium tracking-normal text-[#F5C518] block whitespace-nowrap">Ridingo Digital Receipt</span>
                      <h3 className="font-semibold text-sm text-white whitespace-nowrap truncate">Payment Collection Slip</h3>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-[#171A22] text-white/50 font-mono text-[10px] font-medium border border-white/10 whitespace-nowrap shrink-0">
                      #SLIP-8841
                    </span>
                  </div>

                  {/* Summary */}
                  <div className="bg-[#171A22] p-3 rounded-xl border border-white/[0.06] space-y-1.5 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-white/50 font-normal whitespace-nowrap">Passenger</span>
                      <span className="font-medium text-white whitespace-nowrap truncate">{(activeTrip || completedTripData)?.customerName}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-white/50 font-normal whitespace-nowrap">Service</span>
                      <span className="font-medium text-white whitespace-nowrap truncate">{(activeTrip || completedTripData)?.serviceType}</span>
                    </div>
                    {vehicleInspectionData && (
                      <div className="flex items-center justify-between pt-1 border-t border-white/[0.06] gap-2">
                        <span className="text-white/50 font-normal whitespace-nowrap">Vehicle Condition</span>
                        <span className="font-medium text-emerald-400 flex items-center gap-1 text-[11px] whitespace-nowrap shrink-0">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          Documented
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Breakdown */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-white/60">
                      <span className="whitespace-nowrap">Base Ride Fare</span>
                      <span className="font-medium text-white tabular-nums whitespace-nowrap">{formatRupees((((activeTrip || completedTripData)?.totalFare || 1450) * 0.75))}</span>
                    </div>
                    <div className="flex justify-between text-white/60">
                      <span className="whitespace-nowrap">Distance &amp; Toll</span>
                      <span className="font-medium text-white tabular-nums whitespace-nowrap">{formatRupees((((activeTrip || completedTripData)?.totalFare || 1450) * 0.25))}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-white/[0.06] text-xs">
                      <span className="font-medium text-white/80 whitespace-nowrap">Total Due</span>
                      <span className="text-base font-semibold text-white tabular-nums whitespace-nowrap">
                        {formatRupees((activeTrip || completedTripData)?.totalFare || 1450)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg font-medium border border-emerald-500/20">
                      <span className="whitespace-nowrap">Net Driver Payout</span>
                      <span className="tabular-nums whitespace-nowrap">{formatRupees((activeTrip || completedTripData)?.driverPayout || 1160)}</span>
                    </div>
                  </div>

                  {/* QR Code Container */}
                  <div className="bg-[#171A22] border border-white/[0.06] text-white p-3.5 rounded-xl text-center space-y-2">
                    <span className="text-[10px] font-medium text-white/50 block whitespace-nowrap truncate">Scan to Pay via UPI (PhonePe / GPay / Paytm / BHIM)</span>
                    <div className="bg-white p-2 rounded-xl inline-block shadow-sm">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=upi://pay?pa=ridingo@upi%26pn=RidingoChauffeur%26am=${(activeTrip || completedTripData)?.totalFare || 1450}%26cu=INR`}
                        alt="Payment QR"
                        className="w-28 h-28 mx-auto object-contain"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-1">
                    {!isPaymentCollected ? (
                      <button
                        type="button"
                        onClick={() => {
                          setIsPaymentCollected(true);
                          setTimeout(() => {
                            handleClosePaymentSlipModal();
                          }, 900);
                        }}
                        className="w-full h-11 rounded-xl bg-[#F5C518] hover:bg-[#E5B510] text-black font-semibold text-xs shadow-md shadow-[#F5C518]/15 transition-all active:scale-[0.98] cursor-pointer text-center whitespace-nowrap truncate"
                      >
                        Mark Payment Collected ({formatRupees((activeTrip || completedTripData)?.totalFare || 1450)})
                      </button>
                    ) : (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center font-medium text-xs flex items-center justify-center gap-1.5 whitespace-nowrap">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="whitespace-nowrap">Payment Verified! Closing...</span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleClosePaymentSlipModal}
                      className="w-full h-9 rounded-xl bg-white/[0.06] hover:bg-white/10 text-white/60 font-medium text-xs transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Done &amp; Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ═════════ NOTIFICATIONS DRAWER ═════════ */}
            {showNotificationsModal && (
              <div className="absolute inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs transition-opacity duration-200 select-none">
                <div className="absolute inset-0" onClick={() => setShowNotificationsModal(false)} />

                <div className="relative w-[320px] max-w-full h-full bg-[#12141A] text-white shadow-2xl flex flex-col z-10 animate-slide-up-smooth border-l border-white/[0.07] font-sans">
                  {/* Header */}
                  <div className="px-4 py-4 bg-[#090A0D] border-b border-white/[0.06] flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-white whitespace-nowrap">Notifications</h3>
                      {notificationsList.filter(n => n.unread).length > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-[#F5C518] text-black text-[10px] font-semibold whitespace-nowrap">
                          {notificationsList.filter(n => n.unread).length}
                        </span>
                      )}
                    </div>

                    {notificationsList.length === 0 ? (
                      <span className="text-[11px] font-normal text-white/30 whitespace-nowrap">All clear</span>
                    ) : (
                      <button
                        type="button"
                        disabled={isClearingNotifications}
                        onClick={handleMarkAllReadAndClear}
                        className={`text-xs font-medium text-[#F5C518] hover:underline cursor-pointer whitespace-nowrap transition-opacity ${
                          isClearingNotifications ? 'opacity-50 pointer-events-none' : ''
                        }`}
                      >
                        {isClearingNotifications ? 'Clearing...' : 'Mark all read'}
                      </button>
                    )}
                  </div>

                  {/* List Container with Drop-Right Animation & Clean Empty State */}
                  <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-2 scrollbar-none relative flex flex-col">
                    {notificationsList.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 my-auto animate-fade-in">
                        <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#F5C518] mb-3 shadow-inner">
                          <CheckCheck className="w-6 h-6 text-[#F5C518]" />
                        </div>
                        <h4 className="font-semibold text-sm text-white">All caught up</h4>
                        <p className="text-xs text-white/40 max-w-[200px] leading-relaxed mt-1">
                          All notifications marked as read and cleared.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setNotificationsList(INITIAL_DRIVER_NOTIFICATIONS);
                            setUnreadNotificationsCount(2);
                          }}
                          className="mt-4 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/10 border border-white/10 text-[11px] font-medium text-white/70 hover:text-white transition-colors cursor-pointer"
                        >
                          Restore sample alerts
                        </button>
                      </div>
                    ) : (
                      notificationsList.map((item, index) => {
                        const Icon = item.icon || Bell;
                        const isExiting = isClearingNotifications || clearingNotificationIds.includes(item.id);

                        return (
                          <div
                            key={item.id}
                            style={{
                              transitionProperty: 'transform, opacity',
                              transitionDuration: '340ms',
                              transitionTimingFunction: 'cubic-bezier(0.2, 0.9, 0.3, 1)',
                              transitionDelay: isClearingNotifications ? `${index * 60}ms` : '0ms',
                            }}
                            className={`group relative rounded-xl p-3 flex items-start gap-2.5 transition-all transform-gpu will-change-transform ${
                              isExiting
                                ? 'translate-x-[120%] translate-y-4 rotate-3 opacity-0 pointer-events-none'
                                : 'translate-x-0 translate-y-0 rotate-0 opacity-100'
                            } ${
                              item.unread ? 'border border-white/15 bg-[#171A22]' : 'bg-[#171A22]/50 border border-white/[0.04]'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              item.type === 'driver' ? 'bg-[#F5C518]/15 text-[#F5C518]' :
                              item.type === 'booking' ? 'bg-emerald-500/15 text-emerald-400' :
                              'bg-amber-500/15 text-[#F5C518]'
                            }`}>
                              <Icon className="w-3.5 h-3.5" />
                            </div>

                            <div className="flex-1 min-w-0 pr-2">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="font-medium text-xs text-white truncate whitespace-nowrap">{item.title}</h4>
                                <span className="text-[10px] text-white/40 font-normal whitespace-nowrap shrink-0">{item.time}</span>
                              </div>
                              <p className="text-[11px] text-white/50 mt-0.5 leading-relaxed font-normal truncate whitespace-nowrap">
                                {item.desc}
                              </p>
                            </div>

                            {/* Dismiss single notification button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDismissNotification(item.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100 p-1 text-white/30 hover:text-white transition-opacity shrink-0 cursor-pointer"
                              title="Dismiss"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Close button */}
                  <div className="p-3 bg-transparent flex justify-center pb-6 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowNotificationsModal(false)}
                      className="w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/10 border border-white/10 text-white/70 flex items-center justify-center transition-all active:scale-90 cursor-pointer shadow-sm"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ═════════ PRE-TRIP VEHICLE CONDITION INSPECTION MODAL ═════════ */}
            <VehicleInspectionModal
              isOpen={showInspectionModal}
              initialData={vehicleInspectionData}
              onClose={() => setShowInspectionModal(false)}
              onConfirmAndStartTrip={handleConfirmStartTrip}
              vehicleName="2024 Mercedes-Maybach S-Class"
              customerName={activeTrip?.customerName || 'Passenger'}
            />

            {/* ═════════ TERMS & CONDITIONS / PRIVACY POLICY MODAL ═════════ */}
            {showLegalModal && (
              <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity duration-200">
                <div className="bg-[#12141A] rounded-2xl max-w-sm w-full max-h-[80vh] flex flex-col shadow-2xl border border-white/[0.08] text-white animate-slide-up-smooth font-sans overflow-hidden">
                  {/* Header */}
                  <div className="px-5 py-3.5 bg-[#090A0D] border-b border-white/[0.06] flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#F5C518]" />
                      <h3 className="font-semibold text-sm text-white whitespace-nowrap">
                        {showLegalModal === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowLegalModal(null)}
                      className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/10 text-white/60 flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-none text-xs text-white/70 leading-relaxed">
                    {showLegalModal === 'terms' ? (
                      <>
                        <p className="font-semibold text-white text-xs">Ridingo Partner Chauffeur Master Agreement</p>
                        <p>1. <strong className="text-white">Commercial Compliance</strong>: As an accredited Ridingo Executive Chauffeur, you agree to maintain all standards required by the Kerala Motor Vehicles Department (KMVD), including valid badge, commercial driver license, and valid vehicle insurance.</p>
                        <p>2. <strong className="text-white">Fair Payouts &amp; Dispatches</strong>: 80% net trip revenue is credited directly to your connected bank account weekly or via instant cashout. No arbitrary platform commissions or unfair deduction penalties.</p>
                        <p>3. <strong className="text-white">Pre-Trip Inspections</strong>: The 4-angle vehicle condition photographic proof recorded prior to passenger onboarding serves as legally binding dispute protection.</p>
                        <p>4. <strong className="text-white">Chauffeur Conduct &amp; Safety</strong>: Uncompromising passenger safety, discreet customer confidentiality, and complete adherence to road traffic safety regulations are mandatory at all times.</p>
                      </>
                    ) : (
                      <>
                        <p className="font-semibold text-white text-xs">Ridingo Driver Privacy &amp; Data Telemetry Policy</p>
                        <p>1. <strong className="text-white">Telemetry &amp; GPS</strong>: Live location coordinates are transmitted exclusively when your status is 'Online' or while fulfilling an active trip dispatch to provide accurate route navigation and passenger ETA.</p>
                        <p>2. <strong className="text-white">Emergency Contacts &amp; SOS</strong>: Contact numbers saved in your profile (Primary Contact &amp; Emergency SOS) are encrypted and accessed strictly during SOS triggers or emergency dispatch calls.</p>
                        <p>3. <strong className="text-white">Financial Data Protection</strong>: Bank payout account credentials and IFSC numbers are processed through RBI-authorized payment gateways with AES-256 bank-grade encryption.</p>
                      </>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-3 bg-[#090A0D] border-t border-white/[0.06] shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowLegalModal(null)}
                      className="w-full h-10 rounded-xl bg-[#F5C518] hover:bg-[#E5B510] text-black font-semibold text-xs transition-all active:scale-[0.98] cursor-pointer"
                    >
                      I Understand &amp; Agree
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
