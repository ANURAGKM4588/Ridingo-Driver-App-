export type TabType = 'home' | 'bookings' | 'activity' | 'wallet' | 'profile';

export interface ServiceItem {
  id: string;
  title: string;
  subtitle: string;
  priceStarting: string;
  iconName: string;
  badge?: string;
  popular?: boolean;
  category: 'hourly' | 'daily' | 'outstation' | 'special';
}

export interface VehicleOption {
  id: string;
  name: string;
  category: string;
  capacity: string;
  transmission: 'Automatic' | 'Manual' | 'Electric';
  badge?: string;
  image: string;
  sampleModels: string;
  tagline: string;
}

export interface DriverProfile {
  id: string;
  name: string;
  photo: string;
  rating: number;
  totalTrips: number;
  yearsExperience: number;
  languages: string[];
  verifiedBadge: boolean;
  backgroundChecked: boolean;
  uniformAvailable: boolean;
  certifications: string[];
  phone: string;
  bio: string;
  carHandledTypes: string[];
  reviewsCount: number;
}

export interface DriverPreferences {
  language: string;
  uniformRequired: boolean;
  nonSmokingRequired: boolean;
  seniorDriverOnly: boolean;
  femaleDriverPreferred: boolean;
  specialInstructions?: string;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  serviceId: string;
  serviceTitle: string;
  pickupLocation: string;
  destinationLocation: string;
  date: string;
  time: string;
  durationHours: number;
  vehicle: VehicleOption;
  driver?: DriverProfile;
  driverPreferences: DriverPreferences;
  status: 'pending_approval' | 'upcoming' | 'in-progress' | 'completed' | 'cancelled';
  priceTotal: number;
  priceBreakdown: {
    baseFare: number;
    safetyInsurance: number;
    serviceFee: number;
    discount?: number;
  };
  paymentMethod: string;
  createdDate: string;
  serviceType?: 'Hourly' | 'Airport' | 'Other' | 'Outstation' | 'Daily';
  flightNumber?: string;
  airlineName?: string;
  tripCause?: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  code: string;
  discountTag: string;
  bgGradient: string;
  validUntil: string;
  imageBg: string;
}

export interface WalletTransaction {
  id: string;
  title: string;
  date: string;
  amount: number;
  type: 'credit' | 'debit';
  status: 'completed' | 'pending';
  method: string;
  bookingId?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  type: 'booking' | 'driver' | 'offer' | 'payment';
  icon: string;
}
