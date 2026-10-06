import { Router, type Request, type RequestHandler, type Response } from 'express';
import type { IController } from '../../domain/server/interfaces/IController.js';
import type { IParamsCreateUser } from '../../domain/user/entity/interfaces/user.interface.js';
import type {
  IParamsLoginUser,
  IUserService,
} from '../../domain/user/entity/interfaces/user.service.interface.js';
import { ErrorCatalog } from '../../infrastructure/i18n/error-catalog.js';
import { handleTranslatedError } from '../../infrastructure/i18n/handle-translated-error.js';

export interface IParamsUserController {
  userService: IUserService;
  authMiddleware: RequestHandler;
  rateLimitMiddleware: RequestHandler;
}

export class UserController implements IController {
  readonly router: Router;
  private readonly userService: IUserService;
  private readonly authMiddleware: RequestHandler;
  private readonly rateLimitMiddleware: RequestHandler;

  constructor({ userService, authMiddleware, rateLimitMiddleware }: IParamsUserController) {
    this.router = Router();
    this.userService = userService;
    this.authMiddleware = authMiddleware;
    this.rateLimitMiddleware = rateLimitMiddleware;
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.post('/users/register', this.rateLimitMiddleware, this.registerUser);
    this.router.post('/users/login', this.rateLimitMiddleware, this.loginUser);
    this.router.get('/users/me', this.authMiddleware, this.getCurrentUser);
  }

  registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const body = req.body as IParamsCreateUser;
      const params: IParamsCreateUser = {
        name: body.name,
        email: body.email,
        password: body.password,
        confPassword: body.confPassword,
      };
      const result = await this.userService.createUser(params);
      res.status(201).json(result);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res, req);
    }
  };

  loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const body = req.body as IParamsLoginUser;
      const params: IParamsLoginUser = { email: body.email, password: body.password };
      const result = await this.userService.loginUser(params);
      res.status(200).json(result);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res, req);
    }
  };

  getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.userService.getUserById(req.user?._id ?? '');
      res.status(200).json(result);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res, req);
    }
  };
}
