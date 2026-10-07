import { DomainError } from '../../common/errors/DomainError.js';
import { EErrorCode } from '../../common/errors/enums/EErrorCode.js';
import type {
  IExpense,
  IIncomeSource,
  IPlanningSettings,
} from '../entity/interfaces/planning.interface.js';
import type {
  IParamsCreateExpenseInput,
  IParamsCreateIncomeSourceInput,
  IParamsGetPlanInput,
  IParamsSetExpenseMonthInput,
  IParamsUpdateExpense,
  IParamsUpdateExpenseInput,
  IParamsUpdateIncomeSourceInput,
  IParamsUpdatePlanningSettingsInput,
  IPlan,
  IPlanningService,
  TExpenseMonthPatch,
} from '../entity/interfaces/planning.service.interface.js';
import type { IPlanningRepositoryRead } from '../repository/planning.repository.read.js';
import type { IPlanningRepositoryWrite } from '../repository/planning.repository.write.js';
import {
  addMonths,
  currentMonthKey,
  isMonthKey,
  isMonthWithin,
} from './month.helper.js';
import {
  calculatePlan,
  DEFAULT_PLAN_MONTHS,
  defaultSourceForDueDay,
  MAX_PLAN_MONTHS,
} from './planning.helper.js';

export interface IParamsPlanningService {
  planningRepositoryRead: IPlanningRepositoryRead;
  planningRepositoryWrite: IPlanningRepositoryWrite;
  now?: () => Date;
}

function validationError(): DomainError {
  return new DomainError(EErrorCode.VALIDATION_ERROR, 422);
}

function parseNonNegativeAmount(value: number | undefined): number {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) {
    throw validationError();
  }
  return Math.round(amount * 100) / 100;
}

function parseDueDay(value: number | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (!Number.isInteger(value) || value < 1 || value > 31) {
    throw validationError();
  }
  return value;
}

function parseMonthKey(value: string | undefined, fallback: string): string {
  if (value === undefined) {
    return fallback;
  }
  if (!isMonthKey(value)) {
    throw validationError();
  }
  return value;
}

export class PlanningService implements IPlanningService {
  private readonly planningRepositoryRead: IPlanningRepositoryRead;
  private readonly planningRepositoryWrite: IPlanningRepositoryWrite;
  private readonly now: () => Date;

  constructor({ planningRepositoryRead, planningRepositoryWrite, now }: IParamsPlanningService) {
    this.planningRepositoryRead = planningRepositoryRead;
    this.planningRepositoryWrite = planningRepositoryWrite;
    this.now = now ?? (() => new Date());
  }

  async getPlan(userId: string, params: IParamsGetPlanInput): Promise<IPlan> {
    const currentMonth = currentMonthKey(this.now());
    const from = parseMonthKey(params.from, currentMonth);
    const monthCount = params.months ?? DEFAULT_PLAN_MONTHS;
    if (!Number.isInteger(monthCount) || monthCount < 1 || monthCount > MAX_PLAN_MONTHS) {
      throw validationError();
    }

    const [settings, sources, expenses] = await Promise.all([
      this.planningRepositoryRead.findSettings(userId),
      this.planningRepositoryRead.listIncomeSources(userId),
      this.planningRepositoryRead.listExpenses(userId),
    ]);

    return calculatePlan({ from, monthCount, currentMonth, settings, sources, expenses });
  }

  async updateSettings(
    userId: string,
    params: IParamsUpdatePlanningSettingsInput,
  ): Promise<IPlanningSettings> {
    const update: IParamsUpdatePlanningSettingsInput = {};
    if (params.reserveRate !== undefined) {
      const reserveRate = Number(params.reserveRate);
      if (!Number.isFinite(reserveRate) || reserveRate < 0 || reserveRate > 100) {
        throw validationError();
      }
      update.reserveRate = reserveRate;
    }
    if (params.initialReserve !== undefined) {
      update.initialReserve = parseNonNegativeAmount(params.initialReserve);
    }
    if (Object.keys(update).length === 0) {
      throw validationError();
    }
    return this.planningRepositoryWrite.updateSettings(userId, update);
  }

  async createIncomeSource(
    userId: string,
    params: IParamsCreateIncomeSourceInput,
  ): Promise<IIncomeSource> {
    const name = params.name?.trim();
    if (!name) {
      throw validationError();
    }
    const payDay = parseDueDay(params.payDay);
    if (payDay === null) {
      throw validationError();
    }
    const amount = parseNonNegativeAmount(params.amount);
    return this.planningRepositoryWrite.createIncomeSource(userId, { name, payDay, amount });
  }

