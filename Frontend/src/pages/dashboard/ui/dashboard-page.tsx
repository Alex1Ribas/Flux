import { ActivityIndicator } from 'react-native';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { planningQueries } from '@/entities/planning/api/planning-queries';
import { PlanLoadError } from '@/entities/planning/ui/plan-load-error';
import { usePlanHorizonStore } from '@/features/plan-horizon/model/plan-horizon-store';
import { PlanOverview } from '@/widgets/plan-overview/ui/plan-overview';

export const DashboardPage = () => {
  const months = usePlanHorizonStore((state) => state.months);
  const planQuery = useQuery({ ...planningQueries.plan(months), placeholderData: keepPreviousData });

  if (planQuery.isLoading) {
    return <ActivityIndicator color="#2563eb" className="mt-8" />;
  }

  if (planQuery.isError || !planQuery.data) {
    return <PlanLoadError onRetry={() => void planQuery.refetch()} />;
  }

  return <PlanOverview plan={planQuery.data} isFetching={planQuery.isFetching} />;
};
