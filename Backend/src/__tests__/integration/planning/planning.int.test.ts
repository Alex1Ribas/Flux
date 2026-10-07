import request from 'supertest';
import { getTestApp } from '../../server.js';
import { authHeader, OTHER_USER, registerAndGetToken } from '../../utils/auth.util.js';
import { createFixturePlan } from '../../utils/planning.util.js';

async function setup() {
  const app = getTestApp();
  const headers = authHeader(await registerAndGetToken(app));
  return { app, headers };
}

describe('planning API', () => {
  describe('when nothing was registered yet', () => {
    it('should return an empty plan with default settings', async () => {
      const { app, headers } = await setup();
      const plan = await request(app).get('/api/planning?from=2026-10&months=6').set(headers).expect(200);

      expect(plan.body.incomeSources).toEqual([]);
      expect(plan.body.settings).toEqual(expect.objectContaining({ reserveRate: 30, initialReserve: 0 }));
      expect(plan.body.months).toHaveLength(6);
      expect(plan.body.months[0]).toEqual(
        expect.objectContaining({ income: 0, spend: 0, expenses: [] }),
      );
    });
  });

  describe('when incomes and expenses are registered', () => {
    it('should calculate months, sources and the default source by due day', async () => {
      const { app, headers } = await setup();
      const { firstSourceId, secondSourceId } = await createFixturePlan(app, headers);
      const plan = await request(app).get('/api/planning?from=2026-10&months=3').set(headers).expect(200);

      expect(plan.body.months.map((month: { spend: number }) => month.spend)).toEqual([800, 800, 600]);
      expect(plan.body.months[0]).toEqual(
        expect.objectContaining({ income: 3500, surplus: 2700, reserve: 810, free: 1890 }),
      );
      const october = plan.body.months[0].expenses;
      expect(october.find((line: { name: string }) => line.name === 'Conta do dia 15').sourceId).toEqual(firstSourceId);
      expect(october.find((line: { name: string }) => line.name === 'Conta fixa').sourceId).toEqual(secondSourceId);
    });

    it('should project beyond six months', async () => {
      const { app, headers } = await setup();
      await createFixturePlan(app, headers);
      const plan = await request(app).get('/api/planning?from=2026-10&months=24').set(headers).expect(200);
      expect(plan.body.months).toHaveLength(24);
      expect(plan.body.to).toEqual('2028-09');
      expect(plan.body.months[23].spend).toEqual(600);
    });
  });

  describe('when adjusting one month of an expense', () => {
    it('should change only that month', async () => {
      const { app, headers } = await setup();
      const { firstSourceId } = await createFixturePlan(app, headers);
      const before = await request(app).get('/api/planning?from=2026-10&months=3').set(headers);
      const invoice = before.body.months[2].expenses.find((line: { name: string }) => line.name === 'Fatura');

      await request(app)
        .put(`/api/planning/expenses/${invoice.expenseId}/months/2026-12`)
        .set(headers)
        .send({ amount: 400, sourceId: firstSourceId })
        .expect(204);

      const after = await request(app).get('/api/planning?from=2026-10&months=3').set(headers);
      const december = after.body.months[2].expenses.find((line: { name: string }) => line.name === 'Fatura');
      expect(december).toEqual(expect.objectContaining({ amount: 400, sourceId: firstSourceId, isAdjusted: true }));
      expect(after.body.months[2].spend).toEqual(before.body.months[2].spend + 400);
      expect(after.body.months[1].spend).toEqual(before.body.months[1].spend);
    });
  });

  describe('when updating an expense for all months', () => {
    it('should apply the new default and clear the month adjustments', async () => {
      const { app, headers } = await setup();
      await createFixturePlan(app, headers);
      const before = await request(app).get('/api/planning?from=2026-10&months=3').set(headers);
      const invoice = before.body.months[2].expenses.find((line: { name: string }) => line.name === 'Fatura');

      await request(app)
        .put(`/api/planning/expenses/${invoice.expenseId}/months/2026-12`)
        .set(headers)
        .send({ amount: 400 })
        .expect(204);
      await request(app)
        .patch(`/api/planning/expenses/${invoice.expenseId}`)
        .set(headers)
        .send({ amount: 150, resetMonthOverrides: true })
        .expect(204);

      const after = await request(app).get('/api/planning?from=2026-10&months=3').set(headers);
      const invoices = after.body.months.map((month: { expenses: { name: string }[] }) =>
        month.expenses.find((line) => line.name === 'Fatura'),
      );
      expect(invoices).toEqual([
        expect.objectContaining({ amount: 150, isAdjusted: false }),
        expect.objectContaining({ amount: 150, isAdjusted: false }),
        expect.objectContaining({ amount: 150, isAdjusted: false }),
      ]);
    });
  });

  describe('when changing incomes and reserve', () => {
    it('should recalculate the plan', async () => {
      const { app, headers } = await setup();
      const { firstSourceId } = await createFixturePlan(app, headers);

      await request(app).patch(`/api/planning/income-sources/${firstSourceId}`).set(headers).send({ amount: 1200 }).expect(200);
      await request(app).patch('/api/planning/settings').set(headers).send({ reserveRate: 50, initialReserve: 1000 }).expect(200);

      const after = await request(app).get('/api/planning?from=2026-10&months=1').set(headers);
      expect(after.body.months[0]).toEqual(
        expect.objectContaining({ income: 3700, surplus: 2900, reserve: 1450, accumulatedReserve: 2450 }),
      );
    });
  });

  describe('when creating an expense without any income source', () => {
    it('should answer 404 for the missing source', async () => {
      const { app, headers } = await setup();
      await request(app)
        .post('/api/planning/expenses')
        .set(headers)
        .send({ name: 'Internet', amount: 30, dueDay: 17 })
        .expect(404);
    });
  });

  describe('when two users have their own plans', () => {
    it('should keep data isolated and block edits on the other user expenses', async () => {
      const { app, headers } = await setup();
      await createFixturePlan(app, headers);
      const otherHeaders = authHeader(await registerAndGetToken(app, OTHER_USER));

      const otherPlan = await request(app).get('/api/planning?from=2026-10&months=1').set(otherHeaders).expect(200);
      expect(otherPlan.body.incomeSources).toEqual([]);
      expect(otherPlan.body.months[0].expenses).toEqual([]);

      const ownPlan = await request(app).get('/api/planning?from=2026-10&months=1').set(headers);
      const expenseId = ownPlan.body.months[0].expenses[0].expenseId;
      const sourceId = ownPlan.body.incomeSources[0].id;

      await request(app)
        .put(`/api/planning/expenses/${expenseId}/months/2026-10`)
        .set(otherHeaders)
        .send({ amount: 1 })
        .expect(404);
      await request(app)
        .patch(`/api/planning/income-sources/${sourceId}`)
        .set(otherHeaders)
        .send({ amount: 1 })
        .expect(404);
      await request(app).patch('/api/planning/settings').set(otherHeaders).send({ reserveRate: 10 }).expect(200);

      const ownAfter = await request(app).get('/api/planning?from=2026-10&months=1').set(headers);
      expect(ownAfter.body.settings.reserveRate).toEqual(30);
      expect(ownAfter.body.months[0].spend).toEqual(ownPlan.body.months[0].spend);
    });
  });

  describe('when the payload breaks the contract', () => {
    it('should reject with 400', async () => {
      const { app, headers } = await setup();
      await request(app).post('/api/planning/expenses').set(headers).send({ name: 'X' }).expect(400);
      await request(app).post('/api/planning/income-sources').set(headers).send({ name: 'X', payDay: 40, amount: 1 }).expect(400);
    });
  });
});
