/**
 * Admin service
 * Handles admin operations like user verification, reports, analytics, and management
 */

import { apiGet, apiPost, apiPatch } from '../api/client';
import type { AdminReport, User, CaregiverProfile, Subscription } from '../types';

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
  city?: string;
  isActive?: boolean;
}): Promise<{ data: User[]; total: number; page: number; limit: number }> {
  const queryParams = new URLSearchParams();
  if (params?.role) queryParams.set('role', params.role);
  if (params?.page) queryParams.set('page', String(params.page));
  if (params?.limit) queryParams.set('limit', String(params.limit));
  if (params?.city) queryParams.set('city', params.city);
  if (params?.isActive !== undefined) queryParams.set('isActive', String(params.isActive));

  return apiGet<{ data: User[]; total: number; page: number; limit: number }>(
    `/users?${queryParams.toString()}`
  );
}

/**
 * Block/unblock a user
 */
export async function blockUser(userId: string, blocked: boolean): Promise<User> {
  return apiPatch<User>(`/admin/users/${userId}/block`, { isActive: !blocked });
}

/**
 * Update user profile (admin access)
 */
export async function updateUserProfile(
  userId: string,
  data: Partial<{
    name: string;
    email: string;
    phone: string;
    city: string;
    role: string;
    isActive: boolean;
  }>
): Promise<User> {
  return apiPatch<User>(`/admin/users/${userId}`, data);
}

/**
 * Get user subscriptions
 */
export async function getUserSubscriptions(userId: string): Promise<Subscription[]> {
  const response = await apiGet<{ data: Subscription[] }>(
    `/admin/users/${userId}/subscriptions`
  );
  return response.data;
}

/**
 * Create subscription for user (admin)
 */
export async function createUserSubscription(
  userId: string,
  data: {
    planId: string;
    planName: string;
    priceCents: number;
    billingCycle: 'monthly' | 'yearly';
    startDate: string;
    endDate?: string;
    autoRenew?: boolean;
  }
): Promise<Subscription> {
  return apiPost<Subscription>(`/admin/users/${userId}/subscriptions`, data);
}

/**
 * Cancel user subscription (admin)
 */
export async function cancelUserSubscription(
  userId: string,
  subscriptionId: string
): Promise<Subscription> {
  return apiPost<Subscription>(
    `/admin/users/${userId}/subscriptions/${subscriptionId}/cancel`,
    {}
  );
}

/**
 * Get user performance metrics
 */
export async function getUserPerformance(userId: string): Promise<{
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalSpent: number;
  averageRating?: number;
  responseTime?: number;
}> {
  return apiGet(`/admin/users/${userId}/performance`);
}

/**
 * Get caregiver performance metrics
 */
export async function getCaregiverPerformance(caregiverId: string): Promise<{
  totalBookings: number;
  completedBookings: number;
  averageRating: number;
  totalEarnings: number;
  responseTime: number;
  completionRate: number;
}> {
  return apiGet(`/admin/caregivers/${caregiverId}/performance`);
}

/**
 * Get chat analytics
 */
export async function getChatAnalytics(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<{
  totalMessages: number;
  activeChats: number;
  averageResponseTime: number;
  messagesByDay: Array<{ date: string; count: number }>;
  messagesByUser: Array<{ userId: string; userName: string; count: number }>;
}> {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.set('startDate', params.startDate);
  if (params?.endDate) queryParams.set('endDate', params.endDate);

  return apiGet(`/admin/analytics/chats?${queryParams.toString()}`);
}

/**
 * Get platform analytics
 */
export async function getPlatformAnalytics(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<{
  userGrowth: Array<{ date: string; count: number }>;
  bookingTrends: Array<{ date: string; count: number }>;
  revenueTrends: Array<{ date: string; amount: number }>;
}> {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.set('startDate', params.startDate);
  if (params?.endDate) queryParams.set('endDate', params.endDate);

  return apiGet(`/admin/analytics/platform?${queryParams.toString()}`);
}
