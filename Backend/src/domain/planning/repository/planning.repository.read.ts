import type {
  IExpense,
  IIncomeSource,
  IPlanningSettings,
} from '../entity/interfaces/planning.interface.js';

export interface IPlanningRepositoryRead {
  findSettings(userId: string): Promise<IPlanningSettings>;
  listIncomeSources(userId: string): Promise<IIncomeSource[]>;
  listExpenses(userId: string): Promise<IExpense[]>;
  findExpenseById(userId: string, id: string): Promise<IExpense | null>;
}
