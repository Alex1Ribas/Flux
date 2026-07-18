import { OrcamentoController } from '../../application/controllers/orcamento.controller.js';
import { UserRepositoryRead } from '../../infrastructure/repository/user/user.repository.read.js';
import { TokenService } from '../../infrastructure/security/token.service.js';
import { createOrcamentoService } from './orcamento.service.factory.js';

export function createOrcamentoController(): OrcamentoController {
  return new OrcamentoController({
    orcamentoService: createOrcamentoService(),
    tokenService: new TokenService(),
    userRepositoryRead: new UserRepositoryRead(),
  });
}
