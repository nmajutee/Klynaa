import axios, { AxiosResponse, AxiosError } from 'axios';
import {
    User,
    AuthResponse,
    LoginCredentials,
    RegisterData,
    Bin,
    BinCreateData,
    PickupRequest,
    PickupCreateData,
    Payment,
    Review,
    ReviewCreateData,
    DashboardStats,
    WorkerStats,
    ApiResponse,
    ApiError,
    Notification,
} from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Token management
let accessToken: string | null = null;
let refreshToken: string | null = null;

// Set tokens (call this after login)
export const setTokens = (access: string, refresh: string) => {
    accessToken = access;
    refreshToken = refresh;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
};

// Get tokens from localStorage
export const getTokens = () => {
    if (typeof window !== 'undefined') {
        accessToken = localStorage.getItem('access_token');
        refreshToken = localStorage.getItem('refresh_token');
        if (accessToken) {
            api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        }
    }
    return { accessToken, refreshToken };
};

// Clear tokens (call this on logout)
export const clearTokens = () => {
    accessToken = null;
    refreshToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    delete api.defaults.headers.common['Authorization'];
};

// Initialize tokens when service loads
getTokens();

// Token refresh interceptor
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry && refreshToken) {
            originalRequest._retry = true;

            try {
                const response = await axios.post(`${API_BASE_URL}/users/token/refresh/`, {
                    refresh: refreshToken,
                });

                const newAccessToken = response.data.access;
                setTokens(newAccessToken, refreshToken);

                // Retry the original request
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed, clear tokens and redirect to login
                clearTokens();
                if (typeof window !== 'undefined') {
                    window.location.href = '/auth/login';
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Helper function to handle API errors
const handleApiError = (error: AxiosError): ApiError => {
    if (error.response?.data) {
        return error.response.data as ApiError;
    }
    return { message: error.message || 'An unexpected error occurred' };
};

// Auth API
export const authApi = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        try {
            const response = await api.post('/users/token/', {
                username: credentials.email,
                password: credentials.password,
            });
            const { access, refresh } = response.data;

            // Get user profile after login
            const userResponse = await api.get('/users/me/', {
                headers: { Authorization: `Bearer ${access}` }
            });

            setTokens(access, refresh);
            return { access, refresh, user: userResponse.data };
        } catch (error) {
            throw handleApiError(error as AxiosError);
        }
    },

    register: async (data: RegisterData): Promise<AuthResponse> => {
        // Registration endpoint not implemented in backend yet
        throw { message: 'Registration endpoint not available. Contact admin to create accounts.' } as ApiError;
    },

    logout: async (): Promise<void> => {
        clearTokens();
    },

    getCurrentUser: async (): Promise<User> => {
        try {
            const response: AxiosResponse<User> = await api.get('/users/me/');
            return response.data;
        } catch (error) {
            throw handleApiError(error as AxiosError);
        }
    },
};

// Bins API
export const binsApi = {
    getBins: async (params?: Record<string, any>): Promise<ApiResponse<Bin>> => {
        try {
            const response: AxiosResponse<ApiResponse<Bin>> = await api.get('/bins/', { params });
            return response.data;
        } catch (error) {
            throw handleApiError(error as AxiosError);
        }
    },

    getBin: async (id: number): Promise<Bin> => {
        try {
            const response: AxiosResponse<Bin> = await api.get(`/bins/${id}/`);
            return response.data;
        } catch (error) {
            throw handleApiError(error as AxiosError);
        }
    },

    createBin: async (data: BinCreateData): Promise<Bin> => {
        try {
            const response: AxiosResponse<Bin> = await api.post('/bins/', data);
            return response.data;
        } catch (error) {
            throw handleApiError(error as AxiosError);
        }
    },

    updateBin: async (id: number, data: Partial<BinCreateData>): Promise<Bin> => {
        try {
            const response: AxiosResponse<Bin> = await api.patch(`/bins/${id}/`, data);
            return response.data;
        } catch (error) {
            throw handleApiError(error as AxiosError);
        }
    },

    deleteBin: async (id: number): Promise<void> => {
        try {
            await api.delete(`/bins/${id}/`);
        } catch (error) {
            throw handleApiError(error as AxiosError);
        }
    },
};

// Pickups API
export const pickupsApi = {
    getPickups: async (params?: Record<string, any>): Promise<ApiResponse<PickupRequest>> => {
        try {
            const response: AxiosResponse<ApiResponse<PickupRequest>> = await api.get('/pickups/', { params });
            return response.data;
        } catch (error) {
            throw handleApiError(error as AxiosError);
        }
    },

    getPickup: async (id: number): Promise<PickupRequest> => {
        try {
            const response: AxiosResponse<PickupRequest> = await api.get(`/pickups/${id}/`);
            return response.data;
        } catch (error) {
            throw handleApiError(error as AxiosError);
        }
    },

    createPickup: async (data: PickupCreateData): Promise<PickupRequest> => {
        try {
            const response: AxiosResponse<PickupRequest> = await api.post('/pickups/', data);
            return response.data;
        } catch (error) {
            throw handleApiError(error as AxiosError);
        }
    },

    acceptPickup: async (id: number): Promise<PickupRequest> => {
        try {
            const response: AxiosResponse<PickupRequest> = await api.post(`/pickups/${id}/accept/`);
            return response.data;
        } catch (error) {
            throw handleApiError(error as AxiosError);
        }
    },

    updatePickupStatus: async (id: number, status: string): Promise<PickupRequest> => {
        try {
            const response: AxiosResponse<PickupRequest> = await api.patch(`/pickups/${id}/update_status/`, { status });
            return response.data;
        } catch (error) {
            throw handleApiError(error as AxiosError);
        }
    },

    // Worker specific methods
    myPickups: async (): Promise<PickupRequest[]> => {
        try {
            const response: AxiosResponse<PickupRequest[]> = await api.get('/pickups/my_pickups/');
            return response.data;
        } catch (error) {
            throw handleApiError(error as AxiosError);
        }
    },

    available: async (): Promise<{
        available_pickups: PickupRequest[];
        worker_status: {
            pending_count: number;
            max_pickups: number;
            can_accept_more: boolean;
            service_radius_km: number;
        };
    }> => {
        try {
            const response = await api.get('/pickups/available/');
            return response.data;
        } catch (error) {
            throw handleApiError(error as AxiosError);
        }
    },

    markDelivered: async (id: number): Promise<{ message: string; payment_status: string; requires_customer_confirmation: boolean }> => {
        try {
            const response = await api.post(`/pickups/${id}/mark_delivered/`);
            return response.data;
        } catch (error) {
            throw handleApiError(error as AxiosError);
        }
    },

    confirmPayment: async (id: number): Promise<{ message: string; can_leave_review: boolean }> => {
        try {
            const response = await api.post(`/pickups/${id}/confirm_payment/`);
            return response.data;
        } catch (error) {
            throw handleApiError(error as AxiosError);
        }
    },

    // Dashboard
    dashboard: async (): Promise<any> => {
        try {
            const response = await api.get('/pickups/dashboard/');
            return response.data;
        } catch (error) {
            throw handleApiError(error as AxiosError);
        }
    },

    // Proof capture endpoints
    listProofs: async (id: number): Promise<any[]> => {
        try {
            const response = await api.get(`/pickups/${id}/proofs/`);
            return response.data;
        } catch (error) {
            throw handleApiError(error as AxiosError);
        }
    },

    uploadProof: async (id: number, payload: { file: File; type: 'before' | 'after'; latitude?: number; longitude?: number }) => {
        try {
            const form = new FormData();
            form.append('type', payload.type);
            form.append('image', payload.file);
            if (payload.latitude !== undefined) form.append('latitude', String(payload.latitude));
            if (payload.longitude !== undefined) form.append('longitude', String(payload.longitude));

            const response = await api.post(`/pickups/${id}/upload_proof/`, form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error as AxiosError);
        }
    },

    // Admin verification endpoints
    pendingVerifications: async (): Promise<{ proofs: any[] }> => {
        try {
            const response = await api.get('/pickups/pending_verifications/');
            return response.data;
        } catch (error) {
            throw handleApiError(error as AxiosError);
        }
    },

    verifyProof: async (pickupId: number, proofId: number, decision: 'approve' | 'reject', notes?: string) => {
        try {
            const response = await api.post(`/pickups/${pickupId}/verify_proof/`, {
                proof_id: proofId,
                decision,
                notes
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error as AxiosError);
        }
    },
};

// Analytics API
export const analyticsApi = {
    getDashboardStats: async (): Promise<DashboardStats> => {
        try {
            const response: AxiosResponse<DashboardStats> = await api.get('/analytics/dashboard/');
            return response.data;
        } catch (error) {
            throw handleApiError(error as AxiosError);
        }
    },

    getWorkerStats: async (): Promise<WorkerStats> => {
        try {
            const response: AxiosResponse<WorkerStats> = await api.get('/analytics/worker/');
            return response.data;
        } catch (error) {
            throw handleApiError(error as AxiosError);
        }
    },
};

// Reviews API
export const reviewsApi = {
    createReview: async (data: ReviewCreateData): Promise<Review> => {
        try {
            const response: AxiosResponse<Review> = await api.post('/reviews/', data);
            return response.data;
        } catch (error) {
            throw handleApiError(error as AxiosError);
        }
    },

    getReviews: async (params?: Record<string, any>): Promise<ApiResponse<Review>> => {
        try {
            const response: AxiosResponse<ApiResponse<Review>> = await api.get('/reviews/', { params });
            return response.data;
        } catch (error) {
            throw handleApiError(error as AxiosError);
        }
    },
};

// Notifications API
export const notificationsApi = {
    getNotifications: async (): Promise<ApiResponse<Notification>> => {
        try {
            const response: AxiosResponse<ApiResponse<Notification>> = await api.get('/notifications/');
            return response.data;
        } catch (error) {
            throw handleApiError(error as AxiosError);
        }
    },

    markAsRead: async (id: number): Promise<void> => {
        try {
            await api.patch(`/notifications/${id}/`, { is_read: true });
        } catch (error) {
            throw handleApiError(error as AxiosError);
        }
    },
};

export default api;
