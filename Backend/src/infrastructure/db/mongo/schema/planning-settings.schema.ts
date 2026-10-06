import { Schema } from 'mongoose';
import type { IMPlanningSettings } from '../models/planning-settings.model.js';

export const planningSettingsSchema = new Schema<IMPlanningSettings>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    reserveRate: { type: Number, required: true, min: 0, max: 100 },
    initialReserve: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);
