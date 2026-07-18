import type { ItemRecorrente, Lancamento, TipoLancamento } from "@/types/flux";

export function obterCaixaIdDoLancamento(lancamento: Lancamento): string {
  if (lancamento.tipo === "entrada") {
    return lancamento.distribuicao?.[0]?.caixa ?? "";
  }
  return lancamento.caixaOrigem ?? "";
}

export function lancamentoParaItemRecorrente(lancamento: Lancamento): ItemRecorrente {
  return {
    id: lancamento.id,
    nome: lancamento.descricao,
    tipo: lancamento.tipo,
    valor: Number(lancamento.valor) || 0,
    caixaId: obterCaixaIdDoLancamento(lancamento),
    competenciaInicial: lancamento.competenciaInicial ?? lancamento.competencia.slice(0, 7),
    duracaoMeses: Math.max(1, Number(lancamento.duracaoMeses) || 1),
    ativo: lancamento.ativo !== false,
  };
}

export function filtrarItensRecorrentes(lancamentos: Lancamento[]): ItemRecorrente[] {
  return lancamentos
    .filter((lancamento) => Boolean(lancamento.recorrente))
    .map(lancamentoParaItemRecorrente);
}

export function montarPayloadLancamentoRecorrente(dados: {
  nome: string;
  tipo: TipoLancamento;
  valor: number;
  caixaId: string;
  competenciaInicial: string;
  duracaoMeses: number;
  ativo?: boolean;
}) {
  const base = {
    horizonte: "futuro" as const,
    valor: dados.valor,
    descricao: dados.nome,
    competencia: dados.competenciaInicial,
    recorrente: true,
    competenciaInicial: dados.competenciaInicial,
    duracaoMeses: dados.duracaoMeses,
    ativo: dados.ativo !== false,
  };

  if (dados.tipo === "entrada") {
    return {
      ...base,
      tipo: "entrada" as const,
      distribuicao: [{ caixa: dados.caixaId, valor: dados.valor }],
    };
  }

  return {
    ...base,
    tipo: "saida" as const,
    caixaOrigem: dados.caixaId,
  };
}
