import type { Horizonte, LancamentoInput, ParcelamentoInput } from "@/types/flux";
import { formatBRL } from "@/utils/helpers";

export type ModoMovimentacao = "entrada" | "saida";

export interface MovimentacaoHomeInput {
  modo: ModoMovimentacao;
  horizonte: Horizonte;
  valor: number;
  tipo: string;
  competencia: string;
  /** Entrada: caixa de origem. Saída: caixa de alocação. */
  caixaSelecionada: string;
  /** Entrada presente: caixa de alocação destino da distribuição. */
  caixaDestino?: string;
  caixaCompensacao?: string;
  orcamentoCaixa: number;
  /** Quando true, o lançamento entra no planejamento de risco como recorrente. */
  recorrente?: boolean;
  competenciaInicial?: string;
  duracaoMeses?: number;
  mesesAbatidos?: number;
  meioPagamento?: "caixa" | "cartao";
}

export interface EstouroOrcamento {
  precisaCompensacao: boolean;
  estouro: number;
}

export interface AcoesMovimentacao {
  adicionarLancamento: (lancamento: LancamentoInput) => string;
  adicionarParcelamento: (dados: ParcelamentoInput) => void;
}

export function calcEstouroOrcamento(
  modo: ModoMovimentacao,
  horizonte: Horizonte,
  valor: number,
  orcamentoCaixa: number
): EstouroOrcamento {
  const precisaCompensacao =
    modo === "saida" &&
    horizonte === "presente" &&
    valor > 0 &&
    orcamentoCaixa > 0 &&
    valor > orcamentoCaixa;

  return {
    precisaCompensacao,
    estouro: precisaCompensacao ? valor - orcamentoCaixa : 0,
  };
}

export function validarMovimentacaoHome(
  input: MovimentacaoHomeInput,
  estouro: EstouroOrcamento
): string | null {
  if (!input.tipo) {
    return "Selecione o motivo da movimentação";
  }
  if (input.valor <= 0) {
    return "Informe um valor válido";
  }
  if (input.modo === "entrada" && !input.caixaSelecionada) {
    return "Selecione a caixa de origem da receita";
  }
  if (
    input.modo === "entrada" &&
    input.horizonte === "presente" &&
    !input.caixaDestino
  ) {
    return "Selecione a caixa de alocação (destino)";
  }
  if (estouro.precisaCompensacao && !input.caixaCompensacao) {
    return `Estouro de ${formatBRL(estouro.estouro)}: escolha a caixa de compensação`;
  }
  return null;
}

function camposRecorrencia(input: MovimentacaoHomeInput) {
  if (!input.recorrente) return { recorrente: false as const };
  return {
    recorrente: true as const,
    competenciaInicial: input.competenciaInicial ?? input.competencia,
    duracaoMeses: input.duracaoMeses ?? 12,
    ativo: true,
  };
}

function registrarEntrada(input: MovimentacaoHomeInput, acoes: AcoesMovimentacao): void {
  acoes.adicionarLancamento({
    tipo: "entrada",
    horizonte: input.horizonte,
    valor: input.valor,
    descricao: input.tipo,
    competencia: input.competencia,
    caixaOrigem: input.caixaSelecionada,
    distribuicao: input.caixaDestino
      ? [{ caixa: input.caixaDestino, valor: input.valor }]
      : undefined,
    ...camposRecorrencia(input),
    mesesAbatidos: input.horizonte === "presente" ? input.mesesAbatidos : undefined,
  });
}

function registrarSaida(
  input: MovimentacaoHomeInput,
  estouro: EstouroOrcamento,
  acoes: AcoesMovimentacao
): void {
  const valorCaixaPrincipal = estouro.precisaCompensacao
    ? input.valor - estouro.estouro
    : input.valor;

  acoes.adicionarLancamento({
    tipo: "saida",
    horizonte: input.horizonte,
    valor: valorCaixaPrincipal,
    descricao: input.tipo,
    competencia: input.competencia,
    caixaOrigem: input.caixaSelecionada,
    ...camposRecorrencia(input),
    mesesAbatidos: input.horizonte === "presente" ? input.mesesAbatidos : undefined,
  });

  if (estouro.precisaCompensacao && input.caixaCompensacao) {
    acoes.adicionarLancamento({
      tipo: "saida",
      horizonte: "presente",
      valor: estouro.estouro,
      descricao: `Compensação (${input.tipo})`,
      competencia: input.competencia,
      caixaOrigem: input.caixaCompensacao,
      recorrente: false,
    });
  }
}

export function executarMovimentacaoHome(
  input: MovimentacaoHomeInput,
  acoes: AcoesMovimentacao
): void {
  if (input.modo === "entrada") {
    registrarEntrada(input, acoes);
    return;
  }

  const estouro = calcEstouroOrcamento(
    input.modo,
    input.horizonte,
    input.valor,
    input.orcamentoCaixa
  );
  registrarSaida(input, estouro, acoes);
}

export function montarMovimentacaoHome(params: {
  modo: MovimentacaoHomeInput["modo"];
  horizonte: MovimentacaoHomeInput["horizonte"];
  valor: number;
  tipo: string;
  competencia: string;
  caixaSelecionada: string;
  caixaDestino?: string;
  caixaCompensacao: string;
  orcamentoCaixa: number;
  recorrente?: boolean;
  competenciaInicial?: string;
  duracaoMeses?: number;
  mesesAbatidos?: number;
  meioPagamento?: "caixa" | "cartao";
}): MovimentacaoHomeInput {
  return {
    modo: params.modo,
    horizonte: params.horizonte,
    valor: params.valor,
    tipo: params.tipo,
    competencia: params.competencia,
    caixaSelecionada: params.caixaSelecionada,
    caixaDestino: params.caixaDestino,
    caixaCompensacao: params.caixaCompensacao || undefined,
    orcamentoCaixa: params.orcamentoCaixa,
    recorrente: Boolean(params.recorrente),
    competenciaInicial: params.competenciaInicial,
    duracaoMeses: params.duracaoMeses,
    mesesAbatidos: params.mesesAbatidos,
    meioPagamento: params.meioPagamento,
  };
}

export function validarERegistrarMovimentacaoHome(
  input: MovimentacaoHomeInput,
  acoes: AcoesMovimentacao
): string | null {
  const estouro = calcEstouroOrcamento(
    input.modo,
    input.horizonte,
    input.valor,
    input.orcamentoCaixa
  );
  const erro = validarMovimentacaoHome(input, estouro);
  if (erro) return erro;
  executarMovimentacaoHome(input, acoes);
  return null;
}
