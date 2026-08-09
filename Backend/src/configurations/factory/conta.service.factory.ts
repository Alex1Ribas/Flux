import { ContaService } from '../../domain/conta/service/conta.service.js';
import { CaixaRepositoryRead } from '../../infrastructure/repository/caixa/caixa.repository.read.js';
import { ContaRepositoryRead } from '../../infrastructure/repository/conta/conta.repository.read.js';
import { ContaRepositoryWrite } from '../../infrastructure/repository/conta/conta.repository.write.js';
import { LancamentoRepositoryRead } from '../../infrastructure/repository/lancamento/lancamento.repository.read.js';
import { createLancamentoService } from './lancamento.service.factory.js';

export function createContaService(): ContaService {
  return new ContaService({
    contaRepositoryRead: new ContaRepositoryRead(),
    contaRepositoryWrite: new ContaRepositoryWrite(),
    caixaRepositoryRead: new CaixaRepositoryRead(),
    lancamentoService: createLancamentoService(),
    lancamentoRepositoryRead: new LancamentoRepositoryRead(),
  });
}
