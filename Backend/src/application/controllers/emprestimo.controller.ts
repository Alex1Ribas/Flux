import { Router, type Request, type Response } from 'express';
import type { IEmprestimoService } from '../../domain/emprestimo/entity/interfaces/emprestimo.service.interface.js';
import type { IController } from '../../domain/server/interfaces/IController.js';
import type { IUserRepositoryRead } from '../../domain/user/repository/user.repository.read.js';
import { ErrorCatalog } from '../../infrastructure/i18n/error-catalog.js';
import { handleTranslatedError } from '../../infrastructure/i18n/handle-translated-error.js';
import { TokenService } from '../../infrastructure/security/token.service.js';
import { createAuthMiddleware } from '../middlewares/auth.middleware.js';

export interface IParamsEmprestimoController {
  emprestimoService: IEmprestimoService;
  tokenService: TokenService;
  userRepositoryRead: IUserRepositoryRead;
}

export class EmprestimoController implements IController {
  readonly router: Router;
  private readonly emprestimoService: IEmprestimoService;
  private readonly authMiddleware: ReturnType<typeof createAuthMiddleware>;

  constructor({
    emprestimoService,
    tokenService,
    userRepositoryRead,
  }: IParamsEmprestimoController) {
    this.router = Router();
    this.emprestimoService = emprestimoService;
    this.authMiddleware = createAuthMiddleware(tokenService, userRepositoryRead);
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.post('/emprestimos', this.authMiddleware, this.create);
  }

  private userId(req: Request): string {
    return req.user?._id ?? '';
  }

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.emprestimoService.criarEmprestimo(
        this.userId(req),
        req.body,
      );
      res.status(201).json(result);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res, req);
    }
  };
}
