import type { ILancamento } from '../entity/interfaces/lancamento.interface.js';
import type { Lancamento } from '../entity/lancamento.entity.js';

export interface ILancamentoRepositoryWrite {
  createLancamento(lancamento: Lancamento): Promise<ILancamento>;
  updateLancamentoById(id: string, lancamento: Lancamento): Promise<ILancamento | null>;
  deleteLancamentoById(id: string): Promise<ILancamento | null>;
}
