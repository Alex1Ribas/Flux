import type { EUserRole } from '../../../user/entity/interfaces/user.interface.js';
import type {
  IDistribuicaoLancamento,
  ILancamento,
  IListLancamentosFiltro,
  IParamsCreateLancamento,
  IParamsUpdateLancamento,
} from './lancamento.interface.js';
import type { ICaixaRepositoryRead } from '../../../caixa/repository/caixa.repository.read.js';
import type { ICaixaRepositoryWrite } from '../../../caixa/repository/caixa.repository.write.js';
import type { IOrcamentoRepositoryRead } from '../../../orcamento/repository/orcamento.repository.read.js';
import type { ILancamentoRepositoryRead } from '../../repository/lancamento.repository.read.js';
import type { ILancamentoRepositoryWrite } from '../../repository/lancamento.repository.write.js';

export interface IParamsCreateLancamentoInput
  extends Omit<IParamsCreateLancamento, 'user'> {
  userId?: string;
  /** Se true e houver regras em preferências, aplica distribuição automática após criar. */
  distribuirAutomaticamente?: boolean;
}

export interface IParamsUpdateLancamentoInput extends IParamsUpdateLancamento {}

export interface IParamsDistribuirLancamento {
  itens: IDistribuicaoLancamento[];
}

export interface IParamsLancamentoService {
  lancamentoRepositoryRead: ILancamentoRepositoryRead;
  lancamentoRepositoryWrite: ILancamentoRepositoryWrite;
  caixaRepositoryRead: ICaixaRepositoryRead;
  caixaRepositoryWrite: ICaixaRepositoryWrite;
  orcamentoRepositoryRead: IOrcamentoRepositoryRead;
  preferenciasService: {
    garantirCategoria(
      requestUserId: string,
      tipo: 'entrada' | 'saida',
      categoria: string,
    ): Promise<void>;
    obterRegrasDistribuicao?(
      requestUserId: string,
    ): Promise<IRegraDistribuicaoPreferencia[] | null>;
  };
}

export interface IRegraDistribuicaoPreferencia {
  prioridade: number;
  caixaId: string;
  modo: 'valor_fixo' | 'completar_meta' | 'restante';
  valorFixo?: number;
}

export interface ILancamentoService {
  createLancamento(
    requestUserId: string,
    params: IParamsCreateLancamentoInput,
  ): Promise<ILancamento[]>;
  listLancamentos(
    requestUserId: string,
    filtro?: IListLancamentosFiltro,
  ): Promise<ILancamento[]>;
  getLancamentoById(
    id: string,
    requestUserId: string,
    requestRole: EUserRole,
  ): Promise<ILancamento>;
  updateLancamentoById(
    id: string,
    requestUserId: string,
    requestRole: EUserRole,
    params: IParamsUpdateLancamentoInput,
  ): Promise<ILancamento>;
  deleteLancamentoById(
    id: string,
    requestUserId: string,
    requestRole: EUserRole,
  ): Promise<ILancamento>;
  distribuirLancamentoById(
    id: string,
    requestUserId: string,
    requestRole: EUserRole,
    params: IParamsDistribuirLancamento,
  ): Promise<ILancamento>;
}
