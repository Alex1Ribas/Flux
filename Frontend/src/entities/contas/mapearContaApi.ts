import type { ContaApi } from "@/api";
import type { Conta } from "@/types/flux";

export function mapearContaApi(conta: ContaApi): Conta {
  return {
    id: conta._id,
    tipo: conta.tipo,
    descricao: conta.descricao,
    valor: Number(conta.valor) || 0,
    competencia: conta.competencia || conta.vencimento.slice(0, 7),
    vencimento: conta.vencimento,
    caixaId: conta.caixaId,
    status: conta.status,
    recorrenteId: conta.recorrenteId,
    liquidadoEm: conta.liquidadoEm,
    lancamentoId: conta.lancamentoId,
  };
}
