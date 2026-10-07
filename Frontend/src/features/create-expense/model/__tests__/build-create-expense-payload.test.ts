import { buildCreateExpensePayload, shiftMonthKey } from '../build-create-expense-payload';

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
    expect(buildCreateExpensePayload(form, '2026-10')).toEqual({
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
    expect(buildCreateExpensePayload({ ...form, dueDay: '40' }, '2026-10')).toEqual({
      ok: false,
      error: 'O dia deve ser entre 1 e 31.',
    });
    expect(shiftMonthKey('2026-12', 1)).toEqual('2027-01');
    expect(shiftMonthKey('2026-01', -1)).toEqual('2025-12');
  });

  it('should reject a month in the past', () => {
    expect(buildCreateExpensePayload({ ...form, startMonth: '2026-09' }, '2026-10')).toEqual({
      ok: false,
      error: 'A conta não pode começar em um mês passado.',
    });
  });
});
