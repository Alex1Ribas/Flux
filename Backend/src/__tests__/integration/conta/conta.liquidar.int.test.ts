import request from 'supertest';
import { getTestApp } from '../../server.js';
import { authHeader, registerAndGetToken } from '../../utils/auth.util.js';

describe('contas API', () => {
  describe('when settling a pagar early', () => {
    it('should create present saida and mark conta liquidada', async () => {
      const app = getTestApp();
      const token = await registerAndGetToken(app);

      const caixa = await request(app)
        .post('/api/caixas')
        .set(authHeader(token))
        .send({
          nome: 'Moradia',
          saldo: 2000,
          tipo: 'orcamento',
          orcamentoMensal: 2000,
        })
        .expect(201);

      const caixaId = caixa.body._id as string;

      const criada = await request(app)
        .post('/api/contas')
        .set(authHeader(token))
        .send({
          tipo: 'a_pagar',
          descricao: 'Aluguel',
          valor: 1000,
          vencimento: '2026-08-10',
          caixaId,
        })
        .expect(201);

      expect(criada.body).toEqual(
        expect.objectContaining({
          tipo: 'a_pagar',
          status: 'aberta',
          vencimento: '2026-08-10',
          valor: 1000,
        }),
      );

      const liquidacao = await request(app)
        .post(`/api/contas/${criada.body._id}/liquidar`)
        .set(authHeader(token))
        .send({ liquidadoEm: '2026-07-25' })
        .expect(200);

      expect(liquidacao.body.conta).toEqual(
        expect.objectContaining({
          status: 'liquidada',
          liquidadoEm: '2026-07-25',
        }),
      );
      expect(liquidacao.body.lancamentos[0]).toEqual(
        expect.objectContaining({
          tipo: 'saida',
          horizonte: 'presente',
          valor: 1000,
          competencia: '2026-07-25',
          descricao: 'Aluguel',
        }),
      );

      const caixaAtualizada = await request(app)
        .get(`/api/caixas/${caixaId}`)
        .set(authHeader(token))
        .expect(200);

      expect(caixaAtualizada.body.saldo).toEqual(1000);
    });
  });

  describe('when settling a receber', () => {
    it('should create present entrada and increase caixa', async () => {
      const app = getTestApp();
      const token = await registerAndGetToken(app);

      const caixa = await request(app)
        .post('/api/caixas')
        .set(authHeader(token))
        .send({
          nome: 'Livre',
          saldo: 0,
          tipo: 'orcamento',
          orcamentoMensal: 5000,
        })
        .expect(201);

      const caixaId = caixa.body._id as string;

      const criada = await request(app)
        .post('/api/contas')
        .set(authHeader(token))
        .send({
          tipo: 'a_receber',
          descricao: 'Cliente',
          valor: 2000,
          vencimento: '2026-08-15',
          caixaId,
        })
        .expect(201);

      const liquidacao = await request(app)
        .post(`/api/contas/${criada.body._id}/liquidar`)
        .set(authHeader(token))
        .send({ liquidadoEm: '2026-08-05' })
        .expect(200);

      expect(liquidacao.body.conta.status).toEqual('liquidada');
      expect(liquidacao.body.lancamentos[0]).toEqual(
        expect.objectContaining({
          tipo: 'entrada',
          horizonte: 'presente',
          competencia: '2026-08-05',
        }),
      );

      const caixaAtualizada = await request(app)
        .get(`/api/caixas/${caixaId}`)
        .set(authHeader(token))
        .expect(200);

      expect(caixaAtualizada.body.saldo).toEqual(2000);
    });
  });
});
