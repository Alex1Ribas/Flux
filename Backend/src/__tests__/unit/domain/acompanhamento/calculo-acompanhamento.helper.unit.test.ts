import {
  EStatusConta,
  ETipoConta,
  type IConta,
} from '../../../../domain/conta/entity/interfaces/conta.interface.js';
import {
  EHorizonteLancamento,
  ETipoLancamento,
  type ILancamento,
} from '../../../../domain/lancamento/entity/interfaces/lancamento.interface.js';
import {
  calcCompromissosMes,
  calcImpactosRisco,
  montarAcompanhamentoMesCalculo,
} from '../../../../domain/acompanhamento/service/calculo-acompanhamento.helper.js';

function lancamentoBase(
  overrides: Partial<ILancamento> & Pick<ILancamento, '_id' | 'descricao' | 'tipo' | 'valor' | 'competencia'>,
): ILancamento {
  return {
    user: 'user-1',
    horizonte: EHorizonteLancamento.PRESENTE,
    ...overrides,
  };
}

function contaBase(
  overrides: Partial<IConta> & Pick<IConta, '_id' | 'descricao' | 'tipo' | 'valor' | 'competencia' | 'vencimento'>,
): IConta {
  return {
    user: 'user-1',
    caixaId: 'caixa-1',
    status: EStatusConta.ABERTA,
    ...overrides,
  };
}

describe('calculo-acompanhamento.helper', () => {
  describe('when month has open contas and avulsos', () => {
    it('should return evolucao, compromissos and impactos', () => {
      const contas: IConta[] = [
        contaBase({
          _id: 'conta-salario',
          descricao: 'Salario',
          tipo: ETipoConta.A_RECEBER,
          valor: 1500,
          competencia: '2026-01',
          vencimento: '2026-01-05',
        }),
        contaBase({
          _id: 'conta-aluguel',
          descricao: 'Aluguel',
          tipo: ETipoConta.A_PAGAR,
          valor: 400,
          competencia: '2026-01',
          vencimento: '2026-01-10',
        }),
      ];
      const lancamentos: ILancamento[] = [
        lancamentoBase({
          _id: 'avulso-1',
          descricao: 'Mercado',
          tipo: ETipoLancamento.SAIDA,
          valor: 100,
          competencia: '2026-01-15',
          recorrente: false,
        }),
      ];

      const resultado = montarAcompanhamentoMesCalculo(
        '2026-01',
        lancamentos,
        contas,
      );

      expect(resultado.risco.entradaPrevista).toEqual(1500);
      expect(resultado.risco.comprometido).toEqual(400);
      expect(resultado.evolucao.length).toEqual(31);
      expect(resultado.compromissos.map((item) => item.descricao)).toEqual([
        'Salario',
        'Aluguel',
      ]);
      expect(resultado.impactos).toHaveLength(1);
      expect(resultado.impactos[0].descricao).toEqual('Mercado');
      expect(resultado.impactos[0].direcao).toEqual('aumenta');
    });
  });

  describe('when recorrente has no conta ocorrencia', () => {
    it('should include recorrente as compromisso fallback', () => {
      const lancamentos: ILancamento[] = [
        lancamentoBase({
          _id: 'rec-1',
          descricao: 'Internet',
          tipo: ETipoLancamento.SAIDA,
          valor: 120,
          competencia: '2026-01',
          recorrente: true,
          competenciaInicial: '2026-01',
          duracaoMeses: 12,
          ativo: true,
          horizonte: EHorizonteLancamento.FUTURO,
        }),
      ];

      const compromissos = calcCompromissosMes('2026-01', lancamentos, []);
      expect(compromissos).toEqual([
        expect.objectContaining({
          id: 'rec-1',
          descricao: 'Internet',
          valor: 120,
        }),
      ]);

      const impactos = calcImpactosRisco('2026-01', lancamentos, []);
      expect(impactos).toEqual([]);
    });
  });
});
