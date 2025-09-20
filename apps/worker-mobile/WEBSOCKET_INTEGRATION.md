# Mobile App WebSocket Integration Guide

## Overview
This guide provides implementation details for integrating WebSocket real-time features into the Klynaa mobile worker application using React Native.

## Architecture

### WebSocket Service for React Native
```typescript
// services/websocketService.ts
import { EventEmitter } from 'events';

interface WebSocketConfig {
  url: string;
  token?: string;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  debug?: boolean;
}

export class MobileWebSocketService extends EventEmitter {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private state: 'connecting' | 'connected' | 'disconnected' | 'error' = 'disconnected';
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(config: WebSocketConfig) {
    super();
    this.config = {
      autoReconnect: true,
      reconnectInterval: 3000,
      maxReconnectAttempts: 10,
      debug: __DEV__,
      ...config
    };
  }

  connect(): void {
    if (this.state === 'connecting' || this.state === 'connected') {
      return;
    }

    this.state = 'connecting';

    try {
      const url = this.buildUrl();
      this.ws = new WebSocket(url);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onerror = this.handleError.bind(this);
    } catch (error) {
      this.handleError(error);
    }
  }

  private buildUrl(): string {
    let url = this.config.url;
    if (this.config.token) {
      const separator = url.includes('?') ? '&' : '?';
      url += `${separator}token=${encodeURIComponent(this.config.token)}`;
    }
    return url;
  }

  send(message: any): boolean {
    if (this.state !== 'connected' || !this.ws) {
      return false;
    }

    try {
      this.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      this.emit('error', { error: error.message });
      return false;
    }
  }

  disconnect(): void {
    this.config.autoReconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    if (this.ws) {
      this.ws.close();
    }
  }

  private handleOpen(): void {
    this.state = 'connected';
    this.reconnectAttempts = 0;
    this.emit('connected');
  }

  private handleClose(event: CloseEvent): void {
    this.state = 'disconnected';
    this.emit('disconnected', { code: event.code, reason: event.reason });

    if (this.config.autoReconnect && event.code !== 1000) {
      this.attemptReconnect();
    }
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data);
      this.emit('message', message);

      if (message.type) {
        this.emit(message.type, message.data);
      }
    } catch (error) {
      this.emit('parse-error', { error: error.message, data: event.data });
    }
  }

  private handleError(error: any): void {
    this.state = 'error';
    this.emit('error', { error: error.message || 'WebSocket error' });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts!) {
      this.emit('reconnect-failed', { attempts: this.reconnectAttempts });
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.config.reconnectInterval! * Math.pow(2, this.reconnectAttempts - 1),
      30000
    );

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);

    this.emit('reconnecting', { attempt: this.reconnectAttempts, delay });
  }
}
```

### React Native Hooks

#### useWorkerWebSocket Hook
```typescript
// hooks/useWorkerWebSocket.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { AppState, NetInfo } from 'react-native';
import { MobileWebSocketService } from '../services/websocketService';

interface UseWorkerWebSocketOptions {
  workerId: string;
  token: string;
  onLocationUpdate?: (location: { latitude: number; longitude: number }) => void;
  onPickupAssignment?: (pickup: any) => void;
  onStatusChange?: (status: string) => void;
}

export function useWorkerWebSocket({
  workerId,
  token,
  onLocationUpdate,
  onPickupAssignment,
  onStatusChange
}: UseWorkerWebSocketOptions) {
  const wsRef = useRef<MobileWebSocketService | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        // Reconnect when app becomes active
        wsRef.current?.connect();
      } else if (nextAppState === 'background') {
        // Keep connection alive in background for notifications
        // Consider implementing background task
      }
    };

    AppState.addEventListener('change', handleAppStateChange);
    return () => AppState.removeEventListener('change', handleAppStateChange);
  }, []);

  // Handle network connectivity changes
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected && wsRef.current && !connected) {
        wsRef.current.connect();
      }
    });

    return unsubscribe;
  }, [connected]);

  const connect = useCallback(() => {
    if (!token || !workerId) return;

    const baseUrl = __DEV__
      ? 'ws://localhost:8003'
      : 'wss://api.klynaa.com';

    const wsService = new MobileWebSocketService({
      url: `${baseUrl}/ws/worker/${workerId}/`,
      token,
      autoReconnect: true,
      debug: __DEV__
    });

    wsRef.current = wsService;

    // Connection events
    wsService.on('connected', () => {
      setConnected(true);
      setError(null);
    });

    wsService.on('disconnected', () => {
      setConnected(false);
    });

    wsService.on('error', ({ error }) => {
      setError(error);
      setConnected(false);
    });

    // Worker-specific events
    wsService.on('pickup_assigned', onPickupAssignment);
    wsService.on('location_update_request', onLocationUpdate);
    wsService.on('status_change', onStatusChange);

    wsService.connect();
  }, [token, workerId, onLocationUpdate, onPickupAssignment, onStatusChange]);

  useEffect(() => {
    connect();

    return () => {
      wsRef.current?.disconnect();
    };
  }, [connect]);

  // Send worker location update
  const sendLocationUpdate = useCallback((location: { latitude: number; longitude: number }) => {
    return wsRef.current?.send({
      type: 'location_update',
      data: {
        worker_id: workerId,
        location,
        timestamp: new Date().toISOString()
      }
    }) || false;
  }, [workerId]);

  // Update worker status
  const updateStatus = useCallback((status: 'online' | 'busy' | 'offline') => {
    return wsRef.current?.send({
      type: 'status_update',
      data: {
        worker_id: workerId,
        status,
        timestamp: new Date().toISOString()
      }
    }) || false;
  }, [workerId]);

  // Accept pickup assignment
  const acceptPickup = useCallback((pickupId: string) => {
    return wsRef.current?.send({
      type: 'accept_pickup',
      data: {
        worker_id: workerId,
        pickup_id: pickupId,
        timestamp: new Date().toISOString()
      }
    }) || false;
  }, [workerId]);

  return {
    connected,
    error,
    sendLocationUpdate,
    updateStatus,
    acceptPickup,
    reconnect: () => wsRef.current?.connect()
  };
}
```

