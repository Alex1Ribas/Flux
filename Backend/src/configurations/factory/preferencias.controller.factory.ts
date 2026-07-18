import { PreferenciasController } from '../../application/controllers/preferencias.controller.js';
import { UserRepositoryRead } from '../../infrastructure/repository/user/user.repository.read.js';
import { TokenService } from '../../infrastructure/security/token.service.js';
import { createPreferenciasService } from './preferencias.service.factory.js';

export function createPreferenciasController(): PreferenciasController {
  return new PreferenciasController({
    preferenciasService: createPreferenciasService(),
    tokenService: new TokenService(),
    userRepositoryRead: new UserRepositoryRead(),
  });
}
