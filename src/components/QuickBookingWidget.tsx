import React, { useState } from 'react';
import { MapPin, Navigation, Calendar, Clock, ArrowRight, Car, Shield, Plane, Building2, Plus, Minus, Sparkles, ChevronDown, ArrowUpDown } from 'lucide-react';
import { VehicleOption } from '../types';
import { LanguageCode, TRANSLATIONS } from '../data/translations';
import { LocationAutocomplete, LocationSuggestion } from './LocationAutocomplete';

const TRIP_PURPOSES = [
  { id: 'wedding', label: 'Wedding function', emoji: '💒' },
  { id: 'family', label: 'Family tour', emoji: '👨‍👩‍👧‍👦' },
  { id: 'office_drop', label: 'Office Drop / Pick', emoji: '🏢' },
  { id: 'office_trip', label: 'Office trip / Corporate', emoji: '💼' },
  { id: 'hospital', label: 'Hospital Visit', emoji: '🏥' },
];

interface QuickBookingWidgetProps {
  onStartBooking: (params: {
    pickup: string;
    destination: string;
    pickupLatLng?: { lat: number; lng: number };
    destinationLatLng?: { lat: number; lng: number };
    date: string;
    time: string;
    durationHours: number;
    vehicleId: string;
    flightNumber?: string;
    airlineName?: string;
    serviceType?: string;
    tripCause?: string;
  }) => void;
  vehicles: VehicleOption[];
  selectedVehicle: VehicleOption;
  onOpenVehicleModal: () => void;
  currentLanguage?: LanguageCode;
}

