import { DomainError } from '../../common/errors/DomainError.js';
import { EErrorCode } from '../../common/errors/enums/EErrorCode.js';
import { normalizeCompetencia } from '../../orcamento/service/competencia.helper.js';
import type {
  IBudgetImpact,
  IGoalImpact,
  IMonthlyImpact,
  ISimulacaoImpactoData,
  ISimulacaoImpactoInput,
  ISimulationResult,
  StatusRiscoMensal,
} from '../entity/interfaces/acompanhamento.service.interface.js';

const COMPROMETIMENTO_PADRAO = {
  saudavel: 0.3,
  atencao: 0.5,
} as const;

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function classificarComprometimento(
  percentual?: number | null,
): StatusRiscoMensal {
  if (percentual === null || percentual === undefined) return 'critico';
  if (percentual <= COMPROMETIMENTO_PADRAO.saudavel) return 'saudavel';
  if (percentual <= COMPROMETIMENTO_PADRAO.atencao) return 'atencao';
  return 'critico';
}

function gerarMesesAfetados(
  dataPrimeiroPagamento: string,
  duracaoMeses: number,
): string[] {
  const mesInicial = normalizeCompetencia(dataPrimeiroPagamento);
  const [anoInicial, mesBase] = mesInicial.split('-').map(Number);
  const meses: string[] = [];

  for (let indice = 0; indice < duracaoMeses; indice++) {
    const mesCalculado = mesBase + indice;
    const ano = anoInicial + Math.floor((mesCalculado - 1) / 12);
    const mes = ((mesCalculado - 1) % 12) + 1;
    meses.push(`${ano}-${String(mes).padStart(2, '0')}`);
  }

  return meses;
}

function validarInputBasico(input: ISimulacaoImpactoInput): void {
  if (Number(input.valorTotal) <= 0) {
    throw new DomainError(EErrorCode.SIMULACAO_VALOR_TOTAL_INVALIDO, 400);
  }
  if (Number(input.duracaoMeses) < 1) {
    throw new DomainError(EErrorCode.SIMULACAO_DURACAO_INVALIDA, 400);
  }
  if (!input.dataPrimeiroPagamento?.trim()) {
    throw new DomainError(EErrorCode.SIMULACAO_DATA_INVALIDA, 400);
  }
  if (
    input.modoCompensacao !== 'declarada' &&
    input.modoCompensacao !== 'nao-declarada'
  ) {
    throw new DomainError(EErrorCode.SIMULACAO_MODO_COMPENSACAO_INVALIDO, 400);
  }
}

function validarFontesDeclaradas(
  input: ISimulacaoImpactoInput,
  parcelaMensal: number,
  data: ISimulacaoImpactoData,
): void {
  if (input.modoCompensacao !== 'declarada') return;

  if (input.fontesDeCompensacao.length === 0) {
    throw new DomainError(EErrorCode.SIMULACAO_FONTES_OBRIGATORIAS, 400);
  }

  let totalFontes = 0;
  for (const fonte of input.fontesDeCompensacao) {
    if (Number(fonte.valorMensalDestinado) < 0) {
      throw new DomainError(EErrorCode.SIMULACAO_FONTE_VALOR_INVALIDO, 400);
    }
    totalFontes += Number(fonte.valorMensalDestinado);

    if (fonte.tipoOrigem === 'orcamento') {
      const existeOrcamento = data.orcamentosMensais.some(
        (orcamento) => orcamento.caixaId === fonte.origemId,
      );
      if (!existeOrcamento) {
        throw new DomainError(EErrorCode.SIMULACAO_FONTE_INEXISTENTE, 400);
      }
    }

    if (fonte.tipoOrigem === 'objetivo') {
      const existeObjetivo = data.objetivos.some(
        (objetivo) => objetivo.caixaId === fonte.origemId,
      );
      if (!existeObjetivo) {
        throw new DomainError(EErrorCode.SIMULACAO_FONTE_INEXISTENTE, 400);
      }
    }
  }

  if (round2(totalFontes) !== round2(parcelaMensal)) {
    throw new DomainError(EErrorCode.SIMULACAO_TOTAL_FONTES_DIVERGENTE, 400);
  }
}

