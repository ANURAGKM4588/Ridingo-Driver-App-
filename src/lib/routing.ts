/**
 * routing.ts — OSRM (Open Source Routing Machine) integration
 * Free, no API key, uses OpenStreetMap road data.
 * Public endpoint: router.project-osrm.org
 */

export interface RouteStep {
  instruction: string;
  distance: number;     // metres
  duration: number;     // seconds
  maneuver: string;     // 'turn-left' | 'turn-right' | 'straight' | 'roundabout' | 'arrive' | 'depart'
  streetName: string;
}

export interface Route {
  distance: number;       // total metres
  duration: number;       // total seconds
  geometry: [number, number][];  // [lng, lat] pairs
  steps: RouteStep[];
}

const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';

function parseManeuver(modifier?: string, type?: string): string {
  if (type === 'arrive') return 'arrive';
  if (type === 'depart') return 'depart';
  if (!modifier) return 'straight';
  if (modifier.includes('left')) return 'turn-left';
  if (modifier.includes('right')) return 'turn-right';
  if (modifier.includes('straight')) return 'straight';
  if (modifier.includes('uturn')) return 'u-turn';
  return 'straight';
}

function buildInstruction(step: any): string {
  const type = step.maneuver?.type ?? '';
  const modifier = step.maneuver?.modifier ?? '';
  const name = step.name || 'the road';
  const dist = step.distance < 1000
    ? `${Math.round(step.distance)}m`
    : `${(step.distance / 1000).toFixed(1)}km`;

  if (type === 'depart') return `Head onto ${name}`;
  if (type === 'arrive') return `Arrive at your destination`;
  if (type === 'turn') {
    const dir = modifier.includes('left') ? 'left' : modifier.includes('right') ? 'right' : modifier;
    return `Turn ${dir} onto ${name} (${dist})`;
  }
  if (type === 'merge') return `Merge onto ${name}`;
  if (type === 'roundabout') return `At the roundabout, take the exit onto ${name}`;
  if (type === 'fork') return `Keep ${modifier} at the fork onto ${name}`;
  return `Continue on ${name} for ${dist}`;
}

export async function fetchRoute(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): Promise<Route | null> {
  try {
    const url = `${OSRM_BASE}/${from.lng},${from.lat};${to.lng},${to.lat}?steps=true&geometries=geojson&overview=full`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OSRM error: ${res.status}`);
    const data = await res.json();

    if (!data.routes?.length) return null;
    const r = data.routes[0];

    const steps: RouteStep[] = (r.legs?.[0]?.steps ?? []).map((s: any) => ({
      instruction: buildInstruction(s),
      distance: s.distance,
      duration: s.duration,
      maneuver: parseManeuver(s.maneuver?.modifier, s.maneuver?.type),
      streetName: s.name || '',
    }));

    const geometry: [number, number][] = r.geometry?.coordinates ?? [];

    return {
      distance: r.distance,
      duration: r.duration,
      geometry,
      steps,
    };
  } catch (err) {
    console.warn('[OSRM] Route fetch failed:', err);
    return null;
  }
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `< 1 min`;
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
}

export function formatDistance(metres: number): string {
  if (metres < 1000) return `${Math.round(metres)} m`;
  return `${(metres / 1000).toFixed(1)} km`;
}