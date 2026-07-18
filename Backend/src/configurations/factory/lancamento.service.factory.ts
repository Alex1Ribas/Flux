import { LancamentoService } from '../../domain/lancamento/service/lancamento.service.js';
import { CaixaRepositoryRead } from '../../infrastructure/repository/caixa/caixa.repository.read.js';
import { CaixaRepositoryWrite } from '../../infrastructure/repository/caixa/caixa.repository.write.js';
import { LancamentoRepositoryRead } from '../../infrastructure/repository/lancamento/lancamento.repository.read.js';
import { LancamentoRepositoryWrite } from '../../infrastructure/repository/lancamento/lancamento.repository.write.js';
import { OrcamentoRepositoryRead } from '../../infrastructure/repository/orcamento/orcamento.repository.read.js';
import { createPreferenciasService } from './preferencias.service.factory.js';

export function createLancamentoService(): LancamentoService {
  return new LancamentoService({
    lancamentoRepositoryRead: new LancamentoRepositoryRead(),
    lancamentoRepositoryWrite: new LancamentoRepositoryWrite(),
    caixaRepositoryRead: new CaixaRepositoryRead(),
    caixaRepositoryWrite: new CaixaRepositoryWrite(),
    orcamentoRepositoryRead: new OrcamentoRepositoryRead(),
    preferenciasService: createPreferenciasService(),
  });
}
