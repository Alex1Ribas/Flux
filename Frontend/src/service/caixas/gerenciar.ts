import {
  limiteDiarioOrcamento,
  limiteSemanalOrcamento,
  prazoEstimadoMeses,
} from "@/shared/catalogoCaixas";
import type {
  CaixaCatalogoItem,
  Caixas,
  Lancamento,
  Orcamentos,
  TipoCaixa,
} from "@/types/flux";
import { getDiasNoMes, getMesAtual } from "@/utils/helpers";

export interface FormularioCaixaInput {
  nome: string;
  tipo: TipoCaixa;
  saldoTexto: string;
  metaTexto: string;
  aporteMensalTexto: string;
  orcamentoMensalTexto: string;
}

export function montarFormularioCaixa(
  caixaId: string | null,
  catalogo: CaixaCatalogoItem[],
  caixas: Caixas,
  _orcamentos: Orcamentos,
  _competencia: string
): FormularioCaixaInput {
  if (!caixaId) {
    return {
      nome: "",
      tipo: "orcamento",
      saldoTexto: "",
      metaTexto: "",
      aporteMensalTexto: "",
      orcamentoMensalTexto: "",
    };
  }

  const caixa = catalogo.find((item) => item.id === caixaId);

  return {
    nome: caixa?.nome ?? "",
    tipo: caixa?.tipo ?? "orcamento",
    saldoTexto: String(caixas[caixaId] ?? ""),
    metaTexto: caixa?.meta !== undefined ? String(caixa.meta) : "",
    aporteMensalTexto: caixa?.aporteMensal !== undefined ? String(caixa.aporteMensal) : "",
    orcamentoMensalTexto:
      caixa?.orcamentoMensal !== undefined ? String(caixa.orcamentoMensal) : "",
  };
}

export function validarFormularioCaixa(
  input: FormularioCaixaInput,
  catalogo: CaixaCatalogoItem[],
  caixaIdEdicao: string | null
): string | null {
  const nome = input.nome.trim();
  if (!nome) return "Informe o nome da caixa";

  const nomeDuplicado = catalogo.some(
    (item) => item.nome.toLowerCase() === nome.toLowerCase() && item.id !== caixaIdEdicao
  );
  if (nomeDuplicado) return "Já existe uma caixa com este nome";

  const saldo = Number(input.saldoTexto);
  if (input.saldoTexto && Number.isNaN(saldo)) return "Saldo inválido";

  if (input.tipo === "objetivo") {
    const meta = Number(input.metaTexto);
    const aporte = Number(input.aporteMensalTexto);
    if (!input.metaTexto || Number.isNaN(meta) || meta <= 0) {
      return "Informe a meta (maior que zero)";
    }
    if (!input.aporteMensalTexto || Number.isNaN(aporte) || aporte <= 0) {
      return "Informe o aporte mensal (maior que zero)";
    }
    return null;
  }

  const orcamento = Number(input.orcamentoMensalTexto);
  if (!input.orcamentoMensalTexto || Number.isNaN(orcamento) || orcamento <= 0) {
    return "Informe o orçamento mensal (maior que zero)";
  }

  return null;
}

export function calcularPreviewPrazo(input: FormularioCaixaInput): number {
  if (input.tipo !== "objetivo") return 0;
  return prazoEstimadoMeses(Number(input.metaTexto) || 0, Number(input.aporteMensalTexto) || 0);
}

export function calcularLimitesOrcamento(orcamentoMensal: number, competencia: string) {
  const dias = getDiasNoMes(competencia);
  return {
    diario: limiteDiarioOrcamento(orcamentoMensal, dias),
    semanal: limiteSemanalOrcamento(orcamentoMensal),
  };
}

export function validarExclusaoCaixa(
  caixaId: string,
  catalogo: CaixaCatalogoItem[],
  lancamentos: Lancamento[]
): string | null {
  if (catalogo.length <= 1) {
    return "É necessário manter pelo menos uma caixa";
  }

  const emUso = lancamentos.some(
    (lancamento) =>
      lancamento.caixaOrigem === caixaId ||
      lancamento.distribuicao?.some((item) => item.caixa === caixaId)
  );

  if (emUso) {
    return "Esta caixa possui lançamentos e não pode ser excluída";
  }

  return null;
}

export function obterCompetenciaAtual(): string {
  return getMesAtual();
}
