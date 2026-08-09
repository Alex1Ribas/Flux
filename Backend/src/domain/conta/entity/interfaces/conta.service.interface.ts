import type { EUserRole } from '../../../user/entity/interfaces/user.interface.js';
import type { ILancamento } from '../../../lancamento/entity/interfaces/lancamento.interface.js';
import type {
  EStatusConta,
  ETipoConta,
  IConta,
  IParamsCreateConta,
} from './conta.interface.js';
import type { IContaRepositoryRead } from '../../repository/conta.repository.read.js';
import type { IContaRepositoryWrite } from '../../repository/conta.repository.write.js';
import type { ICaixaRepositoryRead } from '../../../caixa/repository/caixa.repository.read.js';
import type { ILancamentoService } from '../../../lancamento/entity/interfaces/lancamento.service.interface.js';

export interface IParamsCreateContaInput extends Omit<IParamsCreateConta, 'user'> {
  userId?: string;
}

export interface IParamsUpdateConta {
  tipo?: ETipoConta;
  descricao?: string;
  valor?: number;
  vencimento?: string;
  caixaId?: string;
  status?: EStatusConta;
}

export interface IParamsLiquidarConta {
  /** Data efetiva do pagamento/recebimento (AAAA-MM-DD). Default: hoje. */
  liquidadoEm?: string;
  /** Sobrescreve a caixa planejada na liquidação. */
  caixaId?: string;
  /** Caixa de compensação quando a saída estoura o orçamento. */
  caixaCompensacao?: string;
}

export interface IResultadoLiquidacaoConta {
  conta: IConta;
  lancamentos: ILancamento[];
}

export interface IListContasFiltro {
  status?: EStatusConta;
  tipo?: ETipoConta;
  /** Filtra por vencimento no mês AAAA-MM. */
  competencia?: string;
}

export interface IParamsContaService {
  contaRepositoryRead: IContaRepositoryRead;
  contaRepositoryWrite: IContaRepositoryWrite;
  caixaRepositoryRead: ICaixaRepositoryRead;
  lancamentoService: ILancamentoService;
}

export interface IContaService {
  createConta(requestUserId: string, params: IParamsCreateContaInput): Promise<IConta>;
  listContas(requestUserId: string, filtro?: IListContasFiltro): Promise<IConta[]>;
  getContaById(
    id: string,
    requestUserId: string,
    requestRole: EUserRole,
  ): Promise<IConta>;
  updateContaById(
    id: string,
    requestUserId: string,
    requestRole: EUserRole,
    params: IParamsUpdateConta,
  ): Promise<IConta>;
  deleteContaById(
    id: string,
    requestUserId: string,
    requestRole: EUserRole,
  ): Promise<IConta>;
  liquidarContaById(
    id: string,
    requestUserId: string,
    requestRole: EUserRole,
    params?: IParamsLiquidarConta,
  ): Promise<IResultadoLiquidacaoConta>;
}
