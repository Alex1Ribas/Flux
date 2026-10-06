import { DecisionService } from '../../domain/decision/service/decision.service.js';
import { createPlanningService } from './planning.service.factory.js';

export function createDecisionService(): DecisionService {
  return new DecisionService({ planningService: createPlanningService() });
}
