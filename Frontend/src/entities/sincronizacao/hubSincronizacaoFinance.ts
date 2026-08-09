import {
  carregarDadosFinanceApi,
  type OpcoesCarregarDadosFinance,
} from "./carregarDadosFinanceApi";

export const TTL_SYNC_MS = 60_000;

type DadosFinance = Awaited<ReturnType<typeof carregarDadosFinanceApi>>;

type CacheSync = {
  token: string;
  carregadoEm: number;
  dados: DadosFinance;
};

let cache: CacheSync | null = null;
let inflight: Promise<DadosFinance> | null = null;
let inflightToken: string | null = null;

export type OpcoesSincronizacaoFinance = OpcoesCarregarDadosFinance & {
  force?: boolean;
};

export function invalidarCacheSincronizacaoFinance() {
  cache = null;
}

export function cacheSincronizacaoExpirado(token: string, ttlMs = TTL_SYNC_MS): boolean {
  if (!cache || cache.token !== token) return true;
  return Date.now() - cache.carregadoEm >= ttlMs;
}

export async function sincronizarDadosFinance(
  token: string,
  opcoes: OpcoesSincronizacaoFinance = {}
): Promise<DadosFinance> {
  const agora = Date.now();
  const cacheValido =
    !opcoes.force &&
    !opcoes.materializarRecorrentes &&
    cache &&
    cache.token === token &&
    agora - cache.carregadoEm < TTL_SYNC_MS;

  if (cacheValido && cache) {
    return cache.dados;
  }

  if (inflight && inflightToken === token && !opcoes.force && !opcoes.materializarRecorrentes) {
    return inflight;
  }

  const request = carregarDadosFinanceApi(token, {
    materializarRecorrentes: opcoes.materializarRecorrentes,
  })
    .then((dados) => {
      cache = { token, carregadoEm: Date.now(), dados };
      return dados;
    })
    .finally(() => {
      if (inflight === request) {
        inflight = null;
        inflightToken = null;
      }
    });

  inflight = request;
  inflightToken = token;
  return request;
}
