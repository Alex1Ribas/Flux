import type { ICaixa } from '../entity/interfaces/caixa.interface.js';

export interface ICaixaRepositoryRead {
  findCaixaById(id: string): Promise<ICaixa | null>;
  findCaixaByNameAndUser(nome: string, userId: string): Promise<ICaixa | null>;
  listCaixasByUser(userId: string): Promise<ICaixa[]>;
}
