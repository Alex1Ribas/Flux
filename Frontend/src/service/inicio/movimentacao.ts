import type { Horizonte, LancamentoInput, ParcelamentoInput } from "@/types/flux";
import { formatBRL, getMesAtual, getMesDeCompetencia, getMesesFuturos } from "@/utils/helpers";

export type ModoMovimentacao = "entrada" | "saida";
export type TipoRecorrenciaMovimentacao = "dividir" | "cheio";

export interface MovimentacaoHomeInput {
  modo: ModoMovimentacao;
  horizonte: Horizonte;
  valor: number;
  tipo: string;
  competencia: string;
  caixaSelecionada: string;
  caixaCompensacao?: string;
  orcamentoCaixa: number;
  parcelamentoAtivo: boolean;
  tipoRecorrencia: TipoRecorrenciaMovimentacao;
  parcelas: number;
  /** Quando true, o lançamento entra no planejamento de risco como recorrente. */
  recorrente?: boolean;
  competenciaInicial?: string;
  duracaoMeses?: number;
  mesesAbatidos?: number;
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
  if (estouro.precisaCompensacao && !input.caixaCompensacao) {
    return `Estouro de ${formatBRL(estouro.estouro)}: escolha a caixa de compensação`;
  }
  if (input.parcelamentoAtivo && input.modo === "saida" && input.parcelas <= 0) {
    return "Informe o número de parcelas";
  }
  return null;
}

function camposRecorrencia(input: MovimentacaoHomeInput) {
  if (!input.recorrente) return { recorrente: false as const };
  return {
    recorrente: true as const,
    competenciaInicial: input.competenciaInicial ?? getMesDeCompetencia(input.competencia),
    duracaoMeses: input.duracaoMeses ?? 1,
    ativo: true,
  };
}

function registrarParcelamentoDividido(
  input: MovimentacaoHomeInput,
  acoes: AcoesMovimentacao
): void {
  acoes.adicionarParcelamento({
    valorTotal: input.valor,
    parcelas: input.parcelas,
    primeiraCompetencia: getMesDeCompetencia(input.competencia),
    descricao: input.tipo,
    tipoDescricao: input.tipo,
    caixaOrigem: input.caixaSelecionada,
    recorrente: input.recorrente,
  });
}

function registrarParcelamentoValorCheio(
  input: MovimentacaoHomeInput,
  acoes: AcoesMovimentacao
): void {
  const mesInicio = getMesDeCompetencia(input.competencia);
  const meses = getMesesFuturos(mesInicio, input.parcelas);
  const mesAtual = getMesAtual();
  const recorrencia = camposRecorrencia(input);

  meses.forEach((mesCompetencia, indice) => {
    const horizonteParcela: Horizonte = mesCompetencia <= mesAtual ? "presente" : "futuro";
    acoes.adicionarLancamento({
      tipo: "saida",
      horizonte: horizonteParcela,
      valor: input.valor,
      descricao: input.tipo,
      observacao: `${input.tipo} (${indice + 1}/${input.parcelas})`,
      competencia: mesCompetencia,
      caixaOrigem: input.caixaSelecionada,
      ...recorrencia,
    });
  });
}

function registrarEntrada(input: MovimentacaoHomeInput, acoes: AcoesMovimentacao): void {
  acoes.adicionarLancamento({
    tipo: "entrada",
    horizonte: input.horizonte,
    valor: input.valor,
    descricao: input.tipo,
    competencia: input.competencia,
    distribuicao: [{ caixa: input.caixaSelecionada, valor: input.valor }],
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
  if (input.parcelamentoAtivo && input.modo === "saida") {
    if (input.tipoRecorrencia === "dividir") {
      registrarParcelamentoDividido(input, acoes);
    } else {
      registrarParcelamentoValorCheio(input, acoes);
    }
    return;
  }

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
  caixaCompensacao: string;
  orcamentoCaixa: number;
  parcelamentoAtivo: boolean;
  tipoRecorrencia: MovimentacaoHomeInput["tipoRecorrencia"];
  parcelas: string;
  recorrente?: boolean;
  competenciaInicial?: string;
  duracaoMeses?: number;
  mesesAbatidos?: string;
}): MovimentacaoHomeInput {
  return {
    modo: params.modo,
    horizonte: params.horizonte,
    valor: params.valor,
    tipo: params.tipo,
    competencia: params.competencia,
    caixaSelecionada: params.caixaSelecionada,
    caixaCompensacao: params.caixaCompensacao || undefined,
    orcamentoCaixa: params.orcamentoCaixa,
    parcelamentoAtivo: params.parcelamentoAtivo,
    tipoRecorrencia: params.tipoRecorrencia,
    parcelas: Number(params.parcelas) || 0,
    recorrente: Boolean(params.recorrente),
    competenciaInicial: params.competenciaInicial,
    duracaoMeses: params.duracaoMeses,
    mesesAbatidos: params.mesesAbatidos ? Number(params.mesesAbatidos) || 1 : undefined,
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
