import { parseMoneyInput } from '@/shared/lib/money-input';

export interface ICreateExpenseForm {
  name: string;
  amount: string;
  dueDay: string;
  note: string;
  sourceId: string | null;
  startMonth: string;
  installments: string;
}

export interface ICreateExpensePayload {
  name: string;
  amount: number;
  dueDay: number | null;
  dueNote: string;
  sourceId?: string;
  startMonth: string;
  installments?: number;
}

export type TBuildExpenseResult =
  | { ok: true; payload: ICreateExpensePayload }
  | { ok: false; error: string };

export const nextMonthKey = (monthKey: string): string => {
  const [year, month] = monthKey.split('-').map(Number);
  if (month === 12) {
    return `${year + 1}-01`;
  }
  return `${year}-${String(month + 1).padStart(2, '0')}`;
};

export const buildCreateExpensePayload = (form: ICreateExpenseForm): TBuildExpenseResult => {
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

  let installments: number | undefined;
  if (form.installments.trim()) {
    const parsedInstallments = Number(form.installments);
    if (!Number.isInteger(parsedInstallments) || parsedInstallments < 1) {
      return { ok: false, error: 'Parcelas deve ser um número inteiro maior que zero.' };
    }
    installments = parsedInstallments;
  }

  const note = form.note.trim();
  let dueNote = note;
  if (note && dueDay !== null) {
    dueNote = `Dia ${dueDay} · ${note}`;
  }

  const payload: ICreateExpensePayload = {
    name,
    amount: parseMoneyInput(form.amount),
    dueDay,
    dueNote,
    startMonth: form.startMonth,
  };
  if (form.sourceId) {
    payload.sourceId = form.sourceId;
  }
  if (installments !== undefined) {
    payload.installments = installments;
  }
  return { ok: true, payload };
};
