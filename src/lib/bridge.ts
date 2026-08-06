/**
 * RidingoBridge — Real-time cross-tab communication between User App and Driver App
 * Uses the native BroadcastChannel API (no server required, same-origin tabs only).
 *
 * Channel: 'ridingo-dispatch'
 */

export type BridgeEventType =
  | 'BOOKING_REQUEST'
  | 'BOOKING_ACCEPTED'
  | 'BOOKING_DECLINED'
  | 'BOOKING_CANCELLED'
  | 'DRIVER_STATUS'
  | 'DRIVER_LOCATION'
  | 'TRIP_STARTED'
  | 'TRIP_COMPLETED';

export interface BookingRequestPayload {
  requestId: string;
  bookingNumber: string;
  customerName: string;
  customerRating: number;
  pickup: string;
  destination: string;
  serviceType: string;
  duration: string;
  totalFare: number;
  driverPayout: number;
  paymentMethod: string;
  flightNumber?: string;
  airlineName?: string;
  vehicleName?: string;
  timestamp: number;
}

export interface BookingResponsePayload {
  requestId: string;
  bookingNumber: string;
  driverName: string;
  driverRating: number;
  driverPhone: string;
  estimatedArrival?: string;
  status: 'accepted' | 'declined';
}

export interface DriverStatusPayload {
  online: boolean;
  driverName: string;
}

/** Streamed every ~3s when trip is active */
export interface DriverLocationPayload {
  bookingNumber: string;
  lat: number;
  lng: number;
  heading?: number;   // degrees 0-360
  speed?: number;     // km/h
  accuracy?: number;  // metres
  timestamp: number;
}

export interface TripEventPayload {
  bookingNumber: string;
  driverName: string;
  timestamp: number;
}

export type BridgePayload =
  | BookingRequestPayload
  | BookingResponsePayload
  | DriverStatusPayload
  | DriverLocationPayload
  | TripEventPayload
  | { requestId: string };

export interface BridgeMessage {
  type: BridgeEventType;
  payload: BridgePayload;
  sentFrom: 'user-app' | 'driver-app';
  sentAt: number;
}

const CHANNEL_NAME = 'ridingo-dispatch';
let _channel: BroadcastChannel | null = null;

function getChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === 'undefined') return null;
  if (!_channel) _channel = new BroadcastChannel(CHANNEL_NAME);
  return _channel;
}

export function bridgeSend(
  type: BridgeEventType,
  payload: BridgePayload,
  sentFrom: BridgeMessage['sentFrom']
): void {
  const message: BridgeMessage = { type, payload, sentFrom, sentAt: Date.now() };

  // 1. Post via BroadcastChannel
  const ch = getChannel();
  if (ch) {
    try {
      ch.postMessage(message);
    } catch (err) {
      console.error('[RidingoBridge] BC send error:', err);
    }
  }

  // 2. Post via LocalStorage fallback (ensures cross-tab delivery across all windows)
  try {
    localStorage.setItem('ridingo_bridge_event', JSON.stringify({ ...message, _nonce: Math.random() }));
  } catch {
    // ignore quota error
  }
}

export function bridgeListen(
  handler: (msg: BridgeMessage) => void
): () => void {
  const ch = getChannel();

  // 1. Listen via BroadcastChannel
  const bcListener = (event: MessageEvent<BridgeMessage>) => {
    const msg = event.data;
    if (!msg?.type || !msg?.sentFrom) return;
    if (Date.now() - msg.sentAt > 60_000) return; // ignore stale messages
    handler(msg);
  };

  if (ch) {
    ch.addEventListener('message', bcListener);
  }

  // 2. Listen via LocalStorage event (fallback for cross-window sync)
  const lsListener = (e: StorageEvent) => {
    if (e.key !== 'ridingo_bridge_event' || !e.newValue) return;
    try {
      const msg = JSON.parse(e.newValue) as BridgeMessage;
      if (!msg?.type || !msg?.sentFrom) return;
      if (Date.now() - msg.sentAt > 60_000) return;
      handler(msg);
    } catch {}
  };

  window.addEventListener('storage', lsListener);

  return () => {
    if (ch) ch.removeEventListener('message', bcListener);
    window.removeEventListener('storage', lsListener);
  };
}

export function bridgeClose(): void {
  if (_channel) { _channel.close(); _channel = null; }
}