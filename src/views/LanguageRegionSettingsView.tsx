import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Globe, 
  MapPin, 
  Clock, 
  Check, 
  Search, 
  CheckCircle2
} from 'lucide-react';
import { LanguageCode } from '../data/translations';
import { RegionCode, CURRENCIES } from '../data/currencies';

interface LanguageRegionSettingsViewProps {
  onBack: () => void;
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  currentRegion: RegionCode;
  onRegionChange: (reg: RegionCode) => void;
}

const LANGUAGES: { id: LanguageCode; name: string; native: string; flag: string }[] = [
  { id: 'en-us', name: 'English (US)', native: 'English', flag: '🇺🇸' },
  { id: 'ml-in', name: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳' },
  { id: 'hi-in', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { id: 'en-uk', name: 'English (UK)', native: 'English', flag: '🇬🇧' },
  { id: 'es-es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { id: 'fr-fr', name: 'French', native: 'Français', flag: '🇫🇷' },
  { id: 'de-de', name: 'German', native: 'Deutsch', flag: '🇩🇪' },
  { id: 'ar-sa', name: 'Arabic', native: 'العربية', flag: '🇸🇦' },
  { id: 'pt-br', name: 'Portuguese', native: 'Português', flag: '🇧🇷' },
];

const REGIONS: { id: RegionCode; name: string; currency: string; flag: string }[] = [
  { id: 'in', name: 'India', currency: 'INR (₹)', flag: '🇮🇳' },
  { id: 'us', name: 'United States', currency: 'USD ($)', flag: '🇺🇸' },
  { id: 'uk', name: 'United Kingdom', currency: 'GBP (£)', flag: '🇬🇧' },
  { id: 'eu', name: 'European Union', currency: 'EUR (€)', flag: '🇪🇺' },
  { id: 'ca', name: 'Canada', currency: 'CAD ($)', flag: '🇨🇦' },
  { id: 'ae', name: 'United Arab Emirates', currency: 'AED (د.إ)', flag: '🇦🇪' },
];

export const LanguageRegionSettingsView: React.FC<LanguageRegionSettingsViewProps> = ({ 
  onBack,
  currentLanguage,
  onLanguageChange,
  currentRegion,
  onRegionChange,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(currentLanguage);
  const [selectedRegion, setSelectedRegion] = useState<RegionCode>(currentRegion);
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('12h');
  const [distanceUnit, setDistanceUnit] = useState<'mi' | 'km'>('mi');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLanguages = LANGUAGES.filter(
    (l) => l.name.toLowerCase().includes(searchQuery.toLowerCase()) || l.native.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = () => {
    onLanguageChange(selectedLanguage);
    onRegionChange(selectedRegion);
    alert(`Preferences saved! Region set to ${CURRENCIES[selectedRegion]?.name} (${CURRENCIES[selectedRegion]?.currencySymbol}).`);
    onBack();
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#FAFAFA] animate-fade-in overflow-hidden">
      {/* Fixed Centered Header */}
      <div className="bg-white pt-[max(env(safe-area-inset-top,54px),54px)] pb-3 px-4 border-b border-slate-200 flex items-center justify-between shadow-xs flex-shrink-0 z-30">
        <div className="w-12 flex items-center justify-start">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
        <h2 className="font-extrabold text-sm text-slate-900 tracking-tight text-center flex-1 truncate px-2">
          Language & Region
        </h2>
        <div className="w-12 flex items-center justify-end">
          <button
            type="button"
            onClick={handleSave}
            className="text-xs font-bold text-[#a18200] hover:underline cursor-pointer whitespace-nowrap"
          >
            Save
          </button>
        </div>
      </div>

      {/* Middle Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none">
        {/* Select Language Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-600" />
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">App Language</h3>
            </div>
          </div>

          {/* Search Bar for Languages */}
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search language / ഭാഷ തിരയുക..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-extrabold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-[#fcd502]"
            />
          </div>

          <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-xs space-y-1">
            {filteredLanguages.map((lang) => {
              const isSel = selectedLanguage === lang.id;
              return (
                <div
                  key={lang.id}
                  onClick={() => {
                    setSelectedLanguage(lang.id);
                    onLanguageChange(lang.id);
                  }}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                    isSel
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 text-slate-800 border-slate-200/80 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{lang.flag}</span>
                    <div>
                      <span className="font-extrabold text-xs block leading-snug">{lang.name}</span>
                      <span className={`text-[10px] font-medium ${isSel ? 'text-[#fcd502]' : 'text-slate-400'}`}>{lang.native}</span>
                    </div>
                  </div>

                  {isSel && (
                    <div className="w-5 h-5 rounded-full bg-[#fcd502] text-[#121212] flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Select Region & Currency Section */}
        <div className="space-y-2">
          <div className="px-1">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#fcd502]" />
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Region & Currency</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-xs grid grid-cols-2 gap-1.5">
            {REGIONS.map((reg) => {
              const isSel = selectedRegion === reg.id;
              return (
                <div
                  key={reg.id}
                  onClick={() => {
                    setSelectedRegion(reg.id);
                    onRegionChange(reg.id);
                  }}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                    isSel
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 text-slate-800 border-slate-200/80 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm flex-shrink-0">{reg.flag}</span>
                    <div className="min-w-0">
                      <span className="font-extrabold text-xs block truncate leading-snug">{reg.name}</span>
                      <span className={`text-[10px] font-bold block truncate ${isSel ? 'text-[#fcd502]' : 'text-slate-400'}`}>
                        {reg.currency}
                      </span>
                    </div>
                  </div>

                  {isSel && (
                    <CheckCircle2 className="w-4 h-4 text-[#fcd502] flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Format & Unit Preferences */}
        <div className="space-y-2">
          <div className="px-1">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Format Preferences</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs space-y-3">
            {/* Time Format */}
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="font-extrabold text-slate-900 block">Time Display Format</span>
                <span className="text-[10px] text-slate-500">12-hour (2:30 PM) vs 24-hour (14:30)</span>
              </div>

              <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setTimeFormat('12h')}
                  className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                    timeFormat === '12h' ? 'bg-slate-900 text-[#fcd502] shadow-xs' : 'text-slate-600'
                  }`}
                >
                  12h
                </button>
                <button
                  type="button"
                  onClick={() => setTimeFormat('24h')}
                  className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                    timeFormat === '24h' ? 'bg-slate-900 text-[#fcd502] shadow-xs' : 'text-slate-600'
                  }`}
                >
                  24h
                </button>
              </div>
            </div>

            {/* Distance Unit */}
            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
              <div>
                <span className="font-extrabold text-slate-900 block">Distance Metric Unit</span>
                <span className="text-[10px] text-slate-500">Miles (mi) vs Kilometers (km)</span>
              </div>

              <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setDistanceUnit('mi')}
                  className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                    distanceUnit === 'mi' ? 'bg-slate-900 text-[#fcd502] shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Miles
                </button>
                <button
                  type="button"
                  onClick={() => setDistanceUnit('km')}
                  className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                    distanceUnit === 'km' ? 'bg-slate-900 text-[#fcd502] shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Km
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FIXED Bottom Action Bar - Elevated above iOS Home Indicator Line */}
      <div className="bg-white border-t border-slate-200 p-3.5 px-4 pb-[max(env(safe-area-inset-bottom,0px)+0.85rem,1.25rem)] flex-shrink-0 shadow-lg z-30">
        <button
          type="button"
          onClick={handleSave}
          className="w-full h-13 py-3.5 rounded-2xl bg-slate-900 hover:bg-black text-[#fcd502] font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-[0.98] cursor-pointer"
        >
          <span>Save Language & Region Preferences</span>
          <Check className="w-4 h-4 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};
