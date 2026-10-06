import { Pressable, Text } from 'react-native';
import { HORIZON_STEP, MAX_HORIZON, usePlanHorizonStore } from '../model/plan-horizon-store';

export const ExtendHorizonButton = () => {
  const months = usePlanHorizonStore((state) => state.months);
  const extend = usePlanHorizonStore((state) => state.extend);

  if (months >= MAX_HORIZON) {
    return null;
  }

  return (
    <Pressable
      onPress={extend}
      className="min-h-[44px] rounded-control border border-border-subtle bg-card-bg items-center justify-center"
      accessibilityRole="button"
    >
      <Text className="text-title-sm text-primary-container">
        + Mais {HORIZON_STEP} meses
      </Text>
    </Pressable>
  );
};
