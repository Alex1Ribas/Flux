import request from 'supertest';
import { getTestApp } from '../../server.js';
import { authHeader, registerAndGetToken } from '../../utils/auth.util.js';

describe('flux MVP API', () => {
  it('applies present balances, ignores future balance and creates compensation', async () => {
    const app = getTestApp();
    const token = await registerAndGetToken(app);

    const caixaPrincipal = await request(app)
      .post('/api/caixas')
      .set(authHeader(token))
      .send({ nome: 'Essencial', saldo: 0, tipo: 'orcamento', orcamentoMensal: 200 });
    const caixaCompensacao = await request(app)
      .post('/api/caixas')
      .set(authHeader(token))
      .send({ nome: 'Reserva', saldo: 500, tipo: 'objetivo', meta: 10000, aporteMensal: 500 });

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

    await request(app)
      .post('/api/lancamentos')
      .set(authHeader(token))
      .send({
        tipo: 'entrada',
        horizonte: 'presente',
        valor: 1000,
        descricao: 'Salario mensal',
        competencia: '2026-01',
        distribuicao: [{ caixa: principalId, valor: 1000 }],
      })
      .expect(201);

    await request(app)
      .post('/api/lancamentos')
      .set(authHeader(token))
      .send({
        tipo: 'entrada',
        horizonte: 'futuro',
        valor: 500,
        descricao: 'Renda futura',
        competencia: '2026-01',
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
});
