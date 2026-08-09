import { useEffect, useMemo } from "react";

import { useSincronizarRemoto } from "@/entities/sincronizacao";
import { useStore } from "@/entities/store";
import { useCompetenciaNavegavel } from "@/hooks";
import { montarAcompanhamentoMes } from "@/service/acompanhamento";
import type { AcompanhamentoMes } from "@/types/flux";

export function useTelaAcompanhamento() {
  const { token, sincronizar } = useSincronizarRemoto();
  const { competencia, irMesAnterior, irMesSeguinte } = useCompetenciaNavegavel();
  const { lancamentos, contas, limitesRisco } = useStore();

  useEffect(() => {
    if (!token) return;
    void sincronizar();
  }, [competencia, sincronizar, token]);

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
