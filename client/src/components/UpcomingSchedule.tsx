/**
 * Upcoming Schedule Component
 * Enhanced schedule display with full functionality
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBookings } from '../hooks/useBookings';
import { Card, Button, Spinner } from './';
import { formatDate, formatTime, formatCurrency, getTimeUntil } from '../utils/formatDate';
import { parseISO } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelBooking } from '../services/bookings';
import { getErrorMessage } from '../utils/errorHandler';

export function UpcomingSchedule() {
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  
  const { data: bookingsData, isLoading } = useBookings({
    page: 1,
    limit: 50,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => cancelBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setSelectedBookingId(null);
    },
  });

  const upcomingBookings = (bookingsData?.data || [])
    .filter((b) => {
      if (!b || !b.startTime) return false;
      const bookingDate = parseISO(b.startTime);
      return bookingDate >= new Date() && b.status !== 'cancelled' && b.status !== 'completed';
    })
    .sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime())
    .slice(0, 10);

  const handleCancel = (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      cancelMutation.mutate(bookingId);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <div className="flex justify-center p-8">
          <Spinner size="lg" />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Upcoming Schedule</h2>
          <p className="text-sm text-gray-600 mt-1">
            {upcomingBookings.length} upcoming appointment{upcomingBookings.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link to="/bookings/new">
          <Button size="sm">Add Appointment</Button>
        </Link>
      </div>

      {upcomingBookings.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 mx-auto text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-gray-600 mb-2">No upcoming appointments</p>
          <Link to="/bookings/new">
            <Button size="sm" className="mt-4">
              Schedule Appointment
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {upcomingBookings.map((booking) => {
            const bookingId = (booking as any)._id || booking.id;
            const startTime = parseISO(booking.startTime);
            const endTime = booking.endTime ? parseISO(booking.endTime) : null;
            const isSelected = selectedBookingId === bookingId;
            
            return (
              <div
                key={bookingId}
                onClick={() => setSelectedBookingId(isSelected ? null : bookingId)}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-primary-300 bg-primary-50'
                    : 'border-gray-200 bg-white hover:border-primary-200 hover:shadow-sm'
                }`}
              >
                <div className="flex gap-4">
                  <div className="text-center min-w-[80px] flex-shrink-0">
                    <div className="bg-primary-100 rounded-lg p-3">
                      <p className="text-2xl font-bold text-primary-700">
                        {formatTime(startTime).split(' ')[0]}
                      </p>
                      <p className="text-xs text-primary-600 font-medium">
                        {formatTime(startTime).split(' ')[1]}
                      </p>
                      {endTime && (
                        <p className="text-xs text-gray-500 mt-1">
                          - {formatTime(endTime)}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {getTimeUntil(booking.startTime)}
                    </p>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {booking.notes || 'Care Session'}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          📍 {booking.address}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(startTime, 'EEEE, MMM d, yyyy')}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span className={`text-xs px-2 py-1 rounded font-medium ${
                          booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                          booking.status === 'in_progress' ? 'bg-green-100 text-green-700' :
                          booking.status === 'requested' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {booking.status.replace('_', ' ').toUpperCase()}
                        </span>
                        {booking.priceCents > 0 && (
                          <p className="text-sm font-semibold text-gray-900">
                            {formatCurrency(booking.priceCents)}
                          </p>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <div className="mt-4 pt-4 border-t border-primary-200 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedBookingId(null)}
                          className="flex-1"
                        >
                          Close
                        </Button>
                        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancel(bookingId)}
                            disabled={cancelMutation.isPending}
                            className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                          >
                            {cancelMutation.isPending ? 'Cancelling...' : 'Cancel'}
                          </Button>
                        )}
                        <Link to={`/bookings/${bookingId}`} className="flex-1">
                          <Button size="sm" variant="primary" className="w-full">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    )}

                    {cancelMutation.error && selectedBookingId === bookingId && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                        {getErrorMessage(cancelMutation.error)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

