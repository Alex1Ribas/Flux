import { Pressable, Text, View } from 'react-native';
import { cn } from '@/shared/lib/cn';
import { HORIZON_PRESETS, usePlanHorizonStore } from '../model/plan-horizon-store';

export const HorizonSelector = () => {
  const months = usePlanHorizonStore((state) => state.months);
  const setMonths = usePlanHorizonStore((state) => state.setMonths);

  return (
    <View className="flex-row gap-2" accessibilityRole="radiogroup">
      {HORIZON_PRESETS.map((preset) => {
        const isActive = preset === months;
        return (
          <Pressable
            key={preset}
            onPress={() => setMonths(preset)}
            accessibilityRole="radio"
            accessibilityState={{ selected: isActive }}
            className={cn(
              'px-3 min-h-[36px] rounded-control border items-center justify-center',
              isActive ? 'border-primary-container bg-brand-blue-soft' : 'border-border-subtle bg-card-bg',
            )}
          >
            <Text className={cn('text-title-sm', isActive ? 'text-brand-blue-text' : 'text-muted')}>
              {preset} meses
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};
