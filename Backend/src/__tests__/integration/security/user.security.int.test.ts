import request from 'supertest';
import { getTestApp } from '../../server.js';
import {
  authHeader,
  createDependente,
  createDependenteAndGetToken,
  defaultDependentePayload,
  defaultTitularPayload,
  loginUser,
  registerFirstTitular,
  registerSecondPublic,
  registerUser,
} from '../../utils/auth.util.js';
import { EUserRole } from '../../../domain/user/entity/interfaces/user.interface.js';

describe('User security', () => {
  it('first public register creates titular (USER role)', async () => {
    const app = getTestApp();
    const res = await registerUser(app);

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe(EUserRole.USER);
  });

  it('rejects second public register with 403', async () => {
    const app = getTestApp();
    await registerUser(app);
    const res = await registerSecondPublic(app);

    expect(res.status).toBe(403);
  });

  it('titular creates dependente via POST /users', async () => {
    const app = getTestApp();
    const { token } = await registerFirstTitular(app);
    const res = await createDependente(app, token);

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe(EUserRole.DEPENDENT);
  });

  it('dependente cannot create another user', async () => {
    const app = getTestApp();
    const { token: titularToken } = await registerFirstTitular(app);
    const { token: depToken } = await createDependenteAndGetToken(
      app,
      titularToken,
    );

    const res = await request(app)
      .post('/api/users')
      .set(authHeader(depToken))
      .send({
        name: 'Outro Dep',
        email: 'outrodep@test.com',
        password: 'password123',
        confPassword: 'password123',
      });

    expect(res.status).toBe(403);
  });

  it('login returns 401 for unknown email', async () => {
    const app = getTestApp();
    const res = await loginUser(app, 'unknown@test.com', 'password123');

    expect(res.status).toBe(401);
  });

  it('login returns 401 for wrong password', async () => {
    const app = getTestApp();
    await registerUser(app);
    const res = await loginUser(app, defaultTitularPayload.email, 'wrong');

    expect(res.status).toBe(401);
  });

  it('dependente can GET own profile only', async () => {
    const app = getTestApp();
    const { token: titularToken, userId: titularId } =
      await registerFirstTitular(app);
    const { token: depToken, userId: depId } = await createDependenteAndGetToken(
      app,
      titularToken,
    );

    const self = await request(app)
      .get(`/api/users/${depId}`)
      .set(authHeader(depToken));
    expect(self.status).toBe(200);

    const other = await request(app)
      .get(`/api/users/${titularId}`)
      .set(authHeader(depToken));
    expect(other.status).toBe(403);
  });

  it('titular can GET any user profile', async () => {
    const app = getTestApp();
    const { token: titularToken } = await registerFirstTitular(app);
    const { userId: depId } = await createDependenteAndGetToken(
      app,
      titularToken,
    );

    const res = await request(app)
      .get(`/api/users/${depId}`)
      .set(authHeader(titularToken));

    expect(res.status).toBe(200);
  });

  it('dependente cannot list users', async () => {
    const app = getTestApp();
    const { token: titularToken } = await registerFirstTitular(app);
    const { token: depToken } = await createDependenteAndGetToken(
      app,
      titularToken,
    );

    const res = await request(app)
      .get('/api/users')
      .set(authHeader(depToken));

    expect(res.status).toBe(403);
  });

  it('protected route without token returns 401', async () => {
    const app = getTestApp();
    const res = await request(app).get('/api/users');

    expect(res.status).toBe(401);
  });

  it('token invalid after user deleted returns 401', async () => {
    const app = getTestApp();
    const { token: titularToken } = await registerFirstTitular(app);
    const { userId: depId, token: depToken } = await createDependenteAndGetToken(
      app,
      titularToken,
      defaultDependentePayload,
    );

    await request(app)
      .delete(`/api/users/${depId}`)
      .set(authHeader(titularToken));

    const res = await request(app)
      .get(`/api/users/${depId}`)
      .set(authHeader(depToken));

    expect(res.status).toBe(401);
  });
});
