import type { Conta, ContaInput, StatusConta, TipoConta } from "@/types/flux";
import { getDataAtual, getMesDeCompetencia } from "@/utils/helpers";

export interface FormularioConta {
  tipo: TipoConta;
  descricao: string;
  valorTexto: string;
  vencimento: string;
  caixaId: string;
}

export interface FormularioLiquidacaoConta {
  liquidadoEm: string;
  caixaId: string;
}

export function montarFormularioConta(
  conta: Conta | null,
  caixaPadrao: string
): FormularioConta {
  if (!conta) {
    return {
      tipo: "a_pagar",
      descricao: "",
      valorTexto: "",
      vencimento: getDataAtual(),
      caixaId: caixaPadrao,
    };
  }

  return {
    tipo: conta.tipo,
    descricao: conta.descricao,
    valorTexto: String(conta.valor),
    vencimento: conta.vencimento,
    caixaId: conta.caixaId,
  };
}

export function montarFormularioLiquidacao(
  conta: Conta
): FormularioLiquidacaoConta {
  return {
    liquidadoEm: getDataAtual(),
    caixaId: conta.caixaId,
  };
}

export function validarFormularioConta(formulario: FormularioConta): string | null {
  if (!formulario.descricao.trim()) {
    return "Informe a descrição da conta.";
  }
  const valor = Number(formulario.valorTexto);
  if (!Number.isFinite(valor) || valor <= 0) {
    return "Informe um valor maior que zero.";
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(formulario.vencimento)) {
    return "Informe o vencimento no formato aaaa-mm-dd.";
  }
  if (!formulario.caixaId) {
    return "Selecione a caixa.";
  }
  return null;
}

export function validarFormularioLiquidacao(
  formulario: FormularioLiquidacaoConta
): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(formulario.liquidadoEm)) {
    return "Informe a data de liquidação no formato aaaa-mm-dd.";
  }
  if (!formulario.caixaId) {
    return "Selecione a caixa da liquidação.";
  }
  return null;
}

export function montarPayloadConta(formulario: FormularioConta): ContaInput {
  return {
    tipo: formulario.tipo,
    descricao: formulario.descricao.trim(),
    valor: Number(formulario.valorTexto),
    vencimento: formulario.vencimento,
    competencia: formulario.vencimento.slice(0, 7),
    caixaId: formulario.caixaId,
  };
}

export function competenciaDaConta(conta: Conta): string {
  return getMesDeCompetencia(conta.competencia || conta.vencimento);
}

export function listarContasAbertasDoMes(
  competencia: string,
  contas: Conta[]
): Conta[] {
  const mes = getMesDeCompetencia(competencia);
  return contas.filter(
    (conta) => conta.status === "aberta" && competenciaDaConta(conta) === mes
  );
}

export function filtrarContasPorStatus(
  contas: Conta[],
  status: StatusConta | "todas"
): Conta[] {
  if (status === "todas") return contas;
  return contas.filter((conta) => conta.status === status);
}

export function rotuloTipoConta(tipo: TipoConta): string {
  if (tipo === "a_pagar") return "A pagar";
  return "A receber";
}

export function rotuloStatusConta(status: StatusConta): string {
  if (status === "aberta") return "Aberta";
  if (status === "liquidada") return "Liquidada";
  return "Cancelada";
}
