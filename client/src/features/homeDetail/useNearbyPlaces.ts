import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { NearbyPlace } from 'shared';
import { api } from '../../lib/apiClient';

export function useNearbyPlaces(propertyId: string | undefined, category: string, q: string) {
  return useQuery({
    queryKey: ['properties', propertyId, 'nearby', category, q],
    queryFn: () => {
      const params = new URLSearchParams();
      if (category !== 'all') params.set('category', category);
      if (q) params.set('q', q);
      const qs = params.toString();
      return api.get<NearbyPlace[]>(`/properties/${propertyId}/nearby${qs ? `?${qs}` : ''}`);
    },
    enabled: !!propertyId,
  });
}

export function useRefreshNearbyPlaces(propertyId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.get<NearbyPlace[]>(`/properties/${propertyId}/nearby?refresh=true`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['properties', propertyId, 'nearby'] }),
  });
}
