import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { WebSocketService, WebSocketState, ConnectionStats, wsManager } from '../services/websocketService';

/**
 * Real-time Data Types
 */
export interface PickupUpdate {
  id: number;
  status: string;
  worker_id?: number;
  location?: {
    latitude: number;
    longitude: number;
  };
  scheduled_time?: string;
  updated_at: string;
}

export interface WorkerUpdate {
  id: number;
  status: 'online' | 'offline' | 'busy';
  current_location?: {
    latitude: number;
    longitude: number;
  };
  active_pickups?: number[];
  updated_at: string;
}

export interface SystemNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read?: boolean;
}

export interface ConnectionInfo {
  endpoint: string;
  state: WebSocketState;
  stats: ConnectionStats;
  lastError?: string;
}

/**
 * WebSocket Store State
 */
interface WebSocketStore {
  // Connection Management
  connections: Record<string, ConnectionInfo>;
  globalConnected: boolean;

  // Real-time Data
  pickupUpdates: Record<number, PickupUpdate>;
  workerUpdates: Record<number, WorkerUpdate>;
  notifications: SystemNotification[];

  // UI State
  showConnectionStatus: boolean;
  soundEnabled: boolean;

  // Actions
  initializeConnections: (token: string, userId: string, userRole: string) => void;
  disconnectAll: () => void;

  // Connection Management
  addConnection: (endpoint: string, connection: WebSocketService) => void;
  removeConnection: (endpoint: string) => void;
  updateConnectionState: (endpoint: string, state: WebSocketState, stats?: ConnectionStats) => void;

  // Real-time Data Updates
  updatePickup: (pickup: PickupUpdate) => void;
  updateWorker: (worker: WorkerUpdate) => void;
  addNotification: (notification: Omit<SystemNotification, 'id' | 'timestamp'>) => void;
  markNotificationRead: (notificationId: string) => void;
  clearNotifications: () => void;

  // UI Actions
  toggleConnectionStatus: () => void;
  toggleSound: () => void;

  // Data Getters
  getActivePickups: () => PickupUpdate[];
  getOnlineWorkers: () => WorkerUpdate[];
  getUnreadNotifications: () => SystemNotification[];
}

/**
 * Create WebSocket Store with subscribeWithSelector middleware for fine-grained reactivity
 */
