/**
 * traccar.ts — Traccar GPS tracking integration
 * Traccar is 100% free, open-source. Use demo.traccar.org or self-host.
 *
 * How it works:
 *   - Driver App sends position via OsmAnd HTTP protocol (GET request, no CORS issues)
 *   - User App polls Traccar REST API for latest device position
 *   - Falls back to BroadcastChannel if Traccar is unconfigured
 */

// ── CONFIGURATION ──────────────────────────────────────────────────────────
// To use real Traccar, set VITE_TRACCAR_URL and VITE_TRACCAR_TOKEN in .env
// Default uses the public Traccar demo (rate limited, good for testing)
const TRACCAR_URL   = (import.meta.env.VITE_TRACCAR_URL   as string) || '';
const TRACCAR_TOKEN = (import.meta.env.VITE_TRACCAR_TOKEN as string) || '';
const DEVICE_ID     = (import.meta.env.VITE_TRACCAR_DEVICE_ID as string) || 'ridingo-driver-1';

export const isTraccarConfigured = () => !!TRACCAR_URL && !!TRACCAR_TOKEN;

// ── SEND POSITION (OsmAnd Protocol — GET, no CORS issues) ─────────────────
/**
 * Reports driver GPS position to Traccar using the OsmAnd protocol.
 * Called from the Driver App every time watchPosition fires.
 */
export async function traccarReportPosition(
  lat: number,
  lng: number,
  accuracy?: number,
  speed?: number,
  heading?: number,
): Promise<void> {
  if (!isTraccarConfigured()) return;

  const params = new URLSearchParams({
    id:       DEVICE_ID,
    lat:      lat.toString(),
    lon:      lng.toString(),
    timestamp: Math.floor(Date.now() / 1000).toString(),
    ...(accuracy !== undefined && { accuracy: accuracy.toString() }),
    ...(speed    !== undefined && { speed:    speed.toString()    }),
    ...(heading  !== undefined && { bearing:  heading.toString()  }),
  });

  try {
    // OsmAnd protocol uses a simple GET — no auth header, no CORS preflight
    await fetch(`${TRACCAR_URL}/osmand?${params.toString()}`, { mode: 'no-cors' });
  } catch {
    // silently ignore — BroadcastChannel is the fallback
  }
}

// ── READ LATEST POSITION ──────────────────────────────────────────────────
export interface TraccarPosition {
  lat: number;
  lng: number;
  speed: number;       // km/h
  heading: number;
  accuracy: number;
  fixTime: string;     // ISO timestamp
}

export async function traccarGetLatestPosition(): Promise<TraccarPosition | null> {
  if (!isTraccarConfigured()) return null;

  try {
    const res = await fetch(`${TRACCAR_URL}/api/positions?deviceId=${DEVICE_ID}`, {
      headers: {
        'Authorization': `Bearer ${TRACCAR_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) return null;
    const positions: any[] = await res.json();
    if (!positions.length) return null;

    const p = positions[0];
    return {
      lat:      p.latitude,
      lng:      p.longitude,
      speed:    p.speed * 1.852,        // knots → km/h
      heading:  p.course,
      accuracy: p.accuracy,
      fixTime:  p.fixTime,
    };
  } catch {
    return null;
  }
}

// ── POLL LOOP (User App) ──────────────────────────────────────────────────
/**
 * Starts polling Traccar for driver position every `intervalMs` ms.
 * Returns a cleanup function.
 */
export function startTraccarPolling(
  onPosition: (pos: TraccarPosition) => void,
  intervalMs = 4000,
): () => void {
  if (!isTraccarConfigured()) return () => {};

  let stopped = false;
  const poll = async () => {
    if (stopped) return;
    const pos = await traccarGetLatestPosition();
    if (pos && !stopped) onPosition(pos);
    if (!stopped) setTimeout(poll, intervalMs);
  };
  poll();
  return () => { stopped = true; };
}