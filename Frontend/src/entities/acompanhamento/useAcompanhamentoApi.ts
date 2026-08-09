import { useCallback, useEffect, useRef, useState } from "react";

import { acompanhamentoApi } from "@/api";
import { useAuth } from "@/entities/auth";
import { TTL_SYNC_MS } from "@/entities/sincronizacao";
import { LIMITES_RISCO_PADRAO } from "@/shared/limitesRisco";
import type { AcompanhamentoMes } from "@/types/flux";
import { getMesAtual } from "@/utils/helpers";

const ACOMPANHAMENTO_VAZIO: AcompanhamentoMes = {
  competencia: getMesAtual(),
  risco: { entradaPrevista: 0, comprometido: 0, risco: 0 },
  riscoReal: { entradaPrevista: 0, comprometido: 0, risco: 0 },
  diferencial: 0,
  diferencialValor: 0,
  status: "saudavel",
  dentroPlanejado: true,
  limites: LIMITES_RISCO_PADRAO,
  evolucao: [],
  compromissos: [],
  composicao: [],
  impactos: [],
};

type CacheAcompanhamento = {
  competencia: string;
  carregadoEm: number;
  dados: AcompanhamentoMes;
};

export function useAcompanhamentoApi(competencia: string) {
  const { sessao } = useAuth();
  const token = sessao?.token;
  const cacheRef = useRef<CacheAcompanhamento | null>(null);
  const inflightRef = useRef<Promise<AcompanhamentoMes> | null>(null);

  const [dados, setDados] = useState<AcompanhamentoMes>({
    ...ACOMPANHAMENTO_VAZIO,
    competencia,
  });
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const buscar = useCallback(
    async (opcoes: { force?: boolean; silencioso?: boolean } = {}) => {
      if (!token) {
        setDados({ ...ACOMPANHAMENTO_VAZIO, competencia });
        setCarregando(false);
        setAtualizando(false);
        setErro(null);
        return;
      }

      const cache = cacheRef.current;
      const cacheValido =
        !opcoes.force &&
        cache &&
        cache.competencia === competencia &&
        Date.now() - cache.carregadoEm < TTL_SYNC_MS;

      if (cacheValido && cache) {
        setDados(cache.dados);
        setCarregando(false);
        setErro(null);
        return;
      }

      if (inflightRef.current && !opcoes.force) {
        try {
          const resposta = await inflightRef.current;
          setDados(resposta);
          setErro(null);
        } catch {
          setErro("Não foi possível carregar o acompanhamento.");
        } finally {
          setCarregando(false);
          setAtualizando(false);
        }
        return;
      }

      if (opcoes.silencioso) {
        setAtualizando(true);
      } else {
        setCarregando(true);
      }
      setErro(null);

      const request = acompanhamentoApi.obter(token, competencia);
      inflightRef.current = request;

      try {
        const resposta = await request;
        cacheRef.current = {
          competencia,
          carregadoEm: Date.now(),
          dados: resposta,
        };
        setDados(resposta);
        setErro(null);
      } catch {
        setErro("Não foi possível carregar o acompanhamento.");
        if (!cacheRef.current || cacheRef.current.competencia !== competencia) {
          setDados({ ...ACOMPANHAMENTO_VAZIO, competencia });
        }
      } finally {
        if (inflightRef.current === request) {
          inflightRef.current = null;
        }
        setCarregando(false);
        setAtualizando(false);
      }
    },
    [token, competencia]
  );

  useEffect(() => {
    void buscar({ force: false });
  }, [buscar]);

  const recarregar = useCallback(() => {
    void buscar({ force: true, silencioso: true });
  }, [buscar]);

  return {
    dados,
    carregando,
    atualizando,
    erro,
    recarregar,
  };
}
