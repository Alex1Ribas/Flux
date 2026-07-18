import { Schema } from 'mongoose';
import { EUserRole } from '../../../../domain/user/entity/interfaces/user.interface.js';
import type { IMUser } from '../models/user.model.js';

export const userSchema = new Schema<IMUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: Object.values(EUserRole),
      default: EUserRole.USER,
    },
  },
  { timestamps: true },
);
