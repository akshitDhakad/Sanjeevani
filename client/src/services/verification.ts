/**
 * Verification service
 * Handles caregiver/vendor verification workflows
 */

import { apiPost, apiGet } from '../api/client';
import type { CaregiverProfile } from '../types';

export interface VerificationRequest {
  userId: string;
  type: 'caregiver' | 'vendor';
  documents?: string[]; // Document IDs
}

export interface VerificationResponse {
  id: string;
  userId: string;
  status: 'pending' | 'verified' | 'rejected';
  requestedAt: string;
  verifiedAt?: string;
  notes?: string;
}

/**
 * Request verification for caregiver or vendor
 */
export async function requestVerification(
  payload: VerificationRequest
): Promise<VerificationResponse> {
  return apiPost<VerificationResponse>('/verification/request', payload);
}

/**
 * Get verification status for user
 */
export async function getVerificationStatus(
  userId: string
): Promise<VerificationResponse> {
  return apiGet<VerificationResponse>(`/verification/${userId}`);
}

/**
 * Check if caregiver is verified
 */
export async function checkCaregiverVerification(
  caregiverId: string
): Promise<boolean> {
  try {
    const profile = await apiGet<CaregiverProfile>(`/caregivers/${caregiverId}`);
    return profile.verified && profile.verificationStatus === 'verified';
  } catch {
    return false;
  }
}

