import { DomainError } from '../../common/errors/DomainError.js';
import { EErrorCode } from '../../common/errors/enums/EErrorCode.js';
import { assertResourceAccess } from '../../common/helpers/access.helper.js';
import type { ICaixa } from '../../caixa/entity/interfaces/caixa.interface.js';
import { normalizeCompetencia, normalizeCompetenciaData } from '../../orcamento/service/competencia.helper.js';
import { Lancamento } from '../entity/lancamento.entity.js';
import {
  EHorizonteLancamento,
  ETipoLancamento,
  type IDistribuicaoLancamento,
  type ILancamento,
  type IListLancamentosFiltro,
  type IParamsUpdateLancamento,
} from '../entity/interfaces/lancamento.interface.js';
import type {
  ILancamentoService,
  IParamsCreateLancamentoInput,
  IParamsLancamentoService,
  IParamsUpdateLancamentoInput,
} from '../entity/interfaces/lancamento.service.interface.js';
import type { EUserRole } from '../../user/entity/interfaces/user.interface.js';

export class LancamentoService implements ILancamentoService {
  private readonly lancamentoRepositoryRead: IParamsLancamentoService['lancamentoRepositoryRead'];
  private readonly lancamentoRepositoryWrite: IParamsLancamentoService['lancamentoRepositoryWrite'];
  private readonly caixaRepositoryRead: IParamsLancamentoService['caixaRepositoryRead'];
  private readonly caixaRepositoryWrite: IParamsLancamentoService['caixaRepositoryWrite'];
  private readonly orcamentoRepositoryRead: IParamsLancamentoService['orcamentoRepositoryRead'];
  private readonly preferenciasService: IParamsLancamentoService['preferenciasService'];

  constructor({
    lancamentoRepositoryRead,
    lancamentoRepositoryWrite,
    caixaRepositoryRead,
    caixaRepositoryWrite,
    orcamentoRepositoryRead,
    preferenciasService,
  }: IParamsLancamentoService) {
    this.lancamentoRepositoryRead = lancamentoRepositoryRead;
    this.lancamentoRepositoryWrite = lancamentoRepositoryWrite;
    this.caixaRepositoryRead = caixaRepositoryRead;
    this.caixaRepositoryWrite = caixaRepositoryWrite;
    this.orcamentoRepositoryRead = orcamentoRepositoryRead;
    this.preferenciasService = preferenciasService;
  }

  async createLancamento(
    requestUserId: string,
    params: IParamsCreateLancamentoInput,
  ): Promise<ILancamento[]> {
    this.ensureUserId(requestUserId);
    const ownerId = requestUserId;
    const payload = this.cleanCreatePayload(ownerId, params);

    if (payload.tipo === ETipoLancamento.ENTRADA) {
      await this.validateEntrada(payload);
      const created = await this.persistAndApplySaldo(payload);
      await this.preferenciasService.garantirCategoria(
        requestUserId,
        'entrada',
        created.descricao,
      );
      return [created];
    }

    const lancamentos = await this.buildSaidaLancamentos(payload);
    const created: ILancamento[] = [];
    for (const lancamento of lancamentos) {
      created.push(await this.persistAndApplySaldo(lancamento));
    }
    if (created[0]) {
      await this.preferenciasService.garantirCategoria(
        requestUserId,
        'saida',
        created[0].descricao,
      );
    }
    return created;
  }

  async listLancamentos(
    requestUserId: string,
    filtro?: IListLancamentosFiltro,
  ): Promise<ILancamento[]> {
    this.ensureUserId(requestUserId);
    const normalized: IListLancamentosFiltro = {
      ...filtro,
      competencia: filtro?.competencia
        ? normalizeCompetencia(filtro.competencia)
        : undefined,
    };
    return this.lancamentoRepositoryRead.listLancamentosByUser(
      requestUserId,
      normalized,
    );
  }

  async getLancamentoById(
    id: string,
    requestUserId: string,
    requestRole: EUserRole,
  ): Promise<ILancamento> {
    return this.findAndAssertAccess(id, requestUserId, requestRole);
  }

