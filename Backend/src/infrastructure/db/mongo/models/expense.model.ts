import { model, Types } from 'mongoose';
import type {
  IExpense,
  IExpenseMonthOverride,
} from '../../../../domain/planning/entity/interfaces/planning.interface.js';
import { expenseSchema } from '../schema/expense.schema.js';

export interface IMExpenseMonthOverride
  extends Omit<IExpenseMonthOverride, 'sourceId'> {
  sourceId?: Types.ObjectId;
}

export interface IMExpense
  extends Omit<IExpense, 'id' | 'defaultSourceId' | 'monthOverrides'> {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  defaultSourceId: Types.ObjectId;
  monthOverrides: IMExpenseMonthOverride[];
}

export const MExpense = model<IMExpense>('Expense', expenseSchema);
