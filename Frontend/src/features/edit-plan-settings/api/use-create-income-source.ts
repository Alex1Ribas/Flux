import { useMutation, useQueryClient } from '@tanstack/react-query';
import { planningQueries } from '@/entities/planning/api/planning-queries';
import type { IIncomeSource } from '@/entities/planning/model/planning';
import { apiClient } from '@/shared/api/api-client';

export interface ICreateIncomeSourceInput {
  name: string;
  payDay: number;
  amount: number;
}

export const useCreateIncomeSource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ICreateIncomeSourceInput) => {
      const response = await apiClient.post<IIncomeSource>('/planning/income-sources', input);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: planningQueries.all() });
    },
  });
};
