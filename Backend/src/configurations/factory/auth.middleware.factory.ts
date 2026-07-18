import { createAuthMiddleware } from '../../application/middlewares/auth.middleware.js';
import { TokenService } from '../../infrastructure/security/token.service.js';
import { UserRepositoryRead } from '../../infrastructure/repository/user/user.repository.read.js';

let cachedAuthMiddleware: ReturnType<typeof createAuthMiddleware> | undefined;

export function getAuthMiddleware(): ReturnType<typeof createAuthMiddleware> {
  if (!cachedAuthMiddleware) {
    cachedAuthMiddleware = createAuthMiddleware(
      new TokenService(),
      new UserRepositoryRead(),
    );
  }
  return cachedAuthMiddleware;
}
