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
};
