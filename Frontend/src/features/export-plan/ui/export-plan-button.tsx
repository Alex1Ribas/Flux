import { useState } from 'react';
import { Pressable, Share, Text } from 'react-native';
import type { IPlan } from '@/entities/planning/model/planning';
import { buildPlanCsv } from '../model/build-plan-csv';

interface IExportPlanButtonProps {
  plan: IPlan;
}

export const ExportPlanButton = ({ plan }: IExportPlanButtonProps) => {
  const [failed, setFailed] = useState(false);

  const exportPlan = async () => {
    try {
      setFailed(false);
      await Share.share({
        title: `planejamento-financeiro-${plan.months.length}-meses.csv`,
        message: buildPlanCsv(plan),
      });
    } catch {
      setFailed(true);
    }
  };

  return (
    <Pressable
      onPress={() => {
        void exportPlan();
      }}
      className="px-4 min-h-[44px] rounded-control border border-border-subtle bg-card-bg flex-row items-center justify-center gap-1.5"
      accessibilityRole="button"
    >
      <Text className="text-title-sm text-text-primary">⇩ {failed ? 'Não foi possível exportar' : 'Exportar'}</Text>
    </Pressable>
  );
};
