import type { ILancamentoRepositoryRead } from '../../../lancamento/repository/lancamento.repository.read.js';
import type { IContaService } from '../../../conta/entity/interfaces/conta.service.interface.js';
import type { IPreferenciasService } from '../../../preferencias/entity/interfaces/preferencias.service.interface.js';

export type StatusRiscoMensal = 'saudavel' | 'atencao' | 'critico';

export type TipoImpactoRisco =
  | 'despesa_futura'
  | 'parcelamento'
  | 'renda_extra'
  | 'realizacao'
  | 'abatimento'
  | 'outro';

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

export interface ILimitesRiscoMensal {
  saudavel: number;
  atencao: number;
}

export interface IPontoEvolucaoRisco {
  dia: number;
  label: string;
  riscoEsperado: number;
  riscoReal: number;
  diferencial: number;
}

export interface ICompromissoMes {
  id: string;
  descricao: string;
  tipo: 'entrada' | 'saida';
  valor: number;
  dia: number | null;
}

export interface IImpactoRisco {
  id: string;
  descricao: string;
  tipo: TipoImpactoRisco;
  valor: number;
  impactoRisco: number;
  competencia: string;
  direcao: 'aumenta' | 'reduz';
}

export interface IAcompanhamentoMes {
  competencia: string;
  risco: IRiscoPrevisto;
  riscoReal: IRiscoPrevisto;
  diferencial: number;
  diferencialValor: number;
  status: StatusRiscoMensal;
  dentroPlanejado: boolean;
  limites: ILimitesRiscoMensal;
  evolucao: IPontoEvolucaoRisco[];
  compromissos: ICompromissoMes[];
  composicao: IComposicaoRisco[];
  impactos: IImpactoRisco[];
}

export interface IParamsAcompanhamentoService {
  lancamentoRepositoryRead: ILancamentoRepositoryRead;
  contaService: IContaService;
  preferenciasService: IPreferenciasService;
}

export interface IAcompanhamentoService {
  montarAcompanhamentoMes(
    requestUserId: string,
    competencia: string,
  ): Promise<IAcompanhamentoMes>;
}
