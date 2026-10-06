import {
  EDecisionMode,
  type ISimulateDecisionInput,
} from '@/entities/decision/model/verdict';
import { parseMoneyInput } from '@/shared/lib/money-input';
import type { ISimulatorFormState } from './simulator-form';

const optionalMoney = (raw: string): number | undefined => {
  if (!raw.replace(/\D/g, '')) {
    return undefined;
  }
  return parseMoneyInput(raw);
};

export const buildSimulatePayload = (
  mode: EDecisionMode,
  form: ISimulatorFormState,
): ISimulateDecisionInput => {
  if (mode === EDecisionMode.HOJE) {
    return {
      mode,
      day: Number(form.day) || new Date().getDate(),
      available: optionalMoney(form.available),
      expense: parseMoneyInput(form.expense),
    };
  }

  if (mode === EDecisionMode.PARCELA) {
    return {
      mode,
      total: parseMoneyInput(form.total),
      installments: Number(form.installments) || 1,
    };
  }

  return {
    mode,
    value: parseMoneyInput(form.value),
    installments: Number(form.cashInstallments) || 1,
    available: optionalMoney(form.cashAvailable),
  };
};
