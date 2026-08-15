import type { ETipoCaixa } from './interfaces/caixa.interface.js';

export class Caixa {
  constructor(
    public readonly _id: string,
    public readonly user: string,
    public nome: string,
    public saldo: number,
    public tipo: ETipoCaixa,
    public comprometido: number = 0,
    public meta?: number,
    public aporteMensal?: number,
    public orcamentoMensal?: number,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}

  get disponivel(): number {
    return this.saldo - this.comprometido;
  }
}
