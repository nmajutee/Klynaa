import { httpClient } from '@/lib/http-client';
import { User, LoginForm, RegisterForm } from '@/types';

/**
 * Authentication Service
 * Handles user authentication, registration, and session management
 */
export class AuthService {
  /**
   * Login user with email and password
   */
  async login(credentials: LoginForm) {
    const response = await httpClient.post<{
      access: string;
      refresh: string;
      user: User;
    }>('/auth/login/', credentials);

    if (response.success) {
      const { access, refresh, user } = response.data;
      httpClient.setTokens(access, refresh);
      return { user, token: access };
    }

    throw new Error('Login failed');
  }

  /**
   * Register new user
   */
  async register(userData: RegisterForm) {
    const response = await httpClient.post<{
      access: string;
      refresh: string;
      user: User;
    }>('/auth/register/', userData);

    if (response.success) {
      const { access, refresh, user } = response.data;
      httpClient.setTokens(access, refresh);
      return { user, token: access };
    }

    throw new Error('Registration failed');
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      await httpClient.post('/auth/logout/');
    } catch (error) {
      // Continue with local logout even if server request fails
      console.warn('Server logout failed:', error);
    } finally {
      httpClient.clearTokens();
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser() {
    const response = await httpClient.get<User>('/auth/user/');
    return response.data;
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<User>) {
    const response = await httpClient.patch<User>('/auth/user/', updates);
    return response.data;
  }

  /**
   * Change user password
   */
  async changePassword(currentPassword: string, newPassword: string) {
    const response = await httpClient.post<{ message: string }>('/auth/change-password/', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string) {
    const response = await httpClient.post<{ message: string }>('/auth/password-reset/', {
      email,
    });
    return response.data;
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string) {
    const response = await httpClient.post<{ message: string }>('/auth/password-reset/confirm/', {
      token,
      password: newPassword,
    });
    return response.data;
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string) {
    const response = await httpClient.post<{ message: string }>('/auth/verify-email/', {
      token,
    });
    return response.data;
  }

  /**
   * Resend email verification
   */
  async resendEmailVerification() {
    const response = await httpClient.post<{ message: string }>('/auth/resend-verification/');
    return response.data;
  }

  /**
   * Check if user is authenticated (has valid token)
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('access_token');
  }

  /**
   * Get stored auth token
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }
}

// Export singleton instance
export const authService = new AuthService();