/**
 * Booking service
 * Handles booking creation, updates, and queries
 */

import { apiGet, apiPost, apiPut } from '../api/client';
import type { Booking, PaginatedResponse } from '../types';
import type { BookingInput } from '../api/schema';

/**
 * Get bookings for current user
 */
export async function getBookings(params?: {
  userId?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Booking>> {
  const queryParams = new URLSearchParams();
  
  if (params?.userId) queryParams.set('userId', params.userId);
  if (params?.status) queryParams.set('status', params.status);
  if (params?.page) queryParams.set('page', String(params.page));
  if (params?.limit) queryParams.set('limit', String(params.limit));

  return apiGet<PaginatedResponse<Booking>>(
    `/bookings?${queryParams.toString()}`
  );
}

/**
 * Get booking by ID
 */
export async function getBookingById(id: string): Promise<Booking> {
  const response = await apiGet<{ data: Booking }>(`/bookings/${id}`);
  return response.data;
}

/**
 * Create a new booking
 */
export async function createBooking(payload: BookingInput): Promise<Booking> {
  return apiPost<Booking>('/bookings', payload);
}

/**
 * Update booking status
 */
export async function updateBookingStatus(
  id: string,
  status: Booking['status']
): Promise<Booking> {
  return apiPut<Booking>(`/bookings/${id}`, { status });
}

/**
 * Cancel a booking
 */
export async function cancelBooking(id: string): Promise<Booking> {
  return updateBookingStatus(id, 'cancelled');
}

/**
 * Create emergency booking request
 */
export async function createEmergencyBooking(
  address: string,
  notes?: string
): Promise<Booking> {
  return createBooking({
    caregiverId: '', // System will assign available caregiver
    startTime: new Date().toISOString(),
    address,
    notes: notes || 'Emergency request',
  });
}

