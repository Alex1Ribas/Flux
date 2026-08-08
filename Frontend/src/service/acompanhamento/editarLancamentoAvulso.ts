import type { LancamentoPayload } from "@/api/fluxApi";
import { derivarHorizonteDaData } from "@/service/inicio";
import type { Lancamento, TipoLancamento } from "@/types/flux";
import { getDataAtual } from "@/utils/helpers";

export interface FormularioLancamentoAvulso {
  valorTexto: string;
  descricao: string;
  competencia: string;
  caixaId: string;
  tipo: TipoLancamento;
}

const COMPETENCIA_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function obterCaixaDoLancamento(lancamento: Lancamento): string {
  if (lancamento.tipo === "entrada") {
    return lancamento.distribuicao?.[0]?.caixa ?? "";
  }
  return lancamento.caixaOrigem ?? "";
}

export function montarFormularioLancamentoAvulso(
  lancamento: Lancamento
): FormularioLancamentoAvulso {
  return {
    valorTexto: String(lancamento.valor),
    descricao: lancamento.descricao,
    competencia: lancamento.competencia,
    caixaId: obterCaixaDoLancamento(lancamento),
    tipo: lancamento.tipo,
  };
}

export function validarFormularioLancamentoAvulso(
  formulario: FormularioLancamentoAvulso
): string | null {
  const descricao = formulario.descricao.trim();
  if (!descricao) {
    return "Informe o motivo da movimentação";
  }

  const valor = Number(formulario.valorTexto);
  if (!formulario.valorTexto || Number.isNaN(valor) || valor <= 0) {
    return "Informe um valor válido";
  }

  if (!formulario.caixaId) {
    if (formulario.tipo === "entrada") {
      return "Selecione a caixa de destino";
    }
    return "Selecione a caixa de origem";
  }

  if (!COMPETENCIA_PATTERN.test(formulario.competencia)) {
    return "Data inválida (use AAAA-MM-DD)";
  }

  return null;
}

export function montarPayloadAtualizacaoAvulso(
  formulario: FormularioLancamentoAvulso,
  lancamentoOriginal: Lancamento
): Partial<LancamentoPayload> {
  const valor = Number(formulario.valorTexto);
  const descricao = formulario.descricao.trim();
  const competencia = formulario.competencia;
  const horizonte = derivarHorizonteDaData(competencia, getDataAtual());

  const payload: Partial<LancamentoPayload> = {
    tipo: formulario.tipo,
    valor,
    descricao,
    competencia,
    horizonte,
    recorrente: false,
  };

  if (formulario.tipo === "entrada") {
    payload.distribuicao = [{ caixa: formulario.caixaId, valor }];
    payload.caixaOrigem = undefined;
  } else {
    payload.caixaOrigem = formulario.caixaId;
    payload.distribuicao = undefined;
  }

  if (lancamentoOriginal.observacao !== undefined) {
    payload.observacao = lancamentoOriginal.observacao;
  }
  if (lancamentoOriginal.caixaCompensacao) {
    payload.caixaCompensacao = lancamentoOriginal.caixaCompensacao;
  }
  if (lancamentoOriginal.parcelaRef) {
    payload.parcelaRef = lancamentoOriginal.parcelaRef;
  }
  if (lancamentoOriginal.parcelaNum !== undefined) {
    payload.parcelaNum = lancamentoOriginal.parcelaNum;
  }
  if (lancamentoOriginal.totalParcelas !== undefined) {
    payload.totalParcelas = lancamentoOriginal.totalParcelas;
  }
  if (lancamentoOriginal.mesesAbatidos !== undefined) {
    payload.mesesAbatidos = lancamentoOriginal.mesesAbatidos;
  }

  return payload;
}
