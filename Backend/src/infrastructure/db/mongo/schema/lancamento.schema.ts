import { Schema } from 'mongoose';
import {
  EHorizonteLancamento,
  ETipoLancamento,
} from '../../../../domain/lancamento/entity/interfaces/lancamento.interface.js';
import type { IMLancamento } from '../models/lancamento.model.js';

const distribuicaoSchema = new Schema(
  {
    caixa: { type: Schema.Types.ObjectId, ref: 'Caixa', required: true },
    valor: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

export const lancamentoSchema = new Schema<IMLancamento>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tipo: {
      type: String,
      required: true,
      enum: Object.values(ETipoLancamento),
    },
    horizonte: {
      type: String,
      required: true,
      enum: Object.values(EHorizonteLancamento),
    },
    valor: { type: Number, required: true, min: 0 },
    descricao: { type: String, required: true, trim: true },
    competencia: { type: String, required: true, trim: true },
    observacao: { type: String, trim: true },
    caixaOrigem: { type: Schema.Types.ObjectId, ref: 'Caixa' },
    caixaCompensacao: { type: Schema.Types.ObjectId, ref: 'Caixa' },
    distribuicao: { type: [distribuicaoSchema], default: undefined },
    parcelaRef: { type: String, trim: true },
    parcelaNum: { type: Number },
    totalParcelas: { type: Number },
    recorrente: { type: Boolean, required: true, default: false },
    competenciaInicial: { type: String, trim: true },
    duracaoMeses: { type: Number, min: 1 },
    ativo: { type: Boolean },
    mesesAbatidos: { type: Number },
  },
  { timestamps: true },
);

lancamentoSchema.index({ user: 1, competencia: 1 });
lancamentoSchema.index({ user: 1, recorrente: 1, competencia: 1 });
lancamentoSchema.index({ caixaOrigem: 1 });
lancamentoSchema.index({ 'distribuicao.caixa': 1 });
