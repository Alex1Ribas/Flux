import type { MovimentacaoHomeInput } from "@/service/inicio/movimentacao";
import { calcEstouroOrcamento } from "@/service/inicio/movimentacao";
import { criarLancamentosParcelamento } from "@/service/store/lancamentos";
import type { LancamentoInput, ParcelamentoInput } from "@/types/flux";
import {
  gerarId,
  getCompetenciasFuturas,
  getMesAtual,
  getMesDeCompetencia,
} from "@/utils/helpers";

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

async function enviarParcelamentoValorCheioNaApi(
  token: string,
  input: MovimentacaoHomeInput
): Promise<void> {
  const competencias = getCompetenciasFuturas(input.competencia, input.parcelas);
  const mesAtual = getMesAtual();

  for (let indice = 0; indice < competencias.length; indice++) {
    const competencia = competencias[indice];
    const mesCompetencia = getMesDeCompetencia(competencia);
    const horizonte = mesCompetencia <= mesAtual ? "presente" : "futuro";

    await criarLancamento(token, {
      tipo: "saida",
      horizonte,
      valor: input.valor,
      descricao: input.tipo,
      observacao: `${input.tipo} (${indice + 1}/${input.parcelas})`,
      competencia,
      caixaOrigem: input.caixaSelecionada,
      recorrente: Boolean(input.recorrente),
      competenciaInicial: input.competenciaInicial,
      duracaoMeses: input.duracaoMeses,
      ativo: input.recorrente ? true : undefined,
    });
  }
}

export async function enviarMovimentacaoHomeNaApi(
  token: string,
  input: MovimentacaoHomeInput
): Promise<void> {
  if (input.parcelamentoAtivo && input.modo === "saida") {
    if (input.tipoRecorrencia === "dividir") {
      await enviarParcelamentoNaApi(token, {
        valorTotal: input.valor,
        parcelas: input.parcelas,
        primeiraCompetencia: input.competencia,
        descricao: input.tipo,
        tipoDescricao: input.tipo,
        caixaOrigem: input.caixaSelecionada,
        recorrente: input.recorrente,
      });
      return;
    }

    await enviarParcelamentoValorCheioNaApi(token, input);
    return;
  }

  if (input.modo === "entrada") {
    await criarLancamento(token, {
      tipo: "entrada",
      horizonte: input.horizonte,
      valor: input.valor,
      descricao: input.tipo,
      competencia: input.competencia,
      distribuicao: [{ caixa: input.caixaSelecionada, valor: input.valor }],
      recorrente: Boolean(input.recorrente),
      competenciaInicial: input.competenciaInicial,
      duracaoMeses: input.duracaoMeses,
      ativo: input.recorrente ? true : undefined,
      mesesAbatidos: input.horizonte === "presente" ? input.mesesAbatidos : undefined,
    });
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
    caixaOrigem: input.caixaSelecionada,
    caixaCompensacao: estouro.precisaCompensacao ? input.caixaCompensacao : undefined,
    recorrente: Boolean(input.recorrente),
    competenciaInicial: input.competenciaInicial,
    duracaoMeses: input.duracaoMeses,
    ativo: input.recorrente ? true : undefined,
    mesesAbatidos: input.horizonte === "presente" ? input.mesesAbatidos : undefined,
  });
}
