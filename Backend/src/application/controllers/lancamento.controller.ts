import { Router, type Request, type Response } from 'express';
import type {
  ILancamentoService,
  IParamsCreateLancamentoInput,
  IParamsUpdateLancamentoInput,
} from '../../domain/lancamento/entity/interfaces/lancamento.service.interface.js';
import type { IController } from '../../domain/server/interfaces/IController.js';
import { EUserRole } from '../../domain/user/entity/interfaces/user.interface.js';
import type { IUserRepositoryRead } from '../../domain/user/repository/user.repository.read.js';
import { ErrorCatalog } from '../../infrastructure/i18n/error-catalog.js';
import { handleTranslatedError } from '../../infrastructure/i18n/handle-translated-error.js';
import { TokenService } from '../../infrastructure/security/token.service.js';
import { paramId } from '../http/param-id.js';
import { createAuthMiddleware } from '../middlewares/auth.middleware.js';
import { validateObjectIdMiddleware } from '../middlewares/validate-object-id.middleware.js';

export interface IParamsLancamentoController {
  lancamentoService: ILancamentoService;
  tokenService: TokenService;
  userRepositoryRead: IUserRepositoryRead;
}

export class LancamentoController implements IController {
  readonly router: Router;
  private readonly lancamentoService: ILancamentoService;
  private readonly authMiddleware: ReturnType<typeof createAuthMiddleware>;

  constructor({
    lancamentoService,
    tokenService,
    userRepositoryRead,
  }: IParamsLancamentoController) {
    this.router = Router();
    this.lancamentoService = lancamentoService;
    this.authMiddleware = createAuthMiddleware(tokenService, userRepositoryRead);
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.post('/lancamentos', this.authMiddleware, this.create);
    this.router.get('/lancamentos', this.authMiddleware, this.list);
    this.router.get(
      '/lancamentos/:id',
      this.authMiddleware,
      validateObjectIdMiddleware,
      this.search,
    );
    this.router.put(
      '/lancamentos/:id',
      this.authMiddleware,
      validateObjectIdMiddleware,
      this.update,
    );
    this.router.delete(
      '/lancamentos/:id',
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
      const result = await this.lancamentoService.createLancamento(
        this.userId(req),
        req.body as IParamsCreateLancamentoInput,
      );
      res.status(201).json(result);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res, req);
    }
  };

  list = async (req: Request, res: Response): Promise<void> => {
    try {
      const recorrenteQuery = req.query.recorrente;
      let recorrente: boolean | undefined;
      if (recorrenteQuery === 'true') recorrente = true;
      if (recorrenteQuery === 'false') recorrente = false;

      const result = await this.lancamentoService.listLancamentos(this.userId(req), {
        competencia:
          typeof req.query.competencia === 'string'
            ? req.query.competencia
            : undefined,
        recorrente,
      });
      res.status(200).json(result);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res, req);
    }
  };

  search = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.lancamentoService.getLancamentoById(
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
      const result = await this.lancamentoService.updateLancamentoById(
        paramId(req.params.id),
        this.userId(req),
        this.userRole(req),
        req.body as IParamsUpdateLancamentoInput,
      );
      res.status(200).json(result);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res, req);
    }
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.lancamentoService.deleteLancamentoById(
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
