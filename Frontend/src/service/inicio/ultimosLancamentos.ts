import type { Lancamento } from "@/types/flux";
import { competenciaNoMes } from "@/utils/helpers";

export function listarUltimosLancamentosPresentes(
  lancamentos: Lancamento[],
  competencia: string,
  limite = 5
): Lancamento[] {
  return [...lancamentos]
    .filter(
      (lancamento) =>
        competenciaNoMes(lancamento.competencia, competencia) &&
        lancamento.horizonte === "presente" &&
        !lancamento.parcelaRef
    )
    .sort((lancamentoA, lancamentoB) => {
      const porData = lancamentoB.competencia.localeCompare(lancamentoA.competencia);
      if (porData !== 0) {
        return porData;
      }
      return lancamentoB.id.localeCompare(lancamentoA.id);
    })
    .slice(0, limite);
}
