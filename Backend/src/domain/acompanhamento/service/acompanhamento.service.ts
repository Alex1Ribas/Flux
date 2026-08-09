import { DomainError } from '../../common/errors/DomainError.js';
import { EErrorCode } from '../../common/errors/enums/EErrorCode.js';
import {
  EStatusConta,
  type IConta,
} from '../../conta/entity/interfaces/conta.interface.js';
import type { IContaService } from '../../conta/entity/interfaces/conta.service.interface.js';
import type { IPreferenciasService } from '../../preferencias/entity/interfaces/preferencias.service.interface.js';
import { normalizeCompetencia } from '../../orcamento/service/competencia.helper.js';
import type {
  IAcompanhamentoMes,
  IAcompanhamentoService,
  IMonthlyPlanningSnapshot,
  IParamsAcompanhamentoService,
  ISimulacaoImpactoData,
  ISimulacaoImpactoInput,
  ISimulationResult,
} from '../entity/interfaces/acompanhamento.service.interface.js';
import {
  ETipoCaixa,
  type ICaixa,
} from '../../caixa/entity/interfaces/caixa.interface.js';
import type { IOrcamento } from '../../orcamento/entity/interfaces/orcamento.interface.js';
import type { ILancamento } from '../../lancamento/entity/interfaces/lancamento.interface.js';
import {
  calcRiscoPrevistoDaColecao,
  LIMITES_RISCO_PADRAO,
  montarAcompanhamentoMesCalculo,
} from './calculo-acompanhamento.helper.js';
import { simularImpactoCompromisso } from './simulacao-impacto.helper.js';

export class AcompanhamentoService implements IAcompanhamentoService {
  private readonly lancamentoRepositoryRead: IParamsAcompanhamentoService['lancamentoRepositoryRead'];
  private readonly contaService: IContaService;
  private readonly preferenciasService: IPreferenciasService;
  private readonly caixaRepositoryRead: IParamsAcompanhamentoService['caixaRepositoryRead'];
  private readonly orcamentoRepositoryRead: IParamsAcompanhamentoService['orcamentoRepositoryRead'];

  constructor({
    lancamentoRepositoryRead,
    contaService,
    preferenciasService,
    caixaRepositoryRead,
    orcamentoRepositoryRead,
  }: IParamsAcompanhamentoService) {
    this.lancamentoRepositoryRead = lancamentoRepositoryRead;
    this.contaService = contaService;
    this.preferenciasService = preferenciasService;
    this.caixaRepositoryRead = caixaRepositoryRead;
    this.orcamentoRepositoryRead = orcamentoRepositoryRead;
  }

  async montarAcompanhamentoMes(
    requestUserId: string,
    competencia: string,
  ): Promise<IAcompanhamentoMes> {
    if (!requestUserId?.trim()) {
      throw new DomainError(EErrorCode.USER_NOT_IDENTIFIED, 401);
    }

    const mes = normalizeCompetencia(competencia);

    // Materialização de recorrentes ocorre nos eventos de mutação (create/update/delete),
    // não no caminho de leitura do acompanhamento.
    const [lancamentosMes, recorrentes, contasAbertas, preferencias] =
      await Promise.all([
        this.lancamentoRepositoryRead.listLancamentosByUserCompetencia(
          requestUserId,
          mes,
        ),
        this.lancamentoRepositoryRead.listLancamentosByUser(requestUserId, {
          recorrente: true,
        }),
        this.contaService.listTodasContas(requestUserId, {
          status: EStatusConta.ABERTA,
          competencia: mes,
        }),
        this.preferenciasService.getPreferencias(requestUserId),
      ]);

    const porId = new Map<string, (typeof lancamentosMes)[number]>();
    [...lancamentosMes, ...recorrentes].forEach((lancamento) => {
      porId.set(lancamento._id, lancamento);
    });
    const lancamentos = [...porId.values()];

    const limites =
      preferencias.limitesRisco?.global ?? LIMITES_RISCO_PADRAO;

    return montarAcompanhamentoMesCalculo(
      mes,
      lancamentos,
      contasAbertas,
      {
        saudavel: Number(limites.saudavel) || LIMITES_RISCO_PADRAO.saudavel,
        atencao: Number(limites.atencao) || LIMITES_RISCO_PADRAO.atencao,
      },
    );
  }

