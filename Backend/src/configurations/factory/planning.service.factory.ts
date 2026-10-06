import { PlanningService } from '../../domain/planning/service/planning.service.js';
import { PlanningRepositoryRead } from '../../infrastructure/repository/planning/planning.repository.read.js';
import { PlanningRepositoryWrite } from '../../infrastructure/repository/planning/planning.repository.write.js';

export function createPlanningService(): PlanningService {
  return new PlanningService({
    planningRepositoryRead: new PlanningRepositoryRead(),
    planningRepositoryWrite: new PlanningRepositoryWrite(),
  });
}
