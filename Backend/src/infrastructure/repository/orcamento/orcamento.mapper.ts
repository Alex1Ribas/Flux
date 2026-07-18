import { Types } from 'mongoose';
import type { IOrcamento } from '../../../domain/orcamento/entity/interfaces/orcamento.interface.js';
import type { Orcamento } from '../../../domain/orcamento/entity/orcamento.entity.js';
import type { IMOrcamento } from '../../db/mongo/models/orcamento.model.js';

export function toIOrcamento(document: IMOrcamento): IOrcamento {
  return {
    _id: document._id.toString(),
    user: document.user.toString(),
    caixa: document.caixa.toString(),
    competencia: document.competencia,
    valor: document.valor,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export function toPersistence(
  orcamento: Orcamento,
): Omit<IMOrcamento, '_id' | 'createdAt' | 'updatedAt'> {
  return {
    user: new Types.ObjectId(orcamento.user),
    caixa: new Types.ObjectId(orcamento.caixa),
    competencia: orcamento.competencia,
    valor: orcamento.valor,
  };
}
