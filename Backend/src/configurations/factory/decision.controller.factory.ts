import { DecisionController } from '../../application/controllers/decision.controller.js';
import { getAuthMiddleware } from './auth.middleware.factory.js';
import { createDecisionService } from './decision.service.factory.js';

export function createDecisionController(): DecisionController {
  return new DecisionController({
    decisionService: createDecisionService(),
    authMiddleware: getAuthMiddleware(),
  });
}