function calcImpactsOrcamento(
  input: ISimulacaoImpactoInput,
  data: ISimulacaoImpactoData,
): IBudgetImpact[] {
  if (input.modoCompensacao !== 'declarada') return [];

  const impacts: IBudgetImpact[] = [];
  input.fontesDeCompensacao.forEach((fonte) => {
    if (fonte.tipoOrigem !== 'orcamento') return;
    const orcamento = data.orcamentosMensais.find(
      (item) => item.caixaId === fonte.origemId,
    );
    if (!orcamento) return;

    const valorPlanejadoMensal = round2(Number(orcamento.valorPlanejadoMensal) || 0);
    const valorMensalDestinado = round2(Number(fonte.valorMensalDestinado) || 0);
    const novoValorMensal = round2(valorPlanejadoMensal - valorMensalDestinado);
    const alertas: string[] = [];

    if (valorMensalDestinado > valorPlanejadoMensal) {
      alertas.push(
        'Fonte de orçamento excede o valor mensal disponível da caixa selecionada.',
      );
    }

    impacts.push({
      fonteId: fonte.id,
      nome: orcamento.nome,
      valorPlanejadoMensal,
      valorMensalDestinado,
      novoValorMensal,
      percentualReducao:
        valorPlanejadoMensal > 0
          ? round2(valorMensalDestinado / valorPlanejadoMensal)
          : null,
      alertas,
    });
  });

  return impacts;
}

function calcImpactsObjetivo(
  input: ISimulacaoImpactoInput,
  data: ISimulacaoImpactoData,
): IGoalImpact[] {
  if (input.modoCompensacao !== 'declarada') return [];

  const impacts: IGoalImpact[] = [];
  input.fontesDeCompensacao.forEach((fonte) => {
    if (fonte.tipoOrigem !== 'objetivo') return;
    const objetivo = data.objetivos.find((item) => item.caixaId === fonte.origemId);
    if (!objetivo) return;

    const meta = round2(Number(objetivo.meta) || 0);
    const saldoAtual = round2(Number(objetivo.saldoAtual) || 0);
    const valorRestanteObjetivo = Math.max(0, round2(meta - saldoAtual));
    const aporteMensalPlanejado = round2(Number(objetivo.aporteMensalPlanejado) || 0);
    const valorMensalDestinado = round2(Number(fonte.valorMensalDestinado) || 0);
    const novoAporteMensal = round2(aporteMensalPlanejado - valorMensalDestinado);
    const prazoOriginalMeses =
      aporteMensalPlanejado > 0
        ? Math.ceil(valorRestanteObjetivo / aporteMensalPlanejado)
        : null;
    const alertas: string[] = [];

    let novoPrazoMeses: number | null = null;
    let diferencaPrazoMeses: number | null = null;
    let status: IGoalImpact['status'] = 'normal';
    if (novoAporteMensal > 0) {
      novoPrazoMeses = Math.ceil(valorRestanteObjetivo / novoAporteMensal);
      diferencaPrazoMeses =
        prazoOriginalMeses === null ? null : novoPrazoMeses - prazoOriginalMeses;
    } else {
      status = 'congelado';
      alertas.push(
        'O objetivo ficará sem aporte mensal e terá progresso congelado durante o período da simulação.',
      );
    }

    impacts.push({
      fonteId: fonte.id,
      nome: objetivo.nome,
      valorRestanteObjetivo,
      aporteMensalPlanejado,
      valorMensalDestinado,
      novoAporteMensal,
      prazoOriginalMeses,
      novoPrazoMeses,
      diferencaPrazoMeses,
      status,
      alertas,
    });
  });

  return impacts;
}

