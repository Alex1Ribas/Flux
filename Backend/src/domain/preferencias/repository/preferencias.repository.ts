import type { IPreferencias } from '../entity/interfaces/preferencias.interface.js';

export interface IPreferenciasRepositoryRead {
  findPreferenciasByUser(userId: string): Promise<IPreferencias | null>;
}

export interface IPreferenciasRepositoryWrite {
  upsertPreferencias(preferencias: Omit<IPreferencias, '_id' | 'createdAt' | 'updatedAt'>): Promise<IPreferencias>;
}
