import { useEffect, useMemo, useState } from "react";

import { useSincronizarRemoto } from "@/entities/sincronizacao";
import { useStore } from "@/entities/store";
import { useCompetenciaNavegavel } from "@/hooks";
import {
  montarResumoCategoriasMes,
  type ResumoCategoriaMes,
} from "@/service/painel/agruparCategoriasMes";
import type { Lancamento } from "@/types/flux";

export function usePainel() {
  const { token, sincronizar } = useSincronizarRemoto();
  const { lancamentos } = useStore();
  const { competencia, irMesAnterior, irMesSeguinte } = useCompetenciaNavegavel();
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<ResumoCategoriaMes | null>(
    null
  );

  useEffect(() => {
    if (!token) return;
    void sincronizar();
  }, [competencia, sincronizar, token]);

  const categorias = useMemo(
    () => montarResumoCategoriasMes(lancamentos, competencia),
    [competencia, lancamentos]
  );

  const abrirExtrato = (categoria: ResumoCategoriaMes) => {
    setCategoriaSelecionada(categoria);
  };

  const fecharExtrato = () => {
    setCategoriaSelecionada(null);
  };

  const lancamentosExtrato: Lancamento[] = categoriaSelecionada?.lancamentos ?? [];

  return {
    competencia,
    irMesAnterior,
    irMesSeguinte,
    categorias,
    categoriaSelecionada,
    lancamentosExtrato,
    abrirExtrato,
    fecharExtrato,
  };
}
