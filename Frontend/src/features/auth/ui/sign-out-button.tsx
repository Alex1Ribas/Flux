import { Pressable, Text } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useSessionStore } from '@/entities/session/model/session-store';

export const SignOutButton = () => {
  const queryClient = useQueryClient();
  const signOut = useSessionStore((state) => state.signOut);

  return (
    <Pressable
      onPress={() => {
        queryClient.clear();
        void signOut();
      }}
      className="min-h-[40px] px-space-md rounded-control flex-row items-center gap-space-sm"
      accessibilityRole="button"
    >
      <Text className="text-body-md text-dark-sidebar-muted">⎋ Sair</Text>
    </Pressable>
  );
};
