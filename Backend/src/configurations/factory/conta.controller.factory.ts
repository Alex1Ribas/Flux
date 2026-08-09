import { ContaController } from '../../application/controllers/conta.controller.js';
import { UserRepositoryRead } from '../../infrastructure/repository/user/user.repository.read.js';
import { TokenService } from '../../infrastructure/security/token.service.js';
import { createContaService } from './conta.service.factory.js';

export function createContaController(): ContaController {
  return new ContaController({
    contaService: createContaService(),
    tokenService: new TokenService(),
    userRepositoryRead: new UserRepositoryRead(),
  });
}
