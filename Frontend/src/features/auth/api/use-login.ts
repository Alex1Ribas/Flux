import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSessionStore } from '@/entities/session/model/session-store';
import { apiClient } from '@/shared/api/api-client';

export interface ILoginInput {
  email: string;
  password: string;
}

interface ILoginResponse {
  message: string;
  token: string;
  id: string;
}

export const useLogin = () => {
  const queryClient = useQueryClient();
  const signIn = useSessionStore((state) => state.signIn);

  return useMutation({
    mutationFn: async (input: ILoginInput) => {
      const response = await apiClient.post<ILoginResponse>('/users/login', input);
      return response.data;
    },
    onSuccess: async (data) => {
      queryClient.clear();
      await signIn(data.token, data.id);
    },
  });
};
