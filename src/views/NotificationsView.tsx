import React from 'react';
import { 
  Bell, 
  Car, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  Clock, 
  ChevronRight 
} from 'lucide-react';
import { NotificationItem } from '../types';

const iconMap: Record<string, React.ElementType> = {
  Car,
  CheckCircle2,
  Sparkles,
  ShieldCheck
};

interface NotificationsViewProps {
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  hideHeader?: boolean;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  onMarkAllRead,
  hideHeader = false,
}) => {
  return (
    <div className="w-full max-w-xl mx-auto space-y-3 animate-fade-in pt-[max(env(safe-area-inset-top,54px),54px)] pb-10 px-4">
      {!hideHeader && (
        <div className="flex items-center justify-between px-1">
          <div className="flex-1 text-center">
            <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">Notifications</h2>
            <p className="text-xs text-slate-500 font-medium">Driver updates, dispatch alerts &amp; exclusive perks</p>
          </div>

          <button
            onClick={onMarkAllRead}
            className="text-xs font-bold text-[#a18200] hover:underline flex items-center gap-1 cursor-pointer flex-shrink-0 ml-3"
          >
            <Check className="w-3.5 h-3.5" /> Mark all
          </button>
        </div>
      )}

      <div className="space-y-3">
        {notifications.map((item) => {
          const Icon = iconMap[item.icon] || Bell;

          return (
            <div
              key={item.id}
              className={`glass-card rounded-3xl p-4.5 border transition-all flex items-start gap-3.5 ${
                item.read
                  ? 'bg-white/80 border-slate-200/70 text-slate-700 opacity-90'
                  : 'bg-white border-[#fcd502] text-slate-900 shadow-md ring-1 ring-[#fcd502]/30'
              }`}
            >
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                item.type === 'driver' ? 'bg-[#121212] text-[#fcd502]' :
                item.type === 'booking' ? 'bg-emerald-500/10 text-emerald-600' :
                item.type === 'offer' ? 'bg-amber-500/10 text-amber-600' :
                'bg-blue-500/10 text-blue-600'
              }`}>
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-slate-900 truncate">{item.title}</h4>
                  <span className="text-[10px] text-slate-400 font-medium ml-2 flex-shrink-0">{item.timestamp}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                  {item.description}
                </p>
              </div>

              {!item.read && (
                <span className="w-2.5 h-2.5 rounded-full bg-[#fcd502] flex-shrink-0 mt-2 animate-pulse" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
