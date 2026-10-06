import { useMutation, useQueryClient } from '@tanstack/react-query';
import { planningQueries } from '@/entities/planning/api/planning-queries';
import type { IIncomeSource } from '@/entities/planning/model/planning';
import { apiClient } from '@/shared/api/api-client';

export interface IUpdateIncomeSourceInput {
  sourceId: string;
  amount: number;
}

export const useUpdateIncomeSource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sourceId, amount }: IUpdateIncomeSourceInput) => {
      const response = await apiClient.patch<IIncomeSource>(
        `/planning/income-sources/${sourceId}`,
        { amount },
      );
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: planningQueries.all() });
    },
  });
};
