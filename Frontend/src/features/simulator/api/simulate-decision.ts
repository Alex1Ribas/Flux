import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api-client';
import type {
  ISimulateDecisionInput,
  IVerdict,
} from '@/entities/decision/model/verdict';

export const useSimulateDecision = () =>
  useMutation({
    mutationFn: async (input: ISimulateDecisionInput) => {
      const response = await apiClient.post<IVerdict>(
        '/decisions/simulate',
        input,
      );
      return response.data;
    },
  });