  async simularImpacto(
    requestUserId: string,
    input: ISimulacaoImpactoInput,
  ): Promise<ISimulationResult> {
    if (!requestUserId?.trim()) {
      throw new DomainError(EErrorCode.USER_NOT_IDENTIFIED, 401);
    }

    const mesInicial = normalizeCompetencia(input.dataPrimeiroPagamento);
    const [lancamentos, contasAbertas, caixas, orcamentos] =
      await Promise.all([
        this.lancamentoRepositoryRead.listLancamentosByUser(requestUserId),
        this.contaService.listTodasContas(requestUserId, {
          status: EStatusConta.ABERTA,
        }),
        this.caixaRepositoryRead.listCaixasByUser(requestUserId),
        this.orcamentoRepositoryRead.listOrcamentosByUserCompetencia(
          requestUserId,
          mesInicial,
        ),
      ]);

    const monthlyPlanning = this.montarPlanejamentoMensal(
      input,
      lancamentos,
      contasAbertas,
    );
    const data = this.montarDadosSimulacao(
      monthlyPlanning,
      caixas,
      orcamentos,
    );

    return simularImpactoCompromisso(input, data);
  }

  private montarPlanejamentoMensal(
    input: ISimulacaoImpactoInput,
    lancamentos: ILancamento[],
    contasAbertas: IConta[],
  ): IMonthlyPlanningSnapshot[] {
    const [anoInicial, mesBase] = normalizeCompetencia(
      input.dataPrimeiroPagamento,
    )
      .split('-')
      .map(Number);
    const planejamento: IMonthlyPlanningSnapshot[] = [];

    for (let indice = 0; indice < input.duracaoMeses; indice++) {
      const mesCalculado = mesBase + indice;
      const ano = anoInicial + Math.floor((mesCalculado - 1) / 12);
      const mes = ((mesCalculado - 1) % 12) + 1;
      const referenciaMes = `${ano}-${String(mes).padStart(2, '0')}`;
      const risco = calcRiscoPrevistoDaColecao(
        referenciaMes,
        lancamentos,
        contasAbertas,
      );

      planejamento.push({
        referenciaMes,
        entradasPrevistas: risco.entradaPrevista,
        compromissosAnteriores: risco.comprometido,
      });
    }

    return planejamento;
  }

  private montarDadosSimulacao(
    monthlyPlanning: IMonthlyPlanningSnapshot[],
    caixas: ICaixa[],
    orcamentos: IOrcamento[],
  ): ISimulacaoImpactoData {
    const caixaPorId = new Map(caixas.map((caixa) => [caixa._id, caixa]));
    const orcamentosMensais = orcamentos.map((orcamento) => {
      const caixa = caixaPorId.get(orcamento.caixa);
      return {
        caixaId: orcamento.caixa,
        nome: caixa?.nome ?? 'Caixa',
        valorPlanejadoMensal: Number(orcamento.valor),
      };
    });

    caixas
      .filter((caixa) => caixa.tipo === ETipoCaixa.ORCAMENTO)
      .forEach((caixa) => {
        const existeOrcamentoNoMes = orcamentosMensais.some(
          (item) => item.caixaId === caixa._id,
        );
        if (!existeOrcamentoNoMes) {
          orcamentosMensais.push({
            caixaId: caixa._id,
            nome: caixa.nome,
            valorPlanejadoMensal: Number(caixa.orcamentoMensal || 0),
          });
        }
      });

    return {
      monthlyPlanning,
      orcamentosMensais,
      objetivos: caixas
        .filter((caixa) => caixa.tipo === ETipoCaixa.OBJETIVO)
        .map((caixa) => ({
          caixaId: caixa._id,
          nome: caixa.nome,
          saldoAtual: Number(caixa.saldo || 0),
          meta: Number(caixa.meta || 0),
          aporteMensalPlanejado: Number(caixa.aporteMensal || 0),
        })),
    };
  }
}
