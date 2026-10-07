import { Pressable, Text } from 'react-native';
import { SurfaceCard } from '@/shared/ui/surface-card';

interface IPlanLoadErrorProps {
  onRetry: () => void;
}

export const PlanLoadError = ({ onRetry }: IPlanLoadErrorProps) => (
  <SurfaceCard className="gap-3">
    <Text className="text-danger-text text-body-md">Não foi possível carregar o planejamento.</Text>
    <Pressable onPress={onRetry} className="self-start px-3 py-2 rounded-control border border-border-subtle">
      <Text className="text-title-sm text-primary-container">Tentar novamente</Text>
    </Pressable>
  </SurfaceCard>
);
