import { DomainError } from '../../common/errors/DomainError.js';
import { EErrorCode } from '../../common/errors/enums/EErrorCode.js';
import { assertResourceAccess } from '../../common/helpers/access.helper.js';
import {
  ETipoCaixa,
  type ICaixa,
} from '../../caixa/entity/interfaces/caixa.interface.js';
import { normalizeCompetencia, normalizeCompetenciaData } from '../../orcamento/service/competencia.helper.js';
import { Lancamento } from '../entity/lancamento.entity.js';
import {
  EHorizonteLancamento,
  EMeioPagamento,
  ETipoLancamento,
  type IDistribuicaoLancamento,
  type ILancamento,
  type IListLancamentosFiltro,
  type IParamsUpdateLancamento,
} from '../entity/interfaces/lancamento.interface.js';
import type {
  ILancamentoService,
  IParamsCreateLancamentoInput,
  IParamsDistribuirLancamento,
  IParamsLancamentoService,
  IParamsUpdateLancamentoInput,
  IRegraDistribuicaoPreferencia,
} from '../entity/interfaces/lancamento.service.interface.js';
import type { EUserRole } from '../../user/entity/interfaces/user.interface.js';
import { calcularDistribuicaoAutomatica } from './distribuicao-automatica.helper.js';

function normalizeMeioPagamento(
  value?: string,
): EMeioPagamento {
  if (value === EMeioPagamento.CARTAO || value === 'cartao') {
    return EMeioPagamento.CARTAO;
  }
  return EMeioPagamento.CAIXA;
}

