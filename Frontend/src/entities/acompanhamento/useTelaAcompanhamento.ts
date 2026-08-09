import { useAcompanhamentoApi } from "./useAcompanhamentoApi";
import { useCompetenciaNavegavel } from "@/hooks";

export function useTelaAcompanhamento() {
  const { competencia, irMesAnterior, irMesSeguinte } = useCompetenciaNavegavel();
  const { dados, carregando, erro, recarregar } = useAcompanhamentoApi(competencia);

  return {
    competencia,
    dados,
    carregando,
    erro,
    recarregar,
    irMesAnterior,
    irMesSeguinte,
  };
}