function calcularImpactoMensal(
  mesesAfetados: string[],
  parcelaMensal: number,
  monthlyPlanning: ISimulacaoImpactoData['monthlyPlanning'],
): IMonthlyImpact[] {
  return mesesAfetados.map((mes) => {
    const snapshot = monthlyPlanning.find((item) => item.referenciaMes === mes);
    const entradasPrevistas = round2(snapshot?.entradasPrevistas ?? 0);
    const compromissosAnteriores = round2(snapshot?.compromissosAnteriores ?? 0);
    const totalComprometido = round2(compromissosAnteriores + parcelaMensal);
    const alertas: string[] = [];

    const comprometimentoAntes =
      entradasPrevistas > 0 ? compromissosAnteriores / entradasPrevistas : null;
    const comprometimentoDepois =
      entradasPrevistas > 0 ? totalComprometido / entradasPrevistas : null;
    const variacaoComprometimento =
      comprometimentoAntes === null || comprometimentoDepois === null
        ? null
        : comprometimentoDepois - comprometimentoAntes;

    if (entradasPrevistas <= 0) {
      alertas.push('Mês sem entrada prevista. Impacto classificado como crítico.');
    }

    return {
      referenciaMes: mes,
      entradasPrevistas,
      compromissosAnteriores,
      novaParcela: parcelaMensal,
      totalComprometido,
      comprometimentoAntes,
      comprometimentoDepois,
      variacaoComprometimento,
      classificacaoAntes: classificarComprometimento(comprometimentoAntes),
      classificacaoDepois: classificarComprometimento(comprometimentoDepois),
      alertas,
    };
  });
}

export function simularImpactoCompromisso(
  input: ISimulacaoImpactoInput,
  data: ISimulacaoImpactoData,
): ISimulationResult {
  validarInputBasico(input);
  const parcelaMensal = round2(Number(input.valorTotal) / Number(input.duracaoMeses));
  if (parcelaMensal <= 0) {
    throw new DomainError(EErrorCode.SIMULACAO_PARCELA_INVALIDA, 400);
  }

  const mesesAfetados = gerarMesesAfetados(
    input.dataPrimeiroPagamento,
    Number(input.duracaoMeses),
  );

  validarFontesDeclaradas(input, parcelaMensal, data);
  const budgetImpacts = calcImpactsOrcamento(input, data);
  const goalImpacts = calcImpactsObjetivo(input, data);
  const monthlyImpacts = calcularImpactoMensal(
    mesesAfetados,
    parcelaMensal,
    data.monthlyPlanning,
  );

  let piorComprometimentoDepois: number | null = null;
  let piorMes: string | null = null;
  monthlyImpacts.forEach((item) => {
    if (item.comprometimentoDepois === null) {
      if (piorComprometimentoDepois === null) {
        piorComprometimentoDepois = null;
        piorMes = item.referenciaMes;
      }
      return;
    }

    if (
      piorComprometimentoDepois === null ||
      item.comprometimentoDepois > piorComprometimentoDepois
    ) {
      piorComprometimentoDepois = item.comprometimentoDepois;
      piorMes = item.referenciaMes;
    }
  });

  return {
    parcelaMensal,
    mesesAfetados,
    budgetImpacts,
    goalImpacts,
    monthlyImpacts,
    resumoImpacto: {
      totalFontesDeclaradas:
        input.modoCompensacao === 'declarada'
          ? round2(
              input.fontesDeCompensacao.reduce(
                (total, fonte) => total + Number(fonte.valorMensalDestinado),
                0,
              ),
            )
          : 0,
      quantidadeFontes:
        input.modoCompensacao === 'declarada'
          ? input.fontesDeCompensacao.length
          : 0,
      possuiOrcamento:
        input.modoCompensacao === 'declarada'
          ? input.fontesDeCompensacao.some(
              (fonte) => fonte.tipoOrigem === 'orcamento',
            )
          : false,
      possuiObjetivo:
        input.modoCompensacao === 'declarada'
          ? input.fontesDeCompensacao.some(
              (fonte) => fonte.tipoOrigem === 'objetivo',
            )
          : false,
      impactoBruto: input.modoCompensacao === 'nao-declarada',
      piorComprometimentoDepois,
      piorMes,
      mesesCriticos: monthlyImpacts.filter(
        (item) => item.classificacaoDepois === 'critico',
      ).length,
      alertasGerais: [],
    },
  };
}
