import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/apiClient';
import { queryKeys } from '../../lib/queryKeys';

export interface SaveRoomScoreInput {
  layout: number;
  storage: number;
  light: number;
  vibe: number;
  feeling: string;
  note: string;
  customScores: { metricId: string; value: number }[];
}

export function useUpdateRoomScore(propertyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roomId, ...input }: SaveRoomScoreInput & { roomId: string }) => api.post(`/rooms/${roomId}/scores`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.property(propertyId) });
    },
  });
}

export interface SaveNeighborhoodScoreInput {
  curbAppeal: number;
  streetVibe: number;
  feeling: string;
  note: string;
}

export function useUpdateNeighborhoodScore(propertyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SaveNeighborhoodScoreInput) => api.post(`/properties/${propertyId}/neighborhood-score`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.property(propertyId) });
    },
  });
}

export function useUpdatePropertyMetricScores(propertyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (scores: { metricId: string; value: number }[]) => api.post(`/properties/${propertyId}/metric-scores`, { scores }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.property(propertyId) });
    },
  });
}
