import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'worker' | 'admin';
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'customer' | 'worker';
  phone?: string;
  address?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Auth API calls
const authApi = {
  login: (credentials: LoginCredentials): Promise<AuthResponse> =>
    apiClient.post('/auth/login/', credentials),

  register: (data: RegisterData): Promise<AuthResponse> =>
    apiClient.post('/auth/register/', data),

  refresh: (refreshToken: string): Promise<{ token: string }> =>
    apiClient.post('/auth/refresh/', { refresh_token: refreshToken }),

  logout: (): Promise<void> =>
    apiClient.post('/auth/logout/'),

  getProfile: (): Promise<User> =>
    apiClient.get('/auth/profile/'),
};

// React Query hooks
export const useLogin = () => {
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('refresh_token', data.refreshToken);
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('refresh_token', data.refreshToken);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      queryClient.clear();
    },
  });
};

export const useAuth = () => {
  return useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: authApi.getProfile,
    retry: false,
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('auth_token'),
  });
};