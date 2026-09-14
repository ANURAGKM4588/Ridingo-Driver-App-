import { ServiceItem, VehicleOption, DriverProfile, Promotion, WalletTransaction, NotificationItem, Booking } from '../types';

export const MOCK_SERVICES: ServiceItem[] = [
  {
    id: 'hourly-driver',
    title: 'Hourly Driver',
    subtitle: 'Flexible per-hour chauffeur for errands or meetings',
    priceStarting: '₹199 / hr',
    iconName: 'Clock',
    badge: 'Most Popular',
    popular: true,
    category: 'hourly'
  },
  {
    id: 'airport-pickup',
    title: 'Airport Pickup Driver',
    subtitle: 'Punctual terminal pickup & smooth transfer in your car',
    priceStarting: '₹649 flat',
    iconName: 'PlaneTakeoff',
    badge: 'Flight Tracking',
    category: 'special'
  },
  {
    id: 'wedding-chauffeur',
    title: 'Wedding Chauffeur',
    subtitle: 'Elite uniform-attired driver for luxury bridal cars',
    priceStarting: '₹1,899 / day',
    iconName: 'Sparkles',
    badge: 'VIP White Glove',
    category: 'special'
  },
  {
    id: 'office-drop',
    title: 'Office Drop & Pick',
    subtitle: 'Daily commute driver so you can work during transit',
    priceStarting: '₹349 / ride',
    iconName: 'Briefcase',
    category: 'daily'
  },
  {
    id: 'school-drop',
    title: 'School Drop Driver',
    subtitle: 'Vetted, high-security drivers for family & kids',
    priceStarting: '₹249 / ride',
    iconName: 'GraduationCap',
    badge: 'Extra Vetted',
    category: 'daily'
  },
  {
    id: 'night-party',
    title: 'Night Party Driver',
    subtitle: 'Safe designated driver after evening drinks & galas',
    priceStarting: '₹499 flat',
    iconName: 'Wine',
    badge: '24/7 Available',
    popular: true,
    category: 'hourly'
  },
  {
    id: 'family-tour',
    title: 'Family Tour Driver',
    subtitle: 'Full-day relaxed city & sight-seeing chauffeur',
    priceStarting: '₹1,499 / 8 hrs',
    iconName: 'Compass',
    category: 'daily'
  },
  {
    id: 'corporate-travel',
    title: 'Corporate Travel',
    subtitle: 'Dedicated executive driver for business delegates',
    priceStarting: '₹2,200 / day',
    iconName: 'Building2',
    category: 'special'
  },
  {
    id: 'outstation-driver',
    title: 'Outstation Driver',
    subtitle: 'Highway-certified driver for long distance trips',
    priceStarting: '₹1,200 / day + stay',
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
    discountTag: 'FLAT ₹500 CREDITS',
    bgGradient: 'from-slate-900 to-black',
    validUntil: 'Business Pass',
    imageBg: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'
  }
];

export const MOCK_BOOKINGS: Booking[] = [];

export const MOCK_TRANSACTIONS: WalletTransaction[] = [];

export const MOCK_NOTIFICATIONS: NotificationItem[] = [];
