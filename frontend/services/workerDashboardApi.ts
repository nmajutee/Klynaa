/**
 * Worker Dashboard API Service
 * Handles all API calls for the mobile worker dashboard
 */

import axios, { AxiosResponse, AxiosError } from 'axios';
import {
    WorkerStats,
    PickupTask,
    PickupTaskDetail,
    WorkerEarning,
    ChatMessage,
    QuickReply,
    ApiError,
} from '../src/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Create axios instance for worker API
const workerApi = axios.create({
    baseURL: `${API_BASE_URL}/v1`,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth interceptor
workerApi.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle API errors
const handleApiError = (error: AxiosError): ApiError => {
    const response = error.response;
    const responseData = response?.data as any;

    return {
        message: responseData?.message || responseData?.error || responseData?.detail || error.message || 'An error occurred',
        status: response?.status || 500,
        detail: responseData?.detail,
        errors: responseData?.errors,
    };
};

// Worker Dashboard API
export const workerDashboardApi = {
    // Dashboard & Profile
    getWorkerStats: async (): Promise<WorkerStats> => {
        try {
            const response = await workerApi.get('/workers/me/');
            return response.data;
        } catch (error) {
            throw handleApiError(error as AxiosError);
        }
    },

    toggleWorkerStatus: async (isAvailable: boolean): Promise<{ is_available: boolean; status: string; message: string }> => {
        try {
            const response = await workerApi.patch('/workers/me/status/', { is_available: isAvailable });
            return response.data;
        } catch (error) {
            throw handleApiError(error as AxiosError);
        }
    },

    // Pickup Management
    getAvailablePickups: async (params?: {
        bbox?: string;
        limit?: number;
        offset?: number;
    }): Promise<PickupTask[]> => {
        try {
            const queryParams = new URLSearchParams();
            if (params?.bbox) queryParams.set('bbox', params.bbox);
            if (params?.limit) queryParams.set('limit', params.limit.toString());
            if (params?.offset) queryParams.set('offset', params.offset.toString());

            const response = await workerApi.get(`/pickups/?${queryParams.toString()}`);
            return response.data.results || response.data;
        } catch (error) {
            throw handleApiError(error as AxiosError);
        }
    },

    acceptPickup: async (pickupId: string): Promise<{ pickup: PickupTaskDetail; message: string }> => {
        try {
            const response = await workerApi.post(`/pickups/${pickupId}/accept/`);
            return response.data;
        } catch (error) {
            throw handleApiError(error as AxiosError);
        }
    },

    declinePickup: async (pickupId: string): Promise<{ message: string }> => {
        try {
            const response = await workerApi.post(`/pickups/${pickupId}/decline/`);
            return response.data;
        } catch (error) {
            throw handleApiError(error as AxiosError);
        }
    },

    collectPickup: async (pickupId: string, proofData: {
        image: File;
        latitude: number;
        longitude: number;
        notes?: string;
    }): Promise<{ message: string; proof_id: number; next_step: string }> => {
        try {
            const formData = new FormData();
            formData.append('type', 'pickup');
            formData.append('image', proofData.image);
            formData.append('latitude', proofData.latitude.toString());
            formData.append('longitude', proofData.longitude.toString());
            if (proofData.notes) {
                formData.append('notes', proofData.notes);
            }

            const response = await workerApi.post(`/pickups/${pickupId}/collect/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error as AxiosError);
        }
    },

    dropoffPickup: async (pickupId: string, proofData: {
        image: File;
        latitude: number;
        longitude: number;
        notes?: string;
    }): Promise<{ message: string; earnings_pending: boolean; proof_id: number }> => {
        try {
            const formData = new FormData();
            formData.append('type', 'dropoff');
            formData.append('image', proofData.image);
            formData.append('latitude', proofData.latitude.toString());
            formData.append('longitude', proofData.longitude.toString());
            if (proofData.notes) {
                formData.append('notes', proofData.notes);
            }

            const response = await workerApi.post(`/pickups/${pickupId}/dropoff/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error as AxiosError);
        }
    },

    // Earnings & Transactions
    getWorkerEarnings: async (workerId: number, params?: {
        from?: string;
        to?: string;
        limit?: number;
        offset?: number;
    }): Promise<WorkerEarning[]> => {
        try {
            const queryParams = new URLSearchParams();
            if (params?.from) queryParams.set('from', params.from);
            if (params?.to) queryParams.set('to', params.to);
            if (params?.limit) queryParams.set('limit', params.limit.toString());
            if (params?.offset) queryParams.set('offset', params.offset.toString());

            const response = await workerApi.get(`/workers/${workerId}/transactions/?${queryParams.toString()}`);
            return response.data.results || response.data;
        } catch (error) {
            throw handleApiError(error as AxiosError);
        }
    },

    requestPayout: async (workerId: number): Promise<{ message: string; amount: string; transaction_count: number }> => {
        try {
            const response = await workerApi.post(`/workers/${workerId}/payout-request/`);
            return response.data;
        } catch (error) {
            throw handleApiError(error as AxiosError);
        }
    },

    // Chat & Communication
    getChatMessages: async (taskId: string): Promise<ChatMessage[]> => {
        try {
            const response = await workerApi.get(`/chat/${taskId}/message/`);
            return response.data.results || response.data;
        } catch (error) {
            throw handleApiError(error as AxiosError);
        }
    },

    sendChatMessage: async (taskId: string, messageData: {
        content: string;
        message_type?: 'text' | 'quick_reply';
        client_message_id?: string;
        image?: File;
    }): Promise<ChatMessage> => {
        try {
            let response;

            if (messageData.image) {
                // Send as multipart for image messages
                const formData = new FormData();
                formData.append('content', messageData.content);
                formData.append('message_type', messageData.message_type || 'text');
                formData.append('image', messageData.image);
                if (messageData.client_message_id) {
                    formData.append('client_message_id', messageData.client_message_id);
                }

                response = await workerApi.post(`/chat/${taskId}/message/`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            } else {
                // Send as JSON for text messages
                response = await workerApi.post(`/chat/${taskId}/message/`, messageData);
            }

            return response.data;
        } catch (error) {
            throw handleApiError(error as AxiosError);
        }
    },

    getQuickReplies: async (): Promise<QuickReply[]> => {
        try {
            const response = await workerApi.get('/quick-replies/');
            return response.data.results || response.data;
        } catch (error) {
            throw handleApiError(error as AxiosError);
        }
    },

    // Utility functions
    getCurrentLocation: (): Promise<{ latitude: number; longitude: number }> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                (error) => {
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000, // 1 minute
                }
            );
        });
    },

    calculateDistance: (
        lat1: number,
        lng1: number,
        lat2: number,
        lng2: number
    ): number => {
        // Haversine formula for calculating distance between two points
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
    },
};

// Export individual functions for convenience
export const {
    getWorkerStats,
    toggleWorkerStatus,
    getAvailablePickups,
    acceptPickup,
    declinePickup,
    collectPickup,
    dropoffPickup,
    getWorkerEarnings,
    requestPayout,
    getChatMessages,
    sendChatMessage,
    getQuickReplies,
    getCurrentLocation,
    calculateDistance,
} = workerDashboardApi;

export default workerDashboardApi;