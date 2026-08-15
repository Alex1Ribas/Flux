import { model, Types } from 'mongoose';
import type { ICaixa } from '../../../../domain/caixa/entity/interfaces/caixa.interface.js';
import { caixaSchema } from '../schema/caixa.schema.js';

export interface IMCaixa
  extends Omit<ICaixa, '_id' | 'user' | 'disponivel'> {
  _id: Types.ObjectId;
  user: Types.ObjectId;
}

export const MCaixa = model<IMCaixa>('Caixa', caixaSchema);
