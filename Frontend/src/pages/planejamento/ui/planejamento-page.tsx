import { ActivityIndicator } from 'react-native';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { planningQueries } from '@/entities/planning/api/planning-queries';
import { PlanLoadError } from '@/entities/planning/ui/plan-load-error';
import { usePlanHorizonStore } from '@/features/plan-horizon/model/plan-horizon-store';
import { PlanningBoard } from '@/widgets/planning-board/ui/planning-board';

export const PlanejamentoPage = () => {
  const months = usePlanHorizonStore((state) => state.months);
  const planQuery = useQuery({ ...planningQueries.plan(months), placeholderData: keepPreviousData });

  if (planQuery.isLoading) {
    return <ActivityIndicator color="#2563eb" className="mt-8" />;
  }

  if (planQuery.isError || !planQuery.data) {
    return <PlanLoadError onRetry={() => void planQuery.refetch()} />;
  }

  return <PlanningBoard plan={planQuery.data} isFetching={planQuery.isFetching} />;
};
