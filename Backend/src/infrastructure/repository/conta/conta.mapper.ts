import { Types } from 'mongoose';
import type { IConta } from '../../../domain/conta/entity/interfaces/conta.interface.js';
import type { Conta } from '../../../domain/conta/entity/conta.entity.js';
import type { IMConta } from '../../db/mongo/models/conta.model.js';

export function toIConta(document: IMConta): IConta {
  return {
    _id: document._id.toString(),
    user: document.user.toString(),
    tipo: document.tipo,
    descricao: document.descricao,
    valor: document.valor,
    competencia: document.competencia,
    vencimento: document.vencimento,
    caixaId: document.caixaId.toString(),
    status: document.status,
    recorrenteId: document.recorrenteId?.toString(),
    liquidadoEm: document.liquidadoEm,
    lancamentoId: document.lancamentoId?.toString(),
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export function toPersistence(
  conta: Conta,
): Omit<IMConta, '_id' | 'createdAt' | 'updatedAt'> {
  return {
    user: new Types.ObjectId(conta.user),
    tipo: conta.tipo,
    descricao: conta.descricao,
    valor: conta.valor,
    competencia: conta.competencia,
    vencimento: conta.vencimento,
    caixaId: new Types.ObjectId(conta.caixaId),
    status: conta.status,
    recorrenteId: conta.recorrenteId
      ? new Types.ObjectId(conta.recorrenteId)
      : undefined,
    liquidadoEm: conta.liquidadoEm,
    lancamentoId: conta.lancamentoId
      ? new Types.ObjectId(conta.lancamentoId)
      : undefined,
  };
}
