import { ActivityIndicator, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { planningQueries } from '@/entities/planning/api/planning-queries';
import { formatPercent, periodLabel } from '@/entities/planning/model/month-label';
import type { IPlan } from '@/entities/planning/model/planning';
import { KpiCard } from '@/entities/planning/ui/kpi-card';
import { CreateExpenseButton } from '@/features/create-expense/ui/create-expense-button';
import { PlanSettingsPanel } from '@/features/edit-plan-settings/ui/plan-settings-panel';
import { ExportPlanButton } from '@/features/export-plan/ui/export-plan-button';
import { usePlanHorizonStore } from '@/features/plan-horizon/model/plan-horizon-store';
import { ExtendHorizonButton } from '@/features/plan-horizon/ui/extend-horizon-button';
import { HorizonSelector } from '@/features/plan-horizon/ui/horizon-selector';
import { formatMoney } from '@/shared/lib/format-money';
import { SurfaceCard } from '@/shared/ui/surface-card';
import { chunk, gridColumns, sourceRuleNote } from '../model/plan-copy';
import { MonthCard } from './month-card';

interface IPlanSectionProps {
  plan: IPlan;
}

const StatusBanner = ({ plan }: IPlanSectionProps) => (
  <SurfaceCard className="flex-row items-center justify-between gap-3 py-3 px-4 flex-wrap">
    <View className="flex-row items-center gap-3 flex-1 min-w-[200px]">
      <View className="w-2 h-2 rounded-full bg-primary-container" />
      <Text className="text-title-sm text-text-primary">
        Reserva atual em {formatMoney(plan.settings.initialReserve)}
        <Text className="text-body-sm text-muted"> · {plan.settings.reserveRate}% da sobra vai para a reserva</Text>
      </Text>
    </View>
    <Text className="text-body-sm text-muted">{periodLabel(plan.from, plan.to)}</Text>
  </SurfaceCard>
);

const COMPACT_BREAKPOINT = 700;

const Summary = ({ plan }: IPlanSectionProps) => {
  const { width } = useWindowDimensions();
  const compact = width < COMPACT_BREAKPOINT;
  const sourceNames = plan.incomeSources.map((source) => source.name).join(' + ');
  return (
    <View className="flex-row flex-wrap gap-3">
      <KpiCard label="Renda mensal" compact={compact} value={formatMoney(plan.summary.monthlyIncome)} note={sourceNames} />
      <KpiCard
        label={`Gastos em ${plan.months.length} meses`} compact={compact}
        value={formatMoney(plan.summary.totalSpend)}
        note={`${formatPercent(plan.summary.commitment)} da renda do período`}
      />
      <KpiCard
        label="Reserva projetada" compact={compact}
        value={formatMoney(plan.summary.projectedReserve)}
        note={`${plan.settings.reserveRate}% da sobra de cada mês`}
        accent
      />
      <KpiCard
        label="Livre após reserva" compact={compact}
        value={formatMoney(plan.summary.totalFree)}
        note="Total disponível no período"
      />
    </View>
  );
};

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

export const PlanningBoard = () => {
  const months = usePlanHorizonStore((state) => state.months);
  const planQuery = useQuery({ ...planningQueries.plan(months), placeholderData: keepPreviousData });

  if (planQuery.isLoading) {
    return <ActivityIndicator color="#2563eb" className="mt-8" />;
  }

  if (planQuery.isError || !planQuery.data) {
    return (
      <SurfaceCard className="gap-3">
        <Text className="text-danger-text text-body-md">Não foi possível carregar o planejamento.</Text>
        <Pressable onPress={() => void planQuery.refetch()} className="self-start px-3 py-2 rounded-control border border-border-subtle">
          <Text className="text-title-sm text-primary-container">Tentar novamente</Text>
        </Pressable>
      </SurfaceCard>
    );
  }

  const plan = planQuery.data;
  const hasIncome = plan.incomeSources.length > 0;

  return (
    <View className="gap-space-lg">
      <View className="flex-row items-center justify-end gap-2">
        {planQuery.isFetching ? <ActivityIndicator color="#2563eb" /> : null}
        <ExportPlanButton plan={plan} />
        {hasIncome ? (
          <CreateExpenseButton currentMonth={plan.currentMonth} incomeSources={plan.incomeSources} />
        ) : null}
      </View>
      {hasIncome ? null : (
        <SurfaceCard className="gap-1 border-brand-blue-border bg-brand-blue-soft">
          <Text className="text-title-md text-brand-blue-text">Comece pelas suas rendas</Text>
          <Text className="text-body-md text-brand-blue-text">
            Em “Ajustar entradas e reserva”, adicione cada renda com o dia do pagamento. Depois use “+ Conta” para cadastrar as contas do mês.
          </Text>
        </SurfaceCard>
      )}
      <StatusBanner plan={plan} />
      <Summary plan={plan} />
      <PlanSettingsPanel settings={plan.settings} incomeSources={plan.incomeSources} />

      <View className="flex-row items-end justify-between gap-3 flex-wrap mt-1">
        <View className="flex-1 min-w-[200px]">
          <Text className="text-headline-sm text-text-primary font-bold">Fluxo mensal</Text>
          <Text className="text-body-sm text-muted mt-1">
            Abra “Ver contas” para ajustar valor e fonte de cada mês.
          </Text>
        </View>
        <HorizonSelector />
      </View>

      <MonthGrid plan={plan} />
      <ExtendHorizonButton />

      <View className="flex-row gap-2 p-3 rounded-lg border border-border-subtle bg-surface">
        <Text className="text-primary-container text-title-sm">ⓘ</Text>
        <Text className="flex-1 text-body-sm text-muted">
          <Text className="font-bold text-text-primary">Critério usado: </Text>
          {sourceRuleNote(plan.incomeSources)}
        </Text>
      </View>
      <Text className="text-body-sm text-muted">
        Contas sem data de término continuam nos meses seguintes. Faturas sem valor informado ficam zeradas até serem editadas.
      </Text>
    </View>
  );
};
