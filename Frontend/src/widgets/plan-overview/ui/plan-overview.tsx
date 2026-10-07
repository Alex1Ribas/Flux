import { ActivityIndicator, Text, View, useWindowDimensions } from 'react-native';
import { formatPercent, periodLabel } from '@/entities/planning/model/month-label';
import type { IPlan } from '@/entities/planning/model/planning';
import { KpiCard } from '@/entities/planning/ui/kpi-card';
import { PlanSettingsPanel } from '@/features/edit-plan-settings/ui/plan-settings-panel';
import { ExportPlanButton } from '@/features/export-plan/ui/export-plan-button';
import { formatMoney } from '@/shared/lib/format-money';
import { SurfaceCard } from '@/shared/ui/surface-card';

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

const IncomeOnboarding = () => (
  <SurfaceCard className="gap-1 border-brand-blue-border bg-brand-blue-soft">
    <Text className="text-title-md text-brand-blue-text">Comece pelas suas rendas</Text>
    <Text className="text-body-md text-brand-blue-text">
      Em “Ajustar entradas e reserva”, adicione cada renda com o dia do pagamento. Depois cadastre as contas do mês na aba Contas.
    </Text>
  </SurfaceCard>
);

interface IPlanOverviewProps {
  plan: IPlan;
  isFetching: boolean;
}

export const PlanOverview = ({ plan, isFetching }: IPlanOverviewProps) => {
  const hasIncome = plan.incomeSources.length > 0;

  return (
    <View className="gap-space-lg">
      <View className="flex-row items-center justify-end gap-2">
        {isFetching ? <ActivityIndicator color="#2563eb" /> : null}
        <ExportPlanButton plan={plan} />
      </View>
      {hasIncome ? null : <IncomeOnboarding />}
      <StatusBanner plan={plan} />
      <Summary plan={plan} />
      <PlanSettingsPanel settings={plan.settings} incomeSources={plan.incomeSources} />
    </View>
  );
};
