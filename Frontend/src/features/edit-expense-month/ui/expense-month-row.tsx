import { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { dueLabel, formatPercent } from '@/entities/planning/model/month-label';
import type { IIncomeSource, IPlanExpenseLine } from '@/entities/planning/model/planning';
import { cn } from '@/shared/lib/cn';
import { formatMoneyFromNumber, formatMoneyInput, parseMoneyInput } from '@/shared/lib/money-input';
import { useSetExpenseMonth } from '../api/use-set-expense-month';

interface IExpenseMonthRowProps {
  month: string;
  line: IPlanExpenseLine;
  incomeSources: IIncomeSource[];
}

export const ExpenseMonthRow = ({ month, line, incomeSources }: IExpenseMonthRowProps) => {
  const [amount, setAmount] = useState(formatMoneyFromNumber(line.amount));
  const setExpenseMonth = useSetExpenseMonth();

  useEffect(() => {
    setAmount(formatMoneyFromNumber(line.amount));
  }, [line.amount]);

  const commitAmount = () => {
    const parsed = parseMoneyInput(amount);
    if (parsed === line.amount) {
      return;
    }
    setExpenseMonth.mutate({ expenseId: line.expenseId, month, amount: parsed });
  };

  const changeSource = (sourceId: string) => {
    if (sourceId === line.sourceId) {
      return;
    }
    setExpenseMonth.mutate({ expenseId: line.expenseId, month, sourceId });
  };

  return (
    <View className={cn('px-4 py-3 gap-2 border-t border-border-subtle', line.amount === 0 ? 'opacity-60' : '')}>
      <View className="flex-row items-start gap-3">
        <View className="flex-1">
          <View className="flex-row items-center gap-1.5 flex-wrap">
            <Text className="text-title-sm text-text-primary">{line.name}</Text>
            {line.isAdjusted ? (
              <View className="px-1.5 py-0.5 rounded-full bg-warning-soft">
                <Text className="text-badge-micro text-warning-text uppercase">ajustado</Text>
              </View>
            ) : null}
          </View>
          <Text className="text-body-sm text-muted">{dueLabel(line.dueDay, line.dueNote)}</Text>
        </View>
        <TextInput
          className="w-[112px] h-[38px] px-2 rounded-control border border-border-subtle bg-surface text-body-md text-text-primary font-mono text-right"
          value={amount}
          onChangeText={(text) => setAmount(formatMoneyInput(text))}
          onEndEditing={commitAmount}
          onBlur={commitAmount}
          keyboardType="numeric"
          accessibilityLabel={`Valor de ${line.name}`}
        />
      </View>
      <View className="flex-row items-center justify-between gap-2 flex-wrap">
        <View className="flex-row gap-1.5" accessibilityLabel={`Fonte de ${line.name}`}>
          {incomeSources.map((source) => {
            const isActive = source.id === line.sourceId;
            return (
              <Pressable
                key={source.id}
                onPress={() => changeSource(source.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected: isActive }}
                className={cn(
                  'px-2.5 min-h-[30px] rounded-full border items-center justify-center',
                  isActive ? 'border-primary-container bg-brand-blue-soft' : 'border-border-subtle bg-card-bg',
                )}
              >
                <Text className={cn('text-body-sm font-bold', isActive ? 'text-brand-blue-text' : 'text-muted')}>
                  {source.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text className="text-body-sm text-muted font-mono">
          {formatPercent(line.shareOfSpend)} gastos · {formatPercent(line.shareOfIncome)} renda ·{' '}
          {formatPercent(line.shareOfSource)} fonte
        </Text>
      </View>
    </View>
  );
};
