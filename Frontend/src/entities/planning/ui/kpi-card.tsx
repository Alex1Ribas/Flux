import { Text, View } from 'react-native';
import { cn } from '@/shared/lib/cn';
import { cardShadowStyle } from '@/shared/lib/elevation';

interface IKpiCardProps {
  label: string;
  value: string;
  note: string;
  accent?: boolean;
  compact?: boolean;
}

export const KpiCard = ({ label, value, note, accent = false, compact = false }: IKpiCardProps) => (
  <View
    className={cn(
      'flex-1 min-w-[150px] rounded-lg border',
      compact ? 'p-3' : 'p-4',
      accent ? 'bg-brand-blue-soft border-brand-blue-border' : 'bg-card-bg border-border-subtle',
    )}
    style={cardShadowStyle}
  >
    <Text className={cn('text-label-caps uppercase', accent ? 'text-brand-blue-text' : 'text-muted')}>
      {label}
    </Text>
    <Text
      className={cn('text-text-primary mt-2', compact ? 'text-[17px] leading-6 font-extrabold' : 'text-label-numeric-lg')}
      numberOfLines={1}
    >
      {value}
    </Text>
    <Text className={cn('text-body-sm mt-1', accent ? 'text-brand-blue-text' : 'text-muted')}>{note}</Text>
  </View>
);
