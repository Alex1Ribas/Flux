import { PreferenciasService } from '../../domain/preferencias/service/preferencias.service.js';
import { LancamentoRepositoryRead } from '../../infrastructure/repository/lancamento/lancamento.repository.read.js';
import {
  PreferenciasRepositoryRead,
  PreferenciasRepositoryWrite,
} from '../../infrastructure/repository/preferencias/preferencias.repository.js';

export function createPreferenciasService(): PreferenciasService {
  return new PreferenciasService({
    preferenciasRepositoryRead: new PreferenciasRepositoryRead(),
    preferenciasRepositoryWrite: new PreferenciasRepositoryWrite(),
    lancamentoRepositoryRead: new LancamentoRepositoryRead(),
  });
}
