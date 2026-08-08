import { Router, type Request, type Response } from 'express';
import type { IPreferenciasService } from '../../domain/preferencias/entity/interfaces/preferencias.service.interface.js';
import type { IParamsUpdatePreferencias } from '../../domain/preferencias/entity/interfaces/preferencias.interface.js';
import type { IController } from '../../domain/server/interfaces/IController.js';
import type { IUserRepositoryRead } from '../../domain/user/repository/user.repository.read.js';
import { ErrorCatalog } from '../../infrastructure/i18n/error-catalog.js';
import { handleTranslatedError } from '../../infrastructure/i18n/handle-translated-error.js';
import { TokenService } from '../../infrastructure/security/token.service.js';
import { createAuthMiddleware } from '../middlewares/auth.middleware.js';

export interface IParamsPreferenciasController {
  preferenciasService: IPreferenciasService;
  tokenService: TokenService;
  userRepositoryRead: IUserRepositoryRead;
}

export class PreferenciasController implements IController {
  readonly router: Router;
  private readonly preferenciasService: IPreferenciasService;
  private readonly authMiddleware: ReturnType<typeof createAuthMiddleware>;

  constructor({
    preferenciasService,
    tokenService,
    userRepositoryRead,
  }: IParamsPreferenciasController) {
    this.router = Router();
    this.preferenciasService = preferenciasService;
    this.authMiddleware = createAuthMiddleware(tokenService, userRepositoryRead);
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.get('/preferencias', this.authMiddleware, this.get);
    this.router.put('/preferencias', this.authMiddleware, this.update);
    this.router.get('/categorias', this.authMiddleware, this.buscarCategorias);
    this.router.post('/categorias', this.authMiddleware, this.adicionarCategoria);
  }

  private userId(req: Request): string {
    return req.user?._id ?? '';
  }

  get = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.preferenciasService.getPreferencias(this.userId(req));
      res.status(200).json(result);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res, req);
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.preferenciasService.updatePreferencias(
        this.userId(req),
        req.body as IParamsUpdatePreferencias,
      );
      res.status(200).json(result);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res, req);
    }
  };

  buscarCategorias = async (req: Request, res: Response): Promise<void> => {
    try {
      const tipoQuery = typeof req.query.tipo === 'string' ? req.query.tipo : '';
      const tipo = tipoQuery === 'entrada' || tipoQuery === 'saida' ? tipoQuery : null;
      if (!tipo) {
        res.status(400).json({ message: 'Parâmetro tipo deve ser entrada ou saida' });
        return;
      }

      const result = await this.preferenciasService.buscarCategorias(this.userId(req), {
        tipo,
        q: typeof req.query.q === 'string' ? req.query.q : undefined,
      });
      res.status(200).json(result);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res, req);
    }
  };

  adicionarCategoria = async (req: Request, res: Response): Promise<void> => {
    try {
      const body = req.body as { tipo?: unknown; categoria?: unknown };
      const tipo =
        body.tipo === 'entrada' || body.tipo === 'saida' ? body.tipo : null;
      const categoria = typeof body.categoria === 'string' ? body.categoria.trim() : '';

      if (!tipo) {
        res.status(400).json({ message: 'Parâmetro tipo deve ser entrada ou saida' });
        return;
      }
      if (!categoria) {
        res.status(400).json({ message: 'Categoria é obrigatória' });
        return;
      }

      await this.preferenciasService.garantirCategoria(this.userId(req), tipo, categoria);
      res.status(201).json({ tipo, categoria });
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res, req);
    }
  };
}
