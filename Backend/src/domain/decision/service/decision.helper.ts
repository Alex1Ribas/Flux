import type { IPlan } from '../../planning/entity/interfaces/planning.service.interface.js';
import {
  EVerdictKind,
  type IDecisionContext,
  type IVerdict,
  type IVerdictDetail,
} from '../entity/interfaces/decision.service.interface.js';

export const PROJECTION_MONTHS = 6;
export const CARE_THRESHOLD = 0.5;

export function daysUntil(today: number, target: number): number {
  if (today < target) {
    return target - today;
  }
  return 31 - today + target;
}

export function padDay(day: number): string {
  return String(day).padStart(2, '0');
}

export function toNonNegative(value: number | undefined): number {
  return Math.max(0, Number(value) || 0);
}

export function resolveAvailable(
  inputAvailable: number | undefined,
  plannedFree: number,
): number {
  if (inputAvailable === undefined || inputAvailable === null) {
    return Math.max(0, plannedFree);
  }
  return toNonNegative(inputAvailable);
}

export function classifyAgainstFree(expense: number, available: number): EVerdictKind {
  if (expense > available) {
    return EVerdictKind.BAD;
  }
  if (expense >= available * CARE_THRESHOLD) {
    return EVerdictKind.WARN;
  }
  return EVerdictKind.OK;
}

export function buildVerdict(
  kind: EVerdictKind,
  title: string,
  impact: string,
  message: string,
  details: IVerdictDetail[],
): IVerdict {
  return { kind, title, impact, message, details };
}

function nextDayAfter(today: number, days: number[]): number {
  const sorted = [...new Set(days)].sort((left, right) => left - right);
  if (sorted.length === 0) {
    return 1;
  }
  return sorted.find((day) => day > today) ?? sorted[0] ?? 1;
}

export function buildDecisionContext(plan: IPlan, today: number): IDecisionContext {
  const month = plan.months[0];
  const billDays = (month?.expenses ?? [])
    .filter((expense) => expense.amount > 0 && expense.dueDay !== null)
    .map((expense) => expense.dueDay as number);

  return {
    income: month?.income ?? 0,
    monthlyReserve: month?.reserve ?? 0,
    plannedFree: month?.free ?? 0,
    nextIncomeDay: nextDayAfter(today, plan.incomeSources.map((source) => source.payDay)),
    nextBillDay: nextDayAfter(today, billDays),
    minCushion: 0,
    reserveBalance: plan.settings.initialReserve,
  };
}
