import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { StylePhotoItem, StyleRoomProgress } from 'shared';
import { api } from '../../lib/apiClient';

const styleProfileKey = ['styleProfile'] as const;

export function useStyleProfile() {
  return useQuery({
    queryKey: styleProfileKey,
    queryFn: () => api.get<StyleRoomProgress[]>('/style-profile'),
  });
}

export function useStylePhotos(roomType: string | null) {
  return useQuery({
    queryKey: ['stylePhotos', roomType],
    queryFn: () => api.get<StylePhotoItem[]>(`/style-photos?roomType=${encodeURIComponent(roomType!)}`),
    enabled: !!roomType,
  });
}

export function useSwipeStylePhoto() {
  return useMutation({
    mutationFn: ({ id, liked }: { id: string; liked: boolean }) => api.post(`/style-photos/${id}/swipe`, { liked }),
  });
}

export function useInvalidateStyleProfile() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: styleProfileKey });
}
