import { carregarDadosFinanceApi } from "./carregarDadosFinanceApi";

const TTL_MS = 60_000;

type DadosFinance = Awaited<ReturnType<typeof carregarDadosFinanceApi>>;

type CacheSync = {
  token: string;
  carregadoEm: number;
  dados: DadosFinance;
};

let cache: CacheSync | null = null;
let inflight: Promise<DadosFinance> | null = null;
let inflightToken: string | null = null;

export type OpcoesSincronizacaoFinance = {
  force?: boolean;
};

export function invalidarCacheSincronizacaoFinance() {
  cache = null;
}

export async function sincronizarDadosFinance(
  token: string,
  opcoes: OpcoesSincronizacaoFinance = {}
): Promise<DadosFinance> {
  const agora = Date.now();
  const cacheValido =
    !opcoes.force &&
    cache &&
    cache.token === token &&
    agora - cache.carregadoEm < TTL_MS;

  if (cacheValido && cache) {
    return cache.dados;
  }

  if (inflight && inflightToken === token && !opcoes.force) {
    return inflight;
  }

  const request = carregarDadosFinanceApi(token)
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
