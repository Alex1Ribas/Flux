import type { Express } from 'express';
import { Server } from '../../application/http/server.js';
import { env } from '../env/env.config.js';
import { connectDatabase } from '../../infrastructure/db/mongo/connection.js';
import { createAcompanhamentoController } from './acompanhamento.controller.factory.js';
import { createCaixaController } from './caixa.controller.factory.js';
import { createContaController } from './conta.controller.factory.js';
import { createLancamentoController } from './lancamento.controller.factory.js';
import { createOrcamentoController } from './orcamento.controller.factory.js';
import { createPreferenciasController } from './preferencias.controller.factory.js';
import { createUserController } from './user.controller.factory.js';

export function createHttpServer(): Server {
  return new Server({
    port: env.PORT,
    controllers: [
      createUserController(),
      createCaixaController(),
      createContaController(),
      createLancamentoController(),
      createOrcamentoController(),
      createAcompanhamentoController(),
      createPreferenciasController(),
    ],
  });
}

export async function createApp(): Promise<Express> {
  await connectDatabase(env.MONGODB_URI);
  return createHttpServer().app;
}
