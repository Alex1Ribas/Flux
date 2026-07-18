import type { ILancamentoRepositoryRead } from '../../../lancamento/repository/lancamento.repository.read.js';

export type StatusRiscoMensal = 'saudavel' | 'atencao' | 'critico';

export interface IRiscoPrevisto {
  entradaPrevista: number;
  comprometido: number;
  risco: number;
}

export interface IComposicaoRisco {
  descricao: string;
  valor: number;
  percentual: number;
}

export interface IAcompanhamentoMes {
  competencia: string;
  risco: IRiscoPrevisto;
  riscoReal: IRiscoPrevisto;
  diferencial: number;
  diferencialValor: number;
  status: StatusRiscoMensal;
  dentroPlanejado: boolean;
  limites: {
    saudavel: number;
    atencao: number;
  };
  composicao: IComposicaoRisco[];
}

export interface IParamsAcompanhamentoService {
  lancamentoRepositoryRead: ILancamentoRepositoryRead;
}

export interface IAcompanhamentoService {
  montarAcompanhamentoMes(
    requestUserId: string,
    competencia: string,
  ): Promise<IAcompanhamentoMes>;
}
