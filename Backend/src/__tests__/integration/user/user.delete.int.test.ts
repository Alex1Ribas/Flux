import request from 'supertest';
import { getTestApp } from '../../server.js';
import {
  authHeader,
  createDependente,
  registerAndGetToken,
} from '../../utils/auth.util.js';

describe('DELETE /api/users/:id', () => {
  it('deletes user when caller is titular', async () => {
    const app = getTestApp();
    const titularToken = await registerAndGetToken(app);

    const target = await createDependente(app, titularToken, {
      name: 'Target User',
      email: 'target@test.com',
      password: 'password123',
      confPassword: 'password123',
    });
    const targetId = target.body.user._id as string;

    const res = await request(app)
      .delete(`/api/users/${targetId}`)
      .set(authHeader(titularToken));

    expect(res.status).toBe(200);
    expect(res.body.message).toBeDefined();
  });
});
