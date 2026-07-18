import { CaixaController } from '../../application/controllers/caixa.controller.js';
import { UserRepositoryRead } from '../../infrastructure/repository/user/user.repository.read.js';
import { TokenService } from '../../infrastructure/security/token.service.js';
import { createCaixaService } from './caixa.service.factory.js';

export function createCaixaController(): CaixaController {
  return new CaixaController({
    caixaService: createCaixaService(),
    tokenService: new TokenService(),
    userRepositoryRead: new UserRepositoryRead(),
  });
}
