import { model, Types } from 'mongoose';
import type {
  IDistribuicaoLancamento,
  ILancamento,
} from '../../../../domain/lancamento/entity/interfaces/lancamento.interface.js';
import { lancamentoSchema } from '../schema/lancamento.schema.js';

export interface IMDistribuicaoLancamento
  extends Omit<IDistribuicaoLancamento, 'caixa'> {
  caixa: Types.ObjectId;
}

export interface IMLancamento
  extends Omit<
    ILancamento,
    | '_id'
    | 'user'
    | 'caixaOrigem'
    | 'caixaCompensacao'
    | 'distribuicao'
  > {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  caixaOrigem?: Types.ObjectId;
  caixaCompensacao?: Types.ObjectId;
  distribuicao?: IMDistribuicaoLancamento[];
}

export const MLancamento = model<IMLancamento>(
  'Lancamento',
  lancamentoSchema,
);
