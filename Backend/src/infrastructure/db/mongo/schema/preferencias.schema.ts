import { Schema } from 'mongoose';
import type { IMPreferencias } from '../models/preferencias.model.js';

const limitesRiscoSchema = new Schema(
  {
    saudavel: { type: Number, required: true },
    atencao: { type: Number, required: true },
  },
  { _id: false },
);

export const preferenciasSchema = new Schema<IMPreferencias>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    tiposEntrada: { type: [String], required: true, default: [] },
    tiposSaida: { type: [String], required: true, default: [] },
    limitesRisco: {
      global: { type: limitesRiscoSchema, required: true },
      porCaixa: { type: Schema.Types.Mixed, required: true, default: {} },
    },
  },
  { timestamps: true },
);
