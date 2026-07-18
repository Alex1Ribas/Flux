import { Types } from 'mongoose';
import type {
  ILancamento,
  IListLancamentosFiltro,
} from '../../../domain/lancamento/entity/interfaces/lancamento.interface.js';
import type {
  IBuscaCategoriasFiltro,
  ILancamentoRepositoryRead,
} from '../../../domain/lancamento/repository/lancamento.repository.read.js';
import { MLancamento } from '../../db/mongo/models/lancamento.model.js';
import { toILancamento } from './lancamento.mapper.js';

function escapeRegex(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class LancamentoRepositoryRead implements ILancamentoRepositoryRead {
  async findLancamentoById(id: string): Promise<ILancamento | null> {
    const document = await MLancamento.findById(id).lean();
    return document ? toILancamento(document) : null;
  }

  async listLancamentosByUser(
    userId: string,
    filtro?: IListLancamentosFiltro,
  ): Promise<ILancamento[]> {
    const query: Record<string, unknown> = { user: userId };

    if (typeof filtro?.recorrente === 'boolean') {
      query.recorrente = filtro.recorrente;
    }

    if (filtro?.competencia) {
      const mes = filtro.competencia.slice(0, 7);
      query.$or = [{ competencia: mes }, { competencia: { $regex: `^${mes}-` } }];
    }

    const documents = await MLancamento.find(query)
      .sort({ competencia: -1, createdAt: -1 })
      .lean();
    return documents.map(toILancamento);
  }

  async listLancamentosByUserCompetencia(
    userId: string,
    competencia: string,
  ): Promise<ILancamento[]> {
    return this.listLancamentosByUser(userId, { competencia });
  }

  async existsLancamentoByCaixa(caixaId: string): Promise<boolean> {
    const document = await MLancamento.exists({
      $or: [
        { caixaOrigem: caixaId },
        { caixaCompensacao: caixaId },
        { 'distribuicao.caixa': caixaId },
      ],
    });
    return Boolean(document);
  }

  async searchCategoriasDistintas(
    userId: string,
    filtro: IBuscaCategoriasFiltro,
  ): Promise<string[]> {
    const limit = Math.min(Math.max(filtro.limit ?? 20, 1), 50);
    const match: Record<string, unknown> = {
      user: new Types.ObjectId(userId),
      tipo: filtro.tipo,
    };

    const q = filtro.q?.trim();
    if (q) {
      match.descricao = { $regex: escapeRegex(q), $options: 'i' };
    }

    const rows = await MLancamento.aggregate<{ _id: string }>([
      { $match: match },
      { $group: { _id: '$descricao' } },
      { $sort: { _id: 1 } },
      { $limit: limit },
    ]);

    return rows.map((row) => row._id).filter(Boolean);
  }
}
