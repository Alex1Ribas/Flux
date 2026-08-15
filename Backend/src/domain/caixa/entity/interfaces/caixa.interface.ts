export enum ETipoCaixa {
  OBJETIVO = 'objetivo',
  ORCAMENTO = 'orcamento',
  /** Ponto de entrada de receita (ex.: Salário). */
  ORIGEM = 'origem',
}

export interface ICaixa {
  _id: string;
  user: string;
  nome: string;
  saldo: number;
  tipo: ETipoCaixa;
  /** Valor reservado por obrigações abertas (não é saída real). */
  comprometido: number;
  /** saldo - comprometido (somente leitura). */
  disponivel: number;
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
  comprometido?: number;
  meta?: number;
  aporteMensal?: number;
  orcamentoMensal?: number;
}
