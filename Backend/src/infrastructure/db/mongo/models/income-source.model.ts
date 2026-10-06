import { model, Types } from 'mongoose';
import type { IIncomeSource } from '../../../../domain/planning/entity/interfaces/planning.interface.js';
import { incomeSourceSchema } from '../schema/income-source.schema.js';

export interface IMIncomeSource extends Omit<IIncomeSource, 'id'> {
  _id: Types.ObjectId;
  user: Types.ObjectId;
}

export const MIncomeSource = model<IMIncomeSource>('IncomeSource', incomeSourceSchema);
