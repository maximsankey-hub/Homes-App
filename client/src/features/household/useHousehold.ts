import { useQuery } from '@tanstack/react-query';
import type { Household } from 'shared';
import { api } from '../../lib/apiClient';

export function useHousehold() {
  return useQuery({
    queryKey: ['household'],
    queryFn: () => api.get<Household>('/household'),
  });
}
