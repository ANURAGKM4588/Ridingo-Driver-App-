import React, { useState } from 'react';
import { Promotion } from '../types';
import { Sparkles, Tag, ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react';

interface PromotionsCarouselProps {
  promotions: Promotion[];
  onClaimPromotion?: (promo: Promotion) => void;
}

export const PromotionsCarousel: React.FC<PromotionsCarouselProps> = ({
  promotions,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % promotions.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + promotions.length) % promotions.length);
  };

  const handleCopyCode = (code: string) => {
    try {
      navigator.clipboard.writeText(code);
    } catch {
      // fallback
    }
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  const currentPromo = promotions[currentIndex];

  return (
    <div className="w-full space-y-3">
      {/* Section Title Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#fcd502]" />
          <h3 className="text-sm font-black text-[#0F172A] tracking-tight uppercase">
            Special Offers & Deals
          </h3>
        </div>

        {/* Carousel Prev/Next Navigation Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrev}
            className="w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center shadow-sm transition-colors cursor-pointer"
            aria-label="Previous Offer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center shadow-sm transition-colors cursor-pointer"
            aria-label="Next Offer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Strict Uniform Poster Card (Fixed Height: h-48) */}
      <div className="w-full h-48 rounded-[28px] overflow-hidden relative p-5 text-white shadow-xl transition-all duration-500 flex flex-col justify-between group border border-white/20 bg-slate-900">
        {/* Background Poster Image */}
        <img
          src={currentPromo.imageBg}
          alt={currentPromo.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-black/30 pointer-events-none" />

        {/* Top Tag & Expiry */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="px-2.5 py-0.5 rounded-full bg-[#fcd502] text-[#121212] text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
            <Tag className="w-3 h-3 fill-current" /> {currentPromo.discountTag}
          </span>
          <span className="text-[10px] text-slate-300 font-semibold bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-sm">
            {currentPromo.validUntil}
          </span>
        </div>

        {/* Poster Middle Title & Details */}
        <div className="relative z-10 space-y-1">
          <h4 className="text-lg font-black text-white tracking-tight drop-shadow-md truncate">
            {currentPromo.title}
          </h4>
          <p className="text-xs text-slate-200 font-medium line-clamp-2 leading-tight">
            {currentPromo.description}
          </p>
        </div>

        {/* Poster Footer: Promo Code Badge with Interactive Copy Function */}
        <div className="relative z-10 pt-2 flex items-center justify-between border-t border-white/15">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Use Code:</span>
            <span className="px-2.5 py-1 rounded-xl bg-white/15 backdrop-blur-md text-[#fcd502] font-mono text-xs font-black border border-white/20 tracking-wider">
              {currentPromo.code}
            </span>
          </div>

          {/* Interactive Copy Code Button */}
          <button
            type="button"
            onClick={() => handleCopyCode(currentPromo.code)}
            className={`px-3 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
              copiedCode === currentPromo.code
                ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                : 'bg-white text-slate-900 hover:bg-slate-100'
            }`}
          >
            {copiedCode === currentPromo.code ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>COPIED!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-700" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Carousel Pagination Indicator Dots */}
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1">
          {promotions.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`h-1 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-5 bg-[#fcd502]' : 'w-1 bg-white/40'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
