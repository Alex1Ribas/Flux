import { model, Types } from 'mongoose';
import type { IPreferencias } from '../../../../domain/preferencias/entity/interfaces/preferencias.interface.js';
import { preferenciasSchema } from '../schema/preferencias.schema.js';

export interface IMPreferencias extends Omit<IPreferencias, '_id' | 'user'> {
  _id: Types.ObjectId;
  user: Types.ObjectId;
}

export const MPreferencias = model<IMPreferencias>('Preferencias', preferenciasSchema);
