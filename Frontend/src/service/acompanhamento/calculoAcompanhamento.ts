import { classificarPercentualPorLimites } from "@/service/risco";
import { LIMITES_RISCO_PADRAO } from "@/shared/limitesRisco";
import type {
  AcompanhamentoMes,
  CompromissoMes,
  ComposicaoRiscoDecisao,
  ImpactoRisco,
  Lancamento,
  LimitesRisco,
  PontoEvolucaoRisco,
  RiscoPrevisto,
  StatusRiscoMensal,
  TipoImpactoRisco,
} from "@/types/flux";
import {
  competenciaNoMes,
  getDiaCompetencia,
  getDiasNoMes,
  getMesDeCompetencia,
  getMesesFuturos,
} from "@/utils/helpers";

const ROTULOS_IMPACTO: Record<TipoImpactoRisco, string> = {
  despesa_futura: "Despesa avulsa",
  parcelamento: "Parcelamento",
  renda_extra: "Entrada avulsa",
  realizacao: "Compromisso realizado",
  abatimento: "Abatimento",
  outro: "Movimentação",
};

function montarRisco(entradaPrevista: number, comprometido: number): RiscoPrevisto {
  const risco = entradaPrevista > 0 ? (comprometido / entradaPrevista) * 100 : 0;
  return { entradaPrevista, comprometido, risco };
}

function riscoSobreBase(comprometido: number, entradaBase: number): number {
  return entradaBase > 0 ? (comprometido / entradaBase) * 100 : 0;
}

/** Recorrente ativo cujo período cobre o mês (coleção única + flag recorrente). */
export function lancamentoRecorrenteAtivoNoMes(
  lancamento: Lancamento,
  mes: string
): boolean {
  if (!lancamento.recorrente) return false;
  if (lancamento.ativo === false) return false;

  const inicio = getMesDeCompetencia(
    lancamento.competenciaInicial ?? lancamento.competencia
  );
  const duracao = Math.max(1, Number(lancamento.duracaoMeses) || 1);
  return getMesesFuturos(inicio, duracao).includes(mes);
}

export function listarRecorrentesDoMes(
  competencia: string,
  lancamentos: Lancamento[]
): Lancamento[] {
  const mes = getMesDeCompetencia(competencia);
  const porChave = new Map<string, Lancamento>();

  lancamentos.forEach((lancamento) => {
    if (!lancamentoRecorrenteAtivoNoMes(lancamento, mes)) return;
    const chave = `${lancamento.descricao}|${lancamento.tipo}`;
    porChave.set(chave, lancamento);
  });

  return [...porChave.values()];
}

export function listarAvulsosDoMes(
  competencia: string,
  lancamentos: Lancamento[]
): Lancamento[] {
  const mes = getMesDeCompetencia(competencia);
  return lancamentos
    .filter(
      (lancamento) =>
        !lancamento.recorrente && competenciaNoMes(lancamento.competencia, mes)
    )
    .sort(
      (a, b) => getDiaCompetencia(a.competencia) - getDiaCompetencia(b.competencia)
    );
}

export function calcRiscoPrevistoDaColecao(
  competencia: string,
  lancamentos: Lancamento[]
): RiscoPrevisto {
  let entradaPrevista = 0;
  let comprometido = 0;

  listarRecorrentesDoMes(competencia, lancamentos).forEach((lancamento) => {
    const valor = Number(lancamento.valor);
    if (lancamento.tipo === "entrada") entradaPrevista += valor;
    else comprometido += valor;
  });

  return montarRisco(entradaPrevista, comprometido);
}

function comprometidoAvulsoAteDia(
  competencia: string,
  lancamentos: Lancamento[],
  dia: number
): number {
  const mes = getMesDeCompetencia(competencia);
  return lancamentos
    .filter((lancamento) => {
      if (lancamento.recorrente) return false;
      if (!competenciaNoMes(lancamento.competencia, mes)) return false;
      return getDiaCompetencia(lancamento.competencia) <= dia;
    })
    .reduce((total, lancamento) => {
      const valor = Number(lancamento.valor);
      return lancamento.tipo === "saida" ? total + valor : total - valor;
    }, 0);
}

export function classificarStatusRiscoMensal(
  percentualRisco: number,
  limites: LimitesRisco
): StatusRiscoMensal {
  return classificarPercentualPorLimites(percentualRisco, limites);
}

export function calcEvolucaoRiscoMes(
  competencia: string,
  lancamentos: Lancamento[]
): PontoEvolucaoRisco[] {
  const mes = getMesDeCompetencia(competencia);
  const diasNoMes = getDiasNoMes(mes);
  const previsto = calcRiscoPrevistoDaColecao(mes, lancamentos);
  const pontos: PontoEvolucaoRisco[] = [];

  for (let dia = 1; dia <= diasNoMes; dia++) {
    const avulso = comprometidoAvulsoAteDia(mes, lancamentos, dia);
    const comprometidoReal = Math.max(0, previsto.comprometido + avulso);
    const riscoEsperado = previsto.risco;
    const riscoReal = riscoSobreBase(comprometidoReal, previsto.entradaPrevista);
    pontos.push({
      dia,
      label: String(dia),
      riscoEsperado,
      riscoReal,
      diferencial: riscoReal - riscoEsperado,
    });
  }

  return pontos;
}

