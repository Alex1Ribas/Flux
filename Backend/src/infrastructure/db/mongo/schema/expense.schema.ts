import { Schema } from 'mongoose';
import type { IMExpense, IMExpenseMonthOverride } from '../models/expense.model.js';

const MONTH_KEY = /^\d{4}-(0[1-9]|1[0-2])$/;

const monthOverrideSchema = new Schema<IMExpenseMonthOverride>(
  {
    month: { type: String, required: true, match: MONTH_KEY },
    amount: { type: Number, min: 0 },
    sourceId: { type: Schema.Types.ObjectId, ref: 'IncomeSource' },
  },
  { _id: false },
);

export const expenseSchema = new Schema<IMExpense>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    dueDay: { type: Number, min: 1, max: 31, default: null },
    dueNote: { type: String, default: '', trim: true },
    defaultAmount: { type: Number, required: true, min: 0 },
    defaultSourceId: { type: Schema.Types.ObjectId, ref: 'IncomeSource', required: true },
    startMonth: { type: String, required: true, match: MONTH_KEY },
    endMonth: { type: String, default: null, match: MONTH_KEY },
    monthOverrides: { type: [monthOverrideSchema], default: [] },
  },
  { timestamps: true },
);
