import { model, Types } from 'mongoose';
import type { IPlanningSettings } from '../../../../domain/planning/entity/interfaces/planning.interface.js';
import { planningSettingsSchema } from '../schema/planning-settings.schema.js';

export interface IMPlanningSettings extends Omit<IPlanningSettings, 'id'> {
  _id: Types.ObjectId;
  user: Types.ObjectId;
}

export const MPlanningSettings = model<IMPlanningSettings>(
  'PlanningSettings',
  planningSettingsSchema,
);
