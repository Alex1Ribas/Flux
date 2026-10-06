import { Types } from 'mongoose';
import {
  MPlanningSettings,
  type IMPlanningSettings,
} from '../../db/mongo/models/planning-settings.model.js';

export const PLANNING_SETTINGS_DEFAULTS = {
  reserveRate: 30,
  initialReserve: 0,
};

export async function upsertPlanningSettings(
  userId: string,
  fields: Partial<Pick<IMPlanningSettings, 'reserveRate' | 'initialReserve'>> = {},
): Promise<IMPlanningSettings> {
  const user = new Types.ObjectId(userId);
  const defaults: Record<string, unknown> = { user, ...PLANNING_SETTINGS_DEFAULTS };
  for (const field of Object.keys(fields)) {
    delete defaults[field];
  }

  const update: Record<string, unknown> = { $setOnInsert: defaults };
  if (Object.keys(fields).length > 0) {
    update.$set = fields;
  }

  return MPlanningSettings.findOneAndUpdate({ user }, update, {
    upsert: true,
    new: true,
    runValidators: true,
  })
    .lean()
    .orFail();
}