  async updateLancamentoById(
    id: string,
    requestUserId: string,
    requestRole: EUserRole,
    params: IParamsUpdateLancamentoInput,
  ): Promise<ILancamento> {
    const existing = await this.findAndAssertAccess(id, requestUserId, requestRole);
    const merged = this.mergeUpdate(existing, params);

    if (merged.tipo === ETipoLancamento.ENTRADA) {
      await this.validateEntrada(merged);
    } else if (!merged.caixaOrigem) {
      throw new DomainError(EErrorCode.LANCAMENTO_CAIXA_ORIGEM_REQUIRED, 400);
    } else {
      await this.findOwnedCaixa(merged.caixaOrigem, merged.user);
    }

    await this.applySaldo(existing, -1);
    const updated = await this.lancamentoRepositoryWrite.updateLancamentoById(
      id,
      merged,
    );
    if (!updated) {
      throw new DomainError(EErrorCode.LANCAMENTO_NOT_FOUND, 404);
    }
    await this.applySaldo(updated, 1);
    return updated;
  }

  async deleteLancamentoById(
    id: string,
    requestUserId: string,
    requestRole: EUserRole,
  ): Promise<ILancamento> {
    const existing = await this.findAndAssertAccess(id, requestUserId, requestRole);
    const deleted = await this.lancamentoRepositoryWrite.deleteLancamentoById(id);
    if (!deleted) {
      throw new DomainError(EErrorCode.LANCAMENTO_NOT_FOUND, 404);
    }
    await this.applySaldo(existing, -1);
    return deleted;
  }

  private cleanCreatePayload(
    ownerId: string,
    params: IParamsCreateLancamentoInput,
  ): Lancamento {
    const valor = Number(params.valor);
    if (Number.isNaN(valor) || valor <= 0) {
      throw new DomainError(EErrorCode.LANCAMENTO_VALUE_INVALID, 400);
    }
    if (!params.descricao?.trim()) {
      throw new DomainError(EErrorCode.VALIDATION_ERROR, 400);
    }
    if (!Object.values(ETipoLancamento).includes(params.tipo)) {
      throw new DomainError(EErrorCode.VALIDATION_ERROR, 400);
    }
    if (!Object.values(EHorizonteLancamento).includes(params.horizonte)) {
      throw new DomainError(EErrorCode.VALIDATION_ERROR, 400);
    }

    const recorrente = Boolean(params.recorrente);
    const competencia = normalizeCompetenciaData(params.competencia);
    const competenciaInicial = params.competenciaInicial
      ? normalizeCompetenciaData(params.competenciaInicial)
      : recorrente
        ? competencia
        : undefined;
    const duracaoMeses = recorrente
      ? Math.max(1, Number(params.duracaoMeses) || 1)
      : params.duracaoMeses;
    const ativo = recorrente ? params.ativo !== false : params.ativo;

    return new Lancamento(
      '',
      ownerId,
      params.tipo,
      params.horizonte,
      valor,
      params.descricao.trim(),
      competencia,
      params.observacao?.trim(),
      params.caixaOrigem?.trim(),
      params.caixaCompensacao?.trim(),
      params.distribuicao?.map((item) => ({
        caixa: item.caixa.trim(),
        valor: Number(item.valor),
      })),
      params.parcelaRef?.trim(),
      params.parcelaNum,
      params.totalParcelas,
      recorrente,
      competenciaInicial,
      duracaoMeses,
      ativo,
      params.mesesAbatidos,
    );
  }

