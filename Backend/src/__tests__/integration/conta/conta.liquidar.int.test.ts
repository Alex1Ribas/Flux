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
      expect(caixaAtualizada.body.comprometido).toEqual(0);
      expect(caixaAtualizada.body.disponivel).toEqual(1000);
    });
  });

  describe('when settling a receber', () => {
    it('should create present entrada on origin and allow distribution', async () => {
      const app = getTestApp();
      const token = await registerAndGetToken(app);

      const origem = await request(app)
        .post('/api/caixas')
        .set(authHeader(token))
        .send({ nome: 'Salario', saldo: 0, tipo: 'origem' })
        .expect(201);

      const alocacao = await request(app)
        .post('/api/caixas')
        .set(authHeader(token))
        .send({
          nome: 'Livre',
          saldo: 0,
          tipo: 'orcamento',
          orcamentoMensal: 5000,
        })
        .expect(201);

      const origemId = origem.body._id as string;
      const alocacaoId = alocacao.body._id as string;

      const criada = await request(app)
        .post('/api/contas')
        .set(authHeader(token))
        .send({
          tipo: 'a_receber',
          descricao: 'Cliente',
          valor: 2000,
          vencimento: '2026-08-15',
          caixaId: origemId,
        })
        .expect(201);

      const liquidacao = await request(app)
        .post(`/api/contas/${criada.body._id}/liquidar`)
        .set(authHeader(token))
        .send({
          liquidadoEm: '2026-08-05',
          distribuicao: [{ caixa: alocacaoId, valor: 2000 }],
        })
        .expect(200);

      expect(liquidacao.body.conta.status).toEqual('liquidada');
      expect(liquidacao.body.lancamentos[0]).toEqual(
        expect.objectContaining({
          tipo: 'entrada',
          horizonte: 'presente',
          competencia: '2026-08-05',
          caixaOrigem: origemId,
        }),
      );

      const origemAtualizada = await request(app)
        .get(`/api/caixas/${origemId}`)
        .set(authHeader(token))
        .expect(200);
      const alocacaoAtualizada = await request(app)
        .get(`/api/caixas/${alocacaoId}`)
        .set(authHeader(token))
        .expect(200);

      expect(origemAtualizada.body.saldo).toEqual(0);
      expect(alocacaoAtualizada.body.saldo).toEqual(2000);
    });
  });

  describe('when creating a pagar', () => {
    it('should increase comprometido without reducing saldo', async () => {
      const app = getTestApp();
      const token = await registerAndGetToken(app);

      const caixa = await request(app)
        .post('/api/caixas')
        .set(authHeader(token))
        .send({
          nome: 'Contas',
          saldo: 1000,
          tipo: 'orcamento',
          orcamentoMensal: 2000,
        })
        .expect(201);
      const caixaId = caixa.body._id as string;

      await request(app)
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

      const atual = await request(app)
        .get(`/api/caixas/${caixaId}`)
        .set(authHeader(token))
        .expect(200);

      expect(atual.body.saldo).toEqual(1000);
      expect(atual.body.comprometido).toEqual(1000);
      expect(atual.body.disponivel).toEqual(0);
    });
  });
});
