import type { Lancamento, TipoLancamento } from "@/types/flux";
import { competenciaNoMes, getMesDeCompetencia, mesAnterior } from "@/utils/helpers";

export interface ResumoCategoriaMes {
  chave: string;
  nome: string;
  tipo: TipoLancamento;
  quantidade: number;
  total: number;
  quantidadeAnterior: number;
  totalAnterior: number;
  deltaQuantidade: number;
  deltaPercentual: number;
  /** true quando a variação é desfavorável (mais gasto / menos receita). */
  tendenciaNegativa: boolean;
  lancamentos: Lancamento[];
}

function chaveCategoria(lancamento: Lancamento): string {
  return `${lancamento.tipo}|${lancamento.descricao.trim().toLowerCase()}`;
}

function agruparPorCategoria(
  lancamentos: Lancamento[],
  mes: string
): Map<string, { nome: string; tipo: TipoLancamento; itens: Lancamento[] }> {
  const mapa = new Map<string, { nome: string; tipo: TipoLancamento; itens: Lancamento[] }>();

  lancamentos
    .filter((lancamento) => competenciaNoMes(lancamento.competencia, mes))
    .forEach((lancamento) => {
      const chave = chaveCategoria(lancamento);
      const existente = mapa.get(chave);
      if (existente) {
        existente.itens.push(lancamento);
        return;
      }
      mapa.set(chave, {
        nome: lancamento.descricao.trim(),
        tipo: lancamento.tipo,
        itens: [lancamento],
      });
    });

  return mapa;
}

function ordenarCronologico(itens: Lancamento[]): Lancamento[] {
  return [...itens].sort((a, b) => {
    const porData = a.competencia.localeCompare(b.competencia);
    if (porData !== 0) return porData;
    return a.id.localeCompare(b.id);
  });
}

export function montarResumoCategoriasMes(
  lancamentos: Lancamento[],
  competencia: string
): ResumoCategoriaMes[] {
  const mes = getMesDeCompetencia(competencia);
  const mesPassado = mesAnterior(mes);
  const atual = agruparPorCategoria(lancamentos, mes);
  const anterior = agruparPorCategoria(lancamentos, mesPassado);
  const chaves = new Set([...atual.keys(), ...anterior.keys()]);

  const resumo: ResumoCategoriaMes[] = [];

  chaves.forEach((chave) => {
    const grupoAtual = atual.get(chave);
    const grupoAnterior = anterior.get(chave);
    if (!grupoAtual && !grupoAnterior) return;

    const nome = grupoAtual?.nome ?? grupoAnterior!.nome;
    const tipo = grupoAtual?.tipo ?? grupoAnterior!.tipo;
    const itens = ordenarCronologico(grupoAtual?.itens ?? []);
    const quantidade = itens.length;
    const total = itens.reduce((acc, item) => acc + Number(item.valor), 0);
    const itensAnteriores = grupoAnterior?.itens ?? [];
    const quantidadeAnterior = itensAnteriores.length;
    const totalAnterior = itensAnteriores.reduce(
      (acc, item) => acc + Number(item.valor),
      0
    );
    const deltaQuantidade = quantidade - quantidadeAnterior;
    const deltaPercentual =
      totalAnterior === 0
        ? total > 0
          ? 100
          : 0
        : ((total - totalAnterior) / totalAnterior) * 100;
    const tendenciaNegativa =
      tipo === "saida" ? deltaQuantidade > 0 || deltaPercentual > 0 : deltaQuantidade < 0 || deltaPercentual < 0;

    // Só lista categorias com movimento no mês selecionado
    if (quantidade === 0) return;

    resumo.push({
      chave,
      nome,
      tipo,
      quantidade,
      total,
      quantidadeAnterior,
      totalAnterior,
      deltaQuantidade,
      deltaPercentual,
      tendenciaNegativa,
      lancamentos: itens,
    });
  });

  return resumo.sort((a, b) => b.total - a.total);
}
