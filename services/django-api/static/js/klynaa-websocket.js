/**
 * Klynaa WebSocket Manager
 * Handles real-time connections for worker dashboard, pickup tracking, and customer notifications.
 */

class KlynaaWebSocketManager {
    constructor(baseUrl = 'ws://localhost:8002') {
        this.baseUrl = baseUrl;
        this.connections = new Map();
        this.eventListeners = new Map();
        this.reconnectAttempts = new Map();
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000; // 1 second
    }

    /**
     * Connect to a WebSocket endpoint
     * @param {string} type - Connection type (pickup, worker, customer)
     * @param {string|number} entityId - Entity ID
     * @param {string} authToken - JWT authentication token
     * @returns {Promise<WebSocket>}
     */
    async connect(type, entityId, authToken = null) {
        const connectionId = `${type}_${entityId}`;

        // Close existing connection if any
        if (this.connections.has(connectionId)) {
            this.disconnect(connectionId);
        }

        const wsUrl = this._buildWebSocketUrl(type, entityId);

        return new Promise((resolve, reject) => {
            try {
                const socket = new WebSocket(wsUrl);

                socket.onopen = () => {
                    console.log(`[KlynaaWS] Connected to ${connectionId}`);
                    this.connections.set(connectionId, socket);
                    this.reconnectAttempts.set(connectionId, 0);

                    // Send authentication if token provided
                    if (authToken) {
                        this.send(connectionId, {
                            type: 'authenticate',
                            token: authToken
                        });
                    }

                    this._emit(connectionId, 'connected', { connectionId, type, entityId });
                    resolve(socket);
                };

                socket.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        console.log(`[KlynaaWS] Message received on ${connectionId}:`, data);

                        this._emit(connectionId, 'message', data);

                        // Emit specific event types
                        if (data.type) {
                            this._emit(connectionId, data.type, data.data || data);
                        }
                    } catch (error) {
                        console.error(`[KlynaaWS] Error parsing message on ${connectionId}:`, error);
                        this._emit(connectionId, 'error', { error: 'Message parsing failed', raw: event.data });
                    }
                };

                socket.onclose = (event) => {
                    console.log(`[KlynaaWS] Connection closed for ${connectionId} (Code: ${event.code})`);
                    this.connections.delete(connectionId);
                    this._emit(connectionId, 'disconnected', { connectionId, code: event.code });

                    // Attempt reconnection if not intentionally closed
                    if (event.code !== 1000) {
                        this._attemptReconnection(type, entityId, authToken, connectionId);
                    }
                };

                socket.onerror = (error) => {
                    console.error(`[KlynaaWS] WebSocket error on ${connectionId}:`, error);
                    this._emit(connectionId, 'error', { error: 'WebSocket error', details: error });
                    reject(error);
                };

            } catch (error) {
                console.error(`[KlynaaWS] Failed to create WebSocket connection:`, error);
                reject(error);
            }
        });
    }

    /**
     * Disconnect from a WebSocket
     * @param {string} connectionId - Connection identifier
     */
    disconnect(connectionId) {
        const socket = this.connections.get(connectionId);
        if (socket) {
            socket.close(1000, 'Intentional disconnect');
            this.connections.delete(connectionId);
            this.reconnectAttempts.delete(connectionId);
            console.log(`[KlynaaWS] Disconnected from ${connectionId}`);
        }
    }

    /**
     * Send message to WebSocket
     * @param {string} connectionId - Connection identifier
     * @param {object} message - Message to send
     */
    send(connectionId, message) {
        const socket = this.connections.get(connectionId);
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(message));
            console.log(`[KlynaaWS] Message sent to ${connectionId}:`, message);
            return true;
        } else {
            console.warn(`[KlynaaWS] Cannot send message - connection ${connectionId} not available`);
            return false;
        }
    }

    /**
     * Add event listener
     * @param {string} connectionId - Connection identifier
     * @param {string} event - Event name
     * @param {function} callback - Callback function
     */
    on(connectionId, event, callback) {
        if (!this.eventListeners.has(connectionId)) {
            this.eventListeners.set(connectionId, new Map());
        }

        if (!this.eventListeners.get(connectionId).has(event)) {
            this.eventListeners.get(connectionId).set(event, []);
        }

        this.eventListeners.get(connectionId).get(event).push(callback);
    }

    /**
     * Remove event listener
     * @param {string} connectionId - Connection identifier
     * @param {string} event - Event name
     * @param {function} callback - Callback function to remove
     */
    off(connectionId, event, callback) {
        const connectionListeners = this.eventListeners.get(connectionId);
        if (connectionListeners && connectionListeners.has(event)) {
            const callbacks = connectionListeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    /**
     * Get connection status
     * @param {string} connectionId - Connection identifier
     * @returns {boolean} - Connection status
     */
    isConnected(connectionId) {
        const socket = this.connections.get(connectionId);
        return socket && socket.readyState === WebSocket.OPEN;
    }

    /**
     * Get all active connections
     * @returns {Array<string>} - Array of connection IDs
     */
    getActiveConnections() {
        return Array.from(this.connections.keys()).filter(id => this.isConnected(id));
    }

    // Private methods
    _buildWebSocketUrl(type, entityId) {
        const paths = {
            pickup: `/ws/pickups/${entityId}/`,
            worker: `/ws/worker/${entityId}/`,
            customer: `/ws/customer/${entityId}/`
        };

        const path = paths[type];
        if (!path) {
            throw new Error(`Invalid WebSocket type: ${type}`);
        }

        return `${this.baseUrl}${path}`;
    }

    _emit(connectionId, event, data) {
        const connectionListeners = this.eventListeners.get(connectionId);
        if (connectionListeners && connectionListeners.has(event)) {
            const callbacks = connectionListeners.get(event);
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`[KlynaaWS] Error in event callback for ${event}:`, error);
                }
            });
        }
    }

    async _attemptReconnection(type, entityId, authToken, connectionId) {
        const attempts = this.reconnectAttempts.get(connectionId) || 0;

        if (attempts < this.maxReconnectAttempts) {
            this.reconnectAttempts.set(connectionId, attempts + 1);
            const delay = this.reconnectDelay * Math.pow(2, attempts); // Exponential backoff

            console.log(`[KlynaaWS] Attempting reconnection ${attempts + 1}/${this.maxReconnectAttempts} for ${connectionId} in ${delay}ms`);

            setTimeout(async () => {
                try {
                    await this.connect(type, entityId, authToken);
                } catch (error) {
                    console.error(`[KlynaaWS] Reconnection attempt failed for ${connectionId}:`, error);
                }
            }, delay);
        } else {
            console.error(`[KlynaaWS] Max reconnection attempts reached for ${connectionId}`);
            this._emit(connectionId, 'reconnection_failed', { connectionId });
        }
    }
}

