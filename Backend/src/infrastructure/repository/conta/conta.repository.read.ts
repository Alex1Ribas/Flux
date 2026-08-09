import { Types, type FilterQuery } from 'mongoose';

import type { IConta } from '../../../domain/conta/entity/interfaces/conta.interface.js';
import type {
  IContaRepositoryRead,
  IListContasRepositoryFiltro,
  IListaContasPaginada,
} from '../../../domain/conta/repository/conta.repository.read.js';
import { MConta, type IMConta } from '../../db/mongo/models/conta.model.js';
import { toIConta } from './conta.mapper.js';

export class ContaRepositoryRead implements IContaRepositoryRead {
  async findContaById(id: string): Promise<IConta | null> {
    const document = await MConta.findById(id).lean();
    return document ? toIConta(document) : null;
  }

  async findContaByRecorrenteCompetencia(
    userId: string,
    recorrenteId: string,
    competencia: string,
  ): Promise<IConta | null> {
    const document = await MConta.findOne({
      user: userId,
      recorrenteId,
      competencia,
    }).lean();
    return document ? toIConta(document) : null;
  }

  async listContasByUser(
    userId: string,
    filtro?: IListContasRepositoryFiltro,
  ): Promise<IListaContasPaginada> {
    const pageSize = Number(filtro?.pageSize) || 10;
    const baseFilterQuery = this.buildFilterQuery(userId, filtro);

    let cursorDoc: Pick<IMConta, '_id' | 'competencia' | 'vencimento'> | null =
      null;
    if (filtro?.lastItemId && Types.ObjectId.isValid(filtro.lastItemId)) {
      cursorDoc = await MConta.findOne({
        _id: filtro.lastItemId,
        user: userId,
      })
        .select({ _id: 1, competencia: 1, vencimento: 1 })
        .lean();
    }

    const filterQuery = this.applyCursor(baseFilterQuery, cursorDoc);

    const [total, documents] = await Promise.all([
      MConta.countDocuments(baseFilterQuery),
      MConta.find(filterQuery)
        .sort({ competencia: 1, vencimento: 1, _id: 1 })
        .limit(pageSize + 1)
        .lean(),
    ]);

    const hasMore = documents.length > pageSize;
    const pageDocs = hasMore ? documents.slice(0, pageSize) : documents;
    const lastDoc = pageDocs[pageDocs.length - 1];

    return {
      items: pageDocs.map(toIConta),
      total,
      pageSize,
      lastItemId: lastDoc ? String(lastDoc._id) : null,
      hasMore,
    };
  }

  async listContasByRecorrente(
    userId: string,
    recorrenteId: string,
  ): Promise<IConta[]> {
    const documents = await MConta.find({
      user: userId,
      recorrenteId,
    })
      .sort({ competencia: 1 })
      .lean();
    return documents.map(toIConta);
  }

  private buildFilterQuery(
    userId: string,
    filtro?: IListContasRepositoryFiltro,
  ): FilterQuery<IMConta> {
    const filterQuery: FilterQuery<IMConta> = { user: userId };

    if (filtro?.status) {
      filterQuery.status = filtro.status;
    }
    if (filtro?.tipo) {
      filterQuery.tipo = filtro.tipo;
    }
    if (filtro?.recorrenteId) {
      filterQuery.recorrenteId = filtro.recorrenteId;
    }
    if (filtro?.competencia) {
      filterQuery.competencia = filtro.competencia.slice(0, 7);
    }

    return filterQuery;
  }

  private applyCursor(
    baseFilterQuery: FilterQuery<IMConta>,
    cursorDoc: Pick<IMConta, '_id' | 'competencia' | 'vencimento'> | null,
  ): FilterQuery<IMConta> {
    if (!cursorDoc) {
      return baseFilterQuery;
    }

    return {
      ...baseFilterQuery,
      $or: [
        { competencia: { $gt: cursorDoc.competencia } },
        {
          competencia: cursorDoc.competencia,
          vencimento: { $gt: cursorDoc.vencimento },
        },
        {
          competencia: cursorDoc.competencia,
          vencimento: cursorDoc.vencimento,
          _id: { $gt: cursorDoc._id },
        },
      ],
    };
  }
}
