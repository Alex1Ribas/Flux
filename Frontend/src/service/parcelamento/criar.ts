import type { ParcelamentoInput } from "@/types/flux";
import { formatBRL, getMesLabel, getMesesFuturos } from "@/utils/helpers";

export interface ParcelamentoFormInput {
  tipo: string;
  descricao: string;
  valorTotal: number;
  parcelas: number;
  primeiraCompetencia: string;
  caixaOrigem: string;
}

export interface ErrosParcelamento {
  tipo?: string;
  valor?: string;
  parcelas?: string;
  caixa?: string;
}

export interface PreviewParcelamento {
  valorParcela: number;
  parcelas: number;
  primeiraCompetenciaLabel: string;
  ultimaCompetenciaLabel: string;
}

export interface AcoesParcelamento {
  adicionarParcelamento: (dados: ParcelamentoInput) => void;
}

export function montarParcelamentoForm(params: {
  tipo: string;
  descricao: string;
  valorTotal: string;
  parcelas: string;
  primeiraCompetencia: string;
  caixaOrigem: string;
}): ParcelamentoFormInput {
  return {
    tipo: params.tipo,
    descricao: params.descricao,
    valorTotal: Number(params.valorTotal) || 0,
    parcelas: Number(params.parcelas) || 0,
    primeiraCompetencia: params.primeiraCompetencia,
    caixaOrigem: params.caixaOrigem,
  };
}

export function validarParcelamento(input: ParcelamentoFormInput): ErrosParcelamento {
  const erros: ErrosParcelamento = {};
  if (!input.tipo) erros.tipo = "Selecione o tipo";
  if (input.valorTotal <= 0) erros.valor = "Informe o valor total";
  if (input.parcelas <= 0) erros.parcelas = "Informe a quantidade de parcelas";
  if (!input.caixaOrigem) erros.caixa = "Selecione a caixa de origem";
  return erros;
}

export function temErrosParcelamento(erros: ErrosParcelamento): boolean {
  return Object.keys(erros).length > 0;
}

export function calcPreviewParcelamento(
  input: Pick<ParcelamentoFormInput, "valorTotal" | "parcelas" | "primeiraCompetencia">
): PreviewParcelamento | null {
  if (input.valorTotal <= 0 || input.parcelas <= 0) return null;

  const meses = getMesesFuturos(input.primeiraCompetencia, input.parcelas);
  return {
    valorParcela: input.valorTotal / input.parcelas,
    parcelas: input.parcelas,
    primeiraCompetenciaLabel: getMesLabel(input.primeiraCompetencia),
    ultimaCompetenciaLabel: getMesLabel(meses[input.parcelas - 1]),
  };
}

export function mensagemSucessoParcelamento(preview: PreviewParcelamento): string {
  return `${preview.parcelas}× de ${formatBRL(preview.valorParcela)} geradas com sucesso.`;
}

export function executarParcelamento(input: ParcelamentoFormInput, acoes: AcoesParcelamento): void {
  acoes.adicionarParcelamento({
    valorTotal: input.valorTotal,
    parcelas: input.parcelas,
    primeiraCompetencia: input.primeiraCompetencia,
    descricao: input.descricao || input.tipo,
    tipoDescricao: input.tipo,
    caixaOrigem: input.caixaOrigem,
  });
}

export function validarECriarParcelamento(
  input: ParcelamentoFormInput,
  acoes: AcoesParcelamento
): ErrosParcelamento | null {
  const erros = validarParcelamento(input);
  if (temErrosParcelamento(erros)) return erros;

  executarParcelamento(input, acoes);
  return null;
}