function isPagamentoCartao(value?: string): boolean {
  return normalizeMeioPagamento(value) === EMeioPagamento.CARTAO;
}


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
    const distribuicaoInicial =
      params.tipo === ETipoLancamento.ENTRADA &&
      params.horizonte === EHorizonteLancamento.PRESENTE
        ? params.distribuicao
        : undefined;
    const distribuirAutomaticamente = Boolean(params.distribuirAutomaticamente);
    const payload = this.cleanCreatePayload(ownerId, {
      ...params,
      // Presente: crédito só na origem; distribuição aplicada depois.
      // Futuro/recorrente: mantém distribuicao como plano (não mexe saldo).
      distribuicao:
        params.tipo === ETipoLancamento.ENTRADA &&
        params.horizonte === EHorizonteLancamento.PRESENTE
          ? undefined
          : params.distribuicao,
    });

    if (payload.tipo === ETipoLancamento.ENTRADA) {
      await this.validateEntrada(payload);
      let created = await this.persistAndApplySaldo(payload);
      await this.preferenciasService.garantirCategoria(
        requestUserId,
        'entrada',
        created.descricao,
      );

      if (distribuicaoInicial?.length) {
        created = await this.aplicarDistribuicao(
          created,
          distribuicaoInicial,
          requestUserId,
        );
      } else if (
        distribuirAutomaticamente &&
        created.horizonte === EHorizonteLancamento.PRESENTE
      ) {
        const regras = await this.preferenciasService.obterRegrasDistribuicao?.(
          requestUserId,
        );
        if (regras?.length) {
          const itens = await this.montarItensRegras(
            requestUserId,
            created.valor,
            regras,
          );
          if (itens.length) {
            created = await this.aplicarDistribuicao(created, itens, requestUserId);
          }
        }
      }

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
    await this.reverseDistribuicaoMovimentos(existing);
    const paraSalvar =
      merged.tipo === ETipoLancamento.ENTRADA
        ? this.toEntity(merged, { distribuicao: existing.distribuicao })
        : merged;
    const updated = await this.lancamentoRepositoryWrite.updateLancamentoById(
      id,
      paraSalvar,
    );
    if (!updated) {
      throw new DomainError(EErrorCode.LANCAMENTO_NOT_FOUND, 404);
    }
    await this.applySaldo(updated, 1);
    if (
      merged.tipo === ETipoLancamento.ENTRADA &&
      existing.distribuicao?.length &&
      updated.horizonte === EHorizonteLancamento.PRESENTE
    ) {
      return this.aplicarDistribuicao(
        updated,
        existing.distribuicao,
        requestUserId,
      );
    }
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
    await this.reverseDistribuicaoMovimentos(existing);
    return deleted;
  }

  async distribuirLancamentoById(
    id: string,
    requestUserId: string,
    requestRole: EUserRole,
    params: IParamsDistribuirLancamento,
  ): Promise<ILancamento> {
    const existing = await this.findAndAssertAccess(id, requestUserId, requestRole);
    return this.aplicarDistribuicao(existing, params.itens ?? [], requestUserId);
  }

  private async aplicarDistribuicao(
    lancamento: ILancamento,
    itens: IDistribuicaoLancamento[],
    requestUserId: string,
  ): Promise<ILancamento> {
    if (lancamento.tipo !== ETipoLancamento.ENTRADA) {
      throw new DomainError(EErrorCode.LANCAMENTO_NAO_E_ENTRADA, 400);
    }
    if (!lancamento.caixaOrigem) {
      throw new DomainError(EErrorCode.LANCAMENTO_CAIXA_ORIGEM_REQUIRED, 400);
    }
    if (!itens.length) {
      throw new DomainError(EErrorCode.LANCAMENTO_DISTRIBUICAO_INVALID, 400);
    }

    const jaDistribuido = this.somaDistribuicao(lancamento.distribuicao);
    const restanteReceita = lancamento.valor - jaDistribuido;
    if (restanteReceita <= 0.01) {
      throw new DomainError(EErrorCode.LANCAMENTO_JA_DISTRIBUIDO, 400);
    }

    const normalizados: IDistribuicaoLancamento[] = [];
    let totalNovo = 0;
    for (const item of itens) {
      const valor = this.validateDistribuicaoItem(item);
      const destino = await this.findOwnedCaixa(item.caixa, lancamento.user);
      if (
        destino.tipo !== ETipoCaixa.OBJETIVO &&
        destino.tipo !== ETipoCaixa.ORCAMENTO
      ) {
        throw new DomainError(EErrorCode.LANCAMENTO_DISTRIBUICAO_DESTINO_INVALID, 400);
      }
      normalizados.push({ caixa: item.caixa.trim(), valor });
      totalNovo += valor;
    }

    if (totalNovo - restanteReceita > 0.01) {
      throw new DomainError(EErrorCode.LANCAMENTO_DISTRIBUICAO_EXCEDE, 400);
    }

    const origem = await this.findOwnedCaixa(
      lancamento.caixaOrigem,
      lancamento.user,
    );
    if (
      lancamento.horizonte === EHorizonteLancamento.PRESENTE &&
      origem.saldo + 0.01 < totalNovo
    ) {
      throw new DomainError(EErrorCode.LANCAMENTO_DISTRIBUICAO_EXCEDE, 400);
    }

    if (lancamento.horizonte === EHorizonteLancamento.PRESENTE) {
      await this.caixaRepositoryWrite.incrementSaldoById(
        lancamento.caixaOrigem,
        -totalNovo,
      );
      for (const item of normalizados) {
        await this.caixaRepositoryWrite.incrementSaldoById(item.caixa, item.valor);
      }
    }

    const distribuicao = [...(lancamento.distribuicao ?? []), ...normalizados];
    const updated = await this.lancamentoRepositoryWrite.updateLancamentoById(
      lancamento._id,
      this.toEntity(lancamento, { distribuicao }),
    );
    if (!updated) {
      throw new DomainError(EErrorCode.LANCAMENTO_NOT_FOUND, 404);
    }
    void requestUserId;
    return updated;
  }

  private async montarItensRegras(
    userId: string,
    valorDisponivel: number,
    regras: IRegraDistribuicaoPreferencia[],
  ): Promise<IDistribuicaoLancamento[]> {
    const caixas = await this.caixaRepositoryRead.listCaixasByUser(userId);
    return calcularDistribuicaoAutomatica(valorDisponivel, regras, caixas);
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
      normalizeMeioPagamento(params.meioPagamento),
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
      params.meioPagamento !== undefined
        ? normalizeMeioPagamento(params.meioPagamento)
        : normalizeMeioPagamento(existing.meioPagamento),
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
    if (!lancamento.caixaOrigem?.trim()) {
      throw new DomainError(EErrorCode.LANCAMENTO_CAIXA_ORIGEM_REQUIRED, 400);
    }
    const origem = await this.findOwnedCaixa(
      lancamento.caixaOrigem,
      lancamento.user,
    );
    if (origem.tipo !== ETipoCaixa.ORIGEM) {
      throw new DomainError(EErrorCode.LANCAMENTO_CAIXA_ORIGEM_TIPO_INVALID, 400);
    }

    if (lancamento.distribuicao?.length) {
      const total = lancamento.distribuicao.reduce(
        (sum, item) => sum + this.validateDistribuicaoItem(item),
        0,
      );
      if (total - lancamento.valor > 0.01) {
        throw new DomainError(EErrorCode.LANCAMENTO_DISTRIBUICAO_EXCEDE, 400);
      }
      for (const item of lancamento.distribuicao) {
        const destino = await this.findOwnedCaixa(item.caixa, lancamento.user);
        if (
          destino.tipo !== ETipoCaixa.OBJETIVO &&
          destino.tipo !== ETipoCaixa.ORCAMENTO
        ) {
          throw new DomainError(
            EErrorCode.LANCAMENTO_DISTRIBUICAO_DESTINO_INVALID,
            400,
          );
        }
      }
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

    const isCartao = isPagamentoCartao(lancamento.meioPagamento);

    if (lancamento.horizonte === EHorizonteLancamento.PRESENTE && !isCartao) {
      const disponivel = caixaOrigem.saldo - (caixaOrigem.comprometido || 0);
      if (disponivel + 0.01 < lancamento.valor) {
        if (!lancamento.caixaCompensacao) {
          throw new DomainError(EErrorCode.CAIXA_DISPONIVEL_INSUFICIENTE, 400);
        }
      }
    }

    if (isCartao) {
      return [lancamento];
    }

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
      const disponivel = caixaOrigem.saldo - (caixaOrigem.comprometido || 0);
      if (disponivel + 0.01 < lancamento.valor) {
        throw new DomainError(EErrorCode.CAIXA_DISPONIVEL_INSUFICIENTE, 400);
      }
      return [lancamento];
    }

    if (!lancamento.caixaCompensacao) {
      throw new DomainError(EErrorCode.LANCAMENTO_COMPENSACAO_REQUIRED, 400);
    }
    const caixaComp = await this.findOwnedCaixa(
      lancamento.caixaCompensacao,
      lancamento.user,
    );

    const estouro = lancamento.valor - limite;
    const disponivelOrigem = caixaOrigem.saldo - (caixaOrigem.comprometido || 0);
    const disponivelComp = caixaComp.saldo - (caixaComp.comprometido || 0);
    if (disponivelOrigem + 0.01 < limite || disponivelComp + 0.01 < estouro) {
      throw new DomainError(EErrorCode.CAIXA_DISPONIVEL_INSUFICIENTE, 400);
    }

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
      lancamento.meioPagamento,
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
      EMeioPagamento.CAIXA,
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
    if (isPagamentoCartao(lancamento.meioPagamento)) {
      return;
    }

    if (lancamento.tipo === ETipoLancamento.ENTRADA) {
      if (!lancamento.caixaOrigem) return;
      await this.caixaRepositoryWrite.incrementSaldoById(
        lancamento.caixaOrigem,
        Number(lancamento.valor) * factor,
      );
      return;
    }

    if (lancamento.caixaOrigem) {
      await this.caixaRepositoryWrite.incrementSaldoById(
        lancamento.caixaOrigem,
        -Number(lancamento.valor) * factor,
      );
    }
  }

  /** Desfaz movimentos de distribuição gravados no lançamento de entrada. */
  private async reverseDistribuicaoMovimentos(
    lancamento: ILancamento,
  ): Promise<void> {
    if (lancamento.tipo !== ETipoLancamento.ENTRADA) return;
    if (lancamento.horizonte !== EHorizonteLancamento.PRESENTE) return;
    if (!lancamento.caixaOrigem || !lancamento.distribuicao?.length) return;

    for (const item of lancamento.distribuicao) {
      await this.caixaRepositoryWrite.incrementSaldoById(
        item.caixa,
        -Number(item.valor),
      );
      await this.caixaRepositoryWrite.incrementSaldoById(
        lancamento.caixaOrigem,
        Number(item.valor),
      );
    }
  }

  private somaDistribuicao(distribuicao?: IDistribuicaoLancamento[]): number {
    return (distribuicao ?? []).reduce(
      (sum, item) => sum + Number(item.valor),
      0,
    );
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


  private toEntity(lancamento: ILancamento, overrides: Partial<ILancamento> = {}): Lancamento {
    const merged = { ...lancamento, ...overrides };
    return new Lancamento(
      merged._id,
      merged.user,
      merged.tipo,
      merged.horizonte,
      merged.valor,
      merged.descricao,
      merged.competencia,
      merged.observacao,
      merged.caixaOrigem,
      merged.caixaCompensacao,
      merged.meioPagamento,
      merged.distribuicao,
      merged.parcelaRef,
      merged.parcelaNum,
      merged.totalParcelas,
      merged.recorrente,
      merged.competenciaInicial,
      merged.duracaoMeses,
      merged.ativo,
      merged.mesesAbatidos,
      merged.createdAt,
      merged.updatedAt,
    );
  }

  private ensureUserId(userId: string): void {
    if (!userId?.trim()) {
      throw new DomainError(EErrorCode.USER_NOT_IDENTIFIED, 401);
    }
  }
}
