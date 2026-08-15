import request from 'supertest';
import { getTestApp } from '../../server.js';
import { authHeader, registerAndGetToken } from '../../utils/auth.util.js';

describe('flux MVP API', () => {
  it('applies present balances, ignores future balance and creates compensation', async () => {
    const app = getTestApp();
    const token = await registerAndGetToken(app);

    const caixaOrigem = await request(app)
      .post('/api/caixas')
      .set(authHeader(token))
      .send({ nome: 'Salario', saldo: 0, tipo: 'origem' });
    const caixaPrincipal = await request(app)
      .post('/api/caixas')
      .set(authHeader(token))
      .send({ nome: 'Essencial', saldo: 0, tipo: 'orcamento', orcamentoMensal: 200 });
    const caixaCompensacao = await request(app)
      .post('/api/caixas')
      .set(authHeader(token))
      .send({ nome: 'Reserva', saldo: 500, tipo: 'objetivo', meta: 10000, aporteMensal: 500 });

    const origemId = caixaOrigem.body._id as string;
    const principalId = caixaPrincipal.body._id as string;
    const compensacaoId = caixaCompensacao.body._id as string;

    await request(app)
      .post('/api/lancamentos')
      .set(authHeader(token))
      .send({
        tipo: 'entrada',
        horizonte: 'futuro',
        valor: 1500,
        descricao: 'Salario',
        competencia: '2026-01',
        recorrente: true,
        competenciaInicial: '2026-01',
        duracaoMeses: 12,
        ativo: true,
        caixaOrigem: origemId,
        distribuicao: [{ caixa: principalId, valor: 1500 }],
      })
      .expect(201);

    await request(app)
      .post('/api/lancamentos')
      .set(authHeader(token))
      .send({
        tipo: 'saida',
        horizonte: 'futuro',
        valor: 400,
        descricao: 'Aluguel',
        competencia: '2026-01',
        recorrente: true,
        competenciaInicial: '2026-01',
        duracaoMeses: 12,
        ativo: true,
        caixaOrigem: principalId,
      })
      .expect(201);

    const entradaPresente = await request(app)
      .post('/api/lancamentos')
      .set(authHeader(token))
      .send({
        tipo: 'entrada',
        horizonte: 'presente',
        valor: 1000,
        descricao: 'Salario mensal',
        competencia: '2026-01',
        caixaOrigem: origemId,
      })
      .expect(201);

    await request(app)
      .post(`/api/lancamentos/${entradaPresente.body[0]._id}/distribuir`)
      .set(authHeader(token))
      .send({ itens: [{ caixa: principalId, valor: 1000 }] })
      .expect(200);

    await request(app)
      .post('/api/lancamentos')
      .set(authHeader(token))
      .send({
        tipo: 'entrada',
        horizonte: 'futuro',
        valor: 500,
        descricao: 'Renda futura',
        competencia: '2026-01',
        caixaOrigem: origemId,
        distribuicao: [{ caixa: principalId, valor: 500 }],
      })
      .expect(201);

    await request(app)
      .post('/api/lancamentos')
      .set(authHeader(token))
      .send({
        tipo: 'saida',
        horizonte: 'presente',
        valor: 100,
        descricao: 'Mercado',
        competencia: '2026-01',
        caixaOrigem: principalId,
      })
      .expect(201);

    await request(app)
      .put('/api/orcamentos/2026-01')
      .set(authHeader(token))
      .send({ orcamentos: [{ caixa: principalId, valor: 200 }] })
      .expect(200);

    const compensada = await request(app)
      .post('/api/lancamentos')
      .set(authHeader(token))
      .send({
        tipo: 'saida',
        horizonte: 'presente',
        valor: 300,
        descricao: 'Compra planejada',
        competencia: '2026-01',
        caixaOrigem: principalId,
        caixaCompensacao: compensacaoId,
      })
      .expect(201);

    expect(compensada.body).toHaveLength(2);

    const principal = await request(app)
      .get(`/api/caixas/${principalId}`)
      .set(authHeader(token))
      .expect(200);
    const compensacao = await request(app)
      .get(`/api/caixas/${compensacaoId}`)
      .set(authHeader(token))
      .expect(200);

    expect(principal.body.saldo).toBe(700);
    expect(compensacao.body.saldo).toBe(400);

    const acompanhamento = await request(app)
      .get('/api/acompanhamento/2026-01')
      .set(authHeader(token))
      .expect(200);

    expect(acompanhamento.body.risco.entradaPrevista).toBe(1500);
    expect(acompanhamento.body.risco.comprometido).toBe(400);
    expect(acompanhamento.body.status).toBe('saudavel');

    expect(acompanhamento.body.riscoReal.entradaPrevista).toBe(1500);
    expect(acompanhamento.body.riscoReal.comprometido).toBe(0);
    expect(acompanhamento.body.diferencialValor).toBe(-1100);
    expect(typeof acompanhamento.body.diferencial).toBe('number');
    expect(Array.isArray(acompanhamento.body.evolucao)).toBe(true);
    expect(acompanhamento.body.evolucao.length).toBeGreaterThan(0);
    expect(Array.isArray(acompanhamento.body.compromissos)).toBe(true);
    expect(Array.isArray(acompanhamento.body.impactos)).toBe(true);
    expect(acompanhamento.body.limites).toEqual(
      expect.objectContaining({ saudavel: 30, atencao: 50 }),
    );
  });

  describe('when simulating a new installment commitment', () => {
    it('should return calculated impacts without persisting scenario', async () => {
      const app = getTestApp();
      const token = await registerAndGetToken(app);

      const caixaOrcamento = await request(app)
        .post('/api/caixas')
        .set(authHeader(token))
        .send({
          nome: 'Qualidade de Vida',
          saldo: 0,
          tipo: 'orcamento',
          orcamentoMensal: 1000,
        })
        .expect(201);

      const caixaObjetivo = await request(app)
        .post('/api/caixas')
        .set(authHeader(token))
        .send({
          nome: 'Casa',
          saldo: 2000,
          tipo: 'objetivo',
          meta: 12000,
          aporteMensal: 1000,
        })
        .expect(201);

      const caixaOrcamentoId = caixaOrcamento.body._id as string;
      const caixaObjetivoId = caixaObjetivo.body._id as string;

      const caixaOrigemSalario = await request(app)
        .post('/api/caixas')
        .set(authHeader(token))
        .send({ nome: 'Salario', saldo: 0, tipo: 'origem' })
        .expect(201);
      const origemSalarioId = caixaOrigemSalario.body._id as string;

      await request(app)
        .post('/api/lancamentos')
        .set(authHeader(token))
        .send({
          tipo: 'entrada',
          horizonte: 'futuro',
          valor: 2500,
          descricao: 'Salario',
          competencia: '2026-09',
          recorrente: true,
          competenciaInicial: '2026-09',
          duracaoMeses: 12,
          ativo: true,
          caixaOrigem: origemSalarioId,
          distribuicao: [{ caixa: caixaOrcamentoId, valor: 2500 }],
        })
        .expect(201);

      await request(app)
        .post('/api/lancamentos')
        .set(authHeader(token))
        .send({
          tipo: 'saida',
          horizonte: 'futuro',
          valor: 800,
          descricao: 'Custos fixos',
          competencia: '2026-09',
          recorrente: true,
          competenciaInicial: '2026-09',
          duracaoMeses: 12,
          ativo: true,
          caixaOrigem: caixaOrcamentoId,
        })
        .expect(201);

      const response = await request(app)
        .post('/api/acompanhamento/simulacao-impacto')
        .set(authHeader(token))
        .send({
          valorTotal: 4800,
          duracaoMeses: 12,
          dataPrimeiroPagamento: '2026-09-10',
          modoCompensacao: 'declarada',
          fontesDeCompensacao: [
            {
              id: 'fonte-orcamento',
              tipoOrigem: 'orcamento',
              origemId: caixaOrcamentoId,
              valorMensalDestinado: 200,
            },
            {
              id: 'fonte-objetivo',
              tipoOrigem: 'objetivo',
              origemId: caixaObjetivoId,
              valorMensalDestinado: 200,
            },
          ],
        })
        .expect(200);

      expect(response.body.parcelaMensal).toEqual(400);
      expect(response.body.mesesAfetados).toHaveLength(12);
      expect(response.body.budgetImpacts[0].novoValorMensal).toEqual(800);
      expect(response.body.goalImpacts[0].novoAporteMensal).toEqual(800);
      expect(response.body.resumoImpacto.totalFontesDeclaradas).toEqual(400);
      expect(Array.isArray(response.body.monthlyImpacts)).toEqual(true);
    });
  });

  describe('when category is added via POST /categorias', () => {
    it('should appear as suggestion on GET /categorias', async () => {
      const app = getTestApp();
      const token = await registerAndGetToken(app);

      await request(app)
        .post('/api/categorias')
        .set(authHeader(token))
        .send({ tipo: 'saida', categoria: 'Conveniencia' })
        .expect(201);

      const resposta = await request(app)
        .get('/api/categorias')
        .query({ tipo: 'saida', q: 'conv' })
        .set(authHeader(token))
        .expect(200);

      expect(resposta.body).toEqual(expect.arrayContaining(['Conveniencia']));
    });
  });

  describe('when present saida uses full-date competencia', () => {
    it('should apply monthly orcamento for compensation limit', async () => {
      const app = getTestApp();
      const token = await registerAndGetToken(app);

      const caixaPrincipal = await request(app)
        .post('/api/caixas')
        .set(authHeader(token))
        .send({ nome: 'Essencial', saldo: 1000, tipo: 'orcamento', orcamentoMensal: 5000 });
      const caixaCompensacao = await request(app)
        .post('/api/caixas')
        .set(authHeader(token))
        .send({ nome: 'Reserva', saldo: 500, tipo: 'objetivo', meta: 10000, aporteMensal: 500 });

      const principalId = caixaPrincipal.body._id as string;
      const compensacaoId = caixaCompensacao.body._id as string;

      await request(app)
        .put('/api/orcamentos/2026-08')
        .set(authHeader(token))
        .send({ orcamentos: [{ caixa: principalId, valor: 100 }] })
        .expect(200);

      await request(app)
        .post('/api/lancamentos')
        .set(authHeader(token))
        .send({
          tipo: 'saida',
          horizonte: 'presente',
          valor: 250,
          descricao: 'Compra com data cheia',
          competencia: '2026-08-09',
          caixaOrigem: principalId,
        })
        .expect(400);

      const compensada = await request(app)
        .post('/api/lancamentos')
        .set(authHeader(token))
        .send({
          tipo: 'saida',
          horizonte: 'presente',
          valor: 250,
          descricao: 'Compra com data cheia',
          competencia: '2026-08-09',
          caixaOrigem: principalId,
          caixaCompensacao: compensacaoId,
        })
        .expect(201);

      expect(compensada.body).toHaveLength(2);
      expect(compensada.body[0].valor).toEqual(100);
      expect(compensada.body[1].valor).toEqual(150);
    });
  });
});
