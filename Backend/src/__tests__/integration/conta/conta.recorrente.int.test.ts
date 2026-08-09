import request from 'supertest';
import { getTestApp } from '../../server.js';
import { authHeader, registerAndGetToken } from '../../utils/auth.util.js';

describe('contas from recorrente', () => {
  describe('when recurring rule is created', () => {
    it('should generate monthly Conta occurrences without changing the rule on early settle', async () => {
      const app = getTestApp();
      const token = await registerAndGetToken(app);

      const caixa = await request(app)
        .post('/api/caixas')
        .set(authHeader(token))
        .send({
          nome: 'Moradia',
          saldo: 5000,
          tipo: 'orcamento',
          orcamentoMensal: 5000,
        })
        .expect(201);

      const caixaId = caixa.body._id as string;

      const recorrente = await request(app)
        .post('/api/lancamentos')
        .set(authHeader(token))
        .send({
          tipo: 'saida',
          horizonte: 'futuro',
          valor: 1000,
          descricao: 'Aluguel',
          competencia: '2026-08-10',
          recorrente: true,
          competenciaInicial: '2026-08-10',
          duracaoMeses: 3,
          ativo: true,
          caixaOrigem: caixaId,
        })
        .expect(201);

      const recorrenteId = recorrente.body[0]._id as string;

      const contas = await request(app)
        .get('/api/contas?status=aberta')
        .set(authHeader(token))
        .expect(200);

      expect(contas.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            descricao: 'Aluguel',
            competencia: '2026-08',
            vencimento: '2026-08-10',
            recorrenteId,
            status: 'aberta',
          }),
          expect.objectContaining({
            competencia: '2026-09',
            vencimento: '2026-09-10',
            recorrenteId,
          }),
          expect.objectContaining({
            competencia: '2026-10',
            vencimento: '2026-10-10',
            recorrenteId,
          }),
        ]),
      );

      const contaAgosto = contas.body.find(
        (conta: { competencia: string }) => conta.competencia === '2026-08',
      );

      const liquidacao = await request(app)
        .post(`/api/contas/${contaAgosto._id}/liquidar`)
        .set(authHeader(token))
        .send({ liquidadoEm: '2026-07-25' })
        .expect(200);

      expect(liquidacao.body.conta).toEqual(
        expect.objectContaining({
          status: 'liquidada',
          competencia: '2026-08',
          vencimento: '2026-08-10',
          liquidadoEm: '2026-07-25',
          recorrenteId,
        }),
      );

      const recorrenteApos = await request(app)
        .get(`/api/lancamentos/${recorrenteId}`)
        .set(authHeader(token))
        .expect(200);

      expect(recorrenteApos.body).toEqual(
        expect.objectContaining({
          recorrente: true,
          valor: 1000,
          duracaoMeses: 3,
          ativo: true,
        }),
      );

      const abertas = await request(app)
        .get('/api/contas?status=aberta')
        .set(authHeader(token))
        .expect(200);

      expect(
        abertas.body.some(
          (conta: { competencia: string }) => conta.competencia === '2026-08',
        ),
      ).toEqual(false);
      expect(
        abertas.body.filter(
          (conta: { recorrenteId: string }) => conta.recorrenteId === recorrenteId,
        ),
      ).toHaveLength(2);
    });
  });
});
