import {
  EStatusConta,
  ETipoConta,
  type IConta,
} from '../../conta/entity/interfaces/conta.interface.js';
import { listarMesesDoRecorrente, diasNoMes } from '../../conta/service/ocorrencia.helper.js';
import {
  ETipoLancamento,
  type ILancamento,
} from '../../lancamento/entity/interfaces/lancamento.interface.js';
import { normalizeCompetencia } from '../../orcamento/service/competencia.helper.js';
import type {
  ICompromissoMes,
  IComposicaoRisco,
  IImpactoRisco,
  ILimitesRiscoMensal,
  IPontoEvolucaoRisco,
  IRiscoPrevisto,
  StatusRiscoMensal,
  TipoImpactoRisco,
} from '../entity/interfaces/acompanhamento.service.interface.js';

export const LIMITES_RISCO_PADRAO: ILimitesRiscoMensal = {
  saudavel: 30,
  atencao: 50,
};

function montarRisco(entradaPrevista: number, comprometido: number): IRiscoPrevisto {
  const risco = entradaPrevista > 0 ? (comprometido / entradaPrevista) * 100 : 0;
  return { entradaPrevista, comprometido, risco };
}

function riscoSobreBase(comprometido: number, entradaBase: number): number {
  return entradaBase > 0 ? (comprometido / entradaBase) * 100 : 0;
}

function mesDe(competencia: string): string {
  return normalizeCompetencia(competencia);
}

function competenciaNoMes(competencia: string, mes: string): boolean {
  return mesDe(competencia) === mes;
}

function temDiaNaCompetencia(competencia: string): boolean {
  return Boolean(competencia) && competencia.trim().split('-').length >= 3;
}

function getDiaCompetencia(competencia: string): number {
  const partes = competencia.trim().split('-');
  if (partes.length >= 3) {
    return Number(partes[2]);
  }
  return diasNoMes(mesDe(competencia));
}

function lancamentoRecorrenteAtivoNoMes(
  lancamento: ILancamento,
  mes: string,
): boolean {
  if (!lancamento.recorrente) return false;
  if (lancamento.ativo === false) return false;
  return listarMesesDoRecorrente(lancamento).includes(mes);
}

function listarRecorrentesDoMes(
  mes: string,
  lancamentos: ILancamento[],
): ILancamento[] {
  const porChave = new Map<string, ILancamento>();

  lancamentos.forEach((lancamento) => {
    if (!lancamentoRecorrenteAtivoNoMes(lancamento, mes)) return;
    const chave = `${lancamento.descricao}|${lancamento.tipo}`;
    porChave.set(chave, lancamento);
  });

  return [...porChave.values()];
}

function listarContasAbertasDoMes(mes: string, contas: IConta[]): IConta[] {
  return contas.filter((conta) => {
    if (conta.status !== EStatusConta.ABERTA) return false;
    return mesDe(conta.competencia || conta.vencimento) === mes;
  });
}

function listarAvulsosDoMes(mes: string, lancamentos: ILancamento[]): ILancamento[] {
  return lancamentos
    .filter(
      (lancamento) =>
        !lancamento.recorrente && competenciaNoMes(lancamento.competencia, mes),
    )
    .sort(
      (a, b) => getDiaCompetencia(a.competencia) - getDiaCompetencia(b.competencia),
    );
}

function recorrenteTemOcorrenciaNoMes(
  recorrenteId: string,
  mes: string,
  contas: IConta[],
): boolean {
  return contas.some(
    (conta) =>
      conta.recorrenteId === recorrenteId &&
      mesDe(conta.competencia || conta.vencimento) === mes,
  );
}

export function calcRiscoPrevistoDaColecao(
  mes: string,
  lancamentos: ILancamento[],
  contas: IConta[],
): IRiscoPrevisto {
  let entradaPrevista = 0;
  let comprometido = 0;

  listarContasAbertasDoMes(mes, contas).forEach((conta) => {
    const valor = Number(conta.valor);
    if (conta.tipo === ETipoConta.A_RECEBER) entradaPrevista += valor;
    else comprometido += valor;
  });

  listarRecorrentesDoMes(mes, lancamentos).forEach((lancamento) => {
    if (recorrenteTemOcorrenciaNoMes(lancamento._id, mes, contas)) {
      return;
    }
    const valor = Number(lancamento.valor);
    if (lancamento.tipo === ETipoLancamento.ENTRADA) entradaPrevista += valor;
    else comprometido += valor;
  });

  return montarRisco(entradaPrevista, comprometido);
}

