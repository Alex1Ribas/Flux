import request from 'supertest';
import { getTestApp } from '../../server.js';
import {
  defaultTitularPayload,
  registerUser,
} from '../../utils/auth.util.js';

describe('POST /api/users/login', () => {
  it('returns token on valid credentials', async () => {
    const app = getTestApp();
    await registerUser(app);

    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: defaultTitularPayload.email,
        password: defaultTitularPayload.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.id).toBeDefined();
  });

  it('returns 401 on invalid password', async () => {
    const app = getTestApp();
    await registerUser(app);

    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: defaultTitularPayload.email,
        password: 'wrong-password',
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toBeDefined();
  });

  it('returns 401 on unknown email', async () => {
    const app = getTestApp();
    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: 'unknown@test.com',
        password: 'password123',
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toBeDefined();
  });
});
