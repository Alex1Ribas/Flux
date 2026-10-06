import { Router, type Request, type RequestHandler, type Response } from 'express';
import type {
  IParamsCreateExpenseInput,
  IParamsCreateIncomeSourceInput,
  IParamsGetPlanInput,
  IParamsSetExpenseMonthInput,
  IParamsUpdateExpenseInput,
  IParamsUpdateIncomeSourceInput,
  IParamsUpdatePlanningSettingsInput,
  IPlanningService,
} from '../../domain/planning/entity/interfaces/planning.service.interface.js';
import type { IController } from '../../domain/server/interfaces/IController.js';
import { ErrorCatalog } from '../../infrastructure/i18n/error-catalog.js';
import { handleTranslatedError } from '../../infrastructure/i18n/handle-translated-error.js';
import { paramId } from '../http/param-id.js';
import { requestUserId } from '../http/request-user.js';
import { validateObjectIdMiddleware } from '../middlewares/validate-object-id.middleware.js';

export interface IParamsPlanningController {
  planningService: IPlanningService;
  authMiddleware: RequestHandler;
}

function queryString(value: unknown): string | undefined {
  if (typeof value === 'number') {
    return String(value);
  }
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }
  return undefined;
}

export class PlanningController implements IController {
  readonly router: Router;
  private readonly planningService: IPlanningService;
  private readonly authMiddleware: RequestHandler;

  constructor({ planningService, authMiddleware }: IParamsPlanningController) {
    this.router = Router();
    this.planningService = planningService;
    this.authMiddleware = authMiddleware;
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.get('/planning', this.authMiddleware, this.getPlan);
    this.router.patch('/planning/settings', this.authMiddleware, this.updateSettings);
    this.router.post('/planning/income-sources', this.authMiddleware, this.createIncomeSource);
    this.router.patch(
      '/planning/income-sources/:id',
      this.authMiddleware,
      validateObjectIdMiddleware,
      this.updateIncomeSource,
    );
    this.router.post('/planning/expenses', this.authMiddleware, this.createExpense);
    this.router.patch(
      '/planning/expenses/:id',
      this.authMiddleware,
      validateObjectIdMiddleware,
      this.updateExpense,
    );
    this.router.put(
      '/planning/expenses/:id/months/:month',
      this.authMiddleware,
      validateObjectIdMiddleware,
      this.setExpenseMonth,
    );
  }

  getPlan = async (req: Request, res: Response): Promise<void> => {
    try {
      const months = queryString(req.query.months);
      const params: IParamsGetPlanInput = {
        from: queryString(req.query.from),
        months: months === undefined ? undefined : Number(months),
      };
      const result = await this.planningService.getPlan(requestUserId(req), params);
      res.status(200).json(result);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res, req);
    }
  };

  updateSettings = async (req: Request, res: Response): Promise<void> => {
    try {
      const body = req.body as IParamsUpdatePlanningSettingsInput;
      const params: IParamsUpdatePlanningSettingsInput = {
        reserveRate: body.reserveRate,
        initialReserve: body.initialReserve,
      };
      const result = await this.planningService.updateSettings(requestUserId(req), params);
      res.status(200).json(result);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res, req);
    }
  };

  createIncomeSource = async (req: Request, res: Response): Promise<void> => {
    try {
      const body = req.body as IParamsCreateIncomeSourceInput;
      const params: IParamsCreateIncomeSourceInput = {
        name: body.name,
        payDay: body.payDay,
        amount: body.amount,
      };
      const result = await this.planningService.createIncomeSource(requestUserId(req), params);
      res.status(201).json(result);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res, req);
    }
  };

  updateIncomeSource = async (req: Request, res: Response): Promise<void> => {
    try {
      const body = req.body as Omit<IParamsUpdateIncomeSourceInput, 'id'>;
      const params: IParamsUpdateIncomeSourceInput = {
        id: paramId(req.params.id),
        amount: body.amount,
      };
      const result = await this.planningService.updateIncomeSource(requestUserId(req), params);
      res.status(200).json(result);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res, req);
    }
  };

  createExpense = async (req: Request, res: Response): Promise<void> => {
    try {
      const body = req.body as IParamsCreateExpenseInput;
      const params: IParamsCreateExpenseInput = {
        name: body.name,
        amount: body.amount,
        dueDay: body.dueDay,
        dueNote: body.dueNote,
        sourceId: body.sourceId,
        startMonth: body.startMonth,
        installments: body.installments,
      };
      await this.planningService.createExpense(requestUserId(req), params);
      res.status(201).end();
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res, req);
    }
  };

  updateExpense = async (req: Request, res: Response): Promise<void> => {
    try {
      const body = req.body as Omit<IParamsUpdateExpenseInput, 'id'>;
      const params: IParamsUpdateExpenseInput = {
        id: paramId(req.params.id),
        name: body.name,
        amount: body.amount,
        dueDay: body.dueDay,
        dueNote: body.dueNote,
        sourceId: body.sourceId,
        endMonth: body.endMonth,
      };
      await this.planningService.updateExpense(requestUserId(req), params);
      res.status(204).end();
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res, req);
    }
  };

  setExpenseMonth = async (req: Request, res: Response): Promise<void> => {
    try {
      const body = req.body as Omit<IParamsSetExpenseMonthInput, 'id' | 'month'>;
      const params: IParamsSetExpenseMonthInput = {
        id: paramId(req.params.id),
        month: paramId(req.params.month),
        amount: body.amount,
        sourceId: body.sourceId,
      };
      await this.planningService.setExpenseMonth(requestUserId(req), params);
      res.status(204).end();
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res, req);
    }
  };
}
