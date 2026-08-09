import { caixasApi, contasApi, lancamentosApi, orcamentosApi, preferenciasApi, type ContaApi } from "@/api";
import { CAIXAS_PADRAO } from "@/shared/catalogoCaixas";
import { getMesAtual } from "@/utils/helpers";

const CONTAS_SYNC_PAGE_SIZE = 100;

async function listarTodasContas(token: string): Promise<ContaApi[]> {
  const items: ContaApi[] = [];
  let lastItemId: string | undefined;
  let hasMore = true;

  while (hasMore) {
    const page = await contasApi.listar(token, {
      pageSize: CONTAS_SYNC_PAGE_SIZE,
      lastItemId,
    });
    items.push(...page.items);
    hasMore = page.hasMore;
    if (!page.lastItemId) {
      break;
    }
    lastItemId = page.lastItemId;
  }

  return items;
}

async function garantirCaixas(token: string) {
  let caixas = await caixasApi.listar(token);

  if (caixas.length === 0) {
    caixas = await Promise.all(
      CAIXAS_PADRAO.map((caixa) =>
        caixasApi.criar(token, {
          nome: caixa.nome,
          saldo: 0,
          tipo: caixa.tipo ?? "orcamento",
          meta: caixa.meta,
          aporteMensal: caixa.aporteMensal,
          orcamentoMensal: caixa.orcamentoMensal,
        })
      )
    );
  }

  return caixas;
}

export async function carregarDadosFinanceApi(token: string) {
  const competencia = getMesAtual();

  const [caixas] = await Promise.all([
    garantirCaixas(token),
    contasApi.sincronizarRecorrentes(token),
  ]);

  const [lancamentos, orcamentos, preferencias, contas] = await Promise.all([
    lancamentosApi.listar(token),
    orcamentosApi.listar(token, competencia),
    preferenciasApi.obter(token),
    listarTodasContas(token),
  ]);

  return {
    caixas,
    lancamentos,
    orcamentos,
    preferencias,
    contas,
  };
}
