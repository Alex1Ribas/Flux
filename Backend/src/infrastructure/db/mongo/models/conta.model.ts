import { model, Types } from 'mongoose';
import type { IConta } from '../../../../domain/conta/entity/interfaces/conta.interface.js';
import { contaSchema } from '../schema/conta.schema.js';

export interface IMConta
  extends Omit<IConta, '_id' | 'user' | 'caixaId' | 'lancamentoId'> {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  caixaId: Types.ObjectId;
  lancamentoId?: Types.ObjectId;
}

export const MConta = model<IMConta>('Conta', contaSchema);
