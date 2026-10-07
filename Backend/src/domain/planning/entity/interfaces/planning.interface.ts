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
  month: string | null;
}

export interface IExpenseMonthOverride {
  month: string;
  amount?: number;
  sourceId?: string;
}

export interface IExpense {
  id: string;
  name: string;
  dueDay: number | null;
  dueNote: string;
  defaultAmount: number;
  defaultSourceId: string;
  startMonth: string;
  endMonth: string | null;
  monthOverrides: IExpenseMonthOverride[];
}

export interface IParamsCreatePlanningSettings {
  reserveRate: number;
  initialReserve: number;
}

export interface IParamsCreateIncomeSource {
  name: string;
  payDay: number;
  amount: number;
  month: string | null;
}

export interface IParamsCreateExpense {
  name: string;
  dueDay: number | null;
  dueNote: string;
  defaultAmount: number;
  defaultSourceId: string;
  startMonth: string;
  endMonth: string | null;
  monthOverrides: IExpenseMonthOverride[];
}
