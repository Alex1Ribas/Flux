import { Router, type Request, type Response } from 'express';
import type {
  IOrcamentoService,
  IParamsUpsertOrcamentoInput,
} from '../../domain/orcamento/entity/interfaces/orcamento.service.interface.js';
import type { IController } from '../../domain/server/interfaces/IController.js';
import type { IUserRepositoryRead } from '../../domain/user/repository/user.repository.read.js';
import { ErrorCatalog } from '../../infrastructure/i18n/error-catalog.js';
import { handleTranslatedError } from '../../infrastructure/i18n/handle-translated-error.js';
import { TokenService } from '../../infrastructure/security/token.service.js';
import { createAuthMiddleware } from '../middlewares/auth.middleware.js';

export interface IParamsOrcamentoController {
  orcamentoService: IOrcamentoService;
  tokenService: TokenService;
  userRepositoryRead: IUserRepositoryRead;
}

export class OrcamentoController implements IController {
  readonly router: Router;
  private readonly orcamentoService: IOrcamentoService;
  private readonly authMiddleware: ReturnType<typeof createAuthMiddleware>;

  constructor({
    orcamentoService,
    tokenService,
    userRepositoryRead,
  }: IParamsOrcamentoController) {
    this.router = Router();
    this.orcamentoService = orcamentoService;
    this.authMiddleware = createAuthMiddleware(tokenService, userRepositoryRead);
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.get('/orcamentos/:competencia', this.authMiddleware, this.list);
    this.router.put('/orcamentos/:competencia', this.authMiddleware, this.upsert);
  }

  private userId(req: Request): string {
    return req.user?._id ?? '';
  }

  private competencia(req: Request): string {
    const value = req.params.competencia;
    return Array.isArray(value) ? value[0] : value;
  }

  list = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.orcamentoService.listOrcamentos(
        this.userId(req),
        this.competencia(req),
      );
      res.status(200).json(result);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res, req);
    }
  };

  upsert = async (req: Request, res: Response): Promise<void> => {
    try {
      const body = req.body as { orcamentos: IParamsUpsertOrcamentoInput[] };
      const result = await this.orcamentoService.upsertOrcamentos(
        this.userId(req),
        this.competencia(req),
        body.orcamentos,
      );
      res.status(200).json(result);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res, req);
    }
  };
}
