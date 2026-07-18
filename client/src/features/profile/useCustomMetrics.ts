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

async function optimisticUpdate(
  queryClient: ReturnType<typeof useQueryClient>,
  updater: (prev: CustomMetric[]) => CustomMetric[],
) {
  await queryClient.cancelQueries({ queryKey: customMetricsKey });
  const previous = queryClient.getQueryData<CustomMetric[]>(customMetricsKey);
  queryClient.setQueryData<CustomMetric[]>(customMetricsKey, (old) => updater(old ?? []));
  return { previous };
}

export function useCreateCustomMetric() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { label: string; category: 'EMOTIONAL' | 'FUNCTIONAL'; scope?: 'ROOM' | 'PROPERTY'; weight?: number }) =>
      api.post<CustomMetric>('/custom-metrics', input),
    onMutate: (input) =>
      optimisticUpdate(queryClient, (prev) => [
        ...prev,
        { id: `optimistic-${input.label}`, label: input.label, category: input.category, scope: input.scope ?? 'ROOM', weight: input.weight ?? 5 },
      ]),
    onError: (_err, _input, context) => {
      if (context?.previous) queryClient.setQueryData(customMetricsKey, context.previous);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customMetricsKey }),
  });
}

export function useUpdateCustomMetricWeight() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, weight }: { id: string; weight: number }) => api.patch<CustomMetric>(`/custom-metrics/${id}`, { weight }),
    onMutate: ({ id, weight }) => optimisticUpdate(queryClient, (prev) => prev.map((m) => (m.id === id ? { ...m, weight } : m))),
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(customMetricsKey, context.previous);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customMetricsKey }),
  });
}

export function useDeleteCustomMetric() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/custom-metrics/${id}`),
    onMutate: (id) => optimisticUpdate(queryClient, (prev) => prev.filter((m) => m.id !== id)),
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(customMetricsKey, context.previous);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customMetricsKey }),
  });
}
