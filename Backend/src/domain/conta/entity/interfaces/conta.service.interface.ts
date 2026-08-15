import type { EUserRole } from '../../../user/entity/interfaces/user.interface.js';
import type { ILancamento } from '../../../lancamento/entity/interfaces/lancamento.interface.js';
import type {
  EStatusConta,
  ETipoConta,
  IConta,
  IParamsCreateConta,
} from './conta.interface.js';
import type {
  IContaRepositoryRead,
  IListaContasPaginada,
} from '../../repository/conta.repository.read.js';
import type { IContaRepositoryWrite } from '../../repository/conta.repository.write.js';
import type { ICaixaRepositoryRead } from '../../../caixa/repository/caixa.repository.read.js';
import type { ICaixaRepositoryWrite } from '../../../caixa/repository/caixa.repository.write.js';
import type { IDistribuicaoLancamento } from '../../../lancamento/entity/interfaces/lancamento.interface.js';
import type { ILancamentoService } from '../../../lancamento/entity/interfaces/lancamento.service.interface.js';
import type { ILancamentoRepositoryRead } from '../../../lancamento/repository/lancamento.repository.read.js';

export type { IListaContasPaginada };

export interface IParamsCreateContaInput extends Omit<IParamsCreateConta, 'user'> {
  userId?: string;
}

export interface IParamsUpdateConta {
  tipo?: ETipoConta;
  descricao?: string;
  valor?: number;
  competencia?: string;
  vencimento?: string;
  caixaId?: string;
  status?: EStatusConta;
  recorrenteId?: string;
}

export interface IParamsLiquidarConta {
  /** Data efetiva do pagamento/recebimento (AAAA-MM-DD). Default: hoje. */
  liquidadoEm?: string;
  /** Sobrescreve a caixa planejada na liquidação. */
  caixaId?: string;
  /** Caixa de compensação quando a saída estoura o orçamento. */
  caixaCompensacao?: string;
  /** Após receber (a_receber), distribui imediatamente. */
  distribuicao?: IDistribuicaoLancamento[];
  /** Após receber, aplica regras automáticas de distribuição. */
  distribuirAutomaticamente?: boolean;
}

export interface IResultadoLiquidacaoConta {
  conta: IConta;
  lancamentos: ILancamento[];
}

export interface IListContasFiltro {
  status?: EStatusConta;
  tipo?: ETipoConta;
  /** Filtra por competência da ocorrência (AAAA-MM). */
  competencia?: string;
  recorrenteId?: string;
  /** Cursor: `_id` do último item da página anterior. */
  lastItemId?: string;
  /** Itens por página. Default: 10. Máximo: 100. */
  pageSize?: number;
}

export interface IParamsContaService {
  contaRepositoryRead: IContaRepositoryRead;
  contaRepositoryWrite: IContaRepositoryWrite;
  caixaRepositoryRead: ICaixaRepositoryRead;
  caixaRepositoryWrite: ICaixaRepositoryWrite;
  lancamentoService: ILancamentoService;
  lancamentoRepositoryRead: ILancamentoRepositoryRead;
}

export interface IContaService {
  createConta(requestUserId: string, params: IParamsCreateContaInput): Promise<IConta>;
  listContas(
    requestUserId: string,
    filtro?: IListContasFiltro,
  ): Promise<IListaContasPaginada>;
  /** Lista todas as contas do filtro (percorre o cursor até o fim). */
  listTodasContas(
    requestUserId: string,
    filtro?: Omit<IListContasFiltro, 'lastItemId' | 'pageSize'>,
  ): Promise<IConta[]>;
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
  /** Gera/atualiza ocorrências abertas a partir da regra recorrente. */
  sincronizarOcorrenciasDoRecorrente(
    requestUserId: string,
    recorrente: ILancamento,
  ): Promise<IConta[]>;
  /** Remove ocorrências abertas fora da regra (ex.: exclusão do template). */
  removerOcorrenciasAbertasDoRecorrente(
    requestUserId: string,
    recorrenteId: string,
  ): Promise<number>;
  /** Garante ocorrências para todos os templates recorrentes do usuário. */
  sincronizarOcorrenciasDosRecorrentesDoUsuario(
    requestUserId: string,
  ): Promise<void>;
}
