import type {
  IExpense,
  IIncomeSource,
  IPlanningSettings,
} from '../entity/interfaces/planning.interface.js';
import {
  EPlanMonthStatus,
  type IPlan,
  type IPlanExpenseLine,
  type IPlanMonth,
  type IPlanSummary,
} from '../entity/interfaces/planning.service.interface.js';
import { addMonths, isMonthWithin } from './month.helper.js';

export const MAX_PLAN_MONTHS = 60;
export const DEFAULT_PLAN_MONTHS = 6;

export function percentage(value: number, total: number): number {
  if (total <= 0) {
    return 0;
  }
  return (value / total) * 100;
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function defaultSourceForDueDay(
  dueDay: number | null,
  sources: IIncomeSource[],
): IIncomeSource | null {
  if (sources.length === 0) {
    return null;
  }
  const byPayDay = [...sources].sort((left, right) => left.payDay - right.payDay);
  const latest = byPayDay[byPayDay.length - 1] ?? null;
  if (dueDay === null) {
    return latest;
  }
  const paidBefore = byPayDay.filter((source) => source.payDay <= dueDay);
  return paidBefore[paidBefore.length - 1] ?? latest;
}

function monthStatus(monthKey: string, currentMonth: string): EPlanMonthStatus {
  if (monthKey === currentMonth) {
    return EPlanMonthStatus.CURRENT;
  }
  if (monthKey < currentMonth) {
    return EPlanMonthStatus.PAST;
  }
  return EPlanMonthStatus.PROJECTION;
}

function resolveExpenseLine(expense: IExpense, monthKey: string) {
  const override = expense.monthOverrides.find((item) => item.month === monthKey);
  const amount = override?.amount ?? expense.defaultAmount;
  const sourceId = override?.sourceId ?? expense.defaultSourceId;
  const isAdjusted = override?.amount !== undefined || override?.sourceId !== undefined;
  return { amount, sourceId, isAdjusted };
}

export function calculateMonth(
  monthKey: string,
  currentMonth: string,
  settings: IPlanningSettings,
  sources: IIncomeSource[],
  expenses: IExpense[],
  reserveBefore: number,
): IPlanMonth {
  const resolved = expenses
    .filter((expense) => isMonthWithin(monthKey, expense.startMonth, expense.endMonth))
    .map((expense) => ({ expense, ...resolveExpenseLine(expense, monthKey) }));

  const income = sources.reduce((sum, source) => sum + source.amount, 0);
  const spend = resolved.reduce((sum, line) => sum + line.amount, 0);
  const surplus = income - spend;
  const reserve = roundMoney((Math.max(0, surplus) * settings.reserveRate) / 100);
  const free = roundMoney(surplus - reserve);

  const sourceBreakdown = sources.map((source) => {
    const sourceSpend = resolved
      .filter((line) => line.sourceId === source.id)
      .reduce((sum, line) => sum + line.amount, 0);
    return {
      sourceId: source.id,
      name: source.name,
      income: source.amount,
      spend: sourceSpend,
      remaining: source.amount - sourceSpend,
      commitment: percentage(sourceSpend, source.amount),
    };
  });

  const expenseLines: IPlanExpenseLine[] = resolved.map((line) => {
    const sourceIncome = sources.find((source) => source.id === line.sourceId)?.amount ?? 0;
    return {
      expenseId: line.expense.id,
      name: line.expense.name,
      dueDay: line.expense.dueDay,
      dueNote: line.expense.dueNote,
      amount: line.amount,
      sourceId: line.sourceId,
      isAdjusted: line.isAdjusted,
      shareOfSpend: percentage(line.amount, spend),
      shareOfIncome: percentage(line.amount, income),
      shareOfSource: percentage(line.amount, sourceIncome),
    };
  });

  return {
    month: monthKey,
    status: monthStatus(monthKey, currentMonth),
    income,
    spend,
    surplus,
    reserve,
    free,
    accumulatedReserve: roundMoney(reserveBefore + reserve),
    commitment: percentage(spend, income),
    sources: sourceBreakdown,
    expenses: expenseLines,
  };
}

export function calculateSummary(
  months: IPlanMonth[],
  initialReserve: number,
): IPlanSummary {
  const total = (field: 'income' | 'spend' | 'reserve' | 'free') =>
    months.reduce((sum, month) => sum + month[field], 0);
  const totalIncome = total('income');
  const totalSpend = total('spend');

  return {
    monthlyIncome: months[0]?.income ?? 0,
    totalSpend,
    commitment: percentage(totalSpend, totalIncome),
    projectedReserve: roundMoney(initialReserve + total('reserve')),
    totalFree: roundMoney(total('free')),
  };
}

export interface IParamsCalculatePlan {
  from: string;
  monthCount: number;
  currentMonth: string;
  settings: IPlanningSettings;
  sources: IIncomeSource[];
  expenses: IExpense[];
}

export function calculatePlan({
  from,
  monthCount,
  currentMonth,
  settings,
  sources,
  expenses,
}: IParamsCalculatePlan): IPlan {
  const months: IPlanMonth[] = [];
  let reserveBefore = settings.initialReserve;

  for (let index = 0; index < monthCount; index += 1) {
    const month = calculateMonth(
      addMonths(from, index),
      currentMonth,
      settings,
      sources,
      expenses,
      reserveBefore,
    );
    reserveBefore = month.accumulatedReserve;
    months.push(month);
  }

  return {
    from,
    to: addMonths(from, monthCount - 1),
    currentMonth,
    settings,
    incomeSources: sources,
    summary: calculateSummary(months, settings.initialReserve),
    months,
  };
}
