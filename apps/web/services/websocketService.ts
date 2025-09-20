import { EventEmitter } from 'events';

/**
 * Production-ready WebSocket Service for Klynaa Real-time System
 *
 * Features:
 * - Automatic reconnection with exponential backoff
 * - Connection state management
 * - Event-based message handling
 * - Multiple endpoint support
 * - Authentication token management
 * - Network error handling
 * - Performance monitoring
 */

export type WebSocketState = 'connecting' | 'connected' | 'disconnected' | 'error' | 'reconnecting';

export interface WebSocketConfig {
  url: string;
  token?: string;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  debug?: boolean;
}

export interface WebSocketMessage {
  type: string;
  data?: any;
  timestamp?: string;
  id?: string;
}

export interface ConnectionStats {
  connectTime?: Date;
  reconnectCount: number;
  messagesSent: number;
  messagesReceived: number;
  lastError?: string;
  uptime: number;
}

export class WebSocketService extends EventEmitter {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private state: WebSocketState = 'disconnected';
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private stats: ConnectionStats = {
    reconnectCount: 0,
    messagesSent: 0,
    messagesReceived: 0,
    uptime: 0
  };
  private startTime: Date | null = null;

  constructor(config: WebSocketConfig) {
    super();
    this.config = {
      autoReconnect: true,
      reconnectInterval: 3000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      debug: false,
      ...config
    };

    this.log('WebSocket service initialized', { url: this.config.url });
  }

  /**
   * Connect to the WebSocket server
   */
  public connect(): void {
    if (this.state === 'connecting' || this.state === 'connected') {
      this.log('Connection already in progress or established');
      return;
    }

    this.setState('connecting');
    this.log('Connecting to WebSocket', { url: this.config.url });

    try {
      // Build URL with authentication token
      const url = this.buildUrl();
      this.ws = new WebSocket(url);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onerror = this.handleError.bind(this);

    } catch (error) {
      this.handleError(new Error(`Connection failed: ${error}`));
    }
  }

  /**
   * Disconnect from the WebSocket server
   */
  public disconnect(): void {
    this.log('Disconnecting WebSocket');
    this.config.autoReconnect = false; // Prevent automatic reconnection

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
    }

