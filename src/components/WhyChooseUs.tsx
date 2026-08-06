import React from 'react';
import { 
  ShieldCheck, 
  Clock, 
  Navigation, 
  Headphones, 
  UserCheck 
} from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const features = [
    {
      icon: ShieldCheck,
      title: 'Verified Drivers',
      desc: '100% background checked & vatted.',
      color: 'bg-emerald-500/10 text-emerald-600',
    },
    {
      icon: Clock,
      title: 'Always On Time',
      desc: 'Punctual arrival guaranteed.',
      color: 'bg-lime-500/10 text-[#a18200]',
    },
    {
      icon: Navigation,
      title: 'Real-Time GPS',
      desc: 'Live trip tracking & status.',
      color: 'bg-blue-500/10 text-blue-600',
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      desc: 'Instant priority concierge.',
      color: 'bg-purple-500/10 text-purple-600',
    },
  ];

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-[#fcd502]" />
          <h3 className="text-sm font-extrabold text-[#0F172A] tracking-tight">
            Why Choose RIDINGO
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {features.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="glass-card rounded-2xl p-3 flex flex-col justify-between border border-slate-200/70 hover:border-slate-300 transition-all bg-white"
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-xs text-[#0F172A] tracking-tight truncate">
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
