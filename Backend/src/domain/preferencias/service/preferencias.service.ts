import { DomainError } from '../../common/errors/DomainError.js';
import { EErrorCode } from '../../common/errors/enums/EErrorCode.js';
import type {
  IConfigLimitesRisco,
  ILimitesRisco,
  IParamsUpdatePreferencias,
  IPreferencias,
} from '../entity/interfaces/preferencias.interface.js';
import type {
  IPreferenciasService,
  IParamsPreferenciasService,
  TipoCategoriaLancamento,
} from '../entity/interfaces/preferencias.service.interface.js';
import {
  LIMITES_RISCO_PADRAO,
  TIPOS_ENTRADA_PADRAO,
  TIPOS_SAIDA_PADRAO,
} from '../entity/interfaces/preferencias.service.interface.js';

export class PreferenciasService implements IPreferenciasService {
  private readonly preferenciasRepositoryRead: IParamsPreferenciasService['preferenciasRepositoryRead'];
  private readonly preferenciasRepositoryWrite: IParamsPreferenciasService['preferenciasRepositoryWrite'];
  private readonly lancamentoRepositoryRead: IParamsPreferenciasService['lancamentoRepositoryRead'];

  constructor({
    preferenciasRepositoryRead,
    preferenciasRepositoryWrite,
    lancamentoRepositoryRead,
  }: IParamsPreferenciasService) {
    this.preferenciasRepositoryRead = preferenciasRepositoryRead;
    this.preferenciasRepositoryWrite = preferenciasRepositoryWrite;
    this.lancamentoRepositoryRead = lancamentoRepositoryRead;
  }

  async getPreferencias(requestUserId: string): Promise<IPreferencias> {
    this.ensureUserId(requestUserId);
    const existing = await this.preferenciasRepositoryRead.findPreferenciasByUser(requestUserId);
    if (existing) return existing;

    return this.preferenciasRepositoryWrite.upsertPreferencias({
      user: requestUserId,
      tiposEntrada: [...TIPOS_ENTRADA_PADRAO],
      tiposSaida: [...TIPOS_SAIDA_PADRAO],
      limitesRisco: {
        global: { ...LIMITES_RISCO_PADRAO.global },
        porCaixa: { ...LIMITES_RISCO_PADRAO.porCaixa },
      },
    });
  }

  async updatePreferencias(
    requestUserId: string,
    params: IParamsUpdatePreferencias,
  ): Promise<IPreferencias> {
    this.ensureUserId(requestUserId);
    const current = await this.getPreferencias(requestUserId);

    const tiposEntrada =
      params.tiposEntrada !== undefined
        ? this.validateTipos(params.tiposEntrada)
        : current.tiposEntrada;
    const tiposSaida =
      params.tiposSaida !== undefined
        ? this.validateTipos(params.tiposSaida)
        : current.tiposSaida;
    const limitesRisco =
      params.limitesRisco !== undefined
        ? this.validateLimitesRisco(params.limitesRisco)
        : current.limitesRisco;
    const distribuicaoAutomatica =
      params.distribuicaoAutomatica !== undefined
        ? params.distribuicaoAutomatica
        : current.distribuicaoAutomatica;

    return this.preferenciasRepositoryWrite.upsertPreferencias({
      user: requestUserId,
      tiposEntrada,
      tiposSaida,
      limitesRisco,
      distribuicaoAutomatica,
    });
  }

  async obterRegrasDistribuicao(requestUserId: string) {
    const prefs = await this.getPreferencias(requestUserId);
    if (!prefs.distribuicaoAutomatica?.ativo) return null;
    return prefs.distribuicaoAutomatica.regras ?? [];
  }

  async buscarCategorias(
    requestUserId: string,
    params: { q?: string; tipo: TipoCategoriaLancamento },
  ): Promise<string[]> {
    this.ensureUserId(requestUserId);
    if (params.tipo !== 'entrada' && params.tipo !== 'saida') {
      throw new DomainError(EErrorCode.VALIDATION_ERROR, 400);
    }

    const q = params.q?.trim() ?? '';
    const preferencias = await this.getPreferencias(requestUserId);
    const listaPrefs =
      params.tipo === 'entrada' ? preferencias.tiposEntrada : preferencias.tiposSaida;

    const filtradasPrefs = listaPrefs.filter((nome) =>
      q ? nome.toLowerCase().includes(q.toLowerCase()) : true,
    );

    const distintasLancamentos =
      await this.lancamentoRepositoryRead.searchCategoriasDistintas(requestUserId, {
        tipo: params.tipo,
        q: q || undefined,
        limit: 20,
      });

    const unicas = new Map<string, string>();
    [...filtradasPrefs, ...distintasLancamentos].forEach((nome) => {
      const chave = nome.trim().toLowerCase();
      if (!chave) return;
      if (!unicas.has(chave)) unicas.set(chave, nome.trim());
    });

    return [...unicas.values()].sort((a, b) => a.localeCompare(b, 'pt-BR')).slice(0, 20);
  }

  async garantirCategoria(
    requestUserId: string,
    tipo: TipoCategoriaLancamento,
    categoria: string,
  ): Promise<void> {
    this.ensureUserId(requestUserId);
    const nome = categoria.trim();
    if (!nome) return;

    const preferencias = await this.getPreferencias(requestUserId);
    const lista =
      tipo === 'entrada' ? [...preferencias.tiposEntrada] : [...preferencias.tiposSaida];
    const existe = lista.some((item) => item.toLowerCase() === nome.toLowerCase());
    if (existe) return;

    lista.push(nome);
    await this.preferenciasRepositoryWrite.upsertPreferencias({
      user: requestUserId,
      tiposEntrada: tipo === 'entrada' ? lista : preferencias.tiposEntrada,
      tiposSaida: tipo === 'saida' ? lista : preferencias.tiposSaida,
      limitesRisco: preferencias.limitesRisco,
    });
  }

  private validateTipos(tipos: string[]): string[] {
    const limpos = [...new Set(tipos.map((tipo) => tipo.trim()).filter(Boolean))];
    if (limpos.length === 0) {
      throw new DomainError(EErrorCode.VALIDATION_ERROR, 400);
    }
    return limpos;
  }

  private validateLimitesRisco(limites: IConfigLimitesRisco): IConfigLimitesRisco {
    return {
      global: this.validateLimites(limites.global),
      porCaixa: Object.fromEntries(
        Object.entries(limites.porCaixa ?? {}).map(([caixaId, valor]) => [
          caixaId,
          this.validateLimites(valor),
        ]),
      ),
    };
  }

  private validateLimites(limites: ILimitesRisco): ILimitesRisco {
    const saudavel = Number(limites.saudavel);
    const atencao = Number(limites.atencao);
    if (
      Number.isNaN(saudavel) ||
      Number.isNaN(atencao) ||
      saudavel <= 0 ||
      atencao <= saudavel
    ) {
      throw new DomainError(EErrorCode.VALIDATION_ERROR, 400);
    }
    return { saudavel, atencao };
  }

  private ensureUserId(userId: string): void {
    if (!userId?.trim()) {
      throw new DomainError(EErrorCode.USER_NOT_IDENTIFIED, 401);
    }
  }
}
