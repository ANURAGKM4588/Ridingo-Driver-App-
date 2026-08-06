import React, { useState } from 'react';
import { Star, ShieldCheck, Quote, ChevronLeft, ChevronRight, CheckCircle2, Car } from 'lucide-react';

interface ReviewItem {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  comment: string;
  vehicleDriven: string;
  verified: boolean;
  date: string;
}

const BRAND_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    name: 'Sophia Chen',
    role: 'VP of Finance, TechCorp',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    comment: 'RIDINGO is a total game changer! Having a certified chauffeur drive my Mercedes to high-stakes client meetings saves me hours of traffic stress.',
    vehicleDriven: 'Mercedes-Benz E-Class',
    verified: true,
    date: '2 days ago'
  },
  {
    id: 'rev-2',
    name: 'David Miller',
    role: 'Real Estate Developer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    comment: 'I hire RIDINGO chauffeurs for weekend family trips in my Range Rover. Marcus was punctual, extremely polite, and drove with total care.',
    vehicleDriven: 'Range Rover Autobiography',
    verified: true,
    date: '1 week ago'
  },
  {
    id: 'rev-3',
    name: 'Elena Rostova',
    role: 'Event Director',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    comment: 'Booked an airport transfer chauffeur for my Tesla Model S. Zero hassle, instant booking confirmation, and transparent 30% advance deposit!',
    vehicleDriven: 'Tesla Model S Plaid',
    verified: true,
    date: '3 days ago'
  },
  {
    id: 'rev-4',
    name: 'Alexander Vance',
    role: 'Private Investor',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    comment: 'The white-glove driver service for our wedding fleet was 100% flawless. Professional suit uniform, background-checked drivers, and top safety.',
    vehicleDriven: 'Porsche Panamera',
    verified: true,
    date: '5 days ago'
  }
];

export const BrandReviews: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % BRAND_REVIEWS.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + BRAND_REVIEWS.length) % BRAND_REVIEWS.length);
  };

  const currentReview = BRAND_REVIEWS[currentIndex];

  return (
    <div className="w-full space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#a18200]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#fcd502]" />
            <span>Verified Customer Reviews</span>
          </div>
          <h3 className="text-base font-black text-[#0F172A] tracking-tight mt-0.5 flex items-center gap-2">
            Loved by 50,000+ Car Owners
          </h3>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrev}
            className="w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center shadow-sm transition-colors cursor-pointer"
            aria-label="Previous Review"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center shadow-sm transition-colors cursor-pointer"
            aria-label="Next Review"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Review Card */}
      <div className="w-full bg-white rounded-3xl p-5 border border-slate-200 shadow-md space-y-3.5 relative overflow-hidden">
        {/* Quote Icon Background Accent */}
        <Quote className="absolute right-4 bottom-4 w-20 h-20 text-slate-100 pointer-events-none" />

        {/* Rating Stars & Verified Pill */}
        <div className="flex items-center justify-between z-10 relative">
          <div className="flex items-center gap-1 text-amber-400">
            {[...Array(currentReview.rating)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
            <span className="text-xs font-black text-slate-800 ml-1">5.0</span>
          </div>

          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Owner
          </span>
        </div>

        {/* Comment Text */}
        <p className="text-xs text-slate-700 font-medium leading-relaxed italic z-10 relative">
          "{currentReview.comment}"
        </p>

        {/* Vehicle Badge */}
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-200/60 z-10 relative">
          <Car className="w-3.5 h-3.5 text-[#fcd502]" />
          <span>Vehicle Driven: <strong>{currentReview.vehicleDriven}</strong></span>
        </div>

        {/* Author Profile Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between z-10 relative">
          <div className="flex items-center gap-3">
            <img
              src={currentReview.avatar}
              alt={currentReview.name}
              className="w-10 h-10 rounded-2xl object-cover border border-white shadow-sm"
            />
            <div>
              <h4 className="font-extrabold text-xs text-slate-900">{currentReview.name}</h4>
              <p className="text-[10px] text-slate-500 font-semibold">{currentReview.role}</p>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">{currentReview.date}</span>
        </div>
      </div>
    </div>
  );
};
