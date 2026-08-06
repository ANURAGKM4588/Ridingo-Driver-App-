import React, { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';
import { 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Share2, 
  Clock, 
  ShieldCheck, 
  Navigation,
  ChevronLeft,
  Car,
  CreditCard,
  Loader2,
  Check
} from 'lucide-react';
import { Booking } from '../types';
import { RegionCode, formatPrice } from '../data/currencies';

interface BookingConfirmationViewProps {
  booking: Booking;
  onTrackDriver: () => void;
  onClose: () => void;
  currentRegion?: RegionCode;
}

export const BookingConfirmationView: React.FC<BookingConfirmationViewProps> = ({
  booking,
  onTrackDriver,
  onClose,
  currentRegion = 'in',
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#fcd502', '#fde047', '#121212', '#00E676', '#3B82F6'],
      });
    } catch {
      // fallback
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const isAirport = booking.serviceType === 'Airport' || booking.serviceId === 'airport-pickup' || Boolean(booking.flightNumber && booking.flightNumber.length > 0);
  const isHourly = booking.serviceType === 'Hourly' || booking.serviceId === 'hourly-driver' || (!isAirport && booking.serviceType !== 'Other');

  const grandTotal = booking.priceTotal || 64.50;
  const advancePaid = Math.round(grandTotal * 0.30 * 100) / 100;
  const remainingBalance = Math.round((grandTotal - advancePaid) * 100) / 100;

  // Universal Bulletproof Share Engine (Native File Share ➔ Native Text Share ➔ WhatsApp ➔ Clipboard)
  const handleNativeSharePageImage = async () => {
    if (isSharing) return;
    setIsSharing(true);

    const shareText = `🚗 RIDINGO Chauffeur Booking Pass #${booking.bookingNumber || 'RDG-2026'}\n` +
      `Status: Confirmed & Dispatched ✓\n` +
      `Pickup: ${booking.pickupLocation}\n` +
      `Destination: ${booking.destinationLocation}\n` +
      `Date & Time: ${booking.date}, ${booking.time}\n` +
      `Vehicle: ${booking.vehicle?.name || 'Executive Chauffeur'}\n` +
      `Driver: ${booking.driver?.name || 'Assigned Chauffeur'} (★ ${booking.driver?.rating || '4.95'})\n` +
      `30% Advance Deposit Paid: ${formatPrice(advancePaid, currentRegion, 2)}\n` +
      `70% Balance Due: ${formatPrice(remainingBalance, currentRegion, 2)}`;

    try {
      // 1. Capture exact screenshot image of the Booking Confirmed page in memory
      let file: File | null = null;
      if (pageRef.current) {
        try {
          const canvas = await html2canvas(pageRef.current, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#FAFAFA',
            logging: false,
          });
          const dataUrl = canvas.toDataURL('image/png');
          const res = await fetch(dataUrl);
          const blob = await res.blob();
          file = new File([blob], `RIDINGO-Booking-${booking.bookingNumber || 'Pass'}.png`, { type: 'image/png' });
        } catch (canvasErr) {
          console.warn("Canvas capture warning:", canvasErr);
        }
      }

      // 2. Mobile OS Native Share with Image File (iOS Safari / Android Chrome Stock Share Sheet)
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `RIDINGO Booking #${booking.bookingNumber}`,
          text: shareText,
          files: [file],
        });
        showToast("Booking Pass Shared!");
        return;
      }

      // 3. Mobile OS Native Share Text & Link
      if (navigator.share) {
        await navigator.share({
          title: `RIDINGO Booking #${booking.bookingNumber}`,
          text: shareText,
          url: window.location.href,
        });
        showToast("Booking Pass Shared!");
        return;
      }

      // 4. WhatsApp Direct Share Link Fallback
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
      window.open(whatsappUrl, '_blank');
      showToast("Opening WhatsApp Share...");
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(shareText);
          showToast("Booking details copied to clipboard!");
        } catch {
          // silent fallback
        }
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#FAFAFA] animate-fade-in overflow-hidden relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold border border-slate-700 animate-bounce-subtle">
          <Check className="w-4 h-4 text-[#fcd502]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Fixed Centered Header */}
      <div className="bg-white pt-[max(env(safe-area-inset-top,54px),54px)] pb-3 px-4 border-b border-slate-200 flex items-center justify-between shadow-xs flex-shrink-0 z-30">
        <div className="w-12 flex items-center justify-start">
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
        <div className="text-center flex-1 truncate px-2">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Booking Confirmed</h2>
          <p className="text-[10px] text-slate-500 font-bold">Chauffeur Assigned & En Route</p>
        </div>
        <div className="w-12" />
      </div>

      {/* Middle Scrollable Content (Captured as Image for Native Mobile Share) */}
      <div ref={pageRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none bg-[#FAFAFA]">
        {/* Celebration Card */}
        <div className="glass-card rounded-[36px] p-6 text-center space-y-3 bg-gradient-to-b from-white via-white to-slate-50 border border-slate-200/80 shadow-2xl relative overflow-hidden">
          <div className="w-20 h-20 rounded-full bg-[#fcd502]/20 text-[#a18200] mx-auto flex items-center justify-center shadow-inner mb-2 border border-[#fcd502]/30 animate-bounce-subtle">
            <CheckCircle2 className="w-10 h-10 text-[#fcd502] fill-[#fcd502]/25 stroke-[2]" />
          </div>

          <span className="px-3 py-1 rounded-full bg-[#fcd502] text-[#121212] text-xs font-black uppercase tracking-wider inline-block shadow-sm">
            ✓ Chauffeur Assigned & Dispatched
          </span>

          <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">
            {isAirport ? 'Airport Chauffeur Reserved!' : isHourly ? 'Hourly Driver Booked!' : 'Special Trip Confirmed!'}
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto font-medium">
            Professional driver assigned for your <strong className="text-slate-900 font-extrabold">{booking.vehicle?.name || 'Luxury Vehicle'}</strong>.
          </p>

          <div className="pt-2 flex items-center justify-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Booking ID:</span>
            <span className="px-3 py-1 rounded-xl bg-slate-100 font-mono font-extrabold text-xs text-slate-900 border border-slate-200 shadow-inner">
              #{booking.bookingNumber}
            </span>
          </div>
        </div>

        {/* Assigned Driver Profile Card */}
        {booking.driver && (
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Your Assigned Chauffeur</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Background Checked
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={booking.driver.photo}
                  alt={booking.driver.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 shadow-md bg-slate-100"
                />
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                    {booking.driver.name}
                    <ShieldCheck className="w-4 h-4 text-[#fcd502]" />
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                    <span>★ {booking.driver.rating} ({booking.driver.reviewsCount} rides)</span>
                  </p>
                  <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold mt-1">
                    {booking.driver.yearsExperience || 8}+ Years Luxury Chauffeur
                  </span>
                </div>
              </div>

              <a
                href={`tel:${booking.driver.phone || '+18005550199'}`}
                className="w-10 h-10 rounded-2xl bg-slate-950 text-[#fcd502] flex items-center justify-center shadow-md hover:bg-black transition-colors"
              >
                <Phone className="w-5 h-5" />
              </a>
            </div>
          </div>
        )}

        {/* Route Details Card */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
              {isAirport ? 'Flight & Pickup Details' : isHourly ? 'Chauffeur Itinerary' : 'Trip Route'}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">
              {booking.date}
            </span>
          </div>

          <div className="space-y-3 relative">
            <div className="absolute left-[15px] top-[18px] bottom-[18px] w-[1.5px] border-l-2 border-dashed border-slate-200 z-0" />
            
            <div className="flex items-start gap-3 relative z-10">
              <div className="w-8 h-8 rounded-xl bg-lime-50 text-[#fcd502] flex items-center justify-center flex-shrink-0 shadow-xs">
                <MapPin className="w-4 h-4 fill-[#fcd502]/20" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Pickup Address</span>
                <span className="text-xs font-extrabold text-slate-900 block leading-tight">{booking.pickupLocation}</span>
              </div>
            </div>

            <div className="flex items-start gap-3 relative z-10">
              <div className="w-8 h-8 rounded-xl bg-slate-950 text-[#fcd502] flex items-center justify-center flex-shrink-0 shadow-xs">
                <Navigation className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Destination Location</span>
                <span className="text-xs font-extrabold text-slate-900 block leading-tight">{booking.destinationLocation}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Vehicle Card */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-800 border border-slate-200">
              <Car className="w-6 h-6 text-[#fcd502]" />
            </div>
            <div>
              <h4 className="font-black text-xs text-slate-900">{booking.vehicle?.name || 'Executive Sedan'}</h4>
              <span className="text-[11px] text-slate-500 font-medium">
                {booking.vehicle?.sampleModels || 'Mercedes E-Class, BMW 5 Series'} • {booking.vehicle?.capacity || '4 Seats'}
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
            Automatic
          </span>
        </div>

        {/* Financial Payment Summary Card */}
        <div className="bg-gradient-to-br from-slate-900 via-zinc-900 to-[#121212] rounded-3xl p-5 text-white shadow-xl space-y-3 border border-zinc-800">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-[#fcd502] fill-[#fcd502]/25 stroke-[2]" /> Payment Summary
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#fcd502] text-[#121212] text-[10px] font-black uppercase">
              30% Advance Paid
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase block">Total Trip Fare</span>
              <span className="text-xl font-black text-white">{formatPrice(grandTotal, currentRegion, 2)}</span>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-[#fcd502] uppercase block">30% Advance Paid</span>
              <span className="text-xl font-black text-[#fcd502]">{formatPrice(advancePaid, currentRegion, 2)}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Remaining 70% Balance Due Post-Trip:</span>
            <span className="font-extrabold text-white text-sm font-mono">{formatPrice(remainingBalance, currentRegion, 2)}</span>
          </div>
        </div>
      </div>

      {/* FIXED Bottom Action Bar - Elevated above iOS Home Indicator Line */}
      <div className="bg-white border-t border-slate-200 p-3.5 px-4 pb-[max(env(safe-area-inset-bottom,0px)+0.85rem,1.25rem)] flex-shrink-0 shadow-lg z-30 space-y-2.5">
        <button
          type="button"
          onClick={onTrackDriver}
          className="w-full h-13 py-3.5 rounded-2xl bg-[#121212] hover:bg-black text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl hover:shadow-black/20 transition-all border border-zinc-800 cursor-pointer"
        >
          <Navigation className="w-4 h-4 text-[#fcd502]" />
          <span>Track Chauffeur on Live Map</span>
        </button>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Universal Share Button */}
          <button
            type="button"
            onClick={handleNativeSharePageImage}
            disabled={isSharing}
            className="h-11 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-800 font-extrabold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isSharing ? (
              <Loader2 className="w-4 h-4 text-[#a18200] animate-spin" />
            ) : (
              <Share2 className="w-4 h-4 text-[#a18200]" />
            )}
            <span>{isSharing ? 'Preparing...' : 'Share Booking'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="h-11 py-2.5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 font-extrabold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};
