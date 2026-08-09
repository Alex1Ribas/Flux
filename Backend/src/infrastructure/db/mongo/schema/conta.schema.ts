import { Schema } from 'mongoose';
import {
  EStatusConta,
  ETipoConta,
} from '../../../../domain/conta/entity/interfaces/conta.interface.js';
import type { IMConta } from '../models/conta.model.js';

export const contaSchema = new Schema<IMConta>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tipo: {
      type: String,
      required: true,
      enum: Object.values(ETipoConta),
    },
    descricao: { type: String, required: true, trim: true },
    valor: { type: Number, required: true, min: 0 },
    vencimento: { type: String, required: true, trim: true },
    caixaId: { type: Schema.Types.ObjectId, ref: 'Caixa', required: true },
    status: {
      type: String,
      required: true,
      enum: Object.values(EStatusConta),
      default: EStatusConta.ABERTA,
    },
    liquidadoEm: { type: String, trim: true },
    lancamentoId: { type: Schema.Types.ObjectId, ref: 'Lancamento' },
  },
  { timestamps: true },
);

contaSchema.index({ user: 1, status: 1, vencimento: 1 });
contaSchema.index({ user: 1, tipo: 1, status: 1 });
