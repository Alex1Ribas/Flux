import { useMemo, useState } from "react";

import { useAcompanhamentoApi } from "@/entities/acompanhamento/useAcompanhamentoApi";
import { useStore } from "@/entities/store";
import { useCompetenciaNavegavel } from "@/hooks";
import {
  montarResumoCategoriasMes,
  type ResumoCategoriaMes,
} from "@/service/painel/agruparCategoriasMes";
import type { Lancamento } from "@/types/flux";
import { somarCaixas } from "@/utils/helpers";

export function usePainel() {
  const { lancamentos, caixas, caixasCatalogo } = useStore();
  const { competencia, irMesAnterior, irMesSeguinte } = useCompetenciaNavegavel();
  const {
    dados: saudeMes,
    carregando: carregandoSaude,
    atualizando: atualizandoSaude,
    erro: erroSaude,
    recarregar: recarregarSaude,
  } = useAcompanhamentoApi(competencia);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<ResumoCategoriaMes | null>(
    null
  );

  const categorias = useMemo(
    () => montarResumoCategoriasMes(lancamentos, competencia),
    [competencia, lancamentos]
  );

  const categoriasSaida = useMemo(
    () => categorias.filter((categoria) => categoria.tipo === "saida"),
    [categorias]
  );

  const categoriasEntrada = useMemo(
    () => categorias.filter((categoria) => categoria.tipo === "entrada"),
    [categorias]
  );

  const totalDisponivel = useMemo(() => somarCaixas(caixas), [caixas]);

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
    caixas,
    caixasCatalogo,
    totalDisponivel,
    saudeMes,
    carregandoSaude,
    atualizandoSaude,
    erroSaude,
    recarregarSaude,
    categorias,
    categoriasSaida,
    categoriasEntrada,
    categoriaSelecionada,
    lancamentosExtrato,
    abrirExtrato,
    fecharExtrato,
  };
}
