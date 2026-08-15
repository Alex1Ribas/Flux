import { Schema } from 'mongoose';
import { ETipoCaixa } from '../../../../domain/caixa/entity/interfaces/caixa.interface.js';
import type { IMCaixa } from '../models/caixa.model.js';

export const caixaSchema = new Schema<IMCaixa>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    nome: { type: String, required: true, trim: true },
    saldo: { type: Number, required: true, default: 0 },
    comprometido: { type: Number, required: true, default: 0, min: 0 },
    tipo: {
      type: String,
      required: true,
      enum: Object.values(ETipoCaixa),
      default: ETipoCaixa.ORCAMENTO,
    },
    meta: { type: Number, min: 0 },
    aporteMensal: { type: Number, min: 0 },
    orcamentoMensal: { type: Number, min: 0 },
  },
  { timestamps: true },
);

caixaSchema.index({ user: 1, nome: 1 }, { unique: true });
