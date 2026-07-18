import type { Express } from 'express';
import request from 'supertest';
import type { IParamsCreateUser } from '../../domain/user/entity/interfaces/user.interface.js';
import { EUserRole } from '../../domain/user/entity/interfaces/user.interface.js';

export const defaultTitularPayload: IParamsCreateUser = {
  name: 'Titular Test',
  email: 'titular@test.com',
  password: 'password123',
  confPassword: 'password123',
};

export const defaultDependentePayload: IParamsCreateUser = {
  name: 'Dependente Test',
  email: 'dependente@test.com',
  password: 'password123',
  confPassword: 'password123',
};

/** @deprecated use defaultTitularPayload */
export const defaultAdminPayload = defaultTitularPayload;

export function authHeader(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}

export async function registerUser(
  app: Express,
  payload: IParamsCreateUser = defaultTitularPayload,
) {
  return request(app).post('/api/users/register').send(payload);
}

export async function loginUser(
  app: Express,
  email: string,
  password: string,
) {
  return request(app).post('/api/users/login').send({ email, password });
}

export async function registerAndGetToken(
  app: Express,
  payload: IParamsCreateUser = defaultTitularPayload,
): Promise<string> {
  await registerUser(app, payload);
  const loginRes = await loginUser(app, payload.email, payload.password);
  return loginRes.body.token as string;
}

export async function registerFirstTitular(
  app: Express,
  payload: IParamsCreateUser = defaultTitularPayload,
): Promise<{ token: string; userId: string }> {
  const registerRes = await registerUser(app, payload);
  const loginRes = await loginUser(app, payload.email, payload.password);
  return {
    token: loginRes.body.token as string,
    userId: registerRes.body.user._id as string,
  };
}

export async function createDependente(
  app: Express,
  titularToken: string,
  payload: IParamsCreateUser = defaultDependentePayload,
) {
  return request(app)
    .post('/api/users')
    .set(authHeader(titularToken))
    .send(payload);
}

export async function createDependenteAndGetToken(
  app: Express,
  titularToken: string,
  payload: IParamsCreateUser = defaultDependentePayload,
): Promise<{ token: string; userId: string }> {
  const registerRes = await createDependente(app, titularToken, payload);
  const loginRes = await loginUser(app, payload.email, payload.password);
  return {
    token: loginRes.body.token as string,
    userId: registerRes.body.user._id as string,
  };
}

export async function registerSecondPublic(
  app: Express,
  payload: IParamsCreateUser = {
    name: 'Outro',
    email: 'outro@test.com',
    password: 'password123',
    confPassword: 'password123',
  },
) {
  return registerUser(app, payload);
}

export function expectRoleTitular(role: string): void {
  expect(role).toBe(EUserRole.USER);
}

export function expectRoleDependente(role: string): void {
  expect(role).toBe(EUserRole.DEPENDENT);
}
