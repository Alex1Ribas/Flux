import express, { Express } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as OpenApiValidator from 'express-openapi-validator';
import type { IController } from '../../domain/server/interfaces/IController.js';
import { createRateLimitMiddleware } from '../middlewares/rate-limit.middleware.js';
import { getControllerRouter } from './express-router.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface IServerParams {
  port: number;
  controllers: IController[];
  apiSpecPath?: string;
}

export class Server {
  readonly app: Express;
  private readonly port: number;

  constructor({ port, controllers, apiSpecPath }: IServerParams) {
    this.port = port;
    this.app = express();
    this.app.use(express.json());
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization',
      );
      res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');

      if (req.method === 'OPTIONS') {
        res.sendStatus(204);
        return;
      }

      next();
    });

    const authLimiter = createRateLimitMiddleware();

    this.app.use('/api/users/login', authLimiter);
    this.app.use('/api/users/register', authLimiter);

    this.app.get('/api/health', (_req, res) => {
      res.status(200).json({ status: 'ok' });
    });

    const specPath =
      apiSpecPath ??
      path.resolve(__dirname, '../../contracts/service.yaml');

    this.app.use(
      OpenApiValidator.middleware({
        apiSpec: specPath,
        validateRequests: true,
        validateResponses: false,
      }),
    );

    for (const controller of controllers) {
      this.app.use('/api', getControllerRouter(controller));
    }
  }

  listen(): void {
    this.app.listen(this.port, () => {
      console.log(`Server listening on port ${this.port}`);
    });
  }
}
