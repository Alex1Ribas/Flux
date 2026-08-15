import { DomainError } from '../../common/errors/DomainError.js';
import { EErrorCode } from '../../common/errors/enums/EErrorCode.js';
import { assertResourceAccess } from '../../common/helpers/access.helper.js';
import { Caixa } from '../entity/caixa.entity.js';
import {
  ETipoCaixa,
  type ICaixa,
} from '../entity/interfaces/caixa.interface.js';
import type {
  ICaixaService,
  IParamsCaixaService,
  IParamsCreateCaixaInput,
  IParamsUpdateCaixa,
} from '../entity/interfaces/caixa.service.interface.js';
import type { EUserRole } from '../../user/entity/interfaces/user.interface.js';

export class CaixaService implements ICaixaService {
  private readonly caixaRepositoryRead: IParamsCaixaService['caixaRepositoryRead'];
  private readonly caixaRepositoryWrite: IParamsCaixaService['caixaRepositoryWrite'];

  constructor({
    caixaRepositoryRead,
    caixaRepositoryWrite,
  }: IParamsCaixaService) {
    this.caixaRepositoryRead = caixaRepositoryRead;
    this.caixaRepositoryWrite = caixaRepositoryWrite;
  }

  async createCaixa(
    requestUserId: string,
    params: IParamsCreateCaixaInput,
  ): Promise<ICaixa> {
    this.ensureUserId(requestUserId);
    const ownerId = requestUserId;
    const nome = this.validateNome(params.nome);
    const saldo = this.validateNumber(params.saldo ?? 0);
    const tipo = this.validateTipo(params.tipo);
    const camposTipo = this.validateCamposPorTipo(tipo, params);

    const duplicated = await this.caixaRepositoryRead.findCaixaByNameAndUser(
      nome,
      ownerId,
    );
    if (duplicated) {
      throw new DomainError(EErrorCode.CAIXA_ALREADY_EXISTS, 409);
    }

    return this.caixaRepositoryWrite.createCaixa(
      new Caixa(
        '',
        ownerId,
        nome,
        saldo,
        tipo,
        0,
        camposTipo.meta,
        camposTipo.aporteMensal,
        camposTipo.orcamentoMensal,
      ),
    );
  }

  async listCaixas(requestUserId: string): Promise<ICaixa[]> {
    this.ensureUserId(requestUserId);
    return this.caixaRepositoryRead.listCaixasByUser(requestUserId);
  }

  async getCaixaById(
    id: string,
    requestUserId: string,
    requestRole: EUserRole,
  ): Promise<ICaixa> {
    return this.findAndAssertAccess(id, requestUserId, requestRole);
  }

  async updateCaixaById(
    id: string,
    requestUserId: string,
    requestRole: EUserRole,
    params: IParamsUpdateCaixa,
  ): Promise<ICaixa> {
    const existing = await this.findAndAssertAccess(id, requestUserId, requestRole);
    const cleaned: IParamsUpdateCaixa = {};

    if (params.nome !== undefined) {
      const nome = this.validateNome(params.nome);
      const duplicated = await this.caixaRepositoryRead.findCaixaByNameAndUser(
        nome,
        existing.user,
      );
      if (duplicated && duplicated._id !== id) {
        throw new DomainError(EErrorCode.CAIXA_ALREADY_EXISTS, 409);
      }
      cleaned.nome = nome;
    }

    if (params.saldo !== undefined) {
      cleaned.saldo = this.validateNumber(params.saldo);
    }

    const tipo = params.tipo !== undefined ? this.validateTipo(params.tipo) : existing.tipo;
    if (params.tipo !== undefined) {
      cleaned.tipo = tipo;
    }

    const precisaValidarTipo =
      params.tipo !== undefined ||
      params.meta !== undefined ||
      params.aporteMensal !== undefined ||
      params.orcamentoMensal !== undefined;

    if (precisaValidarTipo) {
      const camposTipo = this.validateCamposPorTipo(tipo, {
        meta: params.meta ?? existing.meta,
        aporteMensal: params.aporteMensal ?? existing.aporteMensal,
        orcamentoMensal: params.orcamentoMensal ?? existing.orcamentoMensal,
      });
      cleaned.meta = camposTipo.meta;
      cleaned.aporteMensal = camposTipo.aporteMensal;
      cleaned.orcamentoMensal = camposTipo.orcamentoMensal;
    }

    if (Object.keys(cleaned).length === 0) {
      throw new DomainError(EErrorCode.NO_FIELDS_TO_UPDATE, 400);
    }

    const updated = await this.caixaRepositoryWrite.updateCaixaById(id, cleaned);
    if (!updated) {
      throw new DomainError(EErrorCode.CAIXA_NOT_FOUND, 404);
    }
    return updated;
  }

