import { useEffect, type ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useSessionStore } from '@/entities/session/model/session-store';
import { AuthScreen } from '@/features/auth/ui/auth-screen';
import { configureApiAuth } from '@/shared/api/api-client';
import { queryClient } from '@/shared/lib/react-query';

configureApiAuth(
  () => useSessionStore.getState().token,
  () => {
    queryClient.clear();
    void useSessionStore.getState().signOut();
  },
);

interface ISessionGateProps {
  children: ReactNode;
}

export const SessionGate = ({ children }: ISessionGateProps) => {
  const status = useSessionStore((state) => state.status);
  const hydrate = useSessionStore((state) => state.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (status === 'loading') {
    return (
      <View className="flex-1 items-center justify-center bg-app-bg">
        <ActivityIndicator color="#2563eb" size="large" />
      </View>
    );
  }

  if (status === 'anonymous') {
    return <AuthScreen />;
  }

  return children;
};
