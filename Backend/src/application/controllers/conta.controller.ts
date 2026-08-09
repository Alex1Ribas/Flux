import { Router, type Request, type Response } from 'express';
import type {
  IContaService,
  IListContasFiltro,
  IParamsCreateContaInput,
  IParamsLiquidarConta,
  IParamsUpdateConta,
} from '../../domain/conta/entity/interfaces/conta.service.interface.js';
import {
  EStatusConta,
  ETipoConta,
} from '../../domain/conta/entity/interfaces/conta.interface.js';
import type { IController } from '../../domain/server/interfaces/IController.js';
import { EUserRole } from '../../domain/user/entity/interfaces/user.interface.js';
import type { IUserRepositoryRead } from '../../domain/user/repository/user.repository.read.js';
import { ErrorCatalog } from '../../infrastructure/i18n/error-catalog.js';
import { handleTranslatedError } from '../../infrastructure/i18n/handle-translated-error.js';
import { TokenService } from '../../infrastructure/security/token.service.js';
import { paramId } from '../http/param-id.js';
import { createAuthMiddleware } from '../middlewares/auth.middleware.js';
import { validateObjectIdMiddleware } from '../middlewares/validate-object-id.middleware.js';

export interface IParamsContaController {
  contaService: IContaService;
  tokenService: TokenService;
  userRepositoryRead: IUserRepositoryRead;
}

export class ContaController implements IController {
  readonly router: Router;
  private readonly contaService: IContaService;
  private readonly authMiddleware: ReturnType<typeof createAuthMiddleware>;

  constructor({
    contaService,
    tokenService,
    userRepositoryRead,
  }: IParamsContaController) {
    this.router = Router();
    this.contaService = contaService;
    this.authMiddleware = createAuthMiddleware(tokenService, userRepositoryRead);
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.post('/contas', this.authMiddleware, this.create);
    this.router.get('/contas', this.authMiddleware, this.list);
    this.router.get(
      '/contas/:id',
      this.authMiddleware,
      validateObjectIdMiddleware,
      this.search,
    );
    this.router.put(
      '/contas/:id',
      this.authMiddleware,
      validateObjectIdMiddleware,
      this.update,
    );
    this.router.delete(
      '/contas/:id',
      this.authMiddleware,
      validateObjectIdMiddleware,
      this.remove,
    );
    this.router.post(
      '/contas/:id/liquidar',
      this.authMiddleware,
      validateObjectIdMiddleware,
      this.liquidar,
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
      const result = await this.contaService.createConta(
        this.userId(req),
        req.body as IParamsCreateContaInput,
      );
      res.status(201).json(result);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res, req);
    }
  };

  list = async (req: Request, res: Response): Promise<void> => {
    try {
      const filtro: IListContasFiltro = {};
      if (typeof req.query.status === 'string') {
        filtro.status = req.query.status as EStatusConta;
      }
      if (typeof req.query.tipo === 'string') {
        filtro.tipo = req.query.tipo as ETipoConta;
      }
      if (typeof req.query.competencia === 'string') {
        filtro.competencia = req.query.competencia;
      }
      const result = await this.contaService.listContas(this.userId(req), filtro);
      res.status(200).json(result);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res, req);
    }
  };

  search = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.contaService.getContaById(
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
      const result = await this.contaService.updateContaById(
        paramId(req.params.id),
        this.userId(req),
        this.userRole(req),
        req.body as IParamsUpdateConta,
      );
      res.status(200).json(result);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res, req);
    }
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.contaService.deleteContaById(
        paramId(req.params.id),
        this.userId(req),
        this.userRole(req),
      );
      res.status(200).json(result);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res, req);
    }
  };

  liquidar = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.contaService.liquidarContaById(
        paramId(req.params.id),
        this.userId(req),
        this.userRole(req),
        req.body as IParamsLiquidarConta,
      );
      res.status(200).json(result);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res, req);
    }
  };
}
