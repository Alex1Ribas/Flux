import type { IPlanExpenseLine } from '@/entities/planning/model/planning';
import { buildEditExpensePayload, editExpenseFormFromLine } from '../build-edit-expense-payload';

const line: IPlanExpenseLine = {
  expenseId: 'conta-1',
  name: 'Tênis',
  dueDay: 15,
  dueNote: 'Dia 15 · parcela',
  amount: 100,
  sourceId: 'renda-a',
  isAdjusted: false,
  shareOfSpend: 0,
  shareOfIncome: 0,
  shareOfSource: 0,
};

describe('When opening the edit form from a plan line', () => {
  it('should strip the due day prefix from the note', () => {
    expect(editExpenseFormFromLine(line)).toEqual({
      name: 'Tênis',
      amount: expect.stringContaining('100,00'),
      dueDay: '15',
      note: 'parcela',
      sourceId: 'renda-a',
    });
  });
});

describe('When editing only the current month', () => {
  it('should send just the amount and the source', () => {
    const form = { ...editExpenseFormFromLine(line), name: '', amount: 'R$ 80,00', sourceId: 'renda-b' };
    expect(buildEditExpensePayload(form, 'month')).toEqual({
      ok: true,
      scope: 'month',
      payload: { amount: 80, sourceId: 'renda-b' },
    });
  });
});

describe('When editing all months', () => {
  it('should rebuild the due note and reset the month overrides', () => {
    const form = { ...editExpenseFormFromLine(line), name: ' Tênis novo ', dueDay: '20' };
    expect(buildEditExpensePayload(form, 'all')).toEqual({
      ok: true,
      scope: 'all',
      payload: {
        name: 'Tênis novo',
        amount: 100,
        dueDay: 20,
        dueNote: 'Dia 20 · parcela',
        sourceId: 'renda-a',
        resetMonthOverrides: true,
      },
    });
  });
});

describe('When editing all months with an invalid due day', () => {
  it('should return a validation error', () => {
    const form = { ...editExpenseFormFromLine(line), dueDay: '40' };
    expect(buildEditExpensePayload(form, 'all')).toEqual({ ok: false, error: 'O dia deve ser entre 1 e 31.' });
  });
});
