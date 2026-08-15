import type { IConta } from '../../../conta/entity/interfaces/conta.interface.js';
import type { ILancamento } from '../../../lancamento/entity/interfaces/lancamento.interface.js';
import type { IDistribuicaoLancamento } from '../../../lancamento/entity/interfaces/lancamento.interface.js';
import type { IContaService } from '../../../conta/entity/interfaces/conta.service.interface.js';
import type { ILancamentoService } from '../../../lancamento/entity/interfaces/lancamento.service.interface.js';
import type { ICaixaRepositoryRead } from '../../../caixa/repository/caixa.repository.read.js';

export interface IParamsCriarEmprestimo {
  valorTotal: number;
  duracaoMeses: number;
  dataPrimeiroPagamento: string;
  caixaOrigem: string;
  caixaParcelas: string;
  descricao?: string;
  distribuicao?: IDistribuicaoLancamento[];
  distribuirAutomaticamente?: boolean;
}

export interface IResultadoEmprestimo {
  entrada: ILancamento;
  parcelas: IConta[];
}

export interface IParamsEmprestimoService {
  lancamentoService: ILancamentoService;
  contaService: IContaService;
  caixaRepositoryRead: ICaixaRepositoryRead;
}

export interface IEmprestimoService {
  criarEmprestimo(
    requestUserId: string,
    params: IParamsCriarEmprestimo,
  ): Promise<IResultadoEmprestimo>;
}
