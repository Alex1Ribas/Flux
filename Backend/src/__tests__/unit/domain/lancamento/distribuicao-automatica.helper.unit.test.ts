import { calcularDistribuicaoAutomatica } from '../../../../domain/lancamento/service/distribuicao-automatica.helper.js';
import { ETipoCaixa } from '../../../../domain/caixa/entity/interfaces/caixa.interface.js';

describe('calcularDistribuicaoAutomatica', () => {
  describe('when reserve rule completes meta', () => {
    it('should allocate only the remaining need and send rest to restante', () => {
      const caixas = [
        {
          _id: 'reserva',
          user: 'u1',
          nome: 'Reserva',
          saldo: 9800,
          tipo: ETipoCaixa.OBJETIVO,
          comprometido: 0,
          disponivel: 9800,
          meta: 10000,
          aporteMensal: 500,
        },
        {
          _id: 'qv',
          user: 'u1',
          nome: 'Qualidade',
          saldo: 0,
          tipo: ETipoCaixa.ORCAMENTO,
          comprometido: 0,
          disponivel: 0,
          orcamentoMensal: 700,
        },
      ];

      const itens = calcularDistribuicaoAutomatica(
        1000,
        [
          { prioridade: 1, caixaId: 'reserva', modo: 'completar_meta' },
          { prioridade: 2, caixaId: 'qv', modo: 'restante' },
        ],
        caixas,
      );

      expect(itens).toEqual([
        { caixa: 'reserva', valor: 200 },
        { caixa: 'qv', valor: 800 },
      ]);
    });
  });
});
