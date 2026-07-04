import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PartnerComparison } from 'shared';
import { api } from '../../lib/apiClient';

export function usePartnerComparison(propertyId: string | undefined) {
  return useQuery({
    queryKey: ['properties', propertyId, 'partner-comparison'],
    queryFn: () => api.get<PartnerComparison>(`/properties/${propertyId}/partner-comparison`),
    enabled: !!propertyId,
  });
}

export function useInvitePartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; contact?: string }) => api.post('/scorers', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}
