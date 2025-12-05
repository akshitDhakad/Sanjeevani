/**
 * Booking Form Component
 * Allows customers to create bookings with caregivers
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingSchema, type BookingInput } from '../../api/schema';
import { createBooking } from '../../services/bookings';
import { Button, Input, Textarea } from '../../components';

interface BookingFormProps {
  caregiverId: string;
  onSuccess?: () => void;
}

export function BookingForm({ caregiverId, onSuccess }: BookingFormProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      caregiverId,
    },
  });

  const bookingMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      onSuccess?.();
    },
  });

  const onSubmit = (data: BookingInput) => {
    bookingMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Start Date & Time"
        type="datetime-local"
        {...register('startTime')}
        error={errors.startTime?.message}
        required
      />

      <Input
        label="End Date & Time (Optional)"
        type="datetime-local"
        {...register('endTime')}
        error={errors.endTime?.message}
      />

      <Textarea
        label="Address"
        rows={3}
        {...register('address')}
        error={errors.address?.message}
        required
        placeholder="Enter the care location address"
      />

      <Textarea
        label="Notes (Optional)"
        rows={3}
        {...register('notes')}
        error={errors.notes?.message}
        placeholder="Any special instructions or requirements"
      />

      <Button
        type="submit"
        fullWidth
        isLoading={bookingMutation.isPending}
        disabled={bookingMutation.isPending}
      >
        Create Booking
      </Button>

      {bookingMutation.isError && (
        <div
          className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
          role="alert"
        >
          {bookingMutation.error instanceof Error
            ? bookingMutation.error.message
            : 'Failed to create booking'}
        </div>
      )}
    </form>
  );
}

