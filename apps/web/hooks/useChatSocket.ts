import { useEffect, useRef, useState, useCallback } from 'react';
import { WebSocketService, wsManager } from '../services/websocketService';
import { useWebSocketStore } from '../stores/websocketStore';

interface ChatMessage {
  id: string;
  message: string;
  user_id: number;
  timestamp: string;
  read?: boolean;
}

interface IncomingBase { event: string }
interface IncomingMessage extends IncomingBase { event: 'message'; message: ChatMessage }
interface IncomingRead extends IncomingBase { event: 'read'; message_ids: string[]; user_id: number }
interface IncomingTyping extends IncomingBase { event: 'typing'; user_id: number; is_typing: boolean }
interface IncomingPresence extends IncomingBase { event: 'presence'; user_id: number; status: 'online' | 'offline' }

type IncomingChatEvent = IncomingMessage | IncomingRead | IncomingTyping | IncomingPresence | IncomingBase;

interface UseChatSocketOptions {
  roomId?: string | number;
  token?: string | null;
  onMessage?: (msg: ChatMessage) => void;
  onRead?: (data: { message_ids: string[]; user_id: number }) => void;
  onTyping?: (data: { user_id: number; is_typing: boolean }) => void;
  onPresence?: (data: { user_id: number; status: string }) => void;
  enabled?: boolean;
}

export function useChatSocket({
  roomId,
  token,
  onMessage,
  onRead,
  onTyping,
  onPresence,
  enabled = true
}: UseChatSocketOptions) {
  const wsRef = useRef<WebSocketService | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());

  const { addNotification } = useWebSocketStore();

  const handleChatEvent = useCallback((event: string, data: any) => {
    setError(null);

    switch (event) {
      case 'message':
        onMessage?.(data.message || data);
        break;

      case 'read':
        onRead?.({ message_ids: data.message_ids, user_id: data.user_id });
        break;

      case 'typing':
        onTyping?.({ user_id: data.user_id, is_typing: data.is_typing });
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          if (data.is_typing) {
            newSet.add(data.user_id);
          } else {
            newSet.delete(data.user_id);
          }
          return newSet;
        });
        break;

      case 'presence':
        onPresence?.({ user_id: data.user_id, status: data.status });
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          if (data.status === 'online') {
            newSet.add(data.user_id);
          } else {
            newSet.delete(data.user_id);
          }
          return newSet;
        });
        break;
    }
  }, [onMessage, onRead, onTyping, onPresence]);

  const connect = useCallback(() => {
    if (!enabled || !roomId || !token) return;

    try {
      const connection = wsManager.connectChat(String(roomId));
      wsRef.current = connection;

      connection.on('connected', () => {
        setConnected(true);
        setError(null);
      });

      connection.on('disconnected', () => {
        setConnected(false);
        setTypingUsers(new Set());
      });

      connection.on('error', (data) => {
        setError(data.error);
        setConnected(false);
      });

      connection.on('message', (data) => handleChatEvent('message', data));
      connection.on('read', (data) => handleChatEvent('read', data));
      connection.on('typing', (data) => handleChatEvent('typing', data));
      connection.on('presence', (data) => handleChatEvent('presence', data));

      if (connection.getState() === 'disconnected') {
        connection.connect();
      } else {
        setConnected(connection.getState() === 'connected');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to chat';
      setError(errorMessage);
    }
  }, [enabled, roomId, token, handleChatEvent]);

  useEffect(() => {
    connect();
    return () => {
      setTypingUsers(new Set());
      setOnlineUsers(new Set());
      wsRef.current = null;
    };
  }, [connect]);

  const sendMessage = useCallback((message: string): boolean => {
    if (wsRef.current && connected) {
      return wsRef.current.send({
        type: 'send_message',
        data: { message, room_id: roomId }
      });
    }
    return false;
  }, [connected, roomId]);

  const sendTyping = useCallback((is_typing: boolean): boolean => {
    if (wsRef.current && connected) {
      return wsRef.current.send({
        type: 'typing',
        data: { is_typing, room_id: roomId }
      });
    }
    return false;
  }, [connected, roomId]);

  const sendRead = useCallback((message_ids: string[]): boolean => {
    if (wsRef.current && connected && message_ids.length > 0) {
      return wsRef.current.send({
        type: 'read',
        data: { message_ids, room_id: roomId }
      });
    }
    return false;
  }, [connected, roomId]);

  return {
    connected,
    error,
    typingUsers: Array.from(typingUsers),
    onlineUsers: Array.from(onlineUsers),
    sendMessage,
    sendTyping,
    sendRead,
    reconnect: () => wsRef.current?.reconnect(),
    getStats: () => wsRef.current?.getStats() || null,
  };
}
