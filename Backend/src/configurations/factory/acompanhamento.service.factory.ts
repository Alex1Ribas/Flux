import { AcompanhamentoService } from '../../domain/acompanhamento/service/acompanhamento.service.js';
import { LancamentoRepositoryRead } from '../../infrastructure/repository/lancamento/lancamento.repository.read.js';
import { createContaService } from './conta.service.factory.js';

export function createAcompanhamentoService(): AcompanhamentoService {
  return new AcompanhamentoService({
    lancamentoRepositoryRead: new LancamentoRepositoryRead(),
    contaService: createContaService(),
  });
}
