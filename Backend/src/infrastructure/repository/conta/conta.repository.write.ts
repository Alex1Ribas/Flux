import { Types } from 'mongoose';
import type { Conta } from '../../../domain/conta/entity/conta.entity.js';
import type { IConta } from '../../../domain/conta/entity/interfaces/conta.interface.js';
import type { IContaRepositoryWrite } from '../../../domain/conta/repository/conta.repository.write.js';
import { MConta } from '../../db/mongo/models/conta.model.js';
import { toIConta, toPersistence } from './conta.mapper.js';

type ContaUpdateParams = Parameters<IContaRepositoryWrite['updateContaById']>[1];

export class ContaRepositoryWrite implements IContaRepositoryWrite {
  async createConta(conta: Conta): Promise<IConta> {
    const document = await MConta.create(toPersistence(conta));
    return toIConta(document);
  }

  async updateContaById(
    id: string,
    params: ContaUpdateParams,
  ): Promise<IConta | null> {
    const $set: Record<string, unknown> = { ...params };
    if (params.caixaId) {
      $set.caixaId = new Types.ObjectId(params.caixaId);
    }
    if (params.lancamentoId) {
      $set.lancamentoId = new Types.ObjectId(params.lancamentoId);
    }

    const document = await MConta.findByIdAndUpdate(
      id,
      { $set },
      { new: true, runValidators: true },
    ).lean();
    return document ? toIConta(document) : null;
  }

  async deleteContaById(id: string): Promise<IConta | null> {
    const document = await MConta.findByIdAndDelete(id).lean();
    return document ? toIConta(document) : null;
  }
}
