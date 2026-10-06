import { useMutation, useQueryClient } from '@tanstack/react-query';
import { planningQueries } from '@/entities/planning/api/planning-queries';
import { apiClient } from '@/shared/api/api-client';

export interface ISetExpenseMonthInput {
  expenseId: string;
  month: string;
  amount?: number;
  sourceId?: string;
}

export const useSetExpenseMonth = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ expenseId, month, amount, sourceId }: ISetExpenseMonthInput) => {
      await apiClient.put(`/planning/expenses/${expenseId}/months/${month}`, { amount, sourceId });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: planningQueries.all() });
    },
  });
};
