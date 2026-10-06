import { commitmentLevel, dueLabel, monthLabel, periodLabel } from '../month-label';

describe('When labeling plan months', () => {
  it('should format names, periods, due dates and commitment levels', () => {
    expect(monthLabel('2026-10')).toEqual({ name: 'Outubro', short: 'OUT', year: '2026' });
    expect(periodLabel('2026-10', '2027-03')).toEqual('Outubro de 2026 — Março de 2027');
    expect(dueLabel(null, '')).toEqual('Sem dia definido');
    expect(dueLabel(20, '')).toEqual('Dia 20');
    expect(commitmentLevel(85)).toEqual('warning');
    expect(commitmentLevel(101)).toEqual('danger');
  });
});