export const useWebSocketStore = create<WebSocketStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial State
    connections: {},
    globalConnected: false,
    pickupUpdates: {},
    workerUpdates: {},
    notifications: [],
    showConnectionStatus: false,
    soundEnabled: true,

    // Initialize connections based on user role
    initializeConnections: (token: string, userId: string, userRole: string) => {
      console.log('🔌 Initializing WebSocket connections', { userId, userRole });

      wsManager.setToken(token);

      const { addConnection } = get();

      // Base connections for all users
      const generalPickup = wsManager.connectPickup();
      addConnection('/ws/pickup/general/', generalPickup);

      // Role-specific connections
      if (userRole === 'customer') {
        const customerConnection = wsManager.connectCustomer(userId);
        addConnection(`/ws/customer/${userId}/`, customerConnection);

      } else if (userRole === 'worker') {
        const workerConnection = wsManager.connectWorker(userId);
        addConnection(`/ws/worker/${userId}/`, workerConnection);

      } else if (userRole === 'admin') {
        // Admin gets all connections
        const customerConnection = wsManager.connectCustomer(userId);
        const workerConnection = wsManager.connectWorker(userId);
        addConnection(`/ws/customer/${userId}/`, customerConnection);
        addConnection(`/ws/worker/${userId}/`, workerConnection);
      }

      // Set up global event handlers
      Object.values(get().connections).forEach(({ endpoint }) => {
        const connection = wsManager.getConnection(endpoint);

        // Connection state events
        connection.on('connected', () => {
          get().updateConnectionState(endpoint, 'connected', connection.getStats());
          get().addNotification({
            type: 'success',
            title: 'Connection Restored',
            message: `Connected to ${endpoint}`,
          });
        });

        connection.on('disconnected', () => {
          get().updateConnectionState(endpoint, 'disconnected', connection.getStats());
          get().addNotification({
            type: 'warning',
            title: 'Connection Lost',
            message: `Disconnected from ${endpoint}`,
          });
        });

        connection.on('reconnecting', (data) => {
          get().updateConnectionState(endpoint, 'reconnecting', connection.getStats());
          if (data.attempt === 1) { // Only notify on first reconnect attempt
            get().addNotification({
              type: 'info',
              title: 'Reconnecting...',
              message: `Attempting to reconnect to ${endpoint}`,
            });
          }
        });

        connection.on('error', (data) => {
          get().updateConnectionState(endpoint, 'error', connection.getStats());
          get().addNotification({
            type: 'error',
            title: 'Connection Error',
            message: `Error on ${endpoint}: ${data.error}`,
          });
        });

        // Message handlers
        connection.on('pickup_update', (data) => {
          get().updatePickup(data);
        });

        connection.on('worker_update', (data) => {
          get().updateWorker(data);
        });

        connection.on('notification', (data) => {
          get().addNotification(data);
        });

        // Connect
        connection.connect();
      });
    },

    disconnectAll: () => {
      console.log('🔌 Disconnecting all WebSocket connections');
      wsManager.disconnectAll();
      set({
        connections: {},
        globalConnected: false,
        pickupUpdates: {},
        workerUpdates: {},
      });
    },

    // Connection Management
    addConnection: (endpoint: string, connection: WebSocketService) => {
      set((state) => ({
        connections: {
          ...state.connections,
          [endpoint]: {
            endpoint,
            state: connection.getState(),
            stats: connection.getStats(),
          },
        },
      }));
    },

    removeConnection: (endpoint: string) => {
      set((state) => {
        const newConnections = { ...state.connections };
        delete newConnections[endpoint];
        return { connections: newConnections };
      });
    },

    updateConnectionState: (endpoint: string, state: WebSocketState, stats?: ConnectionStats) => {
      set((prevState) => {
        const connection = prevState.connections[endpoint];
        if (!connection) return prevState;

        const updatedConnections = {
          ...prevState.connections,
          [endpoint]: {
            ...connection,
            state,
            ...(stats && { stats }),
          },
        };

        // Update global connected state
        const globalConnected = Object.values(updatedConnections).some(
          (conn) => conn.state === 'connected'
        );

        return {
          connections: updatedConnections,
          globalConnected,
        };
      });
    },

    // Real-time Data Updates
    updatePickup: (pickup: PickupUpdate) => {
      set((state) => ({
        pickupUpdates: {
          ...state.pickupUpdates,
          [pickup.id]: pickup,
        },
      }));

      // Play sound notification if enabled
      if (get().soundEnabled && typeof window !== 'undefined') {
        // Simple beep sound (you can replace with actual audio file)
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvGgnBD');
      }
    },

    updateWorker: (worker: WorkerUpdate) => {
      set((state) => ({
        workerUpdates: {
          ...state.workerUpdates,
          [worker.id]: worker,
        },
      }));
    },

    addNotification: (notification: Omit<SystemNotification, 'id' | 'timestamp'>) => {
      const newNotification: SystemNotification = {
        ...notification,
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        read: false,
      };

      set((state) => ({
        notifications: [newNotification, ...state.notifications.slice(0, 49)], // Keep last 50
      }));
    },

    markNotificationRead: (notificationId: string) => {
      set((state) => ({
        notifications: state.notifications.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        ),
      }));
    },

    clearNotifications: () => {
      set({ notifications: [] });
    },

    // UI Actions
    toggleConnectionStatus: () => {
      set((state) => ({ showConnectionStatus: !state.showConnectionStatus }));
    },

    toggleSound: () => {
      set((state) => ({ soundEnabled: !state.soundEnabled }));
    },

    // Data Getters
    getActivePickups: () => {
      const { pickupUpdates } = get();
      return Object.values(pickupUpdates).filter(
        (pickup) => pickup.status !== 'completed' && pickup.status !== 'cancelled'
      );
    },

    getOnlineWorkers: () => {
      const { workerUpdates } = get();
      return Object.values(workerUpdates).filter(
        (worker) => worker.status === 'online' || worker.status === 'busy'
      );
    },

    getUnreadNotifications: () => {
      const { notifications } = get();
      return notifications.filter((notif) => !notif.read);
    },
  }))
);

// Selectors for optimized component subscriptions
export const selectConnections = (state: WebSocketStore) => state.connections;
export const selectGlobalConnected = (state: WebSocketStore) => state.globalConnected;
export const selectPickupUpdates = (state: WebSocketStore) => state.pickupUpdates;
export const selectWorkerUpdates = (state: WebSocketStore) => state.workerUpdates;
export const selectNotifications = (state: WebSocketStore) => state.notifications;
export const selectUnreadNotifications = (state: WebSocketStore) => state.getUnreadNotifications();
export const selectActivePickups = (state: WebSocketStore) => state.getActivePickups();
export const selectOnlineWorkers = (state: WebSocketStore) => state.getOnlineWorkers();