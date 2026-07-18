import { UserController } from '../../application/controllers/user.controller.js';
import { TokenService } from '../../infrastructure/security/token.service.js';
import { UserRepositoryRead } from '../../infrastructure/repository/user/user.repository.read.js';
import { createUserService } from './user.service.factory.js';

export function createUserController(): UserController {
  return new UserController({
    userService: createUserService(),
    tokenService: new TokenService(),
    userRepositoryRead: new UserRepositoryRead(),
  });
}
