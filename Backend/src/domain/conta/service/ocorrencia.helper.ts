import {
  ETipoLancamento,
  type ILancamento,
} from '../../lancamento/entity/interfaces/lancamento.interface.js';
import { normalizeCompetencia } from '../../orcamento/service/competencia.helper.js';
import { ETipoConta } from '../entity/interfaces/conta.interface.js';

export function listarMesesDoRecorrente(recorrente: ILancamento): string[] {
  const inicio = normalizeCompetencia(
    recorrente.competenciaInicial ?? recorrente.competencia,
  );
  const duracao = Math.max(1, Number(recorrente.duracaoMeses) || 1);
  const resultado: string[] = [];
  const [anoInicial, mesInicial] = inicio.split('-').map(Number);

  for (let indice = 0; indice < duracao; indice++) {
    let mes = mesInicial + indice;
    let ano = anoInicial + Math.floor((mes - 1) / 12);
    mes = ((mes - 1) % 12) + 1;
    resultado.push(`${ano}-${String(mes).padStart(2, '0')}`);
  }

  return resultado;
}

export function diaVencimentoDoRecorrente(recorrente: ILancamento): number {
  const referencia = recorrente.competenciaInicial ?? recorrente.competencia;
  if (referencia.length >= 10) {
    const dia = Number(referencia.slice(8, 10));
    if (!Number.isNaN(dia) && dia >= 1 && dia <= 31) {
      return dia;
    }
  }
  return 1;
}

export function diasNoMes(competenciaMes: string): number {
  const [ano, mes] = competenciaMes.split('-').map(Number);
  return new Date(ano, mes, 0).getDate();
}

export function montarVencimentoOcorrencia(
  competenciaMes: string,
  diaPreferido: number,
): string {
  const dia = Math.min(diaPreferido, diasNoMes(competenciaMes));
  return `${competenciaMes}-${String(dia).padStart(2, '0')}`;
}

export function tipoContaDoRecorrente(recorrente: ILancamento): ETipoConta {
  if (recorrente.tipo === ETipoLancamento.ENTRADA) {
    return ETipoConta.A_RECEBER;
  }
  return ETipoConta.A_PAGAR;
}

export function caixaIdDoRecorrente(recorrente: ILancamento): string | null {
  if (recorrente.tipo === ETipoLancamento.SAIDA) {
    return recorrente.caixaOrigem?.trim() || null;
  }
  const primeiro = recorrente.distribuicao?.[0]?.caixa?.trim();
  return primeiro || null;
}
