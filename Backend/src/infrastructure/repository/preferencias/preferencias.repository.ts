import type { IPreferencias } from '../../../domain/preferencias/entity/interfaces/preferencias.interface.js';
import type {
  IPreferenciasRepositoryRead,
  IPreferenciasRepositoryWrite,
} from '../../../domain/preferencias/repository/preferencias.repository.js';
import { MPreferencias } from '../../db/mongo/models/preferencias.model.js';
import { toIPreferencias, toPersistence } from './preferencias.mapper.js';

export class PreferenciasRepositoryRead implements IPreferenciasRepositoryRead {
  async findPreferenciasByUser(userId: string): Promise<IPreferencias | null> {
    const document = await MPreferencias.findOne({ user: userId }).lean();
    return document ? toIPreferencias(document) : null;
  }
}

export class PreferenciasRepositoryWrite implements IPreferenciasRepositoryWrite {
  async upsertPreferencias(
    preferencias: Omit<IPreferencias, '_id' | 'createdAt' | 'updatedAt'>,
  ): Promise<IPreferencias> {
    const document = await MPreferencias.findOneAndUpdate(
      { user: preferencias.user },
      { $set: toPersistence(preferencias) },
      { new: true, upsert: true, runValidators: true },
    ).lean();
    return toIPreferencias(document!);
  }
}