function comprometidoAvulsoAteDia(
  mes: string,
  lancamentos: ILancamento[],
  dia: number,
): number {
  return lancamentos
    .filter((lancamento) => {
      if (lancamento.recorrente) return false;
      if (!competenciaNoMes(lancamento.competencia, mes)) return false;
      return getDiaCompetencia(lancamento.competencia) <= dia;
    })
    .reduce((total, lancamento) => {
      const valor = Number(lancamento.valor);
      return lancamento.tipo === ETipoLancamento.SAIDA ? total + valor : total - valor;
    }, 0);
}

export function classificarStatusRiscoMensal(
  percentualRisco: number,
  limites: ILimitesRiscoMensal,
): StatusRiscoMensal {
  if (percentualRisco <= limites.saudavel) return 'saudavel';
  if (percentualRisco <= limites.atencao) return 'atencao';
  return 'critico';
}

export function calcEvolucaoRiscoMes(
  mes: string,
  lancamentos: ILancamento[],
  contas: IConta[],
): IPontoEvolucaoRisco[] {
  const totalDias = diasNoMes(mes);
  const previsto = calcRiscoPrevistoDaColecao(mes, lancamentos, contas);
  const pontos: IPontoEvolucaoRisco[] = [];

  for (let dia = 1; dia <= totalDias; dia++) {
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

function parcelaDoRecorrenteNoMes(
  recorrente: ILancamento,
  mes: string,
): { parcelaNum: number; totalParcelas: number } | null {
  const meses = listarMesesDoRecorrente(recorrente);
  const indice = meses.indexOf(mes);
  if (indice < 0) return null;
  return {
    parcelaNum: indice + 1,
    totalParcelas: meses.length,
  };
}

function camposParcela(
  parcela: { parcelaNum: number; totalParcelas: number } | null,
): Pick<ICompromissoMes, 'parcelaNum' | 'totalParcelas'> {
  if (!parcela) return {};
  return {
    parcelaNum: parcela.parcelaNum,
    totalParcelas: parcela.totalParcelas,
  };
}

export function calcCompromissosMes(
  mes: string,
  lancamentos: ILancamento[],
  contas: IConta[],
): ICompromissoMes[] {
  const recorrentesPorId = new Map(
    lancamentos
      .filter((lancamento) => lancamento.recorrente)
      .map((lancamento) => [lancamento._id, lancamento]),
  );

  const contasDoMes = listarContasAbertasDoMes(mes, contas).map((conta) => {
    const recorrente = conta.recorrenteId
      ? recorrentesPorId.get(conta.recorrenteId)
      : undefined;
    return {
      id: conta._id,
      descricao: conta.descricao,
      tipo: (conta.tipo === ETipoConta.A_RECEBER ? 'entrada' : 'saida') as ICompromissoMes['tipo'],
      valor: Number(conta.valor),
      dia: getDiaCompetencia(conta.vencimento),
      ...camposParcela(recorrente ? parcelaDoRecorrenteNoMes(recorrente, mes) : null),
    };
  });

  const recorrentesSemOcorrencia = listarRecorrentesDoMes(mes, lancamentos)
    .filter((lancamento) => !recorrenteTemOcorrenciaNoMes(lancamento._id, mes, contas))
    .map((lancamento) => {
      const referencia = lancamento.competenciaInicial ?? lancamento.competencia;
      return {
        id: lancamento._id,
        descricao: lancamento.descricao,
        tipo: lancamento.tipo as ICompromissoMes['tipo'],
        valor: Number(lancamento.valor),
        dia: temDiaNaCompetencia(referencia) ? getDiaCompetencia(referencia) : null,
        ...camposParcela(parcelaDoRecorrenteNoMes(lancamento, mes)),
      };
    });

  return [...contasDoMes, ...recorrentesSemOcorrencia].sort((a, b) => {
    if (a.tipo !== b.tipo) return a.tipo === 'entrada' ? -1 : 1;
    if (a.dia !== null && b.dia !== null && a.dia !== b.dia) return a.dia - b.dia;
    return b.valor - a.valor;
  });
}

export function calcComposicaoRisco(
  mes: string,
  lancamentos: ILancamento[],
  contas: IConta[],
): IComposicaoRisco[] {
  const previsto = calcRiscoPrevistoDaColecao(mes, lancamentos, contas);
  if (previsto.comprometido <= 0) return [];

  const totais = new Map<string, number>();
  listarContasAbertasDoMes(mes, contas)
    .filter((conta) => conta.tipo === ETipoConta.A_PAGAR)
    .forEach((conta) => {
      totais.set(
        conta.descricao,
        (totais.get(conta.descricao) ?? 0) + Number(conta.valor),
      );
    });

  listarRecorrentesDoMes(mes, lancamentos)
    .filter((lancamento) => lancamento.tipo === ETipoLancamento.SAIDA)
    .filter((lancamento) => !recorrenteTemOcorrenciaNoMes(lancamento._id, mes, contas))
    .forEach((lancamento) => {
      totais.set(
        lancamento.descricao,
        (totais.get(lancamento.descricao) ?? 0) + Number(lancamento.valor),
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

function classificarTipoImpacto(lancamento: ILancamento): TipoImpactoRisco {
  if (lancamento.parcelaRef) return 'parcelamento';
  if (lancamento.tipo === ETipoLancamento.ENTRADA) return 'renda_extra';
  if (lancamento.tipo === ETipoLancamento.SAIDA) return 'despesa_futura';
  return 'outro';
}

export function calcImpactosRisco(
  mes: string,
  lancamentos: ILancamento[],
  contas: IConta[],
): IImpactoRisco[] {
  const previsto = calcRiscoPrevistoDaColecao(mes, lancamentos, contas);
  const avulsos = listarAvulsosDoMes(mes, lancamentos);

  const impactos: IImpactoRisco[] = [];
  let comprometidoAcumulado = previsto.comprometido;
  let riscoAnterior = previsto.risco;

  avulsos.forEach((lancamento) => {
    const valor = Number(lancamento.valor);
    comprometidoAcumulado +=
      lancamento.tipo === ETipoLancamento.SAIDA ? valor : -valor;
    const riscoAtual = riscoSobreBase(
      Math.max(0, comprometidoAcumulado),
      previsto.entradaPrevista,
    );
    const delta = riscoAtual - riscoAnterior;

    impactos.push({
      id: lancamento._id,
      descricao: lancamento.descricao,
      tipo: classificarTipoImpacto(lancamento),
      valor,
      impactoRisco: delta,
      competencia: lancamento.competencia,
      direcao: delta >= 0 ? 'aumenta' : 'reduz',
    });
    riscoAnterior = riscoAtual;
  });

  return impactos;
}

export function montarAcompanhamentoMesCalculo(
  competencia: string,
  lancamentos: ILancamento[],
  contas: IConta[],
  limites: ILimitesRiscoMensal = LIMITES_RISCO_PADRAO,
) {
  const mes = mesDe(competencia);
  const risco = calcRiscoPrevistoDaColecao(mes, lancamentos, contas);
  const avulsos = listarAvulsosDoMes(mes, lancamentos);
  const saidasAvulsas = avulsos
    .filter((lancamento) => lancamento.tipo === ETipoLancamento.SAIDA)
    .reduce((total, lancamento) => total + Number(lancamento.valor), 0);
  const entradasAvulsas = avulsos
    .filter((lancamento) => lancamento.tipo === ETipoLancamento.ENTRADA)
    .reduce((total, lancamento) => total + Number(lancamento.valor), 0);
  const diferencialValor = saidasAvulsas - entradasAvulsas;
  const riscoReal = montarRisco(
    risco.entradaPrevista,
    Math.max(0, risco.comprometido + diferencialValor),
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
    dentroPlanejado: status === 'saudavel',
    limites,
    evolucao: calcEvolucaoRiscoMes(mes, lancamentos, contas),
    compromissos: calcCompromissosMes(mes, lancamentos, contas),
    composicao: calcComposicaoRisco(mes, lancamentos, contas),
    impactos: calcImpactosRisco(mes, lancamentos, contas),
  };
}
