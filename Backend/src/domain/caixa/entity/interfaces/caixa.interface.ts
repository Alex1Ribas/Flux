export enum ETipoCaixa {
  OBJETIVO = 'objetivo',
  ORCAMENTO = 'orcamento',
}

export interface ICaixa {
  _id: string;
  user: string;
  nome: string;
  saldo: number;
  tipo: ETipoCaixa;
  /** Meta de acúmulo (caixa de objetivo). */
  meta?: number;
  /** Aporte mensal planejado (caixa de objetivo). */
  aporteMensal?: number;
  /** Limite mensal de gastos (caixa de orçamento). */
  orcamentoMensal?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IParamsCreateCaixa {
  user: string;
  nome: string;
  saldo: number;
  tipo: ETipoCaixa;
  meta?: number;
  aporteMensal?: number;
  orcamentoMensal?: number;
}
