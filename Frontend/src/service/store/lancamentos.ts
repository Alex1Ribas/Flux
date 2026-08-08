import type { Caixas, LancamentoInput, ParcelamentoInput } from "@/types/flux";
import { getCompetenciasFuturas, getMesAtual, getMesDeCompetencia } from "@/utils/helpers";

export type OperacaoSaldoLancamento = "adicionar" | "remover";

export function aplicarLancamentoNosSaldos(
  caixasAtuais: Caixas,
  lancamento: LancamentoInput,
  operacao: OperacaoSaldoLancamento
): Caixas {
  const caixas = { ...caixasAtuais };
  if (lancamento.horizonte !== "presente") return caixas;

  const fator = operacao === "adicionar" ? 1 : -1;

  if (lancamento.tipo === "entrada" && lancamento.distribuicao?.length) {
    lancamento.distribuicao.forEach(({ caixa, valor }) => {
      caixas[caixa] = (caixas[caixa] || 0) + Number(valor) * fator;
    });
  } else if (lancamento.tipo === "saida" && lancamento.caixaOrigem) {
    caixas[lancamento.caixaOrigem] =
      (caixas[lancamento.caixaOrigem] || 0) - Number(lancamento.valor) * fator;
  }

  return caixas;
}

export function criarLancamentosParcelamento(
  dados: ParcelamentoInput,
  referenciaParcelamento: string,
  mesAtual = getMesAtual()
): LancamentoInput[] {
  const {
    valorTotal,
    parcelas,
    primeiraCompetencia,
    descricao,
    caixaOrigem,
    tipoDescricao,
    recorrente,
  } = dados;
  const totalParcelas = Number(parcelas);
  const valorParcela = Number(valorTotal) / totalParcelas;
  const competencias = getCompetenciasFuturas(primeiraCompetencia, totalParcelas);

  return competencias.map((competencia, indiceParcela) => {
    const mesCompetencia = getMesDeCompetencia(competencia);
    const horizonte = mesCompetencia <= mesAtual ? "presente" : "futuro";
    return {
      tipo: "saida" as const,
      horizonte,
      valor: valorParcela,
      descricao: tipoDescricao || descricao,
      observacao: `${descricao} (${indiceParcela + 1}/${parcelas})`,
      competencia,
      caixaOrigem,
      parcelaRef: referenciaParcelamento,
      parcelaNum: indiceParcela + 1,
      totalParcelas,
      recorrente: Boolean(recorrente),
    };
  });
}
