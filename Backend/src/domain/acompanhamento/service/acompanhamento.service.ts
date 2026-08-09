import { DomainError } from '../../common/errors/DomainError.js';
import { EErrorCode } from '../../common/errors/enums/EErrorCode.js';
import { EStatusConta } from '../../conta/entity/interfaces/conta.interface.js';
import type { IContaService } from '../../conta/entity/interfaces/conta.service.interface.js';
import type { IPreferenciasService } from '../../preferencias/entity/interfaces/preferencias.service.interface.js';
import { normalizeCompetencia } from '../../orcamento/service/competencia.helper.js';
import type {
  IAcompanhamentoMes,
  IAcompanhamentoService,
  IParamsAcompanhamentoService,
} from '../entity/interfaces/acompanhamento.service.interface.js';
import {
  LIMITES_RISCO_PADRAO,
  montarAcompanhamentoMesCalculo,
} from './calculo-acompanhamento.helper.js';

export class AcompanhamentoService implements IAcompanhamentoService {
  private readonly lancamentoRepositoryRead: IParamsAcompanhamentoService['lancamentoRepositoryRead'];
  private readonly contaService: IContaService;
  private readonly preferenciasService: IPreferenciasService;

  constructor({
    lancamentoRepositoryRead,
    contaService,
    preferenciasService,
  }: IParamsAcompanhamentoService) {
    this.lancamentoRepositoryRead = lancamentoRepositoryRead;
    this.contaService = contaService;
    this.preferenciasService = preferenciasService;
  }

  async montarAcompanhamentoMes(
    requestUserId: string,
    competencia: string,
  ): Promise<IAcompanhamentoMes> {
    if (!requestUserId?.trim()) {
      throw new DomainError(EErrorCode.USER_NOT_IDENTIFIED, 401);
    }

    const mes = normalizeCompetencia(competencia);
    await this.contaService.sincronizarOcorrenciasDosRecorrentesDoUsuario(
      requestUserId,
    );

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
}
