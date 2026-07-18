import { OrcamentoService } from '../../domain/orcamento/service/orcamento.service.js';
import { OrcamentoRepositoryRead } from '../../infrastructure/repository/orcamento/orcamento.repository.read.js';
import { OrcamentoRepositoryWrite } from '../../infrastructure/repository/orcamento/orcamento.repository.write.js';

export function createOrcamentoService(): OrcamentoService {
  return new OrcamentoService({
    orcamentoRepositoryRead: new OrcamentoRepositoryRead(),
    orcamentoRepositoryWrite: new OrcamentoRepositoryWrite(),
  });
}
