import { useCallback, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { planningQueries } from '@/entities/planning/api/planning-queries';
import { EDecisionMode, type IVerdict } from '@/entities/decision/model/verdict';
import { useSimulateDecision } from '../api/simulate-decision';
import { buildSimulatePayload } from '../model/build-simulate-payload';
import {
  createDefaultSimulatorForm,
  type ISimulatorFormState,
} from '../model/simulator-form';
import { formatMoneyInput } from '@/shared/lib/money-input';

const MONEY_FIELDS = new Set<keyof ISimulatorFormState>([
  'available',
  'expense',
  'total',
  'value',
  'cashAvailable',
]);

export const useSimulator = () => {
  const [mode, setMode] = useState<EDecisionMode>(EDecisionMode.HOJE);
  const [form, setForm] = useState<ISimulatorFormState>(createDefaultSimulatorForm);
  const [verdict, setVerdict] = useState<IVerdict | null>(null);

  const planQuery = useQuery(planningQueries.plan(1));
  const simulateMutation = useSimulateDecision();

  const updateField = useCallback(
    (field: keyof ISimulatorFormState, value: string) => {
      let nextValue = value;
      if (MONEY_FIELDS.has(field)) {
        nextValue = '';
        if (value.replace(/\D/g, '')) {
          nextValue = formatMoneyInput(value);
        }
      }
      setForm((current) => ({ ...current, [field]: nextValue }));
    },
    [],
  );

  const runSimulation = useCallback(async () => {
    const payload = buildSimulatePayload(mode, {
      ...form,
      day: String(new Date().getDate()),
    });
    try {
      const result = await simulateMutation.mutateAsync(payload);
      setVerdict(result);
    } catch {
      setVerdict(null);
    }
  }, [form, mode, simulateMutation]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void runSimulation();
    }, 280);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [form, mode]);

  return {
    mode,
    setMode,
    form,
    updateField,
    verdict,
    isLoading: simulateMutation.isPending,
    currentMonth: planQuery.data?.months[0],
    planError: planQuery.isError,
  };
};
