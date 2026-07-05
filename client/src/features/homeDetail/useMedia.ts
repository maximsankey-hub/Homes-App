import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/apiClient';
import { queryKeys } from '../../lib/queryKeys';

export function useDeleteMedia(propertyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mediaId: string) => api.delete(`/media/${mediaId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.property(propertyId) });
    },
  });
}
