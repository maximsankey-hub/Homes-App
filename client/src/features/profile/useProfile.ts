import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PatternInsight, PreferenceProfile } from 'shared';
import { api } from '../../lib/apiClient';

const profileKey = ['profile'] as const;

export function useProfile() {
  return useQuery({
    queryKey: profileKey,
    queryFn: () => api.get<PreferenceProfile & { patterns: PatternInsight[] }>('/profile'),
  });
}

export interface UpdateProfileInput {
  method?: 'TAGS' | 'FREE_TEXT' | 'BOTH';
  freeText?: string;
  weightEmotional?: number;
  weightStorage?: number;
  weightLight?: number;
  weightNeighborhood?: number;
  aestheticStyle?: string;
  hasPets?: boolean;
  priorityBudgetVsDream?: number;
  priorityMoveInReadyVsReno?: number;
  tags?: { label: string; source: 'MANUAL' | 'AI_MAPPED' }[];
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => api.put('/profile', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: profileKey }),
  });
}

export function useAiMap() {
  return useMutation({
    mutationFn: (text: string) => api.post<{ matched: { phrase: string; label: string }[] }>('/profile/ai-map', { text }),
  });
}
