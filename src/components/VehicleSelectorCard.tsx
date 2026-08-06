import React from 'react';
import { VehicleOption } from '../types';
import { Car, Sparkles, Zap, ShieldCheck } from 'lucide-react';

interface VehicleSelectorCardProps {
  vehicles: VehicleOption[];
  selectedVehicleId: string;
  onSelectVehicle: (vehicle: VehicleOption) => void;
}

const MINIMAL_VEHICLE_TYPES = [
  { id: 'sedan', name: 'Sedan', icon: Car, tag: 'Popular' },
  { id: 'suv', name: 'SUV', icon: ShieldCheck, tag: 'Family / Space' },
  { id: 'luxury', name: 'Luxury', icon: Sparkles, tag: 'VIP Premium' },
  { id: 'hatchback', name: 'Hatchback', icon: Zap, tag: 'Compact' },
];

export const VehicleSelectorCard: React.FC<VehicleSelectorCardProps> = ({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
}) => {
  return (
    <div className="w-full space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-base font-extrabold text-[#0F172A] tracking-tight">Select My Vehicle</h3>
        <span className="text-[11px] font-bold text-[#a18200]">Your Car • Trained Driver</span>
      </div>

      {/* Minimal 4-Pill Vehicle Type Selection Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {MINIMAL_VEHICLE_TYPES.map((vType) => {
          // Find matching vehicle or fallback
          const matchingVehicle = vehicles.find(
            (v) => v.name.toLowerCase().includes(vType.id) || v.id.toLowerCase().includes(vType.id)
          ) || vehicles[0];

          const isSelected = selectedVehicleId === matchingVehicle.id || selectedVehicleId.toLowerCase().includes(vType.id);
          const IconComponent = vType.icon;

          return (
            <button
              key={vType.id}
              type="button"
              onClick={() => onSelectVehicle(matchingVehicle)}
              className={`p-3 rounded-2xl transition-all duration-200 text-left cursor-pointer flex flex-col justify-between border relative overflow-hidden ${
                isSelected
                  ? 'bg-[#121212] text-white border-zinc-800 shadow-lg scale-[1.02]'
                  : 'bg-white text-slate-800 border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-[#fcd502] text-[#121212]' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <IconComponent className="w-3.5 h-3.5" />
                </div>

                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-[#fcd502] animate-pulse" />
                )}
              </div>

              <div>
                <span className={`text-xs font-black tracking-tight block ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                  {vType.name}
                </span>
                <span className={`text-[9px] font-bold uppercase tracking-wider block mt-0.5 ${isSelected ? 'text-[#fcd502]' : 'text-slate-400'}`}>
                  {vType.tag}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
