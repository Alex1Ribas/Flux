import { Types } from 'mongoose';
import type { ICaixa } from '../../../domain/caixa/entity/interfaces/caixa.interface.js';
import { ETipoCaixa } from '../../../domain/caixa/entity/interfaces/caixa.interface.js';
import type { Caixa } from '../../../domain/caixa/entity/caixa.entity.js';
import type { IMCaixa } from '../../db/mongo/models/caixa.model.js';

export function toICaixa(document: IMCaixa): ICaixa {
  return {
    _id: document._id.toString(),
    user: document.user.toString(),
    nome: document.nome,
    saldo: document.saldo,
    tipo: document.tipo ?? ETipoCaixa.ORCAMENTO,
    meta: document.meta,
    aporteMensal: document.aporteMensal,
    orcamentoMensal: document.orcamentoMensal,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export function toPersistence(
  caixa: Caixa,
): Omit<IMCaixa, '_id' | 'createdAt' | 'updatedAt'> {
  return {
    user: new Types.ObjectId(caixa.user),
    nome: caixa.nome,
    saldo: caixa.saldo,
    tipo: caixa.tipo,
    meta: caixa.meta,
    aporteMensal: caixa.aporteMensal,
    orcamentoMensal: caixa.orcamentoMensal,
  };
}
