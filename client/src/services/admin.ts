/**
 * Admin service
 * Handles admin operations like user verification, reports, and analytics
 */

import { apiGet, apiPost } from '../api/client';
import type { AdminReport, User, CaregiverProfile } from '../types';

/**
 * Get admin dashboard reports
 */
export async function getAdminReports(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<AdminReport> {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.set('startDate', params.startDate);
  if (params?.endDate) queryParams.set('endDate', params.endDate);

  return apiGet<AdminReport>(`/admin/reports?${queryParams.toString()}`);
}

/**
 * Get pending verifications
 */
export async function getPendingVerifications(): Promise<CaregiverProfile[]> {
  const response = await apiGet<{ data: CaregiverProfile[] }>(
    '/admin/verifications/pending'
  );
  return response.data;
}

/**
 * Approve user verification
 */
export async function approveVerification(
  userId: string,
  notes?: string
): Promise<void> {
  await apiPost(`/admin/verifications/${userId}/approve`, { notes });
}

/**
 * Reject user verification
 */
export async function rejectVerification(
  userId: string,
  reason: string
): Promise<void> {
  await apiPost(`/admin/verifications/${userId}/reject`, { reason });
}

/**
 * Get all users (with pagination)
 */
export async function getUsers(params?: {
  role?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: User[]; total: number }> {
  const queryParams = new URLSearchParams();
  if (params?.role) queryParams.set('role', params.role);
  if (params?.page) queryParams.set('page', String(params.page));
  if (params?.limit) queryParams.set('limit', String(params.limit));

  return apiGet<{ data: User[]; total: number }>(
    `/admin/users?${queryParams.toString()}`
  );
}

