import { model, Types } from 'mongoose';
import type { IOrcamento } from '../../../../domain/orcamento/entity/interfaces/orcamento.interface.js';
import { orcamentoSchema } from '../schema/orcamento.schema.js';

export interface IMOrcamento extends Omit<IOrcamento, '_id' | 'user' | 'caixa'> {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  caixa: Types.ObjectId;
}

export const MOrcamento = model<IMOrcamento>('Orcamento', orcamentoSchema);
