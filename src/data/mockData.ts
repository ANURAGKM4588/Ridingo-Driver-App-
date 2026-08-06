import { ServiceItem, VehicleOption, DriverProfile, Promotion, WalletTransaction, NotificationItem, Booking } from '../types';

export const MOCK_SERVICES: ServiceItem[] = [
  {
    id: 'hourly-driver',
    title: 'Hourly Driver',
    subtitle: 'Flexible per-hour chauffeur for errands or meetings',
    priceStarting: '$15 / hr',
    iconName: 'Clock',
    badge: 'Most Popular',
    popular: true,
    category: 'hourly'
  },
  {
    id: 'airport-pickup',
    title: 'Airport Pickup Driver',
    subtitle: 'Punctual terminal pickup & smooth transfer in your car',
    priceStarting: '$45 flat',
    iconName: 'PlaneTakeoff',
    badge: 'Flight Tracking',
    category: 'special'
  },
  {
    id: 'wedding-chauffeur',
    title: 'Wedding Chauffeur',
    subtitle: 'Elite uniform-attired driver for luxury bridal cars',
    priceStarting: '$120 / day',
    iconName: 'Sparkles',
    badge: 'VIP White Glove',
    category: 'special'
  },
  {
    id: 'office-drop',
    title: 'Office Drop & Pick',
    subtitle: 'Daily commute driver so you can work during transit',
    priceStarting: '$28 / ride',
    iconName: 'Briefcase',
    category: 'daily'
  },
  {
    id: 'school-drop',
    title: 'School Drop Driver',
    subtitle: 'Vetted, high-security drivers for family & kids',
    priceStarting: '$20 / ride',
    iconName: 'GraduationCap',
    badge: 'Extra Vetted',
    category: 'daily'
  },
  {
    id: 'night-party',
    title: 'Night Party Driver',
    subtitle: 'Safe designated driver after evening drinks & galas',
    priceStarting: '$35 flat',
    iconName: 'Wine',
    badge: '24/7 Available',
    popular: true,
    category: 'hourly'
  },
  {
    id: 'family-tour',
    title: 'Family Tour Driver',
    subtitle: 'Full-day relaxed city & sight-seeing chauffeur',
    priceStarting: '$95 / 8 hrs',
    iconName: 'Compass',
    category: 'daily'
  },
  {
    id: 'corporate-travel',
    title: 'Corporate Travel',
    subtitle: 'Dedicated executive driver for business delegates',
    priceStarting: '$150 / day',
    iconName: 'Building2',
    category: 'special'
  },
  {
    id: 'outstation-driver',
    title: 'Outstation Driver',
    subtitle: 'Highway-certified driver for long distance trips',
    priceStarting: '$80 / day + stay',
    iconName: 'MapPin',
    badge: 'Highway Specialist',
    category: 'outstation'
  }
];

export const MOCK_VEHICLES: VehicleOption[] = [
  {
    id: 'sedan',
    name: 'Sedan',
    category: 'Personal Car',
    capacity: '4 Passengers',
    transmission: 'Automatic',
    badge: 'Comfort',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=600&q=80',
    sampleModels: 'BMW 3 Series, Honda Accord, Camry',
    tagline: 'Smooth & quiet city cruise'
  },
  {
    id: 'suv',
    name: 'SUV',
    category: 'Personal Car',
    capacity: '6-7 Passengers',
    transmission: 'Automatic',
    badge: 'High Clearance',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80',
    sampleModels: 'Audi Q7, Porsche Cayenne, Fortuner',
    tagline: 'Spacious for family & highway travel'
  },
  {
    id: 'hatchback',
    name: 'Hatchback',
    category: 'Personal Car',
    capacity: '4 Passengers',
    transmission: 'Manual',
    badge: 'Compact',
    image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=600&q=80',
    sampleModels: 'VW Golf, Hyundai i20, Mini Cooper',
    tagline: 'Easy city parking & tight lanes'
  },
  {
    id: 'luxury',
    name: 'Luxury Chauffeur',
    category: 'High-End Car',
    capacity: '4 Passengers',
    transmission: 'Automatic',
    badge: 'Ultra Premium',
    image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80',
    sampleModels: 'Mercedes Maybach, Porsche Panamera',
    tagline: 'White-glove executive treatment'
  },
  {
    id: 'ev',
    name: 'Electric Vehicle (EV)',
    category: 'Green Drive',
    capacity: '5 Passengers',
    transmission: 'Electric',
    badge: 'Eco Smart',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80',
    sampleModels: 'Tesla Model S, Porsche Taycan, Ioniq 5',
    tagline: 'Instant torque & regenerative brake trained'
  },
  {
    id: 'van',
    name: 'Luxury Van',
    category: 'Group Transit',
    capacity: '8-10 Passengers',
    transmission: 'Automatic',
    badge: 'Group VIP',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
    sampleModels: 'Toyota Vellfire, Mercedes V-Class',
    tagline: 'Reclining lounge comfort on wheels'
  }
];

