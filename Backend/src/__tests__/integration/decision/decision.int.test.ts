import request from 'supertest';
import { getTestApp } from '../../server.js';
import { authHeader, registerAndGetToken } from '../../utils/auth.util.js';
import { createFixturePlan } from '../../utils/planning.util.js';

describe('decisions API', () => {
  describe('when simulating a small expense today', () => {
    it('should answer pode gastar', async () => {
      const token = await registerAndGetToken(getTestApp());
      await createFixturePlan(getTestApp(), authHeader(token));
      const verdict = await request(getTestApp())
        .post('/api/decisions/simulate')
        .set(authHeader(token))
        .send({ mode: 'hoje', day: 16, available: 1350, expense: 35 })
        .expect(200);

      expect(verdict.body).toEqual(
        expect.objectContaining({ kind: 'ok', title: 'Pode gastar' }),
      );
    });
  });

  describe('when mode is unknown', () => {
    it('should reject with 400', async () => {
      const token = await registerAndGetToken(getTestApp());
      await request(getTestApp())
        .post('/api/decisions/simulate')
        .set(authHeader(token))
        .send({ mode: 'outro' })
        .expect(400);
    });
  });
});
