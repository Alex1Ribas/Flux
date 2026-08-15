import { DomainError } from '../../common/errors/DomainError.js';
import { EErrorCode } from '../../common/errors/enums/EErrorCode.js';
import { ETipoCaixa } from '../../caixa/entity/interfaces/caixa.interface.js';
import { ETipoConta } from '../../conta/entity/interfaces/conta.interface.js';
import {
  EHorizonteLancamento,
  ETipoLancamento,
} from '../../lancamento/entity/interfaces/lancamento.interface.js';
import { normalizeCompetenciaData } from '../../orcamento/service/competencia.helper.js';
import type {
  IEmprestimoService,
  IParamsCriarEmprestimo,
  IParamsEmprestimoService,
  IResultadoEmprestimo,
} from '../entity/interfaces/emprestimo.service.interface.js';

export class EmprestimoService implements IEmprestimoService {
  private readonly lancamentoService: IParamsEmprestimoService['lancamentoService'];
  private readonly contaService: IParamsEmprestimoService['contaService'];
  private readonly caixaRepositoryRead: IParamsEmprestimoService['caixaRepositoryRead'];

  constructor({
    lancamentoService,
    contaService,
    caixaRepositoryRead,
  }: IParamsEmprestimoService) {
    this.lancamentoService = lancamentoService;
    this.contaService = contaService;
    this.caixaRepositoryRead = caixaRepositoryRead;
  }

  async criarEmprestimo(
    requestUserId: string,
    params: IParamsCriarEmprestimo,
  ): Promise<IResultadoEmprestimo> {
    if (!requestUserId?.trim()) {
      throw new DomainError(EErrorCode.USER_NOT_IDENTIFIED, 401);
    }

    const valorTotal = Number(params.valorTotal);
    const duracaoMeses = Math.max(1, Math.floor(Number(params.duracaoMeses) || 0));
    if (Number.isNaN(valorTotal) || valorTotal <= 0) {
      throw new DomainError(EErrorCode.LANCAMENTO_VALUE_INVALID, 400);
    }
    if (duracaoMeses < 1) {
      throw new DomainError(EErrorCode.SIMULACAO_DURACAO_INVALIDA, 400);
    }

    const dataPrimeiro = normalizeCompetenciaData(params.dataPrimeiroPagamento);
    if (dataPrimeiro.length !== 10) {
      throw new DomainError(EErrorCode.SIMULACAO_DATA_INVALIDA, 400);
    }

    const origem = await this.caixaRepositoryRead.findCaixaById(params.caixaOrigem);
    if (!origem || origem.user !== requestUserId) {
      throw new DomainError(EErrorCode.CAIXA_NOT_FOUND, 404);
    }
    if (origem.tipo !== ETipoCaixa.ORIGEM) {
      throw new DomainError(EErrorCode.LANCAMENTO_CAIXA_ORIGEM_TIPO_INVALID, 400);
    }

    const caixaParcelas = await this.caixaRepositoryRead.findCaixaById(
      params.caixaParcelas,
    );
    if (!caixaParcelas || caixaParcelas.user !== requestUserId) {
      throw new DomainError(EErrorCode.CAIXA_NOT_FOUND, 404);
    }

    const descricao = (params.descricao?.trim() || 'Empréstimo').slice(0, 200);
    const parcelaBase = Math.floor((valorTotal / duracaoMeses) * 100) / 100;
    let acumulado = 0;

    const entradas = await this.lancamentoService.createLancamento(requestUserId, {
      tipo: ETipoLancamento.ENTRADA,
      horizonte: EHorizonteLancamento.PRESENTE,
      valor: valorTotal,
      descricao,
      competencia: dataPrimeiro,
      caixaOrigem: params.caixaOrigem,
      distribuicao: params.distribuicao,
      distribuirAutomaticamente: params.distribuirAutomaticamente,
    });
    const entrada = entradas[0];
    if (!entrada) {
      throw new DomainError(EErrorCode.INTERNAL_ERROR, 500);
    }

    const parcelas = [];
    for (let indice = 0; indice < duracaoMeses; indice++) {
      const vencimento = this.adicionarMeses(dataPrimeiro, indice);
      const valor =
        indice === duracaoMeses - 1
          ? Math.round((valorTotal - acumulado) * 100) / 100
          : parcelaBase;
      acumulado = Math.round((acumulado + valor) * 100) / 100;

      const conta = await this.contaService.createConta(requestUserId, {
        tipo: ETipoConta.A_PAGAR,
        descricao: `${descricao} (${indice + 1}/${duracaoMeses})`,
        valor,
        competencia: vencimento.slice(0, 7),
        vencimento,
        caixaId: params.caixaParcelas,
      });
      parcelas.push(conta);
    }

    return { entrada, parcelas };
  }

  private adicionarMeses(dataIso: string, meses: number): string {
    const [ano, mes, dia] = dataIso.split('-').map(Number);
    const data = new Date(Date.UTC(ano, mes - 1 + meses, 1));
    const anoN = data.getUTCFullYear();
    const mesN = data.getUTCMonth() + 1;
    const ultimoDia = new Date(Date.UTC(anoN, mesN, 0)).getUTCDate();
    const diaN = Math.min(dia, ultimoDia);
    return `${anoN}-${String(mesN).padStart(2, '0')}-${String(diaN).padStart(2, '0')}`;
  }
}
