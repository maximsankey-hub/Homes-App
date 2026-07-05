import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { BuyersData, ImprovePlan, Listing, MarketData } from 'shared';
import { api } from '../../lib/apiClient';

export function useListingDashboard() {
  return useQuery({ queryKey: ['listing'], queryFn: () => api.get<Listing>('/listing') });
}

export function useListingMarket() {
  return useQuery({ queryKey: ['listing', 'market'], queryFn: () => api.get<MarketData>('/listing/market') });
}

export function useListingBuyers() {
  return useQuery({ queryKey: ['listing', 'buyers'], queryFn: () => api.get<BuyersData>('/listing/buyers') });
}

export function useListingImprovements() {
  return useQuery({ queryKey: ['listing', 'improvements'], queryFn: () => api.get<ImprovePlan>('/listing/improvements') });
}

export interface CreateImprovementInput {
  title: string;
  demandLevel?: 'HIGH' | 'MODERATE' | 'LOW';
  type?: 'COSMETIC' | 'STRUCTURAL';
  valueLift?: number;
  costLow?: number;
  costHigh?: number;
}

export function useCreateImprovement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateImprovementInput) => api.post('/listing/improvements', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['listing', 'improvements'] }),
  });
}

export function useDeleteImprovement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/listing/improvements/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['listing', 'improvements'] }),
  });
}