  private mergeUpdate(
    existing: ILancamento,
    params: IParamsUpdateLancamento,
  ): Lancamento {
    const tipo = params.tipo ?? existing.tipo;
    const horizonte = params.horizonte ?? existing.horizonte;
    const valor =
      params.valor !== undefined ? Number(params.valor) : existing.valor;
    if (Number.isNaN(valor) || valor <= 0) {
      throw new DomainError(EErrorCode.LANCAMENTO_VALUE_INVALID, 400);
    }
    if (params.tipo && !Object.values(ETipoLancamento).includes(params.tipo)) {
      throw new DomainError(EErrorCode.VALIDATION_ERROR, 400);
    }
    if (
      params.horizonte &&
      !Object.values(EHorizonteLancamento).includes(params.horizonte)
    ) {
      throw new DomainError(EErrorCode.VALIDATION_ERROR, 400);
    }

    const descricao = params.descricao?.trim() ?? existing.descricao;
    if (!descricao) {
      throw new DomainError(EErrorCode.VALIDATION_ERROR, 400);
    }

    const recorrente =
      params.recorrente !== undefined
        ? Boolean(params.recorrente)
        : existing.recorrente;
    const competencia = params.competencia
      ? normalizeCompetenciaData(params.competencia)
      : existing.competencia;
    const competenciaInicial = params.competenciaInicial
      ? normalizeCompetenciaData(params.competenciaInicial)
      : existing.competenciaInicial ?? (recorrente ? competencia : undefined);
    const duracaoMeses =
      params.duracaoMeses !== undefined
        ? Math.max(1, Number(params.duracaoMeses) || 1)
        : existing.duracaoMeses ?? (recorrente ? 1 : undefined);
    const ativo =
      params.ativo !== undefined
        ? Boolean(params.ativo)
        : existing.ativo ?? (recorrente ? true : undefined);

    return new Lancamento(
      existing._id,
      existing.user,
      tipo,
      horizonte,
      valor,
      descricao,
      competencia,
      params.observacao !== undefined
        ? params.observacao.trim()
        : existing.observacao,
      params.caixaOrigem !== undefined
        ? params.caixaOrigem.trim()
        : existing.caixaOrigem,
      params.caixaCompensacao !== undefined
        ? params.caixaCompensacao.trim()
        : existing.caixaCompensacao,
      params.distribuicao !== undefined
        ? params.distribuicao.map((item) => ({
            caixa: item.caixa.trim(),
            valor: Number(item.valor),
          }))
        : existing.distribuicao,
      params.parcelaRef !== undefined
        ? params.parcelaRef.trim()
        : existing.parcelaRef,
      params.parcelaNum ?? existing.parcelaNum,
      params.totalParcelas ?? existing.totalParcelas,
      recorrente,
      competenciaInicial,
      duracaoMeses,
      ativo,
      params.mesesAbatidos ?? existing.mesesAbatidos,
      existing.createdAt,
      existing.updatedAt,
    );
  }

  private async validateEntrada(lancamento: Lancamento): Promise<void> {
    if (!lancamento.distribuicao?.length) {
      throw new DomainError(EErrorCode.LANCAMENTO_DISTRIBUICAO_REQUIRED, 400);
    }

    const total = lancamento.distribuicao.reduce(
      (sum, item) => sum + this.validateDistribuicaoItem(item),
      0,
    );
    if (Math.abs(total - lancamento.valor) > 0.01) {
      throw new DomainError(EErrorCode.LANCAMENTO_DISTRIBUICAO_INVALID, 400);
    }

    for (const item of lancamento.distribuicao) {
      await this.findOwnedCaixa(item.caixa, lancamento.user);
    }
  }

