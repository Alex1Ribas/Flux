export interface ILimitesRisco {
  saudavel: number;
  atencao: number;
}

export interface IConfigLimitesRisco {
  global: ILimitesRisco;
  porCaixa: Record<string, ILimitesRisco>;
}

export enum EModoRegraDistribuicao {
  VALOR_FIXO = 'valor_fixo',
  COMPLETAR_META = 'completar_meta',
  RESTANTE = 'restante',
}

export interface IRegraDistribuicao {
  prioridade: number;
  caixaId: string;
  modo: EModoRegraDistribuicao | 'valor_fixo' | 'completar_meta' | 'restante';
  valorFixo?: number;
}

export interface IConfigDistribuicaoAutomatica {
  ativo: boolean;
  regras: IRegraDistribuicao[];
}

export interface IPreferencias {
  _id: string;
  user: string;
  tiposEntrada: string[];
  tiposSaida: string[];
  limitesRisco: IConfigLimitesRisco;
  distribuicaoAutomatica?: IConfigDistribuicaoAutomatica;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IParamsUpdatePreferencias {
  tiposEntrada?: string[];
  tiposSaida?: string[];
  limitesRisco?: IConfigLimitesRisco;
  distribuicaoAutomatica?: IConfigDistribuicaoAutomatica;
}
