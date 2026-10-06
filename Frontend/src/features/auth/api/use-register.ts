import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api-client';

export interface IRegisterInput {
  name: string;
  email: string;
  password: string;
  confPassword: string;
}

export const useRegister = () =>
  useMutation({
    mutationFn: async (input: IRegisterInput) => {
      await apiClient.post('/users/register', input);
    },
  });
