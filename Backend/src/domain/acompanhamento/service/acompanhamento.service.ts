import { DomainError } from '../../common/errors/DomainError.js';
import { EErrorCode } from '../../common/errors/enums/EErrorCode.js';
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

type LinhaRecorrente = {
  id: string;
  nome: string;
  tipo: ETipoLancamento | string;
  valor: number;
};

function getMesesFuturos(inicio: string, qtd: number): string[] {
  const resultado: string[] = [];
  const [ano, mes] = inicio.split('-').map(Number);
  for (let i = 0; i < qtd; i++) {
    let novoMes = mes + i;
    let novoAno = ano + Math.floor((novoMes - 1) / 12);
    novoMes = ((novoMes - 1) % 12) + 1;
    resultado.push(`${novoAno}-${String(novoMes).padStart(2, '0')}`);
  }
  return resultado;
}

function recorrenteAtivoNoMes(lancamento: ILancamento, mes: string): boolean {
  if (!lancamento.recorrente) return false;
  if (lancamento.ativo === false) return false;

  const inicio = normalizeCompetencia(
    lancamento.competenciaInicial ?? lancamento.competencia,
  );
  const duracao = Math.max(1, Number(lancamento.duracaoMeses) || 1);
  return getMesesFuturos(inicio, duracao).includes(mes);
}

function montarRisco(entradaPrevista: number, comprometido: number): IRiscoPrevisto {
  const risco = entradaPrevista > 0 ? (comprometido / entradaPrevista) * 100 : 0;
  return { entradaPrevista, comprometido, risco };
}

function listarRecorrentesParaRiscoMes(
  mes: string,
  lancamentos: ILancamento[],
): LinhaRecorrente[] {
  const porChave = new Map<string, LinhaRecorrente>();

  lancamentos.forEach((lancamento) => {
    if (!recorrenteAtivoNoMes(lancamento, mes)) return;

    const chave = `${lancamento.descricao}|${lancamento.tipo}`;
    porChave.set(chave, {
      id: lancamento._id,
      nome: lancamento.descricao,
      tipo: lancamento.tipo,
      valor: Number(lancamento.valor),
    });
  });

  return [...porChave.values()];
}

export class AcompanhamentoService implements IAcompanhamentoService {
  private readonly lancamentoRepositoryRead: IParamsAcompanhamentoService['lancamentoRepositoryRead'];

  constructor({ lancamentoRepositoryRead }: IParamsAcompanhamentoService) {
    this.lancamentoRepositoryRead = lancamentoRepositoryRead;
  }

  async montarAcompanhamentoMes(
    requestUserId: string,
    competencia: string,
  ): Promise<IAcompanhamentoMes> {
    if (!requestUserId?.trim()) {
      throw new DomainError(EErrorCode.USER_NOT_IDENTIFIED, 401);
    }

    const mes = normalizeCompetencia(competencia);
    const [lancamentosMes, recorrentes] = await Promise.all([
      this.lancamentoRepositoryRead.listLancamentosByUserCompetencia(
        requestUserId,
        mes,
      ),
      this.lancamentoRepositoryRead.listLancamentosByUser(requestUserId, {
        recorrente: true,
      }),
    ]);

    const linhas = listarRecorrentesParaRiscoMes(mes, recorrentes);
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

  private calcRiscoPrevisto(linhas: LinhaRecorrente[]): IRiscoPrevisto {
    let entradaPrevista = 0;
    let comprometido = 0;

    linhas.forEach((linha) => {
      if (linha.tipo === ETipoLancamento.ENTRADA) {
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
    linhas: LinhaRecorrente[],
    comprometido: number,
  ): IComposicaoRisco[] {
    if (comprometido <= 0) return [];
    const totais = new Map<string, number>();

    linhas
      .filter((linha) => linha.tipo === ETipoLancamento.SAIDA)
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
