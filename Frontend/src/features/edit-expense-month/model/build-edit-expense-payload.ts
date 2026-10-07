import type { IPlanExpenseLine } from '@/entities/planning/model/planning';
import { formatMoneyFromNumber, parseMoneyInput } from '@/shared/lib/money-input';

export type TEditExpenseScope = 'month' | 'all';

export interface IEditExpenseForm {
  name: string;
  amount: string;
  dueDay: string;
  note: string;
  sourceId: string;
}

export interface IEditExpenseMonthPayload {
  amount: number;
  sourceId: string;
}

export interface IUpdateExpensePayload {
  name: string;
  amount: number;
  dueDay: number | null;
  dueNote: string;
  sourceId: string;
  resetMonthOverrides: true;
}

export type TBuildEditExpenseResult =
  | { ok: true; scope: 'month'; payload: IEditExpenseMonthPayload }
  | { ok: true; scope: 'all'; payload: IUpdateExpensePayload }
  | { ok: false; error: string };

const stripDuePrefix = (dueNote: string, dueDay: number | null): string => {
  if (dueDay === null) {
    return dueNote;
  }
  const prefix = `Dia ${dueDay} · `;
  if (dueNote.startsWith(prefix)) {
    return dueNote.slice(prefix.length);
  }
  return dueNote;
};

export const editExpenseFormFromLine = (line: IPlanExpenseLine): IEditExpenseForm => {
  let dueDay = '';
  if (line.dueDay !== null) {
    dueDay = String(line.dueDay);
  }
  return {
    name: line.name,
    amount: formatMoneyFromNumber(line.amount),
    dueDay,
    note: stripDuePrefix(line.dueNote, line.dueDay),
    sourceId: line.sourceId,
  };
};

export const buildEditExpensePayload = (
  form: IEditExpenseForm,
  scope: TEditExpenseScope,
): TBuildEditExpenseResult => {
  const amount = parseMoneyInput(form.amount);

  if (scope === 'month') {
    return { ok: true, scope, payload: { amount, sourceId: form.sourceId } };
  }

  const name = form.name.trim();
  if (!name) {
    return { ok: false, error: 'Informe o nome da conta.' };
  }

  let dueDay: number | null = null;
  if (form.dueDay.trim()) {
    const parsedDay = Number(form.dueDay);
    if (!Number.isInteger(parsedDay) || parsedDay < 1 || parsedDay > 31) {
      return { ok: false, error: 'O dia deve ser entre 1 e 31.' };
    }
    dueDay = parsedDay;
  }

  const note = form.note.trim();
  let dueNote = note;
  if (note && dueDay !== null) {
    dueNote = `Dia ${dueDay} · ${note}`;
  }

  return {
    ok: true,
    scope,
    payload: {
      name,
      amount,
      dueDay,
      dueNote,
      sourceId: form.sourceId,
      resetMonthOverrides: true,
    },
  };
};
