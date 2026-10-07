import type {
  IExpense,
  IIncomeSource,
  IPlanningSettings,
} from '../../../../domain/planning/entity/interfaces/planning.interface.js';
import { addMonths, currentMonthKey } from '../../../../domain/planning/service/month.helper.js';
import {
  calculatePlan,
  defaultSourceForDueDay,
} from '../../../../domain/planning/service/planning.helper.js';

const settings: IPlanningSettings = { id: 'settings', reserveRate: 30, initialReserve: 0 };
const sources: IIncomeSource[] = [
  { id: 'renda-a', name: 'Renda A', payDay: 7, amount: 1000 },
  { id: 'renda-b', name: 'Renda B', payDay: 20, amount: 2500 },
];

function expense(
  name: string,
  defaultAmount: number,
  defaultSourceId: string,
  overrides: Partial<IExpense> = {},
): IExpense {
  return {
    id: name,
    name,
    dueDay: 20,
    dueNote: '',
    defaultAmount,
    defaultSourceId,
    startMonth: '2026-10',
    endMonth: null,
    monthOverrides: [],
    ...overrides,
  };
}

const htmlExpenses: IExpense[] = [
  expense('Conta curta', 188, 'renda-b', { endMonth: '2026-11' }),
  expense('Parcela 1', 150, 'renda-b'),
  expense('Parcela 2', 80, 'renda-b'),
  expense('Variável', 80, 'renda-b', { dueDay: null }),
  expense('Parcela 3', 110, 'renda-a'),
  expense('Cota', 30, 'renda-b'),
  expense('Fatura A', 0, 'renda-a', {
    monthOverrides: [
      { month: '2026-10', amount: 606 },
      { month: '2026-11', amount: 75 },
    ],
  }),
  expense('Fatura B', 0, 'renda-b', {
    monthOverrides: [
      { month: '2026-10', amount: 517 },
      { month: '2026-11', amount: 419 },
      { month: '2026-12', amount: 312 },
      { month: '2027-01', amount: 312 },
    ],
  }),
  expense('Financiamento', 725, 'renda-b'),
  expense('Plano', 44, 'renda-b'),
  expense('Internet', 30, 'renda-a'),
];

describe('calculatePlan', () => {
  describe('when using the reference spreadsheet data', () => {
    const plan = calculatePlan({
      from: '2026-10',
      monthCount: 6,
      currentMonth: '2026-10',
      settings,
      sources,
      expenses: htmlExpenses,
    });

    it('should match the HTML numbers for October', () => {
      const october = plan.months[0];
      expect(october?.spend).toEqual(2560);
      expect(october?.surplus).toEqual(940);
      expect(october?.reserve).toEqual(282);
      expect(october?.free).toEqual(658);
      expect(october?.status).toEqual('current');
      expect(october?.sources.find((source) => source.sourceId === 'renda-a')?.spend).toEqual(746);
    });

    it('should drop the phone after November and the faturas when not informed', () => {
      expect(plan.months.map((month) => month.spend)).toEqual([2560, 1931, 1561, 1561, 1249, 1249]);
      expect(plan.months[2]?.expenses.some((line) => line.name === 'Conta curta')).toBe(false);
    });

    it('should accumulate 30% of each surplus into the reserve', () => {
      expect(plan.months[1]?.reserve).toEqual(470.7);
      expect(plan.months[1]?.accumulatedReserve).toEqual(752.7);
      expect(plan.summary.totalSpend).toEqual(10111);
      expect(plan.summary.monthlyIncome).toEqual(3500);
    });
  });

  describe('when the horizon goes beyond six months', () => {
    it('should keep projecting open-ended expenses', () => {
      const plan = calculatePlan({
        from: '2026-10',
        monthCount: 24,
        currentMonth: '2026-10',
        settings,
        sources,
        expenses: htmlExpenses,
      });
      expect(plan.months).toHaveLength(24);
      expect(plan.to).toEqual('2028-09');
      expect(plan.months[23]?.spend).toEqual(1249);
    });
  });
});

describe('when an income is one-time', () => {
  it('should count only in its month and stay out of the recurring sources', () => {
    const bonus: IIncomeSource = { id: 'decimo', name: '13º salário', payDay: 20, amount: 1000, month: '2026-11' };
    const plan = calculatePlan({
      from: '2026-10',
      monthCount: 3,
      currentMonth: '2026-10',
      settings,
      sources: [...sources, bonus],
      expenses: htmlExpenses,
    });
    expect(plan.months.map((month) => month.income)).toEqual([3500, 4500, 3500]);
    expect(plan.months[1]?.sources).toHaveLength(2);
    expect(plan.incomeSources).toEqual(sources);
    expect(plan.summary.monthlyIncome).toEqual(3500);
  });
});

describe('defaultSourceForDueDay', () => {
  it('should pick the first income before day 20 and the second from day 20 on', () => {
    expect(defaultSourceForDueDay(15, sources)?.id).toEqual('renda-a');
    expect(defaultSourceForDueDay(20, sources)?.id).toEqual('renda-b');
    expect(defaultSourceForDueDay(2, sources)?.id).toEqual('renda-b');
    expect(defaultSourceForDueDay(null, sources)?.id).toEqual('renda-b');
  });
});

describe('month helpers', () => {
  it('should roll months across years', () => {
    expect(addMonths('2026-10', 3)).toEqual('2027-01');
    expect(addMonths('2027-01', -1)).toEqual('2026-12');
  });

  it('should use the Sao Paulo month', () => {
    expect(currentMonthKey(new Date('2026-11-01T02:00:00Z'))).toEqual('2026-10');
  });
});
