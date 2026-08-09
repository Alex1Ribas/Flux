import { simularImpactoCompromisso } from '../../../../domain/acompanhamento/service/simulacao-impacto.helper.js';
import type {
  ISimulacaoImpactoData,
  ISimulacaoImpactoInput,
} from '../../../../domain/acompanhamento/entity/interfaces/acompanhamento.service.interface.js';

function dataBase(): ISimulacaoImpactoData {
  return {
    monthlyPlanning: [
      {
        referenciaMes: '2026-09',
        entradasPrevistas: 2000,
        compromissosAnteriores: 600,
      },
      {
        referenciaMes: '2026-10',
        entradasPrevistas: 0,
        compromissosAnteriores: 500,
      },
      {
        referenciaMes: '2026-11',
        entradasPrevistas: 2400,
        compromissosAnteriores: 700,
      },
    ],
    orcamentosMensais: [
      {
        caixaId: 'caixa-qualidade',
        nome: 'Qualidade de Vida',
        valorPlanejadoMensal: 1000,
      },
      {
        caixaId: 'caixa-essencial',
        nome: 'Essencial',
        valorPlanejadoMensal: 300,
      },
    ],
    objetivos: [
      {
        caixaId: 'objetivo-casa',
        nome: 'Casa',
        saldoAtual: 2000,
        meta: 12000,
        aporteMensalPlanejado: 1000,
      },
      {
        caixaId: 'objetivo-viagem',
        nome: 'Viagem',
        saldoAtual: 1000,
        meta: 5000,
        aporteMensalPlanejado: 300,
      },
    ],
  };
}

describe('simulacao-impacto.helper', () => {
  describe('when source is single budget box', () => {
    it('should reduce budget by monthly installment', () => {
      const input: ISimulacaoImpactoInput = {
        valorTotal: 4800,
        duracaoMeses: 12,
        dataPrimeiroPagamento: '2026-09-10',
        modoCompensacao: 'declarada',
        fontesDeCompensacao: [
          {
            id: 'f1',
            tipoOrigem: 'orcamento',
            origemId: 'caixa-qualidade',
            valorMensalDestinado: 400,
          },
        ],
      };

      const result = simularImpactoCompromisso(input, dataBase());

      expect(result.parcelaMensal).toEqual(400);
      expect(result.budgetImpacts[0].novoValorMensal).toEqual(600);
    });
  });

  describe('when source is single goal', () => {
    it('should reduce aporte and increase expected deadline', () => {
      const input: ISimulacaoImpactoInput = {
        valorTotal: 4800,
        duracaoMeses: 12,
        dataPrimeiroPagamento: '2026-09-10',
        modoCompensacao: 'declarada',
        fontesDeCompensacao: [
          {
            id: 'f1',
            tipoOrigem: 'objetivo',
            origemId: 'objetivo-casa',
            valorMensalDestinado: 400,
          },
        ],
      };

      const result = simularImpactoCompromisso(input, dataBase());

      expect(result.goalImpacts[0].novoAporteMensal).toEqual(600);
      expect(result.goalImpacts[0].diferencaPrazoMeses).toBeGreaterThan(0);
    });
  });

  describe('when there are multiple sources', () => {
    it('should compute individual and consolidated distribution', () => {
      const input: ISimulacaoImpactoInput = {
        valorTotal: 1200,
        duracaoMeses: 3,
        dataPrimeiroPagamento: '2026-09-10',
        modoCompensacao: 'declarada',
        fontesDeCompensacao: [
          {
            id: 'f-orc',
            tipoOrigem: 'orcamento',
            origemId: 'caixa-qualidade',
            valorMensalDestinado: 150,
          },
          {
            id: 'f-obj',
            tipoOrigem: 'objetivo',
            origemId: 'objetivo-casa',
            valorMensalDestinado: 250,
          },
        ],
      };

      const result = simularImpactoCompromisso(input, dataBase());

      expect(result.parcelaMensal).toEqual(400);
      expect(result.budgetImpacts).toHaveLength(1);
      expect(result.goalImpacts).toHaveLength(1);
      expect(result.resumoImpacto.totalFontesDeclaradas).toEqual(400);
    });
  });

  describe('when budget source exceeds monthly availability', () => {
    it('should emit inconsistency alert for budget source', () => {
      const input: ISimulacaoImpactoInput = {
        valorTotal: 1200,
        duracaoMeses: 3,
        dataPrimeiroPagamento: '2026-09-10',
        modoCompensacao: 'declarada',
        fontesDeCompensacao: [
          {
            id: 'f1',
            tipoOrigem: 'orcamento',
            origemId: 'caixa-essencial',
            valorMensalDestinado: 400,
          },
        ],
      };

      const result = simularImpactoCompromisso(input, dataBase());

      expect(result.budgetImpacts[0].alertas).toEqual(
        expect.arrayContaining([
          'Fonte de orçamento excede o valor mensal disponível da caixa selecionada.',
        ]),
      );
    });
  });

  describe('when goal source consumes full aporte', () => {
    it('should mark goal as frozen', () => {
      const input: ISimulacaoImpactoInput = {
        valorTotal: 1200,
        duracaoMeses: 3,
        dataPrimeiroPagamento: '2026-09-10',
        modoCompensacao: 'declarada',
        fontesDeCompensacao: [
          {
            id: 'f1',
            tipoOrigem: 'objetivo',
            origemId: 'objetivo-viagem',
            valorMensalDestinado: 400,
          },
        ],
      };

      const result = simularImpactoCompromisso(input, dataBase());

      expect(result.goalImpacts[0].status).toEqual('congelado');
      expect(result.goalImpacts[0].novoPrazoMeses).toEqual(null);
    });
  });

  describe('when month has no planned entries', () => {
    it('should force critical classification for that month', () => {
      const input: ISimulacaoImpactoInput = {
        valorTotal: 1200,
        duracaoMeses: 3,
        dataPrimeiroPagamento: '2026-09-10',
        modoCompensacao: 'declarada',
        fontesDeCompensacao: [
          {
            id: 'f1',
            tipoOrigem: 'orcamento',
            origemId: 'caixa-qualidade',
            valorMensalDestinado: 400,
          },
        ],
      };

      const result = simularImpactoCompromisso(input, dataBase());
      const semEntrada = result.monthlyImpacts.find(
        (item) => item.referenciaMes === '2026-10',
      );

      expect(semEntrada?.classificacaoDepois).toEqual('critico');
      expect(semEntrada?.alertas).toEqual(
        expect.arrayContaining([
          'Mês sem entrada prevista. Impacto classificado como crítico.',
        ]),
      );
    });
  });

  describe('when compensation mode is not declared', () => {
    it('should return gross impact without source impacts', () => {
      const input: ISimulacaoImpactoInput = {
        valorTotal: 1200,
        duracaoMeses: 3,
        dataPrimeiroPagamento: '2026-09-10',
        modoCompensacao: 'nao-declarada',
        fontesDeCompensacao: [],
      };

      const result = simularImpactoCompromisso(input, dataBase());

      expect(result.budgetImpacts).toEqual([]);
      expect(result.goalImpacts).toEqual([]);
      expect(result.resumoImpacto.impactoBruto).toEqual(true);
    });
  });
});
