/**
 * React Query hooks for admin operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAdminReports,
  getPendingVerifications,
  approveVerification,
  rejectVerification,
  getUsers,
  blockUser,
  updateUserProfile,
  getUserSubscriptions,
  createUserSubscription,
  cancelUserSubscription,
  getUserPerformance,
  getCaregiverPerformance,
  getChatAnalytics,
  getPlatformAnalytics,
} from '../services/admin';

/**
 * Get admin reports
 */
export function useAdminReports(params?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ['admin', 'reports', params],
    queryFn: () => getAdminReports(params),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Get pending verifications
 */
export function usePendingVerifications() {
  return useQuery({
    queryKey: ['admin', 'verifications', 'pending'],
    queryFn: getPendingVerifications,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}

/**
 * Approve verification mutation
 */
export function useApproveVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, notes }: { userId: string; notes?: string }) =>
      approveVerification(userId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'verifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
    },
  });
}

/**
 * Reject verification mutation
 */
export function useRejectVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      rejectVerification(userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'verifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
    },
  });
}

/**
 * Get users list (admin)
 */
export function useAdminUsers(params?: {
  role?: string;
  page?: number;
  limit?: number;
  city?: string;
  isActive?: boolean;
}) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => getUsers(params),
    staleTime: 30 * 1000, // 30 seconds
    enabled: true, // Always enabled for admin panel
    refetchOnWindowFocus: true,
  });
}

/**
 * Block/unblock user mutation
 */
export function useBlockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, blocked }: { userId: string; blocked: boolean }) =>
      blockUser(userId, blocked),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

/**
 * Update user profile mutation (admin)
 */
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: Partial<{
        name: string;
        email: string;
        phone: string;
        city: string;
        role: string;
        isActive: boolean;
      }>;
    }) => updateUserProfile(userId, data),
    onSuccess: (_updatedUser, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['users', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] });
    },
  });
}

/**
 * Get user subscriptions
 */
export function useUserSubscriptions(userId: string | null) {
  return useQuery({
    queryKey: ['admin', 'users', userId, 'subscriptions'],
    queryFn: () => (userId ? getUserSubscriptions(userId) : []),
    enabled: !!userId,
    staleTime: 30 * 1000,
  });
}

/**
 * Create user subscription mutation
 */
export function useCreateUserSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: {
        planId: string;
        planName: string;
        priceCents: number;
        billingCycle: 'monthly' | 'yearly';
        startDate: string;
        endDate?: string;
        autoRenew?: boolean;
      };
    }) => createUserSubscription(userId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'users', variables.userId, 'subscriptions'],
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
    },
  });
}

/**
 * Cancel user subscription mutation
 */
export function useCancelUserSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      subscriptionId,
    }: {
      userId: string;
      subscriptionId: string;
    }) => cancelUserSubscription(userId, subscriptionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'users', variables.userId, 'subscriptions'],
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
    },
  });
}

/**
 * Get user performance
 */
export function useUserPerformance(userId: string | null) {
  return useQuery({
    queryKey: ['admin', 'users', userId, 'performance'],
    queryFn: () => (userId ? getUserPerformance(userId) : null),
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}

/**
 * Get caregiver performance
 */
export function useCaregiverPerformance(caregiverId: string | null) {
  return useQuery({
    queryKey: ['admin', 'caregivers', caregiverId, 'performance'],
    queryFn: () => (caregiverId ? getCaregiverPerformance(caregiverId) : null),
    enabled: !!caregiverId,
    staleTime: 60 * 1000,
  });
}

/**
 * Get chat analytics
 */
export function useChatAnalytics(params?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ['admin', 'analytics', 'chats', params],
    queryFn: () => getChatAnalytics(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get platform analytics
 */
export function usePlatformAnalytics(params?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ['admin', 'analytics', 'platform', params],
    queryFn: () => getPlatformAnalytics(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

