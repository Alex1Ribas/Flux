import type { CaixaCatalogoItem, Caixas, Orcamentos } from "@/types/flux";

export interface ConfiguracaoCaixasInput {
  competencia: string;
  valoresCaixa: Record<string, string>;
  valoresOrcamento: Record<string, string>;
}

export interface AcoesConfiguracaoCaixas {
  atualizarCaixa: (caixa: string, valor: string | number) => void;
  definirOrcamento: (competencia: string, caixa: string, valor: string | number) => void;
}

export function montarValoresCaixaTexto(
  caixas: Caixas,
  catalogo: CaixaCatalogoItem[]
): Record<string, string> {
  return Object.fromEntries(catalogo.map((caixa) => [caixa.id, String(caixas[caixa.id] ?? "")]));
}

export function montarValoresOrcamentoTexto(
  orcamentos: Orcamentos,
  competencia: string,
  catalogo: CaixaCatalogoItem[]
): Record<string, string> {
  const orcamentoMes = orcamentos[competencia] || {};
  return Object.fromEntries(
    catalogo.map((caixa) => [caixa.id, String(orcamentoMes[caixa.id] ?? "")])
  );
}

export function executarConfiguracaoCaixas(
  input: ConfiguracaoCaixasInput,
  acoes: AcoesConfiguracaoCaixas
): void {
  Object.entries(input.valoresCaixa).forEach(([caixaId, valorTexto]) => {
    acoes.atualizarCaixa(caixaId, valorTexto);
  });

  Object.entries(input.valoresOrcamento).forEach(([caixaId, valorTexto]) => {
    if (valorTexto) {
      acoes.definirOrcamento(input.competencia, caixaId, valorTexto);
    }
  });
}
