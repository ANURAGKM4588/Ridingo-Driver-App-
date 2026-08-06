import React, { useState, useEffect } from 'react';
import { Wifi } from 'lucide-react';

interface MobileControlCenterStatusBarProps {
  theme?: 'light' | 'dark';
}

export const MobileControlCenterStatusBar: React.FC<MobileControlCenterStatusBarProps> = ({
  theme = 'light',
}) => {
  const [timeString, setTimeString] = useState<string>('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const isDark = theme === 'dark';

  return (
    <div
      className={`w-full h-10 shrink-0 px-4.5 sticky top-0 z-50 flex items-center justify-between font-sans select-none ${
        isDark ? 'bg-slate-950 text-white border-b border-slate-900/60' : 'bg-white text-slate-900 border-b border-slate-100/80'
      }`}
    >
      {/* Left: Mobile Clock */}
      <div className="w-16 flex items-center justify-start">
        <span className="font-extrabold text-[12px] tracking-tight text-slate-900">
          {timeString}
        </span>
      </div>

      {/* Center: Dynamic Island Camera Pill Notch (Guaranteed Safe Area No Overlap) */}
      <div className="flex-1 flex justify-center items-center">
        <div className="h-6 px-3 rounded-full bg-slate-950 text-white flex items-center justify-between gap-2.5 shadow-md border border-slate-800/90 transition-transform duration-300 hover:scale-105">
          {/* Camera Lens & Sensor Dot */}
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700/80 flex items-center justify-center">
              <span className="w-1 h-1 rounded-full bg-blue-500/80" />
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          {/* Brand Badge */}
          <span className="text-[9.5px] font-black tracking-widest text-[#fcd502] uppercase font-mono">
            RIDINGO
          </span>
        </div>
      </div>

      {/* Right: Mobile Control Center Status Indicators */}
      <div className="w-16 flex items-center justify-end gap-1.5 text-slate-800">
        <span className="text-[10px] font-black tracking-tighter">5G</span>
        <Wifi className="w-3.5 h-3.5 stroke-[2.5]" />
        <div className="w-4 h-2.5 rounded-[3px] border border-slate-800 p-0.5 flex items-center">
          <div className="h-full w-full bg-slate-900 rounded-[1px]" />
        </div>
      </div>
    </div>
  );
};
