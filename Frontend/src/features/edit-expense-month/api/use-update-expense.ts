import { useMutation, useQueryClient } from '@tanstack/react-query';
import { planningQueries } from '@/entities/planning/api/planning-queries';
import { apiClient } from '@/shared/api/api-client';
import type { IUpdateExpensePayload } from '../model/build-edit-expense-payload';

export interface IUpdateExpenseInput {
  expenseId: string;
  payload: IUpdateExpensePayload;
}

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ expenseId, payload }: IUpdateExpenseInput) => {
      await apiClient.patch(`/planning/expenses/${expenseId}`, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: planningQueries.all() });
    },
  });
};
