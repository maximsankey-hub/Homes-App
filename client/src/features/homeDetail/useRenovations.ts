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
  room?: string;
  type?: 'COSMETIC' | 'STRUCTURAL';
  costLow?: number;
  costHigh?: number;
  feasibility?: number;
}

export function useCreateRenovation(propertyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRenovationInput) => api.post<RenovationIdea>(`/properties/${propertyId}/renovations`, input),
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

export function useAssignRenovationRoom(propertyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, room }: { id: string; room: string }) => api.patch(`/renovations/${id}`, { room }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties', propertyId, 'renovations'] });
    },
  });
}

export function useReorderRenovations(propertyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderedIds: string[]) => api.post<RenovationIdea[]>(`/properties/${propertyId}/renovations/reorder`, { orderedIds }),
    onSuccess: (renovations) => {
      queryClient.setQueryData(['properties', propertyId, 'renovations'], renovations);
    },
  });
}

export function useEstimateRenovationCost() {
  return useMutation({
    mutationFn: ({ description, type }: { description: string; type: 'COSMETIC' | 'STRUCTURAL' }) =>
      api.post<{ costLow: number; costHigh: number }>('/renovations/estimate-cost', { description, type }),
  });
}

export function useUploadRenovationMedia(propertyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ renovationIdeaId, file, type }: { renovationIdeaId: string; file: File; type: 'PHOTO' | 'VIDEO' | 'VOICE' }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      formData.append('renovationIdeaId', renovationIdeaId);
      return api.upload(`/properties/${propertyId}/media`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties', propertyId, 'renovations'] });
    },
  });
}
