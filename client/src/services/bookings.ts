/**
 * Booking service
 * Handles booking creation, updates, and queries with backend integration
 */

import { apiGet, apiPost, apiPatch } from '../api/client';
import type { Booking, PaginatedResponse } from '../types';
import type { BookingInput } from '../api/schema';

/**
 * Get bookings for current user
 */
export async function getBookings(params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Booking>> {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.set('page', String(params.page));
  if (params?.limit) queryParams.set('limit', String(params.limit));

  const queryString = queryParams.toString();
  return apiGet<PaginatedResponse<Booking>>(
    `/bookings/me${queryString ? `?${queryString}` : ''}`
  );
}

/**
 * Get booking by ID
 */
export async function getBookingById(id: string): Promise<Booking> {
  return apiGet<Booking>(`/bookings/${id}`);
}

/**
 * Create a new booking
 */
export async function createBooking(payload: BookingInput): Promise<Booking> {
  return apiPost<Booking>('/bookings', payload);
}

/**
 * Update booking
 */
export async function updateBooking(
  id: string,
  payload: Partial<{ status: Booking['status']; endTime: string; notes: string }>
): Promise<Booking> {
  return apiPatch<Booking>(`/bookings/${id}`, payload);
}

/**
 * Cancel a booking
 */
export async function cancelBooking(id: string): Promise<Booking> {
  return apiPost<Booking>(`/bookings/${id}/cancel`);
}

/**
 * Create emergency booking request
 */
export async function createEmergencyBooking(
  caregiverId: string,
  address: string,
  notes?: string
): Promise<Booking> {
  return createBooking({
    caregiverId,
    startTime: new Date().toISOString(),
    address,
    notes: notes || 'Emergency request',
  });
}
