import type {
  IExpense,
  IIncomeSource,
  IParamsCreateExpense,
  IParamsCreateIncomeSource,
  IPlanningSettings,
} from '../entity/interfaces/planning.interface.js';
import type {
  IParamsUpdateExpense,
  IParamsUpdatePlanningSettingsInput,
  TExpenseMonthPatch,
} from '../entity/interfaces/planning.service.interface.js';

export interface IPlanningRepositoryWrite {
  updateSettings(
    userId: string,
    params: IParamsUpdatePlanningSettingsInput,
  ): Promise<IPlanningSettings>;
  createIncomeSource(userId: string, params: IParamsCreateIncomeSource): Promise<IIncomeSource>;
  updateIncomeSourceAmountById(
    userId: string,
    id: string,
    amount: number,
  ): Promise<IIncomeSource | null>;
  createExpense(userId: string, params: IParamsCreateExpense): Promise<IExpense>;
  updateExpenseById(
    userId: string,
    id: string,
    params: IParamsUpdateExpense,
  ): Promise<IExpense | null>;
  setExpenseMonthById(
    userId: string,
    id: string,
    month: string,
    patch: TExpenseMonthPatch,
  ): Promise<IExpense | null>;
}
