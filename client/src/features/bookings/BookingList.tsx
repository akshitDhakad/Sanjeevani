/**
 * Booking List Component
 * Displays list of bookings with filters
 */

import { useQuery } from '@tanstack/react-query';
import { getBookings } from '../../services/bookings';
import { useAuth } from '../auth/useAuth';
import { Card, Spinner, Button } from '../../components';
import { format } from 'date-fns';

interface BookingListProps {
  status?: string;
}

export function BookingList({ status }: BookingListProps) {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['bookings', user?.id, status],
    queryFn: () =>
      getBookings({
        userId: user?.id,
        status,
      }),
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        Failed to load bookings. Please try again.
      </div>
    );
  }

  const bookings = data?.data || [];

  if (bookings.length === 0) {
    return (
      <Card>
        <p className="text-gray-600 text-center py-8">
          No bookings found. Create your first booking to get started.
        </p>
      </Card>
    );
  }

  const statusColors = {
    requested: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <Card key={booking.id} hover>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  Booking #{booking.id.slice(0, 8)}
                </h3>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${
                    statusColors[booking.status]
                  }`}
                >
                  {booking.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Start:</strong>{' '}
                {format(new Date(booking.startTime), 'PPp')}
              </p>
              {booking.endTime && (
                <p className="text-sm text-gray-600 mb-1">
                  <strong>End:</strong>{' '}
                  {format(new Date(booking.endTime), 'PPp')}
                </p>
              )}
              <p className="text-sm text-gray-600 mb-1">
                <strong>Address:</strong> {booking.address}
              </p>
              <p className="text-sm font-semibold text-gray-900 mt-2">
                ${(booking.priceCents / 100).toFixed(2)}
              </p>
            </div>
            {booking.status === 'requested' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Handle cancel
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

