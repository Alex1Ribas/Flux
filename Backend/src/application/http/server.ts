import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as OpenApiValidator from 'express-openapi-validator';
import { DomainError } from '../../domain/common/errors/DomainError.js';
import { EErrorCode } from '../../domain/common/errors/enums/EErrorCode.js';
import type { IController } from '../../domain/server/interfaces/IController.js';
import { ErrorCatalog } from '../../infrastructure/i18n/error-catalog.js';
import { handleTranslatedError } from '../../infrastructure/i18n/handle-translated-error.js';
import { getControllerRouter } from './express-router.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface IServerParams {
  port: number;
  controllers: IController[];
  apiSpecPath?: string;
}

interface IHttpError {
  status?: number;
}

function toDomainError(error: unknown): unknown {
  const status = (error as IHttpError | undefined)?.status;
  if (status === 404) {
    return new DomainError(EErrorCode.ROUTE_NOT_FOUND, 404);
  }
  if (status === 400 || status === 405 || status === 415) {
    return new DomainError(EErrorCode.VALIDATION_ERROR, status);
  }
  return error;
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
        'Origin, X-Requested-With, Content-Type, Accept, Accept-Language, Authorization',
      );
      res.header(
        'Access-Control-Allow-Methods',
        'GET,POST,PUT,PATCH,DELETE,OPTIONS',
      );

      if (req.method === 'OPTIONS') {
        res.sendStatus(204);
        return;
      }

      next();
    });

    this.app.get('/api/health', (_req, res) => {
      res.status(200).json({ status: 'ok' });
    });

    const specPath =
      apiSpecPath ?? path.resolve(__dirname, '../../contracts/service.yaml');

    this.app.use(
      OpenApiValidator.middleware({
        apiSpec: specPath,
        validateRequests: true,
        validateResponses: false,
        validateSecurity: false,
      }),
    );

    for (const controller of controllers) {
      this.app.use('/api', getControllerRouter(controller));
    }

    this.app.use(
      (error: unknown, req: Request, res: Response, _next: NextFunction) => {
        handleTranslatedError(toDomainError(error), ErrorCatalog, res, req);
      },
    );
  }

  listen(): void {
    this.app.listen(this.port, () => {
      console.log(`Server listening on port ${this.port}`);
    });
  }
}
