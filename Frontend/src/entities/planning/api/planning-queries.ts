import { queryOptions } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api-client';
import type { IPlan } from '../model/planning';

export const planningQueries = {
  all: () => ['planning'] as const,
  plan: (months: number) =>
    queryOptions({
      queryKey: [...planningQueries.all(), 'plan', months] as const,
      queryFn: async () => {
        const response = await apiClient.get<IPlan>('/planning', { params: { months } });
        return response.data;
      },
    }),
  month: (monthKey: string | null) =>
    queryOptions({
      queryKey: [...planningQueries.all(), 'month', monthKey ?? 'current'] as const,
      queryFn: async () => {
        const response = await apiClient.get<IPlan>('/planning', {
          params: { from: monthKey ?? undefined, months: 1 },
        });
        return response.data;
      },
    }),
};