// Worker Dashboard specific functionality
class KlynaaWorkerDashboard {
    constructor(workerId, authToken, wsManager = null) {
        this.workerId = workerId;
        this.authToken = authToken;
        this.wsManager = wsManager || new KlynaaWebSocketManager();
        this.connectionId = `worker_${workerId}`;
        this.isLocationTracking = false;
        this.locationUpdateInterval = null;
    }

    async connect() {
        await this.wsManager.connect('worker', this.workerId, this.authToken);
        this._setupEventListeners();
        return this;
    }

    disconnect() {
        this.stopLocationTracking();
        this.wsManager.disconnect(this.connectionId);
    }

    // Worker specific methods
    updateLocation(lat, lng) {
        return this.wsManager.send(this.connectionId, {
            type: 'update_location',
            data: { lat, lng }
        });
    }

    updateStatus(isActive) {
        return this.wsManager.send(this.connectionId, {
            type: 'update_status',
            data: { is_active: isActive }
        });
    }

    acceptPickup(pickupId) {
        return this.wsManager.send(this.connectionId, {
            type: 'accept_pickup',
            data: { pickup_id: pickupId }
        });
    }

    completePickup(pickupId, completedTime = null) {
        return this.wsManager.send(this.connectionId, {
            type: 'complete_pickup',
            data: {
                pickup_id: pickupId,
                completed_time: completedTime || new Date().toISOString()
            }
        });
    }

    getAssignments() {
        return this.wsManager.send(this.connectionId, {
            type: 'get_assignments'
        });
    }

    startLocationTracking(intervalMs = 10000) {
        if (this.isLocationTracking) return;

        this.isLocationTracking = true;
        this.locationUpdateInterval = setInterval(() => {
            this._getCurrentLocation().then(position => {
                this.updateLocation(position.coords.latitude, position.coords.longitude);
            }).catch(error => {
                console.warn('[KlynaaWorker] Location update failed:', error);
            });
        }, intervalMs);
    }

    stopLocationTracking() {
        this.isLocationTracking = false;
        if (this.locationUpdateInterval) {
            clearInterval(this.locationUpdateInterval);
            this.locationUpdateInterval = null;
        }
    }

    // Event listeners
    onNewAssignment(callback) {
        this.wsManager.on(this.connectionId, 'new_assignment', callback);
    }

    onRouteUpdate(callback) {
        this.wsManager.on(this.connectionId, 'route_update', callback);
    }

    onPickupCancelled(callback) {
        this.wsManager.on(this.connectionId, 'pickup_cancelled', callback);
    }

    onConnected(callback) {
        this.wsManager.on(this.connectionId, 'connected', callback);
    }

    onDisconnected(callback) {
        this.wsManager.on(this.connectionId, 'disconnected', callback);
    }

    // Private methods
    _setupEventListeners() {
        this.wsManager.on(this.connectionId, 'connected', () => {
            console.log('[KlynaaWorker] Worker dashboard connected');
            // Request initial assignments
            this.getAssignments();
        });

        this.wsManager.on(this.connectionId, 'assignments', (data) => {
            console.log('[KlynaaWorker] Assignments received:', data);
        });
    }

    _getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 10000
            });
        });
    }
}

// Export for use in modules or assign to window for global access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { KlynaaWebSocketManager, KlynaaWorkerDashboard };
} else {
    window.KlynaaWebSocketManager = KlynaaWebSocketManager;
    window.KlynaaWorkerDashboard = KlynaaWorkerDashboard;
}