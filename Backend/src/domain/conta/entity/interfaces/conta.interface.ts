export enum ETipoConta {
  A_PAGAR = 'a_pagar',
  A_RECEBER = 'a_receber',
}

export enum EStatusConta {
  ABERTA = 'aberta',
  LIQUIDADA = 'liquidada',
  CANCELADA = 'cancelada',
}

export interface IConta {
  _id: string;
  user: string;
  tipo: ETipoConta;
  descricao: string;
  valor: number;
  /** Vencimento planejado (AAAA-MM-DD). */
  vencimento: string;
  /** Caixa de origem (a pagar) ou destino (a receber). */
  caixaId: string;
  status: EStatusConta;
  /** Data efetiva do pagamento/recebimento (AAAA-MM-DD). */
  liquidadoEm?: string;
  /** Lançamento presente gerado na liquidação. */
  lancamentoId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IParamsCreateConta {
  user: string;
  tipo: ETipoConta;
  descricao: string;
  valor: number;
  vencimento: string;
  caixaId: string;
  status?: EStatusConta;
}
