import { useState } from "react";

import { getMesAtual, mesAnterior, mesSeguinte } from "@/utils/helpers";

export function useCompetenciaNavegavel(competenciaInicial = getMesAtual()) {
  const [competencia, setCompetencia] = useState(competenciaInicial);

  return {
    competencia,
    setCompetencia,
    irMesAnterior: () => setCompetencia((mes) => mesAnterior(mes)),
    irMesSeguinte: () => setCompetencia((mes) => mesSeguinte(mes)),
  };
}
