import { Types } from 'mongoose';
import type { IPreferencias } from '../../../domain/preferencias/entity/interfaces/preferencias.interface.js';
import type { IMPreferencias } from '../../db/mongo/models/preferencias.model.js';

export function toIPreferencias(document: IMPreferencias): IPreferencias {
  return {
    _id: document._id.toString(),
    user: document.user.toString(),
    tiposEntrada: document.tiposEntrada,
    tiposSaida: document.tiposSaida,
    limitesRisco: {
      global: { ...document.limitesRisco.global },
      porCaixa: { ...(document.limitesRisco.porCaixa ?? {}) },
    },
    distribuicaoAutomatica: document.distribuicaoAutomatica
      ? {
          ativo: Boolean(document.distribuicaoAutomatica.ativo),
          regras: (document.distribuicaoAutomatica.regras ?? []).map((regra) => ({
            prioridade: Number(regra.prioridade),
            caixaId: String(regra.caixaId),
            modo: regra.modo,
            valorFixo: regra.valorFixo,
          })),
        }
      : undefined,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export function toPersistence(
  preferencias: Omit<IPreferencias, '_id' | 'createdAt' | 'updatedAt'>,
): Omit<IMPreferencias, '_id' | 'createdAt' | 'updatedAt'> {
  return {
    user: new Types.ObjectId(preferencias.user),
    tiposEntrada: preferencias.tiposEntrada,
    tiposSaida: preferencias.tiposSaida,
    limitesRisco: preferencias.limitesRisco,
    distribuicaoAutomatica: preferencias.distribuicaoAutomatica,
  };
}
