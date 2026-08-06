import React, { useState } from 'react';
import { Search, Star, MapPin, RotateCcw, ChevronRight } from 'lucide-react';
import { Booking, ServiceItem, VehicleOption } from '../types';
import { MOCK_BOOKINGS, MOCK_VEHICLES, PROMOTIONS, FEATURED_DRIVER } from '../data/mockData';
import { QuickBookingWidget } from '../components/QuickBookingWidget';
import { PromotionsCarousel } from '../components/PromotionsCarousel';
import { BrandReviews } from '../components/BrandReviews';
import { WhyChooseUs } from '../components/WhyChooseUs';
import { LanguageCode, TRANSLATIONS } from '../data/translations';
import { RegionCode, formatPrice } from '../data/currencies';

interface HomeViewProps {
  onSelectService: (service: ServiceItem) => void;
  onSelectVehicle: (vehicle: VehicleOption) => void;
  selectedVehicle: VehicleOption;
  onStartBooking: (params: any) => void;
  onOpenDriverProfile: (driver: any) => void;
  recentBookings?: Booking[];
  recentBooking?: Booking;
  onViewAllBookings?: () => void;
  onRepeatBooking?: (booking: Booking) => void;
  currentLanguage?: LanguageCode;
  currentRegion?: RegionCode;
  userName?: string;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onSelectVehicle,
  selectedVehicle,
  onStartBooking,
  onOpenDriverProfile,
  recentBookings,
  recentBooking,
  onViewAllBookings,
  onRepeatBooking,
  currentLanguage = 'en-us',
  currentRegion = 'in',
  userName = 'Alexander Vance',
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS['en-us'];
  const firstName = userName ? userName.trim().split(' ')[0] : 'Alexander';
  const [searchQuery, setSearchQuery] = useState('');
  const recentBookingList = (recentBookings && recentBookings.length > 0) ? recentBookings : MOCK_BOOKINGS;

