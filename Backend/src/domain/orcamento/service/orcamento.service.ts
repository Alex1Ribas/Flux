import { DomainError } from '../../common/errors/DomainError.js';
import { EErrorCode } from '../../common/errors/enums/EErrorCode.js';
import { Orcamento } from '../entity/orcamento.entity.js';
import type { IOrcamento } from '../entity/interfaces/orcamento.interface.js';
import type {
  IOrcamentoService,
  IParamsOrcamentoService,
  IParamsUpsertOrcamentoInput,
} from '../entity/interfaces/orcamento.service.interface.js';
import { normalizeCompetencia } from './competencia.helper.js';

export class OrcamentoService implements IOrcamentoService {
  private readonly orcamentoRepositoryRead: IParamsOrcamentoService['orcamentoRepositoryRead'];
  private readonly orcamentoRepositoryWrite: IParamsOrcamentoService['orcamentoRepositoryWrite'];

  constructor({
    orcamentoRepositoryRead,
    orcamentoRepositoryWrite,
  }: IParamsOrcamentoService) {
    this.orcamentoRepositoryRead = orcamentoRepositoryRead;
    this.orcamentoRepositoryWrite = orcamentoRepositoryWrite;
  }

  async listOrcamentos(
    requestUserId: string,
    competencia: string,
  ): Promise<IOrcamento[]> {
    this.ensureUserId(requestUserId);
    const mes = normalizeCompetencia(competencia);
    return this.orcamentoRepositoryRead.listOrcamentosByUserCompetencia(
      requestUserId,
      mes,
    );
  }

  async upsertOrcamentos(
    requestUserId: string,
    competencia: string,
    orcamentos: IParamsUpsertOrcamentoInput[],
  ): Promise<IOrcamento[]> {
    this.ensureUserId(requestUserId);
    const mes = normalizeCompetencia(competencia);
    if (!Array.isArray(orcamentos)) {
      throw new DomainError(EErrorCode.VALIDATION_ERROR, 400);
    }

    const results: IOrcamento[] = [];
    for (const input of orcamentos) {
      if (!input.caixa?.trim()) {
        throw new DomainError(EErrorCode.CAIXA_NOT_FOUND, 404);
      }
      const valor = Number(input.valor);
      if (Number.isNaN(valor) || valor < 0) {
        throw new DomainError(EErrorCode.ORCAMENTO_VALUE_INVALID, 400);
      }
      results.push(
        await this.orcamentoRepositoryWrite.upsertOrcamento(
          new Orcamento('', requestUserId, input.caixa.trim(), mes, valor),
        ),
      );
    }
    return results;
  }

  private ensureUserId(userId: string): void {
    if (!userId?.trim()) {
      throw new DomainError(EErrorCode.USER_NOT_IDENTIFIED, 401);
    }
  }
}
