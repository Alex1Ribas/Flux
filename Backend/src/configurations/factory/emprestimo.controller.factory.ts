import { EmprestimoController } from '../../application/controllers/emprestimo.controller.js';
import { UserRepositoryRead } from '../../infrastructure/repository/user/user.repository.read.js';
import { TokenService } from '../../infrastructure/security/token.service.js';
import { createEmprestimoService } from './emprestimo.service.factory.js';

export function createEmprestimoController(): EmprestimoController {
  return new EmprestimoController({
    emprestimoService: createEmprestimoService(),
    tokenService: new TokenService(),
    userRepositoryRead: new UserRepositoryRead(),
  });
}
