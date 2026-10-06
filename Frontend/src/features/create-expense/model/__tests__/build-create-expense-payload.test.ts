import { buildCreateExpensePayload, nextMonthKey } from '../build-create-expense-payload';

const form = {
  name: ' Tênis ',
  amount: 'R$ 100,00',
  dueDay: '15',
  note: 'parcela',
  sourceId: null,
  startMonth: '2026-12',
  installments: '3',
};

describe('When building a new expense', () => {
  it('should compose the due note, installments and roll the month over the year', () => {
    expect(buildCreateExpensePayload(form)).toEqual({
      ok: true,
      payload: {
        name: 'Tênis',
        amount: 100,
        dueDay: 15,
        dueNote: 'Dia 15 · parcela',
        startMonth: '2026-12',
        installments: 3,
      },
    });
    expect(buildCreateExpensePayload({ ...form, dueDay: '40' })).toEqual({
      ok: false,
      error: 'O dia deve ser entre 1 e 31.',
    });
    expect(nextMonthKey('2026-12')).toEqual('2027-01');
  });
});
