import type { ICaixa } from '../../../domain/caixa/entity/interfaces/caixa.interface.js';
import type { ICaixaRepositoryRead } from '../../../domain/caixa/repository/caixa.repository.read.js';
import { MCaixa } from '../../db/mongo/models/caixa.model.js';
import { toICaixa } from './caixa.mapper.js';

export class CaixaRepositoryRead implements ICaixaRepositoryRead {
  async findCaixaById(id: string): Promise<ICaixa | null> {
    const document = await MCaixa.findById(id).lean();
    return document ? toICaixa(document) : null;
  }

  async findCaixaByNameAndUser(
    nome: string,
    userId: string,
  ): Promise<ICaixa | null> {
    const document = await MCaixa.findOne({ nome, user: userId }).lean();
    return document ? toICaixa(document) : null;
  }

  async listCaixasByUser(userId: string): Promise<ICaixa[]> {
    const documents = await MCaixa.find({ user: userId }).sort({ nome: 1 }).lean();
    return documents.map(toICaixa);
  }
}
