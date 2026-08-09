import type { EStatusConta, ETipoConta } from './interfaces/conta.interface.js';

export class Conta {
  constructor(
    public readonly _id: string,
    public readonly user: string,
    public tipo: ETipoConta,
    public descricao: string,
    public valor: number,
    public vencimento: string,
    public caixaId: string,
    public status: EStatusConta,
    public liquidadoEm?: string,
    public lancamentoId?: string,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}
}
