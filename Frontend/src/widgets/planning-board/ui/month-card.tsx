import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { IIncomeSource, IPlanMonth } from '@/entities/planning/model/planning';
import { MonthOverview } from '@/entities/planning/ui/month-overview';
import { ExpenseMonthRow } from '@/features/edit-expense-month/ui/expense-month-row';
import { SurfaceCard } from '@/shared/ui/surface-card';

interface IMonthCardProps {
  month: IPlanMonth;
  incomeSources: IIncomeSource[];
}

export const MonthCard = ({ month, incomeSources }: IMonthCardProps) => {
  const [open, setOpen] = useState(false);
  const activeCount = month.expenses.filter((line) => line.amount > 0).length;

  return (
    <SurfaceCard padded={false} className="flex-1">
      <MonthOverview month={month} />
      <Pressable
        onPress={() => setOpen(!open)}
        className="min-h-[44px] px-4 flex-row items-center justify-between border-t border-border-subtle"
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
      >
        <Text className="text-title-sm text-muted">Ver contas</Text>
        <Text className="text-body-sm text-muted">
          {activeCount} lançamentos {open ? '−' : '+'}
        </Text>
      </Pressable>
      {open ? (
        <View className="bg-card-bg">
          {month.expenses.map((line) => (
            <ExpenseMonthRow
              key={line.expenseId}
              month={month.month}
              line={line}
              incomeSources={incomeSources}
            />
          ))}
        </View>
      ) : null}
    </SurfaceCard>
  );
};
