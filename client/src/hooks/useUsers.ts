/**
 * React Query hooks for users
 * Provides data persistence and caching for user operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyProfile, updateProfile, getUsers, getUserById } from '../services/users';
import type { UpdateUserData } from '../services/users';

/**
 * Get current user profile
 */
export function useMyProfile() {
  return useQuery({
    queryKey: ['users', 'me'],
    queryFn: getMyProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Update current user profile mutation
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserData) => updateProfile(data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['users', 'me'], updatedUser);
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

/**
 * Get all users (admin only)
 */
export function useUsers(params?: {
  page?: number;
  limit?: number;
  role?: string;
  city?: string;
  isActive?: boolean;
}) {
  return useQuery({
    queryKey: ['users', 'list', params],
    queryFn: () => getUsers(params),
    staleTime: 30 * 1000, // 30 seconds
    enabled: false, // Only fetch when explicitly called
  });
}

/**
 * Get user by ID (admin only)
 */
export function useUser(id: string | null) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => (id ? getUserById(id) : null),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

