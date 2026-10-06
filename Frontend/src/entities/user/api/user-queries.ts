import { queryOptions } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api-client';
import type { IUser } from '../model/user';

export const userQueries = {
  all: () => ['users'] as const,
  me: () =>
    queryOptions({
      queryKey: [...userQueries.all(), 'me'] as const,
      queryFn: async () => {
        const response = await apiClient.get<IUser>('/users/me');
        return response.data;
      },
    }),
};
