import { Router, type Request, type Response } from 'express';
import type { IAcompanhamentoService } from '../../domain/acompanhamento/entity/interfaces/acompanhamento.service.interface.js';
import type { IController } from '../../domain/server/interfaces/IController.js';
import type { IUserRepositoryRead } from '../../domain/user/repository/user.repository.read.js';
import { ErrorCatalog } from '../../infrastructure/i18n/error-catalog.js';
import { handleTranslatedError } from '../../infrastructure/i18n/handle-translated-error.js';
import { TokenService } from '../../infrastructure/security/token.service.js';
import { createAuthMiddleware } from '../middlewares/auth.middleware.js';

export interface IParamsAcompanhamentoController {
  acompanhamentoService: IAcompanhamentoService;
  tokenService: TokenService;
  userRepositoryRead: IUserRepositoryRead;
}

export class AcompanhamentoController implements IController {
  readonly router: Router;
  private readonly acompanhamentoService: IAcompanhamentoService;
  private readonly authMiddleware: ReturnType<typeof createAuthMiddleware>;

  constructor({
    acompanhamentoService,
    tokenService,
    userRepositoryRead,
  }: IParamsAcompanhamentoController) {
    this.router = Router();
    this.acompanhamentoService = acompanhamentoService;
    this.authMiddleware = createAuthMiddleware(tokenService, userRepositoryRead);
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.get(
      '/acompanhamento/:competencia',
      this.authMiddleware,
      this.search,
    );
  }

  private userId(req: Request): string {
    return req.user?._id ?? '';
  }

  private competencia(req: Request): string {
    const value = req.params.competencia;
    return Array.isArray(value) ? value[0] : value;
  }

  search = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.acompanhamentoService.montarAcompanhamentoMes(
        this.userId(req),
        this.competencia(req),
      );
      res.status(200).json(result);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res, req);
    }
  };
}
