import type { Lancamento } from "@/types/flux";
import { competenciaNoMes } from "@/utils/helpers";

export function listarUltimosLancamentosPresentes(
  lancamentos: Lancamento[],
  competencia: string,
  limite = 5
): Lancamento[] {
  return lancamentos
    .filter(
      (lancamento) =>
        competenciaNoMes(lancamento.competencia, competencia) &&
        lancamento.horizonte === "presente" &&
        !lancamento.parcelaRef
    )
    .slice(-limite)
    .reverse();
}
