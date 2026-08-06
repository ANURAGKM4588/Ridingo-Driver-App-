import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Car, 
  Clock, 
  RotateCcw, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  ChevronRight,
  ShieldCheck,
  Filter
} from 'lucide-react';
import { Booking } from '../types';
import { RegionCode, formatPrice } from '../data/currencies';

interface BookingsViewProps {
  bookings: Booking[];
  onRepeatBooking: (booking: Booking) => void;
  onOpenDriverProfile: (driver: any) => void;
  currentRegion?: RegionCode;
}

export const BookingsView: React.FC<BookingsViewProps> = ({
  bookings,
  onRepeatBooking,
  onOpenDriverProfile,
  currentRegion = 'in',
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');

  const filtered = bookings.filter((b) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'upcoming') return b.status === 'upcoming' || b.status === 'in-progress' || b.status === 'pending_approval';
    return b.status === activeFilter;
  });

  return (
    <div className="w-full h-full flex flex-col bg-[#FAFAFA] animate-fade-in overflow-hidden">
      {/* FIXED Sticky Header & Category Filter Bar */}
      <div className="bg-white border-b border-slate-200 shadow-xs flex-shrink-0 z-30 animate-drop-up stagger-1 pt-[max(env(safe-area-inset-top,54px),54px)]">
        {/* Title Header – left aligned */}
        <div className="py-3.5 px-4 flex items-center justify-between">
          <div className="flex-1 text-left">
            <h2 className="text-xl font-black text-[#0F172A] tracking-tight">Booking History</h2>
            <p className="text-[11px] text-slate-500 font-medium">All professional driver assignments for your trips</p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-slate-100 font-mono font-bold text-xs text-slate-700 border border-slate-200 shadow-xs flex-shrink-0">
            {filtered.length} {filtered.length === 1 ? 'Trip' : 'Trips'}
          </span>
        </div>

        {/* Category Filter Tabs (Fixed right under Header) */}
        <div className="px-4 pb-3">
          <div className="flex p-1 rounded-2xl bg-slate-100 border border-slate-200/80 space-x-1">
            {[
              { id: 'all', label: 'All Trips' },
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'completed', label: 'Completed' },
              { id: 'cancelled', label: 'Cancelled' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id as any)}
                className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  activeFilter === tab.id
                    ? 'bg-slate-900 text-[#fcd502] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Middle Scrollable Section (Only the Booking History List Scrolls) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none pb-36 bg-[#FAFAFA]">
        {filtered.length === 0 ? (
          <div className="py-12 text-center space-y-3 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs animate-drop-up stagger-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">No {activeFilter} bookings found</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Your booked luxury chauffeur rides will appear here.
            </p>
          </div>
        ) : (
          filtered.map((b, idx) => (
            <div
              key={b.id}
              className={`glass-card rounded-[32px] p-5 space-y-4 border border-slate-200/80 bg-white shadow-md hover:shadow-xl transition-all animate-drop-up stagger-${Math.min(idx + 2, 6)}`}
            >
              {/* Top Status Bar */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-mono text-[11px] font-black text-slate-500 truncate">#{b.bookingNumber}</span>
                  <span className="text-slate-300 text-[10px]">•</span>
                  <span className="text-[11px] font-extrabold text-slate-700 whitespace-nowrap">{b.date}</span>
                </div>

                {/* Status Badges */}
                {b.status === 'completed' && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border border-emerald-200 whitespace-nowrap flex-shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Completed
                  </span>
                )}
                {b.status === 'pending_approval' && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border border-amber-500/30 whitespace-nowrap flex-shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span> Pending Approval
                  </span>
                )}
                {(b.status === 'upcoming' || b.status === 'in-progress') && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#fcd502]/20 text-[#a18200] text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border border-[#fcd502]/40 whitespace-nowrap flex-shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#fcd502] animate-pulse"></span> Driver Assigned
                  </span>
                )}
                {b.status === 'cancelled' && (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border border-rose-200 whitespace-nowrap flex-shrink-0">
                    <XCircle className="w-3 h-3 text-rose-500" /> Cancelled
                  </span>
                )}
              </div>

              {/* Service & Route */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-black text-base text-slate-900">{b.serviceTitle}</h3>
                  {b.serviceType === 'Airport' ? (
                    <span className="px-2 py-0.5 rounded-full bg-slate-900 text-[#fcd502] text-[9px] font-black uppercase whitespace-nowrap">
                      ✈️ Airport
                    </span>
                  ) : b.serviceType === 'Hourly' ? (
                    <span className="px-2 py-0.5 rounded-full bg-[#fcd502]/20 text-[#a18200] text-[9px] font-black uppercase whitespace-nowrap">
                      ⏱️ Hourly
                    </span>
                  ) : b.tripCause ? (
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[9px] font-black uppercase whitespace-nowrap">
                      💼 {b.tripCause}
                    </span>
                  ) : null}
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-200/60">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#fcd502] fill-[#fcd502]/25 stroke-[2] flex-shrink-0 mt-0.5" />
                    <span className="font-medium text-slate-800">{b.pickupLocation}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-900 fill-slate-900/20 stroke-[2] flex-shrink-0 mt-0.5" />
                    <span className="font-medium text-slate-800">{b.destinationLocation}</span>
                  </div>
                </div>
              </div>

              {/* Driver & Vehicle */}
              <div className="flex items-center justify-between text-xs pt-1">
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-[#fcd502] fill-[#fcd502]/25 stroke-[2]" />
                  <span className="font-bold text-slate-800">{b.vehicle.name} ({b.vehicle.capacity})</span>
                </div>

                {b.driver && (
                  <button
                    type="button"
                    onClick={() => onOpenDriverProfile(b.driver)}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <img src={b.driver.photo} alt={b.driver.name} className="w-6 h-6 rounded-full object-cover" />
                    <span className="font-bold text-slate-900 underline">{b.driver.name}</span>
                  </button>
                )}
              </div>

              {/* Price & Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-base font-black text-slate-900">{formatPrice(b.priceTotal, currentRegion, 2)}</span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => alert(`Downloading official TAX PDF invoice for #${b.bookingNumber}`)}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 fill-slate-700/20 stroke-[2]" />
                    <span>Invoice</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onRepeatBooking(b)}
                    className="px-3.5 py-2 rounded-xl bg-[#121212] hover:bg-black text-[#fcd502] font-bold text-xs flex items-center gap-1 shadow-md transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 stroke-[2.2]" />
                    <span>Repeat</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
