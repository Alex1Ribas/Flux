import type { MovimentacaoHomeInput } from "@/service/inicio/movimentacao";
import { calcEstouroOrcamento } from "@/service/inicio/movimentacao";
import { criarLancamentosParcelamento } from "@/service/store/lancamentos";
import type { LancamentoInput, ParcelamentoInput } from "@/types/flux";
import { gerarId } from "@/utils/helpers";

import { lancamentosApi, type LancamentoPayload } from "./fluxApi";

export function lancamentoInputParaPayload(input: LancamentoInput): LancamentoPayload {
  return {
    tipo: input.tipo,
    horizonte: input.horizonte,
    valor: input.valor,
    descricao: input.descricao,
    competencia: input.competencia,
    observacao: input.observacao,
    caixaOrigem: input.caixaOrigem,
    caixaCompensacao: input.caixaCompensacao,
    distribuicao: input.distribuicao,
    parcelaRef: input.parcelaRef,
    parcelaNum: input.parcelaNum,
    totalParcelas: input.totalParcelas,
    recorrente: Boolean(input.recorrente),
    competenciaInicial: input.competenciaInicial,
    duracaoMeses: input.duracaoMeses,
    ativo: input.ativo,
    mesesAbatidos: input.mesesAbatidos,
  };
}

async function criarLancamento(token: string, input: LancamentoInput): Promise<void> {
  await lancamentosApi.criar(token, lancamentoInputParaPayload(input));
}

export async function enviarParcelamentoNaApi(
  token: string,
  dados: ParcelamentoInput
): Promise<void> {
  const referencia = gerarId();
  const lancamentos = criarLancamentosParcelamento(dados, referencia);

  for (const lancamento of lancamentos) {
    await criarLancamento(token, lancamento);
  }
}

export async function enviarMovimentacaoHomeNaApi(
  token: string,
  input: MovimentacaoHomeInput
): Promise<void> {
  if (input.modo === "entrada") {
    const criados = await lancamentosApi.criar(token, {
      tipo: "entrada",
      horizonte: input.horizonte,
      valor: input.valor,
      descricao: input.tipo,
      competencia: input.competencia,
      caixaOrigem: input.caixaSelecionada,
      recorrente: Boolean(input.recorrente),
      competenciaInicial: input.competenciaInicial,
      duracaoMeses: input.duracaoMeses,
      ativo: input.recorrente ? true : undefined,
      mesesAbatidos: input.horizonte === "presente" ? input.mesesAbatidos : undefined,
    });
    const entrada = criados[0];
    if (
      entrada &&
      input.horizonte === "presente" &&
      input.caixaDestino
    ) {
      await lancamentosApi.distribuir(token, entrada._id, {
        itens: [{ caixa: input.caixaDestino, valor: input.valor }],
      });
    }
    return;
  }

  const estouro = calcEstouroOrcamento(
    input.modo,
    input.horizonte,
    input.valor,
    input.orcamentoCaixa
  );

  await criarLancamento(token, {
    tipo: "saida",
    horizonte: input.horizonte,
    valor: input.valor,
    descricao: input.tipo,
    competencia: input.competencia,
    meioPagamento: input.meioPagamento,
    caixaOrigem: input.caixaSelecionada,
    caixaCompensacao: estouro.precisaCompensacao ? input.caixaCompensacao : undefined,
    recorrente: Boolean(input.recorrente),
    competenciaInicial: input.competenciaInicial,
    duracaoMeses: input.duracaoMeses,
    ativo: input.recorrente ? true : undefined,
    mesesAbatidos: input.horizonte === "presente" ? input.mesesAbatidos : undefined,
  });
}
