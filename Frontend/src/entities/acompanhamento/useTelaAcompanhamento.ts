import { useMemo } from "react";

import { useStore } from "@/entities/store";
import { useCompetenciaNavegavel } from "@/hooks";
import { montarAcompanhamentoMes } from "@/service/acompanhamento";
import type { AcompanhamentoMes } from "@/types/flux";

export function useTelaAcompanhamento() {
  const { competencia, irMesAnterior, irMesSeguinte } = useCompetenciaNavegavel();
  const { lancamentos, contas, limitesRisco } = useStore();

  const dados: AcompanhamentoMes = useMemo(
    () => montarAcompanhamentoMes(competencia, lancamentos, limitesRisco.global, contas),
    [competencia, lancamentos, limitesRisco.global, contas]
  );

  return {
    competencia,
    dados,
    irMesAnterior,
    irMesSeguinte,
  };
}
