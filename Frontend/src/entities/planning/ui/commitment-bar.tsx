import { View } from 'react-native';
import { cn } from '@/shared/lib/cn';
import { commitmentLevel } from '../model/month-label';

interface ICommitmentBarProps {
  value: number;
  thin?: boolean;
  tone?: 'primary' | 'muted';
}

export const CommitmentBar = ({ value, thin = false, tone = 'primary' }: ICommitmentBarProps) => {
  const level = commitmentLevel(value);
  let fillClass = 'bg-primary-container';
  if (tone === 'muted') {
    fillClass = 'bg-muted';
  }
  if (level === 'warning') {
    fillClass = 'bg-warning-amber';
  }
  if (level === 'danger') {
    fillClass = 'bg-danger-red';
  }

  return (
    <View
      className={cn('w-full rounded-full overflow-hidden bg-border-subtle', thin ? 'h-[3px]' : 'h-1.5')}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(value) }}
    >
      <View
        className={cn('h-full rounded-full', fillClass)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </View>
  );
};
