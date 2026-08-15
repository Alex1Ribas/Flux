import { DomainError } from '../../common/errors/DomainError.js';
import { EErrorCode } from '../../common/errors/enums/EErrorCode.js';
import { assertResourceAccess } from '../../common/helpers/access.helper.js';
import {
  EHorizonteLancamento,
  ETipoLancamento,
  type ILancamento,
} from '../../lancamento/entity/interfaces/lancamento.interface.js';
import {
  normalizeCompetencia,
  normalizeCompetenciaData,
} from '../../orcamento/service/competencia.helper.js';
import type { EUserRole } from '../../user/entity/interfaces/user.interface.js';
import { Conta } from '../entity/conta.entity.js';
import {
  EStatusConta,
  ETipoConta,
  type IConta,
} from '../entity/interfaces/conta.interface.js';
import type {
  IContaService,
  IListContasFiltro,
  IListaContasPaginada,
  IParamsContaService,
  IParamsCreateContaInput,
  IParamsLiquidarConta,
  IParamsUpdateConta,
  IResultadoLiquidacaoConta,
} from '../entity/interfaces/conta.service.interface.js';
import {
  caixaIdDoRecorrente,
  diaVencimentoDoRecorrente,
  listarMesesDoRecorrente,
  montarVencimentoOcorrencia,
  tipoContaDoRecorrente,
} from './ocorrencia.helper.js';

