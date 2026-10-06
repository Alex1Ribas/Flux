import { Router, type Request, type RequestHandler, type Response } from 'express';
import type {
  IDecisionService,
  IParamsSimulateDecisionInput,
} from '../../domain/decision/entity/interfaces/decision.service.interface.js';
import type { IController } from '../../domain/server/interfaces/IController.js';
import { ErrorCatalog } from '../../infrastructure/i18n/error-catalog.js';
import { handleTranslatedError } from '../../infrastructure/i18n/handle-translated-error.js';
import { requestUserId } from '../http/request-user.js';

export interface IParamsDecisionController {
  decisionService: IDecisionService;
  authMiddleware: RequestHandler;
}

export class DecisionController implements IController {
  readonly router: Router;
  private readonly decisionService: IDecisionService;
  private readonly authMiddleware: RequestHandler;

  constructor({ decisionService, authMiddleware }: IParamsDecisionController) {
    this.router = Router();
    this.decisionService = decisionService;
    this.authMiddleware = authMiddleware;
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.post('/decisions/simulate', this.authMiddleware, this.simulateDecision);
  }

  simulateDecision = async (req: Request, res: Response): Promise<void> => {
    try {
      const body = req.body as IParamsSimulateDecisionInput;
      const params: IParamsSimulateDecisionInput = {
        mode: body.mode,
        day: body.day,
        available: body.available,
        expense: body.expense,
        description: body.description,
        rent: body.rent,
        otherExpenses: body.otherExpenses,
        total: body.total,
        installments: body.installments,
        value: body.value,
      };
      const result = await this.decisionService.simulateDecision(requestUserId(req), params);
      res.status(200).json(result);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res, req);
    }
  };
}