export const QuickBookingWidget: React.FC<QuickBookingWidgetProps> = ({
  onStartBooking,
  selectedVehicle,
  onOpenVehicleModal,
  currentLanguage = 'en-us',
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS['en-us'];
  const [selectedServiceTab, setSelectedServiceTab] = useState<'Hourly' | 'Airport' | 'Other'>('Hourly');
  const [pickup, setPickup] = useState('');
  const [pickupLatLng, setPickupLatLng] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [destination, setDestination] = useState('');
  const [destinationLatLng, setDestinationLatLng] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [flightNumber, setFlightNumber] = useState('');
  const [airlineName, setAirlineName] = useState('');
  const [tripCause, setTripCause] = useState<string>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('14:30');
  const [durationHours, setDurationHours] = useState(4);

  const handleSwapLocations = () => {
    const tempPickup = pickup;
    const tempPickupLatLng = pickupLatLng;
    setPickup(destination);
    setPickupLatLng(destinationLatLng);
    setDestination(tempPickup);
    setDestinationLatLng(tempPickupLatLng);
  };

  const handleServiceTabChange = (tab: 'Hourly' | 'Airport' | 'Other') => {
    setSelectedServiceTab(tab);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartBooking({
      pickup: selectedServiceTab === 'Airport' ? (flightNumber ? `Flight ${flightNumber}` : 'Airport Pickup') : pickup,
      destination: selectedServiceTab === 'Airport' ? (airlineName ? `Airline: ${airlineName}` : 'Airport Terminal') : destination,
      pickupLatLng,
      destinationLatLng,
      date,
      time,
      durationHours,
      vehicleId: selectedVehicle.id,
      flightNumber,
      airlineName,
      serviceType: selectedServiceTab,
      tripCause: selectedServiceTab === 'Other' ? tripCause : undefined,
    });
  };

  return (
    <div className="w-full bg-white rounded-[28px] p-5 sm:p-6 relative overflow-visible z-20 border border-slate-200/90 shadow-xl space-y-4">
      {/* Service Selection Tabs (Hourly, Airport, Other) */}
      <div className="p-1.5 bg-slate-100 rounded-2xl flex items-center gap-1 border border-slate-200/60 shadow-inner">
        {(['Hourly', 'Airport', 'Other'] as const).map((tab) => {
          const isActive = selectedServiceTab === tab;
          const label = tab === 'Hourly' ? t.tabHourly : tab === 'Airport' ? t.tabAirport : t.tabOther;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => handleServiceTabChange(tab)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-[#121212] text-[#fcd502] shadow-md scale-[1.01]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Dynamic Inputs based on Service Tab */}
        {selectedServiceTab === 'Airport' ? (
          <div className="space-y-3">
            {/* Flight Number */}
            <div className="relative flex items-center bg-slate-50 rounded-2xl px-4 py-3 border border-slate-200/80 focus-within:border-[#fcd502] focus-within:bg-white transition-all">
              <div className="w-8 h-8 rounded-xl bg-[#121212] flex items-center justify-center text-[#fcd502] shadow-xs mr-3 flex-shrink-0">
                <Plane className="w-4 h-4 text-[#fcd502] stroke-[2]" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-0.5">{t.flightNoLabel}</label>
                <input
                  type="text"
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value)}
                  placeholder="Enter Flight Number (e.g. AI-202)"
                  className="w-full text-xs font-extrabold text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-400/60 truncate"
                  required
                />
              </div>
            </div>

            {/* Airline Name */}
            <div className="relative flex items-center bg-slate-50 rounded-2xl px-4 py-3 border border-slate-200/80 focus-within:border-[#fcd502] focus-within:bg-white transition-all">
              <div className="w-8 h-8 rounded-xl bg-[#121212] flex items-center justify-center text-white shadow-xs mr-3 flex-shrink-0">
                <Building2 className="w-4 h-4 text-[#fcd502] stroke-[2]" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-0.5">{t.airlineLabel}</label>
                <input
                  type="text"
                  value={airlineName}
                  onChange={(e) => setAirlineName(e.target.value)}
                  placeholder="Enter Airline Name (e.g. Air India)"
                  className="w-full text-xs font-extrabold text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-400/60 truncate"
                  required
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 relative">
            <div className="absolute left-[19px] top-[28px] bottom-[28px] w-[1.5px] border-l-2 border-dashed border-slate-300 z-10 pointer-events-none" />

            {/* Pickup */}
            <div className="relative z-30">
              <LocationAutocomplete
                label={t.pickupLabel}
                placeholder="Your pickup location"
                value={pickup}
                onChange={(val, suggestion?: LocationSuggestion) => {
                  setPickup(val);
                  if (suggestion) setPickupLatLng({ lat: suggestion.lat, lng: suggestion.lng });
                }}
                icon="pickup"
              />
            </div>

            {/* Destination with Swap Button */}
            <div className="relative z-20">
              {/* Right Action Column Swap Button */}
              <div className="absolute right-3.5 top-[14px] -translate-y-1/2 z-40 pointer-events-auto">
                <button
                  type="button"
                  onClick={handleSwapLocations}
                  className="group relative w-7 h-7 rounded-full bg-[#121212] hover:bg-black text-[#fcd502] flex items-center justify-center shadow-md border border-[#fcd502]/40 active:scale-90 transition-all duration-300 cursor-pointer ring-4 ring-white"
                  title="Swap Pickup & Destination"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 stroke-[2] group-hover:rotate-180 transition-transform duration-300 text-[#fcd502]" />
                </button>
              </div>

              <LocationAutocomplete
                label={t.destinationLabel}
                placeholder="Your destination"
                value={destination}
                onChange={(val, suggestion?: LocationSuggestion) => {
                  setDestination(val);
                  if (suggestion) setDestinationLatLng({ lat: suggestion.lat, lng: suggestion.lng });
                }}
                icon="destination"
              />
            </div>

            {/* Cause of the Trip Dropdown (Renders when 'Other' tab is selected) */}
            {selectedServiceTab === 'Other' && (
              <div className="relative flex items-center bg-white rounded-2xl px-4 py-2.5 border border-slate-200 shadow-xs focus-within:border-[#fcd502] transition-all">
                <div className="flex-1 min-w-0">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-0.5">
                    {t.tripCauseLabel}
                  </label>
                  <div className="relative">
                    <select
                      value={tripCause}
                      onChange={(e) => setTripCause(e.target.value)}
                      className={`w-full text-xs bg-transparent appearance-none focus:outline-none pr-5 cursor-pointer truncate transition-all ${
                        !tripCause ? 'text-slate-400/60 font-medium' : 'text-slate-900 font-extrabold'
                      }`}
                    >
                      <option value="" disabled hidden>
                        Select your cause
                      </option>
                      {TRIP_PURPOSES.map((p) => (
                        <option key={p.id} value={p.label} className="text-slate-900 font-bold">
                          {p.emoji} {p.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Date & Time Selection Section */}
        <div className="space-y-3 pt-1">
          {/* Quick Date Presets */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setDate(new Date().toISOString().split('T')[0])}
              className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer flex-shrink-0 ${
                date === new Date().toISOString().split('T')[0]
                  ? 'bg-[#121212] text-[#fcd502] shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Today
            </button>

            <button
              type="button"
              onClick={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                setDate(tomorrow.toISOString().split('T')[0]);
              }}
              className="px-3.5 py-1.5 rounded-full text-xs font-black bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer flex-shrink-0"
            >
              Tomorrow
            </button>

            <button
              type="button"
              onClick={() => {
                const now = new Date();
                setTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
              }}
              className="px-3.5 py-1.5 rounded-full text-xs font-black bg-slate-100 hover:bg-slate-200 text-slate-900 transition-all flex items-center gap-1 cursor-pointer flex-shrink-0"
            >
              <Sparkles className="w-3 h-3 text-[#121212]" />
              <span>Leave Now</span>
            </button>
          </div>

          {/* Date & Time Input Cards */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Date Card */}
            <div className="relative bg-slate-50 hover:bg-white rounded-2xl p-3 border border-slate-200/80 hover:border-[#fcd502] focus-within:border-[#fcd502] focus-within:bg-white transition-all flex flex-col justify-between group">
              <label className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-slate-700" />
                <span>Date</span>
              </label>
              <div className="relative mt-1 flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 truncate">
                  {date || 'Select Date'}
                </span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                />
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 pointer-events-none flex-shrink-0" />
              </div>
            </div>

            {/* Time Card */}
            <div className="relative bg-slate-50 hover:bg-white rounded-2xl p-3 border border-slate-200/80 hover:border-[#fcd502] focus-within:border-[#fcd502] focus-within:bg-white transition-all flex flex-col justify-between group">
              <label className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                <Clock className="w-3.5 h-3.5 text-slate-700" />
                <span>Time</span>
              </label>
              <div className="relative mt-1 flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 truncate">
                  {time || 'Select Time'}
                </span>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                />
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 pointer-events-none flex-shrink-0" />
              </div>
            </div>
          </div>

          {/* Duration Selector (Hourly Mode Only) */}
          {selectedServiceTab === 'Hourly' && (
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-700" />
                <span className="text-xs font-black text-slate-900">Duration: {durationHours} {durationHours === 1 ? 'hr' : 'hrs'}</span>
              </div>
              
              <div className="flex items-center gap-1">
                {[2, 4, 8, 12].map((hrs) => (
                  <button
                    key={hrs}
                    type="button"
                    onClick={() => setDurationHours(hrs)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      durationHours === hrs
                        ? 'bg-[#121212] text-[#fcd502] shadow-xs'
                        : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {hrs}h
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Book a Driver CTA Button */}
        <button
          type="submit"
          className="w-full py-4 rounded-2xl bg-[#121212] hover:bg-black text-[#fcd502] font-black text-sm flex items-center justify-center shadow-xl transition-all border border-zinc-800 cursor-pointer active:scale-[0.99] mt-2"
        >
          <span>{t.bookDriverBtn}</span>
        </button>
      </form>
    </div>
  );
};
