export type Horizonte = "presente" | "futuro";
export type TipoLancamento = "entrada" | "saida";
export type TipoRecorrencia = "nenhum" | "dividir" | "cheio";

export interface Distribuicao {
  caixa: string;
  valor: number;
}

export interface LancamentoInput {
  tipo: TipoLancamento;
  horizonte: Horizonte;
  valor: number;
  descricao: string;
  competencia: string;
  observacao?: string;
  caixaOrigem?: string;
  caixaCompensacao?: string;
  distribuicao?: Distribuicao[];
  parcelaRef?: string;
  parcelaNum?: number;
  totalParcelas?: number;
  /** Compromisso recorrente (mesma coleção de lançamentos). */
  recorrente?: boolean;
  competenciaInicial?: string;
  duracaoMeses?: number;
  ativo?: boolean;
  /** Quantidade de meses de compromisso abatidos (ex.: antecipação de parcelas) */
  mesesAbatidos?: number;
}

export type TipoConta = "a_pagar" | "a_receber";
export type StatusConta = "aberta" | "liquidada" | "cancelada";

export interface Conta {
  id: string;
  tipo: TipoConta;
  descricao: string;
  valor: number;
  /** Competência da ocorrência (AAAA-MM). */
  competencia: string;
  /** Vencimento planejado (AAAA-MM-DD). */
  vencimento: string;
  caixaId: string;
  status: StatusConta;
  /** Template recorrente que originou esta ocorrência. */
  recorrenteId?: string;
  liquidadoEm?: string;
  lancamentoId?: string;
}

export interface ContaInput {
  tipo: TipoConta;
  descricao: string;
  valor: number;
  competencia?: string;
  vencimento: string;
  caixaId: string;
  recorrenteId?: string;
}

export interface Lancamento extends LancamentoInput {
  id: string;
}

/** Visão de UI de um lançamento com recorrente=true. */
export interface ItemRecorrente {
  id: string;
  nome: string;
  tipo: TipoLancamento;
  valor: number;
  /** Caixa planejada de destino (entrada) ou origem (saída) */
  caixaId: string;
  /** Competência inicial no formato AAAA-MM ou AAAA-MM-DD */
  competenciaInicial: string;
  duracaoMeses: number;
  ativo: boolean;
}

export interface ParcelamentoInput {
  valorTotal: number;
  parcelas: number;
  primeiraCompetencia: string;
  descricao: string;
  caixaOrigem: string;
  tipoDescricao: string;
  recorrente?: boolean;
}

export type TipoCaixa = "objetivo" | "orcamento";

export interface CaixaCatalogoItem {
  id: string;
  nome: string;
  tipo?: TipoCaixa;
  meta?: number;
  aporteMensal?: number;
  orcamentoMensal?: number;
}

export interface LimitesRisco {
  /** Percentual máximo comprometido ainda considerado saudável (ex.: 30) */
  saudavel: number;
  /** Percentual máximo comprometido antes de crítico (ex.: 50) — acima disso é crítico */
  atencao: number;
}

export interface ConfigLimitesRisco {
  global: LimitesRisco;
  porCaixa: Record<string, LimitesRisco>;
}

export type NivelRiscoCaixa = "sem_orcamento" | "saudavel" | "atencao" | "critico";

export interface MetricasRiscoCaixa {
  orcamento: number;
  saldoRestante: number;
  percentualComprometido: number;
  percentualRestante: number;
  semOrcamento: boolean;
}

export type Caixas = Record<string, number>;
export type Orcamentos = Record<string, Record<string, number>>;

export interface RiscoPrevisto {
  entradaPrevista: number;
  comprometido: number;
  risco: number;
}

export type StatusRiscoMensal = "saudavel" | "atencao" | "critico";

export interface CompromissoMes {
  id: string;
  descricao: string;
  tipo: TipoLancamento;
  valor: number;
  /** Dia do mês do compromisso (1–31); null se só houver mês. */
  dia: number | null;
}

export interface AcompanhamentoMes {
  competencia: string;
  /** Bloco A: risco só com recorrente === true. */
  risco: RiscoPrevisto;
  /** Risco real (previsto + efeito dos avulsos). */
  riscoReal: RiscoPrevisto;
  diferencial: number;
  diferencialValor: number;
  status: StatusRiscoMensal;
  dentroPlanejado: boolean;
  limites: LimitesRisco;
  /** Bloco B: evolução diária (previsto fixo + realidade). */
  evolucao: PontoEvolucaoRisco[];
  /** Bloco C: compromissos recorrentes (entradas e saídas). */
  compromissos: CompromissoMes[];
  /** @deprecated Preferir compromissos; mantido para compatibilidade. */
  composicao: ComposicaoRiscoDecisao[];
  /** Bloco D: movimentações avulsas (recorrente === false). */
  impactos: ImpactoRisco[];
}

export interface PontoEvolucaoRisco {
  dia: number;
  label: string;
  /** Linha do planejado recorrente. */
  riscoEsperado: number;
  /** Linha com efeito dos lançamentos individuais. */
  riscoReal: number;
  /** Diferencial (real - esperado) no ponto. */
  diferencial: number;
}

export interface ComposicaoRiscoDecisao {
  descricao: string;
  valor: number;
  percentual: number;
}

export type TipoImpactoRisco =
  "despesa_futura" | "parcelamento" | "renda_extra" | "realizacao" | "abatimento" | "outro";

export interface ImpactoRisco {
  id: string;
  descricao: string;
  tipo: TipoImpactoRisco;
  valor: number;
  impactoRisco: number;
  competencia: string;
  direcao: "aumenta" | "reduz";
}

export type CompensationSourceType = "orcamento" | "objetivo";
export type ModoCompensacaoSimulacao = "declarada" | "nao-declarada";

export interface CompensationSource {
  id: string;
  tipoOrigem: CompensationSourceType;
  origemId: string;
  valorMensalDestinado: number;
}

export interface SimulationInput {
  valorTotal: number;
  duracaoMeses: number;
  dataPrimeiroPagamento: string;
  modoCompensacao: ModoCompensacaoSimulacao;
  fontesDeCompensacao: CompensationSource[];
}

export interface MonthlyImpact {
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

export interface BudgetImpact {
  fonteId: string;
  nome: string;
  valorPlanejadoMensal: number;
  valorMensalDestinado: number;
  novoValorMensal: number;
  percentualReducao: number | null;
  alertas: string[];
}

export interface GoalImpact {
  fonteId: string;
  nome: string;
  valorRestanteObjetivo: number;
  aporteMensalPlanejado: number;
  valorMensalDestinado: number;
  novoAporteMensal: number;
  prazoOriginalMeses: number | null;
  novoPrazoMeses: number | null;
  diferencaPrazoMeses: number | null;
  status: "normal" | "congelado";
  alertas: string[];
}

export interface ScenarioSummary {
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

export interface SimulationResult {
  parcelaMensal: number;
  mesesAfetados: string[];
  budgetImpacts: BudgetImpact[];
  goalImpacts: GoalImpact[];
  monthlyImpacts: MonthlyImpact[];
  resumoImpacto: ScenarioSummary;
}