export function calcCompromissosMes(
  competencia: string,
  lancamentos: Lancamento[]
): CompromissoMes[] {
  return listarRecorrentesDoMes(competencia, lancamentos)
    .map((lancamento) => ({
      id: lancamento.id,
      descricao: lancamento.descricao,
      tipo: lancamento.tipo,
      valor: Number(lancamento.valor),
    }))
    .sort((a, b) => {
      if (a.tipo !== b.tipo) return a.tipo === "entrada" ? -1 : 1;
      return b.valor - a.valor;
    });
}

export function calcComposicaoRisco(
  competencia: string,
  lancamentos: Lancamento[]
): ComposicaoRiscoDecisao[] {
  const previsto = calcRiscoPrevistoDaColecao(competencia, lancamentos);
  if (previsto.comprometido <= 0) return [];

  const totais = new Map<string, number>();
  listarRecorrentesDoMes(competencia, lancamentos)
    .filter((lancamento) => lancamento.tipo === "saida")
    .forEach((lancamento) => {
      totais.set(
        lancamento.descricao,
        (totais.get(lancamento.descricao) ?? 0) + Number(lancamento.valor)
      );
    });

  return [...totais.entries()]
    .map(([descricao, valor]) => ({
      descricao,
      valor,
      percentual: (valor / previsto.comprometido) * 100,
    }))
    .sort((a, b) => b.valor - a.valor);
}

function classificarTipoImpacto(lancamento: Lancamento): TipoImpactoRisco {
  if (lancamento.parcelaRef) return "parcelamento";
  if (lancamento.tipo === "entrada") return "renda_extra";
  if (lancamento.tipo === "saida") return "despesa_futura";
  return "outro";
}

export function calcImpactosRisco(
  competencia: string,
  lancamentos: Lancamento[]
): ImpactoRisco[] {
  const previsto = calcRiscoPrevistoDaColecao(competencia, lancamentos);
  const avulsos = listarAvulsosDoMes(competencia, lancamentos);

  const impactos: ImpactoRisco[] = [];
  let comprometidoAcumulado = previsto.comprometido;
  let riscoAnterior = previsto.risco;

  avulsos.forEach((lancamento) => {
    const valor = Number(lancamento.valor);
    comprometidoAcumulado += lancamento.tipo === "saida" ? valor : -valor;
    const riscoAtual = riscoSobreBase(
      Math.max(0, comprometidoAcumulado),
      previsto.entradaPrevista
    );
    const delta = riscoAtual - riscoAnterior;

    impactos.push({
      id: lancamento.id,
      descricao: lancamento.descricao,
      tipo: classificarTipoImpacto(lancamento),
      valor,
      impactoRisco: delta,
      competencia: lancamento.competencia,
      direcao: delta >= 0 ? "aumenta" : "reduz",
    });
    riscoAnterior = riscoAtual;
  });

  return impactos;
}

export function montarAcompanhamentoMes(
  competencia: string,
  lancamentos: Lancamento[],
  limites: LimitesRisco = LIMITES_RISCO_PADRAO
): AcompanhamentoMes {
  const mes = getMesDeCompetencia(competencia);
  const risco = calcRiscoPrevistoDaColecao(mes, lancamentos);
  const avulsos = listarAvulsosDoMes(mes, lancamentos);
  const saidasAvulsas = avulsos
    .filter((l) => l.tipo === "saida")
    .reduce((t, l) => t + Number(l.valor), 0);
  const entradasAvulsas = avulsos
    .filter((l) => l.tipo === "entrada")
    .reduce((t, l) => t + Number(l.valor), 0);
  const diferencialValor = saidasAvulsas - entradasAvulsas;
  const riscoReal = montarRisco(
    risco.entradaPrevista,
    Math.max(0, risco.comprometido + diferencialValor)
  );
  const diferencial =
    risco.entradaPrevista > 0 ? (diferencialValor / risco.entradaPrevista) * 100 : 0;
  const status = classificarStatusRiscoMensal(risco.risco, limites);

  return {
    competencia: mes,
    risco,
    riscoReal,
    diferencial,
    diferencialValor,
    status,
    dentroPlanejado: status === "saudavel",
    limites,
    evolucao: calcEvolucaoRiscoMes(mes, lancamentos),
    compromissos: calcCompromissosMes(mes, lancamentos),
    composicao: calcComposicaoRisco(mes, lancamentos),
    impactos: calcImpactosRisco(mes, lancamentos),
  };
}

export function obterRotuloTipoImpacto(tipo: TipoImpactoRisco): string {
  return ROTULOS_IMPACTO[tipo];
}
