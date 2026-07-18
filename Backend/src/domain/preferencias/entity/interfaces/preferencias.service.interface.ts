import type { IPreferenciasRepositoryRead, IPreferenciasRepositoryWrite } from '../../repository/preferencias.repository.js';
import type { ILancamentoRepositoryRead } from '../../../lancamento/repository/lancamento.repository.read.js';
import type {
  IPreferencias,
  IParamsUpdatePreferencias,
} from './preferencias.interface.js';

export type TipoCategoriaLancamento = 'entrada' | 'saida';

export interface IParamsPreferenciasService {
  preferenciasRepositoryRead: IPreferenciasRepositoryRead;
  preferenciasRepositoryWrite: IPreferenciasRepositoryWrite;
  lancamentoRepositoryRead: ILancamentoRepositoryRead;
}

export interface IPreferenciasService {
  getPreferencias(requestUserId: string): Promise<IPreferencias>;
  updatePreferencias(
    requestUserId: string,
    params: IParamsUpdatePreferencias,
  ): Promise<IPreferencias>;
  buscarCategorias(
    requestUserId: string,
    params: { q?: string; tipo: TipoCategoriaLancamento },
  ): Promise<string[]>;
  garantirCategoria(
    requestUserId: string,
    tipo: TipoCategoriaLancamento,
    categoria: string,
  ): Promise<void>;
}

export const TIPOS_ENTRADA_PADRAO = [
  'Salário',
  'Renda extra',
  'Venda',
  'Transferência',
  'Reembolso',
  'Rendimento',
];

export const TIPOS_SAIDA_PADRAO = [
  'Compromisso',
  'Conta recorrente',
  'Compra planejada',
  'Parcela',
  'Reserva utilizada',
  'Transferência',
  'Antecipação',
  'Ajuste de caixa',
];

export const LIMITES_RISCO_PADRAO = {
  global: { saudavel: 30, atencao: 50 },
  porCaixa: {},
};
