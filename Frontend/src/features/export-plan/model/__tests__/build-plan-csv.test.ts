import { EPlanMonthStatus, type IPlan } from '@/entities/planning/model/planning';
import { buildPlanCsv } from '../build-plan-csv';

const plan: IPlan = {
  from: '2026-10',
  to: '2026-10',
  currentMonth: '2026-10',
  settings: { id: 's', reserveRate: 30, initialReserve: 0 },
  incomeSources: [{ id: 'renda-a', name: 'Renda A', payDay: 7, amount: 1000 }],
  summary: { monthlyIncome: 1000, totalSpend: 746, commitment: 74.6, projectedReserve: 76.2, totalFree: 177.8 },
  months: [
    {
      month: '2026-10',
      status: EPlanMonthStatus.CURRENT,
      income: 1000,
      spend: 746,
      surplus: 254,
      reserve: 76.2,
      free: 177.8,
      accumulatedReserve: 76.2,
      commitment: 74.6,
      sources: [{ sourceId: 'renda-a', name: 'Renda A', income: 1000, spend: 746, remaining: 254, commitment: 74.6 }],
      expenses: [],
    },
  ],
};

describe('When exporting the plan to CSV', () => {
  it('should write one semicolon row per month with source columns', () => {
    const [header, row] = buildPlanCsv(plan).split('\n');
    expect(header).toContain('"Renda A";"% Renda A"');
    expect(row).toEqual(
      '"Outubro/2026";"1000,00";"746,00";"74,60";"746,00";"74,60";"254,00";"76,20";"177,80";"76,20"',
    );
  });
});
