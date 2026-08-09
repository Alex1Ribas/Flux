import { DomainError } from '../../common/errors/DomainError.js';
import { EErrorCode } from '../../common/errors/enums/EErrorCode.js';
import {
  EStatusConta,
  ETipoConta,
  type IConta,
} from '../../conta/entity/interfaces/conta.interface.js';
import type { IContaService } from '../../conta/entity/interfaces/conta.service.interface.js';
import {
  ETipoLancamento,
  type ILancamento,
} from '../../lancamento/entity/interfaces/lancamento.interface.js';
import { normalizeCompetencia } from '../../orcamento/service/competencia.helper.js';
import type {
  IAcompanhamentoMes,
  IAcompanhamentoService,
  IComposicaoRisco,
  IParamsAcompanhamentoService,
  IRiscoPrevisto,
  StatusRiscoMensal,
} from '../entity/interfaces/acompanhamento.service.interface.js';

const LIMITES_RISCO_PADRAO = {
  saudavel: 30,
  atencao: 50,
};

type LinhaPrevisto = {
  id: string;
  nome: string;
  tipo: 'entrada' | 'saida';
  valor: number;
};

function montarRisco(entradaPrevista: number, comprometido: number): IRiscoPrevisto {
  const risco = entradaPrevista > 0 ? (comprometido / entradaPrevista) * 100 : 0;
  return { entradaPrevista, comprometido, risco };
}

function linhasDasContasAbertas(contas: IConta[]): LinhaPrevisto[] {
  return contas.map((conta) => ({
    id: conta._id,
    nome: conta.descricao,
    tipo: conta.tipo === ETipoConta.A_RECEBER ? 'entrada' : 'saida',
    valor: Number(conta.valor),
  }));
}

export class AcompanhamentoService implements IAcompanhamentoService {
  private readonly lancamentoRepositoryRead: IParamsAcompanhamentoService['lancamentoRepositoryRead'];
  private readonly contaService: IContaService;

  constructor({
    lancamentoRepositoryRead,
    contaService,
  }: IParamsAcompanhamentoService) {
    this.lancamentoRepositoryRead = lancamentoRepositoryRead;
    this.contaService = contaService;
  }

  async montarAcompanhamentoMes(
    requestUserId: string,
    competencia: string,
  ): Promise<IAcompanhamentoMes> {
    if (!requestUserId?.trim()) {
      throw new DomainError(EErrorCode.USER_NOT_IDENTIFIED, 401);
    }

    const mes = normalizeCompetencia(competencia);
    await this.contaService.sincronizarOcorrenciasDosRecorrentesDoUsuario(
      requestUserId,
    );

    const [lancamentosMes, contasAbertas] = await Promise.all([
      this.lancamentoRepositoryRead.listLancamentosByUserCompetencia(
        requestUserId,
        mes,
      ),
      this.contaService.listTodasContas(requestUserId, {
        status: EStatusConta.ABERTA,
        competencia: mes,
      }),
    ]);

    const linhas = linhasDasContasAbertas(contasAbertas);
    const risco = this.calcRiscoPrevisto(linhas);
    const { saidasAvulsas, entradasAvulsas } = this.somarAvulsos(lancamentosMes);
    const diferencialValor = saidasAvulsas - entradasAvulsas;
    const diferencial =
      risco.entradaPrevista > 0 ? (diferencialValor / risco.entradaPrevista) * 100 : 0;
    const riscoReal = montarRisco(
      risco.entradaPrevista,
      Math.max(0, risco.comprometido + diferencialValor),
    );
    const status = this.classificarStatus(risco.risco);

    return {
      competencia: mes,
      risco,
      riscoReal,
      diferencial,
      diferencialValor,
      status,
      dentroPlanejado: status === 'saudavel',
      limites: LIMITES_RISCO_PADRAO,
      composicao: this.calcComposicaoRisco(linhas, risco.comprometido),
    };
  }

  private calcRiscoPrevisto(linhas: LinhaPrevisto[]): IRiscoPrevisto {
    let entradaPrevista = 0;
    let comprometido = 0;

    linhas.forEach((linha) => {
      if (linha.tipo === 'entrada') {
        entradaPrevista += linha.valor;
      } else {
        comprometido += linha.valor;
      }
    });

    return montarRisco(entradaPrevista, comprometido);
  }

  private somarAvulsos(lancamentos: ILancamento[]) {
    let saidasAvulsas = 0;
    let entradasAvulsas = 0;

    lancamentos
      .filter((lancamento) => !lancamento.recorrente)
      .forEach((lancamento) => {
        const valor = Number(lancamento.valor);
        if (lancamento.tipo === ETipoLancamento.SAIDA) {
          saidasAvulsas += valor;
        } else {
          entradasAvulsas += valor;
        }
      });

    return { saidasAvulsas, entradasAvulsas };
  }

  private classificarStatus(risco: number): StatusRiscoMensal {
    if (risco <= LIMITES_RISCO_PADRAO.saudavel) return 'saudavel';
    if (risco <= LIMITES_RISCO_PADRAO.atencao) return 'atencao';
    return 'critico';
  }

  private calcComposicaoRisco(
    linhas: LinhaPrevisto[],
    comprometido: number,
  ): IComposicaoRisco[] {
    if (comprometido <= 0) return [];
    const totais = new Map<string, number>();

    linhas
      .filter((linha) => linha.tipo === 'saida')
      .forEach((linha) => {
        totais.set(linha.nome, (totais.get(linha.nome) ?? 0) + linha.valor);
      });

    return [...totais.entries()]
      .map(([descricao, valor]) => ({
        descricao,
        valor,
        percentual: (valor / comprometido) * 100,
      }))
      .sort((itemA, itemB) => itemB.valor - itemA.valor);
  }
}
