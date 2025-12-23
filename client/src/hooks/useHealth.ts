/**
 * React Query hooks for health monitoring
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLatestVitals, getHealthTrends, recordVital } from '../services/health';
import type { HealthVitalInput } from '../services/health';

/**
 * Get latest health vitals
 */
export function useLatestVitals() {
  return useQuery({
    queryKey: ['health', 'vitals', 'latest'],
    queryFn: getLatestVitals,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute for real-time updates
  });
}

/**
 * Get health trends
 */
export function useHealthTrends(type: string, days: number = 7) {
  return useQuery({
    queryKey: ['health', 'trends', type, days],
    queryFn: () => getHealthTrends(type, days),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Record health vital mutation
 */
export function useRecordVital() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vital: HealthVitalInput) => recordVital(vital),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health'] });
    },
  });
}

