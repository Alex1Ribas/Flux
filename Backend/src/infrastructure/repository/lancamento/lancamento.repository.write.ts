import type { ILancamento } from '../../../domain/lancamento/entity/interfaces/lancamento.interface.js';
import type { Lancamento } from '../../../domain/lancamento/entity/lancamento.entity.js';
import type { ILancamentoRepositoryWrite } from '../../../domain/lancamento/repository/lancamento.repository.write.js';
import { MLancamento } from '../../db/mongo/models/lancamento.model.js';
import { toILancamento, toPersistence } from './lancamento.mapper.js';

export class LancamentoRepositoryWrite implements ILancamentoRepositoryWrite {
  async createLancamento(lancamento: Lancamento): Promise<ILancamento> {
    const document = await MLancamento.create(toPersistence(lancamento));
    return toILancamento(document);
  }

  async updateLancamentoById(
    id: string,
    lancamento: Lancamento,
  ): Promise<ILancamento | null> {
    const document = await MLancamento.findByIdAndUpdate(
      id,
      { $set: toPersistence(lancamento) },
      { new: true },
    ).lean();
    return document ? toILancamento(document) : null;
  }

  async deleteLancamentoById(id: string): Promise<ILancamento | null> {
    const document = await MLancamento.findByIdAndDelete(id).lean();
    return document ? toILancamento(document) : null;
  }
}
