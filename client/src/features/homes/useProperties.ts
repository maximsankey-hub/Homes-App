import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PropertyDetail, PropertySummary } from 'shared';
import { api } from '../../lib/apiClient';
import { queryKeys } from '../../lib/queryKeys';

export function useProperties() {
  return useQuery({
    queryKey: queryKeys.properties,
    queryFn: () => api.get<PropertySummary[]>('/properties'),
  });
}

export function useProperty(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.property(id ?? ''),
    queryFn: () => api.get<PropertyDetail>(`/properties/${id}`),
    enabled: !!id,
  });
}

export interface CreatePropertyInput {
  address: string;
  city?: string;
  state?: string;
  listingPrice: number;
  sqft?: number;
  beds?: number;
  baths?: number;
  yearBuilt?: number;
}

export function useCreateProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePropertyInput) => api.post('/properties', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.properties });
    },
  });
}
