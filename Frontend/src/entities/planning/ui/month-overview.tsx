import { Text, View } from 'react-native';
import { formatMoney } from '@/shared/lib/format-money';
import { cn } from '@/shared/lib/cn';
import { formatPercent, monthLabel, monthStatusLabel } from '../model/month-label';
import { EPlanMonthStatus, type IPlanMonth } from '../model/planning';
import { CommitmentBar } from './commitment-bar';

interface IMonthOverviewProps {
  month: IPlanMonth;
}

export const MonthOverview = ({ month }: IMonthOverviewProps) => {
  const label = monthLabel(month.month);
  const isCurrent = month.status === EPlanMonthStatus.CURRENT;

  return (
    <View>
      <View className="flex-row items-start justify-between gap-2 px-4 pt-4 pb-3">
        <View className="flex-row items-center gap-3">
          <View className="w-9 h-9 rounded-md bg-surface items-center justify-center border border-border-subtle">
            <Text className="text-badge-micro text-muted">{label.short}</Text>
          </View>
          <View>
            <Text className="text-title-md text-text-primary">{label.name}</Text>
            <Text className="text-body-sm text-muted">{label.year}</Text>
          </View>
        </View>
        <View className={cn('px-2 py-1 rounded-full', isCurrent ? 'bg-brand-blue-soft' : 'bg-surface')}>
          <Text className={cn('text-badge-micro uppercase', isCurrent ? 'text-brand-blue-text' : 'text-muted')}>
            {monthStatusLabel(month.status)}
          </Text>
        </View>
      </View>

      <View className="px-4 pb-3">
        <View className="flex-row items-end justify-between gap-3">
          <View>
            <Text className="text-label-caps text-muted uppercase">Gastos do mês</Text>
            <Text className="text-headline-md text-text-primary">{formatMoney(month.spend)}</Text>
          </View>
          <View className="items-end">
            <Text className="text-title-md text-text-primary">{formatPercent(month.commitment)}</Text>
            <Text className="text-body-sm text-muted">da renda</Text>
          </View>
        </View>
        <View className="mt-3">
          <CommitmentBar value={month.commitment} />
        </View>
      </View>

      <View className="flex-row border-y border-border-subtle bg-surface">
        {month.sources.map((source, index) => (
          <View
            key={source.sourceId}
            className={cn('flex-1 px-4 py-3', index > 0 ? 'border-l border-border-subtle' : '')}
          >
            <View className="flex-row justify-between gap-2">
              <Text className="text-title-sm text-text-primary">{source.name}</Text>
              <Text className="text-body-sm text-muted">{formatPercent(source.commitment)}</Text>
            </View>
            <Text className="text-label-numeric-md text-text-primary mt-1">{formatMoney(source.spend)}</Text>
            <Text className="text-body-sm text-muted">sobra {formatMoney(source.remaining)}</Text>
            <View className="mt-2">
              <CommitmentBar value={source.commitment} thin tone={index === 0 ? 'muted' : 'primary'} />
            </View>
          </View>
        ))}
      </View>

      <View className="flex-row gap-2 px-4 py-3">
        <View className="flex-1">
          <Text className="text-body-sm text-muted">Sobra</Text>
          <Text className="text-title-sm text-text-primary font-mono" numberOfLines={1}>
            {formatMoney(month.surplus)}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-body-sm text-muted">Reserva</Text>
          <Text className="text-title-sm text-primary-container font-mono" numberOfLines={1}>
            {formatMoney(month.reserve)}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-body-sm text-muted">Livre</Text>
          <Text
            className={cn('text-title-sm font-mono', month.free < 0 ? 'text-danger-red' : 'text-text-primary')}
            numberOfLines={1}
          >
            {formatMoney(month.free)}
          </Text>
        </View>
      </View>
    </View>
  );
};
