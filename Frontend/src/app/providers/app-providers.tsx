import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { queryClient } from '@/shared/lib/react-query';

interface IAppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: IAppProvidersProps) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);