export const FEATURED_DRIVER: DriverProfile = {
  id: 'drv-889',
  name: 'Marcus Vance',
  photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=500&q=80',
  rating: 4.98,
  totalTrips: 1420,
  yearsExperience: 9,
  languages: ['English (Native)', 'German (Fluent)', 'French'],
  verifiedBadge: true,
  backgroundChecked: true,
  uniformAvailable: true,
  certifications: [
    'RIDINGO Master Chauffeur Certified',
    'Advanced EV & Defensive Driving',
    'VIP First Aid & Security Protocol'
  ],
  phone: '+1 (555) 392-8810',
  bio: 'Professional executive chauffeur with 9 years of experience driving luxury sedans, supercars, and high-performance electric vehicles. Dedicated to safety, discretion, and effortless comfort.',
  carHandledTypes: ['Sedan', 'SUV', 'Luxury', 'EV', 'Van'],
  reviewsCount: 384
};

export const PROMOTIONS: Promotion[] = [
  {
    id: 'promo-1',
    title: 'Airport Package',
    description: 'Complimentary flight tracking & 30 min free wait time',
    code: 'AIRPORTVIP',
    discountTag: '20% OFF',
    bgGradient: 'from-black to-zinc-900',
    validUntil: 'Valid till Aug 31',
    imageBg: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'promo-2',
    title: 'Weekend Family Tour',
    description: 'Book 6 hours, get 2 hours free driver allowance',
    code: 'WEEKENDPLUS',
    discountTag: '2 HRS FREE',
    bgGradient: 'from-lime-950 to-zinc-950',
    validUntil: 'Valid on Sat & Sun',
    imageBg: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'promo-3',
    title: 'Wedding White Glove Offer',
    description: 'Full tuxedo uniform chauffeur with champagne concierge',
    code: 'ROYALWEDDING',
    discountTag: 'VIP SPECIAL',
    bgGradient: 'from-emerald-950 to-zinc-900',
    validUntil: 'Limited Edition',
    imageBg: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'promo-4',
    title: 'Corporate Membership',
    description: 'Unlimited priority driver dispatch with monthly invoicing',
    code: 'CORPEXEC',
    discountTag: 'FLAT $50 CREDITS',
    bgGradient: 'from-slate-900 to-black',
    validUntil: 'Business Pass',
    imageBg: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'
  }
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'bk-901',
    bookingNumber: 'RDG-2026-8831',
    serviceId: 'hourly-driver',
    serviceTitle: 'Hourly Driver (4 Hours)',
    pickupLocation: '742 Evergreen Terrace, Beverly Hills',
    destinationLocation: 'Financial District & Grand Hyatt',
    date: 'Today, 2:30 PM',
    time: '2:30 PM',
    durationHours: 4,
    vehicle: MOCK_VEHICLES[0], // Sedan
    driver: FEATURED_DRIVER,
    driverPreferences: {
      language: 'English',
      uniformRequired: true,
      nonSmokingRequired: true,
      seniorDriverOnly: true,
      femaleDriverPreferred: false,
      specialInstructions: 'Please pull car around front driveway'
    },
    status: 'in-progress',
    priceTotal: 68.00,
    priceBreakdown: {
      baseFare: 60.00,
      safetyInsurance: 3.50,
      serviceFee: 4.50
    },
    paymentMethod: 'Apple Pay',
    createdDate: '2026-08-04'
  },
  {
    id: 'bk-902',
    bookingNumber: 'RDG-2026-7712',
    serviceId: 'airport-pickup',
    serviceTitle: 'Airport Pickup Chauffeur',
    pickupLocation: 'Terminal 4, LAX International Airport',
    destinationLocation: 'Bel Air Estates Residence',
    date: 'Tomorrow, 08:15 AM',
    time: '08:15 AM',
    durationHours: 2,
    vehicle: MOCK_VEHICLES[1], // SUV
    driverPreferences: {
      language: 'English',
      uniformRequired: true,
      nonSmokingRequired: true,
      seniorDriverOnly: false,
      femaleDriverPreferred: false
    },
    status: 'upcoming',
    priceTotal: 52.50,
    priceBreakdown: {
      baseFare: 45.00,
      safetyInsurance: 3.50,
      serviceFee: 4.00
    },
    paymentMethod: 'RIDINGO Wallet',
    createdDate: '2026-08-03'
  },
  {
    id: 'bk-900',
    bookingNumber: 'RDG-2026-6490',
    serviceId: 'night-party',
    serviceTitle: 'Night Party Designated Driver',
    pickupLocation: 'SoHo House Downtown',
    destinationLocation: '742 Evergreen Terrace',
    date: 'Aug 02, 2026',
    time: '11:45 PM',
    durationHours: 3,
    vehicle: MOCK_VEHICLES[3], // Luxury
    driver: {
      ...FEATURED_DRIVER,
      id: 'drv-402',
      name: 'Elena Rostova',
      rating: 4.99,
      yearsExperience: 7,
      phone: '+1 (555) 819-2049'
    },
    driverPreferences: {
      language: 'English',
      uniformRequired: false,
      nonSmokingRequired: true,
      seniorDriverOnly: false,
      femaleDriverPreferred: true
    },
    status: 'completed',
    priceTotal: 45.00,
    priceBreakdown: {
      baseFare: 38.00,
      safetyInsurance: 3.50,
      serviceFee: 3.50
    },
    paymentMethod: 'Visa ending in 4921',
    createdDate: '2026-08-02'
  }
];

