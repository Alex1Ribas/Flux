import { PlanningController } from '../../application/controllers/planning.controller.js';
import { getAuthMiddleware } from './auth.middleware.factory.js';
import { createPlanningService } from './planning.service.factory.js';

export function createPlanningController(): PlanningController {
  return new PlanningController({
    planningService: createPlanningService(),
    authMiddleware: getAuthMiddleware(),
  });
}
