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
