import { useQuery } from '@tanstack/react-query';
import type { PartnerComparison } from 'shared';
import { api } from '../../lib/apiClient';

export function usePartnerComparison(propertyId: string | undefined) {
  return useQuery({
    queryKey: ['properties', propertyId, 'partner-comparison'],
    queryFn: () => api.get<PartnerComparison>(`/properties/${propertyId}/partner-comparison`),
    enabled: !!propertyId,
  });
}
