/**
 * React Query hooks for bookings
 * Provides data persistence, caching, and optimistic updates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBookings,
  getBookingById,
  createBooking,
  updateBooking,
  cancelBooking,
} from '../services/bookings';
import type { Booking } from '../types';
import type { BookingInput } from '../api/schema';

/**
 * Get bookings for current user
 */
export function useBookings(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['bookings', 'me', params],
    queryFn: () => getBookings(params),
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false,
  });
}

/**
 * Get single booking by ID
 */
export function useBooking(id: string | null) {
  return useQuery({
    queryKey: ['bookings', id],
    queryFn: () => (id ? getBookingById(id) : null),
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Create booking mutation
 */
export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BookingInput) => createBooking(data),
    onSuccess: () => {
      // Invalidate bookings list to refetch
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

/**
 * Update booking mutation
 */
export function useUpdateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Booking> }) =>
      updateBooking(id, data),
    onSuccess: (updatedBooking) => {
      // Update cache optimistically
      queryClient.setQueryData(['bookings', updatedBooking.id], updatedBooking);
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

/**
 * Cancel booking mutation
 */
export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cancelBooking(id),
    onSuccess: (cancelledBooking) => {
      // Update cache optimistically
      queryClient.setQueryData(['bookings', cancelledBooking.id], cancelledBooking);
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

