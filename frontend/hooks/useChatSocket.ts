import { useEffect, useRef, useState, useCallback } from 'react';

interface IncomingBase { event: string }
interface IncomingMessage extends IncomingBase { event: 'message'; message: any }
interface IncomingRead extends IncomingBase { event: 'read'; message_ids: string[]; user_id: number }
interface IncomingTyping extends IncomingBase { event: 'typing'; user_id: number; is_typing: boolean }
interface IncomingPresence extends IncomingBase { event: 'presence'; user_id: number; status: 'online' | 'offline' }

type Incoming = IncomingMessage | IncomingRead | IncomingTyping | IncomingPresence | IncomingBase;

interface UseChatSocketOptions {
  roomId?: string | number;
  token?: string | null;
  onMessage?: (msg: any) => void;
  onRead?: (data: { message_ids: string[]; user_id: number }) => void;
  onTyping?: (data: { user_id: number; is_typing: boolean }) => void;
  onPresence?: (data: { user_id: number; status: string }) => void;
  enabled?: boolean;
}

export function useChatSocket({ roomId, token, onMessage, onRead, onTyping, onPresence, enabled = true }: UseChatSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [manualClosed, setManualClosed] = useState(false);
  const reconnectRef = useRef<number>(0);

  const connect = useCallback(() => {
    if (!enabled || !roomId || !token) return;
    const urlBase = (typeof window !== 'undefined' && window.location.protocol === 'https:') ? 'wss' : 'ws';
    const host = typeof window !== 'undefined' ? window.location.host : '';
    const wsUrl = `${urlBase}://${host}/ws/chat/${roomId}/?token=${token}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      reconnectRef.current = 0;
    };

    ws.onclose = () => {
      setConnected(false);
      if (!manualClosed) {
        const timeout = Math.min(10000, 1000 * Math.pow(2, reconnectRef.current));
        reconnectRef.current += 1;
        setTimeout(connect, timeout);
      }
    };

    ws.onmessage = (e) => {
      try {
        const data: Incoming = JSON.parse(e.data);
        switch (data.event) {
          case 'message':
            onMessage?.((data as IncomingMessage).message);
            break;
          case 'read':
            onRead?.({ message_ids: (data as IncomingRead).message_ids, user_id: (data as IncomingRead).user_id });
            break;
          case 'typing':
            onTyping?.({ user_id: (data as IncomingTyping).user_id, is_typing: (data as IncomingTyping).is_typing });
            break;
          case 'presence':
            onPresence?.({ user_id: (data as IncomingPresence).user_id, status: (data as IncomingPresence).status });
            break;
          default:
            break;
        }
      } catch (err) {
        // ignore
      }
    };
  }, [enabled, roomId, token, onMessage, onRead, onTyping, onPresence]);

  useEffect(() => {
    connect();
    return () => {
      setManualClosed(true);
      wsRef.current?.close();
    };
  }, [connect]);

  const sendMessage = (message: string) => {
    if (wsRef.current && connected) {
      wsRef.current.send(JSON.stringify({ action: 'send_message', message }));
    }
  };

  const sendTyping = (is_typing: boolean) => {
    if (wsRef.current && connected) {
      wsRef.current.send(JSON.stringify({ action: 'typing', is_typing }));
    }
  };

  const sendRead = (message_ids: string[]) => {
    if (wsRef.current && connected && message_ids.length) {
      wsRef.current.send(JSON.stringify({ action: 'read', message_ids }));
    }
  };

  return { connected, sendMessage, sendTyping, sendRead };
}
