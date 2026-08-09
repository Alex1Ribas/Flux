import type { IConta } from '../../../domain/conta/entity/interfaces/conta.interface.js';
import type {
  IContaRepositoryRead,
  IListContasRepositoryFiltro,
} from '../../../domain/conta/repository/conta.repository.read.js';
import { MConta } from '../../db/mongo/models/conta.model.js';
import { toIConta } from './conta.mapper.js';

export class ContaRepositoryRead implements IContaRepositoryRead {
  async findContaById(id: string): Promise<IConta | null> {
    const document = await MConta.findById(id).lean();
    return document ? toIConta(document) : null;
  }

  async listContasByUser(
    userId: string,
    filtro?: IListContasRepositoryFiltro,
  ): Promise<IConta[]> {
    const query: Record<string, unknown> = { user: userId };

    if (filtro?.status) {
      query.status = filtro.status;
    }
    if (filtro?.tipo) {
      query.tipo = filtro.tipo;
    }
    if (filtro?.competencia) {
      const mes = filtro.competencia.slice(0, 7);
      query.vencimento = {
        $gte: `${mes}-01`,
        $lte: `${mes}-31`,
      };
    }

    const documents = await MConta.find(query).sort({ vencimento: 1 }).lean();
    return documents.map(toIConta);
  }
}
