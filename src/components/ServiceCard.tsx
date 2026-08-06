import React from 'react';
import { ServiceItem } from '../types';
import { 
  Clock, 
  PlaneTakeoff, 
  Sparkles, 
  Briefcase, 
  GraduationCap, 
  Wine, 
  Compass, 
  Building2, 
  MapPin,
  ChevronRight
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Clock,
  PlaneTakeoff,
  Sparkles,
  Briefcase,
  GraduationCap,
  Wine,
  Compass,
  Building2,
  MapPin
};

interface ServiceCardProps {
  service: ServiceItem;
  onSelectService: (service: ServiceItem) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onSelectService }) => {
  const IconComponent = iconMap[service.iconName] || Clock;

  return (
    <div
      onClick={() => onSelectService(service)}
      className="glass-card rounded-3xl p-4 cursor-pointer flex flex-col justify-between h-36 relative group hover:border-[#fcd502] transition-all duration-300 overflow-hidden bg-white"
    >
      {/* Subtle top right glow */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#fcd502]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-full pointer-events-none" />

      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="w-10 h-10 rounded-2xl bg-[#121212] text-[#fcd502] flex items-center justify-center shadow-md group-hover:bg-[#fcd502] group-hover:text-[#121212] transition-colors duration-300 flex-shrink-0">
            <IconComponent className="w-5 h-5" />
          </div>

          {service.badge && (
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[9px] uppercase tracking-wider group-hover:bg-[#fcd502]/20 group-hover:text-[#a18200] transition-colors truncate max-w-[90px]">
              {service.badge}
            </span>
          )}
        </div>

        <h3 className="font-extrabold text-xs sm:text-sm text-[#0F172A] tracking-tight group-hover:text-black truncate">
          {service.title}
        </h3>

        <p className="text-[11px] text-slate-500 font-medium line-clamp-1 mt-0.5">
          {service.subtitle}
        </p>
      </div>

      <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-xs">
        <span className="font-black text-[#0F172A] truncate">
          {service.priceStarting}
        </span>
        <div className="w-5 h-5 rounded-full bg-slate-100 group-hover:bg-[#fcd502] group-hover:text-black text-slate-400 flex items-center justify-center transition-all duration-300 flex-shrink-0">
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
