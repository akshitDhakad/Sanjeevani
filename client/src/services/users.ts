/**
 * User service
 * Handles user profile operations with backend integration
 */

import { apiGet, apiPatch } from '../api/client';
import type { User, PaginatedResponse } from '../types';

export interface UpdateUserData {
  name?: string;
  phone?: string;
  city?: string;
}

/**
 * Get current user profile
 */
export async function getMyProfile(): Promise<User> {
  return apiGet<User>('/users/profile');
}

/**
 * Update current user profile
 */
export async function updateProfile(data: UpdateUserData): Promise<User> {
  return apiPatch<User>('/users/profile', data);
}

/**
 * Get all users (admin only)
 */
export async function getUsers(params?: {
  page?: number;
  limit?: number;
  role?: string;
  city?: string;
  isActive?: boolean;
}): Promise<PaginatedResponse<User>> {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.set('page', String(params.page));
  if (params?.limit) queryParams.set('limit', String(params.limit));
  if (params?.role) queryParams.set('role', params.role);
  if (params?.city) queryParams.set('city', params.city);
  if (params?.isActive !== undefined) queryParams.set('isActive', String(params.isActive));

  const queryString = queryParams.toString();
  
  // Backend returns { success: true, data: [...], pagination: {...} }
  // We need to fetch the full response to preserve pagination
  const BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
  const API_VERSION = '/api/v1';
  const token = localStorage.getItem('auth_token');
  
  const response = await fetch(
    `${BASE_URL}${API_VERSION}/users${queryString ? `?${queryString}` : ''}`,
    {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to fetch users: ${response.statusText}`);
  }

  const result = await response.json();
  
  // Backend returns { success: true, data: [...], pagination: {...} }
  if (result.success && result.data && result.pagination) {
    return {
      data: result.data,
      pagination: result.pagination,
    };
  }

  // Fallback: if data is an array but no pagination, create default pagination
  if (Array.isArray(result.data)) {
    return {
      data: result.data,
      pagination: {
        page: params?.page || 1,
        limit: params?.limit || result.data.length || 10,
        total: result.data.length,
        totalPages: 1,
      },
    };
  }

  // If result itself is the paginated response
  if (result.data && result.pagination) {
    return result as PaginatedResponse<User>;
  }

  throw new Error('Unexpected response format from users API');
}

/**
 * Get user by ID (admin only)
 */
export async function getUserById(id: string): Promise<User> {
  return apiGet<User>(`/users/${id}`);
}

