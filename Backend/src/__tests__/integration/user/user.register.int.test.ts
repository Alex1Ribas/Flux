import request from 'supertest';
import { getTestApp } from '../../server.js';
import { createDependente, defaultTitularPayload, loginUser, registerUser } from '../../utils/auth.util.js';
import { EUserRole } from '../../../domain/user/entity/interfaces/user.interface.js';

describe('POST /api/users/register', () => {
  it('registers first titular with USER role', async () => {
    const app = getTestApp();
    const res = await request(app)
      .post('/api/users/register')
      .send(defaultTitularPayload);

    expect(res.status).toBe(201);
    expect(res.body.message).toBeDefined();
    expect(res.body.user.email).toBe(defaultTitularPayload.email);
    expect(res.body.user.role).toBe(EUserRole.USER);
  });

  it('returns 409 when email already exists on dependente creation', async () => {
    const app = getTestApp();
    await registerUser(app);
    const loginRes = await loginUser(
      app,
      defaultTitularPayload.email,
      defaultTitularPayload.password,
    );
    const titularToken = loginRes.body.token as string;

    const payload = {
      name: 'Dep',
      email: 'dep@test.com',
      password: 'password123',
      confPassword: 'password123',
    };
    await createDependente(app, titularToken, payload);
    const res = await createDependente(app, titularToken, payload);

    expect(res.status).toBe(409);
    expect(res.body.message).toBeDefined();
  });

  it('returns 403 when titular already exists', async () => {
    const app = getTestApp();
    await registerUser(app);
    const res = await request(app)
      .post('/api/users/register')
      .send({
        name: 'Outro',
        email: 'outro@test.com',
        password: 'password123',
        confPassword: 'password123',
      });

    expect(res.status).toBe(403);
  });
});
