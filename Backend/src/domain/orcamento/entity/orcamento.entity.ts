export class Orcamento {
  constructor(
    public readonly _id: string,
    public readonly user: string,
    public readonly caixa: string,
    public competencia: string,
    public valor: number,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}
}
