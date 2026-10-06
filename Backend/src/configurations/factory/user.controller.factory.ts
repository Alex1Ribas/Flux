import { UserController } from '../../application/controllers/user.controller.js';
import { createRateLimitMiddleware } from '../../application/middlewares/rate-limit.middleware.js';
import { getAuthMiddleware } from './auth.middleware.factory.js';
import { createUserService } from './user.service.factory.js';

export function createUserController(): UserController {
  return new UserController({
    userService: createUserService(),
    authMiddleware: getAuthMiddleware(),
    rateLimitMiddleware: createRateLimitMiddleware(),
  });
}
