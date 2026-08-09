import type { Conta, ContaInput, StatusConta, TipoConta, CaixaCatalogoItem } from "@/types/flux";
import { formatBRL, getDataAtual, getMesDeCompetencia } from "@/utils/helpers";
import {
  calcEstouroOrcamento,
  type EstouroOrcamento,
} from "@/service/inicio/movimentacao";

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
  caixaCompensacao: string;
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
    caixaCompensacao: "",
  };
}

export function obterLimiteOrcamentoLiquidacao(params: {
  caixaId: string;
  liquidadoEm: string;
  orcamentos: Record<string, Record<string, number>>;
  caixasCatalogo: CaixaCatalogoItem[];
}): number {
  const mes = getMesDeCompetencia(params.liquidadoEm);
  const orcamentoMes = params.orcamentos[mes]?.[params.caixaId];
  if (typeof orcamentoMes === "number" && orcamentoMes > 0) {
    return orcamentoMes;
  }
  const caixa = params.caixasCatalogo.find((item) => item.id === params.caixaId);
  return Number(caixa?.orcamentoMensal) || 0;
}

export function calcEstouroLiquidacaoConta(params: {
  conta: Conta;
  formulario: FormularioLiquidacaoConta;
  limiteOrcamento: number;
}): EstouroOrcamento {
  if (params.conta.tipo !== "a_pagar") {
    return { precisaCompensacao: false, estouro: 0 };
  }
  return calcEstouroOrcamento(
    "saida",
    "presente",
    Number(params.conta.valor),
    params.limiteOrcamento
  );
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
  formulario: FormularioLiquidacaoConta,
  estouro: EstouroOrcamento = { precisaCompensacao: false, estouro: 0 }
): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(formulario.liquidadoEm)) {
    return "Informe a data de liquidação no formato aaaa-mm-dd.";
  }
  if (!formulario.caixaId) {
    return "Selecione a caixa da liquidação.";
  }
  if (estouro.precisaCompensacao && !formulario.caixaCompensacao) {
    return `Estouro de ${formatBRL(estouro.estouro)}: escolha a caixa de compensação`;
  }
  if (
    estouro.precisaCompensacao &&
    formulario.caixaCompensacao &&
    formulario.caixaCompensacao === formulario.caixaId
  ) {
    return "A caixa de compensação deve ser diferente da caixa de origem.";
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