  async updateIncomeSource(
    userId: string,
    params: IParamsUpdateIncomeSourceInput,
  ): Promise<IIncomeSource> {
    const amount = parseNonNegativeAmount(params.amount);
    const source = await this.planningRepositoryWrite.updateIncomeSourceAmountById(
      userId,
      params.id,
      amount,
    );
    if (!source) {
      throw new DomainError(EErrorCode.INCOME_SOURCE_NOT_FOUND, 404);
    }
    return source;
  }

  async createExpense(userId: string, params: IParamsCreateExpenseInput): Promise<void> {
    const name = params.name?.trim();
    if (!name) {
      throw validationError();
    }
    const defaultAmount = parseNonNegativeAmount(params.amount);
    const dueDay = parseDueDay(params.dueDay);
    const currentMonth = currentMonthKey(this.now());
    const startMonth = parseMonthKey(params.startMonth, currentMonth);
    if (startMonth < currentMonth) {
      throw validationError();
    }

    let endMonth: string | null = null;
    if (params.installments !== undefined) {
      if (!Number.isInteger(params.installments) || params.installments < 1) {
        throw validationError();
      }
      endMonth = addMonths(startMonth, params.installments - 1);
    }

    const sources = await this.planningRepositoryRead.listIncomeSources(userId);
    const defaultSourceId = this.resolveSourceId(params.sourceId, dueDay, sources);

    await this.planningRepositoryWrite.createExpense(userId, {
      name,
      dueDay,
      dueNote: params.dueNote?.trim() ?? '',
      defaultAmount,
      defaultSourceId,
      startMonth,
      endMonth,
      monthOverrides: [],
    });
  }

  async updateExpense(userId: string, params: IParamsUpdateExpenseInput): Promise<void> {
    const expense = await this.findExpenseOrFail(userId, params.id);
    const update: IParamsUpdateExpense = {};

    if (params.name !== undefined) {
      const name = params.name.trim();
      if (!name) {
        throw validationError();
      }
      update.name = name;
    }
    if (params.amount !== undefined) {
      update.defaultAmount = parseNonNegativeAmount(params.amount);
    }
    if (params.dueDay !== undefined) {
      update.dueDay = parseDueDay(params.dueDay);
    }
    if (params.dueNote !== undefined) {
      update.dueNote = params.dueNote.trim();
    }
    if (params.sourceId !== undefined) {
      const sources = await this.planningRepositoryRead.listIncomeSources(userId);
      update.defaultSourceId = this.resolveSourceId(params.sourceId, null, sources);
    }
    if (params.endMonth !== undefined) {
      if (params.endMonth !== null && (!isMonthKey(params.endMonth) || params.endMonth < expense.startMonth)) {
        throw validationError();
      }
      update.endMonth = params.endMonth;
    }
    if (params.resetMonthOverrides === true) {
      update.monthOverrides = [];
    }

    await this.planningRepositoryWrite.updateExpenseById(userId, expense.id, update);
  }

  async setExpenseMonth(userId: string, params: IParamsSetExpenseMonthInput): Promise<void> {
    if (!isMonthKey(params.month)) {
      throw validationError();
    }
    const expense = await this.findExpenseOrFail(userId, params.id);
    if (!isMonthWithin(params.month, expense.startMonth, expense.endMonth)) {
      throw new DomainError(EErrorCode.EXPENSE_MONTH_OUT_OF_RANGE, 422);
    }

    const patch: TExpenseMonthPatch = {};
    if (params.amount !== undefined) {
      patch.amount = parseNonNegativeAmount(params.amount);
    }
    if (params.sourceId !== undefined) {
      const sources = await this.planningRepositoryRead.listIncomeSources(userId);
      patch.sourceId = this.resolveSourceId(params.sourceId, null, sources);
    }
    if (Object.keys(patch).length === 0) {
      throw validationError();
    }

    await this.planningRepositoryWrite.setExpenseMonthById(
      userId,
      expense.id,
      params.month,
      patch,
    );
  }

  private resolveSourceId(
    sourceId: string | undefined,
    dueDay: number | null,
    sources: IIncomeSource[],
  ): string {
    if (sourceId !== undefined) {
      if (!sources.some((source) => source.id === sourceId)) {
        throw new DomainError(EErrorCode.INCOME_SOURCE_NOT_FOUND, 404);
      }
      return sourceId;
    }
    const fallback = defaultSourceForDueDay(dueDay, sources);
    if (!fallback) {
      throw new DomainError(EErrorCode.INCOME_SOURCE_NOT_FOUND, 404);
    }
    return fallback.id;
  }

  private async findExpenseOrFail(userId: string, id: string): Promise<IExpense> {
    const expense = await this.planningRepositoryRead.findExpenseById(userId, id);
    if (!expense) {
      throw new DomainError(EErrorCode.EXPENSE_NOT_FOUND, 404);
    }
    return expense;
  }
}
