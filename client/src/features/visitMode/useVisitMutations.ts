import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/apiClient';
import { queryKeys } from '../../lib/queryKeys';

export function useCreateRoom(propertyId: string) {
  return useMutation({
    mutationFn: (input: { name: string; icon: string }) =>
      api.post<{ id: string }>(`/properties/${propertyId}/rooms`, input),
  });
}

export interface SaveScoreInput {
  layout: number;
  storage: number;
  light: number;
  vibe: number;
  feeling: string;
  note: string;
  customScores: { metricId: string; value: number }[];
}

export function useSaveRoomScore() {
  return useMutation({
    mutationFn: ({ roomId, ...input }: SaveScoreInput & { roomId: string }) =>
      api.post(`/rooms/${roomId}/scores`, input),
  });
}

export interface SaveNeighborhoodScoreInput {
  curbAppeal: number;
  streetVibe: number;
  feeling: string;
  note: string;
}

export function useSaveNeighborhoodScore(propertyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SaveNeighborhoodScoreInput) => api.post(`/properties/${propertyId}/neighborhood-score`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.property(propertyId) });
    },
  });
}

export function useUploadMedia(propertyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, type, roomId }: { file: File; type: 'PHOTO' | 'VIDEO' | 'VOICE'; roomId?: string }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      if (roomId) formData.append('roomId', roomId);
      return api.upload(`/properties/${propertyId}/media`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.property(propertyId) });
    },
  });
}
