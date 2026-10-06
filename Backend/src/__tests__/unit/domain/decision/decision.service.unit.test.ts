import { jest } from '@jest/globals';
import type {
  IPlan,
  IPlanningService,
} from '../../../../domain/planning/entity/interfaces/planning.service.interface.js';
import { EPlanMonthStatus } from '../../../../domain/planning/entity/interfaces/planning.service.interface.js';
import { EVerdictKind } from '../../../../domain/decision/entity/interfaces/decision.service.interface.js';
import { DecisionService } from '../../../../domain/decision/service/decision.service.js';
import { DomainError } from '../../../../domain/common/errors/DomainError.js';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode.js';

const plan: IPlan = {
  from: '2026-10',
  to: '2026-10',
  currentMonth: '2026-10',
  settings: { id: 's', reserveRate: 30, initialReserve: 3000 },
  incomeSources: [
    { id: 'renda-a', name: 'Renda A', payDay: 5, amount: 1000 },
    { id: 'renda-b', name: 'Renda B', payDay: 20, amount: 2500 },
  ],
  summary: { monthlyIncome: 3500, totalSpend: 1000, commitment: 28.6, projectedReserve: 3000, totalFree: 1350 },
  months: [
    {
      month: '2026-10',
      status: EPlanMonthStatus.CURRENT,
      income: 3500,
      spend: 1000,
      surplus: 2500,
      reserve: 1150,
      free: 1350,
      accumulatedReserve: 4150,
      commitment: 28.6,
      sources: [],
      expenses: [
        {
          expenseId: 'contas',
          name: 'Contas',
          dueDay: 20,
          dueNote: '',
          amount: 1000,
          sourceId: 'renda-b',
          isAdjusted: false,
          shareOfSpend: 100,
          shareOfIncome: 28.6,
          shareOfSource: 40,
        },
      ],
    },
  ],
};

const planningService = {
  getPlan: jest.fn(async () => plan),
} as unknown as IPlanningService;

const service = new DecisionService({
  planningService,
  now: () => new Date('2026-10-06T12:00:00Z'),
});

describe('DecisionService', () => {
  describe('when simulating a purchase today', () => {
    it('should approve an expense under 50% of free money', async () => {
      const verdict = await service.simulateDecision('user-1', { mode: 'hoje', day: 28, available: 1350, expense: 600 });
      expect(verdict.kind).toEqual(EVerdictKind.OK);
      expect(verdict.title).toEqual('Pode gastar');
    });

    it('should warn when the expense reaches 50% of free money', async () => {
      const verdict = await service.simulateDecision('user-1', { mode: 'hoje', day: 28, available: 1350, expense: 675 });
      expect(verdict.kind).toEqual(EVerdictKind.WARN);
      expect(verdict.title).toEqual('Pode gastar, mas com cuidado');
    });

    it('should reject an expense above free money', async () => {
      const verdict = await service.simulateDecision('user-1', { mode: 'hoje', day: 28, available: 100, expense: 200 });
      expect(verdict.kind).toEqual(EVerdictKind.BAD);
      expect(verdict.title).toEqual('Não recomendado');
    });

    it('should use planned free when available is omitted', async () => {
      const verdict = await service.simulateDecision('user-1', { mode: 'hoje', day: 10, expense: 100 });
      expect(verdict.kind).toEqual(EVerdictKind.OK);
      expect(verdict.details[0]?.value).toContain('1.350');
    });
  });

  describe('when simulating installments', () => {
    it('should approve R$ 600 in 6x within the six-month projection', async () => {
      const verdict = await service.simulateDecision('user-1', { mode: 'parcela', total: 600, installments: 6 });
      expect(verdict.kind).toEqual(EVerdictKind.OK);
      expect(verdict.details.filter((detail) => detail.label.startsWith('Mês'))).toHaveLength(6);
    });

    it('should reject installments that break a future month', async () => {
      const verdict = await service.simulateDecision('user-1', { mode: 'parcela', total: 9000, installments: 6 });
      expect(verdict.kind).toEqual(EVerdictKind.BAD);
    });
  });

  describe('when simulating rent above the sustainable ceiling', () => {
    it('should reject and mention reserve coverage without using it', async () => {
      const verdict = await service.simulateDecision('user-1', { mode: 'aluguel', rent: 2600, otherExpenses: 0 });
      expect(verdict.kind).toEqual(EVerdictKind.BAD);
      expect(verdict.message).toContain('não é plano automático');
    });
  });

  describe('when mode is invalid', () => {
    it('should throw VALIDATION_ERROR', async () => {
      await expect(service.simulateDecision('user-1', { mode: 'outro' })).rejects.toEqual(
        new DomainError(EErrorCode.VALIDATION_ERROR, 422),
      );
    });
  });
});
