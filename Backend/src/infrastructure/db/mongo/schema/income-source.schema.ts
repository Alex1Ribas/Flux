import { Schema } from 'mongoose';
import type { IMIncomeSource } from '../models/income-source.model.js';

export const incomeSourceSchema = new Schema<IMIncomeSource>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    payDay: { type: Number, required: true, min: 1, max: 31 },
    amount: { type: Number, required: true, min: 0 },
    month: { type: String, match: /^\d{4}-(0[1-9]|1[0-2])$/, default: null },
  },
  { timestamps: true },
);
