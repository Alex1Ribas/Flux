import type { Express } from 'express';
import { Server } from '../../application/http/server.js';
import { connectDatabase } from '../../infrastructure/db/mongo/connection.js';
import { env } from '../env/env.config.js';
import { createDecisionController } from './decision.controller.factory.js';
import { createPlanningController } from './planning.controller.factory.js';
import { createUserController } from './user.controller.factory.js';

export function createHttpServer(): Server {
  return new Server({
    port: env.PORT,
    controllers: [
      createUserController(),
      createPlanningController(),
      createDecisionController(),
    ],
  });
}

export async function createApp(): Promise<Express> {
  await connectDatabase(env.MONGODB_URI);
  return createHttpServer().app;
}
