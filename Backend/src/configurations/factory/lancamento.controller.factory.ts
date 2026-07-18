import { LancamentoController } from '../../application/controllers/lancamento.controller.js';
import { UserRepositoryRead } from '../../infrastructure/repository/user/user.repository.read.js';
import { TokenService } from '../../infrastructure/security/token.service.js';
import { createLancamentoService } from './lancamento.service.factory.js';

export function createLancamentoController(): LancamentoController {
  return new LancamentoController({
    lancamentoService: createLancamentoService(),
    tokenService: new TokenService(),
    userRepositoryRead: new UserRepositoryRead(),
  });
}
