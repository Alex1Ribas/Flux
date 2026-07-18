import { caixasApi, lancamentosApi, orcamentosApi, preferenciasApi } from "@/api";
import { CAIXAS_PADRAO } from "@/shared/catalogoCaixas";
import { getMesAtual } from "@/utils/helpers";

export async function carregarDadosFinanceApi(token: string) {
  const competencia = getMesAtual();
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

  const [lancamentos, orcamentos, preferencias] = await Promise.all([
    lancamentosApi.listar(token),
    orcamentosApi.listar(token, competencia),
    preferenciasApi.obter(token),
  ]);

  return { caixas, lancamentos, orcamentos, preferencias };
}
