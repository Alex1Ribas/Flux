import { ActivityIndicator, Text, View, useWindowDimensions } from 'react-native';
import type { IPlan } from '@/entities/planning/model/planning';
import { ExtendHorizonButton } from '@/features/plan-horizon/ui/extend-horizon-button';
import { HorizonSelector } from '@/features/plan-horizon/ui/horizon-selector';
import { chunk, gridColumns } from '../model/plan-copy';
import { MonthCard } from './month-card';

interface IPlanSectionProps {
  plan: IPlan;
}

const MonthGrid = ({ plan }: IPlanSectionProps) => {
  const { width } = useWindowDimensions();
  const columns = gridColumns(width);
  return (
    <View className="gap-3">
      {chunk(plan.months, columns).map((row) => (
        <View key={row[0]?.month} className="flex-row gap-3 items-start">
          {row.map((month) => (
            <MonthCard key={month.month} month={month} incomeSources={plan.incomeSources} />
          ))}
          {Array.from({ length: columns - row.length }).map((_, index) => (
            <View key={`filler-${index}`} className="flex-1" />
          ))}
        </View>
      ))}
    </View>
  );
};

interface IPlanningBoardProps {
  plan: IPlan;
  isFetching: boolean;
}

export const PlanningBoard = ({ plan, isFetching }: IPlanningBoardProps) => (
  <View className="gap-space-lg">
    <View className="flex-row items-end justify-between gap-3 flex-wrap mt-1">
      <View className="flex-1 min-w-[200px]">
        <Text className="text-headline-sm text-text-primary font-bold">Fluxo mensal</Text>
      </View>
      <View className="flex-row items-center gap-2">
        {isFetching ? <ActivityIndicator color="#2563eb" /> : null}
        <HorizonSelector />
      </View>
    </View>

    <MonthGrid plan={plan} />
    <ExtendHorizonButton />
  </View>
);
