import { Router, type Request, type Response } from 'express';
import { IController } from '../../domain/server/interfaces/IController.js';
import { EUserRole } from '../../domain/user/entity/interfaces/user.interface.js';
import type { IParamsCreateUser } from '../../domain/user/entity/interfaces/user.interface.js';
import type {
  IParamsCreateDependente,
  IParamsLoginUser,
  IParamsUpdateUser,
  IUserService,
} from '../../domain/user/entity/interfaces/user.service.interface.js';
import { ErrorCatalog } from '../../infrastructure/i18n/error-catalog.js';
import { handleTranslatedError } from '../../infrastructure/i18n/handle-translated-error.js';
import {
  createAuthMiddleware,
  requireRole,
} from '../middlewares/auth.middleware.js';
import { validateObjectIdMiddleware } from '../middlewares/validate-object-id.middleware.js';
import { paramId } from '../http/param-id.js';
import type { IUserRepositoryRead } from '../../domain/user/repository/user.repository.read.js';
import { TokenService } from '../../infrastructure/security/token.service.js';

export interface IParamsUserController {
  userService: IUserService;
  tokenService: TokenService;
  userRepositoryRead: IUserRepositoryRead;
}

export class UserController implements IController {
  readonly router: Router;
  private readonly userService: IUserService;
  private readonly authMiddleware: ReturnType<typeof createAuthMiddleware>;

  constructor({
    userService,
    tokenService,
    userRepositoryRead,
  }: IParamsUserController) {
    this.router = Router();
    this.userService = userService;
    this.authMiddleware = createAuthMiddleware(
      tokenService,
      userRepositoryRead,
    );
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.post('/users/register', this.register);
    this.router.post('/users/login', this.login);
    this.router.post(
      '/users',
      this.authMiddleware,
      requireRole(EUserRole.USER),
      this.createDependente,
    );
    this.router.get(
      '/users',
      this.authMiddleware,
      requireRole(EUserRole.USER),
      this.list,
    );
    this.router.get(
      '/users/:id',
      this.authMiddleware,
      validateObjectIdMiddleware,
      this.search,
    );
    this.router.put(
      '/users/:id',
      this.authMiddleware,
      validateObjectIdMiddleware,
      requireRole(EUserRole.USER),
      this.update,
    );
    this.router.delete(
      '/users/:id',
      this.authMiddleware,
      validateObjectIdMiddleware,
      requireRole(EUserRole.USER),
      this.remove,
    );
  }

  private userId(req: Request): string {
    return req.user?._id ?? '';
  }

  private userRole(req: Request): EUserRole {
    return req.user?.role ?? EUserRole.DEPENDENT;
  }

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.userService.createUser(
        req.body as IParamsCreateUser,
      );
      res.status(201).json(result);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res, req);
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.userService.loginUser(
        req.body as IParamsLoginUser,
      );
      res.status(200).json(result);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res, req);
    }
  };

  createDependente = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.userService.createDependente(
        req.body as IParamsCreateDependente,
      );
      res.status(201).json(result);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res, req);
    }
  };

  list = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.userService.listUsers();
      res.status(200).json(users);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res, req);
    }
  };

  search = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.userService.getUserById(
        paramId(req.params.id),
        this.userId(req),
        this.userRole(req),
      );
      res.status(200).json(user);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res, req);
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.userService.updateUserById(
        paramId(req.params.id),
        req.body as IParamsUpdateUser,
      );
      res.status(200).json(result);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res, req);
    }
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.userService.deleteUserById(
        paramId(req.params.id),
      );
      res.status(200).json(result);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res, req);
    }
  };
}
