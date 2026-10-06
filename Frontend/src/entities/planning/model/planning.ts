export enum EPlanMonthStatus {
  PAST = 'past',
  CURRENT = 'current',
  PROJECTION = 'projection',
}

export interface IPlanningSettings {
  id: string;
  reserveRate: number;
  initialReserve: number;
}

export interface IIncomeSource {
  id: string;
  name: string;
  payDay: number;
  amount: number;
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
