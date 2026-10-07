import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { planningQueries } from '@/entities/planning/api/planning-queries';
import { shiftMonthKey } from '@/entities/planning/model/month-key';
import { formatPercent, monthLabel, monthStatusLabel } from '@/entities/planning/model/month-label';
import type { IIncomeSource, IPlanExpenseLine, IPlanMonth } from '@/entities/planning/model/planning';
import { KpiCard } from '@/entities/planning/ui/kpi-card';
import { CreateExpenseButton } from '@/features/create-expense/ui/create-expense-button';
import { ExpenseEditRow } from '@/features/edit-expense-month/ui/expense-edit-row';
import { cn } from '@/shared/lib/cn';
import { formatMoney } from '@/shared/lib/format-money';
import { SurfaceCard } from '@/shared/ui/surface-card';

interface IMonthNavigatorProps {
  month: string;
  currentMonth: string;
  onChange: (month: string) => void;
}

const MonthNavigator = ({ month, currentMonth, onChange }: IMonthNavigatorProps) => {
  const label = monthLabel(month);
  return (
    <View className="flex-row items-center gap-2">
      <Pressable
        onPress={() => onChange(shiftMonthKey(month, -1))}
        accessibilityRole="button"
        accessibilityLabel="Mês anterior"
        className="w-11 min-h-[40px] rounded-control border border-border-subtle bg-card-bg items-center justify-center"
      >
        <Text className="text-title-md text-text-primary">‹</Text>
      </Pressable>
      <View className="min-w-[150px] items-center">
        <Text className="text-title-md text-text-primary font-bold">
          {label.name}/{label.year}
        </Text>
      </View>
      <Pressable
        onPress={() => onChange(shiftMonthKey(month, 1))}
        accessibilityRole="button"
        accessibilityLabel="Próximo mês"
        className="w-11 min-h-[40px] rounded-control border border-border-subtle bg-card-bg items-center justify-center"
      >
        <Text className="text-title-md text-text-primary">›</Text>
      </Pressable>
      {month === currentMonth ? null : (
        <Pressable
          onPress={() => onChange(currentMonth)}
          accessibilityRole="button"
          className="px-3 min-h-[40px] rounded-control border border-border-subtle bg-card-bg items-center justify-center"
        >
          <Text className="text-title-sm text-primary-container">Mês atual</Text>
        </Pressable>
      )}
    </View>
  );
};

const byDueDay = (left: IPlanExpenseLine, right: IPlanExpenseLine): number => {
  const leftDay = left.dueDay ?? 32;
  const rightDay = right.dueDay ?? 32;
  if (leftDay !== rightDay) {
    return leftDay - rightDay;
  }
  return left.name.localeCompare(right.name);
};

interface IExpenseListProps {
  month: IPlanMonth;
  incomeSources: IIncomeSource[];
}

const ExpenseList = ({ month, incomeSources }: IExpenseListProps) => {
  if (month.expenses.length === 0) {
    return (
      <SurfaceCard>
        <Text className="text-body-md text-muted">Nenhuma conta neste mês.</Text>
      </SurfaceCard>
    );
  }
  return (
    <SurfaceCard padded={false}>
      <View className="px-4 py-3 flex-row items-center justify-between">
        <Text className="text-title-sm text-text-primary font-bold">Contas do mês</Text>
        <Text className="text-body-sm text-muted">Toque para editar</Text>
      </View>
      {[...month.expenses].sort(byDueDay).map((line) => (
        <ExpenseEditRow
          key={`${month.month}-${line.expenseId}`}
          month={month.month}
          line={line}
          incomeSources={incomeSources}
        />
      ))}
    </SurfaceCard>
  );
};

export const ExpensesBoard = () => {
  const [viewedMonth, setViewedMonth] = useState<string | null>(null);
  const planQuery = useQuery({ ...planningQueries.month(viewedMonth), placeholderData: keepPreviousData });

  if (planQuery.isLoading) {
    return <ActivityIndicator color="#2563eb" className="mt-8" />;
  }

  const month = planQuery.data?.months[0];
  if (planQuery.isError || !planQuery.data || !month) {
    return (
      <SurfaceCard className="gap-3">
        <Text className="text-danger-text text-body-md">Não foi possível carregar as contas.</Text>
        <Pressable onPress={() => void planQuery.refetch()} className="self-start px-3 py-2 rounded-control border border-border-subtle">
          <Text className="text-title-sm text-primary-container">Tentar novamente</Text>
        </Pressable>
      </SurfaceCard>
    );
  }

  const plan = planQuery.data;
  const hasIncome = plan.incomeSources.length > 0;
  const activeCount = month.expenses.filter((line) => line.amount > 0).length;

  return (
    <View className="gap-space-lg">
      <View className="flex-row items-center justify-between gap-3 flex-wrap">
        <MonthNavigator month={month.month} currentMonth={plan.currentMonth} onChange={setViewedMonth} />
        <View className="flex-row items-center gap-2">
          {planQuery.isFetching ? <ActivityIndicator color="#2563eb" /> : null}
          <View className={cn('px-2 py-0.5 rounded-full', month.month === plan.currentMonth ? 'bg-positive-soft' : 'bg-surface')}>
            <Text className="text-label-caps text-muted uppercase">{monthStatusLabel(month.status)}</Text>
          </View>
          {hasIncome ? (
            <CreateExpenseButton
              currentMonth={plan.currentMonth}
              incomeSources={plan.incomeSources}
              initialMonth={month.month}
            />
          ) : null}
        </View>
      </View>

      {hasIncome ? null : (
        <SurfaceCard className="gap-1 border-brand-blue-border bg-brand-blue-soft">
          <Text className="text-title-md text-brand-blue-text">Cadastre suas rendas primeiro</Text>
        </SurfaceCard>
      )}

      <View className="flex-row flex-wrap gap-3">
        <KpiCard label="Total de contas" value={formatMoney(month.spend)} note={`${activeCount} lançamentos`} compact />
        <KpiCard label="Da renda" value={formatPercent(month.commitment)} note={`Renda de ${formatMoney(month.income)}`} compact />
      </View>

      <ExpenseList month={month} incomeSources={plan.incomeSources} />
    </View>
  );
};
