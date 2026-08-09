import type { ResumoCategoriaMes } from "@/service/painel/agruparCategoriasMes";
import type { ImpactoRisco, Lancamento } from "@/types/flux";

export interface ImpactoRiscoEnriquecido extends ImpactoRisco {
  categoria: ResumoCategoriaMes | null;
  quantidade: number | null;
  deltaPercentual: number | null;
  deltaQuantidade: number | null;
  tendenciaNegativa: boolean | null;
}

function chaveCategoria(lancamento: Lancamento): string {
  return `${lancamento.tipo}|${lancamento.descricao.trim().toLowerCase()}`;
}

export function enriquecerImpactosComCategorias(
  impactos: ImpactoRisco[],
  lancamentos: Lancamento[],
  categorias: ResumoCategoriaMes[]
): ImpactoRiscoEnriquecido[] {
  const mapaLancamentos = new Map(
    lancamentos.map((lancamento) => [lancamento.id, lancamento])
  );
  const mapaCategorias = new Map(
    categorias.map((categoria) => [categoria.chave, categoria])
  );

  return impactos.map((impacto) => {
    const lancamento = mapaLancamentos.get(impacto.id);
    if (!lancamento) {
      return {
        ...impacto,
        categoria: null,
        quantidade: null,
        deltaPercentual: null,
        deltaQuantidade: null,
        tendenciaNegativa: null,
      };
    }

    const categoria = mapaCategorias.get(chaveCategoria(lancamento)) ?? null;

    return {
      ...impacto,
      categoria,
      quantidade: categoria?.quantidade ?? null,
      deltaPercentual: categoria?.deltaPercentual ?? null,
      deltaQuantidade: categoria?.deltaQuantidade ?? null,
      tendenciaNegativa: categoria?.tendenciaNegativa ?? null,
    };
  });
}

export function montarCategoriaFallbackDoLancamento(
  lancamento: Lancamento
): ResumoCategoriaMes {
  return {
    chave: `fallback|${lancamento.id}`,
    nome: lancamento.descricao.trim() || "Lançamento",
    tipo: lancamento.tipo,
    quantidade: 1,
    total: Number(lancamento.valor),
    quantidadeAnterior: 0,
    totalAnterior: 0,
    deltaQuantidade: 0,
    deltaPercentual: 0,
    tendenciaNegativa: false,
    lancamentos: [lancamento],
  };
}
