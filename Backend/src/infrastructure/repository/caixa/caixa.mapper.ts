import { Types } from 'mongoose';
import type { ICaixa } from '../../../domain/caixa/entity/interfaces/caixa.interface.js';
import { ETipoCaixa } from '../../../domain/caixa/entity/interfaces/caixa.interface.js';
import type { Caixa } from '../../../domain/caixa/entity/caixa.entity.js';
import type { IMCaixa } from '../../db/mongo/models/caixa.model.js';

export function toICaixa(document: IMCaixa): ICaixa {
  const saldo = Number(document.saldo) || 0;
  const comprometido = Number(document.comprometido) || 0;
  return {
    _id: document._id.toString(),
    user: document.user.toString(),
    nome: document.nome,
    saldo,
    tipo: document.tipo ?? ETipoCaixa.ORCAMENTO,
    comprometido,
    disponivel: saldo - comprometido,
    meta: document.meta,
    aporteMensal: document.aporteMensal,
    orcamentoMensal: document.orcamentoMensal,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export function toPersistence(
  caixa: Caixa,
): Omit<IMCaixa, '_id' | 'createdAt' | 'updatedAt' | 'disponivel'> {
  return {
    user: new Types.ObjectId(caixa.user),
    nome: caixa.nome,
    saldo: caixa.saldo,
    tipo: caixa.tipo,
    comprometido: caixa.comprometido ?? 0,
    meta: caixa.meta,
    aporteMensal: caixa.aporteMensal,
    orcamentoMensal: caixa.orcamentoMensal,
  };
}