    this.setState('disconnected');
  }

  /**
   * Send a message through the WebSocket connection
   */
  public send(message: WebSocketMessage): boolean {
    if (this.state !== 'connected' || !this.ws) {
      this.log('Cannot send message - not connected', { state: this.state });
      this.emit('send-error', { error: 'Not connected', message });
      return false;
    }

    try {
      const payload = {
        ...message,
        timestamp: new Date().toISOString(),
        id: this.generateMessageId()
      };

      this.ws.send(JSON.stringify(payload));
      this.stats.messagesSent++;

      this.log('Message sent', payload);
      this.emit('message-sent', payload);

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.log('Failed to send message', { error: errorMessage, message });
      this.emit('send-error', { error: errorMessage, message });
      return false;
    }
  }

  /**
   * Get current connection state
   */
  public getState(): WebSocketState {
    return this.state;
  }

  /**
   * Get connection statistics
   */
  public getStats(): ConnectionStats {
    const uptime = this.startTime ? Date.now() - this.startTime.getTime() : 0;
    return {
      ...this.stats,
      uptime: Math.floor(uptime / 1000) // Convert to seconds
    };
  }

  /**
   * Update authentication token
   */
  public updateToken(token: string): void {
    this.config.token = token;
    this.log('Token updated');

    // Reconnect if currently connected to use new token
    if (this.state === 'connected') {
      this.log('Reconnecting with new token');
      this.reconnect();
    }
  }

  /**
   * Force reconnection
   */
  public reconnect(): void {
    this.log('Manual reconnection requested');
    if (this.ws) {
      this.ws.close(1000, 'Manual reconnect');
    }
    this.connect();
  }

  // Private methods

  private buildUrl(): string {
    let url = this.config.url;

    if (this.config.token) {
      const separator = url.includes('?') ? '&' : '?';
      url += `${separator}token=${encodeURIComponent(this.config.token)}`;
    }

    return url;
  }

  private handleOpen(): void {
    this.log('WebSocket connected');
    this.setState('connected');
    this.reconnectAttempts = 0;
    this.startTime = new Date();
    this.stats.connectTime = this.startTime;

    this.startHeartbeat();
    this.emit('connected');
  }

  private handleClose(event: CloseEvent): void {
    this.log('WebSocket closed', { code: event.code, reason: event.reason });
    this.setState('disconnected');
    this.stopHeartbeat();

    this.emit('disconnected', { code: event.code, reason: event.reason });

    // Attempt reconnection if enabled and not manually closed
    if (this.config.autoReconnect && event.code !== 1000) {
      this.attemptReconnect();
    }
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      this.stats.messagesReceived++;

      this.log('Message received', message);
      this.emit('message', message);

      // Handle specific message types
      if (message.type) {
        this.emit(message.type, message.data);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.log('Failed to parse message', { error: errorMessage, data: event.data });
      this.emit('parse-error', { error: errorMessage, data: event.data });
    }
  }

  private handleError(error: Event | Error): void {
    const errorMessage = error instanceof Error ? error.message : 'WebSocket error';
    this.log('WebSocket error', { error: errorMessage });

    this.setState('error');
    this.stats.lastError = errorMessage;
    this.emit('error', { error: errorMessage });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts!) {
      this.log('Max reconnection attempts reached', { attempts: this.reconnectAttempts });
      this.emit('reconnect-failed', { attempts: this.reconnectAttempts });
      return;
    }

    this.setState('reconnecting');
    this.reconnectAttempts++;
    this.stats.reconnectCount++;

    const delay = Math.min(
      this.config.reconnectInterval! * Math.pow(2, this.reconnectAttempts - 1),
      30000 // Max 30 seconds
    );

    this.log('Attempting reconnection', {
      attempt: this.reconnectAttempts,
      delay: delay
    });

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);

    this.emit('reconnecting', {
      attempt: this.reconnectAttempts,
      delay
    });
  }

  private startHeartbeat(): void {
    if (!this.config.heartbeatInterval) return;

    this.heartbeatTimer = setInterval(() => {
      if (this.state === 'connected') {
        this.send({
          type: 'heartbeat',
          data: { timestamp: new Date().toISOString() }
        });
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private setState(newState: WebSocketState): void {
    if (this.state !== newState) {
      const oldState = this.state;
      this.state = newState;
      this.log('State changed', { from: oldState, to: newState });
      this.emit('state-change', { from: oldState, to: newState });
    }
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private log(message: string, data?: any): void {
    if (this.config.debug) {
      console.log(`[WebSocket ${this.config.url}]`, message, data || '');
    }
  }
}

/**
 * WebSocket Manager for handling multiple connections
 */
export class WebSocketManager {
  private connections = new Map<string, WebSocketService>();
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = '') {
    // Auto-detect base URL if not provided
    if (!baseUrl && typeof window !== 'undefined') {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      this.baseUrl = `${protocol}//${host}`;
    } else {
      this.baseUrl = baseUrl;
    }
  }

  /**
   * Set authentication token for all connections
   */
  public setToken(token: string): void {
    this.token = token;

    // Update token for all existing connections
    this.connections.forEach(connection => {
      connection.updateToken(token);
    });
  }

  /**
   * Create or get a WebSocket connection for a specific endpoint
   */
  public getConnection(endpoint: string, config?: Partial<WebSocketConfig>): WebSocketService {
    const connectionKey = endpoint;

    if (this.connections.has(connectionKey)) {
      return this.connections.get(connectionKey)!;
    }

    const fullUrl = `${this.baseUrl}${endpoint}`;
    const connection = new WebSocketService({
      url: fullUrl,
      token: this.token || undefined,
      debug: process.env.NODE_ENV === 'development',
      ...config
    });

    this.connections.set(connectionKey, connection);

    // Clean up connection when it's permanently closed
    connection.on('reconnect-failed', () => {
      this.connections.delete(connectionKey);
    });

    return connection;
  }

  /**
   * Connect to pickup updates WebSocket
   */
  public connectPickup(pickupId?: string): WebSocketService {
    const endpoint = pickupId ? `/ws/pickup/${pickupId}/` : '/ws/pickup/general/';
    return this.getConnection(endpoint);
  }

  /**
   * Connect to worker updates WebSocket
   */
  public connectWorker(workerId: string): WebSocketService {
    const endpoint = `/ws/worker/${workerId}/`;
    return this.getConnection(endpoint);
  }

  /**
   * Connect to customer updates WebSocket
   */
  public connectCustomer(customerId: string): WebSocketService {
    const endpoint = `/ws/customer/${customerId}/`;
    return this.getConnection(endpoint);
  }

  /**
   * Connect to chat WebSocket
   */
  public connectChat(roomId: string): WebSocketService {
    const endpoint = `/ws/chat/${roomId}/`;
    return this.getConnection(endpoint);
  }

  /**
   * Disconnect all connections
   */
  public disconnectAll(): void {
    this.connections.forEach(connection => {
      connection.disconnect();
    });
    this.connections.clear();
  }

  /**
   * Get connection statistics for all connections
   */
  public getAllStats(): Record<string, ConnectionStats> {
    const stats: Record<string, ConnectionStats> = {};

    this.connections.forEach((connection, key) => {
      stats[key] = connection.getStats();
    });

    return stats;
  }
}

// Global WebSocket manager instance
export const wsManager = new WebSocketManager();