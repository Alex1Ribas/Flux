import { jest } from '@jest/globals';
import { DomainError } from '../../../../domain/common/errors/DomainError.js';
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode.js';
import type { IExpense } from '../../../../domain/planning/entity/interfaces/planning.interface.js';
import type { IPlanningRepositoryRead } from '../../../../domain/planning/repository/planning.repository.read.js';
import type { IPlanningRepositoryWrite } from '../../../../domain/planning/repository/planning.repository.write.js';
import { PlanningService } from '../../../../domain/planning/service/planning.service.js';

const expense: IExpense = {
  id: 'conta-curta',
  name: 'Conta curta',
  dueDay: 20,
  dueNote: '',
  defaultAmount: 188,
  defaultSourceId: 'renda-b',
  startMonth: '2026-10',
  endMonth: '2026-11',
  monthOverrides: [],
};

function buildService() {
  const planningRepositoryRead: IPlanningRepositoryRead = {
    findSettings: jest.fn(async () => ({ id: 's', reserveRate: 30, initialReserve: 0 })),
    listIncomeSources: jest.fn(async () => [
      { id: 'renda-a', name: 'Renda A', payDay: 7, amount: 1000 },
      { id: 'renda-b', name: 'Renda B', payDay: 20, amount: 2500 },
    ]),
    listExpenses: jest.fn(async () => [expense]),
    findExpenseById: jest.fn(async () => expense),
  };
  const planningRepositoryWrite: IPlanningRepositoryWrite = {
    updateSettings: jest.fn(async () => ({ id: 's', reserveRate: 30, initialReserve: 0 })),
    createIncomeSource: jest.fn(async () => ({ id: 'nova', name: 'Freela', payDay: 10, amount: 500 })),
    updateIncomeSourceAmountById: jest.fn(async () => null),
    createExpense: jest.fn(async () => expense),
    updateExpenseById: jest.fn(async () => expense),
    setExpenseMonthById: jest.fn(async () => expense),
  };
  const service = new PlanningService({
    planningRepositoryRead,
    planningRepositoryWrite,
    now: () => new Date('2026-10-06T12:00:00Z'),
  });
  return { service, planningRepositoryWrite };
}

describe('PlanningService', () => {
  describe('when creating an income source without a valid pay day', () => {
    it('should reject', async () => {
      const { service } = buildService();
      await expect(service.createIncomeSource('user-1', { name: 'Freela', payDay: 0, amount: 500 })).rejects.toEqual(
        new DomainError(EErrorCode.VALIDATION_ERROR, 422),
      );
    });
  });

  describe('when no period is informed', () => {
    it('should start at the current month with six months', async () => {
      const { service } = buildService();
      const plan = await service.getPlan('user-1', {});
      expect(plan.from).toEqual('2026-10');
      expect(plan.months).toHaveLength(6);
    });
  });

  describe('when the horizon is invalid', () => {
    it.each([0, 61, 2.5])('should reject %p months', async (months) => {
      const { service } = buildService();
      await expect(service.getPlan('user-1', { months })).rejects.toEqual(
        new DomainError(EErrorCode.VALIDATION_ERROR, 422),
      );
    });
  });

  describe('when creating an installment expense', () => {
    it('should derive the end month and the default source from the due day', async () => {
      const { service, planningRepositoryWrite } = buildService();
      await service.createExpense('user-1', { name: ' Tênis ', amount: 100, dueDay: 15, installments: 3 });
      expect(planningRepositoryWrite.createExpense).toHaveBeenCalledWith('user-1', {
        name: 'Tênis',
        dueDay: 15,
        dueNote: '',
        defaultAmount: 100,
        defaultSourceId: 'renda-a',
        startMonth: '2026-10',
        endMonth: '2026-12',
        monthOverrides: [],
      });
    });
  });

  describe('when adjusting a month outside the expense period', () => {
    it('should throw EXPENSE_MONTH_OUT_OF_RANGE', async () => {
      const { service } = buildService();
      await expect(
        service.setExpenseMonth('user-1', { id: 'conta-curta', month: '2027-01', amount: 50 }),
      ).rejects.toEqual(new DomainError(EErrorCode.EXPENSE_MONTH_OUT_OF_RANGE, 422));
    });
  });

  describe('when adjusting a month with an unknown source', () => {
    it('should throw INCOME_SOURCE_NOT_FOUND', async () => {
      const { service } = buildService();
      await expect(
        service.setExpenseMonth('user-1', { id: 'conta-curta', month: '2026-10', sourceId: 'outra' }),
      ).rejects.toEqual(new DomainError(EErrorCode.INCOME_SOURCE_NOT_FOUND, 404));
    });
  });

  describe('when the reserve rate is above 100%', () => {
    it('should reject', async () => {
      const { service } = buildService();
      await expect(service.updateSettings('user-1', { reserveRate: 120 })).rejects.toEqual(
        new DomainError(EErrorCode.VALIDATION_ERROR, 422),
      );
    });
  });
});
