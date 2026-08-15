export enum ETipoLancamento {
  ENTRADA = 'entrada',
  SAIDA = 'saida',
}

export enum EHorizonteLancamento {
  PRESENTE = 'presente',
  FUTURO = 'futuro',
}

export enum EMeioPagamento {
  CAIXA = 'caixa',
  CARTAO = 'cartao',
}

export interface IDistribuicaoLancamento {
  caixa: string;
  valor: number;
}

export interface ILancamento {
  _id: string;
  user: string;
  tipo: ETipoLancamento;
  horizonte: EHorizonteLancamento;
  valor: number;
  descricao: string;
  competencia: string;
  observacao?: string;
  caixaOrigem?: string;
  caixaCompensacao?: string;
  /** cartao: registra compra sem debitar saldo (compromisso via Conta). */
  meioPagamento?: EMeioPagamento | 'caixa' | 'cartao';
  distribuicao?: IDistribuicaoLancamento[];
  parcelaRef?: string;
  parcelaNum?: number;
  totalParcelas?: number;
  /** Marca lançamento como compromisso recorrente (mesmo documento, sem coleção separada). */
  recorrente: boolean;
  /** Competência inicial do compromisso recorrente (AAAA-MM ou AAAA-MM-DD). */
  competenciaInicial?: string;
  /** Duração em meses do compromisso recorrente. */
  duracaoMeses?: number;
  /** Se o compromisso recorrente está ativo no planejamento. */
  ativo?: boolean;
  mesesAbatidos?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IParamsCreateLancamento {
  user: string;
  tipo: ETipoLancamento;
  horizonte: EHorizonteLancamento;
  valor: number;
  descricao: string;
  competencia: string;
  observacao?: string;
  caixaOrigem?: string;
  caixaCompensacao?: string;
  /** cartao: registra compra sem debitar saldo (compromisso via Conta). */
  meioPagamento?: EMeioPagamento | 'caixa' | 'cartao';
  distribuicao?: IDistribuicaoLancamento[];
  parcelaRef?: string;
  parcelaNum?: number;
  totalParcelas?: number;
  recorrente?: boolean;
  competenciaInicial?: string;
  duracaoMeses?: number;
  ativo?: boolean;
  mesesAbatidos?: number;
}

export interface IParamsUpdateLancamento {
  tipo?: ETipoLancamento;
  horizonte?: EHorizonteLancamento;
  valor?: number;
  descricao?: string;
  competencia?: string;
  observacao?: string;
  caixaOrigem?: string;
  caixaCompensacao?: string;
  /** cartao: registra compra sem debitar saldo (compromisso via Conta). */
  meioPagamento?: EMeioPagamento | 'caixa' | 'cartao';
  distribuicao?: IDistribuicaoLancamento[];
  parcelaRef?: string;
  parcelaNum?: number;
  totalParcelas?: number;
  recorrente?: boolean;
  competenciaInicial?: string;
  duracaoMeses?: number;
  ativo?: boolean;
  mesesAbatidos?: number;
}

export interface IListLancamentosFiltro {
  competencia?: string;
  recorrente?: boolean;
}
