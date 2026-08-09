import { useAcompanhamentoApi } from "./useAcompanhamentoApi";
import { useCompetenciaNavegavel } from "@/hooks";

export function useTelaAcompanhamento() {
  const { competencia, irMesAnterior, irMesSeguinte } = useCompetenciaNavegavel();
  const { dados, carregando, atualizando, erro, recarregar } =
    useAcompanhamentoApi(competencia);

  return {
    competencia,
    dados,
    carregando,
    atualizando,
    erro,
    recarregar,
    irMesAnterior,
    irMesSeguinte,
  };
}
