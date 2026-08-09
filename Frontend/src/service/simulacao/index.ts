import type {
  CompensationSource,
  ModoCompensacaoSimulacao,
} from "@/types/flux";

export interface SimulacaoPayloadForm {
  valorTotal: number;
  duracaoMeses: number;
  dataPrimeiroPagamento: string;
  modoCompensacao: ModoCompensacaoSimulacao;
  fontesDeCompensacao: CompensationSource[];
}

export function parseNumero(valor: string): number {
  if (!valor?.trim()) return 0;
  return Number(valor.replace(",", ".")) || 0;
}

export function round2(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

export function calcularParcelaMensal(
  valorTotalTexto: string,
  duracaoMesesTexto: string,
): number {
  const total = parseNumero(valorTotalTexto);
  const duracao = parseNumero(duracaoMesesTexto);
  if (total <= 0 || duracao < 1) return 0;
  return round2(total / duracao);
}

export function validarFormularioSimulacao(
  payload: SimulacaoPayloadForm,
  parcelaMensal: number,
): string[] {
  const erros: string[] = [];
  if (payload.valorTotal <= 0) erros.push("Informe um valor total maior que zero.");
  if (payload.duracaoMeses < 1) erros.push("Informe duração em meses de pelo menos 1.");
  if (!payload.dataPrimeiroPagamento) erros.push("Informe a data do primeiro pagamento.");
  if (parcelaMensal <= 0) erros.push("A parcela mensal precisa ser maior que zero.");

  if (payload.modoCompensacao === "declarada") {
    if (payload.fontesDeCompensacao.length === 0) {
      erros.push("No modo declarado, informe ao menos uma fonte de compensação.");
    }
    const totalFontes = payload.fontesDeCompensacao.reduce(
      (total, fonte) => total + fonte.valorMensalDestinado,
      0,
    );
    if (round2(totalFontes) !== round2(parcelaMensal)) {
      erros.push("A soma das fontes deve ser igual ao valor da parcela mensal.");
    }
    if (
      payload.fontesDeCompensacao.some(
        (fonte) => fonte.valorMensalDestinado < 0 || !fonte.origemId,
      )
    ) {
      erros.push("Revise as fontes: origem obrigatória e valor mensal não pode ser negativo.");
    }
  }

  return erros;
}
