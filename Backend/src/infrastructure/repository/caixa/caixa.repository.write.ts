import type { IParamsUpdateCaixa } from '../../../domain/caixa/entity/interfaces/caixa.service.interface.js';
import type { ICaixa } from '../../../domain/caixa/entity/interfaces/caixa.interface.js';
import type { Caixa } from '../../../domain/caixa/entity/caixa.entity.js';
import type { ICaixaRepositoryWrite } from '../../../domain/caixa/repository/caixa.repository.write.js';
import { MCaixa } from '../../db/mongo/models/caixa.model.js';
import { toICaixa, toPersistence } from './caixa.mapper.js';

export class CaixaRepositoryWrite implements ICaixaRepositoryWrite {
  async createCaixa(caixa: Caixa): Promise<ICaixa> {
    const document = await MCaixa.create(toPersistence(caixa));
    return toICaixa(document);
  }

  async updateCaixaById(
    id: string,
    params: IParamsUpdateCaixa,
  ): Promise<ICaixa | null> {
    const document = await MCaixa.findByIdAndUpdate(
      id,
      { $set: params },
      { new: true, runValidators: true },
    ).lean();
    return document ? toICaixa(document) : null;
  }

  async incrementSaldoById(id: string, amount: number): Promise<ICaixa | null> {
    const document = await MCaixa.findByIdAndUpdate(
      id,
      { $inc: { saldo: amount } },
      { new: true, runValidators: true },
    ).lean();
    return document ? toICaixa(document) : null;
  }

  async deleteCaixaById(id: string): Promise<ICaixa | null> {
    const document = await MCaixa.findByIdAndDelete(id).lean();
    return document ? toICaixa(document) : null;
  }
}
