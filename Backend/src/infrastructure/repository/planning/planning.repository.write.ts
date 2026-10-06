import { Types } from 'mongoose';
import type {
  IExpense,
  IIncomeSource,
  IParamsCreateExpense,
  IParamsCreateIncomeSource,
  IPlanningSettings,
} from '../../../domain/planning/entity/interfaces/planning.interface.js';
import type {
  IParamsUpdateExpense,
  IParamsUpdatePlanningSettingsInput,
  TExpenseMonthPatch,
} from '../../../domain/planning/entity/interfaces/planning.service.interface.js';
import type { IPlanningRepositoryWrite } from '../../../domain/planning/repository/planning.repository.write.js';
import { MExpense } from '../../db/mongo/models/expense.model.js';
import { MIncomeSource } from '../../db/mongo/models/income-source.model.js';
import { toIExpense, toIIncomeSource, toIPlanningSettings } from './planning.mapper.js';
import { upsertPlanningSettings } from './planning-settings.singleton.js';

function toObjectId(id: string): Types.ObjectId {
  return new Types.ObjectId(id);
}

export class PlanningRepositoryWrite implements IPlanningRepositoryWrite {
  async updateSettings(
    userId: string,
    params: IParamsUpdatePlanningSettingsInput,
  ): Promise<IPlanningSettings> {
    return toIPlanningSettings(await upsertPlanningSettings(userId, params));
  }

  async createIncomeSource(
    userId: string,
    params: IParamsCreateIncomeSource,
  ): Promise<IIncomeSource> {
    const document = await MIncomeSource.create({ ...params, user: toObjectId(userId) });
    return toIIncomeSource(document);
  }

  async updateIncomeSourceAmountById(
    userId: string,
    id: string,
    amount: number,
  ): Promise<IIncomeSource | null> {
    const document = await MIncomeSource.findOneAndUpdate(
      { _id: id, user: toObjectId(userId) },
      { $set: { amount } },
      { new: true, runValidators: true },
    ).lean();
    return document ? toIIncomeSource(document) : null;
  }

  async createExpense(userId: string, params: IParamsCreateExpense): Promise<IExpense> {
    const document = await MExpense.create({
      ...params,
      user: toObjectId(userId),
      defaultSourceId: toObjectId(params.defaultSourceId),
      monthOverrides: params.monthOverrides.map((override) => ({
        month: override.month,
        amount: override.amount,
        sourceId: override.sourceId ? toObjectId(override.sourceId) : undefined,
      })),
    });
    return toIExpense(document);
  }

  async updateExpenseById(
    userId: string,
    id: string,
    params: IParamsUpdateExpense,
  ): Promise<IExpense | null> {
    const update: Record<string, unknown> = { ...params };
    if (params.defaultSourceId !== undefined) {
      update.defaultSourceId = toObjectId(params.defaultSourceId);
    }
    const document = await MExpense.findOneAndUpdate(
      { _id: id, user: toObjectId(userId) },
      { $set: update },
      { new: true, runValidators: true },
    ).lean();
    return document ? toIExpense(document) : null;
  }

  async setExpenseMonthById(
    userId: string,
    id: string,
    month: string,
    patch: TExpenseMonthPatch,
  ): Promise<IExpense | null> {
    const owner = { _id: id, user: toObjectId(userId) };
    const fields: Record<string, unknown> = {};
    if (patch.amount !== undefined) {
      fields['monthOverrides.$.amount'] = patch.amount;
    }
    if (patch.sourceId !== undefined) {
      fields['monthOverrides.$.sourceId'] = toObjectId(patch.sourceId);
    }

    const updated = await MExpense.findOneAndUpdate(
      { ...owner, 'monthOverrides.month': month },
      { $set: fields },
      { new: true, runValidators: true },
    ).lean();
    if (updated) {
      return toIExpense(updated);
    }

    const created = await MExpense.findOneAndUpdate(
      { ...owner, 'monthOverrides.month': { $ne: month } },
      {
        $push: {
          monthOverrides: {
            month,
            amount: patch.amount,
            sourceId: patch.sourceId ? toObjectId(patch.sourceId) : undefined,
          },
        },
      },
      { new: true, runValidators: true },
    ).lean();
    return created ? toIExpense(created) : null;
  }
}
