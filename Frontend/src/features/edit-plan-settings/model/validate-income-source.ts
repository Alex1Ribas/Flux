import { parseMoneyInput } from '@/shared/lib/money-input';
import type { ICreateIncomeSourceInput } from '../api/use-create-income-source';

export interface IIncomeSourceForm {
  name: string;
  payDay: string;
  amount: string;
}

export type TIncomeSourceResult =
  | { ok: true; input: ICreateIncomeSourceInput }
  | { ok: false; error: string };

export const validateIncomeSource = (form: IIncomeSourceForm): TIncomeSourceResult => {
  const name = form.name.trim();
  if (!name) {
    return { ok: false, error: 'Informe o nome da renda.' };
  }
  const payDay = Number(form.payDay);
  if (!Number.isInteger(payDay) || payDay < 1 || payDay > 31) {
    return { ok: false, error: 'O dia do pagamento deve ser entre 1 e 31.' };
  }
  return { ok: true, input: { name, payDay, amount: parseMoneyInput(form.amount) } };
};
