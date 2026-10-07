import type {
  IExpenseMonthOverride,
  IIncomeSource,
  IPlanningSettings,
} from './planning.interface.js';

export enum EPlanMonthStatus {
  PAST = 'past',
  CURRENT = 'current',
  PROJECTION = 'projection',
}

export interface IPlanExpenseLine {
  expenseId: string;
  name: string;
  dueDay: number | null;
  dueNote: string;
  amount: number;
  sourceId: string;
  isAdjusted: boolean;
  shareOfSpend: number;
  shareOfIncome: number;
  shareOfSource: number;
}

export interface IPlanSourceBreakdown {
  sourceId: string;
  name: string;
  income: number;
  spend: number;
  remaining: number;
  commitment: number;
}

export interface IPlanMonth {
  month: string;
  status: EPlanMonthStatus;
  income: number;
  spend: number;
  surplus: number;
  reserve: number;
  free: number;
  accumulatedReserve: number;
  commitment: number;
  sources: IPlanSourceBreakdown[];
  expenses: IPlanExpenseLine[];
}

export interface IPlanSummary {
  monthlyIncome: number;
  totalSpend: number;
  commitment: number;
  projectedReserve: number;
  totalFree: number;
}

export interface IPlan {
  from: string;
  to: string;
  currentMonth: string;
  settings: IPlanningSettings;
  incomeSources: IIncomeSource[];
  summary: IPlanSummary;
  months: IPlanMonth[];
}

export interface IParamsGetPlanInput {
  from?: string;
  months?: number;
}

export interface IParamsUpdatePlanningSettingsInput {
  reserveRate?: number;
  initialReserve?: number;
}

export interface IParamsCreateIncomeSourceInput {
  name?: string;
  payDay?: number;
  amount?: number;
}

export interface IParamsUpdateIncomeSourceInput {
  id: string;
  amount?: number;
}

export interface IParamsCreateExpenseInput {
  name?: string;
  amount?: number;
  dueDay?: number | null;
  dueNote?: string;
  sourceId?: string;
  startMonth?: string;
  installments?: number;
}

export interface IParamsUpdateExpenseInput {
  id: string;
  name?: string;
  amount?: number;
  dueDay?: number | null;
  dueNote?: string;
  sourceId?: string;
  endMonth?: string | null;
  resetMonthOverrides?: boolean;
}

export interface IParamsUpdateExpense {
  name?: string;
  defaultAmount?: number;
  dueDay?: number | null;
  dueNote?: string;
  defaultSourceId?: string;
  endMonth?: string | null;
  monthOverrides?: IExpenseMonthOverride[];
}

export interface IParamsSetExpenseMonthInput {
  id: string;
  month: string;
  amount?: number;
  sourceId?: string;
}

export type TExpenseMonthPatch = Omit<IExpenseMonthOverride, 'month'>;

export interface IPlanningService {
  getPlan(userId: string, params: IParamsGetPlanInput): Promise<IPlan>;
  updateSettings(
    userId: string,
    params: IParamsUpdatePlanningSettingsInput,
  ): Promise<IPlanningSettings>;
  createIncomeSource(
    userId: string,
    params: IParamsCreateIncomeSourceInput,
  ): Promise<IIncomeSource>;
  updateIncomeSource(
    userId: string,
    params: IParamsUpdateIncomeSourceInput,
  ): Promise<IIncomeSource>;
  createExpense(userId: string, params: IParamsCreateExpenseInput): Promise<void>;
  updateExpense(userId: string, params: IParamsUpdateExpenseInput): Promise<void>;
  setExpenseMonth(userId: string, params: IParamsSetExpenseMonthInput): Promise<void>;
}
