import React from 'react';
import { Home, Calendar, Activity, Wallet, User } from 'lucide-react';
import type { TabType } from '../types';
import { LanguageCode, TRANSLATIONS } from '../data/translations';

interface FloatingNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  currentLanguage?: LanguageCode;
}

export const FloatingNav: React.FC<FloatingNavProps> = ({ 
  activeTab, 
  onTabChange,
  currentLanguage = 'en-us',
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS['en-us'];

  const tabs = [
    { id: 'home' as TabType, label: t.tabHome, icon: Home },
    { id: 'bookings' as TabType, label: t.tabBookings, icon: Calendar },
    { id: 'activity' as TabType, label: t.tabTracking, icon: Activity },
    { id: 'wallet' as TabType, label: t.tabWallet, icon: Wallet },
    { id: 'profile' as TabType, label: t.tabProfile, icon: User },
  ];

  return (
    <div className="fixed bottom-[max(env(safe-area-inset-bottom,12px),12px)] left-1/2 -translate-x-1/2 z-40 w-[calc(100%-3rem)] max-w-[360px] pointer-events-auto transition-all duration-300">
      <nav className="rounded-full p-2 flex items-center justify-between shadow-2xl border border-slate-800/90 backdrop-blur-2xl bg-[#121212]/95 ring-1 ring-white/10 overflow-hidden">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`relative flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-full transition-all duration-300 cursor-pointer active:scale-95 ${
                isActive
                  ? 'bg-[#fcd502] text-[#121212] shadow-lg shadow-[#fcd502]/25 font-black flex-1 rounded-full'
                  : 'text-slate-400 hover:text-white font-bold hover:bg-slate-800/60 rounded-full'
              }`}
              aria-label={tab.label}
            >
              <Icon className={`w-4.5 h-4.5 transition-all duration-300 ${
                isActive ? 'scale-110 text-[#121212] fill-[#121212]/20 stroke-[2.5]' : 'text-slate-400 stroke-[2]'
              }`} />
              
              {isActive && (
                <span className="text-[11px] font-black tracking-tight whitespace-nowrap text-[#121212]">
                  {tab.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