### Location Tracking Integration

#### Background Location Updates
```typescript
// services/locationService.ts
import BackgroundGeolocation from '@react-native-community/geolocation';
import { Platform, PermissionsAndroid } from 'react-native';

class LocationService {
  private watchId: number | null = null;
  private lastLocation: { latitude: number; longitude: number } | null = null;
  private locationCallback: ((location: { latitude: number; longitude: number }) => void) | null = null;

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true; // iOS handled by Info.plist
  }

  startTracking(callback: (location: { latitude: number; longitude: number }) => void): void {
    this.locationCallback = callback;

    this.watchId = BackgroundGeolocation.watchPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };

        // Only send updates if location changed significantly (>10 meters)
        if (this.shouldSendUpdate(location)) {
          this.lastLocation = location;
          callback(location);
        }
      },
      (error) => {
        console.error('Location error:', error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10, // Update every 10 meters
        interval: 30000,    // Update every 30 seconds
        fastestInterval: 15000
      }
    );
  }

  stopTracking(): void {
    if (this.watchId !== null) {
      BackgroundGeolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  private shouldSendUpdate(newLocation: { latitude: number; longitude: number }): boolean {
    if (!this.lastLocation) return true;

    const distance = this.calculateDistance(this.lastLocation, newLocation);
    return distance > 10; // 10 meters threshold
  }

  private calculateDistance(
    loc1: { latitude: number; longitude: number },
    loc2: { latitude: number; longitude: number }
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = loc1.latitude * Math.PI / 180;
    const φ2 = loc2.latitude * Math.PI / 180;
    const Δφ = (loc2.latitude - loc1.latitude) * Math.PI / 180;
    const Δλ = (loc2.longitude - loc1.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }
}

export const locationService = new LocationService();
```

### Push Notifications Integration

#### Setup for Real-time Notifications
```typescript
// services/notificationService.ts
import PushNotification from 'react-native-push-notification';
import messaging from '@react-native-firebase/messaging';

class NotificationService {
  configure(): void {
    PushNotification.configure({
      onNotification: function(notification) {
        console.log('Notification:', notification);
      },
      requestPermissions: Platform.OS === 'ios'
    });

    // Handle Firebase Cloud Messaging
    messaging().onMessage(async remoteMessage => {
      this.showLocalNotification({
        title: remoteMessage.notification?.title || 'Klynaa',
        message: remoteMessage.notification?.body || 'New notification',
        data: remoteMessage.data
      });
    });
  }

  showLocalNotification({ title, message, data }: any): void {
    PushNotification.localNotification({
      title,
      message,
      userInfo: data,
      playSound: true,
      soundName: 'default'
    });
  }

  // Show pickup assignment notification
  showPickupNotification(pickup: any): void {
    this.showLocalNotification({
      title: 'New Pickup Assignment',
      message: `You have been assigned pickup #${pickup.id}`,
      data: { pickupId: pickup.id, type: 'pickup_assignment' }
    });
  }
}

