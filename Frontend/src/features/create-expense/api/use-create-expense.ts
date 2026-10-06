import { useMutation, useQueryClient } from '@tanstack/react-query';
import { planningQueries } from '@/entities/planning/api/planning-queries';
import { apiClient } from '@/shared/api/api-client';
import type { ICreateExpensePayload } from '../model/build-create-expense-payload';

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ICreateExpensePayload) => {
      await apiClient.post('/planning/expenses', payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: planningQueries.all() });
    },
  });
};
