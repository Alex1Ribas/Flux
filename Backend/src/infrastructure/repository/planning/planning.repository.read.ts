import { Types } from 'mongoose';
import type {
  IExpense,
  IIncomeSource,
  IPlanningSettings,
} from '../../../domain/planning/entity/interfaces/planning.interface.js';
import type { IPlanningRepositoryRead } from '../../../domain/planning/repository/planning.repository.read.js';
import { MExpense } from '../../db/mongo/models/expense.model.js';
import { MIncomeSource } from '../../db/mongo/models/income-source.model.js';
import { toIExpense, toIIncomeSource, toIPlanningSettings } from './planning.mapper.js';
import { upsertPlanningSettings } from './planning-settings.singleton.js';

export class PlanningRepositoryRead implements IPlanningRepositoryRead {
  async findSettings(userId: string): Promise<IPlanningSettings> {
    return toIPlanningSettings(await upsertPlanningSettings(userId));
  }

  async listIncomeSources(userId: string): Promise<IIncomeSource[]> {
    const documents = await MIncomeSource.find({ user: new Types.ObjectId(userId) })
      .sort({ payDay: 1, _id: 1 })
      .lean();
    return documents.map(toIIncomeSource);
  }

  async listExpenses(userId: string): Promise<IExpense[]> {
    const documents = await MExpense.find({ user: new Types.ObjectId(userId) })
      .sort({ _id: 1 })
      .lean();
    return documents.map(toIExpense);
  }

  async findExpenseById(userId: string, id: string): Promise<IExpense | null> {
    const document = await MExpense.findOne({ _id: id, user: new Types.ObjectId(userId) }).lean();
    return document ? toIExpense(document) : null;
  }
}
