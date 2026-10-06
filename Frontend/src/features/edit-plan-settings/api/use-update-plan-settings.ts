import { useMutation, useQueryClient } from '@tanstack/react-query';
import { planningQueries } from '@/entities/planning/api/planning-queries';
import type { IPlanningSettings } from '@/entities/planning/model/planning';
import { apiClient } from '@/shared/api/api-client';

export interface IUpdatePlanSettingsInput {
  reserveRate?: number;
  initialReserve?: number;
}

export const useUpdatePlanSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: IUpdatePlanSettingsInput) => {
      const response = await apiClient.patch<IPlanningSettings>('/planning/settings', input);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: planningQueries.all() });
    },
  });
};