  private async buildSaidaLancamentos(
    lancamento: Lancamento,
  ): Promise<Lancamento[]> {
    if (!lancamento.caixaOrigem) {
      throw new DomainError(EErrorCode.LANCAMENTO_CAIXA_ORIGEM_REQUIRED, 400);
    }
    const caixaOrigem = await this.findOwnedCaixa(
      lancamento.caixaOrigem,
      lancamento.user,
    );

    if (lancamento.horizonte !== EHorizonteLancamento.PRESENTE) {
      return [lancamento];
    }

    const orcamento =
      await this.orcamentoRepositoryRead.findOrcamentoByUserCaixaCompetencia(
        lancamento.user,
        lancamento.caixaOrigem,
        normalizeCompetencia(lancamento.competencia),
      );
    const limite = orcamento?.valor ?? caixaOrigem.orcamentoMensal ?? 0;
    if (limite <= 0 || lancamento.valor <= limite) {
      return [lancamento];
    }

    if (!lancamento.caixaCompensacao) {
      throw new DomainError(EErrorCode.LANCAMENTO_COMPENSACAO_REQUIRED, 400);
    }
    await this.findOwnedCaixa(lancamento.caixaCompensacao, lancamento.user);

    const estouro = lancamento.valor - limite;
    const principal = new Lancamento(
      '',
      lancamento.user,
      lancamento.tipo,
      lancamento.horizonte,
      limite,
      lancamento.descricao,
      lancamento.competencia,
      lancamento.observacao,
      lancamento.caixaOrigem,
      lancamento.caixaCompensacao,
      undefined,
      lancamento.parcelaRef,
      lancamento.parcelaNum,
      lancamento.totalParcelas,
      lancamento.recorrente,
      lancamento.competenciaInicial,
      lancamento.duracaoMeses,
      lancamento.ativo,
      lancamento.mesesAbatidos,
    );
    const compensacao = new Lancamento(
      '',
      lancamento.user,
      ETipoLancamento.SAIDA,
      EHorizonteLancamento.PRESENTE,
      estouro,
      `Compensacao (${lancamento.descricao})`,
      lancamento.competencia,
      undefined,
      lancamento.caixaCompensacao,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      false,
    );
    return [principal, compensacao];
  }

  private async persistAndApplySaldo(lancamento: Lancamento): Promise<ILancamento> {
    const created = await this.lancamentoRepositoryWrite.createLancamento(lancamento);
    await this.applySaldo(created, 1);
    return created;
  }

  private async applySaldo(lancamento: ILancamento, factor: 1 | -1): Promise<void> {
    if (lancamento.horizonte !== EHorizonteLancamento.PRESENTE) return;

    if (lancamento.tipo === ETipoLancamento.ENTRADA) {
      for (const item of lancamento.distribuicao ?? []) {
        await this.caixaRepositoryWrite.incrementSaldoById(
          item.caixa,
          Number(item.valor) * factor,
        );
      }
      return;
    }

    if (lancamento.caixaOrigem) {
      await this.caixaRepositoryWrite.incrementSaldoById(
        lancamento.caixaOrigem,
        -Number(lancamento.valor) * factor,
      );
    }
  }

  private validateDistribuicaoItem(item: IDistribuicaoLancamento): number {
    if (!item.caixa?.trim()) {
      throw new DomainError(EErrorCode.CAIXA_NOT_FOUND, 404);
    }
    const valor = Number(item.valor);
    if (Number.isNaN(valor) || valor <= 0) {
      throw new DomainError(EErrorCode.LANCAMENTO_DISTRIBUICAO_INVALID, 400);
    }
    return valor;
  }

  private async findOwnedCaixa(id: string, userId: string): Promise<ICaixa> {
    const caixa = await this.caixaRepositoryRead.findCaixaById(id);
    if (!caixa || String(caixa.user) !== String(userId)) {
      throw new DomainError(EErrorCode.CAIXA_NOT_FOUND, 404);
    }
    return caixa;
  }

  private async findAndAssertAccess(
    id: string,
    requestUserId: string,
    requestRole: EUserRole,
  ): Promise<ILancamento> {
    this.ensureUserId(requestUserId);
    const lancamento = await this.lancamentoRepositoryRead.findLancamentoById(id);
    if (!lancamento) {
      throw new DomainError(EErrorCode.LANCAMENTO_NOT_FOUND, 404);
    }
    assertResourceAccess({
      ownerId: lancamento.user,
      requestUserId,
      requestRole,
    });
    return lancamento;
  }

  private ensureUserId(userId: string): void {
    if (!userId?.trim()) {
      throw new DomainError(EErrorCode.USER_NOT_IDENTIFIED, 401);
    }
  }
}
