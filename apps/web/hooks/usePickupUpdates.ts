import { useEffect, useRef, useState, useCallback } from 'react';
import { WebSocketService, wsManager } from '../services/websocketService';
import { useWebSocketStore, PickupUpdate } from '../stores/websocketStore';

interface UsePickupUpdatesOptions {
  pickupId?: string;
  token?: string | null;
  enabled?: boolean;
  onCreated?: (pickup: any) => void;
  onUpdated?: (pickup: any) => void;
  onDeleted?: (id: number) => void;
  onStatusChange?: (pickup: PickupUpdate) => void;
}

/**
 * Enhanced WebSocket hook for pickup updates using the new WebSocket service
 * Integrates with the global WebSocket store for state management
 */
export function usePickupUpdates({
  pickupId,
  token,
  enabled = true,
  onCreated,
  onUpdated,
  onDeleted,
  onStatusChange
}: UsePickupUpdatesOptions) {
  const wsRef = useRef<WebSocketService | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Get WebSocket store actions
  const { addNotification, updatePickup } = useWebSocketStore();

  const handlePickupEvent = useCallback((event: string, data: any) => {
    setLastMessage({ event, data, timestamp: new Date().toISOString() });
    setError(null);

    switch (event) {
      case 'pickup_created':
        onCreated?.(data);
        addNotification({
          type: 'success',
          title: 'New Pickup Request',
          message: `Pickup request #${data.id} has been created`,
        });
        break;

      case 'pickup_updated':
        updatePickup(data);
        onUpdated?.(data);
        onStatusChange?.(data);

        // Notify about status changes
        if (data.status) {
          addNotification({
            type: 'info',
            title: 'Pickup Status Updated',
            message: `Pickup #${data.id} is now ${data.status}`,
          });
        }
        break;

      case 'pickup_deleted':
        onDeleted?.(data.pickup_id || data.id);
        addNotification({
          type: 'warning',
          title: 'Pickup Cancelled',
          message: `Pickup request #${data.pickup_id || data.id} has been cancelled`,
        });
        break;

      case 'pickup_assigned':
        updatePickup(data);
        addNotification({
          type: 'success',
          title: 'Pickup Assigned',
          message: `Pickup #${data.id} has been assigned to a worker`,
        });
        break;

      case 'pickup_completed':
        updatePickup(data);
        addNotification({
          type: 'success',
          title: 'Pickup Completed',
          message: `Pickup #${data.id} has been completed successfully`,
        });
        break;

      default:
        console.log('Unknown pickup event:', event, data);
    }
  }, [onCreated, onUpdated, onDeleted, onStatusChange, addNotification, updatePickup]);

  const connect = useCallback(() => {
    if (!enabled || !token) {
      return;
    }

    try {
      // Get connection from the manager
      const connection = pickupId
        ? wsManager.connectPickup(pickupId)
        : wsManager.connectPickup();

      wsRef.current = connection;

      // Set up event listeners
      connection.on('connected', () => {
        setConnected(true);
        setError(null);
      });

      connection.on('disconnected', () => {
        setConnected(false);
      });

      connection.on('error', (data) => {
        setError(data.error);
        setConnected(false);
      });

      // Pickup-specific event handlers
      connection.on('pickup_created', (data) => handlePickupEvent('pickup_created', data));
      connection.on('pickup_updated', (data) => handlePickupEvent('pickup_updated', data));
      connection.on('pickup_deleted', (data) => handlePickupEvent('pickup_deleted', data));
      connection.on('pickup_assigned', (data) => handlePickupEvent('pickup_assigned', data));
      connection.on('pickup_completed', (data) => handlePickupEvent('pickup_completed', data));

      // Generic message handler for any pickup-related messages
      connection.on('message', (message) => {
        if (message.type?.startsWith('pickup_')) {
          handlePickupEvent(message.type, message.data);
        }
      });

      // Connect if not already connected
      if (connection.getState() === 'disconnected') {
        connection.connect();
      } else {
        setConnected(connection.getState() === 'connected');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect';
      setError(errorMessage);
      console.error('Pickup WebSocket connection error:', err);
    }
  }, [enabled, token, pickupId, handlePickupEvent]);

  useEffect(() => {
    connect();

    return () => {
      // Don't disconnect here as the connection is managed globally
      // Just remove our local reference
      wsRef.current = null;
    };
  }, [connect]);

  // Send a message to the pickup WebSocket
  const sendMessage = useCallback((message: any) => {
    if (wsRef.current && connected) {
      return wsRef.current.send({
        type: message.type || 'pickup_message',
        data: message
      });
    }
    return false;
  }, [connected]);

  // Request pickup details
  const requestPickupDetails = useCallback((id: string) => {
    return sendMessage({
      type: 'get_pickup_details',
      pickup_id: id
    });
  }, [sendMessage]);

  // Subscribe to specific pickup updates
  const subscribeToPickup = useCallback((id: string) => {
    return sendMessage({
      type: 'subscribe_pickup',
      pickup_id: id
    });
  }, [sendMessage]);

  // Unsubscribe from pickup updates
  const unsubscribeFromPickup = useCallback((id: string) => {
    return sendMessage({
      type: 'unsubscribe_pickup',
      pickup_id: id
    });
  }, [sendMessage]);

  return {
    connected,
    error,
    lastMessage,
    sendMessage,
    requestPickupDetails,
    subscribeToPickup,
    unsubscribeFromPickup,
    reconnect: () => wsRef.current?.reconnect(),
    getStats: () => wsRef.current?.getStats() || null,
  };
}
