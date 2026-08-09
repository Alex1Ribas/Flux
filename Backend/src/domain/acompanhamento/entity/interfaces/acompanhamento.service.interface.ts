import type { ILancamentoRepositoryRead } from '../../../lancamento/repository/lancamento.repository.read.js';
import type { IContaService } from '../../../conta/entity/interfaces/conta.service.interface.js';
import type { IPreferenciasService } from '../../../preferencias/entity/interfaces/preferencias.service.interface.js';
import type { ICaixaRepositoryRead } from '../../../caixa/repository/caixa.repository.read.js';
import type { IOrcamentoRepositoryRead } from '../../../orcamento/repository/orcamento.repository.read.js';

export type StatusRiscoMensal = 'saudavel' | 'atencao' | 'critico';
export type ModoCompensacaoSimulacao = 'declarada' | 'nao-declarada';
export type CompensationSourceType = 'orcamento' | 'objetivo';

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
  caixaRepositoryRead: ICaixaRepositoryRead;
  orcamentoRepositoryRead: IOrcamentoRepositoryRead;
}

export interface ICompensationSource {
  id: string;
  tipoOrigem: CompensationSourceType;
  origemId: string;
  valorMensalDestinado: number;
}

export interface ISimulacaoImpactoInput {
  valorTotal: number;
  duracaoMeses: number;
  dataPrimeiroPagamento: string;
  modoCompensacao: ModoCompensacaoSimulacao;
  fontesDeCompensacao: ICompensationSource[];
}

export interface IMonthlyPlanningSnapshot {
  referenciaMes: string;
  entradasPrevistas: number;
  compromissosAnteriores: number;
}

export interface IMonthlyImpact {
  referenciaMes: string;
  entradasPrevistas: number;
  compromissosAnteriores: number;
  novaParcela: number;
  totalComprometido: number;
  comprometimentoAntes: number | null;
  comprometimentoDepois: number | null;
  variacaoComprometimento: number | null;
  classificacaoAntes: StatusRiscoMensal;
  classificacaoDepois: StatusRiscoMensal;
  alertas: string[];
}

export interface IBudgetImpact {
  fonteId: string;
  nome: string;
  valorPlanejadoMensal: number;
  valorMensalDestinado: number;
  novoValorMensal: number;
  percentualReducao: number | null;
  alertas: string[];
}

export type GoalImpactStatus = 'normal' | 'congelado';

export interface IGoalImpact {
  fonteId: string;
  nome: string;
  valorRestanteObjetivo: number;
  aporteMensalPlanejado: number;
  valorMensalDestinado: number;
  novoAporteMensal: number;
  prazoOriginalMeses: number | null;
  novoPrazoMeses: number | null;
  diferencaPrazoMeses: number | null;
  status: GoalImpactStatus;
  alertas: string[];
}

export interface IScenarioSummary {
  totalFontesDeclaradas: number;
  quantidadeFontes: number;
  possuiOrcamento: boolean;
  possuiObjetivo: boolean;
  impactoBruto: boolean;
  piorComprometimentoDepois: number | null;
  piorMes: string | null;
  mesesCriticos: number;
  alertasGerais: string[];
}

export interface ISimulationResult {
  parcelaMensal: number;
  mesesAfetados: string[];
  budgetImpacts: IBudgetImpact[];
  goalImpacts: IGoalImpact[];
  monthlyImpacts: IMonthlyImpact[];
  resumoImpacto: IScenarioSummary;
}

export interface ISimulacaoImpactoData {
  monthlyPlanning: IMonthlyPlanningSnapshot[];
  orcamentosMensais: {
    caixaId: string;
    nome: string;
    valorPlanejadoMensal: number;
  }[];
  objetivos: {
    caixaId: string;
    nome: string;
    saldoAtual: number;
    meta: number;
    aporteMensalPlanejado: number;
  }[];
}

export interface IAcompanhamentoService {
  montarAcompanhamentoMes(
    requestUserId: string,
    competencia: string,
  ): Promise<IAcompanhamentoMes>;
  simularImpacto(
    requestUserId: string,
    input: ISimulacaoImpactoInput,
  ): Promise<ISimulationResult>;
}
