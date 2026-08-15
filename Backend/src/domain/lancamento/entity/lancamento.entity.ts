import type {
  EHorizonteLancamento,
  EMeioPagamento,
  ETipoLancamento,
  IDistribuicaoLancamento,
} from './interfaces/lancamento.interface.js';

export class Lancamento {
  constructor(
    public readonly _id: string,
    public readonly user: string,
    public tipo: ETipoLancamento,
    public horizonte: EHorizonteLancamento,
    public valor: number,
    public descricao: string,
    public competencia: string,
    public observacao?: string,
    public caixaOrigem?: string,
    public caixaCompensacao?: string,
    public meioPagamento?: EMeioPagamento | 'caixa' | 'cartao',
    public distribuicao?: IDistribuicaoLancamento[],
    public parcelaRef?: string,
    public parcelaNum?: number,
    public totalParcelas?: number,
    public recorrente: boolean = false,
    public competenciaInicial?: string,
    public duracaoMeses?: number,
    public ativo?: boolean,
    public mesesAbatidos?: number,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}
}
