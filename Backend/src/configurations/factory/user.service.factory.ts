import { UserService } from '../../domain/user/service/user.service.js';
import { UserRepositoryRead } from '../../infrastructure/repository/user/user.repository.read.js';
import { UserRepositoryWrite } from '../../infrastructure/repository/user/user.repository.write.js';
import { HashService } from '../../infrastructure/security/hash.service.js';
import { TokenService } from '../../infrastructure/security/token.service.js';
import { UserCredentialsService } from '../../infrastructure/security/user-credentials.service.js';

export function createUserService(): UserService {
  return new UserService({
    userRepositoryRead: new UserRepositoryRead(),
    userRepositoryWrite: new UserRepositoryWrite(),
    hashService: new HashService(),
    tokenService: new TokenService(),
    userCredentialsPort: new UserCredentialsService(),
  });
}
