import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { RenovationIdea } from 'shared';
import { api } from '../../lib/apiClient';

export function useRenovations(propertyId: string | undefined) {
  return useQuery({
    queryKey: ['properties', propertyId, 'renovations'],
    queryFn: () => api.get<RenovationIdea[]>(`/properties/${propertyId}/renovations`),
    enabled: !!propertyId,
  });
}

export interface CreateRenovationInput {
  title: string;
  room: string;
  type?: 'COSMETIC' | 'STRUCTURAL';
  costLow?: number;
  costHigh?: number;
  feasibility?: number;
}

export function useCreateRenovation(propertyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRenovationInput) => api.post(`/properties/${propertyId}/renovations`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties', propertyId, 'renovations'] });
    },
  });
}

export function useDeleteRenovation(propertyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/renovations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties', propertyId, 'renovations'] });
    },
  });
}
