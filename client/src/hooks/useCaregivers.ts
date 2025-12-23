/**
 * React Query hooks for caregivers
 * Provides data persistence, caching, and search functionality
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCaregivers,
  getCaregiverByUserId,
  getMyCaregiverProfile,
  createCaregiverProfile,
  updateCaregiverProfile,
} from '../services/caregivers';
import type { CaregiverProfile, SearchFilters } from '../types';
import type { CaregiverProfileInput } from '../api/schema';

/**
 * Search caregivers with filters
 */
export function useCaregivers(filters: SearchFilters = {}) {
  return useQuery({
    queryKey: ['caregivers', 'search', filters],
    queryFn: () => getCaregivers(filters),
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
  });
}

/**
 * Get caregiver by user ID
 */
export function useCaregiver(userId: string | null) {
  return useQuery({
    queryKey: ['caregivers', userId],
    queryFn: () => (userId ? getCaregiverByUserId(userId) : null),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get current user's caregiver profile
 */
export function useMyCaregiverProfile() {
  return useQuery({
    queryKey: ['caregivers', 'me'],
    queryFn: getMyCaregiverProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}

/**
 * Create caregiver profile mutation
 */
export function useCreateCaregiverProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<CaregiverProfileInput, 'name' | 'email'>) =>
      createCaregiverProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caregivers'] });
    },
  });
}

/**
 * Update caregiver profile mutation
 */
export function useUpdateCaregiverProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<CaregiverProfileInput>) =>
      updateCaregiverProfile(data),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['caregivers', 'me'], updatedProfile);
      queryClient.invalidateQueries({ queryKey: ['caregivers'] });
    },
  });
}