  async deleteCaixaById(
    id: string,
    requestUserId: string,
    requestRole: EUserRole,
  ): Promise<ICaixa> {
    await this.findAndAssertAccess(id, requestUserId, requestRole);
    const deleted = await this.caixaRepositoryWrite.deleteCaixaById(id);
    if (!deleted) {
      throw new DomainError(EErrorCode.CAIXA_NOT_FOUND, 404);
    }
    return deleted;
  }

  private async findAndAssertAccess(
    id: string,
    requestUserId: string,
    requestRole: EUserRole,
  ): Promise<ICaixa> {
    this.ensureUserId(requestUserId);
    const caixa = await this.caixaRepositoryRead.findCaixaById(id);
    if (!caixa) {
      throw new DomainError(EErrorCode.CAIXA_NOT_FOUND, 404);
    }
    assertResourceAccess({
      ownerId: caixa.user,
      requestUserId,
      requestRole,
    });
    return caixa;
  }

  private ensureUserId(userId: string): void {
    if (!userId?.trim()) {
      throw new DomainError(EErrorCode.USER_NOT_IDENTIFIED, 401);
    }
  }

  private validateNome(nome: string): string {
    const trimmed = nome?.trim();
    if (!trimmed) {
      throw new DomainError(EErrorCode.CAIXA_NAME_REQUIRED, 400);
    }
    return trimmed;
  }

  private validateNumber(value: number): number {
    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
      throw new DomainError(EErrorCode.CAIXA_VALUE_INVALID, 400);
    }
    return numeric;
  }

  private validateTipo(tipo: ETipoCaixa | string | undefined): ETipoCaixa {
    if (!tipo || !Object.values(ETipoCaixa).includes(tipo as ETipoCaixa)) {
      throw new DomainError(EErrorCode.CAIXA_TIPO_INVALID, 400);
    }
    return tipo as ETipoCaixa;
  }

  private validateCamposPorTipo(
    tipo: ETipoCaixa,
    params: {
      meta?: number;
      aporteMensal?: number;
      orcamentoMensal?: number;
    },
  ): {
    meta?: number;
    aporteMensal?: number;
    orcamentoMensal?: number;
  } {
    if (tipo === ETipoCaixa.ORIGEM) {
      return {
        meta: undefined,
        aporteMensal: undefined,
        orcamentoMensal: undefined,
      };
    }

    if (tipo === ETipoCaixa.OBJETIVO) {
      const meta = Number(params.meta);
      const aporteMensal = Number(params.aporteMensal);
      if (Number.isNaN(meta) || meta <= 0) {
        throw new DomainError(EErrorCode.CAIXA_META_INVALID, 400);
      }
      if (Number.isNaN(aporteMensal) || aporteMensal <= 0) {
        throw new DomainError(EErrorCode.CAIXA_APORTE_INVALID, 400);
      }
      return { meta, aporteMensal, orcamentoMensal: undefined };
    }

    const orcamentoMensal = Number(params.orcamentoMensal);
    if (Number.isNaN(orcamentoMensal) || orcamentoMensal <= 0) {
      throw new DomainError(EErrorCode.CAIXA_ORCAMENTO_INVALID, 400);
    }
    return { meta: undefined, aporteMensal: undefined, orcamentoMensal };
  }
}