  return (
    <div className="w-full animate-fade-in animate-scale-up transition-all duration-500 pb-4">

      {/* Greeting — 2-line clean typography matching reference design */}
      <div className="-mx-4 px-5 pt-2 pb-3 bg-white animate-drop-up stagger-1">
        <h1 className="text-[26px] sm:text-[28px] font-medium text-slate-900 leading-[1.15] tracking-tight">
          <span className="block">Good</span>
          <span className="block">afternoon, {firstName} 💪</span>
        </h1>
      </div>

      {/* Search Bar — sticky top-0 */}
      <div className="sticky top-0 z-40 bg-white -mx-4 px-4 py-2.5 border-b border-slate-200 shadow-sm animate-drop-up stagger-2">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-[#fcd502]" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-900 font-bold placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-[#fcd502] transition-all text-xs"
          />
        </div>
      </div>

      {/* ── SCROLLABLE CONTENT ─── */}
      <div className="space-y-4 pt-4">
        {/* Quick Booking Floating Widget */}
        <div className="animate-drop-up stagger-3">
          <QuickBookingWidget
            onStartBooking={onStartBooking}
            vehicles={MOCK_VEHICLES}
            selectedVehicle={selectedVehicle}
            onOpenVehicleModal={() => { }}
            currentLanguage={currentLanguage}
          />
        </div>

        {/* Horizontal Scrollable Recent Bookings Section */}
        {recentBookingList.length > 0 && (
          <div className="space-y-3 animate-drop-up stagger-4">
            <div className="flex items-center justify-between px-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#fcd502] animate-pulse flex-shrink-0" />
                <h3 className="font-extrabold text-sm text-slate-900">Recent Bookings</h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black">
                  {recentBookingList.length}
                </span>
              </div>

              {onViewAllBookings && (
                <button
                  onClick={onViewAllBookings}
                  className="text-[11px] font-bold text-[#a18200] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Horizontal Scroll Track */}
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1 pt-0.5 snap-x snap-mandatory -mx-4 px-4 scroll-pl-4">
              {recentBookingList.map((booking) => (
                <div
                  key={booking.id}
                  className="w-[285px] sm:w-[320px] flex-shrink-0 snap-start bg-white rounded-3xl p-4 border border-slate-200/90 shadow-md space-y-2.5 relative overflow-hidden transition-transform hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-mono text-[10px] font-extrabold text-slate-400">
                      #{booking.bookingNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[10px] font-black uppercase">
                      {booking.date}
                    </span>
                  </div>

                  <h4 className="font-black text-xs text-slate-900 truncate">
                    {booking.serviceTitle}
                  </h4>

                  <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/60">
                    <div className="flex items-start gap-1.5 min-w-0">
                      <MapPin className="w-3.5 h-3.5 text-[#fcd502] fill-[#fcd502]/25 stroke-[2] flex-shrink-0 mt-0.5" />
                      <span className="font-medium text-slate-800 truncate text-[11px]">{booking.pickupLocation}</span>
                    </div>
                    <div className="flex items-start gap-1.5 min-w-0">
                      <MapPin className="w-3.5 h-3.5 text-slate-900 fill-slate-900/20 stroke-[2] flex-shrink-0 mt-0.5" />
                      <span className="font-medium text-slate-800 truncate text-[11px]">{booking.destinationLocation}</span>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-xs">
                    <span className="font-black text-slate-900">${booking.priceTotal.toFixed(2)}</span>

                    {onRepeatBooking && (
                      <button
                        onClick={() => onRepeatBooking(booking)}
                        className="px-3 py-1.5 rounded-xl bg-[#121212] hover:bg-black text-[#fcd502] font-extrabold text-[11px] flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3 stroke-[2.2]" />
                        <span>Repeat</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Spotlight Master Chauffeur */}
        <div className="glass-card rounded-3xl p-4 border border-slate-200 bg-gradient-to-r from-slate-900 via-zinc-900 to-[#121212] text-white shadow-xl relative overflow-hidden group animate-drop-up stagger-5">
          <div className="flex items-center justify-between mb-2.5">
            <span className="px-2.5 py-0.5 rounded-full bg-[#fcd502] text-[#121212] text-[10px] font-black uppercase tracking-wider">
              Spotlight Chauffeur
            </span>
            <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-current" /> {FEATURED_DRIVER.rating} (384)
            </div>
          </div>

          <div className="flex items-center gap-3">
            <img
              src={FEATURED_DRIVER.photo}
              alt={FEATURED_DRIVER.name}
              className="w-14 h-14 rounded-2xl object-cover border border-[#fcd502] shadow-md group-hover:scale-105 transition-transform flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-extrabold text-sm text-white truncate">{FEATURED_DRIVER.name}</h4>
              <p className="text-[11px] text-slate-300 font-medium truncate mt-0.5">
                {FEATURED_DRIVER.yearsExperience} Yrs Exp • Uniformed • Certified
              </p>
              <button
                onClick={() => onOpenDriverProfile(FEATURED_DRIVER)}
                className="mt-1.5 text-[11px] text-[#fcd502] font-bold hover:underline flex items-center gap-1"
              >
                View Chauffeur Profile →
              </button>
            </div>
          </div>
        </div>

        {/* Promotions Carousel */}
        <div className="animate-drop-up stagger-6">
          <PromotionsCarousel
            promotions={PROMOTIONS}
            onClaimPromotion={(promo) => {
              alert(`Applied promo code ${promo.code} to your next booking!`);
            }}
          />
        </div>

        {/* Verified User Reviews & Rating Badges */}
        <div className="animate-drop-up stagger-6">
          <BrandReviews />
        </div>

        {/* Why Choose Us */}
        <div className="animate-drop-up stagger-6">
          <WhyChooseUs />
        </div>
      </div>
    </div>
  );
};
