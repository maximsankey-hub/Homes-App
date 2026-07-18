import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CustomMetric } from 'shared';
import { api } from '../../lib/apiClient';

const customMetricsKey = ['customMetrics'] as const;

export function useCustomMetrics() {
  return useQuery({
    queryKey: customMetricsKey,
    queryFn: () => api.get<CustomMetric[]>('/custom-metrics'),
  });
}

export function useCreateCustomMetric() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { label: string; category: 'EMOTIONAL' | 'FUNCTIONAL'; scope?: 'ROOM' | 'PROPERTY'; weight?: number }) =>
      api.post<CustomMetric>('/custom-metrics', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customMetricsKey }),
  });
}

export function useUpdateCustomMetricWeight() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, weight }: { id: string; weight: number }) => api.patch<CustomMetric>(`/custom-metrics/${id}`, { weight }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customMetricsKey }),
  });
}

export function useDeleteCustomMetric() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/custom-metrics/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customMetricsKey }),
  });
}
