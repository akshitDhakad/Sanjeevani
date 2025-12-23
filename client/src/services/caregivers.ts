/**
 * Caregiver service
 * Handles caregiver profile operations, search, and verification with backend integration
 */

import { apiGet, apiPost, apiPatch } from '../api/client';
import type {
  CaregiverProfile,
  PaginatedResponse,
  SearchFilters,
  Document,
} from '../types';
import type { CaregiverProfileInput } from '../api/schema';

/**
 * Search caregivers with filters
 */
export async function getCaregivers(
  params: SearchFilters = {}
): Promise<PaginatedResponse<CaregiverProfile>> {
  const queryParams = new URLSearchParams();
  
  if (params.city) queryParams.set('city', params.city);
  if (params.service) queryParams.set('service', params.service);
  if (params.minRating) queryParams.set('minRating', String(params.minRating));
  if (params.maxPrice) queryParams.set('maxPrice', String(params.maxPrice));
  if (params.page) queryParams.set('page', String(params.page));
  if (params.limit) queryParams.set('limit', String(params.limit));

  const queryString = queryParams.toString();
  return apiGet<PaginatedResponse<CaregiverProfile>>(
    `/caregivers/search${queryString ? `?${queryString}` : ''}`
  );
}

/**
 * Get caregiver by user ID
 */
export async function getCaregiverByUserId(userId: string): Promise<CaregiverProfile> {
  return apiGet<CaregiverProfile>(`/caregivers/${userId}`);
}

/**
 * Get caregiver by profile ID
 */
export async function getCaregiverById(id: string): Promise<CaregiverProfile> {
  return apiGet<CaregiverProfile>(`/caregivers/${id}`);
}

/**
 * Create caregiver profile (onboarding)
 */
export async function createCaregiverProfile(
  payload: Omit<CaregiverProfileInput, 'name' | 'email'>
): Promise<CaregiverProfile> {
  return apiPost<CaregiverProfile>('/caregivers/profile', payload);
}

/**
 * Update caregiver profile
 */
export async function updateCaregiverProfile(
  payload: Partial<CaregiverProfileInput>
): Promise<CaregiverProfile> {
  return apiPatch<CaregiverProfile>('/caregivers/profile/me', payload);
}

/**
 * Get caregiver's own profile
 */
export async function getMyCaregiverProfile(): Promise<CaregiverProfile> {
  return apiGet<CaregiverProfile>('/caregivers/profile/me');
}

/**
 * Upload document for caregiver verification
 * Note: This endpoint may need to be implemented on backend
 */
export async function uploadCaregiverDocument(
  document: File,
  type: 'id_proof' | 'qualification' | 'background_check' | 'other'
): Promise<Document> {
  const formData = new FormData();
  formData.append('file', document);
  formData.append('type', type);

  // Note: This endpoint needs to be implemented on backend
  return apiPost<Document>('/caregivers/profile/me/documents', formData);
}
