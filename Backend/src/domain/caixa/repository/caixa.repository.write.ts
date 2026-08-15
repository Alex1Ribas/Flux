import type { Caixa } from '../entity/caixa.entity.js';
import type { ICaixa } from '../entity/interfaces/caixa.interface.js';
import type { IParamsUpdateCaixa } from '../entity/interfaces/caixa.service.interface.js';

export interface ICaixaRepositoryWrite {
  createCaixa(caixa: Caixa): Promise<ICaixa>;
  updateCaixaById(id: string, params: IParamsUpdateCaixa): Promise<ICaixa | null>;
  incrementSaldoById(id: string, amount: number): Promise<ICaixa | null>;
  incrementComprometidoById(id: string, amount: number): Promise<ICaixa | null>;
  deleteCaixaById(id: string): Promise<ICaixa | null>;
}
