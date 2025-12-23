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
  return apiGet<PaginatedResponse<User>>(
    `/users${queryString ? `?${queryString}` : ''}`
  );
}

/**
 * Get user by ID (admin only)
 */
export async function getUserById(id: string): Promise<User> {
  return apiGet<User>(`/users/${id}`);
}

