import { AcompanhamentoService } from '../../domain/acompanhamento/service/acompanhamento.service.js';
import { CaixaRepositoryRead } from '../../infrastructure/repository/caixa/caixa.repository.read.js';
import { LancamentoRepositoryRead } from '../../infrastructure/repository/lancamento/lancamento.repository.read.js';
import { OrcamentoRepositoryRead } from '../../infrastructure/repository/orcamento/orcamento.repository.read.js';
import { createContaService } from './conta.service.factory.js';
import { createPreferenciasService } from './preferencias.service.factory.js';

export function createAcompanhamentoService(): AcompanhamentoService {
  return new AcompanhamentoService({
    lancamentoRepositoryRead: new LancamentoRepositoryRead(),
    contaService: createContaService(),
    preferenciasService: createPreferenciasService(),
    caixaRepositoryRead: new CaixaRepositoryRead(),
    orcamentoRepositoryRead: new OrcamentoRepositoryRead(),
  });
}
