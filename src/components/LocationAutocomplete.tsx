/**
 * LocationAutocomplete — Smart location input powered by Nominatim (OpenStreetMap)
 * 100% free, no API key, debounced to respect usage policy
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, X, Search, Loader2, Navigation } from 'lucide-react';

export interface LocationSuggestion {
  displayName: string;
  shortName: string;
  lat: number;
  lng: number;
  type: string;         // e.g. "hospital", "airport", "city", "hotel"
  city?: string;
}

interface LocationAutocompleteProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string, suggestion?: LocationSuggestion) => void;
  icon?: 'pickup' | 'destination';
  className?: string;
}

// Popular Kerala pre-seeded suggestions (Ridingo Kerala Exclusive Service Zone)
const SEED_SUGGESTIONS: LocationSuggestion[] = [
  // Kochi / Ernakulam Hub
  { displayName: 'Marine Drive Walkway, Ernakulam, Kochi', shortName: 'Marine Drive, Kochi', lat: 9.9784, lng: 76.2757, type: 'city', city: 'Kochi' },
  { displayName: 'Cochin International Airport (COK), Nedumbassery', shortName: 'Cochin Airport (COK)', lat: 10.1520, lng: 76.4019, type: 'airport', city: 'Kochi' },
  { displayName: 'Infopark Phase 1 & 2, Kakkanad, Kochi', shortName: 'Infopark, Kakkanad', lat: 10.0112, lng: 76.3638, type: 'commercial', city: 'Kochi' },
  { displayName: 'Lulu International Shopping Mall, Edappally, Kochi', shortName: 'Lulu Mall, Edappally', lat: 10.0284, lng: 76.3079, type: 'commercial', city: 'Kochi' },
  { displayName: 'Fort Kochi Heritage Zone, Kochi', shortName: 'Fort Kochi', lat: 9.9658, lng: 76.2421, type: 'city', city: 'Kochi' },
  { displayName: 'MG Road Metro Station, Ernakulam, Kochi', shortName: 'MG Road Metro, Kochi', lat: 9.9734, lng: 76.2825, type: 'station', city: 'Kochi' },
  { displayName: 'Aster Medcity Hospital, Cheranallur, Kochi', shortName: 'Aster Medcity, Kochi', lat: 10.0531, lng: 76.2694, type: 'hospital', city: 'Kochi' },
  { displayName: 'Amrita Institute of Medical Sciences (AIMS), Edappally', shortName: 'Amrita Hospital, Kochi', lat: 10.0322, lng: 76.2897, type: 'hospital', city: 'Kochi' },
  
  // Thiruvananthapuram (Trivandrum) Hub
  { displayName: 'Trivandrum International Airport (TRV), Chacka', shortName: 'Trivandrum Airport (TRV)', lat: 8.4821, lng: 76.9200, type: 'airport', city: 'Thiruvananthapuram' },
  { displayName: 'Technopark Campus Phase 1-4, Kazhakkoottam, Trivandrum', shortName: 'Technopark, Trivandrum', lat: 8.5581, lng: 76.8812, type: 'commercial', city: 'Thiruvananthapuram' },
  { displayName: 'Kovalam Beach Promenade, Trivandrum', shortName: 'Kovalam Beach', lat: 8.4004, lng: 76.9787, type: 'city', city: 'Thiruvananthapuram' },
  { displayName: 'Thiruvananthapuram Central Railway Station, Thampanoor', shortName: 'Trivandrum Central', lat: 8.4870, lng: 76.9532, type: 'station', city: 'Thiruvananthapuram' },

  // Kozhikode (Calicut) Hub
  { displayName: 'Calicut International Airport (CCJ), Karipur', shortName: 'Calicut Airport (CCJ)', lat: 11.1368, lng: 75.9553, type: 'airport', city: 'Kozhikode' },
  { displayName: 'Kozhikode Beach & Mananchira Square, Calicut', shortName: 'Mananchira Square, Calicut', lat: 11.2505, lng: 75.7804, type: 'city', city: 'Kozhikode' },
  { displayName: 'Cyberpark Special Economic Zone, Nellikode, Calicut', shortName: 'Cyberpark, Calicut', lat: 11.2619, lng: 75.8364, type: 'commercial', city: 'Kozhikode' },

  // Other Major Kerala Hubs
  { displayName: 'Kannur International Airport (CNN), Mattannur', shortName: 'Kannur Airport (CNN)', lat: 11.9177, lng: 75.5484, type: 'airport', city: 'Kannur' },
  { displayName: 'Swaraj Round & Vadakkunnathan, Thrissur', shortName: 'Thrissur Round', lat: 10.5276, lng: 76.2144, type: 'city', city: 'Thrissur' },
  { displayName: 'Punnamada Finishing Point & Backwaters, Alappuzha', shortName: 'Alappuzha Backwaters', lat: 9.5011, lng: 76.3470, type: 'city', city: 'Alappuzha' },
  { displayName: 'Kumarakom Lake Resort & Bird Sanctuary, Kottayam', shortName: 'Kumarakom, Kottayam', lat: 9.6175, lng: 76.4301, type: 'hotel', city: 'Kottayam' },
  { displayName: 'Munnar Tea Estates & Town, Idukki', shortName: 'Munnar, Idukki', lat: 10.0889, lng: 77.0595, type: 'city', city: 'Idukki' },
];

const TYPE_ICONS: Record<string, string> = {
  airport: '✈️',
  hospital: '🏥',
  station: '🚉',
  hotel: '🏨',
  commercial: '🏢',
  city: '🌆',
  default: '📍',
};

async function fetchNominatim(query: string): Promise<LocationSuggestion[]> {
  try {
    // Restricted strictly to Kerala bounds (Viewbox: 74.85,12.85,77.40,8.15 & bounded=1)
    const keralaViewbox = '74.85,12.85,77.40,8.15';
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ', Kerala')}&format=json&limit=8&addressdetails=1&accept-language=en&viewbox=${keralaViewbox}&bounded=1&countrycodes=in`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    if (!res.ok) return [];
    const data: any[] = await res.json();

    return data
      .filter(item => {
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        // Strict Kerala boundary filter (Lat: 8.15 to 12.85, Lng: 74.85 to 77.40)
        return lat >= 8.15 && lat <= 12.85 && lng >= 74.85 && lng <= 77.40;
      })
      .map(item => {
        const typeRaw = (item.type || item.class || 'default') as string;
        const knownTypes = ['airport', 'hospital', 'station', 'hotel', 'commercial', 'city'];
        const type = knownTypes.find(t => typeRaw.includes(t)) ?? (item.class === 'place' ? 'city' : 'default');
        const city = item.address?.city || item.address?.town || item.address?.state || item.address?.county || 'Kerala';
        const shortName = item.display_name.split(',').slice(0, 2).join(',').trim();
        return {
          displayName: item.display_name,
          shortName,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          type,
          city,
        } as LocationSuggestion;
      });
  } catch (err) {
    console.warn('[Nominatim] Error fetching places:', err);
    return [];
  }
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  label,
  placeholder,
  value,
  onChange,
  icon = 'pickup',
  className = '',
}) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync external value changes
  useEffect(() => { setQuery(value); }, [value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleInput = useCallback((q: string) => {
    setQuery(q);
    onChange(q, undefined);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (q.trim().length < 2) {
      setSuggestions(SEED_SUGGESTIONS.slice(0, 6));
      setIsOpen(true);
      setIsLoading(false);
      return;
    }

    // Instant seed matching
    const seedMatches = SEED_SUGGESTIONS.filter(s =>
      s.displayName.toLowerCase().includes(q.toLowerCase()) ||
      s.shortName.toLowerCase().includes(q.toLowerCase()) ||
      s.city?.toLowerCase().includes(q.toLowerCase())
    );
    setSuggestions(seedMatches);
    setIsOpen(true);
    setIsLoading(true);

    // Debounced Nominatim API call (250ms)
    debounceRef.current = setTimeout(async () => {
      const results = await fetchNominatim(q);
      setSuggestions(() => {
        const merged = [...seedMatches];
        for (const r of results) {
          if (!merged.some(s => Math.abs(s.lat - r.lat) < 0.001)) {
            merged.push(r);
          }
        }
        return merged.length > 0 ? merged.slice(0, 8) : results.slice(0, 8);
      });
      setIsLoading(false);
    }, 250);
  }, [onChange]);

  const handleSelect = (s: LocationSuggestion) => {
    setQuery(s.shortName);
    onChange(s.shortName, s);
    setIsOpen(false);
  };

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    setIsOpen(false);

    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`);
          if (res.ok) {
            const data = await res.json();
            const displayName = data.display_name || `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
            const shortName = data.display_name ? data.display_name.split(',').slice(0, 2).join(',').trim() : 'Current Location';
            const city = data.address?.city || data.address?.town || data.address?.state || '';

            const suggestion: LocationSuggestion = {
              displayName,
              shortName,
              lat,
              lng,
              type: 'city',
              city,
            };

            setQuery(shortName);
            onChange(shortName, suggestion);
          } else {
            const fallback: LocationSuggestion = {
              displayName: 'Current Location',
              shortName: `Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
              lat,
              lng,
              type: 'city',
            };
            setQuery(fallback.shortName);
            onChange(fallback.shortName, fallback);
          }
        } catch {
          const fallback: LocationSuggestion = {
            displayName: 'Current Location',
            shortName: `Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
            lat,
            lng,
            type: 'city',
          };
          setQuery(fallback.shortName);
          onChange(fallback.shortName, fallback);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.warn('[GPS] Geolocation fallback:', err.message);
        // Fallback location: Connaught Place, New Delhi
        const fallback: LocationSuggestion = {
          displayName: 'Connaught Place, New Delhi',
          shortName: 'Connaught Place, Delhi (Current GPS)',
          lat: 28.6315,
          lng: 77.2167,
          type: 'commercial',
          city: 'New Delhi',
        };
        setQuery(fallback.shortName);
        onChange(fallback.shortName, fallback);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (query.trim().length < 2) {
      setSuggestions(SEED_SUGGESTIONS.slice(0, 6));
    } else {
      handleInput(query);
    }
    setIsOpen(true);
  };

  const dotColor = icon === 'pickup' ? 'bg-emerald-500' : 'bg-rose-500';

  return (
    <div ref={containerRef} className={`relative ${isFocused && isOpen ? 'z-50' : 'z-20'} ${className}`}>
      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-1.5">
        {label}
      </label>
      <div className={`flex items-center gap-2.5 bg-white border-2 rounded-xl px-3.5 py-3 transition-all ${isFocused && isOpen ? 'border-[#fcd502] shadow-md' : 'border-slate-200'}`}>
        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotColor}`} />
        <input
          type="text"
          value={query}
          onChange={e => handleInput(e.target.value)}
          onFocus={handleFocus}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder={placeholder}
          className="flex-1 text-sm font-extrabold text-slate-900 placeholder:text-slate-400/50 placeholder:font-medium outline-none bg-transparent min-w-0"
          autoComplete="off"
        />
        {(isLoading || isLocating) && <Loader2 className="w-4 h-4 text-[#a18200] animate-spin flex-shrink-0" />}
        
        {/* GPS Current Location Target Button */}
        {!isLocating && (
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors flex-shrink-0 cursor-pointer"
            title="Use My Current Location"
          >
            <Navigation className="w-4 h-4 fill-emerald-600/20 stroke-[2.2]" />
          </button>
        )}

        {query && !isLoading && !isLocating && (
          <button
            type="button"
            onClick={() => { setQuery(''); onChange('', undefined); setSuggestions(SEED_SUGGESTIONS.slice(0, 6)); setIsOpen(true); }}
            className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-slate-900/10">
          <div className="max-h-60 overflow-y-auto">
            {/* Top Choice: Use Current GPS Location */}
            <button
              type="button"
              onMouseDown={e => { e.preventDefault(); handleUseCurrentLocation(); }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 bg-emerald-50/80 hover:bg-emerald-100/90 text-left transition-colors border-b border-emerald-100 cursor-pointer group"
            >
              {isLocating ? (
                <Loader2 className="w-4 h-4 text-emerald-600 animate-spin flex-shrink-0" />
              ) : (
                <Navigation className="w-4 h-4 text-emerald-600 fill-emerald-600/30 stroke-[2.5] flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-emerald-950 group-hover:text-emerald-900">
                  {isLocating ? 'Detecting GPS location...' : 'Use Current Location'}
                </p>
                <p className="text-[10px] text-emerald-700 font-bold">Pick address automatically using device GPS</p>
              </div>
            </button>

            {isLoading && (
              <div className="px-4 py-2.5 flex items-center gap-2 text-xs text-slate-600 font-bold bg-amber-50/50 border-b border-amber-100/60">
                <Loader2 className="w-3.5 h-3.5 text-[#a18200] animate-spin flex-shrink-0" />
                <span>Searching OpenStreetMap for "{query}"...</span>
              </div>
            )}

            {!query.trim() && (
              <div className="px-3 py-1.5 flex items-center gap-1.5 bg-slate-50/70">
                <Search className="w-3 h-3 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Popular Destinations</span>
              </div>
            )}

            {!isLoading && suggestions.length === 0 && query.trim().length >= 2 && (
              <div className="px-4 py-3.5 text-center text-xs text-slate-500 font-medium">
                No places found for "{query}".<br/>
                <span className="text-[10px] text-slate-400 font-normal">Try entering a city, state, or landmark (e.g. Kerala, Delhi)</span>
              </div>
            )}

            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onMouseDown={e => { e.preventDefault(); handleSelect(s); }}
                className="w-full flex items-start gap-3 px-3.5 py-2.5 hover:bg-slate-100 text-left transition-colors border-b border-slate-100/80 last:border-0 cursor-pointer group"
              >
                <span className="text-base flex-shrink-0 mt-0.5">{TYPE_ICONS[s.type] ?? TYPE_ICONS.default}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 group-hover:text-[#a18200] transition-colors truncate">{s.shortName}</p>
                  <p className="text-[10px] text-slate-500 font-medium truncate">{s.displayName}</p>
                </div>
                <MapPin className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#fcd502] flex-shrink-0 mt-1 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};