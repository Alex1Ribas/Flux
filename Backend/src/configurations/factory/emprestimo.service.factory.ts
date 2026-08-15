import { EmprestimoService } from '../../domain/emprestimo/service/emprestimo.service.js';
import { CaixaRepositoryRead } from '../../infrastructure/repository/caixa/caixa.repository.read.js';
import { createContaService } from './conta.service.factory.js';
import { createLancamentoService } from './lancamento.service.factory.js';

export function createEmprestimoService(): EmprestimoService {
  return new EmprestimoService({
    lancamentoService: createLancamentoService(),
    contaService: createContaService(),
    caixaRepositoryRead: new CaixaRepositoryRead(),
  });
}
