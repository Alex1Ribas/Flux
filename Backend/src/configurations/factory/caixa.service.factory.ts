import { CaixaService } from '../../domain/caixa/service/caixa.service.js';
import { CaixaRepositoryRead } from '../../infrastructure/repository/caixa/caixa.repository.read.js';
import { CaixaRepositoryWrite } from '../../infrastructure/repository/caixa/caixa.repository.write.js';

export function createCaixaService(): CaixaService {
  return new CaixaService({
    caixaRepositoryRead: new CaixaRepositoryRead(),
    caixaRepositoryWrite: new CaixaRepositoryWrite(),
  });
}