export const notificationService = new NotificationService();
```

### Main Worker Component Integration

```typescript
// components/WorkerDashboard.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Switch, Alert } from 'react-native';
import { useWorkerWebSocket } from '../hooks/useWorkerWebSocket';
import { locationService } from '../services/locationService';
import { notificationService } from '../services/notificationService';

interface WorkerDashboardProps {
  workerId: string;
  token: string;
}

export const WorkerDashboard: React.FC<WorkerDashboardProps> = ({ workerId, token }) => {
  const [status, setStatus] = useState<'online' | 'offline'>('offline');

  const {
    connected,
    error,
    sendLocationUpdate,
    updateStatus,
    acceptPickup
  } = useWorkerWebSocket({
    workerId,
    token,
    onLocationUpdate: (location) => {
      // Handle location update requests from server
      locationService.startTracking((loc) => {
        sendLocationUpdate(loc);
      });
    },
    onPickupAssignment: (pickup) => {
      // Show notification and prompt for acceptance
      notificationService.showPickupNotification(pickup);
      Alert.alert(
        'New Pickup Assignment',
        `Pickup #${pickup.id} has been assigned to you`,
        [
          { text: 'Decline', style: 'cancel' },
          { text: 'Accept', onPress: () => acceptPickup(pickup.id) }
        ]
      );
    }
  });

  const handleStatusToggle = async (isOnline: boolean) => {
    const newStatus = isOnline ? 'online' : 'offline';

    if (isOnline) {
      // Request location permissions when going online
      const hasPermission = await locationService.requestPermissions();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Location access is required for pickup services');
        return;
      }

      // Start location tracking
      locationService.startTracking(sendLocationUpdate);
    } else {
      // Stop location tracking when going offline
      locationService.stopTracking();
    }

    updateStatus(newStatus);
    setStatus(newStatus);
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Worker Status: {status}</Text>
      <Text>WebSocket: {connected ? 'Connected' : 'Disconnected'}</Text>
      {error && <Text style={{ color: 'red' }}>Error: {error}</Text>}

      <Switch
        value={status === 'online'}
        onValueChange={handleStatusToggle}
      />
    </View>
  );
};
```

## Network Resilience Features

### Offline Queue Management
```typescript
// services/offlineQueue.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

class OfflineQueue {
  private queueKey = '@klynaa_offline_queue';

  async addToQueue(message: any): Promise<void> {
    try {
      const queue = await this.getQueue();
      queue.push({
        ...message,
        timestamp: new Date().toISOString()
      });
      await AsyncStorage.setItem(this.queueKey, JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to add to offline queue:', error);
    }
  }

  async processQueue(sendMessage: (msg: any) => boolean): Promise<void> {
    try {
      const queue = await this.getQueue();
      const successful: any[] = [];

      for (const message of queue) {
        if (sendMessage(message)) {
          successful.push(message);
        }
      }

      // Remove successfully sent messages from queue
      const remaining = queue.filter(msg => !successful.includes(msg));
      await AsyncStorage.setItem(this.queueKey, JSON.stringify(remaining));

    } catch (error) {
      console.error('Failed to process offline queue:', error);
    }
  }

  private async getQueue(): Promise<any[]> {
    try {
      const queueData = await AsyncStorage.getItem(this.queueKey);
      return queueData ? JSON.parse(queueData) : [];
    } catch (error) {
      return [];
    }
  }
}

export const offlineQueue = new OfflineQueue();
```

## Implementation Checklist

- [ ] Install required dependencies (`react-native-geolocation`, `@react-native-firebase/messaging`, etc.)
- [ ] Configure iOS/Android permissions for location and notifications
- [ ] Implement WebSocket service with auto-reconnection
- [ ] Add location tracking with background capabilities
- [ ] Set up push notifications for offline scenarios
- [ ] Implement offline message queuing
- [ ] Add network state monitoring
- [ ] Test with various network conditions
- [ ] Implement battery optimization handling
- [ ] Add comprehensive error handling and logging

## Testing Recommendations

1. **Network Simulation**: Test with various network conditions (slow 3G, WiFi, airplane mode)
2. **Battery Testing**: Ensure location tracking doesn't drain battery excessively
3. **Background Testing**: Verify WebSocket connections work when app is backgrounded
4. **Permission Testing**: Test permission flows on both iOS and Android
5. **Offline Testing**: Verify offline queue functionality and sync when reconnected

## Security Considerations

- Implement proper token refresh mechanisms
- Validate all incoming WebSocket messages
- Encrypt sensitive location data
- Implement rate limiting for location updates
- Add authentication verification for WebSocket connections