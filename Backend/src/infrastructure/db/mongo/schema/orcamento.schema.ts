import { Schema } from 'mongoose';
import type { IMOrcamento } from '../models/orcamento.model.js';

export const orcamentoSchema = new Schema<IMOrcamento>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    caixa: { type: Schema.Types.ObjectId, ref: 'Caixa', required: true },
    competencia: { type: String, required: true, trim: true },
    valor: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

orcamentoSchema.index(
  { user: 1, caixa: 1, competencia: 1 },
  { unique: true },
);
