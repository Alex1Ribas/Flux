import type { ICaixa } from '../../caixa/entity/interfaces/caixa.interface.js';
import type { IDistribuicaoLancamento } from '../entity/interfaces/lancamento.interface.js';
import type { IRegraDistribuicaoPreferencia } from '../entity/interfaces/lancamento.service.interface.js';

/**
 * Calcula alocações a partir de regras ordenadas por prioridade.
 * Nunca distribui mais do que `valorDisponivel`.
 */
export function calcularDistribuicaoAutomatica(
  valorDisponivel: number,
  regras: IRegraDistribuicaoPreferencia[],
  caixas: ICaixa[],
): IDistribuicaoLancamento[] {
  let restante = Number(valorDisponivel);
  if (restante <= 0) return [];

  const porId = new Map(caixas.map((caixa) => [caixa._id, caixa]));
  const ordenadas = [...regras].sort(
    (regraA, regraB) => regraA.prioridade - regraB.prioridade,
  );
  const itens: IDistribuicaoLancamento[] = [];

  for (const regra of ordenadas) {
    if (restante <= 0.01) break;
    const caixa = porId.get(regra.caixaId);
    if (!caixa) continue;

    let alocar = 0;
    if (regra.modo === 'valor_fixo') {
      alocar = Math.min(restante, Number(regra.valorFixo) || 0);
    } else if (regra.modo === 'completar_meta') {
      const meta = Number(caixa.meta) || 0;
      const necessidade = Math.max(0, meta - Number(caixa.saldo));
      alocar = Math.min(restante, necessidade);
    } else if (regra.modo === 'restante') {
      alocar = restante;
    }

    if (alocar <= 0.01) continue;
    itens.push({ caixa: regra.caixaId, valor: round2(alocar) });
    restante = round2(restante - alocar);
  }

  return itens;
}

function round2(valor: number): number {
  return Math.round(valor * 100) / 100;
}