function dataHojeIso(): string {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export class ContaService implements IContaService {
  private readonly contaRepositoryRead: IParamsContaService['contaRepositoryRead'];
  private readonly contaRepositoryWrite: IParamsContaService['contaRepositoryWrite'];
  private readonly caixaRepositoryRead: IParamsContaService['caixaRepositoryRead'];
  private readonly caixaRepositoryWrite: IParamsContaService['caixaRepositoryWrite'];
  private readonly lancamentoService: IParamsContaService['lancamentoService'];
  private readonly lancamentoRepositoryRead: IParamsContaService['lancamentoRepositoryRead'];

  constructor({
    contaRepositoryRead,
    contaRepositoryWrite,
    caixaRepositoryRead,
    caixaRepositoryWrite,
    lancamentoService,
    lancamentoRepositoryRead,
  }: IParamsContaService) {
    this.contaRepositoryRead = contaRepositoryRead;
    this.contaRepositoryWrite = contaRepositoryWrite;
    this.caixaRepositoryRead = caixaRepositoryRead;
    this.caixaRepositoryWrite = caixaRepositoryWrite;
    this.lancamentoService = lancamentoService;
    this.lancamentoRepositoryRead = lancamentoRepositoryRead;
  }

  async createConta(
    requestUserId: string,
    params: IParamsCreateContaInput,
  ): Promise<IConta> {
    this.ensureUserId(requestUserId);
    const tipo = this.validateTipo(params.tipo);
    const descricao = this.validateDescricao(params.descricao);
    const valor = this.validateValor(params.valor);
    const vencimento = normalizeCompetenciaData(params.vencimento);
    if (vencimento.length !== 10) {
      throw new DomainError(EErrorCode.CONTA_VENCIMENTO_INVALID, 400);
    }
    const competencia = normalizeCompetencia(
      params.competencia ?? vencimento,
    );
    const caixaId = this.validateCaixaId(params.caixaId);
    await this.findOwnedCaixa(caixaId, requestUserId);
    const recorrenteId = params.recorrenteId?.trim() || undefined;

    const created = await this.contaRepositoryWrite.createConta(
      new Conta(
        '',
        requestUserId,
        tipo,
        descricao,
        valor,
        competencia,
        vencimento,
        caixaId,
        EStatusConta.ABERTA,
        recorrenteId,
      ),
    );

    if (tipo === ETipoConta.A_PAGAR) {
      await this.recalcularComprometidoCaixa(caixaId, requestUserId);
    }

    return created;
  }

  async listContas(
    requestUserId: string,
    filtro?: IListContasFiltro,
  ): Promise<IListaContasPaginada> {
    this.ensureUserId(requestUserId);
    const pageSizeRaw = Number(filtro?.pageSize) || 10;
    const pageSize = Math.min(100, Math.max(1, pageSizeRaw));
    const lastItemId =
      typeof filtro?.lastItemId === 'string' && filtro.lastItemId.trim()
        ? filtro.lastItemId.trim()
        : undefined;
    const normalized: IListContasFiltro = {
      ...filtro,
      competencia: filtro?.competencia
        ? normalizeCompetencia(filtro.competencia)
        : undefined,
      lastItemId,
      pageSize,
    };
    return this.contaRepositoryRead.listContasByUser(requestUserId, normalized);
  }

  async listTodasContas(
    requestUserId: string,
    filtro?: Omit<IListContasFiltro, 'lastItemId' | 'pageSize'>,
  ): Promise<IConta[]> {
    const items: IConta[] = [];
    let lastItemId: string | undefined;
    let hasMore = true;

    while (hasMore) {
      const page = await this.listContas(requestUserId, {
        ...filtro,
        pageSize: 100,
        lastItemId,
      });
      items.push(...page.items);
      hasMore = page.hasMore;
      if (!page.lastItemId) {
        break;
      }
      lastItemId = page.lastItemId;
    }

    return items;
  }

  async getContaById(
    id: string,
    requestUserId: string,
    requestRole: EUserRole,
  ): Promise<IConta> {
    return this.findAndAssertAccess(id, requestUserId, requestRole);
  }

  async updateContaById(
    id: string,
    requestUserId: string,
    requestRole: EUserRole,
    params: IParamsUpdateConta,
  ): Promise<IConta> {
    const existing = await this.findAndAssertAccess(id, requestUserId, requestRole);
    if (existing.status !== EStatusConta.ABERTA) {
      throw new DomainError(EErrorCode.CONTA_NAO_ABERTA, 400);
    }

    const cleaned: IParamsUpdateConta = {};

    if (params.tipo !== undefined) {
      cleaned.tipo = this.validateTipo(params.tipo);
    }
    if (params.descricao !== undefined) {
      cleaned.descricao = this.validateDescricao(params.descricao);
    }
    if (params.valor !== undefined) {
      cleaned.valor = this.validateValor(params.valor);
    }
    if (params.vencimento !== undefined) {
      const vencimento = normalizeCompetenciaData(params.vencimento);
      if (vencimento.length !== 10) {
        throw new DomainError(EErrorCode.CONTA_VENCIMENTO_INVALID, 400);
      }
      cleaned.vencimento = vencimento;
      cleaned.competencia = normalizeCompetencia(vencimento);
    }
    if (params.competencia !== undefined) {
      cleaned.competencia = normalizeCompetencia(params.competencia);
    }
    if (params.caixaId !== undefined) {
      cleaned.caixaId = this.validateCaixaId(params.caixaId);
      await this.findOwnedCaixa(cleaned.caixaId, existing.user);
    }
    if (params.status === EStatusConta.CANCELADA) {
      cleaned.status = EStatusConta.CANCELADA;
    } else if (params.status !== undefined && params.status !== EStatusConta.ABERTA) {
      throw new DomainError(EErrorCode.CONTA_STATUS_INVALID, 400);
    }

    if (Object.keys(cleaned).length === 0) {
      throw new DomainError(EErrorCode.NO_FIELDS_TO_UPDATE, 400);
    }

    const updated = await this.contaRepositoryWrite.updateContaById(id, cleaned);
    if (!updated) {
      throw new DomainError(EErrorCode.CONTA_NOT_FOUND, 404);
    }

    const caixasAfetadas = new Set([existing.caixaId, updated.caixaId]);
    for (const caixaAfetada of caixasAfetadas) {
      await this.recalcularComprometidoCaixa(caixaAfetada, existing.user);
    }
    return updated;
  }

  async deleteContaById(
    id: string,
    requestUserId: string,
    requestRole: EUserRole,
  ): Promise<IConta> {
    const existing = await this.findAndAssertAccess(id, requestUserId, requestRole);
    if (existing.status === EStatusConta.LIQUIDADA) {
      throw new DomainError(EErrorCode.CONTA_JA_LIQUIDADA, 400);
    }
    const deleted = await this.contaRepositoryWrite.deleteContaById(id);
    if (!deleted) {
      throw new DomainError(EErrorCode.CONTA_NOT_FOUND, 404);
    }
    if (
      existing.status === EStatusConta.ABERTA &&
      existing.tipo === ETipoConta.A_PAGAR
    ) {
      await this.recalcularComprometidoCaixa(existing.caixaId, existing.user);
    }
    return deleted;
  }

  async liquidarContaById(
    id: string,
    requestUserId: string,
    requestRole: EUserRole,
    params: IParamsLiquidarConta = {},
  ): Promise<IResultadoLiquidacaoConta> {
    const existing = await this.findAndAssertAccess(id, requestUserId, requestRole);
    if (existing.status !== EStatusConta.ABERTA) {
      throw new DomainError(EErrorCode.CONTA_NAO_ABERTA, 400);
    }

    const liquidadoEmRaw = params.liquidadoEm ?? dataHojeIso();
    const liquidadoEm = normalizeCompetenciaData(liquidadoEmRaw);
    if (liquidadoEm.length !== 10) {
      throw new DomainError(EErrorCode.CONTA_LIQUIDACAO_DATA_INVALID, 400);
    }

    const caixaId = this.validateCaixaId(params.caixaId ?? existing.caixaId);
    await this.findOwnedCaixa(caixaId, existing.user);

    let lancamentos: ILancamento[];

    if (existing.tipo === ETipoConta.A_PAGAR) {
      // Marca liquidada no comprometimento antes da saída (saldo ainda cobre a obrigação).
      await this.contaRepositoryWrite.updateContaById(id, {
        status: EStatusConta.LIQUIDADA,
        liquidadoEm,
        caixaId,
      });
      await this.recalcularComprometidoCaixa(existing.caixaId, existing.user);
      if (caixaId !== existing.caixaId) {
        await this.recalcularComprometidoCaixa(caixaId, existing.user);
      }

      try {
        lancamentos = await this.lancamentoService.createLancamento(requestUserId, {
          tipo: ETipoLancamento.SAIDA,
          horizonte: EHorizonteLancamento.PRESENTE,
          valor: existing.valor,
          descricao: existing.descricao,
          competencia: liquidadoEm,
          caixaOrigem: caixaId,
          caixaCompensacao: params.caixaCompensacao?.trim() || undefined,
        });
      } catch (error) {
        await this.contaRepositoryWrite.updateContaById(id, {
          status: EStatusConta.ABERTA,
          liquidadoEm: undefined,
          lancamentoId: undefined,
          caixaId: existing.caixaId,
        });
        await this.recalcularComprometidoCaixa(existing.caixaId, existing.user);
        if (caixaId !== existing.caixaId) {
          await this.recalcularComprometidoCaixa(caixaId, existing.user);
        }
        throw error;
      }
    } else {
      lancamentos = await this.lancamentoService.createLancamento(requestUserId, {
        tipo: ETipoLancamento.ENTRADA,
        horizonte: EHorizonteLancamento.PRESENTE,
        valor: existing.valor,
        descricao: existing.descricao,
        competencia: liquidadoEm,
        caixaOrigem: caixaId,
        distribuicao: params.distribuicao,
        distribuirAutomaticamente: params.distribuirAutomaticamente,
      });
    }

    const lancamentoPrincipal = lancamentos[0];
    if (!lancamentoPrincipal) {
      throw new DomainError(EErrorCode.INTERNAL_ERROR, 500);
    }

    const conta = await this.contaRepositoryWrite.updateContaById(id, {
      status: EStatusConta.LIQUIDADA,
      liquidadoEm,
      lancamentoId: lancamentoPrincipal._id,
      caixaId,
    });
    if (!conta) {
      throw new DomainError(EErrorCode.CONTA_NOT_FOUND, 404);
    }

    return { conta, lancamentos };
  }

  async sincronizarOcorrenciasDoRecorrente(
    requestUserId: string,
    recorrente: ILancamento,
  ): Promise<IConta[]> {
    this.ensureUserId(requestUserId);
    if (!recorrente.recorrente) {
      return [];
    }
    if (recorrente.user !== requestUserId) {
      throw new DomainError(EErrorCode.ACCESS_DENIED, 403);
    }

    if (recorrente.ativo === false) {
      await this.removerOcorrenciasAbertasDoRecorrente(requestUserId, recorrente._id);
      return [];
    }

    const caixaId = caixaIdDoRecorrente(recorrente);
    if (!caixaId) {
      throw new DomainError(EErrorCode.CONTA_CAIXA_REQUIRED, 400);
    }
    await this.findOwnedCaixa(caixaId, requestUserId);

    const tipo = tipoContaDoRecorrente(recorrente);
    const descricao = this.validateDescricao(recorrente.descricao);
    const valor = this.validateValor(Number(recorrente.valor));
    const dia = diaVencimentoDoRecorrente(recorrente);
    const meses = listarMesesDoRecorrente(recorrente);
    const existentes = await this.contaRepositoryRead.listContasByRecorrente(
      requestUserId,
      recorrente._id,
    );
    const porCompetencia = new Map(
      existentes.map((conta) => [conta.competencia, conta]),
    );
    const resultado: IConta[] = [];

    for (const competencia of meses) {
      const vencimento = montarVencimentoOcorrencia(competencia, dia);
      const existente = porCompetencia.get(competencia);

      if (!existente) {
        const criada = await this.contaRepositoryWrite.createConta(
          new Conta(
            '',
            requestUserId,
            tipo,
            descricao,
            valor,
            competencia,
            vencimento,
            caixaId,
            EStatusConta.ABERTA,
            recorrente._id,
          ),
        );
        if (tipo === ETipoConta.A_PAGAR) {
          await this.recalcularComprometidoCaixa(caixaId, requestUserId);
        }
        resultado.push(criada);
        continue;
      }

      porCompetencia.delete(competencia);

      if (existente.status !== EStatusConta.ABERTA) {
        resultado.push(existente);
        continue;
      }

      const atualizada = await this.contaRepositoryWrite.updateContaById(
        existente._id,
        {
          tipo,
          descricao,
          valor,
          competencia,
          vencimento,
          caixaId,
        },
      );
      const finalConta = atualizada ?? existente;
      await this.recalcularComprometidoCaixa(existente.caixaId, requestUserId);
      if (finalConta.caixaId !== existente.caixaId) {
        await this.recalcularComprometidoCaixa(finalConta.caixaId, requestUserId);
      }
      resultado.push(finalConta);
    }

    for (const sobra of porCompetencia.values()) {
      if (sobra.status !== EStatusConta.ABERTA) continue;
      await this.contaRepositoryWrite.deleteContaById(sobra._id);
      if (sobra.tipo === ETipoConta.A_PAGAR) {
        await this.recalcularComprometidoCaixa(sobra.caixaId, requestUserId);
      }
    }

    return resultado;
  }

  async removerOcorrenciasAbertasDoRecorrente(
    requestUserId: string,
    recorrenteId: string,
  ): Promise<number> {
    this.ensureUserId(requestUserId);
    const contas = await this.contaRepositoryRead.listContasByRecorrente(
      requestUserId,
      recorrenteId,
    );
    let removidas = 0;
    for (const conta of contas) {
      if (conta.status !== EStatusConta.ABERTA) continue;
      await this.contaRepositoryWrite.deleteContaById(conta._id);
      if (conta.tipo === ETipoConta.A_PAGAR) {
        await this.recalcularComprometidoCaixa(conta.caixaId, requestUserId);
      }
      removidas += 1;
    }
    return removidas;
  }

  async sincronizarOcorrenciasDosRecorrentesDoUsuario(
    requestUserId: string,
  ): Promise<void> {
    this.ensureUserId(requestUserId);
    const recorrentes = await this.lancamentoRepositoryRead.listLancamentosByUser(
      requestUserId,
      { recorrente: true },
    );
    await Promise.all(
      recorrentes.map((recorrente) =>
        this.sincronizarOcorrenciasDoRecorrente(requestUserId, recorrente),
      ),
    );
  }


  private competenciaAtualMes(): string {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    return `${ano}-${mes}`;
  }

  /** Compromete só obrigações do mês corrente e atrasadas (não meses futuros). */
  private async recalcularComprometidoCaixa(
    caixaId: string,
    userId: string,
  ): Promise<void> {
    const mesAtual = this.competenciaAtualMes();
    const contas = await this.listTodasContas(userId, {
      status: EStatusConta.ABERTA,
      tipo: ETipoConta.A_PAGAR,
    });
    const comprometido = contas
      .filter(
        (conta) =>
          conta.caixaId === caixaId && conta.competencia === mesAtual,
      )
      .reduce((sum, conta) => sum + Number(conta.valor), 0);

    const caixa = await this.caixaRepositoryRead.findCaixaById(caixaId);
    if (!caixa) return;
    const atual = Number(caixa.comprometido) || 0;
    const delta = comprometido - atual;
    if (Math.abs(delta) < 0.001) return;
    await this.caixaRepositoryWrite.incrementComprometidoById(caixaId, delta);
  }

  private async findAndAssertAccess(
    id: string,
    requestUserId: string,
    requestRole: EUserRole,
  ): Promise<IConta> {
    this.ensureUserId(requestUserId);
    const conta = await this.contaRepositoryRead.findContaById(id);
    if (!conta) {
      throw new DomainError(EErrorCode.CONTA_NOT_FOUND, 404);
    }
    assertResourceAccess({
      ownerId: conta.user,
      requestUserId,
      requestRole,
    });
    return conta;
  }

  private async findOwnedCaixa(caixaId: string, userId: string) {
    const caixa = await this.caixaRepositoryRead.findCaixaById(caixaId);
    if (!caixa || caixa.user !== userId) {
      throw new DomainError(EErrorCode.CAIXA_NOT_FOUND, 404);
    }
    return caixa;
  }

  private ensureUserId(requestUserId: string): void {
    if (!requestUserId) {
      throw new DomainError(EErrorCode.USER_NOT_IDENTIFIED, 401);
    }
  }

  private validateTipo(tipo: ETipoConta): ETipoConta {
    if (!Object.values(ETipoConta).includes(tipo)) {
      throw new DomainError(EErrorCode.CONTA_TIPO_INVALID, 400);
    }
    return tipo;
  }

  private validateDescricao(descricao: string): string {
    const value = descricao?.trim();
    if (!value) {
      throw new DomainError(EErrorCode.CONTA_DESCRICAO_REQUIRED, 400);
    }
    return value;
  }

  private validateValor(valor: number): number {
    if (typeof valor !== 'number' || Number.isNaN(valor) || valor <= 0) {
      throw new DomainError(EErrorCode.CONTA_VALUE_INVALID, 400);
    }
    return valor;
  }

  private validateCaixaId(caixaId: string): string {
    const value = caixaId?.trim();
    if (!value) {
      throw new DomainError(EErrorCode.CONTA_CAIXA_REQUIRED, 400);
    }
    return value;
  }
}
