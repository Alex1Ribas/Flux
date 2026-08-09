import { useMemo, useState } from "react";

import { useStore } from "@/entities/store";
import { useCompetenciaNavegavel } from "@/hooks";
import { montarAcompanhamentoMes } from "@/service/acompanhamento";
import {
  montarResumoCategoriasMes,
  type ResumoCategoriaMes,
} from "@/service/painel/agruparCategoriasMes";
import type { AcompanhamentoMes, Lancamento } from "@/types/flux";
import { somarCaixas } from "@/utils/helpers";

export function usePainel() {
  const { lancamentos, caixas, caixasCatalogo, limitesRisco, contas } = useStore();
  const { competencia, irMesAnterior, irMesSeguinte } = useCompetenciaNavegavel();
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

  const saudeMes: AcompanhamentoMes = useMemo(
    () => montarAcompanhamentoMes(competencia, lancamentos, limitesRisco.global, contas),
    [competencia, lancamentos, limitesRisco.global, contas]
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
    caixas,
    caixasCatalogo,
    totalDisponivel,
    saudeMes,
    categorias,
    categoriasSaida,
    categoriasEntrada,
    categoriaSelecionada,
    lancamentosExtrato,
    abrirExtrato,
    fecharExtrato,
  };
}
