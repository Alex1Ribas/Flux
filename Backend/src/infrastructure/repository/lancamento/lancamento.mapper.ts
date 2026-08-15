import { Types } from 'mongoose';
import type {
  IDistribuicaoLancamento,
  ILancamento,
} from '../../../domain/lancamento/entity/interfaces/lancamento.interface.js';
import type { Lancamento } from '../../../domain/lancamento/entity/lancamento.entity.js';
import type {
  IMDistribuicaoLancamento,
  IMLancamento,
} from '../../db/mongo/models/lancamento.model.js';

export function toILancamento(document: IMLancamento): ILancamento {
  return {
    _id: document._id.toString(),
    user: document.user.toString(),
    tipo: document.tipo,
    horizonte: document.horizonte,
    valor: document.valor,
    descricao: document.descricao,
    competencia: document.competencia,
    observacao: document.observacao,
    caixaOrigem: document.caixaOrigem?.toString(),
    caixaCompensacao: document.caixaCompensacao?.toString(),
    meioPagamento: document.meioPagamento,
    distribuicao: document.distribuicao?.map((item) => ({
      caixa: item.caixa.toString(),
      valor: item.valor,
    })),
    parcelaRef: document.parcelaRef,
    parcelaNum: document.parcelaNum,
    totalParcelas: document.totalParcelas,
    recorrente: Boolean(document.recorrente),
    competenciaInicial: document.competenciaInicial,
    duracaoMeses: document.duracaoMeses,
    ativo: document.ativo,
    mesesAbatidos: document.mesesAbatidos,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export function toPersistence(
  lancamento: Lancamento,
): Omit<IMLancamento, '_id' | 'createdAt' | 'updatedAt'> {
  return {
    user: new Types.ObjectId(lancamento.user),
    tipo: lancamento.tipo,
    horizonte: lancamento.horizonte,
    valor: lancamento.valor,
    descricao: lancamento.descricao,
    competencia: lancamento.competencia,
    observacao: lancamento.observacao,
    caixaOrigem: lancamento.caixaOrigem
      ? new Types.ObjectId(lancamento.caixaOrigem)
      : undefined,
    caixaCompensacao: lancamento.caixaCompensacao
      ? new Types.ObjectId(lancamento.caixaCompensacao)
      : undefined,
    meioPagamento: lancamento.meioPagamento as ILancamento['meioPagamento'],
    distribuicao: lancamento.distribuicao?.map(toPersistenceDistribuicao),
    parcelaRef: lancamento.parcelaRef,
    parcelaNum: lancamento.parcelaNum,
    totalParcelas: lancamento.totalParcelas,
    recorrente: Boolean(lancamento.recorrente),
    competenciaInicial: lancamento.competenciaInicial,
    duracaoMeses: lancamento.duracaoMeses,
    ativo: lancamento.ativo,
    mesesAbatidos: lancamento.mesesAbatidos,
  };
}

function toPersistenceDistribuicao(
  item: IDistribuicaoLancamento,
): IMDistribuicaoLancamento {
  return {
    caixa: new Types.ObjectId(item.caixa),
    valor: item.valor,
  };
}
