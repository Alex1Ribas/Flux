import { Router, type Request, type Response } from 'express';
import type { ICaixaService } from '../../domain/caixa/entity/interfaces/caixa.service.interface.js';
import type {
  IParamsCreateCaixaInput,
  IParamsUpdateCaixa,
} from '../../domain/caixa/entity/interfaces/caixa.service.interface.js';
import type { IController } from '../../domain/server/interfaces/IController.js';
import { EUserRole } from '../../domain/user/entity/interfaces/user.interface.js';
import type { IUserRepositoryRead } from '../../domain/user/repository/user.repository.read.js';
import { ErrorCatalog } from '../../infrastructure/i18n/error-catalog.js';
import { handleTranslatedError } from '../../infrastructure/i18n/handle-translated-error.js';
import { TokenService } from '../../infrastructure/security/token.service.js';
import { paramId } from '../http/param-id.js';
import { createAuthMiddleware } from '../middlewares/auth.middleware.js';
import { validateObjectIdMiddleware } from '../middlewares/validate-object-id.middleware.js';

export interface IParamsCaixaController {
  caixaService: ICaixaService;
  tokenService: TokenService;
  userRepositoryRead: IUserRepositoryRead;
}

export class CaixaController implements IController {
  readonly router: Router;
  private readonly caixaService: ICaixaService;
  private readonly authMiddleware: ReturnType<typeof createAuthMiddleware>;

  constructor({
    caixaService,
    tokenService,
    userRepositoryRead,
  }: IParamsCaixaController) {
    this.router = Router();
    this.caixaService = caixaService;
    this.authMiddleware = createAuthMiddleware(tokenService, userRepositoryRead);
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.post('/caixas', this.authMiddleware, this.create);
    this.router.get('/caixas', this.authMiddleware, this.list);
    this.router.get(
      '/caixas/:id',
      this.authMiddleware,
      validateObjectIdMiddleware,
      this.search,
    );
    this.router.put(
      '/caixas/:id',
      this.authMiddleware,
      validateObjectIdMiddleware,
      this.update,
    );
    this.router.delete(
      '/caixas/:id',
      this.authMiddleware,
      validateObjectIdMiddleware,
      this.remove,
    );
  }

  private userId(req: Request): string {
    return req.user?._id ?? '';
  }

  private userRole(req: Request): EUserRole {
    return req.user?.role ?? EUserRole.DEPENDENT;
  }

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.caixaService.createCaixa(
        this.userId(req),
        req.body as IParamsCreateCaixaInput,
      );
      res.status(201).json(result);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res, req);
    }
  };

  list = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.caixaService.listCaixas(this.userId(req));
      res.status(200).json(result);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res, req);
    }
  };

  search = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.caixaService.getCaixaById(
        paramId(req.params.id),
        this.userId(req),
        this.userRole(req),
      );
      res.status(200).json(result);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res, req);
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.caixaService.updateCaixaById(
        paramId(req.params.id),
        this.userId(req),
        this.userRole(req),
        req.body as IParamsUpdateCaixa,
      );
      res.status(200).json(result);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res, req);
    }
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.caixaService.deleteCaixaById(
        paramId(req.params.id),
        this.userId(req),
        this.userRole(req),
      );
      res.status(200).json(result);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res, req);
    }
  };
}
