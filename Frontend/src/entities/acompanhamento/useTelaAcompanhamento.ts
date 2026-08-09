import { useMemo, useState } from "react";

import { useAcompanhamentoApi } from "./useAcompanhamentoApi";
import { useStore } from "@/entities/store";
import { useCompetenciaNavegavel } from "@/hooks";
import {
  enriquecerImpactosComCategorias,
  montarCategoriaFallbackDoLancamento,
} from "@/service/acompanhamento/enriquecerImpactos";
import {
  montarResumoCategoriasMes,
  type ResumoCategoriaMes,
} from "@/service/painel/agruparCategoriasMes";
import type { Lancamento } from "@/types/flux";
import { somarCaixas } from "@/utils/helpers";

export function useTelaAcompanhamento() {
  const { competencia, irMesAnterior, irMesSeguinte } = useCompetenciaNavegavel();
  const { dados, carregando, atualizando, erro, recarregar } =
    useAcompanhamentoApi(competencia);
  const { lancamentos, caixas, caixasCatalogo } = useStore();

  const [compromissosExpandidos, setCompromissosExpandidos] = useState(false);
  const [impactosExpandidos, setImpactosExpandidos] = useState(false);
  const [categoriaSelecionada, setCategoriaSelecionada] =
    useState<ResumoCategoriaMes | null>(null);

  const totalDisponivel = useMemo(() => somarCaixas(caixas), [caixas]);

  const categorias = useMemo(
    () => montarResumoCategoriasMes(lancamentos, competencia),
    [competencia, lancamentos]
  );

  const impactosEnriquecidos = useMemo(
    () => enriquecerImpactosComCategorias(dados.impactos, lancamentos, categorias),
    [categorias, dados.impactos, lancamentos]
  );

  const abrirExtratoPorImpacto = (impactoId: string) => {
    const impacto = impactosEnriquecidos.find((item) => item.id === impactoId);
    if (impacto?.categoria) {
      setCategoriaSelecionada(impacto.categoria);
      return;
    }

    const lancamento = lancamentos.find((item) => item.id === impactoId);
    if (!lancamento) {
      return;
    }

    setCategoriaSelecionada(montarCategoriaFallbackDoLancamento(lancamento));
  };

  const fecharExtrato = () => {
    setCategoriaSelecionada(null);
  };

  const lancamentosExtrato: Lancamento[] = categoriaSelecionada?.lancamentos ?? [];

  return {
    competencia,
    dados,
    carregando,
    atualizando,
    erro,
    recarregar,
    irMesAnterior,
    irMesSeguinte,
    caixas,
    caixasCatalogo,
    totalDisponivel,
    impactosEnriquecidos,
    compromissosExpandidos,
    impactosExpandidos,
    alternarCompromissos: () => setCompromissosExpandidos((atual) => !atual),
    alternarImpactos: () => setImpactosExpandidos((atual) => !atual),
    categoriaSelecionada,
    lancamentosExtrato,
    abrirExtratoPorImpacto,
    fecharExtrato,
  };
}
