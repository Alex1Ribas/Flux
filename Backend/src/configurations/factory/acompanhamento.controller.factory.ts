import { AcompanhamentoController } from '../../application/controllers/acompanhamento.controller.js';
import { UserRepositoryRead } from '../../infrastructure/repository/user/user.repository.read.js';
import { TokenService } from '../../infrastructure/security/token.service.js';
import { createAcompanhamentoService } from './acompanhamento.service.factory.js';

export function createAcompanhamentoController(): AcompanhamentoController {
  return new AcompanhamentoController({
    acompanhamentoService: createAcompanhamentoService(),
    tokenService: new TokenService(),
    userRepositoryRead: new UserRepositoryRead(),
  });
}
