import request from 'supertest';
import type { Express } from 'express';

export interface IFixturePlan {
  firstSourceId: string;
  secondSourceId: string;
}

export async function createFixturePlan(
  app: Express,
  headers: Record<string, string>,
): Promise<IFixturePlan> {
  const first = await request(app)
    .post('/api/planning/income-sources')
    .set(headers)
    .send({ name: 'Renda A', payDay: 7, amount: 1000 })
    .expect(201);
  const second = await request(app)
    .post('/api/planning/income-sources')
    .set(headers)
    .send({ name: 'Renda B', payDay: 20, amount: 2500 })
    .expect(201);

  const expenses = [
    { name: 'Conta curta', amount: 200, dueDay: 20, startMonth: '2026-10', installments: 2 },
    { name: 'Conta fixa', amount: 500, dueDay: 20, startMonth: '2026-10' },
    { name: 'Conta do dia 15', amount: 100, dueDay: 15, startMonth: '2026-10' },
    { name: 'Fatura', amount: 0, dueDay: 24, startMonth: '2026-10' },
  ];
  for (const expense of expenses) {
    await request(app).post('/api/planning/expenses').set(headers).send(expense).expect(201);
  }

  return { firstSourceId: first.body.id as string, secondSourceId: second.body.id as string };
}
