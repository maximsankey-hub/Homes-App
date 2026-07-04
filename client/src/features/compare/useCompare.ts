import { useQuery } from '@tanstack/react-query';
import type { CompareResult } from 'shared';
import { api } from '../../lib/apiClient';

export function useCompare(a: string | null, b: string | null) {
  return useQuery({
    queryKey: ['compare', a, b],
    queryFn: () => api.get<CompareResult>(`/properties/compare?a=${a}&b=${b}`),
    enabled: !!a && !!b && a !== b,
  });
}
