/**
 * Authentication service
 * Handles login, logout, token management with backend integration
 */

import { apiPost, apiGet, setTokens, clearTokens } from '../api/client';
import type { User } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: 'customer' | 'caregiver' | 'vendor';
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

/**
 * Register a new user
 */
export async function register(credentials: RegisterCredentials): Promise<LoginResponse> {
  const response = await apiPost<AuthResponse>('/auth/register', credentials);

  // Store tokens
  if (response.token) {
    setTokens(response.token, response.refreshToken);
  }

  return {
    user: response.user,
    token: response.token,
    refreshToken: response.refreshToken,
  };
}

/**
 * Login user and store tokens
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await apiPost<AuthResponse>('/auth/login', credentials);

  // Store tokens
  if (response.token) {
    setTokens(response.token, response.refreshToken);
  }

  return {
    user: response.user,
    token: response.token,
    refreshToken: response.refreshToken,
  };
}

/**
 * Logout user and clear tokens
 */
export async function logout(): Promise<void> {
  try {
    // Optionally call backend logout endpoint if available
    // await apiPost('/auth/logout');
  } catch (error) {
    // Continue with logout even if API call fails
    console.error('Logout API error:', error);
  } finally {
    clearTokens();
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<User> {
  const response = await apiGet<{ user: User }>('/auth/me');
  return response.user;
}

/**
 * Refresh authentication token
 */
export async function refreshToken(): Promise<string> {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await apiPost<{ token: string }>('/auth/refresh-token', {
    refreshToken,
  });

  if (response.token) {
    setTokens(response.token, refreshToken);
  }

  return response.token;
}
