import request from 'supertest';
import type { Express } from 'express';

export const TEST_USER = {
  name: 'Titular',
  email: 'titular@flux.test',
  password: 'senha-segura-1',
  confPassword: 'senha-segura-1',
};

export async function registerAndGetToken(
  app: Express,
  user: typeof TEST_USER = TEST_USER,
): Promise<string> {
  await request(app).post('/api/users/register').send(user).expect(201);
  const login = await request(app)
    .post('/api/users/login')
    .send({ email: user.email, password: user.password })
    .expect(200);
  return login.body.token as string;
}

export const OTHER_USER = {
  name: 'Outra pessoa',
  email: 'outra@flux.test',
  password: 'outra-senha-1',
  confPassword: 'outra-senha-1',
};

export function authHeader(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}
