/**
 * Caregiver service
 * Handles caregiver profile operations, search, and verification
 */

import { apiGet, apiPost, apiPut } from '../api/client';
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

  return apiGet<PaginatedResponse<CaregiverProfile>>(
    `/caregivers?${queryParams.toString()}`
  );
}

/**
 * Get caregiver by ID
 */
export async function getCaregiverById(id: string): Promise<CaregiverProfile> {
  const response = await apiGet<{ data: CaregiverProfile }>(`/caregivers/${id}`);
  return response.data;
}

/**
 * Create caregiver profile (onboarding)
 */
export async function createCaregiverProfile(
  payload: CaregiverProfileInput
): Promise<CaregiverProfile> {
  return apiPost<CaregiverProfile>('/caregivers', payload);
}

/**
 * Update caregiver profile
 */
export async function updateCaregiverProfile(
  id: string,
  payload: Partial<CaregiverProfileInput>
): Promise<CaregiverProfile> {
  return apiPut<CaregiverProfile>(`/caregivers/${id}`, payload);
}

/**
 * Upload document for caregiver verification
 */
export async function uploadCaregiverDocument(
  caregiverId: string,
  document: File,
  type: string
): Promise<Document> {
  const formData = new FormData();
  formData.append('file', document);
  formData.append('type', type);

  return apiPost<Document>(
    `/caregivers/${caregiverId}/documents`,
    formData,
    {
      headers: {}, // Let browser set Content-Type with boundary for FormData
    }
  );
}

/**
 * Get caregiver's own profile
 */
export async function getMyCaregiverProfile(): Promise<CaregiverProfile> {
  return apiGet<CaregiverProfile>('/caregivers/me');
}

