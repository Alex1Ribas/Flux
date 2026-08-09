import { DomainError } from '../../common/errors/DomainError.js';
import { EErrorCode } from '../../common/errors/enums/EErrorCode.js';
import { assertResourceAccess } from '../../common/helpers/access.helper.js';
import {
  EHorizonteLancamento,
  ETipoLancamento,
} from '../../lancamento/entity/interfaces/lancamento.interface.js';
import { normalizeCompetencia, normalizeCompetenciaData } from '../../orcamento/service/competencia.helper.js';
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
  IParamsContaService,
  IParamsCreateContaInput,
  IParamsLiquidarConta,
  IParamsUpdateConta,
  IResultadoLiquidacaoConta,
} from '../entity/interfaces/conta.service.interface.js';

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
  private readonly lancamentoService: IParamsContaService['lancamentoService'];

  constructor({
    contaRepositoryRead,
    contaRepositoryWrite,
    caixaRepositoryRead,
    lancamentoService,
  }: IParamsContaService) {
    this.contaRepositoryRead = contaRepositoryRead;
    this.contaRepositoryWrite = contaRepositoryWrite;
    this.caixaRepositoryRead = caixaRepositoryRead;
    this.lancamentoService = lancamentoService;
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
    const caixaId = this.validateCaixaId(params.caixaId);
    await this.findOwnedCaixa(caixaId, requestUserId);

    return this.contaRepositoryWrite.createConta(
      new Conta(
        '',
        requestUserId,
        tipo,
        descricao,
        valor,
        vencimento,
        caixaId,
        EStatusConta.ABERTA,
      ),
    );
  }

  async listContas(
    requestUserId: string,
    filtro?: IListContasFiltro,
  ): Promise<IConta[]> {
    this.ensureUserId(requestUserId);
    const normalized: IListContasFiltro = {
      ...filtro,
      competencia: filtro?.competencia
        ? normalizeCompetencia(filtro.competencia)
        : undefined,
    };
    return this.contaRepositoryRead.listContasByUser(requestUserId, normalized);
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

    const lancamentos =
      existing.tipo === ETipoConta.A_PAGAR
        ? await this.lancamentoService.createLancamento(requestUserId, {
            tipo: ETipoLancamento.SAIDA,
            horizonte: EHorizonteLancamento.PRESENTE,
            valor: existing.valor,
            descricao: existing.descricao,
            competencia: liquidadoEm,
            caixaOrigem: caixaId,
            caixaCompensacao: params.caixaCompensacao?.trim() || undefined,
          })
        : await this.lancamentoService.createLancamento(requestUserId, {
            tipo: ETipoLancamento.ENTRADA,
            horizonte: EHorizonteLancamento.PRESENTE,
            valor: existing.valor,
            descricao: existing.descricao,
            competencia: liquidadoEm,
            distribuicao: [{ caixa: caixaId, valor: existing.valor }],
          });

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
