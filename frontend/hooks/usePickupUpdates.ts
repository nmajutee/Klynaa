import { useEffect, useRef, useState } from 'react';

interface PickupEventBase { event: string }
interface PickupCreatedEvent extends PickupEventBase { event: 'pickup_created'; pickup: any }
interface PickupUpdatedEvent extends PickupEventBase { event: 'pickup_updated'; pickup: any }
interface PickupDeletedEvent extends PickupEventBase { event: 'pickup_deleted'; pickup_id: number }

type IncomingPickupEvent = PickupCreatedEvent | PickupUpdatedEvent | PickupDeletedEvent | PickupEventBase;

interface UsePickupUpdatesOptions {
  token?: string | null;
  enabled?: boolean;
  path?: string; // e.g. /ws/pickups/
  onCreated?: (pickup: any) => void;
  onUpdated?: (pickup: any) => void;
  onDeleted?: (id: number) => void;
}

// Skeleton WebSocket hook for future real-time pickup updates.
// Back-end endpoint (e.g. /ws/pickups/) not yet confirmed; adjust path accordingly.
export function usePickupUpdates({ token, enabled = false, path = '/ws/pickups/', onCreated, onUpdated, onDeleted }: UsePickupUpdatesOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!enabled || !token) return;
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = window.location.host;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const url = `${proto}://${host}${normalized}?token=${token}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (e) => {
      try {
        const data: IncomingPickupEvent = JSON.parse(e.data);
        switch (data.event) {
          case 'pickup_created':
            onCreated?.((data as PickupCreatedEvent).pickup);
            break;
          case 'pickup_updated':
            onUpdated?.((data as PickupUpdatedEvent).pickup);
            break;
          case 'pickup_deleted':
            onDeleted?.((data as PickupDeletedEvent).pickup_id);
            break;
          default:
            break;
        }
      } catch {}
    };

    return () => { ws.close(); };
  }, [token, enabled, path, onCreated, onUpdated, onDeleted]);

  return { connected };
}
