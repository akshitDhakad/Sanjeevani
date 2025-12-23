/**
 * Emergency Request Component
 * Quick emergency booking request form
 */

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createEmergencyBooking } from '../services/bookings';
import { getCaregivers } from '../services/caregivers';
import { useQuery } from '@tanstack/react-query';
import { Button, Input, Select, Modal, Spinner } from './';
import { getErrorMessage } from '../utils/errorHandler';

interface EmergencyRequestProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EmergencyRequest({ isOpen, onClose }: EmergencyRequestProps) {
  const [address, setAddress] = useState('');
  const [caregiverId, setCaregiverId] = useState('');
  const [notes, setNotes] = useState('');
  const queryClient = useQueryClient();

  // Fetch available caregivers
  const { data: caregiversData, isLoading: caregiversLoading } = useQuery({
    queryKey: ['caregivers', 'emergency'],
    queryFn: () => getCaregivers({ page: 1, limit: 20 }),
    enabled: isOpen,
  });

  const createMutation = useMutation({
    mutationFn: () => {
      if (!caregiverId) {
        throw new Error('Please select a caregiver');
      }
      if (!address.trim()) {
        throw new Error('Please enter an address');
      }
      return createEmergencyBooking(caregiverId, address.trim(), notes.trim() || undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      onClose();
      setAddress('');
      setCaregiverId('');
      setNotes('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Emergency Care Request">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Caregiver <span className="text-red-500">*</span>
          </label>
          {caregiversLoading ? (
            <div className="flex justify-center p-4">
              <Spinner />
            </div>
          ) : (
            <Select
              value={caregiverId}
              onChange={(e) => setCaregiverId(e.target.value)}
              options={[
                { value: '', label: 'Select a caregiver...' },
                ...((caregiversData?.data || []).map((cg: any) => ({
                  value: cg._id || cg.id,
                  label: `${cg.userId?.name || 'Caregiver'} - ${cg.services.join(', ')}`,
                })) || []),
              ]}
            />
          )}
        </div>

        <Input
          label="Address"
          placeholder="Enter your address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={3}
            placeholder="Describe the emergency situation..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {createMutation.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">
              {getErrorMessage(createMutation.error)}
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1 bg-red-600 hover:bg-red-700"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Requesting...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                Request Emergency Care
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

