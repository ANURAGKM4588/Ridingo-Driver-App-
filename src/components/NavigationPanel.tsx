/**
 * NavigationPanel — Turn-by-turn navigation for drivers
 * Powered by OSRM (free, no API key) via routing.ts
 */
import React, { useState } from 'react';
import {
  Navigation,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  CornerDownLeft,
  CornerDownRight,
  ArrowUp,
  RotateCcw,
  MapPin,
  Clock,
  Ruler,
  X,
} from 'lucide-react';
import type { Route, RouteStep } from '../lib/routing';
import { formatDistance, formatDuration } from '../lib/routing';

interface NavigationPanelProps {
  route: Route | null;
  isLoading: boolean;
  pickup: string;
  destination: string;
  currentStepIndex?: number;
  onClose?: () => void;
  onNextStep?: () => void;
}

const MANEUVER_ICONS: Record<string, React.ReactNode> = {
  'turn-left':  <CornerDownLeft  className="w-7 h-7" />,
  'turn-right': <CornerDownRight className="w-7 h-7" />,
  'straight':   <ArrowUp        className="w-7 h-7" />,
  'u-turn':     <RotateCcw      className="w-7 h-7" />,
  'arrive':     <MapPin         className="w-7 h-7" />,
  'depart':     <Navigation     className="w-7 h-7" />,
};

export const NavigationPanel: React.FC<NavigationPanelProps> = ({
  route,
  isLoading,
  pickup,
  destination,
  currentStepIndex = 0,
  onClose,
  onNextStep,
}) => {
  const [showAllSteps, setShowAllSteps] = useState(false);

  if (isLoading) {
    return (
      <div className="bg-[#121212] rounded-3xl p-4 space-y-3 border border-slate-800 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-800 rounded-lg w-3/4" />
            <div className="h-3 bg-slate-800 rounded-lg w-1/2" />
          </div>
        </div>
        <p className="text-[11px] text-slate-500 text-center font-medium">Calculating route via OSRM...</p>
      </div>
    );
  }

  if (!route) {
    return (
      <div className="bg-[#121212] rounded-3xl p-4 border border-slate-800 text-center space-y-2">
        <Navigation className="w-8 h-8 text-slate-600 mx-auto" />
        <p className="text-xs text-slate-400 font-medium">
          Route unavailable. Enter pickup &amp; destination to get directions.
        </p>
      </div>
    );
  }

  const currentStep: RouteStep | undefined = route.steps[currentStepIndex];
  const nextStep: RouteStep | undefined    = route.steps[currentStepIndex + 1];
  const progress = Math.min(100, Math.round((currentStepIndex / Math.max(route.steps.length - 1, 1)) * 100));

  return (
    <div className="bg-[#121212] rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">

      {/* ── TOP: Current Maneuver ── */}
      <div className="p-4 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          {/* Maneuver icon */}
          <div className="w-12 h-12 rounded-2xl bg-[#fcd502] text-[#121212] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#fcd502]/20">
            {MANEUVER_ICONS[currentStep?.maneuver ?? 'straight'] ?? <ArrowUp className="w-7 h-7" />}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-white font-black text-sm leading-tight truncate">
              {currentStep?.instruction ?? 'Follow the route'}
            </p>
            {nextStep && (
              <p className="text-slate-400 text-[11px] font-medium mt-0.5 truncate">
                Then: {nextStep.instruction}
              </p>
            )}
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center flex-shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#fcd502] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1.5 text-[10px] text-slate-500 font-medium">
          <span>Step {currentStepIndex + 1} of {route.steps.length}</span>
          <span>{progress}% complete</span>
        </div>
      </div>

      {/* ── MIDDLE: Route Summary ── */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-slate-800/60">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-white">
            <Clock className="w-3.5 h-3.5 text-[#fcd502]" />
            <span className="text-sm font-black">{formatDuration(route.duration)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Ruler className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">{formatDistance(route.distance)}</span>
          </div>
        </div>

        {onNextStep && currentStepIndex < route.steps.length - 1 && (
          <button
            type="button"
            onClick={onNextStep}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fcd502] text-[#121212] font-black text-[11px] cursor-pointer hover:bg-amber-400 active:scale-95 transition-all"
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ── BOTTOM: Route endpoints + expand ── */}
      <div className="px-4 py-3 space-y-2">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
          <span className="text-slate-300 font-medium truncate">{pickup}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 flex-shrink-0" />
          <span className="text-slate-300 font-medium truncate">{destination}</span>
        </div>

        {/* All steps toggle */}
        <button
          type="button"
          onClick={() => setShowAllSteps(!showAllSteps)}
          className="w-full flex items-center justify-center gap-1.5 pt-2 text-[11px] text-slate-500 hover:text-slate-300 font-bold transition-colors cursor-pointer"
        >
          {showAllSteps ? (
            <><ChevronUp className="w-3.5 h-3.5" /> Hide all steps</>
          ) : (
            <><ChevronRight className="w-3.5 h-3.5" /> Show all {route.steps.length} steps</>
          )}
        </button>
      </div>

      {/* ── ALL STEPS LIST ── */}
      {showAllSteps && (
        <div className="border-t border-slate-800/60 max-h-48 overflow-y-auto">
          {route.steps.map((step, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-4 py-2.5 border-b border-slate-800/40 last:border-0 ${
                i === currentStepIndex ? 'bg-[#fcd502]/10' : ''
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black ${
                i === currentStepIndex ? 'bg-[#fcd502] text-[#121212]' :
                i < currentStepIndex  ? 'bg-emerald-500/20 text-emerald-400' :
                'bg-slate-800 text-slate-400'
              }`}>
                {i < currentStepIndex ? '✓' : i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[11px] font-semibold truncate ${i === currentStepIndex ? 'text-white' : 'text-slate-400'}`}>
                  {step.instruction}
                </p>
                <p className="text-[10px] text-slate-600 font-medium">
                  {formatDistance(step.distance)} · {formatDuration(step.duration)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};