export const MOCK_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'tx-101',
    title: 'Hourly Chauffeur Service',
    date: 'Aug 05, 2026 • 11:30 AM',
    amount: 68.00,
    type: 'debit',
    status: 'completed',
    method: 'Apple Pay',
    bookingId: 'bk-901'
  },
  {
    id: 'tx-102',
    title: 'Wallet Top Up via Apple Pay',
    date: 'Aug 04, 2026 • 09:15 AM',
    amount: 250.00,
    type: 'credit',
    status: 'completed',
    method: 'Apple Pay'
  },
  {
    id: 'tx-103',
    title: '30% Advance Deposit Refund',
    date: 'Aug 02, 2026 • 06:40 PM',
    amount: 42.50,
    type: 'credit',
    status: 'completed',
    method: 'Instant Refund'
  },
  {
    id: 'tx-104',
    title: 'Airport Transfer - Terminal Pickup',
    date: 'Jul 30, 2026 • 02:15 PM',
    amount: 85.00,
    type: 'debit',
    status: 'completed',
    method: 'RIDINGO Wallet',
    bookingId: 'bk-899'
  },
  {
    id: 'tx-105',
    title: 'Corporate VIP Referral Cashback',
    date: 'Jul 29, 2026 • 04:00 PM',
    amount: 35.00,
    type: 'credit',
    status: 'completed',
    method: 'Bonus Promo'
  },
  {
    id: 'tx-106',
    title: 'Night Party Designated Driver',
    date: 'Jul 26, 2026 • 11:45 PM',
    amount: 45.00,
    type: 'debit',
    status: 'completed',
    method: 'RIDINGO Wallet',
    bookingId: 'bk-900'
  },
  {
    id: 'tx-107',
    title: 'Wedding Luxury Fleet Chauffeur',
    date: 'Jul 22, 2026 • 01:00 PM',
    amount: 180.00,
    type: 'debit',
    status: 'completed',
    method: 'Visa •••• 4921'
  },
  {
    id: 'tx-108',
    title: 'Auto-Reload Deposit Top Up',
    date: 'Jul 20, 2026 • 10:00 AM',
    amount: 300.00,
    type: 'credit',
    status: 'completed',
    method: 'UPI / GPay'
  },
  {
    id: 'tx-109',
    title: 'Outstation Full-Day Driver',
    date: 'Jul 15, 2026 • 08:30 AM',
    amount: 140.00,
    type: 'debit',
    status: 'completed',
    method: 'Mastercard •••• 8810'
  },
  {
    id: 'tx-110',
    title: 'Weekend Special Rider Bonus',
    date: 'Jul 10, 2026 • 05:20 PM',
    amount: 25.00,
    type: 'credit',
    status: 'completed',
    method: 'Reward Cashback'
  },
  {
    id: 'tx-111',
    title: 'Office Daily Commute Chauffeur',
    date: 'Jul 05, 2026 • 09:00 AM',
    amount: 55.00,
    type: 'debit',
    status: 'completed',
    method: 'RIDINGO Wallet'
  },
  {
    id: 'tx-112',
    title: 'Initial Welcome Bonus Credit',
    date: 'Jul 01, 2026 • 12:00 PM',
    amount: 50.00,
    type: 'credit',
    status: 'completed',
    method: 'System Bonus'
  }
];

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'nt-1',
    title: 'Driver Arrived at Pickup',
    description: 'Marcus Vance in RIDINGO uniform is waiting outside your address.',
    timestamp: '2 mins ago',
    read: false,
    type: 'driver',
    icon: 'Car'
  },
  {
    id: 'nt-2',
    title: 'Booking Confirmed #RDG-2026-8831',
    description: 'Your 4-Hour driver service for your Sedan has been locked in.',
    timestamp: '15 mins ago',
    read: false,
    type: 'booking',
    icon: 'CheckCircle2'
  },
  {
    id: 'nt-3',
    title: '$35 Cashback Unlocked!',
    description: 'Your weekend family tour booking reward has been credited to your wallet.',
    timestamp: 'Yesterday',
    read: true,
    type: 'offer',
    icon: 'Sparkles'
  },
  {
    id: 'nt-4',
    title: 'Payment Successful',
    description: '$68.00 processed seamlessly via Apple Pay.',
    timestamp: '2 days ago',
    read: true,
    type: 'payment',
    icon: 'ShieldCheck'
  }
];
